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
        drawStableWeapon();
    }

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
};