// boss_phase_system.js
// Boss_Phase_info 기반 보스 페이즈 데이터 조회와 보스 런타임 초기화를 담당한다.
//
// 기존 MonsterManager 메서드와 호환되도록, 각 함수는 MonsterManager를 this로 받아 실행된다.

const BossPhaseSystem = {
    createBossRuntimeForMonster: function(d, gameState) {
        const isBossPatternData = (this && typeof this.isBossPatternData === 'function')
            ? this.isBossPatternData(d)
            : !!d && String(d.aiType || '').trim().toUpperCase() === 'BOSS_PATTERN';

        if (!isBossPatternData) return null;

        const phase = Object.values(gameState.DB_BOSS_PHASE || {})
            .filter(p => String(p.Phase_Monster_ID || '').trim() === String(d.id || '').trim())
            .sort((a, b) => (parseFloat(a.Phase_Order) || 0) - (parseFloat(b.Phase_Order) || 0))[0];

        if (!phase) return null;

        const patternSetId = String(d.patternSetId || '').trim();
        const patterns = gameState.DB_BOSS_PATTERN_BY_SET && gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
            ? gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
            : [];

        const patternCooldowns = {};
        for (const pattern of patterns) {
            const patternId = String(pattern.Pattern_ID || '').trim();
            if (!patternId) continue;
            patternCooldowns[patternId] = parseFloat(pattern.Pattern_Initial_Cooltime) || 0;
        }

        return {
            phase: phase,
            phaseId: String(phase.Phase_ID || '').trim(),
            patternSetId: patternSetId,
            patternCooldowns: patternCooldowns,
            activePattern: null,
            currentActionIndex: -1,
            currentLoopIndex: 0,
            loopCount: 1,
            action: null,
            actionHitFired: false,
            noPatternWaitTimer: 0,
            isLatePhase: false,
            lateNoticeShown: false,
            lateOpeningPatternUsed: false,
            lateOpeningPatternStarted: false,
            previewDashPath: null,
            currentDashPath: null,
            lastDashPath: null
        };
    },

    getBossLatePhaseThreshold: function(phase) {
        const raw = parseFloat(phase && phase.Late_Phase_HP_Rate);
        if (isNaN(raw)) return 0.5;
        return raw > 1 ? raw / 100 : raw;
    }
};

window.BossPhaseSystem = BossPhaseSystem;
