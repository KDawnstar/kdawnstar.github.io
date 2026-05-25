// [카시야스 보스전] 몬스터/보스 스폰 시스템 (monster_spawn_system.js)
// ==========================================
// MonsterManager에서 분리한 런타임 엔티티 생성/스폰 담당 모듈입니다.
// 기존 호출 안정성을 위해 MonsterManager wrapper를 통해 호출됩니다.

const MonsterSpawnSystem = {
    activateSpawner: function(id, gameState) {
        try { if (document.activeElement) document.activeElement.blur(); } catch(e) {} 
        const d = gameState.DB_MONSTER[id]; 
        
        if (!d || (!gameState.isTestMode && gameState.player.level < d.spawnReqLv)) return; 

        let currentAlive = gameState.monsters.filter(m => m.active && m.id === id).length;
        if (currentAlive >= d.spawnLimit) return;

        const monsterGrade = String(d.grade || '').trim().toUpperCase();
        const isBoss = monsterGrade.includes('BOSS') || String(id || '').startsWith('B');

        gameState.spawners = [];
        if (isBoss) {
            this.spawnInstant(id, gameState);
            return;
        }
        
        gameState.spawners.push({ id: id, d: d, limit: d.spawnLimit, interval: d.spawnInterval, respawnTime: d.respawnTime, maxRespawn: d.maxRespawn, 
            spawnedCount: currentAlive,
            deadCount: 0, timer: d.spawnInterval, respawning: 0, respawnTimers: [],
            spawnOne: function() {
                if (this.maxRespawn !== -1 && this.spawnedCount >= this.maxRespawn) return;
                
                let alive = gameState.monsters.filter(m => m.active && m.id === this.id).length;
                if (alive >= this.limit) return;
                
                this.spawnedCount++; 
                let cx = this.d.cx !== "" ? parseFloat(this.d.cx) : gameState.player.x; 
                let cy = this.d.cy !== "" ? parseFloat(this.d.cy) : gameState.WORLD_DEPTH/2;
                let rx = this.d.rx || 0; let ry = this.d.ry || 50; 
                let isChamp = Math.random() < this.d.championProb; 
                let mScale = isChamp ? this.d.scale * this.d.championScaleRate : this.d.scale; 
                let mMaxHp = isChamp ? this.d.hp * this.d.championHpRate : this.d.hp;
                
                let initCd = {};
                if (gameState.DB_SKILL) {
                    for (let sId in gameState.DB_SKILL) {
                        let initTime = parseFloat(gameState.DB_SKILL[sId].Skill_Initial_Cooltime) || 0;
                        if (initTime > 0) initCd[sId] = initTime;
                    }
                }

                gameState.monsters.push({
                id: this.id,
                d: this.d,
                active: true,
                spawner: this,
                isChampion: isChamp,
                scale: mScale,
                x: cx + (Math.random() * 2 - 1) * rx,
                y: cy + (Math.random() * 2 - 1) * ry,
                z: 300,
                vz: 0,
                isGrounded: false,
                hp: mMaxHp,
                maxHp: mMaxHp,
                state: 'SPAWN',
                prevState: 'NONE',
                forcePrevState: null,
                timer: 0,
                deadTimer: 0,
                dirX: 0,
                dirY: 0,
                faceDir: 1,
                pacingDir: 1,
                pacingAngle: 0,
                nextHitTime: 0,
                kbVx: 0,
                kbVy: 0,
                hitByEnemyTimer: 0,
                lastHitSourceX: null,
                lastHitSourceY: null,
                lastHitDirX: 0,
                lastHitDirY: 0,
                hasFired: false,
                isDeadProcessed: false,
                skillCooldowns: initCd,
                patternCount: 0,
                isProvoked: !!this.d.aggressive,
                boss: MonsterManager.createBossRuntimeForMonster(this.d, gameState)
            });
            }
        });
    },

    spawnInstant: function(id, gameState) {
        try { if (document.activeElement) document.activeElement.blur(); } catch(e) {}
        const d = gameState.DB_MONSTER[id]; 
        
        if (!d || (!gameState.isTestMode && gameState.player.level < d.spawnReqLv)) return;
        
        let currentAlive = gameState.monsters.filter(m => m.active && m.id === id).length;
        if (currentAlive >= d.spawnLimit) return;

        let cx = d.cx !== "" ? parseFloat(d.cx) : gameState.player.x; let cy = d.cy !== "" ? parseFloat(d.cy) : gameState.WORLD_DEPTH/2;
        let rx = d.rx || 0; let ry = d.ry || 50; 
        let isChamp = Math.random() < d.championProb; 
        let mScale = isChamp ? d.scale * d.championScaleRate : d.scale; 
        let mMaxHp = isChamp ? d.hp * d.championHpRate : d.hp;

        let initCd = {};
        if (gameState.DB_SKILL) {
            for (let sId in gameState.DB_SKILL) {
                let initTime = parseFloat(gameState.DB_SKILL[sId].Skill_Initial_Cooltime) || 0;
                if (initTime > 0) initCd[sId] = initTime;
            }
        }

        gameState.monsters.push({
            id: id,
            d: d,
            active: true,
            spawner: null,
            isChampion: isChamp,
            scale: mScale,
            x: cx + (Math.random() * 2 - 1) * rx,
            y: cy + (Math.random() * 2 - 1) * ry,
            z: 300,
            vz: 0,
            isGrounded: false,
            hp: mMaxHp,
            maxHp: mMaxHp,
            state: 'SPAWN',
            prevState: 'NONE',
            forcePrevState: null,
            timer: 0,
            deadTimer: 0,
            dirX: 0,
            dirY: 0,
            faceDir: 1,
            pacingDir: 1,
            pacingAngle: 0,
            nextHitTime: 0,
            kbVx: 0,
            kbVy: 0,
            hitByEnemyTimer: 0,
            lastHitSourceX: null,
            lastHitSourceY: null,
            lastHitDirX: 0,
            lastHitDirY: 0,
            hasFired: false,
            isDeadProcessed: false,
            skillCooldowns: initCd,
            patternCount: 0,
            isProvoked: !!d.aggressive,
            boss: this.createBossRuntimeForMonster(d, gameState)
        });
    },

};
