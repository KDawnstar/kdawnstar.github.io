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

    resolvePlayerPalette: function(renderColor) {
    const key = String(renderColor || '').trim().toUpperCase();

    const map = {
        COLOR_DEFAULT_HUMAN: { dark: '#2c5f86', mid: '#6dd5ed', light: '#dff6ff' },

        COLOR_BLUE: { dark: '#2b6ca3', mid: '#4aa3df', light: '#d8f0ff' },
        COLOR_DARK_BLUE: { dark: '#1f3f5a', mid: '#355c7d', light: '#a7c4dd' },
        COLOR_CYAN: { dark: '#117a8b', mid: '#38d9e9', light: '#dcfbff' },

        COLOR_RED: { dark: '#9f2f24', mid: '#e74c3c', light: '#ffd7d1' },
        COLOR_DARK_RED: { dark: '#6e1f18', mid: '#b03a2e', light: '#e9b7b1' },

        COLOR_GREEN: { dark: '#1f6b3a', mid: '#38b26a', light: '#d8ffe7' },
        COLOR_DARK_GREEN: { dark: '#184d2d', mid: '#2b7a47', light: '#bfe6ca' },
        COLOR_LIGHT_GREEN: { dark: '#38a169', mid: '#68d391', light: '#e7fff0' },

        COLOR_PURPLE: { dark: '#5f3a78', mid: '#9b59b6', light: '#f1ddff' },

        COLOR_WHITE: { dark: '#bfc8cf', mid: '#ecf0f1', light: '#ffffff' },
        COLOR_DARK_WHITE: { dark: '#9ea7ad', mid: '#d7dde2', light: '#f7f9fb' },
        COLOR_SILVER_WHITE: { dark: '#8a98a6', mid: '#dde6ee', light: '#fcfdff' },

        COLOR_BEIGE: { dark: '#9a7b5f', mid: '#d2b48c', light: '#f6eadb' },
        COLOR_APRICOT: { dark: '#b96f4a', mid: '#f4b183', light: '#ffe6d6' },
        COLOR_DARK_APRICOT: { dark: '#9a5a3a', mid: '#d99058', light: '#f5d2b5' },

        COLOR_GRAY: { dark: '#5f6b73', mid: '#95a5a6', light: '#dde6e8' },
        COLOR_BLACK: { dark: '#111315', mid: '#2d3436', light: '#7f8c8d' }
    };

    return map[key] || map.COLOR_DEFAULT_HUMAN;
    },

    resolveWeaponPalette: function(renderColor, fallback = '#95a5a6') {
    const fallbackMid = fallback || '#95a5a6';

    const map = {
        COLOR_METAL_SILVER: { dark: '#5f6f73', mid: '#a8b8bc', light: '#e8f1f3', accent: '#d7e6ea' },
        COLOR_DARK_SILVER: { dark: '#4f5b60', mid: '#7b8a90', light: '#bac5ca', accent: '#dbe1e4' },
        COLOR_WOOD: { dark: '#5f3b1f', mid: '#8e5a2b', light: '#c58a52', accent: '#e2b07b' },
        COLOR_GUN_BLACK: { dark: '#0f151b', mid: '#2c3e50', light: '#66798c', accent: '#b9c7d3' },
        COLOR_STONE: { dark: '#586069', mid: '#8b949e', light: '#c9d1d9', accent: '#e5edf3' },
        COLOR_BLACK: { dark: '#0f1113', mid: '#2d3436', light: '#636e72', accent: '#b2bec3' },
        COLOR_BROWN: { dark: '#5d3412', mid: '#8b4513', light: '#c27a41', accent: '#e8b483' },
        COLOR_GOLD: { dark: '#9a6c08', mid: '#f1c40f', light: '#ffe082', accent: '#fff3bf' },
        COLOR_DARK_GOLD: { dark: '#8c6506', mid: '#d4ac0d', light: '#f6d365', accent: '#fff0b3' },
        COLOR_BLUE: { dark: '#1f5f97', mid: '#3498db', light: '#a7dbff', accent: '#e3f4ff' },
        COLOR_CYAN: { dark: '#0c7c86', mid: '#00d2ff', light: '#b9f7ff', accent: '#ecfeff' },
        COLOR_RED: { dark: '#922b21', mid: '#e74c3c', light: '#ffc9c2', accent: '#ffe7e3' }
    };

    if (map[renderColor]) return map[renderColor];

    return {
        dark: fallbackMid,
        mid: fallbackMid,
        light: '#ffffff',
        accent: '#f5f5f5'
    };
    },

    resolveWeaponColor: function(renderColor, fallback) {
    return this.resolveWeaponPalette(renderColor, fallback).mid;
    },

    resolveMonsterPalette: function(monster) {
    const d = monster.d || {};
    const key = String(d.renderColor || '').trim().toUpperCase();
    const renderType = String(d.renderType || '').trim().toUpperCase();
    const fallback = d.name && d.name.includes("키놀") ? "#d8dde6" : (d.color || '#95a5a6');

    const fallbackMapByType = {
        RENDER_GOBLIN: { dark: '#226b35', mid: '#4CAF50', light: '#b8f1b6' },
        RENDER_HUMAN: { dark: '#2c5f86', mid: '#6dd5ed', light: '#dff6ff' },
        RENDER_TAU: { dark: '#6b5742', mid: '#a07f62', light: '#d9b99a' },
        RENDER_SKELETON: { dark: '#8a8f94', mid: '#cfd6dc', light: '#fbfdff' },
        RENDER_ZOMBIE: { dark: '#4b5f39', mid: '#7f9a62', light: '#d9e7c8' },
        RENDER_WITCH: { dark: '#355c7d', mid: '#6c8fb3', light: '#d9ecff' }
    };

    const map = {
        COLOR_GREEN: { dark: '#226b35', mid: '#4CAF50', light: '#b8f1b6' },
        COLOR_LIGHT_GREEN: { dark: '#5f8f27', mid: '#8BC34A', light: '#e0f7b7' },
        COLOR_DARK_GREEN: { dark: '#1d5123', mid: '#2e7d32', light: '#8fd39a' },

        COLOR_RED: { dark: '#8f231d', mid: '#e74c3c', light: '#ffc8c2' },
        COLOR_DARK_RED: { dark: '#6f1d18', mid: '#b03a2e', light: '#eab7b1' },

        COLOR_BLUE: { dark: '#215d91', mid: '#3498db', light: '#c6ebff' },
        COLOR_DARK_BLUE: { dark: '#1c3e5a', mid: '#355c7d', light: '#a8c4db' },
        COLOR_CYAN: { dark: '#117a8b', mid: '#38d9e9', light: '#dcfbff' },

        COLOR_PURPLE: { dark: '#5b2a78', mid: '#9b59b6', light: '#ead4ff' },

        COLOR_STONE: { dark: '#59636d', mid: '#95a5a6', light: '#d9e2e3' },
        COLOR_GRAY: { dark: '#59636d', mid: '#95a5a6', light: '#d9e2e3' },
        COLOR_BLACK: { dark: '#111315', mid: '#2d3436', light: '#7f8c8d' },

        COLOR_WHITE: { dark: '#b9c3c8', mid: '#ecf0f1', light: '#ffffff' },
        COLOR_DARK_WHITE: { dark: '#9ea7ad', mid: '#d7dde2', light: '#f7f9fb' },
        COLOR_SILVER_WHITE: { dark: '#8d99a5', mid: '#dfe7ef', light: '#fbfdff' },

        COLOR_BEIGE: { dark: '#8f745d', mid: '#c9ab8a', light: '#f2e2d0' },
        COLOR_APRICOT: { dark: '#b96f4a', mid: '#f4b183', light: '#ffe6d6' },
        COLOR_DARK_APRICOT: { dark: '#9a5a3a', mid: '#d99058', light: '#f5d2b5' },

        COLOR_BROWN: { dark: '#5d3412', mid: '#8b4513', light: '#c27a41' },
        COLOR_GOLD: { dark: '#9a6c08', mid: '#f1c40f', light: '#ffe082' }
    };

    if (map[key]) return map[key];

    if (fallbackMapByType[renderType]) return fallbackMapByType[renderType];

    return {
        dark: fallback,
        mid: fallback,
        light: '#ffffff'
    };
    },

    resolveMonsterBodyColor: function(monster) {
        return this.resolveMonsterPalette(monster).mid;
    },    

    drawModelBody: function(ctx, options = {}) {
        const renderType = String(options.renderType || 'RENDER_HUMAN').trim().toUpperCase();
        const palette = options.palette || { dark: '#2c3e50', mid: '#95a5a6', light: '#ecf0f1' };
        const w = Math.max(24, options.w || 50);
        const h = Math.max(40, options.h || 100);
        const face = options.faceDir === -1 ? -1 : 1;
        const state = String(options.state || '').trim();
        const isDead = state === 'P_Die' || state === 'Die';
        const isHit = state === 'P_Hit' || state === 'Hit';
        const isChampion = !!options.isChampion;
        const isMonster = !!options.isMonster;
        const eyeColor = options.eyeColor || (isHit ? '#ffffff' : '#111111');

        const dark = isDead ? '#333333' : (isHit ? '#9f2f24' : palette.dark);
        const mid = isDead ? '#555555' : (isHit ? '#e74c3c' : palette.mid);
        const light = isDead ? '#777777' : palette.light;

        const addRoundRectPath = (x, y, rw, rh, radius) => {
            const rr = Math.min(radius, rw / 2, rh / 2);
            ctx.beginPath();
            ctx.moveTo(x + rr, y);
            ctx.lineTo(x + rw - rr, y);
            ctx.quadraticCurveTo(x + rw, y, x + rw, y + rr);
            ctx.lineTo(x + rw, y + rh - rr);
            ctx.quadraticCurveTo(x + rw, y + rh, x + rw - rr, y + rh);
            ctx.lineTo(x + rr, y + rh);
            ctx.quadraticCurveTo(x, y + rh, x, y + rh - rr);
            ctx.lineTo(x, y + rr);
            ctx.quadraticCurveTo(x, y, x + rr, y);
            ctx.closePath();
        };

        const bodyGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
        bodyGrad.addColorStop(0, dark);
        bodyGrad.addColorStop(0.52, mid);
        bodyGrad.addColorStop(1, dark);

        ctx.save();

        if (renderType === 'RENDER_GOBLIN') {
            const headR = Math.max(w * 0.24, h * 0.13);
            const headCx = face * w * 0.04;
            const headCy = -h * 0.72;

            const earBaseX = headCx - face * headR * 0.62;
            const earBaseY = headCy - headR * 0.02;

            ctx.fillStyle = mid;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(earBaseX, earBaseY - headR * 0.18);
            ctx.lineTo(earBaseX - face * headR * 1.05, earBaseY - headR * 0.48);
            ctx.lineTo(earBaseX - face * headR * 0.36, earBaseY + headR * 0.34);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = light;
            ctx.beginPath();
            ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-w * 0.34, -h * 0.54);
            ctx.quadraticCurveTo(-w * 0.30, -h * 0.62, -w * 0.16, -h * 0.64);
            ctx.lineTo(w * 0.16, -h * 0.64);
            ctx.quadraticCurveTo(w * 0.30, -h * 0.62, w * 0.34, -h * 0.54);
            ctx.lineTo(w * 0.28, -h * 0.18);
            ctx.quadraticCurveTo(w * 0.22, -h * 0.02, 0, 0);
            ctx.quadraticCurveTo(-w * 0.22, -h * 0.02, -w * 0.28, -h * 0.18);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.2;
            ctx.stroke();

            ctx.strokeStyle = eyeColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(headCx + face * headR * 0.08, headCy - headR * 0.02);
            ctx.lineTo(headCx + face * headR * 0.38, headCy - headR * 0.10);
            ctx.stroke();

            if (!isDead) {
                ctx.strokeStyle = 'rgba(0,0,0,0.35)';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(headCx + face * headR * 0.18, headCy + headR * 0.16);
                ctx.lineTo(headCx + face * headR * 0.30, headCy + headR * 0.20);
                ctx.stroke();
            }

        } else if (renderType === 'RENDER_TAU') {
            const headCx = face * w * 0.01;
            const headCy = -h * 0.72;
            const headW = w * 0.66;
            const headH = h * 0.34;

            ctx.fillStyle = '#e8e1cf';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(headCx - face * headW * 0.08, headCy - headH * 0.34);
            ctx.quadraticCurveTo(
                headCx - face * headW * 0.30,
                headCy - headH * 0.92,
                headCx - face * headW * 0.14,
                headCy - headH * 0.12
            );
            ctx.quadraticCurveTo(
                headCx - face * headW * 0.14,
                headCy - headH * 0.26,
                headCx - face * headW * 0.02,
                headCy - headH * 0.22
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(headCx + face * headW * 0.04, headCy - headH * 0.34);
            ctx.quadraticCurveTo(
                headCx + face * headW * 0.36,
                headCy - headH * 1.02,
                headCx + face * headW * 0.18,
                headCy - headH * 0.08
            );
            ctx.quadraticCurveTo(
                headCx + face * headW * 0.11,
                headCy - headH * 0.24,
                headCx + face * headW * 0.00,
                headCy - headH * 0.20
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = light;
            ctx.beginPath();
            ctx.moveTo(headCx - face * headW * 0.36, headCy - headH * 0.04);
            ctx.quadraticCurveTo(headCx - face * headW * 0.20, headCy - headH * 0.46, headCx + face * headW * 0.08, headCy - headH * 0.44);
            ctx.quadraticCurveTo(headCx + face * headW * 0.34, headCy - headH * 0.40, headCx + face * headW * 0.46, headCy - headH * 0.08);
            ctx.quadraticCurveTo(headCx + face * headW * 0.52, headCy + headH * 0.14, headCx + face * headW * 0.26, headCy + headH * 0.28);
            ctx.quadraticCurveTo(headCx + face * headW * 0.02, headCy + headH * 0.34, headCx - face * headW * 0.22, headCy + headH * 0.20);
            ctx.quadraticCurveTo(headCx - face * headW * 0.38, headCy + headH * 0.10, headCx - face * headW * 0.36, headCy - headH * 0.04);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.2;
            ctx.stroke();

            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.arc(
                headCx + face * headW * 0.10,
                headCy - headH * 0.10,
                Math.max(2.8, w * 0.028),
                0,
                Math.PI * 2
            );
            ctx.fill();

            if (!isDead) {
                ctx.fillStyle = 'rgba(0,0,0,0.30)';
                ctx.beginPath();
                ctx.arc(
                    headCx + face * headW * 0.28,
                    headCy + headH * 0.10,
                    Math.max(1.8, w * 0.018),
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            ctx.fillStyle = light;
            ctx.fillRect(-w * 0.08, -h * 0.60, w * 0.16, h * 0.10);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-w * 0.08, -h * 0.60, w * 0.16, h * 0.10);

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-w * 0.40, -h * 0.52);
            ctx.quadraticCurveTo(-w * 0.30, -h * 0.60, -w * 0.14, -h * 0.60);
            ctx.lineTo(w * 0.14, -h * 0.60);
            ctx.quadraticCurveTo(w * 0.30, -h * 0.60, w * 0.40, -h * 0.52);
            ctx.lineTo(w * 0.31, -h * 0.30);
            ctx.quadraticCurveTo(0, -h * 0.16, -w * 0.31, -h * 0.30);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.4;
            ctx.stroke();

            ctx.fillStyle = bodyGrad;
            ctx.fillRect(-w * 0.22, -h * 0.30, w * 0.44, h * 0.30);
            ctx.strokeRect(-w * 0.22, -h * 0.30, w * 0.44, h * 0.30);

        } else if (renderType === 'RENDER_ZOMBIE') {
            const headR = Math.max(w * 0.23, h * 0.15);
            const headCx = face * w * 0.02;
            const headCy = -h * 0.76;

            const skinBase = isDead ? '#6a6a6a' : light;
            const skinShade = isDead ? '#565656' : dark;
            const bloodMain = isDead ? 'rgba(90, 30, 30, 0.55)' : 'rgba(140, 25, 25, 0.82)';
            const bloodDark = isDead ? 'rgba(55, 18, 18, 0.55)' : 'rgba(75, 10, 10, 0.85)';
            const woundDark = isDead ? 'rgba(40, 16, 16, 0.70)' : 'rgba(55, 12, 12, 0.88)';

            ctx.fillStyle = skinBase;
            ctx.beginPath();
            ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.beginPath();
            ctx.ellipse(headCx - face * headR * 0.10, headCy - headR * 0.26, headR * 0.62, headR * 0.34, 0, 0, Math.PI * 2);
            ctx.fill();

            if (!isDead) {
                ctx.fillStyle = 'rgba(255, 70, 70, 0.95)';
                ctx.beginPath();
                ctx.arc(headCx + face * headR * 0.18, headCy - headR * 0.04, Math.max(2.6, w * 0.030), 0, Math.PI * 2);
                ctx.arc(headCx + face * headR * 0.36, headCy + headR * 0.01, Math.max(2.2, w * 0.026), 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255, 210, 210, 0.65)';
                ctx.beginPath();
                ctx.arc(headCx + face * headR * 0.16, headCy - headR * 0.08, Math.max(0.9, w * 0.010), 0, Math.PI * 2);
                ctx.arc(headCx + face * headR * 0.34, headCy - headR * 0.03, Math.max(0.8, w * 0.009), 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = 'rgba(120, 120, 120, 0.85)';
                ctx.beginPath();
                ctx.arc(headCx + face * headR * 0.18, headCy - headR * 0.04, Math.max(2.2, w * 0.026), 0, Math.PI * 2);
                ctx.arc(headCx + face * headR * 0.36, headCy + headR * 0.01, Math.max(2.0, w * 0.023), 0, Math.PI * 2);
                ctx.fill();
            }

            if (!isDead) {
                ctx.strokeStyle = woundDark;
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(headCx + face * headR * 0.10, headCy + headR * 0.30);
                ctx.lineTo(headCx + face * headR * 0.34, headCy + headR * 0.36);
                ctx.stroke();
            }

            ctx.strokeStyle = woundDark;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(headCx - face * headR * 0.10, headCy + headR * 0.02);
            ctx.lineTo(headCx + face * headR * 0.08, headCy + headR * 0.18);
            ctx.stroke();

            ctx.fillStyle = bloodMain;
            ctx.beginPath();
            ctx.arc(headCx + face * headR * 0.10, headCy + headR * 0.20, Math.max(1.8, w * 0.018), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = skinShade;
            ctx.fillRect(-w * 0.07, -h * 0.61, w * 0.14, h * 0.09);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-w * 0.07, -h * 0.61, w * 0.14, h * 0.09);

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-w * 0.38, -h * 0.54);
            ctx.quadraticCurveTo(-w * 0.30, -h * 0.61, -w * 0.12, -h * 0.60);
            ctx.lineTo(w * 0.12, -h * 0.60);
            ctx.quadraticCurveTo(w * 0.28, -h * 0.60, w * 0.36, -h * 0.52);
            ctx.lineTo(w * 0.28, -h * 0.28);
            ctx.quadraticCurveTo(0, -h * 0.18, -w * 0.28, -h * 0.28);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.3;
            ctx.stroke();

            ctx.fillStyle = bodyGrad;
            ctx.fillRect(-w * 0.22, -h * 0.28, w * 0.44, h * 0.28);
            ctx.strokeRect(-w * 0.22, -h * 0.28, w * 0.44, h * 0.28);

            ctx.strokeStyle = woundDark;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-w * 0.12, -h * 0.44);
            ctx.lineTo(w * 0.04, -h * 0.36);
            ctx.stroke();

            ctx.fillStyle = bloodMain;
            ctx.beginPath();
            ctx.ellipse(-w * 0.01, -h * 0.35, w * 0.05, h * 0.025, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = woundDark;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w * 0.10, -h * 0.20);
            ctx.lineTo(w * 0.22, -h * 0.11);
            ctx.stroke();

            ctx.fillStyle = bloodDark;
            ctx.beginPath();
            ctx.arc(w * 0.18, -h * 0.10, Math.max(1.8, w * 0.020), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = bloodMain;
            ctx.beginPath();
            ctx.arc(-w * 0.28, -h * 0.34, Math.max(1.6, w * 0.016), 0, Math.PI * 2);
            ctx.arc(w * 0.30, -h * 0.30, Math.max(1.4, w * 0.014), 0, Math.PI * 2);
            ctx.fill();

        } else {
            const isWitch = renderType === 'RENDER_WITCH';
            const headR = w * 0.20;
            const headCx = face * w * 0.02;
            const headCy = -h * 0.80;

            if (isWitch) {
                const capeGrad = ctx.createLinearGradient(0, -h * 0.64, 0, h * 0.08);
                capeGrad.addColorStop(0, 'rgba(88, 62, 138, 0.88)');
                capeGrad.addColorStop(0.55, 'rgba(52, 36, 86, 0.94)');
                capeGrad.addColorStop(1, 'rgba(22, 18, 36, 0.96)');

                ctx.fillStyle = capeGrad;
                ctx.strokeStyle = 'rgba(0,0,0,0.52)';
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(-w * 0.10, -h * 0.58);
                ctx.quadraticCurveTo(-w * 0.34, -h * 0.56, -w * 0.42, -h * 0.20);
                ctx.quadraticCurveTo(-w * 0.38, h * 0.02, -w * 0.18, -h * 0.04);
                ctx.quadraticCurveTo(-w * 0.06, -h * 0.22, -w * 0.05, -h * 0.52);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(w * 0.10, -h * 0.58);
                ctx.quadraticCurveTo(w * 0.34, -h * 0.56, w * 0.42, -h * 0.20);
                ctx.quadraticCurveTo(w * 0.38, h * 0.02, w * 0.18, -h * 0.04);
                ctx.quadraticCurveTo(w * 0.06, -h * 0.22, w * 0.05, -h * 0.52);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = 'rgba(66, 46, 108, 0.92)';
                ctx.beginPath();
                ctx.moveTo(-w * 0.13, -h * 0.60);
                ctx.quadraticCurveTo(0, -h * 0.70, w * 0.13, -h * 0.60);
                ctx.lineTo(w * 0.08, -h * 0.54);
                ctx.quadraticCurveTo(0, -h * 0.59, -w * 0.08, -h * 0.54);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = 'rgba(180, 210, 255, 0.12)';
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.moveTo(-w * 0.10, -h * 0.53);
                ctx.quadraticCurveTo(-w * 0.18, -h * 0.28, -w * 0.16, -h * 0.06);
                ctx.moveTo(w * 0.10, -h * 0.53);
                ctx.quadraticCurveTo(w * 0.18, -h * 0.28, w * 0.16, -h * 0.06);
                ctx.stroke();
            }

            ctx.fillStyle = light;
            ctx.beginPath();
            ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = light;
            ctx.fillRect(-w * 0.055, -h * 0.70, w * 0.11, h * 0.10);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-w * 0.055, -h * 0.70, w * 0.11, h * 0.10);

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-w * 0.42, -h * 0.60);
            ctx.quadraticCurveTo(-w * 0.33, -h * 0.70, -w * 0.14, -h * 0.70);
            ctx.lineTo(w * 0.14, -h * 0.70);
            ctx.quadraticCurveTo(w * 0.33, -h * 0.70, w * 0.42, -h * 0.60);
            ctx.lineTo(w * 0.34, -h * 0.36);
            ctx.quadraticCurveTo(0, -h * 0.24, -w * 0.34, -h * 0.36);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.4;
            ctx.stroke();

            ctx.fillStyle = bodyGrad;
            ctx.fillRect(-w * 0.24, -h * 0.36, w * 0.48, h * 0.36);
            ctx.strokeRect(-w * 0.24, -h * 0.36, w * 0.48, h * 0.36);

            if (isWitch) {
                ctx.fillStyle = eyeColor;
                ctx.beginPath();
                ctx.arc(headCx + face * headR * 0.18, headCy - headR * 0.03, Math.max(2.1, w * 0.020), 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255,255,255,0.75)';
                ctx.beginPath();
                ctx.arc(headCx + face * headR * 0.14, headCy - headR * 0.08, Math.max(0.8, w * 0.008), 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.strokeStyle = eyeColor;
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(headCx + face * headR * 0.14, headCy - headR * 0.02);
                ctx.lineTo(headCx + face * headR * 0.30, headCy + headR * 0.01);
                ctx.stroke();
            }
        }

        ctx.restore();
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

        if (player.active && player.hp > 0) {
            let isVisible = player.invincibleTimer <= 0 || (Math.floor(player.invincibleTimer * 10) % 2 === 0);
            if (isVisible) {
                renderables.push({
                    y: player.y,
                    draw: function() {
                        renderer.drawPlayerEntity(ctx, player);
                    }
                });
            }
        }

        for (let m of monsters) {
            if (m.active) {
                renderables.push({
                    y: m.y,
                    draw: function() {
                        renderer.drawMonsterEntity(ctx, m);
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

        for (let eff of effects) {
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
        this.drawTargetUI(ctx, canvas, targetUI);
    }
};