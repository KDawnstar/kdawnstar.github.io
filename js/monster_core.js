// ==========================================
// [모험의 시작] 몬스터 코어 엔진 (monster_core.js)
// ==========================================


const MonsterDataAdapter = {
    normalizeAtkType(value) {
        const v = String(value || '').trim();
        if (v === 'ATK_PROJECTILE') return 'Range';
        if (v === 'ATK_MELEE') return 'Melee';
        return v;
    },
    normalizeDefType(value) {
        const v = String(value || '').trim();
        if (v === 'DEF_SUPERARMOR' || v === 'SUPER_ARMOR') return 'SuperArmor';
        if (v === 'DEF_NORMAL' || v === 'NORMAL') return 'Normal';
        return v;
    },
    normalizeSkillType(value) {
        const v = String(value || '').trim();
        if (v === 'SKILL_AURA') return 'Aura_Area_ATK';
        if (v === 'SKILL_MELEE') return 'Melee_Area_ATK';
        if (v === 'SKILL_TARGET') return 'Target_Area_ATK';
        return v;
    },
    normalizePlace(value) {
        const v = String(value || '').trim();
        if (v === 'PLACE_TARGET_GROUND') return 'On_Warning_Effect';
        if (v === 'PLACE_CASTER_FRONT') return 'Front_Monster';
        if (v === 'PLACE_CASTER_AURA') return 'Range_From_Monster';
        return v;
    },
    normalizeWarningPlace(value) {
        const v = String(value || '').trim();
        if (v === 'PLACE_CASTER_FRONT') return 'Skill_ATK_Hitbox';
        return v;
    },
    normalizeStatus(value) {
        const v = String(value || '').trim();
        if (v === 'STATE_FREEZE') return 'Freeze';
        return v;
    }
};

