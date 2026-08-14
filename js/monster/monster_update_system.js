// [카시야스 보스전] 몬스터/보스 전체 업데이트 시스템 (monster_update_system.js)
// ==========================================
// MonsterManager.update의 실제 런타임 갱신 로직을 담당합니다.
// 기존 호출 안정성을 위해 MonsterManager.update wrapper에서 apply(this, arguments)로 호출됩니다.

const MonsterUpdateSystem = {
    update: function(deltaTime, gameState) {
        // P3_M3 대화 중에는 분신 AI/보스 패턴/전용 오브젝트 타이머를 멈춘다.
        if (typeof P3M3FinalIssenSystem !== 'undefined' && P3M3FinalIssenSystem.isDialogueActive && P3M3FinalIssenSystem.isDialogueActive(gameState)) {
            return;
        }

        this.updateBossAttackObjects(deltaTime, gameState);

        if (gameState.isAutoSpawn) {
            for (let s of gameState.spawners) {
                for(let i=s.respawnTimers.length-1; i>=0; i--) { s.respawnTimers[i] -= deltaTime; if(s.respawnTimers[i] <= 0) { s.respawnTimers.splice(i, 1); s.respawning--; s.spawnOne(); } }
                let active = s.spawnedCount - s.deadCount - s.respawning;
                if (active < s.limit && (s.maxRespawn === -1 || s.spawnedCount < s.maxRespawn) && s.respawning === 0) { s.timer += deltaTime; if (s.timer >= s.interval) { s.timer = 0; s.spawnOne(); } }
            }
        }

        for (let i = gameState.monsters.length - 1; i >= 0; i--) {
            let m = gameState.monsters[i]; if (!m.active) continue;
            const d = m.d; m.timer += deltaTime;
            const getStateKey = () => MonsterAI.resolveRuntimeState(m.state, gameState, m);
            const getPatternTypeKey = () => MonsterAI.getPatternTypeKey(m.state, gameState, m);

            const isState = (...states) => {
                const key = getPatternTypeKey();
                return states.some(s => MonsterAI.getPatternTypeKey(s, gameState, m) === key);
            };

            const isSkillState = () => !!gameState.DB_SKILL[m.state];
            const isAttackState = () => {
                const key = getPatternTypeKey();
                return key === 'ATK' || key === 'ATK_MELEE' || key === 'ATK_PROJECTILE';
            };

            if (m.skillCooldowns) {
                for (let k in m.skillCooldowns) {
                    if (m.skillCooldowns[k] > 0) m.skillCooldowns[k] -= deltaTime;
                }
            }

            if (m.hitByEnemyTimer > 0) {
                m.hitByEnemyTimer -= deltaTime;
                if (m.hitByEnemyTimer < 0) m.hitByEnemyTimer = 0;
            }

            m.vz -= gameState.GRAVITY * deltaTime; m.z += m.vz * deltaTime; if (m.z <= 0) { m.z = 0; m.vz = 0; m.isGrounded = true; }

            let distX = Math.abs(gameState.player.x - m.x) - (gameState.player.bodyX * gameState.player.scale / 2) - (d.bodyX * m.scale / 2);
            let distY = Math.abs(gameState.player.y - m.y);
            let dist2D = (gameState.player.hp > 0)
                ? getDistance2D(gameState.player.x, gameState.player.y, m.x, m.y) - (gameState.player.bodyX * gameState.player.scale / 2) - (d.bodyX * m.scale / 2)
                : 999999;
            let weightedDist2D = (gameState.player.hp > 0)
                ? this.calcWeightedRangeDistance(distX, distY, gameState)
                : 999999;

            const isAggressive = !!d.aggressive;
            const isPlayerDetectable = gameState.player.hp > 0 && gameState.player.state !== 'Freeze';
            const canEngage = isPlayerDetectable && (isAggressive || !!m.isProvoked);

            if (!isPlayerDetectable) {
                m.isProvoked = false;
            }

            const aiDistX = canEngage ? distX : 999999;
            const aiDistY = canEngage ? distY : 999999;
            const aiDist2D = canEngage ? weightedDist2D : 999999;

            if (typeof P3M3FinalIssenSystem !== 'undefined' && P3M3FinalIssenSystem.handleMonsterUpdate && P3M3FinalIssenSystem.handleMonsterUpdate(m, deltaTime, gameState)) {
                const marginX = d.bodyX * m.scale / 2;
                m.x = Math.max(marginX, Math.min(gameState.WORLD_WIDTH - marginX, m.x));
                m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
                continue;
            }

            if (this.isBossPatternMonster(m)) {
                this.updateBossPatternMonster(m, deltaTime, distX, distY, weightedDist2D, gameState);

                const marginX = d.bodyX * m.scale / 2;
                m.x = Math.max(marginX, Math.min(gameState.WORLD_WIDTH - marginX, m.x));
                m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
                continue;
            }

            // 비선공 몬스터는 전투가 완전히 풀리고 플레이어가 멀어지면 다시 비선공 대기 상태로 복귀
            if (
                !isAggressive &&
                m.isProvoked &&
                weightedDist2D > d.unrecog &&
                !['CHASE', 'BOUNDARY', 'ATK', 'ATK_MELEE', 'ATK_PROJECTILE'].includes(
                    MonsterAI.getPatternTypeKey(m.state, gameState, m)
                ) &&
                !gameState.DB_SKILL[m.state]
            ) {
                m.isProvoked = false;
            }

            if (m.hp <= 0 && !m.isDeadProcessed) {
                const diePriorityRule = MonsterAI.getPriorityStateRule(m, 'DIE', gameState);
                const canEnterDieState = diePriorityRule
                    ? MonsterAI.canEnterPriorityState(m, 'DIE', gameState)
                    : true;

                if (canEnterDieState) {
                    m.isDeadProcessed = true;
                    MonsterAI.changeState(m, 'DIE', gameState);
                    if (gameState.targetUI.monster === m) gameState.targetUI.timer = 1.5;
                    let gainExp = m.isChampion ? d.exp * d.championExpRate : d.exp;
                    gameState.player.exp += gainExp;
                    gameState.floatingTexts.push({
                        x: m.x,
                        y: m.y,
                        z: m.z + d.bodyZ * m.scale + 20,
                        text: `+${gainExp} EXP`,
                        color: m.isChampion ? "#e74c3c" : "#2ecc71",
                        size: "24px",
                        timer: 1.0
                    });
                    PlayerManager.checkLevelUp(gameState);
                }
            }

            if (m.hp > 0) {
                MonsterAI.checkFSM(m, aiDistX, aiDistY, aiDist2D, gameState);

                if (isAttackState() && m.timer >= m.d.atkDur) {
                    const playerAlive = gameState.player.hp > 0;
                    const outOfAttackRange = (distX > m.d.atkRange || distY > 30);

                    if (playerAlive && outOfAttackRange) {
                        m.forcePrevState = m.state;
                        MonsterAI.changeState(m, 'CHASE', gameState);
                    } else {
                        MonsterAI.changeState(m, 'IDLE', gameState);
                    }
                }
                else if (isSkillState() && m.timer >= (parseFloat(gameState.DB_SKILL[m.state].Skill_Anim_Duration) || 1.0)) {
                    MonsterAI.changeState(m, 'IDLE', gameState);
                }
            }

            let dx = gameState.player.x - m.x; let dy = gameState.player.y - m.y; let angleToPlayer = Math.atan2(dy, dx);

                        if (gameState.player.state === 'Freeze') {
                m.dirX = 0;
                m.dirY = 0;
            } else {
                const targetDx = isPlayerDetectable ? dx : 0;
                const targetDy = isPlayerDetectable ? dy : 0;
                const targetAngleToPlayer = isPlayerDetectable ? Math.atan2(targetDy, targetDx) : 0;
                const inRecog = canEngage && weightedDist2D <= d.recog;
                const isAttacking = isAttackState() || isSkillState();

                if (!isAttacking) {
                    let moveDirection = this.getPatternMoveDirectionValue(m, gameState);
                    let gazeValue = this.getPatternGazeValue(m, gameState);

                    if (isState('CHASE')) {
                        if (moveDirection === 'NONE') moveDirection = 'CHASE_ENEMY';
                        if (gazeValue === 'NONE') gazeValue = 'GAZE_LOOK_ENEMY';

                        const moveVec = this.resolvePatternMoveVector(m, moveDirection, targetDx, targetDy, gameState);
                        m.dirX = moveVec.dirX;
                        m.dirY = moveVec.dirY;
                        m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                    } else if (isState('EVADE')) {
                        if (gazeValue === 'NONE') gazeValue = 'GAZE_LOOK_ENEMY';

                        const moveVec = this.resolvePatternMoveVector(m, moveDirection, targetDx, targetDy, gameState);
                        m.dirX = moveVec.dirX;
                        m.dirY = moveVec.dirY;
                        m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                    } else if (isState('BOUNDARY')) {
                        if (gazeValue === 'NONE') gazeValue = isPlayerDetectable ? 'GAZE_LOOK_ENEMY' : 'GAZE_MOVE_DIREC';

                        if (m.timer < d.boundDur) {
                            let strafeAngle = targetAngleToPlayer + m.pacingAngle * m.pacingDir;
                            m.dirX = Math.cos(strafeAngle);
                            m.dirY = Math.sin(strafeAngle);
                        } else {
                            m.dirX = 0;
                            m.dirY = 0;
                        }

                        m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                    } else if (isState('PATROL')) {
                        if (moveDirection === 'NONE') moveDirection = 'MOVE_RANDOM';
                        if (gazeValue === 'NONE') gazeValue = 'GAZE_MOVE_DIREC';

                        if (m.timer < d.patrolDur) {
                            const moveVec = this.resolvePatternMoveVector(m, moveDirection, targetDx, targetDy, gameState);
                            m.dirX = moveVec.dirX;
                            m.dirY = moveVec.dirY;
                            m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                        } else {
                            m.dirX = 0;
                            m.dirY = 0;
                        }
                    } else if (isState('IDLE')) {
                        if (moveDirection === 'NONE') {
                            m.dirX = 0;
                            m.dirY = 0;
                        } else {
                            const moveVec = this.resolvePatternMoveVector(m, moveDirection, targetDx, targetDy, gameState);
                            m.dirX = moveVec.dirX;
                            m.dirY = moveVec.dirY;
                        }

                        if (inRecog) {
                            if (gazeValue === 'NONE') gazeValue = 'GAZE_LOOK_ENEMY';
                            m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                        } else if (!isPlayerDetectable && gazeValue === 'GAZE_MOVE_DIREC') {
                            m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                        }
                    } else if (isState('HIT')) {
                        if (gazeValue === 'GAZE_HIT_DIREC') {
                            m.faceDir = this.resolvePatternFaceDir(m, gazeValue, targetDx);
                        }
                    }
                }
            }
            
            if (isState('DIE')) {
                m.deadTimer += deltaTime; 
                if (m.deadTimer >= (d.dieDur + d.corpseTime)) { 
                    m.active = false; if (m.spawner) { m.spawner.deadCount++; if (m.spawner.respawnTime > 0) { m.spawner.respawning++; m.spawner.respawnTimers.push(m.spawner.respawnTime); } }
                }
            } else if (!isSkillState()) {
                switch (getPatternTypeKey()) {
                    case 'PATROL':
                        m.x += m.dirX * d.speed * d.patrolSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.patrolSpd * 0.7 * deltaTime;
                        break;

                    case 'BOUNDARY':
                        m.x += m.dirX * d.speed * d.boundSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.boundSpd * 0.7 * deltaTime;
                        break;

                    case 'CHASE':
                        m.x += m.dirX * d.speed * d.chaseSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.chaseSpd * 0.7 * deltaTime;
                        break;

                    case 'EVADE':
                        m.x += m.dirX * d.speed * d.evadeSpd * deltaTime;
                        m.y += m.dirY * d.speed * d.evadeSpd * 0.7 * deltaTime;
                        break;

                    case 'ATK_PROJECTILE':
                        if (m.timer >= d.hitStart && !m.hasFired) {
                            const playerAlive = gameState.player.hp > 0;
                            const px = gameState.player.x;
                            const py = gameState.player.y;

                            const currentDistX =
                                Math.abs(px - m.x) -
                                (gameState.player.bodyX * gameState.player.scale / 2) -
                                (d.bodyX * m.scale / 2);

                            const currentDistY = Math.abs(py - m.y);

                            const allowedX = Math.max((parseFloat(d.atkRange) || 0) * 1.15, (parseFloat(d.atkRange) || 0) + 20);
                            const allowedY = Math.max(50, ((parseFloat(d.hitY) || 30) * m.scale) + 20);

                            if (!playerAlive || currentDistX > allowedX || currentDistY > allowedY) {
                                m.forcePrevState = m.state;
                                MonsterAI.changeState(m, 'CHASE', gameState);
                                break;
                            }

                            m.faceDir = px >= m.x ? 1 : -1;
                            m.hasFired = true;

                            let atkDmg = m.isChampion ? d.atk * d.championAtkRate : d.atk;
                            let projectileRenderType = this.resolveProjectileRenderType(d.atkProjectileRenderType);

                            gameState.projectiles.push({
                                isPlayer: false,
                                x: m.x,
                                y: m.y,
                                z: m.z + (d.bodyZ * m.scale) / 2,
                                vx: m.faceDir * d.projSpeed,
                                vy: 0,
                                vz: 0,
                                life: d.projLife,
                                atk: atkDmg * d.atkDmgRate,
                                hitX: d.hitX * m.scale,
                                hitY: d.hitY * m.scale,
                                hitZ: d.hitZ * m.scale,
                                penetrate: String(d.projPenetrate).toLowerCase() === 'true',
                                hasHit: false,
                                projName: '',
                                renderType: projectileRenderType,
                                hitTargets: new Set(),
                                statusType: null,
                                statusDur: 0,
                                statusProb: 0,
                                attackerLevel: m.d.level
                            });
                        }
                        break;

                    case 'ATK':
                    case 'ATK_MELEE':
                        if (m.timer >= m.nextHitTime && m.timer <= d.hitEnd) {
                            let atkW = d.hitX * m.scale; let atkD = d.hitY * m.scale; let atkH = d.hitZ * m.scale;
                            let atkX = m.x + (m.faceDir === 1 ? atkW/2 : -atkW/2); let atkY = m.y; let atkZ = m.z;
                            gameState.hitboxes.push({ x: atkX, y: atkY, z: atkZ, w: atkW, d: atkD, h: atkH, life: 0.1 });

                            this.pushMonsterAtkEffect(m, atkX, atkY, atkZ, atkW, atkH, gameState);
                            
                            let p = gameState.player; let pW = p.bodyX * p.scale; let pD = p.bodyY * p.scale; let pH = p.bodyZ * p.scale;
                            if (checkAABB3D(atkX, atkY, atkZ, atkW, atkD, atkH, p.x, p.y, p.z, pW, pD, pH)) {
                                let atkDmg = m.isChampion ? d.atk * d.championAtkRate : d.atk;
                                PlayerManager.takeDamage(gameState, calcScaledDamage(m.d.level, p.level, atkDmg * d.atkDmgRate), m.x, m.y, null, 0, 0); 
                                if (d.atkCycle > 0) m.nextHitTime += d.atkCycle; else m.nextHitTime = 999; 
                            }
                        }
                        break;

                    case 'HIT':
                        m.x += (m.kbVx||0) * deltaTime;
                        m.y += (m.kbVy||0) * deltaTime;
                        break; 
                }
                const marginX = d.bodyX * m.scale / 2;
                if (m.x <= marginX || m.x >= gameState.WORLD_WIDTH - marginX) { m.dirX *= -1; m.kbVx *= -1; m.faceDir = m.dirX > 0 ? 1 : -1;}
                m.x = Math.max(marginX, Math.min(gameState.WORLD_WIDTH - marginX, m.x)); m.y = Math.max(0, Math.min(gameState.WORLD_DEPTH, m.y));
            }
        }
    
    }
};
