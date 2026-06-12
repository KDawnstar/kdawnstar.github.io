// [카시야스 보스전] 보스/몬스터 본체 렌더링 담당 파일 (boss_renderer.js)
GameRenderer.normalizeKasiyasPoseType = function(value) {
    const raw = String(value || '').trim().toUpperCase();
    if (!raw) return 'POSE_DEFAULT';

    const map = {
        POSE_KASIYAS_STABBING: 'POSE_STABBING',
        POSE_KASIYAS_SLASH_UP: 'POSE_SLASH_UP',
        POSE_KASIYAS_SLASH_DOWN: 'POSE_SLASH_DOWN',
        POSE_KASIYAS_DASH: 'POSE_STABBING',
        POSE_KASIYAS_LOW_AREA_SLASH: 'POSE_LOW_AREA_SLASH',
        POSE_KASIYAS_HORIZONTAL_SLASH: 'POSE_HORIZONTAL_SLASH',
        POSE_KASIYAS_SHOULDER_ATK: 'POSE_SHOULDER_ATK',
        POSE_KASIYAS_FIST_BUMPING: 'POSE_FIST_BUMPING',
        POSE_KASIYAS_STOMP: 'POSE_STOMP',
        POSE_KASIYAS_CHARGE_SLASH_DOWN: 'POSE_HEAVY_SLASH_DOWN',
        POSE_KASIYAS_P1_GROGGY: 'POSE_P1_GROGGY',
        POSE_KASIYAS_SWORDPLAY: 'POSE_SWORDPLAY',
        POSE_KASIYAS_ATK_READY_01: 'POSE_ATK_READY_01',
        POSE_KASIYAS_ATK_READY_02: 'POSE_ATK_READY_02',
        POSE_KASIYAS_ATK_READY_03: 'POSE_ATK_READY_03',
        POSE_KASIYAS_HORIZONTAL_SLASH_READY: 'POSE_HORIZONTAL_SLASH_READY',
        POSE_KASIYAS_CHARGE_HORIZONTAL_SLASH: 'POSE_CHARGE_HORIZONTAL_SLASH',
        POSE_KASIYAS_P1_M2_FINAL_SLASH: 'POSE_P1_M2_FINAL_SLASH',
        POSE_KASIYAS_SWORD_QUICK_DRAW_READY: 'POSE_P1_M3_LOW_RUSH_READY',
        POSE_KASIYAS_SWORD_QUICK_DRAW: 'POSE_P1_M3_LOW_RUSH',
        POSE_P1_M3_LOW_RUSH_READY: 'POSE_P1_M3_LOW_RUSH_READY',
        POSE_P1_M3_LOW_RUSH: 'POSE_P1_M3_LOW_RUSH',
        POSE_KASIYAS_SLAM_THE_SWORD_DOWN_READY: 'POSE_SLAM_THE_SWORD_DOWN_READY',
        POSE_KASIYAS_SLAM_THE_SWORD_DOWN: 'POSE_SLAM_THE_SWORD_DOWN',
        POSE_KASIYAS_DEFAULT: 'POSE_DEFAULT',
        POSE_KASIYAS_P2_DASH: 'POSE_P2_DASH',
        POSE_KASIYAS_P2_LEFT_SWORD_SLASH_DOWN: 'POSE_P2_LEFT_SWORD_SLASH_DOWN',
        POSE_KASIYAS_P2_RIGHT_SWORD_HORIZONTAL_SLASH: 'POSE_P2_RIGHT_SWORD_HORIZONTAL_SLASH',
        POSE_KASIYAS_P2_LEFT_SWORD_DIAGONAL_SLASH: 'POSE_P2_LEFT_SWORD_DIAGONAL_SLASH',
        POSE_KASIYAS_P2_CHARGE_ENERGY: 'POSE_P2_CHARGE_ENERGY',
        POSE_KASIYAS_P2_DOUBLE_SWORD_CROSS_SLASH: 'POSE_P2_DOUBLE_SWORD_CROSS_SLASH',
        POSE_KASIYAS_P2_DOUBLE_SWORD_UP_DOWN_SLASH: 'POSE_P2_DOUBLE_SWORD_UP_DOWN_SLASH',
        POSE_KASIYAS_P2_SWORD_STORM_SPAWN_READY: 'POSE_P2_SWORD_STORM_SPAWN_READY',
        POSE_KASIYAS_P2_SWORD_STORM_SPAWN: 'POSE_P2_SWORD_STORM_SPAWN',
        POSE_KASIYAS_P2_SWORD_STORM_SPAWN_TO_DEFAULT: 'POSE_P2_SWORD_STORM_SPAWN_TO_DEFAULT',
        POSE_KASIYAS_P2_PUT_SWORD: 'POSE_P2_PUT_SWORD',
        POSE_KASIYAS_P2_GROUND_PUNCH: 'POSE_P2_GROUND_PUNCH',
        POSE_KASIYAS_P2_GROUND_PUNCH_CHARGE: 'POSE_P2_GROUND_PUNCH_CHARGE',
        POSE_KASIYAS_P2_GROUND_PUNCH_STRONG: 'POSE_P2_GROUND_PUNCH_STRONG',
        POSE_KASIYAS_P2_DOUBLE_EDGED_SWORD_STANCE: 'POSE_P2_DOUBLE_EDGED_SWORD_STANCE',
        POSE_KASIYAS_P2_DOUBLE_EDGED_SWORD_DEFENCE_READY: 'POSE_P2_DOUBLE_EDGED_SWORD_DEFENCE_READY',
        POSE_KASIYAS_P2_DOUBLE_EDGED_SWORD_SPIN: 'POSE_P2_DOUBLE_EDGED_SWORD_SPIN',
        POSE_KASIYAS_P2_DOUBLE_EDGED_SWORD_TO_DEFAULT: 'POSE_P2_DOUBLE_EDGED_SWORD_TO_DEFAULT',
        POSE_KASIYAS_P2_JUMP_WITH_DOUBLE_EDGED_SWORD: 'POSE_P2_JUMP_WITH_DOUBLE_EDGED_SWORD',
        POSE_KASIYAS_P2_DOUBLE_EDGED_SWORD_JUMP_SLASH: 'POSE_P2_DOUBLE_EDGED_SWORD_JUMP_SLASH',
        POSE_KASIYAS_P2_SUMMON_DIMENSION_PORTAL: 'POSE_P2_SUMMON_DIMENSION_PORTAL',
        POSE_KASIYAS_P2_ONI_STANCE: 'POSE_P2_ONI_STANCE',
        POSE_KASIYAS_P2_ONI_SLASH: 'POSE_P2_ONI_SLASH',
        POSE_KASIYAS_P2_M1_READY: 'POSE_P2_DOUBLE_SWORD_UP_DOWN_SLASH',
        POSE_KASIYAS_P2_M1_LEFT_SWORD_SLASH: 'POSE_P2_M1_LEFT_INWARD_SLASH',
        POSE_KASIYAS_P2_M1_RIGHT_SWORD_SLASH: 'POSE_P2_M1_RIGHT_INWARD_SLASH',
        POSE_KASIYAS_P2_M1_X_SLASH_READY: 'POSE_P2_M1_X_SLASH_READY',
        POSE_KASIYAS_P2_M1_X_SLASH: 'POSE_P2_M1_X_SLASH',
        POSE_KASIYAS_P2_HIDE: 'POSE_P2_HIDE',
        POSE_KASIYAS_P2_M2_WAIT_IN_DIMENSION_PORTAL: 'POSE_P2_M2_WAIT_IN_DIMENSION_PORTAL',
        POSE_KASIYAS_P2_M2_AIR_SPIN_SLASH: 'POSE_P2_M2_AIR_SPIN_SLASH',
        POSE_KASIYAS_P2_M2_FINAL_SLASH: 'POSE_P2_DOUBLE_EDGED_SWORD_SPIN',
        POSE_KASIYAS_P2_GROGGY: 'POSE_P2_GROGGY',
        POSE_STABBING: 'POSE_STABBING',
        POSE_SLASH_UP: 'POSE_SLASH_UP',
        POSE_SLASH_DOWN: 'POSE_SLASH_DOWN',
        POSE_HEAVY_SLASH_DOWN: 'POSE_HEAVY_SLASH_DOWN',
        POSE_LOW_AREA_SLASH: 'POSE_LOW_AREA_SLASH',
        POSE_HORIZONTAL_SLASH: 'POSE_HORIZONTAL_SLASH',
        POSE_SHOULDER_ATK: 'POSE_SHOULDER_ATK',
        POSE_FIST_BUMPING: 'POSE_FIST_BUMPING',
        POSE_STOMP: 'POSE_STOMP',
        POSE_P1_GROGGY: 'POSE_P1_GROGGY',
        POSE_SWORDPLAY: 'POSE_SWORDPLAY',
        POSE_ATK_READY_01: 'POSE_ATK_READY_01',
        POSE_ATK_READY_02: 'POSE_ATK_READY_02',
        POSE_ATK_READY_03: 'POSE_ATK_READY_03',
        POSE_HORIZONTAL_SLASH_READY: 'POSE_HORIZONTAL_SLASH_READY',
        POSE_CHARGE_HORIZONTAL_SLASH: 'POSE_CHARGE_HORIZONTAL_SLASH',
        POSE_P1_M2_FINAL_SLASH: 'POSE_P1_M2_FINAL_SLASH',
        POSE_P1_M3_LOW_RUSH_READY: 'POSE_P1_M3_LOW_RUSH_READY',
        POSE_P1_M3_LOW_RUSH: 'POSE_P1_M3_LOW_RUSH',
        POSE_SLAM_THE_SWORD_DOWN_READY: 'POSE_SLAM_THE_SWORD_DOWN_READY',
        POSE_SLAM_THE_SWORD_DOWN: 'POSE_SLAM_THE_SWORD_DOWN',
        POSE_P2_DASH: 'POSE_P2_DASH',
        POSE_P2_LEFT_SWORD_SLASH_DOWN: 'POSE_P2_LEFT_SWORD_SLASH_DOWN',
        POSE_P2_RIGHT_SWORD_HORIZONTAL_SLASH: 'POSE_P2_RIGHT_SWORD_HORIZONTAL_SLASH',
        POSE_P2_LEFT_SWORD_DIAGONAL_SLASH: 'POSE_P2_LEFT_SWORD_DIAGONAL_SLASH',
        POSE_P2_CHARGE_ENERGY: 'POSE_P2_CHARGE_ENERGY',
        POSE_P2_DOUBLE_SWORD_CROSS_SLASH: 'POSE_P2_DOUBLE_SWORD_CROSS_SLASH',
        POSE_P2_DOUBLE_SWORD_UP_DOWN_SLASH: 'POSE_P2_DOUBLE_SWORD_UP_DOWN_SLASH',
        POSE_P2_SWORD_STORM_SPAWN_READY: 'POSE_P2_SWORD_STORM_SPAWN_READY',
        POSE_P2_SWORD_STORM_SPAWN: 'POSE_P2_SWORD_STORM_SPAWN',
        POSE_P2_SWORD_STORM_SPAWN_TO_DEFAULT: 'POSE_P2_SWORD_STORM_SPAWN_TO_DEFAULT',
        POSE_P2_SUMMON_DIMENSION_PORTAL: 'POSE_P2_SUMMON_DIMENSION_PORTAL',
        POSE_P2_ONI_STANCE: 'POSE_P2_ONI_STANCE',
        POSE_P2_DOUBLE_EDGED_SWORD_DEFENCE_READY: 'POSE_P2_DOUBLE_EDGED_SWORD_DEFENCE_READY',
        POSE_P2_DOUBLE_EDGED_SWORD_SPIN: 'POSE_P2_DOUBLE_EDGED_SWORD_SPIN',
        POSE_P2_DOUBLE_EDGED_SWORD_TO_DEFAULT: 'POSE_P2_DOUBLE_EDGED_SWORD_TO_DEFAULT',
        POSE_P2_ONI_SLASH: 'POSE_P2_ONI_SLASH',
        POSE_P2_GROGGY: 'POSE_P2_GROGGY',
        POSE_KASIYAS_P3_DASH: 'POSE_KASIYAS_P3_DASH',
        POSE_KASIYAS_P3_WARP: 'POSE_KASIYAS_P3_WARP',
        POSE_KASIYAS_P3_SWORD_WAVE_CAST_SLASH: 'POSE_KASIYAS_P3_SWORD_WAVE_CAST_SLASH',
        POSE_KASIYAS_P3_CAST_DIMENSION_CRACK_SLASH: 'POSE_KASIYAS_P3_CAST_DIMENSION_CRACK_SLASH',
        POSE_KASIYAS_P3_RUSH_SLASH_CHARGE: 'POSE_KASIYAS_P3_RUSH_SLASH_CHARGE',
        POSE_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH: 'POSE_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH',
        POSE_KASIYAS_P3_HORIZONTAL_SLASH: 'POSE_KASIYAS_P3_HORIZONTAL_SLASH',
        POSE_KASIYAS_P3_SLASH_UP: 'POSE_KASIYAS_P3_SLASH_UP',
        POSE_KASIYAS_P3_SLASH_DOWN: 'POSE_KASIYAS_P3_SLASH_DOWN',
        POSE_KASIYAS_P3_AIR_SLASH_DOWN: 'POSE_KASIYAS_P3_AIR_SLASH_DOWN',
        POSE_KASIYAS_P3_JUMP: 'POSE_KASIYAS_P3_JUMP',
        POSE_KASIYAS_P3_DIAGONAL_SLASH: 'POSE_KASIYAS_P3_DIAGONAL_SLASH',
        POSE_KASIYAS_P3_AIM_SWORD_PLAYER: 'POSE_KASIYAS_P3_AIM_SWORD_PLAYER',
        POSE_KASIYAS_P3_WALK_WITH_AURA: 'POSE_KASIYAS_P3_WALK_WITH_AURA',
        POSE_KASIYAS_P3_AURA_CUT_OFF_SLASH: 'POSE_KASIYAS_P3_AURA_CUT_OFF_SLASH',
        POSE_KASIYAS_P3_CAST_EXTEND_HAND: 'POSE_KASIYAS_P3_CAST_EXTEND_HAND',
        POSE_KASIYAS_P3_DASH_SLASH: 'POSE_KASIYAS_P3_DASH_SLASH',
        POSE_KASIYAS_P3_SLAM_THE_SWORD_DOWN: 'POSE_KASIYAS_P3_SLAM_THE_SWORD_DOWN',
        POSE_KASIYAS_P3_ATK_ROAR: 'POSE_KASIYAS_P3_ATK_ROAR',
        POSE_KASIYAS_P3_M1_FINAL_SLASH_CHARGE: 'POSE_KASIYAS_P3_M1_FINAL_SLASH_CHARGE',
        POSE_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH: 'POSE_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH',
        POSE_KASIYAS_P3_GROGGY: 'POSE_P2_GROGGY',
        POSE_KASIYAS_P3_M2_HAND_TO_SKY: 'POSE_KASIYAS_P3_M2_HAND_TO_SKY',
        POSE_KASIYAS_P3_M2_JUMP_TO_SKY: 'POSE_KASIYAS_P3_M2_JUMP_TO_SKY',
        POSE_KASIYAS_P3_M2_AIRBORNE_HOLD: 'POSE_KASIYAS_P3_M2_AIRBORNE_HOLD',
        POSE_KASIYAS_P3_M2_OVERHEAD_STRIKE: 'POSE_KASIYAS_P3_M2_OVERHEAD_STRIKE',
        POSE_KASIYAS_P3_M2_FINAL_SLASH_CHARGE: 'POSE_KASIYAS_P3_M2_FINAL_SLASH_CHARGE',
        POSE_KASIYAS_P3_M2_FINAL_SLASH: 'POSE_KASIYAS_P3_M2_FINAL_SLASH',
        POSE_DEFAULT: 'POSE_DEFAULT'
    };

    return map[raw] || raw;
};

GameRenderer.resolveKasiyasPoseType = function(m) {
    if (m && m.boss && m.boss.groggyTimer > 0) {
        return this.normalizeKasiyasPoseType(m.boss.groggyPoseType || 'POSE_KASIYAS_P1_GROGGY');
    }
    const action = m && m.boss ? m.boss.action : null;
    const explicitPose = String(action && action.Action_Pose_Type || '').trim().toUpperCase();
    if (explicitPose) return this.normalizeKasiyasPoseType(explicitPose);

    const vfx = String(action && action.VFX_Type || '').trim().toUpperCase();
    if (vfx === 'EFT_STABBING' || vfx === 'EFT_KASIYAS_SLASH_02' || vfx === 'EFT_RUSH_ISSEN' || vfx === 'EFT_KASIYAS_RUSH_SLASH') {
        return 'POSE_STABBING';
    }
    if (vfx === 'EFT_SLASH_UP' || vfx === 'EFT_KASIYAS_SLASH_03') {
        return 'POSE_SLASH_UP';
    }
    if (vfx === 'EFT_SLASH_DOWN' || vfx === 'EFT_KASIYAS_SLASH_01' || vfx === 'EFT_KASIYAS_SLASH_04') {
        return 'POSE_SLASH_DOWN';
    }
    if (vfx === 'EFT_KASIYAS_P2_LEFT_SWORD_SLASH_DOWN') return 'POSE_P2_LEFT_SWORD_SLASH_DOWN';
    if (vfx === 'EFT_KASIYAS_P2_RIGHT_SWORD_HORIZONTAL_SLASH') return 'POSE_P2_RIGHT_SWORD_HORIZONTAL_SLASH';
    if (vfx === 'EFT_KASIYAS_P2_LEFT_SWORD_DIAGONAL_SLASH') return 'POSE_P2_LEFT_SWORD_DIAGONAL_SLASH';
    if (vfx === 'EFT_KASIYAS_P2_CHARGE_ENERGY') return 'POSE_P2_CHARGE_ENERGY';
    if (vfx === 'EFT_KASIYAS_P2_DOUBLE_SWORD_CROSS_SLASH') return 'POSE_P2_DOUBLE_SWORD_CROSS_SLASH';
    if (vfx === 'EFT_KASIYAS_P2_DOUBLE_SWORD_UP_DOWN_SLASH') return 'POSE_P2_DOUBLE_SWORD_UP_DOWN_SLASH';
    if (vfx === 'EFT_KASIYAS_P2_SWORD_STORM_SPAWN') return 'POSE_P2_SWORD_STORM_SPAWN';
    if (vfx === 'EFT_KASIYAS_P2_SUMMON_DIMENSION_PORTAL') return 'POSE_P2_SUMMON_DIMENSION_PORTAL';
    if (vfx === 'EFT_KASIYAS_P2_ONI_STANCE_ENERGY_CHARGE' || vfx === 'EFT_KASIYAS_P2_ONI_STANCE_FULL_ENERGY') return 'POSE_P2_ONI_STANCE';
    if (vfx === 'EFT_KASIYAS_P2_ONI_SLASH') return 'POSE_P2_ONI_SLASH';
    if (vfx === 'EFT_KASIYAS_P2_DOUBLE_EDGED_SWORD_SPIN') return 'POSE_P2_DOUBLE_EDGED_SWORD_SPIN';
    if (vfx === 'EFT_KASIYAS_P3_AIM_SWORD_PLAYER') return 'POSE_KASIYAS_P3_AIM_SWORD_PLAYER';
    if (vfx === 'EFT_KASIYAS_P3_WALK_WITH_AURA') return 'POSE_KASIYAS_P3_WALK_WITH_AURA';
    if (vfx === 'EFT_KASIYAS_P3_AURA_CUT_OFF_SLASH') return 'POSE_KASIYAS_P3_AURA_CUT_OFF_SLASH';
    if (vfx === 'EFT_KASIYAS_P3_WARP') return 'POSE_KASIYAS_P3_WARP';
    if (vfx === 'EFT_KASIYAS_P3_SWORD_WAVE_CAST_SLASH') return 'POSE_KASIYAS_P3_SWORD_WAVE_CAST_SLASH';
    if (vfx === 'EFT_KASIYAS_P3_CAST_DIMENSION_CRACK_SLASH') return 'POSE_KASIYAS_P3_CAST_DIMENSION_CRACK_SLASH';
    if (vfx === 'EFT_KASIYAS_P3_RUSH_SLASH_CHARGE') return 'POSE_KASIYAS_P3_RUSH_SLASH_CHARGE';
    if (vfx === 'EFT_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH') return 'POSE_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH';
    if (vfx === 'EFT_KASIYAS_P3_DASH_SLASH' || vfx === 'EFT_KASIYAS_P3_M1_DASH_SLASH') return 'POSE_KASIYAS_P3_DASH_SLASH';
    if (vfx === 'EFT_KASIYAS_P3_SLAM_THE_SWORD_DOWN' || vfx === 'EFT_KASIYAS_P3_M1_SLAM_THE_SWORD_DOWN') return 'POSE_KASIYAS_P3_SLAM_THE_SWORD_DOWN';
    if (vfx === 'EFT_KASIYAS_P3_ATK_ROAR' || vfx === 'EFT_KASIYAS_P3_M1_ATK_ROAR') return 'POSE_KASIYAS_P3_ATK_ROAR';
    if (vfx === 'EFT_KASIYAS_P3_M1_CAST_EXTEND_HAND') return 'POSE_KASIYAS_P3_CAST_EXTEND_HAND';
    if (vfx === 'EFT_KASIYAS_P3_M1_HORIZONTAL_SLASH') return 'POSE_KASIYAS_P3_HORIZONTAL_SLASH';
    if (vfx === 'EFT_KASIYAS_P3_M1_SLASH_DOWN') return 'POSE_KASIYAS_P3_SLASH_DOWN';
    if (vfx === 'EFT_KASIYAS_P3_M1_FINAL_SLASH_CHARGE') return 'POSE_KASIYAS_P3_M1_FINAL_SLASH_CHARGE';
    if (vfx === 'EFT_KASIYAS_P3_M2_HAND_TO_SKY') return 'POSE_KASIYAS_P3_M2_HAND_TO_SKY';
    if (vfx === 'EFT_KASIYAS_P3_M2_JUMP_TO_SKY') return 'POSE_KASIYAS_P3_M2_JUMP_TO_SKY';
    if (vfx === 'EFT_KASIYAS_P3_M2_OVERHEAD_STRIKE') return 'POSE_KASIYAS_P3_M2_OVERHEAD_STRIKE';
    if (vfx === 'EFT_KASIYAS_P3_M2_FINAL_SLASH_CHARGE') return 'POSE_KASIYAS_P3_M2_FINAL_SLASH_CHARGE';
    if (vfx === 'EFT_KASIYAS_P3_M2_FINAL_SLASH') return 'POSE_KASIYAS_P3_M2_FINAL_SLASH';
    if (vfx === 'EFT_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH') return 'POSE_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH';
    if (vfx === 'EFT_KASIYAS_P2_DOUBLE_SWORD_ANOTHER_ENERGY') return 'POSE_P2_DOUBLE_SWORD_UP_DOWN_SLASH';
    if (vfx === 'EFT_KASIYAS_P2_M1_LEFT_SWORD_SLASH_WITH_RED_ENERGY') return 'POSE_P2_M1_LEFT_INWARD_SLASH';
    if (vfx === 'EFT_KASIYAS_P2_M1_RIGHT_SWORD_SLASH_WITH_YELLOW_ENERGY') return 'POSE_P2_M1_RIGHT_INWARD_SLASH';
    if (vfx === 'EFT_KASIYAS_P2_M1_X_SLASH_CHARGE') return 'POSE_P2_M1_X_SLASH_READY';
    if (vfx === 'EFT_KASIYAS_P2_M1_X_SLASH') return 'POSE_P2_M1_X_SLASH';

    return 'POSE_DEFAULT';
};


