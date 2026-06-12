// [카시야스 보스전] 플레이어 엔티티/물리/상태 관리 (player_entity.js)
// ==========================================

const PlayerManager = {
    init: function(playerData, actionData, gameState) {
        let pd = (playerData && playerData.length > 0) ? playerData[0] : {}; 
        
        gameState.player = {
            active: true, x: gameState.WORLD_WIDTH/2 || 1000, y: gameState.WORLD_DEPTH/2 || 150, z: 0, vz: 0, isGrounded: true, 
            name: pd.Character_Name || '용사', level: parseInt(pd.Level) || 1, exp: 0, baseNextExp: parseInt(pd.Base_Next_EXP) || 100, 
            lvlUpGainHp: parseFloat(pd.Level_Up_Gain_HP) || 20, lvlUpGainAtk: parseFloat(pd.Level_Up_Gain_ATK) || 2,
            hp: parseFloat(pd.HP)||500, maxHp: parseFloat(pd.HP)||500, atk: parseFloat(pd.ATK)||50, def: parseFloat(pd.DEF)||5, 
            speed: parseFloat(pd.Move_Speed)||300, jumpPower: parseFloat(pd.Jump_Power) || 600,
            bodyX: parseFloat(pd.Body_Size_X) || 50, bodyY: parseFloat(pd.Body_Size_Y) || 30, bodyZ: parseFloat(pd.Body_Size_Z) || 100, scale: parseFloat(pd.Model_Scale) || 1, renderType: pd.Model_Render_Type || null,
            renderColor: pd.Model_Render_Color || null,
            renderColorR: pd.Model_Color_R !== null && pd.Model_Color_R !== undefined && pd.Model_Color_R !== '' ? parseFloat(pd.Model_Color_R) : null,
            renderColorG: pd.Model_Color_G !== null && pd.Model_Color_G !== undefined && pd.Model_Color_G !== '' ? parseFloat(pd.Model_Color_G) : null,
            renderColorB: pd.Model_Color_B !== null && pd.Model_Color_B !== undefined && pd.Model_Color_B !== '' ? parseFloat(pd.Model_Color_B) : null,
            meleeWeaponRenderType: pd.Melee_Weapon_Render_Type || null,
            rangeWeaponRenderType: pd.Range_Weapon_Render_Type || null,
            stance: 'Mode_Melee', faceDir: 1, state: 'Idle',
            hitDur: parseFloat(pd.Hit_Anim_Duration) || 0.2,
            kbDist: parseFloat(pd.Hit_Knockback_Distance) || 5, invinTime: 0, kbVx: 0, kbVy: 0,
            invincibleTimer: 0, atkTimer: 0, stanceSwapTimer: 0, maxStanceSwap: 0, rapidAtkCount: 0, rapidAtkAllowTimer: 0, maxRapidAllow: 0, rapidAtkCooldownTimer: 0, maxRapidAtkCd: 0.5, 
            dashCooldownTimer: 0, maxDashCd: 1.0, dashTimer: 0, dashSpeedX: 0, dashSpeedY: 0, ghostTimer: 0, bubbleCooldown: 0,
            isRunning: false, runDirection: null, runSpeedRate: 1.5, movePrevKeys: { LEFT: false, RIGHT: false, UP: false, DOWN: false }, lastMoveTapDir: null, lastMoveTapTimer: 0,
            guardTimer: 0, maxGuardTimer: 0, guardCooldownTimer: 0, maxGuardCooldown: 0, guardSuccessTimer: 0, guardDirection: 'CASTER_FRONT', guardDefenceType: 'SUPER_ARMOR', guardForcedRecover: false,
            defaultGuardReduceRate: Math.max(0, parseFloat(pd.Default_Guard_Reduce_Rate) || 1),
            maxFightingSpirit: Math.max(1, parseFloat(pd.Max_Fighting_Spirit_Gauge) || 100), fightingSpirit: 0,
            atkGetFightingSpirit: Math.max(0, parseFloat(pd.ATK_Get_Fighting_Spirit) || 0),
            atkGetFightingSpiritCooldown: Math.max(0, parseFloat(pd.ATK_Get_Fighting_Spirit_Cooltime) || 0), fightingSpiritAtkGainCooldownTimer: 0,
            hitLoseFightingSpirit: Math.max(0, parseFloat(pd.Hit_Lose_Fighting_Spirit) || 0),
            hitLoseFightingSpiritCooldown: Math.max(0, parseFloat(pd.Hit_Lose_Fighting_Spirit_Cooltime) || 0), fightingSpiritHitLoseCooldownTimer: 0,
            fightingSpiritDmgBuffRate: Math.max(0, parseFloat(pd.Fighting_Spirit_DMG_Buff_Rate) || 0),
            fightingSpiritMoveSpeedBuffRate: Math.max(0, parseFloat(pd.Fighting_Spirit_Move_Speed_Buff_Rate) || 0),
            oniCurseMoveSpeedRate: Math.max(1, parseFloat(pd.Oni_Curse_Move_Speed_Rate) || 1.5),
            oniCurseDecreaseHpPerSec: Math.max(0, parseFloat(pd.Oni_Curse_Decrease_HP_Per_Sec) || 0),
            oniCurseControlLimit: String(pd.Oni_Curse_Control_Limit || '').trim().toUpperCase(),
            oniCurseLifeStealPerAtkDmg: Math.max(0, parseFloat(pd.Oni_Curse_Life_Steal_Per_ATK_DMG) || 0),
            oniCurseRapidAtkCooltime: Math.max(0, parseFloat(pd.Oni_Curse_Rapid_ATK_Cooltime) || 0),
            p3OniCurse: null,
            p3OniCurseHpFlashTimer: 0,
            p3OniCurseBleedTimer: 0,
            p3TrialWillBuff: false,
            p3TrialWillBuffFlashTimer: 0,
            p3TrialBodyBuff: false,
            p3TrialBodyBuffFlashTimer: 0,
            fightingSpiritRewardLocks: {},
            kasiyasApostleEnergies: [], kasiyasApostleGuardBuffs: [], kasiyasApostleEnergyGetLockTimer: 0, kasiyasApostleEnergyFlashTimer: 0,
            kasiyasOniMark: null, kasiyasTemperedBladeReady: false, kasiyasTemperedBladeFlashTimer: 0,
            skillCooldowns: {}, freezeTimer: 0, maxFreezeTimer: 0, mashReduced: 0
        };
        gameState.actions = (actionData || []).map(a => ({
            ...a,
            Action_Name: typeof a.Action_Name === 'string' ? a.Action_Name.trim() : a.Action_Name
        }));
        
        // 🎯 [복구] 대쉬 쿨타임 및 키 설정 원본 데이터 로드
        for(let a of gameState.actions) {
            if(a.Action_Name === '점프') gameState.jumpKeyEngine = getEngineKeyCode(a.Input_Key);
            if(a.Action_Name === '대쉬') { gameState.dashKeyEngine = getEngineKeyCode(a.Input_Key); gameState.player.maxDashCd = parseFloat(a.Cooltime) || 1.0; }
        }
    },

    revive: function(gameState) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p) return;
        // 연습 모드에서는 실제 피해 테스트 후에도 R/버튼으로 즉시 복귀할 수 있어야 한다.
        // HP가 0보다 크더라도 Die 상태/게임오버 UI가 남은 경우를 함께 복구한다.
        if (p.hp > 0 && p.state !== 'Die') return;
        if (typeof this.clearP3OniCurse === 'function') {
            this.clearP3OniCurse(gameState, { reason: 'REVIVE', silent: true });
        }
        p.active = true;
        p.hp = Math.max(1, parseFloat(p.maxHp) || p.hp || 1);
        p.state = 'Idle';
        p.atkTimer = 0;
        p.invincibleTimer = 0;
        p.invinTime = 0;
        p.kbVx = 0;
        p.kbVy = 0;
        p.vz = 0;
        p.z = Math.max(0, parseFloat(p.z) || 0);
        p.isGrounded = true;
        p.freezeTimer = 0;
        p.maxFreezeTimer = 0;
        p.mashReduced = 0;
        p.guardTimer = 0;
        p.guardCooldownTimer = 0;
        p.guardSuccessTimer = 0;
        p.dashTimer = 0;
        p.dashSpeedX = 0;
        p.dashSpeedY = 0;
        p.isRunning = false;
        p.runDirection = null;
        p.p3OniCurseHpFlashTimer = 0;
        p.p3OniCurseBleedTimer = 0;
        let go = document.getElementById('gameOverScreen'); if(go) go.style.display = 'none';
        if (gameState) {
            gameState.screenHitFlash = null;
            gameState.screenShakeTimer = 0;
            gameState.screenShakeStrength = 0;
        }
    },

    getFightingSpiritRatio: function(player) {
        if (!player) return 0;
        return Math.max(0, Math.min(1, (parseFloat(player.fightingSpirit) || 0) / Math.max(1, parseFloat(player.maxFightingSpirit) || 100)));
    },

    getFightingSpiritAttackMultiplier: function(player) {
        if (!player) return 1;
        // 데이터값은 "투기 게이지 1당 상승 퍼센트"로 해석한다. 예: 0.3 = 투기 1당 0.3%, 투기 100일 때 30%.
        const gauge = Math.max(0, parseFloat(player.fightingSpirit) || 0);
        const ratePercent = Math.max(0, parseFloat(player.fightingSpiritDmgBuffRate) || 0);
        return 1 + (gauge * ratePercent / 100);
    },

    getFightingSpiritMoveMultiplier: function(player) {
        if (!player) return 1;
        const gauge = Math.max(0, parseFloat(player.fightingSpirit) || 0);
        const ratePercent = Math.max(0, parseFloat(player.fightingSpiritMoveSpeedBuffRate) || 0);
        return 1 + (gauge * ratePercent / 100);
    },

    isP3OniCurseActive: function(player) {
        const curse = player && player.p3OniCurse ? player.p3OniCurse : null;
        return !!(curse && curse.active !== false);
    },

    getP3OniCurseMoveMultiplier: function(player) {
        return this.isP3OniCurseActive(player) ? Math.max(1, parseFloat(player.oniCurseMoveSpeedRate) || 1.5) : 1;
    },

    applyP3OniCurseFromObject: function(gameState, objData = {}, caster = null, sourceAction = null) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p) return false;
        const condValue = Math.max(0.1, parseFloat(objData.Object_Interact_Cond_Value) || 5);
        p.p3OniCurse = {
            active: true,
            timer: 0,
            hpDrainTick: 0,
            conditionTime: condValue,
            noHit: true,
            noAttack: true,
            hiddenFailed: false,
            sourceObjectId: String(objData.Object_ID || '').trim(),
            resultObjectId: String(objData.Object_Interact_Result_Value || '').trim(),
            sourceActionId: String(sourceAction && sourceAction.Action_ID || '').trim()
        };
        p.stance = 'Mode_Melee';
        if (p.state === 'Guard') p.state = 'Idle';
        p.guardTimer = 0;
        // 저주 중에도 방향키 연타 달리기는 허용한다.
        p.rapidAtkCooldownTimer = 0;
        p.rapidAtkAllowTimer = 0;
        p.rapidAtkCount = 0;

        if (gameState.effects) {
            gameState.effects.push({
                type: 'hitSpark',
                renderType: 'EFT_P3_ONI_CURSE',
                x: p.x,
                y: p.y,
                z: p.z + (p.bodyZ || 100) * 0.70,
                w: Math.max(160, (p.bodyX || 60) * 2.8),
                h: Math.max(150, (p.bodyZ || 100) * 1.15),
                life: 0.55,
                maxLife: 0.55,
                color: 'rgba(156,76,255,0.94)',
                accentColor: 'rgba(255,44,36,0.92)',
                darkColor: 'rgba(0,0,0,0.96)'
            });
        }
        if (gameState.floatingTexts) {
        }
        try { pushSystemNotice('귀면족의 저주: 공격하거나 피격되면 히든 조건 실패', '#ff6868', 1.2); } catch(e) {}
        return true;
    },

    clearP3OniCurse: function(gameState, options = {}) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p || !p.p3OniCurse) return false;
        const wasActive = p.p3OniCurse.active !== false;
        p.p3OniCurse.active = false;
        p.p3OniCurse = null;
        p.p3OniCurseHpFlashTimer = 0;
        p.p3OniCurseBleedTimer = 0;
        p.rapidAtkCooldownTimer = Math.max(0, parseFloat(p.rapidAtkCooldownTimer) || 0);
        if (wasActive && !options.silent) {
            if (gameState && Array.isArray(gameState.effects)) {
                gameState.effects.push({
                    type: 'hitSpark',
                    renderType: 'EFT_P3_ONI_CURSE_BREAK',
                    x: p.x,
                    y: p.y,
                    z: p.z + (p.bodyZ || 100) * 0.64,
                    w: Math.max(190, (p.bodyX || 60) * 3.2),
                    h: Math.max(170, (p.bodyZ || 100) * 1.25),
                    life: 0.75,
                    maxLife: 0.75,
                    color: 'rgba(170,96,255,0.92)',
                    accentColor: 'rgba(255,64,54,0.82)',
                    darkColor: 'rgba(0,0,0,0.92)'
                });
            }
            try { pushSystemNotice(options.reason === 'HIDDEN_SUCCESS' ? '귀면족의 저주 해제' : '귀면족의 저주 종료', '#c49cff', 0.8); } catch(e) {}
        }
        return wasActive;
    },

    grantP3TrialWillBuff: function(gameState, objData = null) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p) return false;
        let buffData = objData;
        if (!buffData && gameState && gameState.DB_BOSS_PATTERN_OBJECT) {
            buffData = gameState.DB_BOSS_PATTERN_OBJECT['253013'] || gameState.DB_BOSS_PATTERN_OBJECT[253013] || null;
        }
        const firstGain = !p.p3TrialWillBuff;
        p.p3TrialWillBuff = true;
        p.p3TrialWillBuffFlashTimer = Math.max(parseFloat(p.p3TrialWillBuffFlashTimer) || 0, 1.5);

        // 최신 데이터: 시련을 극복한 강인한 의지 획득 시 HP를 지정 비율만큼 1회 회복한다.
        const interactType = String(buffData && buffData.Object_Interact_Type || '').trim().toUpperCase();
        const restoreValue = Math.max(0, parseFloat(buffData && buffData.Object_Interact_Value) || 0);
        let restored = 0;
        if (interactType === 'PLAYER_HP_PER_RESTORE' && restoreValue > 0) {
            const maxHp = Math.max(1, parseFloat(p.maxHp) || 1);
            const before = Math.max(0, parseFloat(p.hp) || 0);
            p.hp = Math.min(maxHp, before + maxHp * restoreValue / 100);
            restored = Math.max(0, p.hp - before);
            p.p3OniCurseHpFlashTimer = Math.max(parseFloat(p.p3OniCurseHpFlashTimer) || 0, 0.35);
        }

        if (firstGain) {
            if (gameState && Array.isArray(gameState.effects)) {
                gameState.effects.push({
                    type: 'hitSpark',
                    renderType: 'EFT_P3_TRIAL_WILL_GAIN',
                    x: p.x,
                    y: p.y,
                    z: p.z + (p.bodyZ || 100) * 0.72,
                    w: Math.max(250, (p.bodyX || 60) * 4.1),
                    h: Math.max(230, (p.bodyZ || 100) * 1.58),
                    life: 1.15,
                    maxLife: 1.15,
                    color: 'rgba(255,246,210,0.98)',
                    accentColor: 'rgba(255,214,96,0.96)'
                });
            }
            if (gameState.floatingTexts && restored > 0) {
            }
            try { pushSystemNotice('시련을 극복한 강인한 의지 획득', '#ffe9a6', 1.2); } catch(e) {}
        }
        return true;
    },

    grantP3TrialBodyBuff: function(gameState, objData = null) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p) return false;
        let buffData = objData;
        if (!buffData && gameState && gameState.DB_BOSS_PATTERN_OBJECT) {
            buffData = gameState.DB_BOSS_PATTERN_OBJECT['253017'] || gameState.DB_BOSS_PATTERN_OBJECT[253017] || null;
        }
        const firstGain = !p.p3TrialBodyBuff;
        p.p3TrialBodyBuff = true;
        p.p3TrialBodyBuffFlashTimer = Math.max(parseFloat(p.p3TrialBodyBuffFlashTimer) || 0, 1.5);

        const interactType = String(buffData && buffData.Object_Interact_Type || '').trim().toUpperCase();
        const restoreValue = Math.max(0, parseFloat(buffData && buffData.Object_Interact_Value) || 0);
        let restored = 0;
        if (interactType === 'PLAYER_HP_PER_RESTORE' && restoreValue > 0) {
            const maxHp = Math.max(1, parseFloat(p.maxHp) || 1);
            const before = Math.max(0, parseFloat(p.hp) || 0);
            p.hp = Math.min(maxHp, before + maxHp * restoreValue / 100);
            restored = Math.max(0, p.hp - before);
            p.p3OniCurseHpFlashTimer = Math.max(parseFloat(p.p3OniCurseHpFlashTimer) || 0, 0.35);
        }

        if (firstGain) {
            if (gameState && Array.isArray(gameState.effects)) {
                gameState.effects.push({
                    type: 'hitSpark',
                    renderType: 'EFT_P3_TRIAL_BODY_GAIN',
                    x: p.x,
                    y: p.y,
                    z: p.z + (p.bodyZ || 100) * 0.72,
                    w: Math.max(260, (p.bodyX || 60) * 4.2),
                    h: Math.max(230, (p.bodyZ || 100) * 1.58),
                    life: 1.15,
                    maxLife: 1.15,
                    color: 'rgba(255,112,92,0.98)',
                    accentColor: 'rgba(255,224,140,0.92)'
                });
            }
            if (gameState.floatingTexts && restored > 0) {
            }
            try { pushSystemNotice('역경을 이겨낸 강인한 육체 획득', '#ffd0a0', 1.2); } catch(e) {}
        }
        return true;
    },

    markP3OniCurseAttack: function(gameState) {
        const p = gameState && gameState.player ? gameState.player : null;
        const curse = p && p.p3OniCurse ? p.p3OniCurse : null;
        if (!curse || curse.active === false) return false;
        curse.noAttack = false;
        curse.hiddenFailed = true;
        return true;
    },

    markP3OniCurseHit: function(gameState, guardInfo = null) {
        const p = gameState && gameState.player ? gameState.player : null;
        const curse = p && p.p3OniCurse ? p.p3OniCurse : null;
        if (!curse || curse.active === false) return false;
        const patternId = String(guardInfo && guardInfo.sourcePatternId || '').trim();
        const actionId = parseInt(guardInfo && guardInfo.sourceActionId, 10);
        const isCurseSlash = patternId === '233006' && actionId >= 243037 && actionId <= 243043;
        if (!isCurseSlash) return false;
        curse.noHit = false;
        curse.hiddenFailed = true;
        return true;
    },

    applyP3OniCurseLifeSteal: function(gameState, dealtDamage, target = null) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p || !this.isP3OniCurseActive(p)) return false;
        const dealt = Math.max(0, parseFloat(dealtDamage) || 0);
        if (dealt <= 0) return false;
        const rate = Math.max(0, parseFloat(p.oniCurseLifeStealPerAtkDmg) || 0) / 100;
        const heal = dealt * rate;
        if (heal <= 0) return false;
        const before = Math.max(0, parseFloat(p.hp) || 0);
        p.hp = Math.min(Math.max(1, parseFloat(p.maxHp) || before || 1), before + heal);
        const actual = p.hp - before;
        if (actual > 0) {
            p.p3OniCurseHpFlashTimer = Math.max(parseFloat(p.p3OniCurseHpFlashTimer) || 0, 0.30);
            if (gameState && Array.isArray(gameState.effects)) {
                const src = target || (gameState.monsters || []).find(m => m && m.active && m.boss) || null;
                const sx = src ? (parseFloat(src.x) || p.x) : p.x + (p.faceDir || 1) * 120;
                const sy = src ? (parseFloat(src.y) || p.y) : p.y;
                const sz = src ? ((parseFloat(src.z) || 0) + (((src.d && src.d.bodyZ) || 160) * (src.scale || 1)) * 0.58) : (p.z + (p.bodyZ || 100) * 0.6);
                gameState.effects.push({
                    type: 'hitSpark',
                    renderType: 'EFT_P3_ONI_CURSE_LIFE_STEAL',
                    x: sx,
                    y: sy,
                    z: sz,
                    toX: p.x,
                    toY: p.y,
                    toZ: p.z + (p.bodyZ || 100) * 0.72,
                    w: 180,
                    h: 170,
                    life: 0.55,
                    maxLife: 0.55,
                    color: 'rgba(154,74,255,0.86)',
                    accentColor: 'rgba(255,48,50,0.92)',
                    darkColor: 'rgba(12,0,26,0.96)'
                });
            }
            if (gameState.floatingTexts) {
                gameState.floatingTexts.push({ x: p.x, y: p.y, z: p.z + (p.bodyZ || 100) + 46, text: `흡혈 +${actual.toFixed(0)}`, color: '#ff8a86', size: '20px', timer: 0.55 });
            }
        }
        return actual > 0;
    },

    updateP3OniCurse: function(deltaTime, gameState) {
        const p = gameState && gameState.player ? gameState.player : null;
        if (!p) return;
        if (p.p3TrialWillBuffFlashTimer > 0) p.p3TrialWillBuffFlashTimer = Math.max(0, p.p3TrialWillBuffFlashTimer - deltaTime);
        if (p.p3TrialBodyBuffFlashTimer > 0) p.p3TrialBodyBuffFlashTimer = Math.max(0, p.p3TrialBodyBuffFlashTimer - deltaTime);
        if (p.p3OniCurseHpFlashTimer > 0) p.p3OniCurseHpFlashTimer = Math.max(0, p.p3OniCurseHpFlashTimer - deltaTime);
        if (p.p3OniCurseBleedTimer > 0) p.p3OniCurseBleedTimer = Math.max(0, p.p3OniCurseBleedTimer - deltaTime);
        const curse = p.p3OniCurse || null;
        if (!curse || curse.active === false) return;

        p.stance = 'Mode_Melee';
        if (p.state === 'Guard') p.state = 'Idle';
        p.guardTimer = 0;
        p.guardCooldownTimer = 0;
        p.rapidAtkCooldownTimer = 0;

        curse.timer = Math.max(0, (parseFloat(curse.timer) || 0) + deltaTime);
        curse.hpDrainTick = Math.max(0, (parseFloat(curse.hpDrainTick) || 0) + deltaTime);
        const drainPct = Math.max(0, parseFloat(p.oniCurseDecreaseHpPerSec) || 0) / 100;
        while (curse.hpDrainTick >= 1.0) {
            curse.hpDrainTick -= 1.0;
            const drain = Math.max(0, (parseFloat(p.maxHp) || 0) * drainPct);
            if (drain > 0 && !this.isPracticeModeHpInvincible(gameState)) {
                p.hp = Math.max(1, (parseFloat(p.hp) || 1) - drain);
                p.p3OniCurseHpFlashTimer = Math.max(parseFloat(p.p3OniCurseHpFlashTimer) || 0, 0.38);
                p.p3OniCurseBleedTimer = Math.max(parseFloat(p.p3OniCurseBleedTimer) || 0, 0.45);
                if (gameState && Array.isArray(gameState.effects)) {
                    gameState.effects.push({
                        type: 'hitSpark',
                        renderType: 'EFT_P3_ONI_CURSE_BLEED',
                        x: p.x,
                        y: p.y,
                        z: p.z + (p.bodyZ || 100) * 0.58,
                        w: Math.max(110, (p.bodyX || 60) * 2.0),
                        h: Math.max(120, (p.bodyZ || 100) * 1.05),
                        life: 0.48,
                        maxLife: 0.48,
                        color: 'rgba(126,58,210,0.86)',
                        accentColor: 'rgba(255,42,50,0.82)',
                        darkColor: 'rgba(18,0,28,0.92)'
                    });
                }
            }
            if (drain > 0 && gameState.floatingTexts) {
                gameState.floatingTexts.push({ x: p.x, y: p.y, z: p.z + (p.bodyZ || 100) + 22, text: `저주 -${drain.toFixed(0)}`, color: '#bb6cff', size: '18px', timer: 0.45 });
            }
        }

        if (!curse.hiddenFailed && curse.noHit && curse.noAttack && curse.timer >= Math.max(0.1, parseFloat(curse.conditionTime) || 5)) {
            this.grantP3TrialWillBuff(gameState, null);
            this.clearP3OniCurse(gameState, { reason: 'HIDDEN_SUCCESS' });
        }
    },

    addFightingSpirit: function(gameState, amount, options = {}) {
        const p = gameState && gameState.player ? gameState.player : null;
        const value = Math.max(0, parseFloat(amount) || 0);
        if (!p || value <= 0) return false;

        const rewardKey = String(options.rewardKey || '').trim();
        if (rewardKey) {
            p.fightingSpiritRewardLocks = p.fightingSpiritRewardLocks || {};
            if ((parseFloat(p.fightingSpiritRewardLocks[rewardKey]) || 0) > 0) return false;
            p.fightingSpiritRewardLocks[rewardKey] = Math.max(0.45, parseFloat(options.lockTime) || 2.35);
        }

        const maxGauge = Math.max(1, parseFloat(p.maxFightingSpirit) || 100);
        const before = Math.max(0, parseFloat(p.fightingSpirit) || 0);
        const after = Math.max(0, Math.min(maxGauge, before + value));
        p.fightingSpirit = after;

        if (after > before) {
            gameState.floatingTexts.push({
                x: p.x, y: p.y, z: p.z + p.bodyZ + 62,
                text: `투기 +${(after - before).toFixed(0)}`,
                color: '#ffcf62', size: '21px', timer: 0.7, isBubble: false
            });
            return true;
        }
        return false;
    },

    loseFightingSpirit: function(gameState, amount) {
        const p = gameState && gameState.player ? gameState.player : null;
        const value = Math.max(0, parseFloat(amount) || 0);
        if (!p || value <= 0) return false;
        if ((parseFloat(p.fightingSpiritHitLoseCooldownTimer) || 0) > 0) return false;

        const before = Math.max(0, parseFloat(p.fightingSpirit) || 0);
        const after = Math.max(0, before - value);
        p.fightingSpirit = after;
        p.fightingSpiritHitLoseCooldownTimer = Math.max(0, parseFloat(p.hitLoseFightingSpiritCooldown) || 0);

        if (after < before) {
            gameState.floatingTexts.push({
                x: p.x, y: p.y, z: p.z + p.bodyZ + 60,
                text: `투기 -${(before - after).toFixed(0)}`,
                color: '#ff7b6d', size: '20px', timer: 0.65, isBubble: false
            });
            return true;
        }
        return false;
    },

    isGuardableHit: function(player, srcX, srcY, guardInfo) {
        if (!player || player.guardTimer <= 0 || player.state !== 'Guard') return false;
        if (!guardInfo) return false;

        const canGuard = guardInfo.canGuard === true || String(guardInfo.canGuard).trim().toLowerCase() === 'true';
        const result = String(guardInfo.guardResult || '').trim().toUpperCase();
        if (!canGuard || result === 'UNGUARDABLE') return false;

        const guardDirectionType = String(guardInfo.guardDirectionType || '').trim().toUpperCase();
        if (guardDirectionType === 'ANY_DIRECTION' || guardDirectionType === 'ANY' || guardDirectionType === 'ALL_DIRECTION' || guardDirectionType === 'ALL') return true;

        const direction = String(player.guardDirection || 'CASTER_FRONT').trim().toUpperCase();
        if (direction === 'ALL' || direction === 'ALL_DIRECTION') return true;

        // 카시야스 보스전 가드는 전방 판정이 핵심이다.
        // 본체/분신과 겹쳐 있어도 공격자가 플레이어의 앞쪽에 있으면 막을 수 있게 하되,
        // 완전히 등 뒤에서 들어온 판정은 막지 않는다.
        const safeSrcX = parseFloat(srcX);
        const safeSrcY = parseFloat(srcY);
        const dx = (isNaN(safeSrcX) ? player.x : safeSrcX) - player.x;
        const dy = (isNaN(safeSrcY) ? player.y : safeSrcY) - player.y;
        const faceSign = player.faceDir === -1 ? -1 : 1;
        const signedDx = dx * faceSign;
        const bodyX = (parseFloat(player.bodyX) || 60) * (parseFloat(player.scale) || 1);
        const bodyY = (parseFloat(player.bodyY) || 40) * (parseFloat(player.scale) || 1);
        const frontReach = Math.max(130, bodyX * 2.6);
        const rearTolerance = Math.max(24, bodyX * 0.52);
        const sideTolerance = Math.max(150, bodyY * 3.3);

        if (Math.abs(dy) > sideTolerance && signedDx < 0) return false;
        if (signedDx >= -rearTolerance && signedDx <= frontReach) return true;
        return signedDx >= 0;
    },

    isPracticeModeHpInvincible: function(gameState) {
        // F9 연습 모드는 패턴 호출용이며, 실제 피격 피해를 확인할 수 있어야 한다.
        // 무적은 F12 슈퍼 모드에서만 적용한다.
        return !!(gameState && gameState.superDamageMode);
    },

    getKasiyasApostleGuardReduceBonus: function(player, guardInfo) {
        if (!player || !guardInfo) return 0;
        const guardResult = String(guardInfo.guardResult || '').trim().toUpperCase();
        if (guardResult !== 'DAMAGE_REDUCE') return 0;

        const buffs = Array.isArray(player.kasiyasApostleGuardBuffs) ? player.kasiyasApostleGuardBuffs : [];
        let total = 0;
        buffs.forEach(buff => {
            if (!buff) return;
            const type = String(buff.type || buff.buffType || '').trim().toUpperCase();
            if (type !== 'UPGRADE_GUARD_REDUCE_RATE') return;
            const value = parseFloat(buff.value);
            if (!isNaN(value) && value > 0) total += value;
        });
        return Math.max(0, total);
    },

    isKasiyasTemperedBladeCrossGuardActive: function(player, guardInfo, gameState) {
        if (!player || !guardInfo) return false;
        const cond = String(guardInfo.guardSpecialResultOccurrenceCond || '').trim().toUpperCase();
        if (cond !== 'ATK_GUARD_GRANT_TEMPERED_BLADE_GUARD') return false;
        if (player.kasiyasTemperedBladeReady) return true;
        const buff = player.kasiyasOniMarkGuardBuff || null;
        if (buff && String(buff.type || buff.buffType || '').trim().toUpperCase() === 'GRANT_TEMPERED_BLADE_GUARD') return true;

        // 본체/분신 교차 발도가 같은 타이밍에 들어올 때, 첫 판정에서 연단된 칼날이 소모되어도
        // 같은 교차 발도 안의 나머지 판정은 모두 받아낸 것으로 처리한다.
        const bosses = gameState && Array.isArray(gameState.monsters) ? gameState.monsters : [];
        for (const m of bosses) {
            const rt = m && m.boss && m.boss.majorPattern3Runtime ? m.boss.majorPattern3Runtime : null;
            if (rt && (rt.pendingCrossSlashGroggy || rt.crossSlashSpecialResolved)) return true;
        }
        return false;
    },

    takeDamage: function(gameState, finalDmg, srcX, srcY, sType, sDur, sProb, guardInfo = null) {
        let p = gameState.player; if (p.state === 'Die') return;
        if (guardInfo && typeof this.markP3OniCurseHit === 'function') this.markP3OniCurseHit(gameState, guardInfo);

        // 피격 판정/넉백 기준(srcX/srcY)은 기존 공격 범위 중심을 유지하되,
        // 가드 방향 판정은 공격을 시전한 본체/분신/잔상/오브젝트 위치를 우선 사용한다.
        const guardSrcXRaw = guardInfo && guardInfo.guardSourceX;
        const guardSrcYRaw = guardInfo && guardInfo.guardSourceY;
        const guardSrcX = Number.isFinite(parseFloat(guardSrcXRaw)) ? parseFloat(guardSrcXRaw) : srcX;
        const guardSrcY = Number.isFinite(parseFloat(guardSrcYRaw)) ? parseFloat(guardSrcYRaw) : srcY;

        if (this.isGuardableHit(p, guardSrcX, guardSrcY, guardInfo)) {
            p.guardSuccessTimer = 0.32;
            p.kbVx = 0;
            p.kbVy = 0;

            const guardResult = String(guardInfo && guardInfo.guardResult || '').trim().toUpperCase();
            const reduceRateRaw = parseFloat(guardInfo && guardInfo.guardDmgReduceRate);
            // Guard_DMG_Reduce_Rate는 이제 '가드로 막아내는 피해 비율'로 해석한다.
            // 예: 0.8 = 80% 방어, 실제 피해 20%.
            const baseBlockRate = !isNaN(reduceRateRaw) ? Math.max(0, Math.min(1, reduceRateRaw)) : 0;
            const apostleGuardBonus = this.getKasiyasApostleGuardReduceBonus(p, guardInfo);
            const temperedCrossGuard = this.isKasiyasTemperedBladeCrossGuardActive(p, guardInfo, gameState);
            let specialSpiritBlock = false;
            let specialSpiritCost = 0;
            const specialType = String(guardInfo && guardInfo.guardSpecialResultType || '').trim().toUpperCase();
            const specialCond = String(guardInfo && guardInfo.guardSpecialResultOccurrenceCond || '').trim().toUpperCase();
            if (specialType === 'USE_FIGHTING_SPIRIT_BLOCK_ALL') {
                const rawCost = parseFloat(guardInfo && guardInfo.guardSpecialResultCostValue);
                specialSpiritCost = !isNaN(rawCost) && rawCost > 0 ? rawCost : 50;
                const enough = (parseFloat(p.fightingSpirit) || 0) >= specialSpiritCost;
                const condOk = !specialCond || specialCond === 'FIGHTING_SPIRIT_OVER_OR_EQUAL_50' ? enough : enough;
                if (condOk) {
                    p.fightingSpirit = Math.max(0, (parseFloat(p.fightingSpirit) || 0) - specialSpiritCost);
                    specialSpiritBlock = true;
                }
            }
            const finalBlockRate = (temperedCrossGuard || specialSpiritBlock) ? 1 : Math.max(0, Math.min(1, baseBlockRate + apostleGuardBonus));
            const finalDamageRate = Math.max(0, Math.min(1, 1 - finalBlockRate));
            let guardDamage = 0;
            if (guardResult === 'DAMAGE_REDUCE') {
                guardDamage = finalDamageRate <= 0
                    ? 0
                    : Math.max(1, ((finalDmg || 1) * finalDamageRate) - p.def);
                if (guardDamage > 0 && !this.isPracticeModeHpInvincible(gameState)) p.hp -= guardDamage;
            }

            const guardSpirit = Math.max(0, parseFloat(guardInfo && guardInfo.guardGetFightingSpirit) || 0);
            if (guardSpirit > 0) {
                this.addFightingSpirit(gameState, guardSpirit, {
                    rewardKey: guardInfo.guardRewardKey || '',
                    lockTime: guardInfo.guardRewardLockTime || 2.35
                });
            }

            if (guardInfo && guardInfo.makeKnockback && guardInfo.knockbackDistance > 0 && guardInfo.knockbackCanGuard === false) {
                const angle = Math.atan2((p.y || 0) - (srcY || 0), (p.x || 0) - (srcX || 0));
                const kb = guardInfo.knockbackDistance;
                p.x += Math.cos(angle) * kb;
                p.y += Math.sin(angle) * kb;
                p.x = Math.max(0, Math.min(gameState.WORLD_WIDTH || p.x, p.x));
                p.y = Math.max(0, Math.min(gameState.WORLD_DEPTH || p.y, p.y));
            }

            gameState.floatingTexts.push({
                x: p.x,
                y: p.y,
                z: p.z + p.bodyZ + 42,
                text: guardResult === 'DAMAGE_REDUCE'
                    ? (specialSpiritBlock ? `투기 가드 -${specialSpiritCost.toFixed(0)}` : (temperedCrossGuard ? '연단 가드' : (apostleGuardBonus > 0 ? `기운 가드 ${guardDamage.toFixed(0)}` : `GUARD ${guardDamage.toFixed(0)}`)))
                    : 'GUARD',
                color: guardResult === 'DAMAGE_REDUCE' ? (specialSpiritBlock ? '#ffef88' : (temperedCrossGuard ? '#fff2a3' : (apostleGuardBonus > 0 ? '#ffe45c' : '#ffd166'))) : '#8fd3ff',
                size: '26px',
                timer: 0.65,
                isBubble: false
            });
            gameState.effects.push({
                type: 'guard',
                renderType: guardResult === 'DAMAGE_REDUCE' ? (temperedCrossGuard ? 'EFT_TEMPERED_BLADE_CROSS_GUARD' : (apostleGuardBonus > 0 ? 'EFT_APOSTLE_GUARD_REDUCE' : 'EFT_GUARD_REDUCE')) : 'EFT_GUARD_SUCCESS',
                x: p.x,
                y: p.y,
                z: p.z + p.bodyZ * 0.52,
                dir: p.faceDir,
                w: Math.max(118, p.bodyX * p.scale * 1.95),
                h: Math.max(126, p.bodyZ * p.scale * 1.05),
                life: 0.32,
                maxLife: 0.32
            });
            return {
                guarded: true,
                guardResult: guardResult,
                damage: guardDamage,
                baseGuardDmgReduceRate: baseBlockRate,
                guardDmgReduceRate: finalBlockRate,
                guardDamageRate: finalDamageRate,
                apostleGuardBonus: apostleGuardBonus,
                specialSpiritBlock: specialSpiritBlock,
                specialSpiritCost: specialSpiritCost
            };
        }
        
        // 방어력 단순 뺄셈 공식 적용 (최소 피해량 1 보장)
        let actualDmg = Math.max(1, (finalDmg || 1) - p.def);
        
        // F12 슈퍼 모드에서는 패턴 판정은 유지하되 HP 감소만 막는다.
        if (!this.isPracticeModeHpInvincible(gameState)) {
            p.hp -= actualDmg; 
        }

        this.loseFightingSpirit(gameState, p.hitLoseFightingSpirit || 0);

        const makeHitAction = !(guardInfo && guardInfo.makeHitAction === false);
        if (!makeHitAction) {
            p.kbVx = 0;
            p.kbVy = 0;
            p.invincibleTimer = 0;
            p.noHitFloatTimer = Math.max(0, (parseFloat(p.noHitFloatTimer) || 0) - 0.1);
            if ((parseFloat(p.noHitFloatTimer) || 0) <= 0) {
                p.noHitFloatTimer = 0.30;
                gameState.floatingTexts.push({x: p.x, y: p.y, z: p.z + p.bodyZ + 20, text: `${actualDmg.toFixed(0)}`, color: '#ff5252', size: "26px", timer: 0.45});
            }
            return { guarded: false, damage: actualDmg, makeHitAction: false };
        }

        if (String(sType).toLowerCase() === 'freeze' && Math.random() <= (sProb||0) && p.state !== 'Freeze') {
            p.state = 'Freeze'; p.freezeTimer = sDur; p.maxFreezeTimer = sDur; p.mashReduced = 0; p.rapidAtkCount = 0; p.rapidAtkAllowTimer = 0; 
            
            // 🎯 [수정] 말풍선 속성(isBubble)을 제거하고 색상과 텍스트 변경
            gameState.floatingTexts.push({x: p.x, y: p.y, z: p.z + p.bodyZ + 40, text: "빙결", color: "#00ffff", size: "32px", timer: 1.0});
        } else if (p.state !== 'Freeze') {
            p.state = 'Hit'; p.atkTimer = p.hitDur; 
            p.isRunning = false;
            p.runDirection = null;
            p.guardTimer = 0;
            let angle = Math.atan2((p.y||0) - (srcY||0), (p.x||0) - (srcX||0));
            const customKb = guardInfo && guardInfo.makeKnockback && guardInfo.knockbackDistance > 0 ? guardInfo.knockbackDistance : p.kbDist;
            let kb = customKb / Math.max(0.05, p.hitDur);
            p.kbVx = Math.cos(angle) * kb; p.kbVy = Math.sin(angle) * kb;
            p.rapidAtkCount = 0; p.rapidAtkAllowTimer = 0; p.invincibleTimer = 0; 
        }
        gameState.floatingTexts.push({x: p.x, y: p.y, z: p.z + p.bodyZ + 20, text: `${actualDmg.toFixed(0)}`, color: '#ff5252', size: "36px", timer: 1.0});
        gameState.screenHitFlash = {
            life: 0.22,
            maxLife: 0.22,
            strength: Math.min(1, 0.55 + actualDmg / Math.max(1, p.maxHp) * 2.8)
        };
        gameState.effects.push({
            type: 'hitSpark',
            renderType: 'EFT_PLAYER_HIT',
            x: p.x,
            y: p.y,
            z: p.z + p.bodyZ/2,
            life: 0.20,
            maxLife: 0.20,
            burstScale: 1.25,
            color: 'rgba(255,64,54,0.96)',
            accentColor: 'rgba(40,0,0,0.92)'
        });
        return { guarded: false, damage: actualDmg };
    },

    checkLevelUp: function(gameState) { 
        // 🎯 [복구] 다중 레벨업 공식 및 UI 버튼 강제 갱신 원본 로직
        let p = gameState.player; let reqExp = p.level * p.baseNextExp; if (reqExp <= 0 || isNaN(reqExp)) reqExp = 100; 
        let loopGuard = 0;
        while(p.exp >= reqExp && loopGuard < 50) { 
            loopGuard++; p.exp -= reqExp; p.level++; p.maxHp += p.lvlUpGainHp; p.hp = p.maxHp; p.atk += p.lvlUpGainAtk;  
            gameState.floatingTexts.push({x: p.x, y: p.y, z: p.z + p.bodyZ + 40, text: "🎉 LEVEL UP! 🎉", color: "#f1c40f", size: "36px", timer: 1.0});
            reqExp = p.level * p.baseNextExp; if (reqExp <= 0 || isNaN(reqExp)) break; 
        } 
        try { buildUIButtons(); } catch(e){} // 소환 버튼 해금을 위한 필수 UI 갱신!
    },
    
