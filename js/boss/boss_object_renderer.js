// [카시야스 보스전] 보스 패턴 오브젝트 렌더링 담당 파일 (boss_object_renderer.js)
GameRenderer.drawBossPatternObjectEntity = function(ctx, obj) {
    if (!obj || !obj.active) return;

    const objectRenderTypeRaw = String(obj.renderType || obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase();
    const objectTypeRaw = String(obj.data && obj.data.Object_Type || '').trim().toUpperCase();
    if (obj.kind === 'collectible' || objectRenderTypeRaw === 'OBJ_APOSTLE_ENERGY' || objectTypeRaw === 'APOSTLE_ENERGY') {
        if (typeof this.drawApostleEnergyObject === 'function') {
            this.drawApostleEnergyObject(ctx, obj);
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

    ctx.save();
    ctx.globalAlpha *= opacity;
    if ('filter' in ctx) ctx.filter = isCloneObject ? `brightness(${brightness}) saturate(1.15) contrast(1.05)` : `brightness(${brightness}) saturate(0.75)`;

    ctx.fillStyle = isCloneObject ? `rgba(180,30,28,${0.13 * opacity})` : `rgba(120,190,255,${0.14 * opacity})`;
    ctx.beginPath();
    ctx.ellipse(obj.x, drawY, w * 0.58, dY * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();

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





