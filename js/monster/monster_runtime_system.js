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

    hasTwoSameKasiyasApostleEnergies: function() {
        return BossCombatSystem.hasTwoSameKasiyasApostleEnergies.apply(this, arguments);
    },

    enterBossGroggyFromGuardSpecial: function() {
        return BossCombatSystem.enterBossGroggyFromGuardSpecial.apply(this, arguments);
    },

    tryApplyBossGuardSpecialResult: function() {
        return BossCombatSystem.tryApplyBossGuardSpecialResult.apply(this, arguments);
    },

    playerHasTemperedBladeGuard: function() {
        return BossCombatSystem.playerHasTemperedBladeGuard.apply(this, arguments);
    },

    consumeTemperedBladeGuard: function() {
        return BossCombatSystem.consumeTemperedBladeGuard.apply(this, arguments);
    },

    queueKasiyasMajorPattern3CrossGuardResolve: function() {
        return BossCombatSystem.queueKasiyasMajorPattern3CrossGuardResolve.apply(this, arguments);
    },

    resolveKasiyasMajorPattern3CrossGroggyAction: function() {
        return BossCombatSystem.resolveKasiyasMajorPattern3CrossGroggyAction.apply(this, arguments);
    },

    resolveKasiyasMajorPattern3PendingCrossGroggy: function() {
        return BossCombatSystem.resolveKasiyasMajorPattern3PendingCrossGroggy.apply(this, arguments);
    },

    tryResolveBossParryByPlayerHit: function() {
        return BossCombatSystem.tryResolveBossParryByPlayerHit.apply(this, arguments);
    },

    getBossExplicitActionDamageRate: function() {
        return BossCombatSystem.getBossExplicitActionDamageRate.apply(this, arguments);
    },

    getBossDefaultDamageRate: function() {
        return BossCombatSystem.getBossDefaultDamageRate.apply(this, arguments);
    },

    getBossReceivedDamageRate: function() {
        return BossCombatSystem.getBossReceivedDamageRate.apply(this, arguments);
    },

    isBossFrontDamageImmuneAgainstPlayer: function() {
        return BossCombatSystem.isBossFrontDamageImmuneAgainstPlayer.apply(this, arguments);
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

    getBossNextPhase: function() {
        return BossPhaseSystem.getBossNextPhase.apply(this, arguments);
    },

    resetPlayerForBossPhaseTransition: function() {
        return BossPhaseSystem.resetPlayerForBossPhaseTransition.apply(this, arguments);
    },

    clearBossPhaseTransitionRuntime: function() {
        return BossPhaseSystem.clearBossPhaseTransitionRuntime.apply(this, arguments);
    },

    startBossPhaseTransition: function() {
        return BossPhaseSystem.startBossPhaseTransition.apply(this, arguments);
    },

    updateBossPhaseTransition: function() {
        return BossPhaseSystem.updateBossPhaseTransition.apply(this, arguments);
    },

    finishBossPhaseTransition: function() {
        return BossPhaseSystem.finishBossPhaseTransition.apply(this, arguments);
    },

    getPatternLoopCount: function() {
        return BossPatternSystem.getPatternLoopCount.apply(this, arguments);
    },

    getBossPatternActionSourceId: function() {
        return BossPatternSystem.getBossPatternActionSourceId.apply(this, arguments);
    },

    isKasiyasMajorPattern3Pattern: function() {
        return BossPatternSystem.isKasiyasMajorPattern3Pattern.apply(this, arguments);
    },


    isKasiyasP2MajorPattern1Pattern: function() {
        return BossPatternSystem.isKasiyasP2MajorPattern1Pattern.apply(this, arguments);
    },

    isKasiyasP2MajorPattern1Action: function() {
        return BossPatternSystem.isKasiyasP2MajorPattern1Action.apply(this, arguments);
    },

    ensureKasiyasP2MajorPattern1Runtime: function() {
        return BossPatternSystem.ensureKasiyasP2MajorPattern1Runtime.apply(this, arguments);
    },

    getKasiyasP2MajorPattern1EnhanceCount: function() {
        return BossPatternSystem.getKasiyasP2MajorPattern1EnhanceCount.apply(this, arguments);
    },

    isKasiyasP2MajorPattern1EnhancedAttackAction: function() {
        return BossPatternSystem.isKasiyasP2MajorPattern1EnhancedAttackAction.apply(this, arguments);
    },

    shouldSkipBossPatternActionByCondition: function() {
        return BossPatternSystem.shouldSkipBossPatternActionByCondition.apply(this, arguments);
    },

    finalizeKasiyasP2MajorPattern1ActionAsDodgeIfNeeded: function() {
        return BossPatternSystem.finalizeKasiyasP2MajorPattern1ActionAsDodgeIfNeeded.apply(this, arguments);
    },

    registerKasiyasP2MajorPattern1ResponseResult: function() {
        return BossPatternSystem.registerKasiyasP2MajorPattern1ResponseResult.apply(this, arguments);
    },

    getKasiyasP2MajorPattern1FinalDamageMultiplier: function() {
        return BossPatternSystem.getKasiyasP2MajorPattern1FinalDamageMultiplier.apply(this, arguments);
    },

    getKasiyasP2MajorPattern1FinalHitboxMultiplier: function() {
        return BossPatternSystem.getKasiyasP2MajorPattern1FinalHitboxMultiplier.apply(this, arguments);
    },

    shuffleBossActionGroupList: function() {
        return BossPatternSystem.shuffleBossActionGroupList.apply(this, arguments);
    },

    buildBossPatternRuntimeActions: function() {
        return BossPatternSystem.buildBossPatternRuntimeActions.apply(this, arguments);
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

    isBossFixedMapPlaceType: function() {
        return BossPositionSystem.isBossFixedMapPlaceType.apply(this, arguments);
    },

    normalizeBossFixedMapPlaceType: function() {
        return BossPositionSystem.normalizeBossFixedMapPlaceType.apply(this, arguments);
    },

    computeDashPathToFixedMapPosition: function() {
        return BossPositionSystem.computeDashPathToFixedMapPosition.apply(this, arguments);
    },

    computeDashPathForActionDirection: function() {
        return BossPositionSystem.computeDashPathForActionDirection.apply(this, arguments);
    },

    computeBossFixedLineDashPath: function() {
        return BossPositionSystem.computeBossFixedLineDashPath.apply(this, arguments);
    },

    computeDashPathToMapEdgeByVector: function() {
        return BossPositionSystem.computeDashPathToMapEdgeByVector.apply(this, arguments);
    },

    isValidBossDashPath: function() {
        return BossPositionSystem.isValidBossDashPath.apply(this, arguments);
    },

    computeSafeDashPathForActionDirection: function() {
        return BossPositionSystem.computeSafeDashPathForActionDirection.apply(this, arguments);
    },

    isKasiyasMajorPattern3RandomRushAction: function() {
        return BossPositionSystem.isKasiyasMajorPattern3RandomRushAction.apply(this, arguments);
    },

    computeKasiyasMajorPattern3SideRushPath: function() {
        return BossPositionSystem.computeKasiyasMajorPattern3SideRushPath.apply(this, arguments);
    },

    setKasiyasMajorPattern3RushActorsHidden: function() {
        return BossActionSystem.setKasiyasMajorPattern3RushActorsHidden.apply(this, arguments);
    },

    getKasiyasMajorPattern3RushPathKey: function() {
        return BossActionSystem.getKasiyasMajorPattern3RushPathKey.apply(this, arguments);
    },

    getKasiyasMajorPattern3RushStore: function() {
        return BossActionSystem.getKasiyasMajorPattern3RushStore.apply(this, arguments);
    },

    isValidKasiyasMajorPattern3RushPath: function() {
        return BossActionSystem.isValidKasiyasMajorPattern3RushPath.apply(this, arguments);
    },

    getKasiyasMajorPattern3StoredRushPath: function() {
        return BossActionSystem.getKasiyasMajorPattern3StoredRushPath.apply(this, arguments);
    },

    ensureKasiyasMajorPattern3RushSlotPath: function() {
        return BossActionSystem.ensureKasiyasMajorPattern3RushSlotPath.apply(this, arguments);
    },

    getKasiyasMajorPattern3RushSlotPath: function() {
        return BossActionSystem.getKasiyasMajorPattern3RushSlotPath.apply(this, arguments);
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

    getTerrainAreaRect: function() {
        return BossObjectSystem.getTerrainAreaRect.apply(this, arguments);
    },

    getTerrainSafeRect: function() {
        return BossObjectSystem.getTerrainSafeRect.apply(this, arguments);
    },

    isPlayerInsideTerrainRect: function() {
        return BossObjectSystem.isPlayerInsideTerrainRect.apply(this, arguments);
    },

    getPlayerTerrainCollisionHalfSize: function() {
        return BossObjectSystem.getPlayerTerrainCollisionHalfSize.apply(this, arguments);
    },

    normalizeTerrainRect: function() {
        return BossObjectSystem.normalizeTerrainRect.apply(this, arguments);
    },

    buildKasiyasP3BrokenSpaceBlockerRects: function() {
        return BossObjectSystem.buildKasiyasP3BrokenSpaceBlockerRects.apply(this, arguments);
    },

    getKasiyasP3SpaceObjectSize: function() {
        return BossObjectSystem.getKasiyasP3SpaceObjectSize.apply(this, arguments);
    },

    isKasiyasP3DimensionCrackRemoveActionFinished: function() {
        return BossObjectSystem.isKasiyasP3DimensionCrackRemoveActionFinished.apply(this, arguments);
    },

    finishKasiyasP3DimensionCrackObject: function() {
        return BossObjectSystem.finishKasiyasP3DimensionCrackObject.apply(this, arguments);
    },

    resolveKasiyasP3SpaceDistortionOverlaps: function() {
        return BossObjectSystem.resolveKasiyasP3SpaceDistortionOverlaps.apply(this, arguments);
    },

    applyKasiyasP3DimensionCrackPullField: function() {
        return BossObjectSystem.applyKasiyasP3DimensionCrackPullField.apply(this, arguments);
    },

    updateKasiyasP3DimensionCrackObject: function() {
        return BossObjectSystem.updateKasiyasP3DimensionCrackObject.apply(this, arguments);
    },

    updateKasiyasP3DimensionCrackBurstObject: function() {
        return BossObjectSystem.updateKasiyasP3DimensionCrackBurstObject.apply(this, arguments);
    },


    movePlayerToTerrainSafeArea: function() {
        return BossObjectSystem.movePlayerToTerrainSafeArea.apply(this, arguments);
    },

    applyTerrainCollapseHit: function() {
        return BossObjectSystem.applyTerrainCollapseHit.apply(this, arguments);
    },

    pushPlayerOutOfTerrainRect: function() {
        return BossObjectSystem.pushPlayerOutOfTerrainRect.apply(this, arguments);
    },

    applyTerrainPlayerBlockers: function() {
        return BossObjectSystem.applyTerrainPlayerBlockers.apply(this, arguments);
    },

    clearBossPatternTerrainObjects: function() {
        return BossObjectSystem.clearBossPatternTerrainObjects.apply(this, arguments);
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

    pushKasiyasRushBodyEffect: function() {
        return BossVFXSystem.pushKasiyasRushBodyEffect.apply(this, arguments);
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

    triggerScreenShake: function() {
        return BossVFXSystem.triggerScreenShake.apply(this, arguments);
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

    trySpawnBossPatternActionObjectsAtTiming: function() {
        return BossActionSystem.trySpawnBossPatternActionObjectsAtTiming.apply(this, arguments);
    },

    isKasiyasP2Pattern3JumpWarningAction: function() {
        return BossActionSystem.isKasiyasP2Pattern3JumpWarningAction.apply(this, arguments);
    },

    isKasiyasP2Pattern3JumpSlashAction: function() {
        return BossActionSystem.isKasiyasP2Pattern3JumpSlashAction.apply(this, arguments);
    },

    resolveKasiyasP2Pattern3SafeAreaCenter: function() {
        return BossActionSystem.resolveKasiyasP2Pattern3SafeAreaCenter.apply(this, arguments);
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

    isBossInlineActionWarningEnabled: function() {
        return BossActionSystem.isBossInlineActionWarningEnabled.apply(this, arguments);
    },

    getBossInlineActionWarningWindow: function() {
        return BossActionSystem.getBossInlineActionWarningWindow.apply(this, arguments);
    },

    clearBossInlineActionWarning: function() {
        return BossActionSystem.clearBossInlineActionWarning.apply(this, arguments);
    },

    updateBossInlineActionWarning: function() {
        return BossActionSystem.updateBossInlineActionWarning.apply(this, arguments);
    },

    prepareBossDashMoveToPlayer: function() {
        return BossActionSystem.prepareBossDashMoveToPlayer.apply(this, arguments);
    },

    prepareBossJumpMoveToPlayer: function() {
        return BossActionSystem.prepareBossJumpMoveToPlayer.apply(this, arguments);
    },

    startCalledBossObjectActionForPatternAction: function() {
        return BossActionSystem.startCalledBossObjectActionForPatternAction.apply(this, arguments);
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

    pushKasiyasP2MajorPattern1SwordEnergyAura: function() {
        return BossVFXSystem.pushKasiyasP2MajorPattern1SwordEnergyAura.apply(this, arguments);
    },

    getBossObjectIdFromData: function() {
        return BossObjectSystem.getBossObjectIdFromData.apply(this, arguments);
    },

    getBossOwnerRuntimeFromCaster: function() {
        return BossObjectSystem.getBossOwnerRuntimeFromCaster.apply(this, arguments);
    },

    getBossPatternObjectGroupCandidates: function() {
        return BossObjectSystem.getBossPatternObjectGroupCandidates.apply(this, arguments);
    },

    pickRandomBossObjectCandidate: function() {
        return BossObjectSystem.pickRandomBossObjectCandidate.apply(this, arguments);
    },

    selectBossObjectIdFromGroup: function() {
        return BossObjectSystem.selectBossObjectIdFromGroup.apply(this, arguments);
    },

    isBossObjectGetInputActive: function() {
        return BossObjectSystem.isBossObjectGetInputActive.apply(this, arguments);
    },

    isPlayerInsideBossObjectGetRange: function() {
        return BossObjectSystem.isPlayerInsideBossObjectGetRange.apply(this, arguments);
    },

    getBossObjectGetDistanceScore: function() {
        return BossObjectSystem.getBossObjectGetDistanceScore.apply(this, arguments);
    },

    getNearestBossInteractiveSword: function() {
        return BossObjectSystem.getNearestBossInteractiveSword.apply(this, arguments);
    },

    refreshNearestBossInteractiveSwordTarget: function() {
        return BossObjectSystem.refreshNearestBossInteractiveSwordTarget.apply(this, arguments);
    },

    consumeBossInteractiveSword: function() {
        return BossObjectSystem.consumeBossInteractiveSword.apply(this, arguments);
    },

    getApostleEnergyColorInfo: function() {
        return BossObjectSystem.getApostleEnergyColorInfo.apply(this, arguments);
    },

    applyBossObjectGetEffect: function() {
        return BossObjectSystem.applyBossObjectGetEffect.apply(this, arguments);
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

    getBossObjectActionHitboxes: function() {
        return BossCombatSystem.getBossObjectActionHitboxes.apply(this, arguments);
    },

    pushBossObjectActionEffect: function() {
        return BossVFXSystem.pushBossObjectActionEffect.apply(this, arguments);
    },

    isKasiyasP2M2SwordWallObject: function() {
        return BossCombatSystem.isKasiyasP2M2SwordWallObject.apply(this, arguments);
    },

    getKasiyasP2M2SwordWallGapSlot: function() {
        return BossCombatSystem.getKasiyasP2M2SwordWallGapSlot.apply(this, arguments);
    },

    getKasiyasP2M2SwordWallGapInfo: function() {
        return BossCombatSystem.getKasiyasP2M2SwordWallGapInfo.apply(this, arguments);
    },

    getKasiyasP2M2SwordWallCollisionBoxes: function() {
        return BossCombatSystem.getKasiyasP2M2SwordWallCollisionBoxes.apply(this, arguments);
    },

    fireKasiyasP2M2SwordWallHit: function() {
        return BossCombatSystem.fireKasiyasP2M2SwordWallHit.apply(this, arguments);
    },

    getKasiyasP2M2FinalPortalDirectionForAction: function() {
        return BossCombatSystem.getKasiyasP2M2FinalPortalDirectionForAction.apply(this, arguments);
    },

    findKasiyasP2M2MatchingFiredSword: function() {
        return BossCombatSystem.findKasiyasP2M2MatchingFiredSword.apply(this, arguments);
    },

    getKasiyasP2M2FinalPortalImpactPosition: function() {
        return BossCombatSystem.getKasiyasP2M2FinalPortalImpactPosition.apply(this, arguments);
    },

    startKasiyasP2M2PerfectBreakSequence: function() {
        return BossCombatSystem.startKasiyasP2M2PerfectBreakSequence.apply(this, arguments);
    },

    updateKasiyasP2M2PerfectBreakSequence: function() {
        return BossCombatSystem.updateKasiyasP2M2PerfectBreakSequence.apply(this, arguments);
    },

    enterKasiyasP2M2FinalGroggy: function() {
        return BossCombatSystem.enterKasiyasP2M2FinalGroggy.apply(this, arguments);
    },

    tryResolveKasiyasP2M2FinalPortalHit: function() {
        return BossCombatSystem.tryResolveKasiyasP2M2FinalPortalHit.apply(this, arguments);
    },

    fireBossObjectActionHit: function() {
        return BossCombatSystem.fireBossObjectActionHit.apply(this, arguments);
    },

    getBossObjectDataField: function() {
        return BossObjectSystem.getBossObjectDataField.apply(this, arguments);
    },

    getBossObjectInteractRange: function() {
        return BossObjectSystem.getBossObjectInteractRange.apply(this, arguments);
    },

    getBossObjectInteractMaxLimit: function() {
        return BossObjectSystem.getBossObjectInteractMaxLimit.apply(this, arguments);
    },

    getBossObjectInteractType: function() {
        return BossObjectSystem.getBossObjectInteractType.apply(this, arguments);
    },

    getBossObjectInteractEffect: function() {
        return BossObjectSystem.getBossObjectInteractEffect.apply(this, arguments);
    },

    getBossObjectInteractEffectValue: function() {
        return BossObjectSystem.getBossObjectInteractEffectValue.apply(this, arguments);
    },

    getBossObjectInteractAfterType: function() {
        return BossObjectSystem.getBossObjectInteractAfterType.apply(this, arguments);
    },

    isBossObjectInteractionConditionMet: function() {
        return BossObjectSystem.isBossObjectInteractionConditionMet.apply(this, arguments);
    },

    getBossObjectDestroyResultType: function() {
        return BossObjectSystem.getBossObjectDestroyResultType.apply(this, arguments);
    },

    getBossObjectDestroyResultValue: function() {
        return BossObjectSystem.getBossObjectDestroyResultValue.apply(this, arguments);
    },

    getKasiyasP2M2ObjectRenderSize: function() {
        return BossObjectSystem.getKasiyasP2M2ObjectRenderSize.apply(this, arguments);
    },

    createKasiyasP2M2SpecialObject: function() {
        return BossObjectSystem.createKasiyasP2M2SpecialObject.apply(this, arguments);
    },

    queueKasiyasP2M2SpecialObjectSpawn: function() {
        return BossObjectSystem.queueKasiyasP2M2SpecialObjectSpawn.apply(this, arguments);
    },

    flushKasiyasP2M2PendingSpecialObjectSpawns: function() {
        return BossObjectSystem.flushKasiyasP2M2PendingSpecialObjectSpawns.apply(this, arguments);
    },

    restoreKasiyasP2M2BrokenGiantSwordAfterAimCancel: function() {
        return BossObjectSystem.restoreKasiyasP2M2BrokenGiantSwordAfterAimCancel.apply(this, arguments);
    },


    removeKasiyasP2M2BrokenGiantSwordObjectsAfterFire: function() {
        return BossObjectSystem.removeKasiyasP2M2BrokenGiantSwordObjectsAfterFire.apply(this, arguments);
    },

    cancelKasiyasP2M2GiantSwordAim: function() {
        return BossObjectSystem.cancelKasiyasP2M2GiantSwordAim.apply(this, arguments);
    },

    spawnBossAttackObjectFromAction: function() {
        return BossObjectSystem.spawnBossAttackObjectFromAction.apply(this, arguments);
    },

    updateBossAttackObjects: function() {
        return BossObjectSystem.updateBossAttackObjects.apply(this, arguments);
    },

    clearKasiyasMajorPattern2Objects: function() {
        return BossObjectSystem.clearKasiyasMajorPattern2Objects.apply(this, arguments);
    },

    clearKasiyasMajorPattern3Runtime: function() {
        return BossObjectSystem.clearKasiyasMajorPattern3Runtime.apply(this, arguments);
    },

    clearKasiyasP2MajorPattern2Runtime: function() {
        return BossObjectSystem.clearKasiyasP2MajorPattern2Runtime.apply(this, arguments);
    },

    clearKasiyasP2Pattern3Runtime: function() {
        return BossObjectSystem.clearKasiyasP2Pattern3Runtime.apply(this, arguments);
    },

    clearAllBossPatternRuntimeOnDeath: function() {
        return BossObjectSystem.clearAllBossPatternRuntimeOnDeath.apply(this, arguments);
    },

    isKasiyasMajorPattern3CloneObject: function() {
        return BossObjectSystem.isKasiyasMajorPattern3CloneObject.apply(this, arguments);
    },

    findActiveBossPatternActorByObjectId: function() {
        return BossObjectSystem.findActiveBossPatternActorByObjectId.apply(this, arguments);
    },

    applyKasiyasOniMarkFromObject: function() {
        return BossObjectSystem.applyKasiyasOniMarkFromObject.apply(this, arguments);
    },

    startBossObjectActionById: function() {
        return BossObjectSystem.startBossObjectActionById.apply(this, arguments);
    },

    updateKasiyasOniMarkPulse: function() {
        return BossCombatSystem.updateKasiyasOniMarkPulse.apply(this, arguments);
    },

    applyKasiyasOniMarkAttackResult: function() {
        return BossCombatSystem.applyKasiyasOniMarkAttackResult.apply(this, arguments);
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
