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
            maxFightingSpirit: Math.max(1, parseFloat(pd.Max_Fighting_Spirit_Gauge) || 100), fightingSpirit: 0,
            atkGetFightingSpirit: Math.max(0, parseFloat(pd.ATK_Get_Fighting_Spirit) || 0),
            atkGetFightingSpiritCooldown: Math.max(0, parseFloat(pd.ATK_Get_Fighting_Spirit_Cooltime) || 0), fightingSpiritAtkGainCooldownTimer: 0,
            hitLoseFightingSpirit: Math.max(0, parseFloat(pd.Hit_Lose_Fighting_Spirit) || 0),
            hitLoseFightingSpiritCooldown: Math.max(0, parseFloat(pd.Hit_Lose_Fighting_Spirit_Cooltime) || 0), fightingSpiritHitLoseCooldownTimer: 0,
            fightingSpiritDmgBuffRate: Math.max(0, parseFloat(pd.Fighting_Spirit_DMG_Buff_Rate) || 0),
            fightingSpiritMoveSpeedBuffRate: Math.max(0, parseFloat(pd.Fighting_Spirit_Move_Speed_Buff_Rate) || 0),
            fightingSpiritRewardLocks: {},
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
        let p = gameState.player; if (p.hp > 0) return; 
        p.hp = p.maxHp; p.state = 'Idle'; p.atkTimer = 0; p.invincibleTimer = 0; 
        let go = document.getElementById('gameOverScreen'); if(go) go.style.display = 'none'; 
        gameState.floatingTexts.push({x: p.x, y: p.y, z: p.z + p.bodyZ, text: "✨ 부활!", color: "#f1c40f", size: "32px", timer: 1.0});
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

    takeDamage: function(gameState, finalDmg, srcX, srcY, sType, sDur, sProb, guardInfo = null) {
        let p = gameState.player; if (p.state === 'Die') return;

        if (this.isGuardableHit(p, srcX, srcY, guardInfo)) {
            p.guardSuccessTimer = 0.32;
            p.kbVx = 0;
            p.kbVy = 0;

            const guardResult = String(guardInfo && guardInfo.guardResult || '').trim().toUpperCase();
            const reduceRateRaw = parseFloat(guardInfo && guardInfo.guardDmgReduceRate);
            const reduceRate = !isNaN(reduceRateRaw) && reduceRateRaw >= 0 ? reduceRateRaw : 0;
            let guardDamage = 0;
            if (guardResult === 'DAMAGE_REDUCE') {
                guardDamage = Math.max(1, ((finalDmg || 1) * reduceRate) - p.def);
                if (!gameState.isTestMode) p.hp -= guardDamage;
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
                text: guardResult === 'DAMAGE_REDUCE' ? `GUARD ${guardDamage.toFixed(0)}` : 'GUARD',
                color: guardResult === 'DAMAGE_REDUCE' ? '#ffd166' : '#8fd3ff',
                size: '26px',
                timer: 0.65,
                isBubble: false
            });
            gameState.effects.push({
                type: 'guard',
                renderType: guardResult === 'DAMAGE_REDUCE' ? 'EFT_GUARD_REDUCE' : 'EFT_GUARD_SUCCESS',
                x: p.x,
                y: p.y,
                z: p.z + p.bodyZ * 0.52,
                dir: p.faceDir,
                w: Math.max(118, p.bodyX * p.scale * 1.95),
                h: Math.max(126, p.bodyZ * p.scale * 1.05),
                life: 0.32,
                maxLife: 0.32
            });
            return { guarded: true, guardResult: guardResult, damage: guardDamage };
        }
        
        // 방어력 단순 뺄셈 공식 적용 (최소 피해량 1 보장)
        let actualDmg = Math.max(1, (finalDmg || 1) - p.def);
        
        // 🎯 [여기서부터 테스트 모드 스위치 적용]
        // gameState.isTestMode가 아닐 때(즉, 테스트 모드가 꺼져있을 때)만 체력을 깎습니다!
        if (!gameState.isTestMode) {
            p.hp -= actualDmg; 
        }
        // 🎯 [여기까지]

        this.loseFightingSpirit(gameState, p.hitLoseFightingSpirit || 0);

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

    if (player.hp <= 0 && player.state !== 'Die') {
        player.state = 'Die';
        player.atkTimer = 999;
        player.hp = 0;
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
