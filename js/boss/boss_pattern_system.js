// boss_pattern_system.js
// 보스 패턴 몬스터 판별, 런타임 생성, 쿨타임, 패턴 선택/시작/종료,
// Boss_Pattern_Action_info의 액션 순차 실행을 담당한다.
//
// 기존 MonsterManager 메서드와 호환되도록, 각 함수는 MonsterManager를 this로 받아 실행된다.

const BossPatternSystem = {
    isBossPatternData: function(d) {
        const aiType = String(d && d.aiType || '').trim().toUpperCase();
        return !!d && (aiType === 'BOSS_PATTERN' || aiType === 'BOSS_PATTERN_BASIC');
    },

    isBossPatternMonster: function(m) {
        return !!(m && m.boss && (this.isBossPatternData(m.d) || m.p3m3ManualBossRuntime));
    },

    isBossPatternRepeatAllowed: function(pattern) {
        const raw = pattern ? pattern.Pattern_Repeat : undefined;
        if (raw === undefined || raw === null || String(raw).trim() === '') return true;
        if (raw === false) return false;
        if (raw === true) return true;
        const s = String(raw).trim().toUpperCase();
        return !(s === 'FALSE' || s === '0' || s === 'NO' || s === 'N');
    },


    getPatternLoopCount: function(pattern, boss) {
        const lateValue = parseInt(pattern.Late_Phase_Action_Sequence_Loop_Count);
        const normalValue = parseInt(pattern.Action_Sequence_Loop_Count);
        if (boss && boss.isLatePhase && !isNaN(lateValue) && lateValue > 0) return lateValue;
        if (!isNaN(normalValue) && normalValue > 0) return normalValue;
        return 1;
    },


    getBossPatternCooldown: function(pattern, boss) {
        const normalRaw = pattern ? pattern.Pattern_Cooldown : undefined;
        const lateRaw = pattern ? pattern.Late_Phase_Pattern_Cooldown : undefined;
        const hasLateValue = lateRaw !== undefined && lateRaw !== null && String(lateRaw).trim() !== '';
        const normalValue = parseFloat(normalRaw);
        const lateValue = parseFloat(lateRaw);

        if (boss && boss.isLatePhase && hasLateValue && Number.isFinite(lateValue)) {
            return Math.max(0, lateValue);
        }
        if (Number.isFinite(normalValue)) return Math.max(0, normalValue);
        return 1;
    },


    getBossPatternActionSourceId: function(pattern) {
        return String(pattern && (pattern.Runtime_Action_Source_ID || pattern.Pattern_Action_Source_ID || pattern.Pattern_ID) || '').trim();
    },

    // 후반부 개시 패턴이 종료되면, 해당 패턴을 Action Source로 공유하는
    // 일반 사이클용 후반부 대형 패턴의 쿨타임을 그 시점부터 시작한다.
    // 예) 231008 -> 231009, 232008 -> 232009
    // 특정 ID를 하드코딩하지 않고 Pattern_Action_Source_ID 관계를 사용한다.
    applyLinkedPatternCooldownsAfterSourceEnd: function(m, sourcePatternOrId, gameState) {
        const boss = m && m.boss;
        if (!boss || !gameState || !gameState.DB_BOSS_PATTERN) return [];

        const sourcePatternId = String(
            sourcePatternOrId && typeof sourcePatternOrId === 'object'
                ? sourcePatternOrId.Pattern_ID
                : sourcePatternOrId || ''
        ).trim();
        if (!sourcePatternId) return [];

        const patterns = Array.isArray(gameState.DB_BOSS_PATTERN)
            ? gameState.DB_BOSS_PATTERN
            : Object.values(gameState.DB_BOSS_PATTERN);
        const applied = [];

        for (const linkedPattern of patterns) {
            if (!linkedPattern) continue;
            const linkedPatternId = String(linkedPattern.Pattern_ID || '').trim();
            if (!linkedPatternId || linkedPatternId === sourcePatternId) continue;

            const condType = String(linkedPattern.Pattern_Cond_Type || '').trim().toUpperCase();
            if (condType !== 'LATE_PHASE_MAJOR_PATTERN') continue;

            const actionSourceId = this.getBossPatternActionSourceId(linkedPattern);
            if (actionSourceId !== sourcePatternId) continue;

            const linkedCooldown = this.getBossPatternCooldown(linkedPattern, boss);
            boss.patternCooldowns = boss.patternCooldowns || {};
            const currentCooldown = Math.max(0, parseFloat(boss.patternCooldowns[linkedPatternId]) || 0);
            boss.patternCooldowns[linkedPatternId] = Math.max(currentCooldown, linkedCooldown);

            applied.push({
                patternId: linkedPatternId,
                pattern: linkedPattern,
                cooldown: boss.patternCooldowns[linkedPatternId]
            });

            if (typeof this.pushBossDebugLog === 'function') {
                this.pushBossDebugLog(
                    gameState,
                    'LINK_CD',
                    `${sourcePatternId} -> ${linkedPatternId} ${this.getBossDebugName ? this.getBossDebugName(linkedPattern) : ''}`.trim(),
                    `cooldown ${boss.patternCooldowns[linkedPatternId].toFixed(1)}s`
                );
            }
        }

        return applied;
    },

    isKasiyasMajorPattern3Pattern: function(pattern) {
        const patternId = String(pattern && pattern.Pattern_ID || '').trim();
        const sourceId = this.getBossPatternActionSourceId(pattern);
        return patternId === '231008' || patternId === '231009' || sourceId === '231008';
    },

    shuffleBossActionGroupList: function(list) {
        const arr = Array.isArray(list) ? [...list] : [];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    },

    buildBossPatternRuntimeActions: function(pattern, gameState, boss = null) {
        const rawActions = Array.isArray(pattern && pattern.Runtime_Actions) ? pattern.Runtime_Actions : [];
        const hasOrderValue = (action, field) => {
            const raw = action && action[field];
            if (raw === undefined || raw === null) return false;
            if (String(raw).trim() === '') return false;
            const n = parseFloat(raw);
            return Number.isFinite(n) && n > 0;
        };
        const lateMode = !!(boss && boss.isLatePhase && rawActions.some(action => hasOrderValue(action, 'Late_Phase_Action_Order')));
        const orderField = lateMode ? 'Late_Phase_Action_Order' : 'Action_Order';
        const sourceActions = rawActions
            .filter(action => hasOrderValue(action, orderField))
            .slice()
            .sort((a, b) => (parseFloat(a[orderField]) || 0) - (parseFloat(b[orderField]) || 0));
        const getRuntimeOrder = (action) => parseFloat(action && action[orderField]) || 0;
        const result = [];
        const usedRandomOrders = new Set();

        for (const action of sourceActions) {
            const randomOrder = String(action && action.Random_Action_Order != null ? action.Random_Action_Order : '').trim();
            if (!randomOrder || randomOrder === '0') {
                result.push(action);
                continue;
            }
            if (usedRandomOrders.has(randomOrder)) continue;
            usedRandomOrders.add(randomOrder);

            const groupRows = sourceActions.filter(a => String(a && a.Random_Action_Order != null ? a.Random_Action_Order : '').trim() === randomOrder);
            const byGroup = new Map();
            groupRows.forEach(row => {
                const groupKey = String(row.Random_Action_Group || row.Random_Action_Set_ID || row.Action_ID || '').trim() || `ACTION_${result.length}_${byGroup.size}`;
                if (!byGroup.has(groupKey)) byGroup.set(groupKey, []);
                byGroup.get(groupKey).push(row);
            });

            const groups = Array.from(byGroup.entries()).map(([key, rows]) => {
                const sortedRows = rows.slice().sort((a, b) => {
                    const ag = parseFloat(a.Random_Action_Group_Order);
                    const bg = parseFloat(b.Random_Action_Group_Order);
                    if (!isNaN(ag) || !isNaN(bg)) return (isNaN(ag) ? 9999 : ag) - (isNaN(bg) ? 9999 : bg);
                    return getRuntimeOrder(a) - getRuntimeOrder(b);
                });
                const minOrder = sortedRows.reduce((v, row) => Math.min(v, getRuntimeOrder(row) || 999999), 999999);
                return { key, rows: sortedRows, minOrder };
            }).sort((a, b) => a.minOrder - b.minOrder);

            const patternIdForRandom = String(pattern && pattern.Pattern_ID || '').trim();
            const isP2M2FinalPortalBranch = patternIdForRandom === '232007' && String(randomOrder) === '2';
            let shuffled;
            if (isP2M2FinalPortalBranch && groups.length > 1) {
                // 2페이즈 대형 패턴 2번 최종 구간은 좌/우 포탈 세트 중 하나만 선택해야 한다.
                // 기존 Random_Action_Order 방식처럼 모든 그룹을 섞어 실행하면 좌/우 포탈이 둘 다 실행되므로,
                // Random_Action_Order=2 한정으로 그룹 단위 exclusive branch로 해석한다.
                const picked = this.shuffleBossActionGroupList(groups)[0];
                shuffled = picked ? [picked] : [];
                if (boss) {
                    boss.p2M2FinalPortalGroupKey = picked ? picked.key : '';
                    boss.p2M2FinalPortalDirection = picked && String(picked.key || '').toUpperCase().includes('LEFT') ? 'LEFT' : 'RIGHT';
                }
            } else {
                shuffled = this.shuffleBossActionGroupList(groups);
            }
            shuffled.forEach(group => group.rows.forEach(row => result.push(row)));

            try {
                this.pushBossDebugLog(
                    gameState,
                    'RANDOM_ACTION',
                    `${String(pattern && pattern.Pattern_ID || '').trim()} ${this.getBossDebugName(pattern)}`,
                    `Random_Action_Order ${randomOrder}: ${shuffled.map(g => g.key).join(' > ')}`
                );
            } catch(e) {}
        }

        return result;
    },


    isKasiyasP2MajorPattern1Pattern: function(pattern) {
        const patternId = String(pattern && pattern.Pattern_ID || '').trim();
        const sourceId = this.getBossPatternActionSourceId ? this.getBossPatternActionSourceId(pattern) : patternId;
        return patternId === '232006' || sourceId === '232006';
    },

    isKasiyasP2MajorPattern1Action: function(action) {
        return String(action && action.Pattern_ID || '').trim() === '232006';
    },

    ensureKasiyasP2MajorPattern1Runtime: function(boss) {
        if (!boss) return null;
        boss.p2MajorPattern1Runtime = boss.p2MajorPattern1Runtime || {
            enhanceCount: 0,
            atkDmgUpCount: 0,
            atkHitboxUpCount: 0,
            actionResults: {},
            lastFloatingTimer: 0,
            swordEnergyGranted: false,
            swordEnergyAuraActive: false,
            leftSwordEnergy: 'RED',
            rightSwordEnergy: 'YELLOW'
        };
        return boss.p2MajorPattern1Runtime;
    },

    getKasiyasP2MajorPattern1EnhanceCount: function(m) {
        const rt = m && m.boss ? m.boss.p2MajorPattern1Runtime : null;
        return Math.max(0, parseInt(rt && rt.enhanceCount) || 0);
    },

    shouldSkipBossPatternActionByCondition: function(m, action, gameState) {
        const cond = String(action && action.Action_Condition_Type || '').trim().toUpperCase();
        if (!cond || cond === 'NONE') return false;
        if ((cond === 'LATE_PHASE' || cond === 'LATE_PHASE_START') && !(m && m.boss && m.boss.isLatePhase)) return true;
        if (cond === 'SPECIAL_MODE_RESULT') {
            const expected = String(action && action.Action_Condition_Value || '').trim().toUpperCase();
            const actual = String(m && m.boss && m.boss.specialModeResult || '').trim().toUpperCase();
            return !expected || !actual || actual !== expected;
        }
        if (cond === 'P3_M2_ONLY_CENTER_DISTORTION_EXISTS' || cond === 'P3_M2_NO_SPACE_DISTORTION' || cond === 'P3_M2_SPACE_DISTORTION_REMAIN') {
            if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.isKasiyasP3M2ActionConditionMet) {
                return !BossObjectSystem.isKasiyasP3M2ActionConditionMet(action, gameState);
            }
            return true;
        }

        const value = parseFloat(action && action.Action_Condition_Value);
        const threshold = Number.isFinite(value) ? value : 0;
        if (cond === 'PATTERN_ENHANCE_COUNT_UNDER') {
            return this.getKasiyasP2MajorPattern1EnhanceCount(m) >= threshold;
        }
        if (cond === 'PATTERN_ENHANCE_COUNT_OVER_OR_EQUAL') {
            return this.getKasiyasP2MajorPattern1EnhanceCount(m) < threshold;
        }
        return false;
    },

    finalizeKasiyasP2MajorPattern1ActionAsDodgeIfNeeded: function(m, action, gameState) {
        if (!m || !m.boss || !action || String(action.Pattern_ID || '').trim() !== '232006') return false;
        const required = String(action.Required_Response_Type || '').trim().toUpperCase();
        if (!required) return false;
        const rt = this.ensureKasiyasP2MajorPattern1Runtime(m.boss);
        if (!rt) return false;
        const key = `${String(action.Action_ID || '').trim()}:${m.boss.currentLoopIndex || 0}:${m.boss.currentActionIndex || 0}`;
        if (rt.actionResults && rt.actionResults[key]) return false;
        // 해당 공격 액션이 끝날 때까지 피격/가드 결과가 없으면 이동 회피로 판정한다.
        return this.registerKasiyasP2MajorPattern1ResponseResult(m, action, gameState, { dodged: true, responseType: 'DODGE', resultKey: key });
    },

    registerKasiyasP2MajorPattern1ResponseResult: function(m, action, gameState, result = {}) {
        if (!m || !m.boss || !action || String(action.Pattern_ID || '').trim() !== '232006') return false;
        const required = String(action.Required_Response_Type || '').trim().toUpperCase();
        if (!required) return false;
        const rt = this.ensureKasiyasP2MajorPattern1Runtime(m.boss);
        if (!rt) return false;
        const key = String(result.resultKey || `${String(action.Action_ID || '').trim()}:${m.boss.currentLoopIndex || 0}:${m.boss.currentActionIndex || 0}`).trim();
        rt.actionResults = rt.actionResults || {};
        if (rt.actionResults[key]) return false;

        let response = String(result.responseType || '').trim().toUpperCase();
        if (!response) response = result.guarded ? 'GUARD' : (result.dodged ? 'DODGE' : 'HIT');
        const correct = response === required;
        const player = gameState && gameState.player ? gameState.player : null;
        const actionName = this.getBossDebugName ? this.getBossDebugName(action) : String(action.Action_Name || action.Action_ID || '');

        if (correct) {
            let spirit = 0;
            if (response === 'DODGE') spirit = Math.max(0, parseFloat(action.Dodge_Get_Fighting_Spirit) || 0);
            // GUARD 보상은 PlayerManager.takeDamage의 기존 Guard_Get_Fighting_Spirit 처리에 맡긴다.
            if (spirit > 0 && typeof PlayerManager !== 'undefined' && PlayerManager.addFightingSpirit) {
                PlayerManager.addFightingSpirit(gameState, spirit, {
                    rewardKey: `P2M1_DODGE_${key}`,
                    lockTime: 0.40
                });
            }
            if (gameState && Array.isArray(gameState.floatingTexts) && player) {
                gameState.floatingTexts.push({
                    x: player.x,
                    y: player.y,
                    z: (player.z || 0) + (player.bodyZ || 100) + 56,
                    text: response === 'DODGE' ? '회피 성공!' : '가드 성공!',
                    color: response === 'DODGE' ? '#ff7b66' : '#ffe45c',
                    size: '24px',
                    timer: 0.75,
                    isBubble: false
                });
            }
            this.pushBossDebugLog && this.pushBossDebugLog(gameState, 'P2_M1_OK', `${String(action.Action_ID || '').trim()} ${actionName}`, `${response} / spirit ${spirit}`);
        } else {
            const enhanceType = String(action.Wrong_Response_Enhance_Type || '').trim().toUpperCase();
            const enhanceValue = Math.max(0, parseFloat(action.Pattern_Enhance_Value) || 0);
            rt.enhanceCount = Math.max(0, (parseInt(rt.enhanceCount) || 0) + 1);
            if (enhanceType === 'PATTERN_ATK_DMG_UP') rt.atkDmgUpCount = Math.max(0, (parseInt(rt.atkDmgUpCount) || 0) + 1);
            if (enhanceType === 'PATTERN_ATK_HITBOX_SIZE_UP') rt.atkHitboxUpCount = Math.max(0, (parseInt(rt.atkHitboxUpCount) || 0) + 1);
            rt.lastEnhanceValue = enhanceValue;
            if (gameState && Array.isArray(gameState.floatingTexts) && player) {
                gameState.floatingTexts.push({
                    x: m.x,
                    y: m.y,
                    z: (m.z || 0) + (((m.d && m.d.bodyZ) || 160) * (m.scale || 1)) + 66,
                    text: `기운 증폭 ${rt.enhanceCount}/8`,
                    color: enhanceType === 'PATTERN_ATK_HITBOX_SIZE_UP' ? '#ffd84e' : '#ff4c3f',
                    size: '24px',
                    timer: 0.80,
                    isBubble: false
                });
            }
            this.pushBossDebugLog && this.pushBossDebugLog(gameState, 'P2_M1_BAD', `${String(action.Action_ID || '').trim()} ${actionName}`, `${response} != ${required}, enhance ${rt.enhanceCount}/8`);
        }

        rt.actionResults[key] = { response, required, correct, time: Date.now() };
        return true;
    },

    isKasiyasP2MajorPattern1EnhancedAttackAction: function(action) {
        if (!action || String(action.Pattern_ID || '').trim() !== '232006') return false;
        const actionType = String(action.Action_Type || '').trim().toUpperCase();
        if (actionType !== 'ATK') return false;
        const id = String(action.Action_ID || '').trim();
        const name = String(action.Action_Name || '').trim();
        const required = String(action.Required_Response_Type || '').trim().toUpperCase();
        return !!required || id === '242049' || id === '242050' || name.indexOf('최종 X자 베기') >= 0;
    },

    getKasiyasP2MajorPattern1FinalDamageMultiplier: function(m, action) {
        // 이 함수는 모든 본체 공격 판정 계산 경로에서 호출될 수 있으므로,
        // MonsterRuntimeSystem 래퍼 누락 같은 이유로 전체 공격 판정이 중단되지 않게
        // 외부 helper(this.isKasiyas...)에 의존하지 않고 직접 안전 검사한다.
        if (!m || !m.boss || !action) return 1;
        const patternId = String(action.Pattern_ID || '').trim();
        if (patternId !== '232006') return 1;
        const actionType = String(action.Action_Type || '').trim().toUpperCase();
        if (actionType !== 'ATK') return 1;
        const required = String(action.Required_Response_Type || '').trim().toUpperCase();
        const actionId = String(action.Action_ID || '').trim();
        const actionName = String(action.Action_Name || '').trim();
        const isTarget = !!required || actionId === '242049' || actionId === '242050' || actionName.indexOf('최종 X자 베기') >= 0;
        if (!isTarget) return 1;

        const rt = m.boss.p2MajorPattern1Runtime || {};
        const count = Math.max(0, parseInt(rt.atkDmgUpCount) || 0);
        const val = Math.max(0, parseFloat(rt.lastEnhanceValue) || parseFloat(action.Pattern_Enhance_Value) || 0.2);
        return 1 + count * val;
    },

    getKasiyasP2MajorPattern1FinalHitboxMultiplier: function(m, action) {
        // 모든 본체 공격 공통 hitbox 계산에서 호출된다. helper 래퍼 의존 없이 안전 검사한다.
        if (!m || !m.boss || !action) return 1;
        const patternId = String(action.Pattern_ID || '').trim();
        if (patternId !== '232006') return 1;
        const actionType = String(action.Action_Type || '').trim().toUpperCase();
        if (actionType !== 'ATK') return 1;
        const required = String(action.Required_Response_Type || '').trim().toUpperCase();
        const actionId = String(action.Action_ID || '').trim();
        const actionName = String(action.Action_Name || '').trim();
        const isTarget = !!required || actionId === '242049' || actionId === '242050' || actionName.indexOf('최종 X자 베기') >= 0;
        if (!isTarget) return 1;

        const rt = m.boss.p2MajorPattern1Runtime || {};
        const count = Math.max(0, parseInt(rt.atkHitboxUpCount) || 0);
        const val = Math.max(0, parseFloat(rt.lastEnhanceValue) || parseFloat(action.Pattern_Enhance_Value) || 0.2);
        return 1 + count * val;
    },

    updateBossCooldowns: function(m, deltaTime) {
        const boss = m.boss;
        if (!boss || !boss.patternCooldowns) return;

        for (const patternId in boss.patternCooldowns) {
            if (boss.patternCooldowns[patternId] > 0) {
                boss.patternCooldowns[patternId] -= deltaTime;
                if (boss.patternCooldowns[patternId] < 0) boss.patternCooldowns[patternId] = 0;
            }
        }

        if (boss.noPatternWaitTimer > 0) {
            boss.noPatternWaitTimer -= deltaTime;
            if (boss.noPatternWaitTimer < 0) boss.noPatternWaitTimer = 0;
        }
    },

    getBossPatternUseRangeX: function(pattern) {
        const patternRange = parseFloat(pattern && pattern.Pattern_Use_Range_X);
        if (!isNaN(patternRange) && patternRange > 0) return patternRange;
        return 300;
    },

    getBossPatternUseRangeY: function(pattern, phase) {
        const patternRange = parseFloat(pattern && pattern.Pattern_Use_Range_Y);
        if (!isNaN(patternRange) && patternRange > 0) return patternRange;
        return 90;
    },

    normalizeBossActionMoveType: function(value) {
        const v = String(value || '').trim().toUpperCase();
        if (v === 'MOVE_DASH') return 'DASH';
        if (v === 'MOVE_RUSH') return 'RUSH';
        if (v === 'MOVE_WALK') return 'WALK';
        if (v === 'MOVE_SHOULDER_ATK') return 'MOVE_SHOULDER_ATK';
        if (v === 'MOVE_WITH_NOISE') return 'NOISE';
        if (v === 'MOVE_JUMP') return 'JUMP';
        if (v === 'MOVE_WARP') return 'WARP';
        return v;
    },

    getBossActionHitWindow: function(m, action) {
        const boss = m ? m.boss : null;
        const timeRate = this.getLatePhaseActionTimeRate(action, boss);
        const startRaw = parseFloat(action && action.Hitbox_Start_Time);
        const endRaw = parseFloat(action && action.Hitbox_End_Time);
        const start = !isNaN(startRaw) && startRaw > 0 ? startRaw * timeRate : 0;
        const end = !isNaN(endRaw) && endRaw > 0 ? endRaw * timeRate : start;
        return { start, end };
    },

    getLatePhaseActionTimeRate: function(action, ownerBoss) {
        const raw = parseFloat(action && action.Late_Phase_Action_Time_Rate);
        if (ownerBoss && ownerBoss.isLatePhase && !isNaN(raw) && raw > 0) return raw;
        return 1;
    },

    getBossActionMoveSpeed: function(m, action, boss) {
        const baseSpeed = m && m.d ? (parseFloat(m.d.speed) || 0) : 0;
        const lateRate = parseFloat(action && action.Late_Phase_Action_Move_Speed_Rate);
        const rate = parseFloat(action && action.Action_Move_Speed_Rate);
        if (boss && boss.isLatePhase && !isNaN(lateRate) && lateRate > 0 && baseSpeed > 0) return baseSpeed * lateRate;
        if (!isNaN(rate) && rate > 0 && baseSpeed > 0) return baseSpeed * rate;

        // 구버전 호환: v2.3에서 사용했던 절대 속도 컬럼이 남아있으면 그대로 사용한다.
        const lateSpeed = parseFloat(action && action.Late_Phase_Action_Move_Speed);
        const speed = parseFloat(action && action.Action_Move_Speed);
        if (boss && boss.isLatePhase && !isNaN(lateSpeed) && lateSpeed > 0) return lateSpeed;
        if (!isNaN(speed) && speed > 0) return speed;
        return 0;
    },

    getBossActionDuration: function(m, action, gameState) {
        if (!action) return 0.001;
        const boss = m ? m.boss : null;
        const moveType = this.normalizeBossActionMoveType(action.Action_Move_Type);
        const timeRate = this.getLatePhaseActionTimeRate(action, boss);
        const actionType = String(action.Action_Type || '').trim().toUpperCase();

        if (String(action.Call_Object_Action_ID || action.Object_Action_ID || '').trim()) {
            const callType = String(action.Call_Object_Action_Type || '').trim().toUpperCase() || 'START_AND_WAIT';
            const callId = String(action.Call_Object_Action_ID || action.Object_Action_ID || '').trim();
            const callAction = gameState && gameState.DB_BOSS_PATTERN_OBJECT_ACTION ? gameState.DB_BOSS_PATTERN_OBJECT_ACTION[callId] : null;
            const objectId = String(action.Call_Object_ID || action.Object_ID || (callAction && (callAction.Object_ID || callAction.Attack_Object_ID)) || '').trim();
            const explicitDuration = parseFloat(action.Action_Anim_Duration);
            const calledDuration = parseFloat(callAction && callAction.Action_Anim_Duration);

            let ownDuration = (!isNaN(explicitDuration) && explicitDuration > 0)
                ? Math.max(0.05, explicitDuration * timeRate)
                : (actionType === 'CALL_OBJECT_ACTION' ? Math.max(0.05, 0.05 * timeRate) : 0);

            let objectRuntimeDuration = 0;
            if (objectId && typeof this.findActiveBossPatternActorByObjectId === 'function' && typeof this.getBossObjectCurrentActionDuration === 'function') {
                const actor = this.findActiveBossPatternActorByObjectId(gameState, objectId);
                const actorActionId = actor && actor.action ? String(actor.action.Object_Action_ID || '').trim() : '';
                if (actor && actor.action && (!callId || actorActionId === callId)) {
                    objectRuntimeDuration = Math.max(0, this.getBossObjectCurrentActionDuration(actor, actor.action));
                }
            }
            if (objectRuntimeDuration <= 0) objectRuntimeDuration = Math.max(0, parseFloat((m && m.boss && m.boss.syncedObjectActionDuration)) || 0);
            if (objectRuntimeDuration <= 0 && !isNaN(calledDuration) && calledDuration > 0) objectRuntimeDuration = calledDuration * timeRate;

            if (callType === 'START_ONLY') return ownDuration > 0 ? ownDuration : Math.max(0.05, 0.05 * timeRate);
            if (callType === 'START_SYNC_WAIT' || callType === 'START_AND_WAIT' || actionType === 'CALL_OBJECT_ACTION') {
                return Math.max(ownDuration || 0.05, objectRuntimeDuration || 0.05);
            }
        }

        if (moveType === 'RUSH') {
            const path = m && m.boss ? (m.boss.currentDashPath || m.boss.previewDashPath || m.boss.lastDashPath) : null;
            const speed = this.getBossActionMoveSpeed(m, action, boss);
            const pathLength = this.getPathLength(path);

            if (speed > 0 && pathLength > 0) {
                return Math.max(0.05, (pathLength / speed) * timeRate);
            }
        }

        if (moveType === 'DASH') {
            if (boss && boss.actionMove && boss.actionMove.duration) {
                const moveDuration = parseFloat(boss.actionMove.duration) || 0.001;
                // 일부 ATK+DASH 준비 이동은 시작 처리에서 이미 후반부 시간 배율이 반영된
                // 실제 이동 시간을 저장한다. 이 경우 다시 timeRate를 곱하지 않는다.
                if (boss.actionMove.durationIsEffective === true) return Math.max(0.05, moveDuration);
                return Math.max(0.05, moveDuration * timeRate);
            }

            // MOVE_DASH 액션은 Action_Anim_Duration이 비어 있어도 1프레임에 스킵되면 안 된다.
            // 이동 정보가 아직 생성되기 전에는 안전한 기본 지속시간을 돌려준다.
            const explicitDashDuration = parseFloat(action.Action_Anim_Duration);
            if (!isNaN(explicitDashDuration) && explicitDashDuration > 0) {
                return Math.max(0.05, explicitDashDuration * timeRate);
            }
            return Math.max(0.18, 0.35 * timeRate);
        }

        if (moveType === 'NOISE' || String(action.Action_Type || '').trim().toUpperCase() === 'MOVE_GROUP') {
            if (boss && boss.actionMove && boss.actionMove.duration) {
                return Math.max(0.05, (parseFloat(boss.actionMove.duration) || 0.001) * timeRate);
            }
            const duration = parseFloat(action.Action_Anim_Duration);
            if (!isNaN(duration) && duration > 0) return Math.max(0.05, duration * timeRate);
            return Math.max(0.05, 0.5 * timeRate);
        }

        if (moveType === 'MOVE_SHOULDER_ATK') {
            const duration = parseFloat(action.Action_Anim_Duration);
            if (!isNaN(duration) && duration > 0) return Math.max(0.05, duration * timeRate);
            const distance = parseFloat(action.Action_Move_Distance) || 100;
            const speed = this.getBossActionMoveSpeed(m, action, boss) || 600;
            return Math.max(0.12, Math.min(0.9, (distance / Math.max(1, speed)) * timeRate));
        }

        const duration = parseFloat(action.Action_Anim_Duration);
        if (!isNaN(duration)) return Math.max(0.001, duration * timeRate);
        return 0.001;
    },

    isBossPatternConditionMet: function(pattern, boss, m = null) {
        const condType = String(pattern.Pattern_Cond_Type || '').trim().toUpperCase();

        if (!condType || condType === 'COOLDOWN_READY') return true;
        if (condType === 'LATE_PHASE') return !!boss.isLatePhase;
        if (condType === 'LATE_PHASE_START') return !!boss.isLatePhase && !boss.lateOpeningPatternUsed;
        if (condType === 'LATE_PHASE_MAJOR_PATTERN') return !!boss.isLatePhase && !!boss.lateOpeningPatternUsed;
        if (condType === 'KASIYAS_P3_HP_UNDER') {
            const raw = parseFloat(pattern.Pattern_Cond_Value);
            const threshold = !isNaN(raw) ? (raw > 1 ? raw / 100 : raw) : 1;
            const hp = parseFloat(m && m.hp);
            const maxHp = Math.max(1, parseFloat(m && m.maxHp) || parseFloat(m && m.d && m.d.hp) || 1);
            const hpRate = !isNaN(hp) ? hp / maxHp : 1;
            return hpRate <= threshold;
        }

        return true;
    },

    selectReadyBossPattern: function(m, distX, distY, dist2D, gameState) {
        const boss = m.boss;
        if (!boss || boss.activePattern) return null;

        const debug = this.ensureBossDebug(gameState);
        const hpRate = (parseFloat(m.hp) || 0) / Math.max(1, parseFloat(m.maxHp) || 1);

        if (boss.noPatternWaitTimer > 0) {
            debug.patternCheck = {
                status: 'WAIT',
                phaseId: boss.phaseId,
                patternSetId: boss.patternSetId,
                hpRate: hpRate,
                isLatePhase: !!boss.isLatePhase,
                distX: distX,
                distY: distY,
                noPatternWaitTimer: boss.noPatternWaitTimer,
                checks: [],
                readyCount: 0,
                selected: null
            };
            return null;
        }

        const phase = boss.config || boss.phase || {};
        let patterns = gameState.DB_BOSS_PATTERN_BY_SET && gameState.DB_BOSS_PATTERN_BY_SET[boss.patternSetId]
            ? gameState.DB_BOSS_PATTERN_BY_SET[boss.patternSetId]
            : [];
        if (boss.basicPatternOnly) {
            patterns = patterns.filter(pattern => String(pattern && pattern.Pattern_Category || '').trim().toUpperCase() === 'BASIC');
        }

        const checks = [];
        const ready = [];

        for (const pattern of patterns) {
            const patternId = String(pattern.Pattern_ID || '').trim();
            const check = {
                patternId: patternId,
                name: this.getBossDebugName(pattern),
                ok: false,
                reason: '',
                cooldown: patternId ? Math.max(0, boss.patternCooldowns[patternId] || 0) : 0,
                priority: parseFloat(pattern.Pattern_Priority) || 0,
                weight: Math.max(1, parseFloat(pattern.Random_Weight) || 1),
                condType: String(pattern.Pattern_Cond_Type || '').trim() || 'COOLDOWN_READY',
                useRangeX: 0,
                useRangeY: 0
            };

            if (!patternId) {
                check.reason = 'NO_PATTERN_ID';
                checks.push(check);
                continue;
            }

            boss.usedPatternIds = boss.usedPatternIds || {};
            if (!this.isBossPatternRepeatAllowed(pattern) && boss.usedPatternIds[patternId]) {
                check.reason = 'USED_ONCE';
                checks.push(check);
                continue;
            }

            if (!pattern.Runtime_Actions || pattern.Runtime_Actions.length <= 0) {
                check.reason = 'NO_ACTIONS';
                checks.push(check);
                continue;
            }

            if (check.cooldown > 0) {
                check.reason = 'COOLDOWN';
                checks.push(check);
                continue;
            }

            const useRangeX = this.getBossPatternUseRangeX(pattern, phase);
            const useRangeY = this.getBossPatternUseRangeY(pattern, phase);
            check.useRangeX = useRangeX;
            check.useRangeY = useRangeY;

            if (distX > useRangeX || distY > useRangeY) {
                check.reason = 'RANGE';
                checks.push(check);
                continue;
            }

            if (!this.isBossPatternConditionMet(pattern, boss, m)) {
                check.reason = 'CONDITION';
                checks.push(check);
                continue;
            }

            check.ok = true;
            check.reason = 'READY';
            checks.push(check);
            ready.push(pattern);
        }

        debug.patternCheck = {
            status: 'CHECK',
            phaseId: boss.phaseId,
            patternSetId: boss.patternSetId,
            hpRate: hpRate,
            isLatePhase: !!boss.isLatePhase,
            distX: distX,
            distY: distY,
            noPatternWaitTimer: 0,
            checks: checks,
            readyCount: ready.length,
            selected: null
        };

        if (ready.length <= 0) return null;

        const maxPriority = Math.max(...ready.map(p => parseFloat(p.Pattern_Priority) || 0));
        const priorityGroup = ready.filter(p => (parseFloat(p.Pattern_Priority) || 0) === maxPriority);

        let totalWeight = 0;
        const weighted = priorityGroup.map(pattern => {
            const weight = Math.max(1, parseFloat(pattern.Random_Weight) || 1);
            totalWeight += weight;
            return { pattern, weight };
        });

        const roll = Math.random() * totalWeight;
        let r = roll;
        let selectedPattern = priorityGroup[0];
        for (const item of weighted) {
            if (r < item.weight) {
                selectedPattern = item.pattern;
                break;
            }
            r -= item.weight;
        }

        debug.patternCheck.selected = {
            patternId: String(selectedPattern.Pattern_ID || '').trim(),
            name: this.getBossDebugName(selectedPattern),
            priority: parseFloat(selectedPattern.Pattern_Priority) || 0,
            weight: Math.max(1, parseFloat(selectedPattern.Random_Weight) || 1),
            roll: roll,
            totalWeight: totalWeight,
            priorityGroupCount: priorityGroup.length
        };

        return selectedPattern;
    },

    startBossPattern: function(m, pattern, gameState) {
        const boss = m.boss;
        if (!boss || !pattern) return;

        boss.activePattern = pattern;
        const startedPatternId = String(pattern.Pattern_ID || '').trim();
        if (boss.hpTriggerProtection && boss.hpTriggerProtection.active && String(boss.hpTriggerProtection.patternId || '').trim() === startedPatternId) {
            if (typeof this.pushBossDebugLog === 'function') {
                this.pushBossDebugLog(gameState, 'HP_GUARD_END', `패턴 ${startedPatternId} 시작`, 'HP 트리거 보호 해제');
            }
            boss.hpTriggerProtection = null;
        }
        boss.usedPatternIds = boss.usedPatternIds || {};
        if (startedPatternId && !this.isBossPatternRepeatAllowed(pattern)) {
            boss.usedPatternIds[startedPatternId] = true;
        }
        if (String(pattern.Pattern_ID || '').trim() === String(boss.lateOpeningPatternId || '').trim()) {
            boss.lateOpeningPatternStarted = true;
            boss.lateOpeningPatternUsed = true;
            boss.pendingLateOpeningPatternId = null;
        }
        boss.currentActionIndex = -1;
        boss.currentLoopIndex = 0;
        boss.loopCount = this.getPatternLoopCount(pattern, boss);
        boss.action = null;
        boss.actionHitFired = false;
        boss.actionObjectSpawnStartFired = false;
        boss.actionObjectSpawnEndFired = false;
        boss.p2p3JumpSlashTarget = null;
        boss.runtimeActions = this.buildBossPatternRuntimeActions(pattern, gameState, boss);
        boss.pattern4Runtime = null;
        boss.majorPattern1Runtime = null;
        boss.majorPattern2Runtime = null;
        boss.majorPattern3Runtime = null;
        boss.nextDiagonalOwnerCorner = null;
        boss.nextDiagonalCloneCorner = null;

        if (String(pattern.Pattern_ID || '').trim() === '231007') {
            if (typeof this.clearKasiyasMajorPattern2Objects === 'function') {
                this.clearKasiyasMajorPattern2Objects(gameState, { removeActors: true });
            }
            boss.majorPattern2Runtime = { objectGroupSelections: {} };
        }


        if (this.isKasiyasP2MajorPattern1Pattern && this.isKasiyasP2MajorPattern1Pattern(pattern)) {
            boss.p2MajorPattern1Runtime = {
                enhanceCount: 0,
                atkDmgUpCount: 0,
                atkHitboxUpCount: 0,
                actionResults: {},
                lastEnhanceValue: 0.2,
                swordEnergyGranted: false,
                swordEnergyAuraActive: false,
                leftSwordEnergy: 'RED',
                rightSwordEnergy: 'YELLOW'
            };
        }

        if (String(pattern.Pattern_ID || '').trim() === '232007') {
            boss.p2M2FinalResolved = false;
            boss.p2M2FinalPortalGroupKey = '';
            boss.p2M2FinalPortalDirection = '';
            if (gameState) {
                gameState.p2m2LastFiredSword = null;
                // 부분 파훼는 이번 패턴에서 거대 검을 실제로 파괴해 얻은 사도의 기운이 있을 때만 성립해야 한다.
                // 이전 연습/패턴에서 남은 플래그가 마지막 피니시 가드 그로기를 잘못 발생시키지 않도록 패턴 시작 시 초기화한다.
                const p = gameState.player || null;
                if (p) {
                    p.hasP2M2ApostleSwordEnergy = false;
                    p.p2m2ApostleSwordEnergyTimer = 0;
                    p.kasiyasApostleEnergyFlashTimer = 0;
                }
            }
        }

        if (this.isKasiyasMajorPattern3Pattern(pattern)) {
            if (typeof this.clearKasiyasMajorPattern3Runtime === 'function') {
                this.clearKasiyasMajorPattern3Runtime(gameState, { removeActors: true, clearMark: true });
            } else if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.clearKasiyasMajorPattern3Runtime) {
                BossObjectSystem.clearKasiyasMajorPattern3Runtime(gameState, { removeActors: true, clearMark: true });
            }
            boss.majorPattern3Runtime = { randomRushStarted: true, randomRushPaths: {} };
        }

        if (String(pattern.Pattern_ID || '').trim() === '233006') {
            boss.p3MajorPattern1Runtime = { active: true, startedAt: 0 };
            if (typeof PlayerManager !== 'undefined' && PlayerManager.clearP3OniCurse) {
                PlayerManager.clearP3OniCurse(gameState, { silent: true, keepBuff: true });
            }
        }

        this.ensureBossDebug(gameState).currentObjectAction = null;
        this.pushBossDebugLog(
            gameState,
            'SELECT',
            `${String(pattern.Pattern_ID || '').trim()} ${this.getBossDebugName(pattern)}`,
            `priority ${parseFloat(pattern.Pattern_Priority) || 0}, weight ${Math.max(1, parseFloat(pattern.Random_Weight) || 1)}, loops ${boss.loopCount}`
        );

        this.startNextBossPatternAction(m, gameState);
    },

    finishBossPattern: function(m, gameState) {
        const boss = m.boss;
        if (!boss) return;

        const pattern = boss.activePattern;
        if (pattern) {
            const patternId = String(pattern.Pattern_ID || '').trim();
            if (patternId === '231007' && typeof this.clearKasiyasMajorPattern2Objects === 'function') {
                this.clearKasiyasMajorPattern2Objects(gameState, { removeActors: true });
            }
            if (this.isKasiyasMajorPattern3Pattern(pattern)) {
                if (typeof this.clearKasiyasMajorPattern3Runtime === 'function') {
                    this.clearKasiyasMajorPattern3Runtime(gameState, { removeActors: true, clearMark: true });
                } else if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.clearKasiyasMajorPattern3Runtime) {
                    BossObjectSystem.clearKasiyasMajorPattern3Runtime(gameState, { removeActors: true, clearMark: true });
                }
            }
            if (patternId === '232006') {
                boss.p2MajorPattern1Runtime = null;
            }
            const patternActionSourceId = typeof this.getBossPatternActionSourceId === 'function'
                ? this.getBossPatternActionSourceId(pattern)
                : patternId;
            if (patternId === '232008' || patternActionSourceId === '232008') {
                // P2_M3 결과 액션(242074~242076)이 모두 끝난 뒤에는
                // 다음 실행에 이전 결과가 섞이지 않도록 전용 결과 상태를 초기화한다.
                boss.specialModeResult = null;
                boss.specialModeStarted = false;
            }
            if (patternId === '232007') {
                // 검벽 웨이브가 끝나도 파괴된 거대 검/조준/발사체는 후속 파훼 기믹으로 이어질 수 있으므로 유지한다.
                // 연습 모드에서 다른 패턴을 강제 실행하거나 패턴을 새로 시작할 때는 기본 정리 옵션으로 제거된다.
                if (typeof this.clearKasiyasP2MajorPattern2Runtime === 'function') {
                    this.clearKasiyasP2MajorPattern2Runtime(gameState, { removeObjects: true, keepProgressObjects: true });
                } else if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.clearKasiyasP2MajorPattern2Runtime) {
                    BossObjectSystem.clearKasiyasP2MajorPattern2Runtime.call(this, gameState, { removeObjects: true, keepProgressObjects: true });
                }
            }
            if (patternId === '232003') {
                if (typeof this.clearKasiyasP2Pattern3Runtime === 'function') {
                    this.clearKasiyasP2Pattern3Runtime(gameState, { clearAllHitboxes: true, forceResetBossState: true });
                } else if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.clearKasiyasP2Pattern3Runtime) {
                    BossObjectSystem.clearKasiyasP2Pattern3Runtime.call(this, gameState, { clearAllHitboxes: true, forceResetBossState: true });
                }
            }
            if (patternId === '233006') {
                boss.p3MajorPattern1Runtime = null;
                if (typeof PlayerManager !== 'undefined' && PlayerManager.clearP3OniCurse) {
                    PlayerManager.clearP3OniCurse(gameState, { reason: 'PATTERN_END', keepBuff: true, silent: true });
                }
            }

            // 후반부 개시 패턴을 막 끝낸 시점부터, 연결된 일반 사이클용 패턴의
            // 쿨타임을 시작한다. 개시 패턴 진행 중에는 쿨타임이 감소하지 않는다.
            if (typeof this.applyLinkedPatternCooldownsAfterSourceEnd === 'function') {
                this.applyLinkedPatternCooldownsAfterSourceEnd(m, pattern, gameState);
            }

            boss.patternCooldowns[patternId] = this.getBossPatternCooldown(pattern, boss);
            this.pushBossDebugLog(
                gameState,
                'END',
                `${patternId} ${this.getBossDebugName(pattern)}`,
                `cooldown ${(boss.patternCooldowns[patternId] || 0).toFixed(1)}s`
            );
        }

        this.ensureBossDebug(gameState).currentAction = null;
        this.ensureBossDebug(gameState).currentObjectAction = null;

        boss.activePattern = null;
        boss.currentActionIndex = -1;
        boss.currentLoopIndex = 0;
        boss.loopCount = 1;
        boss.action = null;
        boss.runtimeActions = null;
        boss.actionHitFired = false;
        boss.actionObjectSpawnStartFired = false;
        boss.actionObjectSpawnEndFired = false;
        boss.actionHitsDone = 0;
        boss.actionCycleTimer = 0;
        boss.previewDashPath = null;
        boss.p2p3JumpSlashTarget = null;
        boss.currentDashPath = null;
        boss.actionMove = null;
        boss.kasiyasP2M2Hidden = false;
        boss.kasiyasP1M3RushHidden = false;
        boss.kasiyasP3M2Hidden = false;
        boss.kasiyasP3M2HiddenStarted = false;
        boss.kasiyasP3M2LandingActionId = '';
        boss.noPatternWaitTimer = parseFloat((boss.config || boss.phase || {}).No_Pattern_Wait_Time) || 0.2;

        m.state = 'IDLE';
        m.timer = 0;
        m.hasFired = false;
    },

    startNextBossPatternAction: function(m, gameState) {
        const boss = m.boss;
        const pattern = boss && boss.activePattern;
        if (!boss || !pattern) return;

        if (
            gameState &&
            gameState.specialMode === 'P3_M3_FINAL_ISSEN' &&
            m && m.isP3M3Monster &&
            String(m.p3m3Role || '').trim().toUpperCase() === 'TRUE_BOSS' &&
            boss.p3m3FinalQueued
        ) {
            // 히든 분기 HP 1% 도달 이후에는 현재 액션만 마무리하고, 같은 패턴의 다음 액션으로 이어가지 않는다.
            // P3_M3 시스템이 다음 프레임에 중앙 이동 전용 시퀀스를 넘겨받는다.
            boss.activePattern = null;
            boss.currentActionIndex = -1;
            boss.currentLoopIndex = 0;
            boss.loopCount = 1;
            boss.action = null;
            boss.actionMove = null;
            boss.actionMoveCompleted = false;
            boss.runtimeActions = null;
            boss.actionHitFired = false;
            boss.actionObjectSpawnStartFired = false;
            boss.actionObjectSpawnEndFired = false;
            boss.actionHitsDone = 0;
            boss.actionCycleTimer = 0;
            boss.noPatternWaitTimer = 999999;
            m.state = 'IDLE';
            m.timer = 0;
            m.hasFired = false;
            return;
        }

        const actions = boss.runtimeActions || pattern.Runtime_Actions || [];

        if (boss.action && typeof this.finalizeKasiyasP2MajorPattern1ActionAsDodgeIfNeeded === 'function') {
            this.finalizeKasiyasP2MajorPattern1ActionAsDodgeIfNeeded(m, boss.action, gameState);
        }

        while (true) {
            boss.currentActionIndex++;

            if (boss.currentActionIndex >= actions.length) {
                boss.currentLoopIndex++;
                if (boss.currentLoopIndex < boss.loopCount) {
                    boss.currentActionIndex = -1;
                    continue;
                }
                this.finishBossPattern(m, gameState);
                return;
            }

            const action = actions[boss.currentActionIndex];
            const cond = String(action.Action_Condition_Type || '').trim().toUpperCase();

            if (typeof this.shouldSkipBossPatternActionByCondition === 'function' && this.shouldSkipBossPatternActionByCondition(m, action, gameState)) {
                this.pushBossDebugLog(
                    gameState,
                    'SKIP',
                    `${String(action.Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
                    `condition ${cond}`
                );
                continue;
            }

            boss.action = action;
            boss.actionHitFired = false;
            boss.actionObjectSpawnStartFired = false;
            boss.actionObjectSpawnEndFired = false;
            boss.actionHitsDone = 0;
            boss.actionCycleTimer = 999;
            boss.actionSpawnSerial = (parseInt(boss.actionSpawnSerial) || 0) + 1;
            boss.lastP2DoubleSlashVisualEffectKey = null;
            boss.lastP2SpinSlashVisualEffectKey = null;
            boss.lastP2ArcSlashVisualEffectKey = null;
            // 2페이즈 기본5: 회전 전진(242035) 종료 후 준비/마무리 액션에서는
            // 이전 회전 전진용 잔류 이펙트가 다시 보이지 않도록 정리한다.
            if (String(action.Action_ID || '').trim() === '242036' || String(action.Action_ID || '').trim() === '242037') {
                try {
                    if (gameState && Array.isArray(gameState.effects)) {
                        gameState.effects = gameState.effects.filter(eff => {
                            const rt = String(eff && eff.renderType || '').trim().toUpperCase();
                            return rt !== 'EFT_KASIYAS_P2_DOUBLE_EDGED_SWORD_SPIN' && rt !== 'EFT_KASIYAS_P2_DOUBLE_EDGED_SWORD_ARC_SLASH';
                        });
                    }
                    boss.lastP2SpinSlashVisualEffectKey = null;
            boss.lastP2ArcSlashVisualEffectKey = null;
                } catch (e) {}
            }
            boss.parryWindowActive = false;
            boss.parryCueTimer = 0;

            const actionType = String(action.Action_Type || '').trim().toUpperCase();
            if (['WAIT','WARNING_PATH','WARNING','SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT','MOVE','MOVE_GROUP','CALL_OBJECT_ACTION','DIRECT_ACT','SPECIAL_MODE_START','P3_M3_EXCLUSIVE_MODE_START'].includes(actionType)) m.state = 'IDLE';
            else m.state = 'ATK_MELEE';

            m.timer = 0;
            m.hasFired = false;
            m.faceDir = gameState.player.x >= m.x ? 1 : -1;

            const debug = this.ensureBossDebug(gameState);
            debug.currentAction = {
                patternId: String(pattern.Pattern_ID || '').trim(),
                patternName: this.getBossDebugName(pattern),
                actionId: String(action.Action_ID || '').trim(),
                actionName: this.getBossDebugName(action),
                actionType: actionType,
                moveType: String(action.Action_Move_Type || '').trim() || 'NONE',
                hitboxType: String(action.Hitbox_Type || '').trim() || 'NONE',
                hitStart: this.getBossActionHitWindow(m, action).start,
                hitEnd: this.getBossActionHitWindow(m, action).end,
                canGuard: action.ATK_Can_Guard === true || String(action.ATK_Can_Guard || '').trim().toLowerCase() === 'true',
                loopIndex: boss.currentLoopIndex + 1,
                loopCount: boss.loopCount,
                order: parseFloat(action.Runtime_Effective_Action_Order || action.Late_Phase_Action_Order || action.Action_Order) || (boss.currentActionIndex + 1),
                duration: this.getBossActionDuration(m, action, gameState)
            };
            this.pushBossDebugLog(
                gameState,
                'ACTION',
                `${String(action.Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
                `loop ${boss.currentLoopIndex + 1}/${boss.loopCount}, type ${actionType}`
            );

            this.onBossPatternActionStart(m, action, gameState);
            return;
        }
    },
};

window.BossPatternSystem = BossPatternSystem;
