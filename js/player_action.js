// ==========================================
// [모험의 시작] 플레이어 액션/스킬 모듈 (player_action.js)
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
                z: z + h * 0.45,
                dir: dir,
                w: Math.max(52, w * 0.9),
                h: Math.max(72, h * 0.78),
                life: 0.22,
                maxLife: 0.22
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
        let dashAct = gameState.actions.find(a => String(a.Action_Name || '').trim() === '대쉬');
        let jumpAct = gameState.actions.find(a => String(a.Action_Name || '').trim() === '점프');
        let runAct = gameState.actions.find(a => String(a.Action_Type || '').trim() === 'ACT_RUN');
        let guardAct = gameState.actions.find(a => String(a.Action_Type || '').trim() === 'ACT_GUARD');
        let dashReqLv = dashAct ? parseFloat(dashAct.Require_Level) || 0 : 0;

        this.updateDoubleTapRun(deltaTime, keys, player, runAct);

        if (guardAct) {
            const guardKey = getEngineKeyCode(guardAct.Input_Key);
            const guardCd = parseFloat(guardAct.Cooltime) || 0;
            const guardDur = Math.max(0.05, parseFloat(guardAct.Action_Anim_Duration) || 0.6);

            if (
                guardKey &&
                keys[guardKey] &&
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
                player.guardTimer = guardDur;
                player.maxGuardTimer = guardDur;
                player.guardCooldownTimer = guardCd;
                player.maxGuardCooldown = guardCd;
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

                keys[guardKey] = false;
            }
        }

        if (
            dashAct &&
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

            let dashSpeed = player.speed * spdRate;
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
                const moveSpeed = player.speed * runRate;

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
                                    player.rapidAtkAllowTimer = allowTime;
                                    player.maxRapidAllow = allowTime;

                                    if (player.rapidAtkCount >= maxCount) {
                                        player.rapidAtkCooldownTimer = coolTime;
                                        player.maxRapidAtkCd = coolTime;
                                        player.rapidAtkAllowTimer = 0;
                                        player.rapidAtkCount = 0;
                                    }
                                }

                                let baseDmg = player.atk * (parseFloat(act.ATK_DMG_Rate) || 1.0);

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
                                                    MonsterManager.takeDamage(m, baseDmg, gameState);
                                                } catch (e) {}
                                            }
                                        }
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