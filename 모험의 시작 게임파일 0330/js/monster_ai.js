// ==========================================
// [모험의 시작] 몬스터 AI 모듈 (monster_ai.js)
// ==========================================

const MonsterAI = {
    normalizePrevPatternAlias: function(v) {
        v = String(v || '').trim();
        if (!v) return [];
        const alias = {
            'HIT': ['P_Hit'],
            'BOUNDARY': ['P_Boundary'],
            'IDLE': ['P_Idle'],
            'PATROL': ['P_Patrol'],
            'CHASE': ['P_Chase'],
            'SPAWN': ['P_Spawn'],
            'DIE': ['P_Die'],
            'EVADE': ['P_Evade'],
            'PATTERN_ATK': ['P_ATK', 'P_Melee_ATK', 'P_Range_ATK'],
            'ATK_MELEE': ['P_ATK', 'P_Melee_ATK'],
            'ATK_PROJECTILE': ['P_ATK', 'P_Range_ATK']
        };
        return alias[v] || [v];
    },

    prevPatternMatches: function(prevState, condValue) {
        let values = String(condValue || '').split('|').map(s => s.trim()).filter(Boolean);
        for (let v of values) {
            let candidates = this.normalizePrevPatternAlias(v);
            if (candidates.includes(prevState)) return true;
        }
        return false;
    },

    resolveRangeValue: function(rawValue, target, m, gameState) {
        let v = String(rawValue || '').trim();
        switch (v) {
            case 'REF_ATK_RANGE': return m.d.atkRange || 0;
            case 'REF_CHASE_RANGE': return m.d.chase || 0;
            case 'REF_RECOG_RANGE': return m.d.recog || 0;
            case 'REF_UNRECOG_RANGE': return m.d.unrecog || 0;
            case 'REF_EVADE_RANGE': return m.d.evade || 0;
            case 'REF_SKILL_USE_RANGE': {
                let skillId = target ? String(target).split('|')[0].trim() : '';
                let skill = gameState.DB_SKILL[skillId];
                return skill ? (parseFloat(skill.Skill_Use_Range) || 0) : 0;
            }
            default: {
                let n = parseFloat(v);
                return isNaN(n) ? 0 : n;
            }
        }
    },

    changeState: function(m, newState, gameState) {
        if (newState === 'P_ATK') {
            newState = String(m.d.atkType).toLowerCase() === 'range' ? 'P_Range_ATK' : 'P_Melee_ATK';
        }

        if (m.forcePrevState) { m.prevState = m.forcePrevState; m.forcePrevState = null; } else { m.prevState = m.state; }

        if (m.state === newState) { m.patternCount++; } else { m.patternCount = 1; }
        m.state = newState; m.timer = 0; m.hasFired = false;

        if (newState === 'P_Patrol') {
            let angle = Math.random() * Math.PI * 2;
            m.dirX = Math.cos(angle);
            m.dirY = Math.sin(angle);
            m.faceDir = m.dirX > 0 ? 1 : -1;
        }
        if (newState === 'P_Boundary') {
            m.pacingDir = Math.random() > 0.5 ? 1 : -1;
            m.pacingAngle = (Math.random() * (Math.PI / 4)) + (Math.PI / 4);
        }
        if (newState === 'P_Melee_ATK') m.nextHitTime = m.d.hitStart;

        if (gameState.DB_SKILL[newState]) {
            MonsterSkill.castSkill(m, newState, gameState);
        }
    },

    getAnimDuration: function(m, gameState) {
        if (m.state === 'P_Idle') return m.d.idleDur;
        if (m.state === 'P_Patrol') return m.d.patrolDur + m.d.patrolStandby;
        if (m.state === 'P_Boundary') return m.d.boundDur + m.d.boundStandby;
        if (m.state === 'P_Evade') return m.d.evadeDur;
        if (m.state === 'P_Range_ATK' || m.state === 'P_Melee_ATK' || m.state === 'P_ATK') return m.d.atkDur;
        if (m.state === 'P_Hit') return m.d.hitDur;
        if (m.state === 'P_Spawn') return 1.0;
        if (gameState.DB_SKILL[m.state]) return parseFloat(gameState.DB_SKILL[m.state].Skill_Anim_Duration) || 1.0;
        return 1.0;
    },

    checkFSM: function(m, distX, distY, dist2D, gameState) {
        if (m.state === 'P_Evade' && m.timer < 0.7) return false;
        if (gameState.DB_SKILL[m.state] && m.timer < parseFloat(gameState.DB_SKILL[m.state].Skill_Anim_Duration)) return false;

        let aiTypes = String(m.d.aiType).split(',').map(s => s.trim()).filter(Boolean);
        let rules = [];
        aiTypes.forEach(ai => { if (gameState.DB_PATTERN[ai] && gameState.DB_PATTERN[ai]['*']) rules.push(gameState.DB_PATTERN[ai]['*']); });
        aiTypes.forEach(ai => {
            if (gameState.DB_PATTERN[ai] && gameState.DB_PATTERN[ai][m.state]) rules.push(gameState.DB_PATTERN[ai][m.state]);
            if ((m.state === 'P_Melee_ATK' || m.state === 'P_Range_ATK') && gameState.DB_PATTERN[ai] && gameState.DB_PATTERN[ai]['P_ATK']) rules.push(gameState.DB_PATTERN[ai]['P_ATK']);
        });

        for (let rule of rules) {
            for (let i = 1; i <= 9; i++) {
                let type = rule['Pattern_Cond_' + i + '_Type'];
                let value = rule['Pattern_Cond_' + i + '_Value'];
                let exType = rule['Pattern_Cond_' + i + '_Extra_Type'];
                let exVal = rule['Pattern_Cond_' + i + '_Extra_Value'];
                let ex2Type = rule['Pattern_Cond_' + i + '_Extra_2_Type'];
                let ex2Val = rule['Pattern_Cond_' + i + '_Extra_2_Value'];
                let target = rule['Pattern_Cond_' + i + '_To_Pattern'];

                if ((type || exType || ex2Type) && target) {
                    if (this.evalCond(m, distX, distY, dist2D, type, value, exType, exVal, ex2Type, ex2Val, target, gameState)) {
                        let patterns = String(target).split('|').map(s => s.trim()).filter(Boolean);
                        let nextPat = patterns[0];

                        if (patterns.length > 1) {
                            let totalWeight = 0;
                            let weightedList = [];
                            patterns.forEach(pat => {
                                let actualPat = (pat === 'P_ATK') ? (String(m.d.atkType).toLowerCase() === 'range' ? 'P_Range_ATK' : 'P_Melee_ATK') : pat;
                                let weight = 1;
                                let ruleData = null;
                                for (let ai of aiTypes) {
                                    if (gameState.DB_PATTERN[ai] && gameState.DB_PATTERN[ai][actualPat]) { ruleData = gameState.DB_PATTERN[ai][actualPat]; break; }
                                    if (gameState.DB_PATTERN[ai] && gameState.DB_PATTERN[ai][pat]) { ruleData = gameState.DB_PATTERN[ai][pat]; break; }
                                }
                                if (ruleData) {
                                    weight = parseFloat(ruleData.Random_Weight) || 1;
                                    let rLimit = parseInt(ruleData.Repeat_Limit);
                                    if (!isNaN(rLimit) && m.state === actualPat && m.patternCount >= rLimit) weight = 0;
                                }
                                if (weight > 0) {
                                    totalWeight += weight;
                                    weightedList.push({ name: actualPat, weight: weight });
                                }
                            });

                            if (totalWeight <= 0) nextPat = 'P_Idle';
                            else {
                                let rand = Math.random() * totalWeight;
                                for (let wp of weightedList) {
                                    if (rand < wp.weight) { nextPat = wp.name; break; }
                                    rand -= wp.weight;
                                }
                            }
                        }

                        if (nextPat === 'P_ATK') nextPat = String(m.d.atkType).toLowerCase() === 'range' ? 'P_Range_ATK' : 'P_Melee_ATK';

                        if (m.state === nextPat && type !== 'Anim_Time_Out' && type !== 'ANIM_TIME_OUT') continue;
                        this.changeState(m, nextPat, gameState);
                        return true;
                    }
                }
            }
        }

        if (m.timer >= this.getAnimDuration(m, gameState)) {
            this.changeState(m, 'P_Idle', gameState);
            return true;
        }

        return false;
    },

    evalCond: function(m, distX, distY, dist2D, type, value, exType, exVal, ex2Type, ex2Val, target, gameState) {
        let isTrue = true;
        if (type) {
            switch (type) {
                case 'HP_0_Under': isTrue = (m.hp <= 0); break;
                case 'Enemy_In_Evade_Range': isTrue = (m.d.evade > 0 && dist2D <= m.d.evade); break;
                case 'Enemy_Out_Evade_Range': isTrue = (dist2D > m.d.evade); break;
                case 'Enemy_In_ATK_Range': isTrue = (distX <= m.d.atkRange && distY <= 30); break;
                case 'Enemy_In_Chase_Range': isTrue = (dist2D <= m.d.chase); break;
                case 'Enemy_In_Recog_Range': isTrue = (dist2D <= m.d.recog); break;
                case 'Enemy_In_UnRecog_Range': isTrue = (dist2D <= m.d.unrecog); break;
                case 'Enemy_Out_Recog_Range': isTrue = (dist2D > m.d.recog); break;
                case 'Enemy_Out_UnRecog_Range': isTrue = (dist2D > m.d.unrecog); break;
                case 'Enemy_In_Skill_Use_Range': {
                    let skillId = target ? target.split('|')[0].trim() : '';
                    let skill = gameState.DB_SKILL[skillId];
                    isTrue = skill ? (dist2D <= parseFloat(skill.Skill_Use_Range)) : false;
                    break;
                }
                case 'Anim_Time_Out': isTrue = (m.timer >= this.getAnimDuration(m, gameState)); break;

                case 'HP_UNDER': isTrue = (m.hp <= (parseFloat(value) || 0)); break;
                case 'HIT_BY_ENEMY': isTrue = (m.state === 'P_Hit'); break;
                case 'ANIM_TIME_OUT': isTrue = (m.timer >= this.getAnimDuration(m, gameState)); break;
                case 'COND_ENEMY_IN_RANGE': {
                    let range = this.resolveRangeValue(value, target, m, gameState);
                    if (String(value || '').trim() === 'REF_ATK_RANGE') isTrue = (distX <= range && distY <= 30);
                    else isTrue = (dist2D <= range);
                    break;
                }
                case 'COND_PREV_PATTERN': isTrue = this.prevPatternMatches(m.prevState, value); break;
                default: isTrue = false;
            }
        }

        let checkEx = (extType, extVal) => {
            if (!extType) return true;
            if (extType === 'Aggressive_True') return (String(m.d.aggressive).toLowerCase() === 'true');
            if (extType === 'Previous_Pattern') return this.prevPatternMatches(m.prevState, extVal);
            if (extType === 'COND_PREV_PATTERN') return this.prevPatternMatches(m.prevState, extVal);
            if (extType === 'Skill_No_Cooltime') return !(m.skillCooldowns && m.skillCooldowns[target ? target.split('|')[0].trim() : ''] > 0);
            if (extType === 'COND_SKILL_READY') return !(m.skillCooldowns && m.skillCooldowns[target ? target.split('|')[0].trim() : ''] > 0);
            if (extType === 'HP_Under_70%') return ((m.hp / m.maxHp) <= 0.7);
            if (extType === 'HP_Under_50%') return ((m.hp / m.maxHp) <= 0.5);
            if (extType === 'HP_Under_30%') return ((m.hp / m.maxHp) <= 0.3);
            if (extType === 'HP_UNDER') {
                let hpPercent = parseFloat(extVal);
                if (isNaN(hpPercent)) return false;
                return ((m.hp / m.maxHp) * 100 <= hpPercent);
            }
            return true;
        };

        if (isTrue) isTrue = checkEx(exType, exVal);
        if (isTrue) isTrue = checkEx(ex2Type, ex2Val);
        return isTrue;
    }
};