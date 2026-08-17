// boss_phase_system.js
// Boss_info에 통합된 단계/AI 운용 데이터를 사용해 보스 런타임과 단계 전환을 관리한다.
// 파일명/외부 함수명은 기존 MonsterManager 연결 호환을 위해 유지한다.

const BossPhaseSystem = {
    createBossRuntimeForMonster: function(d, gameState, options = {}) {
        const aiType = String(d && d.aiType || '').trim().toUpperCase();
        const isBossPatternData = (this && typeof this.isBossPatternData === 'function')
            ? this.isBossPatternData(d)
            : !!d && (aiType === 'BOSS_PATTERN' || aiType === 'BOSS_PATTERN_BASIC');
        const forceRuntime = !!(options && options.forceRuntime);
        if (!d || (!isBossPatternData && !forceRuntime)) return null;

        const config = d.bossConfig ? { ...d.bossConfig } : {
            Monster_ID: d.id,
            Phase_Order: null,
            Phase_Name: '',
            Chase_Stop_Distance: null,
            No_Pattern_Wait_Time: null,
            Late_Phase_HP_Rate: null,
            Next_Boss_ID: null,
            Phase_Transition_Type: null
        };
        if (!config.Monster_ID) config.Monster_ID = d.id;

        const patternSetId = String(d.patternSetId || '').trim();
        const allPatterns = gameState.DB_BOSS_PATTERN_BY_SET && gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
            ? gameState.DB_BOSS_PATTERN_BY_SET[patternSetId]
            : [];
        const basicPatternOnly = aiType === 'BOSS_PATTERN_BASIC';
        const selectablePatterns = basicPatternOnly
            ? allPatterns.filter(pattern => String(pattern && pattern.Pattern_Category || '').trim().toUpperCase() === 'BASIC')
            : allPatterns;

        const lateThreshold = this.getBossLatePhaseThreshold(config);
        const startsLate = Number.isFinite(lateThreshold) && lateThreshold >= 1;
        const patternCooldowns = {};
        for (const pattern of selectablePatterns) {
            const patternId = String(pattern.Pattern_ID || '').trim();
            if (!patternId) continue;
            const normalInitial = parseFloat(pattern.Pattern_Initial_Cooltime);
            const lateInitial = parseFloat(pattern.Late_Phase_Pattern_Initial_Cooltime);
            const useLateInitial = startsLate && Number.isFinite(lateInitial) && lateInitial > 0;
            const initialCooldown = useLateInitial
                ? Math.max(0, lateInitial)
                : Math.max(0, Number.isFinite(normalInitial) ? normalInitial : 0);
            patternCooldowns[patternId] = (typeof GameModeSystem !== 'undefined' && GameModeSystem.adjustInitialPatternCooldown)
                ? GameModeSystem.adjustInitialPatternCooldown(gameState, pattern, initialCooldown)
                : initialCooldown;
        }

        let lateOpeningPatternId = '';
        if (!basicPatternOnly) {
            const lateOpening = allPatterns.find(pattern => String(pattern && pattern.Pattern_Cond_Type || '').trim().toUpperCase() === 'LATE_PHASE_START');
            lateOpeningPatternId = String(lateOpening && lateOpening.Pattern_ID || '').trim();
        }

        return {
            // phase는 구형 Phase DB가 아니라 현재 Boss_info의 단계 운용값을 가리키는 런타임 호환 alias다.
            phase: config,
            config: config,
            bossId: String(d.id || config.Monster_ID || '').trim(),
            phaseId: String(config.Phase_Order || d.id || '').trim(),
            patternSetId: patternSetId,
            basicPatternOnly: basicPatternOnly,
            patternCooldowns: patternCooldowns,
            activePattern: null,
            currentActionIndex: -1,
            currentLoopIndex: 0,
            loopCount: 1,
            action: null,
            actionHitFired: false,
            noPatternWaitTimer: 0,
            isLatePhase: startsLate,
            lateNoticeShown: startsLate,
            lateOpeningPatternId: lateOpeningPatternId,
            lateOpeningPatternUsed: basicPatternOnly || !lateOpeningPatternId,
            lateOpeningPatternStarted: basicPatternOnly || !lateOpeningPatternId,
            pendingLateOpeningPatternId: null,
            previewDashPath: null,
            currentDashPath: null,
            lastDashPath: null
        };
    },

    getBossLatePhaseThreshold: function(config) {
        const rawValue = config && config.Late_Phase_HP_Rate;
        if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') return null;
        const raw = parseFloat(rawValue);
        if (isNaN(raw)) return null;
        return Math.max(0, raw > 1 ? raw / 100 : raw);
    },

    // 외부 호출명은 유지하지만 이제 Next_Boss_ID를 통해 다음 Boss_info 런타임 데이터를 직접 반환한다.
    getBossNextPhase: function(config, gameState) {
        const nextBossId = String(config && config.Next_Boss_ID || '').trim();
        if (!nextBossId || nextBossId === '0') return null;
        return gameState && gameState.DB_MONSTER ? gameState.DB_MONSTER[nextBossId] || null : null;
    },

    resetPlayerForBossPhaseTransition: function(m, gameState) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p || !p.active) return;

        const stage = gameState.currentStage || null;
        const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 2000);
        const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 300);
        const rawSpawnX = parseFloat(stage && (stage.Player_Start_Center_X !== undefined ? stage.Player_Start_Center_X : stage.Player_Spawn_X));
        const rawSpawnY = parseFloat(stage && (stage.Player_Start_Center_Y !== undefined ? stage.Player_Start_Center_Y : stage.Player_Spawn_Y));
        const bodyX = Math.max(1, (parseFloat(p.bodyX) || 60) * (parseFloat(p.scale) || 1) * 0.5);
        const spawnX = Number.isFinite(rawSpawnX) ? rawSpawnX : 300;
        const spawnY = Number.isFinite(rawSpawnY) ? rawSpawnY : worldD * 0.5;

        p.x = Math.max(bodyX, Math.min(worldW - bodyX, spawnX));
        p.y = Math.max(0, Math.min(worldD, spawnY));
        p.z = 0;
        p.vz = 0;
        p.isGrounded = true;
        p.state = 'Idle';
        p.prevState = 'Idle';
        p.forcePrevState = null;
        p.atkTimer = 0;
        p.kbVx = 0;
        p.kbVy = 0;
        p.invincibleTimer = 0;
        p.dashTimer = 0;
        p.dashCooldownTimer = 0;
        p.dashSpeedX = 0;
        p.dashSpeedY = 0;
        p.ghostTimer = 0;
        p.isRunning = false;
        p.runDirection = null;
        p.guardTimer = 0;
        p.maxGuardTimer = 0;
        p.guardCooldownTimer = 0;
        p.guardSuccessTimer = 0;
        p.guardForcedRecover = false;
        p.freezeTimer = 0;
        p.maxFreezeTimer = 0;
        p.mashReduced = 0;
        p.rapidAtkAllowTimer = 0;
        p.rapidAtkCooldownTimer = 0;
        p.rapidAtkCount = 0;
        p.stanceSwapTimer = 0;

        const bossX = Number.isFinite(parseFloat(m && m.x)) ? parseFloat(m.x) : worldW * 0.74;
        p.faceDir = bossX >= p.x ? 1 : -1;
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
            boss.hpTriggerProtection = null;
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
        const config = boss && (boss.config || boss.phase);
        if (!boss || !config || !gameState) return false;
        if (boss.phaseTransition && boss.phaseTransition.active) return true;

        const nextData = this.getBossNextPhase(config, gameState);
        if (!nextData) return false;
        const nextConfig = nextData.bossConfig || {};

        const transitionType = String(config.Phase_Transition_Type || '').trim();
        const transitionTypeKey = transitionType.toUpperCase();
        const defaultTransitionDuration = transitionTypeKey === 'KASIYAS_P2_TO_P3' ? 9.0 : 10.0;
        const duration = defaultTransitionDuration;
        const startTextRaw = String(nextConfig.Phase_Name || nextData.name || '다음 단계 돌입').trim();
        const startText = typeof formatKasiyasPublicText === 'function'
            ? formatKasiyasPublicText(startTextRaw, { phaseStep: true, latePhase: false })
            : startTextRaw.replace(/1페이즈/g, '1단계').replace(/2페이즈/g, '2단계').replace(/3페이즈/g, '3단계');

        this.clearBossPhaseTransitionRuntime(m, gameState);
        this.resetPlayerForBossPhaseTransition(m, gameState);

        const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 2000);
        const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 300);
        const isP2ToP3Transition = transitionTypeKey === 'KASIYAS_P2_TO_P3';
        const stage = gameState.currentStage || null;
        const rawBossSpawnX = parseFloat(stage && (stage.Boss_Spawn_Center_X !== undefined ? stage.Boss_Spawn_Center_X : stage.Boss_Spawn_X));
        const rawBossSpawnY = parseFloat(stage && (stage.Boss_Spawn_Center_Y !== undefined ? stage.Boss_Spawn_Center_Y : stage.Boss_Spawn_Y));
        const defaultBossX = Number.isFinite(rawBossSpawnX) ? rawBossSpawnX : Math.max(220, Math.min(worldW - 180, worldW * 0.74));
        const defaultBossY = Number.isFinite(rawBossSpawnY) ? rawBossSpawnY : worldD * 0.50;
        const targetX = isP2ToP3Transition
            ? Math.max(220, Math.min(worldW - 180, defaultBossX))
            : Math.max(220, Math.min(worldW - 180, worldW * 0.74));
        const targetY = isP2ToP3Transition
            ? Math.max(55, Math.min(worldD - 45, defaultBossY))
            : Math.max(55, Math.min(worldD - 45, worldD * 0.50));
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
            fromBossId: String(config.Monster_ID || boss.bossId || m.id || '').trim(),
            nextBossId: String(nextData.id || nextConfig.Monster_ID || '').trim(),
            nextData: nextData,
            startText: startText,
            initialHp: 0
        };

        boss.phaseTransition = transition;
        gameState.phaseTransition = transition;
        gameState.screenHitFlash = { life: 0.32, maxLife: 0.32, strength: 0.55, mode: 'red' };
        if (gameState.targetUI && gameState.targetUI.monster === m) gameState.targetUI.timer = 999999;

        if (typeof this.pushBossDebugLog === 'function') {
            this.pushBossDebugLog(gameState, 'PHASE', `${transition.fromBossId} → ${transition.nextBossId}`, transition.type);
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

        const nextData = transition.nextData || (gameState.DB_MONSTER ? gameState.DB_MONSTER[String(transition.nextBossId || '').trim()] : null);
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
            const config = m.boss.config || m.boss.phase || {};
            m.boss.noPatternWaitTimer = Math.max(0.6, parseFloat(config.No_Pattern_Wait_Time) || 0.2);
            m.boss.phaseStartedFromTransition = true;
        }

        if (gameState.targetUI) {
            gameState.targetUI.monster = m;
            gameState.targetUI.timer = 999999;
        }
        gameState.bossBattle = { boss: m, phase: m.boss ? (m.boss.config || m.boss.phase) : null };
        if (gameState.bossDebug) {
            gameState.bossDebug.patternCheck = null;
            gameState.bossDebug.currentAction = null;
            gameState.bossDebug.currentObjectAction = null;
        }
        if (gameState.camera) {
            gameState.camera.zoom = 1;
            gameState.camera.focusX = null;
            gameState.camera.focusY = null;
        }
        gameState.phaseTransition = null;
        gameState.screenHitFlash = { life: 0.24, maxLife: 0.24, strength: 0.42, mode: 'red' };

        if (typeof this.pushBossDebugLog === 'function') {
            const nextConfig = m.boss ? (m.boss.config || m.boss.phase || {}) : {};
            this.pushBossDebugLog(gameState, 'PHASE_START', String(nextConfig.Phase_Order || nextData.id || '').trim(), transition.startText || '');
        }
        return true;
    }
};

window.BossPhaseSystem = BossPhaseSystem;
