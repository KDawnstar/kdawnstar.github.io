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
    }
};

GameRenderer.rebuildStageBackground = function(stage, worldWidth, worldDepth) {
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

GameRenderer.drawBackground = function(gameState) {
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