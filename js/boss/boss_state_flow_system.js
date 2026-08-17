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
            const bossConfig = boss.config || boss.phase || {};
            const nextPhase = typeof this.getBossNextPhase === 'function' ? this.getBossNextPhase(bossConfig, gameState) : null;
            if (nextPhase && String(bossConfig.Phase_Transition_Type || '').trim()) {
                if (typeof this.startBossPhaseTransition === 'function') {
                    this.startBossPhaseTransition(m, gameState);
                    return true;
                }
            }

            if (!m.isDeadProcessed) {
                if (typeof this.clearAllBossPatternRuntimeOnDeath === 'function') {
                    this.clearAllBossPatternRuntimeOnDeath(m, gameState);
                }
                m.isDeadProcessed = true;
                MonsterAI.changeState(m, 'DIE', gameState);
                if (gameState.targetUI.monster === m) gameState.targetUI.timer = 1.5;
            }

            m.deadTimer += deltaTime;
            if (m.deadTimer >= (m.d.dieDur + m.d.corpseTime)) m.active = false;
            return true;
        }

        // bossPatternDialogue의 수명은 전용 모드/컷신에서도 멈추지 않도록 game_app.updateEnvironment에서 공통 갱신한다.

        this.updateBossCooldowns(m, deltaTime);

        const hpRate = (parseFloat(m.hp) || 0) / Math.max(1, parseFloat(m.maxHp) || 1);
        const bossConfig = boss.config || boss.phase || {};
        const lateThreshold = this.getBossLatePhaseThreshold(bossConfig);
        const wasLatePhase = !!boss.isLatePhase;
        boss.isLatePhase = Number.isFinite(lateThreshold) ? (hpRate <= lateThreshold) : false;

        if (boss.isLatePhase && !boss.lateNoticeShown) {
            boss.lateNoticeShown = true;
        }

        // 후반부 개시 패턴은 후반부 진입 순간 예약해 두고,
        // 현재 진행 중인 패턴/행동이 끝난 뒤 일반 패턴 선택보다 먼저 강제 실행한다.
        // 이렇게 해야 후반부 진입 직후 다른 기본/대형 패턴이 먼저 뽑히는 상황을 막을 수 있다.
        const lateOpeningIdForReserve = String(boss.lateOpeningPatternId || '').trim();
        const hasValidLateOpeningId = lateOpeningIdForReserve && lateOpeningIdForReserve !== '0';
        if (boss.isLatePhase && hasValidLateOpeningId && !boss.lateOpeningPatternUsed && !boss.lateOpeningPatternStarted) {
            if (!wasLatePhase || !String(boss.pendingLateOpeningPatternId || '').trim()) {
                boss.pendingLateOpeningPatternId = lateOpeningIdForReserve;
                if (typeof this.pushBossDebugLog === 'function') {
                    this.pushBossDebugLog(gameState, 'LATE', `후반부 개시 패턴 예약 ${lateOpeningIdForReserve}`, '현재 패턴 종료 후 우선 실행');
                }
            }
        }

        if (boss.p2M2PerfectBreakPending) {
            if (typeof this.updateKasiyasP2M2PerfectBreakSequence === 'function') {
                this.updateKasiyasP2M2PerfectBreakSequence(m, deltaTime, gameState);
                return true;
            }
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
                boss.noPatternWaitTimer = Math.max(boss.noPatternWaitTimer || 0, parseFloat(bossConfig.No_Pattern_Wait_Time) || 0.2);
            }
            return true;
        }

        if (boss.action) {
            if (typeof this.tryResolveKasiyasP2M2FinalPortalHit === 'function' && this.tryResolveKasiyasP2M2FinalPortalHit(m, boss.action, gameState)) {
                return true;
            }
            const activeActionIdForGaze = String(boss.action && boss.action.Action_ID || '').trim();
            const activePatternIdForGaze = String(boss.action && boss.action.Pattern_ID || '').trim();
            // 2페이즈 대형 패턴 1의 최종 X자 베기 준비는 대기 시간이 길기 때문에,
            // 액션 시작 시 1회만 바라보지 않고 준비 중 계속 플레이어 방향을 추적한다.
            if (activePatternIdForGaze === '232006' && activeActionIdForGaze === '242048' && typeof this.applyBossActionGaze === 'function') {
                this.applyBossActionGaze(m, boss.action, gameState);
            }
            this.updateBossPatternActionMovement(m, boss.action, deltaTime, gameState);
            const activePoseForAirSlash = String(boss.action && boss.action.Action_Pose_Type || '').trim().toUpperCase();
            const activeActionIdForAirSlash = String(boss.action && boss.action.Action_ID || '').trim();
            if (activePoseForAirSlash === 'POSE_KASIYAS_P3_AIR_SLASH_DOWN' || activeActionIdForAirSlash === '243032') {
                // 3페이즈 기본 패턴 5번의 마무리는 단순 공중 유지 자세가 아니라,
                // 맵 중앙 상공에서 지면으로 낙하하며 검을 내려찍는 액션으로 보여야 한다.
                // 따라서 243032 진행률에 맞춰 Z를 공중 높이에서 0까지 직접 보간하고,
                // 검흔 판정이 켜지는 시점에는 지면에 착지/충돌한 실루엣이 되도록 한다.
                const bodyZForAirSlash = ((m.d && parseFloat(m.d.bodyZ)) || 170) * (parseFloat(m.scale) || 1);
                let actionDurationForAirSlash = parseFloat(boss.action && boss.action.Action_Anim_Duration) || 2.0;
                try {
                    if (typeof this.getBossActionDuration === 'function') {
                        actionDurationForAirSlash = this.getBossActionDuration(m, boss.action, gameState) || actionDurationForAirSlash;
                    }
                } catch (e) {}
                actionDurationForAirSlash = Math.max(0.25, parseFloat(actionDurationForAirSlash) || 2.0);

                let impactTime = Math.max(0.18, actionDurationForAirSlash * 0.50);
                try {
                    const group = String(boss.action && boss.action.Spawn_Object_Group || '').trim();
                    const db = gameState && gameState.DB_BOSS_PATTERN_OBJECT ? gameState.DB_BOSS_PATTERN_OBJECT : null;
                    if (group && db) {
                        Object.keys(db).forEach(key => {
                            const data = db[key] || {};
                            if (String(data.Object_Group || '').trim() === group) {
                                const delay = parseFloat(data.Hitbox_Delay_Time);
                                if (!isNaN(delay) && delay > 0) impactTime = Math.min(impactTime, delay);
                            }
                        });
                    }
                } catch (e) {}
                impactTime = Math.max(0.18, Math.min(impactTime, actionDurationForAirSlash * 0.85));

                const timerForAirSlash = Math.max(0, parseFloat(m.timer) || 0);
                const actionIndexForAirSlash = parseInt(boss.currentActionIndex);
                const runtimeKey = `${activeActionIdForAirSlash || 'AIR'}:${isNaN(actionIndexForAirSlash) ? -1 : actionIndexForAirSlash}`;
                const shouldResetAirSlash = !boss.p3B5AirSlashRuntime
                    || boss.p3B5AirSlashRuntime.key !== runtimeKey
                    || timerForAirSlash < (parseFloat(boss.p3B5AirSlashRuntime.lastTimer) || 0) - 0.05;
                if (shouldResetAirSlash) {
                    boss.p3B5AirSlashRuntime = {
                        key: runtimeKey,
                        startZ: Math.max(240, parseFloat(m.z) || 0, bodyZForAirSlash * 1.20),
                        impactTime: impactTime,
                        lastTimer: timerForAirSlash
                    };
                }

                const airSlashRuntime = boss.p3B5AirSlashRuntime || {};
                airSlashRuntime.impactTime = impactTime;
                airSlashRuntime.lastTimer = timerForAirSlash;
                const startZ = Math.max(160, parseFloat(airSlashRuntime.startZ) || 240);
                const tRaw = Math.max(0, Math.min(1, timerForAirSlash / Math.max(0.001, impactTime)));
                // 초반에는 잠깐 체공하고, 후반에 지면을 향해 빠르게 떨어지는 느낌.
                const eased = Math.pow(tRaw, 1.55);
                const currentZ = startZ * (1 - eased);

                if (timerForAirSlash < impactTime) {
                    m.z = Math.max(0, currentZ);
                    m.vz = 0;
                    m.isGrounded = false;
                } else {
                    m.z = 0;
                    m.vz = 0;
                    m.isGrounded = true;
                }
            } else {
                boss.p3B5AirSlashRuntime = null;
                boss.p3B5AirSlashHoldZ = null;
            }
            this.updateBossParryCue(m, boss.action, deltaTime, gameState);

            const actionType = String(boss.action.Action_Type || '').trim().toUpperCase();
            if (actionType === 'P3_M3_EXCLUSIVE_MODE_START') {
                const p = gameState && gameState.player;
                if (p) {
                    p.z = 0;
                    p.vz = 0;
                    p.kbVx = 0;
                    p.kbVy = 0;
                    p.vx = 0;
                    p.vy = 0;
                    p.isGrounded = true;
                    if (p.state === 'Hit' || p.state === 'HIT') p.state = 'Idle';
                }
                m.z = 0;
                m.kbVx = 0;
                m.kbVy = 0;

                if (boss.p3m3ExclusiveModeStarted && !(typeof P3M3FinalIssenSystem !== 'undefined' && P3M3FinalIssenSystem.isActive && P3M3FinalIssenSystem.isActive(gameState))) {
                    boss.p3m3ExclusiveModeStarted = false;
                }

                if (!boss.p3m3ExclusiveModeStarted && typeof P3M3FinalIssenSystem !== 'undefined' && P3M3FinalIssenSystem.startFromPattern) {
                    const patternIdForP3M3 = String(boss.action.Pattern_ID || boss.activePattern && boss.activePattern.Pattern_ID || '233008');
                    const sourceActionIdForP3M3 = String(boss.action.Action_ID || '');
                    let startedP3M3 = false;
                    try {
                        const introDurationForP3M3 = (typeof this.getBossActionDuration === 'function')
                            ? this.getBossActionDuration(m, boss.action, gameState)
                            : (parseFloat(boss.action && boss.action.Action_Anim_Duration) || 0);
                        startedP3M3 = P3M3FinalIssenSystem.startFromPattern(gameState, m, {
                            patternId: patternIdForP3M3,
                            sourceActionId: sourceActionIdForP3M3,
                            introDuration: introDurationForP3M3
                        });
                    } catch (e) {
                        console.warn('[P3M3] startFromPattern failed', e);
                        startedP3M3 = false;
                    }
                    boss.p3m3ExclusiveModeStarted = !!startedP3M3;
                    if (typeof this.pushBossDebugLog === 'function') {
                        this.pushBossDebugLog(
                            gameState,
                            boss.p3m3ExclusiveModeStarted ? 'P3_M3_START' : 'P3_M3_START_FAIL',
                            `${sourceActionIdForP3M3 || '243075'} 세계를 가르는 일섬 시작`,
                            `started=${!!startedP3M3}, specialMode=${String(gameState && gameState.specialMode || '-')}`
                        );
                    }
                    if (boss.p3m3ExclusiveModeStarted) return true;
                }
                boss.p3m3ExclusiveModeStarted = false;
                return true;
            }
            if (actionType === 'SPECIAL_MODE_START') {
                // step213: 지면 붕괴 DIRECT_ACT가 끝난 직후 배우들이 음수 Z/피격 상태로 남아 있으면
                // 전용 모드 시작 실패 시 화면이 빈 기존 맵 상태로 멈춰 보일 수 있으므로, 시작 직전에 안전 복구한다.
                const p = gameState && gameState.player;
                if (p) {
                    p.z = 0;
                    p.vz = 0;
                    p.kbVx = 0;
                    p.kbVy = 0;
                    p.vx = 0;
                    p.vy = 0;
                    p.isGrounded = true;
                    if (p.state === 'Hit' || p.state === 'HIT') p.state = 'Idle';
                }
                m.z = 0;
                m.kbVx = 0;
                m.kbVy = 0;
                if (gameState) {
                    // 이전 DIRECT_ACT용 오버레이는 여기서 종료하고, 이후에는 P2_M3 전용 INTRO가 담당한다.
                    gameState.specialModeObjectDefenseIntroRuntime = null;
                    if (gameState.specialMode === 'SPECIAL_MODE_OBJECT_DEFENSE' && !(gameState.specialModeObjectDefenseRuntime && gameState.specialModeObjectDefenseRuntime.active)) {
                        gameState.specialMode = null;
                        gameState.specialModeObjectDefenseRuntime = null;
                    }
                }
                // step214: 이전 프레임에서 시작 플래그만 true가 되었지만 실제 전용 모드 런타임이 활성화되지 않은 경우,
                // 242073을 영구 대기시키지 말고 플래그를 풀어 다시 시작 시도한다.
                const p2m3ActiveNow = !!(typeof SpecialModeObjectDefenseSystem !== 'undefined' && SpecialModeObjectDefenseSystem.isActive && SpecialModeObjectDefenseSystem.isActive(gameState));

                // 전용 모드가 정상 종료되어 결과가 확정된 경우에는 242073을 다시 시작하지 않고,
                // 기존 Boss Action 흐름으로 복귀해 242074~242076 결과 액션을 판정한다.
                if (!p2m3ActiveNow && String(boss.specialModeResult || '').trim()) {
                    boss.specialModeStarted = false;
                    if (typeof this.startNextBossPatternAction === 'function') {
                        this.startNextBossPatternAction(m, gameState);
                    }
                    return true;
                }

                if (boss.specialModeStarted && !p2m3ActiveNow) {
                    boss.specialModeStarted = false;
                    if (typeof this.pushBossDebugLog === 'function') {
                        this.pushBossDebugLog(gameState, 'P2_M3_START_RETRY', '242073 차원 방어전 시작 재시도', 'started flag existed but runtime was not active');
                    }
                }

                if (!boss.specialModeStarted && typeof SpecialModeObjectDefenseSystem !== 'undefined' && SpecialModeObjectDefenseSystem.startFromPattern) {
                    let startedP2M3 = false;
                    let activeAfterStart = false;
                    const patternIdForP2M3 = String(boss.action.Pattern_ID || boss.activePattern && boss.activePattern.Pattern_ID || '232008');
                    const sourceActionIdForP2M3 = String(boss.action.Action_ID || '');
                    try {
                        startedP2M3 = SpecialModeObjectDefenseSystem.startFromPattern(gameState, m, {
                            patternId: patternIdForP2M3,
                            sourceActionId: sourceActionIdForP2M3,
                            specialModeId: boss.action.Ref_Special_Mode
                        });
                        activeAfterStart = !!(SpecialModeObjectDefenseSystem.isActive && SpecialModeObjectDefenseSystem.isActive(gameState));
                    } catch (e) {
                        console.warn('[P2M3] startFromPattern failed', e);
                        startedP2M3 = false;
                        activeAfterStart = false;
                    }
                    // stale specialMode 때문에 1회 실패한 경우 강제 정리 후 한 번만 재시도한다.
                    if ((!startedP2M3 || !activeAfterStart) && gameState) {
                        gameState.specialMode = null;
                        gameState.specialModeObjectDefenseRuntime = null;
                        gameState.specialModeObjectDefenseIntroRuntime = null;
                        try {
                            startedP2M3 = SpecialModeObjectDefenseSystem.startFromPattern(gameState, m, {
                                patternId: patternIdForP2M3,
                                sourceActionId: sourceActionIdForP2M3,
                                specialModeId: boss.action.Ref_Special_Mode
                            });
                            activeAfterStart = !!(SpecialModeObjectDefenseSystem.isActive && SpecialModeObjectDefenseSystem.isActive(gameState));
                        } catch (e) {
                            console.warn('[P2M3] startFromPattern retry failed', e);
                            startedP2M3 = false;
                            activeAfterStart = false;
                        }
                    }
                    boss.specialModeStarted = !!(startedP2M3 && activeAfterStart);
                    if (typeof this.pushBossDebugLog === 'function') {
                        const rt = gameState && gameState.specialModeObjectDefenseRuntime;
                        this.pushBossDebugLog(
                            gameState,
                            boss.specialModeStarted ? 'P2_M3_START' : 'P2_M3_START_FAIL',
                            `${sourceActionIdForP2M3 || '242073'} 차원 방어전 시작`,
                            `started=${!!startedP2M3}, active=${!!activeAfterStart}, specialMode=${String(gameState && gameState.specialMode || '-')}, phase=${String(rt && rt.phase || '-')}`
                        );
                    }
                    if (boss.specialModeStarted) return true;
                }
                // 그래도 시작하지 못하면 다음 프레임 재시도하되, 시작 완료 플래그를 남기지 않는다.
                boss.specialModeStarted = false;
                return true;
            }
            if (actionType === 'DIRECT_ACT' && typeof SpecialModeObjectDefenseSystem !== 'undefined' && SpecialModeObjectDefenseSystem.updatePatternIntroAction) {
                SpecialModeObjectDefenseSystem.updatePatternIntroAction(m, boss.action, deltaTime, gameState);
            }
            const hitWindow = this.getBossActionHitWindow(m, boss.action);
            const hitStart = hitWindow.start;
            const hitEnd = hitWindow.end || hitStart;
            const animDur = this.getBossActionDuration(m, boss.action, gameState);

            if (typeof this.updateBossInlineActionWarning === 'function') {
                this.updateBossInlineActionWarning(m, boss.action, gameState);
            }

            if (!['WAIT','WARNING_PATH','WARNING','SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT','MOVE','REMOVE_ALL_OBJECT','CLEAR_PATTERN_TERRAIN_OBJECTS','DIRECT_ACT','SPECIAL_MODE_START','P3_M3_EXCLUSIVE_MODE_START'].includes(actionType)) {
                const rawHitEnd = parseFloat(boss.action.Hitbox_End_Time);
                const moveWaitUntil = boss.actionMove && boss.actionMove.attackAfterMove
                    ? Math.max(0, parseFloat(boss.actionMove.duration) || parseFloat(boss.attackAfterMoveUntil) || 0)
                    : 0;
                const adjustedHitStart = moveWaitUntil > 0 ? Math.max(hitStart, moveWaitUntil) : hitStart;
                const effectiveHitEndBase = !isNaN(rawHitEnd) && rawHitEnd > 0 ? hitEnd : animDur;
                const effectiveHitEnd = moveWaitUntil > 0 ? Math.max(effectiveHitEndBase, adjustedHitStart + 0.02) : effectiveHitEndBase;
                const hitboxType = String(boss.action.Hitbox_Type || '').trim().toUpperCase();
                const isBodyCollision = hitboxType === 'HITBOX_BODY_COLLISION';
                const hitCount = Math.max(1, parseInt(boss.action.ATK_Hit_Count) || 1);
                const rawCycle = parseFloat(boss.action.ATK_Cycle);
                const hitCycle = isBodyCollision
                    ? Math.max(0.02, (!isNaN(rawCycle) && rawCycle > 0) ? rawCycle : 0.035)
                    : Math.max(0.01, (!isNaN(rawCycle) && rawCycle > 0) ? rawCycle : 0.12);
                if (typeof this.trySpawnBossPatternActionObjectsAtTiming === 'function' && m.timer >= adjustedHitStart) {
                    this.trySpawnBossPatternActionObjectsAtTiming(m, boss.action, gameState, 'ATK_HITBOX_START');
                }
                if (typeof this.trySpawnBossPatternActionObjectsAtTiming === 'function' && m.timer >= effectiveHitEnd) {
                    this.trySpawnBossPatternActionObjectsAtTiming(m, boss.action, gameState, 'ATK_HITBOX_END');
                }
                if (m.timer >= adjustedHitStart && m.timer <= effectiveHitEnd && (boss.actionHitsDone || 0) < hitCount) {
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
                if (String(boss.action && boss.action.Pattern_ID || '').trim() === '232006' && String(boss.action && boss.action.Action_ID || '').trim() === '242039') {
                    boss.p2MajorPattern1Runtime = boss.p2MajorPattern1Runtime || {};
                    // 기운 부여 액션이 완전히 끝난 뒤부터만 검 기운을 활성화한다.
                    // 별도의 몸 옆 세로 오라 이펙트는 사용하지 않고, 검신 렌더 쪽에서만 표시한다.
                    boss.p2MajorPattern1Runtime.swordEnergyGranted = true;
                }
                if (typeof this.trySpawnBossPatternActionObjectsAtTiming === 'function') {
                    this.trySpawnBossPatternActionObjectsAtTiming(m, boss.action, gameState, 'ACTION_END');
                } else if (['SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT'].includes(actionType)) {
                    const spawnTiming = String(boss.action.Object_Spawn_Timing || 'ACTION_START').trim().toUpperCase();
                    if (spawnTiming === 'ACTION_END') {
                        this.spawnBossAttackObjectFromAction(m, boss.action, gameState);
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

        const isP3M3RuntimeMonster = !!(
            gameState &&
            gameState.specialMode === 'P3_M3_FINAL_ISSEN' &&
            m &&
            m.isP3M3Monster
        );
        if (gameState.bossPractice && gameState.bossPractice.enabled && !isP3M3RuntimeMonster) {
            m.state = 'IDLE';
            m.kbVx = 0;
            m.kbVy = 0;
            return true;
        }

        if (boss.isLatePhase && !boss.lateOpeningPatternStarted && !boss.lateOpeningPatternUsed) {
            const lateOpeningId = String(boss.pendingLateOpeningPatternId || boss.lateOpeningPatternId || '').trim();
            const lateOpeningPattern = lateOpeningId && lateOpeningId !== '0' && gameState.DB_BOSS_PATTERN ? gameState.DB_BOSS_PATTERN[lateOpeningId] : null;
            if (lateOpeningPattern && Array.isArray(lateOpeningPattern.Runtime_Actions) && lateOpeningPattern.Runtime_Actions.length > 0) {
                boss.lateOpeningPatternStarted = true;
                boss.pendingLateOpeningPatternId = null;
                this.startBossPattern(m, lateOpeningPattern, gameState);
                return true;
            }
            if (lateOpeningId && lateOpeningId !== '0') {
                // 데이터에 패턴 또는 액션이 아직 없는 경우에는 무한 예약으로 일반 패턴이 막히지 않도록 처리한다.
                boss.pendingLateOpeningPatternId = null;
                boss.lateOpeningPatternStarted = true;
                boss.lateOpeningPatternUsed = true;
                if (typeof this.pushBossDebugLog === 'function') {
                    this.pushBossDebugLog(gameState, 'LATE', `후반부 개시 패턴 실행 불가 ${lateOpeningId}`, '패턴 데이터 또는 액션 없음');
                }
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
