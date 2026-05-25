// boss_vfx_system.js
// 보스/몬스터 전투 로직에서 분리한 VFX 생성 전담 모듈입니다.
// 기존 호출부 안정성을 위해 MonsterManager wrapper에서 this를 유지한 채 호출됩니다.

const BossVFXSystem = {
    resolveEffectTypeFromEnum: function(effectEnum, fallbackType = '') {
    const v = String(effectEnum || '').trim();
    
    const map = {
        EFT_SLASH: 'slash',
        EFT_LIGHTNING_SLASH: 'slash',
        EFT_THUNDERBOLT_SLASH: 'slash',
        EFT_KASIYAS_SLASH_01: 'slash',
        EFT_KASIYAS_SLASH_02: 'slash',
        EFT_KASIYAS_SLASH_03: 'slash',
        EFT_KASIYAS_SLASH_04: 'slash',
        EFT_KASIYAS_SLASH_DOWN: 'slash',
        EFT_KASIYAS_SLASH_UP: 'slash',
        EFT_KASIYAS_STABBING: 'slash',
        EFT_KASIYAS_RUSH_ISSEN: 'slash',
        EFT_KASIYAS_LOW_AREA_SLASH: 'slash',
        EFT_KASIYAS_HORIZONTAL_SLASH: 'slash',
        EFT_KASIYAS_CHARGE_SLASH_DOWN: 'slash',
        EFT_KASIYAS_SHOULDER_ATK: 'hitSpark',
        EFT_KASIYAS_FIST_BUMPING: 'hitSpark',
        EFT_KASIYAS_STOMP: 'hitSpark',
        EFT_SHOCKWAVE: 'shockwave',
    
        EFT_HIT: 'hitSpark',
        EFT_STRIKE: 'hitSpark',
        EFT_PUNCH: 'hitSpark',
    
        EFT_BITE: 'bite',
        EFT_THUNDERBOLT: 'lightning',
        EFT_ICE_NIDDLE: 'ice_needle',
        EFT_ICE_AURA: 'particle'
    };
    
    return map[v] || fallbackType;
    },

    pushMonsterAtkEffect: function(m, atkX, atkY, atkZ, atkW, atkH, gameState) {
    const effEnum = m.d.atkEffectRenderType;
    const effType = this.resolveEffectTypeFromEnum(effEnum, 'slash');
    
    const baseModelScale = Math.max(0.01, parseFloat(m.d.scale) || 1);
    const effectScale = Math.max(1, m.scale / baseModelScale);
    
    if (effType === 'slash') {
        let slashColor = "rgba(255, 50, 50, 0.9)";
        let slashLife = 0.2;
    
        if (effEnum === 'EFT_THUNDERBOLT_SLASH') {
            slashColor = m.isChampion ? "rgba(255, 220, 120, 0.96)" : "rgba(241, 196, 15, 0.92)";
            slashLife = 0.26;
        } else if (effEnum === 'EFT_LIGHTNING_SLASH') {
            slashColor = m.isChampion ? "rgba(255, 215, 110, 0.95)" : "rgba(255, 235, 150, 0.90)";
            slashLife = 0.22;
        } else if (effEnum === 'EFT_SLASH') {
            slashColor = m.isChampion ? "rgba(231, 76, 60, 0.92)" : "rgba(255, 50, 50, 0.90)";
            slashLife = 0.20;
        }
    
        gameState.effects.push({
            type: 'slash',
            renderType: effEnum,
            x: atkX,
            y: atkY,
            z: atkZ + atkH / 2,
            dir: m.faceDir,
            w: atkW,
            h: atkH,
            life: slashLife,
            maxLife: slashLife,
            color: slashColor,
            effectScale: effectScale
        });
        return;
    }
    
    if (effType === 'bite') {
        gameState.effects.push({
            type: 'bite',
            renderType: effEnum,
            x: atkX,
            y: atkY,
            z: atkZ + atkH / 2,
            dir: m.faceDir,
            w: atkW,
            h: atkH,
            life: 0.16,
            maxLife: 0.16,
            color: m.isChampion ? "rgba(255, 180, 120, 0.95)" : "rgba(255, 140, 140, 0.95)",
            effectScale: effectScale
        });
        return;
    }
    
    if (effType === 'hitSpark') {
        const isStrike = effEnum === 'EFT_STRIKE';
        const isPunch = effEnum === 'EFT_PUNCH';
    
        gameState.effects.push({
            type: 'hitSpark',
            renderType: effEnum,
            x: atkX,
            y: atkY,
            z: atkZ + atkH / 2,
            w: atkW,
            h: atkH,
            dir: m.faceDir,
            life: isStrike ? 0.16 : (isPunch ? 0.14 : 0.12),
            maxLife: isStrike ? 0.16 : (isPunch ? 0.14 : 0.12),
            color: isStrike
                ? (m.isChampion ? "rgba(255, 245, 200, 0.98)" : "rgba(245, 245, 245, 0.96)")
                : isPunch
                    ? (m.isChampion ? "rgba(255, 206, 92, 0.98)" : "rgba(255, 206, 92, 0.96)")
                    : "rgba(241, 196, 15, 0.95)",
            accentColor: isStrike
                ? (m.isChampion ? "rgba(255, 210, 120, 0.96)" : "rgba(210, 220, 230, 0.92)")
                : isPunch
                    ? (m.isChampion ? "rgba(255, 240, 170, 0.98)" : "rgba(255, 236, 150, 0.96)")
                    : "rgba(255, 255, 255, 0.95)",
            burstScale: isStrike ? 1.2 : (isPunch ? 1.15 : 1.0),
            effectScale: isPunch ? effectScale : 1
        });
        return;
    }
    
    if (effType === 'particle') {
        gameState.effects.push({
            type: 'particle',
            renderType: effEnum,
            x: atkX,
            y: atkY,
            z: atkZ + atkH / 2,
            r: 4,
            color: "rgba(255,255,255,0.95)",
            life: 0.16,
            maxLife: 0.16,
            effectScale: effectScale
        });
    }
    },

    pushBossParryCueEffect: function(m, action, gameState) {
        if (!m || !action || !gameState) return;
        const renderType = String(action.Parry_EFT_Type || 'EFT_CAN_PARRY').trim() || 'EFT_CAN_PARRY';
        const scale = parseFloat(m.scale) || 1;
        const bodyX = ((m.d && m.d.bodyX) || 80) * scale;
        const bodyZ = ((m.d && m.d.bodyZ) || 160) * scale;
        gameState.effects.push({
            type: 'hitSpark',
            renderType: renderType,
            x: m.x,
            y: m.y,
            z: m.z + bodyZ * 0.70,
            dir: m.faceDir || 1,
            w: bodyX * 1.45,
            h: bodyZ * 0.95,
            burstScale: 1.35,
            life: 0.11,
            maxLife: 0.11,
            color: 'rgba(255,225,80,0.95)',
            accentColor: 'rgba(255,255,230,0.95)'
        });
    },

    pushPathWarningEffect: function(path, width, duration, renderType, gameState) {
        if (!path) return;
        const length = this.getPathLength(path);
        if (length <= 0) return;
    
        gameState.effects.push({
            type: 'warning',
            renderType: renderType || 'WARNING_SLASH_PATH',
            warningRenderType: renderType || 'WARNING_SLASH_PATH',
            x: (path.startX + path.endX) / 2,
            y: (path.startY + path.endY) / 2,
            z: path.startZ || 0,
            w: length,
            d: width,
            h: 0,
            pathAngle: Math.atan2(path.endY - path.startY, path.endX - path.startX),
            life: duration,
            maxLife: duration
        });
    },

    pushPathSlashEffects: function(path, width, height, renderType, gameState, lifeOverride = null) {
        if (!path) return;
        const length = this.getPathLength(path);
        if (length <= 0) return;
    
        const effectType = String(renderType || '').trim().toUpperCase();
        const pathAngle = Math.atan2(path.endY - path.startY, path.endX - path.startX);
    
        // 카시야스 본체 돌진: 무수한 검격이 아니라 경로를 길게 가르는 일섬 1개로 표현한다.
        if (
            effectType === 'EFT_RUSH_ISSEN' ||
            effectType === 'EFT_KASIYAS_RUSH_ISSEN' ||
            effectType === 'EFT_KASIYAS_RUSH_SLASH'
        ) {
            gameState.effects.push({
                type: 'rushIssen',
                renderType: effectType || 'EFT_RUSH_ISSEN',
                x: (path.startX + path.endX) / 2,
                y: (path.startY + path.endY) / 2,
                z: (path.startZ || 0) + Math.max(35, height * 0.58),
                w: Math.max(120, length),
                h: Math.max(28, width * 0.58),
                life: 0.22,
                maxLife: 0.22,
                pathAngle: pathAngle,
                color: 'rgba(255, 52, 45, 0.98)',
                accentColor: 'rgba(32, 0, 0, 0.92)'
            });
            return;
        }
    
        // 카시야스 잔류 검격: 경로 위에 얇은 검선 여러 개를 남긴다.
        if (
            effectType === 'EFT_MANY_SLASH_BURST' ||
            effectType === 'EFT_KASIYAS_PATH_SLASH_LINES'
        ) {
            const count = Math.max(10, Math.min(24, Math.round(length / 65)));
            const isKasiyasLines = effectType === 'EFT_KASIYAS_PATH_SLASH_LINES';
    
            for (let i = 0; i < count; i++) {
                const t = (i + 0.35 + Math.random() * 0.30) / count;
                const side = (Math.random() * 2 - 1) * (width * (isKasiyasLines ? 0.36 : 0.42));
                const nx = -(path.dirY || 0);
                const ny = path.dirX || 0;
                const x = path.startX + (path.endX - path.startX) * t + nx * side;
                const y = path.startY + (path.endY - path.startY) * t + ny * side;
    
                gameState.effects.push({
                    type: 'pathLineSlash',
                    renderType: effectType,
                    x: x,
                    y: y,
                    z: (path.startZ || 0) + height * (0.20 + Math.random() * 0.55),
                    dir: Math.random() > 0.5 ? 1 : -1,
                    w: isKasiyasLines
                        ? Math.max(34, width * (0.62 + Math.random() * 0.44))
                        : Math.max(42, width * (0.85 + Math.random() * 0.55)),
                    h: isKasiyasLines
                        ? Math.max(18, height * (0.24 + Math.random() * 0.18))
                        : Math.max(28, height * (0.34 + Math.random() * 0.26)),
                    life: lifeOverride !== null ? Math.max(0.08, lifeOverride) : (0.18 + Math.random() * 0.10),
                    maxLife: lifeOverride !== null ? Math.max(0.08, lifeOverride) : 0.26,
                    color: isKasiyasLines ? 'rgba(255, 60, 54, 0.92)' : 'rgba(255, 68, 58, 0.95)',
                    accentColor: isKasiyasLines ? 'rgba(28, 0, 0, 0.88)' : 'rgba(40, 0, 0, 0.86)',
                    pathAngle: pathAngle + (Math.random() * 1.15 - 0.575)
                });
            }
            return;
        }
    
        const count = Math.max(6, Math.min(16, Math.round(length / 90)));
        for (let i = 0; i < count; i++) {
            const t = (i + 0.5) / count;
            const side = (Math.random() * 2 - 1) * (width * 0.36);
            const nx = -(path.dirY || 0);
            const ny = path.dirX || 0;
            const x = path.startX + (path.endX - path.startX) * t + nx * side;
            const y = path.startY + (path.endY - path.startY) * t + ny * side;
            gameState.effects.push({
                type: 'slash',
                renderType: renderType || 'EFT_KASIYAS_RUSH_SLASH',
                x: x,
                y: y,
                z: (path.startZ || 0) + height * (0.35 + Math.random() * 0.35),
                dir: path.dirX >= 0 ? 1 : -1,
                w: Math.max(80, width * 1.8),
                h: Math.max(70, height * 0.75),
                life: 0.22,
                maxLife: 0.22,
                color: 'rgba(255, 235, 210, 0.96)',
                pathAngle: pathAngle
            });
        }
    },

    pushPathResidualSlashField: function(path, width, height, gameState, warningDuration, delayDuration, hitDuration, renderType) {
        if (!path) return;
        const length = this.getPathLength(path);
        if (length <= 0) return;
    
        const safeWarning = Math.max(0.05, parseFloat(warningDuration) || 0);
        const safeDelay = Math.max(0, parseFloat(delayDuration) || 0);
        const safeHit = Math.max(0.05, parseFloat(hitDuration) || 0.2);
        const totalLife = Math.max(0.12, safeWarning + safeDelay + safeHit + 0.10);
        const pathAngle = Math.atan2(path.endY - path.startY, path.endX - path.startX);
    
        gameState.effects.push({
            type: 'pathResidualSlashField',
            renderType: renderType || 'EFT_KASIYAS_PATH_SLASH_LINES',
            x: (path.startX + path.endX) / 2,
            y: (path.startY + path.endY) / 2,
            z: (path.startZ || 0) + Math.max(10, height * 0.42),
            w: length,
            d: width,
            h: height,
            pathAngle: pathAngle,
            warningDuration: safeWarning,
            delayDuration: safeDelay,
            hitDuration: safeHit,
            life: totalLife,
            maxLife: totalLife,
            seed: Math.floor(Math.random() * 100000)
        });
    },

    pushBossActionCueEffect: function(m, action, gameState) {
        const eff = String(action && (action.VFX_Type || action.Effect_Render_Type) || '').trim().toUpperCase();
        if (!eff) return;
    
        const scale = parseFloat(m && m.scale) || 1;
        const bodyX = ((m && m.d && m.d.bodyX) || 80) * scale;
        const bodyY = ((m && m.d && m.d.bodyY) || 60) * scale;
        const bodyZ = ((m && m.d && m.d.bodyZ) || 160) * scale;
        const hitW = (parseFloat(action && action.Hitbox_Size_X) || bodyX * 2.0) * scale;
        const hitD = (parseFloat(action && action.Hitbox_Size_Y) || bodyY * 1.6) * scale;
        const hitH = (parseFloat(action && action.Hitbox_Size_Z) || bodyZ * 0.9) * scale;
        const hitOffX = (parseFloat(action && action.Hitbox_Offset_X) || bodyX * 0.55) * scale;
        const hitOffZ = (parseFloat(action && action.Hitbox_Offset_Z) || bodyZ * 0.48) * scale;
        const dir = m && m.faceDir === -1 ? -1 : 1;
        const duration = Math.max(0.12, Math.min(0.45, this.getBossActionDuration(m, action, gameState) * 0.55));
    
        if (eff === 'EFT_KASIYAS_SHOULDER_ATK') {
            gameState.effects.push({
                type: 'shoulderCharge',
                renderType: eff,
                x: m.x + dir * Math.max(bodyX * 0.58, hitOffX * 0.72),
                y: m.y,
                z: m.z + Math.max(bodyZ * 0.52, hitOffZ),
                dir: dir,
                w: Math.max(hitW * 1.05, bodyX * 2.2),
                d: Math.max(hitD * 1.05, bodyY * 1.5),
                h: Math.max(hitH, bodyZ * 0.70),
                burstScale: 1.0,
                life: duration,
                maxLife: duration,
                color: 'rgba(255,88,58,0.88)',
                accentColor: 'rgba(22,0,0,0.88)'
            });
            return;
        }
    
        if (eff === 'EFT_KASIYAS_FIST_BUMPING') {
            gameState.effects.push({
                type: 'hitSpark',
                renderType: eff,
                x: m.x + dir * Math.max(bodyX * 0.72, hitOffX * 0.85),
                y: m.y,
                z: m.z + Math.max(bodyZ * 0.58, hitOffZ),
                dir: dir,
                w: Math.max(hitW * 1.05, bodyX * 2.0),
                d: Math.max(hitD * 1.05, bodyY * 1.4),
                h: Math.max(hitH, bodyZ * 0.72),
                burstScale: 1.0,
                life: duration,
                maxLife: duration,
                color: 'rgba(255,78,58,0.90)',
                accentColor: 'rgba(18,0,0,0.90)'
            });
            return;
        }
    
        if (eff === 'EFT_KASIYAS_STOMP') {
            gameState.effects.push({
                type: 'stompDust',
                renderType: eff,
                x: m.x + dir * bodyX * 0.36,
                y: m.y,
                z: m.z + 4,
                w: Math.max(bodyX * 1.1, hitW * 0.45),
                d: Math.max(bodyY * 0.9, hitD * 0.45),
                h: Math.max(18, bodyZ * 0.12),
                life: Math.min(duration, 0.22),
                maxLife: Math.min(duration, 0.22),
                color: 'rgba(230,214,188,0.58)',
                accentColor: 'rgba(56,42,30,0.64)'
            });
        }
    },

    pushBossPatternActionEffect: function(m, action, atkX, atkY, atkZ, atkW, atkD, atkH, gameState) {
        const actionType = String(action && action.Action_Type || '').trim().toUpperCase();
        if (actionType && actionType !== 'ATK') return;
        const effEnum = String(action && (action.VFX_Type || action.Effect_Render_Type) || 'EFT_SLASH').trim();
        const effectScale = Math.max(1, parseFloat(m.scale) || 1);
        const poseType = String(action && action.Action_Pose_Type || '').trim().toUpperCase();
    
        let slashColor = 'rgba(255, 56, 50, 0.96)';
        let accentColor = 'rgba(32, 0, 0, 0.88)';
        let life = 0.24;
    
        const upperEff = effEnum.toUpperCase();
        if (upperEff === 'EFT_KASIYAS_SWORDPLAY') {
            gameState.effects.push({
                type: 'swordplaySlashes',
                renderType: upperEff,
                x: atkX,
                y: atkY,
                z: atkZ + atkH * 0.56,
                dir: m.faceDir || 1,
                w: Math.max(atkW * 1.08, 230 * effectScale),
                d: Math.max(atkD * 1.08, 110 * effectScale),
                h: Math.max(atkH, 150 * effectScale),
                life: 0.22,
                maxLife: 0.22,
                color: 'rgba(255,72,58,0.96)',
                accentColor: 'rgba(18,0,0,0.92)'
            });
            return;
        }

        if (upperEff === 'EFT_KASIYAS_CHARGE_HORIZONTAL_SLASH') {
            gameState.effects.push({
                type: 'chargeHorizontalSlash',
                renderType: upperEff,
                x: atkX,
                y: atkY,
                // 횡베기 계열은 몸통 높이가 아니라 바닥에 깔린 원호 검흔으로 보이게 낮게 출력한다.
                // 강화 횡베기도 몸통 높이가 아니라 바닥에 깔린 큰 원호로 보이도록 더 낮춘다.
                z: atkZ + Math.max(6, atkH * 0.10),
                dir: m.faceDir || 1,
                // 경고 범위와 실제 공격 범위가 어긋나 보이지 않도록 hitbox 크기를 그대로 전달한다.
                w: Math.max(1, atkW),
                d: Math.max(1, atkD),
                h: Math.max(1, atkH),
                life: 0.30,
                maxLife: 0.30,
                color: 'rgba(255,66,48,0.98)',
                accentColor: 'rgba(12,0,0,0.95)'
            });
            return;
        }

        if (upperEff === 'EFT_KASIYAS_SHOULDER_ATK') {
            gameState.effects.push({
                type: 'shoulderCharge',
                renderType: upperEff,
                x: atkX,
                y: atkY,
                z: atkZ + atkH * 0.48,
                dir: m.faceDir,
                w: Math.max(atkW * 1.16, 190 * effectScale),
                d: Math.max((atkD || atkH * 0.55) * 1.12, 90 * effectScale),
                h: Math.max(atkH, 90 * effectScale),
                life: 0.30,
                maxLife: 0.30,
                color: 'rgba(255,88,58,0.90)',
                accentColor: 'rgba(22,0,0,0.90)'
            });
            return;
        }
    
        if (upperEff === 'EFT_KASIYAS_FIST_BUMPING' || upperEff === 'EFT_KASIYAS_STOMP') {
            gameState.effects.push({
                type: upperEff === 'EFT_KASIYAS_STOMP' ? 'stompDust' : 'hitSpark',
                renderType: upperEff,
                x: atkX,
                y: atkY,
                z: atkZ + atkH * (upperEff === 'EFT_KASIYAS_STOMP' ? 0.18 : 0.55),
                dir: m.faceDir,
                w: upperEff === 'EFT_KASIYAS_STOMP' ? Math.max(atkW * 0.52, 85 * effectScale) : Math.max(atkW * 1.10, 150 * effectScale),
                d: upperEff === 'EFT_KASIYAS_STOMP' ? Math.max((atkD || atkH) * 0.48, 55 * effectScale) : Math.max((atkD || atkH) * 1.08, 70 * effectScale),
                h: upperEff === 'EFT_KASIYAS_STOMP' ? Math.max(18, atkH * 0.20) : atkH,
                life: upperEff === 'EFT_KASIYAS_STOMP' ? 0.18 : 0.24,
                maxLife: upperEff === 'EFT_KASIYAS_STOMP' ? 0.18 : 0.24,
                burstScale: upperEff === 'EFT_KASIYAS_FIST_BUMPING' ? 1.45 : 0.85,
                color: upperEff === 'EFT_KASIYAS_STOMP' ? 'rgba(230,214,188,0.58)' : 'rgba(255,76,60,0.92)',
                accentColor: upperEff === 'EFT_KASIYAS_STOMP' ? 'rgba(56,42,30,0.64)' : 'rgba(28,0,0,0.90)'
            });
            return;
        }
    
        if (upperEff === 'EFT_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_CHARGE_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_SLASH_01' || upperEff === 'EFT_KASIYAS_SLASH_04') {
            slashColor = 'rgba(255, 48, 44, 0.98)';
            accentColor = 'rgba(26, 0, 0, 0.92)';
            life = 0.28;
        } else if (upperEff === 'EFT_STABBING' || upperEff === 'EFT_KASIYAS_STABBING' || upperEff === 'EFT_KASIYAS_SLASH_02') {
            slashColor = 'rgba(255, 64, 56, 0.98)';
            accentColor = 'rgba(20, 0, 0, 0.90)';
            life = 0.22;
        } else if (upperEff === 'EFT_SLASH_UP' || upperEff === 'EFT_KASIYAS_SLASH_UP' || upperEff === 'EFT_KASIYAS_SLASH_03') {
            slashColor = 'rgba(255, 58, 52, 0.98)';
            accentColor = 'rgba(30, 0, 0, 0.92)';
            life = 0.28;
        } else if (upperEff === 'EFT_RUSH_ISSEN' || upperEff === 'EFT_KASIYAS_RUSH_ISSEN' || upperEff === 'EFT_KASIYAS_RUSH_SLASH') {
            slashColor = 'rgba(255, 52, 45, 0.98)';
            accentColor = 'rgba(18, 0, 0, 0.94)';
            life = 0.24;
        }
    
        const isHorizontalSlashEffect = upperEff === 'EFT_KASIYAS_HORIZONTAL_SLASH' || upperEff === 'EFT_HORIZONTAL_SLASH';
        gameState.effects.push({
            type: 'slash',
            renderType: effEnum,
            poseType: poseType,
            x: atkX,
            y: atkY,
            z: isHorizontalSlashEffect ? (atkZ + Math.max(5, atkH * 0.08)) : (atkZ + atkH / 2),
            dir: m.faceDir,
            w: atkW,
            d: atkD,
            h: atkH,
            life: life,
            maxLife: life,
            color: slashColor,
            accentColor: accentColor,
            effectScale: effectScale
        });
    },

    pushBossCastEffect: function(m, action, gameState) {
        const eff = String(action && (action.VFX_Type || action.Effect_Render_Type) || '').trim().toUpperCase();
        if (!eff) return;
    
        if (eff === 'EFT_SUMMON_CLONE') {
            gameState.effects.push({
                type: 'cloneSummon',
                renderType: eff,
                x: m.x + (m.faceDir || 1) * ((m.d.bodyX || 80) * (m.scale || 1) * 0.25),
                y: m.y,
                z: m.z + ((m.d.bodyZ || 160) * (m.scale || 1) * 0.55),
                dir: m.faceDir || 1,
                w: ((m.d.bodyX || 80) * (m.scale || 1)) * 1.8,
                h: ((m.d.bodyZ || 160) * (m.scale || 1)) * 0.9,
                life: 0.30,
                maxLife: 0.30,
                color: 'rgba(255,70,58,0.82)',
                accentColor: 'rgba(24,0,0,0.82)'
            });
            return;
        }
    
        if (eff === 'EFT_KASIYAS_STOMP') {
            gameState.effects.push({
                type: 'stompDust',
                renderType: eff,
                x: m.x + (m.faceDir || 1) * ((m.d.bodyX || 80) * (m.scale || 1) * 0.35),
                y: m.y,
                z: m.z + 6,
                w: ((m.d.bodyX || 80) * (m.scale || 1)) * 1.15,
                d: ((m.d.bodyY || 60) * (m.scale || 1)) * 1.10,
                h: 24,
                life: 0.20,
                maxLife: 0.20,
                color: 'rgba(230,214,188,0.58)',
                accentColor: 'rgba(56,42,30,0.64)'
            });
            return;
        }
    
        if (eff === 'EFT_CAST_AFTERIMAGE') {
            gameState.effects.push({
                type: 'castAfterimageBurst',
                renderType: eff,
                x: m.x + (m.faceDir || 1) * ((m.d.bodyX || 80) * (m.scale || 1) * 0.45),
                y: m.y,
                z: m.z + ((m.d.bodyZ || 160) * (m.scale || 1) * 0.55),
                dir: m.faceDir || 1,
                w: ((m.d.bodyX || 80) * (m.scale || 1)) * 1.6,
                h: ((m.d.bodyZ || 160) * (m.scale || 1)) * 0.55,
                life: 0.24,
                maxLife: 0.24,
                color: 'rgba(180, 225, 255, 0.86)'
            });
            return;
        }
    
        // CAST_SPAWN_OBJECT / MOVE_GROUP / WAIT 같은 비공격 액션에서 알 수 없는 이펙트가 들어와도
        // 공용 기본 참격(EFT_SLASH)으로 대체하지 않는다.
        // 대형 패턴 1번 위치 섞기 중 본체에만 고블린 기본 공격 같은 반달 검기가 출력되는 것을 막기 위한 안전장치다.
        return;
    },

    pushBossObjectActionEffect: function(obj, action, hitbox, gameState) {
        const renderType = String(action.VFX_Type || '').trim().toUpperCase();
        if (!renderType) return;
    
        if (renderType === 'EFT_KASIYAS_SWORDPLAY') {
            gameState.effects.push({
                type: 'swordplaySlashes',
                renderType: renderType,
                x: hitbox.x,
                y: hitbox.y,
                z: hitbox.z + hitbox.h * 0.56,
                dir: obj.faceDir || 1,
                w: Math.max(hitbox.w * 1.04, 210 * (obj.scale || 1)),
                d: Math.max(hitbox.d * 1.04, 100 * (obj.scale || 1)),
                h: Math.max(hitbox.h, 140 * (obj.scale || 1)),
                life: 0.20,
                maxLife: 0.20,
                color: 'rgba(255,72,58,0.76)',
                accentColor: 'rgba(18,0,0,0.82)'
            });
            return;
        }

        if (renderType === 'EFT_KASIYAS_CHARGE_HORIZONTAL_SLASH') {
            gameState.effects.push({
                type: 'chargeHorizontalSlash',
                renderType: renderType,
                x: hitbox.x,
                y: hitbox.y,
                // 강화 횡베기 분신 이펙트도 바닥 쪽 원호 기준으로 낮춘다.
                z: hitbox.z + Math.max(6, hitbox.h * 0.10),
                dir: obj.faceDir || 1,
                // 경고 범위와 같은 hitbox 기준으로 표시한다.
                w: Math.max(1, hitbox.w),
                d: Math.max(1, hitbox.d),
                h: Math.max(1, hitbox.h),
                life: 0.28,
                maxLife: 0.28,
                color: 'rgba(255,72,58,0.78)',
                accentColor: 'rgba(18,0,0,0.82)'
            });
            return;
        }

        if (renderType === 'EFT_KASIYAS_LOW_AREA_SLASH') {
            gameState.effects.push({
                type: 'lowCircleSlash',
                renderType: renderType,
                x: hitbox.x,
                y: hitbox.y,
                z: hitbox.z + Math.max(8, hitbox.h * 0.25),
                w: hitbox.w,
                d: hitbox.d,
                h: hitbox.h,
                dir: obj.faceDir || 1,
                life: 0.24,
                maxLife: 0.24,
                color: 'rgba(255, 58, 50, 0.96)',
                accentColor: 'rgba(24, 0, 0, 0.90)'
            });
            return;
        }
    
        const isHorizontalObjectSlash = renderType === 'EFT_KASIYAS_HORIZONTAL_SLASH' || renderType === 'EFT_HORIZONTAL_SLASH';
        gameState.effects.push({
            type: 'slash',
            renderType: renderType,
            x: hitbox.x,
            y: hitbox.y,
            z: isHorizontalObjectSlash ? (hitbox.z + Math.max(5, hitbox.h * 0.08)) : (hitbox.z + hitbox.h / 2),
            dir: obj.faceDir || 1,
            w: hitbox.w,
            d: hitbox.d,
            h: hitbox.h,
            life: 0.22,
            maxLife: 0.22,
            color: 'rgba(255, 56, 50, 0.98)',
            accentColor: 'rgba(28, 0, 0, 0.90)'
        });
    },
};

if (typeof window !== 'undefined') {
    window.BossVFXSystem = BossVFXSystem;
}