update: function(deltaTime, keys, gameState) {
    let player = gameState.player;
    if (!player.active) return;

    player.vz -= gameState.GRAVITY * deltaTime;
    player.z += player.vz * deltaTime;

    if (player.z <= 0) {
        player.z = 0;
        player.vz = 0;
        player.isGrounded = true;
    }

    if (typeof this.updateP3OniCurse === 'function') this.updateP3OniCurse(deltaTime, gameState);

    if (player.hp <= 0 && player.state !== 'Die') {
        if (typeof this.clearP3OniCurse === 'function') {
            this.clearP3OniCurse(gameState, { reason: 'PLAYER_DIE', silent: true });
        }
        player.state = 'Die';
        player.atkTimer = 999;
        player.hp = 0;
        player.kbVx = 0;
        player.kbVy = 0;
        player.guardTimer = 0;
        player.dashTimer = 0;
        player.isRunning = false;
        player.runDirection = null;
        let go = document.getElementById('gameOverScreen');
        if (go) go.style.display = 'flex';
    }

    if (player.state === 'Freeze') {
        player.freezeTimer -= deltaTime;

        let isMashing = keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown'];
        if (isMashing && !player.wasMashing) {
            let reduceAmount = player.maxFreezeTimer * 0.05;
            if (player.mashReduced + reduceAmount <= player.maxFreezeTimer / 2) {
                player.freezeTimer -= reduceAmount;
                player.mashReduced += reduceAmount;
            }
        }
        player.wasMashing = isMashing;

        if (player.freezeTimer <= 0) {
            player.state = 'Idle';
            player.freezeTimer = 0;
            player.invincibleTimer = 0;
            player.wasMashing = false;
            player.mashReduced = 0;
        }
    } else {
        if (player.invincibleTimer > 0) player.invincibleTimer -= deltaTime;
        if (player.dashCooldownTimer > 0) player.dashCooldownTimer -= deltaTime;
        if (player.guardCooldownTimer > 0) player.guardCooldownTimer = Math.max(0, player.guardCooldownTimer - deltaTime);
        if (player.guardSuccessTimer > 0) player.guardSuccessTimer = Math.max(0, player.guardSuccessTimer - deltaTime);
        if (player.fightingSpiritAtkGainCooldownTimer > 0) player.fightingSpiritAtkGainCooldownTimer = Math.max(0, player.fightingSpiritAtkGainCooldownTimer - deltaTime);
        if (player.fightingSpiritHitLoseCooldownTimer > 0) player.fightingSpiritHitLoseCooldownTimer = Math.max(0, player.fightingSpiritHitLoseCooldownTimer - deltaTime);
        if (player.kasiyasApostleEnergyGetLockTimer > 0) player.kasiyasApostleEnergyGetLockTimer = Math.max(0, player.kasiyasApostleEnergyGetLockTimer - deltaTime);
        if (player.kasiyasApostleEnergyFlashTimer > 0) player.kasiyasApostleEnergyFlashTimer = Math.max(0, player.kasiyasApostleEnergyFlashTimer - deltaTime);
        if (player.kasiyasTemperedBladeFlashTimer > 0) player.kasiyasTemperedBladeFlashTimer = Math.max(0, player.kasiyasTemperedBladeFlashTimer - deltaTime);
        if (player.kasiyasOniMark && player.kasiyasOniMark.flashTimer > 0) {
            player.kasiyasOniMark.flashTimer = Math.max(0, player.kasiyasOniMark.flashTimer - deltaTime);
        }
        if (player.fightingSpiritRewardLocks) {
            for (const key of Object.keys(player.fightingSpiritRewardLocks)) {
                player.fightingSpiritRewardLocks[key] = Math.max(0, (parseFloat(player.fightingSpiritRewardLocks[key]) || 0) - deltaTime);
                if (player.fightingSpiritRewardLocks[key] <= 0) delete player.fightingSpiritRewardLocks[key];
            }
        }

        // 홀드형 가드: 키를 누르고 있는 동안 유지되며, 최대 유지시간을 넘기면 회복 시간이 발생한다.
        if (player.state === 'Guard') {
            if (player.guardTimer > 0) player.guardTimer = Math.max(0, player.guardTimer - deltaTime);
            player.isRunning = false;
            player.runDirection = null;
            player.kbVx = 0;
            player.kbVy = 0;

            if (player.guardTimer <= 0) {
                player.state = 'Idle';
                player.guardForcedRecover = true;
                player.guardCooldownTimer = Math.max(player.guardCooldownTimer || 0, player.maxGuardCooldown || 0);
                if (player.guardCooldownTimer > 0) {
                    gameState.floatingTexts.push({
                        x: player.x,
                        y: player.y,
                        z: player.z + player.bodyZ + 42,
                        text: 'GUARD BREAK',
                        color: '#ff9f43',
                        size: '22px',
                        timer: 0.55,
                        isBubble: false
                    });
                }
            }
        } else if (player.guardTimer > 0) {
            player.guardTimer = 0;
        }
        if (player.bubbleCooldown > 0) player.bubbleCooldown -= deltaTime;
        if (player.stanceSwapTimer > 0) player.stanceSwapTimer -= deltaTime;
        if (player.atkTimer > 0) {
            player.atkTimer -= deltaTime;
        } else if (player.state === 'Atk' || player.state === 'Hit') {
            player.state = 'Idle';
        }

        if (player.rapidAtkCooldownTimer > 0) {
            player.rapidAtkCooldownTimer -= deltaTime;
            if (player.rapidAtkCooldownTimer <= 0) {
                player.rapidAtkCooldownTimer = 0;
                player.rapidAtkCount = 0;
            }
        } else if (player.rapidAtkAllowTimer > 0) {
            player.rapidAtkAllowTimer -= deltaTime;
            if (player.rapidAtkAllowTimer <= 0) {
                player.rapidAtkCount = 0;
            }
        }

        for (let k in player.skillCooldowns) {
            if (player.skillCooldowns[k] > 0) player.skillCooldowns[k] -= deltaTime;
        }

        if (player.hp > 0) {
            PlayerAction.handleInput(deltaTime, keys, gameState, player);
        }
    }

    let pW = player.bodyX * player.scale / 2;
    player.x = Math.max(pW, Math.min(gameState.WORLD_WIDTH - pW, player.x));
    player.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, player.y));
}
};
