// [카시야스 보스전] 몬스터/보스 데이터 초기화 시스템 (monster_data_system.js)
// - Boss_info/Monster_info 원본 데이터를 런타임 DB로 변환합니다.
// - 기존 일반 몬스터 패턴/스킬 데이터 호환 초기화도 이 파일에서 담당합니다.

// [카시야스 보스전] 몬스터/보스 런타임 시스템 임시 통합 파일 (monster_runtime_system.js)
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

const MonsterDataSystem = {
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
                    ['BOSS_PATTERN', 'BOSS_PATTERN_BASIC'].includes(String(m.AI_Type || '').toUpperCase()),

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
                bossConfig: {
                    Monster_ID: monsterKey,
                    Phase_Order: m.Phase_Order,
                    Phase_Name: m.Phase_Name,
                    Chase_Stop_Distance: m.Chase_Stop_Distance,
                    No_Pattern_Wait_Time: m.No_Pattern_Wait_Time,
                    Late_Phase_HP_Rate: m.Late_Phase_HP_Rate,
                    Next_Boss_ID: m.Next_Boss_ID,
                    Phase_Transition_Type: m.Phase_Transition_Type
                },
                patrolSpd: parseFloat(m.Patrol_Move_Speed_Rate) || 1.0,
                boundSpd: parseFloat(m.Boundary_Move_Speed_Rate) || 1,
                boundDist: parseFloat(m.Boundary_Move_Distance) || 50,
                chaseSpd: parseFloat(m.Chase_Move_Speed_Rate) || 1,
                evadeSpd: parseFloat(m.Evade_Move_Speed_Rate) || 1.2,

                atkType: MonsterDataAdapter.normalizeAtkType(m.ATK_Type || 'ATK_MELEE'),
                atkRange: parseFloat(m.ATK_Range) || 0,
                atkDmgRate: parseFloat(m.ATK_DMG_Rate) || 1,
                atkCycle: parseFloat(m.ATK_Cycle) || 0,
                defaultHitDmgRate: Number.isFinite(parseFloat(m.Default_Hit_DMG_Rate)) && parseFloat(m.Default_Hit_DMG_Rate) >= 0
                    ? parseFloat(m.Default_Hit_DMG_Rate)
                    : 1,
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
};
