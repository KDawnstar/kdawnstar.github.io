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
    const transitionGrabProgress = isP1ToP2TransitionCutscene ? Math.max(0, Math.min(1, (transitionTimer - 5.6) / 0.9)) : 0;
    const transitionUseP2Model = isP1ToP2TransitionCutscene && transitionTimer >= 6.4;
    const renderType = transitionUseP2Model ? 'RENDER_KASIYAS_P2' : baseRenderType;
    const isKasiyasPhase2 = renderType === 'RENDER_KASIYAS_P2';
    const isKasiyasPhase3 = renderType === 'RENDER_KASIYAS_P3';
    const poseType = this.normalizeKasiyasPoseType(String(params.poseType || 'POSE_DEFAULT').trim().toUpperCase());
    const progress = Math.max(0, Math.min(1, params.progress || 0));
    const isDead = stateKey === 'DIE' || stateKey === 'P_DIE';
    const isHit = stateKey === 'HIT' || stateKey === 'P_HIT';
    const moveTypeForPose = String(m && m.boss && m.boss.action && (m.boss.action.Action_Move_Type || m.boss.action.Move_Type) || '').trim().toUpperCase();
    const eyeEffectType = String(params.eyeEffectType || (m && m.boss && m.boss.action && (m.boss.action.VFX_Type || m.boss.action.Effect_Render_Type)) || '').trim().toUpperCase();
    const isRush = moveTypeForPose === 'RUSH' || moveTypeForPose === 'DASH';

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
    const bladeCore = isDead ? '#a7adb5' : '#edf7ff';
    const bladeEdge = isDead ? '#68707a' : '#9ec5e8';
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

    const drawKatana = (handX, handY, angle, length, handleLen = 22, curve = 7) => {
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
    if (isRush) ctx.translate(w * 0.07 * attackPulse, 0);
    ctx.rotate(bodyLean * (0.45 + attackPulse * 0.55));

    // 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.02, w * 0.50, h * 0.055, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isKasiyasPhase2) {
        drawKasiyasPhase2AuraBack();
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
        const offElbowX = -w * 0.40;
        const offElbowY = -h * 0.56;
        const offHandX = -w * 0.42;
        const offHandY = -h * 0.46;
        drawLimb(offShoulderX, offShoulderY, offElbowX, offElbowY, w * 0.12, skinDark);
        drawLimb(offElbowX, offElbowY, offHandX, offHandY, w * 0.11, skinDark);
        drawClawHand(offHandX, offHandY, w * 0.15, -1);
        // 보조 검도 정수 파지로 잡고, 칼날은 바깥 아래 방향으로 펼친다.
        drawKatana(offHandX - w * 0.02, offHandY + h * 0.01, 2.46, h * 0.86, 22, 6);
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
        if (isKasiyasPhase2) {
            // 2페이즈 기본 자세: 기존 카시야스 기본 모델 위에 검 두 자루만 자연스럽게 추가한 느낌.
            // 양손 모두 정수 파지이며, 칼날은 좌우 바깥 아래 방향으로 펼친다.
            handX = w * 0.40;
            handY = -h * 0.46;
            swordAngle = 0.62;
            swordLen = h * 0.86;
            drawLimb(shoulderFrontX - w * 0.01, shoulderY + h * 0.02, handX, handY, w * 0.11, skinBase);
            drawClawHand(handX, handY, w * 0.15, 1);
            drawKatana(handX, handY, swordAngle, swordLen, 22, 7);
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
            ctx.globalAlpha = 0.23;
            ctx.strokeStyle = '#b794ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, -h * 0.58, w * 0.50, h * 0.38, 0, 0, Math.PI * 2);
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

    // 충격파 게이지는 발 내려찍기 액션에서만 표시한다.
    // Action_ID는 데이터 테이블에 액션이 추가되면 밀릴 수 있으므로 조건에서 제외한다.
    const isStomp = pose === 'POSE_KASIYAS_STOMP'
        || effect === 'EFT_KASIYAS_STOMP'
        || name.indexOf('발 내려찍기') >= 0
        || name.indexOf('발구르기') >= 0
        || name.indexOf('충격파') >= 0;
    if (!isStomp) return;

    let duration = parseFloat(action.Action_Anim_Duration);
    try {
        if (typeof MonsterManager !== 'undefined' && MonsterManager.getBossActionDuration) {
            const d = MonsterManager.getBossActionDuration(m, action, (typeof gameState !== 'undefined' ? gameState : null));
            if (isFinite(d) && d > 0) duration = d;
        }
    } catch (e) {}
    if (!isFinite(duration) || duration <= 0) duration = 0.7;

    const timer = Math.max(0, parseFloat(m.timer) || 0);
    const ratio = Math.max(0, Math.min(1, timer / Math.max(0.01, duration)));
    const remain = Math.max(0, duration - timer);
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

    const label = warning ? `⚠ 충격파 ${remain.toFixed(1)}s` : `충격파 발생 ${remain.toFixed(1)}s`;
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

GameRenderer.drawMonsterEntity = function(ctx, m) {
    if (m && m.boss && m.boss.kasiyasP1M3RushHidden) return;
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
