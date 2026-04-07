GameRenderer.drawProjectileEntity = function(ctx, p) {
    let drawY = this.GROUND_BASE_Y + p.y;
    let drawZ = drawY - p.z;
    const projectileRenderType = String(p.renderType || '').trim();
    const projectileName = String(p.projName || '').trim();

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(p.x, drawY, p.hitX / 2, p.hitY / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(p.x, drawZ);
    ctx.scale(p.vx > 0 ? 1 : -1, 1);

    if (projectileRenderType === 'PROJECTILE_SLASH_WAVE' || projectileName.includes("웨이브")) {
        ctx.beginPath();
        ctx.arc(0, 0, p.hitX, -Math.PI / 2, Math.PI / 2);
        ctx.arc(-20, 0, p.hitX, Math.PI / 2, -Math.PI / 2, true);
        let grad = ctx.createLinearGradient(0, -p.hitZ, 0, p.hitZ);
        grad.addColorStop(0, "rgba(255,255,255,0.8)");
        grad.addColorStop(0.5, "rgba(52, 152, 219, 0.9)");
        grad.addColorStop(1, "rgba(255,255,255,0.8)");
        ctx.fillStyle = grad;
        ctx.fill();
    } else if (projectileRenderType === 'PROJECTILE_ENERGY_BOMB' || projectileName.includes("캐논볼")) {
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
    } else if (projectileRenderType === 'PROJECTILE_ICE_BOLT' || projectileName.includes("얼음화살")) {
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
    } else if (projectileRenderType === 'PROJECTILE_ARROW' || projectileName.includes("화살")) {
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(-15, -2, 30, 4);
        ctx.fillStyle = "#bdc3c7";
        ctx.beginPath();
        ctx.moveTo(15, -4);
        ctx.lineTo(25, 0);
        ctx.lineTo(15, 4);
        ctx.fill();
    } else if (projectileRenderType === 'PROJECTILE_STONE' || projectileName.includes("돌멩이")) {
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
    } else if (projectileRenderType === 'PROJECTILE_BULLET' || projectileName.includes("탄환")) {
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

    if (eff.type === 'slash') {
        const slashW = Math.max(24, eff.w || 80);
        const slashH = Math.max(16, eff.h || 40);
        const renderType = String(eff.renderType || '').trim();
        const isThunderboltSlash = renderType === 'EFT_THUNDERBOLT_SLASH';
        const isLightningSlash = renderType === 'EFT_LIGHTNING_SLASH';

        ctx.scale(eff.dir || 1, 1);

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
        } else {
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.50, `rgba(200,255,255,${0.8 * alpha})`);
            grad.addColorStop(1, eff.color || "rgba(255,255,255,0.9)");
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, slashW / 2, slashH / 2, 0, -Math.PI / 2, Math.PI / 2);
        ctx.ellipse(-slashW / 4, 0, slashW / 2, slashH / 2, 0, Math.PI / 2, -Math.PI / 2, true);
        ctx.fill();

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
    } else if (eff.type === 'hitSpark') {
        const renderType = String(eff.renderType || '').trim();
        const burstScale = eff.burstScale || 1;
        const core = eff.color || (renderType === 'EFT_STRIKE' ? "rgba(245,245,245,0.96)" : "rgba(241,196,15,0.95)");
        const accent = eff.accentColor || (renderType === 'EFT_STRIKE' ? "rgba(210,220,230,0.92)" : "rgba(255,255,255,0.95)");

        if (renderType === 'EFT_STRIKE') {
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
        } else if (renderType === 'EFT_PUNCH') {
            renderer.drawPunchEffect(ctx, eff, alpha);
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

        if (warningType === 'WARNING_MAGIC_CIRCLE') {
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
            ctx.fillStyle = `rgba(255, 70, 70, ${0.18 + pulse * 0.16})`;
            ctx.fillRect(-w / 2, -d / 2, w, d);

            ctx.strokeStyle = `rgba(255, 160, 160, ${0.75 * alpha})`;
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

GameRenderer.drawTargetUI = function(ctx, canvas, targetUI) {
    if (!(targetUI.timer > 0 && targetUI.monster)) return;

    let tm = targetUI.monster;
    let d = tm.d;
    let alpha = Math.min(1.0, targetUI.timer);
    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.translate(canvas.width / 2, 55);

    const monsterGrade = String(d.grade || '').trim().toUpperCase();
    const isBoss = monsterGrade.includes('BOSS') || String(tm.id || '').startsWith('B');
    let borderColor = isBoss ? '#f1c40f' : (tm.isChampion ? '#bdc3c7' : '#555');
    let borderWidth = isBoss ? 5 : (tm.isChampion ? 4 : 2);

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(-300, 0, 600, 60);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(-300, 0, 600, 60);

    if (isBoss) {
        ctx.fillStyle = "#f1c40f";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("☠️", 0, -5);
    } else if (tm.isChampion) {
        ctx.fillStyle = "#bdc3c7";
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(0, -15);
        ctx.lineTo(20, 0);
        ctx.fill();
    }

    ctx.fillStyle = "#333";
    ctx.fillRect(-290, 5, 50, 50);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-290, 5, 50, 50);
    ctx.clip();

    let w = d.bodyX * tm.scale;
    let h = d.bodyZ * tm.scale;
    let baseSize = Math.max(w, h * 0.6);
    let uiScale = 45 / baseSize;
    let offsetY = 30 + (h * 0.85 * uiScale);

    ctx.translate(-265, offsetY);
    ctx.scale(uiScale, uiScale);

    let originalDir = tm.faceDir;
    tm.faceDir = 1;
    this.drawMonsterGraphics(ctx, tm, w, h, 1.0, true);
    tm.faceDir = originalDir;

    ctx.restore();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(-290, 5, 50, 50);

    ctx.fillStyle = "white";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "left";
    let prefix = tm.isChampion ? "[엘리트] " : (isBoss ? "[보스] " : "");
    ctx.fillStyle = isBoss ? "#f1c40f" : (tm.isChampion ? "#bdc3c7" : "white");
    ctx.fillText(`Lv.${d.level} ${prefix}${d.name}`, -225, 22);

    ctx.fillStyle = "#222";
    ctx.fillRect(-225, 32, 510, 18);
    let hpRatio = Math.max(0, tm.hp) / tm.maxHp;
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(-225, 32, 510 * hpRatio, 18);

    ctx.fillStyle = "white";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.max(0, tm.hp).toFixed(0)} / ${tm.maxHp.toFixed(0)}`, 30, 45);

    ctx.restore();
    ctx.globalAlpha = 1.0;
};

GameRenderer.drawDebugOverlay = function(ctx, gameState) {
    const renderer = this;
    const { player, monsters, hitboxes, activeWarp } = gameState;
    const GROUND_BASE_Y = this.GROUND_BASE_Y;

    if (player.active && player.hp > 0) {
        let drawY = GROUND_BASE_Y + player.y;
        let pw = player.bodyX * player.scale;
        let pd = player.bodyY * player.scale;
        let ph = player.bodyZ * player.scale;

        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(player.x, drawY, pw / 2, pd / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeRect(player.x - pw / 2, drawY - player.z - ph, pw, ph);
    }

    for (let m of monsters) {
        if (m.active && m.hp > 0) {
            const d = m.d;
            const w = d.bodyX * m.scale;
            const dY = d.bodyY * m.scale;
            const h = d.bodyZ * m.scale;
            let drawY = GROUND_BASE_Y + m.y;

            ctx.strokeStyle = m.isChampion ? '#e74c3c' : renderer.resolveMonsterBodyColor(m);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(m.x, drawY, w / 2, dY / 2, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeRect(m.x - w / 2, drawY - m.z - h, w, h);

            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.beginPath();
            ctx.ellipse(m.x, drawY, d.unrecog + w / 2, (d.unrecog + w / 2) * 0.5, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = "rgba(255, 235, 59, 0.8)";
            ctx.beginPath();
            ctx.ellipse(m.x, drawY, d.recog + w / 2, (d.recog + w / 2) * 0.5, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = "rgba(255, 152, 0, 1.0)";
            ctx.beginPath();
            ctx.ellipse(m.x, drawY, d.chase + w / 2, (d.chase + w / 2) * 0.5, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = "rgba(244, 67, 54, 1.0)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.ellipse(m.x, drawY, d.atkRange + w / 2, (d.atkRange + w / 2) * 0.5, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    for (let hb of hitboxes) {
        let drawY = GROUND_BASE_Y + hb.y;
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(hb.x, drawY, hb.w / 2, hb.d / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(hb.x - hb.w / 2, drawY - hb.z - hb.h, hb.w, hb.h);
    }

    if (activeWarp) {
        const w = activeWarp;
        const x = w.x - w.w / 2;
        const y = GROUND_BASE_Y + w.y - w.h / 2;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,0,255,0.85)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w.w, w.h);
        ctx.restore();
    }
};