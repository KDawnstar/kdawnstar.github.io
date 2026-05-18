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
                weaponRenderType: m.Weapon_Render_Type || (String(m.AI_Type || '').toUpperCase() === 'BOSS_PATTERN' ? 'WEAPON_SMALL_CURVED_SWORD' : null),
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

    takeDamage: function(m, baseDmg, gameState) {
        let scaledDmg = calcScaledDamage(gameState.player.level, m.d.level, baseDmg);
        let finalDmg = Math.max(1, scaledDmg - m.d.def); 
        m.hp -= finalDmg;
        
        gameState.floatingTexts.push({x: m.x, y: m.y, z: m.z + (m.d.bodyZ * m.scale) + 20, text: `${finalDmg.toFixed(0)}`, color: "#fff", size: "36px", timer: 1.0});
        gameState.effects.push({ type: 'hitSpark', renderType: 'EFT_HIT', x: m.x, y: m.y, z: m.z + m.d.bodyZ*m.scale/2, life: 0.15, maxLife: 0.15 });

        if (m.d.level > gameState.player.level && gameState.player.bubbleCooldown <= 0) {
            gameState.floatingTexts.push({x: gameState.player.x, y: gameState.player.y, z: gameState.player.z + gameState.player.bodyZ*gameState.player.scale + 40, text: "강하다...", color: "#000", size: "14px", timer: 1.0, isBubble: true});
            gameState.player.bubbleCooldown = 2.0; 
        }
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
        const moveType = String(action.Action_Move_Type || '').trim().toUpperCase();

        if (moveType === 'RUSH') {
            const path = m && m.boss ? (m.boss.currentDashPath || m.boss.previewDashPath || m.boss.lastDashPath) : null;
            const speed = this.getBossActionMoveSpeed(m, action, m ? m.boss : null);
            const pathLength = this.getPathLength(path);

            if (speed > 0 && pathLength > 0) {
                return Math.max(0.05, pathLength / speed);
            }
        }

        const duration = parseFloat(action.Action_Anim_Duration);
        if (!isNaN(duration)) return Math.max(0.001, duration);
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
        if (!boss || boss.activePattern || boss.noPatternWaitTimer > 0) return null;

        const phase = boss.phase || {};

        const patterns = gameState.DB_BOSS_PATTERN_BY_SET && gameState.DB_BOSS_PATTERN_BY_SET[boss.patternSetId]
            ? gameState.DB_BOSS_PATTERN_BY_SET[boss.patternSetId]
            : [];

        const ready = patterns.filter(pattern => {
            const patternId = String(pattern.Pattern_ID || '').trim();
            if (!patternId) return false;
            if (!pattern.Runtime_Actions || pattern.Runtime_Actions.length <= 0) return false;
            if ((boss.patternCooldowns[patternId] || 0) > 0) return false;

            const useRangeX = this.getBossPatternUseRangeX(pattern, phase);
            const useRangeY = this.getBossPatternUseRangeY(pattern, phase);
            if (distX > useRangeX || distY > useRangeY) return false;

            return this.isBossPatternConditionMet(pattern, boss);
        });

        if (ready.length <= 0) return null;

        const maxPriority = Math.max(...ready.map(p => parseFloat(p.Pattern_Priority) || 0));
        const priorityGroup = ready.filter(p => (parseFloat(p.Pattern_Priority) || 0) === maxPriority);

        let totalWeight = 0;
        const weighted = priorityGroup.map(pattern => {
            const weight = Math.max(1, parseFloat(pattern.Random_Weight) || 1);
            totalWeight += weight;
            return { pattern, weight };
        });

        let r = Math.random() * totalWeight;
        for (const item of weighted) {
            if (r < item.weight) return item.pattern;
            r -= item.weight;
        }

        return priorityGroup[0];
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

        this.startNextBossPatternAction(m, gameState);
    },

    finishBossPattern: function(m, gameState) {
        const boss = m.boss;
        if (!boss) return;

        const pattern = boss.activePattern;
        if (pattern) {
            const patternId = String(pattern.Pattern_ID || '').trim();
            boss.patternCooldowns[patternId] = parseFloat(pattern.Pattern_Cooldown) || 1;
        }

        boss.activePattern = null;
        boss.currentActionIndex = -1;
        boss.currentLoopIndex = 0;
        boss.loopCount = 1;
        boss.action = null;
        boss.actionHitFired = false;
        boss.previewDashPath = null;
        boss.currentDashPath = null;
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
                continue;
            }

            boss.action = action;
            boss.actionHitFired = false;

            const actionType = String(action.Action_Type || '').trim().toUpperCase();
            if (actionType === 'WAIT' || actionType === 'WARNING_PATH') m.state = 'IDLE';
            else m.state = 'ATK_MELEE';

            m.timer = 0;
            m.hasFired = false;
            m.faceDir = gameState.player.x >= m.x ? 1 : -1;
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

    pushPathSlashEffects: function(path, width, height, renderType, gameState) {
        if (!path) return;
        const length = this.getPathLength(path);
        if (length <= 0) return;

        const effectType = String(renderType || '').trim().toUpperCase();
        const pathAngle = Math.atan2(path.endY - path.startY, path.endX - path.startX);

        if (effectType === 'EFT_MANY_SLASH_BURST') {
            const count = Math.max(10, Math.min(24, Math.round(length / 65)));
            for (let i = 0; i < count; i++) {
                const t = (i + 0.35 + Math.random() * 0.30) / count;
                const side = (Math.random() * 2 - 1) * (width * 0.42);
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
                    w: Math.max(42, width * (0.85 + Math.random() * 0.55)),
                    h: Math.max(28, height * (0.34 + Math.random() * 0.26)),
                    life: 0.18 + Math.random() * 0.10,
                    maxLife: 0.26,
                    color: 'rgba(245, 248, 255, 0.95)',
                    accentColor: 'rgba(120, 190, 255, 0.74)',
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

    onBossPatternActionStart: function(m, action, gameState) {
        const boss = m.boss;
        const type = String(action.Action_Type || '').trim().toUpperCase();

        if (type === 'WARNING_PATH') {
            boss.previewDashPath = this.computeDashPathToMapEdge(m, gameState);
            const width = parseFloat(action.Hitbox_Size_Y) || 110;
            const duration = Math.max(0.05, parseFloat(action.Action_Anim_Duration) || 0.3);
            this.pushPathWarningEffect(boss.previewDashPath, width, duration, action.VFX_Type || 'EFT_WARNING_RUSH_PATH', gameState);
            boss.actionHitFired = true;
            return;
        }

        if (type === 'SPAWN_ATTACK_OBJECT') {
            this.spawnBossAttackObjectFromAction(m, action, gameState);
            boss.actionHitFired = true;
            return;
        }

        const moveType = String(action.Action_Move_Type || '').trim().toUpperCase();
        if (moveType === 'RUSH') {
            boss.currentDashPath = boss.previewDashPath || this.computeDashPathToMapEdge(m, gameState);
            boss.lastDashPath = boss.currentDashPath;
            boss.previewDashPath = null;
        }
    },

    pushBossPatternActionEffect: function(m, action, atkX, atkY, atkZ, atkW, atkH, gameState) {
        const effEnum = String(action.VFX_Type || 'EFT_SLASH').trim();
        const effectScale = Math.max(1, parseFloat(m.scale) || 1);

        let slashColor = 'rgba(235, 235, 255, 0.92)';
        if (effEnum === 'EFT_KASIYAS_SLASH_02') slashColor = 'rgba(215, 220, 255, 0.94)';
        if (effEnum === 'EFT_KASIYAS_SLASH_03') slashColor = 'rgba(255, 245, 210, 0.95)';
        if (effEnum === 'EFT_KASIYAS_SLASH_04') slashColor = 'rgba(255, 205, 120, 0.98)';
        if (effEnum === 'EFT_KASIYAS_RUSH_SLASH') slashColor = 'rgba(255, 235, 210, 0.98)';

        gameState.effects.push({
            type: 'slash',
            renderType: effEnum,
            x: atkX,
            y: atkY,
            z: atkZ + atkH / 2,
            dir: m.faceDir,
            w: atkW,
            h: atkH,
            life: 0.22,
            maxLife: 0.22,
            color: slashColor,
            effectScale: effectScale
        });
    },

    buildGuardInfoFromAttackData: function(data) {
        if (!data) return null;
        return {
            canGuard: data.ATK_Can_Guard === true || String(data.ATK_Can_Guard || '').trim().toLowerCase() === 'true',
            guardResult: data.Guard_Result_Type || '',
            attackType: data.Attack_Type || data.Object_Type || ''
        };
    },

    fireBossPatternActionHit: function(m, action, gameState) {
        const actionType = String(action.Action_Type || '').trim().toUpperCase();
        if (actionType === 'WARNING_PATH' || actionType === 'WAIT' || actionType === 'SPAWN_ATTACK_OBJECT') return;

        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        const dmgRate = parseFloat(action.ATK_Damage_Rate) || 1;
        const baseDmg = m.d.atk * dmgRate;
        const p = gameState.player;

        if (hitboxType === 'HITBOX_PATH_BOX') {
            const path = this.resolveBossPathForAction(m, action, gameState, 'current') || m.boss.lastDashPath;
            const width = (parseFloat(action.Hitbox_Size_Y) || 90) * (m.scale || 1);
            const height = (parseFloat(action.Hitbox_Size_Z) || 120) * (m.scale || 1);
            this.pushDebugPathHitbox(path, width, height, 0.15, gameState);
            this.pushPathSlashEffects(path, width, height, action.VFX_Type || 'EFT_KASIYAS_RUSH_SLASH', gameState);
            if (this.isPlayerInsidePathHitbox(path, width, height, gameState)) {
                PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), m.x, m.y, null, 0, 0, this.buildGuardInfoFromAttackData(action));
            }
            return;
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

        gameState.hitboxes.push({ x: atkX, y: atkY, z: atkZ, w: atkW, d: atkD, h: atkH, life: 0.1 });
        this.pushBossPatternActionEffect(m, action, atkX, atkY, atkZ, atkW, atkH, gameState);

        const pW = p.bodyX * p.scale;
        const pD = p.bodyY * p.scale;
        const pH = p.bodyZ * p.scale;

        if (checkAABB3D(atkX, atkY, atkZ, atkW, atkD, atkH, p.x, p.y, p.z, pW, pD, pH)) {
            PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), atkX, atkY, null, 0, 0, this.buildGuardInfoFromAttackData(action));
        }
    },

    updateBossPatternActionMovement: function(m, action, deltaTime, gameState) {
        const moveType = String(action.Action_Move_Type || '').trim().toUpperCase();
        if (moveType !== 'WALK' && moveType !== 'RUSH') return;

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
        m.y += dirY * speed * 0.7 * deltaTime;
    },

    spawnBossAttackObjectFromAction: function(m, action, gameState) {
        const objectId = String(action.Spawn_Object_ID || '').trim();
        if (!objectId) return;

        const objData = gameState.DB_BOSS_PATTERN_OBJECT ? gameState.DB_BOSS_PATTERN_OBJECT[objectId] : null;
        if (!objData) {
            console.warn('Boss_Pattern_Object_info에서 오브젝트를 찾을 수 없음:', objectId);
            return;
        }

        const path = m.boss && m.boss.lastDashPath ? { ...m.boss.lastDashPath } : null;
        if (!path) return;

        const warningDuration = Math.max(0, parseFloat(objData.Warning_Duration) || 0);
        const width = parseFloat(objData.Hitbox_Size_Y) || 120;
        const height = parseFloat(objData.Hitbox_Size_Z) || 120;
        const hitDuration = Math.max(0.05, parseFloat(objData.Hitbox_Duration) || 0.2);

        if (!gameState.bossAttackObjects) gameState.bossAttackObjects = [];
        gameState.bossAttackObjects.push({
            owner: m,
            data: objData,
            path: path,
            timer: 0,
            warningDuration: warningDuration,
            hitDuration: hitDuration,
            width: width,
            height: height,
            hitsDone: 0,
            cycleTimer: 999,
            effectFired: false,
            active: true
        });

        this.pushPathWarningEffect(path, width, Math.max(0.05, warningDuration), objData.Warning_Render_Type || 'WARNING_SLASH_PATH', gameState);
    },

    updateBossAttackObjects: function(deltaTime, gameState) {
        const objects = gameState.bossAttackObjects || [];
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (!obj || !obj.active) { objects.splice(i, 1); continue; }

            obj.timer += deltaTime;
            const data = obj.data || {};
            const hitCount = Math.max(1, parseInt(data.ATK_Hit_Count) || 1);
            const cycle = Math.max(0.01, parseFloat(data.ATK_Cycle) || 0.1);
            const hitStart = obj.warningDuration;
            const hitEnd = obj.warningDuration + obj.hitDuration;

            if (obj.timer >= hitStart && !obj.effectFired) {
                obj.effectFired = true;
                this.pushPathSlashEffects(obj.path, obj.width, obj.height, data.Effect_Render_Type || 'EFT_MANY_SLASH_BURST', gameState);
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

        if (boss.action) {
            this.updateBossPatternActionMovement(m, boss.action, deltaTime, gameState);

            const actionType = String(boss.action.Action_Type || '').trim().toUpperCase();
            const hitStart = parseFloat(boss.action.Hitbox_Start_Time) || 0;
            const hitEnd = parseFloat(boss.action.Hitbox_End_Time) || hitStart;
            const animDur = this.getBossActionDuration(m, boss.action, gameState);

            if (actionType !== 'WAIT' && actionType !== 'WARNING_PATH' && actionType !== 'SPAWN_ATTACK_OBJECT') {
                if (!boss.actionHitFired && m.timer >= hitStart && m.timer <= hitEnd) {
                    boss.actionHitFired = true;
                    this.fireBossPatternActionHit(m, boss.action, gameState);
                }
            }

            if (m.timer >= animDur) this.startNextBossPatternAction(m, gameState);
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