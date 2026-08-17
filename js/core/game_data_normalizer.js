// [카시야스 보스전] 게임 데이터 정규화/런타임 테이블 구성 (game_data_normalizer.js)
// ==========================================
// 역할:
// - JSON 원본 데이터의 빈 값/주석 컬럼 정리
// - 구버전/신버전 컬럼명 호환 정규화
// - Monster_Pattern_Action_info를 Pattern_ID + Action_Order 기준 런타임 테이블로 구성
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

// Dev_Name은 데이터 작성/참조용 고유키이고, 실제 전투 Runtime은 숫자 ID를 사용한다.
// 아래 인덱스는 JSON 원본의 Dev_Name 참조를 로딩 시 숫자 ID로 해석하기 위한 공용 변환 계층이다.
const runtimeReferenceIndex = {
    byDevName: Object.create(null)
};

function buildRuntimeReferenceIndex(rawData) {
    const byDevName = Object.create(null);

    const register = (rows, idKey, devKey = 'Dev_Name') => {
        (Array.isArray(rows) ? rows : []).forEach(row => {
            if (!row) return;
            const devName = String(row[devKey] || '').trim();
            const idValue = row[idKey];
            if (!devName || idValue === null || idValue === undefined || String(idValue).trim() === '') return;
            const existing = byDevName[devName];
            if (existing !== undefined && String(existing) !== String(idValue)) {
                throw new Error(`Dev_Name 중복 참조 오류: ${devName} -> ${existing} / ${idValue}`);
            }
            byDevName[devName] = idValue;
        });
    };

    register(rawData && rawData.playerData, 'Character_ID');
    register(rawData && rawData.actionData, 'Action_ID');
    register(rawData && rawData.monsterData, 'Monster_ID');
    register(rawData && rawData.monsterPatternData, 'Pattern_ID');
    register(rawData && rawData.monsterPatternActionData, 'Action_ID');
    register(rawData && rawData.monsterPatternObjectData, 'Object_ID');
    register(rawData && rawData.monsterPatternObjectActionData, 'Object_Action_ID');
    register(rawData && rawData.stageData, 'Stage_ID');
    register(rawData && rawData.portalData, 'Portal_ID');
    register(rawData && rawData.dialogueData, 'Dialogue_ID');
    register(rawData && rawData.specialModeData, 'Special_Mode_ID');
    register(rawData && rawData.specialModePlayerData, 'Character_ID');
    register(rawData && rawData.specialModeObjectData, 'Object_ID');
    register(rawData && rawData.specialModeObjectActionData, 'Object_Action_ID');

    // Pattern Set은 별도 시트가 없으므로 Monster_Pattern_info의 논리 그룹키를 등록한다.
    register(rawData && rawData.monsterPatternData, 'Pattern_Set_ID', 'Pattern_Set_Dev_Name');

    runtimeReferenceIndex.byDevName = byDevName;
    return byDevName;
}

function resolveRuntimeReference(value) {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'string') return value;

    const raw = value.trim();
    if (!raw) return null;

    if (Object.prototype.hasOwnProperty.call(runtimeReferenceIndex.byDevName, raw)) {
        return runtimeReferenceIndex.byDevName[raw];
    }

    // Dialogue_Line 참조처럼 "Dialogue_...:03" 형태는 Dev_Name 부분만 ID로 치환한다.
    const lineMatch = raw.match(/^(.+):(\d+)$/);
    if (lineMatch && Object.prototype.hasOwnProperty.call(runtimeReferenceIndex.byDevName, lineMatch[1])) {
        return `${runtimeReferenceIndex.byDevName[lineMatch[1]]}:${parseInt(lineMatch[2], 10) || 0}`;
    }

    return value;
}

