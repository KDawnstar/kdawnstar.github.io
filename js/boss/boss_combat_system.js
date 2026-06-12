// [카시야스 보스전] 보스 전투/판정 시스템 (boss_combat_system.js)
// - 보스 피격/데미지 처리
// - 패링/그로기 진입 처리
// - 보스 패턴/오브젝트 공격 판정 처리
// - 공통 히트박스 충돌 검사
//
// 기존 MonsterManager 호출 안정성을 위해 monster_runtime_system.js에는 wrapper를 남겨둔다.
// 실제 구현은 이 파일의 BossCombatSystem이 담당한다.

const BossCombatSystem = {
    getBossParryWindow: function(m, action) {
        const boss = m && m.boss ? m.boss : null;
        if (!action) return { enabled: false, start: 0, end: 0 };
        const enabled = action.Parry_Enable === true || String(action.Parry_Enable || '').trim().toLowerCase() === 'true';
        if (!enabled) return { enabled: false, start: 0, end: 0 };

        const rate = this.getLatePhaseActionTimeRate(action, boss);
        const startRaw = parseFloat(action.Parry_Start_Time);
        const endRaw = parseFloat(action.Parry_End_Time);
        const start = (!isNaN(startRaw) && startRaw >= 0 ? startRaw : 0) * rate;
        const end = (!isNaN(endRaw) && endRaw > 0 ? endRaw : start) * rate;
        return { enabled: true, start: Math.min(start, end), end: Math.max(start, end) };
    },
    isBossParryWindowActive: function(m, action) {
        const windowInfo = this.getBossParryWindow(m, action);
        if (!windowInfo.enabled) return false;
        const t = parseFloat(m && m.timer) || 0;
        return t >= windowInfo.start && t <= windowInfo.end;
    },
    isPlayerInsideBossParryRange: function(m, action, gameState) {
        const p = gameState && gameState.player;
        if (!m || !action || !p || !p.active || p.hp <= 0) return false;

        const scale = parseFloat(m.scale) || 1;
        const bossW = ((m.d && m.d.bodyX) || 80) * scale;
        const bossD = ((m.d && m.d.bodyY) || 60) * scale;
        const rangeX = Math.max(0, parseFloat(action.Parry_Range_X) || 0) * scale;
        const rangeY = Math.max(0, parseFloat(action.Parry_Range_Y) || 0) * scale;
        const rangeZ = Math.max(1, parseFloat(action.Parry_Range_Z) || ((m.d && m.d.bodyZ) || 160)) * scale;

        const playerW = (p.bodyX || 60) * (p.scale || 1);
        const playerD = (p.bodyY || 40) * (p.scale || 1);
        const playerH = (p.bodyZ || 120) * (p.scale || 1);

        // 패링 범위는 투사체 위치가 아니라 플레이어 본체 위치 기준으로 판정한다.
        // 따라서 멀리서 쏜 투사체가 맞아도 플레이어가 범위 밖이면 패링 성공 처리되지 않는다.
        return checkAABB3D(
            m.x,
            m.y,
            m.z,
            bossW + rangeX * 2,
            bossD + rangeY * 2,
            rangeZ,
            p.x,
            p.y,
            p.z,
            playerW,
            playerD,
            playerH
        );
    },
    updateBossParryCue: function(m, action, deltaTime, gameState) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !action) return;
        const active = this.isBossParryWindowActive(m, action);
        boss.parryWindowActive = active;
        if (!active) {
            boss.parryCueTimer = 0;
            return;
        }

        boss.parryCueTimer = (boss.parryCueTimer || 0) - (parseFloat(deltaTime) || 0);
        if (boss.parryCueTimer <= 0) {
            boss.parryCueTimer = 0.08;
            this.pushBossParryCueEffect(m, action, gameState);
        }
    },
    hasTwoSameKasiyasApostleEnergies: function(player) {
        const energies = Array.isArray(player && player.kasiyasApostleEnergies)
            ? player.kasiyasApostleEnergies.filter(Boolean)
            : [];
        if (energies.length < 2) return false;
        return String(energies[0] || '').trim().toUpperCase() === String(energies[1] || '').trim().toUpperCase();
    },

    resolveKasiyasMajorPattern3CrossGroggyAction: function(m, action, gameState) {
        const boss = m && m.boss ? m.boss : null;
        const sourceAction = action || {};
        const hasGroggyTime = !isNaN(parseFloat(sourceAction.Groggy_Time)) && parseFloat(sourceAction.Groggy_Time) > 0;
        const specialType = String(sourceAction.Guard_Special_Result_Type || '').trim().toUpperCase();
        if (hasGroggyTime && specialType !== 'CLONE_OWNER_GROGGY') return sourceAction;

        const cond = String(sourceAction.Guard_Special_Result_Occurrence_Cond || 'ATK_GUARD_GRANT_TEMPERED_BLADE_GUARD').trim().toUpperCase();
        const activeActions = boss && boss.activePattern && Array.isArray(boss.activePattern.Runtime_Actions)
            ? boss.activePattern.Runtime_Actions
            : [];
        const fromActive = activeActions.find(a => {
            if (!a) return false;
            const aSpecial = String(a.Guard_Special_Result_Type || '').trim().toUpperCase();
            const aCond = String(a.Guard_Special_Result_Occurrence_Cond || '').trim().toUpperCase();
            const aGroggy = parseFloat(a.Groggy_Time);
            return aSpecial === 'BOSS_GROGGY' && aCond === cond && !isNaN(aGroggy) && aGroggy > 0;
        });
        if (fromActive) return fromActive;

        const db = gameState && gameState.DB_BOSS_PATTERN_ACTION ? gameState.DB_BOSS_PATTERN_ACTION : null;
        if (db) {
            const list = Array.isArray(db) ? db : Object.values(db);
            const fromDb = list.find(a => {
                if (!a) return false;
                const patternId = String(a.Pattern_ID || '').trim();
                const aSpecial = String(a.Guard_Special_Result_Type || '').trim().toUpperCase();
                const aCond = String(a.Guard_Special_Result_Occurrence_Cond || '').trim().toUpperCase();
                const aGroggy = parseFloat(a.Groggy_Time);
                return patternId === '231008' && aSpecial === 'BOSS_GROGGY' && aCond === cond && !isNaN(aGroggy) && aGroggy > 0;
            });
            if (fromDb) return fromDb;
        }

        // 안전 fallback: 분신 교차 발도에 Groggy_Time이 비어 있어도 대형 패턴 3번의 의도값을 사용한다.
        return {
            ...sourceAction,
            Groggy_Time: sourceAction.Groggy_Time || 8,
            Groggy_Pose_Type: sourceAction.Groggy_Pose_Type || 'POSE_KASIYAS_P1_GROGGY',
            Groggy_Hit_DMG_Rate: sourceAction.Groggy_Hit_DMG_Rate || 1.2
        };
    },

    queueKasiyasMajorPattern3CrossGuardResolve: function(m, action, gameState, result) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !gameState || !action) return false;
        boss.majorPattern3Runtime = boss.majorPattern3Runtime || {};
        const rt = boss.majorPattern3Runtime;
        if (rt.crossSlashSpecialResolved || rt.pendingCrossSlashGroggy) return false;
        rt.crossSlashSpecialResolved = true;
        const groggyAction = this.resolveKasiyasMajorPattern3CrossGroggyAction
            ? this.resolveKasiyasMajorPattern3CrossGroggyAction(m, action, gameState)
            : (BossCombatSystem.resolveKasiyasMajorPattern3CrossGroggyAction
                ? BossCombatSystem.resolveKasiyasMajorPattern3CrossGroggyAction(m, action, gameState)
                : action);
        const resolvedGroggyAction = groggyAction || action || {};
        const resolvedGroggyTime = parseFloat(resolvedGroggyAction.Groggy_Time);
        const resolvedGroggyHitRate = parseFloat(resolvedGroggyAction.Groggy_Hit_DMG_Rate);
        const resolvedGroggyPose = String(resolvedGroggyAction.Groggy_Pose_Type || 'POSE_KASIYAS_P1_GROGGY').trim() || 'POSE_KASIYAS_P1_GROGGY';
        rt.pendingCrossSlashGroggy = {
            action: resolvedGroggyAction,
            triggerAction: action,
            result: result || {},
            // 교차 발도는 가드 성공 후 실제 그로기 진입까지 시간이 있으므로,
            // 나중에 액션 객체가 정리되더라도 데이터 테이블의 그로기 값이 사라지지 않게 예약 시점에 확정 저장한다.
            groggyTime: (!isNaN(resolvedGroggyTime) && resolvedGroggyTime > 0) ? resolvedGroggyTime : null,
            groggyPoseType: resolvedGroggyPose,
            groggyHitDmgRate: (!isNaN(resolvedGroggyHitRate) && resolvedGroggyHitRate >= 0) ? resolvedGroggyHitRate : null,
            timer: 0,
            flashDone: false
        };
        this.consumeTemperedBladeGuard(gameState.player);

        const p = gameState.player || {};
        gameState.effects.push({
            type: 'hitSpark',
            renderType: 'EFT_TEMPERED_BLADE_CROSS_GUARD',
            x: p.x || 0,
            y: p.y || 0,
            z: (p.z || 0) + ((p.bodyZ || 100) * 0.70),
            w: Math.max(170, (p.bodyX || 60) * (p.scale || 1) * 3.0),
            h: Math.max(180, (p.bodyZ || 100) * (p.scale || 1) * 1.55),
            life: 0.62,
            maxLife: 0.62,
            burstScale: 2.1,
            color: 'rgba(255,246,170,0.98)',
            accentColor: 'rgba(126,226,255,0.88)'
        });
        if (gameState.screenHitFlash) {
            gameState.screenHitFlash.life = Math.max(gameState.screenHitFlash.life || 0, 0.18);
            gameState.screenHitFlash.maxLife = Math.max(gameState.screenHitFlash.maxLife || 0, 0.18);
            gameState.screenHitFlash.mode = 'white';
            gameState.screenHitFlash.strength = Math.max(gameState.screenHitFlash.strength || 0, 0.72);
        } else {
            gameState.screenHitFlash = { life: 0.18, maxLife: 0.18, strength: 0.72, mode: 'white' };
        }
        gameState.floatingTexts.push({
            x: p.x || 0,
            y: p.y || 0,
            z: (p.z || 0) + (p.bodyZ || 100) + 84,
            text: '연단된 칼날!',
            color: '#fff2a3',
            size: '28px',
            timer: 0.85
        });
        return true;
    },


    moveKasiyasToMapCenterForCrossGroggy: function(m, gameState) {
        if (!m || !gameState) return null;
        let center = null;
        if (typeof this.getBossFixedMapPosition === 'function') {
            center = this.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER');
        } else if (typeof BossActionSystem !== 'undefined' && BossActionSystem.getBossFixedMapPosition) {
            center = BossActionSystem.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER');
        }
        const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400);
        const targetX = Math.max(0, Math.min(worldW, parseFloat(center && center.x) || worldW / 2));
        const targetY = Math.max(0, Math.min(worldD, parseFloat(center && center.y) || worldD / 2));
        const fromX = parseFloat(m.x) || 0;
        const fromY = parseFloat(m.y) || 0;

        m.x = targetX;
        m.y = targetY;
        m.z = 0;
        m.vx = 0;
        m.vy = 0;
        m.kbVx = 0;
        m.kbVy = 0;
        if (m.boss) {
            m.boss.previewDashPath = null;
            m.boss.currentDashPath = null;
            m.boss.lastDashPath = null;
            m.boss.actionMove = null;
        }
        const p = gameState.player || null;
        if (p && Math.abs((parseFloat(p.x) || 0) - targetX) > 0.001) {
            m.faceDir = ((parseFloat(p.x) || 0) >= targetX) ? 1 : -1;
        }
        return { fromX, fromY, x: targetX, y: targetY };
    },

    resolveKasiyasMajorPattern3PendingCrossGroggy: function(m, gameState) {
        const boss = m && m.boss ? m.boss : null;
        const rt = boss && boss.majorPattern3Runtime ? boss.majorPattern3Runtime : null;
        const pending = rt && rt.pendingCrossSlashGroggy ? rt.pendingCrossSlashGroggy : null;
        if (!pending || pending.resolved) return false;
        pending.resolved = true;

        const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
        const p = gameState && gameState.player ? gameState.player : null;
        if (gameState) {
            gameState.screenHitFlash = { life: 0.42, maxLife: 0.42, strength: 0.95, mode: 'white' };
            gameState.effects.push({
                type: 'hitSpark',
                renderType: 'EFT_TEMPERED_BLADE_CROSS_BREAK',
                x: p ? p.x : m.x,
                y: p ? p.y : m.y,
                z: (p ? p.z + (p.bodyZ || 100) * 0.76 : m.z + bodyZ * 0.70),
                w: 360,
                h: 260,
                life: 0.78,
                maxLife: 0.78,
                burstScale: 2.8,
                color: 'rgba(255,250,210,0.98)',
                accentColor: 'rgba(255,220,92,0.96)'
            });
            gameState.effects.push({
                type: 'hitSpark',
                renderType: 'EFT_APOSTLE_GUARD_BREAK',
                x: m.x,
                y: m.y,
                z: m.z + bodyZ * 0.70,
                dir: m.faceDir || 1,
                w: ((m.d && m.d.bodyX) || 80) * (m.scale || 1) * 2.4,
                h: bodyZ,
                burstScale: 2.1,
                life: 0.58,
                maxLife: 0.58,
                color: 'rgba(255,232,95,0.98)',
                accentColor: 'rgba(255,90,64,0.96)'
            });
            if (Array.isArray(gameState.bossAttackObjects)) {
                gameState.bossAttackObjects.forEach(obj => {
                    if (!obj || obj.removed) return;
                    const objectId = String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim();
                    const objectType = String(obj.data && obj.data.Object_Type || '').trim().toUpperCase();
                    if (objectId === '251018' || objectType === 'KASIYAS_CLONE') {
                        gameState.effects.push({
                            type: 'hitSpark',
                            renderType: 'EFT_CLONE_DISAPPEAR',
                            x: obj.x,
                            y: obj.y,
                            z: obj.z + ((obj.d && obj.d.bodyZ) || 150) * 0.55,
                            w: ((obj.d && obj.d.bodyX) || 80) * (obj.scale || 1) * 1.7,
                            h: ((obj.d && obj.d.bodyZ) || 150) * (obj.scale || 1),
                            life: 0.28,
                            maxLife: 0.28
                        });
                    }
                });
            }
        }
        // 교차 발도는 돌진 도착지점에서 파훼 연출을 보여준 뒤,
        // 화면 플래시 중 맵 중앙으로 위치를 보정하고 그로기에 진입한다.
        const centerMove = (typeof this.moveKasiyasToMapCenterForCrossGroggy === 'function')
            ? this.moveKasiyasToMapCenterForCrossGroggy(m, gameState)
            : (BossCombatSystem.moveKasiyasToMapCenterForCrossGroggy
                ? BossCombatSystem.moveKasiyasToMapCenterForCrossGroggy.call(this, m, gameState)
                : null);
        if (gameState && centerMove) {
            const bodyZAfterMove = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            gameState.effects.push({
                type: 'hitSpark',
                renderType: 'EFT_CROSS_SLASH_GROGGY_CENTER_WARP',
                x: m.x,
                y: m.y,
                z: m.z + bodyZAfterMove * 0.64,
                dir: m.faceDir || 1,
                w: ((m.d && m.d.bodyX) || 80) * (m.scale || 1) * 2.2,
                h: bodyZAfterMove,
                burstScale: 1.8,
                life: 0.36,
                maxLife: 0.36,
                color: 'rgba(255,250,225,0.90)',
                accentColor: 'rgba(255,210,80,0.82)'
            });
        }

        const actionForGroggy = { ...(pending.action || {}) };
        if (pending.groggyTime !== null && pending.groggyTime !== undefined) actionForGroggy.Groggy_Time = pending.groggyTime;
        if (pending.groggyPoseType) actionForGroggy.Groggy_Pose_Type = pending.groggyPoseType;
        if (pending.groggyHitDmgRate !== null && pending.groggyHitDmgRate !== undefined) actionForGroggy.Groggy_Hit_DMG_Rate = pending.groggyHitDmgRate;
        return this.enterBossGroggyFromGuardSpecial(m, actionForGroggy, gameState, pending.result || {});
    },

    enterBossGroggyFromGuardSpecial: function(m, action, gameState, result) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !action || !gameState) return false;

        // 강인한 의지 가드 성공은 히든 보상 루트이므로 Groggy_Time(긴 그로기)을 우선 사용한다.
        const groggyTimeData = parseFloat(action.Groggy_Time);
        const parryResultValue = parseFloat(action.Parry_Result_Value);
        const groggyTime = Math.max(0.2, (!isNaN(groggyTimeData) && groggyTimeData > 0) ? groggyTimeData : ((!isNaN(parryResultValue) && parryResultValue > 0) ? parryResultValue : 2));
        const groggyPose = String(action.Groggy_Pose_Type || 'POSE_KASIYAS_P1_GROGGY').trim() || 'POSE_KASIYAS_P1_GROGGY';
        const pattern = boss.activePattern;

        if (pattern) {
            const patternId = String(pattern.Pattern_ID || '').trim();
            boss.patternCooldowns[patternId] = parseFloat(pattern.Pattern_Cooldown) || 1;
            this.pushBossDebugLog(
                gameState,
                'SPECIAL_GUARD',
                `${patternId} ${this.getBossDebugName(pattern)}`,
                `same apostle energy / groggy ${groggyTime.toFixed(1)}s`
            );
        }

        if (typeof this.clearKasiyasMajorPattern2Objects === 'function') {
            this.clearKasiyasMajorPattern2Objects(gameState, { removeActors: true });
        } else if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.clearKasiyasMajorPattern2Objects) {
            BossObjectSystem.clearKasiyasMajorPattern2Objects(gameState, { removeActors: true });
        }
        if (typeof this.clearKasiyasMajorPattern3Runtime === 'function') {
            this.clearKasiyasMajorPattern3Runtime(gameState, { removeActors: true, clearMark: true });
        } else if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.clearKasiyasMajorPattern3Runtime) {
            BossObjectSystem.clearKasiyasMajorPattern3Runtime(gameState, { removeActors: true, clearMark: true });
        }
        if (typeof PlayerManager !== 'undefined' && PlayerManager.clearP3OniCurse) {
            PlayerManager.clearP3OniCurse(gameState, { reason: 'GROGGY', keepBuff: true });
        }

        boss.activePattern = null;
        boss.currentActionIndex = -1;
        boss.currentLoopIndex = 0;
        boss.loopCount = 1;
        boss.action = null;
        boss.actionHitFired = false;
        boss.actionHitsDone = 0;
        boss.actionCycleTimer = 0;
        boss.previewDashPath = null;
        boss.currentDashPath = null;
        boss.actionMove = null;
        boss.parryWindowActive = false;
        boss.parryCueTimer = 0;
        boss.majorPattern2Runtime = null;
        boss.groggyTimer = groggyTime;
        boss.groggyMaxTime = groggyTime;
        boss.groggyPoseType = groggyPose;
        const groggyHitRate = parseFloat(action.Groggy_Hit_DMG_Rate);
        boss.groggyHitDmgRate = (!isNaN(groggyHitRate) && groggyHitRate >= 0) ? groggyHitRate : null;
        boss.noPatternWaitTimer = Math.max(boss.noPatternWaitTimer || 0, groggyTime);

        m.state = 'GROGGY';
        m.timer = 0;
        m.hasFired = false;
        m.kbVx = 0;
        m.kbVy = 0;

        this.ensureBossDebug(gameState).currentAction = null;
        this.ensureBossDebug(gameState).currentObjectAction = null;

        const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
        gameState.effects.push({
            type: 'hitSpark',
            renderType: 'EFT_APOSTLE_GUARD_BREAK',
            x: m.x,
            y: m.y,
            z: m.z + bodyZ * 0.70,
            dir: m.faceDir || 1,
            w: ((m.d && m.d.bodyX) || 80) * (m.scale || 1) * 2.0,
            h: bodyZ,
            burstScale: 2.3,
            life: 0.48,
            maxLife: 0.48,
            color: 'rgba(255,232,95,0.98)',
            accentColor: 'rgba(255,90,64,0.96)'
        });

        return true;
    },

    playerHasTemperedBladeGuard: function(player) {
        if (!player) return false;
        if (player.kasiyasTemperedBladeReady) return true;
        const buff = player.kasiyasOniMarkGuardBuff || null;
        return !!(buff && String(buff.type || '').trim().toUpperCase() === 'GRANT_TEMPERED_BLADE_GUARD');
    },

    consumeTemperedBladeGuard: function(player) {
        if (!player) return;
        player.kasiyasTemperedBladeReady = false;
        player.kasiyasTemperedBladeFlashTimer = 0;
        if (player.kasiyasOniMarkGuardBuff && player.kasiyasOniMarkGuardBuff.oneShot) {
            player.kasiyasOniMarkGuardBuff = null;
        }
    },

    getKasiyasP2M2FinalPortalDirectionForAction: function(action) {
        const id = String(action && action.Action_ID || '').trim();
        const group = String(action && action.Random_Action_Group || '').trim().toUpperCase();
        const name = String(action && action.Action_Name || '').trim();
        if (id === '242065' || group.indexOf('LEFT') >= 0 || name.indexOf('좌측') >= 0) return 'LEFT';
        if (id === '242062' || group.indexOf('RIGHT') >= 0 || name.indexOf('우측') >= 0) return 'RIGHT';
        return '';
    },

    findKasiyasP2M2MatchingFiredSword: function(gameState, direction) {
        const dir = String(direction || '').trim().toUpperCase();
        if (!dir || !gameState || !Array.isArray(gameState.bossAttackObjects)) return null;
        for (const obj of gameState.bossAttackObjects) {
            if (!obj || obj.active === false) continue;
            const kind = String(obj.kind || '').trim();
            const data = obj.data || {};
            const type = String(obj.objectType || data.Object_Type || '').trim().toUpperCase();
            const renderType = String(obj.renderType || data.Object_Render_Type || '').trim().toUpperCase();
            const isFired = kind === 'p2m2FiredGiantSword' || type === 'FIRE_OBJECT' || renderType === 'OBJ_P2_M2_FIRE_GIANT_SWORD';
            if (!isFired) continue;
            let fireDir = String(obj.fireDirection || '').trim().toUpperCase();
            if (fireDir !== 'LEFT' && fireDir !== 'RIGHT') fireDir = (parseFloat(obj.vx) || 0) < 0 ? 'LEFT' : 'RIGHT';
            if (fireDir === dir) return obj;
        }
        const remembered = gameState && gameState.p2m2LastFiredSword ? gameState.p2m2LastFiredSword : null;
        if (remembered) {
            const rememberedDir = String(remembered.direction || '').trim().toUpperCase();
            const timeLeft = parseFloat(remembered.timer) || 0;
            if (timeLeft > 0 && rememberedDir === dir) {
                return {
                    kind: 'p2m2FiredGiantSwordMemory',
                    fireDirection: rememberedDir,
                    x: Number.isFinite(parseFloat(remembered.x)) ? parseFloat(remembered.x) : ((dir === 'LEFT') ? 0 : (parseFloat(gameState.WORLD_WIDTH) || 1400)),
                    y: Number.isFinite(parseFloat(remembered.y)) ? parseFloat(remembered.y) : ((parseFloat(gameState.WORLD_DEPTH) || 400) * 0.5),
                    z: Number.isFinite(parseFloat(remembered.z)) ? parseFloat(remembered.z) : 180,
                    w: Number.isFinite(parseFloat(remembered.w)) ? parseFloat(remembered.w) : 300,
                    h: Number.isFinite(parseFloat(remembered.h)) ? parseFloat(remembered.h) : 160,
                    memory: true
                };
            }
        }
        return null;
    },


    getKasiyasP2M2FinalPortalImpactPosition: function(gameState, direction) {
        const dir = String(direction || '').trim().toUpperCase();
        const place = dir === 'LEFT' ? 'PLACE_MAP_LEFT_AIR' : 'PLACE_MAP_RIGHT_AIR';
        const pos = typeof this.getBossFixedMapPosition === 'function' ? this.getBossFixedMapPosition(gameState, place) : null;
        const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        return {
            x: pos && Number.isFinite(parseFloat(pos.x)) ? parseFloat(pos.x) : (dir === 'LEFT' ? Math.max(130, worldW * 0.105) : worldW - Math.max(130, worldW * 0.105)),
            y: pos && Number.isFinite(parseFloat(pos.y)) ? parseFloat(pos.y) : Math.max(34, worldD * 0.12),
            z: pos && Number.isFinite(parseFloat(pos.z)) ? parseFloat(pos.z) : 260
        };
    },

    startKasiyasP2M2PerfectBreakSequence: function(m, action, gameState, hitContext = {}) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !action || !gameState || boss.p2M2PerfectBreakPending) return false;
        const direction = this.getKasiyasP2M2FinalPortalDirectionForAction(action);
        const actionId = String(action.Action_ID || '').trim();
        const actionName = String(action.Action_Name || '').trim();
        const isPortalPhase = actionId === '242062' || actionId === '242066' || actionName.indexOf('포탈 열림') >= 0;
        const fired = hitContext && hitContext.fired ? hitContext.fired : null;
        const bodyZ = ((m.d && m.d.bodyZ) || 170) * (m.scale || 1);
        const portalImpact = isPortalPhase && typeof this.getKasiyasP2M2FinalPortalImpactPosition === 'function'
            ? this.getKasiyasP2M2FinalPortalImpactPosition(gameState, direction)
            : null;
        // 판정 구조는 안정판(step195)을 유지하되, 연출 좌표만 포탈/카시야스 실제 연출 위치에 가깝게 보정한다.
        const px = isPortalPhase
            ? (portalImpact && Number.isFinite(parseFloat(portalImpact.x)) ? parseFloat(portalImpact.x) : (fired && Number.isFinite(parseFloat(fired.x)) ? parseFloat(fired.x) : m.x))
            : (fired && Number.isFinite(parseFloat(fired.x)) ? (parseFloat(fired.x) + (parseFloat(m.x) || 0)) * 0.5 : m.x);
        const py = isPortalPhase
            ? (portalImpact && Number.isFinite(parseFloat(portalImpact.y)) ? parseFloat(portalImpact.y) : (fired && Number.isFinite(parseFloat(fired.y)) ? parseFloat(fired.y) : m.y))
            : (fired && Number.isFinite(parseFloat(fired.y)) ? (parseFloat(fired.y) + (parseFloat(m.y) || 0)) * 0.5 : m.y);
        const pz = isPortalPhase
            ? (portalImpact && Number.isFinite(parseFloat(portalImpact.z)) ? parseFloat(portalImpact.z) : (fired && Number.isFinite(parseFloat(fired.z)) ? parseFloat(fired.z) : 260))
            : (m.z + bodyZ * 0.70);
        const effectType = isPortalPhase ? 'EFT_KASIYAS_P2_M2_PORTAL_BREAK' : 'EFT_KASIYAS_P2_M2_GIANT_SWORD_CLASH';
        const effectDelay = 1.0;

        boss.p2M2FinalResolved = true;
        boss.p2M2PerfectBreakPending = {
            action: { ...action },
            direction,
            breakType: isPortalPhase ? 'PORTAL' : 'CLASH',
            breakX: px,
            breakY: py,
            breakZ: pz,
            effectType,
            effectDelay,
            effectFired: false,
            timer: 0,
            // 안정판의 방향 일치 기반 파훼는 유지하고, 투사체가 날아가는 시간을 약 1초 확보한 뒤 연출을 시작한다.
            duration: 3.35,
            flashTime: effectDelay + 1.42,
            whiteHoldTime: 1.18,
            flashed: false,
            centerMoved: false
        };
        boss.action = null;
        boss.actionHitFired = false;
        boss.actionHitsDone = 0;
        boss.actionCycleTimer = 0;
        boss.previewDashPath = null;
        boss.currentDashPath = null;
        boss.lastDashPath = null;
        boss.actionMove = null;
        boss.parryWindowActive = false;
        boss.parryCueTimer = 0;
        // 포탈 붕괴형 완전 파훼에서는 그로기 전까지 카시야스 본체를 노출하지 않는다.
        // 충돌형은 충돌 장면까지는 보이고, 흰 화면 전환 이후 숨긴다.
        boss.kasiyasP2M2Hidden = isPortalPhase;
        boss.kasiyasP1M3RushHidden = false;
        m.state = 'IDLE';
        m.kbVx = 0;
        m.kbVy = 0;
        m.vx = 0;
        m.vy = 0;

        if (Array.isArray(gameState.bossAttackObjects)) {
            const keepLife = Math.max(3.35, parseFloat(boss.p2M2PerfectBreakPending && boss.p2M2PerfectBreakPending.duration) || 3.35);
            gameState.bossAttackObjects.forEach(obj => {
                if (!obj) return;
                const rt = String(obj.renderType || obj.data && obj.data.Object_Render_Type || '').toUpperCase();
                const isFiredSword = obj.kind === 'p2m2FiredGiantSword' || rt.indexOf('P2_M2_FIRE_GIANT_SWORD') >= 0;
                if (isFiredSword) {
                    // 완전 파훼 예약 시점에 발사체를 바로 제거하면, 지연 연출을 넣어도 검이 날아가는 모습이 사라진다.
                    // 발사체는 그로기 진입/패턴 정리 시 일괄 정리되도록 유지한다.
                    obj.keepUntilPerfectBreakCleanup = true;
                    obj.maxLife = Math.max(parseFloat(obj.maxLife) || 0, keepLife);
                }
            });
        }
        gameState.p2m2LastFiredSword = null;

        // 완전 파훼 확정 직후에는 바로 폭발 연출을 띄우지 않고, 투사체가 날아가는 체감 시간을 확보한다.
        // 실제 붕괴/충돌 이펙트와 안내는 updateKasiyasP2M2PerfectBreakSequence에서 effectDelay 후 재생한다.
        return true;
    },

    updateKasiyasP2M2PerfectBreakSequence: function(m, deltaTime, gameState) {
        const boss = m && m.boss ? m.boss : null;
        const pending = boss && boss.p2M2PerfectBreakPending ? boss.p2M2PerfectBreakPending : null;
        if (!pending || !gameState) return false;
        const dt = Math.max(0, parseFloat(deltaTime) || 0);
        pending.timer = Math.max(0, (parseFloat(pending.timer) || 0) + dt);
        m.state = 'IDLE';
        m.kbVx = 0;
        m.kbVy = 0;
        m.vx = 0;
        m.vy = 0;
        boss.action = null;
        // 연출 중 멀뚱히 서 있는 본체가 보이지 않도록 숨김 상태를 유지한다.
        boss.kasiyasP2M2Hidden = pending.breakType === 'PORTAL' || !!pending.flashed;

        if (!pending.effectFired && pending.timer >= (parseFloat(pending.effectDelay) || 0)) {
            pending.effectFired = true;
            const bodyZForEffect = ((m.d && m.d.bodyZ) || 170) * (m.scale || 1);
            const isPortalBreak = String(pending.breakType || '').toUpperCase() === 'PORTAL';
            const ex = Number.isFinite(parseFloat(pending.breakX)) ? parseFloat(pending.breakX) : (isPortalBreak ? m.x : m.x);
            const ey = Number.isFinite(parseFloat(pending.breakY)) ? parseFloat(pending.breakY) : (isPortalBreak ? m.y : m.y);
            const ez = Number.isFinite(parseFloat(pending.breakZ)) ? parseFloat(pending.breakZ) : (m.z + bodyZForEffect * 0.70);
            const dirSign = String(pending.direction || '').toUpperCase() === 'LEFT' ? -1 : 1;
            if (Array.isArray(gameState.effects)) {
                gameState.effects.push({
                    type: 'p2m2PerfectBreak',
                    renderType: pending.effectType || (isPortalBreak ? 'EFT_KASIYAS_P2_M2_PORTAL_BREAK' : 'EFT_KASIYAS_P2_M2_GIANT_SWORD_CLASH'),
                    x: ex,
                    y: ey,
                    z: ez,
                    dir: dirSign,
                    w: isPortalBreak ? 680 : 520,
                    h: isPortalBreak ? 440 : 320,
                    life: 1.45,
                    maxLife: 1.45,
                    color: isPortalBreak ? 'rgba(120,220,255,0.96)' : 'rgba(255,232,190,0.98)',
                    accentColor: isPortalBreak ? 'rgba(126,42,255,0.90)' : 'rgba(255,46,36,0.95)'
                });
                gameState.effects.push({
                    type: 'hitSpark',
                    renderType: 'EFT_KASIYAS_P2_M2_PERFECT_BREAK_FLASH',
                    x: ex,
                    y: ey,
                    z: ez,
                    w: isPortalBreak ? 560 : 520,
                    h: isPortalBreak ? 360 : 330,
                    life: 0.72,
                    maxLife: 0.72,
                    color: 'rgba(255,250,220,0.96)',
                    accentColor: isPortalBreak ? 'rgba(100,220,255,0.82)' : 'rgba(255,140,88,0.86)'
                });
            }
            if (Array.isArray(gameState.floatingTexts)) {
                const textX = isPortalBreak ? ex : m.x;
                const textY = isPortalBreak ? ey : m.y;
                const textZ = isPortalBreak ? ez + 90 : m.z + bodyZForEffect + 76;
            }
            try { pushSystemNotice(isPortalBreak ? '거대한 검이 차원문을 붕괴시켰다!' : '거대한 검이 카시야스를 저지했다!', '#86f4ff', 1.1); } catch(e) {}
        }

        if (!pending.flashed && pending.timer >= pending.flashTime) {
            pending.flashed = true;
            // 밝은 전환 화면은 즉시 번쩍이지 않고 약 1초 동안 서서히 하얘진 뒤,
            // 그로기 진입 직전에 약한 플래시만 주도록 한다.
            gameState.screenHitFlash = {
                life: pending.whiteHoldTime || 1.18,
                maxLife: pending.whiteHoldTime || 1.18,
                strength: 0.92,
                mode: 'fullWhite',
                rampTime: 1.0,
                peakFlashTime: 0.12,
                fadeOutTime: 0.04
            };
            boss.kasiyasP2M2Hidden = true;
            const center = typeof this.getBossFixedMapPosition === 'function' ? this.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER') : null;
            if (center) {
                m.x = parseFloat(center.x) || m.x;
                m.y = parseFloat(center.y) || m.y;
            }
            m.z = 0;
            boss.previewDashPath = null;
            boss.currentDashPath = null;
            boss.lastDashPath = null;
            boss.actionMove = null;
            const bodyZ = ((m.d && m.d.bodyZ) || 170) * (m.scale || 1);
            if (Array.isArray(gameState.effects)) {
                gameState.effects.push({
                    type: 'hitSpark',
                    renderType: 'EFT_CROSS_SLASH_GROGGY_CENTER_WARP',
                    x: m.x,
                    y: m.y,
                    z: m.z + bodyZ * 0.65,
                    w: ((m.d && m.d.bodyX) || 90) * (m.scale || 1) * 2.8,
                    h: bodyZ * 1.1,
                    life: 0.42,
                    maxLife: 0.42,
                    color: 'rgba(255,255,232,0.94)',
                    accentColor: 'rgba(120,220,255,0.88)'
                });
            }
        }

        if (pending.timer >= pending.duration) {
            const action = pending.action || {};
            boss.p2M2PerfectBreakPending = null;
            return this.enterKasiyasP2M2FinalGroggy(m, action, gameState, 'PERFECT');
        }
        return true;
    },

    enterKasiyasP2M2FinalGroggy: function(m, action, gameState, mode = 'PERFECT') {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !gameState || !action) return false;
        const perfect = String(mode || '').toUpperCase() !== 'PARTIAL';
        const groggyTime = Math.max(0.2, parseFloat(action.Groggy_Time) || (perfect ? 8 : 5));
        const groggyPose = String(action.Groggy_Pose_Type || 'POSE_KASIYAS_P2_GROGGY').trim() || 'POSE_KASIYAS_P2_GROGGY';
        const groggyHitRate = parseFloat(action.Groggy_Hit_DMG_Rate);
        const center = typeof this.getBossFixedMapPosition === 'function' ? this.getBossFixedMapPosition(gameState, 'PLACE_MAP_CENTER') : null;
        if (center) {
            m.x = parseFloat(center.x) || m.x;
            m.y = parseFloat(center.y) || m.y;
        }
        m.z = 0;
        boss.kasiyasP2M2Hidden = false;
        boss.kasiyasP1M3RushHidden = false;
        boss.p2M2FinalResolved = true;
        if (typeof this.clearKasiyasP2MajorPattern2Runtime === 'function') {
            this.clearKasiyasP2MajorPattern2Runtime(gameState, { removeObjects: true, keepProgressObjects: false });
        }
        if (Array.isArray(gameState.bossAttackObjects)) {
            gameState.bossAttackObjects = gameState.bossAttackObjects.filter(obj => !(obj && (obj.kind === 'p2m2FiredGiantSword' || String(obj.renderType || obj.data && obj.data.Object_Render_Type || '').toUpperCase().indexOf('P2_M2_FIRE_GIANT_SWORD') >= 0)));
        }
        gameState.p2m2LastFiredSword = null;
        boss.activePattern = null;
        boss.currentActionIndex = -1;
        boss.currentLoopIndex = 0;
        boss.loopCount = 1;
        boss.action = null;
        boss.actionHitFired = false;
        boss.actionHitsDone = 0;
        boss.actionCycleTimer = 0;
        boss.previewDashPath = null;
        boss.currentDashPath = null;
        boss.actionMove = null;
        boss.parryWindowActive = false;
        boss.parryCueTimer = 0;
        boss.groggyTimer = groggyTime;
        boss.groggyMaxTime = groggyTime;
        boss.groggyPoseType = groggyPose;
        boss.groggyHitDmgRate = (!isNaN(groggyHitRate) && groggyHitRate >= 0) ? groggyHitRate : null;
        boss.noPatternWaitTimer = Math.max(boss.noPatternWaitTimer || 0, groggyTime);
        m.state = 'GROGGY';
        m.timer = 0;
        m.hasFired = false;
        m.kbVx = 0;
        m.kbVy = 0;
        const p = gameState.player || null;
        if (!perfect && p) {
            p.hasP2M2ApostleSwordEnergy = false;
            p.p2m2ApostleSwordEnergyTimer = 0;
        }
        const bodyZ = ((m.d && m.d.bodyZ) || 170) * (m.scale || 1);
        if (Array.isArray(gameState.effects)) {
            gameState.effects.push({
                type: 'hitSpark',
                renderType: perfect ? 'EFT_P2_M2_FINAL_PORTAL_BREAK' : 'EFT_APOSTLE_GUARD_BREAK',
                x: m.x, y: m.y, z: m.z + bodyZ * 0.68,
                w: ((m.d && m.d.bodyX) || 90) * (m.scale || 1) * (perfect ? 3.0 : 2.2),
                h: bodyZ * (perfect ? 1.35 : 1.0),
                life: perfect ? 0.62 : 0.42,
                maxLife: perfect ? 0.62 : 0.42,
                color: perfect ? 'rgba(120,220,255,0.96)' : 'rgba(255,232,95,0.98)',
                accentColor: perfect ? 'rgba(120,42,255,0.88)' : 'rgba(255,90,64,0.96)'
            });
        }
        if (Array.isArray(gameState.floatingTexts)) {
        }

        this.ensureBossDebug(gameState).currentAction = null;
        this.ensureBossDebug(gameState).currentObjectAction = null;
        return true;
    },

    tryResolveKasiyasP2M2FinalPortalHit: function(m, action, gameState) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !action || !gameState || boss.p2M2FinalResolved) return false;
        const patternId = String(action.Pattern_ID || boss.activePattern && boss.activePattern.Pattern_ID || '').trim();
        const cond = String(action.Groggy_Occurrence_Cond || '').trim().toUpperCase();
        if (patternId !== '232007' || cond !== 'HIT_FIRE_OBJECT') return false;
        const dir = this.getKasiyasP2M2FinalPortalDirectionForAction(action);
        if (!dir) return false;
        const fired = this.findKasiyasP2M2MatchingFiredSword(gameState, dir);
        if (!fired) return false;
        // 완전 파훼 판정이 성공해도 발사체를 즉시 비활성화하지 않는다.
        // step196~198에서 1초 지연 연출을 넣은 상태에서 여기서 active=false를 해버리면
        // 검이 날아가는 모습이 사라지므로, 그로기 진입/패턴 정리 시점까지 유지한다.
        if (!fired.memory) {
            fired.keepUntilPerfectBreakCleanup = true;
            fired.maxLife = Math.max(parseFloat(fired.maxLife) || 0, 4.2);
        }
        return this.startKasiyasP2M2PerfectBreakSequence(m, action, gameState, { fired });
    },

    tryApplyBossGuardSpecialResult: function(m, action, guardResult, gameState) {
        if (!m || !action || !guardResult || !guardResult.guarded || !gameState) return false;
        const boss = m && m.boss ? m.boss : null;
        const specialType = String(action.Guard_Special_Result_Type || '').trim().toUpperCase();
        const specialValue = String(action.Guard_Special_Result_Value || '').trim();
        const cond = String(action.Guard_Special_Result_Occurrence_Cond || '').trim().toUpperCase();
        const groggyCond = String(action.Groggy_Occurrence_Cond || '').trim().toUpperCase();
        const actionCond = String(action.Action_Condition_Type || '').trim().toUpperCase();

        // 데이터 기반 그로기 조건. Guard_Special_Result_Type이 BOSS_GROGGY가 아니어도,
        // Groggy_Occurrence_Cond=ATK_GUARD이면 가드 성공 시 그로기 처리를 수행한다.
        if (groggyCond === 'ATK_GUARD') {
            if (specialType === 'PLAYER_GET_OBJECT' && specialValue) {
                const objData = gameState && gameState.DB_BOSS_PATTERN_OBJECT ? gameState.DB_BOSS_PATTERN_OBJECT[specialValue] : null;
                const objType = String(objData && objData.Object_Type || '').trim().toUpperCase();
                if (objType === 'PLAYER_BUFF') {
                    const renderType = String(objData.Object_Render_Type || '').trim().toUpperCase();
                    if (renderType === 'OBJ_P3_PLAYER_BUFF_02' && typeof PlayerManager !== 'undefined' && PlayerManager.grantP3TrialBodyBuff) {
                        PlayerManager.grantP3TrialBodyBuff(gameState, objData);
                    } else if (typeof PlayerManager !== 'undefined' && PlayerManager.grantP3TrialWillBuff) {
                        PlayerManager.grantP3TrialWillBuff(gameState, objData);
                    }
                }
            }
            if (actionCond === 'P3_M2_ONLY_CENTER_DISTORTION_EXISTS' && typeof BossObjectSystem !== 'undefined' && BossObjectSystem.removeKasiyasP3M2CenterDistortionSilently) {
                BossObjectSystem.removeKasiyasP3M2CenterDistortionSilently.call(this, gameState);
            }
            return this.enterBossGroggyFromGuardSpecial(m, action, gameState, guardResult);
        }

        if (specialType !== 'BOSS_GROGGY' && specialType !== 'CLONE_OWNER_GROGGY') return false;

        if (cond === 'ATK_GUARD') {
            return this.enterBossGroggyFromGuardSpecial(m, action, gameState, guardResult);
        }

        if (cond === 'ATK_GUARD_TWO_SAME_APOSTLE_ENERGY') {
            if (!this.hasTwoSameKasiyasApostleEnergies(gameState.player)) return false;
            return this.enterBossGroggyFromGuardSpecial(m, action, gameState, guardResult);
        }

        if (cond === 'ATK_GUARD_GRANT_TEMPERED_BLADE_GUARD') {
            if (!this.playerHasTemperedBladeGuard(gameState.player)) return false;
            if (boss && boss.majorPattern3Runtime && (boss.majorPattern3Runtime.crossSlashSpecialResolved || boss.majorPattern3Runtime.pendingCrossSlashGroggy)) return false;
            return this.queueKasiyasMajorPattern3CrossGuardResolve(m, action, gameState, guardResult);
        }

        if (cond === 'ATK_GUARD_WITH_APOSTLE_ENERGY') {
            const p = gameState && gameState.player ? gameState.player : null;
            if (!p || !p.hasP2M2ApostleSwordEnergy) return false;
            return this.enterKasiyasP2M2FinalGroggy(m, action, gameState, 'PARTIAL');
        }

        if (cond === 'ATK_GUARD_WITH_P3_PLAYER_BUFF_01') {
            const p = gameState && gameState.player ? gameState.player : null;
            if (!p || !p.p3TrialWillBuff) return false;
            return this.enterBossGroggyFromGuardSpecial(m, action, gameState, guardResult);
        }

        return false;
    },


    updateKasiyasOniMarkPulse: function(gameState, pulse) {
        const mark = gameState && gameState.player ? gameState.player.kasiyasOniMark : null;
        if (!mark || !mark.active) return;
        mark.pulse = !!pulse;
        if (pulse) mark.flashTimer = Math.max(parseFloat(mark.flashTimer) || 0, 0.35);
    },

    applyKasiyasOniMarkAttackResult: function(gameState, sourceKind, attackData, result, attacker) {
        const p = gameState && gameState.player ? gameState.player : null;
        const mark = p && p.kasiyasOniMark ? p.kasiyasOniMark : null;
        if (!mark || !mark.active || !result) return;
        const kind = String(sourceKind || '').trim().toUpperCase();
        const guarded = !!result.guarded;
        if (guarded) {
            if (kind === 'CLONE') mark.cloneGuardCount = (parseInt(mark.cloneGuardCount) || 0) + 1;
            else mark.bossGuardCount = (parseInt(mark.bossGuardCount) || 0) + 1;
            mark.flashTimer = Math.max(parseFloat(mark.flashTimer) || 0, 0.45);
            if ((mark.bossGuardCount || 0) >= (mark.requireBossGuard || 2) && (mark.cloneGuardCount || 0) >= (mark.requireCloneGuard || 2)) {
                mark.active = false;
                p.kasiyasTemperedBladeReady = true;
                p.kasiyasTemperedBladeFlashTimer = 1.0;
                const buffType = String(mark.removeEffectType || '').trim().toUpperCase();
                const buffValue = Math.max(0, parseFloat(mark.removeEffectValue) || 0);
                if (buffType && buffValue > 0) {
                    p.kasiyasOniMarkGuardBuff = { type: buffType, value: buffValue, oneShot: true };
                }
                gameState.effects.push({
                    type: 'guard',
                    renderType: 'EFT_KASIYAS_ONI_MARK_BURST',
                    x: p.x,
                    y: p.y,
                    z: p.z + (p.bodyZ || 100) * 0.75,
                    w: Math.max(130, (p.bodyX || 60) * (p.scale || 1) * 2.0),
                    h: Math.max(130, (p.bodyZ || 100) * (p.scale || 1) * 1.2),
                    life: 0.45,
                    maxLife: 0.45
                });
                gameState.effects.push({
                    type: 'hitSpark',
                    renderType: 'EFT_KASIYAS_TEMPERED_BLADE_READY',
                    x: p.x,
                    y: p.y,
                    z: p.z + (p.bodyZ || 100) * 0.70,
                    w: Math.max(150, (p.bodyX || 60) * (p.scale || 1) * 2.6),
                    h: Math.max(160, (p.bodyZ || 100) * (p.scale || 1) * 1.35),
                    life: 0.70,
                    maxLife: 0.70,
                    burstScale: 1.6,
                    color: 'rgba(255,232,104,0.98)',
                    accentColor: 'rgba(170,238,255,0.86)'
                });

            }
            return;
        }

        mark.stack = (parseInt(mark.stack) || 0) + 1;
        mark.flashTimer = Math.max(parseFloat(mark.flashTimer) || 0, 0.75);
        if ((mark.stack || 0) >= (mark.maxStack || 3)) {
            const owner = attacker && attacker.owner ? attacker.owner : attacker;
            const atk = owner && owner.d ? (parseFloat(owner.d.atk) || 50) : 50;
            const dmgRate = Math.max(1, parseFloat(mark.burstDamageRate) || 5);
            const damage = Math.max(1, atk * dmgRate - (parseFloat(p.def) || 0));
            if (!(typeof PlayerManager !== 'undefined' && PlayerManager.isPracticeModeHpInvincible ? PlayerManager.isPracticeModeHpInvincible(gameState) : false)) p.hp = Math.max(0, (parseFloat(p.hp) || 0) - damage);
            if (typeof PlayerManager !== 'undefined' && PlayerManager.loseFightingSpirit) PlayerManager.loseFightingSpirit(gameState, p.fightingSpirit || 0);
            gameState.effects.push({
                type: 'hitSpark',
                renderType: 'EFT_KASIYAS_ONI_MARK_BURST',
                x: p.x,
                y: p.y,
                z: p.z + (p.bodyZ || 100) * 0.72,
                w: 170,
                h: 170,
                life: 0.48,
                maxLife: 0.48,
                color: 'rgba(255,32,44,0.96)',
                accentColor: 'rgba(36,0,0,0.92)'
            });
            gameState.effects.push({
                type: 'hitSpark',
                renderType: 'EFT_KASIYAS_ONI_MARK_SLASH_WOUNDS',
                x: p.x,
                y: p.y,
                z: p.z + (p.bodyZ || 100) * 0.48,
                w: Math.max(120, (p.bodyX || 60) * (p.scale || 1) * 2.2),
                h: Math.max(150, (p.bodyZ || 100) * (p.scale || 1) * 1.25),
                life: 0.78,
                maxLife: 0.78,
                burstScale: 1.45,
                color: 'rgba(255,42,46,0.96)',
                accentColor: 'rgba(20,0,0,0.96)'
            });
            p.state = 'Hit';
            p.atkTimer = Math.max(parseFloat(p.atkTimer) || 0, Math.max(0.65, (parseFloat(p.hitDur) || 0.25) * 2.6));
            p.isRunning = false;
            p.runDirection = null;
            p.guardTimer = 0;
            p.kbVx = 0;
            p.kbVy = 0;
            gameState.screenHitFlash = { life: 0.30, maxLife: 0.30, strength: 0.92, mode: 'red' };
            gameState.floatingTexts.push({
                x: p.x,
                y: p.y,
                z: p.z + (p.bodyZ || 100) + 92,
                text: '낙인 폭발',
                color: '#ff3030',
                size: '28px',
                timer: 1.0
            });
            p.kasiyasOniMark = null;
        }
    },

    enterBossGroggyFromParry: function(m, action, gameState) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !action) return;

        // 저주 상태에서 공격으로 받아내는 일반 루트는 Parry_Result_Value(짧은 그로기)를 우선 사용한다.
        const parryResultValue = parseFloat(action.Parry_Result_Value);
        const groggyTimeData = parseFloat(action.Groggy_Time);
        const groggyTime = Math.max(0.2, (!isNaN(parryResultValue) && parryResultValue > 0) ? parryResultValue : ((!isNaN(groggyTimeData) && groggyTimeData > 0) ? groggyTimeData : 2));
        const groggyPose = String(action.Groggy_Pose_Type || 'POSE_KASIYAS_P1_GROGGY').trim() || 'POSE_KASIYAS_P1_GROGGY';
        const successEffect = String(action.Parry_Success_EFT_Type || 'EFT_SUCCESS_PARRY').trim() || 'EFT_SUCCESS_PARRY';
        const pattern = boss.activePattern;

        if (pattern) {
            const patternId = String(pattern.Pattern_ID || '').trim();
            boss.patternCooldowns[patternId] = parseFloat(pattern.Pattern_Cooldown) || 1;
            this.pushBossDebugLog(
                gameState,
                'PARRY',
                `${patternId} ${this.getBossDebugName(pattern)}`,
                `success / groggy ${groggyTime.toFixed(1)}s`
            );
        }
        if (typeof PlayerManager !== 'undefined' && PlayerManager.clearP3OniCurse) {
            PlayerManager.clearP3OniCurse(gameState, { reason: 'GROGGY', keepBuff: true });
        }

        boss.activePattern = null;
        boss.currentActionIndex = -1;
        boss.currentLoopIndex = 0;
        boss.loopCount = 1;
        boss.action = null;
        boss.actionHitFired = false;
        boss.actionHitsDone = 0;
        boss.actionCycleTimer = 0;
        boss.previewDashPath = null;
        boss.currentDashPath = null;
        boss.actionMove = null;
        boss.parryWindowActive = false;
        boss.parryCueTimer = 0;
        boss.groggyTimer = groggyTime;
        boss.groggyMaxTime = groggyTime;
        boss.groggyPoseType = groggyPose;
        const groggyHitRate = parseFloat(action.Groggy_Hit_DMG_Rate);
        boss.groggyHitDmgRate = (!isNaN(groggyHitRate) && groggyHitRate >= 0) ? groggyHitRate : null;
        boss.noPatternWaitTimer = Math.max(boss.noPatternWaitTimer || 0, groggyTime);

        m.state = 'GROGGY';
        m.timer = 0;
        m.hasFired = false;
        m.kbVx = 0;
        m.kbVy = 0;

        this.ensureBossDebug(gameState).currentAction = null;
        this.ensureBossDebug(gameState).currentObjectAction = null;

        const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
        gameState.effects.push({
            type: 'hitSpark',
            renderType: successEffect,
            x: m.x,
            y: m.y,
            z: m.z + bodyZ * 0.70,
            dir: m.faceDir || 1,
            w: ((m.d && m.d.bodyX) || 80) * (m.scale || 1) * 1.8,
            h: bodyZ,
            burstScale: 2.1,
            life: 0.45,
            maxLife: 0.45,
            color: 'rgba(255,238,90,0.98)',
            accentColor: 'rgba(255,255,255,0.96)'
        });

    },
    tryResolveBossParryByPlayerHit: function(m, gameState) {
        const boss = m && m.boss ? m.boss : null;
        const action = boss && boss.action ? boss.action : null;
        if (!boss || !action || boss.groggyTimer > 0) return false;
        if (!this.isBossParryWindowActive(m, action)) return false;

        const requireType = String(action.Parry_Require_Hit_Type || 'PLAYER_ATTACK').trim().toUpperCase();
        if (requireType && requireType !== 'PLAYER_ATTACK' && requireType !== 'PLAYER_ANY_ATTACK') return false;
        if (!this.isPlayerInsideBossParryRange(m, action, gameState)) return false;

        this.enterBossGroggyFromParry(m, action, gameState);
        return true;
    },
    getBossExplicitActionDamageRate: function(action) {
        if (!action) return null;
        const raw = action.Action_Hit_DMG_Rate;
        if (raw === null || raw === undefined || raw === '') return null;
        const rate = parseFloat(raw);
        return (!isNaN(rate) && rate >= 0) ? rate : null;
    },
    getBossDefaultDamageRate: function(m) {
        const rate = parseFloat(m && m.d && m.d.defaultHitDmgRate);
        return (!isNaN(rate) && rate >= 0) ? rate : 1;
    },
    getBossReceivedDamageRate: function(m) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss) return this.getBossDefaultDamageRate(m);

        if ((parseFloat(boss.groggyTimer) || 0) > 0) {
            const groggyRate = parseFloat(boss.groggyHitDmgRate);
            if (!isNaN(groggyRate) && groggyRate >= 0) return groggyRate;
            return this.getBossDefaultDamageRate(m);
        }

        const action = boss.action || null;
        const explicitRate = this.getBossExplicitActionDamageRate(action);
        if (explicitRate !== null) return explicitRate;

        const defenceType = String(action && action.Action_Defence_Type || '').trim().toUpperCase();
        if (defenceType === 'INVINCIBLE') return 0;

        return this.getBossDefaultDamageRate(m);
    },
    isBossFrontDamageImmuneAgainstPlayer: function(m, gameState) {
        if (!m || !gameState || !gameState.player) return false;
        const boss = m.boss || null;
        const action = boss && boss.action ? boss.action : null;
        const defenceType = String(action && action.Action_Defence_Type || '').trim().toUpperCase();
        if (defenceType !== 'FRONT_DMG_IMMUNE' && defenceType !== 'FRONT_DAMAGE_IMMUNE' && defenceType !== 'FRONT_INVINCIBLE') return false;
        const p = gameState.player;
        const scale = parseFloat(m.scale) || 1;
        const bodyX = ((m.d && parseFloat(m.d.bodyX)) || 80) * scale;
        const bodyY = ((m.d && parseFloat(m.d.bodyY)) || 60) * scale;
        const storedFace = boss && Number.isFinite(parseFloat(boss.doubleEdgeSpinFaceDir)) ? parseFloat(boss.doubleEdgeSpinFaceDir) : null;
        const face = storedFace !== null ? (storedFace < 0 ? -1 : 1) : ((m.faceDir === -1) ? -1 : 1);
        const px = Number.isFinite(parseFloat(p.x)) ? parseFloat(p.x) : 0;
        const py = Number.isFinite(parseFloat(p.y)) ? parseFloat(p.y) : 0;
        const mx = Number.isFinite(parseFloat(m.x)) ? parseFloat(m.x) : 0;
        const my = Number.isFinite(parseFloat(m.y)) ? parseFloat(m.y) : 0;
        const dx = px - mx;
        const dy = Math.abs(py - my);
        const signedFrontX = dx * face;

        const rawHitX = parseFloat(action.Hitbox_Size_X);
        const rawHitY = parseFloat(action.Hitbox_Size_Y);
        const rawOffsetX = parseFloat(action.Hitbox_Offset_X);
        const hitW = Math.max(bodyX * 1.55, Number.isFinite(rawHitX) && rawHitX > 0 ? rawHitX * scale : bodyX * 2.4);
        const hitD = Math.max(bodyY * 2.2, Number.isFinite(rawHitY) && rawHitY > 0 ? rawHitY * scale : bodyY * 3.0);
        const offX = (Number.isFinite(rawOffsetX) ? rawOffsetX : 0) * scale;

        // 양날검 회전 전진은 이동 중 faceDir이 흔들릴 수 있으므로, 액션 시작 시 저장한 방향과
        // 실제 회전 칼날 히트박스 범위를 함께 사용해 전방 면역 영역을 안정화한다.
        const frontStart = -bodyX * 0.55;
        const frontEnd = Math.max(bodyX * 2.3, offX + hitW * 0.65 + bodyX * 0.35);
        const sideTolerance = Math.max(bodyY * 2.8, hitD * 0.80);
        return signedFrontX >= frontStart && signedFrontX <= frontEnd && dy <= sideTolerance;
    },

    takeDamage: function(m, baseDmg, gameState) {
        const boss = m && m.boss ? m.boss : null;
        const action = boss && boss.action ? boss.action : null;
        const explicitActionRate = this.getBossExplicitActionDamageRate(action);
        const defenceType = String(action && action.Action_Defence_Type || '').trim().toUpperCase();

        if (boss && boss.kasiyasP2M2Hidden) {
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            if (gameState && Array.isArray(gameState.floatingTexts)) {
                gameState.floatingTexts.push({
                    x: m.x, y: m.y, z: (m.z || 0) + bodyZ + 18,
                    text: '차원 은신', color: '#cfa6ff', size: '22px', timer: 0.45
                });
            }
            return;
        }

        if (this.tryResolveBossParryByPlayerHit && this.tryResolveBossParryByPlayerHit(m, gameState)) {
            return;
        }

        if (this.isBossFrontDamageImmuneAgainstPlayer && this.isBossFrontDamageImmuneAgainstPlayer(m, gameState)) {
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            gameState.floatingTexts.push({
                x: m.x,
                y: m.y,
                z: m.z + bodyZ + 18,
                text: '전방 면역',
                color: '#ffb8a8',
                size: '22px',
                timer: 0.45
            });
            if (Array.isArray(gameState.effects)) {
                gameState.effects.push({
                    type: 'hitSpark',
                    renderType: 'EFT_KASIYAS_P2_DOUBLE_EDGED_SWORD_SPIN',
                    x: m.x + (m.faceDir === -1 ? -1 : 1) * (((m.d && m.d.bodyX) || 80) * (m.scale || 1) * 0.72),
                    y: m.y,
                    z: m.z + bodyZ * 0.50,
                    dir: m.faceDir || 1,
                    w: Math.max(118, ((m.d && m.d.bodyX) || 80) * (m.scale || 1) * 1.32),
                    h: Math.max(160, bodyZ * 0.94),
                    life: 0.20,
                    maxLife: 0.20,
                    color: 'rgba(92,6,8,0.78)',
                    accentColor: 'rgba(226,32,24,0.72)'
                });
            }
            return;
        }

        if (defenceType === 'INVINCIBLE' && explicitActionRate === null) {
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            gameState.floatingTexts.push({
                x: m.x,
                y: m.y,
                z: m.z + bodyZ + 18,
                text: '무적',
                color: '#ffb8a8',
                size: '22px',
                timer: 0.45
            });
            return;
        }

        let scaledDmg = calcScaledDamage(gameState.player.level, m.d.level, baseDmg);
        let finalDmg = Math.max(1, scaledDmg - m.d.def);
        // F12 디버그 슈퍼 모드: 후반부 진입 테스트를 쉽게 하기 위해 보스가 받는 플레이어 피해만 10배로 증폭한다.
        // 차원 방어전 전용 검기 HP/스킬 판정에는 적용하지 않는다.
        if (gameState && gameState.superDamageMode && !(gameState.specialMode === 'P2_M3_DIMENSION_DEFENSE')) {
            finalDmg *= 10;
        }
        const receivedRate = this.getBossReceivedDamageRate(m);
        finalDmg = receivedRate <= 0 ? 0 : Math.max(1, finalDmg * receivedRate);
        if (finalDmg <= 0) {
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            gameState.floatingTexts.push({
                x: m.x,
                y: m.y,
                z: m.z + bodyZ + 18,
                text: '피해 0%',
                color: '#ffb8a8',
                size: '22px',
                timer: 0.45
            });
            return;
        }
        m.hp -= finalDmg;
        
        gameState.floatingTexts.push({x: m.x, y: m.y, z: m.z + (m.d.bodyZ * m.scale) + 20, text: `${finalDmg.toFixed(0)}`, color: receivedRate < 1 ? "#d7ecff" : "#fff", size: "36px", timer: 1.0});
        gameState.effects.push({ type: 'hitSpark', renderType: 'EFT_HIT', x: m.x, y: m.y, z: m.z + m.d.bodyZ*m.scale/2, life: 0.15, maxLife: 0.15 });

        gameState.targetUI.monster = m; gameState.targetUI.timer = 3.0;
        m.isProvoked = true;

        const isBossGroggy = boss && (parseFloat(boss.groggyTimer) || 0) > 0;
        if (isBossGroggy) {
            // 그로기 중에는 데미지/폰트/피격 이펙트만 적용하고,
            // 일반 HIT 상태 전환·넉백으로 그로기 포즈와 타이머가 흔들리지 않게 한다.
            m.state = 'GROGGY';
            m.timer = 0;
            m.kbVx = 0;
            m.kbVy = 0;
            m.hitByEnemyTimer = 0;
            return;
        }

        if (m.hp > 0) {
            m.hitByEnemyTimer = Math.max(
                m.hitByEnemyTimer || 0,
                Math.max(0.1, parseFloat(m.d.hitDur) || 0.2)
            );

            m.lastHitSourceX = gameState.player.x;
            m.lastHitSourceY = gameState.player.y;
            m.lastHitDirX = m.x - gameState.player.x;
            m.lastHitDirY = m.y - gameState.player.y;

            const applyHitState = () => {
                MonsterAI.changeState(m, 'HIT', gameState);

                const safeHitDur = Math.max(0.001, parseFloat(m.d.hitDur) || 0.2);
                let angle = Math.atan2(m.y - gameState.player.y, m.x - gameState.player.x);
                let kb = m.d.knockback / safeHitDur;
                m.kbVx = Math.cos(angle) * kb;
                m.kbVy = Math.sin(angle) * kb;
            };

            const hitPriorityRule = MonsterAI.getPriorityStateRule(m, 'HIT', gameState);

            if (hitPriorityRule) {
                if (MonsterAI.canEnterPriorityState(m, 'HIT', gameState)) {
                    applyHitState();
                }
            } else {
                const stateTypeKey = MonsterAI.getPatternTypeKey(m.state, gameState, m);
                const actionType = String(action && action.Action_Type || '').trim().toUpperCase();
                const actionDefenceType = String(action && action.Action_Defence_Type || '').trim().toUpperCase();
                let isSuperArmor =
                    actionDefenceType === 'SUPER_ARMOR' ||
                    actionType === 'MOVE' ||
                    actionType === 'MOVE_GROUP' ||
                    (
                        (
                            stateTypeKey === 'ATK' ||
                            stateTypeKey === 'ATK_MELEE' ||
                            stateTypeKey === 'ATK_PROJECTILE' ||
                            !!gameState.DB_SKILL[m.state]
                        ) &&
                        String(m.d.defType).toLowerCase() === 'superarmor'
                    );

                if (!isSuperArmor) {
                    applyHitState();
                } else {
                    m.kbVx = 0;
                    m.kbVy = 0;
                }
            }
        }
    },
    getBossPatternActionHitbox: function(m, action) {
        const scale = parseFloat(m && m.scale) || 1;
        const finalHitboxMul = (typeof this.getKasiyasP2MajorPattern1FinalHitboxMultiplier === 'function')
            ? this.getKasiyasP2MajorPattern1FinalHitboxMultiplier(m, action)
            : 1;
        const hitboxMul = Math.max(0.01, finalHitboxMul || 1);
        const baseW = (parseFloat(action && action.Hitbox_Size_X) || (m && m.d && m.d.bodyX) || 100) * scale;
        const baseD = (parseFloat(action && action.Hitbox_Size_Y) || (m && m.d && m.d.bodyY) || 60) * scale;
        const baseH = (parseFloat(action && action.Hitbox_Size_Z) || (m && m.d && m.d.bodyZ) || 80) * scale;
        const atkW = baseW * hitboxMul;
        const atkD = baseD * hitboxMul;
        const atkH = baseH * hitboxMul;

        const rawOffX = parseFloat(action && action.Hitbox_Offset_X);
        const rawOffY = parseFloat(action && action.Hitbox_Offset_Y);
        const rawOffZ = parseFloat(action && action.Hitbox_Offset_Z);
        const centerFixedEnhance = hitboxMul !== 1 && typeof this.isKasiyasP2MajorPattern1EnhancedAttackAction === 'function'
            ? this.isKasiyasP2MajorPattern1EnhancedAttackAction(action)
            : false;
        const baseOffX = (!isNaN(rawOffX) ? rawOffX : baseW / (2 * scale)) * scale;
        const baseOffY = (!isNaN(rawOffY) ? rawOffY : 0) * scale;
        const baseOffZ = (!isNaN(rawOffZ) ? rawOffZ : 0) * scale;
        // 2페이즈 대형 패턴 1 강화 검격은 크기만 커지고 중심점은 유지되도록 한다.
        // 특히 Z축을 그대로 키우면 X자 교차점이 위로 밀려 보이므로, 증가한 높이의 절반만큼 아래로 보정한다.
        const offX = baseOffX;
        const offY = baseOffY;
        const offZ = centerFixedEnhance ? baseOffZ - ((atkH - baseH) * 0.5) : baseOffZ;

        const boss = m && m.boss ? m.boss : null;
        const isP2P3JumpSlash = boss && boss.p2p3JumpSlashTarget &&
            typeof this.isKasiyasP2Pattern3JumpSlashAction === 'function' &&
            this.isKasiyasP2Pattern3JumpSlashAction(action);
        let baseX = isP2P3JumpSlash ? (parseFloat(boss.p2p3JumpSlashTarget.bossX) || m.x || 0) : (m.x || 0);
        let baseY = isP2P3JumpSlash ? (parseFloat(boss.p2p3JumpSlashTarget.bossY) || m.y || 0) : (m.y || 0);
        let baseZ = isP2P3JumpSlash ? (parseFloat(boss.p2p3JumpSlashTarget.bossZ) || 0) : (m.z || 0);
        const hitboxPlace = String(action && (action.Hitbox_Place_Type || action.Warning_Place_Type) || '').trim().toUpperCase();
        const fixedPlace = hitboxPlace && typeof this.normalizeBossFixedMapPlaceType === 'function'
            ? this.normalizeBossFixedMapPlaceType(hitboxPlace)
            : hitboxPlace;
        const isFixedHitbox = fixedPlace && typeof this.isBossFixedMapPlaceType === 'function' && this.isBossFixedMapPlaceType(fixedPlace);
        if (isFixedHitbox && typeof this.getBossFixedMapPosition === 'function') {
            const pos = this.getBossFixedMapPosition((m && m.gameState) || (typeof gameState !== 'undefined' ? gameState : null), fixedPlace);
            // getBossPatternActionHitbox는 기존 호출부 호환상 gameState를 받지 않으므로,
            // this.currentGameState가 없을 때는 보스가 가진 world 정보 대신 기본값으로 계산될 수 있다.
            // 실제 런타임에서는 아래 fallback에서 m.gameState가 없어도 this.getBossFixedMapPosition 내부 기본값을 사용한다.
            baseX = Number.isFinite(parseFloat(pos && pos.x)) ? parseFloat(pos.x) : baseX;
            baseY = Number.isFinite(parseFloat(pos && pos.y)) ? parseFloat(pos.y) : baseY;
            baseZ = Number.isFinite(parseFloat(pos && pos.z)) ? parseFloat(pos.z) : 0;
        }
        const faceDir = isFixedHitbox ? 1 : (isP2P3JumpSlash ? (boss.p2p3JumpSlashTarget.faceDir === -1 ? -1 : 1) : ((m.faceDir === -1) ? -1 : 1));

        return {
            // 고정 위치 히트박스(예: PLACE_MAP_CENTER)도 데이터의 Offset_X/Y/Z를 반영한다.
            // 단, 고정 위치 판정은 보스 시선 방향과 무관해야 하므로 X 오프셋에는 faceDir을 곱하지 않는다.
            x: baseX + (isFixedHitbox ? offX : offX * faceDir),
            y: baseY + offY,
            z: baseZ + offZ,
            w: atkW,
            d: atkD,
            h: atkH
        };
    },
    isPlayerInsidePathHitbox: function(path, width, height, gameState) {
        const p = gameState.player;
        if (!path || !p || !p.active || p.hp <= 0) return false;

        const ax = path.startX;
        const ay = path.startY;
        const bx = path.endX;
        const by = path.endY;
        const px = p.x;
        const py = p.y;
        const abx = bx - ax;
        const aby = by - ay;
        const abLenSq = abx * abx + aby * aby;
        if (abLenSq <= 0.0001) return false;

        let t = ((px - ax) * abx + (py - ay) * aby) / abLenSq;
        t = Math.max(0, Math.min(1, t));
        const cx = ax + abx * t;
        const cy = ay + aby * t;
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);

        const playerRadiusY = ((p.bodyY || 30) * (p.scale || 1)) / 2;
        const inPathWidth = dist <= (width / 2 + playerRadiusY);
        const atkZ = path.startZ || 0;
        const pH = (p.bodyZ || 100) * (p.scale || 1);
        const inZ = atkZ < (p.z + pH) && (atkZ + height) > p.z;
        return inPathWidth && inZ;
    },
    isPlayerInsideCircleHitbox: function(hitbox, gameState) {
        const p = gameState.player;
        if (!hitbox || !p || !p.active || p.hp <= 0) return false;

        const playerRadiusX = ((p.bodyX || 50) * (p.scale || 1)) / 2;
        const playerRadiusY = ((p.bodyY || 30) * (p.scale || 1)) / 2;
        const rx = Math.max(1, (hitbox.w || 1) / 2 + playerRadiusX);
        const ry = Math.max(1, (hitbox.d || 1) / 2 + playerRadiusY);
        const nx = ((p.x || 0) - (hitbox.x || 0)) / rx;
        const ny = ((p.y || 0) - (hitbox.y || 0)) / ry;
        const inXY = (nx * nx + ny * ny) <= 1;

        const pH = (p.bodyZ || 100) * (p.scale || 1);
        const atkZ = hitbox.z || 0;
        const inZ = atkZ < ((p.z || 0) + pH) && (atkZ + (hitbox.h || 1)) > (p.z || 0);
        return inXY && inZ;
    },
    isPlayerInsideBoxHitbox: function(hitbox, gameState) {
        const p = gameState.player;
        if (!hitbox || !p || !p.active || p.hp <= 0) return false;
        const pW = (p.bodyX || 50) * (p.scale || 1);
        const pD = (p.bodyY || 30) * (p.scale || 1);
        const pH = (p.bodyZ || 100) * (p.scale || 1);
        return checkAABB3D(hitbox.x, hitbox.y, hitbox.z, hitbox.w, hitbox.d, hitbox.h, p.x, p.y, p.z, pW, pD, pH);
    },
    pushDebugPathHitbox: function(path, width, height, life, gameState) {
        if (!path) return;
        gameState.hitboxes.push({
            type: 'path',
            startX: path.startX,
            startY: path.startY,
            endX: path.endX,
            endY: path.endY,
            z: path.startZ || 0,
            w: this.getPathLength(path),
            d: width,
            h: height,
            life: life || 0.12
        });
    },
    buildGuardInfoFromAttackData: function(data, source = null) {
        if (!data) return null;
        const guardSourceX = source && Number.isFinite(parseFloat(source.x)) ? parseFloat(source.x) : null;
        const guardSourceY = source && Number.isFinite(parseFloat(source.y)) ? parseFloat(source.y) : null;
        const rewardKey = String(
            data.Guard_Reward_Key ||
            data.Action_Instance_Key ||
            data.Object_Action_ID ||
            data.Action_ID ||
            data.Attack_Object_ID ||
            data.Object_ID ||
            ''
        ).trim();
        const hitCount = Math.max(1, parseInt(data.ATK_Hit_Count) || 1);
        const duration = Math.max(0.35, parseFloat(data.Action_Anim_Duration) || parseFloat(data.Hitbox_Duration) || 0.7);
        return {
            canGuard: data.ATK_Can_Guard === true || String(data.ATK_Can_Guard || '').trim().toLowerCase() === 'true',
            guardResult: data.Guard_Result_Type || '',
            guardDmgReduceRate: parseFloat(data.Guard_DMG_Reduce_Rate),
            guardGetFightingSpirit: Math.max(0, parseFloat(data.Guard_Get_Fighting_Spirit) || 0),
            guardSpecialResultType: String(data.Guard_Special_Result_Type || '').trim().toUpperCase(),
            guardSpecialResultOccurrenceCond: String(data.Guard_Special_Result_Occurrence_Cond || '').trim().toUpperCase(),
            guardSpecialResultCostType: String(data.Guard_Special_Result_Cost_Type || '').trim().toUpperCase(),
            guardSpecialResultCostValue: Math.max(0, parseFloat(data.Guard_Special_Result_Cost_Value) || 0),
            guardDirectionType: String(data.Guard_Direction_Type || data.Guard_Direction_Check_Type || '').trim().toUpperCase(),
            guardRewardKey: rewardKey ? `${rewardKey}` : '',
            guardRewardLockTime: hitCount > 1 ? duration + 0.35 : 0.45,
            attackType: data.Attack_Type || data.Action_Attack_Type || data.Object_Type || data.Action_Type || '',
            sourcePatternId: String(data.Pattern_ID || (source && source.boss && source.boss.activePattern && source.boss.activePattern.Pattern_ID) || '').trim(),
            sourceActionId: String(data.Action_ID || data.Object_Action_ID || '').trim(),
            sourceObjectId: String(data.Object_ID || data.Attack_Object_ID || (source && source.data && (source.data.Object_ID || source.data.Attack_Object_ID)) || '').trim(),
            guardSourceX: guardSourceX,
            guardSourceY: guardSourceY,
            makeKnockback: data.ATK_Make_Knockback === true || String(data.ATK_Make_Knockback || '').trim().toLowerCase() === 'true',
            knockbackCanGuard: data.Knockback_Can_Guard === true || String(data.Knockback_Can_Guard || '').trim().toLowerCase() === 'true',
            knockbackDistance: parseFloat(data.Knockback_Distance) || 0,
            makeHitAction: !(data.ATK_Make_Hit_Action === false || String(data.ATK_Make_Hit_Action || '').trim().toLowerCase() === 'false')
        };
    },

    trySpawnBossGuardSuccessObject: function(m, action, gameState, guardResult, guardX, guardY) {
        if (!guardResult || !guardResult.guarded || !m || !action || !gameState) return false;
        const spawnId = String(action.Spawn_Object_ID || '').trim();
        const timing = String(action.Object_Spawn_Timing || '').trim().toUpperCase();
        if (!spawnId || timing !== 'TIMING_ATK_GUARD_SUCCESS') return false;
        if (typeof this.spawnBossAttackObjectFromAction !== 'function') return false;

        const count = Math.max(1, parseInt(action.Object_Spawn_Count) || 1);
        for (let i = 0; i < count; i++) {
            this.spawnBossAttackObjectFromAction(m, {
                ...action,
                Object_Spawn_Timing: 'ACTION_START',
                Spawn_Object_ID: spawnId,
                Object_ID: spawnId,
                Object_Spawn_Count: 1,
                Guard_Point_X: guardX,
                Guard_Point_Y: guardY
            }, gameState);
        }
        this.pushBossDebugLog(
            gameState,
            'OBJECT',
            `${String(action.Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
            `guard success spawn object ${spawnId}`
        );
        return true;
    },

    fireBossPatternActionHit: function(m, action, gameState) {
        const actionType = String(action.Action_Type || '').trim().toUpperCase();
        // MOVE 계열은 위치 이동만 수행한다. 패턴4의 대각 이동처럼 히트박스 데이터가 실수로 남아 있거나
        // 기본값 fallback이 들어가더라도 공격 판정이 발생하지 않도록 막는다.
        if (['WARNING_PATH','WARNING','WAIT','SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT','MOVE','REMOVE_ALL_OBJECT','CLEAR_PATTERN_TERRAIN_OBJECTS'].includes(actionType)) return false;

        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        // 정리/연출용 액션에 Hitbox_Type이 비어 있으면 기본 박스/기본 피해로 fallback되지 않게 막는다.
        // 실제 공격 액션은 데이터에서 명시적인 Hitbox_Type을 가져야 한다.
        if (!hitboxType) return false;
        const m1FinalDmgMul = (typeof this.getKasiyasP2MajorPattern1FinalDamageMultiplier === 'function')
            ? this.getKasiyasP2MajorPattern1FinalDamageMultiplier(m, action)
            : 1;
        const dmgRate = (parseFloat(action.ATK_Damage_Rate) || 1) * Math.max(0.01, m1FinalDmgMul || 1);
        const baseDmg = m.d.atk * dmgRate;
        const p = gameState.player;
        if (!p || !p.active || p.hp <= 0) return false;

        this.pushBossDebugLog(
            gameState,
            'HIT',
            `${String(action.Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
            `${hitboxType || 'HITBOX'} / damage ${baseDmg.toFixed(1)}`
        );

        if (hitboxType === 'HITBOX_PATH_BOX') {
            const path = this.resolveBossPathForAction(m, action, gameState, 'current') || m.boss.lastDashPath;
            const width = (parseFloat(action.Hitbox_Size_Y) || 90) * (m.scale || 1);
            const height = (parseFloat(action.Hitbox_Size_Z) || 120) * (m.scale || 1);
            this.pushDebugPathHitbox(path, width, height, 0.15, gameState);
            this.pushPathSlashEffects(path, width, height, action.VFX_Type || 'EFT_KASIYAS_RUSH_SLASH', gameState);
            if (this.isPlayerInsidePathHitbox(path, width, height, gameState)) {
                const result = PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), m.x, m.y, null, 0, 0, this.buildGuardInfoFromAttackData(action, m)) || {};
                if (typeof this.registerKasiyasP2MajorPattern1ResponseResult === 'function') this.registerKasiyasP2MajorPattern1ResponseResult(m, action, gameState, result);
                this.applyKasiyasOniMarkAttackResult(gameState, 'BOSS', action, result, m);
                this.trySpawnBossGuardSuccessObject(m, action, gameState, result, m.x, m.y);
                this.tryApplyBossGuardSpecialResult(m, action, result, gameState);
                return true;
            }
            return false;
        }

        if (hitboxType === 'HITBOX_BODY_COLLISION') {
            const scale = m.scale || 1;
            const bodyW = ((m.d && parseFloat(m.d.bodyX)) || 80) * scale;
            const bodyD = ((m.d && parseFloat(m.d.bodyY)) || 60) * scale;
            const bodyH = ((m.d && parseFloat(m.d.bodyZ)) || 160) * scale;
            const bodyHitbox = { x: m.x, y: m.y, z: m.z, w: bodyW, d: bodyD, h: bodyH };

            const rawSizeX = parseFloat(action.Hitbox_Size_X);
            const rawSizeY = parseFloat(action.Hitbox_Size_Y);
            const rawSizeZ = parseFloat(action.Hitbox_Size_Z);
            const hasExtraHitbox = (!isNaN(rawSizeX) && rawSizeX > 0) || (!isNaN(rawSizeY) && rawSizeY > 0) || (!isNaN(rawSizeZ) && rawSizeZ > 0);
            const extraW = Math.max(1, (!isNaN(rawSizeX) && rawSizeX > 0 ? rawSizeX : ((m.d && parseFloat(m.d.bodyX)) || 80))) * scale;
            const extraD = Math.max(1, (!isNaN(rawSizeY) && rawSizeY > 0 ? rawSizeY : ((m.d && parseFloat(m.d.bodyY)) || 60))) * scale;
            const extraH = Math.max(1, (!isNaN(rawSizeZ) && rawSizeZ > 0 ? rawSizeZ : ((m.d && parseFloat(m.d.bodyZ)) || 160))) * scale;
            const offX = (parseFloat(action.Hitbox_Offset_X) || 0) * scale * (m.faceDir === -1 ? -1 : 1);
            const offY = (parseFloat(action.Hitbox_Offset_Y) || 0) * scale;
            const offZ = (parseFloat(action.Hitbox_Offset_Z) || 0) * scale;
            const extraHitbox = { x: m.x + offX, y: m.y + offY, z: m.z + offZ, w: extraW, d: extraD, h: extraH };

            gameState.hitboxes.push({ ...bodyHitbox, life: 0.08, bodyCollision: true });
            if (hasExtraHitbox) gameState.hitboxes.push({ ...extraHitbox, life: 0.08, attachedExtraHitbox: true });

            const bodyHit = this.isPlayerInsideBoxHitbox(bodyHitbox, gameState);
            const extraHit = hasExtraHitbox && this.isPlayerInsideBoxHitbox(extraHitbox, gameState);
            if (bodyHit || extraHit) {
                const hitbox = extraHit ? extraHitbox : bodyHitbox;
                const atkX = hitbox.x;
                const atkY = hitbox.y;
                const atkZ = hitbox.z;
                const atkW = hitbox.w;
                const atkD = hitbox.d;
                const atkH = hitbox.h;
                const upperVfx = String(action.VFX_Type || '').toUpperCase();
                if (action.VFX_Type && upperVfx !== 'EFT_KASIYAS_SHOULDER_ATK') {
                    gameState.effects.push({
                        type: 'hitSpark',
                        renderType: action.VFX_Type,
                        x: atkX,
                        y: atkY,
                        z: atkZ + atkH * 0.58,
                        dir: m.faceDir,
                        w: Math.max(atkW * 1.04, 120 * scale),
                        d: Math.max(atkD * 1.04, 60 * scale),
                        h: atkH,
                        burstScale: 1.35,
                        life: 0.20,
                        maxLife: 0.20,
                        color: 'rgba(255,82,60,0.92)',
                        accentColor: 'rgba(28,0,0,0.90)'
                    });
                }
                const result = PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), atkX, atkY, null, 0, 0, this.buildGuardInfoFromAttackData(action, m)) || {};
                if (typeof this.registerKasiyasP2MajorPattern1ResponseResult === 'function') this.registerKasiyasP2MajorPattern1ResponseResult(m, action, gameState, result);
                this.applyKasiyasOniMarkAttackResult(gameState, 'BOSS', action, result, m);
                this.tryApplyBossGuardSpecialResult(m, action, result, gameState);
                return true;
            }
            return false;
        }

        if (hitboxType === 'HITBOX_CIRCLE') {
            const hitbox = this.getBossPatternActionHitbox(m, action);
            gameState.hitboxes.push({ ...hitbox, type: 'circle', life: 0.1 });
            this.pushBossPatternActionEffect(m, action, hitbox.x, hitbox.y, hitbox.z, hitbox.w, hitbox.d, hitbox.h, gameState);
            if (this.isPlayerInsideCircleHitbox(hitbox, gameState)) {
                const result = PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), hitbox.x, hitbox.y, null, 0, 0, this.buildGuardInfoFromAttackData(action, m)) || {};
                if (typeof this.registerKasiyasP2MajorPattern1ResponseResult === 'function') this.registerKasiyasP2MajorPattern1ResponseResult(m, action, gameState, result);
                this.applyKasiyasOniMarkAttackResult(gameState, 'BOSS', action, result, m);
                this.trySpawnBossGuardSuccessObject(m, action, gameState, result, hitbox.x, hitbox.y);
                this.tryApplyBossGuardSpecialResult(m, action, result, gameState);
                return true;
            }
            return false;
        }

        const hitbox = this.getBossPatternActionHitbox(m, action);
        const atkX = hitbox.x;
        const atkY = hitbox.y;
        const atkZ = hitbox.z;
        const atkW = hitbox.w;
        const atkD = hitbox.d;
        const atkH = hitbox.h;

        gameState.hitboxes.push({ ...hitbox, life: 0.1 });
        this.pushBossPatternActionEffect(m, action, atkX, atkY, atkZ, atkW, atkD, atkH, gameState);

        if (this.isPlayerInsideBoxHitbox(hitbox, gameState)) {
            const result = PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), atkX, atkY, null, 0, 0, this.buildGuardInfoFromAttackData(action, m)) || {};
            if (typeof this.registerKasiyasP2MajorPattern1ResponseResult === 'function') this.registerKasiyasP2MajorPattern1ResponseResult(m, action, gameState, result);
            this.applyKasiyasOniMarkAttackResult(gameState, 'BOSS', action, result, m);
            this.trySpawnBossGuardSuccessObject(m, action, gameState, result, atkX, atkY);
            this.tryApplyBossGuardSpecialResult(m, action, result, gameState);
            return true;
        }
        return false;
    },

    isKasiyasP2M2SwordWallObject: function(obj) {
        if (!obj) return false;
        const data = obj.data || {};
        const type = String(obj.objectType || data.Object_Type || '').trim().toUpperCase();
        const renderType = String(obj.renderType || data.Object_Render_Type || '').trim().toUpperCase();
        return type === 'SWORD_WALL' || type === 'SWORD_WALL_GIANT_SWORD' || renderType.indexOf('P2_M2_SWORD_WALL') >= 0;
    },

    getKasiyasP2M2SwordWallGapSlot: function(obj) {
        const data = obj && obj.data ? obj.data : {};
        const dataSlot = parseFloat(data.Sword_Wall_Gap_Slot_Index);
        if (Number.isFinite(dataSlot)) return Math.max(0, Math.min(4, Math.round(dataSlot)));
        const renderType = String(obj && (obj.renderType || data.Object_Render_Type) || '').trim().toUpperCase();
        const name = String(obj && (obj.name || data.Object_Name || data.Name) || '').trim().toUpperCase();
        const key = `${renderType} ${name}`;
        if (key.indexOf('GAP_TOP') >= 0 || key.indexOf('최상단') >= 0) return 0;
        if (key.indexOf('GAP_UPPER') >= 0 || key.indexOf('상단') >= 0) return 1;
        if (key.indexOf('GAP_MIDDLE') >= 0 || key.indexOf('중단') >= 0 || key.indexOf('중앙') >= 0) return 2;
        if (key.indexOf('GAP_LOWER') >= 0 || key.indexOf('하단') >= 0) return 3;
        if (key.indexOf('GAP_BOTTOM') >= 0 || key.indexOf('최하단') >= 0) return 4;
        return -1;
    },

    getKasiyasP2M2SwordWallGapInfo: function(obj, wallD) {
        const data = obj && obj.data ? obj.data : {};
        const targetD = Math.max(1, parseFloat(wallD) || parseFloat(data.Sword_Wall_Total_Y) || parseFloat(obj && obj.d) || 400);
        const totalRaw = parseFloat(data.Sword_Wall_Total_Y);
        const totalY = Number.isFinite(totalRaw) && totalRaw > 0 ? totalRaw : targetD;
        const slot = this.getKasiyasP2M2SwordWallGapSlot ? this.getKasiyasP2M2SwordWallGapSlot(obj) : -1;
        const slotH = totalY / 5;
        let centerY = parseFloat(data.Sword_Wall_Gap_Center_Y);
        let gapSizeY = parseFloat(data.Sword_Wall_Gap_Size_Y);
        if (!Number.isFinite(centerY)) {
            if (slot < 0) return null;
            centerY = (slot + 0.5) * slotH;
        }
        if (!Number.isFinite(gapSizeY) || gapSizeY <= 0) gapSizeY = slotH;
        centerY = Math.max(0, Math.min(totalY, centerY));
        gapSizeY = Math.max(1, Math.min(totalY, gapSizeY));
        const scale = targetD / totalY;
        const localCenter = centerY * scale;
        const localSize = gapSizeY * scale;
        return {
            slot,
            totalY,
            centerY,
            gapSizeY,
            localCenter,
            localSize,
            localStart: Math.max(0, localCenter - localSize / 2),
            localEnd: Math.min(targetD, localCenter + localSize / 2)
        };
    },

    getKasiyasP2M2SwordWallCollisionBoxes: function(obj, action, gameState) {
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        const wallW = Math.max(40, parseFloat(action && action.Hitbox_Size_X) || parseFloat(obj && obj.w) || 150);
        const wallD = Math.max(80, parseFloat(action && action.Hitbox_Size_Y) || parseFloat(obj && obj.d) || worldD);
        const wallH = Math.max(40, parseFloat(action && action.Hitbox_Size_Z) || parseFloat(obj && obj.h) || 220);
        const offX = parseFloat(action && action.Hitbox_Offset_X) || 0;
        const offY = parseFloat(action && action.Hitbox_Offset_Y) || 0;
        const offZ = parseFloat(action && action.Hitbox_Offset_Z) || 0;
        const curX = Number.isFinite(parseFloat(obj && obj.x)) ? parseFloat(obj.x) : 0;
        const prevX = Number.isFinite(parseFloat(obj && obj.prevX)) ? parseFloat(obj.prevX) : curX;
        const minX = Math.min(prevX, curX) + offX - wallW / 2;
        const maxX = Math.max(prevX, curX) + offX + wallW / 2;
        const centerX = (minX + maxX) / 2;
        const widthX = Math.max(wallW, maxX - minX);
        const centerY = (Number.isFinite(parseFloat(obj && obj.y)) ? parseFloat(obj.y) : worldD / 2) + offY;
        const top = centerY - wallD / 2;
        const gapInfo = this.getKasiyasP2M2SwordWallGapInfo ? this.getKasiyasP2M2SwordWallGapInfo(obj, wallD) : null;
        const boxes = [];
        const sourceObject = obj;
        const sourceObjectId = String(obj && obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim();
        const sourceActionId = String(action && action.Object_Action_ID || '').trim();
        const makeBox = (y1, y2, idx) => {
            const d = Math.max(1, y2 - y1);
            return {
                x: centerX,
                y: y1 + d / 2,
                z: (Number.isFinite(parseFloat(obj && obj.z)) ? parseFloat(obj.z) : 0) + offZ,
                w: widthX,
                d: d,
                h: wallH,
                life: 0.12,
                sourceObject,
                sourceObjectId,
                sourceActionId,
                swordWallSegment: idx,
                cancelOnGuard: false
            };
        };
        if (!gapInfo) {
            boxes.push(makeBox(top, top + wallD, 0));
            return boxes;
        }
        const gapStart = top + gapInfo.localStart;
        const gapEnd = top + gapInfo.localEnd;
        if (gapStart - top > 2) boxes.push(makeBox(top, gapStart, 0));
        if (top + wallD - gapEnd > 2) boxes.push(makeBox(gapEnd, top + wallD, 1));
        return boxes;
    },

    fireKasiyasP2M2SwordWallHit: function(obj, action, gameState) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p || !p.active || p.hp <= 0 || obj.actionCancelled) return false;
        const wallD = Math.max(80, parseFloat(action && action.Hitbox_Size_Y) || parseFloat(obj && obj.d) || parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        const centerY = (Number.isFinite(parseFloat(obj && obj.y)) ? parseFloat(obj.y) : (parseFloat(gameState && gameState.WORLD_DEPTH) || 400) / 2) + (parseFloat(action && action.Hitbox_Offset_Y) || 0);
        const gapInfo = this.getKasiyasP2M2SwordWallGapInfo ? this.getKasiyasP2M2SwordWallGapInfo(obj, wallD) : null;
        if (gapInfo) {
            const gapStart = centerY - wallD / 2 + gapInfo.localStart;
            const gapEnd = centerY - wallD / 2 + gapInfo.localEnd;
            // 검벽은 Y축 빈틈을 통과하는 기믹이므로, 플레이어 중심 Y가 데이터상 빈틈 안에 있으면 안전 처리한다.
            if ((p.y || 0) >= gapStart && (p.y || 0) <= gapEnd) return false;
        }
        const boxes = this.getKasiyasP2M2SwordWallCollisionBoxes ? this.getKasiyasP2M2SwordWallCollisionBoxes(obj, action, gameState) : [];
        boxes.forEach(box => gameState.hitboxes.push({ ...box }));
        this.pushBossObjectActionEffect && this.pushBossObjectActionEffect(obj, action, boxes[0] || { x: obj.x, y: obj.y, z: obj.z, w: 1, d: 1, h: 1 }, gameState);
        const hitBox = boxes.find(box => this.isPlayerInsideBoxHitbox(box, gameState));
        if (!hitBox) return false;
        const owner = obj.owner;
        if (owner && owner.hp > 0) {
            const dmgRate = parseFloat(action.ATK_Damage_Rate) || parseFloat(action.Damage_Rate) || 1;
            const baseDmg = owner.d.atk * dmgRate;
            this.pushBossDebugLog && this.pushBossDebugLog(gameState, 'OBJECT_HIT', `${String(action.Object_Action_ID || '').trim()} ${this.getBossDebugName(action)}`, `SWORD_WALL / damage ${baseDmg.toFixed(1)}`);
            PlayerManager.takeDamage(
                gameState,
                calcScaledDamage(owner.d.level, gameState.player.level, baseDmg),
                hitBox.x,
                hitBox.y,
                null,
                0,
                0,
                this.buildGuardInfoFromAttackData(action, obj)
            );
            return true;
        }
        return false;
    },

    getBossObjectActionHitbox: function(obj, action) {
        const boxes = this.getBossObjectActionHitboxes(obj, action);
        return boxes.extra || boxes.body || boxes.primary;
    },

    getBossObjectActionHitboxes: function(obj, action) {
        const scale = obj.scale || 1;
        const hitboxType = String(action && action.Hitbox_Type || '').trim().toUpperCase();
        const bodyWRaw = obj && obj.d ? (parseFloat(obj.d.bodyX) || 80) : 80;
        const bodyDRaw = obj && obj.d ? (parseFloat(obj.d.bodyY) || 60) : 60;
        const bodyHRaw = obj && obj.d ? (parseFloat(obj.d.bodyZ) || 160) : 160;
        const body = { x: obj.x, y: obj.y, z: obj.z, w: bodyWRaw * scale, d: bodyDRaw * scale, h: bodyHRaw * scale };

        if (hitboxType === 'HITBOX_OBJECT_SIZE') {
            const rect = obj.terrainArea || (typeof this.getTerrainAreaRect === 'function' ? this.getTerrainAreaRect(obj, null) : null);
            const primary = rect
                ? { x: rect.centerX, y: rect.centerY, z: 0, w: rect.w, d: rect.h, h: parseFloat(action.Hitbox_Size_Z) || 120 }
                : { x: obj.x, y: obj.y, z: obj.z, w: parseFloat(action.Hitbox_Size_X) || bodyWRaw, d: parseFloat(action.Hitbox_Size_Y) || bodyDRaw, h: parseFloat(action.Hitbox_Size_Z) || bodyHRaw };
            return { body: null, extra: null, primary };
        }

        const rawX = parseFloat(action.Hitbox_Size_X);
        const rawY = parseFloat(action.Hitbox_Size_Y);
        const rawZ = parseFloat(action.Hitbox_Size_Z);
        const hasExtra = hitboxType === 'HITBOX_BODY_COLLISION' && ((!isNaN(rawX) && rawX > 0) || (!isNaN(rawY) && rawY > 0) || (!isNaN(rawZ) && rawZ > 0));
        const defaultW = hitboxType === 'HITBOX_BODY_COLLISION' ? bodyWRaw : 100;
        const defaultD = hitboxType === 'HITBOX_BODY_COLLISION' ? bodyDRaw : 60;
        const defaultH = hitboxType === 'HITBOX_BODY_COLLISION' ? bodyHRaw : 80;
        const w = (parseFloat(action.Hitbox_Size_X) || defaultW) * scale;
        const d = (parseFloat(action.Hitbox_Size_Y) || defaultD) * scale;
        const h = (parseFloat(action.Hitbox_Size_Z) || defaultH) * scale;
        const offX = (parseFloat(action.Hitbox_Offset_X) || 0) * scale;
        const offY = (parseFloat(action.Hitbox_Offset_Y) || 0) * scale;
        const offZ = (parseFloat(action.Hitbox_Offset_Z) || 0) * scale;
        const primary = {
            x: obj.x + offX * (obj.faceDir === -1 ? -1 : 1),
            y: obj.y + offY,
            z: obj.z + offZ,
            w: w,
            d: d,
            h: h
        };
        return hitboxType === 'HITBOX_BODY_COLLISION'
            ? { body, extra: hasExtra ? primary : null, primary: hasExtra ? primary : body }
            : { body: null, extra: null, primary };
    },
    fireBossObjectActionHit: function(obj, action, gameState) {
        const p = gameState.player;
        if (!p || !p.active || p.hp <= 0 || obj.actionCancelled) return false;

        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        if (hitboxType !== 'HITBOX_BOX' && hitboxType !== 'HITBOX_CIRCLE' && hitboxType !== 'HITBOX_BODY_COLLISION' && hitboxType !== 'HITBOX_OBJECT_SIZE') return false;

        if (this.isKasiyasP2M2SwordWallObject && this.isKasiyasP2M2SwordWallObject(obj) && hitboxType === 'HITBOX_BOX') {
            return this.fireKasiyasP2M2SwordWallHit(obj, action, gameState);
        }

        const hitboxes = this.getBossObjectActionHitboxes(obj, action);
        const hitbox = hitboxes.primary;
        const objectIdForHit = String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim();
        const actionIdForHit = String(action.Object_Action_ID || '').trim();
        const debugBoxes = hitboxType === 'HITBOX_BODY_COLLISION'
            ? [hitboxes.body, hitboxes.extra].filter(Boolean)
            : [hitbox];
        debugBoxes.forEach((box, idx) => gameState.hitboxes.push({
            ...box,
            type: hitboxType === 'HITBOX_CIRCLE' ? 'circle' : undefined,
            life: 0.12,
            sourceObject: obj,
            sourceObjectId: objectIdForHit,
            sourceActionId: actionIdForHit,
            cancelOnGuard: true,
            bodyCollision: hitboxType === 'HITBOX_BODY_COLLISION' && idx === 0,
            attachedExtraHitbox: hitboxType === 'HITBOX_BODY_COLLISION' && idx > 0
        }));
        this.pushBossObjectActionEffect(obj, action, hitboxes.extra || hitbox, gameState);

        const bodyHit = hitboxType === 'HITBOX_BODY_COLLISION' && hitboxes.body && this.isPlayerInsideBoxHitbox(hitboxes.body, gameState);
        const extraHit = hitboxType === 'HITBOX_BODY_COLLISION' && hitboxes.extra && this.isPlayerInsideBoxHitbox(hitboxes.extra, gameState);
        const isHit = hitboxType === 'HITBOX_CIRCLE'
            ? this.isPlayerInsideCircleHitbox(hitbox, gameState)
            : (hitboxType === 'HITBOX_BODY_COLLISION' ? (bodyHit || extraHit) : this.isPlayerInsideBoxHitbox(hitbox, gameState));
        const damageHitbox = extraHit ? hitboxes.extra : (bodyHit ? hitboxes.body : hitbox);

        if (isHit) {
            const owner = obj.owner;
            if (owner && owner.hp > 0) {
                const dmgRate = parseFloat(action.ATK_Damage_Rate) || parseFloat(action.Damage_Rate) || 1;
                const baseDmg = owner.d.atk * dmgRate;
                this.pushBossDebugLog(
                    gameState,
                    'OBJECT_HIT',
                    `${String(action.Object_Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
                    `${hitboxType || 'HITBOX'} / damage ${baseDmg.toFixed(1)}`
                );
                const result = PlayerManager.takeDamage(
                    gameState,
                    calcScaledDamage(owner.d.level, gameState.player.level, baseDmg),
                    damageHitbox.x,
                    damageHitbox.y,
                    null,
                    0,
                    0,
                    this.buildGuardInfoFromAttackData(action, obj)
                ) || {};

                this.applyKasiyasOniMarkAttackResult(gameState, 'CLONE', action, result, obj);
                this.tryApplyBossGuardSpecialResult(owner, action, result, gameState);
                const guardResult = String(action.Guard_Result_Type || '').trim().toUpperCase();
                if (result.guarded && guardResult === 'ATK_CANCEL') {
                    obj.actionCancelled = true;
                    obj.cancelledByGuard = true;
                    obj.actionHitFired = true;
                    // ATK_CANCEL은 분신 자체 삭제나 액션 시퀀스 강제 종료가 아니라,
                    // 현재 공격의 잔여 다단히트만 끊는다. 액션 시간은 유지해서 본체/분신 타이밍을 보존한다.
                    obj.opacity = Math.min(parseFloat(obj.opacity) || 0.8, 0.50);

                    // ATK_CANCEL로 분신 난무가 끊겼다면, 첫 타격/중간 타격 여부와 관계없이
                    // 해당 분신이 남긴 남은 판정, 범위 표시, 짧은 검격 이펙트를 즉시 제거한다.
                    const objectId = String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim();
                    const actionId = String(action.Object_Action_ID || '').trim();
                    if (Array.isArray(gameState.hitboxes)) {
                        gameState.hitboxes = gameState.hitboxes.filter(hb => {
                            if (!hb || !hb.cancelOnGuard) return true;
                            if (hb.sourceObject === obj) return false;
                            if (actionId && String(hb.sourceActionId || '').trim() === actionId) return false;
                            if (objectId && String(hb.sourceObjectId || '').trim() === objectId) return false;
                            return true;
                        });
                    }
                    if (Array.isArray(gameState.effects)) {
                        gameState.effects = gameState.effects.filter(eff => {
                            if (!eff) return true;
                            const removableWarning = eff.type === 'warning' && eff.activeAttackRange;
                            const removableAttackFx = !!eff.cancelOnGuard;
                            if (!removableWarning && !removableAttackFx) return true;
                            if (eff.sourceObject === obj) return false;
                            if (actionId && String(eff.sourceActionId || '').trim() === actionId) return false;
                            if (objectId && String(eff.sourceObjectId || '').trim() === objectId) return false;
                            return true;
                        });
                    }

                    gameState.effects.push({
                        type: 'noiseTeleport',
                        renderType: 'EFT_CLONE_ATK_CANCEL',
                        phase: 'VANISH',
                        x: obj.x,
                        y: obj.y,
                        z: obj.z + ((obj.d && obj.d.bodyZ) || 160) * 0.55,
                        w: ((obj.d && obj.d.bodyX) || 80) * (obj.scale || 1) * 1.7,
                        h: ((obj.d && obj.d.bodyZ) || 160) * (obj.scale || 1) * 0.8,
                        life: 0.28,
                        maxLife: 0.28
                    });
                    this.pushBossDebugLog(
                        gameState,
                        'OBJECT_CANCEL',
                        `${String(action.Object_Action_ID || '').trim()} ${this.getBossDebugName(action)}`,
                        'guard success / remaining cycle cancelled'
                    );
                }
                return true;
            }
        }
        return false;
    },

};
