// boss_behavior_system.js
// 보스가 실행 가능한 패턴이 없을 때 수행하는 기본 행동을 담당한다.
// 예: 플레이어 바라보기, 기본 접근, 대기 상태 전환.
//
// 기존 MonsterManager 메서드와 호환되도록, 각 함수는 MonsterManager를 this로 받아 실행된다.

const BossBehaviorSystem = {
    updateBossDefaultAction: function(m, distX, distY, deltaTime, gameState) {
        const boss = m.boss;
        const config = boss && (boss.config || boss.phase) ? (boss.config || boss.phase) : {};
        const stopDist = parseFloat(config.Chase_Stop_Distance) || 120;
        const moveRate = 1;

        const dx = gameState.player.x - m.x;
        const dy = gameState.player.y - m.y;

        m.faceDir = dx >= 0 ? 1 : -1;

        let moveX = 0;
        let moveY = 0;

        if (distX > stopDist) moveX = Math.sign(dx);
        if (Math.abs(dy) > 22) moveY = Math.sign(dy);

        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        if (len > 0) { moveX /= len; moveY /= len; }

        m.x += moveX * m.d.speed * moveRate * deltaTime;
        m.y += moveY * m.d.speed * moveRate * 0.7 * deltaTime;
        m.state = len > 0 ? 'CHASE' : 'IDLE';
    }
};
