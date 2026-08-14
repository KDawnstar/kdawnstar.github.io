// [카시야스 보스전] 게임 앱 초기화/루프/상태 연결 (game_app.js)
// ==========================================

function getDistance2D(x1, y1, x2, y2) { return Math.sqrt((x1-x2)**2 + (y1-y2)**2) || 0; }
function checkAABB3D(x1, y1, z1, w1, d1, h1, x2, y2, z2, w2, d2, h2) {
    if (isNaN(x1) || isNaN(x2)) return false;
    return (Math.abs(x1 - x2) < (w1 + w2) / 2) && (Math.abs(y1 - y2) < (d1 + d2) / 2) && (z1 < z2 + h2 && z1 + h1 > z2);
}
function calcScaledDamage(attackerLvl, defenderLvl, baseDmg) {
    // 카시야스 전용 보스전에서는 레벨 격차 데미지 보정을 사용하지 않는다.
    // 기존 호출부 호환을 위해 함수명은 유지하고, 입력 데미지를 그대로 반환한다.
    return parseFloat(baseDmg) || 0;
}
function getEngineKeyCode(excelKey) {
    if (!excelKey) return '';

    const raw = String(excelKey).trim();
    const upper = raw.toUpperCase();

    const map = {
        // 기존 형식
        'Key_X': 'KeyX',
        'Key_Z': 'KeyZ',
        'Key_C': 'KeyC',
        'Key_V': 'KeyV',
        'Key_F': 'KeyF',
        'Key_A': 'KeyA',
        'Key_S': 'KeyS',
        'Key_D': 'KeyD',

        // 새 데이터 테이블 형식
        'KEY_X': 'KeyX',
        'KEY_Z': 'KeyZ',
        'KEY_C': 'KeyC',
        'KEY_V': 'KeyV',
        'KEY_F': 'KeyF',
        'KEY_A': 'KeyA',
        'KEY_S': 'KeyS',
        'KEY_D': 'KeyD',

        // 방향키
        'Down_Arrow_Key': 'ArrowDown',
        'Up_Arrow_Key': 'ArrowUp',
        'Left_Arrow_Key': 'ArrowLeft',
        'Right_Arrow_Key': 'ArrowRight',

        'DOWN_ARROW_KEY': 'ArrowDown',
        'UP_ARROW_KEY': 'ArrowUp',
        'LEFT_ARROW_KEY': 'ArrowLeft',
        'RIGHT_ARROW_KEY': 'ArrowRight',

        // 혹시 직접 브라우저 키 코드로 들어온 경우
        'KEYX': 'KeyX',
        'KEYZ': 'KeyZ',
        'KEYC': 'KeyC',
        'KEYV': 'KeyV',
        'KEYF': 'KeyF',
        'KEYA': 'KeyA',
        'KEYS': 'KeyS',
        'KEYD': 'KeyD'
    };

    if (map[raw]) return map[raw];
    if (map[upper]) return map[upper];

    const letterKey = upper.match(/^KEY_?([A-Z])$/);
    if (letterKey) return 'Key' + letterKey[1];

    return raw.replace(/_/g, '');
}
function getContrastColor(hexColor) {
    if (!hexColor) return '#ffffff';
    let r = parseInt(hexColor.substr(1, 2), 16) || 0;
    let g = parseInt(hexColor.substr(3, 2), 16) || 0;
    let b = parseInt(hexColor.substr(5, 2), 16) || 0;
    return (((r * 299) + (g * 587) + (b * 114)) / 1000 >= 128) ? '#000000' : '#ffffff';
}
const gameState = {
    WORLD_WIDTH: 2000,
    WORLD_DEPTH: 300,
    GRAVITY: 2200,

    player: { active: false },
    monsters: [],
    spawners: [],
    auras: [],
    projectiles: [],
    effects: [],
    hitboxes: [],
    bossAttackObjects: [],
    floatingTexts: [],
    screenHitFlash: null,
    phaseTransition: null,

    targetUI: { monster: null, timer: 0 },
    bossDebug: {
        patternCheck: null,
        currentAction: null,
        currentObjectAction: null,
        logs: [],
        exportLogs: []
    },

    // 고정 UI 전용 시스템 알림 큐
    systemNotices: [],

    keys: {},
    isDebugView: false,
    groundImage: null,
    camera: { x: 0, y: 0, width: 1600, height: 900 },

    DB_MONSTER: {},
    MONSTER_KEYS: [],
    DB_PATTERN: {},
    DB_SKILL: {},
    DB_STAGE: [],
    DB_BOSS_PHASE: {},
    DB_BOSS_PATTERN: {},
    DB_BOSS_PATTERN_BY_SET: {},
    DB_BOSS_PATTERN_ACTION: {},
    DB_BOSS_PATTERN_OBJECT: {},
    DB_BOSS_PATTERN_OBJECT_ACTION: {},
    DB_BOSS_PATTERN_OBJECT_ACTION_BY_OBJECT: {},
    DB_P2_M3_PLAYER: [],
    DB_P2_M3_WAVE: [],
    DB_P2_M3_WAVE_SPAWN: [],
    DB_P2_M3_SLASH: [],
    DB_P3_M3_SYSTEM: [],
    DB_P3_M3_AREA: [],
    DB_P3_M3_PORTAL: [],
    DB_P3_M3_MONSTER: [],
    DB_P3_M3_ROUTE: [],
    DB_P3_M3_DIALOGUE: [],
    actions: [],

    // 특수 전용 모드. 현재는 2페이즈 대형 패턴3 차원 방어전 테스트 모드에서 사용한다.
    specialMode: null,
    p2m3DefenseRuntime: null,
    p2m3IntroRuntime: null,
    p3m3Runtime: null,
    superDamageMode: false,

    isAutoSpawn: true,
    jumpKeyEngine: 'KeyC',
    dashKeyEngine: 'KeyZ',

    // 내부 스폰 호환용 플래그. 별도 키 입력/화면 UI에서는 사용하지 않는다.
    isTestMode: false,

    // 카시야스 패턴 연습 모드(F9)
    bossPractice: {
        enabled: false,
        lastPatternId: null
    },

    // 새 게임 진행 모드
    gameMode: 'BOSS', // 'BOSS', 'STAGE', 'FREE_SPAWN'

    // 스테이지 상태
    currentStageId: null,
    currentStage: null,
    stageClearPending: false,
    isStageCleared: false,
    activeWarp: null
};


let lastTime = performance.now();


function updateBossBattleLayoutScale() {
    const center = document.getElementById('gameCenterPanel');
    const gameSection = document.getElementById('gameSection');
    if (!center || !gameSection) return;

    const baseW = 1404; // gameSection 1400px + border
    const baseH = 1024; // gameSection 1020px + border
    const rect = center.getBoundingClientRect();
    const scale = Math.max(0.45, Math.min(1, rect.width / baseW, rect.height / baseH));

    document.documentElement.style.setProperty('--game-scale', scale.toFixed(4));
}

window.addEventListener('resize', updateBossBattleLayoutScale);

function pushSystemNotice(text, color = '#f1c40f', duration = 1.8) {
    const msg = String(text || '').trim();
    if (!msg) return;

    const safeDuration = Math.max(0.3, parseFloat(duration) || 1.8);

    gameState.systemNotices.push({
        text: msg,
        color: color || '#f1c40f',
        timer: safeDuration,
        maxTimer: safeDuration
    });

    if (gameState.systemNotices.length > 4) {
        gameState.systemNotices.splice(0, gameState.systemNotices.length - 4);
    }
}

// 포트폴리오 용어와 플레이어 노출 UI 용어를 맞추기 위한 표시 전용 변환이다.
// 내부 로직에서 참조하는 Action_Name/Object_Name/디버그 문자열은 원본 데이터를 유지한다.
function formatKasiyasPublicText(value, options = {}) {
    let text = String(value == null ? '' : value);
    const opt = options || {};
    if (opt.phaseStep !== false) {
        text = text
            .replace(/1페이즈/g, '1단계')
            .replace(/2페이즈/g, '2단계')
            .replace(/3페이즈/g, '3단계')
            .replace(/페이즈 전환/g, '단계 전환')
            .replace(/페이즈 복귀/g, '단계 복귀')
            .replace(/페이즈 변경/g, '단계 변경')
            .replace(/현재 페이즈/g, '현재 단계')
            .replace(/다음 페이즈/g, '다음 단계')
            .replace(/이전 페이즈/g, '이전 단계');
    }
    if (opt.latePhase !== false) {
        text = text.replace(/후반부/g, '2페이즈');
    }
    return text;
}
window.formatKasiyasPublicText = formatKasiyasPublicText;

function updateBossPatternDialogueTimer(deltaTime) {
    const dlg = gameState.bossPatternDialogue;
    if (!dlg) return;

    const dt = Math.max(0, parseFloat(deltaTime) || 0);
    if ((parseFloat(dlg.delay) || 0) > 0) {
        dlg.delay = Math.max(0, (parseFloat(dlg.delay) || 0) - dt);
        return;
    }

    dlg.timer = Math.max(0, (parseFloat(dlg.timer) || 0) - dt);
    if (dlg.timer <= 0) gameState.bossPatternDialogue = null;
}

// ==========================================
// 스테이지 유틸
// ==========================================

function isBossMonsterId(monsterId) {
    const key = String(monsterId || '').trim();
    if (!key) return false;

    const monsterData = gameState.DB_MONSTER ? gameState.DB_MONSTER[key] : null;
    const grade = String(monsterData && monsterData.grade ? monsterData.grade : '').trim().toUpperCase();

    if (grade.includes('BOSS')) return true;
    if (key.startsWith('B')) return true;

    return false;
}

function getStageById(stageId) {
    return (gameState.DB_STAGE || []).find(s => s.Stage_ID === stageId) || null;
}

function getStageDepth(stage) {
    if (!stage) return 300;
    const depth = parseFloat(stage.Map_Size_Y);
    if (!isNaN(depth)) return depth;

    // 구버전 키 호환
    const legacyDepth = parseFloat(stage.Map_SIze_Y);
    if (!isNaN(legacyDepth)) return legacyDepth;

    return 300;
}

function clearCurrentStageEntities() {
    gameState.monsters = [];
    gameState.spawners = [];
    gameState.auras = [];
    gameState.projectiles = [];
    gameState.effects = [];
    gameState.hitboxes = [];
    gameState.bossAttackObjects = [];
    gameState.targetUI.monster = null;
    gameState.targetUI.timer = 0;
    gameState.bossDebug = {
        patternCheck: null,
        currentAction: null,
        currentObjectAction: null,
        logs: [],
        exportLogs: []
    };

    gameState.activeWarp = null;
    gameState.isStageCleared = false;
    gameState.bossBattle = null;
    gameState.phaseTransition = null;
    if (gameState.camera) {
        gameState.camera.zoom = 1;
        gameState.camera.focusX = null;
        gameState.camera.focusY = null;
    }
}

function spawnStageMonsterAt(monsterId, x, y, isBoss = false) {
    if (!monsterId || !gameState.DB_MONSTER[monsterId]) return;

    // stage 스폰은 레벨 제한 무시
    const prevTestMode = gameState.isTestMode;
    gameState.isTestMode = true;

    const beforeCount = gameState.monsters.length;
    MonsterManager.spawnInstant(monsterId, gameState);
    const afterCount = gameState.monsters.length;

    gameState.isTestMode = prevTestMode;

    if (afterCount <= beforeCount) return;

    const m = gameState.monsters[afterCount - 1];
    if (!m) return;

    m.x = parseFloat(x) || m.x;
    m.y = parseFloat(y) || m.y;
    m.spawnSource = 'STAGE';
    m.isStageBoss = !!isBoss;
}

function loadBossStage(stageId = null) {
    const stage =
        (stageId ? getStageById(stageId) : null) ||
        (gameState.DB_STAGE || []).find(s => s && s.Stage_ID) ||
        null;

    if (!stage) {
        console.error('보스전 스테이지를 찾을 수 없음');
        return;
    }

    gameState.stageClearPending = false;
    gameState.currentStageId = stage.Stage_ID;
    gameState.currentStage = stage;

    clearCurrentStageEntities();

    gameState.WORLD_WIDTH = parseFloat(stage.Map_Size_X) || 1400;
    gameState.WORLD_DEPTH = getStageDepth(stage);

    if (gameState.player && gameState.player.active) {
        gameState.player.x = parseFloat(stage.Player_Start_Center_X) || 300;
        gameState.player.y = parseFloat(stage.Player_Start_Center_Y) || (gameState.WORLD_DEPTH / 2);
        gameState.player.z = 0;
        gameState.player.vz = 0;
        gameState.player.isGrounded = true;
        gameState.player.state = 'Idle';
    }

    const firstPhase = Object.values(gameState.DB_BOSS_PHASE || {})
        .sort((a, b) => (parseFloat(a.Phase_Order) || 0) - (parseFloat(b.Phase_Order) || 0))[0];

    if (!firstPhase) {
        console.error('Boss_Phase_info에 1페이즈 데이터가 없습니다.');
        return;
    }

    const bossId = String(firstPhase.Phase_Monster_ID || '').trim();
    const bossX = parseFloat(stage.Boss_Spawn_Center_X) || 1000;
    const bossY = parseFloat(stage.Boss_Spawn_Center_Y) || (gameState.WORLD_DEPTH / 2);

    spawnStageMonsterAt(bossId, bossX, bossY, true);

    const boss = gameState.monsters[gameState.monsters.length - 1];
    if (boss) {
        boss.z = 0;
        boss.vz = 0;
        boss.isGrounded = true;
        boss.spawnSource = 'BOSS_STAGE';
        boss.isStageBoss = true;
        gameState.bossBattle = { boss: boss, phase: firstPhase };
        gameState.targetUI.monster = boss;
        gameState.targetUI.timer = 999999;
    }

    try {
        if (typeof GameRenderer.rebuildStageBackground === 'function') {
            GameRenderer.rebuildStageBackground(stage, gameState.WORLD_WIDTH, gameState.WORLD_DEPTH);
        }
    } catch (e) {}

    buildUIButtons();
    pushSystemNotice(`⚔️ ${stage.Stage_Name || '카시야스 결투장'}`, '#f1c40f', 1.8);
}

function createStageWarp(stage) {
    if (!stage || !stage.Next_Stage_ID) {
        gameState.activeWarp = null;
        return;
    }

    const warpX = parseFloat(stage.Next_Stage_Warp_Center_X);
    const warpY = parseFloat(stage.Next_Stage_Warp_Center_Y);
    const warpW = parseFloat(stage.Next_Stage_Warp_Area_X) || 50;
    const warpH = parseFloat(stage.Next_Stage_Warp_Area_Y) || gameState.WORLD_DEPTH;

    if (isNaN(warpX) || isNaN(warpY)) {
        gameState.activeWarp = null;
        return;
    }

    gameState.activeWarp = {
        x: warpX,
        y: warpY,
        w: warpW,
        h: warpH,
        targetStageId: stage.Next_Stage_ID
    };
}

function isPlayerInsideWarp(player, warp) {
    if (!player || !warp) return false;

    const playerW = (player.bodyX || 50) * (player.scale || 1);
    const playerD = (player.bodyY || 30) * (player.scale || 1);

    return (
        Math.abs(player.x - warp.x) <= (playerW / 2 + warp.w / 2) &&
        Math.abs(player.y - warp.y) <= (playerD / 2 + warp.h / 2)
    );
}

function updateStageWarp() {
    if (gameState.gameMode !== 'STAGE') return;
    if (!gameState.activeWarp) return;
    if (!gameState.player || !gameState.player.active) return;
    if (gameState.player.hp <= 0) return;

    if (isPlayerInsideWarp(gameState.player, gameState.activeWarp)) {
        const targetStageId = gameState.activeWarp.targetStageId;
        if (targetStageId) {
            loadStage(targetStageId);
        }
    }
}

function onStageCleared(stage) {
    if (!stage || gameState.isStageCleared) return;

    gameState.stageClearPending = true;
    gameState.isStageCleared = true;

    if (stage.Next_Stage_ID) {
        createStageWarp(stage);
        pushSystemNotice('🌀 워프가 열렸습니다!', '#8e44ad', 1.8);
    } else {
        gameState.activeWarp = null;
        pushSystemNotice('🏆 모든 스테이지 클리어!', '#2ecc71', 2.0);
    }

    buildUIButtons();
}

function loadStage(stageId) {
    const stage = getStageById(stageId);
    if (!stage) {
        console.error('스테이지를 찾을 수 없음:', stageId);
        return;
    }

    gameState.stageClearPending = false;
    gameState.currentStageId = stage.Stage_ID;
    gameState.currentStage = stage;

    clearCurrentStageEntities();

    // 맵 크기 반영
    gameState.WORLD_WIDTH = parseFloat(stage.Map_Size_X) || 2000;
    gameState.WORLD_DEPTH = getStageDepth(stage);

    // 플레이어 위치 초기화
    if (gameState.player && gameState.player.active) {
        const startX = parseFloat(stage.Player_Start_Center_X);
        const startY = parseFloat(stage.Player_Start_Center_Y);

        if (!isNaN(startX)) {
            gameState.player.x = startX;
        } else if (stage.Map_Progress === 'LEFT_TO_RIGHT') {
            gameState.player.x = 120;
        } else {
            gameState.player.x = Math.max(120, gameState.WORLD_WIDTH - 120);
        }

        if (!isNaN(startY)) {
            gameState.player.y = startY;
        } else {
            gameState.player.y = gameState.WORLD_DEPTH / 2;
        }

        gameState.player.z = 0;
        gameState.player.vz = 0;
        gameState.player.isGrounded = true;
        gameState.player.state = 'Idle';
    }

    const generalSpawnCenterX = parseFloat(stage.Spawn_Center_X) || 1400;
    const generalSpawnRangeX = parseFloat(stage.Spawn_Range_X) || 0;
    const generalSpawnCenterY = parseFloat(stage.Spawn_Center_Y) || (gameState.WORLD_DEPTH / 2);
    const generalSpawnRangeY = parseFloat(stage.Spawn_Range_Y) || 0;

    let bossId = '';
    for (let i = 1; i <= 3; i++) {
        const monsterId = stage[`Spawn_Monster_${i}_ID`];
        const monsterCount = parseInt(stage[`Spawn_Monster_${i}_Count`] || 0);

        if (!monsterId || monsterCount <= 0) continue;

        if (isBossMonsterId(monsterId)) {
            bossId = monsterId;
            continue;
        }

        for (let c = 0; c < monsterCount; c++) {
            const randX = generalSpawnCenterX + ((Math.random() * 2 - 1) * generalSpawnRangeX);
            const randY = generalSpawnCenterY + ((Math.random() * 2 - 1) * generalSpawnRangeY);
            spawnStageMonsterAt(monsterId, randX, randY, false);
        }
    }

    if (stage.Stage_Clear_Type === 'KILL_BOSS' && bossId) {
        const bossX = parseFloat(stage.Boss_Spawn_Center_X) || generalSpawnCenterX;
        const bossY = parseFloat(stage.Boss_Spawn_Center_Y) || generalSpawnCenterY;
        spawnStageMonsterAt(bossId, bossX, bossY, true);
    }

    try {
        if (typeof GameRenderer.rebuildStageBackground === 'function') {
            GameRenderer.rebuildStageBackground(stage, gameState.WORLD_WIDTH, gameState.WORLD_DEPTH);
        }
    } catch (e) {}

    buildUIButtons();
    pushSystemNotice(`🗺️ ${stage.Stage_Name}`, '#f1c40f', 1.5);
}

