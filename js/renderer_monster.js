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

GameRenderer.drawKasiyasModel = function(ctx, params = {}) {
    const m = params.m || {};
    const w = Math.max(50, params.w || 80);
    const h = Math.max(120, params.h || 160);
    const face = params.face === -1 ? -1 : 1;
    const stateKey = String(params.stateKey || '').trim().toUpperCase();
    const renderType = String(params.renderType || 'RENDER_KASIYAS_P1').trim().toUpperCase();
    const poseType = this.normalizeKasiyasPoseType(String(params.poseType || 'POSE_DEFAULT').trim().toUpperCase());
    const progress = Math.max(0, Math.min(1, params.progress || 0));
    const isDead = stateKey === 'DIE' || stateKey === 'P_DIE';
    const isHit = stateKey === 'HIT' || stateKey === 'P_HIT';
    const moveTypeForPose = String(m && m.boss && m.boss.action && (m.boss.action.Action_Move_Type || m.boss.action.Move_Type) || '').trim().toUpperCase();
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
        (poseType === 'POSE_STABBING' ? (isRush ? 0.24 : 0.11) :
        poseType === 'POSE_SHOULDER_ATK' ? 0.34 :
        poseType === 'POSE_FIST_BUMPING' ? 0.10 :
        poseType === 'POSE_STOMP' ? -0.04 :
        poseType === 'POSE_P1_GROGGY' ? 0.18 :
        poseType === 'POSE_SLASH_UP' ? -0.07 :
        poseType === 'POSE_SLASH_DOWN' || poseType === 'POSE_HEAVY_SLASH_DOWN' ? 0.06 : 0);

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

    // 뒤쪽 이형 팔: 큰 손과 날카로운 손톱만 읽히게 간결화.
    drawLimb(-w * 0.27, -h * 0.74, -w * 0.47, -h * 0.58, w * 0.13, skinDark);
    drawLimb(-w * 0.47, -h * 0.58, -w * 0.39, -h * 0.40, w * 0.13, skinDark);
    drawClawHand(-w * 0.39, -h * 0.40, w * 0.24, -1);

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
        handX = w * (0.18 + 0.24 * attackPulse);
        handY = -h * (0.39 + 0.02 * attackPulse);
        swordAngle = 0.10 + smooth * 0.22;
        swordLen = h * 0.90;
        curve = 5;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 20, curve);
    } else if (poseType === 'POSE_HORIZONTAL_SLASH') {
        handX = w * (0.10 + 0.42 * smooth);
        handY = -h * (0.58 + 0.02 * attackPulse);
        swordAngle = -0.18 + (attackPulse * 0.10);
        swordLen = h * 0.98;
        curve = 4;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
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
    } else if (poseType === 'POSE_SLASH_DOWN' || poseType === 'POSE_HEAVY_SLASH_DOWN') {
        handX = w * (0.12 + 0.15 * attackPulse);
        handY = -h * (0.80 - 0.25 * smooth);
        swordAngle = -1.28 + smooth * 1.72;
        swordLen = h * (poseType === 'POSE_HEAVY_SLASH_DOWN' ? 0.93 : 0.84);
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 21, 8);
    } else {
        handX = w * 0.32;
        handY = -h * 0.52;
        swordAngle = -0.48;
        swordLen = h * 0.80;
        drawLimb(shoulderFrontX, shoulderY, handX, handY, w * 0.11, skinBase);
        drawClawHand(handX, handY, w * 0.15, 1);
        drawKatana(handX, handY, swordAngle, swordLen, 22, 8);
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

    // P2/P3는 외형 확장을 대비한 얇은 오라만 유지.
    if (renderType === 'RENDER_KASIYAS_P2' || renderType === 'RENDER_KASIYAS_P3') {
        ctx.globalAlpha = renderType === 'RENDER_KASIYAS_P3' ? 0.23 : 0.15;
        ctx.strokeStyle = renderType === 'RENDER_KASIYAS_P3' ? '#b794ff' : '#ffcf6b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.58, w * 0.50, h * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
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

    if ((stateTypeKey === 'ATK' || stateTypeKey === 'ATK_MELEE') && String(d.defType).toLowerCase() === 'superarmor') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "gold";
    }

    if (isKasiyasRender) {
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

        ctx.shadowBlur = 0;
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

GameRenderer.drawBossPatternObjectEntity = function(ctx, obj) {
    if (!obj || !obj.active || !obj.d) return;

    const d = obj.d;
    const scale = obj.scale || 1;
    const w = (d.bodyX || 80) * scale;
    const dY = (d.bodyY || 60) * scale;
    const h = (d.bodyZ || 160) * scale;
    const drawY = this.GROUND_BASE_Y + obj.y;
    const bodyY = drawY - (obj.z || 0);
    const opacity = Math.max(0.05, Math.min(1, parseFloat(obj.opacity) || 0.5));
    const brightness = Math.max(0.5, Math.min(2.4, parseFloat(obj.brightness) || 1.35));
    const action = obj.action || {};
    const objectRenderType = String(obj.renderType || obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase();
    const isCloneObject = objectRenderType === 'OBJ_KASIYAS_CLONE' || String(obj.data && obj.data.Object_Type || '').trim().toUpperCase().includes('CLONE');
    const poseType = this.normalizeKasiyasPoseType(action.Action_Pose_Type || obj.poseType || 'POSE_DEFAULT');
    const duration = (typeof MonsterManager !== 'undefined' && MonsterManager.getBossObjectActionDuration)
        ? MonsterManager.getBossObjectActionDuration(action)
        : (parseFloat(action.Action_Anim_Duration) || 0.5);
    const progress = Math.max(0, Math.min(1, (parseFloat(obj.actionTimer) || 0) / Math.max(0.001, duration)));

    ctx.save();
    ctx.globalAlpha *= opacity;
    if ('filter' in ctx) ctx.filter = isCloneObject ? `brightness(${brightness}) saturate(1.15) contrast(1.05)` : `brightness(${brightness}) saturate(0.75)`;

    ctx.fillStyle = isCloneObject ? `rgba(180,30,28,${0.13 * opacity})` : `rgba(120,190,255,${0.14 * opacity})`;
    ctx.beginPath();
    ctx.ellipse(obj.x, drawY, w * 0.58, dY * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(obj.x, bodyY);
    this.drawKasiyasModel(ctx, {
        m: { boss: { action: { Action_Move_Type: action.Move_Type || action.Action_Move_Type || '', Move_Type: action.Move_Type || '' } } },
        d: d,
        renderType: d.renderType || d.Model_Render_Type || 'RENDER_KASIYAS_P1',
        w: w,
        h: h,
        face: obj.faceDir || 1,
        stateKey: 'ATK_MELEE',
        poseType: poseType,
        progress: progress,
        isUI: false
    });
    ctx.restore();

    if ('filter' in ctx) ctx.filter = 'none';
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

GameRenderer.drawBossOverheadShockwaveGauge = function(ctx, m, bodyY, bodyH) {
    const boss = m && m.boss;
    const action = boss && boss.action;
    if (!m || !boss || !action) return;
    if ((m.hp || 0) <= 0 || m.state === 'DEAD' || m.state === 'DIE') return;

    const actionId = String(action.Action_ID || '').trim();
    const pose = String(action.Action_Pose_Type || '').trim().toUpperCase();
    const effect = String(action.Effect_Render_Type || action.VFX_Type || '').trim().toUpperCase();
    const name = String(action.Action_Name || '').trim();
    const isStomp = actionId === '241020'
        || pose === 'POSE_KASIYAS_STOMP'
        || effect === 'EFT_KASIYAS_STOMP'
        || name.indexOf('발 내려찍기') >= 0;
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

    const w = Math.max(110, (m.d && m.d.bodyX ? m.d.bodyX : 80) * (m.scale || 1) * 1.65);
    const h = 13;
    const x = m.x;
    const y = bodyY - bodyH * 1.18 - 22;
    const pulse = 0.5 + Math.sin(Date.now() / 70) * 0.5;

    ctx.save();
    ctx.translate(x, y);

    ctx.globalAlpha = 0.94;
    ctx.fillStyle = 'rgba(12, 10, 8, 0.72)';
    ctx.strokeStyle = 'rgba(255, 245, 180, 0.76)';
    ctx.lineWidth = 1.4;
    this.roundRect(ctx, -w / 2, -h / 2, w, h, 6);
    ctx.fill();
    ctx.stroke();

    const fillW = Math.max(0, (w - 6) * ratio);
    const grad = ctx.createLinearGradient(-w / 2 + 3, 0, w / 2 - 3, 0);
    grad.addColorStop(0, 'rgba(245, 245, 235, 0.92)');
    grad.addColorStop(0.62, 'rgba(255, 232, 128, 0.96)');
    grad.addColorStop(1, ratio > 0.86 ? `rgba(255, 110, 70, ${0.92 + pulse * 0.08})` : 'rgba(255, 210, 78, 0.96)');
    ctx.fillStyle = grad;
    this.roundRect(ctx, -w / 2 + 3, -h / 2 + 3, fillW, h - 6, 4);
    ctx.fill();

    ctx.strokeStyle = ratio > 0.86 ? `rgba(255, 70, 42, ${0.56 + pulse * 0.34})` : 'rgba(255,255,230,0.34)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, -w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 4);
    ctx.stroke();

    ctx.font = 'bold 10px Malgun Gothic, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.72)';
    ctx.strokeText(`충격파 ${remain.toFixed(1)}s`, 0, -h / 2 - 2);
    ctx.fillStyle = ratio > 0.86 ? 'rgba(255,235,190,0.98)' : 'rgba(255,250,210,0.96)';
    ctx.fillText(`충격파 ${remain.toFixed(1)}s`, 0, -h / 2 - 2);

    ctx.restore();
};

GameRenderer.drawMonsterEntity = function(ctx, m) {
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

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.ellipse(m.x, drawY, w / 2 * drawScale + 5, dY / 2 * drawScale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(m.x, bodyY);
    this.drawMonsterGraphics(ctx, m, w, h, drawScale, false);
    ctx.restore();

    if (typeof this.drawBossOverheadShockwaveGauge === 'function') {
        this.drawBossOverheadShockwaveGauge(ctx, m, bodyY, h);
    }
};