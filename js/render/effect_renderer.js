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


// 카시야스 검격 공통 렌더 유틸리티: 중심선/색상 몸통/어두운 외곽/날카로운 끝처리를 통일한다.
GameRenderer.drawKasiyasSharpBladeRibbon = function(ctx, cfg) {
    if (!ctx || !cfg) return;
    const x0 = Number.isFinite(cfg.x0) ? cfg.x0 : 0;
    const y0 = Number.isFinite(cfg.y0) ? cfg.y0 : 0;
    const c1x = Number.isFinite(cfg.c1x) ? cfg.c1x : x0;
    const c1y = Number.isFinite(cfg.c1y) ? cfg.c1y : y0;
    const c2x = Number.isFinite(cfg.c2x) ? cfg.c2x : (Number.isFinite(cfg.x1) ? cfg.x1 : 0);
    const c2y = Number.isFinite(cfg.c2y) ? cfg.c2y : (Number.isFinite(cfg.y1) ? cfg.y1 : 0);
    const x1 = Number.isFinite(cfg.x1) ? cfg.x1 : 0;
    const y1 = Number.isFinite(cfg.y1) ? cfg.y1 : 0;
    const width = Math.max(1, parseFloat(cfg.width) || 12);
    const segments = Math.max(8, Math.min(40, parseInt(cfg.segments || 24, 10)));
    const profile = String(cfg.profile || 'slash').toLowerCase();
    const tipScale = Number.isFinite(cfg.tipScale) ? cfg.tipScale : (profile === 'projectile' ? 0.10 : 0.04);
    const tailScale = Number.isFinite(cfg.tailScale) ? cfg.tailScale : (profile === 'projectile' ? 0.18 : 0.08);
    const shadowColor = cfg.shadowColor || cfg.edgeStyle || 'rgba(180,0,0,0.65)';

    const cubic = (t, a, b, c, d) => {
        const mt = 1 - t;
        return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
    };
    const deriv = (t, a, b, c, d) => {
        const mt = 1 - t;
        return 3 * mt * mt * (b - a) + 6 * mt * t * (c - b) + 3 * t * t * (d - c);
    };
    const drawBezierStroke = (style, lineWidth, blur, alphaMul, offsetMul) => {
        if (!style || lineWidth <= 0) return;
        const off = (parseFloat(offsetMul) || 0) * width;
        const midDx = deriv(0.5, x0, c1x, c2x, x1);
        const midDy = deriv(0.5, y0, c1y, c2y, y1);
        const midLen = Math.hypot(midDx, midDy) || 1;
        const nx = -midDy / midLen;
        const ny = midDx / midLen;
        ctx.save();
        ctx.globalAlpha *= (alphaMul === undefined ? 1 : alphaMul);
        ctx.shadowBlur = blur || 0;
        ctx.shadowColor = shadowColor;
        ctx.strokeStyle = style;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.beginPath();
        ctx.moveTo(x0 + nx * off, y0 + ny * off);
        ctx.bezierCurveTo(c1x + nx * off, c1y + ny * off, c2x + nx * off, c2y + ny * off, x1 + nx * off, y1 + ny * off);
        ctx.stroke();
        ctx.restore();
    };

    const left = [];
    const right = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = cubic(t, x0, c1x, c2x, x1);
        const y = cubic(t, y0, c1y, c2y, y1);
        const dx = deriv(t, x0, c1x, c2x, x1);
        const dy = deriv(t, y0, c1y, c2y, y1);
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const wave = Math.pow(Math.sin(Math.PI * t), profile === 'projectile' ? 0.68 : 0.58);
        const directional = profile === 'projectile' ? (0.86 + t * 0.28) : 1;
        let scale = (0.04 + wave * 0.96) * directional;
        if (i === 0) scale = tailScale;
        if (i === segments) scale = tipScale;
        const half = width * 0.5 * scale;
        left.push([x + nx * half, y + ny * half]);
        right.push([x - nx * half, y - ny * half]);
    }

    ctx.save();
    ctx.shadowBlur = cfg.bodyBlur || 0;
    ctx.shadowColor = shadowColor;
    ctx.fillStyle = cfg.fillStyle || cfg.coreStyle || 'rgba(255,60,48,0.95)';
    ctx.beginPath();
    left.forEach((pt, idx) => idx ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]));
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    drawBezierStroke(cfg.edgeStyle, Math.max(1, width * (cfg.edgeWidthMul || 0.30)), cfg.edgeBlur || 4, cfg.edgeAlpha === undefined ? 0.80 : cfg.edgeAlpha, cfg.edgeOffset || 0);
    drawBezierStroke(cfg.coreStyle, Math.max(1, width * (cfg.coreWidthMul || 0.15)), cfg.coreBlur || 8, cfg.coreAlpha === undefined ? 0.92 : cfg.coreAlpha, cfg.coreOffset || 0);
    drawBezierStroke(cfg.hotStyle, Math.max(1, width * (cfg.hotWidthMul || 0.045)), cfg.hotBlur || 6, cfg.hotAlpha === undefined ? 0.78 : cfg.hotAlpha, cfg.hotOffset || -0.06);
};

GameRenderer.drawKasiyasBladeShards = function(ctx, cfg) {
    if (!ctx || !cfg) return;
    const count = Math.max(0, parseInt(cfg.count || 0, 10));
    const w = Math.max(1, parseFloat(cfg.w) || 100);
    const h = Math.max(1, parseFloat(cfg.h) || 60);
    const alpha = Math.max(0, Math.min(1, parseFloat(cfg.alpha) || 1));
    const colorA = cfg.colorA || `rgba(255,90,70,${0.42 * alpha})`;
    const colorB = cfg.colorB || `rgba(42,0,0,${0.48 * alpha})`;
    const angle = parseFloat(cfg.angle) || 0;
    ctx.save();
    ctx.rotate(angle);
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.shadowBlur = cfg.blur || 6;
    ctx.shadowColor = cfg.shadowColor || 'rgba(210,0,0,0.45)';
    for (let i = 0; i < count; i++) {
        const r = (i + 0.5) / count;
        const side = (i % 2 === 0 ? -1 : 1);
        const x = -w * 0.42 + w * 0.84 * r;
        const y = side * h * (0.18 + (i % 3) * 0.055);
        const len = w * (0.055 + (i % 4) * 0.014);
        ctx.strokeStyle = i % 3 === 0 ? colorA : colorB;
        ctx.lineWidth = i % 3 === 0 ? 1.7 : 2.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y - side * h * (0.08 + (i % 2) * 0.03));
        ctx.stroke();
    }
    ctx.restore();
};

GameRenderer.drawKasiyasCrescentArcSlash = function(ctx, cfg) {
    if (!ctx || !cfg) return;
    const radiusX = Math.max(20, parseFloat(cfg.radiusX) || 120);
    const radiusY = Math.max(12, parseFloat(cfg.radiusY) || 48);
    const innerScaleX = Number.isFinite(cfg.innerScaleX) ? cfg.innerScaleX : 0.82;
    const innerScaleY = Number.isFinite(cfg.innerScaleY) ? cfg.innerScaleY : 0.56;
    const rotation = parseFloat(cfg.rotation) || 0;
    const startAngle = Number.isFinite(cfg.startAngle) ? cfg.startAngle : Math.PI * 0.96;
    const endAngle = Number.isFinite(cfg.endAngle) ? cfg.endAngle : Math.PI * 0.06;
    const edgeStyle = cfg.edgeStyle || 'rgba(30,0,0,0.92)';
    const coreStyle = cfg.coreStyle || 'rgba(255,60,48,0.95)';
    const hotStyle = cfg.hotStyle || 'rgba(255,236,210,0.82)';
    const fillStyle = cfg.fillStyle || coreStyle;
    const shadowColor = cfg.shadowColor || 'rgba(220,0,0,0.60)';
    const innerRx = Math.max(8, radiusX * innerScaleX);
    const innerRy = Math.max(5, radiusY * innerScaleY);
    const midRx = (radiusX + innerRx) * 0.5;
    const midRy = (radiusY + innerRy) * 0.5;

    ctx.save();
    ctx.rotate(rotation);
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.shadowBlur = cfg.bodyBlur || 10;
    ctx.shadowColor = shadowColor;
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.ellipse(0, 0, radiusX, radiusY, 0, startAngle, endAngle, false);
    ctx.ellipse(0, 0, innerRx, innerRy, 0, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = edgeStyle;
    ctx.lineWidth = Math.max(2, radiusY * 0.20);
    ctx.shadowBlur = cfg.edgeBlur || 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, radiusX * 0.98, radiusY * 0.98, 0, startAngle, endAngle, false);
    ctx.stroke();

    ctx.strokeStyle = coreStyle;
    ctx.lineWidth = Math.max(2, radiusY * 0.18);
    ctx.shadowBlur = cfg.coreBlur || 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, midRx, midRy, 0, startAngle, endAngle, false);
    ctx.stroke();

    ctx.strokeStyle = hotStyle;
    ctx.lineWidth = Math.max(1.2, radiusY * 0.08);
    ctx.shadowBlur = cfg.hotBlur || 5;
    ctx.beginPath();
    ctx.ellipse(0, radiusY * 0.02, Math.max(8, midRx * 0.97), Math.max(5, midRy * 0.78), 0, startAngle + 0.04, endAngle - 0.04, false);
    ctx.stroke();

    // 짧은 끝파편을 더해 베기 방향은 살리되, 본체 범위를 벗어나지 않도록 제한한다.
    const tipAlpha = Number.isFinite(cfg.tipAlpha) ? cfg.tipAlpha : 1;
    const drawTip = (angle, lenMul, side) => {
        const cx = Math.cos(angle) * midRx;
        const cy = Math.sin(angle) * midRy;
        const tx = -Math.sin(angle);
        const ty = Math.cos(angle);
        ctx.strokeStyle = side === 0 ? hotStyle : coreStyle;
        ctx.lineWidth = side === 0 ? Math.max(1.2, radiusY * 0.06) : Math.max(1.8, radiusY * 0.10);
        ctx.globalAlpha *= tipAlpha;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + tx * radiusX * lenMul, cy + ty * radiusY * lenMul * 0.70);
        ctx.stroke();
        ctx.globalAlpha /= tipAlpha || 1;
    };
    drawTip(startAngle + 0.03, -0.11, 1);
    drawTip(startAngle + 0.03, -0.075, 0);
    drawTip(endAngle - 0.03, 0.11, 1);
    drawTip(endAngle - 0.03, 0.075, 0);
    ctx.restore();
};

