// [카시야스 보스전] 스테이지/배경/워프 렌더링 (stage_renderer.js)
GameRenderer.themePresets = {
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
    },
    RENDER_KASIYAS_ARENA: {
        skyTop: '#321d27',
        skyBottom: '#8b4a3d',
        groundTop: '#8b5f54',
        groundBottom: '#4c3538',
        mountain: '#5e3b40',
        cloud: 'rgba(70,45,55,0.42)',
        fog: 'rgba(130,55,45,0.13)',
        grass: 'rgba(78, 48, 44, 0.26)',
        grassStroke: 'rgba(150, 88, 70, 0.32)',
        warpA: 'rgba(190, 48, 38, 0.20)',
        warpB: 'rgba(255, 120, 90, 0.35)'
    }
};

GameRenderer.rebuildStageBackground = function(stage, worldWidth, worldDepth) {
    // 정적 배경 오프스크린 캐시는 배경 데이터 재구성 시 무효화한다.
    this._stageBackgroundCache = null;
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
};

GameRenderer.getTheme = function(gameState) {
    const key = (gameState && gameState.currentStage && gameState.currentStage.Stage_Background_Type)
        ? gameState.currentStage.Stage_Background_Type
        : this.currentTheme;
    return this.themePresets[key] || this.themePresets.DEFAULT;
};

GameRenderer._drawBackgroundDirect = function(gameState) {
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

    if (themeKey === 'RENDER_KASIYAS_ARENA') {
        const ruinColor = 'rgba(73,45,48,0.70)';
        const ruinStroke = 'rgba(30,18,22,0.72)';
        for (let i = 0; i < 7; i++) {
            const bx = ((i * 245 + 60) - camera.x * 0.32) % (canvas.width + 420);
            const x = bx < -210 ? bx + canvas.width + 420 : bx;
            const base = GROUND_BASE_Y - 18 + (i % 3) * 9;
            ctx.save();
            ctx.translate(x, base);
            ctx.rotate(((i % 2) ? -1 : 1) * (0.08 + (i % 3) * 0.035));
            ctx.fillStyle = ruinColor;
            ctx.strokeStyle = ruinStroke;
            ctx.lineWidth = 2;
            if (i % 3 === 0) {
                ctx.fillRect(-26, -92, 52, 92);
                ctx.strokeRect(-26, -92, 52, 92);
                ctx.fillRect(-36, -104, 72, 16);
                ctx.strokeRect(-36, -104, 72, 16);
            } else if (i % 3 === 1) {
                ctx.fillRect(-70, -36, 140, 28);
                ctx.strokeRect(-70, -36, 140, 28);
                ctx.beginPath();
                ctx.moveTo(-66, -36); ctx.lineTo(-28, -70); ctx.lineTo(55, -48); ctx.lineTo(70, -36); ctx.closePath();
                ctx.fill(); ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(-42, 0); ctx.lineTo(-14, -58); ctx.lineTo(20, -70); ctx.lineTo(36, 0); ctx.closePath();
                ctx.fill(); ctx.stroke();
            }
            ctx.restore();
        }
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

    if (themeKey === 'RENDER_KASIYAS_ARENA') {
        ctx.save();
        ctx.strokeStyle = 'rgba(35,22,24,0.28)';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 120; i++) {
            const wx = ((i * 127) - camera.x) % (canvas.width + 180);
            const sx = wx < -90 ? wx + canvas.width + 180 : wx;
            const wy = GROUND_BASE_Y + ((i * 67) % Math.max(1, WORLD_DEPTH));
            const rw = 38 + (i % 5) * 9;
            const rh = 16 + (i % 4) * 5;
            ctx.beginPath();
            ctx.moveTo(sx - rw * 0.5, wy - rh * 0.2);
            ctx.lineTo(sx + rw * 0.36, wy - rh * 0.36);
            ctx.lineTo(sx + rw * 0.50, wy + rh * 0.18);
            ctx.lineTo(sx - rw * 0.32, wy + rh * 0.42);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(170,80,58,0.08)';
        ctx.fillRect(0, GROUND_BASE_Y, canvas.width, canvas.height - GROUND_BASE_Y);
        ctx.restore();
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
};


// 2차 성능 최적화: 일반 전장의 정적 배경을 오프스크린 Canvas에 캐시한다.
// 현재 카시야스 전장은 카메라 X가 대부분 고정이지만, 향후 스테이지 확장을 고려해
// camera.x까지 키에 포함하므로 카메라가 실제로 움직일 때도 화면 결과는 기존과 동일하다.
GameRenderer.drawBackground = function(gameState) {
    const ctx = this.ctx;
    const canvas = this.canvas;
    if (!ctx || !canvas) return;

    const cameraX = Number.isFinite(parseFloat(gameState && gameState.camera && gameState.camera.x))
        ? parseFloat(gameState.camera.x)
        : 0;
    const worldDepth = Number.isFinite(parseFloat(gameState && gameState.WORLD_DEPTH))
        ? parseFloat(gameState.WORLD_DEPTH)
        : 0;
    const themeKey = (gameState && gameState.currentStage && gameState.currentStage.Stage_Background_Type)
        ? gameState.currentStage.Stage_Background_Type
        : this.currentTheme;
    const key = [canvas.width, canvas.height, this.GROUND_BASE_Y, worldDepth, themeKey || 'DEFAULT', cameraX].join('|');

    let cache = this._stageBackgroundCache;
    if (!cache || cache.key !== key || !cache.canvas) {
        const offscreen = document.createElement('canvas');
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const offctx = offscreen.getContext('2d');

        const prevCanvas = this.canvas;
        const prevCtx = this.ctx;
        try {
            this.canvas = offscreen;
            this.ctx = offctx;
            this._drawBackgroundDirect(gameState);
        } finally {
            this.canvas = prevCanvas;
            this.ctx = prevCtx;
        }
        cache = this._stageBackgroundCache = { key, canvas: offscreen };
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cache.canvas, 0, 0);
};

GameRenderer.drawStageWarp = function(gameState) {
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
};
