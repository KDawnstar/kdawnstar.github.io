// ==========================================
// [모험의 시작] 메인 게임 루프 및 상태 관리 (main.js)
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
function normalizeDataValue(value) {
    if (typeof value === 'string') {
        const v = value.trim();
        return v === '' ? null : v;
    }
    return value;
}

function normalizeDataArray(arr) {
    if (!Array.isArray(arr)) return [];

    return arr.map(row => {
        const newRow = {};
        for (let key in row) {
            if (!key) continue;
            if (key.startsWith('#')) continue;
            if (key === '__EMPTY') continue;

            newRow[key] = normalizeDataValue(row[key]);
        }
        return newRow;
    });
}

function pickRuntimeValue(...values) {
    for (const value of values) {
        if (value === null || value === undefined) continue;
        if (typeof value === 'string' && value.trim() === '') continue;
        return value;
    }
    return null;
}

function normalizePlayerRuntimeRow(row) {
    const newRow = { ...row };

    newRow.Character_ID = pickRuntimeValue(
        row.Character_ID,
        row.Dev_Name,
        row.Use_Character
    );

    newRow.Character_Name = pickRuntimeValue(
        row.Character_Name,
        row.Name,
        row.Dev_Name,
        newRow.Character_ID
    );

    return newRow;
}

function normalizeActionRuntimeRow(row) {
    const newRow = { ...row };

    newRow.Character_ID = pickRuntimeValue(
        row.Character_ID,
        row.Use_Character
    );

    newRow.Action_ID = pickRuntimeValue(
        row.Action_ID,
        row.Dev_Name,
        row.Action_Code
    );

    newRow.Action_Name = pickRuntimeValue(
        row.Action_Name,
        row.Name,
        newRow.Action_ID
    );

    return newRow;
}

function normalizeMonsterRuntimeRow(row) {
    const newRow = { ...row };

    // Boss_Phase_info의 Phase_Monster_ID가 숫자 Monster_ID를 참조하므로
    // Boss_info는 Monster_ID를 우선 런타임 키로 사용한다.
    // 기존 Stage_info처럼 Dev_Name으로 스폰하는 경우는 MonsterManager의 aliasSet으로 계속 호환된다.
    newRow.Monster_ID = pickRuntimeValue(
        row.Monster_ID,
        row.Dev_Name,
        row.Monster_Code,
        row.Monster_Key
    );

    newRow.Monster_Name = pickRuntimeValue(
        row.Monster_Name,
        row.Name,
        row.Dev_Name,
        newRow.Monster_ID
    );

    newRow.Model_Render_Type = pickRuntimeValue(
        row.Model_Render_Type,
        row.Render_Type
    );

    newRow.Model_Render_Color = pickRuntimeValue(
        row.Model_Render_Color,
        row.Render_Color
    );

    newRow.Weapon_Render_Type = pickRuntimeValue(
        row.Weapon_Render_Type,
        row.Weapon_Type
    );

    newRow.Weapon_Render_Color = pickRuntimeValue(
        row.Weapon_Render_Color,
        row.Weapon_Color
    );

    newRow.ATK_Effect_Render_Type = pickRuntimeValue(
        row.ATK_Effect_Render_Type,
        row.Attack_Effect_Render_Type
    );

    newRow.ATK_Projectile_Render_Type = pickRuntimeValue(
        row.ATK_Projectile_Render_Type,
        row.Attack_Projectile_Render_Type
    );

    return newRow;
}

function normalizePatternRuntimeRow(row) {
    const newRow = { ...row };

    newRow.AI_Name = pickRuntimeValue(
        row.AI_Name,
        row.Owner_AI,
        row.Dev_Name,
        row.AI_Code
    );

    newRow.Pattern_Name = pickRuntimeValue(
        row.Pattern_Name,
        row.Pattern_Code,
        row.Name
    );

    return newRow;
}