function resolveRuntimeValueFields(row) {
    const newRow = { ...row };
    for (const key of Object.keys(newRow)) {
        if (!key || !key.endsWith('_Value')) continue;
        newRow[key] = resolveRuntimeReference(newRow[key]);
    }
    return newRow;
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

    // #Action_Name은 기획 관리 전용으로 JSON에서 제외된다.
    // Runtime의 Action_Name 호환 필드는 Dev_Name을 사용해 기존 쿨타임/디버그 경로를 유지한다.
    newRow.Action_Name = pickRuntimeValue(
        row.Action_Name,
        row.Name,
        row.Dev_Name,
        newRow.Action_ID
    );

    return newRow;
}

function normalizeMonsterRuntimeRow(row) {
    const newRow = { ...row };

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

    // 원본 데이터는 사람이 읽기 쉬운 Dev_Name으로 외부 참조한다.
    // Runtime에는 기존 숫자 ID 필드를 만들어 안정판 전투 로직과 연결한다.
    newRow.Pattern_Set_ID = resolveRuntimeReference(pickRuntimeValue(
        row.Pattern_Set_ID,
        row.Ref_Pattern_Set
    ));
    newRow.Next_Boss_ID = resolveRuntimeReference(pickRuntimeValue(
        row.Next_Boss_ID,
        row.Next_Monster
    ));

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
    const newRow = resolveRuntimeValueFields(row);

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

    newRow.Next_Stage_ID = resolveRuntimeReference(pickRuntimeValue(
        row.Next_Stage,
        row.Next_Stage_ID,
        row.Next_Stage_Code
    ));

    newRow.Spawn_Monster_1_ID = resolveRuntimeReference(pickRuntimeValue(row.Spawn_Monster_1, row.Spawn_Monster_1_ID));
    newRow.Spawn_Monster_2_ID = resolveRuntimeReference(pickRuntimeValue(row.Spawn_Monster_2, row.Spawn_Monster_2_ID));
    newRow.Spawn_Monster_3_ID = resolveRuntimeReference(pickRuntimeValue(row.Spawn_Monster_3, row.Spawn_Monster_3_ID));

    newRow.Spawn_Monster_1_Count = pickRuntimeValue(row.Spawn_Count_1, row.Spawn_Monster_1_Count);
    newRow.Spawn_Monster_2_Count = pickRuntimeValue(row.Spawn_Count_2, row.Spawn_Monster_2_Count);
    newRow.Spawn_Monster_3_Count = pickRuntimeValue(row.Spawn_Count_3, row.Spawn_Monster_3_Count);

    // Monster 일반화된 Stage Spawn 컬럼을 기존 Runtime alias에도 연결한다.
    newRow.Map_Size_X = pickRuntimeValue(row.Map_Size_X, row.Stage_Width);
    newRow.Map_Size_Y = pickRuntimeValue(row.Map_Size_Y, row.Stage_Height);
    newRow.Player_Start_Center_X = pickRuntimeValue(row.Player_Start_Center_X, row.Player_Spawn_X);
    newRow.Player_Start_Center_Y = pickRuntimeValue(row.Player_Start_Center_Y, row.Player_Spawn_Y);
    newRow.Boss_Spawn_X = pickRuntimeValue(row.Boss_Spawn_X, row.Monster_Spawn_X);
    newRow.Boss_Spawn_Y = pickRuntimeValue(row.Boss_Spawn_Y, row.Monster_Spawn_Y);
    newRow.Boss_Spawn_Center_X = pickRuntimeValue(row.Boss_Spawn_Center_X, row.Monster_Spawn_X, row.Boss_Spawn_X);
    newRow.Boss_Spawn_Center_Y = pickRuntimeValue(row.Boss_Spawn_Center_Y, row.Monster_Spawn_Y, row.Boss_Spawn_Y);

    newRow.Stage_Background_Type = pickRuntimeValue(
        row.Stage_Background_Type,
        row.Background_Render_Type,
        row.Background_Type
    );

    newRow.Stage_Clear_Cond_Value = resolveRuntimeReference(newRow.Stage_Clear_Cond_Value);
    newRow.Stage_Clear_Type = pickRuntimeValue(row.Stage_Clear_Type, 'KILL_BOSS');

    return newRow;
}

