// 3페이즈 대형 패턴3: 233008 세계를 가르는 일섬 전용 모드
// 데이터 시트(P3_M3_*)의 맵/분신/루트 정보를 기존 보스 루프 위에 얇게 얹는다.

const P3M3FinalIssenSystem = {
    MODE: 'P3_M3_FINAL_ISSEN',

    isActive(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        return !!(rt && rt.active && gameState.specialMode === this.MODE);
    },

    num(value, fallback = 0) {
        const n = parseFloat(value);
        return Number.isFinite(n) ? n : fallback;
    },

    id(value) {
        return String(value === null || value === undefined ? '' : value).trim();
    },

    bool(value) {
        if (value === true) return true;
        const s = String(value || '').trim().toUpperCase();
        return s === 'TRUE' || s === '1' || s === 'Y' || s === 'YES';
    },

    splitIds(value) {
        return String(value === null || value === undefined ? '' : value)
            .split(',')
            .map(v => this.id(v))
            .filter(Boolean);
    },

    isDialogueActive(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        return !!(rt && rt.active && rt.dialogue && rt.dialogue.active);
    },

    getDialogueRows(gameState, dialogueId) {
        const key = this.id(dialogueId);
        return (gameState.DB_P3_M3_DIALOGUE || [])
            .filter(row => this.id(row.Dialogue_ID) === key)
            .sort((a, b) => this.num(a.Line_Order, 0) - this.num(b.Line_Order, 0));
    },

    findDialogueFirstLine(gameState, triggerType, options = {}) {
        const trigger = this.id(triggerType).toUpperCase();
        if (!trigger) return null;
        const areaId = this.id(options.areaId || '');
        const routeId = this.id(options.routeId || '');
        const monsterId = this.id(options.monsterId || '');
        const rows = (gameState.DB_P3_M3_DIALOGUE || [])
            .filter(row => this.id(row.Trigger_Type).toUpperCase() === trigger)
            .sort((a, b) => this.num(a.Dialogue_ID, 0) - this.num(b.Dialogue_ID, 0));

        for (const row of rows) {
            const rowArea = this.id(row.Area_ID || '');
            const rowRoute = this.id(row.Route_ID || '');
            const rowMonster = this.id(row.Trigger_Monster_ID || '');
            if (areaId && rowArea && rowArea !== areaId) continue;
            if (routeId && rowRoute && rowRoute !== routeId) continue;
            if (monsterId && rowMonster && rowMonster !== monsterId) continue;
            if (!this.checkDialogueCondition(gameState, row)) continue;
            const lines = this.getDialogueRows(gameState, row.Dialogue_ID);
            if (lines.length > 0) return row;
        }
        return null;
    },

    checkDialogueCondition(gameState, row) {
        const cond = this.id(row && row.Trigger_Cond_Type).toUpperCase();
        if (!cond) return true;
        const values = this.splitIds(row.Trigger_Cond_Value);
        if (cond === 'PLAYER_HAS_OBJECT') {
            if (values.length <= 0) return true;
            return values.every(value => this.playerHasTalkObject(gameState, value));
        }
        if (cond === 'PLAYER_HAS_ALL_OBJECTS') {
            return values.every(value => this.playerHasTalkObject(gameState, value));
        }
        if (cond === 'BOTH_TALK') {
            const rt = gameState && gameState.p3m3Runtime;
            return !!(rt && rt.leftResult === 'TALK_CLEAR' && rt.rightResult === 'TALK_CLEAR');
        }
        if (cond === 'NOT_BOTH_TALK') {
            const rt = gameState && gameState.p3m3Runtime;
            return !(rt && rt.leftResult === 'TALK_CLEAR' && rt.rightResult === 'TALK_CLEAR');
        }
        return true;
    },

    applyDialogueLineEvent(gameState, line) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !line) return false;
        const eventType = this.id(line.Line_Event_Type || line.Trigger_Cond_Type).toUpperCase();
        const eventValue = this.id(line.Line_Event_Value || line.Trigger_Cond_Value);
        if (!eventType || eventType === 'NONE') return false;

        if (eventType === 'KASIYAS_RENDER_CHANGE') {
            const modelName = eventValue || 'RENDER_KASIYAS_FULL_POWER';
            const targetMonsterId = this.id(line.Trigger_Monster_ID || '');
            const candidates = [];
            if (rt.monstersByRole) {
                if (rt.monstersByRole.TRUE_BOSS) candidates.push(rt.monstersByRole.TRUE_BOSS);
                if (rt.monstersByRole.CENTER_BOSS) candidates.push(rt.monstersByRole.CENTER_BOSS);
            }
            (gameState.monsters || []).forEach(m => {
                if (!m || !m.active || !m.isP3M3Monster) return;
                if (targetMonsterId && this.id(m.p3m3Row && m.p3m3Row.P3_M3_Monster_ID) !== targetMonsterId) return;
                candidates.push(m);
            });
            const seen = new Set();
            candidates.forEach(m => {
                if (!m || seen.has(m)) return;
                seen.add(m);
                if (m.d) {
                    m.d.renderType = modelName;
                    m.d.Model_Render_Type = modelName;
                    m.d.p3m3ModelName = modelName;
                }
                m.p3m3CurrentModelName = modelName;
                m.p3m3PendingModelName = '';
                m.p3m3FullPowerAwakened = modelName === 'RENDER_KASIYAS_FULL_POWER';
            });
            rt.hiddenFullPowerModelApplied = true;
            return true;
        }
        return false;
    },

    applyCurrentDialogueLineEvent(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        const dlg = rt && rt.dialogue;
        if (!dlg || !dlg.active) return false;
        const idx = Math.max(0, parseInt(dlg.index, 10) || 0);
        if (dlg.lastLineEventIndex === idx) return false;
        dlg.lastLineEventIndex = idx;
        const line = dlg.lines && dlg.lines[idx];
        return this.applyDialogueLineEvent(gameState, line);
    },

    startDialogueByTrigger(gameState, triggerType, options = {}) {
        const first = this.findDialogueFirstLine(gameState, triggerType, options);
        if (!first) return false;
        return this.startDialogue(gameState, first.Dialogue_ID, {
            triggerType,
            triggerMonsterId: options.monsterId || first.Trigger_Monster_ID,
            routeId: options.routeId || first.Route_ID,
            areaId: options.areaId || first.Area_ID
        });
    },

    applyDialogueControl(gameState, line) {
        const p = gameState && gameState.player;
        if (!p || !line) return;
        if (this.bool(line.Lock_Player_Control)) {
            p.isRunning = false;
            p.runDirection = null;
            p.kbVx = 0;
            p.kbVy = 0;
            p.dashSpeedX = 0;
            p.dashSpeedY = 0;
            if (p.state === 'Walk' || p.state === 'Run' || p.state === 'Dash' || p.state === 'Atk' || p.state === 'Guard') p.state = 'Idle';
        }
    },

    startDialogue(gameState, dialogueId, options = {}) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.active) return false;
        const lines = this.getDialogueRows(gameState, dialogueId);
        if (!lines.length) return false;
        rt.dialogue = {
            active: true,
            dialogueId: this.id(dialogueId),
            lines,
            index: 0,
            timer: Math.max(0.15, this.num(lines[0].Display_Time, 3)),
            triggerType: this.id(options.triggerType || lines[0].Trigger_Type),
            triggerMonsterId: this.id(options.triggerMonsterId || lines[0].Trigger_Monster_ID),
            routeId: this.id(options.routeId || lines[0].Route_ID),
            areaId: this.id(options.areaId || lines[0].Area_ID),
            consumedKeys: { KeyX: false, Space: false },
            lastLineEventIndex: -1
        };
        if (gameState.keys) {
            gameState.keys.KeyX = false;
            gameState.keys.Space = false;
        }
        this.applyDialogueControl(gameState, lines[0]);
        this.applyCurrentDialogueLineEvent(gameState);
        return true;
    },

    getCurrentDialogueLine(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        const dlg = rt && rt.dialogue;
        if (!dlg || !dlg.active || !Array.isArray(dlg.lines)) return null;
        return dlg.lines[Math.max(0, Math.min(dlg.lines.length - 1, parseInt(dlg.index, 10) || 0))] || null;
    },

    updateDialogue(gameState, deltaTime) {
        const rt = gameState && gameState.p3m3Runtime;
        const dlg = rt && rt.dialogue;
        if (!dlg || !dlg.active) return false;
        const line = this.getCurrentDialogueLine(gameState);
        if (!line) {
            rt.dialogue = null;
            return false;
        }
        dlg.timer = Math.max(0, (parseFloat(dlg.timer) || 0) - deltaTime);
        if (dlg.timer <= 0 && !this.bool(line.Wait_Input)) this.advanceDialogue(gameState);
        return true;
    },

    handleDialogueKeyDown(gameState, event) {
        if (!this.isDialogueActive(gameState) || !event) return false;
        if (event.repeat) return event.code === 'KeyX' || event.code === 'Space';
        if (event.code !== 'KeyX' && event.code !== 'Space') return false;
        this.advanceDialogue(gameState);
        return true;
    },

    advanceDialogue(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        const dlg = rt && rt.dialogue;
        if (!dlg || !dlg.active) return false;
        if (dlg.index < dlg.lines.length - 1) {
            dlg.index += 1;
            const line = dlg.lines[dlg.index] || {};
            dlg.timer = Math.max(0.15, this.num(line.Display_Time, 3));
            this.applyDialogueControl(gameState, line);
            this.applyCurrentDialogueLineEvent(gameState);
            if (gameState.keys) {
                gameState.keys.KeyX = false;
                gameState.keys.Space = false;
            }
            return true;
        }
        return this.endDialogue(gameState);
    },

    endDialogue(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        const dlg = rt && rt.dialogue;
        if (!dlg) return false;
        const lastLine = Array.isArray(dlg.lines) && dlg.lines.length ? dlg.lines[dlg.lines.length - 1] : null;
        rt.dialogue = null;
        if (gameState.keys) {
            gameState.keys.KeyX = false;
            gameState.keys.Space = false;
        }
        this.processDialogueEndEvent(gameState, lastLine, dlg);
        return true;
    },

    processDialogueEndEvent(gameState, line, dialogue) {
        const eventType = this.id(line && line.End_Event_Type).toUpperCase();
        const eventValue = this.id(line && line.End_Event_Value);
        if (!eventType || eventType === 'NONE') return;

        if (eventType === 'USE_TRIGGER_MONSTER_TALK_RESULT') {
            const monsterKey = eventValue || this.id(dialogue && dialogue.triggerMonsterId);
            const row = this.getMonsterRow(gameState, monsterKey);
            const role = row ? this.id(row.Monster_Role) : '';
            if (role) this.markAreaClear(gameState, role, 'TALK_CLEAR');
            return;
        }

        if (eventType === 'START_HIDDEN_TRUE_BOSS_BATTLE') {
            this.startHiddenBattle(gameState, eventValue || 'DIALOGUE_END');
            return;
        }

        if (eventType === 'START_ROUTE_FINAL_ATTACK') {
            const rt = gameState && gameState.p3m3Runtime;
            if (rt && rt.route && rt.routeType === 'ROUTE_HIDDEN') {
                // 히든 루트 시작 대화 종료 시에는 즉시 최종 일섬으로 가지 않는다.
                // 전력 카시야스 전투를 시작하고, 본체 HP 자연 감소가 1%에 도달했을 때만 일섬에 진입한다.
                this.startHiddenBattle(gameState, 'DIALOGUE_END');
            } else if (rt && rt.route && !rt.finalPending && !rt.finalStarted) {
                this.armFinalAttack(gameState, 'DIALOGUE_END');
            }
            return;
        }

        if (eventType === 'PATTERN_END' || eventType === 'DUNGEON_CLEAR') {
            const rt = gameState && gameState.p3m3Runtime;
            const successType = this.id(rt && rt.route && rt.route.Success_Result_Type)
                || this.id(rt && rt.system && rt.system.Clear_Result_Type)
                || eventType;
            if (rt && rt.routeType === 'ROUTE_HIDDEN' && rt.hiddenWhiteBackdrop) {
                this.startHiddenClearReturn(gameState, successType);
            } else {
                this.executeResultType(gameState, successType, { fallbackSuccess: true, reason: eventType });
            }
            return;
        }

        if (eventType === 'RETURN_NORMAL_MAP') {
            this.executeResultType(gameState, eventType, { fallbackSuccess: false, reason: eventType });
        }
    },

    getSystem(gameState) {
        return (gameState.DB_P3_M3_SYSTEM || [])[0] || {};
    },

    getArea(gameState, areaId) {
        const key = this.id(areaId);
        return (gameState.DB_P3_M3_AREA || []).find(row => this.id(row.Area_ID) === key) || null;
    },

    getMonsterRow(gameState, roleOrId) {
        const key = this.id(roleOrId);
        return (gameState.DB_P3_M3_MONSTER || []).find(row => (
            this.id(row.P3_M3_Monster_ID) === key ||
            this.id(row.Monster_Role).toUpperCase() === key.toUpperCase()
        )) || null;
    },

    getRoute(gameState, type) {
        const key = this.id(type).toUpperCase();
        return (gameState.DB_P3_M3_ROUTE || []).find(row => this.id(row.Route_Type).toUpperCase() === key) || null;
    },

    getRouteById(gameState, routeId) {
        const key = this.id(routeId);
        return (gameState.DB_P3_M3_ROUTE || []).find(row => this.id(row.Route_ID) === key) || null;
    },

    getPatternRow(gameState, patternId) {
        const key = this.id(patternId);
        if (!key) return null;
        if (gameState.DB_BOSS_PATTERN && gameState.DB_BOSS_PATTERN[key]) return gameState.DB_BOSS_PATTERN[key];
        const sets = gameState.DB_BOSS_PATTERN_BY_SET || {};
        for (const rows of Object.values(sets)) {
            const found = (rows || []).find(row => this.id(row && row.Pattern_ID) === key);
            if (found) return found;
        }
        return null;
    },

    getPatternHpRate(gameState, patternId, fallback = 0.1) {
        const row = this.getPatternRow(gameState, patternId);
        const percent = this.num(row && row.Pattern_Cond_Value, fallback * 100);
        return Math.max(0.001, Math.min(1, percent / 100));
    },

    normalizeAreaResult(value) {
        const raw = this.id(value).toUpperCase();
        if (!raw) return '';
        if (raw === 'ANY_CLEAR') return 'ANY_CLEAR';
        if (raw.includes('TALK_CLEAR')) return 'TALK_CLEAR';
        if (raw.includes('KILL_CLEAR')) return 'KILL_CLEAR';
        return raw;
    },

    resultMatches(actual, actualData, required) {
        const req = this.normalizeAreaResult(required);
        if (!req) return true;
        const cur = this.normalizeAreaResult(actual);
        const raw = this.id(actualData).toUpperCase();
        if (req === 'ANY_CLEAR') return !!cur;
        return cur === req || raw === this.id(required).toUpperCase();
    },

    routeMatches(gameState, route) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !route) return false;
        const requiredArea = this.id(route.Required_Area_ID);
        const areaMatch = !requiredArea || requiredArea === this.id(rt.currentAreaId);
        const leftMatch = this.resultMatches(rt.leftResult, rt.leftResultData, route.Required_Left_Result);
        const rightMatch = this.resultMatches(rt.rightResult, rt.rightResultData, route.Required_Right_Result);
        const cond = this.id(route.Result_Cond_Type).toUpperCase();
        const bothTalk = this.normalizeAreaResult(rt.leftResult) === 'TALK_CLEAR' && this.normalizeAreaResult(rt.rightResult) === 'TALK_CLEAR';
        if (cond === 'BOTH_TALK') return areaMatch && bothTalk && leftMatch && rightMatch;
        if (cond === 'NOT_BOTH_TALK') return areaMatch && !!rt.leftResult && !!rt.rightResult && !bothTalk && leftMatch && rightMatch;
        if (cond === 'MATCH_ANY') return areaMatch && (leftMatch || rightMatch);
        return areaMatch && leftMatch && rightMatch;
    },

    findMatchingRoute(gameState) {
        return (gameState.DB_P3_M3_ROUTE || []).find(route => this.routeMatches(gameState, route)) || null;
    },

    getGaugeType(rt) {
        return this.id(rt && rt.route && rt.route.Gauge_Type).toUpperCase();
    },

    getFinalResponseType(rt) {
        return this.id(rt && rt.route && rt.route.Final_Response_Type).toUpperCase();
    },

    checkFinalAttackStartCondition(gameState, route) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !route) return false;
        const cond = this.id(route.Final_Attack_Start_Cond_Type).toUpperCase();
        const value = this.num(route.Final_Attack_Start_Cond_Value, 0);
        if (cond === 'LEFT_AND_RIGHT_CLEAR_AND_CENTER_RETURN') {
            const centerId = this.id((rt.system || this.getSystem(gameState)).Center_Area_ID || 902001);
            return !!rt.leftResult && !!rt.rightResult && !!rt.centerAreaReturned && this.id(rt.currentAreaId) === centerId;
        }
        if (cond === 'MAIN_BOSS_HP_UNDER' || cond === 'BOSS_HP_UNDER') {
            const main = rt.linkedBoss;
            return !!main && (main.hp / Math.max(1, main.maxHp || 1)) <= Math.max(0, value);
        }
        if (cond === 'GAUGE_FULL') return (rt.gauge || 0) >= (rt.gaugeMax || 100);
        if (!cond || cond === 'NONE') return true;
        // 미지원 조건은 기존 루트별 판정을 fallback으로 유지한다.
        if (rt.routeType === 'ROUTE_HIDDEN') {
            const main = rt.linkedBoss;
            return !!main && (main.hp / Math.max(1, main.maxHp || 1)) <= Math.max(0.001, value || 0.01);
        }
        return !!rt.leftResult && !!rt.rightResult;
    },

    executeResultType(gameState, resultType, options = {}) {
        const type = this.id(resultType).toUpperCase();
        const rt = gameState && gameState.p3m3Runtime;
        if (type === 'DUNGEON_CLEAR' || type === 'PATTERN_END') {
            this.finish(gameState, true, options.reason || type, options);
            return true;
        }
        if (type === 'RETURN_NORMAL_MAP') {
            this.finish(gameState, false, options.reason || type, options);
            return true;
        }
        if (type === 'REVIVE_AND_CONTINUE') {
            return this.prepareReviveAndContinue(gameState, options);
        }
        if (type === 'FINAL_ATTACK_HIT_AND_RETURN_NORMAL_MAP') {
            // 마지막 일섬 액션이 이미 실제로 재생된 뒤의 실패 판정이라면 피해를 중복 적용하지 않는다.
            if (options.damageAlreadyApplied || (rt && (rt.finalStarted || rt.finalResolving) && !options.forceFailureSequence)) {
                const preservePlayerDeath = !!(options.preservePlayerDeath || (gameState.player && gameState.player.hp <= 0));
                this.finish(gameState, false, options.reason || type, { ...options, preservePlayerDeath });
                return true;
            }
            return this.startFailureFinalAttack(gameState, options.reason || type, options);
        }
        if (type === 'PATTERN_RESTART' || type === 'RESTART_PATTERN') {
            return this.restartPattern(gameState, options.reason || type);
        }
        this.finish(gameState, !!options.fallbackSuccess, options.reason || type || 'FALLBACK_RESULT', options);
        return true;
    },

    executeRouteFinalResult(gameState, success, reason = '') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt) return false;
        const system = rt.system || this.getSystem(gameState);
        const type = success
            ? this.id(rt.route && rt.route.Success_Result_Type) || this.id(system.Clear_Result_Type) || 'DUNGEON_CLEAR'
            : this.id(rt.route && rt.route.Fail_Result_Type) || 'RETURN_NORMAL_MAP';
        return this.executeResultType(gameState, type, {
            fallbackSuccess: !!success,
            reason: reason || type,
            damageAlreadyApplied: !success && !!(rt.finalStarted || rt.finalResolving),
            preservePlayerDeath: !success && !!(gameState.player && gameState.player.hp <= 0)
        });
    },

    prepareReviveAndContinue(gameState, options = {}) {
        const rt = gameState && gameState.p3m3Runtime;
        const p = gameState && gameState.player;
        if (!rt || !rt.active || !p) return false;
        if (!rt.playerDeathPending) {
            rt.playerDeathPending = true;
            rt.playerDeathReviveX = parseFloat(p.x) || 0;
            rt.playerDeathReviveY = parseFloat(p.y) || 0;
            rt.playerDeathReviveAreaId = this.id(rt.currentAreaId);
            p.p3m3ReviveX = rt.playerDeathReviveX;
            p.p3m3ReviveY = rt.playerDeathReviveY;
            p.p3m3ReviveAreaId = rt.playerDeathReviveAreaId;

            const combatMonster = options.combatMonster || (gameState.monsters || []).find(m => (
                m && m.active && m.isP3M3Monster && !m.p3m3TalkStandby &&
                this.id(m.p3m3Row && m.p3m3Row.Area_ID) === this.id(rt.currentAreaId)
            ));
            if (combatMonster) this.cleanupP3M3MonsterObjects(gameState, combatMonster.p3m3Role, combatMonster);
            gameState.hitboxes = [];
        }
        return true;
    },

    resolveFailureRoute(gameState, options = {}) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt) return null;
        if (options.route) return options.route;
        if (rt.route) return rt.route;
        const system = rt.system || this.getSystem(gameState);
        return this.getRouteById(gameState, system.Time_Limit_Fail_Route_ID) || this.getRoute(gameState, 'ROUTE_NORMAL');
    },

    getFailureAttackDamage(gameState, route, attackAction) {
        const rt = gameState && gameState.p3m3Runtime;
        const p = gameState && gameState.player;
        if (!rt || !p || !route || !attackAction) return 0;
        const casterId = this.id(route.Final_Attack_Caster_Monster_ID);
        const caster = (gameState.monsters || []).find(m => m && m.active && m.isP3M3Monster && this.id(m.p3m3Row && m.p3m3Row.P3_M3_Monster_ID) === casterId);
        const row = this.getMonsterRow(gameState, casterId) || {};
        const baseData = (gameState.DB_MONSTER || {})[this.id(row.Boss_Info_Ref_ID)] || {};
        const baseAtk = Math.max(1, this.num(caster && caster.d && caster.d.atk, this.num(baseData.atk || baseData.ATK, 1)));
        const mainBoss = (gameState.monsters || []).find(m => m && m.boss) || null;
        const baseRate = this.num(attackAction.ATK_Damage_Rate, 1);
        const lateRateRaw = this.num(attackAction.Late_Phase_ATK_Damage_Rate, NaN);
        const rate = Math.max(0, mainBoss && mainBoss.boss && mainBoss.boss.isLatePhase && Number.isFinite(lateRateRaw) && lateRateRaw > 0 ? lateRateRaw : baseRate);
        const level = Math.max(1, this.num(caster && caster.d && caster.d.level, this.num(baseData.level || baseData.Level, 1)));
        const raw = baseAtk * rate;
        return typeof calcScaledDamage === 'function' ? calcScaledDamage(level, p.level || 1, raw) : raw;
    },

    applyFailureFinalAttackDamage(gameState, route, attackAction) {
        const rt = gameState && gameState.p3m3Runtime;
        const p = gameState && gameState.player;
        if (!rt || !p || p.hp <= 0 || !route || !attackAction) return false;
        const damage = this.getFailureAttackDamage(gameState, route, attackAction);
        if (damage <= 0 || typeof PlayerManager === 'undefined' || !PlayerManager.takeDamage) return false;
        const srcX = Math.max(0, (gameState.WORLD_WIDTH || 1400) / 2);
        const srcY = Math.max(0, (gameState.WORLD_DEPTH || 400) / 2);
        PlayerManager.takeDamage(gameState, damage, srcX, srcY, null, 0, 0, {
            canGuard: false,
            guardResult: '',
            attackType: attackAction.Action_Attack_Type || attackAction.Action_Type || 'ATK_SLASH',
            sourcePatternId: this.id(rt.patternId),
            sourceActionId: this.id(attackAction.Action_ID),
            makeKnockback: false,
            knockbackCanGuard: false,
            knockbackDistance: 0,
            makeHitAction: !(attackAction.ATK_Make_Hit_Action === false || String(attackAction.ATK_Make_Hit_Action || '').trim().toLowerCase() === 'false')
        });
        return true;
    },

    startFailureFinalAttack(gameState, reason = '', options = {}) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.active || rt.failureSequence) return false;
        const route = this.resolveFailureRoute(gameState, options);
        if (!route) {
            this.finish(gameState, false, reason || 'FINAL_ATTACK_FAIL_FALLBACK');
            return true;
        }
        const charge = this.getAction(gameState, route.Final_Attack_Charge_Action_ID);
        const atk = this.getAction(gameState, route.Final_Attack_ATK_Action_ID);
        if (!atk) {
            this.finish(gameState, false, reason || 'FINAL_ATTACK_FAIL_NO_ACTION');
            return true;
        }
        const system = rt.system || this.getSystem(gameState);
        const centerId = this.id(system.Center_Area_ID || 902001);
        const remote = this.id(rt.currentAreaId) !== centerId;
        const chargeDuration = remote ? 0 : Math.max(0, this.num(charge && charge.Action_Anim_Duration, 0));
        const attackDuration = Math.max(0.2, this.num(atk.Action_Anim_Duration, 2));
        const hitStart = Math.max(0.05, this.num(atk.Hitbox_Start_Time, attackDuration * 0.62));
        const hitEnd = Math.max(hitStart + 0.05, this.num(atk.Hitbox_End_Time, attackDuration));
        const leadDuration = remote ? 0.8 : 0;
        const afterDuration = 1.1;

        rt.failureSequence = {
            active: true,
            reason: reason || 'FINAL_ATTACK_FAIL',
            route,
            remote,
            leadDuration,
            elapsed: 0,
            hitApplied: false,
            playCasterAction: !remote,
            damageHandledByAction: false,
            finishDelay: leadDuration + chargeDuration + attackDuration + afterDuration
        };
        rt.route = route;
        rt.routeType = this.id(route.Route_Type).toUpperCase() || 'ROUTE_NORMAL';
        rt.finalPending = false;
        rt.finalStarted = true;
        rt.finalResolving = false;
        rt.finalSuccess = false;
        rt.finalFailed = false;
        rt.finalEffectSuppressed = false;
        rt.finalCollapse = null;
        rt.finalChargeActionId = this.id(charge && charge.Action_ID);
        rt.finalAttackActionId = this.id(atk.Action_ID);
        rt.finalChargeDuration = chargeDuration;
        rt.finalAttackDuration = attackDuration;
        rt.finalAttackHitStartLocal = hitStart;
        rt.finalAttackHitEndLocal = hitEnd;
        rt.finalTimelineHitStart = chargeDuration + hitStart;
        rt.finalTimelineHitEnd = chargeDuration + hitEnd;
        rt.finalTimelineElapsed = 0;
        rt.finalSlashScarShown = false;
        rt.finalShatterDamageStarted = false;
        rt.finalIssenDeathPending = false;

        const p = gameState.player;
        if (p) this.placePlayer(gameState, p.x, p.y, { forceIdle: true, clearKeys: true });
        gameState.hitboxes = [];
        (gameState.monsters || []).forEach(m => {
            if (!m || !m.isP3M3Monster) return;
            this.cleanupP3M3MonsterObjects(gameState, m.p3m3Role, m);
        });
        gameState.bossAttackObjects = (gameState.bossAttackObjects || []).filter(obj => !(obj && (obj.p3m3 || obj.p3m3Terrain)));
        (gameState.monsters || []).forEach(m => {
            if (!m || !m.isP3M3Monster) return;
            m.kbVx = 0;
            m.kbVy = 0;
            if (m.boss) {
                m.boss.noPatternWaitTimer = 999999;
                m.boss.action = null;
                m.boss.activePattern = null;
                m.boss.runtimeActions = null;
            }
        });

        if (!remote) {
            const casterId = this.id(route.Final_Attack_Caster_Monster_ID);
            let caster = (gameState.monsters || []).find(m => m && m.active && m.isP3M3Monster && this.id(m.p3m3Row && m.p3m3Row.P3_M3_Monster_ID) === casterId);
            if (!caster) caster = this.spawnMonsterByRole(gameState, this.id(route.Route_Type).toUpperCase() === 'ROUTE_HIDDEN' ? 'TRUE_BOSS' : 'CENTER_BOSS');
            if (caster && caster.boss) {
                caster.p3m3Static = false;
                caster.p3m3TalkStandby = false;
                caster.boss.noPatternWaitTimer = 0;
                const forcedCharge = charge ? { ...charge, Action_Order: 1, Action_Condition_Type: 'NONE' } : null;
                const forcedAttack = {
                    ...atk,
                    Action_Order: forcedCharge ? 2 : 1,
                    Action_Condition_Type: 'NONE',
                    Hitbox_Type: null,
                    ATK_Can_Guard: false,
                    Parry_Enable: false,
                    Required_Response_Type: null
                };
                const actions = forcedCharge ? [forcedCharge, forcedAttack] : [forcedAttack];
                MonsterManager.startBossPattern(caster, {
                    Pattern_ID: `P3_M3_FAILURE_${this.id(route.Route_ID)}`,
                    Pattern_Name: (this.getPatternRow(gameState, rt.patternId) || {}).Pattern_Name || '세계를 가르는 일섬',
                    Pattern_Cooldown: 0,
                    Pattern_Repeat: false,
                    Runtime_Actions: actions
                }, gameState);
            } else {
                rt.failureSequence.remote = true;
                rt.failureSequence.playCasterAction = false;
                rt.failureSequence.damageHandledByAction = false;
                rt.failureSequence.leadDuration = 0.8;
                rt.failureSequence.finishDelay = 0.8 + attackDuration + afterDuration;
                rt.finalChargeDuration = 0;
                rt.finalTimelineHitStart = hitStart;
                rt.finalTimelineHitEnd = hitEnd;
            }
        }
        return true;
    },

    updateFailureFinalAttack(gameState, deltaTime) {
        const rt = gameState && gameState.p3m3Runtime;
        const seq = rt && rt.failureSequence;
        if (!rt || !seq || !seq.active) return false;
        const dt = Math.max(0, this.num(deltaTime, 0));
        seq.elapsed += dt;
        const p = gameState.player;
        if (p) {
            p.isRunning = false;
            p.runDirection = null;
            p.kbVx = 0;
            p.kbVy = 0;
            p.dashSpeedX = 0;
            p.dashSpeedY = 0;
            if (p.hp > 0 && p.state !== 'Die' && p.state !== 'Hit') p.state = 'Idle';
            if (p.hp <= 0) {
                const go = document.getElementById('gameOverScreen');
                if (go) go.style.display = 'none';
            }
        }
        if (gameState.keys) ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyX','KeyZ','KeyC','KeyD','KeyA','KeyS','Space'].forEach(key => { gameState.keys[key] = false; });

        const localElapsed = Math.max(0, seq.elapsed - Math.max(0, seq.leadDuration || 0));
        if (seq.remote) rt.finalTimelineElapsed = localElapsed;
        else this.updateFinalTimeline(gameState, dt);

        const hitAt = Math.max(0, (rt.finalChargeDuration || 0) + (rt.finalAttackHitStartLocal || 0));
        if (!seq.hitApplied && localElapsed >= hitAt) {
            seq.hitApplied = true;
            if (!seq.damageHandledByAction) this.applyFailureFinalAttackDamage(gameState, seq.route, this.getAction(gameState, seq.route.Final_Attack_ATK_Action_ID));
            try {
                if (gameState.camera) {
                    gameState.camera.shakeTime = Math.max(gameState.camera.shakeTime || 0, 0.55);
                    gameState.camera.shakeIntensity = Math.max(gameState.camera.shakeIntensity || 0, 13);
                }
                gameState.screenHitFlash = { life: 0.22, maxLife: 0.22, strength: 0.9, mode: 'fullwhite' };
            } catch (e) {}
        }

        if (seq.elapsed >= Math.max(0.3, seq.finishDelay || 0.3)) {
            seq.active = false;
            const preservePlayerDeath = !!(gameState.player && gameState.player.hp <= 0);
            this.finish(gameState, false, seq.reason || 'FINAL_ATTACK_FAIL', { preservePlayerDeath });
        } else {
            this.updateTargetUI(gameState);
            this.refreshDebugSnapshot(gameState, dt);
        }
        return true;
    },

    getAction(gameState, actionId) {
        return gameState.DB_BOSS_PATTERN_ACTION ? gameState.DB_BOSS_PATTERN_ACTION[this.id(actionId)] : null;
    },

    getMainBoss(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (rt && rt.linkedBoss && rt.linkedBoss.active) return rt.linkedBoss;
        return (gameState.monsters || []).find(m => m && m.active && m.isStageBoss && m.boss) ||
            (gameState.bossBattle && gameState.bossBattle.boss) ||
            null;
    },

    getAreaWorldSize(gameState, areaId, fallbackW = 1400, fallbackD = 400) {
        const area = this.getArea(gameState, areaId) || {};
        const system = this.getSystem(gameState) || {};
        return {
            w: Math.max(1, this.num(area.World_Width, this.num(system.Map_Size_X, fallbackW)) || fallbackW),
            d: Math.max(1, this.num(area.World_Depth, this.num(system.Map_Size_Y, fallbackD)) || fallbackD)
        };
    },

    applyAreaWorldSize(gameState, areaId) {
        if (!gameState) return { w: 1400, d: 400 };
        const size = this.getAreaWorldSize(gameState, areaId, gameState.WORLD_WIDTH || 1400, gameState.WORLD_DEPTH || 400);
        gameState.WORLD_WIDTH = size.w;
        gameState.WORLD_DEPTH = size.d;
        return size;
    },

    getEntityP3M3Role(entity) {
        if (!entity) return '';
        return this.id(entity.p3m3Role || (entity.owner && entity.owner.p3m3Role) || (entity.sourceCaster && entity.sourceCaster.p3m3Role)).toUpperCase();
    },

    cleanupP3M3MonsterObjects(gameState, role, monster = null) {
        const roleKey = this.id(role).toUpperCase();
        if (!gameState || !roleKey) return;
        const ownedByRole = (entity) => {
            if (!entity) return false;
            if (monster && entity === monster) return true;
            return this.getEntityP3M3Role(entity) === roleKey;
        };
        const shouldRemoveObject = (obj) => {
            if (!obj) return false;
            if (this.id(obj.p3m3TerrainRole).toUpperCase() === roleKey) return true;
            return ownedByRole(obj.owner) || ownedByRole(obj.sourceCaster);
        };

        if (Array.isArray(gameState.bossAttackObjects)) {
            gameState.bossAttackObjects.forEach(obj => {
                if (shouldRemoveObject(obj)) obj.active = false;
            });
            gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => obj && obj.active);
        }

        if (Array.isArray(gameState.hitboxes)) {
            gameState.hitboxes = gameState.hitboxes.filter(hitbox => {
                const source = hitbox && hitbox.sourceObject;
                if (!source) return true;
                return !shouldRemoveObject(source);
            });
        }
    },

    startFromPattern(gameState, bossMonster, options = {}) {
        if (!gameState || !bossMonster || this.isActive(gameState)) return false;

        const system = this.getSystem(gameState);
        const centerAreaId = this.id(system.Center_Area_ID || 902001);
        const centerSize = this.getAreaWorldSize(gameState, centerAreaId, 1400, 400);
        const worldW = centerSize.w;
        const worldD = centerSize.d;
        const player = gameState.player || null;

        const snapshot = {
            worldW: gameState.WORLD_WIDTH,
            worldD: gameState.WORLD_DEPTH,
            stageId: gameState.currentStageId,
            stage: gameState.currentStage,
            playerX: player ? player.x : 300,
            playerY: player ? player.y : worldD / 2,
            bossX: bossMonster.x,
            bossY: bossMonster.y
        };

        gameState.specialMode = this.MODE;
        gameState.p3m3Runtime = {
            active: true,
            patternId: this.id(options.patternId || system.Pattern_ID || 233008),
            sourceActionId: this.id(options.sourceActionId || ''),
            introTotalDuration: Math.max(0.6, this.num(options.introDuration, 4.03)),
            system,
            snapshot,
            linkedBoss: bossMonster,
            currentAreaId: centerAreaId,
            centerAreaReturned: false,
            leftResult: null,
            rightResult: null,
            route: null,
            routeType: null,
            routeStarted: false,
            routeDelayTimer: 0,
            finalPending: false,
            finalStartDelayTimer: 0,
            finalStartDelayTotal: 0,
            finalStarted: false,
            finalResolving: false,
            finalResolveTimer: 0,
            finalResolveSuccess: false,
            finalResolveReason: '',
            finalChargeActionId: '',
            finalAttackActionId: '',
            finalChargeDuration: 0,
            finalAttackDuration: 0,
            finalTimelineElapsed: 0,
            finalTimelineHitStart: 0,
            finalTimelineHitEnd: 0,
            finalAttackHitStartLocal: 0,
            finalAttackHitEndLocal: 0,
            finalSlashScarShown: false,
            finalShatterDamageStarted: false,
            finalCollapse: null,
            finalEffectSuppressed: false,
            finalIssenDeathPending: false,
            failureSequence: null,
            playerDeathPending: false,
            playerDeathReviveX: null,
            playerDeathReviveY: null,
            playerDeathReviveAreaId: null,
            finalSuccess: false,
            finalFailed: false,
            gauge: 0,
            gaugeMax: 100,
            timeLimitTotal: Math.max(1, this.num(system.Time_Limit, 120)),
            timer: Math.max(1, this.num(system.Time_Limit, 120)),
            monstersByRole: {},
            debugFrame: 0,
            debugSnapshot: [],
            debugLastByKey: {},
            suppressMainBoss: system.Boss_Invincible === undefined ? true : this.bool(system.Boss_Invincible),
            worldMode: this.id(system.World_Mode || 'INVERTED_BLACK_WHITE').toUpperCase(),
            clearStates: {},
            portalCooldown: 0.35,
            noticeTimer: 0,
            dialogue: null,
            hiddenClearDialogueShown: false,
            hiddenBattleStarted: false,
            hiddenWhiteBackdrop: false,
            hiddenClearReturn: null,
            hiddenClearFinalFaceDir: null,
            hiddenFinalPhase: 'NONE',
            hiddenFinalReason: '',
            hiddenFinalCenterMove: null,
            trueBossDrainTimer: 0,
            intro: {
                active: true,
                phase: 'ALIGN',
                timer: 0,
                phaseTimer: 0,
                total: 0,
                innerWorldVisible: false,
                shatterFired: false,
                slashProgress: 0,
                actor: null
            }
        };

        const entryHpRate = this.getPatternHpRate(gameState, gameState.p3m3Runtime.patternId, 0.1);
        bossMonster.hp = Math.max(1, (bossMonster.maxHp || bossMonster.hp || 1) * entryHpRate);
        gameState.WORLD_WIDTH = worldW;
        gameState.WORLD_DEPTH = worldD;
        gameState.p2m3IntroRuntime = null;
        gameState.p2m2GiantSwordAim = null;
        gameState.p2m2GiantSwordInputConsumed = null;
        gameState.p2m2GiantSwordInputBlockTimer = 0;
        if (player) this.placePlayer(gameState, Math.max(120, worldW * 0.24), worldD / 2, { forceIdle: true, clearKeys: true });

        bossMonster.p3m3MainBossSuppressed = !!gameState.p3m3Runtime.suppressMainBoss;
        bossMonster.x = worldW / 2;
        bossMonster.y = worldD / 2;
        bossMonster.z = 0;
        bossMonster.kbVx = 0;
        bossMonster.kbVy = 0;
        bossMonster.isProvoked = false;
        if (bossMonster.boss) {
            bossMonster.boss.activePattern = null;
            bossMonster.boss.action = null;
            bossMonster.boss.runtimeActions = null;
            bossMonster.boss.currentActionIndex = -1;
            bossMonster.boss.actionHitFired = false;
            bossMonster.boss.actionHitsDone = 0;
            bossMonster.boss.actionCycleTimer = 0;
            bossMonster.boss.parryWindowActive = false;
            bossMonster.boss.parryCueTimer = 0;
            if (gameState.p3m3Runtime.suppressMainBoss) bossMonster.boss.noPatternWaitTimer = 999999;
        }

        this.cleanupP3Monsters(gameState);
        this.enterArea(gameState, centerAreaId, { spawnCenter: true });
        this.setupIntroSequence(gameState);
        return true;
    },

    getIntroDurations(totalDuration) {
        const base = { align: 0.38, walk: 1.55, slash: 0.48, shatter: 0.82, flash: 0.28, blackout: 0.52 };
        const baseTotal = base.align + base.walk + base.slash + base.shatter + base.flash + base.blackout;
        const total = Math.max(0.6, parseFloat(totalDuration) || baseTotal);
        const scale = total / baseTotal;
        return {
            total,
            align: Math.max(0.08, base.align * scale),
            walk: Math.max(0.18, base.walk * scale),
            slash: Math.max(0.08, base.slash * scale),
            shatter: Math.max(0.12, base.shatter * scale),
            flash: Math.max(0.06, base.flash * scale),
            blackout: Math.max(0.08, base.blackout * scale)
        };
    },

    setupIntroSequence(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt) return false;
        const worldW = Math.max(1, gameState.WORLD_WIDTH || 1400);
        const worldD = Math.max(1, gameState.WORLD_DEPTH || 400);
        const player = gameState.player || null;
        const centerBoss = rt.monstersByRole && rt.monstersByRole.CENTER_BOSS;
        const y = Math.max(0, Math.min(worldD, worldD * 0.52));
        const startPlayerX = Math.max(90, Math.min(worldW - 90, worldW * 0.23));
        const startBossX = Math.max(90, Math.min(worldW - 90, worldW * 0.77));
        const endPlayerX = Math.max(90, Math.min(worldW - 90, worldW * 0.44));
        const endBossX = Math.max(90, Math.min(worldW - 90, worldW * 0.56));
        if (player) {
            this.placePlayer(gameState, startPlayerX, y, { forceIdle: true, clearKeys: true });
            player.faceDir = 1;
        }
        if (centerBoss) {
            centerBoss.x = startBossX;
            centerBoss.y = y;
            centerBoss.z = 0;
            centerBoss.vz = 0;
            centerBoss.kbVx = 0;
            centerBoss.kbVy = 0;
            centerBoss.faceDir = -1;
            centerBoss.pacingDir = -1;
            centerBoss.state = 'IDLE';
            centerBoss.p3m3Static = true;
            centerBoss.p3m3IntroActor = true;
            if (centerBoss.boss) {
                centerBoss.boss.noPatternWaitTimer = 999999;
                centerBoss.boss.action = null;
                centerBoss.boss.activePattern = null;
                centerBoss.boss.runtimeActions = null;
                centerBoss.boss.currentActionIndex = -1;
            }
        }
        const durations = this.getIntroDurations(rt.introTotalDuration || 4.03);
        rt.intro = {
            active: true,
            phase: 'ALIGN',
            timer: 0,
            phaseTimer: 0,
            total: durations.total,
            durations,
            innerWorldVisible: false,
            shatterFired: false,
            slashProgress: 0,
            actor: {
                y,
                startPlayerX,
                startBossX,
                endPlayerX,
                endBossX,
                playerX: startPlayerX,
                bossX: startBossX
            }
        };
        rt.portalCooldown = 999999;
        return true;
    },

    forceIntroActors(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        const intro = rt && rt.intro;
        if (!intro || !intro.active) return;
        const actor = intro.actor || {};
        const player = gameState.player || null;
        const boss = rt.monstersByRole && rt.monstersByRole.CENTER_BOSS;
        const px = this.num(actor.playerX, actor.startPlayerX || 300);
        const bx = this.num(actor.bossX, actor.startBossX || 1000);
        const y = this.num(actor.y, (gameState.WORLD_DEPTH || 400) / 2);
        if (player) {
            this.placePlayer(gameState, px, y, { forceIdle: true, clearKeys: true });
            player.faceDir = 1;
            player.state = 'Idle';
        }
        if (boss) {
            boss.x = bx;
            boss.y = y;
            boss.z = 0;
            boss.vz = 0;
            boss.kbVx = 0;
            boss.kbVy = 0;
            boss.faceDir = -1;
            boss.pacingDir = -1;
            boss.state = 'IDLE';
            boss.p3m3Static = true;
            if (boss.boss) {
                boss.boss.noPatternWaitTimer = 999999;
                const phase = this.id(intro.phase).toUpperCase();
                const d = intro.durations || {};
                if (phase === 'SLASH_READY' || phase === 'SHATTER') {
                    const slashDur = Math.max(0.12, (parseFloat(d.slash) || 0.48) + (parseFloat(d.shatter) || 0.82));
                    boss.boss.action = {
                        Action_ID: 'P3_M3_INTRO_DIAGONAL_SLASH',
                        Action_Name: '페이즈3_대형패턴3_진입_대각선 베기',
                        Action_Type: 'ATK',
                        Action_Pose_Type: 'POSE_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH',
                        VFX_Type: 'EFT_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH',
                        Action_Anim_Duration: slashDur
                    };
                    boss.timer = phase === 'SLASH_READY'
                        ? Math.max(0, parseFloat(intro.phaseTimer) || 0)
                        : Math.max(0, parseFloat(d.slash) || 0.48) + Math.max(0, parseFloat(intro.phaseTimer) || 0);
                } else {
                    boss.boss.action = null;
                }
                boss.boss.activePattern = null;
                boss.boss.runtimeActions = null;
                boss.boss.currentActionIndex = -1;
            }
        }
    },

    updateIntroSequence(gameState, deltaTime) {
        const rt = gameState && gameState.p3m3Runtime;
        const intro = rt && rt.intro;
        if (!intro || !intro.active) return false;
        const dt = Math.max(0, parseFloat(deltaTime) || 0);
        intro.timer = (parseFloat(intro.timer) || 0) + dt;
        intro.phaseTimer = (parseFloat(intro.phaseTimer) || 0) + dt;
        const actor = intro.actor || (intro.actor = {});
        const setPhase = (phase) => {
            intro.phase = phase;
            intro.phaseTimer = 0;
            if (phase === 'SHATTER') {
                intro.shatterFired = true;
                try { gameState.camera.shakeTime = Math.max(gameState.camera.shakeTime || 0, 0.45); gameState.camera.shakeIntensity = Math.max(gameState.camera.shakeIntensity || 0, 9); } catch (e) {}
            }
            if (phase === 'FLASH') {
                intro.innerWorldVisible = true;
                gameState.screenHitFlash = { life: Math.max(0.12, durations.flash), maxLife: Math.max(0.12, durations.flash), strength: 1.0, mode: 'fullwhite' };
            }
        };
        const phase = this.id(intro.phase).toUpperCase();
        const durations = intro.durations || this.getIntroDurations(intro.total || rt.introTotalDuration || 4.03);
        const centerBoss = rt.monstersByRole && rt.monstersByRole.CENTER_BOSS;
        if (phase === 'ALIGN') {
            actor.playerX = actor.startPlayerX;
            actor.bossX = actor.startBossX;
            if (intro.phaseTimer >= durations.align) setPhase('WALK_CENTER');
        } else if (phase === 'WALK_CENTER') {
            const dur = durations.walk;
            const k = Math.max(0, Math.min(1, intro.phaseTimer / dur));
            const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
            actor.playerX = this.num(actor.startPlayerX, 0) + (this.num(actor.endPlayerX, 0) - this.num(actor.startPlayerX, 0)) * ease;
            actor.bossX = this.num(actor.startBossX, 0) + (this.num(actor.endBossX, 0) - this.num(actor.startBossX, 0)) * ease;
            if (centerBoss) centerBoss.state = 'Walk';
            if (gameState.player) gameState.player.state = 'Walk';
            if (k >= 1) setPhase('SLASH_READY');
        } else if (phase === 'SLASH_READY') {
            actor.playerX = actor.endPlayerX;
            actor.bossX = actor.endBossX;
            intro.slashProgress = Math.max(0, Math.min(1, intro.phaseTimer / durations.slash));
            if (centerBoss) centerBoss.state = 'IDLE';
            if (intro.phaseTimer >= durations.slash) setPhase('SHATTER');
        } else if (phase === 'SHATTER') {
            actor.playerX = actor.endPlayerX;
            actor.bossX = actor.endBossX;
            intro.slashProgress = 1;
            if (intro.phaseTimer >= durations.shatter) setPhase('FLASH');
        } else if (phase === 'FLASH') {
            actor.playerX = actor.endPlayerX;
            actor.bossX = actor.endBossX;
            if (intro.phaseTimer >= durations.flash) setPhase('BLACKOUT');
        } else if (phase === 'BLACKOUT') {
            actor.playerX = actor.endPlayerX;
            actor.bossX = actor.endBossX;
            if (intro.phaseTimer >= durations.blackout) {
                intro.active = false;
                intro.phase = 'DONE';
                intro.innerWorldVisible = true;
                rt.portalCooldown = 0.35;
                const p = gameState.player || null;
                if (p) this.placePlayer(gameState, actor.endPlayerX, actor.y, { forceIdle: true, clearKeys: true });
                if (centerBoss) {
                    centerBoss.x = actor.endBossX;
                    centerBoss.y = actor.y;
                    centerBoss.state = 'IDLE';
                    centerBoss.p3m3Static = true;
                }
                this.updateTargetUI(gameState);
                this.refreshDebugSnapshot(gameState, 0);
                return true;
            }
        }
        this.forceIntroActors(gameState);
        this.updateTargetUI(gameState);
        this.refreshDebugSnapshot(gameState, 0);
        return true;
    },

    cleanupP3Monsters(gameState) {
        (gameState.monsters || []).forEach(m => {
            if (m && m.isP3M3Monster) m.active = false;
        });
        gameState.monsters = (gameState.monsters || []).filter(m => !(m && m.isP3M3Monster));
    },

    placePlayer(gameState, x, y, options = {}) {
        const p = gameState.player;
        if (!p) return;
        const body = Math.max(20, (p.bodyX || 60) * (p.scale || 1) * 0.5);
        p.x = Math.max(body, Math.min((gameState.WORLD_WIDTH || 1400) - body, this.num(x, p.x || 300)));
        p.y = Math.max(0, Math.min(gameState.WORLD_DEPTH || 300, this.num(y, p.y || 150)));
        p.z = 0;
        p.vz = 0;
        p.kbVx = 0;
        p.kbVy = 0;
        p.isGrounded = true;
        p.vx = 0;
        p.vy = 0;
        p.freezeTimer = 0;
        p.maxFreezeTimer = 0;
        p.mashReduced = 0;
        p.invincibleTimer = 0;
        p.guardTimer = 0;
        p.maxGuardTimer = 0;
        p.guardCooldownTimer = 0;
        p.guardSuccessTimer = 0;
        p.guardForcedRecover = false;
        p.dashTimer = 0;
        p.dashCooldownTimer = 0;
        p.dashSpeedX = 0;
        p.dashSpeedY = 0;
        p.ghostTimer = 0;
        p.isRunning = false;
        p.runDirection = null;
        p.rapidAtkAllowTimer = 0;
        p.rapidAtkCooldownTimer = 0;
        p.rapidAtkCount = 0;
        p.atkTimer = 0;
        if (options.forceIdle || p.state === 'Hit' || p.state === 'HIT' || p.state === 'Freeze' || p.state === 'Atk' || p.state === 'Dash' || p.state === 'Guard') {
            p.state = 'Idle';
            p.prevState = 'Idle';
            p.forcePrevState = null;
        }
        if (options.clearKeys && gameState.keys) {
            ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyX','KeyZ','KeyC','KeyD','KeyA','KeyS','Space'].forEach(key => {
                gameState.keys[key] = false;
            });
        }
    },

    enterArea(gameState, areaId, options = {}) {
        const rt = gameState.p3m3Runtime;
        if (!rt) return;
        rt.currentAreaId = this.id(areaId);
        rt.portalCooldown = 0.35;
        rt.routeDelayTimer = 0;
        this.applyAreaWorldSize(gameState, areaId);
        this.cleanupP3M3AreaTerrain(gameState, areaId);
        (gameState.monsters || []).forEach(m => {
            if (m && m.isP3M3Monster) m.active = false;
        });
        gameState.monsters = (gameState.monsters || []).filter(m => !(m && m.isP3M3Monster));

        if (options.arriveX !== undefined || options.arriveY !== undefined) {
            this.placePlayer(gameState, options.arriveX, options.arriveY);
        }

        if (options.spawnCenter) {
            this.spawnMonsterByRole(gameState, 'CENTER_BOSS');
        } else if (this.id(areaId) === this.id(this.getSystem(gameState).Left_Area_ID || 902002)) {
            this.tryResolveTalkClearOrSpawn(gameState, 'P1_CLONE', 'leftResult');
        } else if (this.id(areaId) === this.id(this.getSystem(gameState).Right_Area_ID || 902003)) {
            this.tryResolveTalkClearOrSpawn(gameState, 'P2_CLONE', 'rightResult');
        } else {
            this.spawnMonsterByRole(gameState, 'CENTER_BOSS');
            this.tryStartRoute(gameState);
        }
    },

    playerHasTalkObject(gameState, value) {
        const p = gameState.player || {};
        const key = this.id(value);
        if (key === '253013') return !!p.p3TrialWillBuff;
        if (key === '253017') return !!p.p3TrialBodyBuff;
        return false;
    },

    tryResolveTalkClearOrSpawn(gameState, role, resultKey) {
        const row = this.getMonsterRow(gameState, role);
        const rt = gameState.p3m3Runtime;
        if (!row || !rt || rt[resultKey]) return;
        const hasTalkClearObject = this.id(row.Talk_Cond_Type).toUpperCase() === 'PLAYER_HAS_OBJECT'
            && this.playerHasTalkObject(gameState, row.Talk_Cond_Value);

        // 대화로 넘기는 경우에도 먼저 분신을 실제로 소환한다.
        // 대화 중에는 handleMonsterUpdate에서 AI/이동이 정지되고, 대화 종료 후 markAreaClear가 분신을 제거한다.
        const clone = this.spawnMonsterByRole(gameState, role);
        if (hasTalkClearObject) {
            if (clone && clone.boss) {
                clone.boss.noPatternWaitTimer = 999999;
                clone.boss.action = null;
                clone.boss.activePattern = null;
                clone.boss.runtimeActions = null;
            }
            if (clone) clone.p3m3TalkStandby = true;
            const triggerType = role === 'P1_CLONE' ? 'LEFT_AREA_ENTER' : 'RIGHT_AREA_ENTER';
            const started = this.startDialogueByTrigger(gameState, triggerType, {
                areaId: row.Area_ID,
                monsterId: row.P3_M3_Monster_ID
            });
            if (!started) this.markAreaClear(gameState, role, 'TALK_CLEAR');
        }
    },

    buildP3MonsterData(gameState, row) {
        const base = gameState.DB_MONSTER[this.id(row.Boss_Info_Ref_ID)] || null;
        if (!base) return null;
        const d = { ...base };
        const modelName = this.id(row.Model_Name || row.Model_Render_Type || '');
        if (modelName) {
            d.renderType = modelName;
            d.Model_Render_Type = modelName;
            d.p3m3ModelName = modelName;
        }
        d.patternSetId = this.id(row.Pattern_Set_Ref_ID || base.patternSetId);
        d.aiType = 'BOSS_PATTERN';
        d.aggressive = this.id(row.AI_Type).toUpperCase() !== 'NONE';
        d.defaultHitDmgRate = this.bool(row.Invincible) ? 0 : this.num(row.Hit_DMG_Rate, base.defaultHitDmgRate);
        d.atkDmgRate = this.num(row.ATK_DMG_Rate, base.atkDmgRate || 1);
        d.hitDur = 0;

        const mainBoss = this.getMainBoss(gameState);
        const hpType = this.id(row.Max_HP_Type).toUpperCase();
        const hpValue = this.num(row.Max_HP_Value, base.maxHp || base.hp || 1);
        if (hpType === 'RATE_OF_MAIN_BOSS' && mainBoss) {
            d.hp = Math.max(1, Math.max(1, mainBoss.maxHp || mainBoss.hp || 1) * hpValue);
            d.maxHp = d.hp;
        } else if (hpType === 'RATE_OF_REF' || hpType === 'RATE_OF_REF_BOSS') {
            d.hp = Math.max(1, Math.max(1, base.maxHp || base.hp || 1) * hpValue);
            d.maxHp = d.hp;
        } else if (hpValue > 0) {
            d.hp = hpValue;
            d.maxHp = hpValue;
        }
        return d;
    },

    deactivateMonsterRole(gameState, role) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt) return;
        const key = this.id(role);
        const monster = rt.monstersByRole[key];
        if (monster) monster.active = false;
        delete rt.monstersByRole[key];
        gameState.monsters = (gameState.monsters || []).filter(m => !(m && m.isP3M3Monster && this.id(m.p3m3Role) === key));
    },

    cleanupP3M3AreaTerrain(gameState, nextAreaId = null) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !Array.isArray(gameState.bossAttackObjects)) return;
        const nextId = this.id(nextAreaId || rt.currentAreaId);
        const rightId = this.id(this.getSystem(gameState).Right_Area_ID || 902003);
        gameState.bossAttackObjects.forEach(obj => {
            if (!obj || !obj.p3m3Terrain) return;
            if (nextId !== rightId || this.id(obj.p3m3TerrainAreaId) !== nextId) obj.active = false;
        });
        gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => obj && obj.active);
    },

    restartPattern(gameState, reason = '') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.active) return false;
        const system = rt.system || this.getSystem(gameState);
        const centerAreaId = this.id(system.Center_Area_ID || 902001);
        const centerSize = this.getAreaWorldSize(gameState, centerAreaId, 1400, 400);
        const worldW = centerSize.w;
        const worldD = centerSize.d;
        const main = rt.linkedBoss;
        const p = gameState.player;

        this.cleanupP3Monsters(gameState);
        if (Array.isArray(gameState.bossAttackObjects)) gameState.bossAttackObjects = [];
        gameState.hitboxes = [];
        gameState.WORLD_WIDTH = worldW;
        gameState.WORLD_DEPTH = worldD;

        if (main) {
            main.active = true;
            const entryHpRate = this.getPatternHpRate(gameState, rt.patternId, 0.1);
            main.hp = Math.max(1, (main.maxHp || main.hp || 1) * entryHpRate);
            main.p3m3MainBossSuppressed = !!rt.suppressMainBoss;
            main.x = worldW / 2;
            main.y = worldD / 2;
            main.z = 0;
            main.kbVx = 0;
            main.kbVy = 0;
            main.state = 'IDLE';
            if (main.boss) {
                main.boss.activePattern = null;
                main.boss.action = null;
                main.boss.runtimeActions = null;
                main.boss.currentActionIndex = -1;
                main.boss.noPatternWaitTimer = 999999;
                main.boss.actionHitFired = false;
                main.boss.actionHitsDone = 0;
                main.boss.actionCycleTimer = 0;
                main.boss.parryWindowActive = false;
                main.boss.parryCueTimer = 0;
            }
        }

        if (p) {
            p.active = true;
            p.hp = Math.max(1, parseFloat(p.maxHp) || parseFloat(p.hp) || 1);
            p.state = 'Idle';
            p.prevState = 'Idle';
            p.forcePrevState = null;
        }

        rt.currentAreaId = centerAreaId;
        rt.centerAreaReturned = false;
        rt.leftResult = null;
        rt.rightResult = null;
        rt.leftResultData = null;
        rt.rightResultData = null;
        rt.clearStates = {};
        rt.route = null;
        rt.routeType = null;
        rt.routeStarted = false;
        rt.routeDelayTimer = 0;
        rt.finalPending = false;
        rt.finalStartDelayTimer = 0;
        rt.finalStartDelayTotal = 0;
        rt.finalStarted = false;
        rt.finalResolving = false;
        rt.finalResolveTimer = 0;
        rt.finalResolveSuccess = false;
        rt.finalResolveReason = '';
        rt.finalChargeActionId = '';
        rt.finalAttackActionId = '';
        rt.finalChargeDuration = 0;
        rt.finalAttackDuration = 0;
        rt.finalTimelineElapsed = 0;
        rt.finalTimelineHitStart = 0;
        rt.finalTimelineHitEnd = 0;
        rt.finalAttackHitStartLocal = 0;
        rt.finalAttackHitEndLocal = 0;
        rt.finalSlashScarShown = false;
        rt.finalShatterDamageStarted = false;
        rt.finalCollapse = null;
        rt.finalEffectSuppressed = false;
        rt.finalIssenDeathPending = false;
        rt.failureSequence = null;
        rt.playerDeathPending = false;
        rt.playerDeathReviveX = null;
        rt.playerDeathReviveY = null;
        rt.playerDeathReviveAreaId = null;
        rt.finalSuccess = false;
        rt.finalFailed = false;
        rt.gauge = 0;
        rt.gaugeMax = 100;
        rt.timeLimitTotal = Math.max(1, this.num(system.Time_Limit, 120));
        rt.timer = Math.max(1, this.num(system.Time_Limit, 120));
        rt.monstersByRole = {};
        rt.debugSnapshot = [];
        rt.debugLastByKey = {};
        rt.portalCooldown = 0.35;
        rt.dialogue = null;
        rt.hiddenClearDialogueShown = false;
        rt.hiddenBattleStarted = false;
        rt.hiddenWhiteBackdrop = false;
        rt.hiddenClearReturn = null;
        rt.hiddenClearFinalFaceDir = null;
        rt.hiddenFinalPhase = 'NONE';
        rt.hiddenFinalReason = '';
        rt.hiddenFinalCenterMove = null;
        rt.hiddenFinalQueuedActionId = '';
        rt.hiddenFinalQueuedPatternId = '';
        rt.trueBossDrainTimer = 0;

        if (p) this.placePlayer(gameState, 300, worldD / 2, { forceIdle: true, clearKeys: true });
        this.enterArea(gameState, centerAreaId, { spawnCenter: true });
        this.updateTargetUI(gameState);
        return true;
    },

    spawnMonsterByRole(gameState, role) {
        const row = this.getMonsterRow(gameState, role);
        const rt = gameState.p3m3Runtime;
        if (!row || !rt) return null;
        const d = this.buildP3MonsterData(gameState, row);
        if (!d) return null;

        const p3Id = this.id(row.P3_M3_Monster_ID || row.Monster_Role);
        const entity = {
            id: p3Id,
            d,
            active: true,
            spawner: null,
            isChampion: false,
            scale: d.scale || 1,
            x: this.num(row.Spawn_X, (gameState.WORLD_WIDTH || 1400) / 2),
            y: this.num(row.Spawn_Y, (gameState.WORLD_DEPTH || 300) / 2),
            z: 0,
            vz: 0,
            isGrounded: true,
            hp: Math.max(1, d.hp || d.maxHp || 1),
            maxHp: Math.max(1, d.maxHp || d.hp || 1),
            state: 'IDLE',
            prevState: 'NONE',
            forcePrevState: null,
            timer: 0,
            deadTimer: 0,
            dirX: 0,
            dirY: 0,
            faceDir: 1,
            pacingDir: 1,
            pacingAngle: 0,
            nextHitTime: 0,
            kbVx: 0,
            kbVy: 0,
            hitByEnemyTimer: 0,
            lastHitSourceX: null,
            lastHitSourceY: null,
            lastHitDirX: 0,
            lastHitDirY: 0,
            hasFired: false,
            isDeadProcessed: false,
            skillCooldowns: {},
            patternCount: 0,
            isProvoked: this.id(row.AI_Type).toUpperCase() !== 'NONE',
            boss: MonsterManager.createBossRuntimeForMonster(d, gameState),
            isP3M3Monster: true,
            p3m3Role: this.id(row.Monster_Role),
            p3m3Row: row,
            p3m3Static: this.id(row.AI_Type).toUpperCase() === 'NONE'
        };

        const roleKey = this.id(row.Monster_Role).toUpperCase();
        const rowModelName = this.id(row.Model_Name || (entity.d && entity.d.p3m3ModelName) || '');
        entity.p3m3TargetModelName = rowModelName;
        if (roleKey === 'TRUE_BOSS' && rowModelName && !rt.hiddenBattleStarted) {
            // 중앙 히든 대화 중 Line_Event_Type=KASIYAS_RENDER_CHANGE가 나오기 전까지는
            // 일반 3페이즈 카시야스 형태로 서 있다가, 해당 대사 시점에 전력 모델로 전환한다.
            entity.d.renderType = 'RENDER_KASIYAS_P3';
            entity.d.Model_Render_Type = 'RENDER_KASIYAS_P3';
            entity.p3m3PendingModelName = rowModelName;
            entity.p3m3CurrentModelName = 'RENDER_KASIYAS_P3';
        }
        const player = gameState.player || null;
        const gazeType = this.id(row.Monster_Gaze).toUpperCase();
        if (gazeType === 'LOOKING_LEFT') {
            entity.faceDir = -1;
            entity.pacingDir = -1;
        } else if (gazeType === 'LOOKING_RIGHT') {
            entity.faceDir = 1;
            entity.pacingDir = 1;
        } else if (gazeType === 'LOOKING_PLAYER' && player) {
            entity.faceDir = player.x < entity.x ? -1 : 1;
            entity.pacingDir = entity.faceDir;
        } else if (roleKey === 'P2_CLONE') {
            entity.faceDir = -1;
            entity.pacingDir = -1;
        } else if (roleKey === 'P1_CLONE') {
            entity.faceDir = 1;
            entity.pacingDir = 1;
        }

        if (entity.boss) {
            const phaseRefId = this.id(row.Phase_Ref_ID || row.Phase_Ref_ID || row.Phase_Info_Ref_ID);
            const phaseRef = phaseRefId && gameState.DB_BOSS_PHASE ? gameState.DB_BOSS_PHASE[phaseRefId] : null;
            if (phaseRef) {
                entity.boss.phase = {
                    ...phaseRef,
                    Next_Phase_ID: 0,
                    Phase_Transition_Type: null,
                    Late_Opening_Pattern_ID: 0
                };
                entity.boss.phaseId = phaseRefId;
            } else if (entity.boss.phase) {
                entity.boss.phase = {
                    ...entity.boss.phase,
                    Next_Phase_ID: 0,
                    Phase_Transition_Type: null,
                    Late_Opening_Pattern_ID: 0
                };
            }

            const useType = this.id(row.Use_Pattern_Type).toUpperCase();
            if (useType === 'USE_PATTERN_ONLY') {
                entity.boss.p3m3AllowedPatternIds = [this.id(row.Use_Pattern_Value)];
            } else if (useType === 'USE_PATTERN_SET_BASIC') {
                const setId = this.id(row.Pattern_Set_Ref_ID || d.patternSetId);
                const patterns = gameState.DB_BOSS_PATTERN_BY_SET && gameState.DB_BOSS_PATTERN_BY_SET[setId] ? gameState.DB_BOSS_PATTERN_BY_SET[setId] : [];
                entity.boss.p3m3AllowedPatternIds = patterns
                    .filter(pattern => this.id(pattern.Pattern_Category).toUpperCase() === 'BASIC')
                    .map(pattern => this.id(pattern.Pattern_ID));
            } else if (useType === 'USE_ACTION_ONLY') {
                entity.boss.p3m3AllowedPatternIds = [];
            }

            const isSideClone = roleKey === 'P1_CLONE' || roleKey === 'P2_CLONE';
            if (isSideClone) {
                // P3_M3 좌/우 분신 전투는 항상 후반부 강화 기술 기준으로 사용한다.
                // Late_Phase_Action_Order / Late_Phase_Action_Time_Rate / Late_Phase_Action_Move_Speed_Rate가 모두 적용된다.
                entity.boss.isLatePhase = true;
                entity.boss.p3m3ForceLatePhase = true;
                entity.boss.lateNoticeShown = true;
                entity.boss.lateOpeningPatternUsed = true;
                entity.boss.lateOpeningPatternStarted = true;
                entity.boss.pendingLateOpeningPatternId = null;
            }

            if (Array.isArray(entity.boss.p3m3AllowedPatternIds)) {
                entity.boss.p3m3AllowedPatternIds.forEach(patternId => {
                    if (!patternId) return;
                    const pattern = gameState.DB_BOSS_PATTERN && gameState.DB_BOSS_PATTERN[patternId]
                        ? gameState.DB_BOSS_PATTERN[patternId]
                        : null;
                    const normalInitial = this.num(pattern && pattern.Pattern_Initial_Cooltime, 0);
                    const lateInitialRaw = this.num(pattern && pattern.Late_Phase_Pattern_Initial_Cooltime, NaN);
                    const useLateInitial = entity.boss.isLatePhase && Number.isFinite(lateInitialRaw) && lateInitialRaw > 0;
                    // 기존 보스와 동일하게 패턴 선 쿨타임을 적용한다. 단, 후반부 전용 값이 양수일 때만 대체한다.
                    entity.boss.patternCooldowns[patternId] = useLateInitial ? lateInitialRaw : normalInitial;
                });
            }
            entity.boss.noPatternWaitTimer = entity.p3m3Static ? 999999 : 0.2;
            entity.boss.lateNoticeShown = true;
            entity.boss.lateOpeningPatternUsed = true;
            entity.boss.lateOpeningPatternStarted = true;
            entity.boss.pendingLateOpeningPatternId = null;
        }

        gameState.monsters.push(entity);
        rt.monstersByRole[entity.p3m3Role] = entity;
        if (this.bool(row.Show_Local_HP_Bar)) {
            gameState.targetUI.monster = entity;
            gameState.targetUI.timer = 999999;
        }
        return entity;
    },

    markAreaClear(gameState, role, resultType) {
        const rt = gameState.p3m3Runtime;
        const row = this.getMonsterRow(gameState, role);
        if (!rt || !row) return;
        const side = role === 'P1_CLONE' ? 'leftResult' : (role === 'P2_CLONE' ? 'rightResult' : null);
        if (!side || rt[side]) return;
        const requested = this.normalizeAreaResult(resultType);
        const resultData = requested === 'TALK_CLEAR'
            ? (this.id(row.Talk_Result_Type) || resultType)
            : (requested === 'KILL_CLEAR' ? (this.id(row.Kill_Result_Type) || resultType) : resultType);
        const canonical = this.normalizeAreaResult(resultData) || requested;
        rt[side] = canonical;
        rt[`${side}Data`] = this.id(resultData);
        const clearState = this.id(row.Clear_State).toUpperCase();
        if (clearState) rt.clearStates[clearState] = true;

        const rewardType = this.id(row.Talk_Reward_Type).toUpperCase();
        const reward = canonical === 'TALK_CLEAR' ? this.num(row.Talk_Reward_Value || row.Reward_Value, 0) : 0;
        if (reward > 0 && (!rewardType || rewardType === 'GET_FIGHTING_SPIRIT') && typeof PlayerManager !== 'undefined' && PlayerManager.addFightingSpirit) {
            PlayerManager.addFightingSpirit(gameState, reward, { rewardKey: `P3M3_${role}_${canonical}`, lockTime: 0.45 });
        }
        const monster = rt.monstersByRole[role];
        this.cleanupP3M3MonsterObjects(gameState, role, monster);
        if (monster) monster.active = false;
    },

    checkPortalCondition(gameState, conditionType) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt) return false;
        const cond = this.id(conditionType).toUpperCase();
        if (!cond || cond === 'NONE') return true;
        if (cond === 'P3_M3_START') return !rt.leftResult;
        if (cond === 'P3_M3_LEFT_AREA_CLEAR') return !!rt.leftResult || !!rt.clearStates.LEFT_AREA_CLEAR;
        if (cond === 'P3_M3_RIGHT_AREA_CLEAR') return !!rt.rightResult || !!rt.clearStates.RIGHT_AREA_CLEAR;
        if (cond === 'P3_M3_CENTER_AREA_RETURN') {
            const centerId = this.id((rt.system || this.getSystem(gameState)).Center_Area_ID || 902001);
            return !!rt.leftResult && !!rt.rightResult && this.id(rt.currentAreaId) === centerId;
        }
        return false;
    },

    getActivePortals(gameState) {
        const rt = gameState.p3m3Runtime;
        if (!rt) return [];
        return (gameState.DB_P3_M3_PORTAL || []).filter(portal => {
            if (this.id(portal.From_Area_ID) !== rt.currentAreaId) return false;
            const active = this.checkPortalCondition(gameState, portal.Active_Cond_Type);
            const deactiveType = this.id(portal.DeActive_Cond_Type);
            const deactive = deactiveType ? this.checkPortalCondition(gameState, deactiveType) : false;
            return active && !deactive;
        });
    },

    updatePortals(gameState, deltaTime) {
        const rt = gameState.p3m3Runtime;
        const p = gameState.player;
        if (!rt || !p) return;
        rt.portalCooldown = Math.max(0, (rt.portalCooldown || 0) - deltaTime);
        if (rt.portalCooldown > 0) return;
        const portals = this.getActivePortals(gameState);
        for (const portal of portals) {
            const px = this.num(portal.Position_X, 0);
            const py = this.num(portal.Position_Y, 0);
            if (Math.abs(p.x - px) <= 74 && Math.abs(p.y - py) <= 82) {
                const toArea = this.id(portal.To_Area_ID);
                const state = this.id(portal.After_Use_State);
                if (state.indexOf('RETURN_CENTER_AREA') >= 0) rt.centerAreaReturned = true;
                this.enterArea(gameState, toArea, {
                    arriveX: this.num(portal.Player_Arrive_X, p.x),
                    arriveY: this.num(portal.Player_Arrive_Y, p.y),
                    spawnCenter: toArea === this.id(this.getSystem(gameState).Center_Area_ID || 902001)
                });
                return;
            }
        }
    },

    tryStartRoute(gameState) {
        const rt = gameState.p3m3Runtime;
        if (!rt || rt.routeStarted || !rt.leftResult || !rt.rightResult) return;
        const route = this.findMatchingRoute(gameState);
        if (!route) return;
        rt.route = route;
        rt.routeType = this.id(route.Route_Type).toUpperCase();
        rt.routeStarted = true;
        rt.gaugeMax = Math.max(1, this.num(route.Gauge_Max, 100));
        rt.gaugeType = this.getGaugeType(rt);
        rt.gauge = rt.gaugeType === 'ISSEN_GAUGE'
            ? 0
            : Math.min(rt.gaugeMax, gameState.player ? (gameState.player.fightingSpirit || 0) : 0);
        rt.routeDelayTimer = 0;
        rt.finalPending = false;
        rt.finalStartDelayTimer = 0;
        rt.finalStartDelayTotal = 0;

        const startState = this.id(route.Start_State).toUpperCase();
        if (startState === 'BATTLE_START' || (!startState && rt.routeType === 'ROUTE_HIDDEN')) {
            this.deactivateMonsterRole(gameState, 'CENTER_BOSS');
            const trueBoss = this.spawnMonsterByRole(gameState, 'TRUE_BOSS');
            const startedDialogue = this.startDialogueByTrigger(gameState, 'ROUTE_HIDDEN_START', {
                areaId: this.getSystem(gameState).Center_Area_ID || 902001,
                routeId: route.Route_ID,
                monsterId: trueBoss && trueBoss.p3m3Row ? trueBoss.p3m3Row.P3_M3_Monster_ID : route.Target_Monster_ID
            });
            if (!startedDialogue) this.startHiddenBattle(gameState, 'NO_DIALOGUE');
        } else if (startState === 'NORMAL_ISSEN_READY' || !startState) {
            if (this.checkFinalAttackStartCondition(gameState, route)) this.armFinalAttack(gameState, 'NORMAL_COUNTDOWN');
        } else if (this.checkFinalAttackStartCondition(gameState, route)) {
            this.armFinalAttack(gameState, startState);
        }
    },

    startHiddenBattle(gameState, reason = '') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.routeType !== 'ROUTE_HIDDEN') return false;
        const trueBoss = rt.monstersByRole && rt.monstersByRole.TRUE_BOSS;
        if (trueBoss) {
            const targetModel = this.id(trueBoss.p3m3TargetModelName || trueBoss.p3m3PendingModelName || (trueBoss.p3m3Row && trueBoss.p3m3Row.Model_Name));
            if (targetModel && trueBoss.d) {
                trueBoss.d.renderType = targetModel;
                trueBoss.d.Model_Render_Type = targetModel;
                trueBoss.d.p3m3ModelName = targetModel;
                trueBoss.p3m3CurrentModelName = targetModel;
                trueBoss.p3m3PendingModelName = '';
                trueBoss.p3m3FullPowerAwakened = targetModel === 'RENDER_KASIYAS_FULL_POWER';
            }
            trueBoss.p3m3Static = false;
            trueBoss.p3m3TalkStandby = false;
            trueBoss.active = true;
            trueBoss.state = trueBoss.state === 'GROGGY' ? 'IDLE' : (trueBoss.state || 'IDLE');
            trueBoss.kbVx = 0;
            trueBoss.kbVy = 0;
            if (trueBoss.boss) {
                trueBoss.boss.noPatternWaitTimer = Math.min(Math.max(0, trueBoss.boss.noPatternWaitTimer || 0), 0.25);
                trueBoss.boss.parryWindowActive = false;
                trueBoss.boss.parryCueTimer = 0;
            }
        }
        rt.hiddenBattleStarted = true;
        rt.trueBossDrainTimer = 0;
        rt.hiddenFinalPhase = 'NONE';
        rt.hiddenFinalReason = '';
        rt.hiddenFinalCenterMove = null;
        rt.hiddenWhiteBackdrop = false;
        if (gameState && gameState.screenHitFlash && gameState.screenHitFlash.mode === 'fullwhite') gameState.screenHitFlash = null;
        this.updateTargetUI(gameState);
        return true;
    },

    updateRoute(gameState, deltaTime) {
        const rt = gameState.p3m3Runtime;
        if (!rt) return;
        if (!rt.routeStarted) {
            this.tryStartRoute(gameState);
            return;
        }
        if (rt.finalStarted) {
            this.updateFinalTimeline(gameState, deltaTime);
            this.monitorFinalAction(gameState);
            return;
        }
        if (rt.finalPending) {
            rt.finalStartDelayTimer = Math.max(0, (rt.finalStartDelayTimer || 0) - deltaTime);
            if (rt.finalStartDelayTimer <= 0) this.startFinalAttack(gameState);
            return;
        }
        const route = rt.route || {};
        const startState = this.id(route.Start_State).toUpperCase();
        if (startState === 'BATTLE_START' || rt.routeType === 'ROUTE_HIDDEN') {
            if (!rt.hiddenBattleStarted) {
                this.startHiddenBattle(gameState, 'ROUTE_HIDDEN_START');
                return;
            }
            if (rt.hiddenFinalPhase && rt.hiddenFinalPhase !== 'NONE') {
                this.updateHiddenFinalPreparation(gameState, deltaTime);
                return;
            }
            this.updateTrueBossDrain(gameState, deltaTime);
            if (this.checkFinalAttackStartCondition(gameState, route)) this.queueHiddenFinalSequence(gameState, 'DATA_CONDITION');
            return;
        }
        if (this.checkFinalAttackStartCondition(gameState, route)) this.armFinalAttack(gameState, 'DATA_CONDITION');
    },

    queueHiddenFinalSequence(gameState, reason = '') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.routeType !== 'ROUTE_HIDDEN' || rt.finalPending || rt.finalStarted || rt.finalResolving) return false;
        if (rt.hiddenFinalPhase && rt.hiddenFinalPhase !== 'NONE') return false;
        const trueBoss = rt.monstersByRole && rt.monstersByRole.TRUE_BOSS;
        const main = rt.linkedBoss;
        const route = rt.route || {};
        const threshold = Math.max(0.001, this.num(route.Final_Attack_Start_Cond_Value, 0.01));
        if (main) {
            const maxHp = Math.max(1, main.maxHp || main.hp || 1);
            main.hp = Math.max(1, Math.min(main.hp || maxHp, maxHp * threshold));
        }
        rt.hiddenFinalPhase = 'WAIT_ACTION_END';
        rt.hiddenFinalReason = reason || 'HP_THRESHOLD';
        rt.hiddenFinalCenterMove = null;
        rt.hiddenFinalQueuedActionId = this.id(trueBoss && trueBoss.boss && trueBoss.boss.action && trueBoss.boss.action.Action_ID);
        rt.hiddenFinalQueuedPatternId = this.id(trueBoss && trueBoss.boss && trueBoss.boss.activePattern && trueBoss.boss.activePattern.Pattern_ID);
        if (trueBoss && trueBoss.boss) {
            trueBoss.boss.p3m3FinalQueued = true;
            trueBoss.boss.noPatternWaitTimer = 999999;
            // 현재 액션은 끝까지 재생하되, 이후 액션/패턴이 새로 이어지지 않도록 보스 패턴 시스템에서 감지할 플래그를 남긴다.
        }
        return true;
    },

    clearBossActionForHiddenFinal(monster) {
        if (!monster) return;
        monster.kbVx = 0;
        monster.kbVy = 0;
        monster.vz = 0;
        monster.z = Math.max(0, parseFloat(monster.z) || 0);
        monster.state = monster.state === 'GROGGY' ? 'IDLE' : (monster.state || 'IDLE');
        if (monster.boss) {
            monster.boss.activePattern = null;
            monster.boss.action = null;
            monster.boss.actionMove = null;
            monster.boss.actionMoveCompleted = false;
            monster.boss.runtimeActions = null;
            monster.boss.currentActionIndex = -1;
            monster.boss.actionHitFired = false;
            monster.boss.actionHitsDone = 0;
            monster.boss.actionCycleTimer = 0;
            monster.boss.parryWindowActive = false;
            monster.boss.parryCueTimer = 0;
            monster.boss.noPatternWaitTimer = 999999;
        }
    },

    beginHiddenFinalCenterMove(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.routeType !== 'ROUTE_HIDDEN') return false;
        const trueBoss = rt.monstersByRole && rt.monstersByRole.TRUE_BOSS;
        if (!trueBoss) return false;
        this.clearBossActionForHiddenFinal(trueBoss);
        const centerAreaId = this.getSystem(gameState).Center_Area_ID || rt.currentAreaId || 902001;
        const size = this.getAreaWorldSize(gameState, centerAreaId, gameState.WORLD_WIDTH || 1400, gameState.WORLD_DEPTH || 400);
        const endX = Math.max(80, Math.min(size.w - 80, size.w / 2));
        const endY = Math.max(0, Math.min(size.d, size.d / 2));
        rt.hiddenFinalPhase = 'MOVE_CENTER';
        rt.hiddenFinalCenterMove = {
            timer: 0,
            duration: 0.85,
            startX: parseFloat(trueBoss.x) || endX,
            startY: parseFloat(trueBoss.y) || endY,
            endX,
            endY
        };
        trueBoss.p3m3Static = true;
        trueBoss.p3m3TalkStandby = false;
        trueBoss.state = 'IDLE';
        const player = gameState.player || null;
        trueBoss.faceDir = player && player.x < trueBoss.x ? -1 : 1;
        trueBoss.pacingDir = trueBoss.faceDir;
        return true;
    },

    updateHiddenFinalPreparation(gameState, deltaTime) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.routeType !== 'ROUTE_HIDDEN') return false;
        const trueBoss = rt.monstersByRole && rt.monstersByRole.TRUE_BOSS;
        const phase = this.id(rt.hiddenFinalPhase).toUpperCase();
        if (!trueBoss) {
            rt.hiddenFinalPhase = 'NONE';
            return false;
        }
        if (phase === 'WAIT_ACTION_END') {
            const boss = trueBoss.boss || null;
            const actionBusy = !!(boss && boss.action);
            const moveBusy = !!(boss && boss.actionMove && !boss.actionMoveCompleted);
            const airborneBusy = Math.abs(parseFloat(trueBoss.z) || 0) > 0.1 || Math.abs(parseFloat(trueBoss.vz) || 0) > 0.1;
            if (actionBusy || moveBusy || airborneBusy) return true;
            return this.beginHiddenFinalCenterMove(gameState);
        }
        if (phase === 'MOVE_CENTER') {
            const mv = rt.hiddenFinalCenterMove || {};
            const dur = Math.max(0.05, parseFloat(mv.duration) || 0.85);
            mv.timer = Math.min(dur, (parseFloat(mv.timer) || 0) + Math.max(0, parseFloat(deltaTime) || 0));
            const k = Math.max(0, Math.min(1, mv.timer / dur));
            const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
            trueBoss.x = (parseFloat(mv.startX) || 0) + ((parseFloat(mv.endX) || 0) - (parseFloat(mv.startX) || 0)) * ease;
            trueBoss.y = (parseFloat(mv.startY) || 0) + ((parseFloat(mv.endY) || 0) - (parseFloat(mv.startY) || 0)) * ease;
            trueBoss.z = 0;
            trueBoss.kbVx = 0;
            trueBoss.kbVy = 0;
            trueBoss.vz = 0;
            trueBoss.state = 'IDLE';
            const player = gameState.player || null;
            trueBoss.faceDir = player && player.x < trueBoss.x ? -1 : 1;
            trueBoss.pacingDir = trueBoss.faceDir;
            rt.hiddenFinalCenterMove = mv;
            if (k >= 1) {
                this.clearBossActionForHiddenFinal(trueBoss);
                trueBoss.p3m3Static = true;
                trueBoss.state = 'IDLE';
                if (trueBoss.boss) {
                    trueBoss.boss.p3m3FinalQueued = false;
                    trueBoss.boss.noPatternWaitTimer = 999999;
                }
                rt.hiddenFinalPhase = 'NONE';
                rt.hiddenFinalCenterMove = null;
                rt.hiddenFinalQueuedActionId = '';
                rt.hiddenFinalQueuedPatternId = '';
                return this.armFinalAttack(gameState, rt.hiddenFinalReason || 'HP_THRESHOLD_CENTER_READY');
            }
            return true;
        }
        return false;
    },

    armFinalAttack(gameState, reason = '') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.route || rt.finalPending || rt.finalStarted) return false;
        const delay = Math.max(0, this.num(rt.route.Final_Attack_Start_Delay, 0));
        rt.finalPending = true;
        rt.finalConditionReason = reason;
        rt.finalStartDelayTimer = delay;
        rt.finalStartDelayTotal = delay;
        if (rt.routeType === 'ROUTE_HIDDEN') {
            const trueBoss = rt.monstersByRole && rt.monstersByRole.TRUE_BOSS;
            if (trueBoss) {
                this.clearBossActionForHiddenFinal(trueBoss);
                trueBoss.p3m3Static = true;
                trueBoss.state = 'IDLE';
                trueBoss.kbVx = 0;
                trueBoss.kbVy = 0;
                trueBoss.vz = 0;
                trueBoss.z = 0;
                if (trueBoss.boss) trueBoss.boss.noPatternWaitTimer = 999999;
            }
        }
        this.prepareFinalTiming(gameState, rt.route);
        if (delay <= 0) {
            return this.startFinalAttack(gameState);
        }
        return true;
    },

    prepareFinalTiming(gameState, route) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !route) return false;
        const charge = this.getAction(gameState, route.Final_Attack_Charge_Action_ID);
        const atk = this.getAction(gameState, route.Final_Attack_ATK_Action_ID);
        if (!charge || !atk) return false;
        rt.finalChargeActionId = this.id(charge.Action_ID);
        rt.finalAttackActionId = this.id(atk.Action_ID);
        rt.finalChargeDuration = Math.max(0, this.num(charge.Action_Anim_Duration, 0));
        rt.finalAttackDuration = Math.max(0, this.num(atk.Action_Anim_Duration, 0));
        rt.finalAttackHitStartLocal = Math.max(0, this.num(atk.Hitbox_Start_Time, Math.max(0.1, rt.finalAttackDuration * 0.62)));
        rt.finalAttackHitEndLocal = Math.max(rt.finalAttackHitStartLocal + 0.02, this.num(atk.Hitbox_End_Time, rt.finalAttackDuration));
        rt.finalTimelineHitStart = rt.finalChargeDuration + rt.finalAttackHitStartLocal;
        rt.finalTimelineHitEnd = rt.finalChargeDuration + rt.finalAttackHitEndLocal;
        return true;
    },

    updateTrueBossDrain(gameState, deltaTime) {
        const rt = gameState.p3m3Runtime;
        const row = this.getMonsterRow(gameState, 'TRUE_BOSS');
        const main = rt && rt.linkedBoss;
        if (!rt || !row || !main || rt.routeType !== 'ROUTE_HIDDEN' || !rt.hiddenBattleStarted) return;
        if (rt.finalPending || rt.finalStarted || rt.finalResolving) return;
        if (this.id(row.Main_Boss_HP_Link_Type).toUpperCase() !== 'DRAIN') return;

        const route = rt.route || {};
        const thresholdRate = Math.max(0.001, this.num(route.Final_Attack_Start_Cond_Value, 0.01));
        const maxHp = Math.max(1, main.maxHp || main.hp || 1);
        const cycle = Math.max(0.1, this.num(row.Main_Boss_HP_Link_Cycle, 2));
        const valuePerCycle = Math.max(0, this.num(row.Main_Boss_HP_Link_Value, 0.01));
        const drainPerSecond = maxHp * valuePerCycle / cycle;
        if (drainPerSecond <= 0) return;

        const minHp = Math.max(1, maxHp * Math.min(thresholdRate, 0.01));
        const before = parseFloat(main.hp) || maxHp;
        main.hp = Math.max(minHp, before - drainPerSecond * Math.max(0, parseFloat(deltaTime) || 0));
        rt.trueBossDrainTimer = (rt.trueBossDrainTimer || 0) + Math.max(0, parseFloat(deltaTime) || 0);
        rt.trueBossDrainDebug = { before, after: main.hp, perSecond: drainPerSecond, thresholdRate };
    },

    startFinalAttack(gameState) {
        const rt = gameState.p3m3Runtime;
        if (!rt || !rt.route || rt.finalStarted) return false;
        const route = rt.route;
        const casterId = this.id(route.Final_Attack_Caster_Monster_ID);
        let caster = (gameState.monsters || []).find(m => m && m.active && m.isP3M3Monster && this.id(m.p3m3Row && m.p3m3Row.P3_M3_Monster_ID) === casterId);
        if (!caster) caster = rt.routeType === 'ROUTE_HIDDEN' ? rt.monstersByRole.TRUE_BOSS : rt.monstersByRole.CENTER_BOSS;
        if (!caster) return false;

        const charge = this.getAction(gameState, route.Final_Attack_Charge_Action_ID);
        const atk = this.getAction(gameState, route.Final_Attack_ATK_Action_ID);
        if (!charge || !atk || !caster.boss) return false;

        caster.p3m3Static = false;
        caster.p3m3TalkStandby = false;
        if (caster.boss) {
            caster.boss.p3m3FinalQueued = false;
            caster.boss.actionMove = null;
            caster.boss.actionMoveCompleted = false;
        }
        if (rt.routeType === 'ROUTE_HIDDEN') {
            rt.hiddenWhiteBackdrop = false;
            rt.hiddenFinalPhase = 'NONE';
            rt.hiddenFinalCenterMove = null;
        }
        caster.boss.noPatternWaitTimer = 0;
        rt.finalPending = false;
        rt.finalStarted = true;
        rt.finalTimelineElapsed = 0;
        rt.finalSlashScarShown = false;
        rt.finalShatterDamageStarted = false;
        rt.finalCollapse = null;
        rt.finalEffectSuppressed = false;
        rt.finalIssenDeathPending = false;
        this.prepareFinalTiming(gameState, route);
        const routeCharge = { ...charge, Action_Order: 1, Action_Condition_Type: 'NONE' };
        const routeAttack = { ...atk, Action_Order: 2, Action_Condition_Type: 'NONE' };
        const pattern = {
            Pattern_ID: `P3_M3_FINAL_${rt.routeType}`,
            Pattern_Name: (this.getPatternRow(gameState, rt.patternId) || {}).Pattern_Name || '세계를 가르는 일섬',
            Pattern_Cooldown: 0,
            Pattern_Repeat: false,
            Runtime_Actions: [routeCharge, routeAttack]
        };
        MonsterManager.startBossPattern(caster, pattern, gameState);
        this.updateTargetUI(gameState);
        return true;
    },

    updateFinalTimeline(gameState, deltaTime) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.finalStarted) return;
        const total = Math.max(
            (rt.finalChargeDuration || 0) + (rt.finalAttackDuration || 0),
            rt.finalTimelineHitEnd || 0,
            rt.finalTimelineHitStart || 0,
            0.1
        );
        rt.finalTimelineElapsed = Math.min(total + 0.8, (rt.finalTimelineElapsed || 0) + deltaTime);
        const local = (rt.finalTimelineElapsed || 0) - (rt.finalChargeDuration || 0);
        if (!rt.finalSlashScarShown && local >= 0) {
            rt.finalSlashScarShown = true;
        }
        if (!rt.finalShatterDamageStarted && local >= Math.max(0, rt.finalAttackHitStartLocal || 0)) {
            rt.finalShatterDamageStarted = true;
            try {
                if (gameState.camera) {
                    gameState.camera.shakeTime = Math.max(gameState.camera.shakeTime || 0, 0.48);
                    gameState.camera.shakeIntensity = Math.max(gameState.camera.shakeIntensity || 0, 12);
                }
            } catch (e) {}
        }
    },

    isFinalIssenAttackAction(action, gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !action) return false;
        return this.id(action.Action_ID) === this.id(rt.finalAttackActionId);
    },

    monitorFinalAction(gameState) {
        const rt = gameState.p3m3Runtime;
        if (!rt || rt.finalSuccess || rt.finalFailed || rt.finalResolving) return;
        const active = (gameState.monsters || []).find(m => m && m.active && m.isP3M3Monster && m.boss && (
            this.id(m.boss.action && m.boss.action.Action_ID) === rt.finalAttackActionId ||
            this.id(m.boss.activePattern && m.boss.activePattern.Pattern_ID).indexOf('P3_M3_FINAL_') === 0
        ));
        if (!active) this.resolveFinal(gameState, false, 'MISS_FINAL_RESPONSE');
    },

    onMonsterPlayerHit(m, baseDmg, gameState) {
        if (!this.isActive(gameState) || !m || !m.isP3M3Monster) return;
        const rt = gameState.p3m3Runtime;
        const role = this.id(m.p3m3Role);
        if (!rt.routeStarted && (role === 'P1_CLONE' || role === 'P2_CLONE')) return;
        if (rt.routeType === 'ROUTE_HIDDEN' && (rt.finalPending || rt.finalStarted)) return;
        const route = rt.route || {};
        const targetId = this.id(route.Target_Monster_ID);
        const selfId = this.id(m.p3m3Row && m.p3m3Row.P3_M3_Monster_ID);
        if (targetId && targetId !== selfId) return;
        const gain = Math.max(0, this.num(route.Gauge_Gain_On_Hit, 0));
        if (gain <= 0) return;
        const gaugeType = this.getGaugeType(rt);
        if (gaugeType === 'FIGHTING_SPIRIT' && typeof PlayerManager !== 'undefined' && PlayerManager.addFightingSpirit) {
            PlayerManager.addFightingSpirit(gameState, gain, { rewardKey: `P3M3_FIGHTING_SPIRIT_HIT_${Date.now()}`, lockTime: 0.05 });
            rt.gauge = Math.min(rt.gaugeMax || 100, gameState.player ? (gameState.player.fightingSpirit || 0) : ((rt.gauge || 0) + gain));
        } else {
            rt.gauge = Math.min(rt.gaugeMax || 100, (rt.gauge || 0) + gain);
        }
        this.updateTargetUI(gameState);
    },

    onPlayerGuardResult(m, action, result, gameState) {
        if (!this.isActive(gameState) || !action) return;
        const rt = gameState.p3m3Runtime;
        if (rt && rt.failureSequence && rt.failureSequence.active) return;
        const actionId = this.id(action.Action_ID);
        if (actionId !== rt.finalAttackActionId) return;
        const responseType = this.getFinalResponseType(rt);
        if (responseType !== 'GUARD' && responseType) return;
        const gaugeType = this.getGaugeType(rt);
        const gaugeReady = gaugeType !== 'ISSEN_GAUGE' || (rt.gauge || 0) >= (rt.gaugeMax || 100);
        if (result && result.guarded && gaugeReady) {
            rt.finalEffectSuppressed = true;
            this.resolveFinal(gameState, true, 'GUARD_SUCCESS');
        } else {
            // 가드 자체는 성공했지만 대응 게이지가 부족한 경우에도 패턴 실패 피해는 실제로 적용한다.
            if (result && result.guarded && !gaugeReady) {
                this.applyFailureFinalAttackDamage(gameState, rt.route, action);
            }
            this.resolveFinal(gameState, false, result && result.guarded ? 'ISSEN_GAUGE_SHORTAGE' : 'GUARD_FAIL');
        }
    },

    onBossParrySuccess(m, action, gameState) {
        if (!this.isActive(gameState) || !action) return false;
        const rt = gameState.p3m3Runtime;
        if (rt && rt.failureSequence && rt.failureSequence.active) return false;
        if (this.id(action.Action_ID) === rt.finalAttackActionId && (!this.getFinalResponseType(rt) || this.getFinalResponseType(rt) === 'PARRY')) {
            rt.hiddenClearFinalFaceDir = (m && m.faceDir === -1) ? -1 : 1;
            rt.finalEffectSuppressed = true;
            this.resolveFinal(gameState, true, 'PARRY_SUCCESS');
            return true;
        }
        return false;
    },

    handleMonsterUpdate(m, deltaTime, gameState) {
        if (!this.isActive(gameState) || !m) return false;
        const rt = gameState.p3m3Runtime;
        if (rt && rt.failureSequence && rt.failureSequence.active && (m.isP3M3Monster || m.p3m3MainBossSuppressed)) {
            const seq = rt.failureSequence;
            const casterId = this.id(seq.route && seq.route.Final_Attack_Caster_Monster_ID);
            const selfId = this.id(m.p3m3Row && m.p3m3Row.P3_M3_Monster_ID);
            // 중앙 맵 실패 연출에서는 지정된 시전자의 실제 보스 액션만 기존 업데이트 루프를 통과시킨다.
            if (seq.playCasterAction && casterId && selfId === casterId) return false;
            m.kbVx = 0;
            m.kbVy = 0;
            m.vz = 0;
            m.z = 0;
            if (m.boss) {
                m.boss.noPatternWaitTimer = 999999;
                m.boss.action = null;
                m.boss.activePattern = null;
                m.boss.runtimeActions = null;
                m.boss.currentActionIndex = -1;
            }
            return true;
        }
        if (rt && rt.intro && rt.intro.active && (m.isP3M3Monster || m.p3m3MainBossSuppressed)) {
            m.kbVx = 0;
            m.kbVy = 0;
            m.vz = 0;
            m.z = 0;
            if (m.state !== 'Walk') m.state = 'IDLE';
            if (m.boss) {
                m.boss.noPatternWaitTimer = 999999;
                m.boss.action = null;
                m.boss.activePattern = null;
                m.boss.runtimeActions = null;
                m.boss.currentActionIndex = -1;
            }
            return true;
        }
        if (this.isDialogueActive(gameState)) {
            m.kbVx = 0;
            m.kbVy = 0;
            m.vz = 0;
            m.z = Math.max(0, parseFloat(m.z) || 0);
            if (m.state === 'Walk' || m.state === 'Run' || m.state === 'CHASE' || m.state === 'BOUNDARY') m.state = 'IDLE';
            return true;
        }
        if (m.isP3M3Monster && m.hp <= 0) {
            const role = this.id(m.p3m3Role);
            if (role === 'P1_CLONE' || role === 'P2_CLONE') {
                this.markAreaClear(gameState, role, 'KILL_CLEAR');
                if (gameState.phaseTransition && gameState.phaseTransition.boss === m) {
                    gameState.phaseTransition = null;
                }
                return true;
            }
            m.active = false;
            return true;
        }
        if ((m === rt.linkedBoss && rt.suppressMainBoss) || m.p3m3MainBossSuppressed) {
            m.kbVx = 0;
            m.kbVy = 0;
            m.vz = 0;
            m.z = 0;
            m.state = 'IDLE';
            if (m.boss) {
                m.boss.noPatternWaitTimer = 999999;
                m.boss.action = null;
                m.boss.activePattern = null;
            }
            return true;
        }
        if (m.isP3M3Monster && m.p3m3TalkStandby) {
            m.state = 'IDLE';
            m.kbVx = 0;
            m.kbVy = 0;
            return true;
        }
        if (m.isP3M3Monster && this.id(m.p3m3Role) === 'TRUE_BOSS' && rt.routeType === 'ROUTE_HIDDEN') {
            if (rt.finalPending && !rt.finalStarted) {
                m.kbVx = 0;
                m.kbVy = 0;
                m.vz = 0;
                m.z = 0;
                m.state = 'IDLE';
                if (m.boss) {
                    m.boss.noPatternWaitTimer = 999999;
                    m.boss.action = null;
                    m.boss.activePattern = null;
                    m.boss.runtimeActions = null;
                    m.boss.currentActionIndex = -1;
                    m.boss.actionMove = null;
                    m.boss.actionMoveCompleted = false;
                }
                return true;
            }
            const finalPhase = this.id(rt.hiddenFinalPhase).toUpperCase();
            if (finalPhase === 'WAIT_ACTION_END') {
                // 진행 중인 액션이 있으면 끝까지 재생시키되, 액션 사이에 신규 액션으로 넘어가지는 못하게 막는다.
                if (m.boss && m.boss.action) return false;
                this.clearBossActionForHiddenFinal(m);
                return true;
            }
            if (finalPhase === 'MOVE_CENTER') {
                m.kbVx = 0;
                m.kbVy = 0;
                m.vz = 0;
                m.z = 0;
                m.state = 'IDLE';
                return true;
            }
        }
        if (m.isP3M3Monster && m.p3m3Static && !(rt.finalStarted && rt.finalAttackActionId)) {
            m.state = 'IDLE';
            m.kbVx = 0;
            m.kbVy = 0;
            return true;
        }
        return false;
    },

    startHiddenClearReturn(gameState, reason = 'PATTERN_END') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt) return false;
        rt.hiddenWhiteBackdrop = true;
        rt.hiddenClearReturn = {
            active: true,
            timer: 0,
            duration: 0.9,
            reason: reason || 'PATTERN_END'
        };
        if (gameState.screenHitFlash && gameState.screenHitFlash.mode === 'fullwhite') gameState.screenHitFlash = null;
        return true;
    },

    updateHiddenClearReturn(gameState, deltaTime) {
        const rt = gameState && gameState.p3m3Runtime;
        const ret = rt && rt.hiddenClearReturn;
        if (!ret || !ret.active) return false;
        const dt = Math.max(0, parseFloat(deltaTime) || 0);
        ret.timer = Math.max(0, (parseFloat(ret.timer) || 0) + dt);
        if (ret.timer >= Math.max(0.05, parseFloat(ret.duration) || 0.9)) {
            ret.active = false;
            this.executeResultType(gameState, ret.reason || 'DUNGEON_CLEAR', { fallbackSuccess: true, reason: 'HIDDEN_CLEAR_RETURN' });
        } else {
            this.updateTargetUI(gameState);
            this.refreshDebugSnapshot(gameState, dt);
        }
        return true;
    },

    resolveFinal(gameState, success, reason = '') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.finalResolving || rt.finalSuccess || rt.finalFailed) return;
        rt.finalResolving = true;
        rt.finalResolveTimer = (success && rt.routeType === 'ROUTE_HIDDEN' && reason === 'PARRY_SUCCESS') ? 0.8 : (reason === 'FINAL_ISSEN_DEATH' ? 2.15 : 2.0);
        if (!success && (reason === 'FINAL_ISSEN_DEATH' || (gameState.player && gameState.player.hp <= 0))) rt.finalIssenDeathPending = true;
        const useWhiteClear = success && rt.routeType === 'ROUTE_HIDDEN' && reason === 'PARRY_SUCCESS';
        rt.finalEffectSuppressed = !!success || !!rt.finalEffectSuppressed;
        rt.finalCollapse = success ? null : {
            active: true,
            timer: 0,
            duration: 1.15,
            success: !!success,
            reason: reason || ''
        };
        if (success && rt.routeType === 'ROUTE_HIDDEN' && reason === 'PARRY_SUCCESS') {
            if (rt.hiddenClearFinalFaceDir !== -1 && rt.hiddenClearFinalFaceDir !== 1) {
                const caster = (gameState.monsters || []).find(mm => mm && mm.active && mm.isP3M3Monster && this.id(mm.p3m3Role).toUpperCase() === 'TRUE_BOSS');
                rt.hiddenClearFinalFaceDir = caster && caster.faceDir === -1 ? -1 : 1;
            }
            rt.hiddenWhiteBackdrop = true;
            gameState.screenHitFlash = { life: 0.35, maxLife: 0.35, strength: 0.84, mode: 'fullwhite' };
        }
        rt.finalResolveSuccess = !!success;
        rt.finalResolveReason = reason;
        rt.finalSuccess = !!success;
        rt.finalFailed = !success;
        (gameState.monsters || []).forEach(m => {
            if (!m || !m.isP3M3Monster || !m.boss) return;
            m.boss.noPatternWaitTimer = 999999;
            m.boss.action = null;
            m.boss.activePattern = null;
            m.boss.runtimeActions = null;
            m.kbVx = 0;
            m.kbVy = 0;
        });
    },

    updateTargetUI(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !gameState.targetUI) return;
        const centerId = this.id(this.getSystem(gameState).Center_Area_ID || 902001);
        if (this.id(rt.currentAreaId) === centerId && rt.linkedBoss) {
            gameState.targetUI.monster = rt.linkedBoss;
            gameState.targetUI.timer = 999999;
            return;
        }
        const sideMonster = ['P1_CLONE', 'P2_CLONE']
            .map(role => rt.monstersByRole[role])
            .find(m => m && m.active);
        if (sideMonster) {
            gameState.targetUI.monster = sideMonster;
            gameState.targetUI.timer = 999999;
        }
    },

    update(gameState, deltaTime) {
        if (!this.isActive(gameState)) return;
        const rt = gameState.p3m3Runtime;
        rt.debugFrame = (parseInt(rt.debugFrame) || 0) + 1;
        if (this.updateDialogue(gameState, deltaTime)) {
            this.updateTargetUI(gameState);
            this.refreshDebugSnapshot(gameState, 0);
            return;
        }
        if (rt.intro && rt.intro.active) {
            this.updateIntroSequence(gameState, deltaTime);
            return;
        }
        if (this.updateHiddenClearReturn(gameState, deltaTime)) {
            return;
        }
        if (this.updateFailureFinalAttack(gameState, deltaTime)) {
            return;
        }
        if (rt.finalResolving) {
            if (rt.finalIssenDeathPending || (gameState.player && gameState.player.hp <= 0)) {
                const go = document.getElementById('gameOverScreen');
                if (go) go.style.display = 'none';
            }
            if (rt.finalCollapse && rt.finalCollapse.active) {
                rt.finalCollapse.timer = Math.min(Math.max(0.05, rt.finalCollapse.duration || 1.15), (rt.finalCollapse.timer || 0) + Math.max(0, deltaTime || 0));
            }
            rt.finalResolveTimer = Math.max(0, (rt.finalResolveTimer || 0) - deltaTime);
            if (rt.finalResolveTimer <= 0) {
                if (rt.finalResolveSuccess && rt.routeType === 'ROUTE_HIDDEN' && !rt.hiddenClearDialogueShown) {
                    rt.hiddenClearDialogueShown = true;
                    rt.finalResolving = false;
                    rt.hiddenWhiteBackdrop = true;
                    if (gameState.screenHitFlash && gameState.screenHitFlash.mode === 'fullwhite') gameState.screenHitFlash = null;
                    const casterId = this.id(rt.route && rt.route.Final_Attack_Caster_Monster_ID);
                    const startedClearDialogue = this.startDialogueByTrigger(gameState, 'ROUTE_HIDDEN_CLEAR', {
                        areaId: this.getSystem(gameState).Center_Area_ID || 902001,
                        routeId: rt.route && rt.route.Route_ID,
                        monsterId: casterId
                    });
                    if (!startedClearDialogue) this.executeRouteFinalResult(gameState, true, rt.finalResolveReason || 'FINAL_RESOLVE');
                } else {
                    this.executeRouteFinalResult(gameState, !!rt.finalResolveSuccess, rt.finalResolveReason || 'FINAL_RESOLVE');
                }
            } else {
                this.updateTargetUI(gameState);
                this.refreshDebugSnapshot(gameState, deltaTime);
            }
            return;
        }
        rt.timer = Math.max(0, (rt.timer || 0) - deltaTime);
        if (rt.timer <= 0) {
            const system = rt.system || this.getSystem(gameState);
            const failResultType = this.id(system.Time_Limit_Fail_Result_Type).toUpperCase();
            if (failResultType === 'FINAL_ATTACK_HIT_AND_RETURN_NORMAL_MAP') {
                this.executeResultType(gameState, failResultType, {
                    reason: 'TIME_LIMIT',
                    forceFailureSequence: true,
                    route: rt.route || this.getRouteById(gameState, system.Time_Limit_Fail_Route_ID) || null
                });
            } else if (failResultType === 'RETURN_NORMAL_MAP') {
                const restoreType = this.id(system.Fail_Boss_HP_Restore_Type).toUpperCase();
                const main = rt.linkedBoss;
                if (main && restoreType && restoreType !== 'KEEP_CURRENT') {
                    if (restoreType === 'RESTORE_TO_10_PERCENT' || restoreType === 'RESTORE_10_PERCENT') {
                        const entryHpRate = this.getPatternHpRate(gameState, rt.patternId, 0.1);
                        main.hp = Math.max(1, (main.maxHp || main.hp || 1) * entryHpRate);
                    } else if (restoreType === 'RESTORE_FULL' || restoreType === 'FULL') {
                        main.hp = Math.max(1, main.maxHp || main.hp || 1);
                    }
                }
                this.finish(gameState, false, 'TIME_LIMIT');
            } else {
                // 구버전 데이터 fallback: 실패 결과가 지정되지 않은 경우 기존 재시작 동작을 유지한다.
                this.restartPattern(gameState, 'TIME_LIMIT');
            }
            return;
        }

        const p = gameState.player;
        if (p && p.hp <= 0) {
            if (rt.finalStarted || rt.finalResolving) {
                rt.finalIssenDeathPending = true;
                rt.playerDeathPending = false;
                const go = document.getElementById('gameOverScreen');
                if (go) go.style.display = 'none';
                if (!rt.finalResolving) this.resolveFinal(gameState, false, 'FINAL_ISSEN_DEATH');
                this.updateTargetUI(gameState);
                this.refreshDebugSnapshot(gameState, deltaTime);
                return;
            }
            const combatMonster = (gameState.monsters || []).find(m => m && m.active && m.isP3M3Monster && !m.p3m3TalkStandby && this.id(m.p3m3Row && m.p3m3Row.Area_ID) === this.id(rt.currentAreaId));
            const failType = this.id(combatMonster && combatMonster.p3m3Row && combatMonster.p3m3Row.Fail_Result_Type).toUpperCase();
            if (failType) {
                this.executeResultType(gameState, failType, {
                    fallbackSuccess: false,
                    reason: 'MONSTER_BATTLE_DEATH',
                    preservePlayerDeath: true,
                    combatMonster
                });
                return;
            }
            if (!rt.playerDeathPending) {
                rt.playerDeathPending = true;
                rt.playerDeathReviveX = parseFloat(p.x) || 0;
                rt.playerDeathReviveY = parseFloat(p.y) || 0;
                rt.playerDeathReviveAreaId = rt.currentAreaId;
                p.p3m3ReviveX = rt.playerDeathReviveX;
                p.p3m3ReviveY = rt.playerDeathReviveY;
                p.p3m3ReviveAreaId = rt.playerDeathReviveAreaId;
            }
            this.updateTargetUI(gameState);
            this.refreshDebugSnapshot(gameState, deltaTime);
            return;
        } else if (rt.playerDeathPending && p && p.hp > 0) {
            rt.playerDeathPending = false;
        }

        for (const role of ['P1_CLONE', 'P2_CLONE']) {
            const m = rt.monstersByRole[role];
            if (m && m.hp <= 0 && !rt[role === 'P1_CLONE' ? 'leftResult' : 'rightResult']) {
                this.markAreaClear(gameState, role, 'KILL_CLEAR');
            }
        }

        this.updatePortals(gameState, deltaTime);
        if (rt.currentAreaId === this.id(this.getSystem(gameState).Center_Area_ID || 902001)) {
            this.updateRoute(gameState, deltaTime);
        }
        this.updateTargetUI(gameState);
        this.refreshDebugSnapshot(gameState, deltaTime);
    },

    refreshDebugSnapshot(gameState, deltaTime) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt) return;
        const prev = rt.debugLastByKey || {};
        const next = {};
        const rows = [];
        const monsters = (gameState.monsters || []).filter(m => m && m.active && (m.isP3M3Monster || m.p3m3MainBossSuppressed));
        monsters.forEach((m, index) => {
            const role = this.id(m.p3m3Role || (m.p3m3MainBossSuppressed ? 'MAIN_SUPPRESSED' : `M${index}`));
            const key = `${role}:${this.id(m.id || index)}`;
            const x = this.num(m.x, 0);
            const y = this.num(m.y, 0);
            const last = prev[key] || { x, y };
            const dx = x - this.num(last.x, x);
            const dy = y - this.num(last.y, y);
            next[key] = { x, y };

            const boss = m.boss || null;
            const action = boss && boss.action ? boss.action : null;
            const pattern = boss && boss.activePattern ? boss.activePattern : null;
            const move = boss && boss.actionMove ? boss.actionMove : null;
            const hidden = !!(boss && (boss.kasiyasP1M3RushHidden || boss.kasiyasP2M2Hidden || boss.kasiyasP3M2Hidden));

            rows.push({
                key,
                role,
                id: this.id(m.id),
                active: !!m.active,
                static: !!m.p3m3Static,
                suppressed: !!m.p3m3MainBossSuppressed,
                hidden,
                state: this.id(m.state),
                x,
                y,
                dx,
                dy,
                hp: this.num(m.hp, 0),
                maxHp: Math.max(1, this.num(m.maxHp, 1)),
                timer: this.num(m.timer, 0),
                noWait: boss ? this.num(boss.noPatternWaitTimer, 0) : 0,
                patternId: this.id(pattern && pattern.Pattern_ID),
                patternName: this.id(pattern && pattern.Pattern_Name),
                actionId: this.id(action && action.Action_ID),
                actionName: this.id(action && action.Action_Name),
                actionType: this.id(action && action.Action_Type),
                moveType: this.id(action && action.Action_Move_Type),
                moveDir: this.id(action && action.Action_Move_Direction),
                moveInfo: move ? {
                    type: this.id(move.type),
                    startX: this.num(move.startX, 0),
                    startY: this.num(move.startY, 0),
                    endX: this.num(move.endX, 0),
                    endY: this.num(move.endY, 0),
                    duration: this.num(move.duration, 0)
                } : null,
                allowed: boss && Array.isArray(boss.p3m3AllowedPatternIds) ? boss.p3m3AllowedPatternIds.join(',') : ''
            });
        });
        rt.debugLastByKey = next;
        rt.debugSnapshot = rows;
        rt.debugDeltaTime = deltaTime;
    },

    finish(gameState, success, reason = '', options = {}) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.active) return;
        rt.active = false;
        rt.finalSuccess = !!success;
        rt.finalFailed = !success;

        this.cleanupP3Monsters(gameState);
        const main = rt.linkedBoss;

        gameState.WORLD_WIDTH = rt.snapshot.worldW || gameState.WORLD_WIDTH;
        gameState.WORLD_DEPTH = rt.snapshot.worldD || gameState.WORLD_DEPTH;

        if (main) {
            main.p3m3MainBossSuppressed = false;
            if (main.boss) {
                main.boss.noPatternWaitTimer = success ? 999999 : 0.8;
                main.boss.activePattern = null;
                main.boss.action = null;
                main.boss.runtimeActions = null;
                main.boss.currentActionIndex = -1;
            }
            main.z = 0;
            main.vz = 0;
            main.kbVx = 0;
            main.kbVy = 0;
            if (success) {
                main.x = Math.max(0, (gameState.WORLD_WIDTH || rt.snapshot.worldW || 1400) / 2);
                main.y = Math.max(0, (gameState.WORLD_DEPTH || rt.snapshot.worldD || 300) / 2);
                const finalFaceDir = (rt.hiddenClearFinalFaceDir === -1 || rt.hiddenClearFinalFaceDir === 1)
                    ? rt.hiddenClearFinalFaceDir
                    : (main.faceDir === -1 ? -1 : 1);
                main.faceDir = finalFaceDir;
                main.pacingDir = finalFaceDir;
                main.state = 'DIE';
                main.deadTimer = 0;
                main.hp = 0;
            } else {
                main.x = rt.snapshot.bossX;
                main.y = rt.snapshot.bossY;
                main.faceDir = main.faceDir || -1;
            }
        }
        if (!success) {
            this.placePlayer(gameState, rt.snapshot.playerX, rt.snapshot.playerY);
            if ((reason === 'FINAL_ISSEN_DEATH' || options.preservePlayerDeath) && gameState.player) {
                const p = gameState.player;
                p.hp = 0;
                p.state = 'Die';
                p.atkTimer = 999;
                p.kbVx = 0;
                p.kbVy = 0;
                const go = document.getElementById('gameOverScreen');
                if (go) go.style.display = 'flex';
            }
        }
        gameState.specialMode = null;
        gameState.p3m3Runtime = null;
        gameState.hitboxes = [];
        gameState.bossAttackObjects = (gameState.bossAttackObjects || []).filter(obj => !(obj && (obj.p3m3 || obj.p3m3Terrain)));
        gameState.targetUI.monster = main || null;
        gameState.targetUI.timer = success ? 1.5 : 999999;
        if (success) {
            gameState.stageClearPending = true;
            gameState.isStageCleared = true;
            gameState.screenHitFlash = { life: 0.9, maxLife: 0.9, strength: 0.78, mode: 'fullwhite' };
            try { pushSystemNotice('던전 클리어', '#2ecc71', 2.0); } catch (e) {}
        } else {
            gameState.screenHitFlash = { life: 0.35, maxLife: 0.35, strength: 0.55, mode: 'red' };
            try { pushSystemNotice(`이면세계 이탈: ${reason}`, '#ff8a7a', 1.7); } catch (e) {}
        }
    }
};

window.P3M3FinalIssenSystem = P3M3FinalIssenSystem;
