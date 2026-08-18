// [카시야스 보스전] OBJECT_DEFENSE 스페셜 모드 시스템
// ==========================================
// - Special_Mode_info는 실행 규칙/Player 참조만 관리한다.
// - Player/Player Action/Monster Pattern Object/Monster Pattern Action 공용 데이터를 사용한다.
// - Wave/Group 엔티티 없이 Ref_Special_Mode가 일치하는 Pattern Action을 Action_Order 순으로 실행한다.
// ==========================================

const SpecialModeObjectDefenseSystem = {
    MODE: 'SPECIAL_MODE_OBJECT_DEFENSE',
    LANES: ['LEFT', 'CENTER', 'RIGHT'],
    DEFAULT_VIRTUAL: { fieldW: 480, fieldH: 760, spawnY: 78, warningTopY: 44, playerGroundY: 690, floorY: 720 },

    num(value, fallback = 0) {
        const n = parseFloat(value);
        return Number.isFinite(n) ? n : fallback;
    },

    bool(value) {
        if (typeof value === 'boolean') return value;
        const raw = String(value || '').trim().toUpperCase();
        return raw === 'TRUE' || raw === '1' || raw === 'YES' || raw === 'Y';
    },

    laneIndex(value, fallback = 1) {
        const raw = String(value || '').trim().toUpperCase();
        if (raw === 'LEFT' || raw === 'L' || raw === '0') return 0;
        if (raw === 'CENTER' || raw === 'CENTRE' || raw === 'C' || raw === '1') return 1;
        if (raw === 'RIGHT' || raw === 'R' || raw === '2') return 2;
        return fallback;
    },

    getLaneName(index) {
        return this.LANES[Math.max(0, Math.min(2, parseInt(index) || 0))] || 'CENTER';
    },

    isActive(gameState) {
        return !!(gameState && gameState.specialMode === this.MODE && gameState.specialModeObjectDefenseRuntime && gameState.specialModeObjectDefenseRuntime.active);
    },

    getBoss(gameState) {
        if (!gameState) return null;
        const battleBoss = gameState.bossBattle && gameState.bossBattle.boss;
        if (battleBoss && battleBoss.active) return battleBoss;
        return (gameState.monsters || []).find(m => m && m.active && m.isStageBoss && m.boss) || null;
    },

    getActionKey(action) {
        if (!action) return '';
        if (typeof getEngineKeyCode === 'function') return getEngineKeyCode(action.Input_Key);
        const raw = String(action.Input_Key || '').trim().toUpperCase();
        if (raw === 'KEY_X') return 'KeyX';
        if (raw === 'KEY_A') return 'KeyA';
        if (raw === 'KEY_C') return 'KeyC';
        if (raw === 'KEY_D') return 'KeyD';
        return '';
    },

    isKeyPressed(rt, code, keys) {
        return !!(keys && keys[code]) && !(rt.inputPrev && rt.inputPrev[code]);
    },

    actionFor(rt, actionType) {
        const type = String(actionType || '').trim().toUpperCase();
        return (rt.playerActions || []).find(a => String(a && a.Action_Type || '').trim().toUpperCase() === type) || null;
    },

    hasPlayerBuff(rt, buffKey) {
        const key = String(buffKey || '').trim();
        return !!(key && rt && rt.player && rt.player.buffs && rt.player.buffs[key]);
    },

    grantPlayerBuff(rt, buffKey) {
        const key = String(buffKey || '').trim();
        if (!key || !rt || !rt.player) return false;
        if (!rt.player.buffs) rt.player.buffs = {};
        rt.player.buffs[key] = true;
        return true;
    },

    consumePlayerBuff(rt, buffKey) {
        const key = String(buffKey || '').trim();
        if (!key || !rt || !rt.player || !rt.player.buffs || !rt.player.buffs[key]) return false;
        delete rt.player.buffs[key];
        return true;
    },

    getInternalActions(gameState, sourcePatternId, specialModeId) {
        const db = gameState && gameState.DB_BOSS_PATTERN_ACTION ? gameState.DB_BOSS_PATTERN_ACTION : {};
        return Object.values(db)
            .filter(action => {
                if (!action) return false;
                const samePattern = String(action.Pattern_ID || '') === String(sourcePatternId || '');
                const sameMode = String(action.Ref_Special_Mode || '') === String(specialModeId || '');
                const type = String(action.Action_Type || '').trim().toUpperCase();
                return samePattern && sameMode && type !== 'SPECIAL_MODE_START';
            })
            .sort((a, b) => this.num(a.Action_Order, 0) - this.num(b.Action_Order, 0));
    },

    startFromPattern(gameState, boss, options = {}) {
        if (!gameState || this.isActive(gameState)) return false;
        if (gameState.specialMode === this.MODE && !(gameState.specialModeObjectDefenseRuntime && gameState.specialModeObjectDefenseRuntime.active)) {
            gameState.specialMode = null;
            gameState.specialModeObjectDefenseRuntime = null;
        }
        if (gameState.specialMode && gameState.specialMode !== this.MODE) return false;
        const targetBoss = boss || this.getBoss(gameState);
        if (targetBoss && targetBoss.boss) {
            targetBoss.boss.specialModeStarted = false;
            targetBoss.boss.specialModeResult = null;
        }
        return this.start(gameState, {
            isTestMode: false,
            isPatternLinked: true,
            boss: targetBoss,
            sourcePatternId: options.patternId || options.sourcePatternId || '',
            sourceActionId: options.sourceActionId || '',
            specialModeId: options.specialModeId || options.refSpecialMode || null
        });
    },

    getIntroActionKind(action) {
        if (!action) return '';
        const pose = String(action.Action_Pose_Type || '').trim().toUpperCase();
        const vfx = String(action.VFX_Type || '').trim().toUpperCase();
        const moveType = String(action.Action_Move_Type || '').trim().toUpperCase();
        const moveDir = String(action.Action_Move_Direction || '').trim().toUpperCase();
        if (vfx === 'EFT_P2_M3_GROUND_COLLAPSE_AND_FALL') return 'COLLAPSE_FALL';
        if (pose === 'POSE_KASIYAS_P2_SWORD_HANDLE_ATK') return 'HANDLE_HIT';
        if (moveType === 'MOVE_DASH' && moveDir === 'TO_PLAYER') return 'APPROACH';
        return '';
    },

    updatePatternIntroAction(m, action, deltaTime, gameState) {
        if (!m || !action || !gameState) return false;
        const kind = this.getIntroActionKind(action);
        if (!kind) return false;
        const p = gameState.player || null;
        const duration = Math.max(0.05, parseFloat(action.Action_Anim_Duration) || 1);
        const ratio = Math.max(0, Math.min(1, (parseFloat(m.timer) || 0) / duration));
        const ease = ratio * ratio * (3 - 2 * ratio);
        gameState.specialModeObjectDefenseIntroRuntime = gameState.specialModeObjectDefenseIntroRuntime || {};
        const intro = gameState.specialModeObjectDefenseIntroRuntime;
        const actionKey = String(action.Action_ID || action.Dev_Name || kind);
        if (intro.actionKey !== actionKey) {
            intro.actionKey = actionKey;
            intro.actionKind = kind;
            intro.active = true;
            intro.timer = 0;
            intro.duration = duration;
            intro.startBossX = m.x;
            intro.startBossY = m.y;
            intro.startPlayerX = p ? p.x : m.x;
            intro.startPlayerY = p ? p.y : m.y;
            intro.hitFired = false;
            intro.noticeFired = false;
            intro.zoom = 1.16;
        }
        intro.timer = parseFloat(m.timer) || 0;
        if (p) {
            p.kbVx = 0; p.kbVy = 0; p.vx = 0; p.vy = 0; p.atkTimer = 0; p.guardTimer = 0;
            p.state = (kind === 'HANDLE_HIT' || kind === 'COLLAPSE_FALL') ? 'Hit' : 'Idle';
        }
        if (kind === 'APPROACH' && p) {
            const dir = (p.x >= (intro.startBossX || m.x)) ? 1 : -1;
            const targetX = p.x - dir * 132;
            m.x = (intro.startBossX || m.x) + (targetX - (intro.startBossX || m.x)) * ease;
            m.y = (intro.startBossY || m.y) + (p.y - (intro.startBossY || m.y)) * ease;
            m.faceDir = dir;
            intro.focusX = (m.x + p.x) * 0.5;
            intro.focusY = (typeof GameRenderer !== 'undefined' ? GameRenderer.GROUND_BASE_Y : 400) + ((m.y + p.y) * 0.5) - 110;
            intro.zoom = 1.22 + 0.10 * Math.sin(Math.PI * ratio);
            m.state = 'MOVE';
        } else if (kind === 'HANDLE_HIT' && p) {
            const dir = (p.x >= m.x) ? 1 : -1;
            m.x = p.x - dir * 126; m.y = p.y; m.faceDir = dir; m.state = 'ATK_MELEE';
            intro.focusX = (m.x + p.x) * 0.5;
            intro.focusY = (typeof GameRenderer !== 'undefined' ? GameRenderer.GROUND_BASE_Y : 400) + p.y - 115;
            intro.zoom = 1.34;
            if (!intro.hitFired && ratio >= 0.42) {
                intro.hitFired = true;
                if (gameState.screenShake) { gameState.screenShake.timer = 0.22; gameState.screenShake.maxTime = 0.22; gameState.screenShake.power = 10; }
                if (Array.isArray(gameState.effects)) gameState.effects.push({ type:'hitSpark', renderType: action.VFX_Type || 'EFT_KASIYAS_P2_SWORD_HANDLE_ATK', x:p.x, y:p.y, z:(p.z||0)+88, life:0.28, maxLife:0.28, dir });
            }
        } else if (kind === 'COLLAPSE_FALL' && p) {
            const groundBase = (typeof GameRenderer !== 'undefined' ? GameRenderer.GROUND_BASE_Y : 400);
            intro.focusX = (m.x + p.x) * 0.5;
            intro.focusY = groundBase + p.y - 70 + 210 * ease;
            intro.zoom = 1.25 - 0.10 * ease;
            m.state = 'IDLE'; p.state = 'Hit';
            const fallZ = -220 * ease;
            if (ratio < 0.96) { m.z = fallZ * 0.72; p.z = fallZ; } else { m.z = 0; p.z = 0; }
            if (gameState.screenShake) {
                gameState.screenShake.timer = Math.max(gameState.screenShake.timer || 0, 0.08);
                gameState.screenShake.maxTime = 0.12;
                gameState.screenShake.power = Math.max(gameState.screenShake.power || 0, 3 + 8 * Math.sin(Math.PI * ratio));
            }
            if (ratio > 0.68 && !intro.fallFlashFired) {
                intro.fallFlashFired = true;
                gameState.screenHitFlash = { mode:'white', life:0.28, maxLife:0.28, strength:0.42 };
            }
        }
        return true;
    },

    start(gameState, options = {}) {
        if (!gameState) return false;
        gameState.specialModeObjectDefenseFailDamageRuntime = null;
        const boss = options.boss || this.getBoss(gameState);
        const sourcePatternId = String(options.sourcePatternId || options.patternId || '').trim();
        const requestedModeId = options.specialModeId !== null && options.specialModeId !== undefined ? String(options.specialModeId).trim() : '';
        let specialModeData = null;
        if (requestedModeId) specialModeData = (gameState.DB_SPECIAL_MODE || []).find(row => String(row && row.Special_Mode_ID || '').trim() === requestedModeId) || null;
        if (!specialModeData) specialModeData = (gameState.DB_SPECIAL_MODE || []).find(row => String(row && row.Special_Mode_Type || '').trim().toUpperCase() === 'OBJECT_DEFENSE') || null;
        if (!specialModeData || String(specialModeData.Special_Mode_Type || '').trim().toUpperCase() !== 'OBJECT_DEFENSE') {
            try { pushSystemNotice('실행할 스페셜 모드 데이터를 찾을 수 없습니다.', '#ffb8b8', 1.4); } catch (e) {}
            return false;
        }
        const specialModeId = specialModeData.Special_Mode_ID;
        const playerRef = String(specialModeData.Ref_Player || '').trim();
        const playerData = (gameState.DB_PLAYER && (gameState.DB_PLAYER[playerRef] || gameState.DB_PLAYER[String(playerRef)])) || null;
        if (!playerData) {
            try { pushSystemNotice('스페셜 모드 플레이어 데이터를 찾을 수 없습니다.', '#ffb8b8', 1.4); } catch (e) {}
            return false;
        }
        const playerActions = (gameState.allPlayerActions || []).filter(action => String(action && action.Ref_Player || '').trim() === String(playerData.Character_ID || '').trim());
        const sequenceActions = this.getInternalActions(gameState, sourcePatternId, specialModeId);
        if (!sequenceActions.length) {
            try { pushSystemNotice('스페셜 모드 내부 패턴 액션을 찾을 수 없습니다.', '#ffb8b8', 1.4); } catch (e) {}
            return false;
        }
        // 최종 대응에 필요한 버프 키도 Object 상호작용 데이터에서 찾는다.
        // HUD/렌더러가 특정 버프명을 코드에 직접 박지 않도록 Runtime에 전달한다.
        let requiredResponseBuffKey = '';
        for (const internalAction of sequenceActions) {
            const objectId = String(internalAction && (internalAction.Spawn_Object_ID || internalAction.Object_Spawn) || '').trim();
            if (!objectId) continue;
            const objectData = gameState.DB_BOSS_PATTERN_OBJECT && gameState.DB_BOSS_PATTERN_OBJECT[objectId];
            if (!objectData) continue;
            if (String(objectData.Object_Interact_Cond || '').trim().toUpperCase() !== 'PLAYER_HAS_BUFF') continue;
            requiredResponseBuffKey = String(objectData.Object_Interact_Cond_Value || '').trim();
            if (requiredResponseBuffKey) break;
        }
        const originalPlayer = gameState.player || {};
        if (options.isPatternLinked) {
            if (originalPlayer) {
                originalPlayer.z = 0; originalPlayer.vz = 0; originalPlayer.kbVx = 0; originalPlayer.kbVy = 0; originalPlayer.vx = 0; originalPlayer.vy = 0; originalPlayer.isGrounded = true;
                if (String(originalPlayer.state || '').toUpperCase() === 'HIT') originalPlayer.state = 'Idle';
            }
            if (boss) { boss.z = 0; boss.kbVx = 0; boss.kbVy = 0; if (String(boss.state || '').toUpperCase() === 'HIT') boss.state = 'IDLE'; }
        }
        const v = {
            fieldW: this.DEFAULT_VIRTUAL.fieldW,
            fieldH: this.DEFAULT_VIRTUAL.fieldH,
            spawnY: this.num(specialModeData.Object_Spawn_Y, this.DEFAULT_VIRTUAL.spawnY),
            warningTopY: this.num(specialModeData.Object_Spawn_Y, this.DEFAULT_VIRTUAL.spawnY) - 34,
            playerGroundY: this.num(specialModeData.Player_Ground_Y, this.DEFAULT_VIRTUAL.playerGroundY),
            floorY: this.num(specialModeData.Floor_Y, this.DEFAULT_VIRTUAL.floorY)
        };
        const startLane = this.laneIndex(specialModeData.Player_Start_Position_Value, 1);
        const introDuration = Math.max(0, this.num(specialModeData.Intro_Duration, options.isPatternLinked ? 1.25 : 0.65));
        const rt = {
            active: true,
            isTestMode: !!options.isTestMode,
            isPatternLinked: !!options.isPatternLinked,
            sourcePatternId,
            sourceActionId: String(options.sourceActionId || ''),
            phase: 'INTRO', timer: 0,
            introMaxTime: introDuration, introTime: introDuration,
            introType: String(specialModeData.Intro_Type || '').trim().toUpperCase(), introVisualPhase: '',
            endingTimer: 0, result: null, resultReason: '',
            boss: boss || null, virtual: v,
            specialModeData, specialModeId, playerData, playerActions, sequenceActions, requiredResponseBuffKey,
            sequenceIndex: 0, sequenceTimer: 0, sequenceActionStarted: false, sequenceConditionMet: false, sequenceComplete: false, unresolvedTimer: 0,
            usedLanes: [], activeSlashes: [], skillWaves: [], effects: [], slashSeq: 1, skillWaveSeq: 1, lanes: this.LANES,
            attackAction: null, guardAction: null, skillAction: null, moveAction: null, jumpAction: null,
            player: {
                lane:startLane, visualLane:startLane, moveTimer:0, moveFromLane:startLane, moveToLane:startLane,
                y:v.playerGroundY, vy:0, gravity:0, grounded:true, jumpFlashTimer:0,
                maxHp:Math.max(1,this.num(playerData.HP,10)), hp:Math.max(1,this.num(playerData.HP,10)), atk:Math.max(1,this.num(playerData.ATK,1)),
                attackCooldown:0, attackFlashTimer:0,
                isGuarding:false, guardTimer:0, guardMaxTimer:0, guardCooldownTimer:0, guardCooldownMax:0, guardContactTimer:0, guardFlashTimer:0,
                skillCooldown:0, skillCooldownMax:0, skillFlashTimer:0, skillCastTimer:0, skillCastMax:0, skillCastPending:false,
                buffs:{}, damageFlashTimer:0
            },
            inputPrev:{},
            snapshot:{
                playerX:this.num(originalPlayer.x,300), playerY:this.num(originalPlayer.y,150), playerZ:this.num(originalPlayer.z,0), playerState:originalPlayer.state||'Idle',
                bossX:this.num(boss&&boss.x,1000), bossY:this.num(boss&&boss.y,150), bossZ:this.num(boss&&boss.z,0), bossState:boss&&boss.state||'IDLE'
            },
            message:'', messageTimer:0, resultMessage:false
        };
        rt.moveAction = this.actionFor(rt, 'ACT_MOVE');
        rt.jumpAction = this.actionFor(rt, 'ACT_JUMP');
        rt.attackAction = this.actionFor(rt, 'ATK_MELEE');
        rt.guardAction = this.actionFor(rt, 'ACT_GUARD');
        rt.skillAction = this.actionFor(rt, 'ATK_PROJECTILE');
        rt.player.skillCooldownMax = Math.max(0, this.num(rt.skillAction && rt.skillAction.Cooltime, 0));
        gameState.specialMode = this.MODE;
        gameState.specialModeObjectDefenseRuntime = rt;
        this.pauseExistingCombat(gameState);
        gameState.specialModeObjectDefenseIntroRuntime = null;
        return true;
    },

    pauseExistingCombat(gameState) {
        if (!gameState) return;
        gameState.hitboxes = []; gameState.projectiles = []; gameState.auras = []; gameState.bossAttackObjects = [];
        if (Array.isArray(gameState.effects)) gameState.effects = gameState.effects.filter(e => e && (e.type === 'hitSpark' || e.type === 'guard'));
        const boss = this.getBoss(gameState);
        if (boss && boss.boss) {
            const rt = gameState.specialModeObjectDefenseRuntime || null;
            if (!(rt && rt.isPatternLinked)) { boss.boss.activePattern = null; boss.boss.currentActionIndex = -1; boss.boss.action = null; boss.boss.noPatternWaitTimer = Math.max(boss.boss.noPatternWaitTimer || 0, 0.5); }
            boss.boss.actionMove = null; boss.boss.previewDashPath = null; boss.boss.currentDashPath = null;
            boss.state = 'IDLE'; boss.timer = 0; boss.kbVx = 0; boss.kbVy = 0;
        }
        const p = gameState.player || null;
        if (p) { p.state='Idle'; p.prevState='Idle'; p.atkTimer=0; p.kbVx=0; p.kbVy=0; p.vz=0; p.z=0; p.isGrounded=true; p.guardTimer=0; p.isRunning=false; }
    },

    moveLane(rt, lane, moveTime) {
        const p = rt.player;
        if (!p || lane === p.lane) return;
        p.moveFromLane = Number.isFinite(parseFloat(p.visualLane)) ? parseFloat(p.visualLane) : p.lane;
        p.moveToLane = lane; p.lane = lane; p.moveTimer = moveTime;
    },

    updatePlayerJump(rt, dt) {
        const p = rt.player; if (!p || p.grounded) return;
        const v = rt.virtual || this.DEFAULT_VIRTUAL;
        p.vy += Math.max(0, this.num(p.gravity, 1200)) * dt;
        p.y += p.vy * dt;
        if (p.y >= v.playerGroundY) { p.y = v.playerGroundY; p.vy = 0; p.grounded = true; p.gravity = 0; }
    },

    handleInput(gameState, rt, dt) {
        const keys = gameState.keys || {}; const p = rt.player;
        const move = rt.moveAction; const jump = rt.jumpAction; const attack = rt.attackAction; const guard = rt.guardAction; const skill = rt.skillAction;
        const moveTime = Math.max(0.01, this.num(move && move.Action_Anim_Duration, 0.1));
        if (move && String(move.Move_Type || '').trim().toUpperCase() === 'THREE_LINE') {
            if (this.isKeyPressed(rt,'ArrowLeft',keys)) this.moveLane(rt,Math.max(0,p.lane-1),moveTime);
            if (this.isKeyPressed(rt,'ArrowRight',keys)) this.moveLane(rt,Math.min(2,p.lane+1),moveTime);
        }
        const jumpKey = this.getActionKey(jump);
        if (jump && jumpKey && this.isKeyPressed(rt,jumpKey,keys) && p.grounded) {
            p.vy = -Math.max(100,this.num(jump.Jump_Power,500)); p.gravity = Math.max(0,this.num(jump.Action_Gravity,1200)); p.grounded=false; p.jumpFlashTimer=0.18;
        }
        p.attackCooldown=Math.max(0,p.attackCooldown-dt); p.skillCooldown=Math.max(0,p.skillCooldown-dt); p.skillCastTimer=Math.max(0,(p.skillCastTimer||0)-dt);
        p.guardCooldownTimer=Math.max(0,(p.guardCooldownTimer||0)-dt);
        if (p.skillCastPending && p.skillCastTimer<=0) { p.skillCastPending=false; this.playerSkill(gameState,rt); }
        p.attackFlashTimer=Math.max(0,p.attackFlashTimer-dt); p.guardFlashTimer=Math.max(0,p.guardFlashTimer-dt); p.guardContactTimer=Math.max(0,p.guardContactTimer-dt); p.skillFlashTimer=Math.max(0,p.skillFlashTimer-dt); p.damageFlashTimer=Math.max(0,p.damageFlashTimer-dt); p.jumpFlashTimer=Math.max(0,p.jumpFlashTimer-dt);
        if (p.moveTimer>0) { p.moveTimer=Math.max(0,p.moveTimer-dt); const t=1-p.moveTimer/moveTime; const eased=t*t*(3-2*t); p.visualLane=p.moveFromLane+(p.moveToLane-p.moveFromLane)*eased; } else p.visualLane=p.lane;
        this.updatePlayerJump(rt,dt);

        const guardKey=this.getActionKey(guard); const guardHeld=!!(guardKey&&keys[guardKey]);
        if (p.isGuarding && !guardHeld) { p.isGuarding=false; p.guardTimer=0; }
        if (guard && guardHeld && !p.isGuarding && p.guardCooldownTimer<=0) {
            p.isGuarding=true; p.guardMaxTimer=Math.max(0.15,this.num(guard.Guard_Max_Hold_Time,1.5)); p.guardTimer=p.guardMaxTimer; p.guardCooldownMax=Math.max(0,this.num(guard.Guard_Recover_Time,1)); p.guardFlashTimer=0.08;
        }
        if (p.isGuarding && guardHeld) {
            p.guardTimer=Math.max(0,p.guardTimer-dt); p.guardFlashTimer=Math.max(p.guardFlashTimer,0.06);
            if (p.guardTimer<=0) { p.isGuarding=false; p.guardCooldownTimer=p.guardCooldownMax; }
        }

        const attackKey=this.getActionKey(attack); const attackHeld=!!(attackKey&&keys[attackKey]);
        if (attack && attackHeld && p.attackCooldown<=0) {
            this.playerAttack(gameState,rt); p.attackCooldown=Math.max(0.03,this.num(attack.Cooltime,0.15)); p.attackFlashTimer=0.14;
        }
        const skillKey=this.getActionKey(skill); const skillTriggered=skillKey && (String(skill&&skill.Input_Trigger_Type||'').trim().toUpperCase()==='KEY_HOLD' ? !!keys[skillKey] : this.isKeyPressed(rt,skillKey,keys));
        if (skill && skillTriggered && p.skillCooldown<=0 && !p.skillCastPending) {
            p.skillCooldown=Math.max(0,this.num(skill.Cooltime,8)); p.skillCooldownMax=Math.max(0.01,p.skillCooldown||this.num(skill.Cooltime,8));
            const cast=Math.max(0,this.num(skill.Action_Anim_Duration,0.1)); p.skillFlashTimer=0.18;
            if (cast>0) { p.skillCastPending=true; p.skillCastTimer=cast; p.skillCastMax=cast; } else this.playerSkill(gameState,rt);
        }
        rt.inputPrev={...keys};
    },

    lanesFromPositionGroup(group) {
        const raw=String(group||'').trim().toUpperCase();
        if (raw==='THREE_LINE_CENTER') return [1];
        if (raw==='THREE_LINE_CENTER_RIGHT') return [1,2];
        if (raw==='THREE_LINE_LEFT_CENTER') return [0,1];
        if (raw==='THREE_LINE_ALL') return [0,1,2];
        return [1];
    },

    pickLanesForAction(rt, action) {
        const placement=String(action&&action.Action_Position_Placement_Type||'FIXED').trim().toUpperCase();
        const base=this.lanesFromPositionGroup(action&&action.Action_Position_Group);
        if (placement==='FIXED') return base.slice();
        const allowRepeat=this.bool(action&&action.Allow_Repeat_Position);
        const used=new Set(Array.isArray(rt.usedLanes)?rt.usedLanes:[]);
        const record=(lanes)=>{ if (!allowRepeat) { const merged=new Set(rt.usedLanes||[]); lanes.forEach(v=>merged.add(v)); rt.usedLanes=[...merged]; } return lanes; };
        if (placement==='RANDOM_DOUBLE_ADJACENT') {
            const combos=[[0,1],[1,2]].filter(c=>c.every(v=>base.includes(v)));
            let candidates=allowRepeat?combos:combos.filter(c=>c.every(v=>!used.has(v)));
            if (!candidates.length) { rt.usedLanes=[]; candidates=combos; }
            return record((candidates[Math.floor(Math.random()*Math.max(1,candidates.length))]||combos[0]||[0,1]).slice());
        }
        if (placement==='RANDOM_SELECT_ONE') {
            let candidates=allowRepeat?base:base.filter(v=>!used.has(v));
            if (!candidates.length) { rt.usedLanes=[]; candidates=base; }
            return record([candidates[Math.floor(Math.random()*Math.max(1,candidates.length))] ?? 1]);
        }
        return base.slice();
    },

    spawnObjectFromAction(gameState, rt, action) {
        const objectId=String(action&&action.Spawn_Object_ID||action&&action.Object_Spawn||'').trim();
        const data=(gameState.DB_BOSS_PATTERN_OBJECT&&gameState.DB_BOSS_PATTERN_OBJECT[objectId])||null;
        if (!data) return false;
        const lanes=this.pickLanesForAction(rt,action); const type=String(data.Object_Type||'').trim().toUpperCase();
        const isFinal=type==='SPECIAL_MODE_FINAL_ATTACK'; const isGiant=type==='GIANT_SWORD_WAVE'; const isMulti=type==='MULTI_PART_ATTACK_OBJECT';
        const rate=Math.max(0.01,this.num(action.Action_Move_Speed_Rate,1));
        const objectMoveType=String(data.Object_Move_Type||'').trim().toUpperCase();
        const initSpeed=Math.max(10,this.num(data.Object_Move_Speed,150)*rate);
        const gravity=objectMoveType==='GRAVITY'?Math.max(0,this.num(data.Object_Gravity,0)*rate):0;
        const maxSpeed=Math.max(initSpeed,this.num(data.Object_Move_Max_Speed,initSpeed+gravity*2)*rate);
        const totalHp=Math.max(1,Math.floor(this.num(data.Object_HP,1)));
        const laneHp={};
        if (isMulti) {
            const count=Math.max(1,lanes.length); const base=Math.floor(totalHp/count); let rem=totalHp-base*count;
            lanes.forEach(l=>{ laneHp[l]=base+(rem>0?1:0); if(rem>0) rem--; });
        }
        const height=Math.max(40,this.num(data.Hitbox_Size_Y,isFinal?118:(isGiant?150:(lanes.length>=2?112:80))));
        rt.activeSlashes.push({
            uid:rt.slashSeq++, active:true, data, action, lanes, state:'WARNING', y:(rt.virtual||this.DEFAULT_VIRTUAL).spawnY,
            height, warningTimer:Math.max(0.05,this.num(data.Warning_Duration,1)), warningMax:Math.max(0.05,this.num(data.Warning_Duration,1)), warningRenderType:data.Warning_Render_Type||'',
            vy:initSpeed, gravity, maxFallSpeed:maxSpeed, hp:totalHp, maxHp:totalHp, laneHp, isMulti, isGiant, isFinal,
            hitFlashTimer:0, breakFlashTimer:0, guardCooldown:0, guardFlashTimer:0, stackContactTimer:0, runtimeBoss:rt.boss||null
        });
        return true;
    },

    advanceSequence(rt) {
        rt.sequenceIndex += 1; rt.sequenceTimer=0; rt.sequenceActionStarted=false; rt.sequenceConditionMet=false;
        if (rt.sequenceIndex>=rt.sequenceActions.length) { rt.sequenceComplete=true; }
    },

    updateSequence(gameState, rt, dt) {
        if (rt.sequenceComplete) {
            if (!(rt.activeSlashes||[]).some(o=>o&&o.active)) {
                rt.unresolvedTimer += dt;
                if (rt.unresolvedTimer>=0.5 && !rt.result) this.finish(gameState,'FAIL','스페셜 모드 결과 미확정');
            } else rt.unresolvedTimer=0;
            return;
        }
        let loop=0;
        while (loop++<12 && !rt.sequenceComplete) {
            const action=rt.sequenceActions[rt.sequenceIndex]; if(!action){this.advanceSequence(rt);continue;}
            const type=String(action.Action_Type||'').trim().toUpperCase(); const cond=String(action.Action_Condition_Type||'NONE').trim().toUpperCase();
            if (type==='WAIT') {
                if (cond==='ACTIVE_OBJECT_CLEAR' && !rt.sequenceConditionMet) {
                    if ((rt.activeSlashes||[]).some(o=>o&&o.active)) return;
                    rt.sequenceConditionMet=true; rt.usedLanes=[]; rt.sequenceTimer=Math.max(0,this.num(action.Action_Anim_Duration,0));
                } else if (!rt.sequenceActionStarted && cond!=='ACTIVE_OBJECT_CLEAR') {
                    rt.sequenceActionStarted=true; rt.sequenceTimer=Math.max(0,this.num(action.Action_Anim_Duration,0));
                }
                rt.sequenceTimer=Math.max(0,rt.sequenceTimer-dt);
                if (rt.sequenceTimer>0) return;
                this.advanceSequence(rt); continue;
            }
            if (type==='CAST_SPAWN_OBJECT') {
                if (!rt.sequenceActionStarted) { rt.sequenceActionStarted=true; this.spawnObjectFromAction(gameState,rt,action); rt.sequenceTimer=Math.max(0,this.num(action.Action_Anim_Duration,0)); }
                rt.sequenceTimer=Math.max(0,rt.sequenceTimer-dt);
                if (rt.sequenceTimer>0) return;
                this.advanceSequence(rt); continue;
            }
            this.advanceSequence(rt);
        }
    },

    getSlashCenterInfo(slash) {
        const lanes=slash&&slash.lanes&&slash.lanes.length?slash.lanes:[1];
        return { lane:lanes.reduce((s,v)=>s+v,0)/Math.max(1,lanes.length), y:(slash&&slash.y||0)+(slash&&slash.height||0)*0.58, lanes };
    },

    updateEffects(rt,dt) {
        if (!rt) return;
        rt.effects=(rt.effects||[]).filter(e=>{ if(!e)return false; e.timer=Math.max(0,(e.timer||0)-dt); return e.timer>0; });
    },

    pushEffect(rt,type,x,y,options={}) {
        if(!rt)return; if(!Array.isArray(rt.effects))rt.effects=[];
        rt.effects.push({type,effectType:options.effectType||'',x:Number.isFinite(parseFloat(x))?parseFloat(x):0,y:Number.isFinite(parseFloat(y))?parseFloat(y):0,lane:options.lane,lanes:options.lanes?options.lanes.slice():null,size:options.size||1,color:options.color||'',timer:options.timer||0.28,maxTimer:options.timer||0.28,isGiant:!!options.isGiant});
    },

    playerRangeInfo(rt,kind) {
        const p=rt.player; const action=kind==='attack'?rt.attackAction:null;
        const laneRange=kind==='attack'?Math.max(1,Math.floor(this.num(action&&action.ATK_Hitbox_Size_X,1))):1;
        const yRange=kind==='attack'?Math.max(20,this.num(action&&action.ATK_Hitbox_Size_Y,150)):Math.max(80,this.num(rt.playerData&&rt.playerData.Body_Size_Z,120)*1.25);
        const y=p&&p.y!==undefined?p.y:(rt.virtual||this.DEFAULT_VIRTUAL).playerGroundY;
        return {laneRange,yRange,bottomY:y+22,topY:y-yRange};
    },

    laneInRange(playerLane,targetLane,tileRange){const radius=Math.max(0,Math.floor((Math.max(1,tileRange)-1)/2));return Math.abs((parseInt(targetLane)||0)-(parseInt(playerLane)||0))<=radius;},
    isSlashInPlayerRange(rt,slash,lane,kind){if(!slash||!slash.active||slash.state!=='FALLING')return false;const range=this.playerRangeInfo(rt,kind);if(!slash.lanes||!slash.lanes.some(l=>this.laneInRange(lane,l,range.laneRange)))return false;const top=slash.y||0,bottom=top+(slash.height||0);return bottom>=range.topY&&top<=range.bottomY;},
    findTargetSlash(rt,lane,kind='attack'){return (rt.activeSlashes||[]).filter(s=>s&&s.active&&s.state==='FALLING'&&this.isSlashInPlayerRange(rt,s,lane,kind)).sort((a,b)=>((b.y||0)+(b.height||0))-((a.y||0)+(a.height||0)))[0]||null;},

    matchesFinalResponseCondition(rt, slash) {
        const cond=String(slash&&slash.data&&slash.data.Object_Interact_Cond||'').trim().toUpperCase();
        if (!cond || cond==='NONE') return true;
        if (cond==='PLAYER_HAS_BUFF') return this.hasPlayerBuff(rt,slash.data.Object_Interact_Cond_Value);
        return false;
    },

    canResolveSpecialModeResult(slash) {
        return String(slash&&slash.data&&slash.data.Object_Interact_Result_Type||'').trim().toUpperCase()==='SPECIAL_MODE_RESULT';
    },

    playerAttack(gameState,rt) {
        const target=this.findTargetSlash(rt,rt.player.lane,'attack'); if(!target)return false;
        this.pushEffect(rt,'attackArc',rt.player.lane,rt.player.y||this.DEFAULT_VIRTUAL.playerGroundY,{timer:0.16,size:1});
        if(target.isFinal){if(this.canResolveSpecialModeResult(target)&&this.matchesFinalResponseCondition(rt,target)){const buffKey=String(target.data&&target.data.Object_Interact_Cond_Value||'').trim();if(buffKey)this.consumePlayerBuff(rt,buffKey);this.finish(gameState,'MODE_ATK_SUCCESS','최종 공격 받아치기 성공');return true;}return false;}
        this.damageSlash(gameState,rt,target,rt.player.lane,Math.max(1,this.num(rt.player.atk,1)),'ATTACK'); return true;
    },

    playerSkill(gameState,rt) {
        if(!rt||!rt.player||!rt.skillAction)return false; if(!Array.isArray(rt.skillWaves))rt.skillWaves=[];
        const p=rt.player,a=rt.skillAction; const range=Math.max(1,Math.floor(this.num(a.ATK_Projectile_Hitbox_Size_X,3))); const height=Math.max(80,this.num(a.ATK_Projectile_Hitbox_Size_Y,150)); const speed=Math.max(100,this.num(a.ATK_Projectile_Speed,1380));
        let lanes=[]; if(range>=3)lanes=[0,1,2]; else if(range===2)lanes=p.lane===0?[0,1]:[p.lane-1,p.lane]; else lanes=[p.lane];
        rt.skillWaves.push({uid:rt.skillWaveSeq++,active:true,lanes,y:(p.y||rt.virtual.playerGroundY)-32,prevY:(p.y||rt.virtual.playerGroundY)-32,vy:-speed,height,life:Math.max(0.1,this.num(a.ATK_Projectile_Duration,0.62)),maxLife:Math.max(0.1,this.num(a.ATK_Projectile_Duration,0.62)),hitMap:{},renderType:a.ATK_Projectile_Render_Type||''});
        return true;
    },

    updateSkillWaves(gameState,rt,dt) {
        if(!rt||!Array.isArray(rt.skillWaves))return;
        for(const wave of rt.skillWaves){if(!wave||!wave.active)continue;wave.life-=dt;wave.prevY=wave.y;wave.y+=(wave.vy||0)*dt;const waveTop=Math.min(wave.y,wave.prevY)-(wave.height||120),waveBottom=Math.max(wave.y,wave.prevY)+24;
            for(const slash of(rt.activeSlashes||[])){if(!slash||!slash.active||slash.isFinal||slash.state==='WARNING')continue;if(wave.hitMap&&wave.hitMap[slash.uid])continue;if(!(slash.lanes||[1]).some(l=>(wave.lanes||[]).includes(l)))continue;const st=slash.y||0,sb=st+(slash.height||0);if(sb<waveTop||st>waveBottom)continue;if(wave.hitMap)wave.hitMap[slash.uid]=true;
                const interact=String(slash.data.Object_Interact_Type||'').trim().toUpperCase(); const required=String(slash.data.Object_Interact_Value||'').trim(); const skillId=String(rt.skillAction.Action_ID||'').trim(); if(interact!=='PLAYER_ACTION_HIT'||(required&&required!==skillId))continue;
                const info=this.getSlashCenterInfo(slash);this.pushEffect(rt,'skillWaveHit',info.lane,info.y,{effectType:slash.data.Hit_Effect_Type,lanes:info.lanes,size:slash.isGiant?1.25:((slash.lanes||[]).length>=2?1.1:1),timer:0.24,isGiant:slash.isGiant});
                const effect=String(slash.data.Object_Interact_Effect||'').trim().toUpperCase(); if(effect==='OBJECT_REMOVE')this.destroySlash(gameState,rt,slash,'SKILL');else if(effect==='OBJECT_DAMAGE'){const dmg=Math.max(0,this.num(slash.data.Object_Interact_Effect_Value,1));if(dmg>0)this.damageSlash(gameState,rt,slash,rt.player.lane,dmg,'SKILL');}
            }
            if(wave.life<=0||wave.y+(wave.height||120)<(rt.virtual||this.DEFAULT_VIRTUAL).warningTopY)wave.active=false;
        }
        rt.skillWaves=rt.skillWaves.filter(w=>w&&w.active);
    },

    tryGuardSlash(rt,slash,gameState) {
        const p=rt.player;if(!p||!p.isGuarding||!slash||!slash.active||slash.state!=='FALLING')return false;
        const guardDirection=String(rt.guardAction&&rt.guardAction.Guard_Direction||'').trim().toUpperCase();
        if(guardDirection&&guardDirection!=='CASTER_UP')return false;
        if(!this.isSlashInPlayerRange(rt,slash,p.lane,'guard'))return false;
        const guardFlag=slash.data&&slash.data.ATK_Can_Guard;
        if(guardFlag!==null&&guardFlag!==undefined&&String(guardFlag).trim()!==''&&!this.bool(guardFlag))return false;
        if(slash.isFinal){if(this.canResolveSpecialModeResult(slash)&&this.matchesFinalResponseCondition(rt,slash)){const buffKey=String(slash.data&&slash.data.Object_Interact_Cond_Value||'').trim();if(buffKey)this.consumePlayerBuff(rt,buffKey);this.finish(gameState,'MODE_GUARD_SUCCESS','최종 공격 가드 성공');return true;}return false;}
        if((slash.guardCooldown||0)>0)return true;
        const baseSpeed=Math.max(0,this.num(rt.guardAction&&rt.guardAction.Guard_Push_Speed,200));const baseDist=Math.max(0,this.num(rt.guardAction&&rt.guardAction.Guard_Push_Distance,70));const speedRate=Math.max(0,this.num(slash.data.Guard_Push_Speed_Rate,1));const distRate=Math.max(0,this.num(slash.data.Guard_Push_Distance_Rate,1));
        slash.vy=-baseSpeed*speedRate;slash.y=Math.max((rt.virtual||this.DEFAULT_VIRTUAL).spawnY,(slash.y||0)-baseDist*distRate);slash.guardCooldown=0.16;slash.guardFlashTimer=0.22;p.guardContactTimer=0.16;p.guardFlashTimer=0.20;
        const info=this.getSlashCenterInfo(slash);this.pushEffect(rt,'guardRebound',info.lane,(slash.y||0)+(slash.height||0),{effectType:slash.data.Hit_Effect_Type,lanes:info.lanes,size:slash.isGiant?1.45:((slash.lanes||[]).length>=2?1.18:1),timer:0.26,isGiant:slash.isGiant});return true;
    },

    resolveSlashStack(rt) {
        const falling=(rt.activeSlashes||[]).filter(s=>s&&s.active&&s.state==='FALLING').sort((a,b)=>(b.y||0)-(a.y||0));const stackTopByLane={};
        for(const slash of falling){const lanes=slash.lanes&&slash.lanes.length?slash.lanes:[1];let desiredBottom=null;for(const lane of lanes){const top=stackTopByLane[lane];if(Number.isFinite(top))desiredBottom=desiredBottom===null?top:Math.min(desiredBottom,top);}if(desiredBottom!==null){const currentBottom=(slash.y||0)+(slash.height||0);if(currentBottom>desiredBottom-5){slash.y=desiredBottom-(slash.height||0);slash.vy=Math.min(slash.vy||0,18);slash.stackContactTimer=0.12;}}for(const lane of lanes)stackTopByLane[lane]=Math.min(stackTopByLane[lane]??Infinity,slash.y||0);}
    },

    updateSlashes(gameState,rt,dt) {
        const v=rt.virtual||this.DEFAULT_VIRTUAL,p=rt.player;
        for(const slash of rt.activeSlashes){if(!slash||!slash.active)continue;slash.hitFlashTimer=Math.max(0,(slash.hitFlashTimer||0)-dt);slash.breakFlashTimer=Math.max(0,(slash.breakFlashTimer||0)-dt);slash.guardCooldown=Math.max(0,(slash.guardCooldown||0)-dt);slash.guardFlashTimer=Math.max(0,(slash.guardFlashTimer||0)-dt);slash.stackContactTimer=Math.max(0,(slash.stackContactTimer||0)-dt);if(slash.state==='WARNING'){slash.warningTimer-=dt;if(slash.warningTimer<=0)slash.state='FALLING';continue;}slash.vy=Math.min(Math.max(10,slash.maxFallSpeed||999),(slash.vy||0)+(slash.gravity||0)*dt);slash.y+=(slash.vy||0)*dt;if((slash.y||0)<v.spawnY){slash.y=v.spawnY;slash.vy=Math.max(0,slash.vy||0);}this.tryGuardSlash(rt,slash,gameState);if(!this.isActive(gameState))return;}
        this.resolveSlashStack(rt);
        for(const slash of rt.activeSlashes){if(!slash||!slash.active||slash.state!=='FALLING')continue;const bottom=(slash.y||0)+(slash.height||0);if(bottom>=v.floorY)this.resolveSlashImpact(gameState,rt,slash);if(!this.isActive(gameState))return;}
        rt.activeSlashes=rt.activeSlashes.filter(s=>s&&s.active);
    },

    resolveSlashImpact(gameState,rt,slash) {
        if(!slash||!slash.active)return;if(slash.isFinal){this.finish(gameState,'FAIL',this.matchesFinalResponseCondition(rt,slash)?'최종 공격 대응 실패':'필요 버프 없음');return;}
        const rawDamage=Math.max(1,this.num(slash.data.Object_Fixed_Damage,1));const damage=(typeof PlayerManager!=='undefined'&&PlayerManager.applyPresentationDamageRate)?PlayerManager.applyPresentationDamageRate(gameState,rawDamage):rawDamage;const inv=!!(typeof PlayerManager!=='undefined'&&PlayerManager.isPracticeModeHpInvincible&&PlayerManager.isPracticeModeHpInvincible(gameState));if(!inv)rt.player.hp=Math.max(0,rt.player.hp-damage);rt.player.damageFlashTimer=inv?0:0.28;const info=this.getSlashCenterInfo(slash);this.pushEffect(rt,'floorImpact',info.lane,(rt.virtual||this.DEFAULT_VIRTUAL).floorY,{effectType:slash.data.Break_Effect_Type,lanes:info.lanes,size:slash.isGiant?1.55:((slash.lanes||[]).length>=2?1.2:1),timer:0.34,isGiant:slash.isGiant});slash.active=false;if(rt.player.hp<=0)this.finish(gameState,'FAIL','차원 방어전 HP 0');
    },

    damageSlash(gameState,rt,slash,lane,amount,source) {
        if(!slash||!slash.active||slash.isFinal)return;const dmg=Math.max(0,amount||0);slash.hitFlashTimer=0.12;const info=this.getSlashCenterInfo(slash);this.pushEffect(rt,'slashHit',info.lane,info.y,{effectType:slash.data.Hit_Effect_Type,lanes:info.lanes,size:slash.isGiant?1.35:((slash.lanes||[]).length>=2?1.12:1),timer:0.24,isGiant:slash.isGiant});
        if(slash.isMulti){const targets=source==='SKILL'?(slash.lanes||[]):[lane];for(const l of targets){if(slash.laneHp&&slash.laneHp[l]!==undefined)slash.laneHp[l]=Math.max(0,(parseFloat(slash.laneHp[l])||0)-dmg);}const remain=Object.values(slash.laneHp||{}).reduce((s,v)=>s+Math.max(0,parseFloat(v)||0),0);slash.hp=remain;if(remain<=0)this.destroySlash(gameState,rt,slash,source);return;}
        slash.hp=Math.max(0,(parseFloat(slash.hp)||0)-dmg);if(slash.hp<=0)this.destroySlash(gameState,rt,slash,source);
    },

    destroySlash(gameState,rt,slash,source) {
        if(!slash||!slash.active)return;const info=this.getSlashCenterInfo(slash);this.pushEffect(rt,'slashBreak',info.lane,info.y,{effectType:slash.data.Break_Effect_Type,lanes:info.lanes,size:slash.isGiant?1.8:((slash.lanes||[]).length>=2?1.3:1),timer:slash.isGiant?0.55:0.34,isGiant:slash.isGiant});slash.active=false;slash.breakFlashTimer=0.2;
        const resultType=String(slash.data.Object_Destroy_Result_Type||'').trim().toUpperCase();if(resultType==='PLAYER_BUFF'){this.grantPlayerBuff(rt,slash.data.Object_Destroy_Result_Value);rt.message='';rt.messageTimer=0;}
    },

    update(gameState,dt) {
        const rt=gameState&&gameState.specialModeObjectDefenseRuntime;if(!rt||!rt.active)return;if(gameState)gameState.screenHitFlash=null;rt.timer+=dt;rt.messageTimer=Math.max(0,(rt.messageTimer||0)-dt);
        if(rt.phase==='INTRO'){
            rt.introTime-=dt;const max=Math.max(0.01,rt.introMaxTime||0.65),ratio=Math.max(0,Math.min(1,1-rt.introTime/max)),p=rt.player,v=rt.virtual||this.DEFAULT_VIRTUAL;p.isGuarding=false;p.attackCooldown=0;p.attackFlashTimer=0;p.guardFlashTimer=0;p.guardContactTimer=0;p.skillFlashTimer=0;
            if(rt.isPatternLinked&&String(rt.introType||'').toUpperCase()==='FALL_LAND_STAND'){const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};if(ratio<0.62){const r=ease(ratio/0.62);p.y=(v.spawnY-205)+(v.playerGroundY-(v.spawnY-205))*r;p.vy=0;p.grounded=false;p.introPose='FIELD_FALL';rt.introVisualPhase='SIMPLE_FALL';}else if(ratio<0.82){p.y=v.playerGroundY;p.vy=0;p.grounded=true;p.introPose='DOWN';p.damageFlashTimer=Math.max(p.damageFlashTimer||0,0.08);rt.introVisualPhase='LAND_DOWN';if(!rt.introLandEffectFired){rt.introLandEffectFired=true;this.pushEffect(rt,'floorImpact',p.lane,v.floorY,{timer:0.28,size:1.08});}}else{p.y=v.playerGroundY;p.vy=0;p.grounded=true;p.introPose='STAND_UP';rt.introVisualPhase='STAND_UP';}}
            this.updateEffects(rt,dt);if(rt.introTime<=0){p.y=v.playerGroundY;p.vy=0;p.grounded=true;p.introPose=null;rt.phase='ACTIVE';rt.sequenceIndex=0;rt.sequenceTimer=0;rt.sequenceActionStarted=false;rt.sequenceConditionMet=false;}rt.inputPrev={...(gameState.keys||{})};return;
        }
        if(rt.phase==='ENDING'){rt.endingTimer-=dt;if(rt.endingTimer<=0)this.completeEnd(gameState);return;}
        this.handleInput(gameState,rt,dt);this.updateSkillWaves(gameState,rt,dt);this.updateSlashes(gameState,rt,dt);this.updateEffects(rt,dt);if(!this.isActive(gameState))return;this.updateSequence(gameState,rt,dt);
    },

    finish(gameState,result,reason) {
        const rt=gameState&&gameState.specialModeObjectDefenseRuntime;if(!rt||!rt.active||rt.phase==='ENDING')return;rt.phase='ENDING';rt.result=result;rt.resultReason=reason||'';const sm=rt.specialModeData||{};const key=String(result||'').toUpperCase()==='MODE_ATK_SUCCESS'?'Result_End_Delay_ATK':(String(result||'').toUpperCase()==='MODE_GUARD_SUCCESS'?'Result_End_Delay_GUARD':'Result_End_Delay_FAIL');rt.endingTimer=Math.max(0.1,this.num(sm[key],result==='MODE_ATK_SUCCESS'?2.15:(result==='MODE_GUARD_SUCCESS'?1.75:1.45)));rt.outroMaxTime=rt.endingTimer;rt.outroFlashFired=false;rt.activeSlashes=[];rt.skillWaves=[];rt.message='';rt.messageTimer=1;rt.resultMessage=true;
    },

    forceEnd(gameState,reason='CANCEL') {
        const rt=gameState&&gameState.specialModeObjectDefenseRuntime;if(!rt)return false;rt.result=reason;rt.resultReason='테스트 강제 종료';this.restoreSnapshots(gameState,rt);gameState.specialMode=null;gameState.specialModeObjectDefenseRuntime=null;gameState.specialModeObjectDefenseIntroRuntime=null;gameState.specialModeObjectDefenseFailDamageRuntime=null;const boss=rt.boss||this.getBoss(gameState);if(boss&&boss.boss){boss.boss.specialModeStarted=false;boss.boss.specialModeResult=null;}return true;
    },

    completeEnd(gameState) {
        const rt=gameState&&gameState.specialModeObjectDefenseRuntime;if(!rt)return;const result=String(rt.result||'').toUpperCase();const boss=rt.boss||this.getBoss(gameState);const preserve=!!(rt.isPatternLinked&&boss&&boss.boss);this.restoreSnapshots(gameState,rt,{preservePatternFlow:preserve});gameState.specialMode=null;gameState.specialModeObjectDefenseRuntime=null;gameState.specialModeObjectDefenseIntroRuntime=null;
        if(preserve){boss.boss.specialModeResult=result;boss.boss.specialModeStarted=false;return;}
        const action=this.getResultBossAction(gameState,result,rt.sourcePatternId);if((result==='MODE_ATK_SUCCESS'||result==='MODE_GUARD_SUCCESS')&&action)this.applyBossGroggy(gameState,action.Groggy_Time,result==='MODE_ATK_SUCCESS',action.Groggy_Hit_DMG_Rate,action.Groggy_Pose_Type);else if(result==='FAIL'&&action)this.startFailDamageFromBossAction(gameState,boss,action);
    },

    getResultBossAction(gameState,result,patternId='') {
        const expected=String(result||'').trim().toUpperCase(),expectedPattern=String(patternId||'').trim(),db=gameState&&gameState.DB_BOSS_PATTERN_ACTION?gameState.DB_BOSS_PATTERN_ACTION:{};for(const key of Object.keys(db||{})){const a=db[key]||{};if(String(a.Action_Condition_Type||'').trim().toUpperCase()!=='SPECIAL_MODE_RESULT')continue;if(expectedPattern&&String(a.Pattern_ID||'').trim()!==expectedPattern)continue;if(String(a.Action_Condition_Value||'').trim().toUpperCase()===expected)return a;}return null;
    },

    restoreSnapshots(gameState,rt,options={}) {
        const preserve=!!options.preservePatternFlow,p=gameState&&gameState.player;if(p&&rt&&rt.snapshot){p.x=rt.snapshot.playerX;p.y=rt.snapshot.playerY;p.z=0;p.vz=0;p.state=rt.snapshot.playerState==='Die'?'Idle':(rt.snapshot.playerState||'Idle');p.prevState='Idle';p.isGrounded=true;p.kbVx=0;p.kbVy=0;p.atkTimer=0;p.guardTimer=0;}
        const boss=rt&&rt.boss?rt.boss:this.getBoss(gameState);if(boss&&rt&&rt.snapshot){boss.x=rt.snapshot.bossX;boss.y=rt.snapshot.bossY;boss.z=0;boss.kbVx=0;boss.kbVy=0;boss.vz=0;boss.state='IDLE';boss.timer=0;boss.active=true;if(boss.boss){boss.boss.specialModeStarted=false;if(!preserve){boss.boss.activePattern=null;boss.boss.action=null;boss.boss.currentActionIndex=-1;boss.boss.noPatternWaitTimer=Math.max(boss.boss.noPatternWaitTimer||0,0.6);}}}
    },

    applyBossGroggy(gameState,groggyTime,perfect,groggyDmgRate=1.5,groggyPoseType='POSE_KASIYAS_P2_GROGGY') {
        const boss=this.getBoss(gameState);if(!boss||!boss.boss)return false;const base=Math.max(0.2,this.num(groggyTime,perfect?15:10));const time=(typeof GameModeSystem!=='undefined'&&GameModeSystem.adjustGroggyTime)?GameModeSystem.adjustGroggyTime(gameState,base):base;boss.state='GROGGY';boss.timer=0;boss.hasFired=false;boss.kbVx=0;boss.kbVy=0;boss.boss.activePattern=null;boss.boss.action=null;boss.boss.currentActionIndex=-1;boss.boss.groggyTimer=time;boss.boss.groggyMaxTime=time;boss.boss.groggyPoseType=String(groggyPoseType||'POSE_KASIYAS_P2_GROGGY').trim()||'POSE_KASIYAS_P2_GROGGY';boss.boss.groggyHitDmgRate=Math.max(0,this.num(groggyDmgRate,1.2));boss.boss.noPatternWaitTimer=Math.max(boss.boss.noPatternWaitTimer||0,time);return true;
    },

    startFailDamageFromBossAction(gameState,boss,action) {
        const p=gameState&&gameState.player;if(!gameState||!p||p.hp<=0||!action)return false;boss=boss||this.getBoss(gameState);const bossData=boss&&boss.d?boss.d:{};const baseAtk=Math.max(1,this.num(bossData.atk!==undefined?bossData.atk:bossData.ATK,2500));const rate=Math.max(0,this.num(action.ATK_Damage_Rate,1.4));const hitCount=Math.max(1,Math.floor(this.num(action.ATK_Hit_Count,3)));const cycle=Math.max(0.03,this.num(action.ATK_Cycle,0.3));const hitStart=Math.max(0,this.num(action.Hitbox_Start_Time,cycle));const hitEndData=parseFloat(action.Hitbox_End_Time);const hitEnd=!isNaN(hitEndData)&&hitEndData>=hitStart?hitEndData:hitStart+cycle*Math.max(0,hitCount-1);const bossLevel=Math.max(1,this.num(bossData.level!==undefined?bossData.level:bossData.Level,1));
        gameState.specialModeObjectDefenseFailDamageRuntime={active:true,elapsed:0,nextHitTime:hitStart,hitIndex:0,hitCount,cycle,hitStart,hitEnd,baseAtk,damageRate:rate,rawDamage:baseAtk*rate,bossLevel,srcX:boss?boss.x:p.x,srcY:boss?boss.y:p.y,sourcePatternId:String(action.Pattern_ID||''),sourceActionId:String(action.Action_ID||''),attackType:String(action.Action_Attack_Type||'ATK_SPECIAL'),vfxType:String(action.VFX_Type||'EFT_PLAYER_HIT'),canGuard:this.bool(action.ATK_Can_Guard),makeHitAction:this.bool(action.ATK_Make_Hit_Action),makeKnockback:this.bool(action.ATK_Make_Knockback),knockbackCanGuard:this.bool(action.Knockback_Can_Guard),knockbackDistance:Math.max(0,this.num(action.Knockback_Distance,0))};return true;
    },

    updateFailDamageSequence(gameState,dt) {
        const seq=gameState&&gameState.specialModeObjectDefenseFailDamageRuntime;if(!seq||!seq.active)return false;const p=gameState&&gameState.player;if(!p||p.hp<=0||p.state==='Die'){gameState.specialModeObjectDefenseFailDamageRuntime=null;return false;}seq.elapsed+=Math.max(0,this.num(dt,0));while(seq.hitIndex<seq.hitCount&&seq.elapsed+1e-9>=seq.nextHitTime){const raw=Math.max(0,this.num(seq.rawDamage,seq.baseAtk*seq.damageRate));const scaled=typeof calcScaledDamage==='function'?calcScaledDamage(seq.bossLevel,p.level||1,raw):raw;if(typeof PlayerManager!=='undefined'&&PlayerManager.takeDamage)PlayerManager.takeDamage(gameState,scaled,seq.srcX,seq.srcY,null,0,0,{canGuard:!!seq.canGuard,guardResult:'',attackType:seq.attackType||'ATK_SPECIAL',sourcePatternId:seq.sourcePatternId,sourceActionId:seq.sourceActionId,makeKnockback:!!seq.makeKnockback,knockbackCanGuard:!!seq.knockbackCanGuard,knockbackDistance:Math.max(0,this.num(seq.knockbackDistance,0)),makeHitAction:!!seq.makeHitAction});else p.hp=Math.max(0,(parseFloat(p.hp)||0)-scaled);if(gameState.screenHitFlash!==undefined)gameState.screenHitFlash={life:0.16,maxLife:0.16,strength:0.72,mode:'red'};seq.hitIndex+=1;seq.nextHitTime=seq.hitStart+seq.cycle*seq.hitIndex;if(p.hp<=0||p.state==='Die')break;}if(seq.hitIndex>=seq.hitCount||p.hp<=0||p.state==='Die'){seq.active=false;gameState.specialModeObjectDefenseFailDamageRuntime=null;}return true;
    }
};

window.SpecialModeObjectDefenseSystem = SpecialModeObjectDefenseSystem;