function nextStage(stage) {
    if (!stage) return;
    if (!stage.Next_Stage_ID) {
        console.log('마지막 스테이지 클리어');
        pushSystemNotice('🏆 모든 스테이지 클리어!', '#2ecc71', 2.0);
        return;
    }

    loadStage(stage.Next_Stage_ID);
}

function updateStageFlow() {
    if (gameState.gameMode === 'BOSS') {
        if (gameState.stageClearPending) return;

        const bossAlive = gameState.monsters.find(m => m.active && m.hp > 0 && m.isStageBoss);
        if (!bossAlive && gameState.currentStage) {
            gameState.stageClearPending = true;
            gameState.isStageCleared = true;
            buildUIButtons();
        }
        return;
    }

    if (gameState.gameMode !== 'STAGE') return;
    if (!gameState.currentStage) return;
    if (gameState.stageClearPending) return;

    const stage = gameState.currentStage;
    const aliveStageMonsters = gameState.monsters.filter(m => m.active && m.hp > 0 && m.spawnSource === 'STAGE');

    if (stage.Stage_Clear_Type === 'KILL_ALL') {
        if (aliveStageMonsters.length === 0) {
            onStageCleared(stage);
        }
    } else if (stage.Stage_Clear_Type === 'KILL_BOSS') {
        const bossAlive = aliveStageMonsters.find(m => m.isStageBoss);
        if (!bossAlive) {
            // 남은 스테이지 몬스터 정리
            for (let m of gameState.monsters) {
                if (m.active && m.spawnSource === 'STAGE') {
                    m.active = false;
                    m.hp = 0;
                }
            }
            onStageCleared(stage);
        }
    }
}

function toggleGameMode() {
    gameState.gameMode = (gameState.gameMode === 'STAGE') ? 'FREE_SPAWN' : 'STAGE';

    if (gameState.gameMode === 'BOSS') {
        const boss = gameState.monsters.find(m => m.active && m.isStageBoss) || (gameState.bossBattle && gameState.bossBattle.boss);
        const phase = boss && boss.boss ? boss.boss.phase : (gameState.bossBattle && gameState.bossBattle.phase);
        const hpRate = boss ? Math.max(0, boss.hp / Math.max(1, boss.maxHp)) : 0;
        const lateText = boss && boss.boss && boss.boss.isLatePhase ? '2페이즈' : '1페이즈';
        const patternName = boss && boss.boss && boss.boss.activePattern
            ? formatKasiyasPublicText(boss.boss.activePattern.Pattern_Name, { phaseStep: false, latePhase: true })
            : '기본 추적';

        const wrap = document.createElement('div');
        wrap.style.background = 'rgba(8, 10, 14, 0.64)';
        wrap.style.padding = '10px 12px';
        wrap.style.borderRadius = '10px';
        wrap.style.border = '1px solid rgba(255,255,255,0.10)';
        wrap.style.color = '#fff';
        wrap.style.pointerEvents = 'none';
        wrap.style.backdropFilter = 'blur(3px)';
        wrap.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';

        wrap.innerHTML = `
            <div style="font-size:11px; color:#9fc7ff; font-weight:700; margin-bottom:6px; letter-spacing:0.3px;">
                카시야스 전용 보스전
            </div>
            <div style="font-size:15px; color:#f1c40f; font-weight:800; margin-bottom:6px; line-height:1.3;">
                ${phase ? formatKasiyasPublicText(phase.Phase_Name, { phaseStep: true, latePhase: false }) : '1단계 로딩 중...'}
            </div>
            <div style="font-size:11px; color:rgba(255,255,255,0.88); line-height:1.45;">
                HP : ${(hpRate * 100).toFixed(1)}%<br>
                상태 : ${lateText}<br>
                행동 : ${patternName}
            </div>
        `;
        controls.appendChild(wrap);
        return;
    }

    if (gameState.gameMode === 'STAGE') {
        if (!gameState.currentStageId && gameState.DB_STAGE.length > 0) {
            const firstStage =
                gameState.DB_STAGE.find(stage => stage && stage.Stage_ID) ||
                gameState.DB_STAGE[0];

            if (firstStage && firstStage.Stage_ID) {
                gameState.currentStageId = firstStage.Stage_ID;
            }
        }

        if (gameState.currentStageId) {
            loadStage(gameState.currentStageId);
        }
    } else {
        gameState.currentStage = null;
        clearCurrentStageEntities();
        buildUIButtons();
    }
}

// ==========================================
// 🚀 비동기 데이터 로더 연결 (Data-Driven Init)
// ==========================================

async function loadGameDataAndInit() {
    try {
        console.log("카시야스 보스전 데이터 로딩 시작...");

        const rawData = await GameDataLoader.loadAllGameData();

        console.log("데이터 로딩 완료! 카시야스 보스전 엔진을 초기화합니다.");

        const pData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.playerData, 'player');
        const aData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.actionData, 'action');
        const bData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.bossData, 'monster');
        const bpData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.bossPhaseData, 'bossPhase');
        const bptData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.bossPatternData, 'bossPattern');
        const bpaData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.bossPatternActionData, 'bossPatternAction');
        const bpoData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.bossPatternObjectData, 'bossPatternObject');
        const bpoaData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.bossPatternObjectActionData, 'bossPatternObjectAction');
        const stData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.stageData, 'stage');
        const p2m3PlayerData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.p2M3PlayerData, 'p2M3Player');
        const p2m3WaveData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.p2M3WaveData, 'p2M3Wave');
        const p2m3WaveSpawnData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.p2M3WaveSpawnData, 'p2M3WaveSpawn');
        const p2m3SlashData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.p2M3SlashData, 'p2M3Slash');
        const p3m3SystemData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.p3M3SystemData, 'p3M3System');
        const p3m3AreaData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.p3M3AreaData, 'p3M3Area');
        const p3m3PortalData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.p3M3PortalData, 'p3M3Portal');
        const p3m3MonsterData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.p3M3MonsterData, 'p3M3Monster');
        const p3m3RouteData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.p3M3RouteData, 'p3M3Route');
        const p3m3DialogueData = GameDataNormalizer.normalizeRuntimeDataSet(rawData.p3M3DialogueData, 'p3M3Dialogue');

        gameState.DB_P2_M3_PLAYER = p2m3PlayerData || [];
        gameState.DB_P2_M3_WAVE = p2m3WaveData || [];
        gameState.DB_P2_M3_WAVE_SPAWN = p2m3WaveSpawnData || [];
        gameState.DB_P2_M3_SLASH = p2m3SlashData || [];
        gameState.DB_P3_M3_SYSTEM = p3m3SystemData || [];
        gameState.DB_P3_M3_AREA = p3m3AreaData || [];
        gameState.DB_P3_M3_PORTAL = p3m3PortalData || [];
        gameState.DB_P3_M3_MONSTER = p3m3MonsterData || [];
        gameState.DB_P3_M3_ROUTE = p3m3RouteData || [];
        gameState.DB_P3_M3_DIALOGUE = p3m3DialogueData || [];

        PlayerManager.init(pData, aData, gameState);

        // Boss_info를 기존 MonsterManager 엔티티 구조로 태운다.
        // 기존 일반 몬스터/스킬/패턴 DB는 사용하지 않는다.
        MonsterManager.init(bData, [], [], gameState);

        gameState.DB_STAGE = stData || [];
        GameDataNormalizer.buildBossRuntimeTables(bpData, bptData, bpaData, bpoData, bpoaData);

        const firstStage =
            gameState.DB_STAGE.find(stage => stage && stage.Stage_ID) ||
            gameState.DB_STAGE[0];

        if (firstStage && firstStage.Stage_ID) {
            gameState.currentStageId = firstStage.Stage_ID;
        }

        GameRenderer.init(document.getElementById('gameCanvas'), gameState.WORLD_WIDTH);
        buildUIButtons();
        updateBossBattleLayoutScale();

        loadBossStage(gameState.currentStageId);

        requestAnimationFrame(gameLoop);

    } catch (error) {
        console.error("데이터 로드 에러:", error);
        alert("카시야스 보스전 데이터를 불러오는 데 실패했습니다. GameData 폴더의 JSON 파일명을 확인해주세요.");
    }
}

window.onload = () => {
    loadGameDataAndInit();
};

function toggleP3M3HiddenRouteTestBuff() {
    const p = gameState && gameState.player ? gameState.player : null;
    if (!p) return false;
    const enabled = !!(p.p3TrialWillBuff && p.p3TrialBodyBuff);
    if (enabled) {
        p.p3TrialWillBuff = false;
        p.p3TrialBodyBuff = false;
        p.p3TrialWillBuffFlashTimer = 0;
        p.p3TrialBodyBuffFlashTimer = 0;
        try { pushSystemNotice('F8 히든 분기 테스트 버프 제거', '#bbbbbb', 1.2); } catch (err) {}
    } else {
        p.p3TrialWillBuff = true;
        p.p3TrialBodyBuff = true;
        p.p3TrialWillBuffFlashTimer = Math.max(parseFloat(p.p3TrialWillBuffFlashTimer) || 0, 1.5);
        p.p3TrialBodyBuffFlashTimer = Math.max(parseFloat(p.p3TrialBodyBuffFlashTimer) || 0, 1.5);
        try { pushSystemNotice('F8 히든 분기 테스트 버프 획득', '#ffe9a6', 1.2); } catch (err) {}
    }
    return true;
}

window.addEventListener('keydown', e => {
    gameState.keys[e.code] = true;

    if (e.code === 'F8' && !e.repeat) {
        e.preventDefault();
        toggleP3M3HiddenRouteTestBuff();
        return;
    }

    if (typeof P3M3FinalIssenSystem !== 'undefined' && P3M3FinalIssenSystem.handleDialogueKeyDown && P3M3FinalIssenSystem.handleDialogueKeyDown(gameState, e)) {
        e.preventDefault();
        return;
    }

    if (gameState.specialMode === 'P2_M3_DIMENSION_DEFENSE') {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyX', 'KeyD', 'KeyA', 'KeyC', 'Space', 'F12'].includes(e.code)) {
            e.preventDefault();
        }
        return;
    }

    // 거대 검 조준 모드 중에는 조준 전용 키가 브라우저/기존 전투 조작으로 전파되지 않게 한다.
    if ((gameState.p2m2GiantSwordAim || (parseFloat(gameState.p2m2GiantSwordInputBlockTimer) || 0) > 0) &&
        (e.code === 'KeyX' || e.code === 'KeyZ' || e.code === 'Space' || e.code === 'KeyC' || e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
        e.preventDefault();
        return;
    }

    if (e.code === 'KeyR') PlayerManager.revive(gameState);
    if (e.code === 'KeyV') gameState.isDebugView = !gameState.isDebugView;
    if (e.code === 'F9') {
        e.preventDefault();
        setBossPracticeModeEnabled(!gameState.bossPractice.enabled);
        return;
    }
    if (e.code === 'F10') {
        e.preventDefault();
        triggerBossPhaseTransitionDebug();
        return;
    }
    if (e.code === 'F12' && !e.repeat) {
        e.preventDefault();
        gameState.superDamageMode = !gameState.superDamageMode;
        try { pushSystemNotice(gameState.superDamageMode ? 'F12 슈퍼 모드 ON · 보스 피해 x10 · 플레이어 무적' : 'F12 슈퍼 모드 OFF', gameState.superDamageMode ? '#ffe27c' : '#bbbbbb', 1.35); } catch (err) {}
        return;
    }
    if (e.code === 'F11') {
        e.preventDefault();
        triggerBossPreviousPhaseDebug();
        return;
    }

    if (handleBossPracticeKeyInput(e)) {
        e.preventDefault();
        return;
    }

    // 보스전 전용 버전에서는 일반 스테이지/자유소환 전환을 막는다.
    if (e.code === 'F6' && gameState.gameMode !== 'BOSS') {
        e.preventDefault();
        toggleGameMode();
    }

    // 자유 소환 모드에서만 버튼/숫자 소환 활성화
    if (gameState.gameMode === 'FREE_SPAWN') {
        if ((e.code.startsWith('Digit') || e.code.startsWith('Numpad')) && gameState.player.active) {
            let num = parseInt(e.key);
            if (num >= 1 && num <= 9 && gameState.MONSTER_KEYS[num - 1]) {
                let mId = gameState.MONSTER_KEYS[num - 1];
                let d = gameState.DB_MONSTER[mId];

                if (d && (gameState.isTestMode || gameState.player.level >= d.spawnReqLv)) {
                    MonsterManager.activateSpawner(mId, gameState);
                } else {
                    gameState.floatingTexts.push({
                        x: gameState.player.x,
                        y: gameState.player.y,
                        z: gameState.player.z + gameState.player.bodyZ,
                        text: "🔒 레벨 부족!",
                        color: "#7f8c8d",
                        size: "20px",
                        timer: 1.0,
                        isBubble: true
                    });
                }
            }
        }
    }
});

window.addEventListener('keyup', e => { gameState.keys[e.code] = false; });

function gameLoop(timestamp) {
    try {
        let deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        if (deltaTime > 0.1) deltaTime = 0.016;

        updateBossBattleLayoutScale();

        if (gameState.specialMode === 'P2_M3_DIMENSION_DEFENSE' && typeof P2M3DimensionDefenseSystem !== 'undefined' && P2M3DimensionDefenseSystem.isActive(gameState)) {
            updateEnvironment(deltaTime);
            P2M3DimensionDefenseSystem.update(gameState, deltaTime);
            GameRenderer.render(gameState);
            updateHUD();
            requestAnimationFrame(gameLoop);
            return;
        }

        const phaseTransitionActive = !!(gameState.phaseTransition && gameState.phaseTransition.active);
        const p2m3IntroActive = !!(gameState.p2m3IntroRuntime && gameState.p2m3IntroRuntime.active);
        if (!phaseTransitionActive && !p2m3IntroActive) {
            PlayerManager.update(deltaTime, gameState.keys, gameState);
        }
        MonsterManager.update(deltaTime, gameState);
        if (typeof P3M3FinalIssenSystem !== 'undefined' && P3M3FinalIssenSystem.isActive(gameState)) {
            P3M3FinalIssenSystem.update(gameState, deltaTime);
        }
        updateEnvironment(deltaTime);
        if (!phaseTransitionActive) {
            updateStageFlow();
            updateStageWarp();
        }

        const cameraBaseWidth = (GameRenderer && GameRenderer.canvas ? GameRenderer.canvas.width : 1600);
        const cameraBaseHeight = (GameRenderer && GameRenderer.canvas ? GameRenderer.canvas.height : 900);

        gameState.camera.width = Math.max(1, Math.min(cameraBaseWidth, gameState.WORLD_WIDTH));
        gameState.camera.height = Math.max(1, Math.min(cameraBaseHeight, GameRenderer.GROUND_BASE_Y + gameState.WORLD_DEPTH));

        const transition = gameState.phaseTransition && gameState.phaseTransition.active ? gameState.phaseTransition : null;
        const p2m3IntroCamera = gameState.p2m3IntroRuntime && gameState.p2m3IntroRuntime.active ? gameState.p2m3IntroRuntime : null;
        const focusEntity = transition && transition.boss ? transition.boss : gameState.player;
        const focusX = p2m3IntroCamera && Number.isFinite(parseFloat(p2m3IntroCamera.focusX))
            ? parseFloat(p2m3IntroCamera.focusX)
            : (focusEntity && Number.isFinite(parseFloat(focusEntity.x)) ? parseFloat(focusEntity.x) : (gameState.player.x || 0));
        gameState.camera.x = Math.max(
            0,
         Math.min(
         Math.max(0, gameState.WORLD_WIDTH - gameState.camera.width),
         focusX - gameState.camera.width / 2
         )
        );

        if (gameState.screenShake && (parseFloat(gameState.screenShake.timer) || 0) > 0) {
            const shake = gameState.screenShake;
            shake.timer = Math.max(0, (parseFloat(shake.timer) || 0) - deltaTime);
            const maxTime = Math.max(0.001, parseFloat(shake.maxTime) || 0.15);
            const ratio = Math.max(0, Math.min(1, shake.timer / maxTime));
            const amp = (parseFloat(shake.power) || 0) * ratio * ratio;
            const seed = timestamp * 0.043;
            gameState.camera.shakeX = Math.sin(seed * 7.13) * amp + Math.sin(seed * 2.17 + 1.2) * amp * 0.42;
            gameState.camera.shakeY = Math.cos(seed * 6.31 + 0.4) * amp * 0.72;
            if (shake.timer <= 0) {
                gameState.camera.shakeX = 0;
                gameState.camera.shakeY = 0;
                shake.power = 0;
            }
        } else if (gameState.camera) {
            gameState.camera.shakeX = 0;
            gameState.camera.shakeY = 0;
        }

        if (transition || p2m3IntroCamera) {
            let zoomValue = 1;
            if (transition) {
                const trDuration = Math.max(0.001, parseFloat(transition.duration) || 3.0);
                const trTimer = Math.max(0, Math.min(trDuration, parseFloat(transition.timer) || 0));
                const zoomIn = Math.min(1, trTimer / 0.75);
                const zoomOut = Math.min(1, (trDuration - trTimer) / 0.55);
                const zoomHold = Math.max(0, Math.min(1, Math.min(zoomIn, zoomOut)));
                const eased = 1 - Math.pow(1 - zoomHold, 3);
                const trType = String(transition && transition.type || '').trim().toUpperCase();
                const transitionZoomAmp = trType === 'KASIYAS_P2_TO_P3' ? 0.48 : 0.34;
                zoomValue = 1 + transitionZoomAmp * eased;
            }
            if (p2m3IntroCamera) {
                zoomValue = Math.max(zoomValue, parseFloat(p2m3IntroCamera.zoom) || 1.22);
            }
            gameState.camera.zoom = zoomValue;
            gameState.camera.focusX = focusX;
            const bodyZ = focusEntity && focusEntity.d ? ((focusEntity.d.bodyZ || focusEntity.d.Body_Size_Z || 160) * (focusEntity.scale || 1)) : 120;
            gameState.camera.focusY = p2m3IntroCamera && Number.isFinite(parseFloat(p2m3IntroCamera.focusY))
                ? parseFloat(p2m3IntroCamera.focusY)
                : GameRenderer.GROUND_BASE_Y + (focusEntity.y || 0) - Math.max(40, bodyZ * 0.58);
        } else {
            gameState.camera.zoom = 1;
            gameState.camera.focusX = null;
            gameState.camera.focusY = null;
        }

        GameRenderer.render(gameState);
        updateHUD();
    } catch (e) {
        console.error("루프 에러:", e);
    }
    requestAnimationFrame(gameLoop);
}

