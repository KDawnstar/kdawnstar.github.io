// [카시야스 보스전] 포트폴리오 체험 모드 / 가이드 UI 전용 레이어
// 실제 전투 데이터와 분리하여 시작 화면, Guide/Normal/Developer 표시, 도움말, 가이드 문구를 관리한다.
const PortfolioModeSystem = {
    modes: {
        GUIDE: 'GUIDE',
        NORMAL: 'NORMAL',
        DEVELOPER: 'DEVELOPER'
    },

    controls: [
        { group: '기본 이동', key: '방향키', name: '이동', desc: '8방향으로 이동합니다.' },
        { group: '기본 이동', key: '방향키 더블 탭', name: '달리기', desc: '같은 방향키를 빠르게 두 번 입력한 뒤 유지하면 달립니다.' },
        { group: '전투 조작', key: 'X', name: '공격', desc: '현재 공격 모드에 맞는 기본 공격을 사용합니다.' },
        { group: '전투 조작', key: 'C', name: '점프', desc: '점프하여 공격 범위나 지형 기믹에 대응합니다.' },
        { group: '전투 조작', key: 'Z', name: '대쉬', desc: '바라보는 방향으로 빠르게 이동합니다. (쿨타임 3초)' },
        { group: '전투 조작', key: 'D', name: '가드', desc: '가드 가능한 공격을 타이밍에 맞춰 방어합니다.' },
        { group: '스킬 / 기능', key: 'A', name: '웨이브', desc: '전방으로 검기를 발사합니다. 근거리 공격 모드에서만 사용 가능합니다.' },
        { group: '스킬 / 기능', key: 'S', name: '캐논볼', desc: '전방으로 포탄을 발사합니다. 원거리 공격 모드에서만 사용 가능합니다.' },
        { group: '스킬 / 기능', key: 'F', name: '공격 모드 변경', desc: '공격 모드를 전환합니다.' },
        { group: '도움말', key: 'F1', name: '조작법 안내', desc: '조작법 안내 화면을 열거나 닫습니다.' },
        { group: '개발 / 특수 기능', key: 'F9', name: '무적 모드', desc: '보스에게 가하는 피해가 10배로 증가하며, 플레이어가 무적 상태가 됩니다.' },
        { group: '개발 / 특수 기능', key: 'F10', name: '연습 모드', desc: '패턴을 선택해 테스트할 수 있는 연습 보드를 활성화합니다.' },
        { group: '개발 / 특수 기능', key: 'F11', name: '특별 버프 토글', desc: '3단계에서 획득 가능한 특별 버프 2종을 즉시 획득합니다.\n일반 플레이에서는 3단계 대형 패턴 1·2에서 각각 획득할 수 있습니다.\n두 버프의 보유 여부에 따라 3단계 대형 패턴 3의 진행 방식이 달라집니다.' },
        { group: '개발 / 특수 기능', key: 'F12', name: '히트박스 표시', desc: '히트박스 표시를 활성화합니다.' },
        { group: '개발 / 특수 기능', key: 'PageUp', name: '다음 단계', desc: '다음 진행 단계로 전환합니다.' },
        { group: '개발 / 특수 기능', key: 'PageDown', name: '이전 단계', desc: '이전 진행 단계로 전환합니다.' }
    ],

    basicGuide: [
        { title: '공격 대응', text: '카시야스의 공격은 전조와 범위를 확인해 이동·대쉬로 피하고, 가드 가능한 공격은 D로 방어할 수 있습니다.' },
        { title: '투기 게이지', text: '공격 적중과 가드 성공 등으로 투기 게이지가 증가합니다. 게이지가 높을수록 공격력과 이동 속도가 증가합니다.' },
        { title: '대형 패턴 / 그로기', text: '일부 대형 패턴을 파훼하면 카시야스가 그로기 상태가 되며, 그로기 동안 더 큰 피해를 입힐 수 있습니다.' }
    ],

    patternGuides: {
        '231006': {
            title: '1단계 대형 패턴 1 · 합격 : 분신 난무',
            flow: '카시야스와 여러 분신이 뒤섞이며 공격을 이어 나갑니다.',
            solve: '각 공격 차수마다 본체와 분신을 구별할 수 있는 단서가 다르게 제공됩니다.\n단서를 파악해 분신의 공격을 막아내면 안전지대를 확보할 수 있습니다.'
        },
        '231007': {
            title: '1단계 대형 패턴 2 · 사도의 기운 참격',
            flow: '카시야스가 기운을 끌어모읍니다.\n잔상을 보내 플레이어를 견제하며 강력한 참격을 준비합니다.',
            solve: '잔상의 공격 후 맵에 상호작용 가능한 오브젝트가 생성됩니다.\n같은 색의 오브젝트 2개와 상호작용해 마지막 참격을 막아내야 합니다.'
        },
        '231008': {
            title: '1단계 대형 패턴 3 · 합격 : 천귀살 쇄도',
            flow: '카시야스가 플레이어에게 낙인을 부여합니다.\n카시야스가 분신과 함께 빠른 돌진 공격을 시전합니다.',
            solve: '낙인이 부여된 상태에서 돌진 공격에 일정 횟수 피격되면 낙인이 폭발해 막을 수 없는 피해를 받습니다.\n본체와 분신의 돌진을 각각 일정 횟수 가드한 뒤, 마지막 교차 발도를 막아내야 합니다.'
        },
        '231009': null,
        '232006': {
            title: '2단계 대형 패턴 1 · 이도류 교차 난무',
            flow: '카시야스가 두 검에 각기 다른 기운을 불어넣습니다.\n카시야스가 양손의 검을 교차로 휘두릅니다.',
            solve: '붉은색 기운의 공격은 회피, 노란색 기운의 공격은 가드로 대응해야 합니다.\n잘못된 대응이 쌓이면 모든 공격의 피해량과 공격 범위가 증가합니다.\n최종 공격을 가드하려면 일정량의 투기 게이지가 필요합니다.\n잘못된 대응이 4회 이상 누적되면 최종 공격을 가드할 수 없게 됩니다.'
        },
        '232007': {
            title: '2단계 대형 패턴 2 · 차원 : 전진하는 검',
            flow: '카시야스가 거대한 차원문을 열어 검을 쏟아냅니다.\n이후 차원문을 닫고 공중에서 나타나며 회전 베기를 시전합니다.',
            solve: '차원문에서 검벽과 함께 파괴 가능한 거대한 검이 등장합니다.\n거대한 검과 상호작용하여 공중 회전 베기를 준비하는 카시야스를 막아낼 수 있습니다.\n상호작용에 실패하더라도 공중 회전 베기를 가드로 막아낼 수 있습니다.'
        },
        '232008': {
            title: '2단계 대형 패턴 3 · 차원 : 카시야스의 공간',
            flow: '카시야스가 플레이어를 자신의 공간으로 데려갑니다.\n카시야스의 검기 공격을 막아내야 합니다.',
            solve: '패턴 진행 중 조작 방식이 변경되며, 공격으로 검기를 파괴하고 가드로 밀어낼 수 있습니다.\nA 스킬로 여러 라인의 검기를 동시에 파괴할 수 있습니다.\n거대 검기를 파괴해 버프를 획득한 뒤, 카시야스의 최종 공격에 대응하면 패턴을 파훼할 수 있습니다.'
        },
        '232009': null,
        '233006': {
            title: '3단계 대형 패턴 1 · 귀면족의 저주',
            flow: '카시야스가 플레이어에게 저주를 겁니다.\n저주가 걸린 플레이어는 카시야스의 광역 공격에 대응해야 합니다.',
            solve: '저주 상태에서는 매초 HP가 감소하며 근접 일반 공격만 사용할 수 있습니다.\n저주 상태에서 카시야스에게 피해를 입히면, 입힌 피해량에 비례해 체력을 회복할 수 있습니다.\n카시야스의 마지막 공격은 타이밍에 맞춰 패리로 파훼할 수 있습니다.\n일정 시간 동안 카시야스를 공격하지 않고 모든 공격을 회피하면 저주를 조기 해제하고 특별 버프를 획득할 수 있습니다.'
        },
        '233007': {
            title: '3단계 대형 패턴 2 · 차원 : 천붕지렬',
            flow: '카시야스가 공중에 거대한 차원문을 생성한 뒤 그 위로 뛰어오릅니다.\n차원문에서 거대한 검을 낙하시킨 뒤, 지상으로 돌아와 사도의 기운을 이용한 공격을 펼칩니다.',
            solve: '거대 검 낙하 공격은 공간 왜곡을 생성합니다.\n플레이어는 광역 공격에 대응하며 맵에 생성되는 공간 왜곡을 제거할 수 있습니다.\n카시야스의 최종 공격에 대응하면 패턴을 파훼할 수 있습니다.\n최종 공격 시 카시야스의 위치에만 공간 왜곡을 남겨 두면 특별한 방식으로 패턴을 파훼할 수 있습니다.'
        },
        '233008_NORMAL': {
            title: '3단계 대형 패턴 3 · 세계를 가르는 일섬 (일반)',
            flow: '카시야스가 플레이어를 자신의 이면세계로 데려갑니다.\n카시야스의 분신을 처치하고 세계를 가르는 일섬을 막아내야 합니다.',
            solve: '제한 시간 안에 분신을 처치하고 중앙으로 돌아오세요.\n카시야스를 일정 횟수 공격하면 방어 오라가 해제됩니다.\n방어 오라를 해제하면 최종 공격을 가드로 대응할 수 있습니다.'
        },
        '233008_HIDDEN': {
            title: '3단계 대형 패턴 3 · 세계를 가르는 일섬 (히든)',
            flow: '카시야스가 플레이어를 자신의 이면세계로 데려갑니다.\n카시야스가 플레이어를 인정하고 전력을 다해 상대합니다.',
            solve: '3단계 대형 패턴 1·2를 모두 특별한 방법으로 파훼하면 히든 분기에 진입할 수 있습니다.\n전력 상태의 카시야스는 플레이어의 공격으로 행동을 중단시킬 수 없습니다.\n20초 동안 카시야스의 공격에 회피·가드로 대응한 뒤, 마지막 공격에 X 기본 공격을 맞춰 패리해야 합니다.'
        }
    },

    hudTooltipText: {
        wave: { title: '웨이브 [A]', desc: '전방으로 검기를 발사합니다. 근거리 공격 모드에서만 사용 가능합니다.', meta: '쿨타임 7초 · 근거리 전용' },
        cannon: { title: '캐논볼 [S]', desc: '전방으로 포탄을 발사합니다. 원거리 공격 모드에서만 사용 가능합니다.', meta: '쿨타임 7초 · 원거리 전용' },
        guard: { title: '가드 [D]', desc: '가드 가능한 공격을 타이밍에 맞춰 방어합니다. 공격에 따라 완전 방어 또는 피해 감소가 적용됩니다.', meta: '가드 상태 / 재사용 상태' },
        swap: { title: '공격 모드 변경 [F]', desc: '공격 모드를 전환합니다.', meta: '쿨타임 3초 · 현재 모드' },
        dash: { title: '대쉬 [Z]', desc: '바라보는 방향으로 빠르게 이동합니다.', meta: '쿨타임 3초' }
    },

    init(gameState) {
        if (!gameState) return;
        if (!gameState.presentationMode) gameState.presentationMode = null;
        if (typeof gameState.presentationStarted !== 'boolean') gameState.presentationStarted = false;
        this.bindStartButtons(gameState);
        this.renderControlGuide(document.getElementById('sideGuideContent'));
        this.renderHelpContent();
        this.prepareHudSlots();
        this.applyBodyMode(null);
        this.update(gameState, true);
    },

    bindStartButtons(gameState) {
        document.querySelectorAll('[data-portfolio-mode]').forEach(btn => {
            if (btn.dataset.boundPortfolioMode === '1') return;
            btn.dataset.boundPortfolioMode = '1';
            btn.addEventListener('click', () => this.startMode(btn.getAttribute('data-portfolio-mode'), gameState));
        });
    },

    startMode(mode, gameState) {
        const next = String(mode || '').toUpperCase();
        if (!Object.values(this.modes).includes(next)) return false;
        gameState.presentationMode = next;
        gameState.presentationStarted = true;
        gameState.keys = {};
        if (typeof lastTime !== 'undefined') lastTime = performance.now();
        const screen = document.getElementById('portfolioStartScreen');
        if (screen) screen.classList.add('hidden');
        this.applyBodyMode(next);
        this.renderControlGuide(document.getElementById('sideGuideContent'));
        this.renderHelpContent();
        this.update(gameState, true);
        if (typeof updateBossBattleLayoutScale === 'function') updateBossBattleLayoutScale();
        const label = next === 'GUIDE' ? '가이드 모드' : (next === 'NORMAL' ? '일반 모드' : '개발자 모드');
        if (typeof pushSystemNotice === 'function') pushSystemNotice(`${label} 시작`, next === 'GUIDE' ? '#8fd3ff' : '#f4d36a', 1.4);
        return true;
    },

    applyBodyMode(mode) {
        document.body.classList.remove('portfolio-mode-guide', 'portfolio-mode-normal', 'portfolio-mode-developer', 'portfolio-mode-select');
        if (!mode) document.body.classList.add('portfolio-mode-select');
        else document.body.classList.add(`portfolio-mode-${String(mode).toLowerCase()}`);
    },

    isGuide(gameState) {
        return !!(gameState && gameState.presentationMode === this.modes.GUIDE);
    },

    getPlayerDamageMultiplier(gameState) {
        return this.isGuide(gameState) ? 0.10 : 1;
    },

    scalePlayerDamage(gameState, damage) {
        const value = Math.max(0, parseFloat(damage) || 0);
        return value * this.getPlayerDamageMultiplier(gameState);
    },

    handleKeyDown(gameState, event) {
        if (!gameState || !event || !gameState.presentationStarted) return false;
        const code = event.code;
        if (code === 'F1' && !event.repeat) {
            event.preventDefault();
            this.toggleHelp();
            return true;
        }
        if (code === 'F9' && !event.repeat) {
            event.preventDefault();
            gameState.superDamageMode = !gameState.superDamageMode;
            if (typeof pushSystemNotice === 'function') {
                pushSystemNotice(gameState.superDamageMode ? '무적 모드 활성화' : '무적 모드 비활성화', gameState.superDamageMode ? '#ffe27c' : '#bbbbbb', 1.35);
            }
            return true;
        }
        if (code === 'F10' && !event.repeat) {
            event.preventDefault();
            if (typeof setBossPracticeModeEnabled === 'function') setBossPracticeModeEnabled(!gameState.bossPractice.enabled);
            return true;
        }
        if (code === 'F11' && !event.repeat) {
            event.preventDefault();
            if (typeof toggleP3M3HiddenRouteTestBuff === 'function') toggleP3M3HiddenRouteTestBuff();
            return true;
        }
        if (code === 'F12' && !event.repeat) {
            event.preventDefault();
            gameState.isDebugView = !gameState.isDebugView;
            if (typeof pushSystemNotice === 'function') pushSystemNotice(gameState.isDebugView ? '히트박스 표시 활성화' : '히트박스 표시 비활성화', gameState.isDebugView ? '#8fd3ff' : '#bbbbbb', 1.15);
            return true;
        }
        if (code === 'PageUp' && !event.repeat) {
            event.preventDefault();
            if (typeof triggerBossPhaseTransitionDebug === 'function') triggerBossPhaseTransitionDebug();
            return true;
        }
        if (code === 'PageDown' && !event.repeat) {
            event.preventDefault();
            if (typeof triggerBossPreviousPhaseDebug === 'function') triggerBossPreviousPhaseDebug();
            return true;
        }
        return false;
    },

    toggleHelp(force) {
        const overlay = document.getElementById('portfolioHelpOverlay');
        if (!overlay) return;
        const show = typeof force === 'boolean' ? force : !overlay.classList.contains('visible');
        overlay.classList.toggle('visible', show);
        overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
    },

    renderControlGuide(container) {
        if (!container) return;
        const groups = ['기본 이동', '전투 조작', '스킬 / 기능', '도움말', '개발 / 특수 기능'];
        const rows = this.controls;
        container.innerHTML = groups.map(group => {
            const items = rows.filter(item => item.group === group);
            if (!items.length) return '';
            const title = group === '개발 / 특수 기능' ? '개발 / 특수 기능' : group;
            return `<div class="control-guide-card${group === '개발 / 특수 기능' ? ' special' : ''}">
                <div class="control-guide-title">${title}</div>
                ${items.map(item => `<div class="control-row"><span class="keycap${group === '개발 / 특수 기능' ? ' debug' : (item.key === 'D' ? ' guard' : '')}">${item.key}</span><span><b>${item.name}</b><small>${this.escapeHtml(item.desc).replace(/\n/g, '<br>')}</small></span></div>`).join('')}
            </div>`;
        }).join('');
    },

    renderHelpContent() {
        const content = document.getElementById('portfolioHelpContent');
        if (!content) return;
        const groups = ['기본 이동', '전투 조작', '스킬 / 기능', '개발 / 특수 기능'];
        content.innerHTML = groups.map(group => {
            const items = this.controls.filter(item => item.group === group && item.key !== 'F1');
            if (!items.length) return '';
            return `<section class="portfolio-help-group"><h3>${group}</h3>${items.map(item => `<div class="portfolio-help-row"><span class="portfolio-help-key">${item.key}</span><div><b>${item.name}</b><p>${this.escapeHtml(item.desc).replace(/\n/g, '<br>')}</p></div></div>`).join('')}</section>`;
        }).join('');
    },

    prepareHudSlots() {
        const roleByMask = { maskWave: 'wave', maskCannon: 'cannon', maskGuard: 'guard', maskSwap: 'swap', maskDash: 'dash' };
        Object.entries(roleByMask).forEach(([maskId, role]) => {
            const mask = document.getElementById(maskId);
            const slot = mask ? mask.closest('.skill-slot') : null;
            if (!slot) return;
            slot.dataset.hudRole = role;
            let tip = slot.querySelector('.skill-tooltip');
            if (!tip) {
                tip = document.createElement('div');
                tip.className = 'skill-tooltip';
                slot.appendChild(tip);
            }
        });
        this.updateHudTooltips(null);
    },

    updateHudTooltips(gameState) {
        const p2 = !!(gameState && gameState.specialMode === 'P2_M3_DIMENSION_DEFENSE' && gameState.p2m3DefenseRuntime && gameState.p2m3DefenseRuntime.active);
        const special = {
            swap: { title: '공격 [X]', desc: '현재 라인의 검기를 공격해 파괴합니다.', meta: '차원 방어전 전용 조작' },
            dash: { title: '점프 [C]', desc: '검기와 지형 기믹에 대응하기 위해 점프합니다.', meta: 'C / Space / ↑' },
            guard: { title: '가드 [D]', desc: '검기를 막아내고 밀어냅니다.', meta: '가드 게이지 사용' },
            wave: { title: '웨이브 [A]', desc: '여러 라인의 검기를 동시에 공격합니다.', meta: '차원 방어전 전용 스킬' }
        };
        document.querySelectorAll('#hudSkills .skill-slot').forEach(slot => {
            const role = slot.dataset.hudRole;
            const data = p2 ? special[role] : this.hudTooltipText[role];
            const tip = slot.querySelector('.skill-tooltip');
            if (!tip) return;
            if (!data || (p2 && role === 'cannon')) {
                tip.innerHTML = '';
                tip.style.display = 'none';
                return;
            }
            tip.style.display = '';
            tip.innerHTML = `<b>${data.title}</b><span>${data.desc}</span><small>${data.meta}</small>`;
        });
    },

    update(gameState, force = false) {
        if (!gameState) return;
        document.body.classList.toggle('boss-practice-active', !!(gameState.bossPractice && gameState.bossPractice.enabled));
        const badge = document.getElementById('presentationModeBadge');
        if (badge && gameState.presentationStarted) {
            const mode = gameState.presentationMode;
            badge.textContent = mode === 'GUIDE' ? '가이드 모드' : (mode === 'NORMAL' ? '일반 모드' : '개발자 모드');
            badge.classList.add('visible');
        }
        this.updateHudTooltips(gameState);
        if (this.isGuide(gameState)) this.updateGuidePanel(gameState, force);
    },

    getCurrentPatternGuideKey(gameState) {
        if (gameState.specialMode === 'P3_M3_FINAL_ISSEN' && gameState.p3m3Runtime && gameState.p3m3Runtime.active) {
            return String(gameState.p3m3Runtime.routeType || '').toUpperCase() === 'ROUTE_HIDDEN' ? '233008_HIDDEN' : '233008_NORMAL';
        }
        if (gameState.specialMode === 'P2_M3_DIMENSION_DEFENSE' && gameState.p2m3DefenseRuntime && gameState.p2m3DefenseRuntime.active) return '232008';
        let patternId = '';
        for (const monster of (gameState.monsters || [])) {
            if (!monster || !monster.active || !monster.boss) continue;
            const boss = monster.boss;
            patternId = String((boss.activePattern && boss.activePattern.Pattern_ID) || (boss.action && boss.action.Pattern_ID) || '').trim();
            if (patternId) break;
        }
        if (patternId === '231009') patternId = '231008';
        if (patternId === '232009') patternId = '232008';
        if (patternId === '233008') {
            const hidden = !!(gameState.player && gameState.player.p3TrialWillBuff && gameState.player.p3TrialBodyBuff);
            return hidden ? '233008_HIDDEN' : '233008_NORMAL';
        }
        return patternId;
    },

    updateGuidePanel(gameState, force = false) {
        const panel = document.getElementById('guideStrategyContent');
        const title = document.getElementById('guideStrategyTitle');
        if (!panel || !title) return;
        const key = this.getCurrentPatternGuideKey(gameState);
        const guide = this.patternGuides[key] || null;
        const renderKey = guide ? `pattern:${key}` : 'basic';
        if (!force && panel.dataset.renderKey === renderKey) return;
        panel.dataset.renderKey = renderKey;
        if (!guide) {
            title.textContent = '카시야스 기본 공략';
            panel.innerHTML = this.basicGuide.map(item => `<div class="guide-info-card"><h4>${item.title}</h4><p>${this.escapeHtml(item.text)}</p></div>`).join('') + '<div class="guide-idle-note">대형 패턴이 시작되면 진행 과정과 대응 방법이 표시됩니다.</div>';
            return;
        }
        title.textContent = '대형 패턴 가이드';
        panel.innerHTML = `<div class="guide-pattern-name">${this.escapeHtml(guide.title)}</div>
            ${guide.flow ? `<div class="guide-info-card"><h4>패턴 흐름</h4><p>${this.escapeHtml(guide.flow).replace(/\n/g, '<br>')}</p></div>` : ''}
            ${guide.solve ? `<div class="guide-info-card solve"><h4>패턴 파훼 방법</h4><p>${this.escapeHtml(guide.solve).replace(/\n/g, '<br>')}</p></div>` : ''}`;
    },

    escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};

window.PortfolioModeSystem = PortfolioModeSystem;