function normalizeBossPatternRuntimeRow(row) {
    const newRow = resolveRuntimeValueFields(row);
    newRow.Pattern_ID = pickRuntimeValue(row.Pattern_ID, row.Dev_Name);
    newRow.Pattern_Set_ID = pickRuntimeValue(row.Pattern_Set_ID, resolveRuntimeReference(row.Pattern_Set_Dev_Name), row.Pattern_Set);
    newRow.Pattern_Action_Source_ID = resolveRuntimeReference(pickRuntimeValue(
        row.Pattern_Action_Source_ID,
        row.Ref_Action_Source,
        row.Action_Source_Pattern_ID,
        row.Pattern_Source_ID
    ));
    return newRow;
}

function normalizeBossPatternActionRuntimeRow(row) {
    const newRow = resolveRuntimeValueFields(row);
    newRow.Action_ID = pickRuntimeValue(row.Action_ID, row.Dev_Name);
    newRow.Action_Name = pickRuntimeValue(row.Action_Name, row.Dev_Name, newRow.Action_ID);
    newRow.Pattern_ID = resolveRuntimeReference(pickRuntimeValue(row.Pattern_ID, row.Ref_Pattern, row.Owner_Pattern_ID));
    newRow.Spawn_Object_ID = resolveRuntimeReference(pickRuntimeValue(row.Spawn_Object_ID, row.Object_Spawn));
    newRow.Call_Object_Action_ID = resolveRuntimeReference(pickRuntimeValue(row.Call_Object_Action_ID, row.Obj_Act_Call, row.Object_Action_ID));
    newRow.Change_Boss_ID = resolveRuntimeReference(pickRuntimeValue(row.Change_Boss_ID, row.Monster_Change));
    newRow.Ref_Special_Mode = resolveRuntimeReference(newRow.Ref_Special_Mode);
    newRow.Action_Boss_Gaze = pickRuntimeValue(row.Action_Boss_Gaze, row.Action_Gaze, row.Boss_Gaze);

    newRow.Action_Condition_Value = resolveRuntimeReference(newRow.Action_Condition_Value);
    newRow.Guard_Special_Result_Value = resolveRuntimeReference(newRow.Guard_Special_Result_Value);
    newRow.Guard_Special_Result_Cost_Value = resolveRuntimeReference(newRow.Guard_Special_Result_Cost_Value);
    newRow.Parry_Result_Value = resolveRuntimeReference(newRow.Parry_Result_Value);

    newRow.VFX_Type = pickRuntimeValue(row.VFX_Type, row.Effect_Render_Type, row.Action_Effect_Render_Type);
    newRow.Effect_Render_Type = pickRuntimeValue(row.Effect_Render_Type, newRow.VFX_Type);
    newRow.Warning_Render_Type = pickRuntimeValue(row.Warning_Render_Type, row.Warning_Effect_Render_Type);
    return newRow;
}

function normalizeBossPatternObjectRuntimeRow(row) {
    const newRow = resolveRuntimeValueFields(row);
    newRow.Object_ID = pickRuntimeValue(row.Object_ID, row.Attack_Object_ID, row.Dev_Name);
    newRow.Object_Name = pickRuntimeValue(row.Object_Name, row.Dev_Name, newRow.Object_ID);
    newRow.Attack_Object_ID = pickRuntimeValue(row.Attack_Object_ID, newRow.Object_ID, row.Dev_Name);
    newRow.Aim_Fire_Object_ID = resolveRuntimeReference(pickRuntimeValue(row.Aim_Fire_Object_ID, row.Object_Fire));
    newRow.Object_Field_Target_Object_ID = resolveRuntimeReference(pickRuntimeValue(row.Object_Field_Target_Object_ID, row.Field_Target_Object));
    newRow.VFX_Type = pickRuntimeValue(row.VFX_Type, row.Effect_Render_Type, row.Action_Effect_Render_Type);
    newRow.Effect_Render_Type = pickRuntimeValue(row.Effect_Render_Type, newRow.VFX_Type);
    return newRow;
}