function normalizeSkillRuntimeRow(row) {
    const newRow = { ...row };

    newRow.Skill_Code = pickRuntimeValue(
        row.Dev_Name,
        row.Skill_Code,
        row.Skill_ID,
        row.Skill_Name
    );

    newRow.Skill_Name = pickRuntimeValue(
        row.Skill_Name,
        row.Name,
        newRow.Skill_Code
    );

    newRow.Monster_ID = pickRuntimeValue(
        row.Use_Monster,
        row.Monster_ID,
        row.Owner_Monster_ID
    );

    newRow.Skill_Effect_Render_Type = pickRuntimeValue(
        row.Skill_Effect_Render_Type,
        row.Effect_Render_Type
    );

    newRow.Warning_Effect_Render_Type = pickRuntimeValue(
        row.Warning_Effect_Render_Type,
        row.Warning_Render_Type
    );

    return newRow;
}

function normalizeStageRuntimeRow(row) {
    const newRow = { ...row };

    newRow.Stage_ID = pickRuntimeValue(
        row.Stage_ID,
        row.Dev_Name,
        row.Stage_Code
    );

    newRow.Stage_Name = pickRuntimeValue(
        row.Stage_Name,
        row.Name,
        row.Dev_Name,
        newRow.Stage_ID
    );

    newRow.Next_Stage_ID = pickRuntimeValue(
        row.Next_Stage,
        row.Next_Stage_ID,
        row.Next_Stage_Code
    );

    newRow.Spawn_Monster_1_ID = pickRuntimeValue(
        row.Spawn_Monster_1,
        row.Spawn_Monster_1_ID
    );

    newRow.Spawn_Monster_2_ID = pickRuntimeValue(
        row.Spawn_Monster_2,
        row.Spawn_Monster_2_ID
    );

    newRow.Spawn_Monster_3_ID = pickRuntimeValue(
        row.Spawn_Monster_3,
        row.Spawn_Monster_3_ID
    );

    newRow.Spawn_Monster_1_Count = pickRuntimeValue(
        row.Spawn_Count_1,
        row.Spawn_Monster_1_Count
    );

    newRow.Spawn_Monster_2_Count = pickRuntimeValue(
        row.Spawn_Count_2,
        row.Spawn_Monster_2_Count
    );

    newRow.Spawn_Monster_3_Count = pickRuntimeValue(
        row.Spawn_Count_3,
        row.Spawn_Monster_3_Count
    );

    // 카시야스 전용 Stage_info 호환
    newRow.Map_Size_X = pickRuntimeValue(row.Map_Size_X, row.Stage_Width);
    newRow.Map_Size_Y = pickRuntimeValue(row.Map_Size_Y, row.Stage_Height);
    newRow.Player_Start_Center_X = pickRuntimeValue(row.Player_Start_Center_X, row.Player_Spawn_X);
    newRow.Player_Start_Center_Y = pickRuntimeValue(row.Player_Start_Center_Y, row.Player_Spawn_Y);
    newRow.Boss_Spawn_Center_X = pickRuntimeValue(row.Boss_Spawn_Center_X, row.Boss_Spawn_X);
    newRow.Boss_Spawn_Center_Y = pickRuntimeValue(row.Boss_Spawn_Center_Y, row.Boss_Spawn_Y);

    newRow.Stage_Background_Type = pickRuntimeValue(
        row.Stage_Background_Type,
        row.Background_Render_Type,
        row.Background_Type
    );

    newRow.Stage_Clear_Type = pickRuntimeValue(row.Stage_Clear_Type, 'KILL_BOSS');

    return newRow;
}

function normalizeBossPhaseRuntimeRow(row) {
    const newRow = { ...row };
    newRow.Phase_ID = pickRuntimeValue(row.Phase_ID, row.Dev_Name);
    newRow.Phase_Monster_ID = pickRuntimeValue(row.Phase_Monster_ID, row.Monster_ID);
    return newRow;
}

function normalizeBossPatternRuntimeRow(row) {
    const newRow = { ...row };
    newRow.Pattern_ID = pickRuntimeValue(row.Pattern_ID, row.Dev_Name);
    newRow.Pattern_Set_ID = pickRuntimeValue(row.Pattern_Set_ID, row.Pattern_Set);
    return newRow;
}

