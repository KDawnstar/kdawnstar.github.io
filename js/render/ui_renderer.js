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

            if (category === 'MAJOR' || category === 'GIMMICK') {
                return `대형 패턴${numberText} : ${patternName}`;
            }
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
        let hpRatio = Math.max(0, Math.min(1, hp / maxHp));
        const phaseTransitionForHp = gameState && gameState.phaseTransition && gameState.phaseTransition.active && gameState.phaseTransition.boss === tm
            ? gameState.phaseTransition
            : null;
        if (phaseTransitionForHp && String(phaseTransitionForHp.phase || '').toUpperCase() === 'CUTSCENE') {
            const ptTimer = Math.max(0, parseFloat(phaseTransitionForHp.timer) || 0);
            const fillT = Math.max(0, Math.min(1, (ptTimer - 6.2) / 2.3));
            const easedFill = fillT * fillT * (3 - 2 * fillT);
            hpRatio = easedFill;
        }
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

        const p2M1Rt = tm && tm.boss ? tm.boss.p2MajorPattern1Runtime : null;
        const p2M1Active = tm && tm.boss && tm.boss.activePattern && String(tm.boss.activePattern.Pattern_ID || '').trim() === '232006' && p2M1Rt;
        if (p2M1Active) {
            const enh = Math.max(0, parseInt(p2M1Rt.enhanceCount) || 0);
            const dmgUp = Math.max(0, parseInt(p2M1Rt.atkDmgUpCount) || 0);
            const sizeUp = Math.max(0, parseInt(p2M1Rt.atkHitboxUpCount) || 0);
            const m1W = Math.min(430, Math.max(340, infoW * 0.56));
            const m1H = 34;
            const m1X = infoX + 10;
            const m1Y = y + uiH + 8;
            drawSharpPanel(m1X, m1Y, m1W, m1H, 'rgba(14, 5, 6, 0.92)', 'rgba(255, 194, 72, 0.70)');
            drawDiamond(m1X + 15, m1Y + 17, 5.5, 'rgba(220, 35, 36, 0.98)', 'rgba(255, 224, 126, 0.82)');
            drawText(`기운 증폭 ${enh}/8`, m1X + 30, m1Y + 17, {
                font: makeFont('900', 15),
                fill: '#ffe082',
                strokeWidth: 3
            });
            drawText(`피해 ${dmgUp} · 범위 ${sizeUp}`, m1X + m1W - 12, m1Y + 17, {
                font: makeFont('900', 13),
                align: 'right',
                fill: '#ffffff',
                strokeWidth: 3
            });
        }

        let belowBossUiOffset = 0;
        const p3Player = gameState && gameState.player ? gameState.player : null;
        const p3BossPhase = tm && tm.boss ? String(tm.boss.phaseId || tm.boss.phase && tm.boss.phase.Phase_ID || '').trim() : '';

        // 3페이즈 대형 1번 히든 보상은 보스 HP 상태창 아래가 아니라,
        // 던파식 좌측 상태 패널처럼 별도 표기한다. 미획득 상태는 표시하지 않는다.
        if (p3Player && p3Player.p3TrialWillBuff) {
            const flash = Math.max(0, Math.min(1, parseFloat(p3Player.p3TrialWillBuffFlashTimer) || 0));
            const willW = 292;
            const willH = 40;
            const willX = 8;
            const willY = Math.min(canvas.height - willH - 88, y + uiH + 58);
            ctx.save();
            ctx.globalAlpha = alpha;

            // 기존 게임 UI 톤에 맞춘 좌측 상태 패널. 위치/표기 방식은 던파식 기믹 상태 UI처럼 두되,
            // 단순 검은 박스가 아니라 보라/검붉은 테두리와 작은 아이콘으로 장식한다.
            const bg = ctx.createLinearGradient(willX, willY, willX + willW, willY + willH);
            bg.addColorStop(0.00, 'rgba(8, 3, 12, 0.94)');
            bg.addColorStop(0.48, 'rgba(22, 6, 28, 0.92)');
            bg.addColorStop(1.00, 'rgba(12, 3, 8, 0.91)');
            ctx.fillStyle = bg;
            ctx.fillRect(willX, willY, willW, willH);

            ctx.strokeStyle = flash > 0 ? `rgba(255,224,118,${0.45 + flash * 0.42})` : 'rgba(160, 88, 255, 0.56)';
            ctx.lineWidth = flash > 0 ? 2 : 1.4;
            ctx.strokeRect(willX + 0.5, willY + 0.5, willW - 1, willH - 1);
            ctx.strokeStyle = 'rgba(255, 58, 64, 0.36)';
            ctx.lineWidth = 1;
            ctx.strokeRect(willX + 3.5, willY + 3.5, willW - 7, willH - 7);

            ctx.fillStyle = 'rgba(92, 22, 28, 0.72)';
            ctx.fillRect(willX + 1, willY + 1, 5, willH - 2);
            ctx.fillStyle = 'rgba(120, 72, 255, 0.45)';
            ctx.fillRect(willX + 6, willY + 1, 2, willH - 2);

            if (flash > 0) {
                ctx.globalCompositeOperation = 'lighter';
                const g = ctx.createLinearGradient(willX, willY, willX + willW, willY);
                g.addColorStop(0, 'rgba(255,230,130,0)');
                g.addColorStop(0.44, `rgba(255,230,130,${0.16 * flash})`);
                g.addColorStop(1, 'rgba(255,230,130,0)');
                ctx.fillStyle = g;
                ctx.fillRect(willX, willY, willW, willH);
            }
            ctx.globalCompositeOperation = 'source-over';

            const iconX = willX + 23;
            const iconY = willY + willH / 2;
            drawDiamond(iconX, iconY, 7.0, flash > 0 ? 'rgba(255,218,108,0.98)' : 'rgba(178, 72, 255, 0.96)', 'rgba(255, 72, 68, 0.72)');
            ctx.strokeStyle = 'rgba(255, 232, 150, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(iconX - 11, iconY);
            ctx.lineTo(iconX - 4, iconY);
            ctx.moveTo(iconX + 4, iconY);
            ctx.lineTo(iconX + 11, iconY);
            ctx.stroke();

            drawText('시련을 극복한 강인한 의지', willX + 42, willY + willH / 2 + 1, {
                font: makeFont('900', 13),
                fill: '#ffffff',
                strokeStyle: 'rgba(0,0,0,0.95)',
                strokeWidth: 3
            });
            const countW = 42;
            const countX = willX + willW - countW - 9;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
            ctx.fillRect(countX, willY + 9, countW, willH - 18);
            ctx.strokeStyle = 'rgba(255, 211, 95, 0.66)';
            ctx.lineWidth = 1;
            ctx.strokeRect(countX + 0.5, willY + 9.5, countW - 1, willH - 19);
            drawText('1/1', countX + countW / 2, willY + willH / 2 + 1, {
                font: makeFont('900', 13),
                align: 'center',
                fill: flash > 0 ? '#ffe58a' : '#f4d27a',
                strokeStyle: 'rgba(0,0,0,0.95)',
                strokeWidth: 3
            });
            ctx.restore();
        }


        if (p3Player && p3Player.p3TrialBodyBuff) {
            const flash = Math.max(0, Math.min(1, parseFloat(p3Player.p3TrialBodyBuffFlashTimer) || 0));
            const bodyW = 292;
            const bodyH = 40;
            const bodyX = 8;
            const baseBuffY = Math.min(canvas.height - bodyH - 88, y + uiH + 58);
            const bodyY = baseBuffY + (p3Player.p3TrialWillBuff ? 44 : 0);
            ctx.save();
            ctx.globalAlpha = alpha;
            const bg = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY + bodyH);
            bg.addColorStop(0.00, 'rgba(13, 3, 6, 0.94)');
            bg.addColorStop(0.48, 'rgba(32, 7, 14, 0.92)');
            bg.addColorStop(1.00, 'rgba(12, 3, 8, 0.91)');
            ctx.fillStyle = bg;
            ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
            ctx.strokeStyle = flash > 0 ? `rgba(255,196,112,${0.45 + flash * 0.42})` : 'rgba(255, 95, 82, 0.56)';
            ctx.lineWidth = flash > 0 ? 2 : 1.4;
            ctx.strokeRect(bodyX + 0.5, bodyY + 0.5, bodyW - 1, bodyH - 1);
            ctx.strokeStyle = 'rgba(160, 88, 255, 0.30)';
            ctx.lineWidth = 1;
            ctx.strokeRect(bodyX + 3.5, bodyY + 3.5, bodyW - 7, bodyH - 7);
            ctx.fillStyle = 'rgba(120, 28, 22, 0.72)';
            ctx.fillRect(bodyX + 1, bodyY + 1, 5, bodyH - 2);
            ctx.fillStyle = 'rgba(255, 180, 80, 0.32)';
            ctx.fillRect(bodyX + 6, bodyY + 1, 2, bodyH - 2);
            if (flash > 0) {
                ctx.globalCompositeOperation = 'lighter';
                const g = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY);
                g.addColorStop(0, 'rgba(255,160,110,0)');
                g.addColorStop(0.44, `rgba(255,198,120,${0.16 * flash})`);
                g.addColorStop(1, 'rgba(255,160,110,0)');
                ctx.fillStyle = g;
                ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
            }
            ctx.globalCompositeOperation = 'source-over';
            const iconX = bodyX + 23;
            const iconY = bodyY + bodyH / 2;
            drawDiamond(iconX, iconY, 7.0, flash > 0 ? 'rgba(255,190,104,0.98)' : 'rgba(255, 94, 82, 0.96)', 'rgba(255, 222, 146, 0.74)');
            ctx.strokeStyle = 'rgba(255, 232, 150, 0.48)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(iconX - 11, iconY);
            ctx.lineTo(iconX - 4, iconY);
            ctx.moveTo(iconX + 4, iconY);
            ctx.lineTo(iconX + 11, iconY);
            ctx.stroke();
            drawText('역경을 이겨낸 강인한 육체', bodyX + 42, bodyY + bodyH / 2 + 1, {
                font: makeFont('900', 13),
                fill: '#ffffff',
                strokeStyle: 'rgba(0,0,0,0.95)',
                strokeWidth: 3
            });
            const countW = 42;
            const countX = bodyX + bodyW - countW - 9;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
            ctx.fillRect(countX, bodyY + 9, countW, bodyH - 18);
            ctx.strokeStyle = 'rgba(255, 190, 95, 0.66)';
            ctx.lineWidth = 1;
            ctx.strokeRect(countX + 0.5, bodyY + 9.5, countW - 1, bodyH - 19);
            drawText('1/1', countX + countW / 2, bodyY + bodyH / 2 + 1, {
                font: makeFont('900', 13),
                align: 'center',
                fill: flash > 0 ? '#ffd89a' : '#f4c27a',
                strokeStyle: 'rgba(0,0,0,0.95)',
                strokeWidth: 3
            });
            ctx.restore();
        }

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
            const markY = y + uiH + 8 + belowBossUiOffset;
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
            const markY = y + uiH + 8 + belowBossUiOffset;
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

