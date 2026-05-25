// [카시야스 보스전] 디버그 렌더링 (debug_renderer.js)
GameRenderer.drawDebugOverlay = function(ctx, gameState) {
    const renderer = this;
    const { player, monsters, hitboxes, activeWarp } = gameState;
    const GROUND_BASE_Y = this.GROUND_BASE_Y;

    const getRangeDebugYScale = () => {
        const width = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1);
        const depth = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 1);
        const correctedScale = (depth / width) * 1.5;
        return Math.max(0.35, Math.min(0.6, correctedScale));
    };

    const rangeYScale = getRangeDebugYScale();

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

            const drawWeightedRangeEllipse = (range, color, lineDash = []) => {
                const safeRange = Math.max(0, parseFloat(range) || 0);
                if (safeRange <= 0) return;

                const radiusX = safeRange + w / 2;
                const radiusY = (safeRange * rangeYScale) + dY / 2;

                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.setLineDash(lineDash);
                ctx.beginPath();
                ctx.ellipse(m.x, drawY, radiusX, radiusY, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            };

            const drawAttackStartEllipse = () => {
                const safeRange = Math.max(0, parseFloat(d.atkRange) || 0);
                if (safeRange <= 0) return;

                const radiusX = safeRange + w / 2;
                const radiusY = 30 + dY / 2;

                ctx.save();
                ctx.strokeStyle = "rgba(244, 67, 54, 1.0)";
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.ellipse(m.x, drawY, radiusX, radiusY, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            };

            const drawProjectileThreatLane = () => {
                const isRangeMonster = String(d.atkType || '').toLowerCase() === 'range';
                if (!isRangeMonster) return;

                const projSpeed = Math.max(0, parseFloat(d.projSpeed) || 0);
                const projLife = Math.max(0, parseFloat(d.projLife) || 0);
                const projDistance = projSpeed * projLife;
                if (projDistance <= 0) return;

                const dir = m.faceDir >= 0 ? 1 : -1;
                const hitW = Math.max(8, (parseFloat(d.hitX) || 20) * m.scale);
                const hitD = Math.max(8, (parseFloat(d.hitY) || 12) * m.scale);

                const startOffset = Math.max(w / 2, hitW * 0.35);
                const startX = m.x + dir * startOffset;
                const unclampedEndX = startX + dir * projDistance;
                const endX = Math.max(0, Math.min(gameState.WORLD_WIDTH, unclampedEndX));

                const laneX = Math.min(startX, endX);
                const laneW = Math.abs(endX - startX);
                const laneH = Math.max(12, hitD);

                if (laneW <= 0) return;

                ctx.save();

                ctx.fillStyle = "rgba(255, 152, 0, 0.16)";
                ctx.strokeStyle = "rgba(255, 152, 0, 0.95)";
                ctx.lineWidth = 2;
                ctx.setLineDash([10, 6]);

                if (typeof ctx.roundRect === 'function') {
                    ctx.beginPath();
                    ctx.roundRect(laneX, drawY - laneH / 2, laneW, laneH, Math.min(10, laneH / 2));
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillRect(laneX, drawY - laneH / 2, laneW, laneH);
                    ctx.strokeRect(laneX, drawY - laneH / 2, laneW, laneH);
                }

                ctx.setLineDash([]);
                ctx.strokeStyle = "rgba(255, 210, 120, 0.95)";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(startX, drawY);
                ctx.lineTo(endX, drawY);
                ctx.stroke();

                ctx.fillStyle = "rgba(255, 180, 80, 0.20)";
                ctx.strokeStyle = "rgba(255, 180, 80, 0.95)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(endX, drawY, hitW / 2, laneH / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            };

            ctx.strokeStyle = m.isChampion ? '#e74c3c' : renderer.resolveMonsterBodyColor(m);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(m.x, drawY, w / 2, dY / 2, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeRect(m.x - w / 2, drawY - m.z - h, w, h);

            drawWeightedRangeEllipse(d.unrecog, "rgba(255, 255, 255, 0.5)");
            drawWeightedRangeEllipse(d.recog, "rgba(255, 235, 59, 0.8)");
            drawWeightedRangeEllipse(d.chase, "rgba(255, 152, 0, 1.0)");
            drawWeightedRangeEllipse(d.evade, "rgba(0, 255, 255, 0.9)", [8, 6]);
            drawAttackStartEllipse();
            drawProjectileThreatLane();
        }
    }

    for (let hb of hitboxes) {
        if (hb.type === 'path') {
            const sx = hb.startX || 0;
            const sy = GROUND_BASE_Y + (hb.startY || 0);
            const ex = hb.endX || 0;
            const ey = GROUND_BASE_Y + (hb.endY || 0);
            const dx = ex - sx;
            const dy = ey - sy;
            const len = Math.sqrt(dx * dx + dy * dy) || 0;
            const angle = Math.atan2(dy, dx);

            ctx.save();
            ctx.translate((sx + ex) / 2, (sy + ey) / 2);
            ctx.rotate(angle);
            ctx.fillStyle = "rgba(255, 0, 0, 0.22)";
            ctx.fillRect(-len / 2, -hb.d / 2, len, hb.d);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(-len / 2, -hb.d / 2, len, hb.d);
            ctx.restore();
            continue;
        }

        let drawY = GROUND_BASE_Y + hb.y;
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(hb.x, drawY, hb.w / 2, hb.d / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(hb.x - hb.w / 2, drawY - hb.z - hb.h, hb.w, hb.h);
    }

    if (activeWarp) {
        const w = activeWarp;
        const x = w.x - w.w / 2;
        const y = GROUND_BASE_Y + w.y - w.h / 2;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,0,255,0.85)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w.w, w.h);
        ctx.restore();
    }
};
