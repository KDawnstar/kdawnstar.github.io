// ==========================================
// [모험의 시작] 몬스터 스킬 로직 분리 모듈 (monster_skill.js)
// ==========================================

const MonsterSkill = {
    resolveWarningEffectType: function(effectEnum, fallbackType = 'warning') {
        const v = String(effectEnum || '').trim();

        const map = {
            WARNING_MAGIC_CIRCLE: 'warning',
            WARNING_RED_AREA: 'warning'
        };

        return map[v] || fallbackType;
    },

    resolveSkillEffectType: function(effectEnum, fallbackType = '') {
        const v = String(effectEnum || '').trim();

        const map = {
            EFT_SLASH: 'slash',
            EFT_MAGIC_SLASH: 'slash',
            EFT_LIGHTNING_SLASH: 'slash',
            EFT_THUNDERBOLT_SLASH: 'slash',

            EFT_THUNDERBOLT: 'lightning',

            EFT_ICE_NIDDLE: 'ice_needle',
            EFT_MASSIVE_ICE: 'ice_strike',
            EFT_ICE_AURA: 'particle'
        };

        return map[v] || fallbackType;
    },

castSkill: function(m, skillId, gameState) {
    let skill = gameState.DB_SKILL[skillId];
    if (!skill) return;

    m.skillCooldowns[skillId] = parseFloat(skill.Skill_Cooltime) || 3;

    if (skill.Skill_Type === 'Aura_Area_ATK') {
        gameState.auras.push({
            owner: m,
            skill: skill,
            life: skill.effectDur,
            maxLife: skill.effectDur,
            timer: 0,
            cycle: skill.atkCycle,
            w: parseFloat(skill.Skill_Hitbox_Size_X) || 300,
            d: parseFloat(skill.Skill_Hitbox_Size_Y) || 100,
            h: parseFloat(skill.Skill_Hitbox_Size_Z) || 100,
            renderType: skill.Skill_Effect_Render_Type || '',
            skillEffectType: this.resolveSkillEffectType(skill.Skill_Effect_Render_Type, '')
        });
        return;
    }

    if (!(skill.Warning_Effect_Name || skill.Warning_Effect_Render_Type)) return;

    const warnPlace = String(skill.Warning_Effect_Place || '').trim();
    const warnW = parseFloat(skill.Warning_Effect_Size_X) || (parseFloat(skill.Skill_Hitbox_Size_X) || 50);
    const warnD = parseFloat(skill.Warning_Effect_Size_Y) || (parseFloat(skill.Skill_Hitbox_Size_Y) || 30);
    const hitW = parseFloat(skill.Skill_Hitbox_Size_X) || warnW;

    let warnX = gameState.player.x;
    let warnY = gameState.player.y;
    let warnZ = 0;

    if (warnPlace === 'Skill_ATK_Hitbox') {
        warnX = m.x + (m.faceDir === 1 ? hitW / 2 : -hitW / 2);
        warnY = m.y;
        warnZ = m.z || 0;
    } else if (warnPlace === 'Range_From_Monster') {
        warnX = m.x;
        warnY = m.y;
        warnZ = m.z || 0;
    } else {
        warnX = gameState.player.x;
        warnY = gameState.player.y;
        warnZ = 0;
    }

    gameState.effects.push({
        type: 'warning',
        renderType: this.resolveWarningEffectType(skill.Warning_Effect_Render_Type, 'warning'),
        warningRenderType: skill.Warning_Effect_Render_Type || '',
        skillEffectRenderType: skill.Skill_Effect_Render_Type || '',
        skillEffectType: this.resolveSkillEffectType(skill.Skill_Effect_Render_Type, ''),
        name: skill.Warning_Effect_Name || '',
        x: warnX,
        y: warnY,
        z: warnZ,
        w: warnW,
        d: warnD,
        life: parseFloat(skill.Warning_Effect_Duration) || 0.5,
        maxLife: parseFloat(skill.Warning_Effect_Duration) || 0.5,
        skill: skill,
        owner: m,
        faceDir: m.faceDir
    });
},
};