// [카시야스 보스전] 보스 패턴 오브젝트 렌더링 담당 파일 (boss_object_renderer.js)
GameRenderer.drawBossPatternObjectEntity = function(ctx, obj) {
    if (!obj || !obj.active) return;
    if (obj.kasiyasP1M3RushHidden) return;

    const objectRenderTypeRaw = String(obj.renderType || obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase();
    const objectTypeRaw = String(obj.data && obj.data.Object_Type || '').trim().toUpperCase();
    const vfxRaw = String(obj.data && obj.data.VFX_Type || '').trim().toUpperCase();
    if (obj.kind === 'dimensionPortal' || objectRenderTypeRaw === 'OBJ_DIMENSION_PORTAL' || objectTypeRaw === 'DIMENSION_PORTAL') {
        if (typeof this.drawKasiyasDimensionPortalObject === 'function') {
            this.drawKasiyasDimensionPortalObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'p3M2GiantSwordDrop' || objectRenderTypeRaw === 'OBJ_P3_M2_GIANT_SWORD_DROP' || objectTypeRaw === 'GIANT_SWORD_DROP') {
        if (typeof this.drawKasiyasP3M2GiantSwordDropObject === 'function') {
            this.drawKasiyasP3M2GiantSwordDropObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'p3M2ApostleEnergyEruption' || objectRenderTypeRaw === 'OBJ_P3_M2_APOSTLE_ENERGY_ERUPTION' || objectTypeRaw === 'APOSTLE_ENERGY_ERUPTION') {
        if (typeof this.drawKasiyasP3M2ApostleEnergyEruptionObject === 'function') {
            this.drawKasiyasP3M2ApostleEnergyEruptionObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'fallingSwordRain' || objectRenderTypeRaw === 'OBJ_DIMENSION_PORTAL_SWORD_RAIN' || objectTypeRaw === 'FALLING_SWORD_RAIN') {
        if (typeof this.drawKasiyasFallingSwordRainObject === 'function') {
            this.drawKasiyasFallingSwordRainObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'p3SpaceDistortion' || objectRenderTypeRaw === 'OBJ_P3_SPACE_DISTORTION' || objectTypeRaw === 'SPACE_DISTORTION') {
        if (typeof this.drawKasiyasP3SpaceDistortionObject === 'function') {
            this.drawKasiyasP3SpaceDistortionObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'p3SpaceBurst' || objectRenderTypeRaw === 'OBJ_P3_SPACE_BURST' || objectTypeRaw === 'SPACE_BURST') {
        if (typeof this.drawKasiyasP3SpaceBurstObject === 'function') {
            this.drawKasiyasP3SpaceBurstObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'p3DimensionCrack' || objectRenderTypeRaw === 'OBJ_P3_DIMENSION_CRACK' || objectTypeRaw === 'DIMENSION_CRACK') {
        if (typeof this.drawKasiyasP3DimensionCrackObject === 'function') {
            this.drawKasiyasP3DimensionCrackObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'p3DimensionCrackBurst' || objectRenderTypeRaw === 'OBJ_P3_DIMENSION_CRACK_BURST' || objectTypeRaw === 'DIMENSION_CRACK_BURST') {
        if (typeof this.drawKasiyasP3DimensionCrackBurstObject === 'function') {
            this.drawKasiyasP3DimensionCrackBurstObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'p3GiantSwordTrace' || objectRenderTypeRaw === 'OBJ_P3_GIANT_SWORD_TRACE' || objectTypeRaw === 'GIANT_SWORD_TRACE') {
        if (typeof this.drawKasiyasP3GiantSwordTraceObject === 'function') {
            this.drawKasiyasP3GiantSwordTraceObject(ctx, obj);
        }
        return;
    }

    if ((obj.kind === 'pathDelayed' || objectRenderTypeRaw === 'OBJ_PATH_ONI_SLASH_BURST') && obj.visualLinked) {
        if (typeof this.drawKasiyasPathDelayedSlashObject === 'function') {
            this.drawKasiyasPathDelayedSlashObject(ctx, obj);
        }
        return;
    }

    if (objectRenderTypeRaw === 'OBJ_P3_GIANT_SWORD_WAVE' || objectTypeRaw === 'GIANT_SWORD_WAVE') {
        if (typeof this.drawKasiyasP3GiantSwordWaveObject === 'function') {
            this.drawKasiyasP3GiantSwordWaveObject(ctx, obj);
        }
        return;
    }

    if (objectRenderTypeRaw === 'OBJ_CIRCLE_SWORD_WAVE' || vfxRaw === 'EFT_CIRCLE_SWORD_WAVE' || objectRenderTypeRaw === 'OBJ_P2_DOUBLE_CIRCLE_CROSS_SWORD_WAVE' || vfxRaw === 'EFT_P2_DOUBLE_CIRCLE_CROSS_SWORD_WAVE') {
        if (typeof this.drawKasiyasCircleSwordWaveObject === 'function') {
            this.drawKasiyasCircleSwordWaveObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'swordWave' || objectRenderTypeRaw === 'OBJ_CROSS_SWORD_WAVE' || objectTypeRaw === 'SWORD_WAVE') {
        if (typeof this.drawKasiyasCrossSwordWaveObject === 'function') {
            this.drawKasiyasCrossSwordWaveObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'interactObject' || objectRenderTypeRaw === 'OBJ_P2_M2_BROKEN_GIANT_SWORD') {
        if (typeof this.drawKasiyasP2M2BrokenGiantSwordObject === 'function') {
            this.drawKasiyasP2M2BrokenGiantSwordObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'aimingObject' || objectRenderTypeRaw === 'OBJ_P2_M2_AIMING_GIANT_SWORD') {
        if (typeof this.drawKasiyasP2M2AimingGiantSwordObject === 'function') {
            this.drawKasiyasP2M2AimingGiantSwordObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'p2m2FiredGiantSword' || objectRenderTypeRaw === 'OBJ_P2_M2_FIRE_GIANT_SWORD') {
        if (typeof this.drawKasiyasP2M2FiredGiantSwordObject === 'function') {
            this.drawKasiyasP2M2FiredGiantSwordObject(ctx, obj);
        }
        return;
    }

    if (objectTypeRaw === 'SWORD_WALL' || objectTypeRaw === 'SWORD_WALL_GIANT_SWORD' || objectRenderTypeRaw.indexOf('P2_M2_SWORD_WALL') >= 0) {
        if (typeof this.drawKasiyasP2M2SwordWallObject === 'function') {
            this.drawKasiyasP2M2SwordWallObject(ctx, obj);
        }
        return;
    }

    if (obj.kind === 'terrain' || objectTypeRaw.indexOf('TERRAIN_') === 0) {
        if (typeof this.drawKasiyasTerrainObject === 'function') {
            this.drawKasiyasTerrainObject(ctx, obj);
        }
        return;
    }

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

    if (objectRenderTypeRaw === 'OBJ_SWORD_STORM' || objectRenderTypeRaw === 'OBJ_SWORD_STORM_WITH_APOSTLE_ENERGY') {
        if (typeof this.drawKasiyasSwordStormObject === 'function') {
            this.drawKasiyasSwordStormObject(ctx, obj, objectRenderTypeRaw === 'OBJ_SWORD_STORM_WITH_APOSTLE_ENERGY');
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
        m: { boss: { action: { Action_Move_Type: action.Move_Type || action.Action_Move_Type || '', Move_Type: action.Move_Type || '', VFX_Type: action.VFX_Type || action.Effect_Render_Type || '', Effect_Render_Type: action.VFX_Type || action.Effect_Render_Type || '' } } },
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
    const objectActionId = String(action.Object_Action_ID || '').trim();
    const patternId = String(action.Pattern_ID || obj.patternId || obj.sourcePatternId || '').trim();
    const actionName = String(action.Object_Action_Name || action.Action_Name || '').trim();

    const isP1M2AfterimageSlamWarning = patternId === '231007'
        && actionType === 'WARNING'
        && rawPose === 'POSE_KASIYAS_SLAM_THE_SWORD_DOWN_READY'
        && actionName.indexOf('잔상 내려찍기 전조') >= 0;
    const isP1M2AfterimageShockwaveAtk = patternId === '231007'
        && actionType === 'ATK'
        && identityEffect === 'EFT_SHOCKWAVE'
        && (
            objectActionId === '261055' || objectActionId === '261060' || objectActionId === '261065' || objectActionId === '261070' ||
            actionName.indexOf('잔상 내려찍기 충격파') >= 0
        );

    if (isP1M2AfterimageSlamWarning || isP1M2AfterimageShockwaveAtk) {
        const timer = Math.max(0, parseFloat(obj.actionTimer) || 0);
        const currentIndex = parseInt(obj.actionIndex, 10);
        const actions = Array.isArray(obj.actions) ? obj.actions : [];
        const getDuration = (act, fallback = 0.5) => {
            const d = parseFloat(act && act.Action_Anim_Duration);
            return (isFinite(d) && d > 0) ? d : fallback;
        };
        const getHitStart = (act, fallback = 0.3) => {
            const hs = parseFloat(act && act.Hitbox_Start_Time);
            return (isFinite(hs) && hs >= 0) ? hs : fallback;
        };

        if (isP1M2AfterimageSlamWarning) {
            const nextAction = actions[currentIndex + 1] || null;
            const nextIsShockwave = nextAction && String(nextAction.Action_Type || '').trim().toUpperCase() === 'ATK'
                && String(nextAction.VFX_Type || nextAction.Effect_Render_Type || '').trim().toUpperCase() === 'EFT_SHOCKWAVE';
            const warningDuration = getDuration(action, 0.5);
            const hitStart = nextIsShockwave ? getHitStart(nextAction, 0.3) : 0;
            const total = Math.max(0.01, warningDuration + hitStart);
            const p = Math.max(0, Math.min(1, timer / total));
            this.drawBossObjectSlamGauge(ctx, obj, bodyY, h, p);
        } else {
            const prevAction = actions[currentIndex - 1] || null;
            const prevIsWarning = prevAction && String(prevAction.Action_Type || '').trim().toUpperCase() === 'WARNING'
                && String(prevAction.Action_Pose_Type || '').trim().toUpperCase() === 'POSE_KASIYAS_SLAM_THE_SWORD_DOWN_READY';
            const warningDuration = prevIsWarning ? getDuration(prevAction, 0.5) : 0;
            const hitStart = Math.max(0.01, getHitStart(action, 0.3));
            if (timer <= hitStart + 0.04) {
                const total = Math.max(0.01, warningDuration + hitStart);
                const elapsed = warningDuration + Math.min(timer, hitStart);
                const p = Math.max(0, Math.min(1, elapsed / total));
                this.drawBossObjectSlamGauge(ctx, obj, bodyY, h, p);
            }
        }
    } else if (actionType === 'WARNING' && rawPose === 'POSE_KASIYAS_SLAM_THE_SWORD_DOWN_READY') {
        this.drawBossObjectSlamGauge(ctx, obj, bodyY, h, progress);
    }
};


GameRenderer.drawKasiyasTerrainObject = function(ctx, obj) {
    const data = obj.data || {};
    const type = String(obj.objectType || data.Object_Type || '').trim().toUpperCase();
    const rect = obj.terrainArea || {
        x: parseFloat(data.Terrain_Area_X) || 0,
        y: parseFloat(data.Terrain_Area_Y) || 0,
        w: parseFloat(data.Terrain_Area_W) || 100,
        h: parseFloat(data.Terrain_Area_H) || 100
    };
    const sx = rect.x;
    const sy = this.GROUND_BASE_Y + rect.y;
    const sw = Math.max(1, rect.w);
    const t = (Date.now() / 1000 + (obj.timer || 0)) % 1000;
    const pulse = 0.5 + Math.sin(Date.now() / 120) * 0.5;
    const stageH = (this.gameState && this.gameState.WORLD_DEPTH) || 400;
    const isTopZone = rect.centerY <= stageH * 0.5;
    const isP3M3P2Terrain = !!(obj.p3m3Terrain && String(obj.p3m3TerrainRole || '').trim().toUpperCase() === 'P2_CLONE' && String(obj.sourcePatternId || '').trim() === '232003');
    const mapBottomY = this.GROUND_BASE_Y + stageH;
    const visualBottomY = isP3M3P2Terrain && !isTopZone
        ? Math.max(sy + Math.max(1, rect.h), mapBottomY, this.canvas ? this.canvas.height - 6 : mapBottomY)
        : sy + Math.max(1, rect.h);
    const sh = Math.max(1, visualBottomY - sy);

    const drawJaggedEdge = (edgeY, topSide, alpha = 1) => {
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(11,8,7,0.94)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(sx, edgeY);
        const seg = 22;
        for (let x = sx; x <= sx + sw + 1; x += seg) {
            const i = Math.floor((x - sx) / seg);
            const jag = ((i * 37) % 19) - 9;
            const y = edgeY + (topSide ? -1 : 1) * (10 + jag * 0.35 + Math.sin(t * 4 + i) * 1.7);
            ctx.lineTo(Math.min(sx + sw, x + seg * 0.55), y);
            ctx.lineTo(Math.min(sx + sw, x + seg), edgeY + ((i % 2) ? 3 : -2));
        }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(188,142,94,0.56)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(sx + 4, edgeY + (topSide ? -2 : 2));
        for (let x = sx; x <= sx + sw + 1; x += seg) {
            const i = Math.floor((x - sx) / seg);
            const y = edgeY + (topSide ? -1 : 1) * (5 + ((i * 17) % 7));
            ctx.lineTo(Math.min(sx + sw, x + seg), y);
        }
        ctx.stroke();
        ctx.restore();
    };

    const drawCracks = (count, color, alpha, widthScale = 1, longCracks = false) => {
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 0; i < count; i++) {
            const baseX = sx + ((i * 97 + 31) % Math.max(1, sw));
            const baseY = sy + ((i * 37 + 13) % Math.max(1, sh));
            const len = (longCracks ? 46 : 28) + (i % 5) * (longCracks ? 17 : 10);
            const ang = i * 1.73 + Math.sin(i) * 0.35;
            ctx.lineWidth = (i % 4 === 0 ? 2.8 : 1.45) * widthScale;
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            let px = baseX;
            let py = baseY;
            const steps = longCracks ? 4 : 3;
            for (let k = 1; k <= steps; k++) {
                px += Math.cos(ang + k * 0.42) * len / steps;
                py += Math.sin(ang * 1.18 + k * 0.65) * len * 0.36 / steps;
                ctx.lineTo(px, py);
            }
            ctx.stroke();
            if (i % 3 === 0) {
                ctx.lineWidth = 1.15 * widthScale;
                ctx.beginPath();
                ctx.moveTo(baseX + len * 0.20, baseY);
                ctx.lineTo(baseX + len * 0.20 + Math.cos(i * 0.91) * len * 0.42, baseY + Math.sin(i * 1.3) * len * 0.22);
                ctx.stroke();
            }
        }
        ctx.restore();
    };

    ctx.save();
    if (type === 'TERRAIN_PLAYER_BLOCK' || type === 'TERRAIN_PLAYER_BLOCKER') {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = 'rgba(30,0,0,0.54)';
        ctx.fillRect(sx, sy, sw, sh);
        ctx.globalAlpha = 0.92;
        ctx.strokeStyle = `rgba(255,74,58,${0.64 + pulse * 0.30})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + sh);
        ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,190,128,${0.32 + pulse * 0.25})`;
        ctx.lineWidth = 2.2;
        for (let i = 0; i < 8; i++) {
            const yy = sy + (i + 0.5) * sh / 8 + Math.sin(t * 3 + i) * 5;
            ctx.beginPath();
            ctx.moveTo(sx - 16, yy);
            ctx.lineTo(sx + 22, yy + Math.sin(i) * 5);
            ctx.stroke();
        }
        ctx.restore();
        return;
    }

    const isWarning = type === 'TERRAIN_WARNING';
    const isCollapse = type === 'TERRAIN_COLLAPSE' || type === 'TERRAIN_COLLAPSE_HIT';
    const isBlock = type === 'TERRAIN_BLOCK' || type === 'TERRAIN_BLOCKER';

    if (type === 'TERRAIN_BLOCK' && String(obj.renderType || data.Object_Render_Type || '').trim().toUpperCase() === 'OBJ_P3_SPACE_BURST_BROKEN_SPACE') {
        // 공간 폭발 후 남는 이동 제한 구역: 단순하고 명확한 검은 박스형 구멍.
        const lifeT = Math.max(0, Math.min(1, (parseFloat(obj.timer) || 0) / Math.max(0.001, parseFloat(obj.maxLife) || 10)));
        ctx.globalAlpha = Math.max(0.18, 0.92 * (1 - Math.max(0, lifeT - 0.78) / 0.22));
        ctx.fillStyle = 'rgba(0,0,0,0.92)';
        ctx.fillRect(sx, sy, sw, sh);
        const innerGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
        innerGrad.addColorStop(0, 'rgba(42,0,56,0.42)');
        innerGrad.addColorStop(0.45, 'rgba(4,0,8,0.96)');
        innerGrad.addColorStop(1, 'rgba(0,0,0,0.98)');
        ctx.fillStyle = innerGrad;
        ctx.fillRect(sx + 3, sy + 3, Math.max(1, sw - 6), Math.max(1, sh - 6));

        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(205,116,255,${0.42 + pulse * 0.20})`;
        ctx.lineWidth = 3.0;
        ctx.strokeRect(sx + 1.5, sy + 1.5, Math.max(1, sw - 3), Math.max(1, sh - 3));
        ctx.strokeStyle = `rgba(255,70,56,${0.22 + pulse * 0.16})`;
        ctx.lineWidth = 1.8;
        // 가장자리에만 짧은 균열선을 붙여 구멍처럼 읽히게 한다.
        for (let i = 0; i < 12; i++) {
            const edge = i % 4;
            const r = (i + 0.35) / 12;
            let x0, y0, x1, y1;
            if (edge === 0) { x0 = sx + sw * r; y0 = sy; x1 = x0 + Math.sin(i) * 18; y1 = sy - 12 - (i % 3) * 4; }
            else if (edge === 1) { x0 = sx + sw; y0 = sy + sh * r; x1 = sx + sw + 14 + (i % 3) * 5; y1 = y0 + Math.cos(i) * 12; }
            else if (edge === 2) { x0 = sx + sw * r; y0 = sy + sh; x1 = x0 + Math.cos(i) * 18; y1 = sy + sh + 12 + (i % 3) * 4; }
            else { x0 = sx; y0 = sy + sh * r; x1 = sx - 14 - (i % 3) * 5; y1 = y0 + Math.sin(i) * 12; }
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        }
        ctx.restore();
        return;
    }

    if (isWarning) {
        // 붕괴 직전은 검은 장판이 아니라 기존 지면 타일 위에 금이 퍼져가는 형태로 보여준다.
        ctx.globalAlpha = 0.50 + pulse * 0.10;
        const tileGrad = ctx.createLinearGradient(0, sy, 0, sy + sh);
        tileGrad.addColorStop(0, 'rgba(92,88,80,0.60)');
        tileGrad.addColorStop(0.50, 'rgba(62,58,54,0.48)');
        tileGrad.addColorStop(1, 'rgba(34,31,30,0.42)');
        ctx.fillStyle = tileGrad;
        ctx.fillRect(sx, sy, sw, sh);
        ctx.globalAlpha = 0.30;
        ctx.strokeStyle = 'rgba(210,190,160,0.36)';
        ctx.lineWidth = 1;
        for (let x = sx + 80; x < sx + sw; x += 120) {
            ctx.beginPath(); ctx.moveTo(x, sy + 4); ctx.lineTo(x, sy + sh - 4); ctx.stroke();
        }
        for (let y = sy + 28; y < sy + sh; y += 34) {
            ctx.beginPath(); ctx.moveTo(sx + 6, y); ctx.lineTo(sx + sw - 6, y + Math.sin(y) * 1.5); ctx.stroke();
        }
        drawCracks(30, `rgba(12,8,8,${0.72 + pulse * 0.12})`, 1, 1.0, true);
        ctx.globalCompositeOperation = 'lighter';
        drawCracks(18, `rgba(255,78,50,${0.34 + pulse * 0.36})`, 1, 0.75, true);
        ctx.globalAlpha = 0.55 + pulse * 0.22;
        ctx.strokeStyle = 'rgba(255,92,60,0.50)';
        ctx.lineWidth = 3;
        ctx.strokeRect(sx + 3, sy + 3, sw - 6, sh - 6);
        ctx.restore();
        return;
    }

    if (isCollapse) {
        ctx.globalAlpha = isP3M3P2Terrain ? Math.max(0.20, 0.92 - (obj.timer || 0) * 0.18) : Math.max(0.10, 0.74 - (obj.timer || 0) * 0.28);
        ctx.fillStyle = 'rgba(12,5,3,0.86)';
        ctx.fillRect(sx, sy, sw, sh);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = isP3M3P2Terrain ? Math.max(0.18, 0.82 - (obj.timer || 0) * 0.28) : Math.max(0, 0.64 - (obj.timer || 0) * 0.42);
        ctx.fillStyle = 'rgba(255,94,54,0.20)';
        ctx.fillRect(sx - 8, sy - 8, sw + 16, sh + 16);
        drawCracks(isP3M3P2Terrain ? 48 : 34, 'rgba(255,126,76,0.62)', isP3M3P2Terrain ? 1.0 : 0.92, isP3M3P2Terrain ? 1.65 : 1.35, true);
        drawJaggedEdge(isTopZone ? sy + sh : sy, !isTopZone, 0.95);
        if (isP3M3P2Terrain && !isTopZone) {
            ctx.strokeStyle = 'rgba(255,210,140,0.58)';
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(sx + 8, sy + 8);
            ctx.lineTo(sx + sw - 8, sy + 8);
            ctx.stroke();
        }
        ctx.restore();
        return;
    }

    if (isBlock) {
        // 붕괴 후에는 상/하단을 깊은 낭떠러지처럼 만들고, 중앙 안전지대는 다리처럼 남아 보이도록 깨진 단면을 강조한다.
        const abyss = ctx.createLinearGradient(0, sy, 0, sy + sh);
        abyss.addColorStop(0, 'rgba(2,2,5,0.90)');
        abyss.addColorStop(0.52, 'rgba(0,0,0,0.94)');
        abyss.addColorStop(1, 'rgba(12,4,3,0.88)');
        ctx.globalAlpha = isP3M3P2Terrain ? 0.96 : 0.86;
        ctx.fillStyle = abyss;
        ctx.fillRect(sx, sy, sw, sh);
        ctx.globalAlpha = 0.42;
        ctx.fillStyle = 'rgba(100,38,28,0.22)';
        for (let i = 0; i < 18; i++) {
            const px = sx + ((i * 83 + 19) % sw);
            const py = sy + ((i * 41 + 7) % sh);
            ctx.beginPath();
            ctx.ellipse(px, py, 8 + (i % 4) * 3, 3 + (i % 3), (i % 5) * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        drawCracks(isP3M3P2Terrain ? 38 : 24, isP3M3P2Terrain ? 'rgba(255,122,72,0.46)' : 'rgba(56,42,38,0.74)', isP3M3P2Terrain ? 0.92 : 0.72, isP3M3P2Terrain ? 1.18 : 0.85, isP3M3P2Terrain);
        drawJaggedEdge(isTopZone ? sy + sh : sy, !isTopZone, 1.0);
        if (isP3M3P2Terrain && !isTopZone) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.72;
            ctx.strokeStyle = `rgba(255,166,88,${0.38 + pulse * 0.20})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(sx + 8, sy + 6);
            ctx.lineTo(sx + sw - 8, sy + 6);
            ctx.stroke();
            ctx.fillStyle = `rgba(255,80,40,${0.10 + pulse * 0.08})`;
            ctx.fillRect(sx, sy, sw, Math.min(34, sh));
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }
        // 안전 지대 쪽으로 살짝 튀어나온 깨진 판석을 그려 중앙 발판이 다리처럼 보이게 한다.
        ctx.save();
        ctx.globalAlpha = 0.70;
        ctx.fillStyle = 'rgba(86,76,64,0.58)';
        const edgeY = isTopZone ? sy + sh : sy;
        const sign = isTopZone ? 1 : -1;
        for (let i = 0; i < 13; i++) {
            const chipX = sx + i * sw / 13 + ((i * 23) % 17);
            const chipW = 34 + (i % 4) * 14;
            const chipH = 7 + (i % 3) * 4;
            ctx.beginPath();
            ctx.moveTo(chipX, edgeY);
            ctx.lineTo(chipX + chipW, edgeY + sign * (2 + (i % 2) * 3));
            ctx.lineTo(chipX + chipW * 0.82, edgeY + sign * (chipH + 8));
            ctx.lineTo(chipX + chipW * 0.18, edgeY + sign * (chipH + 5));
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
        ctx.restore();
        return;
    }
    ctx.restore();
};





GameRenderer.getKasiyasP3B5TraceRenderPaths = function(obj) {
    if (obj && Array.isArray(obj.tracePaths) && obj.tracePaths.length > 0) return obj.tracePaths;
    const gameState = this.gameState || {};
    const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400);
    const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400);
    const data = obj && obj.data ? obj.data : {};
    const width = Math.max(24, parseFloat(obj && obj.traceWidth) || parseFloat(data.Trace_Width) || 150);
    const make = (key, x1, y1, x2, y2) => ({ key, startX: x1, startY: y1, endX: x2, endY: y2, width, length: Math.hypot(x2 - x1, y2 - y1) });
    const paths = {
        TRACE_PATH_P3_B5_UP: make('TRACE_PATH_P3_B5_UP', worldW * 0.143, worldD * 0.925, worldW * 0.629, worldD * 0.075),
        TRACE_PATH_P3_B5_CIRCLE: make('TRACE_PATH_P3_B5_CIRCLE', worldW * 0.029, worldD * 0.635, worldW * 0.971, worldD * 0.687),
        TRACE_PATH_P3_B5_DOWN: make('TRACE_PATH_P3_B5_DOWN', worldW * 0.396, worldD * 0.075, worldW * 0.897, worldD * 0.925),
        TRACE_PATH_P3_B5_AIR: make('TRACE_PATH_P3_B5_AIR', worldW * 0.500, worldD * 0.035, worldW * 0.500, worldD * 0.965)
    };
    const key = String(obj && obj.traceKey || data.Trace_Path_Key || '').trim().toUpperCase();
    if (key === 'TRACE_PATH_P3_B5_PREVIOUS_ALL' || key === 'TRACE_PATH_P3_B5_ALL' || key === 'PREVIOUS_ALL') {
        return [paths.TRACE_PATH_P3_B5_UP, paths.TRACE_PATH_P3_B5_CIRCLE, paths.TRACE_PATH_P3_B5_DOWN];
    }
    return [paths[key] || paths.TRACE_PATH_P3_B5_UP];
};

GameRenderer.drawKasiyasP3GiantSwordTraceObject = function(ctx, obj) {
    if (!ctx || !obj || obj.active === false) return;
    const data = obj.data || {};
    const paths = this.getKasiyasP3B5TraceRenderPaths(obj);
    const timer = Math.max(0, parseFloat(obj.timer) || 0);
    const warningDuration = Math.max(0, parseFloat(obj.warningDuration) || parseFloat(data.Warning_Duration) || 0);
    const hitStart = Math.max(0, parseFloat(obj.hitStart) || parseFloat(data.Hitbox_Delay_Time) || warningDuration || 0);
    const hitEnd = Math.max(hitStart + 0.03, parseFloat(obj.hitEnd) || (hitStart + (parseFloat(data.Hitbox_Duration) || 0.18)));
    const inWarning = timer < hitStart;
    const inHit = timer >= hitStart && timer <= hitEnd;
    const afterHit = timer > hitEnd;
    const pulse = 0.5 + Math.sin(Date.now() / 68 + timer * 8) * 0.5;
    const key = String(obj.traceKey || data.Trace_Path_Key || '').trim().toUpperCase();
    const isCombo = key.indexOf('PREVIOUS_ALL') >= 0;
    const isFinal = key.indexOf('AIR') >= 0;
    const canvasW = Math.max(1, ctx.canvas && ctx.canvas.width ? ctx.canvas.width : (parseFloat(this.gameState && this.gameState.WORLD_WIDTH) || 1400));
    const canvasH = Math.max(1, ctx.canvas && ctx.canvas.height ? ctx.canvas.height : 760);
    const canvasDiag = Math.hypot(canvasW, canvasH);
    const baseAlpha = inWarning ? (0.48 + pulse * 0.16) : (inHit ? 1.0 : (isCombo ? 0.26 : 0.68));

    const drawBladeShard = (cx, cy, angle, along, side, scale, alpha, bright) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.globalAlpha *= alpha;
        ctx.fillStyle = bright ? 'rgba(255,255,255,0.72)' : 'rgba(21,4,42,0.76)';
        ctx.beginPath();
        ctx.moveTo(along, side * scale * 0.18);
        ctx.lineTo(along + scale * 1.7, side * scale * 0.62);
        ctx.lineTo(along + scale * 0.16, side * scale * 0.38);
        ctx.lineTo(along - scale * 1.15, side * scale * 0.72);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    ctx.save();
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    paths.forEach((path, idx) => {
        const sx = parseFloat(path.startX) || 0;
        const sy = this.GROUND_BASE_Y + (parseFloat(path.startY) || 0);
        const ex = parseFloat(path.endX) || 0;
        const ey = this.GROUND_BASE_Y + (parseFloat(path.endY) || 0);
        const originalDx = ex - sx;
        const originalDy = ey - sy;
        const originalLen = Math.max(1, Math.hypot(originalDx, originalDy));
        const nx = originalDx / originalLen;
        const ny = originalDy / originalLen;
        const angle = Math.atan2(ny, nx);
        const cx = (sx + ex) * 0.5;
        const cy = (sy + ey) * 0.5;
        // 판정은 맵 고정 경로를 사용하지만, 화면 연출은 캔버스 전체를 가르도록 길이를 크게 확장한다.
        const visualLen = Math.max(canvasDiag * 1.65, originalLen * 1.65, 1700);
        const x1 = cx - nx * visualLen * 0.5;
        const y1 = cy - ny * visualLen * 0.5;
        const x2 = cx + nx * visualLen * 0.5;
        const y2 = cy + ny * visualLen * 0.5;
        const width = Math.max(24, parseFloat(path.width) || parseFloat(obj.traceWidth) || parseFloat(data.Trace_Width) || 150);
        // 히트 순간에 검흔 전체 크기가 커졌다가 줄어드는 느낌을 줄이기 위해 폭은 고정한다.
        // 판정 타이밍은 내부 코어의 붉은 점멸과 외곽 균열 강조로만 전달한다.
        const hitPulse = inHit ? (0.55 + Math.sin(Date.now() / 42 + idx * 1.7) * 0.45) : 0;
        const outerWidth = Math.max(14, width * 0.64);
        const darkWidth = Math.max(10, outerWidth * 0.58);
        const whiteCoreWidth = Math.max(5, width * 0.16);
        const thinCutWidth = Math.max(2.5, whiteCoreWidth * 0.38);

        ctx.save();
        // 넓은 보라색 압력장. 선 자체는 화면을 가로지르되, 실제 판정 범위보다 과한 장판처럼 보이지 않도록 투명도를 낮춘다.
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = baseAlpha * (isCombo ? 0.82 : 1.0) * (afterHit ? 0.72 : 1.0);
        ctx.shadowBlur = inHit ? 34 : 26;
        ctx.shadowColor = inHit ? 'rgba(255,58,54,0.92)' : (isFinal ? 'rgba(206,90,255,0.98)' : 'rgba(130,58,245,0.88)');
        ctx.strokeStyle = inWarning ? 'rgba(78,18,145,0.42)' : (inHit ? `rgba(180,44,74,${0.52 + hitPulse * 0.22})` : 'rgba(71,19,136,0.44)');
        ctx.lineWidth = outerWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // 검은 균열 외곽. lineCap을 butt로 두어 끝이 더 날카롭게 읽히게 한다.
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = Math.min(1, baseAlpha + (inHit ? 0.16 : 0));
        ctx.shadowBlur = inHit ? 18 : 10;
        ctx.shadowColor = 'rgba(0,0,0,0.98)';
        ctx.strokeStyle = 'rgba(2,0,8,0.95)';
        ctx.lineWidth = darkWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // 중심의 흰색 칼날 코어. 요청에 맞춰 검흔 내부가 흰색으로 보이도록 가장 밝은 레이어를 강화한다.
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = inHit ? (0.84 + hitPulse * 0.16) : (inWarning ? 0.76 : 0.68);
        ctx.shadowBlur = inHit ? (22 + hitPulse * 14) : 16;
        ctx.shadowColor = inHit ? `rgba(255,42,36,${0.82 + hitPulse * 0.16})` : 'rgba(255,255,255,0.92)';
        ctx.strokeStyle = inHit ? `rgba(255,${Math.floor(62 + hitPulse * 52)},${Math.floor(54 + hitPulse * 38)},0.98)` : 'rgba(246,244,255,0.86)';
        ctx.lineWidth = whiteCoreWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // 아주 얇은 절단선은 더 날카로운 검흔 인상을 준다.
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = inHit ? (0.80 + hitPulse * 0.18) : 0.72;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = inHit ? `rgba(255,${Math.floor(150 + hitPulse * 55)},${Math.floor(130 + hitPulse * 50)},0.98)` : 'rgba(255,255,255,0.98)';
        ctx.lineWidth = thinCutWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // 날카로운 양 끝 칼끝.
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        const tipLen = Math.max(48, width * 0.64);
        const tipHalf = Math.max(10, whiteCoreWidth * 1.5);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = inHit ? (0.72 + hitPulse * 0.18) : 0.64;
        ctx.fillStyle = inHit ? `rgba(255,${Math.floor(98 + hitPulse * 70)},${Math.floor(72 + hitPulse * 50)},0.78)` : 'rgba(255,255,255,0.78)';
        ctx.beginPath();
        ctx.moveTo(-visualLen * 0.5 - tipLen * 0.15, 0);
        ctx.lineTo(-visualLen * 0.5 + tipLen, -tipHalf);
        ctx.lineTo(-visualLen * 0.5 + tipLen * 0.52, 0);
        ctx.lineTo(-visualLen * 0.5 + tipLen, tipHalf);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(visualLen * 0.5 + tipLen * 0.15, 0);
        ctx.lineTo(visualLen * 0.5 - tipLen, -tipHalf);
        ctx.lineTo(visualLen * 0.5 - tipLen * 0.52, 0);
        ctx.lineTo(visualLen * 0.5 - tipLen, tipHalf);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 균열 파편은 원래 맵 경로 주변에 더 많이 배치해, 실제 적용 위치를 완전히 잃지 않게 한다.
        ctx.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 22; i++) {
            const f = (i / 21 - 0.5) * originalLen * 1.04;
            const side = (i % 2 === 0 ? -1 : 1);
            const shardScale = 8 + (i % 5) * 3;
            const off = side * (outerWidth * (0.22 + (i % 4) * 0.045));
            const px = cx + nx * f - ny * off;
            const py = cy + ny * f + nx * off;
            drawBladeShard(px, py, angle, 0, side, shardScale, inHit ? 0.72 : 0.42, i % 4 === 0);
        }

        if (inWarning) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.76;
            ctx.setLineDash([22, 14]);
            ctx.strokeStyle = 'rgba(255,255,255,0.34)';
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.moveTo(x1 - ny * outerWidth * 0.52, y1 + nx * outerWidth * 0.52);
            ctx.lineTo(x2 - ny * outerWidth * 0.52, y2 + nx * outerWidth * 0.52);
            ctx.moveTo(x1 + ny * outerWidth * 0.52, y1 - nx * outerWidth * 0.52);
            ctx.lineTo(x2 + ny * outerWidth * 0.52, y2 - nx * outerWidth * 0.52);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.restore();
    });
    ctx.restore();
};

GameRenderer.drawKasiyasP3SpaceDistortionObject = function(ctx, obj) {
    const baseY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const x = parseFloat(obj.x) || 0;
    const w = Math.max(60, parseFloat(obj.w) || 150);
    const d = Math.max(40, parseFloat(obj.d) || 250);
    const t = (parseFloat(obj.timer) || 0) + Date.now() / 1000;
    const pulse = 0.5 + Math.sin(Date.now() / 120 + x * 0.01) * 0.5;
    const restoreRequired = Math.max(0.1, parseFloat(obj.restoreRequired) || 2);
    const restoreRate = Math.max(0, Math.min(1, (parseFloat(obj.restoreTimer) || 0) / restoreRequired));
    const hover = 32 + Math.sin(t * 2.1) * 2.5;
    const drawY = baseY - hover;
    const rx = w * 0.50;
    const ry = d * 0.42;
    const seed = Math.floor((parseFloat(obj.x) || 0) * 13 + (parseFloat(obj.y) || 0) * 7) % 1000;

    const drawGlassCrack = (scale, alphaMul, widthMul) => {
        ctx.save();
        ctx.globalAlpha *= alphaMul;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,0.82)';
        const cracks = [
            [-0.06, -0.02, -0.84, -0.24, [[-0.50,-0.33],[-0.62,-0.04]]],
            [ 0.02, -0.01,  0.82, -0.30, [[0.42,-0.40],[0.58,-0.12]]],
            [-0.03,  0.00, -0.68,  0.42, [[-0.36,0.24],[-0.54,0.08]]],
            [ 0.03,  0.01,  0.72,  0.38, [[0.40,0.26],[0.58,0.02]]],
            [ 0.00, -0.04, -0.22, -0.86, [[-0.16,-0.54],[0.02,-0.66]]],
            [ 0.01, -0.02,  0.30, -0.78, [[0.12,-0.48],[0.34,-0.52]]],
            [-0.01,  0.02, -0.12,  0.76, [[-0.28,0.42],[0.06,0.54]]],
            [ 0.00,  0.00,  0.18,  0.72, [[0.08,0.38],[0.34,0.48]]]
        ];
        for (let i = 0; i < cracks.length; i++) {
            const c = cracks[i];
            const sx = x + c[0] * rx * scale;
            const sy = drawY + c[1] * ry * scale;
            const ex = x + c[2] * rx * scale;
            const ey = drawY + c[3] * ry * scale;
            const midX = (sx + ex) * 0.5 + Math.sin(seed + i) * rx * 0.055;
            const midY = (sy + ey) * 0.5 + Math.cos(seed + i) * ry * 0.055;
            ctx.strokeStyle = i % 3 === 0 ? 'rgba(0,0,0,0.98)' : 'rgba(4,5,8,0.94)';
            ctx.lineWidth = (i % 3 === 0 ? 7.2 : 5.0) * widthMul;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(midX, midY);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            // 하이라이트는 검은 균열 한쪽 면에 아주 짧게만 둔다. 하늘색 선처럼 보이지 않도록 제한.
            ctx.strokeStyle = 'rgba(190,218,255,0.18)';
            ctx.lineWidth = Math.max(1.2, 1.8 * widthMul);
            ctx.beginPath();
            ctx.moveTo(sx + 2, sy - 2);
            ctx.lineTo(midX + 1, midY - 1);
            ctx.stroke();

            for (const b of c[4]) {
                const bx = x + b[0] * rx * scale;
                const by = drawY + b[1] * ry * scale;
                ctx.strokeStyle = 'rgba(0,0,0,0.88)';
                ctx.lineWidth = 3.2 * widthMul;
                ctx.beginPath();
                ctx.moveTo(midX, midY);
                ctx.lineTo(bx, by);
                ctx.stroke();
            }
        }
        ctx.restore();
    };

    ctx.save();
    // 바닥에는 위치를 알 수 있는 약한 그림자만 남긴다.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha *= 0.16;
    const shadowGrad = ctx.createRadialGradient(x, baseY + 5, 4, x, baseY + 5, Math.max(w, d) * 0.62);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.38)');
    shadowGrad.addColorStop(0.70, 'rgba(0,0,0,0.12)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(x, baseY + 6, rx * 1.06, ry * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();

    // 떠 있는 원형 유리막. 색은 매우 약한 남색 공간막으로만 표현한다.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.52;
    const glassGrad = ctx.createRadialGradient(x, drawY, 3, x, drawY, Math.max(w, d) * 0.64);
    glassGrad.addColorStop(0.00, 'rgba(220,238,255,0.035)');
    glassGrad.addColorStop(0.30, 'rgba(22,52,102,0.13)');
    glassGrad.addColorStop(0.74, 'rgba(0,10,34,0.15)');
    glassGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.ellipse(x, drawY, rx, ry, Math.sin(t * 1.2) * 0.035, 0, Math.PI * 2);
    ctx.fill();

    // 원형 판정 범위는 남색 외곽막으로 얇게만 표시.
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.55 + pulse * 0.08;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(12,38,90,0.52)';
    ctx.strokeStyle = 'rgba(36,86,156,0.42)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(x, drawY, rx * 1.00, ry * 1.00, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 핵심 표현: 두꺼운 검은 유리 균열.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.98;
    drawGlassCrack(1.0, 1.0, 1.0);

    // 중심의 작은 파열점.
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.72 + pulse * 0.18;
    const coreGrad = ctx.createRadialGradient(x, drawY, 1, x, drawY, Math.max(10, Math.min(rx, ry) * 0.18));
    coreGrad.addColorStop(0.0, 'rgba(255,255,255,0.92)');
    coreGrad.addColorStop(0.30, 'rgba(180,218,255,0.55)');
    coreGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(x, drawY, Math.max(4, Math.min(rx, ry) * 0.10), 0, Math.PI * 2);
    ctx.fill();

    // 검정/남색 유리 조각.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.34;
    for (let i = 0; i < 10; i++) {
        const a = i * Math.PI * 2 / 10 + seed * 0.01;
        const cx = x + Math.cos(a) * rx * (0.22 + (i % 3) * 0.15);
        const cy = drawY + Math.sin(a) * ry * (0.18 + (i % 3) * 0.07) - (i % 3) * 3;
        const sz = 6 + (i % 3) * 4;
        ctx.fillStyle = i % 2 ? 'rgba(0,0,0,0.52)' : 'rgba(4,18,44,0.40)';
        ctx.beginPath();
        ctx.moveTo(cx, cy - sz);
        ctx.lineTo(cx + sz * 1.5, cy + sz * 0.42);
        ctx.lineTo(cx - sz * 0.85, cy + sz * 0.86);
        ctx.closePath();
        ctx.fill();
    }

    if (restoreRate > 0) {
        const barW = Math.max(60, w * 0.66);
        const barH = 8;
        const by = drawY - ry - 18;
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.94;
        ctx.fillStyle = 'rgba(0,0,0,0.74)';
        ctx.fillRect(x - barW / 2, by, barW, barH);
        ctx.fillStyle = 'rgba(76,142,216,0.92)';
        ctx.fillRect(x - barW / 2 + 1, by + 1, (barW - 2) * restoreRate, barH - 2);
        ctx.strokeStyle = 'rgba(180,218,255,0.72)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x - barW / 2, by, barW, barH);
    }
    ctx.restore();
};

GameRenderer.drawKasiyasP3SpaceBurstObject = function(ctx, obj) {
    const baseY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const x = parseFloat(obj.x) || 0;
    const w = Math.max(120, parseFloat(obj.w) || 500);
    const d = Math.max(80, parseFloat(obj.d) || 500);
    const timer = parseFloat(obj.timer) || 0;
    const warning = Math.max(0.001, parseFloat(obj.warningDuration) || 1);
    const hitEnd = Math.max(warning + 0.05, parseFloat(obj.hitEnd) || 1.3);
    const warningT = Math.max(0, Math.min(1, timer / warning));
    const burstT = Math.max(0, Math.min(1, (timer - warning) / Math.max(0.001, hitEnd - warning)));
    const pulse = 0.5 + Math.sin(Date.now() / 70) * 0.5;
    const hover = 30 + Math.sin(Date.now() / 120) * 3;
    const drawY = baseY - hover;
    const rx = w * 0.50;
    const ry = d * 0.42;

    const drawDamageRangeFrame = (phaseAlpha, thick = false) => {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = Math.max(0, Math.min(1, phaseAlpha));
        const rangeGrad = ctx.createRadialGradient(x, drawY, Math.min(rx, ry) * 0.08, x, drawY, Math.max(rx, ry) * 1.08);
        rangeGrad.addColorStop(0.00, 'rgba(20,0,58,0.06)');
        rangeGrad.addColorStop(0.58, 'rgba(28,0,76,0.10)');
        rangeGrad.addColorStop(0.86, 'rgba(6,0,18,0.20)');
        rangeGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = rangeGrad;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = thick ? 20 : 14;
        ctx.shadowColor = 'rgba(138,70,255,0.70)';
        ctx.strokeStyle = thick ? 'rgba(235,222,255,0.78)' : 'rgba(204,180,255,0.62)';
        ctx.lineWidth = thick ? 5.4 : 4.0;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(10,0,24,0.92)';
        ctx.lineWidth = thick ? 8.0 : 6.0;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx * 1.005, ry * 1.005, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(162,92,255,0.82)';
        ctx.lineWidth = thick ? 2.2 : 1.8;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx * 0.975, ry * 0.975, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    const drawBurstCracks = (scale, alphaMul, widthMul, explodeT, darkOnly = false) => {
        ctx.save();
        ctx.globalAlpha *= alphaMul;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.shadowBlur = 12;
        ctx.shadowColor = darkOnly ? 'rgba(58,0,132,0.84)' : 'rgba(0,0,0,0.90)';
        const count = 18;
        for (let i = 0; i < count; i++) {
            const a = i * Math.PI * 2 / count + Math.sin(i * 1.71) * 0.18;
            const inner = Math.min(rx, ry) * (0.05 + (i % 3) * 0.018);
            const outerX = rx * (0.32 + (i % 5) * 0.09 + explodeT * 0.34) * scale;
            const outerY = ry * (0.32 + (i % 4) * 0.09 + explodeT * 0.34) * scale;
            const sx = x + Math.cos(a) * inner;
            const sy = drawY + Math.sin(a) * inner;
            const mx = x + Math.cos(a + 0.12) * outerX * 0.52;
            const my = drawY + Math.sin(a + 0.12) * outerY * 0.52;
            const ex = x + Math.cos(a) * outerX;
            const ey = drawY + Math.sin(a) * outerY - explodeT * (i % 3) * 5;
            if (darkOnly) {
                ctx.strokeStyle = i % 3 === 0 ? 'rgba(0,0,0,0.98)' : 'rgba(88,38,190,0.72)';
            } else {
                ctx.strokeStyle = i % 3 === 0 ? 'rgba(0,0,0,0.98)' : 'rgba(34,0,92,0.84)';
            }
            ctx.lineWidth = (i % 3 === 0 ? 8.0 : 5.2) * widthMul;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(mx, my);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        }
        ctx.restore();
    };

    ctx.save();
    if (timer < warning) {
        // 전조: 실제 피해 히트박스가 될 최종 크기를 처음부터 굵은 테두리로 보여준다.
        drawDamageRangeFrame(0.72 + warningT * 0.24 + pulse * 0.05, false);

        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha *= 0.42 + warningT * 0.22 + pulse * 0.05;
        const shellGrad = ctx.createRadialGradient(x, drawY, 6, x, drawY, Math.max(w, d) * 0.48);
        shellGrad.addColorStop(0.00, `rgba(220,200,255,${0.050 + warningT * 0.040})`);
        shellGrad.addColorStop(0.22, `rgba(122,64,255,${0.12 + warningT * 0.08})`);
        shellGrad.addColorStop(0.58, `rgba(18,0,70,${0.22 + warningT * 0.08})`);
        shellGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = shellGrad;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx * (0.38 + warningT * 0.18), ry * (0.38 + warningT * 0.18), Math.sin(Date.now()/120)*0.06, 0, Math.PI * 2);
        ctx.fill();

        drawBurstCracks(0.58 + warningT * 0.25, 0.78, 0.82 + warningT * 0.16, warningT * 0.22, false);

        if (warningT > 0.68) {
            const charge = (warningT - 0.68) / 0.32;
            const chargeGrad = ctx.createRadialGradient(x, drawY, 1, x, drawY, Math.max(rx, ry) * (0.07 + charge * 0.18));
            chargeGrad.addColorStop(0.00, `rgba(244,234,255,${0.26 * charge})`);
            chargeGrad.addColorStop(0.30, `rgba(138,82,255,${0.22 * charge})`);
            chargeGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
            ctx.fillStyle = chargeGrad;
            ctx.beginPath();
            ctx.arc(x, drawY, Math.max(6, Math.min(rx, ry) * (0.08 + charge * 0.11)), 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        // 판정 발생: 전조와 구분되도록 범위 전체가 짙은 보라/검정 폭발로 뒤덮인다.
        const aMul = Math.max(0, 1 - burstT * 0.55);
        drawDamageRangeFrame(0.92 * aMul, true);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha *= aMul;
        const grad = ctx.createRadialGradient(x, drawY, 4, x, drawY, Math.max(w, d) * (0.58 + burstT * 0.18));
        grad.addColorStop(0.00, `rgba(232,218,255,${0.38 * aMul})`);
        grad.addColorStop(0.15, `rgba(118,52,238,${0.48 * aMul})`);
        grad.addColorStop(0.36, `rgba(42,0,112,${0.62 * aMul})`);
        grad.addColorStop(0.66, `rgba(5,0,22,${0.72 * aMul})`);
        grad.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx * (0.94 + burstT * 0.08), ry * (0.94 + burstT * 0.08), 0, 0, Math.PI * 2);
        ctx.fill();

        const flashAlpha = Math.max(0, 1 - burstT * 2.2);
        if (flashAlpha > 0) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowBlur = 34;
            ctx.shadowColor = 'rgba(150,86,255,0.92)';
            ctx.strokeStyle = `rgba(238,226,255,${0.76 * flashAlpha})`;
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.ellipse(x, drawY, rx * 0.96, ry * 0.96, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        drawBurstCracks(1.02 + burstT * 0.10, 1.0, 1.12, burstT, true);

        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 22;
        ctx.shadowColor = 'rgba(116,58,255,0.74)';
        for (let i = 0; i < 26; i++) {
            const ang = i * Math.PI * 2 / 26 + burstT * 0.38;
            const startX = x + Math.cos(ang) * rx * 0.12;
            const startY = drawY + Math.sin(ang) * ry * 0.12;
            const endX = x + Math.cos(ang) * rx * (0.76 + burstT * 0.22 + (i % 5) * 0.018);
            const endY = drawY + Math.sin(ang) * ry * (0.76 + burstT * 0.22 + (i % 4) * 0.018);
            ctx.strokeStyle = i % 3 === 0 ? `rgba(0,0,0,${0.80 * aMul})` : `rgba(122,72,255,${0.58 * aMul})`;
            ctx.lineWidth = i % 3 === 0 ? 6.8 : 3.8;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
    ctx.restore();
};


GameRenderer.drawKasiyasSwordStormObject = function(ctx, obj, apostle = false) {
    const drawY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const z = parseFloat(obj.z) || 0;
    const bodyY = drawY - z;
    const action = obj.action || {};
    const progress = Math.max(0, Math.min(1, (parseFloat(obj.actionTimer) || 0) / Math.max(0.001, parseFloat(obj.actionDuration) || parseFloat(action.Action_Anim_Duration) || 1)));
    const now = Date.now();
    const spin = now / (apostle ? 82 : 94) + (parseFloat(obj.x) || 0) * 0.013;
    const pulse = 0.5 + Math.sin(now / 118 + (parseFloat(obj.y) || 0) * 0.02) * 0.5;
    const actionType = String(action.Action_Type || '').trim().toUpperCase();
    const hasActionHitbox = !isNaN(parseFloat(action.Hitbox_Size_X))
        || !isNaN(parseFloat(action.Hitbox_Size_Y))
        || !isNaN(parseFloat(action.Hitbox_Size_Z));
    if (hasActionHitbox) {
        // DISAPPEAR 액션에는 별도 히트박스가 없으므로, 직전 MOVE/ATK 액션의 판정 크기를 저장해둔다.
        // 이렇게 해야 폭발 후 소멸 단계에서 기본값(750/250/1200)으로 다시 커져 보이지 않는다.
        obj.lastSwordStormHitboxSize = {
            w: parseFloat(action.Hitbox_Size_X) || (obj.lastSwordStormHitboxSize && obj.lastSwordStormHitboxSize.w) || 750,
            d: parseFloat(action.Hitbox_Size_Y) || (obj.lastSwordStormHitboxSize && obj.lastSwordStormHitboxSize.d) || 250,
            h: parseFloat(action.Hitbox_Size_Z) || (obj.lastSwordStormHitboxSize && obj.lastSwordStormHitboxSize.h) || 1200
        };
    }
    const lastStormHitbox = obj.lastSwordStormHitboxSize || null;
    const hitW = parseFloat(action.Hitbox_Size_X) || (lastStormHitbox && lastStormHitbox.w) || 650;
    const hitD = parseFloat(action.Hitbox_Size_Y) || (lastStormHitbox && lastStormHitbox.d) || 200;
    const hitH = parseFloat(action.Hitbox_Size_Z) || (lastStormHitbox && lastStormHitbox.h) || 1200;

    // 회오리 검풍은 실제 X/Y 히트박스보다 작게 보이면 불공정하게 느껴진다.
    // 따라서 렌더 폭과 깊이는 히트박스 투영 범위를 거의 채우게 하고,
    // Z축은 화면을 과도하게 덮지 않는 범위에서 충분히 큰 폭풍 기둥으로 압축해 표현한다.
    // 폭발 이후 DISAPPEAR 단계에서는 더 커지지 않고 직전 크기에서 서서히 줄어들며 사라진다.
    const disappearShrink = actionType === 'DISAPPEAR' ? Math.max(0.56, 1 - progress * 0.34) : 1;
    const visualW = Math.max(360, Math.min(900, hitW * (actionType === 'ATK' ? 0.96 : 0.88) * disappearShrink));
    const visualD = Math.max(105, Math.min(360, hitD * (actionType === 'ATK' ? 1.00 : 0.94) * disappearShrink));
    const visualH = Math.max(300, Math.min(640, hitH * (actionType === 'ATK' ? 0.40 : 0.36) * disappearShrink));
    const burstScale = actionType === 'ATK' ? (1 + 0.20 * Math.sin(progress * Math.PI)) : 1;

    const core = apostle ? 'rgba(255,54,44,0.92)' : 'rgba(228,250,255,0.92)';
    const mid = apostle ? 'rgba(120,0,0,0.82)' : 'rgba(112,188,220,0.72)';
    const dark = apostle ? 'rgba(7,0,0,0.92)' : 'rgba(5,20,30,0.88)';
    const blade = apostle ? 'rgba(255,80,62,0.88)' : 'rgba(186,236,255,0.86)';
    const bladeDark = apostle ? 'rgba(26,0,0,0.92)' : 'rgba(8,24,36,0.82)';
    const hot = apostle ? 'rgba(255,202,108,0.70)' : 'rgba(255,255,250,0.70)';

    ctx.save();
    const disappearAlpha = actionType === 'DISAPPEAR' ? Math.max(0, 1 - progress * 0.88) : 1;
    ctx.globalAlpha = Math.max(0.02, Math.min(1, parseFloat(obj.opacity) || 0.92) * disappearAlpha);

    // 지면 그림자와 회오리 밑동. 히트박스 Y 깊이에 맞춰 넓게 깔아 판정 범위를 읽기 쉽게 한다.
    ctx.fillStyle = apostle ? 'rgba(18,0,0,0.44)' : 'rgba(0,18,28,0.36)';
    ctx.beginPath();
    ctx.ellipse(obj.x, drawY + 4, visualW * 0.50 * burstScale, visualD * 0.42 * burstScale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(obj.x, bodyY - visualH * 0.47);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 회오리 몸통: 위/아래가 두껍고 중간 허리만 살짝 들어간 기둥형 실루엣.
    // 이전처럼 위로 갈수록 계속 좁아지는 삼각형이 되지 않게 층별 폭을 보정한다.
    const layerCount = 12;
    for (let i = 0; i < layerCount; i++) {
        const layerT = i / (layerCount - 1); // 0 = 아래, 1 = 위
        const y = visualH * (0.46 - layerT * 0.94);
        const waist = Math.abs(layerT - 0.52) / 0.52;
        const widthFactor = 0.78 + 0.18 * waist + 0.035 * Math.sin(spin * 0.45 + i * 1.17);
        const layerW = visualW * widthFactor * burstScale;
        const layerH = visualD * (0.24 + 0.035 * Math.cos(layerT * Math.PI * 2)) * burstScale;
        const angle = spin * (i % 2 ? -1 : 1) + i * 0.61;
        const alpha = 0.30 + (0.5 + 0.5 * waist) * 0.18 + pulse * 0.06;

        const grad = ctx.createLinearGradient(-layerW * 0.58, y, layerW * 0.58, y);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.14, dark.replace(/0\.\d+\)/, `${Math.min(0.92, alpha + 0.10).toFixed(2)})`));
        grad.addColorStop(0.48, core.replace(/0\.\d+\)/, `${Math.min(0.96, alpha + 0.18).toFixed(2)})`));
        grad.addColorStop(0.84, mid.replace(/0\.\d+\)/, `${Math.min(0.88, alpha + 0.03).toFixed(2)})`));
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(11, visualD * (0.070 - layerT * 0.010));
        ctx.shadowBlur = apostle ? 22 : 15;
        ctx.shadowColor = apostle ? 'rgba(210,0,0,0.62)' : 'rgba(160,230,255,0.44)';
        ctx.beginPath();
        ctx.ellipse(Math.sin(angle) * visualW * 0.028, y, layerW * 0.49, layerH, Math.sin(angle) * 0.10, Math.PI * (0.04 + (angle % 0.22)), Math.PI * (1.88 + (angle % 0.16)));
        ctx.stroke();

        ctx.strokeStyle = hot.replace(/0\.\d+\)/, `${(0.22 + alpha * 0.38).toFixed(2)})`);
        ctx.lineWidth = Math.max(2.0, visualD * 0.018);
        ctx.beginPath();
        ctx.ellipse(-Math.cos(angle) * visualW * 0.04, y - layerH * 0.12, layerW * 0.35, layerH * 0.62, -Math.sin(angle) * 0.12, Math.PI * 0.08, Math.PI * 1.26);
        ctx.stroke();
    }

    // 히트박스 폭에 맞춘 주변 잔류 검격. 폭풍 본체 외곽까지 넓게 돌아 판정 범위를 암시한다.
    ctx.shadowBlur = apostle ? 14 : 9;
    ctx.shadowColor = apostle ? 'rgba(255,32,22,0.58)' : 'rgba(128,218,255,0.52)';
    const bladeCount = apostle ? 24 : 22;
    for (let i = 0; i < bladeCount; i++) {
        const a = spin * (i % 2 ? -1.18 : 1.0) + i * Math.PI * 2 / bladeCount;
        const band = (i % 6) / 5;
        const ry = visualH * (0.38 - band * 0.78) + Math.sin(spin + i) * 9;
        const rx = Math.cos(a) * visualW * (0.47 + 0.10 * Math.sin(i * 3.1 + spin));
        const rz = Math.sin(a) * visualD * 0.27;
        const bladeLen = Math.max(26, visualW * 0.045) + (i % 4) * 5;
        const bladeWid = 7 + (i % 3);
        ctx.save();
        ctx.translate(rx, ry + rz * 0.35);
        ctx.rotate(a + Math.PI * 0.52);
        ctx.fillStyle = bladeDark;
        ctx.beginPath();
        ctx.moveTo(-bladeLen * 0.55, 0);
        ctx.quadraticCurveTo(-bladeLen * 0.06, -bladeWid, bladeLen * 0.54, -bladeWid * 0.15);
        ctx.quadraticCurveTo(0, bladeWid * 0.82, -bladeLen * 0.55, 0);
        ctx.fill();
        ctx.fillStyle = blade;
        ctx.beginPath();
        ctx.moveTo(-bladeLen * 0.42, -bladeWid * 0.05);
        ctx.quadraticCurveTo(0, -bladeWid * 0.62, bladeLen * 0.48, -bladeWid * 0.12);
        ctx.quadraticCurveTo(0, bladeWid * 0.46, -bladeLen * 0.42, -bladeWid * 0.05);
        ctx.fill();
        ctx.restore();
    }

    // 폭발 액션 중에는 회오리 중심이 맥동하며 실제 폭발 판정 크기까지 발산한다.
    if (actionType === 'ATK') {
        const b = Math.sin(progress * Math.PI);
        ctx.shadowBlur = apostle ? 40 : 30;
        ctx.shadowColor = apostle ? 'rgba(255,28,16,0.92)' : 'rgba(210,246,255,0.88)';
        const grad = ctx.createRadialGradient(0, visualH * 0.02, 12, 0, visualH * 0.02, visualW * (0.42 + b * 0.40));
        grad.addColorStop(0, apostle ? `rgba(255,210,120,${0.52 * b})` : `rgba(255,255,255,${0.54 * b})`);
        grad.addColorStop(0.45, apostle ? `rgba(255,40,28,${0.36 * b})` : `rgba(130,226,255,${0.32 * b})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, visualH * 0.02, visualW * (0.46 + b * 0.36), visualD * (0.44 + b * 0.42), 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
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


GameRenderer.getKasiyasObjectDisplayRange = function(obj, defaultX = 120, defaultY = 80) {
    const data = obj && obj.data ? obj.data : {};
    const hitX = parseFloat(obj && obj.w) || parseFloat(data.Hitbox_Size_X);
    const hitY = parseFloat(obj && obj.d) || parseFloat(data.Hitbox_Size_Y);
    const interactX = parseFloat(obj && obj.getRangeX) || parseFloat(data.Object_Interact_Range_X) || parseFloat(data.Object_Get_Range_X);
    const interactY = parseFloat(obj && obj.getRangeY) || parseFloat(data.Object_Interact_Range_Y) || parseFloat(data.Object_Get_Range_Y);
    return {
        // 히트박스 크기는 전체 폭/깊이로 보고, 표시용 타원에는 반지름으로 사용한다.
        x: Math.max(20, Number.isFinite(hitX) && hitX > 0 ? hitX * 0.5 : (Number.isFinite(interactX) && interactX > 0 ? interactX : defaultX)),
        y: Math.max(16, Number.isFinite(hitY) && hitY > 0 ? hitY * 0.5 : (Number.isFinite(interactY) && interactY > 0 ? interactY : defaultY))
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
    const displayRange = typeof this.getKasiyasObjectDisplayRange === 'function' ? this.getKasiyasObjectDisplayRange(obj, 90, 50) : { x: 90, y: 50 };
    const rangeX = displayRange.x;
    const rangeY = displayRange.y;

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
        // 히트박스가 없으면 Object_Interact_Range_X/Y를 반지름처럼 사용해 실제 상호작용 가능 범위와 표시 범위를 맞춘다.
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



GameRenderer.drawKasiyasCrackedBlackholePortal = function(ctx, sx, sy, rx, ry, alpha = 1, t = 0, options = {}) {
    if (!ctx) return;
    const vertical = options.vertical !== false;
    const portalCore = options.portalCore || 'rgba(24,2,48,0.96)';
    const coreBlue = options.coreBlue || 'rgba(38,92,255,0.80)';
    const coreCyan = options.coreCyan || 'rgba(170,246,255,0.72)';
    const crackColor = options.crackColor || 'rgba(205,162,255,0.80)';
    const rimColor = options.rimColor || 'rgba(112,42,210,0.82)';
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = 'source-over';

    // 기존 공간이 찢겨 나간 외곽 그림자.
    ctx.fillStyle = 'rgba(0,0,0,0.58)';
    ctx.beginPath();
    for (let i = 0; i <= 34; i++) {
        const a = i / 34 * Math.PI * 2;
        const noise = 1 + Math.sin(a * 5 + t * 1.5) * 0.10 + Math.cos(a * 9 - t * 1.9) * 0.055;
        const x = sx + Math.cos(a) * rx * (1.05 + noise * 0.10);
        const y = sy + Math.sin(a) * ry * (1.04 + noise * 0.10);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // 내부 블랙홀/심연.
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(sx - rx * 0.18, sy + ry * 0.15, 4, sx, sy, Math.max(rx, ry) * 1.05);
    g.addColorStop(0.00, coreCyan);
    g.addColorStop(0.16, coreBlue);
    g.addColorStop(0.36, 'rgba(24,0,96,0.78)');
    g.addColorStop(0.62, portalCore);
    g.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(sx, sy, rx * 0.86, ry * 0.90, Math.sin(t * 0.7) * 0.05, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i++) {
        const r = 0.28 + i * 0.13;
        ctx.strokeStyle = i % 2 ? `rgba(48,128,255,${(0.42 - i * 0.035) * alpha})` : `rgba(110,38,220,${(0.50 - i * 0.04) * alpha})`;
        ctx.lineWidth = Math.max(1.4, (vertical ? rx : ry) * (0.055 - i * 0.004));
        ctx.shadowBlur = 14;
        ctx.shadowColor = i % 2 ? 'rgba(68,128,255,0.70)' : 'rgba(140,40,255,0.72)';
        ctx.beginPath();
        ctx.ellipse(sx, sy, rx * r, ry * (r * 0.96 + 0.04), t * 0.55 + i * 0.45, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 찢긴 균열 테두리와 균열선.
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 16;
    ctx.shadowColor = 'rgba(150,62,255,0.84)';
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = Math.max(4, rx * 0.055);
    ctx.beginPath();
    for (let i = 0; i <= 42; i++) {
        const a = i / 42 * Math.PI * 2;
        const noise = 1 + Math.sin(a * 6 + t * 2.2) * 0.11 + Math.cos(a * 11) * 0.06;
        const x = sx + Math.cos(a) * rx * noise;
        const y = sy + Math.sin(a) * ry * noise;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = crackColor;
    ctx.lineWidth = Math.max(1.2, rx * 0.018);
    ctx.shadowBlur = 9;
    const cracks = options.cracks || 20;
    for (let i = 0; i < cracks; i++) {
        const a = i / cracks * Math.PI * 2 + Math.sin(i * 1.7) * 0.11;
        const edgeX = sx + Math.cos(a) * rx * (0.88 + (i % 3) * 0.055);
        const edgeY = sy + Math.sin(a) * ry * (0.88 + (i % 4) * 0.035);
        const len = (i % 2 ? rx : ry) * (0.24 + (i % 5) * 0.035);
        ctx.beginPath();
        ctx.moveTo(edgeX, edgeY);
        ctx.lineTo(edgeX + Math.cos(a) * len, edgeY + Math.sin(a) * len * (vertical ? 1.18 : 0.72));
        if (i % 3 === 0) {
            const bx = edgeX + Math.cos(a) * len * 0.55;
            const by = edgeY + Math.sin(a) * len * 0.55;
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(a + 0.55) * len * 0.33, by + Math.sin(a + 0.55) * len * 0.33);
        }
        ctx.stroke();
    }
    ctx.restore();
};

GameRenderer.drawKasiyasDimensionPortalObject = function(ctx, obj) {
    if (!obj) return;
    const renderTypeForPortal = String(obj.renderType || obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase();
    if ((renderTypeForPortal === 'OBJ_P2_M2_GIANT_DIMENSION_PORTAL' || renderTypeForPortal === 'OBJ_GIANT_DIMENSION_PORTAL') && typeof this.drawKasiyasP2M2GiantDimensionPortalObject === 'function') {
        this.drawKasiyasP2M2GiantDimensionPortalObject(ctx, obj);
        return;
    }
    const t = (parseFloat(obj.timer) || 0) + Date.now() / 1000;
    const life = Math.max(0.001, parseFloat(obj.maxLife) || 4);
    const progress = Math.max(0, Math.min(1, (parseFloat(obj.timer) || 0) / life));
    const open = Math.min(1, progress / 0.10);
    const close = Math.min(1, (1 - progress) / 0.14);
    const alpha = Math.max(0, Math.min(1, open * close));
    const worldW = (this.gameState && this.gameState.WORLD_WIDTH) || 1400;
    const sx = Number.isFinite(parseFloat(obj.x)) ? parseFloat(obj.x) : worldW / 2;
    const worldY = Number.isFinite(parseFloat(obj.y)) ? parseFloat(obj.y) : 34;
    const sy = Math.max(82, Math.min(184, this.GROUND_BASE_Y + worldY - 250));

    if (renderTypeForPortal === 'OBJ_P3_M2_GIANT_DIMENSION_PORTAL_SKY') {
        const width = worldW * 1.06;
        const height = 182;
        const topY = Math.max(34, sy - 26 + Math.sin(t * 0.55) * 1.5);
        const jag = 0.18 + 0.08 * Math.sin(t * 0.7);

        ctx.save();
        ctx.globalAlpha = 0.28 * alpha;
        const fog = ctx.createLinearGradient(sx, topY - height * 0.85, sx, topY + height * 0.72);
        fog.addColorStop(0, 'rgba(0,0,0,0)');
        fog.addColorStop(0.18, 'rgba(34,0,60,0.30)');
        fog.addColorStop(0.42, 'rgba(58,0,40,0.40)');
        fog.addColorStop(0.74, 'rgba(14,0,18,0.18)');
        fog.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fog;
        ctx.beginPath();
        ctx.ellipse(sx, topY, width * 0.56, height * 0.78, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.82 * alpha;
        ctx.fillStyle = 'rgba(6,0,10,0.92)';
        ctx.beginPath();
        ctx.moveTo(sx - width * 0.52, topY + 8);
        for (let i = 0; i <= 28; i++) {
            const p = i / 28;
            const px = sx - width * 0.52 + width * 1.04 * p;
            const spike = Math.sin(p * Math.PI) * height * (0.52 + 0.06 * Math.sin(t * 2.1 + p * 10.0));
            const edge = ((i % 2 === 0) ? 1 : -1) * (6 + 8 * jag);
            const py = topY - spike + edge;
            if (i === 0) ctx.lineTo(px, topY); else ctx.lineTo(px, py);
        }
        for (let i = 28; i >= 0; i--) {
            const p = i / 28;
            const px = sx - width * 0.52 + width * 1.04 * p;
            const bulge = Math.sin(p * Math.PI) * height * (0.18 + 0.02 * Math.cos(t * 1.7 + p * 8.0));
            const edge = ((i % 2 === 0) ? -1 : 1) * (3 + 3 * jag);
            const py = topY + bulge + edge;
            ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.85 * alpha;
        ctx.strokeStyle = 'rgba(180,84,255,0.88)';
        ctx.lineWidth = 4.2;
        ctx.shadowBlur = 28;
        ctx.shadowColor = 'rgba(154,72,255,0.84)';
        ctx.beginPath();
        ctx.moveTo(sx - width * 0.52, topY + 3);
        for (let i = 0; i <= 22; i++) {
            const p = i / 22;
            const px = sx - width * 0.52 + width * 1.04 * p;
            const py = topY - Math.sin(p * Math.PI) * height * (0.56 + 0.05 * Math.sin(t * 2.0 + p * 6.0));
            ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,78,70,0.74)';
        ctx.lineWidth = 2.6;
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255,62,62,0.66)';
        for (let i = 0; i < 12; i++) {
            const p = (i + 0.5) / 12;
            const cx = sx - width * 0.42 + width * 0.84 * p;
            const cy = topY - Math.sin(p * Math.PI) * height * 0.30;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.sin(t * 2.0 + i) * 10, cy + 28);
            ctx.lineTo(cx - 4, cy + 58 + (i % 3) * 8);
            ctx.stroke();
        }
        const core = ctx.createRadialGradient(sx, topY - 4, 8, sx, topY - 4, width * 0.15);
        core.addColorStop(0, 'rgba(255,224,255,0.72)');
        core.addColorStop(0.25, 'rgba(160,88,255,0.54)');
        core.addColorStop(0.6, 'rgba(90,0,120,0.16)');
        core.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.ellipse(sx, topY - 4, width * 0.15, height * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }

    const rx = 180 + Math.sin(t * 2.3) * 8;
    const ry = 76 + Math.cos(t * 1.7) * 5;
    this.drawKasiyasCrackedBlackholePortal(ctx, sx, sy, rx, ry, alpha, t, { vertical: false, cracks: 14 });
};

GameRenderer.drawKasiyasP2M2MiniSword = function(ctx, x, y, len, angle, alpha, palette = {}) {
    const edge = palette.edge || 'rgba(18,0,0,0.92)';
    const metal = palette.metal || 'rgba(178,168,168,0.84)';
    const core = palette.core || 'rgba(255,70,52,0.72)';
    const hot = palette.hot || 'rgba(255,224,190,0.64)';
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    // 검벽/차원문 내부 칼날이 실제 진행 방향(플레이어 쪽)을 향하도록 미니 검 모델을 좌우 반전한다.
    // 호출부의 각도/흔들림은 유지하고, 칼날-꼬리 실루엣만 뒤집는다.
    ctx.scale(-1, 1);
    ctx.globalAlpha *= alpha;
    ctx.lineJoin = 'miter';
    ctx.lineCap = 'butt';

    // 사도의 기운 꼬리. 검이 플레이어 방향으로 밀려오는 느낌을 준다.
    // 팔레트가 있으면 붉은색만 고정하지 않고 남보라/회백색 계열로도 표현한다.
    ctx.globalCompositeOperation = 'lighter';
    const tailColor = palette.tail || 'rgba(112,84,188,0.42)';
    const tail = ctx.createLinearGradient(len * 0.05, 0, len * 0.55, 0);
    tail.addColorStop(0, tailColor);
    tail.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = tail;
    ctx.beginPath();
    ctx.moveTo(len * 0.05, -len * 0.050);
    ctx.lineTo(len * 0.58, -len * 0.12);
    ctx.lineTo(len * 0.45, 0);
    ctx.lineTo(len * 0.58, len * 0.12);
    ctx.lineTo(len * 0.05, len * 0.050);
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = Math.max(3, len * 0.05);
    ctx.shadowColor = palette.shadow || 'rgba(86,54,180,0.46)';
    const bladeGrad = ctx.createLinearGradient(-len * 0.48, 0, len * 0.20, 0);
    bladeGrad.addColorStop(0, hot);
    bladeGrad.addColorStop(0.25, metal);
    bladeGrad.addColorStop(0.72, 'rgba(70,45,48,0.90)');
    bladeGrad.addColorStop(1, edge);
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(-len * 0.52, 0);
    ctx.lineTo(-len * 0.22, -len * 0.055);
    ctx.lineTo(len * 0.22, -len * 0.034);
    ctx.lineTo(len * 0.31, 0);
    ctx.lineTo(len * 0.22, len * 0.034);
    ctx.lineTo(-len * 0.22, len * 0.055);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = edge;
    ctx.lineWidth = Math.max(1, len * 0.018);
    ctx.stroke();
    ctx.strokeStyle = hot;
    ctx.lineWidth = Math.max(1, len * 0.010);
    ctx.beginPath();
    ctx.moveTo(-len * 0.43, 0);
    ctx.lineTo(len * 0.18, 0);
    ctx.stroke();

    ctx.strokeStyle = core;
    ctx.lineWidth = Math.max(1.2, len * 0.024);
    ctx.beginPath();
    ctx.moveTo(len * 0.18, -len * 0.075);
    ctx.lineTo(len * 0.18, len * 0.075);
    ctx.stroke();
    ctx.restore();
};

GameRenderer.drawKasiyasP2M2GiantDimensionPortalObject = function(ctx, obj) {
    if (!obj) return;
    const t = (parseFloat(obj.timer) || 0) + Date.now() / 1000;
    const life = Math.max(0.001, parseFloat(obj.maxLife) || 20);
    const progress = Math.max(0, Math.min(1, (parseFloat(obj.timer) || 0) / life));
    const open = Math.min(1, progress / 0.08);
    const close = Math.min(1, (1 - progress) / 0.10);
    const alpha = Math.max(0, Math.min(1, open * close));
    const worldW = (this.gameState && this.gameState.WORLD_WIDTH) || 1400;
    const worldD = (this.gameState && this.gameState.WORLD_DEPTH) || 400;
    const sx = Number.isFinite(parseFloat(obj.x)) ? parseFloat(obj.x) : worldW + 34;
    const sy = this.GROUND_BASE_Y + (Number.isFinite(parseFloat(obj.y)) ? parseFloat(obj.y) : worldD / 2);
    const rx = 104 + Math.sin(t * 2.0) * 5;
    const ry = Math.max(238, worldD * 0.61) + Math.cos(t * 1.6) * 8;

    this.drawKasiyasCrackedBlackholePortal(ctx, sx, sy, rx, ry, alpha, t, {
        vertical: true,
        cracks: 24,
        portalCore: 'rgba(8,0,36,0.98)',
        coreBlue: 'rgba(32,74,255,0.86)',
        coreCyan: 'rgba(190,248,255,0.86)',
        rimColor: 'rgba(142,58,255,0.84)',
        crackColor: 'rgba(210,170,255,0.82)'
    });

    // 차원문 안에서 검들이 플레이어 방향으로 대기하는 실루엣.
    // 붉은 면을 줄이고 금속성 칼날/남보라 에너지를 섞어 맵 타일과 구분되게 한다.
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 30; i++) {
        const band = i / 29;
        const jitterY = Math.sin(t * 1.7 + i * 1.91) * (10 + (i % 3) * 3);
        const yy = sy - ry * 0.80 + band * ry * 1.60 + jitterY;
        const xx = sx - rx * (0.16 + (i % 5) * 0.082) + Math.cos(t * 0.9 + i * 0.73) * (10 + (i % 4) * 4);
        const len = 58 + (i % 6) * 10 + ((i * 17) % 11);
        const angle = Math.PI + Math.sin(i * 1.17 + t * 0.15) * 0.20;
        this.drawKasiyasP2M2MiniSword(ctx, xx, yy, len, angle, 0.24 + (i % 4) * 0.055, {
            edge: 'rgba(8,8,18,0.82)',
            metal: 'rgba(206,216,222,0.62)',
            core: 'rgba(110,86,180,0.38)',
            hot: 'rgba(232,246,255,0.48)'
        });
    }
    ctx.restore();
};


// 2페이즈 대형 패턴 2번 검벽 렌더링용 빈틈 슬롯 계산.
// combat system에도 같은 의미의 함수가 있지만, 렌더러는 GameRenderer 컨텍스트에서 실행되므로
// 렌더 중 TypeError로 전체 프레임/HUD가 끊기지 않도록 렌더러 쪽에도 안전한 helper를 둔다.
GameRenderer.getKasiyasP2M2SwordWallGapSlot = function(obj) {
    if (!obj) return -1;
    const data = obj.data || {};
    const dataSlot = parseFloat(data.Sword_Wall_Gap_Slot_Index);
    if (Number.isFinite(dataSlot)) return Math.max(0, Math.min(4, Math.round(dataSlot)));
    const renderType = String(obj.renderType || data.Object_Render_Type || '').trim().toUpperCase();
    const name = String(obj.name || data.Object_Name || data.Name || '').trim().toUpperCase();
    const key = `${renderType} ${name}`;
    if (key.indexOf('GAP_TOP') >= 0 || key.indexOf('최상단') >= 0) return 0;
    if (key.indexOf('GAP_UPPER') >= 0 || key.indexOf('상단') >= 0) return 1;
    if (key.indexOf('GAP_MIDDLE') >= 0 || key.indexOf('중단') >= 0 || key.indexOf('중앙') >= 0) return 2;
    if (key.indexOf('GAP_LOWER') >= 0 || key.indexOf('하단') >= 0) return 3;
    if (key.indexOf('GAP_BOTTOM') >= 0 || key.indexOf('최하단') >= 0) return 4;
    return -1;
};

GameRenderer.getKasiyasP2M2SwordWallGapInfo = function(obj, wallD) {
    if (!obj) return null;
    const data = obj.data || {};
    const targetD = Math.max(1, parseFloat(wallD) || parseFloat(data.Sword_Wall_Total_Y) || parseFloat(obj.d) || ((this.gameState && this.gameState.WORLD_DEPTH) || 400));
    const totalRaw = parseFloat(data.Sword_Wall_Total_Y);
    const totalY = Number.isFinite(totalRaw) && totalRaw > 0 ? totalRaw : targetD;
    const slot = typeof this.getKasiyasP2M2SwordWallGapSlot === 'function' ? this.getKasiyasP2M2SwordWallGapSlot(obj) : -1;
    const slotH = totalY / 5;
    let centerY = parseFloat(data.Sword_Wall_Gap_Center_Y);
    let gapSizeY = parseFloat(data.Sword_Wall_Gap_Size_Y);
    if (!Number.isFinite(centerY)) {
        if (slot < 0) return null;
        centerY = (slot + 0.5) * slotH;
    }
    if (!Number.isFinite(gapSizeY) || gapSizeY <= 0) gapSizeY = slotH;
    centerY = Math.max(0, Math.min(totalY, centerY));
    gapSizeY = Math.max(1, Math.min(totalY, gapSizeY));
    const scale = targetD / totalY;
    const localCenter = centerY * scale;
    const localSize = gapSizeY * scale;
    return {
        slot,
        totalY,
        centerY,
        gapSizeY,
        localCenter,
        localSize,
        localStart: Math.max(0, localCenter - localSize / 2),
        localEnd: Math.min(targetD, localCenter + localSize / 2)
    };
};

GameRenderer.drawKasiyasP2M2SwordWallObject = function(ctx, obj) {
    if (!obj) return;
    const data = obj.data || {};
    const action = obj.action || {};
    const objectType = String(obj.objectType || data.Object_Type || '').trim().toUpperCase();
    const renderType = String(obj.renderType || data.Object_Render_Type || '').trim().toUpperCase();
    const isGiant = objectType === 'SWORD_WALL_GIANT_SWORD' || renderType.indexOf('GIANT_SWORD') >= 0;
    if (isGiant) {
        this.drawKasiyasP2M2GiantSwordWallObject(ctx, obj);
        return;
    }

    const warning = String(action.Action_Type || '').trim().toUpperCase() === 'WARNING';
    const worldW = (this.gameState && this.gameState.WORLD_WIDTH) || 1400;
    const worldD = (this.gameState && this.gameState.WORLD_DEPTH) || 400;
    const hitW = Math.max(90, parseFloat(action.Hitbox_Size_X) || parseFloat(obj.w) || 150);
    const hitD = Math.max(300, parseFloat(action.Hitbox_Size_Y) || parseFloat(data.Sword_Wall_Total_Y) || parseFloat(obj.d) || worldD);
    const gapInfo = (typeof this.getKasiyasP2M2SwordWallGapInfo === 'function') ? this.getKasiyasP2M2SwordWallGapInfo(obj, hitD) : null;
    const sx = Number.isFinite(parseFloat(obj.x)) ? parseFloat(obj.x) : ((this.gameState && this.gameState.WORLD_WIDTH) || 1400);
    const sy = this.GROUND_BASE_Y + (Number.isFinite(parseFloat(obj.y)) ? parseFloat(obj.y) : worldD / 2) - (parseFloat(obj.z) || 0);
    const top = sy - hitD / 2;
    const bottom = top + hitD;
    const gapStart = gapInfo ? top + gapInfo.localStart : null;
    const gapEnd = gapInfo ? top + gapInfo.localEnd : null;
    const timer = (parseFloat(obj.timer) || 0) + Date.now() / 1000;
    const actionDuration = Math.max(0.001, parseFloat(action.Action_Anim_Duration) || parseFloat(obj.maxLife) || 1);
    const actionProgress = Math.max(0, Math.min(1, (parseFloat(obj.actionTimer) || 0) / actionDuration));
    const alpha = Math.max(0.18, Math.min(1, warning ? 0.48 + Math.sin(timer * 10) * 0.10 : 0.92));
    const dangerSegments = gapInfo
        ? [[top, gapStart], [gapEnd, bottom]].filter(seg => seg[1] - seg[0] > 2)
        : [[top, bottom]];

    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = 'lighter';

    const drawPathDangerSegment = (y0, y1) => {
        const h = Math.max(1, y1 - y0);
        const grad = ctx.createLinearGradient(worldW, y0, 0, y0);
        grad.addColorStop(0, 'rgba(64,46,100,0.23)');
        grad.addColorStop(0.48, 'rgba(18,14,32,0.18)');
        grad.addColorStop(1, 'rgba(0,0,0,0.08)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, y0 + 2, worldW, Math.max(1, h - 4));
        ctx.strokeStyle = 'rgba(205,218,232,0.30)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, y0 + h * 0.50);
        ctx.lineTo(worldW, y0 + h * 0.50);
        ctx.stroke();
    };

    if (warning) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        dangerSegments.forEach(seg => drawPathDangerSegment(seg[0], seg[1]));
        if (gapInfo) {
            ctx.fillStyle = 'rgba(0,0,0,0.13)';
            ctx.fillRect(0, gapStart, worldW, Math.max(1, gapEnd - gapStart));
            ctx.strokeStyle = 'rgba(255,232,180,0.72)';
            ctx.lineWidth = 2.4;
            ctx.setLineDash([18, 10]);
            ctx.beginPath();
            ctx.moveTo(0, gapStart + 4);
            ctx.lineTo(worldW, gapStart + 4);
            ctx.moveTo(0, gapEnd - 4);
            ctx.lineTo(worldW, gapEnd - 4);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.restore();
    }

    if (gapInfo) {
        ctx.save();
        ctx.globalAlpha *= warning ? 0.74 : 0.34;
        ctx.strokeStyle = warning ? 'rgba(255,236,190,0.86)' : 'rgba(255,210,160,0.50)';
        ctx.lineWidth = warning ? 3.0 : 1.6;
        ctx.setLineDash([10, 7]);
        ctx.beginPath();
        ctx.moveTo(warning ? 0 : sx - hitW * 0.68, gapStart + 4);
        ctx.lineTo(warning ? worldW : sx + hitW * 0.68, gapStart + 4);
        ctx.moveTo(warning ? 0 : sx - hitW * 0.68, gapEnd - 4);
        ctx.lineTo(warning ? worldW : sx + hitW * 0.68, gapEnd - 4);
        ctx.stroke();
        ctx.restore();
    }

    const drawDangerSegmentBody = (segIndex, y0, y1) => {
        const h = Math.max(1, y1 - y0);
        const zoneGrad = ctx.createLinearGradient(sx + hitW * 0.58, y0, sx - hitW * 0.86, y1);
        zoneGrad.addColorStop(0, `rgba(92,70,132,${warning ? 0.09 : 0.13})`);
        zoneGrad.addColorStop(0.44, `rgba(18,12,30,${warning ? 0.13 : 0.22})`);
        zoneGrad.addColorStop(0.78, `rgba(120,28,44,${warning ? 0.045 : 0.075})`);
        zoneGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = zoneGrad;
        ctx.fillRect(sx - hitW * 0.86, y0 + 2, hitW * 1.72, Math.max(1, h - 4));

        // 일정한 격자 배치를 피하기 위해 큰 검/중간 검을 섞고, 위치/각도/길이에 결정적 흔들림을 준다.
        const count = Math.max(3, Math.min(9, Math.ceil(h / (warning ? 48 : 42)) * 3));
        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / 3);
            const rows = Math.max(1, Math.ceil(count / 3));
            const seed = segIndex * 53 + i * 17;
            const lane = (i % 3) - 1;
            const offset = Math.sin(seed * 0.73) * 0.13 + Math.cos(seed * 0.31) * 0.08;
            const px = sx + hitW * (0.12 - lane * 0.30 + offset) + Math.sin(timer * 1.35 + seed) * (warning ? 4 : 13) - (warning ? 0 : actionProgress * 38);
            const py = y0 + h * ((row + 0.52 + Math.sin(seed) * 0.16) / rows) + Math.cos(timer * 1.4 + seed) * (warning ? 4 : 9);
            const len = (warning ? 70 : 92) + (i % 4) * 13 + ((seed % 11) * 0.9);
            const angle = Math.PI + Math.sin(seed * 0.27) * 0.24 + (warning ? 0 : -0.08 + Math.cos(seed) * 0.05);
            this.drawKasiyasP2M2MiniSword(ctx, px, py, len, angle, 0.58 + (i % 3) * 0.075, {
                edge: 'rgba(8,8,18,0.94)',
                metal: 'rgba(205,214,220,0.82)',
                core: warning ? 'rgba(116,82,190,0.42)' : 'rgba(126,92,210,0.58)',
                hot: warning ? 'rgba(234,246,255,0.44)' : 'rgba(240,248,255,0.68)',
                tail: warning ? 'rgba(100,68,168,0.18)' : 'rgba(96,70,180,0.26)',
                shadow: 'rgba(70,48,150,0.42)'
            });
        }
    };

    dangerSegments.forEach((seg, idx) => drawDangerSegmentBody(idx, seg[0], seg[1]));

    if (!warning) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha *= 0.50;
        ctx.strokeStyle = 'rgba(190,210,232,0.42)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const y = top + hitD * (i + 0.5) / 8;
            if (gapInfo && y >= gapStart && y <= gapEnd) continue;
            const tail = 0.86 + ((i * 13) % 5) * 0.03;
            ctx.beginPath();
            ctx.moveTo(sx + hitW * 0.64, y);
            ctx.lineTo(sx - hitW * tail, y + Math.sin(timer + i) * 12);
            ctx.stroke();
        }
    }
    ctx.restore();
};

GameRenderer.drawKasiyasP2M2GiantSwordWallObject = function(ctx, obj) {
    if (!obj) return;
    const action = obj.action || {};
    const warning = String(action.Action_Type || '').trim().toUpperCase() === 'WARNING';
    const worldW = (this.gameState && this.gameState.WORLD_WIDTH) || 1400;
    const worldD = (this.gameState && this.gameState.WORLD_DEPTH) || 400;
    const sx = Number.isFinite(parseFloat(obj.x)) ? parseFloat(obj.x) : ((this.gameState && this.gameState.WORLD_WIDTH) || 1400);
    const sy = this.GROUND_BASE_Y + (Number.isFinite(parseFloat(obj.y)) ? parseFloat(obj.y) : worldD / 2) - (parseFloat(obj.z) || 0);
    const timer = (parseFloat(obj.timer) || 0) + Date.now() / 1000;
    const data = obj.data || {};
    const baseLen = Math.max(260, parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 560);
    const baseBladeH = Math.max(70, parseFloat(obj.d) || parseFloat(data.Hitbox_Size_Y) || 112);
    const len = warning ? baseLen * 0.72 : baseLen;
    const bladeH = warning ? baseBladeH * 0.72 : baseBladeH;
    const alpha = warning ? 0.62 + Math.sin(timer * 10) * 0.08 : 0.96;

    if (warning) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        const pathGrad = ctx.createLinearGradient(worldW, sy, 0, sy);
        pathGrad.addColorStop(0, 'rgba(210,0,24,0.24)');
        pathGrad.addColorStop(0.45, 'rgba(96,0,0,0.18)');
        pathGrad.addColorStop(1, 'rgba(96,0,0,0.08)');
        ctx.fillStyle = pathGrad;
        ctx.fillRect(0, sy - bladeH * 0.78, worldW, bladeH * 1.56);
        ctx.strokeStyle = 'rgba(255,220,176,0.60)';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([20, 11]);
        ctx.beginPath();
        ctx.moveTo(0, sy - bladeH * 0.78);
        ctx.lineTo(worldW, sy - bladeH * 0.78);
        ctx.moveTo(0, sy + bladeH * 0.78);
        ctx.lineTo(worldW, sy + bladeH * 0.78);
        ctx.stroke();
        ctx.restore();
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-0.035 + Math.sin(timer * 1.5) * 0.012);
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = 'lighter';
    const aura = ctx.createRadialGradient(0, 0, 10, 0, 0, len * 0.56);
    aura.addColorStop(0, 'rgba(255,58,64,0.28)');
    aura.addColorStop(0.48, 'rgba(128,0,0,0.22)');
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(0, 0, len * 0.58, bladeH * 1.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 24;
    ctx.shadowColor = 'rgba(190,0,0,0.78)';
    const bladeGrad = ctx.createLinearGradient(-len * 0.50, 0, len * 0.30, 0);
    bladeGrad.addColorStop(0, 'rgba(230,226,218,0.96)');
    bladeGrad.addColorStop(0.22, 'rgba(92,82,82,0.94)');
    bladeGrad.addColorStop(0.70, 'rgba(24,18,20,0.96)');
    bladeGrad.addColorStop(1, 'rgba(12,8,9,0.96)');
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(-len * 0.54, 0);
    ctx.lineTo(-len * 0.34, -bladeH * 0.50);
    ctx.lineTo(len * 0.24, -bladeH * 0.34);
    ctx.lineTo(len * 0.34, 0);
    ctx.lineTo(len * 0.24, bladeH * 0.34);
    ctx.lineTo(-len * 0.34, bladeH * 0.50);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,0,0,0.92)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(255,232,204,0.66)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-len * 0.43, 0);
    ctx.lineTo(len * 0.20, 0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,64,58,0.70)';
    ctx.lineWidth = 5.4;
    ctx.beginPath();
    ctx.moveTo(len * 0.16, -bladeH * 0.55);
    ctx.lineTo(len * 0.16, bladeH * 0.55);
    ctx.stroke();
    ctx.fillStyle = 'rgba(24,0,0,0.96)';
    ctx.fillRect(len * 0.16, -bladeH * 0.12, len * 0.30, bladeH * 0.24);
    ctx.fillStyle = 'rgba(180,0,0,0.72)';
    ctx.fillRect(len * 0.42, -bladeH * 0.18, len * 0.05, bladeH * 0.36);

    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
        const yy = (i - 3) * bladeH * 0.32;
        ctx.strokeStyle = i % 2 ? 'rgba(255,58,64,0.34)' : 'rgba(60,0,0,0.50)';
        ctx.lineWidth = i % 2 ? 2 : 3;
        ctx.beginPath();
        ctx.moveTo(len * 0.30, yy);
        ctx.lineTo(-len * 0.44, yy * 0.55 + Math.sin(timer + i) * 8);
        ctx.stroke();
    }
    ctx.restore();

    // 공격 가능한 거대 검은 일반 몬스터처럼 간단한 HP바를 표시한다.
    const hp = parseFloat(obj.objectHp);
    const maxHp = parseFloat(obj.objectMaxHp);
    if (!warning && Number.isFinite(hp) && Number.isFinite(maxHp) && maxHp > 0 && hp > 0) {
        const ratio = Math.max(0, Math.min(1, hp / maxHp));
        const barW = 180;
        const barH = 12;
        const barX = sx - barW / 2;
        const barY = sy - bladeH * 1.18 - 22;
        ctx.save();
        ctx.globalAlpha = 0.94;
        ctx.fillStyle = 'rgba(0,0,0,0.70)';
        ctx.strokeStyle = 'rgba(255,190,160,0.76)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        this.roundRect(ctx, barX, barY, barW, barH, 5);
        ctx.fill();
        ctx.stroke();
        const hpGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
        hpGrad.addColorStop(0, 'rgba(255,54,44,0.96)');
        hpGrad.addColorStop(0.65, 'rgba(170,0,0,0.92)');
        hpGrad.addColorStop(1, 'rgba(56,0,0,0.88)');
        ctx.fillStyle = hpGrad;
        ctx.beginPath();
        this.roundRect(ctx, barX + 2, barY + 2, Math.max(0, (barW - 4) * ratio), barH - 4, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,235,218,0.92)';
        ctx.font = 'bold 11px Malgun Gothic, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('사도의 거대 검', sx, barY - 4);
        ctx.restore();
    }
};


GameRenderer.drawKasiyasP2M2GiantSwordBladeShape = function(ctx, len, bladeH, alpha = 1, opts = {}) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = opts.composite || 'source-over';
    const aura = ctx.createRadialGradient(0, 0, 10, 0, 0, len * 0.58);
    aura.addColorStop(0, 'rgba(255,60,64,0.22)');
    aura.addColorStop(0.48, 'rgba(118,0,0,0.18)');
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(0, 0, len * 0.58, bladeH * 1.48, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = opts.shadowBlur || 18;
    ctx.shadowColor = 'rgba(190,0,0,0.66)';
    const bladeGrad = ctx.createLinearGradient(-len * 0.50, 0, len * 0.34, 0);
    bladeGrad.addColorStop(0, 'rgba(230,226,218,0.96)');
    bladeGrad.addColorStop(0.22, 'rgba(95,86,86,0.96)');
    bladeGrad.addColorStop(0.68, 'rgba(27,20,22,0.96)');
    bladeGrad.addColorStop(1, 'rgba(9,6,7,0.98)');
    ctx.fillStyle = bladeGrad;
    ctx.strokeStyle = 'rgba(8,0,0,0.92)';
    ctx.lineWidth = Math.max(3, bladeH * 0.035);
    ctx.beginPath();
    ctx.moveTo(-len * 0.54, 0);
    ctx.lineTo(-len * 0.34, -bladeH * 0.50);
    ctx.lineTo(len * 0.24, -bladeH * 0.34);
    ctx.lineTo(len * 0.36, 0);
    ctx.lineTo(len * 0.24, bladeH * 0.34);
    ctx.lineTo(-len * 0.34, bladeH * 0.50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(255,235,210,0.62)';
    ctx.lineWidth = Math.max(1.4, bladeH * 0.018);
    ctx.beginPath();
    ctx.moveTo(-len * 0.43, 0);
    ctx.lineTo(len * 0.20, 0);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,64,58,0.72)';
    ctx.lineWidth = Math.max(3, bladeH * 0.046);
    ctx.beginPath();
    ctx.moveTo(len * 0.16, -bladeH * 0.55);
    ctx.lineTo(len * 0.16, bladeH * 0.55);
    ctx.stroke();
    ctx.fillStyle = 'rgba(24,0,0,0.96)';
    ctx.fillRect(len * 0.16, -bladeH * 0.12, len * 0.30, bladeH * 0.24);
    ctx.fillStyle = 'rgba(180,0,0,0.72)';
    ctx.fillRect(len * 0.42, -bladeH * 0.18, len * 0.05, bladeH * 0.36);
    ctx.restore();
};

GameRenderer.drawKasiyasP2M2BrokenGiantSwordObject = function(ctx, obj) {
    if (!obj) return;
    const data = obj.data || {};
    const drawY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0) - (parseFloat(obj.z) || 0);
    const sx = parseFloat(obj.x) || 0;
    const len = Math.max(260, parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 500) * 0.82;
    const bladeH = Math.max(70, parseFloat(obj.d) || parseFloat(data.Hitbox_Size_Y) || 130) * 0.78;
    const pulse = 0.5 + Math.sin(Date.now() / 145) * 0.5;
    const canInteract = !!obj.canInteract && !obj.disabled;
    const nearest = !!obj.nearestInteractTarget && canInteract;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.beginPath();
    ctx.ellipse(sx, drawY + 8, len * 0.36, bladeH * 0.26, -0.10, 0, Math.PI * 2);
    ctx.fill();

    if (canInteract) {
        const displayRange = typeof this.getKasiyasObjectDisplayRange === 'function' ? this.getKasiyasObjectDisplayRange(obj, 100, 60) : { x: 100, y: 60 };
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = nearest ? 0.44 + pulse * 0.18 : 0.22 + pulse * 0.08;
        ctx.fillStyle = 'rgba(255,70,58,0.42)';
        ctx.beginPath();
        ctx.ellipse(sx, drawY + 2, Math.max(70, displayRange.x), Math.max(42, displayRange.y), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,208,172,0.72)';
        ctx.lineWidth = nearest ? 3 : 1.7;
        ctx.beginPath();
        ctx.ellipse(sx, drawY + 2, Math.max(70, displayRange.x), Math.max(42, displayRange.y), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    ctx.save();
    ctx.translate(sx, drawY - bladeH * 0.18);
    ctx.rotate(-0.24);
    this.drawKasiyasP2M2GiantSwordBladeShape(ctx, len, bladeH, obj.disabled ? 0.45 : 0.92, { shadowBlur: 10 });
    // 파손된 도신 조각 느낌을 추가한다.
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(12,0,0,0.88)';
    ctx.beginPath();
    ctx.moveTo(-len * 0.12, -bladeH * 0.44);
    ctx.lineTo(-len * 0.02, -bladeH * 0.18);
    ctx.lineTo(-len * 0.18, -bladeH * 0.10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-len * 0.30, bladeH * 0.44);
    ctx.lineTo(-len * 0.18, bladeH * 0.16);
    ctx.lineTo(-len * 0.38, bladeH * 0.10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (nearest) {
        ctx.save();
        const boxW = 96;
        const boxH = 25;
        const boxX = sx - boxW / 2;
        const boxY = drawY - bladeH - 72;
        ctx.globalAlpha = 0.96;
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.strokeStyle = 'rgba(255,190,150,0.90)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        this.roundRect(ctx, boxX, boxY, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff1d0';
        ctx.font = 'bold 13px Malgun Gothic, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('X 조준', sx, boxY + 17);
        ctx.restore();
    }
    ctx.restore();
};

GameRenderer.drawKasiyasP2M2AimingGiantSwordObject = function(ctx, obj) {
    if (!obj) return;
    const data = obj.data || {};
    const sx = parseFloat(obj.x) || 0;
    const sy = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0) - (parseFloat(obj.z) || 0) - 28;
    const len = Math.max(260, parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 520) * 0.86;
    const bladeH = Math.max(70, parseFloat(obj.d) || parseFloat(data.Hitbox_Size_Y) || 130) * 0.86;
    const angle = Number.isFinite(parseFloat(obj.aimAngle)) ? parseFloat(obj.aimAngle) : -35;
    const dirSign = String(obj.fireDirection || '').toUpperCase() === 'LEFT' ? -1 : 1;
    const rad = angle * Math.PI / 180;
    const drawRad = dirSign === -1 ? Math.PI - rad : rad;
    const preview = Math.max(120, parseFloat(obj.aimPreviewLength) || parseFloat(data.Aim_Preview_Length) || 700);
    const endX = sx + Math.abs(Math.cos(rad)) * preview * dirSign;
    const endY = sy + Math.sin(rad) * preview;
    const remain = Math.max(0, (parseFloat(obj.aimTimeLimit) || parseFloat(obj.maxLife) || 10) - (parseFloat(obj.timer) || 0));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,214,170,0.68)';
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 10]);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255,72,58,0.42)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(drawRad);
    this.drawKasiyasP2M2GiantSwordBladeShape(ctx, len, bladeH, 0.96, { shadowBlur: 18 });
    ctx.restore();

    ctx.save();
    const uiY = sy - bladeH * 1.25 - 42;
    ctx.fillStyle = 'rgba(0,0,0,0.68)';
    ctx.strokeStyle = 'rgba(255,188,146,0.78)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    this.roundRect(ctx, sx - 150, uiY, 300, 44, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffe8ca';
    ctx.font = 'bold 13px Malgun Gothic, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`조준 ${String(obj.fireDirection || 'RIGHT').toUpperCase()} ${angle.toFixed(0)}°  /  ${remain.toFixed(1)}초`, sx, uiY + 17);
    ctx.font = '12px Malgun Gothic, sans-serif';
    ctx.fillText('←/→: 방향 / X 유지: 위로 / 떼기: 아래로 / Z·Space: 발사 / C: 취소', sx, uiY + 34);
    ctx.restore();
};

GameRenderer.drawKasiyasP2M2FiredGiantSwordObject = function(ctx, obj) {
    if (!obj) return;
    const data = obj.data || {};
    const sx = parseFloat(obj.x) || 0;
    const sy = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0) - (parseFloat(obj.z) || 0);
    const len = Math.max(220, parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 300);
    const bladeH = Math.max(64, parseFloat(obj.d) || parseFloat(data.Hitbox_Size_Y) || 120);
    const angle = Number.isFinite(parseFloat(obj.fireAngle)) ? parseFloat(obj.fireAngle) : -35;
    const dirSign = String(obj.fireDirection || '').toUpperCase() === 'LEFT' ? -1 : 1;
    const rad = Number.isFinite(parseFloat(obj.rotation)) ? parseFloat(obj.rotation) : (dirSign === -1 ? Math.PI - angle * Math.PI / 180 : angle * Math.PI / 180);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rad);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = i % 2 ? 'rgba(255,74,58,0.34)' : 'rgba(60,0,0,0.52)';
        ctx.lineWidth = i % 2 ? 3 : 5;
        ctx.beginPath();
        ctx.moveTo(-len * (0.18 + i * 0.05), (i - 2) * bladeH * 0.18);
        ctx.lineTo(-len * 0.78, (i - 2) * bladeH * 0.32);
        ctx.stroke();
    }
    this.drawKasiyasP2M2GiantSwordBladeShape(ctx, len, bladeH, 0.98, { shadowBlur: 16 });
    ctx.restore();
};

GameRenderer.drawKasiyasCircleSwordWaveObject = function(ctx, obj) {
    if (!obj || obj.active === false) return;
    const data = obj.data || {};
    const dir = obj.faceDir === -1 ? -1 : 1;
    const w = Math.max(110, parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 250);
    const h = Math.max(100, parseFloat(obj.h) || parseFloat(data.Hitbox_Size_Z) || 200);
    const timer = Math.max(0, parseFloat(obj.timer) || 0);
    const maxLife = Math.max(0.1, parseFloat(obj.maxLife) || parseFloat(data.Object_Internal_Duration) || 3);
    const lifeT = Math.max(0, Math.min(1, timer / maxLife));
    const alpha = Math.max(0.35, Math.min(1, 1 - lifeT * 0.20));
    const drawY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const drawZ = drawY - (parseFloat(obj.z) || h * 0.45);

    ctx.save();
    ctx.translate(parseFloat(obj.x) || 0, drawZ);
    ctx.scale(dir, 1);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 기본 패턴용 원형 검기: 두 개의 매끄러운 원형 궤도가 X자처럼 겹치는 형태.
    const rx = Math.max(w * 0.43, 102);
    const ry = Math.max(h * 0.24, 50);
    const dark = `rgba(18,0,0,${0.84 * alpha})`;
    const core = `rgba(255,58,42,${0.84 * alpha})`;
    const hot = `rgba(255,224,174,${0.72 * alpha})`;
    const violet = `rgba(126,36,184,${0.34 * alpha})`;

    const aura = ctx.createRadialGradient(0, 0, 8, 0, 0, Math.max(rx, ry) * 1.10);
    aura.addColorStop(0, `rgba(255,68,48,${0.055 * alpha})`);
    aura.addColorStop(0.55, `rgba(104,0,0,${0.080 * alpha})`);
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 1.04, ry * 1.28, 0, 0, Math.PI * 2);
    ctx.fill();

    const drawTiltedRing = (rot, stroke, lineW, blur, scaleY = 1, alphaMul = 1) => {
        ctx.save();
        ctx.rotate(rot);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineW;
        ctx.shadowColor = stroke;
        ctx.shadowBlur = blur;
        ctx.globalAlpha *= alphaMul;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry * scaleY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    // 외곽 암색으로 두 원을 먼저 확실히 잡고, 안쪽 붉은/밝은 선을 올린다.
    const tilt = 0.58;
    drawTiltedRing( tilt, dark, Math.max(9.0, h * 0.052), 12, 0.92, 0.95);
    drawTiltedRing(-tilt, dark, Math.max(9.0, h * 0.052), 12, 0.92, 0.95);
    drawTiltedRing( tilt, violet, Math.max(5.0, h * 0.030), 12, 0.88, 0.88);
    drawTiltedRing(-tilt, violet, Math.max(5.0, h * 0.030), 12, 0.88, 0.88);
    drawTiltedRing( tilt, core, Math.max(3.6, h * 0.020), 10, 0.92, 1.0);
    drawTiltedRing(-tilt, core, Math.max(3.6, h * 0.020), 10, 0.92, 1.0);
    drawTiltedRing( tilt, hot, Math.max(1.4, h * 0.007), 6, 0.92, 0.78);
    drawTiltedRing(-tilt, hot, Math.max(1.4, h * 0.007), 6, 0.92, 0.78);

    // X자 교차 중심부 하이라이트.
    ctx.save();
    ctx.strokeStyle = `rgba(255,232,184,${0.36 * alpha})`;
    ctx.lineWidth = Math.max(1.5, h * 0.008);
    ctx.shadowBlur = 8;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(-rx * 0.48, -ry * 0.42);
    ctx.quadraticCurveTo(0, 0, rx * 0.48, ry * 0.42);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-rx * 0.48, ry * 0.42);
    ctx.quadraticCurveTo(0, 0, rx * 0.48, -ry * 0.42);
    ctx.stroke();
    ctx.restore();

    // 사출 속도선은 왼쪽 후방에 짧고 깔끔하게만 남긴다.
    for (let i = 0; i < 4; i++) {
        const yy = -ry * 0.46 + i * ry * 0.30;
        ctx.strokeStyle = i % 2 ? `rgba(255,64,44,${0.18 * alpha})` : `rgba(22,0,0,${0.30 * alpha})`;
        ctx.lineWidth = i % 2 ? 1.2 : 2.0;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(-rx * (1.18 + lifeT * 0.08), yy);
        ctx.quadraticCurveTo(-rx * 0.84, yy * 0.88, -rx * 0.56, yy * 0.50);
        ctx.stroke();
    }

    ctx.restore();
};


GameRenderer.drawKasiyasCrossSwordWaveObject = function(ctx, obj) {
    if (!obj || obj.active === false) return;
    const data = obj.data || {};
    const dir = obj.faceDir === -1 ? -1 : 1;
    const w = Math.max(80, parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 200);
    const d = Math.max(50, parseFloat(obj.d) || parseFloat(data.Hitbox_Size_Y) || 150);
    const h = Math.max(80, parseFloat(obj.h) || parseFloat(data.Hitbox_Size_Z) || 200);
    const timer = Math.max(0, parseFloat(obj.timer) || 0);
    const maxLife = Math.max(0.1, parseFloat(obj.maxLife) || parseFloat(data.Object_Internal_Duration) || 3);
    const lifeT = Math.max(0, Math.min(1, timer / maxLife));
    const pulse = 0.5 + Math.sin(Date.now() / 65) * 0.5;
    const drawY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const drawZ = drawY - (parseFloat(obj.z) || h * 0.45);

    ctx.save();
    ctx.translate(parseFloat(obj.x) || 0, drawZ);
    ctx.scale(dir, 1);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.rect(-w * 0.5, -h * 0.5, w, h);
    ctx.clip();

    // X자 검기는 문어처럼 갈라지는 곡선을 제거하고, 전방으로 날아가는 두 개의 칼날형 투사체로 통일한다.
    const backX = -w * 0.50;
    const frontX = w * 0.50;
    const topY = -h * 0.48;
    const botY = h * 0.48;
    const thick = Math.max(18, Math.min(46, h * 0.20));
    const curve = Math.min(w, h) * 0.10;
    const alpha = Math.max(0.38, Math.min(1, 1 - lifeT * 0.18));
    const edge = `rgba(20,0,0,${0.88 * alpha})`;
    const core = `rgba(255,54,40,${0.84 * alpha})`;
    const hot = `rgba(255,230,198,${0.78 * alpha})`;
    const aura = `rgba(255,88,58,${0.32 * alpha})`;

    const drawWaveBlade = (x0, y0, x1, y1, curveSign) => {
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0.00, 'rgba(0,0,0,0)');
        grad.addColorStop(0.13, edge);
        grad.addColorStop(0.40, core);
        grad.addColorStop(0.58, hot);
        grad.addColorStop(0.82, aura);
        grad.addColorStop(1.00, 'rgba(0,0,0,0)');
        if (typeof this.drawKasiyasSharpBladeRibbon === 'function') {
            this.drawKasiyasSharpBladeRibbon(ctx, {
                x0, y0,
                c1x: x0 + (x1 - x0) * 0.30, c1y: y0 + (y1 - y0) * 0.32 - curve * curveSign,
                c2x: x0 + (x1 - x0) * 0.70, c2y: y0 + (y1 - y0) * 0.68 - curve * curveSign,
                x1, y1,
                width: thick,
                fillStyle: grad,
                edgeStyle: edge,
                coreStyle: core,
                hotStyle: hot,
                shadowColor: 'rgba(220,0,0,0.70)',
                bodyBlur: 12 + pulse * 6,
                edgeBlur: 10,
                coreBlur: 12,
                hotBlur: 6,
                profile: 'projectile',
                tailScale: 0.18,
                tipScale: 0.018,
                edgeWidthMul: 0.22,
                coreWidthMul: 0.11,
                hotWidthMul: 0.035
            });
        }
    };

    drawWaveBlade(backX, topY, frontX, botY, 1);
    drawWaveBlade(backX, botY, frontX, topY, -1);

    // 전방으로 쏘아지는 느낌을 위해 뒤쪽에는 짧은 속도선만 남기고, 촉수형 잔선은 제거한다.
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(220,0,0,0.45)';
    for (let i = 0; i < 5; i++) {
        const r = i / 4;
        const yy = -h * 0.30 + h * 0.60 * r;
        ctx.strokeStyle = i % 2 ? `rgba(255,76,54,${0.30 * alpha})` : `rgba(36,0,0,${0.44 * alpha})`;
        ctx.lineWidth = i % 2 ? 1.6 : 2.4;
        ctx.beginPath();
        ctx.moveTo(-w * (0.56 + lifeT * 0.04), yy);
        ctx.lineTo(-w * 0.12, yy * 0.42);
        ctx.stroke();
    }

    const centerGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, thick * 1.7);
    centerGrad.addColorStop(0, `rgba(255,238,214,${0.55 + pulse * 0.16})`);
    centerGrad.addColorStop(0.48, `rgba(255,72,48,${0.24 + pulse * 0.08})`);
    centerGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, thick * 0.80, thick * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};



GameRenderer.drawKasiyasP3DimensionCrackObject = function(ctx, obj) {
    if (!obj || obj.active === false) return;
    const baseY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const x = parseFloat(obj.x) || 0;
    const timer = parseFloat(obj.timer) || 0;
    // 차원의 균열 모델링은 히트박스 크기를 직접 반영한다.
    // X는 균열 폭, Z는 세로 높이, Y는 바닥 투영/접촉 범위로 사용한다.
    const w = Math.max(90, parseFloat(obj.w) || parseFloat(obj.data && obj.data.Hitbox_Size_X) || 150);
    const d = Math.max(120, parseFloat(obj.d) || parseFloat(obj.data && obj.data.Hitbox_Size_Y) || 300);
    const h = Math.max(180, parseFloat(obj.h) || parseFloat(obj.data && obj.data.Hitbox_Size_Z) || 300);
    const pulse = 0.5 + Math.sin(Date.now() / 82 + x * 0.01) * 0.5;
    const drawY = baseY - Math.max(44, h * 0.38) + Math.sin(Date.now() / 130) * 1.6;
    const rx = Math.max(52, w * 0.82);
    const ry = Math.max(120, h * 0.72);
    const angle = -0.72;

    ctx.save();
    ctx.translate(x, drawY);
    ctx.rotate(angle);
    ctx.globalCompositeOperation = 'lighter';

    // 전체 톤을 밝은 청백색이 아니라 어두운 남보라/검은 차원 균열로 맞춘다.
    const fieldGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, Math.max(rx, ry) * 1.18);
    fieldGrad.addColorStop(0.00, `rgba(218,204,255,${0.035 + pulse * 0.018})`);
    fieldGrad.addColorStop(0.20, `rgba(112,58,206,${0.16 + pulse * 0.035})`);
    fieldGrad.addColorStop(0.48, `rgba(30,10,96,${0.28 + pulse * 0.035})`);
    fieldGrad.addColorStop(0.76, `rgba(2,0,20,${0.34 + pulse * 0.04})`);
    fieldGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = fieldGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.76, ry * 1.03, 0, 0, Math.PI * 2);
    ctx.fill();

    // 대각선으로 베여 열린 검보라 내부 공간.
    const coreGrad = ctx.createLinearGradient(0, -ry, 0, ry);
    coreGrad.addColorStop(0, 'rgba(190,170,255,0.10)');
    coreGrad.addColorStop(0.22, 'rgba(92,48,190,0.34)');
    coreGrad.addColorStop(0.50, 'rgba(12,0,72,0.86)');
    coreGrad.addColorStop(0.78, 'rgba(0,0,18,0.82)');
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(114,54,255,0.56)';
    ctx.beginPath();
    ctx.moveTo(-rx * 0.18, -ry * 1.00);
    ctx.bezierCurveTo(rx * 0.32, -ry * 0.68, rx * 0.35, -ry * 0.22, rx * 0.18, 0);
    ctx.bezierCurveTo(rx * 0.42, ry * 0.38, rx * 0.20, ry * 0.78, -rx * 0.08, ry * 1.00);
    ctx.bezierCurveTo(-rx * 0.36, ry * 0.64, -rx * 0.34, ry * 0.22, -rx * 0.16, 0);
    ctx.bezierCurveTo(-rx * 0.38, -ry * 0.35, -rx * 0.34, -ry * 0.70, -rx * 0.18, -ry * 1.00);
    ctx.closePath();
    ctx.fill();

    // 깨진 공간 파편. 밝은 흰색 비중은 줄이고, 어두운 보라/남색 유리 조각 중심으로 표시한다.
    ctx.globalCompositeOperation = 'source-over';
    const shardCount = 28;
    for (let i = 0; i < shardCount; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const ty = -ry * 0.92 + (i / (shardCount - 1)) * ry * 1.84;
        const spread = rx * (0.36 + ((i * 17) % 10) * 0.030);
        const sx = side * (rx * 0.12 + spread * (0.54 + ((i * 11) % 6) * 0.040));
        const sz = 8 + (i % 5) * 7;
        ctx.fillStyle = i % 4 === 0 ? 'rgba(205,190,255,0.44)' : (i % 4 === 1 ? 'rgba(96,62,174,0.50)' : (i % 4 === 2 ? 'rgba(20,10,78,0.62)' : 'rgba(0,0,18,0.58)'));
        ctx.shadowBlur = i % 4 === 0 ? 8 : 3;
        ctx.shadowColor = 'rgba(110,62,255,0.46)';
        ctx.beginPath();
        ctx.moveTo(sx, ty - sz * 0.90);
        ctx.lineTo(sx + side * sz * (1.0 + (i % 3) * 0.28), ty + sz * 0.20);
        ctx.lineTo(sx - side * sz * 0.40, ty + sz * 0.78);
        ctx.closePath();
        ctx.fill();
    }

    // 굵은 검은 균열선.
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.98)';
    for (let i = 0; i < 8; i++) {
        const yy0 = -ry * 0.88 + i * ry * 0.26;
        const yy1 = yy0 + ry * (0.16 + (i % 3) * 0.04);
        const side = i % 2 === 0 ? -1 : 1;
        ctx.strokeStyle = 'rgba(0,0,10,0.94)';
        ctx.lineWidth = 4.2 + (i % 3) * 1.4;
        ctx.beginPath();
        ctx.moveTo(side * rx * 0.04, yy0);
        ctx.lineTo(side * rx * (0.32 + (i % 4) * 0.09), yy1);
        ctx.stroke();
    }
    ctx.restore();

    // 바닥 접촉/흡인 범위 암시: 히트박스 Y 투영 크기를 사용한다.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.18 + pulse * 0.08;
    ctx.strokeStyle = 'rgba(132,80,255,0.34)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.ellipse(x, baseY + 4, Math.max(52, w * 0.60), Math.max(48, d * 0.30), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
};

GameRenderer.drawKasiyasP3DimensionCrackBurstObject = function(ctx, obj) {
    if (!obj || obj.active === false) return;
    const baseY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const x = parseFloat(obj.x) || 0;
    const w = Math.max(320, parseFloat(obj.w) || parseFloat(obj.data && obj.data.Hitbox_Size_X) || 700);
    const d = Math.max(160, parseFloat(obj.d) || parseFloat(obj.data && obj.data.Hitbox_Size_Y) || 300);
    const timer = parseFloat(obj.timer) || 0;
    const warning = Math.max(0.001, parseFloat(obj.warningDuration) || 1);
    const hitEnd = Math.max(warning + 0.05, parseFloat(obj.hitEnd) || 2);
    const warningT = Math.max(0, Math.min(1, timer / warning));
    const burstT = Math.max(0, Math.min(1, (timer - warning) / Math.max(0.001, hitEnd - warning)));
    const pulse = 0.5 + Math.sin(Date.now() / 70) * 0.5;
    const drawY = baseY - 28 + Math.sin(Date.now() / 120) * 2;
    const rx = w * 0.50;
    const ry = d * 0.48;

    const drawRangeFrame = (alphaMul, thick = false) => {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = alphaMul;
        const g = ctx.createRadialGradient(x, drawY, Math.min(rx, ry) * 0.10, x, drawY, Math.max(rx, ry) * 1.08);
        g.addColorStop(0, 'rgba(22,0,62,0.06)');
        g.addColorStop(0.72, 'rgba(18,0,54,0.12)');
        g.addColorStop(0.92, 'rgba(0,0,0,0.24)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = thick ? 22 : 15;
        ctx.shadowColor = 'rgba(142,70,255,0.76)';
        ctx.strokeStyle = thick ? 'rgba(236,224,255,0.82)' : 'rgba(202,174,255,0.68)';
        ctx.lineWidth = thick ? 5.8 : 4.2;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(8,0,26,0.94)';
        ctx.lineWidth = thick ? 8.4 : 6.4;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx * 1.006, ry * 1.006, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(154,84,255,0.84)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx * 0.975, ry * 0.975, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    ctx.save();
    if (timer < warning) {
        // 전조 단계는 최종 피해 범위를 먼저 읽을 수 있도록, 실제 히트박스 크기의 테두리를 고정 표시한다.
        drawRangeFrame(0.76 + warningT * 0.20 + pulse * 0.05, false);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.44 + warningT * 0.20;
        const g = ctx.createRadialGradient(x, drawY, 8, x, drawY, Math.max(w, d) * 0.46);
        g.addColorStop(0, `rgba(226,214,255,${0.08 + warningT * 0.04})`);
        g.addColorStop(0.32, `rgba(126,62,255,${0.16 + warningT * 0.06})`);
        g.addColorStop(0.70, `rgba(20,0,80,${0.26 + warningT * 0.08})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx * (0.40 + warningT * 0.15), ry * (0.40 + warningT * 0.15), 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        const aMul = Math.max(0, 1 - burstT * 0.55);
        drawRangeFrame(0.92 * aMul, true);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = aMul;
        const g = ctx.createRadialGradient(x, drawY, 4, x, drawY, Math.max(w, d) * (0.54 + burstT * 0.18));
        g.addColorStop(0, `rgba(238,226,255,${0.36 * aMul})`);
        g.addColorStop(0.18, `rgba(142,72,255,${0.48 * aMul})`);
        g.addColorStop(0.44, `rgba(38,0,112,${0.64 * aMul})`);
        g.addColorStop(0.76, `rgba(0,0,18,${0.76 * aMul})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, drawY, rx * (0.96 + burstT * 0.06), ry * (0.96 + burstT * 0.06), 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 공통 균열 파편/절단선. 폭발 단계에서는 더 짙은 색으로 바뀌어 판정 발생을 구분시킨다.
    const explodeT = timer < warning ? warningT * 0.30 : burstT;
    const darkHit = timer >= warning;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 24; i++) {
        const a = i * Math.PI * 2 / 24 + Math.sin(i * 1.7) * 0.16;
        const inner = Math.min(rx, ry) * 0.08;
        const outX = rx * (0.30 + (i % 5) * 0.10 + explodeT * 0.34);
        const outY = ry * (0.30 + (i % 4) * 0.10 + explodeT * 0.34);
        ctx.strokeStyle = i % 3 === 0 ? `rgba(0,0,0,${darkHit ? 0.92 : 0.78})` : (darkHit ? `rgba(138,78,255,0.64)` : `rgba(116,68,255,0.46)`);
        ctx.lineWidth = i % 3 === 0 ? 6.4 : 3.6;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * inner, drawY + Math.sin(a) * inner);
        ctx.lineTo(x + Math.cos(a) * outX, drawY + Math.sin(a) * outY);
        ctx.stroke();
    }
    ctx.restore();
};

GameRenderer.drawKasiyasP3GiantSwordWaveObject = function(ctx, obj) {
    if (!obj || obj.active === false) return;
    const data = obj.data || {};
    const dir = obj.faceDir === -1 ? -1 : 1;
    const hitW = Math.max(120, parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 250);
    const hitD = Math.max(120, parseFloat(obj.d) || parseFloat(data.Hitbox_Size_Y) || 300);
    const hitH = Math.max(220, parseFloat(obj.h) || parseFloat(data.Hitbox_Size_Z) || 500);
    const timer = Math.max(0, parseFloat(obj.timer) || 0);
    const maxLife = Math.max(0.1, parseFloat(obj.maxLife) || parseFloat(data.Object_Internal_Duration) || 3);
    const lifeT = Math.max(0, Math.min(1, timer / maxLife));
    const pulse = 0.5 + Math.sin(Date.now() / 54) * 0.5;
    const visualW = Math.max(hitW * 1.55, 390);
    const visualH = Math.max(hitH * 0.98, 470);
    const drawY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const drawZ = drawY - (parseFloat(obj.z) || hitH * 0.45);
    const alpha = Math.max(0.42, Math.min(1, 1 - lifeT * 0.22));
    const halfW = visualW * 0.50;
    const halfH = visualH * 0.50;

    ctx.save();
    ctx.translate(parseFloat(obj.x) || 0, drawZ);
    ctx.scale(dir, 1);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 실제 판정보다 살짝 큰 압력장을 먼저 깔아, 환몽영처럼 화면을 긋는 거대한 반달 실루엣을 만든다.
    const auraGrad = ctx.createRadialGradient(halfW * 0.10, 0, 10, halfW * 0.10, 0, Math.max(halfW, halfH) * 1.08);
    auraGrad.addColorStop(0.00, `rgba(152,76,255,${0.10 * alpha})`);
    auraGrad.addColorStop(0.45, `rgba(50,8,120,${0.20 * alpha})`);
    auraGrad.addColorStop(0.72, `rgba(10,0,32,${0.22 * alpha})`);
    auraGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(halfW * 0.04, 0, halfW * 0.92, halfH * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();

    const drawCrescent = (scale, lineMul, color, blur, alphaMul, yOff = 0) => {
        ctx.save();
        ctx.globalAlpha *= alphaMul;
        ctx.shadowBlur = blur;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(10, visualW * lineMul);
        ctx.beginPath();
        ctx.moveTo(-halfW * 0.30 * scale, -halfH * 0.92 * scale + yOff);
        ctx.bezierCurveTo(halfW * 0.72 * scale, -halfH * 0.78 * scale + yOff, halfW * 0.92 * scale, -halfH * 0.12 * scale + yOff, halfW * 0.82 * scale, 0 + yOff);
        ctx.bezierCurveTo(halfW * 0.92 * scale, halfH * 0.12 * scale + yOff, halfW * 0.72 * scale, halfH * 0.78 * scale + yOff, -halfW * 0.30 * scale, halfH * 0.92 * scale + yOff);
        ctx.stroke();
        ctx.restore();
    };

    // 검은 외곽 → 검붉은 몸통 → 하이라이트 순으로 겹쳐 큰 검기 두께를 만든다.
    drawCrescent(1.00, 0.120, `rgba(10,0,8,${0.94 * alpha})`, 28 + pulse * 7, 1.00);
    drawCrescent(0.96, 0.082, `rgba(112,34,220,${0.88 * alpha})`, 24, 1.00);
    drawCrescent(0.86, 0.036, `rgba(166,88,255,${0.84 * alpha})`, 18, 0.92, -halfH * 0.015);
    drawCrescent(0.76, 0.014, `rgba(230,214,255,${0.74 * alpha})`, 9, 0.86, -halfH * 0.06);

    // 안쪽을 칼날 면처럼 채워, 단순 선이 아니라 거대한 반달형 투사체로 보이게 한다.
    const bladeGrad = ctx.createLinearGradient(-halfW * 0.40, -halfH * 0.62, halfW * 0.92, halfH * 0.18);
    bladeGrad.addColorStop(0.00, 'rgba(0,0,0,0)');
    bladeGrad.addColorStop(0.18, `rgba(12,0,34,${0.55 * alpha})`);
    bladeGrad.addColorStop(0.42, `rgba(104,34,210,${0.45 * alpha})`);
    bladeGrad.addColorStop(0.66, `rgba(160,86,255,${0.32 * alpha})`);
    bladeGrad.addColorStop(0.86, `rgba(230,214,255,${0.20 * alpha})`);
    bladeGrad.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = bladeGrad;
    ctx.shadowBlur = 14;
    ctx.shadowColor = 'rgba(134,70,255,0.52)';
    ctx.beginPath();
    ctx.moveTo(-halfW * 0.36, -halfH * 0.75);
    ctx.bezierCurveTo(halfW * 0.52, -halfH * 0.54, halfW * 0.76, -halfH * 0.12, halfW * 0.68, 0);
    ctx.bezierCurveTo(halfW * 0.76, halfH * 0.12, halfW * 0.52, halfH * 0.54, -halfW * 0.36, halfH * 0.75);
    ctx.bezierCurveTo(halfW * 0.10, halfH * 0.36, halfW * 0.24, -halfH * 0.36, -halfW * 0.36, -halfH * 0.75);
    ctx.closePath();
    ctx.fill();

    // 뒤쪽 압력선/잔선은 제거하고, 반달형 검기 본체만 남겨 형태를 더 명확하게 보이도록 한다.

    // 중심부 검붉은 맥동.
    const core = ctx.createRadialGradient(halfW * 0.28, 0, 6, halfW * 0.28, 0, Math.max(30, halfH * 0.36));
    core.addColorStop(0, `rgba(232,218,255,${0.42 * alpha + pulse * 0.12 * alpha})`);
    core.addColorStop(0.34, `rgba(156,78,255,${0.32 * alpha})`);
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.ellipse(halfW * 0.28, 0, halfW * 0.22, halfH * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};

// 2페이즈 기본 패턴 4번: 차원문 검 낙하 컨트롤러 렌더링.
// step244에서 미표시 보정을 위해 새로 들어간 과한 보라/붉은 연출을 낮추고,
// 기존 의도였던 “차원문에서 일본도 형태의 검이 수직으로 낙하”하는 느낌으로 정리한다.
GameRenderer.drawKasiyasFallingSwordRainObject = function(ctx, obj) {
    if (!ctx || !obj || !obj.active) return;
    const data = obj.data || {};
    const time = (parseFloat(obj.timer) || 0) + Date.now() / 1000;
    const swords = Array.isArray(obj.swords) ? obj.swords : [];
    const groundY = this.GROUND_BASE_Y || 400;
    const hitW = Math.max(22, parseFloat(data.Hitbox_Size_X) || 110);
    const hitD = Math.max(18, parseFloat(data.Hitbox_Size_Y) || 72);
    const portalX = Number.isFinite(parseFloat(obj.x)) ? parseFloat(obj.x) : ((this.gameState && this.gameState.WORLD_WIDTH) || 1400) * 0.5;
    const portalY = Math.max(70, Math.min(160, groundY + (Number.isFinite(parseFloat(obj.y)) ? parseFloat(obj.y) : 30) - 250));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha *= 0.16 + Math.sin(time * 3.5) * 0.025;
    ctx.strokeStyle = 'rgba(150,172,210,0.58)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 9;
    ctx.shadowColor = 'rgba(70,105,170,0.36)';
    ctx.beginPath();
    ctx.ellipse(portalX, portalY, 118 + Math.sin(time * 1.9) * 4, 26 + Math.cos(time * 1.6) * 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(20,24,38,0.62)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(portalX, portalY, 102, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < swords.length; i++) {
        const sword = swords[i] || {};
        const elapsed = Math.max(0, parseFloat(sword.elapsed) || 0);
        const warningDuration = Math.max(0.08, parseFloat(sword.warningDuration) || parseFloat(obj.warningDuration) || 0.45);
        const delayTime = Math.max(0, parseFloat(sword.delayTime) || parseFloat(obj.hitboxDelayTime) || 0);
        const hitDuration = Math.max(0.05, parseFloat(sword.hitDuration) || parseFloat(obj.hitDuration) || 0.14);
        const impactStart = warningDuration + delayTime;
        const impactEnd = impactStart + hitDuration;
        const sx = Number.isFinite(parseFloat(sword.x)) ? parseFloat(sword.x) : portalX;
        const sy = groundY + (Number.isFinite(parseFloat(sword.y)) ? parseFloat(sword.y) : 200);
        const seed = parseFloat(sword.seed) || i * 17.13;
        const fallP = Math.max(0, Math.min(1, elapsed / Math.max(0.001, impactStart)));
        const activeHit = elapsed >= impactStart && elapsed <= impactEnd;
        const fade = elapsed > impactEnd ? Math.max(0, 1 - (elapsed - impactEnd) / 0.28) : 1;
        const warnPulse = 0.5 + Math.sin((elapsed * 14) + seed) * 0.5;
        const scale = Math.max(0.62, parseFloat(sword.scale) || 1);

        ctx.save();
        ctx.globalAlpha *= Math.max(0, Math.min(1, fade));
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = activeHit ? 'rgba(255,236,226,0.86)' : `rgba(210,232,255,${0.34 + warnPulse * 0.22})`;
        ctx.fillStyle = activeHit ? 'rgba(255,76,54,0.12)' : 'rgba(92,132,190,0.08)';
        ctx.lineWidth = activeHit ? 3 : 1.6;
        ctx.shadowBlur = activeHit ? 12 : 6;
        ctx.shadowColor = activeHit ? 'rgba(255,72,52,0.48)' : 'rgba(120,170,230,0.28)';
        ctx.beginPath();
        ctx.ellipse(sx, sy, hitW * 0.42, hitD * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        for (let k = 0; k < 4; k++) {
            const a = k * Math.PI * 0.5 + seed * 0.013;
            ctx.beginPath();
            ctx.moveTo(sx + Math.cos(a) * hitW * 0.20, sy + Math.sin(a) * hitD * 0.18);
            ctx.lineTo(sx + Math.cos(a) * hitW * 0.48, sy + Math.sin(a) * hitD * 0.42);
            ctx.stroke();
        }
        ctx.restore();

        // 검이 위에서 아래로 낙하한다는 방향이 명확히 보이도록,
        // 위쪽은 손잡이/가드, 아래쪽은 검끝으로 직접 그린다.
        const bladeLen = (118 + 24 * scale) * (activeHit ? 1.02 : 1);
        const tipLocalY = bladeLen * 0.54;
        const startCenterY = portalY + 24 + Math.sin(seed) * 5;
        const impactCenterY = sy - tipLocalY;
        const bladeCenterY = startCenterY + (impactCenterY - startCenterY) * Math.min(1, fallP * 1.08);
        const bladeAlpha = Math.max(0, Math.min(1, fade * (0.40 + fallP * 0.62)));
        const sway = Math.sin(time * 1.4 + seed) * 0.018;

        ctx.save();
        ctx.translate(sx, bladeCenterY);
        ctx.rotate(sway);
        ctx.globalAlpha *= bladeAlpha;
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = activeHit ? 12 : 7;
        ctx.shadowColor = activeHit ? 'rgba(255,220,206,0.42)' : 'rgba(190,215,240,0.26)';

        const bladeTopY = -bladeLen * 0.38;
        const bladeTipY = bladeLen * 0.54;
        const bladeHalfTop = Math.max(4, bladeLen * 0.045);
        const bladeHalfMid = Math.max(3, bladeLen * 0.030);
        const bladeGrad = ctx.createLinearGradient(0, bladeTopY, 0, bladeTipY);
        bladeGrad.addColorStop(0.00, 'rgba(66,70,88,0.94)');
        bladeGrad.addColorStop(0.24, 'rgba(188,200,218,0.95)');
        bladeGrad.addColorStop(0.64, 'rgba(246,249,253,0.98)');
        bladeGrad.addColorStop(1.00, 'rgba(36,34,44,0.96)');
        ctx.fillStyle = bladeGrad;
        ctx.strokeStyle = 'rgba(14,14,20,0.90)';
        ctx.lineWidth = Math.max(1.2, bladeLen * 0.012);
        ctx.beginPath();
        ctx.moveTo(-bladeHalfTop, bladeTopY);
        ctx.quadraticCurveTo(-bladeHalfMid * 1.25, bladeLen * 0.10, -bladeLen * 0.010, bladeTipY);
        ctx.quadraticCurveTo(bladeHalfMid * 1.35, bladeLen * 0.10, bladeHalfTop, bladeTopY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.42)';
        ctx.lineWidth = Math.max(0.9, bladeLen * 0.006);
        ctx.beginPath();
        ctx.moveTo(-bladeHalfTop * 0.15, bladeTopY + bladeLen * 0.05);
        ctx.quadraticCurveTo(-bladeLen * 0.010, bladeLen * 0.14, -bladeLen * 0.004, bladeTipY - bladeLen * 0.12);
        ctx.stroke();

        const guardY = bladeTopY - bladeLen * 0.025;
        ctx.fillStyle = 'rgba(204,168,78,0.92)';
        ctx.strokeStyle = 'rgba(62,45,18,0.85)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(0, guardY, bladeLen * 0.115, bladeLen * 0.020, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const handleTop = guardY - bladeLen * 0.20;
        const handleBottom = guardY - bladeLen * 0.018;
        const handleGrad = ctx.createLinearGradient(0, handleTop, 0, handleBottom);
        handleGrad.addColorStop(0, 'rgba(88,52,32,0.96)');
        handleGrad.addColorStop(0.5, 'rgba(122,76,44,0.96)');
        handleGrad.addColorStop(1, 'rgba(54,34,24,0.98)');
        ctx.fillStyle = handleGrad;
        ctx.strokeStyle = 'rgba(20,14,10,0.82)';
        ctx.beginPath();
        if (typeof this.roundRect === 'function') this.roundRect(ctx, -bladeLen * 0.022, handleTop, bladeLen * 0.044, handleBottom - handleTop, bladeLen * 0.012);
        else ctx.rect(-bladeLen * 0.022, handleTop, bladeLen * 0.044, handleBottom - handleTop);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(216,176,82,0.94)';
        ctx.beginPath();
        ctx.ellipse(0, handleTop - bladeLen * 0.018, bladeLen * 0.034, bladeLen * 0.018, 0, 0, Math.PI * 2);
        ctx.fill();

        if (activeHit) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'rgba(255,230,214,0.68)';
            ctx.lineWidth = Math.max(2, bladeLen * 0.018);
            ctx.beginPath();
            ctx.moveTo(0, bladeTopY + bladeLen * 0.06);
            ctx.lineTo(0, bladeTipY - bladeLen * 0.05);
            ctx.stroke();
        }
        ctx.restore();
    }
};

GameRenderer.drawKasiyasPathDelayedSlashObject = function(ctx, obj) {
    if (!ctx || !obj || !obj.active || !obj.path) return;
    const data = obj.data || {};
    const path = obj.path || {};
    const sx = Number.isFinite(parseFloat(path.startX)) ? parseFloat(path.startX) : 0;
    const sy = (this.GROUND_BASE_Y || 400) + (Number.isFinite(parseFloat(path.startY)) ? parseFloat(path.startY) : 0);
    const ex = Number.isFinite(parseFloat(path.endX)) ? parseFloat(path.endX) : sx;
    const ey = (this.GROUND_BASE_Y || 400) + (Number.isFinite(parseFloat(path.endY)) ? parseFloat(path.endY) : 0);
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const angle = Math.atan2(dy, dx);
    const pathD = Math.max(30, parseFloat(data.Hitbox_Size_Y) || parseFloat(obj.d) || 150);
    const fieldH = Math.max(80, parseFloat(data.Hitbox_Size_Z) || parseFloat(obj.h) || 150);
    const timer = Math.max(0, parseFloat(obj.timer) || 0);
    const warningDur = Math.max(0.05, parseFloat(obj.warningDuration) || parseFloat(data.Warning_Duration) || 0.45);
    const delayDur = Math.max(0, parseFloat(obj.hitboxDelayTime) || parseFloat(data.Hitbox_Delay_Time) || 0);
    const hitStart = warningDur + delayDur;
    const hitDur = Math.max(0.05, parseFloat(obj.hitDuration) || parseFloat(data.Hitbox_Duration) || 0.25);
    const hitEnd = hitStart + hitDur;
    const isActive = timer >= hitStart && timer <= hitEnd;
    const isCharge = !isActive && timer >= warningDur;
    const chargeT = delayDur > 0 ? Math.max(0, Math.min(1, (timer - warningDur) / delayDur)) : (isActive ? 1 : 0);
    const activeT = hitDur > 0 ? Math.max(0, Math.min(1, (timer - hitStart) / hitDur)) : 0;
    const maxLife = Math.max(hitEnd + 0.4, parseFloat(obj.maxLife) || parseFloat(data.Object_Internal_Duration) || 3.5);
    const fade = timer > hitEnd ? Math.max(0.20, 1 - (timer - hitEnd) / Math.max(0.4, maxLife - hitEnd)) : 1;
    const alpha = Math.max(0, Math.min(1, fade));
    const pulse = 0.5 + Math.sin((Date.now() / 70) + timer * 8) * 0.5;
    const seed = parseFloat(obj.seed) || 71;
    const count = Math.max(10, Math.min(28, Math.round(len / 58)));
    const visibleProgress = isCharge || isActive ? 1 : Math.max(0, Math.min(1, warningDur > 0 ? timer / warningDur : 1));
    const leadingFadeWidth = 0.14;
    const hitboxHalfD = pathD * 0.5;
    const visibleLen = len * visibleProgress;

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
    const glowColor = isActive ? 'rgba(230,0,0,0.78)' : (isCharge ? 'rgba(104,210,255,0.40)' : 'rgba(90,190,255,0.32)');

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);
    ctx.globalAlpha *= alpha;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = isActive ? 20 : (isCharge ? 9 : 8);
    ctx.shadowColor = glowColor;

    if (visibleLen > 1) {
        const bandAlpha = isActive ? (0.13 + pulse * 0.05) : (isCharge ? 0.055 : 0.035);
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
        ctx.fillRect(0, -hitboxHalfD, visibleLen, pathD);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, (isActive ? 0.72 : (isCharge ? 0.34 : 0.24)) * alpha));
        ctx.shadowBlur = isActive ? 16 : (isCharge ? 6 : 5);
        ctx.shadowColor = glowColor;
        ctx.strokeStyle = isActive ? 'rgba(255,44,34,0.88)' : (isCharge ? 'rgba(142,226,255,0.62)' : 'rgba(124,220,255,0.58)');
        ctx.lineWidth = Math.max(1.8, pathD * (isActive ? 0.020 : 0.014));
        if (!isActive && !isCharge) ctx.setLineDash([Math.max(12, pathD * 0.18), Math.max(8, pathD * 0.11)]);
        for (const railY of [-hitboxHalfD, hitboxHalfD]) {
            ctx.beginPath();
            ctx.moveTo(0, railY);
            ctx.lineTo(visibleLen, railY);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
    }

    for (let i = 0; i < count; i++) {
        const t = (i + 0.35) / count;
        if (t > visibleProgress + 0.012) continue;
        const noise = Math.sin((i + 1) * 12.9898 + seed * 0.017) * 43758.5453;
        const n = noise - Math.floor(noise);
        const noise2 = Math.sin((i + 5) * 78.233 + seed * 0.031) * 17341.9281;
        const n2 = noise2 - Math.floor(noise2);
        const side = (n * 2 - 1) * pathD * 0.47;
        const localX = len * t;
        const localY = side;
        const trailAge = isCharge || isActive ? 1 : Math.max(0, Math.min(1, (visibleProgress - t + leadingFadeWidth) / leadingFadeWidth));
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
        ctx.fillStyle = edgeColor;
        ctx.beginPath();
        ctx.moveTo(-bladeW * 0.52, 0);
        ctx.quadraticCurveTo(-bladeW * 0.18, -bladeH * 0.72, bladeW * 0.54, -bladeH * 0.18);
        ctx.quadraticCurveTo(bladeW * 0.64, 0, bladeW * 0.54, bladeH * 0.18);
        ctx.quadraticCurveTo(-bladeW * 0.18, bladeH * 0.72, -bladeW * 0.52, 0);
        ctx.closePath();
        ctx.fill();

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

    if (isActive) {
        ctx.globalAlpha = Math.max(0, Math.min(1, (0.10 + (1 - activeT) * 0.16 + pulse * 0.05) * alpha));
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(230,0,0,0.48)';
        ctx.strokeStyle = 'rgba(255,36,30,0.38)';
        ctx.lineWidth = Math.max(1.6, pathD * 0.014);
        ctx.beginPath();
        ctx.moveTo(len * 0.04, -pathD * 0.06);
        ctx.quadraticCurveTo(len * 0.50, pathD * 0.035, len * 0.96, -pathD * 0.06);
        ctx.stroke();
        ctx.globalAlpha = Math.max(0, Math.min(1, (0.28 + (1 - activeT) * 0.22 + pulse * 0.08) * alpha));
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255,0,0,0.62)';
        ctx.strokeStyle = 'rgba(255,58,44,0.62)';
        ctx.lineWidth = Math.max(2.4, pathD * 0.022);
        for (let i = 0; i < 3; i++) {
            const x0 = len * (0.10 + i * 0.31);
            const x1 = x0 + len * 0.20;
            const y0 = (i % 2 === 0 ? -1 : 1) * hitboxHalfD * 0.82;
            const y1 = -y0;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        }
    }
    ctx.restore();
};




GameRenderer.drawKasiyasP3M2GiantSwordDropObject = function(ctx, obj) {
    if (!ctx || !obj) return;
    const data = obj.data || {};
    const x = parseFloat(obj.x) || 0;
    const groundY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const timer = parseFloat(obj.timer) || 0;
    const warning = Math.max(0.08, parseFloat(obj.warningDuration) || parseFloat(data.Warning_Duration) || 1.0);
    const delay = Math.max(0, parseFloat(obj.delayTime) || parseFloat(data.Hitbox_Delay_Time) || 0);
    const impactStart = warning + delay;
    const w = Math.max(80, parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 250);
    const d = Math.max(50, parseFloat(obj.d) || parseFloat(data.Hitbox_Size_Y) || 130);
    const pre = Math.max(0, Math.min(1, timer / Math.max(impactStart, 0.001)));
    const impactRate = timer < impactStart ? 0 : Math.max(0, Math.min(1, (timer - impactStart) / 0.18));
    const flash = 0.5 + 0.5 * Math.sin(Date.now() / 75 + (obj.seed || 0));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.18 + 0.16 * flash;
    const beamGrad = ctx.createLinearGradient(x, groundY - 420, x, groundY + 12);
    beamGrad.addColorStop(0, 'rgba(170,90,255,0)');
    beamGrad.addColorStop(0.18, 'rgba(160,84,255,0.18)');
    beamGrad.addColorStop(0.42, 'rgba(255,82,76,0.24)');
    beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.ellipse(x, groundY - 180, w * 0.16, 260, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.20 + 0.22 * flash;
    ctx.strokeStyle = 'rgba(255,76,76,0.98)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, groundY, w * (0.45 + pre * 0.05), d * (0.42 + pre * 0.05), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.12 + 0.10 * pre;
    ctx.fillStyle = 'rgba(80,0,18,0.92)';
    ctx.beginPath();
    ctx.ellipse(x, groundY, w * 0.50, d * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.38;
    ctx.strokeStyle = 'rgba(30,0,50,0.96)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const a = Math.PI * 2 * i / 8 + pre * 0.8;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * w * 0.12, groundY + Math.sin(a) * d * 0.09);
        ctx.lineTo(x + Math.cos(a) * w * 0.48, groundY + Math.sin(a) * d * 0.36);
        ctx.stroke();
    }
    ctx.restore();

    const startHeight = 380;
    const endHeight = 20;
    const fallEase = Math.pow(pre, 0.58);
    const swordY = groundY - (startHeight * (1 - fallEase) + endHeight * fallEase) + impactRate * 10;
    const swordLen = Math.max(205, w * 1.00);
    const bladeLen = swordLen * 0.82;
    const bladeW = Math.max(22, w * 0.072);

    ctx.save();
    ctx.globalAlpha = timer < impactStart ? (0.88 + 0.10 * pre) : Math.max(0.18, 1 - impactRate * 0.86);
    ctx.translate(x, swordY);
    ctx.shadowBlur = 22;
    ctx.shadowColor = 'rgba(255,60,60,0.52)';

    // motion streaks
    if (timer < impactStart) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(255,84,74,0.25)';
        ctx.lineWidth = Math.max(3, bladeW * 0.18);
        for (let i = 0; i < 4; i++) {
            const ox = (i - 1.5) * bladeW * 0.35;
            ctx.beginPath();
            ctx.moveTo(ox, -swordLen * 0.22);
            ctx.lineTo(ox, -swordLen * 0.72 - pre * 70);
            ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    // hilt / guard
    ctx.fillStyle = 'rgba(40,22,50,0.98)';
    ctx.fillRect(-bladeW * 0.52, -swordLen * 0.57, bladeW * 1.04, swordLen * 0.24);
    ctx.strokeStyle = 'rgba(198,188,210,0.60)';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 4; i++) {
        const yy = -swordLen * 0.55 + i * swordLen * 0.05;
        ctx.beginPath();
        ctx.moveTo(-bladeW * 0.40, yy);
        ctx.lineTo(bladeW * 0.40, yy + bladeW * 0.10);
        ctx.stroke();
    }
    ctx.fillStyle = 'rgba(164,128,98,0.98)';
    ctx.fillRect(-bladeW * 1.9, -swordLen * 0.35, bladeW * 3.8, bladeW * 0.62);
    ctx.fillStyle = 'rgba(86,70,78,0.98)';
    ctx.beginPath();
    ctx.moveTo(-bladeW * 2.3, -swordLen * 0.02);
    ctx.lineTo(-bladeW * 0.62, -swordLen * 0.30);
    ctx.lineTo(bladeW * 0.62, -swordLen * 0.30);
    ctx.lineTo(bladeW * 2.3, -swordLen * 0.02);
    ctx.lineTo(bladeW * 0.76, bladeW * 0.14 - swordLen * 0.28);
    ctx.lineTo(bladeW * 0.14, bladeW * 0.00 - swordLen * 0.20);
    ctx.lineTo(-bladeW * 0.14, bladeW * 0.00 - swordLen * 0.20);
    ctx.lineTo(-bladeW * 0.76, bladeW * 0.14 - swordLen * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(230,58,48,0.95)';
    ctx.beginPath();
    ctx.arc(0, -swordLen * 0.17, bladeW * 0.34, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createLinearGradient(0, -swordLen * 0.20, 0, bladeLen * 0.78);
    grad.addColorStop(0, 'rgba(246,220,198,0.98)');
    grad.addColorStop(0.08, 'rgba(72,44,100,0.96)');
    grad.addColorStop(0.22, 'rgba(84,58,118,0.98)');
    grad.addColorStop(0.40, 'rgba(226,28,46,0.98)');
    grad.addColorStop(0.84, 'rgba(138,0,30,0.98)');
    grad.addColorStop(1, 'rgba(24,0,14,1)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-bladeW * 0.95, -swordLen * 0.22);
    ctx.quadraticCurveTo(-bladeW * 1.34, bladeLen * 0.05, -bladeW * 0.70, bladeLen * 0.54);
    ctx.quadraticCurveTo(-bladeW * 0.45, bladeLen * 0.70, 0, bladeLen * 0.84);
    ctx.quadraticCurveTo(bladeW * 1.12, bladeLen * 0.22, bladeW * 0.92, -swordLen * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(12,0,8,0.94)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,96,74,0.92)';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(bladeW * 0.12, -swordLen * 0.18);
    ctx.quadraticCurveTo(bladeW * 0.56, bladeLen * 0.22, bladeW * 0.02, bladeLen * 0.76);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(88,44,110,0.72)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bladeW * 0.12, -swordLen * 0.12);
    ctx.quadraticCurveTo(-bladeW * 0.24, bladeLen * 0.20, -bladeW * 0.06, bladeLen * 0.56);
    ctx.stroke();
    ctx.restore();

    if (timer >= impactStart) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.max(0, 0.74 * (1 - impactRate));
        ctx.strokeStyle = 'rgba(255,48,42,0.98)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.ellipse(x, groundY, w * (0.48 + impactRate * 0.32), d * (0.42 + impactRate * 0.24), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(154,76,255,0.84)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 12; i++) {
            const a = Math.PI * 2 * i / 12 + impactRate * 0.8;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(a) * w * 0.14, groundY + Math.sin(a) * d * 0.09);
            ctx.lineTo(x + Math.cos(a) * w * (0.46 + impactRate * 0.28), groundY + Math.sin(a) * d * (0.22 + impactRate * 0.22));
            ctx.stroke();
        }
        ctx.restore();
    }
};


GameRenderer.drawKasiyasP3M2ApostleEnergyEruptionObject = function(ctx, obj) {
    if (!ctx || !obj) return;
    const data = obj.data || {};
    const x = parseFloat(obj.x) || 0;
    const groundY = this.GROUND_BASE_Y + (parseFloat(obj.y) || 0);
    const timer = parseFloat(obj.timer) || 0;
    const warning = Math.max(0.08, parseFloat(obj.warningDuration) || parseFloat(data.Warning_Duration) || 0.5);
    const hitStart = warning + Math.max(0, parseFloat(obj.delayTime) || parseFloat(data.Hitbox_Delay_Time) || 0);
    const hitDuration = Math.max(0.05, parseFloat(obj.hitDuration) || parseFloat(data.Hitbox_Duration) || 0.3);
    const w = Math.max(70, parseFloat(obj.w) || parseFloat(data.Hitbox_Size_X) || 230);
    const d = Math.max(50, parseFloat(obj.d) || parseFloat(data.Hitbox_Size_Y) || 140);
    const warnRate = Math.max(0, Math.min(1, timer / Math.max(0.001, warning)));
    const burstRate = timer < hitStart ? 0 : Math.max(0, Math.min(1, (timer - hitStart) / Math.max(0.001, hitDuration)));
    const flash = 0.5 + 0.5 * Math.sin(Date.now() / 60 + (obj.seed || 0));

    if (timer < hitStart) {
        ctx.save();
        ctx.globalAlpha = 0.34 + 0.18 * flash;
        ctx.strokeStyle = 'rgba(120,72,255,0.98)';
        ctx.lineWidth = 4.4;
        ctx.beginPath();
        ctx.ellipse(x, groundY, w * (0.26 + warnRate * 0.18), d * (0.24 + warnRate * 0.16), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = 'rgba(36,0,54,0.92)';
        ctx.beginPath();
        ctx.ellipse(x, groundY, w * 0.34, d * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.26;
        ctx.strokeStyle = 'rgba(12,0,24,0.98)';
        ctx.lineWidth = 3.2;
        for (let i = 0; i < 6; i++) {
            const a = Math.PI * 2 * i / 6 + warnRate * 0.45;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(a) * w * 0.08, groundY + Math.sin(a) * d * 0.05);
            ctx.lineTo(x + Math.cos(a) * w * 0.30, groundY + Math.sin(a) * d * 0.22);
            ctx.stroke();
        }
        ctx.globalAlpha = 0.36;
        ctx.strokeStyle = 'rgba(182,132,255,0.58)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.20, groundY + 2);
        ctx.lineTo(x - w * 0.08, groundY - 10 - warnRate * 14);
        ctx.lineTo(x + w * 0.01, groundY - 2);
        ctx.lineTo(x + w * 0.11, groundY - 16 - warnRate * 10);
        ctx.lineTo(x + w * 0.20, groundY + 3);
        ctx.stroke();
        ctx.restore();
        return;
    }

    const fade = Math.max(0, 1 - burstRate * 2.2);
    if (fade <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.84 * fade;
    ctx.strokeStyle = 'rgba(168,98,255,0.98)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(x, groundY, w * (0.18 + burstRate * 0.62), d * (0.14 + burstRate * 0.48), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(54,0,84,0.88)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(x, groundY, w * (0.12 + burstRate * 0.46), d * (0.10 + burstRate * 0.34), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.54 * fade;
    const glow = ctx.createRadialGradient(x, groundY, 3, x, groundY, Math.max(w, d) * 0.9);
    glow.addColorStop(0, 'rgba(196,144,255,0.96)');
    glow.addColorStop(0.22, 'rgba(116,42,210,0.76)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(x, groundY, w * (0.24 + burstRate * 0.30), d * (0.18 + burstRate * 0.24), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = fade;
    for (let i = 0; i < 8; i++) {
        const a = Math.PI * 2 * i / 8 + (obj.seed || 0) * 0.2;
        const spread = 0.15 + (i % 3) * 0.03;
        const baseX = x + Math.cos(a) * w * 0.05;
        const plumeW = w * (0.08 + (i % 2) * 0.03);
        const topY = groundY - (92 + 48 * (1 - burstRate)) * (0.62 + (i % 4) * 0.12);
        const grad2 = ctx.createLinearGradient(baseX, groundY, baseX, topY);
        grad2.addColorStop(0, 'rgba(214,150,255,0.98)');
        grad2.addColorStop(0.34, 'rgba(132,64,255,0.94)');
        grad2.addColorStop(0.70, 'rgba(62,0,78,0.62)');
        grad2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.moveTo(baseX - plumeW * 0.7, groundY);
        ctx.quadraticCurveTo(baseX - plumeW * (0.7 + spread), (groundY + topY) * 0.70, baseX - plumeW * 0.16, topY + 12);
        ctx.quadraticCurveTo(baseX, topY - 16, baseX + plumeW * 0.18, topY + 10);
        ctx.quadraticCurveTo(baseX + plumeW * (0.7 + spread), (groundY + topY) * 0.72, baseX + plumeW * 0.72, groundY);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
};
