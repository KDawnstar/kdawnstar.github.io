// [카시야스 보스전] 보스 상태 진행 흐름 시스템 (boss_state_flow_system.js)
// monster_runtime_system.js에서 보스 전용 업데이트 흐름을 분리한 파일입니다.
// 패턴 선택/전투 판정/기본 행동 자체는 각 전용 시스템에 위임하고,
// 이 파일은 사망, 후반부, 그로기, 현재 액션 진행, 다음 패턴 선택 흐름을 관리합니다.
// ==========================================

const BossStateFlowSystem = {
updateBossPatternMonster: function(m, deltaTime, distX, distY, dist2D, gameState) {
        const boss = m.boss;
        if (!boss) return false;

        if ((boss.phaseTransition && boss.phaseTransition.active) || (gameState.phaseTransition && gameState.phaseTransition.active && gameState.phaseTransition.boss === m)) {
            if (typeof this.updateBossPhaseTransition === 'function') {
                this.updateBossPhaseTransition(m, deltaTime, gameState);
                return true;
            }
        }

        if (m.hp <= 0) {
            const nextPhase = typeof this.getBossNextPhase === 'function' ? this.getBossNextPhase(boss.phase, gameState) : null;
            if (nextPhase && String(boss.phase && boss.phase.Phase_Transition_Type || '').trim()) {
                if (typeof this.startBossPhaseTransition === 'function') {
                    this.startBossPhaseTransition(m, gameState);
                    return true;
                }
            }

            if (!m.isDeadProcessed) {
                m.isDeadProcessed = true;
                MonsterAI.changeState(m, 'DIE', gameState);
                if (gameState.targetUI.monster === m) gameState.targetUI.timer = 1.5;
            }

            m.deadTimer += deltaTime;
            if (m.deadTimer >= (m.d.dieDur + m.d.corpseTime)) m.active = false;
            return true;
        }

        if (gameState.bossPatternDialogue) {
            const d = gameState.bossPatternDialogue;
            if ((parseFloat(d.delay) || 0) > 0) {
                d.delay = Math.max(0, (parseFloat(d.delay) || 0) - deltaTime);
            } else {
                d.timer = Math.max(0, (parseFloat(d.timer) || 0) - deltaTime);
                if (d.timer <= 0) gameState.bossPatternDialogue = null;
            }
        }

        this.updateBossCooldowns(m, deltaTime);

        const hpRate = (parseFloat(m.hp) || 0) / Math.max(1, parseFloat(m.maxHp) || 1);
        const lateThreshold = this.getBossLatePhaseThreshold(boss.phase);
        boss.isLatePhase = hpRate <= lateThreshold;

        if (boss.isLatePhase && !boss.lateNoticeShown) {
            boss.lateNoticeShown = true;
            pushSystemNotice('⚠️ 카시야스 후반부 돌입', '#e67e22', 1.8);
        }

        if (boss.groggyTimer > 0) {
            boss.groggyTimer -= deltaTime;
            if (boss.groggyTimer < 0) boss.groggyTimer = 0;
            m.state = 'GROGGY';
            m.kbVx = 0;
            m.kbVy = 0;
            if (boss.groggyTimer <= 0) {
                boss.groggyPoseType = null;
                boss.groggyMaxTime = 0;
                m.state = 'IDLE';
                boss.noPatternWaitTimer = Math.max(boss.noPatternWaitTimer || 0, parseFloat(boss.phase && boss.phase.No_Pattern_Wait_Time) || 0.2);
            }
            return true;
        }

        if (boss.action) {
            this.updateBossPatternActionMovement(m, boss.action, deltaTime, gameState);
            this.updateBossParryCue(m, boss.action, deltaTime, gameState);

            const actionType = String(boss.action.Action_Type || '').trim().toUpperCase();
            const hitWindow = this.getBossActionHitWindow(m, boss.action);
            const hitStart = hitWindow.start;
            const hitEnd = hitWindow.end || hitStart;
            const animDur = this.getBossActionDuration(m, boss.action, gameState);

            if (!['WAIT','WARNING_PATH','WARNING','SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT','MOVE'].includes(actionType)) {
                const rawHitEnd = parseFloat(boss.action.Hitbox_End_Time);
                const effectiveHitEnd = !isNaN(rawHitEnd) && rawHitEnd > 0 ? hitEnd : animDur;
                const hitboxType = String(boss.action.Hitbox_Type || '').trim().toUpperCase();
                const isBodyCollision = hitboxType === 'HITBOX_BODY_COLLISION';
                const hitCount = Math.max(1, parseInt(boss.action.ATK_Hit_Count) || 1);
                const rawCycle = parseFloat(boss.action.ATK_Cycle);
                const hitCycle = isBodyCollision
                    ? Math.max(0.02, (!isNaN(rawCycle) && rawCycle > 0) ? rawCycle : 0.035)
                    : Math.max(0.01, (!isNaN(rawCycle) && rawCycle > 0) ? rawCycle : 0.12);
                if (m.timer >= hitStart && m.timer <= effectiveHitEnd && (boss.actionHitsDone || 0) < hitCount) {
                    boss.actionCycleTimer = (boss.actionCycleTimer || 0) + deltaTime;
                    if (boss.actionCycleTimer >= hitCycle) {
                        boss.actionCycleTimer = 0;
                        const didHit = this.fireBossPatternActionHit(m, boss.action, gameState);
                        if (isBodyCollision) {
                            // 돌진/어깨치기처럼 몸통 충돌형 판정은 실제 충돌했을 때만 히트 카운트를 소비한다.
                            // 빗나간 프레임에서 카운트가 소모되면 돌진이 지나가도 피해가 들어가지 않는 문제가 생긴다.
                            if (didHit) boss.actionHitsDone = (boss.actionHitsDone || 0) + 1;
                        } else {
                            boss.actionHitsDone = (boss.actionHitsDone || 0) + 1;
                        }
                        if (boss.actionHitsDone >= hitCount) boss.actionHitFired = true;
                    }
                }
            }

            if (m.timer >= animDur) {
                if (['SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT'].includes(actionType)) {
                    const spawnTiming = String(boss.action.Object_Spawn_Timing || 'ACTION_START').trim().toUpperCase();
                    if (spawnTiming === 'ACTION_END' && !boss.actionHitFired) {
                        this.spawnBossAttackObjectFromAction(m, boss.action, gameState);
                        boss.actionHitFired = true;
                    }
                }
                // 대형 패턴 3번 교차 발도 파훼는 가드 순간 즉시 그로기에 들어가지 않고,
                // 본체/분신이 교차 돌진을 끝낸 뒤 화면 플래시와 충돌 연출을 거쳐 그로기에 진입한다.
                if (boss.majorPattern3Runtime && boss.majorPattern3Runtime.pendingCrossSlashGroggy) {
                    if (typeof this.resolveKasiyasMajorPattern3PendingCrossGroggy === 'function') {
                        this.resolveKasiyasMajorPattern3PendingCrossGroggy(m, gameState);
                        return true;
                    }
                }
                this.startNextBossPatternAction(m, gameState);
            }
            return true;
        }

        if (gameState.bossPractice && gameState.bossPractice.enabled) {
            m.state = 'IDLE';
            m.kbVx = 0;
            m.kbVy = 0;
            return true;
        }

        if (boss.isLatePhase && !boss.lateOpeningPatternStarted && !boss.lateOpeningPatternUsed) {
            const lateOpeningId = String(boss.phase && boss.phase.Late_Opening_Pattern_ID || '').trim();
            const lateOpeningPattern = lateOpeningId && gameState.DB_BOSS_PATTERN ? gameState.DB_BOSS_PATTERN[lateOpeningId] : null;
            if (lateOpeningPattern && Array.isArray(lateOpeningPattern.Runtime_Actions) && lateOpeningPattern.Runtime_Actions.length > 0) {
                boss.lateOpeningPatternStarted = true;
                boss.lateOpeningPatternUsed = true;
                this.startBossPattern(m, lateOpeningPattern, gameState);
                return true;
            }
        }

        const readyPattern = this.selectReadyBossPattern(m, distX, distY, dist2D, gameState);
        if (readyPattern) {
            this.startBossPattern(m, readyPattern, gameState);
            return true;
        }

        this.updateBossDefaultAction(m, distX, distY, deltaTime, gameState);
        return true;
    },
};
