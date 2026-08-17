// 3페이즈 대형 패턴3: 233008 세계를 가르는 일섬 전용 모드
// 공용 Stage/Boss/Portal/Action/Object 데이터 위에 P3_M3 전용 진행/대화 런타임만 얹는다.

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
        return (gameState.DB_DIALOGUE || [])
            .filter(row => (
                this.id(row.Dialogue_ID) === key &&
                this.id(row.Dialogue_Render_Type).toUpperCase() === 'DIALOGUE_BOX'
            ))
            .sort((a, b) => this.num(a.Line_Order, 0) - this.num(b.Line_Order, 0));
    },

    findDialogueFirstLine(gameState, triggerType, options = {}) {
        const trigger = this.id(triggerType).toUpperCase();
        if (!trigger) return null;
        const triggerValue = this.id(options.triggerValue);
        const rows = (gameState.DB_DIALOGUE || [])
            .filter(row => (
                this.id(row.Dialogue_Render_Type).toUpperCase() === 'DIALOGUE_BOX' &&
                this.id(row.Trigger_Type).toUpperCase() === trigger
            ))
            .sort((a, b) => this.num(a.Dialogue_ID, 0) - this.num(b.Dialogue_ID, 0));

        for (const row of rows) {
            const rowValue = this.id(row.Trigger_Value);
            if (triggerValue && rowValue !== triggerValue) continue;
            const lines = this.getDialogueRows(gameState, row.Dialogue_ID);
            if (lines.length > 0) return row;
        }
        return null;
    },

    findDialogueLineActions(gameState, dialogueId, lineOrder) {
        const key = `${this.id(dialogueId)}:${this.id(lineOrder)}`;
        if (!key || key === ':') return [];
        return this.getP3PatternActions(gameState)
            .filter(action => (
                this.id(action.Action_Condition_Type).toUpperCase() === 'DIALOGUE_LINE_START' &&
                this.id(action.Action_Condition_Value) === key
            ))
            .sort((a, b) => this.num(a.Action_ID, 0) - this.num(b.Action_ID, 0));
    },

    getDialogueActionSourceMonster(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.monstersByRole) return null;
        return rt.monstersByRole.CENTER_BOSS || rt.monstersByRole.TRUE_BOSS || null;
    },

    executeDialogueLineActions(gameState, dialogue, line) {
        if (!dialogue || !line) return false;
        const lineOrder = this.id(line.Line_Order);
        const actions = this.findDialogueLineActions(gameState, dialogue.dialogueId, lineOrder);
        if (!actions.length) return false;

        let executed = false;
        for (const action of actions) {
            const source = this.getDialogueActionSourceMonster(gameState);
            if (!source || !source.boss) continue;
            if (typeof MonsterManager !== 'undefined' && MonsterManager.onBossPatternActionStart) {
                MonsterManager.onBossPatternActionStart(source, action, gameState);
                executed = true;
            }
        }
        return executed;
    },

    applyCurrentDialogueLineActions(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        const dlg = rt && rt.dialogue;
        if (!dlg || !dlg.active) return false;
        const idx = Math.max(0, parseInt(dlg.index, 10) || 0);
        if (dlg.lastTriggeredLineIndex === idx) return false;
        dlg.lastTriggeredLineIndex = idx;
        const line = dlg.lines && dlg.lines[idx];
        return this.executeDialogueLineActions(gameState, dlg, line);
    },

    startDialogueByTrigger(gameState, triggerType, options = {}) {
        const first = this.findDialogueFirstLine(gameState, triggerType, options);
        if (!first) return false;
        return this.startDialogue(gameState, first.Dialogue_ID, {
            triggerType,
            triggerValue: options.triggerValue !== undefined ? options.triggerValue : first.Trigger_Value,
            contextRole: options.contextRole || ''
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
            triggerType: this.id(options.triggerType || lines[0].Trigger_Type).toUpperCase(),
            triggerValue: this.id(options.triggerValue !== undefined ? options.triggerValue : lines[0].Trigger_Value),
            contextRole: this.id(options.contextRole),
            consumedKeys: { KeyX: false, Space: false },
            lastTriggeredLineIndex: -1
        };
        if (gameState.keys) {
            gameState.keys.KeyX = false;
            gameState.keys.Space = false;
        }
        this.applyDialogueControl(gameState, lines[0]);
        this.applyCurrentDialogueLineActions(gameState);
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
            this.applyCurrentDialogueLineActions(gameState);
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
        const completed = {
            dialogueId: this.id(dlg.dialogueId),
            triggerType: this.id(dlg.triggerType).toUpperCase(),
            triggerValue: this.id(dlg.triggerValue),
            contextRole: this.id(dlg.contextRole)
        };
        rt.dialogue = null;
        if (gameState.keys) {
            gameState.keys.KeyX = false;
            gameState.keys.Space = false;
        }
        this.handleDialogueCompleted(gameState, completed);
        return true;
    },

    handleDialogueCompleted(gameState, dialogue) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !dialogue) return false;
        const triggerType = this.id(dialogue.triggerType).toUpperCase();
        const triggerValue = this.id(dialogue.triggerValue);

        if (triggerType === 'STAGE_ENTER') {
            let role = this.id(dialogue.contextRole).toUpperCase();
            if (!role) {
                if (triggerValue === this.getLeftStageId(gameState)) role = 'P1_CLONE';
                if (triggerValue === this.getRightStageId(gameState)) role = 'P2_CLONE';
            }
            if (role) {
                this.markAreaClear(gameState, role, 'TALK_CLEAR');
                return true;
            }
        }

        if (triggerType === 'EVENT' && triggerValue === 'P3_M3_HIDDEN_START') {
            this.startHiddenBattle(gameState, 'DIALOGUE_END');
            return true;
        }

        if (triggerType === 'EVENT' && triggerValue === 'P3_M3_HIDDEN_CLEAR') {
            this.startHiddenClearReturn(gameState, 'PATTERN_SUCCESS');
            return true;
        }

        return false;
    },

    getStage(gameState, stageId) {
        const key = this.id(stageId);
        return (gameState.DB_STAGE || []).find(row => this.id(row.Stage_ID) === key) || null;
    },

    getStageByType(gameState, stageType) {
        const key = this.id(stageType).toUpperCase();
        return (gameState.DB_STAGE || []).find(row => this.id(row.Stage_Type).toUpperCase() === key) || null;
    },

    getP3StageId(gameState, role, fallback = '') {
        const row = this.getStageByType(gameState, `P3_M3_${this.id(role).toUpperCase()}`);
        return this.id(row && row.Stage_ID) || this.id(fallback);
    },

    getCenterStageId(gameState) { return this.getP3StageId(gameState, 'CENTER', 601002); },
    getLeftStageId(gameState) { return this.getP3StageId(gameState, 'LEFT', 601003); },
    getRightStageId(gameState) { return this.getP3StageId(gameState, 'RIGHT', 601004); },

    getMonsterRow(gameState, roleOrId) {
        const roleMap = {
            CENTER_BOSS: { id: '209001', stageType: 'P3_M3_CENTER' },
            P1_CLONE: { id: '209002', stageType: 'P3_M3_LEFT' },
            P2_CLONE: { id: '209003', stageType: 'P3_M3_RIGHT' },
            TRUE_BOSS: { id: '209004', stageType: 'P3_M3_CENTER' }
        };
        const key = this.id(roleOrId);
        const upper = key.toUpperCase();
        let role = roleMap[upper] ? upper : '';
        if (!role) {
            role = Object.keys(roleMap).find(name => roleMap[name].id === key) || '';
        }
        if (!role) return null;
        const info = roleMap[role];
        const bossData = gameState && gameState.DB_MONSTER ? gameState.DB_MONSTER[info.id] || null : null;
        if (!bossData) return null;
        const stage = this.getStageByType(gameState, info.stageType);
        return {
            P3_M3_Monster_ID: info.id,
            Monster_Role: role,
            Stage_ID: this.id(stage && stage.Stage_ID),
            AI_Type: bossData.aiType || '',
            Model_Name: bossData.renderType || '',
            Boss_Data: bossData
        };
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

    getP3PatternActions(gameState) {
        const table = gameState && gameState.DB_BOSS_PATTERN_ACTION ? gameState.DB_BOSS_PATTERN_ACTION : {};
        return Object.values(table).filter(action => this.id(action && action.Pattern_ID) === '233008');
    },

    findP3Action(gameState, predicate, fallbackId = '') {
        const rows = this.getP3PatternActions(gameState);
        const found = rows.find(action => action && predicate(action));
        return found || (fallbackId ? this.getAction(gameState, fallbackId) : null);
    },

    getTimeLimitAction(gameState) {
        return this.findP3Action(
            gameState,
            action => this.id(action.Action_Type).toUpperCase() === 'PATTERN_TIME_LIMIT',
            243076
        );
    },

    getResultAction(gameState, resultType) {
        const result = this.id(resultType).toUpperCase();
        return this.findP3Action(gameState, action => (
            this.id(action.Action_Condition_Type).toUpperCase() === 'P3_M3_RESULT' &&
            this.id(action.Action_Condition_Value).toUpperCase() === result
        ), result === 'SUCCESS' ? 243077 : 243078);
    },

    getPatternObjectData(gameState, objectId) {
        const key = this.id(objectId);
        return gameState && gameState.DB_BOSS_PATTERN_OBJECT
            ? (gameState.DB_BOSS_PATTERN_OBJECT[key] || gameState.DB_BOSS_PATTERN_OBJECT[parseInt(key, 10)] || null)
            : null;
    },

    resolveRouteTypeFromPlayer(gameState) {
        const p = gameState && gameState.player;
        return p && p.p3TrialWillBuff && p.p3TrialBodyBuff ? 'ROUTE_HIDDEN' : 'ROUTE_NORMAL';
    },

    buildRuntimeRoute(gameState, routeType) {
        const type = this.id(routeType).toUpperCase() === 'ROUTE_HIDDEN' ? 'ROUTE_HIDDEN' : 'ROUTE_NORMAL';
        const hidden = type === 'ROUTE_HIDDEN';
        const charge = hidden
            ? this.findP3Action(gameState, a => this.id(a.Action_Condition_Type).toUpperCase() === 'OBJECT_REMOVE' && this.id(a.Action_Condition_Value) === '253019', 243074)
            : this.findP3Action(gameState, a => this.id(a.Action_Condition_Type).toUpperCase() === 'PORTAL_USED' && this.id(a.Action_Condition_Value) === '701004', 243072);
        const chargeId = this.id(charge && charge.Action_ID);
        const attack = hidden
            ? this.findP3Action(gameState, a => this.id(a.Action_Condition_Type).toUpperCase() === 'ACTION_END' && this.id(a.Action_Condition_Value) === chargeId && this.bool(a.Parry_Enable), 243075)
            : this.findP3Action(gameState, a => this.id(a.Action_Condition_Type).toUpperCase() === 'ACTION_END' && this.id(a.Action_Condition_Value) === chargeId && this.bool(a.ATK_Can_Guard), 243073);
        return {
            Route_ID: '',
            Route_Name: hidden ? '히든 분기' : '일반 분기',
            Route_Type: type,
            Start_State: hidden ? 'BATTLE_START' : 'NORMAL_ISSEN_READY',
            Target_Monster_ID: hidden ? 209004 : 209001,
            Final_Attack_Caster_Monster_ID: hidden ? 209004 : 209001,
            Final_Attack_Charge_Action_ID: this.id(charge && charge.Action_ID) || (hidden ? '243074' : '243072'),
            Final_Attack_ATK_Action_ID: this.id(attack && attack.Action_ID) || (hidden ? '243075' : '243073'),
            Final_Response_Type: hidden ? 'PARRY' : 'GUARD',
            Final_Attack_Start_Delay: 0
        };
    },

    getFinalResponseType(rt) {
        return this.id(rt && rt.route && rt.route.Final_Response_Type).toUpperCase();
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
        const resultAction = this.getResultAction(gameState, success ? 'SUCCESS' : 'FAIL');
        rt.resultActionId = this.id(resultAction && resultAction.Action_ID);
        if (success) {
            return this.finish(gameState, true, reason || 'P3_M3_RESULT_SUCCESS', { resultAction });
        }
        return this.finish(gameState, false, reason || 'P3_M3_RESULT_FAIL', {
            resultAction,
            preservePlayerDeath: !!(gameState.player && gameState.player.hp <= 0)
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
                this.id(m.p3m3Row && m.p3m3Row.Stage_ID) === this.id(rt.currentAreaId)
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
        return this.buildRuntimeRoute(gameState, rt.routeType || this.resolveRouteTypeFromPlayer(gameState));
    },

    getFailureAttackDamage(gameState, route, attackAction) {
        const rt = gameState && gameState.p3m3Runtime;
        const p = gameState && gameState.player;
        if (!rt || !p || !route || !attackAction) return 0;
        const casterId = this.id(route.Final_Attack_Caster_Monster_ID);
        const caster = (gameState.monsters || []).find(m => m && m.active && m.isP3M3Monster && this.id(m.p3m3Row && m.p3m3Row.P3_M3_Monster_ID) === casterId);
        const baseData = (gameState.DB_MONSTER || {})[casterId] || {};
        const baseAtk = Math.max(1, this.num(caster && caster.d && caster.d.atk, this.num(baseData.atk || baseData.ATK, 1)));
        const mainBoss = this.getMainBoss(gameState);
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
        const centerId = this.getCenterStageId(gameState);
        const remote = this.id(rt.currentAreaId) !== centerId;
        const skipCharge = remote || this.id(reason).toUpperCase() === 'TIME_LIMIT';
        const chargeDuration = skipCharge ? 0 : Math.max(0, this.num(charge && charge.Action_Anim_Duration, 0));
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
                const forcedCharge = (charge && !skipCharge) ? { ...charge, Action_Order: 1, Action_Condition_Type: 'NONE' } : null;
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

    getStageWorldSize(gameState, stageId, fallbackW = 1400, fallbackD = 400) {
        const stage = this.getStage(gameState, stageId) || {};
        return {
            w: Math.max(1, this.num(stage.Stage_Width, this.num(stage.Map_Size_X, fallbackW)) || fallbackW),
            d: Math.max(1, this.num(stage.Stage_Height, this.num(stage.Map_Size_Y, fallbackD)) || fallbackD)
        };
    },

    applyStageWorldSize(gameState, stageId) {
        if (!gameState) return { w: 1400, d: 400 };
        const size = this.getStageWorldSize(gameState, stageId, gameState.WORLD_WIDTH || 1400, gameState.WORLD_DEPTH || 400);
        gameState.WORLD_WIDTH = size.w;
        gameState.WORLD_DEPTH = size.d;
        const rt = gameState.p3m3Runtime;
        const stage = this.getStage(gameState, stageId);
        if (rt && stage) rt.worldMode = this.id(stage.Background_Render_Type || stage.Stage_Background_Type || rt.worldMode || 'INVERTED_BLACK_WHITE').toUpperCase();
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

        const timeLimitAction = this.getTimeLimitAction(gameState) || {};
        const timeLimitSeconds = Math.max(1, this.num(timeLimitAction.Action_Anim_Duration, 120));
        const routeType = this.resolveRouteTypeFromPlayer(gameState);
        const runtimeRoute = this.buildRuntimeRoute(gameState, routeType);
        const centerAreaId = this.getCenterStageId(gameState);
        const centerSize = this.getStageWorldSize(gameState, centerAreaId, 1400, 400);
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
            patternId: this.id(options.patternId || 233008),
            sourceActionId: this.id(options.sourceActionId || ''),
            introTotalDuration: Math.max(0.6, this.num(options.introDuration, 4.03)),
            snapshot,
            linkedBoss: bossMonster,
            currentAreaId: centerAreaId,
            centerAreaReturned: false,
            leftResult: null,
            rightResult: null,
            route: runtimeRoute,
            routeType,
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
            finalResponseSuccessPending: false,
            finalIssenDeathPending: false,
            failureSequence: null,
            playerDeathPending: false,
            playerDeathReviveX: null,
            playerDeathReviveY: null,
            playerDeathReviveAreaId: null,
            finalSuccess: false,
            finalFailed: false,
            timeLimitActionId: this.id(timeLimitAction.Action_ID || 243076),
            timeLimitTotal: timeLimitSeconds,
            timeLimitDisabled: false,
            timer: timeLimitSeconds,
            normalDefenceObject: null,
            normalDefenceCleared: false,
            normalDefenceBreakFx: null,
            hiddenDebuffObject: null,
            monstersByRole: {},
            debugFrame: 0,
            debugSnapshot: [],
            debugLastByKey: {},
            suppressMainBoss: true,
            worldMode: this.id((this.getStage(gameState, centerAreaId) || {}).Background_Render_Type || 'INVERTED_BLACK_WHITE').toUpperCase(),
            clearStates: {},
            clearedStageIds: {},
            portalCooldown: 0.35,
            noticeTimer: 0,
            dialogue: null,
            hiddenClearDialogueShown: false,
            hiddenBattleStarted: false,
            hiddenWhiteBackdrop: false,
            hiddenClearReturn: null,
            normalClearReturn: null,
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
        gameState.specialModeObjectDefenseIntroRuntime = null;
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
        this.applyStageWorldSize(gameState, areaId);
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
        } else if (this.id(areaId) === this.getLeftStageId(gameState)) {
            this.tryResolveTalkClearOrSpawn(gameState, 'P1_CLONE', 'leftResult');
        } else if (this.id(areaId) === this.getRightStageId(gameState)) {
            this.tryResolveTalkClearOrSpawn(gameState, 'P2_CLONE', 'rightResult');
        } else {
            this.spawnMonsterByRole(gameState, 'CENTER_BOSS');
            this.tryStartRoute(gameState);
        }
    },

    tryResolveTalkClearOrSpawn(gameState, role, resultKey) {
        const row = this.getMonsterRow(gameState, role);
        const rt = gameState.p3m3Runtime;
        if (!row || !rt || rt[resultKey]) return;
        const useDialogue = this.id(rt.routeType).toUpperCase() === 'ROUTE_HIDDEN';

        // NORMAL/HIDDEN은 패턴 시작 시 한 번 결정한다.
        // 같은 Monster_info 분신을 NORMAL에서는 전투용, HIDDEN에서는 대화용으로 사용한다.
        const clone = this.spawnMonsterByRole(gameState, role);
        if (useDialogue) {
            if (clone && clone.boss) {
                clone.boss.noPatternWaitTimer = 999999;
                clone.boss.action = null;
                clone.boss.activePattern = null;
                clone.boss.runtimeActions = null;
            }
            if (clone) clone.p3m3TalkStandby = true;
            const started = this.startDialogueByTrigger(gameState, 'STAGE_ENTER', {
                triggerValue: row.Stage_ID,
                contextRole: role
            });
            if (!started) this.markAreaClear(gameState, role, 'TALK_CLEAR');
        }
    },

    buildP3MonsterData(gameState, row) {
        if (!row) return null;
        const base = (gameState.DB_MONSTER || {})[this.id(row.P3_M3_Monster_ID)] || row.Boss_Data || null;
        return base ? { ...base } : null;
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
        const rightId = this.getRightStageId(gameState);
        gameState.bossAttackObjects.forEach(obj => {
            if (!obj || !obj.p3m3Terrain) return;
            if (nextId !== rightId || this.id(obj.p3m3TerrainAreaId) !== nextId) obj.active = false;
        });
        gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => obj && obj.active);
    },

    restartPattern(gameState, reason = '') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.active) return false;
        const timeLimitAction = this.getTimeLimitAction(gameState) || {};
        const timeLimitSeconds = Math.max(1, this.num(timeLimitAction.Action_Anim_Duration, 120));
        const routeType = this.resolveRouteTypeFromPlayer(gameState);
        const centerAreaId = this.getCenterStageId(gameState);
        const centerSize = this.getStageWorldSize(gameState, centerAreaId, 1400, 400);
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
        rt.clearedStageIds = {};
        rt.routeType = routeType;
        rt.route = this.buildRuntimeRoute(gameState, routeType);
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
        rt.timeLimitActionId = this.id(timeLimitAction.Action_ID || 243076);
        rt.timeLimitTotal = timeLimitSeconds;
        rt.timer = timeLimitSeconds;
        rt.normalDefenceObject = null;
        rt.normalDefenceCleared = false;
        rt.normalDefenceBreakFx = null;
        rt.hiddenDebuffObject = null;
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

        const p3Id = this.id(row.P3_M3_Monster_ID);
        const roleKey = this.id(row.Monster_Role).toUpperCase();
        const stage = this.getStage(gameState, row.Stage_ID);
        const spawnX = this.num(stage && (stage.Boss_Spawn_X ?? stage.Boss_Spawn_Center_X), (gameState.WORLD_WIDTH || 1400) / 2);
        const spawnY = this.num(stage && (stage.Boss_Spawn_Y ?? stage.Boss_Spawn_Center_Y), (gameState.WORLD_DEPTH || 300) / 2);
        const aiType = this.id(d.aiType).toUpperCase();
        const forceRuntime = aiType === 'NONE';
        const bossRuntime = MonsterManager.createBossRuntimeForMonster(d, gameState, { forceRuntime });
        const entity = {
            id: p3Id,
            d,
            active: true,
            spawner: null,
            isChampion: false,
            scale: d.scale || 1,
            x: spawnX,
            y: spawnY,
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
            isProvoked: aiType !== 'NONE',
            boss: bossRuntime,
            isP3M3Monster: true,
            p3m3Role: roleKey,
            p3m3Row: row,
            p3m3Static: aiType === 'NONE',
            p3m3ManualBossRuntime: forceRuntime
        };

        const player = gameState.player || null;
        if (player) {
            entity.faceDir = player.x < entity.x ? -1 : 1;
            entity.pacingDir = entity.faceDir;
        }

        if (entity.boss) {
            // 단계 전환은 본편 Boss에서만 사용한다. P3_M3에 소환된 독립 Boss는 다음 Boss가 없다.
            if (entity.boss.config) {
                entity.boss.config.Next_Boss_ID = '';
                entity.boss.config.Phase_Transition_Type = '';
            }
            if (entity.boss.phase) {
                entity.boss.phase.Next_Boss_ID = '';
                entity.boss.phase.Phase_Transition_Type = '';
            }
            entity.boss.noPatternWaitTimer = entity.p3m3Static
                ? 999999
                : Math.max(0, this.num(entity.boss.config && entity.boss.config.No_Pattern_Wait_Time, 0.2));
            // P3 분신의 Late_Phase_HP_Rate=1.0 및 BOSS_PATTERN_BASIC은 공용 Boss Runtime에서 이미 해석된다.
            entity.boss.lateNoticeShown = true;
        }

        gameState.monsters.push(entity);
        rt.monstersByRole[entity.p3m3Role] = entity;
        const showLocalHp = this.id(rt.routeType).toUpperCase() === 'ROUTE_NORMAL'
            && (roleKey === 'P1_CLONE' || roleKey === 'P2_CLONE');
        if (showLocalHp) {
            gameState.targetUI.monster = entity;
            gameState.targetUI.timer = 999999;
        }
        return entity;
    },

    handleBossChangeAction(sourceMonster, action, gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.active || !sourceMonster || !action) return false;

        const targetBossId = this.id(action.Change_Boss_ID);
        if (!targetBossId) return false;
        const targetRow = this.getMonsterRow(gameState, targetBossId);
        if (!targetRow) return false;

        const currentId = this.id(sourceMonster.p3m3Row && sourceMonster.p3m3Row.P3_M3_Monster_ID);
        if (currentId === targetBossId) return true;

        const sourceRole = this.id(sourceMonster.p3m3Role).toUpperCase();
        const targetRole = this.id(targetRow.Monster_Role).toUpperCase();
        const snapshot = {
            x: this.num(sourceMonster.x, (gameState.WORLD_WIDTH || 1400) / 2),
            y: this.num(sourceMonster.y, (gameState.WORLD_DEPTH || 400) / 2),
            z: this.num(sourceMonster.z, 0),
            faceDir: sourceMonster.faceDir === -1 ? -1 : 1,
            pacingDir: sourceMonster.pacingDir === -1 ? -1 : 1
        };

        if (sourceRole) this.deactivateMonsterRole(gameState, sourceRole);
        const changedBoss = this.spawnMonsterByRole(gameState, targetRole || targetBossId);
        if (!changedBoss) return false;

        changedBoss.x = snapshot.x;
        changedBoss.y = snapshot.y;
        changedBoss.z = snapshot.z;
        changedBoss.faceDir = snapshot.faceDir;
        changedBoss.pacingDir = snapshot.pacingDir;
        changedBoss.kbVx = 0;
        changedBoss.kbVy = 0;
        changedBoss.vz = 0;
        changedBoss.state = 'IDLE';
        changedBoss.p3m3Static = true;
        changedBoss.p3m3TalkStandby = this.isDialogueActive(gameState);

        if (changedBoss.boss) {
            changedBoss.boss.activePattern = null;
            changedBoss.boss.action = null;
            changedBoss.boss.runtimeActions = null;
            changedBoss.boss.currentActionIndex = -1;
            changedBoss.boss.actionMove = null;
            changedBoss.boss.actionMoveCompleted = false;
            changedBoss.boss.noPatternWaitTimer = 999999;
        }

        rt.hiddenBossChanged = true;
        this.updateTargetUI(gameState);
        return true;
    },

    normalizeAreaResult(value) {
        const raw = this.id(value).toUpperCase();
        if (!raw) return '';
        if (raw === 'ANY_CLEAR') return 'ANY_CLEAR';
        if (raw.includes('TALK_CLEAR')) return 'TALK_CLEAR';
        if (raw.includes('KILL_CLEAR')) return 'KILL_CLEAR';
        return raw;
    },

    markAreaClear(gameState, role, resultType) {
        const rt = gameState.p3m3Runtime;
        const row = this.getMonsterRow(gameState, role);
        if (!rt || !row) return;
        const side = role === 'P1_CLONE' ? 'leftResult' : (role === 'P2_CLONE' ? 'rightResult' : null);
        if (!side || rt[side]) return;

        const canonical = this.normalizeAreaResult(resultType) || this.id(resultType).toUpperCase();
        rt[side] = canonical;
        rt[`${side}Data`] = canonical;

        const stage = this.getStage(gameState, row.Stage_ID);
        const clearType = this.id(stage && stage.Stage_Clear_Cond_Type).toUpperCase();
        const clearValue = this.id(stage && stage.Stage_Clear_Cond_Value);
        const bossResolved = clearType === 'MONSTER_CLEAR' && (!clearValue || clearValue === this.id(row.P3_M3_Monster_ID));
        if (bossResolved) {
            if (!rt.clearedStageIds) rt.clearedStageIds = {};
            rt.clearedStageIds[this.id(row.Stage_ID)] = true;
        }

        const monster = rt.monstersByRole[role];
        this.cleanupP3M3MonsterObjects(gameState, role, monster);
        if (monster) monster.active = false;
    },

    checkPortalCondition(gameState, conditionType, conditionValue) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt) return false;
        const cond = this.id(conditionType).toUpperCase();
        const value = this.id(conditionValue);
        if (!cond || cond === 'NONE') return true;
        if (cond === 'PATTERN_START') {
            return !value || this.id(rt.patternId) === value;
        }
        if (cond === 'STAGE_CLEAR') {
            return !!(value && rt.clearedStageIds && rt.clearedStageIds[value]);
        }
        return false;
    },

    getActivePortals(gameState) {
        const rt = gameState.p3m3Runtime;
        if (!rt) return [];
        return (gameState.DB_PORTAL || []).filter(portal => {
            if (this.id(portal.From_Stage_ID) !== rt.currentAreaId) return false;
            const active = this.checkPortalCondition(gameState, portal.Active_Cond_Type, portal.Active_Cond_Value);
            const deactiveType = this.id(portal.DeActive_Cond_Type);
            const deactive = deactiveType && deactiveType.toUpperCase() !== 'NONE'
                ? this.checkPortalCondition(gameState, deactiveType, portal.DeActive_Cond_Value)
                : false;
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
                const transitionType = this.id(portal.Transition_Type).toUpperCase();
                if (transitionType !== 'MOVE_STAGE') continue;
                const fromStage = this.id(portal.From_Stage_ID || rt.currentAreaId);
                const toStage = this.id(portal.To_Stage_ID);
                const centerStageId = this.getCenterStageId(gameState);
                if (toStage === centerStageId && fromStage !== centerStageId) rt.centerAreaReturned = true;
                this.enterArea(gameState, toStage, {
                    arriveX: this.num(portal.Player_Arrive_X, p.x),
                    arriveY: this.num(portal.Player_Arrive_Y, p.y),
                    spawnCenter: toStage === centerStageId
                });
                if (this.id(portal.Portal_ID) === '701004' && rt.routeType === 'ROUTE_NORMAL' && rt.leftResult && rt.rightResult) {
                    this.startNormalFinalSequence(gameState, 'PORTAL_USED_701004');
                }
                return;
            }
        }
    },

    tryStartRoute(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.routeStarted || !rt.leftResult || !rt.rightResult) return;
        if (this.id(rt.currentAreaId) !== this.getCenterStageId(gameState)) return;
        rt.route = rt.route || this.buildRuntimeRoute(gameState, rt.routeType || this.resolveRouteTypeFromPlayer(gameState));
        rt.routeType = this.id(rt.route && rt.route.Route_Type).toUpperCase() || this.resolveRouteTypeFromPlayer(gameState);

        if (rt.routeType === 'ROUTE_HIDDEN') {
            rt.routeStarted = true;
            const centerBoss = rt.monstersByRole && rt.monstersByRole.CENTER_BOSS;
            if (centerBoss) {
                centerBoss.p3m3Static = true;
                centerBoss.p3m3TalkStandby = true;
                if (centerBoss.boss) {
                    centerBoss.boss.noPatternWaitTimer = 999999;
                    centerBoss.boss.action = null;
                    centerBoss.boss.activePattern = null;
                    centerBoss.boss.runtimeActions = null;
                    centerBoss.boss.currentActionIndex = -1;
                }
            }
            const startedDialogue = this.startDialogueByTrigger(gameState, 'EVENT', {
                triggerValue: 'P3_M3_HIDDEN_START'
            });
            if (!startedDialogue) this.startHiddenBattle(gameState, 'NO_DIALOGUE');
            return;
        }

        this.startNormalFinalSequence(gameState, 'CENTER_RETURN_FALLBACK');
    },

    startHiddenBattle(gameState, reason = '') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.routeType !== 'ROUTE_HIDDEN') return false;
        let trueBoss = rt.monstersByRole && rt.monstersByRole.TRUE_BOSS;
        if (!trueBoss) {
            const changeAction = this.findP3Action(
                gameState,
                action => (
                    this.id(action.Action_Type).toUpperCase() === 'MONSTER_CHANGE' &&
                    this.id(action.Change_Boss_ID) === '209004'
                ),
                243079
            );
            const source = rt.monstersByRole && rt.monstersByRole.CENTER_BOSS;
            if (source && changeAction) this.handleBossChangeAction(source, changeAction, gameState);
            trueBoss = rt.monstersByRole && rt.monstersByRole.TRUE_BOSS;
        }
        if (trueBoss) {
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
        // 히든 전력전부터는 20초 생명력 침식 오브젝트가 진행 기준이 된다.
        // 기존 120초 '카시야스 정신 집중' 제한시간은 여기서 종료한다.
        rt.timeLimitDisabled = true;
        rt.trueBossDrainTimer = 0;
        this.createHiddenDebuffObject(gameState);
        rt.hiddenFinalPhase = 'NONE';
        rt.hiddenFinalReason = '';
        rt.hiddenFinalCenterMove = null;
        rt.hiddenWhiteBackdrop = false;
        if (gameState && gameState.screenHitFlash && gameState.screenHitFlash.mode === 'fullwhite') gameState.screenHitFlash = null;
        this.updateTargetUI(gameState);
        return true;
    },

    updateRoute(gameState, deltaTime) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt) return;
        this.updateP3M3ObjectVisualTimers(rt, deltaTime);
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
        if (rt.routeType === 'ROUTE_HIDDEN') {
            if (!rt.hiddenBattleStarted) {
                this.startHiddenBattle(gameState, 'HIDDEN_ROUTE_READY');
                return;
            }
            if (rt.hiddenFinalPhase && rt.hiddenFinalPhase !== 'NONE') {
                this.updateHiddenFinalPreparation(gameState, deltaTime);
                return;
            }
            this.updateHiddenDebuffObject(gameState, deltaTime);
        }
    },

    queueHiddenFinalSequence(gameState, reason = '') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.routeType !== 'ROUTE_HIDDEN' || rt.finalPending || rt.finalStarted || rt.finalResolving) return false;
        if (rt.hiddenFinalPhase && rt.hiddenFinalPhase !== 'NONE') return false;
        const trueBoss = rt.monstersByRole && rt.monstersByRole.TRUE_BOSS;
        const main = rt.linkedBoss;
        const threshold = 0.01;
        if (main) {
            const maxHp = Math.max(1, main.maxHp || main.hp || 1);
            main.hp = Math.max(1, Math.min(main.hp || maxHp, maxHp * threshold));
        }
        rt.hiddenFinalPhase = 'WAIT_ACTION_END';
        rt.hiddenFinalReason = reason || 'OBJECT_REMOVE_253019';
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
        const centerAreaId = this.getCenterStageId(gameState) || rt.currentAreaId;
        const size = this.getStageWorldSize(gameState, centerAreaId, gameState.WORLD_WIDTH || 1400, gameState.WORLD_DEPTH || 400);
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

    createNormalDefenceObject(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.normalDefenceObject || rt.normalDefenceCleared) return rt && rt.normalDefenceObject;
        const data = this.getPatternObjectData(gameState, 253018) || {};
        rt.normalDefenceObject = {
            objectId: '253018',
            data,
            active: true,
            hitCount: 0,
            maxHits: Math.max(1, this.num(data.Object_Remove_Value, 10)),
            hitFlashTimer: 0,
            age: 0
        };
        return rt.normalDefenceObject;
    },

    startNormalFinalSequence(gameState, reason = '') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.routeType !== 'ROUTE_NORMAL' || rt.finalStarted || rt.finalPending) return false;
        if (!rt.leftResult || !rt.rightResult || this.id(rt.currentAreaId) !== this.getCenterStageId(gameState)) return false;
        rt.route = rt.route || this.buildRuntimeRoute(gameState, 'ROUTE_NORMAL');
        rt.routeStarted = true;
        this.createNormalDefenceObject(gameState);
        // 243072 자체가 10초 대기 Action이므로 별도 하드코딩 타이머를 두지 않는다.
        return this.startFinalAttack(gameState, reason || 'PORTAL_USED_701004');
    },

    createHiddenDebuffObject(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || rt.hiddenDebuffObject) return rt && rt.hiddenDebuffObject;
        const data = this.getPatternObjectData(gameState, 253019) || {};
        rt.hiddenDebuffObject = {
            objectId: '253019',
            data,
            active: true,
            elapsed: 0,
            duration: Math.max(0.1, this.num(data.Object_Internal_Duration, 20)),
            ratePerSecond: Math.max(0, this.num(data.Object_Interact_Value, 0.0045)),
            naturalExpired: false,
            age: 0
        };
        return rt.hiddenDebuffObject;
    },

    updateP3M3ObjectVisualTimers(rt, deltaTime) {
        if (!rt) return;
        const dt = Math.max(0, this.num(deltaTime, 0));
        if (rt.normalDefenceObject) {
            rt.normalDefenceObject.age = (rt.normalDefenceObject.age || 0) + dt;
            rt.normalDefenceObject.hitFlashTimer = Math.max(0, (rt.normalDefenceObject.hitFlashTimer || 0) - dt);
        }
        if (rt.hiddenDebuffObject) rt.hiddenDebuffObject.age = (rt.hiddenDebuffObject.age || 0) + dt;
        if (rt.normalDefenceBreakFx) {
            rt.normalDefenceBreakFx.timer = Math.max(0, (rt.normalDefenceBreakFx.timer || 0) - dt);
            if (rt.normalDefenceBreakFx.timer <= 0) rt.normalDefenceBreakFx = null;
        }
    },

    updateHiddenDebuffObject(gameState, deltaTime) {
        const rt = gameState && gameState.p3m3Runtime;
        const obj = rt && rt.hiddenDebuffObject;
        const main = rt && rt.linkedBoss;
        if (!rt || !obj || !obj.active || !main || rt.routeType !== 'ROUTE_HIDDEN') return false;
        if (rt.finalPending || rt.finalStarted || rt.finalResolving) return false;
        const dt = Math.max(0, this.num(deltaTime, 0));
        const maxHp = Math.max(1, main.maxHp || main.hp || 1);
        const minHp = Math.max(1, maxHp * 0.01);
        if (this.id(obj.data && obj.data.Object_Interact_Type).toUpperCase() === 'BOSS_MAX_HP_RATE_PER_SEC_DECREASE') {
            main.hp = Math.max(minHp, (parseFloat(main.hp) || maxHp) - maxHp * obj.ratePerSecond * dt);
        }
        obj.elapsed = Math.min(obj.duration, (obj.elapsed || 0) + dt);
        if (obj.elapsed >= obj.duration) {
            obj.active = false;
            obj.naturalExpired = true;
            main.hp = Math.max(1, Math.min(parseFloat(main.hp) || minHp, minHp));
            this.queueHiddenFinalSequence(gameState, 'OBJECT_REMOVE_253019');
            return true;
        }
        return false;
    },

    onPlayerAttackBossObjectHit(m, baseDmg, gameState) {
        if (!this.isActive(gameState) || !m || !m.isP3M3Monster) return false;
        const rt = gameState.p3m3Runtime;
        const obj = rt && rt.normalDefenceObject;
        if (!rt || rt.routeType !== 'ROUTE_NORMAL' || !obj || !obj.active) return false;
        if (this.id(m.p3m3Role).toUpperCase() !== 'CENTER_BOSS') return false;
        obj.hitCount = Math.min(obj.maxHits, (obj.hitCount || 0) + 1);
        obj.hitFlashTimer = 0.16;
        if (obj.hitCount >= obj.maxHits) {
            obj.active = false;
            rt.normalDefenceCleared = true;
            rt.normalDefenceBreakFx = { timer: 0.46, maxTimer: 0.46 };
            try {
                if (gameState.camera) {
                    gameState.camera.shakeTime = Math.max(gameState.camera.shakeTime || 0, 0.28);
                    gameState.camera.shakeIntensity = Math.max(gameState.camera.shakeIntensity || 0, 7);
                }
            } catch (e) {}
        }
        return true;
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
        caster.p3m3HoldFinalPose = false;
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
        if (rt.finalResponseSuccessPending) {
            const total = Math.max(0.1, (parseFloat(rt.finalChargeDuration) || 0) + (parseFloat(rt.finalAttackDuration) || 0));
            if ((parseFloat(rt.finalTimelineElapsed) || 0) >= total - 0.001) {
                rt.finalResponseSuccessPending = false;
                this.resolveFinal(gameState, true, rt.finalResolveReason || 'GUARD_SUCCESS');
            }
            return;
        }
        const active = (gameState.monsters || []).find(m => m && m.active && m.isP3M3Monster && m.boss && (
            this.id(m.boss.action && m.boss.action.Action_ID) === rt.finalAttackActionId ||
            this.id(m.boss.activePattern && m.boss.activePattern.Pattern_ID).indexOf('P3_M3_FINAL_') === 0
        ));
        if (!active) this.resolveFinal(gameState, false, 'MISS_FINAL_RESPONSE');
    },

    onPlayerGuardResult(m, action, result, gameState) {
        if (!this.isActive(gameState) || !action) return;
        const rt = gameState.p3m3Runtime;
        if (rt && rt.failureSequence && rt.failureSequence.active) return;
        const actionId = this.id(action.Action_ID);
        if (actionId !== rt.finalAttackActionId) return;
        const responseType = this.getFinalResponseType(rt);
        if (responseType !== 'GUARD' && responseType) return;
        const responseReady = rt.routeType !== 'ROUTE_NORMAL' || !!rt.normalDefenceCleared;
        if (result && result.guarded && responseReady) {
            // 파훼 성공 여부만 먼저 기록한다. 일섬 Action/VFX는 끝까지 재생한 뒤 성공 복귀 연출로 넘어간다.
            rt.finalResponseSuccessPending = true;
            rt.finalResolveReason = 'GUARD_SUCCESS';
        } else {
            // 방어 버프를 파훼하지 못했다면 가드 입력 자체가 성공해도 최종 일섬 피해를 적용한다.
            if (result && result.guarded && !responseReady) {
                this.applyFailureFinalAttackDamage(gameState, rt.route, action);
            }
            this.resolveFinal(gameState, false, result && result.guarded ? 'DEFENCE_BUFF_REMAIN' : 'GUARD_FAIL');
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
            // 중앙 맵 실패 연출에서는 시전 동작이 진행되는 동안만 기존 보스 액션 업데이트를 통과시킨다.
            // 일섬 동작이 끝난 뒤 복귀 연출까지의 시간에는 마지막 베기 자세를 고정한다.
            if (seq.playCasterAction && casterId && selfId === casterId) {
                const localElapsed = Math.max(0, (parseFloat(seq.elapsed) || 0) - Math.max(0, parseFloat(seq.leadDuration) || 0));
                const actionTotal = Math.max(0.05, (parseFloat(rt.finalChargeDuration) || 0) + (parseFloat(rt.finalAttackDuration) || 0));
                if (localElapsed < actionTotal) return false;
                const holdAction = this.getAction(gameState, this.id(seq.route && seq.route.Final_Attack_ATK_Action_ID) || rt.finalAttackActionId);
                if (m.boss && holdAction) {
                    m.boss.action = { ...holdAction };
                    m.boss.activePattern = null;
                    m.boss.runtimeActions = null;
                    m.boss.currentActionIndex = -1;
                    m.boss.noPatternWaitTimer = 999999;
                    m.timer = Math.max(0.001, this.num(holdAction.Action_Anim_Duration, rt.finalAttackDuration || 2));
                    m.state = 'ATK';
                    m.p3m3HoldFinalPose = true;
                }
                m.kbVx = 0;
                m.kbVy = 0;
                m.vz = 0;
                m.z = 0;
                return true;
            }
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
        if (rt && rt.finalResponseSuccessPending && rt.finalStarted && m.isP3M3Monster) {
            const casterId = this.id(rt.route && rt.route.Final_Attack_Caster_Monster_ID);
            const selfId = this.id(m.p3m3Row && m.p3m3Row.P3_M3_Monster_ID);
            if (casterId && selfId === casterId) {
                const currentId = this.id(m.boss && m.boss.action && m.boss.action.Action_ID);
                if (currentId === this.id(rt.finalAttackActionId)) return false;
                const holdAction = this.getAction(gameState, rt.finalAttackActionId);
                if (m.boss && holdAction) {
                    m.boss.noPatternWaitTimer = 999999;
                    m.boss.activePattern = null;
                    m.boss.runtimeActions = null;
                    m.boss.currentActionIndex = -1;
                    m.boss.action = { ...holdAction };
                    m.timer = Math.max(0.001, this.num(holdAction.Action_Anim_Duration, rt.finalAttackDuration || 2));
                    m.state = 'ATK';
                    m.p3m3HoldFinalPose = true;
                }
                m.kbVx = 0;
                m.kbVy = 0;
                m.vz = 0;
                m.z = 0;
                return true;
            }
        }
        if (rt && rt.normalClearReturn && rt.normalClearReturn.active && m === rt.linkedBoss) {
            m.kbVx = 0;
            m.kbVy = 0;
            m.vz = 0;
            m.z = 0;
            if (rt.normalClearStageRestored) {
                m.p3m3MainBossSuppressed = false;
                m.state = 'GROGGY';
                m.p3m3SuccessGroggyHold = true;
                if (m.boss) {
                    m.boss.noPatternWaitTimer = 999999;
                    m.boss.action = {
                        Action_ID: 'P3_M3_SUCCESS_GROGGY_HOLD',
                        Action_Name: '3단계 그로기 자세 유지',
                        Action_Type: 'WAIT',
                        Action_Pose_Type: 'POSE_KASIYAS_P3_GROGGY',
                        Action_Anim_Duration: 999999
                    };
                    m.timer = 0;
                }
            }
            return true;
        }
        if (rt && rt.finalResolving && (m.isP3M3Monster || m.p3m3MainBossSuppressed)) {
            // 최종 일섬의 화면 파괴/피해/복귀 연출이 끝날 때까지 AI 재개를 막는다.
            m.kbVx = 0;
            m.kbVy = 0;
            m.vz = 0;
            m.z = Math.max(0, parseFloat(m.z) || 0);
            if (m.p3m3HoldFinalPose && m.boss && m.boss.action) {
                const holdDur = Math.max(0.001, this.num(m.boss.action.Action_Anim_Duration, rt.finalAttackDuration || 2));
                m.timer = holdDur;
                m.state = 'ATK';
                m.boss.noPatternWaitTimer = 999999;
            } else if (m.state === 'Walk' || m.state === 'Run' || m.state === 'CHASE' || m.state === 'BOUNDARY') {
                m.state = 'IDLE';
            }
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

    getNormalStageForReturn(gameState, rt) {
        const snapshotId = this.id(rt && rt.snapshot && rt.snapshot.stageId);
        return this.getStage(gameState, snapshotId) || this.getStageByType(gameState, 'NORMAL') || this.getStage(gameState, 601001) || (rt && rt.snapshot && rt.snapshot.stage) || null;
    },

    restoreNormalStageForSuccess(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.active) return false;
        const stage = this.getNormalStageForReturn(gameState, rt) || {};
        const stageId = this.id(stage.Stage_ID || (rt.snapshot && rt.snapshot.stageId) || 601001);
        const worldW = Math.max(1, this.num(stage.Stage_Width, this.num(stage.Map_Size_X, rt.snapshot && rt.snapshot.worldW || 1400)) || 1400);
        const worldD = Math.max(1, this.num(stage.Stage_Height, this.num(stage.Map_Size_Y, rt.snapshot && rt.snapshot.worldD || 400)) || 400);
        const playerX = this.num(stage.Player_Spawn_X, this.num(stage.Player_Start_Center_X, 300));
        const playerY = this.num(stage.Player_Spawn_Y, this.num(stage.Player_Start_Center_Y, worldD / 2));
        const bossX = this.num(stage.Boss_Spawn_X, this.num(stage.Boss_Spawn_Center_X, 1000));
        const bossY = this.num(stage.Boss_Spawn_Y, this.num(stage.Boss_Spawn_Center_Y, worldD / 2));

        this.cleanupP3Monsters(gameState);
        // 히든 종료 대화에서 사용하던 백색 배경은 성공 복귀 화면이 완전히 가린 상태에서 해제한다.
        // 이후 백색 암전이 걷힐 때 원래 Stage가 자연스럽게 드러난다.
        rt.hiddenWhiteBackdrop = false;
        gameState.WORLD_WIDTH = worldW;
        gameState.WORLD_DEPTH = worldD;
        gameState.currentStageId = stageId || (rt.snapshot && rt.snapshot.stageId);
        gameState.currentStage = stage || (rt.snapshot && rt.snapshot.stage) || gameState.currentStage;
        try {
            if (typeof GameRenderer !== 'undefined' && typeof GameRenderer.rebuildStageBackground === 'function') {
                GameRenderer.rebuildStageBackground(gameState.currentStage, worldW, worldD);
            }
        } catch (e) {}

        const p = gameState.player;
        if (p) {
            this.placePlayer(gameState, playerX, playerY, { forceIdle: true, clearKeys: true });
            p.faceDir = 1;
        }

        const main = rt.linkedBoss;
        if (main) {
            main.p3m3MainBossSuppressed = false;
            main.x = bossX;
            main.y = bossY;
            main.z = 0;
            main.vz = 0;
            main.kbVx = 0;
            main.kbVy = 0;
            main.faceDir = -1;
            main.pacingDir = -1;
            main.state = 'GROGGY';
            main.p3m3SuccessGroggyHold = true;
            if (main.boss) {
                main.boss.noPatternWaitTimer = 999999;
                main.boss.activePattern = null;
                main.boss.runtimeActions = null;
                main.boss.currentActionIndex = -1;
                main.boss.actionMove = null;
                main.boss.actionMoveCompleted = false;
                main.boss.action = {
                    Action_ID: 'P3_M3_SUCCESS_GROGGY_HOLD',
                    Action_Name: '3단계 그로기 자세 유지',
                    Action_Type: 'WAIT',
                    Action_Pose_Type: 'POSE_KASIYAS_P3_GROGGY',
                    Action_Anim_Duration: 999999
                };
                main.timer = 0;
            }
        }
        rt.currentAreaId = stageId;
        rt.normalClearStageRestored = true;
        gameState.hitboxes = [];
        gameState.bossAttackObjects = (gameState.bossAttackObjects || []).filter(obj => !(obj && (obj.p3m3 || obj.p3m3Terrain)));
        if (gameState.targetUI && main) {
            gameState.targetUI.monster = main;
            gameState.targetUI.timer = 999999;
        }
        return true;
    },

    startNormalClearReturn(gameState, reason = 'GUARD_SUCCESS') {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !rt.active || (rt.normalClearReturn && rt.normalClearReturn.active)) return false;
        rt.finalEffectSuppressed = true;
        rt.finalResolving = false;
        rt.normalClearStageRestored = false;
        // 성공 복귀는 화면을 완전히 백색으로 덮은 뒤, 가려진 동안 원래 Stage를 복구하고
        // 백색이 걷히면서 3단계 그로기 자세를 보여준 후 마지막 HP 감소를 적용한다.
        rt.normalClearReturn = {
            active: true,
            timer: 0,
            swapAt: 0.70,
            damageAt: 2.00,
            duration: 2.20,
            reason: reason || 'GUARD_SUCCESS',
            damageApplied: false
        };
        gameState.screenHitFlash = {
            life: 2.20,
            maxLife: 2.20,
            strength: 1.0,
            mode: 'fullwhite',
            rampTime: 0.26,
            peakFlashTime: 0.10,
            fadeOutTime: 0.62,
            maxAlpha: 1.0,
            pureWhite: true
        };
        return true;
    },

    updateNormalClearReturn(gameState, deltaTime) {
        const rt = gameState && gameState.p3m3Runtime;
        const ret = rt && rt.normalClearReturn;
        if (!ret || !ret.active) return false;
        const dt = Math.max(0, parseFloat(deltaTime) || 0);
        ret.timer = Math.max(0, (parseFloat(ret.timer) || 0) + dt);
        if (!rt.normalClearStageRestored && ret.timer >= Math.max(0.05, parseFloat(ret.swapAt) || 0.34)) {
            this.restoreNormalStageForSuccess(gameState);
        }
        if (!ret.damageApplied && ret.timer >= Math.max(0.1, parseFloat(ret.damageAt) || 0.88)) {
            ret.damageApplied = true;
            const resultAction = this.getResultAction(gameState, 'SUCCESS');
            rt.resultActionId = this.id(resultAction && resultAction.Action_ID);
            this.finish(gameState, true, ret.reason || 'GUARD_SUCCESS', { resultAction, normalReturnComplete: true });
            return true;
        }
        this.updateTargetUI(gameState);
        this.refreshDebugSnapshot(gameState, dt);
        return true;
    },

    startHiddenClearReturn(gameState, reason = 'PATTERN_END') {
        // 히든 성공도 일반 성공과 같은 복귀 문법을 사용한다.
        // 종료 대화가 끝나는 즉시 백색 암전 → 원래 Stage 복구 → 그로기 자세 → 잔여 HP 제거 순서로 진행한다.
        return this.startNormalClearReturn(gameState, reason || 'PATTERN_END');
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
        const hiddenParrySuccess = success && rt.routeType === 'ROUTE_HIDDEN' && reason === 'PARRY_SUCCESS';
        // 일반 Guard 성공은 일섬 이펙트를 끝까지 보여준다.
        // 히든 Parry 성공은 기존 연출처럼 즉시 최종 일섬 잔여 이펙트를 정리하고 백색 배경에서 종료 대화로 전환한다.
        rt.finalEffectSuppressed = hiddenParrySuccess ? true : (!!rt.finalEffectSuppressed && !success);
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
            // 히든 Parry 성공 직후에는 기존 연출처럼 백색 배경으로 전환한 뒤 그 상태에서 종료 대화를 진행한다.
            rt.hiddenWhiteBackdrop = true;
            gameState.screenHitFlash = { life: 0.35, maxLife: 0.35, strength: 0.84, mode: 'fullwhite' };
        }
        rt.finalResolveSuccess = !!success;
        rt.finalResolveReason = reason;
        rt.finalSuccess = !!success;
        rt.finalFailed = !success;
        const finalCasterId = this.id(rt.route && rt.route.Final_Attack_Caster_Monster_ID);
        const finalHoldAction = this.getAction(gameState, rt.finalAttackActionId);
        (gameState.monsters || []).forEach(m => {
            if (!m || !m.isP3M3Monster || !m.boss) return;
            const selfId = this.id(m.p3m3Row && m.p3m3Row.P3_M3_Monster_ID);
            // 일반 성공/실패 연출은 마지막 일섬 자세를 유지하지만,
            // 히든 Parry 성공은 백색 배경 대화로 넘어가므로 패리/일섬 자세를 고정하지 않는다.
            const shouldHoldFinalPose = !hiddenParrySuccess && !!finalHoldAction && finalCasterId && selfId === finalCasterId;
            m.boss.noPatternWaitTimer = 999999;
            m.boss.activePattern = null;
            m.boss.runtimeActions = null;
            m.boss.currentActionIndex = -1;
            m.boss.actionMove = null;
            m.boss.actionMoveCompleted = false;
            m.kbVx = 0;
            m.kbVy = 0;
            m.vz = 0;
            m.z = 0;
            if (shouldHoldFinalPose) {
                // 일섬의 판정이 끝난 뒤에도 연출/결과 처리가 끝날 때까지
                // 검을 휘두른 마지막 프레임을 유지한다.
                m.boss.action = { ...finalHoldAction };
                m.timer = Math.max(0.001, this.num(finalHoldAction.Action_Anim_Duration, rt.finalAttackDuration || 2));
                m.state = 'ATK';
                m.p3m3HoldFinalPose = true;
            } else {
                m.boss.action = null;
                m.p3m3HoldFinalPose = false;
                if (hiddenParrySuccess && finalCasterId && selfId === finalCasterId) {
                    // 종료 대화에서는 공격/패리 마지막 프레임 대신 정적인 기본 자세로 보이게 한다.
                    m.state = 'IDLE';
                    m.timer = 0;
                } else if (m.state === 'Walk' || m.state === 'Run' || m.state === 'CHASE' || m.state === 'BOUNDARY') {
                    m.state = 'IDLE';
                }
            }
        });
        if (success && rt.routeType === 'ROUTE_NORMAL' && reason === 'GUARD_SUCCESS') {
            this.startNormalClearReturn(gameState, reason);
        }
    },

    updateTargetUI(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        if (!rt || !gameState.targetUI) return;
        const centerId = this.getCenterStageId(gameState);
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
        if (this.updateNormalClearReturn(gameState, deltaTime)) {
            return;
        }
        if (this.updateHiddenClearReturn(gameState, deltaTime)) {
            return;
        }
        if (this.updateFailureFinalAttack(gameState, deltaTime)) {
            return;
        }
        if (rt.finalResolving) {
            if (rt.finalStarted) this.updateFinalTimeline(gameState, deltaTime);
            if (rt.finalIssenDeathPending || (gameState.player && gameState.player.hp <= 0)) {
                const go = document.getElementById('gameOverScreen');
                if (go) go.style.display = 'none';
            }
            if (rt.finalCollapse && rt.finalCollapse.active) {
                rt.finalCollapse.timer = Math.min(Math.max(0.05, rt.finalCollapse.duration || 1.15), (rt.finalCollapse.timer || 0) + Math.max(0, deltaTime || 0));
            }
            rt.finalResolveTimer = Math.max(0, (rt.finalResolveTimer || 0) - deltaTime);
            if (rt.finalResolveTimer <= 0) {
                if (rt.finalResolveSuccess && rt.routeType === 'ROUTE_NORMAL' && rt.finalResolveReason === 'GUARD_SUCCESS') {
                    this.startNormalClearReturn(gameState, rt.finalResolveReason);
                    return;
                }
                if (rt.finalResolveSuccess && rt.routeType === 'ROUTE_HIDDEN' && !rt.hiddenClearDialogueShown) {
                    rt.hiddenClearDialogueShown = true;
                    rt.finalResolving = false;
                    // Parry 성공 때 진입한 백색 배경을 그대로 유지한 채 종료 대화를 시작한다.
                    rt.hiddenWhiteBackdrop = true;
                    if (gameState.screenHitFlash && gameState.screenHitFlash.mode === 'fullwhite') gameState.screenHitFlash = null;
                    const startedClearDialogue = this.startDialogueByTrigger(gameState, 'EVENT', {
                        triggerValue: 'P3_M3_HIDDEN_CLEAR'
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
        if (!rt.timeLimitDisabled) {
            rt.timer = Math.max(0, (rt.timer || 0) - deltaTime);
            if (rt.timer <= 0) {
                rt.resultActionId = this.id((this.getResultAction(gameState, 'FAIL') || {}).Action_ID || 243078);
                this.startFailureFinalAttack(gameState, 'TIME_LIMIT', {
                    forceFailureSequence: true,
                    route: rt.route || this.buildRuntimeRoute(gameState, rt.routeType || this.resolveRouteTypeFromPlayer(gameState))
                });
                return;
            }
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
        if (rt.currentAreaId === this.getCenterStageId(gameState)) {
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
                } : null
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
                if (!options.normalReturnComplete) {
                    main.x = Math.max(0, (gameState.WORLD_WIDTH || rt.snapshot.worldW || 1400) / 2);
                    main.y = Math.max(0, (gameState.WORLD_DEPTH || rt.snapshot.worldD || 300) / 2);
                    const finalFaceDir = (rt.hiddenClearFinalFaceDir === -1 || rt.hiddenClearFinalFaceDir === 1)
                        ? rt.hiddenClearFinalFaceDir
                        : (main.faceDir === -1 ? -1 : 1);
                    main.faceDir = finalFaceDir;
                    main.pacingDir = finalFaceDir;
                }
                main.p3m3SuccessGroggyHold = false;
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
            // 최종 패턴 성공 후 전투를 종료하고 독립된 GAME CLEAR 화면으로 전환한다.
            if (!options.normalReturnComplete) {
                gameState.screenHitFlash = { life: 0.9, maxLife: 0.9, strength: 0.78, mode: 'fullwhite' };
            }
            if (!(gameState.bossPractice && gameState.bossPractice.enabled) && typeof GameModeSystem !== 'undefined' && GameModeSystem.showGameClear) {
                GameModeSystem.showGameClear(gameState);
            }
        } else {
            gameState.screenHitFlash = { life: 0.35, maxLife: 0.35, strength: 0.55, mode: 'red' };
            try { pushSystemNotice(`이면세계 이탈: ${reason}`, '#ff8a7a', 1.7); } catch (e) {}
        }
    }
};

window.P3M3FinalIssenSystem = P3M3FinalIssenSystem;
