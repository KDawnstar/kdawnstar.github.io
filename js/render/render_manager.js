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


    render: function(gameState) {
        if (!this.ctx) return;

        const renderer = this;
        const { camera, player, monsters, auras, projectiles, hitboxes, effects, floatingTexts, targetUI, isDebugView } = gameState;
        const ctx = this.ctx;
        const canvas = this.canvas;

        this.drawBackground(gameState);

        ctx.save();
        ctx.translate(-camera.x, 0);

        // WARNING 계열 전조는 캐릭터/보스보다 먼저 그린다.
        // 기존처럼 renderables에 함께 넣으면 긴 경로 전조가 캐릭터를 덮어서
        // 캐릭터와 보스가 점멸하거나 거의 안 보이는 것처럼 느껴질 수 있다.
        const delayedEffects = [];
        for (let eff of effects) {
            if (eff && eff.type === 'warning') {
                renderer.drawEffectEntity(ctx, eff, player);
            } else {
                delayedEffects.push(eff);
            }
        }

        let renderables = [];

        for (let a of auras) {
            renderables.push({
                y: a.owner.y - 1,
                draw: function() {
                    let drawY = renderer.GROUND_BASE_Y + a.owner.y;
                    let drawZ = drawY - a.owner.z;
                    ctx.save();
                    ctx.translate(a.owner.x, drawZ);
                    ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
                    ctx.lineWidth = 6;
                    ctx.setLineDash([20, 15]);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, a.w / 2, a.d / 2, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    let t = Date.now() / 200;
                    let pulse = 0.7 + Math.sin(t) * 0.2;
                    ctx.scale(pulse, pulse);
                    ctx.fillStyle = "rgba(173, 216, 230, 0.4)";
                    ctx.beginPath();
                    ctx.ellipse(0, 0, a.w / 2 - 10, a.d / 2 - 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
        }

        if (player.active) {
            renderables.push({
                y: player.y,
                draw: function() {
                    // 피격 무적 중에도 완전히 사라지지 않게 반투명으로 표시한다.
                    // 보스전에서는 연속 피격/가드불가 장판 때문에 깜빡임이 길어져
                    // 캐릭터가 안 보이는 것처럼 느껴질 수 있다.
                    const prevAlpha = ctx.globalAlpha;
                    if (player.hp > 0 && player.invincibleTimer > 0) {
                        ctx.globalAlpha = Math.min(prevAlpha, 0.62);
                    }
                    if (typeof renderer.drawPlayerEntity === 'function') {
                        renderer.drawPlayerEntity(ctx, player);
                    }
                    ctx.globalAlpha = prevAlpha;
                }
            });
        }

        for (let m of monsters) {
            if (m.active) {
                renderables.push({
                    y: m.y,
                    draw: function() {
                        if (typeof renderer.drawMonsterEntity === 'function') {
                            renderer.drawMonsterEntity(ctx, m);
                        }
                    }
                });
            }
        }

        for (let obj of (gameState.bossAttackObjects || [])) {
            if (obj && obj.active && (obj.kind === 'actor' || obj.kind === 'collectible')) {
                renderables.push({
                    y: obj.y,
                    draw: function() {
                        if (typeof renderer.drawBossPatternObjectEntity === 'function') {
                            renderer.drawBossPatternObjectEntity(ctx, obj);
                        }
                    }
                });
            }
        }

        for (let p of projectiles) {
            renderables.push({
                y: p.y,
                draw: function() {
                    renderer.drawProjectileEntity(ctx, p);
                }
            });
        }

        for (let eff of delayedEffects) {
            renderables.push({
                y: eff.y,
                draw: function() {
                    renderer.drawEffectEntity(ctx, eff, player);
                }
            });
        }

        renderables.sort((a, b) => a.y - b.y);
        renderables.forEach(r => r.draw());
        ctx.globalAlpha = 1.0;

        this.drawStageWarp(gameState);

        if (isDebugView) {
            this.drawDebugOverlay(ctx, gameState);
        }

        ctx.restore();

        this.drawFloatingTexts(ctx, floatingTexts);
        if (typeof this.drawBossPatternDialogue === 'function') {
            this.drawBossPatternDialogue(ctx, canvas, gameState);
        }
        this.drawTargetUI(ctx, canvas, targetUI);
        this.drawScreenHitFeedback(ctx, canvas, gameState.screenHitFlash);
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
