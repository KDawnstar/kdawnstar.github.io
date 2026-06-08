// [카시야스 보스전] 2페이즈 대형 패턴3 차원 방어전 전용 모드 시스템
// ==========================================
// step203:
// - step202의 F8 테스트 모드/복귀/그로기 결과 분기는 유지
// - P2_M3_Wave_info + P2_M3_Wave_Spawn_info 분리 구조 반영
// - 한 웨이브 안에서 여러 검기 타입/라인/간격을 순차 스폰할 수 있도록 확장
// ==========================================

const P2M3DimensionDefenseSystem = {
    MODE: 'P2_M3_DIMENSION_DEFENSE',
    LANES: ['LEFT', 'CENTER', 'RIGHT'],
    VIRTUAL: {
        fieldW: 480,
        fieldH: 760,
        spawnY: 78,
        warningTopY: 44,
        playerGroundY: 690,
        floorY: 720,
        playerGravity: 1200
    },

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
        return !!(gameState && gameState.specialMode === this.MODE && gameState.p2m3DefenseRuntime && gameState.p2m3DefenseRuntime.active);
    },

    getBoss(gameState) {
        if (!gameState) return null;
        const battleBoss = gameState.bossBattle && gameState.bossBattle.boss;
        if (battleBoss && battleBoss.active) return battleBoss;
        return (gameState.monsters || []).find(m => m && m.active && m.isStageBoss && m.boss) || null;
    },

    canStartTest(gameState) {
        const boss = this.getBoss(gameState);
        const bossRt = boss && boss.boss ? boss.boss : null;
        if (!boss || !bossRt) return { ok: false, reason: '카시야스 보스를 찾을 수 없습니다.' };
        if (String(bossRt.phaseId || '').trim() !== '220002') return { ok: false, reason: '2페이즈에서만 차원 방어전 테스트에 진입할 수 있습니다.' };
        if (gameState.phaseTransition && gameState.phaseTransition.active) return { ok: false, reason: '페이즈 전환 중에는 진입할 수 없습니다.' };
        if (boss.state === 'DIE' || boss.state === 'Die' || boss.hp <= 0) return { ok: false, reason: '보스 사망 상태에서는 진입할 수 없습니다.' };
        if (gameState.specialMode && gameState.specialMode !== this.MODE) return { ok: false, reason: '다른 특수 모드가 실행 중입니다.' };
        return { ok: true, boss };
    },

    startTest(gameState) {
        if (this.isActive(gameState)) {
            this.forceEnd(gameState, 'CANCEL');
            return true;
        }
        const check = this.canStartTest(gameState);
        if (!check.ok) {
            try { pushSystemNotice(check.reason, '#ffd27f', 1.35); } catch (e) {}
            return false;
        }
        return this.start(gameState, { isTestMode: true, boss: check.boss });
    },

    buildSlashLookup(gameState) {
        const lookup = {};
        for (const row of (gameState.DB_P2_M3_SLASH || [])) {
            const id = String(row && row.Slash_Type_ID || '').trim();
            if (id) lookup[id] = row;
        }
        return lookup;
    },

    buildWaveSpawnLookup(gameState) {
        const lookup = {};
        for (const row of (gameState.DB_P2_M3_WAVE_SPAWN || [])) {
            const waveId = String(row && row.Wave_ID || '').trim();
            if (!waveId) continue;
            if (!lookup[waveId]) lookup[waveId] = [];
            lookup[waveId].push(row);
        }
        for (const waveId in lookup) {
            lookup[waveId].sort((a, b) => this.num(a.Spawn_Order, 0) - this.num(b.Spawn_Order, 0));
        }
        return lookup;
    },

    startFromPattern(gameState, boss, options = {}) {
        if (!gameState) return false;
        if (this.isActive(gameState)) return false;
        // 이전 실행 종료 과정에서 특수 모드 플래그만 남은 경우, 다음 232008 진입을 막지 않도록 정리한다.
        if (gameState.specialMode === this.MODE && !(gameState.p2m3DefenseRuntime && gameState.p2m3DefenseRuntime.active)) {
            gameState.specialMode = null;
            gameState.p2m3DefenseRuntime = null;
        }
        if (gameState.specialMode && gameState.specialMode !== this.MODE) return false;
        const targetBoss = boss || this.getBoss(gameState);
        if (targetBoss && targetBoss.boss) {
            // P2_M3_EXCLUSIVE_MODE_START는 실행될 때마다 다시 진입 가능해야 한다.
            targetBoss.boss.p2m3ExclusiveModeStarted = false;
        }
        return this.start(gameState, {
            isTestMode: false,
            isPatternLinked: true,
            boss: targetBoss,
            sourcePatternId: options.patternId || options.sourcePatternId || '232008',
            sourceActionId: options.sourceActionId || '242073'
        });
    },

    updatePatternIntroAction(m, action, deltaTime, gameState) {
        if (!m || !action || !gameState) return false;
        const actionId = String(action.Action_ID || '').trim();
        const p = gameState.player || null;
        const duration = Math.max(0.05, parseFloat(action.Action_Anim_Duration) || 1);
        const ratio = Math.max(0, Math.min(1, (parseFloat(m.timer) || 0) / duration));
        const ease = ratio * ratio * (3 - 2 * ratio);
        const boss = m.boss || {};
        gameState.p2m3IntroRuntime = gameState.p2m3IntroRuntime || {};
        const intro = gameState.p2m3IntroRuntime;
        if (intro.actionId !== actionId) {
            intro.actionId = actionId;
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
            p.kbVx = 0;
            p.kbVy = 0;
            p.vx = 0;
            p.vy = 0;
            p.atkTimer = 0;
            p.guardTimer = 0;
            p.state = actionId === '242071' || actionId === '242072' ? 'Hit' : 'Idle';
        }

        if (actionId === '242070' && p) {
            const dir = (p.x >= (intro.startBossX || m.x)) ? 1 : -1;
            const targetX = p.x - dir * 132;
            const targetY = p.y;
            m.x = (intro.startBossX || m.x) + (targetX - (intro.startBossX || m.x)) * ease;
            m.y = (intro.startBossY || m.y) + (targetY - (intro.startBossY || m.y)) * ease;
            m.faceDir = dir;
            intro.focusX = (m.x + p.x) * 0.5;
            intro.focusY = (typeof GameRenderer !== 'undefined' ? GameRenderer.GROUND_BASE_Y : 400) + ((m.y + p.y) * 0.5) - 110;
            intro.zoom = 1.22 + 0.10 * Math.sin(Math.PI * ratio);
            m.state = 'MOVE';
        } else if (actionId === '242071' && p) {
            const dir = (p.x >= m.x) ? 1 : -1;
            m.x = p.x - dir * 126;
            m.y = p.y;
            m.faceDir = dir;
            m.state = 'ATK_MELEE';
            intro.focusX = (m.x + p.x) * 0.5;
            intro.focusY = (typeof GameRenderer !== 'undefined' ? GameRenderer.GROUND_BASE_Y : 400) + p.y - 115;
            intro.zoom = 1.34;
            if (!intro.hitFired && ratio >= 0.42) {
                intro.hitFired = true;
                if (gameState.screenShake) {
                    gameState.screenShake.timer = 0.22;
                    gameState.screenShake.maxTime = 0.22;
                    gameState.screenShake.power = 10;
                }
                if (Array.isArray(gameState.effects)) {
                    gameState.effects.push({ type: 'hitSpark', renderType: 'EFT_KASIYAS_P2_SWORD_HANDLE_ATK', x: p.x, y: p.y, z: (p.z || 0) + 88, life: 0.28, maxLife: 0.28, dir: dir });
                }
                if (Array.isArray(gameState.floatingTexts)) {
                    gameState.floatingTexts.push({ x: p.x, y: p.y, z: (p.z || 0) + 150, text: '차원 타격', color: '#d7c7ff', size: '24px', timer: 0.75 });
                }
            }
        } else if (actionId === '242072' && p) {
            const groundBase = (typeof GameRenderer !== 'undefined' ? GameRenderer.GROUND_BASE_Y : 400);
            intro.focusX = (m.x + p.x) * 0.5;
            intro.focusY = groundBase + p.y - 70 + 210 * ease;
            intro.zoom = 1.25 - 0.10 * ease;
            m.state = 'IDLE';
            p.state = 'Hit';
            const fallZ = -220 * ease;
            // 242072 중에는 아래로 추락해 사라지는 것처럼 보이되, 액션 종료 직전에는
            // 다음 P2_M3_EXCLUSIVE_MODE_START가 정상 스냅샷을 잡을 수 있도록 Z를 복구한다.
            if (ratio < 0.96) {
                m.z = fallZ * 0.72;
                p.z = fallZ;
            } else {
                m.z = 0;
                p.z = 0;
            }
            if (!intro.noticeFired) {
                intro.noticeFired = true;
                try { pushSystemNotice('차원이 붕괴됩니다', '#caa7ff', 1.0); } catch (e) {}
            }
            if (gameState.screenShake) {
                gameState.screenShake.timer = Math.max(gameState.screenShake.timer || 0, 0.08);
                gameState.screenShake.maxTime = 0.12;
                gameState.screenShake.power = Math.max(gameState.screenShake.power || 0, 3 + 8 * Math.sin(Math.PI * ratio));
            }
            if (gameState.screenHitFlash && String(gameState.screenHitFlash.mode || '') !== 'white') {
                gameState.screenHitFlash = null;
            }
            if (ratio > 0.68 && !intro.fallFlashFired) {
                intro.fallFlashFired = true;
                gameState.screenHitFlash = { mode: 'white', life: 0.28, maxLife: 0.28, strength: 0.42 };
            }
        }
        return true;
    },

    start(gameState, options = {}) {
        if (!gameState) return false;
        const boss = options.boss || this.getBoss(gameState);
        const playerData = (gameState.DB_P2_M3_PLAYER || [])[0] || {};
        const player = gameState.player || {};
        // step213: 패턴 연결형 DIRECT_ACT 낙하 연출에서 남은 음수 Z/피격 상태가 스냅샷에 저장되면
        // 종료 복귀나 재진입 때 배우가 화면 밖에 남을 수 있으므로 전용 모드 시작 직전에 기준 상태로 정리한다.
        if (options.isPatternLinked) {
            if (player) {
                player.z = 0;
                player.vz = 0;
                player.kbVx = 0;
                player.kbVy = 0;
                player.vx = 0;
                player.vy = 0;
                player.isGrounded = true;
                if (player.state === 'Hit' || player.state === 'HIT') player.state = 'Idle';
            }
            if (boss) {
                boss.z = 0;
                boss.kbVx = 0;
                boss.kbVy = 0;
                if (boss.state === 'Hit' || boss.state === 'HIT') boss.state = 'IDLE';
            }
        }
        const startLane = this.laneIndex(playerData.Player_Start_Lane, 1);
        const waves = (gameState.DB_P2_M3_WAVE || [])
            .filter(row => String(row && row.Pattern_ID || '').trim() === '232008' || !row.Pattern_ID)
            .slice()
            .sort((a, b) => this.num(a.Wave_Order, 0) - this.num(b.Wave_Order, 0));

        if (!waves.length) {
            try { pushSystemNotice('차원 방어전 웨이브 데이터를 찾을 수 없습니다.', '#ffb8b8', 1.4); } catch (e) {}
            return false;
        }

        const guardMax = Math.max(1, this.num(playerData.Guard_Gauge_Max, 100));
        const hpMax = Math.max(1, this.num(playerData.HP, 10));
        if (gameState) gameState.screenHitFlash = null;
        const rt = {
            active: true,
            isTestMode: !!options.isTestMode,
            isPatternLinked: !!options.isPatternLinked,
            sourcePatternId: options.sourcePatternId || '',
            sourceActionId: options.sourceActionId || '',
            phase: 'INTRO',
            timer: 0,
            introMaxTime: options.isPatternLinked ? 1.25 : 0.65,
            introTime: options.isPatternLinked ? 1.25 : 0.65,
            introVisualPhase: options.isPatternLinked ? 'SIMPLE_FALL' : 'TEST_READY',
            endingTimer: 0,
            result: null,
            resultReason: '',
            boss: boss || null,
            virtual: { ...this.VIRTUAL },
            playerData,
            waves,
            slashLookup: this.buildSlashLookup(gameState),
            waveSpawnLookup: this.buildWaveSpawnLookup(gameState),
            waveIndex: -1,
            waveState: null,
            activeSlashes: [],
            skillWaves: [],
            effects: [],
            slashSeq: 1,
            skillWaveSeq: 1,
            lanes: this.LANES,
            player: {
                lane: startLane,
                visualLane: startLane,
                moveTimer: 0,
                moveFromLane: startLane,
                moveToLane: startLane,
                y: this.VIRTUAL.playerGroundY,
                vy: 0,
                grounded: true,
                jumpFlashTimer: 0,
                maxHp: hpMax,
                hp: hpMax,
                atk: Math.max(1, this.num(playerData.ATK, 1)),
                attackCooldown: 0,
                attackFlashTimer: 0,
                guardGauge: guardMax,
                guardGaugeMax: guardMax,
                guardRegenDelayTimer: 0,
                isGuarding: false,
                guardContactTimer: 0,
                guardFlashTimer: 0,
                skillCooldown: 0,
                skillFlashTimer: 0,
                hasTemperedWill: false,
                damageFlashTimer: 0
            },
            inputPrev: {},
            snapshot: {
                playerX: this.num(player.x, 300),
                playerY: this.num(player.y, 150),
                playerZ: this.num(player.z, 0),
                playerState: player.state || 'Idle',
                bossX: this.num(boss && boss.x, 1000),
                bossY: this.num(boss && boss.y, 150),
                bossZ: this.num(boss && boss.z, 0),
                bossState: boss && boss.state || 'IDLE'
            },
            message: '',
            messageTimer: 0,
            resultMessage: false
        };

        gameState.specialMode = this.MODE;
        gameState.p2m3DefenseRuntime = rt;
        this.pauseExistingCombat(gameState);
        gameState.p2m3IntroRuntime = null;
        try { pushSystemNotice(rt.isPatternLinked ? '카시야스의 차원 방어전 개시' : 'F8 · 차원 방어전 테스트 모드', '#caa7ff', 1.35); } catch (e) {}
        return true;
    },

    pauseExistingCombat(gameState) {
        if (!gameState) return;
        gameState.hitboxes = [];
        gameState.projectiles = [];
        gameState.auras = [];
        gameState.bossAttackObjects = [];
        if (Array.isArray(gameState.effects)) {
            gameState.effects = gameState.effects.filter(e => e && (e.type === 'hitSpark' || e.type === 'guard'));
        }
        const boss = this.getBoss(gameState);
        if (boss && boss.boss) {
            boss.boss.activePattern = null;
            boss.boss.currentActionIndex = -1;
            boss.boss.action = null;
            boss.boss.actionMove = null;
            boss.boss.previewDashPath = null;
            boss.boss.currentDashPath = null;
            boss.boss.noPatternWaitTimer = Math.max(boss.boss.noPatternWaitTimer || 0, 0.5);
            boss.state = 'IDLE';
            boss.timer = 0;
            boss.kbVx = 0;
            boss.kbVy = 0;
        }
        const p = gameState.player || null;
        if (p) {
            p.state = 'Idle';
            p.prevState = 'Idle';
            p.atkTimer = 0;
            p.kbVx = 0;
            p.kbVy = 0;
            p.vz = 0;
            p.z = 0;
            p.isGrounded = true;
            p.guardTimer = 0;
            p.isRunning = false;
        }
    },

    isKeyPressed(rt, code, keys) {
        return !!(keys && keys[code]) && !rt.inputPrev[code];
    },

    isJumpPressed(rt, keys, gameState) {
        const jumpKey = gameState && gameState.jumpKeyEngine ? gameState.jumpKeyEngine : 'KeyC';
        return this.isKeyPressed(rt, jumpKey, keys) || this.isKeyPressed(rt, 'Space', keys) || this.isKeyPressed(rt, 'ArrowUp', keys);
    },

    handleInput(gameState, rt, dt) {
        const keys = gameState.keys || {};
        const p = rt.player;
        const playerData = rt.playerData || {};
        const laneMoveTime = Math.max(0.01, this.num(playerData.Lane_Move_Time, 0.1));

        if (this.isKeyPressed(rt, 'ArrowLeft', keys)) {
            this.moveLane(rt, Math.max(0, p.lane - 1), laneMoveTime);
        }
        if (this.isKeyPressed(rt, 'ArrowRight', keys)) {
            this.moveLane(rt, Math.min(2, p.lane + 1), laneMoveTime);
        }
        if (this.isJumpPressed(rt, keys, gameState) && p.grounded) {
            p.vy = -Math.max(100, this.num(playerData.Jump_Power, 500));
            p.grounded = false;
            p.jumpFlashTimer = 0.18;
        }

        p.attackCooldown = Math.max(0, p.attackCooldown - dt);
        p.skillCooldown = Math.max(0, p.skillCooldown - dt);
        p.attackFlashTimer = Math.max(0, p.attackFlashTimer - dt);
        p.guardFlashTimer = Math.max(0, p.guardFlashTimer - dt);
        p.guardContactTimer = Math.max(0, p.guardContactTimer - dt);
        p.skillFlashTimer = Math.max(0, p.skillFlashTimer - dt);
        p.damageFlashTimer = Math.max(0, p.damageFlashTimer - dt);
        p.jumpFlashTimer = Math.max(0, p.jumpFlashTimer - dt);

        if (p.moveTimer > 0) {
            p.moveTimer = Math.max(0, p.moveTimer - dt);
            const t = 1 - p.moveTimer / laneMoveTime;
            const eased = t * t * (3 - 2 * t);
            p.visualLane = p.moveFromLane + (p.moveToLane - p.moveFromLane) * eased;
        } else {
            p.visualLane = p.lane;
        }

        this.updatePlayerJump(rt, dt);

        const guardHeld = !!keys.KeyD;
        if (guardHeld && p.guardGauge > 0) {
            p.isGuarding = true;
            const holdCost = Math.max(0, this.num(playerData.Guard_Gauge_Hold_Cost_Per_Sec, this.num(playerData.Guard_Cost_Per_Sec, 10))) * dt;
            p.guardGauge = Math.max(0, p.guardGauge - holdCost);
            p.guardRegenDelayTimer = Math.max(p.guardRegenDelayTimer, this.num(playerData.Guard_Regen_Delay, 0.2));
            p.guardFlashTimer = Math.max(p.guardFlashTimer, 0.06);
        } else {
            p.isGuarding = false;
            p.guardRegenDelayTimer = Math.max(0, p.guardRegenDelayTimer - dt);
            if (p.guardRegenDelayTimer <= 0) {
                p.guardGauge = Math.min(p.guardGaugeMax, p.guardGauge + Math.max(0, this.num(playerData.Guard_Gauge_Regen_Per_sec, 20)) * dt);
            }
        }

        if (keys.KeyX && p.attackCooldown <= 0) {
            this.playerAttack(gameState, rt);
            p.attackCooldown = Math.max(0.03, this.num(playerData.ATK_Delay, 0.15));
            p.attackFlashTimer = 0.12;
        }

        if (this.isKeyPressed(rt, 'KeyA', keys) && p.skillCooldown <= 0) {
            this.playerSkill(gameState, rt);
            p.skillCooldown = Math.max(0.1, this.num(playerData.Skill_Cooldown, 8));
            p.skillFlashTimer = Math.max(0.16, this.num(playerData.Skill_Cast_Time, 0.1));
        }

        rt.inputPrev = { ...keys };
    },

    updatePlayerJump(rt, dt) {
        const p = rt.player;
        if (!p) return;
        const v = rt.virtual || this.VIRTUAL;
        if (!p.grounded || Math.abs(p.vy || 0) > 0.01) {
            p.vy += v.playerGravity * dt;
            p.y += p.vy * dt;
            if (p.y >= v.playerGroundY) {
                p.y = v.playerGroundY;
                p.vy = 0;
                p.grounded = true;
            } else {
                p.grounded = false;
            }
        } else {
            p.y = v.playerGroundY;
            p.vy = 0;
            p.grounded = true;
        }
    },

    moveLane(rt, lane, moveTime) {
        const p = rt.player;
        if (!p || lane === p.lane) return;
        p.moveFromLane = Number.isFinite(parseFloat(p.visualLane)) ? parseFloat(p.visualLane) : p.lane;
        p.moveToLane = lane;
        p.lane = lane;
        p.moveTimer = moveTime;
    },

    pickLanesForWave(rt, wave) {
        const type = String(wave && wave.Lane_Select_Type || 'RANDOM_SINGLE').trim().toUpperCase();
        const value = String(wave && wave.Lane_Value || '').trim().toUpperCase();
        if (type === 'ALL') return [0, 1, 2];
        if (type === 'PLAYER_LANE') return [rt.player.lane];
        if (type === 'FIXED' && value) return this.parseLaneValue(value);
        if (type === 'SEQUENCE' && value) {
            const seq = value.split('>').map(v => this.laneIndex(v, 1));
            const idx = rt.waveState ? Math.max(0, (rt.waveState.spawnDone || 0) % Math.max(1, seq.length)) : 0;
            return [seq[idx]];
        }
        if (type === 'RANDOM_DOUBLE_ADJACENT') {
            return Math.random() < 0.5 ? [0, 1] : [1, 2];
        }
        if (type === 'RANDOM_DOUBLE_ANY') {
            const combos = [[0,1],[1,2],[0,2]];
            return combos[Math.floor(Math.random() * combos.length)] || [0,1];
        }
        return [Math.floor(Math.random() * 3)];
    },

    parseLaneValue(value) {
        const raw = String(value || '').trim();
        if (!raw) return [1];
        const sep = raw.indexOf('>') >= 0 ? '>' : ',';
        const lanes = raw.split(sep).map(v => this.laneIndex(v, 1));
        return [...new Set(lanes)].filter(v => v >= 0 && v <= 2);
    },

    startNextWave(rt) {
        rt.waveIndex += 1;
        if (rt.waveIndex >= rt.waves.length) {
            rt.phase = 'COMPLETE';
            rt.endingTimer = 0.5;
            return;
        }
        const wave = rt.waves[rt.waveIndex];
        const waveId = String(wave && wave.Wave_ID || '').trim();
        const spawnList = (rt.waveSpawnLookup && rt.waveSpawnLookup[waveId] ? rt.waveSpawnLookup[waveId] : []).slice();

        if (spawnList.length > 0) {
            rt.waveState = {
                wave,
                spawnList,
                spawnIndex: 0,
                spawnRepeatDone: 0,
                spawnDone: 0,
                spawnTimer: 0,
                timer: Math.max(0, this.num(wave.Wave_Start_Delay, this.num(wave.Start_Delay, 0.5))),
                nextDelay: Math.max(0, this.num(wave.Next_Wave_Delay, 0.8)),
                savedLanesBySpawn: {},
                phase: 'START_DELAY'
            };
        } else {
            // 구버전/누락 데이터 fallback: Wave_info 1행을 직접 스폰 정보로 사용한다.
            const sameLane = this.bool(wave.Use_Same_Lane);
            rt.waveState = {
                wave,
                spawnList: null,
                timer: Math.max(0, this.num(wave.Wave_Start_Delay, this.num(wave.Start_Delay, 0.5))),
                spawnTimer: 0,
                spawnDone: 0,
                spawnCount: Math.max(1, Math.floor(this.num(wave.Spawn_Count, 1))),
                interval: Math.max(0.05, this.num(wave.Spawn_Interval, 0.6)),
                nextDelay: Math.max(0, this.num(wave.Next_Wave_Delay, 0.8)),
                savedLanes: sameLane ? this.pickLanesForWave(rt, wave) : null,
                phase: 'START_DELAY'
            };
        }
        // step216: 웨이브 알림 텍스트는 제거하고, 하단 HUD의 Wave 표시만 사용한다.
        rt.message = '';
        rt.messageTimer = 0;
        rt.resultMessage = false;
    },

    updateWave(gameState, rt, dt) {
        if (!rt.waveState) this.startNextWave(rt);
        const ws = rt.waveState;
        if (!ws) return;

        if (ws.phase === 'START_DELAY') {
            ws.timer -= dt;
            if (ws.timer <= 0) {
                ws.phase = 'SPAWNING';
                ws.spawnTimer = 0;
            }
            return;
        }

        if (ws.phase === 'SPAWNING') {
            ws.spawnTimer -= dt;
            if (ws.spawnList && ws.spawnList.length > 0) {
                if (ws.spawnIndex < ws.spawnList.length && ws.spawnTimer <= 0) {
                    const spawn = ws.spawnList[ws.spawnIndex];
                    const repeatCount = Math.max(1, Math.floor(this.num(spawn.Spawn_Count, 1)));
                    const sameLane = this.bool(spawn.Use_Same_Lane);
                    let lanes = null;
                    if (sameLane && ws.savedLanesBySpawn && ws.savedLanesBySpawn[ws.spawnIndex]) {
                        lanes = ws.savedLanesBySpawn[ws.spawnIndex].slice();
                    } else {
                        lanes = this.pickLanesForWave(rt, spawn);
                        if (sameLane && ws.savedLanesBySpawn) ws.savedLanesBySpawn[ws.spawnIndex] = lanes.slice();
                    }
                    this.spawnSlashForWave(rt, { ...ws.wave, ...spawn, Wave_ID: ws.wave.Wave_ID, Wave_Order: ws.wave.Wave_Order, Wave_Name: ws.wave.Wave_Name }, lanes);
                    ws.spawnDone += 1;
                    ws.spawnRepeatDone += 1;
                    if (ws.spawnRepeatDone < repeatCount) {
                        ws.spawnTimer = Math.max(0.02, this.num(spawn.Spawn_Interval, this.num(spawn.Next_Spawn_Delay, 0.5)));
                    } else {
                        const nextDelay = this.num(spawn.Next_Spawn_Delay, 0);
                        ws.spawnRepeatDone = 0;
                        ws.spawnIndex += 1;
                        ws.spawnTimer = Math.max(0, nextDelay);
                    }
                }
                if (ws.spawnIndex >= ws.spawnList.length && !rt.activeSlashes.some(s => s && s.active)) {
                    ws.phase = 'NEXT_DELAY';
                    ws.timer = ws.nextDelay;
                }
                return;
            }

            // 구버전 fallback
            if (ws.spawnDone < ws.spawnCount && ws.spawnTimer <= 0) {
                this.spawnSlashForWave(rt, ws.wave, ws.savedLanes || this.pickLanesForWave(rt, ws.wave));
                ws.spawnDone += 1;
                ws.spawnTimer = ws.interval;
            }
            if (ws.spawnDone >= ws.spawnCount && !rt.activeSlashes.some(s => s && s.active)) {
                ws.phase = 'NEXT_DELAY';
                ws.timer = ws.nextDelay;
            }
            return;
        }

        if (ws.phase === 'NEXT_DELAY') {
            ws.timer -= dt;
            if (ws.timer <= 0) {
                rt.waveState = null;
                this.startNextWave(rt);
            }
        }
    },

    getSlashVisualHeight(data, lanes, isGiant, isFinal) {
        if (isFinal) return 118;
        if (isGiant) return 150;
        if ((lanes || []).length >= 2) return 112;
        const type = String(data && data.Slash_Render_Type || '').toUpperCase();
        if (type.indexOf('X_SLASH') >= 0) return 94;
        return 78;
    },

    spawnSlashForWave(rt, wave, lanes) {
        const slashId = String(wave.Slash_Type_ID || '').trim();
        const data = rt.slashLookup[slashId];
        if (!data) return;
        const laneList = Array.isArray(lanes) && lanes.length ? lanes.slice() : [1];
        const laneSize = Math.max(1, Math.min(3, Math.floor(this.num(data.Lane_Size, laneList.length || 1))));
        let finalLanes = laneList;
        if (laneSize === 3) finalLanes = [0, 1, 2];
        else if (laneSize === 2 && finalLanes.length < 2) finalLanes = finalLanes[0] <= 0 ? [0, 1] : [1, 2];
        finalLanes = [...new Set(finalLanes)].sort((a, b) => a - b);

        const cond = String(data.Destroy_Condition_Type || '').trim().toUpperCase();
        const laneHp = {};
        if (cond === 'PER_LANE_HIT_COUNT') {
            const perLane = Math.max(1, Math.floor(this.num(data.HP_Per_Lane, 1)));
            finalLanes.forEach(lane => { laneHp[lane] = perLane; });
        }

        const speedRate = 1 / Math.max(0.1, this.num(wave.Fall_Time_Rate, 1));
        const renderType = String(data.Slash_Render_Type || '').trim().toUpperCase();
        const isFinal = cond === 'FINAL_COUNTER';
        const isGiant = renderType.indexOf('GIANT') >= 0 || String(wave.Wave_Type || '').toUpperCase().indexOf('GIANT') >= 0;
        const height = this.getSlashVisualHeight(data, finalLanes, isGiant, isFinal);
        const initSpeed = Math.max(10, this.num(data.Initial_Fall_Speed, (this.VIRTUAL.floorY - this.VIRTUAL.spawnY) / Math.max(0.3, this.num(data.Fall_Time, 2)))) * speedRate;
        const gravity = Math.max(0, this.num(data.Gravity, 0)) * speedRate;
        const maxSpeed = Math.max(initSpeed, this.num(data.Max_Fall_Speed, initSpeed + gravity * 2)) * speedRate;

        rt.activeSlashes.push({
            uid: rt.slashSeq++,
            active: true,
            waveId: wave.Wave_ID,
            waveOrder: wave.Wave_Order,
            spawnOrder: wave.Spawn_Order,
            waveSpawnName: wave.Wave_Spawn_Name || '',
            waveType: String(wave.Wave_Type || '').trim().toUpperCase(),
            slashId,
            data,
            lanes: finalLanes,
            state: 'WARNING',
            warningTimer: Math.max(0.05, this.num(wave.Warning_Time, 1)),
            warningMax: Math.max(0.05, this.num(wave.Warning_Time, 1)),
            y: this.VIRTUAL.spawnY,
            vy: initSpeed,
            gravity,
            maxFallSpeed: maxSpeed,
            height,
            hp: Math.max(1, Math.floor(this.num(data.Slash_HP, 1))),
            maxHp: Math.max(1, Math.floor(this.num(data.Slash_HP, 1))),
            laneHp,
            hitFlashTimer: 0,
            breakFlashTimer: 0,
            guardCooldown: 0,
            guardFlashTimer: 0,
            isFinal,
            isGiant
        });
    },

    updateSlashes(gameState, rt, dt) {
        const p = rt.player;
        const v = rt.virtual || this.VIRTUAL;
        for (const slash of rt.activeSlashes) {
            if (!slash || !slash.active) continue;
            slash.hitFlashTimer = Math.max(0, (slash.hitFlashTimer || 0) - dt);
            slash.breakFlashTimer = Math.max(0, (slash.breakFlashTimer || 0) - dt);
            slash.guardCooldown = Math.max(0, (slash.guardCooldown || 0) - dt);
            slash.guardFlashTimer = Math.max(0, (slash.guardFlashTimer || 0) - dt);
            slash.stackContactTimer = Math.max(0, (slash.stackContactTimer || 0) - dt);
            if (slash.state === 'WARNING') {
                slash.warningTimer -= dt;
                if (slash.warningTimer <= 0) slash.state = 'FALLING';
                continue;
            }

            slash.vy = Math.min(Math.max(10, slash.maxFallSpeed || 999), (slash.vy || 0) + (slash.gravity || 0) * dt);
            slash.y += slash.vy * dt;
            if ((slash.y || 0) < v.spawnY) {
                slash.y = v.spawnY;
                slash.vy = Math.max(0, slash.vy || 0);
            }

            this.tryGuardSlash(rt, slash);

            if (slash.isFinal && p.hasTemperedWill && this.isSlashInPlayerRange(rt, slash, p.lane, 'guard') && p.isGuarding) {
                this.finish(gameState, 'GUARD_SUCCESS', '최종 낙하 공격 가드 성공');
                return;
            }
        }

        this.resolveSlashStack(rt);

        for (const slash of rt.activeSlashes) {
            if (!slash || !slash.active || slash.state !== 'FALLING') continue;
            const bottom = (slash.y || 0) + (slash.height || 0);
            if (bottom >= v.floorY) {
                this.resolveSlashImpact(gameState, rt, slash);
                if (!this.isActive(gameState)) return;
            }
        }
        rt.activeSlashes = rt.activeSlashes.filter(s => s && s.active);
    },

    resolveSlashStack(rt) {
        const falling = (rt.activeSlashes || [])
            .filter(s => s && s.active && s.state === 'FALLING')
            .sort((a, b) => ((b.y || 0) + (b.height || 0)) - ((a.y || 0) + (a.height || 0)));
        const stackTopByLane = [null, null, null];
        const gap = 3;
        for (const slash of falling) {
            const lanes = slash.lanes && slash.lanes.length ? slash.lanes : [1];
            const supports = lanes
                .map(l => stackTopByLane[l])
                .filter(v => Number.isFinite(v));
            if (supports.length > 0) {
                const supportTop = Math.min.apply(null, supports);
                const desiredBottom = supportTop - gap;
                const currentBottom = (slash.y || 0) + (slash.height || 0);
                if (currentBottom > desiredBottom) {
                    slash.y = desiredBottom - (slash.height || 0);
                    slash.vy = Math.min(slash.vy || 0, 18);
                    slash.stackContactTimer = 0.12;
                }
            }
            for (const lane of lanes) {
                if (lane >= 0 && lane <= 2) {
                    stackTopByLane[lane] = Math.min(stackTopByLane[lane] ?? Infinity, slash.y || 0);
                }
            }
        }
    },

    updateP2M3Effects(rt, dt) {
        if (!rt) return;
        rt.effects = (rt.effects || []).filter(e => {
            if (!e) return false;
            e.timer = Math.max(0, (e.timer || 0) - dt);
            return e.timer > 0;
        });
    },

    pushP2M3Effect(rt, type, x, y, options = {}) {
        if (!rt) return;
        if (!Array.isArray(rt.effects)) rt.effects = [];
        rt.effects.push({
            type,
            effectType: options.effectType || '',
            x: Number.isFinite(parseFloat(x)) ? parseFloat(x) : 0,
            y: Number.isFinite(parseFloat(y)) ? parseFloat(y) : 0,
            lane: options.lane,
            lanes: options.lanes ? options.lanes.slice() : null,
            size: options.size || 1,
            color: options.color || '',
            timer: options.timer || 0.28,
            maxTimer: options.timer || 0.28,
            isGiant: !!options.isGiant
        });
    },

    getSlashCenterInfo(slash) {
        const lanes = slash && slash.lanes && slash.lanes.length ? slash.lanes : [1];
        const lane = lanes.reduce((sum, v) => sum + v, 0) / Math.max(1, lanes.length);
        return {
            lane,
            y: (slash && slash.y || 0) + (slash && slash.height || 0) * 0.58,
            lanes
        };
    },

    tryGuardSlash(rt, slash) {
        const p = rt.player;
        if (!p || !p.isGuarding || !slash || !slash.active || slash.state !== 'FALLING') return false;
        if (!this.bool(slash.data.Can_Guard_Push)) return false;
        if (!this.isSlashInPlayerRange(rt, slash, p.lane, 'guard')) return false;
        const costRate = Math.max(0, this.num(slash.data.Guard_Gauge_Cost_Rate, 1));
        const hitCost = Math.max(0, this.num(rt.playerData.Guard_Gauge_Hit_Cost, 20)) * costRate;
        if ((slash.guardCooldown || 0) > 0) return true;
        if (p.guardGauge < hitCost) return false;
        p.guardGauge = Math.max(0, p.guardGauge - hitCost);
        p.guardRegenDelayTimer = Math.max(p.guardRegenDelayTimer, this.num(rt.playerData.Guard_Regen_Delay, 0.2));
        const reboundSpeed = Math.max(0, this.num(slash.data.Guard_Rebound_Speed, 180));
        const reboundDistance = Math.max(0, this.num(slash.data.Guard_Rebound_Distance, 24));
        slash.vy = -reboundSpeed;
        slash.y = Math.max((rt.virtual || this.VIRTUAL).spawnY, (slash.y || 0) - reboundDistance);
        slash.guardCooldown = 0.16;
        slash.guardFlashTimer = 0.22;
        p.guardContactTimer = 0.18;
        p.guardFlashTimer = Math.max(p.guardFlashTimer, 0.20);
        const guardInfo = this.getSlashCenterInfo(slash);
        this.pushP2M3Effect(rt, 'guardRebound', guardInfo.lane, (slash.y || 0) + (slash.height || 0), {
            effectType: slash.data && slash.data.Hit_Effect_Type,
            lanes: guardInfo.lanes,
            size: slash.isGiant ? 1.45 : ((slash.lanes || []).length >= 2 ? 1.18 : 1),
            timer: 0.30,
            isGiant: slash.isGiant
        });
        // step216: 가드 반동 알림 텍스트 제거. 이펙트만 표시한다.
        return true;
    },

    resolveSlashImpact(gameState, rt, slash) {
        if (!slash || !slash.active) return;
        if (slash.isFinal) {
            this.finish(gameState, 'FAIL', rt.player.hasTemperedWill ? '최종 낙하 공격 대응 실패' : '연단된 칼날의 의지 없음');
            return;
        }
        const damage = Math.max(1, this.num(slash.data.Slash_Damage, 1));
        rt.player.hp = Math.max(0, rt.player.hp - damage);
        rt.player.damageFlashTimer = 0.28;
        const impactInfo = this.getSlashCenterInfo(slash);
        this.pushP2M3Effect(rt, 'floorImpact', impactInfo.lane, (rt.virtual || this.VIRTUAL).floorY, {
            effectType: slash.data && slash.data.Break_Effect_Type,
            lanes: impactInfo.lanes,
            size: slash.isGiant ? 1.55 : ((slash.lanes || []).length >= 2 ? 1.2 : 1),
            timer: 0.34,
            isGiant: slash.isGiant
        });
        slash.active = false;
        // step216: 방어 실패 과정 텍스트 제거. 바닥 충격/피해 이펙트만 표시한다.
        if (rt.player.hp <= 0) {
            this.finish(gameState, 'FAIL', '차원 방어전 HP 0');
        }
    },

    playerRangeInfo(rt, kind) {
        const p = rt.player;
        const data = rt.playerData || {};
        const tileKey = kind === 'guard' ? 'Guard_Range_Tile' : 'ATK_Range_Tile';
        const yKey = kind === 'guard' ? 'Guard_Range_Y' : 'ATK_Range_Y';
        return {
            laneRange: Math.max(1, Math.floor(this.num(data[tileKey], 1))),
            yRange: Math.max(20, this.num(data[yKey], 100)),
            bottomY: (p && p.y !== undefined ? p.y : this.VIRTUAL.playerGroundY) + 22,
            topY: (p && p.y !== undefined ? p.y : this.VIRTUAL.playerGroundY) - Math.max(20, this.num(data[yKey], 100))
        };
    },

    laneInRange(playerLane, targetLane, tileRange) {
        const radius = Math.max(0, Math.floor((Math.max(1, tileRange) - 1) / 2));
        return Math.abs((parseInt(targetLane) || 0) - (parseInt(playerLane) || 0)) <= radius;
    },

    isSlashInPlayerRange(rt, slash, lane, kind) {
        if (!slash || !slash.active || slash.state !== 'FALLING') return false;
        if (!slash.lanes || !slash.lanes.some(l => this.laneInRange(lane, l, this.playerRangeInfo(rt, kind).laneRange))) return false;
        const range = this.playerRangeInfo(rt, kind);
        const top = slash.y || 0;
        const bottom = top + (slash.height || 0);
        return bottom >= range.topY && top <= range.bottomY;
    },

    findTargetSlash(rt, lane, kind = 'attack') {
        const candidates = rt.activeSlashes
            .filter(s => s && s.active && s.state === 'FALLING' && this.isSlashInPlayerRange(rt, s, lane, kind))
            .sort((a, b) => ((b.y || 0) + (b.height || 0)) - ((a.y || 0) + (a.height || 0)));
        return candidates[0] || null;
    },

    playerAttack(gameState, rt) {
        const target = this.findTargetSlash(rt, rt.player.lane, 'attack');
        if (!target) return false;
        this.pushP2M3Effect(rt, 'attackArc', rt.player.lane, rt.player.y || this.VIRTUAL.playerGroundY, { timer: 0.16, size: 1 });
        if (target.isFinal) {
            if (rt.player.hasTemperedWill) {
                this.finish(gameState, 'PERFECT_SUCCESS', '최종 낙하 공격 받아치기 성공');
                return true;
            }
            return false;
        }
        if (!this.bool(target.data.Can_Attack_Destroy)) return false;
        this.damageSlash(gameState, rt, target, rt.player.lane, Math.max(1, this.num(rt.playerData.ATK, 1)), 'ATTACK');
        return true;
    },

    playerSkill(gameState, rt) {
        if (!rt || !rt.player) return false;
        if (!Array.isArray(rt.skillWaves)) rt.skillWaves = [];
        const p = rt.player;
        const data = rt.playerData || {};
        const range = Math.max(1, Math.floor(this.num(data.Skill_Range_Tile, 3)));
        const height = Math.max(120, this.num(data.Skill_Wave_Height, 150));
        const speed = Math.max(700, this.num(data.Skill_Wave_Speed, 1380));
        rt.skillWaves.push({
            uid: rt.skillWaveSeq++,
            active: true,
            lanes: range >= 3 ? [0, 1, 2] : [p.lane],
            y: (p.y || this.VIRTUAL.playerGroundY) - 18,
            prevY: (p.y || this.VIRTUAL.playerGroundY) - 18,
            vy: -speed,
            height,
            widthTile: range,
            life: Math.max(0.28, this.num(data.Skill_Wave_Life, 0.62)),
            maxLife: Math.max(0.28, this.num(data.Skill_Wave_Life, 0.62)),
            hitMap: {},
            castLane: p.lane
        });
        // step216: A스킬 사용 알림 텍스트 제거. 진행형 웨이브 이펙트만 표시한다.
        return true;
    },

    updateSkillWaves(gameState, rt, dt) {
        if (!rt || !Array.isArray(rt.skillWaves)) return;
        for (const wave of rt.skillWaves) {
            if (!wave || !wave.active) continue;
            wave.life -= dt;
            wave.prevY = wave.y;
            wave.y += (wave.vy || 0) * dt;
            const waveTop = Math.min(wave.y, wave.prevY) - (wave.height || 120);
            const waveBottom = Math.max(wave.y, wave.prevY) + 24;
            for (const slash of (rt.activeSlashes || [])) {
                if (!slash || !slash.active || slash.isFinal || slash.state === 'WARNING') continue;
                if (wave.hitMap && wave.hitMap[slash.uid]) continue;
                const lanes = slash.lanes || [1];
                const laneHit = lanes.some(l => (wave.lanes || []).includes(l));
                if (!laneHit) continue;
                const slashTop = slash.y || 0;
                const slashBottom = slashTop + (slash.height || 0);
                if (slashBottom < waveTop || slashTop > waveBottom) continue;
                if (wave.hitMap) wave.hitMap[slash.uid] = true;
                const resultType = String(slash.data.Skill_Result_Type || '').trim().toUpperCase();
                const canHit = this.bool(slash.data.Can_Skill_Hit) || resultType === 'DAMAGE';
                if (!canHit) continue;
                const info = this.getSlashCenterInfo(slash);
                this.pushP2M3Effect(rt, 'skillWaveHit', info.lane, info.y, {
                    effectType: slash.data && slash.data.Hit_Effect_Type,
                    lanes: info.lanes,
                    size: slash.isGiant ? 1.25 : ((slash.lanes || []).length >= 2 ? 1.10 : 1),
                    timer: 0.22,
                    isGiant: slash.isGiant
                });
                if (resultType === 'DESTROY') {
                    this.destroySlash(gameState, rt, slash, 'SKILL');
                } else if (resultType === 'DAMAGE') {
                    const dmg = Math.max(0, this.num(slash.data.From_Skill_Damage, 1));
                    if (dmg > 0) this.damageSlash(gameState, rt, slash, rt.player.lane, dmg, 'SKILL');
                }
            }
            if (wave.life <= 0 || wave.y + (wave.height || 120) < (rt.virtual || this.VIRTUAL).warningTopY) {
                wave.active = false;
            }
        }
        rt.skillWaves = rt.skillWaves.filter(w => w && w.active);
    },

    damageSlash(gameState, rt, slash, lane, amount, source) {
        if (!slash || !slash.active) return;
        const cond = String(slash.data.Destroy_Condition_Type || '').trim().toUpperCase();
        const dmg = Math.max(0, amount || 0);
        slash.hitFlashTimer = 0.12;
        const hitInfo = this.getSlashCenterInfo(slash);
        this.pushP2M3Effect(rt, 'slashHit', hitInfo.lane, hitInfo.y, {
            effectType: slash.data && slash.data.Hit_Effect_Type,
            lanes: hitInfo.lanes,
            size: slash.isGiant ? 1.35 : ((slash.lanes || []).length >= 2 ? 1.12 : 1),
            timer: 0.24,
            isGiant: slash.isGiant
        });
        if (cond === 'PER_LANE_HIT_COUNT') {
            const laneTargets = (source === 'SKILL') ? (slash.lanes || []) : [lane];
            for (const targetLane of laneTargets) {
                if (slash.laneHp && slash.laneHp[targetLane] !== undefined) {
                    slash.laneHp[targetLane] = Math.max(0, (parseFloat(slash.laneHp[targetLane]) || 0) - dmg);
                }
            }
            const remain = Object.values(slash.laneHp || {}).reduce((sum, v) => sum + Math.max(0, parseFloat(v) || 0), 0);
            if (remain <= 0) this.destroySlash(gameState, rt, slash, source);
            return;
        }
        slash.hp = Math.max(0, (parseFloat(slash.hp) || 0) - dmg);
        if (slash.hp <= 0) this.destroySlash(gameState, rt, slash, source);
    },

    destroySlash(gameState, rt, slash, source) {
        if (!slash || !slash.active) return;
        const breakInfo = this.getSlashCenterInfo(slash);
        this.pushP2M3Effect(rt, 'slashBreak', breakInfo.lane, breakInfo.y, {
            effectType: slash.data && slash.data.Break_Effect_Type,
            lanes: breakInfo.lanes,
            size: slash.isGiant ? 1.8 : ((slash.lanes || []).length >= 2 ? 1.3 : 1),
            timer: slash.isGiant ? 0.55 : 0.34,
            isGiant: slash.isGiant
        });
        slash.active = false;
        slash.breakFlashTimer = 0.2;
        if (slash.isGiant || String(slash.data.Slash_Destroy_Effect_Type || '').trim().toUpperCase() === 'PLAYER_GET_SPECIAL_ENERGY') {
            rt.player.hasTemperedWill = true;
            // step216: 연단 상태는 플레이어 이펙트와 하단 HUD로 표시한다.
            rt.message = '';
            rt.messageTimer = 0;
            // step216: 연단 획득 시스템 알림도 제거하고 하단 HUD/이펙트로만 표시한다.
        } else {
            // step216: 검기 파괴 알림 텍스트 제거. 파괴 이펙트와 HP 게이지 변화만 표시한다.
        }
    },

    update(gameState, dt) {
        const rt = gameState && gameState.p2m3DefenseRuntime;
        if (!rt || !rt.active) return;
        // 전용 모드 안에서는 기존 플레이어 피격 전체 화면 플래시가 HUD와 화면을 덮지 않도록 차단한다.
        if (gameState) gameState.screenHitFlash = null;
        rt.timer += dt;
        rt.messageTimer = Math.max(0, (rt.messageTimer || 0) - dt);
        if (rt.phase === 'INTRO') {
            rt.introTime -= dt;
            const introMax = Math.max(0.01, parseFloat(rt.introMaxTime) || 0.65);
            const introRatio = Math.max(0, Math.min(1, 1 - (rt.introTime / introMax)));
            const p = rt.player || {};
            p.isGuarding = false;
            p.attackCooldown = 0;
            p.attackFlashTimer = 0;
            p.guardFlashTimer = 0;
            p.guardContactTimer = 0;
            p.skillFlashTimer = 0;
            if (rt.isPatternLinked) {
                const v = rt.virtual || this.VIRTUAL;
                const ease = (x) => Math.max(0, Math.min(1, x)) * Math.max(0, Math.min(1, x)) * (3 - 2 * Math.max(0, Math.min(1, x)));
                // step215: 잘 동작하던 안정 흐름으로 단순화한다.
                // 전용 모드 진입 직후 짧은 낙하/착지/기상만 보여주고, UI/경계선/차원문/검기는 렌더러에서 숨긴다.
                if (introRatio < 0.62) {
                    const r = ease(introRatio / 0.62);
                    p.y = (v.spawnY - 205) + (v.playerGroundY - (v.spawnY - 205)) * r;
                    p.vy = 0;
                    p.grounded = false;
                    p.introPose = 'FIELD_FALL';
                    rt.introVisualPhase = 'SIMPLE_FALL';
                } else if (introRatio < 0.82) {
                    p.y = v.playerGroundY;
                    p.vy = 0;
                    p.grounded = true;
                    p.introPose = 'DOWN';
                    p.damageFlashTimer = Math.max(p.damageFlashTimer || 0, 0.08);
                    rt.introVisualPhase = 'LAND_DOWN';
                    if (!rt.introLandEffectFired) {
                        rt.introLandEffectFired = true;
                        this.pushP2M3Effect(rt, 'floorImpact', p.lane, v.floorY, { timer: 0.28, size: 1.08 });
                    }
                } else {
                    p.y = v.playerGroundY;
                    p.vy = 0;
                    p.grounded = true;
                    p.introPose = 'STAND_UP';
                    rt.introVisualPhase = 'STAND_UP';
                }
                // step216: 인트로 과정 텍스트 제거. 낙하/착지/기상 애니메이션만 표시한다.
            }
            this.updateP2M3Effects(rt, dt);
            if (rt.introTime <= 0) {
                p.y = (rt.virtual || this.VIRTUAL).playerGroundY;
                p.vy = 0;
                p.grounded = true;
                p.introPose = null;
                rt.phase = 'WAVE';
                rt.waveIndex = -1;
                rt.waveState = null;
                this.startNextWave(rt);
            }
            rt.inputPrev = { ...(gameState.keys || {}) };
            return;
        }
        if (rt.phase === 'ENDING') {
            rt.endingTimer -= dt;
            if (rt.endingTimer <= 0) this.completeEnd(gameState);
            return;
        }

        this.handleInput(gameState, rt, dt);
        this.updateSkillWaves(gameState, rt, dt);
        this.updateSlashes(gameState, rt, dt);
        this.updateP2M3Effects(rt, dt);
        if (!this.isActive(gameState)) return;
        this.updateWave(gameState, rt, dt);
    },

    finish(gameState, result, reason) {
        const rt = gameState && gameState.p2m3DefenseRuntime;
        if (!rt || !rt.active || rt.phase === 'ENDING') return;
        rt.phase = 'ENDING';
        rt.result = result;
        rt.resultReason = reason || '';
        // 결과 확정 직후 바로 복귀하지 않고, 차원 붕괴/복귀 연출 시간을 둔다.
        rt.endingTimer = result === 'PERFECT_SUCCESS' ? 2.15 : (result === 'GUARD_SUCCESS' ? 1.75 : 1.45);
        rt.outroMaxTime = rt.endingTimer;
        rt.outroFlashFired = false;
        rt.activeSlashes = [];
        rt.skillWaves = [];
        rt.message = result === 'PERFECT_SUCCESS' ? '완전 파훼!' : (result === 'GUARD_SUCCESS' ? '일반 파훼!' : '패턴 실패');
        rt.messageTimer = 1.0;
        rt.resultMessage = true;
    },

    forceEnd(gameState, reason = 'CANCEL') {
        const rt = gameState && gameState.p2m3DefenseRuntime;
        if (!rt) return false;
        rt.result = reason;
        rt.resultReason = '테스트 강제 종료';
        this.restoreSnapshots(gameState, rt);
        gameState.specialMode = null;
        gameState.p2m3DefenseRuntime = null;
        gameState.p2m3IntroRuntime = null;
        const linkedBoss = rt && rt.boss ? rt.boss : this.getBoss(gameState);
        if (linkedBoss && linkedBoss.boss) linkedBoss.boss.p2m3ExclusiveModeStarted = false;
        try { pushSystemNotice('차원 방어전 테스트 종료', '#bbbbbb', 1.0); } catch (e) {}
        return true;
    },

    completeEnd(gameState) {
        const rt = gameState && gameState.p2m3DefenseRuntime;
        if (!rt) return;
        const result = String(rt.result || '').toUpperCase();
        this.restoreSnapshots(gameState, rt);
        gameState.specialMode = null;
        gameState.p2m3DefenseRuntime = null;
        gameState.p2m3IntroRuntime = null;
        const linkedBoss = rt && rt.boss ? rt.boss : this.getBoss(gameState);
        if (rt && rt.isPatternLinked && linkedBoss && linkedBoss.boss) {
            linkedBoss.boss.activePattern = null;
            linkedBoss.boss.action = null;
            linkedBoss.boss.currentActionIndex = -1;
            linkedBoss.boss.lateOpeningPatternStarted = true;
            linkedBoss.boss.lateOpeningPatternUsed = true;
            linkedBoss.boss.pendingLateOpeningPatternId = null;
            linkedBoss.boss.p2m3ExclusiveModeStarted = false;
            linkedBoss.boss.noPatternWaitTimer = Math.max(linkedBoss.boss.noPatternWaitTimer || 0, 0.8);
        }
        if (result === 'PERFECT_SUCCESS' || result === 'GUARD_SUCCESS') {
            this.applyBossGroggy(gameState, result === 'PERFECT_SUCCESS' ? this.num(rt.playerData.Perfect_Groggy_Time, 8) : this.num(rt.playerData.Normal_Groggy_Time, 5), result === 'PERFECT_SUCCESS');
        } else if (result === 'FAIL') {
            this.applyPlayerFailDamage(gameState, rt);
            try { pushSystemNotice('차원 방어전 실패', '#ff8d8d', 1.2); } catch (e) {}
        }
    },

    restoreSnapshots(gameState, rt) {
        const p = gameState && gameState.player;
        if (p && rt && rt.snapshot) {
            p.x = rt.snapshot.playerX;
            p.y = rt.snapshot.playerY;
            p.z = 0;
            p.vz = 0;
            p.state = rt.snapshot.playerState === 'Die' ? 'Idle' : (rt.snapshot.playerState || 'Idle');
            p.prevState = 'Idle';
            p.isGrounded = true;
            p.kbVx = 0;
            p.kbVy = 0;
            p.atkTimer = 0;
            p.guardTimer = 0;
        }
        const boss = rt && rt.boss ? rt.boss : this.getBoss(gameState);
        if (boss && rt && rt.snapshot) {
            boss.x = rt.snapshot.bossX;
            boss.y = rt.snapshot.bossY;
            boss.z = 0;
            boss.kbVx = 0;
            boss.kbVy = 0;
            boss.vz = 0;
            boss.state = 'IDLE';
            boss.timer = 0;
            boss.active = true;
            if (boss.boss) {
                boss.boss.activePattern = null;
                boss.boss.action = null;
                boss.boss.currentActionIndex = -1;
                boss.boss.p2m3ExclusiveModeStarted = false;
                boss.boss.noPatternWaitTimer = Math.max(boss.boss.noPatternWaitTimer || 0, 0.6);
            }
        }
    },

    applyBossGroggy(gameState, groggyTime, perfect) {
        const boss = this.getBoss(gameState);
        if (!boss || !boss.boss) return false;
        const time = Math.max(0.2, this.num(groggyTime, perfect ? 8 : 5));
        boss.state = 'GROGGY';
        boss.timer = 0;
        boss.hasFired = false;
        boss.kbVx = 0;
        boss.kbVy = 0;
        boss.boss.activePattern = null;
        boss.boss.action = null;
        boss.boss.currentActionIndex = -1;
        boss.boss.groggyTimer = time;
        boss.boss.groggyMaxTime = time;
        boss.boss.groggyPoseType = 'POSE_KASIYAS_P2_GROGGY';
        boss.boss.groggyHitDmgRate = 1.2;
        boss.boss.noPatternWaitTimer = Math.max(boss.boss.noPatternWaitTimer || 0, time);
        if (Array.isArray(gameState.floatingTexts)) {
            const bodyZ = ((boss.d && boss.d.bodyZ) || 170) * (boss.scale || 1);
            gameState.floatingTexts.push({ x: boss.x, y: boss.y, z: boss.z + bodyZ + 42, text: perfect ? '완전 파훼!' : '일반 파훼!', color: perfect ? '#86f4ff' : '#ffe45c', size: '30px', timer: 1.0 });
            gameState.floatingTexts.push({ x: boss.x, y: boss.y, z: boss.z + bodyZ + 12, text: '카시야스 그로기', color: '#ffb84a', size: '22px', timer: 1.0 });
        }
        try { pushSystemNotice(perfect ? '완전 파훼! 카시야스 그로기' : '일반 파훼! 카시야스 그로기', perfect ? '#86f4ff' : '#ffe45c', 1.1); } catch (e) {}
        return true;
    },

    applyPlayerFailDamage(gameState, rt) {
        const boss = rt && rt.boss ? rt.boss : this.getBoss(gameState);
        const p = gameState && gameState.player;
        const maxHp = p ? Math.max(1, parseFloat(p.maxHp || p.hp) || 300) : 300;
        const damage = Math.max(80, Math.round(maxHp * 0.35));
        if (typeof PlayerManager !== 'undefined' && PlayerManager && typeof PlayerManager.takeDamage === 'function') {
            PlayerManager.takeDamage(gameState, damage, boss ? boss.x : (p ? p.x : 0), boss ? boss.y : (p ? p.y : 0), null, 0, 0, null);
        } else if (p) {
            p.hp = Math.max(0, (parseFloat(p.hp) || 0) - damage);
        }
    }
};

window.P2M3DimensionDefenseSystem = P2M3DimensionDefenseSystem;