function normalizeBossPatternObjectActionRuntimeRow(row) {
    const newRow = resolveRuntimeValueFields(row);
    newRow.Object_Action_ID = pickRuntimeValue(row.Object_Action_ID, row.Dev_Name);
    newRow.Object_Action_Name = pickRuntimeValue(row.Object_Action_Name, row.Dev_Name, newRow.Object_Action_ID);
    newRow.Pattern_ID = resolveRuntimeReference(pickRuntimeValue(row.Pattern_ID, row.Ref_Pattern, row.Owner_Pattern_ID));
    newRow.Object_ID = resolveRuntimeReference(pickRuntimeValue(row.Object_ID, row.Ref_Object, row.Attack_Object_ID, row.Owner_Object_ID));
    newRow.VFX_Type = pickRuntimeValue(row.VFX_Type, row.Effect_Render_Type, row.Action_Effect_Render_Type);
    newRow.Effect_Render_Type = pickRuntimeValue(row.Effect_Render_Type, newRow.VFX_Type);
    newRow.Warning_Render_Type = pickRuntimeValue(row.Warning_Render_Type, row.Warning_Effect_Render_Type);
    return newRow;
}

function normalizePortalRuntimeRow(row) {
    const newRow = resolveRuntimeValueFields(row);
    newRow.Portal_Name = pickRuntimeValue(row.Portal_Name, row.Dev_Name, row.Portal_ID);
    newRow.From_Stage_ID = resolveRuntimeReference(pickRuntimeValue(row.From_Stage_ID, row.Stage_From));
    newRow.To_Stage_ID = resolveRuntimeReference(pickRuntimeValue(row.To_Stage_ID, row.Stage_To));
    newRow.Active_Cond_Value = resolveRuntimeReference(newRow.Active_Cond_Value);
    newRow.DeActive_Cond_Value = resolveRuntimeReference(newRow.DeActive_Cond_Value);
    return newRow;
}

function normalizeDialogueRuntimeRow(row) {
    const newRow = resolveRuntimeValueFields(row);
    newRow.Dialogue_Name = pickRuntimeValue(row.Dialogue_Name, row.Dev_Name, row.Dialogue_ID);
    newRow.Trigger_Value = resolveRuntimeReference(newRow.Trigger_Value);
    return newRow;
}

function normalizeSpecialModeRuntimeRow(row) {
    const newRow = { ...row };
    newRow.Special_Mode_ID = pickRuntimeValue(row.Special_Mode_ID, row.Dev_Name);
    newRow.Special_Mode_Name = pickRuntimeValue(row.Special_Mode_Name, row.Dev_Name, newRow.Special_Mode_ID);
    newRow.Ref_Use_Content = resolveRuntimeReference(newRow.Ref_Use_Content);
    newRow.Ref_Player = resolveRuntimeReference(newRow.Ref_Player);
    return newRow;
}

function normalizeSpecialModePlayerRuntimeRow(row) {
    const newRow = { ...row };
    // Runtime compatibility aliases: data columns are generic; the current object-defense handler
    // can keep its proven input code while reading the generalized schema.
    newRow.Guard_Gauge_Regen_Per_sec = pickRuntimeValue(row.Guard_Gauge_Regen_Per_sec, row.Guard_Gauge_Regen_Per_Sec);
    newRow.Player_Start_Lane = pickRuntimeValue(row.Player_Start_Lane, row.Player_Start_Position_Value);
    newRow.Lane_Move_Time = pickRuntimeValue(row.Lane_Move_Time, row.Player_Move_Time);
    newRow.ATK_Range_Tile = pickRuntimeValue(row.ATK_Range_Tile, row.ATK_Hitbox_Size_X);
    newRow.ATK_Range_Y = pickRuntimeValue(row.ATK_Range_Y, row.ATK_Hitbox_Size_Y);
    newRow.Guard_Range_Tile = pickRuntimeValue(row.Guard_Range_Tile, row.Guard_Hitbox_Size_X);
    newRow.Guard_Range_Y = pickRuntimeValue(row.Guard_Range_Y, row.Guard_Hitbox_Size_Y);
    newRow.Skill_Range_Tile = pickRuntimeValue(row.Skill_Range_Tile, row.Skill_Hitbox_Size_X);
    newRow.Skill_Wave_Height = pickRuntimeValue(row.Skill_Wave_Height, row.Skill_Hitbox_Size_Y);
    newRow.Skill_Wave_Speed = pickRuntimeValue(row.Skill_Wave_Speed, row.Skill_Move_Speed);
    newRow.Skill_Wave_Life = pickRuntimeValue(row.Skill_Wave_Life, row.Skill_Duration);
    return newRow;
}

