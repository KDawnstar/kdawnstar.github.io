// boss_object_system.js
// Boss_Pattern_Object_info / Boss_Pattern_Object_Action_info 기반 보스 패턴 오브젝트 런타임 처리.
// 분신, 잔상, 지연 장판, 경로 잔류 공격처럼 패턴에서 생성되는 오브젝트의 생성/행동/갱신을 담당한다.

const BossObjectSystem = {

    applyBossObjectActionGaze: function(obj, action, gameState, moveDirX = null) {
        if (!obj || !action) return;

        const gaze = String(action.Action_Object_Gaze || action.Object_Gaze || '').trim().toUpperCase();
        if (!gaze || gaze === 'NONE') return;

        if (gaze === 'LOOKING_LEFT') { obj.faceDir = -1; return; }
        if (gaze === 'LOOKING_RIGHT') { obj.faceDir = 1; return; }
        if (gaze === 'LOOKING_MAP_CENTER' || gaze === 'MAP_CENTER') {
            const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
            const dx = worldW / 2 - (parseFloat(obj.x) || 0);
            if (Math.abs(dx) > 0.001) obj.faceDir = dx >= 0 ? 1 : -1;
            return;
        }

        if (gaze === 'LOOKING_OWNER' || gaze === 'LOOKING_BOSS') {
            const owner = obj.owner || null;
            if (!owner) return;
            const dx = (parseFloat(owner.x) || 0) - (parseFloat(obj.x) || 0);
            if (Math.abs(dx) > 0.001) obj.faceDir = dx >= 0 ? 1 : -1;
            return;
        }

        if (gaze === 'LOOKING_PLAYER' || gaze === 'LOOKING_TARGET' || gaze === 'GAZE_LOOK_ENEMY') {
            const p = gameState && gameState.player ? gameState.player : null;
            if (!p) return;
            const dx = (parseFloat(p.x) || 0) - (parseFloat(obj.x) || 0);
            if (Math.abs(dx) > 0.001) obj.faceDir = dx >= 0 ? 1 : -1;
            return;
        }

        if (gaze === 'LOOKING_MOVE_DIRECTION' || gaze === 'GAZE_MOVE_DIREC') {
            const dx = (moveDirX !== null && moveDirX !== undefined)
                ? parseFloat(moveDirX)
                : (parseFloat(obj.moveDirX) || 0);
            if (Math.abs(dx) > 0.001) obj.faceDir = dx >= 0 ? 1 : -1;
        }
    },

    getBossObjectActionHitWindow: function(obj, action) {
        const ownerBoss = obj && obj.owner ? obj.owner.boss : null;
        const timeRate = this.getLatePhaseActionTimeRate(action, ownerBoss);
        const startRaw = parseFloat(action && action.Hitbox_Start_Time);
        const endRaw = parseFloat(action && action.Hitbox_End_Time);
        const start = !isNaN(startRaw) && startRaw > 0 ? startRaw * timeRate : 0;
        const end = !isNaN(endRaw) && endRaw > 0 ? endRaw * timeRate : start;
        return { start, end };
    },

    resolveBossObjectSpawnPositions: function(m, objData, action, gameState, spawnCount) {
        const count = Math.max(1, parseInt(spawnCount) || 1);
        const spawnPlace = String(objData && objData.Spawn_Place_Type || '').trim().toUpperCase();
        const positions = [];
        const boss = m && m.boss ? m.boss : null;
        const corners = this.getBossDiagonalCornerPositions(gameState, m);

        if (typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(spawnPlace)) {
            const pos = this.getBossFixedMapPosition(gameState, spawnPlace);
            for (let i = 0; i < count; i++) positions.push({ x: pos.x, y: pos.y, cornerKey: pos.slotKey || spawnPlace, slotKey: pos.slotKey || spawnPlace });
            return positions;
        }

        if (spawnPlace === 'OPPOSITE_DIAGONAL_OF_CASTER') {
            const baseKey = (boss && (boss.currentDiagonalCorner || boss.lastDiagonalCorner)) || this.pickBossRandomDiagonalCornerKey();
            const oppositeKey = this.getOppositeDiagonalCornerKey(baseKey);
            const pos = corners[oppositeKey] || { x: m.x, y: m.y };
            for (let i = 0; i < count; i++) positions.push({ x: pos.x, y: pos.y, cornerKey: oppositeKey });
            return positions;
        }

        if (spawnPlace === 'FOUR_DIAGONAL_CORNERS') {
            const keys = ['LEFT_TOP', 'RIGHT_TOP', 'RIGHT_BOTTOM', 'LEFT_BOTTOM'];
            for (let i = 0; i < Math.min(count, keys.length); i++) {
                const pos = corners[keys[i]];
                positions.push({ x: pos.x, y: pos.y, cornerKey: keys[i] });
            }
            return positions;
        }

        if (spawnPlace === 'CENTER_AND_FOUR_CORNERS') {
            const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
            const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
            positions.push({ x: worldW / 2, y: worldD / 2, cornerKey: 'CENTER' });
            const keys = ['LEFT_TOP', 'RIGHT_TOP', 'RIGHT_BOTTOM', 'LEFT_BOTTOM'];
            for (let i = 0; positions.length < count && i < keys.length; i++) {
                const pos = corners[keys[i]];
                positions.push({ x: pos.x, y: pos.y, cornerKey: keys[i] });
            }
            return positions;
        }

        if (spawnPlace === 'PLACE_ATK_GUARD_POINT') {
            const baseX = parseFloat(action && (action.Guard_Point_X ?? action.__guardPointX));
            const baseY = parseFloat(action && (action.Guard_Point_Y ?? action.__guardPointY));
            const centerX = !isNaN(baseX) ? baseX : (gameState.player ? gameState.player.x : m.x);
            const centerY = !isNaN(baseY) ? baseY : (gameState.player ? gameState.player.y : m.y);
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distX = 80 + Math.random() * 90;
                const distY = 36 + Math.random() * 60;
                positions.push({
                    x: Math.max(45, Math.min(gameState.WORLD_WIDTH - 45, centerX + Math.cos(angle) * distX)),
                    y: Math.max(35, Math.min(gameState.WORLD_DEPTH - 35, centerY + Math.sin(angle) * distY)),
                    cornerKey: 'GUARD_REWARD',
                    slotKey: 'GUARD_REWARD'
                });
            }
            return positions;
        }

        if (spawnPlace === 'PLACE_OBJECT_CURRENT' || spawnPlace === 'CURRENT_OBJECT' || spawnPlace === 'PLACE_ATTACK_CENTER') {
            const isSwordObject = String(objData && objData.Object_Type || '').trim().toUpperCase() === 'OBJECT_SWORD';
            const poseType = String(action && action.Action_Pose_Type || '').trim().toUpperCase();
            const slamOffsetX = isSwordObject && poseType === 'POSE_KASIYAS_SLAM_THE_SWORD_DOWN' ? (m.faceDir || 1) * 24 : 0;
            const centerX = (parseFloat(m && m.x) || 0) + slamOffsetX;
            const centerY = parseFloat(m && m.y) || 0;
            for (let i = 0; i < count; i++) {
                positions.push({
                    x: Math.max(35, Math.min(gameState.WORLD_WIDTH - 35, centerX)),
                    y: Math.max(20, Math.min(gameState.WORLD_DEPTH - 20, centerY)),
                    cornerKey: 'OBJECT_CURRENT',
                    slotKey: 'OBJECT_CURRENT'
                });
            }
            return positions;
        }

        const bodyX = (m.d.bodyX || 80) * (m.scale || 1);
        const offsetX = spawnPlace === 'PLACE_CASTER_FRONT' ? (m.faceDir || 1) * bodyX * 0.72 : 0;
        for (let i = 0; i < count; i++) {
            positions.push({ x: m.x + offsetX, y: m.y, cornerKey: boss && boss.currentDiagonalCorner });
        }
        return positions;
    },

    getBossObjectIdFromData: function(data) {
        return String((data && (data.Object_ID || data.Attack_Object_ID || data.Dev_Name)) || '').trim();
    },

    getBossOwnerRuntimeFromCaster: function(caster) {
        const boss = caster && caster.boss ? caster.boss : (caster && caster.owner && caster.owner.boss ? caster.owner.boss : null);
        if (!boss) return null;
        boss.majorPattern2Runtime = boss.majorPattern2Runtime || { objectGroupSelections: {} };
        boss.majorPattern2Runtime.objectGroupSelections = boss.majorPattern2Runtime.objectGroupSelections || {};
        return boss.majorPattern2Runtime;
    },

    getBossPatternObjectGroupCandidates: function(gameState, objectGroup) {
        const group = String(objectGroup || '').trim();
        if (!group || !gameState || !gameState.DB_BOSS_PATTERN_OBJECT) return [];
        const candidates = [];
        Object.keys(gameState.DB_BOSS_PATTERN_OBJECT).forEach(key => {
            const data = gameState.DB_BOSS_PATTERN_OBJECT[key];
            if (!data) return;
            if (String(data.Object_Group || data.Spawn_Object_Group || '').trim() !== group) return;
            const id = String(data.Object_ID || data.Attack_Object_ID || key).trim();
            if (!id) return;
            candidates.push({ id, data });
        });
        candidates.sort((a, b) => {
            const ai = parseFloat(a.id);
            const bi = parseFloat(b.id);
            if (!isNaN(ai) && !isNaN(bi)) return ai - bi;
            return String(a.id).localeCompare(String(b.id));
        });
        return candidates;
    },

    pickRandomBossObjectCandidate: function(candidates) {
        const list = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
        if (list.length <= 0) return null;
        return list[Math.floor(Math.random() * list.length)] || list[0];
    },

    selectBossObjectIdFromGroup: function(caster, action, gameState, objectGroup) {
        const spawnType = String(action && (action.Group_Object_Spawn_Type || action.Object_Group_Spawn_Type || action.Spawn_Object_Select_Type) || '').trim().toUpperCase();
        if (!spawnType || spawnType === 'SIMULTANEOUSLY_SPAWN' || spawnType === 'ALL' || spawnType === 'SPAWN_ALL') return null;

        const candidates = this.getBossPatternObjectGroupCandidates(gameState, objectGroup);
        if (candidates.length <= 0) return null;

        const runtime = this.getBossOwnerRuntimeFromCaster(caster);
        const selectionsByGroup = runtime ? runtime.objectGroupSelections : {};
        const groupKey = String(objectGroup || '').trim();
        let picks = selectionsByGroup[groupKey];
        if (!Array.isArray(picks)) {
            picks = [];
            selectionsByGroup[groupKey] = picks;
        }

        let pool = candidates;

        if (spawnType === 'RANDOM_SELECT_FIRST' || spawnType === 'RANDOM_SHUFFLE_PICK_1') {
            picks.length = 0;
            pool = candidates;
        } else if (spawnType === 'RANDOM_SELECT_SECOND_EXCEPTION_FIRST' || spawnType === 'RANDOM_SHUFFLE_PICK_2') {
            pool = candidates.filter(c => !picks.includes(c.id));
            if (pool.length <= 0) pool = candidates;
        } else if (spawnType === 'SELECT_EXCEPTION_FIRST_AND_SECOND' || spawnType === 'RANDOM_SHUFFLE_PICK_3') {
            pool = candidates.filter(c => !picks.includes(c.id));
            if (pool.length <= 0) pool = candidates;
        } else if (spawnType === 'RANDOM_SELECT_FROM_FIRST_TO_THIRD' || spawnType === 'RANDOM_FROM_PREVIOUS_PICK' || spawnType === 'RANDOM_SELECT_FROM_PREVIOUS_RESULTS') {
            const previous = candidates.filter(c => picks.includes(c.id));
            pool = previous.length > 0 ? previous : candidates;
        } else if (spawnType === 'RANDOM_SELECT_ONE' || spawnType === 'RANDOM_ONE') {
            pool = candidates;
        }

        const selected = this.pickRandomBossObjectCandidate(pool);
        if (!selected) return null;

        // 1~3차 선택 결과는 이후 4차 선택의 후보로 사용한다.
        // 4차 RANDOM_SELECT_FROM_FIRST_TO_THIRD도 디버그 추적을 위해 마지막 선택값을 남긴다.
        picks.push(selected.id);
        if (picks.length > 8) picks.splice(0, picks.length - 8);

        this.pushBossDebugLog(
            gameState,
            'OBJECT_PICK',
            `${String(action && (action.Object_Action_ID || action.Action_ID) || '').trim()} ${this.getBossDebugName(action)}`,
            `${groupKey || 'GROUP'} ${spawnType} -> ${selected.id} ${this.getBossDebugName(selected.data)}`
        );

        return selected.id;
    },

    isBossObjectActionConditionMet: function(obj, action) {
        const cond = String(action && action.Action_Condition_Type || '').trim().toUpperCase();
        if (!cond || cond === 'NONE') return true;
        if (cond === 'LATE_PHASE' || cond === 'LATE_PHASE_START') return !!(obj && obj.owner && obj.owner.boss && obj.owner.boss.isLatePhase);
        return true;
    },


    isKasiyasMajorPattern3CloneObject: function(objData) {
        return String(objData && objData.Object_ID || '').trim() === '251018';
    },

    findActiveBossPatternActorByObjectId: function(gameState, objectId) {
        const id = String(objectId || '').trim();
        if (!id || !gameState || !Array.isArray(gameState.bossAttackObjects)) return null;
        for (const obj of gameState.bossAttackObjects) {
            if (!obj || !obj.active || obj.kind !== 'actor') continue;
            const data = obj.data || {};
            const objId = String(data.Object_ID || data.Attack_Object_ID || obj.objectId || '').trim();
            if (objId === id) return obj;
        }
        return null;
    },

    startBossObjectActionById: function(ownerBoss, patternAction, gameState) {
        const callId = String(patternAction && patternAction.Call_Object_Action_ID || patternAction && patternAction.Object_Action_ID || '').trim();
        if (!callId || !gameState || !gameState.DB_BOSS_PATTERN_OBJECT_ACTION) return false;
        const objectAction = gameState.DB_BOSS_PATTERN_OBJECT_ACTION[callId];
        if (!objectAction) {
            this.pushBossDebugLog(gameState, 'OBJECT_CALL_WARN', `${callId}`, 'object action not found');
            return false;
        }
        const objectId = String(patternAction.Call_Object_ID || patternAction.Object_ID || objectAction.Object_ID || objectAction.Attack_Object_ID || '').trim();
        const actor = this.findActiveBossPatternActorByObjectId(gameState, objectId);
        if (!actor) {
            this.pushBossDebugLog(gameState, 'OBJECT_CALL_WARN', `${callId} ${this.getBossDebugName(objectAction)}`, `active object ${objectId || '-'} not found`);
            return false;
        }
        actor.keepAliveAfterActions = true;
        actor.removeAfterCalledAction = false;
        actor.calledActionType = String(patternAction.Call_Object_Action_Type || '').trim().toUpperCase() || 'START_AND_WAIT';
        actor.actions = [{
            ...objectAction,
            _Pattern_Action_ID: String(patternAction && patternAction.Action_ID || '').trim(),
            _Random_Action_Order: patternAction ? patternAction.Random_Action_Order : '',
            _Random_Action_Group: patternAction ? (patternAction.Random_Action_Group || patternAction.Random_Action_Set_ID || '') : '',
            Random_Action_Order: objectAction.Random_Action_Order || (patternAction ? patternAction.Random_Action_Order : ''),
            Random_Action_Group: objectAction.Random_Action_Group || (patternAction ? (patternAction.Random_Action_Group || patternAction.Random_Action_Set_ID || '') : ''),
            Random_Action_Group_Order: objectAction.Random_Action_Group_Order || (patternAction ? patternAction.Random_Action_Group_Order : '')
        }];
        actor.actionIndex = -1;
        actor.action = null;
        actor.actionTimer = 0;
        actor.actionHitFired = false;
        actor.actionHitsDone = 0;
        actor.actionCycleTimer = 999;
        actor.actionCancelled = false;
        actor.cancelledByGuard = false;
        actor.active = true;
        this.startNextBossObjectAction(actor, gameState);
        this.pushBossDebugLog(gameState, 'OBJECT_CALL', `${callId} ${this.getBossDebugName(objectAction)}`, `object ${objectId}`);
        return true;
    },

    applyKasiyasOniMarkFromObject: function(ownerBoss, objData, gameState) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p || !objData) return false;
        const maxStackRaw = parseInt(objData.Object_Max_Stack);
        const removeBossRaw = parseInt(objData.Object_Remove_Value);
        const removeCloneRaw = parseInt(objData.Object_Remove_Extra_Value);
        p.kasiyasOniMark = {
            active: true,
            stack: 0,
            maxStack: !isNaN(maxStackRaw) && maxStackRaw > 0 ? maxStackRaw : 3,
            bossGuardCount: 0,
            cloneGuardCount: 0,
            requireBossGuard: !isNaN(removeBossRaw) && removeBossRaw > 0 ? removeBossRaw : 2,
            requireCloneGuard: !isNaN(removeCloneRaw) && removeCloneRaw > 0 ? removeCloneRaw : 2,
            pulse: false,
            flashTimer: 0.85,
            burstDamageRate: Math.max(1, parseFloat(objData.Damage_Rate) || 5),
            removeEffectType: String(objData.Object_Remove_Effect_Type || '').trim().toUpperCase(),
            removeEffectValue: Math.max(0, parseFloat(objData.Object_Remove_Effect_Value) || 0),
            sourceObjectId: String(objData.Object_ID || '').trim()
        };
        gameState.effects.push({
            type: 'hitSpark',
            renderType: objData.Effect_Render_Type || 'EFT_KASIYAS_ONI_MARK_BURST',
            x: p.x,
            y: p.y,
            z: p.z + (p.bodyZ || 100) + 42,
            w: 128,
            h: 128,
            life: 0.40,
            maxLife: 0.40,
            color: 'rgba(255,46,56,0.94)',
            accentColor: 'rgba(34,0,0,0.92)'
        });
        gameState.floatingTexts.push({
            x: p.x, y: p.y, z: p.z + (p.bodyZ || 100) + 58,
            text: '귀면족의 낙인', color: '#ff5656', size: '24px', timer: 0.9
        });
        this.pushBossDebugLog(gameState, 'MARK', `${String(objData.Object_ID || '').trim()} ${this.getBossDebugName(objData)}`, 'applied to player');
        return true;
    },

    clearKasiyasMajorPattern3Runtime: function(gameState, options = {}) {
        if (!gameState) return;
        const removeActors = options.removeActors !== false;
        if (removeActors && Array.isArray(gameState.bossAttackObjects)) {
            gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => {
                if (!obj) return false;
                const data = obj.data || {};
                const objectId = String(data.Object_ID || obj.objectId || '').trim();
                if (objectId === '251018') return false;
                return true;
            });
        }
        if (gameState.player && options.clearMark !== false) {
            gameState.player.kasiyasOniMark = null;
            gameState.player.kasiyasTemperedBladeReady = false;
        }
        const bosses = Array.isArray(gameState.monsters) ? gameState.monsters : [];
        bosses.forEach(m => {
            if (m && m.boss) {
                m.boss.majorPattern3Runtime = null;
                m.boss.kasiyasP1M3RushHidden = false;
            }
        });
    },

    startNextBossObjectAction: function(obj, gameState) {
        if (!obj || !Array.isArray(obj.actions)) return;

        while (true) {
            obj.actionIndex++;

            if (obj.actionIndex >= obj.actions.length) {
                const debug = this.ensureBossDebug(gameState);
                debug.currentObjectAction = null;
                if (obj.removeAfterCalledAction) {
                    obj.active = false;
                    obj.removeAfterCalledAction = false;
                    this.pushBossDebugLog(
                        gameState,
                        'OBJECT_END',
                        `${String(this.getBossObjectIdFromData(obj.data) || '').trim()} ${this.getBossDebugName(obj.data)}`,
                        'called disappear finished'
                    );
                    return;
                }
                if (obj.keepAliveAfterActions) {
                    obj.action = null;
                    obj.actionIndex = -1;
                    obj.actions = [];
                    obj.actionTimer = 0;
                    obj.actionDuration = null;
                    obj.actionHitFired = false;
                    obj.actionHitsDone = 0;
                    obj.actionCycleTimer = 999;
                    obj.actionCancelled = false;
                    obj.cancelledByGuard = false;
                    obj.currentDashPath = null;
                    obj.previewDashPath = null;
                    obj.moveStartX = obj.x;
                    obj.moveStartY = obj.y;
                    obj.moveTargetX = obj.x;
                    obj.moveTargetY = obj.y;
                    obj.moveDistance = 0;
                    obj.moveDirX = 0;
                    obj.moveDirY = 0;
                    obj.kasiyasRushBodyVfxTimer = -999;
                    obj.poseType = String(obj.defaultPoseType || obj.idlePoseType || 'POSE_KASIYAS_DEFAULT').trim();
                    this.pushBossDebugLog(
                        gameState,
                        'OBJECT_WAIT',
                        `${String(this.getBossObjectIdFromData(obj.data) || '').trim()} ${this.getBossDebugName(obj.data)}`,
                        'waiting for next called action'
                    );
                    return;
                }
                obj.active = false;
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT_END',
                    `${String(this.getBossObjectIdFromData(obj.data) || '').trim()} ${this.getBossDebugName(obj.data)}`,
                    'object sequence finished'
                );
                return;
            }

            const action = obj.actions[obj.actionIndex];
            const cond = String(action.Action_Condition_Type || '').trim().toUpperCase();
            if (!this.isBossObjectActionConditionMet(obj, action)) {
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT_SKIP',
                    `${String(action.Object_Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
                    `condition ${cond || 'NONE'}`
                );
                continue;
            }

            obj.action = action;
            obj.actionTimer = 0;
            obj.actionHitFired = false;
            obj.actionObjectSpawnFired = false;
            obj.actionHitsDone = 0;
            obj.actionCycleTimer = 999;
            obj.actionCancelled = false;
            obj.cancelledByGuard = false;
            obj.fadeOut = false;
            if (obj.baseOpacity != null) obj.opacity = obj.baseOpacity;
            if (obj.baseBrightness != null) obj.brightness = obj.baseBrightness;
            if (!obj.defaultPoseType) obj.defaultPoseType = this.isKasiyasMajorPattern3CloneObject(obj.data) ? 'POSE_KASIYAS_DEFAULT' : 'POSE_DEFAULT';
            obj.poseType = String(action.Action_Pose_Type || obj.poseType || obj.defaultPoseType || 'POSE_DEFAULT').trim();
            obj.actionDuration = null;
            this.onBossObjectActionStart(obj, action, gameState);

            const debug = this.ensureBossDebug(gameState);
            debug.currentObjectAction = {
                objectId: String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim(),
                objectName: this.getBossDebugName(obj.data),
                actionId: String(action.Object_Action_ID || '').trim(),
                actionName: this.getBossDebugName(action),
                actionType: String(action.Action_Type || '').trim().toUpperCase(),
                order: parseFloat(action.Action_Order) || (obj.actionIndex + 1),
                hitboxType: String(action.Hitbox_Type || '').trim() || 'NONE',
                hitStart: this.getBossObjectActionHitWindow(obj, action).start,
                hitEnd: this.getBossObjectActionHitWindow(obj, action).end,
                canGuard: action.ATK_Can_Guard === true || String(action.ATK_Can_Guard || '').trim().toLowerCase() === 'true',
                duration: this.getBossObjectCurrentActionDuration(obj, action)
            };
            this.pushBossDebugLog(
                gameState,
                'OBJECT_ACTION',
                `${String(action.Object_Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
                `object ${String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim()}, type ${debug.currentObjectAction.actionType}`
            );
            return;
        }
    },

    getBossObjectActionDuration: function(action) {
        const duration = parseFloat(action && action.Action_Anim_Duration);
        if (!isNaN(duration) && duration > 0) return Math.max(0.001, duration);
        return 0.001;
    },

    getBossObjectCurrentActionDuration: function(obj, action) {
        let duration = (obj && obj.actionDuration != null)
            ? Math.max(0.001, parseFloat(obj.actionDuration) || 0.001)
            : this.getBossObjectActionDuration(action);
        const ownerBoss = obj && obj.owner ? obj.owner.boss : null;
        const rate = this.getLatePhaseActionTimeRate(action, ownerBoss);
        return Math.max(0.001, duration * rate);
    },

    getBossObjectNextAttackAction: function(obj, startIndex = null) {
        if (!obj || !Array.isArray(obj.actions)) return null;
        const start = startIndex === null ? (obj.actionIndex + 1) : startIndex;
        for (let i = start; i < obj.actions.length; i++) {
            const action = obj.actions[i];
            if (!this.isBossObjectActionConditionMet(obj, action)) continue;
            if (String(action.Action_Type || '').trim().toUpperCase() === 'ATK') return action;
        }
        return null;
    },


    pushBossObjectActiveAttackRangeWarning: function(obj, action, gameState) {
        if (!obj || !action || !gameState || !Array.isArray(gameState.effects)) return;
        const type = String(action.Action_Type || '').trim().toUpperCase();
        if (type !== 'ATK') return;

        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        if (hitboxType !== 'HITBOX_CIRCLE') return;

        const poseType = String(action.Action_Pose_Type || '').trim().toUpperCase();
        const vfxType = String(action.VFX_Type || '').trim().toUpperCase();
        const isSwordplay = poseType === 'POSE_KASIYAS_SWORDPLAY' || vfxType === 'EFT_KASIYAS_SWORDPLAY';
        const isChargeHorizontal = poseType === 'POSE_KASIYAS_CHARGE_HORIZONTAL_SLASH' || vfxType === 'EFT_KASIYAS_CHARGE_HORIZONTAL_SLASH';
        if (!isSwordplay && !isChargeHorizontal) return;

        const hitbox = this.getBossObjectActionHitbox(obj, action);
        if (!hitbox) return;
        const player = gameState.player || {};
        const pW = Math.max(0, (parseFloat(player.bodyX) || 0) * (parseFloat(player.scale) || 1));
        const pD = Math.max(0, (parseFloat(player.bodyY) || 0) * (parseFloat(player.scale) || 1));
        const duration = this.getBossObjectCurrentActionDuration(obj, action);
        gameState.effects.push({
            type: 'warning',
            renderType: 'WARNING_HITBOX',
            warningRenderType: 'WARNING_HITBOX',
            activeAttackRange: true,
            sourceObject: obj,
            sourceObjectId: String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim(),
            sourceActionId: String(action.Object_Action_ID || '').trim(),
            x: hitbox.x,
            y: hitbox.y,
            z: hitbox.z,
            w: hitbox.w + pW,
            d: hitbox.d + pD,
            h: hitbox.h,
            hitboxType: 'HITBOX_CIRCLE',
            displayExpandedByPlayerBody: true,
            life: Math.max(0.05, duration),
            maxLife: Math.max(0.05, duration)
        });
    },

    onBossObjectActionStart: function(obj, action, gameState) {
        const type = String(action.Action_Type || '').trim().toUpperCase();
        const moveType = this.normalizeBossActionMoveType(action.Move_Type || action.Action_Move_Type);
        const pathSource = String(action.Hitbox_Path_Source || '').trim().toUpperCase();
        const vfxType = String(action.VFX_Type || action.Warning_Render_Type || '').trim().toUpperCase();
        const isM3RandomRushAction = typeof this.isKasiyasMajorPattern3RandomRushAction === 'function' && this.isKasiyasMajorPattern3RandomRushAction(action);
        if (!isM3RandomRushAction) obj.kasiyasP1M3RushHidden = false;

        if (type !== 'MOVE') {
            this.applyBossObjectActionGaze(obj, action, gameState);
        }

        if (type === 'ATK') {
            this.pushBossObjectActiveAttackRangeWarning(obj, action, gameState);
        }

        if (type === 'WARNING' && (pathSource === 'PREVIEW_DASH_PATH' || vfxType === 'EFT_WARNING_RUSH_LINE')) {
            let nextAtk = (typeof this.getBossObjectNextAttackAction === 'function') ? this.getBossObjectNextAttackAction(obj) : null;
            if (!nextAtk && gameState && gameState.DB_BOSS_PATTERN_OBJECT_ACTION_BY_OBJECT) {
                const objectId = String(obj && obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || action.Object_ID || '').trim();
                const list = objectId ? (gameState.DB_BOSS_PATTERN_OBJECT_ACTION_BY_OBJECT[objectId] || []) : [];
                const currentOrder = parseFloat(action.Action_Order) || 0;
                nextAtk = list.find(row => (parseFloat(row.Action_Order) || 0) > currentOrder && String(row.Action_Type || '').trim().toUpperCase() === 'ATK') || null;
            }
            obj.kasiyasP1M3RushHidden = isM3RandomRushAction;
            obj.previewDashPath = (isM3RandomRushAction && typeof this.ensureKasiyasMajorPattern3RushSlotPath === 'function')
                ? this.ensureKasiyasMajorPattern3RushSlotPath(obj, action, gameState, 'CLONE')
                : ((typeof this.computeSafeDashPathForActionDirection === 'function') ? this.computeSafeDashPathForActionDirection(obj, nextAtk || action, gameState, { minLength: 90 }) : this.computeDashPathForActionDirection(obj, nextAtk || action, gameState));
            const width = parseFloat(action.Hitbox_Size_Y) || 24;
            const duration = this.getBossObjectCurrentActionDuration(obj, action);
            this.pushPathWarningEffect(obj.previewDashPath, width, duration, action.VFX_Type || action.Warning_Render_Type || 'EFT_WARNING_RUSH_LINE', gameState);
            return;
        }

        if (moveType === 'RUSH') {
            const moveDir = String(action.Move_Direction || action.Action_Move_Direction || '').trim().toUpperCase();
            const normalizedMoveDir = (typeof this.normalizeBossFixedMapPlaceType === 'function') ? this.normalizeBossFixedMapPlaceType(moveDir) : moveDir;
            let path = obj.previewDashPath || null;
            if (isM3RandomRushAction) {
                // 전조에서 확정된 Random_Action_Group 경로만 사용한다.
                // 오브젝트 액션에서 별도 랜덤 경로를 다시 만들면 분신 전조와 실제 돌진이 어긋난다.
                path = (typeof this.getKasiyasMajorPattern3RushSlotPath === 'function')
                    ? (this.getKasiyasMajorPattern3RushSlotPath(obj, action, 'CLONE') || path)
                    : path;
                const invalidSidePath = !path || !path.randomSideRush || (parseFloat(path.length) || 0) < 90;
                if (invalidSidePath && typeof this.ensureKasiyasMajorPattern3RushSlotPath === 'function') {
                    path = this.ensureKasiyasMajorPattern3RushSlotPath(obj, action, gameState, 'CLONE') || path;
                }
            } else {
                const pathTarget = String(path && path.targetPlaceType || '').trim().toUpperCase();
                const needFixedTarget = typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(normalizedMoveDir);
                const invalidPath = !path || (parseFloat(path.length) || 0) < 8 || (needFixedTarget && pathTarget && pathTarget !== normalizedMoveDir);
                if (invalidPath) path = (typeof this.computeSafeDashPathForActionDirection === 'function') ? this.computeSafeDashPathForActionDirection(obj, action, gameState, { minLength: 90 }) : this.computeDashPathForActionDirection(obj, action, gameState);
            }
            obj.currentDashPath = path;
            obj.lastDashPath = path;
            obj.previewDashPath = null;
            obj.kasiyasP1M3RushHidden = false;
            if (path) {
                obj.x = Number.isFinite(parseFloat(path.startX)) ? parseFloat(path.startX) : obj.x;
                obj.y = Number.isFinite(parseFloat(path.startY)) ? parseFloat(path.startY) : obj.y;
            }
            obj.moveDirX = path.dirX || (obj.faceDir === -1 ? -1 : 1);
            obj.moveDirY = path.dirY || 0;
            obj.moveStartX = path.startX;
            obj.moveStartY = path.startY;
            obj.moveTargetX = path.endX;
            obj.moveTargetY = path.endY;
            obj.moveDistance = path.length || this.getPathLength(path) || 0;
            const ownerSpeed = obj.owner && obj.owner.d ? (parseFloat(obj.owner.d.speed) || 0) : 0;
            const rate = parseFloat(action.Move_Speed_Rate || action.Action_Move_Speed_Rate) || 1;
            const speed = Math.max(1, ownerSpeed * rate);
            const explicitDuration = parseFloat(action.Action_Anim_Duration);
            const speedDuration = Math.max(0.12, Math.min(0.95, obj.moveDistance / Math.max(1, speed)));
            obj.actionDuration = !isNaN(explicitDuration) && explicitDuration > 0 ? Math.min(explicitDuration, Math.max(0.12, speedDuration)) : speedDuration;
            // 분신 돌진도 경로 전체에 공격 이펙트를 선출력하지 않는다.
            // 실제 이동 중인 분신에 부착형 검기/잔상을 붙여 전조와 공격을 분리한다.
            obj.kasiyasRushBodyVfxTimer = -999;
        }

        const spawnTiming = String(action.Object_Spawn_Timing || '').trim().toUpperCase();
        const hasSpawnObject = String(action.Spawn_Object_ID || '').trim();
        const hasSpawnGroup = String(action.Spawn_Object_Group || '').trim();
        if ((hasSpawnObject || hasSpawnGroup) && spawnTiming === 'ACTION_START' && !obj.actionObjectSpawnFired) {
            this.spawnBossAttackObjectFromAction(obj, action, gameState);
            obj.actionObjectSpawnFired = true;
        }

        if (type === 'MOVE') {
            const moveDirection = String(action.Move_Direction || '').trim().toUpperCase();
            let targetX = obj.x + obj.faceDir * 1;
            let targetY = obj.y;

            if (moveDirection === 'TO_PLAYER_AT_SPAWN' || moveDirection === 'TARGET_PLAYER_SNAPSHOT') {
                targetX = obj.targetSnapshotX;
                targetY = obj.targetSnapshotY;
            } else if (typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(moveDirection)) {
                const pos = this.getBossFixedMapPosition(gameState, this.normalizeBossFixedMapPlaceType ? this.normalizeBossFixedMapPlaceType(moveDirection) : moveDirection);
                targetX = pos.x;
                targetY = pos.y;
            } else if (moveDirection === 'OPPOSITE_OF_OWNER_NEXT_DIAGONAL') {
                const owner = obj.owner;
                const boss = owner && owner.boss ? owner.boss : null;
                if (boss && !boss.pattern4Runtime && (boss.currentDiagonalCorner || boss.lastDiagonalCorner)) {
                    this.preparePattern4DiagonalRuntime(boss, boss.currentDiagonalCorner || boss.lastDiagonalCorner);
                }
                const corners = this.getBossDiagonalCornerPositions(gameState, owner || obj);
                const key = (boss && (boss.nextDiagonalCloneCorner || (boss.pattern4Runtime && boss.pattern4Runtime.secondCloneCorner))) || this.getOppositeDiagonalCornerKey(boss && boss.nextDiagonalOwnerCorner);
                const pos = corners[key] || { x: obj.x, y: obj.y };
                targetX = pos.x;
                targetY = pos.y;
                obj.cornerKey = key;
            } else if (moveDirection === 'CHASE_ENEMY' && gameState.player) {
                targetX = gameState.player.x;
                targetY = gameState.player.y;
            } else if (moveDirection === 'FORWARD') {
                targetX = obj.x + obj.faceDir * 100;
                targetY = obj.y;
            }

            let dx = targetX - obj.x;
            let dy = targetY - obj.y;
            let len = Math.sqrt(dx * dx + dy * dy) || 1;
            dx /= len;
            dy /= len;
            obj.moveDirX = dx;
            obj.moveDirY = dy;
            this.applyBossObjectActionGaze(obj, action, gameState, dx);

            const explicitDistance = parseFloat(action.Move_Distance);
            const ownerSpeed = obj.owner && obj.owner.d ? (parseFloat(obj.owner.d.speed) || 0) : 0;
            const rate = parseFloat(action.Move_Speed_Rate) || 1;
            const speed = Math.max(1, ownerSpeed * rate);
            const explicitDuration = parseFloat(action.Action_Anim_Duration);
            const stopType = String(action.Move_Stop_Type || '').trim().toUpperCase();
            const targetDistance = Math.sqrt((targetX - obj.x) ** 2 + (targetY - obj.y) ** 2);

            const isFixedTargetMove = moveDirection === 'OPPOSITE_OF_OWNER_NEXT_DIAGONAL' || (typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(moveDirection)) || stopType === 'STOP_AT_TARGET';
            const isPlayerTargetMove = moveDirection === 'TO_PLAYER_AT_SPAWN' || moveDirection === 'TARGET_PLAYER_SNAPSHOT' || moveDirection === 'CHASE_ENEMY';
            if (!isNaN(explicitDistance) && explicitDistance > 0) {
                obj.moveDistance = explicitDistance;
            } else if (isFixedTargetMove) {
                // STOP_AT_TARGET은 목표 위치까지 정확히 도착해야 하므로 이동 거리는 목표 거리로 맞춘다.
                // 단, 플레이어 위치/스냅샷 돌진류는 Action_Anim_Duration 고정 보간이 아니라
                // Move_Speed_Rate 기반 실제 속도로 지속시간을 계산해 데이터의 속도값이 체감되게 한다.
                obj.moveDistance = targetDistance;
            } else if (!isNaN(explicitDuration) && explicitDuration > 0) {
                obj.moveDistance = Math.max(0, speed * explicitDuration);
            } else {
                obj.moveDistance = targetDistance > 0 ? targetDistance : Math.max(0, speed * 0.25);
            }

            const speedBasedDuration = Math.max(0.12, obj.moveDistance / Math.max(1, speed));
            obj.actionDuration = (isFixedTargetMove && isPlayerTargetMove)
                ? Math.max(0.12, Math.min(0.9, speedBasedDuration))
                : ((!isNaN(explicitDuration) && explicitDuration > 0)
                    ? Math.max(0.001, explicitDuration)
                    : Math.max(0.05, speedBasedDuration));
            obj.moveStartX = obj.x;
            obj.moveStartY = obj.y;
            obj.moveTargetX = targetX;
            obj.moveTargetY = targetY;
            obj.moveSnapToTarget = isFixedTargetMove;

            if (action.VFX_Type) {
                gameState.effects.push({
                    type: 'afterimageDashTrail',
                    renderType: action.VFX_Type,
                    x: obj.x,
                    y: obj.y,
                    z: obj.z + ((obj.d && obj.d.bodyZ) || 160) * 0.42,
                    dir: obj.faceDir,
                    w: Math.max(80, obj.moveDistance * 0.58),
                    h: 40,
                    life: 0.18,
                    maxLife: 0.18,
                    pathAngle: Math.atan2(obj.moveDirY, obj.moveDirX)
                });
            }
            return;
        }

        if (type === 'WARNING') {
            const warningType = String(action.Warning_Render_Type || action.VFX_Type || '').trim().toUpperCase();
            if (warningType === 'WARNING_HITBOX') {
                const atk = this.getBossObjectNextAttackAction(obj);
                if (atk) {
                    const hitbox = this.getBossObjectActionHitbox(obj, atk);
                    const player = gameState.player || {};
                    const pW = Math.max(0, (parseFloat(player.bodyX) || 0) * (parseFloat(player.scale) || 1));
                    const pD = Math.max(0, (parseFloat(player.bodyY) || 0) * (parseFloat(player.scale) || 1));
                    const duration = this.getBossObjectCurrentActionDuration(obj, action);
                    gameState.effects.push({
                        type: 'warning',
                        renderType: 'WARNING_HITBOX',
                        warningRenderType: 'WARNING_HITBOX',
                        x: hitbox.x,
                        y: hitbox.y,
                        z: hitbox.z,
                        w: hitbox.w + pW,
                        d: hitbox.d + pD,
                        h: hitbox.h,
                        hitboxType: String(atk.Hitbox_Type || '').trim().toUpperCase(),
                        displayExpandedByPlayerBody: true,
                        life: duration,
                        maxLife: duration
                    });
                }
            }
            return;
        }

        if (type === 'DISAPPEAR') {
            obj.removeAfterCalledAction = true;
            obj.keepAliveAfterActions = false;
            gameState.effects.push({
                type: 'afterimageDisappear',
                renderType: action.VFX_Type || 'EFT_AFTERIMAGE_DISAPPEAR',
                x: obj.x,
                y: obj.y,
                z: obj.z + ((obj.d && obj.d.bodyZ) || 160) * 0.55,
                w: ((obj.d && obj.d.bodyX) || 80) * (obj.scale || 1) * 1.4,
                h: ((obj.d && obj.d.bodyZ) || 160) * (obj.scale || 1) * 0.8,
                life: Math.max(0.08, parseFloat(action.Action_Anim_Duration) || 0.1),
                maxLife: Math.max(0.08, parseFloat(action.Action_Anim_Duration) || 0.1)
            });
            obj.fadeOut = true;
        }
    },

    updateBossObjectActionMovement: function(obj, action, deltaTime, gameState) {
        const type = String(action && action.Action_Type || '').trim().toUpperCase();
        const moveType = this.normalizeBossActionMoveType(action && (action.Move_Type || action.Action_Move_Type));
        if (type !== 'MOVE' && moveType !== 'RUSH') return;

        const duration = this.getBossObjectCurrentActionDuration(obj, action);
        const t = Math.max(0, Math.min(1, (obj.actionTimer || 0) / duration));

        if (moveType === 'RUSH') {
            let path = obj.currentDashPath;
            const isM3RandomRushAction = typeof this.isKasiyasMajorPattern3RandomRushAction === 'function' && this.isKasiyasMajorPattern3RandomRushAction(action);
            if (!path || (parseFloat(path.length) || 0) < 8) {
                // CALL_OBJECT_ACTION 재호출/전조 생략 상황에서도 분신이 모션만 내고 멈추지 않도록 경로를 복구한다.
                path = (isM3RandomRushAction && typeof this.getKasiyasMajorPattern3RushSlotPath === 'function')
                    ? (this.getKasiyasMajorPattern3RushSlotPath(obj, action, 'CLONE') || (typeof this.ensureKasiyasMajorPattern3RushSlotPath === 'function' ? this.ensureKasiyasMajorPattern3RushSlotPath(obj, action, gameState, 'CLONE') : null))
                    : ((typeof this.computeSafeDashPathForActionDirection === 'function') ? this.computeSafeDashPathForActionDirection(obj, action, gameState, { minLength: 90 }) : this.computeDashPathForActionDirection(obj, action, gameState));
                obj.currentDashPath = path;
                obj.lastDashPath = path;
                obj.previewDashPath = null;
                if (isM3RandomRushAction) obj.kasiyasP1M3RushHidden = false;
            }
            if (!path || (parseFloat(path.length) || 0) < 8) return;
            const sx = Number.isFinite(parseFloat(path.startX)) ? parseFloat(path.startX) : obj.x;
            const sy = Number.isFinite(parseFloat(path.startY)) ? parseFloat(path.startY) : obj.y;
            const ex = Number.isFinite(parseFloat(path.endX)) ? parseFloat(path.endX) : obj.x;
            const ey = Number.isFinite(parseFloat(path.endY)) ? parseFloat(path.endY) : obj.y;
            obj.x = sx + (ex - sx) * t;
            obj.y = sy + (ey - sy) * t;
            obj.faceDir = (parseFloat(path.dirX) || 0) >= 0 ? 1 : -1;
            if (isM3RandomRushAction) obj.kasiyasP1M3RushHidden = t >= 0.995;
            obj.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, obj.x));
            obj.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, obj.y));
            if (typeof this.pushKasiyasRushBodyEffect === 'function') {
                this.pushKasiyasRushBodyEffect(obj, path, action, gameState, { isClone: true });
            }
            return;
        }

        const distance = obj.moveDistance || 0;
        obj.x = (obj.moveStartX || obj.x) + (obj.moveDirX || 0) * distance * t;
        obj.y = (obj.moveStartY || obj.y) + (obj.moveDirY || 0) * distance * t;
        if (obj.moveSnapToTarget && t >= 0.999) {
            obj.x = obj.moveTargetX;
            obj.y = obj.moveTargetY;
        }
        obj.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, obj.x));
        obj.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, obj.y));
    },

    spawnBossAttackObjectFromAction: function(m, action, gameState) {
        // Boss_Pattern_Object_Action_info의 Object_ID는 '현재 액션을 수행하는 오브젝트' ID다.
        // 소환 대상으로 해석하면 잔상 액션이 자기 자신을 반복 소환하므로,
        // 실제 소환 대상은 Spawn_Object_ID / Spawn_Object_Group만 사용한다.
        const objectGroup = String(action.Spawn_Object_Group || '').trim();
        const objectId = String(action.Spawn_Object_ID || '').trim();
        if (!objectId && objectGroup) {
            const groupSpawnType = String(action.Group_Object_Spawn_Type || action.Object_Group_Spawn_Type || action.Spawn_Object_Select_Type || '').trim().toUpperCase();

            if (groupSpawnType && groupSpawnType !== 'SIMULTANEOUSLY_SPAWN' && groupSpawnType !== 'ALL' && groupSpawnType !== 'SPAWN_ALL') {
                const selectedId = this.selectBossObjectIdFromGroup(m, action, gameState, objectGroup);
                if (selectedId) {
                    this.spawnBossAttackObjectFromAction(m, {
                        ...action,
                        Spawn_Object_ID: selectedId,
                        Object_ID: selectedId,
                        Spawn_Object_Group: ''
                    }, gameState);
                }
                return;
            }

            // 그룹 소환은 패턴 단위 슬롯 배치의 기준이 되므로, 이전 라운드/이전 패턴에서 남은
            // 같은 그룹 분신을 먼저 정리한다. 그렇지 않으면 위치 섞기 대상이 5명을 초과해
            // 본체와 분신이 같은 슬롯에 겹쳐 배치될 수 있다.
            if (Array.isArray(gameState.bossAttackObjects)) {
                gameState.bossAttackObjects.forEach(obj => {
                    const data = obj && obj.data ? obj.data : {};
                    const group = String(obj && (obj.objectGroup || data.Object_Group || data.Spawn_Object_Group) || '').trim();
                    if (obj && obj.active && obj.kind === 'actor' && group === objectGroup) {
                        obj.active = false;
                    }
                });
                gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => obj && obj.active);
            }

            const allObjects = gameState.DB_BOSS_PATTERN_OBJECT || {};
            const spawnedIds = new Set();
            Object.keys(allObjects).forEach(key => {
                const data = allObjects[key];
                if (String(data.Object_Group || data.Spawn_Object_Group || '').trim() !== objectGroup) return;
                const id = String(data.Object_ID || key).trim();
                if (!id || spawnedIds.has(id)) return;
                spawnedIds.add(id);
                this.spawnBossAttackObjectFromAction(m, { ...action, Spawn_Object_ID: id, Object_ID: id, Spawn_Object_Group: '' }, gameState);
            });
            return;
        }
        if (!objectId) return;

        const objData = gameState.DB_BOSS_PATTERN_OBJECT ? gameState.DB_BOSS_PATTERN_OBJECT[objectId] : null;
        if (!objData) {
            console.warn('Boss_Pattern_Object_info에서 오브젝트를 찾을 수 없음:', objectId);
            return;
        }

        const objectType = String(objData.Object_Type || '').trim().toUpperCase();
        const hasObjectActions = Array.isArray(objData.Runtime_Actions) && objData.Runtime_Actions.length > 0;
        const spawnCount = Math.max(1, parseInt(action.Object_Spawn_Count || action.Spawn_Count) || 1);

        if (objectType === 'PLAYER_MARK') {
            this.applyKasiyasOniMarkFromObject((m && m.owner) ? m.owner : m, objData, gameState);
            return;
        }

        if (objectType === 'OBJECT_SWORD') {
            const positions = this.resolveBossObjectSpawnPositions(m, objData, action, gameState, spawnCount);
            if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];
            positions.forEach((pos, spawnIndex) => {
                const renderType = String(objData.Object_Render_Type || '').trim().toUpperCase();
                const effectValue = String(objData.Object_Get_Effect_Value || '').trim().toUpperCase();
                gameState.bossAttackObjects.push({
                    kind: 'interactiveSword',
                    owner: (m && m.owner) ? m.owner : m,
                    sourceCaster: m,
                    data: objData,
                    active: true,
                    disabled: false,
                    absorbed: false,
                    x: pos.x,
                    y: pos.y,
                    z: (parseFloat(m && m.z) || 0) + 6,
                    timer: 0,
                    maxLife: Math.max(18, parseFloat(objData.Object_Max_Life) || 26),
                    renderType: renderType || 'OBJ_RED_ENERGY_SWORD',
                    objectGroup: String(objData.Object_Group || '').trim(),
                    getType: String(objData.Object_Get_Type || '').trim().toUpperCase(),
                    getEffect: String(objData.Object_Get_Effect || '').trim().toUpperCase(),
                    getEffectValue: effectValue,
                    getRangeX: Math.max(20, parseFloat(objData.Object_Get_Range_X) || 120),
                    getRangeY: Math.max(20, parseFloat(objData.Object_Get_Range_Y) || 80),
                    getRangeZ: Math.max(0, parseFloat(objData.Object_Get_Range_Z) || 0),
                    afterGetType: String(objData.Object_After_Get_Type || '').trim().toUpperCase()
                });
                gameState.effects.push({
                    type: 'hitSpark',
                    renderType: 'EFT_APOSTLE_SWORD_SPAWN',
                    x: pos.x,
                    y: pos.y,
                    z: (parseFloat(m && m.z) || 0) + 42,
                    w: 100,
                    h: 95,
                    life: 0.24,
                    maxLife: 0.24,
                    color: effectValue === 'APOSTLE_YELLOW' ? 'rgba(255,218,80,0.82)' : (effectValue === 'APOSTLE_BLACK' ? 'rgba(96,28,120,0.82)' : 'rgba(255,64,52,0.82)'),
                    accentColor: 'rgba(255,240,210,0.78)'
                });
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT',
                    `${objectId} ${this.getBossDebugName(objData)}`,
                    `type OBJECT_SWORD, ${spawnIndex + 1}/${positions.length}, energy ${effectValue || '-'}`
                );
            });
            return;
        }

        if (objectType === 'APOSTLE_ENERGY') {
            const positions = this.resolveBossObjectSpawnPositions(m, objData, action, gameState, spawnCount);
            if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];
            positions.forEach((pos, spawnIndex) => {
                gameState.bossAttackObjects.push({
                    kind: 'collectible',
                    owner: m,
                    data: objData,
                    active: true,
                    x: pos.x,
                    y: pos.y,
                    z: m.z + 8,
                    timer: 0,
                    maxLife: Math.max(5, parseFloat(objData.Object_Max_Life) || 8),
                    radius: 34,
                    renderType: objData.Object_Render_Type || 'OBJ_APOSTLE_ENERGY',
                    getType: String(objData.Object_Get_Type || '').trim().toUpperCase(),
                    getEffect: String(objData.Object_Get_Effect || '').trim().toUpperCase(),
                    getEffectValue: parseFloat(objData.Object_Get_Effect_Value) || 0
                });
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT',
                    `${objectId} ${this.getBossDebugName(objData)}`,
                    `type APOSTLE_ENERGY, ${spawnIndex + 1}/${positions.length}`
                );
            });
            return;
        }

        if ((objectType === 'SHOCKWAVE' || objectType === 'ATTACK_AREA' || objectType === 'ATTACK_AREA_IMMEDIATE') && !hasObjectActions) {
            const positions = this.resolveBossObjectSpawnPositions(m, objData, action, gameState, spawnCount);
            if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];
            for (let spawnIndex = 0; spawnIndex < positions.length; spawnIndex++) {
                const pos = positions[spawnIndex] || { x: m.x, y: m.y };
                const scale = m.scale || 1;
                const w = (parseFloat(objData.Hitbox_Size_X) || 300) * scale;
                const d = (parseFloat(objData.Hitbox_Size_Y) || 160) * scale;
                const h = (parseFloat(objData.Hitbox_Size_Z) || 40) * scale;
                const duration = Math.max(0.05, parseFloat(objData.Hitbox_Duration) || 0.35);
                gameState.bossAttackObjects.push({
                    kind: 'areaDelayed',
                    owner: m,
                    data: objData,
                    x: pos.x,
                    y: pos.y,
                    z: m.z + (parseFloat(objData.Hitbox_Offset_Z) || 0) * scale,
                    w: w,
                    d: d,
                    h: h,
                    timer: 0,
                    hitDuration: duration,
                    hitsDone: 0,
                    cycleTimer: 999,
                    active: true
                });
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT',
                    `${objectId} ${this.getBossDebugName(objData)}`,
                    `type ${objectType || 'AREA'}, ${spawnIndex + 1}/${positions.length}, duration ${duration.toFixed(2)}s`
                );
            }
            return;
        }

        if (objectType === 'AFTERIMAGE' || objectType === 'CLONE' || objectType === 'KASIYAS_CLONE' || hasObjectActions) {
            const positions = this.resolveBossObjectSpawnPositions(m, objData, action, gameState, spawnCount);
            if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];

            for (let spawnIndex = 0; spawnIndex < positions.length; spawnIndex++) {
                const pos = positions[spawnIndex] || { x: m.x, y: m.y };
                const commandOnly = this.isKasiyasMajorPattern3CloneObject(objData);
                const effectiveHasActions = hasObjectActions && !commandOnly;
                const scriptedLife = effectiveHasActions
                    ? (objData.Runtime_Actions || []).reduce((sum, act) => sum + Math.max(0.001, parseFloat(act.Action_Anim_Duration) || 0.001), 0) + 2.0
                    : 0;
                const explicitLife = parseFloat(objData.Object_Max_Life);
                const actorMaxLife = commandOnly
                    ? Math.max(24, (!isNaN(explicitLife) && explicitLife > 0 ? explicitLife : 0))
                    : (effectiveHasActions
                        ? Math.max(4, scriptedLife, (!isNaN(explicitLife) && explicitLife > 0 ? explicitLife : 0))
                        : Math.max(4, (!isNaN(explicitLife) && explicitLife > 0 ? explicitLife : 8)));
                const baseOpacity = objData.Object_Opacity !== '' && objData.Object_Opacity != null ? parseFloat(objData.Object_Opacity) : (objectType === 'KASIYAS_CLONE' || objectType === 'CLONE' ? 0.78 : 0.5);
                const baseBrightness = objData.Object_Brightness !== '' && objData.Object_Brightness != null ? parseFloat(objData.Object_Brightness) : (objectType === 'KASIYAS_CLONE' || objectType === 'CLONE' ? 1.05 : 1.3);
                const actor = {
                    kind: 'actor',
                    owner: m,
                    data: objData,
                    d: m.d,
                    active: true,
                    x: pos.x,
                    y: pos.y,
                    z: m.z,
                    faceDir: gameState.player && gameState.player.x < pos.x ? -1 : 1,
                    scale: m.scale || 1,
                    timer: 0,
                    maxLife: actorMaxLife,
                    actionIndex: -1,
                    action: null,
                    actionTimer: 0,
                    actionHitFired: false,
                    actions: effectiveHasActions ? [...objData.Runtime_Actions] : [],
                    keepAliveAfterActions: commandOnly,
                    poseType: 'POSE_KASIYAS_DEFAULT',
                    targetSnapshotX: gameState.player ? gameState.player.x : pos.x + (m.faceDir || 1) * 400,
                    targetSnapshotY: gameState.player ? gameState.player.y : pos.y,
                    opacity: baseOpacity,
                    baseOpacity: baseOpacity,
                    brightness: baseBrightness,
                    baseBrightness: baseBrightness,
                    renderType: objData.Object_Render_Type || (objectType === 'KASIYAS_CLONE' || objectType === 'CLONE' ? 'OBJ_KASIYAS_CLONE' : 'OBJ_KASIYAS_AFTERIMAGE'),
                    objectGroup: String(objData.Object_Group || '').trim(),
                    slotKey: pos.slotKey || pos.cornerKey || '',
                    cornerKey: pos.cornerKey || ''
                };

                gameState.bossAttackObjects.push(actor);
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT',
                    `${objectId} ${this.getBossDebugName(objData)}`,
                    `type ${objectType || 'OBJECT'}, ${spawnIndex + 1}/${positions.length}, actions ${actor.actions.length}${commandOnly ? ', command-only' : ''}`
                );
                if (!commandOnly) this.startNextBossObjectAction(actor, gameState);
            }
            return;
        }

        const path = (m.boss && (m.boss.currentDashPath || m.boss.lastDashPath)) ? { ...(m.boss.currentDashPath || m.boss.lastDashPath) } : null;
        if (!path) return;

        const warningDurationType = String(objData.Warning_Duration_Type || '').trim().toUpperCase();
        let warningDuration = Math.max(0, parseFloat(objData.Warning_Duration) || 0);
        if (warningDurationType === 'REF_OWNER_ACTION_DURATION') {
            warningDuration = this.getBossActionDuration(m, action, gameState);
        }

        const width = parseFloat(objData.Hitbox_Size_Y) || 120;
        const height = parseFloat(objData.Hitbox_Size_Z) || 120;
        const hitDuration = Math.max(0.05, parseFloat(objData.Hitbox_Duration) || 0.2);
        const hitboxDelayType = String(objData.Hitbox_Delay_Type || '').trim().toUpperCase();
        const hitboxDelayTime = Math.max(0, parseFloat(objData.Hitbox_Delay_Time) || 0);
        const useLinkedResidualField = warningDurationType === 'REF_OWNER_ACTION_DURATION';

        if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];
        gameState.bossAttackObjects.push({
            kind: 'pathDelayed',
            owner: m,
            data: objData,
            sourceAction: action,
            path: path,
            timer: 0,
            warningDuration: warningDuration,
            warningDurationType: warningDurationType,
            hitboxDelayType: hitboxDelayType,
            hitboxDelayTime: hitboxDelayTime,
            hitDuration: hitDuration,
            width: width,
            height: height,
            hitsDone: 0,
            cycleTimer: 999,
            effectFired: false,
            visualLinked: useLinkedResidualField,
            active: true
        });

        if (useLinkedResidualField) {
            this.pushPathResidualSlashField(
                path,
                width,
                height,
                gameState,
                Math.max(0.05, warningDuration),
                hitboxDelayTime,
                hitDuration,
                objData.Effect_Render_Type || 'EFT_KASIYAS_PATH_SLASH_LINES'
            );
        } else {
            this.pushPathWarningEffect(path, width, Math.max(0.05, warningDuration), objData.Warning_Render_Type || 'WARNING_SLASH_PATH', gameState);
        }

        this.pushBossDebugLog(
            gameState,
            'OBJECT',
            `${objectId} ${this.getBossDebugName(objData)}`,
            warningDurationType === 'REF_OWNER_ACTION_DURATION'
                ? `linked to owner action ${(warningDuration || 0).toFixed(2)}s, delay ${Math.max(0, parseFloat(objData.Hitbox_Delay_Time) || 0).toFixed(2)}s, hits ${parseInt(objData.ATK_Hit_Count) || 1}`
                : `warning ${warningDuration.toFixed(2)}s, delay ${Math.max(0, parseFloat(objData.Hitbox_Delay_Time) || 0).toFixed(2)}s, hits ${parseInt(objData.ATK_Hit_Count) || 1}`
        );
    },

    isBossObjectGetInputActive: function(obj, gameState) {
        const getType = String(obj && (obj.getType || obj.data && obj.data.Object_Get_Type) || '').trim().toUpperCase();
        if (getType !== 'ATK_KEY_DOWN_ON_OBJECT') return false;
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p || !p.active || p.hp <= 0) return false;
        if ((parseFloat(p.kasiyasApostleEnergyGetLockTimer) || 0) > 0) return false;

        const keys = gameState.keys || {};
        const keyX = !!keys.KeyX;
        const attackActive = String(p.state || '').toUpperCase() === 'ATK' && (parseFloat(p.atkTimer) || 0) > 0;
        return keyX || attackActive;
    },

    isPlayerInsideBossObjectGetRange: function(obj, gameState) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!obj || !p || !p.active) return false;
        const dx = Math.abs((parseFloat(p.x) || 0) - (parseFloat(obj.x) || 0));
        const dy = Math.abs((parseFloat(p.y) || 0) - (parseFloat(obj.y) || 0));
        const pH = Math.max(20, (parseFloat(p.bodyZ) || 100) * (parseFloat(p.scale) || 1));
        const pZ = parseFloat(p.z) || 0;
        const dzOk = (parseFloat(obj.getRangeZ) || 0) <= 0
            ? true
            : Math.abs((pZ + pH * 0.5) - ((parseFloat(obj.z) || 0) + 45)) <= (parseFloat(obj.getRangeZ) || 0) + pH * 0.35;
        return dx <= Math.max(20, parseFloat(obj.getRangeX) || 120)
            && dy <= Math.max(20, parseFloat(obj.getRangeY) || 80)
            && dzOk;
    },


    getBossObjectGetDistanceScore: function(obj, gameState) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!obj || !p) return Number.POSITIVE_INFINITY;
        const dx = (parseFloat(p.x) || 0) - (parseFloat(obj.x) || 0);
        const dy = (parseFloat(p.y) || 0) - (parseFloat(obj.y) || 0);
        return dx * dx + dy * dy;
    },

    getNearestBossInteractiveSword: function(gameState) {
        const objects = gameState && Array.isArray(gameState.bossAttackObjects) ? gameState.bossAttackObjects : [];
        let best = null;
        let bestScore = Number.POSITIVE_INFINITY;
        for (const obj of objects) {
            if (!obj || !obj.active || obj.kind !== 'interactiveSword') continue;
            if (obj.disabled || obj.absorbed) continue;
            if (!this.isPlayerInsideBossObjectGetRange(obj, gameState)) continue;
            const score = this.getBossObjectGetDistanceScore(obj, gameState);
            if (score < bestScore) {
                best = obj;
                bestScore = score;
            }
        }
        return best;
    },

    refreshNearestBossInteractiveSwordTarget: function(gameState) {
        const objects = gameState && Array.isArray(gameState.bossAttackObjects) ? gameState.bossAttackObjects : [];
        for (const obj of objects) {
            if (obj && obj.kind === 'interactiveSword') obj.nearestInteractTarget = false;
        }
        const nearest = this.getNearestBossInteractiveSword(gameState);
        if (nearest) nearest.nearestInteractTarget = true;
        return nearest;
    },

    consumeBossInteractiveSword: function(obj, objects, gameState) {
        if (!obj || !objects || !this.applyBossObjectGetEffect(obj, gameState)) return false;
        obj.absorbed = true;
        obj.canInteract = false;
        obj.nearestInteractTarget = false;
        const afterType = String(obj.afterGetType || '').trim().toUpperCase();
        if (afterType === 'REMOVE_OBJECT') {
            const idx = objects.indexOf(obj);
            if (idx >= 0) objects.splice(idx, 1);
            return true;
        }
        if (afterType === 'DISABLE_OBJECT' || !afterType) {
            obj.disabled = true;
            obj.getType = '';
        }
        return true;
    },

    getApostleEnergyColorInfo: function(value) {
        const key = String(value || '').trim().toUpperCase();
        if (key === 'APOSTLE_YELLOW') {
            return { name: '노란 기운', color: '#ffd84f', rgba: 'rgba(255,216,79,0.92)', dark: 'rgba(132,84,0,0.88)' };
        }
        if (key === 'APOSTLE_BLACK') {
            return { name: '검은 기운', color: '#a56bff', rgba: 'rgba(158,94,255,0.90)', dark: 'rgba(26,0,46,0.90)' };
        }
        return { name: '붉은 기운', color: '#ff5548', rgba: 'rgba(255,82,70,0.92)', dark: 'rgba(86,0,0,0.90)' };
    },

    applyBossObjectGetEffect: function(obj, gameState) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!obj || !p) return false;

        const effect = String(obj.getEffect || obj.data && obj.data.Object_Get_Effect || '').trim().toUpperCase();
        if (effect !== 'GET_APOSTLE_ENERGY') return false;

        const value = String(obj.getEffectValue || obj.data && obj.data.Object_Get_Effect_Value || '').trim().toUpperCase();
        if (!value) return false;

        p.kasiyasApostleEnergies = Array.isArray(p.kasiyasApostleEnergies) ? p.kasiyasApostleEnergies : [];
        p.kasiyasApostleGuardBuffs = Array.isArray(p.kasiyasApostleGuardBuffs) ? p.kasiyasApostleGuardBuffs : [];

        const data = obj.data || {};
        const maxLimitRaw = parseInt(data.Max_Object_Get_Limit);
        const maxLimit = !isNaN(maxLimitRaw) && maxLimitRaw > 0 ? maxLimitRaw : 2;
        const buffType = String(data.Object_Get_Player_Buff_Type || '').trim().toUpperCase();
        const buffValueRaw = parseFloat(data.Object_Get_Player_Buff_Value);
        const buffValue = !isNaN(buffValueRaw) && buffValueRaw > 0 ? buffValueRaw : 0;

        p.kasiyasApostleEnergies.push(value);
        p.kasiyasApostleGuardBuffs.push({
            energy: value,
            type: buffType,
            value: buffValue,
            sourceObjectId: String(data.Object_ID || obj.objectId || '').trim()
        });
        while (p.kasiyasApostleEnergies.length > maxLimit) p.kasiyasApostleEnergies.shift();
        while (p.kasiyasApostleGuardBuffs.length > maxLimit) p.kasiyasApostleGuardBuffs.shift();
        p.kasiyasApostleEnergyGetLockTimer = 0.18;
        p.kasiyasApostleEnergyFlashTimer = 0.9;

        const sameColor = p.kasiyasApostleEnergies.length >= 2 && p.kasiyasApostleEnergies[0] === p.kasiyasApostleEnergies[1];
        const info = this.getApostleEnergyColorInfo(value);

        gameState.floatingTexts.push({
            x: p.x,
            y: p.y,
            z: p.z + (p.bodyZ || 100) + 54,
            text: sameColor ? `${info.name} 강화` : `${info.name} 흡수`,
            color: info.color,
            size: sameColor ? '24px' : '20px',
            timer: 0.75,
            isBubble: false
        });

        gameState.effects.push({
            type: 'hitSpark',
            renderType: 'EFT_APOSTLE_ENERGY_GET',
            x: obj.x,
            y: obj.y,
            z: (parseFloat(obj.z) || 0) + 58,
            w: sameColor ? 128 : 98,
            h: sameColor ? 128 : 98,
            life: 0.34,
            maxLife: 0.34,
            color: info.rgba,
            accentColor: 'rgba(255,245,210,0.88)'
        });

        this.pushBossDebugLog(
            gameState,
            'OBJECT_GET',
            `${String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim()} ${this.getBossDebugName(obj.data)}`,
            `GET_APOSTLE_ENERGY ${value}, player=[${p.kasiyasApostleEnergies.join(',')}]`
        );

        return true;
    },

    clearKasiyasMajorPattern2Objects: function(gameState, options = {}) {
        if (!gameState) return;
        const removeActors = options.removeActors !== false;
        const objectIds = new Set(['251010', '251011', '251012', '251013', '251014', '251015', '251016']);
        if (Array.isArray(gameState.bossAttackObjects)) {
            gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => {
                if (!obj) return false;
                const data = obj.data || {};
                const objectId = String(data.Object_ID || obj.objectId || '').trim();
                const group = String(obj.objectGroup || data.Object_Group || '').trim();
                if (obj.kind === 'interactiveSword' && group === 'SWORD_GROUP_01') return false;
                if (removeActors && obj.kind === 'actor' && objectIds.has(objectId)) return false;
                return true;
            });
        }
        const p = gameState.player;
        if (p) {
            p.kasiyasApostleEnergies = [];
            p.kasiyasApostleGuardBuffs = [];
            p.kasiyasApostleEnergyFlashTimer = 0;
            p.kasiyasApostleEnergyGetLockTimer = 0;
        }
        const bosses = Array.isArray(gameState.monsters) ? gameState.monsters : [];
        bosses.forEach(m => {
            if (m && m.boss && m.boss.majorPattern2Runtime) {
                m.boss.majorPattern2Runtime.objectGroupSelections = {};
            }
        });
    },

    updateBossAttackObjects: function(deltaTime, gameState) {
        const objects = gameState.bossAttackObjects || [];
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (!obj || !obj.active) { objects.splice(i, 1); continue; }

            if (obj.kind === 'collectible') {
                obj.timer += deltaTime;
                const p = gameState.player;
                if (p && p.active && p.hp > 0) {
                    const dx = (parseFloat(p.x) || 0) - (parseFloat(obj.x) || 0);
                    const dy = (parseFloat(p.y) || 0) - (parseFloat(obj.y) || 0);
                    const radius = Math.max(30, parseFloat(obj.radius) || 34) + Math.max(22, (p.bodyX || 60) * (p.scale || 1) * 0.38);
                    if (dx * dx + dy * dy <= radius * radius) {
                        const effect = String(obj.getEffect || '').trim().toUpperCase();
                        if (effect === 'HP_RECOVERY') {
                            const rawValue = parseFloat(obj.getEffectValue) || 0;
                            const amount = rawValue > 0 && rawValue <= 1 ? Math.max(1, p.maxHp * rawValue) : rawValue;
                            p.hp = Math.min(p.maxHp, (parseFloat(p.hp) || 0) + amount);
                            gameState.floatingTexts.push({
                                x: p.x, y: p.y, z: p.z + p.bodyZ + 36,
                                text: `HP +${amount.toFixed(0)}`,
                                color: '#ff8b72', size: '26px', timer: 0.8
                            });
                            gameState.effects.push({
                                type: 'hitSpark',
                                renderType: 'EFT_APOSTLE_ENERGY_GET',
                                x: obj.x, y: obj.y, z: obj.z + 36,
                                w: 90, h: 90,
                                life: 0.32, maxLife: 0.32,
                                color: 'rgba(255,80,58,0.92)',
                                accentColor: 'rgba(255,220,130,0.88)'
                            });
                        }
                        obj.active = false;
                        objects.splice(i, 1);
                        continue;
                    }
                }
                if (obj.maxLife && obj.timer > obj.maxLife) {
                    objects.splice(i, 1);
                    continue;
                }
                continue;
            }

            if (obj.kind === 'areaDelayed') {
                obj.timer += deltaTime;
                const data = obj.data || {};
                const hitCount = Math.max(1, parseInt(data.ATK_Hit_Count) || 1);
                const cycle = Math.max(0.01, parseFloat(data.ATK_Cycle) || 0.1);
                if (obj.timer <= obj.hitDuration && obj.hitsDone < hitCount) {
                    obj.cycleTimer += deltaTime;
                    if (obj.cycleTimer >= cycle) {
                        obj.cycleTimer = 0;
                        obj.hitsDone++;
                        const hitboxType = String(data.Hitbox_Type || '').trim().toUpperCase();
                        const hitbox = { x: obj.x, y: obj.y, z: obj.z, w: obj.w, d: obj.d, h: obj.h };
                        gameState.hitboxes.push({ ...hitbox, type: hitboxType === 'HITBOX_CIRCLE' ? 'circle' : undefined, life: 0.12 });
                        gameState.effects.push({
                            type: 'shockwave',
                            renderType: data.Effect_Render_Type || 'EFT_SHOCKWAVE',
                            x: obj.x,
                            y: obj.y,
                            z: obj.z + Math.max(4, obj.h * 0.25),
                            w: obj.w,
                            d: obj.d,
                            h: obj.h,
                            life: 0.32,
                            maxLife: 0.32,
                            color: 'rgba(245,248,255,0.92)',
                            accentColor: 'rgba(40,52,68,0.82)'
                        });
                        const isHit = hitboxType === 'HITBOX_CIRCLE'
                            ? this.isPlayerInsideCircleHitbox(hitbox, gameState)
                            : this.isPlayerInsideBoxHitbox(hitbox, gameState);
                        if (isHit && obj.owner && obj.owner.hp > 0) {
                            const baseDmg = obj.owner.d.atk * (parseFloat(data.Damage_Rate) || 1);
                            this.pushBossDebugLog(gameState, 'OBJECT_HIT', `${String(data.Object_ID || '').trim()} ${this.getBossDebugName(data)}`, `${hitboxType || 'HITBOX'} / damage ${baseDmg.toFixed(1)}`);
                            PlayerManager.takeDamage(gameState, calcScaledDamage(obj.owner.d.level, gameState.player.level, baseDmg), obj.x, obj.y, null, 0, 0, this.buildGuardInfoFromAttackData(data));
                        }
                    }
                }
                if (obj.timer > obj.hitDuration + 0.05 || obj.hitsDone >= hitCount) {
                    objects.splice(i, 1);
                }
                continue;
            }

            if (obj.kind === 'interactiveSword') {
                obj.timer += deltaTime;
                obj.canInteract = !obj.disabled && this.isPlayerInsideBossObjectGetRange(obj, gameState);
                obj.interactPulse = obj.canInteract ? ((parseFloat(obj.interactPulse) || 0) + deltaTime) : 0;

                if (obj.maxLife && obj.timer > obj.maxLife) {
                    objects.splice(i, 1);
                    continue;
                }
                continue;
            }

            if (obj.kind === 'actor') {
                obj.timer += deltaTime;
                obj.actionTimer += deltaTime;

                if (obj.groupMove) {
                    obj.groupMove.elapsed = (obj.groupMove.elapsed || 0) + deltaTime;
                    const gm = obj.groupMove;
                    const t = Math.max(0, Math.min(1, gm.elapsed / Math.max(0.001, gm.duration || 0.5)));
                    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                    obj.x = gm.startX + (gm.endX - gm.startX) * ease;
                    obj.y = gm.startY + (gm.endY - gm.startY) * ease;
                    obj.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, obj.x));
                    obj.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, obj.y));
                    const gaze = String(obj.action && obj.action.Action_Object_Gaze || '').trim().toUpperCase();
                    if (gaze === 'LOOKING_LEFT') obj.faceDir = -1;
                    else if (gaze === 'LOOKING_RIGHT') obj.faceDir = 1;
                    else if (Math.abs(gm.endX - gm.startX) > 0.001) obj.faceDir = gm.endX >= gm.startX ? 1 : -1;
                    if (t >= 0.999) {
                        obj.x = gm.endX;
                        obj.y = gm.endY;
                        obj.slotKey = gm.slotKey || obj.slotKey;
                        obj.groupMove = null;
                    }
                }

                const hasRemainingScriptedActions = Array.isArray(obj.actions) && obj.actionIndex < obj.actions.length;
                if (obj.maxLife && obj.timer > obj.maxLife && !hasRemainingScriptedActions) {
                    this.pushBossDebugLog(gameState, 'OBJECT_END', `${this.getBossDebugName(obj.data)}`, 'fail-safe removed');
                    objects.splice(i, 1);
                    continue;
                }

                if (obj.action) {
                    this.updateBossObjectActionMovement(obj, obj.action, deltaTime, gameState);

                    const actionType = String(obj.action.Action_Type || '').trim().toUpperCase();
                    if (actionType === 'ATK' && !obj.actionCancelled) {
                        const hitWindow = this.getBossObjectActionHitWindow(obj, obj.action);
                        const hitStart = hitWindow.start;
                        const hitEnd = hitWindow.end || hitStart;
                        const duration = this.getBossObjectCurrentActionDuration(obj, obj.action);
                        const effectiveHitEnd = hitEnd > hitStart ? hitEnd : duration;
                        const hitCount = Math.max(1, parseInt(obj.action.ATK_Hit_Count) || 1);
                        const rawCycle = parseFloat(obj.action.ATK_Cycle);
                        const hitboxTypeForCycle = String(obj.action.Hitbox_Type || '').trim().toUpperCase();
                        const hasBodyCollisionCycle = hitboxTypeForCycle === 'HITBOX_BODY_COLLISION';
                        const defaultCycle = hasBodyCollisionCycle ? 0.035 : 0.12;
                        const hitCycle = Math.max(0.01, (!isNaN(rawCycle) && rawCycle > 0) ? rawCycle : defaultCycle);

                        if (obj.actionTimer >= hitStart && obj.actionTimer <= effectiveHitEnd && (obj.actionHitsDone || 0) < hitCount) {
                            obj.actionCycleTimer = (obj.actionCycleTimer || 0) + deltaTime;
                            if (obj.actionCycleTimer >= hitCycle) {
                                obj.actionCycleTimer = 0;
                                const didHit = this.fireBossObjectActionHit(obj, obj.action, gameState);
                                const hitboxTypeForCount = String(obj.action.Hitbox_Type || '').trim().toUpperCase();
                                const isBodyCollision = hitboxTypeForCount === 'HITBOX_BODY_COLLISION';
                                if (isBodyCollision) {
                                    // 돌진 몸통 판정은 실제 충돌했을 때만 횟수를 소비한다.
                                    // 빗나간 첫 프레임에서 카운트가 사라지면 분신이 지나가도 공격이 없는 것처럼 보인다.
                                    if (didHit) obj.actionHitsDone = (obj.actionHitsDone || 0) + 1;
                                } else {
                                    obj.actionHitsDone = (obj.actionHitsDone || 0) + 1;
                                }
                                if (obj.actionHitsDone >= hitCount) obj.actionHitFired = true;
                                if (didHit && obj.actionCancelled) obj.actionHitFired = true;
                            }
                        }
                    }

                    const duration = this.getBossObjectCurrentActionDuration(obj, obj.action);
                    if (obj.actionTimer >= duration) {
                        const spawnTiming = String(obj.action.Object_Spawn_Timing || '').trim().toUpperCase();
                        const hasSpawnObject = String(obj.action.Spawn_Object_ID || '').trim();
                        const hasSpawnGroup = String(obj.action.Spawn_Object_Group || '').trim();
                        if ((hasSpawnObject || hasSpawnGroup) && spawnTiming === 'ACTION_END' && !obj.actionObjectSpawnFired) {
                            this.spawnBossAttackObjectFromAction(obj, obj.action, gameState);
                            obj.actionObjectSpawnFired = true;
                        }
                        this.startNextBossObjectAction(obj, gameState);
                    }
                } else {
                    if (!(obj.keepAliveAfterActions && (!Array.isArray(obj.actions) || obj.actions.length <= 0))) {
                        this.startNextBossObjectAction(obj, gameState);
                    }
                }

                if (!obj.active) objects.splice(i, 1);
                continue;
            }

            obj.timer += deltaTime;
            const data = obj.data || {};
            const hitCount = Math.max(1, parseInt(data.ATK_Hit_Count) || 1);
            const cycle = Math.max(0.01, parseFloat(data.ATK_Cycle) || 0.1);
            const hitDelay = Math.max(0, parseFloat(obj.hitboxDelayTime) || 0);
            const hitStart = obj.warningDuration + hitDelay;
            const hitEnd = hitStart + obj.hitDuration;

            if (obj.timer >= hitStart && !obj.effectFired) {
                obj.effectFired = true;
                if (!obj.visualLinked) {
                    this.pushPathSlashEffects(obj.path, obj.width, obj.height, data.Effect_Render_Type || 'EFT_MANY_SLASH_BURST', gameState);
                }
            }

            if (obj.timer >= hitStart && obj.timer <= hitEnd && obj.hitsDone < hitCount) {
                obj.cycleTimer += deltaTime;
                if (obj.cycleTimer >= cycle) {
                    obj.cycleTimer = 0;
                    obj.hitsDone++;
                    this.pushDebugPathHitbox(obj.path, obj.width, obj.height, 0.12, gameState);

                    if (this.isPlayerInsidePathHitbox(obj.path, obj.width, obj.height, gameState)) {
                        const owner = obj.owner;
                        if (owner && owner.hp > 0) {
                            const dmgRate = parseFloat(data.Damage_Rate) || 1;
                            const baseDmg = owner.d.atk * dmgRate;
                            this.pushBossDebugLog(
                                gameState,
                                'OBJECT_HIT',
                                `${String(data.Object_ID || data.Attack_Object_ID || '').trim()} ${this.getBossDebugName(data)}`,
                                `path hit / damage ${baseDmg.toFixed(1)}`
                            );
                            PlayerManager.takeDamage(
                                gameState,
                                calcScaledDamage(owner.d.level, gameState.player.level, baseDmg),
                                (obj.path.startX + obj.path.endX) / 2,
                                (obj.path.startY + obj.path.endY) / 2,
                                null,
                                0,
                                0,
                                this.buildGuardInfoFromAttackData(data)
                            );
                        }
                    }
                }
            }

            if (obj.timer > hitEnd + 0.05 || obj.hitsDone >= hitCount) {
                objects.splice(i, 1);
            }
        }

        const nearestSword = this.refreshNearestBossInteractiveSwordTarget(gameState);
        if (nearestSword && this.isBossObjectGetInputActive(nearestSword, gameState)) {
            this.consumeBossInteractiveSword(nearestSword, objects, gameState);
            this.refreshNearestBossInteractiveSwordTarget(gameState);
        }
    },
};

