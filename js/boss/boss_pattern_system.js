// boss_pattern_system.js
// 보스 패턴 몬스터 판별, 런타임 생성, 쿨타임, 패턴 선택/시작/종료,
// Boss_Pattern_Action_info의 액션 순차 실행을 담당한다.
//
// 기존 MonsterManager 메서드와 호환되도록, 각 함수는 MonsterManager를 this로 받아 실행된다.

const BossPatternSystem = {
    isBossPatternData: function(d) {
        return !!d && String(d.aiType || '').trim().toUpperCase() === 'BOSS_PATTERN';
    },

    isBossPatternMonster: function(m) {
        return !!(m && m.boss && this.isBossPatternData(m.d));
    },


    getPatternLoopCount: function(pattern, boss) {
        const lateValue = parseInt(pattern.Late_Phase_Action_Sequence_Loop_Count);
        const normalValue = parseInt(pattern.Action_Sequence_Loop_Count);
        if (boss && boss.isLatePhase && !isNaN(lateValue) && lateValue > 0) return lateValue;
        if (!isNaN(normalValue) && normalValue > 0) return normalValue;
        return 1;
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

    getBossPatternUseRangeX: function(pattern, phase) {
        const patternRange = parseFloat(pattern && pattern.Pattern_Use_Range_X);
        if (!isNaN(patternRange) && patternRange > 0) return patternRange;
        return parseFloat(phase && phase.Chase_Start_Distance) || 300;
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
                return Math.max(0.05, (parseFloat(boss.actionMove.duration) || 0.001) * timeRate);
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

    isBossPatternConditionMet: function(pattern, boss) {
        const condType = String(pattern.Pattern_Cond_Type || '').trim().toUpperCase();

        if (!condType || condType === 'COOLDOWN_READY') return true;
        if (condType === 'LATE_PHASE' || condType === 'LATE_PHASE_START') return !!boss.isLatePhase;

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

        const phase = boss.phase || {};
        const patterns = gameState.DB_BOSS_PATTERN_BY_SET && gameState.DB_BOSS_PATTERN_BY_SET[boss.patternSetId]
            ? gameState.DB_BOSS_PATTERN_BY_SET[boss.patternSetId]
            : [];

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

            if (!this.isBossPatternConditionMet(pattern, boss)) {
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
        boss.currentActionIndex = -1;
        boss.currentLoopIndex = 0;
        boss.loopCount = this.getPatternLoopCount(pattern, boss);
        boss.action = null;
        boss.actionHitFired = false;
        boss.pattern4Runtime = null;
        boss.majorPattern1Runtime = null;
        boss.nextDiagonalOwnerCorner = null;
        boss.nextDiagonalCloneCorner = null;

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
            boss.patternCooldowns[patternId] = parseFloat(pattern.Pattern_Cooldown) || 1;
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
        boss.actionHitFired = false;
        boss.actionHitsDone = 0;
        boss.actionCycleTimer = 0;
        boss.previewDashPath = null;
        boss.currentDashPath = null;
        boss.actionMove = null;
        boss.noPatternWaitTimer = parseFloat(boss.phase && boss.phase.No_Pattern_Wait_Time) || 0.2;

        m.state = 'IDLE';
        m.timer = 0;
        m.hasFired = false;
    },

    startNextBossPatternAction: function(m, gameState) {
        const boss = m.boss;
        const pattern = boss && boss.activePattern;
        if (!boss || !pattern) return;

        const actions = pattern.Runtime_Actions || [];

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

            if ((cond === 'LATE_PHASE' || cond === 'LATE_PHASE_START') && !boss.isLatePhase) {
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
            boss.actionHitsDone = 0;
            boss.actionCycleTimer = 999;
            boss.parryWindowActive = false;
            boss.parryCueTimer = 0;

            const actionType = String(action.Action_Type || '').trim().toUpperCase();
            if (['WAIT','WARNING_PATH','WARNING','SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT','MOVE','MOVE_GROUP'].includes(actionType)) m.state = 'IDLE';
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
                order: parseFloat(action.Action_Order) || (boss.currentActionIndex + 1),
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