GameRenderer.drawKasiyasGroundShadow = function(ctx, x, drawY, w, dY, drawScale = 1) {
    const scale = Math.max(0.05, parseFloat(drawScale) || 1);
    const radiusX = Math.max(8, (parseFloat(w) || 80) * 0.54 * scale);
    const radiusY = Math.max(5, (parseFloat(dY) || 60) * 0.50 * scale);
    ctx.save();
    ctx.globalAlpha = 1;
    if ('filter' in ctx) ctx.filter = 'none';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(parseFloat(x) || 0, parseFloat(drawY) || 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

GameRenderer.getKasiyasActionProgress = function(m, gameState) {
    if (m && m.boss && m.boss.groggyTimer > 0) {
        const maxTime = Math.max(0.001, parseFloat(m.boss.groggyMaxTime) || parseFloat(m.boss.groggyTimer) || 1);
        return Math.max(0, Math.min(1, 1 - ((parseFloat(m.boss.groggyTimer) || 0) / maxTime)));
    }
    if (!m || !m.boss || !m.boss.action) return 0;
    let dur = 0;

    try {
        if (typeof MonsterManager !== 'undefined' && MonsterManager.getBossActionDuration) {
            dur = MonsterManager.getBossActionDuration(m, m.boss.action, gameState);
        }
    } catch (e) {}

    if (!dur || !isFinite(dur) || dur <= 0) {
        dur = parseFloat(m.boss.action.Action_Anim_Duration) || 0.7;
    }

    return Math.max(0, Math.min(1, (parseFloat(m.timer) || 0) / Math.max(0.001, dur)));
};


GameRenderer.isKasiyasArmorEffectActive = function(entity) {
    if (!entity) return false;
    const action = entity.boss && entity.boss.action ? entity.boss.action : (entity.action || null);
    const defence = String((action && (action.Action_Defence_Type || action.Defence_Type)) || '').trim().toUpperCase();
    const dataDef = String(entity.d && (entity.d.defType || entity.d.ATK_Defence_Type || entity.d.Move_Defence_Type) || '').trim().toUpperCase();
    return defence === 'SUPER_ARMOR' || defence === 'INVINCIBLE' || dataDef === 'SUPERARMOR' || dataDef === 'SUPER_ARMOR';
};

GameRenderer.isOwnerBossArmorEffectActive = function(owner) {
    if (!owner || !owner.boss) return false;
    const action = owner.boss.action || null;
    const defence = String((action && (action.Action_Defence_Type || action.Defence_Type)) || '').trim().toUpperCase();
    return defence === 'SUPER_ARMOR' || defence === 'INVINCIBLE';
};

GameRenderer.drawKasiyasArmorOutline = function(ctx, w, h, alpha = 1) {
    const pulse = 0.5 + Math.sin(Date.now() / 72) * 0.5;
    const hot = pulse > 0.50;
    const main = hot
        ? `rgba(255,208,74,${0.36 * alpha + pulse * 0.20 * alpha})`
        : `rgba(255,54,34,${0.38 * alpha + (1 - pulse) * 0.18 * alpha})`;
    const sub = hot ? `rgba(255,72,32,${0.22 * alpha})` : `rgba(255,190,56,${0.20 * alpha})`;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 8 + pulse * 7;
    ctx.shadowColor = hot ? 'rgba(255,208,74,0.62)' : 'rgba(255,54,34,0.62)';

    // 더듬이처럼 위로 튀는 선은 제거하고, 카시야스 신체 실루엣을 따라 감싸는 테두리만 표시한다.
    ctx.strokeStyle = main;
    ctx.lineWidth = Math.max(2.6, w * 0.035);
    ctx.beginPath();
    // 왼쪽 외곽: 발/하반신 → 어깨 → 갈기/머리
    ctx.moveTo(-w * 0.36, -h * 0.08);
    ctx.quadraticCurveTo(-w * 0.48, -h * 0.26, -w * 0.42, -h * 0.46);
    ctx.quadraticCurveTo(-w * 0.52, -h * 0.68, -w * 0.30, -h * 0.86);
    ctx.quadraticCurveTo(-w * 0.16, -h * 1.02, w * 0.02, -h * 1.05);
    // 오른쪽 외곽: 머리 → 어깨/팔 → 하반신
    ctx.quadraticCurveTo(w * 0.28, -h * 1.02, w * 0.42, -h * 0.82);
    ctx.quadraticCurveTo(w * 0.52, -h * 0.62, w * 0.44, -h * 0.42);
    ctx.quadraticCurveTo(w * 0.50, -h * 0.24, w * 0.36, -h * 0.07);
    ctx.stroke();

    // 안쪽 테두리는 상체/팔/하반신 주변에 짧게 붙인다. 길게 튀어나가는 장식선은 사용하지 않는다.
    ctx.strokeStyle = sub;
    ctx.lineWidth = Math.max(1.5, w * 0.020);
    ctx.shadowBlur = 5 + pulse * 4;
    ctx.beginPath();
    ctx.moveTo(-w * 0.34, -h * 0.72);
    ctx.quadraticCurveTo(-w * 0.18, -h * 0.82, w * 0.04, -h * 0.78);
    ctx.quadraticCurveTo(w * 0.24, -h * 0.82, w * 0.38, -h * 0.70);
    ctx.moveTo(-w * 0.42, -h * 0.44);
    ctx.quadraticCurveTo(-w * 0.52, -h * 0.30, -w * 0.40, -h * 0.16);
    ctx.moveTo(w * 0.42, -h * 0.44);
    ctx.quadraticCurveTo(w * 0.52, -h * 0.30, w * 0.39, -h * 0.16);
    ctx.moveTo(-w * 0.26, -h * 0.18);
    ctx.quadraticCurveTo(-w * 0.10, -h * 0.24, w * 0.10, -h * 0.24);
    ctx.quadraticCurveTo(w * 0.26, -h * 0.22, w * 0.32, -h * 0.12);
    ctx.stroke();

    ctx.restore();
};

GameRenderer.drawKasiyasModel = function(ctx, params = {}) {
    const m = params.m || {};
    const w = Math.max(50, params.w || 80);
    const h = Math.max(120, params.h || 160);
    const face = params.face === -1 ? -1 : 1;
    const stateKey = String(params.stateKey || '').trim().toUpperCase();
    const baseRenderType = String(params.renderType || 'RENDER_KASIYAS_P1').trim().toUpperCase();
    const transition = m && m.boss && m.boss.phaseTransition && m.boss.phaseTransition.active ? m.boss.phaseTransition : null;
    const transitionPhase = String(transition && transition.phase || '').trim().toUpperCase();
    const transitionType = String(transition && transition.type || '').trim().toUpperCase();
    const transitionTimer = parseFloat(transition && transition.timer) || 0;
    const isP1ToP2TransitionCutscene = !!transition && transitionPhase === 'CUTSCENE' && transitionType === 'KASIYAS_P1_TO_P2';
    const isP2ToP3TransitionCutscene = !!transition && transitionPhase === 'CUTSCENE' && transitionType === 'KASIYAS_P2_TO_P3';
    const transitionGrabProgress = isP1ToP2TransitionCutscene ? Math.max(0, Math.min(1, (transitionTimer - 5.6) / 0.9)) : 0;
    const transitionUseP2Model = isP1ToP2TransitionCutscene && transitionTimer >= 6.4;
    const transitionUseP3Model = isP2ToP3TransitionCutscene && transitionTimer >= 1.28;
    const renderType = transitionUseP3Model ? 'RENDER_KASIYAS_P3' : (transitionUseP2Model ? 'RENDER_KASIYAS_P2' : baseRenderType);
    const isKasiyasPhase2 = renderType === 'RENDER_KASIYAS_P2';
    const isKasiyasPhase3 = renderType === 'RENDER_KASIYAS_P3';
    const poseType = this.normalizeKasiyasPoseType(String(params.poseType || 'POSE_DEFAULT').trim().toUpperCase());
    const p2BareHandPoseSet = new Set(['POSE_P2_GROUND_PUNCH', 'POSE_P2_GROUND_PUNCH_CHARGE', 'POSE_P2_GROUND_PUNCH_STRONG']);
    const p2DoubleEdgedPoseSet = new Set(['POSE_P2_DOUBLE_EDGED_SWORD_STANCE', 'POSE_P2_DOUBLE_EDGED_SWORD_DEFENCE_READY', 'POSE_P2_DOUBLE_EDGED_SWORD_SPIN', 'POSE_P2_JUMP_WITH_DOUBLE_EDGED_SWORD', 'POSE_P2_DOUBLE_EDGED_SWORD_JUMP_SLASH']);
    const isP2BareHandPose = isKasiyasPhase2 && p2BareHandPoseSet.has(poseType);
    const isP2DoubleEdgedPose = isKasiyasPhase2 && p2DoubleEdgedPoseSet.has(poseType);
    const suppressP2SwordsForP3Transition = isP2ToP3TransitionCutscene && transitionTimer < 1.28;
    const progress = Math.max(0, Math.min(1, params.progress || 0));
    const isDead = stateKey === 'DIE' || stateKey === 'P_DIE';
    const isHit = stateKey === 'HIT' || stateKey === 'P_HIT';
    const moveTypeForPose = String(m && m.boss && m.boss.action && (m.boss.action.Action_Move_Type || m.boss.action.Move_Type) || '').trim().toUpperCase();
    const eyeEffectType = String(params.eyeEffectType || (m && m.boss && m.boss.action && (m.boss.action.VFX_Type || m.boss.action.Effect_Render_Type)) || '').trim().toUpperCase();
    const isRush = moveTypeForPose === 'RUSH' || moveTypeForPose === 'DASH';
    const p2M1Runtime = m && m.boss ? m.boss.p2MajorPattern1Runtime : null;
    // 2페이즈 대형 패턴 1의 검 기운은 패턴 시작 즉시 보이면 안 된다.
    // 기운 부여 액션이 끝난 뒤 swordEnergyGranted가 켜진 시점부터만 검신 오라를 렌더링한다.
    const p2M1SwordEnergyActive = !!(p2M1Runtime && p2M1Runtime.swordEnergyGranted && (p2M1Runtime.leftSwordEnergy || p2M1Runtime.rightSwordEnergy));

    // 목표: 원본 일러스트의 세부 묘사 복제가 아니라, 작은 전투 화면에서 바로 읽히는 카시야스 핵심 실루엣.
    const skinBase = isDead ? '#70666c' : (isHit ? '#c9898a' : '#8c687d');
    const skinDark = isDead ? '#4a464a' : '#5b3e51';
    const skinLight = isDead ? '#8a8288' : '#b08a99';
    const hairDark = isDead ? '#6a6251' : '#8b641c';
    const hairMid = isDead ? '#9b9279' : '#d9aa2e';
    const hairLight = isDead ? '#c1b79d' : '#ffe18a';
    const redArmor = isDead ? '#5f3835' : '#9d3d30';
    const redArmorLight = isDead ? '#7c4d48' : '#d75d41';
    const clothGreen = isDead ? '#3b403c' : '#334b2f';
    const clothDark = isDead ? '#272a28' : '#1f2b22';
    const line = 'rgba(0,0,0,0.82)';
    const eyeRed = isDead ? '#3f1111' : '#ff3f2e';
    const beadRed = isDead ? '#6b2d2b' : '#d64734';
    const bone = isDead ? '#9a8d7b' : '#c5a889';
    const bladeCore = isDead ? '#a7adb5' : (isKasiyasPhase3 ? '#f8eefc' : '#edf7ff');
    const bladeEdge = isDead ? '#68707a' : (isKasiyasPhase3 ? '#b68aff' : '#9ec5e8');
    const gold = isDead ? '#7b6a3b' : '#d3a12b';

    const smooth = progress * progress * (3 - 2 * progress);
    const attackPulse = Math.sin(Math.min(1, progress) * Math.PI);
    const bodyLean =
        ((poseType === 'POSE_P1_M3_LOW_RUSH' || poseType === 'POSE_P1_M3_LOW_RUSH_READY') ? 0.30 :
        (poseType === 'POSE_STABBING' ? (isRush ? 0.24 : 0.11) :
        poseType === 'POSE_SHOULDER_ATK' ? 0.34 :
        poseType === 'POSE_FIST_BUMPING' ? 0.10 :
        poseType === 'POSE_STOMP' ? -0.04 :
        poseType === 'POSE_P1_GROGGY' ? 0.18 :
        poseType === 'POSE_P2_GROGGY' ? 0.20 :
        poseType === 'POSE_ATK_READY_01' ? 0.22 :
        poseType === 'POSE_ATK_READY_02' ? -0.16 :
        poseType === 'POSE_ATK_READY_03' ? 0.06 :
        poseType === 'POSE_HORIZONTAL_SLASH_READY' ? -0.10 :
        poseType === 'POSE_P1_M2_FINAL_SLASH' ? 0.24 :
        poseType === 'POSE_CHARGE_HORIZONTAL_SLASH' ? 0.16 :
        poseType === 'POSE_SWORDPLAY' ? (-0.11 + attackPulse * 0.06) :
        poseType === 'POSE_SLASH_UP' ? -0.07 :
        poseType === 'POSE_SLAM_THE_SWORD_DOWN_READY' ? -0.12 :
        poseType === 'POSE_SLAM_THE_SWORD_DOWN' ? 0.18 :
        poseType === 'POSE_P2_DASH' ? 0.16 :
        poseType === 'POSE_P2_LEFT_SWORD_SLASH_DOWN' ? 0.08 :
        poseType === 'POSE_P2_RIGHT_SWORD_HORIZONTAL_SLASH' ? 0.10 :
        poseType === 'POSE_P2_LEFT_SWORD_DIAGONAL_SLASH' ? 0.06 :
        poseType === 'POSE_P2_CHARGE_ENERGY' ? -0.03 :
        poseType === 'POSE_P2_DOUBLE_SWORD_CROSS_SLASH' ? 0.12 :
        poseType === 'POSE_P2_DOUBLE_SWORD_UP_DOWN_SLASH' ? 0.08 :
        poseType === 'POSE_P2_M1_X_SLASH_READY' ? -0.06 :
        poseType === 'POSE_P2_M1_X_SLASH' ? 0.18 :
        poseType === 'POSE_P2_M1_LEFT_INWARD_SLASH' ? 0.10 :
        poseType === 'POSE_P2_M1_RIGHT_INWARD_SLASH' ? 0.10 :
        poseType === 'POSE_P2_SWORD_STORM_SPAWN_READY' ? -0.20 :
        poseType === 'POSE_P2_SWORD_STORM_SPAWN' ? (-0.06 + attackPulse * 0.08) :
        poseType === 'POSE_P2_SWORD_STORM_SPAWN_TO_DEFAULT' ? (-0.06 * (1 - smooth)) :
        poseType === 'POSE_P2_PUT_SWORD' ? 0.10 :
        poseType === 'POSE_P2_GROUND_PUNCH' ? 0.28 :
        poseType === 'POSE_P2_GROUND_PUNCH_CHARGE' ? 0.12 :
        poseType === 'POSE_P2_GROUND_PUNCH_STRONG' ? 0.32 :
        poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_STANCE' ? 0.06 :
        poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_DEFENCE_READY' ? 0.08 :
        poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_SPIN' ? (0.10 + attackPulse * 0.03) :
        poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_TO_DEFAULT' ? 0.06 * (1 - smooth) :
        poseType === 'POSE_P2_JUMP_WITH_DOUBLE_EDGED_SWORD' ? 0.20 :
        poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_JUMP_SLASH' ? 0.24 :
        poseType === 'POSE_P2_SUMMON_DIMENSION_PORTAL' ? -0.08 :
        poseType === 'POSE_P2_ONI_STANCE' ? 0.18 :
        poseType === 'POSE_P2_ONI_SLASH' ? 0.34 :
        poseType === 'POSE_KASIYAS_P3_DASH' ? 0.18 :
        poseType === 'POSE_KASIYAS_P3_WARP' ? 0.08 :
        poseType === 'POSE_KASIYAS_P3_SWORD_WAVE_CAST_SLASH' ? (0.10 + attackPulse * 0.08) :
        poseType === 'POSE_KASIYAS_P3_CAST_DIMENSION_CRACK_SLASH' ? (0.12 + attackPulse * 0.10) :
        poseType === 'POSE_KASIYAS_P3_RUSH_SLASH_CHARGE' ? -0.04 :
        poseType === 'POSE_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH' ? 0.20 :
        poseType === 'POSE_KASIYAS_P3_AIM_SWORD_PLAYER' ? 0.08 :
        poseType === 'POSE_KASIYAS_P3_WALK_WITH_AURA' ? 0.05 :
        poseType === 'POSE_KASIYAS_P3_HORIZONTAL_SLASH' ? (0.08 + attackPulse * 0.10) :
        poseType === 'POSE_KASIYAS_P3_SLASH_UP' ? (0.10 + attackPulse * 0.08) :
        poseType === 'POSE_KASIYAS_P3_AIR_SLASH_DOWN' ? (0.26 + attackPulse * 0.06) :
        poseType === 'POSE_KASIYAS_P3_SLASH_DOWN' ? 0.12 :
        poseType === 'POSE_KASIYAS_P3_DIAGONAL_SLASH' ? 0.16 :
        poseType === 'POSE_KASIYAS_P3_AURA_CUT_OFF_SLASH' ? 0.18 :
        poseType === 'POSE_KASIYAS_P3_CAST_EXTEND_HAND' ? (0.10 + attackPulse * 0.03) :
        poseType === 'POSE_KASIYAS_P3_DASH_SLASH' ? (0.24 + attackPulse * 0.06) :
        poseType === 'POSE_KASIYAS_P3_SLAM_THE_SWORD_DOWN' ? (0.12 + attackPulse * 0.08) :
        poseType === 'POSE_KASIYAS_P3_ATK_ROAR' ? (-0.14 - attackPulse * 0.03) :
        poseType === 'POSE_KASIYAS_P3_M1_FINAL_SLASH_CHARGE' ? -0.06 :
        poseType === 'POSE_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH' ? (0.22 + attackPulse * 0.05) :
        poseType === 'POSE_KASIYAS_P3_M2_HAND_TO_SKY' ? -0.04 :
        poseType === 'POSE_KASIYAS_P3_M2_JUMP_TO_SKY' ? -0.10 :
        poseType === 'POSE_KASIYAS_P3_M2_AIRBORNE_HOLD' ? -0.12 :
        poseType === 'POSE_KASIYAS_P3_M2_OVERHEAD_STRIKE' ? (0.24 + attackPulse * 0.03) :
        poseType === 'POSE_KASIYAS_P3_M2_FINAL_SLASH_CHARGE' ? -0.08 :
        poseType === 'POSE_KASIYAS_P3_M2_FINAL_SLASH' ? (0.18 + attackPulse * 0.05) :
        poseType === 'POSE_SLASH_DOWN' || poseType === 'POSE_HEAVY_SLASH_DOWN' ? 0.06 : 0));

    const drawLimb = (x1, y1, x2, y2, width, color, outline = true) => {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (outline) {
            ctx.strokeStyle = line;
            ctx.lineWidth = width + 2.4;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    };

    const drawPlate = (points, fill, stroke = line, lw = 1.8) => {
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };

    const drawClawHand = (x, y, size, dir = 1) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(dir, 1);
        ctx.fillStyle = skinLight;
        ctx.strokeStyle = line;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.46, size * 0.32, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = bone;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(size * 0.18, i * size * 0.10);
            ctx.lineTo(size * 0.52, i * size * 0.14 - size * 0.03);
            ctx.stroke();
        }
        ctx.restore();
    };

    const drawKatana = (handX, handY, angle, length, handleLen = 22, curve = 7, energyType = '') => {
        const bx = Math.cos(angle);
        const by = Math.sin(angle);
        const guardX = handX + bx * 5;
        const guardY = handY + by * 5;
        const tipX = handX + bx * length;
        const tipY = handY + by * length;
        const handleBackX = handX - bx * handleLen;
        const handleBackY = handY - by * handleLen;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = poseType !== 'POSE_DEFAULT' ? 9 : 2;
        ctx.shadowColor = 'rgba(160,210,255,0.42)';

        ctx.strokeStyle = 'rgba(0,0,0,0.86)';
        ctx.lineWidth = 7.5;
        ctx.beginPath();
        ctx.moveTo(guardX, guardY);
        ctx.quadraticCurveTo(handX + bx * length * 0.52 - by * curve, handY + by * length * 0.52 + bx * curve, tipX, tipY);
        ctx.stroke();

        ctx.strokeStyle = bladeEdge;
        ctx.lineWidth = 4.4;
        ctx.beginPath();
        ctx.moveTo(guardX, guardY);
        ctx.quadraticCurveTo(handX + bx * length * 0.52 - by * (curve * 0.75), handY + by * length * 0.52 + bx * (curve * 0.75), tipX, tipY);
        ctx.stroke();

        ctx.strokeStyle = bladeCore;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(guardX - by * 1.4, guardY + bx * 1.4);
        ctx.quadraticCurveTo(handX + bx * length * 0.50 - by * (curve * 0.34), handY + by * length * 0.50 + bx * (curve * 0.34), tipX - bx * 4, tipY - by * 4);
        ctx.stroke();

        const energy = String(energyType || '').trim().toUpperCase();
        if (energy === 'RED' || energy === 'YELLOW' || energy === 'P3') {
            const isYellowEnergy = energy === 'YELLOW';
            const isPhase3Energy = energy === 'P3';
            const time = Date.now() / 115;
            const core = isPhase3Energy ? 'rgba(205,64,255,0.88)' : (isYellowEnergy ? 'rgba(255,214,48,0.92)' : 'rgba(255,54,36,0.90)');
            const edge = isPhase3Energy ? 'rgba(18,0,30,0.86)' : (isYellowEnergy ? 'rgba(128,64,0,0.72)' : 'rgba(56,0,0,0.78)');
            const hot = isPhase3Energy ? 'rgba(255,224,255,0.70)' : (isYellowEnergy ? 'rgba(255,252,204,0.74)' : 'rgba(255,218,188,0.68)');
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 14;
            ctx.shadowColor = core;
            // 검신을 따라 감기는 기본 화염 오라. 검 위치/각도에 붙어 있으므로 포즈가 바뀌어도 함께 움직인다.
            ctx.strokeStyle = edge;
            ctx.lineWidth = 8.0;
            ctx.beginPath();
            ctx.moveTo(guardX, guardY);
            ctx.quadraticCurveTo(handX + bx * length * 0.50 - by * (curve * 0.85), handY + by * length * 0.50 + bx * (curve * 0.85), tipX, tipY);
            ctx.stroke();
            ctx.strokeStyle = core;
            ctx.lineWidth = 4.2;
            ctx.beginPath();
            ctx.moveTo(guardX, guardY);
            ctx.quadraticCurveTo(handX + bx * length * 0.52 - by * (curve * 0.52), handY + by * length * 0.52 + bx * (curve * 0.52), tipX - bx * 4, tipY - by * 4);
            ctx.stroke();
            ctx.strokeStyle = hot;
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            ctx.moveTo(guardX - by * 1.5, guardY + bx * 1.5);
            ctx.quadraticCurveTo(handX + bx * length * 0.50 - by * (curve * 0.20), handY + by * length * 0.50 + bx * (curve * 0.20), tipX - bx * 8, tipY - by * 8);
            ctx.stroke();
            // 불꽃처럼 검신을 감는 짧은 흔들림.
            for (let i = 0; i < 7; i++) {
                const t = (i + 0.35) / 7;
                const cx = guardX + (tipX - guardX) * t;
                const cy = guardY + (tipY - guardY) * t;
                const side = i % 2 === 0 ? 1 : -1;
                const amp = (Math.sin(time + i * 1.37) * 0.55 + 0.85) * (5 + length * 0.012);
                ctx.strokeStyle = i % 2 === 0 ? core : edge;
                ctx.lineWidth = i % 2 === 0 ? 2.2 : 1.6;
                ctx.beginPath();
                ctx.moveTo(cx - by * side * 2, cy + bx * side * 2);
                ctx.bezierCurveTo(
                    cx - by * side * amp + bx * 3, cy + bx * side * amp + by * 3,
                    cx + by * side * amp * 0.70 + bx * 6, cy - bx * side * amp * 0.70 + by * 6,
                    cx + bx * 10 - by * side * 2, cy + by * 10 + bx * side * 2
                );
                ctx.stroke();
            }
            if (isPhase3Energy) {
                ctx.strokeStyle = 'rgba(255,42,44,0.36)';
                ctx.lineWidth = 2.4;
                ctx.setLineDash([12, 7]);
                ctx.lineDashOffset = -Date.now() / 24;
                ctx.beginPath();
                ctx.moveTo(guardX - by * 7, guardY + bx * 7);
                ctx.quadraticCurveTo(handX + bx * length * 0.54 - by * (curve + 12), handY + by * length * 0.54 + bx * (curve + 12), tipX - bx * 10, tipY - by * 10);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            ctx.restore();
        }

        ctx.shadowBlur = 0;

        ctx.strokeStyle = line;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(handleBackX, handleBackY);
        ctx.lineTo(handX + bx * 9, handY + by * 9);
        ctx.stroke();
        ctx.strokeStyle = '#4b2f23';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(handleBackX, handleBackY);
        ctx.lineTo(handX + bx * 9, handY + by * 9);
        ctx.stroke();

        ctx.strokeStyle = gold;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(handX - by * 9, handY + bx * 9);
        ctx.lineTo(handX + by * 9, handY - bx * 9);
        ctx.stroke();
        ctx.restore();
    };

    const drawPhase2SummonedKatana = (handX, handY, angle, length, handleLen = 22, curve = 7) => {
        // 2페이즈 차원 소환검: 기존 검보다 어둡고, 붉은 기운이 검신을 따라 흐르는 실루엣.
        const bx = Math.cos(angle);
        const by = Math.sin(angle);
        const guardX = handX + bx * 5;
        const guardY = handY + by * 5;
        const tipX = handX + bx * length;
        const tipY = handY + by * length;
        const handleBackX = handX - bx * handleLen;
        const handleBackY = handY - by * handleLen;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'source-over';

        // 검은 외곽. 작은 화면에서 두 번째 검이 확실히 읽히도록 기존 검보다 약간 굵게 잡는다.
        ctx.strokeStyle = 'rgba(0,0,0,0.92)';
        ctx.lineWidth = 8.4;
        ctx.beginPath();
        ctx.moveTo(guardX, guardY);
        ctx.quadraticCurveTo(handX + bx * length * 0.52 - by * curve, handY + by * length * 0.52 + bx * curve, tipX, tipY);
        ctx.stroke();

        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(220,0,0,0.72)';
        ctx.strokeStyle = 'rgba(150,8,16,0.92)';
        ctx.lineWidth = 4.8;
        ctx.beginPath();
        ctx.moveTo(guardX, guardY);
        ctx.quadraticCurveTo(handX + bx * length * 0.52 - by * (curve * 0.75), handY + by * length * 0.52 + bx * (curve * 0.75), tipX, tipY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,92,72,0.78)';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(guardX - by * 1.4, guardY + bx * 1.4);
        ctx.quadraticCurveTo(handX + bx * length * 0.50 - by * (curve * 0.34), handY + by * length * 0.50 + bx * (curve * 0.34), tipX - bx * 4, tipY - by * 4);
        ctx.stroke();

        // 칼날을 따라 흐르는 작은 붉은 기운.
        ctx.strokeStyle = 'rgba(255,30,24,0.28)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(guardX - by * 4, guardY + bx * 4);
        ctx.quadraticCurveTo(handX + bx * length * 0.42 - by * (curve + 5), handY + by * length * 0.42 + bx * (curve + 5), tipX - bx * 14, tipY - by * 14);
        ctx.stroke();

        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
        ctx.strokeStyle = line;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(handleBackX, handleBackY);
        ctx.lineTo(handX + bx * 9, handY + by * 9);
        ctx.stroke();
        ctx.strokeStyle = '#3a1715';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(handleBackX, handleBackY);
        ctx.lineTo(handX + bx * 9, handY + by * 9);
        ctx.stroke();

        ctx.strokeStyle = '#a02018';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(handX - by * 9, handY + bx * 9);
        ctx.lineTo(handX + by * 9, handY - bx * 9);
        ctx.stroke();
        ctx.restore();
    };

    const drawKasiyasPhase2AuraBack = () => {
        // 2페이즈 기본 오라: 첨부 예시처럼 몸 주변에서 아래→위로 일렁이는 검붉은 기운.
        const t = Date.now() / 300;
        const pulse = 0.5 + Math.sin(Date.now() / 180) * 0.5;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha *= 0.86;

        // 발밑에서 퍼지는 어두운 붉은 연무
        const groundGrad = ctx.createRadialGradient(0, -h * 0.08, w * 0.12, 0, -h * 0.08, w * 0.88);
        groundGrad.addColorStop(0, `rgba(255,54,34,${0.10 + pulse * 0.035})`);
        groundGrad.addColorStop(0.36, `rgba(132,0,0,${0.16 + pulse * 0.040})`);
        groundGrad.addColorStop(0.74, `rgba(22,0,0,${0.18})`);
        groundGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.06, w * 0.80, h * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();

        // 몸 뒤쪽에 넓게 깔리는 어두운 오라
        const bodyGrad = ctx.createRadialGradient(0, -h * 0.54, w * 0.16, 0, -h * 0.54, Math.max(w * 0.84, h * 0.52));
        bodyGrad.addColorStop(0, `rgba(255,58,40,${0.055 + pulse * 0.030})`);
        bodyGrad.addColorStop(0.44, `rgba(146,0,0,${0.115 + pulse * 0.025})`);
        bodyGrad.addColorStop(0.78, `rgba(42,0,0,${0.13})`);
        bodyGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.53, w * 0.74, h * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();

        // 위로 흐르는 일렁임. 일정한 직선이 아니라 좌우로 흔들리는 파형 곡선으로 표현한다.
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 0; i < 12; i++) {
            const r = i / 11;
            const side = i % 2 === 0 ? -1 : 1;
            const baseX = -w * 0.56 + r * w * 1.12;
            const sway = Math.sin(t * 1.8 + i * 0.91) * w * 0.035;
            const x0 = baseX + sway;
            const y0 = -h * (0.12 + (i % 3) * 0.030);
            const y1 = -h * (0.50 + (i % 5) * 0.080) - Math.sin(t + i) * h * 0.035;
            const midY = (y0 + y1) * 0.50;
            const strong = i % 3 === 0;
            ctx.shadowBlur = strong ? 9 : 5;
            ctx.shadowColor = strong ? 'rgba(255,40,28,0.46)' : 'rgba(120,0,0,0.36)';
            ctx.strokeStyle = strong
                ? `rgba(255,54,38,${0.18 + pulse * 0.10})`
                : `rgba(92,0,0,${0.18 + pulse * 0.06})`;
            ctx.lineWidth = Math.max(1.1, w * (strong ? 0.020 : 0.014));
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.bezierCurveTo(
                x0 + side * w * 0.10, midY + h * 0.09,
                x0 - side * w * 0.08, midY - h * 0.07,
                x0 + Math.sin(t * 1.3 + i) * w * 0.045,
                y1
            );
            ctx.stroke();
        }

        // 몸 윤곽 주변의 약한 맥동 테두리
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255,48,36,0.42)';
        ctx.strokeStyle = `rgba(255,58,44,${0.16 + pulse * 0.10})`;
        ctx.lineWidth = Math.max(2.0, w * 0.026);
        ctx.beginPath();
        ctx.moveTo(-w * 0.46, -h * 0.16);
        ctx.quadraticCurveTo(-w * 0.56, -h * 0.48, -w * 0.28, -h * 0.82);
        ctx.quadraticCurveTo(0, -h * 1.04, w * 0.30, -h * 0.82);
        ctx.quadraticCurveTo(w * 0.56, -h * 0.48, w * 0.44, -h * 0.16);
        ctx.stroke();

        ctx.restore();
    };

    const drawKasiyasPhase3AuraBack = () => {
        // 3페이즈 기본 오라: step221 방향의 날카로운 스파이크형 오라를 복구한다.
        // 얇은 선 디테일 대신, 몸 밖으로 크게 치솟는 굵은 실루엣과 검붉은/주황 그라데이션을 사용한다.
        const now = Date.now();
        const pulse = 0.5 + Math.sin(now / 125) * 0.5;

        const buildSpikeAuraPath = (scaleMul = 1) => {
            const pts = [
                [-0.58, -0.13], [-0.72, -0.32], [-0.64, -0.56], [-0.82, -0.82],
                [-0.58, -0.72], [-0.50, -1.00], [-0.34, -0.84], [-0.16, -1.16],
                [0.00, -1.30], [0.16, -1.16], [0.34, -0.84], [0.50, -1.00],
                [0.58, -0.72], [0.82, -0.82], [0.64, -0.56], [0.72, -0.32],
                [0.58, -0.13], [0.30, 0.02], [0.00, 0.08], [-0.30, 0.02]
            ];
            ctx.beginPath();
            ctx.moveTo(pts[0][0] * w * scaleMul, pts[0][1] * h * scaleMul);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * w * scaleMul, pts[i][1] * h * scaleMul);
            ctx.closePath();
        };

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha *= 0.98;

        // 발밑에는 넓은 에너지 원천만 깔고, 주요 오라는 몸 뒤로 치솟게 한다.
        const groundGrad = ctx.createRadialGradient(0, -h * 0.04, w * 0.10, 0, -h * 0.04, w * 1.08);
        groundGrad.addColorStop(0, `rgba(255,150,70,${0.15 + pulse * 0.04})`);
        groundGrad.addColorStop(0.34, `rgba(236,30,38,${0.18 + pulse * 0.05})`);
        groundGrad.addColorStop(0.70, `rgba(82,0,22,${0.20})`);
        groundGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.04, w * 1.04, h * 0.24, 0, 0, Math.PI * 2);
        ctx.fill();

        const outerGrad = ctx.createRadialGradient(0, -h * 0.62, w * 0.12, 0, -h * 0.62, Math.max(w * 1.02, h * 0.86));
        outerGrad.addColorStop(0.00, `rgba(255,244,194,${0.020 + pulse * 0.008})`);
        outerGrad.addColorStop(0.18, `rgba(255,178,82,${0.052 + pulse * 0.016})`);
        outerGrad.addColorStop(0.44, `rgba(255,78,48,${0.100 + pulse * 0.028})`);
        outerGrad.addColorStop(0.76, `rgba(120,0,26,${0.13})`);
        outerGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = outerGrad;
        buildSpikeAuraPath(1.12 + pulse * 0.018);
        ctx.fill();

        ctx.shadowBlur = 26;
        ctx.shadowColor = 'rgba(255,104,54,0.60)';
        ctx.strokeStyle = `rgba(255,214,130,${0.18 + pulse * 0.08})`;
        ctx.lineWidth = Math.max(4.6, w * 0.052);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        buildSpikeAuraPath(1.06 + pulse * 0.010);
        ctx.stroke();

        const innerGrad = ctx.createRadialGradient(0, -h * 0.58, w * 0.12, 0, -h * 0.58, Math.max(w * 0.90, h * 0.72));
        innerGrad.addColorStop(0.00, `rgba(255,242,186,${0.028 + pulse * 0.010})`);
        innerGrad.addColorStop(0.20, `rgba(255,164,74,${0.062 + pulse * 0.018})`);
        innerGrad.addColorStop(0.46, `rgba(255,66,44,${0.105 + pulse * 0.024})`);
        innerGrad.addColorStop(0.78, `rgba(112,0,24,${0.12})`);
        innerGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = innerGrad;
        buildSpikeAuraPath(0.96 + pulse * 0.010);
        ctx.fill();

        // 공간 왜곡 테마는 보조 고리로만 약하게 남긴다.
        ctx.shadowBlur = 14;
        ctx.shadowColor = 'rgba(80,140,255,0.24)';
        ctx.strokeStyle = `rgba(74,112,180,${0.07 + pulse * 0.03})`;
        ctx.lineWidth = Math.max(2.2, w * 0.024);
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.58, w * 0.64, h * 0.40, 0.16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    };


    const drawKasiyasP3GroundAuraFieldLocal = () => {
        const action = m && m.boss ? m.boss.action : null;
        const vfxKey = String(action && (action.VFX_Type || action.Effect_Render_Type) || '').trim().toUpperCase();
        const isAuraWalk = poseType === 'POSE_KASIYAS_P3_WALK_WITH_AURA' || vfxKey === 'EFT_KASIYAS_P3_WALK_WITH_AURA';
        const isAim = poseType === 'POSE_KASIYAS_P3_AIM_SWORD_PLAYER' || vfxKey === 'EFT_KASIYAS_P3_AIM_SWORD_PLAYER';
        if (!isAuraWalk && !isAim) return;

        const now = Date.now();
        const pulse = 0.5 + Math.sin(now / 110) * 0.5;
        const lateAura = isAuraWalk && String(action && action.Action_Name || '').indexOf('후반부') >= 0;
        const rx = isAuraWalk ? Math.max(w * 2.2, (parseFloat(action && action.Hitbox_Size_X) || 720) * 0.50) : w * 0.95;
        const ry = isAuraWalk ? Math.max(h * 0.26, (parseFloat(action && action.Hitbox_Size_Y) || 220) * 0.50) : h * 0.12;

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.translate(0, -h * 0.02);

        // 바닥 투영: 붉은색만 보이지 않도록 먼저 검은 압력장을 두껍게 깔아 범위를 분리한다.
        const shadowGrad = ctx.createRadialGradient(0, 0, Math.max(6, rx * 0.10), 0, 0, rx * 1.04);
        shadowGrad.addColorStop(0.00, isAuraWalk ? `rgba(0,0,0,${0.34 + pulse * 0.06})` : `rgba(20,0,0,${0.16 + pulse * 0.03})`);
        shadowGrad.addColorStop(0.36, isAuraWalk ? `rgba(8,0,0,${0.42 + pulse * 0.08})` : `rgba(70,0,0,${0.12 + pulse * 0.03})`);
        shadowGrad.addColorStop(0.72, isAuraWalk ? `rgba(0,0,0,${0.30 + pulse * 0.04})` : `rgba(20,0,0,0.08)`);
        shadowGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * 1.02, ry * 1.06, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createRadialGradient(0, 0, Math.max(8, rx * 0.08), 0, 0, rx * 1.02);
        grad.addColorStop(0.00, isAuraWalk ? `rgba(10,0,0,${0.24 + pulse * 0.08})` : `rgba(72,0,0,${0.10 + pulse * 0.03})`);
        grad.addColorStop(0.28, isAuraWalk ? `rgba(86,0,0,${0.20 + pulse * 0.05})` : `rgba(160,18,12,${0.10 + pulse * 0.04})`);
        grad.addColorStop(0.54, isAuraWalk ? `rgba(24,0,0,${0.25 + pulse * 0.05})` : `rgba(48,0,0,${0.08})`);
        grad.addColorStop(0.82, isAuraWalk ? `rgba(0,0,0,${0.22 + pulse * 0.04})` : 'rgba(0,0,0,0.02)');
        grad.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // 위험 범위 외곽선: 맵 색과 겹치지 않도록 검정/검붉은 굵은 테두리를 고정적으로 보여준다.
        ctx.globalAlpha = isAuraWalk ? 0.90 : 0.45;
        ctx.shadowBlur = isAuraWalk ? 16 : 8;
        ctx.shadowColor = 'rgba(0,0,0,0.92)';
        ctx.strokeStyle = isAuraWalk ? 'rgba(0,0,0,0.94)' : 'rgba(42,0,0,0.70)';
        ctx.lineWidth = Math.max(5, w * (isAuraWalk ? 0.055 : 0.026));
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * 0.98, ry * 0.98, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = isAuraWalk ? (lateAura ? 0.74 : 0.62) : 0.26;
        ctx.shadowBlur = isAuraWalk ? 14 : 8;
        ctx.shadowColor = 'rgba(178,0,0,0.46)';
        ctx.strokeStyle = isAuraWalk ? 'rgba(124,0,0,0.88)' : 'rgba(190,18,12,0.42)';
        ctx.lineWidth = Math.max(2.5, w * (isAuraWalk ? 0.028 : 0.014));
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * 0.93, ry * 0.92, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 발산 파동: 검은 압력장 위에 붉은 파동이 안쪽에서 맥동하도록 한다.
        ctx.lineCap = 'round';
        for (let i = 0; i < (isAuraWalk ? 4 : 1); i++) {
            const t = ((now / (420 + i * 105)) + i * 0.23) % 1;
            const rr = 0.24 + t * 0.76;
            ctx.globalAlpha = (1 - t) * (isAuraWalk ? (lateAura ? 0.55 : 0.46) : 0.22);
            ctx.shadowBlur = 10;
            ctx.shadowColor = i % 2 ? 'rgba(190,0,0,0.46)' : 'rgba(0,0,0,0.75)';
            ctx.strokeStyle = i % 2 ? 'rgba(190,18,12,0.72)' : 'rgba(0,0,0,0.86)';
            ctx.lineWidth = Math.max(2.2, w * (i % 2 ? 0.018 : 0.024));
            ctx.beginPath();
            ctx.ellipse(0, 0, rx * rr, ry * (0.82 + t * 0.24), 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (isAuraWalk) {
            // 지면 압박감: 작은 돌멩이/먼지가 검은 오라에 흔들리는 느낌을 유지한다.
            ctx.globalAlpha = 0.42 + pulse * 0.16;
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(0,0,0,0.80)';
            for (let i = 0; i < 15; i++) {
                const a = (i / 15) * Math.PI * 2 + now / 900;
                const px = Math.cos(a) * rx * (0.16 + (i % 5) * 0.12);
                const py = Math.sin(a) * ry * (0.34 + (i % 4) * 0.14);
                const lift = Math.sin(now / 92 + i) * (3.5 + (i % 3));
                ctx.fillStyle = i % 3 === 0 ? 'rgba(8,4,4,0.88)' : 'rgba(38,8,6,0.72)';
                ctx.beginPath();
                ctx.ellipse(px, py - 4 - lift, 2.6 + (i % 3), 1.8 + (i % 2), 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    };

    const drawMane = (cx, cy, r) => {
        // 뒤로 퍼지는 거대한 노란 갈기. 복잡한 머리카락 디테일 대신 과장된 뾰족 실루엣을 우선한다.
        const spikes = [
            [-1.12, -0.10, -1.95, -0.76, -0.88, -0.42, hairDark],
            [-0.88, -0.40, -1.32, -1.62, -0.42, -0.74, hairMid],
            [-0.45, -0.72, -0.68, -2.20, -0.05, -0.92, hairLight],
            [-0.08, -0.82, 0.04, -2.35, 0.30, -0.86, hairLight],
            [0.20, -0.72, 0.84, -2.00, 0.58, -0.56, hairMid],
            [0.48, -0.45, 1.44, -1.34, 0.82, -0.24, hairMid],
            [0.66, -0.22, 1.72, -0.66, 0.86, 0.10, hairDark],
            [0.50, 0.06, 1.34, 0.30, 0.54, 0.36, hairDark],
            [-0.58, -0.12, -1.34, 0.26, -0.38, 0.30, hairMid]
        ];

        ctx.save();
        ctx.strokeStyle = line;
        ctx.lineWidth = 1.7;
        ctx.lineJoin = 'round';
        for (const s of spikes) {
            ctx.fillStyle = s[6];
            ctx.beginPath();
            ctx.moveTo(cx + s[0] * r, cy + s[1] * r);
            ctx.lineTo(cx + s[2] * r, cy + s[3] * r);
            ctx.lineTo(cx + s[4] * r, cy + s[5] * r);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(255,235,160,0.55)';
        ctx.lineWidth = 1.2;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * r * 0.18, cy - r * 0.82);
            ctx.lineTo(cx + i * r * 0.26 + r * 0.30, cy - r * 0.10);
            ctx.stroke();
        }
        ctx.restore();
    };

    ctx.save();
    ctx.scale(face, 1);
    if (poseType === 'POSE_P1_GROGGY') ctx.translate(0, h * 0.10);
    if (poseType === 'POSE_P2_GROGGY') ctx.translate(0, h * 0.14);
    if (poseType === 'POSE_P2_SWORD_STORM_SPAWN_READY' || poseType === 'POSE_P2_SWORD_STORM_SPAWN' || poseType === 'POSE_P2_SWORD_STORM_SPAWN_TO_DEFAULT') ctx.translate(0, h * 0.045 * (poseType === 'POSE_P2_SWORD_STORM_SPAWN_TO_DEFAULT' ? (1 - smooth) : 1));
    if (poseType === 'POSE_P2_ONI_STANCE') ctx.translate(0, h * 0.070);
    if (poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_DEFENCE_READY' || poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_SPIN') ctx.translate(0, h * 0.035);
    if (poseType === 'POSE_P2_ONI_SLASH') ctx.translate(0, h * 0.055);
    if (isRush) ctx.translate(w * 0.07 * attackPulse, 0);
    ctx.rotate(bodyLean * (0.45 + attackPulse * 0.55));

    // 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.02, w * 0.50, h * 0.055, 0, 0, Math.PI * 2);
    ctx.fill();

    drawKasiyasP3GroundAuraFieldLocal();

    if (isKasiyasPhase2) {
        drawKasiyasPhase2AuraBack();
    } else if (isKasiyasPhase3) {
        drawKasiyasPhase3AuraBack();
    }

    // 다리와 발. 맨발 느낌을 작게 남기고 위에 갑주판을 덮는다.
    drawLimb(-w * 0.16, -h * 0.33, -w * 0.28, -h * 0.04, w * 0.12, skinDark);
    drawLimb(w * 0.18, -h * 0.33, w * 0.28, -h * 0.04, w * 0.12, skinDark);
    ctx.fillStyle = skinDark;
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-w * 0.31, -h * 0.01, w * 0.12, h * 0.026, -0.18, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(w * 0.31, -h * 0.01, w * 0.12, h * 0.026, 0.18, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    if (poseType === 'POSE_P2_GROGGY') {
        // 2페이즈 그로기: 무릎을 꿇고 양팔을 벌려 두 검을 지면에 꽂은 실루엣.
        drawPlate([[-w * 0.50, -h * 0.28], [-w * 0.15, -h * 0.35], [-w * 0.03, -h * 0.17], [-w * 0.40, -h * 0.08]], '#6f2e2c', line, 1.7);
        drawPlate([[w * 0.15, -h * 0.35], [w * 0.50, -h * 0.28], [w * 0.40, -h * 0.08], [w * 0.03, -h * 0.17]], '#6f2e2c', line, 1.7);
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.01, w * 0.58, h * 0.045, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 하카마/갑주 하반신: 초록 천 + 붉은 무사 갑주판으로 읽히게 한다.
    drawPlate([
        [-w * 0.36, -h * 0.52], [w * 0.33, -h * 0.52], [w * 0.44, -h * 0.19],
        [w * 0.18, -h * 0.12], [0, -h * 0.22], [-w * 0.18, -h * 0.12], [-w * 0.45, -h * 0.19]
    ], clothGreen, line, 2);

    drawPlate([[-w * 0.38, -h * 0.49], [-w * 0.13, -h * 0.48], [-w * 0.17, -h * 0.14], [-w * 0.42, -h * 0.20]], redArmor, line, 1.6);
    drawPlate([[w * 0.13, -h * 0.48], [w * 0.38, -h * 0.49], [w * 0.42, -h * 0.20], [w * 0.17, -h * 0.14]], redArmor, line, 1.6);
    ctx.strokeStyle = redArmorLight;
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) {
        const yy = -h * (0.42 - i * 0.085);
        ctx.beginPath(); ctx.moveTo(-w * 0.35, yy); ctx.lineTo(-w * 0.17, yy + h * 0.015); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w * 0.17, yy + h * 0.015); ctx.lineTo(w * 0.35, yy); ctx.stroke();
    }

    // 허리띠와 칼집 느낌의 어두운 장식.
    drawPlate([[-w * 0.38, -h * 0.55], [w * 0.36, -h * 0.55], [w * 0.34, -h * 0.50], [-w * 0.36, -h * 0.50]], '#b78a42', line, 1.5);
    ctx.save();
    ctx.rotate(-0.15);
    drawPlate([[w * 0.06, -h * 0.50], [w * 0.62, -h * 0.56], [w * 0.64, -h * 0.50], [w * 0.08, -h * 0.43]], '#1e2630', line, 1.5);
    ctx.restore();

    // 노출된 상체. 검은 갑옷이 아니라 보라빛 피부와 문양으로 카시야스 느낌을 우선한다.
    ctx.fillStyle = skinBase;
    ctx.strokeStyle = line;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.30, -h * 0.82);
    ctx.quadraticCurveTo(0, -h * 0.88, w * 0.32, -h * 0.80);
    ctx.lineTo(w * 0.25, -h * 0.53);
    ctx.quadraticCurveTo(0, -h * 0.45, -w * 0.27, -h * 0.53);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(91,48,71,0.70)';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-w * 0.13, -h * 0.70);
    ctx.quadraticCurveTo(0, -h * 0.62, w * 0.13, -h * 0.70);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-w * 0.08, -h * 0.58);
    ctx.quadraticCurveTo(w * 0.04, -h * 0.53, w * 0.15, -h * 0.59);
    ctx.stroke();

    // 붉은 구슬 장식과 어깨 천.
    ctx.fillStyle = beadRed;
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.5;
    for (const [bx, by, rr] of [[-0.24, -0.76, 0.055], [0.26, -0.74, 0.060], [0.03, -0.80, 0.050]]) {
        ctx.beginPath();
        ctx.arc(w * bx, h * by, w * rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    if (isKasiyasPhase2) {
        // 2페이즈 표시용 붉은 갑주/문양. 과하지 않게 유지하되, 상체가 살짝 측면을 향한 실루엣으로 읽히게 한다.
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(255,58,44,0.34)';
        ctx.lineWidth = Math.max(1.5, w * 0.026);
        ctx.beginPath();
        ctx.moveTo(-w * 0.22, -h * 0.72);
        ctx.quadraticCurveTo(-w * 0.02, -h * 0.66, w * 0.18, -h * 0.76);
        ctx.moveTo(-w * 0.10, -h * 0.80);
        ctx.quadraticCurveTo(w * 0.00, -h * 0.70, w * 0.12, -h * 0.60);
        ctx.stroke();
        ctx.restore();
    } else if (isKasiyasPhase3) {
        // 3페이즈 표시용 공간 균열 문양. 2페이즈 붉은 갑주와 구분되도록 보라/검정 균열선을 상체에 남긴다.
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const crackPulse = 0.5 + Math.sin(Date.now() / 120) * 0.5;
        ctx.strokeStyle = `rgba(205,116,255,${0.28 + crackPulse * 0.16})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(175,80,255,0.50)';
        ctx.lineWidth = Math.max(1.4, w * 0.022);
        ctx.beginPath();
        ctx.moveTo(-w * 0.20, -h * 0.77);
        ctx.lineTo(-w * 0.04, -h * 0.67);
        ctx.lineTo(-w * 0.13, -h * 0.56);
        ctx.moveTo(w * 0.22, -h * 0.76);
        ctx.lineTo(w * 0.05, -h * 0.64);
        ctx.lineTo(w * 0.18, -h * 0.55);
        ctx.moveTo(-w * 0.04, -h * 0.80);
        ctx.quadraticCurveTo(w * 0.02, -h * 0.68, w * 0.08, -h * 0.58);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,48,56,${0.16 + crackPulse * 0.10})`;
        ctx.lineWidth = Math.max(1.0, w * 0.015);
        ctx.beginPath();
        ctx.moveTo(-w * 0.16, -h * 0.61);
        ctx.lineTo(w * 0.16, -h * 0.70);
        ctx.stroke();
        ctx.restore();
    }

    // 뒤쪽 이형 팔. 전환 컷신에서는 모델 자체의 팔이 검 없는 쪽으로 뻗고,
    // 2페이즈 기본 자세에서는 양손의 검을 좌우로 펼쳐 든다.
    if (isP1ToP2TransitionCutscene && !transitionUseP2Model) {
        const extendT = Math.max(0, Math.min(1, (transitionTimer - 1.0) / 1.4));
        const easedExtend = extendT * extendT * (3 - 2 * extendT);
        const offShoulderX = -w * 0.26;
        const offShoulderY = -h * 0.73;
        const offElbowX = -w * (0.36 + 0.18 * easedExtend);
        const offElbowY = -h * (0.60 + 0.02 * easedExtend);
        const offHandX = -w * (0.42 + 0.34 * easedExtend);
        const offHandY = -h * (0.46 + 0.05 * easedExtend);
        drawLimb(offShoulderX, offShoulderY, offElbowX, offElbowY, w * 0.12, skinDark);
        drawLimb(offElbowX, offElbowY, offHandX, offHandY, w * 0.11, skinDark);
        drawClawHand(offHandX, offHandY, w * 0.16, -1);
        if (transitionGrabProgress > 0.02) {
            // 검을 잡은 직후에는 손에 같은 디자인의 검이 잠시 붙어 보이게 한다.
            drawKatana(offHandX - w * 0.02, offHandY + h * 0.01, 2.46, h * (0.58 + 0.28 * transitionGrabProgress), 20, 5);
        }
    } else if (isKasiyasPhase2) {
        const offShoulderX = -w * 0.26;
        const offShoulderY = -h * 0.72;
        let offElbowX = -w * 0.40;
        let offElbowY = -h * 0.56;
        let offHandX = -w * 0.42;
        let offHandY = -h * 0.46;
        let offSwordAngle = 2.46;
        let offSwordLen = h * 0.86;
        let offCurve = 6;

        if (poseType === 'POSE_P2_GROGGY') {
            // 2페이즈 그로기: 팔을 벌린 채 왼손 검을 지면에 꽂고 버티는 자세.
            offElbowX = -w * 0.48;
            offElbowY = -h * 0.42;
            offHandX = -w * 0.56;
            offHandY = -h * 0.17;
            offSwordAngle = 1.68;
            offSwordLen = h * 0.82;
            offCurve = 1;
        } else if (poseType === 'POSE_P2_LEFT_SWORD_SLASH_DOWN') {
            offElbowX = -w * 0.28;
            offElbowY = -h * (0.76 - 0.12 * smooth);
            offHandX = -w * (0.30 - 0.10 * smooth);
            offHandY = -h * (0.78 - 0.34 * smooth);
            offSwordAngle = -1.16 + smooth * 2.44;
            offSwordLen = h * 0.94;
            offCurve = 8;
        } else if (poseType === 'POSE_P2_LEFT_SWORD_DIAGONAL_SLASH') {
            offElbowX = -w * (0.34 - 0.08 * smooth);
            offElbowY = -h * (0.68 - 0.16 * smooth);
            offHandX = -w * (0.48 - 0.30 * smooth);
            offHandY = -h * (0.58 - 0.04 * smooth);
            offSwordAngle = -0.95 + smooth * 1.56;
            offSwordLen = h * 0.92;
            offCurve = 5;
        } else if (poseType === 'POSE_P2_DOUBLE_SWORD_CROSS_SLASH') {
            offElbowX = -w * (0.46 - 0.20 * smooth);
            offElbowY = -h * (0.58 - 0.08 * smooth);
            offHandX = -w * (0.50 - 0.44 * smooth);
            offHandY = -h * (0.44 + 0.12 * smooth);
            offSwordAngle = 2.36 - smooth * 1.58;
            offSwordLen = h * 1.00;
            offCurve = 5;
        } else if (poseType === 'POSE_P2_DOUBLE_SWORD_UP_DOWN_SLASH') {
            offElbowX = -w * (0.34 - 0.12 * smooth);
            offElbowY = -h * (0.76 - 0.20 * smooth);
            offHandX = -w * (0.34 - 0.18 * smooth);
            offHandY = -h * (0.74 - 0.38 * smooth);
            offSwordAngle = -1.18 + smooth * 2.35;
            offSwordLen = h * 0.96;
            offCurve = 7;
        } else if (poseType === 'POSE_P2_M1_LEFT_INWARD_SLASH') {
            offElbowX = -w * (0.54 - 0.26 * smooth);
            offElbowY = -h * (0.60 - 0.06 * attackPulse);
            offHandX = -w * (0.76 - 0.60 * smooth);
            offHandY = -h * (0.54 - 0.02 * attackPulse + 0.10 * smooth);
            offSwordAngle = -0.72 + smooth * 1.45;
            offSwordLen = h * 1.04;
            offCurve = 5;
        } else if (poseType === 'POSE_P2_M1_RIGHT_INWARD_SLASH') {
            offElbowX = -w * 0.42;
            offElbowY = -h * 0.58;
            offHandX = -w * 0.48;
            offHandY = -h * 0.48;
            offSwordAngle = 2.46;
            offSwordLen = h * 0.90;
            offCurve = 6;
        } else if (poseType === 'POSE_P2_M1_X_SLASH_READY') {
            // 최종 X자 준비: 손잡이는 좌우로 벌리고, 검신만 머리 위쪽에서 X자로 교차한다.
            offElbowX = -w * 0.58;
            offElbowY = -h * 0.88;
            offHandX = -w * 0.46;
            offHandY = -h * 1.04;
            offSwordAngle = -0.74;
            offSwordLen = h * 1.12;
            offCurve = 4;
        } else if (poseType === 'POSE_P2_M1_X_SLASH') {
            offElbowX = -w * (0.58 - 0.05 * smooth);
            offElbowY = -h * (0.78 - 0.12 * smooth);
            offHandX = -w * (0.42 + 0.28 * smooth);
            offHandY = -h * (1.00 - 0.54 * smooth);
            offSwordAngle = 0.96 + smooth * 1.92;
            offSwordLen = h * 1.10;
            offCurve = 4;
        } else if (poseType === 'POSE_P2_CHARGE_ENERGY') {
            offElbowX = -w * 0.34;
            offElbowY = -h * 0.60;
            offHandX = -w * 0.34;
            offHandY = -h * 0.48;
            offSwordAngle = 2.18;
            offSwordLen = h * 0.84;
        } else if (poseType === 'POSE_P2_SWORD_STORM_SPAWN_READY') {
            // 회오리 검풍 준비: 자세를 낮추고, 보조 검을 왼쪽으로 크게 펼쳐 폭풍을 모은다.
            offElbowX = -w * 0.45;
            offElbowY = -h * 0.64;
            offHandX = -w * 0.72;
            offHandY = -h * 0.51;
            offSwordAngle = 3.02;
            offSwordLen = h * 0.96;
            offCurve = 4;
        } else if (poseType === 'POSE_P2_SWORD_STORM_SPAWN') {
            // 소환: 낮은 자세를 유지한 채 양검을 좌우로 펼치고, 가벼운 회전으로 검풍을 밀어낸다.
            offElbowX = -w * (0.50 - 0.08 * attackPulse);
            offElbowY = -h * (0.62 - 0.05 * attackPulse);
            offHandX = -w * (0.76 - 0.14 * smooth);
            offHandY = -h * (0.50 + 0.04 * Math.sin(progress * Math.PI * 2));
            offSwordAngle = 3.02 - attackPulse * 0.36;
            offSwordLen = h * 1.00;
            offCurve = 4;
        } else if (poseType === 'POSE_P2_SWORD_STORM_SPAWN_TO_DEFAULT') {
            // 회오리 검풍 소환 직후 복귀: 펼쳐 둔 보조 검과 팔을 자연스럽게 기본 이도류 자세로 내린다.
            const t = smooth;
            offElbowX = -w * ((0.50 - 0.08 * attackPulse) * (1 - t) + 0.40 * t);
            offElbowY = -h * ((0.62 - 0.05 * attackPulse) * (1 - t) + 0.56 * t);
            offHandX = -w * ((0.76 - 0.14 * t) * (1 - t) + 0.42 * t);
            offHandY = -h * ((0.50 + 0.02 * Math.sin(progress * Math.PI * 2)) * (1 - t) + 0.46 * t);
            offSwordAngle = (3.02 - attackPulse * 0.18) * (1 - t) + 2.46 * t;
            offSwordLen = h * (1.00 * (1 - t) + 0.86 * t);
            offCurve = 4 + 2 * t;
        } else if (poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_DEFENCE_READY') {
            // 보조 손도 몸을 가로질러 전방 세로축 양날검을 함께 잡는다.
            offElbowX = -w * 0.03;
            offElbowY = -h * 0.62;
            offHandX = w * 0.20;
            offHandY = -h * 0.64;
            offSwordAngle = 1.58;
            offSwordLen = h * 0.78;
            offCurve = 2;
        } else if (poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_SPIN') {
            offElbowX = -w * (0.02 + 0.01 * attackPulse);
            offElbowY = -h * (0.62 + 0.012 * Math.sin(progress * Math.PI * 8));
            offHandX = w * (0.21 + 0.015 * attackPulse);
            offHandY = -h * (0.64 + 0.014 * Math.sin(progress * Math.PI * 10));
            offSwordAngle = 1.57 + Math.sin(progress * Math.PI * 12) * 0.045;
            offSwordLen = h * 0.82;
            offCurve = 2;
        } else if (poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_TO_DEFAULT') {
            const t = smooth;
            offElbowX = w * (-0.02 * (1 - t)) - w * (0.40 * t);
            offElbowY = -h * (0.62 * (1 - t) + 0.56 * t);
            offHandX = w * (0.21 * (1 - t)) - w * (0.42 * t);
            offHandY = -h * (0.64 * (1 - t) + 0.46 * t);
            offSwordAngle = 1.57 * (1 - t) + 2.46 * t;
            offSwordLen = h * (0.82 * (1 - t) + 0.86 * t);
            offCurve = 2 + 4 * t;
        } else if (poseType === 'POSE_P2_SUMMON_DIMENSION_PORTAL') {
            offElbowX = -w * 0.36;
            offElbowY = -h * 0.72;
            offHandX = -w * 0.18;
            offHandY = -h * 0.82;
            offSwordAngle = -1.86;
            offSwordLen = h * 0.98;
            offCurve = 5;
        } else if (poseType === 'POSE_P2_ONI_STANCE') {
            offElbowX = -w * 0.38;
            offElbowY = -h * 0.50;
            offHandX = -w * 0.28;
            offHandY = -h * 0.42;
            offSwordAngle = -1.53;
            offSwordLen = h * 0.92;
            offCurve = 3;
        } else if (poseType === 'POSE_P2_ONI_SLASH') {
            offElbowX = -w * (0.54 + 0.08 * attackPulse);
            offElbowY = -h * (0.58 - 0.03 * attackPulse);
            offHandX = -w * (0.78 + 0.06 * attackPulse);
            offHandY = -h * 0.50;
            offSwordAngle = 3.05;
            offSwordLen = h * 1.04;
            offCurve = 4;
        }

        drawLimb(offShoulderX, offShoulderY, offElbowX, offElbowY, w * 0.12, skinDark);
        drawLimb(offElbowX, offElbowY, offHandX, offHandY, w * 0.11, skinDark);
        drawClawHand(offHandX, offHandY, w * 0.15, -1);
        if (!isP2BareHandPose && !isP2DoubleEdgedPose && !suppressP2SwordsForP3Transition) {
            drawKatana(offHandX - w * 0.02, offHandY + h * 0.01, offSwordAngle, offSwordLen, 22, offCurve, p2M1SwordEnergyActive ? 'RED' : '');
        }
    } else if (isKasiyasPhase3) {
        // 3페이즈: 보조 손도 검 손잡이 위에 정확히 겹쳐 보이도록 상체 쪽으로 올린다.
        const offShoulderX = -w * 0.27;
        const offShoulderY = -h * 0.72;
        let offElbowX = -w * 0.01;
        let offElbowY = -h * 0.60;
        let offHandX = w * 0.12;
        let offHandY = -h * 0.55;

        if (isP2ToP3TransitionCutscene) {
            if (transitionTimer < 2.05) {
                // 새 검을 부르기 전: 비어 있는 손을 위로 뻗을 준비.
                offElbowX = -w * 0.10;
                offElbowY = -h * 0.58;
                offHandX = w * 0.02;
                offHandY = -h * 0.48;
            } else if (transitionTimer < 3.70) {
                // 위쪽 차원에서 검을 끌어내리는 동안 보조 손은 몸 중앙에서 균형을 잡는다.
                offElbowX = -w * 0.16;
                offElbowY = -h * 0.56;
                offHandX = w * 0.04;
                offHandY = -h * 0.50;
            } else if (transitionTimer < 4.95) {
                // 검을 시험하는 횡베기 동안은 보조 손을 내려 한손 동작처럼 보이게 한다.
                offElbowX = -w * 0.24;
                offElbowY = -h * 0.54;
                offHandX = -w * 0.08;
                offHandY = -h * 0.40;
            }
        } else if (poseType === 'POSE_KASIYAS_P3_CAST_EXTEND_HAND') {
            // 귀면족의 저주 부여: 플레이어를 향해 검을 겨누는 자세.
            offElbowX = w * 0.16;
            offElbowY = -h * 0.62;
            offHandX = w * (0.46 + 0.03 * attackPulse);
            offHandY = -h * (0.62 + 0.01 * attackPulse);
        } else if (poseType === 'POSE_KASIYAS_P3_AIM_SWORD_PLAYER') {
            offElbowX = -w * 0.04;
            offElbowY = -h * 0.62;
            offHandX = w * 0.08;
            offHandY = -h * 0.58;
        } else if (poseType === 'POSE_KASIYAS_P3_WALK_WITH_AURA') {
            offElbowX = -w * 0.10;
            offElbowY = -h * 0.57;
            offHandX = w * 0.10;
            offHandY = -h * 0.53;
        } else if (poseType === 'POSE_KASIYAS_P3_DASH_SLASH') {
            offElbowX = -w * 0.18;
            offElbowY = -h * 0.58;
            offHandX = w * (0.00 + 0.24 * smooth);
            offHandY = -h * (0.55 - 0.03 * attackPulse);
        } else if (poseType === 'POSE_KASIYAS_P3_SLAM_THE_SWORD_DOWN') {
            const slamT = Math.max(0, Math.min(1, smooth));
            offElbowX = -w * 0.08;
            offElbowY = -h * (0.82 - 0.28 * slamT);
            offHandX = w * (0.10 + 0.02 * attackPulse);
            offHandY = -h * (0.96 - 0.54 * slamT);
        } else if (poseType === 'POSE_KASIYAS_P3_ATK_ROAR') {
            offElbowX = -w * (0.34 + 0.05 * attackPulse);
            offElbowY = -h * 0.70;
            offHandX = -w * (0.56 + 0.04 * attackPulse);
            offHandY = -h * (0.64 - 0.04 * attackPulse);
        } else if (poseType === 'POSE_KASIYAS_P3_M1_FINAL_SLASH_CHARGE' || poseType === 'POSE_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH') {
            offElbowX = -w * 0.10;
            offElbowY = -h * 0.78;
            offHandX = w * (0.02 + 0.08 * smooth);
            offHandY = -h * (0.88 - 0.22 * smooth);
        } else if (poseType === 'POSE_KASIYAS_P3_M2_HAND_TO_SKY') {
            offElbowX = -w * 0.18;
            offElbowY = -h * 0.66;
            offHandX = w * 0.00;
            offHandY = -h * 0.94;
        } else if (poseType === 'POSE_KASIYAS_P3_M2_JUMP_TO_SKY' || poseType === 'POSE_KASIYAS_P3_M2_AIRBORNE_HOLD') {
            offElbowX = -w * 0.10;
            offElbowY = -h * 0.64;
            offHandX = w * 0.05;
            offHandY = -h * 0.78;
        } else if (poseType === 'POSE_KASIYAS_P3_M2_OVERHEAD_STRIKE') {
            offElbowX = -w * 0.02;
            offElbowY = -h * 0.82;
            offHandX = w * 0.10;
            offHandY = -h * 0.96;
        } else if (poseType === 'POSE_KASIYAS_P3_M2_FINAL_SLASH_CHARGE' || poseType === 'POSE_KASIYAS_P3_M2_FINAL_SLASH') {
            offElbowX = -w * 0.08;
            offElbowY = -h * 0.76;
            offHandX = w * 0.04;
            offHandY = -h * 0.88;
        } else if (poseType === 'POSE_KASIYAS_P3_HORIZONTAL_SLASH' || poseType === 'POSE_KASIYAS_P3_SLASH_UP' || poseType === 'POSE_KASIYAS_P3_JUMP') {
            offElbowX = -w * 0.12;
            offElbowY = -h * 0.56;
            offHandX = w * (0.02 + 0.20 * smooth);
            offHandY = -h * (0.54 - 0.02 * attackPulse);
        } else if (poseType === 'POSE_KASIYAS_P3_AIR_SLASH_DOWN') {
            // 공중 내려베기: 액션 전반부에 공중에서 지면으로 떨어지며 검을 내리꽂고,
            // 후반부에는 착지한 낮은 자세로 검을 누르는 실루엣을 유지한다.
            const airDownT = Math.max(0, Math.min(1, smooth * 2.0));
            const airHoldT = Math.max(0, Math.min(1, (smooth - 0.50) * 2.0));
            offElbowX = -w * (0.16 - 0.08 * airDownT + 0.02 * airHoldT);
            offElbowY = -h * (0.86 - 0.34 * airDownT + 0.03 * airHoldT);
            offHandX = w * (0.02 + 0.10 * airDownT - 0.02 * airHoldT);
            offHandY = -h * (0.98 - 0.56 * airDownT + 0.04 * airHoldT);
        } else if (poseType === 'POSE_KASIYAS_P3_SLASH_DOWN' || poseType === 'POSE_KASIYAS_P3_DIAGONAL_SLASH' || poseType === 'POSE_KASIYAS_P3_AURA_CUT_OFF_SLASH') {
            offElbowX = -w * 0.04;
            offElbowY = -h * 0.66;
            offHandX = w * 0.14;
            offHandY = -h * 0.66;
        } else if (poseType === 'POSE_KASIYAS_P3_SWORD_WAVE_CAST_SLASH') {
            offElbowX = -w * 0.12;
            offElbowY = -h * 0.76;
            offHandX = w * 0.02;
            offHandY = -h * 0.82;
        } else if (poseType === 'POSE_KASIYAS_P3_CAST_DIMENSION_CRACK_SLASH') {
            offElbowX = -w * 0.18;
            offElbowY = -h * (0.72 - 0.08 * smooth);
            offHandX = w * (0.00 + 0.24 * smooth);
            offHandY = -h * (0.86 - 0.30 * smooth);
        } else if (poseType === 'POSE_KASIYAS_P3_RUSH_SLASH_CHARGE') {
            offElbowX = -w * 0.20;
            offElbowY = -h * 0.62;
            offHandX = w * 0.00;
            offHandY = -h * 0.62;
        } else if (poseType === 'POSE_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH') {
            offElbowX = -w * 0.02;
            offElbowY = -h * 0.78;
            offHandX = w * 0.24;
            offHandY = -h * 0.86;
        } else if (poseType === 'POSE_KASIYAS_P3_WARP') {
            offElbowX = -w * 0.06;
            offElbowY = -h * 0.62;
            offHandX = w * 0.12;
            offHandY = -h * 0.60;
        } else if (poseType === 'POSE_KASIYAS_P3_DASH') {
            offElbowX = -w * 0.08;
            offElbowY = -h * 0.60;
            offHandX = w * 0.16;
            offHandY = -h * 0.58;
        }

        drawLimb(offShoulderX, offShoulderY, offElbowX, offElbowY, w * 0.12, skinDark);
        drawLimb(offElbowX, offElbowY, offHandX, offHandY, w * 0.11, skinDark);
        drawClawHand(offHandX, offHandY, w * 0.14, -1);
    } else {
        // 1페이즈: 큰 손과 날카로운 손톱만 읽히게 간결화.
        drawLimb(-w * 0.27, -h * 0.74, -w * 0.47, -h * 0.58, w * 0.13, skinDark);
        drawLimb(-w * 0.47, -h * 0.58, -w * 0.39, -h * 0.40, w * 0.13, skinDark);
        drawClawHand(-w * 0.39, -h * 0.40, w * 0.24, -1);
    }

    // 앞 팔과 내장형 일본도: 1페이즈는 한 손에 든 하나의 검만 사용한다.
    // 보조 팔은 위에서 이미 그렸고, 공격 포즈에서 팔을 추가로 복제하지 않는다.
    const shoulderFrontX = w * 0.28;
    const shoulderY = -h * 0.72;
    let handX = w * 0.34;
    let handY = -h * 0.53;
    let swordAngle = -0.42;
    let swordLen = h * 0.78;
    let curve = 8;

    if (poseType === 'POSE_P1_GROGGY') {
        handX = w * 0.22;
        handY = -h * 0.36;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.12, skinBase);
        drawClawHand(handX, handY, w * 0.14, 1);
        // 검을 바닥에 꽂고 기대며 살짝 주저앉은 실루엣.
        drawKatana(handX + w * 0.05, -h * 0.38, 1.42, h * 0.70, 16, 2);
        drawPlate([[-w * 0.30, -h * 0.31], [w * 0.18, -h * 0.28], [w * 0.24, -h * 0.17], [-w * 0.20, -h * 0.16]], skinDark, line, 1.5);
        ctx.save();
        ctx.strokeStyle = 'rgba(255,225,100,0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(handX + w * 0.12, -h * 0.06);
        ctx.lineTo(handX + w * 0.20, h * 0.02);
        ctx.stroke();
        ctx.restore();
    } else if (poseType === 'POSE_SHOULDER_ATK') {
        handX = w * (0.06 + 0.05 * attackPulse);
        handY = -h * (0.52 - 0.02 * attackPulse);
        // 차지 크래시처럼 상체와 어깨가 먼저 밀고 들어가는 실루엣.
        // 팔/주먹을 강조하지 않고 어깨, 뿔, 몸통의 전방 압박을 크게 보이게 한다.
        drawLimb(shoulderFrontX - w * 0.03, shoulderY + h * 0.02, w * 0.24, -h * 0.59, w * 0.13, skinBase);
        drawClawHand(w * 0.20, -h * 0.57, w * 0.13, 1);
        drawKatana(handX, -h * 0.37, 0.30, h * 0.48, 18, 5);

        ctx.save();
        ctx.scale(1, 1);
        ctx.fillStyle = 'rgba(150,70,68,0.42)';
        ctx.strokeStyle = 'rgba(18,0,0,0.82)';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(w * 0.34, -h * 0.70, w * 0.24, h * 0.13, -0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,86,62,0.55)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(w * 0.08, -h * 0.80);
        ctx.lineTo(w * 0.52, -h * 0.70);
        ctx.moveTo(w * 0.06, -h * 0.65);
        ctx.lineTo(w * 0.48, -h * 0.59);
        ctx.stroke();
        ctx.restore();
    } else if (poseType === 'POSE_FIST_BUMPING') {
        handX = w * (0.50 + 0.08 * attackPulse);
        handY = -h * 0.60;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.13, skinBase);
        drawClawHand(handX + w * 0.03, handY, w * 0.22, 1);
        drawKatana(w * 0.16, -h * 0.43, 0.38, h * 0.54, 18, 4);
    } else if (poseType === 'POSE_STOMP') {
        handX = w * 0.28;
        handY = -h * 0.54;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, -0.30, h * 0.70, 20, 7);
        // 발 내려찍기 준비: 한쪽 다리를 들어올린 듯한 짧은 실루엣 보강.
        drawPlate([[w * 0.08, -h * 0.27], [w * 0.28, -h * 0.22], [w * 0.22, -h * 0.11], [w * 0.04, -h * 0.16]], skinDark, line, 1.6);
    } else if (poseType === 'POSE_P1_M3_LOW_RUSH_READY') {
        // 대형 패턴 3번 돌진 전조: 자세를 낮추고 검을 뒤로 빼며 지면을 박차기 직전의 실루엣.
        const coil = 0.5 + Math.sin(Date.now() / 90) * 0.5;
        handX = -w * (0.30 + 0.04 * coil);
        handY = -h * (0.36 + 0.02 * coil);
        swordAngle = 0.22;
        swordLen = h * 1.10;
        curve = 4;
        drawLimb(shoulderFrontX - w * 0.08, shoulderY + h * 0.08, handX, handY, w * 0.13, skinBase);
        drawClawHand(handX, handY, w * 0.16, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 18, curve);
        drawPlate([[-w * 0.34, -h * 0.36], [w * 0.28, -h * 0.33], [w * 0.34, -h * 0.22], [-w * 0.24, -h * 0.20]], skinDark, line, 1.6);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,68,52,${0.25 + coil * 0.20})`;
        ctx.lineWidth = Math.max(2, w * 0.030);
        ctx.beginPath();
        ctx.moveTo(-w * 0.55, -h * 0.30);
        ctx.lineTo(w * 0.34, -h * 0.36);
        ctx.moveTo(-w * 0.48, -h * 0.20);
        ctx.lineTo(w * 0.22, -h * 0.23);
        ctx.stroke();
        ctx.restore();
    } else if (poseType === 'POSE_P1_M3_LOW_RUSH') {
        // 대형 패턴 3번 돌진 발도: 서서 베는 모션이 아니라 낮은 자세로 파고들며 검을 끌고 지나간다.
        const rushT = Math.max(0, Math.min(1, progress));
        const snap = rushT < 0.45 ? rushT / 0.45 : 1;
        handX = w * (0.18 + 0.42 * snap);
        handY = -h * (0.34 + 0.04 * attackPulse);
        swordAngle = -0.02;
        swordLen = h * 1.18;
        curve = 3;
        drawLimb(shoulderFrontX - w * 0.08, shoulderY + h * 0.09, handX, handY, w * 0.13, skinBase);
        drawClawHand(handX, handY, w * 0.16, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 18, curve);
        drawPlate([[-w * 0.38, -h * 0.34], [w * 0.30, -h * 0.32], [w * 0.40, -h * 0.20], [-w * 0.22, -h * 0.18]], skinDark, line, 1.6);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,42,36,${0.34 + attackPulse * 0.22})`;
        ctx.lineWidth = Math.max(2.2, w * 0.034);
        ctx.beginPath();
        ctx.moveTo(-w * 0.58, -h * 0.28);
        ctx.lineTo(w * 0.66, -h * 0.39);
        ctx.moveTo(-w * 0.50, -h * 0.19);
        ctx.lineTo(w * 0.52, -h * 0.21);
        ctx.stroke();
        ctx.restore();
    } else if (poseType === 'POSE_STABBING') {
        handX = w * (isRush ? 0.60 : 0.47);
        handY = -h * (isRush ? 0.58 : 0.60);
        swordAngle = isRush ? -0.01 : -0.05;
        swordLen = h * (isRush ? 1.08 : 0.92);
        curve = isRush ? 3 : 5;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 20, curve);
    } else if (poseType === 'POSE_LOW_AREA_SLASH') {
        // 잔상 하단 휩쓸기: 몸을 낮추고 아래를 크게 쓸어 올리는 원호형 베기.
        handX = w * (-0.10 + 0.68 * smooth);
        handY = -h * (0.36 - 0.05 * smooth + 0.02 * attackPulse);
        swordAngle = 1.08 - smooth * 1.34;
        swordLen = h * 0.98;
        curve = 8;
        drawLimb(shoulderFrontX - w * 0.04, shoulderY + h * 0.02, handX, handY, w * 0.12, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 20, curve);
    } else if (poseType === 'POSE_ATK_READY_01') {
        // 2차 본체 판별용 자세: 낮게 몸을 틀고 검을 뒤쪽 낮은 위치에 둔다.
        handX = -w * 0.38;
        handY = -h * 0.50;
        swordAngle = 0.36;
        swordLen = h * 1.02;
        curve = 5;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.12, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 20, curve);
    } else if (poseType === 'POSE_ATK_READY_02') {
        // 2차 분신 A 자세: 검을 머리 위로 크게 치켜든다.
        handX = w * 0.06;
        handY = -h * 0.96;
        swordAngle = -1.62;
        swordLen = h * 1.04;
        curve = 6;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 20, curve);
    } else if (poseType === 'POSE_ATK_READY_03') {
        // 2차 분신 B 자세: 검을 옆으로 길게 눕혀 잡는다.
        handX = w * 0.46;
        handY = -h * 0.46;
        swordAngle = -0.04;
        swordLen = h * 1.08;
        curve = 3;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 20, curve);
    } else if (poseType === 'POSE_HORIZONTAL_SLASH_READY') {
        // 3차 차지 자세: 횡베기를 준비하며 검에 사도의 기운을 모은다.
        handX = -w * 0.12;
        handY = -h * 0.60;
        swordAngle = -0.18;
        swordLen = h * 1.02;
        curve = 4;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.12, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 22, curve);
    } else if (poseType === 'POSE_P1_M2_FINAL_SLASH') {
        // 대형 패턴 2번 최종 참격: 몸을 크게 비틀었다가 전방 전체를 베어내는 과장된 일격.
        const windup = Math.max(0, Math.min(1, progress / 0.34));
        const release = Math.max(0, Math.min(1, (progress - 0.18) / 0.82));
        const finalSwing = release * release * (3 - 2 * release);
        handX = w * (-0.46 + 1.32 * finalSwing);
        handY = -h * (0.84 - 0.20 * finalSwing + 0.035 * attackPulse);
        swordAngle = -1.42 + finalSwing * 2.12;
        swordLen = h * 1.34;
        curve = 12;
        drawLimb(shoulderFrontX - w * 0.08, shoulderY + h * 0.02, handX, handY, w * 0.145, skinBase);
        drawClawHand(handX, handY, w * 0.17, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 26, curve);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,58,42,${0.28 + attackPulse * 0.24})`;
        ctx.lineWidth = Math.max(2.4, w * 0.045);
        ctx.beginPath();
        ctx.arc(w * 0.10, -h * 0.62, w * (0.52 + windup * 0.12), -1.16, 0.46 + finalSwing * 0.36);
        ctx.stroke();
        ctx.strokeStyle = `rgba(20,0,0,${0.36 + attackPulse * 0.18})`;
        ctx.lineWidth = Math.max(3.2, w * 0.060);
        ctx.beginPath();
        ctx.arc(w * 0.10, -h * 0.62, w * (0.63 + windup * 0.10), -1.02, 0.34 + finalSwing * 0.28);
        ctx.stroke();
        ctx.restore();
    } else if (poseType === 'POSE_CHARGE_HORIZONTAL_SLASH') {
        // 3차 강화 횡베기: 한 손 검을 크게 휘둘러 원형 범위를 쓸어버리는 강화 발도형 베기.
        handX = w * (-0.24 + 0.94 * smooth);
        handY = -h * (0.72 - 0.14 * smooth + 0.02 * attackPulse);
        swordAngle = -1.18 + smooth * 1.86;
        swordLen = h * 1.18;
        curve = 10;
        drawLimb(shoulderFrontX - w * 0.03, shoulderY, handX, handY, w * 0.13, skinBase);
        drawClawHand(handX, handY, w * 0.16, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 23, curve);
    } else if (poseType === 'POSE_HORIZONTAL_SLASH') {
        // 기본 횡베기: 찌르기가 아니라 검을 가로 방향으로 크게 휘두르는 원형 베기.
        handX = w * (-0.16 + 0.78 * smooth);
        handY = -h * (0.68 - 0.10 * smooth + 0.02 * attackPulse);
        swordAngle = -1.02 + smooth * 1.62;
        swordLen = h * 1.06;
        curve = 8;
        drawLimb(shoulderFrontX - w * 0.02, shoulderY, handX, handY, w * 0.12, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 21, curve);
    } else if (poseType === 'POSE_SLASH_UP') {
        handX = w * (0.12 + 0.15 * attackPulse);
        handY = -h * (0.47 + 0.14 * attackPulse);
        swordAngle = -0.70 + smooth * 1.92;
        swordLen = h * 0.84;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 21, 8);
    } else if (poseType === 'POSE_SLAM_THE_SWORD_DOWN_READY') {
        // 대형 패턴 2번 잔상 전용: 베는 동작이 아니라, 검을 지면에 꽂기 위해 높이 들어 올리는 준비 자세.
        handX = w * (0.10 + 0.05 * attackPulse);
        handY = -h * (0.92 + 0.02 * attackPulse);
        swordAngle = -1.72 + 0.12 * attackPulse;
        swordLen = h * 1.02;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.12, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 18, 3);
    } else if (poseType === 'POSE_SLAM_THE_SWORD_DOWN') {
        // 대형 패턴 2번 잔상 전용: 검 끝이 지면을 찍는 수직 내려찍기. 일반 내려베기보다 검이 땅에 박히는 실루엣을 우선한다.
        handX = w * (0.12 + 0.03 * attackPulse);
        handY = -h * (0.47 - 0.05 * attackPulse);
        swordAngle = 1.36 - 0.06 * attackPulse;
        swordLen = h * 0.62;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.12, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 17, 1);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,210,110,${0.30 + attackPulse * 0.26})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(handX + Math.cos(swordAngle) * swordLen, -h * 0.03, w * 0.34, h * 0.045, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    } else if (poseType === 'POSE_SLASH_DOWN' || poseType === 'POSE_HEAVY_SLASH_DOWN') {
        handX = w * (0.12 + 0.15 * attackPulse);
        handY = -h * (0.80 - 0.25 * smooth);
        swordAngle = -1.28 + smooth * 1.72;
        swordLen = h * (poseType === 'POSE_HEAVY_SLASH_DOWN' ? 0.93 : 0.84);
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 21, 8);
    } else if (poseType === 'POSE_SWORDPLAY') {
        const swing = Math.sin(progress * Math.PI * 8);
        const swing2 = Math.cos(progress * Math.PI * 6);
        handX = w * (0.42 + 0.08 * swing2);
        handY = -h * (0.58 + 0.07 * swing);
        swordAngle = -0.72 + swing * 0.82 + smooth * 0.35;
        swordLen = h * 0.96;
        curve = 5;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.12, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 20, curve);
        ctx.save();
        ctx.strokeStyle = `rgba(255,82,64,${0.32 + attackPulse * 0.24})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(w * 0.08, -h * 0.52, w * 0.62, -0.72, 0.58);
        ctx.stroke();
        ctx.restore();
    } else {
        if (isKasiyasPhase3) {
            // 3페이즈 기본 자세: 상체 가까이에서 양손으로 손잡이를 짧게 잡되, 검은 목에서 떨어져 전방을 겨눈다.
            handX = w * 0.22;
            handY = -h * 0.61;
            swordAngle = -1.28;
            swordLen = h * 1.06;
            curve = 2.5;
            let drawP3SwordNow = true;
            let drawSlashTrail = false;
            let slashTrailAlpha = 0;

            if (isP2ToP3TransitionCutscene) {
                if (transitionTimer < 2.05) {
                    // 두 검을 내려놓은 직후: 손에는 아무 검도 남지 않고, 높은 차원문을 향해 손을 올린다.
                    handX = w * 0.04;
                    handY = -h * 0.96;
                    swordLen = 0;
                    drawP3SwordNow = false;
                } else if (transitionTimer < 3.70) {
                    // 머리 위 높은 차원문에서 새 검을 잡아 아래로 끌어내리는 구간.
                    const drawT = Math.max(0, Math.min(1, (transitionTimer - 2.05) / 1.65));
                    handX = w * (0.04 + 0.08 * drawT);
                    handY = -h * (0.96 - 0.22 * drawT);
                    swordAngle = -1.55 + 0.04 * drawT;
                    swordLen = h * (0.54 + 0.46 * drawT);
                    curve = 2;
                } else if (transitionTimer < 4.95) {
                    // 공격이 아니라, 새 검을 옆으로 쭉 뻗어 상태를 확인하는 시험 횡베기.
                    const slashT = Math.max(0, Math.min(1, (transitionTimer - 3.70) / 1.25));
                    handX = w * (0.10 + 0.58 * slashT);
                    handY = -h * (0.70 - 0.06 * Math.sin(slashT * Math.PI));
                    swordAngle = -0.38 + slashT * 0.44;
                    swordLen = h * 1.06;
                    curve = 3;
                    drawSlashTrail = false;
                    slashTrailAlpha = 0;
                } else {
                    const stanceT = Math.max(0, Math.min(1, (transitionTimer - 4.95) / 0.95));
                    handX = w * (0.68 * (1 - stanceT) + 0.22 * stanceT);
                    handY = -h * (0.66 * (1 - stanceT) + 0.61 * stanceT);
                    swordAngle = (-0.02 * (1 - stanceT)) + (-1.28 * stanceT);
                    swordLen = h * (1.04 * (1 - stanceT) + 1.06 * stanceT);
                    curve = 3 * (1 - stanceT) + 2.5 * stanceT;
                }
            } else if (poseType === 'POSE_KASIYAS_P3_WARP') {
                handX = w * (0.22 + 0.05 * Math.sin(Date.now() / 90));
                handY = -h * (0.60 + 0.02 * Math.sin(Date.now() / 80));
                swordAngle = -0.90;
                swordLen = h * 1.04;
                curve = 2.5;
            } else if (poseType === 'POSE_KASIYAS_P3_SWORD_WAVE_CAST_SLASH') {
                // 환몽영식 거대 검기 사출: 초반에는 검을 머리 위로 높게 치켜들고, 후반에는 크게 내려벤다.
                const prepT = Math.max(0, Math.min(1, smooth));
                handX = w * (0.04 + 0.34 * prepT);
                handY = -h * (0.92 - 0.36 * prepT);
                swordAngle = -1.78 + prepT * 1.32;
                swordLen = h * 1.24;
                curve = 3.2;
            } else if (poseType === 'POSE_KASIYAS_P3_CAST_DIMENSION_CRACK_SLASH') {
                // 차원의 균열 생성: 제자리에서 크게 대각선으로 공간을 베어 가른다.
                const prepT = Math.max(0, Math.min(1, smooth));
                handX = w * (-0.10 + 0.56 * prepT);
                handY = -h * (0.88 - 0.42 * prepT);
                swordAngle = -2.15 + prepT * 1.70;
                swordLen = h * 1.22;
                curve = 3.0;
            } else if (poseType === 'POSE_KASIYAS_P3_CAST_EXTEND_HAND') {
                // 귀면족의 저주 부여: 검 끝을 플레이어 방향으로 겨누고, 검에서 스산한 저주 기운을 분출한다.
                handX = w * (0.44 + 0.04 * Math.sin(Date.now() / 90));
                handY = -h * (0.62 + 0.012 * Math.sin(Date.now() / 110));
                swordAngle = -0.08 + 0.03 * Math.sin(Date.now() / 120);
                swordLen = h * 1.18;
                curve = 2.0;
            } else if (poseType === 'POSE_KASIYAS_P3_RUSH_SLASH_CHARGE') {
                // 돌진 발도 준비: 검을 낮게 잡고 몸 앞에 기운을 압축한다.
                handX = w * (0.02 + 0.03 * Math.sin(Date.now() / 75));
                handY = -h * (0.60 + 0.01 * Math.sin(Date.now() / 90));
                swordAngle = -0.20;
                swordLen = h * 1.06;
                curve = 2.1;
            } else if (poseType === 'POSE_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH') {
                // 돌진을 끝낸 마무리 자세: 도착 위치에서 검을 대각선 위로 높게 치켜든다.
                handX = w * 0.34;
                handY = -h * 0.88;
                swordAngle = -1.08;
                swordLen = h * 1.22;
                curve = 2.8;
            } else if (poseType === 'POSE_KASIYAS_P3_DASH_SLASH') {
                // 귀면족의 저주 3차: 몸을 낮춰 돌진한 뒤, 이동 종료와 함께 크게 횡베기를 긋는다.
                const slashT = Math.max(0, Math.min(1, smooth));
                handX = w * (-0.26 + 0.88 * slashT);
                handY = -h * (0.58 - 0.05 * Math.sin(slashT * Math.PI));
                swordAngle = -0.86 + slashT * 1.52;
                swordLen = h * 1.18;
                curve = 3.2;
            } else if (poseType === 'POSE_KASIYAS_P3_SLAM_THE_SWORD_DOWN') {
                // 귀면족의 저주 4차: 검을 세워 끌어올렸다가 바닥에 내리찍는 실루엣.
                const slamT = Math.max(0, Math.min(1, smooth));
                handX = w * (0.02 + 0.10 * Math.sin(slamT * Math.PI));
                handY = -h * (1.04 - 0.66 * slamT);
                swordAngle = Math.PI / 2 - 0.08 * Math.sin(slamT * Math.PI);
                swordLen = h * 1.30;
                curve = 0.8;
            } else if (poseType === 'POSE_KASIYAS_P3_ATK_ROAR') {
                // 귀면족의 저주 5차: 상체를 뒤로 젖히고 포효하며 검은 몸 옆으로 내려 둔다.
                handX = w * (0.54 + 0.06 * attackPulse);
                handY = -h * (0.62 - 0.04 * attackPulse);
                swordAngle = -0.08 + attackPulse * 0.08;
                swordLen = h * 0.96;
                curve = 3.4;
            } else if (poseType === 'POSE_KASIYAS_P3_M1_FINAL_SLASH_CHARGE') {
                handX = w * (0.02 + 0.02 * Math.sin(Date.now() / 80));
                handY = -h * (0.98 + 0.02 * attackPulse);
                swordAngle = -1.64;
                swordLen = h * 1.32;
                curve = 1.2;
            } else if (poseType === 'POSE_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH') {
                const finalT = Math.max(0, Math.min(1, smooth));
                handX = w * (-0.16 + 0.78 * finalT);
                handY = -h * (0.98 - 0.52 * finalT);
                swordAngle = -2.18 + finalT * 1.88;
                swordLen = h * 1.34;
                curve = 2.3;
            } else if (poseType === 'POSE_KASIYAS_P3_M2_HAND_TO_SKY') {
                handX = w * (-0.02 + 0.02 * Math.sin(Date.now() / 90));
                handY = -h * 1.02;
                swordAngle = -1.58;
                swordLen = h * 1.26;
                curve = 1.0;
            } else if (poseType === 'POSE_KASIYAS_P3_M2_JUMP_TO_SKY' || poseType === 'POSE_KASIYAS_P3_M2_AIRBORNE_HOLD') {
                handX = w * 0.16;
                handY = -h * 0.86;
                swordAngle = -1.20;
                swordLen = h * 1.18;
                curve = 2.4;
            } else if (poseType === 'POSE_KASIYAS_P3_M2_OVERHEAD_STRIKE') {
                handX = w * (0.02 + 0.02 * Math.sin(Date.now() / 120));
                handY = -h * 1.04;
                swordAngle = Math.PI / 2 - 0.04;
                swordLen = h * 1.40;
                curve = 0.7;
            } else if (poseType === 'POSE_KASIYAS_P3_M2_FINAL_SLASH_CHARGE') {
                handX = w * (-0.04 + 0.01 * Math.sin(Date.now() / 80));
                handY = -h * 1.00;
                swordAngle = -1.56;
                swordLen = h * 1.34;
                curve = 1.0;
            } else if (poseType === 'POSE_KASIYAS_P3_M2_FINAL_SLASH') {
                const final2T = Math.max(0, Math.min(1, smooth));
                handX = w * (-0.26 + 0.86 * final2T);
                handY = -h * (0.96 - 0.26 * final2T);
                swordAngle = -1.78 + final2T * 1.40;
                swordLen = h * 1.34;
                curve = 1.6;
            } else if (poseType === 'POSE_KASIYAS_P3_DASH') {
                handX = w * (0.26 + 0.10 * attackPulse);
                handY = -h * (0.58 - 0.02 * attackPulse);
                swordAngle = -0.76;
                swordLen = h * 1.02;
                curve = 2.5;
            } else if (poseType === 'POSE_KASIYAS_P3_AIM_SWORD_PLAYER') {
                handX = w * 0.36;
                handY = -h * 0.56;
                swordAngle = -0.18;
                swordLen = h * 1.10;
                curve = 2.0;
            } else if (poseType === 'POSE_KASIYAS_P3_WALK_WITH_AURA') {
                handX = w * (0.20 + 0.02 * Math.sin(Date.now() / 180));
                handY = -h * (0.56 + 0.012 * Math.sin(Date.now() / 140));
                swordAngle = -1.22;
                swordLen = h * 1.04;
                curve = 2.4;
            } else if (poseType === 'POSE_KASIYAS_P3_M2_HAND_TO_SKY') {
            offElbowX = -w * 0.18;
            offElbowY = -h * 0.66;
            offHandX = w * 0.00;
            offHandY = -h * 0.94;
        } else if (poseType === 'POSE_KASIYAS_P3_M2_JUMP_TO_SKY' || poseType === 'POSE_KASIYAS_P3_M2_AIRBORNE_HOLD') {
            offElbowX = -w * 0.10;
            offElbowY = -h * 0.64;
            offHandX = w * 0.05;
            offHandY = -h * 0.78;
        } else if (poseType === 'POSE_KASIYAS_P3_M2_OVERHEAD_STRIKE') {
            offElbowX = -w * 0.02;
            offElbowY = -h * 0.82;
            offHandX = w * 0.10;
            offHandY = -h * 0.96;
        } else if (poseType === 'POSE_KASIYAS_P3_M2_FINAL_SLASH_CHARGE' || poseType === 'POSE_KASIYAS_P3_M2_FINAL_SLASH') {
            offElbowX = -w * 0.08;
            offElbowY = -h * 0.76;
            offHandX = w * 0.04;
            offHandY = -h * 0.88;
        } else if (poseType === 'POSE_KASIYAS_P3_HORIZONTAL_SLASH' || poseType === 'POSE_KASIYAS_P3_SLASH_UP' || poseType === 'POSE_KASIYAS_P3_JUMP') {
                handX = w * (0.06 + 0.64 * smooth);
                handY = -h * (0.64 - 0.04 * attackPulse);
                swordAngle = -0.72 + smooth * 1.18;
                swordLen = h * 1.10;
                curve = 3;
            } else if (poseType === 'POSE_KASIYAS_P3_AIR_SLASH_DOWN') {
                // 공중 내려베기: 액션 전반부에 검 손잡이와 검끝이 함께 아래로 내려가며,
                // 히트 타이밍에는 검끝이 지면에 꽂힌 것처럼 보이게 한다.
                const airDownT = Math.max(0, Math.min(1, smooth * 2.0));
                const airHoldT = Math.max(0, Math.min(1, (smooth - 0.50) * 2.0));
                handX = w * (0.04 + 0.10 * airDownT - 0.02 * airHoldT);
                handY = -h * (1.02 - 0.62 * airDownT + 0.04 * airHoldT);
                swordAngle = Math.PI / 2 + 0.05 * Math.sin((airDownT - 0.5) * Math.PI);
                swordLen = h * (1.28 + 0.04 * airDownT);
                curve = 0.8;
            } else if (poseType === 'POSE_KASIYAS_P3_SLASH_DOWN') {
                handX = w * (0.16 + 0.20 * smooth);
                handY = -h * (0.86 - 0.36 * smooth);
                swordAngle = -1.76 + smooth * 1.36;
                swordLen = h * 1.14;
                curve = 2.5;
            } else if (poseType === 'POSE_KASIYAS_P3_DIAGONAL_SLASH' || poseType === 'POSE_KASIYAS_P3_AURA_CUT_OFF_SLASH') {
                handX = w * (0.08 + 0.42 * smooth);
                handY = -h * (0.82 - 0.28 * smooth);
                swordAngle = -2.05 + smooth * 1.74;
                swordLen = poseType === 'POSE_KASIYAS_P3_AURA_CUT_OFF_SLASH' ? h * 1.24 : h * 1.18;
                curve = 2.5;
            }

            drawLimb(shoulderFrontX - w * 0.03, shoulderY + h * 0.01, handX, handY, w * 0.12, skinBase);
            drawClawHand(handX, handY, w * 0.15, 1);

            // 짧은 칼집/검초는 기본 자세에서만 은근히 보이도록 줄여, 손잡이 위치를 흐리지 않게 한다.
            if (!isP2ToP3TransitionCutscene || transitionTimer >= 5.35) {
                ctx.save();
                ctx.rotate(-0.14);
                drawPlate([[w * 0.04, -h * 0.54], [w * 0.42, -h * 0.57], [w * 0.44, -h * 0.52], [w * 0.06, -h * 0.49]], '#100b16', line, 1.3);
                ctx.restore();
            }

            if (drawP3SwordNow && swordLen > 1) {
                drawKatana(handX, handY, swordAngle, swordLen, 28, curve, 'P3');
            }

            // 시험 횡베기 잔광은 전환 연출용으로 더 이상 그리지 않는다.
        } else if (isKasiyasPhase2) {
            // 2페이즈 기본 자세 및 오른손 검 동작.
            handX = w * 0.40;
            handY = -h * 0.46;
            swordAngle = 0.62;
            swordLen = h * 0.86;
            curve = 7;

            if (poseType === 'POSE_P2_GROGGY') {
                // 2페이즈 그로기: 오른손 검도 지면에 꽂아 양검으로 몸을 지탱한다.
                handX = w * 0.56;
                handY = -h * 0.17;
                swordAngle = -1.68;
                swordLen = h * 0.82;
                curve = 1;
            } else if (poseType === 'POSE_P2_DASH') {
                handX = w * (0.40 + 0.20 * attackPulse);
                handY = -h * (0.48 + 0.03 * attackPulse);
                swordAngle = 0.16;
                swordLen = h * 0.98;
                curve = 4;
            } else if (poseType === 'POSE_P2_RIGHT_SWORD_HORIZONTAL_SLASH') {
                handX = w * (-0.04 + 0.72 * smooth);
                handY = -h * (0.56 - 0.07 * smooth + 0.02 * attackPulse);
                swordAngle = -0.80 + smooth * 1.70;
                swordLen = h * 1.04;
                curve = 8;
            } else if (poseType === 'POSE_P2_M1_LEFT_INWARD_SLASH') {
                handX = w * 0.38;
                handY = -h * 0.50;
                swordAngle = 0.62;
                swordLen = h * 0.86;
                curve = 7;
            } else if (poseType === 'POSE_P2_M1_RIGHT_INWARD_SLASH') {
                handX = w * (0.76 - 0.54 * smooth);
                handY = -h * (0.54 - 0.02 * attackPulse + 0.10 * smooth);
                swordAngle = -2.42 + smooth * 1.48;
                swordLen = h * 1.04;
                curve = 5;
            } else if (poseType === 'POSE_P2_M1_X_SLASH_READY') {
                // 최종 X자 준비: 오른손 손잡이는 벌린 채, 검신은 위쪽에서 왼손 검과 교차한다.
                handX = w * 0.46;
                handY = -h * 1.04;
                swordAngle = -2.40;
                swordLen = h * 1.12;
                curve = 4;
            } else if (poseType === 'POSE_P2_M1_X_SLASH') {
                handX = w * (0.42 + 0.30 * smooth);
                handY = -h * (1.00 - 0.54 * smooth);
                swordAngle = 2.18 - smooth * 1.92;
                swordLen = h * 1.10;
                curve = 4;
            } else if (poseType === 'POSE_P2_CHARGE_ENERGY') {
                handX = w * 0.34;
                handY = -h * 0.48;
                swordAngle = 0.86;
                swordLen = h * 0.84;
                curve = 6;
            } else if (poseType === 'POSE_P2_DOUBLE_SWORD_CROSS_SLASH') {
                handX = w * (-0.02 + 0.68 * smooth);
                handY = -h * (0.42 + 0.18 * smooth);
                swordAngle = -0.76 + smooth * 1.52;
                swordLen = h * 1.02;
                curve = 5;
            } else if (poseType === 'POSE_P2_DOUBLE_SWORD_UP_DOWN_SLASH') {
                handX = w * (0.24 + 0.24 * smooth);
                handY = -h * (0.36 + 0.30 * smooth);
                swordAngle = 1.24 - smooth * 2.32;
                swordLen = h * 0.98;
                curve = 7;
            } else if (poseType === 'POSE_P2_SWORD_STORM_SPAWN_READY') {
                handX = w * 0.72;
                handY = -h * 0.51;
                swordAngle = -0.12;
                swordLen = h * 0.96;
                curve = 4;
            } else if (poseType === 'POSE_P2_SWORD_STORM_SPAWN') {
                handX = w * (0.76 - 0.16 * smooth);
                handY = -h * (0.50 - 0.05 * attackPulse + 0.035 * Math.sin(progress * Math.PI * 2));
                swordAngle = -0.12 + attackPulse * 0.38;
                swordLen = h * 1.02;
                curve = 5;
            } else if (poseType === 'POSE_P2_SWORD_STORM_SPAWN_TO_DEFAULT') {
                // 회오리 검풍 소환 직후 복귀: 앞쪽 검도 펼친 자세에서 기본 자세로 천천히 돌아온다.
                const t = smooth;
                handX = w * ((0.76 - 0.10 * t) * (1 - t) + 0.34 * t);
                handY = -h * ((0.50 - 0.03 * attackPulse + 0.02 * Math.sin(progress * Math.PI * 2)) * (1 - t) + 0.53 * t);
                swordAngle = (-0.12 + attackPulse * 0.18) * (1 - t) + (-0.42) * t;
                swordLen = h * (1.02 * (1 - t) + 0.78 * t);
                curve = 5 * (1 - t) + 8 * t;
            } else if (poseType === 'POSE_P2_PUT_SWORD') {
                handX = w * (0.42 + 0.10 * attackPulse);
                handY = -h * (0.48 + 0.10 * attackPulse);
                swordAngle = 0.92;
                swordLen = h * 0.74;
                curve = 3;
            } else if (poseType === 'POSE_P2_GROUND_PUNCH') {
                handX = w * 0.30;
                handY = -h * 0.18;
                swordLen = 0;
            } else if (poseType === 'POSE_P2_GROUND_PUNCH_CHARGE') {
                handX = w * 0.20;
                handY = -h * 0.82;
                swordLen = 0;
            } else if (poseType === 'POSE_P2_GROUND_PUNCH_STRONG') {
                handX = w * 0.34;
                handY = -h * 0.14;
                swordLen = 0;
            } else if (poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_STANCE') {
                handX = w * 0.33;
                handY = -h * 0.47;
                swordAngle = 0.10;
                swordLen = h * 0.82;
                curve = 2;
            } else if (poseType === 'POSE_P2_JUMP_WITH_DOUBLE_EDGED_SWORD') {
                handX = w * (0.24 + 0.14 * attackPulse);
                handY = -h * (0.48 - 0.04 * attackPulse);
                swordAngle = 0.18 + attackPulse * 0.45;
                swordLen = h * 0.86;
                curve = 2;
            } else if (poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_JUMP_SLASH') {
                handX = w * (0.18 + 0.44 * smooth);
                handY = -h * (0.42 + 0.04 * attackPulse);
                swordAngle = -0.62 + smooth * 1.42;
                swordLen = h * 0.92;
                curve = 4;
            } else if (poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_DEFENCE_READY') {
                // 양날검 방어 준비: 손을 어깨 높이까지 올리고, 검 축을 세로로 세운다.
                handX = w * 0.44;
                handY = -h * 0.66;
                swordAngle = -1.53;
                swordLen = h * 0.96;
                curve = 2;
            } else if (poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_SPIN') {
                // 양날검 회전 전진: 몸 앞쪽에 세운 세로축 검을 전방으로 내밀어 돌리는 자세.
                handX = w * (0.48 + 0.02 * attackPulse);
                handY = -h * (0.66 + 0.015 * Math.sin(progress * Math.PI * 10));
                swordAngle = -1.55 + Math.sin(progress * Math.PI * 12) * 0.055;
                swordLen = h * 1.02;
                curve = 2;
            } else if (poseType === 'POSE_P2_DOUBLE_EDGED_SWORD_TO_DEFAULT') {
                const t = smooth;
                handX = w * (0.48 * (1 - t) + 0.34 * t);
                handY = -h * (0.66 * (1 - t) + 0.53 * t);
                swordAngle = (-1.55) * (1 - t) + (-0.42) * t;
                swordLen = h * (1.00 * (1 - t) + 0.78 * t);
                curve = 2 + 6 * t;
            } else if (poseType === 'POSE_P2_SUMMON_DIMENSION_PORTAL') {
                handX = w * 0.18;
                handY = -h * 0.82;
                swordAngle = -1.25;
                swordLen = h * 0.98;
                curve = 5;
            } else if (poseType === 'POSE_P2_ONI_STANCE') {
                handX = w * 0.28;
                handY = -h * 0.42;
                swordAngle = -1.61;
                swordLen = h * 0.92;
                curve = 3;
            } else if (poseType === 'POSE_P2_ONI_SLASH') {
                handX = w * (0.78 + 0.08 * attackPulse);
                handY = -h * 0.50;
                swordAngle = 0.06;
                swordLen = h * 1.06;
                curve = 4;
            }

            drawLimb(shoulderFrontX - w * 0.01, shoulderY + h * 0.02, handX, handY, w * 0.11, skinBase);
            drawClawHand(handX, handY, w * 0.15, 1);
            if (isP2BareHandPose) {
                // 검을 지면에 꽂아둔 맨손 난타 구간.
            } else if (isP2DoubleEdgedPose && !suppressP2SwordsForP3Transition) {
                drawKatana(handX, handY, swordAngle, swordLen, 24, curve);
                drawKatana(handX, handY, swordAngle + Math.PI, swordLen * 0.76, 18, curve);
            } else if (!suppressP2SwordsForP3Transition) {
                drawKatana(handX, handY, swordAngle, swordLen, 22, curve, p2M1SwordEnergyActive ? 'YELLOW' : '');
            }
        } else {
            handX = w * 0.32;
            handY = -h * 0.52;
            swordAngle = -0.48;
            swordLen = h * 0.80;
            drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
            drawClawHand(handX, handY, w * 0.15, 1);
            drawKatana(handX, handY, swordAngle, swordLen, 22, 8);
        }
    }

    // 목/머리/갈기. 갈기는 먼저 큰 실루엣, 그 위에 귀면족 얼굴과 뿔.
    const headCx = w * 0.04;
    const headCy = -h * 0.94;
    const headR = Math.max(w * 0.19, h * 0.105);
    drawMane(headCx - w * 0.02, headCy - h * 0.015, headR * 1.05);

    ctx.fillStyle = skinDark;
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.6;
    ctx.fillRect(-w * 0.07, -h * 0.88, w * 0.14, h * 0.08);
    ctx.strokeRect(-w * 0.07, -h * 0.88, w * 0.14, h * 0.08);

    // 뿔
    drawPlate([[headCx - headR * 0.52, headCy - headR * 0.52], [headCx - headR * 0.95, headCy - headR * 1.02], [headCx - headR * 0.24, headCy - headR * 0.72]], bone, line, 1.3);
    drawPlate([[headCx + headR * 0.42, headCy - headR * 0.54], [headCx + headR * 0.72, headCy - headR * 1.08], [headCx + headR * 0.68, headCy - headR * 0.42]], bone, line, 1.3);

    // 귀면족 얼굴: 인간형 원보다 앞쪽으로 뾰족한 주둥이와 붉은 눈.
    ctx.fillStyle = skinBase;
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headCx - headR * 0.64, headCy - headR * 0.34);
    ctx.quadraticCurveTo(headCx - headR * 0.30, headCy - headR * 0.92, headCx + headR * 0.42, headCy - headR * 0.72);
    ctx.quadraticCurveTo(headCx + headR * 0.94, headCy - headR * 0.30, headCx + headR * 0.58, headCy + headR * 0.28);
    ctx.quadraticCurveTo(headCx + headR * 0.10, headCy + headR * 0.62, headCx - headR * 0.48, headCy + headR * 0.18);
    ctx.quadraticCurveTo(headCx - headR * 0.78, headCy - headR * 0.06, headCx - headR * 0.64, headCy - headR * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 얼굴 음영/주둥이
    ctx.strokeStyle = 'rgba(58,34,50,0.72)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(headCx + headR * 0.18, headCy - headR * 0.18);
    ctx.lineTo(headCx + headR * 0.62, headCy - headR * 0.08);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headCx + headR * 0.24, headCy + headR * 0.18);
    ctx.lineTo(headCx + headR * 0.58, headCy + headR * 0.16);
    ctx.stroke();

    ctx.fillStyle = eyeRed;
    ctx.shadowBlur = isDead ? 0 : 5;
    ctx.shadowColor = 'rgba(255,40,20,0.75)';
    ctx.beginPath();
    ctx.ellipse(headCx + headR * 0.18, headCy - headR * 0.22, headR * 0.12, headR * 0.055, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headCx + headR * 0.50, headCy - headR * 0.18, headR * 0.10, headR * 0.045, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 본체/분신 판별 이펙트는 머리 위 전용 마커에서만 표시한다.
    // 얼굴 내부에 별도 선/검흔을 그리면 작은 공격 이펙트처럼 보일 수 있어 기본 안광만 유지한다.

    // P2/P3 페이즈 오라. P2는 원형 고리보다 몸 주변에서 일렁이는 외곽 기운으로 마무리한다.
    if (renderType === 'RENDER_KASIYAS_P2' || renderType === 'RENDER_KASIYAS_P3') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        if (renderType === 'RENDER_KASIYAS_P2') {
            const pulse = 0.5 + Math.sin(Date.now() / 170) * 0.5;
            ctx.globalAlpha = 0.22 + pulse * 0.08;
            ctx.strokeStyle = '#ff3f32';
            ctx.shadowBlur = 9;
            ctx.shadowColor = 'rgba(255,48,36,0.46)';
            ctx.lineWidth = Math.max(2.2, w * 0.026);
            ctx.beginPath();
            ctx.moveTo(-w * 0.44, -h * 0.16);
            ctx.quadraticCurveTo(-w * 0.58, -h * 0.48, -w * 0.28, -h * 0.80);
            ctx.quadraticCurveTo(0, -h * 1.04, w * 0.30, -h * 0.80);
            ctx.quadraticCurveTo(w * 0.58, -h * 0.48, w * 0.44, -h * 0.16);
            ctx.stroke();

            ctx.globalAlpha = 0.12 + pulse * 0.05;
            ctx.strokeStyle = '#8c0000';
            ctx.lineWidth = Math.max(1.4, w * 0.018);
            for (let i = 0; i < 5; i++) {
                const x = -w * 0.36 + i * w * 0.18 + Math.sin(Date.now() / 250 + i) * w * 0.018;
                ctx.beginPath();
                ctx.moveTo(x, -h * 0.14);
                ctx.bezierCurveTo(x - w * 0.04, -h * 0.34, x + w * 0.05, -h * 0.50, x + w * 0.02, -h * 0.72);
                ctx.stroke();
            }
        } else {
            const pulse = 0.5 + Math.sin(Date.now() / 138) * 0.5;
            // 전면부도 뒤쪽 오라와 같은 스파이크형 실루엣을 유지하되, 캐릭터를 가리지 않게 낮은 알파로 얹는다.
            const auraGrad = ctx.createRadialGradient(0, -h * 0.56, w * 0.18, 0, -h * 0.56, h * 0.76);
            auraGrad.addColorStop(0, `rgba(255,238,176,${0.024 + pulse * 0.010})`);
            auraGrad.addColorStop(0.22, `rgba(255,154,66,${0.052 + pulse * 0.016})`);
            auraGrad.addColorStop(0.52, `rgba(255,56,40,${0.090 + pulse * 0.026})`);
            auraGrad.addColorStop(0.84, `rgba(92,0,28,${0.10 + pulse * 0.02})`);
            auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            const pts = [
                [-w * 0.50, -h * 0.16], [-w * 0.60, -h * 0.42], [-w * 0.56, -h * 0.70],
                [-w * 0.34, -h * 0.86], [-w * 0.16, -h * 1.08], [0, -h * 1.22],
                [w * 0.16, -h * 1.08], [w * 0.34, -h * 0.86], [w * 0.56, -h * 0.70],
                [w * 0.60, -h * 0.42], [w * 0.50, -h * 0.16], [w * 0.26, -h * 0.02],
                [0, h * 0.04], [-w * 0.26, -h * 0.02]
            ];
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
            ctx.closePath();
            ctx.fill();

            ctx.globalAlpha = 0.21 + pulse * 0.10;
            ctx.strokeStyle = '#ffd28a';
            ctx.shadowBlur = 18;
            ctx.shadowColor = 'rgba(255,104,54,0.50)';
            ctx.lineWidth = Math.max(4.4, w * 0.056);
            ctx.beginPath();
            ctx.moveTo(-w * 0.48, -h * 0.16);
            ctx.lineTo(-w * 0.58, -h * 0.44);
            ctx.lineTo(-w * 0.54, -h * 0.74);
            ctx.lineTo(-w * 0.30, -h * 0.90);
            ctx.lineTo(-w * 0.14, -h * 1.10);
            ctx.lineTo(0, -h * 1.22);
            ctx.lineTo(w * 0.14, -h * 1.10);
            ctx.lineTo(w * 0.30, -h * 0.90);
            ctx.lineTo(w * 0.54, -h * 0.74);
            ctx.lineTo(w * 0.58, -h * 0.44);
            ctx.lineTo(w * 0.48, -h * 0.16);
            ctx.stroke();

            ctx.globalAlpha = 0.08 + pulse * 0.04;
            ctx.strokeStyle = '#335f9c';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(64,126,210,0.24)';
            ctx.lineWidth = Math.max(2.0, w * 0.024);
            ctx.beginPath();
            ctx.ellipse(0, -h * 0.58, w * 0.56, h * 0.34, 0.16, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    ctx.restore();
};


GameRenderer.drawMonsterGraphics = function(ctx, m, w, h, drawScale, isUI = false) {
    const renderer = this;
    const d = m.d;
    const face = m.faceDir || 1;
    const stateKey =
        (typeof MonsterAI !== 'undefined' && typeof gameState !== 'undefined')
            ? MonsterAI.resolveRuntimeState(m.state, gameState, m)
            : String(m.state || '').trim();

    const stateTypeKey =
        (typeof MonsterAI !== 'undefined' && typeof gameState !== 'undefined')
            ? MonsterAI.getPatternTypeKey(m.state, gameState, m)
            : String(m.state || '').trim().toUpperCase();

    const isKeraha = String(d.name || '').includes("케라하");
    let hoverY = isKeraha && stateTypeKey !== 'DIE' ? Math.sin(Date.now() / 200 + String(m.id || '').charCodeAt(0)) * 10 : 0;
    if (isUI) hoverY = 0;

    const bodyPalette = renderer.resolveMonsterPalette(m);
    const renderType = String(d.renderType || 'RENDER_HUMAN').trim().toUpperCase();
    const isKasiyasRender = renderType.startsWith('RENDER_KASIYAS');

    const drawStableWeapon = () => {
        const weaponType = String(d.weaponRenderType || '').trim().toUpperCase();
        if (!weaponType) return;
        if (stateTypeKey === 'DIE') return;

        const handX = face === 1 ? w / 2 - 6 : -w / 2 + 6;
        const handY = -h / 2 + 8;

        const bodyScaleX = (d.bodyX || 40) / 40;
        const bodyScaleZ = (d.bodyZ || 80) / 80;
        let weaponScale = (bodyScaleX * 0.4) + (bodyScaleZ * 0.6);
        weaponScale *= (m.scale || 1);

        weaponScale = Math.max(0.9, Math.min(1.9, weaponScale));
        if (weaponType === 'WEAPON_LARGE_AXE') weaponScale *= 1.18;

        ctx.save();
        ctx.translate(handX, handY);
        ctx.scale(weaponScale, weaponScale);

        let rot = 0;
        if (stateTypeKey === 'ATK_MELEE' || stateTypeKey === 'ATK') rot = face === 1 ? 0.22 : -0.22;
        else if (stateTypeKey === 'ATK_PROJECTILE') rot = face === 1 ? -0.08 : 0.08;
        else if (stateTypeKey === 'HIT') rot = face === 1 ? -0.05 : 0.05;
        ctx.rotate(rot);

        const shaftWood = renderer.resolveWeaponPaletteByType('WEAPON_WOOD_CLUB');
        const steel = weaponType === 'WEAPON_SMALL_CURVED_SWORD'
            ? renderer.resolveWeaponPaletteByType('WEAPON_SMALL_CURVED_SWORD')
            : renderer.resolveWeaponPaletteByType('WEAPON_SMALL_SWORD');
        const weaponPalette = renderer.resolveWeaponPaletteByType(weaponType);
        if (weaponType === 'WEAPON_STONE') {
            ctx.fillStyle = shaftWood.mid;
            ctx.fillRect(-2, -2, 4, 14);
            ctx.strokeStyle = shaftWood.dark;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-2, -2, 4, 14);

            const stone = renderer.resolveWeaponPalette('COLOR_STONE', '#7f8c8d');
            ctx.fillStyle = stone.mid;
            ctx.strokeStyle = stone.dark;
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(9, -4);
            ctx.lineTo(5, 7);
            ctx.lineTo(-6, 6);
            ctx.lineTo(-10, -2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (weaponType === 'WEAPON_SMALL_BOW' || weaponType === 'WEAPON_BOW') {
            ctx.strokeStyle = weaponPalette.mid;
            ctx.lineWidth = weaponType === 'WEAPON_SMALL_BOW' ? 3 : 4;
            ctx.beginPath();
            if (face === 1) {
                ctx.arc(3, 0, weaponType === 'WEAPON_SMALL_BOW' ? 13 : 18, -Math.PI / 2, Math.PI / 2, false);
            } else {
                ctx.arc(-3, 0, weaponType === 'WEAPON_SMALL_BOW' ? 13 : 18, Math.PI / 2, -Math.PI / 2, false);
            }
            ctx.stroke();

            ctx.strokeStyle = weaponPalette.light;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(face === 1 ? 3 : -3, weaponType === 'WEAPON_SMALL_BOW' ? -13 : -18);
            ctx.lineTo(face === 1 ? 3 : -3, weaponType === 'WEAPON_SMALL_BOW' ? 13 : 18);
            ctx.stroke();
        } else if (weaponType === 'WEAPON_SMALL_SWORD') {
            ctx.fillStyle = steel.light;
            ctx.fillRect(-2.5, -20, 5, 24);
            ctx.strokeStyle = steel.dark;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-2.5, -20, 5, 24);

            ctx.fillStyle = steel.mid;
            ctx.fillRect(-0.8, -18, 1.6, 18);

            ctx.fillStyle = shaftWood.mid;
            ctx.fillRect(-6, 3, 12, 3);
            ctx.fillRect(-1.5, 6, 3, 8);
            ctx.strokeStyle = shaftWood.dark;
            ctx.strokeRect(-6, 3, 12, 3);
        } else if (weaponType === 'WEAPON_SMALL_CURVED_SWORD') {
            ctx.fillStyle = steel.mid;
            ctx.strokeStyle = steel.light;
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (face === 1) {
                ctx.moveTo(0, -2);
                ctx.quadraticCurveTo(14, -14, 12, -28);
                ctx.quadraticCurveTo(8, -20, 3, -8);
            } else {
                ctx.moveTo(0, -2);
                ctx.quadraticCurveTo(-14, -14, -12, -28);
                ctx.quadraticCurveTo(-8, -20, -3, -8);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = shaftWood.mid;
            ctx.fillRect(-5, 1, 10, 3);
            ctx.fillRect(-1.5, 4, 3, 8);
        } else if (weaponType === 'WEAPON_MAGIC_STAFF') {
            ctx.fillStyle = shaftWood.mid;
            ctx.fillRect(-2, -18, 4, 30);
            ctx.strokeStyle = shaftWood.dark;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-2, -18, 4, 30);

            ctx.fillStyle = weaponPalette.mid;
            ctx.shadowBlur = 10;
            ctx.shadowColor = weaponPalette.mid;
            ctx.beginPath();
            ctx.arc(0, -18, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (weaponType === 'WEAPON_LARGE_AXE') {
            const axeWood = renderer.resolveWeaponPalette('COLOR_WOOD', '#8e5a2b');
            const axeMetal = renderer.resolveWeaponPaletteByType('WEAPON_LARGE_AXE');

            ctx.fillStyle = axeWood.mid;
            ctx.fillRect(-2.5, -20, 5, 34);
            ctx.strokeStyle = axeWood.dark;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-2.5, -20, 5, 34);

            ctx.fillStyle = axeWood.light;
            ctx.fillRect(-0.8, -16, 1.6, 26);

            ctx.fillStyle = axeMetal.mid;
            ctx.strokeStyle = axeMetal.dark;
            ctx.lineWidth = 2;

            if (face === 1) {
                ctx.beginPath();
                ctx.moveTo(0, -16);
                ctx.lineTo(18, -22);
                ctx.lineTo(24, -10);
                ctx.lineTo(14, 2);
                ctx.lineTo(0, -2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = axeMetal.light;
                ctx.beginPath();
                ctx.moveTo(2, -13);
                ctx.lineTo(13, -17);
                ctx.lineTo(17, -10);
                ctx.lineTo(9, -1);
                ctx.lineTo(2, -3);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(0, -16);
                ctx.lineTo(-18, -22);
                ctx.lineTo(-24, -10);
                ctx.lineTo(-14, 2);
                ctx.lineTo(0, -2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = axeMetal.light;
                ctx.beginPath();
                ctx.moveTo(-2, -13);
                ctx.lineTo(-13, -17);
                ctx.lineTo(-17, -10);
                ctx.lineTo(-9, -1);
                ctx.lineTo(-2, -3);
                ctx.closePath();
                ctx.fill();
            }

            ctx.fillStyle = axeMetal.light;
            ctx.fillRect(-5, -6, 10, 4);
        } else if (weaponType === 'WEAPON_WOOD_CLUB') {
            ctx.fillStyle = weaponPalette.mid;
            ctx.fillRect(-3, -14, 6, 26);
            ctx.strokeStyle = weaponPalette.dark;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-3, -14, 6, 26);

            const head = renderer.resolveWeaponPalette('COLOR_STONE', '#7f8c8d');
            ctx.fillStyle = head.mid;
            ctx.beginPath();
            ctx.ellipse(0, -16, 9, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    };

    ctx.save();
    ctx.translate(0, hoverY);
    ctx.scale(drawScale, drawScale);

    const bossAction = m && m.boss ? m.boss.action : null;
    const actionDefenceType = String((bossAction && (bossAction.Action_Defence_Type || bossAction.Defence_Type)) || '').trim().toUpperCase();
    const hasArmorOutline = !isUI && (
        actionDefenceType === 'SUPER_ARMOR' ||
        actionDefenceType === 'INVINCIBLE' ||
        String(d.defType || '').toLowerCase() === 'superarmor'
    );

    if (isKasiyasRender) {
        if (hasArmorOutline && typeof renderer.drawKasiyasArmorOutline === 'function') {
            renderer.drawKasiyasArmorOutline(ctx, w, h, 1.0);
        }
        const poseType = renderer.resolveKasiyasPoseType(m);
        const poseProgress = renderer.getKasiyasActionProgress(m, (typeof gameState !== 'undefined' ? gameState : null));

        renderer.drawKasiyasModel(ctx, {
            m: m,
            d: d,
            renderType: renderType,
            w: w,
            h: h,
            face: face,
            stateKey: stateTypeKey,
            poseType: poseType,
            progress: poseProgress,
            isUI: !!isUI
        });

        ctx.restore();
        return;
    }

    renderer.drawModelBody(ctx, {
        renderType: renderType,
        palette: bodyPalette,
        w: w,
        h: h,
        faceDir: face,
        state: stateTypeKey,
        isChampion: !!m.isChampion,
        isMonster: true,
        eyeColor: stateTypeKey === 'HIT' && !isUI ? '#7a0000' : '#111111'
    });

    ctx.shadowBlur = 0;

    if (stateTypeKey !== 'DIE' && stateTypeKey !== 'SPAWN') {
        if (m.isChampion && !isUI) {
            const t = Date.now() / 180 + (m.x || 0) * 0.01;
            const flameX = 0;
            const flameY = -h * 0.98;
            const flameW = Math.max(16, w * 0.34);
            const flameH = Math.max(20, h * 0.24);
            const pulse = 1 + Math.sin(t) * 0.08;

            ctx.save();
            ctx.translate(flameX, flameY);
            ctx.scale(pulse, pulse);

            const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, flameW * 0.9);
            glow.addColorStop(0, 'rgba(255, 220, 120, 0.32)');
            glow.addColorStop(0.55, 'rgba(255, 140, 40, 0.16)');
            glow.addColorStop(1, 'rgba(255, 120, 20, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.ellipse(0, flameH * 0.02, flameW * 0.72, flameH * 0.30, 0, 0, Math.PI * 2);
            ctx.fill();

            let gradL = ctx.createLinearGradient(-flameW * 0.22, flameH * 0.36, -flameW * 0.10, -flameH);
            gradL.addColorStop(0, 'rgba(255, 120, 30, 0.92)');
            gradL.addColorStop(0.45, 'rgba(255, 190, 70, 0.96)');
            gradL.addColorStop(0.8, 'rgba(255, 235, 170, 0.98)');
            gradL.addColorStop(1, 'rgba(255, 255, 245, 0.92)');
            ctx.fillStyle = gradL;
            ctx.beginPath();
            ctx.moveTo(-flameW * 0.36, flameH * 0.26);
            ctx.quadraticCurveTo(-flameW * 0.52, -flameH * 0.06, -flameW * 0.14, -flameH * 0.72);
            ctx.quadraticCurveTo(-flameW * 0.04, -flameH * 0.28, -flameW * 0.04, flameH * 0.16);
            ctx.quadraticCurveTo(-flameW * 0.16, flameH * 0.34, -flameW * 0.36, flameH * 0.26);
            ctx.closePath();
            ctx.fill();

            let gradC = ctx.createLinearGradient(0, flameH * 0.42, 0, -flameH * 1.15);
            gradC.addColorStop(0, 'rgba(255, 110, 20, 0.96)');
            gradC.addColorStop(0.38, 'rgba(255, 180, 60, 0.98)');
            gradC.addColorStop(0.72, 'rgba(255, 235, 170, 0.98)');
            gradC.addColorStop(1, 'rgba(255, 255, 245, 0.95)');
            ctx.fillStyle = gradC;
            ctx.beginPath();
            ctx.moveTo(-flameW * 0.22, flameH * 0.30);
            ctx.quadraticCurveTo(-flameW * 0.40, -flameH * 0.02, 0, -flameH);
            ctx.quadraticCurveTo(flameW * 0.42, -flameH * 0.06, flameW * 0.22, flameH * 0.30);
            ctx.quadraticCurveTo(0, flameH * 0.48, -flameW * 0.22, flameH * 0.30);
            ctx.closePath();
            ctx.fill();

            let gradR = ctx.createLinearGradient(flameW * 0.22, flameH * 0.36, flameW * 0.10, -flameH * 0.92);
            gradR.addColorStop(0, 'rgba(255, 120, 30, 0.92)');
            gradR.addColorStop(0.45, 'rgba(255, 190, 70, 0.96)');
            gradR.addColorStop(0.8, 'rgba(255, 235, 170, 0.98)');
            gradR.addColorStop(1, 'rgba(255, 255, 245, 0.92)');
            ctx.fillStyle = gradR;
            ctx.beginPath();
            ctx.moveTo(flameW * 0.36, flameH * 0.24);
            ctx.quadraticCurveTo(flameW * 0.54, -flameH * 0.02, flameW * 0.16, -flameH * 0.62);
            ctx.quadraticCurveTo(flameW * 0.06, -flameH * 0.20, flameW * 0.04, flameH * 0.16);
            ctx.quadraticCurveTo(flameW * 0.16, flameH * 0.34, flameW * 0.36, flameH * 0.24);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 245, 0.78)';
            ctx.beginPath();
            ctx.moveTo(-flameW * 0.06, flameH * 0.18);
            ctx.quadraticCurveTo(-flameW * 0.12, -flameH * 0.06, 0, -flameH * 0.52);
            ctx.quadraticCurveTo(flameW * 0.12, -flameH * 0.06, flameW * 0.06, flameH * 0.18);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        if (isKeraha) {
            // 케라하 전용 추가 오버레이 제거
            // 본체/망토는 drawModelBody(RENDER_WITCH) 결과만 사용
        }

    }
        if (stateKey !== 'P_Die') {
        if (!isKasiyasRender) drawStableWeapon();
    }

    ctx.restore();
};



GameRenderer.roundRect = GameRenderer.roundRect || function(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r || 0, Math.abs(w) / 2, Math.abs(h) / 2));
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        return;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
};

GameRenderer.drawKasiyasIdentityCue = function(ctx, x, bodyY, bodyH, isReal = false) {
    const h = Math.max(120, parseFloat(bodyH) || 160);
    const y = bodyY - h * 0.98;
    const pulse = 0.5 + Math.sin(Date.now() / (isReal ? 62 : 82)) * 0.5;
    const size = isReal ? 40 : 28;
    const alpha = isReal ? 0.96 : 0.70;

    ctx.save();
    ctx.translate(x, y);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = isReal ? 26 + pulse * 10 : 18 + pulse * 7;
    ctx.shadowColor = isReal ? 'rgba(255,34,24,0.95)' : 'rgba(255,82,72,0.68)';

    // 머리 위 판별 전용 안광 마커. 공격 검흔처럼 보이지 않도록 타원/눈동자 중심으로만 구성한다.
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, size * (isReal ? 1.18 : 0.92));
    grad.addColorStop(0, isReal ? 'rgba(255,235,198,0.96)' : 'rgba(255,166,150,0.66)');
    grad.addColorStop(0.38, isReal ? 'rgba(255,46,30,0.78)' : 'rgba(255,70,58,0.52)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.96, size * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isReal ? `rgba(255,224,178,${0.82 + pulse * 0.16})` : `rgba(255,126,108,${0.56 + pulse * 0.16})`;
    ctx.lineWidth = isReal ? 2.8 : 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.56, size * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = isReal ? `rgba(255,48,32,${0.92 + pulse * 0.08})` : `rgba(255,78,64,${0.62 + pulse * 0.16})`;
    ctx.beginPath();
    ctx.ellipse(-size * 0.18, 0, size * 0.09, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size * 0.18, 0, size * 0.09, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isReal) {
        ctx.globalAlpha = 0.22 + pulse * 0.12;
        ctx.fillStyle = 'rgba(255,34,24,0.55)';
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.04, size * 1.18, size * 0.82, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
};

GameRenderer.drawKasiyasEnergyChargeCue = function(ctx, x, bodyY, bodyH, isStrong = false) {
    const h = Math.max(120, parseFloat(bodyH) || 160);
    const y = bodyY - h * 0.62;
    const pulse = 0.5 + Math.sin(Date.now() / (isStrong ? 48 : 76)) * 0.5;
    const radius = isStrong ? 58 : 38;
    const alpha = isStrong ? 0.92 : 0.52;

    ctx.save();
    ctx.translate(x, y);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = isStrong ? 26 + pulse * 14 : 12 + pulse * 8;
    ctx.shadowColor = isStrong ? 'rgba(255,36,24,0.92)' : 'rgba(255,70,58,0.50)';

    const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, radius);
    grad.addColorStop(0, isStrong ? 'rgba(255,235,150,0.58)' : 'rgba(255,128,110,0.24)');
    grad.addColorStop(0.48, isStrong ? 'rgba(210,20,10,0.40)' : 'rgba(120,0,0,0.20)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.86, radius * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = 'round';
    const count = isStrong ? 6 : 4;
    for (let i = 0; i < count; i++) {
        const a = -Math.PI * 0.72 + i * (Math.PI * 1.44 / Math.max(1, count - 1)) + pulse * 0.18;
        const r = radius * (0.40 + (i % 3) * 0.08);
        ctx.strokeStyle = isStrong ? `rgba(255,82,48,${0.58 + pulse * 0.20})` : `rgba(255,82,58,${0.30 + pulse * 0.16})`;
        ctx.lineWidth = isStrong ? 3.2 : 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, r, a, a + Math.PI * 0.48);
        ctx.stroke();
    }

    ctx.restore();
};


GameRenderer.drawKasiyasFinalSlashChargeCue = function(ctx, x, bodyY, bodyH, dir = 1, intensity = 1.0) {
    const h = Math.max(130, parseFloat(bodyH) || 170);
    const level = Math.max(0.42, Math.min(1.35, parseFloat(intensity) || 1.0));
    const baseY = bodyY - h * 0.06;
    const coreY = bodyY - h * 0.58;
    const chestY = bodyY - h * 0.46;
    const swordY = bodyY - h * 0.86;
    const now = Date.now();
    const pulse = 0.5 + Math.sin(now / 38) * 0.5;
    const fastPulse = 0.5 + Math.sin(now / 20) * 0.5;
    const spin = now / 340;
    const face = dir >= 0 ? 1 : -1;

    const energyColors = [
        'rgba(190,0,0,',      // 붉은 사도의 기운
        'rgba(255,184,38,',   // 노란 사도의 기운
        'rgba(8,0,0,',        // 검은 사도의 기운
        'rgba(118,32,188,'    // 보라색 차원 잔광
    ];

    ctx.save();
    ctx.translate(x, 0);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 바닥 연출은 보조로만 남기고, 사방에서 기운이 모이는 느낌을 우선한다.
    ctx.save();
    ctx.translate(0, baseY);
    ctx.globalAlpha = (0.16 + pulse * 0.08) * level;
    ctx.shadowBlur = 18 + pulse * 10;
    ctx.shadowColor = 'rgba(120,0,0,0.62)';
    const floorGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, h * 1.02);
    floorGrad.addColorStop(0.00, 'rgba(255,176,44,0.07)');
    floorGrad.addColorStop(0.28, 'rgba(130,0,0,0.12)');
    floorGrad.addColorStop(0.64, 'rgba(28,0,0,0.10)');
    floorGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, h * 0.92, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 첨부 이미지처럼 상하좌우/대각선 공간에 떠 있는 기운 구슬이 몸과 검으로 빨려 들어간다.
    const orbCount = Math.round(18 + level * 12);
    for (let i = 0; i < orbCount; i++) {
        const ratio = i / orbCount;
        const phase = (now / (470 + (i % 7) * 45) + ratio * 1.91) % 1;
        const pull = phase;
        const angle = spin * (0.58 + (i % 5) * 0.06) + i * Math.PI * 2 / orbCount;
        const orbitW = h * (0.58 + (i % 6) * 0.095 + level * 0.13);
        const orbitH = h * (0.50 + (i % 5) * 0.085 + level * 0.10);
        const startX = Math.cos(angle) * orbitW;
        const startY = chestY + Math.sin(angle) * orbitH - h * (0.02 + (i % 3) * 0.04);
        const targetIsSword = (i % 4 === 1 || i % 4 === 3);
        const targetX = face * h * (targetIsSword ? 0.16 : 0.045);
        const targetY = targetIsSword ? swordY : coreY;
        const wobble = Math.sin(now / 95 + i * 1.7) * h * 0.035;
        const px = startX * (1 - pull) + targetX * pull + wobble * (1 - Math.abs(0.5 - pull) * 1.6);
        const py = startY * (1 - pull) + targetY * pull + Math.cos(now / 115 + i) * h * 0.025;
        const colorBase = energyColors[i % energyColors.length];
        const alpha = (0.28 + pull * 0.28 + fastPulse * 0.08) * level;
        const r = h * (0.014 + (i % 4) * 0.004) * (0.85 + pull * 0.35);

        ctx.save();
        ctx.shadowBlur = 10 + pull * 18 * level;
        ctx.shadowColor = colorBase + '0.78)';
        ctx.fillStyle = colorBase + Math.min(0.88, alpha).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();

        // 구슬 뒤쪽에 짧은 꼬리를 남겨 흡입 방향을 읽기 쉽게 한다.
        if (pull > 0.08 && pull < 0.94) {
            const tailX = startX * (1 - Math.max(0, pull - 0.11)) + targetX * Math.max(0, pull - 0.11);
            const tailY = startY * (1 - Math.max(0, pull - 0.11)) + targetY * Math.max(0, pull - 0.11);
            ctx.strokeStyle = colorBase + Math.min(0.52, alpha * 0.62).toFixed(3) + ')';
            ctx.lineWidth = Math.max(1.4, h * 0.009 * level);
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(px, py);
            ctx.stroke();
        }
        ctx.restore();
    }

    // 전신을 감싸는 곡선형 흡입 궤적. 지면이 아니라 사방의 기류가 몸으로 빨려 들어오는 느낌을 강화한다.
    const streamCount = Math.round(14 + level * 10);
    for (let i = 0; i < streamCount; i++) {
        const ratio = i / streamCount;
        const phase = (now / (600 + (i % 5) * 64) + ratio * 1.53) % 1;
        const angle = spin * (0.72 + (i % 4) * 0.09) + i * Math.PI * 2 / streamCount;
        const outerX = Math.cos(angle) * h * (0.76 + (i % 5) * 0.11 + level * 0.12);
        const outerY = chestY + Math.sin(angle) * h * (0.62 + (i % 4) * 0.07) - h * 0.04;
        const targetIsSword = i % 3 === 0;
        const targetX = face * h * (targetIsSword ? 0.18 : 0.05);
        const targetY = targetIsSword ? swordY : coreY;
        const midX = outerX * 0.48 + Math.sin(angle + spin * 1.6) * h * 0.15;
        const midY = outerY * 0.48 + targetY * 0.52 + Math.cos(angle - spin) * h * 0.10;
        const colorBase = energyColors[(i + 1) % energyColors.length];
        const a = Math.min(0.70, (0.20 + phase * 0.30 + pulse * 0.10) * level);

        ctx.save();
        ctx.shadowBlur = 8 + phase * 16 * level;
        ctx.shadowColor = colorBase + '0.62)';
        ctx.strokeStyle = colorBase + a.toFixed(3) + ')';
        ctx.lineWidth = Math.max(1.7, h * (0.009 + (i % 3) * 0.0025) * level);
        ctx.beginPath();
        ctx.moveTo(outerX, outerY);
        ctx.quadraticCurveTo(midX, midY, targetX, targetY);
        ctx.stroke();
        ctx.restore();
    }

    // 몸통 중심의 압축 코어. 대기 구간이 길어질수록 전신으로 기운을 끌어모으는 중심점처럼 보이게 한다.
    ctx.save();
    ctx.translate(0, coreY);
    ctx.globalAlpha = Math.min(0.92, (0.56 + pulse * 0.18) * level);
    ctx.shadowBlur = 24 + pulse * 26 * level;
    ctx.shadowColor = 'rgba(210,0,0,0.82)';
    const coreGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, h * (0.34 + level * 0.12));
    coreGrad.addColorStop(0.00, 'rgba(255,206,64,0.34)');
    coreGrad.addColorStop(0.22, 'rgba(186,0,0,0.44)');
    coreGrad.addColorStop(0.55, 'rgba(28,0,0,0.32)');
    coreGrad.addColorStop(0.82, 'rgba(86,18,138,0.16)');
    coreGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, h * (0.30 + level * 0.08), h * (0.20 + level * 0.05), -0.12 * face, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 7; i++) {
        const a = spin * 1.9 + i * Math.PI * 2 / 7;
        const rx = h * (0.18 + (i % 3) * 0.038 + pulse * 0.016) * (0.95 + level * 0.12);
        const ry = h * (0.09 + (i % 2) * 0.022) * (0.95 + level * 0.10);
        ctx.strokeStyle = i % 3 === 0
            ? `rgba(255,182,36,${Math.min(0.70, (0.30 + pulse * 0.18) * level)})`
            : (i % 3 === 1 ? `rgba(172,0,0,${Math.min(0.78, (0.44 + pulse * 0.16) * level)})` : `rgba(8,0,0,${Math.min(0.86, (0.60 + pulse * 0.12) * level)})`);
        ctx.lineWidth = i % 3 === 2 ? 3.4 : 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, a * 0.15, a, a + Math.PI * 0.92);
        ctx.stroke();
    }
    ctx.restore();

    // 검 쪽으로 압축되는 차지 코어. 최종 대기 액션에서는 강하게, 잔상 견제 중에는 약하게 유지된다.
    ctx.save();
    ctx.translate(face * h * 0.16, swordY);
    ctx.globalAlpha = Math.min(0.94, (0.62 + fastPulse * 0.16) * level);
    ctx.shadowBlur = 20 + fastPulse * 24 * level;
    ctx.shadowColor = 'rgba(255,158,30,0.82)';
    const swordGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, h * (0.15 + level * 0.07 + pulse * 0.03));
    swordGrad.addColorStop(0.00, 'rgba(255,218,78,0.56)');
    swordGrad.addColorStop(0.30, 'rgba(196,0,0,0.46)');
    swordGrad.addColorStop(0.64, 'rgba(18,0,0,0.34)');
    swordGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = swordGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, h * (0.16 + level * 0.07), h * (0.09 + level * 0.035), -0.22 * face, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255,196,52,${Math.min(0.80, (0.46 + fastPulse * 0.22) * level)})`;
    ctx.lineWidth = Math.max(1.4, h * 0.011 * level);
    for (let i = 0; i < 5; i++) {
        const a = spin * 2.5 + i * Math.PI * 2 / 5;
        ctx.beginPath();
        ctx.arc(0, 0, h * (0.08 + i * 0.015 + level * 0.014), a, a + Math.PI * 0.76);
        ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
};


GameRenderer.drawBossOverheadShockwaveGauge = function(ctx, m, bodyY, bodyH) {
    const boss = m && m.boss;
    const action = boss && boss.action;
    if (!m || !boss || !action) return;
    if ((m.hp || 0) <= 0 || m.state === 'DEAD' || m.state === 'DIE') return;

    const pose = String(action.Action_Pose_Type || '').trim().toUpperCase();
    const effect = String(action.Effect_Render_Type || action.VFX_Type || '').trim().toUpperCase();
    const name = String(action.Action_Name || '').trim();

    // 충격파 게이지는 발 내려찍기/지면 난타 액션에서 표시한다.
    // 2페이즈 기본 패턴 3번의 강한 지면 난타는 준비 액션과 실제 강타 액션이 분리되어 있으므로
    // 두 액션을 하나의 연속 게이지로 계산해, 242017 진입 시 게이지가 다시 0으로 초기화되지 않게 한다.
    const isCharge = pose === 'POSE_KASIYAS_P2_GROUND_PUNCH_CHARGE'
        || effect === 'EFT_KASIYAS_P2_GROUND_PUNCH_CHARGE'
        || name.indexOf('지면 난타 대기') >= 0;
    const isStrongAtk = pose === 'POSE_KASIYAS_P2_GROUND_PUNCH_STRONG'
        || effect === 'EFT_KASIYAS_P2_GROUND_PUNCH_STRONG'
        || name.indexOf('3차 지면 난타') >= 0
        || name.indexOf('강한 지면 난타') >= 0;
    const patternId = String((boss.activePattern && (boss.activePattern.Pattern_ID || boss.activePattern.Source_Pattern_ID)) || action.Pattern_ID || '').trim();
    const isP3M2Landing = patternId === '233007'
        && String(action.Action_ID || '').trim() === '243060'
        && String(action.Action_Type || '').trim().toUpperCase() === 'ATK';
    const isStomp = pose === 'POSE_KASIYAS_STOMP'
        || effect === 'EFT_KASIYAS_STOMP'
        || pose === 'POSE_KASIYAS_P2_GROUND_PUNCH'
        || isCharge
        || isStrongAtk
        || effect === 'EFT_KASIYAS_P2_GROUND_PUNCH'
        || name.indexOf('지면 난타') >= 0
        || name.indexOf('발 내려찍기') >= 0
        || name.indexOf('발구르기') >= 0
        || name.indexOf('충격파') >= 0
        || isP3M2Landing;
    if (!isStomp) return;

    const getDuration = (act, fallback = 0.7) => {
        let duration = parseFloat(act && act.Action_Anim_Duration);
        try {
            if (typeof MonsterManager !== 'undefined' && MonsterManager.getBossActionDuration) {
                const d = MonsterManager.getBossActionDuration(m, act, (typeof gameState !== 'undefined' ? gameState : null));
                if (isFinite(d) && d > 0) duration = d;
            }
        } catch (e) {}
        return (isFinite(duration) && duration > 0) ? duration : fallback;
    };
    const getHitStart = (act, fallback = 0.3) => {
        let hitStart = parseFloat(act && act.Hitbox_Start_Time);
        try {
            if (typeof MonsterManager !== 'undefined' && MonsterManager.getBossActionHitWindow) {
                const hw = MonsterManager.getBossActionHitWindow(m, act);
                if (hw && isFinite(hw.start) && hw.start >= 0) hitStart = hw.start;
            }
        } catch (e) {}
        return (isFinite(hitStart) && hitStart >= 0) ? hitStart : fallback;
    };

    const timer = Math.max(0, parseFloat(m.timer) || 0);
    const actions = boss && Array.isArray(boss.runtimeActions) && boss.runtimeActions.length ? boss.runtimeActions : (boss && boss.activePattern && Array.isArray(boss.activePattern.Runtime_Actions) ? boss.activePattern.Runtime_Actions : []);
    const currentIndex = parseInt(boss && boss.currentActionIndex, 10);
    let ratio = 0;
    let remain = 0;
    let labelPrefix = isP3M2Landing ? '지면 충격파' : '충격파 발생';

    if (isCharge) {
        const nextAction = isFinite(currentIndex) ? actions[currentIndex + 1] : null;
        const chargeDuration = getDuration(action, 1);
        const hitStart = getHitStart(nextAction, 0.3);
        const total = Math.max(0.01, chargeDuration + hitStart);
        ratio = Math.max(0, Math.min(1, timer / total));
        remain = Math.max(0, total - timer);
        labelPrefix = '강한 지면 난타';
    } else if (isStrongAtk) {
        const prevAction = isFinite(currentIndex) ? actions[currentIndex - 1] : null;
        const prevPose = String(prevAction && prevAction.Action_Pose_Type || '').trim().toUpperCase();
        const prevEffect = String(prevAction && (prevAction.VFX_Type || prevAction.Effect_Render_Type) || '').trim().toUpperCase();
        const prevName = String(prevAction && prevAction.Action_Name || '').trim();
        const hasChargeBefore = prevPose === 'POSE_KASIYAS_P2_GROUND_PUNCH_CHARGE'
            || prevEffect === 'EFT_KASIYAS_P2_GROUND_PUNCH_CHARGE'
            || prevName.indexOf('지면 난타 대기') >= 0;
        const hitStart = Math.max(0.01, getHitStart(action, 0.3));
        if (hasChargeBefore) {
            const chargeDuration = getDuration(prevAction, 1);
            const total = Math.max(0.01, chargeDuration + hitStart);
            const elapsed = chargeDuration + Math.min(timer, hitStart);
            ratio = Math.max(0, Math.min(1, elapsed / total));
            remain = Math.max(0, total - elapsed);
            labelPrefix = '강한 지면 난타';
        } else {
            ratio = Math.max(0, Math.min(1, timer / hitStart));
            remain = Math.max(0, hitStart - timer);
        }
    } else {
        let hitStart = getHitStart(action, isP3M2Landing ? 1.0 : getDuration(action, 0.7));
        const actionTypeForGauge = String(action && action.Action_Type || '').trim().toUpperCase();
        const spawnTimingForGauge = String(action && action.Object_Spawn_Timing || '').trim().toUpperCase();
        // 발 내려찍기는 오브젝트를 ACTION_END에 생성하는 구조라, 직접 히트박스 시간이 없어도
        // 액션 종료 시점까지 머리 위 게이지가 차도록 보정한다.
        if (actionTypeForGauge === 'CAST_SPAWN_OBJECT' && spawnTimingForGauge === 'ACTION_END') {
            hitStart = getDuration(action, 0.7);
        }
        hitStart = Math.max(0.01, hitStart);
        ratio = Math.max(0, Math.min(1, timer / hitStart));
        remain = Math.max(0, hitStart - timer);
    }
    const pulse = 0.5 + Math.sin(Date.now() / 58) * 0.5;
    const warning = ratio >= 0.82;

    const modelW = (m.d && m.d.bodyX ? parseFloat(m.d.bodyX) : 80) * (m.scale || 1);
    const w = Math.max(170, modelW * 2.25);
    const h = 24;
    const x = m.x;
    const y = bodyY - bodyH * 1.42 - 40;

    ctx.save();
    ctx.translate(x, y);

    ctx.shadowColor = warning ? 'rgba(255, 96, 32, 0.82)' : 'rgba(255, 218, 96, 0.46)';
    ctx.shadowBlur = warning ? 18 + pulse * 8 : 12;

    ctx.globalAlpha = 0.98;
    ctx.fillStyle = 'rgba(5, 5, 7, 0.86)';
    ctx.strokeStyle = warning ? `rgba(255, 116, 48, ${0.82 + pulse * 0.18})` : 'rgba(255, 226, 128, 0.94)';
    ctx.lineWidth = warning ? 2.6 : 2.0;
    this.roundRect(ctx, -w / 2, -h / 2, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    this.roundRect(ctx, -w / 2 + 4, -h / 2 + 4, w - 8, Math.max(1, h * 0.34), 5);
    ctx.fill();

    const innerX = -w / 2 + 5;
    const innerY = -h / 2 + 5;
    const innerW = w - 10;
    const innerH = h - 10;
    const fillW = Math.max(0, innerW * ratio);

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    this.roundRect(ctx, innerX, innerY, innerW, innerH, 5);
    ctx.fill();

    if (fillW > 0.5) {
        const grad = ctx.createLinearGradient(innerX, 0, innerX + innerW, 0);
        grad.addColorStop(0, 'rgba(255, 245, 190, 0.98)');
        grad.addColorStop(0.42, 'rgba(255, 211, 76, 1.00)');
        grad.addColorStop(1, warning ? `rgba(255, 82, 38, ${0.96 + pulse * 0.04})` : 'rgba(255, 158, 48, 1.00)');
        ctx.fillStyle = grad;
        this.roundRect(ctx, innerX, innerY, fillW, innerH, 5);
        ctx.fill();
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = warning ? `rgba(255, 244, 206, ${0.72 + pulse * 0.28})` : 'rgba(255,255,230,0.36)';
    this.roundRect(ctx, innerX, innerY, innerW, innerH, 5);
    ctx.stroke();

    if (warning) {
        ctx.save();
        ctx.globalAlpha = 0.28 + pulse * 0.30;
        ctx.strokeStyle = 'rgba(255, 128, 52, 1)';
        ctx.lineWidth = 3;
        this.roundRect(ctx, -w / 2 - 5, -h / 2 - 5, w + 10, h + 10, 11);
        ctx.stroke();
        ctx.restore();
    }

    const label = warning ? `⚠ ${labelPrefix} ${remain.toFixed(1)}s` : `${labelPrefix} ${remain.toFixed(1)}s`;
    ctx.font = 'bold 14px Malgun Gothic, 맑은 고딕, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.86)';
    ctx.strokeText(label, 0, -h / 2 - 5);
    ctx.fillStyle = warning ? 'rgba(255,240,205,1)' : 'rgba(255,255,222,0.98)';
    ctx.fillText(label, 0, -h / 2 - 5);

    ctx.restore();
};


GameRenderer.drawKasiyasP3M2LandingWarning = function(ctx, m, groundY, bodyY, bodyH) {
    const boss = m && m.boss;
    const action = boss && boss.action;
    if (!m || !boss || !action) return;
    if ((m.hp || 0) <= 0 || m.state === 'DEAD' || m.state === 'DIE') return;
    const patternId = String((boss.activePattern && (boss.activePattern.Pattern_ID || boss.activePattern.Source_Pattern_ID)) || action.Pattern_ID || '').trim();
    const actionId = String(action.Action_ID || '').trim();
    const pose = String(action.Action_Pose_Type || '').trim().toUpperCase();
    const effect = String(action.VFX_Type || action.Effect_Render_Type || '').trim().toUpperCase();
    const name = String(action.Action_Name || '').trim();
    const isLanding = patternId === '233007'
        && actionId === '243060'
        && String(action.Action_Type || '').trim().toUpperCase() === 'ATK';
    if (!isLanding) return;
    const getHitStart = (act, fallback = 1.0) => {
        let hitStart = parseFloat(act && act.Hitbox_Start_Time);
        try {
            if (typeof MonsterManager !== 'undefined' && MonsterManager.getBossActionHitWindow) {
                const hw = MonsterManager.getBossActionHitWindow(m, act);
                if (hw && isFinite(hw.start) && hw.start >= 0) hitStart = hw.start;
            }
        } catch (e) {}
        return (isFinite(hitStart) && hitStart >= 0) ? hitStart : fallback;
    };
    const timer = Math.max(0, parseFloat(m.timer) || 0);
    const hitStart = Math.max(0.01, getHitStart(action, 1.0));
    if (timer > hitStart + 0.05) return;
    const ratio = Math.max(0, Math.min(1, timer / hitStart));
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 65);
    const rx = Math.max(150, ((m.d && m.d.bodyX ? parseFloat(m.d.bodyX) : 80) * (m.scale || 1)) * (1.45 + ratio * 0.42));
    const ry = Math.max(56, rx * 0.34);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.22 + 0.12 * pulse;
    ctx.fillStyle = 'rgba(80,0,20,0.50)';
    ctx.beginPath();
    ctx.ellipse(m.x, groundY, rx * 0.92, ry * 0.90, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.78;
    ctx.strokeStyle = ratio >= 0.82 ? 'rgba(255,88,56,0.98)' : 'rgba(255,214,124,0.96)';
    ctx.lineWidth = ratio >= 0.82 ? 4.5 : 3.2;
    ctx.shadowBlur = 18;
    ctx.shadowColor = ratio >= 0.82 ? 'rgba(255,88,56,0.86)' : 'rgba(255,214,124,0.60)';
    ctx.beginPath();
    ctx.ellipse(m.x, groundY, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = 'rgba(28,0,40,0.96)';
    for (let i = 0; i < 8; i++) {
        const a = Math.PI * 2 * i / 8 + ratio * 0.6;
        ctx.beginPath();
        ctx.moveTo(m.x + Math.cos(a) * rx * 0.18, groundY + Math.sin(a) * ry * 0.18);
        ctx.lineTo(m.x + Math.cos(a) * rx * 0.92, groundY + Math.sin(a) * ry * 0.92);
        ctx.stroke();
    }
    ctx.restore();
};

GameRenderer.drawMonsterEntity = function(ctx, m) {
    if (m && m.boss && (m.boss.kasiyasP1M3RushHidden || m.boss.kasiyasP2M2Hidden || m.boss.kasiyasP3M2Hidden)) return;
    const d = m.d;
    const w = d.bodyX * m.scale;
    const dY = d.bodyY * m.scale;
    const h = d.bodyZ * m.scale;
    let drawScale =
    (typeof MonsterAI !== 'undefined' && typeof gameState !== 'undefined' &&
        MonsterAI.getPatternTypeKey(m.state, gameState, m) === 'SPAWN')
        ? Math.min(1.0, m.timer / 0.18)
        : 1.0;
    let drawY = this.GROUND_BASE_Y + m.y;
    let bodyY = drawY - m.z;

    const isKasiyasBoss = !!(m && m.boss) || String(d && d.renderType || d && d.Model_Render_Type || '').trim().toUpperCase().indexOf('KASIYAS') >= 0;
    if (isKasiyasBoss && typeof this.drawKasiyasP3M2LandingWarning === 'function') {
        this.drawKasiyasP3M2LandingWarning(ctx, m, drawY, bodyY, h);
    }

    if (isKasiyasBoss && typeof this.drawKasiyasGroundShadow === 'function') {
        this.drawKasiyasGroundShadow(ctx, m.x, drawY, w, dY, drawScale);
    } else {
        ctx.fillStyle = 'rgba(0,0,0,0.60)';
        ctx.beginPath();
        ctx.ellipse(m.x, drawY, w / 2 * drawScale + 5, dY / 2 * drawScale, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(m.x, bodyY);
    this.drawMonsterGraphics(ctx, m, w, h, drawScale, false);
    ctx.restore();

    const bossAction = m && m.boss ? m.boss.action : null;
    const identityEffect = String(bossAction && (bossAction.VFX_Type || bossAction.Effect_Render_Type) || '').trim().toUpperCase();
    if (identityEffect === 'EFT_KASIYAS_REAL_EYES' && typeof this.drawKasiyasIdentityCue === 'function') {
        this.drawKasiyasIdentityCue(ctx, m.x, bodyY, h, true);
    }
    if ((identityEffect === 'EFT_KASIYAS_P1_M2_FINAL_SLASH_CHARGE' || identityEffect === 'EFT_KASIYAS_APOSTLE_ENERGY_CHARGE') && typeof this.drawKasiyasFinalSlashChargeCue === 'function') {
        // 대형 패턴 2번은 이동 완료 후 잔상 견제 중에도 계속 기운을 끌어모은다.
        // FINAL_SLASH_CHARGE는 최종 대기 구간이므로 더 강하게 표시한다.
        const chargeIntensity = identityEffect === 'EFT_KASIYAS_P1_M2_FINAL_SLASH_CHARGE' ? 1.12 : 0.68;
        this.drawKasiyasFinalSlashChargeCue(ctx, m.x, bodyY, h, m.faceDir || 1, chargeIntensity);
    } else if ((identityEffect === 'EFT_KASIYAS_ENERGY_CHARGE_STRONG' || identityEffect === 'EFT_KASIYAS_ENERGY_CHARGE_CLONE') && typeof this.drawKasiyasEnergyChargeCue === 'function') {
        this.drawKasiyasEnergyChargeCue(ctx, m.x, bodyY, h, identityEffect === 'EFT_KASIYAS_ENERGY_CHARGE_STRONG');
    }

    if (typeof this.drawBossOverheadShockwaveGauge === 'function') {
        this.drawBossOverheadShockwaveGauge(ctx, m, bodyY, h);
    }
};