function updateEnvironment(deltaTime) {
    updateBossPatternDialogueTimer(deltaTime);

    if (gameState.screenHitFlash) {
        gameState.screenHitFlash.life -= deltaTime;
        if (gameState.screenHitFlash.life <= 0) gameState.screenHitFlash = null;
    }

    for (let i = gameState.systemNotices.length - 1; i >= 0; i--) {
    const notice = gameState.systemNotices[i];
        if (!notice) {
            gameState.systemNotices.splice(i, 1);
            continue;
        }

        notice.timer -= deltaTime;
        if (notice.timer <= 0) {
            gameState.systemNotices.splice(i, 1);
        }
    }

        if (!gameState.player.active) return;

        if (gameState.targetUI.monster && gameState.targetUI.monster.isStageBoss) {
            gameState.targetUI.timer = 999999;
        } else if (gameState.targetUI.timer > 0) {
            gameState.targetUI.timer -= deltaTime;
            if (gameState.targetUI.timer < 0) gameState.targetUI.timer = 0;
        }

    for (let i = gameState.auras.length - 1; i >= 0; i--) {
        let a = gameState.auras[i];
        if (a.owner.hp <= 0 || a.life <= 0) {
            gameState.auras.splice(i, 1);
            continue;
        }
        a.life -= deltaTime;
        a.timer += deltaTime;
        if (a.timer >= a.cycle) {
            a.timer = 0;
            let p = gameState.player;
            let pW = p.bodyX * p.scale;
            let pD = p.bodyY * p.scale;
            let pH = p.bodyZ * p.scale;
            if (checkAABB3D(a.owner.x, a.owner.y, a.owner.z, a.w, a.d, a.h, p.x, p.y, p.z, pW, pD, pH)) {
                let baseDmg = a.owner.d.atk * (parseFloat(a.skill.Skill_DMG_Rate) || 1);
                PlayerManager.takeDamage(
                    gameState,
                    calcScaledDamage(a.owner.d.level, p.level, baseDmg),
                    a.owner.x,
                    a.owner.y,
                    a.skill.statusType,
                    a.skill.statusDur,
                    a.skill.statusProb
                );
            }
        }
    }

    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        let p = gameState.projectiles[i];
        p.life -= deltaTime;
        if (p.life <= 0) {
            gameState.projectiles.splice(i, 1);
            continue;
        }
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.z += p.vz * deltaTime;

        if (p.isPlayer) {
            let hitAny = false;
            for (let m of gameState.monsters) {
                if (m.active && m.hp > 0 && !p.hitTargets.has(m)) {
                    let mW = m.d.bodyX * m.scale;
                    let mD = m.d.bodyY * m.scale;
                    let mH = m.d.bodyZ * m.scale;
                    if (checkAABB3D(p.x, p.y, p.z, p.hitX, p.hitY, p.hitZ, m.x, m.y, m.z, mW, mD, mH)) {
                        MonsterManager.takeDamage(m, p.atk, gameState);
                        if (typeof PlayerManager !== 'undefined' && PlayerManager.addFightingSpirit && gameState.player && (gameState.player.fightingSpiritAtkGainCooldownTimer || 0) <= 0) {
                            if (PlayerManager.addFightingSpirit(gameState, gameState.player.atkGetFightingSpirit || 0, { lockTime: gameState.player.atkGetFightingSpiritCooldown || 0.3 })) {
                                gameState.player.fightingSpiritAtkGainCooldownTimer = Math.max(0, gameState.player.atkGetFightingSpiritCooldown || 0);
                            }
                        }
                        p.hitTargets.add(m);
                        hitAny = true;
                        if (!p.penetrate) break;
                    }
                }
            }
            if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.tryDamageBossDestructibleObjects && !p.hasHit) {
                const objectHit = BossObjectSystem.tryDamageBossDestructibleObjects(gameState, {
                    x: p.x,
                    y: p.y,
                    z: p.z,
                    w: p.hitX,
                    d: p.hitY,
                    h: p.hitZ
                }, p.atk, { type: 'projectile', projectile: p, penetrate: p.penetrate });
                if (objectHit) {
                    hitAny = true;
                    if (!p.penetrate) {
                        p.hasHit = true;
                        gameState.projectiles.splice(i, 1);
                        continue;
                    }
                }
            }

            if (hitAny && !p.penetrate) {
                p.hasHit = true;
                gameState.projectiles.splice(i, 1);
                continue;
            }
        } else if (!p.isPlayer && !p.hasHit) {
            let pl = gameState.player;
            let pw = pl.bodyX * pl.scale;
            let pd = pl.bodyY * pl.scale;
            let ph = pl.bodyZ * pl.scale;
            if (checkAABB3D(p.x, p.y, p.z, p.hitX, p.hitY, p.hitZ, pl.x, pl.y, pl.z, pw, pd, ph)) {
                PlayerManager.takeDamage(
                    gameState,
                    calcScaledDamage(p.attackerLevel || 1, pl.level, p.atk),
                    p.x,
                    p.y,
                    p.statusType,
                    p.statusDur,
                    p.statusProb
                );
                if (p.penetrate) p.hasHit = true;
                else {
                    gameState.projectiles.splice(i, 1);
                    continue;
                }
            }
        }
    }

    for (let i = gameState.hitboxes.length - 1; i >= 0; i--) {
        gameState.hitboxes[i].life -= deltaTime;
        if (gameState.hitboxes[i].life <= 0) gameState.hitboxes.splice(i, 1);
    }

    for (let i = gameState.effects.length - 1; i >= 0; i--) {
        let eff = gameState.effects[i];
        eff.life -= deltaTime;

        if (eff.type === 'particle') {
            eff.x += (eff.vx || 0) * deltaTime;
            eff.y += (eff.vy || 0) * deltaTime;
            eff.z += (eff.vz || 0) * deltaTime;
            eff.vz = (eff.vz || 0) - gameState.GRAVITY * deltaTime;
            if (eff.z < 0) eff.z = 0;
        }

        if (eff.life <= 0) {
            if (eff.type === 'warning' && eff.skill) {
                const skill = eff.skill;
                const atkW = parseFloat(skill.Skill_Hitbox_Size_X) || 75;
                const atkD = parseFloat(skill.Skill_Hitbox_Size_Y) || 50;
                const atkH = parseFloat(skill.Skill_Hitbox_Size_Z) || 1000;

                let spawnX = eff.x;
                let spawnY = eff.y;
                let spawnZ = eff.z;

                const hitPlace = String(skill.Hit_Effect_Place || 'On_Warning_Effect').trim();
                if (hitPlace === 'Front_Monster' && eff.owner) {
                    spawnX = eff.owner.x + (eff.owner.faceDir === 1 ? atkW / 2 : -atkW / 2);
                    spawnY = eff.owner.y;
                    spawnZ = eff.owner.z || 0;
                } else if (hitPlace === 'Range_From_Monster' && eff.owner) {
                    spawnX = eff.owner.x;
                    spawnY = eff.owner.y;
                    spawnZ = eff.owner.z || 0;
                } else {
                    spawnX = eff.x;
                    spawnY = eff.y;
                    spawnZ = eff.z || 0;
                }

                const skillEffectEnum = skill.Skill_Effect_Render_Type || eff.skillEffectRenderType || '';
                const resolvedSkillEffectType =
                    eff.skillEffectType ||
                    (typeof MonsterSkill !== 'undefined' && MonsterSkill.resolveSkillEffectType
                        ? MonsterSkill.resolveSkillEffectType(skillEffectEnum, '')
                        : '');

                if (resolvedSkillEffectType === 'slash' || skill.Skill_Type === 'Melee_Area_ATK') {
                    const slashColor =
                        skillEffectEnum === 'EFT_THUNDERBOLT_SLASH'
                            ? "rgba(241, 196, 15, 0.94)"
                            : skillEffectEnum === 'EFT_LIGHTNING_SLASH'
                                ? "rgba(255, 235, 150, 0.92)"
                                : skillEffectEnum === 'EFT_MAGIC_SLASH'
                                    ? "rgba(180, 140, 255, 0.92)"
                                    : "rgba(231, 76, 60, 0.90)";

                    const slashLife =
                        skillEffectEnum === 'EFT_THUNDERBOLT_SLASH' ? 0.34 :
                        skillEffectEnum === 'EFT_LIGHTNING_SLASH' ? 0.30 :
                        0.28;

                    gameState.effects.push({
                        type: 'slash',
                        renderType: skillEffectEnum,
                        name: skill.Skill_Name || skill.Skill_Code || '',
                        x: spawnX,
                        y: spawnY,
                        z: spawnZ + atkH / 2,
                        dir: eff.faceDir || (eff.owner ? eff.owner.faceDir : 1),
                        w: atkW,
                        h: atkH,
                        life: slashLife,
                        maxLife: slashLife,
                        color: slashColor
                    });
                } else if (resolvedSkillEffectType) {
                    const fxLife =
                        resolvedSkillEffectType === 'lightning' ? 0.36 :
                        resolvedSkillEffectType === 'ice_strike' ? 0.40 :
                        resolvedSkillEffectType === 'ice_needle' ? 0.34 :
                        0.30;

                    gameState.effects.push({
                        type: resolvedSkillEffectType,
                        renderType: skillEffectEnum,
                        name: skill.Skill_Name || skill.Skill_Code || '',
                        x: spawnX,
                        y: spawnY,
                        z: spawnZ,
                        w: atkW,
                        d: atkD,
                        h: atkH,
                        life: fxLife,
                        maxLife: fxLife,
                        color:
                            resolvedSkillEffectType === 'lightning' ? '#f1c40f' :
                            (resolvedSkillEffectType === 'ice_needle' || resolvedSkillEffectType === 'ice_strike') ? '#3498db' :
                            '#ffffff'
                    });
                }

                let pW = gameState.player.bodyX * gameState.player.scale;
                let pD = gameState.player.bodyY * gameState.player.scale;
                let pH = gameState.player.bodyZ * gameState.player.scale;
                if (checkAABB3D(
                    spawnX, spawnY, spawnZ, atkW, atkD, atkH,
                    gameState.player.x, gameState.player.y, gameState.player.z, pW, pD, pH
                )) {
                    if (eff.owner && eff.owner.hp > 0) {
                        let baseDmg = eff.owner.d.atk * (parseFloat(skill.Skill_DMG_Rate) || 2);
                        PlayerManager.takeDamage(
                            gameState,
                            calcScaledDamage(eff.owner.d.level, gameState.player.level, baseDmg),
                            spawnX,
                            spawnY,
                            skill.statusType,
                            skill.statusDur,
                            skill.statusProb
                        );
                    }
                }
            }
            gameState.effects.splice(i, 1);
        }
    }

    for (let i = gameState.floatingTexts.length - 1; i >= 0; i--) {
    let ft = gameState.floatingTexts[i];
        if (!ft) {
            gameState.floatingTexts.splice(i, 1);
            continue;
        }

        const text = String(ft.text || '').trim();
        const isStageSystemBubble =
            text === '🌀 워프가 열렸습니다!' ||
            text === '🏆 모든 스테이지 클리어!' ||
            text.startsWith('🗺️ ');

        if (isStageSystemBubble) {
            gameState.floatingTexts.splice(i, 1);
            continue;
        }

        ft.timer -= deltaTime;
        ft.z += 25 * deltaTime;

        if (ft.timer <= 0) {
            gameState.floatingTexts.splice(i, 1);
        }
    }
}

function buildUIButtons() {
    const controls = document.getElementById('topRightUI');
    const guideContent = document.getElementById('sideGuideContent') || document.getElementById('guideContent');
    const bossPanel = document.getElementById('bossAIPanel');
    if (!controls && !bossPanel) return;

    const p = gameState.player || { level: 1, active: false };
    const dashReqLv = parseFloat((gameState.actions.find(a => a.Action_Name === '대쉬') || {}).Require_Level) || 2;
    const swapReqLv = parseFloat((gameState.actions.find(a => a.Action_Name === '공격 모드 변경') || {}).Require_Level) || 3;
    const waveReqLv = parseFloat((gameState.actions.find(a => a.Action_Name === '웨이브') || {}).Require_Level) || 4;
    const cannonReqLv = parseFloat((gameState.actions.find(a => a.Action_Name === '캐논볼') || {}).Require_Level) || 5;

    if (guideContent) {
        guideContent.innerHTML = `
            <div class="control-guide-card">
                <div class="control-guide-title">기본 이동</div>
                <div class="control-row"><span class="keycap">방향키</span><span>8방향 이동</span></div>
                <div class="control-row"><span class="keycap">더블 탭</span><span>같은 방향키 빠르게 2회 + 유지</span></div>
                <div class="control-row"><span class="keycap">C</span><span>점프</span></div>
                <div class="control-row"><span class="keycap">Z</span><span>대쉬</span></div>
            </div>
            <div class="control-guide-card">
                <div class="control-guide-title">전투 조작</div>
                <div class="control-row"><span class="keycap">X</span><span>기본 공격</span></div>
                <div class="control-row"><span class="keycap">F</span><span>무기 / 공격 모드 전환</span></div>
                <div class="control-row"><span class="keycap guard">D</span><span>타이밍 가드</span></div>
                <div class="control-row"><span class="keycap">A</span><span>웨이브</span></div>
                <div class="control-row"><span class="keycap">S</span><span>캐논볼</span></div>
            </div>
            <div class="control-guide-card">
                <div class="control-guide-title">디버그</div>
                <div class="control-row"><span class="keycap debug">V</span><span>히트박스 표시</span></div>
                <div class="control-row"><span class="keycap debug">F8</span><span>3P 최종패턴 히든 버프 토글</span></div>
                <div class="control-row"><span class="keycap debug">F9</span><span>카시야스 연습 모드</span></div>
                <div class="control-row"><span class="keycap debug">F10</span><span>다음 단계 전환 테스트</span></div>
                <div class="control-row"><span class="keycap debug">F11</span><span>이전 단계 복귀 테스트</span></div>
                <div class="control-row"><span class="keycap debug">R</span><span>사망 시 부활</span></div>
            </div>
        `;
    }

    if (controls) controls.innerHTML = '';

    if (gameState.gameMode === 'BOSS') {
        renderBossPracticePanel(controls);
        return;
    }

    if (!controls) return;

    if (gameState.gameMode === 'STAGE') {
        const stage = gameState.currentStage;
        const totalStageCount = Array.isArray(gameState.DB_STAGE) ? gameState.DB_STAGE.length : 0;

        let currentStageIndex = 0;
        if (stage) {
            const stageNumber = parseInt(stage.Stage_Number);
            if (!isNaN(stageNumber) && stageNumber > 0) {
                currentStageIndex = stageNumber;
            } else {
                currentStageIndex = Math.max(
                    1,
                    (gameState.DB_STAGE || []).findIndex(s => s && s.Stage_ID === stage.Stage_ID) + 1
                );
            }
        }

        const clearConditionText = !stage
            ? '로딩 중...'
            : stage.Stage_Clear_Type === 'KILL_BOSS'
                ? '보스 처치'
                : '모든 적 처치';

        const wrap = document.createElement('div');
        wrap.style.background = 'rgba(8, 10, 14, 0.58)';
        wrap.style.padding = '10px 12px';
        wrap.style.borderRadius = '10px';
        wrap.style.border = '1px solid rgba(255,255,255,0.10)';
        wrap.style.color = '#fff';
        wrap.style.pointerEvents = 'none';
        wrap.style.backdropFilter = 'blur(3px)';
        wrap.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';

        wrap.innerHTML = `
            <div style="font-size:11px; color:#9fc7ff; font-weight:700; margin-bottom:6px; letter-spacing:0.3px;">
                진행현황 ${currentStageIndex}/${totalStageCount || '?'}
            </div>
            <div style="font-size:15px; color:#f1c40f; font-weight:800; margin-bottom:6px; line-height:1.3;">
                ${stage ? stage.Stage_Name : '스테이지 로딩 중...'}
            </div>
            <div style="font-size:11px; color:rgba(255,255,255,0.88); line-height:1.45;">
                클리어 조건 : ${clearConditionText}
            </div>
        `;

        controls.appendChild(wrap);
        return;
    }

    if (!p.active) return;

    controls.innerHTML = `
        <button
            id="autoSpawnBtn"
            class="spawn-btn"
            style="
                background:${gameState.isAutoSpawn ? '#e67e22' : '#7f8c8d'};
                color:#fff;
                margin-bottom:4px;
            "
            onclick="toggleAutoSpawn()"
        >자동 스폰: ${gameState.isAutoSpawn ? 'ON' : 'OFF'}</button>
    `;

    for (let i = 0; i < gameState.MONSTER_KEYS.length; i++) {
        let m = gameState.DB_MONSTER[gameState.MONSTER_KEYS[i]];
        if (!m) continue;

        let row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '4px';
        row.style.position = 'relative';

        let btn = document.createElement('button');
        btn.className = 'spawn-btn';
        btn.style.flex = '1';
        btn.style.padding = '6px 8px';
        btn.style.fontSize = '11px';
        btn.style.borderRadius = '8px';
        btn.style.border = '1px solid rgba(255,255,255,0.10)';
        btn.style.backdropFilter = 'blur(2px)';
        btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.18)';

        let btnOne = document.createElement('button');
        btnOne.className = 'spawn-btn';
        btnOne.style.width = '34px';
        btnOne.style.padding = '6px 0';
        btnOne.style.textAlign = 'center';
        btnOne.style.fontSize = '11px';
        btnOne.style.borderRadius = '8px';
        btnOne.style.border = '1px solid rgba(255,255,255,0.10)';
        btnOne.style.backdropFilter = 'blur(2px)';
        btnOne.style.boxShadow = '0 4px 10px rgba(0,0,0,0.18)';

        let isLocked = p.level < m.spawnReqLv && !gameState.isTestMode;
        if (isLocked) {
            btn.innerHTML = `<span style="margin-right:4px;">🔒</span> Lv.${m.spawnReqLv} 해금`;
            btn.style.backgroundColor = 'rgba(127,140,141,0.58)';
            btn.style.color = '#cfd6db';
            btn.style.cursor = 'not-allowed';

            btnOne.innerText = '🔒';
            btnOne.style.backgroundColor = 'rgba(85,85,85,0.55)';
            btnOne.style.color = '#8a959b';
            btnOne.style.cursor = 'not-allowed';
        } else {
            const monsterGrade = String(m.grade || '').trim().toUpperCase();
            const isBoss = monsterGrade.includes('BOSS') || String(m.id || '').startsWith('B');
            const prefix = isBoss ? '☠️' : `[${i + 1}]`;
            const txtColor = isBoss ? '#ff8f8f' : '#f1c40f';

            btn.innerHTML = `<span style="color:${txtColor}; margin-right:4px; font-weight:900;">${prefix}</span> ${m.name}`;
            btn.style.backgroundColor = m.color;
            btn.style.color = getContrastColor(m.color);
            btn.onclick = () => MonsterManager.activateSpawner(m.id, gameState);

            btnOne.innerText = '+1';
            btnOne.style.backgroundColor = 'rgba(75,85,99,0.74)';
            btnOne.style.color = '#fff';
            btnOne.onclick = () => MonsterManager.spawnInstant(m.id, gameState);
        }

        row.appendChild(btn);
        row.appendChild(btnOne);
        controls.appendChild(row);
    }
}


