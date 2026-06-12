// [카시야스 보스전] 플레이어 렌더링 (player_renderer.js)

GameRenderer.drawP3OniCursePlayerAura = function(ctx, player) {
    if (!player || !player.p3OniCurse || player.p3OniCurse.active === false) return;
    const pw = Math.max(46, (parseFloat(player.bodyX) || 50) * (parseFloat(player.scale) || 1));
    const ph = Math.max(92, (parseFloat(player.bodyZ) || 100) * (parseFloat(player.scale) || 1));
    const t = Date.now() / 1000;
    const pulse = 0.5 + Math.sin(t * 6.2) * 0.5;
    const slow = 0.5 + Math.sin(t * 2.1) * 0.5;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = 26 + pulse * 18;
    ctx.shadowColor = 'rgba(115,28,190,0.86)';

    const auraW = pw * (2.30 + pulse * 0.18);
    const auraH = ph * (1.38 + slow * 0.12);
    const yOff = -ph * 0.44;

    const backGrad = ctx.createRadialGradient(0, yOff, 4, 0, yOff, auraH * 0.58);
    backGrad.addColorStop(0, `rgba(202,150,255,${0.12 + pulse * 0.05})`);
    backGrad.addColorStop(0.34, `rgba(114,44,190,${0.22 + pulse * 0.05})`);
    backGrad.addColorStop(0.70, `rgba(118,0,26,${0.13 + slow * 0.04})`);
    backGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = backGrad;
    ctx.beginPath();
    ctx.ellipse(0, yOff, auraW * 0.50, auraH * 0.54, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.74;
    for (let i = 0; i < 7; i++) {
        const phase = t * (1.2 + i * 0.12) + i * 1.77;
        const x = Math.sin(phase) * auraW * (0.16 + (i % 3) * 0.04);
        const y = yOff + Math.cos(phase * 0.7) * auraH * 0.20 + (i - 3) * auraH * 0.052;
        const len = auraH * (0.24 + (i % 2) * 0.07);
        ctx.strokeStyle = i % 2 ? `rgba(28,0,38,${0.52})` : `rgba(255,48,58,${0.34})`;
        ctx.lineWidth = i % 2 ? 5.2 : 3.1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - Math.sin(phase * 0.8) * 12, y + len * 0.42);
        ctx.bezierCurveTo(x - 20, y + len * 0.12, x + 16, y - len * 0.16, x + Math.sin(phase) * 18, y - len * 0.48);
        ctx.stroke();
    }

    ctx.globalAlpha = 0.90;
    ctx.strokeStyle = `rgba(214,164,255,${0.24 + pulse * 0.14})`;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(0, yOff + ph * 0.34, auraW * (0.26 + pulse * 0.025), ph * 0.105, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
};

GameRenderer.drawPlayerEntity = function(ctx, player) {
    const renderer = this;
    const GROUND_BASE_Y = this.GROUND_BASE_Y;

    let pw = player.bodyX * player.scale;
    let pd = player.bodyY * player.scale;
    let ph = player.bodyZ * player.scale;
    let drawY = GROUND_BASE_Y + player.y;
    let bodyY = drawY - player.z;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.ellipse(player.x, drawY, pw / 2 + 5, pd / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(player.x, bodyY);
    this.drawP3OniCursePlayerAura(ctx, player);

    if (player.state === 'Dash') ctx.rotate(player.faceDir * 15 * Math.PI / 180);
    else if (player.state === 'Run') ctx.rotate(player.faceDir * 5 * Math.PI / 180);
    else if (player.state === 'Guard') ctx.rotate(-player.faceDir * 4 * Math.PI / 180);
    else if (player.state === 'Hit') ctx.rotate(-0.2 * player.faceDir);

    const playerPalette = renderer.resolvePlayerPalette(player);

    renderer.drawModelBody(ctx, {
        renderType: player.renderType || 'RENDER_HUMAN',
        palette: playerPalette,
        w: pw,
        h: ph,
        faceDir: player.faceDir,
        state: player.state,
        isChampion: false,
        isMonster: false
    });

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";

    if (player.stance === 'Mode_Melee') {
        const weaponPalette = renderer.resolveWeaponPaletteByType(
            player.meleeWeaponRenderType
        );
        const weaponType = String(player.meleeWeaponRenderType || '').trim().toUpperCase();

        if (weaponType === 'WEAPON_LARGE_SWORD') {
            const swordX = player.faceDir === 1 ? pw * 0.42 : -pw * 0.42;
            const swordY = -ph * 0.56;
            const bladeW = Math.max(10, pw * 0.12);
            const bladeH = Math.max(44, ph * 0.46);
            const guardW = bladeW * 2.9;
            const guardH = Math.max(7, ph * 0.040);
            const gripW = Math.max(5, bladeW * 0.42);
            const gripH = Math.max(16, ph * 0.16);
            const pommelR = Math.max(4, bladeW * 0.28);

            const goldPalette = renderer.resolveWeaponPalette('COLOR_GOLD', '#f1c40f');
            const gemPalette = renderer.resolveWeaponPalette('COLOR_BLUE', '#3498db');
            const woodDark = '#5c3923';
            const woodMid = '#8a5a33';
            const woodLight = '#b07a4e';

            ctx.save();
            ctx.translate(swordX, swordY);
            ctx.rotate(player.faceDir === 1 ? 0.08 : -0.08);

            const bladeGrad = ctx.createLinearGradient(0, -bladeH * 0.60, 0, bladeH * 0.46);
            bladeGrad.addColorStop(0, weaponPalette.light);
            bladeGrad.addColorStop(0.38, weaponPalette.accent || weaponPalette.light);
            bladeGrad.addColorStop(0.72, weaponPalette.mid);
            bladeGrad.addColorStop(1, weaponPalette.dark);

            ctx.fillStyle = bladeGrad;
            ctx.beginPath();
            ctx.moveTo(0, -bladeH * 0.62);
            ctx.lineTo(bladeW * 0.48, -bladeH * 0.24);
            ctx.lineTo(bladeW * 0.28, bladeH * 0.40);
            ctx.lineTo(-bladeW * 0.28, bladeH * 0.40);
            ctx.lineTo(-bladeW * 0.48, -bladeH * 0.24);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = weaponPalette.accent || weaponPalette.light;
            ctx.beginPath();
            ctx.moveTo(0, -bladeH * 0.44);
            ctx.lineTo(bladeW * 0.10, -bladeH * 0.16);
            ctx.lineTo(bladeW * 0.06, bladeH * 0.26);
            ctx.lineTo(-bladeW * 0.06, bladeH * 0.26);
            ctx.lineTo(-bladeW * 0.10, -bladeH * 0.16);
            ctx.closePath();
            ctx.fill();

            const guardGrad = ctx.createLinearGradient(0, bladeH * 0.24, 0, bladeH * 0.48);
            guardGrad.addColorStop(0, goldPalette.light);
            guardGrad.addColorStop(0.45, goldPalette.mid);
            guardGrad.addColorStop(1, goldPalette.dark);

            ctx.fillStyle = guardGrad;
            ctx.beginPath();
            ctx.moveTo(-guardW * 0.52, bladeH * 0.34);
            ctx.lineTo(-guardW * 0.22, bladeH * 0.24);
            ctx.lineTo(-guardW * 0.08, bladeH * 0.30);
            ctx.lineTo(guardW * 0.08, bladeH * 0.30);
            ctx.lineTo(guardW * 0.22, bladeH * 0.24);
            ctx.lineTo(guardW * 0.52, bladeH * 0.34);
            ctx.lineTo(guardW * 0.42, bladeH * 0.48);
            ctx.lineTo(guardW * 0.16, bladeH * 0.40);
            ctx.lineTo(-guardW * 0.16, bladeH * 0.40);
            ctx.lineTo(-guardW * 0.42, bladeH * 0.48);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = guardGrad;
            ctx.fillRect(-guardW * 0.12, bladeH * 0.24, guardW * 0.24, guardH);
            ctx.strokeRect(-guardW * 0.12, bladeH * 0.24, guardW * 0.24, guardH);

            ctx.fillStyle = gemPalette.mid;
            ctx.beginPath();
            ctx.moveTo(0, bladeH * 0.18);
            ctx.lineTo(bladeW * 0.34, bladeH * 0.28);
            ctx.lineTo(0, bladeH * 0.38);
            ctx.lineTo(-bladeW * 0.34, bladeH * 0.28);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = gemPalette.light;
            ctx.beginPath();
            ctx.moveTo(0, bladeH * 0.21);
            ctx.lineTo(bladeW * 0.14, bladeH * 0.27);
            ctx.lineTo(0, bladeH * 0.31);
            ctx.lineTo(-bladeW * 0.14, bladeH * 0.27);
            ctx.closePath();
            ctx.fill();

            const gripGrad = ctx.createLinearGradient(0, bladeH * 0.33, 0, bladeH * 0.33 + gripH);
            gripGrad.addColorStop(0, woodLight);
            gripGrad.addColorStop(0.45, woodMid);
            gripGrad.addColorStop(1, woodDark);

            ctx.fillStyle = gripGrad;
            ctx.fillRect(-gripW / 2, bladeH * 0.33, gripW, gripH);
            ctx.strokeRect(-gripW / 2, bladeH * 0.33, gripW, gripH);

            ctx.strokeStyle = woodDark;
            ctx.lineWidth = 1.3;
            for (let i = 1; i <= 3; i++) {
                const gy = bladeH * 0.33 + (gripH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(-gripW / 2 + 1, gy);
                ctx.lineTo(gripW / 2 - 1, gy);
                ctx.stroke();
            }

            ctx.fillStyle = goldPalette.mid;
            ctx.beginPath();
            ctx.arc(0, bladeH * 0.33 + gripH + pommelR * 0.55, pommelR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = goldPalette.light;
            ctx.beginPath();
            ctx.arc(0, bladeH * 0.33 + gripH + pommelR * 0.55, pommelR * 0.46, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = weaponPalette.mid;
            ctx.beginPath();
            ctx.moveTo(0, bladeH * 0.33 + gripH + pommelR * 1.00);
            ctx.lineTo(bladeW * 0.42, bladeH * 0.33 + gripH + pommelR * 1.90);
            ctx.lineTo(0, bladeH * 0.33 + gripH + pommelR * 2.80);
            ctx.lineTo(-bladeW * 0.42, bladeH * 0.33 + gripH + pommelR * 1.90);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = gemPalette.mid;
            ctx.beginPath();
            ctx.moveTo(0, bladeH * 0.33 + gripH + pommelR * 1.32);
            ctx.lineTo(bladeW * 0.18, bladeH * 0.33 + gripH + pommelR * 1.86);
            ctx.lineTo(0, bladeH * 0.33 + gripH + pommelR * 2.32);
            ctx.lineTo(-bladeW * 0.18, bladeH * 0.33 + gripH + pommelR * 1.86);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        } else {
            let sx = player.faceDir === 1 ? pw / 2 : -pw / 2 - 5;
            let bladeColor = weaponPalette.mid;
            let guardColor = weaponPalette.dark;

            ctx.fillStyle = bladeColor;
            ctx.fillRect(sx, -ph / 2 - 20, 5, 40);
            ctx.strokeRect(sx, -ph / 2 - 20, 5, 40);

            let gx = player.faceDir === 1 ? pw / 2 - 2 : -pw / 2 - 7;
            ctx.fillStyle = guardColor;
            ctx.fillRect(gx, -ph / 2 + 5, 9, 4);
            ctx.strokeRect(gx, -ph / 2 + 5, 9, 4);
        }
    } else {
        const weaponPalette = renderer.resolveWeaponPaletteByType(
            player.rangeWeaponRenderType
        );
        const weaponType = String(player.rangeWeaponRenderType || '').trim().toUpperCase();

        if (weaponType === 'WEAPON_GUN') {
            const gunX = player.faceDir === 1 ? pw * 0.22 : -pw * 0.22;
            const gunY = -ph * 0.50;
            const gunW = Math.max(46, pw * 0.64);
            const gunH = Math.max(15, ph * 0.115);
            const barrelW = gunW * 0.50;
            const cylR = Math.max(7.5, gunH * 0.68);

            ctx.save();
            ctx.translate(gunX, gunY);
            if (player.faceDir === -1) ctx.scale(-1, 1);

            ctx.fillStyle = weaponPalette.dark;
            ctx.beginPath();
            ctx.moveTo(gunW * 0.08, gunH * 0.08);
            ctx.lineTo(gunW * 0.42, gunH * 0.08);
            ctx.lineTo(gunW * 0.49, gunH * 0.24);
            ctx.lineTo(gunW * 0.49, gunH * 0.78);
            ctx.lineTo(gunW * 0.36, gunH * 0.96);
            ctx.lineTo(gunW * 0.08, gunH * 0.96);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = weaponPalette.mid;
            ctx.fillRect(gunW * 0.30, gunH * 0.14, barrelW, gunH * 0.46);
            ctx.strokeRect(gunW * 0.30, gunH * 0.14, barrelW, gunH * 0.46);

            ctx.fillStyle = weaponPalette.accent || weaponPalette.light;
            ctx.fillRect(gunW * 0.35, gunH * 0.24, barrelW * 0.72, gunH * 0.12);

            ctx.fillStyle = weaponPalette.mid;
            ctx.beginPath();
            ctx.arc(gunW * 0.28, gunH * 0.42, cylR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = weaponPalette.light;
            ctx.beginPath();
            ctx.arc(gunW * 0.28, gunH * 0.42, cylR * 0.40, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = weaponPalette.dark;
            ctx.beginPath();
            ctx.moveTo(gunW * 0.08, gunH * 0.78);
            ctx.lineTo(gunW * 0.26, gunH * 0.78);
            ctx.lineTo(gunW * 0.19, gunH * 1.82);
            ctx.lineTo(gunW * 0.00, gunH * 1.58);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#5c3923";
            ctx.beginPath();
            ctx.moveTo(gunW * 0.09, gunH * 0.88);
            ctx.lineTo(gunW * 0.21, gunH * 0.88);
            ctx.lineTo(gunW * 0.16, gunH * 1.50);
            ctx.lineTo(gunW * 0.04, gunH * 1.38);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = weaponPalette.dark;
            ctx.fillRect(gunW * 0.17, -gunH * 0.14, gunW * 0.14, gunH * 0.18);
            ctx.strokeRect(gunW * 0.17, -gunH * 0.14, gunW * 0.14, gunH * 0.18);

            ctx.fillStyle = weaponPalette.accent || weaponPalette.light;
            ctx.fillRect(gunW * 0.74, gunH * 0.24, gunW * 0.11, gunH * 0.07);

            ctx.restore();
        } else {
            let gunX = player.faceDir === 1 ? pw / 2 : -pw / 2 - 20;
            let gunColor = weaponPalette.mid;
            let gripColor = weaponPalette.dark;

            ctx.fillStyle = gunColor;
            ctx.fillRect(gunX, -ph / 2, 20, 6);
            ctx.strokeRect(gunX, -ph / 2, 20, 6);

            let gripX = player.faceDir === 1 ? pw / 2 : -pw / 2 - 5;
            ctx.fillStyle = gripColor;
            ctx.fillRect(gripX, -ph / 2 + 6, 6, 8);
            ctx.strokeRect(gripX, -ph / 2 + 6, 6, 8);
        }
    }


    if (player.state === 'Guard' || player.guardTimer > 0 || player.guardSuccessTimer > 0) {
        const guardRatio = player.maxGuardTimer > 0 ? Math.max(0, Math.min(1, player.guardTimer / player.maxGuardTimer)) : 0;
        const successRatio = player.guardSuccessTimer > 0 ? Math.max(0, Math.min(1, player.guardSuccessTimer / 0.32)) : 0;
        const guardPulse = 1 + Math.sin((Date.now() % 720) / 720 * Math.PI * 2) * 0.035;
        const hitPulse = successRatio > 0 ? 1 + successRatio * 0.20 : 1;
        const shieldW = Math.max(94, pw * 1.62) * guardPulse * hitPulse;
        const shieldH = Math.max(118, ph * 1.02) * guardPulse * hitPulse;
        const face = player.faceDir === -1 ? -1 : 1;
        const centerX = face * (pw * 0.58);
        const centerY = -ph * 0.50;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(face, 1);
        ctx.globalAlpha = successRatio > 0 ? 0.94 : 0.62;
        ctx.shadowBlur = successRatio > 0 ? 24 : 14;
        ctx.shadowColor = successRatio > 0 ? 'rgba(255,236,132,0.82)' : 'rgba(110,205,255,0.55)';

        const panelGrad = ctx.createRadialGradient(shieldW * 0.10, -shieldH * 0.22, shieldW * 0.05, 0, 0, shieldW * 0.60);
        panelGrad.addColorStop(0, successRatio > 0 ? 'rgba(255,255,224,0.34)' : 'rgba(255,255,255,0.22)');
        panelGrad.addColorStop(0.42, successRatio > 0 ? 'rgba(255,226,95,0.22)' : 'rgba(105,210,255,0.18)');
        panelGrad.addColorStop(1, 'rgba(40,120,255,0.02)');
        ctx.fillStyle = panelGrad;
        ctx.beginPath();
        ctx.moveTo(-shieldW * 0.15, -shieldH * 0.48);
        ctx.quadraticCurveTo(shieldW * 0.52, -shieldH * 0.38, shieldW * 0.52, 0);
        ctx.quadraticCurveTo(shieldW * 0.52, shieldH * 0.38, -shieldW * 0.15, shieldH * 0.48);
        ctx.quadraticCurveTo(shieldW * 0.06, 0, -shieldW * 0.15, -shieldH * 0.48);
        ctx.closePath();
        ctx.fill();

        ctx.lineWidth = successRatio > 0 ? 4.2 : 3.0;
        ctx.strokeStyle = successRatio > 0 ? 'rgba(255,246,168,0.96)' : 'rgba(135,226,255,0.88)';
        ctx.beginPath();
        ctx.moveTo(-shieldW * 0.12, -shieldH * 0.48);
        ctx.quadraticCurveTo(shieldW * 0.58, -shieldH * 0.35, shieldW * 0.56, 0);
        ctx.quadraticCurveTo(shieldW * 0.58, shieldH * 0.35, -shieldW * 0.12, shieldH * 0.48);
        ctx.stroke();

        ctx.globalAlpha = successRatio > 0 ? 0.82 : 0.42;
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = successRatio > 0 ? 'rgba(255,255,255,0.92)' : 'rgba(225,248,255,0.66)';
        for (let i = 0; i < 3; i++) {
            const k = 0.24 + i * 0.18;
            ctx.beginPath();
            ctx.moveTo(shieldW * (0.02 + i * 0.03), -shieldH * (0.35 - i * 0.03));
            ctx.quadraticCurveTo(shieldW * (0.32 + k * 0.2), 0, shieldW * (0.02 + i * 0.03), shieldH * (0.35 - i * 0.03));
            ctx.stroke();
        }

        if (successRatio > 0) {
            const burst = 1 - successRatio;
            ctx.globalAlpha = 0.92 * successRatio;
            ctx.lineWidth = 2.3;
            ctx.strokeStyle = 'rgba(255,255,230,0.96)';
            for (let i = 0; i < 9; i++) {
                const y = -shieldH * 0.40 + i * shieldH * 0.10;
                const x1 = shieldW * (0.38 + burst * 0.08);
                const x2 = shieldW * (0.60 + burst * 0.24);
                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y + (i % 2 === 0 ? -6 : 6));
                ctx.stroke();
            }
        }

        if (guardRatio > 0) {
            ctx.globalAlpha = 0.95;
            ctx.fillStyle = successRatio > 0 ? 'rgba(255,248,180,0.92)' : 'rgba(225,248,255,0.78)';
            ctx.font = 'bold 13px "Malgun Gothic", "맑은 고딕", sans-serif';
            ctx.textAlign = 'center';
            ctx.scale(face, 1);
            ctx.fillText('GUARD', centerX * -0.04, -shieldH * 0.62);
        }

        ctx.restore();
    }


    if (player.state === 'Freeze') {
        ctx.fillStyle = "rgba(173, 216, 230, 0.7)";
        ctx.fillRect(-pw / 2 - 10, -ph - 10, pw + 20, ph + 20);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(-pw / 2 - 10, -ph - 10, pw + 20, ph + 20);

        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.moveTo(-pw / 2 - 5, -ph - 5);
        ctx.lineTo(-pw / 4, -ph + 15);
        ctx.lineTo(-pw / 2 + 10, -ph + 5);
        ctx.fill();

        let fRatio = player.maxFreezeTimer > 0 ? player.freezeTimer / player.maxFreezeTimer : 0;
        let uiX = player.faceDir === 1 ? -pw / 2 - 60 : pw / 2 + 60;
        let uiY = -ph - 40;
        let barW = 100;
        let barH = 12;

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(uiX - barW / 2, uiY, barW, barH);
        ctx.fillStyle = "#00ffff";
        ctx.fillRect(uiX - barW / 2, uiY, barW * fRatio, barH);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(uiX - barW / 2, uiY, barW, barH);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(Math.max(0, player.freezeTimer).toFixed(1) + "s", uiX, uiY - 10);

        if (Math.floor(Date.now() / 150) % 2 === 0) {
            ctx.fillStyle = "#ffeb3b";
            ctx.font = "bold 18px sans-serif";
            ctx.fillText("방향키 연타!!", uiX, uiY - 32);
        }
    }

    ctx.restore();

    if (typeof this.drawPlayerKasiyasOniMark === 'function') {
        this.drawPlayerKasiyasOniMark(ctx, player, bodyY, ph);
    }

    if (typeof this.drawPlayerApostleEnergyAura === 'function') {
        this.drawPlayerApostleEnergyAura(ctx, player, bodyY, ph);
    }

    if (player.stanceSwapTimer > 0 || player.rapidAtkCooldownTimer > 0 || player.rapidAtkAllowTimer > 0 || player.guardCooldownTimer > 0) {
        let cdRatio = 0;
        let cdColor = "#fff";

        if (player.guardCooldownTimer > 0) {
            cdRatio = player.maxGuardCooldown > 0 ? player.guardCooldownTimer / player.maxGuardCooldown : 0;
            cdColor = "#8fd3ff";
        } else if (player.stanceSwapTimer > 0) {
            cdRatio = player.stanceSwapTimer / player.maxStanceSwap;
            cdColor = "#3498db";
        } else if (player.rapidAtkCooldownTimer > 0) {
            cdRatio = player.rapidAtkCooldownTimer / player.maxRapidAtkCd;
            cdColor = "#e74c3c";
        } else if (player.rapidAtkAllowTimer > 0) {
            cdRatio = player.rapidAtkAllowTimer / player.maxRapidAllow;
            cdColor = "#f1c40f";
        }

        let py = bodyY - ph - 25;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.arc(player.x, py, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = cdColor;
        ctx.beginPath();
        ctx.moveTo(player.x, py);
        ctx.arc(player.x, py, 12, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * cdRatio));
        ctx.fill();
    }
};



GameRenderer.drawPlayerKasiyasOniMark = function(ctx, player, bodyY, bodyH) {
    const mark = player && player.kasiyasOniMark ? player.kasiyasOniMark : null;
    const tempered = !!(player && player.kasiyasTemperedBladeReady);
    if ((!mark || !mark.active) && !tempered) return;

    const now = Date.now();
    const pulse = 0.5 + Math.sin(now / (mark && mark.pulse ? 72 : 180)) * 0.5;
    const flash = Math.max(0, Math.min(1, parseFloat(mark && mark.flashTimer) || parseFloat(player.kasiyasTemperedBladeFlashTimer) || 0));
    const x = player.x;
    const y = bodyY - bodyH * 1.22;
    const scale = (mark && mark.pulse ? 1.16 : 1.0) + pulse * (mark && mark.pulse ? 0.18 : 0.07) + flash * 0.10;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (tempered && (!mark || !mark.active)) {
        // 연단된 칼날의 가능성은 낙인과 다른 보상 상태이므로 별도 금색/백색 검기 이펙트로 표시한다.
        ctx.globalAlpha = 0.78 + pulse * 0.20;
        ctx.shadowBlur = 24 + pulse * 12;
        ctx.shadowColor = 'rgba(255,236,112,0.98)';
        ctx.strokeStyle = 'rgba(255,236,112,0.96)';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 32 + pulse * 4, 15 + pulse * 2, Date.now() / 780, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(148,232,255,0.74)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 25 + pulse * 3, 35 + pulse * 4, -Date.now() / 920, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,248,180,0.24)';
        ctx.beginPath();
        ctx.moveTo(0, -27); ctx.lineTo(20, 0); ctx.lineTo(0, 27); ctx.lineTo(-20, 0); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,230,0.95)';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-22, 8);
        ctx.lineTo(23, -10);
        ctx.moveTo(-10, -24);
        ctx.lineTo(12, 22);
        ctx.stroke();
        for (let i = 0; i < 5; i++) {
            const a = Date.now() / 420 + i * Math.PI * 2 / 5;
            const rx = Math.cos(a) * (32 + pulse * 4);
            const ry = Math.sin(a) * (18 + pulse * 3);
            ctx.fillStyle = i % 2 ? 'rgba(145,232,255,0.78)' : 'rgba(255,242,130,0.86)';
            ctx.beginPath();
            ctx.arc(rx, ry, 2.8 + pulse * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        return;
    }

    ctx.globalAlpha = 0.78 + pulse * 0.18 + flash * 0.18;
    ctx.shadowBlur = mark && mark.pulse ? 24 : 15;
    ctx.shadowColor = mark && mark.pulse ? 'rgba(255,38,44,0.98)' : 'rgba(150,0,0,0.88)';
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 30);
    grad.addColorStop(0, 'rgba(255,210,120,0.90)');
    grad.addColorStop(0.38, 'rgba(255,38,48,0.78)');
    grad.addColorStop(1, 'rgba(24,0,0,0.12)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = mark && mark.pulse ? 'rgba(255,230,120,0.95)' : 'rgba(255,68,68,0.92)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(21, 0);
    ctx.lineTo(0, 25);
    ctx.lineTo(-21, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = 'rgba(30,0,0,0.95)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-10, -4);
    ctx.quadraticCurveTo(0, -18, 10, -4);
    ctx.moveTo(-12, 6);
    ctx.quadraticCurveTo(0, 18, 12, 6);
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 20);
    ctx.stroke();

    const stack = Math.max(0, parseInt(mark && mark.stack) || 0);
    const maxStack = Math.max(1, parseInt(mark && mark.maxStack) || 3);
    for (let i = 0; i < maxStack; i++) {
        const dotX = (i - (maxStack - 1) / 2) * 11;
        ctx.globalAlpha = i < stack ? 0.95 : 0.28;
        ctx.fillStyle = i < stack ? 'rgba(255,236,120,0.95)' : 'rgba(255,80,80,0.55)';
        ctx.beginPath();
        ctx.arc(dotX, 34, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
};

GameRenderer.getPlayerApostleEnergyColor = function(value) {
    const key = String(value || '').trim().toUpperCase();
    if (key === 'APOSTLE_YELLOW') return { color: 'rgba(255,216,70,0.94)', edge: 'rgba(255,246,170,0.92)' };
    if (key === 'APOSTLE_BLACK') return { color: 'rgba(152,84,255,0.90)', edge: 'rgba(232,214,255,0.82)' };
    return { color: 'rgba(255,78,66,0.94)', edge: 'rgba(255,226,196,0.86)' };
};

GameRenderer.drawPlayerApostleEnergyAura = function(ctx, player, bodyY, bodyH) {
    const energies = Array.isArray(player && player.kasiyasApostleEnergies) ? player.kasiyasApostleEnergies.filter(Boolean) : [];
    if (!player || energies.length <= 0) return;

    const sameColor = energies.length >= 2 && energies[0] === energies[1];
    const pulse = 0.5 + Math.sin(Date.now() / 150) * 0.5;
    const flash = Math.max(0, Math.min(1, parseFloat(player.kasiyasApostleEnergyFlashTimer) || 0));
    const centerX = player.x;
    const centerY = bodyY - bodyH * 1.08;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    if (sameColor) {
        const info = this.getPlayerApostleEnergyColor(energies[0]);
        ctx.globalAlpha = 0.45 + pulse * 0.20 + flash * 0.12;
        ctx.strokeStyle = info.color;
        ctx.lineWidth = 3.0;
        ctx.shadowBlur = 14 + pulse * 10;
        ctx.shadowColor = info.color;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 44 + pulse * 5, 24 + pulse * 3, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.30 + pulse * 0.18;
        ctx.fillStyle = info.color;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 32 + pulse * 5, 18 + pulse * 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    energies.forEach((energy, idx) => {
        const info = this.getPlayerApostleEnergyColor(energy);
        const count = energies.length;
        const angle = Date.now() / 520 + idx * (Math.PI * 2 / Math.max(1, count)) + (sameColor ? 0.3 : 0);
        const rx = sameColor ? 44 : 34;
        const ry = sameColor ? 24 : 20;
        const x = centerX + Math.cos(angle) * rx;
        const y = centerY + Math.sin(angle) * ry;
        const r = sameColor ? 8 + pulse * 1.8 : 7 + pulse * 1.2;

        ctx.globalAlpha = sameColor ? 0.96 : 0.86;
        ctx.shadowBlur = sameColor ? 18 : 12;
        ctx.shadowColor = info.color;
        ctx.fillStyle = info.color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = info.edge;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, Math.PI * 2);
        ctx.stroke();
    });

    ctx.restore();
};

