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
            EFT_JUMP: 'particle',
            EFT_MODE_CHANGE: 'particle',
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

        handleInput: function(deltaTime, keys, gameState, player) {
        let dashAct = gameState.actions.find(a => a.Action_Name === '대쉬');
        let jumpAct = gameState.actions.find(a => a.Action_Name === '점프');
        let dashReqLv = dashAct ? parseFloat(dashAct.Require_Level) || 0 : 0;

        if (
            dashAct &&
            keys[gameState.dashKeyEngine] &&
            player.level >= dashReqLv &&
            player.dashCooldownTimer <= 0 &&
            player.state !== 'Dash' &&
            player.state !== 'Hit' &&
            player.state !== 'Atk' &&
            player.isGrounded
        ) {
            player.state = 'Dash';
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
        else if (player.state === 'Hit') {
            player.x += (player.kbVx || 0) * deltaTime;
            player.y += (player.kbVy || 0) * deltaTime;
        }
        else {
            if (player.state === 'Idle' || player.state === 'Walk' || player.state === 'Atk') {
                let moved = false;

                if (keys['KeyLeft'] || keys['ArrowLeft']) {
                    player.x -= player.speed * deltaTime;
                    player.faceDir = -1;
                    moved = true;
                }
                else if (keys['KeyRight'] || keys['ArrowRight']) {
                    player.x += player.speed * deltaTime;
                    player.faceDir = 1;
                    moved = true;
                }

                if (keys['KeyUp'] || keys['ArrowUp']) {
                    player.y -= player.speed * 0.7 * deltaTime;
                    moved = true;
                }
                else if (keys['KeyDown'] || keys['ArrowDown']) {
                    player.y += player.speed * 0.7 * deltaTime;
                    moved = true;
                }

                if (player.atkTimer <= 0) {
                    player.state = moved ? 'Walk' : 'Idle';
                }

                if (
                    keys[gameState.jumpKeyEngine] &&
                    player.isGrounded &&
                    player.atkTimer <= 0 &&
                    player.stanceSwapTimer <= 0
                ) {
                    player.vz = player.jumpPower;
                    player.isGrounded = false;

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