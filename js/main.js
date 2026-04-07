// ==========================================
// [모험의 시작] 메인 게임 루프 및 상태 관리 (main.js)
// ==========================================

function getDistance2D(x1, y1, x2, y2) { return Math.sqrt((x1-x2)**2 + (y1-y2)**2) || 0; }
function checkAABB3D(x1, y1, z1, w1, d1, h1, x2, y2, z2, w2, d2, h2) {
    if (isNaN(x1) || isNaN(x2)) return false;
    return (Math.abs(x1 - x2) < (w1 + w2) / 2) && (Math.abs(y1 - y2) < (d1 + d2) / 2) && (z1 < z2 + h2 && z1 + h1 > z2);
}
function calcScaledDamage(attackerLvl, defenderLvl, baseDmg) {
    let diff = (attackerLvl || 1) - (defenderLvl || 1);
    let absDiff = Math.min(Math.abs(diff), gameState.player.lvlDiffLimit || 5);
    let factor = 1 + absDiff * (gameState.player.lvlDiffRate || 0.2);
    return (diff < 0) ? (baseDmg || 0) / factor : (baseDmg || 0) * factor;
}
function getEngineKeyCode(excelKey) {
    if (!excelKey) return '';
    const map = {
        'Key_X': 'KeyX',
        'Key_Z': 'KeyZ',
        'Key_C': 'KeyC',
        'Key_V': 'KeyV',
        'Key_F': 'KeyF',
        'Key_A': 'KeyA',
        'Key_S': 'KeyS',
        'Down_Arrow_Key': 'ArrowDown',
        'Up_Arrow_Key': 'ArrowUp',
        'Left_Arrow_Key': 'ArrowLeft',
        'Right_Arrow_Key': 'ArrowRight'
    };
    return map[excelKey] || String(excelKey).replace(/_/g, '');
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

    newRow.Monster_ID = pickRuntimeValue(
        row.Dev_Name,
        row.Monster_ID,
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
        row.Dev_Name,
        row.Stage_ID,
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

    newRow.Stage_Background_Type = pickRuntimeValue(
        row.Stage_Background_Type,
        row.Background_Type
    );

    return newRow;
}

function normalizeRuntimeDataSet(data, type) {
    const rows = normalizeDataArray(data);

    if (type === 'player') return rows.map(normalizePlayerRuntimeRow);
    if (type === 'action') return rows.map(normalizeActionRuntimeRow);
    if (type === 'monster') return rows.map(normalizeMonsterRuntimeRow);
    if (type === 'pattern') return rows.map(normalizePatternRuntimeRow);
    if (type === 'skill') return rows.map(normalizeSkillRuntimeRow);
    if (type === 'stage') return rows.map(normalizeStageRuntimeRow);

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
    floatingTexts: [],

    targetUI: { monster: null, timer: 0 },

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
    actions: [],

    isAutoSpawn: true,
    jumpKeyEngine: 'KeyC',
    dashKeyEngine: 'KeyZ',

    // 기존 테스트 모드(T키)
    isTestMode: false,

    // 새 게임 진행 모드
    gameMode: 'STAGE', // 'STAGE' or 'FREE_SPAWN'

    // 스테이지 상태
    currentStageId: null,
    currentStage: null,
    stageClearPending: false,
    isStageCleared: false,
    activeWarp: null
};


let lastTime = performance.now();

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
    gameState.targetUI.monster = null;
    gameState.targetUI.timer = 0;

    gameState.activeWarp = null;
    gameState.isStageCleared = false;
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
        console.log("데이터 로딩 시작...");

        const [playerRes, actionRes, monsterRes, patternRes, skillRes, stageRes] = await Promise.all([
            fetch('./GameData/Player_info.json'),
            fetch('./GameData/Player_Action_info.json'),
            fetch('./GameData/Monster_info.json'),
            fetch('./GameData/Monster_Pattern_info.json'),
            fetch('./GameData/Monster_Skill_info.json'),
            fetch('./GameData/Stage_info.json')
        ]);

        const playerData = await playerRes.json();
        const actionData = await actionRes.json();
        const monsterData = await monsterRes.json();
        const patternData = await patternRes.json();
        const skillData = await skillRes.json();
        const stageData = await stageRes.json();

        console.log("데이터 로딩 완료! 게임 엔진을 초기화합니다.");

        const pData = normalizeRuntimeDataSet(playerData, 'player');
        const aData = normalizeRuntimeDataSet(actionData, 'action');
        const mData = normalizeRuntimeDataSet(monsterData, 'monster');
        const ptData = normalizeRuntimeDataSet(patternData, 'pattern');
        const sData = normalizeRuntimeDataSet(skillData, 'skill');
        const stData = normalizeRuntimeDataSet(stageData, 'stage');

        PlayerManager.init(pData, aData, gameState);
        MonsterManager.init(mData, ptData, sData, gameState);
        gameState.DB_STAGE = stData || [];

        if (gameState.DB_STAGE.length > 0) {
            const firstStage =
                gameState.DB_STAGE.find(stage => stage && stage.Stage_ID) ||
                gameState.DB_STAGE[0];

            if (firstStage && firstStage.Stage_ID) {
                gameState.currentStageId = firstStage.Stage_ID;
            }
        }

        GameRenderer.init(document.getElementById('gameCanvas'), gameState.WORLD_WIDTH);
        buildUIButtons();

        if (gameState.gameMode === 'STAGE' && gameState.currentStageId) {
            loadStage(gameState.currentStageId);
        }

        requestAnimationFrame(gameLoop);

    } catch (error) {
        console.error("데이터 로드 에러:", error);
        alert("게임 데이터를 불러오는 데 실패했습니다. 폴더명과 파일명을 확인해주세요.");
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

    // 새 게임 모드 전환
    if (e.code === 'F6') {
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

        if (gameState.targetUI.timer > 0) {
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
    const guideContent = document.getElementById('guideContent');
    if (!controls) return;

    const p = gameState.player || { level: 1, active: false };
    const dashReqLv = parseFloat((gameState.actions.find(a => a.Action_Name === '대쉬') || {}).Require_Level) || 2;
    const swapReqLv = parseFloat((gameState.actions.find(a => a.Action_Name === '공격 모드 변경') || {}).Require_Level) || 3;
    const waveReqLv = parseFloat((gameState.actions.find(a => a.Action_Name === '웨이브') || {}).Require_Level) || 4;
    const cannonReqLv = parseFloat((gameState.actions.find(a => a.Action_Name === '캐논볼') || {}).Require_Level) || 5;

    if (guideContent) {
        const modeText = gameState.gameMode === 'STAGE' ? '스테이지 진행' : '자유 소환';
        const testText = gameState.isTestMode ? 'ON' : 'OFF';
        const autoSpawnText = gameState.isAutoSpawn ? 'ON' : 'OFF';

        guideContent.innerHTML = `
            <span class="key-hint">방향키</span> 8방향 이동 (X, Y축)<br>
            <span class="key-hint">C</span> 점프 &nbsp; <span class="key-hint">Z</span> 대쉬 (Lv.${dashReqLv})<br>
            <span class="key-hint">X</span> 평타 &nbsp; <span class="key-hint">F</span> 무기 스왑 (Lv.${swapReqLv})<br>
            <span class="key-hint">A</span> 웨이브 (Lv.${waveReqLv}) &nbsp; <span class="key-hint">S</span> 캐논볼 (Lv.${cannonReqLv})<br>
            <span class="key-hint">F6</span> 모드 전환 (${modeText})<br>
            <span class="key-hint">T</span> 테스트 모드 (${testText})<br>
            <span class="key-hint">V</span> 3D 히트박스 디버그<br>
            ${gameState.gameMode === 'FREE_SPAWN'
                ? `<span class="key-hint">1~9</span> 몬스터 스포너 / 보스 강림<br><span class="key-hint">자동 스폰</span> ${autoSpawnText}`
                : `<span class="key-hint">목표</span> 적 처치 후 다음 워프 개방`
            }
        `;
    }

    controls.innerHTML = '';

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

        let swapAct = gameState.actions.find(a => a.Action_Name === '공격 모드 변경');
        let swapReq = swapAct ? (parseFloat(swapAct.Require_Level) || 0) : 0;
        let swapRatio = (swapAct && p.skillCooldowns[swapAct.Action_Name] > 0)
            ? (p.skillCooldowns[swapAct.Action_Name] / (parseFloat(swapAct.Cooltime) || 1)) * 100
            : 0;
        setLockAndMask('lockSwap', 'maskSwap', p.level >= swapReq, swapRatio);

        let dashAct = gameState.actions.find(a => a.Action_Name === '대쉬');
        let dashReq = dashAct ? (parseFloat(dashAct.Require_Level) || 0) : 0;
        let dashRatio = Math.max(0, (p.dashCooldownTimer || 0) / (p.maxDashCd || 1)) * 100;
        setLockAndMask('lockDash', 'maskDash', p.level >= dashReq, dashRatio);

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
            let html = `<b style="color:#3498db;">[Player]</b> X:${Math.round(p.x)} Y:${Math.round(p.y)} Z:${Math.round(p.z)}<br>`;
            html += `<b style="color:#2ecc71;">[Mode]</b> ${gameState.gameMode} | Test:${gameState.isTestMode ? 'ON' : 'OFF'} | Stance:${p.stance}<br>`;
            html += `<b style="color:#2ecc71;">[Spawners]</b> Active: ${gameState.spawners.length} | Entities: ${gameState.monsters.filter(m => m.active).length}<br>`;

            if (gameState.currentStage && gameState.gameMode === 'STAGE') {
                html += `<b style="color:#f1c40f;">[Stage]</b> ${gameState.currentStage.Stage_ID} - ${gameState.currentStage.Stage_Name}<br>`;
                html += `<b style="color:#9b59b6;">[Theme]</b> ${gameState.currentStage.Stage_Background_Type || 'DEFAULT'}<br>`;
                html += `<b style="color:#95a5a6;">[Clear]</b> ${gameState.isStageCleared ? 'YES' : 'NO'}<br>`;
                if (gameState.activeWarp) {
                    html += `<b style="color:#8e44ad;">[Warp]</b> X:${Math.round(gameState.activeWarp.x)} Y:${Math.round(gameState.activeWarp.y)} -> ${gameState.activeWarp.targetStageId}<br>`;
                }
            }

            if (gameState.targetUI.monster && gameState.targetUI.monster.active) {
                const m = gameState.targetUI.monster;
                const d = m.d;
                let dist = getDistance2D(p.x, p.y, m.x, m.y) - (p.bodyX * p.scale / 2) - (d.bodyX * m.scale / 2);
                const monsterGrade = String(d.grade || '').trim().toUpperCase();
                const isBoss = monsterGrade.includes('BOSS') || String(m.id || '').startsWith('B');
                const prefix = m.isChampion ? "[엘리트] " : (isBoss ? "[보스] " : "");
                const tColor = isBoss ? '#f1c40f' : (m.isChampion ? '#e74c3c' : '#e67e22');

                html += `<b style="color:${tColor};">[Target]</b> ${prefix}${d.name} | HP: ${Math.max(0, m.hp).toFixed(0)}/${m.maxHp} | State: ${m.state} | Dist: ${Math.round(dist)}<br>`;
                if (m.state === 'P_Evade') html += `<span style="color:#e74c3c;">[Evading]</span><br>`;
                if (m.isChampion) html += `<span style="color:#e74c3c;">[Champion]</span><br>`;
                if (m.spawnSource) html += `<span style="color:#95a5a6;">[Source] ${m.spawnSource}${m.isStageBoss ? ' / BOSS' : ''}</span><br>`;
            }

            debugPanel.innerHTML = html;
        }

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