function normalizeSpecialModeObjectRuntimeRow(row) {
    const newRow = { ...row };
    newRow.Object_ID = pickRuntimeValue(row.Object_ID, row.Dev_Name);
    newRow.Object_Name = pickRuntimeValue(row.Object_Name, row.Dev_Name, newRow.Object_ID);
    // Compatibility aliases used only inside the current OBJECT_DEFENSE handler/renderer.
    newRow.Slash_Type_ID = newRow.Object_ID;
    newRow.Slash_Name = newRow.Object_Name;
    newRow.Lane_Size = pickRuntimeValue(row.Lane_Size, row.Object_Hitbox_Size_X);
    newRow.Slash_HP = pickRuntimeValue(row.Slash_HP, row.Object_HP);
    newRow.HP_Per_Lane = pickRuntimeValue(row.HP_Per_Lane, row.Object_Part_HP);
    newRow.Slash_Damage = pickRuntimeValue(row.Slash_Damage, row.Object_Damage);
    newRow.Can_Attack_Destroy = String(row.ATK_Result_Type || '').trim().toUpperCase() === 'DAMAGE';
    newRow.Can_Guard_Push = String(row.Guard_Result_Type || '').trim().toUpperCase() === 'PUSH';
    newRow.Guard_Rebound_Speed = pickRuntimeValue(row.Guard_Rebound_Speed, row.Guard_Result_Move_Speed);
    newRow.Guard_Rebound_Distance = pickRuntimeValue(row.Guard_Rebound_Distance, row.Guard_Result_Move_Distance);
    newRow.Can_Skill_Hit = !['', 'NONE'].includes(String(row.Skill_Result_Type || '').trim().toUpperCase());
    newRow.From_Skill_Damage = pickRuntimeValue(row.From_Skill_Damage, row.Skill_Result_Value);
    newRow.Warning_Render_Type = pickRuntimeValue(row.Warning_Render_Type, row.Warning_Effect_Render_Type);
    newRow.Slash_Render_Type = pickRuntimeValue(row.Slash_Render_Type, row.Object_Render_Type);
    return newRow;
}

function normalizeSpecialModeObjectActionRuntimeRow(row) {
    const newRow = { ...row };
    newRow.Object_Action_ID = pickRuntimeValue(row.Object_Action_ID, row.Dev_Name);
    newRow.Ref_Special_Mode = resolveRuntimeReference(newRow.Ref_Special_Mode);
    newRow.Ref_Object = resolveRuntimeReference(newRow.Ref_Object);
    // Compatibility aliases for the existing group/spawn execution path.
    newRow.Wave_ID = pickRuntimeValue(row.Wave_ID, row.Action_Group);
    newRow.Wave_Order = pickRuntimeValue(row.Wave_Order, row.Action_Group);
    newRow.Spawn_Order = pickRuntimeValue(row.Spawn_Order, row.Action_Order);
    newRow.Slash_Type_ID = pickRuntimeValue(row.Slash_Type_ID, newRow.Ref_Object);
    newRow.Lane_Select_Type = pickRuntimeValue(row.Lane_Select_Type, row.Object_Start_Position_Type);
    newRow.Lane_Value = pickRuntimeValue(row.Lane_Value, row.Object_Start_Position_Value);
    newRow.Use_Same_Lane = pickRuntimeValue(row.Use_Same_Lane, row.Allow_Repeat_Position);
    newRow.Warning_Time = pickRuntimeValue(row.Warning_Time, row.Warning_Duration);
    newRow.Fall_Time_Rate = pickRuntimeValue(row.Fall_Time_Rate, row.Object_Move_Time_Rate);
    newRow.Next_Spawn_Delay = pickRuntimeValue(row.Next_Spawn_Delay, row.Next_Action_Delay);
    newRow.Initial_Fall_Speed = pickRuntimeValue(row.Initial_Fall_Speed, row.Object_Move_Speed);
    newRow.Gravity = pickRuntimeValue(row.Gravity, row.Object_Move_Value);
    newRow.Max_Fall_Speed = pickRuntimeValue(row.Max_Fall_Speed, row.Object_Move_Max_Speed);
    return newRow;
}

