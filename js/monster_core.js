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
        if (v === 'DEF_SUPERARMOR') return 'SuperArmor';
        if (v === 'DEF_NORMAL') return 'Normal';
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
            if(!m.Monster_ID) return; gameState.MONSTER_KEYS.push(m.Monster_ID);
            gameState.DB_MONSTER[m.Monster_ID] = {
                id: m.Monster_ID, name: m.Monster_Name || 'Unknown', level: parseInt(m.Level) || 1, exp: parseInt(m.Provision_EXP) || 10, hp: parseFloat(m.HP)||1, maxHp: parseFloat(m.HP)||1, atk: parseFloat(m.ATK)||0, def: parseFloat(m.DEF)||0, speed: parseFloat(m.Move_Speed)||0, aggressive: m.Aggressive,
                recog: parseFloat(m.Recog_Range)||0, unrecog: parseFloat(m.UnRecog_Range)||0, chase: parseFloat(m.Chase_Range)||0, evade: parseFloat(m.Evade_Range) || 0,
                cx: m.Spawn_Center_X !== "" && m.Spawn_Center_X != null ? parseFloat(m.Spawn_Center_X) : "", rx: parseFloat(m.Spawn_Range_X)||0, cy: m.Spawn_Center_Y !== "" && m.Spawn_Center_Y != null ? parseFloat(m.Spawn_Center_Y) : gameState.WORLD_DEPTH/2, ry: parseFloat(m.Spawn_Range_Y)||50,
                spawnLimit: parseInt(m.Monster_Spawn_Limit) || 1, spawnInterval: parseFloat(m.Normal_Spawn_Time) || 1.0, respawnTime: m.Respawn_Time !== "" && m.Respawn_Time != null ? parseFloat(m.Respawn_Time) : -1, maxRespawn: m.Max_ReSpawn_Count !== "" && m.Max_ReSpawn_Count != null ? parseInt(m.Max_ReSpawn_Count) : -1,  
                spawnReqLv: parseInt(m.Spawn_Req_Level) || 1, championProb: parseFloat(m.Champion_Spawn_Prob) || 0, championAtkRate: parseFloat(m.Champion_ATK_Rate) || 1, championHpRate: parseFloat(m.Champion_HP_Rate) || 1, championScaleRate: parseFloat(m.Champion_Scale_Rate) || 1, championExpRate: parseFloat(m.Champion_EXP_Rate) || 1,
                aiType: m.AI_Type || '', patrolSpd: parseFloat(m.Patrol_Move_Speed_Rate) || 1.0, boundSpd: parseFloat(m.Boundary_Move_Speed_Rate)||1, boundDist: parseFloat(m.Boundary_Move_Distance)||50, chaseSpd: parseFloat(m.Chase_Move_Speed_Rate)||1, evadeSpd: parseFloat(m.Evade_Move_Speed_Rate) || 1.2, 
                atkType: MonsterDataAdapter.normalizeAtkType(m.ATK_Type || ''), atkRange: parseFloat(m.ATK_Range)||0, atkDmgRate: parseFloat(m.ATK_DMG_Rate)||1, atkCycle: parseFloat(m.ATK_Cycle)||0, defType: MonsterDataAdapter.normalizeDefType(m.ATK_Defence_Type || ''),
                hitX: parseFloat(m.Hitbox_Size_X) || 50, hitY: parseFloat(m.Hitbox_Size_Y) || 30, hitZ: parseFloat(m.Hitbox_Size_Z) || 60, hitStart: parseFloat(m.Hitbox_Start_Time)||0, hitEnd: parseFloat(m.Hitbox_End_Time)||0.1, 
                bodyX: parseFloat(m.Body_Size_X)||40, bodyY: parseFloat(m.Body_Size_Y)||30, bodyZ: parseFloat(m.Body_Size_Z)||80, scale: parseFloat(m.Model_Scale)||1, renderType: m.Model_Render_Type || null,
                renderColor: m.Model_Render_Color || null,
                weaponRenderType: m.Weapon_Render_Type || null,
                weaponRenderColor: m.Weapon_Render_Color || null,
                atkEffectRenderType: m.ATK_Effect_Render_Type || null,
                atkProjectileRenderType: m.ATK_Projectile_Render_Type || null, knockback: parseFloat(m.Hit_Knockback_Distance)||0,
                projName: m.ATK_Projectile_Name || '', projSpeed: parseFloat(m.ATK_Projectile_Speed)||0, projLife: parseFloat(m.ATK_Projectile_Duration)||0, projPenetrate: m.ATK_Projectile_Penetration, color: colors[m.Monster_ID] || '#ffffff', grade: m.Monster_Grade || '',
                corpseTime: parseFloat(m.Corpse_Keep_Time) || 1.0, 
                idleDur: (parseFloat(m.Idle_Anim_Duration)||1) / (parseFloat(m.Idle_Anim_Speed)||1), 
                patrolDur: (parseFloat(m.Patrol_Anim_Duration)||1) / (parseFloat(m.Patrol_Anim_Speed)||1), 
                patrolStandby: parseFloat(m.Partrol_Standby_Time) || parseFloat(m.Patrol_Standby_Time) || 0,
                boundDur: (parseFloat(m.Boundary_Anim_Duration)||1) / (parseFloat(m.Boundary_Anim_Speed)||1),
                boundStandby: parseFloat(m.Boundary_Standby_Time) || 0,
                atkDur: (parseFloat(m.ATK_Anim_Duration)||1) / (parseFloat(m.ATK_Anim_Speed)||1), hitDur: (parseFloat(m.Hit_Anim_Duration)||0.2) / (parseFloat(m.Hit_Anim_Speed)||1), dieDur: (parseFloat(m.Die_Anim_Duration)||1) / (parseFloat(m.Die_Anim_Speed)||1),
                evadeDur: (parseFloat(m.Evade_Anim_Duration)||1) / (parseFloat(m.Evade_Anim_Speed)||1)
            };
        });
        (patternData||[]).forEach(p => { if(!p.AI_Name) return; if(!gameState.DB_PATTERN[p.AI_Name]) gameState.DB_PATTERN[p.AI_Name] = {}; gameState.DB_PATTERN[p.AI_Name][p.Pattern_Name] = p; });
        (skillData||[]).forEach(s => {
            const skillKey = s.Skill_Code || s.Skill_Name;
            if(!skillKey) return;
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
            gameState.DB_SKILL[skillKey] = normalizedSkill;
            if (s.Skill_Name) gameState.DB_SKILL[s.Skill_Name] = normalizedSkill;
        });
    },

    resolveEffectTypeFromEnum: function(effectEnum, fallbackType = '') {
    const v = String(effectEnum || '').trim();

    const map = {
        EFT_SLASH: 'slash',
        EFT_LIGHTNING_SLASH: 'slash',
        EFT_THUNDERBOLT_SLASH: 'slash',

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

    resolveProjectileRenderType: function(projectileEnum, projectileName) {
        const v = String(projectileEnum || '').trim();
        if (v) return v;

        const n = String(projectileName || '').trim();
        if (n.includes('웨이브')) return 'PROJECTILE_SLASH_WAVE';
        if (n.includes('캐논볼')) return 'PROJECTILE_ENERGY_BOMB';
        if (n.includes('탄환')) return 'PROJECTILE_BULLET';
        if (n.includes('화살')) return 'PROJECTILE_ARROW';
        if (n.includes('돌멩이')) return 'PROJECTILE_STONE';
        if (n.includes('얼음화살')) return 'PROJECTILE_ICE_BOLT';
        return '';
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

        gameState.spawners = []; if (d.grade === 'Boss') { this.spawnInstant(id, gameState); return; }
        
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

                gameState.monsters.push({ id: this.id, d: this.d, active: true, spawner: this, isChampion: isChamp, scale: mScale, x: cx + (Math.random() * 2 - 1) * rx, y: cy + (Math.random() * 2 - 1) * ry, z: 300, vz: 0, isGrounded: false, hp: mMaxHp, maxHp: mMaxHp, state: 'P_Spawn', prevState: 'NONE', forcePrevState: null, timer: 0, deadTimer: 0, dirX: 0, dirY: 0, faceDir: 1, pacingDir: 1, pacingAngle: 0, nextHitTime: 0, kbVx: 0, kbVy: 0, hasFired: false, isDeadProcessed: false, skillCooldowns: initCd, patternCount: 0 });
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

        gameState.monsters.push({ id: id, d: d, active: true, spawner: null, isChampion: isChamp, scale: mScale, x: cx + (Math.random() * 2 - 1) * rx, y: cy + (Math.random() * 2 - 1) * ry, z: 300, vz: 0, isGrounded: false, hp: mMaxHp, maxHp: mMaxHp, state: 'P_Spawn', prevState: 'NONE', forcePrevState: null, timer: 0, deadTimer: 0, dirX: 0, dirY: 0, faceDir: 1, pacingDir: 1, pacingAngle: 0, nextHitTime: 0, kbVx: 0, kbVy: 0, hasFired: false, isDeadProcessed: false, skillCooldowns: initCd, patternCount: 0 });
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

        if (m.hp > 0) {
            let isSuperArmor = (m.state === 'P_Melee_ATK' || m.state === 'P_Range_ATK' || gameState.DB_SKILL[m.state]) && String(m.d.defType).toLowerCase() === 'superarmor';
            if (!isSuperArmor) { 
                MonsterAI.changeState(m, 'P_Hit', gameState);
                let angle = Math.atan2(m.y - gameState.player.y, m.x - gameState.player.x); let kb = m.d.knockback / m.d.hitDur; m.kbVx = Math.cos(angle) * kb; m.kbVy = Math.sin(angle) * kb;
            }
        }
    },

    update: function(deltaTime, gameState) {
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
            if (m.skillCooldowns) { for (let k in m.skillCooldowns) { if (m.skillCooldowns[k] > 0) m.skillCooldowns[k] -= deltaTime; } }

            m.vz -= gameState.GRAVITY * deltaTime; m.z += m.vz * deltaTime; if (m.z <= 0) { m.z = 0; m.vz = 0; m.isGrounded = true; }

            let distX = Math.abs(gameState.player.x - m.x) - (gameState.player.bodyX*gameState.player.scale/2) - (d.bodyX*m.scale/2);
            let distY = Math.abs(gameState.player.y - m.y);
            let dist2D = (gameState.player.hp > 0) ? getDistance2D(gameState.player.x, gameState.player.y, m.x, m.y) - (gameState.player.bodyX*gameState.player.scale/2) - (d.bodyX*m.scale/2) : 999999;

            if (m.hp <= 0 && !m.isDeadProcessed) {
                m.isDeadProcessed = true; m.state = 'P_Die'; m.timer = 0;
                if (gameState.targetUI.monster === m) gameState.targetUI.timer = 1.5; 
                let gainExp = m.isChampion ? d.exp * d.championExpRate : d.exp; gameState.player.exp += gainExp; 
                gameState.floatingTexts.push({x: m.x, y: m.y, z: m.z + d.bodyZ*m.scale + 20, text: `+${gainExp} EXP`, color: m.isChampion ? "#e74c3c" : "#2ecc71", size: "24px", timer: 1.0}); 
                PlayerManager.checkLevelUp(gameState);
            }

            if (m.hp > 0) {
                if (gameState.player.hp <= 0 && ['P_Chase', 'P_Melee_ATK', 'P_Range_ATK', 'P_Boundary'].includes(m.state)) { MonsterAI.changeState(m, 'P_Patrol', gameState); } 
                else { 
                    MonsterAI.checkFSM(m, distX, distY, dist2D, gameState);

                    if ((m.state === 'P_Melee_ATK' || m.state === 'P_Range_ATK') && m.timer >= m.d.atkDur) {
                        const playerAlive = gameState.player.hp > 0;
                        const outOfAttackRange = (distX > m.d.atkRange || distY > 30);

                        if (playerAlive && outOfAttackRange) {
                            m.forcePrevState = m.state;
                            MonsterAI.changeState(m, 'P_Chase', gameState);
                        } else {
                            MonsterAI.changeState(m, 'P_Idle', gameState);
                        }
                    }
                    else if (gameState.DB_SKILL[m.state] && m.timer >= (parseFloat(gameState.DB_SKILL[m.state].Skill_Anim_Duration) || 1.0)) {
                        MonsterAI.changeState(m, 'P_Idle', gameState);
                    }
                }
            }

            let dx = gameState.player.x - m.x; let dy = gameState.player.y - m.y; let angleToPlayer = Math.atan2(dy, dx);

            if (gameState.player.hp > 0 && gameState.player.state !== 'Freeze') {
                const inRecog = dist2D <= d.recog;
                const isAttacking = m.state === 'P_Melee_ATK' || m.state === 'P_Range_ATK' || gameState.DB_SKILL[m.state];
                
                if (!isAttacking) {
                    if (m.state === 'P_Chase') {
                        let moveX = 0; let moveY = 0;
                        if (Math.abs(dy) > 20) { moveY = Math.sign(dy); } if (Math.abs(dx) > d.atkRange * 0.5) { moveX = Math.sign(dx); } 
                        let len = Math.sqrt(moveX*moveX + moveY*moveY); if (len > 0) { m.dirX = moveX/len; m.dirY = moveY/len; }
                        m.faceDir = dx > 0 ? 1 : -1; 
                    } else if (m.state === 'P_Evade') {
                        m.dirX = -Math.cos(angleToPlayer); m.dirY = -Math.sin(angleToPlayer);
                        m.faceDir = dx > 0 ? 1 : -1;
                    } else if (m.state === 'P_Boundary') {
                        m.faceDir = dx > 0 ? 1 : -1; 
                        if (m.timer < d.boundDur) {
                            let strafeAngle = angleToPlayer + m.pacingAngle * m.pacingDir;
                            m.dirX = Math.cos(strafeAngle); m.dirY = Math.sin(strafeAngle);
                        } else {
                            m.dirX = 0; m.dirY = 0; 
                        }
                    } else if (m.state === 'P_Patrol') {
                        if (m.timer < d.patrolDur) {
                            m.faceDir = m.dirX > 0 ? 1 : -1; 
                        } else {
                            m.dirX = 0; m.dirY = 0; 
                        }
                    } else if (m.state === 'P_Idle' && inRecog) {
                        m.faceDir = dx > 0 ? 1 : -1; 
                    }
                }
            } else if (gameState.player.state === 'Freeze') { m.dirX = 0; m.dirY = 0; } 

            if (m.state === 'P_Die') {
                m.deadTimer += deltaTime; 
                if (m.deadTimer >= (d.dieDur + d.corpseTime)) { 
                    m.active = false; if (m.spawner) { m.spawner.deadCount++; if (m.spawner.respawnTime > 0) { m.spawner.respawning++; m.spawner.respawnTimers.push(m.spawner.respawnTime); } }
                }
            } else if (!gameState.DB_SKILL[m.state]) {
                switch(m.state) {
                    case 'P_Patrol':
                        m.x += m.dirX * d.speed * d.patrolSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.patrolSpd * 0.7 * deltaTime;
                        break;

                    case 'P_Boundary':
                        m.x += m.dirX * d.speed * d.boundSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.boundSpd * 0.7 * deltaTime;
                        break;

                    case 'P_Chase':
                        m.x += m.dirX * d.speed * d.chaseSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.chaseSpd * 0.7 * deltaTime;
                        break;

                    case 'P_Evade':
                        m.x += m.dirX * d.speed * d.evadeSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.evadeSpd * 0.7 * deltaTime;
                        break;

                    case 'P_Range_ATK':
                        if (m.timer >= d.hitStart && !m.hasFired) {
                            m.hasFired = true;
                            let atkDmg = m.isChampion ? d.atk * d.championAtkRate : d.atk;
                            let projectileRenderType = this.resolveProjectileRenderType(d.atkProjectileRenderType, d.projName);

                            gameState.projectiles.push({
                                isPlayer: false,
                                x: m.x,
                                y: m.y,
                                z: m.z + (d.bodyZ*m.scale)/2,
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
                                projName: d.projName,
                                renderType: projectileRenderType,
                                hitTargets: new Set(),
                                statusType: null,
                                statusDur: 0,
                                statusProb: 0,
                                attackerLevel: m.d.level
                            });
                        }
                        break;

                    case 'P_Melee_ATK':
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

                    case 'P_Hit':
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