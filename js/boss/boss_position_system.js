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
    isBossFixedMapPlaceType: function(placeType) {
        const key = String(placeType || '').trim().toUpperCase();
        return [
            'PLACE_MAP_CENTER','MAP_CENTER','CENTER','PLACE_MAP_CENTER_AIR','MAP_CENTER_AIR','CENTER_AIR',
            'PLACE_MAP_EAST','MAP_EAST','EAST','PLACE_MAP_EDGE_EAST','MAP_EDGE_EAST','EDGE_EAST','PLACE_MAP_RIGHT_AIR','MAP_RIGHT_AIR','RIGHT_AIR','PLACE_MAP_LEFT_AIR','MAP_LEFT_AIR','LEFT_AIR','PLACE_MAP_WEST','MAP_WEST','WEST','PLACE_MAP_TOP_CENTER','MAP_TOP_CENTER','TOP_CENTER',
            'PLACE_MAP_TOP_RIGHT','MAP_TOP_RIGHT','TOP_RIGHT','PLACE_MAP_BOTTOM_LEFT','MAP_BOTTOM_LEFT','BOTTOM_LEFT',
            'PLACE_MAP_NE','MAP_NE','NE','PLACE_MAP_SE','MAP_SE','SE','PLACE_MAP_SW','MAP_SW','SW','PLACE_MAP_NW','MAP_NW','NW',
            'PLACE_MAP_EDGE_NE','MAP_EDGE_NE','EDGE_NE','PLACE_MAP_EDGE_SE','MAP_EDGE_SE','EDGE_SE','PLACE_MAP_EDGE_SW','MAP_EDGE_SW','EDGE_SW','PLACE_MAP_EDGE_NW','MAP_EDGE_NW','EDGE_NW',
            'PLACE_MAP_INNER_NE','MAP_INNER_NE','INNER_NE','PLACE_MAP_INNER_SE','MAP_INNER_SE','INNER_SE','PLACE_MAP_INNER_SW','MAP_INNER_SW','INNER_SW','PLACE_MAP_INNER_NW','MAP_INNER_NW','INNER_NW'
        ].includes(key);
    },
    normalizeBossFixedMapPlaceType: function(placeType) {
        const key = String(placeType || '').trim().toUpperCase();
        if (key === 'TOP_CENTER' || key === 'MAP_TOP_CENTER') return 'PLACE_MAP_TOP_CENTER';
        if (key === 'TOP_RIGHT' || key === 'MAP_TOP_RIGHT') return 'PLACE_MAP_TOP_RIGHT';
        if (key === 'BOTTOM_LEFT' || key === 'MAP_BOTTOM_LEFT') return 'PLACE_MAP_BOTTOM_LEFT';
        if (key === 'NE' || key === 'MAP_NE') return 'PLACE_MAP_NE';
        if (key === 'SE' || key === 'MAP_SE') return 'PLACE_MAP_SE';
        if (key === 'SW' || key === 'MAP_SW') return 'PLACE_MAP_SW';
        if (key === 'NW' || key === 'MAP_NW') return 'PLACE_MAP_NW';
        if (key === 'EDGE_NE' || key === 'MAP_EDGE_NE') return 'PLACE_MAP_EDGE_NE';
        if (key === 'EDGE_SE' || key === 'MAP_EDGE_SE') return 'PLACE_MAP_EDGE_SE';
        if (key === 'EDGE_SW' || key === 'MAP_EDGE_SW') return 'PLACE_MAP_EDGE_SW';
        if (key === 'EDGE_NW' || key === 'MAP_EDGE_NW') return 'PLACE_MAP_EDGE_NW';
        if (key === 'INNER_NE' || key === 'MAP_INNER_NE') return 'PLACE_MAP_INNER_NE';
        if (key === 'INNER_SE' || key === 'MAP_INNER_SE') return 'PLACE_MAP_INNER_SE';
        if (key === 'INNER_SW' || key === 'MAP_INNER_SW') return 'PLACE_MAP_INNER_SW';
        if (key === 'INNER_NW' || key === 'MAP_INNER_NW') return 'PLACE_MAP_INNER_NW';
        if (key === 'EDGE_EAST' || key === 'MAP_EDGE_EAST') return 'PLACE_MAP_EDGE_EAST';
        if (key === 'RIGHT_AIR' || key === 'MAP_RIGHT_AIR') return 'PLACE_MAP_RIGHT_AIR';
        if (key === 'LEFT_AIR' || key === 'MAP_LEFT_AIR') return 'PLACE_MAP_LEFT_AIR';
        if (key === 'EAST' || key === 'MAP_EAST') return 'PLACE_MAP_EAST';
        if (key === 'WEST' || key === 'MAP_WEST') return 'PLACE_MAP_WEST';
        if (key === 'CENTER_AIR' || key === 'MAP_CENTER_AIR') return 'PLACE_MAP_CENTER_AIR';
        if (key === 'CENTER' || key === 'MAP_CENTER') return 'PLACE_MAP_CENTER';
        return key;
    },
    computeDashPathToFixedMapPosition: function(m, gameState, placeType) {
        if (!m || !gameState) return null;
        const target = (typeof this.getBossFixedMapPosition === 'function')
            ? this.getBossFixedMapPosition(gameState, this.normalizeBossFixedMapPlaceType(placeType))
            : null;
        if (!target) return null;
        const sx = parseFloat(m.x) || 0;
        const sy = parseFloat(m.y) || 0;
        const ex = Math.max(0, Math.min(Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400), parseFloat(target.x) || sx));
        const ey = Math.max(0, Math.min(Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400), parseFloat(target.y) || sy));
        let dx = ex - sx;
        let dy = ey - sy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= len;
        dy /= len;
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) dx = m.faceDir === -1 ? -1 : 1;
        const targetZ = Number.isFinite(parseFloat(target.z)) ? parseFloat(target.z) : (parseFloat(m.z) || 0);
        return {
            startX: sx,
            startY: sy,
            startZ: parseFloat(m.z) || 0,
            endX: ex,
            endY: ey,
            endZ: targetZ,
            dirX: dx,
            dirY: dy,
            length: Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2) || 0,
            targetPlaceType: this.normalizeBossFixedMapPlaceType(placeType)
        };
    },

    isValidBossDashPath: function(path, minLength = 24) {
        if (!path) return false;
        const sx = parseFloat(path.startX);
        const sy = parseFloat(path.startY);
        const ex = parseFloat(path.endX);
        const ey = parseFloat(path.endY);
        const len = parseFloat(path.length);
        if (![sx, sy, ex, ey].every(Number.isFinite)) return false;
        const realLen = Math.sqrt((ex - sx) * (ex - sx) + (ey - sy) * (ey - sy));
        return realLen >= minLength && (!Number.isFinite(len) || len >= minLength * 0.75);
    },

    computeDashPathToMapEdgeByVector: function(m, gameState, vx, vy) {
        if (!m || !gameState) return null;
        const sx = parseFloat(m.x) || 0;
        const sy = parseFloat(m.y) || 0;
        const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400);
        let dx = parseFloat(vx) || 0;
        let dy = parseFloat(vy) || 0;
        let len = Math.sqrt(dx * dx + dy * dy);
        if (!isFinite(len) || len < 0.001) {
            dx = (sx < worldW / 2) ? 1 : -1;
            dy = 0;
            len = 1;
        }
        dx /= len;
        dy /= len;

        const candidates = [];
        if (dx > 0.001) candidates.push((worldW - sx) / dx);
        else if (dx < -0.001) candidates.push((0 - sx) / dx);
        if (dy > 0.001) candidates.push((worldD - sy) / dy);
        else if (dy < -0.001) candidates.push((0 - sy) / dy);

        let t = candidates.filter(v => isFinite(v) && v > 0).sort((a, b) => a - b)[0];
        if (!isFinite(t) || t <= 0) t = Math.max(worldW, worldD);
        const ex = Math.max(0, Math.min(worldW, sx + dx * t));
        const ey = Math.max(0, Math.min(worldD, sy + dy * t));
        // 맵 끝 돌진은 별도 target 객체가 없으므로 Z 목표를 지면으로 고정한다.
        // 이전 코드에서 존재하지 않는 target.z를 참조해 1페이즈 기본 2번 등 일반 RUSH 시작 시 런타임 오류가 발생했다.
        const targetZ = 0;
        return {
            startX: sx,
            startY: sy,
            startZ: parseFloat(m.z) || 0,
            endX: ex,
            endY: ey,
            endZ: targetZ,
            dirX: dx,
            dirY: dy,
            length: Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2) || 0
        };
    },



    isKasiyasMajorPattern3RandomRushAction: function(action) {
        if (!action) return false;
        const group = String(action.Random_Action_Group || '').trim().toUpperCase();
        if (group.indexOf('P1_M3_BOSS_RUSH') >= 0 || group.indexOf('P1_M3_CLONE_RUSH') >= 0) return true;
        const id = String(action.Action_ID || action.Object_Action_ID || '').trim();
        // 241050은 “본체 및 분신 사라짐” 준비 액션으로 추가되었으므로,
        // 랜덤 돌진 액션으로 취급하지 않는다.
        return [
            '241051','241052','241053','241054','241055','241056',
            '241057','241058','241059','241060','241061','241062',
            '261072','261073'
        ].includes(id);
    },

    computeKasiyasMajorPattern3SideRushPath: function(actor, action, gameState, options = {}) {
        if (!actor || !gameState) return null;
        const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400);
        const marginX = Math.max(28, Math.min(52, worldW * 0.025));
        const marginY = Math.max(28, Math.min(56, worldD * 0.10));
        const yMin = marginY;
        const yMax = Math.max(yMin + 1, worldD - marginY);
        const p = gameState.player || {};
        const px = Math.max(marginX + 40, Math.min(worldW - marginX - 40, parseFloat(p.x) || worldW / 2));
        const py = Math.max(yMin, Math.min(yMax, parseFloat(p.y) || worldD / 2));
        const forceSide = String(options.side || '').trim().toUpperCase();
        const side = (forceSide === 'LEFT' || forceSide === 'RIGHT')
            ? forceSide
            : (Math.random() < 0.5 ? 'LEFT' : 'RIGHT');
        const startX = side === 'LEFT' ? marginX : worldW - marginX;
        const endX = side === 'LEFT' ? worldW - marginX : marginX;
        const denomToEnd = (endX - px);
        const denomFromStart = (px - startX);

        let startY = py;
        let endY = py;
        let found = false;
        for (let i = 0; i < 14; i++) {
            const candidateEndY = yMin + Math.random() * (yMax - yMin);
            if (Math.abs(denomToEnd) > 0.001) {
                const candidateStartY = py - (candidateEndY - py) * (denomFromStart / denomToEnd);
                if (candidateStartY >= yMin && candidateStartY <= yMax) {
                    startY = candidateStartY;
                    endY = candidateEndY;
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            for (let i = 0; i < 14; i++) {
                const candidateStartY = yMin + Math.random() * (yMax - yMin);
                if (Math.abs(denomFromStart) > 0.001) {
                    const ratio = (endX - px) / denomFromStart;
                    const candidateEndY = py + (py - candidateStartY) * ratio;
                    if (candidateEndY >= yMin && candidateEndY <= yMax) {
                        startY = candidateStartY;
                        endY = candidateEndY;
                        found = true;
                        break;
                    }
                }
            }
        }
        if (!found) {
            const spread = Math.max(45, (yMax - yMin) * 0.32);
            startY = Math.max(yMin, Math.min(yMax, py + (Math.random() * 2 - 1) * spread));
            if (Math.abs(denomFromStart) > 0.001) {
                const ratio = (endX - px) / denomFromStart;
                endY = py + (py - startY) * ratio;
            } else {
                endY = py;
            }
            endY = Math.max(yMin, Math.min(yMax, endY));
        }

        let dx = endX - startX;
        let dy = endY - startY;
        let len = Math.sqrt(dx * dx + dy * dy);
        if (!isFinite(len) || len < 8) {
            dx = side === 'LEFT' ? 1 : -1;
            dy = 0;
            len = Math.max(1, worldW - marginX * 2);
        }
        const dirX = dx / len;
        const dirY = dy / len;
        return {
            startX: startX,
            startY: startY,
            startZ: parseFloat(actor.z) || 0,
            endX: endX,
            endY: endY,
            endZ: parseFloat(actor.z) || 0,
            dirX: dirX,
            dirY: dirY,
            length: len,
            randomSideRush: true,
            side: side,
            throughPlayerX: px,
            throughPlayerY: py,
            sourceActionId: String(action && (action.Action_ID || action.Object_Action_ID) || '').trim()
        };
    },

    computeBossFixedLineDashPath: function(m, actionOrDirection, gameState) {
        if (!gameState) return null;
        const direction = typeof actionOrDirection === 'string'
            ? actionOrDirection
            : String(actionOrDirection && (actionOrDirection.Action_Move_Direction || actionOrDirection.Move_Direction || '') || '').trim();
        const key = String(direction || '').trim().toUpperCase();
        const worldW = Math.max(1, parseFloat(gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState.WORLD_DEPTH) || 400);
        const marginX = Math.max(64, worldW * 0.055);
        const clampY = y => Math.max(28, Math.min(worldD - 28, y));
        let startX = null;
        let endX = null;
        let y = null;
        let lineKey = '';

        if (key === 'MAP_RIGHT_UPPER_TO_LEFT_UPPER' || key === 'RIGHT_UPPER_TO_LEFT_UPPER') {
            startX = worldW - marginX;
            endX = marginX;
            y = clampY(worldD * 0.29);
            lineKey = 'RIGHT_UPPER_TO_LEFT_UPPER';
        } else if (key === 'MAP_LEFT_LOWER_TO_RIGHT_LOWER' || key === 'LEFT_LOWER_TO_RIGHT_LOWER') {
            startX = marginX;
            endX = worldW - marginX;
            y = clampY(worldD * 0.71);
            lineKey = 'LEFT_LOWER_TO_RIGHT_LOWER';
        } else if (key === 'MAP_RIGHT_CENTER_TO_LEFT_CENTER' || key === 'RIGHT_CENTER_TO_LEFT_CENTER') {
            startX = worldW - marginX;
            endX = marginX;
            y = clampY(worldD * 0.50);
            lineKey = 'RIGHT_CENTER_TO_LEFT_CENTER';
        } else {
            return null;
        }

        const dx = endX - startX;
        const dy = 0;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        return {
            startX: startX,
            startY: y,
            startZ: parseFloat(m && m.z) || 0,
            endX: endX,
            endY: y,
            endZ: parseFloat(m && m.z) || 0,
            dirX: dx / len,
            dirY: dy,
            length: len,
            fixedLineRush: true,
            targetPlaceType: key,
            lineKey: lineKey
        };
    },

    computeSafeDashPathForActionDirection: function(m, actionOrDirection, gameState, options = {}) {
        const minLength = Math.max(8, parseFloat(options.minLength) || 64);
        const direction = typeof actionOrDirection === 'string'
            ? actionOrDirection
            : String(actionOrDirection && (actionOrDirection.Action_Move_Direction || actionOrDirection.Move_Direction || '') || '').trim();

        let path = this.computeDashPathForActionDirection(m, actionOrDirection, gameState);
        if (this.isValidBossDashPath(path, minLength)) return path;

        // 고정 위치 대상 RUSH는 동일 목표에 이미 서 있으면 짧은 경로가 정상일 수 있으나,
        // 교차 발도/돌진 공격에서는 제자리 모션만 나오면 안 되므로 반대편/플레이어/중앙 방향 후보로 재시도한다.
        const sx = parseFloat(m && m.x) || 0;
        const sy = parseFloat(m && m.y) || 0;
        const worldW = Math.max(1, parseFloat(gameState && gameState.WORLD_WIDTH) || 1400);
        const worldD = Math.max(1, parseFloat(gameState && gameState.WORLD_DEPTH) || 400);
        const p = gameState && gameState.player ? gameState.player : null;
        const candidates = [];

        if (p) {
            const rawPx = parseFloat(p.x);
            const rawPy = parseFloat(p.y);
            const pdx = (Number.isFinite(rawPx) ? rawPx : sx) - sx;
            const pdy = (Number.isFinite(rawPy) ? rawPy : sy) - sy;
            if (Math.sqrt(pdx * pdx + pdy * pdy) >= 12) candidates.push([pdx, pdy]);
        }

        const face = (m && m.faceDir === -1) ? -1 : 1;
        candidates.push([face, 0]);
        candidates.push([-face, 0]);
        candidates.push([worldW / 2 - sx, worldD / 2 - sy]);
        candidates.push([(sx < worldW / 2) ? 1 : -1, 0]);
        candidates.push([0, (sy < worldD / 2) ? 1 : -1]);
        candidates.push([0, (sy < worldD / 2) ? -1 : 1]);

        // 고정 대상이 지정된 경우, 대상 좌표에서 반대편으로 가는 실패 보정도 후보에 넣는다.
        if (this.isBossFixedMapPlaceType(direction)) {
            const target = this.getBossFixedMapPosition(gameState, this.normalizeBossFixedMapPlaceType(direction));
            if (target) {
                const tx = parseFloat(target.x);
                const ty = parseFloat(target.y);
                candidates.unshift([(Number.isFinite(tx) ? tx : sx) - sx, (Number.isFinite(ty) ? ty : sy) - sy]);
            }
        }

        for (const c of candidates) {
            const next = this.computeDashPathToMapEdgeByVector(m, gameState, c[0], c[1]);
            if (this.isValidBossDashPath(next, minLength)) return next;
        }

        return path;
    },
    computeDashPathForActionDirection: function(m, actionOrDirection, gameState) {
        const direction = typeof actionOrDirection === 'string'
            ? actionOrDirection
            : String(actionOrDirection && (actionOrDirection.Action_Move_Direction || actionOrDirection.Move_Direction || '') || '').trim();
        if (typeof this.computeBossFixedLineDashPath === 'function') {
            const fixedLinePath = this.computeBossFixedLineDashPath(m, actionOrDirection, gameState);
            if (fixedLinePath) return fixedLinePath;
        }
        if (this.isBossFixedMapPlaceType(direction)) {
            return this.computeDashPathToFixedMapPosition(m, gameState, direction);
        }
        return this.computeDashPathToMapEdge(m, gameState);
    },
    computeDashPathToMapEdge: function(m, gameState) {
        const sxRaw = parseFloat(m && m.x);
        const syRaw = parseFloat(m && m.y);
        const sx = Number.isFinite(sxRaw) ? sxRaw : 0;
        const sy = Number.isFinite(syRaw) ? syRaw : 0;
        const p = gameState && gameState.player ? gameState.player : null;
        const rawPx = p ? parseFloat(p.x) : NaN;
        const rawPy = p ? parseFloat(p.y) : NaN;
        // player.x/y가 0에 가까운 맵 끝 좌표여도 유효값으로 처리한다.
        // 기존의 || fallback은 player.y === 0일 때 sy로 대체되어 상단 추격 돌진이 수평화될 수 있었다.
        const px = Number.isFinite(rawPx) ? rawPx : sx + ((m && m.faceDir) || 1);
        const py = Number.isFinite(rawPy) ? rawPy : sy;

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

        // 맵 끝 돌진은 별도 target 객체가 없으므로 Z 목표를 지면으로 고정한다.
        // 이전 코드에서 존재하지 않는 target.z를 참조해 1페이즈 기본 2번 등 일반 RUSH 시작 시 런타임 오류가 발생했다.
        const targetZ = 0;
        return {
            startX: sx,
            startY: sy,
            startZ: parseFloat(m.z) || 0,
            endX: ex,
            endY: ey,
            endZ: targetZ,
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
        // 랜덤 액션 그룹은 boss.runtimeActions에서 이미 셔플된 순서로 실행된다.
        // 전조가 원본 Runtime_Actions를 참조하면 다른 그룹의 ATK를 next로 잡아 전조/돌진 경로가 어긋날 수 있다.
        const actions = boss && Array.isArray(boss.runtimeActions) && boss.runtimeActions.length
            ? boss.runtimeActions
            : (pattern && Array.isArray(pattern.Runtime_Actions) ? pattern.Runtime_Actions : []);
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