function normalizeBossPatternActionRuntimeRow(row) {
    const newRow = { ...row };
    newRow.Action_ID = pickRuntimeValue(row.Action_ID, row.Dev_Name);
    newRow.Pattern_ID = pickRuntimeValue(row.Pattern_ID, row.Owner_Pattern_ID);
    // 최신 카시야스 데이터에서는 이펙트 컬럼명을 Effect_Render_Type으로 정리했다.
    // 기존 런타임은 VFX_Type을 읽으므로 양쪽 이름을 호환시킨다.
    newRow.VFX_Type = pickRuntimeValue(row.VFX_Type, row.Effect_Render_Type, row.Action_Effect_Render_Type);
    newRow.Warning_Render_Type = pickRuntimeValue(row.Warning_Render_Type, row.Warning_Effect_Render_Type);
    return newRow;
}

function normalizeBossPatternObjectRuntimeRow(row) {
    const newRow = { ...row };
    newRow.Object_ID = pickRuntimeValue(row.Object_ID, row.Attack_Object_ID, row.Dev_Name);
    newRow.Attack_Object_ID = pickRuntimeValue(row.Attack_Object_ID, newRow.Object_ID, row.Dev_Name);
    newRow.Effect_Render_Type = pickRuntimeValue(row.Effect_Render_Type, row.VFX_Type, row.Action_Effect_Render_Type);
    return newRow;
}

function normalizeBossPatternObjectActionRuntimeRow(row) {
    const newRow = { ...row };
    newRow.Object_Action_ID = pickRuntimeValue(row.Object_Action_ID, row.Dev_Name);
    newRow.Object_ID = pickRuntimeValue(row.Object_ID, row.Attack_Object_ID, row.Owner_Object_ID);
    newRow.VFX_Type = pickRuntimeValue(row.VFX_Type, row.Effect_Render_Type, row.Action_Effect_Render_Type);
    newRow.Warning_Render_Type = pickRuntimeValue(row.Warning_Render_Type, row.Warning_Effect_Render_Type);
    return newRow;
}

function buildBossRuntimeTables(phaseData, patternData, actionData, objectData, objectActionData) {
    gameState.DB_BOSS_PHASE = {};
    gameState.DB_BOSS_PATTERN = {};
    gameState.DB_BOSS_PATTERN_BY_SET = {};
    gameState.DB_BOSS_PATTERN_ACTION = {};
    gameState.DB_BOSS_PATTERN_OBJECT = {};
    gameState.DB_BOSS_PATTERN_OBJECT_ACTION = {};
    gameState.DB_BOSS_PATTERN_OBJECT_ACTION_BY_OBJECT = {};

    (phaseData || []).forEach(phase => {
        const phaseId = String(phase.Phase_ID || '').trim();
        if (!phaseId) return;
        gameState.DB_BOSS_PHASE[phaseId] = phase;
    });

    const actionsByPattern = {};
    (actionData || []).forEach(action => {
        const actionId = String(action.Action_ID || '').trim();
        const patternId = String(action.Pattern_ID || '').trim();

        if (actionId) gameState.DB_BOSS_PATTERN_ACTION[actionId] = action;
        if (patternId) {
            if (!actionsByPattern[patternId]) actionsByPattern[patternId] = [];
            actionsByPattern[patternId].push(action);
        }
    });

    for (const patternId in actionsByPattern) {
        actionsByPattern[patternId].sort((a, b) => {
            const ao = parseFloat(a.Action_Order) || 0;
            const bo = parseFloat(b.Action_Order) || 0;
            return ao - bo;
        });
    }

    const objectActionsByObject = {};
    (objectActionData || []).forEach(action => {
        const actionId = String(action.Object_Action_ID || '').trim();
        const objectId = String(action.Object_ID || action.Attack_Object_ID || '').trim();

        if (actionId) gameState.DB_BOSS_PATTERN_OBJECT_ACTION[actionId] = action;
        if (objectId) {
            if (!objectActionsByObject[objectId]) objectActionsByObject[objectId] = [];
            objectActionsByObject[objectId].push(action);
        }
    });

    for (const objectId in objectActionsByObject) {
        objectActionsByObject[objectId].sort((a, b) => {
            const ao = parseFloat(a.Action_Order) || 0;
            const bo = parseFloat(b.Action_Order) || 0;
            return ao - bo;
        });
        gameState.DB_BOSS_PATTERN_OBJECT_ACTION_BY_OBJECT[objectId] = objectActionsByObject[objectId];
    }

    (objectData || []).forEach(obj => {
        const objectId = String(obj.Object_ID || obj.Attack_Object_ID || '').trim();
        if (!objectId) return;
        obj.Runtime_Actions = objectActionsByObject[objectId] ? [...objectActionsByObject[objectId]] : [];
        gameState.DB_BOSS_PATTERN_OBJECT[objectId] = obj;
    });

    (patternData || []).forEach(pattern => {
        const patternId = String(pattern.Pattern_ID || '').trim();
        const setId = String(pattern.Pattern_Set_ID || '').trim();
        if (!patternId) return;

        // 우선 Boss_Pattern_Action_info의 Pattern_ID + Action_Order 구조를 사용한다.
        pattern.Runtime_Actions = actionsByPattern[patternId] ? [...actionsByPattern[patternId]] : [];

        // 구버전 호환: Pattern_1st_Action_ID 계열만 있는 경우에도 실행 가능하게 유지한다.
        if (pattern.Runtime_Actions.length <= 0) {
            const suffixes = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
            for (const suffix of suffixes) {
                const actionId = String(pattern[`Pattern_${suffix}_Action_ID`] || '').trim();
                if (!actionId || actionId === '0') continue;
                const action = gameState.DB_BOSS_PATTERN_ACTION[actionId];
                if (action) pattern.Runtime_Actions.push(action);
            }
        }

        gameState.DB_BOSS_PATTERN[patternId] = pattern;

        if (setId) {
            if (!gameState.DB_BOSS_PATTERN_BY_SET[setId]) {
                gameState.DB_BOSS_PATTERN_BY_SET[setId] = [];
            }
            gameState.DB_BOSS_PATTERN_BY_SET[setId].push(pattern);
        }
    });

    for (const setId in gameState.DB_BOSS_PATTERN_BY_SET) {
        gameState.DB_BOSS_PATTERN_BY_SET[setId].sort((a, b) => {
            const pa = parseFloat(a.Pattern_Priority) || 0;
            const pb = parseFloat(b.Pattern_Priority) || 0;
            return pb - pa;
        });
    }
}

