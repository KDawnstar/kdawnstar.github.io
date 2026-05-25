// boss_position_system.js
// 보스 전투에서 사용하는 거리, 방향, 경로, 맵 위치 계산 전담 시스템.
// 실제 전투 흐름은 담당하지 않고, 위치/기하 계산과 관련된 보조 함수만 담당한다.

const BossPositionSystem = {
    resolveProjectileRenderType: function(projectileEnum) {
        return String(projectileEnum || '').trim();
    },
    getStageRangeYScale: function(gameState) {
        const width = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1);
        const depth = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 1);

        const correctedScale = (depth / width) * 1.5;
        return Math.max(0.35, Math.min(0.6, correctedScale));
    },
    calcWeightedRangeDistance: function(distX, distY, gameState) {
        const xGap = Math.max(0, parseFloat(distX) || 0);
        const yGap = Math.max(0, parseFloat(distY) || 0);
        const yScale = this.getStageRangeYScale(gameState);

        return Math.sqrt((xGap * xGap) + ((yGap * yScale) * (yGap * yScale)));
    },
    normalizePatternMoveDirection: function(value) {
        const raw = String(value || '').trim().toUpperCase();
        if (!raw) return 'NONE';

        switch (raw) {
            case 'MOVE_RANDOM':
                return 'MOVE_RANDOM';

            case 'CHASE_ENEMY':
                return 'CHASE_ENEMY';

            case 'OPPOSITE_HIT':
                return 'OPPOSITE_HIT';

            case 'KITING_X':
            case 'KITTING_X':
                return 'KITING_X';

            case 'NONE':
            default:
                return 'NONE';
        }
    },
    normalizePatternGaze: function(value) {
        const raw = String(value || '').trim().toUpperCase();
        if (!raw) return 'NONE';

        switch (raw) {
            case 'GAZE_MOVE_DIREC':
                return 'GAZE_MOVE_DIREC';

            case 'GAZE_LOOK_ENEMY':
                return 'GAZE_LOOK_ENEMY';

            case 'GAZE_HIT_DIREC':
                return 'GAZE_HIT_DIREC';

            case 'NONE':
            default:
                return 'NONE';
        }
    },
    getPatternMoveDirectionValue: function(m, gameState) {
        const patternRow = MonsterAI.getActivePatternRow(m, gameState);
        return this.normalizePatternMoveDirection(patternRow ? patternRow.Move_Direction : 'NONE');
    },
    getPatternGazeValue: function(m, gameState) {
        const patternRow = MonsterAI.getActivePatternRow(m, gameState);
        return this.normalizePatternGaze(patternRow ? patternRow.Monster_Gaze : 'NONE');
    },
    resolvePatternMoveVector: function(m, moveDirection, dx, dy, gameState) {
        const result = { dirX: 0, dirY: 0 };

        switch (this.normalizePatternMoveDirection(moveDirection)) {
            case 'MOVE_RANDOM': {
                result.dirX = m.dirX || 0;
                result.dirY = m.dirY || 0;
                return result;
            }

            case 'CHASE_ENEMY': {
                let moveX = 0;
                let moveY = 0;

                if (Math.abs(dy) > 20) moveY = Math.sign(dy);
                if (Math.abs(dx) > m.d.atkRange * 0.5) moveX = Math.sign(dx);

                const len = Math.sqrt(moveX * moveX + moveY * moveY);
                if (len > 0) {
                    result.dirX = moveX / len;
                    result.dirY = moveY / len;
                }

                return result;
            }

            case 'OPPOSITE_HIT': {
                let moveX = Math.sign(m.lastHitDirX || 0);
                let moveY = Math.sign(m.lastHitDirY || 0);

                const len = Math.sqrt(moveX * moveX + moveY * moveY);
                if (len > 0) {
                    result.dirX = moveX / len;
                    result.dirY = moveY / len;
                }

                return result;
            }

            case 'KITING_X': {
                let moveX = 0;
                let moveY = 0;

                if (Math.abs(dx) > 10) {
                    moveX = -Math.sign(dx);
                }

                if (Math.abs(dy) > 20) {
                    moveY = Math.sign(dy);
                }

                const len = Math.sqrt(moveX * moveX + moveY * moveY);
                if (len > 0) {
                    result.dirX = moveX / len;
                    result.dirY = moveY / len;
                }

                return result;
            }

            case 'NONE':
            default:
                return result;
        }
    },
    resolvePatternFaceDir: function(m, gazeValue, dx) {
        switch (this.normalizePatternGaze(gazeValue)) {
            case 'GAZE_MOVE_DIREC':
                if (Math.abs(m.dirX) > 0.001) {
                    return m.dirX > 0 ? 1 : -1;
                }
                return m.faceDir || 1;

            case 'GAZE_LOOK_ENEMY':
                if (Math.abs(dx) > 0.001) {
                    return dx > 0 ? 1 : -1;
                }
                return m.faceDir || 1;

            case 'GAZE_HIT_DIREC': {
                const hitDx = (m.lastHitSourceX != null) ? (m.lastHitSourceX - m.x) : 0;
                if (Math.abs(hitDx) > 0.001) {
                    return hitDx > 0 ? 1 : -1;
                }
                return m.faceDir || 1;
            }

            case 'NONE':
            default:
                return m.faceDir || 1;
        }
    },
    getPathLength: function(path) {
        if (!path) return 0;
        const dx = (path.endX || 0) - (path.startX || 0);
        const dy = (path.endY || 0) - (path.startY || 0);
        return Math.sqrt(dx * dx + dy * dy) || 0;
    },
    computeDashPathToMapEdge: function(m, gameState) {
        const sx = parseFloat(m.x) || 0;
        const sy = parseFloat(m.y) || 0;
        const px = gameState.player ? (parseFloat(gameState.player.x) || sx + (m.faceDir || 1)) : sx + (m.faceDir || 1);
        const py = gameState.player ? (parseFloat(gameState.player.y) || sy) : sy;

        let dx = px - sx;
        let dy = py - sy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= len;
        dy /= len;

        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) dx = m.faceDir === -1 ? -1 : 1;

        const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400);
        const candidates = [];

        if (dx > 0.001) candidates.push((worldW - sx) / dx);
        else if (dx < -0.001) candidates.push((0 - sx) / dx);

        if (dy > 0.001) candidates.push((worldD - sy) / dy);
        else if (dy < -0.001) candidates.push((0 - sy) / dy);

        let t = candidates.filter(v => isFinite(v) && v > 0).sort((a, b) => a - b)[0];
        if (!isFinite(t) || t <= 0) t = 300;

        const ex = Math.max(0, Math.min(worldW, sx + dx * t));
        const ey = Math.max(0, Math.min(worldD, sy + dy * t));

        return {
            startX: sx,
            startY: sy,
            startZ: parseFloat(m.z) || 0,
            endX: ex,
            endY: ey,
            endZ: parseFloat(m.z) || 0,
            dirX: dx,
            dirY: dy,
            length: Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2) || 0
        };
    },
    getBossDiagonalCornerPositions: function(gameState, m) {
        const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        const bodyX = m && m.d ? (parseFloat(m.d.bodyX) || 80) * (parseFloat(m.scale) || 1) : 80;
        const bodyY = m && m.d ? (parseFloat(m.d.bodyY) || 60) * (parseFloat(m.scale) || 1) : 60;
        const marginX = Math.max(95, bodyX * 1.35);
        const marginY = Math.max(55, bodyY * 1.05);

        return {
            LEFT_TOP: { x: marginX, y: marginY },
            RIGHT_TOP: { x: worldW - marginX, y: marginY },
            RIGHT_BOTTOM: { x: worldW - marginX, y: worldD - marginY },
            LEFT_BOTTOM: { x: marginX, y: worldD - marginY }
        };
    },
    getOppositeDiagonalCornerKey: function(key) {
        const k = String(key || '').trim().toUpperCase();
        const map = {
            LEFT_TOP: 'RIGHT_BOTTOM',
            RIGHT_BOTTOM: 'LEFT_TOP',
            RIGHT_TOP: 'LEFT_BOTTOM',
            LEFT_BOTTOM: 'RIGHT_TOP'
        };
        return map[k] || 'RIGHT_BOTTOM';
    },
    pickBossRandomDiagonalCornerKey: function() {
        const list = ['LEFT_TOP', 'RIGHT_TOP', 'RIGHT_BOTTOM', 'LEFT_BOTTOM'];
        return list[Math.floor(Math.random() * list.length)] || 'LEFT_TOP';
    },
    getDiagonalPairKeyByCorner: function(key) {
        const k = String(key || '').trim().toUpperCase();
        if (k === 'LEFT_TOP' || k === 'RIGHT_BOTTOM') return 'PAIR_A';
        if (k === 'RIGHT_TOP' || k === 'LEFT_BOTTOM') return 'PAIR_B';
        return 'PAIR_A';
    },
    getDiagonalPairCorners: function(pairKey) {
        return String(pairKey || '').trim().toUpperCase() === 'PAIR_B'
            ? ['RIGHT_TOP', 'LEFT_BOTTOM']
            : ['LEFT_TOP', 'RIGHT_BOTTOM'];
    },
    chooseRandomFromList: function(list) {
        const arr = Array.isArray(list) && list.length ? list : ['LEFT_TOP'];
        return arr[Math.floor(Math.random() * arr.length)] || arr[0];
    },
    preparePattern4DiagonalRuntime: function(boss, firstCornerKey) {
        if (!boss) return;
        const first = String(firstCornerKey || boss.currentDiagonalCorner || boss.lastDiagonalCorner || '').trim().toUpperCase() || this.pickBossRandomDiagonalCornerKey();
        const firstPair = this.getDiagonalPairKeyByCorner(first);
        const secondPair = firstPair === 'PAIR_A' ? 'PAIR_B' : 'PAIR_A';
        const secondOwnerCorner = this.chooseRandomFromList(this.getDiagonalPairCorners(secondPair));
        const secondCloneCorner = this.getOppositeDiagonalCornerKey(secondOwnerCorner);
        boss.pattern4Runtime = {
            firstOwnerCorner: first,
            firstCloneCorner: this.getOppositeDiagonalCornerKey(first),
            firstPair: firstPair,
            secondPair: secondPair,
            secondOwnerCorner: secondOwnerCorner,
            secondCloneCorner: secondCloneCorner
        };
        boss.nextDiagonalOwnerCorner = secondOwnerCorner;
        boss.nextDiagonalCloneCorner = secondCloneCorner;
    },
    getBossPatternNextAttackAction: function(m, startIndex = null) {
        const boss = m && m.boss ? m.boss : null;
        const pattern = boss && boss.activePattern ? boss.activePattern : null;
        const actions = pattern && Array.isArray(pattern.Runtime_Actions) ? pattern.Runtime_Actions : [];
        const start = startIndex === null ? ((boss && boss.currentActionIndex != null ? boss.currentActionIndex : -1) + 1) : startIndex;
        for (let i = start; i < actions.length; i++) {
            const action = actions[i];
            const cond = String(action && action.Action_Condition_Type || '').trim().toUpperCase();
            if ((cond === 'LATE_PHASE' || cond === 'LATE_PHASE_START') && !(boss && boss.isLatePhase)) continue;
            if (String(action && action.Action_Type || '').trim().toUpperCase() === 'ATK') return action;
        }
        return null;
    },
    resolveBossPathForAction: function(m, action, gameState, mode = 'current') {
        const boss = m.boss;
        if (!boss) return null;

        const source = String((action && action.Hitbox_Path_Source) || '').trim().toUpperCase();
        if (source === 'LAST_DASH_PATH') return boss.lastDashPath;
        if (source === 'CURRENT_DASH_PATH') return boss.currentDashPath;
        if (source === 'PREVIEW_DASH_PATH') return boss.previewDashPath;

        if (mode === 'preview') return boss.previewDashPath;
        if (mode === 'last') return boss.lastDashPath;
        return boss.currentDashPath;
    },
};
