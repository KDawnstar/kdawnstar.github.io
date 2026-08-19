// [카시야스 보스전] 전체 렌더링 순서/카메라/공통 렌더 관리 (render_manager.js)
const GameRenderer = {
    canvas: null,
    ctx: null,
    bgClouds: [],
    bgMountains: [],
    bgTreesFar: [],
    bgTreesNear: [],
    bgCrystals: [],
    GROUND_BASE_Y: 400,
    currentTheme: 'DEFAULT',

    resizeCanvas: function() {
    if (!this.canvas) return;

    const gameSection = document.getElementById('gameSection');
    if (!gameSection) return;

    const gameViewport = document.getElementById('gameViewport');
    const hudSection = document.getElementById('hudSection');

    const baseWidth = parseFloat(this.canvas.getAttribute('width')) || this.canvas.width || 1600;
    const baseHeight = parseFloat(this.canvas.getAttribute('height')) || this.canvas.height || 900;

    const hudBaseHeight = hudSection
        ? (parseFloat(hudSection.getAttribute('data-base-height')) || 160)
        : 0;

    const totalBaseHeight = baseHeight + hudBaseHeight;

    const viewportWidth = Math.max(320, window.innerWidth - 24);
    const viewportHeight = Math.max(240, window.innerHeight - 24);

    const scale = Math.min(
        viewportWidth / baseWidth,
        viewportHeight / totalBaseHeight
    );

    const appliedScale = Math.max(0.2, Math.min(scale, 1));
    const displayWidth = Math.floor(baseWidth * appliedScale);
    const displayGameHeight = Math.floor(baseHeight * appliedScale);
    const displayHudHeight = Math.floor(hudBaseHeight * appliedScale);
    const displayTotalHeight = displayGameHeight + displayHudHeight;

    gameSection.style.width = displayWidth + 'px';
    gameSection.style.height = displayTotalHeight + 'px';
    gameSection.style.marginTop = '12px';

    if (gameViewport) {
        gameViewport.style.width = displayWidth + 'px';
        gameViewport.style.height = displayGameHeight + 'px';
    }

    if (hudSection) {
        hudSection.style.width = displayWidth + 'px';
        hudSection.style.height = displayHudHeight + 'px';
    }

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    },

    init: function(canvasElement, worldWidth) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');

        this.resizeCanvas();

        if (!this._boundResizeHandler) {
            this._boundResizeHandler = this.resizeCanvas.bind(this);
            window.addEventListener('resize', this._boundResizeHandler);
        }

        this.rebuildStageBackground(null, worldWidth || 2000, 300);
    },

    // 대형 패턴에서 처음 사용되는 정적 Canvas 캐시는 전투 시작 전에 유휴 시간에 분산 생성한다.
    schedulePerformanceCacheWarmup: function(gameState) {
        if (this._performanceCacheWarmupScheduled || !this.canvas) return;
        this._performanceCacheWarmupScheduled = true;
        const renderer = this;
        const tasks = [
            function() { if (typeof renderer.prewarmKasiyasCloneFilter === 'function') renderer.prewarmKasiyasCloneFilter(); },
            function() { if (typeof renderer.prewarmKasiyasCloneDefaultPoseCache === 'function') renderer.prewarmKasiyasCloneDefaultPoseCache(); },
            function() { if (typeof renderer.prewarmNoiseTeleportCache === 'function') renderer.prewarmNoiseTeleportCache(); },
            function() { if (typeof BossObjectSystem !== 'undefined' && typeof BossObjectSystem.prewarmKasiyasP1CloneGroupData === 'function') BossObjectSystem.prewarmKasiyasP1CloneGroupData(gameState); },
            function() { if (typeof renderer.prewarmObjectDefenseCaches === 'function') renderer.prewarmObjectDefenseCaches(renderer.canvas, 'INTRO'); },
            function() { if (typeof renderer.prewarmObjectDefenseCaches === 'function') renderer.prewarmObjectDefenseCaches(renderer.canvas, 'ACTIVE'); },
            function() { if (typeof renderer.prewarmKasiyasP3M2GiantSwordCache === 'function') renderer.prewarmKasiyasP3M2GiantSwordCache(gameState); },
            function() { if (typeof renderer.prewarmP3M3Caches === 'function') renderer.prewarmP3M3Caches(renderer.canvas); }
        ];
        let index = 0;
        const scheduleNext = function() {
            if (index >= tasks.length) {
                renderer._performanceCacheWarmupComplete = true;
                return;
            }
            const run = function() {
                try { tasks[index](); } catch (err) {
                    if (typeof console !== 'undefined' && console.warn) console.warn('[Kasiyas] cache prewarm skipped:', err);
                }
                index += 1;
                scheduleNext();
            };
            if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
                window.requestIdleCallback(run, { timeout: 350 });
            } else if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
                window.setTimeout(run, 24);
            } else {
                run();
            }
        };
        if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') window.setTimeout(scheduleNext, 120);
        else scheduleNext();
    },
    
    // 색상/팔레트 해석은 render_palette_system.js로 분리
    clampColorChannel: function() {
        return RenderPaletteSystem.clampColorChannel.apply(RenderPaletteSystem, arguments);
    },

    rgbToHex: function() {
        return RenderPaletteSystem.rgbToHex.apply(RenderPaletteSystem, arguments);
    },

    resolveRgbPalette: function() {
        return RenderPaletteSystem.resolveRgbPalette.apply(RenderPaletteSystem, arguments);
    },

    resolvePlayerPalette: function() {
        return RenderPaletteSystem.resolvePlayerPalette.apply(RenderPaletteSystem, arguments);
    },

    resolveWeaponPaletteByType: function() {
        return RenderPaletteSystem.resolveWeaponPaletteByType.apply(RenderPaletteSystem, arguments);
    },

    resolveWeaponPalette: function() {
        return RenderPaletteSystem.resolveWeaponPalette.apply(RenderPaletteSystem, arguments);
    },

    resolveWeaponColor: function() {
        return RenderPaletteSystem.resolveWeaponColor.apply(RenderPaletteSystem, arguments);
    },

    resolveMonsterPalette: function() {
        return RenderPaletteSystem.resolveMonsterPalette.apply(RenderPaletteSystem, arguments);
    },

    resolveMonsterBodyColor: function() {
        return RenderPaletteSystem.resolveMonsterBodyColor.apply(RenderPaletteSystem, arguments);
    },

    // 공통 모델 실루엣 렌더링은 model_body_renderer.js로 분리
    drawModelBody: function() {
        return ModelBodyRenderer.drawModelBody.apply(ModelBodyRenderer, arguments);
    },

    getBossObjectRenderMeta: function(obj) {
        if (!obj) return { objectType: '', renderType: '', traceKey: '', objectId: '' };
        const data = obj.data || {};
        const typeSource = data.Object_Type || obj.objectType || '';
        const renderSource = obj.renderType || data.Object_Render_Type || '';
        const traceSource = obj.traceKey || data.Trace_Path_Key || '';
        const idSource = data.Object_ID || obj.objectId || '';
        const cache = obj._renderMetaCache;
        if (cache && cache.typeSource === typeSource && cache.renderSource === renderSource && cache.traceSource === traceSource && cache.idSource === idSource) {
            return cache;
        }
        const next = {
            typeSource, renderSource, traceSource, idSource,
            objectType: String(typeSource).trim().toUpperCase(),
            renderType: String(renderSource).trim().toUpperCase(),
            traceKey: String(traceSource).trim().toUpperCase(),
            objectId: String(idSource).trim()
        };
        obj._renderMetaCache = next;
        return next;
    },

    // 1차 성능 최적화: 깊이 정렬용 렌더 엔트리를 매 프레임 새 객체/클로저로 만들지 않고 재사용한다.
    appendRenderEntry: function(renderables, y, kind, entity) {
        const pool = this._renderEntryPool || (this._renderEntryPool = []);
        const index = this._renderEntryUseCount || 0;
        let entry = pool[index];
        if (!entry) {
            entry = { y: 0, kind: 0, entity: null };
            pool[index] = entry;
        }
        const parsedY = parseFloat(y);
        entry.y = Number.isFinite(parsedY) ? parsedY : 0;
        entry.kind = kind;
        entry.entity = entity;
        renderables.push(entry);
        this._renderEntryUseCount = index + 1;
        return entry;
    },

    drawRenderEntry: function(entry, ctx, player) {
        if (!entry || !entry.entity) return;
        const entity = entry.entity;
        if (entry.kind === 1) {
            const a = entity;
            const owner = a && a.owner;
            if (!owner) return;
            const drawY = this.GROUND_BASE_Y + owner.y;
            const drawZ = drawY - owner.z;
            ctx.save();
            ctx.translate(owner.x, drawZ);
            ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
            ctx.lineWidth = 6;
            ctx.setLineDash(this._auraDashPattern || (this._auraDashPattern = [20, 15]));
            ctx.beginPath();
            ctx.ellipse(0, 0, a.w / 2, a.d / 2, 0, 0, Math.PI * 2);
            ctx.stroke();
            const t = Date.now() / 200;
            const pulse = 0.7 + Math.sin(t) * 0.2;
            ctx.scale(pulse, pulse);
            ctx.fillStyle = "rgba(173, 216, 230, 0.4)";
            ctx.beginPath();
            ctx.ellipse(0, 0, a.w / 2 - 10, a.d / 2 - 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }
        if (entry.kind === 2) {
            const p = entity;
            const prevAlpha = ctx.globalAlpha;
            if (p.hp > 0 && p.invincibleTimer > 0) ctx.globalAlpha = Math.min(prevAlpha, 0.62);
            if (typeof this.drawPlayerEntity === 'function') this.drawPlayerEntity(ctx, p);
            ctx.globalAlpha = prevAlpha;
            return;
        }
        if (entry.kind === 3) {
            if (typeof this.drawMonsterEntity === 'function') this.drawMonsterEntity(ctx, entity);
            return;
        }
        if (entry.kind === 4) {
            if (typeof this.drawBossPatternObjectEntity !== 'function') return;
            try {
                this.drawBossPatternObjectEntity(ctx, entity);
            } catch (err) {
                if (!entity._renderErrorLogged && typeof console !== 'undefined' && console.warn) {
                    entity._renderErrorLogged = true;
                    const meta = this.getBossObjectRenderMeta(entity);
                    console.warn('[Kasiyas] boss object render failed:', meta.renderType || entity.kind, err);
                }
            }
            return;
        }
        if (entry.kind === 5) {
            this.drawProjectileEntity(ctx, entity);
            return;
        }
        if (entry.kind === 6) {
            this.drawEffectEntity(ctx, entity, player);
        }
    },


    render: function(gameState) {
        if (!this.ctx) return;

        const renderer = this;
        const { camera, player, monsters, auras, projectiles, hitboxes, effects, floatingTexts, targetUI, isDebugView } = gameState;
        const ctx = this.ctx;
        const canvas = this.canvas;

        // OBJECT_DEFENSE 스페셜 모드는 기존 월드 좌표/깊이 정렬과 분리된 전용 렌더를 사용한다.
        if (gameState && gameState.specialMode === 'SPECIAL_MODE_OBJECT_DEFENSE' && typeof this.renderObjectDefenseDimensionDefense === 'function') {
            this.renderObjectDefenseDimensionDefense(gameState);
            return;
        }

        this.drawBackground(gameState);
        if (typeof this.drawP3M3WorldBackground === 'function') {
            this.drawP3M3WorldBackground(ctx, canvas, gameState);
        }

        ctx.save();
        const shakeX = Number.isFinite(parseFloat(camera && camera.shakeX)) ? parseFloat(camera.shakeX) : 0;
        const shakeY = Number.isFinite(parseFloat(camera && camera.shakeY)) ? parseFloat(camera.shakeY) : 0;
        if (shakeX || shakeY) ctx.translate(shakeX, shakeY);
        const cameraZoom = Math.max(1, parseFloat(camera && camera.zoom) || 1);
        if (cameraZoom > 1.001) {
            const focusScreenX = ((camera.focusX !== null && camera.focusX !== undefined) ? camera.focusX : (player.x || 0)) - camera.x;
            const focusScreenY = (camera.focusY !== null && camera.focusY !== undefined) ? camera.focusY : (this.GROUND_BASE_Y + (player.y || 0) - (player.z || 0));
            ctx.translate(focusScreenX, focusScreenY);
            ctx.scale(cameraZoom, cameraZoom);
            ctx.translate(-focusScreenX, -focusScreenY);
        }
        ctx.translate(-camera.x, 0);

        // WARNING 계열 전조는 캐릭터/보스보다 먼저 그린다.
        // 기존처럼 renderables에 함께 넣으면 긴 경로 전조가 캐릭터를 덮어서
        // 캐릭터와 보스가 점멸하거나 거의 안 보이는 것처럼 느껴질 수 있다.
        const delayedEffects = this._delayedEffectsBuffer || (this._delayedEffectsBuffer = []);
        delayedEffects.length = 0;
        for (let eff of effects) {
            if (eff && eff.type === 'warning') {
                renderer.drawEffectEntity(ctx, eff, player);
            } else {
                delayedEffects.push(eff);
            }
        }

        const renderables = this._renderablesBuffer || (this._renderablesBuffer = []);
        renderables.length = 0;
        this._renderEntryUseCount = 0;

        for (let a of auras) {
            if (a && a.owner) this.appendRenderEntry(renderables, a.owner.y - 1, 1, a);
        }

        if (player.active) {
            // 피격 무적 알파 처리까지 drawRenderEntry에서 그대로 수행한다.
            this.appendRenderEntry(renderables, player.y, 2, player);
        }

        for (let m of monsters) {
            const suppressP3M3BossModel = gameState && gameState.specialMode === 'P3_M3_FINAL_ISSEN' && m && m.p3m3MainBossSuppressed;
            if (m.active && !suppressP3M3BossModel) this.appendRenderEntry(renderables, m.y, 3, m);
        }

        const bossAttackObjects = gameState.bossAttackObjects || [];

        // 지형 붕괴/접근 제한 오브젝트는 바닥 지형 레이어에 먼저 그린다.
        // 기존 렌더 대상(kind=actor/collectible/interactiveSword) 필터에 걸려
        // 판정은 작동하지만 균열/붕괴/차단 지형이 화면에 보이지 않던 문제를 보정한다.
        for (let obj of bossAttackObjects) {
            const objectTypeRaw = this.getBossObjectRenderMeta(obj).objectType;
            if (obj && obj.active && (obj.kind === 'terrain' || objectTypeRaw.indexOf('TERRAIN_') === 0)) {
                if (typeof renderer.drawBossPatternObjectEntity === 'function') {
                    renderer.drawBossPatternObjectEntity(ctx, obj);
                }
            }
        }

        const airborneBossObjects = this._airborneBossObjectsBuffer || (this._airborneBossObjectsBuffer = []);
        const p3GiantTraceOverlayObjects = this._p3GiantTraceOverlayObjectsBuffer || (this._p3GiantTraceOverlayObjectsBuffer = []);
        airborneBossObjects.length = 0;
        p3GiantTraceOverlayObjects.length = 0;
        for (let obj of bossAttackObjects) {
            const renderMeta = this.getBossObjectRenderMeta(obj);
            const objectTypeRaw = renderMeta.objectType;
            const objectRenderTypeRaw = renderMeta.renderType;
            const isAirborneBossObject = obj && obj.active && (
                obj.kind === 'dimensionPortal' ||
                obj.kind === 'fallingSwordRain' ||
                objectTypeRaw === 'DIMENSION_PORTAL' ||
                objectTypeRaw === 'GIANT_DIMENSION_PORTAL_SKY' ||
                objectTypeRaw === 'FALLING_SWORD_RAIN' ||
                objectRenderTypeRaw === 'OBJ_DIMENSION_PORTAL' ||
                objectRenderTypeRaw === 'OBJ_P3_M2_GIANT_DIMENSION_PORTAL_SKY' ||
                objectRenderTypeRaw === 'OBJ_DIMENSION_PORTAL_SWORD_RAIN'
            );
            if (isAirborneBossObject) {
                airborneBossObjects.push(obj);
                continue;
            }
            const isPathBossObject = obj && obj.active && obj.visualLinked && (
                obj.kind === 'pathDelayed' ||
                objectRenderTypeRaw === 'OBJ_PATH_ONI_SLASH_BURST'
            );
            if (isPathBossObject) {
                this.appendRenderEntry(
                    renderables,
                    (obj.path ? (Math.max(obj.path.startY || 0, obj.path.endY || 0)) : (obj.y || 0)) + 2,
                    4,
                    obj
                );
                continue;
            }
            const traceKeyRaw = renderMeta.traceKey;
            const objectIdRaw = renderMeta.objectId;
            const isP3B5ComboTraceObject = obj && obj.active && obj.kind === 'p3GiantSwordTrace' && (
                objectIdRaw === '253011' ||
                traceKeyRaw === 'TRACE_PATH_P3_B5_PREVIOUS_ALL' ||
                traceKeyRaw === 'TRACE_PATH_P3_B5_ALL' ||
                traceKeyRaw === 'PREVIOUS_ALL'
            );
            if (isP3B5ComboTraceObject) {
                p3GiantTraceOverlayObjects.push(obj);
                continue;
            }
            if (obj && obj.active && (
                obj.kind === 'actor' ||
                obj.kind === 'collectible' ||
                obj.kind === 'interactiveSword' ||
                obj.kind === 'swordWave' ||
                obj.kind === 'interactObject' ||
                obj.kind === 'aimingObject' ||
                obj.kind === 'p2m2FiredGiantSword' ||
                obj.kind === 'p3GiantSwordTrace' ||
                obj.kind === 'p3SpaceDistortion' ||
                obj.kind === 'p3SpaceBurst' ||
                obj.kind === 'p3DimensionCrack' ||
                obj.kind === 'p3DimensionCrackBurst' ||
                obj.kind === 'p3M2GiantSwordDrop' ||
                obj.kind === 'p3M2ApostleEnergyEruption' ||
                objectRenderTypeRaw === 'OBJ_P3_M2_GIANT_SWORD_DROP' ||
                objectRenderTypeRaw === 'OBJ_P3_M2_APOSTLE_ENERGY_ERUPTION' ||
                objectTypeRaw === 'GIANT_SWORD_DROP' ||
                objectTypeRaw === 'APOSTLE_ENERGY_ERUPTION' ||
                objectRenderTypeRaw.indexOf('P2_M2_BROKEN_GIANT_SWORD') >= 0 ||
                objectRenderTypeRaw.indexOf('P2_M2_AIMING_GIANT_SWORD') >= 0 ||
                objectRenderTypeRaw.indexOf('P2_M2_FIRE_GIANT_SWORD') >= 0
            ) && !(obj.kind === 'terrain' || objectTypeRaw.indexOf('TERRAIN_') === 0)) {
                this.appendRenderEntry(renderables, obj.y, 4, obj);
            }
        }

        for (let p of projectiles) {
            this.appendRenderEntry(renderables, p.y, 5, p);
        }

        for (let eff of delayedEffects) {
            this.appendRenderEntry(renderables, eff.y, 6, eff);
        }

        const renderSort = this._renderEntrySortFn || (this._renderEntrySortFn = function(a, b) { return a.y - b.y; });
        renderables.sort(renderSort);
        for (let i = 0; i < renderables.length; i++) {
            const entry = renderables[i];
            this.drawRenderEntry(entry, ctx, player);
            // 풀 엔트리가 종료된 이펙트/오브젝트를 붙잡아 GC를 방해하지 않도록 즉시 참조를 비운다.
            entry.entity = null;
        }

        // 3페이즈 기본 패턴 5번의 통합 재타격 검흔(253011)은 기존 잔류 검흔 253007~253009를
        // 다시 붉게 점멸시키는 역할이다. 일반 y 깊이 정렬에 맡기면 하단에 가까운 원형 횡베기
        // 잔류 검흔이 253011 위에 다시 그려져 점멸이 가려질 수 있으므로, 검흔 레이어의 마지막에
        // 별도로 그려 세 경로 모두 동일하게 재활성화되어 보이도록 한다.
        p3GiantTraceOverlayObjects.forEach(obj => {
            if (obj && obj.active && typeof renderer.drawBossPatternObjectEntity === 'function') {
                try {
                    renderer.drawBossPatternObjectEntity(ctx, obj);
                } catch (err) {
                    if (!obj._renderErrorLogged && typeof console !== 'undefined' && console.warn) {
                        obj._renderErrorLogged = true;
                        console.warn('[Kasiyas] p3 giant trace overlay render failed:', err);
                    }
                }
            }
        });

        // 차원문/검 낙하 컨트롤러는 지상 깊이 정렬에 묶이면 보이지 않거나
        // 캐릭터 뒤에 묻히는 느낌이 강해진다. 공중 패턴 레이어에서 별도로 그린다.
        airborneBossObjects.forEach(obj => {
            if (obj && obj.active && typeof renderer.drawBossPatternObjectEntity === 'function') {
                renderer.drawBossPatternObjectEntity(ctx, obj);
            }
        });
        ctx.globalAlpha = 1.0;

        this.drawStageWarp(gameState);
        if (typeof this.drawP3M3BossAuraObjects === 'function') {
            this.drawP3M3BossAuraObjects(ctx, gameState);
        }
        if (typeof this.drawP3M3Portals === 'function') {
            this.drawP3M3Portals(ctx, gameState);
        }
        if (isDebugView && typeof this.drawP3M3MonsterDebug === 'function') {
            this.drawP3M3MonsterDebug(ctx, gameState);
        }

        if (isDebugView) {
            this.drawDebugOverlay(ctx, gameState);
        }

        ctx.restore();

        this.drawFloatingTexts(ctx, floatingTexts);
        if (typeof this.drawBossPhaseTransitionOverlay === 'function') {
            this.drawBossPhaseTransitionOverlay(ctx, canvas, gameState);
        }
        if (typeof this.drawObjectDefenseIntroOverlay === 'function') {
            this.drawObjectDefenseIntroOverlay(ctx, canvas, gameState);
        }
        if (typeof this.drawBossPatternDialogue === 'function') {
            this.drawBossPatternDialogue(ctx, canvas, gameState);
        }
        if (typeof this.drawP3M3Overlay === 'function') {
            this.drawP3M3Overlay(ctx, canvas, gameState);
        }
        this.drawTargetUI(ctx, canvas, targetUI, gameState);
        if (typeof this.drawP3M3TimeLimitUI === 'function') {
            this.drawP3M3TimeLimitUI(ctx, canvas, gameState);
        }
        this.drawScreenHitFeedback(ctx, canvas, gameState.screenHitFlash);
        // P3_M3 대화창은 전투 UI/피격 오버레이보다 항상 앞에 표시한다.
        if (typeof this.drawP3M3Dialogue === 'function') {
            this.drawP3M3Dialogue(ctx, canvas, gameState);
        }
    },

    drawScreenHitFeedback: function(ctx, canvas, flash) {
        if (!flash || !canvas) return;
        const maxLife = Math.max(0.001, parseFloat(flash.maxLife) || 0.22);
        const life = Math.max(0, parseFloat(flash.life) || 0);
        const t = life / maxLife;
        if (t <= 0) return;
        const strength = Math.max(0.15, Math.min(1, parseFloat(flash.strength) || 0.65));
        const alpha = Math.min(0.55, strength * t * 0.46);
        const w = canvas.width;
        const h = canvas.height;
        const edge = Math.max(70, Math.min(w, h) * 0.18);

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        const mode = String(flash.mode || '').trim().toLowerCase();
        if (mode === 'white' || mode === 'gold' || mode === 'fullwhite') {
            // fullWhite는 완전 파훼 전환용: 갑작스러운 섬광이 아니라 약 1초 동안 서서히 밝아진 뒤,
            // 그로기 진입 순간에 약한 번쩍임만 주도록 처리한다.
            let fullAlpha = Math.min(0.62, strength * t * 0.58);
            let flashPulse = 0;
            if (mode === 'fullwhite') {
                const elapsed = Math.max(0, maxLife - life);
                const rampTime = Math.max(0.05, parseFloat(flash.rampTime) || 1.0);
                const pulseTime = Math.max(0.04, parseFloat(flash.peakFlashTime) || 0.12);
                const fadeOutTime = Math.max(0.02, parseFloat(flash.fadeOutTime) || 0.04);
                const ramp = Math.max(0, Math.min(1, elapsed / rampTime));
                const smoothRamp = ramp * ramp * (3 - 2 * ramp);
                flashPulse = elapsed >= rampTime ? Math.max(0, 1 - ((elapsed - rampTime) / pulseTime)) : 0;
                const requestedMaxAlpha = parseFloat(flash.maxAlpha);
                const maxAlpha = isFinite(requestedMaxAlpha) ? Math.max(0.2, Math.min(1.0, requestedMaxAlpha)) : 0.88;
                fullAlpha = Math.min(maxAlpha, maxAlpha * smoothRamp + Math.min(0.10, maxAlpha * 0.10) * flashPulse);
                if (life < fadeOutTime) fullAlpha *= Math.max(0, Math.min(1, life / fadeOutTime));
            }
            const usePureWhite = mode === 'fullwhite' && !!flash.pureWhite;
            ctx.fillStyle = mode === 'gold'
                ? `rgba(255, 232, 120, ${fullAlpha})`
                : (usePureWhite ? `rgba(255, 255, 255, ${fullAlpha})` : `rgba(255, 255, 245, ${fullAlpha})`);
            ctx.fillRect(0, 0, w, h);
            const glow = ctx.createRadialGradient(w / 2, h * 0.48, 0, w / 2, h * 0.48, Math.max(w, h) * 0.72);
            if (usePureWhite) {
                glow.addColorStop(0, `rgba(255, 255, 255, ${Math.min(0.24, fullAlpha * 0.24)})`);
                glow.addColorStop(0.55, `rgba(245, 250, 255, ${Math.min(0.10, fullAlpha * 0.10)})`);
                glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            } else {
                glow.addColorStop(0, `rgba(255, 247, 198, ${Math.min(0.34, fullAlpha * 0.46 + flashPulse * 0.06)})`);
                glow.addColorStop(0.45, `rgba(205, 238, 255, ${Math.min(0.16, fullAlpha * 0.20)})`);
                glow.addColorStop(1, 'rgba(255, 206, 84, 0)');
            }
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
            return;
        }
        const gradL = ctx.createLinearGradient(0, 0, edge, 0);
        gradL.addColorStop(0, `rgba(150,0,0,${alpha})`);
        gradL.addColorStop(1, 'rgba(150,0,0,0)');
        ctx.fillStyle = gradL;
        ctx.fillRect(0, 0, edge, h);

        const gradR = ctx.createLinearGradient(w, 0, w - edge, 0);
        gradR.addColorStop(0, `rgba(150,0,0,${alpha})`);
        gradR.addColorStop(1, 'rgba(150,0,0,0)');
        ctx.fillStyle = gradR;
        ctx.fillRect(w - edge, 0, edge, h);

        const gradT = ctx.createLinearGradient(0, 0, 0, edge);
        gradT.addColorStop(0, `rgba(190,0,0,${alpha * 0.85})`);
        gradT.addColorStop(1, 'rgba(190,0,0,0)');
        ctx.fillStyle = gradT;
        ctx.fillRect(0, 0, w, edge);

        const gradB = ctx.createLinearGradient(0, h, 0, h - edge);
        gradB.addColorStop(0, `rgba(190,0,0,${alpha * 0.85})`);
        gradB.addColorStop(1, 'rgba(190,0,0,0)');
        ctx.fillStyle = gradB;
        ctx.fillRect(0, h - edge, w, edge);

        ctx.fillStyle = `rgba(255,40,35,${alpha * 0.08})`;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
};
