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