// boss_action_system.js
// 보스 패턴 액션의 시작 처리와 액션 중 이동 처리를 담당한다.
//
// 이 파일은 monster_runtime_system.js에서 분리된 보스 액션 실행 보조 시스템이다.
// 기존 MonsterManager 메서드와 호환되도록, 각 함수는 MonsterManager를 this로 받아 실행된다.

const BossActionSystem = {

    applyBossActionGaze: function(m, action, gameState) {
        if (!m || !action) return;

        const gaze = String(action.Action_Boss_Gaze || action.Boss_Gaze || '').trim().toUpperCase();
        if (!gaze || gaze === 'NONE') return;

        if (gaze === 'LOOKING_LEFT') { m.faceDir = -1; return; }
        if (gaze === 'LOOKING_RIGHT') { m.faceDir = 1; return; }
        if (gaze === 'LOOKING_MAP_CENTER' || gaze === 'MAP_CENTER') {
            const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
            const dx = worldW / 2 - (parseFloat(m.x) || 0);
            if (Math.abs(dx) > 0.001) m.faceDir = dx >= 0 ? 1 : -1;
            return;
        }

        if (gaze === 'LOOKING_PLAYER' || gaze === 'LOOKING_TARGET' || gaze === 'GAZE_LOOK_ENEMY') {
            const p = gameState && gameState.player ? gameState.player : null;
            if (!p) return;
            const dx = (parseFloat(p.x) || 0) - (parseFloat(m.x) || 0);
            if (Math.abs(dx) > 0.001) m.faceDir = dx >= 0 ? 1 : -1;
            return;
        }

        if (gaze === 'LOOKING_MOVE_DIRECTION' || gaze === 'GAZE_MOVE_DIREC') {
            const boss = m.boss || null;
            const move = boss && boss.actionMove ? boss.actionMove : null;
            if (move) {
                const dx = (parseFloat(move.endX) || 0) - (parseFloat(move.startX) || 0);
                if (Math.abs(dx) > 0.001) m.faceDir = dx >= 0 ? 1 : -1;
                return;
            }
            const path = boss && (boss.currentDashPath || boss.previewDashPath || boss.lastDashPath) ? (boss.currentDashPath || boss.previewDashPath || boss.lastDashPath) : null;
            if (path && Math.abs(parseFloat(path.dirX) || 0) > 0.001) {
                m.faceDir = (parseFloat(path.dirX) || 0) >= 0 ? 1 : -1;
            }
        }
    },



    getBossFixedMapPosition: function(gameState, placeType) {
        const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        const sideMarginX = Math.max(90, worldW * 0.08);
        const lineRushMarginX = Math.max(64, worldW * 0.055);
        const upperLineY = Math.max(38, Math.min(worldD - 38, worldD * 0.29));
        const lowerLineY = Math.max(38, Math.min(worldD - 38, worldD * 0.71));
        const innerMarginX = Math.max(150, Math.min(230, worldW * 0.14));
        const innerMarginY = Math.max(62, Math.min(92, worldD * 0.18));
        const edgeMarginX = Math.max(48, Math.min(82, worldW * 0.04));
        const edgeMarginY = Math.max(28, Math.min(48, worldD * 0.075));
        const key = String(placeType || '').trim().toUpperCase();
        const center = { x: worldW / 2, y: worldD / 2, slotKey: 'CENTER' };
        const map = {
            PLACE_MAP_CENTER: center,
            MAP_CENTER: center,
            CENTER: center,
            PLACE_MAP_CENTER_AIR: { x: worldW / 2, y: worldD / 2, z: 250, slotKey: 'CENTER_AIR' },
            MAP_CENTER_AIR: { x: worldW / 2, y: worldD / 2, z: 250, slotKey: 'CENTER_AIR' },
            CENTER_AIR: { x: worldW / 2, y: worldD / 2, z: 250, slotKey: 'CENTER_AIR' },
            PLACE_MAP_EAST: { x: worldW - sideMarginX, y: worldD / 2, slotKey: 'EAST' },
            MAP_EAST: { x: worldW - sideMarginX, y: worldD / 2, slotKey: 'EAST' },
            EAST: { x: worldW - sideMarginX, y: worldD / 2, slotKey: 'EAST' },
            PLACE_MAP_EDGE_EAST: { x: worldW + 34, y: worldD / 2, slotKey: 'EDGE_EAST' },
            MAP_EDGE_EAST: { x: worldW + 34, y: worldD / 2, slotKey: 'EDGE_EAST' },
            EDGE_EAST: { x: worldW + 34, y: worldD / 2, slotKey: 'EDGE_EAST' },
            PLACE_MAP_RIGHT_AIR: { x: worldW - Math.max(130, worldW * 0.105), y: Math.max(34, worldD * 0.12), z: 260, slotKey: 'RIGHT_AIR' },
            MAP_RIGHT_AIR: { x: worldW - Math.max(130, worldW * 0.105), y: Math.max(34, worldD * 0.12), z: 260, slotKey: 'RIGHT_AIR' },
            RIGHT_AIR: { x: worldW - Math.max(130, worldW * 0.105), y: Math.max(34, worldD * 0.12), z: 260, slotKey: 'RIGHT_AIR' },
            PLACE_MAP_LEFT_AIR: { x: Math.max(130, worldW * 0.105), y: Math.max(34, worldD * 0.12), z: 260, slotKey: 'LEFT_AIR' },
            MAP_LEFT_AIR: { x: Math.max(130, worldW * 0.105), y: Math.max(34, worldD * 0.12), z: 260, slotKey: 'LEFT_AIR' },
            LEFT_AIR: { x: Math.max(130, worldW * 0.105), y: Math.max(34, worldD * 0.12), z: 260, slotKey: 'LEFT_AIR' },
            PLACE_MAP_WEST: { x: sideMarginX, y: worldD / 2, slotKey: 'WEST' },
            MAP_WEST: { x: sideMarginX, y: worldD / 2, slotKey: 'WEST' },
            WEST: { x: sideMarginX, y: worldD / 2, slotKey: 'WEST' },
            PLACE_MAP_TOP_CENTER: { x: worldW / 2, y: Math.max(22, Math.min(46, worldD * 0.08)), slotKey: 'TOP_CENTER' },
            MAP_TOP_CENTER: { x: worldW / 2, y: Math.max(22, Math.min(46, worldD * 0.08)), slotKey: 'TOP_CENTER' },
            TOP_CENTER: { x: worldW / 2, y: Math.max(22, Math.min(46, worldD * 0.08)), slotKey: 'TOP_CENTER' },
            PLACE_MAP_TOP_RIGHT: { x: worldW - lineRushMarginX, y: upperLineY, slotKey: 'TOP_RIGHT' },
            MAP_TOP_RIGHT: { x: worldW - lineRushMarginX, y: upperLineY, slotKey: 'TOP_RIGHT' },
            TOP_RIGHT: { x: worldW - lineRushMarginX, y: upperLineY, slotKey: 'TOP_RIGHT' },
            PLACE_MAP_BOTTOM_LEFT: { x: lineRushMarginX, y: lowerLineY, slotKey: 'BOTTOM_LEFT' },
            MAP_BOTTOM_LEFT: { x: lineRushMarginX, y: lowerLineY, slotKey: 'BOTTOM_LEFT' },
            BOTTOM_LEFT: { x: lineRushMarginX, y: lowerLineY, slotKey: 'BOTTOM_LEFT' },

            // 기존 PLACE_MAP_*는 대형 패턴 3번 교차 발도 기준에 맞춰 맵 끝 모서리 쪽으로 유지한다.
            PLACE_MAP_NE: { x: worldW - edgeMarginX, y: edgeMarginY, slotKey: 'EDGE_NE' },
            PLACE_MAP_SE: { x: worldW - edgeMarginX, y: worldD - edgeMarginY, slotKey: 'EDGE_SE' },
            PLACE_MAP_SW: { x: edgeMarginX, y: worldD - edgeMarginY, slotKey: 'EDGE_SW' },
            PLACE_MAP_NW: { x: edgeMarginX, y: edgeMarginY, slotKey: 'EDGE_NW' },
            PLACE_MAP_EDGE_NE: { x: worldW - edgeMarginX, y: edgeMarginY, slotKey: 'EDGE_NE' },
            PLACE_MAP_EDGE_SE: { x: worldW - edgeMarginX, y: worldD - edgeMarginY, slotKey: 'EDGE_SE' },
            PLACE_MAP_EDGE_SW: { x: edgeMarginX, y: worldD - edgeMarginY, slotKey: 'EDGE_SW' },
            PLACE_MAP_EDGE_NW: { x: edgeMarginX, y: edgeMarginY, slotKey: 'EDGE_NW' },
            MAP_EDGE_NE: { x: worldW - edgeMarginX, y: edgeMarginY, slotKey: 'EDGE_NE' },
            MAP_EDGE_SE: { x: worldW - edgeMarginX, y: worldD - edgeMarginY, slotKey: 'EDGE_SE' },
            MAP_EDGE_SW: { x: edgeMarginX, y: worldD - edgeMarginY, slotKey: 'EDGE_SW' },
            MAP_EDGE_NW: { x: edgeMarginX, y: edgeMarginY, slotKey: 'EDGE_NW' },

            // 대형 패턴 1번 분신 배치처럼 “모서리 방향이지만 조금 안쪽”이어야 하는 위치.
            PLACE_MAP_INNER_NE: { x: worldW - innerMarginX, y: innerMarginY, slotKey: 'INNER_NE' },
            PLACE_MAP_INNER_SE: { x: worldW - innerMarginX, y: worldD - innerMarginY, slotKey: 'INNER_SE' },
            PLACE_MAP_INNER_SW: { x: innerMarginX, y: worldD - innerMarginY, slotKey: 'INNER_SW' },
            PLACE_MAP_INNER_NW: { x: innerMarginX, y: innerMarginY, slotKey: 'INNER_NW' },
            MAP_INNER_NE: { x: worldW - innerMarginX, y: innerMarginY, slotKey: 'INNER_NE' },
            MAP_INNER_SE: { x: worldW - innerMarginX, y: worldD - innerMarginY, slotKey: 'INNER_SE' },
            MAP_INNER_SW: { x: innerMarginX, y: worldD - innerMarginY, slotKey: 'INNER_SW' },
            MAP_INNER_NW: { x: innerMarginX, y: innerMarginY, slotKey: 'INNER_NW' }
        };
        return map[key] || map.PLACE_MAP_CENTER;
    },

    getBossPositionSlotGroup: function(gameState, groupId) {
        const group = String(groupId || '').trim().toUpperCase();
        if (group === 'CENTER_NE_SE_SW_NW_FIVE_SLOT' || group === 'MAJOR_PATTERN_1_FIVE_SLOT' || group === 'CENTER_INNER_NE_SE_SW_NW_FIVE_SLOT' || !group) {
            return [
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_INNER_NE'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_INNER_SE'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_INNER_SW'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_INNER_NW')
            ];
        }
        if (group === 'CENTER_EDGE_NE_SE_SW_NW_FIVE_SLOT' || group === 'MAJOR_PATTERN_3_EDGE_FIVE_SLOT') {
            return [
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_EDGE_NE'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_EDGE_SE'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_EDGE_SW'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_EDGE_NW')
            ];
        }
        return [this.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER')];
    },



    setKasiyasMajorPattern3RushActorsHidden: function(m, gameState, hidden) {
        const boss = m && m.boss ? m.boss : null;
        if (boss) boss.kasiyasP1M3RushHidden = !!hidden;
        if (gameState && Array.isArray(gameState.bossAttackObjects)) {
            gameState.bossAttackObjects.forEach(obj => {
                if (!obj) return;
                const data = obj.data || {};
                const objectId = String(data.Object_ID || data.Attack_Object_ID || obj.objectId || '').trim();
                const objectType = String(data.Object_Type || '').trim().toUpperCase();
                if (objectId === '251018' || objectType.indexOf('CLONE') >= 0) {
                    obj.kasiyasP1M3RushHidden = !!hidden;
                }
            });
        }
    },



    getKasiyasMajorPattern3RushPathKey: function(action, actorKind = '') {
        const group = String(action && (action.Random_Action_Group || action._Random_Action_Group || action.Random_Action_Set_ID || action._Random_Action_Set_ID) || '').trim();
        if (group) return group.toUpperCase();
        const randomOrder = String(action && (action.Random_Action_Order || action._Random_Action_Order) || '').trim();
        const id = String(action && (action.Action_ID || action.Object_Action_ID || action._Pattern_Action_ID) || '').trim();
        return `${String(actorKind || 'ACTOR').toUpperCase()}:${randomOrder || 'NO_RANDOM'}:${id || 'NO_ID'}`;
    },

    getKasiyasMajorPattern3RushStore: function(actor) {
        const boss = actor && actor.boss ? actor.boss : (actor && actor.owner && actor.owner.boss ? actor.owner.boss : null);
        if (!boss) return null;
        boss.majorPattern3Runtime = boss.majorPattern3Runtime || {};
        boss.majorPattern3Runtime.randomRushPaths = boss.majorPattern3Runtime.randomRushPaths || {};
        return boss.majorPattern3Runtime.randomRushPaths;
    },

    isValidKasiyasMajorPattern3RushPath: function(path) {
        return !!(path && path.randomSideRush && (parseFloat(path.length) || 0) >= 90);
    },

    getKasiyasMajorPattern3StoredRushPath: function(actor, action, gameState, actorKind = 'BOSS', options = {}) {
        const store = this.getKasiyasMajorPattern3RushStore(actor);
        const key = this.getKasiyasMajorPattern3RushPathKey(action, actorKind);
        if (!store || !key) return null;
        let path = store[key] || null;
        const allowCreate = options.create !== false;
        if (!this.isValidKasiyasMajorPattern3RushPath(path) && allowCreate && typeof this.computeKasiyasMajorPattern3SideRushPath === 'function') {
            path = this.computeKasiyasMajorPattern3SideRushPath(actor, action, gameState);
            if (path) {
                path.randomActionGroupKey = key;
                path.randomActorKind = String(actorKind || '').toUpperCase();
                store[key] = path;
            }
        }
        return path;
    },

    ensureKasiyasMajorPattern3RushSlotPath: function(actor, action, gameState, actorKind = 'BOSS') {
        // 대형 패턴 3번 6회 랜덤 돌진은 "돌진 액션"이 경로를 새로 뽑는 구조가 아니라,
        // Random_Action_Group별로 확정된 경로를 본체/분신이 그대로 수행하는 구조로 고정한다.
        return this.getKasiyasMajorPattern3StoredRushPath(actor, action, gameState, actorKind, { create: true });
    },

    getKasiyasMajorPattern3RushSlotPath: function(actor, action, actorKind = 'BOSS') {
        const store = this.getKasiyasMajorPattern3RushStore(actor);
        const key = this.getKasiyasMajorPattern3RushPathKey(action, actorKind);
        if (!store || !key) return null;
        return store[key] || null;
    },

    shuffleArrayInPlace: function(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    },


    inferNearestBossPositionSlotKey: function(actorRef, slots) {
        if (!actorRef || !Array.isArray(slots) || slots.length <= 0) return '';
        const ax = parseFloat(actorRef.x) || 0;
        const ay = parseFloat(actorRef.y) || 0;
        let best = null;
        let bestDist = Infinity;
        slots.forEach(slot => {
            if (!slot) return;
            const dx = ax - (parseFloat(slot.x) || 0);
            const dy = ay - (parseFloat(slot.y) || 0);
            const dist = dx * dx + dy * dy;
            if (dist < bestDist) {
                bestDist = dist;
                best = slot;
            }
        });
        return best ? String(best.slotKey || '').trim() : '';
    },

    chooseUniqueShuffleSlotsForActors: function(actors, slots, bossPrevSlotKey = '') {
        const limitedActors = Array.isArray(actors) ? actors : [];
        const baseSlots = Array.isArray(slots) ? slots : [];
        const result = this.shuffleArrayInPlace([...baseSlots]).slice(0, limitedActors.length);

        // 대형 패턴 1번의 위치 섞기는 본체가 직전 위치에 그대로 남으면
        // 플레이어가 "셔플이 안 됐다"고 느끼기 쉽다. 본체가 포함된 셔플에서는
        // 본체 슬롯만큼은 직전 슬롯과 다르게 보정한다. 슬롯 중복은 유지하지 않는다.
        if (limitedActors.length > 1 && limitedActors[0] && limitedActors[0].kind === 'boss') {
            const prevKey = String(bossPrevSlotKey || '').trim().toUpperCase();
            if (prevKey) {
                const currentBossSlot = result[0] ? String(result[0].slotKey || '').trim().toUpperCase() : '';
                if (currentBossSlot === prevKey) {
                    let swapIndex = -1;
                    for (let i = 1; i < result.length; i++) {
                        const key = result[i] ? String(result[i].slotKey || '').trim().toUpperCase() : '';
                        if (key && key !== prevKey) { swapIndex = i; break; }
                    }
                    if (swapIndex > 0) {
                        const tmp = result[0];
                        result[0] = result[swapIndex];
                        result[swapIndex] = tmp;
                    }
                }
            }
        }

        return result;
    },

    applyGroupShuffleGazeToActor: function(actorRef, action) {
        if (!actorRef || !action) return false;
        const gaze = String(action.Action_Object_Gaze || action.Action_Boss_Gaze || action.Boss_Gaze || '').trim().toUpperCase();
        if (!gaze || gaze === 'NONE') return false;
        if (gaze === 'LOOKING_LEFT') { actorRef.faceDir = -1; return true; }
        if (gaze === 'LOOKING_RIGHT') { actorRef.faceDir = 1; return true; }
        return false;
    },

    pushBossNoiseTeleportEffect: function(gameState, x, y, z, w, h, renderType, phase = 'VANISH') {
        if (!gameState || !Array.isArray(gameState.effects)) return;
        gameState.effects.push({
            type: 'noiseTeleport',
            renderType: renderType || 'EFT_NOISE_MOVE',
            phase: phase,
            x: x,
            y: y,
            z: z,
            w: Math.max(70, w || 120),
            h: Math.max(70, h || 120),
            life: phase === 'APPEAR' ? 0.30 : 0.24,
            maxLife: phase === 'APPEAR' ? 0.30 : 0.24
        });
    },


    trySpawnBossPatternActionObjectsAtTiming: function(m, action, gameState, timing) {
        if (!m || !action || !gameState) return false;
        const boss = m.boss || (m.owner && m.owner.boss) || null;
        const hasSpawnObject = String(action.Spawn_Object_ID || '').trim();
        const hasSpawnGroup = String(action.Spawn_Object_Group || '').trim();
        if (!hasSpawnObject && !hasSpawnGroup) return false;

        const desiredTiming = String(action.Object_Spawn_Timing || 'ACTION_START').trim().toUpperCase() || 'ACTION_START';
        const targetTiming = String(timing || '').trim().toUpperCase();
        if (desiredTiming !== targetTiming) return false;

        const flagName = targetTiming === 'ACTION_END' ? 'actionObjectSpawnEndFired' : 'actionObjectSpawnStartFired';
        if (boss && boss[flagName]) return false;

        this.spawnBossAttackObjectFromAction(m, action, gameState);
        if (boss) boss[flagName] = true;
        return true;
    },

    isKasiyasP2Pattern3JumpWarningAction: function(action) {
        if (!action) return false;
        const patternId = String(action.Pattern_ID || '').trim();
        const pose = String(action.Action_Pose_Type || '').trim().toUpperCase();
        const name = String(action.Action_Name || '').trim();
        const moveType = this.normalizeBossActionMoveType ? this.normalizeBossActionMoveType(action.Action_Move_Type) : String(action.Action_Move_Type || '').trim().toUpperCase();
        const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
        return patternId === '232003' && moveType === 'JUMP' && (moveDir === 'JUMP_TO_ENEMY' || moveDir === 'JUMP_TO_SAFE_AREA_CENTER' || pose === 'POSE_KASIYAS_P2_JUMP_WITH_DOUBLE_EDGED_SWORD' || name.indexOf('공중 회전 베기 도약') >= 0);
    },

    isKasiyasP2Pattern3JumpSlashAction: function(action) {
        if (!action) return false;
        const patternId = String(action.Pattern_ID || '').trim();
        const pose = String(action.Action_Pose_Type || '').trim().toUpperCase();
        const name = String(action.Action_Name || '').trim();
        const effect = String(action.VFX_Type || action.Effect_Render_Type || '').trim().toUpperCase();
        return patternId === '232003' && (
            pose === 'POSE_KASIYAS_P2_DOUBLE_EDGED_SWORD_JUMP_SLASH' ||
            effect === 'EFT_KASIYAS_P2_DOUBLE_EDGED_SWORD_JUMP_SLASH' ||
            name.indexOf('공중 회전 베기') >= 0
        );
    },

    getBossPatternObjectsByGroup: function(gameState, groupId) {
        const group = String(groupId || '').trim();
        if (!group) return [];
        return (gameState.bossAttackObjects || []).filter(obj => {
            if (!obj || !obj.active || obj.kind !== 'actor') return false;
            const data = obj.data || {};
            return String(obj.objectGroup || data.Object_Group || data.Spawn_Object_Group || '').trim() === group;
        });
    },

    getUniqueBossPatternObjectsByGroup: function(gameState, groupId, maxCount = 0) {
        const objects = this.getBossPatternObjectsByGroup(gameState, groupId);
        const byId = new Map();
        const extras = [];

        // 같은 Object_ID가 중복 active 상태면 가장 최근에 생성된 쪽을 남긴다.
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            const data = obj && obj.data ? obj.data : {};
            const id = String(data.Object_ID || obj.Object_ID || obj.id || '').trim() || `idx_${i}`;
            if (!byId.has(id)) byId.set(id, obj);
            else extras.push(obj);
        }

        extras.forEach(obj => { if (obj) obj.active = false; });

        let unique = Array.from(byId.values()).reverse();
        const limit = Math.max(0, parseInt(maxCount) || 0);
        if (limit > 0 && unique.length > limit) {
            const overflow = unique.slice(limit);
            overflow.forEach(obj => { if (obj) obj.active = false; });
            unique = unique.slice(0, limit);
        }
        return unique.filter(obj => obj && obj.active);
    },

    prepareBossGroupSlotShuffle: function(m, action, gameState) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !action || !gameState) return null;

        const targetGroup = String(action.Action_Target_Object_Group || action.Target_Object_Group || action.Spawn_Object_Group || '').trim();
        const includeBoss = String(action.Action_Target_Group || '').trim().toUpperCase() === 'BOSS_AND_OBJECT_GROUP';
        const slots = this.getBossPositionSlotGroup(gameState, action.Action_Position_Group || action.Position_Group);
        const maxObjectCount = includeBoss ? Math.max(0, slots.length - 1) : slots.length;
        let objects = this.getUniqueBossPatternObjectsByGroup(gameState, targetGroup, maxObjectCount);

        // 그룹 소환 직후 타이밍이 엇갈리면 첫 위치 섞기 액션이 분신을 못 잡을 수 있다.
        // 다만 2차/3차 셔플에서 분신이 부족하다고 새로 만들면 액션 순서가 1차부터 다시 시작되어
        // 분신이 사라졌다가 다시 나타나는 문제가 생긴다. 따라서 보정 소환은 1차 위치 섞기에서만 허용한다.
        const shuffleOrder = parseFloat(action.Action_Order) || 0;
        const shuffleName = String(action.Action_Name || '').trim();
        const allowMissingCloneRespawn = includeBoss && targetGroup && (shuffleOrder <= 4 || shuffleName.includes('1차 위치'));
        if (allowMissingCloneRespawn && objects.length < Math.max(0, slots.length - 1) && gameState.DB_BOSS_PATTERN_OBJECT) {
            const existingIds = new Set(objects.map(obj => String(obj && obj.data && obj.data.Object_ID || '').trim()));
            Object.keys(gameState.DB_BOSS_PATTERN_OBJECT).forEach(key => {
                const data = gameState.DB_BOSS_PATTERN_OBJECT[key];
                if (!data) return;
                if (String(data.Object_Group || data.Spawn_Object_Group || '').trim() !== targetGroup) return;
                const id = String(data.Object_ID || key).trim();
                if (!id || existingIds.has(id)) return;
                if (typeof this.spawnBossAttackObjectFromAction === 'function') {
                    this.spawnBossAttackObjectFromAction(m, { ...action, Spawn_Object_ID: id, Object_ID: id, Spawn_Object_Group: '' }, gameState);
                }
            });
            objects = this.getUniqueBossPatternObjectsByGroup(gameState, targetGroup, maxObjectCount);
        } else if (includeBoss && targetGroup && objects.length < Math.max(0, slots.length - 1)) {
            this.pushBossDebugLog(
                gameState,
                'GROUP_MOVE_WARN',
                `${String(action.Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
                `clone group ${targetGroup} has ${objects.length}/${Math.max(0, slots.length - 1)} active clones; no respawn outside first shuffle`
            );
        }


        const actors = [];
        if (includeBoss) actors.push({ kind: 'boss', ref: m });
        objects.forEach(obj => actors.push({ kind: 'object', ref: obj }));

        if (actors.length <= 0 || slots.length <= 0) return null;

        // SHUFFLE_UNIQUE는 슬롯 중복을 허용하지 않는다.
        // 대상이 슬롯보다 많으면 초과 오브젝트를 비활성화하고, 남은 대상만 중복 없이 배정한다.
        if (actors.length > slots.length) {
            const overflow = actors.splice(slots.length);
            overflow.forEach(actor => {
                if (actor && actor.kind === 'object' && actor.ref) actor.ref.active = false;
            });
        }

        const runtime = boss.majorPattern1Runtime || {};
        const inferredBossSlotKey = includeBoss ? this.inferNearestBossPositionSlotKey(m, slots) : '';
        const previousBossSlotKey = String(runtime.realSlotKey || inferredBossSlotKey || '').trim();
        const shuffledSlots = this.chooseUniqueShuffleSlotsForActors(actors, slots, previousBossSlotKey);
        const duration = Math.max(0.08, parseFloat(action.Action_Anim_Duration) || 0.5);
        const vfx = String(action.VFX_Type || action.Effect_Render_Type || 'EFT_NOISE_MOVE').trim();
        const moveType = this.normalizeBossActionMoveType(action.Action_Move_Type || action.Move_Type);
        const useNoiseTeleport = moveType === 'NOISE' || String(action.Action_Move_Type || '').trim().toUpperCase() === 'MOVE_WITH_NOISE';

        const assignments = [];
        actors.forEach((actor, idx) => {
            const target = shuffledSlots[idx] || slots[idx];
            const ref = actor.ref;
            const startX = parseFloat(ref.x) || 0;
            const startY = parseFloat(ref.y) || 0;
            const endX = Math.max(0, Math.min(gameState.WORLD_WIDTH, target.x));
            const endY = Math.max(0, Math.min(gameState.WORLD_DEPTH, target.y));
            const bodyH = (((ref.d && ref.d.bodyZ) || 160) * ((ref.scale || 1)));
            const bodyW = (((ref.d && ref.d.bodyX) || 80) * ((ref.scale || 1)));
            const z = (ref.z || 0) + bodyH * 0.45;
            const move = {
                type: 'GROUP_SLOT_SHUFFLE',
                slotKey: target.slotKey || '',
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY,
                duration: duration,
                elapsed: 0,
                renderType: vfx,
                noiseTeleport: useNoiseTeleport
            };

            if (useNoiseTeleport) {
                // 대형 패턴 1번 위치 섞기는 이동 경로를 보여주면 본체 추적이 쉬워지므로,
                // 실제 보간 이동 대신 사라짐 → 즉시 재배치 → 재등장 노이즈로 처리한다.
                this.pushBossNoiseTeleportEffect(gameState, startX, startY, z, bodyW * 1.9, bodyH * 0.82, vfx, 'VANISH');
                ref.x = endX;
                ref.y = endY;
                this.pushBossNoiseTeleportEffect(gameState, endX, endY, z, bodyW * 1.9, bodyH * 0.82, vfx, 'APPEAR');
                if (actor.kind === 'boss') {
                    boss.actionMove = null;
                    boss.majorPattern1Runtime = boss.majorPattern1Runtime || {};
                    boss.majorPattern1Runtime.realSlotKey = move.slotKey;
                } else {
                    ref.groupMove = null;
                    ref.slotKey = move.slotKey;
                }
            } else {
                if (actor.kind === 'boss') {
                    boss.actionMove = move;
                    boss.majorPattern1Runtime = boss.majorPattern1Runtime || {};
                    boss.majorPattern1Runtime.realSlotKey = move.slotKey;
                } else {
                    ref.groupMove = move;
                    ref.slotKey = move.slotKey;
                }
                gameState.effects.push({
                    type: 'afterimageDashTrail',
                    renderType: vfx,
                    x: move.startX,
                    y: move.startY,
                    z: z,
                    dir: ref.faceDir || 1,
                    w: Math.max(90, Math.sqrt((move.endX - move.startX) ** 2 + (move.endY - move.startY) ** 2) * 0.38),
                    h: 54,
                    life: 0.28,
                    maxLife: 0.28,
                    pathAngle: Math.atan2(move.endY - move.startY, move.endX - move.startX)
                });
            }

            // 위치 섞기는 이동 방향을 보여주면 패턴 판별성이 무너진다.
            // 데이터에 시선값이 있으면 그 값을 최종 우선 적용하고, 이동 방향으로 faceDir을 덮어쓰지 않는다.
            const gazeApplied = this.applyGroupShuffleGazeToActor(ref, action);
            if (!gazeApplied && !useNoiseTeleport) {
                const dx = endX - startX;
                if (Math.abs(dx) > 0.001) ref.faceDir = dx >= 0 ? 1 : -1;
            }
            assignments.push({
                actor: actor.kind,
                id: actor.kind === 'boss' ? 'BOSS' : String((ref.data && ref.data.Object_ID) || ref.id || '').trim(),
                fromSlotKey: actor.kind === 'boss' ? previousBossSlotKey : String(ref.previousSlotKey || '').trim(),
                slotKey: move.slotKey
            });
        });

        this.pushBossDebugLog(gameState, 'GROUP_MOVE', `${String(action.Action_ID || '').trim()} ${this.getBossDebugName(action)}`, assignments.map(a => `${a.id || a.actor}:${a.fromSlotKey || '-'}>${a.slotKey}`).join(', '));
        return boss.actionMove;
    },


    startBossPatternDialogue: function(m, action, gameState) {
        const text = String(action.Pattern_Dialogue_Output || action.Action_Dialogue || '').trim();
        if (!text) return;
        const start = Math.max(0, parseFloat(action.Pattern_Dialogue_Start_Time) || 0);
        const endRaw = parseFloat(action.Pattern_Dialogue_End_Time);
        const end = !isNaN(endRaw) && endRaw > start ? endRaw : Math.max(start + 1.2, this.getBossActionDuration(m, action, gameState));
        gameState.bossPatternDialogue = {
            text: text.replace(/^['\"]|['\"]$/g, ''),
            delay: start,
            timer: Math.max(0.1, end - start),
            maxTime: Math.max(0.1, end - start),
            sourceActionId: String(action.Action_ID || '').trim()
        };
    },


    pushBossActiveAttackRangeWarning: function(m, action, gameState) {
        if (!m || !action || !gameState || !Array.isArray(gameState.effects)) return;
        const type = String(action.Action_Type || '').trim().toUpperCase();
        if (type !== 'ATK') return;

        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        if (hitboxType !== 'HITBOX_CIRCLE') return;

        const attackType = String(action.Action_Attack_Type || '').trim().toUpperCase();
        const poseType = String(action.Action_Pose_Type || '').trim().toUpperCase();
        const effectType = String(action.Effect_Render_Type || action.VFX_Type || '').trim().toUpperCase();
        const isSwordplay = attackType === 'ATK_SWORDPLAY' || poseType === 'POSE_KASIYAS_SWORDPLAY' || effectType === 'EFT_KASIYAS_SWORDPLAY';
        const isChargeHorizontal = poseType === 'POSE_KASIYAS_CHARGE_HORIZONTAL_SLASH' || effectType === 'EFT_KASIYAS_CHARGE_HORIZONTAL_SLASH';
        if (!isSwordplay && !isChargeHorizontal) return;

        const hitbox = this.getBossPatternActionHitbox(m, action);
        if (!hitbox) return;
        const player = gameState.player || {};
        const pW = Math.max(0, (parseFloat(player.bodyX) || 0) * (parseFloat(player.scale) || 1));
        const pD = Math.max(0, (parseFloat(player.bodyY) || 0) * (parseFloat(player.scale) || 1));
        const duration = this.getBossActionDuration(m, action, gameState);
        gameState.effects.push({
            type: 'warning',
            renderType: 'WARNING_HITBOX',
            warningRenderType: 'WARNING_HITBOX',
            activeAttackRange: true,
            sourceBoss: m,
            sourceActionId: String(action.Action_ID || '').trim(),
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


    isBossInlineActionWarningEnabled: function(action) {
        const type = String(action && action.Action_Type || '').trim().toUpperCase();
        if (type !== 'ATK') return false;
        const warningType = String(action && action.Warning_Render_Type || '').trim().toUpperCase();
        return !!warningType && warningType !== 'NONE' && warningType !== 'NULL';
    },

    getBossInlineActionWarningWindow: function(m, action, gameState) {
        const hitWindow = (typeof this.getBossActionHitWindow === 'function') ? this.getBossActionHitWindow(m, action) : { start: parseFloat(action && action.Hitbox_Start_Time) || 0 };
        const hitStart = Math.max(0, parseFloat(hitWindow && hitWindow.start) || 0);
        const rawStart = parseFloat(action && action.Warning_Start_Time);
        const rawEnd = parseFloat(action && action.Warning_End_Time);
        const start = (!isNaN(rawStart) && rawStart >= 0) ? rawStart : 0;
        const end = (!isNaN(rawEnd) && rawEnd > start) ? rawEnd : hitStart;
        return {
            start: Math.max(0, start),
            end: Math.max(0, end),
            hitStart: hitStart
        };
    },

    clearBossInlineActionWarning: function(m, action, gameState) {
        if (!gameState || !Array.isArray(gameState.effects) || !action) return;
        const actionId = String(action.Action_ID || '').trim();
        gameState.effects = gameState.effects.filter(e => !(e && e.inlineActionWarning && e.sourceBoss === m && String(e.sourceActionId || '').trim() === actionId));
    },

    updateBossInlineActionWarning: function(m, action, gameState) {
        if (!m || !action || !gameState || !Array.isArray(gameState.effects)) return;
        const actionId = String(action.Action_ID || '').trim();
        // 매 프레임 위치/시선/히트박스 보정이 바뀔 수 있으므로 이전 프레임의 같은 전조를 제거한 뒤 현재 프레임 기준으로 다시 배치한다.
        this.clearBossInlineActionWarning(m, action, gameState);
        if (!this.isBossInlineActionWarningEnabled(action)) return;

        const warningType = String(action.Warning_Render_Type || '').trim().toUpperCase();
        const win = this.getBossInlineActionWarningWindow(m, action, gameState);
        const timer = Math.max(0, parseFloat(m.timer) || 0);
        if (win.end <= win.start || timer < win.start || timer >= win.end) return;

        const hitbox = (typeof this.getBossPatternActionHitbox === 'function') ? this.getBossPatternActionHitbox(m, action) : null;
        if (!hitbox) return;
        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        const duration = Math.max(0.06, win.end - timer + 0.02);
        const progress = Math.max(0, Math.min(1, (timer - win.start) / Math.max(0.001, win.end - win.start)));

        if (warningType === 'WARNING_HITBOX' || warningType === 'EFT_WARNING_HITBOX') {
            gameState.effects.push({
                type: 'warning',
                renderType: 'WARNING_HITBOX',
                warningRenderType: 'WARNING_HITBOX',
                inlineActionWarning: true,
                sourceBoss: m,
                sourceActionId: actionId,
                x: hitbox.x,
                y: hitbox.y,
                // 전조 표시는 지면 투영만 사용한다. z/h는 정렬용 메타값으로만 보존하고 렌더 크기에는 쓰지 않는다.
                z: 0,
                w: Math.max(4, hitbox.w),
                d: Math.max(4, hitbox.d),
                h: hitbox.h,
                hitboxType: hitboxType,
                warningProgress: progress,
                life: duration,
                maxLife: duration
            });
            return;
        }
    },

    resolveKasiyasP2Pattern3SafeAreaCenter: function(gameState) {
        const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        const normalizeRect = (data) => {
            if (!data) return null;
            const x = parseFloat(data.Safe_Area_X);
            const y = parseFloat(data.Safe_Area_Y);
            const w = parseFloat(data.Safe_Area_W);
            const h = parseFloat(data.Safe_Area_H);
            if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
            return {
                x: Math.max(0, Math.min(worldW, x)),
                y: Math.max(0, Math.min(worldD, y)),
                w: Math.max(1, Math.min(worldW - Math.max(0, x), w)),
                h: Math.max(1, Math.min(worldD - Math.max(0, y), h))
            };
        };
        const objects = gameState && Array.isArray(gameState.bossAttackObjects) ? gameState.bossAttackObjects : [];
        for (const obj of objects) {
            const data = obj && (obj.data || obj);
            const type = String(obj && (obj.objectType || data.Object_Type) || '').trim().toUpperCase();
            if (type === 'TERRAIN_COLLAPSE' || type === 'TERRAIN_COLLAPSE_HIT' || type === 'TERRAIN_BLOCK') {
                const rect = obj.safeArea || normalizeRect(data);
                if (rect) return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, rect };
            }
        }
        const db = gameState && gameState.DB_BOSS_PATTERN_OBJECT ? gameState.DB_BOSS_PATTERN_OBJECT : {};
        for (const key of Object.keys(db)) {
            const data = db[key];
            const patternName = String(data && data.Object_Name || '').trim();
            const type = String(data && data.Object_Type || '').trim().toUpperCase();
            if ((type === 'TERRAIN_COLLAPSE' || type === 'TERRAIN_COLLAPSE_HIT') && patternName.indexOf('페이즈2_기본패턴3') >= 0) {
                const rect = normalizeRect(data);
                if (rect) return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, rect };
            }
        }
        return { x: Math.max(80, Math.min(worldW - 80, 550)), y: Math.max(40, Math.min(worldD - 40, 200)), rect: { x: 0, y: 100, w: 1100, h: 200 } };
    },


    prepareBossJumpMoveToPlayer: function(m, action, gameState, options = {}) {
        const boss = m && m.boss ? m.boss : null;
        const p = gameState && gameState.player ? gameState.player : null;
        if (!boss || !p || !action) return null;

        const startX = Number.isFinite(parseFloat(m.x)) ? parseFloat(m.x) : 0;
        const startY = Number.isFinite(parseFloat(m.y)) ? parseFloat(m.y) : 0;
        const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
        const rawTargetX = parseFloat(p.x);
        const rawTargetY = parseFloat(p.y);
        let targetX = Number.isFinite(rawTargetX) ? rawTargetX : startX;
        let targetY = Number.isFinite(rawTargetY) ? rawTargetY : startY;

        const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        let targetZ = 0;
        if (moveDir === 'JUMP_TO_SAFE_AREA_CENTER') {
            const safe = this.resolveKasiyasP2Pattern3SafeAreaCenter ? this.resolveKasiyasP2Pattern3SafeAreaCenter(gameState) : null;
            if (safe) {
                targetX = safe.x;
                targetY = safe.y;
            } else {
                targetX = Math.max(80, Math.min(worldW - 80, worldW * 0.392));
                targetY = Math.max(40, Math.min(worldD - 40, worldD * 0.50));
            }
        } else if (typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(moveDir) && typeof this.getBossFixedMapPosition === 'function') {
            const fixed = this.getBossFixedMapPosition(gameState, moveDir);
            if (fixed) {
                targetX = Number.isFinite(parseFloat(fixed.x)) ? parseFloat(fixed.x) : targetX;
                targetY = Number.isFinite(parseFloat(fixed.y)) ? parseFloat(fixed.y) : targetY;
                targetZ = Number.isFinite(parseFloat(fixed.z)) ? parseFloat(fixed.z) : 0;
            }
        }
        const marginX = Math.max(70, ((m.d && parseFloat(m.d.bodyX)) || 80) * (parseFloat(m.scale) || 1) * 0.6);
        targetX = Math.max(marginX, Math.min(worldW - marginX, targetX));
        targetY = Math.max(16, Math.min(worldD - 16, targetY));

        const duration = Math.max(0.25, parseFloat(action.Action_Anim_Duration) || 0.75);
        const jumpHeight = Math.max(95, Math.min(190, Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2) * 0.22));
        boss.actionMove = {
            type: 'JUMP',
            startX,
            startY,
            startZ: Number.isFinite(parseFloat(m.z)) ? parseFloat(m.z) : 0,
            endX: targetX,
            endY: targetY,
            endZ: targetZ,
            duration,
            jumpHeight: Math.max(jumpHeight, targetZ > 0 ? targetZ * 0.45 : jumpHeight),
            actionId: String(action.Action_ID || '').trim()
        };
        const jumpFaceDir = Math.abs(targetX - startX) > 0.001 ? (targetX >= startX ? 1 : -1) : (m.faceDir === -1 ? -1 : 1);
        if (Math.abs(targetX - startX) > 0.001) m.faceDir = jumpFaceDir;

        if (this.isKasiyasP2Pattern3JumpWarningAction && this.isKasiyasP2Pattern3JumpWarningAction(action)) {
            boss.p2p3JumpSlashTarget = {
                bossX: targetX,
                bossY: targetY,
                bossZ: 0,
                faceDir: jumpFaceDir,
                warningActionId: String(action.Action_ID || '').trim(),
                patternId: String(action.Pattern_ID || '').trim()
            };
        }

        if (options.pushEffect !== false && action.VFX_Type && gameState && Array.isArray(gameState.effects)) {
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (parseFloat(m.scale) || 1);
            gameState.effects.push({
                type: 'kasiyasP2JumpTrail',
                renderType: action.VFX_Type,
                x: startX,
                y: startY,
                z: (parseFloat(m.z) || 0) + bodyZ * 0.50,
                targetX,
                targetY,
                dir: m.faceDir || 1,
                w: Math.max(180, Math.abs(targetX - startX) * 0.62),
                h: Math.max(100, bodyZ * 0.90),
                life: Math.min(duration, 0.45),
                maxLife: Math.min(duration, 0.45),
                color: 'rgba(255,58,42,0.74)',
                accentColor: 'rgba(22,0,0,0.86)'
            });
        }
        return boss.actionMove;
    },


    prepareBossDashMoveToPlayer: function(m, action, gameState, options = {}) {
        const boss = m && m.boss ? m.boss : null;
        const p = gameState && gameState.player ? gameState.player : null;
        if (!boss || !p || !action) return null;

        const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
        if (moveDir !== 'TO_PLAYER' && moveDir !== 'CHASE_ENEMY') return null;

        const dx = (parseFloat(p.x) || 0) - (parseFloat(m.x) || 0);
        const dy = (parseFloat(p.y) || 0) - (parseFloat(m.y) || 0);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const rawStopDistance = parseFloat(action.Action_Move_Stop_Distance);
        const stopDistance = !isNaN(rawStopDistance) && rawStopDistance > 0 ? rawStopDistance : 95;
        const ratio = Math.max(0, (dist - stopDistance) / dist);
        const target = {
            x: (parseFloat(m.x) || 0) + dx * ratio,
            y: (parseFloat(m.y) || 0) + dy * ratio
        };

        const endX = Math.max(0, Math.min(gameState.WORLD_WIDTH, target.x));
        const endY = Math.max(0, Math.min(gameState.WORLD_DEPTH, target.y));
        const moveDistance = Math.sqrt((endX - (parseFloat(m.x) || 0)) ** 2 + (endY - (parseFloat(m.y) || 0)) ** 2);
        const speed = this.getBossActionMoveSpeed(m, action, boss) || 1200;

        const rawDuration = parseFloat(action.Action_Anim_Duration);
        const speedDuration = Math.max(0.18, Math.min(0.85, moveDistance / Math.max(1, speed)));
        // 플레이어 위치로 돌진/추격하는 액션은 고정 이동 시간보다 속도 데이터가 우선되어야 한다.
        // Action_Anim_Duration은 모션의 기준 시간으로 남기되, 실제 도착 시간은 Move_Speed_Rate 기반으로 계산한다.
        const duration = speedDuration;

        boss.actionMove = {
            type: moveDir,
            startX: parseFloat(m.x) || 0,
            startY: parseFloat(m.y) || 0,
            endX: endX,
            endY: endY,
            duration: duration,
            lockUntilEnd: true,
            actionId: String(action.Action_ID || '').trim()
        };

        if (Math.abs(dx) > 0.001) m.faceDir = dx >= 0 ? 1 : -1;

        if (options.pushEffect !== false) {
            const renderType = action.VFX_Type || action.Effect_Render_Type;
            if (renderType) {
                gameState.effects.push({
                    type: 'afterimageDashTrail',
                    renderType: renderType,
                    x: m.x,
                    y: m.y,
                    z: m.z + ((m.d && m.d.bodyZ) || 160) * 0.42,
                    dir: m.faceDir,
                    w: Math.max(80, moveDistance * 0.45),
                    h: 48,
                    life: 0.20,
                    maxLife: 0.20,
                    pathAngle: Math.atan2(endY - (parseFloat(m.y) || 0), endX - (parseFloat(m.x) || 0))
                });
            }
        }

        return boss.actionMove;
    },


    startCalledBossObjectActionForPatternAction: function(m, action, gameState) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !action || !gameState) return false;
        const callId = String(action.Call_Object_Action_ID || action.Object_Action_ID || '').trim();
        if (!callId) return false;

        const callType = String(action.Call_Object_Action_Type || '').trim().toUpperCase() || 'START_AND_WAIT';
        let started = false;
        if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.startBossObjectActionById) {
            started = !!BossObjectSystem.startBossObjectActionById.call(this, m, action, gameState);
        }

        boss.syncedObjectActionDuration = 0;
        boss.syncedObjectActionType = callType;
        boss.syncedObjectActionId = callId;

        if (started && (callType === 'START_SYNC_WAIT' || callType === 'START_AND_WAIT')) {
            const callAction = gameState.DB_BOSS_PATTERN_OBJECT_ACTION ? gameState.DB_BOSS_PATTERN_OBJECT_ACTION[callId] : null;
            const objectId = String(action.Call_Object_ID || action.Object_ID || (callAction && (callAction.Object_ID || callAction.Attack_Object_ID)) || '').trim();
            const actor = objectId && typeof this.findActiveBossPatternActorByObjectId === 'function'
                ? this.findActiveBossPatternActorByObjectId(gameState, objectId)
                : null;
            if (actor && actor.action) {
                boss.syncedObjectActionDuration = Math.max(0.001, this.getBossObjectCurrentActionDuration(actor, actor.action));
            } else if (callAction) {
                boss.syncedObjectActionDuration = Math.max(0.001, parseFloat(callAction.Action_Anim_Duration) || 0.001);
            }
        }

        return started;
    },

    onBossPatternActionStart: function(m, action, gameState) {
        const boss = m.boss;
        if (!boss) return;

        // 새 액션 시작 시 이전 액션의 이동 정보가 남아 다음 액션 지속시간/시선에 섞이지 않도록 초기화한다.
        boss.actionMove = null;
        boss.actionMoveCompleted = false;
        boss.attackAfterMoveUntil = 0;
        boss.syncedObjectActionDuration = 0;
        boss.syncedObjectActionType = '';
        boss.syncedObjectActionId = '';

        const type = String(action.Action_Type || '').trim().toUpperCase();
        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        const pathSource = String(action.Hitbox_Path_Source || '').trim().toUpperCase();
        const vfxType = String(action.VFX_Type || action.Warning_Render_Type || action.Effect_Render_Type || '').trim().toUpperCase();
        const moveType = this.normalizeBossActionMoveType(action.Action_Move_Type);
        const activePatternSourceId = (typeof this.getBossPatternActionSourceId === 'function') ? this.getBossPatternActionSourceId(boss.activePattern) : String(boss.activePattern && boss.activePattern.Pattern_ID || '').trim();
        const isM3RandomRushAction = activePatternSourceId === '231008' && typeof this.isKasiyasMajorPattern3RandomRushAction === 'function' && this.isKasiyasMajorPattern3RandomRushAction(action);
        const actionName = String(action.Action_Name || '').trim();
        const actionId = String(action.Action_ID || '').trim();
        const defenceType = String(action.Action_Defence_Type || '').trim().toUpperCase();
        const isFrontDamageImmuneAction = defenceType === 'FRONT_DMG_IMMUNE' || defenceType === 'FRONT_DAMAGE_IMMUNE' || defenceType === 'FRONT_INVINCIBLE';
        // 전방 면역 기믹을 쓰는 액션에서만 시작 방향을 고정한다.
        // 2페이즈 기본 5번의 양날검 회전 전진은 260602_1837부터 SUPER_ARMOR + 피해 감소형으로 바뀌었으므로,
        // 플레이어 추적 중 faceDir이 자연스럽게 갱신되어야 한다.
        if (isFrontDamageImmuneAction) {
            boss.doubleEdgeSpinFaceDir = (m.faceDir === -1) ? -1 : 1;
            boss.doubleEdgeSpinActionId = actionId;
        } else {
            boss.doubleEdgeSpinFaceDir = null;
            boss.doubleEdgeSpinActionId = '';
        }
        const isM3VanishAction = activePatternSourceId === '231008' && (
            actionId === '241050' ||
            actionName.indexOf('본체 및 분신 사라짐') >= 0 ||
            actionName.indexOf('은신') >= 0
        );

        // 3페이즈 대형 패턴 2번: 데이터 기반 숨김/등장 연출 처리.
        // 특정 Action_ID에 의존하지 않고 Pattern_ID / Action_Pose_Type / Action_Move_Direction을 해석한다.
        if (activePatternSourceId === '233007' || String(action.Pattern_ID || '').trim() === '233007') {
            const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
            const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
            const centerX = worldW * 0.5;
            const centerY = worldD * 0.5;
            const poseType = String(action.Action_Pose_Type || '').trim().toUpperCase();
            const moveDirRaw = String(action.Action_Move_Direction || action.Action_Position_Placement_Type || '').trim().toUpperCase();
            const isSkyEnterAction = poseType === 'POSE_KASIYAS_P3_M2_JUMP_TO_SKY' || moveDirRaw === 'PLACE_MAP_SKY' || moveDirRaw === 'PLACE_P3_M2_SKY';
            const isAirborneHoldAction = poseType === 'POSE_KASIYAS_P3_M2_AIRBORNE_HOLD';
            const isReturnToGroundAction = boss.kasiyasP3M2Hidden && !isSkyEnterAction && !isAirborneHoldAction;
            const pushP3M2Effect = (kind, life, renderType) => {
                if (!Array.isArray(gameState.effects)) gameState.effects = [];
                const bodyX = ((m.d && m.d.bodyX) || 90) * (m.scale || 1);
                const bodyZ = ((m.d && m.d.bodyZ) || 170) * (m.scale || 1);
                gameState.effects.push({
                    type: kind,
                    renderType: renderType || (kind === 'p3M2KasiyasFall' ? 'EFT_KASIYAS_P3_M2_DESCEND_LANDING' : 'EFT_KASIYAS_P3_M2_ASCEND_HIDE'),
                    x: centerX,
                    y: centerY,
                    z: 0,
                    w: Math.max(120, bodyX * 1.55),
                    h: Math.max(210, bodyZ * 1.25),
                    d: Math.max(160, bodyX * 1.65),
                    life: life,
                    maxLife: life,
                    dir: m.faceDir === -1 ? -1 : 1
                });
            };

            // 실제 공중 좌표 이동은 하지 않는다. 데이터상 하늘 진입/체공 포즈를 만나면 중앙 고정 + 렌더 숨김만 적용한다.
            if (isSkyEnterAction || isAirborneHoldAction) {
                m.x = centerX;
                m.y = centerY;
                m.z = 0;
                if (!boss.kasiyasP3M2Hidden) {
                    boss.kasiyasP3M2Hidden = true;
                    boss.kasiyasP3M2HiddenStarted = true;
                    pushP3M2Effect('p3M2KasiyasRise', Math.max(0.28, Math.min(1.2, this.getBossActionDuration ? this.getBossActionDuration(m, action, gameState) : 0.85)), action.VFX_Type || 'EFT_KASIYAS_P3_M2_ASCEND_HIDE');
                    this.pushBossDebugLog && this.pushBossDebugLog(gameState, 'P3_M2', `${actionId} ${this.getBossDebugName ? this.getBossDebugName(action) : actionName}`, '데이터 기반 카시야스 숨김 시작');
                }
            } else if (isReturnToGroundAction) {
                m.x = centerX;
                m.y = centerY;
                m.z = 0;
                boss.kasiyasP3M2Hidden = false;
                boss.kasiyasP3M2LandingActionId = actionId;
                pushP3M2Effect('p3M2KasiyasFall', Math.max(0.28, Math.min(1.2, this.getBossActionDuration ? this.getBossActionDuration(m, action, gameState) : 0.9)), action.VFX_Type || 'EFT_KASIYAS_P3_M2_DESCEND_LANDING');
                this.pushBossDebugLog && this.pushBossDebugLog(gameState, 'P3_M2', `${actionId} ${this.getBossDebugName ? this.getBossDebugName(action) : actionName}`, '데이터 기반 카시야스 표시 복귀/하강');
            }

            // MOVE_JUMP + PLACE_MAP_SKY는 실제 위치 이동이 아니라 시각 연출로만 사용한다.
            if (isSkyEnterAction && type === 'MOVE') {
                boss.actionMove = null;
                boss.actionMoveCompleted = true;
                boss.actionHitFired = true;
                return;
            }
        }


        if (type === 'HIDE') {
            boss.kasiyasP2M2Hidden = true;
            boss.kasiyasP1M3RushHidden = true;
            const duration = this.getBossActionDuration(m, action, gameState);
            const bodyX = ((m.d && m.d.bodyX) || 80) * (m.scale || 1);
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            if (Array.isArray(gameState.effects)) {
                gameState.effects.push({
                    type: 'afterimageDisappear',
                    renderType: action.VFX_Type || 'EFT_KASIYAS_P2_HIDE',
                    x: m.x,
                    y: m.y,
                    z: (m.z || 0) + bodyZ * 0.56,
                    w: bodyX * 1.75,
                    h: bodyZ * 0.98,
                    life: Math.max(0.12, Math.min(0.65, duration || 0.35)),
                    maxLife: Math.max(0.12, Math.min(0.65, duration || 0.35)),
                    color: 'rgba(255,70,120,0.92)',
                    accentColor: 'rgba(78,0,96,0.82)'
                });
            }
            this.pushBossDebugLog && this.pushBossDebugLog(gameState, 'HIDE', `${String(action.Action_ID || '').trim()} ${this.getBossDebugName(action)}`, '카시야스 차원 은신');
            return;
        }

        // 2페이즈 대형 패턴 2번 최종 포탈 구간.
        // HIDE 포즈와 WARP 이동은 별도 실루엣 없이 위치만 바꾸며, 포탈 열림 액션에서만 포탈 내부 실루엣을 연출한다.
        const p2m2Pose = String(action.Action_Pose_Type || '').trim().toUpperCase();
        const p2m2Vfx = String(action.VFX_Type || action.Effect_Render_Type || '').trim().toUpperCase();
        if (p2m2Pose === 'POSE_KASIYAS_P2_HIDE') {
            boss.kasiyasP2M2Hidden = true;
            boss.kasiyasP1M3RushHidden = true;
        }
        if (p2m2Pose === 'POSE_KASIYAS_P2_M2_AIR_SPIN_SLASH') {
            boss.kasiyasP2M2Hidden = false;
            boss.kasiyasP1M3RushHidden = false;
        }
        if (moveType === 'WARP') {
            const target = typeof this.getBossFixedMapPosition === 'function' ? this.getBossFixedMapPosition(gameState, action.Action_Move_Direction || action.Action_Position_Group || 'PLACE_MAP_CENTER') : null;
            if (target) {
                m.x = Math.max(0, Math.min(Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400), parseFloat(target.x) || m.x));
                m.y = Math.max(0, Math.min(Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400), parseFloat(target.y) || m.y));
                m.z = Math.max(0, parseFloat(target.z) || 0);
                const centerX = (parseFloat(gameState.WORLD_WIDTH) || 1400) / 2;
                m.faceDir = centerX >= m.x ? 1 : -1;
                boss.actionMove = { type: 'WARP', startX: m.x, startY: m.y, endX: m.x, endY: m.y, startZ: m.z, endZ: m.z, duration: this.getBossActionDuration(m, action, gameState) };
            }
            boss.actionHitFired = true;
            return;
        }


        if (type === 'REMOVE_ALL_OBJECT' || type === 'CLEAR_PATTERN_TERRAIN_OBJECTS') {
            const clearPatternId = String(action.Pattern_ID || (boss.activePattern && boss.activePattern.Pattern_ID) || '').trim();
            if (clearPatternId === '232003' && typeof this.clearKasiyasP2Pattern3Runtime === 'function') {
                this.clearKasiyasP2Pattern3Runtime(gameState, { clearAllHitboxes: true });
            } else if (typeof this.clearBossPatternTerrainObjects === 'function') {
                this.clearBossPatternTerrainObjects(gameState, { patternId: clearPatternId });
            } else if (gameState && Array.isArray(gameState.bossAttackObjects)) {
                gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => {
                    const objectType = String(obj && obj.data && obj.data.Object_Type || '').trim().toUpperCase();
                    return !objectType.startsWith('TERRAIN_');
                });
            }
            boss.actionHitFired = true;
            boss.actionHitsDone = Math.max(1, parseInt(action.ATK_Hit_Count) || 1);
            boss.actionCycleTimer = 0;
            return;
        }

        // Spawn_Object_ID / Spawn_Object_Group은 CAST 전용이 아니라 모든 패턴 액션에서 사용할 수 있다.
        // 단, RUSH 액션의 ACTION_START 잔류 검격은 돌진 경로가 먼저 확정된 뒤 생성해야 한다.
        // 먼저 생성하면 currentDashPath가 이전 경로/빈 경로를 참조해 잔류 검격이 엉뚱한 위치에 깔린다.
        const actionSpawnTiming = String(action.Object_Spawn_Timing || 'ACTION_START').trim().toUpperCase();
        const hasActionStartSpawnObject = !!(String(action.Spawn_Object_ID || '').trim() || String(action.Spawn_Object_Group || '').trim());
        const shouldDeferRushActionStartSpawn = moveType === 'RUSH' && hasActionStartSpawnObject && actionSpawnTiming === 'ACTION_START';
        const genericActionStartSpawned = shouldDeferRushActionStartSpawn
            ? false
            : this.trySpawnBossPatternActionObjectsAtTiming(m, action, gameState, 'ACTION_START');

        if (String(action.Action_Condition_Type || '').trim().toUpperCase() === 'P3_M2_SPACE_DISTORTION_REMAIN') {
            const burstKey = String(action.Action_ID || '') + ':' + String(boss.currentLoopIndex || 0);
            if (boss.p3M2FailBurstKey !== burstKey) {
                boss.p3M2FailBurstKey = burstKey;
                if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.forceBurstAllKasiyasP3SpaceDistortions) {
                    BossObjectSystem.forceBurstAllKasiyasP3SpaceDistortions.call(this, gameState, m);
                }
            }
        }

        if ((type === 'WARNING' || type === 'MOVE') && moveType === 'JUMP') {
            this.prepareBossJumpMoveToPlayer(m, action, gameState, { pushEffect: true });
            if (this.isKasiyasP2Pattern3JumpWarningAction && this.isKasiyasP2Pattern3JumpWarningAction(action)) {
                const atk = this.getBossPatternNextAttackAction ? this.getBossPatternNextAttackAction(m) : null;
                if (atk && Array.isArray(gameState.effects)) {
                    const hitbox = this.getBossPatternActionHitbox(m, atk);
                    const player = gameState.player || {};
                    const pW = Math.max(0, (parseFloat(player.bodyX) || 0) * (parseFloat(player.scale) || 1));
                    const pD = Math.max(0, (parseFloat(player.bodyY) || 0) * (parseFloat(player.scale) || 1));
                    const duration = this.getBossActionDuration(m, action, gameState);
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
                        hitboxType: String(atk.Hitbox_Type || 'HITBOX_BOX').trim().toUpperCase(),
                        displayExpandedByPlayerBody: true,
                        life: Math.max(0.05, duration),
                        maxLife: Math.max(0.05, duration)
                    });
                }
            }
        }

        if (isM3VanishAction && typeof this.setKasiyasMajorPattern3RushActorsHidden === 'function') {
            this.setKasiyasMajorPattern3RushActorsHidden(m, gameState, true);
            if (typeof this.updateKasiyasOniMarkPulse === 'function') this.updateKasiyasOniMarkPulse(gameState, false);
            const duration = this.getBossActionDuration(m, action, gameState);
            const bodyX = ((m.d && m.d.bodyX) || 80) * (m.scale || 1);
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            gameState.effects.push({
                type: 'afterimageDisappear',
                renderType: action.Effect_Render_Type || 'EFT_KASIYAS_P1_M3_VANISH',
                x: m.x,
                y: m.y,
                z: m.z + bodyZ * 0.55,
                w: bodyX * 1.65,
                h: bodyZ * 0.95,
                life: Math.max(0.12, Math.min(0.5, duration || 0.35)),
                maxLife: Math.max(0.12, Math.min(0.5, duration || 0.35))
            });
        } else if (activePatternSourceId === '231008' && !isM3RandomRushAction && typeof this.setKasiyasMajorPattern3RushActorsHidden === 'function') {
            // 랜덤 측면 돌진 구간 이외의 이동/교차 발도/분신 소멸 구간에서는
            // 이전 랜덤 돌진에서 남은 숨김 상태를 반드시 해제한다.
            this.setKasiyasMajorPattern3RushActorsHidden(m, gameState, false);
        }

        this.applyBossActionGaze(m, action, gameState);
        this.startBossPatternDialogue(m, action, gameState);

        if (type === 'WAIT' && (vfxType === 'EFT_KASIYAS_P2_CHARGE_ENERGY' || vfxType === 'EFT_KASIYAS_P2_GROUND_PUNCH_CHARGE' || vfxType === 'EFT_KASIYAS_P2_DOUBLE_EDGED_SWORD_STANCE' || vfxType === 'EFT_KASIYAS_P2_ONI_STANCE_ENERGY_CHARGE' || vfxType === 'EFT_KASIYAS_P2_ONI_STANCE_FULL_ENERGY' || vfxType === 'EFT_KASIYAS_P2_DOUBLE_SWORD_ANOTHER_ENERGY' || vfxType === 'EFT_KASIYAS_P2_M1_X_SLASH_CHARGE' || vfxType === 'EFT_KASIYAS_P2_M2_WAIT_IN_DIMENSION_PORTAL' || vfxType === 'EFT_KASIYAS_P3_RUSH_SLASH_CHARGE' || vfxType === 'EFT_KASIYAS_P3_M1_FINAL_SLASH_CHARGE' || vfxType === 'EFT_KASIYAS_P3_M2_HAND_TO_SKY' || vfxType === 'EFT_KASIYAS_P3_M2_FINAL_SLASH_CHARGE') && typeof this.pushBossCastEffect === 'function') {
            this.pushBossCastEffect(m, action, gameState);
            if (vfxType === 'EFT_KASIYAS_P2_ONI_STANCE_FULL_ENERGY') {
                const nextAtk = (typeof this.getBossPatternNextAttackAction === 'function') ? this.getBossPatternNextAttackAction(m) : null;
                const nextMoveType = String(nextAtk && (nextAtk.Action_Move_Type || nextAtk.Move_Type) || '').trim().toUpperCase();
                if (nextAtk && nextMoveType === 'MOVE_RUSH') {
                    boss.previewDashPath = (typeof this.computeSafeDashPathForActionDirection === 'function')
                        ? this.computeSafeDashPathForActionDirection(m, nextAtk, gameState, { minLength: 90 })
                        : this.computeDashPathForActionDirection(m, nextAtk, gameState);
                    if (boss.previewDashPath) {
                        const width = 28;
                        const duration = this.getBossActionDuration(m, action, gameState);
                        this.pushPathWarningEffect(boss.previewDashPath, width, duration, 'EFT_WARNING_RUSH_LINE', gameState);
                    }
                }
            }
            boss.actionHitFired = true;
        }

        if (type === 'MOVE_GROUP') {
            this.prepareBossGroupSlotShuffle(m, action, gameState);
            return;
        }

        if (type === 'CALL_OBJECT_ACTION') {
            if (isM3RandomRushAction && typeof this.setKasiyasMajorPattern3RushActorsHidden === 'function') {
                this.setKasiyasMajorPattern3RushActorsHidden(m, gameState, true);
            }
            if (typeof this.updateKasiyasOniMarkPulse === 'function') this.updateKasiyasOniMarkPulse(gameState, false);
            this.startCalledBossObjectActionForPatternAction(m, action, gameState);
            boss.actionHitFired = true;
            return;
        }

        // MOVE/WARNING/ATK 액션에 Call_Object_Action_ID가 있으면 본체 액션과 분신 오브젝트 액션을 동기 실행한다.
        // 교차 발도처럼 본체/분신이 동시에 이동·전조·공격해야 하는 구간에 사용한다.
        if (String(action.Call_Object_Action_ID || '').trim()) {
            this.startCalledBossObjectActionForPatternAction(m, action, gameState);
        }

        if (activePatternSourceId === '231008' && type === 'WARNING' && String(action.Random_Action_Group || '').includes('BOSS_RUSH')) {
            if (typeof this.updateKasiyasOniMarkPulse === 'function') this.updateKasiyasOniMarkPulse(gameState, true);
        } else if (activePatternSourceId === '231008' && type !== 'WARNING') {
            if (typeof this.updateKasiyasOniMarkPulse === 'function') this.updateKasiyasOniMarkPulse(gameState, false);
        }

        // RUSH 계열은 공격 시작 시점에 전조에서 확정한 경로를 먼저 가져온다.
        // 이전에는 일반 공격 이펙트를 먼저 띄운 뒤 경로를 확정해서,
        // 전조선과 실제 돌진/참격 이펙트 방향이 어긋나 보일 수 있었다.
        if (moveType === 'RUSH') {
            const moveDir = String(action.Action_Move_Direction || action.Move_Direction || '').trim().toUpperCase();
            const normalizedMoveDir = (typeof this.normalizeBossFixedMapPlaceType === 'function') ? this.normalizeBossFixedMapPlaceType(moveDir) : moveDir;
            let path = boss.previewDashPath || null;
            if (isM3RandomRushAction) {
                // 전조에서 Random_Action_Group별로 확정해 둔 경로만 사용한다.
                // 여기서 새 랜덤 경로를 다시 뽑으면 전조선/화살표와 실제 돌진이 어긋난다.
                path = (typeof this.getKasiyasMajorPattern3RushSlotPath === 'function')
                    ? (this.getKasiyasMajorPattern3RushSlotPath(m, action, 'BOSS') || path)
                    : path;
                const invalidSidePath = !path || !path.randomSideRush || (parseFloat(path.length) || 0) < 90;
                if (invalidSidePath && typeof this.ensureKasiyasMajorPattern3RushSlotPath === 'function') {
                    path = this.ensureKasiyasMajorPattern3RushSlotPath(m, action, gameState, 'BOSS') || path;
                }
            } else {
                const pathTarget = String(path && path.targetPlaceType || '').trim().toUpperCase();
                const needFixedTarget = typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(normalizedMoveDir);
                const invalidPath = !path || (parseFloat(path.length) || 0) < 8 || (needFixedTarget && pathTarget && pathTarget !== normalizedMoveDir);
                if (invalidPath) path = (typeof this.computeSafeDashPathForActionDirection === 'function') ? this.computeSafeDashPathForActionDirection(m, action, gameState, { minLength: 90 }) : this.computeDashPathForActionDirection(m, action, gameState);
            }
            boss.currentDashPath = path;
            boss.lastDashPath = path;
            boss.previewDashPath = null;
            if (boss.currentDashPath) {
                m.x = Number.isFinite(parseFloat(boss.currentDashPath.startX)) ? parseFloat(boss.currentDashPath.startX) : m.x;
                m.y = Number.isFinite(parseFloat(boss.currentDashPath.startY)) ? parseFloat(boss.currentDashPath.startY) : m.y;
                m.faceDir = (parseFloat(boss.currentDashPath.dirX) || 0) >= 0 ? 1 : -1;
                const rushVfx = String(action.VFX_Type || action.Effect_Render_Type || '').trim().toUpperCase();
                if (rushVfx === 'EFT_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH' && Array.isArray(gameState.effects)) {
                    const pathForFx = boss.currentDashPath;
                    const sx = Number.isFinite(parseFloat(pathForFx.startX)) ? parseFloat(pathForFx.startX) : m.x;
                    const sy = Number.isFinite(parseFloat(pathForFx.startY)) ? parseFloat(pathForFx.startY) : m.y;
                    const ex = Number.isFinite(parseFloat(pathForFx.endX)) ? parseFloat(pathForFx.endX) : sx;
                    const ey = Number.isFinite(parseFloat(pathForFx.endY)) ? parseFloat(pathForFx.endY) : sy;
                    const midX = (sx + ex) * 0.5;
                    const midY = (sy + ey) * 0.5;
                    const dist = Math.max(1, Math.hypot(ex - sx, ey - sy));
                    const bodyZ = ((m.d && m.d.bodyZ) || 170) * (m.scale || 1);
                    gameState.effects.push({
                        type: 'p3HighSpeedRushTrail',
                        renderType: 'EFT_KASIYAS_P3_HIGH_SPEED_RUSH_TRAIL',
                        x: midX,
                        y: midY,
                        z: Math.max(50, (parseFloat(m.z) || 0) + bodyZ * 0.46),
                        startX: sx,
                        startY: sy,
                        endX: ex,
                        endY: ey,
                        dir: ex >= sx ? 1 : -1,
                        w: Math.max(220, dist),
                        d: Math.max(150, parseFloat(action.Hitbox_Size_Y) || 170),
                        h: Math.max(130, bodyZ * 0.78),
                        life: 0.42,
                        maxLife: 0.42,
                        color: 'rgba(154,76,255,0.42)',
                        accentColor: 'rgba(14,0,36,0.88)',
                        hotColor: 'rgba(226,210,255,0.60)'
                    });
                }
            }
            if (isM3RandomRushAction && boss) boss.kasiyasP1M3RushHidden = false;

            // 돌진 경로가 확정된 뒤에 ACTION_START 오브젝트를 생성한다.
            // 1페이즈 기본2와 2페이즈 기본4의 잔류 검격은 이 시점의 currentDashPath를 복사해 사용한다.
            if (shouldDeferRushActionStartSpawn) {
                this.trySpawnBossPatternActionObjectsAtTiming(m, action, gameState, 'ACTION_START');
            }

            // 대형 패턴 3번 돌진은 경로 전체에 공격 이펙트를 미리 깔지 않는다.
            // 실제 이동 중인 카시야스의 몸/검에 부착형 이펙트를 계속 붙여서,
            // '돌진하는 본체가 공격'이라는 인상이 나도록 처리한다.
            m.kasiyasRushBodyVfxTimer = -999;
        }

        if (type === 'ATK') {
            // RUSH 공격은 위에서 path 기반 이펙트를 사용한다.
            // 일반 위치 기준 cue/박스형 공격 범위 경고를 중복 출력하면 잔류 검격 시퀀스와 전조가 꼬여 보일 수 있으므로 제외한다.
            if (moveType !== 'RUSH') {
                this.pushBossActionCueEffect(m, action, gameState);
                this.pushBossActiveAttackRangeWarning(m, action, gameState);
            }
        }

        if (type === 'MOVE' && moveType === 'WARP') {
            const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
            const normalizedPlace = this.normalizeBossFixedMapPlaceType ? this.normalizeBossFixedMapPlaceType(moveDir) : moveDir;
            if (typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(normalizedPlace)) {
                const target = this.getBossFixedMapPosition(gameState, normalizedPlace);
                const bodyX = ((m.d && m.d.bodyX) || 80) * (m.scale || 1);
                const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
                const startX = Number.isFinite(parseFloat(m.x)) ? parseFloat(m.x) : 0;
                const startY = Number.isFinite(parseFloat(m.y)) ? parseFloat(m.y) : 0;
                if (typeof this.pushBossNoiseTeleportEffect === 'function') {
                    this.pushBossNoiseTeleportEffect(gameState, m.x, m.y, m.z + bodyZ * 0.48, bodyX * 1.45, bodyZ * 0.78, action.VFX_Type || action.Effect_Render_Type || 'EFT_KASIYAS_P2_WARP', 'VANISH');
                }
                const upperWarpVfx = String(action.VFX_Type || action.Effect_Render_Type || '').trim().toUpperCase();
                if (upperWarpVfx === 'EFT_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH' && Array.isArray(gameState.effects)) {
                    const midX = (startX + target.x) * 0.5;
                    const midY = (startY + target.y) * 0.5;
                    const dist = Math.max(1, Math.hypot(target.x - startX, target.y - startY));
                    gameState.effects.push({
                        type: 'p3HighSpeedRushTrail',
                        renderType: 'EFT_KASIYAS_P3_HIGH_SPEED_RUSH_TRAIL',
                        x: midX,
                        y: midY,
                        z: Math.max(52, (parseFloat(m.z) || 0) + bodyZ * 0.46),
                        startX,
                        startY,
                        endX: target.x,
                        endY: target.y,
                        dir: target.x >= startX ? 1 : -1,
                        w: Math.max(220, dist),
                        d: 170,
                        h: Math.max(140, bodyZ * 0.82),
                        life: 0.48,
                        maxLife: 0.48
                    });
                }
                m.x = target.x;
                m.y = target.y;
                m.z = 0;
                if (typeof this.pushBossNoiseTeleportEffect === 'function') {
                    this.pushBossNoiseTeleportEffect(gameState, m.x, m.y, m.z + bodyZ * 0.48, bodyX * 1.45, bodyZ * 0.78, action.VFX_Type || action.Effect_Render_Type || 'EFT_KASIYAS_P2_WARP', 'APPEAR');
                }
                const nextAtk = (typeof this.getBossPatternNextAttackAction === 'function') ? this.getBossPatternNextAttackAction(m) : null;
                const nextMoveType = this.normalizeBossActionMoveType ? this.normalizeBossActionMoveType(nextAtk && (nextAtk.Action_Move_Type || nextAtk.Move_Type)) : String(nextAtk && (nextAtk.Action_Move_Type || nextAtk.Move_Type) || '').trim().toUpperCase();
                if (nextAtk && nextMoveType === 'RUSH') {
                    boss.previewDashPath = (typeof this.computeSafeDashPathForActionDirection === 'function')
                        ? this.computeSafeDashPathForActionDirection(m, nextAtk, gameState, { minLength: 90 })
                        : this.computeDashPathForActionDirection(m, nextAtk, gameState);
                    if (boss.previewDashPath) {
                        const duration = this.getBossActionDuration(m, action, gameState);
                        this.pushPathWarningEffect(boss.previewDashPath, 28, duration, 'EFT_WARNING_RUSH_LINE', gameState);
                        m.faceDir = (parseFloat(boss.previewDashPath.dirX) || 0) >= 0 ? 1 : -1;
                    }
                } else {
                    m.faceDir = target.x >= startX ? 1 : -1;
                }
                boss.actionMove = null;
                boss.actionHitFired = true;
                return;
            }
        }

        // ATK 액션에 이동값이 함께 들어간 경우에는 이동을 먼저 수행하고,
        // 이동 완료 후 현재 위치 기준으로 공격 판정을 열어준다.
        // 예: 3페이즈 대형1 3차 검격_전진 원형 베기(MOVE_DASH + PLACE_MAP_CENTER).
        if (type === 'ATK' && moveType === 'DASH') {
            const moveDirRaw = String(action.Action_Move_Direction || '').trim().toUpperCase();
            const moveDir = typeof this.normalizeBossFixedMapPlaceType === 'function' ? this.normalizeBossFixedMapPlaceType(moveDirRaw) : moveDirRaw;
            if (typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(moveDir)) {
                const target = this.getBossFixedMapPosition(gameState, moveDir);
                const distance = Math.sqrt((target.x - m.x) ** 2 + (target.y - m.y) ** 2);
                const speed = this.getBossActionMoveSpeed(m, action, boss) || 1000;
                const actionDuration = Math.max(0.05, this.getBossActionDuration(m, action, gameState));
                const hitStartRaw = parseFloat(action.Hitbox_Start_Time);
                const moveDuration = (!isNaN(hitStartRaw) && hitStartRaw > 0)
                    ? Math.min(actionDuration * 0.85, Math.max(0.05, hitStartRaw))
                    : Math.min(actionDuration * 0.55, Math.max(0.12, distance / Math.max(1, speed)));
                boss.actionMove = {
                    type: 'ATK_DASH_FIXED',
                    sourceMoveType: moveType,
                    targetPlace: moveDir,
                    actionId: String(action.Action_ID || '').trim(),
                    startX: m.x,
                    startY: m.y,
                    endX: target.x,
                    endY: target.y,
                    duration: Math.max(0.05, moveDuration),
                    attackAfterMove: true,
                    faceAfterMove: (String(action.Action_Boss_Gaze || '').trim().toUpperCase() === 'LOOKING_MAP_CENTER' && typeof this.getBossFixedMapPosition === 'function')
                        ? ((this.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER').x >= target.x) ? 1 : -1)
                        : null
                };
                boss.actionMoveCompleted = false;
                boss.attackAfterMoveUntil = Math.max(0.05, moveDuration);
                m.faceDir = target.x >= m.x ? 1 : -1;
                if (Array.isArray(gameState.effects) && (action.VFX_Type || action.Effect_Render_Type)) {
                    gameState.effects.push({
                        type: 'afterimageDashTrail',
                        renderType: action.VFX_Type || action.Effect_Render_Type,
                        x: m.x,
                        y: m.y,
                        z: m.z + ((m.d && m.d.bodyZ) || 160) * 0.42,
                        dir: m.faceDir,
                        w: Math.max(90, distance * 0.42),
                        h: 54,
                        life: Math.min(0.32, Math.max(0.16, moveDuration)),
                        maxLife: Math.min(0.32, Math.max(0.16, moveDuration)),
                        pathAngle: Math.atan2(target.y - m.y, target.x - m.x),
                        p3RushTrail: true
                    });
                }
            }
        }

        if (type === 'MOVE' && moveType === 'DASH') {
            const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
            if (typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(moveDir)) {
                const target = this.getBossFixedMapPosition(gameState, this.normalizeBossFixedMapPlaceType ? this.normalizeBossFixedMapPlaceType(moveDir) : moveDir);
                const distance = Math.sqrt((target.x - m.x) ** 2 + (target.y - m.y) ** 2);
                const speed = this.getBossActionMoveSpeed(m, action, boss) || 1000;
                const explicitDuration = parseFloat(action.Action_Anim_Duration);
                boss.actionMove = {
                    type: moveDir,
                    startX: m.x,
                    startY: m.y,
                    endX: target.x,
                    endY: target.y,
                    duration: (!isNaN(explicitDuration) && explicitDuration > 0) ? Math.max(0.05, explicitDuration) : Math.max(0.15, distance / Math.max(1, speed))
                };
                m.faceDir = target.x >= m.x ? 1 : -1;
                if (action.VFX_Type || action.Effect_Render_Type) {
                    gameState.effects.push({
                        type: 'afterimageDashTrail',
                        renderType: action.VFX_Type || action.Effect_Render_Type,
                        x: m.x,
                        y: m.y,
                        z: m.z + ((m.d && m.d.bodyZ) || 160) * 0.42,
                        dir: m.faceDir,
                        w: Math.max(80, distance * 0.40),
                        h: 48,
                        life: 0.20,
                        maxLife: 0.20,
                        pathAngle: Math.atan2(target.y - m.y, target.x - m.x)
                    });
                }
                return;
            }

            if (moveDir === 'PLACE_MAJOR_2_RANDOM' || moveDir === 'EAST_WEST_RANDOM' || moveDir === 'PLACE_MAP_EAST_WEST_RANDOM') {
                const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 2000);
                const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 300);
                const marginX = Math.max(130, worldW * 0.085);
                const side = Math.random() < 0.5 ? 'WEST' : 'EAST';
                const target = {
                    x: side === 'EAST' ? worldW - marginX : marginX,
                    y: worldD / 2,
                    slotKey: side
                };
                boss.majorPattern2Runtime = boss.majorPattern2Runtime || { objectGroupSelections: {} };
                boss.majorPattern2Runtime.sideSlot = side;

                const distance = Math.sqrt((target.x - m.x) ** 2 + (target.y - m.y) ** 2);
                const speed = this.getBossActionMoveSpeed(m, action, boss) || 1000;
                const explicitDuration = parseFloat(action.Action_Anim_Duration);
                boss.actionMove = {
                    type: moveDir,
                    slotKey: side,
                    startX: m.x,
                    startY: m.y,
                    endX: target.x,
                    endY: target.y,
                    duration: (!isNaN(explicitDuration) && explicitDuration > 0)
                        ? Math.max(0.05, explicitDuration)
                        : Math.max(0.15, distance / Math.max(1, speed))
                };
                m.faceDir = target.x >= m.x ? 1 : -1;
                return;
            }

            if (moveDir === 'RANDOM_DIAGONAL_CORNER' || moveDir === 'NEXT_DIAGONAL_CORNER_PAIR') {
                const corners = this.getBossDiagonalCornerPositions(gameState, m);
                let cornerKey;

                if (moveDir === 'NEXT_DIAGONAL_CORNER_PAIR') {
                    if (!boss.pattern4Runtime && (boss.currentDiagonalCorner || boss.lastDiagonalCorner)) {
                        this.preparePattern4DiagonalRuntime(boss, boss.currentDiagonalCorner || boss.lastDiagonalCorner);
                    }
                    cornerKey = boss.nextDiagonalOwnerCorner || (boss.pattern4Runtime && boss.pattern4Runtime.secondOwnerCorner) || this.pickBossRandomDiagonalCornerKey();
                } else {
                    cornerKey = this.pickBossRandomDiagonalCornerKey();
                    const patternId = String(boss.activePattern && boss.activePattern.Pattern_ID || '').trim();
                    if (patternId === '231004') {
                        this.preparePattern4DiagonalRuntime(boss, cornerKey);
                    }
                }

                const target = corners[cornerKey] || { x: m.x, y: m.y };
                const distance = Math.sqrt((target.x - m.x) ** 2 + (target.y - m.y) ** 2);
                const speed = this.getBossActionMoveSpeed(m, action, boss) || 1000;
                boss.currentDiagonalCorner = cornerKey;
                boss.lastDiagonalCorner = cornerKey;
                const explicitDuration = parseFloat(action.Action_Anim_Duration);
                boss.actionMove = {
                    type: moveDir,
                    cornerKey: cornerKey,
                    startX: m.x,
                    startY: m.y,
                    endX: target.x,
                    endY: target.y,
                    // 대각 코너 이동은 X/Y 거리 차이와 관계없이 데이터의 액션 시간을 우선 따른다.
                    // 이렇게 해야 본체와 분신이 전반/후반 모두 같은 타이밍으로 전조와 횡베기에 들어간다.
                    duration: (!isNaN(explicitDuration) && explicitDuration > 0)
                        ? Math.max(0.05, explicitDuration)
                        : Math.max(0.15, distance / Math.max(1, speed))
                };
                m.faceDir = target.x >= m.x ? 1 : -1;
                // PLACE_MAP_CENTER 이동은 단순 위치 이동이다.
                // 여기서 이동 잔상/참격 느낌의 이펙트를 띄우면 대형 패턴 개시가 공격처럼 보이므로 출력하지 않는다.
                // 공격 판정도 이 액션에서는 생성하지 않는다.
                return;
            }

            if (moveDir === 'TO_PLAYER' || moveDir === 'CHASE_ENEMY') {
                this.prepareBossDashMoveToPlayer(m, action, gameState, { pushEffect: true });
                return;
            }
        }

        // 돌진 전조는 두꺼운 공격범위가 아니라 얇은 궤도 예고선으로 그릴 수 있게 path만 사용한다.
        if (
            type === 'WARNING_PATH' ||
            (type === 'WARNING' && pathSource === 'PREVIEW_DASH_PATH') ||
            (type === 'WARNING' && vfxType === 'EFT_WARNING_RUSH_LINE')
        ) {
            const nextAtk = (typeof this.getBossPatternNextAttackAction === 'function') ? this.getBossPatternNextAttackAction(m) : null;
            if (isM3RandomRushAction && typeof this.setKasiyasMajorPattern3RushActorsHidden === 'function') {
                this.setKasiyasMajorPattern3RushActorsHidden(m, gameState, true);
            }
            boss.previewDashPath = (isM3RandomRushAction && typeof this.ensureKasiyasMajorPattern3RushSlotPath === 'function')
                ? this.ensureKasiyasMajorPattern3RushSlotPath(m, action, gameState, 'BOSS')
                : ((typeof this.computeSafeDashPathForActionDirection === 'function') ? this.computeSafeDashPathForActionDirection(m, nextAtk || action, gameState, { minLength: 90 }) : this.computeDashPathForActionDirection(m, nextAtk || action, gameState));
            const width = parseFloat(action.Hitbox_Size_Y) || (vfxType === 'EFT_WARNING_RUSH_LINE' ? 24 : 110);
            const duration = this.getBossActionDuration(m, action, gameState);
            this.pushPathWarningEffect(boss.previewDashPath, width, duration, action.VFX_Type || action.Warning_Render_Type || 'EFT_WARNING_RUSH_PATH', gameState);
            boss.actionHitFired = true;
            return;
        }

        if (type === 'WARNING' && (String(action.Warning_Render_Type || '').trim().toUpperCase() === 'WARNING_HITBOX' || vfxType === 'EFT_WARNING_HITBOX')) {
            const atk = this.getBossPatternNextAttackAction(m);
            if (atk) {
                const hitbox = this.getBossPatternActionHitbox(m, atk);
                const player = gameState.player || {};
                const pW = Math.max(0, (parseFloat(player.bodyX) || 0) * (parseFloat(player.scale) || 1));
                const pD = Math.max(0, (parseFloat(player.bodyY) || 0) * (parseFloat(player.scale) || 1));
                const duration = this.getBossActionDuration(m, action, gameState);
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
            boss.actionHitFired = true;
            return;
        }

        // 일반 오브젝트 생성 액션. ACTION_END면 캐스팅 모션이 끝나는 시점에 생성한다.
        if (type === 'SPAWN_ATTACK_OBJECT' || type === 'SPAWN_OBJECT' || type === 'CAST_SPAWN_OBJECT') {
            const spawnTiming = String(action.Object_Spawn_Timing || 'ACTION_START').trim().toUpperCase();
            if (type === 'CAST_SPAWN_OBJECT' && action.VFX_Type) {
                this.pushBossCastEffect(m, action, gameState);
            }

            if (spawnTiming === 'ACTION_END') {
                return;
            }

            if (!genericActionStartSpawned) {
                this.trySpawnBossPatternActionObjectsAtTiming(m, action, gameState, 'ACTION_START');
            }
            return;
        }
    },


    updateBossPatternActionMovement: function(m, action, deltaTime, gameState) {
        const moveType = this.normalizeBossActionMoveType(action.Action_Move_Type);
        const actionType = String(action.Action_Type || '').trim().toUpperCase();
        if (moveType !== 'WALK' && moveType !== 'RUSH' && moveType !== 'DASH' && moveType !== 'JUMP' && moveType !== 'MOVE_SHOULDER_ATK' && moveType !== 'NOISE' && actionType !== 'MOVE_GROUP') return;

        if (moveType === 'RUSH') {
            const boss = m.boss;
            let path = boss && boss.currentDashPath ? boss.currentDashPath : null;
            const isM3RandomRushAction = boss && typeof this.isKasiyasMajorPattern3RandomRushAction === 'function' && this.isKasiyasMajorPattern3RandomRushAction(action);
            if (!path || (parseFloat(path.length) || 0) < 8) {
                // 전조 경로가 예외적으로 유실되거나 0에 가까운 길이로 만들어져도
                // 돌진 액션이 포즈/이펙트만 내고 제자리에 멈추지 않도록 공격 액션 갱신 시점에 경로를 재확정한다.
                path = (isM3RandomRushAction && typeof this.getKasiyasMajorPattern3RushSlotPath === 'function')
                    ? (this.getKasiyasMajorPattern3RushSlotPath(m, action, 'BOSS') || (typeof this.ensureKasiyasMajorPattern3RushSlotPath === 'function' ? this.ensureKasiyasMajorPattern3RushSlotPath(m, action, gameState, 'BOSS') : null))
                    : ((typeof this.computeSafeDashPathForActionDirection === 'function') ? this.computeSafeDashPathForActionDirection(m, action, gameState, { minLength: 90 }) : this.computeDashPathForActionDirection(m, action, gameState));
                if (boss) {
                    boss.currentDashPath = path;
                    boss.lastDashPath = path;
                    boss.previewDashPath = null;
                    if (isM3RandomRushAction) boss.kasiyasP1M3RushHidden = false;
                }
            }
            if (!path || (parseFloat(path.length) || 0) < 8) return;

            const duration = this.getBossActionDuration(m, action, gameState);
            const t = Math.max(0, Math.min(1, m.timer / duration));
            const spinPose = String(action.Action_Pose_Type || '').trim().toUpperCase() === 'POSE_KASIYAS_P2_M2_AIR_SPIN_SLASH';
            if (spinPose) {
                path.endZ = 0;
                if (!Number.isFinite(parseFloat(path.startZ))) path.startZ = parseFloat(m.z) || 0;
            }
            m.x = path.startX + (path.endX - path.startX) * t;
            m.y = path.startY + (path.endY - path.startY) * t;
            const sz = Number.isFinite(parseFloat(path.startZ)) ? parseFloat(path.startZ) : (parseFloat(m.z) || 0);
            const ez = Number.isFinite(parseFloat(path.endZ)) ? parseFloat(path.endZ) : sz;
            m.z = sz + (ez - sz) * t + (spinPose ? Math.sin(Math.PI * t) * 28 : 0);
            if (t >= 0.995 && spinPose) m.z = 0;
            m.faceDir = path.dirX >= 0 ? 1 : -1;
            if (boss && isM3RandomRushAction) boss.kasiyasP1M3RushHidden = t >= 0.995;
            if (typeof this.pushKasiyasRushBodyEffect === 'function') {
                this.pushKasiyasRushBodyEffect(m, path, action, gameState, { isClone: false });
            }
            return;
        }

        if (moveType === 'NOISE' || actionType === 'MOVE_GROUP') {
            const boss = m.boss;
            const move = boss && boss.actionMove ? boss.actionMove : null;
            if (!move) return;
            const duration = this.getBossActionDuration(m, action, gameState);
            const t = Math.max(0, Math.min(1, m.timer / Math.max(0.001, duration)));
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            m.x = move.startX + (move.endX - move.startX) * ease;
            m.y = move.startY + (move.endY - move.startY) * ease;
            m.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, m.x));
            m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
            m.faceDir = (move.endX - move.startX) >= 0 ? 1 : -1;
            return;
        }

        if (moveType === 'JUMP') {
            const boss = m.boss;
            let move = boss && boss.actionMove ? boss.actionMove : null;
            if (!move) move = this.prepareBossJumpMoveToPlayer(m, action, gameState, { pushEffect: false });
            if (!move) return;
            const duration = this.getBossActionDuration(m, action, gameState);
            const t = Math.max(0, Math.min(1, m.timer / Math.max(0.001, duration)));
            const ease = t * t * (3 - 2 * t);
            m.x = move.startX + (move.endX - move.startX) * ease;
            m.y = move.startY + (move.endY - move.startY) * ease;
            const arc = Math.sin(Math.PI * t);
            m.z = (parseFloat(move.startZ) || 0) * (1 - ease) + (parseFloat(move.endZ) || 0) * ease + (parseFloat(move.jumpHeight) || 120) * arc;
            m.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, m.x));
            m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
            if (Math.abs(move.endX - move.startX) > 0.001) m.faceDir = move.endX >= move.startX ? 1 : -1;
            if (t >= 0.999) m.z = Math.max(0, parseFloat(move.endZ) || 0);
            return;
        }

        if (moveType === 'DASH') {
            const boss = m.boss;
            let move = boss && boss.actionMove ? boss.actionMove : null;
            if (!move) {
                // 액션 시작 프레임/데이터 누락 상황에서도 MOVE_DASH가 즉시 다음 공격으로 넘어가지 않도록
                // 이동 정보를 지연 생성한다. 이 보정이 없으면 기본 패턴 1번처럼 선행 돌진 액션이
                // 제자리에서 스킵되어 허공 검격으로 이어질 수 있다.
                move = this.prepareBossDashMoveToPlayer(m, action, gameState, { pushEffect: false });
            }
            if (!move) return;

            const duration = Math.max(0.001, parseFloat(move.duration) || this.getBossActionDuration(m, action, gameState));
            const t = Math.max(0, Math.min(1, m.timer / duration));
            const ease = t * t * (3 - 2 * t);
            m.x = move.startX + (move.endX - move.startX) * ease;
            m.y = move.startY + (move.endY - move.startY) * ease;
            m.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, m.x));
            m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
            m.faceDir = (move.endX - move.startX) >= 0 ? 1 : -1;
            if (boss && move.attackAfterMove && t >= 0.999) {
                boss.actionMoveCompleted = true;
                if (move.faceAfterMove === 1 || move.faceAfterMove === -1) m.faceDir = move.faceAfterMove;
            }
            return;
        }

        if (moveType === 'WALK') {
            const duration = Math.max(0.001, this.getBossActionDuration(m, action, gameState));
            const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
            const boss = m.boss || null;
            const player = gameState && gameState.player ? gameState.player : null;
            const isChaseWalk = (moveDir === 'CHASE_ENEMY' || moveDir === 'TO_PLAYER') && player;
            const rawMoveDistance = parseFloat(action.Action_Move_Distance);
            const hasMoveDistance = Number.isFinite(rawMoveDistance) && rawMoveDistance > 0;
            const rawStopDistance = parseFloat(action.Action_Move_Stop_Distance);
            const eff = String(action.VFX_Type || '').trim().toUpperCase();
            const isDoubleEdgeSpin = eff === 'EFT_KASIYAS_P2_DOUBLE_EDGED_SWORD_SPIN';
            const defaultStopDistance = isDoubleEdgeSpin ? 135 : 105;
            const stopDistance = Number.isFinite(rawStopDistance) && rawStopDistance > 0 ? rawStopDistance : defaultStopDistance;

            if (isChaseWalk && hasMoveDistance) {
                // 기존 1/2페이즈 기본 연속베기용 MOVE_WALK는 '지속 추격'이 아니라
                // 액션 시작 시점에 계산한 짧은 거리 보정 이동이다. 매 프레임 플레이어를 추격하면
                // Action_Move_Speed_Rate=4가 그대로 적용되어 플레이어와 겹치는 문제가 생긴다.
                let move = boss && boss.actionMove && boss.actionMove.type === 'WALK_LIMITED_CHASE' && boss.actionMove.actionId === String(action.Action_ID || '').trim()
                    ? boss.actionMove
                    : null;
                if (!move) {
                    const sx = Number.isFinite(parseFloat(m.x)) ? parseFloat(m.x) : 0;
                    const sy = Number.isFinite(parseFloat(m.y)) ? parseFloat(m.y) : 0;
                    const px = Number.isFinite(parseFloat(player.x)) ? parseFloat(player.x) : sx;
                    const py = Number.isFinite(parseFloat(player.y)) ? parseFloat(player.y) : sy;
                    const dx = px - sx;
                    const dy = py - sy;
                    const dist = Math.hypot(dx, dy) || 1;
                    const allowed = Math.max(0, Math.min(rawMoveDistance, dist - stopDistance));
                    const dirX = Math.abs(dx) > 0.001 ? dx / dist : (m.faceDir === -1 ? -1 : 1);
                    const dirY = Math.abs(dy) > 0.001 ? dy / dist : 0;
                    move = {
                        type: 'WALK_LIMITED_CHASE',
                        actionId: String(action.Action_ID || '').trim(),
                        startX: sx,
                        startY: sy,
                        endX: Math.max(0, Math.min(gameState.WORLD_WIDTH, sx + dirX * allowed)),
                        endY: Math.max(0, Math.min(gameState.WORLD_DEPTH, sy + dirY * allowed)),
                        duration: duration
                    };
                    if (boss) boss.actionMove = move;
                    if (Math.abs(dx) > 2) m.faceDir = dx >= 0 ? 1 : -1;
                }
                const t = Math.max(0, Math.min(1, (parseFloat(m.timer) || 0) / Math.max(0.001, move.duration || duration)));
                const ease = t * t * (3 - 2 * t);
                m.x = move.startX + (move.endX - move.startX) * ease;
                m.y = move.startY + (move.endY - move.startY) * ease;
                m.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, m.x));
                m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
                if (Math.abs(move.endX - move.startX) > 0.001) m.faceDir = move.endX >= move.startX ? 1 : -1;
            } else {
                let dirX = m.faceDir === -1 ? -1 : 1;
                let dirY = 0;
                if (isChaseWalk) {
                    const px = Number.isFinite(parseFloat(player.x)) ? parseFloat(player.x) : (parseFloat(m.x) || 0);
                    const py = Number.isFinite(parseFloat(player.y)) ? parseFloat(player.y) : (parseFloat(m.y) || 0);
                    const dx = px - (parseFloat(m.x) || 0);
                    const dy = py - (parseFloat(m.y) || 0);
                    const dist = Math.hypot(dx, dy) || 1;
                    if (Math.abs(dx) > 2) m.faceDir = dx >= 0 ? 1 : -1;
                    if (dist > stopDistance) {
                        dirX = Math.abs(dx) > 4 ? dx / dist : (m.faceDir === -1 ? -1 : 1);
                        dirY = Math.abs(dy) > 8 ? dy / dist : 0;
                        const dirLen = Math.hypot(dirX, dirY) || 1;
                        dirX /= dirLen;
                        dirY /= dirLen;
                        const speed = Math.max(30, this.getBossActionMoveSpeed(m, action, boss) || 90);
                        const step = Math.min(speed * deltaTime, Math.max(0, dist - stopDistance));
                        m.x += dirX * step;
                        m.y += dirY * step;
                    }
                } else {
                    const speed = Math.max(30, this.getBossActionMoveSpeed(m, action, boss) || 90);
                    m.x += dirX * speed * deltaTime;
                    m.y += dirY * speed * deltaTime;
                }
                m.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, m.x));
                m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
            }

            if (isDoubleEdgeSpin && Array.isArray(gameState.effects)) {
                const last = parseFloat(m.kasiyasP2DoubleEdgeSpinFxTimer);
                const now = parseFloat(m.timer) || 0;
                if (!Number.isFinite(last) || now < last || now - last >= 0.045) {
                    m.kasiyasP2DoubleEdgeSpinFxTimer = now;
                    const scale = parseFloat(m.scale) || 1;
                    const bodyX = ((m.d && parseFloat(m.d.bodyX)) || 80) * scale;
                    const bodyY = ((m.d && parseFloat(m.d.bodyY)) || 60) * scale;
                    const bodyZ = ((m.d && parseFloat(m.d.bodyZ)) || 160) * scale;
                    const dir = m.faceDir === -1 ? -1 : 1;
                    const rawHitX = parseFloat(action.Hitbox_Size_X);
                    const rawHitY = parseFloat(action.Hitbox_Size_Y);
                    const rawHitZ = parseFloat(action.Hitbox_Size_Z);
                    const hitW = Math.max(48, (Number.isFinite(rawHitX) && rawHitX > 0 ? rawHitX : bodyX * 1.25) * scale);
                    const hitD = Math.max(30, (Number.isFinite(rawHitY) && rawHitY > 0 ? rawHitY : bodyY * 1.05) * scale);
                    const hitH = Math.max(80, (Number.isFinite(rawHitZ) && rawHitZ > 0 ? rawHitZ : bodyZ * 1.05) * scale);
                    const offXRaw = parseFloat(action.Hitbox_Offset_X);
                    const offYRaw = parseFloat(action.Hitbox_Offset_Y);
                    const offZRaw = parseFloat(action.Hitbox_Offset_Z);
                    const offX = (Number.isFinite(offXRaw) ? offXRaw : Math.max(60, bodyX * 0.72)) * scale * dir;
                    const offY = (Number.isFinite(offYRaw) ? offYRaw : 0) * scale;
                    const offZ = (Number.isFinite(offZRaw) ? offZRaw : 0) * scale;
                    gameState.effects.push({
                        type: 'kasiyasDoubleEdgedSpin',
                        renderType: eff,
                        x: m.x + offX,
                        y: m.y + offY,
                        z: m.z + offZ + hitH * 0.52,
                        dir: dir,
                        w: hitW,
                        d: hitD,
                        h: hitH,
                        life: 0.22,
                        maxLife: 0.22,
                        color: 'rgba(92,6,8,0.82)',
                        accentColor: 'rgba(226,32,24,0.78)',
                        hotColor: 'rgba(255,224,196,0.92)'
                    });
                }
            }
            return;
        }

        if (moveType === 'MOVE_SHOULDER_ATK') {
            const duration = this.getBossActionDuration(m, action, gameState);
            const distance = parseFloat(action.Action_Move_Distance) || 100;
            const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
            let dirX = m.faceDir === -1 ? -1 : 1;
            let dirY = 0;
            if (moveDir === 'CHASE_ENEMY' || moveDir === 'TO_PLAYER') {
                const dx = gameState.player.x - m.x;
                const dy = gameState.player.y - m.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                dirX = Math.abs(dx) > 6 ? dx / len : (m.faceDir === -1 ? -1 : 1);
                dirY = Math.abs(dy) > 6 ? dy / len : 0;
                const dirLen = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
                dirX /= dirLen;
                dirY /= dirLen;
                m.faceDir = dx >= 0 ? 1 : -1;
            }
            const speed = distance / Math.max(0.001, duration);
            m.x += dirX * speed * deltaTime;
            m.y += dirY * speed * deltaTime;
            m.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, m.x));
            m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
            return;
        }

        const duration = Math.max(0.001, parseFloat(action.Action_Anim_Duration) || 0.7);
        const distance = parseFloat(action.Action_Move_Distance) || 0;
        if (distance <= 0) return;

        const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
        let dirX = m.faceDir === -1 ? -1 : 1;
        let dirY = 0;

        if (moveDir === 'CHASE_ENEMY') {
            const dx = gameState.player.x - m.x;
            const dy = gameState.player.y - m.y;
            dirX = Math.abs(dx) > 8 ? Math.sign(dx) : 0;
            dirY = Math.abs(dy) > 18 ? Math.sign(dy) : 0;

            const len = Math.sqrt(dirX * dirX + dirY * dirY);
            if (len > 0) { dirX /= len; dirY /= len; }
        }

        const speed = distance / duration;
        m.x += dirX * speed * deltaTime;
        m.y += dirY * speed * deltaTime;
    }
};
