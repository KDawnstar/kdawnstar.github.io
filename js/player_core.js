// ==========================================
// [모험의 시작] 플레이어 뼈대/물리 모듈 (player_core.js)
// ==========================================

const PlayerManager = {
    init: function(playerData, actionData, gameState) {
        let pd = (playerData && playerData.length > 0) ? playerData[0] : {}; 
        
        gameState.player = {
            active: true, x: gameState.WORLD_WIDTH/2 || 1000, y: gameState.WORLD_DEPTH/2 || 150, z: 0, vz: 0, isGrounded: true, 
            name: pd.Character_Name || '용사', level: parseInt(pd.Level) || 1, exp: 0, baseNextExp: parseInt(pd.Base_Next_EXP) || 100, 
            lvlUpGainHp: parseFloat(pd.Level_Up_Gain_HP) || 20, lvlUpGainAtk: parseFloat(pd.Level_Up_Gain_ATK) || 2,
            lvlDiffRate: parseFloat(pd.Level_Diff_DMG_Rate) || 0.2, lvlDiffLimit: parseInt(pd.Level_Diff_Limit_Level) || 5,
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
            kbDist: parseFloat(pd.Hit_Knockback_Distance) || 5, invinTime: parseFloat(pd.Hit_Invincible_Time) || 0.5, kbVx: 0, kbVy: 0,
            invincibleTimer: 0, atkTimer: 0, stanceSwapTimer: 0, maxStanceSwap: 0, rapidAtkCount: 0, rapidAtkAllowTimer: 0, maxRapidAllow: 0, rapidAtkCooldownTimer: 0, maxRapidAtkCd: 0.5, 
            dashCooldownTimer: 0, maxDashCd: 1.0, dashTimer: 0, dashSpeedX: 0, dashSpeedY: 0, ghostTimer: 0, bubbleCooldown: 0,
            skillCooldowns: {}, freezeTimer: 0, maxFreezeTimer: 0, mashReduced: 0
        };
        gameState.actions = actionData || [];
        
        // 🎯 [복구] 대쉬 쿨타임 및 키 설정 원본 데이터 로드
        for(let a of gameState.actions) {
            if(a.Action_Name === '점프') gameState.jumpKeyEngine = getEngineKeyCode(a.Input_Key);
            if(a.Action_Name === '대쉬') { gameState.dashKeyEngine = getEngineKeyCode(a.Input_Key); gameState.player.maxDashCd = parseFloat(a.Cooltime) || 1.0; }
        }
    },

    revive: function(gameState) {
        let p = gameState.player; if (p.hp > 0) return; 
        p.hp = p.maxHp; p.state = 'Idle'; p.atkTimer = 0; p.invincibleTimer = 2.0; 
        let go = document.getElementById('gameOverScreen'); if(go) go.style.display = 'none'; 
        gameState.floatingTexts.push({x: p.x, y: p.y, z: p.z + p.bodyZ, text: "✨ 부활!", color: "#f1c40f", size: "32px", timer: 1.0});
    },

    takeDamage: function(gameState, finalDmg, srcX, srcY, sType, sDur, sProb) {
        let p = gameState.player; if (p.invincibleTimer > 0 || p.state === 'Die') return;
        
        // 방어력 단순 뺄셈 공식 적용 (최소 피해량 1 보장)
        let actualDmg = Math.max(1, (finalDmg || 1) - p.def);
        
        // 🎯 [여기서부터 테스트 모드 스위치 적용]
        // gameState.isTestMode가 아닐 때(즉, 테스트 모드가 꺼져있을 때)만 체력을 깎습니다!
        if (!gameState.isTestMode) {
            p.hp -= actualDmg; 
        }
        // 🎯 [여기까지]

        if (String(sType).toLowerCase() === 'freeze' && Math.random() <= (sProb||0) && p.state !== 'Freeze') {
            p.state = 'Freeze'; p.freezeTimer = sDur; p.maxFreezeTimer = sDur; p.mashReduced = 0; p.rapidAtkCount = 0; p.rapidAtkAllowTimer = 0; 
            
            // 🎯 [수정] 말풍선 속성(isBubble)을 제거하고 색상과 텍스트 변경
            gameState.floatingTexts.push({x: p.x, y: p.y, z: p.z + p.bodyZ + 40, text: "빙결", color: "#00ffff", size: "32px", timer: 1.0});
        } else if (p.state !== 'Freeze') {
            p.state = 'Hit'; p.atkTimer = p.hitDur; 
            let angle = Math.atan2((p.y||0) - (srcY||0), (p.x||0) - (srcX||0)); let kb = p.kbDist / p.hitDur; p.kbVx = Math.cos(angle) * kb; p.kbVy = Math.sin(angle) * kb;
            p.rapidAtkCount = 0; p.rapidAtkAllowTimer = 0; p.invincibleTimer = p.invinTime; 
        }
        gameState.floatingTexts.push({x: p.x, y: p.y, z: p.z + p.bodyZ + 20, text: `${actualDmg.toFixed(0)}`, color: '#ff5252', size: "36px", timer: 1.0});
        gameState.effects.push({ type: 'hitSpark', x: p.x, y: p.y, z: p.z + p.bodyZ/2, life: 0.15, maxLife: 0.15 });
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
            player.invincibleTimer = Math.max(0, player.invinTime || 0);
            player.wasMashing = false;
            player.mashReduced = 0;
        }
    } else {
        if (player.invincibleTimer > 0) player.invincibleTimer -= deltaTime;
        if (player.dashCooldownTimer > 0) player.dashCooldownTimer -= deltaTime;
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