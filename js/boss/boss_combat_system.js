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
        const actionForGroggy = { ...(pending.action || {}) };
        if (pending.groggyTime !== null && pending.groggyTime !== undefined) actionForGroggy.Groggy_Time = pending.groggyTime;
        if (pending.groggyPoseType) actionForGroggy.Groggy_Pose_Type = pending.groggyPoseType;
        if (pending.groggyHitDmgRate !== null && pending.groggyHitDmgRate !== undefined) actionForGroggy.Groggy_Hit_DMG_Rate = pending.groggyHitDmgRate;
        return this.enterBossGroggyFromGuardSpecial(m, actionForGroggy, gameState, pending.result || {});
    },

    enterBossGroggyFromGuardSpecial: function(m, action, gameState, result) {
        const boss = m && m.boss ? m.boss : null;
        if (!boss || !action || !gameState) return false;

        const groggyTime = Math.max(0.2, parseFloat(action.Groggy_Time) || 2);
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
        gameState.floatingTexts.push({
            x: m.x,
            y: m.y,
            z: m.z + bodyZ + 34,
            text: '완전 파훼!',
            color: '#ffe45c',
            size: '30px',
            timer: 1.0
        });
        gameState.floatingTexts.push({
            x: m.x,
            y: m.y,
            z: m.z + bodyZ + 6,
            text: '카시야스 그로기',
            color: '#ffb84a',
            size: '22px',
            timer: 1.0
        });
        try { pushSystemNotice('완전 파훼! 카시야스 그로기', '#ffe45c', 1.0); } catch(e) {}
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

    tryApplyBossGuardSpecialResult: function(m, action, guardResult, gameState) {
        if (!m || !action || !guardResult || !guardResult.guarded || !gameState) return false;
        const boss = m && m.boss ? m.boss : null;
        const specialType = String(action.Guard_Special_Result_Type || '').trim().toUpperCase();
        const cond = String(action.Guard_Special_Result_Occurrence_Cond || '').trim().toUpperCase();
        if (specialType !== 'BOSS_GROGGY' && specialType !== 'CLONE_OWNER_GROGGY') return false;

        if (cond === 'ATK_GUARD_TWO_SAME_APOSTLE_ENERGY') {
            if (!this.hasTwoSameKasiyasApostleEnergies(gameState.player)) return false;
            return this.enterBossGroggyFromGuardSpecial(m, action, gameState, guardResult);
        }

        if (cond === 'ATK_GUARD_GRANT_TEMPERED_BLADE_GUARD') {
            if (!this.playerHasTemperedBladeGuard(gameState.player)) return false;
            if (boss && boss.majorPattern3Runtime && (boss.majorPattern3Runtime.crossSlashSpecialResolved || boss.majorPattern3Runtime.pendingCrossSlashGroggy)) return false;
            return this.queueKasiyasMajorPattern3CrossGuardResolve(m, action, gameState, guardResult);
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
            gameState.floatingTexts.push({
                x: p.x,
                y: p.y,
                z: p.z + (p.bodyZ || 100) + 72,
                text: `낙인 가드 ${mark.bossGuardCount || 0}/${mark.requireBossGuard || 2} · ${mark.cloneGuardCount || 0}/${mark.requireCloneGuard || 2}`,
                color: kind === 'CLONE' ? '#ffb0ff' : '#ff665c',
                size: '18px',
                timer: 0.65
            });
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
                gameState.floatingTexts.push({
                    x: p.x,
                    y: p.y,
                    z: p.z + (p.bodyZ || 100) + 98,
                    text: '낙인 해제!',
                    color: '#ffe45c',
                    size: '26px',
                    timer: 0.9
                });
                try { pushSystemNotice('낙인 해제! 연단된 칼날 준비', '#ffe45c', 1.0); } catch(e) {}
            }
            return;
        }

        mark.stack = (parseInt(mark.stack) || 0) + 1;
        mark.flashTimer = Math.max(parseFloat(mark.flashTimer) || 0, 0.75);
        gameState.floatingTexts.push({
            x: p.x,
            y: p.y,
            z: p.z + (p.bodyZ || 100) + 70,
            text: `낙인 ${mark.stack}/${mark.maxStack || 3}`,
            color: '#ff4646',
            size: '22px',
            timer: 0.75
        });
        if ((mark.stack || 0) >= (mark.maxStack || 3)) {
            const owner = attacker && attacker.owner ? attacker.owner : attacker;
            const atk = owner && owner.d ? (parseFloat(owner.d.atk) || 50) : 50;
            const dmgRate = Math.max(1, parseFloat(mark.burstDamageRate) || 5);
            const damage = Math.max(1, atk * dmgRate - (parseFloat(p.def) || 0));
            if (!(typeof PlayerManager !== 'undefined' && PlayerManager.isPracticeModeHpInvincible ? PlayerManager.isPracticeModeHpInvincible(gameState) : false) && !gameState.isTestMode) p.hp = Math.max(0, (parseFloat(p.hp) || 0) - damage);
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

        const groggyTime = Math.max(0.2, parseFloat(action.Groggy_Time) || 2);
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
        gameState.floatingTexts.push({
            x: m.x,
            y: m.y,
            z: m.z + bodyZ + 28,
            text: 'PARRY!',
            color: '#ffe45c',
            size: '30px',
            timer: 0.9
        });
        try { pushSystemNotice('패링 성공! 카시야스 그로기', '#ffe45c', 1.0); } catch(e) {}
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
    takeDamage: function(m, baseDmg, gameState) {
        const boss = m && m.boss ? m.boss : null;
        const action = boss && boss.action ? boss.action : null;
        const explicitActionRate = this.getBossExplicitActionDamageRate(action);
        const defenceType = String(action && action.Action_Defence_Type || '').trim().toUpperCase();

        if (this.tryResolveBossParryByPlayerHit && this.tryResolveBossParryByPlayerHit(m, gameState)) {
            return;
        }

        if (defenceType === 'INVINCIBLE' && explicitActionRate === null) {
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            gameState.floatingTexts.push({
                x: m.x,
                y: m.y,
                z: m.z + bodyZ + 18,
                text: '무적',
                color: '#c7d7ff',
                size: '22px',
                timer: 0.45
            });
            return;
        }

        let scaledDmg = calcScaledDamage(gameState.player.level, m.d.level, baseDmg);
        let finalDmg = Math.max(1, scaledDmg - m.d.def);
        const receivedRate = this.getBossReceivedDamageRate(m);
        finalDmg = receivedRate <= 0 ? 0 : Math.max(1, finalDmg * receivedRate);
        if (finalDmg <= 0) {
            const bodyZ = ((m.d && m.d.bodyZ) || 160) * (m.scale || 1);
            gameState.floatingTexts.push({
                x: m.x,
                y: m.y,
                z: m.z + bodyZ + 18,
                text: '피해 0%',
                color: '#c7d7ff',
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
        const atkW = (parseFloat(action && action.Hitbox_Size_X) || (m && m.d && m.d.bodyX) || 100) * scale;
        const atkD = (parseFloat(action && action.Hitbox_Size_Y) || (m && m.d && m.d.bodyY) || 60) * scale;
        const atkH = (parseFloat(action && action.Hitbox_Size_Z) || (m && m.d && m.d.bodyZ) || 80) * scale;

        const rawOffX = parseFloat(action && action.Hitbox_Offset_X);
        const rawOffY = parseFloat(action && action.Hitbox_Offset_Y);
        const rawOffZ = parseFloat(action && action.Hitbox_Offset_Z);
        const offX = (!isNaN(rawOffX) ? rawOffX : atkW / (2 * scale)) * scale;
        const offY = (!isNaN(rawOffY) ? rawOffY : 0) * scale;
        const offZ = (!isNaN(rawOffZ) ? rawOffZ : 0) * scale;

        return {
            x: (m.x || 0) + offX * ((m.faceDir === -1) ? -1 : 1),
            y: (m.y || 0) + offY,
            z: (m.z || 0) + offZ,
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
    buildGuardInfoFromAttackData: function(data) {
        if (!data) return null;
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
            guardDirectionType: String(data.Guard_Direction_Type || data.Guard_Direction_Check_Type || '').trim().toUpperCase(),
            guardRewardKey: rewardKey ? `${rewardKey}` : '',
            guardRewardLockTime: hitCount > 1 ? duration + 0.35 : 0.45,
            attackType: data.Attack_Type || data.Action_Attack_Type || data.Object_Type || data.Action_Type || '',
            makeKnockback: data.ATK_Make_Knockback === true || String(data.ATK_Make_Knockback || '').trim().toLowerCase() === 'true',
            knockbackCanGuard: data.Knockback_Can_Guard === true || String(data.Knockback_Can_Guard || '').trim().toLowerCase() === 'true',
            knockbackDistance: parseFloat(data.Knockback_Distance) || 0
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
        if (['WARNING_PATH','WARNING','WAIT','SPAWN_ATTACK_OBJECT','SPAWN_OBJECT','CAST_SPAWN_OBJECT','MOVE'].includes(actionType)) return false;

        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        const dmgRate = parseFloat(action.ATK_Damage_Rate) || 1;
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
                const result = PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), m.x, m.y, null, 0, 0, this.buildGuardInfoFromAttackData(action)) || {};
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
                if (action.VFX_Type) {
                    const upperVfx = String(action.VFX_Type || '').toUpperCase();
                    gameState.effects.push({
                        type: upperVfx === 'EFT_KASIYAS_SHOULDER_ATK' ? 'shoulderCharge' : 'hitSpark',
                        renderType: action.VFX_Type,
                        x: atkX,
                        y: atkY,
                        z: atkZ + atkH * 0.58,
                        dir: m.faceDir,
                        w: upperVfx === 'EFT_KASIYAS_SHOULDER_ATK' ? Math.max(atkW * 1.12, 170 * scale) : Math.max(atkW * 1.04, 120 * scale),
                        d: upperVfx === 'EFT_KASIYAS_SHOULDER_ATK' ? Math.max(atkD * 1.10, 70 * scale) : Math.max(atkD * 1.04, 60 * scale),
                        h: atkH,
                        burstScale: upperVfx === 'EFT_KASIYAS_SHOULDER_ATK' ? 1.0 : 1.35,
                        life: 0.20,
                        maxLife: 0.20,
                        color: 'rgba(255,82,60,0.92)',
                        accentColor: 'rgba(28,0,0,0.90)'
                    });
                }
                const result = PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), atkX, atkY, null, 0, 0, this.buildGuardInfoFromAttackData(action)) || {};
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
                const result = PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), hitbox.x, hitbox.y, null, 0, 0, this.buildGuardInfoFromAttackData(action)) || {};
                this.applyKasiyasOniMarkAttackResult(gameState, 'BOSS', action, result, m);
                this.trySpawnBossGuardSuccessObject(m, action, gameState, result, hitbox.x, hitbox.y);
                this.tryApplyBossGuardSpecialResult(m, action, result, gameState);
                return true;
            }
            return false;
        }

        const atkW = (parseFloat(action.Hitbox_Size_X) || 100) * m.scale;
        const atkD = (parseFloat(action.Hitbox_Size_Y) || 50) * m.scale;
        const atkH = (parseFloat(action.Hitbox_Size_Z) || 80) * m.scale;

        const offsetX = (parseFloat(action.Hitbox_Offset_X) || atkW / 2) * m.scale;
        const offsetY = (parseFloat(action.Hitbox_Offset_Y) || 0) * m.scale;
        const offsetZ = (parseFloat(action.Hitbox_Offset_Z) || 0) * m.scale;

        const atkX = m.x + offsetX * (m.faceDir === -1 ? -1 : 1);
        const atkY = m.y + offsetY;
        const atkZ = m.z + offsetZ;
        const hitbox = { x: atkX, y: atkY, z: atkZ, w: atkW, d: atkD, h: atkH };

        gameState.hitboxes.push({ ...hitbox, life: 0.1 });
        this.pushBossPatternActionEffect(m, action, atkX, atkY, atkZ, atkW, atkD, atkH, gameState);

        if (this.isPlayerInsideBoxHitbox(hitbox, gameState)) {
            const result = PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), atkX, atkY, null, 0, 0, this.buildGuardInfoFromAttackData(action)) || {};
            this.applyKasiyasOniMarkAttackResult(gameState, 'BOSS', action, result, m);
            this.trySpawnBossGuardSuccessObject(m, action, gameState, result, atkX, atkY);
            this.tryApplyBossGuardSpecialResult(m, action, result, gameState);
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
        if (hitboxType !== 'HITBOX_BOX' && hitboxType !== 'HITBOX_CIRCLE' && hitboxType !== 'HITBOX_BODY_COLLISION') return false;

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
                    this.buildGuardInfoFromAttackData(action)
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