function buildBossRuntimeTables(patternData, actionData, objectData, objectActionData) {
    gameState.DB_BOSS_PATTERN = {};
    gameState.DB_BOSS_PATTERN_BY_SET = {};
    gameState.DB_BOSS_PATTERN_ACTION = {};
    gameState.DB_BOSS_PATTERN_OBJECT = {};
    gameState.DB_BOSS_PATTERN_OBJECT_ACTION = {};
    gameState.DB_BOSS_PATTERN_OBJECT_ACTION_BY_OBJECT = {};

    const actionsByPattern = {};
    (actionData || []).forEach(action => {
        const actionId = String(action.Action_ID || '').trim();
        const patternId = String(action.Pattern_ID || '').trim();

        if (actionId) gameState.DB_BOSS_PATTERN_ACTION[actionId] = action;
        if (patternId) {
            const cond = String(action.Action_Condition_Type || '').trim().toUpperCase();
            if (cond === 'P3_M3_ROUTE_ACTION_ONLY') return;
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

        // 우선 Monster_Pattern_Action_info의 Pattern_ID + Action_Order 구조를 사용한다.
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
    if (type === 'bossPattern') return rows.map(normalizeBossPatternRuntimeRow);
    if (type === 'bossPatternAction') return rows.map(normalizeBossPatternActionRuntimeRow);
    if (type === 'bossPatternObject') return rows.map(normalizeBossPatternObjectRuntimeRow);
    if (type === 'bossPatternObjectAction') return rows.map(normalizeBossPatternObjectActionRuntimeRow);
    if (type === 'portal') return rows.map(normalizePortalRuntimeRow);
    if (type === 'dialogue') return rows.map(normalizeDialogueRuntimeRow);
    if (type === 'specialMode') return rows.map(normalizeSpecialModeRuntimeRow);
    if (type === 'specialModePlayer') return rows.map(normalizeSpecialModePlayerRuntimeRow);
    if (type === 'specialModeObject') return rows.map(normalizeSpecialModeObjectRuntimeRow);
    if (type === 'specialModeObjectAction') return rows.map(normalizeSpecialModeObjectActionRuntimeRow);

    return rows;
}

window.GameDataNormalizer = {
    normalizeDataValue,
    normalizeDataArray,
    pickRuntimeValue,
    buildRuntimeReferenceIndex,
    resolveRuntimeReference,
    normalizePlayerRuntimeRow,
    normalizeActionRuntimeRow,
    normalizeMonsterRuntimeRow,
    normalizePatternRuntimeRow,
    normalizeSkillRuntimeRow,
    normalizeStageRuntimeRow,
    normalizeBossPatternRuntimeRow,
    normalizeBossPatternActionRuntimeRow,
    normalizeBossPatternObjectRuntimeRow,
    normalizeBossPatternObjectActionRuntimeRow,
    normalizePortalRuntimeRow,
    normalizeDialogueRuntimeRow,
    normalizeSpecialModeRuntimeRow,
    normalizeSpecialModePlayerRuntimeRow,
    normalizeSpecialModeObjectRuntimeRow,
    normalizeSpecialModeObjectActionRuntimeRow,
    normalizeRuntimeDataSet,
    buildBossRuntimeTables
};
