// [카시야스 보스전] 플레이어 액션/입력 처리 시스템 (player_action_system.js)
// ==========================================

const PlayerAction = {
    normalizeActionType: function(actionType) {
        const t = String(actionType || '').trim();
        if (!t) return '';
        if (t === 'ACT_STANCE_CHANGE') return 'Change_Mode';
        if (t === 'ACT_DASH' || t === 'ACT_JUMP') return 'Move_Character';
        if (t === 'ATK_MELEE') return 'Normal_ATK_Melee';
        if (t === 'ATK_PROJECTILE') return 'Normal_ATK_Projectile';
        return t;
    },

    normalizeRequireState: function(requireState) {
        const s = String(requireState || '').trim();
        if (!s) return '';
        if (s === 'STANCE_MELEE') return 'Mode_Melee';
        if (s === 'STANCE_RANGE') return 'Mode_Range';
        return s;
    },

    isSkillAction: function(act) {
        const t = this.normalizeActionType(act.Action_Type);
        if (t.includes('Skill_ATK')) return true;
        return (t === 'Normal_ATK_Melee' || t === 'Normal_ATK_Projectile') && (parseFloat(act.Cooltime) || 0) > 0;
    },

    isNormalAction: function(act) {
        const t = this.normalizeActionType(act.Action_Type);
        if (t.includes('Normal_ATK')) return true;
        return (t === 'Normal_ATK_Melee' || t === 'Normal_ATK_Projectile') && (parseFloat(act.Cooltime) || 0) <= 0;
    },

    getFightingSpiritAttackMultiplier: function(player) {
        if (typeof PlayerManager !== 'undefined' && PlayerManager.getFightingSpiritAttackMultiplier) {
            return PlayerManager.getFightingSpiritAttackMultiplier(player);
        }
        return 1;
    },

    getFightingSpiritMoveMultiplier: function(player) {
        if (typeof PlayerManager !== 'undefined' && PlayerManager.getFightingSpiritMoveMultiplier) {
            return PlayerManager.getFightingSpiritMoveMultiplier(player);
        }
        return 1;
    },

    resolveEffectTypeFromEnum: function(effectEnum, fallbackType = '') {
        const v = String(effectEnum || '').trim();

        const map = {
            EFT_SLASH: 'slash',
            EFT_HIT: 'hitSpark',
            EFT_BITE: 'bite',
            EFT_DASH: 'ghost',
            EFT_RUN: 'ghost',
            EFT_JUMP: 'particle',
            EFT_MODE_CHANGE: 'particle',
            EFT_GUARD: 'guard',
            EFT_GUN_FIRE: 'hitSpark',
            EFT_THUNDERBOLT: 'lightning',
            EFT_LIGHTNING_SLASH: 'slash',
            EFT_ICE_NIDDLE: 'ice_needle',
            EFT_ICE_AURA: 'particle'
        };

        return map[v] || fallbackType;
    },

    resolveProjectileRenderType: function(projectileEnum) {
        return String(projectileEnum || '').trim();
    },

    getPlayerGunMuzzlePoint: function(player) {
        const pw = (player.bodyX || 60) * (player.scale || 1);
        const ph = (player.bodyZ || 120) * (player.scale || 1);
        const face = player.faceDir === -1 ? -1 : 1;

        const gunX = pw * 0.22 * face;
        const gunW = Math.max(46, pw * 0.64);
        const muzzleOffsetX = gunW * 0.82;

        return {
            x: player.x + gunX + (face * muzzleOffsetX),
            y: player.y,
            z: player.z + ph * 0.46
        };
    },

    spawnActionEffect: function(act, player, gameState, options = {}) {
        const effectEnum = act ? act.Action_Effect_Render_Type : '';
        const effectType = this.resolveEffectTypeFromEnum(effectEnum, '');
        if (!effectType) return;

        const x = options.x != null ? options.x : player.x;
        const y = options.y != null ? options.y : player.y;
        const z = options.z != null ? options.z : player.z;
        const dir = options.dir != null ? options.dir : player.faceDir;
        const w = options.w != null ? options.w : (player.bodyX * player.scale);
        const h = options.h != null ? options.h : (player.bodyZ * player.scale);

        if (effectType === 'slash') {
            gameState.effects.push({
                type: 'slash',
                renderType: effectEnum,
                name: act.Action_Name || '',
                x: x,
                y: y,
                z: z,
                dir: dir,
                w: w,
                h: h,
                life: 0.2,
                maxLife: 0.2,
                color: "rgba(255, 255, 255, 0.9)"
            });
            return;
        }

        if (effectType === 'bite') {
            gameState.effects.push({
                type: 'bite',
                renderType: effectEnum,
                name: act.Action_Name || '',
                x: x,
                y: y,
                z: z,
                dir: dir,
                w: w,
                h: h,
                life: 0.16,
                maxLife: 0.16,
                color: "rgba(255, 150, 150, 0.95)"
            });
            return;
        }

        if (effectType === 'ghost') {
            gameState.effects.push({
                type: 'ghost',
                renderType: effectEnum,
                x: x,
                y: y,
                z: z,
                faceDir: dir,
                w: player.bodyX * player.scale,
                h: player.bodyZ * player.scale,
                life: 0.18,
                maxLife: 0.18
            });
            return;
        }

        if (effectType === 'hitSpark') {
            gameState.effects.push({
                type: 'hitSpark',
                renderType: effectEnum,
                x: x,
                y: y,
                z: z,
                life: 0.12,
                maxLife: 0.12
            });
            return;
        }

        if (effectType === 'guard') {
            gameState.effects.push({
                type: 'guard',
                renderType: effectEnum,
                x: x,
                y: y,
                z: z + h * 0.50,
                dir: dir,
                w: Math.max(104, w * 1.70),
                h: Math.max(138, h * 1.18),
                life: 0.24,
                maxLife: 0.24
            });
            return;
        }

        if (effectType === 'particle') {
            const color =
                effectEnum === 'EFT_MODE_CHANGE' ? 'rgba(241, 196, 15, 0.95)' :
                effectEnum === 'EFT_JUMP' ? 'rgba(220, 220, 220, 0.95)' :
                'rgba(255, 255, 255, 0.95)';

            gameState.effects.push({
                type: 'particle',
                renderType: effectEnum,
                x: x,
                y: y,
                z: z,
                r: 4,
                color: color,
                life: 0.18,
                maxLife: 0.18
            });
        }
    },

        getMoveKeySnapshot: function(keys) {
        return {
            LEFT: !!(keys['KeyLeft'] || keys['ArrowLeft']),
            RIGHT: !!(keys['KeyRight'] || keys['ArrowRight']),
            UP: !!(keys['KeyUp'] || keys['ArrowUp']),
            DOWN: !!(keys['KeyDown'] || keys['ArrowDown'])
        };
    },

    getHeldDirectionForRun: function(keys, direction) {
        const snap = this.getMoveKeySnapshot(keys);
        return !!snap[direction];
    },

    updateDoubleTapRun: function(deltaTime, keys, player, runAct) {
        if (!runAct) return;

        const inputType = String(runAct.Input_Trigger_Type || '').trim().toUpperCase();
        if (inputType !== 'DOUBLE_TAP') return;

        const windowTime = Math.max(0.05, parseFloat(runAct.Input_Window) || 0.2);
        if (!player.movePrevKeys) player.movePrevKeys = { LEFT: false, RIGHT: false, UP: false, DOWN: false };
        if (player.lastMoveTapTimer == null) player.lastMoveTapTimer = 0;

        player.lastMoveTapTimer = Math.max(0, (player.lastMoveTapTimer || 0) - deltaTime);

        const snap = this.getMoveKeySnapshot(keys);
        const dirs = ['LEFT', 'RIGHT', 'UP', 'DOWN'];

        for (const dir of dirs) {
            if (snap[dir] && !player.movePrevKeys[dir]) {
                if (player.lastMoveTapDir === dir && player.lastMoveTapTimer > 0) {
                    player.isRunning = true;
                    player.runDirection = dir;
                    player.runSpeedRate = parseFloat(runAct.Move_Speed_Rate) || 1.5;
                }

                player.lastMoveTapDir = dir;
                player.lastMoveTapTimer = windowTime;
            }
        }

        if (player.isRunning && !this.getHeldDirectionForRun(keys, player.runDirection)) {
            player.isRunning = false;
            player.runDirection = null;
        }

        player.movePrevKeys = snap;
    },

    handleInput: function(deltaTime, keys, gameState, player) {
        // 2페이즈 대형 패턴 2번 거대 검 조준 모드/발사 직후에는
        // X/Z/Space/C가 기존 공격·대쉬·점프 입력으로 새지 않도록 PlayerAction 입력을 선점 차단한다.
        const resetP2M2AimPlayerInput = () => {
            player.isRunning = false;
            player.runDirection = null;
            if (player.state === 'Walk' || player.state === 'Run') player.state = 'Idle';
        };
        const p2m2Aim = gameState && gameState.p2m2GiantSwordAim;
        if (gameState) {
            let consumed = gameState.p2m2GiantSwordInputConsumed || null;
            let consumedHeld = false;
            if (consumed) {
                for (const key of ['KeyX', 'KeyZ', 'Space', 'KeyC', 'ArrowLeft', 'ArrowRight']) {
                    if (consumed[key]) {
                        if (keys && keys[key]) consumedHeld = true;
                        else consumed[key] = false;
                    }
                }
                if (!consumed.KeyX && !consumed.KeyZ && !consumed.Space && !consumed.KeyC && !consumed.ArrowLeft && !consumed.ArrowRight) {
                    gameState.p2m2GiantSwordInputConsumed = null;
                }
            }
            if ((parseFloat(gameState.p2m2GiantSwordInputBlockTimer) || 0) > 0) {
                gameState.p2m2GiantSwordInputBlockTimer = Math.max(0, (parseFloat(gameState.p2m2GiantSwordInputBlockTimer) || 0) - deltaTime);
                resetP2M2AimPlayerInput();
                return;
            }
            if (consumedHeld) {
                resetP2M2AimPlayerInput();
                return;
            }
        }
        if (p2m2Aim && p2m2Aim.active !== false) {
            resetP2M2AimPlayerInput();
            return;
        }

        let dashAct = gameState.actions.find(a => String(a.Action_Name || '').trim() === '대쉬');
        let jumpAct = gameState.actions.find(a => String(a.Action_Name || '').trim() === '점프');
        let runAct = gameState.actions.find(a => String(a.Action_Type || '').trim() === 'ACT_RUN');
        let guardAct = gameState.actions.find(a => String(a.Action_Type || '').trim() === 'ACT_GUARD');
        let dashReqLv = dashAct ? parseFloat(dashAct.Require_Level) || 0 : 0;
        const oniCurseActive = typeof PlayerManager !== 'undefined' && PlayerManager.isP3OniCurseActive && PlayerManager.isP3OniCurseActive(player);
        if (oniCurseActive) {
            player.stance = 'Mode_Melee';
            if (player.state === 'Guard') player.state = 'Idle';
            player.guardTimer = 0;
        }

        // 방향키 연타 달리기는 스킬이 아닌 기본 이동 동작으로 취급한다.
        // 귀면족의 저주 중에도 5회 검격을 회피할 수 있도록 달리기 입력은 유지한다.
        this.updateDoubleTapRun(deltaTime, keys, player, runAct);

        if (guardAct && !oniCurseActive) {
            const guardKey = getEngineKeyCode(guardAct.Input_Key);
            const isGuardHeld = !!(guardKey && keys[guardKey]);
            const guardMaxHold = Math.max(
                0.15,
                parseFloat(guardAct.Guard_Max_Hold_Time) ||
                1.5
            );
            const guardRecover = Math.max(
                0,
                parseFloat(guardAct.Guard_Recover_Time) ||
                1.0
            );

            if (player.state === 'Guard' && !isGuardHeld) {
                // 직접 키를 떼서 해제한 경우에는 회복 시간을 주지 않는다.
                player.state = 'Idle';
                player.guardTimer = 0;
                player.guardForcedRecover = false;
            }

            if (
                guardKey &&
                isGuardHeld &&
                player.guardCooldownTimer <= 0 &&
                player.state !== 'Guard' &&
                player.state !== 'Dash' &&
                player.state !== 'Hit' &&
                player.state !== 'Atk' &&
                player.state !== 'Freeze' &&
                player.state !== 'Die' &&
                player.isGrounded
            ) {
                player.state = 'Guard';
                player.guardTimer = guardMaxHold;
                player.maxGuardTimer = guardMaxHold;
                player.guardCooldownTimer = 0;
                player.maxGuardCooldown = guardRecover;
                player.guardForcedRecover = false;
                player.guardDirection = guardAct.Guard_Direction || 'CASTER_FRONT';
                player.guardDefenceType = guardAct.Guard_Defence_Type || 'SUPER_ARMOR';
                player.isRunning = false;
                player.runDirection = null;
                player.kbVx = 0;
                player.kbVy = 0;

                this.spawnActionEffect(guardAct, player, gameState, {
                    x: player.x,
                    y: player.y,
                    z: player.z,
                    dir: player.faceDir,
                    w: player.bodyX * player.scale,
                    h: player.bodyZ * player.scale
                });
            }
        }

        if (
            dashAct &&
            !oniCurseActive &&
            keys[gameState.dashKeyEngine] &&
            player.level >= dashReqLv &&
            player.dashCooldownTimer <= 0 &&
            player.state !== 'Dash' &&
            player.state !== 'Guard' &&
            player.state !== 'Hit' &&
            player.state !== 'Atk' &&
            player.isGrounded
        ) {
            player.state = 'Dash';
            player.isRunning = false;
            player.runDirection = null;
            let spdRate = parseFloat(dashAct.Move_Speed_Rate) || 2.0;
            let dist = parseFloat(dashAct.Move_Distance) || 600;

            let dx = 0;
            if (keys['KeyLeft'] || keys['ArrowLeft']) dx = -1;
            else if (keys['KeyRight'] || keys['ArrowRight']) dx = 1;
            if (dx === 0) dx = player.faceDir;

            let dashSpeed = player.speed * this.getFightingSpiritMoveMultiplier(player) * spdRate;
            player.dashSpeedX = dx * dashSpeed;
            player.dashSpeedY = 0;
            player.dashTimer = dist / dashSpeed;
            player.dashCooldownTimer = player.maxDashCd;
            player.ghostTimer = 0;

            this.spawnActionEffect(dashAct, player, gameState, {
                x: player.x,
                y: player.y,
                z: player.z,
                dir: player.faceDir
            });

            keys[gameState.dashKeyEngine] = false;
        }

        if (player.state === 'Dash') {
            player.x += player.dashSpeedX * deltaTime;
            player.y += player.dashSpeedY * deltaTime;
            player.dashTimer -= deltaTime;
            player.ghostTimer += deltaTime;

            if (player.ghostTimer >= 0.04) {
                player.ghostTimer = 0;
                this.spawnActionEffect(dashAct, player, gameState, {
                    x: player.x,
                    y: player.y,
                    z: player.z,
                    dir: player.faceDir
                });
            }

            if (player.dashTimer <= 0) player.state = 'Idle';
        }
        else if (player.state === 'Guard') {
            // 타이밍 가드 중에는 이동/공격 입력을 받지 않는다.
        }
        else if (player.state === 'Hit') {
            player.x += (player.kbVx || 0) * deltaTime;
            player.y += (player.kbVy || 0) * deltaTime;
        }
        else {
            if (player.state === 'Idle' || player.state === 'Walk' || player.state === 'Run' || player.state === 'Atk') {
                let moved = false;
                const runRate = player.isRunning ? (player.runSpeedRate || (runAct ? parseFloat(runAct.Move_Speed_Rate) || 1.5 : 1.5)) : 1;
                const oniMoveRate = typeof PlayerManager !== 'undefined' && PlayerManager.getP3OniCurseMoveMultiplier ? PlayerManager.getP3OniCurseMoveMultiplier(player) : 1;
                const moveSpeed = player.speed * this.getFightingSpiritMoveMultiplier(player) * oniMoveRate * runRate;

                if (keys['KeyLeft'] || keys['ArrowLeft']) {
                    player.x -= moveSpeed * deltaTime;
                    player.faceDir = -1;
                    moved = true;
                }
                else if (keys['KeyRight'] || keys['ArrowRight']) {
                    player.x += moveSpeed * deltaTime;
                    player.faceDir = 1;
                    moved = true;
                }

                if (keys['KeyUp'] || keys['ArrowUp']) {
                    player.y -= moveSpeed * 0.7 * deltaTime;
                    moved = true;
                }
                else if (keys['KeyDown'] || keys['ArrowDown']) {
                    player.y += moveSpeed * 0.7 * deltaTime;
                    moved = true;
                }

                if (!moved) {
                    player.isRunning = false;
                    player.runDirection = null;
                }

                if (player.atkTimer <= 0) {
                    player.state = moved ? (player.isRunning ? 'Run' : 'Walk') : 'Idle';
                }

                // 점프는 스킬이 아닌 기본 동작으로 취급한다.
                // 귀면족의 저주 중에도 검격 회피에 사용할 수 있도록 허용한다.
                if (
                    keys[gameState.jumpKeyEngine] &&
                    player.isGrounded &&
                    player.atkTimer <= 0 &&
                    player.stanceSwapTimer <= 0
                ) {
                    player.vz = player.jumpPower;
                    player.isGrounded = false;
                    player.isRunning = false;
                    player.runDirection = null;

                    if (jumpAct) {
                        this.spawnActionEffect(jumpAct, player, gameState, {
                            x: player.x,
                            y: player.y,
                            z: player.z + 4
                        });
                    }
                }
            }

            if (player.atkTimer <= 0) {
                for (let act of gameState.actions) {
                    let engineKey = getEngineKeyCode(act.Input_Key);
                    let reqLv = parseFloat(act.Require_Level) || 0;
                    let actionType = this.normalizeActionType(act.Action_Type);
                    let requireState = this.normalizeRequireState(act.Require_State);
                    let isSkill = this.isSkillAction(act);
                    let isNormal = this.isNormalAction(act);
                    let cd = parseFloat(act.Cooltime) || 0;
                    const actionTypeRaw = String(act.Action_Type || '').trim();

                    if (actionTypeRaw === 'ACT_RUN' || actionTypeRaw === 'ACT_GUARD') continue;
                    if (oniCurseActive && actionType !== 'Normal_ATK_Melee') continue;

                    let isOnCd = player.skillCooldowns[act.Action_Name] > 0;

                    if (keys[engineKey] && player.level >= reqLv && !isOnCd) {
                        if (actionType === 'Move_Character') continue;

                        if (actionType === 'Change_Mode') {
                            if (
                                player.stanceSwapTimer <= 0 &&
                                player.rapidAtkCooldownTimer <= 0 &&
                                player.atkTimer <= 0
                            ) {
                                player.stance = player.stance === 'Mode_Melee' ? 'Mode_Range' : 'Mode_Melee';
                                player.isRunning = false;
                                player.runDirection = null;

                                let lockTime = parseFloat(act.Action_Anim_Duration) || 0.5;
                                player.stanceSwapTimer = lockTime;
                                player.maxStanceSwap = lockTime;
                                player.rapidAtkCount = 0;
                                player.rapidAtkAllowTimer = 0;
                                player.skillCooldowns[act.Action_Name] = cd;

                                this.spawnActionEffect(act, player, gameState, {
                                    x: player.x,
                                    y: player.y,
                                    z: player.z + (player.bodyZ * player.scale) / 2
                                });

                                keys[engineKey] = false;
                            }
                        } else if (requireState === player.stance || !requireState) {
                            let canUse = false;
                            if (isSkill && player.stanceSwapTimer <= 0 && player.atkTimer <= 0.1) canUse = true;
                            if (isNormal && player.stanceSwapTimer <= 0 && player.rapidAtkCooldownTimer <= 0 && player.atkTimer <= 0) canUse = true;

                            if (canUse) {
                                if (oniCurseActive && actionType === 'Normal_ATK_Melee' && typeof PlayerManager !== 'undefined' && PlayerManager.markP3OniCurseAttack) {
                                    PlayerManager.markP3OniCurseAttack(gameState);
                                }
                                player.state = 'Atk';
                                player.isRunning = false;
                                player.runDirection = null;
                                let animDur = parseFloat(act.Action_Anim_Duration) || 0.2;
                                player.atkTimer = animDur;

                                if (isSkill) {
                                    player.skillCooldowns[act.Action_Name] = cd;
                                } else {
                                    player.rapidAtkCount++;
                                    let maxCount = parseInt(act.Rapid_ATK_Max_Count) || 1;
                                    let allowTime = parseFloat(act.Rapid_ATK_Allow_Time) || 1.5;
                                    let coolTime = parseFloat(act.Rapid_ATK_Cooltime) || 0.5;
                                    if (oniCurseActive && actionType === 'Normal_ATK_Melee') coolTime = Math.max(0, parseFloat(player.oniCurseRapidAtkCooltime) || 0);
                                    player.rapidAtkAllowTimer = allowTime;
                                    player.maxRapidAllow = allowTime;

                                    if (player.rapidAtkCount >= maxCount) {
                                        player.rapidAtkCooldownTimer = coolTime;
                                        player.maxRapidAtkCd = coolTime;
                                        player.rapidAtkAllowTimer = 0;
                                        player.rapidAtkCount = 0;
                                    }
                                }

                                let baseDmg = player.atk * this.getFightingSpiritAttackMultiplier(player) * (parseFloat(act.ATK_DMG_Rate) || 1.0);

                                if (act.ATK_Projectile_Render_Type) {
                                    const projectileRenderType = this.resolveProjectileRenderType(
                                        act.ATK_Projectile_Render_Type
                                    );
                                    const muzzlePoint = this.getPlayerGunMuzzlePoint(player);

                                    gameState.projectiles.push({
                                        isPlayer: true,
                                        x: muzzlePoint.x,
                                        y: muzzlePoint.y,
                                        z: muzzlePoint.z,
                                        vx: player.faceDir * (parseFloat(act.ATK_Projectile_Speed) || 500),
                                        vy: 0,
                                        vz: 0,
                                        life: parseFloat(act.ATK_Projectile_Duration) || 1,
                                        atk: baseDmg,
                                        hitX: parseFloat(act.ATK_Projectile_Hitbox_Size_X) || 20,
                                        hitY: parseFloat(act.ATK_Projectile_Hitbox_Size_Y) || 20,
                                        hitZ: parseFloat(act.ATK_Projectile_Hitbox_Size_Z) || 20,
                                        penetrate: String(act.ATK_Projectile_Penetration).toLowerCase() === 'true',
                                        hasHit: false,
                                        projName: '',
                                        renderType: projectileRenderType,
                                        hitTargets: new Set(),
                                        statusType: null,
                                        statusDur: 0,
                                        statusProb: 0
                                    });

                                    this.spawnActionEffect(act, player, gameState, {
                                        x: muzzlePoint.x,
                                        y: muzzlePoint.y,
                                        z: muzzlePoint.z
                                    });
                                }

                                if (parseFloat(act.ATK_Hitbox_Size_X) > 0) {
                                    let atkW = parseFloat(act.ATK_Hitbox_Size_X) || 130;
                                    let atkD = parseFloat(act.ATK_Hitbox_Size_Y) || 40;
                                    let atkH = parseFloat(act.ATK_Hitbox_Size_Z) || 60;
                                    let atkX = player.x + (player.faceDir === 1 ? atkW / 2 : -atkW / 2);
                                    let atkY = player.y;
                                    let atkZ = player.z + Math.max(10, (player.bodyZ * player.scale) * 0.12);

                                    gameState.hitboxes.push({
                                        x: atkX,
                                        y: atkY,
                                        z: atkZ,
                                        w: atkW,
                                        d: atkD,
                                        h: atkH,
                                        life: 0.1
                                    });

                                    this.spawnActionEffect(act, player, gameState, {
                                        x: atkX,
                                        y: atkY,
                                        z: atkZ + atkH / 2,
                                        dir: player.faceDir,
                                        w: atkW,
                                        h: atkH
                                    });

                                    for (let m of gameState.monsters) {
                                        if (m.active && m.hp > 0) {
                                            let mW = m.d.bodyX * m.scale;
                                            let mD = m.d.bodyY * m.scale;
                                            let mH = m.d.bodyZ * m.scale;

                                            if (checkAABB3D(atkX, atkY, atkZ, atkW, atkD, atkH, m.x, m.y, m.z, mW, mD, mH)) {
                                                try {
                                                    const hpBefore = parseFloat(m.hp) || 0;
                                                    MonsterManager.takeDamage(m, baseDmg, gameState);
                                                    const hpAfter = parseFloat(m.hp) || 0;
                                                    if (typeof PlayerManager !== 'undefined' && PlayerManager.applyP3OniCurseLifeSteal) {
                                                        PlayerManager.applyP3OniCurseLifeSteal(gameState, Math.max(0, hpBefore - hpAfter), m);
                                                    }
                                                    if (typeof PlayerManager !== 'undefined' && PlayerManager.addFightingSpirit && (player.fightingSpiritAtkGainCooldownTimer || 0) <= 0) {
                                                        if (PlayerManager.addFightingSpirit(gameState, player.atkGetFightingSpirit || 0, { lockTime: player.atkGetFightingSpiritCooldown || 0.3 })) {
                                                            player.fightingSpiritAtkGainCooldownTimer = Math.max(0, player.atkGetFightingSpiritCooldown || 0);
                                                        }
                                                    }
                                                } catch (e) {}
                                            }
                                        }
                                    }

                                    if (typeof BossObjectSystem !== 'undefined' && BossObjectSystem.tryDamageBossDestructibleObjects) {
                                        BossObjectSystem.tryDamageBossDestructibleObjects(gameState, {
                                            x: atkX,
                                            y: atkY,
                                            z: atkZ,
                                            w: atkW,
                                            d: atkD,
                                            h: atkH
                                        }, baseDmg, { type: 'melee', action: act, penetrate: true });
                                    }
                                }

                                keys[engineKey] = false;
                                break;
                            }
                        }
                    }
                }
            }

            player.x = Math.max(40, Math.min(gameState.WORLD_WIDTH - 40, player.x));
            player.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, player.y));
        }
    }

};
