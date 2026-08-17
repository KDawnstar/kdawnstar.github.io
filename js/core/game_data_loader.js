// [카시야스 보스전] JSON 데이터 로더 (game_data_loader.js)
// ==========================================
// 역할:
// - GameData 폴더의 JSON 파일을 불러온다.
// - 데이터 정규화/초기화는 담당하지 않는다.
// - 로드 대상 목록을 한곳에서 관리한다.
// ==========================================

const GameDataLoader = {
    paths: {
        playerData: './GameData/Player_info.json',
        actionData: './GameData/Player_Action_info.json',
        monsterData: './GameData/Monster_info.json',
        monsterPatternData: './GameData/Monster_Pattern_info.json',
        monsterPatternActionData: './GameData/Monster_Pattern_Action_info.json',
        monsterPatternObjectData: './GameData/Monster_Pattern_Object_info.json',
        monsterPatternObjectActionData: './GameData/Monster_Pattern_Obj_Action_info.json',
        stageData: './GameData/Stage_info.json',
        specialModeData: './GameData/Special_Mode_info.json',
        specialModePlayerData: './GameData/Special_Mode_Player_info.json',
        specialModeObjectData: './GameData/Special_Mode_Object_info.json',
        specialModeObjectActionData: './GameData/Special_Mode_Object_Action_info.json',
        portalData: './GameData/Portal_info.json',
        dialogueData: './GameData/Dialogue_info.json'
    },

    async fetchJson(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`데이터 로드 실패: ${path} (${response.status})`);
        }
        return response.json();
    },

    async loadAllGameData() {
        const entries = Object.entries(this.paths);
        const loaded = await Promise.all(entries.map(([key, path]) => {
            return this.fetchJson(path).then(data => [key, data]);
        }));

        return loaded.reduce((result, [key, data]) => {
            result[key] = data;
            return result;
        }, {});
    }
};

window.GameDataLoader = GameDataLoader;
