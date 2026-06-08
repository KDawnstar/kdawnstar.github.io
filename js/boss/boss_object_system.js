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


    getTerrainAreaRect: function(source, gameState) {
        const data = source && source.data ? source.data : source;
        const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        const x = parseFloat(data && data.Terrain_Area_X);
        const y = parseFloat(data && data.Terrain_Area_Y);
        const w = parseFloat(data && data.Terrain_Area_W);
        const h = parseFloat(data && data.Terrain_Area_H);
        const rect = {
            x: Number.isFinite(x) ? x : ((parseFloat(data && data.x) || 0) - (parseFloat(data && data.Hitbox_Size_X) || 120) / 2),
            y: Number.isFinite(y) ? y : ((parseFloat(data && data.y) || 0) - (parseFloat(data && data.Hitbox_Size_Y) || 80) / 2),
            w: Number.isFinite(w) && w > 0 ? w : (parseFloat(data && data.Hitbox_Size_X) || 120),
            h: Number.isFinite(h) && h > 0 ? h : (parseFloat(data && data.Hitbox_Size_Y) || 80)
        };
        rect.x = Math.max(0, Math.min(worldW, rect.x));
        rect.y = Math.max(0, Math.min(worldD, rect.y));
        rect.w = Math.max(1, Math.min(worldW - rect.x, rect.w));
        rect.h = Math.max(1, Math.min(worldD - rect.y, rect.h));
        rect.centerX = rect.x + rect.w / 2;
        rect.centerY = rect.y + rect.h / 2;
        return rect;
    },

    getTerrainSafeRect: function(source, gameState) {
        const data = source && source.data ? source.data : source;
        const x = parseFloat(data && data.Safe_Area_X);
        const y = parseFloat(data && data.Safe_Area_Y);
        const w = parseFloat(data && data.Safe_Area_W);
        const h = parseFloat(data && data.Safe_Area_H);
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
        const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        const rect = { x: Math.max(0, Math.min(worldW, x)), y: Math.max(0, Math.min(worldD, y)), w: Math.max(1, Math.min(worldW - Math.max(0, x), w)), h: Math.max(1, Math.min(worldD - Math.max(0, y), h)) };
        rect.centerX = rect.x + rect.w / 2;
        rect.centerY = rect.y + rect.h / 2;
        return rect;
    },

    isPlayerInsideTerrainRect: function(player, rect) {
        if (!player || !rect) return false;
        const scale = parseFloat(player.scale) || 1;
        const pw = Math.max(22, (parseFloat(player.bodyX) || 60) * scale * 0.50);
        const pd = Math.max(18, (parseFloat(player.bodyY) || 48) * scale * 0.50);
        const left = (parseFloat(player.x) || 0) - pw / 2;
        const right = (parseFloat(player.x) || 0) + pw / 2;
        const top = (parseFloat(player.y) || 0) - pd / 2;
        const bottom = (parseFloat(player.y) || 0) + pd / 2;
        return right >= rect.x && left <= rect.x + rect.w && bottom >= rect.y && top <= rect.y + rect.h;
    },

    getBossObjectDataField: function(data, keys, fallback = '') {
        const src = data || {};
        for (const key of keys) {
            if (src[key] !== undefined && src[key] !== null && String(src[key]).trim() !== '') return src[key];
        }
        return fallback;
    },

    getBossObjectInteractType: function(obj) {
        const data = obj && obj.data ? obj.data : obj;
        return String((obj && obj.getType) || this.getBossObjectDataField(data, ['Object_Interact_Type', 'Object_Get_Type'], '')).trim().toUpperCase();
    },

    getBossObjectInteractEffect: function(obj) {
        const data = obj && obj.data ? obj.data : obj;
        return String((obj && obj.getEffect) || this.getBossObjectDataField(data, ['Object_Interact_Effect', 'Object_Get_Effect'], '')).trim().toUpperCase();
    },

    getBossObjectInteractEffectValue: function(obj) {
        const data = obj && obj.data ? obj.data : obj;
        const val = (obj && obj.getEffectValue != null && String(obj.getEffectValue).trim() !== '') ? obj.getEffectValue : this.getBossObjectDataField(data, ['Object_Interact_Effect_Value', 'Object_Get_Effect_Value'], '');
        return String(val || '').trim();
    },

    getBossObjectInteractRange: function(data, defaults = {}) {
        const src = data || {};
        return {
            x: Math.max(20, parseFloat(this.getBossObjectDataField(src, ['Object_Interact_Range_X', 'Object_Get_Range_X'], defaults.x || 120)) || defaults.x || 120),
            y: Math.max(20, parseFloat(this.getBossObjectDataField(src, ['Object_Interact_Range_Y', 'Object_Get_Range_Y'], defaults.y || 80)) || defaults.y || 80),
            z: Math.max(0, parseFloat(this.getBossObjectDataField(src, ['Object_Interact_Range_Z', 'Object_Get_Range_Z'], defaults.z || 0)) || defaults.z || 0)
        };
    },

    getBossObjectInteractMaxLimit: function(data, defaultValue = 2) {
        const raw = parseInt(this.getBossObjectDataField(data, ['Max_Object_Interact_Limit', 'Max_Object_Get_Limit'], defaultValue));
        return !isNaN(raw) && raw > 0 ? raw : defaultValue;
    },

    getBossObjectInteractAfterType: function(obj) {
        const data = obj && obj.data ? obj.data : obj;
        return String((obj && obj.afterGetType) || this.getBossObjectDataField(data, ['Object_After_Interact_Type', 'Object_After_Get_Type'], '')).trim().toUpperCase();
    },

    getBossObjectDestroyResultType: function(data) {
        return String(this.getBossObjectDataField(data, ['Object_Destroy_Result_Type', 'Destroy_Result_Type', 'Object_Remove_Result_Type'], '')).trim().toUpperCase();
    },

    getBossObjectDestroyResultValue: function(data) {
        return String(this.getBossObjectDataField(data, ['Object_Destroy_Result_Value', 'Destroy_Result_Value', 'Object_Destroy_Result_Object_ID', 'Destroy_Result_Object_ID'], '')).trim();
    },

    isBossObjectInteractionConditionMet: function(obj, gameState) {
        const data = obj && obj.data ? obj.data : obj;
        const cond = String((obj && obj.interactCond) || this.getBossObjectDataField(data, ['Object_Interact_Cond', 'Object_Get_Cond'], '')).trim().toUpperCase();
        if (!cond || cond === 'NONE') return true;
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p) return false;
        if (cond === 'PLAYER_GET_APOSTLE_ENERGY' || cond === 'HAS_P2M2_APOSTLE_SWORD_ENERGY' || cond === 'PLAYER_HAS_APOSTLE_SWORD_ENERGY') {
            return !!p.hasP2M2ApostleSwordEnergy;
        }
        if (cond === 'PLAYER_HAS_APOSTLE_ENERGY' || cond === 'HAS_APOSTLE_ENERGY') {
            return !!p.hasP2M2ApostleSwordEnergy || (Array.isArray(p.kasiyasApostleEnergies) && p.kasiyasApostleEnergies.length > 0);
        }
        return true;
    },

    getKasiyasP2M2ObjectRenderSize: function(data, defaults = {}) {
        const src = data || {};
        return {
            w: Math.max(40, parseFloat(src.Hitbox_Size_X) || defaults.w || 560),
            d: Math.max(30, parseFloat(src.Hitbox_Size_Y) || defaults.d || 160),
            h: Math.max(40, parseFloat(src.Hitbox_Size_Z) || defaults.h || 200)
        };
    },

    createKasiyasP2M2SpecialObject: function(objectId, gameState, sourceObj = null, options = {}) {
        if (!gameState || !gameState.DB_BOSS_PATTERN_OBJECT) return null;
        const id = String(objectId || '').trim();
        if (!id) return null;
        const data = gameState.DB_BOSS_PATTERN_OBJECT[id];
        if (!data) return null;
        if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];
        const objectType = String(data.Object_Type || '').trim().toUpperCase();
        const renderType = String(data.Object_Render_Type || '').trim().toUpperCase();
        const owner = (sourceObj && (sourceObj.owner || sourceObj.sourceCaster)) || (Array.isArray(gameState.monsters) && gameState.monsters[0]) || null;
        const range = this.getBossObjectInteractRange(data, objectType === 'INTERACT_OBJECT' ? { x: 120, y: 80, z: 50 } : { x: 0, y: 0, z: 0 });
        const size = this.getKasiyasP2M2ObjectRenderSize(data, objectType === 'FIRE_OBJECT' ? { w: 300, d: 150, h: 150 } : { w: 560, d: 120, h: 180 });
        const baseX = Number.isFinite(parseFloat(options.x)) ? parseFloat(options.x) : (Number.isFinite(parseFloat(sourceObj && sourceObj.x)) ? parseFloat(sourceObj.x) : ((gameState.WORLD_WIDTH || 1400) * 0.5));
        const baseY = Number.isFinite(parseFloat(options.y)) ? parseFloat(options.y) : (Number.isFinite(parseFloat(sourceObj && sourceObj.y)) ? parseFloat(sourceObj.y) : ((gameState.WORLD_DEPTH || 400) * 0.5));
        let baseZ = Number.isFinite(parseFloat(options.z)) ? parseFloat(options.z) : (Number.isFinite(parseFloat(sourceObj && sourceObj.z)) ? parseFloat(sourceObj.z) : 0);
        const spawnPlaceType = String(data.Spawn_Place_Type || '').trim().toUpperCase();
        if (spawnPlaceType === 'PLACE_OBJECT_DESTROY' && objectType === 'INTERACT_OBJECT') {
            // 파괴된 잔해는 지면 상호작용 오브젝트이므로 파괴 시점의 높이가 아니라 바닥 기준으로 보정한다.
            baseZ = Math.max(0, parseFloat(data.Spawn_Place_Z) || 0);
        }
        const maxLife = Math.max(0.5, parseFloat(data.Object_Internal_Duration || data.Object_Max_Life || data.Object_Duration) || (objectType === 'AIMING_OBJECT' ? 10 : (objectType === 'FIRE_OBJECT' ? 3.5 : 12)));
        const obj = {
            kind: objectType === 'INTERACT_OBJECT' ? 'interactObject' : (objectType === 'AIMING_OBJECT' ? 'aimingObject' : (objectType === 'FIRE_OBJECT' ? 'p2m2FiredGiantSword' : 'p2m2SpecialObject')),
            owner,
            sourceCaster: sourceObj && (sourceObj.sourceCaster || sourceObj.owner) || owner,
            sourceObject: sourceObj || null,
            data,
            active: true,
            disabled: false,
            absorbed: false,
            x: baseX,
            y: baseY,
            z: baseZ,
            timer: 0,
            maxLife,
            renderType: renderType || data.Object_Render_Type || '',
            objectType,
            objectGroup: String(data.Object_Group || '').trim(),
            hitboxType: String(data.Hitbox_Type || '').trim().toUpperCase(),
            w: size.w,
            d: size.d,
            h: size.h,
            getType: String(this.getBossObjectDataField(data, ['Object_Interact_Type', 'Object_Get_Type'], '')).trim().toUpperCase(),
            getEffect: String(this.getBossObjectDataField(data, ['Object_Interact_Effect', 'Object_Get_Effect'], '')).trim().toUpperCase(),
            getEffectValue: String(this.getBossObjectDataField(data, ['Object_Interact_Effect_Value', 'Object_Get_Effect_Value'], '')).trim(),
            interactCond: String(this.getBossObjectDataField(data, ['Object_Interact_Cond', 'Object_Get_Cond'], '')).trim().toUpperCase(),
            interactResultType: String(this.getBossObjectDataField(data, ['Object_Interact_Result_Type'], '')).trim().toUpperCase(),
            interactResultValue: String(this.getBossObjectDataField(data, ['Object_Interact_Result_Value'], '')).trim(),
            getRangeX: range.x,
            getRangeY: range.y,
            getRangeZ: range.z,
            afterGetType: String(this.getBossObjectDataField(data, ['Object_After_Interact_Type', 'Object_After_Get_Type'], '')).trim().toUpperCase(),
            interactCount: 0,
            maxInteractLimit: this.getBossObjectInteractMaxLimit(data, 1)
        };
        if (objectType === 'AIMING_OBJECT') {
            obj.aimAngle = parseFloat(data.Aim_Default_Angle);
            if (!Number.isFinite(obj.aimAngle)) obj.aimAngle = -35;
            obj.aimMinAngle = Number.isFinite(parseFloat(data.Aim_Min_Angle)) ? parseFloat(data.Aim_Min_Angle) : -75;
            obj.aimMaxAngle = Number.isFinite(parseFloat(data.Aim_Max_Angle)) ? parseFloat(data.Aim_Max_Angle) : -10;
            obj.aimAngleSpeed = Math.max(1, parseFloat(data.Aim_Angle_Speed) || 45);
            obj.aimTimeLimit = Math.max(0.5, parseFloat(data.Aim_Time_Limit) || maxLife);
            obj.aimFireSpeed = Math.max(1, parseFloat(data.Aim_Fire_Speed) || 900);
            obj.aimFireObjectId = String(data.Aim_Fire_Object_ID || data.Aim_Result_Value || data.Object_Interact_Value || '').trim();
            obj.aimPreviewLength = Math.max(80, parseFloat(data.Aim_Preview_Length) || 700);
            obj.fireDirection = String(data.Aim_Default_Direction || data.Aim_Direction || '').trim().toUpperCase();
            if (obj.fireDirection !== 'LEFT' && obj.fireDirection !== 'RIGHT') obj.fireDirection = ((parseFloat(obj.x) || 0) >= ((parseFloat(gameState && gameState.WORLD_WIDTH) || 1400) / 2)) ? 'LEFT' : 'RIGHT';
            obj.fireKeyLatch = !!(gameState && gameState.keys && (gameState.keys.KeyZ || gameState.keys.Space));
            obj.cancelKeyLatch = !!(gameState && gameState.keys && gameState.keys.KeyC);
            gameState.p2m2GiantSwordAim = obj;
        }
        if (objectType === 'FIRE_OBJECT') {
            obj.fireAngle = Number.isFinite(parseFloat(options.angle)) ? parseFloat(options.angle) : (Number.isFinite(parseFloat(sourceObj && sourceObj.aimAngle)) ? parseFloat(sourceObj.aimAngle) : -35);
            obj.fireSpeed = Math.max(1, parseFloat(options.fireSpeed) || parseFloat(data.Object_Move_Speed) || parseFloat(sourceObj && sourceObj.aimFireSpeed) || 900);
            obj.fireDirection = String(options.fireDirection || sourceObj && sourceObj.fireDirection || data.Fire_Direction || '').trim().toUpperCase();
            if (obj.fireDirection !== 'LEFT' && obj.fireDirection !== 'RIGHT') obj.fireDirection = ((parseFloat(obj.x) || 0) >= ((parseFloat(gameState && gameState.WORLD_WIDTH) || 1400) / 2)) ? 'LEFT' : 'RIGHT';
            const rad = obj.fireAngle * Math.PI / 180;
            const dirSign = obj.fireDirection === 'LEFT' ? -1 : 1;
            obj.vx = Math.abs(Math.cos(rad) * obj.fireSpeed) * dirSign;
            obj.vz = -Math.sin(rad) * obj.fireSpeed;
            obj.vy = 0;
            obj.rotation = obj.fireDirection === 'LEFT' ? Math.PI - rad : rad;
            obj.maxLife = Math.max(1.0, parseFloat(data.Object_Internal_Duration) || 3.5);
            if (gameState) {
                gameState.p2m2LastFiredSword = {
                    direction: obj.fireDirection,
                    x: obj.x,
                    y: obj.y,
                    z: obj.z,
                    w: obj.w,
                    h: obj.h,
                    timer: Math.max(6.0, obj.maxLife + 4.5)
                };
            }
        }
        gameState.bossAttackObjects.push(obj);
        if (gameState.effects) {
            gameState.effects.push({ type: 'hitSpark', renderType: data.VFX_Type || renderType, x: obj.x, y: obj.y, z: obj.z + 60, w: obj.w, h: obj.h, life: 0.25, maxLife: 0.25, color: 'rgba(255,78,58,0.62)', accentColor: 'rgba(255,236,202,0.78)' });
        }
        this.pushBossDebugLog && this.pushBossDebugLog(gameState, 'OBJECT', `${id} ${this.getBossDebugName(data)}`, `spawn ${objectType || obj.kind}`);
        return obj;
    },


    isBossObjectDestructible: function(obj) {
        if (!obj || obj.active === false || obj.destroyed) return false;
        const data = obj.data || {};
        const hp = parseFloat(obj.objectHp != null ? obj.objectHp : data.Object_HP);
        if (!Number.isFinite(hp) || hp <= 0) return false;
        const type = String(obj.objectType || data.Object_Type || '').trim().toUpperCase();
        const renderType = String(obj.renderType || data.Object_Render_Type || '').trim().toUpperCase();
        return type === 'SWORD_WALL_GIANT_SWORD' || renderType.indexOf('GIANT_SWORD') >= 0 || Number.isFinite(parseFloat(data.Object_HP));
    },

    getBossObjectDamageHitbox: function(obj) {
        if (!obj) return null;
        const action = obj.action || {};
        const data = obj.data || {};
        const w = Math.max(40, parseFloat(action.Hitbox_Size_X) || parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 150);
        const d = Math.max(30, parseFloat(action.Hitbox_Size_Y) || parseFloat(obj.d) || parseFloat(data.Hitbox_Size_Y) || 220);
        const h = Math.max(60, parseFloat(action.Hitbox_Size_Z) || parseFloat(obj.h) || parseFloat(data.Hitbox_Size_Z) || 220);
        return {
            x: Number.isFinite(parseFloat(obj.x)) ? parseFloat(obj.x) : 0,
            y: Number.isFinite(parseFloat(obj.y)) ? parseFloat(obj.y) : 0,
            z: Number.isFinite(parseFloat(obj.z)) ? parseFloat(obj.z) : 0,
            w,
            d,
            h
        };
    },

    damageBossDestructibleObject: function(obj, damage, gameState, source = {}) {
        if (!this.isBossObjectDestructible(obj)) return false;
        const amount = Math.max(0, parseFloat(damage) || 0);
        if (amount <= 0) return false;
        const data = obj.data || {};
        const maxHpRaw = parseFloat(obj.objectMaxHp != null ? obj.objectMaxHp : data.Object_HP);
        obj.objectMaxHp = Number.isFinite(maxHpRaw) && maxHpRaw > 0 ? maxHpRaw : Math.max(1, parseFloat(obj.objectHp) || 1);
        obj.objectHp = Math.max(0, (Number.isFinite(parseFloat(obj.objectHp)) ? parseFloat(obj.objectHp) : obj.objectMaxHp) - amount);
        obj.objectHpShowTimer = 2.0;
        obj.lastDamagedTimer = 0.18;

        if (gameState && Array.isArray(gameState.floatingTexts)) {
            gameState.floatingTexts.push({
                x: obj.x,
                y: obj.y,
                z: (parseFloat(obj.z) || 0) + Math.max(90, (parseFloat(obj.h) || 220) * 0.72),
                text: Math.round(amount).toString(),
                color: '#ff7566',
                size: '20px',
                timer: 0.55
            });
        }
        if (gameState && Array.isArray(gameState.effects)) {
            gameState.effects.push({
                type: 'p2m2GiantSwordHit',
                x: obj.x,
                y: obj.y,
                z: (parseFloat(obj.z) || 0) + Math.max(70, (parseFloat(obj.h) || 220) * 0.42),
                w: Math.max(160, parseFloat(obj.w) || 220),
                h: Math.max(90, parseFloat(obj.h) || 220),
                life: 0.24,
                maxLife: 0.24
            });
        }

        if (obj.objectHp <= 0) {
            this.destroyBossDestructibleObject(obj, gameState, source);
        }
        return true;
    },

    tryDamageBossDestructibleObjects: function(gameState, hitbox, damage, source = {}) {
        if (!gameState || !hitbox || !Array.isArray(gameState.bossAttackObjects)) return false;
        let hit = false;
        for (const obj of gameState.bossAttackObjects) {
            if (!this.isBossObjectDestructible(obj)) continue;
            if (source && source.projectile && source.projectile.hitTargets && source.projectile.hitTargets.has(obj)) continue;
            const box = this.getBossObjectDamageHitbox(obj);
            if (!box) continue;
            if (typeof checkAABB3D === 'function' && checkAABB3D(hitbox.x, hitbox.y, hitbox.z, hitbox.w, hitbox.d, hitbox.h, box.x, box.y, box.z, box.w, box.d, box.h)) {
                this.damageBossDestructibleObject(obj, damage, gameState, source);
                if (source && source.projectile && source.projectile.hitTargets) source.projectile.hitTargets.add(obj);
                hit = true;
                if (!source.penetrate) break;
            }
        }
        return hit;
    },

    queueKasiyasP2M2SpecialObjectSpawn: function(objectId, gameState, sourceObj = null, options = {}) {
        if (!gameState) return false;
        const id = String(objectId || '').trim();
        if (!id) return false;
        gameState.pendingKasiyasP2M2SpecialObjectSpawns = gameState.pendingKasiyasP2M2SpecialObjectSpawns || [];
        gameState.pendingKasiyasP2M2SpecialObjectSpawns.push({
            objectId: id,
            sourceObj: sourceObj || null,
            options: {
                x: Number.isFinite(parseFloat(options.x)) ? parseFloat(options.x) : (Number.isFinite(parseFloat(sourceObj && sourceObj.x)) ? parseFloat(sourceObj.x) : undefined),
                y: Number.isFinite(parseFloat(options.y)) ? parseFloat(options.y) : (Number.isFinite(parseFloat(sourceObj && sourceObj.y)) ? parseFloat(sourceObj.y) : undefined),
                z: Number.isFinite(parseFloat(options.z)) ? parseFloat(options.z) : (Number.isFinite(parseFloat(sourceObj && sourceObj.z)) ? parseFloat(sourceObj.z) : undefined),
                angle: options.angle,
                fireSpeed: options.fireSpeed
            }
        });
        return true;
    },

    flushKasiyasP2M2PendingSpecialObjectSpawns: function(gameState) {
        if (!gameState || !Array.isArray(gameState.pendingKasiyasP2M2SpecialObjectSpawns) || gameState.pendingKasiyasP2M2SpecialObjectSpawns.length <= 0) return;
        const pending = gameState.pendingKasiyasP2M2SpecialObjectSpawns.splice(0);
        for (const req of pending) {
            if (!req || !req.objectId) continue;
            try {
                if (typeof this.createKasiyasP2M2SpecialObject === 'function') {
                    this.createKasiyasP2M2SpecialObject(req.objectId, gameState, req.sourceObj || null, req.options || {});
                }
            } catch (err) {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('[Kasiyas P2M2] pending special object spawn failed:', req.objectId, err);
                }
            }
        }
    },

    destroyBossDestructibleObject: function(obj, gameState, source = {}) {
        if (!obj || obj.destroyed) return;
        obj.destroyed = true;
        obj.objectHp = 0;
        obj.actionCancelled = true;
        obj.actionHitFired = true;
        obj.actionHitsDone = Math.max(obj.actionHitsDone || 0, parseInt(obj.action && obj.action.ATK_Hit_Count) || 1);
        obj.active = false;
        const p = gameState && gameState.player ? gameState.player : null;
        if (p) {
            p.hasP2M2ApostleSwordEnergy = true;
            p.p2m2ApostleSwordEnergyTimer = 12;
            p.kasiyasApostleEnergyFlashTimer = Math.max(parseFloat(p.kasiyasApostleEnergyFlashTimer) || 0, 1.0);
        }
        if (gameState && Array.isArray(gameState.effects)) {
            gameState.effects.push({
                type: 'p2m2GiantSwordBreak',
                x: obj.x,
                y: obj.y,
                z: (parseFloat(obj.z) || 0) + Math.max(80, (parseFloat(obj.h) || 220) * 0.38),
                w: Math.max(260, parseFloat(obj.w) || 280),
                h: Math.max(190, parseFloat(obj.h) || 260),
                life: 0.78,
                maxLife: 0.78
            });
            if (p) {
                gameState.effects.push({
                    type: 'p2m2ApostleEnergyAbsorb',
                    x: obj.x,
                    y: obj.y,
                    z: (parseFloat(obj.z) || 0) + 100,
                    target: p,
                    targetX: p.x,
                    targetY: p.y,
                    targetZ: (parseFloat(p.z) || 0) + Math.max(80, (parseFloat(p.bodyZ) || 120) * (parseFloat(p.scale) || 1) * 0.75),
                    life: 0.95,
                    maxLife: 0.95
                });
            }
        }
        if (gameState && Array.isArray(gameState.floatingTexts)) {
            gameState.floatingTexts.push({
                x: p ? p.x : obj.x,
                y: p ? p.y : obj.y,
                z: p ? ((parseFloat(p.z) || 0) + 140) : ((parseFloat(obj.z) || 0) + 160),
                text: '사도의 기운 흡수',
                color: '#ff8870',
                size: '22px',
                timer: 1.1
            });
        }
        const data = obj.data || {};
        const effectValue = String(data.Object_Remove_Effect_Value || '').trim();
        const destroyResultType = typeof this.getBossObjectDestroyResultType === 'function'
            ? this.getBossObjectDestroyResultType(data)
            : String(data.Object_Destroy_Result_Type || data.Destroy_Result_Type || '').trim().toUpperCase();
        const destroyResultValue = typeof this.getBossObjectDestroyResultValue === 'function'
            ? this.getBossObjectDestroyResultValue(data)
            : String(data.Object_Destroy_Result_Value || data.Destroy_Result_Value || data.Object_Destroy_Result_Object_ID || data.Destroy_Result_Object_ID || '').trim();
        let brokenObjectId = '';
        if ((destroyResultType === 'SPAWN_OBJECT' || destroyResultType === 'SPAWN_NEXT_OBJECT' || destroyResultType === 'CREATE_OBJECT') && destroyResultValue) {
            brokenObjectId = destroyResultValue;
        } else if (destroyResultValue && !destroyResultType) {
            brokenObjectId = destroyResultValue;
        } else if (effectValue === '1') {
            // 구버전 데이터 호환: 사도의 기운 획득 효과값만 있던 252020은 252021을 생성한다.
            brokenObjectId = '252021';
        }
        const fallbackBrokenObjectId = '252021';
        const spawnId = (brokenObjectId && gameState && gameState.DB_BOSS_PATTERN_OBJECT && gameState.DB_BOSS_PATTERN_OBJECT[brokenObjectId])
            ? brokenObjectId
            : ((gameState && gameState.DB_BOSS_PATTERN_OBJECT && gameState.DB_BOSS_PATTERN_OBJECT[fallbackBrokenObjectId] && effectValue === '1') ? fallbackBrokenObjectId : '');
        if (spawnId && typeof this.queueKasiyasP2M2SpecialObjectSpawn === 'function') {
            const queued = this.queueKasiyasP2M2SpecialObjectSpawn(spawnId, gameState, obj, {
                x: Number.isFinite(parseFloat(obj.x)) ? parseFloat(obj.x) : 0,
                y: Number.isFinite(parseFloat(obj.y)) ? parseFloat(obj.y) : ((gameState && gameState.WORLD_DEPTH) || 400) * 0.5,
                z: Math.max(0, parseFloat(obj.z) || 0)
            });
            if (queued && this.pushBossDebugLog) {
                this.pushBossDebugLog(gameState, 'OBJECT_DESTROY', `${String(data.Object_ID || '').trim()} ${this.getBossDebugName ? this.getBossDebugName(data) : ''}`, `queue spawn ${spawnId}`);
            }
        }
        if (this.pushBossDebugLog) {
            const debugName = this.getBossDebugName ? this.getBossDebugName(obj.data) : String(obj.data && (obj.data.Object_Name || obj.data.Name || obj.data.Object_ID) || '');
            this.pushBossDebugLog(gameState, 'OBJECT_DESTROY', `${String(obj.data && obj.data.Object_ID || '').trim()} ${debugName}`, 'apostle giant sword destroyed');
        }
    },

    movePlayerToTerrainSafeArea: function(player, safeRect, fromRect, gameState) {
        if (!player || !safeRect) return;
        const scale = parseFloat(player.scale) || 1;
        const pw = Math.max(24, (parseFloat(player.bodyX) || 60) * scale * 0.50);
        const pd = Math.max(20, (parseFloat(player.bodyY) || 48) * scale * 0.50);
        const margin = 8;
        let nx = Math.max(safeRect.x + pw / 2 + margin, Math.min(safeRect.x + safeRect.w - pw / 2 - margin, parseFloat(player.x) || safeRect.centerX));
        let ny = Math.max(safeRect.y + pd / 2 + margin, Math.min(safeRect.y + safeRect.h - pd / 2 - margin, parseFloat(player.y) || safeRect.centerY));
        if (fromRect) {
            // 위쪽 붕괴면 안전 지대 위쪽 안쪽으로, 아래쪽 붕괴면 아래쪽 안쪽으로 밀어 넣는다.
            if (fromRect.centerY < safeRect.centerY) ny = safeRect.y + pd / 2 + margin;
            else if (fromRect.centerY > safeRect.centerY) ny = safeRect.y + safeRect.h - pd / 2 - margin;
        }
        player.x = Math.max(0, Math.min((gameState && gameState.WORLD_WIDTH) || 1400, nx));
        player.y = Math.max(0, Math.min((gameState && gameState.WORLD_DEPTH) || 400, ny));
        player.z = 0;
        player.vz = 0;
        player.knockbackX = 0;
        player.knockbackY = 0;
        player.kbVx = 0;
        player.kbVy = 0;
        player.vx = 0;
        player.vy = 0;
        player.atkTimer = 0;
        player.hitTimer = 0;
        player.hitDur = 0;
        player.dashTimer = 0;
        player.runDashTimer = 0;
        player.isJumping = false;
        player.isDashing = false;
        player.guardActive = false;
        player.guardTimer = 0;
        player.guardHoldTimer = 0;
        player.attackQueued = false;
        player.currentAction = null;
        if (String(player.state || '').toUpperCase() !== 'DIE') player.state = 'Idle';
    },

    applyTerrainCollapseHit: function(obj, gameState) {
        if (!obj || obj.terrainHitApplied) return false;
        obj.terrainHitApplied = true;
        const p = gameState && gameState.player ? gameState.player : null;
        const owner = obj.owner || obj.sourceCaster;
        const rect = obj.terrainArea || this.getTerrainAreaRect(obj, gameState);
        if (!p || !p.active || p.hp <= 0 || !rect) return false;
        const inside = this.isPlayerInsideTerrainRect(p, rect);
        gameState.hitboxes = gameState.hitboxes || [];
        gameState.hitboxes.push({ x: rect.centerX, y: rect.centerY, z: 0, w: rect.w, d: rect.h, h: 120, life: 0.18, sourceObject: obj, sourceObjectId: String(obj.data && obj.data.Object_ID || '') });
        if (inside && owner && owner.d && owner.hp > 0) {
            const action = (Array.isArray(obj.actions) && obj.actions[0]) || (obj.data && Array.isArray(obj.data.Runtime_Actions) && obj.data.Runtime_Actions[0]) || obj.data || {};
            const oldX = parseFloat(p.x) || rect.centerX;
            const oldY = parseFloat(p.y) || rect.centerY;
            const oldZ = parseFloat(p.z) || 0;
            const oldFace = parseFloat(p.faceDir) || 1;
            const bodyW = Math.max(42, (parseFloat(p.bodyX) || 60) * (parseFloat(p.scale) || 1));
            const bodyH = Math.max(90, (parseFloat(p.bodyZ) || 120) * (parseFloat(p.scale) || 1));
            const dmgRate = parseFloat(action.ATK_Damage_Rate || action.Damage_Rate) || 1.5;
            const baseDmg = owner.d.atk * dmgRate;
            PlayerManager.takeDamage(gameState, calcScaledDamage(owner.d.level, p.level, baseDmg), rect.centerX, rect.centerY, null, 0, 0, this.buildGuardInfoFromAttackData(action, obj));
            if (gameState.effects) {
                gameState.effects.push({
                    type: 'terrainCollapsePlayerFall',
                    x: oldX,
                    y: oldY,
                    z: oldZ + 10,
                    w: bodyW,
                    d: Math.max(42, bodyW * 0.78),
                    h: bodyH,
                    dir: oldFace,
                    life: 0.62,
                    maxLife: 0.62,
                    color: 'rgba(255,110,72,0.92)',
                    accentColor: 'rgba(15,0,0,0.88)'
                });
                gameState.effects.push({
                    type: 'terrainCollapseFall',
                    x: oldX,
                    y: oldY,
                    z: 18,
                    w: Math.max(150, rect.w * 0.14),
                    d: Math.max(82, rect.h * 0.62),
                    h: 80,
                    life: 0.58,
                    maxLife: 0.58,
                    color: 'rgba(255,80,52,0.84)',
                    accentColor: 'rgba(30,0,0,0.70)'
                });
            }
            this.movePlayerToTerrainSafeArea(p, obj.safeArea || this.getTerrainSafeRect(obj, gameState), rect, gameState);
            if (gameState.floatingTexts) gameState.floatingTexts.push({ x: p.x, y: p.y, z: (p.z || 0) + (p.bodyZ || 120) + 20, text: '낙하 피해', color: '#ff735f', size: '24px', timer: 0.75 });
            return true;
        }
        return false;
    },

    getPlayerTerrainCollisionHalfSize: function(player) {
        const scale = parseFloat(player && player.scale) || 1;
        return {
            x: Math.max(24, (parseFloat(player && player.bodyX) || 60) * scale * 0.50),
            y: Math.max(20, (parseFloat(player && player.bodyY) || 48) * scale * 0.50)
        };
    },

    normalizeTerrainRect: function(rect) {
        if (!rect) return null;
        const x = parseFloat(rect.x);
        const y = parseFloat(rect.y);
        const w = parseFloat(rect.w);
        const h = parseFloat(rect.h);
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
        const out = { x, y, w, h };
        out.centerX = Number.isFinite(parseFloat(rect.centerX)) ? parseFloat(rect.centerX) : x + w / 2;
        out.centerY = Number.isFinite(parseFloat(rect.centerY)) ? parseFloat(rect.centerY) : y + h / 2;
        out.isGapBridge = !!rect.isGapBridge;
        return out;
    },

    buildKasiyasP3BrokenSpaceBlockerRects: function(blockRects, player) {
        const base = (blockRects || []).map(r => this.normalizeTerrainRect(r)).filter(Boolean);
        const half = this.getPlayerTerrainCollisionHalfSize(player || {});
        const playerW = half.x;
        const playerH = half.y;
        const result = base.slice();
        for (let i = 0; i < base.length; i++) {
            for (let j = i + 1; j < base.length; j++) {
                const a = base[i];
                const b = base[j];
                const left = a.x + a.w <= b.x ? a : (b.x + b.w <= a.x ? b : null);
                const right = left === a ? b : (left === b ? a : null);
                if (left && right) {
                    const gap = right.x - (left.x + left.w);
                    const y0 = Math.max(left.y, right.y);
                    const y1 = Math.min(left.y + left.h, right.y + right.h);
                    if (gap > 0 && gap < playerW && y1 > y0) {
                        const bridge = { x: left.x + left.w, y: y0, w: gap, h: Math.max(1, y1 - y0), isGapBridge: true };
                        bridge.centerX = bridge.x + bridge.w / 2;
                        bridge.centerY = bridge.y + bridge.h / 2;
                        result.push(bridge);
                    }
                }

                const top = a.y + a.h <= b.y ? a : (b.y + b.h <= a.y ? b : null);
                const bottom = top === a ? b : (top === b ? a : null);
                if (top && bottom) {
                    const gap = bottom.y - (top.y + top.h);
                    const x0 = Math.max(top.x, bottom.x);
                    const x1 = Math.min(top.x + top.w, bottom.x + bottom.w);
                    if (gap > 0 && gap < playerH && x1 > x0) {
                        const bridge = { x: x0, y: top.y + top.h, w: Math.max(1, x1 - x0), h: gap, isGapBridge: true };
                        bridge.centerX = bridge.x + bridge.w / 2;
                        bridge.centerY = bridge.y + bridge.h / 2;
                        result.push(bridge);
                    }
                }
            }
        }
        return result;
    },

    pushPlayerOutOfTerrainRect: function(player, rect, gameState) {
        rect = this.normalizeTerrainRect(rect);
        if (!player || !rect || !this.isPlayerInsideTerrainRect(player, rect)) return false;
        const half = this.getPlayerTerrainCollisionHalfSize(player);
        const pw = half.x;
        const pd = half.y;
        const px = parseFloat(player.x) || 0;
        const py = parseFloat(player.y) || 0;
        const margin = rect.isGapBridge ? 6 : 4;
        const leftPen = (px + pw / 2) - rect.x;
        const rightPen = (rect.x + rect.w) - (px - pw / 2);
        const topPen = (py + pd / 2) - rect.y;
        const bottomPen = (rect.y + rect.h) - (py - pd / 2);
        const candidates = [
            { axis: 'x', dir: -1, value: leftPen },
            { axis: 'x', dir: 1, value: rightPen },
            { axis: 'y', dir: -1, value: topPen },
            { axis: 'y', dir: 1, value: bottomPen }
        ].filter(c => Number.isFinite(c.value) && c.value >= 0);
        if (!candidates.length) return false;
        candidates.sort((a, b) => a.value - b.value);
        const c = candidates[0];
        if (c.axis === 'x') player.x = px + c.dir * (c.value + margin);
        else player.y = py + c.dir * (c.value + margin);
        player.x = Math.max(0, Math.min((gameState && gameState.WORLD_WIDTH) || 1400, player.x));
        player.y = Math.max(0, Math.min((gameState && gameState.WORLD_DEPTH) || 400, player.y));
        player.knockbackX = 0;
        player.knockbackY = 0;
        player.kbVx = 0;
        player.kbVy = 0;
        return px !== player.x || py !== player.y;
    },

    applyTerrainPlayerBlockers: function(gameState) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p || !p.active || !Array.isArray(gameState.bossAttackObjects)) return;
        const normalRects = [];
        const p3Rects = [];
        gameState.bossAttackObjects.forEach(obj => {
            if (!obj || !obj.active || obj.kind !== 'terrain') return;
            const type = String(obj.objectType || obj.data && obj.data.Object_Type || '').trim().toUpperCase();
            if (type !== 'TERRAIN_BLOCK' && type !== 'TERRAIN_BLOCKER' && type !== 'TERRAIN_PLAYER_BLOCK' && type !== 'TERRAIN_PLAYER_BLOCKER') return;
            const rect = this.normalizeTerrainRect(obj.terrainArea || this.getTerrainAreaRect(obj, gameState));
            if (!rect) return;
            const renderType = String(obj.renderType || obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase();
            if (type === 'TERRAIN_BLOCK' && renderType === 'OBJ_P3_SPACE_BURST_BROKEN_SPACE') p3Rects.push(rect);
            else normalRects.push(rect);
        });
        const blockers = normalRects.concat(this.buildKasiyasP3BrokenSpaceBlockerRects(p3Rects, p));
        // 여러 구역이 겹치거나 작은 틈 브리지가 생긴 경우를 위해 몇 차례 반복 보정한다.
        for (let pass = 0; pass < 4; pass++) {
            let moved = false;
            for (const rect of blockers) {
                if (this.pushPlayerOutOfTerrainRect(p, rect, gameState)) moved = true;
            }
            if (!moved) break;
        }
    },

    clearBossPatternTerrainObjects: function(gameState, options = {}) {
        if (!gameState || !Array.isArray(gameState.bossAttackObjects)) return;
        const patternId = String(options.patternId || '').trim();
        gameState.bossAttackObjects.forEach(obj => {
            if (!obj || obj.kind !== 'terrain') return;
            if (patternId && String(obj.sourcePatternId || '') && String(obj.sourcePatternId || '') !== patternId) return;
            obj.active = false;
        });
        gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => obj && obj.active);
        if (Array.isArray(gameState.effects)) {
            gameState.effects = gameState.effects.filter(eff => {
                if (!eff) return false;
                if (eff.type === 'kasiyasP2GroundSwords' || eff.type === 'kasiyasP2PutSword') return false;
                return true;
            });
        }
    },


    clearAllBossPatternRuntimeOnDeath: function(m, gameState) {
        if (!gameState) return;
        if (Array.isArray(gameState.bossAttackObjects)) {
            gameState.bossAttackObjects.forEach(obj => { if (obj) obj.active = false; });
            gameState.bossAttackObjects = [];
        }
        gameState.p2m2GiantSwordAim = null;
        if (Array.isArray(gameState.hitboxes)) {
            gameState.hitboxes = gameState.hitboxes.filter(hb => {
                if (!hb) return false;
                if (hb.sourceObject || hb.sourceObjectId || hb.sourceActionId || hb.bodyCollision || hb.attachedExtraHitbox) return false;
                return false;
            });
        }
        if (Array.isArray(gameState.effects)) {
            gameState.effects = gameState.effects.filter(eff => {
                if (!eff) return false;
                const type = String(eff.type || '').trim();
                const renderType = String(eff.renderType || eff.warningRenderType || '').trim().toUpperCase();
                if (eff.sourceObject || eff.sourceObjectId || eff.sourceActionId) return false;
                if (type === 'warning' || type === 'dimensionPortalOpen' || type === 'fallingSwordImpact' ||
                    type === 'kasiyasP2GroundSwords' || type === 'kasiyasP2PutSword' || type === 'kasiyasP2JumpTrail' ||
                    type === 'terrainCollapsePlayerFall' || type === 'terrainCollapseFall' || type === 'kasiyasDoubleEdgedSpin') return false;
                if (renderType.indexOf('TERRAIN') >= 0 || renderType.indexOf('DIMENSION_PORTAL') >= 0 ||
                    renderType.indexOf('SWORD_STORM') >= 0 || renderType.indexOf('SLASH_PATH') >= 0 ||
                    renderType.indexOf('CROSS_SWORD_WAVE') >= 0 || renderType.indexOf('DOUBLE_EDGED_SWORD') >= 0) return false;
                return true;
            });
        }
        const bosses = Array.isArray(gameState.monsters) ? gameState.monsters : [];
        bosses.forEach(bm => {
            if (!bm || !bm.boss) return;
            const boss = bm.boss;
            boss.activePattern = null;
            boss.runtimeActions = [];
            boss.action = null;
            boss.actionIndex = -1;
            boss.actionMove = null;
            boss.currentDashPath = null;
            boss.previewDashPath = null;
            boss.lastDashPath = null;
            boss.pattern4Runtime = null;
            boss.majorPattern2Runtime = null;
            boss.majorPattern3Runtime = null;
            boss.p2p3JumpSlashTarget = null;
            boss.kasiyasP2M2Hidden = false;
            boss.p2MajorPattern2Runtime = null;
            boss.kasiyasP1M3RushHidden = false;
            boss.actionHitFired = false;
            boss.actionHitsDone = 0;
            boss.actionCycleTimer = 0;
        });
        if (gameState.player) {
            gameState.player.kasiyasOniMark = null;
            gameState.player.kasiyasTemperedBladeReady = false;
            gameState.player.kasiyasApostleEnergies = [];
            gameState.player.kasiyasApostleGuardBuffs = [];
        }
        if (typeof this.pushBossDebugLog === 'function') {
            this.pushBossDebugLog(gameState, 'DEATH_CLEANUP', '카시야스 사망 정리', 'all pattern objects/hitboxes/effects cleared');
        }
    },

    clearKasiyasP2Pattern3Runtime: function(gameState, options = {}) {
        if (!gameState) return;
        const removeObjectIds = new Set(['252003', '252004', '252005', '252006', '252007', '252008', '252009']);
        const removeActionIds = new Set(['242014', '242015', '242016', '242017', '242018', '242019', '242020', '242021', '242022', '242023', '242024', '242025']);
        const removedObjects = new Set();

        if (Array.isArray(gameState.bossAttackObjects)) {
            gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => {
                if (!obj) return false;
                const data = obj.data || {};
                const objectId = String(data.Object_ID || data.Attack_Object_ID || obj.objectId || '').trim();
                const objectName = String(data.Object_Name || obj.name || '').trim();
                const objectType = String(obj.objectType || data.Object_Type || '').trim().toUpperCase();
                const sourcePatternId = String(obj.sourcePatternId || '').trim();
                const isP2Pattern3Object =
                    sourcePatternId === '232003' ||
                    removeObjectIds.has(objectId) ||
                    objectName.indexOf('페이즈2_기본패턴3') >= 0 ||
                    (obj.kind === 'terrain' && (objectType.indexOf('TERRAIN_') === 0 || objectType === 'TERRAIN_COLLAPSE_HIT'));
                if (isP2Pattern3Object) {
                    obj.active = false;
                    removedObjects.add(obj);
                    return false;
                }
                return true;
            });
        }

        if (Array.isArray(gameState.hitboxes)) {
            // 2페이즈 기본패턴3 종료 직후의 남은 충돌/공격 디버그 박스가 실제 피해 판정처럼 남지 않도록 정리한다.
            gameState.hitboxes = gameState.hitboxes.filter(hb => {
                if (!hb) return false;
                const sourceObject = hb.sourceObject || null;
                const sourceObjectId = String(hb.sourceObjectId || '').trim();
                const sourceActionId = String(hb.sourceActionId || '').trim();
                if (sourceObject && removedObjects.has(sourceObject)) return false;
                if (removeObjectIds.has(sourceObjectId)) return false;
                if (removeActionIds.has(sourceActionId)) return false;
                // 패턴 종료/REMOVE_ALL_OBJECT 타이밍에는 hitbox 수명이 매우 짧은 디버그/잔여 판정이 섞이므로,
                // 232003 정리에서는 남은 히트박스를 전부 비워도 다음 패턴 판정에는 영향이 없다.
                if (options.clearAllHitboxes !== false) return false;
                return true;
            });
        }

        if (Array.isArray(gameState.effects)) {
            gameState.effects = gameState.effects.filter(eff => {
                if (!eff) return false;
                const sourceObject = eff.sourceObject || null;
                const sourceObjectId = String(eff.sourceObjectId || '').trim();
                const sourceActionId = String(eff.sourceActionId || '').trim();
                const type = String(eff.type || '').trim();
                const renderType = String(eff.renderType || eff.warningRenderType || '').trim().toUpperCase();
                if (sourceObject && removedObjects.has(sourceObject)) return false;
                if (removeObjectIds.has(sourceObjectId)) return false;
                if (removeActionIds.has(sourceActionId)) return false;
                if (type === 'kasiyasP2GroundSwords' || type === 'kasiyasP2PutSword' || type === 'kasiyasP2JumpTrail' || type === 'terrainCollapsePlayerFall') return false;
                if (renderType.indexOf('P2_GROUND') >= 0 || renderType.indexOf('TERRAIN') >= 0 || renderType.indexOf('DOUBLE_EDGED_SWORD_JUMP_SLASH') >= 0) return false;
                return true;
            });
        }

        const bosses = Array.isArray(gameState.monsters) ? gameState.monsters : [];
        bosses.forEach(m => {
            if (!m || !m.boss) return;
            const boss = m.boss;
            boss.p2p3JumpSlashTarget = null;
            if (String(boss.activePattern && boss.activePattern.Pattern_ID || '').trim() === '232003' || options.forceResetBossState) {
                boss.currentDashPath = null;
                boss.previewDashPath = null;
                boss.actionMove = null;
                boss.actionHitFired = false;
                boss.actionHitsDone = 0;
                boss.actionCycleTimer = 0;
            }
        });

        if (typeof this.pushBossDebugLog === 'function') {
            this.pushBossDebugLog(gameState, 'OBJECT', '232003 페이즈2_기본패턴3 정리', 'terrain/object/hitbox/effect cleanup');
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

        if (spawnPlace === 'PLACE_ATK_HITBOX_CENTER' || spawnPlace === 'PLACE_ATTACK_HITBOX_CENTER') {
            let hb = null;
            if (typeof this.getBossPatternActionHitbox === 'function') {
                hb = this.getBossPatternActionHitbox(m, action);
            }
            const centerX = hb && Number.isFinite(parseFloat(hb.x)) ? parseFloat(hb.x) : (parseFloat(m && m.x) || 0);
            const centerY = hb && Number.isFinite(parseFloat(hb.y)) ? parseFloat(hb.y) : (parseFloat(m && m.y) || 0);
            const centerZ = hb && Number.isFinite(parseFloat(hb.z)) ? parseFloat(hb.z) : (parseFloat(m && m.z) || 0);
            for (let i = 0; i < count; i++) {
                positions.push({
                    x: Math.max(35, Math.min(gameState.WORLD_WIDTH - 35, centerX)),
                    y: Math.max(20, Math.min(gameState.WORLD_DEPTH - 20, centerY)),
                    z: centerZ,
                    cornerKey: 'ATK_HITBOX_CENTER',
                    slotKey: 'ATK_HITBOX_CENTER'
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


    isBossObjectInlineActionWarningEnabled: function(action) {
        const type = String(action && action.Action_Type || '').trim().toUpperCase();
        if (type !== 'ATK') return false;
        const warningType = String(action && action.Warning_Render_Type || '').trim().toUpperCase();
        return !!warningType && warningType !== 'NONE' && warningType !== 'NULL';
    },

    getBossObjectInlineActionWarningWindow: function(obj, action, gameState) {
        const hitWindow = (typeof this.getBossObjectActionHitWindow === 'function') ? this.getBossObjectActionHitWindow(obj, action) : { start: parseFloat(action && action.Hitbox_Start_Time) || 0 };
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

    clearBossObjectInlineActionWarning: function(obj, action, gameState) {
        if (!gameState || !Array.isArray(gameState.effects) || !action) return;
        const actionId = String(action.Object_Action_ID || '').trim();
        gameState.effects = gameState.effects.filter(e => !(e && e.inlineObjectActionWarning && e.sourceObject === obj && String(e.sourceActionId || '').trim() === actionId));
    },

    updateBossObjectInlineActionWarning: function(obj, action, gameState) {
        if (!obj || !action || !gameState || !Array.isArray(gameState.effects)) return;
        const actionId = String(action.Object_Action_ID || '').trim();
        // 분신/오브젝트는 이동 보정이나 시선 보정으로 히트박스가 바뀔 수 있어 매 프레임 재배치한다.
        this.clearBossObjectInlineActionWarning(obj, action, gameState);
        if (!this.isBossObjectInlineActionWarningEnabled(action)) return;

        const warningType = String(action.Warning_Render_Type || '').trim().toUpperCase();
        const win = this.getBossObjectInlineActionWarningWindow(obj, action, gameState);
        const timer = Math.max(0, parseFloat(obj.actionTimer) || 0);
        if (win.end <= win.start || timer < win.start || timer >= win.end) return;

        const hitbox = (typeof this.getBossObjectActionHitbox === 'function') ? this.getBossObjectActionHitbox(obj, action) : null;
        if (!hitbox) return;
        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        const duration = Math.max(0.06, win.end - timer + 0.02);
        const progress = Math.max(0, Math.min(1, (timer - win.start) / Math.max(0.001, win.end - win.start)));

        if (warningType === 'WARNING_HITBOX' || warningType === 'EFT_WARNING_HITBOX') {
            gameState.effects.push({
                type: 'warning',
                renderType: 'WARNING_HITBOX',
                warningRenderType: 'WARNING_HITBOX',
                inlineObjectActionWarning: true,
                sourceObject: obj,
                sourceObjectId: String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim(),
                sourceActionId: actionId,
                x: hitbox.x,
                y: hitbox.y,
                // 전조 표시는 지면 투영만 사용한다. z/h는 정렬용 메타값으로만 보존한다.
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

            if (moveDirection === 'MOVE_RIGHT_EDGE_TO_LEFT_EDGE') {
                const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
                const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
                const wallW = Math.max(80, parseFloat(action.Hitbox_Size_X) || parseFloat(obj.w) || 150);
                obj.x = worldW + wallW * 0.72;
                obj.y = worldD / 2;
                obj.prevX = obj.x;
                obj.prevY = obj.y;
                targetX = -wallW * 0.72;
                targetY = worldD / 2;
                obj.faceDir = -1;
                obj.p2m2SwordWallMove = true;
            } else if (moveDirection === 'TO_PLAYER_AT_SPAWN' || moveDirection === 'TARGET_PLAYER_SNAPSHOT') {
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

            const isFixedTargetMove = moveDirection === 'MOVE_RIGHT_EDGE_TO_LEFT_EDGE' || moveDirection === 'OPPOSITE_OF_OWNER_NEXT_DIAGONAL' || (typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(moveDirection)) || stopType === 'STOP_AT_TARGET';
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

            if (action.VFX_Type && String(action.VFX_Type || '').trim().toUpperCase().indexOf('EFT_P2_M2_SWORD_WALL') < 0) {
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
            const renderType = String(action.VFX_Type || 'EFT_AFTERIMAGE_DISAPPEAR').trim().toUpperCase();
            const isSwordStormDisappear = renderType === 'EFT_SWORD_STORM_DISAPPEAR';
            gameState.effects.push({
                type: isSwordStormDisappear ? 'swordStormDisappear' : 'afterimageDisappear',
                renderType: renderType,
                apostle: String(obj && obj.renderType || obj && obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase().indexOf('APOSTLE') >= 0,
                x: obj.x,
                y: obj.y,
                z: obj.z + (isSwordStormDisappear ? 110 : (((obj.d && obj.d.bodyZ) || 160) * 0.55)),
                w: isSwordStormDisappear ? 250 : (((obj.d && obj.d.bodyX) || 80) * (obj.scale || 1) * 1.4),
                h: isSwordStormDisappear ? 230 : (((obj.d && obj.d.bodyZ) || 160) * (obj.scale || 1) * 0.8),
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
        obj.prevX = Number.isFinite(parseFloat(obj.x)) ? parseFloat(obj.x) : 0;
        obj.prevY = Number.isFinite(parseFloat(obj.y)) ? parseFloat(obj.y) : 0;

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

        const moveDirection = String(action && (action.Move_Direction || action.Action_Move_Direction) || '').trim().toUpperCase();
        if (moveDirection === 'CHASE_ENEMY' && gameState && gameState.player) {
            // 추격형 이동 오브젝트는 액션 시작 시점의 방향으로 고정하지 않고,
            // MOVE 액션 지속시간 동안 매 프레임 플레이어 위치를 다시 향해 이동한다.
            // 회오리 검풍처럼 이동 중 다단히트 판정을 가진 오브젝트가
            // 플레이어가 서 있던 자리만 통과하지 않고 계속 따라붙도록 하기 위한 처리다.
            const rawTargetX = parseFloat(gameState.player.x);
            const rawTargetY = parseFloat(gameState.player.y);
            const targetX = Number.isFinite(rawTargetX) ? rawTargetX : obj.x;
            const targetY = Number.isFinite(rawTargetY) ? rawTargetY : obj.y;
            let dx = targetX - obj.x;
            let dy = targetY - obj.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 0;
            if (len > 0.001) {
                dx /= len;
                dy /= len;
                const ownerSpeed = obj.owner && obj.owner.d ? (parseFloat(obj.owner.d.speed) || 0) : 0;
                const rate = parseFloat(action.Move_Speed_Rate || action.Action_Move_Speed_Rate) || 1;
                const rawYRate = parseFloat(action.Y_Axis_Move_Speed_Rate || action.Action_Y_Axis_Move_Speed_Rate);
                // Y_Axis_Move_Speed_Rate는 X축 속도는 유지하면서 Y축 추격만 늦추기 위한 보정값이다.
                // 예: Move_Speed_Rate=0.8, Y_Axis_Move_Speed_Rate=0.6이면
                // X축은 0.8배, Y축은 0.8*0.6배 체감으로 이동한다. 이후 재정규화하지 않는다.
                const yAxisRate = Number.isFinite(rawYRate) && rawYRate >= 0 ? rawYRate : 1;
                const speed = Math.max(1, ownerSpeed * rate);
                const step = Math.min(len, speed * Math.max(0, deltaTime || 0));
                const moveX = dx * step;
                const moveY = dy * step * yAxisRate;
                obj.x += moveX;
                obj.y += moveY;
                obj.moveDirX = dx;
                obj.moveDirY = dy * yAxisRate;
                if (Math.abs(dx) > 0.001) obj.faceDir = dx >= 0 ? 1 : -1;
                this.applyBossObjectActionGaze(obj, action, gameState, dx);
            }
            obj.x = Math.max(0, Math.min(gameState.WORLD_WIDTH, obj.x));
            obj.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, obj.y));
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

        if (objectType === 'GIANT_SWORD_TRACE') {
            BossObjectSystem.createKasiyasP3GiantSwordTraceObject.call(this, objectId, gameState, m, { sourceAction: action });
            return;
        }

        if (objectType === 'SPACE_DISTORTION' || objectType === 'SPACE_BURST' || objectType === 'TERRAIN_BLOCK' || objectType === 'DIMENSION_CRACK' || objectType === 'DIMENSION_CRACK_BURST') {
            const positions = this.resolveBossObjectSpawnPositions(m, objData, action, gameState, spawnCount);
            positions.forEach((pos, spawnIndex) => {
                BossObjectSystem.createKasiyasP3SpaceObject.call(this, objectId, gameState, m, { x: pos.x, y: pos.y, z: pos.z || 0, sourceAction: action });
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT',
                    `${objectId} ${this.getBossDebugName(objData)}`,
                    `type ${objectType}, ${spawnIndex + 1}/${positions.length}`
                );
            });
            return;
        }

        if (objectType === 'DIMENSION_PORTAL' || objectType === 'FALLING_SWORD_RAIN') {
            const positions = this.resolveBossObjectSpawnPositions(m, objData, action, gameState, spawnCount);
            if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];
            positions.forEach((pos, spawnIndex) => {
                const renderType = String(objData.Object_Render_Type || '').trim().toUpperCase();
                const explicitDuration = parseFloat(objData.Object_Internal_Duration || objData.Object_Duration || objData.Object_Max_Life);
                const actionDuration = parseFloat(action.Action_Anim_Duration || action.Duration);
                const maxLife = Math.max(0.1, (!isNaN(explicitDuration) && explicitDuration > 0 ? explicitDuration : ((!isNaN(actionDuration) && actionDuration > 0) ? actionDuration : (objectType === 'DIMENSION_PORTAL' ? 3.8 : 2.0))));
                const owner = (m && m.owner) ? m.owner : m;
                if (objectType === 'DIMENSION_PORTAL') {
                    gameState.bossAttackObjects.push({
                        kind: 'dimensionPortal',
                        owner: owner,
                        sourceCaster: m,
                        data: objData,
                        active: true,
                        x: pos.x,
                        y: pos.y,
                        z: 0,
                        timer: 0,
                        maxLife: maxLife,
                        renderType: renderType || 'OBJ_DIMENSION_PORTAL',
                        objectType: objectType,
                        objectGroup: String(objData.Object_Group || '').trim(),
                        slotKey: pos.slotKey || pos.cornerKey || ''
                    });
                    const isP2M2GiantPortal = String(renderType || objData.Object_Render_Type || '').trim().toUpperCase() === 'OBJ_P2_M2_GIANT_DIMENSION_PORTAL'
                        || String(renderType || objData.Object_Render_Type || '').trim().toUpperCase() === 'OBJ_GIANT_DIMENSION_PORTAL';
                    if (gameState.effects && !isP2M2GiantPortal) {
                        gameState.effects.push({
                            type: 'dimensionPortalOpen',
                            renderType: objData.VFX_Type || 'EFT_DIMENSION_PORTAL',
                            x: pos.x,
                            y: pos.y,
                            z: 210,
                            w: 520,
                            h: 170,
                            life: Math.min(0.75, maxLife),
                            maxLife: Math.min(0.75, maxLife),
                            durationHint: maxLife
                        });
                    }
                } else {
                    const warningDuration = Math.max(0.08, parseFloat(objData.Warning_Duration) || 0.45);
                    const hitboxDelayTime = Math.max(0, parseFloat(objData.Hitbox_Delay_Time) || 0);
                    const hitDuration = Math.max(0.05, parseFloat(objData.Hitbox_Duration) || 0.14);
                    const spawnIntervalRaw = parseFloat(objData.Object_Spawn_Interval || objData.Object_Late_Spawn_Interval || objData.Spawn_Interval);
                    const spawnStartRaw = parseFloat(objData.Object_Spawn_Start_Time || objData.Object_Late_Duration_Start_Time || objData.Spawn_Start_Time);
                    const spawnInterval = Math.max(0.05, Math.min(1.5, (!isNaN(spawnIntervalRaw) && spawnIntervalRaw > 0) ? spawnIntervalRaw : 0.16));
                    const spawnStartTime = Math.max(0, (!isNaN(spawnStartRaw) && spawnStartRaw >= 0) ? spawnStartRaw : 0.02);
                    gameState.bossAttackObjects.push({
                        kind: 'fallingSwordRain',
                        owner: owner,
                        sourceCaster: m,
                        data: objData,
                        active: true,
                        x: pos.x,
                        y: pos.y,
                        z: 0,
                        timer: 0,
                        maxLife: maxLife,
                        spawnTimer: spawnStartTime,
                        spawnInterval: spawnInterval,
                        warningDuration: warningDuration,
                        hitboxDelayTime: hitboxDelayTime,
                        hitDuration: hitDuration,
                        swords: [],
                        renderType: renderType || 'OBJ_DIMENSION_PORTAL_SWORD_RAIN',
                        objectType: objectType,
                        objectGroup: String(objData.Object_Group || '').trim(),
                        slotKey: pos.slotKey || pos.cornerKey || '',
                        swordSpawnedCount: 0
                    });
                }
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT',
                    `${objectId} ${this.getBossDebugName(objData)}`,
                    `type ${objectType}, ${spawnIndex + 1}/${positions.length}, duration ${maxLife.toFixed(2)}s`
                );
            });
            return;
        }

        if (objectType === 'SWORD_WAVE' || objectType === 'GIANT_SWORD_WAVE') {
            const positions = this.resolveBossObjectSpawnPositions(m, objData, action, gameState, spawnCount);
            if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];
            const owner = (m && m.owner) ? m.owner : m;
            positions.forEach((pos, spawnIndex) => {
                const dir = (m && m.faceDir === -1) ? -1 : 1;
                const scale = parseFloat(m && m.scale) || 1;
                const bodyX = ((m && m.d && parseFloat(m.d.bodyX)) || 80) * scale;
                const bodyZ = ((m && m.d && parseFloat(m.d.bodyZ)) || 160) * scale;
                const speedRaw = parseFloat(objData.Object_Move_Speed || objData.Move_Speed);
                const baseSpeed = owner && owner.d ? (parseFloat(owner.d.speed) || 260) : 260;
                const speed = (!isNaN(speedRaw) && speedRaw > 0) ? baseSpeed * speedRaw : baseSpeed * 2.4;
                gameState.bossAttackObjects.push({
                    kind: 'swordWave',
                    owner: owner,
                    sourceCaster: m,
                    data: objData,
                    active: true,
                    x: pos.x + dir * Math.max(40, bodyX * 0.25),
                    y: pos.y,
                    z: Math.max(18, (parseFloat(m && m.z) || 0) + bodyZ * 0.36),
                    timer: 0,
                    maxLife: Math.max(0.25, parseFloat(objData.Object_Internal_Duration || objData.Object_Duration) || 3),
                    faceDir: dir,
                    moveDirX: dir,
                    moveDirY: 0,
                    moveSpeed: speed,
                    renderType: objData.Object_Render_Type || (objectType === 'GIANT_SWORD_WAVE' ? 'OBJ_P3_GIANT_SWORD_WAVE' : 'OBJ_CROSS_SWORD_WAVE'),
                    objectType: objectType,
                    sourceAction: action,
                    objectGroup: String(objData.Object_Group || '').trim(),
                    w: Math.max(40, parseFloat(objData.Hitbox_Size_X) || 200),
                    d: Math.max(30, parseFloat(objData.Hitbox_Size_Y) || 150),
                    h: Math.max(40, parseFloat(objData.Hitbox_Size_Z) || 200),
                    hitDuration: Math.max(0.05, parseFloat(objData.Hitbox_Duration) || parseFloat(objData.Object_Internal_Duration) || 3),
                    hitsDone: 0,
                    cycleTimer: 999,
                    hitTargets: new Map()
                });
                this.pushBossDebugLog(gameState, 'OBJECT', `${objectId} ${this.getBossDebugName(objData)}`, `type ${objectType}, ${spawnIndex + 1}/${positions.length}`);
            });
            return;
        }

        if (objectType === 'PLAYER_MARK') {
            this.applyKasiyasOniMarkFromObject((m && m.owner) ? m.owner : m, objData, gameState);
            return;
        }

        if (objectType.indexOf('TERRAIN_') === 0) {
            const rect = this.getTerrainAreaRect(objData, gameState);
            const safeRect = this.getTerrainSafeRect(objData, gameState);
            const renderType = String(objData.Object_Render_Type || '').trim().toUpperCase();
            if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];
            const terrain = {
                kind: 'terrain',
                owner: (m && m.owner) ? m.owner : m,
                sourceCaster: m,
                sourcePatternId: String(action.Pattern_ID || (m && m.boss && m.boss.activePattern && m.boss.activePattern.Pattern_ID) || '').trim(),
                data: objData,
                active: true,
                x: rect.centerX,
                y: rect.centerY,
                z: 0,
                timer: 0,
                maxLife: objectType === 'TERRAIN_COLLAPSE' ? 1.1 : 9999,
                renderType: renderType,
                objectType: objectType,
                objectGroup: String(objData.Object_Group || '').trim(),
                terrainArea: rect,
                safeArea: safeRect,
                actions: Array.isArray(objData.Runtime_Actions) ? [...objData.Runtime_Actions] : []
            };
            gameState.bossAttackObjects.push(terrain);
            if (objectType === 'TERRAIN_COLLAPSE' || objectType === 'TERRAIN_COLLAPSE_HIT') {
                this.applyTerrainCollapseHit(terrain, gameState);
            }
            this.pushBossDebugLog(
                gameState,
                'OBJECT',
                `${objectId} ${this.getBossDebugName(objData)}`,
                `type ${objectType}, area ${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.w)}x${Math.round(rect.h)}`
            );
            return;
        }

        if (objectType === 'OBJECT_SWORD') {
            const positions = this.resolveBossObjectSpawnPositions(m, objData, action, gameState, spawnCount);
            if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];
            positions.forEach((pos, spawnIndex) => {
                const renderType = String(objData.Object_Render_Type || '').trim().toUpperCase();
                const effectValue = String(this.getBossObjectDataField(objData, ['Object_Interact_Effect_Value', 'Object_Get_Effect_Value'], '')).trim().toUpperCase();
                const interactRange = this.getBossObjectInteractRange(objData, { x: 120, y: 80, z: 0 });
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
                    maxLife: Math.max(18, parseFloat(objData.Object_Max_Life || objData.Object_Internal_Duration) || 26),
                    renderType: renderType || 'OBJ_RED_ENERGY_SWORD',
                    objectGroup: String(objData.Object_Group || '').trim(),
                    getType: String(this.getBossObjectDataField(objData, ['Object_Interact_Type', 'Object_Get_Type'], '')).trim().toUpperCase(),
                    getEffect: String(this.getBossObjectDataField(objData, ['Object_Interact_Effect', 'Object_Get_Effect'], '')).trim().toUpperCase(),
                    getEffectValue: effectValue,
                    interactCond: String(this.getBossObjectDataField(objData, ['Object_Interact_Cond', 'Object_Get_Cond'], '')).trim().toUpperCase(),
                    interactResultType: String(this.getBossObjectDataField(objData, ['Object_Interact_Result_Type'], '')).trim().toUpperCase(),
                    interactResultValue: String(this.getBossObjectDataField(objData, ['Object_Interact_Result_Value'], '')).trim(),
                    getRangeX: interactRange.x,
                    getRangeY: interactRange.y,
                    getRangeZ: interactRange.z,
                    afterGetType: String(this.getBossObjectDataField(objData, ['Object_After_Interact_Type', 'Object_After_Get_Type'], '')).trim().toUpperCase(),
                    interactCount: 0,
                    maxInteractLimit: this.getBossObjectInteractMaxLimit(objData, 2)
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
                    getType: String(this.getBossObjectDataField(objData, ['Object_Interact_Type', 'Object_Get_Type'], '')).trim().toUpperCase(),
                    getEffect: String(this.getBossObjectDataField(objData, ['Object_Interact_Effect', 'Object_Get_Effect'], '')).trim().toUpperCase(),
                    getEffectValue: parseFloat(this.getBossObjectDataField(objData, ['Object_Interact_Effect_Value', 'Object_Get_Effect_Value'], 0)) || 0
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

        if (objectType === 'INTERACT_OBJECT' || objectType === 'AIMING_OBJECT' || objectType === 'FIRE_OBJECT') {
            const positions = this.resolveBossObjectSpawnPositions(m, objData, action, gameState, spawnCount);
            positions.forEach(pos => {
                this.createKasiyasP2M2SpecialObject(objectId, gameState, m, { x: pos.x, y: pos.y, z: parseFloat(m && m.z) || 0 });
            });
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
                    objectType: objectType,
                    w: Math.max(40, parseFloat(objData.Hitbox_Size_X) || 150),
                    d: Math.max(30, parseFloat(objData.Hitbox_Size_Y) || 400),
                    h: Math.max(40, parseFloat(objData.Hitbox_Size_Z) || 400),
                    p2m2SwordWall: objectType === 'SWORD_WALL' || objectType === 'SWORD_WALL_GIANT_SWORD' || String(objData.Object_Render_Type || '').toUpperCase().indexOf('P2_M2_SWORD_WALL') >= 0,
                    objectMaxHp: (Number.isFinite(parseFloat(objData.Object_HP)) && parseFloat(objData.Object_HP) > 0) ? parseFloat(objData.Object_HP) : null,
                    objectHp: (Number.isFinite(parseFloat(objData.Object_HP)) && parseFloat(objData.Object_HP) > 0) ? parseFloat(objData.Object_HP) : null,
                    objectDefenceType: String(objData.Object_Defence_Type || '').trim().toUpperCase(),
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

        const pathSource = m.boss ? (m.boss.currentDashPath || m.boss.previewDashPath || m.boss.lastDashPath) : null;
        const path = pathSource ? { ...pathSource } : null;
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
        const renderType = objData.VFX_Type || objData.Effect_Render_Type || (String(objData.Object_Render_Type || '').trim().toUpperCase() === 'OBJ_PATH_ONI_SLASH_BURST' ? 'EFT_KASIYAS_PATH_ONI_SLASH_LINES' : 'EFT_KASIYAS_PATH_SLASH_LINES');

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
            // 잔류 검격은 pathDelayed 오브젝트가 직접 시각/판정 시퀀스를 관리한다.
            // timer < warningDuration: 돌진 진행률에 맞춰 잔류 검격 순차 생성
            // warningDuration 이후 delay: 생성된 검격 유지/맥동
            // hitStart 이후: 같은 검격이 폭발하며 판정 발생
            visualLinked: useLinkedResidualField,
            residualFieldPushed: false,
            renderType: renderType,
            trailFragments: useLinkedResidualField ? [] : [],
            trailNextT: 0.08,
            active: true
        });

        if (!useLinkedResidualField) {
            this.pushPathWarningEffect(path, width, Math.max(0.05, warningDuration), objData.Warning_Render_Type || 'WARNING_SLASH_PATH', gameState);
        }

        this.pushBossDebugLog(
            gameState,
            'OBJECT',
            `${objectId} ${this.getBossDebugName(objData)}`,
            warningDurationType === 'REF_OWNER_ACTION_DURATION'
                ? `linked to owner action ${(warningDuration || 0).toFixed(2)}s, delay ${Math.max(0, parseFloat(objData.Hitbox_Delay_Time) || 0).toFixed(2)}s, hits ${parseInt(objData.Object_ATK_Hit_Count || objData.ATK_Hit_Count) || 1}`
                : `warning ${warningDuration.toFixed(2)}s, delay ${Math.max(0, parseFloat(objData.Hitbox_Delay_Time) || 0).toFixed(2)}s, hits ${parseInt(objData.Object_ATK_Hit_Count || objData.ATK_Hit_Count) || 1}`
        );
    },

    isBossObjectGetInputActive: function(obj, gameState) {
        const getType = this.getBossObjectInteractType(obj);
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
            if (!obj || !obj.active || (obj.kind !== 'interactiveSword' && obj.kind !== 'interactObject')) continue;
            if (obj.disabled || obj.absorbed) continue;
            if (!this.isBossObjectInteractionConditionMet(obj, gameState)) continue;
            const limit = Math.max(1, parseInt(obj.maxInteractLimit) || 1);
            if ((parseInt(obj.interactCount) || 0) >= limit) continue;
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
            if (obj && (obj.kind === 'interactiveSword' || obj.kind === 'interactObject')) obj.nearestInteractTarget = false;
        }
        const nearest = this.getNearestBossInteractiveSword(gameState);
        if (nearest) nearest.nearestInteractTarget = true;
        return nearest;
    },

    consumeBossInteractiveSword: function(obj, objects, gameState) {
        if (!obj || !objects) return false;
        if (!this.isBossObjectInteractionConditionMet(obj, gameState)) return false;
        const resultType = String(obj.interactResultType || obj.data && obj.data.Object_Interact_Result_Type || '').trim().toUpperCase();
        const resultValue = String(obj.interactResultValue || obj.data && obj.data.Object_Interact_Result_Value || '').trim();
        let handled = false;
        if (resultType === 'START_NEXT_OBJECT_INTERACT' && resultValue) {
            handled = !!this.createKasiyasP2M2SpecialObject(resultValue, gameState, obj, { x: obj.x, y: obj.y, z: obj.z });
        } else if (resultType === 'FIRE_OBJECT' && resultValue) {
            handled = !!this.createKasiyasP2M2SpecialObject(resultValue, gameState, obj, { x: obj.x, y: obj.y, z: obj.z, angle: obj.aimAngle, fireSpeed: obj.aimFireSpeed });
        } else {
            handled = this.applyBossObjectGetEffect(obj, gameState);
        }
        if (!handled) return false;
        obj.interactCount = (parseInt(obj.interactCount) || 0) + 1;
        obj.absorbed = true;
        obj.canInteract = false;
        obj.nearestInteractTarget = false;
        const afterType = this.getBossObjectInteractAfterType(obj);
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

    restoreKasiyasP2M2BrokenGiantSwordAfterAimCancel: function(obj, objects, gameState) {
        if (!obj || !objects) return null;
        let broken = obj.sourceObject || null;
        const isBroken = (target) => {
            if (!target) return false;
            const data = target.data || {};
            const id = String(data.Object_ID || target.objectId || '').trim();
            const rt = String(data.Object_Render_Type || target.renderType || '').toUpperCase();
            return id === '252021' || rt.indexOf('P2_M2_BROKEN_GIANT_SWORD') >= 0;
        };
        if (!isBroken(broken) || objects.indexOf(broken) < 0) {
            broken = null;
            for (const cand of objects) {
                if (isBroken(cand)) {
                    broken = cand;
                    break;
                }
            }
        }
        if (broken) {
            broken.active = true;
            broken.disabled = false;
            broken.absorbed = false;
            broken.canInteract = false;
            broken.nearestInteractTarget = false;
            broken.interactCount = 0;
            broken.interactPulse = 0;
            const data = broken.data || {};
            broken.getType = String(this.getBossObjectDataField(data, ['Object_Interact_Type', 'Object_Get_Type'], '')).trim().toUpperCase();
            broken.getEffect = String(this.getBossObjectDataField(data, ['Object_Interact_Effect', 'Object_Get_Effect'], '')).trim().toUpperCase();
            broken.getEffectValue = String(this.getBossObjectDataField(data, ['Object_Interact_Effect_Value', 'Object_Get_Effect_Value'], '')).trim();
            broken.interactCond = String(this.getBossObjectDataField(data, ['Object_Interact_Cond', 'Object_Get_Cond'], '')).trim().toUpperCase();
            broken.interactResultType = String(this.getBossObjectDataField(data, ['Object_Interact_Result_Type'], '')).trim().toUpperCase();
            broken.interactResultValue = String(this.getBossObjectDataField(data, ['Object_Interact_Result_Value'], '')).trim();
            broken.afterGetType = String(this.getBossObjectDataField(data, ['Object_After_Interact_Type', 'Object_After_Get_Type'], '')).trim().toUpperCase();
            return broken;
        }
        return this.createKasiyasP2M2SpecialObject('252021', gameState, obj, { x: obj.x, y: obj.y, z: 0 });
    },


    removeKasiyasP2M2BrokenGiantSwordObjectsAfterFire: function(objects, gameState) {
        if (!Array.isArray(objects)) return 0;
        let removed = 0;
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (!obj) continue;
            const data = obj.data || {};
            const id = String(data.Object_ID || obj.objectId || '').trim();
            const rt = String(data.Object_Render_Type || obj.renderType || '').toUpperCase();
            const isBroken = id === '252021' || rt.indexOf('P2_M2_BROKEN_GIANT_SWORD') >= 0;
            const isAiming = id === '252022' || obj.kind === 'aimingObject' || rt.indexOf('P2_M2_AIMING_GIANT_SWORD') >= 0;
            if (!isBroken && !isAiming) continue;
            obj.active = false;
            obj.disabled = true;
            obj.absorbed = true;
            objects.splice(i, 1);
            removed++;
        }
        if (gameState) {
            gameState.p2m2GiantSwordAim = null;
        }
        return removed;
    },

    cancelKasiyasP2M2GiantSwordAim: function(obj, objects, gameState) {
        if (!obj || !objects) return false;
        this.restoreKasiyasP2M2BrokenGiantSwordAfterAimCancel(obj, objects, gameState);
        obj.active = false;
        obj.disabled = true;
        if (gameState) {
            gameState.p2m2GiantSwordAim = null;
            gameState.p2m2GiantSwordInputBlockTimer = Math.max(parseFloat(gameState.p2m2GiantSwordInputBlockTimer) || 0, 0.16);
            gameState.p2m2GiantSwordInputConsumed = { KeyX: !!(gameState.keys && gameState.keys.KeyX), KeyZ: !!(gameState.keys && gameState.keys.KeyZ), Space: !!(gameState.keys && gameState.keys.Space), KeyC: !!(gameState.keys && gameState.keys.KeyC), ArrowLeft: !!(gameState.keys && gameState.keys.ArrowLeft), ArrowRight: !!(gameState.keys && gameState.keys.ArrowRight) };
        }
        const idx = objects.indexOf(obj);
        if (idx >= 0) objects.splice(idx, 1);
        if (gameState && gameState.floatingTexts) {
            gameState.floatingTexts.push({
                x: obj.x,
                y: obj.y,
                z: (parseFloat(obj.z) || 0) + Math.max(70, (parseFloat(obj.h) || 180) * 0.55),
                text: '조준 취소',
                color: '#d7e5ff',
                size: '18px',
                timer: 0.45,
                isBubble: false
            });
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

        const effect = this.getBossObjectInteractEffect(obj);
        if (effect !== 'GET_APOSTLE_ENERGY') return false;

        const value = this.getBossObjectInteractEffectValue(obj).toUpperCase();
        if (!value) return false;

        p.kasiyasApostleEnergies = Array.isArray(p.kasiyasApostleEnergies) ? p.kasiyasApostleEnergies : [];
        p.kasiyasApostleGuardBuffs = Array.isArray(p.kasiyasApostleGuardBuffs) ? p.kasiyasApostleGuardBuffs : [];

        const data = obj.data || {};
        const maxLimit = this.getBossObjectInteractMaxLimit(data, 2);
        const buffType = String(this.getBossObjectDataField(data, ['Object_Interact_Player_Buff_Type', 'Object_Get_Player_Buff_Type'], '')).trim().toUpperCase();
        const buffValueRaw = parseFloat(this.getBossObjectDataField(data, ['Object_Interact_Player_Buff_Value', 'Object_Get_Player_Buff_Value'], 0));
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


    clearKasiyasP2MajorPattern2Runtime: function(gameState, options = {}) {
        if (!gameState) return;
        const removeObjects = options.removeObjects !== false;
        const keepProgressObjects = !!options.keepProgressObjects;
        if (removeObjects && Array.isArray(gameState.bossAttackObjects)) {
            gameState.bossAttackObjects.forEach(obj => {
                if (!obj) return;
                const data = obj.data || {};
                const patternId = String(data.Pattern_ID || obj.sourcePatternId || '').trim();
                const objType = String(obj.objectType || data.Object_Type || '').trim().toUpperCase();
                const renderType = String(obj.renderType || data.Object_Render_Type || '').trim().toUpperCase();
                const objId = String(data.Object_ID || obj.objectId || '').trim();
                const isProgressObject = objId === '252021' || objId === '252022' || objId === '252023' || objType === 'INTERACT_OBJECT' || objType === 'AIMING_OBJECT' || objType === 'FIRE_OBJECT' || renderType.indexOf('P2_M2_BROKEN_GIANT_SWORD') >= 0 || renderType.indexOf('P2_M2_AIMING_GIANT_SWORD') >= 0 || renderType.indexOf('P2_M2_FIRE_GIANT_SWORD') >= 0;
                if (keepProgressObjects && isProgressObject) return;
                if (patternId === '232007' || objType === 'SWORD_WALL' || objType === 'SWORD_WALL_GIANT_SWORD' || isProgressObject || renderType.indexOf('P2_M2_SWORD_WALL') >= 0 || renderType === 'OBJ_GIANT_DIMENSION_PORTAL' || objId === '252014') {
                    obj.active = false;
                }
            });
            gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => obj && obj.active);
        }
        if (Array.isArray(gameState.hitboxes)) {
            gameState.hitboxes = gameState.hitboxes.filter(hb => {
                if (!hb) return false;
                const sid = String(hb.sourceObjectId || '').trim();
                const aid = String(hb.sourceActionId || '').trim();
                if (sid >= '252014' && sid <= '252023') return false;
                if (aid >= '262009' && aid <= '262026') return false;
                return true;
            });
        }
        if (Array.isArray(gameState.effects)) {
            gameState.effects = gameState.effects.filter(eff => {
                if (!eff) return false;
                const renderType = String(eff.renderType || eff.warningRenderType || '').trim().toUpperCase();
                const sid = String(eff.sourceObjectId || '').trim();
                const aid = String(eff.sourceActionId || '').trim();
                if (sid >= '252014' && sid <= '252023') return false;
                if (aid >= '262009' && aid <= '262026') return false;
                if (renderType.indexOf('P2_M2_SWORD_WALL') >= 0 || renderType.indexOf('P2_M2_BROKEN_GIANT_SWORD') >= 0 || renderType.indexOf('P2_M2_AIMING_GIANT_SWORD') >= 0 || renderType.indexOf('P2_M2_FIRE_GIANT_SWORD') >= 0 || renderType === 'OBJ_GIANT_DIMENSION_PORTAL' || renderType === 'EFT_GIANT_DIMENSION_PORTAL') return false;
                return true;
            });
        }
        const bosses = Array.isArray(gameState.monsters) ? gameState.monsters : [];
        bosses.forEach(m => {
            if (!m || !m.boss) return;
            m.boss.kasiyasP2M2Hidden = false;
            m.boss.kasiyasP1M3RushHidden = false;
            m.boss.p2MajorPattern2Runtime = null;
            if (gameState) gameState.p2m2GiantSwordAim = null;
        });
        if (typeof this.pushBossDebugLog === 'function') {
            this.pushBossDebugLog(gameState, 'OBJECT', '232007 페이즈2_대형패턴2 정리', 'portal/sword wall cleanup');
        }
    },


    getKasiyasP3SpaceObjectSize: function(data, defaults = {}) {
        const hitW = parseFloat(data && data.Hitbox_Size_X);
        const hitD = parseFloat(data && data.Hitbox_Size_Y);
        const hitH = parseFloat(data && data.Hitbox_Size_Z);
        return {
            w: Math.max(20, Number.isFinite(hitW) ? hitW : (defaults.w || 250)),
            d: Math.max(20, Number.isFinite(hitD) ? hitD : (defaults.d || 150)),
            h: Math.max(20, Number.isFinite(hitH) ? hitH : (defaults.h || 120))
        };
    },

    isPlayerInsideKasiyasP3SpaceObject: function(player, obj) {
        if (!player || !obj) return false;
        const px = parseFloat(player.x) || 0;
        const py = parseFloat(player.y) || 0;
        const ox = parseFloat(obj.x) || 0;
        const oy = parseFloat(obj.y) || 0;
        const scale = parseFloat(player.scale) || 1;
        const pHalfX = Math.max(14, (parseFloat(player.bodyX) || 60) * scale * 0.35);
        const pHalfY = Math.max(12, (parseFloat(player.bodyY) || 40) * scale * 0.45);
        const w = Math.max(20, parseFloat(obj.w) || parseFloat(obj.data && obj.data.Hitbox_Size_X) || 250);
        const d = Math.max(20, parseFloat(obj.d) || parseFloat(obj.data && obj.data.Hitbox_Size_Y) || 150);
        const hitboxType = String(obj.hitboxType || obj.data && obj.data.Hitbox_Type || '').trim().toUpperCase();
        if (hitboxType === 'HITBOX_CIRCLE' || hitboxType === 'CIRCLE') {
            const rx = Math.max(1, w * 0.5 + pHalfX);
            const ry = Math.max(1, d * 0.5 + pHalfY);
            const nx = (px - ox) / rx;
            const ny = (py - oy) / ry;
            return nx * nx + ny * ny <= 1.0;
        }
        return Math.abs(px - ox) <= w * 0.5 + pHalfX
            && Math.abs(py - oy) <= d * 0.5 + pHalfY;
    },

    doesKasiyasP3SpaceObjectOverlap: function(a, b) {
        if (!a || !b) return false;
        const ax = parseFloat(a.x) || 0;
        const ay = parseFloat(a.y) || 0;
        const aw = Math.max(20, parseFloat(a.w) || parseFloat(a.data && a.data.Hitbox_Size_X) || 250);
        const ad = Math.max(20, parseFloat(a.d) || parseFloat(a.data && a.data.Hitbox_Size_Y) || 150);
        const bx = parseFloat(b.x) || 0;
        const by = parseFloat(b.y) || 0;
        const bw = Math.max(20, parseFloat(b.w) || parseFloat(b.data && b.data.Hitbox_Size_X) || 250);
        const bd = Math.max(20, parseFloat(b.d) || parseFloat(b.data && b.data.Hitbox_Size_Y) || 150);
        const at = String(a.hitboxType || a.data && a.data.Hitbox_Type || '').trim().toUpperCase();
        const bt = String(b.hitboxType || b.data && b.data.Hitbox_Type || '').trim().toUpperCase();
        if (at === 'HITBOX_CIRCLE' || bt === 'HITBOX_CIRCLE' || at === 'CIRCLE' || bt === 'CIRCLE') {
            const rx = Math.max(1, (aw + bw) * 0.50);
            const ry = Math.max(1, (ad + bd) * 0.50);
            const nx = (ax - bx) / rx;
            const ny = (ay - by) / ry;
            return nx * nx + ny * ny <= 0.86;
        }
        return Math.abs(ax - bx) <= (aw + bw) * 0.42 && Math.abs(ay - by) <= (ad + bd) * 0.42;
    },



    getKasiyasP3B5TracePaths: function(gameState, traceKey, traceWidth) {
        const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        const w = Math.max(24, parseFloat(traceWidth) || 150);
        const make = (key, x1, y1, x2, y2) => ({
            key,
            startX: x1,
            startY: y1,
            endX: x2,
            endY: y2,
            width: w,
            length: Math.hypot(x2 - x1, y2 - y1)
        });
        const paths = {
            TRACE_PATH_P3_B5_UP: make('TRACE_PATH_P3_B5_UP', worldW * 0.143, worldD * 0.925, worldW * 0.629, worldD * 0.075),
            TRACE_PATH_P3_B5_CIRCLE: make('TRACE_PATH_P3_B5_CIRCLE', worldW * 0.029, worldD * 0.635, worldW * 0.971, worldD * 0.687),
            TRACE_PATH_P3_B5_DOWN: make('TRACE_PATH_P3_B5_DOWN', worldW * 0.396, worldD * 0.075, worldW * 0.897, worldD * 0.925),
            TRACE_PATH_P3_B5_AIR: make('TRACE_PATH_P3_B5_AIR', worldW * 0.500, worldD * 0.035, worldW * 0.500, worldD * 0.965)
        };
        const key = String(traceKey || '').trim().toUpperCase();
        if (key === 'TRACE_PATH_P3_B5_PREVIOUS_ALL' || key === 'TRACE_PATH_P3_B5_ALL' || key === 'PREVIOUS_ALL') {
            return [paths.TRACE_PATH_P3_B5_UP, paths.TRACE_PATH_P3_B5_CIRCLE, paths.TRACE_PATH_P3_B5_DOWN].map(path => ({ ...path, width: w }));
        }
        const path = paths[key] || paths.TRACE_PATH_P3_B5_UP;
        return [{ ...path, width: w }];
    },

    getKasiyasP3B5TraceCenter: function(paths) {
        const list = Array.isArray(paths) ? paths : [];
        if (!list.length) return { x: 0, y: 0 };
        let sx = 0, sy = 0, n = 0;
        list.forEach(path => {
            if (!path) return;
            sx += (parseFloat(path.startX) || 0) + (parseFloat(path.endX) || 0);
            sy += (parseFloat(path.startY) || 0) + (parseFloat(path.endY) || 0);
            n += 2;
        });
        return { x: sx / Math.max(1, n), y: sy / Math.max(1, n) };
    },

    getKasiyasP3B5TraceIntersection: function(a, b) {
        if (!a || !b) return null;
        const x1 = parseFloat(a.startX) || 0;
        const y1 = parseFloat(a.startY) || 0;
        const x2 = parseFloat(a.endX) || 0;
        const y2 = parseFloat(a.endY) || 0;
        const x3 = parseFloat(b.startX) || 0;
        const y3 = parseFloat(b.startY) || 0;
        const x4 = parseFloat(b.endX) || 0;
        const y4 = parseFloat(b.endY) || 0;
        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(den) < 0.0001) return null;
        const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den;
        const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den;
        const on = (p, q) => {
            const minX = Math.min(parseFloat(p.startX) || 0, parseFloat(p.endX) || 0) - 4;
            const maxX = Math.max(parseFloat(p.startX) || 0, parseFloat(p.endX) || 0) + 4;
            const minY = Math.min(parseFloat(p.startY) || 0, parseFloat(p.endY) || 0) - 4;
            const maxY = Math.max(parseFloat(p.startY) || 0, parseFloat(p.endY) || 0) + 4;
            return q.x >= minX && q.x <= maxX && q.y >= minY && q.y <= maxY;
        };
        const p = { x: px, y: py };
        return on(a, p) && on(b, p) ? p : null;
    },

    getKasiyasP3B5TracePointDistance: function(px, py, path) {
        const x1 = parseFloat(path && path.startX) || 0;
        const y1 = parseFloat(path && path.startY) || 0;
        const x2 = parseFloat(path && path.endX) || x1;
        const y2 = parseFloat(path && path.endY) || y1;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len2 = dx * dx + dy * dy;
        let t = len2 > 0.0001 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0;
        t = Math.max(0, Math.min(1, t));
        const cx = x1 + dx * t;
        const cy = y1 + dy * t;
        return { distance: Math.hypot(px - cx, py - cy), x: cx, y: cy, t };
    },



    getKasiyasP3B5TraceScreenSegments: function(gameState, obj) {
        const paths = Array.isArray(obj && obj.tracePaths) ? obj.tracePaths : [];
        const canvas = (typeof GameRenderer !== 'undefined' && GameRenderer && GameRenderer.canvas) ? GameRenderer.canvas : null;
        const canvasW = Math.max(1, canvas && canvas.width ? canvas.width : 1600);
        const canvasH = Math.max(1, canvas && canvas.height ? canvas.height : 900);
        const canvasDiag = Math.hypot(canvasW, canvasH);
        const groundBaseY = (typeof GameRenderer !== 'undefined' && GameRenderer && Number.isFinite(parseFloat(GameRenderer.GROUND_BASE_Y))) ? parseFloat(GameRenderer.GROUND_BASE_Y) : 400;
        const cameraX = Number.isFinite(parseFloat(gameState && gameState.camera && gameState.camera.x)) ? parseFloat(gameState.camera.x) : 0;
        return paths.map(path => {
            const sx = parseFloat(path && path.startX) || 0;
            const sy = groundBaseY + (parseFloat(path && path.startY) || 0);
            const ex = parseFloat(path && path.endX) || 0;
            const ey = groundBaseY + (parseFloat(path && path.endY) || 0);
            const dx = ex - sx;
            const dy = ey - sy;
            const len = Math.max(1, Math.hypot(dx, dy));
            const nx = dx / len;
            const ny = dy / len;
            const cx = (sx + ex) * 0.5;
            const cy = (sy + ey) * 0.5;
            const visualLen = Math.max(canvasDiag * 1.65, len * 1.65, 1700);
            return {
                key: path && path.key,
                width: Math.max(1, parseFloat(path && path.width) || parseFloat(obj && obj.traceWidth) || 100),
                x1: cx - nx * visualLen * 0.5 - cameraX,
                y1: cy - ny * visualLen * 0.5,
                x2: cx + nx * visualLen * 0.5 - cameraX,
                y2: cy + ny * visualLen * 0.5,
                worldX1: cx - nx * visualLen * 0.5,
                worldY1: cy - ny * visualLen * 0.5 - groundBaseY,
                worldX2: cx + nx * visualLen * 0.5,
                worldY2: cy + ny * visualLen * 0.5 - groundBaseY,
                nx,
                ny
            };
        });
    },

    doesSegmentIntersectRect: function(x1, y1, x2, y2, rect) {
        if (!rect) return false;
        if ((x1 >= rect.left && x1 <= rect.right && y1 >= rect.top && y1 <= rect.bottom) ||
            (x2 >= rect.left && x2 <= rect.right && y2 >= rect.top && y2 <= rect.bottom)) return true;
        const ccw = (ax, ay, bx, by, cx, cy) => (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
        const segsIntersect = (ax, ay, bx, by, cx, cy, dx, dy) => {
            return ccw(ax, ay, cx, cy, dx, dy) !== ccw(bx, by, cx, cy, dx, dy) &&
                   ccw(ax, ay, bx, by, cx, cy) !== ccw(ax, ay, bx, by, dx, dy);
        };
        return segsIntersect(x1, y1, x2, y2, rect.left, rect.top, rect.right, rect.top) ||
               segsIntersect(x1, y1, x2, y2, rect.right, rect.top, rect.right, rect.bottom) ||
               segsIntersect(x1, y1, x2, y2, rect.right, rect.bottom, rect.left, rect.bottom) ||
               segsIntersect(x1, y1, x2, y2, rect.left, rect.bottom, rect.left, rect.top);
    },

    getKasiyasP3B5ScreenTraceHit: function(obj, gameState, player) {
        if (!obj || !gameState || !player) return null;
        const segments = BossObjectSystem.getKasiyasP3B5TraceScreenSegments.call(this, gameState, obj);
        if (!segments.length) return null;
        const groundBaseY = (typeof GameRenderer !== 'undefined' && GameRenderer && Number.isFinite(parseFloat(GameRenderer.GROUND_BASE_Y))) ? parseFloat(GameRenderer.GROUND_BASE_Y) : 400;
        const cameraX = Number.isFinite(parseFloat(gameState && gameState.camera && gameState.camera.x)) ? parseFloat(gameState.camera.x) : 0;
        const scale = parseFloat(player.scale) || 1;
        const bodyW = Math.max(24, (parseFloat(player.bodyX) || 60) * scale);
        const bodyH = Math.max(48, (parseFloat(player.bodyZ) || 130) * scale);
        const bodyY = groundBaseY + (parseFloat(player.y) || 0) - (parseFloat(player.z) || 0);
        const rectBase = {
            left: (parseFloat(player.x) || 0) - cameraX - bodyW * 0.50,
            right: (parseFloat(player.x) || 0) - cameraX + bodyW * 0.50,
            top: bodyY - bodyH,
            bottom: bodyY
        };
        for (const seg of segments) {
            const width = Math.max(1, parseFloat(seg.width) || parseFloat(obj.traceWidth) || 100);
            const pad = width * 0.5;
            const rect = {
                left: rectBase.left - pad,
                right: rectBase.right + pad,
                top: rectBase.top - pad,
                bottom: rectBase.bottom + pad
            };
            if (!BossObjectSystem.doesSegmentIntersectRect(seg.x1, seg.y1, seg.x2, seg.y2, rect)) continue;
            const centerX = ((parseFloat(player.x) || 0) - cameraX);
            const centerY = (rectBase.top + rectBase.bottom) * 0.5;
            const nearest = BossObjectSystem.getKasiyasP3B5TracePointDistance(centerX, centerY, {
                startX: seg.x1,
                startY: seg.y1,
                endX: seg.x2,
                endY: seg.y2
            });
            const hitWorldX = (nearest && Number.isFinite(nearest.x)) ? nearest.x + cameraX : (parseFloat(player.x) || 0);
            const hitWorldY = (nearest && Number.isFinite(nearest.y)) ? nearest.y - groundBaseY : (parseFloat(player.y) || 0);
            return {
                x: Math.max(0, Math.min(parseFloat(gameState.WORLD_WIDTH) || 1400, hitWorldX)),
                y: Math.max(0, Math.min(parseFloat(gameState.WORLD_DEPTH) || 400, hitWorldY)),
                segment: seg
            };
        }
        return null;
    },

    createKasiyasP3GiantSwordTraceObject: function(objectId, gameState, sourceObj = null, options = {}) {
        if (!gameState || !gameState.DB_BOSS_PATTERN_OBJECT) return null;
        const id = String(objectId || '').trim();
        const data = gameState.DB_BOSS_PATTERN_OBJECT[id];
        if (!data) return null;
        if (!Array.isArray(gameState.bossAttackObjects)) gameState.bossAttackObjects = [];
        if (id === '253007') {
            gameState.p3B5TraceFinalHitEnded = false;
            gameState.p3B5TraceCrossCreated = {};
        }
        const traceKey = String(data.Trace_Path_Key || '').trim().toUpperCase();
        const traceWidth = Math.max(24, parseFloat(data.Trace_Width) || parseFloat(data.Hitbox_Size_X) || 150);
        const paths = BossObjectSystem.getKasiyasP3B5TracePaths.call(this, gameState, traceKey, traceWidth);
        const center = BossObjectSystem.getKasiyasP3B5TraceCenter(paths);
        const owner = (sourceObj && (sourceObj.owner || sourceObj.sourceCaster)) || sourceObj || (Array.isArray(gameState.monsters) && gameState.monsters[0]) || null;
        const obj = {
            kind: 'p3GiantSwordTrace',
            owner,
            sourceCaster: sourceObj,
            sourceAction: options.sourceAction || null,
            data,
            active: true,
            x: Number.isFinite(parseFloat(options.x)) ? parseFloat(options.x) : center.x,
            y: Number.isFinite(parseFloat(options.y)) ? parseFloat(options.y) : center.y,
            z: Number.isFinite(parseFloat(options.z)) ? parseFloat(options.z) : 0,
            timer: 0,
            maxLife: Math.max(0.1, parseFloat(data.Object_Internal_Duration) || 10),
            renderType: String(data.Object_Render_Type || 'OBJ_P3_GIANT_SWORD_TRACE').trim(),
            objectType: 'GIANT_SWORD_TRACE',
            objectGroup: String(data.Object_Group || '').trim(),
            traceKey,
            traceWidth,
            tracePaths: paths,
            traceExplosionGroup: String(data.Trace_Explosion_Group || '').trim(),
            warningDuration: Math.max(0, parseFloat(data.Warning_Duration) || 0),
            hitStart: Math.max(0, parseFloat(data.Hitbox_Delay_Time) || parseFloat(data.Warning_Duration) || 0),
            hitDuration: Math.max(0.03, parseFloat(data.Hitbox_Duration) || 0.16),
            hitEnd: Math.max(0.03, (parseFloat(data.Hitbox_Delay_Time) || parseFloat(data.Warning_Duration) || 0) + (parseFloat(data.Hitbox_Duration) || 0.16)),
            hitCount: Math.max(1, parseInt(data.Object_ATK_Hit_Count || data.ATK_Hit_Count) || 1),
            hitsDone: 0,
            hitCycleTimer: 999,
            hitCycle: Math.max(0.01, parseFloat(data.Object_ATK_Cycle || data.ATK_Cycle) || 0.03),
            w: Math.max(30, parseFloat(data.Hitbox_Size_X) || traceWidth),
            d: Math.max(30, parseFloat(data.Hitbox_Size_Y) || traceWidth),
            h: Math.max(30, parseFloat(data.Hitbox_Size_Z) || 300),
            hitboxType: String(data.Hitbox_Type || 'HITBOX_BOX').trim().toUpperCase(),
            burstTriggered: false,
            crossResolved: false
        };
        gameState.bossAttackObjects.push(obj);
        BossObjectSystem.resolveKasiyasP3B5TraceCrossDistortions.call(this, gameState, obj);
        if (Array.isArray(gameState.effects)) {
            gameState.effects.push({ type: 'p3GiantSwordTraceAwaken', renderType: 'EFT_P3_GIANT_SWORD_TRACE', x: obj.x, y: obj.y, z: 18, w: 420, d: 180, h: 180, life: 0.35, maxLife: 0.35 });
        }
        if (typeof this.pushBossDebugLog === 'function') {
            this.pushBossDebugLog(gameState, 'OBJECT', `${id} ${this.getBossDebugName ? this.getBossDebugName(data) : ''}`, `trace ${traceKey}`);
        }
        return obj;
    },

    resolveKasiyasP3B5TraceCrossDistortions: function(gameState, sourceObj = null) {
        if (!gameState || !Array.isArray(gameState.bossAttackObjects)) return;
        if (!gameState.p3B5TraceCrossCreated) gameState.p3B5TraceCrossCreated = {};
        const traces = gameState.bossAttackObjects.filter(obj => obj && obj.active && obj.kind === 'p3GiantSwordTrace' && ['TRACE_PATH_P3_B5_UP','TRACE_PATH_P3_B5_CIRCLE','TRACE_PATH_P3_B5_DOWN'].includes(String(obj.traceKey || '').toUpperCase()));
        const byKey = {};
        traces.forEach(obj => { if (!byKey[obj.traceKey]) byKey[obj.traceKey] = obj; });
        const pairs = [
            ['TRACE_PATH_P3_B5_UP', 'TRACE_PATH_P3_B5_CIRCLE', 'UP_CIRCLE'],
            ['TRACE_PATH_P3_B5_UP', 'TRACE_PATH_P3_B5_DOWN', 'UP_DOWN'],
            ['TRACE_PATH_P3_B5_CIRCLE', 'TRACE_PATH_P3_B5_DOWN', 'CIRCLE_DOWN']
        ];
        pairs.forEach(pair => {
            const a = byKey[pair[0]];
            const b = byKey[pair[1]];
            const key = pair[2];
            if (!a || !b || gameState.p3B5TraceCrossCreated[key]) return;
            const pa = Array.isArray(a.tracePaths) ? a.tracePaths[0] : null;
            const pb = Array.isArray(b.tracePaths) ? b.tracePaths[0] : null;
            const p = BossObjectSystem.getKasiyasP3B5TraceIntersection(pa, pb);
            if (!p) return;
            gameState.p3B5TraceCrossCreated[key] = true;
            const resultId = String(a.data && a.data.Object_Interact_Result_Value || b.data && b.data.Object_Interact_Result_Value || '253001').trim();
            BossObjectSystem.createKasiyasP3SpaceObject.call(this, resultId, gameState, sourceObj || a, { x: p.x, y: p.y, z: 0, sourceAction: (sourceObj && sourceObj.sourceAction) || a.sourceAction || b.sourceAction || null });
            if (Array.isArray(gameState.effects)) {
                gameState.effects.push({ type: 'p3SpaceBurstPreFlash', renderType: 'EFT_P3_GIANT_TRACE_CROSS_DISTORTION', x: p.x, y: p.y, z: 14, w: 260, d: 150, h: 120, life: 0.32, maxLife: 0.32 });
            }
            if (typeof this.pushBossDebugLog === 'function') {
                this.pushBossDebugLog(gameState, 'OBJECT', '3P 기본5 검흔 교차', `${key} -> 공간 왜곡`);
            }
        });
    },

    forceBurstAllKasiyasP3SpaceDistortions: function(gameState, sourceObj = null) {
        if (!gameState || !Array.isArray(gameState.bossAttackObjects)) return 0;
        const burstId = String(sourceObj && sourceObj.data && sourceObj.data.Object_Interact_Result_Value || '253002').trim();
        const distortions = gameState.bossAttackObjects.filter(obj => obj && obj.active && obj.kind === 'p3SpaceDistortion');
        distortions.forEach(obj => {
            const x = parseFloat(obj.x) || 0;
            const y = parseFloat(obj.y) || 0;
            obj.active = false;
            if (Array.isArray(gameState.effects)) {
                gameState.effects.push({ type: 'p3SpaceBurstPreFlash', renderType: 'EFT_P3_SPACE_DISTORTION_OVERLAP', x, y, z: 12, w: 360, d: 240, h: 140, life: 0.35, maxLife: 0.35 });
            }
            BossObjectSystem.createKasiyasP3SpaceObject.call(this, burstId, gameState, sourceObj || obj, { x, y, z: 0, sourceAction: sourceObj && sourceObj.sourceAction || null });
        });
        if (typeof this.pushBossDebugLog === 'function' && distortions.length > 0) {
            this.pushBossDebugLog(gameState, 'OBJECT', '3P 기본5 공간 왜곡 강제 폭발', `${distortions.length}개 폭발`);
        }
        return distortions.length;
    },

    updateKasiyasP3GiantSwordTraceObject: function(obj, deltaTime, gameState) {
        obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
        const data = obj.data || {};
        const t = obj.timer;
        const hitStart = Math.max(0, parseFloat(obj.hitStart) || 0);
        const hitEnd = Math.max(hitStart + 0.03, parseFloat(obj.hitEnd) || (hitStart + 0.16));
        if (t >= hitStart && t <= hitEnd && (obj.hitsDone || 0) < (obj.hitCount || 1)) {
            obj.hitCycleTimer = (parseFloat(obj.hitCycleTimer) || 0) + deltaTime;
            if (obj.hitCycleTimer >= (parseFloat(obj.hitCycle) || 0.03)) {
                obj.hitCycleTimer = 0;
                obj.hitsDone = (obj.hitsDone || 0) + 1;
                BossObjectSystem.fireKasiyasP3GiantSwordTraceHit.call(this, obj, gameState);
                const interactCond = String(data.Object_Interact_Cond || '').trim().toUpperCase();
                if (interactCond === 'SPACE_DISTORTION_ALL_BURST' && !obj.burstTriggered) {
                    obj.burstTriggered = true;
                    BossObjectSystem.forceBurstAllKasiyasP3SpaceDistortions.call(this, gameState, obj);
                }
            }
        }
        const removeCond = String(data.Object_Remove_Cond || '').trim().toUpperCase();
        const removeValue = String(data.Object_Remove_Value || '').trim();
        if (String(data.Object_ID || '').trim() === '253011' && t >= hitEnd) {
            if (gameState) gameState.p3B5TraceFinalHitEnded = true;
            if (Array.isArray(gameState && gameState.effects)) {
                (obj.tracePaths || []).forEach(path => {
                    gameState.effects.push({ type: 'p3GiantSwordTraceBurst', renderType: 'EFT_P3_GIANT_SWORD_TRACE_BURST', x: (path.startX + path.endX) * 0.5, y: (path.startY + path.endY) * 0.5, z: 20, w: path.length || 900, d: path.width || 150, h: 180, angle: Math.atan2((path.endY || 0) - (path.startY || 0), (path.endX || 0) - (path.startX || 0)), life: 0.45, maxLife: 0.45 });
                });
            }
        }
        if (removeCond === 'OBJECT_HITBOX_DURATION_END' && removeValue === '253011' && gameState && gameState.p3B5TraceFinalHitEnded) {
            return false;
        }
        if (t >= Math.max(0.1, parseFloat(obj.maxLife) || 10)) return false;
        return true;
    },

    fireKasiyasP3GiantSwordTraceHit: function(obj, gameState) {
        if (!obj || !gameState) return false;
        const p = gameState.player || null;
        const owner = obj.owner || obj.sourceCaster || (Array.isArray(gameState.monsters) && gameState.monsters[0]) || null;
        const data = obj.data || {};
        const hitboxType = String(obj.hitboxType || data.Hitbox_Type || '').trim().toUpperCase();
        let didHit = false;
        let hitX = parseFloat(obj.x) || 0;
        let hitY = parseFloat(obj.y) || 0;
        if (p && p.active && p.hp > 0 && owner && owner.d) {
            let nearest = null;
            if (hitboxType === 'HITBOX_SCREEN_TRACE') {
                const traceHit = BossObjectSystem.getKasiyasP3B5ScreenTraceHit.call(this, obj, gameState, p);
                if (traceHit) nearest = { x: traceHit.x, y: traceHit.y };
            } else {
                const px = parseFloat(p.x) || 0;
                const py = parseFloat(p.y) || 0;
                const scale = parseFloat(p.scale) || 1;
                const bodyPad = Math.max(24, ((parseFloat(p.bodyX) || 60) * scale * 0.35 + (parseFloat(p.bodyY) || 40) * scale * 0.35) * 0.5);
                const paths = Array.isArray(obj.tracePaths) ? obj.tracePaths : [];
                for (const path of paths) {
                    const d = BossObjectSystem.getKasiyasP3B5TracePointDistance(px, py, path);
                    const width = Math.max(24, parseFloat(path && path.width) || parseFloat(obj.traceWidth) || 150);
                    if (d.distance <= width * 0.5 + bodyPad) {
                        nearest = d;
                        break;
                    }
                }
            }
            if (nearest) {
                didHit = true;
                hitX = nearest.x;
                hitY = nearest.y;
                const attackData = {
                    ...data,
                    ATK_Hit_Count: data.Object_ATK_Hit_Count,
                    ATK_Cycle: data.Object_ATK_Cycle,
                    ATK_Damage_Rate: data.Object_DMG_Rate,
                    Action_Anim_Duration: data.Object_Internal_Duration,
                    Action_Attack_Type: data.Object_Type,
                    Guard_Direction_Type: data.Guard_Direction_Type || 'ANY_DIRECTION'
                };
                const baseDmg = (parseFloat(owner.d.atk) || 1) * (parseFloat(data.Object_DMG_Rate) || 1);
                PlayerManager.takeDamage(gameState, calcScaledDamage(owner.d.level || 1, p.level || 1, baseDmg), hitX, hitY, null, 0, 0, this.buildGuardInfoFromAttackData(attackData, obj));
            }
        }
        if (Array.isArray(gameState.hitboxes)) {
            (obj.tracePaths || []).forEach(path => {
                if (hitboxType === 'HITBOX_SCREEN_TRACE') {
                    const groundBaseY = (typeof GameRenderer !== 'undefined' && GameRenderer && Number.isFinite(parseFloat(GameRenderer.GROUND_BASE_Y))) ? parseFloat(GameRenderer.GROUND_BASE_Y) : 400;
                    gameState.hitboxes.push({ type: 'path', startX: path.startX, startY: path.startY, endX: path.endX, endY: path.endY, z: 0, w: Math.max(20, parseFloat(path.width) || parseFloat(obj.traceWidth) || 100), d: Math.max(20, parseFloat(path.width) || parseFloat(obj.traceWidth) || 100), h: Math.max(80, parseFloat(data.Hitbox_Size_Z) || 300), life: 0.10, sourceObject: obj, sourceObjectId: String(data.Object_ID || ''), hitboxType: 'HITBOX_SCREEN_TRACE' });
                } else {
                    gameState.hitboxes.push({ x: (path.startX + path.endX) * 0.5, y: (path.startY + path.endY) * 0.5, z: 0, w: Math.max(40, path.length || 500), d: Math.max(20, path.width || obj.traceWidth || 150), h: Math.max(80, parseFloat(data.Hitbox_Size_Z) || 300), angle: Math.atan2((path.endY || 0) - (path.startY || 0), (path.endX || 0) - (path.startX || 0)), life: 0.10, sourceObject: obj, sourceObjectId: String(data.Object_ID || '') });
                }
            });
        }
        if (Array.isArray(gameState.effects)) {
            (obj.tracePaths || []).forEach(path => {
                gameState.effects.push({ type: 'p3GiantSwordTraceHitFlash', renderType: 'EFT_P3_GIANT_SWORD_TRACE_HIT', x: (path.startX + path.endX) * 0.5, y: (path.startY + path.endY) * 0.5, z: 18, w: path.length || 900, d: path.width || obj.traceWidth || 100, h: 180, angle: Math.atan2((path.endY || 0) - (path.startY || 0), (path.endX || 0) - (path.startX || 0)), life: 0.20, maxLife: 0.20, mode: 'redCoreFlash' });
            });
        }
        return didHit;
    },

    createKasiyasP3SpaceObject: function(objectId, gameState, sourceObj = null, options = {}) {
        if (!gameState || !gameState.DB_BOSS_PATTERN_OBJECT) return null;
        const id = String(objectId || '').trim();
        if (!id) return null;
        const data = gameState.DB_BOSS_PATTERN_OBJECT[id];
        if (!data) return null;
        if (!Array.isArray(gameState.bossAttackObjects)) gameState.bossAttackObjects = [];
        const objectType = String(data.Object_Type || '').trim().toUpperCase();
        const renderType = String(data.Object_Render_Type || '').trim().toUpperCase();
        const owner = (sourceObj && (sourceObj.owner || sourceObj.sourceCaster)) || sourceObj || (Array.isArray(gameState.monsters) && gameState.monsters[0]) || null;
        const size = this.getKasiyasP3SpaceObjectSize ? this.getKasiyasP3SpaceObjectSize(data) : BossObjectSystem.getKasiyasP3SpaceObjectSize(data);
        const baseX = Number.isFinite(parseFloat(options.x)) ? parseFloat(options.x) : (Number.isFinite(parseFloat(sourceObj && sourceObj.x)) ? parseFloat(sourceObj.x) : ((parseFloat(gameState.WORLD_WIDTH) || 1400) * 0.5));
        const baseY = Number.isFinite(parseFloat(options.y)) ? parseFloat(options.y) : (Number.isFinite(parseFloat(sourceObj && sourceObj.y)) ? parseFloat(sourceObj.y) : ((parseFloat(gameState.WORLD_DEPTH) || 400) * 0.5));
        const baseZ = Number.isFinite(parseFloat(options.z)) ? parseFloat(options.z) : 0;
        const sourceBoss = (owner && owner.boss) || (sourceObj && sourceObj.boss) || (sourceObj && sourceObj.owner && sourceObj.owner.boss) || (Array.isArray(gameState.monsters) && gameState.monsters[0] && gameState.monsters[0].boss) || null;
        const common = {
            owner,
            sourceCaster: sourceObj,
            sourceAction: options.sourceAction || null,
            isLatePhaseSource: !!(sourceBoss && sourceBoss.isLatePhase),
            data,
            active: true,
            x: Math.max(20, Math.min((parseFloat(gameState.WORLD_WIDTH) || 1400) - 20, baseX)),
            y: Math.max(16, Math.min((parseFloat(gameState.WORLD_DEPTH) || 400) - 16, baseY)),
            z: baseZ,
            timer: 0,
            maxLife: Math.max(0.1, parseFloat(data.Object_Internal_Duration) || (objectType === 'SPACE_BURST' ? 1.3 : (objectType === 'TERRAIN_BLOCK' ? 10 : 999))),
            renderType: renderType || data.Object_Render_Type || '',
            objectType,
            objectGroup: String(data.Object_Group || '').trim(),
            hitboxType: String(data.Hitbox_Type || '').trim().toUpperCase(),
            w: size.w,
            d: size.d,
            h: size.h
        };

        if (objectType === 'SPACE_DISTORTION') {
            const probe = { ...common, kind: 'p3SpaceDistortion' };
            const overlap = gameState.bossAttackObjects.find(obj => obj && obj.active && obj.kind === 'p3SpaceDistortion' && BossObjectSystem.doesKasiyasP3SpaceObjectOverlap(obj, probe));
            if (overlap) {
                const burstId = String(data.Object_Interact_Result_Value || 253002).trim();
                const bx = ((parseFloat(overlap.x) || 0) + probe.x) * 0.5;
                const by = ((parseFloat(overlap.y) || 0) + probe.y) * 0.5;
                overlap.active = false;
                // 현재 updateBossAttackObjects 루프 안에서 새 공간 왜곡을 만들다가 기존 왜곡을 즉시 splice하면,
                // 뒤이어 검기 오브젝트를 제거하는 splice(i, 1)가 새로 생성된 공간 폭발을 잘못 제거할 수 있다.
                // 따라서 기존 왜곡은 active=false로만 표시하고, 실제 배열 정리는 업데이트 루프의 일반 정리 흐름에 맡긴다.
                if (gameState.effects) {
                    gameState.effects.push({ type: 'p3SpaceBurstPreFlash', x: bx, y: by, z: 12, w: 360, d: 240, h: 140, life: 0.35, maxLife: 0.35, renderType: 'EFT_P3_SPACE_DISTORTION_OVERLAP' });
                }
                const burst = BossObjectSystem.createKasiyasP3SpaceObject.call(this, burstId, gameState, sourceObj, { x: bx, y: by, z: 0, sourceAction: options.sourceAction });
                if (typeof this.pushBossDebugLog === 'function') {
                    this.pushBossDebugLog(gameState, 'OBJECT', `${String(data.Object_ID || '').trim()} ${this.getBossDebugName(data)}`, `space distortion overlap -> burst ${burstId}`);
                }
                return burst;
            }
            const obj = {
                ...common,
                kind: 'p3SpaceDistortion',
                restoreTimer: 0,
                restoreRequired: Math.max(0.1, parseFloat(data.Object_Remove_Value) || 4),
                restoring: false,
                wobbleTimer: 0
            };
            gameState.bossAttackObjects.push(obj);
            return obj;
        }

        if (objectType === 'SPACE_BURST') {
            const warningDuration = Math.max(0, parseFloat(data.Warning_Duration) || 1.0);
            const hitDuration = Math.max(0.05, parseFloat(data.Hitbox_Duration) || 0.3);
            const obj = {
                ...common,
                kind: 'p3SpaceBurst',
                warningDuration,
                hitDuration,
                hitStart: warningDuration,
                hitEnd: warningDuration + hitDuration,
                hitCount: Math.max(1, parseInt(data.Object_ATK_Hit_Count) || 1),
                hitCycle: Math.max(0.03, parseFloat(data.Object_ATK_Cycle) || 0.1),
                hitsDone: 0,
                hitCycleTimer: 999,
                terrainSpawned: false
            };
            gameState.bossAttackObjects.push(obj);
            return obj;
        }

        if (objectType === 'DIMENSION_CRACK') {
            const warningDuration = Math.max(0, parseFloat(data.Warning_Duration) || 0);
            const hitDuration = Math.max(0.05, parseFloat(data.Hitbox_Duration) || parseFloat(data.Object_Internal_Duration) || 5);
            const obj = {
                ...common,
                kind: 'p3DimensionCrack',
                warningDuration,
                hitDuration,
                hitStart: Math.max(0, parseFloat(data.Hitbox_Delay_Time) || 0),
                hitEnd: Math.max(0.05, (parseFloat(data.Hitbox_Delay_Time) || 0) + hitDuration),
                hitCount: Math.max(1, parseInt(data.Object_ATK_Hit_Count) || 1),
                hitCycle: Math.max(0.03, parseFloat(data.Object_ATK_Cycle) || 0.5),
                hitsDone: 0,
                hitCycleTimer: 999,
                suctionFxTimer: 0,
                crackCutTriggered: false,
                fieldType: String(data.Object_Field_Type || '').trim().toUpperCase(),
                fieldTargetType: String(data.Object_Field_Target_Type || '').trim().toUpperCase(),
                fieldTargetObjectId: String(data.Object_Field_Target_Object_ID || '').trim(),
                fieldRangeType: String(data.Object_Field_Range_Type || '').trim().toUpperCase(),
                fieldRangeX: Math.max(1, parseFloat(data.Object_Field_Range_X) || size.w || 1600),
                fieldRangeY: Math.max(1, parseFloat(data.Object_Field_Range_Y) || size.d || 500),
                fieldRangeZ: Math.max(1, parseFloat(data.Object_Field_Range_Z) || size.h || 800),
                fieldPlayerPullSpeed: Math.max(0, parseFloat(data.Object_Field_Player_Pull_Speed) || 0),
                fieldObjectPullSpeed: Math.max(0, parseFloat(data.Object_Field_Object_Pull_Speed) || 0),
                fieldRunResistRate: Math.max(0, Math.min(0.95, parseFloat(data.Object_Field_Run_Resist_Rate) || 0)),
                fieldMinDistance: Math.max(0, parseFloat(data.Object_Field_Min_Distance) || 0),
                fieldLatePullSpeedRate: Math.max(0, parseFloat(data.Late_Phase_Pull_Speed_Rate) || 1)
            };
            gameState.bossAttackObjects.push(obj);
            return obj;
        }

        if (objectType === 'DIMENSION_CRACK_BURST') {
            const warningDuration = Math.max(0, parseFloat(data.Warning_Duration) || 1.0);
            const hitDuration = Math.max(0.05, parseFloat(data.Hitbox_Duration) || 1.0);
            const obj = {
                ...common,
                kind: 'p3DimensionCrackBurst',
                warningDuration,
                hitDuration,
                hitStart: warningDuration,
                hitEnd: warningDuration + hitDuration,
                hitCount: Math.max(1, parseInt(data.Object_ATK_Hit_Count) || 1),
                hitCycle: Math.max(0.03, parseFloat(data.Object_ATK_Cycle) || 0.1),
                hitsDone: 0,
                hitCycleTimer: 999
            };
            gameState.bossAttackObjects.push(obj);
            return obj;
        }

        if (objectType === 'TERRAIN_BLOCK') {
            const hasExplicitTerrainArea = ['Terrain_Area_X', 'Terrain_Area_Y', 'Terrain_Area_W', 'Terrain_Area_H']
                .every(key => Number.isFinite(parseFloat(data && data[key])));
            const explicitRect = hasExplicitTerrainArea ? this.getTerrainAreaRect(data, gameState) : null;
            const terrainW = explicitRect ? explicitRect.w : Math.max(30, parseFloat(data.Terrain_Area_W) || size.w || 250);
            const terrainH = explicitRect ? explicitRect.h : Math.max(30, parseFloat(data.Terrain_Area_H) || size.d || 100);
            const terrain = {
                ...common,
                kind: 'terrain',
                terrainArea: explicitRect || {
                    x: Math.max(0, Math.min((parseFloat(gameState.WORLD_WIDTH) || 1400) - terrainW, common.x - terrainW / 2)),
                    y: Math.max(0, Math.min((parseFloat(gameState.WORLD_DEPTH) || 400) - terrainH, common.y - terrainH / 2)),
                    w: terrainW,
                    h: terrainH
                },
                sourcePatternId: String(options.sourcePatternId || options.sourceAction && options.sourceAction.Pattern_ID || '')
            };
            terrain.terrainArea.centerX = terrain.terrainArea.x + terrain.terrainArea.w / 2;
            terrain.terrainArea.centerY = terrain.terrainArea.y + terrain.terrainArea.h / 2;
            terrain.x = terrain.terrainArea.centerX;
            terrain.y = terrain.terrainArea.centerY;
            const maxCount = Math.max(1, parseInt(data.Object_Simultaneously_Count) || 3);
            const blocks = gameState.bossAttackObjects.filter(obj => obj && obj.active && obj.kind === 'terrain' && String(obj.objectType || obj.data && obj.data.Object_Type || '').trim().toUpperCase() === 'TERRAIN_BLOCK' && String(obj.renderType || obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase() === 'OBJ_P3_SPACE_BURST_BROKEN_SPACE');
            while (blocks.length >= maxCount) {
                const oldest = blocks.shift();
                if (oldest) oldest.active = false;
            }
            gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => obj && obj.active);
            gameState.bossAttackObjects.push(terrain);
            return terrain;
        }
        return null;
    },

    tryCreateKasiyasP3SpaceDistortionFromSwordWaveGuard: function(obj, gameState, hitbox, result) {
        if (!obj || !gameState || !result || !result.guarded || obj.guardSpaceDistortionCreated) return false;
        const data = obj.data || {};
        const objectType = String(obj.objectType || data.Object_Type || '').trim().toUpperCase();
        const interactCond = String(data.Object_Interact_Cond || '').trim().toUpperCase();
        const resultType = String(data.Object_Interact_Result_Type || '').trim().toUpperCase();
        const resultValue = String(data.Object_Interact_Result_Value || '').trim();
        if (objectType !== 'GIANT_SWORD_WAVE' && interactCond !== 'PLAYER_GUARD_SWORD_WAVE') return false;
        if (interactCond !== 'PLAYER_GUARD_SWORD_WAVE' || resultType !== 'CALL_OBJECT' || !resultValue) return false;
        const p = gameState.player || null;
        const createX = Number.isFinite(parseFloat(p && p.x)) ? parseFloat(p.x) : (Number.isFinite(parseFloat(hitbox && hitbox.x)) ? parseFloat(hitbox.x) : parseFloat(obj.x) || 0);
        const createY = Number.isFinite(parseFloat(p && p.y)) ? parseFloat(p.y) : (Number.isFinite(parseFloat(hitbox && hitbox.y)) ? parseFloat(hitbox.y) : parseFloat(obj.y) || 0);
        const created = BossObjectSystem.createKasiyasP3SpaceObject.call(this, resultValue, gameState, obj, {
            x: createX,
            y: createY,
            z: 0,
            sourceAction: obj.sourceAction || null
        });
        if (!created) return false;
        obj.guardSpaceDistortionCreated = true;
        if (Array.isArray(gameState.effects)) {
            gameState.effects.push({
                type: 'hitSpark',
                renderType: 'EFT_P3_GIANT_SWORD_WAVE_GUARD_BREAK',
                x: createX,
                y: createY,
                z: Math.max(28, parseFloat(p && p.z) || 0) + Math.max(60, parseFloat(p && p.bodyZ) || 110) * 0.58,
                w: Math.max(170, parseFloat(obj.w) || 220),
                h: Math.max(150, parseFloat(obj.h) || 300) * 0.45,
                life: 0.38,
                maxLife: 0.38,
                color: 'rgba(255,42,34,0.98)',
                accentColor: 'rgba(20,0,0,0.98)'
            });
            gameState.effects.push({
                type: 'p3SpaceBurstPreFlash',
                renderType: 'EFT_P3_SPACE_DISTORTION_FROM_GUARD',
                x: createX,
                y: createY,
                z: 12,
                w: 260,
                d: 180,
                h: 110,
                life: 0.26,
                maxLife: 0.26
            });
        }
        if (Array.isArray(gameState.floatingTexts)) {
            gameState.floatingTexts.push({ x: createX, y: createY, z: 94, text: '공간 왜곡 발생', color: '#d9a8ff', size: '20px', timer: 0.75 });
        }
        if (typeof this.pushBossDebugLog === 'function') {
            this.pushBossDebugLog(gameState, 'OBJECT', `${String(data.Object_ID || '').trim()} ${this.getBossDebugName(data)}`, `guarded sword wave -> space distortion ${resultValue}`);
        }
        return true;
    },

    updateKasiyasP3SpaceDistortionObject: function(obj, deltaTime, gameState) {
        obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
        obj.wobbleTimer = (parseFloat(obj.wobbleTimer) || 0) + deltaTime;
        const p = gameState && gameState.player ? gameState.player : null;
        const inside = p && p.active && p.hp > 0 && BossObjectSystem.isPlayerInsideKasiyasP3SpaceObject(p, obj);
        obj.restoring = !!inside;
        if (inside) obj.restoreTimer = Math.min(obj.restoreRequired || 4, (parseFloat(obj.restoreTimer) || 0) + deltaTime);
        else obj.restoreTimer = 0;
        if (obj.restoreTimer >= (obj.restoreRequired || 4)) {
            obj.active = false;
            if (gameState.effects) gameState.effects.push({ type: 'p3SpaceDistortionRestore', renderType: 'EFT_P3_SPACE_DISTORTION_RESTORE', x: obj.x, y: obj.y, z: 16, w: obj.w, d: obj.d, h: obj.h, life: 0.42, maxLife: 0.42 });
            if (gameState.floatingTexts) gameState.floatingTexts.push({ x: obj.x, y: obj.y, z: 80, text: '공간 복구', color: '#cda8ff', size: '22px', timer: 0.65 });
            return false;
        }
        if (obj.maxLife && obj.timer > obj.maxLife) return false;
        return true;
    },

    updateKasiyasP3SpaceBurstObject: function(obj, deltaTime, gameState) {
        obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
        const t = obj.timer;
        if (t >= obj.hitStart && t <= obj.hitEnd && (obj.hitsDone || 0) < obj.hitCount) {
            obj.hitCycleTimer = (parseFloat(obj.hitCycleTimer) || 0) + deltaTime;
            if (obj.hitCycleTimer >= obj.hitCycle) {
                obj.hitCycleTimer = 0;
                obj.hitsDone = (obj.hitsDone || 0) + 1;
                const p = gameState && gameState.player ? gameState.player : null;
                if (p && p.active && p.hp > 0 && BossObjectSystem.isPlayerInsideKasiyasP3SpaceObject(p, obj)) {
                    const owner = obj.owner || obj.sourceCaster || (Array.isArray(gameState.monsters) && gameState.monsters[0]) || null;
                    if (owner && owner.d) {
                        const data = obj.data || {};
                        const attackData = {
                            ...data,
                            ATK_Hit_Count: data.Object_ATK_Hit_Count,
                            ATK_Cycle: data.Object_ATK_Cycle,
                            ATK_Damage_Rate: data.Object_DMG_Rate,
                            Action_Anim_Duration: data.Object_Internal_Duration,
                            Action_Attack_Type: data.Object_Type,
                            Guard_Direction_Type: data.Guard_Direction_Type || 'ACCORD_DIRECTION'
                        };
                        const baseDmg = (parseFloat(owner.d.atk) || 1) * (parseFloat(data.Object_DMG_Rate) || 1);
                        if (gameState.hitboxes) gameState.hitboxes.push({ x: obj.x, y: obj.y, z: 0, w: obj.w, d: obj.d, h: obj.h, life: 0.10, sourceObject: obj, sourceObjectId: String(data.Object_ID || '') });
                        PlayerManager.takeDamage(gameState, calcScaledDamage(owner.d.level || 1, p.level || 1, baseDmg), obj.x, obj.y, null, 0, 0, this.buildGuardInfoFromAttackData(attackData, obj));
                    }
                }
            }
        }
        if (t >= Math.max(0.1, parseFloat(obj.maxLife) || 1.3)) {
            if (!obj.terrainSpawned) {
                obj.terrainSpawned = true;
                const data = obj.data || {};
                const resultType = String(data.Object_Destroy_Result_Type || '').trim().toUpperCase();
                const resultValue = String(data.Object_Destroy_Result_Value || '').trim();
                if ((resultType === 'SPAWN_OBJECT' || resultType === 'CREATE_OBJECT') && resultValue) {
                    BossObjectSystem.createKasiyasP3SpaceObject.call(this, resultValue, gameState, obj, { x: obj.x, y: obj.y, z: 0 });
                }
            }
            return false;
        }
        return true;
    },


    isKasiyasP3DimensionCrackRemoveActionFinished: function(obj, gameState) {
        const data = obj && obj.data ? obj.data : {};
        const removeCond = String(data.Object_Remove_Cond || '').trim().toUpperCase();
        const removeValue = String(data.Object_Remove_Value || '').trim();
        if (removeCond !== 'PATTERN_ACTION_END' || !removeValue) return false;
        const boss = Array.isArray(gameState && gameState.monsters) && gameState.monsters[0] ? gameState.monsters[0].boss : null;
        const sourcePatternId = String(obj && obj.sourceAction && obj.sourceAction.Pattern_ID || '').trim();
        const activePatternId = String(boss && boss.activePattern && boss.activePattern.Pattern_ID || '').trim();
        const curActionId = String(boss && boss.action && boss.action.Action_ID || '').trim();
        if (sourcePatternId && (!boss || !activePatternId || activePatternId !== sourcePatternId)) return true;
        if (curActionId && curActionId !== removeValue) {
            const curOrder = parseFloat(boss && boss.action && boss.action.Action_Order);
            const targetAction = gameState && gameState.DB_BOSS_PATTERN_ACTION ? gameState.DB_BOSS_PATTERN_ACTION[removeValue] : null;
            const targetOrder = parseFloat(targetAction && targetAction.Action_Order);
            if (Number.isFinite(curOrder) && Number.isFinite(targetOrder) && curOrder > targetOrder) return true;
        }
        return false;
    },

    finishKasiyasP3DimensionCrackObject: function(obj, gameState) {
        if (!obj || obj.crackCutTriggered) return;
        obj.crackCutTriggered = true;
        const data = obj.data || {};
        const resultType = String(data.Object_Destroy_Result_Type || '').trim().toUpperCase();
        const resultValue = String(data.Object_Destroy_Result_Value || '').trim();
        if ((resultType === 'SPAWN_OBJECT' || resultType === 'CREATE_OBJECT') && resultValue) {
            BossObjectSystem.createKasiyasP3SpaceObject.call(this, resultValue, gameState, obj, { x: obj.x, y: obj.y, z: 0, sourceAction: obj.sourceAction || null });
        }
        if (Array.isArray(gameState && gameState.effects)) {
            gameState.effects.push({
                type: 'p3DimensionCrackCutFlash',
                renderType: 'EFT_P3_DIMENSION_CRACK_CUT',
                x: obj.x,
                y: obj.y,
                z: 42,
                w: Math.max(520, parseFloat(obj.w) || 280),
                d: Math.max(260, parseFloat(obj.d) || 300),
                h: Math.max(260, parseFloat(obj.h) || 300),
                life: 0.42,
                maxLife: 0.42
            });
        }
    },

    resolveKasiyasP3SpaceDistortionOverlaps: function(gameState, sourceObj = null) {
        if (!gameState || !Array.isArray(gameState.bossAttackObjects)) return;
        const list = gameState.bossAttackObjects.filter(obj => obj && obj.active && obj.kind === 'p3SpaceDistortion');
        const burstId = '253002';
        for (let i = 0; i < list.length; i++) {
            const a = list[i];
            if (!a || !a.active) continue;
            for (let j = i + 1; j < list.length; j++) {
                const b = list[j];
                if (!b || !b.active) continue;
                if (!BossObjectSystem.doesKasiyasP3SpaceObjectOverlap(a, b)) continue;
                const bx = ((parseFloat(a.x) || 0) + (parseFloat(b.x) || 0)) * 0.5;
                const by = ((parseFloat(a.y) || 0) + (parseFloat(b.y) || 0)) * 0.5;
                a.active = false;
                b.active = false;
                if (Array.isArray(gameState.effects)) {
                    gameState.effects.push({ type: 'p3SpaceBurstPreFlash', x: bx, y: by, z: 12, w: 360, d: 240, h: 140, life: 0.35, maxLife: 0.35, renderType: 'EFT_P3_SPACE_DISTORTION_OVERLAP' });
                }
                BossObjectSystem.createKasiyasP3SpaceObject.call(this, burstId, gameState, sourceObj || a, { x: bx, y: by, z: 0, sourceAction: sourceObj && sourceObj.sourceAction || null });
                if (typeof this.pushBossDebugLog === 'function') {
                    this.pushBossDebugLog(gameState, 'OBJECT', '253001 공간 왜곡', `field pull overlap -> burst ${burstId}`);
                }
                return;
            }
        }
    },

    applyKasiyasP3DimensionCrackPullField: function(obj, deltaTime, gameState) {
        if (!obj || !gameState) return;
        const data = obj.data || {};
        const fieldType = String(obj.fieldType || data.Object_Field_Type || '').trim().toUpperCase();
        if (fieldType !== 'PULL_TO_SELF') return;
        const centerX = parseFloat(obj.x) || 0;
        const centerY = parseFloat(obj.y) || 0;
        const minDist = Math.max(0, parseFloat(obj.fieldMinDistance) || parseFloat(data.Object_Field_Min_Distance) || 0);
        const lateRateRaw = parseFloat(obj.fieldLatePullSpeedRate) || parseFloat(data.Late_Phase_Pull_Speed_Rate) || 1;
        const pullSpeedRate = obj.isLatePhaseSource && lateRateRaw > 0 ? lateRateRaw : 1;
        const inRange = (target) => {
            const dx = centerX - (parseFloat(target && target.x) || 0);
            const dy = centerY - (parseFloat(target && target.y) || 0);
            const dist = Math.hypot(dx, dy);
            const rangeType = String(obj.fieldRangeType || data.Object_Field_Range_Type || '').trim().toUpperCase();
            if (rangeType === 'MAP') return { ok: true, dx, dy, dist };
            const rx = Math.max(1, parseFloat(obj.fieldRangeX) || 1600) * 0.5;
            const ry = Math.max(1, parseFloat(obj.fieldRangeY) || 500) * 0.5;
            const nx = dx / rx;
            const ny = dy / ry;
            return { ok: (nx * nx + ny * ny) <= 1, dx, dy, dist };
        };

        const p = gameState.player || null;
        if (p && p.active && p.hp > 0) {
            const r = inRange(p);
            if (r.ok && r.dist > Math.max(1, minDist)) {
                let speed = Math.max(0, parseFloat(obj.fieldPlayerPullSpeed) || parseFloat(data.Object_Field_Player_Pull_Speed) || 0) * pullSpeedRate;
                if (speed > 0) {
                    const keys = gameState.keys || {};
                    let ix = 0, iy = 0;
                    if (keys.ArrowLeft || keys.KeyLeft) ix -= 1;
                    if (keys.ArrowRight || keys.KeyRight) ix += 1;
                    if (keys.ArrowUp || keys.KeyUp) iy -= 1;
                    if (keys.ArrowDown || keys.KeyDown) iy += 1;
                    const il = Math.hypot(ix, iy) || 1;
                    ix /= il; iy /= il;
                    const pullX = r.dx / Math.max(1, r.dist);
                    const pullY = r.dy / Math.max(1, r.dist);
                    const resisting = !!p.isRunning && (ix * pullX + iy * pullY) < -0.35;
                    if (resisting) speed *= (1 - Math.max(0, Math.min(0.95, parseFloat(obj.fieldRunResistRate) || parseFloat(data.Object_Field_Run_Resist_Rate) || 0)));
                    const step = Math.min(r.dist - minDist, speed * Math.max(0, deltaTime));
                    p.x = Math.max(0, Math.min(parseFloat(gameState.WORLD_WIDTH) || 1400, (parseFloat(p.x) || 0) + pullX * step));
                    p.y = Math.max(0, Math.min(parseFloat(gameState.WORLD_DEPTH) || 400, (parseFloat(p.y) || 0) + pullY * step));
                }
            }
        }

        const targetId = String(obj.fieldTargetObjectId || data.Object_Field_Target_Object_ID || '').trim();
        const targetType = String(obj.fieldTargetType || data.Object_Field_Target_Type || '').trim().toUpperCase();
        if (Array.isArray(gameState.bossAttackObjects) && (targetType === 'OBJECT' || targetType === 'PLAYER_AND_OBJECT' || targetType === 'OBJECT_AND_PLAYER')) {
            const speed = Math.max(0, parseFloat(obj.fieldObjectPullSpeed) || parseFloat(data.Object_Field_Object_Pull_Speed) || 0) * pullSpeedRate;
            if (speed > 0 && targetId) {
                for (const t of gameState.bossAttackObjects) {
                    if (!t || !t.active || t === obj || t.kind !== 'p3SpaceDistortion') continue;
                    const tid = String(t.data && t.data.Object_ID || '').trim();
                    if (tid && tid !== targetId) continue;
                    const r = inRange(t);
                    if (!r.ok || r.dist <= Math.max(1, minDist)) continue;
                    const pullX = r.dx / Math.max(1, r.dist);
                    const pullY = r.dy / Math.max(1, r.dist);
                    const step = Math.min(r.dist - minDist, speed * Math.max(0, deltaTime));
                    t.x = Math.max(0, Math.min(parseFloat(gameState.WORLD_WIDTH) || 1400, (parseFloat(t.x) || 0) + pullX * step));
                    t.y = Math.max(0, Math.min(parseFloat(gameState.WORLD_DEPTH) || 400, (parseFloat(t.y) || 0) + pullY * step));
                    t.wobbleTimer = (parseFloat(t.wobbleTimer) || 0) + deltaTime * 2;
                }
                BossObjectSystem.resolveKasiyasP3SpaceDistortionOverlaps.call(this, gameState, obj);
            }
        }

        obj.suctionFxTimer = (parseFloat(obj.suctionFxTimer) || 0) - deltaTime;
        if (obj.suctionFxTimer <= 0 && Array.isArray(gameState.effects)) {
            obj.suctionFxTimer = 0.10;
            gameState.effects.push({
                type: 'p3DimensionCrackSuction',
                renderType: 'EFT_P3_DIMENSION_CRACK_SUCTION',
                x: centerX,
                y: centerY,
                z: 14,
                w: Math.max(360, parseFloat(obj.fieldRangeX) || 900),
                d: Math.max(160, parseFloat(obj.fieldRangeY) || 360),
                h: Math.max(100, parseFloat(obj.h) || 240),
                life: 0.55,
                maxLife: 0.55
            });
        }
    },

    updateKasiyasP3DimensionCrackObject: function(obj, deltaTime, gameState) {
        obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
        BossObjectSystem.applyKasiyasP3DimensionCrackPullField.call(this, obj, deltaTime, gameState);

        const t = obj.timer;
        if (t >= obj.hitStart && t <= obj.hitEnd && (obj.hitsDone || 0) < obj.hitCount) {
            obj.hitCycleTimer = (parseFloat(obj.hitCycleTimer) || 0) + deltaTime;
            if (obj.hitCycleTimer >= obj.hitCycle) {
                obj.hitCycleTimer = 0;
                obj.hitsDone = (obj.hitsDone || 0) + 1;
                const p = gameState && gameState.player ? gameState.player : null;
                if (p && p.active && p.hp > 0 && BossObjectSystem.isPlayerInsideKasiyasP3SpaceObject(p, obj)) {
                    const owner = obj.owner || obj.sourceCaster || (Array.isArray(gameState.monsters) && gameState.monsters[0]) || null;
                    if (owner && owner.d) {
                        const data = obj.data || {};
                        const attackData = {
                            ...data,
                            ATK_Hit_Count: data.Object_ATK_Hit_Count,
                            ATK_Cycle: data.Object_ATK_Cycle,
                            ATK_Damage_Rate: data.Object_DMG_Rate,
                            Action_Anim_Duration: data.Object_Internal_Duration,
                            Action_Attack_Type: data.Object_Type,
                            Guard_Direction_Type: data.Guard_Direction_Type || 'ANY_DIRECTION'
                        };
                        const baseDmg = (parseFloat(owner.d.atk) || 1) * (parseFloat(data.Object_DMG_Rate) || 1);
                        if (gameState.hitboxes) gameState.hitboxes.push({ x: obj.x, y: obj.y, z: 0, w: obj.w, d: obj.d, h: obj.h, life: 0.10, sourceObject: obj, sourceObjectId: String(data.Object_ID || '') });
                        PlayerManager.takeDamage(gameState, calcScaledDamage(owner.d.level || 1, p.level || 1, baseDmg), obj.x, obj.y, null, 0, 0, this.buildGuardInfoFromAttackData(attackData, obj));
                    }
                }
            }
        }

        if (BossObjectSystem.isKasiyasP3DimensionCrackRemoveActionFinished.call(this, obj, gameState) || t >= Math.max(0.1, parseFloat(obj.maxLife) || 7)) {
            BossObjectSystem.finishKasiyasP3DimensionCrackObject.call(this, obj, gameState);
            return false;
        }
        return true;
    },

    updateKasiyasP3DimensionCrackBurstObject: function(obj, deltaTime, gameState) {
        obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
        const t = obj.timer;
        if (t >= obj.hitStart && t <= obj.hitEnd && (obj.hitsDone || 0) < obj.hitCount) {
            obj.hitCycleTimer = (parseFloat(obj.hitCycleTimer) || 0) + deltaTime;
            if (obj.hitCycleTimer >= obj.hitCycle) {
                obj.hitCycleTimer = 0;
                obj.hitsDone = (obj.hitsDone || 0) + 1;
                const p = gameState && gameState.player ? gameState.player : null;
                if (p && p.active && p.hp > 0 && BossObjectSystem.isPlayerInsideKasiyasP3SpaceObject(p, obj)) {
                    const owner = obj.owner || obj.sourceCaster || (Array.isArray(gameState.monsters) && gameState.monsters[0]) || null;
                    if (owner && owner.d) {
                        const data = obj.data || {};
                        const attackData = {
                            ...data,
                            ATK_Hit_Count: data.Object_ATK_Hit_Count,
                            ATK_Cycle: data.Object_ATK_Cycle,
                            ATK_Damage_Rate: data.Object_DMG_Rate,
                            Action_Anim_Duration: data.Object_Internal_Duration,
                            Action_Attack_Type: data.Object_Type,
                            Guard_Direction_Type: data.Guard_Direction_Type || 'ANY_DIRECTION'
                        };
                        const baseDmg = (parseFloat(owner.d.atk) || 1) * (parseFloat(data.Object_DMG_Rate) || 1);
                        if (gameState.hitboxes) gameState.hitboxes.push({ x: obj.x, y: obj.y, z: 0, w: obj.w, d: obj.d, h: obj.h, life: 0.10, sourceObject: obj, sourceObjectId: String(data.Object_ID || '') });
                        PlayerManager.takeDamage(gameState, calcScaledDamage(owner.d.level || 1, p.level || 1, baseDmg), obj.x, obj.y, null, 0, 0, this.buildGuardInfoFromAttackData(attackData, obj));
                    }
                }
            }
        }
        return t < Math.max(0.1, parseFloat(obj.maxLife) || 2.0);
    },

    updateBossAttackObjects: function(deltaTime, gameState) {
        if (typeof this.flushKasiyasP2M2PendingSpecialObjectSpawns === 'function') {
            this.flushKasiyasP2M2PendingSpecialObjectSpawns(gameState);
        }
        if (gameState && gameState.p2m2LastFiredSword) {
            gameState.p2m2LastFiredSword.timer = Math.max(0, (parseFloat(gameState.p2m2LastFiredSword.timer) || 0) - (parseFloat(deltaTime) || 0));
            if (gameState.p2m2LastFiredSword.timer <= 0) gameState.p2m2LastFiredSword = null;
        }
        const objects = gameState.bossAttackObjects || [];
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (!obj || !obj.active) { objects.splice(i, 1); continue; }

            if (obj.kind === 'p3GiantSwordTrace') {
                if (!BossObjectSystem.updateKasiyasP3GiantSwordTraceObject.call(this, obj, deltaTime, gameState)) {
                    obj.active = false;
                    objects.splice(i, 1);
                }
                continue;
            }

            if (obj.kind === 'p3SpaceDistortion') {
                if (!BossObjectSystem.updateKasiyasP3SpaceDistortionObject.call(this, obj, deltaTime, gameState)) {
                    obj.active = false;
                    objects.splice(i, 1);
                }
                continue;
            }

            if (obj.kind === 'p3SpaceBurst') {
                if (!BossObjectSystem.updateKasiyasP3SpaceBurstObject.call(this, obj, deltaTime, gameState)) {
                    obj.active = false;
                    objects.splice(i, 1);
                }
                continue;
            }

            if (obj.kind === 'p3DimensionCrack') {
                if (!BossObjectSystem.updateKasiyasP3DimensionCrackObject.call(this, obj, deltaTime, gameState)) {
                    obj.active = false;
                    objects.splice(i, 1);
                }
                continue;
            }

            if (obj.kind === 'p3DimensionCrackBurst') {
                if (!BossObjectSystem.updateKasiyasP3DimensionCrackBurstObject.call(this, obj, deltaTime, gameState)) {
                    obj.active = false;
                    objects.splice(i, 1);
                }
                continue;
            }

            if (obj.kind === 'terrain') {
                obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
                const objectType = String(obj.objectType || obj.data && obj.data.Object_Type || '').trim().toUpperCase();
                const removeCond = String(obj.data && obj.data.Object_Remove_Cond || '').trim().toUpperCase();
                const maxLife = parseFloat(obj.maxLife) || parseFloat(obj.data && obj.data.Object_Internal_Duration) || 0;
                if ((objectType === 'TERRAIN_COLLAPSE' || objectType === 'TERRAIN_COLLAPSE_HIT') && !obj.terrainHitApplied) {
                    this.applyTerrainCollapseHit(obj, gameState);
                }
                const durationRemove = maxLife > 0 && (
                    objectType === 'TERRAIN_COLLAPSE' || objectType === 'TERRAIN_COLLAPSE_HIT' ||
                    removeCond === 'OBJECT_INTERNAL_DURATION_TIME_OVER' || removeCond === 'DURATION_TIME_OVER' ||
                    objectType === 'TERRAIN_BLOCK' || objectType === 'TERRAIN_BLOCKER'
                );
                if (durationRemove && obj.timer >= maxLife) {
                    obj.active = false;
                    objects.splice(i, 1);
                    continue;
                }
                continue;
            }

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

            if (obj.kind === 'dimensionPortal') {
                obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
                if (obj.timer > (parseFloat(obj.maxLife) || 3.8)) {
                    objects.splice(i, 1);
                    continue;
                }
                continue;
            }

            if (obj.kind === 'fallingSwordRain') {
                obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
                const data = obj.data || {};
                const p = gameState.player || null;
                const maxLife = Math.max(0.1, parseFloat(obj.maxLife) || 2.0);
                const warningDuration = Math.max(0.08, parseFloat(obj.warningDuration) || parseFloat(data.Warning_Duration) || 0.45);
                const delayTime = Math.max(0, parseFloat(obj.hitboxDelayTime) || parseFloat(data.Hitbox_Delay_Time) || 0);
                const hitDuration = Math.max(0.05, parseFloat(obj.hitDuration) || parseFloat(data.Hitbox_Duration) || 0.14);
                const impactStart = warningDuration + delayTime;
                const impactEnd = impactStart + hitDuration;
                const owner = obj.owner || obj.sourceCaster;
                const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400);
                const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400);

                if (obj.timer <= maxLife && p && p.active && p.hp > 0) {
                    obj.spawnTimer = (parseFloat(obj.spawnTimer) || 0) - deltaTime;
                    const interval = Math.max(0.05, Math.min(1.5, parseFloat(obj.spawnInterval) || 0.16));
                    let guard = 0;
                    while (obj.spawnTimer <= 0 && guard < 3) {
                        guard++;
                        obj.spawnTimer += interval + (Math.random() * 0.035 - 0.012);
                        const predictTime = 0.40;
                        const vx = parseFloat(p.vx || p.moveVx || p.kbVx || 0) || 0;
                        const vy = parseFloat(p.vy || p.moveVy || p.kbVy || 0) || 0;
                        const spreadX = 48 + Math.random() * 64;
                        const spreadY = 24 + Math.random() * 42;
                        const rawPlayerX = parseFloat(p.x);
                        const rawPlayerY = parseFloat(p.y);
                        const basePlayerX = Number.isFinite(rawPlayerX) ? rawPlayerX : worldW / 2;
                        const basePlayerY = Number.isFinite(rawPlayerY) ? rawPlayerY : worldD / 2;
                        const x = Math.max(45, Math.min(worldW - 45, basePlayerX + vx * predictTime + (Math.random() * 2 - 1) * spreadX));
                        const y = Math.max(28, Math.min(worldD - 28, basePlayerY + vy * predictTime + (Math.random() * 2 - 1) * spreadY));
                        obj.swords.push({
                            x: x,
                            y: y,
                            z: 0,
                            elapsed: 0,
                            warningDuration: warningDuration,
                            delayTime: delayTime,
                            hitDuration: hitDuration,
                            angle: (Math.random() * 0.22 - 0.11),
                            scale: 0.78 + Math.random() * 0.36,
                            impactFired: false,
                            seed: Math.random() * 1000
                        });
                        obj.swordSpawnedCount = (parseInt(obj.swordSpawnedCount) || 0) + 1;
                    }
                }

                const hitW = Math.max(20, parseFloat(data.Hitbox_Size_X) || 150);
                const hitD = Math.max(20, parseFloat(data.Hitbox_Size_Y) || 90);
                const hitH = Math.max(10, parseFloat(data.Hitbox_Size_Z) || 1000);
                const swords = Array.isArray(obj.swords) ? obj.swords : (obj.swords = []);
                for (let si = swords.length - 1; si >= 0; si--) {
                    const sword = swords[si];
                    sword.elapsed = (parseFloat(sword.elapsed) || 0) + deltaTime;
                    const sImpactStart = Math.max(0.08, parseFloat(sword.warningDuration) || warningDuration) + Math.max(0, parseFloat(sword.delayTime) || delayTime);
                    const sImpactEnd = sImpactStart + Math.max(0.05, parseFloat(sword.hitDuration) || hitDuration);
                    if (sword.elapsed >= sImpactStart && !sword.impactFired) {
                        sword.impactFired = true;
                        const hitbox = { x: sword.x, y: sword.y, z: 0, w: hitW, d: hitD, h: hitH };
                        gameState.hitboxes.push({ ...hitbox, type: 'circle', life: 0.12, sourceObject: obj });
                        if (gameState.effects) {
                            gameState.effects.push({
                                type: 'fallingSwordImpact',
                                renderType: data.VFX_Type || 'EFT_DIMENSION_PORTAL_SWORD_RAIN',
                                x: sword.x,
                                y: sword.y,
                                z: 0,
                                w: hitW,
                                d: hitD,
                                h: hitH,
                                life: 0.32,
                                maxLife: 0.32
                            });
                        }
                        const isHit = this.isPlayerInsideCircleHitbox(hitbox, gameState);
                        if (isHit && owner && owner.hp > 0) {
                            const dmgRate = parseFloat(data.Object_DMG_Rate || data.Damage_Rate || data.ATK_Damage_Rate) || 0.3;
                            const baseDmg = owner.d.atk * dmgRate;
                            this.pushBossDebugLog(
                                gameState,
                                'OBJECT_HIT',
                                `${String(data.Object_ID || '').trim()} ${this.getBossDebugName(data)}`,
                                `falling sword / damage ${baseDmg.toFixed(1)}`
                            );
                            PlayerManager.takeDamage(
                                gameState,
                                calcScaledDamage(owner.d.level, gameState.player.level, baseDmg),
                                sword.x,
                                sword.y,
                                null,
                                0,
                                0,
                                this.buildGuardInfoFromAttackData(data, obj)
                            );
                        }
                    }
                    if (sword.elapsed > sImpactEnd + 0.34) {
                        swords.splice(si, 1);
                    }
                }

                if (obj.timer > maxLife && swords.length <= 0) {
                    objects.splice(i, 1);
                    continue;
                }
                continue;
            }

            if (obj.kind === 'swordWave') {
                obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
                const data = obj.data || {};
                const speed = Math.max(1, parseFloat(obj.moveSpeed) || 520);
                const dirX = parseFloat(obj.moveDirX) || (obj.faceDir === -1 ? -1 : 1);
                const dirY = parseFloat(obj.moveDirY) || 0;
                const prevX = Number.isFinite(parseFloat(obj.x)) ? parseFloat(obj.x) : 0;
                const prevY = Number.isFinite(parseFloat(obj.y)) ? parseFloat(obj.y) : 0;
                obj.x = prevX + dirX * speed * deltaTime;
                obj.y = prevY + dirY * speed * deltaTime;
                const moveDeltaX = obj.x - prevX;
                const moveDeltaY = obj.y - prevY;
                const hitCount = Math.max(1, parseInt(data.Object_ATK_Hit_Count || data.ATK_Hit_Count) || 1);
                const cycle = Math.max(0.05, parseFloat(data.Object_ATK_Cycle || data.ATK_Cycle) || 0.3);
                const owner = obj.owner;
                const p = gameState.player;
                if (owner && owner.hp > 0 && p && p.active && p.hp > 0 && (obj.hitsDone || 0) < hitCount) {
                    const h = Math.max(40, parseFloat(obj.h) || parseFloat(data.Hitbox_Size_Z) || 200);
                    const w = Math.max(40, parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 200);
                    const d = Math.max(30, parseFloat(obj.d) || parseFloat(data.Hitbox_Size_Y) || 150);
                    // 검기는 이동 중 항상 판정이 존재하는 오브젝트로 처리한다.
                    // 이전 프레임 위치와 현재 위치를 잇는 스윕 박스를 매 프레임 생성해
                    // 빠르게 지나가는 검기가 깜빡이는 판정처럼 느껴지는 문제를 줄인다.
                    const hitbox = {
                        x: (prevX + obj.x) * 0.5,
                        y: (prevY + obj.y) * 0.5,
                        z: Math.max(0, (parseFloat(obj.z) || 0) - h * 0.50),
                        w: w + Math.abs(moveDeltaX) + 28,
                        d: d + Math.abs(moveDeltaY) + 12,
                        h: h
                    };
                    gameState.hitboxes.push({ ...hitbox, life: 0.08, sourceObject: obj, sourceObjectId: String(data.Object_ID || ''), swordWave: true });
                    if (this.isPlayerInsideBoxHitbox(hitbox, gameState)) {
                        const now = parseFloat(obj.timer) || 0;
                        let record = obj.hitTargets && obj.hitTargets.get(p);
                        if (typeof record === 'number') record = { count: 1, lastTime: record };
                        if (!record) record = { count: 0, lastTime: -999 };
                        if (record.count < hitCount && now - record.lastTime >= cycle) {
                            record.count += 1;
                            record.lastTime = now;
                            if (obj.hitTargets) obj.hitTargets.set(p, record);
                            const dmgRate = parseFloat(data.Object_DMG_Rate || data.Damage_Rate || data.ATK_Damage_Rate) || 0.3;
                            const baseDmg = owner.d.atk * dmgRate;
                            this.pushBossDebugLog(gameState, 'OBJECT_HIT', `${String(data.Object_ID || '').trim()} ${this.getBossDebugName(data)}`, `sword wave / damage ${baseDmg.toFixed(1)} / hit ${record.count}/${hitCount}`);
                            const result = PlayerManager.takeDamage(gameState, calcScaledDamage(owner.d.level, p.level, baseDmg), hitbox.x, hitbox.y, null, 0, 0, this.buildGuardInfoFromAttackData(data, obj)) || {};
                            this.applyKasiyasOniMarkAttackResult(gameState, 'OBJECT', data, result, owner);
                            const madeSpaceDistortion = BossObjectSystem.tryCreateKasiyasP3SpaceDistortionFromSwordWaveGuard.call(this, obj, gameState, hitbox, result);
                            obj.hitsDone = Math.max(obj.hitsDone || 0, record.count);
                            if (madeSpaceDistortion) {
                                obj.active = false;
                                const objIndex = objects.indexOf(obj);
                                if (objIndex >= 0) objects.splice(objIndex, 1);
                                continue;
                            }
                        }
                    }
                }
                if (obj.timer > (parseFloat(obj.maxLife) || 3) || obj.x < -220 || obj.x > (gameState.WORLD_WIDTH || 1400) + 220) {
                    objects.splice(i, 1);
                }
                continue;
            }

            if (obj.kind === 'areaDelayed') {
                obj.timer += deltaTime;
                const data = obj.data || {};
                const hitCount = Math.max(1, parseInt(data.Object_ATK_Hit_Count || data.ATK_Hit_Count) || 1);
                const cycle = Math.max(0.01, parseFloat(data.Object_ATK_Cycle || data.ATK_Cycle) || 0.1);
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
                        const shockRender = String(data.VFX_Type || data.Effect_Render_Type || data.Object_Render_Type || '').trim().toUpperCase();
                        const shockObjectType = String(data.Object_Type || '').trim().toUpperCase();
                        if ((shockObjectType === 'SHOCKWAVE' || shockRender.indexOf('SHOCKWAVE') >= 0) && typeof this.triggerScreenShake === 'function') {
                            this.triggerScreenShake(gameState, 7.5, Math.max(0.28, Math.min(0.60, (parseFloat(obj.hitDuration) || 0.35) + 0.10)));
                        }
                        const isHit = hitboxType === 'HITBOX_CIRCLE'
                            ? this.isPlayerInsideCircleHitbox(hitbox, gameState)
                            : this.isPlayerInsideBoxHitbox(hitbox, gameState);
                        if (isHit && obj.owner && obj.owner.hp > 0) {
                            const baseDmg = obj.owner.d.atk * (parseFloat(data.Object_DMG_Rate || data.Damage_Rate || data.ATK_Damage_Rate) || 1);
                            this.pushBossDebugLog(gameState, 'OBJECT_HIT', `${String(data.Object_ID || '').trim()} ${this.getBossDebugName(data)}`, `${hitboxType || 'HITBOX'} / damage ${baseDmg.toFixed(1)}`);
                            PlayerManager.takeDamage(gameState, calcScaledDamage(obj.owner.d.level, gameState.player.level, baseDmg), obj.x, obj.y, null, 0, 0, this.buildGuardInfoFromAttackData(data, obj));
                        }
                    }
                }
                if (obj.timer > obj.hitDuration + 0.05 || obj.hitsDone >= hitCount) {
                    objects.splice(i, 1);
                }
                continue;
            }

            if (obj.kind === 'interactiveSword' || obj.kind === 'interactObject') {
                obj.timer += deltaTime;
                const limit = Math.max(1, parseInt(obj.maxInteractLimit) || 1);
                obj.canInteract = !obj.disabled && !obj.absorbed && (parseInt(obj.interactCount) || 0) < limit && this.isBossObjectInteractionConditionMet(obj, gameState) && this.isPlayerInsideBossObjectGetRange(obj, gameState);
                obj.interactPulse = obj.canInteract ? ((parseFloat(obj.interactPulse) || 0) + deltaTime) : 0;

                if (obj.maxLife && obj.timer > obj.maxLife) {
                    objects.splice(i, 1);
                    continue;
                }
                continue;
            }

            if (obj.kind === 'aimingObject') {
                obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
                const keys = gameState.keys || {};
                const cancelDown = !!keys.KeyC;
                if (!cancelDown) obj.cancelKeyLatch = false;
                if (cancelDown && !obj.cancelKeyLatch) {
                    obj.cancelKeyLatch = true;
                    this.cancelKasiyasP2M2GiantSwordAim(obj, objects, gameState);
                    continue;
                }

                const minA = Number.isFinite(parseFloat(obj.aimMinAngle)) ? parseFloat(obj.aimMinAngle) : -75;
                const maxA = Number.isFinite(parseFloat(obj.aimMaxAngle)) ? parseFloat(obj.aimMaxAngle) : -10;
                let angle = Number.isFinite(parseFloat(obj.aimAngle)) ? parseFloat(obj.aimAngle) : -35;
                const speed = Math.max(1, parseFloat(obj.aimAngleSpeed) || 45);
                if (keys.ArrowLeft || keys.KeyA) obj.fireDirection = 'LEFT';
                if (keys.ArrowRight || keys.KeyD) obj.fireDirection = 'RIGHT';
                if (keys.KeyX) angle -= speed * deltaTime;
                else angle += speed * deltaTime;
                obj.aimAngle = Math.max(Math.min(minA, maxA), Math.min(Math.max(minA, maxA), angle));
                const fireDown = !!(keys.KeyZ || keys.Space);
                if (!fireDown) obj.fireKeyLatch = false;
                if (fireDown && !obj.fireKeyLatch && !obj.fired) {
                    obj.fired = true;
                    obj.fireKeyLatch = true;
                    const fireId = String(obj.aimFireObjectId || obj.data && (obj.data.Aim_Fire_Object_ID || obj.data.Aim_Result_Value || obj.data.Object_Interact_Value) || '252023').trim();
                    const sourceX = obj.x;
                    const sourceY = obj.y;
                    const sourceZ = obj.z;
                    const sourceH = obj.h;
                    // 거대한 검은 완전 1회용 파훼 오브젝트로 사용한다.
                    // 단, 발사체가 만들어지기 전에 252021/252022를 먼저 제거하면 source 참조가 꼬이거나
                    // 발사 직후 검이 사라져 보일 수 있으므로, 252023 발사체를 먼저 생성하고 보호 플래그를 붙인 뒤 정리한다.
                    const firedObj = this.createKasiyasP2M2SpecialObject(fireId, gameState, obj, {
                        x: sourceX,
                        y: sourceY,
                        z: sourceZ + Math.max(24, (parseFloat(sourceH) || 180) * 0.16),
                        angle: obj.aimAngle,
                        fireSpeed: obj.aimFireSpeed,
                        fireDirection: obj.fireDirection
                    });
                    if (firedObj) {
                        firedObj.keepUntilPerfectBreakCleanup = true;
                        firedObj.maxLife = Math.max(parseFloat(firedObj.maxLife) || 0, 4.2);
                        firedObj.active = true;
                    }
                    if (typeof this.removeKasiyasP2M2BrokenGiantSwordObjectsAfterFire === 'function') {
                        this.removeKasiyasP2M2BrokenGiantSwordObjectsAfterFire(objects, gameState);
                    }
                    if (gameState.effects) {
                        gameState.effects.push({ type: 'p2m2GiantSwordHit', x: obj.x, y: obj.y, z: obj.z + 80, w: obj.w, h: obj.h, life: 0.25, maxLife: 0.25 });
                    }
                    obj.active = false;
                    gameState.p2m2GiantSwordAim = null;
                    gameState.p2m2GiantSwordInputBlockTimer = Math.max(parseFloat(gameState.p2m2GiantSwordInputBlockTimer) || 0, 0.18);
                    gameState.p2m2GiantSwordInputConsumed = { KeyX: !!(keys.KeyX), KeyZ: !!(keys.KeyZ), Space: !!(keys.Space), KeyC: !!(keys.KeyC), ArrowLeft: !!(keys.ArrowLeft), ArrowRight: !!(keys.ArrowRight) };
                    const idx = objects.indexOf(obj);
                    if (idx >= 0) objects.splice(idx, 1);
                    continue;
                }
                if (obj.timer > Math.max(0.5, parseFloat(obj.aimTimeLimit) || parseFloat(obj.maxLife) || 10)) {
                    obj.active = false;
                    gameState.p2m2GiantSwordAim = null;
                    gameState.p2m2GiantSwordInputBlockTimer = Math.max(parseFloat(gameState.p2m2GiantSwordInputBlockTimer) || 0, 0.12);
                    gameState.p2m2GiantSwordInputConsumed = { KeyX: !!(keys.KeyX), KeyZ: !!(keys.KeyZ), Space: !!(keys.Space), KeyC: !!(keys.KeyC), ArrowLeft: !!(keys.ArrowLeft), ArrowRight: !!(keys.ArrowRight) };
                    objects.splice(i, 1);
                    continue;
                }
                continue;
            }

            if (obj.kind === 'p2m2FiredGiantSword') {
                obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
                const prevX = Number.isFinite(parseFloat(obj.x)) ? parseFloat(obj.x) : 0;
                const prevZ = Number.isFinite(parseFloat(obj.z)) ? parseFloat(obj.z) : 0;
                obj.x = prevX + (parseFloat(obj.vx) || 0) * deltaTime;
                obj.z = prevZ + (parseFloat(obj.vz) || 0) * deltaTime;
                obj.y = (parseFloat(obj.y) || 0) + (parseFloat(obj.vy) || 0) * deltaTime;
                if (gameState) {
                    const dir = String(obj.fireDirection || ((parseFloat(obj.vx) || 0) < 0 ? 'LEFT' : 'RIGHT')).toUpperCase();
                    gameState.p2m2LastFiredSword = {
                        direction: dir === 'LEFT' ? 'LEFT' : 'RIGHT',
                        x: obj.x, y: obj.y, z: obj.z, w: obj.w, h: obj.h,
                        timer: Math.max(4.0, parseFloat(gameState.p2m2LastFiredSword && gameState.p2m2LastFiredSword.timer) || 0)
                    };
                }
                const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400);
                const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400);
                if (gameState.hitboxes) {
                    gameState.hitboxes.push({ x: obj.x, y: obj.y, z: obj.z, w: Math.max(80, parseFloat(obj.w) || 300), d: Math.max(50, parseFloat(obj.d) || 150), h: Math.max(80, parseFloat(obj.h) || 150), life: 0.08, sourceObject: obj, sourceObjectId: String(obj.data && obj.data.Object_ID || '') });
                }
                const keepUntilPerfectBreakCleanup = !!obj.keepUntilPerfectBreakCleanup && obj.timer <= Math.max(0.1, parseFloat(obj.maxLife) || 3.5);
                if (!keepUntilPerfectBreakCleanup && (obj.timer > (parseFloat(obj.maxLife) || 3.5) || obj.x < -260 || obj.x > worldW + 260 || obj.y < -180 || obj.y > worldD + 180 || obj.z > 900 || obj.z < -120)) {
                    obj.active = false;
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
                    if (typeof this.updateBossObjectInlineActionWarning === 'function') {
                        this.updateBossObjectInlineActionWarning(obj, obj.action, gameState);
                    }

                    const actionType = String(obj.action.Action_Type || '').trim().toUpperCase();
                    const actionHitboxType = String(obj.action.Hitbox_Type || '').trim().toUpperCase();
                    const moveActionHasAttack = actionType === 'MOVE'
                        && (actionHitboxType === 'HITBOX_BOX' || actionHitboxType === 'HITBOX_CIRCLE' || actionHitboxType === 'HITBOX_BODY_COLLISION')
                        && !isNaN(parseFloat(obj.action.ATK_Damage_Rate || obj.action.Damage_Rate));
                    if ((actionType === 'ATK' || moveActionHasAttack) && !obj.actionCancelled) {
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
                                const objTypeForHitCount = String(obj && (obj.objectType || obj.data && obj.data.Object_Type) || '').trim().toUpperCase();
                                const isSwordWallMoveHit = objTypeForHitCount === 'SWORD_WALL' || objTypeForHitCount === 'SWORD_WALL_GIANT_SWORD' || String(obj && obj.renderType || '').trim().toUpperCase().indexOf('P2_M2_SWORD_WALL') >= 0;
                                if (isBodyCollision || isSwordWallMoveHit) {
                                    // 돌진 몸통 판정과 검벽 이동 판정은 실제 충돌했을 때만 횟수를 소비한다.
                                    // 빗나간 첫 프레임에서 카운트가 사라지면 이동 오브젝트가 통과해도 공격이 없는 것처럼 보인다.
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

            if (obj.kind === 'pathDelayed' && obj.visualLinked) {
                obj.timer = (parseFloat(obj.timer) || 0) + deltaTime;
                const data = obj.data || {};
                const hitCount = Math.max(1, parseInt(data.Object_ATK_Hit_Count || data.ATK_Hit_Count) || 1);
                const cycle = Math.max(0.01, parseFloat(data.Object_ATK_Cycle || data.ATK_Cycle) || 0.1);
                const hitDelay = Math.max(0, parseFloat(obj.hitboxDelayTime) || 0);
                const hitStart = obj.warningDuration + hitDelay;
                const hitEnd = hitStart + obj.hitDuration;

                const path = obj.path || {};
                const owner = obj.owner || null;
                const fragments = Array.isArray(obj.trailFragments) ? obj.trailFragments : (obj.trailFragments = []);
                const sx = Number.isFinite(parseFloat(path.startX)) ? parseFloat(path.startX) : 0;
                const sy = Number.isFinite(parseFloat(path.startY)) ? parseFloat(path.startY) : 0;
                const ex = Number.isFinite(parseFloat(path.endX)) ? parseFloat(path.endX) : sx;
                const ey = Number.isFinite(parseFloat(path.endY)) ? parseFloat(path.endY) : sy;
                const dxPath = ex - sx;
                const dyPath = ey - sy;
                const pathLen = Math.max(1, Math.hypot(dxPath, dyPath));

                // 도깨비 베기 잔류 검격은 업데이트 순서에 흔들리는 현재 좌표 샘플링 대신,
                // 전조와 실제 돌진이 공유하는 CURRENT_DASH_PATH 위에 순차적으로 남긴다.
                // 시작점/도착점 단독 검격은 제외하여 도착 지점에 검격 하나만 찍히는 현상을 방지한다.
                if (obj.timer <= Math.max(0.05, obj.warningDuration)) {
                    const progress = Math.max(0, Math.min(1, obj.timer / Math.max(0.05, obj.warningDuration)));
                    const endT = Math.max(0.08, Math.min(0.88, 0.08 + progress * 0.80));
                    const sampleStep = Math.max(0.045, Math.min(0.095, 46 / pathLen));
                    let nextT = Number.isFinite(parseFloat(obj.trailNextT)) ? parseFloat(obj.trailNextT) : 0.08;
                    let guard = 0;
                    while (nextT <= endT && guard < 12) {
                        guard++;
                        const jitterT = Math.max(0.08, Math.min(0.88, nextT + (Math.random() * 2 - 1) * sampleStep * 0.20));
                        fragments.push({
                            x: sx + dxPath * jitterT,
                            y: sy + dyPath * jitterT,
                            t: jitterT,
                            createdAt: obj.timer,
                            side: (Math.random() * 2 - 1) * Math.max(8, (parseFloat(obj.width) || 120) * 0.16),
                            rot: (Math.random() * 0.30 - 0.15)
                        });
                        nextT += sampleStep;
                        if (fragments.length > 48) fragments.shift();
                    }
                    obj.trailNextT = nextT;
                }

                if (obj.timer >= hitStart && !obj.effectFired) {
                    obj.effectFired = true;
                }

                if (obj.timer >= hitStart && obj.timer <= hitEnd && obj.hitsDone < hitCount) {
                    obj.cycleTimer += deltaTime;
                    if (obj.cycleTimer >= cycle) {
                        obj.cycleTimer = 0;
                        obj.hitsDone++;
                        this.pushDebugPathHitbox(obj.path, obj.width, obj.height, 0.12, gameState);
                        if (this.isPlayerInsidePathHitbox(obj.path, obj.width, obj.height, gameState)) {
                            if (owner && owner.hp > 0) {
                                const dmgRate = parseFloat(data.Object_DMG_Rate || data.Damage_Rate || data.ATK_Damage_Rate) || 1;
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
                                    this.buildGuardInfoFromAttackData(data, obj)
                                );
                            }
                        }
                    }
                }

                if (obj.timer > hitEnd + 0.18 || obj.hitsDone >= hitCount) {
                    objects.splice(i, 1);
                }
                continue;
            }

            obj.timer += deltaTime;
            const data = obj.data || {};
            const hitCount = Math.max(1, parseInt(data.Object_ATK_Hit_Count || data.ATK_Hit_Count) || 1);
            const cycle = Math.max(0.01, parseFloat(data.Object_ATK_Cycle || data.ATK_Cycle) || 0.1);
            const hitDelay = Math.max(0, parseFloat(obj.hitboxDelayTime) || 0);
            const hitStart = obj.warningDuration + hitDelay;
            const hitEnd = hitStart + obj.hitDuration;

            if (obj.timer >= hitStart && !obj.effectFired) {
                obj.effectFired = true;
                if (!obj.visualLinked) {
                    this.pushPathSlashEffects(obj.path, obj.width, obj.height, data.VFX_Type || data.Effect_Render_Type || 'EFT_MANY_SLASH_BURST', gameState);
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
                            const dmgRate = parseFloat(data.Object_DMG_Rate || data.Damage_Rate || data.ATK_Damage_Rate) || 1;
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
                                this.buildGuardInfoFromAttackData(data, obj)
                            );
                        }
                    }
                }
            }

            if (obj.timer > hitEnd + 0.05 || obj.hitsDone >= hitCount) {
                objects.splice(i, 1);
            }
        }

        this.applyTerrainPlayerBlockers(gameState);

        const nearestSword = this.refreshNearestBossInteractiveSwordTarget(gameState);
        if (nearestSword && this.isBossObjectGetInputActive(nearestSword, gameState)) {
            this.consumeBossInteractiveSword(nearestSword, objects, gameState);
            this.refreshNearestBossInteractiveSwordTarget(gameState);
        }
    },
};

