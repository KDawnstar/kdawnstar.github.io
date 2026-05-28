// [카시야스 보스전] 보스 패턴 오브젝트 렌더링 담당 파일 (boss_object_renderer.js)
GameRenderer.drawBossPatternObjectEntity = function(ctx, obj) {
    if (!obj || !obj.active) return;
    if (obj.kasiyasP1M3RushHidden) return;

    const objectRenderTypeRaw = String(obj.renderType || obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase();
    const objectTypeRaw = String(obj.data && obj.data.Object_Type || '').trim().toUpperCase();
    if (obj.kind === 'collectible' || objectRenderTypeRaw === 'OBJ_APOSTLE_ENERGY' || objectTypeRaw === 'APOSTLE_ENERGY') {
        if (typeof this.drawApostleEnergyObject === 'function') {
            this.drawApostleEnergyObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'interactiveSword' || objectTypeRaw === 'OBJECT_SWORD' || objectRenderTypeRaw.indexOf('ENERGY_SWORD') >= 0) {
        if (typeof this.drawKasiyasEnergySwordObject === 'function') {
            this.drawKasiyasEnergySwordObject(ctx, obj);
        }
        return;
    }

    if (!obj.d) return;

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
    const identityEffect = String(action.VFX_Type || action.Effect_Render_Type || '').trim().toUpperCase();
    const objectRenderType = String(obj.renderType || obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase();
    const isCloneObject = objectRenderType === 'OBJ_KASIYAS_CLONE' || String(obj.data && obj.data.Object_Type || '').trim().toUpperCase().includes('CLONE');
    const poseType = this.normalizeKasiyasPoseType(action.Action_Pose_Type || obj.poseType || 'POSE_DEFAULT');
    const duration = (typeof MonsterManager !== 'undefined' && MonsterManager.getBossObjectActionDuration)
        ? MonsterManager.getBossObjectActionDuration(action)
        : (parseFloat(action.Action_Anim_Duration) || 0.5);
    const progress = Math.max(0, Math.min(1, (parseFloat(obj.actionTimer) || 0) / Math.max(0.001, duration)));

    if (isCloneObject && typeof this.drawKasiyasGroundShadow === 'function') {
        // 대형 패턴 1번 본체/분신 그림자는 같은 함수로 그려 크기/색/명도 차이가 나지 않게 한다.
        this.drawKasiyasGroundShadow(ctx, obj.x, drawY, w, dY, 1);
    } else {
        ctx.save();
        ctx.globalAlpha = Math.min(1, 0.14 * opacity);
        ctx.fillStyle = 'rgba(120,190,255,1)';
        ctx.beginPath();
        ctx.ellipse(obj.x, drawY, w * 0.58, dY * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha *= opacity;
    if ('filter' in ctx) ctx.filter = isCloneObject ? `brightness(${brightness}) saturate(1.15) contrast(1.05)` : `brightness(${brightness}) saturate(0.75)`;

    ctx.save();
    ctx.translate(obj.x, bodyY);
    const ownerArmor = (typeof this.isOwnerBossArmorEffectActive === 'function') ? this.isOwnerBossArmorEffectActive(obj.owner) : false;
    const actionDefence = String(action.Action_Defence_Type || action.Defence_Type || '').trim().toUpperCase();
    const objectArmor = ownerArmor || actionDefence === 'SUPER_ARMOR' || actionDefence === 'INVINCIBLE';
    if (objectArmor && typeof this.drawKasiyasArmorOutline === 'function') {
        this.drawKasiyasArmorOutline(ctx, w, h, opacity);
    }
    this.drawKasiyasModel(ctx, {
        m: { boss: { action: { Action_Move_Type: action.Move_Type || action.Action_Move_Type || '', Move_Type: action.Move_Type || '', VFX_Type: action.VFX_Type || action.Effect_Render_Type || '', Effect_Render_Type: action.Effect_Render_Type || action.VFX_Type || '' } } },
        d: d,
        renderType: d.renderType || d.Model_Render_Type || 'RENDER_KASIYAS_P1',
        w: w,
        h: h,
        face: obj.faceDir || 1,
        stateKey: 'ATK_MELEE',
        poseType: poseType,
        progress: progress,
        eyeEffectType: action.VFX_Type || action.Effect_Render_Type || '',
        isUI: false
    });
    ctx.restore();

    if ('filter' in ctx) ctx.filter = 'none';
    ctx.restore();

    if ((identityEffect === 'EFT_KASIYAS_REAL_EYES' || identityEffect === 'EFT_CLONE_EYES') && typeof this.drawKasiyasIdentityCue === 'function') {
        this.drawKasiyasIdentityCue(ctx, obj.x, bodyY, h, identityEffect === 'EFT_KASIYAS_REAL_EYES');
    }
    if ((identityEffect === 'EFT_KASIYAS_ENERGY_CHARGE_STRONG' || identityEffect === 'EFT_KASIYAS_ENERGY_CHARGE_CLONE') && typeof this.drawKasiyasEnergyChargeCue === 'function') {
        this.drawKasiyasEnergyChargeCue(ctx, obj.x, bodyY, h, identityEffect === 'EFT_KASIYAS_ENERGY_CHARGE_STRONG');
    }

    const actionType = String(action.Action_Type || '').trim().toUpperCase();
    const rawPose = String(action.Action_Pose_Type || '').trim().toUpperCase();
    if (actionType === 'WARNING' && rawPose === 'POSE_KASIYAS_SLAM_THE_SWORD_DOWN_READY') {
        this.drawBossObjectSlamGauge(ctx, obj, bodyY, h, progress);
    }
};

GameRenderer.drawBossObjectSlamGauge = function(ctx, obj, bodyY, h, progress) {
    const p = Math.max(0, Math.min(1, progress || 0));
    const x = parseFloat(obj.x) || 0;
    const y = bodyY - h * 1.04;
    const w = 76;
    const hh = 9;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.strokeStyle = 'rgba(255,230,170,0.82)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    this.roundRect(ctx, x - w / 2, y, w, hh, 4);
    ctx.fill();
    ctx.stroke();

    const grad = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
    grad.addColorStop(0, 'rgba(255,160,70,0.95)');
    grad.addColorStop(0.72, 'rgba(255,220,90,0.95)');
    grad.addColorStop(1, 'rgba(255,64,48,0.95)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    this.roundRect(ctx, x - w / 2 + 2, y + 2, Math.max(0, (w - 4) * p), hh - 4, 3);
    ctx.fill();

    if (p > 0.78) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,72,48,${0.35 + Math.sin(Date.now() / 80) * 0.18})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        this.roundRect(ctx, x - w / 2 - 2, y - 2, w + 4, hh + 4, 5);
        ctx.stroke();
    }
    ctx.restore();
};

GameRenderer.drawApostleEnergyObject = function(ctx, obj) {
    const drawY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const z = parseFloat(obj.z) || 0;
    const bodyY = drawY - z;
    const t = 0.5 + Math.sin(Date.now() / 180) * 0.5;
    const r = Math.max(18, parseFloat(obj.radius) || 32);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.88;

    ctx.fillStyle = `rgba(70,0,0,${0.18 + t * 0.06})`;
    ctx.beginPath();
    ctx.ellipse(obj.x, drawY, r * 0.72, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(obj.x, bodyY - r * 0.55);
    ctx.shadowBlur = 18 + t * 10;
    ctx.shadowColor = 'rgba(255,44,32,0.78)';

    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
    grad.addColorStop(0, 'rgba(255,225,160,0.92)');
    grad.addColorStop(0.36, 'rgba(255,58,42,0.72)');
    grad.addColorStop(0.78, 'rgba(94,0,0,0.38)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r * (0.72 + t * 0.08), 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255,126,88,${0.58 + t * 0.25})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, -0.9 + t * 0.4, Math.PI * 1.35 + t * 0.4);
    ctx.stroke();

    ctx.restore();
};


GameRenderer.getKasiyasEnergySwordPalette = function(valueOrRenderType) {
    const key = String(valueOrRenderType || '').trim().toUpperCase();
    if (key.indexOf('YELLOW') >= 0) {
        return {
            core: 'rgba(255,236,150,0.96)',
            mid: 'rgba(255,204,56,0.88)',
            dark: 'rgba(122,76,0,0.78)',
            glow: 'rgba(255,215,64,0.82)',
            label: '#ffe680'
        };
    }
    if (key.indexOf('BLACK') >= 0) {
        return {
            core: 'rgba(218,196,255,0.92)',
            mid: 'rgba(137,82,238,0.78)',
            dark: 'rgba(22,0,36,0.86)',
            glow: 'rgba(142,76,255,0.76)',
            label: '#caa8ff'
        };
    }
    return {
        core: 'rgba(255,218,190,0.94)',
        mid: 'rgba(255,70,58,0.84)',
        dark: 'rgba(90,0,0,0.82)',
        glow: 'rgba(255,72,58,0.78)',
        label: '#ff8a7b'
    };
};

GameRenderer.drawKasiyasEnergySwordObject = function(ctx, obj) {
    const drawY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const z = parseFloat(obj.z) || 0;
    const bodyY = drawY - z;
    const t = 0.5 + Math.sin(Date.now() / 180 + (parseFloat(obj.x) || 0) * 0.01) * 0.5;
    const disabled = !!obj.disabled || !!obj.absorbed;
    const canInteract = !!obj.canInteract && !disabled;
    const nearestInteract = !!obj.nearestInteractTarget && canInteract;
    const palette = this.getKasiyasEnergySwordPalette(obj.getEffectValue || obj.renderType || obj.data && obj.data.Object_Get_Effect_Value || obj.data && obj.data.Object_Render_Type);
    const alpha = disabled ? 0.48 : 0.98;
    const pulse = nearestInteract ? (0.65 + Math.sin(Date.now() / 95) * 0.35) : t;
    const rangeX = Math.max(28, parseFloat(obj.getRangeX) || parseFloat(obj.data && obj.data.Object_Get_Range_X) || 120);
    const rangeY = Math.max(18, parseFloat(obj.getRangeY) || parseFloat(obj.data && obj.data.Object_Get_Range_Y) || 80);

    ctx.save();
    ctx.globalAlpha = alpha;

    // 지면에 검이 꽂힌 위치. 내려찍기 충격파에서 남은 일본도라는 인상을 주기 위해
    // 손잡이가 위, 칼날이 아래로 박힌 실루엣으로 그린다.
    const groundX = parseFloat(obj.x) || 0;
    const groundY = drawY;
    const tilt = -0.20;

    ctx.fillStyle = disabled ? 'rgba(0,0,0,0.34)' : 'rgba(0,0,0,0.52)';
    ctx.beginPath();
    ctx.ellipse(groundX, groundY + 3, 52 + (canInteract ? pulse * 10 : 0), 16 + (canInteract ? pulse * 3 : 0), 0, 0, Math.PI * 2);
    ctx.fill();

    if (!disabled) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = nearestInteract ? 32 + pulse * 12 : (canInteract ? 22 + t * 8 : 14 + t * 6);
        ctx.shadowColor = palette.glow;
        ctx.globalAlpha = nearestInteract ? 0.36 + pulse * 0.18 : (canInteract ? 0.22 + t * 0.08 : 0.12 + t * 0.05);
        ctx.fillStyle = palette.dark;
        ctx.beginPath();
        // Object_Get_Range_X/Y는 반지름처럼 사용한다. 데이터 값을 바꾸면 회수 가능 범위 표시도 함께 바뀐다.
        ctx.ellipse(groundX, groundY, rangeX, rangeY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = nearestInteract ? 0.78 : (canInteract ? 0.42 : 0.22);
        ctx.strokeStyle = palette.glow;
        ctx.lineWidth = nearestInteract ? 3.2 : (canInteract ? 2.2 : 1.4);
        ctx.beginPath();
        ctx.ellipse(groundX, groundY, rangeX, rangeY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    ctx.save();
    ctx.translate(groundX, bodyY);
    ctx.rotate(tilt);

    // 칼날: 지면에 박힌 끝은 아래에 숨기고, 위로 길게 드러난 얇은 일본도 실루엣.
    const bladeBottom = -4;
    const bladeTop = -92;
    const bladeW = 7.0;
    const bladeGrad = ctx.createLinearGradient(0, bladeTop, 0, bladeBottom);
    bladeGrad.addColorStop(0, disabled ? 'rgba(118,118,126,0.72)' : 'rgba(246,250,255,0.94)');
    bladeGrad.addColorStop(0.45, disabled ? 'rgba(86,86,92,0.70)' : 'rgba(176,210,234,0.88)');
    bladeGrad.addColorStop(1, disabled ? 'rgba(45,45,50,0.82)' : 'rgba(88,116,138,0.86)');
    ctx.fillStyle = bladeGrad;
    ctx.strokeStyle = disabled ? 'rgba(18,18,22,0.82)' : 'rgba(0,0,0,0.82)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, bladeTop - 14);
    ctx.quadraticCurveTo(bladeW * 1.45, bladeTop + 18, bladeW, bladeBottom);
    ctx.lineTo(-bladeW, bladeBottom);
    ctx.quadraticCurveTo(-bladeW * 1.15, bladeTop + 20, 0, bladeTop - 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = disabled ? 'rgba(210,210,220,0.25)' : 'rgba(255,255,255,0.74)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(2, bladeTop + 4);
    ctx.quadraticCurveTo(5, bladeTop + 38, 3, bladeBottom - 8);
    ctx.stroke();

    // 작은 츠바와 손잡이. 카시야스의 검처럼 어두운 손잡이 + 금색 가드 느낌.
    const guardY = bladeTop + 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.86)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-19, guardY);
    ctx.lineTo(19, guardY);
    ctx.stroke();
    ctx.strokeStyle = disabled ? 'rgba(106,96,72,0.70)' : 'rgba(218,168,54,0.92)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-18, guardY);
    ctx.lineTo(18, guardY);
    ctx.stroke();

    const handleTop = guardY - 38;
    ctx.strokeStyle = 'rgba(0,0,0,0.88)';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, guardY - 2);
    ctx.lineTo(0, handleTop);
    ctx.stroke();
    ctx.strokeStyle = disabled ? 'rgba(42,42,46,0.82)' : 'rgba(69,38,24,0.92)';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(0, guardY - 2);
    ctx.lineTo(0, handleTop);
    ctx.stroke();
    ctx.fillStyle = disabled ? 'rgba(100,100,106,0.70)' : 'rgba(215,166,58,0.92)';
    ctx.beginPath();
    ctx.arc(0, handleTop - 4, 4.8, 0, Math.PI * 2);
    ctx.fill();

    if (!disabled) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = palette.glow;
        ctx.lineWidth = nearestInteract ? 2.8 : (canInteract ? 2.1 : 1.6);
        ctx.globalAlpha = nearestInteract ? 0.76 : (canInteract ? 0.52 : 0.36);
        ctx.beginPath();
        ctx.moveTo(-13, bladeTop + 4);
        ctx.quadraticCurveTo(-32, -58, -16, -16);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(13, bladeTop + 4);
        ctx.quadraticCurveTo(32, -58, 16, -16);
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();

    if (!disabled) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = palette.glow;
        for (let i = 0; i < (nearestInteract ? 8 : (canInteract ? 6 : 5)); i++) {
            const a = Date.now() / 430 + i * Math.PI * 0.42;
            const px = groundX + Math.cos(a) * (26 + i * 2.2);
            const py = bodyY - 48 + Math.sin(a * 1.3) * 24;
            ctx.globalAlpha = alpha * (nearestInteract ? 0.46 : (canInteract ? 0.32 : 0.22 + t * 0.18));
            ctx.beginPath();
            ctx.arc(px, py, 2.1 + (i % 2), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    if (nearestInteract) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = 'rgba(0,0,0,0.66)';
        ctx.strokeStyle = palette.glow;
        ctx.lineWidth = 1.5;
        const boxW = 62;
        const boxH = 23;
        const boxX = groundX - boxW / 2;
        const boxY = bodyY - 152;
        ctx.beginPath();
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff6d0';
        ctx.font = 'bold 13px Malgun Gothic, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('X 흡수', groundX, boxY + 16);
        ctx.restore();
    } else if (disabled) {
        ctx.save();
        ctx.fillStyle = 'rgba(210,210,220,0.28)';
        ctx.font = 'bold 12px Malgun Gothic, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('흡수됨', groundX, bodyY - 118);
        ctx.restore();
    }

    ctx.restore();
};

