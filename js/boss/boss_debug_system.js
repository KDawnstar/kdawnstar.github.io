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

    // 제출용 Normal / Guide에서는 상세 로그 패널을 표시하지 않으므로 시간 문자열/로그 객체 생성 비용을 생략한다.
    // Developer 모드에서만 기존 디버그 로그를 그대로 유지한다.
    isBossDebugLoggingEnabled: function(gameState) {
        return String(gameState && gameState.presentationMode || '').trim().toUpperCase() === 'DEVELOPER';
    },

    pushBossDebugLog: function(gameState, type, message, detail) {
        if (!this.isBossDebugLoggingEnabled(gameState)) return;
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
