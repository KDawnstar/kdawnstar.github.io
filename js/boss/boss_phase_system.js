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
    },

    getBossNextPhase: function(phase, gameState) {
        const nextPhaseId = String(phase && phase.Next_Phase_ID || '').trim();
        if (!nextPhaseId || nextPhaseId === '0') return null;
        return gameState && gameState.DB_BOSS_PHASE ? gameState.DB_BOSS_PHASE[nextPhaseId] || null : null;
    },

    clearBossPhaseTransitionRuntime: function(m, gameState) {
        const boss = m && m.boss ? m.boss : null;
        if (boss) {
            boss.activePattern = null;
            boss.currentActionIndex = -1;
            boss.currentLoopIndex = 0;
            boss.loopCount = 1;
            boss.action = null;
            boss.runtimeActions = null;
            boss.actionHitFired = false;
            boss.actionHitsDone = 0;
            boss.actionCycleTimer = 0;
            boss.previewDashPath = null;
            boss.currentDashPath = null;
            boss.lastDashPath = null;
            boss.actionMove = null;
            boss.parryWindowActive = false;
            boss.parryCueTimer = 0;
            boss.groggyTimer = 0;
            boss.groggyMaxTime = 0;
            boss.groggyPoseType = null;
            boss.majorPattern1Runtime = null;
            boss.majorPattern2Runtime = null;
            boss.majorPattern3Runtime = null;
            boss.pattern4Runtime = null;
            boss.kasiyasP1M3RushHidden = false;
        }

        if (gameState) {
            gameState.hitboxes = [];
            gameState.projectiles = [];
            gameState.auras = [];
            gameState.effects = [];
            gameState.bossAttackObjects = [];
            gameState.bossPatternDialogue = null;
            if (gameState.bossDebug) {
                gameState.bossDebug.currentAction = null;
                gameState.bossDebug.currentObjectAction = null;
            }

            const p = gameState.player;
            if (p) {
                p.kasiyasApostleEnergies = [];
                p.kasiyasApostleGuardBuffs = [];
                p.kasiyasApostleEnergyFlashTimer = 0;
                p.kasiyasApostleEnergyGetLockTimer = 0;
                p.kasiyasOniMark = null;
                p.kasiyasTemperedBladeReady = false;
                p.kasiyasTemperedBladeFlashTimer = 0;
                p.kasiyasOniMarkGuardBuff = null;
            }
        }
    },

    startBossPhaseTransition: function(m, gameState) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !boss.phase || !gameState) return false;
        if (boss.phaseTransition && boss.phaseTransition.active) return true;

        const nextPhase = this.getBossNextPhase(boss.phase, gameState);
        if (!nextPhase) return false;

        const transitionType = String(boss.phase.Phase_Transition_Type || '').trim();
        const durationRaw = parseFloat(boss.phase.Phase_Transition_Duration);
        const duration = !isNaN(durationRaw) && durationRaw > 0 ? durationRaw : 10.0;
        const restoreType = String(boss.phase.Next_Phase_HP_Restore_Type || 'FULL').trim().toUpperCase();
        const startText = String(boss.phase.Next_Phase_Start_Text || nextPhase.Phase_Name || '다음 페이즈 돌입').trim();

        this.clearBossPhaseTransitionRuntime(m, gameState);

        const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 2000);
        const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 300);
        const targetX = Math.max(220, Math.min(worldW - 180, worldW * 0.74));
        const targetY = Math.max(55, Math.min(worldD - 45, worldD * 0.50));
        const dx = targetX - (parseFloat(m.x) || 0);
        const dy = targetY - (parseFloat(m.y) || 0);
        const moveDist = Math.sqrt(dx * dx + dy * dy);
        const preMoveDuration = Math.max(0.9, Math.min(2.2, moveDist / 420));

        m.state = 'IDLE';
        m.timer = 0;
        m.deadTimer = 0;
        m.isDeadProcessed = false;
        m.kbVx = 0;
        m.kbVy = 0;
        m.vz = 0;
        m.isGrounded = true;
        // 전환 준비/컷신 중에는 실제 사망 처리를 막고, UI상 HP 0 상태를 유지한다.
        m.hp = 0;
        m.faceDir = targetX >= worldW * 0.50 ? -1 : 1;

        const transition = {
            active: true,
            phase: 'PRE_MOVE',
            type: transitionType || 'DEFAULT_BOSS_PHASE_TRANSITION',
            timer: 0,
            duration: duration,
            progress: 0,
            preMoveTimer: 0,
            preMoveDuration: preMoveDuration,
            preMoveStartX: parseFloat(m.x) || 0,
            preMoveStartY: parseFloat(m.y) || 0,
            preMoveTargetX: targetX,
            preMoveTargetY: targetY,
            boss: m,
            fromPhaseId: String(boss.phase.Phase_ID || '').trim(),
            nextPhaseId: String(nextPhase.Phase_ID || '').trim(),
            nextPhase: nextPhase,
            restoreType: restoreType,
            startText: startText,
            initialHp: 0
        };

        boss.phaseTransition = transition;
        gameState.phaseTransition = transition;
        gameState.screenHitFlash = { life: 0.32, maxLife: 0.32, strength: 0.55, mode: 'red' };
        if (gameState.targetUI && gameState.targetUI.monster === m) gameState.targetUI.timer = 999999;

        if (typeof pushSystemNotice === 'function') {
            pushSystemNotice('카시야스가 차원을 열기 시작합니다', '#c0392b', 1.8);
        }
        if (typeof this.pushBossDebugLog === 'function') {
            this.pushBossDebugLog(gameState, 'PHASE', String(transition.fromPhaseId || '') + ' → ' + String(transition.nextPhaseId || ''), transition.type);
        }
        return true;
    },

    updateBossPhaseTransition: function(m, deltaTime, gameState) {
        const boss = m && m.boss ? m.boss : null;
        const transition = boss && boss.phaseTransition && boss.phaseTransition.active
            ? boss.phaseTransition
            : (gameState && gameState.phaseTransition && gameState.phaseTransition.active ? gameState.phaseTransition : null);
        if (!transition) return false;

        const dt = Math.max(0, deltaTime || 0);
        const phase = String(transition.phase || 'CUTSCENE').toUpperCase();

        m.state = 'IDLE';
        m.timer = 0;
        m.kbVx = 0;
        m.kbVy = 0;
        m.vz = 0;
        m.isGrounded = true;
        // 페이즈 전환 준비/컷신 중에는 HP 0을 유지하되, 사망 처리는 이 함수가 가로챈다.
        m.hp = 0;

        if (phase === 'PRE_MOVE') {
            transition.preMoveTimer = Math.min(transition.preMoveDuration || 1.2, (parseFloat(transition.preMoveTimer) || 0) + dt);
            const moveT = Math.max(0, Math.min(1, transition.preMoveTimer / Math.max(0.001, transition.preMoveDuration || 1.2)));
            const eased = 1 - Math.pow(1 - moveT, 3);
            const sx = parseFloat(transition.preMoveStartX);
            const sy = parseFloat(transition.preMoveStartY);
            const tx = parseFloat(transition.preMoveTargetX);
            const ty = parseFloat(transition.preMoveTargetY);
            if (Number.isFinite(sx) && Number.isFinite(tx)) m.x = sx + (tx - sx) * eased;
            if (Number.isFinite(sy) && Number.isFinite(ty)) m.y = sy + (ty - sy) * eased;
            const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 2000);
            m.faceDir = (parseFloat(m.x) || 0) >= worldW * 0.50 ? -1 : 1;
            transition.progress = 0;

            if (moveT >= 1) {
                transition.phase = 'CUTSCENE';
                transition.timer = 0;
                transition.progress = 0;
                m.x = Number.isFinite(tx) ? tx : m.x;
                m.y = Number.isFinite(ty) ? ty : m.y;
                if (gameState) gameState.screenHitFlash = { life: 0.20, maxLife: 0.20, strength: 0.30, mode: 'red' };
                if (typeof pushSystemNotice === 'function') {
                    pushSystemNotice('카시야스가 두 번째 검을 불러냅니다', '#c0392b', 1.4);
                }
            }
            return true;
        }

        transition.phase = 'CUTSCENE';
        transition.timer = Math.min(transition.duration, (parseFloat(transition.timer) || 0) + dt);
        transition.progress = Math.max(0, Math.min(1, transition.timer / Math.max(0.001, transition.duration || 1)));

        if (transition.timer >= transition.duration) {
            this.finishBossPhaseTransition(m, gameState, transition);
        }
        return true;
    },

    finishBossPhaseTransition: function(m, gameState, transition) {
        const boss = m && m.boss ? m.boss : null;
        transition = transition || (boss && boss.phaseTransition) || (gameState && gameState.phaseTransition);
        if (!m || !gameState || !transition) return false;

        const nextPhase = transition.nextPhase || (gameState.DB_BOSS_PHASE ? gameState.DB_BOSS_PHASE[String(transition.nextPhaseId || '').trim()] : null);
        if (!nextPhase) return false;

        const nextMonsterId = String(nextPhase.Phase_Monster_ID || '').trim();
        const nextData = gameState.DB_MONSTER ? gameState.DB_MONSTER[nextMonsterId] || null : null;
        if (!nextData) return false;

        const keepX = m.x;
        const keepY = m.y;
        const keepZ = m.z;
        const keepFace = m.faceDir || 1;
        const isStageBoss = !!m.isStageBoss;
        const spawnSource = m.spawnSource || null;

        m.id = nextData.id;
        m.d = nextData;
        m.scale = parseFloat(nextData.scale) || 1;
        m.x = keepX;
        m.y = keepY;
        m.z = keepZ;
        m.faceDir = keepFace;
        m.isStageBoss = isStageBoss;
        m.spawnSource = spawnSource;
        m.active = true;
        m.state = 'IDLE';
        m.prevState = 'NONE';
        m.forcePrevState = null;
        m.timer = 0;
        m.deadTimer = 0;
        m.isDeadProcessed = false;
        m.hasFired = false;
        m.kbVx = 0;
        m.kbVy = 0;
        m.vz = 0;
        m.isGrounded = true;
        m.maxHp = parseFloat(nextData.maxHp || nextData.hp) || 1;
        m.hp = m.maxHp;
        m.isProvoked = true;
        m.boss = this.createBossRuntimeForMonster(nextData, gameState);
        if (m.boss) {
            m.boss.noPatternWaitTimer = Math.max(0.6, parseFloat(m.boss.phase && m.boss.phase.No_Pattern_Wait_Time) || 0.2);
            m.boss.phaseStartedFromTransition = true;
        }

        if (gameState.targetUI) {
            gameState.targetUI.monster = m;
            gameState.targetUI.timer = 999999;
        }
        if (gameState.camera) {
            gameState.camera.zoom = 1;
            gameState.camera.focusX = null;
            gameState.camera.focusY = null;
        }
        gameState.phaseTransition = null;
        gameState.screenHitFlash = { life: 0.24, maxLife: 0.24, strength: 0.42, mode: 'red' };

        if (transition.startText && typeof pushSystemNotice === 'function') {
            pushSystemNotice(transition.startText, '#e74c3c', 2.0);
        }
        if (typeof this.pushBossDebugLog === 'function') {
            this.pushBossDebugLog(gameState, 'PHASE_START', String(nextPhase.Phase_ID || '').trim(), transition.startText || '');
        }
        return true;
    }
};

window.BossPhaseSystem = BossPhaseSystem;
