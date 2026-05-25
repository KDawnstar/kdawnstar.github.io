// [카시야스 보스전] 몬스터/보스 런타임 시스템 임시 통합 파일 (monster_runtime_system.js)
// ==========================================
// 여러 보스 전용 시스템의 기존 MonsterManager 호출 호환 wrapper와
// 남아 있는 일반 몬스터 런타임 갱신을 담당합니다.

const MonsterManager = {
    init: function() {
        return MonsterDataSystem.init.apply(this, arguments);
    },

    resolveEffectTypeFromEnum: function() {
        return BossVFXSystem.resolveEffectTypeFromEnum.apply(this, arguments);
    },

    resolveProjectileRenderType: function() {
        return BossPositionSystem.resolveProjectileRenderType.apply(this, arguments);
    },

    pushMonsterAtkEffect: function() {
        return BossVFXSystem.pushMonsterAtkEffect.apply(this, arguments);
    },

    activateSpawner: function() {
        return MonsterSpawnSystem.activateSpawner.apply(this, arguments);
    },

    spawnInstant: function() {
        return MonsterSpawnSystem.spawnInstant.apply(this, arguments);
    },

    getBossParryWindow: function() {
        return BossCombatSystem.getBossParryWindow.apply(this, arguments);
    },

    isBossParryWindowActive: function() {
        return BossCombatSystem.isBossParryWindowActive.apply(this, arguments);
    },

    isPlayerInsideBossParryRange: function() {
        return BossCombatSystem.isPlayerInsideBossParryRange.apply(this, arguments);
    },

    pushBossParryCueEffect: function() {
        return BossVFXSystem.pushBossParryCueEffect.apply(this, arguments);
    },

    updateBossParryCue: function() {
        return BossCombatSystem.updateBossParryCue.apply(this, arguments);
    },

    enterBossGroggyFromParry: function() {
        return BossCombatSystem.enterBossGroggyFromParry.apply(this, arguments);
    },

    tryResolveBossParryByPlayerHit: function() {
        return BossCombatSystem.tryResolveBossParryByPlayerHit.apply(this, arguments);
    },

    takeDamage: function() {
        return BossCombatSystem.takeDamage.apply(this, arguments);
    },

    getStageRangeYScale: function() {
        return BossPositionSystem.getStageRangeYScale.apply(this, arguments);
    },

    calcWeightedRangeDistance: function() {
        return BossPositionSystem.calcWeightedRangeDistance.apply(this, arguments);
    },

    normalizePatternMoveDirection: function() {
        return BossPositionSystem.normalizePatternMoveDirection.apply(this, arguments);
    },

    normalizePatternGaze: function() {
        return BossPositionSystem.normalizePatternGaze.apply(this, arguments);
    },

    getPatternMoveDirectionValue: function() {
        return BossPositionSystem.getPatternMoveDirectionValue.apply(this, arguments);
    },

    getPatternGazeValue: function() {
        return BossPositionSystem.getPatternGazeValue.apply(this, arguments);
    },

    resolvePatternMoveVector: function() {
        return BossPositionSystem.resolvePatternMoveVector.apply(this, arguments);
    },

    resolvePatternFaceDir: function() {
        return BossPositionSystem.resolvePatternFaceDir.apply(this, arguments);
    },

    isBossPatternData: function() {
        return BossPatternSystem.isBossPatternData.apply(this, arguments);
    },

    isBossPatternMonster: function() {
        return BossPatternSystem.isBossPatternMonster.apply(this, arguments);
    },

    createBossRuntimeForMonster: function() {
        return BossPhaseSystem.createBossRuntimeForMonster.apply(this, arguments);
    },

    getBossLatePhaseThreshold: function() {
        return BossPhaseSystem.getBossLatePhaseThreshold.apply(this, arguments);
    },

    getPatternLoopCount: function() {
        return BossPatternSystem.getPatternLoopCount.apply(this, arguments);
    },

    updateBossCooldowns: function() {
        return BossPatternSystem.updateBossCooldowns.apply(this, arguments);
    },


    getBossPatternUseRangeX: function() {
        return BossPatternSystem.getBossPatternUseRangeX.apply(this, arguments);
    },

    getBossPatternUseRangeY: function() {
        return BossPatternSystem.getBossPatternUseRangeY.apply(this, arguments);
    },

    normalizeBossActionMoveType: function() {
        return BossPatternSystem.normalizeBossActionMoveType.apply(this, arguments);
    },

    getBossActionHitWindow: function() {
        return BossPatternSystem.getBossActionHitWindow.apply(this, arguments);
    },

    getBossObjectActionHitWindow: function() {
        return BossObjectSystem.getBossObjectActionHitWindow.apply(this, arguments);
    },

    getLatePhaseActionTimeRate: function() {
        return BossPatternSystem.getLatePhaseActionTimeRate.apply(this, arguments);
    },

    getBossActionMoveSpeed: function() {
        return BossPatternSystem.getBossActionMoveSpeed.apply(this, arguments);
    },

    getBossActionDuration: function() {
        return BossPatternSystem.getBossActionDuration.apply(this, arguments);
    },

    isBossPatternConditionMet: function() {
        return BossPatternSystem.isBossPatternConditionMet.apply(this, arguments);
    },

    ensureBossDebug: function() {
        return BossDebugSystem.ensureBossDebug.apply(this, arguments);
    },

    getBossDebugName: function() {
        return BossDebugSystem.getBossDebugName.apply(this, arguments);
    },

    pushBossDebugLog: function() {
        return BossDebugSystem.pushBossDebugLog.apply(this, arguments);
    },

    selectReadyBossPattern: function() {
        return BossPatternSystem.selectReadyBossPattern.apply(this, arguments);
    },

    startBossPattern: function() {
        return BossPatternSystem.startBossPattern.apply(this, arguments);
    },

    finishBossPattern: function() {
        return BossPatternSystem.finishBossPattern.apply(this, arguments);
    },

    startNextBossPatternAction: function() {
        return BossPatternSystem.startNextBossPatternAction.apply(this, arguments);
    },

    getPathLength: function() {
        return BossPositionSystem.getPathLength.apply(this, arguments);
    },

    computeDashPathToMapEdge: function() {
        return BossPositionSystem.computeDashPathToMapEdge.apply(this, arguments);
    },

    getBossDiagonalCornerPositions: function() {
        return BossPositionSystem.getBossDiagonalCornerPositions.apply(this, arguments);
    },

    getOppositeDiagonalCornerKey: function() {
        return BossPositionSystem.getOppositeDiagonalCornerKey.apply(this, arguments);
    },

    pickBossRandomDiagonalCornerKey: function() {
        return BossPositionSystem.pickBossRandomDiagonalCornerKey.apply(this, arguments);
    },

    getDiagonalPairKeyByCorner: function() {
        return BossPositionSystem.getDiagonalPairKeyByCorner.apply(this, arguments);
    },

    getDiagonalPairCorners: function() {
        return BossPositionSystem.getDiagonalPairCorners.apply(this, arguments);
    },

    chooseRandomFromList: function() {
        return BossPositionSystem.chooseRandomFromList.apply(this, arguments);
    },

    preparePattern4DiagonalRuntime: function() {
        return BossPositionSystem.preparePattern4DiagonalRuntime.apply(this, arguments);
    },

    getBossPatternNextAttackAction: function() {
        return BossPositionSystem.getBossPatternNextAttackAction.apply(this, arguments);
    },

    getBossPatternActionHitbox: function() {
        return BossCombatSystem.getBossPatternActionHitbox.apply(this, arguments);
    },

    resolveBossObjectSpawnPositions: function() {
        return BossObjectSystem.resolveBossObjectSpawnPositions.apply(this, arguments);
    },

    resolveBossPathForAction: function() {
        return BossPositionSystem.resolveBossPathForAction.apply(this, arguments);
    },

    pushPathWarningEffect: function() {
        return BossVFXSystem.pushPathWarningEffect.apply(this, arguments);
    },

    pushPathSlashEffects: function() {
        return BossVFXSystem.pushPathSlashEffects.apply(this, arguments);
    },

    pushPathResidualSlashField: function() {
        return BossVFXSystem.pushPathResidualSlashField.apply(this, arguments);
    },

    isPlayerInsidePathHitbox: function() {
        return BossCombatSystem.isPlayerInsidePathHitbox.apply(this, arguments);
    },

    isPlayerInsideCircleHitbox: function() {
        return BossCombatSystem.isPlayerInsideCircleHitbox.apply(this, arguments);
    },

    isPlayerInsideBoxHitbox: function() {
        return BossCombatSystem.isPlayerInsideBoxHitbox.apply(this, arguments);
    },

    pushDebugPathHitbox: function() {
        return BossCombatSystem.pushDebugPathHitbox.apply(this, arguments);
    },


    pushBossActionCueEffect: function() {
        return BossVFXSystem.pushBossActionCueEffect.apply(this, arguments);
    },
    applyBossActionGaze: function() {
        return BossActionSystem.applyBossActionGaze.apply(this, arguments);
    },


    getBossFixedMapPosition: function() {
        return BossActionSystem.getBossFixedMapPosition.apply(this, arguments);
    },

    getBossPositionSlotGroup: function() {
        return BossActionSystem.getBossPositionSlotGroup.apply(this, arguments);
    },

    shuffleArrayInPlace: function() {
        return BossActionSystem.shuffleArrayInPlace.apply(this, arguments);
    },

    pushBossNoiseTeleportEffect: function() {
        return BossActionSystem.pushBossNoiseTeleportEffect.apply(this, arguments);
    },

    getBossPatternObjectsByGroup: function() {
        return BossActionSystem.getBossPatternObjectsByGroup.apply(this, arguments);
    },

    getUniqueBossPatternObjectsByGroup: function() {
        return BossActionSystem.getUniqueBossPatternObjectsByGroup.apply(this, arguments);
    },

    inferNearestBossPositionSlotKey: function() {
        return BossActionSystem.inferNearestBossPositionSlotKey.apply(this, arguments);
    },

    chooseUniqueShuffleSlotsForActors: function() {
        return BossActionSystem.chooseUniqueShuffleSlotsForActors.apply(this, arguments);
    },

    applyGroupShuffleGazeToActor: function() {
        return BossActionSystem.applyGroupShuffleGazeToActor.apply(this, arguments);
    },

    prepareBossGroupSlotShuffle: function() {
        return BossActionSystem.prepareBossGroupSlotShuffle.apply(this, arguments);
    },

    startBossPatternDialogue: function() {
        return BossActionSystem.startBossPatternDialogue.apply(this, arguments);
    },

    pushBossActiveAttackRangeWarning: function() {
        return BossActionSystem.pushBossActiveAttackRangeWarning.apply(this, arguments);
    },

    prepareBossDashMoveToPlayer: function() {
        return BossActionSystem.prepareBossDashMoveToPlayer.apply(this, arguments);
    },

    onBossPatternActionStart: function() {
        return BossActionSystem.onBossPatternActionStart.apply(this, arguments);
    },

    pushBossPatternActionEffect: function() {
        return BossVFXSystem.pushBossPatternActionEffect.apply(this, arguments);
    },

    buildGuardInfoFromAttackData: function() {
        return BossCombatSystem.buildGuardInfoFromAttackData.apply(this, arguments);
    },

    trySpawnBossGuardSuccessObject: function() {
        return BossCombatSystem.trySpawnBossGuardSuccessObject.apply(this, arguments);
    },

    fireBossPatternActionHit: function() {
        return BossCombatSystem.fireBossPatternActionHit.apply(this, arguments);
    },
    updateBossPatternActionMovement: function() {
        return BossActionSystem.updateBossPatternActionMovement.apply(this, arguments);
    },

    pushBossCastEffect: function() {
        return BossVFXSystem.pushBossCastEffect.apply(this, arguments);
    },

    getBossObjectIdFromData: function() {
        return BossObjectSystem.getBossObjectIdFromData.apply(this, arguments);
    },

    isBossObjectActionConditionMet: function() {
        return BossObjectSystem.isBossObjectActionConditionMet.apply(this, arguments);
    },

    startNextBossObjectAction: function() {
        return BossObjectSystem.startNextBossObjectAction.apply(this, arguments);
    },

    getBossObjectActionDuration: function() {
        return BossObjectSystem.getBossObjectActionDuration.apply(this, arguments);
    },

    getBossObjectCurrentActionDuration: function() {
        return BossObjectSystem.getBossObjectCurrentActionDuration.apply(this, arguments);
    },

    getBossObjectNextAttackAction: function() {
        return BossObjectSystem.getBossObjectNextAttackAction.apply(this, arguments);
    },

    pushBossObjectActiveAttackRangeWarning: function() {
        return BossObjectSystem.pushBossObjectActiveAttackRangeWarning.apply(this, arguments);
    },

    applyBossObjectActionGaze: function() {
        return BossObjectSystem.applyBossObjectActionGaze.apply(this, arguments);
    },

    onBossObjectActionStart: function() {
        return BossObjectSystem.onBossObjectActionStart.apply(this, arguments);
    },

    updateBossObjectActionMovement: function() {
        return BossObjectSystem.updateBossObjectActionMovement.apply(this, arguments);
    },

    getBossObjectActionHitbox: function() {
        return BossCombatSystem.getBossObjectActionHitbox.apply(this, arguments);
    },

    pushBossObjectActionEffect: function() {
        return BossVFXSystem.pushBossObjectActionEffect.apply(this, arguments);
    },

    fireBossObjectActionHit: function() {
        return BossCombatSystem.fireBossObjectActionHit.apply(this, arguments);
    },

    spawnBossAttackObjectFromAction: function() {
        return BossObjectSystem.spawnBossAttackObjectFromAction.apply(this, arguments);
    },

    updateBossAttackObjects: function() {
        return BossObjectSystem.updateBossAttackObjects.apply(this, arguments);
    },

    updateBossDefaultAction: function() {
        return BossBehaviorSystem.updateBossDefaultAction.apply(this, arguments);
    },

    updateBossPatternMonster: function() {
        return BossStateFlowSystem.updateBossPatternMonster.apply(this, arguments);
    },

    update: function() {
        return MonsterUpdateSystem.update.apply(this, arguments);
    }
};