function getKasiyasPracticeBoss() {
    const stageBoss = gameState.monsters.find(m => m && m.active && m.isStageBoss && m.boss);
    if (stageBoss) return stageBoss;
    const battleBoss = gameState.bossBattle && gameState.bossBattle.boss;
    if (battleBoss && battleBoss.active && battleBoss.boss) return battleBoss;
    return null;
}


function triggerBossPhaseTransitionDebug() {
    const bossMonster = getKasiyasPracticeBoss();
    if (!bossMonster || !bossMonster.boss) {
        pushSystemNotice('전환할 카시야스가 없습니다', '#ffb8b8', 1.2);
        return false;
    }

    if (gameState.phaseTransition && gameState.phaseTransition.active) {
        const transition = gameState.phaseTransition;
        const transitionBoss = (transition && transition.boss) || bossMonster;
        if (transitionBoss && transition) {
            const tx = parseFloat(transition.preMoveTargetX);
            const ty = parseFloat(transition.preMoveTargetY);
            if (Number.isFinite(tx)) transitionBoss.x = tx;
            if (Number.isFinite(ty)) transitionBoss.y = ty;
            const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 2000);
            transitionBoss.faceDir = (parseFloat(transitionBoss.x) || 0) >= worldW * 0.50 ? -1 : 1;
            transition.phase = 'CUTSCENE';
            transition.timer = Math.max(parseFloat(transition.duration) || 0, parseFloat(transition.timer) || 0);
            transition.progress = 1;
            if (typeof MonsterManager.finishBossPhaseTransition === 'function' && MonsterManager.finishBossPhaseTransition(transitionBoss, gameState, transition)) {
                pushSystemNotice('F10 · 단계 전환 즉시 완료', '#ff9f7f', 1.2);
                buildUIButtons();
                return true;
            }
        }
        pushSystemNotice('단계 전환을 즉시 완료할 수 없습니다', '#ffd27f', 1.0);
        return true;
    }

    const nextPhase = typeof MonsterManager.getBossNextPhase === 'function'
        ? MonsterManager.getBossNextPhase(bossMonster.boss.phase, gameState)
        : null;
    const transitionType = String(bossMonster.boss.phase && bossMonster.boss.phase.Phase_Transition_Type || '').trim();
    if (!nextPhase || !transitionType) {
        pushSystemNotice('다음 단계 전환 데이터가 없습니다', '#ffb8b8', 1.4);
        return false;
    }

    if (gameState.bossPractice && gameState.bossPractice.enabled) {
        gameState.bossPractice.enabled = false;
        gameState.bossPractice.lastPatternId = null;
        buildUIButtons();
    }

    bossMonster.hp = 0;
    bossMonster.isDeadProcessed = false;
    bossMonster.deadTimer = 0;
    bossMonster.active = true;

    if (typeof MonsterManager.startBossPhaseTransition === 'function') {
        const started = MonsterManager.startBossPhaseTransition(bossMonster, gameState);
        if (started) {
            pushSystemNotice('F10 · 카시야스 단계 전환 테스트', '#ff7777', 1.2);
            return true;
        }
    }

    pushSystemNotice('단계 전환 시작에 실패했습니다', '#ffb8b8', 1.4);
    return false;
}


function getSortedBossPhaseList() {
    return Object.values(gameState.DB_BOSS_PHASE || {})
        .filter(phase => phase && phase.Phase_ID)
        .sort((a, b) => (parseFloat(a.Phase_Order) || 0) - (parseFloat(b.Phase_Order) || 0));
}

function getCurrentBossPhaseIndex(bossMonster) {
    const boss = bossMonster && bossMonster.boss ? bossMonster.boss : null;
    const currentPhaseId = String(boss && boss.phaseId || boss && boss.phase && boss.phase.Phase_ID || '').trim();
    const phases = getSortedBossPhaseList();
    const idx = phases.findIndex(phase => String(phase.Phase_ID || '').trim() === currentPhaseId);
    return { phases, index: idx };
}

function rebuildBossPatternCooldownsForCurrentPhase(boss) {
    if (!boss) return;
    const patternSetId = String(boss.patternSetId || '').trim();
    const patterns = gameState.DB_BOSS_PATTERN_BY_SET && gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
        ? gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
        : [];
    boss.patternCooldowns = {};
    for (const pattern of patterns) {
        const patternId = String(pattern.Pattern_ID || '').trim();
        if (!patternId) continue;
        boss.patternCooldowns[patternId] = parseFloat(pattern.Pattern_Initial_Cooltime) || 0;
    }
}

function switchKasiyasBossToPhaseDebug(targetPhase, options = {}) {
    const bossMonster = getKasiyasPracticeBoss();
    if (!bossMonster || !targetPhase) {
        pushSystemNotice('전환할 카시야스 단계를 찾을 수 없습니다', '#ffb8b8', 1.2);
        return false;
    }

    const nextMonsterId = String(targetPhase.Phase_Monster_ID || '').trim();
    const nextData = gameState.DB_MONSTER ? gameState.DB_MONSTER[nextMonsterId] || null : null;
    if (!nextData) {
        pushSystemNotice('대상 단계 몬스터 데이터가 없습니다', '#ffb8b8', 1.2);
        return false;
    }

    const keepX = Number.isFinite(parseFloat(bossMonster.x)) ? parseFloat(bossMonster.x) : gameState.WORLD_WIDTH * 0.55;
    const keepY = Number.isFinite(parseFloat(bossMonster.y)) ? parseFloat(bossMonster.y) : gameState.WORLD_DEPTH * 0.5;
    const keepFace = bossMonster.faceDir || -1;
    const practiceWasEnabled = !!(gameState.bossPractice && gameState.bossPractice.enabled);

    if (typeof MonsterManager.clearBossPhaseTransitionRuntime === 'function') {
        MonsterManager.clearBossPhaseTransitionRuntime(bossMonster, gameState);
    } else {
        gameState.hitboxes = [];
        gameState.projectiles = [];
        gameState.auras = [];
        gameState.effects = [];
        gameState.bossAttackObjects = [];
        gameState.phaseTransition = null;
    }

    bossMonster.id = nextData.id;
    bossMonster.d = nextData;
    bossMonster.scale = parseFloat(nextData.scale) || 1;
    bossMonster.x = keepX;
    bossMonster.y = keepY;
    bossMonster.z = 0;
    bossMonster.faceDir = keepFace;
    bossMonster.active = true;
    bossMonster.state = 'IDLE';
    bossMonster.prevState = 'NONE';
    bossMonster.forcePrevState = null;
    bossMonster.timer = 0;
    bossMonster.deadTimer = 0;
    bossMonster.isDeadProcessed = false;
    bossMonster.hasFired = false;
    bossMonster.kbVx = 0;
    bossMonster.kbVy = 0;
    bossMonster.vz = 0;
    bossMonster.isGrounded = true;
    bossMonster.isStageBoss = true;
    bossMonster.spawnSource = bossMonster.spawnSource || 'BOSS_STAGE';
    bossMonster.maxHp = parseFloat(nextData.maxHp || nextData.hp) || 1;
    bossMonster.hp = bossMonster.maxHp;
    bossMonster.isProvoked = true;
    bossMonster.boss = typeof MonsterManager.createBossRuntimeForMonster === 'function'
        ? MonsterManager.createBossRuntimeForMonster(nextData, gameState)
        : null;

    if (bossMonster.boss) {
        bossMonster.boss.noPatternWaitTimer = Math.max(0.2, parseFloat(bossMonster.boss.phase && bossMonster.boss.phase.No_Pattern_Wait_Time) || 0.2);
        rebuildBossPatternCooldownsForCurrentPhase(bossMonster.boss);
    }

    if (gameState.targetUI) {
        gameState.targetUI.monster = bossMonster;
        gameState.targetUI.timer = 999999;
    }
    gameState.bossBattle = { boss: bossMonster, phase: targetPhase };
    gameState.phaseTransition = null;
    gameState.stageClearPending = false;

    if (gameState.bossDebug) {
        gameState.bossDebug.patternCheck = null;
        gameState.bossDebug.currentAction = null;
        gameState.bossDebug.currentObjectAction = null;
    }

    if (options.resetPosition) {
        resetBossPracticePositions(false);
    }

    if (gameState.bossPractice) {
        gameState.bossPractice.enabled = practiceWasEnabled;
        gameState.bossPractice.lastPatternId = null;
    }

    buildUIButtons();
    renderBossAIPanel(gameState);

    const phaseName = formatKasiyasPublicText(targetPhase.Phase_Name || `Phase ${targetPhase.Phase_ID || ''}`, { phaseStep: true, latePhase: false });
    const noticePrefix = formatKasiyasPublicText(options.noticePrefix || '단계 변경', { phaseStep: true, latePhase: false });
    pushSystemNotice(`${noticePrefix} · ${phaseName}`, options.noticeColor || '#8fd3ff', 1.4);
    return true;
}

function triggerBossPreviousPhaseDebug() {
    const bossMonster = getKasiyasPracticeBoss();
    if (!bossMonster || !bossMonster.boss) {
        pushSystemNotice('이전 단계로 되돌릴 카시야스가 없습니다', '#ffb8b8', 1.2);
        return false;
    }

    if (gameState.phaseTransition && gameState.phaseTransition.active) {
        pushSystemNotice('단계 전환 중에는 이전 단계 복귀를 사용할 수 없습니다', '#ffd27f', 1.1);
        return false;
    }

    const { phases, index } = getCurrentBossPhaseIndex(bossMonster);
    if (index <= 0 || !phases[index - 1]) {
        pushSystemNotice('이미 첫 번째 단계입니다', '#ffd27f', 1.1);
        return false;
    }

    return switchKasiyasBossToPhaseDebug(phases[index - 1], {
        resetPosition: true,
        noticePrefix: 'F11 · 이전 단계 복귀',
        noticeColor: '#8fd3ff'
    });
}

function buildBossPatternCheckSnapshotForCurrentPhase(target) {
    const boss = target && target.boss ? target.boss : null;
    if (!target || !boss) return null;

    const phase = boss.phase || {};
    const patternSetId = String(boss.patternSetId || '').trim();
    const patterns = gameState.DB_BOSS_PATTERN_BY_SET && gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
        ? gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
        : [];
    const player = gameState.player || null;
    const distX = player ? Math.abs((parseFloat(player.x) || 0) - (parseFloat(target.x) || 0)) : 0;
    const distY = player ? Math.abs((parseFloat(player.y) || 0) - (parseFloat(target.y) || 0)) : 0;
    const hpRate = Math.max(0, Math.min(1, (parseFloat(target.hp) || 0) / Math.max(1, parseFloat(target.maxHp) || 1)));
    const checks = [];
    let readyCount = 0;

    for (const pattern of patterns) {
        const patternId = String(pattern.Pattern_ID || '').trim();
        const useRangeX = typeof MonsterManager.getBossPatternUseRangeX === 'function'
            ? MonsterManager.getBossPatternUseRangeX(pattern, phase)
            : (parseFloat(pattern.Pattern_Use_Range_X) || 99999);
        const useRangeY = typeof MonsterManager.getBossPatternUseRangeY === 'function'
            ? MonsterManager.getBossPatternUseRangeY(pattern, phase)
            : (parseFloat(pattern.Pattern_Use_Range_Y) || 99999);
        const cooldown = patternId && boss.patternCooldowns ? Math.max(0, parseFloat(boss.patternCooldowns[patternId]) || 0) : 0;
        let ok = true;
        let reason = 'READY';

        if (!patternId) {
            ok = false;
            reason = 'NO_PATTERN_ID';
        } else if (!Array.isArray(pattern.Runtime_Actions) || pattern.Runtime_Actions.length <= 0) {
            ok = false;
            reason = 'NO_ACTIONS';
        } else if (cooldown > 0) {
            ok = false;
            reason = 'COOLDOWN';
        } else if (distX > useRangeX || distY > useRangeY) {
            ok = false;
            reason = 'RANGE';
        } else if (typeof MonsterManager.isBossPatternConditionMet === 'function' && !MonsterManager.isBossPatternConditionMet(pattern, boss)) {
            ok = false;
            reason = 'CONDITION';
        }

        if (ok) readyCount++;
        checks.push({
            patternId,
            name: typeof MonsterManager.getBossDebugName === 'function' ? MonsterManager.getBossDebugName(pattern) : (pattern.Pattern_Name || patternId),
            ok,
            reason,
            cooldown,
            priority: parseFloat(pattern.Pattern_Priority) || 0,
            weight: Math.max(0, parseFloat(pattern.Random_Weight) || 0),
            condType: String(pattern.Pattern_Cond_Type || '').trim() || 'COOLDOWN_READY',
            useRangeX,
            useRangeY
        });
    }

    return {
        status: gameState.bossPractice && gameState.bossPractice.enabled ? 'PRACTICE' : 'CHECK',
        phaseId: boss.phaseId,
        phaseName: boss.phase && boss.phase.Phase_Name || '',
        patternSetId,
        hpRate,
        isLatePhase: !!boss.isLatePhase,
        distX,
        distY,
        noPatternWaitTimer: boss.noPatternWaitTimer || 0,
        checks,
        readyCount,
        selected: null
    };
}

function getBossPracticePatternList() {
    const bossMonster = getKasiyasPracticeBoss();
    const boss = bossMonster && bossMonster.boss ? bossMonster.boss : null;
    const patternSetId = String(boss && boss.patternSetId || '').trim();
    const phaseName = boss && boss.phase ? formatKasiyasPublicText(String(boss.phase.Phase_Name || '').trim(), { phaseStep: true, latePhase: false }) : '';
    const patterns = patternSetId && gameState.DB_BOSS_PATTERN_BY_SET && gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
        ? [...gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]]
        : [];

    patterns.sort((a, b) => {
        const aid = parseFloat(a.Pattern_ID) || 0;
        const bid = parseFloat(b.Pattern_ID) || 0;
        return aid - bid;
    });

    const counters = { basic: 0, major: 0, other: 0 };
    return patterns.map(pattern => {
        const id = String(pattern.Pattern_ID || '').trim();
        const category = String(pattern.Pattern_Category || '').trim().toUpperCase();
        const group = category === 'MAJOR' ? 'major' : (category === 'BASIC' ? 'basic' : 'other');
        counters[group] = (counters[group] || 0) + 1;
        const prefix = group === 'major' ? '대형' : (group === 'basic' ? '기본' : '기타');
        const name = formatKasiyasPublicText(String(pattern.Pattern_Name || pattern.Dev_Name || id).trim(), { phaseStep: false, latePhase: true });
        const ready = Array.isArray(pattern.Runtime_Actions) && pattern.Runtime_Actions.length > 0;
        return {
            group,
            id,
            label: `${prefix} ${counters[group]} · ${name}`,
            phaseName,
            disabledText: ready ? '' : '미구현'
        };
    });
}

function isBossPracticePatternReady(patternId) {
    const pattern = gameState.DB_BOSS_PATTERN ? gameState.DB_BOSS_PATTERN[String(patternId || '').trim()] : null;
    return !!(pattern && Array.isArray(pattern.Runtime_Actions) && pattern.Runtime_Actions.length > 0);
}

function resetBossPracticeRuntimeState(options = {}) {
    const bossMonster = getKasiyasPracticeBoss();
    if (!bossMonster || !bossMonster.boss) return null;

    const boss = bossMonster.boss;

    gameState.bossAttackObjects = [];
    gameState.hitboxes = [];
    gameState.projectiles = [];
    gameState.auras = [];
    gameState.effects = [];
    gameState.screenHitFlash = null;
    gameState.bossPatternDialogue = null;
    gameState.phaseTransition = null;

    if (gameState.player) {
        gameState.player.kasiyasApostleEnergies = [];
        gameState.player.kasiyasApostleGuardBuffs = [];
        gameState.player.kasiyasApostleEnergyFlashTimer = 0;
        gameState.player.kasiyasApostleEnergyGetLockTimer = 0;
        gameState.player.kasiyasOniMark = null;
        gameState.player.kasiyasTemperedBladeReady = false;
        gameState.player.kasiyasTemperedBladeFlashTimer = 0;
    }

    const debug = MonsterManager.ensureBossDebug(gameState);
    debug.currentAction = null;
    debug.currentObjectAction = null;

    boss.activePattern = null;
    boss.currentActionIndex = -1;
    boss.currentLoopIndex = 0;
    boss.loopCount = 1;
    boss.action = null;
    boss.actionHitFired = false;
    boss.actionHitsDone = 0;
    boss.actionCycleTimer = 0;
    boss.previewDashPath = null;
    boss.currentDashPath = null;
    boss.actionMove = null;
    boss.pattern4Runtime = null;
    boss.majorPattern1Runtime = null;
    boss.majorPattern2Runtime = null;
    boss.majorPattern3Runtime = null;
    boss.p2MajorPattern2Runtime = null;
    boss.kasiyasP2M2Hidden = false;
    boss.kasiyasP1M3RushHidden = false;
    boss.nextDiagonalOwnerCorner = null;
    boss.nextDiagonalCloneCorner = null;
    boss.parryWindowActive = false;
    boss.parryCueTimer = 0;
    boss.groggyTimer = 0;
    boss.groggyPoseType = null;
    boss.groggyMaxTime = 0;
    boss.noPatternWaitTimer = 0;

    bossMonster.state = 'IDLE';
    bossMonster.timer = 0;
    bossMonster.hasFired = false;
    bossMonster.kbVx = 0;
    bossMonster.kbVy = 0;
    bossMonster.active = true;
    if (bossMonster.hp <= 0 && options.reviveBoss !== false) {
        bossMonster.hp = Math.max(1, bossMonster.maxHp || 1);
        bossMonster.isDeadProcessed = false;
        bossMonster.deadTimer = 0;
    }

    if (options.resetPosition) {
        resetBossPracticePositions(false);
    }

    return bossMonster;
}

function resetBossPracticePositions(showNotice = true) {
    const bossMonster = getKasiyasPracticeBoss();
    const stageDepth = gameState.currentStage ? getStageDepth(gameState.currentStage) : gameState.WORLD_DEPTH;
    const centerX = Math.max(220, Math.min(gameState.WORLD_WIDTH - 220, gameState.WORLD_WIDTH * 0.55));
    const centerY = Math.max(60, Math.min(stageDepth - 40, stageDepth * 0.50));

    if (bossMonster) {
        bossMonster.x = centerX;
        bossMonster.y = centerY;
        bossMonster.z = 0;
        bossMonster.vx = 0;
        bossMonster.vy = 0;
        bossMonster.kbVx = 0;
        bossMonster.kbVy = 0;
        bossMonster.faceDir = -1;
        bossMonster.state = 'IDLE';
        bossMonster.timer = 0;
    }

    const p = gameState.player;
    if (p && p.active) {
        p.x = Math.max(80, Math.min(gameState.WORLD_WIDTH - 80, centerX - 360));
        p.y = Math.max(40, Math.min(stageDepth - 30, centerY + 70));
        p.z = 0;
        p.vx = 0;
        p.vy = 0;
        p.vz = 0;
        p.kbVx = 0;
        p.kbVy = 0;
    }

    if (showNotice) pushSystemNotice('연습 모드 위치 초기화', '#7fc6ff', 1.0);
}

