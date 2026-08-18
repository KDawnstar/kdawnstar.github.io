// 3페이즈 대형 패턴3 전용 렌더 보조

(function() {
    if (typeof GameRenderer === 'undefined') return;

    GameRenderer.isP3M3Active = function(gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        // 성공 복귀 중 원래 Stage/좌표/보스 상태 준비가 끝난 뒤에는 P3 전용 렌더를 즉시 끈다.
        // 백색 암전이 걷히기 시작할 때 이미 정상 Stage만 보이게 해 전용 맵이 한 프레임 비치는 현상을 막는다.
        return !!(gameState && gameState.specialMode === 'P3_M3_FINAL_ISSEN' && rt && rt.active && !rt.normalClearStageRestored);
    };

    GameRenderer.drawP3M3WorldBackground = function(ctx, canvas, gameState) {
        if (!this.isP3M3Active(gameState)) return;
        const rt = gameState.p3m3Runtime || {};
        const intro = rt.intro || null;
        // 이면세계 진입 연출 중에는 검격으로 화면을 깨기 전까지 기존 맵을 유지한다.
        if (intro && intro.active && !intro.innerWorldVisible) return;
        const stageName = (typeof P3M3FinalIssenSystem !== 'undefined' && P3M3FinalIssenSystem.getStage)
            ? ((P3M3FinalIssenSystem.getStage(gameState, rt.currentAreaId) || {}).Stage_Name || '')
            : '';
        const worldMode = String(rt.worldMode || 'INVERTED_BLACK_WHITE').trim().toUpperCase();
        if (worldMode && worldMode !== 'INVERTED_BLACK_WHITE') return;
        const w = canvas.width;
        const h = canvas.height;
        const t = performance.now() * 0.001;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        if (rt.hiddenWhiteBackdrop) {
            const ret = rt.hiddenClearReturn;
            const fade = ret && ret.active
                ? Math.max(0, Math.min(1, (parseFloat(ret.timer) || 0) / Math.max(0.05, parseFloat(ret.duration) || 0.9)))
                : 0;
            const whiteBg = ctx.createLinearGradient(0, 0, 0, h);
            whiteBg.addColorStop(0, 'rgba(255,255,255,0.99)');
            whiteBg.addColorStop(0.58, 'rgba(251,252,255,0.99)');
            whiteBg.addColorStop(1, 'rgba(246,248,255,0.99)');
            ctx.fillStyle = whiteBg;
            ctx.fillRect(0, 0, w, h);
            if (fade > 0) {
                ctx.fillStyle = `rgba(255,255,255,${Math.min(1, 0.25 + fade * 0.75)})`;
                ctx.fillRect(0, 0, w, h);
            }
            ctx.restore();
            return;
        }

        // 흑백 이면세계: 빗금/해칭 제거, 검은 면과 흰 구조선 위주로 구성한다.
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, 'rgba(0,0,0,0.96)');
        bg.addColorStop(0.56, 'rgba(8,8,10,0.98)');
        bg.addColorStop(1, 'rgba(0,0,0,0.99)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        const horizon = Math.max(140, Math.min(h - 190, h * 0.43));
        const floorTop = horizon + 16;
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.beginPath();
        ctx.moveTo(0, floorTop);
        ctx.lineTo(w, floorTop - 18);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(255,255,255,0.52)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, floorTop + 2);
        ctx.lineTo(w, floorTop - 18);
        ctx.stroke();

        // 흰 선으로만 보이는 추상 지형. 면은 검정색으로 채워 흑백 대비를 만든다.
        const shapes = [
            [[70, horizon - 42], [190, horizon - 76], [300, horizon - 30], [286, horizon + 15], [82, horizon + 12]],
            [[w * 0.46, horizon - 22], [w * 0.52, horizon - 82], [w * 0.59, horizon - 55], [w * 0.60, horizon + 24], [w * 0.44, horizon + 16]],
            [[w - 220, horizon - 96], [w - 88, horizon - 74], [w - 75, horizon + 22], [w - 236, horizon + 10]],
            [[w * 0.18, horizon + 118], [w * 0.32, horizon + 104], [w * 0.38, horizon + 142], [w * 0.23, horizon + 162]],
            [[w * 0.64, horizon + 92], [w * 0.79, horizon + 82], [w * 0.84, horizon + 128], [w * 0.67, horizon + 144]]
        ];
        shapes.forEach((poly, i) => {
            ctx.save();
            ctx.globalAlpha = 0.72;
            ctx.fillStyle = i % 2 ? 'rgba(3,3,5,0.98)' : 'rgba(0,0,0,0.96)';
            ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.62)';
            ctx.lineWidth = i % 2 ? 2 : 2.6;
            ctx.beginPath();
            poly.forEach((pt, idx) => idx ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // 바닥 균열/타일선: 사선 빗금 대신 불규칙한 흰 선 조각만 사용한다.
        ctx.strokeStyle = 'rgba(255,255,255,0.20)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 18; i++) {
            const row = i % 5;
            const x = ((i * 139 + Math.sin(i * 2.17) * 38) % (w + 160)) - 80;
            const y = floorTop + 36 + row * 42 + Math.floor(i / 5) * 38;
            const len = 54 + (i % 4) * 22;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + len, y - 5 + (i % 2) * 7);
            ctx.lineTo(x + len + 14, y + 8);
            ctx.stroke();
        }

        // 얇은 백색 균열선이 느리게 맥동한다. 빗금처럼 반복되지 않도록 수량을 제한한다.
        ctx.strokeStyle = `rgba(255,255,255,${0.18 + Math.sin(t * 1.4) * 0.04})`;
        ctx.lineWidth = 1.2;
        const cracks = [
            [[w*0.10, h*0.20], [w*0.17, h*0.16], [w*0.22, h*0.19], [w*0.29, h*0.13]],
            [[w*0.68, h*0.18], [w*0.72, h*0.13], [w*0.77, h*0.18], [w*0.83, h*0.12]],
            [[w*0.42, h*0.72], [w*0.48, h*0.68], [w*0.56, h*0.72], [w*0.61, h*0.66]]
        ];
        cracks.forEach(line => {
            ctx.beginPath();
            line.forEach((pt, idx) => idx ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]));
            ctx.stroke();
        });

        ctx.fillStyle = 'rgba(255,255,255,0.66)';
        ctx.font = '700 13px "DNF Forged Blade", Arial, sans-serif';
        ctx.fillText(stageName || '카시야스 이면세계', 18, 28);
        ctx.restore();
    };

    GameRenderer.drawP3M3Portals = function(ctx, gameState) {
        if (!this.isP3M3Active(gameState)) return;
        const rt = gameState.p3m3Runtime || {};
        if (rt.intro && rt.intro.active) return;
        if (typeof P3M3FinalIssenSystem === 'undefined' || !P3M3FinalIssenSystem.getActivePortals) return;
        const portals = P3M3FinalIssenSystem.getActivePortals(gameState);
        const groundBase = this.GROUND_BASE_Y || 400;
        const t = performance.now() * 0.001;
        ctx.save();
        portals.forEach(portal => {
            const renderType = String(portal.Render_Type || 'OBJ_P3_M3_PORTAL').trim().toUpperCase();
            if (renderType && renderType !== 'OBJ_P3_M3_PORTAL') return;
            const x = parseFloat(portal.Position_X) || 0;
            const y = parseFloat(portal.Position_Y) || 0;
            const screenY = groundBase + y;
            const pulse = 1 + Math.sin(t * 4.2 + x * 0.01) * 0.08;
            ctx.save();
            ctx.translate(x, screenY);
            ctx.scale(pulse, pulse);
            const grad = ctx.createRadialGradient(0, -26, 8, 0, -26, 74);
            grad.addColorStop(0, 'rgba(255,255,255,0.92)');
            grad.addColorStop(0.35, 'rgba(190,220,255,0.54)');
            grad.addColorStop(1, 'rgba(20,20,30,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, -26, 50, 82, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.76)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, -26, 34, 68, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });
        ctx.restore();
    };

    GameRenderer.drawP3M3BossAuraObjects = function(ctx, gameState) {
        if (!this.isP3M3Active(gameState)) return;
        const rt = gameState.p3m3Runtime || {};
        const now = Date.now() / 1000;
        const groundY = this.GROUND_BASE_Y || 220;
        const clamp01 = v => Math.max(0, Math.min(1, parseFloat(v) || 0));

        const getBody = monster => {
            if (!monster) return null;
            const scale = parseFloat(monster.scale) || 1;
            const bodyW = Math.max(76, parseFloat(monster.d && monster.d.bodyX) || 92) * scale;
            const bodyH = Math.max(130, parseFloat(monster.d && monster.d.bodyZ) || 170) * scale;
            return {
                x: parseFloat(monster.x) || 0,
                y: groundY + (parseFloat(monster.y) || 0) - (parseFloat(monster.z) || 0) - bodyH * 0.43,
                bodyW,
                bodyH
            };
        };

        const drawNormalShield = (monster, obj) => {
            if (!monster || !obj || !obj.active) return;
            const vfx = String((obj.data && obj.data.VFX_Type) || '').trim().toUpperCase();
            if (vfx !== 'EFT_P3_M3_NORMAL_DEFENCE_AURA') return;
            const body = getBody(monster);
            if (!body) return;
            const hitT = clamp01((parseFloat(obj.hitFlashTimer) || 0) / 0.16);
            const idlePulse = 1 + Math.sin(now * 4.8) * 0.012;
            const hitScale = 1 + hitT * 0.065;
            const rx = body.bodyW * 1.04;
            const ry = body.bodyH * 0.68;

            ctx.save();
            ctx.translate(body.x, body.y);
            ctx.scale(idlePulse * hitScale, idlePulse * hitScale);
            ctx.globalCompositeOperation = 'lighter';

            // 캐릭터 몸에 붙는 오라가 아니라, 신체 외곽에 한 겹 떨어진 반투명 보호막으로 보이게 한다.
            const membrane = ctx.createRadialGradient(0, 0, Math.max(8, rx * 0.18), 0, 0, Math.max(rx, ry));
            membrane.addColorStop(0.00, 'rgba(255,72,120,0.015)');
            membrane.addColorStop(0.55, 'rgba(170,28,190,0.035)');
            membrane.addColorStop(0.82, 'rgba(116,10,158,0.075)');
            membrane.addColorStop(1.00, 'rgba(40,0,74,0)');
            ctx.fillStyle = membrane;
            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();

            const rim = ctx.createLinearGradient(-rx, 0, rx, 0);
            rim.addColorStop(0.00, 'rgba(255,90,145,0.88)');
            rim.addColorStop(0.16, 'rgba(186,42,232,0.72)');
            rim.addColorStop(0.50, 'rgba(102,16,154,0.42)');
            rim.addColorStop(0.84, 'rgba(208,46,230,0.74)');
            rim.addColorStop(1.00, 'rgba(255,100,150,0.90)');
            ctx.strokeStyle = rim;
            ctx.lineWidth = 3.4;
            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();

            // 참고 이미지처럼 좌우가 특히 밝아 보이는 에너지 날/초승달을 만든다.
            const hotAlpha = 0.70 + Math.sin(now * 6.3) * 0.10;
            ctx.lineCap = 'round';
            ctx.strokeStyle = `rgba(255,196,225,${hotAlpha})`;
            ctx.shadowColor = 'rgba(235,52,214,0.88)';
            ctx.shadowBlur = 12;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.ellipse(0, 0, rx * 1.015, ry * 0.985, 0, -0.34 * Math.PI, 0.34 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0, 0, rx * 1.015, ry * 0.985, 0, 0.66 * Math.PI, 1.34 * Math.PI);
            ctx.stroke();

            ctx.shadowBlur = 5;
            ctx.lineWidth = 2.1;
            const spin = now * 0.72;
            for (let i = 0; i < 3; i++) {
                const phase = spin + i * (Math.PI * 2 / 3);
                ctx.strokeStyle = i === 1 ? 'rgba(255,68,122,0.48)' : 'rgba(183,66,255,0.48)';
                ctx.beginPath();
                ctx.ellipse(0, 0, rx * (0.86 + i * 0.055), ry * (0.72 + i * 0.055), phase * 0.08, phase, phase + Math.PI * 0.78);
                ctx.stroke();
            }

            // 피격 시: 크게 부풀기보다는 짧은 붉은 점멸 + 약한 팽창 + 충격선으로 반응한다.
            if (hitT > 0) {
                const hitAlpha = Math.pow(hitT, 0.72);
                ctx.shadowBlur = 18;
                ctx.shadowColor = `rgba(255,28,48,${0.78 * hitAlpha})`;
                ctx.strokeStyle = `rgba(255,54,76,${0.92 * hitAlpha})`;
                ctx.lineWidth = 4.2;
                ctx.beginPath();
                ctx.ellipse(0, 0, rx * (1.00 + 0.035 * hitAlpha), ry * (1.00 + 0.035 * hitAlpha), 0, 0, Math.PI * 2);
                ctx.stroke();

                const impactSide = ((obj.hitCount || 0) % 2 === 0) ? 1 : -1;
                const ix = impactSide * rx * 0.78;
                ctx.lineWidth = 2.8;
                for (let i = 0; i < 5; i++) {
                    const a = (-0.55 + i * 0.275) * Math.PI;
                    const len = 18 + i * 3;
                    ctx.beginPath();
                    ctx.moveTo(ix, Math.sin(a) * ry * 0.18);
                    ctx.lineTo(ix + impactSide * Math.cos(a) * len, Math.sin(a) * ry * 0.18 + Math.sin(a) * len);
                    ctx.stroke();
                }
            }
            ctx.restore();
        };

        const drawHiddenSmoke = (monster, obj) => {
            if (!monster || !obj || !obj.active) return;
            const vfx = String((obj.data && obj.data.VFX_Type) || '').trim().toUpperCase();
            if (vfx !== 'EFT_P3_M3_HIDDEN_HP_DRAIN_AURA') return;
            const body = getBody(monster);
            if (!body) return;

            ctx.save();
            ctx.translate(body.x, body.y + body.bodyH * 0.25);

            // 몸 주변 공간 자체가 숨쉬듯 맥동하는 흰색 에너지장. 보호막과 달리 단단한 외곽선은 만들지 않는다.
            const pulse = 0.5 + Math.sin(now * 3.4) * 0.5;
            const slowPulse = 0.5 + Math.sin(now * 1.65 + 0.8) * 0.5;
            ctx.globalCompositeOperation = 'lighter';
            const auraR = Math.max(body.bodyW * 0.72, body.bodyH * 0.46);
            const aura = ctx.createRadialGradient(0, -body.bodyH * 0.18, body.bodyW * 0.05, 0, -body.bodyH * 0.18, auraR);
            aura.addColorStop(0, `rgba(255,255,255,${0.19 + pulse * 0.08})`);
            aura.addColorStop(0.34, `rgba(248,250,255,${0.105 + pulse * 0.045})`);
            aura.addColorStop(0.70, `rgba(225,232,242,${0.055 + slowPulse * 0.035})`);
            aura.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.ellipse(0, -body.bodyH * 0.18, body.bodyW * (0.62 + pulse * 0.07), body.bodyH * (0.55 + pulse * 0.05), 0, 0, Math.PI * 2);
            ctx.fill();

            // 공간 파동: 여러 겹의 타원 파장이 몸에서 바깥쪽으로 반복해서 퍼져 나간다.
            ctx.lineCap = 'round';
            for (let i = 0; i < 4; i++) {
                const phase = (now * 0.46 + i * 0.245) % 1;
                const eased = phase * phase * (3 - 2 * phase);
                const alpha = (1 - phase) * (0.30 - i * 0.025);
                ctx.strokeStyle = `rgba(245,248,255,${Math.max(0, alpha)})`;
                ctx.lineWidth = 2.2 + (1 - phase) * 2.8;
                ctx.shadowColor = `rgba(255,255,255,${Math.max(0, alpha * 0.75)})`;
                ctx.shadowBlur = 10 + (1 - phase) * 8;
                ctx.beginPath();
                ctx.ellipse(0, -body.bodyH * 0.22, body.bodyW * (0.45 + eased * 0.62), body.bodyH * (0.42 + eased * 0.48), 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            // 신체에서 직접 솟구치는 굵은 반투명 흰 연기. 검은 이면세계에서도 분명히 보이도록 기존보다 농도를 높인다.
            ctx.globalCompositeOperation = 'source-over';
            for (let i = 0; i < 24; i++) {
                const seed = (i * 0.137 + 0.19) % 1;
                const phase = (now * (0.25 + (i % 5) * 0.016) + seed) % 1;
                const rise = phase;
                const side = (i % 2 === 0 ? -1 : 1);
                const baseX = side * body.bodyW * (0.06 + (i % 6) * 0.052);
                const drift = Math.sin(now * 1.2 + i * 1.71) * body.bodyW * 0.13;
                const x = baseX * (1 - rise * 0.30) + drift * rise;
                const y = -body.bodyH * (0.08 + rise * (0.74 + (i % 3) * 0.055));
                const radius = body.bodyW * (0.15 + rise * 0.24 + (i % 3) * 0.022);
                const fade = Math.sin(Math.PI * phase);
                const alpha = Math.max(0, fade) * (0.17 + (i % 4) * 0.018);
                const g = ctx.createRadialGradient(x, y, radius * 0.08, x, y, radius);
                g.addColorStop(0, `rgba(255,255,255,${alpha})`);
                g.addColorStop(0.34, `rgba(250,251,255,${alpha * 0.74})`);
                g.addColorStop(0.72, `rgba(228,232,240,${alpha * 0.34})`);
                g.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.ellipse(x, y, radius * (0.84 + rise * 0.40), radius * (0.60 + rise * 0.48), Math.sin(i * 1.9) * 0.18, 0, Math.PI * 2);
                ctx.fill();
            }

            // 신체 표면의 핵심 발광층도 강하게 유지한다.
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 7; i++) {
                const x = (i - 3) * body.bodyW * 0.10;
                const y = -body.bodyH * (0.18 + (i % 2) * 0.095);
                const r = body.bodyW * (0.22 + pulse * 0.035);
                const g = ctx.createRadialGradient(x, y, 1, x, y, r);
                g.addColorStop(0, `rgba(255,255,255,${0.24 + pulse * 0.08})`);
                g.addColorStop(0.44, `rgba(240,244,252,${0.105 + pulse * 0.035})`);
                g.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        };

        const centerBoss = rt.monstersByRole && rt.monstersByRole.CENTER_BOSS;
        const trueBoss = rt.monstersByRole && rt.monstersByRole.TRUE_BOSS;
        drawNormalShield(centerBoss, rt.normalDefenceObject);
        drawHiddenSmoke(trueBoss, rt.hiddenDebuffObject);

        // 보호막 파훼 순간에는 강하게 터지되, 지속 오라처럼 보이지 않도록 짧게 소멸시킨다.
        const fx = rt.normalDefenceBreakFx;
        if (fx && fx.timer > 0 && centerBoss) {
            const body = getBody(centerBoss);
            const maxTimer = Math.max(0.01, parseFloat(fx.maxTimer) || 0.46);
            const t = 1 - clamp01((parseFloat(fx.timer) || 0) / maxTimer);
            const remain = Math.pow(1 - t, 1.7);
            const rx = body.bodyW * 1.04;
            const ry = body.bodyH * 0.68;
            ctx.save();
            ctx.translate(body.x, body.y);
            ctx.globalCompositeOperation = 'lighter';

            const flashAlpha = Math.max(0, 1 - t * 3.4);
            if (flashAlpha > 0) {
                ctx.strokeStyle = `rgba(255,210,232,${0.96 * flashAlpha})`;
                ctx.shadowColor = 'rgba(244,38,205,0.95)';
                ctx.shadowBlur = 22;
                ctx.lineWidth = 8 * flashAlpha + 2;
                ctx.beginPath();
                ctx.ellipse(0, 0, rx * (1 + t * 0.18), ry * (1 + t * 0.18), 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.shadowBlur = 8;
            for (let i = 0; i < 18; i++) {
                const a = (Math.PI * 2 * i / 18) + 0.18;
                const edgeX = Math.cos(a) * rx;
                const edgeY = Math.sin(a) * ry;
                const travel = 34 + 105 * t + (i % 4) * 9;
                const tx = edgeX + Math.cos(a) * travel;
                const ty = edgeY + Math.sin(a) * travel * 0.72;
                ctx.strokeStyle = i % 3 === 0
                    ? `rgba(255,88,124,${0.92 * remain})`
                    : `rgba(200,72,255,${0.80 * remain})`;
                ctx.lineWidth = Math.max(1, 4.5 * remain);
                ctx.beginPath();
                ctx.moveTo(edgeX * (0.92 + 0.08 * t), edgeY * (0.92 + 0.08 * t));
                ctx.lineTo(tx, ty);
                ctx.stroke();
            }
            ctx.restore();
        }
    };

    GameRenderer.drawP3M3MonsterDebug = function(ctx, gameState) {
        if (!this.isP3M3Active(gameState)) return;
        const rt = gameState.p3m3Runtime || {};
        const rows = Array.isArray(rt.debugSnapshot) ? rt.debugSnapshot : [];
        const groundBase = this.GROUND_BASE_Y || 400;
        ctx.save();
        rows.forEach(row => {
            if (!row || row.suppressed) return;
            const x = parseFloat(row.x) || 0;
            const y = groundBase + (parseFloat(row.y) || 0) - 168;
            const hpRate = Math.max(0, Math.min(1, (parseFloat(row.hp) || 0) / Math.max(1, parseFloat(row.maxHp) || 1)));
            const line1 = `${row.role} ${row.state} ${row.static ? 'STATIC' : 'AI'}`;
            const line2 = `P:${row.patternId || '-'} A:${row.actionId || '-'} T:${(parseFloat(row.timer) || 0).toFixed(2)}`;
            const line3 = `xy ${Math.round(row.x)},${Math.round(row.y)} d ${row.dx.toFixed(1)},${row.dy.toFixed(1)}`;
            const boxW = 260;
            const boxH = 62;
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.strokeStyle = row.hidden ? 'rgba(255,92,92,0.95)' : 'rgba(255,255,255,0.42)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x - boxW / 2, y - boxH, boxW, boxH, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = row.hidden ? '#ffb0a8' : '#ffffff';
            ctx.font = '700 11px "DNF Forged Blade", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(line1, x - boxW / 2 + 8, y - 44);
            ctx.fillStyle = '#9fd7ff';
            ctx.fillText(line2, x - boxW / 2 + 8, y - 27);
            ctx.fillStyle = '#ffd98a';
            ctx.fillText(line3, x - boxW / 2 + 8, y - 10);
            ctx.fillStyle = 'rgba(255,255,255,0.14)';
            ctx.fillRect(x - boxW / 2 + 8, y - 7, boxW - 16, 4);
            ctx.fillStyle = '#ff6f61';
            ctx.fillRect(x - boxW / 2 + 8, y - 7, (boxW - 16) * hpRate, 4);
        });
        ctx.restore();
    };


    // 패턴 제한시간은 하단 HUD의 공용 bossCastGauge를 재사용해 숫자 없이 표시한다.
    GameRenderer.drawP3M3TimeLimitUI = function(ctx, canvas, gameState) {
        return;
    };

    GameRenderer.drawP3M3IntroOverlay = function(ctx, canvas, gameState) {
        const rt = gameState && gameState.p3m3Runtime;
        const intro = rt && rt.intro;
        if (!intro || !intro.active) return false;
        const w = canvas.width;
        const h = canvas.height;
        const phase = String(intro.phase || '').toUpperCase();
        const pt = Math.max(0, parseFloat(intro.phaseTimer) || 0);
        const d = intro.durations || { align: 0.38, walk: 1.55, slash: 0.48, shatter: 0.82, flash: 0.28, blackout: 0.52 };
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';

        if (phase === 'ALIGN' || phase === 'WALK_CENTER') {
            const a = phase === 'ALIGN' ? 0.18 : 0.10;
            ctx.fillStyle = `rgba(0,0,0,${a})`;
            ctx.fillRect(0, 0, w, h);
        }

        if (phase === 'SLASH_READY' || phase === 'SHATTER' || phase === 'FLASH' || phase === 'BLACKOUT') {
            const shatterT = phase === 'SLASH_READY'
                ? Math.max(0, Math.min(1, pt / Math.max(0.01, d.slash))) * 0.38
                : phase === 'SHATTER'
                    ? Math.max(0.38, Math.min(1, 0.38 + pt / Math.max(0.01, d.shatter) * 0.62))
                    : 1;
            const cx = w * 0.52;
            const cy = h * 0.45;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-0.08);
            const slashLen = w * (0.45 + 0.58 * shatterT);
            const slashH = 16 + 22 * shatterT;
            const grad = ctx.createLinearGradient(-slashLen * 0.52, 0, slashLen * 0.52, 0);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.18, 'rgba(255,255,255,0.38)');
            grad.addColorStop(0.48, 'rgba(255,255,255,0.96)');
            grad.addColorStop(0.62, 'rgba(170,220,255,0.66)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(-slashLen * 0.52, -slashH * 0.15);
            ctx.quadraticCurveTo(0, -slashH * 1.2, slashLen * 0.52, -slashH * 0.25);
            ctx.lineTo(slashLen * 0.50, slashH * 0.55);
            ctx.quadraticCurveTo(0, slashH * 1.35, -slashLen * 0.52, slashH * 0.35);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = `rgba(255,255,255,${0.35 + shatterT * 0.35})`;
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();

            // 시공섬식 화면 파괴: 중앙 절단선에서 검은 균열이 화면 전체로 확산된다.
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const rays = [
                [-0.50,-0.18, -0.05,-0.06, -0.92,-0.30],
                [-0.42, 0.02, -0.02, 0.02, -0.88, 0.18],
                [-0.30, 0.22, 0.02, 0.05, -0.68, 0.52],
                [ 0.10,-0.08, 0.00,-0.04, 0.92,-0.38],
                [ 0.04, 0.04, 0.01, 0.02, 0.88, 0.12],
                [ 0.18, 0.17, 0.03, 0.05, 0.73, 0.48],
                [-0.02,-0.12, -0.01,-0.02, 0.26,-0.74],
                [ 0.00, 0.11, 0.00, 0.03, -0.18, 0.86],
                [ 0.24,-0.03, 0.02,-0.02, 0.48,-0.70],
                [-0.18, 0.08, -0.02, 0.02, -0.44, 0.72]
            ];
            rays.forEach((r, i) => {
                const sx = cx + r[1] * w * 0.28;
                const sy = cy + r[2] * h * 0.28;
                const ex = cx + r[4] * w * shatterT;
                const ey = cy + r[5] * h * shatterT;
                const midx = sx + (ex - sx) * (0.36 + (i % 3) * 0.06);
                const midy = sy + (ey - sy) * (0.42 - (i % 2) * 0.07);
                ctx.strokeStyle = `rgba(0,0,0,${0.62 + shatterT * 0.34})`;
                ctx.lineWidth = (12 - (i % 4) * 1.7) * shatterT;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(midx, midy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
                ctx.strokeStyle = `rgba(235,250,255,${0.45 + shatterT * 0.38})`;
                ctx.lineWidth = Math.max(1.2, (3.2 - (i % 3) * 0.35) * shatterT);
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(midx, midy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
            });

            // 깨진 조각의 흰 면/검은 면 대비
            const shardCount = 16;
            for (let i = 0; i < shardCount; i++) {
                const ang = (-Math.PI * 0.92) + (Math.PI * 1.84) * (i / (shardCount - 1));
                const dist = (0.12 + (i % 5) * 0.035) * Math.min(w, h) + shatterT * (110 + (i % 4) * 34);
                const sx = cx + Math.cos(ang) * dist;
                const sy = cy + Math.sin(ang) * dist * 0.72;
                const size = (18 + (i % 5) * 10) * shatterT;
                ctx.fillStyle = i % 2 ? `rgba(255,255,255,${0.12 + shatterT * 0.18})` : `rgba(0,0,0,${0.24 + shatterT * 0.34})`;
                ctx.strokeStyle = `rgba(255,255,255,${0.22 + shatterT * 0.28})`;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(sx, sy - size * 0.6);
                ctx.lineTo(sx + size * 1.1, sy - size * 0.12);
                ctx.lineTo(sx + size * 0.22, sy + size * 0.72);
                ctx.lineTo(sx - size * 0.82, sy + size * 0.15);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }

        if (phase === 'FLASH') {
            const a = Math.max(0, 1 - pt / Math.max(0.01, d.flash));
            ctx.fillStyle = `rgba(255,255,255,${0.92 * a})`;
            ctx.fillRect(0, 0, w, h);
        }
        if (phase === 'BLACKOUT') {
            const k = Math.max(0, Math.min(1, pt / Math.max(0.01, d.blackout)));
            ctx.fillStyle = `rgba(0,0,0,${0.92 * k})`;
            ctx.fillRect(0, 0, w, h);
        }
        ctx.restore();
        return true;
    };

    GameRenderer.drawP3M3FinalIssenSlashOverlay = function(ctx, canvas, gameState) {
        if (!this.isP3M3Active(gameState)) return false;
        const rt = gameState.p3m3Runtime || {};
        if ((!rt.finalStarted && !rt.finalResolving) || (rt.dialogue && rt.dialogue.active)) return false;
        if (rt.finalEffectSuppressed) return false;

        const hidden = String(rt.routeType || '').toUpperCase() === 'ROUTE_HIDDEN';
        const w = canvas.width;
        const h = canvas.height;
        const chargeDur = Math.max(0, parseFloat(rt.finalChargeDuration) || 0);
        const atkDur = Math.max(0.2, parseFloat(rt.finalAttackDuration) || 2);
        const elapsed = Math.max(0, parseFloat(rt.finalTimelineElapsed) || 0);
        const local = elapsed - chargeDur;
        const hitStart = Math.max(0.05, parseFloat(rt.finalAttackHitStartLocal) || parseFloat(rt.finalTimelineHitStart || 0) - chargeDur || atkDur * 0.62);
        const hitEnd = Math.max(hitStart + 0.05, parseFloat(rt.finalAttackHitEndLocal) || hitStart + 0.35);
        const collapse = rt.finalCollapse && rt.finalCollapse.active ? rt.finalCollapse : null;
        if (!collapse && local < 0) return false;

        const clamp01 = v => Math.max(0, Math.min(1, v));
        const preWindow = Math.max(0.06, Math.min(0.16, hitStart * 0.28));
        const scarStart = Math.max(0, hitStart - preWindow);
        const scarT = collapse ? 1 : clamp01((local - scarStart) / Math.max(0.01, preWindow));
        const shatterWindow = Math.max(0.12, Math.min(0.28, hitEnd - hitStart + 0.08));
        const shatterT = collapse ? 1 : clamp01((local - hitStart) / Math.max(0.01, shatterWindow));
        const afterT = collapse
            ? clamp01((parseFloat(collapse.timer) || 0) / Math.max(0.05, parseFloat(collapse.duration) || 1.15))
            : clamp01((local - hitEnd) / Math.max(0.08, atkDur - hitEnd + 0.26));
        const anyT = Math.max(scarT, shatterT, afterT);
        if (anyT <= 0.001) return false;

        const sx = w * 1.12;
        const sy = -h * 0.14;
        const ex = -w * 0.12;
        const ey = h * 1.14;
        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / len;
        const uy = dy / len;
        const nx = -uy;
        const ny = ux;
        const pointAt = (q, off = 0) => ({ x: sx + dx * q + nx * off, y: sy + dy * q + ny * off });

        const drawLeafSlash = (q0, q1, halfW, alpha, colors = {}) => {
            const dark = colors.dark || `rgba(0,0,0,${0.86 * alpha})`;
            const core = colors.core || (hidden ? `rgba(178,8,48,${0.92 * alpha})` : `rgba(142,20,48,${0.82 * alpha})`);
            const accent = colors.accent || (hidden ? `rgba(102,14,124,${0.76 * alpha})` : `rgba(82,18,104,${0.62 * alpha})`);
            const hot = colors.hot || `rgba(200,190,198,${0.48 * alpha})`;
            const steps = 8;
            const top = [];
            const bot = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const q = q0 + (q1 - q0) * t;
                const s = 1 - Math.abs(t * 2 - 1);
                const off = halfW * s * (0.94 + ((i % 2) ? 0.03 : -0.03));
                top.push(pointAt(q, -off));
                bot.push(pointAt(q, off));
            }
            ctx.save();
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'butt';
            ctx.shadowColor = dark;
            ctx.shadowBlur = 20;
            const grad = ctx.createLinearGradient(top[0].x, top[0].y, top[top.length - 1].x, top[top.length - 1].y);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.18, accent);
            grad.addColorStop(0.46, core);
            grad.addColorStop(0.55, hidden ? `rgba(240,26,62,${0.78 * alpha})` : `rgba(176,34,58,${0.60 * alpha})`);
            grad.addColorStop(0.84, accent);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.strokeStyle = dark;
            ctx.lineWidth = Math.max(2.2, halfW * 0.16);
            ctx.beginPath();
            top.forEach((p, idx) => { if (!idx) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
            for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i].x, bot[i].y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = hot;
            ctx.shadowBlur = 12;
            ctx.lineWidth = Math.max(1.4, halfW * 0.05);
            ctx.beginPath();
            const p0 = pointAt(q0 + (q1 - q0) * 0.05, halfW * 0.05);
            const p1 = pointAt(q0 + (q1 - q0) * 0.95, -halfW * 0.05);
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
            ctx.restore();
        };

        const drawCrack = (q, side, reach, alpha, widthMul=1) => {
            const base = pointAt(q, (Math.sin(q * 25) * 3));
            const end = {
                x: base.x + nx * reach * side + ux * ((q * 100) % 5 - 2) * 20,
                y: base.y + ny * reach * side + uy * ((q * 100) % 5 - 2) * 20
            };
            const segs = 6;
            const pts = [];
            for (let i = 0; i <= segs; i++) {
                const t = i / segs;
                const j = (i === 0 || i === segs) ? 0 : ((i % 2 ? 1 : -1) * (3 + (i % 3) * 3) * alpha);
                pts.push({
                    x: base.x + (end.x - base.x) * t + nx * j * 0.35,
                    y: base.y + (end.y - base.y) * t + ny * j * 0.35
                });
            }
            ctx.save();
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'square';
            ctx.strokeStyle = `rgba(0,0,0,${0.92 * alpha})`;
            ctx.lineWidth = (side === 1 ? 5.5 : 4.2) * widthMul;
            ctx.beginPath();
            pts.forEach((p, idx) => { if (!idx) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
            ctx.stroke();
            ctx.strokeStyle = side === 1 ? `rgba(152,18,56,${0.56 * alpha})` : `rgba(94,22,122,${0.52 * alpha})`;
            ctx.lineWidth = Math.max(1.4, ctx.lineWidth * 0.32);
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            pts.forEach((p, idx) => { if (!idx) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
            ctx.stroke();
            ctx.restore();
        };

        const failureSequence = rt.failureSequence && rt.failureSequence.active ? rt.failureSequence : null;
        const caster = failureSequence && failureSequence.remote
            ? null
            : (hidden ? (rt.monstersByRole && rt.monstersByRole.TRUE_BOSS) : (rt.monstersByRole && rt.monstersByRole.CENTER_BOSS));
        const swingT = clamp01(Math.max(scarT, shatterT * 0.85));
        if (caster && swingT > 0.01) {
            const cx = (caster.x || w * 0.62);
            const cy = (caster.y || h * 0.52) - 70;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.translate(cx - 18 + (1 - swingT) * 40, cy - (1 - swingT) * 12);
            ctx.rotate(-0.88);
            const len2 = 220 + swingT * 150;
            const halfW2 = 18 + swingT * 12;
            const pts = [];
            for (let i = 0; i <= 12; i++) {
                const t = i / 12;
                const x = (t - 0.5) * len2;
                const s = 1 - Math.abs(t * 2 - 1);
                pts.push([x, -halfW2 * s * (0.94 + (i % 2 ? 0.03 : -0.03))]);
            }
            for (let i = 12; i >= 0; i--) {
                const t = i / 12;
                const x = (t - 0.5) * len2;
                const s = 1 - Math.abs(t * 2 - 1);
                pts.push([x, halfW2 * s * (0.94 + (i % 2 ? -0.03 : 0.03))]);
            }
            const grad = ctx.createLinearGradient(-len2 * 0.5, 0, len2 * 0.5, 0);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.18, hidden ? `rgba(88,18,116,${0.52 * swingT})` : `rgba(72,18,100,${0.34 * swingT})`);
            grad.addColorStop(0.50, hidden ? `rgba(208,18,58,${0.88 * swingT})` : `rgba(164,24,48,${0.72 * swingT})`);
            grad.addColorStop(0.82, hidden ? `rgba(88,18,116,${0.52 * swingT})` : `rgba(72,18,100,${0.34 * swingT})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            pts.forEach((p, idx) => { if (!idx) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        const scarAlpha = clamp01(scarT * 1.45);
        if (scarAlpha > 0) {
            const qEnd = 0.04 + 0.96 * scarT;
            drawLeafSlash(0.0, qEnd, (hidden ? 34 : 26) * (0.82 + scarT * 0.32), 0.40 + scarAlpha * 0.60);
            drawLeafSlash(0.02, Math.max(0.02, qEnd - 0.05), (hidden ? 12 : 10) * (0.78 + scarT * 0.20), 0.22 + scarAlpha * 0.28, {
                dark: `rgba(0,0,0,${0.30 * scarAlpha})`,
                core: `rgba(214,206,214,${0.42 * scarAlpha})`,
                accent: hidden ? `rgba(168,22,120,${0.28 * scarAlpha})` : `rgba(138,22,104,${0.22 * scarAlpha})`,
                hot: `rgba(255,255,255,${0.24 * scarAlpha})`
            });
        }

        if (shatterT > 0) {
            const breakAlpha = clamp01(shatterT * 1.18);
            const veil = ctx.createRadialGradient(w * 0.52, h * 0.48, h * 0.06, w * 0.52, h * 0.48, Math.max(w, h) * 0.84);
            veil.addColorStop(0, hidden ? `rgba(132,0,48,${0.14 * breakAlpha})` : `rgba(116,6,34,${0.10 * breakAlpha})`);
            veil.addColorStop(0.56, hidden ? `rgba(44,0,72,${0.22 * breakAlpha})` : `rgba(46,0,56,${0.15 * breakAlpha})`);
            veil.addColorStop(1, `rgba(0,0,0,${(hidden ? 0.34 : 0.26) * breakAlpha})`);
            ctx.fillStyle = veil;
            ctx.fillRect(0, 0, w, h);

            drawLeafSlash(0.0, 1.0, hidden ? 66 : 54, 0.24 + breakAlpha * 0.76, {
                dark: `rgba(0,0,0,${0.94 * breakAlpha})`,
                core: hidden ? `rgba(178,12,52,${0.74 * breakAlpha})` : `rgba(146,20,48,${0.62 * breakAlpha})`,
                accent: hidden ? `rgba(84,0,112,${0.62 * breakAlpha})` : `rgba(80,10,98,${0.46 * breakAlpha})`,
                hot: `rgba(212,206,214,${0.42 * breakAlpha})`
            });

            const crackCount = hidden ? 28 : 22;
            for (let i = 0; i < crackCount; i++) {
                const q = 0.08 + (i / Math.max(1, crackCount - 1)) * 0.84;
                const side = i % 2 ? 1 : -1;
                const reach = (hidden ? 220 : 170) + (i % 5) * (hidden ? 28 : 22);
                drawCrack(q, side, reach * breakAlpha, breakAlpha, 0.55 + breakAlpha * 0.55);
                if (breakAlpha > 0.34 && i % 3 === 0) drawCrack(q, -side, reach * 0.45 * breakAlpha, breakAlpha * 0.72, 0.42 + breakAlpha * 0.38);
            }

            const fall = afterT * afterT;
            const shardCount = hidden ? 22 : 16;
            for (let i = 0; i < shardCount; i++) {
                const q = 0.10 + ((i * 0.61803398875) % 0.82);
                const side = i % 2 ? 1 : -1;
                const base = pointAt(q, side * (46 + (i % 4) * 20) * breakAlpha);
                const size = ((hidden ? 32 : 26) + (i % 5) * 12) * (0.34 + breakAlpha * 0.82);
                ctx.save();
                ctx.translate(base.x + ((i % 6) - 3) * 10 * breakAlpha, base.y + fall * (110 + (i % 6) * 42));
                ctx.rotate((i * 0.46 + breakAlpha * 1.8 + fall * 1.6) * side);
                ctx.fillStyle = i % 3 === 0 ? `rgba(0,0,0,${0.72 * breakAlpha})`
                    : i % 3 === 1 ? `rgba(92,0,46,${0.36 * breakAlpha})`
                    : `rgba(166,162,170,${0.22 * breakAlpha})`;
                ctx.strokeStyle = `rgba(255,255,255,${0.22 * breakAlpha})`;
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(-size * 0.96, -size * 0.16);
                ctx.lineTo(-size * 0.18, -size * 0.82);
                ctx.lineTo(size * 0.96, -size * 0.30);
                ctx.lineTo(size * 0.40, size * 0.84);
                ctx.lineTo(-size * 0.44, size * 0.54);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }

        if (afterT > 0) {
            const a = clamp01(afterT);
            ctx.save();
            for (let i = 0; i < 8; i++) {
                const yy = -h * 0.18 + i * h * 0.17 + a * (110 + i * 36);
                const alpha = (0.06 + i * 0.014) * a;
                ctx.fillStyle = hidden ? `rgba(28,0,32,${alpha})` : `rgba(20,0,24,${alpha})`;
                ctx.beginPath();
                ctx.moveTo(0, yy);
                ctx.lineTo(w, yy - 52 + (i % 2) * 24);
                ctx.lineTo(w, yy + 86);
                ctx.lineTo(0, yy + 48 + (i % 3) * 20);
                ctx.closePath();
                ctx.fill();
            }
            ctx.fillStyle = `rgba(0,0,0,${0.18 * a})`;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }

        ctx.restore();
        return true;
    };

    GameRenderer.drawP3M3Overlay = function(ctx, canvas, gameState) {
        if (!this.isP3M3Active(gameState)) return;
        if (typeof this.drawP3M3IntroOverlay === 'function' && this.drawP3M3IntroOverlay(ctx, canvas, gameState)) return;
        const rt = gameState.p3m3Runtime;
        const rows = Array.isArray(rt.debugSnapshot) ? rt.debugSnapshot : [];
        const w = canvas.width;

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        if (typeof this.drawP3M3FinalIssenSlashOverlay === 'function') {
            this.drawP3M3FinalIssenSlashOverlay(ctx, canvas, gameState);
        }

        if (rt.failureSequence && rt.failureSequence.active) {
            const seq = rt.failureSequence;
            const patternRow = (typeof P3M3FinalIssenSystem !== 'undefined' && P3M3FinalIssenSystem.getPatternRow)
                ? P3M3FinalIssenSystem.getPatternRow(gameState, rt.patternId)
                : null;
            const title = String((patternRow && patternRow.Pattern_Name) || '세계를 가르는 일섬');
            const elapsed = Math.max(0, parseFloat(seq.elapsed) || 0);
            const fadeIn = Math.max(0, Math.min(1, elapsed / 0.18));
            const remain = Math.max(0, (parseFloat(seq.finishDelay) || 0) - elapsed);
            const fadeOut = remain < 0.45 ? Math.max(0, remain / 0.45) : 1;
            const alpha = fadeIn * fadeOut;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.92)';
            ctx.shadowBlur = 16;
            ctx.font = '900 34px "DNF Forged Blade", Arial, sans-serif';
            ctx.fillStyle = `rgba(255,255,255,${0.94 * alpha})`;
            ctx.fillText(title, canvas.width / 2, Math.max(72, canvas.height * 0.15));
            ctx.restore();
        }

        const drawBottomGauge = function(x, y, bw, label, valueText, rate, color) {
            const panelH = 66;
            const bh = 20;
            const clamped = Math.max(0, Math.min(1, parseFloat(rate) || 0));
            const accent = color || '#9fd7ff';
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.55)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 4;
            const panelGrad = ctx.createLinearGradient(x, y, x, y + panelH);
            panelGrad.addColorStop(0, 'rgba(36,34,30,0.94)');
            panelGrad.addColorStop(0.42, 'rgba(10,12,18,0.94)');
            panelGrad.addColorStop(1, 'rgba(0,0,0,0.88)');
            ctx.fillStyle = panelGrad;
            ctx.strokeStyle = 'rgba(210,173,82,0.70)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 10, y);
            ctx.lineTo(x + bw - 10, y);
            ctx.lineTo(x + bw, y + 10);
            ctx.lineTo(x + bw, y + panelH - 10);
            ctx.lineTo(x + bw - 10, y + panelH);
            ctx.lineTo(x + 10, y + panelH);
            ctx.lineTo(x, y + panelH - 10);
            ctx.lineTo(x, y + 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.14)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 6.5, y + 6.5, bw - 13, panelH - 13);

            ctx.fillStyle = 'rgba(255,255,255,0.86)';
            ctx.font = '900 13px "DNF Forged Blade", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(label, x + 14, y + 19);
            ctx.fillStyle = 'rgba(255,255,255,0.72)';
            ctx.font = '800 12px "DNF Forged Blade", Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(valueText, x + bw - 14, y + 19);

            const bx = x + 14;
            const by = y + 33;
            const innerW = bw - 28;
            ctx.fillStyle = 'rgba(255,255,255,0.11)';
            ctx.fillRect(bx, by, innerW, bh);
            const fillGrad = ctx.createLinearGradient(bx, by, bx + innerW, by);
            fillGrad.addColorStop(0, accent);
            fillGrad.addColorStop(0.65, accent);
            fillGrad.addColorStop(1, '#ffffff');
            ctx.fillStyle = fillGrad;
            ctx.fillRect(bx, by, innerW * clamped, bh);
            ctx.fillStyle = 'rgba(255,255,255,0.24)';
            ctx.fillRect(bx, by, innerW * clamped, 4);
            ctx.strokeStyle = 'rgba(255,255,255,0.44)';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx + 0.5, by + 0.5, innerW - 1, bh - 1);
            ctx.restore();
        };


        if (rt.dialogue && rt.dialogue.active) {
            ctx.restore();
            return;
        }

        // 최종 일섬 타이밍 게이지는 보스 렌더 단계에서 카시야스 머리 위에 직접 표시한다.
        // 대기 + 준비 액션 + 실제 공격 Hitbox_Start_Time까지 하나의 연속 게이지로 계산한다.


        if (gameState.isDebugView) {
            ctx.fillStyle = 'rgba(5,7,10,0.72)';
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.beginPath();
            ctx.roundRect(18, 170, 560, Math.max(78, 34 + rows.length * 58), 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = '800 14px "DNF Forged Blade", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`P3_M3 DEBUG frame ${rt.debugFrame || 0} area ${rt.currentAreaId}`, 36, 195);
            ctx.font = '700 11px "DNF Forged Blade", Arial, sans-serif';
            rows.forEach((row, idx) => {
                const y = 218 + idx * 58;
                const moved = Math.hypot(parseFloat(row.dx) || 0, parseFloat(row.dy) || 0);
                ctx.fillStyle = row.suppressed ? '#8f9aa8' : (row.static ? '#ffb0a8' : '#9fd7ff');
                ctx.fillText(`${row.role} id:${row.id} hp:${Math.round(row.hp)}/${Math.round(row.maxHp)} ${row.static ? 'STATIC' : 'AI'} ${row.hidden ? 'HIDDEN' : ''}`, 36, y);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`state:${row.state} pattern:${row.patternId || '-'} action:${row.actionId || '-'} type:${row.actionType || '-'} timer:${(parseFloat(row.timer) || 0).toFixed(2)} noWait:${(parseFloat(row.noWait) || 0).toFixed(2)}`, 36, y + 16);
                ctx.fillStyle = moved < 0.01 && row.actionId ? '#ff8a7a' : '#ffd98a';
                ctx.fillText(`xy:${Math.round(row.x)},${Math.round(row.y)} delta:${row.dx.toFixed(2)},${row.dy.toFixed(2)} move:${row.moveInfo ? `${row.moveInfo.type} ${Math.round(row.moveInfo.startX)},${Math.round(row.moveInfo.startY)}>${Math.round(row.moveInfo.endX)},${Math.round(row.moveInfo.endY)}` : '-'}`, 36, y + 32);
                ctx.fillStyle = '#b8c7ff';
                ctx.fillText(`allowed:${row.allowed || '-'}`, 36, y + 48);
            });
        }

        ctx.restore();
    };

    GameRenderer.drawP3M3Dialogue = function(ctx, canvas, gameState) {
        if (!this.isP3M3Active(gameState)) return;
        const rt = gameState.p3m3Runtime || {};
        const dlg = rt.dialogue || null;
        if (!dlg || !dlg.active || !Array.isArray(dlg.lines)) return;
        const line = dlg.lines[Math.max(0, Math.min(dlg.lines.length - 1, parseInt(dlg.index, 10) || 0))] || null;
        if (!line) return;

        const w = canvas.width;
        const h = canvas.height;
        const fontFamily = '"DNF Forged Blade", "Malgun Gothic", "Noto Sans KR", "Segoe UI", Arial, sans-serif';
        const panelW = Math.min(1260, Math.max(920, w - 180));
        const panelH = 168;
        const panelX = (w - panelW) / 2;
        const panelY = h - panelH - 22;
        const portraitSize = 132;
        const portraitX = panelX + 22;
        const portraitY = panelY + 16;
        const textX = portraitX + portraitSize + 24;
        const nameY = panelY + 42;
        const bodyY = panelY + 82;
        const textW = panelX + panelW - 34 - textX;

        const wrapText = (text, maxW, font) => {
            const chars = Array.from(String(text || ''));
            const lines = [];
            let current = '';
            ctx.font = font;
            for (const ch of chars) {
                if (ch === '\n') {
                    lines.push(current);
                    current = '';
                    continue;
                }
                const next = current + ch;
                if (current && ctx.measureText(next).width > maxW) {
                    lines.push(current);
                    current = ch.trimStart();
                } else {
                    current = next;
                }
            }
            if (current || lines.length === 0) lines.push(current);
            return lines.slice(0, 3);
        };

        const drawPortraitBackground = (x, y, size, speakerType) => {
            const type = String(speakerType || '').trim().toUpperCase();
            const grad = ctx.createLinearGradient(x, y, x, y + size);
            if (type === 'PLAYER') {
                grad.addColorStop(0, 'rgba(42,58,78,0.96)');
                grad.addColorStop(0.55, 'rgba(18,24,38,0.98)');
                grad.addColorStop(1, 'rgba(5,8,14,0.98)');
            } else {
                grad.addColorStop(0, 'rgba(116,38,38,0.96)');
                grad.addColorStop(0.48, 'rgba(44,18,26,0.98)');
                grad.addColorStop(1, 'rgba(5,5,8,0.98)');
            }
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, size, size);
            ctx.strokeStyle = 'rgba(240,204,112,0.52)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
            ctx.strokeStyle = 'rgba(0,0,0,0.82)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 4.5, y + 4.5, size - 9, size - 9);
        };

        const getPortraitCache = (key, drawFn) => {
            const cacheKey = `p3m3Portrait_${key}`;
            this._p3m3PortraitCache = this._p3m3PortraitCache || {};
            if (this._p3m3PortraitCache[cacheKey]) return this._p3m3PortraitCache[cacheKey];
            let off = null;
            try {
                off = document.createElement('canvas');
                off.width = 240;
                off.height = 240;
                const octx = off.getContext('2d');
                if (octx) drawFn(octx, off.width, off.height);
                this._p3m3PortraitCache[cacheKey] = off;
                return off;
            } catch (e) {
                return null;
            }
        };

        const drawKasiyasDialogueBust = (x, y, size) => {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x + 7, y + 7, size - 14, size - 14);
            ctx.clip();
            const img = getPortraitCache('KASIYAS_MODEL_BUST_V2', (octx, ow, oh) => {
                octx.clearRect(0, 0, ow, oh);
                octx.save();
                // 기존 카시야스 모델을 초상화용 고정 포즈로 크게 렌더한 뒤,
                // 머리~상체가 자연스럽게 보이는 영역만 대화창에 붙인다.
                octx.translate(ow * 0.50, oh * 1.16);
                octx.scale(1.32, 1.32);
                if (typeof this.drawKasiyasModel === 'function') {
                    this.drawKasiyasModel(octx, {
                        m: { boss: { action: null }, state: 'IDLE' },
                        d: { renderType: 'RENDER_KASIYAS_P1' },
                        renderType: 'RENDER_KASIYAS_P1',
                        w: 92,
                        h: 190,
                        face: 1,
                        stateKey: 'IDLE',
                        poseType: 'POSE_DEFAULT',
                        progress: 0,
                        isUI: true
                    });
                }
                octx.restore();
            });
            if (img) {
                ctx.imageSmoothingEnabled = true;
                // 상체 크롭: 과한 얼굴 확대 대신 머리/갈기/어깨/상체가 함께 들어오도록 한다.
                ctx.drawImage(img, 36, 8, 168, 168, x + 4, y + 0, size + 6, size + 6);
            }
            ctx.restore();
        };

        const drawPlayerDialogueBust = (x, y, size) => {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x + 7, y + 7, size - 14, size - 14);
            ctx.clip();
            const img = getPortraitCache('PLAYER_MODEL_BUST_V2', (octx, ow, oh) => {
                octx.clearRect(0, 0, ow, oh);
                octx.save();
                octx.translate(ow * 0.50, oh * 1.02);
                octx.scale(1.95, 1.95);
                const player = gameState && gameState.player ? gameState.player : {};
                const palette = (typeof this.resolvePlayerPalette === 'function')
                    ? this.resolvePlayerPalette(player)
                    : { dark: '#0d3f75', mid: '#1974bc', light: '#b9d9ee' };
                if (typeof this.drawModelBody === 'function') {
                    this.drawModelBody(octx, {
                        renderType: player.renderType || 'RENDER_HUMAN',
                        palette,
                        w: 42,
                        h: 92,
                        faceDir: 1,
                        state: 'Idle',
                        isChampion: false,
                        isMonster: false
                    });
                }
                octx.restore();
            });
            if (img) {
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(img, 58, 12, 124, 152, x + 6, y + 2, size - 6, size + 10);
            }
            ctx.restore();
        };

        const drawPortrait = (x, y, size) => {
            const speakerType = String(line.Speaker_Type || '').trim().toUpperCase();
            drawPortraitBackground(x, y, size, speakerType);
            if (speakerType === 'PLAYER') {
                drawPlayerDialogueBust(x, y, size);
            } else {
                drawKasiyasDialogueBust(x, y, size);
            }
        };

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowColor = 'rgba(0,0,0,0.68)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 5;

        const bg = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
        bg.addColorStop(0, 'rgba(22,24,33,0.96)');
        bg.addColorStop(0.45, 'rgba(9,11,18,0.94)');
        bg.addColorStop(1, 'rgba(0,0,0,0.92)');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 8);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(236,196,105,0.74)';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 0.5, panelY + 0.5, panelW - 1, panelH - 1);
        ctx.strokeStyle = 'rgba(255,255,255,0.16)';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX + 6.5, panelY + 6.5, panelW - 13, panelH - 13);

        drawPortrait(portraitX, portraitY, portraitSize);

        const name = String(line.Speaker_Name || '').trim() || String(line.Speaker_Type || '').trim() || '???';
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
        ctx.font = `900 18px ${fontFamily}`;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.82)';
        ctx.fillStyle = '#ffd987';
        ctx.strokeText(name, textX, nameY);
        ctx.fillText(name, textX, nameY);

        ctx.strokeStyle = 'rgba(240,204,112,0.24)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(textX, panelY + 48.5);
        ctx.lineTo(panelX + panelW - 36, panelY + 48.5);
        ctx.stroke();

        const bodyFont = `800 22px ${fontFamily}`;
        const lines = wrapText(line.Dialogue_Text || '', textW, bodyFont);
        ctx.font = bodyFont;
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0,0,0,0.88)';
        ctx.fillStyle = '#f3f3f3';
        const lineH = 32;
        lines.forEach((txt, idx) => {
            const yy = bodyY + idx * lineH;
            ctx.strokeText(txt, textX, yy);
            ctx.fillText(txt, textX, yy);
        });

        const guide = 'Space / X';
        ctx.font = `800 13px ${fontFamily}`;
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,255,255,0.58)';
        ctx.fillText(guide, panelX + panelW - 34, panelY + panelH - 18);
        ctx.restore();
    };

})();
