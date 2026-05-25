// boss_debug_system.js
// 보스 패턴 확인/로그/내보내기용 디버그 상태를 관리한다.
// 게임 로직은 변경하지 않고, monster_runtime_system.js에 있던 디버그 유틸만 분리했다.

const BossDebugSystem = {
    ensureBossDebug: function(gameState) {
        if (!gameState.bossDebug) {
            gameState.bossDebug = {
                patternCheck: null,
                currentAction: null,
                currentObjectAction: null,
                logs: [],
                exportLogs: []
            };
        }

        if (!Array.isArray(gameState.bossDebug.logs)) gameState.bossDebug.logs = [];
        if (!Array.isArray(gameState.bossDebug.exportLogs)) gameState.bossDebug.exportLogs = [];
        return gameState.bossDebug;
    },

    getBossDebugName: function(data) {
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
    },

    pushBossDebugLog: function(gameState, type, message, detail) {
        const debug = this.ensureBossDebug(gameState);
        const msg = String(message || '').trim();
        if (!msg) return;

        const now = new Date();
        const entry = {
            type: String(type || 'INFO').trim(),
            message: msg,
            detail: detail || '',
            time: now.toLocaleTimeString(),
            absoluteTime: now.toISOString()
        };

        debug.logs.unshift(entry);
        debug.exportLogs.push(entry);

        if (debug.logs.length > 18) debug.logs.length = 18;
        if (debug.exportLogs.length > 3000) {
            debug.exportLogs.splice(0, debug.exportLogs.length - 3000);
        }
    }
};