const MonsterManager = {
    init: function(monsterData, patternData, skillData, gameState) {
        let colors = { 'M001':'#4CAF50', 'M002':'#8BC34A', 'M003':'#FF9800', 'M004':'#FFEB3B', 'M005':'#9C27B0', 'M006':'#00BCD4', 'M007':'#E91E63', 'B001':'#f1c40f', 'B002':'#3498db'}; 
            (monsterData||[]).forEach(m => { 
            const monsterKey = String(m.Monster_ID || '').trim();
            if (!monsterKey) return;

            const monsterRecord = {
                id: monsterKey,
                name: m.Monster_Name || 'Unknown',
                level: parseInt(m.Level) || 1,
                exp: parseInt(m.Provision_EXP) || 10,
                hp: parseFloat(m.HP) || 1,
                maxHp: parseFloat(m.HP) || 1,
                atk: parseFloat(m.ATK) || 0,
                def: parseFloat(m.DEF) || 0,
                speed: parseFloat(m.Move_Speed) || 0,
                monsterType: m.Monster_Type || m.Monster_Grade || '',
                patternSetId: m.Pattern_Set_ID || null,
                aggressive:
                    String(m.Aggressive).toLowerCase() === 'true' ||
                    m.Aggressive === true ||
                    String(m.Monster_Type || '').toUpperCase() === 'BOSS' ||
                    String(m.AI_Type || '').toUpperCase() === 'BOSS_PATTERN',

                recog: parseFloat(m.Recog_Range) || 0,
                unrecog: parseFloat(m.UnRecog_Range) || 0,
                chase: parseFloat(m.Chase_Range) || 0,
                evade: parseFloat(m.Evade_Range) || 0,

                cx: m.Spawn_Center_X !== "" && m.Spawn_Center_X != null ? parseFloat(m.Spawn_Center_X) : "",
                rx: parseFloat(m.Spawn_Range_X) || 0,
                cy: m.Spawn_Center_Y !== "" && m.Spawn_Center_Y != null ? parseFloat(m.Spawn_Center_Y) : gameState.WORLD_DEPTH / 2,
                ry: parseFloat(m.Spawn_Range_Y) || 50,

                spawnLimit: parseInt(m.Monster_Spawn_Limit) || 1,
                spawnInterval: parseFloat(m.Normal_Spawn_Time) || 1.0,
                respawnTime: m.Respawn_Time !== "" && m.Respawn_Time != null ? parseFloat(m.Respawn_Time) : -1,
                maxRespawn: m.Max_ReSpawn_Count !== "" && m.Max_ReSpawn_Count != null ? parseInt(m.Max_ReSpawn_Count) : -1,

                spawnReqLv: parseInt(m.Spawn_Req_Level) || 1,
                championProb: parseFloat(m.Champion_Spawn_Prob) || 0,
                championAtkRate: parseFloat(m.Champion_ATK_Rate) || 1,
                championHpRate: parseFloat(m.Champion_HP_Rate) || 1,
                championScaleRate: parseFloat(m.Champion_Scale_Rate) || 1,
                championExpRate: parseFloat(m.Champion_EXP_Rate) || 1,

                aiType: m.AI_Type || '',
                patrolSpd: parseFloat(m.Patrol_Move_Speed_Rate) || 1.0,
                boundSpd: parseFloat(m.Boundary_Move_Speed_Rate) || 1,
                boundDist: parseFloat(m.Boundary_Move_Distance) || 50,
                chaseSpd: parseFloat(m.Chase_Move_Speed_Rate) || 1,
                evadeSpd: parseFloat(m.Evade_Move_Speed_Rate) || 1.2,

                atkType: MonsterDataAdapter.normalizeAtkType(m.ATK_Type || 'ATK_MELEE'),
                atkRange: parseFloat(m.ATK_Range) || 0,
                atkDmgRate: parseFloat(m.ATK_DMG_Rate) || 1,
                atkCycle: parseFloat(m.ATK_Cycle) || 0,
                defType: MonsterDataAdapter.normalizeDefType(m.ATK_Defence_Type || m.Move_Defence_Type || ''),

                hitX: parseFloat(m.Hitbox_Size_X) || 50,
                hitY: parseFloat(m.Hitbox_Size_Y) || 30,
                hitZ: parseFloat(m.Hitbox_Size_Z) || 60,
                hitStart: parseFloat(m.Hitbox_Start_Time) || 0,
                hitEnd: parseFloat(m.Hitbox_End_Time) || 0.1,

                bodyX: parseFloat(m.Body_Size_X) || 40,
                bodyY: parseFloat(m.Body_Size_Y) || 30,
                bodyZ: parseFloat(m.Body_Size_Z) || 80,
                scale: parseFloat(m.Model_Scale) || 1,
                renderType: m.Model_Render_Type || null,
                renderColor: m.Model_Render_Color || null,
                renderColorR: m.Model_Color_R !== null && m.Model_Color_R !== undefined && m.Model_Color_R !== '' ? parseFloat(m.Model_Color_R) : null,
                renderColorG: m.Model_Color_G !== null && m.Model_Color_G !== undefined && m.Model_Color_G !== '' ? parseFloat(m.Model_Color_G) : null,
                renderColorB: m.Model_Color_B !== null && m.Model_Color_B !== undefined && m.Model_Color_B !== '' ? parseFloat(m.Model_Color_B) : null,
                weaponRenderType: m.Weapon_Render_Type || null,
                atkEffectRenderType: m.ATK_Effect_Render_Type || null,
                atkProjectileRenderType: m.ATK_Projectile_Render_Type || null,
                knockback: parseFloat(m.Hit_Knockback_Distance) || 0,

                projName: m.ATK_Projectile_Name || '',
                projSpeed: parseFloat(m.ATK_Projectile_Speed) || 0,
                projLife: parseFloat(m.ATK_Projectile_Duration) || 0,
                projPenetrate: m.ATK_Projectile_Penetration,
                color: colors[monsterKey] || (String(m.Monster_Type || '').toUpperCase() === 'BOSS' ? '#c9b37e' : '#ffffff'),
                grade: m.Monster_Grade || m.Monster_Type || '',

                corpseTime: parseFloat(m.Corpse_Keep_Time) || 1.0,
                idleDur: parseFloat(m.Idle_Anim_Duration) || 1,
                patrolDur: parseFloat(m.Patrol_Anim_Duration) || 1,
                patrolStandby: parseFloat(m.Partrol_Standby_Time) || parseFloat(m.Patrol_Standby_Time) || 0,
                boundDur: parseFloat(m.Boundary_Anim_Duration) || 1,
                boundStandby: parseFloat(m.Boundary_Standby_Time) || 0,
                atkDur: parseFloat(m.ATK_Anim_Duration) || 1,
                hitDur: parseFloat(m.Hit_Anim_Duration) || 0.2,
                dieDur: parseFloat(m.Die_Anim_Duration) || 1,
                evadeDur: parseFloat(m.Evade_Anim_Duration) || 1
            };

            const aliasSet = new Set(
                [
                    monsterKey,
                    m.Dev_Name,
                    m.Monster_Code,
                    m.Monster_Key
                ]
                .map(v => String(v || '').trim())
                .filter(Boolean)
            );

            gameState.MONSTER_KEYS.push(monsterKey);

            aliasSet.forEach(alias => {
                gameState.DB_MONSTER[alias] = monsterRecord;
                
                
            });
        });

        (patternData || []).forEach(p => {
            const aiName = String(p.AI_Name || '').trim();
            if (!aiName) return;

            if (!gameState.DB_PATTERN[aiName]) {
                gameState.DB_PATTERN[aiName] = {};
            }

            const bucket = gameState.DB_PATTERN[aiName];

            const patternName = String(p.Pattern_Name || '').trim();
            const patternType = String(p.Pattern_Type || '').trim();

            // 1) 기존 호환: Pattern_Name 키로 저장
            if (patternName) {
                bucket[patternName] = p;
            }

            // 2) 새 구조 지원: 일반 패턴은 Pattern_Type 키로도 저장
            //    단, 스킬 패턴(SKILL_*)은 여러 개가 겹칠 수 있으므로 타입 키로 저장하지 않음
            if (patternType && patternType !== '*' && !patternType.startsWith('SKILL_')) {
                bucket[patternType] = p;
            }

            // 3) 전역 패턴(*)은 둘 중 하나만 있어도 '*'로 접근 가능하게 보정
            if (patternName === '*' || patternType === '*') {
                bucket['*'] = p;
            }
        });

        (skillData||[]).forEach(s => {
            const skillKey = String(s.Skill_Code || '').trim();
            if (!skillKey) return;

            const normalizedSkill = {
                ...s,
                Skill_Code: skillKey,
                Skill_Type: MonsterDataAdapter.normalizeSkillType(s.Skill_Type),
                effectDur: parseFloat(s.Skill_Effect_Duration) || 0,
                atkCycle: parseFloat(s.SKill_ATK_Cycle) || 0,
                statusType: MonsterDataAdapter.normalizeStatus(s.Skill_Hit_Status_Effect_Type),
                statusDur: parseFloat(s.Skill_Hit_Status_Effect_Duration) || 0,
                statusProb: parseFloat(s.Skill_Hit_Status_Effect_Prob) || 0,
                Hit_Effect_Place: MonsterDataAdapter.normalizePlace(s.Hit_Effect_Place),
                Warning_Effect_Place: MonsterDataAdapter.normalizeWarningPlace(s.Warning_Effect_Place),
                Hit_Effect_Name: s.Hit_Effect_Name || s['#Hit_Effect_Name'] || ''
            };

            const aliasSet = new Set(
                [
                    skillKey,
                    s.Dev_Name,
                    s.Skill_ID,
                    s.Skill_Name,
                    s.Name
                ]
                .map(v => String(v || '').trim())
                .filter(Boolean)
            );

            aliasSet.forEach(alias => {
                gameState.DB_SKILL[alias] = normalizedSkill;
            });
        });
    },

    resolveEffectTypeFromEnum: function(effectEnum, fallbackType = '') {
    const v = String(effectEnum || '').trim();

    const map = {
        EFT_SLASH: 'slash',
        EFT_LIGHTNING_SLASH: 'slash',
        EFT_THUNDERBOLT_SLASH: 'slash',
        EFT_KASIYAS_SLASH_01: 'slash',
        EFT_KASIYAS_SLASH_02: 'slash',
        EFT_KASIYAS_SLASH_03: 'slash',
        EFT_KASIYAS_SLASH_04: 'slash',
        EFT_KASIYAS_SLASH_DOWN: 'slash',
        EFT_KASIYAS_SLASH_UP: 'slash',
        EFT_KASIYAS_STABBING: 'slash',
        EFT_KASIYAS_RUSH_ISSEN: 'slash',
        EFT_KASIYAS_LOW_AREA_SLASH: 'slash',
        EFT_KASIYAS_HORIZONTAL_SLASH: 'slash',
        EFT_KASIYAS_CHARGE_SLASH_DOWN: 'slash',
        EFT_KASIYAS_SHOULDER_ATK: 'hitSpark',
        EFT_KASIYAS_FIST_BUMPING: 'hitSpark',
        EFT_KASIYAS_STOMP: 'hitSpark',
        EFT_SHOCKWAVE: 'shockwave',

        EFT_HIT: 'hitSpark',
        EFT_STRIKE: 'hitSpark',
        EFT_PUNCH: 'hitSpark',

        EFT_BITE: 'bite',
        EFT_THUNDERBOLT: 'lightning',
        EFT_ICE_NIDDLE: 'ice_needle',
        EFT_ICE_AURA: 'particle'
    };

    return map[v] || fallbackType;
},

    resolveProjectileRenderType: function(projectileEnum) {
        return String(projectileEnum || '').trim();
    },

    pushMonsterAtkEffect: function(m, atkX, atkY, atkZ, atkW, atkH, gameState) {
    const effEnum = m.d.atkEffectRenderType;
    const effType = this.resolveEffectTypeFromEnum(effEnum, 'slash');

    const baseModelScale = Math.max(0.01, parseFloat(m.d.scale) || 1);
    const effectScale = Math.max(1, m.scale / baseModelScale);

    if (effType === 'slash') {
        let slashColor = "rgba(255, 50, 50, 0.9)";
        let slashLife = 0.2;

        if (effEnum === 'EFT_THUNDERBOLT_SLASH') {
            slashColor = m.isChampion ? "rgba(255, 220, 120, 0.96)" : "rgba(241, 196, 15, 0.92)";
            slashLife = 0.26;
        } else if (effEnum === 'EFT_LIGHTNING_SLASH') {
            slashColor = m.isChampion ? "rgba(255, 215, 110, 0.95)" : "rgba(255, 235, 150, 0.90)";
            slashLife = 0.22;
        } else if (effEnum === 'EFT_SLASH') {
            slashColor = m.isChampion ? "rgba(231, 76, 60, 0.92)" : "rgba(255, 50, 50, 0.90)";
            slashLife = 0.20;
        }

        gameState.effects.push({
            type: 'slash',
            renderType: effEnum,
            x: atkX,
            y: atkY,
            z: atkZ + atkH / 2,
            dir: m.faceDir,
            w: atkW,
            h: atkH,
            life: slashLife,
            maxLife: slashLife,
            color: slashColor,
            effectScale: effectScale
        });
        return;
    }

    if (effType === 'bite') {
        gameState.effects.push({
            type: 'bite',
            renderType: effEnum,
            x: atkX,
            y: atkY,
            z: atkZ + atkH / 2,
            dir: m.faceDir,
            w: atkW,
            h: atkH,
            life: 0.16,
            maxLife: 0.16,
            color: m.isChampion ? "rgba(255, 180, 120, 0.95)" : "rgba(255, 140, 140, 0.95)",
            effectScale: effectScale
        });
        return;
    }

    if (effType === 'hitSpark') {
        const isStrike = effEnum === 'EFT_STRIKE';
        const isPunch = effEnum === 'EFT_PUNCH';

        gameState.effects.push({
            type: 'hitSpark',
            renderType: effEnum,
            x: atkX,
            y: atkY,
            z: atkZ + atkH / 2,
            w: atkW,
            h: atkH,
            dir: m.faceDir,
            life: isStrike ? 0.16 : (isPunch ? 0.14 : 0.12),
            maxLife: isStrike ? 0.16 : (isPunch ? 0.14 : 0.12),
            color: isStrike
                ? (m.isChampion ? "rgba(255, 245, 200, 0.98)" : "rgba(245, 245, 245, 0.96)")
                : isPunch
                    ? (m.isChampion ? "rgba(255, 206, 92, 0.98)" : "rgba(255, 206, 92, 0.96)")
                    : "rgba(241, 196, 15, 0.95)",
            accentColor: isStrike
                ? (m.isChampion ? "rgba(255, 210, 120, 0.96)" : "rgba(210, 220, 230, 0.92)")
                : isPunch
                    ? (m.isChampion ? "rgba(255, 240, 170, 0.98)" : "rgba(255, 236, 150, 0.96)")
                    : "rgba(255, 255, 255, 0.95)",
            burstScale: isStrike ? 1.2 : (isPunch ? 1.15 : 1.0),
            effectScale: isPunch ? effectScale : 1
        });
        return;
    }

    if (effType === 'particle') {
        gameState.effects.push({
            type: 'particle',
            renderType: effEnum,
            x: atkX,
            y: atkY,
            z: atkZ + atkH / 2,
            r: 4,
            color: "rgba(255,255,255,0.95)",
            life: 0.16,
            maxLife: 0.16,
            effectScale: effectScale
        });
    }
},

    activateSpawner: function(id, gameState) {
        try { if (document.activeElement) document.activeElement.blur(); } catch(e) {} 
        const d = gameState.DB_MONSTER[id]; 
        
        if (!d || (!gameState.isTestMode && gameState.player.level < d.spawnReqLv)) return; 

        let currentAlive = gameState.monsters.filter(m => m.active && m.id === id).length;
        if (currentAlive >= d.spawnLimit) return;

        const monsterGrade = String(d.grade || '').trim().toUpperCase();
        const isBoss = monsterGrade.includes('BOSS') || String(id || '').startsWith('B');

        gameState.spawners = [];
        if (isBoss) {
            this.spawnInstant(id, gameState);
            return;
        }
        
        gameState.spawners.push({ id: id, d: d, limit: d.spawnLimit, interval: d.spawnInterval, respawnTime: d.respawnTime, maxRespawn: d.maxRespawn, 
            spawnedCount: currentAlive,
            deadCount: 0, timer: d.spawnInterval, respawning: 0, respawnTimers: [],
            spawnOne: function() {
                if (this.maxRespawn !== -1 && this.spawnedCount >= this.maxRespawn) return;
                
                let alive = gameState.monsters.filter(m => m.active && m.id === this.id).length;
                if (alive >= this.limit) return;
                
                this.spawnedCount++; 
                let cx = this.d.cx !== "" ? parseFloat(this.d.cx) : gameState.player.x; 
                let cy = this.d.cy !== "" ? parseFloat(this.d.cy) : gameState.WORLD_DEPTH/2;
                let rx = this.d.rx || 0; let ry = this.d.ry || 50; 
                let isChamp = Math.random() < this.d.championProb; 
                let mScale = isChamp ? this.d.scale * this.d.championScaleRate : this.d.scale; 
                let mMaxHp = isChamp ? this.d.hp * this.d.championHpRate : this.d.hp;
                
                let initCd = {};
                if (gameState.DB_SKILL) {
                    for (let sId in gameState.DB_SKILL) {
                        let initTime = parseFloat(gameState.DB_SKILL[sId].Skill_Initial_Cooltime) || 0;
                        if (initTime > 0) initCd[sId] = initTime;
                    }
                }

                gameState.monsters.push({
                id: this.id,
                d: this.d,
                active: true,
                spawner: this,
                isChampion: isChamp,
                scale: mScale,
                x: cx + (Math.random() * 2 - 1) * rx,
                y: cy + (Math.random() * 2 - 1) * ry,
                z: 300,
                vz: 0,
                isGrounded: false,
                hp: mMaxHp,
                maxHp: mMaxHp,
                state: 'SPAWN',
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
                skillCooldowns: initCd,
                patternCount: 0,
                isProvoked: !!this.d.aggressive,
                boss: MonsterManager.createBossRuntimeForMonster(this.d, gameState)
            });
            }
        });
    },

    spawnInstant: function(id, gameState) {
        try { if (document.activeElement) document.activeElement.blur(); } catch(e) {}
        const d = gameState.DB_MONSTER[id]; 
        
        if (!d || (!gameState.isTestMode && gameState.player.level < d.spawnReqLv)) return;
        
        let currentAlive = gameState.monsters.filter(m => m.active && m.id === id).length;
        if (currentAlive >= d.spawnLimit) return;

        let cx = d.cx !== "" ? parseFloat(d.cx) : gameState.player.x; let cy = d.cy !== "" ? parseFloat(d.cy) : gameState.WORLD_DEPTH/2;
        let rx = d.rx || 0; let ry = d.ry || 50; 
        let isChamp = Math.random() < d.championProb; 
        let mScale = isChamp ? d.scale * d.championScaleRate : d.scale; 
        let mMaxHp = isChamp ? d.hp * d.championHpRate : d.hp;

        let initCd = {};
        if (gameState.DB_SKILL) {
            for (let sId in gameState.DB_SKILL) {
                let initTime = parseFloat(gameState.DB_SKILL[sId].Skill_Initial_Cooltime) || 0;
                if (initTime > 0) initCd[sId] = initTime;
            }
        }

        gameState.monsters.push({
            id: id,
            d: d,
            active: true,
            spawner: null,
            isChampion: isChamp,
            scale: mScale,
            x: cx + (Math.random() * 2 - 1) * rx,
            y: cy + (Math.random() * 2 - 1) * ry,
            z: 300,
            vz: 0,
            isGrounded: false,
            hp: mMaxHp,
            maxHp: mMaxHp,
            state: 'SPAWN',
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
            skillCooldowns: initCd,
            patternCount: 0,
            isProvoked: !!d.aggressive,
            boss: this.createBossRuntimeForMonster(d, gameState)
        });
    },


    getBossParryWindow: function(m, action) {
        const boss = m && m.boss ? m.boss : null;
        if (!action) return { enabled: false, start: 0, end: 0 };
        const enabled = action.Parry_Enable === true || String(action.Parry_Enable || '').trim().toLowerCase() === 'true';
        if (!enabled) return { enabled: false, start: 0, end: 0 };

        const rate = this.getLatePhaseActionTimeRate(action, boss);
        const startRaw = parseFloat(action.Parry_Start_Time);
        const endRaw = parseFloat(action.Parry_End_Time);
        const start = (!isNaN(startRaw) && startRaw >= 0 ? startRaw : 0) * rate;
        const end = (!isNaN(endRaw) && endRaw > 0 ? endRaw : start) * rate;
        return { enabled: true, start: Math.min(start, end), end: Math.max(start, end) };
    },

    isBossParryWindowActive: function(m, action) {
        const windowInfo = this.getBossParryWindow(m, action);
        if (!windowInfo.enabled) return false;
        const t = parseFloat(m && m.timer) || 0;
        return t >= windowInfo.start && t <= windowInfo.end;
    },

    isPlayerInsideBossParryRange: function(m, action, gameState) {
        const p = gameState && gameState.player;
        if (!m || !action || !p || !p.active || p.hp <= 0) return false;

        const scale = parseFloat(m.scale) || 1;
        const bossW = ((m.d && m.d.bodyX) || 80) * scale;
        const bossD = ((m.d && m.d.bodyY) || 60) * scale;
        const rangeX = Math.max(0, parseFloat(action.Parry_Range_X) || 0) * scale;
        const rangeY = Math.max(0, parseFloat(action.Parry_Range_Y) || 0) * scale;
        const rangeZ = Math.max(1, parseFloat(action.Parry_Range_Z) || ((m.d && m.d.bodyZ) || 160)) * scale;

        const playerW = (p.bodyX || 60) * (p.scale || 1);
        const playerD = (p.bodyY || 40) * (p.scale || 1);
        const playerH = (p.bodyZ || 120) * (p.scale || 1);

        // 패링 범위는 투사체 위치가 아니라 플레이어 본체 위치 기준으로 판정한다.
        // 따라서 멀리서 쏜 투사체가 맞아도 플레이어가 범위 밖이면 패링 성공 처리되지 않는다.
        return checkAABB3D(
            m.x,
            m.y,
            m.z,
            bossW + rangeX * 2,
            bossD + rangeY * 2,
            rangeZ,
            p.x,
            p.y,
            p.z,
            playerW,
            playerD,
            playerH
        );
    },

    pushBossParryCueEffect: function(m, action, gameState) {
        if (!m || !action || !gameState) return;
        const renderType = String(action.Parry_EFT_Type || 'EFT_CAN_PARRY').trim() || 'EFT_CAN_PARRY';
        const scale = parseFloat(m.scale) || 1;
        const bodyX = ((m.d && m.d.bodyX) || 80) * scale;
        const bodyZ = ((m.d && m.d.bodyZ) || 160) * scale;
        gameState.effects.push({
            type: 'hitSpark',
            renderType: renderType,
            x: m.x,
            y: m.y,
            z: m.z + bodyZ * 0.70,
            dir: m.faceDir || 1,
            w: bodyX * 1.45,
            h: bodyZ * 0.95,
            burstScale: 1.35,
            life: 0.11,
            maxLife: 0.11,
            color: 'rgba(255,225,80,0.95)',
            accentColor: 'rgba(255,255,230,0.95)'
        });
    },

    updateBossParryCue: function(m, action, deltaTime, gameState) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !action) return;
        const active = this.isBossParryWindowActive(m, action);
        boss.parryWindowActive = active;
        if (!active) {
            boss.parryCueTimer = 0;
            return;
        }

        boss.parryCueTimer = (boss.parryCueTimer || 0) - (parseFloat(deltaTime) || 0);
        if (boss.parryCueTimer <= 0) {
            boss.parryCueTimer = 0.08;
            this.pushBossParryCueEffect(m, action, gameState);
        }
    },

    enterBossGroggyFromParry: function(m, action, gameState) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !action) return;

        const groggyTime = Math.max(0.2, parseFloat(action.Groggy_Time) || 2);
        const groggyPose = String(action.Groggy_Pose_Type || 'POSE_KASIYAS_P1_GROGGY').trim() || 'POSE_KASIYAS_P1_GROGGY';
        const successEffect = String(action.Parry_Success_EFT_Type || 'EFT_SUCCESS_PARRY').trim() || 'EFT_SUCCESS_PARRY';
        const pattern = boss.activePattern;

        if (pattern) {
            const patternId = String(pattern.Pattern_ID || '').trim();
            boss.patternCooldowns[patternId] = parseFloat(pattern.Pattern_Cooldown) || 1;
            this.pushBossDebugLog(
                gameState,
                'PARRY',
                `${patternId} ${this.getBossDebugName(pattern)}`,
                `success / groggy ${groggyTime.toFixed(1)}s`
            );
        }

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
        boss.parryWindowActive = false;
        boss.parryCueTimer = 0;
        boss.groggyTimer = groggyTime;
        boss.groggyMaxTime = groggyTime;
        boss.groggyPoseType = groggyPose;
        boss.noPatternWaitTimer = Math.max(boss.noPatternWaitTimer || 0, groggyTime);

        m.state = 'GROGGY';
        m.timer = 0;
        m.hasFired = false;
        m.kbVx = 0;
        m.kbVy = 0;

        this.ensureBossDebug(gameState).currentAction = null;
        this.ensureBossDebug(gameState).currentObjectAction = null;

        const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
        gameState.effects.push({
            type: 'hitSpark',
            renderType: successEffect,
            x: m.x,
            y: m.y,
            z: m.z + bodyZ * 0.70,
            dir: m.faceDir || 1,
            w: ((m.d && m.d.bodyX) || 80) * (m.scale || 1) * 1.8,
            h: bodyZ,
            burstScale: 2.1,
            life: 0.45,
            maxLife: 0.45,
            color: 'rgba(255,238,90,0.98)',
            accentColor: 'rgba(255,255,255,0.96)'
        });
        gameState.floatingTexts.push({
            x: m.x,
            y: m.y,
            z: m.z + bodyZ + 28,
            text: 'PARRY!',
            color: '#ffe45c',
            size: '30px',
            timer: 0.9
        });
        try { pushSystemNotice('패링 성공! 카시야스 그로기', '#ffe45c', 1.0); } catch(e) {}
    },

    tryResolveBossParryByPlayerHit: function(m, gameState) {
        const boss = m && m.boss ? m.boss : null;
        const action = boss && boss.action ? boss.action : null;
        if (!boss || !action || boss.groggyTimer > 0) return false;
        if (!this.isBossParryWindowActive(m, action)) return false;

        const requireType = String(action.Parry_Require_Hit_Type || 'PLAYER_ATTACK').trim().toUpperCase();
        if (requireType && requireType !== 'PLAYER_ATTACK' && requireType !== 'PLAYER_ANY_ATTACK') return false;
        if (!this.isPlayerInsideBossParryRange(m, action, gameState)) return false;

        this.enterBossGroggyFromParry(m, action, gameState);
        return true;
    },

    takeDamage: function(m, baseDmg, gameState) {
        if (this.tryResolveBossParryByPlayerHit && this.tryResolveBossParryByPlayerHit(m, gameState)) {
            return;
        }

        let scaledDmg = calcScaledDamage(gameState.player.level, m.d.level, baseDmg);
        let finalDmg = Math.max(1, scaledDmg - m.d.def); 
        m.hp -= finalDmg;
        
        gameState.floatingTexts.push({x: m.x, y: m.y, z: m.z + (m.d.bodyZ * m.scale) + 20, text: `${finalDmg.toFixed(0)}`, color: "#fff", size: "36px", timer: 1.0});
        gameState.effects.push({ type: 'hitSpark', renderType: 'EFT_HIT', x: m.x, y: m.y, z: m.z + m.d.bodyZ*m.scale/2, life: 0.15, maxLife: 0.15 });

        gameState.targetUI.monster = m; gameState.targetUI.timer = 3.0;
        m.isProvoked = true;

        if (m.hp > 0) {
            m.hitByEnemyTimer = Math.max(
                m.hitByEnemyTimer || 0,
                Math.max(0.1, parseFloat(m.d.hitDur) || 0.2)
            );

            m.lastHitSourceX = gameState.player.x;
            m.lastHitSourceY = gameState.player.y;
            m.lastHitDirX = m.x - gameState.player.x;
            m.lastHitDirY = m.y - gameState.player.y;

            const applyHitState = () => {
                MonsterAI.changeState(m, 'HIT', gameState);

                const safeHitDur = Math.max(0.001, parseFloat(m.d.hitDur) || 0.2);
                let angle = Math.atan2(m.y - gameState.player.y, m.x - gameState.player.x);
                let kb = m.d.knockback / safeHitDur;
                m.kbVx = Math.cos(angle) * kb;
                m.kbVy = Math.sin(angle) * kb;
            };

            const hitPriorityRule = MonsterAI.getPriorityStateRule(m, 'HIT', gameState);

            if (hitPriorityRule) {
                if (MonsterAI.canEnterPriorityState(m, 'HIT', gameState)) {
                    applyHitState();
                }
            } else {
                const stateTypeKey = MonsterAI.getPatternTypeKey(m.state, gameState, m);
                let isSuperArmor =
                    (
                        stateTypeKey === 'ATK' ||
                        stateTypeKey === 'ATK_MELEE' ||
                        stateTypeKey === 'ATK_PROJECTILE' ||
                        !!gameState.DB_SKILL[m.state]
                    ) &&
                    String(m.d.defType).toLowerCase() === 'superarmor';

                if (!isSuperArmor) {
                    applyHitState();
                }
            }
        }
    },

    getStageRangeYScale: function(gameState) {
        const width = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1);
        const depth = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 1);

        const correctedScale = (depth / width) * 1.5;
        return Math.max(0.35, Math.min(0.6, correctedScale));
    },

    calcWeightedRangeDistance: function(distX, distY, gameState) {
        const xGap = Math.max(0, parseFloat(distX) || 0);
        const yGap = Math.max(0, parseFloat(distY) || 0);
        const yScale = this.getStageRangeYScale(gameState);

        return Math.sqrt((xGap * xGap) + ((yGap * yScale) * (yGap * yScale)));
    },

    normalizePatternMoveDirection: function(value) {
        const raw = String(value || '').trim().toUpperCase();
        if (!raw) return 'NONE';

        switch (raw) {
            case 'MOVE_RANDOM':
                return 'MOVE_RANDOM';

            case 'CHASE_ENEMY':
                return 'CHASE_ENEMY';

            case 'OPPOSITE_HIT':
                return 'OPPOSITE_HIT';

            case 'KITING_X':
            case 'KITTING_X':
                return 'KITING_X';

            case 'NONE':
            default:
                return 'NONE';
        }
    },

    normalizePatternGaze: function(value) {
        const raw = String(value || '').trim().toUpperCase();
        if (!raw) return 'NONE';

        switch (raw) {
            case 'GAZE_MOVE_DIREC':
                return 'GAZE_MOVE_DIREC';

            case 'GAZE_LOOK_ENEMY':
                return 'GAZE_LOOK_ENEMY';

            case 'GAZE_HIT_DIREC':
                return 'GAZE_HIT_DIREC';

            case 'NONE':
            default:
                return 'NONE';
        }
    },

    getPatternMoveDirectionValue: function(m, gameState) {
        const patternRow = MonsterAI.getActivePatternRow(m, gameState);
        return this.normalizePatternMoveDirection(patternRow ? patternRow.Move_Direction : 'NONE');
    },

    getPatternGazeValue: function(m, gameState) {
        const patternRow = MonsterAI.getActivePatternRow(m, gameState);
        return this.normalizePatternGaze(patternRow ? patternRow.Monster_Gaze : 'NONE');
    },

    resolvePatternMoveVector: function(m, moveDirection, dx, dy, gameState) {
        const result = { dirX: 0, dirY: 0 };

        switch (this.normalizePatternMoveDirection(moveDirection)) {
            case 'MOVE_RANDOM': {
                result.dirX = m.dirX || 0;
                result.dirY = m.dirY || 0;
                return result;
            }

            case 'CHASE_ENEMY': {
                let moveX = 0;
                let moveY = 0;

                if (Math.abs(dy) > 20) moveY = Math.sign(dy);
                if (Math.abs(dx) > m.d.atkRange * 0.5) moveX = Math.sign(dx);

                const len = Math.sqrt(moveX * moveX + moveY * moveY);
                if (len > 0) {
                    result.dirX = moveX / len;
                    result.dirY = moveY / len;
                }

                return result;
            }

            case 'OPPOSITE_HIT': {
                let moveX = Math.sign(m.lastHitDirX || 0);
                let moveY = Math.sign(m.lastHitDirY || 0);

                const len = Math.sqrt(moveX * moveX + moveY * moveY);
                if (len > 0) {
                    result.dirX = moveX / len;
                    result.dirY = moveY / len;
                }

                return result;
            }

            case 'KITING_X': {
                let moveX = 0;
                let moveY = 0;

                if (Math.abs(dx) > 10) {
                    moveX = -Math.sign(dx);
                }

                if (Math.abs(dy) > 20) {
                    moveY = Math.sign(dy);
                }

                const len = Math.sqrt(moveX * moveX + moveY * moveY);
                if (len > 0) {
                    result.dirX = moveX / len;
                    result.dirY = moveY / len;
                }

                return result;
            }

            case 'NONE':
            default:
                return result;
        }
    },

    resolvePatternFaceDir: function(m, gazeValue, dx) {
        switch (this.normalizePatternGaze(gazeValue)) {
            case 'GAZE_MOVE_DIREC':
                if (Math.abs(m.dirX) > 0.001) {
                    return m.dirX > 0 ? 1 : -1;
                }
                return m.faceDir || 1;

            case 'GAZE_LOOK_ENEMY':
                if (Math.abs(dx) > 0.001) {
                    return dx > 0 ? 1 : -1;
                }
                return m.faceDir || 1;

            case 'GAZE_HIT_DIREC': {
                const hitDx = (m.lastHitSourceX != null) ? (m.lastHitSourceX - m.x) : 0;
                if (Math.abs(hitDx) > 0.001) {
                    return hitDx > 0 ? 1 : -1;
                }
                return m.faceDir || 1;
            }

            case 'NONE':
            default:
                return m.faceDir || 1;
        }
    },

    isBossPatternData: function(d) {
        return !!d && String(d.aiType || '').trim().toUpperCase() === 'BOSS_PATTERN';
    },

    isBossPatternMonster: function(m) {
        return !!(m && m.boss && this.isBossPatternData(m.d));
    },

    createBossRuntimeForMonster: function(d, gameState) {
        if (!this.isBossPatternData(d)) return null;

        const phase = Object.values(gameState.DB_BOSS_PHASE || {})
            .filter(p => String(p.Phase_Monster_ID || '').trim() === String(d.id || '').trim())
            .sort((a, b) => (parseFloat(a.Phase_Order) || 0) - (parseFloat(b.Phase_Order) || 0))[0];

        if (!phase) return null;

        const patternSetId = String(d.patternSetId || '').trim();
        const patterns = gameState.DB_BOSS_PATTERN_BY_SET && gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
            ? gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
            : [];

        const patternCooldowns = {};
        for (const pattern of patterns) {
            const patternId = String(pattern.Pattern_ID || '').trim();
            if (!patternId) continue;
            patternCooldowns[patternId] = parseFloat(pattern.Pattern_Initial_Cooltime) || 0;
        }

        return {
            phase: phase,
            phaseId: String(phase.Phase_ID || '').trim(),
            patternSetId: patternSetId,
            patternCooldowns: patternCooldowns,
            activePattern: null,
            currentActionIndex: -1,
            currentLoopIndex: 0,
            loopCount: 1,
            action: null,
            actionHitFired: false,
            noPatternWaitTimer: 0,
            isLatePhase: false,
            lateNoticeShown: false,
            previewDashPath: null,
            currentDashPath: null,
            lastDashPath: null
        };
    },

    getBossLatePhaseThreshold: function(phase) {
        const raw = parseFloat(phase && phase.Late_Phase_HP_Rate);
        if (isNaN(raw)) return 0.5;
        return raw > 1 ? raw / 100 : raw;
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

    getBossObjectActionHitWindow: function(obj, action) {
        const ownerBoss = obj && obj.owner ? obj.owner.boss : null;
        const timeRate = this.getLatePhaseActionTimeRate(action, ownerBoss);
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

        if (moveType === 'DASH' && boss && boss.actionMove && boss.actionMove.duration) {
            return Math.max(0.05, (parseFloat(boss.actionMove.duration) || 0.001) * timeRate);
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

    ensureBossDebug: function(gameState) {
        if (!gameState.bossDebug) {
            gameState.bossDebug = {
                patternCheck: null,
                currentAction: null,
                currentObjectAction: null,
                logs: [],
                exportLogs: []
            };
        }

        if (!Array.isArray(gameState.bossDebug.logs)) gameState.bossDebug.logs = [];
        if (!Array.isArray(gameState.bossDebug.exportLogs)) gameState.bossDebug.exportLogs = [];
        return gameState.bossDebug;
    },

    getBossDebugName: function(data) {
        return String(
            (data && (
                data.Pattern_Name ||
                data.Action_Name ||
                data.Object_Name ||
                data.Object_Action_Name ||
                data.Dev_Name ||
                data.Pattern_ID ||
                data.Action_ID ||
                data.Object_ID ||
                data.Object_Action_ID
            )) || ''
        ).trim();
    },

    pushBossDebugLog: function(gameState, type, message, detail) {
        const debug = this.ensureBossDebug(gameState);
        const msg = String(message || '').trim();
        if (!msg) return;

        const now = new Date();
        const entry = {
            type: String(type || 'INFO').trim(),
            message: msg,
            detail: detail || '',
            time: now.toLocaleTimeString(),
            absoluteTime: now.toISOString()
        };

        debug.logs.unshift(entry);
        debug.exportLogs.push(entry);

        if (debug.logs.length > 18) debug.logs.length = 18;
        if (debug.exportLogs.length > 3000) {
            debug.exportLogs.splice(0, debug.exportLogs.length - 3000);
        }
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
            if (['WAIT','WARNING_PATH','WARNING','SPAWN_ATTACK_OBJECT','SPAWN_OBJECT'].includes(actionType)) m.state = 'IDLE';
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

    getPathLength: function(path) {
        if (!path) return 0;
        const dx = (path.endX || 0) - (path.startX || 0);
        const dy = (path.endY || 0) - (path.startY || 0);
        return Math.sqrt(dx * dx + dy * dy) || 0;
    },

    computeDashPathToMapEdge: function(m, gameState) {
        const sx = parseFloat(m.x) || 0;
        const sy = parseFloat(m.y) || 0;
        const px = gameState.player ? (parseFloat(gameState.player.x) || sx + (m.faceDir || 1)) : sx + (m.faceDir || 1);
        const py = gameState.player ? (parseFloat(gameState.player.y) || sy) : sy;

        let dx = px - sx;
        let dy = py - sy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= len;
        dy /= len;

        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) dx = m.faceDir === -1 ? -1 : 1;

        const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400);
        const candidates = [];

        if (dx > 0.001) candidates.push((worldW - sx) / dx);
        else if (dx < -0.001) candidates.push((0 - sx) / dx);

        if (dy > 0.001) candidates.push((worldD - sy) / dy);
        else if (dy < -0.001) candidates.push((0 - sy) / dy);

        let t = candidates.filter(v => isFinite(v) && v > 0).sort((a, b) => a - b)[0];
        if (!isFinite(t) || t <= 0) t = 300;

        const ex = Math.max(0, Math.min(worldW, sx + dx * t));
        const ey = Math.max(0, Math.min(worldD, sy + dy * t));

        return {
            startX: sx,
            startY: sy,
            startZ: parseFloat(m.z) || 0,
            endX: ex,
            endY: ey,
            endZ: parseFloat(m.z) || 0,
            dirX: dx,
            dirY: dy,
            length: Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2) || 0
        };
    },

    getBossDiagonalCornerPositions: function(gameState, m) {
        const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        const bodyX = m && m.d ? (parseFloat(m.d.bodyX) || 80) * (parseFloat(m.scale) || 1) : 80;
        const bodyY = m && m.d ? (parseFloat(m.d.bodyY) || 60) * (parseFloat(m.scale) || 1) : 60;
        const marginX = Math.max(95, bodyX * 1.35);
        const marginY = Math.max(55, bodyY * 1.05);

        return {
            LEFT_TOP: { x: marginX, y: marginY },
            RIGHT_TOP: { x: worldW - marginX, y: marginY },
            RIGHT_BOTTOM: { x: worldW - marginX, y: worldD - marginY },
            LEFT_BOTTOM: { x: marginX, y: worldD - marginY }
        };
    },

    getOppositeDiagonalCornerKey: function(key) {
        const k = String(key || '').trim().toUpperCase();
        const map = {
            LEFT_TOP: 'RIGHT_BOTTOM',
            RIGHT_BOTTOM: 'LEFT_TOP',
            RIGHT_TOP: 'LEFT_BOTTOM',
            LEFT_BOTTOM: 'RIGHT_TOP'
        };
        return map[k] || 'RIGHT_BOTTOM';
    },

    pickBossRandomDiagonalCornerKey: function() {
        const list = ['LEFT_TOP', 'RIGHT_TOP', 'RIGHT_BOTTOM', 'LEFT_BOTTOM'];
        return list[Math.floor(Math.random() * list.length)] || 'LEFT_TOP';
    },

    getDiagonalPairKeyByCorner: function(key) {
        const k = String(key || '').trim().toUpperCase();
        if (k === 'LEFT_TOP' || k === 'RIGHT_BOTTOM') return 'PAIR_A';
        if (k === 'RIGHT_TOP' || k === 'LEFT_BOTTOM') return 'PAIR_B';
        return 'PAIR_A';
    },

    getDiagonalPairCorners: function(pairKey) {
        return String(pairKey || '').trim().toUpperCase() === 'PAIR_B'
            ? ['RIGHT_TOP', 'LEFT_BOTTOM']
            : ['LEFT_TOP', 'RIGHT_BOTTOM'];
    },

    chooseRandomFromList: function(list) {
        const arr = Array.isArray(list) && list.length ? list : ['LEFT_TOP'];
        return arr[Math.floor(Math.random() * arr.length)] || arr[0];
    },

    preparePattern4DiagonalRuntime: function(boss, firstCornerKey) {
        if (!boss) return;
        const first = String(firstCornerKey || boss.currentDiagonalCorner || boss.lastDiagonalCorner || '').trim().toUpperCase() || this.pickBossRandomDiagonalCornerKey();
        const firstPair = this.getDiagonalPairKeyByCorner(first);
        const secondPair = firstPair === 'PAIR_A' ? 'PAIR_B' : 'PAIR_A';
        const secondOwnerCorner = this.chooseRandomFromList(this.getDiagonalPairCorners(secondPair));
        const secondCloneCorner = this.getOppositeDiagonalCornerKey(secondOwnerCorner);
        boss.pattern4Runtime = {
            firstOwnerCorner: first,
            firstCloneCorner: this.getOppositeDiagonalCornerKey(first),
            firstPair: firstPair,
            secondPair: secondPair,
            secondOwnerCorner: secondOwnerCorner,
            secondCloneCorner: secondCloneCorner
        };
        boss.nextDiagonalOwnerCorner = secondOwnerCorner;
        boss.nextDiagonalCloneCorner = secondCloneCorner;
    },

    getBossPatternNextAttackAction: function(m, startIndex = null) {
        const boss = m && m.boss ? m.boss : null;
        const pattern = boss && boss.activePattern ? boss.activePattern : null;
        const actions = pattern && Array.isArray(pattern.Runtime_Actions) ? pattern.Runtime_Actions : [];
        const start = startIndex === null ? ((boss && boss.currentActionIndex != null ? boss.currentActionIndex : -1) + 1) : startIndex;
        for (let i = start; i < actions.length; i++) {
            const action = actions[i];
            const cond = String(action && action.Action_Condition_Type || '').trim().toUpperCase();
            if ((cond === 'LATE_PHASE' || cond === 'LATE_PHASE_START') && !(boss && boss.isLatePhase)) continue;
            if (String(action && action.Action_Type || '').trim().toUpperCase() === 'ATK') return action;
        }
        return null;
    },

    getBossPatternActionHitbox: function(m, action) {
        const scale = parseFloat(m && m.scale) || 1;
        const atkW = (parseFloat(action && action.Hitbox_Size_X) || (m && m.d && m.d.bodyX) || 100) * scale;
        const atkD = (parseFloat(action && action.Hitbox_Size_Y) || (m && m.d && m.d.bodyY) || 60) * scale;
        const atkH = (parseFloat(action && action.Hitbox_Size_Z) || (m && m.d && m.d.bodyZ) || 80) * scale;

        const rawOffX = parseFloat(action && action.Hitbox_Offset_X);
        const rawOffY = parseFloat(action && action.Hitbox_Offset_Y);
        const rawOffZ = parseFloat(action && action.Hitbox_Offset_Z);
        const offX = (!isNaN(rawOffX) ? rawOffX : atkW / (2 * scale)) * scale;
        const offY = (!isNaN(rawOffY) ? rawOffY : 0) * scale;
        const offZ = (!isNaN(rawOffZ) ? rawOffZ : 0) * scale;

        return {
            x: (m.x || 0) + offX * ((m.faceDir === -1) ? -1 : 1),
            y: (m.y || 0) + offY,
            z: (m.z || 0) + offZ,
            w: atkW,
            d: atkD,
            h: atkH
        };
    },

    resolveBossObjectSpawnPositions: function(m, objData, action, gameState, spawnCount) {
        const count = Math.max(1, parseInt(spawnCount) || 1);
        const spawnPlace = String(objData && objData.Spawn_Place_Type || '').trim().toUpperCase();
        const positions = [];
        const boss = m && m.boss ? m.boss : null;
        const corners = this.getBossDiagonalCornerPositions(gameState, m);

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

        const bodyX = (m.d.bodyX || 80) * (m.scale || 1);
        const offsetX = spawnPlace === 'PLACE_CASTER_FRONT' ? (m.faceDir || 1) * bodyX * 0.72 : 0;
        for (let i = 0; i < count; i++) {
            positions.push({ x: m.x + offsetX, y: m.y, cornerKey: boss && boss.currentDiagonalCorner });
        }
        return positions;
    },

    resolveBossPathForAction: function(m, action, gameState, mode = 'current') {
        const boss = m.boss;
        if (!boss) return null;

        const source = String((action && action.Hitbox_Path_Source) || '').trim().toUpperCase();
        if (source === 'LAST_DASH_PATH') return boss.lastDashPath;
        if (source === 'CURRENT_DASH_PATH') return boss.currentDashPath;
        if (source === 'PREVIEW_DASH_PATH') return boss.previewDashPath;

        if (mode === 'preview') return boss.previewDashPath;
        if (mode === 'last') return boss.lastDashPath;
        return boss.currentDashPath;
    },

    pushPathWarningEffect: function(path, width, duration, renderType, gameState) {
        if (!path) return;
        const length = this.getPathLength(path);
        if (length <= 0) return;

        gameState.effects.push({
            type: 'warning',
            renderType: renderType || 'WARNING_SLASH_PATH',
            warningRenderType: renderType || 'WARNING_SLASH_PATH',
            x: (path.startX + path.endX) / 2,
            y: (path.startY + path.endY) / 2,
            z: path.startZ || 0,
            w: length,
            d: width,
            h: 0,
            pathAngle: Math.atan2(path.endY - path.startY, path.endX - path.startX),
            life: duration,
            maxLife: duration
        });
    },

    pushPathSlashEffects: function(path, width, height, renderType, gameState, lifeOverride = null) {
        if (!path) return;
        const length = this.getPathLength(path);
        if (length <= 0) return;

        const effectType = String(renderType || '').trim().toUpperCase();
        const pathAngle = Math.atan2(path.endY - path.startY, path.endX - path.startX);

        // 카시야스 본체 돌진: 무수한 검격이 아니라 경로를 길게 가르는 일섬 1개로 표현한다.
        if (
            effectType === 'EFT_RUSH_ISSEN' ||
            effectType === 'EFT_KASIYAS_RUSH_ISSEN' ||
            effectType === 'EFT_KASIYAS_RUSH_SLASH'
        ) {
            gameState.effects.push({
                type: 'rushIssen',
                renderType: effectType || 'EFT_RUSH_ISSEN',
                x: (path.startX + path.endX) / 2,
                y: (path.startY + path.endY) / 2,
                z: (path.startZ || 0) + Math.max(35, height * 0.58),
                w: Math.max(120, length),
                h: Math.max(28, width * 0.58),
                life: 0.22,
                maxLife: 0.22,
                pathAngle: pathAngle,
                color: 'rgba(255, 52, 45, 0.98)',
                accentColor: 'rgba(32, 0, 0, 0.92)'
            });
            return;
        }

        // 카시야스 잔류 검격: 경로 위에 얇은 검선 여러 개를 남긴다.
        if (
            effectType === 'EFT_MANY_SLASH_BURST' ||
            effectType === 'EFT_KASIYAS_PATH_SLASH_LINES'
        ) {
            const count = Math.max(10, Math.min(24, Math.round(length / 65)));
            const isKasiyasLines = effectType === 'EFT_KASIYAS_PATH_SLASH_LINES';

            for (let i = 0; i < count; i++) {
                const t = (i + 0.35 + Math.random() * 0.30) / count;
                const side = (Math.random() * 2 - 1) * (width * (isKasiyasLines ? 0.36 : 0.42));
                const nx = -(path.dirY || 0);
                const ny = path.dirX || 0;
                const x = path.startX + (path.endX - path.startX) * t + nx * side;
                const y = path.startY + (path.endY - path.startY) * t + ny * side;

                gameState.effects.push({
                    type: 'pathLineSlash',
                    renderType: effectType,
                    x: x,
                    y: y,
                    z: (path.startZ || 0) + height * (0.20 + Math.random() * 0.55),
                    dir: Math.random() > 0.5 ? 1 : -1,
                    w: isKasiyasLines
                        ? Math.max(34, width * (0.62 + Math.random() * 0.44))
                        : Math.max(42, width * (0.85 + Math.random() * 0.55)),
                    h: isKasiyasLines
                        ? Math.max(18, height * (0.24 + Math.random() * 0.18))
                        : Math.max(28, height * (0.34 + Math.random() * 0.26)),
                    life: lifeOverride !== null ? Math.max(0.08, lifeOverride) : (0.18 + Math.random() * 0.10),
                    maxLife: lifeOverride !== null ? Math.max(0.08, lifeOverride) : 0.26,
                    color: isKasiyasLines ? 'rgba(255, 60, 54, 0.92)' : 'rgba(255, 68, 58, 0.95)',
                    accentColor: isKasiyasLines ? 'rgba(28, 0, 0, 0.88)' : 'rgba(40, 0, 0, 0.86)',
                    pathAngle: pathAngle + (Math.random() * 1.15 - 0.575)
                });
            }
            return;
        }

        const count = Math.max(6, Math.min(16, Math.round(length / 90)));
        for (let i = 0; i < count; i++) {
            const t = (i + 0.5) / count;
            const side = (Math.random() * 2 - 1) * (width * 0.36);
            const nx = -(path.dirY || 0);
            const ny = path.dirX || 0;
            const x = path.startX + (path.endX - path.startX) * t + nx * side;
            const y = path.startY + (path.endY - path.startY) * t + ny * side;
            gameState.effects.push({
                type: 'slash',
                renderType: renderType || 'EFT_KASIYAS_RUSH_SLASH',
                x: x,
                y: y,
                z: (path.startZ || 0) + height * (0.35 + Math.random() * 0.35),
                dir: path.dirX >= 0 ? 1 : -1,
                w: Math.max(80, width * 1.8),
                h: Math.max(70, height * 0.75),
                life: 0.22,
                maxLife: 0.22,
                color: 'rgba(255, 235, 210, 0.96)',
                pathAngle: pathAngle
            });
        }
    },

    pushPathResidualSlashField: function(path, width, height, gameState, warningDuration, delayDuration, hitDuration, renderType) {
        if (!path) return;
        const length = this.getPathLength(path);
        if (length <= 0) return;

        const safeWarning = Math.max(0.05, parseFloat(warningDuration) || 0);
        const safeDelay = Math.max(0, parseFloat(delayDuration) || 0);
        const safeHit = Math.max(0.05, parseFloat(hitDuration) || 0.2);
        const totalLife = Math.max(0.12, safeWarning + safeDelay + safeHit + 0.10);
        const pathAngle = Math.atan2(path.endY - path.startY, path.endX - path.startX);

        gameState.effects.push({
            type: 'pathResidualSlashField',
            renderType: renderType || 'EFT_KASIYAS_PATH_SLASH_LINES',
            x: (path.startX + path.endX) / 2,
            y: (path.startY + path.endY) / 2,
            z: (path.startZ || 0) + Math.max(10, height * 0.42),
            w: length,
            d: width,
            h: height,
            pathAngle: pathAngle,
            warningDuration: safeWarning,
            delayDuration: safeDelay,
            hitDuration: safeHit,
            life: totalLife,
            maxLife: totalLife,
            seed: Math.floor(Math.random() * 100000)
        });
    },

    isPlayerInsidePathHitbox: function(path, width, height, gameState) {
        const p = gameState.player;
        if (!path || !p || !p.active || p.hp <= 0) return false;

        const ax = path.startX;
        const ay = path.startY;
        const bx = path.endX;
        const by = path.endY;
        const px = p.x;
        const py = p.y;
        const abx = bx - ax;
        const aby = by - ay;
        const abLenSq = abx * abx + aby * aby;
        if (abLenSq <= 0.0001) return false;

        let t = ((px - ax) * abx + (py - ay) * aby) / abLenSq;
        t = Math.max(0, Math.min(1, t));
        const cx = ax + abx * t;
        const cy = ay + aby * t;
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);

        const playerRadiusY = ((p.bodyY || 30) * (p.scale || 1)) / 2;
        const inPathWidth = dist <= (width / 2 + playerRadiusY);
        const atkZ = path.startZ || 0;
        const pH = (p.bodyZ || 100) * (p.scale || 1);
        const inZ = atkZ < (p.z + pH) && (atkZ + height) > p.z;
        return inPathWidth && inZ;
    },

    isPlayerInsideCircleHitbox: function(hitbox, gameState) {
        const p = gameState.player;
        if (!hitbox || !p || !p.active || p.hp <= 0) return false;

        const playerRadiusX = ((p.bodyX || 50) * (p.scale || 1)) / 2;
        const playerRadiusY = ((p.bodyY || 30) * (p.scale || 1)) / 2;
        const rx = Math.max(1, (hitbox.w || 1) / 2 + playerRadiusX);
        const ry = Math.max(1, (hitbox.d || 1) / 2 + playerRadiusY);
        const nx = ((p.x || 0) - (hitbox.x || 0)) / rx;
        const ny = ((p.y || 0) - (hitbox.y || 0)) / ry;
        const inXY = (nx * nx + ny * ny) <= 1;

        const pH = (p.bodyZ || 100) * (p.scale || 1);
        const atkZ = hitbox.z || 0;
        const inZ = atkZ < ((p.z || 0) + pH) && (atkZ + (hitbox.h || 1)) > (p.z || 0);
        return inXY && inZ;
    },

    isPlayerInsideBoxHitbox: function(hitbox, gameState) {
        const p = gameState.player;
        if (!hitbox || !p || !p.active || p.hp <= 0) return false;
        const pW = (p.bodyX || 50) * (p.scale || 1);
        const pD = (p.bodyY || 30) * (p.scale || 1);
        const pH = (p.bodyZ || 100) * (p.scale || 1);
        return checkAABB3D(hitbox.x, hitbox.y, hitbox.z, hitbox.w, hitbox.d, hitbox.h, p.x, p.y, p.z, pW, pD, pH);
    },

    pushDebugPathHitbox: function(path, width, height, life, gameState) {
        if (!path) return;
        gameState.hitboxes.push({
            type: 'path',
            startX: path.startX,
            startY: path.startY,
            endX: path.endX,
            endY: path.endY,
            z: path.startZ || 0,
            w: this.getPathLength(path),
            d: width,
            h: height,
            life: life || 0.12
        });
    },


    pushBossActionCueEffect: function(m, action, gameState) {
        const eff = String(action && (action.VFX_Type || action.Effect_Render_Type) || '').trim().toUpperCase();
        if (!eff) return;

        const scale = parseFloat(m && m.scale) || 1;
        const bodyX = ((m && m.d && m.d.bodyX) || 80) * scale;
        const bodyY = ((m && m.d && m.d.bodyY) || 60) * scale;
        const bodyZ = ((m && m.d && m.d.bodyZ) || 160) * scale;
        const hitW = (parseFloat(action && action.Hitbox_Size_X) || bodyX * 2.0) * scale;
        const hitD = (parseFloat(action && action.Hitbox_Size_Y) || bodyY * 1.6) * scale;
        const hitH = (parseFloat(action && action.Hitbox_Size_Z) || bodyZ * 0.9) * scale;
        const hitOffX = (parseFloat(action && action.Hitbox_Offset_X) || bodyX * 0.55) * scale;
        const hitOffZ = (parseFloat(action && action.Hitbox_Offset_Z) || bodyZ * 0.48) * scale;
        const dir = m && m.faceDir === -1 ? -1 : 1;
        const duration = Math.max(0.12, Math.min(0.45, this.getBossActionDuration(m, action, gameState) * 0.55));

        if (eff === 'EFT_KASIYAS_SHOULDER_ATK') {
            gameState.effects.push({
                type: 'shoulderCharge',
                renderType: eff,
                x: m.x + dir * Math.max(bodyX * 0.58, hitOffX * 0.72),
                y: m.y,
                z: m.z + Math.max(bodyZ * 0.52, hitOffZ),
                dir: dir,
                w: Math.max(hitW * 1.05, bodyX * 2.2),
                d: Math.max(hitD * 1.05, bodyY * 1.5),
                h: Math.max(hitH, bodyZ * 0.70),
                burstScale: 1.0,
                life: duration,
                maxLife: duration,
                color: 'rgba(255,88,58,0.88)',
                accentColor: 'rgba(22,0,0,0.88)'
            });
            return;
        }

        if (eff === 'EFT_KASIYAS_FIST_BUMPING') {
            gameState.effects.push({
                type: 'hitSpark',
                renderType: eff,
                x: m.x + dir * Math.max(bodyX * 0.72, hitOffX * 0.85),
                y: m.y,
                z: m.z + Math.max(bodyZ * 0.58, hitOffZ),
                dir: dir,
                w: Math.max(hitW * 1.05, bodyX * 2.0),
                d: Math.max(hitD * 1.05, bodyY * 1.4),
                h: Math.max(hitH, bodyZ * 0.72),
                burstScale: 1.0,
                life: duration,
                maxLife: duration,
                color: 'rgba(255,78,58,0.90)',
                accentColor: 'rgba(18,0,0,0.90)'
            });
            return;
        }

        if (eff === 'EFT_KASIYAS_STOMP') {
            gameState.effects.push({
                type: 'stompDust',
                renderType: eff,
                x: m.x + dir * bodyX * 0.36,
                y: m.y,
                z: m.z + 4,
                w: Math.max(bodyX * 1.1, hitW * 0.45),
                d: Math.max(bodyY * 0.9, hitD * 0.45),
                h: Math.max(18, bodyZ * 0.12),
                life: Math.min(duration, 0.22),
                maxLife: Math.min(duration, 0.22),
                color: 'rgba(230,214,188,0.58)',
                accentColor: 'rgba(56,42,30,0.64)'
            });
        }
    },

    onBossPatternActionStart: function(m, action, gameState) {
        const boss = m.boss;
        if (!boss) return;

        const type = String(action.Action_Type || '').trim().toUpperCase();
        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        const pathSource = String(action.Hitbox_Path_Source || '').trim().toUpperCase();
        const vfxType = String(action.VFX_Type || action.Warning_Render_Type || '').trim().toUpperCase();
        const moveType = this.normalizeBossActionMoveType(action.Action_Move_Type);

        if (type === 'ATK' || type === 'CAST_SPAWN_OBJECT') {
            this.pushBossActionCueEffect(m, action, gameState);
        }

        if (type === 'MOVE' && moveType === 'DASH') {
            const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
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
                if (action.VFX_Type) {
                    gameState.effects.push({
                        type: 'afterimageDashTrail',
                        renderType: action.VFX_Type,
                        x: m.x,
                        y: m.y,
                        z: m.z + ((m.d && m.d.bodyZ) || 160) * 0.42,
                        dir: m.faceDir,
                        w: Math.max(100, distance * 0.45),
                        h: 52,
                        life: 0.22,
                        maxLife: 0.22,
                        pathAngle: Math.atan2(target.y - m.y, target.x - m.x)
                    });
                }
                return;
            }

            if (moveDir === 'TO_PLAYER' || moveDir === 'CHASE_ENEMY') {
                const p = gameState.player;
                const dx = p.x - m.x;
                const dy = p.y - m.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const stopDistance = Math.max(70, parseFloat(action.Action_Move_Stop_Distance) || 105);
                const ratio = Math.max(0, (dist - stopDistance) / dist);
                const target = {
                    x: m.x + dx * ratio,
                    y: m.y + dy * ratio
                };
                const moveDistance = Math.sqrt((target.x - m.x) ** 2 + (target.y - m.y) ** 2);
                const speed = this.getBossActionMoveSpeed(m, action, boss) || 1200;
                boss.actionMove = {
                    type: moveDir,
                    startX: m.x,
                    startY: m.y,
                    endX: Math.max(0, Math.min(gameState.WORLD_WIDTH, target.x)),
                    endY: Math.max(0, Math.min(gameState.WORLD_DEPTH, target.y)),
                    duration: Math.max(0.18, Math.min(0.75, moveDistance / Math.max(1, speed)))
                };
                m.faceDir = target.x >= m.x ? 1 : -1;
                if (action.VFX_Type) {
                    gameState.effects.push({
                        type: 'afterimageDashTrail',
                        renderType: action.VFX_Type,
                        x: m.x,
                        y: m.y,
                        z: m.z + ((m.d && m.d.bodyZ) || 160) * 0.42,
                        dir: m.faceDir,
                        w: Math.max(80, moveDistance * 0.45),
                        h: 48,
                        life: 0.20,
                        maxLife: 0.20,
                        pathAngle: Math.atan2(target.y - m.y, target.x - m.x)
                    });
                }
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
                const duration = this.getBossActionDuration(m, action, gameState);
                gameState.effects.push({
                    type: 'warning',
                    renderType: 'WARNING_HITBOX',
                    warningRenderType: 'WARNING_HITBOX',
                    x: hitbox.x,
                    y: hitbox.y,
                    z: hitbox.z,
                    w: hitbox.w,
                    d: hitbox.d,
                    h: hitbox.h,
                    hitboxType: String(atk.Hitbox_Type || '').trim().toUpperCase(),
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

    pushBossPatternActionEffect: function(m, action, atkX, atkY, atkZ, atkW, atkD, atkH, gameState) {
        const effEnum = String(action.VFX_Type || 'EFT_SLASH').trim();
        const effectScale = Math.max(1, parseFloat(m.scale) || 1);
        const poseType = String(action.Action_Pose_Type || '').trim().toUpperCase();

        let slashColor = 'rgba(255, 56, 50, 0.96)';
        let accentColor = 'rgba(32, 0, 0, 0.88)';
        let life = 0.24;

        const upperEff = effEnum.toUpperCase();
        if (upperEff === 'EFT_KASIYAS_SHOULDER_ATK') {
            gameState.effects.push({
                type: 'shoulderCharge',
                renderType: upperEff,
                x: atkX,
                y: atkY,
                z: atkZ + atkH * 0.48,
                dir: m.faceDir,
                w: Math.max(atkW * 1.16, 190 * effectScale),
                d: Math.max((atkD || atkH * 0.55) * 1.12, 90 * effectScale),
                h: Math.max(atkH, 90 * effectScale),
                life: 0.30,
                maxLife: 0.30,
                color: 'rgba(255,88,58,0.90)',
                accentColor: 'rgba(22,0,0,0.90)'
            });
            return;
        }

        if (upperEff === 'EFT_KASIYAS_FIST_BUMPING' || upperEff === 'EFT_KASIYAS_STOMP') {
            gameState.effects.push({
                type: upperEff === 'EFT_KASIYAS_STOMP' ? 'stompDust' : 'hitSpark',
                renderType: upperEff,
                x: atkX,
                y: atkY,
                z: atkZ + atkH * (upperEff === 'EFT_KASIYAS_STOMP' ? 0.18 : 0.55),
                dir: m.faceDir,
                w: upperEff === 'EFT_KASIYAS_STOMP' ? Math.max(atkW * 0.52, 85 * effectScale) : Math.max(atkW * 1.10, 150 * effectScale),
                d: upperEff === 'EFT_KASIYAS_STOMP' ? Math.max((atkD || atkH) * 0.48, 55 * effectScale) : Math.max((atkD || atkH) * 1.08, 70 * effectScale),
                h: upperEff === 'EFT_KASIYAS_STOMP' ? Math.max(18, atkH * 0.20) : atkH,
                life: upperEff === 'EFT_KASIYAS_STOMP' ? 0.18 : 0.24,
                maxLife: upperEff === 'EFT_KASIYAS_STOMP' ? 0.18 : 0.24,
                burstScale: upperEff === 'EFT_KASIYAS_FIST_BUMPING' ? 1.45 : 0.85,
                color: upperEff === 'EFT_KASIYAS_STOMP' ? 'rgba(230,214,188,0.58)' : 'rgba(255,76,60,0.92)',
                accentColor: upperEff === 'EFT_KASIYAS_STOMP' ? 'rgba(56,42,30,0.64)' : 'rgba(28,0,0,0.90)'
            });
            return;
        }

        if (upperEff === 'EFT_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_CHARGE_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_SLASH_01' || upperEff === 'EFT_KASIYAS_SLASH_04') {
            slashColor = 'rgba(255, 48, 44, 0.98)';
            accentColor = 'rgba(26, 0, 0, 0.92)';
            life = 0.28;
        } else if (upperEff === 'EFT_STABBING' || upperEff === 'EFT_KASIYAS_STABBING' || upperEff === 'EFT_KASIYAS_SLASH_02') {
            slashColor = 'rgba(255, 64, 56, 0.98)';
            accentColor = 'rgba(20, 0, 0, 0.90)';
            life = 0.22;
        } else if (upperEff === 'EFT_SLASH_UP' || upperEff === 'EFT_KASIYAS_SLASH_UP' || upperEff === 'EFT_KASIYAS_SLASH_03') {
            slashColor = 'rgba(255, 58, 52, 0.98)';
            accentColor = 'rgba(30, 0, 0, 0.92)';
            life = 0.28;
        } else if (upperEff === 'EFT_RUSH_ISSEN' || upperEff === 'EFT_KASIYAS_RUSH_ISSEN' || upperEff === 'EFT_KASIYAS_RUSH_SLASH') {
            slashColor = 'rgba(255, 52, 45, 0.98)';
            accentColor = 'rgba(18, 0, 0, 0.94)';
            life = 0.24;
        }

        gameState.effects.push({
            type: 'slash',
            renderType: effEnum,
            poseType: poseType,
            x: atkX,
            y: atkY,
            z: atkZ + atkH / 2,
            dir: m.faceDir,
            w: atkW,
            h: atkH,
            life: life,
            maxLife: life,
            color: slashColor,
            accentColor: accentColor,
            effectScale: effectScale
        });
    },

    buildGuardInfoFromAttackData: function(data) {
        if (!data) return null;
        return {
            canGuard: data.ATK_Can_Guard === true || String(data.ATK_Can_Guard || '').trim().toLowerCase() === 'true',
            guardResult: data.Guard_Result_Type || '',
            guardDmgReduceRate: parseFloat(data.Guard_DMG_Reduce_Rate),
            attackType: data.Attack_Type || data.Action_Attack_Type || data.Object_Type || data.Action_Type || '',
            makeKnockback: data.ATK_Make_Knockback === true || String(data.ATK_Make_Knockback || '').trim().toLowerCase() === 'true',
            knockbackCanGuard: data.Knockback_Can_Guard === true || String(data.Knockback_Can_Guard || '').trim().toLowerCase() === 'true',
            knockbackDistance: parseFloat(data.Knockback_Distance) || 0
        };
    },

    fireBossPatternActionHit: function(m, action, gameState) {
        const actionType = String(action.Action_Type || '').trim().toUpperCase();
        // MOVE 계열은 위치 이동만 수행한다. 패턴4의 대각 이동처럼 히트박스 데이터가 실수로 남아 있거나
        // 기본값 fallback이 들어가더라도 공격 판정이 발생하지 않도록 막는다.
        if (['WARNING_PATH','WARNING','WAIT','SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT','MOVE'].includes(actionType)) return false;

        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        const dmgRate = parseFloat(action.ATK_Damage_Rate) || 1;
        const baseDmg = m.d.atk * dmgRate;
        const p = gameState.player;
        if (!p || !p.active || p.hp <= 0) return false;

        this.pushBossDebugLog(
            gameState,
            'HIT',
            `${String(action.Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
            `${hitboxType || 'HITBOX'} / damage ${baseDmg.toFixed(1)}`
        );

        if (hitboxType === 'HITBOX_PATH_BOX') {
            const path = this.resolveBossPathForAction(m, action, gameState, 'current') || m.boss.lastDashPath;
            const width = (parseFloat(action.Hitbox_Size_Y) || 90) * (m.scale || 1);
            const height = (parseFloat(action.Hitbox_Size_Z) || 120) * (m.scale || 1);
            this.pushDebugPathHitbox(path, width, height, 0.15, gameState);
            this.pushPathSlashEffects(path, width, height, action.VFX_Type || 'EFT_KASIYAS_RUSH_SLASH', gameState);
            if (this.isPlayerInsidePathHitbox(path, width, height, gameState)) {
                PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), m.x, m.y, null, 0, 0, this.buildGuardInfoFromAttackData(action));
                return true;
            }
            return false;
        }

        if (hitboxType === 'HITBOX_BODY_COLLISION') {
            const scale = m.scale || 1;
            const atkW = (parseFloat(action.Hitbox_Size_X) || m.d.bodyX || 80) * scale;
            const atkD = (parseFloat(action.Hitbox_Size_Y) || m.d.bodyY || 60) * scale;
            const atkH = (parseFloat(action.Hitbox_Size_Z) || m.d.bodyZ || 160) * scale;
            const atkX = m.x + (parseFloat(action.Hitbox_Offset_X) || 0) * scale * (m.faceDir === -1 ? -1 : 1);
            const atkY = m.y + (parseFloat(action.Hitbox_Offset_Y) || 0) * scale;
            const atkZ = m.z + (parseFloat(action.Hitbox_Offset_Z) || 0) * scale;
            const hitbox = { x: atkX, y: atkY, z: atkZ, w: atkW, d: atkD, h: atkH };
            gameState.hitboxes.push({ ...hitbox, life: 0.08 });
            if (this.isPlayerInsideBoxHitbox(hitbox, gameState)) {
                if (action.VFX_Type) {
                    const upperVfx = String(action.VFX_Type || '').toUpperCase();
                    gameState.effects.push({
                        type: upperVfx === 'EFT_KASIYAS_SHOULDER_ATK' ? 'shoulderCharge' : 'hitSpark',
                        renderType: action.VFX_Type,
                        x: atkX,
                        y: atkY,
                        z: atkZ + atkH * 0.58,
                        dir: m.faceDir,
                        w: upperVfx === 'EFT_KASIYAS_SHOULDER_ATK' ? Math.max(atkW * 1.12, 170 * scale) : Math.max(atkW * 1.04, 120 * scale),
                        d: upperVfx === 'EFT_KASIYAS_SHOULDER_ATK' ? Math.max(atkD * 1.10, 70 * scale) : Math.max(atkD * 1.04, 60 * scale),
                        h: atkH,
                        burstScale: upperVfx === 'EFT_KASIYAS_SHOULDER_ATK' ? 1.0 : 1.35,
                        life: 0.20,
                        maxLife: 0.20,
                        color: 'rgba(255,82,60,0.92)',
                        accentColor: 'rgba(28,0,0,0.90)'
                    });
                }
                PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), atkX, atkY, null, 0, 0, this.buildGuardInfoFromAttackData(action));
                return true;
            }
            return false;
        }

        if (hitboxType === 'HITBOX_CIRCLE') {
            const hitbox = this.getBossPatternActionHitbox(m, action);
            gameState.hitboxes.push({ ...hitbox, type: 'circle', life: 0.1 });
            this.pushBossPatternActionEffect(m, action, hitbox.x, hitbox.y, hitbox.z, hitbox.w, hitbox.d, hitbox.h, gameState);
            if (this.isPlayerInsideCircleHitbox(hitbox, gameState)) {
                PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), hitbox.x, hitbox.y, null, 0, 0, this.buildGuardInfoFromAttackData(action));
                return true;
            }
            return false;
        }

        const atkW = (parseFloat(action.Hitbox_Size_X) || 100) * m.scale;
        const atkD = (parseFloat(action.Hitbox_Size_Y) || 50) * m.scale;
        const atkH = (parseFloat(action.Hitbox_Size_Z) || 80) * m.scale;

        const offsetX = (parseFloat(action.Hitbox_Offset_X) || atkW / 2) * m.scale;
        const offsetY = (parseFloat(action.Hitbox_Offset_Y) || 0) * m.scale;
        const offsetZ = (parseFloat(action.Hitbox_Offset_Z) || 0) * m.scale;

        const atkX = m.x + offsetX * (m.faceDir === -1 ? -1 : 1);
        const atkY = m.y + offsetY;
        const atkZ = m.z + offsetZ;
        const hitbox = { x: atkX, y: atkY, z: atkZ, w: atkW, d: atkD, h: atkH };

        gameState.hitboxes.push({ ...hitbox, life: 0.1 });
        this.pushBossPatternActionEffect(m, action, atkX, atkY, atkZ, atkW, atkD, atkH, gameState);

        if (this.isPlayerInsideBoxHitbox(hitbox, gameState)) {
            PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), atkX, atkY, null, 0, 0, this.buildGuardInfoFromAttackData(action));
            return true;
        }
        return false;
    },

    updateBossPatternActionMovement: function(m, action, deltaTime, gameState) {
        const moveType = this.normalizeBossActionMoveType(action.Action_Move_Type);
        if (moveType !== 'WALK' && moveType !== 'RUSH' && moveType !== 'DASH' && moveType !== 'MOVE_SHOULDER_ATK') return;

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

        if (moveType === 'DASH') {
            const boss = m.boss;
            const move = boss && boss.actionMove ? boss.actionMove : null;
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
    },

    pushBossCastEffect: function(m, action, gameState) {
        const eff = String(action.VFX_Type || '').trim().toUpperCase();
        if (!eff) return;

        if (eff === 'EFT_SUMMON_CLONE') {
            gameState.effects.push({
                type: 'cloneSummon',
                renderType: eff,
                x: m.x + (m.faceDir || 1) * ((m.d.bodyX || 80) * (m.scale || 1) * 0.25),
                y: m.y,
                z: m.z + ((m.d.bodyZ || 160) * (m.scale || 1) * 0.55),
                dir: m.faceDir || 1,
                w: ((m.d.bodyX || 80) * (m.scale || 1)) * 1.8,
                h: ((m.d.bodyZ || 160) * (m.scale || 1)) * 0.9,
                life: 0.30,
                maxLife: 0.30,
                color: 'rgba(255,70,58,0.82)',
                accentColor: 'rgba(24,0,0,0.82)'
            });
            return;
        }

        if (eff === 'EFT_KASIYAS_STOMP') {
            gameState.effects.push({
                type: 'stompDust',
                renderType: eff,
                x: m.x + (m.faceDir || 1) * ((m.d.bodyX || 80) * (m.scale || 1) * 0.35),
                y: m.y,
                z: m.z + 6,
                w: ((m.d.bodyX || 80) * (m.scale || 1)) * 1.15,
                d: ((m.d.bodyY || 60) * (m.scale || 1)) * 1.10,
                h: 24,
                life: 0.20,
                maxLife: 0.20,
                color: 'rgba(230,214,188,0.58)',
                accentColor: 'rgba(56,42,30,0.64)'
            });
            return;
        }

        if (eff === 'EFT_CAST_AFTERIMAGE') {
            gameState.effects.push({
                type: 'castAfterimageBurst',
                renderType: eff,
                x: m.x + (m.faceDir || 1) * ((m.d.bodyX || 80) * (m.scale || 1) * 0.45),
                y: m.y,
                z: m.z + ((m.d.bodyZ || 160) * (m.scale || 1) * 0.55),
                dir: m.faceDir || 1,
                w: ((m.d.bodyX || 80) * (m.scale || 1)) * 1.6,
                h: ((m.d.bodyZ || 160) * (m.scale || 1)) * 0.55,
                life: 0.24,
                maxLife: 0.24,
                color: 'rgba(180, 225, 255, 0.86)'
            });
            return;
        }

        // 그 외 캐스팅 이펙트는 기존 참격 이펙트로 간단히 표시한다.
        const atkW = ((m.d.bodyX || 80) * (m.scale || 1)) * 1.2;
        const atkD = ((m.d.bodyY || 60) * (m.scale || 1)) * 1.2;
        const atkH = ((m.d.bodyZ || 160) * (m.scale || 1)) * 0.8;
        this.pushBossPatternActionEffect(
            m,
            action,
            m.x + (m.faceDir || 1) * atkW * 0.25,
            m.y,
            m.z + atkH * 0.15,
            atkW,
            atkD,
            atkH,
            gameState
        );
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

    onBossObjectActionStart: function(obj, action, gameState) {
        const type = String(action.Action_Type || '').trim().toUpperCase();

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
            obj.faceDir = dx >= 0 ? 1 : -1;

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
                    const duration = this.getBossObjectCurrentActionDuration(obj, action);
                    gameState.effects.push({
                        type: 'warning',
                        renderType: 'WARNING_HITBOX',
                        warningRenderType: 'WARNING_HITBOX',
                        x: hitbox.x,
                        y: hitbox.y,
                        z: hitbox.z,
                        w: hitbox.w,
                        d: hitbox.d,
                        h: hitbox.h,
                        hitboxType: String(atk.Hitbox_Type || '').trim().toUpperCase(),
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

    getBossObjectActionHitbox: function(obj, action) {
        const scale = obj.scale || 1;
        const w = (parseFloat(action.Hitbox_Size_X) || 100) * scale;
        const d = (parseFloat(action.Hitbox_Size_Y) || 60) * scale;
        const h = (parseFloat(action.Hitbox_Size_Z) || 80) * scale;
        const offX = (parseFloat(action.Hitbox_Offset_X) || 0) * scale;
        const offY = (parseFloat(action.Hitbox_Offset_Y) || 0) * scale;
        const offZ = (parseFloat(action.Hitbox_Offset_Z) || 0) * scale;

        return {
            x: obj.x + offX * (obj.faceDir === -1 ? -1 : 1),
            y: obj.y + offY,
            z: obj.z + offZ,
            w: w,
            d: d,
            h: h
        };
    },

    pushBossObjectActionEffect: function(obj, action, hitbox, gameState) {
        const renderType = String(action.VFX_Type || '').trim().toUpperCase();
        if (!renderType) return;

        if (renderType === 'EFT_KASIYAS_LOW_AREA_SLASH') {
            gameState.effects.push({
                type: 'lowCircleSlash',
                renderType: renderType,
                x: hitbox.x,
                y: hitbox.y,
                z: hitbox.z + Math.max(8, hitbox.h * 0.25),
                w: hitbox.w,
                d: hitbox.d,
                h: hitbox.h,
                dir: obj.faceDir || 1,
                life: 0.24,
                maxLife: 0.24,
                color: 'rgba(255, 58, 50, 0.96)',
                accentColor: 'rgba(24, 0, 0, 0.90)'
            });
            return;
        }

        gameState.effects.push({
            type: 'slash',
            renderType: renderType,
            x: hitbox.x,
            y: hitbox.y,
            z: hitbox.z + hitbox.h / 2,
            dir: obj.faceDir || 1,
            w: hitbox.w,
            h: hitbox.h,
            life: 0.22,
            maxLife: 0.22,
            color: 'rgba(255, 56, 50, 0.98)',
            accentColor: 'rgba(28, 0, 0, 0.90)'
        });
    },

    fireBossObjectActionHit: function(obj, action, gameState) {
        const p = gameState.player;
        if (!p || !p.active || p.hp <= 0) return false;

        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        if (hitboxType !== 'HITBOX_BOX' && hitboxType !== 'HITBOX_CIRCLE') return false;

        const hitbox = this.getBossObjectActionHitbox(obj, action);
        gameState.hitboxes.push({ ...hitbox, type: hitboxType === 'HITBOX_CIRCLE' ? 'circle' : undefined, life: 0.12 });
        this.pushBossObjectActionEffect(obj, action, hitbox, gameState);

        const isHit = hitboxType === 'HITBOX_CIRCLE'
            ? this.isPlayerInsideCircleHitbox(hitbox, gameState)
            : this.isPlayerInsideBoxHitbox(hitbox, gameState);

        if (isHit) {
            const owner = obj.owner;
            if (owner && owner.hp > 0) {
                const dmgRate = parseFloat(action.ATK_Damage_Rate) || parseFloat(action.Damage_Rate) || 1;
                const baseDmg = owner.d.atk * dmgRate;
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT_HIT',
                    `${String(action.Object_Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
                    `${hitboxType || 'HITBOX'} / damage ${baseDmg.toFixed(1)}`
                );
                PlayerManager.takeDamage(
                    gameState,
                    calcScaledDamage(owner.d.level, gameState.player.level, baseDmg),
                    hitbox.x,
                    hitbox.y,
                    null,
                    0,
                    0,
                    this.buildGuardInfoFromAttackData(action)
                );
                return true;
            }
        }
        return false;
    },

    spawnBossAttackObjectFromAction: function(m, action, gameState) {
        const objectId = String(action.Spawn_Object_ID || action.Object_ID || '').trim();
        if (!objectId) return;

        const objData = gameState.DB_BOSS_PATTERN_OBJECT ? gameState.DB_BOSS_PATTERN_OBJECT[objectId] : null;
        if (!objData) {
            console.warn('Boss_Pattern_Object_info에서 오브젝트를 찾을 수 없음:', objectId);
            return;
        }

        const objectType = String(objData.Object_Type || '').trim().toUpperCase();
        const hasObjectActions = Array.isArray(objData.Runtime_Actions) && objData.Runtime_Actions.length > 0;
        const spawnCount = Math.max(1, parseInt(action.Object_Spawn_Count || action.Spawn_Count) || 1);

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
                    maxLife: Math.max(4, parseFloat(objData.Object_Max_Life) || 8),
                    actionIndex: -1,
                    action: null,
                    actionTimer: 0,
                    actionHitFired: false,
                    actions: hasObjectActions ? [...objData.Runtime_Actions] : [],
                    poseType: 'POSE_KASIYAS_DEFAULT',
                    targetSnapshotX: gameState.player ? gameState.player.x : pos.x + (m.faceDir || 1) * 400,
                    targetSnapshotY: gameState.player ? gameState.player.y : pos.y,
                    opacity: objData.Object_Opacity !== '' && objData.Object_Opacity != null ? parseFloat(objData.Object_Opacity) : (objectType === 'KASIYAS_CLONE' || objectType === 'CLONE' ? 0.78 : 0.5),
                    brightness: objData.Object_Brightness !== '' && objData.Object_Brightness != null ? parseFloat(objData.Object_Brightness) : (objectType === 'KASIYAS_CLONE' || objectType === 'CLONE' ? 1.05 : 1.3),
                    renderType: objData.Object_Render_Type || (objectType === 'KASIYAS_CLONE' || objectType === 'CLONE' ? 'OBJ_KASIYAS_CLONE' : 'OBJ_KASIYAS_AFTERIMAGE'),
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

                if (obj.maxLife && obj.timer > obj.maxLife) {
                    this.pushBossDebugLog(gameState, 'OBJECT_END', `${this.getBossDebugName(obj.data)}`, 'fail-safe removed');
                    objects.splice(i, 1);
                    continue;
                }

                if (obj.action) {
                    this.updateBossObjectActionMovement(obj, obj.action, deltaTime, gameState);

                    const actionType = String(obj.action.Action_Type || '').trim().toUpperCase();
                    if (actionType === 'ATK' && !obj.actionHitFired) {
                        const hitWindow = this.getBossObjectActionHitWindow(obj, obj.action);
                        const hitStart = hitWindow.start;
                        const hitEnd = hitWindow.end || hitStart;
                        if (obj.actionTimer >= hitStart && obj.actionTimer <= hitEnd) {
                            obj.actionHitFired = true;
                            this.fireBossObjectActionHit(obj, obj.action, gameState);
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

    updateBossDefaultAction: function(m, distX, distY, deltaTime, gameState) {
        const boss = m.boss;
        const phase = boss && boss.phase ? boss.phase : {};
        const stopDist = parseFloat(phase.Chase_Stop_Distance) || 120;
        const moveRate = parseFloat(phase.Default_Move_Speed_Rate) || 1;

        const dx = gameState.player.x - m.x;
        const dy = gameState.player.y - m.y;

        m.faceDir = dx >= 0 ? 1 : -1;

        let moveX = 0;
        let moveY = 0;

        if (distX > stopDist) moveX = Math.sign(dx);
        if (Math.abs(dy) > 22) moveY = Math.sign(dy);

        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        if (len > 0) { moveX /= len; moveY /= len; }

        m.x += moveX * m.d.speed * moveRate * deltaTime;
        m.y += moveY * m.d.speed * moveRate * 0.7 * deltaTime;
        m.state = len > 0 ? 'CHASE' : 'IDLE';
    },

    updateBossPatternMonster: function(m, deltaTime, distX, distY, dist2D, gameState) {
        const boss = m.boss;
        if (!boss) return false;

        if (m.hp <= 0) {
            if (!m.isDeadProcessed) {
                m.isDeadProcessed = true;
                MonsterAI.changeState(m, 'DIE', gameState);
                if (gameState.targetUI.monster === m) gameState.targetUI.timer = 1.5;
            }

            m.deadTimer += deltaTime;
            if (m.deadTimer >= (m.d.dieDur + m.d.corpseTime)) m.active = false;
            return true;
        }

        this.updateBossCooldowns(m, deltaTime);

        const hpRate = (parseFloat(m.hp) || 0) / Math.max(1, parseFloat(m.maxHp) || 1);
        const lateThreshold = this.getBossLatePhaseThreshold(boss.phase);
        boss.isLatePhase = hpRate <= lateThreshold;

        if (boss.isLatePhase && !boss.lateNoticeShown) {
            boss.lateNoticeShown = true;
            pushSystemNotice('⚠️ 카시야스 후반부 돌입', '#e67e22', 1.8);
        }

        if (boss.groggyTimer > 0) {
            boss.groggyTimer -= deltaTime;
            if (boss.groggyTimer < 0) boss.groggyTimer = 0;
            m.state = 'GROGGY';
            m.kbVx = 0;
            m.kbVy = 0;
            if (boss.groggyTimer <= 0) {
                boss.groggyPoseType = null;
                boss.groggyMaxTime = 0;
                m.state = 'IDLE';
                boss.noPatternWaitTimer = Math.max(boss.noPatternWaitTimer || 0, parseFloat(boss.phase && boss.phase.No_Pattern_Wait_Time) || 0.2);
            }
            return true;
        }

        if (boss.action) {
            this.updateBossPatternActionMovement(m, boss.action, deltaTime, gameState);
            this.updateBossParryCue(m, boss.action, deltaTime, gameState);

            const actionType = String(boss.action.Action_Type || '').trim().toUpperCase();
            const hitWindow = this.getBossActionHitWindow(m, boss.action);
            const hitStart = hitWindow.start;
            const hitEnd = hitWindow.end || hitStart;
            const animDur = this.getBossActionDuration(m, boss.action, gameState);

            if (!['WAIT','WARNING_PATH','WARNING','SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT','MOVE'].includes(actionType)) {
                const rawHitEnd = parseFloat(boss.action.Hitbox_End_Time);
                const effectiveHitEnd = !isNaN(rawHitEnd) && rawHitEnd > 0 ? hitEnd : animDur;
                const hitboxType = String(boss.action.Hitbox_Type || '').trim().toUpperCase();
                const isBodyCollision = hitboxType === 'HITBOX_BODY_COLLISION';
                const hitCount = Math.max(1, parseInt(boss.action.ATK_Hit_Count) || 1);
                const rawCycle = parseFloat(boss.action.ATK_Cycle);
                const hitCycle = isBodyCollision
                    ? Math.max(0.02, (!isNaN(rawCycle) && rawCycle > 0) ? rawCycle : 0.035)
                    : Math.max(0.01, (!isNaN(rawCycle) && rawCycle > 0) ? rawCycle : 0.12);
                if (m.timer >= hitStart && m.timer <= effectiveHitEnd && (boss.actionHitsDone || 0) < hitCount) {
                    boss.actionCycleTimer = (boss.actionCycleTimer || 0) + deltaTime;
                    if (boss.actionCycleTimer >= hitCycle) {
                        boss.actionCycleTimer = 0;
                        const didHit = this.fireBossPatternActionHit(m, boss.action, gameState);
                        if (isBodyCollision) {
                            // 돌진/어깨치기처럼 몸통 충돌형 판정은 실제 충돌했을 때만 히트 카운트를 소비한다.
                            // 빗나간 프레임에서 카운트가 소모되면 돌진이 지나가도 피해가 들어가지 않는 문제가 생긴다.
                            if (didHit) boss.actionHitsDone = (boss.actionHitsDone || 0) + 1;
                        } else {
                            boss.actionHitsDone = (boss.actionHitsDone || 0) + 1;
                        }
                        if (boss.actionHitsDone >= hitCount) boss.actionHitFired = true;
                    }
                }
            }

            if (m.timer >= animDur) {
                if (['SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT'].includes(actionType)) {
                    const spawnTiming = String(boss.action.Object_Spawn_Timing || 'ACTION_START').trim().toUpperCase();
                    if (spawnTiming === 'ACTION_END' && !boss.actionHitFired) {
                        this.spawnBossAttackObjectFromAction(m, boss.action, gameState);
                        boss.actionHitFired = true;
                    }
                }
                this.startNextBossPatternAction(m, gameState);
            }
            return true;
        }

        const readyPattern = this.selectReadyBossPattern(m, distX, distY, dist2D, gameState);
        if (readyPattern) {
            this.startBossPattern(m, readyPattern, gameState);
            return true;
        }

        this.updateBossDefaultAction(m, distX, distY, deltaTime, gameState);
        return true;
    },

    update: function(deltaTime, gameState) {
        this.updateBossAttackObjects(deltaTime, gameState);

        if (gameState.isAutoSpawn) {
            for (let s of gameState.spawners) {
                for(let i=s.respawnTimers.length-1; i>=0; i--) { s.respawnTimers[i] -= deltaTime; if(s.respawnTimers[i] <= 0) { s.respawnTimers.splice(i, 1); s.respawning--; s.spawnOne(); } }
                let active = s.spawnedCount - s.deadCount - s.respawning;
                if (active < s.limit && (s.maxRespawn === -1 || s.spawnedCount < s.maxRespawn) && s.respawning === 0) { s.timer += deltaTime; if (s.timer >= s.interval) { s.timer = 0; s.spawnOne(); } }
            }
        }

        for (let i = gameState.monsters.length - 1; i >= 0; i--) {
            let m = gameState.monsters[i]; if (!m.active) continue;
            const d = m.d; m.timer += deltaTime;
            const getStateKey = () => MonsterAI.resolveRuntimeState(m.state, gameState, m);
            const getPatternTypeKey = () => MonsterAI.getPatternTypeKey(m.state, gameState, m);

            const isState = (...states) => {
                const key = getPatternTypeKey();
                return states.some(s => MonsterAI.getPatternTypeKey(s, gameState, m) === key);
            };

            const isSkillState = () => !!gameState.DB_SKILL[m.state];
            const isAttackState = () => {
                const key = getPatternTypeKey();
                return key === 'ATK' || key === 'ATK_MELEE' || key === 'ATK_PROJECTILE';
            };

            if (m.skillCooldowns) {
                for (let k in m.skillCooldowns) {
                    if (m.skillCooldowns[k] > 0) m.skillCooldowns[k] -= deltaTime;
                }
            }

            if (m.hitByEnemyTimer > 0) {
                m.hitByEnemyTimer -= deltaTime;
                if (m.hitByEnemyTimer < 0) m.hitByEnemyTimer = 0;
            }

            m.vz -= gameState.GRAVITY * deltaTime; m.z += m.vz * deltaTime; if (m.z <= 0) { m.z = 0; m.vz = 0; m.isGrounded = true; }

            let distX = Math.abs(gameState.player.x - m.x) - (gameState.player.bodyX * gameState.player.scale / 2) - (d.bodyX * m.scale / 2);
            let distY = Math.abs(gameState.player.y - m.y);
            let dist2D = (gameState.player.hp > 0)
                ? getDistance2D(gameState.player.x, gameState.player.y, m.x, m.y) - (gameState.player.bodyX * gameState.player.scale / 2) - (d.bodyX * m.scale / 2)
                : 999999;
            let weightedDist2D = (gameState.player.hp > 0)
                ? this.calcWeightedRangeDistance(distX, distY, gameState)
                : 999999;

            const isAggressive = !!d.aggressive;
            const isPlayerDetectable = gameState.player.hp > 0 && gameState.player.state !== 'Freeze';
            const canEngage = isPlayerDetectable && (isAggressive || !!m.isProvoked);

            if (!isPlayerDetectable) {
                m.isProvoked = false;
            }

            const aiDistX = canEngage ? distX : 999999;
            const aiDistY = canEngage ? distY : 999999;
            const aiDist2D = canEngage ? weightedDist2D : 999999;

            if (this.isBossPatternMonster(m)) {
                this.updateBossPatternMonster(m, deltaTime, distX, distY, weightedDist2D, gameState);

                const marginX = d.bodyX * m.scale / 2;
                m.x = Math.max(marginX, Math.min(gameState.WORLD_WIDTH - marginX, m.x));
                m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
                continue;
            }

            // 비선공 몬스터는 전투가 완전히 풀리고 플레이어가 멀어지면 다시 비선공 대기 상태로 복귀
            if (
                !isAggressive &&
                m.isProvoked &&
                weightedDist2D > d.unrecog &&
                !['CHASE', 'BOUNDARY', 'ATK', 'ATK_MELEE', 'ATK_PROJECTILE'].includes(
                    MonsterAI.getPatternTypeKey(m.state, gameState, m)
                ) &&
                !gameState.DB_SKILL[m.state]
            ) {
                m.isProvoked = false;
            }

            if (m.hp <= 0 && !m.isDeadProcessed) {
                const diePriorityRule = MonsterAI.getPriorityStateRule(m, 'DIE', gameState);
                const canEnterDieState = diePriorityRule
                    ? MonsterAI.canEnterPriorityState(m, 'DIE', gameState)
                    : true;

                if (canEnterDieState) {
                    m.isDeadProcessed = true;
                    MonsterAI.changeState(m, 'DIE', gameState);
                    if (gameState.targetUI.monster === m) gameState.targetUI.timer = 1.5;
                    let gainExp = m.isChampion ? d.exp * d.championExpRate : d.exp;
                    gameState.player.exp += gainExp;
                    gameState.floatingTexts.push({
                        x: m.x,
                        y: m.y,
                        z: m.z + d.bodyZ * m.scale + 20,
                        text: `+${gainExp} EXP`,
                        color: m.isChampion ? "#e74c3c" : "#2ecc71",
                        size: "24px",
                        timer: 1.0
                    });
                    PlayerManager.checkLevelUp(gameState);
                }
            }

            if (m.hp > 0) {
                MonsterAI.checkFSM(m, aiDistX, aiDistY, aiDist2D, gameState);

                if (isAttackState() && m.timer >= m.d.atkDur) {
                    const playerAlive = gameState.player.hp > 0;
                    const outOfAttackRange = (distX > m.d.atkRange || distY > 30);

                    if (playerAlive && outOfAttackRange) {
                        m.forcePrevState = m.state;
                        MonsterAI.changeState(m, 'CHASE', gameState);
                    } else {
                        MonsterAI.changeState(m, 'IDLE', gameState);
                    }
                }
                else if (isSkillState() && m.timer >= (parseFloat(gameState.DB_SKILL[m.state].Skill_Anim_Duration) || 1.0)) {
                    MonsterAI.changeState(m, 'IDLE', gameState);
                }
            }

            let dx = gameState.player.x - m.x; let dy = gameState.player.y - m.y; let angleToPlayer = Math.atan2(dy, dx);

                        if (gameState.player.state === 'Freeze') {
                m.dirX = 0;
                m.dirY = 0;
            } else {
                const targetDx = isPlayerDetectable ? dx : 0;
                const targetDy = isPlayerDetectable ? dy : 0;
                const targetAngleToPlayer = isPlayerDetectable ? Math.atan2(targetDy, targetDx) : 0;
                const inRecog = canEngage && weightedDist2D <= d.recog;
                const isAttacking = isAttackState() || isSkillState();

                if (!isAttacking) {
                    let moveDirection = this.getPatternMoveDirectionValue(m, gameState);
                    let gazeValue = this.getPatternGazeValue(m, gameState);

                    if (isState('CHASE')) {
                        if (moveDirection === 'NONE') moveDirection = 'CHASE_ENEMY';
                        if (gazeValue === 'NONE') gazeValue = 'GAZE_LOOK_ENEMY';

                        const moveVec = this.resolvePatternMoveVector(m, moveDirection, targetDx, targetDy, gameState);
                        m.dirX = moveVec.dirX;
                        m.dirY = moveVec.dirY;
                        m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                    } else if (isState('EVADE')) {
                        if (gazeValue === 'NONE') gazeValue = 'GAZE_LOOK_ENEMY';

                        const moveVec = this.resolvePatternMoveVector(m, moveDirection, targetDx, targetDy, gameState);
                        m.dirX = moveVec.dirX;
                        m.dirY = moveVec.dirY;
                        m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                    } else if (isState('BOUNDARY')) {
                        if (gazeValue === 'NONE') gazeValue = isPlayerDetectable ? 'GAZE_LOOK_ENEMY' : 'GAZE_MOVE_DIREC';

                        if (m.timer < d.boundDur) {
                            let strafeAngle = targetAngleToPlayer + m.pacingAngle * m.pacingDir;
                            m.dirX = Math.cos(strafeAngle);
                            m.dirY = Math.sin(strafeAngle);
                        } else {
                            m.dirX = 0;
                            m.dirY = 0;
                        }

                        m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                    } else if (isState('PATROL')) {
                        if (moveDirection === 'NONE') moveDirection = 'MOVE_RANDOM';
                        if (gazeValue === 'NONE') gazeValue = 'GAZE_MOVE_DIREC';

                        if (m.timer < d.patrolDur) {
                            const moveVec = this.resolvePatternMoveVector(m, moveDirection, targetDx, targetDy, gameState);
                            m.dirX = moveVec.dirX;
                            m.dirY = moveVec.dirY;
                            m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                        } else {
                            m.dirX = 0;
                            m.dirY = 0;
                        }
                    } else if (isState('IDLE')) {
                        if (moveDirection === 'NONE') {
                            m.dirX = 0;
                            m.dirY = 0;
                        } else {
                            const moveVec = this.resolvePatternMoveVector(m, moveDirection, targetDx, targetDy, gameState);
                            m.dirX = moveVec.dirX;
                            m.dirY = moveVec.dirY;
                        }

                        if (inRecog) {
                            if (gazeValue === 'NONE') gazeValue = 'GAZE_LOOK_ENEMY';
                            m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                        } else if (!isPlayerDetectable && gazeValue === 'GAZE_MOVE_DIREC') {
                            m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                        }
                    } else if (isState('HIT')) {
                        if (gazeValue === 'GAZE_HIT_DIREC') {
                            m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                        }
                    }
                }
            }
            
            if (isState('DIE')) {
                m.deadTimer += deltaTime; 
                if (m.deadTimer >= (d.dieDur + d.corpseTime)) { 
                    m.active = false; if (m.spawner) { m.spawner.deadCount++; if (m.spawner.respawnTime > 0) { m.spawner.respawning++; m.spawner.respawnTimers.push(m.spawner.respawnTime); } }
                }
            } else if (!isSkillState()) {
                switch (getPatternTypeKey()) {
                    case 'PATROL':
                        m.x += m.dirX * d.speed * d.patrolSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.patrolSpd * 0.7 * deltaTime;
                        break;

                    case 'BOUNDARY':
                        m.x += m.dirX * d.speed * d.boundSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.boundSpd * 0.7 * deltaTime;
                        break;

                    case 'CHASE':
                        m.x += m.dirX * d.speed * d.chaseSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.chaseSpd * 0.7 * deltaTime;
                        break;

                    case 'EVADE':
                        m.x += m.dirX * d.speed * d.evadeSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.evadeSpd * 0.7 * deltaTime;
                        break;

                    case 'ATK_PROJECTILE':
                        if (m.timer >= d.hitStart && !m.hasFired) {
                            const playerAlive = gameState.player.hp > 0;
                            const px = gameState.player.x;
                            const py = gameState.player.y;

                            const currentDistX =
                                Math.abs(px - m.x) -
                                (gameState.player.bodyX * gameState.player.scale / 2) -
                                (d.bodyX * m.scale / 2);

                            const currentDistY = Math.abs(py - m.y);

                            const allowedX = Math.max((parseFloat(d.atkRange) || 0) * 1.15, (parseFloat(d.atkRange) || 0) + 20);
                            const allowedY = Math.max(50, ((parseFloat(d.hitY) || 30) * m.scale) + 20);

                            if (!playerAlive || currentDistX > allowedX || currentDistY > allowedY) {
                                m.forcePrevState = m.state;
                                MonsterAI.changeState(m, 'CHASE', gameState);
                                break;
                            }

                            m.faceDir = px >= m.x ? 1 : -1;
                            m.hasFired = true;

                            let atkDmg = m.isChampion ? d.atk * d.championAtkRate : d.atk;
                            let projectileRenderType = this.resolveProjectileRenderType(d.atkProjectileRenderType);

                            gameState.projectiles.push({
                                isPlayer: false,
                                x: m.x,
                                y: m.y,
                                z: m.z + (d.bodyZ * m.scale) / 2,
                                vx: m.faceDir * d.projSpeed,
                                vy: 0,
                                vz: 0,
                                life: d.projLife,
                                atk: atkDmg * d.atkDmgRate,
                                hitX: d.hitX * m.scale,
                                hitY: d.hitY * m.scale,
                                hitZ: d.hitZ * m.scale,
                                penetrate: String(d.projPenetrate).toLowerCase() === 'true',
                                hasHit: false,
                                projName: '',
                                renderType: projectileRenderType,
                                hitTargets: new Set(),
                                statusType: null,
                                statusDur: 0,
                                statusProb: 0,
                                attackerLevel: m.d.level
                            });
                        }
                        break;

                    case 'ATK':
                    case 'ATK_MELEE':
                        if (m.timer >= m.nextHitTime && m.timer <= d.hitEnd) {
                            let atkW = d.hitX * m.scale; let atkD = d.hitY * m.scale; let atkH = d.hitZ * m.scale;
                            let atkX = m.x + (m.faceDir === 1 ? atkW/2 : -atkW/2); let atkY = m.y; let atkZ = m.z;
                            gameState.hitboxes.push({ x: atkX, y: atkY, z: atkZ, w: atkW, d: atkD, h: atkH, life: 0.1 });

                            this.pushMonsterAtkEffect(m, atkX, atkY, atkZ, atkW, atkH, gameState);
                            
                            let p = gameState.player; let pW = p.bodyX * p.scale; let pD = p.bodyY * p.scale; let pH = p.bodyZ * p.scale;
                            if (checkAABB3D(atkX, atkY, atkZ, atkW, atkD, atkH, p.x, p.y, p.z, pW, pD, pH)) {
                                let atkDmg = m.isChampion ? d.atk * d.championAtkRate : d.atk;
                                PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, atkDmg * d.atkDmgRate), m.x, m.y, null, 0, 0); 
                                if (d.atkCycle > 0) m.nextHitTime += d.atkCycle; else m.nextHitTime = 999; 
                            }
                        }
                        break;

                    case 'HIT':
                        m.x += (m.kbVx||0) * deltaTime;
                        m.y += (m.kbVy||0) * deltaTime;
                        break; 
                }
                const marginX = d.bodyX * m.scale / 2;
                if (m.x <= marginX || m.x >= gameState.WORLD_WIDTH - marginX) { m.dirX *= -1; m.kbVx *= -1; m.faceDir = m.dirX > 0 ? 1 : -1;}
                m.x = Math.max(marginX, Math.min(gameState.WORLD_WIDTH - marginX, m.x)); m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
            }
        }
    }
};