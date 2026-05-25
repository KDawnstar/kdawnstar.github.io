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
    takeDamage: function(m, baseDmg, gameState) {
        const boss = m && m.boss ? m.boss : null;
        const action = boss && boss.action ? boss.action : null;
        const defenceType = String(action && action.Action_Defence_Type || '').trim().toUpperCase();
        if (defenceType === 'INVINCIBLE') {
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

        if (this.tryResolveBossParryByPlayerHit && this.tryResolveBossParryByPlayerHit(m, gameState)) {
            return;
        }

        let scaledDmg = calcScaledDamage(gameState.player.level, m.d.level, baseDmg);
        let finalDmg = Math.max(1, scaledDmg - m.d.def); 
        m.hp -= finalDmg;
        
        gameState.floatingTexts.push({x: m.x, y: m.y, z: m.z + (m.d.bodyZ * m.scale) + 20, text: `${finalDmg.toFixed(0)}`, color: "#fff", size: "36px", timer: 1.0});
        gameState.effects.push({ type: 'hitSpark', renderType: 'EFT_HIT', x: m.x, y: m.y, z: m.z + m.d.bodyZ*m.scale/2, life: 0.15, maxLife: 0.15 });

        gameState.targetUI.monster = m; gameState.targetUI.timer = 3.0;
        m.isProvoked = true;

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
                this.trySpawnBossGuardSuccessObject(m, action, gameState, result, m.x, m.y);
                return true;
            }
            return false;
        }

        if (hitboxType === 'HITBOX_BODY_COLLISION') {
            const scale = m.scale || 1;
            const atkW = (parseFloat(action.Hitbox_Size_X) || m.d.bodyX || 80) * scale;
            const atkD = (parseFloat(action.Hitbox_Size_Y) || m.d.bodyY || 60) * scale;
            const atkH = (parseFloat(action.Hitbox_Size_Z) || m.d.bodyZ || 160) * scale;
            const atkX = m.x + (parseFloat(action.Hitbox_Offset_X) || 0) * scale * (m.faceDir === -1 ? -1 : 1);
            const atkY = m.y + (parseFloat(action.Hitbox_Offset_Y) || 0) * scale;
            const atkZ = m.z + (parseFloat(action.Hitbox_Offset_Z) || 0) * scale;
            const hitbox = { x: atkX, y: atkY, z: atkZ, w: atkW, d: atkD, h: atkH };
            gameState.hitboxes.push({ ...hitbox, life: 0.08 });
            if (this.isPlayerInsideBoxHitbox(hitbox, gameState)) {
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
                PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, baseDmg), atkX, atkY, null, 0, 0, this.buildGuardInfoFromAttackData(action));
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
                this.trySpawnBossGuardSuccessObject(m, action, gameState, result, hitbox.x, hitbox.y);
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
            this.trySpawnBossGuardSuccessObject(m, action, gameState, result, atkX, atkY);
            return true;
        }
        return false;
    },
    getBossObjectActionHitbox: function(obj, action) {
        const scale = obj.scale || 1;
        const w = (parseFloat(action.Hitbox_Size_X) || 100) * scale;
        const d = (parseFloat(action.Hitbox_Size_Y) || 60) * scale;
        const h = (parseFloat(action.Hitbox_Size_Z) || 80) * scale;
        const offX = (parseFloat(action.Hitbox_Offset_X) || 0) * scale;
        const offY = (parseFloat(action.Hitbox_Offset_Y) || 0) * scale;
        const offZ = (parseFloat(action.Hitbox_Offset_Z) || 0) * scale;

        return {
            x: obj.x + offX * (obj.faceDir === -1 ? -1 : 1),
            y: obj.y + offY,
            z: obj.z + offZ,
            w: w,
            d: d,
            h: h
        };
    },
    fireBossObjectActionHit: function(obj, action, gameState) {
        const p = gameState.player;
        if (!p || !p.active || p.hp <= 0 || obj.actionCancelled) return false;

        const hitboxType = String(action.Hitbox_Type || '').trim().toUpperCase();
        if (hitboxType !== 'HITBOX_BOX' && hitboxType !== 'HITBOX_CIRCLE') return false;

        const hitbox = this.getBossObjectActionHitbox(obj, action);
        gameState.hitboxes.push({ ...hitbox, type: hitboxType === 'HITBOX_CIRCLE' ? 'circle' : undefined, life: 0.12 });
        this.pushBossObjectActionEffect(obj, action, hitbox, gameState);

        const isHit = hitboxType === 'HITBOX_CIRCLE'
            ? this.isPlayerInsideCircleHitbox(hitbox, gameState)
            : this.isPlayerInsideBoxHitbox(hitbox, gameState);

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
                    hitbox.x,
                    hitbox.y,
                    null,
                    0,
                    0,
                    this.buildGuardInfoFromAttackData(action)
                ) || {};

                const guardResult = String(action.Guard_Result_Type || '').trim().toUpperCase();
                if (result.guarded && guardResult === 'ATK_CANCEL') {
                    obj.actionCancelled = true;
                    obj.cancelledByGuard = true;
                    obj.actionHitFired = true;
                    // ATK_CANCEL은 분신 자체 삭제나 액션 시퀀스 강제 종료가 아니라,
                    // 현재 공격의 잔여 다단히트만 끊는다. 액션 시간은 유지해서 본체/분신 타이밍을 보존한다.
                    obj.opacity = Math.min(parseFloat(obj.opacity) || 0.8, 0.50);

                    // ATK_CANCEL로 분신 난무가 끊겼다면, 남은 판정뿐 아니라
                    // 해당 분신의 공격 범위 표시도 즉시 제거한다.
                    if (Array.isArray(gameState.effects)) {
                        const objectId = String(obj.data && (obj.data.Object_ID || obj.data.Attack_Object_ID) || '').trim();
                        const actionId = String(action.Object_Action_ID || '').trim();
                        gameState.effects = gameState.effects.filter(eff => {
                            if (!eff || eff.type !== 'warning' || !eff.activeAttackRange) return true;
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
