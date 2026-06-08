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
        EFT_KASIYAS_P2_DOUBLE_SWORD_ANOTHER_ENERGY: 'particle',
        EFT_KASIYAS_P2_M1_LEFT_SWORD_SLASH_WITH_RED_ENERGY: 'slash',
        EFT_KASIYAS_P2_M1_RIGHT_SWORD_SLASH_WITH_YELLOW_ENERGY: 'slash',
        EFT_KASIYAS_P2_M1_X_SLASH_CHARGE: 'particle',
        EFT_KASIYAS_P2_M1_X_SLASH: 'slash',
    
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
            effectType === 'EFT_KASIYAS_PATH_SLASH_LINES' ||
            effectType === 'EFT_KASIYAS_PATH_ONI_SLASH_LINES'
        ) {
            const isOniLines = effectType === 'EFT_KASIYAS_PATH_ONI_SLASH_LINES';
            const count = isOniLines ? Math.max(14, Math.min(32, Math.round(length / 54))) : Math.max(10, Math.min(24, Math.round(length / 65)));
            const isKasiyasLines = effectType === 'EFT_KASIYAS_PATH_SLASH_LINES' || isOniLines;
    
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

    pushKasiyasRushBodyEffect: function(actor, path, action, gameState, options = {}) {
        if (!actor || !gameState || !Array.isArray(gameState.effects)) return;
        const nowTimer = (parseFloat(actor.actionTimer) || parseFloat(actor.timer) || 0);
        const last = parseFloat(actor.kasiyasRushBodyVfxTimer);
        if (Number.isFinite(last) && nowTimer - last < 0.035) return;
        actor.kasiyasRushBodyVfxTimer = nowTimer;

        const scale = parseFloat(actor.scale) || 1;
        const bodyX = ((actor.d && parseFloat(actor.d.bodyX)) || 80) * scale;
        const bodyY = ((actor.d && parseFloat(actor.d.bodyY)) || 60) * scale;
        const bodyZ = ((actor.d && parseFloat(actor.d.bodyZ)) || 160) * scale;
        const hitW = Math.max(bodyX, ((action && parseFloat(action.Hitbox_Size_X)) || 0) * scale);
        const hitD = Math.max(bodyY, ((action && parseFloat(action.Hitbox_Size_Y)) || 0) * scale);
        // 이펙트는 화면에 보이는 X/Y 범위만 주 기준으로 삼고, Hitbox_Size_Z/Offset_Z는 직접 위치 보정에 쓰지 않는다.
        // Z 판정이 큰 공격에서 이펙트가 하늘 쪽으로 뜨거나 X축 검기처럼 길게 보이는 문제를 줄이기 위한 기준이다.
        const hitOffX = ((action && parseFloat(action.Hitbox_Offset_X)) || 0) * scale;
        const hitOffY = ((action && parseFloat(action.Hitbox_Offset_Y)) || 0) * scale;
        const dirX = path && Math.abs(parseFloat(path.dirX) || 0) > 0.001 ? parseFloat(path.dirX) : ((actor.faceDir || 1) >= 0 ? 1 : -1);
        const dirY = path ? (parseFloat(path.dirY) || 0) : 0;
        const angle = Math.atan2(dirY, dirX);
        const isClone = !!options.isClone;
        const upperActionEffect = String((action && (action.VFX_Type || action.Effect_Render_Type)) || '').trim().toUpperCase();
        const isBasicRushIssen = upperActionEffect === 'EFT_KASIYAS_RUSH_ISSEN' || upperActionEffect === 'EFT_RUSH_ISSEN' || upperActionEffect === 'EFT_KASIYAS_RUSH_SLASH';
        const isOniRushSlash = upperActionEffect === 'EFT_KASIYAS_P2_ONI_SLASH';
        const isP3RushBody = upperActionEffect === 'EFT_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH' || upperActionEffect === 'EFT_KASIYAS_P3_RUSH_SLASH';
        const renderType = upperActionEffect || (isClone ? 'EFT_KASIYAS_CLONE_LOW_RUSH' : 'EFT_KASIYAS_LOW_RUSH');
        const visualW = Math.max(
            isBasicRushIssen ? 96 : (isOniRushSlash ? 86 : 112),
            bodyX * (isBasicRushIssen ? 1.28 : (isOniRushSlash ? 1.20 : (isClone ? 1.45 : 1.56))),
            hitW * (isBasicRushIssen ? 0.78 : (isOniRushSlash ? 0.88 : (isClone ? 0.86 : 0.94)))
        );
        const visualD = Math.max(
            isBasicRushIssen ? 46 : (isOniRushSlash ? 42 : 58),
            bodyY * (isBasicRushIssen ? 1.10 : (isOniRushSlash ? 1.08 : (isClone ? 1.28 : 1.42))),
            hitD * (isBasicRushIssen ? 0.82 : (isOniRushSlash ? 0.76 : (isClone ? 0.92 : 1.00)))
        );
        // 화면상 높이는 캐릭터 신체를 덮는 정도로 제한한다. 판정 Z가 커져도 이펙트가 위로 떠오르지 않는다.
        const visualH = Math.max(isOniRushSlash ? 62 : 72, bodyZ * (isBasicRushIssen ? 0.58 : (isOniRushSlash ? 0.62 : (isClone ? 0.66 : 0.74))), visualD * (isOniRushSlash ? 0.48 : 0.54));
        const fxX = (parseFloat(actor.x) || 0) + dirX * hitOffX * 0.30;
        const fxY = (parseFloat(actor.y) || 0) + hitOffY * 0.55;
        const fxZ = (parseFloat(actor.z) || 0) + Math.max(28, bodyZ * (isBasicRushIssen ? 0.38 : 0.44));

        gameState.effects.push({
            type: 'kasiyasRushBodySlash',
            renderType: renderType,
            x: fxX,
            y: fxY,
            z: fxZ,
            dir: dirX >= 0 ? 1 : -1,
            w: visualW,
            d: visualD,
            h: visualH,
            life: isClone ? 0.145 : 0.165,
            maxLife: isClone ? 0.145 : 0.165,
            pathAngle: angle,
            isClone: isClone,
            color: isP3RushBody ? 'rgba(134,66,255,0.88)' : (isBasicRushIssen ? 'rgba(235,34,32,0.82)' : (isClone ? 'rgba(210,36,54,0.74)' : 'rgba(255,44,40,0.90)')),
            accentColor: isP3RushBody ? 'rgba(10,0,42,0.88)' : (isBasicRushIssen ? 'rgba(18,0,0,0.82)' : (isClone ? 'rgba(50,0,18,0.70)' : 'rgba(18,0,0,0.90)')),
            hotColor: isP3RushBody ? 'rgba(224,208,255,0.66)' : (isBasicRushIssen ? 'rgba(255,176,80,0.58)' : (isClone ? 'rgba(255,135,100,0.55)' : 'rgba(255,215,86,0.72)')),
            bodyCoverRush: true,
            basicRushIssen: isBasicRushIssen,
            p3RushBody: isP3RushBody
        });

        // 몸에 붙는 공격 이펙트와 별개로, 아주 짧은 잔상만 뒤에 남긴다.
        gameState.effects.push({
            type: 'afterimageDashTrail',
            renderType: renderType,
            x: fxX - dirX * Math.max(bodyX, hitW * 0.42) * 0.22,
            y: fxY - dirY * Math.max(bodyY, hitD * 0.42) * 0.22,
            z: (parseFloat(actor.z) || 0) + Math.max(18, bodyZ * 0.30),
            dir: dirX >= 0 ? 1 : -1,
            w: Math.max(92, bodyX * (isBasicRushIssen ? 1.20 : (isClone ? 1.36 : 1.56)), hitW * (isBasicRushIssen ? 0.52 : 0.66)),
            h: Math.max(24, bodyY * 0.60, hitD * 0.24),
            life: 0.10,
            maxLife: 0.10,
            pathAngle: angle,
            cloneTrail: isClone,
            p3RushTrail: isP3RushBody
        });
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
            const localOffsetX = Math.max(bodyX * 0.28, Math.min(hitOffX * 0.34, bodyX * 0.70));
            const localOffsetZ = Math.max(bodyZ * 0.50, hitOffZ);
            gameState.effects.push({
                type: 'shoulderCharge',
                renderType: eff,
                // 신체 돌진 이펙트는 히트박스 중심이 아니라 카시야스 몸 앞쪽에 붙어서 따라가게 한다.
                x: m.x + dir * localOffsetX,
                y: m.y,
                z: m.z + localOffsetZ,
                followTarget: m,
                localOffsetX: localOffsetX,
                localOffsetY: 0,
                localOffsetZ: localOffsetZ,
                dir: dir,
                w: Math.max(hitW * 0.86, bodyX * 2.15),
                d: Math.max(hitD * 1.05, bodyY * 1.45),
                h: Math.max(hitH, bodyZ * 0.72),
                burstScale: 1.0,
                life: Math.max(0.24, duration),
                maxLife: Math.max(0.24, duration),
                color: 'rgba(255,88,58,0.88)',
                accentColor: 'rgba(22,0,0,0.88)'
            });
            return;
        }
    
        if (eff === 'EFT_KASIYAS_FIST_BUMPING') {
            // 주먹 휘두르기는 액션 시작 cue가 아니라 실제 히트 판정 타이밍에만 호형 이펙트를 출력한다.
            // cue 이펙트를 별도로 내보내면 판정 없는 위치에 한 번 더 생기는 것처럼 보일 수 있다.
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
            this.triggerScreenShake(gameState, 6.5, 0.22);
        }
    },


    triggerScreenShake: function(gameState, power = 4, duration = 0.14) {
        if (!gameState) return;
        const p = Math.max(0, parseFloat(power) || 0);
        const d = Math.max(0, parseFloat(duration) || 0);
        if (p <= 0 || d <= 0) return;
        const cur = gameState.screenShake || { timer: 0, maxTime: 0, power: 0 };
        gameState.screenShake = {
            timer: Math.max(parseFloat(cur.timer) || 0, d),
            maxTime: Math.max(parseFloat(cur.maxTime) || 0, d),
            power: Math.max(parseFloat(cur.power) || 0, p)
        };
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
        if (upperEff === 'EFT_KASIYAS_SWORD_QUICK_DRAW' || upperEff === 'EFT_KASIYAS_RUSH_ISSEN' || upperEff === 'EFT_RUSH_ISSEN' || upperEff === 'EFT_KASIYAS_RUSH_SLASH' || upperEff === 'EFT_KASIYAS_P2_ONI_SLASH') {
            // 돌진 계열은 경로 전체에 깔리는 일반 slash가 아니라 실제 이동 중인 몸/검을 덮는 부착형 이펙트로 표현한다.
            // Hitbox_Size/Offset은 pushKasiyasRushBodyEffect에서 X/Y 기준으로 반영한다.
            return;
        }
        if (upperEff === 'EFT_KASIYAS_P2_GROUND_PUNCH' || upperEff === 'EFT_KASIYAS_P2_GROUND_PUNCH_STRONG') {
            const strong = upperEff === 'EFT_KASIYAS_P2_GROUND_PUNCH_STRONG';
            gameState.effects.push({
                type: 'stompDust',
                renderType: upperEff,
                strong: strong,
                x: atkX,
                y: atkY,
                z: 8,
                w: Math.max(atkW * (strong ? 1.55 : 1.22), strong ? 820 : 520),
                d: Math.max(atkD * (strong ? 1.42 : 1.25), strong ? 280 : 185),
                h: Math.max(28, atkH * 0.18),
                life: strong ? 0.52 : 0.34,
                maxLife: strong ? 0.52 : 0.34,
                color: strong ? 'rgba(255,74,44,0.92)' : 'rgba(255,226,176,0.86)',
                accentColor: strong ? 'rgba(120,0,0,0.95)' : 'rgba(95,58,24,0.92)'
            });
            const hitStart = parseFloat(action && action.Hitbox_Start_Time);
            const hitEnd = parseFloat(action && action.Hitbox_End_Time);
            const hitDuration = (isFinite(hitStart) && isFinite(hitEnd) && hitEnd > hitStart) ? (hitEnd - hitStart) : (strong ? 0.42 : 0.28);
            // 지면 충격파는 판정이 살아 있는 동안 화면이 계속 울리는 느낌이 나도록
            // 기존의 짧은 1회 흔들림보다 지속 시간과 강도를 조금 더 높인다.
            this.triggerScreenShake(gameState, strong ? 12.0 : 7.0, strong ? Math.max(0.36, hitDuration + 0.12) : Math.max(0.24, hitDuration + 0.08));
            return;
        }

        if (upperEff === 'EFT_KASIYAS_P2_DOUBLE_EDGED_SWORD_JUMP_SLASH' || upperEff === 'EFT_KASIYAS_P2_M2_AIR_SPIN_SLASH' || upperEff === 'EFT_KASIYAS_P2_M2_FINAL_SLASH') {
            const isP2M2Air = upperEff === 'EFT_KASIYAS_P2_M2_AIR_SPIN_SLASH';
            const isP2M2Final = upperEff === 'EFT_KASIYAS_P2_M2_FINAL_SLASH';
            const isP2M2 = isP2M2Air || isP2M2Final;
            gameState.effects.push({
                type: 'kasiyasP2AirSpinSlash',
                renderType: upperEff,
                p2m2BodySpin: isP2M2Air,
                p2m2FinalSpin: isP2M2Final,
                x: atkX,
                y: atkY,
                z: atkZ + Math.max(18, atkH * (isP2M2Air ? 0.50 : 0.22)),
                dir: m.faceDir || 1,
                w: isP2M2Air ? Math.max(atkW * 1.55, 420 * effectScale) : Math.max(atkW * (isP2M2Final ? 1.18 : 1.06), isP2M2Final ? 1850 * effectScale : 760 * effectScale),
                d: isP2M2Air ? Math.max(atkD * 1.35, 250 * effectScale) : Math.max(atkD * (isP2M2Final ? 1.25 : 1.15), isP2M2Final ? 440 * effectScale : 260 * effectScale),
                h: isP2M2Air ? Math.max(atkH * 1.08, 320 * effectScale) : Math.max(atkH * (isP2M2Final ? 0.86 : 0.66), isP2M2Final ? 360 * effectScale : 280 * effectScale),
                life: isP2M2Air ? 0.46 : (isP2M2Final ? 0.72 : 0.50),
                maxLife: isP2M2Air ? 0.46 : (isP2M2Final ? 0.72 : 0.50),
                color: 'rgba(255,58,40,1.0)',
                accentColor: 'rgba(20,0,0,0.98)'
            });
            this.triggerScreenShake(gameState, isP2M2Final ? 12.0 : (isP2M2Air ? 7.5 : 8.5), isP2M2Final ? 0.38 : (isP2M2Air ? 0.22 : 0.28));
            return;
        }

        if (upperEff === 'EFT_KASIYAS_P3_AIM_SWORD_PLAYER' || upperEff === 'EFT_KASIYAS_P3_WALK_WITH_AURA') {
            // 이 둘은 보스 본체 렌더에서 지속형 자세/장판으로 표현한다. 다단히트마다 별도 이펙트를 생성하지 않는다.
            return;
        }

        if (upperEff === 'EFT_KASIYAS_P3_HIGH_SPEED_RUSH_SLASH') {
            gameState.effects.push({
                type: 'p3HighSpeedRushLeafSlash',
                renderType: upperEff,
                x: atkX,
                y: atkY,
                z: atkZ + Math.max(12, atkH * 0.46),
                dir: m.faceDir || 1,
                w: Math.max(900 * effectScale, atkW * 1.02),
                d: Math.max(170 * effectScale, atkD * 1.05),
                h: Math.max(90 * effectScale, atkH * 0.42),
                life: 0.42,
                maxLife: 0.42,
                color: 'rgba(156,78,255,0.98)',
                accentColor: 'rgba(10,0,28,0.98)',
                hotColor: 'rgba(230,214,255,0.86)'
            });
            this.triggerScreenShake(gameState, 9.0, 0.22);
            return;
        }

        if (upperEff === 'EFT_KASIYAS_P3_SWORD_WAVE_CAST_SLASH') {
            gameState.effects.push({
                type: 'kasiyasP3SwordWaveCastSlash',
                renderType: upperEff,
                x: atkX,
                y: atkY,
                z: atkZ + atkH * 0.58,
                dir: m.faceDir || 1,
                w: Math.max(420 * effectScale, atkW * 1.25),
                d: Math.max(220 * effectScale, atkD * 1.10),
                h: Math.max(420 * effectScale, atkH * 1.18),
                life: 0.52,
                maxLife: 0.52,
                color: 'rgba(152,76,255,0.98)',
                accentColor: 'rgba(20,0,0,0.98)',
                darkColor: 'rgba(0,0,0,0.98)'
            });
            this.triggerScreenShake(gameState, 8.5, 0.26);
            return;
        }

        if (upperEff === 'EFT_KASIYAS_P3_HORIZONTAL_SLASH' || upperEff === 'EFT_KASIYAS_P3_SLASH_UP' || upperEff === 'EFT_KASIYAS_P3_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_P3_AIR_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_P3_DIAGONAL_SLASH' || upperEff === 'EFT_KASIYAS_P3_AURA_CUT_OFF_SLASH') {
            const isAuraCut = upperEff === 'EFT_KASIYAS_P3_AURA_CUT_OFF_SLASH';
            const isAirDown = upperEff === 'EFT_KASIYAS_P3_AIR_SLASH_DOWN';
            const mode = isAirDown ? 'AIR_DOWN' : (upperEff.indexOf('HORIZONTAL') >= 0 ? 'HORIZONTAL' : (upperEff.indexOf('UP') >= 0 ? 'UP' : (upperEff.indexOf('DIAGONAL') >= 0 || isAuraCut ? 'DIAGONAL' : 'DOWN')));
            gameState.effects.push({
                type: 'kasiyasP3HeavySlash',
                renderType: upperEff,
                slashMode: isAuraCut ? 'AURA_DIAGONAL' : mode,
                x: atkX,
                y: atkY,
                z: atkZ + atkH * 0.50,
                dir: m.faceDir || 1,
                w: Math.max(120, atkW),
                d: Math.max(70, atkD),
                h: Math.max(90, atkH),
                life: (mode === 'DIAGONAL' || isAuraCut || isAirDown) ? 0.48 : 0.34,
                maxLife: (mode === 'DIAGONAL' || isAuraCut || isAirDown) ? 0.48 : 0.34,
                color: isAuraCut ? 'rgba(255,42,28,1.0)' : 'rgba(255,64,48,0.98)',
                accentColor: isAuraCut ? 'rgba(20,0,0,0.96)' : 'rgba(184,84,255,0.88)',
                darkColor: isAuraCut ? 'rgba(0,0,0,0.98)' : 'rgba(20,0,28,0.92)',
                auraCut: isAuraCut
            });
            this.triggerScreenShake(gameState, (mode === 'DIAGONAL' || isAuraCut || isAirDown) ? 10.0 : 6.0, (mode === 'DIAGONAL' || isAuraCut || isAirDown) ? 0.26 : 0.18);
            return;
        }

        if (upperEff === 'EFT_KASIYAS_P1_M2_FINAL_SLASH') {
            // 최종 참격의 실제 판정 Z 크기는 맵 전체 공격용으로 매우 크게 잡혀 있다.
            // 그 값을 그대로 이펙트 높이/출력 Z에 쓰면 참격이 하늘 쪽에서 발생해 보이므로,
            // 판정 크기와 별개로 화면에서 보이는 참격 전용 높이를 낮게 제한한다.
            const visualH = Math.max(300 * effectScale, Math.min(430 * effectScale, Math.max(atkD * 0.76, 330 * effectScale)));
            const visualZ = atkZ + Math.max(26 * effectScale, Math.min(98 * effectScale, visualH * 0.18));
            gameState.effects.push({
                type: 'kasiyasFinalSlash',
                renderType: upperEff,
                x: atkX,
                y: atkY,
                z: visualZ,
                dir: m.faceDir || 1,
                // 실제 히트박스 범위를 충분히 덮도록 시각 범위를 공격 범위보다 약간 크게 잡는다.
                // 렌더러에서는 이 값을 기준으로 화면을 가르는 대각선 참격선을 생성한다.
                w: Math.max(atkW * 1.50, 2100 * effectScale),
                d: Math.max(atkD * 1.75, 700 * effectScale),
                h: Math.max(visualH * 1.32, 500 * effectScale),
                life: 0.78,
                maxLife: 0.78,
                color: 'rgba(132,0,0,0.98)',
                accentColor: 'rgba(8,0,0,0.98)'
            });
            return;
        }

        if (upperEff === 'EFT_KASIYAS_P2_M1_LEFT_SWORD_SLASH_WITH_RED_ENERGY' || upperEff === 'EFT_KASIYAS_P2_M1_RIGHT_SWORD_SLASH_WITH_YELLOW_ENERGY') {
            const isYellow = upperEff.indexOf('YELLOW') >= 0;
            gameState.effects.push({
                type: 'kasiyasP2M1ArcSlash',
                renderType: effEnum,
                poseType: poseType,
                x: atkX,
                y: atkY,
                // 강화로 히트박스가 커져도 검격 중심이 위로 밀리지 않도록 중심 기준으로 출력한다.
                z: atkZ + atkH * 0.50,
                dir: m.faceDir,
                // 교차 검격은 공격 판정 안내 역할을 해야 하므로 히트박스 끝까지 거의 꽉 차게 맞춘다.
                w: Math.max(24, atkW * 0.98),
                d: Math.max(16, atkD * 0.98),
                h: Math.max(24, atkH * 0.98),
                life: 0.42,
                maxLife: 0.42,
                color: isYellow ? 'rgba(255,222,54,0.99)' : 'rgba(255,48,34,0.99)',
                accentColor: isYellow ? 'rgba(126,62,0,0.96)' : 'rgba(34,0,0,0.98)',
                effectScale: effectScale,
                flameColorType: isYellow ? 'YELLOW' : 'RED',
                curveSign: isYellow ? -1 : 1
            });
            return;
        }

        if (upperEff === 'EFT_KASIYAS_P2_M1_X_SLASH') {
            const boss = m && m.boss ? m.boss : null;
            const enhanceCount = Math.max(0, parseInt(boss && boss.p2MajorPattern1Runtime && boss.p2MajorPattern1Runtime.enhanceCount) || 0);
            gameState.effects = (gameState.effects || []).filter(e => !(e && e.type === 'kasiyasP2M1SwordEnergyAura'));
            gameState.effects.push({
                type: 'kasiyasP2M1FinalXSlash',
                renderType: upperEff,
                x: atkX,
                y: atkY,
                // 히트박스 확대 보정과 함께 X 교차점이 중앙에 남도록 중심 기준으로 출력한다.
                z: atkZ + atkH * 0.50,
                dir: m.faceDir || 1,
                // 최종 X자 베기도 히트박스 대각선 끝과 끝을 거의 채우는 느낌으로 맞춘다.
                w: Math.max(32, atkW * 0.98),
                d: Math.max(20, atkD * 0.98),
                h: Math.max(32, atkH * 0.98),
                life: enhanceCount >= 5 ? 0.64 : 0.52,
                maxLife: enhanceCount >= 5 ? 0.64 : 0.52,
                color: 'rgba(255,52,36,1.0)',
                accentColor: 'rgba(255,220,52,0.98)',
                enhanced: enhanceCount >= 5,
                enhanceCount: enhanceCount,
                effectScale: effectScale
            });
            this.triggerScreenShake(gameState, enhanceCount >= 5 ? 14 : 9, enhanceCount >= 5 ? 0.38 : 0.26);
            return;
        }

        if (upperEff === 'EFT_KASIYAS_P2_DOUBLE_SWORD_CROSS_SLASH' || upperEff === 'EFT_KASIYAS_P2_DOUBLE_SWORD_UP_DOWN_SLASH') {
            // 양손 검격은 ATK_Hit_Count가 2여도 시각 이펙트는 한 번만 출력한다.
            // 한 번의 X자/상하 분리 이펙트가 내부적으로 2회 판정을 가진다는 느낌을 유지하기 위함.
            const boss = m && m.boss ? m.boss : null;
            if (boss) {
                const effectKey = [
                    String(action && action.Action_ID || '').trim(),
                    String(boss.activePattern && boss.activePattern.Pattern_ID || '').trim(),
                    String(boss.currentActionIndex || 0),
                    String(boss.currentLoopIndex || 0),
                    upperEff
                ].join(':');
                if (boss.lastP2DoubleSlashVisualEffectKey === effectKey) return;
                boss.lastP2DoubleSlashVisualEffectKey = effectKey;
            }
            gameState.effects.push({
                type: 'kasiyasP2DoubleSlash',
                renderType: upperEff,
                slashMode: upperEff === 'EFT_KASIYAS_P2_DOUBLE_SWORD_UP_DOWN_SLASH' ? 'UP_DOWN' : 'CROSS',
                x: atkX,
                y: atkY,
                z: atkZ + atkH * 0.56,
                dir: m.faceDir || 1,
                // 공통 X자/상하 검격도 공격 판정이 바로 읽히도록 히트박스를 거의 채우게 맞춘다.
                w: Math.max(24, atkW * 0.98),
                d: Math.max(16, atkD * 0.98),
                h: Math.max(24, atkH * 0.98),
                life: 0.34,
                maxLife: 0.34,
                color: 'rgba(255,62,48,0.96)',
                accentColor: 'rgba(16,0,0,0.94)'
            });
            return;
        }

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
            // 어깨치기는 액션 시작 cue에서 돌진 잔상/압력선을 이미 출력한다.
            // 몸통 충돌 다단히트마다 같은 이펙트가 반복되면 조잡해 보이므로 실제 히트 타이밍 이펙트는 생략한다.
            return;
        }
    
        if (upperEff === 'EFT_KASIYAS_FIST_BUMPING' || upperEff === 'EFT_KASIYAS_STOMP') {
            const isFist = upperEff === 'EFT_KASIYAS_FIST_BUMPING';
            gameState.effects.push({
                type: upperEff === 'EFT_KASIYAS_STOMP' ? 'stompDust' : 'hitSpark',
                renderType: upperEff,
                // 주먹 공격은 히트박스 중심을 기준으로, 히트박스 X 범위를 채우는 전방 내지르기 이펙트로 출력한다.
                x: atkX,
                y: atkY,
                z: atkZ + atkH * (upperEff === 'EFT_KASIYAS_STOMP' ? 0.18 : 0.56),
                dir: m.faceDir,
                w: upperEff === 'EFT_KASIYAS_STOMP' ? Math.max(atkW * 0.52, 85 * effectScale) : Math.max(atkW * 1.00, 170 * effectScale),
                d: upperEff === 'EFT_KASIYAS_STOMP' ? Math.max((atkD || atkH) * 0.48, 55 * effectScale) : Math.max((atkD || atkH) * 1.00, 78 * effectScale),
                h: upperEff === 'EFT_KASIYAS_STOMP' ? Math.max(18, atkH * 0.20) : atkH,
                life: upperEff === 'EFT_KASIYAS_STOMP' ? 0.18 : 0.24,
                maxLife: upperEff === 'EFT_KASIYAS_STOMP' ? 0.18 : 0.24,
                burstScale: upperEff === 'EFT_KASIYAS_FIST_BUMPING' ? 1.0 : 0.85,
                color: upperEff === 'EFT_KASIYAS_STOMP' ? 'rgba(230,214,188,0.58)' : 'rgba(255,76,60,0.88)',
                accentColor: upperEff === 'EFT_KASIYAS_STOMP' ? 'rgba(56,42,30,0.64)' : 'rgba(28,0,0,0.86)'
            });
            return;
        }
    
        if (upperEff === 'EFT_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_CHARGE_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_SLASH_01' || upperEff === 'EFT_KASIYAS_SLASH_04' || upperEff === 'EFT_KASIYAS_P2_LEFT_SWORD_SLASH_DOWN' || upperEff === 'EFT_KASIYAS_P2_LEFT_SWORD_DIAGONAL_SLASH') {
            slashColor = 'rgba(255, 48, 44, 0.98)';
            accentColor = 'rgba(26, 0, 0, 0.92)';
            life = upperEff.indexOf('P2') >= 0 ? 0.30 : 0.28;
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
    
        const isHorizontalSlashEffect = upperEff === 'EFT_KASIYAS_HORIZONTAL_SLASH' || upperEff === 'EFT_HORIZONTAL_SLASH' || upperEff === 'EFT_KASIYAS_P2_RIGHT_SWORD_HORIZONTAL_SLASH';
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

    pushKasiyasP2MajorPattern1SwordEnergyAura: function(m, action, gameState, life = 10.5) {
        if (!m || !gameState) return;
        const boss = m && m.boss ? m.boss : null;
        const rt = boss && boss.p2MajorPattern1Runtime ? boss.p2MajorPattern1Runtime : null;
        // 같은 패턴 안에서 follow aura가 중복 생성되면 검 기운이 지나치게 밝아지므로 하나만 유지한다.
        gameState.effects = (gameState.effects || []).filter(e => !(e && e.type === 'kasiyasP2M1SwordEnergyAura'));
        const bodyX = ((m.d && parseFloat(m.d.bodyX)) || 90) * (parseFloat(m.scale) || 1);
        const bodyZ = ((m.d && parseFloat(m.d.bodyZ)) || 170) * (parseFloat(m.scale) || 1);
        const duration = Math.max(2.0, parseFloat(life) || 10.5);
        gameState.effects.push({
            type: 'kasiyasP2M1SwordEnergyAura',
            renderType: 'EFT_KASIYAS_P2_DOUBLE_SWORD_ANOTHER_ENERGY_GRANTED',
            followTarget: m,
            x: m.x,
            y: m.y,
            z: (parseFloat(m.z) || 0) + bodyZ * 0.54,
            localOffsetX: 0,
            localOffsetY: 0,
            localOffsetZ: bodyZ * 0.50,
            dir: m.faceDir || 1,
            w: Math.max(270, bodyX * 2.65),
            h: Math.max(240, bodyZ * 1.36),
            // maxLife를 짧게 잡아 패턴 진행 중에는 선명하게 유지하고 마지막에만 천천히 사라지게 한다.
            life: duration,
            maxLife: Math.min(duration, 1.25)
        });
        if (rt) rt.swordEnergyAuraActive = true;
    },

    pushBossCastEffect: function(m, action, gameState) {
        const eff = String(action && (action.VFX_Type || action.Effect_Render_Type) || '').trim().toUpperCase();
        if (!eff) return;

        if (eff === 'EFT_KASIYAS_P3_SLASH_UP' || eff === 'EFT_KASIYAS_P3_HORIZONTAL_SLASH' || eff === 'EFT_KASIYAS_P3_SLASH_DOWN' || eff === 'EFT_KASIYAS_P3_AIR_SLASH_DOWN') {
            const duration = Math.max(0.35, parseFloat(action.Action_Anim_Duration) || 0.9);
            const bodyX = ((m.d && parseFloat(m.d.bodyX)) || 90) * (parseFloat(m.scale) || 1);
            const bodyZ = ((m.d && parseFloat(m.d.bodyZ)) || 170) * (parseFloat(m.scale) || 1);
            const mode = eff === 'EFT_KASIYAS_P3_AIR_SLASH_DOWN' ? 'AIR_DOWN' : (eff.indexOf('HORIZONTAL') >= 0 ? 'HORIZONTAL' : (eff.indexOf('UP') >= 0 ? 'UP' : 'DOWN'));
            gameState.effects.push({
                type: 'kasiyasP3HeavySlash',
                renderType: eff,
                slashMode: mode,
                x: m.x + (m.faceDir || 1) * bodyX * 0.28,
                y: m.y,
                z: (parseFloat(m.z) || 0) + bodyZ * 0.56,
                dir: m.faceDir || 1,
                w: Math.max(220, bodyX * 2.7),
                d: Math.max(120, bodyX * 1.1),
                h: Math.max(260, bodyZ * 1.35),
                life: Math.min(0.48, duration),
                maxLife: Math.min(0.48, duration),
                color: 'rgba(152,76,255,0.98)',
                accentColor: 'rgba(20,0,42,0.94)',
                darkColor: 'rgba(0,0,0,0.98)'
            });
            if (eff === 'EFT_KASIYAS_P3_AIR_SLASH_DOWN') this.triggerScreenShake(gameState, 7.5, 0.22);
            return;
        }

        if (eff === 'EFT_KASIYAS_P3_CAST_DIMENSION_CRACK_SLASH') {
            const duration = Math.max(0.35, parseFloat(action.Action_Anim_Duration) || 0.9);
            const bodyX = ((m.d && parseFloat(m.d.bodyX)) || 90) * (parseFloat(m.scale) || 1);
            const bodyZ = ((m.d && parseFloat(m.d.bodyZ)) || 170) * (parseFloat(m.scale) || 1);
            gameState.effects.push({
                type: 'kasiyasP3DimensionCrackCastSlash',
                renderType: eff,
                x: m.x + (m.faceDir || 1) * bodyX * 0.30,
                y: m.y,
                z: (parseFloat(m.z) || 0) + bodyZ * 0.58,
                dir: m.faceDir || 1,
                w: Math.max(300, bodyX * 3.3),
                d: Math.max(140, bodyX * 1.35),
                h: Math.max(330, bodyZ * 1.65),
                life: duration,
                maxLife: duration,
                color: 'rgba(150,74,255,0.94)',
                accentColor: 'rgba(8,0,28,0.96)',
                hotColor: 'rgba(226,214,255,0.76)'
            });
            this.triggerScreenShake(gameState, 5.5, Math.min(0.25, duration));
            return;
        }

        if (eff === 'EFT_KASIYAS_P3_RUSH_SLASH_CHARGE') {
            const duration = Math.max(0.6, parseFloat(action.Action_Anim_Duration) || 1.0);
            const bodyX = ((m.d && parseFloat(m.d.bodyX)) || 90) * (parseFloat(m.scale) || 1);
            const bodyZ = ((m.d && parseFloat(m.d.bodyZ)) || 170) * (parseFloat(m.scale) || 1);
            gameState.effects.push({
                type: 'kasiyasP3RushSlashCharge',
                renderType: eff,
                x: m.x,
                y: m.y,
                z: (parseFloat(m.z) || 0) + bodyZ * 0.52,
                dir: m.faceDir || 1,
                w: Math.max(260, bodyX * 2.8),
                h: Math.max(260, bodyZ * 1.45),
                life: duration,
                maxLife: duration,
                color: 'rgba(150,70,255,0.88)',
                accentColor: 'rgba(8,0,28,0.96)'
            });
            return;
        }

        if (eff === 'EFT_KASIYAS_P2_DOUBLE_SWORD_ANOTHER_ENERGY' || eff === 'EFT_KASIYAS_P2_M1_X_SLASH_CHARGE') {
            const duration = Math.max(0.5, parseFloat(action.Action_Anim_Duration) || 1.0);
            const bodyX = ((m.d && parseFloat(m.d.bodyX)) || 90) * (parseFloat(m.scale) || 1);
            const bodyZ = ((m.d && parseFloat(m.d.bodyZ)) || 170) * (parseFloat(m.scale) || 1);
            gameState.effects.push({
                type: 'kasiyasP2ChargeEnergy',
                renderType: eff,
                x: m.x,
                y: m.y,
                z: (parseFloat(m.z) || 0) + bodyZ * 0.55,
                dir: m.faceDir || 1,
                w: eff === 'EFT_KASIYAS_P2_M1_X_SLASH_CHARGE' ? Math.max(270, bodyX * 2.9) : Math.max(240, bodyX * 2.35),
                h: eff === 'EFT_KASIYAS_P2_M1_X_SLASH_CHARGE' ? Math.max(310, bodyZ * 1.60) : Math.max(250, bodyZ * 1.32),
                life: duration,
                maxLife: duration,
                color: eff === 'EFT_KASIYAS_P2_M1_X_SLASH_CHARGE' ? 'rgba(255,62,42,0.90)' : 'rgba(255,85,44,0.80)',
                accentColor: eff === 'EFT_KASIYAS_P2_M1_X_SLASH_CHARGE' ? 'rgba(20,0,0,0.94)' : 'rgba(255,210,60,0.62)'
            });
            // 2페이즈 대형 패턴 1의 검 기운 오라는 이 액션 시작 시점이 아니라
            // 기운 부여 모션이 끝난 뒤 별도 종료 훅에서 활성화한다.
            return;
        }

        if (eff === 'EFT_KASIYAS_P2_M2_WAIT_IN_DIMENSION_PORTAL') {
            const duration = Math.max(0.35, parseFloat(action.Action_Anim_Duration) || 1.2);
            const group = String(action.Random_Action_Group || '').trim().toUpperCase();
            const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
            const direction = group.indexOf('LEFT') >= 0 || moveDir.indexOf('LEFT') >= 0 ? 'LEFT' : 'RIGHT';
            const bodyX = ((m.d && parseFloat(m.d.bodyX)) || 90) * (parseFloat(m.scale) || 1);
            const bodyZ = ((m.d && parseFloat(m.d.bodyZ)) || 170) * (parseFloat(m.scale) || 1);
            gameState.effects.push({
                type: 'dimensionPortalOpen',
                renderType: eff,
                p2m2FinalPortal: true,
                showKasiyasSilhouette: true,
                portalDirection: direction,
                x: m.x,
                y: m.y,
                z: Math.max(180, parseFloat(m.z) || 240),
                w: Math.max(360, bodyX * 5.0),
                h: Math.max(220, bodyZ * 1.35),
                life: duration,
                maxLife: duration,
                dir: direction === 'LEFT' ? -1 : 1
            });
            return;
        }

        if (eff === 'EFT_KASIYAS_P2_SUMMON_DIMENSION_PORTAL') {
            const duration = Math.max(0.35, parseFloat(action.Action_Anim_Duration) || 0.75);
            const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
            gameState.effects.push({
                type: 'dimensionPortalOpen',
                renderType: eff,
                x: worldW / 2,
                y: Math.max(22, Math.min(46, (parseFloat(gameState && gameState.WORLD_DEPTH) || 400) * 0.08)),
                z: 250,
                w: 540,
                h: 180,
                life: duration,
                maxLife: duration
            });
            return;
        }

        if (eff === 'EFT_KASIYAS_P2_ONI_STANCE_ENERGY_CHARGE' || eff === 'EFT_KASIYAS_P2_ONI_STANCE_FULL_ENERGY') {
            const bodyX = ((m.d && m.d.bodyX) || 80) * (m.scale || 1);
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            const duration = Math.max(0.35, parseFloat(action.Action_Anim_Duration) || 0.7);
            const full = eff === 'EFT_KASIYAS_P2_ONI_STANCE_FULL_ENERGY';
            gameState.effects.push({
                type: 'kasiyasP2ChargeEnergy',
                renderType: eff,
                x: m.x, y: m.y, z: m.z + bodyZ * 0.48,
                dir: m.faceDir || 1,
                w: Math.max(210, bodyX * (full ? 2.75 : 2.35)),
                h: Math.max(210, bodyZ * (full ? 1.35 : 1.12)),
                life: duration,
                maxLife: duration,
                color: full ? 'rgba(255,28,66,0.86)' : 'rgba(198,30,84,0.72)',
                accentColor: full ? 'rgba(255,192,116,0.80)' : 'rgba(118,52,210,0.64)',
                oniCharge: true,
                fullEnergy: full
            });
            return;
        }

        if (eff === 'EFT_KASIYAS_P2_PUT_SWORD') {
            const bodyX = ((m.d && m.d.bodyX) || 80) * (m.scale || 1);
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            const duration = Math.max(0.55, parseFloat(action.Action_Anim_Duration) || 1.0);
            const dir = m.faceDir || 1;
            gameState.effects.push({
                type: 'kasiyasP2PutSword', renderType: eff,
                x: m.x + dir * bodyX * 0.35, y: m.y, z: m.z + bodyZ * 0.34,
                dir: dir, w: Math.max(160, bodyX * 2.0), h: Math.max(160, bodyZ * 0.92),
                life: Math.min(duration, 0.65), maxLife: Math.min(duration, 0.65),
                color: 'rgba(230,245,255,0.82)', accentColor: 'rgba(255,86,54,0.70)'
            });
            const sideOffset = Math.max(82, bodyX * 0.78);
            gameState.effects.push({
                type: 'kasiyasP2GroundSwords', renderType: eff,
                // 카시야스 몸을 가리지 않도록 중심이 아니라 양 옆에 한 자루씩 배치한다.
                x: m.x, y: m.y, z: 8, dir: dir,
                swords: [
                    { dx: -sideOffset, dy: -18, angle: -0.08 },
                    { dx: sideOffset, dy: 18, angle: 0.08 }
                ],
                w: Math.max(116, bodyX * 1.08), h: Math.max(118, bodyZ * 0.58),
                life: 8.0, maxLife: 8.0,
                color: 'rgba(226,242,255,0.94)', accentColor: 'rgba(84,28,16,0.88)'
            });
            return;
        }

        if (eff === 'EFT_KASIYAS_P2_GROUND_PUNCH_CHARGE') {
            const bodyX = ((m.d && m.d.bodyX) || 80) * (m.scale || 1);
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            const duration = Math.max(0.45, parseFloat(action.Action_Anim_Duration) || 1.0);
            gameState.effects.push({
                type: 'kasiyasP2GroundPunchCharge', renderType: eff,
                x: m.x, y: m.y, z: m.z + bodyZ * 0.58,
                dir: m.faceDir || 1,
                w: Math.max(180, bodyX * 2.35), h: Math.max(190, bodyZ * 1.08),
                life: duration, maxLife: duration,
                color: 'rgba(255,72,48,0.76)', accentColor: 'rgba(20,0,0,0.88)'
            });
            return;
        }
    
        if (eff === 'EFT_KASIYAS_P2_DOUBLE_EDGED_SWORD_STANCE') {
            if (Array.isArray(gameState.effects)) {
                gameState.effects = gameState.effects.filter(e => e && e.type !== 'kasiyasP2GroundSwords' && e.type !== 'kasiyasP2PutSword');
            }
            const bodyX = ((m.d && m.d.bodyX) || 80) * (m.scale || 1);
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            gameState.effects.push({
                type: 'hitSpark', renderType: eff,
                x: m.x + (m.faceDir || 1) * bodyX * 0.30,
                y: m.y,
                z: m.z + bodyZ * 0.45,
                dir: m.faceDir || 1,
                w: Math.max(160, bodyX * 2.0), h: Math.max(150, bodyZ * 0.85),
                life: 0.26, maxLife: 0.26,
                color: 'rgba(255,70,48,0.82)', accentColor: 'rgba(255,220,140,0.70)'
            });
            return;
        }

        if (eff === 'EFT_KASIYAS_P2_SWORD_STORM_SPAWN') {
            const bodyX = ((m.d && m.d.bodyX) || 80) * (m.scale || 1);
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            const duration = Math.max(0.35, parseFloat(action.Action_Anim_Duration) || 0.75);
            const conditionType = String(action.Action_Condition_Type || '').trim().toUpperCase();
            const spawnObjectId = String(action.Spawn_Object_ID || action.Object_ID || '').trim();
            const apostleCast = conditionType === 'LATE_PHASE' || spawnObjectId === '252002';
            gameState.effects.push({
                type: 'kasiyasP2SwordStormCast',
                renderType: eff,
                apostle: apostleCast,
                x: m.x + (m.faceDir || 1) * bodyX * 0.72,
                y: m.y,
                z: m.z + bodyZ * 0.44,
                dir: m.faceDir || 1,
                w: Math.max(230, bodyX * 3.10),
                h: Math.max(220, bodyZ * 1.32),
                life: duration,
                maxLife: duration,
                color: apostleCast ? 'rgba(255,58,42,0.88)' : 'rgba(210,246,255,0.82)',
                accentColor: apostleCast ? 'rgba(18,0,0,0.94)' : 'rgba(8,24,36,0.86)'
            });
            return;
        }

        if (eff === 'EFT_KASIYAS_P2_CHARGE_ENERGY') {
            const bodyX = ((m.d && m.d.bodyX) || 80) * (m.scale || 1);
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            const duration = Math.max(0.35, parseFloat(action.Action_Anim_Duration) || 0.5);
            gameState.effects.push({
                type: 'kasiyasP2ChargeEnergy',
                renderType: eff,
                x: m.x,
                y: m.y,
                z: m.z + bodyZ * 0.48,
                dir: m.faceDir || 1,
                w: Math.max(140, bodyX * 2.35),
                h: Math.max(160, bodyZ * 1.05),
                life: duration,
                maxLife: duration,
                color: 'rgba(255,54,38,0.90)',
                accentColor: 'rgba(18,0,0,0.94)'
            });
            return;
        }

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
        if (renderType.indexOf('EFT_P2_M2_SWORD_WALL') >= 0) {
            // 검벽은 오브젝트 본체 렌더링이 곧 공격 이펙트이므로, 매 히트 체크마다 별도 slash를 만들지 않는다.
            return;
        }
        if (renderType === 'EFT_KASIYAS_SWORD_QUICK_DRAW') {
            // 대형 패턴 3번 분신 돌진 발도는 실제 이동 중인 몸/검에 붙는 kasiyasRushBodySlash로만 표현한다.
            // 여기서 일반 slash 이펙트를 추가하면 확장 히트박스 크기만큼 기존 반달형 검호가 크게 출력된다.
            return;
        }
    
        if (renderType === 'EFT_SWORD_STORM_MOVE' || renderType === 'EFT_SWORD_STORM_WITH_APOSTLE_ENERGY') {
            const apostle = String(obj && obj.renderType || obj && obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase().indexOf('APOSTLE') >= 0
                || renderType === 'EFT_SWORD_STORM_WITH_APOSTLE_ENERGY';
            gameState.effects.push({
                type: 'swordStormPulse',
                renderType: renderType,
                apostle: apostle,
                x: hitbox.x,
                y: hitbox.y,
                z: hitbox.z + Math.max(90, hitbox.h * 0.22),
                dir: obj.faceDir || 1,
                w: Math.max(340, Math.min(900, hitbox.w * 0.92)),
                d: Math.max(120, Math.min(360, hitbox.d * 0.96)),
                h: Math.max(320, Math.min(620, hitbox.h * 0.36)),
                life: 0.16,
                maxLife: 0.16,
                sourceObject: obj,
                sourceObjectId: String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim(),
                sourceActionId: String(action.Object_Action_ID || '').trim(),
                cancelOnGuard: false
            });
            return;
        }

        if (renderType === 'EFT_SWORD_STORM_BURST' || renderType === 'EFT_SWORD_STORM_BURST_WITH_APOSTLE_ENERGY') {
            const apostle = renderType === 'EFT_SWORD_STORM_BURST_WITH_APOSTLE_ENERGY'
                || String(obj && obj.renderType || obj && obj.data && obj.data.Object_Render_Type || '').trim().toUpperCase().indexOf('APOSTLE') >= 0;
            gameState.effects.push({
                type: 'swordStormBurst',
                renderType: renderType,
                apostle: apostle,
                x: hitbox.x,
                y: hitbox.y,
                z: hitbox.z + Math.max(92, hitbox.h * 0.20),
                dir: obj.faceDir || 1,
                w: Math.max(400, Math.min(980, hitbox.w * 0.98)),
                d: Math.max(145, Math.min(400, hitbox.d * 1.05)),
                h: Math.max(360, Math.min(680, hitbox.h * 0.40)),
                life: 0.42,
                maxLife: 0.42,
                sourceObject: obj,
                sourceObjectId: String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim(),
                sourceActionId: String(action.Object_Action_ID || '').trim(),
                cancelOnGuard: true
            });
            return;
        }

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
                sourceObject: obj,
                sourceObjectId: String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim(),
                sourceActionId: String(action.Object_Action_ID || '').trim(),
                cancelOnGuard: true,
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
                sourceObject: obj,
                sourceObjectId: String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim(),
                sourceActionId: String(action.Object_Action_ID || '').trim(),
                cancelOnGuard: true,
                color: 'rgba(255,72,58,0.78)',
                accentColor: 'rgba(18,0,0,0.82)'
            });
            return;
        }

        if (renderType === 'EFT_SHOCKWAVE') {
            gameState.effects.push({
                type: 'shockwave',
                renderType: renderType,
                x: hitbox.x,
                y: hitbox.y,
                z: hitbox.z + Math.max(4, hitbox.h * 0.22),
                w: Math.max(1, hitbox.w),
                d: Math.max(1, hitbox.d),
                h: Math.max(1, hitbox.h),
                life: 0.32,
                maxLife: 0.32,
                sourceObject: obj,
                sourceObjectId: String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim(),
                sourceActionId: String(action.Object_Action_ID || '').trim(),
                cancelOnGuard: true,
                color: 'rgba(245,248,255,0.92)',
                accentColor: 'rgba(40,52,68,0.82)'
            });
            // 잔상 내려찍기처럼 오브젝트 액션에서 발생하는 충격파도
            // 지면이 울리는 느낌이 나도록 화면 흔들림을 공통 적용한다.
            this.triggerScreenShake(gameState, 8.5, 0.34);
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
                sourceObject: obj,
                sourceObjectId: String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim(),
                sourceActionId: String(action.Object_Action_ID || '').trim(),
                cancelOnGuard: true,
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
            sourceObject: obj,
            sourceObjectId: String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim(),
            sourceActionId: String(action.Object_Action_ID || '').trim(),
            cancelOnGuard: true,
            color: 'rgba(255, 56, 50, 0.98)',
            accentColor: 'rgba(28, 0, 0, 0.90)'
        });
    },
};

if (typeof window !== 'undefined') {
    window.BossVFXSystem = BossVFXSystem;
}
