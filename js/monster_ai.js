// ==========================================
// [모험의 시작] 몬스터 AI 모듈 (monster_ai.js)
// ==========================================

const MonsterAI = {
    normalizePrevPatternAlias: function(v) {
        v = String(v || '').trim();
        if (!v) return [];

        const alias = {
            'NONE': ['NONE'],

            'HIT': ['HIT', 'P_Hit'],
            'BOUNDARY': ['BOUNDARY', 'P_Boundary'],
            'IDLE': ['IDLE', 'P_Idle'],
            'PATROL': ['PATROL', 'P_Patrol'],
            'CHASE': ['CHASE', 'P_Chase'],
            'SPAWN': ['SPAWN', 'P_Spawn'],
            'DIE': ['DIE', 'P_Die'],
            'EVADE': ['EVADE', 'P_Evade'],

            'ATK': ['ATK', 'P_ATK', 'P_Melee_ATK', 'P_Range_ATK', 'P_ATK_Melee', 'P_ATK_Projectile'],
            'PATTERN_ATK': ['ATK', 'P_ATK', 'P_Melee_ATK', 'P_Range_ATK', 'P_ATK_Melee', 'P_ATK_Projectile'],
            'ATK_MELEE': ['ATK', 'ATK_MELEE', 'P_ATK', 'P_Melee_ATK', 'P_ATK_Melee'],
            'ATK_PROJECTILE': ['ATK', 'ATK_PROJECTILE', 'P_ATK', 'P_Range_ATK', 'P_ATK_Projectile']
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

    resolveSkillIdFromTarget: function(rawValue, target, gameState) {
        const candidates = [];

        const pushCandidate = (v) => {
            const s = String(v || '').trim();
            if (!s) return;
            s.split('|').map(x => x.trim()).filter(Boolean).forEach(x => candidates.push(x));
        };

        pushCandidate(rawValue);
        pushCandidate(target);

        for (const candidate of candidates) {
            if (gameState.DB_SKILL && gameState.DB_SKILL[candidate]) {
                return candidate;
            }
        }

        return '';
    },

    resolveRangeValue: function(rawValue, target, m, gameState) {
        let v = String(rawValue || '').trim();

        switch (v) {
            case 'REF_ATK_RANGE':
                return m.d.atkRange || 0;

            case 'REF_CHASE_RANGE':
                return m.d.chase || 0;

            case 'REF_RECOG_RANGE':
                return m.d.recog || 0;

            case 'REF_UNRECOG_RANGE':
                return m.d.unrecog || 0;

            case 'REF_EVADE_RANGE':
                return m.d.evade || 0;

            case 'REF_SKILL_USE_RANGE': {
                const skillId = this.resolveSkillIdFromTarget('', target, gameState);
                const skill = skillId ? gameState.DB_SKILL[skillId] : null;
                return skill ? (parseFloat(skill.Skill_Use_Range) || 0) : 0;
            }

            default: {
                let n = parseFloat(v);
                return isNaN(n) ? 0 : n;
            }
        }
    },

        resolveRuntimeState: function(rawState, gameState, m) {
        const state = String(rawState || '').trim();
        if (!state) return '';

        if (gameState.DB_SKILL && gameState.DB_SKILL[state]) {
            return state;
        }

        const upper = state.toUpperCase();
        const atkType = String(m && m.d && m.d.atkType || '').trim().toLowerCase();

        switch (upper) {
            case '*':
                return '*';

            case 'SPAWN':
            case 'P_SPAWN':
                return 'P_Spawn';

            case 'IDLE':
            case 'P_IDLE':
                return 'P_Idle';

            case 'PATROL':
            case 'P_PATROL':
                return 'P_Patrol';

            case 'BOUNDARY':
            case 'P_BOUNDARY':
                return 'P_Boundary';

            case 'CHASE':
            case 'P_CHASE':
                return 'P_Chase';

            case 'HIT':
            case 'P_HIT':
                return 'P_Hit';

            case 'DIE':
            case 'P_DIE':
                return 'P_Die';

            case 'EVADE':
            case 'P_EVADE':
                return 'P_Evade';

            case 'ATK':
            case 'P_ATK':
                return atkType === 'range' ? 'P_Range_ATK' : 'P_Melee_ATK';

            case 'ATK_MELEE':
            case 'P_ATK_MELEE':
            case 'P_MELEE_ATK':
                return 'P_Melee_ATK';

            case 'ATK_PROJECTILE':
            case 'P_ATK_PROJECTILE':
            case 'P_RANGE_ATK':
                return 'P_Range_ATK';

            default:
                return state;
        }
    },

        getPatternTypeKey: function(state, gameState, m) {
        const runtimeState = this.resolveRuntimeState(state, gameState, m);
        const key = String(runtimeState || '').trim().toUpperCase();

        if (!key) return '';

        if (gameState.DB_SKILL && gameState.DB_SKILL[runtimeState]) {
            return runtimeState;
        }

        switch (key) {
            case 'P_SPAWN':
            case 'SPAWN':
                return 'SPAWN';

            case 'P_IDLE':
            case 'IDLE':
                return 'IDLE';

            case 'P_PATROL':
            case 'PATROL':
                return 'PATROL';

            case 'P_BOUNDARY':
            case 'BOUNDARY':
                return 'BOUNDARY';

            case 'P_CHASE':
            case 'CHASE':
                return 'CHASE';

            case 'P_HIT':
            case 'HIT':
                return 'HIT';

            case 'P_DIE':
            case 'DIE':
                return 'DIE';

            case 'P_EVADE':
            case 'EVADE':
                return 'EVADE';

            case 'P_MELEE_ATK':
            case 'ATK_MELEE':
                return 'ATK_MELEE';

            case 'P_RANGE_ATK':
            case 'ATK_PROJECTILE':
                return 'ATK_PROJECTILE';

            case 'ATK':
            case 'P_ATK':
                return 'ATK';

            default:
                return key;
        }
    },

        getRuleKeysForState: function(state, gameState, m) {
        const runtimeState = this.resolveRuntimeState(state, gameState, m);

        if (!runtimeState) return [];

        if (gameState.DB_SKILL && gameState.DB_SKILL[runtimeState]) {
            return [runtimeState];
        }

        switch (runtimeState) {
            case 'P_Spawn':
                return ['SPAWN', 'P_Spawn'];

            case 'P_Idle':
                return ['IDLE', 'P_Idle'];

            case 'P_Patrol':
                return ['PATROL', 'P_Patrol'];

            case 'P_Boundary':
                return ['BOUNDARY', 'P_Boundary'];

            case 'P_Chase':
                return ['CHASE', 'P_Chase'];

            case 'P_Hit':
                return ['HIT', 'P_Hit'];

            case 'P_Die':
                return ['DIE', 'P_Die'];

            case 'P_Evade':
                return ['EVADE', 'P_Evade'];

            case 'P_Melee_ATK':
                return ['ATK', 'ATK_MELEE', 'P_ATK_Melee', 'P_ATK', 'ATK_MELEE'];

            case 'P_Range_ATK':
                return ['ATK', 'ATK_PROJECTILE', 'P_ATK_Projectile', 'P_ATK', 'ATK_PROJECTILE'];

            default:
                return [runtimeState];
        }
    },

    getActivePatternRow: function(m, gameState) {
        const aiTypes = String(m.d.aiType || '').split(',').map(s => s.trim()).filter(Boolean);
        const runtimeState = this.resolveRuntimeState(m.state, gameState, m);
        const ruleKeys = this.getRuleKeysForState(runtimeState, gameState, m);

        for (let ai of aiTypes) {
            const bucket = gameState.DB_PATTERN[ai];
            if (!bucket) continue;

            for (let key of ruleKeys) {
                if (bucket[key]) {
                    return bucket[key];
                }
            }
        }

        return null;
    },

    changeState: function(m, newState, gameState) {
        newState = this.resolveRuntimeState(newState, gameState, m);

        if (m.forcePrevState) {
            m.prevState = m.forcePrevState;
            m.forcePrevState = null;
        } else {
            m.prevState = m.state;
        }

        if (m.state === newState) {
            m.patternCount++;
        } else {
            m.patternCount = 1;
        }

        m.state = newState;
        m.timer = 0;
        m.hasFired = false;

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

        if (newState === 'P_Melee_ATK') {
            m.nextHitTime = m.d.hitStart;
        }

        if (gameState.DB_SKILL && gameState.DB_SKILL[newState]) {
            MonsterSkill.castSkill(m, newState, gameState);
        }
    },

        getAnimDuration: function(m, gameState) {
        const runtimeState = this.resolveRuntimeState(m.state, gameState, m);
        const stateKey = String(runtimeState || '').trim().toUpperCase();

        if (stateKey === 'IDLE' || stateKey === 'P_IDLE') return m.d.idleDur;
        if (stateKey === 'PATROL' || stateKey === 'P_PATROL') return m.d.patrolDur + m.d.patrolStandby;
        if (stateKey === 'BOUNDARY' || stateKey === 'P_BOUNDARY') return m.d.boundDur + m.d.boundStandby;
        if (stateKey === 'EVADE' || stateKey === 'P_EVADE') return m.d.evadeDur;
        if (
            stateKey === 'ATK' ||
            stateKey === 'ATK_MELEE' ||
            stateKey === 'ATK_PROJECTILE' ||
            stateKey === 'P_MELEE_ATK' ||
            stateKey === 'P_RANGE_ATK'
        ) {
            return m.d.atkDur;
        }
        if (stateKey === 'HIT' || stateKey === 'P_HIT') return m.d.hitDur;
        if (stateKey === 'SPAWN' || stateKey === 'P_SPAWN') return 0.55;
        if (stateKey === 'DIE' || stateKey === 'P_DIE') return m.d.dieDur;

        if (gameState.DB_SKILL && gameState.DB_SKILL[runtimeState]) {
            return parseFloat(gameState.DB_SKILL[runtimeState].Skill_Anim_Duration) || 1.0;
        }

        return 1.0;
    },

        evaluateSingleCondition: function(m, distX, distY, dist2D, condType, condValue, target, gameState) {
        const type = String(condType || '').trim();
        const value = condValue;

        if (!type) return true;

        switch (type) {
            case 'HP_0_Under':
                return (m.hp <= 0);

            case 'Enemy_In_Evade_Range':
                return (m.d.evade > 0 && dist2D <= m.d.evade);

            case 'Enemy_Out_Evade_Range':
                return (dist2D > m.d.evade);

            case 'Enemy_In_ATK_Range':
                return (distX <= m.d.atkRange && distY <= 30);

            case 'Enemy_In_Chase_Range':
                return (dist2D <= m.d.chase);

            case 'Enemy_In_Recog_Range':
                return (dist2D <= m.d.recog);

            case 'Enemy_In_UnRecog_Range':
                return (dist2D <= m.d.unrecog);

            case 'Enemy_Out_Recog_Range':
                return (dist2D > m.d.recog);

            case 'Enemy_Out_UnRecog_Range':
                return (dist2D > m.d.unrecog);

            case 'Enemy_In_Skill_Use_Range': {
                const skillId = this.resolveSkillIdFromTarget(value, target, gameState);
                const skill = skillId ? gameState.DB_SKILL[skillId] : null;
                return skill ? (dist2D <= (parseFloat(skill.Skill_Use_Range) || 0)) : false;
            }

            case 'Anim_Time_Out':
            case 'ANIM_TIME_OUT':
                return (m.timer >= this.getAnimDuration(m, gameState));

            case 'HP_UNDER': {
                const hpPercent = parseFloat(value);
                if (isNaN(hpPercent)) return false;

                const maxHp = Math.max(1, parseFloat(m.maxHp) || 1);
                const currentHpRate = ((parseFloat(m.hp) || 0) / maxHp) * 100;
                return currentHpRate <= hpPercent;
            }

            case 'HIT_BY_ENEMY':
                return ((m.hitByEnemyTimer || 0) > 0) || (m.state === 'P_Hit');

            case 'COND_ENEMY_IN_RANGE': {
                const range = this.resolveRangeValue(value, target, m, gameState);
                if (String(value || '').trim() === 'REF_ATK_RANGE') {
                    return (distX <= range && distY <= 30);
                }
                return (dist2D <= range);
            }

            case 'COND_PREV_PATTERN':
            case 'Previous_Pattern':
                return this.prevPatternMatches(m.prevState, value);

            case 'COND_SKILL_READY':
            case 'Skill_No_Cooltime': {
                const skillId = this.resolveSkillIdFromTarget(value, target, gameState);
                if (!skillId) return false;
                return !(m.skillCooldowns && m.skillCooldowns[skillId] > 0);
            }

            case 'Aggressive_True':
                return (String(m.d.aggressive).toLowerCase() === 'true');

            case 'HP_Under_70%':
                return ((m.hp / Math.max(1, m.maxHp)) <= 0.7);

            case 'HP_Under_50%':
                return ((m.hp / Math.max(1, m.maxHp)) <= 0.5);

            case 'HP_Under_30%':
                return ((m.hp / Math.max(1, m.maxHp)) <= 0.3);

            default:
                return false;
        }
    },

    evalCond: function(m, distX, distY, dist2D, type, value, exType, exVal, ex2Type, ex2Val, target, gameState) {
        if (!this.evaluateSingleCondition(m, distX, distY, dist2D, type, value, target, gameState)) {
            return false;
        }

        if (!this.evaluateSingleCondition(m, distX, distY, dist2D, exType, exVal, target, gameState)) {
            return false;
        }

        if (!this.evaluateSingleCondition(m, distX, distY, dist2D, ex2Type, ex2Val, target, gameState)) {
            return false;
        }

        return true;
    },

    parseRuleFlag: function(value) {
        if (value === true || value === false) return value;

        const v = String(value || '').trim().toLowerCase();
        return v === 'true' || v === '1' || v === 'yes' || v === 'y';
    },

    getPriorityStateRule: function(m, state, gameState) {
        const aiTypes = String(m.d.aiType || '').split(',').map(s => s.trim()).filter(Boolean);
        const ruleKeys = this.getRuleKeysForState(state, gameState, m);

        for (let ai of aiTypes) {
            const bucket = gameState.DB_PATTERN[ai];
            if (!bucket) continue;

            for (let key of ruleKeys) {
                const rule = bucket[key];
                if (!rule) continue;
                if (this.parseRuleFlag(rule.Pattern_Absolutely_Priority)) {
                    return rule;
                }
            }
        }

        return null;
    },

    shouldIgnoreDefenceForPriorityState: function(m, state, gameState) {
        const rule = this.getPriorityStateRule(m, state, gameState);
        if (!rule) return false;

        return this.parseRuleFlag(rule.Pattern_Ignore_Defence_State);
    },

    canEnterPriorityState: function(m, state, gameState) {
        const rule = this.getPriorityStateRule(m, state, gameState);
        if (!rule) return true;

        if (this.parseRuleFlag(rule.Pattern_Ignore_Defence_State)) {
            return true;
        }

        const stateTypeKey = this.getPatternTypeKey(m.state, gameState, m);
        const isSuperArmor = (
            stateTypeKey === 'ATK' ||
            stateTypeKey === 'ATK_MELEE' ||
            stateTypeKey === 'ATK_PROJECTILE' ||
            !!gameState.DB_SKILL[m.state]
        ) && String(m.d.defType || '').toLowerCase() === 'superarmor';

        return !isSuperArmor;
    },

    checkFSM: function(m, distX, distY, dist2D, gameState) {
        const runtimeState = this.resolveRuntimeState(m.state, gameState, m);

        if (runtimeState === 'P_Evade' && m.timer < 0.7) return false;
        if (gameState.DB_SKILL && gameState.DB_SKILL[runtimeState] && m.timer < (parseFloat(gameState.DB_SKILL[runtimeState].Skill_Anim_Duration) || 0)) return false;

        let aiTypes = String(m.d.aiType).split(',').map(s => s.trim()).filter(Boolean);
        let rules = [];

        aiTypes.forEach(ai => {
            if (gameState.DB_PATTERN[ai] && gameState.DB_PATTERN[ai]['*']) {
                rules.push(gameState.DB_PATTERN[ai]['*']);
            }
        });

        aiTypes.forEach(ai => {
            if (!gameState.DB_PATTERN[ai]) return;

            const ruleKeys = this.getRuleKeysForState(runtimeState, gameState, m);
            for (let key of ruleKeys) {
                if (gameState.DB_PATTERN[ai][key]) {
                    rules.push(gameState.DB_PATTERN[ai][key]);
                }
            }
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
                                let actualPat = this.resolveRuntimeState(pat, gameState, m);
                                let weight = 1;
                                let ruleData = null;

                                for (let ai of aiTypes) {
                                    if (!gameState.DB_PATTERN[ai]) continue;

                                    const candidateKeys = this.getRuleKeysForState(actualPat, gameState, m);
                                    for (let key of candidateKeys) {
                                        if (gameState.DB_PATTERN[ai][key]) {
                                            ruleData = gameState.DB_PATTERN[ai][key];
                                            break;
                                        }
                                    }

                                    if (ruleData) break;
                                }

                                if (ruleData) {
                                    weight = parseFloat(ruleData.Random_Weight);
                                    if (isNaN(weight) || weight <= 0) weight = 1;

                                    let rLimit = parseInt(ruleData.Repeat_Limit);
                                    if (!isNaN(rLimit) && runtimeState === actualPat && m.patternCount >= rLimit) {
                                        weight = 0;
                                    }
                                }

                                if (weight > 0) {
                                    totalWeight += weight;
                                    weightedList.push({ name: actualPat, weight: weight });
                                }
                            });

                            if (totalWeight <= 0) {
                                nextPat = 'IDLE';
                            } else {
                                let rand = Math.random() * totalWeight;
                                for (let wp of weightedList) {
                                    if (rand < wp.weight) {
                                        nextPat = wp.name;
                                        break;
                                    }
                                    rand -= wp.weight;
                                }
                            }
                        } else {
                            nextPat = this.resolveRuntimeState(nextPat, gameState, m);
                        }

                        if (runtimeState === nextPat && type !== 'Anim_Time_Out' && type !== 'ANIM_TIME_OUT') {
                            continue;
                        }

                        this.changeState(m, nextPat, gameState);
                        return true;
                    }
                }
            }
        }

        if (m.timer >= this.getAnimDuration(m, gameState)) {
            this.changeState(m, 'IDLE', gameState);
            return true;
        }

        return false;
    }
};