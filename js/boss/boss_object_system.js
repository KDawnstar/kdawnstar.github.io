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

        if (spawnPlace === 'PLACE_MAP_CENTER' || spawnPlace === 'MAP_CENTER' || spawnPlace === 'CENTER' ||
            spawnPlace === 'PLACE_MAP_NE' || spawnPlace === 'PLACE_MAP_SE' || spawnPlace === 'PLACE_MAP_SW' || spawnPlace === 'PLACE_MAP_NW') {
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

    isBossObjectActionConditionMet: function(obj, action) {
        const cond = String(action && action.Action_Condition_Type || '').trim().toUpperCase();
        if (!cond || cond === 'NONE') return true;
        if (cond === 'LATE_PHASE' || cond === 'LATE_PHASE_START') return !!(obj && obj.owner && obj.owner.boss && obj.owner.boss.isLatePhase);
        return true;
    },

    startNextBossObjectAction: function(obj, gameState) {
        if (!obj || !Array.isArray(obj.actions)) return;

        while (true) {
            obj.actionIndex++;

            if (obj.actionIndex >= obj.actions.length) {
                obj.active = false;
                const debug = this.ensureBossDebug(gameState);
                debug.currentObjectAction = null;
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT_END',
                    `${String(this.getBossObjectId(obj.data) || '').trim()} ${this.getBossDebugName(obj.data)}`,
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
            obj.actionHitsDone = 0;
            obj.actionCycleTimer = 999;
            obj.actionCancelled = false;
            obj.cancelledByGuard = false;
            obj.fadeOut = false;
            if (obj.baseOpacity != null) obj.opacity = obj.baseOpacity;
            if (obj.baseBrightness != null) obj.brightness = obj.baseBrightness;
            obj.poseType = String(action.Action_Pose_Type || obj.poseType || 'POSE_DEFAULT').trim();
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

        if (type !== 'MOVE') {
            this.applyBossObjectActionGaze(obj, action, gameState);
        }

        if (type === 'ATK') {
            this.pushBossObjectActiveAttackRangeWarning(obj, action, gameState);
        }

        if (type === 'MOVE') {
            const moveDirection = String(action.Move_Direction || '').trim().toUpperCase();
            let targetX = obj.x + obj.faceDir * 1;
            let targetY = obj.y;

            if (moveDirection === 'TO_PLAYER_AT_SPAWN' || moveDirection === 'TARGET_PLAYER_SNAPSHOT') {
                targetX = obj.targetSnapshotX;
                targetY = obj.targetSnapshotY;
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

            const isFixedTargetMove = moveDirection === 'OPPOSITE_OF_OWNER_NEXT_DIAGONAL' || stopType === 'STOP_AT_TARGET';
            if (!isNaN(explicitDistance) && explicitDistance > 0) {
                obj.moveDistance = explicitDistance;
            } else if (isFixedTargetMove) {
                // 대각선 이동류는 속도 * 시간만큼 밀어버리면 목표 코너를 지나치거나 덜 도착해서
                // 본체/분신의 전조 및 횡베기 위치가 어긋날 수 있으므로 목표 위치까지의 실제 거리로 맞춘다.
                obj.moveDistance = targetDistance;
            } else if (!isNaN(explicitDuration) && explicitDuration > 0) {
                obj.moveDistance = Math.max(0, speed * explicitDuration);
            } else {
                obj.moveDistance = targetDistance > 0 ? targetDistance : Math.max(0, speed * 0.25);
            }

            obj.actionDuration = (!isNaN(explicitDuration) && explicitDuration > 0)
                ? Math.max(0.001, explicitDuration)
                : Math.max(0.05, obj.moveDistance / speed);
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
        if (type !== 'MOVE') return;

        const duration = this.getBossObjectCurrentActionDuration(obj, action);
        const t = Math.max(0, Math.min(1, (obj.actionTimer || 0) / duration));
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
        const objectGroup = String(action.Spawn_Object_Group || action.Object_Group || '').trim();
        const objectId = String(action.Spawn_Object_ID || action.Object_ID || '').trim();
        if (!objectId && objectGroup) {
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
                const scriptedLife = hasObjectActions
                    ? (objData.Runtime_Actions || []).reduce((sum, act) => sum + Math.max(0.001, parseFloat(act.Action_Anim_Duration) || 0.001), 0) + 2.0
                    : 0;
                const explicitLife = parseFloat(objData.Object_Max_Life);
                const actorMaxLife = hasObjectActions
                    ? Math.max(4, scriptedLife, (!isNaN(explicitLife) && explicitLife > 0 ? explicitLife : 0))
                    : Math.max(4, (!isNaN(explicitLife) && explicitLife > 0 ? explicitLife : 8));
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
                    actions: hasObjectActions ? [...objData.Runtime_Actions] : [],
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
                    `type ${objectType || 'OBJECT'}, ${spawnIndex + 1}/${positions.length}, actions ${actor.actions.length}`
                );
                this.startNextBossObjectAction(actor, gameState);
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
                        const hitCycle = Math.max(0.01, (!isNaN(rawCycle) && rawCycle > 0) ? rawCycle : 0.12);

                        if (obj.actionTimer >= hitStart && obj.actionTimer <= effectiveHitEnd && (obj.actionHitsDone || 0) < hitCount) {
                            obj.actionCycleTimer = (obj.actionCycleTimer || 0) + deltaTime;
                            if (obj.actionCycleTimer >= hitCycle) {
                                obj.actionCycleTimer = 0;
                                const didHit = this.fireBossObjectActionHit(obj, obj.action, gameState);
                                obj.actionHitsDone = (obj.actionHitsDone || 0) + 1;
                                if (obj.actionHitsDone >= hitCount) obj.actionHitFired = true;
                                if (didHit && obj.actionCancelled) obj.actionHitFired = true;
                            }
                        }
                    }

                    const duration = this.getBossObjectCurrentActionDuration(obj, obj.action);
                    if (obj.actionTimer >= duration) {
                        this.startNextBossObjectAction(obj, gameState);
                    }
                } else {
                    this.startNextBossObjectAction(obj, gameState);
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
    },
};

