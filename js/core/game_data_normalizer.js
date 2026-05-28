// [카시야스 보스전] 게임 데이터 정규화/런타임 테이블 구성 (game_data_normalizer.js)
// ==========================================
// 역할:
// - JSON 원본 데이터의 빈 값/주석 컬럼 정리
// - 구버전/신버전 컬럼명 호환 정규화
// - Boss_Pattern_Action_info를 Pattern_ID + Action_Order 기준 런타임 테이블로 구성
//
// 주의:
// - 실행 로직은 변경하지 않고, 기존 game_app.js에 있던 정규화 함수를 이동했다.
// ==========================================

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
    newRow.Pattern_Action_Source_ID = pickRuntimeValue(row.Pattern_Action_Source_ID, row.Action_Source_Pattern_ID, row.Pattern_Source_ID);
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
        // Pattern_Action_Source_ID가 있으면 선택/쿨타임은 현재 Pattern_ID를 사용하되,
        // 실제 액션 목록은 source 패턴의 액션을 재사용한다.
        const actionSourceId = String(pattern.Pattern_Action_Source_ID || '').trim() || patternId;
        pattern.Runtime_Action_Source_ID = actionSourceId;
        pattern.Runtime_Actions = actionsByPattern[actionSourceId] ? actionsByPattern[actionSourceId].map(action => ({ ...action, Runtime_Requested_Pattern_ID: patternId, Runtime_Action_Source_ID: actionSourceId })) : [];

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

window.GameDataNormalizer = {
    normalizeDataValue,
    normalizeDataArray,
    pickRuntimeValue,
    normalizePlayerRuntimeRow,
    normalizeActionRuntimeRow,
    normalizeMonsterRuntimeRow,
    normalizePatternRuntimeRow,
    normalizeSkillRuntimeRow,
    normalizeStageRuntimeRow,
    normalizeBossPhaseRuntimeRow,
    normalizeBossPatternRuntimeRow,
    normalizeBossPatternActionRuntimeRow,
    normalizeBossPatternObjectRuntimeRow,
    normalizeBossPatternObjectActionRuntimeRow,
    normalizeRuntimeDataSet,
    buildBossRuntimeTables
};