function restartBossBattleAfterPracticeMode() {
    const bossMonster = resetBossPracticeRuntimeState({ resetPosition: true, reviveBoss: true });
    gameState.bossPractice.enabled = false;
    gameState.bossPractice.lastPatternId = null;

    if (bossMonster && bossMonster.boss) {
        bossMonster.hp = Math.max(1, bossMonster.maxHp || 1);
        bossMonster.boss.noPatternWaitTimer = Math.max(0.4, parseFloat(bossMonster.boss.phase && bossMonster.boss.phase.No_Pattern_Wait_Time) || 0.2);
        rebuildBossPatternCooldownsForCurrentPhase(bossMonster.boss);
        gameState.bossBattle = { boss: bossMonster, phase: bossMonster.boss.phase };
        if (gameState.targetUI) {
            gameState.targetUI.monster = bossMonster;
            gameState.targetUI.timer = 999999;
        }
    }

    if (gameState.bossDebug) {
        gameState.bossDebug.patternCheck = null;
        gameState.bossDebug.currentAction = null;
        gameState.bossDebug.currentObjectAction = null;
    }

    buildUIButtons();
    pushSystemNotice('🧪 연습 모드 OFF · 현재 단계 전투 재시작', '#ffb8b8', 1.4);
}

function setBossPracticeModeEnabled(enabled) {
    const nextEnabled = !!enabled;
    const wasEnabled = !!gameState.bossPractice.enabled;

    if (!nextEnabled && wasEnabled) {
        restartBossBattleAfterPracticeMode();
        return;
    }

    gameState.bossPractice.enabled = nextEnabled;
    if (gameState.bossPractice.enabled) {
        const bossMonster = resetBossPracticeRuntimeState({ resetPosition: false });
        const phaseName = bossMonster && bossMonster.boss && bossMonster.boss.phase
            ? formatKasiyasPublicText(String(bossMonster.boss.phase.Phase_Name || '').trim(), { phaseStep: true, latePhase: false })
            : '';
        if (gameState.bossDebug) gameState.bossDebug.patternCheck = buildBossPatternCheckSnapshotForCurrentPhase(bossMonster);
        pushSystemNotice(`🧪 카시야스 연습 모드 ON${phaseName ? ' · ' + phaseName : ''}`, '#8ff0b0', 1.4);
    }
    buildUIButtons();
}

function handleBossPracticeKeyInput(e) {
    if (!gameState.bossPractice || !gameState.bossPractice.enabled) return false;

    const digitMatch = String(e.code || '').match(/^(Digit|Numpad)([1-9])$/);
    if (digitMatch) {
        const index = parseInt(digitMatch[2], 10) - 1;
        const runnable = getBossPracticePatternList().filter(item => isBossPracticePatternReady(item.id) && !item.disabledText);
        if (runnable[index]) {
            forceStartBossPracticePattern(runnable[index].id);
            return true;
        }
    }

    if (e.code === 'Escape') {
        stopBossPracticePattern();
        return true;
    }

    return false;
}

function handleBossPracticePanelClick(e) {
    const target = e.target && e.target.closest ? e.target.closest('[data-practice-pattern], [data-practice-control]') : null;
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    const patternId = target.getAttribute('data-practice-pattern');
    if (patternId) {
        forceStartBossPracticePattern(patternId);
        return;
    }

    const control = target.getAttribute('data-practice-control');
    if (control === 'stop') stopBossPracticePattern();
    else if (control === 'reset-position') resetBossPracticeAllPositions();
    else if (control === 'off') setBossPracticeModeEnabled(false);
}

function forceStartBossPracticePattern(patternId) {
    const id = String(patternId || '').trim();
    if (!id) return;

    if (!gameState.bossPractice.enabled) {
        gameState.bossPractice.enabled = true;
    }

    const bossMonster = resetBossPracticeRuntimeState({ resetPosition: false });
    if (!bossMonster) {
        pushSystemNotice('연습 모드: 보스를 찾을 수 없음', '#e74c3c', 1.3);
        buildUIButtons();
        return;
    }

    const pattern = gameState.DB_BOSS_PATTERN ? gameState.DB_BOSS_PATTERN[id] : null;
    const currentSetId = String(bossMonster && bossMonster.boss && bossMonster.boss.patternSetId || '').trim();
    const patternSetId = String(pattern && pattern.Pattern_Set_ID || '').trim();
    if (pattern && currentSetId && patternSetId && currentSetId !== patternSetId) {
        pushSystemNotice('연습 모드: 현재 단계의 패턴이 아닙니다', '#ffd27f', 1.2);
        buildUIButtons();
        return;
    }
    if (!pattern || !Array.isArray(pattern.Runtime_Actions) || pattern.Runtime_Actions.length <= 0) {
        pushSystemNotice('연습 모드: 아직 실행할 수 없는 패턴', '#95a5a6', 1.2);
        buildUIButtons();
        return;
    }

    if (bossMonster.boss && bossMonster.boss.patternCooldowns) {
        bossMonster.boss.patternCooldowns[id] = 0;
    }

    gameState.bossPractice.lastPatternId = id;
    MonsterManager.startBossPattern(bossMonster, pattern, gameState);
    pushSystemNotice(`연습 실행: ${formatKasiyasPublicText(pattern.Pattern_Name || pattern.Dev_Name || id, { phaseStep: false, latePhase: true })}`, '#f4d36a', 1.2);
    buildUIButtons();
}

function stopBossPracticePattern() {
    resetBossPracticeRuntimeState({ resetPosition: false });
    pushSystemNotice('연습 모드: 현재 패턴 중단', '#ffd86b', 1.0);
    buildUIButtons();
}

function resetBossPracticeAllPositions() {
    resetBossPracticeRuntimeState({ resetPosition: true });
    buildUIButtons();
}

function renderBossPracticePanel(container) {
    if (!container) return;

    if (!gameState.bossPractice.enabled) {
        container.innerHTML = '';
        return;
    }

    const list = getBossPracticePatternList();
    const basic = list.filter(item => item.group === 'basic');
    const major = list.filter(item => item.group === 'major');
    const other = list.filter(item => item.group !== 'basic' && item.group !== 'major');
    const bossMonster = getKasiyasPracticeBoss();
    const phaseName = bossMonster && bossMonster.boss && bossMonster.boss.phase
        ? formatKasiyasPublicText(String(bossMonster.boss.phase.Phase_Name || '').trim(), { phaseStep: true, latePhase: false })
        : '';

    const makeButton = (item) => {
        const ready = isBossPracticePatternReady(item.id) && !item.disabledText;
        const label = escapeDebugHtml(item.label || item.id);
        if (!ready) {
            const suffix = item.disabledText ? ` <span style="opacity:0.65;">(${escapeDebugHtml(item.disabledText)})</span>` : ' <span style="opacity:0.65;">(미구현)</span>';
            return `<button type="button" class="practice-btn disabled" disabled>${label}${suffix}</button>`;
        }
        return `<button type="button" class="practice-btn" data-practice-pattern="${escapeDebugHtml(item.id)}">${label}</button>`;
    };

    container.innerHTML = `
        <div class="boss-practice-panel">
            <div class="practice-title">
                <span>🧪 카시야스 연습 모드</span>
                <span class="practice-status">${escapeDebugHtml(phaseName || 'ON')}</span>
            </div>
            <div class="practice-help">
                현재 보스 단계의 패턴만 표시합니다. F10 다음 단계, F11 이전 단계, 숫자키는 구현된 패턴 순서대로 실행합니다.
            </div>
            <div class="practice-group-title">기본 패턴</div>
            <div class="practice-grid">
                ${basic.map(makeButton).join('')}
            </div>
            <div class="practice-group-title">대형 패턴</div>
            <div class="practice-grid">
                ${major.length ? major.map(makeButton).join('') : '<button type="button" class="practice-btn disabled" disabled>대형 패턴 없음</button>'}
            </div>
            ${other.length ? `<div class="practice-group-title">기타 패턴</div><div class="practice-grid">${other.map(makeButton).join('')}</div>` : ''}
            <div class="practice-group-title">제어</div>
            <div class="practice-grid">
                <button type="button" class="practice-btn control" data-practice-control="stop">현재 패턴 중단</button>
                <button type="button" class="practice-btn control" data-practice-control="reset-position">위치 초기화</button>
                <button type="button" class="practice-btn danger" data-practice-control="off">연습 모드 OFF</button>
            </div>
        </div>
    `;
}

document.addEventListener('click', handleBossPracticePanelClick, true);

window.setBossPracticeModeEnabled = setBossPracticeModeEnabled;
window.forceStartBossPracticePattern = forceStartBossPracticePattern;
window.stopBossPracticePattern = stopBossPracticePattern;
window.resetBossPracticeAllPositions = resetBossPracticeAllPositions;

window.toggleAutoSpawn = function() {
    gameState.isAutoSpawn = !gameState.isAutoSpawn;
    let btn = document.getElementById('autoSpawnBtn');
    if (btn) {
        btn.innerText = "자동 스폰: " + (gameState.isAutoSpawn ? 'ON' : 'OFF');
        btn.style.background = gameState.isAutoSpawn ? "#e67e22" : "#7f8c8d";
    }
};

window.toggleGuide = function() {
    let content = document.getElementById('guideContent');
    let btn = document.getElementById('toggleGuideBtn');
    if (content && btn) {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            btn.innerText = '[-] 접기';
        } else {
            content.style.display = 'none';
            btn.innerText = '[+] 펼치기';
        }
    }
};