function normalizeRuntimeDataSet(data, type) {
    const rows = normalizeDataArray(data);

    if (type === 'player') return rows.map(normalizePlayerRuntimeRow);
    if (type === 'action') return rows.map(normalizeActionRuntimeRow);
    if (type === 'monster') return rows.map(normalizeMonsterRuntimeRow);
    if (type === 'pattern') return rows.map(normalizePatternRuntimeRow);
    if (type === 'skill') return rows.map(normalizeSkillRuntimeRow);
    if (type === 'stage') return rows.map(normalizeStageRuntimeRow);
    if (type === 'bossPhase') return rows.map(normalizeBossPhaseRuntimeRow);
    if (type === 'bossPattern') return rows.map(normalizeBossPatternRuntimeRow);
    if (type === 'bossPatternAction') return rows.map(normalizeBossPatternActionRuntimeRow);
    if (type === 'bossPatternObject') return rows.map(normalizeBossPatternObjectRuntimeRow);
    if (type === 'bossPatternObjectAction') return rows.map(normalizeBossPatternObjectActionRuntimeRow);

    return rows;
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
    actions: [],

    isAutoSpawn: true,
    jumpKeyEngine: 'KeyC',
    dashKeyEngine: 'KeyZ',

    // 기존 테스트 모드(T키)
    isTestMode: false,

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
            pushSystemNotice('🏆 카시야스 1페이즈 격파!', '#2ecc71', 2.0);
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
        const lateText = boss && boss.boss && boss.boss.isLatePhase ? '후반부 ON' : '후반부 OFF';
        const patternName = boss && boss.boss && boss.boss.activePattern
            ? boss.boss.activePattern.Pattern_Name
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
                ${phase ? phase.Phase_Name : '1페이즈 로딩 중...'}
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
// 🚀 비동기 데이터 로더 (Data-Driven Init)
// ==========================================

async function loadGameDataAndInit() {
    try {
        console.log("카시야스 보스전 데이터 로딩 시작...");

        const [
            playerRes,
            actionRes,
            bossRes,
            bossPhaseRes,
            bossPatternRes,
            bossPatternActionRes,
            bossPatternObjectRes,
            bossPatternObjectActionRes,
            stageRes
        ] = await Promise.all([
            fetch('./GameData/Player_info.json'),
            fetch('./GameData/Player_Action_info.json'),
            fetch('./GameData/Boss_info.json'),
            fetch('./GameData/Boss_Phase_info.json'),
            fetch('./GameData/Boss_Pattern_info.json'),
            fetch('./GameData/Boss_Pattern_Action_info.json'),
            fetch('./GameData/Boss_Pattern_Object_info.json'),
            fetch('./GameData/Boss_Pattern_Object_Action_info.json'),
            fetch('./GameData/Stage_info.json')
        ]);

        const playerData = await playerRes.json();
        const actionData = await actionRes.json();
        const bossData = await bossRes.json();
        const bossPhaseData = await bossPhaseRes.json();
        const bossPatternData = await bossPatternRes.json();
        const bossPatternActionData = await bossPatternActionRes.json();
        const bossPatternObjectData = await bossPatternObjectRes.json();
        const bossPatternObjectActionData = await bossPatternObjectActionRes.json();
        const stageData = await stageRes.json();

        console.log("데이터 로딩 완료! 카시야스 보스전 엔진을 초기화합니다.");

        const pData = normalizeRuntimeDataSet(playerData, 'player');
        const aData = normalizeRuntimeDataSet(actionData, 'action');
        const bData = normalizeRuntimeDataSet(bossData, 'monster');
        const bpData = normalizeRuntimeDataSet(bossPhaseData, 'bossPhase');
        const bptData = normalizeRuntimeDataSet(bossPatternData, 'bossPattern');
        const bpaData = normalizeRuntimeDataSet(bossPatternActionData, 'bossPatternAction');
        const bpoData = normalizeRuntimeDataSet(bossPatternObjectData, 'bossPatternObject');
        const bpoaData = normalizeRuntimeDataSet(bossPatternObjectActionData, 'bossPatternObjectAction');
        const stData = normalizeRuntimeDataSet(stageData, 'stage');

        PlayerManager.init(pData, aData, gameState);

        // Boss_info를 기존 MonsterManager 엔티티 구조로 태운다.
        // 기존 일반 몬스터/스킬/패턴 DB는 사용하지 않는다.
        MonsterManager.init(bData, [], [], gameState);

        gameState.DB_STAGE = stData || [];
        buildBossRuntimeTables(bpData, bptData, bpaData, bpoData, bpoaData);

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

window.addEventListener('keydown', e => {
    gameState.keys[e.code] = true;

    if (e.code === 'KeyR') PlayerManager.revive(gameState);
    if (e.code === 'KeyV') gameState.isDebugView = !gameState.isDebugView;

    // 기존 테스트 모드 유지
    if (e.code === 'KeyT') {
        gameState.isTestMode = !gameState.isTestMode;
        let tStatus = gameState.isTestMode ? "ON" : "OFF";
        let tColor = gameState.isTestMode ? "#2ecc71" : "#e74c3c";
        if (gameState.player && gameState.player.active) {
            gameState.floatingTexts.push({
                x: gameState.player.x,
                y: gameState.player.y,
                z: gameState.player.z + gameState.player.bodyZ + 60,
                text: `🛠️ 테스트 모드 ${tStatus}`,
                color: tColor,
                size: "24px",
                timer: 1.5,
                isBubble: true
            });
        }
        buildUIButtons();
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

        PlayerManager.update(deltaTime, gameState.keys, gameState);
        MonsterManager.update(deltaTime, gameState);
        updateEnvironment(deltaTime);
        updateStageFlow();
        updateStageWarp();

        const cameraBaseWidth = (GameRenderer && GameRenderer.canvas ? GameRenderer.canvas.width : 1600);
        const cameraBaseHeight = (GameRenderer && GameRenderer.canvas ? GameRenderer.canvas.height : 900);

        gameState.camera.width = Math.max(1, Math.min(cameraBaseWidth, gameState.WORLD_WIDTH));
        gameState.camera.height = Math.max(1, Math.min(cameraBaseHeight, GameRenderer.GROUND_BASE_Y + gameState.WORLD_DEPTH));

        gameState.camera.x = Math.max(
            0,
         Math.min(
         Math.max(0, gameState.WORLD_WIDTH - gameState.camera.width),
         (gameState.player.x || 0) - gameState.camera.width / 2
         )
        );

        GameRenderer.render(gameState);
        updateHUD();
    } catch (e) {
        console.error("루프 에러:", e);
    }
    requestAnimationFrame(gameLoop);
}

function updateEnvironment(deltaTime) {
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
                        p.hitTargets.add(m);
                        hitAny = true;
                        if (!p.penetrate) break;
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
                <div class="control-row"><span class="keycap debug">T</span><span>테스트 모드</span></div>
                <div class="control-row"><span class="keycap debug">R</span><span>사망 시 부활</span></div>
            </div>
        `;
    }

    if (controls) controls.innerHTML = '';

    if (gameState.gameMode === 'BOSS') {
        if (!document.getElementById('bossAIPanel') && controls) {
            controls.innerHTML = `<div id="bossAIPanel" class="boss-ai-panel"></div>`;
        }
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
    const patternCheck = debug.patternCheck || null;
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
            : `${patternCheck.readyCount || 0} ready`;

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


        const bossCastGauge = getEl('bossCastGauge');
        const bossCastGaugeFill = getEl('bossCastGaugeFill');
        const bossCastGaugeText = getEl('bossCastGaugeText');
        const activeBossForCast = (gameState.monsters || []).find(m => m && m.active && (m.hp || 0) > 0 && m.state !== 'DEAD' && m.state !== 'DIE' && m.boss && m.boss.action);
        let showBossCastGauge = false;
        if (activeBossForCast && activeBossForCast.boss && activeBossForCast.boss.action) {
            const castAction = activeBossForCast.boss.action;
            const pose = String(castAction.Action_Pose_Type || '').trim().toUpperCase();
            const effect = String(castAction.VFX_Type || castAction.Effect_Render_Type || '').trim().toUpperCase();
            const actionId = String(castAction.Action_ID || '').trim();
            const isHeavySlashCast = actionId === '241021' || pose === 'POSE_KASIYAS_CHARGE_SLASH_DOWN' || effect === 'EFT_KASIYAS_CHARGE_SLASH_DOWN';
            if (isHeavySlashCast) {
                let hitStart = parseFloat(castAction.Hitbox_Start_Time);
                try {
                    if (typeof MonsterManager !== 'undefined' && MonsterManager.getBossActionHitWindow) {
                        const hw = MonsterManager.getBossActionHitWindow(activeBossForCast, castAction);
                        if (hw && isFinite(hw.start) && hw.start > 0) hitStart = hw.start;
                    }
                } catch (e) {}
                if (!isFinite(hitStart) || hitStart <= 0) hitStart = parseFloat(castAction.Action_Anim_Duration) || 1;
                const timer = Math.max(0, parseFloat(activeBossForCast.timer) || 0);
                const ratio = clamp((timer / Math.max(0.01, hitStart)) * 100, 0, 100);
                const remain = Math.max(0, hitStart - timer);
                showBossCastGauge = true;
                if (bossCastGauge) {
                    bossCastGauge.classList.remove('hidden');
                    bossCastGauge.classList.toggle('danger', ratio >= 96);
                }
                if (bossCastGaugeFill) bossCastGaugeFill.style.width = ratio + '%';
                if (bossCastGaugeText) {
                    bossCastGaugeText.innerText = ratio >= 100
                        ? '⚠ 강화 내려베기 발동'
                        : `강화 내려베기 시전 ${remain.toFixed(1)}s`;
                }
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
            html += `<b style="color:#f1c40f;">[Battle]</b> Mode: Boss Battle | Debug View:${gameState.isDebugView ? 'ON' : 'OFF'} | Test:${gameState.isTestMode ? 'ON' : 'OFF'}<br>`;

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
