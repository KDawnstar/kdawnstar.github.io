// [카시야스 보스전] 이펙트 렌더링 (effect_renderer.js)
GameRenderer.drawProjectileEntity = function(ctx, p) {
    let drawY = this.GROUND_BASE_Y + p.y;
    let drawZ = drawY - p.z;
    const projectileRenderType = String(p.renderType || '').trim();

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(p.x, drawY, p.hitX / 2, p.hitY / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(p.x, drawZ);
    ctx.scale(p.vx > 0 ? 1 : -1, 1);

    if (projectileRenderType === 'PROJECTILE_SLASH_WAVE') {
        ctx.beginPath();
        ctx.arc(0, 0, p.hitX, -Math.PI / 2, Math.PI / 2);
        ctx.arc(-20, 0, p.hitX, Math.PI / 2, -Math.PI / 2, true);
        let grad = ctx.createLinearGradient(0, -p.hitZ, 0, p.hitZ);
        grad.addColorStop(0, "rgba(255,255,255,0.8)");
        grad.addColorStop(0.5, "rgba(52, 152, 219, 0.9)");
        grad.addColorStop(1, "rgba(255,255,255,0.8)");
        ctx.fillStyle = grad;
        ctx.fill();
    } else if (projectileRenderType === 'PROJECTILE_ENERGY_BOMB') {
        ctx.fillStyle = "rgba(231, 76, 60, 0.8)";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-40, -15);
        ctx.lineTo(-60, 0);
        ctx.lineTo(-40, 15);
        ctx.fill();

        ctx.fillStyle = "#2c3e50";
        ctx.beginPath();
        ctx.arc(0, 0, p.hitX / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#7f8c8d";
        ctx.beginPath();
        ctx.arc(p.hitX / 6, -p.hitX / 6, p.hitX / 6, 0, Math.PI * 2);
        ctx.fill();
    } else if (projectileRenderType === 'PROJECTILE_ICE_BOLT') {
        ctx.fillStyle = "#3498db";
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-15, -8);
        ctx.lineTo(-15, 8);
        ctx.fill();

        ctx.fillStyle = "#ecf0f1";
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-5, -4);
        ctx.lineTo(-5, 4);
        ctx.fill();
    } else if (projectileRenderType === 'PROJECTILE_ARROW') {
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(-15, -2, 30, 4);
        ctx.fillStyle = "#bdc3c7";
        ctx.beginPath();
        ctx.moveTo(15, -4);
        ctx.lineTo(25, 0);
        ctx.lineTo(15, 4);
        ctx.fill();
    } else if (projectileRenderType === 'PROJECTILE_STONE') {
        ctx.rotate(p.life * 10);
        ctx.fillStyle = "#7f8c8d";
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-5, -10);
        ctx.lineTo(5, -8);
        ctx.lineTo(10, 0);
        ctx.lineTo(5, 10);
        ctx.lineTo(-8, 8);
        ctx.fill();
    } else if (projectileRenderType === 'PROJECTILE_BULLET') {
        ctx.rotate(p.vx > 0 ? 0 : Math.PI);
        ctx.fillStyle = "#f1c40f";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#f39c12";
        ctx.beginPath();
        ctx.ellipse(0, 0, p.hitX, p.hitZ / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(p.hitX / 2, 0, p.hitX / 4, p.hitZ / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    } else {
        ctx.rotate(p.vx > 0 ? 0 : Math.PI);
        ctx.fillStyle = "#f1c40f";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#f39c12";
        ctx.beginPath();
        ctx.ellipse(0, 0, p.hitX, p.hitZ / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(p.hitX / 2, 0, p.hitX / 4, p.hitZ / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    ctx.restore();
};

GameRenderer.drawFlameFang = function(ctx, cx, cy, dir, fw, fl, alpha) {
    const outerGrad = ctx.createLinearGradient(cx, cy, cx, cy + dir * fl);

    if (dir < 0) {
        outerGrad.addColorStop(0, `rgba(255, 250, 205, ${0.98 * alpha})`);
        outerGrad.addColorStop(0.35, `rgba(255, 214, 120, ${0.96 * alpha})`);
        outerGrad.addColorStop(0.72, `rgba(255, 145, 70, ${0.92 * alpha})`);
        outerGrad.addColorStop(1, `rgba(185, 55, 18, ${0.82 * alpha})`);
    } else {
        outerGrad.addColorStop(0, `rgba(185, 55, 18, ${0.82 * alpha})`);
        outerGrad.addColorStop(0.28, `rgba(255, 145, 70, ${0.92 * alpha})`);
        outerGrad.addColorStop(0.65, `rgba(255, 214, 120, ${0.96 * alpha})`);
        outerGrad.addColorStop(1, `rgba(255, 250, 205, ${0.98 * alpha})`);
    }

    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.moveTo(cx - fw * 0.58, cy);
    ctx.quadraticCurveTo(cx - fw * 0.50, cy + dir * fl * 0.30, cx, cy + dir * fl);
    ctx.quadraticCurveTo(cx + fw * 0.50, cy + dir * fl * 0.30, cx + fw * 0.58, cy);
    ctx.quadraticCurveTo(cx + fw * 0.18, cy + dir * fl * 0.10, cx, cy + dir * fl * 0.16);
    ctx.quadraticCurveTo(cx - fw * 0.18, cy + dir * fl * 0.10, cx - fw * 0.58, cy);
    ctx.closePath();
    ctx.fill();

    const innerGrad = ctx.createLinearGradient(cx, cy, cx, cy + dir * fl * 0.78);

    if (dir < 0) {
        innerGrad.addColorStop(0, `rgba(255,255,240,${0.92 * alpha})`);
        innerGrad.addColorStop(0.45, `rgba(255,235,170,${0.78 * alpha})`);
        innerGrad.addColorStop(1, `rgba(255,170,90,${0.08 * alpha})`);
    } else {
        innerGrad.addColorStop(0, `rgba(255,170,90,${0.08 * alpha})`);
        innerGrad.addColorStop(0.55, `rgba(255,235,170,${0.78 * alpha})`);
        innerGrad.addColorStop(1, `rgba(255,255,240,${0.92 * alpha})`);
    }

    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.moveTo(cx - fw * 0.22, cy + dir * fl * 0.06);
    ctx.quadraticCurveTo(cx - fw * 0.10, cy + dir * fl * 0.26, cx, cy + dir * fl * 0.72);
    ctx.quadraticCurveTo(cx + fw * 0.10, cy + dir * fl * 0.26, cx + fw * 0.22, cy + dir * fl * 0.06);
    ctx.closePath();
    ctx.fill();
};

GameRenderer.drawBiteEffect = function(ctx, eff, alpha) {
    const biteW = Math.max(64, (eff.w || 70) * 0.72);
    const biteH = Math.max(54, (eff.h || 50) * 0.58);
    const closeRatio = 1 - alpha;
    const jawGap = Math.max(10, 28 - closeRatio * 18);
    const fangCount = 9;
    const fangSpan = biteW * 0.88;
    const fangStep = fangSpan / (fangCount - 1);
    const fangBaseW = Math.max(8, biteW * 0.11);
    const fangLen = Math.max(26, biteH * (0.55 + closeRatio * 0.18));
    const glowScale = 1 + closeRatio * 0.08;

    ctx.save();
    ctx.scale(eff.dir || 1, 1);
    ctx.scale(glowScale, glowScale);

    const jawShadowGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, biteW * 0.42);
    jawShadowGrad.addColorStop(0, `rgba(80, 20, 10, ${0.22 * alpha})`);
    jawShadowGrad.addColorStop(0.65, `rgba(40, 10, 5, ${0.14 * alpha})`);
    jawShadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = jawShadowGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, biteW * 0.42, biteH * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    const topY = -jawGap;
    const bottomY = jawGap;

    for (let i = 0; i < fangCount; i++) {
        const offset = -fangSpan / 2 + fangStep * i;
        const edgeRatio = Math.abs(i - (fangCount - 1) / 2) / ((fangCount - 1) / 2);
        const scale = 0.86 + (1 - edgeRatio) * 0.30;

        this.drawFlameFang(ctx, offset, topY, -1, fangBaseW * scale, fangLen * scale, alpha);
        this.drawFlameFang(ctx, offset, bottomY, 1, fangBaseW * scale, fangLen * scale, alpha);
    }

    ctx.strokeStyle = `rgba(255, 245, 220, ${0.32 * alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-biteW * 0.16, -jawGap * 0.55);
    ctx.lineTo(biteW * 0.16, jawGap * 0.55);
    ctx.moveTo(biteW * 0.16, -jawGap * 0.55);
    ctx.lineTo(-biteW * 0.16, jawGap * 0.55);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 210, 150, ${0.26 * alpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, biteW * 0.11, biteH * 0.10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.34;
    for (let i = 0; i < 4; i++) {
        const px = -biteW * 0.18 + i * biteW * 0.12;
        const py = (i % 2 === 0 ? -1 : 1) * jawGap * 0.28;
        ctx.fillStyle = "rgba(255, 235, 180, 0.85)";
        ctx.beginPath();
        ctx.arc(px, py, 2 + i * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
};

GameRenderer.drawPunchEffect = function(ctx, eff, alpha) {
    const baseScale = eff.burstScale || 1;
    const championScale = eff.effectScale || 1;
    const r = 34 * baseScale * championScale;
    const a = Math.max(0, Math.min(1, alpha));

    const addRoundRectPath = (x, y, w, h, radius) => {
        const rr = Math.min(radius, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.lineTo(x + w - rr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
        ctx.lineTo(x + w, y + h - rr);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
        ctx.lineTo(x + rr, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
        ctx.lineTo(x, y + rr);
        ctx.quadraticCurveTo(x, y, x + rr, y);
        ctx.closePath();
    };

    const fistFill = eff.color || `rgba(255, 205, 95, ${0.98 * a})`;
    const fistShade = `rgba(214, 112, 34, ${0.92 * a})`;
    const fistLine = `rgba(135, 48, 20, ${0.98 * a})`;
    const fistHighlight = eff.accentColor || `rgba(255, 240, 185, ${0.92 * a})`;

    ctx.save();
    ctx.scale(eff.dir || 1, 1);

    ctx.fillStyle = fistFill;

    addRoundRectPath(-r * 0.46, -r * 0.04, r * 0.82, r * 0.52, r * 0.12);
    ctx.fill();

    for (let i = 0; i < 4; i++) {
        const kx = -r * 0.46 + i * r * 0.20;
        addRoundRectPath(kx, -r * 0.46, r * 0.16, r * 0.34, r * 0.06);
        ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(-r * 0.44, r * 0.02);
    ctx.quadraticCurveTo(-r * 0.72, 0, -r * 0.67, r * 0.30);
    ctx.quadraticCurveTo(-r * 0.50, r * 0.42, -r * 0.24, r * 0.30);
    ctx.quadraticCurveTo(-r * 0.30, r * 0.18, -r * 0.44, r * 0.02);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = fistShade;
    addRoundRectPath(-r * 0.38, r * 0.16, r * 0.62, r * 0.20, r * 0.08);
    ctx.fill();

    for (let i = 0; i < 4; i++) {
        const sx = -r * 0.42 + i * r * 0.20;
        addRoundRectPath(sx, -r * 0.18, r * 0.12, r * 0.10, r * 0.04);
        ctx.fill();
    }

    ctx.fillStyle = fistHighlight;
    addRoundRectPath(-r * 0.20, -r * 0.28, r * 0.42, r * 0.08, r * 0.03);
    ctx.fill();

    ctx.strokeStyle = fistLine;
    ctx.lineWidth = Math.max(2.4, r * 0.07);

    addRoundRectPath(-r * 0.46, -r * 0.04, r * 0.82, r * 0.52, r * 0.12);
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
        const kx = -r * 0.46 + i * r * 0.20;
        addRoundRectPath(kx, -r * 0.46, r * 0.16, r * 0.34, r * 0.06);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(-r * 0.44, r * 0.02);
    ctx.quadraticCurveTo(-r * 0.72, 0, -r * 0.67, r * 0.30);
    ctx.quadraticCurveTo(-r * 0.50, r * 0.42, -r * 0.24, r * 0.30);
    ctx.quadraticCurveTo(-r * 0.30, r * 0.18, -r * 0.44, r * 0.02);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    for (let i = 1; i <= 3; i++) {
        const x = -r * 0.46 + i * r * 0.20;
        ctx.moveTo(x, -r * 0.14);
        ctx.lineTo(x, r * 0.16);
    }
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 245, 225, ${0.72 * a})`;
    ctx.lineWidth = Math.max(1.8, r * 0.04);
    ctx.beginPath();
    ctx.moveTo(r * 0.42, -r * 0.18);
    ctx.lineTo(r * 0.62, -r * 0.30);
    ctx.moveTo(r * 0.50, 0);
    ctx.lineTo(r * 0.76, 0);
    ctx.moveTo(r * 0.42, r * 0.18);
    ctx.lineTo(r * 0.62, r * 0.30);
    ctx.stroke();

    ctx.restore();
};

GameRenderer.drawEffectEntity = function(ctx, eff, player) {
    const renderer = this;
    let drawY = this.GROUND_BASE_Y + eff.y;
    let drawZ = drawY - eff.z;

    ctx.save();
    ctx.translate(eff.x, drawZ);

    let alpha = eff.maxLife > 0 ? (eff.life / eff.maxLife) : 1;
    alpha = Math.max(0, Math.min(1, alpha));
    ctx.globalAlpha = alpha;

    if (eff.type === 'rushIssen') {
        const slashW = Math.max(120, eff.w || 360);
        const slashH = Math.max(14, eff.h || 36);
        const renderAngle = (eff.pathAngle !== undefined && eff.pathAngle !== null)
            ? eff.pathAngle
            : ((eff.dir || 1) >= 0 ? 0 : Math.PI);

        ctx.rotate(renderAngle);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const core = eff.color || `rgba(255,48,44,${0.98 * alpha})`;
        const accent = eff.accentColor || `rgba(50,0,0,${0.92 * alpha})`;
        const outline = `rgba(18,0,0,${0.92 * alpha})`;
        const hot = `rgba(255,120,92,${0.90 * alpha})`;

        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(210,0,0,0.72)';

        const outlineGrad = ctx.createLinearGradient(-slashW / 2, 0, slashW / 2, 0);
        outlineGrad.addColorStop(0, 'rgba(0,0,0,0)');
        outlineGrad.addColorStop(0.12, `rgba(15,0,0,${0.72 * alpha})`);
        outlineGrad.addColorStop(0.50, outline);
        outlineGrad.addColorStop(0.88, `rgba(15,0,0,${0.72 * alpha})`);
        outlineGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = outlineGrad;
        ctx.beginPath();
        ctx.moveTo(-slashW * 0.53, -slashH * 0.30);
        ctx.lineTo(slashW * 0.49, -slashH * 0.68);
        ctx.quadraticCurveTo(slashW * 0.58, 0, slashW * 0.49, slashH * 0.68);
        ctx.lineTo(-slashW * 0.53, slashH * 0.30);
        ctx.quadraticCurveTo(-slashW * 0.63, 0, -slashW * 0.53, -slashH * 0.30);
        ctx.closePath();
        ctx.fill();

        const grad = ctx.createLinearGradient(-slashW / 2, 0, slashW / 2, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.16, `rgba(35,0,0,${0.58 * alpha})`);
        grad.addColorStop(0.50, core);
        grad.addColorStop(0.78, `rgba(130,0,0,${0.66 * alpha})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-slashW * 0.50, -slashH * 0.18);
        ctx.lineTo(slashW * 0.46, -slashH * 0.52);
        ctx.quadraticCurveTo(slashW * 0.52, 0, slashW * 0.46, slashH * 0.52);
        ctx.lineTo(-slashW * 0.50, slashH * 0.18);
        ctx.quadraticCurveTo(-slashW * 0.56, 0, -slashW * 0.50, -slashH * 0.18);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(4.2, slashH * 0.18);
        ctx.beginPath();
        ctx.moveTo(-slashW * 0.50, slashH * 0.20);
        ctx.lineTo(slashW * 0.50, -slashH * 0.20);
        ctx.stroke();

        ctx.strokeStyle = hot;
        ctx.lineWidth = Math.max(2.0, slashH * 0.075);
        ctx.beginPath();
        ctx.moveTo(-slashW * 0.46, -slashH * 0.06);
        ctx.lineTo(slashW * 0.46, -slashH * 0.28);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255,30,30,${0.52 * alpha})`;
        ctx.lineWidth = Math.max(1.2, slashH * 0.05);
        for (let i = 0; i < 3; i++) {
            const y = (i - 1) * slashH * 0.44;
            ctx.beginPath();
            ctx.moveTo(-slashW * 0.42 + i * slashW * 0.05, y);
            ctx.lineTo(-slashW * 0.15 + i * slashW * 0.04, y - slashH * 0.16);
            ctx.stroke();
        }


    } else if (eff.type === 'pathResidualSlashField') {
        const pathW = Math.max(80, eff.w || 420);
        const pathD = Math.max(24, eff.d || 120);
        const fieldH = Math.max(30, eff.h || 120);
        const renderAngle = (eff.pathAngle !== undefined && eff.pathAngle !== null) ? eff.pathAngle : 0;
        const elapsed = Math.max(0, (eff.maxLife || 0) - (eff.life || 0));
        const warningDur = Math.max(0.05, eff.warningDuration || 0);
        const delayDur = Math.max(0, eff.delayDuration || 0);
        const hitDur = Math.max(0.05, eff.hitDuration || 0.2);
        const chargeStart = warningDur;
        const activeStart = warningDur + delayDur;
        const isActive = elapsed >= activeStart;
        const isCharge = !isActive && elapsed >= chargeStart;
        const chargeT = delayDur > 0 ? Math.max(0, Math.min(1, (elapsed - chargeStart) / delayDur)) : (isActive ? 1 : 0);
        const activeT = hitDur > 0 ? Math.max(0, Math.min(1, (elapsed - activeStart) / hitDur)) : 0;
        const pulse = 0.5 + Math.sin(Date.now() / 70) * 0.5;
        const seed = eff.seed || 71;
        const count = Math.max(10, Math.min(28, Math.round(pathW / 58)));

        // 잔류 검격은 돌진 시작과 동시에 경로 전체를 미리 깔지 않는다.
        // warning 구간에는 카시야스가 실제로 돌진하며 지나간 위치까지만 칼날 조각을 누적 표시한다.
        // delay/active 구간에 들어가면 이미 생성된 전체 궤적이 유지되고, 이후 붉게 변하며 활성화된다.
        const visibleProgress = isCharge || isActive
            ? 1
            : Math.max(0, Math.min(1, warningDur > 0 ? elapsed / warningDur : 1));
        const leadingFadeWidth = 0.14;

        ctx.globalAlpha = Math.max(0, Math.min(1, (0.62 + alpha * 0.38)));
        ctx.rotate(renderAngle);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const dormantEdge = 'rgba(10,28,46,0.78)';
        const dormantCore = 'rgba(210,244,255,0.88)';
        const dormantHot = 'rgba(105,205,255,0.72)';
        const chargeEdge = `rgba(${Math.round(42 + chargeT * 18)},0,0,${0.70 + chargeT * 0.16})`;
        const chargeCore = `rgba(${Math.round(170 + chargeT * 55)},${Math.round(40 - chargeT * 22)},${Math.round(46 - chargeT * 28)},${0.64 + chargeT * 0.22})`;
        const chargeHot = `rgba(255,${Math.round(112 - chargeT * 64)},${Math.round(92 - chargeT * 58)},${0.48 + chargeT * 0.30})`;
        const activeEdge = 'rgba(8,0,0,0.98)';
        const activeCore = `rgba(255,24,22,${0.90 + pulse * 0.08})`;
        const activeHot = `rgba(255,104,78,${0.72 + pulse * 0.18})`;

        const edgeColor = isActive ? activeEdge : (isCharge ? chargeEdge : dormantEdge);
        const coreColor = isActive ? activeCore : (isCharge ? chargeCore : dormantCore);
        const hotColor = isActive ? activeHot : (isCharge ? chargeHot : dormantHot);
        const glowColor = isActive
            ? 'rgba(230,0,0,0.78)'
            : (isCharge ? 'rgba(190,0,0,0.42)' : 'rgba(90,190,255,0.32)');

        ctx.shadowBlur = isActive ? 20 : (isCharge ? 11 : 8);
        ctx.shadowColor = glowColor;

        // 천귀살 잔류 검격은 돌진 중에는 흰색/푸른색의 칼날 조각으로 남고,
        // 딜레이가 끝나며 같은 조각이 붉게 물든 뒤 그 자체가 활성화된다.
        // 별도의 큰 폭발선을 추가하지 않아, 생성 단계가 실제 피해 판정처럼 보이지 않도록 한다.
        for (let i = 0; i < count; i++) {
            const t = (i + 0.35) / count;
            if (t > visibleProgress + 0.012) continue;

            const noise = Math.sin((i + 1) * 12.9898 + seed * 0.017) * 43758.5453;
            const n = noise - Math.floor(noise);
            const noise2 = Math.sin((i + 5) * 78.233 + seed * 0.031) * 17341.9281;
            const n2 = noise2 - Math.floor(noise2);
            const side = (n * 2 - 1) * pathD * 0.38;
            const localX = -pathW / 2 + pathW * t;
            const localY = side;
            const trailAge = isCharge || isActive
                ? 1
                : Math.max(0, Math.min(1, (visibleProgress - t + leadingFadeWidth) / leadingFadeWidth));
            const bladeW = Math.max(42, pathD * (0.54 + (i % 4) * 0.075));
            const bladeH = Math.max(12, fieldH * (0.070 + (i % 3) * 0.012));
            const bladeRot = ((i % 2 === 0) ? -0.36 : 0.36) + (n2 - 0.5) * 0.38;
            const scalePulse = isActive ? (1.04 + pulse * 0.10) : (isCharge ? 1 + chargeT * 0.10 : 1);

            ctx.save();
            ctx.translate(localX, localY);
            ctx.rotate(bladeRot);
            ctx.scale(scalePulse, scalePulse);

            const bladeAlpha = isActive ? (0.92 + pulse * 0.08) : (isCharge ? 0.62 + chargeT * 0.28 : 0.40 + trailAge * 0.24);
            ctx.globalAlpha = Math.max(0, Math.min(1, bladeAlpha * alpha * (isCharge || isActive ? 1 : Math.max(0.28, trailAge))));

            // 외곽: 길쭉한 나뭇잎/칼날 파편 실루엣
            ctx.fillStyle = edgeColor;
            ctx.beginPath();
            ctx.moveTo(-bladeW * 0.52, 0);
            ctx.quadraticCurveTo(-bladeW * 0.18, -bladeH * 0.72, bladeW * 0.54, -bladeH * 0.18);
            ctx.quadraticCurveTo(bladeW * 0.64, 0, bladeW * 0.54, bladeH * 0.18);
            ctx.quadraticCurveTo(-bladeW * 0.18, bladeH * 0.72, -bladeW * 0.52, 0);
            ctx.closePath();
            ctx.fill();

            // 내부: 생성 단계는 흰/푸른 코어, 활성 단계는 붉은 코어
            const grad = ctx.createLinearGradient(-bladeW * 0.46, 0, bladeW * 0.48, 0);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.16, hotColor);
            grad.addColorStop(0.52, coreColor);
            grad.addColorStop(0.86, hotColor);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(-bladeW * 0.45, 0);
            ctx.quadraticCurveTo(-bladeW * 0.12, -bladeH * 0.42, bladeW * 0.45, -bladeH * 0.10);
            ctx.quadraticCurveTo(bladeW * 0.52, 0, bladeW * 0.45, bladeH * 0.10);
            ctx.quadraticCurveTo(-bladeW * 0.12, bladeH * 0.42, -bladeW * 0.45, 0);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = isActive ? 'rgba(30,0,0,0.92)' : (isCharge ? 'rgba(60,0,0,0.68)' : 'rgba(5,26,44,0.52)');
            ctx.lineWidth = Math.max(0.9, bladeH * 0.11);
            ctx.beginPath();
            ctx.moveTo(-bladeW * 0.42, bladeH * 0.04);
            ctx.quadraticCurveTo(0, -bladeH * 0.12, bladeW * 0.42, -bladeH * 0.04);
            ctx.stroke();

            if (isActive) {
                ctx.globalAlpha = Math.max(0, Math.min(1, (0.35 + pulse * 0.20) * alpha));
                ctx.strokeStyle = 'rgba(255,42,32,0.82)';
                ctx.lineWidth = Math.max(1.1, bladeH * 0.12);
                ctx.beginPath();
                ctx.moveTo(-bladeW * 0.36, -bladeH * 0.12);
                ctx.lineTo(bladeW * 0.34, bladeH * 0.08);
                ctx.stroke();
            }

            ctx.restore();
        }

        // 활성화 순간에는 전체 경로가 짧게 붉게 흔들리는 정도만 더한다.
        // 큰 폭발선을 따로 뽑지 않아, 잔류 검격 조각 자체가 터지는 느낌을 유지한다.
        if (isActive) {
            ctx.globalAlpha = Math.max(0, Math.min(1, (0.10 + (1 - activeT) * 0.16 + pulse * 0.05) * alpha));
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(230,0,0,0.48)';
            ctx.strokeStyle = 'rgba(255,36,30,0.38)';
            ctx.lineWidth = Math.max(1.6, pathD * 0.014);
            ctx.beginPath();
            ctx.moveTo(-pathW * 0.46, -pathD * 0.06);
            ctx.quadraticCurveTo(0, pathD * 0.035, pathW * 0.46, -pathD * 0.06);
            ctx.stroke();
        }

    } else if (eff.type === 'pathLineSlash') {
        const slashW = Math.max(28, eff.w || 56);
        const slashH = Math.max(18, eff.h || 32);
        const renderAngle = (eff.pathAngle !== undefined && eff.pathAngle !== null)
            ? eff.pathAngle
            : ((eff.dir || 1) >= 0 ? 0 : Math.PI);

        ctx.rotate(renderAngle);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const core = eff.color || `rgba(255,56,52,${0.95 * alpha})`;
        const accent = eff.accentColor || `rgba(24,0,0,${0.90 * alpha})`;

        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(190,0,0,0.66)';

        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(4.0, slashH * 0.16);
        ctx.beginPath();
        ctx.moveTo(-slashW * 0.52, slashH * 0.22);
        ctx.lineTo(slashW * 0.52, -slashH * 0.22);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(120,0,0,${0.78 * alpha})`;
        ctx.lineWidth = Math.max(2.3, slashH * 0.09);
        ctx.beginPath();
        ctx.moveTo(-slashW * 0.50, slashH * 0.20);
        ctx.lineTo(slashW * 0.50, -slashH * 0.20);
        ctx.stroke();

        ctx.strokeStyle = core;
        ctx.lineWidth = Math.max(1.4, slashH * 0.05);
        ctx.beginPath();
        ctx.moveTo(-slashW * 0.46, slashH * 0.12);
        ctx.lineTo(slashW * 0.46, -slashH * 0.12);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255,120,110,${0.56 * alpha})`;
        ctx.lineWidth = Math.max(1, slashH * 0.035);
        ctx.beginPath();
        ctx.moveTo(-slashW * 0.22, -slashH * 0.25);
        ctx.lineTo(slashW * 0.22, slashH * 0.25);
        ctx.stroke();

    } else if (eff.type === 'swordplaySlashes') {
        const slashW = Math.max(190, eff.w || 260);
        const slashH = Math.max(100, eff.h || 150);
        const dir = eff.dir === -1 ? -1 : 1;
        const t = 1 - alpha;
        const pulse = 0.92 + Math.sin(Date.now() / 36) * 0.08;
        const core = eff.color || `rgba(255,72,58,${0.94 * alpha})`;
        const accent = eff.accentColor || `rgba(18,0,0,${0.92 * alpha})`;
        const hot = `rgba(255,174,128,${0.70 * alpha})`;

        ctx.save();
        ctx.scale(dir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(210,0,0,0.74)';

        // 난무의 중심에 검붉은 기운을 깔아, 다단히트가 같은 영역을 난도질하는 느낌을 준다.
        const coreGrad = ctx.createRadialGradient(0, -slashH * 0.06, 10, 0, 0, slashW * 0.42);
        coreGrad.addColorStop(0, `rgba(255,70,50,${0.15 * alpha})`);
        coreGrad.addColorStop(0.54, `rgba(100,0,0,${0.13 * alpha})`);
        coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, slashW * 0.46, slashH * 0.46, 0, 0, Math.PI * 2);
        ctx.fill();

        const arcCount = 11;
        for (let i = 0; i < arcCount; i++) {
            const ratio = i / Math.max(1, arcCount - 1);
            const angle = -0.78 + ratio * 1.56 + Math.sin(Date.now() / 80 + i) * 0.045;
            const rx = slashW * (0.24 + (i % 4) * 0.055) * pulse;
            const ry = slashH * (0.20 + (i % 3) * 0.055) * pulse;
            const offX = (Math.sin(i * 1.73 + t * 3.2) * slashW * 0.12);
            const offY = (Math.cos(i * 1.31 + t * 2.4) * slashH * 0.18) - slashH * 0.05;
            const start = angle - 1.03;
            const end = angle + 1.03;

            ctx.save();
            ctx.translate(offX, offY);
            ctx.rotate((i % 2 === 0 ? -0.22 : 0.22) + t * (i % 2 === 0 ? 0.20 : -0.20));

            ctx.strokeStyle = accent;
            ctx.lineWidth = Math.max(7, slashH * (0.050 + (i % 2) * 0.012));
            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, 0, start, end);
            ctx.stroke();

            ctx.strokeStyle = core;
            ctx.lineWidth = Math.max(3.2, slashH * (0.024 + (i % 2) * 0.006));
            ctx.beginPath();
            ctx.ellipse(0, 0, rx * 0.98, ry * 0.98, 0, start + 0.05, end - 0.05);
            ctx.stroke();

            if (i % 3 === 0) {
                ctx.strokeStyle = hot;
                ctx.lineWidth = Math.max(1.4, slashH * 0.010);
                ctx.beginPath();
                ctx.ellipse(0, 0, rx * 0.82, ry * 0.82, 0, start + 0.36, end - 0.36);
                ctx.stroke();
            }
            ctx.restore();
        }

        // 주변으로 튀는 짧은 검흔 조각.
        ctx.shadowBlur = 8;
        for (let i = 0; i < 10; i++) {
            const a = (Math.PI * 2 / 10) * i + t * 2.0;
            const r1 = slashW * (0.20 + (i % 3) * 0.035);
            const x1 = Math.cos(a) * r1;
            const y1 = Math.sin(a) * slashH * 0.28;
            const len = 18 + (i % 4) * 7;
            ctx.strokeStyle = i % 2 === 0 ? core : hot;
            ctx.lineWidth = i % 2 === 0 ? 2.2 : 1.4;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + Math.cos(a + 0.25) * len, y1 + Math.sin(a + 0.25) * len * 0.55);
            ctx.stroke();
        }

        ctx.restore();

    } else if (eff.type === 'chargeHorizontalSlash') {
        // 대형 패턴 1번 강화 횡베기: hitbox 타원 전체를 덮는 검호로 표시한다.
        const slashW = Math.max(140, (eff.w || 380) * 0.98);
        const slashD = Math.max(76, (eff.d || eff.h || 180) * 0.96);
        const dir = eff.dir === -1 ? -1 : 1;
        const core = eff.color || `rgba(255,66,48,${0.96 * alpha})`;
        const accent = eff.accentColor || `rgba(12,0,0,${0.92 * alpha})`;
        const hot = `rgba(255,232,190,${0.84 * alpha})`;
        const halfW = slashW * 0.50;
        const halfD = slashD * 0.50;

        ctx.save();
        ctx.scale(dir, 1);
        ctx.rotate(-0.035);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 24;
        ctx.shadowColor = 'rgba(220,0,0,0.78)';

        // 판정 범위 전체를 읽을 수 있도록 낮은 투명도의 타원 발광을 먼저 깐다.
        const rangeGrad = ctx.createRadialGradient(0, 0, Math.max(8, halfD * 0.10), 0, 0, Math.max(halfW, halfD));
        rangeGrad.addColorStop(0, `rgba(255,82,54,${0.10 * alpha})`);
        rangeGrad.addColorStop(0.55, `rgba(128,0,0,${0.10 * alpha})`);
        rangeGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rangeGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, halfW, halfD, 0, 0, Math.PI * 2);
        ctx.fill();

        const drawSweepArc = (rx, ry, yOff, lineMul, color, blur, from, to) => {
            ctx.shadowBlur = blur;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(5, slashD * lineMul);
            ctx.beginPath();
            ctx.ellipse(0, yOff, rx, ry, -0.045, from, to);
            ctx.stroke();
        };

        // 검호가 전방 일부가 아니라 hitbox 전체 폭을 훑도록 거의 한 바퀴에 가까운 원호를 그린다.
        drawSweepArc(halfW * 0.98, halfD * 0.82, 0, 0.105, accent, 22, -Math.PI + 0.10, Math.PI - 0.10);
        drawSweepArc(halfW * 0.98, halfD * 0.82, 0, 0.064, core, 18, -Math.PI + 0.16, Math.PI - 0.16);
        drawSweepArc(halfW * 0.88, halfD * 0.58, -halfD * 0.05, 0.030, hot, 10, -Math.PI + 0.24, Math.PI - 0.24);

        // 내부에는 넓은 S자형 칼날 면을 넣어, 단순한 범위 표시가 아니라 횡베기 검호처럼 보이게 한다.
        const bladeGrad = ctx.createLinearGradient(-halfW, -halfD * 0.22, halfW, halfD * 0.08);
        bladeGrad.addColorStop(0, 'rgba(0,0,0,0)');
        bladeGrad.addColorStop(0.16, `rgba(70,0,0,${0.34 * alpha})`);
        bladeGrad.addColorStop(0.46, core);
        bladeGrad.addColorStop(0.66, hot);
        bladeGrad.addColorStop(0.90, `rgba(255,72,54,${0.24 * alpha})`);
        bladeGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bladeGrad;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(-halfW * 0.98, -halfD * 0.10);
        ctx.bezierCurveTo(-halfW * 0.60, -halfD * 0.52, halfW * 0.28, -halfD * 0.56, halfW * 0.98, -halfD * 0.10);
        ctx.bezierCurveTo(halfW * 0.40, halfD * 0.28, -halfW * 0.48, halfD * 0.32, -halfW * 0.98, halfD * 0.12);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255,248,226,${0.72 * alpha})`;
        ctx.lineWidth = Math.max(2.2, slashD * 0.014);
        ctx.beginPath();
        ctx.moveTo(-halfW * 0.90, -halfD * 0.07);
        ctx.bezierCurveTo(-halfW * 0.48, -halfD * 0.38, halfW * 0.30, -halfD * 0.40, halfW * 0.86, -halfD * 0.06);
        ctx.stroke();

        ctx.restore();

    } else if (eff.type === 'slash') {
        const slashW = Math.max(24, eff.w || 80);
        const slashH = Math.max(16, eff.h || 40);
        const slashD = Math.max(16, eff.d || slashH);
        const renderType = String(eff.renderType || '').trim();
        const renderTypeUpper = String(renderType || '').toUpperCase();
        const isThunderboltSlash = renderType === 'EFT_THUNDERBOLT_SLASH';
        const isLightningSlash = renderType === 'EFT_LIGHTNING_SLASH';
        const isKasiyasStab = renderTypeUpper === 'EFT_STABBING' || renderTypeUpper === 'EFT_KASIYAS_STABBING' || renderTypeUpper === 'EFT_KASIYAS_RUSH_ISSEN' || renderTypeUpper === 'EFT_KASIYAS_SLASH_02';
        const isKasiyasDown = renderTypeUpper === 'EFT_SLASH_DOWN' || renderTypeUpper === 'EFT_KASIYAS_SLASH_DOWN' || renderTypeUpper === 'EFT_KASIYAS_CHARGE_SLASH_DOWN' || renderTypeUpper === 'EFT_KASIYAS_SLASH_01' || renderTypeUpper === 'EFT_KASIYAS_SLASH_04';
        const isKasiyasUp = renderTypeUpper === 'EFT_SLASH_UP' || renderTypeUpper === 'EFT_KASIYAS_SLASH_UP' || renderTypeUpper === 'EFT_KASIYAS_SLASH_03';
        const isKasiyasHorizontal = renderTypeUpper === 'EFT_KASIYAS_HORIZONTAL_SLASH' || renderTypeUpper === 'EFT_HORIZONTAL_SLASH';

        ctx.scale(eff.dir || 1, 1);

        if (isKasiyasHorizontal) {
            // 카시야스 4번 패턴 횡베기: hitbox 타원 전체에 맞는 큰 검호로 표시한다.
            const wideW = Math.max(140, slashW * 0.98);
            const groundD = Math.max(76, eff.d || slashH);
            const arcD = Math.max(70, groundD * 0.96);
            const halfW = wideW * 0.50;
            const halfD = arcD * 0.50;
            const core = eff.color || `rgba(255,58,48,${0.94 * alpha})`;
            const accent = eff.accentColor || `rgba(30,0,0,${0.90 * alpha})`;
            const hot = `rgba(255,235,205,${0.78 * alpha})`;

            ctx.globalCompositeOperation = 'lighter';
            ctx.rotate(-0.035);
            ctx.shadowBlur = 18;
            ctx.shadowColor = 'rgba(235,30,22,0.72)';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // 실제 공격 판정이 HITBOX_CIRCLE이므로, 전방 일부가 아니라 전체 타원 범위를 먼저 희미하게 보여준다.
            const rangeGrad = ctx.createRadialGradient(0, 0, Math.max(8, halfD * 0.10), 0, 0, Math.max(halfW, halfD));
            rangeGrad.addColorStop(0, `rgba(255,72,52,${0.08 * alpha})`);
            rangeGrad.addColorStop(0.55, `rgba(120,0,0,${0.08 * alpha})`);
            rangeGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = rangeGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, halfW, halfD, 0, 0, Math.PI * 2);
            ctx.fill();

            const drawSweepArc = (rx, ry, yOff, lineMul, color, blur, from, to) => {
                ctx.shadowBlur = blur;
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(3.6, arcD * lineMul);
                ctx.beginPath();
                ctx.ellipse(0, yOff, rx, ry, -0.045, from, to);
                ctx.stroke();
            };

            // 좌우 끝까지 이어지는 검호. 기존처럼 한쪽 전방만 보이지 않도록 거의 전체 타원을 훑는다.
            drawSweepArc(halfW * 0.98, halfD * 0.84, 0, 0.070, accent, 16, -Math.PI + 0.12, Math.PI - 0.12);
            drawSweepArc(halfW * 0.98, halfD * 0.84, 0, 0.043, core, 13, -Math.PI + 0.18, Math.PI - 0.18);
            drawSweepArc(halfW * 0.88, halfD * 0.58, -halfD * 0.05, 0.018, hot, 8, -Math.PI + 0.26, Math.PI - 0.26);

            const bladeGrad = ctx.createLinearGradient(-halfW, -halfD * 0.18, halfW, halfD * 0.07);
            bladeGrad.addColorStop(0, 'rgba(0,0,0,0)');
            bladeGrad.addColorStop(0.18, `rgba(80,0,0,${0.26 * alpha})`);
            bladeGrad.addColorStop(0.48, hot);
            bladeGrad.addColorStop(0.64, core);
            bladeGrad.addColorStop(0.88, `rgba(255,82,62,${0.18 * alpha})`);
            bladeGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = bladeGrad;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(-halfW * 0.96, -halfD * 0.08);
            ctx.bezierCurveTo(-halfW * 0.54, -halfD * 0.46, halfW * 0.26, -halfD * 0.48, halfW * 0.96, -halfD * 0.08);
            ctx.bezierCurveTo(halfW * 0.36, halfD * 0.22, -halfW * 0.44, halfD * 0.26, -halfW * 0.96, halfD * 0.10);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(255,248,226,${0.68 * alpha})`;
            ctx.lineWidth = Math.max(1.8, arcD * 0.010);
            ctx.beginPath();
            ctx.moveTo(-halfW * 0.88, -halfD * 0.05);
            ctx.bezierCurveTo(-halfW * 0.46, -halfD * 0.33, halfW * 0.28, -halfD * 0.35, halfW * 0.84, -halfD * 0.05);
            ctx.stroke();

            ctx.restore();
            return;
        }

        if (isKasiyasStab) {
            const stabW = Math.max(80, slashW * 1.05);
            const stabH = Math.max(8, slashH * 0.18);
            ctx.shadowBlur = 14;
            ctx.shadowColor = 'rgba(210,0,0,0.74)';

            ctx.fillStyle = `rgba(16,0,0,${0.92 * alpha})`;
            ctx.beginPath();
            ctx.moveTo(-stabW * 0.52, -stabH * 0.72);
            ctx.lineTo(stabW * 0.34, -stabH * 1.25);
            ctx.lineTo(stabW * 0.58, 0);
            ctx.lineTo(stabW * 0.34, stabH * 1.25);
            ctx.lineTo(-stabW * 0.52, stabH * 0.72);
            ctx.closePath();
            ctx.fill();

            const grad = ctx.createLinearGradient(-stabW * 0.46, 0, stabW * 0.52, 0);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.34, eff.accentColor || `rgba(70,0,0,${0.78 * alpha})`);
            grad.addColorStop(0.58, eff.color || `rgba(255,54,48,${0.98 * alpha})`);
            grad.addColorStop(0.84, `rgba(130,0,0,${0.58 * alpha})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(-stabW * 0.48, -stabH * 0.45);
            ctx.lineTo(stabW * 0.34, -stabH * 0.95);
            ctx.lineTo(stabW * 0.52, 0);
            ctx.lineTo(stabW * 0.34, stabH * 0.95);
            ctx.lineTo(-stabW * 0.48, stabH * 0.45);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(36,0,0,${0.92 * alpha})`;
            ctx.lineWidth = Math.max(3.0, stabH * 0.40);
            ctx.beginPath();
            ctx.moveTo(-stabW * 0.38, 0);
            ctx.lineTo(stabW * 0.50, 0);
            ctx.stroke();

            ctx.strokeStyle = `rgba(255,112,94,${0.92 * alpha})`;
            ctx.lineWidth = Math.max(1.5, stabH * 0.16);
            ctx.beginPath();
            ctx.moveTo(-stabW * 0.36, 0);
            ctx.lineTo(stabW * 0.48, 0);
            ctx.stroke();

            ctx.restore();
            return;
        }

        if (isKasiyasDown) {
            ctx.rotate(0.52);
        } else if (isKasiyasUp) {
            ctx.rotate(-0.58);
        }

        let grad = ctx.createLinearGradient(-slashW / 2, 0, slashW / 2, 0);
        if (isThunderboltSlash) {
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.18, `rgba(255,255,255,${0.35 * alpha})`);
            grad.addColorStop(0.50, `rgba(241,196,15,${0.98 * alpha})`);
            grad.addColorStop(0.82, `rgba(52,152,219,${0.88 * alpha})`);
            grad.addColorStop(1, "rgba(255,255,255,0)");
        } else if (isLightningSlash) {
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.45, `rgba(255,245,180,${0.9 * alpha})`);
            grad.addColorStop(1, eff.color || "rgba(255,235,150,0.9)");
        } else if (isKasiyasDown || isKasiyasUp) {
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(0.18, `rgba(24,0,0,${0.70 * alpha})`);
            grad.addColorStop(0.50, eff.color || `rgba(255,54,48,${0.95 * alpha})`);
            grad.addColorStop(0.82, `rgba(120,0,0,${0.72 * alpha})`);
            grad.addColorStop(1, "rgba(0,0,0,0)");
        } else {
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.50, `rgba(200,255,255,${0.8 * alpha})`);
            grad.addColorStop(1, eff.color || "rgba(255,255,255,0.9)");
        }

        if (isKasiyasDown || isKasiyasUp) {
            ctx.fillStyle = `rgba(14,0,0,${0.88 * alpha})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, slashW * 0.55, slashH * 0.62, 0, -Math.PI / 2, Math.PI / 2);
            ctx.ellipse(-slashW / 4, 0, slashW * 0.55, slashH * 0.62, 0, Math.PI / 2, -Math.PI / 2, true);
            ctx.fill();
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, slashW / 2, slashH / 2, 0, -Math.PI / 2, Math.PI / 2);
        ctx.ellipse(-slashW / 4, 0, slashW / 2, slashH / 2, 0, Math.PI / 2, -Math.PI / 2, true);
        ctx.fill();

        if (isKasiyasDown || isKasiyasUp) {
            ctx.strokeStyle = `rgba(28,0,0,${0.94 * alpha})`;
            ctx.lineWidth = Math.max(3.2, slashH * 0.075);
            ctx.beginPath();
            ctx.ellipse(0, 0, slashW * 0.51, slashH * 0.51, 0, -Math.PI / 2, Math.PI / 2);
            ctx.ellipse(-slashW / 4, 0, slashW * 0.51, slashH * 0.51, 0, Math.PI / 2, -Math.PI / 2, true);
            ctx.stroke();

            ctx.strokeStyle = `rgba(255,115,98,${0.72 * alpha})`;
            ctx.lineWidth = Math.max(1.3, slashH * 0.035);
            ctx.beginPath();
            ctx.moveTo(-slashW * 0.36, -slashH * 0.08);
            ctx.quadraticCurveTo(0, -slashH * 0.34, slashW * 0.38, -slashH * 0.04);
            ctx.stroke();
        }

        if (isThunderboltSlash) {
            ctx.strokeStyle = `rgba(255,255,255,${0.75 * alpha})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-slashW * 0.22, -slashH * 0.34);
            ctx.lineTo(-slashW * 0.05, -slashH * 0.08);
            ctx.lineTo(slashW * 0.02, -slashH * 0.26);
            ctx.lineTo(slashW * 0.16, 0);
            ctx.lineTo(slashW * 0.07, slashH * 0.06);
            ctx.lineTo(slashW * 0.24, slashH * 0.30);
            ctx.stroke();

            ctx.strokeStyle = `rgba(241,196,15,${0.85 * alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(-slashW * 0.04, 0, Math.max(12, slashH * 0.22), -1.0, 0.9);
            ctx.stroke();
        }
    } else if (eff.type === 'bite') {
        renderer.drawBiteEffect(ctx, eff, alpha);
    } else if (eff.type === 'shoulderCharge') {
        const w = Math.max(120, eff.w || 220);
        const h = Math.max(44, eff.d || 70);
        const dir = eff.dir || 1;
        ctx.save();
        ctx.scale(dir, 1);

        const grad = ctx.createLinearGradient(-w * 0.48, 0, w * 0.50, 0);
        grad.addColorStop(0, `rgba(0,0,0,0)`);
        grad.addColorStop(0.24, `rgba(30,0,0,${0.22 * alpha})`);
        grad.addColorStop(0.62, `rgba(255,74,54,${0.28 * alpha})`);
        grad.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.50, h * 0.54, -0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(18,0,0,${0.90 * alpha})`;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
            const yy = (i - 1) * h * 0.22;
            ctx.beginPath();
            ctx.moveTo(-w * 0.42, yy + h * 0.16);
            ctx.quadraticCurveTo(-w * 0.08, yy - h * 0.10, w * 0.37, yy - h * 0.05);
            ctx.stroke();
        }

        ctx.strokeStyle = `rgba(255,82,58,${0.78 * alpha})`;
        ctx.lineWidth = 3.2;
        for (let i = 0; i < 3; i++) {
            const yy = (i - 1) * h * 0.22;
            ctx.beginPath();
            ctx.moveTo(-w * 0.40, yy + h * 0.13);
            ctx.quadraticCurveTo(-w * 0.07, yy - h * 0.08, w * 0.34, yy - h * 0.04);
            ctx.stroke();
        }

        ctx.fillStyle = `rgba(255,104,72,${0.34 * alpha})`;
        ctx.beginPath();
        ctx.moveTo(w * 0.26, -h * 0.35);
        ctx.lineTo(w * 0.52, 0);
        ctx.lineTo(w * 0.25, h * 0.36);
        ctx.quadraticCurveTo(w * 0.32, 0, w * 0.26, -h * 0.35);
        ctx.fill();
        ctx.restore();
    } else if (eff.type === 'guard') {
        const baseW = Math.max(104, eff.w || 130);
        const baseH = Math.max(110, eff.h || 135);
        const kind = String(eff.renderType || 'EFT_GUARD').trim().toUpperCase();
        const isReduce = kind === 'EFT_GUARD_REDUCE';
        const isSuccess = kind === 'EFT_GUARD_SUCCESS' || kind === 'EFT_GUARD_REDUCE';
        const t = 1 - alpha;
        const pop = isSuccess ? (1 + t * 0.30) : (1 + t * 0.10);
        const w = baseW * pop;
        const h = baseH * pop;
        const dir = eff.dir === -1 ? -1 : 1;

        ctx.save();
        ctx.scale(dir, 1);
        ctx.shadowBlur = isSuccess ? 28 : 16;
        ctx.shadowColor = isReduce ? 'rgba(255,142,72,0.88)' : 'rgba(120,220,255,0.82)';

        const grad = ctx.createRadialGradient(w * 0.12, -h * 0.24, w * 0.04, w * 0.16, 0, w * 0.68);
        grad.addColorStop(0, isReduce ? `rgba(255,246,205,${0.30 * alpha})` : `rgba(255,255,255,${0.34 * alpha})`);
        grad.addColorStop(0.40, isReduce ? `rgba(255,150,70,${0.20 * alpha})` : `rgba(102,218,255,${0.22 * alpha})`);
        grad.addColorStop(1, 'rgba(20,40,80,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-w * 0.10, -h * 0.48);
        ctx.quadraticCurveTo(w * 0.60, -h * 0.36, w * 0.58, 0);
        ctx.quadraticCurveTo(w * 0.60, h * 0.36, -w * 0.10, h * 0.48);
        ctx.quadraticCurveTo(w * 0.06, 0, -w * 0.10, -h * 0.48);
        ctx.closePath();
        ctx.fill();

        ctx.lineWidth = isSuccess ? 4.5 : 2.9;
        ctx.strokeStyle = isReduce ? `rgba(255,226,126,${0.95 * alpha})` : `rgba(180,242,255,${0.96 * alpha})`;
        ctx.beginPath();
        ctx.moveTo(-w * 0.08, -h * 0.48);
        ctx.quadraticCurveTo(w * 0.64, -h * 0.35, w * 0.62, 0);
        ctx.quadraticCurveTo(w * 0.64, h * 0.35, -w * 0.08, h * 0.48);
        ctx.stroke();

        ctx.lineWidth = 1.6;
        ctx.strokeStyle = isReduce ? `rgba(255,255,220,${0.72 * alpha})` : `rgba(255,255,255,${0.72 * alpha})`;
        for (let i = 0; i < 3; i++) {
            const ox = w * (0.02 + i * 0.05);
            ctx.beginPath();
            ctx.moveTo(ox, -h * (0.35 - i * 0.04));
            ctx.quadraticCurveTo(w * (0.32 + i * 0.05), 0, ox, h * (0.35 - i * 0.04));
            ctx.stroke();
        }

        if (isSuccess) {
            const sparkColor = isReduce ? `rgba(255,214,96,${0.90 * alpha})` : `rgba(245,255,255,${0.90 * alpha})`;
            ctx.fillStyle = sparkColor;

            // 가드 성공 피드백은 방패 충돌점 주변의 짧은 빛 입자만 남긴다.
            ctx.globalAlpha = 0.70 * alpha;
            for (let i = 0; i < 7; i++) {
                const y = -h * 0.32 + i * h * 0.105;
                const x = w * (0.54 + t * 0.05 + (i % 2) * 0.025);
                ctx.beginPath();
                ctx.arc(x, y, i % 2 === 0 ? 2.4 : 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = alpha;
        }
        ctx.restore();

    } else if (eff.type === 'hitSpark') {
        const renderType = String(eff.renderType || '').trim();
        const burstScale = eff.burstScale || 1;
        const core = eff.color || (renderType === 'EFT_STRIKE' ? "rgba(245,245,245,0.96)" : "rgba(241,196,15,0.95)");
        const accent = eff.accentColor || (renderType === 'EFT_STRIKE' ? "rgba(210,220,230,0.92)" : "rgba(255,255,255,0.95)");

        if (renderType === 'EFT_CAN_PARRY' || renderType === 'EFT_SUCCESS_PARRY') {
            const success = renderType === 'EFT_SUCCESS_PARRY';
            const pulse = 0.84 + Math.sin(Date.now() / 95) * 0.16;
            const r = (success ? 40 : 46) * burstScale * (success ? 1 : pulse);
            const localAlpha = alpha * (success ? 0.98 : 0.68);
            ctx.save();
            ctx.rotate((eff.dir || 1) * (success ? 0.08 : -0.05));
            ctx.shadowBlur = success ? 26 : 22;
            ctx.shadowColor = success ? 'rgba(255,245,96,0.92)' : 'rgba(255,226,74,0.78)';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // 패링 가능 표시는 모델 위에 겹쳐도 읽히도록 큰 X자 실루엣으로 표시한다.
            ctx.strokeStyle = success ? `rgba(50,24,0,${0.96 * alpha})` : `rgba(54,34,0,${0.74 * localAlpha})`;
            ctx.lineWidth = success ? 10 : 8;
            ctx.beginPath();
            ctx.moveTo(-r, -r);
            ctx.lineTo(r, r);
            ctx.moveTo(-r, r);
            ctx.lineTo(r, -r);
            ctx.stroke();

            ctx.strokeStyle = success ? `rgba(255,252,142,${0.98 * alpha})` : `rgba(255,232,82,${0.86 * localAlpha})`;
            ctx.lineWidth = success ? 5 : 4;
            ctx.beginPath();
            ctx.moveTo(-r * 0.78, -r * 0.78);
            ctx.lineTo(r * 0.78, r * 0.78);
            ctx.moveTo(-r * 0.78, r * 0.78);
            ctx.lineTo(r * 0.78, -r * 0.78);
            ctx.stroke();

            ctx.strokeStyle = success ? `rgba(255,255,255,${0.86 * alpha})` : `rgba(255,255,210,${0.40 * localAlpha})`;
            ctx.lineWidth = success ? 2.4 : 1.8;
            ctx.beginPath();
            ctx.moveTo(-r * 0.50, -r * 0.50);
            ctx.lineTo(r * 0.50, r * 0.50);
            ctx.moveTo(-r * 0.50, r * 0.50);
            ctx.lineTo(r * 0.50, -r * 0.50);
            ctx.stroke();

            ctx.fillStyle = success ? `rgba(255,255,210,${0.92 * alpha})` : `rgba(255,226,84,${0.34 * localAlpha})`;
            ctx.beginPath();
            ctx.arc(0, 0, r * (success ? 0.18 : 0.12), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (renderType === 'EFT_STRIKE') {
            const r = 24 * burstScale;
            ctx.rotate((eff.dir || 1) * 0.12);

            ctx.strokeStyle = core;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-r, 0);
            ctx.lineTo(r, 0);
            ctx.moveTo(0, -r * 0.78);
            ctx.lineTo(0, r * 0.78);
            ctx.stroke();

            ctx.strokeStyle = accent;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(-r * 0.72, -r * 0.72);
            ctx.lineTo(r * 0.72, r * 0.72);
            ctx.moveTo(-r * 0.72, r * 0.72);
            ctx.lineTo(r * 0.72, -r * 0.72);
            ctx.stroke();

            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.20, 0, Math.PI * 2);
            ctx.fill();
        } else if (renderType === 'EFT_PUNCH' || renderType === 'EFT_KASIYAS_FIST_BUMPING' || renderType === 'EFT_KASIYAS_SHOULDER_ATK') {
            if (renderType === 'EFT_KASIYAS_FIST_BUMPING') {
                const w = Math.max(90, eff.w || 150) * Math.max(0.70, burstScale * 0.42);
                const h = Math.max(55, eff.h || 90) * Math.max(0.70, burstScale * 0.40);
                ctx.save();
                ctx.scale(eff.dir || 1, 1);
                ctx.shadowBlur = 16;
                ctx.shadowColor = 'rgba(210,0,0,0.62)';
                ctx.fillStyle = `rgba(255,70,48,${0.18 * alpha})`;
                ctx.beginPath();
                ctx.ellipse(w * 0.08, 0, w * 0.42, h * 0.36, -0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = `rgba(24,0,0,${0.90 * alpha})`;
                ctx.lineWidth = 7;
                ctx.beginPath();
                ctx.ellipse(w * 0.10, 0, w * 0.40, h * 0.34, -0.08, -0.15, Math.PI * 1.55);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = `rgba(255,86,58,${0.90 * alpha})`;
                ctx.lineWidth = 3.2;
                ctx.beginPath();
                ctx.ellipse(w * 0.10, 0, w * 0.36, h * 0.30, -0.08, -0.08, Math.PI * 1.48);
                ctx.stroke();
                ctx.strokeStyle = `rgba(255,210,160,${0.58 * alpha})`;
                ctx.lineWidth = 1.6;
                for (let i = 0; i < 4; i++) {
                    const yy = (i - 1.5) * h * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(-w * 0.22, yy);
                    ctx.lineTo(w * 0.42, yy - h * 0.08);
                    ctx.stroke();
                }
                ctx.restore();
            } else if (renderType === 'EFT_KASIYAS_SHOULDER_ATK') {
                const w = Math.max(110, eff.w || 190);
                const h = Math.max(48, eff.h || eff.d || 75);
                ctx.save();
                ctx.scale(eff.dir || 1, 1);
                const grad = ctx.createLinearGradient(-w * 0.50, 0, w * 0.52, 0);
                grad.addColorStop(0, `rgba(0,0,0,0)`);
                grad.addColorStop(0.28, `rgba(55,0,0,${0.22 * alpha})`);
                grad.addColorStop(0.67, `rgba(255,86,58,${0.34 * alpha})`);
                grad.addColorStop(1, `rgba(0,0,0,0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, w * 0.50, h * 0.48, -0.05, 0, Math.PI * 2);
                ctx.fill();
                ctx.lineCap = 'round';
                ctx.strokeStyle = `rgba(20,0,0,${0.90 * alpha})`;
                ctx.lineWidth = 7;
                for (let i = 0; i < 4; i++) {
                    const yy = (i - 1.5) * h * 0.20;
                    ctx.beginPath();
                    ctx.moveTo(-w * 0.42, yy + h * 0.14);
                    ctx.quadraticCurveTo(-w * 0.04, yy - h * 0.12, w * 0.42, yy - h * 0.04);
                    ctx.stroke();
                }
                ctx.strokeStyle = `rgba(255,96,62,${0.84 * alpha})`;
                ctx.lineWidth = 2.8;
                for (let i = 0; i < 4; i++) {
                    const yy = (i - 1.5) * h * 0.20;
                    ctx.beginPath();
                    ctx.moveTo(-w * 0.40, yy + h * 0.11);
                    ctx.quadraticCurveTo(-w * 0.04, yy - h * 0.10, w * 0.38, yy - h * 0.03);
                    ctx.stroke();
                }
                ctx.fillStyle = `rgba(255,225,180,${0.30 * alpha})`;
                ctx.beginPath();
                ctx.moveTo(w * 0.30, -h * 0.35);
                ctx.lineTo(w * 0.53, 0);
                ctx.lineTo(w * 0.30, h * 0.35);
                ctx.quadraticCurveTo(w * 0.38, 0, w * 0.30, -h * 0.35);
                ctx.fill();
                ctx.restore();
            } else {
                renderer.drawPunchEffect(ctx, eff, alpha);
            }
        } else {
            const r = 18 * burstScale;

            ctx.fillStyle = core;
            for (let i = 0; i < 6; i++) {
                let ang = (Math.PI * 2 / 6) * i + Date.now() / 220;
                let x = Math.cos(ang) * r * 0.55;
                let y = Math.sin(ang) * r * 0.55;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(x * 0.65, y * 0.65);
                ctx.lineTo(x, y);
                ctx.lineTo(x * 0.35, y * 0.35);
                ctx.closePath();
                ctx.fill();
            }

            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (eff.type === 'lowCircleSlash') {
        const w = Math.max(140, eff.w || 500);
        const d = Math.max(70, eff.d || 250);
        const core = eff.color || `rgba(255,56,48,${0.96 * alpha})`;
        const accent = eff.accentColor || `rgba(24,0,0,${0.86 * alpha})`;
        const hot = `rgba(255,226,186,${0.74 * alpha})`;

        ctx.save();
        ctx.scale(eff.dir || 1, 1);
        ctx.rotate(-0.06);
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(190,0,0,0.70)';

        const base = ctx.createRadialGradient(-w * 0.05, d * 0.02, 8, 0, 0, w * 0.60);
        base.addColorStop(0, `rgba(255,70,54,${0.14 * alpha})`);
        base.addColorStop(0.42, `rgba(100,0,0,${0.12 * alpha})`);
        base.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = base;
        ctx.beginPath();
        ctx.ellipse(0, d * 0.05, w * 0.54, d * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();

        const buildCrescent = (outerRX, outerRY, innerRX, innerRY, offX, offY, lift) => {
            ctx.beginPath();
            ctx.ellipse(offX, offY, outerRX, outerRY, -0.10, Math.PI * 0.10, Math.PI * 1.78);
            ctx.ellipse(offX - outerRX * 0.14, offY + lift, innerRX, innerRY, -0.10, Math.PI * 1.78, Math.PI * 0.10, true);
            ctx.closePath();
        };

        const grad = ctx.createLinearGradient(-w * 0.52, 0, w * 0.50, -d * 0.06);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.18, `rgba(64,0,0,${0.38 * alpha})`);
        grad.addColorStop(0.48, core);
        grad.addColorStop(0.74, hot);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        buildCrescent(w * 0.54, d * 0.42, w * 0.36, d * 0.22, 0, d * 0.02, d * 0.10);
        ctx.fill();

        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(5.0, d * 0.060);
        ctx.beginPath();
        ctx.ellipse(0, d * 0.01, w * 0.52, d * 0.39, -0.08, Math.PI * 0.12, Math.PI * 1.76);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255,248,226,${0.76 * alpha})`;
        ctx.lineWidth = Math.max(1.8, d * 0.022);
        ctx.beginPath();
        ctx.ellipse(-w * 0.01, -d * 0.03, w * 0.46, d * 0.30, -0.08, Math.PI * 0.16, Math.PI * 1.64);
        ctx.stroke();

        // 하단 휩쓸기는 바닥 원호만 남기고, 의미 없는 선 조각은 제거한다.
        ctx.restore();
    } else if (eff.type === 'cloneSummon') {
        const w = Math.max(70, eff.w || 130);
        const h = Math.max(50, eff.h || 90);
        const pulse = 1 - alpha;
        ctx.save();
        // 분신 소환은 공격이 아니라 소환 연출이므로, 검격처럼 보이는 사선/베기선을 쓰지 않는다.
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 14;
        ctx.shadowColor = 'rgba(170,0,0,0.48)';

        const aura = ctx.createRadialGradient(0, -h * 0.08, 3, 0, 0, Math.max(w, h) * (0.42 + pulse * 0.20));
        aura.addColorStop(0, `rgba(255,90,74,${0.22 * alpha})`);
        aura.addColorStop(0.48, `rgba(112,0,0,${0.16 * alpha})`);
        aura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.34 + pulse * 0.18), h * (0.24 + pulse * 0.12), 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255,74,62,${0.52 * alpha})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.36 + pulse * 0.18), h * (0.22 + pulse * 0.12), 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(120,0,0,${0.38 * alpha})`;
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 3; i++) {
            const yy = -h * 0.20 + i * h * 0.18;
            ctx.beginPath();
            ctx.ellipse(0, yy, w * (0.20 + pulse * 0.08), h * 0.055, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = `rgba(255,120,95,${0.12 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.18, h * 0.13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    } else if (eff.type === 'castAfterimageBurst') {
        const w = Math.max(60, eff.w || 120);
        const h = Math.max(40, eff.h || 80);
        ctx.save();
        ctx.scale(eff.dir || 1, 1);
        ctx.strokeStyle = `rgba(255,70,60,${0.78 * alpha})`;
        ctx.lineWidth = 3.0;
        ctx.shadowBlur = 14;
        ctx.shadowColor = 'rgba(190,0,0,0.70)';
        for (let i = 0; i < 4; i++) {
            const offset = (i - 1.5) * h * 0.14;
            ctx.beginPath();
            ctx.moveTo(-w * 0.45, offset + h * 0.18);
            ctx.lineTo(w * 0.45, offset - h * 0.18);
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'noiseTeleport') {
        const w = Math.max(80, eff.w || 150);
        const h = Math.max(70, eff.h || 130);
        const phase = String(eff.phase || '').toUpperCase();
        const t = 1 - alpha;
        const pulse = 0.5 + Math.sin(Date.now() / 42) * 0.5;
        const seed = Math.floor((eff.x || 0) * 13 + (eff.y || 0) * 7 + (eff.maxLife || 1) * 1000);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 12 + pulse * 8;
        ctx.shadowColor = phase === 'APPEAR' ? 'rgba(255,72,54,0.54)' : 'rgba(160,0,0,0.52)';

        // 위치 섞기 노이즈는 공격 검흔으로 오해되지 않도록 원형/반월 검기 파츠를 그리지 않는다.
        // 대신 짧은 붉은 노이즈 조각과 점멸 입자만 사용한다.
        for (let i = 0; i < 22; i++) {
            const n = ((Math.sin(seed + i * 19.37) * 43758.5453) % 1 + 1) % 1;
            const n2 = ((Math.sin(seed * 0.37 + i * 11.91) * 24634.6345) % 1 + 1) % 1;
            const sx = (n - 0.5) * w * (0.62 + t * 0.25);
            const sy = (n2 - 0.5) * h * (0.58 + t * 0.18);
            const len = 8 + n * 18;
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate((n2 - 0.5) * 0.95);
            ctx.strokeStyle = i % 4 === 0
                ? `rgba(255,210,170,${0.40 * alpha})`
                : `rgba(255,58,44,${0.34 * alpha})`;
            ctx.lineWidth = 1.1 + n * 1.2;
            ctx.beginPath();
            ctx.moveTo(-len * 0.5, 0);
            ctx.lineTo(len * 0.5, 0);
            ctx.stroke();
            ctx.restore();
        }

        for (let i = 0; i < 10; i++) {
            const n = ((Math.sin(seed + i * 7.13) * 13579.1357) % 1 + 1) % 1;
            const n2 = ((Math.sin(seed + i * 5.71) * 97531.7531) % 1 + 1) % 1;
            const px = (n - 0.5) * w * 0.48;
            const py = (n2 - 0.5) * h * 0.44;
            const r = 2.0 + n * 3.0;
            ctx.fillStyle = `rgba(255,74,58,${0.18 * alpha + pulse * 0.10 * alpha})`;
            ctx.fillRect(px - r / 2, py - r / 2, r, r);
        }

        ctx.globalAlpha *= 0.40;
        ctx.fillStyle = phase === 'APPEAR' ? `rgba(255,216,180,${0.10 * alpha})` : `rgba(90,0,0,${0.12 * alpha})`;
        ctx.fillRect(-w * 0.22, -h * 0.38, w * 0.44, h * 0.76);
        ctx.restore();
    } else if (eff.type === 'afterimageDashTrail') {
        const w = Math.max(80, eff.w || 240);
        const h = Math.max(20, eff.h || 40);
        const angle = eff.pathAngle || 0;
        ctx.save();
        ctx.rotate(angle);
        const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
        grad.addColorStop(0, `rgba(50,0,0,0)`);
        grad.addColorStop(0.45, `rgba(95,0,0,${0.30 * alpha})`);
        grad.addColorStop(0.72, `rgba(255,60,55,${0.28 * alpha})`);
        grad.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    } else if (eff.type === 'afterimageDisappear') {
        const w = Math.max(40, eff.w || 90);
        const h = Math.max(40, eff.h || 90);
        ctx.strokeStyle = `rgba(255,72,64,${0.78 * alpha})`;
        ctx.lineWidth = 2.4;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(190,0,0,0.58)';
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.25 + (1 - alpha) * 0.35), h * (0.18 + (1 - alpha) * 0.26), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    } else if (eff.type === 'stompDust') {
        const w = Math.max(50, eff.w || 90);
        const d = Math.max(28, eff.d || 56);
        const pulse = 1 - alpha;
        ctx.save();
        ctx.scale(eff.dir || 1, 1);
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255,238,205,0.42)';
        ctx.fillStyle = `rgba(235,220,190,${0.18 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.28 + pulse * 0.16), d * (0.18 + pulse * 0.12), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(72,52,34,${0.62 * alpha})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.26 + pulse * 0.18), d * (0.16 + pulse * 0.12), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(245,232,205,${0.58 * alpha})`;
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 5; i++) {
            const a = -Math.PI * 0.85 + i * Math.PI * 0.42;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * w * 0.08, Math.sin(a) * d * 0.06);
            ctx.lineTo(Math.cos(a) * w * (0.18 + pulse * 0.17), Math.sin(a) * d * (0.13 + pulse * 0.10));
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'shockwave') {
        const w = Math.max(80, eff.w || 300);
        const d = Math.max(40, eff.d || 140);
        const pulse = 1 - alpha;
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = (eff.color || 'rgba(245,248,255,0.75)');
        ctx.strokeStyle = eff.accentColor || `rgba(36,52,72,${0.84 * alpha})`;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.20 + pulse * 0.28), d * (0.16 + pulse * 0.22), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = eff.color || `rgba(245,248,255,${0.88 * alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.16 + pulse * 0.26), d * (0.12 + pulse * 0.20), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${0.74 * alpha})`;
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 7; i++) {
            const a = (Math.PI * 2 / 7) * i + pulse * 0.35;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * w * 0.08, Math.sin(a) * d * 0.06);
            ctx.lineTo(Math.cos(a) * w * (0.18 + pulse * 0.23), Math.sin(a) * d * (0.12 + pulse * 0.20));
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'particle') {
        const pr = Math.max(2, eff.r || 4);
        ctx.fillStyle = eff.color || "rgba(255,255,255,0.95)";

        ctx.beginPath();
        ctx.arc(0, 0, pr, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.55;
        ctx.beginPath();
        ctx.arc(0, 0, pr * 2.2, 0, Math.PI * 2);
        ctx.fill();
    } else if (eff.type === 'warning') {
        const w = Math.max(20, eff.w || 50);
        const d = Math.max(12, eff.d || 30);
        const warningType = String(eff.warningRenderType || eff.renderType || '').trim();
        const pulse = 0.7 + Math.sin(Date.now() / 90) * 0.3;

        const warningTypeUpper = warningType.toUpperCase();
        if (eff.pathAngle !== undefined && eff.pathAngle !== null) {
            ctx.save();
            ctx.rotate(eff.pathAngle);

            if (warningTypeUpper === 'EFT_WARNING_RUSH_LINE' || warningTypeUpper === 'WARNING_RUSH_LINE') {
                const lineH = Math.max(8, d * 0.35);
                ctx.lineCap = 'round';
                ctx.shadowBlur = 12;
                ctx.shadowColor = 'rgba(255,218,72,0.70)';
                ctx.strokeStyle = `rgba(82,56,0,${0.88 * alpha})`;
                ctx.lineWidth = Math.max(4, lineH * 0.52);
                ctx.beginPath();
                ctx.moveTo(-w / 2, 0);
                ctx.lineTo(w / 2, 0);
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.strokeStyle = `rgba(255,220,78,${0.92 * alpha})`;
                ctx.lineWidth = Math.max(2, lineH * 0.25);
                ctx.beginPath();
                ctx.moveTo(-w / 2, 0);
                ctx.lineTo(w / 2, 0);
                ctx.stroke();

                ctx.strokeStyle = `rgba(255,255,185,${0.72 * alpha})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(-w / 2, -lineH * 0.50);
                ctx.lineTo(w / 2, -lineH * 0.50);
                ctx.stroke();

                // 진행 방향 화살표
                ctx.fillStyle = `rgba(255,220,78,${0.92 * alpha})`;
                ctx.beginPath();
                ctx.moveTo(w / 2, 0);
                ctx.lineTo(w / 2 - 18, -9);
                ctx.lineTo(w / 2 - 12, 0);
                ctx.lineTo(w / 2 - 18, 9);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = `rgba(255, 226, 64, ${0.12 + pulse * 0.10})`;
                ctx.fillRect(-w / 2, -d / 2, w, d);
                ctx.strokeStyle = `rgba(255, 240, 130, ${0.86 * alpha})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(-w / 2, -d / 2, w, d);
            }
            ctx.restore();
        } else if (warningTypeUpper === 'WARNING_HITBOX' && String(eff.hitboxType || '').toUpperCase() === 'HITBOX_CIRCLE') {
            const isActiveAttackRange = !!eff.activeAttackRange;
            ctx.fillStyle = isActiveAttackRange
                ? `rgba(160, 18, 18, ${0.12 + pulse * 0.08})`
                : `rgba(255, 226, 64, ${0.10 + pulse * 0.08})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, w / 2, d / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = isActiveAttackRange
                ? `rgba(70, 0, 0, ${0.88 * alpha})`
                : `rgba(86, 58, 0, ${0.86 * alpha})`;
            ctx.lineWidth = isActiveAttackRange ? 2.8 : 2.4;
            ctx.beginPath();
            ctx.ellipse(0, 0, w / 2, d / 2, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = isActiveAttackRange
                ? `rgba(255, 88, 72, ${0.70 * alpha})`
                : `rgba(255, 240, 120, ${0.78 * alpha})`;
            ctx.lineWidth = isActiveAttackRange ? 1.4 : 1.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.33 + pulse * 0.04), d * (0.33 + pulse * 0.04), 0, 0, Math.PI * 2);
            ctx.stroke();
        } else if (warningType === 'WARNING_MAGIC_CIRCLE') {
            ctx.strokeStyle = `rgba(80,220,255,${0.85 * alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, w / 2, d / 2, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(255,255,255,${0.55 * alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.30 + pulse * 0.08), d * (0.30 + pulse * 0.08), 0, 0, Math.PI * 2);
            ctx.stroke();

            for (let i = 0; i < 6; i++) {
                const ang = (Math.PI * 2 / 6) * i + Date.now() / 600;
                const rx = Math.cos(ang) * w * 0.34;
                const ry = Math.sin(ang) * d * 0.34;
                ctx.fillStyle = `rgba(220,245,255,${0.7 * alpha})`;
                ctx.beginPath();
                ctx.arc(rx, ry, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.fillStyle = `rgba(255, 226, 64, ${0.14 + pulse * 0.12})`;
            ctx.fillRect(-w / 2, -d / 2, w, d);

            ctx.strokeStyle = `rgba(255, 240, 130, ${0.86 * alpha})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(-w / 2, -d / 2, w, d);
        }
    } else if (eff.type === 'lightning') {
        const w = Math.max(20, eff.w || 60);
        const h = Math.max(80, eff.h || 300);
        const d = Math.max(10, eff.d || 24);

        let lGrad = ctx.createLinearGradient(0, -h, 0, 0);
        lGrad.addColorStop(0, "rgba(241,196,15,0)");
        lGrad.addColorStop(0.35, `rgba(255,255,255,${0.95 * alpha})`);
        lGrad.addColorStop(0.65, `rgba(241,196,15,${0.95 * alpha})`);
        lGrad.addColorStop(1, "rgba(241,196,15,0)");
        ctx.fillStyle = lGrad;
        ctx.fillRect(-w / 2, -h, w, h);

        ctx.fillStyle = `rgba(255,255,255,${0.95 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, d / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255,255,255,${0.75 * alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w * 0.12, -h * 0.72);
        ctx.lineTo(w * 0.08, -h * 0.45);
        ctx.lineTo(-w * 0.06, -h * 0.18);
        ctx.lineTo(0, 0);
        ctx.stroke();
    } else if (eff.type === 'ice_needle' || eff.type === 'ice_strike') {
        const w = Math.max(24, eff.w || 50);
        const h = Math.max(50, eff.h || 120);

        ctx.strokeStyle = "rgba(120, 240, 255, 0.95)";
        ctx.lineWidth = 4;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w / 2, 0);
        ctx.lineTo(w / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(173,216,230,0.75)";
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w / 4, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
    } else if (eff.type === 'ghost') {
        ctx.rotate((eff.faceDir || 1) * 15 * Math.PI / 180);
        ctx.globalAlpha = alpha * 0.42;

        const pw = eff.w;
        const ph = eff.h;
        const ghostPalette = renderer.resolvePlayerPalette(player.renderColor);

        renderer.drawModelBody(ctx, {
            renderType: player.renderType || 'RENDER_HUMAN',
            palette: {
                dark: ghostPalette.dark,
                mid: ghostPalette.mid,
                light: ghostPalette.light
            },
            w: pw,
            h: ph,
            faceDir: eff.faceDir || 1,
            state: 'Dash',
            isChampion: false,
            isMonster: false,
            eyeColor: 'rgba(0,0,0,0)'
        });
    }

    ctx.restore();
};

GameRenderer.drawFloatingTexts = function(ctx, floatingTexts) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        let drawY = this.GROUND_BASE_Y + ft.y - ft.z;
        ctx.globalAlpha = ft.timer;
        ctx.font = `900 ${ft.size} Arial`;
        ctx.textAlign = "center";

        if (ft.isBubble) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            let textW = ctx.measureText(ft.text).width + 16;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(ft.x - textW / 2, drawY - 20, textW, 24, 6);
            } else {
                ctx.rect(ft.x - textW / 2, drawY - 20, textW, 24);
            }
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "black";
            ctx.fillText(ft.text, ft.x, drawY - 4);
        } else {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";
            ctx.strokeText(ft.text, ft.x, drawY);
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, drawY);
        }
        ctx.globalAlpha = 1.0;
    }
};
