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
        const marginX = Math.max(90, worldW * 0.08);
        const marginY = Math.max(55, worldD * 0.12);
        const key = String(placeType || '').trim().toUpperCase();
        const map = {
            PLACE_MAP_CENTER: { x: worldW / 2, y: worldD / 2, slotKey: 'CENTER' },
            MAP_CENTER: { x: worldW / 2, y: worldD / 2, slotKey: 'CENTER' },
            CENTER: { x: worldW / 2, y: worldD / 2, slotKey: 'CENTER' },
            PLACE_MAP_NE: { x: worldW - marginX * 2.55, y: marginY * 1.55, slotKey: 'NE' },
            PLACE_MAP_SE: { x: worldW - marginX * 2.55, y: worldD - marginY * 1.55, slotKey: 'SE' },
            PLACE_MAP_SW: { x: marginX * 2.55, y: worldD - marginY * 1.55, slotKey: 'SW' },
            PLACE_MAP_NW: { x: marginX * 2.55, y: marginY * 1.55, slotKey: 'NW' }
        };
        return map[key] || map.PLACE_MAP_CENTER;
    },

    getBossPositionSlotGroup: function(gameState, groupId) {
        const group = String(groupId || '').trim().toUpperCase();
        if (group === 'CENTER_NE_SE_SW_NW_FIVE_SLOT' || group === 'MAJOR_PATTERN_1_FIVE_SLOT' || !group) {
            return [
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_NE'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_SE'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_SW'),
                this.getBossFixedMapPosition(gameState, 'PLACE_MAP_NW')
            ];
        }
        return [this.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER')];
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
        const duration = (!isNaN(rawDuration) && rawDuration > 0)
            ? Math.max(0.05, rawDuration)
            : Math.max(0.18, Math.min(0.85, moveDistance / Math.max(1, speed)));

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


    onBossPatternActionStart: function(m, action, gameState) {
        const boss = m.boss;
        if (!boss) return;

        // 새 액션 시작 시 이전 액션의 이동 정보가 남아 다음 액션 지속시간/시선에 섞이지 않도록 초기화한다.
        boss.actionMove = null;

        const type = String(action.Action_Type || '').trim().toUpperCase();
        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        const pathSource = String(action.Hitbox_Path_Source || '').trim().toUpperCase();
        const vfxType = String(action.VFX_Type || action.Warning_Render_Type || '').trim().toUpperCase();
        const moveType = this.normalizeBossActionMoveType(action.Action_Move_Type);

        this.applyBossActionGaze(m, action, gameState);
        this.startBossPatternDialogue(m, action, gameState);

        if (type === 'MOVE_GROUP') {
            this.prepareBossGroupSlotShuffle(m, action, gameState);
            return;
        }

        if (type === 'ATK') {
            this.pushBossActionCueEffect(m, action, gameState);
            this.pushBossActiveAttackRangeWarning(m, action, gameState);
        }

        if (type === 'MOVE' && moveType === 'DASH') {
            const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
            if (moveDir === 'PLACE_MAP_CENTER' || moveDir === 'MAP_CENTER') {
                const target = this.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER');
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
                // PLACE_MAP_CENTER 이동은 단순 위치 이동이다.
                // 여기서 이동 잔상/참격 느낌의 이펙트를 띄우면 대형 패턴 개시가 공격처럼 보이므로 출력하지 않는다.
                // 공격 판정도 이 액션에서는 생성하지 않는다.
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

        // RUSH 계열은 시작 시점에 경로를 먼저 확정한다. 이후 ACTION_START 오브젝트가 이 경로를 복사한다.
        if (moveType === 'RUSH') {
            boss.currentDashPath = boss.previewDashPath || this.computeDashPathToMapEdge(m, gameState);
            boss.lastDashPath = boss.currentDashPath;
            boss.previewDashPath = null;

            if (action.VFX_Type) {
                const rushWidth = (parseFloat(action.Hitbox_Size_Y) || (m.d && m.d.bodyY) || 90) * (m.scale || 1);
                const rushHeight = (parseFloat(action.Hitbox_Size_Z) || (m.d && m.d.bodyZ) || 120) * (m.scale || 1);
                this.pushPathSlashEffects(boss.currentDashPath, rushWidth, rushHeight, action.VFX_Type || 'EFT_RUSH_ISSEN', gameState);
            }
        }

        // 돌진 전조는 두꺼운 공격범위가 아니라 얇은 궤도 예고선으로 그릴 수 있게 path만 사용한다.
        if (
            type === 'WARNING_PATH' ||
            (type === 'WARNING' && pathSource === 'PREVIEW_DASH_PATH') ||
            (type === 'WARNING' && vfxType === 'EFT_WARNING_RUSH_LINE')
        ) {
            boss.previewDashPath = this.computeDashPathToMapEdge(m, gameState);
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
                boss.actionHitFired = false;
                return;
            }

            this.spawnBossAttackObjectFromAction(m, action, gameState);
            boss.actionHitFired = true;
            return;
        }

        // 공격 액션 시작과 동시에 오브젝트를 생성하는 방식. 천귀살 잔류 검격에 사용한다.
        const spawnObjectId = String(action.Spawn_Object_ID || '').trim();
        const spawnTiming = String(action.Object_Spawn_Timing || '').trim().toUpperCase();
        if (spawnObjectId && spawnTiming === 'ACTION_START') {
            this.spawnBossAttackObjectFromAction(m, action, gameState);
        }
    },


    updateBossPatternActionMovement: function(m, action, deltaTime, gameState) {
        const moveType = this.normalizeBossActionMoveType(action.Action_Move_Type);
        const actionType = String(action.Action_Type || '').trim().toUpperCase();
        if (moveType !== 'WALK' && moveType !== 'RUSH' && moveType !== 'DASH' && moveType !== 'MOVE_SHOULDER_ATK' && moveType !== 'NOISE' && actionType !== 'MOVE_GROUP') return;

        if (moveType === 'RUSH') {
            const boss = m.boss;
            const path = boss && boss.currentDashPath ? boss.currentDashPath : null;
            if (!path) return;

            const duration = this.getBossActionDuration(m, action, gameState);
            const t = Math.max(0, Math.min(1, m.timer / duration));
            m.x = path.startX + (path.endX - path.startX) * t;
            m.y = path.startY + (path.endY - path.startY) * t;
            m.faceDir = path.dirX >= 0 ? 1 : -1;
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

            const duration = this.getBossActionDuration(m, action, gameState);
            const t = Math.max(0, Math.min(1, m.timer / Math.max(0.001, duration)));
            const ease = t * t * (3 - 2 * t);
            m.x = move.startX + (move.endX - move.startX) * ease;
            m.y = move.startY + (move.endY - move.startY) * ease;
            m.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, m.x));
            m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
            m.faceDir = (move.endX - move.startX) >= 0 ? 1 : -1;
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