function escapeDebugHtml(value) {
    return String(value === null || value === undefined ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDebugNumber(value, digits = 1) {
    const n = parseFloat(value);
    if (isNaN(n)) return '0';
    return n.toFixed(digits);
}


function cloneBossDebugValue(value, depth = 0) {
    if (depth > 5) return null;
    if (value === null || value === undefined) return value;
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.slice(0, 50).map(v => cloneBossDebugValue(v, depth + 1));
    if (typeof value === 'object') {
        const out = {};
        for (const key of Object.keys(value)) {
            if (typeof value[key] === 'function') continue;
            out[key] = cloneBossDebugValue(value[key], depth + 1);
        }
        return out;
    }
    return String(value);
}

function getBossDebugExportSnapshot() {
    const debug = gameState.bossDebug || {};
    const target = gameState.targetUI && gameState.targetUI.monster ? gameState.targetUI.monster : null;
    const boss = target && target.boss ? target.boss : null;
    const hpRate = target ? (Math.max(0, parseFloat(target.hp) || 0) / Math.max(1, parseFloat(target.maxHp) || 1)) : 0;

    return {
        exportedAt: new Date().toISOString(),
        gameMode: gameState.gameMode || '',
        boss: target ? {
            name: target.name || target.Character_Name || target.Dev_Name || '',
            hp: parseFloat(target.hp) || 0,
            maxHp: parseFloat(target.maxHp) || 0,
            hpRate: hpRate,
            active: !!target.active,
            phaseId: boss ? boss.phaseId : '',
            patternSetId: boss ? boss.patternSetId : '',
            isLatePhase: boss ? !!boss.isLatePhase : false,
            activePatternId: boss && boss.activePattern ? String(boss.activePattern.Pattern_ID || '') : '',
            activePatternName: boss && boss.activePattern ? (boss.activePattern.Pattern_Name || boss.activePattern.Dev_Name || '') : ''
        } : null,
        patternCheck: cloneBossDebugValue(debug.patternCheck || null),
        currentAction: cloneBossDebugValue(debug.currentAction || null),
        currentObjectAction: cloneBossDebugValue(debug.currentObjectAction || null),
        logs: Array.isArray(debug.exportLogs) && debug.exportLogs.length > 0
            ? cloneBossDebugValue(debug.exportLogs)
            : cloneBossDebugValue(Array.isArray(debug.logs) ? debug.logs.slice().reverse() : [])
    };
}

function makeBossDebugLogFileName(ext) {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `kasiyas_boss_ai_log_${stamp}.${ext}`;
}

function downloadBossDebugText(filename, text, mimeType) {
    const blob = new Blob([text], { type: mimeType || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
    }, 0);
}

function formatBossDebugText(snapshot) {
    const lines = [];
    lines.push('카시야스 보스 AI / 패턴 로그');
    lines.push(`Exported At: ${snapshot.exportedAt}`);
    lines.push('');

    if (snapshot.boss) {
        lines.push('[Boss]');
        lines.push(`Name: ${snapshot.boss.name}`);
        lines.push(`HP: ${snapshot.boss.hp} / ${snapshot.boss.maxHp} (${(snapshot.boss.hpRate * 100).toFixed(1)}%)`);
        lines.push(`Phase: ${snapshot.boss.phaseId} / Pattern Set: ${snapshot.boss.patternSetId} / Late Phase: ${snapshot.boss.isLatePhase ? 'ON' : 'OFF'}`);
        lines.push(`Active Pattern: ${snapshot.boss.activePatternId} ${snapshot.boss.activePatternName}`);
        lines.push('');
    }

    if (snapshot.patternCheck) {
        const pc = snapshot.patternCheck;
        lines.push('[Pattern Check]');
        lines.push(`Status: ${pc.status || ''} / Ready: ${pc.readyCount || 0} / Dist X:${formatDebugNumber(pc.distX, 0)} Y:${formatDebugNumber(pc.distY, 0)}`);
        if (pc.selected) {
            lines.push(`Selected: ${pc.selected.patternId || ''} ${pc.selected.name || ''} / Roll ${formatDebugNumber(pc.selected.roll, 2)} / ${formatDebugNumber(pc.selected.totalWeight, 2)}`);
        }
        if (Array.isArray(pc.checks)) {
            for (const c of pc.checks) {
                lines.push(`- ${c.patternId || '-'} ${c.name || ''}: ${c.ok ? 'READY' : (c.reason || 'OUT')} / cd ${formatDebugNumber(c.cooldown, 2)} / p ${formatDebugNumber(c.priority, 0)} / w ${formatDebugNumber(c.weight, 0)} / range ${formatDebugNumber(c.useRangeX, 0)}x${formatDebugNumber(c.useRangeY, 0)}`);
            }
        }
        lines.push('');
    }

    if (snapshot.currentAction) {
        const a = snapshot.currentAction;
        lines.push('[Current Boss Action]');
        lines.push(`${a.actionId || '-'} ${a.actionName || ''} / ${a.actionType || ''} / order ${a.order || ''}`);
        lines.push(`Hitbox: ${a.hitboxType || 'NONE'} / Hit ${formatDebugNumber(a.hitStart, 2)}-${formatDebugNumber(a.hitEnd, 2)} / Guard ${a.canGuard ? 'YES' : 'NO'}`);
        lines.push('');
    }

    if (snapshot.currentObjectAction) {
        const oa = snapshot.currentObjectAction;
        lines.push('[Current Object Action]');
        lines.push(`${oa.actionId || '-'} ${oa.actionName || ''} / object ${oa.objectId || '-'} / ${oa.actionType || ''}`);
        lines.push(`Hitbox: ${oa.hitboxType || 'NONE'} / Duration ${formatDebugNumber(oa.duration, 2)} / Guard ${oa.canGuard ? 'YES' : 'NO'}`);
        lines.push('');
    }

    lines.push('[Event Logs]');
    const logs = Array.isArray(snapshot.logs) ? snapshot.logs : [];
    if (logs.length <= 0) {
        lines.push('No logs.');
    } else {
        for (const log of logs) {
            const time = log.time || log.absoluteTime || '';
            const type = log.type || 'INFO';
            const detail = log.detail ? ` / ${log.detail}` : '';
            lines.push(`${time} [${type}] ${log.message || ''}${detail}`);
        }
    }

    return lines.join('\n');
}

function exportBossDebugLog(format = 'txt') {
    const snapshot = getBossDebugExportSnapshot();
    const fmt = String(format || 'txt').toLowerCase();

    if (fmt === 'json') {
        downloadBossDebugText(
            makeBossDebugLogFileName('json'),
            JSON.stringify(snapshot, null, 2),
            'application/json;charset=utf-8'
        );
        return;
    }

    downloadBossDebugText(
        makeBossDebugLogFileName('txt'),
        formatBossDebugText(snapshot),
        'text/plain;charset=utf-8'
    );
}

function clearBossDebugLog() {
    if (!gameState.bossDebug) return;
    gameState.bossDebug.logs = [];
    gameState.bossDebug.exportLogs = [];
    gameState.bossDebug.patternCheck = null;
    gameState.bossDebug.currentAction = null;
    gameState.bossDebug.currentObjectAction = null;
    renderBossAIPanel(gameState);
    renderBossPatternLogPanel(gameState);
}

function renderBossAIPanel(gameState) {
    const panel = document.getElementById('bossAIPanel');
    if (!panel) return;

    const debug = gameState.bossDebug || {};
    const target = gameState.targetUI && gameState.targetUI.monster ? gameState.targetUI.monster : null;
    const boss = target && target.boss ? target.boss : null;
    let patternCheck = debug.patternCheck || null;
    const livePatternCheck = buildBossPatternCheckSnapshotForCurrentPhase(target);
    const patternCheckMismatch = patternCheck && boss && (
        String(patternCheck.phaseId || '').trim() !== String(boss.phaseId || '').trim() ||
        String(patternCheck.patternSetId || '').trim() !== String(boss.patternSetId || '').trim()
    );
    if (!patternCheck || patternCheckMismatch || (boss && gameState.bossPractice && gameState.bossPractice.enabled && !boss.activePattern)) {
        patternCheck = livePatternCheck || patternCheck;
        if (patternCheck && gameState.bossDebug) gameState.bossDebug.patternCheck = patternCheck;
    }
    const action = debug.currentAction || null;
    const objectAction = debug.currentObjectAction || null;
    const logs = Array.isArray(debug.logs) ? debug.logs : [];

    if (!target || !target.active || !boss) {
        panel.innerHTML = `
            <div class="boss-ai-title">보스 AI 상태</div>
            <div class="boss-ai-empty">보스 런타임 대기 중...</div>
        `;
        return;
    }

    const hpRate = Math.max(0, Math.min(1, (parseFloat(target.hp) || 0) / Math.max(1, parseFloat(target.maxHp) || 1)));
    const currentPattern = boss.activePattern
        ? `${String(boss.activePattern.Pattern_ID || '').trim()} ${boss.activePattern.Pattern_Name || boss.activePattern.Dev_Name || ''}`
        : 'none';

    let html = `
        <div class="boss-ai-title">보스 AI 상태</div>
        <div class="boss-ai-section">
            <div><span class="boss-ai-key">Set</span> ${escapeDebugHtml(boss.patternSetId || '-')} / <span class="boss-ai-key">Phase</span> ${escapeDebugHtml(boss.phaseId || '-')}</div>
            <div><span class="boss-ai-key">HP</span> ${(hpRate * 100).toFixed(1)}% / <span class="boss-ai-key">Late</span> ${boss.isLatePhase ? 'ON' : 'OFF'}</div>
            <div><span class="boss-ai-key">Pattern</span> ${escapeDebugHtml(currentPattern)}</div>
        </div>
    `;

    if (patternCheck) {
        const statusText = patternCheck.status === 'WAIT'
            ? `wait ${formatDebugNumber(patternCheck.noPatternWaitTimer, 2)}s`
            : (patternCheck.status === 'PRACTICE' ? `practice · ${patternCheck.readyCount || 0} ready` : `${patternCheck.readyCount || 0} ready`);

        html += `
            <div class="boss-ai-subtitle">패턴 후보 검사</div>
            <div class="boss-ai-section">
                <div><span class="boss-ai-key">Status</span> ${escapeDebugHtml(statusText)}</div>
                <div><span class="boss-ai-key">Dist</span> X ${formatDebugNumber(patternCheck.distX, 0)} / Y ${formatDebugNumber(patternCheck.distY, 0)}</div>
            </div>
        `;

        const checks = Array.isArray(patternCheck.checks) ? patternCheck.checks.slice(0, 7) : [];
        for (const check of checks) {
            const stateClass = check.ok ? 'ready' : 'out';
            const reason = check.ok ? 'READY' : (check.reason || 'OUT');
            html += `
                <div class="boss-ai-candidate ${stateClass}">
                    <div><b>${escapeDebugHtml(check.patternId || '-')}</b> ${escapeDebugHtml(check.name || '')}</div>
                    <div class="boss-ai-small">
                        ${escapeDebugHtml(reason)}
                        / cd ${formatDebugNumber(check.cooldown, 1)}
                        / p ${formatDebugNumber(check.priority, 0)}
                        / w ${formatDebugNumber(check.weight, 0)}
                    </div>
                </div>
            `;
        }

        if (patternCheck.selected) {
            html += `
                <div class="boss-ai-selected">
                    선택됨: <b>${escapeDebugHtml(patternCheck.selected.patternId)}</b>
                    ${escapeDebugHtml(patternCheck.selected.name || '')}
                    <div class="boss-ai-small">roll ${formatDebugNumber(patternCheck.selected.roll, 1)} / ${formatDebugNumber(patternCheck.selected.totalWeight, 1)}</div>
                </div>
            `;
        }
    }

    if (action) {
        html += `
            <div class="boss-ai-subtitle">현재 액션</div>
            <div class="boss-ai-action">
                <div><b>${escapeDebugHtml(action.actionId || '-')}</b> ${escapeDebugHtml(action.actionName || '')}</div>
                <div class="boss-ai-small">loop ${action.loopIndex}/${action.loopCount} / order ${action.order} / ${escapeDebugHtml(action.actionType)}</div>
                <div class="boss-ai-small">move ${escapeDebugHtml(action.moveType)} / hitbox ${escapeDebugHtml(action.hitboxType)}</div>
                <div class="boss-ai-small">hit ${formatDebugNumber(action.hitStart, 2)}-${formatDebugNumber(action.hitEnd, 2)} / guard ${action.canGuard ? 'YES' : 'NO'}</div>
            </div>
        `;
    }

    if (objectAction) {
        html += `
            <div class="boss-ai-subtitle">오브젝트 액션</div>
            <div class="boss-ai-action">
                <div><b>${escapeDebugHtml(objectAction.actionId || '-')}</b> ${escapeDebugHtml(objectAction.actionName || '')}</div>
                <div class="boss-ai-small">object ${escapeDebugHtml(objectAction.objectId || '-')} / order ${objectAction.order} / ${escapeDebugHtml(objectAction.actionType || '')}</div>
                <div class="boss-ai-small">hitbox ${escapeDebugHtml(objectAction.hitboxType || 'NONE')} / hit ${formatDebugNumber(objectAction.hitStart, 2)}-${formatDebugNumber(objectAction.hitEnd, 2)}</div>
                <div class="boss-ai-small">guard ${objectAction.canGuard ? 'YES' : 'NO'} / duration ${formatDebugNumber(objectAction.duration, 2)}s</div>
            </div>
        `;
    }

    html += `<div class="boss-ai-subtitle">최근 로그</div>`;
    if (logs.length <= 0) {
        html += `<div class="boss-ai-empty">아직 보스 이벤트가 없습니다.</div>`;
    } else {
        for (const log of logs.slice(0, 7)) {
            html += `
                <div class="boss-ai-log">
                    <span class="boss-ai-log-type">${escapeDebugHtml(log.type || 'INFO')}</span>
                    ${escapeDebugHtml(log.message || '')}
                    ${log.detail ? `<div class="boss-ai-small">${escapeDebugHtml(log.detail)}</div>` : ''}
                </div>
            `;
        }
    }

    panel.innerHTML = html;
}


function renderBossPatternLogPanel(gameState) {
    const panel = document.getElementById('bossPatternLogPanel');
    if (!panel) return;

    const debug = gameState.bossDebug || {};
    const allLogs = Array.isArray(debug.logs) ? debug.logs : [];

    const typeMap = {
        SELECT: '선택',
        ACTION: '액션',
        HIT: '판정',
        OBJECT: '오브젝트',
        OBJECT_ACTION: '오브젝트 액션',
        OBJECT_HIT: '오브젝트 판정',
        OBJECT_SKIP: '오브젝트 스킵',
        OBJECT_END: '오브젝트 종료',
        SKIP: '스킵',
        END: '종료',
        INFO: '정보'
    };

    if (allLogs.length <= 0) {
        panel.innerHTML = `<div class="boss-pattern-log-item">보스 패턴 로그 대기 중...</div>`;
        return;
    }

    // 최신 SELECT 이후의 이벤트만 표시한다.
    // 즉, 새 패턴이 선택되면 이전 패턴 로그는 좌측 패널에서 자동으로 사라진다.
    const selectIndex = allLogs.findIndex(log => String(log.type || '').trim().toUpperCase() === 'SELECT');
    const currentLogs = selectIndex >= 0 ? allLogs.slice(0, selectIndex + 1) : allLogs.slice(0, 8);

    panel.innerHTML = currentLogs.slice(0, 9).map(log => {
        const rawType = String(log.type || 'INFO').trim().toUpperCase();
        const type = typeMap[rawType] || rawType;
        const time = escapeDebugHtml(log.time || '');
        const message = escapeDebugHtml(log.message || '');
        const detail = log.detail ? `<div class="boss-pattern-log-detail">${escapeDebugHtml(log.detail)}</div>` : '';

        return `
            <div class="boss-pattern-log-item">
                <span class="boss-pattern-log-type">${type}</span>
                <span class="boss-pattern-log-time">${time}</span>
                <div>${message}</div>
                ${detail}
            </div>
        `;
    }).join('');
}

function updateHUD() {
    let p = gameState.player;
    if (!p || !p.active) return;

    try {
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const getEl = (id) => document.getElementById(id);

        const hudPlayerName = getEl('hudPlayerName');
        const hudHpFill = getEl('hudHpFill');
        const hudHpText = getEl('hudHpText');
        const hudSpiritFill = getEl('hudSpiritFill');
        const hudSpiritText = getEl('hudSpiritText');
        const hudSpiritOrb = getEl('hudSpiritOrb');
        const hudSpiritTooltip = getEl('hudSpiritTooltip');
        const hudExpFill = getEl('hudExpFill');
        const hudExpText = getEl('hudExpText');

        if (hudPlayerName) {
            hudPlayerName.innerText = `Lv.${p.level} ${p.name}`;
        }

        const meleeChip = document.querySelector('.hud-mode-chip.melee');
        const rangeChip = document.querySelector('.hud-mode-chip.range');
        const isMeleeMode = p.stance === 'Mode_Melee';
        const isRangeMode = p.stance === 'Mode_Range';

        if (meleeChip) {
            meleeChip.innerText = '근접 모드';
            meleeChip.style.opacity = isMeleeMode ? '1' : '0.42';
            meleeChip.style.transform = isMeleeMode ? 'translateY(-1px) scale(1.03)' : 'scale(1)';
            meleeChip.style.borderColor = isMeleeMode ? 'rgba(255,170,150,0.70)' : 'rgba(255,255,255,0.10)';
            meleeChip.style.boxShadow = isMeleeMode
                ? '0 0 14px rgba(192,57,43,0.22), inset 0 0 8px rgba(255,255,255,0.05)'
                : 'inset 0 0 8px rgba(255,255,255,0.03)';
            meleeChip.style.filter = isMeleeMode ? 'none' : 'saturate(0.7)';
        }

        if (rangeChip) {
            rangeChip.innerText = '원거리 모드';
            rangeChip.style.opacity = isRangeMode ? '1' : '0.42';
            rangeChip.style.transform = isRangeMode ? 'translateY(-1px) scale(1.03)' : 'scale(1)';
            rangeChip.style.borderColor = isRangeMode ? 'rgba(150,220,255,0.72)' : 'rgba(255,255,255,0.10)';
            rangeChip.style.boxShadow = isRangeMode
                ? '0 0 14px rgba(52,152,219,0.22), inset 0 0 8px rgba(255,255,255,0.05)'
                : 'inset 0 0 8px rgba(255,255,255,0.03)';
            rangeChip.style.filter = isRangeMode ? 'none' : 'saturate(0.7)';
        }

        const safeMaxHp = Math.max(1, parseFloat(p.maxHp) || 1);
        const safeHp = clamp(parseFloat(p.hp) || 0, 0, safeMaxHp);
        const hpRatio = clamp((safeHp / safeMaxHp) * 100, 0, 100);

        if (hudHpFill) {
            hudHpFill.style.width = '100%';
            hudHpFill.style.height = hpRatio + '%';
            hudHpFill.style.left = '0';
            hudHpFill.style.bottom = '0';
            hudHpFill.style.top = 'auto';
            hudHpFill.style.transition = 'height 0.12s ease-out';
        }

        if (hudHpText) {
            hudHpText.innerText = `${safeHp.toFixed(0)} / ${safeMaxHp.toFixed(0)}\n${hpRatio.toFixed(1)}%`;
        }
        const hudHpOrb = hudHpFill ? hudHpFill.closest('.hud-orb.hp') : document.querySelector('.hud-orb.hp');
        if (hudHpOrb) {
            const oniCurseActive = !!(p.p3OniCurse && p.p3OniCurse.active !== false);
            const oniCurseFlash = oniCurseActive && (parseFloat(p.p3OniCurseHpFlashTimer) || 0) > 0;
            hudHpOrb.classList.toggle('oni-curse-corrupted', oniCurseActive);
            hudHpOrb.classList.toggle('oni-curse-flash', oniCurseFlash);
        }

        const maxSpirit = Math.max(1, parseFloat(p.maxFightingSpirit) || 100);
        const safeSpirit = clamp(parseFloat(p.fightingSpirit) || 0, 0, maxSpirit);
        const spiritRatio = clamp((safeSpirit / maxSpirit) * 100, 0, 100);
        if (hudSpiritFill) {
            hudSpiritFill.style.width = '100%';
            hudSpiritFill.style.height = spiritRatio + '%';
            hudSpiritFill.style.left = '0';
            hudSpiritFill.style.bottom = '0';
            hudSpiritFill.style.top = 'auto';
            hudSpiritFill.style.transition = 'height 0.12s ease-out';
        }
        if (hudSpiritText) {
            hudSpiritText.innerText = `${safeSpirit.toFixed(0)} / ${maxSpirit.toFixed(0)}\n${spiritRatio.toFixed(1)}%`;
        }
        if (hudSpiritTooltip) {
            const dmgRate = Math.max(0, parseFloat(p.fightingSpiritDmgBuffRate) || 0);
            const moveRate = Math.max(0, parseFloat(p.fightingSpiritMoveSpeedBuffRate) || 0);
            const totalDmg = safeSpirit * dmgRate;
            const totalMove = safeSpirit * moveRate;
            const atkGain = Math.max(0, parseFloat(p.atkGetFightingSpirit) || 0);
            const atkGainCooldown = Math.max(0, parseFloat(p.atkGetFightingSpiritCooldown) || 0);
            const hitLose = Math.max(0, parseFloat(p.hitLoseFightingSpirit) || 0);
            const hitLoseCooldown = Math.max(0, parseFloat(p.hitLoseFightingSpiritCooldown) || 0);
            const tooltipHtml = `<b>투기 게이지</b><br><span class="muted">현재 ${safeSpirit.toFixed(0)} / ${maxSpirit.toFixed(0)}</span><br>투기 1당 공격력 <b>${dmgRate.toFixed(2)}%</b> 상승<br>투기 1당 이동속도 <b>${moveRate.toFixed(2)}%</b> 상승<br><span class="muted">현재 보너스: 공격력 +${totalDmg.toFixed(2)}%, 이동속도 +${totalMove.toFixed(2)}%</span><br><br>공격 적중 시 투기 <b>${atkGain.toFixed(0)}</b> 획득<br><span class="muted">획득 쿨타임 ${atkGainCooldown.toFixed(1)}초</span><br>피격 시 투기 <b>${hitLose.toFixed(0)}</b> 감소<br><span class="muted">감소 쿨타임 ${hitLoseCooldown.toFixed(1)}초</span>`;
            hudSpiritTooltip.innerHTML = tooltipHtml;
            if (hudSpiritOrb) {
                hudSpiritOrb.title = `투기 게이지\n현재 ${safeSpirit.toFixed(0)} / ${maxSpirit.toFixed(0)}\n투기 1당 공격력 ${dmgRate.toFixed(2)}% 상승\n투기 1당 이동속도 ${moveRate.toFixed(2)}% 상승\n공격 적중 시 투기 ${atkGain.toFixed(0)} 획득 / ${atkGainCooldown.toFixed(1)}초 쿨타임\n피격 시 투기 ${hitLose.toFixed(0)} 감소 / ${hitLoseCooldown.toFixed(1)}초 쿨타임`;
            }
        }

        let reqExp = (parseFloat(p.level) || 1) * (parseFloat(p.baseNextExp) || 100);
        if (reqExp <= 0 || isNaN(reqExp)) reqExp = 100;

        const safeExp = Math.max(0, parseFloat(p.exp) || 0);
        const expRatio = clamp((safeExp / reqExp) * 100, 0, 100);

        if (hudExpFill) {
            hudExpFill.style.width = expRatio + '%';
            hudExpFill.style.height = '100%';
        }

        if (hudExpText) {
            hudExpText.innerText = `${safeExp.toFixed(0)} / ${reqExp.toFixed(0)} (${expRatio.toFixed(1)}%)`;
        }

        const setLockAndMask = (lockId, maskId, isUnlocked, ratio) => {
            const lockEl = getEl(lockId);
            const maskEl = getEl(maskId);

            if (lockEl) lockEl.style.display = isUnlocked ? 'none' : 'flex';
            if (maskEl) maskEl.style.height = clamp(ratio, 0, 100) + '%';
        };

        const setCombatMeter = (rootId, fillId, textId, ratio, text, state = 'ready') => {
            const rootEl = getEl(rootId);
            const fillEl = getEl(fillId);
            const textEl = getEl(textId);
            const safeRatio = clamp(ratio, 0, 100);

            if (rootEl) {
                rootEl.classList.remove('ready', 'empty', 'active', 'recover', 'cooldown');
                if (state) rootEl.classList.add(state);
                if (safeRatio <= 0.01) rootEl.classList.add('empty');
            }
            if (fillEl) fillEl.style.width = safeRatio + '%';
            if (textEl) textEl.innerText = text;
        };

        const p2m3Rt = (gameState.specialMode === 'P2_M3_DIMENSION_DEFENSE' && gameState.p2m3DefenseRuntime && gameState.p2m3DefenseRuntime.active)
            ? gameState.p2m3DefenseRuntime
            : null;

        if (p2m3Rt && p2m3Rt.player && p2m3Rt.phase !== 'INTRO') {
            const dp = p2m3Rt.player;
            const waveNow = Math.min(((p2m3Rt.waveIndex || 0) + 1), Math.max(1, (p2m3Rt.waves || []).length || 1));
            const waveTotal = Math.max(1, (p2m3Rt.waves || []).length || 1);
            const spiritLabel = document.querySelector('.spirit-panel .hud-orb-label');
            const skillTitleEl = document.querySelector('.hud-skill-title');
            const skillSlots = Array.from(document.querySelectorAll('#hudSkills .skill-slot'));
            if (hudPlayerName) hudPlayerName.innerText = dp.hasTemperedWill ? `차원 방어전  연단된 칼날` : `차원 방어전  Wave ${waveNow}/${waveTotal}`;
            if (spiritLabel) spiritLabel.innerText = '가드';
            if (skillTitleEl) skillTitleEl.innerText = dp.hasTemperedWill ? '패턴 조작 · 연단 준비' : '패턴 조작';

            const dpMaxHp = Math.max(1, parseFloat(dp.maxHp) || 1);
            const dpHp = clamp(parseFloat(dp.hp) || 0, 0, dpMaxHp);
            const dpHpRatio = clamp((dpHp / dpMaxHp) * 100, 0, 100);
            if (hudHpFill) {
                hudHpFill.style.width = '100%';
                hudHpFill.style.height = dpHpRatio + '%';
                hudHpFill.style.left = '0';
                hudHpFill.style.bottom = '0';
                hudHpFill.style.top = 'auto';
                hudHpFill.style.transition = 'height 0.12s ease-out';
            }
            if (hudHpText) hudHpText.innerText = `${Math.ceil(dpHp)} / ${Math.ceil(dpMaxHp)}\n${dpHpRatio.toFixed(1)}%`;

            const dpMaxGuard = Math.max(1, parseFloat(dp.guardGaugeMax) || 100);
            const dpGuard = clamp(parseFloat(dp.guardGauge) || 0, 0, dpMaxGuard);
            const dpGuardRatio = clamp((dpGuard / dpMaxGuard) * 100, 0, 100);
            if (hudSpiritFill) {
                hudSpiritFill.style.width = '100%';
                hudSpiritFill.style.height = dpGuardRatio + '%';
                hudSpiritFill.style.left = '0';
                hudSpiritFill.style.bottom = '0';
                hudSpiritFill.style.top = 'auto';
                hudSpiritFill.style.transition = 'height 0.12s ease-out';
            }
            if (hudSpiritText) hudSpiritText.innerText = `${Math.floor(dpGuard)} / ${Math.floor(dpMaxGuard)}\n${dpGuardRatio.toFixed(1)}%`;
            if (hudSpiritTooltip) {
                hudSpiritTooltip.innerHTML = `<b>가드 게이지</b><br><span class="muted">현재 ${Math.floor(dpGuard)} / ${Math.floor(dpMaxGuard)}</span><br>가드 유지 시 소모되며, 시간에 따라 회복됩니다.<br><span class="muted">가드 준비 상태와 웨이브 스킬은 하단 슬롯 안내를 참고하세요.</span>`;
            }
            if (hudSpiritOrb) hudSpiritOrb.title = `가드 게이지\n현재 ${Math.floor(dpGuard)} / ${Math.floor(dpMaxGuard)}\n가드 유지 시 소모되며 시간에 따라 회복됩니다.`;

            if (meleeChip) {
                meleeChip.innerText = '차원 방어전';
                meleeChip.style.opacity = '1';
                meleeChip.style.transform = 'translateY(-1px) scale(1.03)';
                meleeChip.style.borderColor = 'rgba(150,220,255,0.72)';
                meleeChip.style.boxShadow = '0 0 14px rgba(52,152,219,0.22), inset 0 0 8px rgba(255,255,255,0.05)';
                meleeChip.style.filter = 'none';
            }
            if (rangeChip) {
                rangeChip.innerText = dp.hasTemperedWill ? '연단된 칼날의 의지' : `Wave ${waveNow}/${waveTotal}`;
                rangeChip.style.opacity = '1';
                rangeChip.style.transform = 'translateY(-1px) scale(1.03)';
                rangeChip.style.borderColor = dp.hasTemperedWill ? 'rgba(255,220,110,0.72)' : 'rgba(180,160,255,0.62)';
                rangeChip.style.boxShadow = dp.hasTemperedWill
                    ? '0 0 14px rgba(255,214,90,0.18), inset 0 0 8px rgba(255,255,255,0.05)'
                    : '0 0 14px rgba(150,120,255,0.16), inset 0 0 8px rgba(255,255,255,0.05)';
                rangeChip.style.filter = 'none';
            }

            setCombatMeter('combatMeterGuard', 'combatMeterGuardFill', 'combatMeterGuardText', 100, dp.hasTemperedWill ? '⚔ 연단 공격  X' : '⚔ 공격  X', dp.attackFlashTimer > 0 ? 'active' : 'ready');
            setCombatMeter('combatMeterSwap', 'combatMeterSwapFill', 'combatMeterSwapText', dp.grounded ? 100 : 55, `⤴ 점프  C / Space / ↑`, dp.grounded ? 'ready' : 'active');
            const waveCooldown = Math.max(0, parseFloat(dp.skillCooldown) || 0);
            if (waveCooldown > 0) {
                const maxWaveCd = Math.max(0.01, parseFloat(dp.skillCooldownMax) || waveCooldown || 1);
                const progress = (1 - waveCooldown / maxWaveCd) * 100;
                setCombatMeter('combatMeterCombo', 'combatMeterComboFill', 'combatMeterComboText', progress, `🌊 웨이브 ${waveCooldown.toFixed(1)}s`, 'cooldown');
            } else {
                setCombatMeter('combatMeterCombo', 'combatMeterComboFill', 'combatMeterComboText', 100, '🌊 웨이브  A', 'ready');
            }

            const specialKeys = ['X', 'C', 'D', 'A'];
            skillSlots.forEach((slot, index) => {
                if (!slot) return;
                if (index >= 4) {
                    slot.style.display = 'none';
                    return;
                }
                slot.style.display = '';
                const keyEl = slot.querySelector('.skill-key');
                const lockEl = slot.querySelector('.skill-lock');
                const maskEl = slot.querySelector('.skill-cd-mask');
                if (keyEl) keyEl.innerText = specialKeys[index] || '';
                if (lockEl) lockEl.style.display = 'none';
                if (maskEl) {
                    if (index === 3 && waveCooldown > 0) {
                        const maxWaveCd = Math.max(0.01, parseFloat(dp.skillCooldownMax) || waveCooldown || 1);
                        maskEl.style.height = clamp((waveCooldown / maxWaveCd) * 100, 0, 100) + '%';
                    } else {
                        maskEl.style.height = '0%';
                    }
                }
            });

            const bossGroggyGauge = getEl('bossGroggyGauge');
            const bossCastGauge = getEl('bossCastGauge');
            const bossGroggyGaugeFill = getEl('bossGroggyGaugeFill');
            const bossCastGaugeFill = getEl('bossCastGaugeFill');
            if (bossGroggyGauge) bossGroggyGauge.classList.add('hidden');
            if (bossCastGauge) bossCastGauge.classList.add('hidden');
            if (bossGroggyGaugeFill) bossGroggyGaugeFill.style.width = '0%';
            if (bossCastGaugeFill) bossCastGaugeFill.style.width = '0%';
            return;
        }

        // 특수 모드가 아닐 때는 기존 HUD 텍스트/슬롯 구성을 원래대로 복구한다.
        const spiritLabel = document.querySelector('.spirit-panel .hud-orb-label');
        const skillTitleEl = document.querySelector('.hud-skill-title');
        const skillSlots = Array.from(document.querySelectorAll('#hudSkills .skill-slot'));
        if (spiritLabel) spiritLabel.innerText = '투기';
        if (skillTitleEl) skillTitleEl.innerText = '스킬 슬롯';
        ['F','Z','D','A','S'].forEach((key, index) => {
            const slot = skillSlots[index];
            if (!slot) return;
            slot.style.display = '';
            const keyEl = slot.querySelector('.skill-key');
            const lockEl = slot.querySelector('.skill-lock');
            if (keyEl) keyEl.innerText = key;
            if (lockEl) lockEl.style.display = '';
        });

        let swapAct = gameState.actions.find(a => a.Action_Name === '공격 모드 변경');
        let swapReq = swapAct ? (parseFloat(swapAct.Require_Level) || 0) : 0;
        let swapRatio = (swapAct && p.skillCooldowns[swapAct.Action_Name] > 0)
            ? (p.skillCooldowns[swapAct.Action_Name] / (parseFloat(swapAct.Cooltime) || 1)) * 100
            : 0;
        setLockAndMask('lockSwap', 'maskSwap', p.level >= swapReq, swapRatio);

        let dashAct = gameState.actions.find(a => String(a.Action_Name || '').trim() === '대쉬');
        let dashReq = dashAct ? (parseFloat(dashAct.Require_Level) || 0) : 0;
        let dashRatio = Math.max(0, (p.dashCooldownTimer || 0) / (p.maxDashCd || 1)) * 100;
        setLockAndMask('lockDash', 'maskDash', p.level >= dashReq, dashRatio);

        let guardAct = gameState.actions.find(a => String(a.Action_Type || '').trim() === 'ACT_GUARD' || String(a.Action_Name || '').trim() === '가드');
        let guardReq = guardAct ? (parseFloat(guardAct.Require_Level) || 0) : 0;
        let guardRatio = Math.max(0, (p.guardCooldownTimer || 0) / (p.maxGuardCooldown || (parseFloat(guardAct && guardAct.Cooltime) || 1))) * 100;
        setLockAndMask('lockGuard', 'maskGuard', p.level >= guardReq, guardRatio);

        if (p.state === 'Guard' && p.maxGuardTimer > 0) {
            const remain = Math.max(0, p.guardTimer || 0);
            setCombatMeter(
                'combatMeterGuard',
                'combatMeterGuardFill',
                'combatMeterGuardText',
                (remain / Math.max(0.01, p.maxGuardTimer)) * 100,
                `🛡 가드 ${remain.toFixed(1)}`,
                'active'
            );
        } else if ((p.guardCooldownTimer || 0) > 0 && (p.maxGuardCooldown || 0) > 0) {
            const remain = Math.max(0, p.guardCooldownTimer || 0);
            const progress = (1 - remain / Math.max(0.01, p.maxGuardCooldown || 1)) * 100;
            setCombatMeter(
                'combatMeterGuard',
                'combatMeterGuardFill',
                'combatMeterGuardText',
                progress,
                `🛡 회복 ${remain.toFixed(1)}`,
                'recover'
            );
        } else {
            setCombatMeter('combatMeterGuard', 'combatMeterGuardFill', 'combatMeterGuardText', 100, '🛡 가드 준비', 'ready');
        }

        if ((p.stanceSwapTimer || 0) > 0 && (p.maxStanceSwap || 0) > 0) {
            const remain = Math.max(0, p.stanceSwapTimer || 0);
            const progress = (1 - remain / Math.max(0.01, p.maxStanceSwap || 1)) * 100;
            setCombatMeter(
                'combatMeterSwap',
                'combatMeterSwapFill',
                'combatMeterSwapText',
                progress,
                `🔄 전환 ${remain.toFixed(1)}`,
                'cooldown'
            );
        } else {
            setCombatMeter('combatMeterSwap', 'combatMeterSwapFill', 'combatMeterSwapText', 100, '🔄 전환 준비', 'ready');
        }

        if ((p.rapidAtkCooldownTimer || 0) > 0 && (p.maxRapidAtkCd || 0) > 0) {
            const remain = Math.max(0, p.rapidAtkCooldownTimer || 0);
            const progress = (1 - remain / Math.max(0.01, p.maxRapidAtkCd || 1)) * 100;
            setCombatMeter(
                'combatMeterCombo',
                'combatMeterComboFill',
                'combatMeterComboText',
                progress,
                `⚔ 연격 ${remain.toFixed(1)}`,
                'cooldown'
            );
        } else {
            setCombatMeter('combatMeterCombo', 'combatMeterComboFill', 'combatMeterComboText', 100, '⚔ 연격 준비', 'ready');
        }


        const bossGroggyGauge = getEl('bossGroggyGauge');
        const bossGroggyGaugeFill = getEl('bossGroggyGaugeFill');
        const bossGroggyGaugeText = getEl('bossGroggyGaugeText');
        const activeBossForGroggy = (gameState.monsters || []).find(m => m && m.active && m.boss && (parseFloat(m.boss.groggyTimer) || 0) > 0);
        if (activeBossForGroggy && activeBossForGroggy.boss) {
            const groggyTimer = Math.max(0, parseFloat(activeBossForGroggy.boss.groggyTimer) || 0);
            const groggyMax = Math.max(0.01, parseFloat(activeBossForGroggy.boss.groggyMaxTime) || groggyTimer || 1);
            const groggyRatio = clamp((groggyTimer / groggyMax) * 100, 0, 100);
            if (bossGroggyGauge) bossGroggyGauge.classList.remove('hidden');
            if (bossGroggyGaugeFill) bossGroggyGaugeFill.style.width = groggyRatio + '%';
            if (bossGroggyGaugeText) bossGroggyGaugeText.innerText = `카시야스 그로기 ${groggyTimer.toFixed(1)}s`;
        } else {
            if (bossGroggyGauge) bossGroggyGauge.classList.add('hidden');
            if (bossGroggyGaugeFill) bossGroggyGaugeFill.style.width = '0%';
        }

        const bossCastGauge = getEl('bossCastGauge');
        const bossCastGaugeFill = getEl('bossCastGaugeFill');
        const bossCastGaugeText = getEl('bossCastGaugeText');
        const activeBossForCast = (gameState.monsters || []).find(m => m && m.active && (m.hp || 0) > 0 && m.state !== 'DEAD' && m.state !== 'DIE' && m.boss && m.boss.action);
        let showBossCastGauge = false;
        if (activeBossForCast && activeBossForCast.boss && activeBossForCast.boss.action) {
            const castAction = activeBossForCast.boss.action;
            const bossForCast = activeBossForCast.boss;
            const pose = String(castAction.Action_Pose_Type || '').trim().toUpperCase();
            const effect = String(castAction.VFX_Type || castAction.Effect_Render_Type || '').trim().toUpperCase();
            const actionName = String(castAction.Action_Name || '').trim();
            const actionType = String(castAction.Action_Type || '').trim().toUpperCase();
            const actionsForCast = Array.isArray(bossForCast.runtimeActions) && bossForCast.runtimeActions.length ? bossForCast.runtimeActions : ((bossForCast.activePattern && Array.isArray(bossForCast.activePattern.Runtime_Actions)) ? bossForCast.activePattern.Runtime_Actions : []);
            const currentActionIndex = parseInt(bossForCast.currentActionIndex, 10);
            const getActionDurationForGauge = (act, fallback = 1) => {
                let duration = parseFloat(act && act.Action_Anim_Duration);
                try {
                    if (typeof MonsterManager !== 'undefined' && MonsterManager.getBossActionDuration) {
                        const d = MonsterManager.getBossActionDuration(activeBossForCast, act, gameState);
                        if (isFinite(d) && d > 0) duration = d;
                    }
                } catch (e) {}
                return (!isNaN(duration) && duration > 0) ? duration : fallback;
            };
            const getHitStartForGauge = (act, fallback = 0) => {
                let hitStart = parseFloat(act && act.Hitbox_Start_Time);
                try {
                    if (typeof MonsterManager !== 'undefined' && MonsterManager.getBossActionHitWindow) {
                        const hw = MonsterManager.getBossActionHitWindow(activeBossForCast, act);
                        if (hw && isFinite(hw.start) && hw.start >= 0) hitStart = hw.start;
                    }
                } catch (e) {}
                return (!isNaN(hitStart) && hitStart >= 0) ? hitStart : fallback;
            };
            const applyBossCastGauge = (ratio, remain, activeText, triggerText) => {
                const safeRatio = clamp(ratio, 0, 100);
                showBossCastGauge = true;
                if (bossCastGauge) {
                    bossCastGauge.classList.remove('hidden');
                    bossCastGauge.classList.toggle('danger', safeRatio >= 96);
                }
                if (bossCastGaugeFill) bossCastGaugeFill.style.width = safeRatio + '%';
                if (bossCastGaugeText) {
                    bossCastGaugeText.innerText = safeRatio >= 100
                        ? triggerText
                        : `${activeText} ${Math.max(0, remain).toFixed(1)}s`;
                }
            };

            // 대형 패턴 2번 최종 참격은 241044 대기부터 241045의 실제 공격 판정 발생까지 이어서 표시한다.
            const isFinalSlashCharge = effect === 'EFT_KASIYAS_P1_M2_FINAL_SLASH_CHARGE'
                || actionName.indexOf('강화 참격 대기') >= 0;
            const isFinalSlashAtk = effect === 'EFT_KASIYAS_P1_M2_FINAL_SLASH'
                || pose === 'POSE_KASIYAS_P1_M2_FINAL_SLASH'
                || (actionType === 'ATK' && actionName.indexOf('강화 참격') >= 0);
            if (isFinalSlashCharge || isFinalSlashAtk) {
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                let chargeDuration = 0;
                let hitStart = getHitStartForGauge(castAction, 0.3);

                if (isFinalSlashCharge) {
                    const nextAction = isFinite(currentActionIndex) ? actionsForCast[currentActionIndex + 1] : null;
                    chargeDuration = getActionDurationForGauge(castAction, 2);
                    hitStart = getHitStartForGauge(nextAction, 0.3);
                    const total = Math.max(0.01, chargeDuration + hitStart);
                    applyBossCastGauge((timer / total) * 100, total - timer, '사도의 참격 준비', '⚠ 사도의 참격 발동');
                } else {
                    const prevAction = isFinite(currentActionIndex) ? actionsForCast[currentActionIndex - 1] : null;
                    chargeDuration = getActionDurationForGauge(prevAction, 2);
                    hitStart = getHitStartForGauge(castAction, 0.3);
                    if (timer <= hitStart + 0.02) {
                        const total = Math.max(0.01, chargeDuration + hitStart);
                        const elapsed = chargeDuration + timer;
                        applyBossCastGauge((elapsed / total) * 100, total - elapsed, '사도의 참격 준비', '⚠ 사도의 참격 발동');
                    }
                }
            }


            // 2페이즈 대형 패턴 1: 교차 검격과 최종 X자 베기의 실제 판정 발생 시점을 HUD 게이지로 표시한다.
            // 교차 검격은 각 액션 시작부터 Hitbox_Start_Time까지, 최종 X자는 준비 액션(242048) + 실제 X자 액션의 Hitbox_Start_Time까지 하나의 게이지로 이어서 표시한다.
            const castActionId = String(castAction && castAction.Action_ID || '').trim();
            const castPatternId = String(castAction && castAction.Pattern_ID || '').trim();
            const isP2M1PatternAction = castPatternId === '232006';
            const isP2M1CrossSlash = isP2M1PatternAction && ['242040','242041','242042','242043','242044','242045','242046','242047'].includes(castActionId);
            const isP2M1FinalXCharge = isP2M1PatternAction && castActionId === '242048';
            const isP2M1FinalXAttack = isP2M1PatternAction && (castActionId === '242049' || castActionId === '242050');
            if (!showBossCastGauge && isP2M1CrossSlash) {
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                const hitStart = Math.max(0.01, getHitStartForGauge(castAction, 0.6));
                if (timer <= hitStart + 0.04) {
                    const isYellowSlash = String(castAction && (castAction.VFX_Type || castAction.Effect_Render_Type) || '').toUpperCase().indexOf('YELLOW') >= 0;
                    const label = isYellowSlash ? '노란 교차 검격' : '붉은 교차 검격';
                    applyBossCastGauge((timer / hitStart) * 100, hitStart - timer, `${label} 준비`, `⚠ ${label} 발동`);
                }
            }
            if (!showBossCastGauge && (isP2M1FinalXCharge || isP2M1FinalXAttack)) {
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                const findFinalXAttackFrom = (startIndex) => {
                    if (!Array.isArray(actionsForCast)) return null;
                    for (let i = Math.max(0, startIndex || 0); i < actionsForCast.length; i++) {
                        const id = String(actionsForCast[i] && actionsForCast[i].Action_ID || '').trim();
                        if (id === '242049' || id === '242050') return actionsForCast[i];
                    }
                    return null;
                };
                const findFinalXChargeBefore = (startIndex) => {
                    if (!Array.isArray(actionsForCast)) return null;
                    for (let i = Math.max(0, startIndex || 0); i >= 0; i--) {
                        const id = String(actionsForCast[i] && actionsForCast[i].Action_ID || '').trim();
                        if (id === '242048') return actionsForCast[i];
                        if (id && id !== '242049' && id !== '242050') {
                            // 바로 앞 준비 액션이 아니면 이전 패턴 구간까지 거슬러 올라가지 않는다.
                            if (i < startIndex) break;
                        }
                    }
                    return null;
                };
                if (isP2M1FinalXCharge) {
                    const nextFinalX = isFinite(currentActionIndex) ? findFinalXAttackFrom(currentActionIndex + 1) : null;
                    const chargeDuration = getActionDurationForGauge(castAction, 2.5);
                    const hitStart = getHitStartForGauge(nextFinalX, 0.4);
                    const total = Math.max(0.01, chargeDuration + hitStart);
                    applyBossCastGauge((timer / total) * 100, total - timer, '최종 X자 베기 준비', '⚠ 최종 X자 베기 발동');
                } else if (isP2M1FinalXAttack) {
                    const prevCharge = isFinite(currentActionIndex) ? findFinalXChargeBefore(currentActionIndex - 1) : null;
                    const chargeDuration = getActionDurationForGauge(prevCharge, 2.5);
                    const hitStart = Math.max(0.01, getHitStartForGauge(castAction, 0.4));
                    if (timer <= hitStart + 0.04) {
                        const total = Math.max(0.01, chargeDuration + hitStart);
                        const elapsed = chargeDuration + Math.min(timer, hitStart);
                        applyBossCastGauge((elapsed / total) * 100, total - elapsed, '최종 X자 베기 준비', '⚠ 최종 X자 베기 발동');
                    }
                }
            }

            // 2페이즈 지면 난타 충격파는 점프 회피 타이밍이 핵심이므로 HUD 게이지로 실제 타격 시점을 알려준다.
            // 강한 지면 난타는 242016(준비) → 242017(실제 강타)이 분리되어 있으므로,
            // 액션이 넘어가도 게이지가 0으로 초기화되지 않도록 두 액션을 하나의 연속 게이지로 계산한다.
            const isGroundPunchCharge = pose === 'POSE_KASIYAS_P2_GROUND_PUNCH_CHARGE'
                || effect === 'EFT_KASIYAS_P2_GROUND_PUNCH_CHARGE'
                || actionName.indexOf('지면 난타 대기') >= 0;
            const isGroundPunchStrongAtk = pose === 'POSE_KASIYAS_P2_GROUND_PUNCH_STRONG'
                || effect === 'EFT_KASIYAS_P2_GROUND_PUNCH_STRONG'
                || actionName.indexOf('3차 지면 난타') >= 0
                || actionName.indexOf('강한 지면 난타') >= 0;
            const isGroundPunchAtk = pose === 'POSE_KASIYAS_P2_GROUND_PUNCH'
                || isGroundPunchStrongAtk
                || effect === 'EFT_KASIYAS_P2_GROUND_PUNCH'
                || actionName.indexOf('지면 난타') >= 0;
            if (!showBossCastGauge && (isGroundPunchCharge || isGroundPunchAtk)) {
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                if (isGroundPunchCharge) {
                    const nextAction = isFinite(currentActionIndex) ? actionsForCast[currentActionIndex + 1] : null;
                    const chargeDuration = getActionDurationForGauge(castAction, 1);
                    const hitStart = getHitStartForGauge(nextAction, 0.3);
                    const total = Math.max(0.01, chargeDuration + hitStart);
                    applyBossCastGauge((timer / total) * 100, total - timer, '강한 지면 난타 준비', '⚠ 지면 충격파 발동');
                } else if (isGroundPunchStrongAtk) {
                    const prevAction = isFinite(currentActionIndex) ? actionsForCast[currentActionIndex - 1] : null;
                    const prevPose = String(prevAction && prevAction.Action_Pose_Type || '').trim().toUpperCase();
                    const prevEffect = String(prevAction && (prevAction.VFX_Type || prevAction.Effect_Render_Type) || '').trim().toUpperCase();
                    const prevName = String(prevAction && prevAction.Action_Name || '').trim();
                    const hasChargeBefore = prevPose === 'POSE_KASIYAS_P2_GROUND_PUNCH_CHARGE'
                        || prevEffect === 'EFT_KASIYAS_P2_GROUND_PUNCH_CHARGE'
                        || prevName.indexOf('지면 난타 대기') >= 0;
                    const hitStart = Math.max(0.01, getHitStartForGauge(castAction, 0.3));
                    if (hasChargeBefore) {
                        const chargeDuration = getActionDurationForGauge(prevAction, 1);
                        const total = Math.max(0.01, chargeDuration + hitStart);
                        const elapsed = chargeDuration + Math.min(timer, hitStart);
                        if (timer <= hitStart + 0.04) {
                            applyBossCastGauge((elapsed / total) * 100, total - elapsed, '강한 지면 난타 준비', '⚠ 지면 충격파 발동');
                        }
                    } else if (timer <= hitStart + 0.04) {
                        applyBossCastGauge((timer / hitStart) * 100, hitStart - timer, '지면 충격파 준비', '⚠ 지면 충격파 발동');
                    }
                } else {
                    const hitStart = Math.max(0.01, getHitStartForGauge(castAction, 0.3));
                    if (timer <= hitStart + 0.04) {
                        applyBossCastGauge((timer / hitStart) * 100, hitStart - timer, '지면 충격파 준비', '⚠ 지면 충격파 발동');
                    }
                }
            }

            // 3페이즈 대형 패턴 1번 바닥 내려찍기는 충격파 타이밍을 명확히 보여준다.
            const isP3M1SlamShockwave = castPatternId === '233006' && (
                castActionId === '243042'
                || pose === 'POSE_KASIYAS_P3_SLAM_THE_SWORD_DOWN'
                || effect === 'EFT_KASIYAS_P3_SLAM_THE_SWORD_DOWN'
                || effect === 'EFT_KASIYAS_P3_M1_SLAM_THE_SWORD_DOWN'
                || actionName.indexOf('바닥 내려') >= 0
            );
            if (!showBossCastGauge && isP3M1SlamShockwave) {
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                const hitStart = Math.max(0.01, getHitStartForGauge(castAction, 0.8));
                if (timer <= hitStart + 0.05) {
                    applyBossCastGauge((timer / hitStart) * 100, hitStart - timer, '저주 충격파 준비', '⚠ 충격파 발생');
                }
            }

            // 3페이즈 대형 패턴 1번 최종 대각선 베기는 대기 액션부터 실제 공격 판정 발생까지 하나의 게이지로 표시한다.
            const isP3M1FinalCharge = castPatternId === '233006' && (
                castActionId === '243044'
                || pose === 'POSE_KASIYAS_P3_M1_FINAL_SLASH_CHARGE'
                || effect === 'EFT_KASIYAS_P3_M1_FINAL_SLASH_CHARGE'
                || actionName.indexOf('마무리 대각선 베기 대기') >= 0
            );
            const isP3M1FinalAttack = castPatternId === '233006' && (
                castActionId === '243045'
                || pose === 'POSE_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH'
                || effect === 'EFT_KASIYAS_P3_M1_FINAL_DIAGONAL_SLASH'
                || actionName.indexOf('마무리 대각선 베기') >= 0
            );
            if (!showBossCastGauge && (isP3M1FinalCharge || isP3M1FinalAttack)) {
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                if (isP3M1FinalCharge) {
                    const nextAction = isFinite(currentActionIndex) ? actionsForCast[currentActionIndex + 1] : null;
                    const chargeDuration = getActionDurationForGauge(castAction, 2.0);
                    const hitStart = Math.max(0.01, getHitStartForGauge(nextAction, 1.3));
                    const total = Math.max(0.01, chargeDuration + hitStart);
                    applyBossCastGauge((timer / total) * 100, total - timer, '저주 마무리 베기 준비', '⚠ 마무리 베기 발동');
                } else {
                    const prevAction = isFinite(currentActionIndex) ? actionsForCast[currentActionIndex - 1] : null;
                    const prevId = String(prevAction && prevAction.Action_ID || '').trim();
                    const prevPose = String(prevAction && prevAction.Action_Pose_Type || '').trim().toUpperCase();
                    const chargeDuration = (prevId === '243044' || prevPose === 'POSE_KASIYAS_P3_M1_FINAL_SLASH_CHARGE') ? getActionDurationForGauge(prevAction, 2.0) : 0;
                    const hitStart = Math.max(0.01, getHitStartForGauge(castAction, 1.3));
                    if (timer <= hitStart + 0.05) {
                        const total = Math.max(0.01, chargeDuration + hitStart);
                        const elapsed = chargeDuration + Math.min(timer, hitStart);
                        applyBossCastGauge((elapsed / total) * 100, total - elapsed, '저주 마무리 베기 준비', '⚠ 마무리 베기 발동');
                    }
                }
            }


            // 3페이즈 대형 패턴 2번 카시야스 지면 낙하는 충격파형 공격이므로, 착지 타이밍까지 게이지를 표시한다.
            const isP3M2LandingImpact = castPatternId === '233007'
                && castActionId === '243060'
                && String(castAction && castAction.Action_Type || '').trim().toUpperCase() === 'ATK';
            if (!showBossCastGauge && isP3M2LandingImpact) {
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                const hitStart = Math.max(0.01, getHitStartForGauge(castAction, 1.0));
                if (timer <= hitStart + 0.05) {
                    applyBossCastGauge((timer / hitStart) * 100, hitStart - timer, '지면 낙하 준비', '⚠ 지면 충격파 발생');
                }
            }

            // 3페이즈 대형 패턴 2번 마무리 참격은 대기 액션부터 실제 참격 판정 발생까지 하나의 연속 게이지로 표시한다.
            const isP3M2FinalCharge = castPatternId === '233007' && (
                castActionId === '243065'
                || pose === 'POSE_KASIYAS_P3_M2_FINAL_SLASH_CHARGE'
                || effect === 'EFT_KASIYAS_P3_M2_FINAL_SLASH_CHARGE'
                || actionName.indexOf('마무리 참격 대기') >= 0
            );
            const isP3M2FinalAttack = castPatternId === '233007' && (
                castActionId === '243066'
                || castActionId === '243067'
                || castActionId === '243068'
                || pose === 'POSE_KASIYAS_P3_M2_FINAL_SLASH'
                || effect === 'EFT_KASIYAS_P3_M2_FINAL_SLASH'
                || actionName.indexOf('마무리 참격') >= 0
            );
            if (!showBossCastGauge && (isP3M2FinalCharge || isP3M2FinalAttack)) {
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                if (isP3M2FinalCharge) {
                    const nextAction = isFinite(currentActionIndex) ? actionsForCast[currentActionIndex + 1] : null;
                    const chargeDuration = getActionDurationForGauge(castAction, 2.5);
                    const hitStart = Math.max(0.01, getHitStartForGauge(nextAction, 0.8));
                    const total = Math.max(0.01, chargeDuration + hitStart);
                    applyBossCastGauge((timer / total) * 100, total - timer, '마무리 참격 준비', '⚠ 마무리 참격 발동');
                } else {
                    const prevAction = isFinite(currentActionIndex) ? actionsForCast[currentActionIndex - 1] : null;
                    const prevId = String(prevAction && prevAction.Action_ID || '').trim();
                    const prevPose = String(prevAction && prevAction.Action_Pose_Type || '').trim().toUpperCase();
                    const chargeDuration = (prevId === '243065' || prevPose === 'POSE_KASIYAS_P3_M2_FINAL_SLASH_CHARGE') ? getActionDurationForGauge(prevAction, 2.5) : 0;
                    const hitStart = Math.max(0.01, getHitStartForGauge(castAction, 0.8));
                    if (timer <= hitStart + 0.05) {
                        const total = Math.max(0.01, chargeDuration + hitStart);
                        const elapsed = chargeDuration + Math.min(timer, hitStart);
                        applyBossCastGauge((elapsed / total) * 100, total - elapsed, '마무리 참격 준비', '⚠ 마무리 참격 발동');
                    }
                }
            }

            // 1페이즈 기본 패턴 5번 발 내려찍기는 CAST_SPAWN_OBJECT + ACTION_END 구조라
            // 공격 히트박스가 액션에 직접 없더라도, 충격파 생성 타이밍까지 게이지를 표시한다.
            const isStompShockwaveCast = pose === 'POSE_KASIYAS_STOMP'
                || effect === 'EFT_KASIYAS_STOMP'
                || actionName.indexOf('발 내려찍기') >= 0
                || actionName.indexOf('발구르기') >= 0;
            if (!showBossCastGauge && isStompShockwaveCast) {
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                let hitStart = getHitStartForGauge(castAction, NaN);
                const actionTypeForStomp = String(castAction && castAction.Action_Type || '').trim().toUpperCase();
                const spawnTimingForStomp = String(castAction && castAction.Object_Spawn_Timing || '').trim().toUpperCase();
                if (!isFinite(hitStart) || hitStart <= 0 || (actionTypeForStomp === 'CAST_SPAWN_OBJECT' && spawnTimingForStomp === 'ACTION_END')) {
                    hitStart = getActionDurationForGauge(castAction, 0.7);
                }
                if (timer <= hitStart + 0.05) {
                    applyBossCastGauge((timer / Math.max(0.01, hitStart)) * 100, Math.max(0, hitStart - timer), '발 내려찍기 준비', '⚠ 충격파 발생');
                }
            }

            // 강화 내려베기 게이지는 반드시 강화 내려베기 액션에서만 표시한다.
            // Action_ID는 데이터 테이블에 액션이 추가될 때 밀릴 수 있으므로 사용하지 않는다.
            const isHeavySlashCast = pose === 'POSE_KASIYAS_CHARGE_SLASH_DOWN'
                || effect === 'EFT_KASIYAS_CHARGE_SLASH_DOWN'
                || actionName.indexOf('강화 내려베기') >= 0;
            if (!showBossCastGauge && isHeavySlashCast) {
                let hitStart = getHitStartForGauge(castAction, parseFloat(castAction.Action_Anim_Duration) || 1);
                if (!isFinite(hitStart) || hitStart <= 0) hitStart = parseFloat(castAction.Action_Anim_Duration) || 1;
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                const remain = Math.max(0, hitStart - timer);
                applyBossCastGauge((timer / Math.max(0.01, hitStart)) * 100, remain, '강화 내려베기 시전', '⚠ 강화 내려베기 발동');
            }
        }
        if (!showBossCastGauge && bossCastGauge) {
            bossCastGauge.classList.add('hidden');
            bossCastGauge.classList.remove('danger');
            if (bossCastGaugeFill) bossCastGaugeFill.style.width = '0%';
        }

        let waveAct = gameState.actions.find(a => a.Action_Name && a.Action_Name.includes('웨이브'));
        let waveReq = waveAct ? (parseFloat(waveAct.Require_Level) || 5) : 5;
        let waveRatio = (waveAct && p.skillCooldowns[waveAct.Action_Name] > 0)
            ? (p.skillCooldowns[waveAct.Action_Name] / (parseFloat(waveAct.Cooltime) || 1)) * 100
            : 0;
        setLockAndMask('lockWave', 'maskWave', p.level >= waveReq, waveRatio);

        let cannonAct = gameState.actions.find(a => a.Action_Name && a.Action_Name.includes('캐논볼'));
        let cannonReq = cannonAct ? (parseFloat(cannonAct.Require_Level) || 10) : 10;
        let cannonRatio = (cannonAct && p.skillCooldowns[cannonAct.Action_Name] > 0)
            ? (p.skillCooldowns[cannonAct.Action_Name] / (parseFloat(cannonAct.Cooltime) || 1)) * 100
            : 0;
        setLockAndMask('lockCannon', 'maskCannon', p.level >= cannonReq, cannonRatio);

        let debugPanel = getEl('hudDebug');
        if (debugPanel) {
            const bossTarget = gameState.targetUI && gameState.targetUI.monster && gameState.targetUI.monster.active
                ? gameState.targetUI.monster
                : null;
            const bossRuntime = bossTarget && bossTarget.boss ? bossTarget.boss : null;
            const guardText = p.guardTimer > 0
                ? `ACTIVE ${formatDebugNumber(p.guardTimer, 2)}s`
                : (p.guardCooldownTimer > 0 ? `COOLDOWN ${formatDebugNumber(p.guardCooldownTimer, 2)}s` : 'READY');
            const runText = p.isRunning || p.runActive ? 'ON' : 'OFF';

            let html = `<b style="color:#7fc6ff;">[Player]</b> Pos X:${Math.round(p.x)} Y:${Math.round(p.y)} Z:${Math.round(p.z)} | HP:${Math.max(0, p.hp).toFixed(0)}/${p.maxHp}<br>`;
            html += `<b style="color:#2ecc71;">[Control]</b> Stance:${p.stance} | Run:${runText} | Guard:${guardText}<br>`;
            html += `<b style="color:#f1c40f;">[Battle]</b> Mode: Boss Battle | Debug View:${gameState.isDebugView ? 'ON' : 'OFF'} | Practice:${gameState.bossPractice && gameState.bossPractice.enabled ? 'ON' : 'OFF'}<br>`;

            if (bossTarget) {
                const hpRate = Math.max(0, (bossTarget.hp || 0) / Math.max(1, bossTarget.maxHp || 1));
                const activePattern = bossRuntime && bossRuntime.activePattern
                    ? `${bossRuntime.activePattern.Pattern_ID || ''} ${bossRuntime.activePattern.Pattern_Name || bossRuntime.activePattern.Dev_Name || ''}`
                    : '기본 추적 / 대기';
                const currentAction = bossRuntime && bossRuntime.action
                    ? `${bossRuntime.action.Action_ID || ''} ${bossRuntime.action.Action_Name || bossRuntime.action.Dev_Name || ''}`
                    : '-';
                const dist = getDistance2D(p.x, p.y, bossTarget.x, bossTarget.y) - (p.bodyX * p.scale / 2) - (bossTarget.d.bodyX * bossTarget.scale / 2);

                html += `<b style="color:#f4d36a;">[Boss]</b> ${bossTarget.d.name} | HP:${Math.max(0, bossTarget.hp).toFixed(0)}/${bossTarget.maxHp} (${(hpRate * 100).toFixed(1)}%) | Dist:${Math.round(dist)}<br>`;
                html += `<b style="color:#caa7ff;">[Pattern]</b> ${activePattern} | Action:${currentAction} | Late:${bossRuntime && bossRuntime.isLatePhase ? 'ON' : 'OFF'}<br>`;
            }

            html += `<b style="color:#95a5a6;">[Runtime]</b> Projectiles:${gameState.projectiles.length} | BossObjects:${(gameState.bossAttackObjects || []).length} | Hitboxes:${gameState.hitboxes.length} | Effects:${gameState.effects.length}<br>`;

            debugPanel.innerHTML = html;
        }

        renderBossAIPanel(gameState);
        renderBossPatternLogPanel(gameState);

        const systemNoticeUI = getEl('systemNoticeUI');
        if (systemNoticeUI) {
            systemNoticeUI.innerHTML = '';

            for (let i = 0; i < gameState.systemNotices.length; i++) {
                const notice = gameState.systemNotices[i];
                if (!notice) continue;

                const item = document.createElement('div');
                item.className = 'system-notice-item';

                const colorKey = String(notice.color || '').toLowerCase();
                if (colorKey.includes('8e44ad') || colorKey.includes('caa7ff') || colorKey.includes('purple')) {
                    item.classList.add('notice-purple');
                } else if (colorKey.includes('2ecc71') || colorKey.includes('8ff0b0') || colorKey.includes('green')) {
                    item.classList.add('notice-green');
                } else {
                    item.classList.add('notice-yellow');
                }

                const alpha = Math.max(0, Math.min(1, (notice.timer || 0) / (notice.maxTimer || 1)));
                item.style.opacity = alpha.toFixed(3);
                item.style.transform = `translateY(${Math.max(0, (1 - alpha) * 8)}px) scale(${(0.96 + alpha * 0.04).toFixed(3)})`;
                item.innerText = notice.text || '';

                systemNoticeUI.appendChild(item);
            }
        }
    } catch (e) {
        console.error("HUD 업데이트 에러:", e);
    }
}