GameRenderer.drawBossPhaseTransitionOverlay = function(ctx, canvas, gameState) {
    const tr = gameState && gameState.phaseTransition && gameState.phaseTransition.active ? gameState.phaseTransition : null;
    if (!tr || !canvas) return;

    // HP 0 이후 3시 방향으로 물러나는 준비 이동은 일반 화면에서 보여주고,
    // 도착 후 CUTSCENE 단계부터 시네마틱 오버레이를 재생한다.
    const trPhase = String(tr.phase || 'CUTSCENE').toUpperCase();
    if (trPhase === 'PRE_MOVE') return;
    const trType = String(tr.type || '').trim().toUpperCase();
    if (trType === 'KASIYAS_P2_TO_P3' && typeof this.drawKasiyasP2ToP3TransitionOverlay === 'function') {
        this.drawKasiyasP2ToP3TransitionOverlay(ctx, canvas, gameState, tr);
        return;
    }

    const boss = tr.boss;
    const camera = gameState.camera || { x: 0 };
    const duration = Math.max(0.001, parseFloat(tr.duration) || 10.0);
    const timer = Math.max(0, Math.min(duration, parseFloat(tr.timer) || 0));
    const p = Math.max(0, Math.min(1, timer / duration));
    const fadeIn = Math.min(1, timer / 0.65);
    const fadeOut = Math.min(1, (duration - timer) / 0.75);
    const alpha = Math.max(0, Math.min(1, fadeIn, fadeOut));
    const w = canvas.width;
    const h = canvas.height;
    const uiFont = '"Malgun Gothic", "Segoe UI", Arial, sans-serif';
    const smooth = (v) => {
        v = Math.max(0, Math.min(1, v));
        return v * v * (3 - 2 * v);
    };

    const bx = boss ? ((parseFloat(boss.x) || 0) - (parseFloat(camera.x) || 0)) : w / 2;
    const bodyZ = boss && boss.d ? (((boss.d.bodyZ || boss.d.Body_Size_Z || 160) * (boss.scale || 1))) : 160;
    const by = boss ? (this.GROUND_BASE_Y + (parseFloat(boss.y) || 0) - Math.max(80, bodyZ * 0.58)) : h * 0.50;
    const dir = boss && boss.faceDir === -1 ? -1 : 1;
    // 기존 검을 든 방향이 아니라, 반대손/빈손 방향에서 포탈이 열리도록 한다.
    const handDir = -dir;

    // 10초 타임라인: 정지 → 모델의 빈손 뻗기 → 차원 개방 → 일반 검 소환 → 검을 쥠 → 포효/오라 → 상태창 HP 회복 → 기운 약화.
    const handOpen = smooth((timer - 1.0) / 1.4);
    const portalOpen = smooth((timer - 2.2) / 1.7);
    const swordOpen = smooth((timer - 3.8) / 1.9);
    const gripOpen = smooth((timer - 5.6) / 0.8);
    const roarOpen = smooth((timer - 5.9) / 1.2);
    const hpStart = smooth((timer - 6.2) / 2.3);
    const auraSoft = Math.min(1, Math.max(0, (duration - timer) / 2.0));
    const pulse = 0.5 + Math.sin(Date.now() / 96) * 0.5;

    const shoulderX = bx + handDir * 20;
    const shoulderY = by + 52;
    const handX = shoulderX + handDir * (36 + 66 * handOpen);
    const handY = shoulderY - 8 - 7 * handOpen;
    const portalX = handX + handDir * (46 + 18 * portalOpen);
    const portalY = handY - 2;
    // 2페이즈 모델이 보이기 시작한 뒤에는 차원문이 서서히 닫힌다.
    const portalClose = timer >= 6.4 ? Math.max(0, Math.min(1, 1 - ((timer - 6.4) / 1.45))) : 1;
    const portalDraw = portalOpen * portalClose;

    ctx.save();
    ctx.globalAlpha = alpha;

    // 시네마틱 레터박스와 붉은 비네트.
    ctx.fillStyle = 'rgba(0,0,0,0.68)';
    ctx.fillRect(0, 0, w, 64);
    ctx.fillRect(0, h - 64, w, 64);

    const vignette = ctx.createRadialGradient(bx, by + 12, 40, bx, by + 12, Math.max(w, h) * 0.74);
    vignette.addColorStop(0, 'rgba(120,0,0,0.035)');
    vignette.addColorStop(0.40, 'rgba(34,0,0,0.18)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.48)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // 손/팔은 별도 오버레이로 새로 그리지 않는다.
    // 카시야스 본체 모델의 전환용 포즈가 직접 빈손을 뻗도록 처리한다.

    if (portalDraw > 0) {
        ctx.save();
        ctx.translate(portalX, portalY);
        ctx.scale(handDir, 1);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const portalH = (132 + pulse * 8) * portalDraw;
        const portalW = (44 + pulse * 3) * portalDraw;
        ctx.shadowBlur = 24;
        ctx.shadowColor = 'rgba(180,0,0,0.82)';
        ctx.strokeStyle = `rgba(40,0,0,${0.94 * portalDraw})`;
        ctx.lineWidth = 17;
        ctx.beginPath();
        ctx.ellipse(0, 0, portalW, portalH, -0.06, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(218,32,22,${0.72 * portalDraw})`;
        ctx.lineWidth = 5;
        ctx.setLineDash([16, 9]);
        ctx.lineDashOffset = -Date.now() / 28;
        ctx.beginPath();
        ctx.ellipse(0, 0, portalW * 0.82, portalH * 0.90, -0.06, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        const core = ctx.createRadialGradient(0, 0, 2, 0, 0, Math.max(60, portalH * 0.96));
        core.addColorStop(0, `rgba(255,80,58,${0.15 * portalDraw})`);
        core.addColorStop(0.55, `rgba(78,0,0,${0.26 * portalDraw})`);
        core.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.ellipse(0, 0, portalW * 1.36, portalH, -0.06, 0, Math.PI * 2);
        ctx.fill();

        // 차원 균열에서 카시야스 손 근처까지만 천천히 빠져나오는 두 번째 검.
        // 2페이즈 모델이 보이기 시작하면 연출용 검은 사라져야 하므로 5.9초 이후 빠르게 감춘다.
        if (swordOpen > 0 && timer < 6.15) {
            const out = swordOpen;
            const swordFade = Math.max(0, Math.min(1, (6.15 - timer) / 0.45));
            const drawAlpha = out * swordFade;
            ctx.save();
            ctx.scale(-1, 1); // 로컬 +X가 카시야스 손 방향이 되도록 반전한다.
            ctx.rotate(-0.24);

            // 손잡이/가드는 카시야스 손 쪽으로 오되, 검이 손을 지나치지 않도록 길이를 제한한다.
            const bladeLen = 126;
            const guardX = 34 + 34 * out;      // 최종 위치가 손 근처를 넘지 않게 제한
            const tipX = -42 - 10 * (1 - out); // 칼끝은 포탈 내부 쪽에 남김
            const bladeEndX = guardX - 12;

            ctx.globalCompositeOperation = 'source-over';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(160,210,255,0.36)';
            ctx.strokeStyle = `rgba(0,0,0,${0.88 * drawAlpha})`;
            ctx.lineWidth = 10.5;
            ctx.beginPath();
            ctx.moveTo(tipX - 4, 0);
            ctx.lineTo(bladeEndX, 0);
            ctx.stroke();

            ctx.strokeStyle = `rgba(158,197,232,${0.92 * drawAlpha})`;
            ctx.lineWidth = 5.0;
            ctx.beginPath();
            ctx.moveTo(tipX + 5, 0);
            ctx.lineTo(bladeEndX - 6, 0);
            ctx.stroke();

            ctx.strokeStyle = `rgba(237,247,255,${0.92 * drawAlpha})`;
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            ctx.moveTo(tipX + 10, -1.4);
            ctx.lineTo(bladeEndX - 12, -1.4);
            ctx.stroke();

            ctx.fillStyle = `rgba(237,247,255,${0.58 * drawAlpha})`;
            ctx.beginPath();
            ctx.moveTo(tipX - 15, 0);
            ctx.lineTo(tipX + 6, -6);
            ctx.lineTo(tipX + 6, 6);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(0,0,0,${0.90 * drawAlpha})`;
            ctx.lineWidth = 8.0;
            ctx.beginPath();
            ctx.moveTo(guardX - 5, 0);
            ctx.lineTo(guardX + 28, 0);
            ctx.stroke();

            ctx.strokeStyle = `rgba(75,47,35,${0.96 * drawAlpha})`;
            ctx.lineWidth = 5.0;
            ctx.beginPath();
            ctx.moveTo(guardX - 3, 0);
            ctx.lineTo(guardX + 26, 0);
            ctx.stroke();

            ctx.strokeStyle = `rgba(211,161,43,${0.96 * drawAlpha})`;
            ctx.lineWidth = 4.0;
            ctx.beginPath();
            ctx.moveTo(guardX - 2, -10);
            ctx.lineTo(guardX - 2, 10);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }

    // 검을 쥔 뒤에는 손 근처에 일반 검 실루엣을 잠시 고정해서 소환 완료를 읽게 한다.
    // 후반부에는 본체 모델이 2페이즈 기본 자세로 전환되므로 이 보조 검은 자연스럽게 사라진다.
    if (gripOpen > 0 && timer < 6.38) {
        ctx.save();
        ctx.translate(handX, handY);
        ctx.scale(handDir, 1);
        ctx.rotate(-0.58);
        ctx.globalCompositeOperation = 'source-over';
        const g = gripOpen * Math.min(1, (6.38 - timer) / 0.38);
        ctx.shadowBlur = 7;
        ctx.shadowColor = 'rgba(160,210,255,0.34)';
        ctx.strokeStyle = `rgba(0,0,0,${0.88 * g})`;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(138, 0);
        ctx.stroke();
        ctx.strokeStyle = `rgba(158,197,232,${0.90 * g})`;
        ctx.lineWidth = 4.8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(124, 0);
        ctx.stroke();
        ctx.strokeStyle = `rgba(237,247,255,${0.90 * g})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(5, -1.2);
        ctx.lineTo(114, -1.2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(75,47,35,${0.96 * g})`;
        ctx.lineWidth = 5.0;
        ctx.beginPath();
        ctx.moveTo(-34, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();
        ctx.strokeStyle = `rgba(211,161,43,${0.94 * g})`;
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        ctx.moveTo(-2, -10);
        ctx.lineTo(-2, 10);
        ctx.stroke();
        ctx.restore();
    }

    if (roarOpen > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const roar = Math.min(1, roarOpen) * Math.max(0.20, auraSoft);
        const waveT = Date.now() / 260;
        const ar = 132 + pulse * 22 + roarOpen * 36;

        // 원형 폭발보다, 몸 주변에서 아래→위로 맥동하는 기운을 중심으로 표현한다.
        const baseAura = ctx.createRadialGradient(bx, by + 42, 12, bx, by + 42, ar);
        baseAura.addColorStop(0, `rgba(255,78,54,${0.10 * roar})`);
        baseAura.addColorStop(0.36, `rgba(180,0,0,${0.20 * roar})`);
        baseAura.addColorStop(0.72, `rgba(40,0,0,${0.23 * roar})`);
        baseAura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = baseAura;
        ctx.beginPath();
        ctx.ellipse(bx, by + 42, ar * 0.68, ar * 0.94, 0, 0, Math.PI * 2);
        ctx.fill();

        // 발밑 연무
        const groundAura = ctx.createRadialGradient(bx, by + 104, 12, bx, by + 104, ar * 0.72);
        groundAura.addColorStop(0, `rgba(255,54,34,${0.12 * roar})`);
        groundAura.addColorStop(0.44, `rgba(112,0,0,${0.20 * roar})`);
        groundAura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = groundAura;
        ctx.beginPath();
        ctx.ellipse(bx, by + 104, ar * 0.62, ar * 0.20, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 몸 주변을 따라 위로 솟는 일렁임. 전환 중에는 기본 오라보다 강하게 맥동한다.
        for (let i = 0; i < 15; i++) {
            const r = i / 14;
            const side = i % 2 === 0 ? -1 : 1;
            const x0 = bx - ar * 0.48 + r * ar * 0.96 + Math.sin(waveT + i * 0.8) * 7;
            const y0 = by + 100 - (i % 3) * 5;
            const y1 = by + 28 - (i % 5) * 18 - Math.sin(waveT * 1.2 + i) * 8;
            const strong = i % 3 === 0;
            ctx.shadowBlur = strong ? 14 : 8;
            ctx.shadowColor = strong ? 'rgba(255,50,34,0.58)' : 'rgba(110,0,0,0.42)';
            ctx.strokeStyle = strong
                ? `rgba(255,58,38,${0.18 + 0.20 * roar})`
                : `rgba(96,0,0,${0.14 + 0.15 * roar})`;
            ctx.lineWidth = strong ? 3.2 : 2.0;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.bezierCurveTo(
                x0 + side * 30, (y0 + y1) * 0.60,
                x0 - side * 24, (y0 + y1) * 0.40,
                x0 + Math.sin(waveT + i) * 10,
                y1
            );
            ctx.stroke();
        }

        // 카시야스 신체 외곽을 따라 맥동하는 테두리
        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(255,48,36,0.62)';
        ctx.strokeStyle = `rgba(255,78,54,${0.22 + 0.22 * roar})`;
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        ctx.moveTo(bx - 58, by + 88);
        ctx.quadraticCurveTo(bx - 86, by + 22, bx - 40, by - 42);
        ctx.quadraticCurveTo(bx, by - 88, bx + 42, by - 42);
        ctx.quadraticCurveTo(bx + 84, by + 22, bx + 58, by + 88);
        ctx.stroke();

        // 포효 순간의 짧은 압력선은 몸 주변 안쪽에만 작게 사용한다.
        if (timer >= 5.9 && timer <= 7.3) {
            const flash = Math.sin((timer - 5.9) * Math.PI * 2.1) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(255,210,170,${0.13 * flash * roar})`;
            ctx.lineWidth = 2.2;
            for (let i = 0; i < 6; i++) {
                const x = bx - 44 + i * 18;
                ctx.beginPath();
                ctx.moveTo(x, by + 72);
                ctx.bezierCurveTo(x - 10, by + 34, x + 12, by + 2, x + Math.sin(waveT + i) * 8, by - 38);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // HP 회복 연출은 별도 게이지를 띄우지 않고, 기존 보스 상태창 HP바를 사용한다.

    const titleAlpha = Math.min(1, Math.max(0, (timer - 5.4) / 0.65)) * Math.min(1, (duration - timer) / 0.85);
    if (titleAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = alpha * titleAlpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 30px ${uiFont}`;
        const text = timer < 7.2 ? '두 번째 검이 뽑혔다' : '카시야스 2페이즈 돌입';
        ctx.lineWidth = 7;
        ctx.strokeStyle = 'rgba(0,0,0,0.92)';
        ctx.strokeText(text, w / 2, 94);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(116,0,0,0.80)';
        ctx.strokeText(text, w / 2, 94);
        ctx.fillStyle = 'rgba(255,238,214,0.98)';
        ctx.fillText(text, w / 2, 94);
        ctx.restore();
    }

    ctx.restore();
};

GameRenderer.drawKasiyasP2ToP3TransitionOverlay = function(ctx, canvas, gameState, tr) {
    if (!ctx || !canvas || !tr) return;

    const boss = tr.boss || null;
    const camera = gameState && gameState.camera ? gameState.camera : { x: 0 };
    const duration = Math.max(0.001, parseFloat(tr.duration) || 9.0);
    const timer = Math.max(0, Math.min(duration, parseFloat(tr.timer) || 0));
    const w = canvas.width;
    const h = canvas.height;
    const uiFont = '"Malgun Gothic", "Segoe UI", Arial, sans-serif';
    const smooth = (v) => {
        v = Math.max(0, Math.min(1, v));
        return v * v * (3 - 2 * v);
    };
    const fadeIn = Math.min(1, timer / 0.45);
    const fadeOut = Math.min(1, (duration - timer) / 0.75);
    const alpha = Math.max(0, Math.min(1, fadeIn, fadeOut));
    const bx = boss ? ((parseFloat(boss.x) || 0) - (parseFloat(camera.x) || 0)) : w / 2;
    const bodyZ = boss && boss.d ? (((boss.d.bodyZ || boss.d.Body_Size_Z || 160) * (boss.scale || 1))) : 160;
    const by = boss ? (this.GROUND_BASE_Y + (parseFloat(boss.y) || 0) - Math.max(80, bodyZ * 0.58)) : h * 0.50;
    const pulse = 0.5 + Math.sin(Date.now() / 90) * 0.5;

    const dropT = smooth((timer - 0.12) / 0.82);
    const discardFade = 1 - smooth((timer - 1.20) / 0.85);
    const portalT = smooth((timer - 1.15) / 0.72) * (1 - smooth((timer - 3.05) / 0.55));
    const pullT = smooth((timer - 2.05) / 1.55);
    const slashT = smooth((timer - 3.70) / 1.25);
    const stanceT = smooth((timer - 4.95) / 0.90);
    const auraT = smooth((timer - 5.40) / 1.55);

    const drawDroppedSword = (sx, sy, ex, ey, startAngle, endAngle, a, dropProgress) => {
        if (a <= 0.01) return;
        const fall = Math.max(0, Math.min(1, dropProgress));
        const easedFall = fall * fall * (3 - 2 * fall);
        const x = sx + (ex - sx) * easedFall;
        const y = sy + (ey - sy) * easedFall + Math.sin(fall * Math.PI) * 10;
        const angle = startAngle * (1 - easedFall) + endAngle * easedFall;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha *= a;
        // 버려진 기존 이도류는 더 이상 힘을 품지 않은 물리적인 검으로만 보이게 한다.
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(0,0,0,0.82)';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(-46, 0);
        ctx.lineTo(48, 0);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(190,198,206,0.82)';
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(-34, 0);
        ctx.lineTo(38, 0);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(244,246,250,0.42)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-28, -1.6);
        ctx.lineTo(32, -1.6);
        ctx.stroke();
        ctx.fillStyle = 'rgba(166,124,42,0.92)';
        ctx.fillRect(-8, -5, 16, 10);
        ctx.fillStyle = 'rgba(52,30,18,0.96)';
        ctx.fillRect(-28, -2.6, 20, 5.2);
        ctx.restore();
    };

    const drawPortal = (x, y, a) => {
        if (a <= 0.01) return;
        ctx.save();
        ctx.translate(x, y);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha *= a;
        const r = 28 + 18 * a + pulse * 3;
        const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 1.35);
        grad.addColorStop(0, `rgba(255,244,255,${0.12 * a})`);
        grad.addColorStop(0.32, `rgba(204,112,255,${0.24 * a})`);
        grad.addColorStop(0.72, `rgba(70,0,100,${0.18 * a})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.05, r * 0.50, 0.10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(194,96,255,0.45)';
        ctx.strokeStyle = `rgba(214,142,255,${0.38 * a})`;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.98, r * 0.46, 0.08, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    const drawP3Sword = (x, y, angle, len, a) => {
        if (a <= 0.01) return;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha *= a;
        ctx.shadowBlur = 16;
        ctx.shadowColor = 'rgba(204,98,255,0.70)';
        ctx.strokeStyle = 'rgba(0,0,0,0.90)';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(-22, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(205,120,255,0.88)';
        ctx.lineWidth = 5.2;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(len - 8, 0);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,244,255,0.72)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(-10, -1);
        ctx.lineTo(len - 14, -1);
        ctx.stroke();
        ctx.fillStyle = 'rgba(178,128,42,0.95)';
        ctx.fillRect(-16, -5, 14, 10);
        ctx.fillRect(-24, -2.5, 8, 5);
        ctx.strokeStyle = `rgba(255,52,70,${0.28 + pulse * 0.12})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-10, 7);
        ctx.quadraticCurveTo(len * 0.36, -10, len - 4, 4);
        ctx.stroke();
        ctx.restore();
    };

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(0,0,0,0.74)';
    ctx.fillRect(0, 0, w, 68);
    ctx.fillRect(0, h - 68, w, 68);

    const vignette = ctx.createRadialGradient(bx, by + 18, 36, bx, by + 18, Math.max(w, h) * 0.80);
    vignette.addColorStop(0, `rgba(138,0,30,${0.05 + auraT * 0.07})`);
    vignette.addColorStop(0.35, `rgba(40,0,48,${0.20 + portalT * 0.10})`);
    vignette.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    const groundY = by + 94;
    if (discardFade > 0.02) {
        const swordAlpha = Math.max(0, discardFade) * Math.max(0.35, dropT);
        // 2페이즈 기본 자세에서 양손에 있던 두 검이 그대로 아래로 떨어지는 흐름.
        drawDroppedSword(bx - 36, by + 18, bx - 104, groundY - 10 + Math.sin(Date.now() / 180) * 1.2, 2.46, -0.86, swordAlpha, dropT);
        drawDroppedSword(bx + 34, by + 18, bx + 96, groundY - 6 + Math.sin(Date.now() / 190 + 1.5) * 1.2, 0.62, 0.82, swordAlpha * 0.96, dropT);
    }

    if (portalT > 0.02) {
        drawPortal(bx + 24, by - 220, portalT);
    }


    // 시험 횡베기 이펙트는 방향 보정이 전투용 검호와 계속 충돌하므로 삭제한다.
    // 카시야스가 검을 옆으로 뻗는 모션만 남겨 '검 상태 확인' 느낌을 살린다.

    if (auraT > 0.02) {
        ctx.save();
        ctx.translate(bx, by + 6);
        ctx.globalCompositeOperation = 'lighter';
        const baseR = 84 + 34 * auraT + pulse * 8;
        const core = ctx.createRadialGradient(0, 0, 8, 0, 0, baseR * 1.16);
        core.addColorStop(0, `rgba(255,232,174,${0.045 + auraT * 0.030})`);
        core.addColorStop(0.30, `rgba(255,108,48,${0.080 + auraT * 0.065})`);
        core.addColorStop(0.62, `rgba(174,12,32,${0.105 + auraT * 0.060})`);
        core.addColorStop(0.88, `rgba(58,0,26,${0.18})`);
        core.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.ellipse(0, 0, baseR * 0.96, baseR * 0.64, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255,92,44,0.48)';
        ctx.strokeStyle = `rgba(255,100,48,${0.18 + auraT * 0.16})`;
        ctx.lineWidth = 7.0;
        ctx.beginPath();
        ctx.moveTo(-baseR * 0.60, 32);
        ctx.quadraticCurveTo(-baseR * 0.86, -baseR * 0.20, -baseR * 0.36, -baseR * 0.82);
        ctx.quadraticCurveTo(0, -baseR * 1.08, baseR * 0.38, -baseR * 0.82);
        ctx.quadraticCurveTo(baseR * 0.86, -baseR * 0.20, baseR * 0.60, 32);
        ctx.stroke();

        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(194,96,255,0.30)';
        ctx.strokeStyle = `rgba(204,132,255,${0.07 + auraT * 0.07})`;
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.ellipse(0, -36, baseR * 0.64, baseR * 0.34, 0.18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    if (auraT > 0.16) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const flash = auraT * Math.min(1, (duration - timer) / 1.0);
        ctx.fillStyle = `rgba(255,240,255,${0.028 * flash + pulse * 0.015 * flash})`;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }

    const titleAlpha = Math.min(1, Math.max(0, (timer - 0.25) / 0.40)) * Math.min(1, (duration - timer) / 0.70);
    if (titleAlpha > 0) {
        let text = '카시야스가 두 검을 버린다';
        if (timer >= 1.5 && timer < 3.85) text = '차원에서 새로운 검을 꺼낸다';
        else if (timer >= 3.85 && timer < 5.10) text = '검의 상태를 가볍게 시험한다';
        else if (timer >= 5.10) text = '카시야스 3페이즈 돌입';
        ctx.save();
        ctx.globalAlpha = alpha * titleAlpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 30px ${uiFont}`;
        ctx.lineWidth = 7;
        ctx.strokeStyle = 'rgba(0,0,0,0.94)';
        ctx.strokeText(text, w / 2, 94);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(74,0,100,0.86)';
        ctx.strokeText(text, w / 2, 94);
        ctx.fillStyle = 'rgba(255,238,255,0.98)';
        ctx.fillText(text, w / 2, 94);
        ctx.restore();
    }

    ctx.restore();
};