GameRenderer.drawEffectEntity = function(ctx, eff, player) {
    const renderer = this;
    let effectX = eff.x;
    let effectY = eff.y;
    let effectZ = eff.z;

    if (eff.followTarget && eff.followTarget.active !== false && eff.followTarget.hp !== undefined) {
        const t = eff.followTarget;
        const dir = eff.dir === -1 ? -1 : 1;
        effectX = (parseFloat(t.x) || 0) + dir * (parseFloat(eff.localOffsetX) || 0);
        effectY = (parseFloat(t.y) || 0) + (parseFloat(eff.localOffsetY) || 0);
        effectZ = (parseFloat(t.z) || 0) + (parseFloat(eff.localOffsetZ) || 0);
    }

    let drawY = this.GROUND_BASE_Y + effectY;
    let drawZ = drawY - effectZ;

    ctx.save();
    ctx.translate(effectX, drawZ);

    let alpha = eff.maxLife > 0 ? (eff.life / eff.maxLife) : 1;
    alpha = Math.max(0, Math.min(1, alpha));
    ctx.globalAlpha = alpha;

    if (eff.type === 'p3DimensionCrackSuction') {
        // 중앙 균열을 기준으로 맵 전체가 빨려 들어가는 느낌의 원형 수렴 이펙트.
        const t = 1 - alpha;
        const w = Math.max(360, parseFloat(eff.w) || 900);
        const d = Math.max(160, parseFloat(eff.d) || 360);
        const ringMax = Math.max(w * 0.38, d * 0.70);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // 바닥에 원형 수렴 파동을 깐다. 좌/우 직선형이 아니라 사방에서 중앙으로 빨려드는 느낌.
        for (let i = 0; i < 4; i++) {
            const phase = (t * 1.15 + i * 0.23) % 1;
            const r = ringMax * (1.0 - phase * 0.88);
            const a = alpha * (0.20 + i * 0.035) * (0.25 + phase * 0.75);
            ctx.strokeStyle = `rgba(150,88,255,${a})`;
            ctx.lineWidth = 2.2 + i * 0.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, Math.max(18, r), Math.max(8, r * 0.30), 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 사방에서 중심으로 말려 들어가는 바람선/먼지선.
        const seed = parseFloat(eff.seed) || 0;
        const count = 34;
        for (let i = 0; i < count; i++) {
            const a = i * Math.PI * 2 / count + seed * 0.11;
            const phase = (i * 0.137 + t * 1.45 + seed) % 1;
            const outer = ringMax * (0.30 + 0.72 * phase);
            const inner = ringMax * (0.05 + 0.16 * phase);
            const ox = Math.cos(a) * outer;
            const oy = Math.sin(a) * outer * 0.30;
            const ix = Math.cos(a + 0.36) * inner;
            const iy = Math.sin(a + 0.36) * inner * 0.30;
            const mx = Math.cos(a + 0.18) * outer * 0.44;
            const my = Math.sin(a + 0.18) * outer * 0.20;
            ctx.strokeStyle = i % 3 === 0 ? `rgba(215,205,255,${0.26 * alpha})` : `rgba(126,74,255,${0.20 * alpha})`;
            ctx.lineWidth = i % 5 === 0 ? 2.0 : 1.1;
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.quadraticCurveTo(mx, my, ix, iy);
            ctx.stroke();
            if (i % 5 === 0) {
                ctx.fillStyle = `rgba(110,100,130,${0.34 * alpha})`;
                ctx.beginPath();
                ctx.ellipse(ox * 0.92, oy * 0.92 + 5, 3 + (i % 3), 2 + (i % 2), a, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    } else if (eff.type === 'p3DimensionCrackCutFlash') {
        const t = 1 - alpha;
        const w = Math.max(260, parseFloat(eff.w) || 520);
        const h = Math.max(120, parseFloat(eff.h) || 260);
        ctx.save();
        ctx.rotate(-0.70);
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 24;
        ctx.shadowColor = 'rgba(150,82,255,0.82)';
        ctx.strokeStyle = `rgba(230,218,255,${0.88 * alpha})`;
        ctx.lineWidth = 7 + 10 * t;
        ctx.beginPath();
        ctx.moveTo(-w * 0.50, 0);
        ctx.quadraticCurveTo(-w * 0.12, -h * 0.08, w * 0.50, 0);
        ctx.stroke();
        ctx.strokeStyle = `rgba(8,0,34,${0.86 * alpha})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-w * 0.44, 0);
        ctx.lineTo(w * 0.44, 0);
        ctx.stroke();
        ctx.restore();
    } else if (eff.type === 'p3HighSpeedRushTrail') {
        const sx = (parseFloat(eff.startX) || effectX) - effectX;
        const sy = (parseFloat(eff.startY) || effectY) - effectY;
        const ex = (parseFloat(eff.endX) || effectX) - effectX;
        const ey = (parseFloat(eff.endY) || effectY) - effectY;
        const dx = ex - sx;
        const dy = ey - sy;
        const angle = Math.atan2(dy, dx);
        const len = Math.max(120, Math.hypot(dx, dy));
        const d = Math.max(70, parseFloat(eff.d) || 160);
        ctx.save();
        ctx.translate((sx + ex) * 0.5, (sy + ey) * 0.5);
        ctx.rotate(angle);
        ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createLinearGradient(-len * 0.50, 0, len * 0.50, 0);
        grad.addColorStop(0, `rgba(0,0,0,0)`);
        grad.addColorStop(0.22, eff.color || `rgba(154,76,255,${0.30 * alpha})`);
        grad.addColorStop(0.55, eff.hotColor || `rgba(230,218,255,${0.46 * alpha})`);
        grad.addColorStop(0.80, eff.color || `rgba(154,76,255,${0.27 * alpha})`);
        grad.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-len * 0.50, -d * 0.08);
        ctx.quadraticCurveTo(0, -d * 0.30, len * 0.50, -d * 0.06);
        ctx.quadraticCurveTo(0, d * 0.16, -len * 0.50, d * 0.08);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = eff.accentColor || `rgba(12,0,40,${0.76 * alpha})`;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(-len * 0.42, 0);
        ctx.lineTo(len * 0.44, 0);
        ctx.stroke();
        for (let i = 0; i < 9; i++) {
            const x = -len * 0.42 + i * len * 0.105;
            ctx.strokeStyle = i % 2 ? `rgba(224,210,255,${0.34 * alpha})` : `rgba(155,78,255,${0.30 * alpha})`;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(x, -d * (0.22 + (i % 3) * 0.03));
            ctx.lineTo(x + len * 0.10, d * (0.18 + (i % 2) * 0.04));
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'p3HighSpeedRushLeafSlash') {
        const t = 1 - alpha;
        const w = Math.max(600, parseFloat(eff.w) || 1600);
        const d = Math.max(130, parseFloat(eff.d) || 230);
        const coreColor = eff.color || `rgba(156,78,255,${0.98 * alpha})`;
        const darkColor = eff.accentColor || `rgba(8,0,34,${0.98 * alpha})`;
        const hotColor = eff.hotColor || `rgba(232,218,255,${0.88 * alpha})`;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 26;
        ctx.shadowColor = 'rgba(138,68,255,0.92)';

        // 공격 박스 안을 거의 채우는 길고 날카로운 나뭇잎형 검흔.
        const grad = ctx.createLinearGradient(-w * 0.52, 0, w * 0.52, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.08, darkColor);
        grad.addColorStop(0.34, `rgba(78,20,142,${0.78 * alpha})`);
        grad.addColorStop(0.50, hotColor);
        grad.addColorStop(0.66, coreColor);
        grad.addColorStop(0.92, darkColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-w * 0.52, 0);
        ctx.quadraticCurveTo(-w * 0.26, -d * (0.56 + t * 0.08), 0, -d * 0.36);
        ctx.quadraticCurveTo(w * 0.28, -d * 0.58, w * 0.52, 0);
        ctx.quadraticCurveTo(w * 0.28, d * 0.58, 0, d * 0.36);
        ctx.quadraticCurveTo(-w * 0.26, d * 0.56, -w * 0.52, 0);
        ctx.closePath();
        ctx.fill();

        // 검은 외곽을 두껍게 잡아 가시성을 확보한다.
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,0.95)';
        ctx.strokeStyle = `rgba(6,0,22,${0.96 * alpha})`;
        ctx.lineWidth = Math.max(9, d * 0.075);
        ctx.stroke();

        // 중앙 칼날선은 더 굵고 선명하게.
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(176,100,255,0.95)';
        ctx.strokeStyle = hotColor;
        ctx.lineWidth = Math.max(4.5, d * 0.035);
        ctx.beginPath();
        ctx.moveTo(-w * 0.45, 0);
        ctx.quadraticCurveTo(0, -d * 0.045, w * 0.45, 0);
        ctx.stroke();

        ctx.strokeStyle = `rgba(158,78,255,${0.62 * alpha})`;
        ctx.lineWidth = Math.max(2.2, d * 0.018);
        ctx.beginPath();
        ctx.moveTo(-w * 0.40, -d * 0.15);
        ctx.quadraticCurveTo(0, -d * 0.26, w * 0.40, -d * 0.13);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w * 0.40, d * 0.15);
        ctx.quadraticCurveTo(0, d * 0.26, w * 0.40, d * 0.13);
        ctx.stroke();
        ctx.restore();
    } else if (eff.type === 'kasiyasP3DimensionCrackCastSlash') {
        const t = 1 - alpha;
        const w = Math.max(240, parseFloat(eff.w) || 430);
        const h = Math.max(220, parseFloat(eff.h) || 360);
        ctx.save();
        ctx.scale(eff.dir === -1 ? -1 : 1, 1);
        ctx.rotate(-0.78);
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(150,82,255,0.82)';
        ctx.strokeStyle = `rgba(230,218,255,${0.72 * alpha})`;
        ctx.lineWidth = 11 + 8 * t;
        ctx.beginPath();
        ctx.moveTo(-w * 0.34, -h * 0.05);
        ctx.quadraticCurveTo(0, -h * 0.13, w * 0.36, h * 0.04);
        ctx.stroke();
        ctx.strokeStyle = `rgba(150,74,255,${0.82 * alpha})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-w * 0.30, -h * 0.02);
        ctx.lineTo(w * 0.32, h * 0.02);
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
            const x = -w * 0.22 + i * w * 0.065;
            ctx.strokeStyle = `rgba(176,122,255,${0.38 * alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, -h * 0.08);
            ctx.lineTo(x + (i % 2 ? -1 : 1) * w * 0.04, h * 0.10);
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'kasiyasP3RushSlashCharge') {
        const t = 1 - alpha;
        const w = Math.max(180, parseFloat(eff.w) || 280);
        const h = Math.max(180, parseFloat(eff.h) || 280);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const rg = ctx.createRadialGradient(0, 0, 5, 0, 0, w * (0.40 + t * 0.22));
        rg.addColorStop(0, `rgba(232,220,255,${0.54 * alpha})`);
        rg.addColorStop(0.30, `rgba(152,72,255,${0.34 * alpha})`);
        rg.addColorStop(0.72, `rgba(10,0,34,${0.30 * alpha})`);
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.42, h * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(162,84,255,${0.58 * alpha})`;
        ctx.lineWidth = 3.2;
        for (let i = 0; i < 4; i++) {
            const r = w * (0.16 + i * 0.09 + (t % 0.20));
            ctx.beginPath();
            ctx.ellipse(0, 0, r, h * (0.12 + i * 0.035), -0.18 + i * 0.12, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'dimensionPortalOpen') {
        const t = 1 - alpha;
        const w = Math.max(220, eff.w || 520);
        const h = Math.max(70, eff.h || 170);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        if (eff.p2m2FinalPortal) {
            const dir = eff.portalDirection === 'LEFT' ? -1 : 1;
            ctx.rotate(dir === -1 ? -0.42 : 0.42);
            ctx.scale(1.0, 0.72);
            const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 130);
            const grad = ctx.createRadialGradient(0, 0, 6, 0, 0, w * 0.34);
            grad.addColorStop(0, `rgba(110,235,255,${0.82 * alpha})`);
            grad.addColorStop(0.22, `rgba(32,54,190,${0.70 * alpha})`);
            grad.addColorStop(0.62, `rgba(16,0,44,${0.80 * alpha})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * 0.30 * (0.92 + t * 0.16), h * 0.46 * (0.92 + t * 0.20), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 28 + pulse * 18;
            ctx.shadowColor = 'rgba(88,40,255,0.90)';
            ctx.strokeStyle = `rgba(124,74,255,${0.88 * alpha})`;
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * 0.30, h * 0.46, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(238,228,255,${0.55 * alpha})`;
            ctx.lineWidth = 2.4;
            for (let i = 0; i < 18; i++) {
                const a = i / 18 * Math.PI * 2 + t * 1.2;
                const r0x = w * 0.33;
                const r0y = h * 0.50;
                const r1x = w * (0.40 + (i % 4) * 0.035);
                const r1y = h * (0.58 + (i % 5) * 0.035);
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * r0x, Math.sin(a) * r0y);
                ctx.lineTo(Math.cos(a + 0.05 * Math.sin(i)) * r1x, Math.sin(a + 0.03 * Math.cos(i)) * r1y);
                ctx.stroke();
            }
            // 포탈 내부에서 살짝 보이는 카시야스 실루엣. 실제 본체 렌더는 HIDE로 숨기고, 포탈 연출에만 남긴다.
            if (eff.showKasiyasSilhouette) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = Math.min(0.60, alpha * 0.58);
                ctx.scale(dir * 0.88, 1.12);
                ctx.fillStyle = 'rgba(18,0,28,0.92)';
                ctx.strokeStyle = `rgba(255,74,80,${0.38 * alpha})`;
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.ellipse(0, -h * 0.10, w * 0.055, h * 0.11, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-w * 0.09, h * 0.02);
                ctx.lineTo(0, -h * 0.02);
                ctx.lineTo(w * 0.09, h * 0.02);
                ctx.lineTo(w * 0.05, h * 0.18);
                ctx.lineTo(-w * 0.05, h * 0.18);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        } else {
            ctx.strokeStyle = `rgba(255,70,130,${0.90 * alpha})`;
            ctx.lineWidth = 7 * (1 - t * 0.25);
            ctx.shadowBlur = 26;
            ctx.shadowColor = 'rgba(180,36,255,0.84)';
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.18 + t * 0.30), h * (0.16 + t * 0.22), Math.sin(Date.now() / 180) * 0.08, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(230,210,255,${0.68 * alpha})`;
            ctx.lineWidth = 2.2;
            for (let i = 0; i < 8; i++) {
                const x = -w * 0.22 + i * w * 0.06;
                ctx.beginPath();
                ctx.moveTo(x, -h * 0.22);
                ctx.lineTo(x + Math.sin(i) * 12, h * 0.20);
                ctx.stroke();
            }
        }
        ctx.restore();
    } else if (eff.type === 'p2m2PerfectBreak') {
        const t = 1 - alpha;
        const w = Math.max(180, parseFloat(eff.w) || 520);
        const h = Math.max(150, parseFloat(eff.h) || 340);
        const renderType = String(eff.renderType || '').trim().toUpperCase();
        const isPortal = renderType.indexOf('PORTAL_BREAK') >= 0;
        const dirSign = eff.dir === -1 ? -1 : 1;
        const pulse = 0.5 + Math.sin(Date.now() / 42) * 0.5;
        const drawPerfectBreakGiantBlade = (ctx, len, bladeH, dir = 1, drawAlpha = 1, opts = {}) => {
            ctx.save();
            ctx.scale(dir === -1 ? -1 : 1, 1);
            ctx.globalAlpha *= drawAlpha;
            ctx.globalCompositeOperation = opts.composite || 'source-over';
            const aura = ctx.createRadialGradient(0, 0, 8, 0, 0, len * 0.64);
            aura.addColorStop(0, `rgba(255,235,210,${0.16 * drawAlpha})`);
            aura.addColorStop(0.42, `rgba(190,0,0,${0.18 * drawAlpha})`);
            aura.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.ellipse(0, 0, len * 0.62, bladeH * 1.42, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = opts.shadowBlur || 18;
            ctx.shadowColor = opts.shadowColor || 'rgba(255,66,44,0.78)';
            const bladeGrad = ctx.createLinearGradient(-len * 0.55, 0, len * 0.44, 0);
            bladeGrad.addColorStop(0, 'rgba(250,246,228,0.98)');
            bladeGrad.addColorStop(0.20, 'rgba(124,116,114,0.98)');
            bladeGrad.addColorStop(0.64, 'rgba(32,24,26,0.98)');
            bladeGrad.addColorStop(1, 'rgba(250,246,220,0.98)');
            ctx.fillStyle = bladeGrad;
            ctx.strokeStyle = 'rgba(12,0,0,0.96)';
            ctx.lineWidth = Math.max(3, bladeH * 0.045);
            ctx.beginPath();
            ctx.moveTo(-len * 0.58, 0);
            ctx.lineTo(-len * 0.36, -bladeH * 0.52);
            ctx.lineTo(len * 0.23, -bladeH * 0.36);
            ctx.lineTo(len * 0.47, 0);
            ctx.lineTo(len * 0.23, bladeH * 0.36);
            ctx.lineTo(-len * 0.36, bladeH * 0.52);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.shadowBlur = 8;
            ctx.strokeStyle = `rgba(255,244,210,${0.62 * drawAlpha})`;
            ctx.lineWidth = Math.max(1.5, bladeH * 0.018);
            ctx.beginPath();
            ctx.moveTo(-len * 0.42, 0);
            ctx.lineTo(len * 0.34, 0);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255,66,58,${0.78 * drawAlpha})`;
            ctx.lineWidth = Math.max(3, bladeH * 0.050);
            ctx.beginPath();
            ctx.moveTo(len * 0.14, -bladeH * 0.58);
            ctx.lineTo(len * 0.14, bladeH * 0.58);
            ctx.stroke();
            ctx.fillStyle = `rgba(22,0,0,${0.96 * drawAlpha})`;
            ctx.fillRect(len * 0.12, -bladeH * 0.12, len * 0.35, bladeH * 0.24);
            ctx.restore();
        };

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        if (isPortal) {
            // 포탈 적중형: 날아간 거대한 검이 포탈 중심에 박히고, 검을 축으로 차원문이 뒤틀리며 붕괴한다.
            ctx.save();
            ctx.rotate(dirSign * -0.22);
            const collapse = Math.max(0, Math.min(1, t));
            const rg = ctx.createRadialGradient(0, 0, 2, 0, 0, w * (0.30 + collapse * 0.30));
            rg.addColorStop(0, `rgba(255,255,245,${0.70 * alpha})`);
            rg.addColorStop(0.22, `rgba(126,228,255,${0.48 * alpha})`);
            rg.addColorStop(0.52, `rgba(88,30,190,${0.42 * alpha})`);
            rg.addColorStop(0.82, `rgba(18,0,42,${0.34 * alpha})`);
            rg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.28 + collapse * 0.20), h * (0.24 + collapse * 0.18), dirSign * 0.04, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 34;
            ctx.shadowColor = 'rgba(120,224,255,0.95)';
            ctx.strokeStyle = `rgba(244,255,255,${0.72 * alpha})`;
            ctx.lineWidth = 5.8 + collapse * 2.4;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.24 + collapse * 0.08), h * (0.20 + collapse * 0.07), dirSign * 0.04, 0, Math.PI * 2);
            ctx.stroke();

            // 박힌 거대한 검 실루엣.
            ctx.save();
            ctx.translate(-dirSign * w * (0.23 - collapse * 0.04), -h * 0.01);
            ctx.rotate(dirSign * (0.02 + collapse * 0.035));
            drawPerfectBreakGiantBlade(ctx, w * 0.66, h * 0.17, dirSign, 0.92 * alpha, { composite: 'lighter', shadowBlur: 22, shadowColor: 'rgba(255,78,48,0.90)' });
            ctx.restore();

            // 검이 박힌 중심부에서 균열이 터져나오는 선.
            ctx.strokeStyle = `rgba(235,250,255,${0.72 * alpha})`;
            ctx.lineWidth = 2.6;
            ctx.shadowBlur = 18;
            ctx.shadowColor = 'rgba(150,230,255,0.96)';
            for (let i = 0; i < 18; i++) {
                const a = (i / 18) * Math.PI * 2 + collapse * 0.75;
                const r0 = w * (0.10 + (i % 3) * 0.018);
                const r1 = w * (0.26 + collapse * 0.26 + (i % 5) * 0.024);
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * h * 0.12);
                ctx.lineTo(Math.cos(a + dirSign * 0.08) * r1, Math.sin(a + 0.05) * h * 0.34);
                ctx.stroke();
            }

            // 붕괴 파편/공간 조각.
            for (let i = 0; i < 24; i++) {
                const a = i / 24 * Math.PI * 2 + collapse * 1.15;
                const r = w * (0.16 + collapse * 0.40) * (0.65 + (i % 4) * 0.11);
                ctx.save();
                ctx.translate(Math.cos(a) * r, Math.sin(a) * h * 0.32);
                ctx.rotate(a + pulse * 0.35);
                ctx.fillStyle = i % 3 === 0 ? `rgba(245,255,255,${0.48 * alpha})` : `rgba(112,42,230,${0.42 * alpha})`;
                ctx.beginPath();
                ctx.moveTo(-5 - (i % 3), 0);
                ctx.lineTo(0, -2 - (i % 2));
                ctx.lineTo(6 + (i % 4), 0);
                ctx.lineTo(0, 3 + (i % 2));
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            ctx.restore();
        } else {
            // 카시야스 직격형: 거대한 검과 카시야스의 쌍검이 맞물려 버티다 금속 마찰광으로 화면이 밝아진다.
            const clash = Math.max(0, Math.min(1, t));
            const rg = ctx.createRadialGradient(0, 0, 4, 0, 0, w * (0.28 + clash * 0.30));
            rg.addColorStop(0, `rgba(255,255,226,${0.80 * alpha})`);
            rg.addColorStop(0.20, `rgba(255,104,64,${0.52 * alpha})`);
            rg.addColorStop(0.56, `rgba(92,0,0,${0.34 * alpha})`);
            rg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.22 + clash * 0.24), h * (0.20 + clash * 0.18), 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.rotate(dirSign * -0.06);
            drawPerfectBreakGiantBlade(ctx, w * 0.70, h * 0.18, dirSign, 0.88 * alpha, { composite: 'lighter', shadowBlur: 20, shadowColor: 'rgba(255,64,38,0.88)' });
            ctx.restore();

            // 카시야스가 두 검으로 막아내려는 X형 방어 실루엣.
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(255,230,190,0.92)';
            ctx.strokeStyle = `rgba(255,244,218,${0.86 * alpha})`;
            ctx.lineWidth = 5.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-dirSign * w * 0.20, -h * 0.24);
            ctx.quadraticCurveTo(0, -h * 0.04, dirSign * w * 0.25, h * 0.18);
            ctx.moveTo(-dirSign * w * 0.16, h * 0.25);
            ctx.quadraticCurveTo(0, h * 0.02, dirSign * w * 0.24, -h * 0.20);
            ctx.stroke();
            ctx.strokeStyle = `rgba(110,0,0,${0.88 * alpha})`;
            ctx.lineWidth = 8.5;
            ctx.beginPath();
            ctx.moveTo(-dirSign * w * 0.23, -h * 0.27);
            ctx.lineTo(dirSign * w * 0.20, h * 0.15);
            ctx.moveTo(-dirSign * w * 0.18, h * 0.27);
            ctx.lineTo(dirSign * w * 0.22, -h * 0.18);
            ctx.stroke();

            // 금속 마찰 스파크가 화면을 하얗게 밀어내는 느낌.
            for (let i = 0; i < 26; i++) {
                const a = -Math.PI * 0.82 + i * Math.PI * 0.065 + clash * 0.32;
                const len = w * (0.20 + clash * 0.48) * (0.65 + (i % 5) * 0.09);
                const sx = Math.cos(a) * w * 0.05;
                const sy = Math.sin(a) * h * 0.06;
                ctx.strokeStyle = i % 2 ? `rgba(255,226,170,${0.72 * alpha})` : `rgba(255,255,235,${0.86 * alpha})`;
                ctx.lineWidth = i % 3 === 0 ? 3.2 : 1.8;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(Math.cos(a) * len, Math.sin(a) * h * (0.22 + clash * 0.22));
                ctx.stroke();
            }

            // 부서지는 회오리 검풍 조각.
            ctx.strokeStyle = `rgba(255,52,42,${0.40 * alpha})`;
            ctx.lineWidth = 3.0;
            for (let i = 0; i < 7; i++) {
                const r = w * (0.16 + i * 0.035 + clash * 0.05);
                ctx.beginPath();
                ctx.ellipse(0, 0, r, h * (0.12 + i * 0.018), dirSign * (0.35 + i * 0.10), Math.PI * (0.08 + i * 0.06), Math.PI * (1.1 + i * 0.05));
                ctx.stroke();
            }
        }
        ctx.restore();
    } else if (eff.type === 'p2m2GiantSwordHit') {
        const t = 1 - alpha;
        const w = Math.max(80, parseFloat(eff.w) || 180);
        const h = Math.max(70, parseFloat(eff.h) || 160);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255,42,36,0.72)';
        ctx.strokeStyle = `rgba(255,232,210,${0.76 * alpha})`;
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 8; i++) {
            const a = -Math.PI * 0.72 + i * Math.PI * 0.20 + t * 0.8;
            const r0 = w * (0.05 + t * 0.06);
            const r1 = w * (0.14 + t * 0.20 + (i % 3) * 0.015);
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * h * 0.12);
            ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * h * 0.26);
            ctx.stroke();
        }
        ctx.strokeStyle = `rgba(120,0,0,${0.70 * alpha})`;
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(-w * 0.18, -h * 0.16);
        ctx.lineTo(w * 0.18, h * 0.10);
        ctx.moveTo(-w * 0.08, h * 0.18);
        ctx.lineTo(w * 0.22, -h * 0.10);
        ctx.stroke();
        ctx.restore();
    } else if (eff.type === 'p2m2GiantSwordBreak') {
        const t = 1 - alpha;
        const w = Math.max(120, parseFloat(eff.w) || 280);
        const h = Math.max(120, parseFloat(eff.h) || 220);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const burst = ctx.createRadialGradient(0, 0, 5, 0, 0, w * (0.30 + t * 0.22));
        burst.addColorStop(0, `rgba(255,230,180,${0.44 * alpha})`);
        burst.addColorStop(0.34, `rgba(255,54,42,${0.30 * alpha})`);
        burst.addColorStop(0.72, `rgba(66,0,0,${0.22 * alpha})`);
        burst.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = burst;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.42, h * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255,42,34,0.78)';
        for (let i = 0; i < 18; i++) {
            const a = i / 18 * Math.PI * 2 + t * 0.45;
            const r = w * (0.10 + t * 0.46) * (0.65 + (i % 4) * 0.10);
            const len = w * (0.045 + (i % 5) * 0.008);
            ctx.save();
            ctx.translate(Math.cos(a) * r, Math.sin(a) * h * 0.28 * (0.7 + (i%3)*0.12));
            ctx.rotate(a + Math.PI / 2);
            ctx.fillStyle = i % 3 === 0 ? `rgba(230,220,210,${0.72 * alpha})` : `rgba(92,0,0,${0.78 * alpha})`;
            ctx.beginPath();
            ctx.moveTo(-len * 0.55, 0);
            ctx.lineTo(0, -len * 0.16);
            ctx.lineTo(len * 0.55, 0);
            ctx.lineTo(0, len * 0.16);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    } else if (eff.type === 'p2m2ApostleEnergyAbsorb') {
        const t = 1 - alpha;
        const target = eff.target || null;
        const tx = target ? ((parseFloat(target.x) || 0) - effectX) : ((parseFloat(eff.targetX) || 0) - effectX);
        const tyWorld = target ? ((parseFloat(target.y) || 0) - effectY) : ((parseFloat(eff.targetY) || 0) - effectY);
        const tz = target ? ((parseFloat(target.z) || 0) + Math.max(78, (parseFloat(target.bodyZ) || 120) * (parseFloat(target.scale) || 1) * 0.75) - effectZ) : ((parseFloat(eff.targetZ) || 0) - effectZ);
        const dyScreen = tyWorld - tz;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255,34,34,0.82)';
        for (let i = 0; i < 16; i++) {
            const r = (i + 0.5) / 16;
            const wave = Math.sin(i * 1.7 + t * 8) * 18;
            const x = tx * t * r + wave * (1 - t) * 0.5;
            const y = dyScreen * t * r + Math.cos(i + t * 7) * 14 * (1 - t);
            ctx.fillStyle = i % 2 ? `rgba(255,66,52,${0.58 * alpha})` : `rgba(134,0,180,${0.48 * alpha})`;
            ctx.beginPath();
            ctx.ellipse(x, y, 4 + (i % 3), 2.4 + (i % 2), 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = `rgba(255,86,68,${0.42 * alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(tx * 0.28, dyScreen * 0.08 - 50, tx * 0.62, dyScreen * 0.72 + 30, tx, dyScreen);
        ctx.stroke();
        ctx.restore();
    } else if (eff.type === 'fallingSwordImpact') {
        const t = 1 - alpha;
        const w = Math.max(40, eff.w || 150);
        const d = Math.max(28, eff.d || 90);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(255,50,70,${0.26 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.25 + t * 0.38), d * (0.24 + t * 0.32), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,210,180,${0.78 * alpha})`;
        ctx.lineWidth = 2.2;
        for (let i = 0; i < 9; i++) {
            const a = i / 9 * Math.PI * 2 + t * 0.6;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * w * 0.12, Math.sin(a) * d * 0.08);
            ctx.lineTo(Math.cos(a) * w * (0.35 + t * 0.34), Math.sin(a) * d * (0.26 + t * 0.32));
            ctx.stroke();
        }
        ctx.strokeStyle = `rgba(230,220,255,${0.72 * alpha})`;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(0, -90 * (1 - t * 0.3));
        ctx.lineTo(0, -8);
        ctx.stroke();
        ctx.restore();
    } else if (eff.type === 'kasiyasDoubleEdgedSpin') {
        const t = 1 - alpha;
        const dir = eff.dir === -1 ? -1 : 1;
        const hitW = Math.max(52, parseFloat(eff.w) || 120);
        const hitD = Math.max(34, parseFloat(eff.d) || 80);
        const hitH = Math.max(130, parseFloat(eff.h) || 210);
        const visualW = Math.max(42, Math.min(hitW * 0.62, hitD * 1.10));
        const visualH = Math.max(150, hitH * 0.96);
        ctx.save();
        ctx.scale(dir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 22;
        ctx.shadowColor = eff.accentColor || 'rgba(226,32,24,0.78)';

        // 실제 회전 칼날 히트박스 중심에 맞춘 좁고 높은 세로 회오리.
        const grad = ctx.createRadialGradient(0, 0, visualW * 0.10, 0, 0, Math.max(visualW * 0.75, visualH * 0.32));
        grad.addColorStop(0, `rgba(255,214,190,${0.22 * alpha})`);
        grad.addColorStop(0.42, `rgba(180,18,14,${0.16 * alpha})`);
        grad.addColorStop(1, 'rgba(16,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, visualW * (0.58 + t * 0.08), visualH * 0.50, 0, 0, Math.PI * 2);
        ctx.fill();

        const now = Date.now();
        for (let i = 0; i < 7; i++) {
            const phase = now / (70 + i * 9) + i * 1.18;
            const yOff = Math.sin(phase) * visualH * 0.10;
            const rx = visualW * (0.20 + (i % 3) * 0.075);
            const ry = visualH * (0.20 + i * 0.035);
            ctx.strokeStyle = i % 2 ? `rgba(255,166,132,${0.46 * alpha})` : `rgba(230,34,24,${0.66 * alpha})`;
            ctx.lineWidth = i % 2 ? 3.0 : 4.8;
            ctx.beginPath();
            ctx.ellipse(0, yOff, rx, ry, Math.sin(phase) * 0.26, Math.PI * 0.05, Math.PI * 1.95);
            ctx.stroke();
        }

        // 세로로 세운 양날검 축과 칼날 잔상.
        ctx.strokeStyle = eff.hotColor || `rgba(255,238,185,${0.90 * alpha})`;
        ctx.lineWidth = 6.2;
        ctx.beginPath();
        ctx.moveTo(0, -visualH * 0.54);
        ctx.lineTo(0, visualH * 0.50);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,222,206,${0.76 * alpha})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-visualW * 0.12, -visualH * 0.44);
        ctx.lineTo(visualW * 0.12, visualH * 0.42);
        ctx.moveTo(visualW * 0.12, -visualH * 0.44);
        ctx.lineTo(-visualW * 0.12, visualH * 0.42);
        ctx.stroke();
        ctx.restore();
    } else if (eff.type === 'kasiyasP2PutSword') {
        const t = 1 - alpha;
        const dir = eff.dir || 1;
        ctx.save();
        ctx.scale(dir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.strokeStyle = eff.color || 'rgba(230,245,255,0.86)';
        ctx.shadowBlur = 12;
        ctx.shadowColor = eff.accentColor || 'rgba(255,80,52,0.55)';
        for (const sy of [-46, 46]) {
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(-28 + t * 20, sy - 38 + t * 12);
            ctx.lineTo(34, sy + 8);
            ctx.stroke();
            ctx.strokeStyle = eff.accentColor || 'rgba(255,86,54,0.66)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(42, sy + 12, 26 + t * 18, 9 + t * 5, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'kasiyasP2GroundSwords') {
        ctx.save();
        ctx.scale(eff.dir || 1, 1);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const swords = Array.isArray(eff.swords) ? eff.swords : [{ dx: -82, dy: -18, angle: -0.08 }, { dx: 82, dy: 18, angle: 0.08 }];

        // 두 자루의 검을 카시야스 양 옆에 꽂아 두되, 모델링을 가리지 않도록
        // 검 크기와 중앙 흙더미를 줄이고 각 검 아래에만 작은 흙더미를 둔다.
        swords.forEach((sw, idx) => {
            const dx = parseFloat(sw && sw.dx); const dy = parseFloat(sw && sw.dy);
            const angle = parseFloat(sw && sw.angle);
            const sx = isFinite(dx) ? dx : (idx === 0 ? -82 : 82);
            const sy = isFinite(dy) ? dy : (idx === 0 ? -18 : 18);
            ctx.save();
            ctx.translate(sx, sy);

            const moundW = Math.max(42, (eff.w || 116) * 0.38);
            const moundH = Math.max(14, (eff.h || 118) * 0.11);
            ctx.save();
            ctx.globalAlpha *= 0.90;
            ctx.fillStyle = 'rgba(35,26,20,0.64)';
            ctx.beginPath();
            ctx.ellipse(0, 12, moundW, moundH, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(91,67,43,0.56)';
            ctx.beginPath();
            ctx.ellipse(-moundW * 0.12, 8, moundW * 0.68, moundH * 0.72, -0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(8,0,0,0.54)';
            ctx.lineWidth = 1.4;
            for (let i = 0; i < 3; i++) {
                const crackX = (i - 1) * moundW * 0.34;
                ctx.beginPath();
                ctx.moveTo(crackX, 11);
                ctx.lineTo(crackX + (i - 1) * 8, 22 + i * 2);
                ctx.stroke();
            }
            ctx.restore();

            ctx.rotate(isFinite(angle) ? angle : (idx === 0 ? -0.08 : 0.08));
            const bladeLen = Math.max(64, (eff.h || 118) * 0.55);
            const bladeW = Math.max(6, bladeLen * 0.065);
            const baseY = 0;
            const tipY = -bladeLen;

            ctx.shadowBlur = 7;
            ctx.shadowColor = 'rgba(160,215,255,0.34)';
            ctx.strokeStyle = 'rgba(0,0,0,0.84)';
            ctx.lineWidth = bladeW + 4;
            ctx.beginPath();
            ctx.moveTo(0, baseY + 2);
            ctx.lineTo(0, tipY);
            ctx.stroke();

            const bladeGrad = ctx.createLinearGradient(-bladeW, 0, bladeW, 0);
            bladeGrad.addColorStop(0, 'rgba(158,178,190,0.92)');
            bladeGrad.addColorStop(0.45, eff.color || 'rgba(232,246,255,0.95)');
            bladeGrad.addColorStop(1, 'rgba(82,104,120,0.92)');
            ctx.strokeStyle = bladeGrad;
            ctx.lineWidth = bladeW;
            ctx.beginPath();
            ctx.moveTo(0, baseY);
            ctx.lineTo(0, tipY);
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.58)';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(0, baseY - 6);
            ctx.lineTo(0, tipY + 8);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(0,0,0,0.86)';
            ctx.lineWidth = 5.5;
            ctx.beginPath();
            ctx.moveTo(-18, tipY + 18);
            ctx.lineTo(18, tipY + 18);
            ctx.stroke();
            ctx.strokeStyle = eff.accentColor || 'rgba(94,30,18,0.90)';
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(-17, tipY + 18);
            ctx.lineTo(17, tipY + 18);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(0,0,0,0.86)';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(0, tipY + 17);
            ctx.lineTo(0, tipY - 16);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(78,44,24,0.94)';
            ctx.lineWidth = 3.8;
            ctx.beginPath();
            ctx.moveTo(0, tipY + 15);
            ctx.lineTo(0, tipY - 15);
            ctx.stroke();

            ctx.fillStyle = 'rgba(42,30,21,0.78)';
            ctx.beginPath();
            ctx.ellipse(0, baseY + 4, 16, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        ctx.restore();
    } else if (eff.type === 'kasiyasP2GroundPunchCharge') {
        const t = 1 - alpha;
        const w = Math.max(120, eff.w || 220);
        const h = Math.max(120, eff.h || 200);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,72,48,${0.30 + alpha * 0.42})`;
        ctx.fillStyle = `rgba(70,0,0,${0.10 + alpha * 0.12})`;
        ctx.shadowBlur = 22;
        ctx.shadowColor = eff.color || 'rgba(255,58,42,0.62)';
        for (let i = 0; i < 3; i++) {
            const r = (0.24 + i * 0.13 + (t % 0.22)) * w;
            ctx.lineWidth = 2.5 + i;
            ctx.beginPath();
            ctx.ellipse(0, h * (0.05 - i * 0.10), r * 0.45, r * 0.28, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'kasiyasP2JumpTrail') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const dx = (parseFloat(eff.targetX) || effectX) - effectX;
        const dy = (parseFloat(eff.targetY) || effectY) - effectY;
        ctx.strokeStyle = `rgba(255,64,44,${0.48 * alpha})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(dx * 0.5, dy * 0.5 - 120, dx, dy);
        ctx.stroke();
        ctx.restore();
    } else if (eff.type === 'kasiyasP2AirSpinSlash') {
        const t = 1 - alpha;
        const w = Math.max(260, eff.w || 760);
        const d = Math.max(100, eff.d || 260);
        ctx.save();
        ctx.scale(eff.dir || 1, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 34;
        ctx.shadowColor = eff.color || 'rgba(255,60,42,0.90)';
        ctx.fillStyle = `rgba(90,0,0,${0.13 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.30 + t * 0.16), d * (0.24 + t * 0.10), -0.08, 0, Math.PI * 2);
        ctx.fill();
        if (eff.p2m2BodySpin) {
            // 공중 회전베기: 카시야스 신체 주변을 감싸는 회오리형 검풍.
            for (let i = 0; i < 5; i++) {
                const phase = t * 2.2 + i * 0.42;
                const yy = Math.sin(phase * Math.PI * 2) * d * 0.10;
                const rot = -0.38 + i * 0.18 + t * 0.62;
                const ww = w * (0.28 + i * 0.035);
                const dd = d * (0.30 + i * 0.040);
                ctx.strokeStyle = i % 2 === 0 ? `rgba(255,62,40,${0.70 * alpha})` : `rgba(45,0,0,${0.82 * alpha})`;
                ctx.lineWidth = 9 - i * 0.9;
                ctx.beginPath();
                ctx.ellipse(0, yy, ww, dd, rot, Math.PI * 0.10, Math.PI * 1.86);
                ctx.stroke();
            }
            ctx.strokeStyle = `rgba(255,230,170,${0.72 * alpha})`;
            ctx.lineWidth = 3.2;
            for (let i = 0; i < 8; i++) {
                const ang = i * Math.PI * 2 / 8 + t * 3.8;
                ctx.beginPath();
                ctx.moveTo(Math.cos(ang) * w * 0.13, Math.sin(ang) * d * 0.16);
                ctx.lineTo(Math.cos(ang + 0.42) * w * 0.40, Math.sin(ang + 0.22) * d * 0.44);
                ctx.stroke();
            }
        } else {
            ctx.strokeStyle = eff.accentColor || `rgba(28,0,0,${0.96 * alpha})`;
            ctx.lineWidth = 16;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.33 + t * 0.18), d * (0.23 + t * 0.14), -0.10, Math.PI * 0.06, Math.PI * 1.92);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255,56,40,${0.92 * alpha})`;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.ellipse(0, -3, w * (0.29 + t * 0.16), d * (0.19 + t * 0.12), -0.12, Math.PI * 0.10, Math.PI * 1.82);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255,226,138,${0.78 * alpha})`;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.ellipse(0, -8, w * (0.24 + t * 0.13), d * (0.14 + t * 0.09), -0.15, Math.PI * 0.15, Math.PI * 1.68);
            ctx.stroke();
            if (eff.p2m2FinalSpin) {
                // 중앙 착지 후 지면을 크게 훑는 3중 횡베기 검호 느낌.
                for (let i = 0; i < 3; i++) {
                    const yy = (i - 1) * d * 0.20;
                    const ww = w * (0.42 + i * 0.085 + t * 0.10);
                    const dd = d * (0.20 + i * 0.045);
                    ctx.strokeStyle = i === 1 ? `rgba(255,235,160,${0.74 * alpha})` : `rgba(255,60,42,${0.66 * alpha})`;
                    ctx.lineWidth = 6 - i * 0.7;
                    ctx.beginPath();
                    ctx.ellipse(0, yy, ww, dd, -0.05 + i * 0.07, Math.PI * 0.04, Math.PI * 1.92);
                    ctx.stroke();
                }
            }
        }
        ctx.restore();
    } else if (eff.type === 'terrainCollapseFall') {
        const t = 1 - alpha;
        const w = Math.max(80, eff.w || 130);
        const d = Math.max(46, eff.d || 70);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(255,72,48,${0.18 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.34 + t * 0.24), d * (0.20 + t * 0.20), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = eff.accentColor || `rgba(24,0,0,${0.78 * alpha})`;
        ctx.lineWidth = Math.max(3, 5.2 * alpha);
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.24 + t * 0.30), d * (0.15 + t * 0.23), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,96,54,${0.56 * alpha})`;
        ctx.lineWidth = 2.4;
        for (let i = 0; i < 10; i++) {
            const ang = i * Math.PI * 2 / 10 + t * 0.7;
            const r1x = w * (0.18 + (i % 3) * 0.026);
            const r1y = d * (0.10 + (i % 2) * 0.028);
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * r1x, Math.sin(ang) * r1y);
            ctx.lineTo(Math.cos(ang) * w * (0.38 + t * 0.16), Math.sin(ang) * d * (0.25 + t * 0.14));
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'terrainCollapsePlayerFall') {
        const t = 1 - alpha;
        const w = Math.max(38, eff.w || 56);
        const h = Math.max(80, eff.h || 120);
        const fall = 18 + t * 118;
        const squash = Math.max(0.55, 1 - t * 0.34);
        ctx.save();
        ctx.translate(0, fall);
        ctx.scale(eff.dir || 1, 1);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha *= Math.max(0, alpha * 0.72);
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(255,70,42,0.55)';
        ctx.strokeStyle = eff.accentColor || `rgba(18,0,0,${0.82 * alpha})`;
        ctx.fillStyle = `rgba(30,8,8,${0.58 * alpha})`;
        ctx.lineWidth = Math.max(3, w * 0.06);
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.84 * squash, w * 0.28, h * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `rgba(70,18,16,${0.44 * alpha})`;
        ctx.strokeStyle = `rgba(255,112,72,${0.32 * alpha})`;
        ctx.lineWidth = Math.max(4, w * 0.10);
        ctx.beginPath();
        ctx.roundRect(-w * 0.30, -h * 0.68 * squash, w * 0.60, h * 0.62 * squash, 8);
        ctx.fill();
        ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,88,58,${0.42 * alpha})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const lx = (i - 1.5) * w * 0.20;
            ctx.beginPath();
            ctx.moveTo(lx, -h * 0.18 + t * 10);
            ctx.lineTo(lx - (eff.dir || 1) * (18 + i * 5), -h * 0.52 - i * 8);
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'kasiyasP2SwordStormCast') {
        const apostle = !!eff.apostle;
        const w = Math.max(140, eff.w || 220);
        const h = Math.max(120, eff.h || 200);
        const t = 1 - alpha;
        const spin = Date.now() / (apostle ? 76 : 85);
        ctx.save();
        ctx.scale(eff.dir || 1, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = apostle ? 28 : 22;
        ctx.shadowColor = apostle ? 'rgba(235,0,0,0.78)' : 'rgba(175,232,255,0.72)';

        const grad = ctx.createRadialGradient(w * 0.18, -h * 0.03, 8, w * 0.18, -h * 0.03, w * (0.44 + t * 0.22));
        grad.addColorStop(0, apostle ? `rgba(255,210,110,${0.34 * alpha})` : `rgba(255,255,255,${0.36 * alpha})`);
        grad.addColorStop(0.42, apostle ? `rgba(255,46,34,${0.32 * alpha})` : `rgba(120,220,255,${0.28 * alpha})`);
        grad.addColorStop(0.78, apostle ? `rgba(28,0,0,${0.28 * alpha})` : `rgba(20,42,56,${0.20 * alpha})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w * 0.16, -h * 0.04, w * (0.42 + t * 0.20), 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.translate(w * (0.03 + i * 0.07), -h * (0.04 + i * 0.03));
            ctx.rotate(spin * (i % 2 ? -1 : 1) + i * 0.65);
            ctx.strokeStyle = apostle
                ? (i % 2 ? `rgba(22,0,0,${0.68 * alpha})` : `rgba(255,74,54,${0.82 * alpha})`)
                : (i % 2 ? `rgba(20,42,56,${0.55 * alpha})` : `rgba(218,250,255,${0.76 * alpha})`);
            ctx.lineWidth = Math.max(2.1, 4.7 - i * 0.42);
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.30 + i * 0.058), h * (0.10 + i * 0.019), 0, -Math.PI * 0.10, Math.PI * 1.58);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();

    } else if (eff.type === 'swordStormPulse' || eff.type === 'swordStormBurst' || eff.type === 'swordStormDisappear') {
        const apostle = !!eff.apostle;
        const burst = eff.type === 'swordStormBurst';
        const disappear = eff.type === 'swordStormDisappear';
        const w = Math.max(120, eff.w || 240);
        const d = Math.max(60, eff.d || w * 0.42);
        const h = Math.max(120, eff.h || 220);
        const t = 1 - alpha;
        const pulse = 0.5 + Math.sin(Date.now() / 64) * 0.5;
        const core = apostle ? `rgba(255,54,38,${0.80 * alpha})` : `rgba(226,250,255,${0.82 * alpha})`;
        const mid = apostle ? `rgba(118,0,0,${0.68 * alpha})` : `rgba(86,180,220,${0.56 * alpha})`;
        const dark = apostle ? `rgba(5,0,0,${0.82 * alpha})` : `rgba(8,25,36,${0.64 * alpha})`;
        const hot = apostle ? `rgba(255,206,112,${0.72 * alpha})` : `rgba(255,255,255,${0.70 * alpha})`;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = apostle ? 28 : 22;
        ctx.shadowColor = apostle ? 'rgba(230,0,0,0.72)' : 'rgba(150,232,255,0.60)';

        if (burst) {
            const ring = 0.34 + t * 0.85;
            const ringGrad = ctx.createRadialGradient(0, 0, w * 0.10, 0, 0, w * ring);
            ringGrad.addColorStop(0, apostle ? `rgba(255,210,118,${0.34 * alpha})` : `rgba(255,255,255,${0.34 * alpha})`);
            ringGrad.addColorStop(0.50, apostle ? `rgba(255,42,30,${0.24 * alpha})` : `rgba(112,218,255,${0.22 * alpha})`);
            ringGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = ringGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * ring, d * (0.42 + t * 0.72), 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = dark;
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.44 + t * 0.42), d * (0.24 + t * 0.40), 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = hot;
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.34 + t * 0.48), d * (0.16 + t * 0.36), 0, 0, Math.PI * 2);
            ctx.stroke();
        } else if (disappear) {
            // 소멸 이펙트는 폭발 이후 한 번 더 커지는 연출이 아니라,
            // 남은 회오리 띠가 안쪽으로 말려 올라가며 자연스럽게 흐려지는 느낌으로 처리한다.
            const fadeShrink = Math.max(0.48, 1 - t * 0.28);
            ctx.globalAlpha *= alpha * 0.72;
            ctx.strokeStyle = mid;
            ctx.lineWidth = Math.max(0.8, 5.4 * alpha);
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.translate(0, -h * (0.15 + i * 0.10 + t * 0.10));
                ctx.rotate(Date.now() / (120 + i * 40));
                ctx.beginPath();
                ctx.ellipse(0, 0, w * (0.24 + i * 0.10) * fadeShrink, d * (0.13 + i * 0.04) * fadeShrink, 0, -Math.PI * 0.1, Math.PI * (1.65 - t * 0.28));
                ctx.stroke();
                ctx.restore();
            }
        } else {
            const ringW = w * (0.42 + t * 0.10);
            const ringD = d * (0.26 + t * 0.10);
            ctx.strokeStyle = mid;
            ctx.lineWidth = 4.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, ringW, ringD, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = core;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.ellipse(0, 0, ringW * (0.72 + pulse * 0.08), ringD * (0.62 + pulse * 0.08), 0, -Math.PI * 0.1, Math.PI * 1.25);
            ctx.stroke();
        }

        const bladeCount = burst ? 14 : (disappear ? 7 : 8);
        for (let i = 0; i < bladeCount; i++) {
            const ang = Date.now() / (apostle ? 80 : 96) + i * Math.PI * 2 / bladeCount;
            const disappearBladeShrink = disappear ? Math.max(0.42, 1 - t * 0.34) : 1;
            const dist = w * (burst ? (0.26 + t * 0.54) : (disappear ? (0.26 + pulse * 0.025) * disappearBladeShrink : (0.28 + pulse * 0.06)));
            const bx = Math.cos(ang) * dist;
            const by = Math.sin(ang) * d * (burst ? (0.24 + t * 0.42) : (disappear ? 0.20 * disappearBladeShrink : 0.22)) - h * (0.12 + (i % 3) * 0.08 + (disappear ? t * 0.10 : 0));
            const len = ((burst ? 28 : 18) + (i % 3) * 5) * (disappear ? Math.max(0.45, 1 - t * 0.38) : 1);
            const bw = (burst ? 8 : 5) * (disappear ? Math.max(0.45, 1 - t * 0.32) : 1);
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(ang + Math.PI * 0.52);
            ctx.fillStyle = dark;
            ctx.beginPath();
            ctx.moveTo(-len * 0.55, 0);
            ctx.quadraticCurveTo(0, -bw, len * 0.60, -bw * 0.10);
            ctx.quadraticCurveTo(0, bw * 0.75, -len * 0.55, 0);
            ctx.fill();
            ctx.fillStyle = apostle ? `rgba(255,82,62,${0.86 * alpha})` : `rgba(188,238,255,${0.86 * alpha})`;
            ctx.beginPath();
            ctx.moveTo(-len * 0.42, -bw * 0.05);
            ctx.quadraticCurveTo(0, -bw * 0.55, len * 0.48, -bw * 0.14);
            ctx.quadraticCurveTo(0, bw * 0.42, -len * 0.42, -bw * 0.05);
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();

    } else 
    if (eff.type === 'kasiyasRushBodySlash') {
        const slashW = Math.max(76, eff.w || 150);
        const slashD = Math.max(34, eff.d || 64);
        const angle = (eff.pathAngle !== undefined && eff.pathAngle !== null) ? eff.pathAngle : ((eff.dir || 1) >= 0 ? 0 : Math.PI);
        const isClone = !!eff.isClone;
        const isBasicRush = !!eff.basicRushIssen;
        const isP3Rush = !!eff.p3RushBody || String(eff.renderType || '').toUpperCase().indexOf('EFT_KASIYAS_P3_') >= 0;
        const pulse = 1 - alpha;

        ctx.save();
        ctx.rotate(angle);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const core = eff.color || (isClone ? `rgba(210,36,54,${0.78 * alpha})` : `rgba(255,44,40,${0.92 * alpha})`);
        const accent = eff.accentColor || `rgba(18,0,0,${0.90 * alpha})`;
        const hot = eff.hotColor || `rgba(255,210,86,${0.70 * alpha})`;

        // 몸체를 덮는 돌진 검기: 실제 Hitbox X/Y 투영 범위에 맞춰 몸 주변에 붙어 보이게 한다.
        // 경로 전체에 긴 검기를 깔지 않고, 현재 이동 중인 카시야스/분신의 신체 주변에만 표시한다.
        const shellW = slashW * (isBasicRush ? 0.94 : 1.04);
        const shellH = Math.max(slashD * (isBasicRush ? 1.18 : 1.32), 54);
        const shellShift = shellW * (isBasicRush ? 0.05 : 0.08);

        ctx.shadowBlur = isClone ? 13 : 18;
        ctx.shadowColor = isP3Rush ? 'rgba(122,58,255,0.72)' : (isClone ? 'rgba(190,0,42,0.58)' : 'rgba(225,0,0,0.72)');

        const shellGrad = ctx.createRadialGradient(shellShift, 0, shellH * 0.12, shellShift, 0, Math.max(shellW * 0.58, shellH * 0.95));
        shellGrad.addColorStop(0, hot);
        shellGrad.addColorStop(0.38, core);
        shellGrad.addColorStop(0.72, accent);
        shellGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shellGrad;

        ctx.beginPath();
        ctx.moveTo(-shellW * 0.38, -shellH * 0.42);
        ctx.bezierCurveTo(shellW * 0.04, -shellH * (0.78 + pulse * 0.08), shellW * 0.55, -shellH * 0.46, shellW * 0.50, -shellH * 0.02);
        ctx.bezierCurveTo(shellW * 0.57, shellH * 0.42, shellW * 0.05, shellH * (0.78 + pulse * 0.08), -shellW * 0.42, shellH * 0.42);
        ctx.bezierCurveTo(-shellW * 0.18, shellH * 0.20, -shellW * 0.10, -shellH * 0.18, -shellW * 0.38, -shellH * 0.42);
        ctx.closePath();
        ctx.fill();

        // 검은 절단선은 몸을 감싼 궤적 안쪽에 짧게 남긴다.
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(10,0,0,${(isClone ? 0.58 : 0.82) * alpha})`;
        ctx.lineWidth = Math.max(3.0, shellH * 0.075);
        ctx.beginPath();
        ctx.moveTo(-shellW * 0.34, shellH * 0.10);
        ctx.bezierCurveTo(-shellW * 0.04, -shellH * 0.22, shellW * 0.28, -shellH * 0.30, shellW * 0.46, -shellH * 0.04);
        ctx.stroke();

        ctx.strokeStyle = hot;
        ctx.lineWidth = Math.max(1.7, shellH * 0.038);
        ctx.beginPath();
        ctx.moveTo(-shellW * 0.26, -shellH * 0.16);
        ctx.bezierCurveTo(shellW * 0.00, -shellH * 0.40, shellW * 0.30, -shellH * 0.36, shellW * 0.42, -shellH * 0.10);
        ctx.stroke();

        // 몸에 붙는 짧은 속도선. 실제 히트박스보다 과하게 길어 보이지 않도록 후방에 짧게 제한한다.
        ctx.strokeStyle = isP3Rush ? `rgba(156,92,255,${0.36 * alpha})` : (isClone ? `rgba(160,0,45,${0.32 * alpha})` : `rgba(255,34,30,${0.36 * alpha})`);
        ctx.lineWidth = Math.max(1.2, shellH * 0.030);
        for (let i = 0; i < 4; i++) {
            const y = (i - 1.5) * shellH * 0.19;
            ctx.beginPath();
            ctx.moveTo(-shellW * (0.58 + i * 0.035), y + shellH * 0.04);
            ctx.lineTo(-shellW * (0.18 + i * 0.025), y - shellH * 0.05);
            ctx.stroke();
        }
        ctx.restore();

    } else if (eff.type === 'rushIssen') {
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
        // delay 구간에는 이미 생성된 전체 궤적을 파란 잔류 검격으로 유지한다.
        // 실제 hit/active 구간에 들어갔을 때만 붉게 맥동하며 피해 판정이 켜진 것을 보여준다.
        const visibleProgress = isCharge || isActive
            ? 1
            : Math.max(0, Math.min(1, warningDur > 0 ? elapsed / warningDur : 1));
        const leadingFadeWidth = 0.14;
        const hitboxHalfD = pathD * 0.5;
        const visibleStartX = -pathW * 0.5;
        const visibleEndX = visibleStartX + pathW * visibleProgress;
        const visibleW = Math.max(0, visibleEndX - visibleStartX);

        ctx.globalAlpha = Math.max(0, Math.min(1, (0.62 + alpha * 0.38)));
        ctx.rotate(renderAngle);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const dormantEdge = 'rgba(10,28,46,0.78)';
        const dormantCore = 'rgba(210,244,255,0.88)';
        const dormantHot = 'rgba(105,205,255,0.72)';
        const chargeEdge = `rgba(8,34,58,${0.74 + chargeT * 0.08})`;
        const chargeCore = `rgba(218,248,255,${0.78 + chargeT * 0.08})`;
        const chargeHot = `rgba(112,218,255,${0.62 + chargeT * 0.08})`;
        const activeEdge = 'rgba(8,0,0,0.98)';
        const activeCore = `rgba(255,24,22,${0.90 + pulse * 0.08})`;
        const activeHot = `rgba(255,104,78,${0.72 + pulse * 0.18})`;

        const edgeColor = isActive ? activeEdge : (isCharge ? chargeEdge : dormantEdge);
        const coreColor = isActive ? activeCore : (isCharge ? chargeCore : dormantCore);
        const hotColor = isActive ? activeHot : (isCharge ? chargeHot : dormantHot);
        const glowColor = isActive
            ? 'rgba(230,0,0,0.78)'
            : (isCharge ? 'rgba(104,210,255,0.40)' : 'rgba(90,190,255,0.32)');

        ctx.shadowBlur = isActive ? 20 : (isCharge ? 9 : 8);
        ctx.shadowColor = glowColor;

        // 데이터의 Hitbox_Size_Y 값(pathD)을 실제 화면 폭 안내에도 사용한다.
        // 돌진 중에는 지나간 구간까지만, 충전/활성 구간에서는 전체 경로의 판정 폭을 보여준다.
        if (visibleW > 1) {
            const bandAlpha = isActive
                ? (0.13 + pulse * 0.05)
                : (isCharge ? 0.055 : 0.035);
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, bandAlpha * alpha));
            ctx.shadowBlur = isActive ? 18 : (isCharge ? 6 : 4);
            ctx.shadowColor = glowColor;
            const bandGrad = ctx.createLinearGradient(0, -hitboxHalfD, 0, hitboxHalfD);
            if (isActive) {
                bandGrad.addColorStop(0, 'rgba(255,34,28,0)');
                bandGrad.addColorStop(0.18, 'rgba(255,34,28,0.70)');
                bandGrad.addColorStop(0.50, 'rgba(255,64,44,0.92)');
                bandGrad.addColorStop(0.82, 'rgba(255,34,28,0.70)');
                bandGrad.addColorStop(1, 'rgba(255,34,28,0)');
            } else if (isCharge) {
                bandGrad.addColorStop(0, 'rgba(80,190,255,0)');
                bandGrad.addColorStop(0.22, 'rgba(80,190,255,0.44)');
                bandGrad.addColorStop(0.50, 'rgba(210,244,255,0.64)');
                bandGrad.addColorStop(0.78, 'rgba(80,190,255,0.44)');
                bandGrad.addColorStop(1, 'rgba(80,190,255,0)');
            } else {
                bandGrad.addColorStop(0, 'rgba(80,190,255,0)');
                bandGrad.addColorStop(0.20, 'rgba(80,190,255,0.45)');
                bandGrad.addColorStop(0.50, 'rgba(210,244,255,0.62)');
                bandGrad.addColorStop(0.80, 'rgba(80,190,255,0.45)');
                bandGrad.addColorStop(1, 'rgba(80,190,255,0)');
            }
            ctx.fillStyle = bandGrad;
            ctx.fillRect(visibleStartX, -hitboxHalfD, visibleW, pathD);
            ctx.restore();

            // 판정 폭의 양쪽 끝을 얇은 레일로 표시한다. 실제 path hitbox 폭이 바뀌면 이 선도 같이 바뀐다.
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, (isActive ? 0.72 : (isCharge ? 0.34 : 0.24)) * alpha));
            ctx.shadowBlur = isActive ? 16 : (isCharge ? 6 : 5);
            ctx.shadowColor = glowColor;
            ctx.strokeStyle = isActive
                ? 'rgba(255,44,34,0.88)'
                : (isCharge ? 'rgba(142,226,255,0.62)' : 'rgba(124,220,255,0.58)');
            ctx.lineWidth = Math.max(1.8, pathD * (isActive ? 0.020 : 0.014));
            if (!isActive && !isCharge) ctx.setLineDash([Math.max(12, pathD * 0.18), Math.max(8, pathD * 0.11)]);
            for (const railY of [-hitboxHalfD, hitboxHalfD]) {
                ctx.beginPath();
                ctx.moveTo(visibleStartX, railY);
                ctx.lineTo(visibleStartX + visibleW, railY);
                ctx.stroke();
            }
            ctx.setLineDash([]);
            ctx.restore();
        }

        // 천귀살 잔류 검격은 돌진 중/딜레이 중에는 흰색/푸른색의 칼날 조각으로 남고,
        // 실제 피해 판정이 켜지는 active 구간에만 같은 조각이 붉게 맥동하며 활성화된다.
        // 별도의 큰 폭발선을 추가하지 않아, 생성 단계가 실제 피해 판정처럼 보이지 않도록 한다.
        for (let i = 0; i < count; i++) {
            const t = (i + 0.35) / count;
            if (t > visibleProgress + 0.012) continue;

            const noise = Math.sin((i + 1) * 12.9898 + seed * 0.017) * 43758.5453;
            const n = noise - Math.floor(noise);
            const noise2 = Math.sin((i + 5) * 78.233 + seed * 0.031) * 17341.9281;
            const n2 = noise2 - Math.floor(noise2);
            const side = (n * 2 - 1) * pathD * 0.47;
            const localX = -pathW / 2 + pathW * t;
            const localY = side;
            const trailAge = isCharge || isActive
                ? 1
                : Math.max(0, Math.min(1, (visibleProgress - t + leadingFadeWidth) / leadingFadeWidth));
            const bladeW = Math.max(46, pathD * (0.62 + (i % 4) * 0.085));
            const bladeH = Math.max(13, fieldH * (0.078 + (i % 3) * 0.014));
            const bladeRot = ((i % 2 === 0) ? -0.36 : 0.36) + (n2 - 0.5) * 0.38;
            const scalePulse = isActive ? (1.04 + pulse * 0.10) : 1;

            ctx.save();
            ctx.translate(localX, localY);
            ctx.rotate(bladeRot);
            ctx.scale(scalePulse, scalePulse);

            const bladeAlpha = isActive ? (0.92 + pulse * 0.08) : (isCharge ? 0.62 : 0.40 + trailAge * 0.24);
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

            ctx.strokeStyle = isActive ? 'rgba(30,0,0,0.92)' : (isCharge ? 'rgba(8,38,62,0.60)' : 'rgba(5,26,44,0.52)');
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

            // 가드 불가 잔류 검격의 활성 폭을 한 번 더 강조한다.
            // pathD 기반으로 상/하단까지 붉은 사선이 닿아, 실제 데이터 판정 폭을 더 직관적으로 보여준다.
            ctx.globalAlpha = Math.max(0, Math.min(1, (0.28 + (1 - activeT) * 0.22 + pulse * 0.08) * alpha));
            ctx.shadowBlur = 18;
            ctx.shadowColor = 'rgba(255,0,0,0.62)';
            ctx.strokeStyle = 'rgba(255,58,44,0.62)';
            ctx.lineWidth = Math.max(2.4, pathD * 0.022);
            for (let i = 0; i < 3; i++) {
                const x0 = -pathW * 0.40 + i * pathW * 0.31;
                const x1 = x0 + pathW * 0.20;
                const y0 = (i % 2 === 0 ? -1 : 1) * hitboxHalfD * 0.82;
                const y1 = -y0;
                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(x1, y1);
                ctx.stroke();
            }
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

    } else if (eff.type === 'kasiyasFinalSlash') {
        const slashW = Math.max(1900, (eff.w || 2100) * 1.04);
        const slashD = Math.max(620, (eff.d || 700) * 1.08);
        const slashH = Math.max(470, (eff.h || 500) * 1.04);
        const dir = eff.dir === -1 ? -1 : 1;
        const t = 1 - alpha;
        const span = slashW * 1.18;
        const band = Math.max(slashD, slashH);
        const deepRed = eff.color || `rgba(126,0,0,${0.96 * alpha})`;
        const black = eff.accentColor || `rgba(5,0,0,${0.98 * alpha})`;
        const darkRed = `rgba(88,0,0,${0.90 * alpha})`;
        const hotRed = `rgba(196,14,18,${0.82 * alpha})`;
        const yellow = `rgba(255,190,36,${0.58 * alpha})`;
        const purple = `rgba(112,32,176,${0.42 * alpha})`;
        const violet = `rgba(70,22,126,${0.34 * alpha})`;

        ctx.save();

        // 화면 절단 연출이 잘 보이도록 순간적으로 배경을 살짝 눌러준다.
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(0,0,0,${0.18 * alpha})`;
        ctx.fillRect(-slashW, -band * 1.35, slashW * 2.0, band * 2.7);

        ctx.scale(dir, 1);
        // 오른쪽을 바라볼 때 좌상단→우하단, 왼쪽을 바라볼 때 반대 방향으로 보이도록 scale과 함께 사용한다.
        ctx.rotate(0.76 - t * 0.035);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 공격 범위 전체를 읽을 수 있게 하는 어두운 대각선 압력장.
        const rangeGrad = ctx.createLinearGradient(0, -band * 0.72, 0, band * 0.72);
        rangeGrad.addColorStop(0.00, 'rgba(0,0,0,0)');
        rangeGrad.addColorStop(0.18, `rgba(30,0,52,${0.16 * alpha})`);
        rangeGrad.addColorStop(0.35, `rgba(72,0,0,${0.24 * alpha})`);
        rangeGrad.addColorStop(0.50, `rgba(15,0,0,${0.34 * alpha})`);
        rangeGrad.addColorStop(0.65, `rgba(92,0,0,${0.23 * alpha})`);
        rangeGrad.addColorStop(0.82, `rgba(32,0,58,${0.15 * alpha})`);
        rangeGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = rangeGrad;
        ctx.beginPath();
        ctx.moveTo(-span * 0.54, -band * 0.64);
        ctx.lineTo(span * 0.54, -band * 0.42);
        ctx.lineTo(span * 0.54, band * 0.64);
        ctx.lineTo(-span * 0.54, band * 0.42);
        ctx.closePath();
        ctx.fill();

        // 첨부 이미지처럼 여러 개의 대각선 속도선이 화면을 통과하도록 배치한다.
        ctx.shadowBlur = 20;
        for (let i = 0; i < 18; i++) {
            const r = i / 17;
            const y = -band * 0.62 + r * band * 1.24;
            const jitter = Math.sin(i * 1.91 + t * 5.2) * band * 0.025;
            const lw = Math.max(5, band * (0.010 + (i % 5) * 0.0025));
            if (i % 5 === 0) {
                ctx.strokeStyle = `rgba(255,190,58,${0.25 * alpha})`;
                ctx.shadowColor = 'rgba(255,178,40,0.56)';
            } else if (i % 3 === 0) {
                ctx.strokeStyle = `rgba(110,38,210,${0.30 * alpha})`;
                ctx.shadowColor = 'rgba(110,38,210,0.55)';
            } else {
                ctx.strokeStyle = `rgba(42,0,62,${0.36 * alpha})`;
                ctx.shadowColor = 'rgba(0,0,0,0.68)';
            }
            ctx.lineWidth = lw;
            ctx.beginPath();
            ctx.moveTo(-span * 0.56, y + jitter);
            ctx.lineTo(span * 0.56, y - jitter * 0.4);
            ctx.stroke();
        }

        // 메인 참격 외곽. 검은색과 짙은 붉은색이 굵은 한 줄로 화면을 절단하는 느낌을 준다.
        ctx.shadowBlur = 48;
        ctx.shadowColor = 'rgba(0,0,0,0.98)';
        ctx.strokeStyle = black;
        ctx.lineWidth = Math.max(96, band * 0.185);
        ctx.beginPath();
        ctx.moveTo(-span * 0.55, 0);
        ctx.lineTo(span * 0.55, 0);
        ctx.stroke();

        ctx.shadowBlur = 42;
        ctx.shadowColor = 'rgba(120,0,0,0.95)';
        ctx.strokeStyle = darkRed;
        ctx.lineWidth = Math.max(64, band * 0.128);
        ctx.beginPath();
        ctx.moveTo(-span * 0.54, 0);
        ctx.lineTo(span * 0.54, 0);
        ctx.stroke();

        // 메인 칼날 면. 밝은 흰색 대신 검붉은 면, 노란 압축선, 보라 잔광을 섞는다.
        const bladeGrad = ctx.createLinearGradient(0, -band * 0.18, 0, band * 0.18);
        bladeGrad.addColorStop(0.00, 'rgba(0,0,0,0)');
        bladeGrad.addColorStop(0.12, `rgba(0,0,0,${0.85 * alpha})`);
        bladeGrad.addColorStop(0.28, violet);
        bladeGrad.addColorStop(0.40, deepRed);
        bladeGrad.addColorStop(0.50, yellow);
        bladeGrad.addColorStop(0.58, hotRed);
        bladeGrad.addColorStop(0.72, black);
        bladeGrad.addColorStop(0.90, `rgba(70,0,0,${0.52 * alpha})`);
        bladeGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = bladeGrad;
        ctx.shadowBlur = 34;
        ctx.shadowColor = 'rgba(150,0,0,0.86)';
        ctx.beginPath();
        ctx.moveTo(-span * 0.53, -band * 0.155);
        ctx.lineTo(span * 0.53, -band * 0.095);
        ctx.lineTo(span * 0.55, band * 0.155);
        ctx.lineTo(-span * 0.55, band * 0.095);
        ctx.closePath();
        ctx.fill();

        // 중심부의 예리한 절단선.
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255,192,34,0.72)';
        ctx.strokeStyle = yellow;
        ctx.lineWidth = Math.max(7, band * 0.014);
        ctx.beginPath();
        ctx.moveTo(-span * 0.50, -band * 0.012);
        ctx.lineTo(span * 0.50, -band * 0.012);
        ctx.stroke();

        ctx.shadowBlur = 14;
        ctx.shadowColor = 'rgba(164,36,250,0.62)';
        ctx.strokeStyle = purple;
        ctx.lineWidth = Math.max(12, band * 0.024);
        ctx.beginPath();
        ctx.moveTo(-span * 0.49, band * 0.055);
        ctx.lineTo(span * 0.49, band * 0.035);
        ctx.stroke();

        // 메인 참격 주변의 보조 참격선. 한 줄보다 여러 선이 겹친 고속 절단처럼 보이게 한다.
        const subLines = [
            { y: -0.34, w: 0.030, c: `rgba(12,0,0,${0.78 * alpha})`, b: 22 },
            { y: -0.25, w: 0.016, c: `rgba(122,0,0,${0.48 * alpha})`, b: 18 },
            { y: -0.17, w: 0.010, c: `rgba(255,168,44,${0.28 * alpha})`, b: 12 },
            { y: 0.22, w: 0.020, c: `rgba(84,20,152,${0.44 * alpha})`, b: 16 },
            { y: 0.36, w: 0.026, c: `rgba(20,0,0,${0.66 * alpha})`, b: 18 }
        ];
        for (const line of subLines) {
            ctx.shadowBlur = line.b;
            ctx.shadowColor = line.c;
            ctx.strokeStyle = line.c;
            ctx.lineWidth = Math.max(5, band * line.w);
            ctx.beginPath();
            ctx.moveTo(-span * 0.52, band * line.y);
            ctx.lineTo(span * 0.52, band * (line.y - 0.02));
            ctx.stroke();
        }

        // 충돌 지점의 짧은 파편. 너무 밝아지지 않게 일부 노란 포인트만 사용한다.
        ctx.shadowBlur = 10;
        for (let i = 0; i < 28; i++) {
            const r = i / 27;
            const px = -span * 0.46 + r * span * 0.92;
            const py = Math.sin(i * 1.37 + t * 6.4) * band * 0.18;
            const len = 18 + (i % 6) * 9;
            if (i % 6 === 0) {
                ctx.strokeStyle = `rgba(255,188,42,${0.48 * alpha})`;
                ctx.lineWidth = 1.7;
            } else if (i % 4 === 0) {
                ctx.strokeStyle = `rgba(118,34,190,${0.32 * alpha})`;
                ctx.lineWidth = 2.0;
            } else {
                ctx.strokeStyle = `rgba(82,0,0,${0.40 * alpha})`;
                ctx.lineWidth = 2.4;
            }
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + len, py + (i % 2 === 0 ? -len * 0.08 : len * 0.08));
            ctx.stroke();
        }

        ctx.restore();

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


    } else if (eff.type === 'kasiyasP3HeavySlash') {
        const mode = String(eff.slashMode || 'HORIZONTAL').toUpperCase();
        const slashW = Math.max(160, eff.w || 520);
        const slashD = Math.max(70, eff.d || 180);
        const slashH = Math.max(80, eff.h || 180);
        const dir = eff.dir === -1 ? -1 : 1;
        const core = eff.color || `rgba(255,64,48,${0.96 * alpha})`;
        const accent = eff.accentColor || `rgba(184,84,255,${0.88 * alpha})`;
        const dark = eff.darkColor || `rgba(18,0,28,${0.92 * alpha})`;
        const hot = `rgba(255,234,210,${0.82 * alpha})`;
        const halfW = slashW * 0.50;
        const halfH = slashH * 0.50;
        const halfD = slashD * 0.50;

        ctx.save();
        ctx.scale(dir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = mode === 'DIAGONAL' ? 26 : 22;
        ctx.shadowColor = 'rgba(190,70,255,0.70)';

        const strokeCurve = (points, lineW, stroke, blur, alphaMul = 1) => {
            ctx.save();
            ctx.globalAlpha *= alphaMul;
            ctx.shadowBlur = blur;
            ctx.strokeStyle = stroke;
            ctx.lineWidth = lineW;
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            if (points.length === 3) ctx.quadraticCurveTo(points[1][0], points[1][1], points[2][0], points[2][1]);
            else if (points.length === 4) ctx.bezierCurveTo(points[1][0], points[1][1], points[2][0], points[2][1], points[3][0], points[3][1]);
            else for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
            ctx.stroke();
            ctx.restore();
        };

        const strokeLine = (p0, p1, lineW, stroke, blur, alphaMul = 1, off = 0) => {
            const dx = p1[0] - p0[0];
            const dy = p1[1] - p0[1];
            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const nx = -dy / len;
            const ny = dx / len;
            strokeCurve([[p0[0] + nx * off, p0[1] + ny * off], [p1[0] + nx * off, p1[1] + ny * off]], lineW, stroke, blur, alphaMul);
        };

        if (mode === 'HORIZONTAL') {
            // 횡베기: 상하반전 기준을 고정한다. 원형 히트박스의 외곽 90% 이상을 채우는 C자 검호.
            const rx = Math.max(halfW * 1.00, 150);
            const ry = Math.max(halfH * 1.00, halfD * 0.86, 78);
            ctx.save();
            ctx.scale(1, -1);
            const rangeGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, Math.max(rx, ry) * 1.04);
            rangeGrad.addColorStop(0, 'rgba(255,240,255,0.018)');
            rangeGrad.addColorStop(0.54, 'rgba(184,64,255,0.048)');
            rangeGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = rangeGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
            const drawArc = (rMul, yMul, lineW, stroke, from, to, blur, alphaMul = 1) => {
                ctx.save();
                ctx.globalAlpha *= alphaMul;
                ctx.shadowBlur = blur;
                ctx.strokeStyle = stroke;
                ctx.lineWidth = lineW;
                ctx.beginPath();
                ctx.ellipse(0, ry * yMul, rx * rMul, ry * 0.94, -0.025, from, to);
                ctx.stroke();
                ctx.restore();
            };
            drawArc(1.03, 0.03, Math.max(15, ry * 0.24), dark, -Math.PI * 0.98, Math.PI * 0.28, 24, 0.88);
            drawArc(1.00, 0.03, Math.max(9, ry * 0.145), core, -Math.PI * 0.93, Math.PI * 0.23, 20, 1.00);
            drawArc(0.86, -0.02, Math.max(3.0, ry * 0.045), hot, -Math.PI * 0.70, -Math.PI * 0.02, 10, 0.92);
            drawArc(1.07, 0.12, Math.max(3.2, ry * 0.050), accent, -Math.PI * 1.00, Math.PI * 0.32, 13, 0.48);
            ctx.restore();
        } else if (mode === 'AIR_DOWN') {
            // 공중 내려베기: 지면을 향해 수직으로 내리꽂히는 짧고 강한 절단 충격.
            const p0 = [0, -halfH * 1.10];
            const p1 = [0, halfH * 1.10];
            const rg = ctx.createRadialGradient(0, halfH * 0.15, 6, 0, halfH * 0.15, Math.max(halfW, halfH) * 0.95);
            rg.addColorStop(0.00, `rgba(255,245,255,${0.18 * alpha})`);
            rg.addColorStop(0.28, `rgba(220,64,255,${0.11 * alpha})`);
            rg.addColorStop(0.68, `rgba(32,0,48,${0.08 * alpha})`);
            rg.addColorStop(1.00, 'rgba(0,0,0,0)');
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.ellipse(0, halfH * 0.08, Math.max(halfW * 0.48, 46), Math.max(halfH * 0.88, 90), 0, 0, Math.PI * 2);
            ctx.fill();
            strokeLine(p0, p1, Math.max(24, Math.min(slashW, slashH) * 0.14), dark, 30, 0.96, 0);
            strokeLine(p0, p1, Math.max(13, Math.min(slashW, slashH) * 0.078), core, 22, 1.00, 0);
            strokeLine([p0[0], p0[1] + halfH * 0.12], [p1[0], p1[1] - halfH * 0.04], Math.max(3.5, Math.min(slashW, slashH) * 0.022), hot, 12, 0.95, 0);
            for (let i = -2; i <= 2; i++) {
                const ox = i * halfW * 0.16;
                strokeLine([ox, -halfH * 0.48], [ox * 0.35, halfH * 0.76], Math.max(2.2, halfW * 0.018), accent, 10, 0.32, 0);
            }
        } else if (mode === 'DOWN') {
            // 내려베기: 박스 히트박스의 대각선 끝과 끝까지 닿는 넓은 세로 호형 절단면.
            const topL = [-halfW * 0.99, -halfH * 0.98];
            const botR = [ halfW * 0.99,  halfH * 0.98];
            const topR = [ halfW * 0.93, -halfH * 0.88];
            const botL = [-halfW * 0.93,  halfH * 0.88];
            const bg = ctx.createRadialGradient(0, 0, 8, 0, 0, Math.max(halfW, halfH) * 1.16);
            bg.addColorStop(0, 'rgba(255,240,255,0.024)');
            bg.addColorStop(0.55, 'rgba(184,64,255,0.050)');
            bg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.ellipse(0, 0, halfW * 1.00, halfH * 1.00, 0, 0, Math.PI * 2);
            ctx.fill();
            // 두 대각선 축을 모두 암시해 X폭이 비어 보이지 않게 한다.
            strokeCurve([topL, [halfW * 0.24, -halfH * 0.20], botR], Math.max(18, Math.min(slashW, slashH) * 0.105), dark, 26, 0.92);
            strokeCurve([topL, [halfW * 0.24, -halfH * 0.20], botR], Math.max(10, Math.min(slashW, slashH) * 0.065), core, 20, 1.00);
            strokeCurve([topR, [halfW * 0.02, -halfH * 0.04], botL], Math.max(6, Math.min(slashW, slashH) * 0.036), accent, 14, 0.45);
            strokeCurve([[topL[0] + halfW*0.06, topL[1]+halfH*0.04], [halfW * 0.18, -halfH * 0.18], [botR[0]-halfW*0.06, botR[1]-halfH*0.04]], Math.max(3, Math.min(slashW, slashH) * 0.018), hot, 10, 0.92);
        } else {
            // 대각선 베기: 박스 대각선 끝점을 직접 잇는다. 이전과 반대 방향 축으로 고정.
            const p0 = [-halfW * 0.99, -halfH * 0.98];
            const p1 = [ halfW * 0.99,  halfH * 0.98];
            const glow = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
            glow.addColorStop(0.00, 'rgba(0,0,0,0)');
            glow.addColorStop(0.18, 'rgba(184,64,255,0.060)');
            glow.addColorStop(0.50, 'rgba(255,64,48,0.078)');
            glow.addColorStop(0.82, 'rgba(184,64,255,0.060)');
            glow.addColorStop(1.00, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.ellipse(0, 0, halfW * 1.00, halfH * 1.00, -0.54, 0, Math.PI * 2);
            ctx.fill();
            strokeLine(p0, p1, Math.max(20, Math.min(slashW, slashH) * 0.115), dark, 28, 0.95, 0);
            strokeLine(p0, p1, Math.max(11, Math.min(slashW, slashH) * 0.070), core, 20, 1.00, 0);
            strokeLine(p0, p1, Math.max(3.2, Math.min(slashW, slashH) * 0.020), hot, 10, 0.94, -halfW * 0.018);
            strokeLine(p0, p1, Math.max(3.6, Math.min(slashW, slashH) * 0.026), accent, 12, 0.44, halfW * 0.040);
        }

        // 짧은 잔광 조각은 히트박스 내부에만 배치한다.
        ctx.shadowBlur = 8;
        const shardCount = mode === 'HORIZONTAL' ? 8 : 6;
        for (let i = 0; i < shardCount; i++) {
            const a = (i / shardCount) * Math.PI * 1.45 + 0.32;
            const sx = Math.cos(a) * halfW * 0.42;
            const sy = Math.sin(a) * halfH * 0.36;
            ctx.strokeStyle = i % 2 ? accent : core;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(a + 0.3) * 16, sy + Math.sin(a + 0.3) * 9);
            ctx.stroke();
        }
        ctx.restore();
    } else if (eff.type === 'kasiyasP3SwordWaveCastSlash') {
        // 3페이즈 거대 검기 사출 전 내려베기 자체의 검호.
        // 발사체 반달 검기는 OBJ_P3_GIANT_SWORD_WAVE가 담당하므로,
        // 여기서는 카시야스 본체 근처에 붙어 내려오는 검 궤적만 보여준다.
        const slashW = Math.max(260, eff.w || 420);
        const slashH = Math.max(360, eff.h || 500);
        const dir = eff.dir === -1 ? -1 : 1;
        const t = 1 - alpha;
        const core = eff.color || `rgba(152,76,255,${0.96 * alpha})`;
        const dark = eff.darkColor || `rgba(0,0,0,${0.96 * alpha})`;
        const hot = eff.hotColor || `rgba(230,214,255,${0.82 * alpha})`;
        const halfW = slashW * 0.50;
        const halfH = slashH * 0.50;

        ctx.save();
        ctx.scale(dir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 내려베기 충격 압력장: 좌우로 날아가는 검기처럼 보이지 않도록 세로형으로 압축한다.
        const pressure = ctx.createRadialGradient(halfW * 0.08, -halfH * 0.04, 8, halfW * 0.10, 0, Math.max(halfH * 0.92, 180));
        pressure.addColorStop(0.00, `rgba(232,214,255,${0.07 * alpha})`);
        pressure.addColorStop(0.36, `rgba(136,58,255,${0.10 * alpha})`);
        pressure.addColorStop(0.74, `rgba(12,0,36,${0.17 * alpha})`);
        pressure.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = pressure;
        ctx.beginPath();
        ctx.ellipse(halfW * 0.08, 0, halfW * 0.42, halfH * 0.92, 0.12, 0, Math.PI * 2);
        ctx.fill();

        const slashPath = [
            [-halfW * 0.08, -halfH * (0.86 - 0.06 * t)],
            [ halfW * (0.30 + 0.04 * t), -halfH * 0.38],
            [ halfW * 0.28,  halfH * (0.76 - 0.05 * t)]
        ];
        const drawDownSlash = (pts, lineW, stroke, blur, aMul, xOff = 0, yOff = 0) => {
            ctx.save();
            ctx.globalAlpha *= aMul;
            ctx.shadowBlur = blur;
            ctx.shadowColor = stroke;
            ctx.strokeStyle = stroke;
            ctx.lineWidth = lineW;
            ctx.beginPath();
            ctx.moveTo(pts[0][0] + xOff, pts[0][1] + yOff);
            ctx.bezierCurveTo(
                pts[1][0] + xOff, pts[1][1] + yOff,
                pts[1][0] + halfW * 0.20 + xOff, pts[1][1] + halfH * 0.24 + yOff,
                pts[2][0] + xOff, pts[2][1] + yOff
            );
            ctx.stroke();
            ctx.restore();
        };

        // 검은 외곽 → 검붉은 검호 → 밝은 칼날 심 순서로, 검을 휘두른 흔적처럼 겹친다.
        drawDownSlash(slashPath, Math.max(18, slashW * 0.060), dark, 26, 0.94);
        drawDownSlash(slashPath, Math.max(11, slashW * 0.036), core, 18, 1.00);
        drawDownSlash(slashPath, Math.max(3, slashW * 0.012), hot, 9, 0.90, halfW * 0.02, -halfH * 0.018);

        // 본체 검에 따라붙는 짧은 잔광. 전방으로 길게 뻗는 선은 제거한다.
        const trailCount = 3;
        for (let i = 0; i < trailCount; i++) {
            const trailAlpha = (0.34 - i * 0.08) * alpha;
            const off = -halfW * (0.06 + i * 0.055);
            drawDownSlash(slashPath, Math.max(3.5, slashW * (0.014 - i * 0.002)), `rgba(158,82,255,${trailAlpha})`, 8, 0.80, off, halfH * (0.018 + i * 0.02));
        }

        // 내려찍는 순간의 하단 충격광.
        const impactGrad = ctx.createRadialGradient(halfW * 0.30, halfH * 0.74, 4, halfW * 0.30, halfH * 0.74, Math.max(42, halfW * 0.30));
        impactGrad.addColorStop(0, `rgba(232,218,255,${0.36 * alpha})`);
        impactGrad.addColorStop(0.42, `rgba(150,74,255,${0.20 * alpha})`);
        impactGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = impactGrad;
        ctx.beginPath();
        ctx.ellipse(halfW * 0.30, halfH * 0.74, halfW * 0.26, halfH * 0.055, -0.04, 0, Math.PI * 2);
        ctx.fill();
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

    } else if (eff.type === 'kasiyasP2M1SwordEnergyAura') {
        const pulse = 1 - alpha;
        const dir = eff.dir === -1 ? -1 : 1;
        const auraW = Math.max(220, eff.w || 280);
        const auraH = Math.max(190, eff.h || 230);
        const time = Date.now() / 130;
        ctx.save();
        ctx.scale(dir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const applyAlpha = (rgba, mul) => rgba.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/, (m,r,g,b,a)=>`rgba(${r},${g},${b},${parseFloat(a)*mul})`);
        const drawSwordFlame = (x0, y0, x1, y1, core, edge, hot, seed) => {
            ctx.save();
            ctx.shadowBlur = 18;
            ctx.shadowColor = edge;
            ctx.strokeStyle = applyAlpha(edge, 0.86 * alpha);
            ctx.lineWidth = Math.max(12, auraH * 0.060);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
            ctx.strokeStyle = applyAlpha(core, 0.95 * alpha);
            ctx.lineWidth = Math.max(6, auraH * 0.034);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
            ctx.strokeStyle = applyAlpha(hot, 0.80 * alpha);
            ctx.lineWidth = Math.max(2.2, auraH * 0.012);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();

            for (let i = 0; i < 7; i++) {
                const t = (i + 0.15) / 7;
                const bx = x0 + (x1 - x0) * t;
                const by = y0 + (y1 - y0) * t;
                const wave = Math.sin(time + i * 1.7 + seed) * auraW * 0.018;
                const up = Math.sin(time * 1.3 + i + seed) * auraH * 0.020 - auraH * (0.050 + (i % 3) * 0.014);
                ctx.strokeStyle = i % 2 === 0 ? applyAlpha(core, 0.60 * alpha) : applyAlpha(edge, 0.52 * alpha);
                ctx.lineWidth = i % 2 === 0 ? 2.8 : 2.1;
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.bezierCurveTo(bx + wave, by + up * 0.35, bx - wave * 0.5, by + up * 0.70, bx + wave * 0.35, by + up);
                ctx.stroke();
            }
            ctx.restore();
        };

        drawSwordFlame(-auraW * 0.42, auraH * 0.20, -auraW * 0.18, -auraH * 0.56, 'rgba(255,54,36,0.96)', 'rgba(52,0,0,0.96)', 'rgba(255,224,188,0.78)', 0.2);
        drawSwordFlame(auraW * 0.42, auraH * 0.20, auraW * 0.18, -auraH * 0.56, 'rgba(255,216,52,0.96)', 'rgba(118,58,0,0.94)', 'rgba(255,250,206,0.80)', 2.3);

        ctx.restore();

    } else if (eff.type === 'kasiyasP2ChargeEnergy') {
        const pulse = 1 - alpha;
        const auraW = Math.max(150, eff.w || 180);
        const auraH = Math.max(150, eff.h || 180);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const grad = ctx.createRadialGradient(0, 0, 6, 0, 0, Math.max(auraW, auraH) * 0.62);
        grad.addColorStop(0, `rgba(255,92,62,${0.20 * alpha})`);
        grad.addColorStop(0.38, `rgba(178,0,0,${0.20 * alpha})`);
        grad.addColorStop(0.72, `rgba(28,0,0,${0.18 * alpha})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, auraW * (0.40 + pulse * 0.08), auraH * (0.46 + pulse * 0.08), 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(255,40,30,0.58)';
        for (let i = 0; i < 10; i++) {
            const r = i / 9;
            const x = -auraW * 0.42 + auraW * 0.84 * r + Math.sin(Date.now() / 130 + i) * auraW * 0.035;
            const y0 = auraH * (0.36 - (i % 3) * 0.05);
            const y1 = -auraH * (0.20 + (i % 4) * 0.08);
            ctx.strokeStyle = i % 3 === 0 ? `rgba(255,70,46,${0.30 * alpha})` : `rgba(112,0,0,${0.28 * alpha})`;
            ctx.lineWidth = i % 3 === 0 ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(x, y0);
            ctx.bezierCurveTo(x - auraW * 0.08, (y0+y1)*0.58, x + auraW * 0.08, (y0+y1)*0.42, x + Math.sin(i+Date.now()/150)*auraW*0.04, y1);
            ctx.stroke();
        }

        ctx.strokeStyle = `rgba(255,230,190,${0.20 * alpha})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(0, auraH * 0.36, auraW * 0.34, auraH * 0.08, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

    } else if (eff.type === 'kasiyasP2M1ArcSlash') {
        const isYellow = String(eff.flameColorType || '').toUpperCase() === 'YELLOW' || String(eff.renderType || '').toUpperCase().indexOf('YELLOW') >= 0;
        const clipW = Math.max(24, eff.w || 180);
        const clipH = Math.max(20, eff.h || 120);
        // 공격 판정을 이펙트만으로 읽을 수 있게, 핵심 검격선은 히트박스 대각선 끝점에 맞닿도록 그린다.
        const dir = eff.dir === -1 ? -1 : 1;
        const core = isYellow ? `rgba(255,222,46,${0.98 * alpha})` : `rgba(255,46,34,${0.98 * alpha})`;
        const edge = isYellow ? `rgba(132,68,0,${0.94 * alpha})` : `rgba(38,0,0,${0.96 * alpha})`;
        const aura = isYellow ? `rgba(255,150,28,${0.54 * alpha})` : `rgba(126,0,190,${0.36 * alpha})`;
        const hot = isYellow ? `rgba(255,252,214,${0.88 * alpha})` : `rgba(255,238,224,${0.84 * alpha})`;
        const shadow = isYellow ? 'rgba(255,178,32,0.78)' : 'rgba(220,0,0,0.72)';
        ctx.save();
        ctx.beginPath();
        ctx.rect(-clipW * 0.5, -clipH * 0.5, clipW, clipH);
        ctx.clip();
        ctx.scale(dir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';

        const x0 = -clipW * 0.50;
        const x1 = clipW * 0.50;
        const y0 = isYellow ? -clipH * 0.50 : clipH * 0.50;
        const y1 = isYellow ? clipH * 0.50 : -clipH * 0.50;
        const curveSign = isYellow ? -1 : 1;
        const curve = Math.min(clipW, clipH) * 0.13 * curveSign;
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0.00, 'rgba(0,0,0,0)');
        grad.addColorStop(0.12, edge);
        grad.addColorStop(0.42, core);
        grad.addColorStop(0.62, hot);
        grad.addColorStop(0.86, aura);
        grad.addColorStop(1.00, 'rgba(0,0,0,0)');
        renderer.drawKasiyasSharpBladeRibbon(ctx, {
            x0, y0,
            c1x: x0 + clipW * 0.30, c1y: y0 + (y1 - y0) * 0.34 - curve,
            c2x: x0 + clipW * 0.68, c2y: y0 + (y1 - y0) * 0.66 - curve,
            x1, y1,
            width: Math.max(14, clipH * 0.20),
            fillStyle: grad,
            edgeStyle: edge,
            coreStyle: core,
            hotStyle: hot,
            shadowColor: shadow,
            bodyBlur: 10,
            edgeBlur: 10,
            coreBlur: 12,
            hotBlur: 7,
            profile: 'slash',
            tailScale: 0.05,
            tipScale: 0.035
        });
        renderer.drawKasiyasBladeShards(ctx, {
            count: 7,
            w: clipW * 0.86,
            h: clipH * 0.62,
            alpha,
            angle: Math.atan2(y1 - y0, x1 - x0) * 0.12,
            colorA: hot,
            colorB: aura,
            shadowColor: shadow
        });
        ctx.restore();

    } else if (eff.type === 'kasiyasP2M1FinalXSlash') {
        const clipW = Math.max(32, eff.w || 480);
        const clipH = Math.max(28, eff.h || 260);
        const dir = eff.dir === -1 ? -1 : 1;
        const enhanced = !!eff.enhanced;
        const power = enhanced ? 1.12 : 1.0;
        ctx.save();
        ctx.beginPath();
        ctx.rect(-clipW * 0.5, -clipH * 0.5, clipW, clipH);
        ctx.clip();
        // 베어내는 끝 방향이 전방으로 읽히도록 기존 방향 보정은 유지하되, 대각선 끝점은 판정 박스에 맞춘다.
        ctx.scale(-dir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';

        const drawXBlade = (x0, y0, x1, y1, palette, curveSign) => {
            const [core, edge, aura, hot, shadow] = palette;
            const curve = Math.min(clipW, clipH) * 0.15 * curveSign;
            const grad = ctx.createLinearGradient(x0, y0, x1, y1);
            grad.addColorStop(0.00, 'rgba(0,0,0,0)');
            grad.addColorStop(0.10, edge);
            grad.addColorStop(0.36, core);
            grad.addColorStop(0.52, hot);
            grad.addColorStop(0.70, core);
            grad.addColorStop(0.88, aura);
            grad.addColorStop(1.00, 'rgba(0,0,0,0)');
            renderer.drawKasiyasSharpBladeRibbon(ctx, {
                x0, y0,
                c1x: x0 + (x1 - x0) * 0.28, c1y: y0 + (y1 - y0) * 0.34 - curve,
                c2x: x0 + (x1 - x0) * 0.70, c2y: y0 + (y1 - y0) * 0.66 - curve,
                x1, y1,
                width: Math.max(22, clipH * 0.20) * power,
                fillStyle: grad,
                edgeStyle: edge,
                coreStyle: core,
                hotStyle: hot,
                shadowColor: shadow,
                bodyBlur: enhanced ? 16 : 11,
                edgeBlur: enhanced ? 18 : 12,
                coreBlur: enhanced ? 14 : 10,
                hotBlur: 7,
                edgeWidthMul: 0.34,
                coreWidthMul: 0.16,
                hotWidthMul: 0.040,
                profile: 'slash',
                tailScale: 0.045,
                tipScale: 0.030
            });
        };

        const redSet = [
            `rgba(255,48,34,${0.98 * alpha})`,
            `rgba(36,0,0,${0.96 * alpha})`,
            `rgba(126,0,190,${0.36 * alpha})`,
            `rgba(255,232,214,${0.90 * alpha})`,
            'rgba(220,0,0,0.82)'
        ];
        const yellowSet = [
            `rgba(255,220,46,${0.98 * alpha})`,
            `rgba(118,58,0,${0.96 * alpha})`,
            `rgba(255,150,30,${0.54 * alpha})`,
            `rgba(255,252,210,${0.92 * alpha})`,
            'rgba(255,180,34,0.82)'
        ];
        drawXBlade(-clipW * 0.50, clipH * 0.50, clipW * 0.50, -clipH * 0.50, redSet, 1);
        drawXBlade(-clipW * 0.50, -clipH * 0.50, clipW * 0.50, clipH * 0.50, yellowSet, -1);

        // 중심부는 선을 덮는 큰 원이 아니라, 두 검흔이 충돌한 짧고 날카로운 폭광만 남긴다.
        const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, clipH * (enhanced ? 0.42 : 0.34));
        grad.addColorStop(0, `rgba(255,255,236,${0.76 * alpha})`);
        grad.addColorStop(0.22, `rgba(255,188,72,${0.34 * alpha})`);
        grad.addColorStop(0.52, `rgba(128,0,196,${0.18 * alpha})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.shadowBlur = enhanced ? 18 : 12;
        ctx.shadowColor = 'rgba(255,210,86,0.72)';
        ctx.beginPath();
        ctx.ellipse(0, 0, clipW * (enhanced ? 0.15 : 0.11), clipH * (enhanced ? 0.24 : 0.19), 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255,245,214,${0.44 * alpha})`;
        ctx.lineWidth = enhanced ? 3.0 : 2.2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255,230,120,0.66)';
        const burstCount = enhanced ? 16 : 10;
        for (let i = 0; i < burstCount; i++) {
            const a = (Math.PI * 2 * i) / burstCount + (i % 2) * 0.12;
            const r0 = clipH * (0.05 + (i % 3) * 0.012);
            const r1 = clipH * (0.13 + (i % 4) * 0.017) * (enhanced ? 1.10 : 1.0);
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha * (0.18 + (i % 4) * 0.030)));
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 * 0.62);
            ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 * 0.62);
            ctx.stroke();
        }
        ctx.restore();

    } else if (eff.type === 'kasiyasP2DoubleSlash') {
        const mode = String(eff.slashMode || 'CROSS').toUpperCase();
        const clipW = Math.max(24, eff.w || 180);
        const clipH = Math.max(20, eff.h || 120);
        const dir = eff.dir === -1 ? -1 : 1;
        const core = eff.color || `rgba(255,58,44,${0.96 * alpha})`;
        const accent = eff.accentColor || `rgba(20,0,0,${0.96 * alpha})`;
        const hot = `rgba(255,234,206,${0.78 * alpha})`;
        const aura = `rgba(255,108,82,${0.36 * alpha})`;

        const drawBlade = (x0, y0, x1, y1, curveSign, scaleMul = 1) => {
            const curve = Math.min(clipW, clipH) * 0.12 * curveSign;
            const grad = ctx.createLinearGradient(x0, y0, x1, y1);
            grad.addColorStop(0.00, 'rgba(0,0,0,0)');
            grad.addColorStop(0.12, accent);
            grad.addColorStop(0.45, core);
            grad.addColorStop(0.62, hot);
            grad.addColorStop(0.86, aura);
            grad.addColorStop(1.00, 'rgba(0,0,0,0)');
            renderer.drawKasiyasSharpBladeRibbon(ctx, {
                x0, y0,
                c1x: x0 + (x1 - x0) * 0.30, c1y: y0 + (y1 - y0) * 0.34 - curve,
                c2x: x0 + (x1 - x0) * 0.70, c2y: y0 + (y1 - y0) * 0.66 - curve,
                x1, y1,
                width: Math.max(12, clipH * 0.16) * scaleMul,
                fillStyle: grad,
                edgeStyle: accent,
                coreStyle: core,
                hotStyle: hot,
                shadowColor: 'rgba(225,0,0,0.64)',
                bodyBlur: 8,
                edgeBlur: 8,
                coreBlur: 9,
                hotBlur: 5,
                profile: 'slash',
                tailScale: 0.045,
                tipScale: 0.030
            });
        };

        ctx.save();
        ctx.beginPath();
        ctx.rect(-clipW * 0.5, -clipH * 0.5, clipW, clipH);
        ctx.clip();
        // CROSS 계열은 베어내는 끝 방향이 전방으로 가도록 반전하고, UP_DOWN은 기존 읽힘을 유지한다.
        ctx.scale(mode === 'CROSS' ? -dir : dir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        if (mode === 'UP_DOWN') {
            drawBlade(-clipW * 0.50, -clipH * 0.12, clipW * 0.50, -clipH * 0.50, 1, 0.92);
            drawBlade(-clipW * 0.50, clipH * 0.12, clipW * 0.50, clipH * 0.50, -1, 0.92);
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(220,0,0,0.50)';
            ctx.strokeStyle = `rgba(255,108,82,${0.22 * alpha})`;
            ctx.lineWidth = Math.max(1.4, clipH * 0.012);
            ctx.beginPath();
            ctx.moveTo(-clipW * 0.46, -clipH * 0.38);
            ctx.bezierCurveTo(-clipW * 0.12, -clipH * 0.50, clipW * 0.20, -clipH * 0.42, clipW * 0.48, -clipH * 0.50);
            ctx.moveTo(-clipW * 0.46, clipH * 0.38);
            ctx.bezierCurveTo(-clipW * 0.12, clipH * 0.50, clipW * 0.20, clipH * 0.42, clipW * 0.48, clipH * 0.50);
            ctx.stroke();
        } else {
            // X자 베기는 박스형 히트박스의 대각선 끝과 끝이 곧 공격 범위로 보이도록 한다.
            drawBlade(-clipW * 0.5, clipH * 0.5, clipW * 0.5, -clipH * 0.5, 1, 1.02);
            drawBlade(-clipW * 0.5, -clipH * 0.5, clipW * 0.5, clipH * 0.5, -1, 1.02);
            const centerGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, clipH * 0.25);
            centerGrad.addColorStop(0, `rgba(255,250,232,${0.30 * alpha})`);
            centerGrad.addColorStop(0.38, `rgba(255,120,60,${0.17 * alpha})`);
            centerGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = centerGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, clipW * 0.085, clipH * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
        }
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
        const isKasiyasDown = renderTypeUpper === 'EFT_SLASH_DOWN' || renderTypeUpper === 'EFT_KASIYAS_SLASH_DOWN' || renderTypeUpper === 'EFT_KASIYAS_CHARGE_SLASH_DOWN' || renderTypeUpper === 'EFT_KASIYAS_SLASH_01' || renderTypeUpper === 'EFT_KASIYAS_SLASH_04' || renderTypeUpper === 'EFT_KASIYAS_P2_LEFT_SWORD_SLASH_DOWN' || renderTypeUpper === 'EFT_KASIYAS_P2_LEFT_SWORD_DIAGONAL_SLASH';
        const isKasiyasUp = renderTypeUpper === 'EFT_SLASH_UP' || renderTypeUpper === 'EFT_KASIYAS_SLASH_UP' || renderTypeUpper === 'EFT_KASIYAS_SLASH_03';
        const isKasiyasHorizontal = renderTypeUpper === 'EFT_KASIYAS_HORIZONTAL_SLASH' || renderTypeUpper === 'EFT_HORIZONTAL_SLASH' || renderTypeUpper === 'EFT_KASIYAS_P2_RIGHT_SWORD_HORIZONTAL_SLASH';

        ctx.scale(eff.dir || 1, 1);

        if (eff.majorPatternFlame || renderTypeUpper === 'EFT_KASIYAS_P2_M1_LEFT_SWORD_SLASH_WITH_RED_ENERGY' || renderTypeUpper === 'EFT_KASIYAS_P2_M1_RIGHT_SWORD_SLASH_WITH_YELLOW_ENERGY') {
            const isYellow = String(eff.flameColorType || '').toUpperCase() === 'YELLOW' || renderTypeUpper.indexOf('YELLOW') >= 0;
            const bladeW = Math.max(260, slashW * 1.04);
            const bladeH = Math.max(160, slashH * 1.06, slashD * 1.18);
            const halfW = bladeW * 0.5;
            const halfH = bladeH * 0.5;
            const angle = isYellow ? -0.58 : 0.58;
            const core = isYellow ? `rgba(255,214,42,${0.98 * alpha})` : `rgba(255,48,34,${0.98 * alpha})`;
            const edge = isYellow ? `rgba(112,58,0,${0.86 * alpha})` : `rgba(32,0,0,${0.90 * alpha})`;
            const hot = isYellow ? `rgba(255,252,210,${0.78 * alpha})` : `rgba(255,224,196,${0.72 * alpha})`;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.rotate(angle);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 22;
            ctx.shadowColor = isYellow ? 'rgba(255,186,34,0.78)' : 'rgba(225,0,0,0.78)';
            const drawMain = (widthMul, color, yOff, alphaMul=1) => {
                ctx.save();
                ctx.globalAlpha *= alphaMul;
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(4, bladeH * widthMul);
                ctx.beginPath();
                ctx.moveTo(-halfW * 0.64, yOff);
                ctx.bezierCurveTo(-halfW * 0.22, -halfH * 0.18 + yOff, halfW * 0.18, halfH * 0.16 + yOff, halfW * 0.64, yOff);
                ctx.stroke();
                ctx.restore();
            };
            drawMain(0.22, edge, 0, 0.90);
            drawMain(0.125, core, 0, 0.98);
            drawMain(0.030, hot, -halfH * 0.018, 0.92);
            for (let i = 0; i < 9; i++) {
                const t = (i + 0.2) / 9;
                const x = -halfW * 0.54 + bladeW * 1.08 * t;
                const y = Math.sin(i * 1.8 + Date.now()/95) * halfH * 0.10;
                ctx.strokeStyle = i % 2 ? edge : core;
                ctx.globalAlpha = Math.max(0, Math.min(1, alpha * (0.28 + (i%3)*0.05)));
                ctx.lineWidth = i % 2 ? 2.2 : 3.0;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.bezierCurveTo(x - halfW*0.05, y - halfH*0.16, x + halfW*0.04, y - halfH*0.24, x + Math.sin(i)*halfW*0.04, y - halfH*0.32);
                ctx.stroke();
            }
            ctx.restore();
            ctx.restore();
            return;
        }

        if (isKasiyasHorizontal) {
            // 카시야스 횡베기: 원형/타원형 판정을 따라 카시야스를 감싸는 C자형 검호로 보이도록 하단 호를 강화한다.
            const wideW = Math.max(32, slashW);
            const groundD = Math.max(20, slashD);
            const arcRx = Math.max(18, wideW * 0.50 * 0.98);
            const arcRy = Math.max(10, groundD * 0.50 * 0.98);
            const core = eff.color || `rgba(255,58,46,${0.96 * alpha})`;
            const accent = eff.accentColor || `rgba(24,0,0,${0.96 * alpha})`;
            const hot = `rgba(255,236,206,${0.78 * alpha})`;
            const shadow = 'rgba(220,0,0,0.68)';

            ctx.globalCompositeOperation = 'lighter';
            ctx.rotate(-0.035);
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'miter';
            ctx.beginPath();
            ctx.ellipse(0, 0, arcRx, arcRy, 0, 0, Math.PI * 2);
            ctx.clip();

            const rangeGrad = ctx.createRadialGradient(0, 0, Math.max(8, arcRy * 0.10), 0, 0, Math.max(arcRx, arcRy));
            rangeGrad.addColorStop(0, `rgba(255,72,52,${0.045 * alpha})`);
            rangeGrad.addColorStop(0.58, `rgba(120,0,0,${0.052 * alpha})`);
            rangeGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = rangeGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, arcRx, arcRy, 0, 0, Math.PI * 2);
            ctx.fill();

            const cGrad = ctx.createLinearGradient(-arcRx * 0.62, -arcRy, arcRx, arcRy);
            cGrad.addColorStop(0.00, 'rgba(0,0,0,0)');
            cGrad.addColorStop(0.10, accent);
            cGrad.addColorStop(0.34, core);
            cGrad.addColorStop(0.56, hot);
            cGrad.addColorStop(0.78, core);
            cGrad.addColorStop(0.94, `rgba(255,70,52,${0.22 * alpha})`);
            cGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
            renderer.drawKasiyasCrescentArcSlash(ctx, {
                radiusX: arcRx,
                radiusY: arcRy,
                innerScaleX: 0.76,
                innerScaleY: 0.56,
                // 왼쪽 일부만 비워둔 긴 원호. 상단에서 하단까지 이어져 C자처럼 읽히게 한다.
                startAngle: Math.PI * 1.16,
                endAngle: Math.PI * 0.84,
                fillStyle: cGrad,
                edgeStyle: accent,
                coreStyle: core,
                hotStyle: hot,
                shadowColor: shadow,
                bodyBlur: 13,
                edgeBlur: 10,
                coreBlur: 9,
                hotBlur: 6
            });
            // 하단부가 약해 보이지 않도록 같은 C 궤적 안쪽에 보조 검호를 추가한다.
            renderer.drawKasiyasCrescentArcSlash(ctx, {
                radiusX: arcRx * 0.88,
                radiusY: arcRy * 0.80,
                innerScaleX: 0.83,
                innerScaleY: 0.66,
                startAngle: Math.PI * 1.13,
                endAngle: Math.PI * 0.87,
                fillStyle: `rgba(255,86,64,${0.16 * alpha})`,
                edgeStyle: `rgba(48,0,0,${0.34 * alpha})`,
                coreStyle: `rgba(255,118,90,${0.25 * alpha})`,
                hotStyle: `rgba(255,236,214,${0.22 * alpha})`,
                shadowColor: shadow,
                bodyBlur: 6,
                edgeBlur: 4,
                coreBlur: 4,
                hotBlur: 3,
                tipAlpha: 0.45
            });
            renderer.drawKasiyasBladeShards(ctx, {
                count: 5,
                w: wideW * 0.82,
                h: groundD * 0.56,
                alpha,
                angle: -0.08,
                colorA: hot,
                colorB: core,
                shadowColor: shadow,
                blur: 4
            });
            ctx.restore();
            return;
        }

        if (isKasiyasStab) {
            // 카시야스 찌르기: XY 판정 길이를 우선으로 읽히게 하고, 시각 범위가 히트박스를 벗어나지 않게 정리한다.
            const stabW = Math.max(48, slashW);
            const stabD = Math.max(18, slashD);
            const tipX = stabW * 0.50;
            const backX = -stabW * 0.50;
            const core = eff.color || `rgba(255,54,46,${0.96 * alpha})`;
            const accent = eff.accentColor || `rgba(34,0,0,${0.96 * alpha})`;
            const hot = `rgba(255,238,214,${0.84 * alpha})`;
            const grad = ctx.createLinearGradient(backX, 0, tipX, 0);
            grad.addColorStop(0.00, 'rgba(0,0,0,0)');
            grad.addColorStop(0.14, accent);
            grad.addColorStop(0.44, core);
            grad.addColorStop(0.66, hot);
            grad.addColorStop(0.88, `rgba(255,72,58,${0.22 * alpha})`);
            grad.addColorStop(1.00, 'rgba(0,0,0,0)');

            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'miter';
            ctx.beginPath();
            ctx.rect(-stabW * 0.50, -stabD * 0.50, stabW, stabD);
            ctx.clip();
            renderer.drawKasiyasSharpBladeRibbon(ctx, {
                x0: backX, y0: 0,
                c1x: -stabW * 0.16, c1y: -stabD * 0.08,
                c2x: stabW * 0.30, c2y: stabD * 0.06,
                x1: tipX, y1: 0,
                width: Math.max(14, stabD * 0.95),
                fillStyle: grad,
                edgeStyle: accent,
                coreStyle: core,
                hotStyle: hot,
                shadowColor: 'rgba(220,0,0,0.72)',
                bodyBlur: 10,
                edgeBlur: 8,
                coreBlur: 8,
                hotBlur: 5,
                profile: 'projectile',
                tailScale: 0.11,
                tipScale: 0.018,
                edgeWidthMul: 0.22,
                coreWidthMul: 0.105,
                hotWidthMul: 0.040
            });

            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255,210,160,0.66)';
            ctx.strokeStyle = hot;
            ctx.lineWidth = Math.max(1.4, stabD * 0.10);
            ctx.beginPath();
            ctx.moveTo(backX * 0.70, 0);
            ctx.lineTo(tipX * 0.94, 0);
            ctx.stroke();
            ctx.shadowBlur = 5;
            for (let i = 0; i < 4; i++) {
                const yy = (i - 1.5) * stabD * 0.26;
                ctx.strokeStyle = i % 2 ? `rgba(255,110,90,${0.30 * alpha})` : `rgba(50,0,0,${0.40 * alpha})`;
                ctx.lineWidth = i % 2 ? 1.2 : 1.9;
                ctx.beginPath();
                ctx.moveTo(backX * 0.92, yy);
                ctx.lineTo(-stabW * 0.08, yy * 0.48);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        if (isKasiyasDown) {
            // 카시야스 내려베기: 히트박스 중심은 유지하되, 위에서 지면으로 내리찍는 큰 궤적과 충격감을 다시 살린다.
            const bladeW = Math.max(190, slashW * 1.16);
            const bladeH = Math.max(150, slashH * 1.36, slashD * 1.72);
            const halfW = bladeW * 0.50;
            const halfH = bladeH * 0.50;
            const pulse = 1 - alpha;
            const topX = -halfW * 0.48;
            const topY = -halfH * (0.90 + pulse * 0.035);
            const endX = halfW * 0.18;
            const endY = halfH * 0.78;
            const core = eff.color || `rgba(255,52,42,${0.96 * alpha})`;
            const accent = eff.accentColor || `rgba(30,0,0,${0.96 * alpha})`;
            const hot = `rgba(255,236,214,${0.80 * alpha})`;
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'miter';
            // 검호 궤적만 상하 반전한다. 지면 충격 이펙트는 기존 위치에 그대로 둔다.
            ctx.save();
            ctx.scale(1, -1);
            const grad = ctx.createLinearGradient(topX, topY, endX, endY);
            grad.addColorStop(0.00, 'rgba(0,0,0,0)');
            grad.addColorStop(0.13, accent);
            grad.addColorStop(0.40, core);
            grad.addColorStop(0.63, hot);
            grad.addColorStop(0.84, `rgba(128,0,0,${0.42 * alpha})`);
            grad.addColorStop(1.00, 'rgba(0,0,0,0)');
            renderer.drawKasiyasSharpBladeRibbon(ctx, {
                x0: topX, y0: topY,
                c1x: halfW * 0.22, c1y: -halfH * (1.00 + pulse * 0.03),
                c2x: halfW * 0.80, c2y: -halfH * 0.04,
                x1: endX, y1: endY,
                width: Math.max(34, bladeH * 0.27),
                fillStyle: grad,
                edgeStyle: accent,
                coreStyle: core,
                hotStyle: hot,
                shadowColor: 'rgba(220,0,0,0.72)',
                bodyBlur: 14,
                edgeBlur: 12,
                coreBlur: 10,
                hotBlur: 6,
                profile: 'slash',
                tailScale: 0.038,
                tipScale: 0.026
            });
            renderer.drawKasiyasBladeShards(ctx, {
                count: 7,
                w: bladeW * 0.70,
                h: bladeH * 0.48,
                alpha,
                angle: 0.56,
                colorA: hot,
                colorB: core,
                shadowColor: 'rgba(220,0,0,0.54)',
                blur: 5
            });
            ctx.restore();
            // 내리찍는 지점의 지면 충격광과 칼날형 파편.
            const impactGrad = ctx.createRadialGradient(endX, endY, Math.max(6, bladeH * 0.04), endX, endY, Math.max(44, bladeH * 0.34));
            impactGrad.addColorStop(0, `rgba(255,244,220,${0.22 * alpha})`);
            impactGrad.addColorStop(0.28, `rgba(255,76,52,${0.24 * alpha})`);
            impactGrad.addColorStop(0.68, `rgba(82,0,0,${0.16 * alpha})`);
            impactGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = impactGrad;
            ctx.beginPath();
            ctx.ellipse(endX, endY + halfH * 0.05, halfW * 0.36, halfH * 0.16, -0.10, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(220,0,0,0.60)';
            ctx.strokeStyle = hot;
            ctx.lineWidth = Math.max(1.8, bladeH * 0.018);
            for (let i = 0; i < 5; i++) {
                const s = (i - 2) * 0.18;
                ctx.beginPath();
                ctx.moveTo(endX + halfW * s * 0.30, endY + halfH * 0.02);
                ctx.lineTo(endX + halfW * (0.16 + s * 0.34), endY + halfH * (0.22 + Math.abs(s) * 0.10));
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        if (isKasiyasUp) {
            // 카시야스 올려베기: 아래에서 위로 치켜올리는 궤적이 한눈에 보이도록 큰 초승달형 검호로 다시 확장한다.
            const bladeW = Math.max(150, slashW * 1.10);
            const bladeH = Math.max(125, slashH * 1.18, slashD * 1.55);
            const halfW = bladeW * 0.50;
            const halfH = bladeH * 0.50;
            const angle = -0.48;
            const backX = -bladeW * 0.48;
            const tipX = bladeW * 0.56;
            const core = eff.color || `rgba(255,54,46,${0.96 * alpha})`;
            const accent = eff.accentColor || `rgba(34,0,0,${0.96 * alpha})`;
            const hot = `rgba(255,236,214,${0.80 * alpha})`;
            // 올려베기 궤적이 반대로 읽히던 문제를 보정하기 위해 검호 전체를 좌우 반전한다.
            ctx.scale(-1, 1);
            ctx.rotate(angle);
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'miter';
            const gradUp = ctx.createLinearGradient(backX, halfH * 0.20, tipX, -halfH * 0.28);
            gradUp.addColorStop(0.00, 'rgba(0,0,0,0)');
            gradUp.addColorStop(0.13, accent);
            gradUp.addColorStop(0.42, core);
            gradUp.addColorStop(0.66, hot);
            gradUp.addColorStop(0.88, `rgba(255,72,58,${0.20 * alpha})`);
            gradUp.addColorStop(1.00, 'rgba(0,0,0,0)');
            renderer.drawKasiyasSharpBladeRibbon(ctx, {
                x0: backX, y0: halfH * 0.42,
                c1x: -halfW * 0.24, c1y: -halfH * 0.82,
                c2x: tipX * 0.72, c2y: -halfH * 0.76,
                x1: tipX, y1: -halfH * 0.08,
                width: Math.max(30, bladeH * 0.30),
                fillStyle: gradUp,
                edgeStyle: accent,
                coreStyle: core,
                hotStyle: hot,
                shadowColor: 'rgba(220,0,0,0.72)',
                bodyBlur: 13,
                edgeBlur: 11,
                coreBlur: 9,
                hotBlur: 6,
                profile: 'slash',
                tailScale: 0.034,
                tipScale: 0.022
            });
            // 메인 검호 안쪽에 짧은 보조 초승달을 추가해 올려베기 궤적을 더 잘 읽히게 한다.
            renderer.drawKasiyasSharpBladeRibbon(ctx, {
                x0: backX * 0.86, y0: halfH * 0.28,
                c1x: -halfW * 0.18, c1y: -halfH * 0.58,
                c2x: tipX * 0.58, c2y: -halfH * 0.54,
                x1: tipX * 0.76, y1: -halfH * 0.02,
                width: Math.max(12, bladeH * 0.105),
                fillStyle: `rgba(255,92,70,${0.25 * alpha})`,
                edgeStyle: `rgba(42,0,0,${0.38 * alpha})`,
                coreStyle: `rgba(255,128,96,${0.26 * alpha})`,
                hotStyle: `rgba(255,236,214,${0.20 * alpha})`,
                shadowColor: 'rgba(220,0,0,0.50)',
                bodyBlur: 6,
                edgeBlur: 5,
                coreBlur: 5,
                hotBlur: 3,
                profile: 'slash',
                tailScale: 0.030,
                tipScale: 0.020
            });
            renderer.drawKasiyasBladeShards(ctx, {
                count: 6,
                w: bladeW * 0.76,
                h: bladeH * 0.58,
                alpha,
                angle: -0.12,
                colorA: hot,
                colorB: core,
                shadowColor: 'rgba(220,0,0,0.54)',
                blur: 5
            });
            ctx.restore();
            return;
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
        const w = Math.max(150, eff.w || 240);
        const h = Math.max(58, eff.d || 82);
        const dir = eff.dir || 1;
        const t = 1 - alpha;
        ctx.save();
        ctx.scale(dir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 몸에 달라붙은 돌진 기운: 원형 충격 대신 몸 앞쪽에서 뒤로 흐르는 화염/압력장.
        const bodyGrad = ctx.createLinearGradient(-w * 0.48, 0, w * 0.44, 0);
        bodyGrad.addColorStop(0.00, 'rgba(0,0,0,0)');
        bodyGrad.addColorStop(0.18, `rgba(42,0,0,${0.34 * alpha})`);
        bodyGrad.addColorStop(0.48, `rgba(210,24,12,${0.36 * alpha})`);
        bodyGrad.addColorStop(0.76, `rgba(255,104,40,${0.46 * alpha})`);
        bodyGrad.addColorStop(1.00, 'rgba(255,226,128,0)');
        ctx.fillStyle = bodyGrad;
        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(230,38,12,0.48)';
        ctx.beginPath();
        ctx.moveTo(-w * 0.44 - t * w * 0.10, -h * 0.24);
        ctx.bezierCurveTo(-w * 0.18, -h * 0.56, w * 0.20, -h * 0.50, w * 0.52, -h * 0.08);
        ctx.bezierCurveTo(w * 0.58, h * 0.06, w * 0.22, h * 0.50, -w * 0.44 - t * w * 0.10, h * 0.28);
        ctx.bezierCurveTo(-w * 0.28, h * 0.10, -w * 0.28, -h * 0.10, -w * 0.44 - t * w * 0.10, -h * 0.24);
        ctx.closePath();
        ctx.fill();

        // 카시야스 몸통 앞에 붙는 밝은 돌진 핵심부.
        const frontGrad = ctx.createLinearGradient(w * 0.08, 0, w * 0.56, 0);
        frontGrad.addColorStop(0, `rgba(150,0,0,${0.28 * alpha})`);
        frontGrad.addColorStop(0.58, `rgba(255,78,24,${0.62 * alpha})`);
        frontGrad.addColorStop(1, `rgba(255,232,116,${0.44 * alpha})`);
        ctx.fillStyle = frontGrad;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(w * 0.02, -h * 0.36);
        ctx.bezierCurveTo(w * 0.26, -h * 0.54, w * 0.50, -h * 0.30, w * 0.60, -h * 0.02);
        ctx.bezierCurveTo(w * 0.50, h * 0.32, w * 0.26, h * 0.52, w * 0.02, h * 0.36);
        ctx.bezierCurveTo(w * 0.16, h * 0.16, w * 0.16, -h * 0.18, w * 0.02, -h * 0.36);
        ctx.closePath();
        ctx.fill();

        // 뒤로 흐르는 속도선. 신체에 붙은 돌진감을 위해 선은 뒤쪽에서 앞쪽으로 모인다.
        ctx.shadowBlur = 8;
        ctx.strokeStyle = `rgba(18,0,0,${0.78 * alpha})`;
        ctx.lineWidth = Math.max(5.2, h * 0.080);
        for (let i = 0; i < 5; i++) {
            const yy = (i - 2) * h * 0.16;
            ctx.beginPath();
            ctx.moveTo(-w * (0.58 + t * 0.14), yy + h * 0.08);
            ctx.bezierCurveTo(-w * 0.26, yy - h * 0.02, w * 0.05, yy - h * 0.05, w * 0.40, yy);
            ctx.stroke();
        }

        ctx.strokeStyle = `rgba(255,116,54,${0.72 * alpha})`;
        ctx.lineWidth = Math.max(2.0, h * 0.035);
        for (let i = 0; i < 5; i++) {
            const yy = (i - 2) * h * 0.16;
            ctx.beginPath();
            ctx.moveTo(-w * (0.54 + t * 0.12), yy + h * 0.04);
            ctx.bezierCurveTo(-w * 0.23, yy - h * 0.03, w * 0.03, yy - h * 0.04, w * 0.36, yy);
            ctx.stroke();
        }

        // 전방 충격면은 원이 아니라, 몸이 밀고 들어가는 삼각형/쐐기형으로만 표시.
        ctx.shadowBlur = 10;
        ctx.strokeStyle = `rgba(255,226,128,${0.50 * alpha})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(w * 0.46, -h * 0.40);
        ctx.lineTo(w * 0.62, 0);
        ctx.lineTo(w * 0.46, h * 0.40);
        ctx.stroke();
        ctx.restore();
    } else if (eff.type === 'guard') {
        const baseW = Math.max(104, eff.w || 130);
        const baseH = Math.max(110, eff.h || 135);
        const kind = String(eff.renderType || 'EFT_GUARD').trim().toUpperCase();
        const isReduce = kind === 'EFT_GUARD_REDUCE' || kind === 'EFT_APOSTLE_GUARD_REDUCE';
        const isSuccess = kind === 'EFT_GUARD_SUCCESS' || kind === 'EFT_GUARD_REDUCE' || kind === 'EFT_APOSTLE_GUARD_REDUCE';
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

        if (renderType === 'EFT_KASIYAS_TEMPERED_BLADE_READY') {
            const r = Math.max(48, (eff.w || 150) * 0.36) * burstScale;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowBlur = 30;
            ctx.shadowColor = 'rgba(255,236,118,0.95)';
            const ringGrad = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r * 1.08);
            ringGrad.addColorStop(0, `rgba(255,255,220,${0.24 * alpha})`);
            ringGrad.addColorStop(0.42, `rgba(255,232,90,${0.30 * alpha})`);
            ringGrad.addColorStop(1, 'rgba(255,232,90,0)');
            ctx.fillStyle = ringGrad;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.08, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 2; i++) {
                ctx.save();
                ctx.rotate((Date.now() / (520 + i * 140)) * (i ? -1 : 1));
                ctx.strokeStyle = i ? `rgba(160,235,255,${0.62 * alpha})` : `rgba(255,244,146,${0.92 * alpha})`;
                ctx.lineWidth = i ? 2.2 : 3.4;
                ctx.beginPath();
                ctx.ellipse(0, 0, r * (0.86 + i * 0.18), r * (0.34 + i * 0.07), 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            ctx.lineCap = 'round';
            ctx.strokeStyle = `rgba(255,255,235,${0.96 * alpha})`;
            ctx.lineWidth = 4.2;
            ctx.beginPath();
            ctx.moveTo(-r * 0.62, r * 0.18);
            ctx.lineTo(r * 0.72, -r * 0.28);
            ctx.moveTo(-r * 0.28, -r * 0.50);
            ctx.lineTo(r * 0.42, r * 0.34);
            ctx.stroke();
            ctx.restore();
        } else if (renderType === 'EFT_TEMPERED_BLADE_CROSS_GUARD' || renderType === 'EFT_TEMPERED_BLADE_CROSS_BREAK') {
            const r = Math.max(70, (eff.w || 240) * 0.28) * burstScale;
            const isBreak = renderType === 'EFT_TEMPERED_BLADE_CROSS_BREAK';
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowBlur = isBreak ? 42 : 30;
            ctx.shadowColor = isBreak ? 'rgba(255,250,190,0.98)' : 'rgba(255,230,110,0.92)';
            ctx.fillStyle = isBreak ? `rgba(255,255,235,${0.22 * alpha})` : `rgba(255,238,154,${0.16 * alpha})`;
            ctx.beginPath();
            ctx.arc(0, 0, r * (isBreak ? 0.78 : 0.54), 0, Math.PI * 2);
            ctx.fill();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = `rgba(22,10,0,${0.80 * alpha})`;
            ctx.lineWidth = isBreak ? 16 : 12;
            ctx.beginPath();
            ctx.moveTo(-r, -r * 0.72);
            ctx.lineTo(r, r * 0.72);
            ctx.moveTo(-r, r * 0.72);
            ctx.lineTo(r, -r * 0.72);
            ctx.stroke();
            ctx.strokeStyle = isBreak ? `rgba(255,255,235,${0.98 * alpha})` : `rgba(255,238,126,${0.94 * alpha})`;
            ctx.lineWidth = isBreak ? 6 : 4.6;
            ctx.beginPath();
            ctx.moveTo(-r * 0.92, -r * 0.66);
            ctx.lineTo(r * 0.92, r * 0.66);
            ctx.moveTo(-r * 0.92, r * 0.66);
            ctx.lineTo(r * 0.92, -r * 0.66);
            ctx.stroke();
            for (let i = 0; i < (isBreak ? 12 : 7); i++) {
                const ang = (Math.PI * 2 / (isBreak ? 12 : 7)) * i + Date.now() / 320;
                const len = r * (0.55 + (i % 3) * 0.13);
                ctx.strokeStyle = i % 2 ? `rgba(126,226,255,${0.52 * alpha})` : `rgba(255,230,94,${0.62 * alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(ang) * len * 0.32, Math.sin(ang) * len * 0.32);
                ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
                ctx.stroke();
            }
            ctx.restore();
        } else if (renderType === 'EFT_KASIYAS_ONI_MARK_SLASH_WOUNDS') {
            const w = Math.max(110, eff.w || 140);
            const h = Math.max(140, eff.h || 170);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowBlur = 18;
            ctx.shadowColor = 'rgba(190,0,0,0.82)';
            ctx.fillStyle = `rgba(90,0,0,${0.16 * alpha})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * 0.46, h * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineCap = 'round';
            const cuts = [
                [-0.42,-0.34,0.36,-0.18], [-0.35,-0.08,0.42,-0.26],
                [-0.48,0.18,0.28,0.04], [-0.22,0.38,0.46,0.18],
                [-0.08,-0.48,0.18,0.44], [-0.52,-0.24,-0.10,0.34],
                [0.10,-0.36,0.54,0.26]
            ];
            cuts.forEach((c, idx) => {
                ctx.strokeStyle = idx % 2 ? `rgba(18,0,0,${0.94 * alpha})` : `rgba(255,46,50,${0.86 * alpha})`;
                ctx.lineWidth = idx % 2 ? 5 : 3;
                ctx.beginPath();
                ctx.moveTo(c[0] * w, c[1] * h);
                ctx.lineTo(c[2] * w, c[3] * h);
                ctx.stroke();
                ctx.strokeStyle = `rgba(255,190,108,${0.38 * alpha})`;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(c[0] * w, c[1] * h - 1);
                ctx.lineTo(c[2] * w, c[3] * h - 1);
                ctx.stroke();
            });
            ctx.restore();
        } else if (renderType === 'EFT_CAN_PARRY' || renderType === 'EFT_SUCCESS_PARRY') {
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
                // 주먹 휘두르기: 전방으로 주먹을 내지르는 직선형 타격 이펙트.
                // 히트박스 X 범위를 채우도록 길게 뻗고, 끝에 둔탁한 주먹 충격점을 둔다.
                const w = Math.max(130, eff.w || 250) * Math.max(0.95, burstScale * 0.76);
                const h = Math.max(54, eff.d || eff.h || 96) * Math.max(0.90, burstScale * 0.64);
                const thrust = 1 - alpha;
                ctx.save();
                ctx.scale(eff.dir || 1, 1);
                ctx.globalCompositeOperation = 'lighter';
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                const armStart = -w * 0.50;
                const fistX = w * (0.34 + thrust * 0.05);
                const armEnd = fistX - w * 0.10;

                // 팔이 앞으로 쭉 뻗는 어두운 실루엣
                ctx.shadowBlur = 12;
                ctx.shadowColor = 'rgba(170,0,0,0.45)';
                ctx.strokeStyle = `rgba(16,0,0,${0.86 * alpha})`;
                ctx.lineWidth = Math.max(12, h * 0.22);
                ctx.beginPath();
                ctx.moveTo(armStart, 0);
                ctx.bezierCurveTo(-w * 0.20, -h * 0.04, w * 0.10, -h * 0.03, armEnd, 0);
                ctx.stroke();

                // 붉은 중심 추진선
                ctx.strokeStyle = `rgba(220,32,20,${0.74 * alpha})`;
                ctx.lineWidth = Math.max(6.0, h * 0.105);
                ctx.beginPath();
                ctx.moveTo(armStart + w * 0.06, -h * 0.01);
                ctx.bezierCurveTo(-w * 0.12, -h * 0.03, w * 0.15, -h * 0.02, armEnd, 0);
                ctx.stroke();

                // 팔을 따라 붙는 밝은 중심선
                ctx.shadowBlur = 6;
                ctx.strokeStyle = `rgba(255,212,156,${0.46 * alpha})`;
                ctx.lineWidth = Math.max(2.0, h * 0.035);
                ctx.beginPath();
                ctx.moveTo(armStart + w * 0.16, -h * 0.06);
                ctx.lineTo(armEnd - w * 0.02, -h * 0.04);
                ctx.stroke();

                // 히트박스 끝부분을 채우는 주먹 충격점
                const fistGrad = ctx.createRadialGradient(fistX - w * 0.03, 0, h * 0.06, fistX, 0, Math.max(h * 0.42, 28));
                fistGrad.addColorStop(0, `rgba(255,230,168,${0.52 * alpha})`);
                fistGrad.addColorStop(0.34, `rgba(255,72,38,${0.58 * alpha})`);
                fistGrad.addColorStop(0.70, `rgba(128,0,0,${0.34 * alpha})`);
                fistGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = fistGrad;
                ctx.beginPath();
                ctx.ellipse(fistX, 0, h * 0.42, h * 0.30, 0.02, 0, Math.PI * 2);
                ctx.fill();

                // 전방 압축선
                ctx.shadowBlur = 0;
                ctx.strokeStyle = `rgba(255,112,70,${0.42 * alpha})`;
                ctx.lineWidth = Math.max(1.8, h * 0.030);
                for (let i = 0; i < 4; i++) {
                    const yy = (i - 1.5) * h * 0.16;
                    ctx.beginPath();
                    ctx.moveTo(-w * (0.42 + thrust * 0.08), yy);
                    ctx.lineTo(w * (0.28 + i * 0.018), yy * 0.56);
                    ctx.stroke();
                }

                // 끝부분 주먹 외곽
                ctx.strokeStyle = `rgba(20,0,0,${0.74 * alpha})`;
                ctx.lineWidth = Math.max(2.4, h * 0.040);
                ctx.beginPath();
                ctx.ellipse(fistX, 0, h * 0.34, h * 0.23, 0.02, 0, Math.PI * 2);
                ctx.stroke();

                ctx.restore();
            } else if (renderType === 'EFT_KASIYAS_SHOULDER_ATK') {
                // 어깨치기: 주먹 파편이 아니라 몸통이 밀고 들어가는 돌진 잔상/압력선.
                const w = Math.max(120, eff.w || 190);
                const h = Math.max(46, eff.h || eff.d || 75);
                const rush = 1 - alpha;
                ctx.save();
                ctx.scale(eff.dir || 1, 1);
                ctx.globalCompositeOperation = 'lighter';

                const grad = ctx.createLinearGradient(-w * 0.60, 0, w * 0.54, 0);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(0.20, `rgba(18,0,0,${0.30 * alpha})`);
                grad.addColorStop(0.54, `rgba(108,0,0,${0.28 * alpha})`);
                grad.addColorStop(0.84, `rgba(255,88,58,${0.30 * alpha})`);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, w * 0.54, h * 0.44, -0.04, 0, Math.PI * 2);
                ctx.fill();

                // 전방으로 밀어붙이는 굵은 압력선
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.shadowBlur = 11;
                ctx.shadowColor = 'rgba(210,0,0,0.52)';
                ctx.strokeStyle = `rgba(18,0,0,${0.84 * alpha})`;
                ctx.lineWidth = Math.max(5.0, h * 0.10);
                for (let i = 0; i < 4; i++) {
                    const yy = (i - 1.5) * h * 0.17;
                    ctx.beginPath();
                    ctx.moveTo(-w * (0.48 + rush * 0.08), yy + h * 0.08);
                    ctx.bezierCurveTo(-w * 0.18, yy - h * 0.07, w * 0.14, yy - h * 0.10, w * 0.46, yy - h * 0.02);
                    ctx.stroke();
                }

                ctx.shadowBlur = 5;
                ctx.strokeStyle = `rgba(255,92,58,${0.78 * alpha})`;
                ctx.lineWidth = Math.max(2.0, h * 0.040);
                for (let i = 0; i < 4; i++) {
                    const yy = (i - 1.5) * h * 0.17;
                    ctx.beginPath();
                    ctx.moveTo(-w * (0.45 + rush * 0.06), yy + h * 0.05);
                    ctx.bezierCurveTo(-w * 0.16, yy - h * 0.05, w * 0.12, yy - h * 0.07, w * 0.42, yy);
                    ctx.stroke();
                }

                // 어깨가 들이받는 앞쪽 충격면
                ctx.fillStyle = `rgba(255,224,176,${0.24 * alpha})`;
                ctx.beginPath();
                ctx.moveTo(w * 0.32, -h * 0.32);
                ctx.lineTo(w * 0.55, 0);
                ctx.lineTo(w * 0.32, h * 0.32);
                ctx.quadraticCurveTo(w * 0.42, 0, w * 0.32, -h * 0.32);
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
        const isP3Trail = !!eff.p3RushTrail || String(eff.renderType || '').toUpperCase().indexOf('EFT_KASIYAS_P3_') >= 0;
        ctx.save();
        ctx.rotate(angle);
        const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
        if (isP3Trail) {
            grad.addColorStop(0, `rgba(10,0,42,0)`);
            grad.addColorStop(0.45, `rgba(42,0,112,${0.30 * alpha})`);
            grad.addColorStop(0.72, `rgba(150,82,255,${0.30 * alpha})`);
            grad.addColorStop(1, `rgba(0,0,0,0)`);
        } else {
            grad.addColorStop(0, `rgba(50,0,0,0)`);
            grad.addColorStop(0.45, `rgba(95,0,0,${0.30 * alpha})`);
            grad.addColorStop(0.72, `rgba(255,60,55,${0.28 * alpha})`);
            grad.addColorStop(1, `rgba(0,0,0,0)`);
        }
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
        const strong = !!eff.strong || String(eff.renderType || '').toUpperCase().indexOf('STRONG') >= 0;
        ctx.save();
        ctx.scale(eff.dir || 1, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = strong ? 24 : 16;
        ctx.shadowColor = strong ? 'rgba(255,74,44,0.85)' : 'rgba(255,232,178,0.68)';
        ctx.fillStyle = strong ? `rgba(120,0,0,${0.18 * alpha})` : `rgba(255,224,168,${0.18 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.26 + pulse * 0.20), d * (0.18 + pulse * 0.16), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = eff.accentColor || (strong ? `rgba(150,0,0,${0.92 * alpha})` : `rgba(110,68,30,${0.84 * alpha})`);
        ctx.lineWidth = strong ? 8 : 5;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.28 + pulse * 0.24), d * (0.17 + pulse * 0.16), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = eff.color || (strong ? `rgba(255,84,50,${0.90 * alpha})` : `rgba(255,230,176,${0.88 * alpha})`);
        ctx.lineWidth = strong ? 4 : 2.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, w * (0.22 + pulse * 0.20), d * (0.13 + pulse * 0.13), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = strong ? `rgba(255,214,126,${0.78 * alpha})` : `rgba(255,246,212,${0.76 * alpha})`;
        ctx.lineWidth = strong ? 2.6 : 1.9;
        for (let i = 0; i < (strong ? 9 : 7); i++) {
            const a = -Math.PI * 0.92 + i * Math.PI * (strong ? 0.23 : 0.30);
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * w * 0.07, Math.sin(a) * d * 0.05);
            ctx.lineTo(Math.cos(a) * w * (0.22 + pulse * 0.24), Math.sin(a) * d * (0.15 + pulse * 0.15));
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
        // 경고 전조는 모든 패턴에서 Z축 높이를 시각 범위에 사용하지 않고,
        // X/Y 평면으로 투영한 지면 공격 범위만 보여준다.
        const w = Math.max(20, eff.w || 50);
        const d = Math.max(12, eff.d || 30);
        const warningType = String(eff.warningRenderType || eff.renderType || '').trim();
        const pulse = 0.7 + Math.sin(Date.now() / 90) * 0.3;

        const warningTypeUpper = warningType.toUpperCase();
        if (warningTypeUpper === 'WARNING_FALLING_SWORD_TARGET') {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(160, 10, 28, ${0.14 + pulse * 0.08})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, w / 2, d / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 60, 86, ${0.84 * alpha})`;
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.ellipse(0, 0, w / 2, d / 2, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(230, 190, 255, ${0.46 * alpha})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(0, -120);
            ctx.lineTo(0, -8);
            ctx.stroke();
            ctx.fillStyle = `rgba(255, 220, 230, ${0.74 * alpha})`;
            ctx.beginPath();
            ctx.moveTo(0, -24);
            ctx.lineTo(8, -6);
            ctx.lineTo(-8, -6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else if (eff.pathAngle !== undefined && eff.pathAngle !== null) {
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

                // 진행 방향 화살표: 본체/분신이 숨어 있는 상태에서 이 선이 핵심 정보가 되므로
                // 실제 pathAngle(start → end)에 맞춰 크게 보이는 >>>>/<<<< 체인 화살표를 표시한다.
                // 화살표 위치와 점멸 순서도 반드시 start → end 방향을 따른다.
                const arrowCount = Math.max(3, Math.min(7, Math.floor(w / 175)));
                const spacing = w / (arrowCount + 1);
                const phase = (Date.now() / 520) % 1;
                const pulsePos = phase * (arrowCount + 1) - 0.5;
                const baseArrowSize = Math.max(42, Math.min(92, Math.max(lineH * 1.28, d * 0.48)));
                for (let i = 0; i < arrowCount; i++) {
                    const x = -w / 2 + spacing * (i + 1);
                    const distFromPulse = Math.abs(i - pulsePos);
                    const blink = Math.max(0.20, Math.min(1, 1 - distFromPulse * 0.55));
                    const a = alpha * (0.42 + blink * 0.58);
                    const size = baseArrowSize * (0.92 + blink * 0.16);

                    ctx.save();
                    ctx.translate(x, 0);
                    ctx.lineJoin = 'round';
                    ctx.lineCap = 'round';

                    // 큰 채움 화살표를 먼저 그려서 멀리서도 방향이 읽히게 한다.
                    for (let k = 0; k < 2; k++) {
                        const ox = -k * size * 0.50;
                        ctx.beginPath();
                        ctx.moveTo(ox - size * 0.46, -size * 0.46);
                        ctx.lineTo(ox + size * 0.40, 0);
                        ctx.lineTo(ox - size * 0.46, size * 0.46);
                        ctx.lineTo(ox - size * 0.20, 0);
                        ctx.closePath();
                        ctx.shadowBlur = 14 + blink * 18;
                        ctx.shadowColor = `rgba(255,195,54,${0.58 * a})`;
                        ctx.fillStyle = `rgba(255,210,64,${0.18 * a})`;
                        ctx.fill();

                        ctx.shadowBlur = 0;
                        ctx.strokeStyle = `rgba(92,22,0,${0.70 * a})`;
                        ctx.lineWidth = Math.max(5, size * 0.16);
                        ctx.stroke();

                        ctx.strokeStyle = `rgba(255,235,104,${0.98 * a})`;
                        ctx.lineWidth = Math.max(3, size * 0.08);
                        ctx.beginPath();
                        ctx.moveTo(ox - size * 0.44, -size * 0.43);
                        ctx.lineTo(ox + size * 0.34, 0);
                        ctx.lineTo(ox - size * 0.44, size * 0.43);
                        ctx.stroke();
                    }
                    ctx.restore();
                }
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
        } else if (warningTypeUpper === 'WARNING_HITBOX') {
            const prog = Math.max(0, Math.min(1, parseFloat(eff.warningProgress) || 0));
            const edgePulse = 0.70 + Math.sin(Date.now() / 75) * 0.30;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(255, 78, 46, ${0.10 + edgePulse * 0.07})`;
            ctx.fillRect(-w / 2, -d / 2, w, d);

            ctx.strokeStyle = `rgba(88, 0, 0, ${0.90 * alpha})`;
            ctx.lineWidth = 3.0;
            ctx.strokeRect(-w / 2, -d / 2, w, d);

            ctx.strokeStyle = `rgba(255, 104, 72, ${0.82 * alpha})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([Math.max(10, w * 0.035), Math.max(6, w * 0.020)]);
            ctx.lineDashOffset = -Date.now() / 36;
            ctx.strokeRect(-w / 2 + 2, -d / 2 + 2, w - 4, d - 4);
            ctx.setLineDash([]);

            // 중심 십자선은 박스형 공격 판정의 X/Y 범위를 읽기 위한 보조선이다.
            ctx.strokeStyle = `rgba(255, 230, 170, ${0.32 * alpha})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(-w / 2, 0);
            ctx.lineTo(w / 2, 0);
            ctx.moveTo(0, -d / 2);
            ctx.lineTo(0, d / 2);
            ctx.stroke();

            if (eff.inlineActionWarning) {
                ctx.fillStyle = `rgba(255, 225, 120, ${0.20 * alpha})`;
                ctx.fillRect(-w / 2, -d / 2, w * prog, Math.max(3, d * 0.055));
            }
            ctx.restore();
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
