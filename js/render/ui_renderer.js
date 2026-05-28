// [카시야스 보스전] UI 렌더링 (ui_renderer.js)
// - 보스 UI: 던파식 상단 고정 HP 상태창 + 고정 머리 초상화 + 현재 패턴 번호 표시
// - 일반 몬스터/엘리트 UI: 기존 중앙 타겟 UI 유지
GameRenderer.drawTargetUI = function(ctx, canvas, targetUI, gameState = null) {
    if (!(targetUI && targetUI.timer > 0 && targetUI.monster)) return;

    const tm = targetUI.monster;
    const d = tm.d || {};
    const monsterGrade = String(d.grade || d.monsterType || d.Monster_Type || '').trim().toUpperCase();
    const isBoss = monsterGrade.includes('BOSS') || String(tm.id || '').startsWith('B') || !!tm.isStageBoss || !!tm.boss;
    const alpha = Math.min(1.0, Math.max(0.0, parseFloat(targetUI.timer) || 0));
    const uiFont = '"Malgun Gothic", "Segoe UI", Arial, sans-serif';
    const makeFont = function(weight, size) { return `${weight} ${size}px ${uiFont}`; };

    const readNumber = function() {
        for (let i = 0; i < arguments.length; i++) {
            const value = arguments[i];
            if (value === undefined || value === null || value === '') continue;
            const n = parseFloat(value);
            if (Number.isFinite(n)) return n;
        }
        return 0;
    };

    const getName = function(data) {
        return String(data.name || data.Monster_Name || data.Name || data.Dev_Name || 'UNKNOWN').trim();
    };

    const getLevel = function(data) {
        return parseInt(data.level || data.Level || 1, 10) || 1;
    };

    const drawSharpPanel = function(x, y, w, h, fillStyle, strokeStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fillRect(x, y, w, h);
        if (strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        }
    };

    const drawText = function(text, x, y, options) {
        const opt = options || {};
        ctx.save();
        ctx.font = opt.font || makeFont('bold', 14);
        ctx.textAlign = opt.align || 'left';
        ctx.textBaseline = opt.baseline || 'middle';
        if (opt.stroke !== false) {
            ctx.lineWidth = opt.strokeWidth || 3;
            ctx.strokeStyle = opt.strokeStyle || 'rgba(0,0,0,0.78)';
            ctx.strokeText(String(text), x, y);
        }
        ctx.fillStyle = opt.fill || '#ffffff';
        ctx.fillText(String(text), x, y);
        ctx.restore();
    };

    const drawDiamond = function(cx, cy, size, fillStyle, strokeStyle) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx + size, cy);
        ctx.lineTo(cx, cy + size);
        ctx.lineTo(cx - size, cy);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        if (strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
    };

    const getDisplayName = function(data) {
        return String(
            (data && (
                data.Pattern_Name ||
                data.Action_Name ||
                data.Object_Name ||
                data.Object_Action_Name ||
                data.Dev_Name ||
                data.Pattern_ID ||
                data.Action_ID ||
                data.Object_ID ||
                data.Object_Action_ID
            )) || ''
        ).trim();
    };

    const getPatternNumber = function(pattern, category) {
        if (!pattern) return '';

        const directNumberFields = [
            'Pattern_No',
            'Pattern_Number',
            'Pattern_Index',
            'Pattern_Order',
            'Pattern_Seq',
            'Pattern_Display_No'
        ];

        for (const key of directNumberFields) {
            const raw = pattern[key];
            if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
                const parsed = parseInt(raw, 10);
                if (Number.isFinite(parsed) && parsed > 0) return parsed;
            }
        }

        const patternId = parseInt(pattern.Pattern_ID, 10);
        if (!Number.isFinite(patternId)) return '';

        const seq = patternId % 1000;
        if (seq <= 0) return '';

        const categoryKey = String(category || pattern.Pattern_Category || '').trim().toUpperCase();
        if (categoryKey === 'BASIC') return seq;

        // 현재 데이터 기준: BASIC 231001~231005, MAJOR 231006~231008 구조.
        // 대형 패턴은 유저에게 1~3으로 보여주는 것이 목적이므로 BASIC 5개 뒤의 번호를 보정한다.
        if (categoryKey === 'MAJOR' || categoryKey === 'GIMMICK') {
            if (seq > 5 && seq <= 99) return seq - 5;
            return seq;
        }

        return seq;
    };

    const getBossPatternText = function(monster) {
        const boss = monster && monster.boss ? monster.boss : null;
        if (!boss) return '패턴 정보 없음';

        if ((parseFloat(boss.groggyTimer) || 0) > 0) return '그로기';

        if (boss.activePattern) {
            const pattern = boss.activePattern;
            const category = String(pattern.Pattern_Category || '').trim().toUpperCase();
            const patternName = getDisplayName(pattern) || '이름 없는 패턴';
            const patternNo = getPatternNumber(pattern, category);
            const numberText = patternNo ? ` ${patternNo}` : '';

            if (category === 'MAJOR' || category === 'GIMMICK') return `대형 패턴${numberText} : ${patternName}`;
            if (category === 'BASIC') return `기본 패턴${numberText} : ${patternName}`;
            return `진행 패턴${numberText} : ${patternName}`;
        }

        if ((parseFloat(boss.noPatternWaitTimer) || 0) > 0) return '다음 패턴 준비 중';
        return '패턴 대기 중';
    };

    const getBossReceivedDamageRate = function(monster) {
        const boss = monster && monster.boss ? monster.boss : null;
        const getDefaultRate = () => {
            const defaultRate = parseFloat(monster && monster.d && monster.d.defaultHitDmgRate);
            return Number.isFinite(defaultRate) && defaultRate >= 0 ? defaultRate : 1;
        };
        if (!boss) return getDefaultRate();
        if ((parseFloat(boss.groggyTimer) || 0) > 0) {
            const groggyRate = parseFloat(boss.groggyHitDmgRate);
            if (Number.isFinite(groggyRate) && groggyRate >= 0) return groggyRate;
            return getDefaultRate();
        }
        const action = boss.action || null;
        const rawRate = action && action.Action_Hit_DMG_Rate;
        const hasActionRate = !(rawRate === null || rawRate === undefined || rawRate === '');
        const actionRate = parseFloat(rawRate);
        if (hasActionRate && Number.isFinite(actionRate) && actionRate >= 0) return actionRate;

        const defenceType = String(action && (action.Action_Defence_Type || action.Defence_Type) || '').trim().toUpperCase();
        if (defenceType === 'INVINCIBLE') return 0;

        return getDefaultRate();
    };

    const getBossReceivedDamageRateText = function(monster) {
        const rate = getBossReceivedDamageRate(monster);
        return `받는 피해 ${Math.round(rate * 100)}%`;
    };

    const drawKasiyasPortrait = function(px, py, size) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(px + 2, py + 2, size - 4, size - 4);
        ctx.clip();

        const bg = ctx.createRadialGradient(px + size * 0.5, py + size * 0.35, 3, px + size * 0.5, py + size * 0.56, size * 0.72);
        bg.addColorStop(0, 'rgba(115, 35, 42, 0.96)');
        bg.addColorStop(0.58, 'rgba(39, 20, 33, 0.96)');
        bg.addColorStop(1, 'rgba(5, 6, 10, 0.98)');
        ctx.fillStyle = bg;
        ctx.fillRect(px + 2, py + 2, size - 4, size - 4);

        // UI 전용 고정 초상화: 카시야스의 머리/상반신 실루엣만 간단하고 안정적으로 표시한다.
        ctx.translate(px + size * 0.50, py + size * 0.53);
        const s = size / 72;
        ctx.scale(s, s);

        // 후광/기운
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = 'rgba(245, 202, 78, 0.90)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 16; i++) {
            const a = (Math.PI * 2 / 16) * i;
            const r1 = 18;
            const r2 = i % 2 === 0 ? 36 : 29;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1 - 9);
            ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2 - 9);
            ctx.stroke();
        }
        ctx.restore();

        // 상반신
        ctx.fillStyle = '#6d382d';
        ctx.strokeStyle = 'rgba(0,0,0,0.82)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, 30);
        ctx.lineTo(-22, 12);
        ctx.lineTo(-8, 4);
        ctx.lineTo(10, 5);
        ctx.lineTo(24, 13);
        ctx.lineTo(15, 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#2f452b';
        ctx.beginPath();
        ctx.moveTo(-8, 29);
        ctx.lineTo(-5, 8);
        ctx.lineTo(7, 8);
        ctx.lineTo(8, 29);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 목
        ctx.fillStyle = '#8d687b';
        ctx.fillRect(-5, 0, 10, 10);
        ctx.strokeRect(-5, 0, 10, 10);

        // 머리
        ctx.fillStyle = '#9b7184';
        ctx.strokeStyle = 'rgba(0,0,0,0.86)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -9, 11, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 머리카락 / 뿔 실루엣
        ctx.fillStyle = '#d8a92f';
        ctx.strokeStyle = 'rgba(0,0,0,0.82)';
        ctx.lineWidth = 1.7;
        const spikes = [
            [-13,-13,-27,-30,-10,-23], [-8,-16,-17,-39,-3,-25],
            [0,-18,0,-43,7,-25], [8,-16,21,-39,12,-22],
            [13,-12,31,-28,17,-18], [-12,-8,-30,-14,-14,-5],
            [12,-7,32,-12,15,-4]
        ];
        spikes.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(p[2], p[3]);
            ctx.lineTo(p[4], p[5]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });

        // 눈
        ctx.fillStyle = '#ff382c';
        ctx.shadowColor = 'rgba(255,50,35,0.75)';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.ellipse(-4, -10, 2.2, 1.2, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(5, -10, 2.2, 1.2, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    };

    if (isBoss) {
        ctx.save();
        ctx.globalAlpha = alpha;

        const marginX = 14;
        const x = marginX;
        const y = 14;
        const uiW = Math.min(canvas.width - marginX * 2, 1010);
        const uiH = 96;
        const portraitSize = 74;
        const portraitX = x + 10;
        const portraitY = y + 10;
        const infoX = portraitX + portraitSize + 12;
        const infoW = uiW - portraitSize - 34;
        const hp = readNumber(tm.hp, tm.currentHp, tm.HP, d.hp, d.HP);
        const maxHp = Math.max(1, readNumber(tm.maxHp, tm.maxHP, d.maxHp, d.HP, hp || 1));
        const hpRatio = Math.max(0, Math.min(1, hp / maxHp));
        const patternText = getBossPatternText(tm);
        const receivedDamageText = getBossReceivedDamageRateText(tm);

        // 외곽 그림자
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.76)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 5;
        ctx.fillStyle = 'rgba(0,0,0,0.82)';
        ctx.fillRect(x + 2, y + 2, uiW, uiH);
        ctx.restore();

        // 던파식 각진 상단 상태창 베이스
        const panelGrad = ctx.createLinearGradient(x, y, x, y + uiH);
        panelGrad.addColorStop(0, 'rgba(26, 58, 76, 0.97)');
        panelGrad.addColorStop(0.44, 'rgba(15, 36, 54, 0.98)');
        panelGrad.addColorStop(1, 'rgba(6, 8, 14, 0.97)');
        ctx.fillStyle = panelGrad;
        ctx.fillRect(x, y, uiW, uiH);

        ctx.strokeStyle = 'rgba(0,0,0,0.95)';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, uiW, uiH);
        ctx.strokeStyle = 'rgba(231, 183, 73, 0.94)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, uiW - 4, uiH - 4);
        ctx.strokeStyle = 'rgba(109, 177, 202, 0.56)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 5, y + 5, uiW - 10, uiH - 10);

        // 이름 영역
        const nameBoxY = y + 8;
        const nameBoxH = 32;
        const nameGrad = ctx.createLinearGradient(infoX, nameBoxY, infoX + infoW, nameBoxY);
        nameGrad.addColorStop(0, 'rgba(11, 32, 51, 0.98)');
        nameGrad.addColorStop(0.56, 'rgba(31, 78, 98, 0.96)');
        nameGrad.addColorStop(1, 'rgba(8, 15, 25, 0.93)');
        drawSharpPanel(infoX, nameBoxY, infoW, nameBoxH, nameGrad, 'rgba(150, 219, 238, 0.34)');

        drawText('보스', infoX + 12, nameBoxY + nameBoxH / 2 + 1, {
            font: makeFont('900', 16),
            fill: 'rgba(255, 219, 94, 0.98)'
        });
        drawText(`Lv.${getLevel(d)} ${getName(d)}`, infoX + 58, nameBoxY + nameBoxH / 2 + 1, {
            font: makeFont('900', 22),
            fill: '#ffffff',
            strokeWidth: 4
        });

        // HP 바
        const hpBarX = infoX;
        const hpBarY = y + 48;
        const hpBarW = infoW;
        const hpBarH = 18;
        ctx.fillStyle = 'rgba(0,0,0,0.88)';
        ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
        ctx.strokeStyle = 'rgba(0,0,0,0.94)';
        ctx.lineWidth = 2;
        ctx.strokeRect(hpBarX - 1, hpBarY - 1, hpBarW + 2, hpBarH + 2);

        const hpGrad = ctx.createLinearGradient(hpBarX, hpBarY, hpBarX, hpBarY + hpBarH);
        hpGrad.addColorStop(0, '#ff8668');
        hpGrad.addColorStop(0.36, '#ee3026');
        hpGrad.addColorStop(1, '#7a0c0f');
        ctx.fillStyle = hpGrad;
        ctx.fillRect(hpBarX, hpBarY, Math.max(0, hpBarW * hpRatio), hpBarH);

        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(hpBarX, hpBarY + 1, Math.max(0, hpBarW * hpRatio), 3);

        // HP바 분할선: 던파식 다단 HP바 느낌을 약하게 부여
        ctx.strokeStyle = 'rgba(0,0,0,0.52)';
        ctx.lineWidth = 1;
        const segmentCount = 12;
        for (let i = 1; i < segmentCount; i++) {
            const sx = hpBarX + (hpBarW / segmentCount) * i;
            ctx.beginPath();
            ctx.moveTo(sx, hpBarY);
            ctx.lineTo(sx, hpBarY + hpBarH);
            ctx.stroke();
        }

        drawText(`${Math.max(0, hp).toFixed(0)} / ${Math.max(0, maxHp).toFixed(0)}`, hpBarX + hpBarW - 8, hpBarY + hpBarH / 2 + 1, {
            font: makeFont('900', 14),
            align: 'right',
            fill: 'rgba(255,255,255,0.96)',
            strokeWidth: 3
        });

        // 패턴 표시줄
        const patternBoxY = y + 74;
        const patternBoxH = 20;
        drawSharpPanel(infoX, patternBoxY, infoW, patternBoxH, 'rgba(6, 8, 14, 0.90)', 'rgba(231, 183, 73, 0.42)');
        drawDiamond(infoX + 11, patternBoxY + patternBoxH / 2, 4.5, 'rgba(143, 50, 212, 0.96)', 'rgba(225, 191, 255, 0.72)');
        drawText('현재 패턴', infoX + 25, patternBoxY + patternBoxH / 2 + 1, {
            font: makeFont('900', 14),
            fill: 'rgba(245, 213, 101, 0.98)',
            strokeWidth: 3
        });
        const dmgBadgeW = 132;
        const dmgBadgeX = infoX + infoW - dmgBadgeW - 8;
        ctx.save();
        ctx.beginPath();
        ctx.rect(infoX + 102, patternBoxY, Math.max(80, dmgBadgeX - (infoX + 112)), patternBoxH);
        ctx.clip();
        drawText(patternText, infoX + 106, patternBoxY + patternBoxH / 2 + 1, {
            font: makeFont('900', 15),
            fill: '#ffffff',
            strokeWidth: 3
        });
        ctx.restore();

        ctx.fillStyle = 'rgba(35, 14, 14, 0.92)';
        ctx.fillRect(dmgBadgeX, patternBoxY + 2, dmgBadgeW, patternBoxH - 4);
        ctx.strokeStyle = 'rgba(255, 206, 92, 0.42)';
        ctx.lineWidth = 1;
        ctx.strokeRect(dmgBadgeX + 0.5, patternBoxY + 2.5, dmgBadgeW - 1, patternBoxH - 5);
        drawText(receivedDamageText, dmgBadgeX + dmgBadgeW - 7, patternBoxY + patternBoxH / 2 + 1, {
            font: makeFont('900', 13),
            align: 'right',
            fill: '#ffe6a1',
            strokeWidth: 3
        });

        // 대형 패턴 3번: 귀면족의 낙인 해제 조건은 HP 상태창에 붙이지 않고,
        // 하단에 별도 기믹 게이지 패널처럼 표시한다.
        const playerMark = gameState && gameState.player ? gameState.player.kasiyasOniMark : null;
        if (playerMark && playerMark.active) {
            const bossNeed = Math.max(1, parseInt(playerMark.requireBossGuard) || 2);
            const cloneNeed = Math.max(1, parseInt(playerMark.requireCloneGuard) || 2);
            const bossCnt = Math.max(0, Math.min(bossNeed, parseInt(playerMark.bossGuardCount) || 0));
            const cloneCnt = Math.max(0, Math.min(cloneNeed, parseInt(playerMark.cloneGuardCount) || 0));
            const bossDone = bossCnt >= bossNeed;
            const cloneDone = cloneCnt >= cloneNeed;
            const markW = Math.min(430, Math.max(330, infoW * 0.62));
            const markH = bossDone && cloneDone ? 34 : 50;
            const markX = infoX + 10;
            const markY = y + uiH + 8;
            drawSharpPanel(markX, markY, markW, markH, 'rgba(13, 4, 8, 0.90)', 'rgba(255, 205, 83, 0.70)');
            ctx.strokeStyle = playerMark.pulse ? 'rgba(255, 64, 64, 0.96)' : 'rgba(150, 45, 54, 0.55)';
            ctx.lineWidth = playerMark.pulse ? 2 : 1;
            ctx.strokeRect(markX + 2.5, markY + 2.5, markW - 5, markH - 5);
            drawDiamond(markX + 15, markY + 17, 5.5, playerMark.pulse ? 'rgba(255, 60, 60, 0.98)' : 'rgba(148, 36, 52, 0.94)', 'rgba(255, 214, 119, 0.78)');
            drawText('귀면족의 낙인 해제', markX + 30, markY + 17, {
                font: makeFont('900', 14),
                fill: 'rgba(255, 219, 122, 0.98)',
                strokeWidth: 3
            });

            const drawGuardGauge = (label, count, need, gx, gy, done, fillColor) => {
                drawText(label, gx, gy + 9, {
                    font: makeFont('900', 12),
                    fill: done ? '#b8ffc6' : '#ffffff',
                    strokeWidth: 3
                });
                const segW = 34;
                const segH = 11;
                const gap = 4;
                const sx = gx + 42;
                for (let i = 0; i < need; i++) {
                    const px = sx + i * (segW + gap);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.74)';
                    ctx.fillRect(px, gy + 2, segW, segH);
                    ctx.strokeStyle = 'rgba(255, 220, 111, 0.52)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(px + 0.5, gy + 2.5, segW - 1, segH - 1);
                    if (i < count) {
                        const grad = ctx.createLinearGradient(px, gy + 2, px, gy + 2 + segH);
                        grad.addColorStop(0, '#fff2a3');
                        grad.addColorStop(0.45, fillColor);
                        grad.addColorStop(1, '#7b2a12');
                        ctx.fillStyle = grad;
                        ctx.fillRect(px + 2, gy + 4, segW - 4, segH - 4);
                    }
                }
                drawText(`${count}/${need}`, sx + need * (segW + gap) + 6, gy + 9, {
                    font: makeFont('900', 11),
                    fill: done ? '#b8ffc6' : 'rgba(255,255,255,0.86)',
                    strokeWidth: 3
                });
            };

            if (bossDone && cloneDone) {
                drawText('연단된 칼날 준비', markX + markW - 16, markY + 17, {
                    font: makeFont('900', 15),
                    align: 'right',
                    fill: '#ffe96c',
                    strokeWidth: 4
                });
            } else {
                drawGuardGauge('본체', bossCnt, bossNeed, markX + 34, markY + 30, bossDone, '#dc2b26');
                drawGuardGauge('분신', cloneCnt, cloneNeed, markX + 208, markY + 30, cloneDone, '#9b49ff');
            }
        } else if (gameState && gameState.player && gameState.player.kasiyasTemperedBladeReady) {
            const markW = Math.min(390, Math.max(310, infoW * 0.56));
            const markH = 36;
            const markX = infoX + 10;
            const markY = y + uiH + 8;
            const pulse = 0.5 + Math.sin(Date.now() / 130) * 0.5;
            drawSharpPanel(markX, markY, markW, markH, 'rgba(18, 12, 4, 0.92)', 'rgba(255, 230, 116, 0.82)');
            ctx.strokeStyle = `rgba(255, 244, 155, ${0.55 + pulse * 0.30})`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(markX + 2.5, markY + 2.5, markW - 5, markH - 5);
            drawDiamond(markX + 17, markY + 18, 6.5, 'rgba(255, 238, 122, 0.98)', 'rgba(150, 232, 255, 0.78)');
            drawText('연단된 칼날 준비', markX + 34, markY + 21, {
                font: makeFont('900', 15),
                fill: '#fff0a3',
                strokeWidth: 4
            });
            drawText('강화 가드 1회', markX + markW - 16, markY + 21, {
                font: makeFont('900', 13),
                align: 'right',
                fill: 'rgba(180, 238, 255, 0.96)',
                strokeWidth: 3
            });
        }

        // 좌측 초상화 영역: 텍스트/체력바와 분리해서 안정적으로 렌더링한다.
        drawSharpPanel(portraitX, portraitY, portraitSize, portraitSize, 'rgba(5, 6, 10, 0.96)', 'rgba(231, 183, 73, 0.95)');
        ctx.strokeStyle = 'rgba(255,255,255,0.16)';
        ctx.lineWidth = 1;
        ctx.strokeRect(portraitX + 3, portraitY + 3, portraitSize - 6, portraitSize - 6);
        drawKasiyasPortrait(portraitX, portraitY, portraitSize);

        // 좌우 끝 장식선
        ctx.strokeStyle = 'rgba(231, 183, 73, 0.78)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + uiH + 2);
        ctx.lineTo(x + Math.min(uiW, 300), y + uiH + 2);
        ctx.moveTo(x + uiW - Math.min(uiW, 300), y + uiH + 2);
        ctx.lineTo(x + uiW - 5, y + uiH + 2);
        ctx.stroke();

        ctx.restore();
        ctx.globalAlpha = 1.0;
        return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(canvas.width / 2, 55);

    const borderColor = tm.isChampion ? '#bdc3c7' : '#555';
    const borderWidth = tm.isChampion ? 4 : 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(-300, 0, 600, 60);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(-300, 0, 600, 60);

    if (tm.isChampion) {
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(0, -15);
        ctx.lineTo(20, 0);
        ctx.fill();
    }

    ctx.fillStyle = '#333';
    ctx.fillRect(-290, 5, 50, 50);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-290, 5, 50, 50);
    ctx.clip();

    const w = (parseFloat(d.bodyX) || 40) * (parseFloat(tm.scale) || 1);
    const h = (parseFloat(d.bodyZ) || 80) * (parseFloat(tm.scale) || 1);
    const baseSize = Math.max(w, h * 0.6);
    const uiScale = 45 / Math.max(1, baseSize);
    const offsetY = 30 + (h * 0.85 * uiScale);

    ctx.translate(-265, offsetY);
    ctx.scale(uiScale, uiScale);

    const originalDir = tm.faceDir;
    tm.faceDir = 1;
    this.drawMonsterGraphics(ctx, tm, w, h, 1.0, true);
    tm.faceDir = originalDir;

    ctx.restore();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(-290, 5, 50, 50);

    ctx.fillStyle = 'white';
    ctx.font = makeFont('900', 17);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const prefix = tm.isChampion ? '[엘리트] ' : '';
    ctx.fillStyle = tm.isChampion ? '#bdc3c7' : 'white';
    ctx.fillText(`Lv.${getLevel(d)} ${prefix}${getName(d)}`, -225, 22);

    ctx.fillStyle = '#222';
    ctx.fillRect(-225, 32, 510, 18);

    const normalHp = readNumber(tm.hp, d.hp);
    const normalMaxHp = Math.max(1, readNumber(tm.maxHp, d.maxHp, d.HP, normalHp || 1));
    const normalHpRatio = Math.max(0, normalHp) / normalMaxHp;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-225, 32, 510 * Math.min(1, normalHpRatio), 18);

    ctx.fillStyle = 'white';
    ctx.font = makeFont('900', 13);
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.max(0, normalHp).toFixed(0)} / ${normalMaxHp.toFixed(0)}`, 30, 45);

    ctx.restore();
    ctx.globalAlpha = 1.0;
};


GameRenderer.drawBossPatternDialogue = function(ctx, canvas, gameState) {
    const dlg = gameState && gameState.bossPatternDialogue ? gameState.bossPatternDialogue : null;
    if (!dlg || !dlg.text || (parseFloat(dlg.delay) || 0) > 0) return;

    const maxTime = Math.max(0.001, parseFloat(dlg.maxTime) || 1.2);
    const timer = Math.max(0, parseFloat(dlg.timer) || 0);
    if (timer <= 0) return;

    const ratio = Math.max(0, Math.min(1, timer / maxTime));
    const fadeIn = Math.min(1, (maxTime - timer) / 0.18);
    const fadeOut = Math.min(1, timer / 0.28);
    const alpha = Math.max(0, Math.min(1, fadeIn, fadeOut));
    const cx = canvas.width / 2;
    const cy = Math.max(138, canvas.height * 0.24);
    const text = String(dlg.text || '');
    const uiFont = '"Malgun Gothic", "Segoe UI", Arial, sans-serif';
    const boxW = Math.min(canvas.width * 0.72, Math.max(420, text.length * 31));
    const boxH = 54;
    const pulse = Math.sin((1 - ratio) * Math.PI * 4) * 0.5 + 0.5;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const x = cx - boxW / 2;
    const y = cy - boxH / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.86)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.fillRect(x, y, boxW, boxH);
    ctx.restore();

    const grad = ctx.createLinearGradient(x, y, x + boxW, y);
    grad.addColorStop(0, 'rgba(80, 0, 0, 0)');
    grad.addColorStop(0.18, 'rgba(90, 8, 10, 0.55)');
    grad.addColorStop(0.50, 'rgba(25, 6, 9, 0.84)');
    grad.addColorStop(0.82, 'rgba(90, 8, 10, 0.55)');
    grad.addColorStop(1, 'rgba(80, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, boxW, boxH);

    ctx.strokeStyle = `rgba(244, 186, 72, ${0.48 + pulse * 0.20})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + boxW * 0.10, y + 3);
    ctx.lineTo(x + boxW * 0.90, y + 3);
    ctx.moveTo(x + boxW * 0.10, y + boxH - 3);
    ctx.lineTo(x + boxW * 0.90, y + boxH - 3);
    ctx.stroke();

    ctx.font = `900 28px ${uiFont}`;
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.92)';
    ctx.strokeText(text, cx, cy + 1);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(102, 0, 0, 0.82)';
    ctx.strokeText(text, cx, cy + 1);
    ctx.fillStyle = 'rgba(255,245,224,0.98)';
    ctx.fillText(text, cx, cy + 1);

    ctx.restore();
};
