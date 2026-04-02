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

    if (player.state === 'Dash') ctx.rotate(player.faceDir * 15 * Math.PI / 180);
    else if (player.state === 'Hit') ctx.rotate(-0.2 * player.faceDir);

    const playerPalette = renderer.resolvePlayerPalette(player.renderColor);

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
        const weaponPalette = renderer.resolveWeaponPalette(
            player.meleeWeaponRenderColor,
            "#95a5a6"
        );
        const weaponType = String(player.meleeWeaponRenderType || '').trim().toUpperCase();

        if (weaponType === 'WEAPON_LARGE_SWORD') {
            let sx = player.faceDir === 1 ? pw * 0.30 : -pw * 0.30;
            let bladeW = Math.max(8, pw * 0.12);
            let bladeH = Math.max(40, ph * 0.52);

            ctx.save();
            ctx.translate(sx, -ph * 0.50);
            ctx.rotate(player.faceDir === 1 ? 0.18 : -0.18);

            let bladeGrad = ctx.createLinearGradient(0, -bladeH / 2, 0, bladeH / 2);
            bladeGrad.addColorStop(0, weaponPalette.light);
            bladeGrad.addColorStop(0.45, weaponPalette.mid);
            bladeGrad.addColorStop(1, weaponPalette.dark);

            ctx.fillStyle = bladeGrad;
            ctx.beginPath();
            ctx.moveTo(-bladeW * 0.40, bladeH * 0.46);
            ctx.lineTo(-bladeW * 0.48, -bladeH * 0.18);
            ctx.lineTo(0, -bladeH * 0.56);
            ctx.lineTo(bladeW * 0.48, -bladeH * 0.18);
            ctx.lineTo(bladeW * 0.40, bladeH * 0.46);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = weaponPalette.accent;
            ctx.fillRect(-bladeW * 0.14, -bladeH * 0.34, bladeW * 0.28, bladeH * 0.62);

            ctx.fillStyle = weaponPalette.dark;
            ctx.fillRect(-bladeW * 1.05, bladeH * 0.32, bladeW * 2.1, Math.max(5, ph * 0.035));
            ctx.strokeRect(-bladeW * 1.05, bladeH * 0.32, bladeW * 2.1, Math.max(5, ph * 0.035));

            ctx.fillStyle = "#5b3a29";
            ctx.fillRect(-bladeW * 0.22, bladeH * 0.34, bladeW * 0.44, Math.max(16, ph * 0.18));
            ctx.strokeRect(-bladeW * 0.22, bladeH * 0.34, bladeW * 0.44, Math.max(16, ph * 0.18));

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
        const weaponPalette = renderer.resolveWeaponPalette(
            player.rangeWeaponRenderColor,
            "#2c3e50"
        );
        const weaponType = String(player.rangeWeaponRenderType || '').trim().toUpperCase();

        if (weaponType === 'WEAPON_GUN') {
            let gunX = player.faceDir === 1 ? pw * 0.28 : -pw * 0.28;
            let gunY = -ph * 0.48;
            let gunW = Math.max(24, pw * 0.34);
            let gunH = Math.max(9, ph * 0.08);

            ctx.save();
            ctx.translate(gunX, gunY);
            if (player.faceDir === -1) ctx.scale(-1, 1);

            ctx.fillStyle = weaponPalette.mid;
            ctx.fillRect(0, 0, gunW, gunH);
            ctx.strokeRect(0, 0, gunW, gunH);

            ctx.fillStyle = weaponPalette.dark;
            ctx.fillRect(gunW * 0.62, -gunH * 0.18, gunW * 0.30, gunH * 0.30);
            ctx.strokeRect(gunW * 0.62, -gunH * 0.18, gunW * 0.30, gunH * 0.30);

            ctx.fillStyle = weaponPalette.light;
            ctx.fillRect(gunW * 0.10, gunH * 0.18, gunW * 0.36, gunH * 0.22);

            ctx.fillStyle = weaponPalette.dark;
            ctx.beginPath();
            ctx.moveTo(gunW * 0.28, gunH);
            ctx.lineTo(gunW * 0.50, gunH);
            ctx.lineTo(gunW * 0.38, gunH + gunH * 1.35);
            ctx.lineTo(gunW * 0.18, gunH + gunH * 1.12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

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

    if (player.stanceSwapTimer > 0 || player.rapidAtkCooldownTimer > 0 || player.rapidAtkAllowTimer > 0) {
        let cdRatio = 0;
        let cdColor = "#fff";

        if (player.stanceSwapTimer > 0) {
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