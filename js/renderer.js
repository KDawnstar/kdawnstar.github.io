// ==========================================
// [모험의 시작] 렌더링 엔진 모듈 (renderer.js)
// 2단계: 기존 그래픽 유지 + 캐릭터/몬스터 색/무기 enum 반영
// ==========================================

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

    drawPunchEffect: function(ctx, eff, alpha) {
    const baseScale = eff.burstScale || 1;
    const championScale = eff.effectScale || 1;
    const r = 34 * baseScale * championScale;
    const a = Math.max(0, Math.min(1, alpha));

    const addRoundRectPath = (x, y, w, h, radius) => {
        const rr = Math.min(radius, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.lineTo(x + w - rr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
        ctx.lineTo(x + w, y + h - rr);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
        ctx.lineTo(x + rr, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
        ctx.lineTo(x, y + rr);
        ctx.quadraticCurveTo(x, y, x + rr, y);
        ctx.closePath();
    };

    const fistFill = eff.color || `rgba(255, 205, 95, ${0.98 * a})`;
    const fistShade = `rgba(214, 112, 34, ${0.92 * a})`;
    const fistLine = `rgba(135, 48, 20, ${0.98 * a})`;
    const fistHighlight = eff.accentColor || `rgba(255, 240, 185, ${0.92 * a})`;

    ctx.save();
    ctx.scale(eff.dir || 1, 1);

    ctx.fillStyle = fistFill;

    // 손등/주먹 본체
    addRoundRectPath(-r * 0.46, -r * 0.04, r * 0.82, r * 0.52, r * 0.12);
    ctx.fill();

    // 손가락 마디 4개
    for (let i = 0; i < 4; i++) {
        const kx = -r * 0.46 + i * r * 0.20;
        addRoundRectPath(kx, -r * 0.46, r * 0.16, r * 0.34, r * 0.06);
        ctx.fill();
    }

    // 엄지
    ctx.beginPath();
    ctx.moveTo(-r * 0.44, r * 0.02);
    ctx.quadraticCurveTo(-r * 0.72, 0, -r * 0.67, r * 0.30);
    ctx.quadraticCurveTo(-r * 0.50, r * 0.42, -r * 0.24, r * 0.30);
    ctx.quadraticCurveTo(-r * 0.30, r * 0.18, -r * 0.44, r * 0.02);
    ctx.closePath();
    ctx.fill();

    // 하단 음영
    ctx.fillStyle = fistShade;
    addRoundRectPath(-r * 0.38, r * 0.16, r * 0.62, r * 0.20, r * 0.08);
    ctx.fill();

    // 손가락 아래 음영
    for (let i = 0; i < 4; i++) {
        const sx = -r * 0.42 + i * r * 0.20;
        addRoundRectPath(sx, -r * 0.18, r * 0.12, r * 0.10, r * 0.04);
        ctx.fill();
    }

    // 상단 하이라이트
    ctx.fillStyle = fistHighlight;
    addRoundRectPath(-r * 0.20, -r * 0.28, r * 0.42, r * 0.08, r * 0.03);
    ctx.fill();

    // 외곽선
    ctx.strokeStyle = fistLine;
    ctx.lineWidth = Math.max(2.4, r * 0.07);

    addRoundRectPath(-r * 0.46, -r * 0.04, r * 0.82, r * 0.52, r * 0.12);
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
        const kx = -r * 0.46 + i * r * 0.20;
        addRoundRectPath(kx, -r * 0.46, r * 0.16, r * 0.34, r * 0.06);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(-r * 0.44, r * 0.02);
    ctx.quadraticCurveTo(-r * 0.72, 0, -r * 0.67, r * 0.30);
    ctx.quadraticCurveTo(-r * 0.50, r * 0.42, -r * 0.24, r * 0.30);
    ctx.quadraticCurveTo(-r * 0.30, r * 0.18, -r * 0.44, r * 0.02);
    ctx.closePath();
    ctx.stroke();

    // 손가락 구분선
    ctx.beginPath();
    for (let i = 1; i <= 3; i++) {
        const x = -r * 0.46 + i * r * 0.20;
        ctx.moveTo(x, -r * 0.14);
        ctx.lineTo(x, r * 0.16);
    }
    ctx.stroke();

    // 아주 약한 속도선만 유지
    ctx.strokeStyle = `rgba(255, 245, 225, ${0.72 * a})`;
    ctx.lineWidth = Math.max(1.8, r * 0.04);
    ctx.beginPath();
    ctx.moveTo(r * 0.42, -r * 0.18);
    ctx.lineTo(r * 0.62, -r * 0.30);
    ctx.moveTo(r * 0.50, 0);
    ctx.lineTo(r * 0.76, 0);
    ctx.moveTo(r * 0.42, r * 0.18);
    ctx.lineTo(r * 0.62, r * 0.30);
    ctx.stroke();

    ctx.restore();
},

    drawFlameFang: function(ctx, cx, cy, dir, fw, fl, alpha) {
    const outerGrad = ctx.createLinearGradient(cx, cy, cx, cy + dir * fl);

    if (dir < 0) {
        outerGrad.addColorStop(0, `rgba(255, 250, 205, ${0.98 * alpha})`);
        outerGrad.addColorStop(0.35, `rgba(255, 214, 120, ${0.96 * alpha})`);
        outerGrad.addColorStop(0.72, `rgba(255, 145, 70, ${0.92 * alpha})`);
        outerGrad.addColorStop(1, `rgba(185, 55, 18, ${0.82 * alpha})`);
    } else {
        outerGrad.addColorStop(0, `rgba(185, 55, 18, ${0.82 * alpha})`);
        outerGrad.addColorStop(0.28, `rgba(255, 145, 70, ${0.92 * alpha})`);
        outerGrad.addColorStop(0.65, `rgba(255, 214, 120, ${0.96 * alpha})`);
        outerGrad.addColorStop(1, `rgba(255, 250, 205, ${0.98 * alpha})`);
    }

    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.moveTo(cx - fw * 0.58, cy);
    ctx.quadraticCurveTo(cx - fw * 0.50, cy + dir * fl * 0.30, cx, cy + dir * fl);
    ctx.quadraticCurveTo(cx + fw * 0.50, cy + dir * fl * 0.30, cx + fw * 0.58, cy);
    ctx.quadraticCurveTo(cx + fw * 0.18, cy + dir * fl * 0.10, cx, cy + dir * fl * 0.16);
    ctx.quadraticCurveTo(cx - fw * 0.18, cy + dir * fl * 0.10, cx - fw * 0.58, cy);
    ctx.closePath();
    ctx.fill();

    const innerGrad = ctx.createLinearGradient(cx, cy, cx, cy + dir * fl * 0.78);

    if (dir < 0) {
        innerGrad.addColorStop(0, `rgba(255,255,240,${0.92 * alpha})`);
        innerGrad.addColorStop(0.45, `rgba(255,235,170,${0.78 * alpha})`);
        innerGrad.addColorStop(1, `rgba(255,170,90,${0.08 * alpha})`);
    } else {
        innerGrad.addColorStop(0, `rgba(255,170,90,${0.08 * alpha})`);
        innerGrad.addColorStop(0.55, `rgba(255,235,170,${0.78 * alpha})`);
        innerGrad.addColorStop(1, `rgba(255,255,240,${0.92 * alpha})`);
    }

    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.moveTo(cx - fw * 0.22, cy + dir * fl * 0.06);
    ctx.quadraticCurveTo(cx - fw * 0.10, cy + dir * fl * 0.26, cx, cy + dir * fl * 0.72);
    ctx.quadraticCurveTo(cx + fw * 0.10, cy + dir * fl * 0.26, cx + fw * 0.22, cy + dir * fl * 0.06);
    ctx.closePath();
    ctx.fill();
},

    drawBiteEffect: function(ctx, eff, alpha) {
    const biteW = Math.max(64, (eff.w || 70) * 0.72);
    const biteH = Math.max(54, (eff.h || 50) * 0.58);
    const closeRatio = 1 - alpha;
    const jawGap = Math.max(10, 28 - closeRatio * 18);
    const fangCount = 9;
    const fangSpan = biteW * 0.88;
    const fangStep = fangSpan / (fangCount - 1);
    const fangBaseW = Math.max(8, biteW * 0.11);
    const fangLen = Math.max(26, biteH * (0.55 + closeRatio * 0.18));
    const glowScale = 1 + closeRatio * 0.08;

    ctx.save();
    ctx.scale(eff.dir || 1, 1);
    ctx.scale(glowScale, glowScale);

    const jawShadowGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, biteW * 0.42);
    jawShadowGrad.addColorStop(0, `rgba(80, 20, 10, ${0.22 * alpha})`);
    jawShadowGrad.addColorStop(0.65, `rgba(40, 10, 5, ${0.14 * alpha})`);
    jawShadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = jawShadowGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, biteW * 0.42, biteH * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    const topY = -jawGap;
    const bottomY = jawGap;

    for (let i = 0; i < fangCount; i++) {
        const offset = -fangSpan / 2 + fangStep * i;
        const edgeRatio = Math.abs(i - (fangCount - 1) / 2) / ((fangCount - 1) / 2);
        const scale = 0.86 + (1 - edgeRatio) * 0.30;

        this.drawFlameFang(ctx, offset, topY, -1, fangBaseW * scale, fangLen * scale, alpha);
        this.drawFlameFang(ctx, offset, bottomY, 1, fangBaseW * scale, fangLen * scale, alpha);
    }

    ctx.strokeStyle = `rgba(255, 245, 220, ${0.32 * alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-biteW * 0.16, -jawGap * 0.55);
    ctx.lineTo(biteW * 0.16, jawGap * 0.55);
    ctx.moveTo(biteW * 0.16, -jawGap * 0.55);
    ctx.lineTo(-biteW * 0.16, jawGap * 0.55);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 210, 150, ${0.26 * alpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, biteW * 0.11, biteH * 0.10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.34;
    for (let i = 0; i < 4; i++) {
        const px = -biteW * 0.18 + i * biteW * 0.12;
        const py = (i % 2 === 0 ? -1 : 1) * jawGap * 0.28;
        ctx.fillStyle = "rgba(255, 235, 180, 0.85)";
        ctx.beginPath();
        ctx.arc(px, py, 2 + i * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
},

    themePresets: {
        DEFAULT: {
            skyTop: '#a1c4fd',
            skyBottom: '#c2e9fb',
            groundTop: '#a8b571',
            groundBottom: '#7d8c4c',
            mountain: '#6cab5a',
            cloud: 'rgba(255,255,255,0.80)',
            fog: 'rgba(255,255,255,0.06)',
            grass: 'rgba(70, 90, 40, 0.30)',
            grassStroke: 'rgba(100, 140, 50, 0.50)',
            warpA: 'rgba(180, 220, 255, 0.18)',
            warpB: 'rgba(255, 255, 255, 0.30)'
        },
        THUNDERING_FOREST: {
            skyTop: '#43506b',
            skyBottom: '#78889d',
            groundTop: '#718654',
            groundBottom: '#485536',
            mountain: '#52634f',
            cloud: 'rgba(215,225,255,0.30)',
            fog: 'rgba(255,255,255,0.04)',
            grass: 'rgba(55, 75, 40, 0.35)',
            grassStroke: 'rgba(120, 150, 90, 0.35)',
            warpA: 'rgba(126, 87, 255, 0.20)',
            warpB: 'rgba(195, 180, 255, 0.38)'
        },
        FROZEN_FOREST: {
            skyTop: '#b9d9ff',
            skyBottom: '#eaf5ff',
            groundTop: '#dceaf2',
            groundBottom: '#b8d0df',
            mountain: '#9fc0d7',
            cloud: 'rgba(255,255,255,0.75)',
            fog: 'rgba(220,240,255,0.12)',
            grass: 'rgba(150, 190, 220, 0.20)',
            grassStroke: 'rgba(170, 220, 255, 0.55)',
            warpA: 'rgba(110, 220, 255, 0.18)',
            warpB: 'rgba(235, 255, 255, 0.40)'
            
        }
    },

    init: function(canvasElement, worldWidth) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.rebuildStageBackground(null, worldWidth || 2000, 300);
    },

    rebuildStageBackground: function(stage, worldWidth, worldDepth) {
        this.currentTheme = (stage && stage.Stage_Background_Type) ? stage.Stage_Background_Type : 'DEFAULT';

        this.bgClouds = [];
        this.bgMountains = [];
        this.bgTreesFar = [];
        this.bgTreesNear = [];
        this.bgCrystals = [];

        const w = Math.max(1200, worldWidth || 2000);
        const d = Math.max(300, worldDepth || 300);

        const cloudCount = Math.max(6, Math.round(w / 220));
        const mountainCount = Math.max(7, Math.round(w / 180));
        const treeFarCount = Math.max(10, Math.round(w / 120));
        const treeNearCount = Math.max(8, Math.round(w / 150));
        const crystalCount = Math.max(8, Math.round(w / 180));

        for (let i = 0; i < cloudCount; i++) {
            this.bgClouds.push({
                x: Math.random() * w,
                y: 70 + Math.random() * 160,
                s: 0.7 + Math.random() * 0.9,
                speed: 0.5 + Math.random() * 0.6
            });
        }

        for (let i = 0; i < mountainCount; i++) {
            this.bgMountains.push({
                x: (i / mountainCount) * w + (Math.random() * 80 - 40),
                w: 260 + Math.random() * 280,
                h: 120 + Math.random() * 180
            });
        }

        for (let i = 0; i < treeFarCount; i++) {
            this.bgTreesFar.push({
                x: Math.random() * w,
                y: 10 + Math.random() * (d - 20),
                h: 35 + Math.random() * 45,
                s: 0.7 + Math.random() * 0.5
            });
        }

        for (let i = 0; i < treeNearCount; i++) {
            this.bgTreesNear.push({
                x: Math.random() * w,
                y: 10 + Math.random() * (d - 20),
                h: 45 + Math.random() * 60,
                s: 0.9 + Math.random() * 0.7
            });
        }

        for (let i = 0; i < crystalCount; i++) {
            this.bgCrystals.push({
                x: Math.random() * w,
                y: 10 + Math.random() * (d - 20),
                h: 24 + Math.random() * 30,
                w: 10 + Math.random() * 12
            });
        }
    },

    getTheme: function(gameState) {
        const key = (gameState && gameState.currentStage && gameState.currentStage.Stage_Background_Type)
            ? gameState.currentStage.Stage_Background_Type
            : this.currentTheme;
        return this.themePresets[key] || this.themePresets.DEFAULT;
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

    drawBackground: function(gameState) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const camera = gameState.camera;
        const WORLD_DEPTH = gameState.WORLD_DEPTH;
        const GROUND_BASE_Y = this.GROUND_BASE_Y;
        const theme = this.getTheme(gameState);
        const themeKey = (gameState.currentStage && gameState.currentStage.Stage_Background_Type) || this.currentTheme;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_BASE_Y);
        skyGrad.addColorStop(0, theme.skyTop);
        skyGrad.addColorStop(1, theme.skyBottom);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, GROUND_BASE_Y);

        ctx.fillStyle = theme.fog;
        ctx.fillRect(0, GROUND_BASE_Y - 50, canvas.width, 120);

        if (themeKey === 'THUNDERING_FOREST') {
            for (let i = 0; i < 5; i++) {
                const y = 40 + i * 38;
                let grad = ctx.createLinearGradient(0, y, 0, y + 60);
                grad.addColorStop(0, 'rgba(40,45,60,0.00)');
                grad.addColorStop(1, 'rgba(30,35,48,0.18)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, y, canvas.width, 80);
            }
        }

        ctx.fillStyle = theme.cloud;
        for (let c of this.bgClouds) {
            let cx = ((c.x) - camera.x * (0.08 * c.speed)) % (canvas.width + 500);
            if (cx < -250) cx += canvas.width + 500;

            ctx.beginPath();
            ctx.arc(cx, c.y, 34 * c.s, 0, Math.PI * 2);
            ctx.arc(cx + 34 * c.s, c.y - 14 * c.s, 42 * c.s, 0, Math.PI * 2);
            ctx.arc(cx + 72 * c.s, c.y, 32 * c.s, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = theme.mountain;
        for (let m of this.bgMountains) {
            let mx = ((m.x) - camera.x * 0.26) % (canvas.width + 800);
            if (mx < -400) mx += canvas.width + 800;

            ctx.beginPath();
            ctx.moveTo(mx, GROUND_BASE_Y);
            ctx.lineTo(mx + m.w / 2, GROUND_BASE_Y - m.h);
            ctx.lineTo(mx + m.w, GROUND_BASE_Y);
            ctx.closePath();
            ctx.fill();
        }

        let groundGrad = ctx.createLinearGradient(0, GROUND_BASE_Y, 0, canvas.height);
        groundGrad.addColorStop(0, theme.groundTop);
        groundGrad.addColorStop(1, theme.groundBottom);
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, GROUND_BASE_Y, canvas.width, canvas.height - GROUND_BASE_Y);

        if (themeKey === 'FROZEN_FOREST') {
            for (let ice of this.bgCrystals) {
                const x = ((ice.x) - camera.x * 0.45) % (canvas.width + 220);
                const sx = x < -110 ? x + canvas.width + 220 : x;
                const sy = GROUND_BASE_Y + ice.y;

                ctx.save();
                ctx.translate(sx, sy);
                ctx.fillStyle = 'rgba(210,245,255,0.45)';
                ctx.beginPath();
                ctx.moveTo(0, -ice.h);
                ctx.lineTo(ice.w, 0);
                ctx.lineTo(0, ice.h * 0.25);
                ctx.lineTo(-ice.w, 0);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = 'rgba(255,255,255,0.35)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
        } else {
            for (let t of this.bgTreesFar) {
                const x = ((t.x) - camera.x * 0.42) % (canvas.width + 240);
                const sx = x < -120 ? x + canvas.width + 240 : x;
                const sy = GROUND_BASE_Y + t.y;

                ctx.save();
                ctx.translate(sx, sy);
                ctx.fillStyle = 'rgba(30,50,35,0.18)';
                ctx.beginPath();
                ctx.moveTo(0, -t.h);
                ctx.lineTo(t.h * 0.35, 0);
                ctx.lineTo(-t.h * 0.35, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        ctx.fillStyle = theme.grass;
        for (let i = 0; i < 170; i++) {
            let wx = ((i * 173) - camera.x * 1.0) % (canvas.width + 220);
            if (wx < -110) wx += canvas.width + 220;
            let wy = GROUND_BASE_Y + ((i * 83) % Math.max(1, WORLD_DEPTH));

            ctx.beginPath();
            ctx.ellipse(wx, wy, (i % 4) + 2, (i % 3) + 1, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = theme.grassStroke;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(wx, wy);
            ctx.lineTo(wx - 2, wy - 4 - (i % 4));
            ctx.moveTo(wx, wy);
            ctx.lineTo(wx + 2, wy - 3 - (i % 3));
            ctx.stroke();
        }

        if (themeKey === 'FROZEN_FOREST') {
            for (let i = 0; i < 80; i++) {
                let wx = ((i * 251) - camera.x * 0.95) % (canvas.width + 200);
                if (wx < -100) wx += canvas.width + 200;
                let wy = GROUND_BASE_Y + ((i * 61) % Math.max(1, WORLD_DEPTH));

                ctx.fillStyle = 'rgba(255,255,255,0.16)';
                ctx.fillRect(wx, wy, 2, 2);
            }
        }
    },

    drawStageWarp: function(gameState) {
        if (!gameState.activeWarp || !gameState.isStageCleared) return;

        const ctx = this.ctx;
        const camera = gameState.camera;
        const warp = gameState.activeWarp;
        const theme = this.getTheme(gameState);
        const baseY = this.GROUND_BASE_Y;
        const pulse = 0.55 + Math.sin(Date.now() / 220) * 0.18;

        const x = warp.x - warp.w / 2 - camera.x;
        const y = baseY + warp.y - warp.h / 2;
        const w = warp.w;
        const h = warp.h;

        ctx.save();

        let grad = ctx.createLinearGradient(x, 0, x + w, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0.02)');
        grad.addColorStop(0.2, theme.warpA);
        grad.addColorStop(0.5, theme.warpB);
        grad.addColorStop(0.8, theme.warpA);
        grad.addColorStop(1, 'rgba(255,255,255,0.02)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = `rgba(255,255,255,${0.22 + pulse * 0.25})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

        for (let i = 0; i < 5; i++) {
            const alpha = 0.05 + i * 0.03 + pulse * 0.04;
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 1;
            const inset = i * 4 + 3;
            ctx.strokeRect(x + inset, y + 2, Math.max(0, w - inset * 2), Math.max(0, h - 4));
        }

        for (let i = 0; i < 8; i++) {
            let fx = x + 4 + (i / 7) * (w - 8);
            let flowOffset = ((Date.now() / 14) + i * 42) % (h + 80);
            let fy = y + h - flowOffset;

            let lineGrad = ctx.createLinearGradient(fx, fy, fx, fy + 80);
            lineGrad.addColorStop(0, 'rgba(255,255,255,0)');
            lineGrad.addColorStop(0.4, `rgba(255,255,255,${0.12 + pulse * 0.08})`);
            lineGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 1.2;

            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx, fy + 80);
            ctx.stroke();
        }

        ctx.restore();
    },

    render: function(gameState) {
        if (!this.ctx) return;

        const renderer = this;
        const { camera, player, monsters, auras, projectiles, hitboxes, effects, floatingTexts, targetUI, isDebugView } = gameState;
        const ctx = this.ctx;
        const canvas = this.canvas;
        const GROUND_BASE_Y = this.GROUND_BASE_Y;

        this.drawBackground(gameState);

        ctx.save();
        ctx.translate(-camera.x, 0);
        let renderables = [];

        for (let a of auras) {
            renderables.push({
                y: a.owner.y - 1,
                draw: function() {
                    let drawY = GROUND_BASE_Y + a.owner.y;
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

    const playerPalette = renderer.resolvePlayerPalette(player.renderColor);

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
        const weaponPalette = renderer.resolveWeaponPalette(
            player.meleeWeaponRenderColor,
            "#95a5a6"
        );
        const weaponType = String(player.meleeWeaponRenderType || '').trim().toUpperCase();

        if (weaponType === 'WEAPON_LARGE_SWORD') {
            let sx = player.faceDir === 1 ? pw * 0.30 : -pw * 0.30;
            let bladeW = Math.max(8, pw * 0.12);
            let bladeH = Math.max(40, ph * 0.52);

            ctx.save();
            ctx.translate(sx, -ph * 0.50);
            ctx.rotate(player.faceDir === 1 ? 0.18 : -0.18);

            let bladeGrad = ctx.createLinearGradient(0, -bladeH / 2, 0, bladeH / 2);
            bladeGrad.addColorStop(0, weaponPalette.light);
            bladeGrad.addColorStop(0.45, weaponPalette.mid);
            bladeGrad.addColorStop(1, weaponPalette.dark);

            ctx.fillStyle = bladeGrad;
            ctx.beginPath();
            ctx.moveTo(-bladeW * 0.40, bladeH * 0.46);
            ctx.lineTo(-bladeW * 0.48, -bladeH * 0.18);
            ctx.lineTo(0, -bladeH * 0.56);
            ctx.lineTo(bladeW * 0.48, -bladeH * 0.18);
            ctx.lineTo(bladeW * 0.40, bladeH * 0.46);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = weaponPalette.accent;
            ctx.fillRect(-bladeW * 0.14, -bladeH * 0.34, bladeW * 0.28, bladeH * 0.62);

            ctx.fillStyle = weaponPalette.dark;
            ctx.fillRect(-bladeW * 1.05, bladeH * 0.32, bladeW * 2.1, Math.max(5, ph * 0.035));
            ctx.strokeRect(-bladeW * 1.05, bladeH * 0.32, bladeW * 2.1, Math.max(5, ph * 0.035));

            ctx.fillStyle = "#5b3a29";
            ctx.fillRect(-bladeW * 0.22, bladeH * 0.34, bladeW * 0.44, Math.max(16, ph * 0.18));
            ctx.strokeRect(-bladeW * 0.22, bladeH * 0.34, bladeW * 0.44, Math.max(16, ph * 0.18));

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
        const weaponPalette = renderer.resolveWeaponPalette(
            player.rangeWeaponRenderColor,
            "#2c3e50"
        );
        const weaponType = String(player.rangeWeaponRenderType || '').trim().toUpperCase();

        if (weaponType === 'WEAPON_GUN') {
            let gunX = player.faceDir === 1 ? pw * 0.28 : -pw * 0.28;
            let gunY = -ph * 0.48;
            let gunW = Math.max(24, pw * 0.34);
            let gunH = Math.max(9, ph * 0.08);

            ctx.save();
            ctx.translate(gunX, gunY);
            if (player.faceDir === -1) ctx.scale(-1, 1);

            ctx.fillStyle = weaponPalette.mid;
            ctx.fillRect(0, 0, gunW, gunH);
            ctx.strokeRect(0, 0, gunW, gunH);

            ctx.fillStyle = weaponPalette.dark;
            ctx.fillRect(gunW * 0.62, -gunH * 0.18, gunW * 0.30, gunH * 0.30);
            ctx.strokeRect(gunW * 0.62, -gunH * 0.18, gunW * 0.30, gunH * 0.30);

            ctx.fillStyle = weaponPalette.light;
            ctx.fillRect(gunW * 0.10, gunH * 0.18, gunW * 0.36, gunH * 0.22);

            ctx.fillStyle = weaponPalette.dark;
            ctx.beginPath();
            ctx.moveTo(gunW * 0.28, gunH);
            ctx.lineTo(gunW * 0.50, gunH);
            ctx.lineTo(gunW * 0.38, gunH + gunH * 1.35);
            ctx.lineTo(gunW * 0.18, gunH + gunH * 1.12);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

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
}
                });
            }
        }

const drawMonsterGraphics = (ctx, m, w, h, drawScale, isUI = false) => {
    const d = m.d;
    const face = m.faceDir || 1;
    const isKeraha = String(d.name || '').includes("케라하");
    let hoverY = isKeraha && m.state !== 'P_Die' ? Math.sin(Date.now() / 200 + String(m.id || '').charCodeAt(0)) * 10 : 0;
    if (isUI) hoverY = 0;

    const bodyPalette = renderer.resolveMonsterPalette(m);
    const renderType = String(d.renderType || 'RENDER_HUMAN').trim().toUpperCase();

    const drawStableWeapon = () => {
        const weaponType = String(d.weaponRenderType || '').trim().toUpperCase();
        if (!weaponType) return;
        if (m.state === 'P_Die' || m.state === 'P_Spawn') return;

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
        if (m.state === 'P_Melee_ATK') rot = face === 1 ? 0.22 : -0.22;
        else if (m.state === 'P_Range_ATK') rot = face === 1 ? -0.08 : 0.08;
        else if (m.state === 'P_Hit') rot = face === 1 ? -0.05 : 0.05;
        ctx.rotate(rot);

        const shaftWood = renderer.resolveWeaponPalette('COLOR_WOOD', '#8e5a2b');
        const steel = renderer.resolveWeaponPalette(d.weaponRenderColor || 'COLOR_METAL_SILVER', '#95a5a6');
        const weaponPalette = renderer.resolveWeaponPalette(d.weaponRenderColor, "#8e5a2b");

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
            const axeMetal = renderer.resolveWeaponPalette(
                d.weaponRenderColor === 'COLOR_AXE' ? 'COLOR_DARK_SILVER' : d.weaponRenderColor,
                '#7f8c8d'
            );

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

    if (m.state === 'P_Melee_ATK' && String(d.defType).toLowerCase() === 'superarmor') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "gold";
    }

    renderer.drawModelBody(ctx, {
        renderType: renderType,
        palette: bodyPalette,
        w: w,
        h: h,
        faceDir: face,
        state: m.state,
        isChampion: !!m.isChampion,
        isMonster: true,
        eyeColor: m.state === 'P_Hit' && !isUI ? '#7a0000' : '#111111'
    });

    ctx.shadowBlur = 0;

    if (m.state !== 'P_Die' && m.state !== 'P_Spawn') {
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

    // 바닥 glow
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, flameW * 0.9);
    glow.addColorStop(0, 'rgba(255, 220, 120, 0.32)');
    glow.addColorStop(0.55, 'rgba(255, 140, 40, 0.16)');
    glow.addColorStop(1, 'rgba(255, 120, 20, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(0, flameH * 0.02, flameW * 0.72, flameH * 0.30, 0, 0, Math.PI * 2);
    ctx.fill();

    // 좌측 불꽃
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

    // 중앙 메인 불꽃
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

    // 우측 불꽃
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

    // 내부 심지
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
        drawStableWeapon();
    }

    ctx.restore();
};

        for (let m of monsters) {
            if (m.active) {
                renderables.push({
                    y: m.y,
                    draw: function() {
                        const d = m.d;
                        const w = d.bodyX * m.scale;
                        const dY = d.bodyY * m.scale;
                        const h = d.bodyZ * m.scale;
                        let drawScale = m.state === 'P_Spawn' ? Math.min(1.0, m.timer / 1.0) : 1.0;
                        let drawY = GROUND_BASE_Y + m.y;
                        let bodyY = drawY - m.z;

                        ctx.fillStyle = "rgba(0,0,0,0.6)";
                        ctx.beginPath();
                        ctx.ellipse(m.x, drawY, w / 2 * drawScale + 5, dY / 2 * drawScale, 0, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.save();
                        ctx.translate(m.x, bodyY);
                        drawMonsterGraphics(ctx, m, w, h, drawScale, false);
                        ctx.restore();
                    }
                });
            }
        }

                for (let p of projectiles) {
            renderables.push({
                y: p.y,
                draw: function() {
                    let drawY = GROUND_BASE_Y + p.y;
                    let drawZ = drawY - p.z;
                    const projectileRenderType = String(p.renderType || '').trim();
                    const projectileName = String(p.projName || '').trim();

                    ctx.fillStyle = "rgba(0,0,0,0.4)";
                    ctx.beginPath();
                    ctx.ellipse(p.x, drawY, p.hitX / 2, p.hitY / 2, 0, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.save();
                    ctx.translate(p.x, drawZ);
                    ctx.scale(p.vx > 0 ? 1 : -1, 1);

                    if (projectileRenderType === 'PROJECTILE_SLASH_WAVE' || projectileName.includes("웨이브")) {
                        ctx.beginPath();
                        ctx.arc(0, 0, p.hitX, -Math.PI / 2, Math.PI / 2);
                        ctx.arc(-20, 0, p.hitX, Math.PI / 2, -Math.PI / 2, true);
                        let grad = ctx.createLinearGradient(0, -p.hitZ, 0, p.hitZ);
                        grad.addColorStop(0, "rgba(255,255,255,0.8)");
                        grad.addColorStop(0.5, "rgba(52, 152, 219, 0.9)");
                        grad.addColorStop(1, "rgba(255,255,255,0.8)");
                        ctx.fillStyle = grad;
                        ctx.fill();
                    } else if (projectileRenderType === 'PROJECTILE_ENERGY_BOMB' || projectileName.includes("캐논볼")) {
                        ctx.fillStyle = "rgba(231, 76, 60, 0.8)";
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(-40, -15);
                        ctx.lineTo(-60, 0);
                        ctx.lineTo(-40, 15);
                        ctx.fill();

                        ctx.fillStyle = "#2c3e50";
                        ctx.beginPath();
                        ctx.arc(0, 0, p.hitX / 2, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.fillStyle = "#7f8c8d";
                        ctx.beginPath();
                        ctx.arc(p.hitX / 6, -p.hitX / 6, p.hitX / 6, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (projectileRenderType === 'PROJECTILE_ICE_BOLT' || projectileName.includes("얼음화살")) {
                        ctx.fillStyle = "#3498db";
                        ctx.beginPath();
                        ctx.moveTo(15, 0);
                        ctx.lineTo(-15, -8);
                        ctx.lineTo(-15, 8);
                        ctx.fill();

                        ctx.fillStyle = "#ecf0f1";
                        ctx.beginPath();
                        ctx.moveTo(15, 0);
                        ctx.lineTo(-5, -4);
                        ctx.lineTo(-5, 4);
                        ctx.fill();
                    } else if (projectileRenderType === 'PROJECTILE_ARROW' || projectileName.includes("화살")) {
                        ctx.fillStyle = "#8b4513";
                        ctx.fillRect(-15, -2, 30, 4);
                        ctx.fillStyle = "#bdc3c7";
                        ctx.beginPath();
                        ctx.moveTo(15, -4);
                        ctx.lineTo(25, 0);
                        ctx.lineTo(15, 4);
                        ctx.fill();
                    } else if (projectileRenderType === 'PROJECTILE_STONE' || projectileName.includes("돌멩이")) {
                        ctx.rotate(p.life * 10);
                        ctx.fillStyle = "#7f8c8d";
                        ctx.beginPath();
                        ctx.moveTo(-10, -5);
                        ctx.lineTo(-5, -10);
                        ctx.lineTo(5, -8);
                        ctx.lineTo(10, 0);
                        ctx.lineTo(5, 10);
                        ctx.lineTo(-8, 8);
                        ctx.fill();
                    } else if (projectileRenderType === 'PROJECTILE_BULLET' || projectileName.includes("탄환")) {
                        ctx.rotate(p.vx > 0 ? 0 : Math.PI);
                        ctx.fillStyle = "#f1c40f";
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = "#f39c12";
                        ctx.beginPath();
                        ctx.ellipse(0, 0, p.hitX, p.hitZ / 2, 0, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.fillStyle = "#fff";
                        ctx.beginPath();
                        ctx.ellipse(p.hitX / 2, 0, p.hitX / 4, p.hitZ / 4, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    } else {
                        ctx.rotate(p.vx > 0 ? 0 : Math.PI);
                        ctx.fillStyle = "#f1c40f";
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = "#f39c12";
                        ctx.beginPath();
                        ctx.ellipse(0, 0, p.hitX, p.hitZ / 2, 0, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.fillStyle = "#fff";
                        ctx.beginPath();
                        ctx.ellipse(p.hitX / 2, 0, p.hitX / 4, p.hitZ / 4, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }

                    ctx.restore();
                }
            });
        }

        for (let eff of effects) {
            renderables.push({
                y: eff.y,
            draw: function() {
    let drawY = GROUND_BASE_Y + eff.y;
    let drawZ = drawY - eff.z;

    ctx.save();
    ctx.translate(eff.x, drawZ);

    let alpha = eff.maxLife > 0 ? (eff.life / eff.maxLife) : 1;
    alpha = Math.max(0, Math.min(1, alpha));
    ctx.globalAlpha = alpha;

    if (eff.type === 'slash') {
        const slashW = Math.max(24, eff.w || 80);
        const slashH = Math.max(16, eff.h || 40);
        const renderType = String(eff.renderType || '').trim();
        const isThunderboltSlash = renderType === 'EFT_THUNDERBOLT_SLASH';
        const isLightningSlash = renderType === 'EFT_LIGHTNING_SLASH';

        ctx.scale(eff.dir || 1, 1);

        let grad = ctx.createLinearGradient(-slashW / 2, 0, slashW / 2, 0);
        if (isThunderboltSlash) {
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.18, `rgba(255,255,255,${0.35 * alpha})`);
            grad.addColorStop(0.50, `rgba(241,196,15,${0.98 * alpha})`);
            grad.addColorStop(0.82, `rgba(52,152,219,${0.88 * alpha})`);
            grad.addColorStop(1, "rgba(255,255,255,0)");
        } else if (isLightningSlash) {
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.45, `rgba(255,245,180,${0.9 * alpha})`);
            grad.addColorStop(1, eff.color || "rgba(255,235,150,0.9)");
        } else {
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.50, `rgba(200,255,255,${0.8 * alpha})`);
            grad.addColorStop(1, eff.color || "rgba(255,255,255,0.9)");
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, slashW / 2, slashH / 2, 0, -Math.PI / 2, Math.PI / 2);
        ctx.ellipse(-slashW / 4, 0, slashW / 2, slashH / 2, 0, Math.PI / 2, -Math.PI / 2, true);
        ctx.fill();

        if (isThunderboltSlash) {
            ctx.strokeStyle = `rgba(255,255,255,${0.75 * alpha})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-slashW * 0.22, -slashH * 0.34);
            ctx.lineTo(-slashW * 0.05, -slashH * 0.08);
            ctx.lineTo(slashW * 0.02, -slashH * 0.26);
            ctx.lineTo(slashW * 0.16, 0);
            ctx.lineTo(slashW * 0.07, slashH * 0.06);
            ctx.lineTo(slashW * 0.24, slashH * 0.30);
            ctx.stroke();

            ctx.strokeStyle = `rgba(241,196,15,${0.85 * alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(-slashW * 0.04, 0, Math.max(12, slashH * 0.22), -1.0, 0.9);
            ctx.stroke();
        }
    } else if (eff.type === 'bite') {
    renderer.drawBiteEffect(ctx, eff, alpha);
    } else if (eff.type === 'hitSpark') {
        const renderType = String(eff.renderType || '').trim();
        const burstScale = eff.burstScale || 1;
        const core = eff.color || (renderType === 'EFT_STRIKE' ? "rgba(245,245,245,0.96)" : "rgba(241,196,15,0.95)");
        const accent = eff.accentColor || (renderType === 'EFT_STRIKE' ? "rgba(210,220,230,0.92)" : "rgba(255,255,255,0.95)");

        if (renderType === 'EFT_STRIKE') {
            const r = 24 * burstScale;
            ctx.rotate((eff.dir || 1) * 0.12);

            ctx.strokeStyle = core;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-r, 0);
            ctx.lineTo(r, 0);
            ctx.moveTo(0, -r * 0.78);
            ctx.lineTo(0, r * 0.78);
            ctx.stroke();

            ctx.strokeStyle = accent;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(-r * 0.72, -r * 0.72);
            ctx.lineTo(r * 0.72, r * 0.72);
            ctx.moveTo(-r * 0.72, r * 0.72);
            ctx.lineTo(r * 0.72, -r * 0.72);
            ctx.stroke();

            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.20, 0, Math.PI * 2);
            ctx.fill();
        } else if (renderType === 'EFT_PUNCH') {
          renderer.drawPunchEffect(ctx, eff, alpha);
        } else {
            const r = 18 * burstScale;

            ctx.fillStyle = core;
            for (let i = 0; i < 6; i++) {
                let ang = (Math.PI * 2 / 6) * i + Date.now() / 220;
                let x = Math.cos(ang) * r * 0.55;
                let y = Math.sin(ang) * r * 0.55;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(x * 0.65, y * 0.65);
                ctx.lineTo(x, y);
                ctx.lineTo(x * 0.35, y * 0.35);
                ctx.closePath();
                ctx.fill();
            }

            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (eff.type === 'particle') {
        const pr = Math.max(2, eff.r || 4);
        ctx.fillStyle = eff.color || "rgba(255,255,255,0.95)";

        ctx.beginPath();
        ctx.arc(0, 0, pr, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.55;
        ctx.beginPath();
        ctx.arc(0, 0, pr * 2.2, 0, Math.PI * 2);
        ctx.fill();
    } else if (eff.type === 'warning') {
        const w = Math.max(20, eff.w || 50);
        const d = Math.max(12, eff.d || 30);
        const warningType = String(eff.warningRenderType || eff.renderType || '').trim();
        const pulse = 0.7 + Math.sin(Date.now() / 90) * 0.3;

        if (warningType === 'WARNING_MAGIC_CIRCLE') {
            ctx.strokeStyle = `rgba(80,220,255,${0.85 * alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, w / 2, d / 2, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(255,255,255,${0.55 * alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, w * (0.30 + pulse * 0.08), d * (0.30 + pulse * 0.08), 0, 0, Math.PI * 2);
            ctx.stroke();

            for (let i = 0; i < 6; i++) {
                const ang = (Math.PI * 2 / 6) * i + Date.now() / 600;
                const rx = Math.cos(ang) * w * 0.34;
                const ry = Math.sin(ang) * d * 0.34;
                ctx.fillStyle = `rgba(220,245,255,${0.7 * alpha})`;
                ctx.beginPath();
                ctx.arc(rx, ry, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.fillStyle = `rgba(255, 70, 70, ${0.18 + pulse * 0.16})`;
            ctx.fillRect(-w / 2, -d / 2, w, d);

            ctx.strokeStyle = `rgba(255, 160, 160, ${0.75 * alpha})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(-w / 2, -d / 2, w, d);
        }
    } else if (eff.type === 'lightning') {
        const w = Math.max(20, eff.w || 60);
        const h = Math.max(80, eff.h || 300);
        const d = Math.max(10, eff.d || 24);

        let lGrad = ctx.createLinearGradient(0, -h, 0, 0);
        lGrad.addColorStop(0, "rgba(241,196,15,0)");
        lGrad.addColorStop(0.35, `rgba(255,255,255,${0.95 * alpha})`);
        lGrad.addColorStop(0.65, `rgba(241,196,15,${0.95 * alpha})`);
        lGrad.addColorStop(1, "rgba(241,196,15,0)");
        ctx.fillStyle = lGrad;
        ctx.fillRect(-w / 2, -h, w, h);

        ctx.fillStyle = `rgba(255,255,255,${0.95 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, d / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255,255,255,${0.75 * alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w * 0.12, -h * 0.72);
        ctx.lineTo(w * 0.08, -h * 0.45);
        ctx.lineTo(-w * 0.06, -h * 0.18);
        ctx.lineTo(0, 0);
        ctx.stroke();
    } else if (eff.type === 'ice_needle' || eff.type === 'ice_strike') {
        const w = Math.max(24, eff.w || 50);
        const h = Math.max(50, eff.h || 120);

        ctx.strokeStyle = "rgba(120, 240, 255, 0.95)";
        ctx.lineWidth = 4;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w / 2, 0);
        ctx.lineTo(w / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(173,216,230,0.75)";
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w / 4, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        } else if (eff.type === 'ghost') {
        ctx.rotate((eff.faceDir || 1) * 15 * Math.PI / 180);
        ctx.globalAlpha = alpha * 0.42;

        const pw = eff.w;
        const ph = eff.h;
        const ghostPalette = renderer.resolvePlayerPalette(player.renderColor);

        renderer.drawModelBody(ctx, {
            renderType: player.renderType || 'RENDER_HUMAN',
            palette: {
                dark: ghostPalette.dark,
                mid: ghostPalette.mid,
                light: ghostPalette.light
            },
            w: pw,
            h: ph,
            faceDir: eff.faceDir || 1,
            state: 'Dash',
            isChampion: false,
            isMonster: false,
            eyeColor: 'rgba(0,0,0,0)'
        });
    }

    ctx.restore();
}
            });
        }

        renderables.sort((a, b) => a.y - b.y);
        renderables.forEach(r => r.draw());
        ctx.globalAlpha = 1.0;

        this.drawStageWarp(gameState);

        if (isDebugView) {
            if (player.active && player.hp > 0) {
                let drawY = GROUND_BASE_Y + player.y;
                let pw = player.bodyX * player.scale;
                let pd = player.bodyY * player.scale;
                let ph = player.bodyZ * player.scale;
                ctx.strokeStyle = "#3498db";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(player.x, drawY, pw / 2, pd / 2, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeRect(player.x - pw / 2, drawY - player.z - ph, pw, ph);
            }

            for (let m of monsters) {
                if (m.active && m.hp > 0) {
                    const d = m.d;
                    const w = d.bodyX * m.scale;
                    const dY = d.bodyY * m.scale;
                    const h = d.bodyZ * m.scale;
                    let drawY = GROUND_BASE_Y + m.y;

                    ctx.strokeStyle = m.isChampion ? '#e74c3c' : renderer.resolveMonsterBodyColor(m);
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.ellipse(m.x, drawY, w / 2, dY / 2, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.strokeRect(m.x - w / 2, drawY - m.z - h, w, h);

                    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.beginPath();
                    ctx.ellipse(m.x, drawY, d.unrecog + w / 2, (d.unrecog + w / 2) * 0.5, 0, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.strokeStyle = "rgba(255, 235, 59, 0.8)";
                    ctx.beginPath();
                    ctx.ellipse(m.x, drawY, d.recog + w / 2, (d.recog + w / 2) * 0.5, 0, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.strokeStyle = "rgba(255, 152, 0, 1.0)";
                    ctx.beginPath();
                    ctx.ellipse(m.x, drawY, d.chase + w / 2, (d.chase + w / 2) * 0.5, 0, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.strokeStyle = "rgba(244, 67, 54, 1.0)";
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.ellipse(m.x, drawY, d.atkRange + w / 2, (d.atkRange + w / 2) * 0.5, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }

            for (let hb of hitboxes) {
                let drawY = GROUND_BASE_Y + hb.y;
                ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                ctx.beginPath();
                ctx.ellipse(hb.x, drawY, hb.w / 2, hb.d / 2, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.strokeRect(hb.x - hb.w / 2, drawY - hb.z - hb.h, hb.w, hb.h);
            }

            if (gameState.activeWarp) {
                const w = gameState.activeWarp;
                const x = w.x - w.w / 2;
                const y = this.GROUND_BASE_Y + w.y - w.h / 2;
                ctx.save();
                ctx.strokeStyle = 'rgba(255,0,255,0.85)';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w.w, w.h);
                ctx.restore();
            }
        }

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            let ft = floatingTexts[i];
            let drawY = GROUND_BASE_Y + ft.y - ft.z;
            ctx.globalAlpha = ft.timer;
            ctx.font = `900 ${ft.size} Arial`;
            ctx.textAlign = "center";

            if (ft.isBubble) {
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                let textW = ctx.measureText(ft.text).width + 16;
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(ft.x - textW / 2, drawY - 20, textW, 24, 6);
                } else {
                    ctx.rect(ft.x - textW / 2, drawY - 20, textW, 24);
                }
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = "black";
                ctx.fillText(ft.text, ft.x, drawY - 4);
            } else {
                ctx.lineWidth = 4;
                ctx.strokeStyle = "black";
                ctx.strokeText(ft.text, ft.x, drawY);
                ctx.fillStyle = ft.color;
                ctx.fillText(ft.text, ft.x, drawY);
            }
            ctx.globalAlpha = 1.0;
        }

        ctx.restore();

        if (targetUI.timer > 0 && targetUI.monster) {
            let tm = targetUI.monster;
            let d = tm.d;
            let alpha = Math.min(1.0, targetUI.timer);
            ctx.globalAlpha = alpha;
            ctx.save();
            ctx.translate(canvas.width / 2, 55);

            let isBoss = d.grade === 'Boss';
            let borderColor = isBoss ? '#f1c40f' : (tm.isChampion ? '#bdc3c7' : '#555');
            let borderWidth = isBoss ? 5 : (tm.isChampion ? 4 : 2);

            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(-300, 0, 600, 60);
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = borderColor;
            ctx.strokeRect(-300, 0, 600, 60);

            if (isBoss) {
                ctx.fillStyle = "#f1c40f";
                ctx.font = "40px Arial";
                ctx.textAlign = "center";
                ctx.fillText("☠️", 0, -5);
            } else if (tm.isChampion) {
                ctx.fillStyle = "#bdc3c7";
                ctx.beginPath();
                ctx.moveTo(-20, 0);
                ctx.lineTo(0, -15);
                ctx.lineTo(20, 0);
                ctx.fill();
            }

            ctx.fillStyle = "#333";
            ctx.fillRect(-290, 5, 50, 50);
            ctx.save();
            ctx.beginPath();
            ctx.rect(-290, 5, 50, 50);
            ctx.clip();

            let w = d.bodyX * tm.scale;
            let h = d.bodyZ * tm.scale;
            let baseSize = Math.max(w, h * 0.6);
            let uiScale = 45 / baseSize;
            let offsetY = 30 + (h * 0.85 * uiScale);

            ctx.translate(-265, offsetY);
            ctx.scale(uiScale, uiScale);

            let originalDir = tm.faceDir;
            tm.faceDir = 1;
            drawMonsterGraphics(ctx, tm, w, h, 1.0, true);
            tm.faceDir = originalDir;

            ctx.restore();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(-290, 5, 50, 50);

            ctx.fillStyle = "white";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "left";
            let prefix = tm.isChampion ? "[엘리트] " : (isBoss ? "[보스] " : "");
            ctx.fillStyle = isBoss ? "#f1c40f" : (tm.isChampion ? "#bdc3c7" : "white");
            ctx.fillText(`Lv.${d.level} ${prefix}${d.name}`, -225, 22);

            ctx.fillStyle = "#222";
            ctx.fillRect(-225, 32, 510, 18);
            let hpRatio = Math.max(0, tm.hp) / tm.maxHp;
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(-225, 32, 510 * hpRatio, 18);

            ctx.fillStyle = "white";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`${Math.max(0, tm.hp).toFixed(0)} / ${tm.maxHp.toFixed(0)}`, 30, 45);

            ctx.restore();
            ctx.globalAlpha = 1.0;
        }
    }
};