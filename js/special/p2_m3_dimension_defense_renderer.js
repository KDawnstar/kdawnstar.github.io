// [카시야스 보스전] 2페이즈 대형 패턴3 차원 방어전 전용 렌더러
// ==========================================
// step208:
// - 거대 검기 상하 반전, 불필요한 보조선 정리
// - 배경 색상 반전을 더 강하게 적용하고 어둡게 보정
// - 전용 상단 상태창 제거, 기존 HUD 문법의 하단 표시로 통합
// ==========================================

(function() {
    if (typeof GameRenderer === 'undefined' || !GameRenderer) return;

    const V = { fieldW: 480, fieldH: 760, spawnY: 78, warningTopY: 44, playerGroundY: 690, floorY: 720 };

    GameRenderer.getP2M3Layout = function(canvas) {
        const w = canvas ? canvas.width : 1600;
        const h = canvas ? canvas.height : 900;
        const fieldH = Math.min(760, h * 0.95);
        const fieldW = fieldH * 9 / 16;
        const scale = fieldH / V.fieldH;
        const left = (w - fieldW) / 2;
        const top = (h - fieldH) / 2;
        const laneW = fieldW / 3;
        const mapY = (y) => top + y * scale;
        return {
            w, h, fieldW, fieldH, left, top, laneW, scale,
            bottom: top + fieldH,
            spawnY: mapY(V.spawnY),
            warningTopY: mapY(V.warningTopY),
            playerGroundY: mapY(V.playerGroundY),
            floorY: mapY(V.floorY),
            v: V,
            mapY
        };
    };

    GameRenderer.getP2M3LaneCenterX = function(layout, lane) {
        const idx = Math.max(0, Math.min(2, parseFloat(lane) || 0));
        return layout.left + layout.laneW * (idx + 0.5);
    };


    GameRenderer.getP2M3SlashTheme = function(slash, fallbackType) {
        const renderType = String(fallbackType || slash && slash.data && slash.data.Slash_Render_Type || '').toUpperCase();
        const category = String(slash && slash.data && slash.data.Slash_Category || '').toUpperCase();
        if (renderType.indexOf('KASIYAS_FINAL') >= 0 || category.indexOf('FINAL') >= 0) {
            return { key: 'final', main: '#ff3c38', light: '#ffe1a0', dark: '#16050a', glow: 'rgba(255,45,35,0.86)', shard: 'rgba(255,72,54,0.95)' };
        }
        if (renderType.indexOf('GIANT') >= 0 || category.indexOf('GIANT') >= 0) {
            return { key: 'giant', main: '#b5182e', light: '#ffad6e', dark: '#10070c', glow: 'rgba(255,45,35,0.82)', shard: 'rgba(255,76,55,0.96)' };
        }
        if (renderType.indexOf('APOSTLE') >= 0 || category.indexOf('APOSTLE') >= 0) {
            return { key: 'apostle', main: '#d5274d', light: '#ff8aa4', dark: '#07030a', glow: 'rgba(225,30,85,0.75)', shard: 'rgba(255,65,115,0.95)' };
        }
        if (renderType.indexOf('X_SLASH') >= 0 || category.indexOf('X') >= 0) {
            return { key: 'x', main: '#ff3838', light: '#ffd4c0', dark: '#3b0710', glow: 'rgba(255,48,48,0.68)', shard: 'rgba(255,85,75,0.94)' };
        }
        return { key: 'normal', main: '#62c9ff', light: '#ecfbff', dark: '#072445', glow: 'rgba(80,180,255,0.65)', shard: 'rgba(135,225,255,0.95)' };
    };

    GameRenderer.drawP2M3HexTiles = function(ctx, x, y, w, h, scale, alpha) {
        const size = Math.max(14, 24 * scale);
        const hexH = Math.sqrt(3) * size;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineWidth = Math.max(1, 1.2 * scale);
        for (let row = -1; row < h / hexH + 2; row++) {
            for (let col = -1; col < w / (size * 1.5) + 2; col++) {
                const cx = x + col * size * 1.5 + ((row % 2) ? size * 0.75 : 0);
                const cy = y + row * hexH * 0.5;
                const shade = (row + col) % 3 === 0 ? 0.13 : 0.08;
                ctx.fillStyle = `rgba(120,125,140,${shade})`;
                ctx.strokeStyle = `rgba(210,210,225,${0.08 + shade})`;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const a = Math.PI / 6 + Math.PI * 2 * i / 6;
                    const px = cx + Math.cos(a) * size;
                    const py = cy + Math.sin(a) * size;
                    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
        ctx.restore();
    };

    GameRenderer.drawP2M3RiftStreaks = function(ctx, x, y, w, h, t, density, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        for (let i = 0; i < density; i++) {
            const rx = x + ((i * 137.5 + Math.sin(t * 0.7 + i) * 42) % Math.max(1, w));
            const ry = y + ((i * 83.3 + t * (22 + i % 5 * 6)) % (h + 140)) - 70;
            const len = 38 + (i % 5) * 17;
            const hueA = i % 4 === 0 ? 'rgba(255,70,100,0.28)' : 'rgba(160,80,255,0.20)';
            ctx.strokeStyle = hueA;
            ctx.lineWidth = 1 + (i % 3) * 0.8;
            ctx.beginPath();
            ctx.moveTo(rx, ry - len * 0.45);
            ctx.bezierCurveTo(rx + Math.sin(i * 1.9) * 18, ry - len * 0.12, rx - Math.cos(i * 1.3) * 16, ry + len * 0.2, rx + Math.sin(t + i) * 24, ry + len * 0.56);
            ctx.stroke();
        }
        ctx.restore();
    };

    GameRenderer.drawP2M3DimensionFrame = function(ctx, layout, rt) {
        const t = rt.timer || 0;
        const introOnlyBackground = !!(rt && rt.phase === 'INTRO' && rt.isPatternLinked);
        ctx.save();
        ctx.shadowColor = 'rgba(185,75,255,0.58)';
        ctx.shadowBlur = 22 * layout.scale;
        ctx.lineWidth = 5 * layout.scale;
        ctx.strokeStyle = 'rgba(218,176,255,0.60)';
        this.roundRect(ctx, layout.left - 3 * layout.scale, layout.top - 3 * layout.scale, layout.fieldW + 6 * layout.scale, layout.fieldH + 6 * layout.scale, 20 * layout.scale);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2 * layout.scale;
        ctx.strokeStyle = 'rgba(255,95,115,0.48)';
        ctx.setLineDash([16 * layout.scale, 8 * layout.scale]);
        this.roundRect(ctx, layout.left + 8 * layout.scale, layout.top + 8 * layout.scale, layout.fieldW - 16 * layout.scale, layout.fieldH - 16 * layout.scale, 14 * layout.scale);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let i = 0; i < 8; i++) {
            const side = i % 4;
            let px = layout.left, py = layout.top;
            if (side === 0) { px += layout.fieldW * ((i + 1) / 9); py -= 5 * layout.scale; }
            if (side === 1) { px += layout.fieldW + 5 * layout.scale; py += layout.fieldH * ((i - 1) / 7); }
            if (side === 2) { px += layout.fieldW * ((8 - i) / 9); py += layout.fieldH + 5 * layout.scale; }
            if (side === 3) { px -= 5 * layout.scale; py += layout.fieldH * ((i - 5) / 5); }
            ctx.fillStyle = `rgba(255,${120 + (i % 3) * 35},${160 + (i % 2) * 50},${0.22 + Math.sin(t * 2 + i) * 0.06})`;
            ctx.beginPath();
            ctx.arc(px, py, (3 + (i % 2) * 2) * layout.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    GameRenderer.renderP2M3DimensionDefense = function(gameState) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        if (!ctx || !canvas) return;
        const rt = gameState && gameState.p2m3DefenseRuntime;
        if (!rt) return;
        const layout = this.getP2M3Layout(canvas);

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const introLinked = rt.phase === 'INTRO' && rt.isPatternLinked;
        this.drawP2M3Background(ctx, canvas, layout, rt);
        if (introLinked && typeof this.drawP2M3IntroArrivalOverlay === 'function') {
            this.drawP2M3IntroArrivalOverlay(ctx, canvas, layout, rt, 'under');
            this.drawP2M3Player(ctx, layout, rt, gameState);
            this.drawP2M3IntroArrivalOverlay(ctx, canvas, layout, rt, 'over');
            // 낙하/착지/기상 연출 중에는 차원문, 9:16 경계선, 전용 UI를 숨기고 배경과 플레이어만 보여준다.
            ctx.restore();
            return;
        }
        this.drawP2M3Lanes(ctx, layout, rt);
        this.drawP2M3TopPortal(ctx, layout, rt);
        this.drawP2M3Slashes(ctx, layout, rt);
        this.drawP2M3SkillWaves(ctx, layout, rt);
        this.drawP2M3Effects(ctx, layout, rt);
        this.drawP2M3Player(ctx, layout, rt, gameState);
        if (rt.phase === 'ENDING') this.drawP2M3OutroOverlay(ctx, canvas, layout, rt);
        this.drawP2M3Hud(ctx, canvas, layout, rt);
        ctx.restore();
    };


    
    GameRenderer.drawP2M3Background = function(ctx, canvas, layout, rt) {
        const t = rt.timer || 0;
        const introOnlyBackground = !!(rt && rt.phase === 'INTRO' && rt.isPatternLinked);
        ctx.save();
        // step206: 완전히 다른 차원 배경이 아니라 기존 카시야스 결투장 맵을 기반으로 한 전용 필드.
        const arena = (this.themePresets && this.themePresets.RENDER_KASIYAS_ARENA) || {
            skyTop: '#321d27', skyBottom: '#8b4a3d', groundTop: '#8b5f54', groundBottom: '#4c3538', mountain: '#5e3b40'
        };
        const horizonY = Math.max(210, Math.min(canvas.height * 0.48, layout.floorY - 270 * layout.scale));
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, arena.skyTop || '#321d27');
        skyGrad.addColorStop(1, arena.skyBottom || '#8b4a3d');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, horizonY);

        // 기존 결투장 느낌의 원경 폐허/지형 실루엣.
        ctx.fillStyle = 'rgba(73,45,48,0.70)';
        ctx.strokeStyle = 'rgba(30,18,22,0.72)';
        ctx.lineWidth = 2 * layout.scale;
        for (let i = 0; i < 8; i++) {
            const x = ((i * 245 + 70 + Math.sin(i * 1.7) * 30) % (canvas.width + 220)) - 90;
            const base = horizonY + 8 + (i % 3) * 9;
            ctx.save();
            ctx.translate(x, base);
            ctx.rotate(((i % 2) ? -1 : 1) * (0.08 + (i % 3) * 0.03));
            if (i % 3 === 0) {
                ctx.fillRect(-24, -82, 48, 82); ctx.strokeRect(-24, -82, 48, 82);
                ctx.fillRect(-34, -94, 68, 14); ctx.strokeRect(-34, -94, 68, 14);
            } else if (i % 3 === 1) {
                ctx.fillRect(-62, -32, 124, 25); ctx.strokeRect(-62, -32, 124, 25);
                ctx.beginPath(); ctx.moveTo(-58, -32); ctx.lineTo(-25, -62); ctx.lineTo(50, -45); ctx.lineTo(62, -32); ctx.closePath(); ctx.fill(); ctx.stroke();
            } else {
                ctx.beginPath(); ctx.moveTo(-38, 0); ctx.lineTo(-12, -52); ctx.lineTo(19, -64); ctx.lineTo(34, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
            }
            ctx.restore();
        }

        const groundGrad = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
        groundGrad.addColorStop(0, arena.groundTop || '#8b5f54');
        groundGrad.addColorStop(1, arena.groundBottom || '#4c3538');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

        // 기존 카시야스 결투장 바닥의 각진 판석 선. 전체 화면에도 동일하게 깔아 별개 게임 느낌을 줄인다.
        ctx.save();
        ctx.strokeStyle = 'rgba(35,22,24,0.34)';
        ctx.lineWidth = 1.35 * layout.scale;
        for (let i = 0; i < 135; i++) {
            const sx = ((i * 127 + (i % 7) * 19) % (canvas.width + 180)) - 90;
            const sy = horizonY + ((i * 67 + (i % 5) * 23) % Math.max(1, canvas.height - horizonY + 60));
            const rw = 38 + (i % 5) * 9;
            const rh = 16 + (i % 4) * 5;
            ctx.beginPath();
            ctx.moveTo(sx - rw * 0.5, sy - rh * 0.2);
            ctx.lineTo(sx + rw * 0.36, sy - rh * 0.36);
            ctx.lineTo(sx + rw * 0.50, sy + rh * 0.18);
            ctx.lineTo(sx - rw * 0.32, sy + rh * 0.42);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(170,80,58,0.08)';
        ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);
        ctx.restore();

        if (!introOnlyBackground) {
        // 차원 방어전용 영역은 기존 맵 위에 차원 장막을 얹은 느낌. 내부를 과하게 흐리게 덮지 않는다.
        ctx.save();
        ctx.fillStyle = 'rgba(45,18,35,0.16)';
        this.roundRect(ctx, layout.left, layout.top, layout.fieldW, layout.fieldH, 14 * layout.scale);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,188,150,0.34)';
        ctx.lineWidth = 2.0 * layout.scale;
        this.roundRect(ctx, layout.left, layout.top, layout.fieldW, layout.fieldH, 14 * layout.scale);
        ctx.stroke();

        // 필드 하단 지면/라인은 기존 맵 판석보다 더 선명하게 표시한다.
        const floorTop = layout.floorY - 78 * layout.scale;
        const floorGrad = ctx.createLinearGradient(layout.left, floorTop, layout.left, layout.bottom);
        floorGrad.addColorStop(0, 'rgba(105,73,68,0.84)');
        floorGrad.addColorStop(0.42, 'rgba(75,54,55,0.92)');
        floorGrad.addColorStop(1, 'rgba(30,22,27,0.96)');
        ctx.fillStyle = floorGrad;
        this.roundRect(ctx, layout.left + 10 * layout.scale, floorTop, layout.fieldW - 20 * layout.scale, layout.bottom - floorTop - 10 * layout.scale, 10 * layout.scale);
        ctx.fill();
        this.drawP2M3HexTiles(ctx, layout.left + 10 * layout.scale, floorTop, layout.fieldW - 20 * layout.scale, layout.bottom - floorTop - 10 * layout.scale, layout.scale, 0.42);

        ctx.strokeStyle = 'rgba(20,14,18,0.78)';
        ctx.lineWidth = 3 * layout.scale;
        ctx.beginPath(); ctx.moveTo(layout.left + 12 * layout.scale, layout.floorY); ctx.lineTo(layout.left + layout.fieldW - 12 * layout.scale, layout.floorY); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,214,155,0.22)';
        ctx.lineWidth = 1.6 * layout.scale;
        ctx.beginPath(); ctx.moveTo(layout.left + 12 * layout.scale, layout.floorY - 4 * layout.scale); ctx.lineTo(layout.left + layout.fieldW - 12 * layout.scale, layout.floorY - 4 * layout.scale); ctx.stroke();

        // 중앙 필드의 차원 균열/입자는 절제해서, 기존 맵이 보이도록 한다.
        this.drawP2M3RiftStreaks(ctx, layout.left + 18 * layout.scale, layout.top + 16 * layout.scale, layout.fieldW - 36 * layout.scale, layout.fieldH - 110 * layout.scale, t, 16, 0.24);
        ctx.restore();
        }

        // step207: 현재 결투장 기반 배경 구조는 유지하고, 색상 반전 + 어두운 차원 틴트만 얹어
        // '같은 맵이 다른 차원에서 뒤집힌' 느낌을 만든다.
        ctx.save();
        // step208: 단순 보라 틴트가 아니라 실제 색상 반전에 가깝게 처리한다.
        // 완전한 1.0 반전은 캐릭터/검기 판독을 해칠 수 있으므로 배경 레이어에만 강하게 적용하고 어둡게 눌러준다.
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(8,18,42,0.18)';
        ctx.fillRect(layout.left, layout.top, layout.fieldW, layout.fieldH);
        ctx.restore();

        if (!introOnlyBackground) this.drawP2M3DimensionFrame(ctx, layout, rt);
        ctx.restore();
    };


    GameRenderer.drawP2M3Lanes = function(ctx, layout, rt) {
        const p = rt.player || {};
        const activeLane = Math.round(p.visualLane !== undefined ? p.visualLane : (p.lane || 1));
        const floorTop = layout.floorY - 92 * layout.scale;
        for (let i = 0; i < 3; i++) {
            const x = layout.left + layout.laneW * i;
            const active = activeLane === i;
            ctx.save();
            // 플레이 공간 전체 라인은 은은하게, 실제 지면 라인은 선명하게.
            ctx.fillStyle = active ? 'rgba(86,155,255,0.075)' : 'rgba(255,255,255,0.012)';
            ctx.fillRect(x + 3 * layout.scale, layout.top + 7 * layout.scale, layout.laneW - 6 * layout.scale, layout.fieldH - 14 * layout.scale);
            ctx.fillStyle = active ? 'rgba(92,160,255,0.20)' : 'rgba(255,255,255,0.045)';
            ctx.fillRect(x + 5 * layout.scale, floorTop, layout.laneW - 10 * layout.scale, layout.bottom - floorTop - 6 * layout.scale);
            ctx.strokeStyle = active ? 'rgba(157,224,255,0.86)' : 'rgba(220,220,230,0.24)';
            ctx.lineWidth = active ? 3 * layout.scale : 1.5 * layout.scale;
            this.roundRect(ctx, x + 6 * layout.scale, floorTop + 4 * layout.scale, layout.laneW - 12 * layout.scale, layout.bottom - floorTop - 12 * layout.scale, 8 * layout.scale);
            ctx.stroke();
            // step216: 좌/중/우 라인 영문 텍스트 제거. 라인 구분은 바닥/테두리로만 표시한다.
            ctx.restore();
        }
        for (let i = 1; i < 3; i++) {
            const x = layout.left + layout.laneW * i;
            ctx.strokeStyle = 'rgba(225,225,235,0.36)';
            ctx.lineWidth = 2 * layout.scale;
            ctx.setLineDash([8 * layout.scale, 7 * layout.scale]);
            ctx.beginPath();
            ctx.moveTo(x, layout.top + 14 * layout.scale);
            ctx.lineTo(x, layout.bottom - 14 * layout.scale);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.save();
        ctx.strokeStyle = 'rgba(255,222,132,0.92)';
        ctx.lineWidth = 4.5 * layout.scale;
        ctx.beginPath();
        ctx.moveTo(layout.left + 8 * layout.scale, layout.floorY);
        ctx.lineTo(layout.left + layout.fieldW - 8 * layout.scale, layout.floorY);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,222,132,0.16)';
        ctx.fillRect(layout.left + 8 * layout.scale, layout.floorY, layout.fieldW - 16 * layout.scale, 24 * layout.scale);
        ctx.restore();
    };

    GameRenderer.drawP2M3TopPortal = function(ctx, layout, rt) {
        const t = rt.timer || 0;
        const finalActive = (rt.activeSlashes || []).some(s => s && s.active && s.isFinal);
        const x = layout.left + layout.fieldW * 0.5;
        const y = layout.top + 58 * layout.scale;
        ctx.save();
        const rg = ctx.createRadialGradient(x, y, 8 * layout.scale, x, y, layout.fieldW * 0.48);
        rg.addColorStop(0, finalActive ? 'rgba(255,75,65,0.46)' : 'rgba(196,120,255,0.34)');
        rg.addColorStop(0.26, finalActive ? 'rgba(150,20,35,0.28)' : 'rgba(100,38,210,0.24)');
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(layout.left, layout.top, layout.fieldW, 170 * layout.scale);

        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.sin(t * 0.7 + i) * 0.08 + i * 0.04);
            ctx.strokeStyle = finalActive ? `rgba(255,${80 + i * 45},${55 + i * 35},${0.78 - i * 0.16})` : `rgba(${190 + i * 18},${120 + i * 34},255,${0.70 - i * 0.13})`;
            ctx.lineWidth = (4 - i * 0.7) * layout.scale;
            ctx.beginPath();
            ctx.ellipse(0, 0, (86 + i * 24 + Math.sin(t * 1.5 + i) * 4) * layout.scale, (19 + i * 7) * layout.scale, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.strokeStyle = finalActive ? 'rgba(255,230,160,0.62)' : 'rgba(255,220,255,0.42)';
        ctx.lineWidth = 2 * layout.scale;
        for (let i = 0; i < 7; i++) {
            const a = Math.PI * 2 * i / 7 + t * 0.55;
            const r = (55 + (i % 3) * 18) * layout.scale;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.28);
            ctx.lineTo(x + Math.cos(a + 0.3) * (r + 34 * layout.scale), y + Math.sin(a + 0.3) * (r + 34 * layout.scale) * 0.28);
            ctx.stroke();
        }

        if (finalActive) {
            ctx.fillStyle = 'rgba(255,210,130,0.80)';
            ctx.font = `900 ${Math.max(13, 16 * layout.scale)}px Malgun Gothic, sans-serif`;
            ctx.textAlign = 'center';
            // step216: 상단 포탈 텍스트 제거.
        } else {
            ctx.fillStyle = 'rgba(225,205,255,0.70)';
            ctx.font = `900 ${Math.max(12, 15 * layout.scale)}px Malgun Gothic, sans-serif`;
            ctx.textAlign = 'center';
            // step216: 상단 포탈 텍스트 제거.
        }
        ctx.restore();
    };


    GameRenderer.drawP2M3Slashes = function(ctx, layout, rt) {
        const slashes = (rt.activeSlashes || []).filter(s => s && s.active).slice().sort((a, b) => (a.y || 0) - (b.y || 0));
        for (const slash of slashes) {
            if (slash.state === 'WARNING') this.drawP2M3SlashWarning(ctx, layout, slash);
            else this.drawP2M3SlashEntity(ctx, layout, slash);
        }
    };

    GameRenderer.getP2M3SlashBounds = function(layout, slash) {
        const lanes = slash.lanes || [1];
        const minLane = Math.min.apply(null, lanes);
        const maxLane = Math.max.apply(null, lanes);
        const pad = 8 * layout.scale;
        const x = layout.left + layout.laneW * minLane + pad;
        const w = layout.laneW * (maxLane - minLane + 1) - pad * 2;
        const h = (slash.height || 80) * layout.scale;
        const y = layout.mapY(slash.y || V.spawnY);
        return { x, y, w, h, cx: x + w / 2, bottom: y + h };
    };

    GameRenderer.drawP2M3SlashWarning = function(ctx, layout, slash) {
        const lanes = slash.lanes || [1];
        const minLane = Math.min.apply(null, lanes);
        const maxLane = Math.max.apply(null, lanes);
        const x = layout.left + layout.laneW * minLane + 8 * layout.scale;
        const w = layout.laneW * (maxLane - minLane + 1) - 16 * layout.scale;
        const ratio = Math.max(0, Math.min(1, slash.warningTimer / Math.max(0.001, slash.warningMax || 1)));
        const pulse = 0.4 + Math.sin(Date.now() / 80) * 0.2;
        ctx.save();
        ctx.globalAlpha = 0.28 + (1 - ratio) * 0.44;
        ctx.fillStyle = slash.isGiant ? 'rgba(255,65,65,0.26)' : (lanes.length >= 2 ? 'rgba(166,54,255,0.22)' : 'rgba(255,80,92,0.20)');
        this.roundRect(ctx, x, layout.warningTopY, w, layout.floorY - layout.warningTopY, 12 * layout.scale);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,230,150,${pulse})`;
        ctx.lineWidth = 3 * layout.scale;
        ctx.setLineDash([12 * layout.scale, 8 * layout.scale]);
        this.roundRect(ctx, x, layout.warningTopY, w, layout.floorY - layout.warningTopY, 12 * layout.scale);
        ctx.stroke();
        ctx.setLineDash([]);
        // step216: 검기 경고명 텍스트 제거. 경고 범위만 표시한다.
        ctx.restore();
    };

    GameRenderer.drawP2M3SlashEntity = function(ctx, layout, slash) {
        const b = this.getP2M3SlashBounds(layout, slash);
        const renderType = String(slash.data && slash.data.Slash_Render_Type || '').toUpperCase();
        ctx.save();
        if (slash.hitFlashTimer > 0) {
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 18 * layout.scale;
        }
        if (slash.guardFlashTimer > 0) {
            ctx.shadowColor = '#95dcff';
            ctx.shadowBlur = 20 * layout.scale;
        }
        if (renderType.indexOf('KASIYAS_FINAL') >= 0) {
            this.drawP2M3FinalDive(ctx, b, slash, layout);
        } else if (renderType.indexOf('GIANT') >= 0) {
            this.drawP2M3GiantSlash(ctx, b, slash, layout);
        } else if (renderType.indexOf('APOSTLE') >= 0) {
            this.drawP2M3ApostleSlash(ctx, b, slash, layout);
        } else if (renderType.indexOf('X_SLASH') >= 0) {
            this.drawP2M3XSlash(ctx, b, slash, layout);
        } else {
            this.drawP2M3NormalSlash(ctx, b, slash, layout);
        }
        if (slash.stackContactTimer > 0) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,225,120,0.62)';
            ctx.lineWidth = 3 * layout.scale;
            ctx.setLineDash([8 * layout.scale, 5 * layout.scale]);
            this.roundRect(ctx, b.x - 3 * layout.scale, b.y - 3 * layout.scale, b.w + 6 * layout.scale, b.h + 6 * layout.scale, 12 * layout.scale);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
        ctx.restore();
    };


    GameRenderer.drawP2M3NormalSlash = function(ctx, b, slash, layout) {
        const s = layout.scale;
        ctx.save();
        // 아래로 낙하하는 방향이 읽히도록 C자 검기를 세로로 기울이고 하향 속도선을 넣는다.
        ctx.shadowColor = 'rgba(70,185,255,0.72)';
        ctx.shadowBlur = 10 * s;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const cx = b.cx;
        const cy = b.y + b.h * 0.48;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.82);
        const r = Math.min(b.w, b.h) * 0.43;
        ctx.strokeStyle = 'rgba(238,252,255,0.98)';
        ctx.lineWidth = 10 * s;
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.PI * 0.20, Math.PI * 1.62, false);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(56,168,255,0.90)';
        ctx.lineWidth = 4 * s;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.86, Math.PI * 0.24, Math.PI * 1.56, false);
        ctx.stroke();
        ctx.restore();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(195,236,255,0.42)';
        ctx.lineWidth = 2.2 * s;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(b.cx + i * 22 * s, b.y + b.h * 0.08);
            ctx.lineTo(b.cx + i * 12 * s, b.y + b.h * 0.82);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(86,178,255,0.16)';
        ctx.beginPath();
        ctx.ellipse(b.cx, b.y + b.h * 0.52, b.w * 0.28, b.h * 0.40, -0.20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    GameRenderer.drawP2M3XSlash = function(ctx, b, slash, layout) {
        const s = layout.scale;
        ctx.save();
        ctx.shadowColor = 'rgba(255,50,45,0.82)';
        ctx.shadowBlur = 18 * s;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255,226,205,0.98)';
        ctx.lineWidth = 12 * s;
        ctx.beginPath();
        ctx.moveTo(b.x + b.w * 0.17, b.y + b.h * 0.12);
        ctx.lineTo(b.x + b.w * 0.83, b.y + b.h * 0.88);
        ctx.moveTo(b.x + b.w * 0.83, b.y + b.h * 0.12);
        ctx.lineTo(b.x + b.w * 0.17, b.y + b.h * 0.88);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,55,50,0.92)';
        ctx.lineWidth = 5 * s;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,85,60,0.36)';
        ctx.beginPath();
        ctx.arc(b.cx, b.y + b.h * 0.50, 18 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,215,140,0.42)';
        ctx.lineWidth = 2 * s;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(b.cx + i * 17 * s, b.y + b.h * 0.18);
            ctx.lineTo(b.cx + i * 7 * s, b.y + b.h * 0.82);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        this.drawP2M3SlashHpText(ctx, b, slash, layout);
        ctx.restore();
    };



    GameRenderer.drawP2M3ApostleSlash = function(ctx, b, slash, layout) {
        const s = layout.scale;
        const t = (slash.life || 0) + (slash.id || 0) * 0.13;
        ctx.save();
        ctx.shadowColor = 'rgba(255,45,100,0.68)';
        ctx.shadowBlur = 22 * s;
        const baseGrad = ctx.createRadialGradient(b.cx, b.y + b.h * 0.5, 10 * s, b.cx, b.y + b.h * 0.5, Math.max(b.w, b.h) * 0.55);
        baseGrad.addColorStop(0, 'rgba(255,45,85,0.22)');
        baseGrad.addColorStop(0.48, 'rgba(105,10,32,0.26)');
        baseGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(b.x - 6 * s, b.y - 8 * s, b.w + 12 * s, b.h + 16 * s);
        ctx.translate(b.cx, b.y + b.h * 0.5);
        for (let i = 0; i < 2; i++) {
            ctx.save();
            ctx.rotate((i === 0 ? 0.42 : -0.42) + Math.sin(t * 2 + i) * 0.06);
            ctx.strokeStyle = i === 0 ? 'rgba(255,48,92,0.95)' : 'rgba(14,8,16,0.96)';
            ctx.lineWidth = (9 - i * 2) * s;
            ctx.beginPath();
            ctx.ellipse(0, 0, b.w * 0.42, b.h * 0.34, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = i === 0 ? 'rgba(255,188,150,0.48)' : 'rgba(170,40,85,0.50)';
            ctx.lineWidth = 2 * s;
            ctx.stroke();
            ctx.restore();
        }
        ctx.strokeStyle = 'rgba(255,210,140,0.38)';
        ctx.lineWidth = 2 * s;
        for (let i = 0; i < 8; i++) {
            const a = Math.PI * 2 * i / 8 + t;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * b.w * 0.20, Math.sin(a) * b.h * 0.20);
            ctx.lineTo(Math.cos(a) * b.w * 0.50, Math.sin(a) * b.h * 0.42);
            ctx.stroke();
        }
        ctx.resetTransform && ctx.resetTransform();
        // resetTransform이 없는 환경을 위해 restore 이후 텍스트를 별도로 그린다.
        ctx.restore();
        ctx.save();
        this.drawP2M3SlashHpText(ctx, b, slash, layout);
        ctx.restore();
    };



    GameRenderer.drawP2M3GiantSlash = function(ctx, b, slash, layout) {
        const s = layout.scale;
        const hpRatio = Math.max(0, Math.min(1, (slash.hp || 0) / Math.max(1, slash.maxHp || 1)));
        const cx = b.cx;
        const cy = b.y + b.h * 0.55;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(255,35,45,0.82)';
        ctx.shadowBlur = 24 * s;

        // 3칸 전체를 꽉 채우는 거대한 반달형 검기. 벽이 아니라 대형 검호로 읽히게 한다.
        const arcW = b.w * 0.48;
        const arcH = b.h * 0.56;
        const rot = -0.04;
        ctx.save();
        ctx.translate(cx, cy);
        // step208: 기존 거대 검기 형상이 상하 반대로 읽혀 상하 반전한다.
        ctx.scale(1, -1);
        ctx.rotate(rot);
        const outerGrad = ctx.createLinearGradient(-arcW, -arcH, arcW, arcH);
        outerGrad.addColorStop(0, 'rgba(255,96,68,0.95)');
        outerGrad.addColorStop(0.45, 'rgba(30,8,15,0.98)');
        outerGrad.addColorStop(1, 'rgba(190,18,34,0.98)');
        ctx.strokeStyle = outerGrad;
        ctx.lineWidth = Math.max(28 * s, b.h * 0.28);
        ctx.beginPath();
        ctx.ellipse(0, 0, arcW, arcH, 0, Math.PI * 1.08, Math.PI * 1.92, false);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,225,170,0.64)';
        ctx.lineWidth = Math.max(5 * s, b.h * 0.045);
        ctx.beginPath();
        ctx.ellipse(0, 0, arcW * 0.98, arcH * 0.98, 0, Math.PI * 1.10, Math.PI * 1.90, false);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.74)';
        ctx.lineWidth = Math.max(8 * s, b.h * 0.07);
        ctx.beginPath();
        ctx.ellipse(0, 0, arcW * 0.78, arcH * 0.74, 0, Math.PI * 1.14, Math.PI * 1.86, false);
        ctx.stroke();
        // step209: 거대 검기 뒤쪽의 난잡한 붉은 보조선은 제거하고, 본체 및 균열만 남긴다.
        ctx.strokeStyle = 'rgba(255,226,175,0.78)';
        ctx.lineWidth = 3 * s;
        const crackCount = Math.max(2, Math.round((1 - hpRatio) * 12));
        for (let i = 0; i < crackCount; i++) {
            const a = Math.PI * (1.16 + (i % 9) * 0.075);
            const x0 = Math.cos(a) * arcW * (0.68 + (i % 3) * 0.08);
            const y0 = Math.sin(a) * arcH * (0.68 + (i % 2) * 0.08);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + (i % 2 ? 30 : -26) * s, y0 + (18 + i % 3 * 8) * s);
            ctx.lineTo(x0 + (i % 2 ? 12 : -12) * s, y0 + (42 + i % 4 * 8) * s);
            ctx.stroke();
        }
        ctx.restore();

        // 불필요한 방사/속도선은 줄이고, 검기 본체의 외곽광만 남긴다.
        ctx.globalCompositeOperation = 'lighter';
        const pressGrad = ctx.createRadialGradient(cx, cy, b.h * 0.15, cx, cy, b.w * 0.55);
        pressGrad.addColorStop(0, 'rgba(255,42,46,0.20)');
        pressGrad.addColorStop(1, 'rgba(255,42,46,0)');
        ctx.fillStyle = pressGrad;
        ctx.fillRect(b.x - b.w * 0.08, b.y - b.h * 0.12, b.w * 1.16, b.h * 1.24);
        ctx.globalCompositeOperation = 'source-over';
        this.drawP2M3SlashHpText(ctx, b, slash, layout, true);
        ctx.restore();
    };

    
    GameRenderer.drawP2M3FinalDive = function(ctx, b, slash, layout) {
        const s = layout.scale;
        const cx = b.cx;
        const cy = b.y + b.h * 0.58;
        ctx.save();
        // 돌진 압력장/속도선은 보조 요소로 두고, 기존 카시야스 모델을 중심에 둔다.
        ctx.globalCompositeOperation = 'source-over';
        const grad = ctx.createLinearGradient(cx, b.y, cx, b.y + b.h);
        grad.addColorStop(0, 'rgba(255,35,35,0.02)');
        grad.addColorStop(0.50, 'rgba(255,45,50,0.18)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx - b.w * 0.34, b.y + b.h * 0.02);
        ctx.lineTo(cx + b.w * 0.34, b.y + b.h * 0.02);
        ctx.lineTo(cx + b.w * 0.19, b.y + b.h * 0.98);
        ctx.lineTo(cx - b.w * 0.19, b.y + b.h * 0.98);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,58,44,0.80)';
        ctx.lineWidth = 4 * s;
        ctx.lineCap = 'round';
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * 18 * s, b.y + b.h * 0.05);
            ctx.lineTo(cx + i * 8 * s, b.y + b.h * 0.92);
            ctx.stroke();
        }

        ctx.save();
        ctx.translate(cx, cy + 26 * s);
        ctx.rotate(0.08);
        const fakeBoss = slash && slash.runtimeBoss || {};
        const d = (fakeBoss && fakeBoss.d) || { renderType: 'RENDER_KASIYAS_P2' };
        if (typeof this.drawKasiyasModel === 'function') {
            this.drawKasiyasModel(ctx, {
                m: fakeBoss,
                d,
                renderType: 'RENDER_KASIYAS_P2',
                w: Math.max(72 * s, 96 * s),
                h: Math.max(126 * s, 164 * s),
                face: 1,
                stateKey: 'ATK',
                poseType: 'POSE_KASIYAS_P2_ONI_SLASH',
                progress: 0.75,
                isUI: false
            });
        } else {
            ctx.fillStyle = '#8c687d';
            ctx.beginPath(); ctx.ellipse(0, -40 * s, 34 * s, 60 * s, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(255,78,58,0.92)';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 64 * s, cy - 16 * s);
        ctx.quadraticCurveTo(cx, cy + 20 * s, cx + 64 * s, cy - 16 * s);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#ffeba0';
        ctx.font = `900 ${Math.max(13, 16 * s)}px Malgun Gothic, sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        // step216: 최종 낙하명 텍스트 제거.
        ctx.restore();
    };



    GameRenderer.drawP2M3SlashHpText = function(ctx, b, slash, layout, giant) {
        // step216: 숫자 텍스트 대신 검기 상단 HP 게이지로 표시한다.
        if (!slash || slash.isFinal) return;
        const s = layout.scale || 1;
        const cond = String(slash.data && slash.data.Destroy_Condition_Type || '').toUpperCase();
        const drawGauge = (x, y, w, h, ratio, color) => {
            const r = Math.max(0, Math.min(1, ratio || 0));
            ctx.save();
            ctx.globalAlpha = 0.96;
            ctx.fillStyle = 'rgba(0,0,0,0.62)';
            this.roundRect(ctx, x, y, w, h, h * 0.42);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = Math.max(1, 1.5 * s);
            ctx.stroke();
            ctx.fillStyle = color || (giant ? '#ff695f' : '#77d7ff');
            this.roundRect(ctx, x + 2 * s, y + 2 * s, Math.max(0, (w - 4 * s) * r), h - 4 * s, h * 0.32);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.20)';
            ctx.fillRect(x + 3 * s, y + 3 * s, Math.max(0, (w - 6 * s) * r), Math.max(1, h * 0.28));
            ctx.restore();
        };

        if (cond === 'PER_LANE_HIT_COUNT') {
            const perLaneMax = Math.max(1, parseFloat(slash.data && slash.data.HP_Per_Lane) || 1);
            const lanes = slash.lanes || [];
            for (const lane of lanes) {
                const laneX = layout.left + layout.laneW * lane;
                const gw = Math.max(42 * s, layout.laneW * 0.62);
                const gh = Math.max(6 * s, 8 * s);
                const gx = laneX + (layout.laneW - gw) * 0.5;
                const gy = b.y - 13 * s;
                const hp = Math.max(0, slash.laneHp && slash.laneHp[lane] !== undefined ? slash.laneHp[lane] : perLaneMax);
                drawGauge(gx, gy, gw, gh, hp / perLaneMax, '#d84cff');
            }
            return;
        }

        const maxHp = Math.max(1, parseFloat(slash.maxHp) || parseFloat(slash.data && slash.data.Slash_HP) || 1);
        const hp = Math.max(0, parseFloat(slash.hp) || 0);
        const gw = giant ? Math.min(b.w * 0.76, 360 * s) : Math.min(b.w * 0.70, 110 * s);
        const gh = giant ? Math.max(8 * s, 12 * s) : Math.max(5 * s, 7 * s);
        drawGauge(b.cx - gw * 0.5, b.y - (giant ? 18 : 12) * s, gw, gh, hp / maxHp, giant ? '#ff5b4d' : '#72d7ff');
    };


    
    GameRenderer.drawP2M3Player = function(ctx, layout, rt, gameState) {
        const p = rt.player || {};
        const x = this.getP2M3LaneCenterX(layout, p.visualLane !== undefined ? p.visualLane : p.lane);
        const screenY = layout.mapY(p.y !== undefined ? p.y : V.playerGroundY);
        const groundY = layout.mapY(V.playerGroundY);
        const s = layout.scale;
        ctx.save();
        // 기존 플레이어 렌더를 안전하게 재사용한다. 좌표만 특수 모드 필드에 맞춰 가짜 런타임으로 변환한다.
        const source = gameState && gameState.player ? gameState.player : {};
        const fakePlayer = Object.assign({}, source, {
            x,
            y: groundY - (this.GROUND_BASE_Y || 0),
            z: Math.max(0, groundY - screenY),
            scale: Math.max(0.82, Math.min(1.05, (source.scale || 1) * layout.scale * 0.94)),
            state: p.introPose === 'DOWN' ? 'Hit' : (p.introPose === 'VOID_FALL' || p.introPose === 'FIELD_FALL' ? 'Jump' : (p.isGuarding ? 'Guard' : (!p.grounded ? 'Jump' : 'Idle'))),
            prevState: 'Idle',
            faceDir: 1,
            stance: 'Mode_Melee',
            renderType: source.renderType || 'RENDER_HUMAN',
            meleeWeaponRenderType: source.meleeWeaponRenderType || 'WEAPON_LARGE_SWORD',
            rangeWeaponRenderType: source.rangeWeaponRenderType || 'WEAPON_GUN',
            bodyX: source.bodyX || 60,
            bodyY: source.bodyY || 40,
            bodyZ: source.bodyZ || 120,
            atkTimer: 0,
            rapidAtkCooldownTimer: 0,
            rapidAtkAllowTimer: 0,
            stanceSwapTimer: 0,
            guardCooldownTimer: 0,
            kasiyasOniMark: null,
            kasiyasTemperedBladeReady: !!p.hasTemperedWill,
            kasiyasTemperedBladeFlashTimer: p.hasTemperedWill ? 0.35 : 0
        });
        if (typeof this.drawPlayerEntity === 'function') {
            this.drawPlayerEntity(ctx, fakePlayer);
        } else {
            // 극단적인 로드 오류 대비 fallback. 정상 빌드에서는 사용되지 않는다.
            ctx.fillStyle = '#2f80d5';
            ctx.fillRect(x - 15 * s, screenY - 86 * s, 30 * s, 82 * s);
        }

        // 위쪽 대응용 연출은 기존 렌더 위에 덧씌운다.
        if (!p.grounded || p.jumpFlashTimer > 0) {
            ctx.strokeStyle = 'rgba(135,210,255,0.48)';
            ctx.lineWidth = 3 * s;
            ctx.beginPath();
            ctx.moveTo(x - 24 * s, groundY + 12 * s);
            ctx.quadraticCurveTo(x, screenY + 36 * s, x + 24 * s, groundY + 12 * s);
            ctx.stroke();
        }
        if (p.hasTemperedWill) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'rgba(255,239,150,0.72)';
            ctx.lineWidth = 3 * s;
            ctx.beginPath();
            ctx.ellipse(x, screenY - 66 * s, 44 * s, 25 * s, -0.28, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        if (p.attackFlashTimer > 0) this.drawP2M3PlayerAttackArc(ctx, layout, rt, x, screenY);
        if (p.isGuarding || p.guardFlashTimer > 0) this.drawP2M3PlayerGuardField(ctx, layout, rt, x, screenY);
        if (p.skillFlashTimer > 0) {
            ctx.save();
            const a = Math.min(1, (p.skillFlashTimer || 0) / 0.16);
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.35 + a * 0.45;
            ctx.strokeStyle = 'rgba(255,246,170,0.95)';
            ctx.lineWidth = 4 * s;
            ctx.beginPath();
            ctx.ellipse(x, screenY - 58 * s, 46 * s * (1.15 - a * 0.15), 24 * s, -0.24, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(120,210,255,0.75)';
            ctx.lineWidth = 3 * s;
            ctx.beginPath();
            ctx.moveTo(x - 40 * s, screenY - 18 * s);
            ctx.quadraticCurveTo(x, screenY - 105 * s, x + 40 * s, screenY - 18 * s);
            ctx.stroke();
            ctx.restore();
        }
        if (p.damageFlashTimer > 0) {
            ctx.save();
            const a = Math.min(0.38, p.damageFlashTimer / 0.28 * 0.32);
            ctx.fillStyle = `rgba(255,45,36,${a})`;
            ctx.beginPath();
            ctx.ellipse(x, screenY - 54 * s, 48 * s, 72 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    };


    GameRenderer.drawP2M3PlayerAttackArc = function(ctx, layout, rt, x, y) {
        const p = rt.player || {};
        const s = layout.scale;
        const rangeY = Math.max(40, parseFloat(rt.playerData && rt.playerData.ATK_Range_Y) || 100) * s;
        const laneW = layout.laneW * 0.86;
        const alpha = Math.max(0.22, Math.min(1, (p.attackFlashTimer || 0) / 0.12));
        const topY = y - rangeY;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // 기존 PROJECTILE_SLASH_WAVE의 푸른 초승달 느낌을 위쪽 공격 범위로 회전시킨 형태.
        const grad = ctx.createLinearGradient(x - laneW * 0.45, y, x + laneW * 0.45, topY);
        grad.addColorStop(0, 'rgba(255,255,255,0.96)');
        grad.addColorStop(0.44, 'rgba(77,166,255,0.92)');
        grad.addColorStop(1, 'rgba(235,252,255,0.96)');
        ctx.shadowColor = 'rgba(60,160,255,0.66)';
        ctx.shadowBlur = 11 * s;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 9 * s;
        ctx.beginPath();
        ctx.moveTo(x - laneW * 0.42, y - 8 * s);
        ctx.bezierCurveTo(x - laneW * 0.38, y - rangeY * 0.40, x + laneW * 0.10, topY - 8 * s, x + laneW * 0.42, topY + rangeY * 0.16);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.82)';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(x - laneW * 0.30, y - 18 * s);
        ctx.bezierCurveTo(x - laneW * 0.18, y - rangeY * 0.45, x + laneW * 0.14, topY + 4 * s, x + laneW * 0.33, topY + rangeY * 0.19);
        ctx.stroke();
        ctx.fillStyle = 'rgba(52,152,219,0.16)';
        ctx.beginPath();
        ctx.moveTo(x - laneW * 0.45, y - 8 * s);
        ctx.bezierCurveTo(x - laneW * 0.42, y - rangeY * 0.44, x + laneW * 0.09, topY - 16 * s, x + laneW * 0.45, topY + rangeY * 0.12);
        ctx.bezierCurveTo(x + laneW * 0.18, topY + rangeY * 0.42, x - laneW * 0.10, y - rangeY * 0.28, x - laneW * 0.45, y - 8 * s);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    GameRenderer.drawP2M3PlayerGuardField = function(ctx, layout, rt, x, y) {
        const p = rt.player || {};
        const s = layout.scale;
        const rangeY = Math.max(40, parseFloat(rt.playerData && rt.playerData.Guard_Range_Y) || 100) * s;
        const laneW = layout.laneW * 0.82;
        const contact = p.guardContactTimer > 0;
        const alpha = contact ? 1 : (p.isGuarding ? 0.86 : 0.48);
        const topY = y - rangeY;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = 'lighter';
        // 기존 게임의 단단한 가드 원호를 위로 들어 올린 느낌.
        const shieldGrad = ctx.createRadialGradient(x, topY + rangeY * 0.58, 5 * s, x, topY + rangeY * 0.40, laneW * 0.62);
        shieldGrad.addColorStop(0, contact ? 'rgba(255,238,128,0.35)' : 'rgba(140,218,255,0.22)');
        shieldGrad.addColorStop(0.58, contact ? 'rgba(255,202,78,0.28)' : 'rgba(70,155,255,0.20)');
        shieldGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.ellipse(x, topY + rangeY * 0.50, laneW * 0.48, rangeY * 0.55, 0, Math.PI, Math.PI * 2);
        ctx.lineTo(x + laneW * 0.43, y - 28 * s);
        ctx.quadraticCurveTo(x, y + 4 * s, x - laneW * 0.43, y - 28 * s);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = contact ? 'rgba(255,230,110,0.86)' : 'rgba(82,170,255,0.72)';
        ctx.shadowBlur = contact ? 16 * s : 9 * s;
        ctx.strokeStyle = contact ? 'rgba(255,238,120,0.98)' : 'rgba(170,228,255,0.96)';
        ctx.lineWidth = contact ? 7 * s : 5 * s;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - laneW * 0.47, y - 24 * s);
        ctx.quadraticCurveTo(x, topY - 6 * s, x + laneW * 0.47, y - 24 * s);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.72)';
        ctx.lineWidth = 2.4 * s;
        ctx.beginPath();
        ctx.moveTo(x - laneW * 0.34, y - 28 * s);
        ctx.quadraticCurveTo(x, topY + 8 * s, x + laneW * 0.34, y - 28 * s);
        ctx.stroke();
        if (contact) {
            ctx.strokeStyle = 'rgba(255,250,180,0.95)';
            ctx.lineWidth = 3.5 * s;
            ctx.beginPath();
            ctx.ellipse(x, topY + 7 * s, laneW * 0.38, 15 * s, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    };


    GameRenderer.drawP2M3SkillWaves = function(ctx, layout, rt) {
        const waves = (rt && rt.skillWaves) || [];
        if (!waves.length) return;
        const s = layout.scale;
        for (const wave of waves) {
            if (!wave || !wave.active) continue;
            const y = layout.mapY(wave.y || 0);
            const h = (wave.height || 140) * s;
            const lifeRatio = Math.max(0, Math.min(1, (wave.life || 0) / Math.max(0.001, wave.maxLife || wave.life || 1)));
            const x = layout.left + layout.fieldW * 0.5;
            const w = layout.fieldW * 0.92;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.45 + lifeRatio * 0.38;
            ctx.shadowColor = 'rgba(70,170,255,0.78)';
            ctx.shadowBlur = 16 * s;
            // 기존 A스킬/PROJECTILE_SLASH_WAVE의 넓은 푸른 웨이브가 위로 전진하는 형태.
            const grad = ctx.createLinearGradient(x - w * 0.5, y, x + w * 0.5, y - h);
            grad.addColorStop(0, 'rgba(255,255,255,0.92)');
            grad.addColorStop(0.45, 'rgba(52,152,219,0.90)');
            grad.addColorStop(1, 'rgba(255,255,255,0.78)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = Math.max(15 * s, h * 0.18);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x - w * 0.48, y - h * 0.15);
            ctx.bezierCurveTo(x - w * 0.18, y - h * 0.86, x + w * 0.18, y - h * 0.86, x + w * 0.48, y - h * 0.15);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.80)';
            ctx.lineWidth = 4 * s;
            ctx.beginPath();
            ctx.moveTo(x - w * 0.40, y - h * 0.20);
            ctx.bezierCurveTo(x - w * 0.14, y - h * 0.68, x + w * 0.14, y - h * 0.68, x + w * 0.40, y - h * 0.20);
            ctx.stroke();
            ctx.fillStyle = 'rgba(52,152,219,0.13)';
            ctx.beginPath();
            ctx.moveTo(x - w * 0.50, y - h * 0.08);
            ctx.bezierCurveTo(x - w * 0.20, y - h * 0.98, x + w * 0.20, y - h * 0.98, x + w * 0.50, y - h * 0.08);
            ctx.bezierCurveTo(x + w * 0.24, y - h * 0.30, x - w * 0.24, y - h * 0.30, x - w * 0.50, y - h * 0.08);
            ctx.fill();
            // 전방 진행 속도선.
            ctx.strokeStyle = 'rgba(180,235,255,0.50)';
            ctx.lineWidth = 2 * s;
            for (let i = -3; i <= 3; i++) {
                ctx.beginPath();
                const sx = x + i * w * 0.11;
                ctx.moveTo(sx, y + 12 * s);
                ctx.lineTo(sx + i * 4 * s, y - h * 0.76);
                ctx.stroke();
            }
            ctx.restore();
        }
    };

    GameRenderer.drawP2M3Effects = function(ctx, layout, rt) {
        const effects = rt.effects || [];
        for (const effect of effects) {
            if (!effect || effect.timer <= 0) continue;
            const ratio = Math.max(0, Math.min(1, effect.timer / Math.max(0.001, effect.maxTimer || effect.timer)));
            const lane = Number.isFinite(parseFloat(effect.lane)) ? parseFloat(effect.lane) : (Number.isFinite(parseFloat(effect.x)) ? parseFloat(effect.x) : 1);
            const x = this.getP2M3LaneCenterX(layout, lane);
            const y = layout.mapY(Number.isFinite(parseFloat(effect.y)) ? parseFloat(effect.y) : V.playerGroundY);
            if (effect.type === 'slashHit' || effect.type === 'skillWaveHit') this.drawP2M3HitEffect(ctx, layout, x, y, effect, ratio);
            else if (effect.type === 'slashBreak') this.drawP2M3BreakEffect(ctx, layout, x, y, effect, ratio);
            else if (effect.type === 'guardRebound') this.drawP2M3GuardReboundEffect(ctx, layout, x, y, effect, ratio);
            else if (effect.type === 'floorImpact') this.drawP2M3FloorImpactEffect(ctx, layout, x, y, effect, ratio);
            else if (effect.type === 'attackArc') {
                const dummyRt = { player: { attackFlashTimer: effect.timer }, playerData: rt.playerData };
                this.drawP2M3PlayerAttackArc(ctx, layout, dummyRt, x, y);
            }
        }
    };


    GameRenderer.drawP2M3HitEffect = function(ctx, layout, x, y, effect, ratio) {
        const s = layout.scale * (effect.size || 1);
        const theme = this.getP2M3SlashTheme(null, effect.effectType);
        ctx.save();
        ctx.globalAlpha = ratio;
        ctx.strokeStyle = theme.shard;
        ctx.lineWidth = 3 * s;
        for (let i = 0; i < 8; i++) {
            const a = (Math.PI * 2 / 8) * i + (theme.key === 'x' ? Math.PI / 4 : 0);
            const r1 = 5 * s;
            const r2 = (18 + (i % 3) * 7) * s * (1.25 - ratio * 0.25);
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
            ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2);
            ctx.stroke();
        }
        ctx.fillStyle = theme.light;
        ctx.beginPath();
        ctx.arc(x, y, 7 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };



    GameRenderer.drawP2M3BreakEffect = function(ctx, layout, x, y, effect, ratio) {
        const s = layout.scale * (effect.size || 1);
        const theme = this.getP2M3SlashTheme(null, effect.effectType);
        const giant = effect.isGiant || theme.key === 'giant';
        ctx.save();
        ctx.globalAlpha = ratio;
        ctx.strokeStyle = giant ? 'rgba(255,92,58,0.98)' : theme.shard;
        ctx.lineWidth = (giant ? 5 : 3) * s;
        const shardCount = giant ? 20 : (theme.key === 'apostle' ? 14 : 10);
        for (let i = 0; i < shardCount; i++) {
            const a = (Math.PI * 2 / shardCount) * i + Math.sin(i * 3.1) * 0.4;
            const r1 = (8 + (i % 4) * 3) * s;
            const r2 = (giant ? 76 : 44) * s * (1.2 - ratio * 0.25);
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
            ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2);
            ctx.stroke();
        }
        const smoke = ctx.createRadialGradient(x, y, 4 * s, x, y, (giant ? 64 : 34) * s);
        smoke.addColorStop(0, giant || theme.key === 'apostle' ? 'rgba(255,55,85,0.32)' : 'rgba(130,220,255,0.28)');
        smoke.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = smoke;
        ctx.beginPath();
        ctx.arc(x, y, (giant ? 64 : 34) * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };


    GameRenderer.drawP2M3GuardReboundEffect = function(ctx, layout, x, y, effect, ratio) {
        const s = layout.scale * (effect.size || 1);
        ctx.save();
        ctx.globalAlpha = Math.min(1, ratio * 1.2);
        ctx.strokeStyle = effect.isGiant ? 'rgba(255,236,145,0.98)' : 'rgba(150,224,255,0.96)';
        ctx.lineWidth = (effect.isGiant ? 6 : 4) * s;
        ctx.beginPath();
        ctx.ellipse(x, y, (effect.isGiant ? 88 : 48) * s * (1.25 - ratio * 0.25), (effect.isGiant ? 24 : 16) * s, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.62)';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.ellipse(x, y, (effect.isGiant ? 48 : 28) * s * (1.15 - ratio * 0.15), (effect.isGiant ? 10 : 7) * s, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    GameRenderer.drawP2M3FloorImpactEffect = function(ctx, layout, x, y, effect, ratio) {
        const s = layout.scale * (effect.size || 1);
        ctx.save();
        ctx.globalAlpha = ratio;
        ctx.strokeStyle = 'rgba(255,95,80,0.90)';
        ctx.lineWidth = 4 * s;
        ctx.beginPath();
        ctx.moveTo(x - 46 * s, y);
        ctx.lineTo(x + 46 * s, y);
        ctx.stroke();
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * 18 * s, y);
            ctx.lineTo(x + i * 28 * s, y + (20 + Math.abs(i) * 5) * s);
            ctx.stroke();
        }
        ctx.restore();
    };

    GameRenderer.drawP2M3Hud = function(ctx, canvas, layout, rt) {
        const p = rt.player || {};
        ctx.save();
        // step208: 좌측 상단/우측 상단 전용 상태창은 제거하고, 기존 하단 HUD 문법 쪽으로 정보 표시를 통합한다.
        // step216: 연단 상태는 플레이어 오라와 기존 하단 HUD로 표시한다.

        if (rt.resultMessage && rt.message && rt.messageTimer > 0) {
            ctx.globalAlpha = Math.min(1, rt.messageTimer / 0.15);
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 34px Malgun Gothic, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 8;
            ctx.fillText(rt.message, canvas.width / 2, 226);
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
        // step209: 별도 패턴 모드용 하단 HUD를 추가하지 않고, 기존 하단 HUD 정보만 패턴 모드용으로 치환한다.
        ctx.restore();
    };


    GameRenderer.drawP2M3BottomHud = function(ctx, canvas, layout, rt) {
        const p = rt.player || {};
        const panelW = Math.min(840, canvas.width - 80);
        const panelH = 94;
        const x = (canvas.width - panelW) / 2;
        const y = canvas.height - panelH - 18;
        ctx.save();
        ctx.fillStyle = 'rgba(12,14,20,0.86)';
        this.roundRect(ctx, x, y, panelW, panelH, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.16)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#f6d36a';
        ctx.font = '900 15px Malgun Gothic, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`차원 방어전  Wave ${Math.min(((rt.waveIndex || 0) + 1), (rt.waves || []).length)}/${(rt.waves || []).length}`, x + 22, y + 25);
        this.drawP2M3Bar(ctx, x + 22, y + 36, 220, 16, p.hp / Math.max(1, p.maxHp), '#ff5e68', `HP ${Math.ceil(p.hp)}/${p.maxHp}`);
        // 기존 투기 게이지 자리를 가드 게이지로 대체한다.
        this.drawP2M3Bar(ctx, x + 22, y + 61, 220, 16, p.guardGauge / Math.max(1, p.guardGaugeMax), '#74c7ff', `Guard ${Math.floor(p.guardGauge)}/${p.guardGaugeMax}`);

        const slotY = y + 26;
        const startX = x + 282;
        const slots = [
            { key: 'X', label: '공격', sub: '상향 베기', color: '#86d5ff' },
            { key: 'C', label: '점프', sub: 'Space/↑', color: '#d6f6ff' },
            { key: 'D', label: '가드', sub: '받아내기', color: '#9edcff' },
            { key: 'A', label: '웨이브', sub: p.skillCooldown > 0 ? `${p.skillCooldown.toFixed(1)}s` : 'READY', color: p.skillCooldown > 0 ? '#8c8c8c' : '#ffe27c' }
        ];
        for (let i = 0; i < slots.length; i++) {
            const sx = startX + i * 132;
            const sl = slots[i];
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            this.roundRect(ctx, sx, slotY, 112, 50, 10);
            ctx.fill();
            ctx.strokeStyle = i === 3 && p.skillCooldown <= 0 ? 'rgba(255,230,120,0.65)' : 'rgba(255,255,255,0.14)';
            ctx.stroke();
            ctx.fillStyle = sl.color;
            ctx.font = '900 18px Malgun Gothic, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(sl.key, sx + 22, slotY + 31);
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 13px Malgun Gothic, sans-serif';
            ctx.fillText(sl.label, sx + 66, slotY + 21);
            ctx.fillStyle = 'rgba(220,230,245,0.82)';
            ctx.font = '800 11px Malgun Gothic, sans-serif';
            ctx.fillText(sl.sub, sx + 66, slotY + 39);
        }
        ctx.restore();
    };

    GameRenderer.drawP2M3Bar = function(ctx, x, y, w, h, ratio, color, label) {
        const r = Math.max(0, Math.min(1, ratio || 0));
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        this.roundRect(ctx, x, y, w, h, 8);
        ctx.fill();
        ctx.fillStyle = color;
        this.roundRect(ctx, x, y, w * r, h, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 12px Malgun Gothic, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + w / 2, y + h - 4);
    };


    GameRenderer.drawP2M3IntroArrivalOverlay = function(ctx, canvas, layout, rt, layer) {
        if (!rt || rt.phase !== 'INTRO' || !rt.isPatternLinked) return;
        const maxTime = Math.max(0.01, parseFloat(rt.introMaxTime) || 2.65);
        const ratio = Math.max(0, Math.min(1, 1 - ((parseFloat(rt.introTime) || 0) / maxTime)));
        const t = rt.timer || 0;
        const s = layout.scale || 1;
        ctx.save();
        if (layer === 'under') {
            if (ratio < 0.45) {
                // 기존 맵에서 떨어져 차원 내부로 빨려 들어가는 중간 구간: 맵은 어둡게 가리고 낙하 속도선을 강조한다.
                const a = 0.66 + ratio * 0.62;
                ctx.fillStyle = `rgba(4,2,13,${Math.min(0.92, a)})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'lighter';
                for (let i = 0; i < 26; i++) {
                    const x = ((i * 83 + Math.sin(t * 2 + i) * 18) % (canvas.width + 120)) - 60;
                    const y = ((t * 480 + i * 71) % (canvas.height + 220)) - 120;
                    const len = 70 + (i % 5) * 26;
                    ctx.strokeStyle = `rgba(${110 + (i % 3) * 45},${80 + (i % 2) * 50},255,${0.15 + (i % 4) * 0.035})`;
                    ctx.lineWidth = (1.3 + (i % 3) * 0.55) * s;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + 12 * Math.sin(i), y + len);
                    ctx.stroke();
                }
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = `rgba(255,255,255,${Math.max(0, (ratio - 0.32) / 0.10) * 0.10})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (ratio < 0.72) {
                // 패턴 맵이 비치며 플레이어가 하늘에서 시작점으로 추락하는 구간.
                const r = (ratio - 0.45) / 0.27;
                ctx.fillStyle = `rgba(255,255,255,${0.08 * (1 - r)})`;
                ctx.fillRect(layout.left, layout.top, layout.fieldW, layout.fieldH);
                ctx.globalCompositeOperation = 'lighter';
                for (let i = 0; i < 18; i++) {
                    const laneX = layout.left + (i % 3 + 0.5) * layout.laneW + Math.sin(t * 3 + i) * 22 * s;
                    const y = layout.top + ((t * 330 + i * 89) % layout.fieldH);
                    ctx.strokeStyle = `rgba(150,210,255,${0.10 + (i % 4) * 0.025})`;
                    ctx.lineWidth = 1.6 * s;
                    ctx.beginPath();
                    ctx.moveTo(laneX, y - 80 * s);
                    ctx.lineTo(laneX - 8 * s, y + 60 * s);
                    ctx.stroke();
                }
                ctx.globalCompositeOperation = 'source-over';
            }
        } else {
            if (ratio >= 0.70 && ratio < 0.90) {
                const a = Math.sin(Math.PI * Math.max(0, Math.min(1, (ratio - 0.70) / 0.20)));
                ctx.strokeStyle = `rgba(255,230,175,${0.20 + 0.28 * a})`;
                ctx.lineWidth = 3 * s;
                ctx.beginPath();
                ctx.ellipse(this.getP2M3LaneCenterX(layout, (rt.player && rt.player.lane) || 1), layout.floorY + 4 * s, 42 * s * (1 + a * 0.35), 10 * s, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            if (ratio >= 0.86) {
                const a = Math.max(0, Math.min(1, (ratio - 0.86) / 0.14));
                ctx.fillStyle = `rgba(255,255,255,${0.10 * a})`;
                ctx.fillRect(layout.left, layout.top, layout.fieldW, layout.fieldH);
            }
        }
        ctx.restore();
    };

    GameRenderer.drawP2M3OutroOverlay = function(ctx, canvas, layout, rt) {
        if (!rt || rt.phase !== 'ENDING') return;
        const maxTime = Math.max(0.01, parseFloat(rt.outroMaxTime) || 1.6);
        const remain = Math.max(0, parseFloat(rt.endingTimer) || 0);
        const ratio = Math.max(0, Math.min(1, 1 - remain / maxTime));
        const strength = String(rt.result || '').toUpperCase() === 'PERFECT_SUCCESS' ? 1.0 : (String(rt.result || '').toUpperCase() === 'GUARD_SUCCESS' ? 0.82 : 0.68);
        const t = rt.timer || 0;
        ctx.save();
        // 게임 플레이 화면 전체에 차원이 일그러지는 듯한 공통 종료 연출을 얹는다. DOM 하단 HUD는 캔버스 밖이므로 영향받지 않는다.
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = `rgba(255,255,255,${(0.12 + 0.18 * Math.sin(Math.PI * ratio)) * strength})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        const cx = canvas.width * 0.5;
        const cy = canvas.height * 0.47;
        ctx.strokeStyle = `rgba(175,80,255,${0.20 + 0.36 * Math.sin(Math.PI * ratio)})`;
        ctx.lineWidth = 3 + 3 * strength;
        for (let i = 0; i < 7; i++) {
            const rr = (70 + i * 68) * (0.65 + ratio * 0.85);
            ctx.beginPath();
            ctx.ellipse(cx + Math.sin(t * 3 + i) * 10, cy + Math.cos(t * 2 + i) * 8, rr * 1.15, rr * 0.38, Math.sin(t + i) * 0.18, Math.PI * 0.08, Math.PI * 1.92);
            ctx.stroke();
        }
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 18; i++) {
            const ang = (Math.PI * 2 / 18) * i + ratio * 1.7;
            const r0 = 70 + (i % 5) * 30 + ratio * 180;
            const x0 = cx + Math.cos(ang) * r0;
            const y0 = cy + Math.sin(ang) * r0 * 0.55;
            ctx.strokeStyle = `rgba(255,${120 + (i % 3) * 35},255,${0.12 + 0.10 * strength})`;
            ctx.lineWidth = 1.6 + (i % 3);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + Math.cos(ang) * (70 + ratio * 120), y0 + Math.sin(ang) * (38 + ratio * 80));
            ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
        const flash = Math.max(0, (ratio - 0.72) / 0.28);
        if (flash > 0) {
            ctx.fillStyle = `rgba(255,255,255,${Math.min(0.78, flash * flash * 0.78)})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = `rgba(0,0,0,${0.08 + ratio * 0.12})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
    };

    if (typeof GameRenderer.roundRect !== 'function') {
        GameRenderer.roundRect = function(ctx, x, y, w, h, r) {
            const rr = Math.max(0, Math.min(r || 0, Math.abs(w) / 2, Math.abs(h) / 2));
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
    }

    GameRenderer.drawP2M3IntroOverlay = function(ctx, canvas, gameState) {
        const intro = gameState && gameState.p2m3IntroRuntime;
        if (!intro || !intro.active || !canvas) return;
        const actionId = String(intro.actionId || '');
        const ratio = Math.max(0, Math.min(1, (parseFloat(intro.timer) || 0) / Math.max(0.05, parseFloat(intro.duration) || 1)));
        ctx.save();
        if (actionId === '242072') {
            const alpha = Math.min(0.38, 0.10 + ratio * 0.30);
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = `rgba(34, 0, 58, ${alpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = `rgba(210, 80, 255, ${0.28 + 0.32 * Math.sin(Math.PI * ratio)})`;
            ctx.lineWidth = 4;
            const cy = canvas.height * (0.55 + ratio * 0.08);
            for (let i = -3; i <= 3; i++) {
                ctx.beginPath();
                const x0 = canvas.width * 0.5 + i * 92;
                ctx.moveTo(x0 - 42, cy - 18 - Math.abs(i) * 8);
                ctx.lineTo(x0 + 18, cy + 18 + Math.abs(i) * 4);
                ctx.lineTo(x0 - 8, cy + 52 + Math.abs(i) * 5);
                ctx.stroke();
            }
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 20; i++) {
                const x = ((i * 97 + ratio * 260) % (canvas.width + 160)) - 80;
                const y = ((i * 61 + ratio * 520) % (canvas.height + 140)) - 70;
                ctx.strokeStyle = `rgba(170,110,255,${0.08 + (i % 5) * 0.025})`;
                ctx.lineWidth = 1.4 + (i % 3) * 0.7;
                ctx.beginPath();
                ctx.moveTo(x, y - 45);
                ctx.lineTo(x + 10 * Math.sin(i), y + 86);
                ctx.stroke();
            }
            ctx.globalCompositeOperation = 'source-over';
            const holeY = canvas.height * (0.60 + ratio * 0.06);
            ctx.fillStyle = `rgba(16,0,24,${0.18 + ratio * 0.22})`;
            ctx.beginPath();
            ctx.ellipse(canvas.width * 0.5, holeY, 190 + ratio * 120, 34 + ratio * 32, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255,255,255,${Math.max(0, (ratio - 0.72) / 0.28) * 0.20})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (actionId === '242071') {
            ctx.fillStyle = `rgba(255,245,220,${Math.max(0, 1 - Math.abs(ratio - 0.45) / 0.12) * 0.16})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
    };

})();
