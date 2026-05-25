// [카시야스 보스전] 공통 모델 실루엣 렌더링 전담 (model_body_renderer.js)
const ModelBodyRenderer = {
    drawModelBody: function(ctx, options = {}) {
        const renderType = String(options.renderType || 'RENDER_HUMAN').trim().toUpperCase();
        const palette = options.palette || { dark: '#2c3e50', mid: '#95a5a6', light: '#ecf0f1' };
        const w = Math.max(24, options.w || 50);
        const h = Math.max(40, options.h || 100);
        const face = options.faceDir === -1 ? -1 : 1;
        const state = String(options.state || '').trim();
        const stateKey = state.toUpperCase();
        const isDead = stateKey === 'DIE' || stateKey === 'P_DIE';
        const isHit = stateKey === 'HIT' || stateKey === 'P_HIT';
        const isChampion = !!options.isChampion;
        const isMonster = !!options.isMonster;
        const eyeColor = options.eyeColor || (isHit ? '#ffffff' : '#111111');

        const dark = isDead ? '#333333' : (isHit ? '#9f2f24' : palette.dark);
        const mid = isDead ? '#555555' : (isHit ? '#e74c3c' : palette.mid);
        const light = isDead ? '#777777' : palette.light;

        const addRoundRectPath = (x, y, rw, rh, radius) => {
            const rr = Math.min(radius, rw / 2, rh / 2);
            ctx.beginPath();
            ctx.moveTo(x + rr, y);
            ctx.lineTo(x + rw - rr, y);
            ctx.quadraticCurveTo(x + rw, y, x + rw, y + rr);
            ctx.lineTo(x + rw, y + rh - rr);
            ctx.quadraticCurveTo(x + rw, y + rh, x + rw - rr, y + rh);
            ctx.lineTo(x + rr, y + rh);
            ctx.quadraticCurveTo(x, y + rh, x, y + rh - rr);
            ctx.lineTo(x, y + rr);
            ctx.quadraticCurveTo(x, y, x + rr, y);
            ctx.closePath();
        };

        const bodyGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
        bodyGrad.addColorStop(0, dark);
        bodyGrad.addColorStop(0.52, mid);
        bodyGrad.addColorStop(1, dark);

        ctx.save();

        if (renderType === 'RENDER_GOBLIN') {
            const headR = Math.max(w * 0.24, h * 0.13);
            const headCx = face * w * 0.04;
            const headCy = -h * 0.72;

            const earBaseX = headCx - face * headR * 0.62;
            const earBaseY = headCy - headR * 0.02;

            ctx.fillStyle = mid;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(earBaseX, earBaseY - headR * 0.18);
            ctx.lineTo(earBaseX - face * headR * 1.05, earBaseY - headR * 0.48);
            ctx.lineTo(earBaseX - face * headR * 0.36, earBaseY + headR * 0.34);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = light;
            ctx.beginPath();
            ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-w * 0.34, -h * 0.54);
            ctx.quadraticCurveTo(-w * 0.30, -h * 0.62, -w * 0.16, -h * 0.64);
            ctx.lineTo(w * 0.16, -h * 0.64);
            ctx.quadraticCurveTo(w * 0.30, -h * 0.62, w * 0.34, -h * 0.54);
            ctx.lineTo(w * 0.28, -h * 0.18);
            ctx.quadraticCurveTo(w * 0.22, -h * 0.02, 0, 0);
            ctx.quadraticCurveTo(-w * 0.22, -h * 0.02, -w * 0.28, -h * 0.18);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.2;
            ctx.stroke();

            ctx.strokeStyle = eyeColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(headCx + face * headR * 0.08, headCy - headR * 0.02);
            ctx.lineTo(headCx + face * headR * 0.38, headCy - headR * 0.10);
            ctx.stroke();

            if (!isDead) {
                ctx.strokeStyle = 'rgba(0,0,0,0.35)';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(headCx + face * headR * 0.18, headCy + headR * 0.16);
                ctx.lineTo(headCx + face * headR * 0.30, headCy + headR * 0.20);
                ctx.stroke();
            }

        } else if (renderType === 'RENDER_TAU') {
            const headCx = face * w * 0.01;
            const headCy = -h * 0.72;
            const headW = w * 0.66;
            const headH = h * 0.34;

            ctx.fillStyle = '#e8e1cf';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(headCx - face * headW * 0.08, headCy - headH * 0.34);
            ctx.quadraticCurveTo(
                headCx - face * headW * 0.30,
                headCy - headH * 0.92,
                headCx - face * headW * 0.14,
                headCy - headH * 0.12
            );
            ctx.quadraticCurveTo(
                headCx - face * headW * 0.14,
                headCy - headH * 0.26,
                headCx - face * headW * 0.02,
                headCy - headH * 0.22
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(headCx + face * headW * 0.04, headCy - headH * 0.34);
            ctx.quadraticCurveTo(
                headCx + face * headW * 0.36,
                headCy - headH * 1.02,
                headCx + face * headW * 0.18,
                headCy - headH * 0.08
            );
            ctx.quadraticCurveTo(
                headCx + face * headW * 0.11,
                headCy - headH * 0.24,
                headCx + face * headW * 0.00,
                headCy - headH * 0.20
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = light;
            ctx.beginPath();
            ctx.moveTo(headCx - face * headW * 0.36, headCy - headH * 0.04);
            ctx.quadraticCurveTo(headCx - face * headW * 0.20, headCy - headH * 0.46, headCx + face * headW * 0.08, headCy - headH * 0.44);
            ctx.quadraticCurveTo(headCx + face * headW * 0.34, headCy - headH * 0.40, headCx + face * headW * 0.46, headCy - headH * 0.08);
            ctx.quadraticCurveTo(headCx + face * headW * 0.52, headCy + headH * 0.14, headCx + face * headW * 0.26, headCy + headH * 0.28);
            ctx.quadraticCurveTo(headCx + face * headW * 0.02, headCy + headH * 0.34, headCx - face * headW * 0.22, headCy + headH * 0.20);
            ctx.quadraticCurveTo(headCx - face * headW * 0.38, headCy + headH * 0.10, headCx - face * headW * 0.36, headCy - headH * 0.04);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.2;
            ctx.stroke();

            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.arc(
                headCx + face * headW * 0.10,
                headCy - headH * 0.10,
                Math.max(2.8, w * 0.028),
                0,
                Math.PI * 2
            );
            ctx.fill();

            if (!isDead) {
                ctx.fillStyle = 'rgba(0,0,0,0.30)';
                ctx.beginPath();
                ctx.arc(
                    headCx + face * headW * 0.28,
                    headCy + headH * 0.10,
                    Math.max(1.8, w * 0.018),
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            ctx.fillStyle = light;
            ctx.fillRect(-w * 0.08, -h * 0.60, w * 0.16, h * 0.10);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-w * 0.08, -h * 0.60, w * 0.16, h * 0.10);

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-w * 0.40, -h * 0.52);
            ctx.quadraticCurveTo(-w * 0.30, -h * 0.60, -w * 0.14, -h * 0.60);
            ctx.lineTo(w * 0.14, -h * 0.60);
            ctx.quadraticCurveTo(w * 0.30, -h * 0.60, w * 0.40, -h * 0.52);
            ctx.lineTo(w * 0.31, -h * 0.30);
            ctx.quadraticCurveTo(0, -h * 0.16, -w * 0.31, -h * 0.30);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.4;
            ctx.stroke();

            ctx.fillStyle = bodyGrad;
            ctx.fillRect(-w * 0.22, -h * 0.30, w * 0.44, h * 0.30);
            ctx.strokeRect(-w * 0.22, -h * 0.30, w * 0.44, h * 0.30);

        } else if (renderType === 'RENDER_ZOMBIE') {
            const headR = Math.max(w * 0.23, h * 0.15);
            const headCx = face * w * 0.02;
            const headCy = -h * 0.76;

            const skinBase = isDead ? '#6a6a6a' : light;
            const skinShade = isDead ? '#565656' : dark;
            const bloodMain = isDead ? 'rgba(90, 30, 30, 0.55)' : 'rgba(140, 25, 25, 0.82)';
            const bloodDark = isDead ? 'rgba(55, 18, 18, 0.55)' : 'rgba(75, 10, 10, 0.85)';
            const woundDark = isDead ? 'rgba(40, 16, 16, 0.70)' : 'rgba(55, 12, 12, 0.88)';

            ctx.fillStyle = skinBase;
            ctx.beginPath();
            ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.beginPath();
            ctx.ellipse(headCx - face * headR * 0.10, headCy - headR * 0.26, headR * 0.62, headR * 0.34, 0, 0, Math.PI * 2);
            ctx.fill();

            if (!isDead) {
                ctx.fillStyle = 'rgba(255, 70, 70, 0.95)';
                ctx.beginPath();
                ctx.arc(headCx + face * headR * 0.18, headCy - headR * 0.04, Math.max(2.6, w * 0.030), 0, Math.PI * 2);
                ctx.arc(headCx + face * headR * 0.36, headCy + headR * 0.01, Math.max(2.2, w * 0.026), 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255, 210, 210, 0.65)';
                ctx.beginPath();
                ctx.arc(headCx + face * headR * 0.16, headCy - headR * 0.08, Math.max(0.9, w * 0.010), 0, Math.PI * 2);
                ctx.arc(headCx + face * headR * 0.34, headCy - headR * 0.03, Math.max(0.8, w * 0.009), 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = 'rgba(120, 120, 120, 0.85)';
                ctx.beginPath();
                ctx.arc(headCx + face * headR * 0.18, headCy - headR * 0.04, Math.max(2.2, w * 0.026), 0, Math.PI * 2);
                ctx.arc(headCx + face * headR * 0.36, headCy + headR * 0.01, Math.max(2.0, w * 0.023), 0, Math.PI * 2);
                ctx.fill();
            }

            if (!isDead) {
                ctx.strokeStyle = woundDark;
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(headCx + face * headR * 0.10, headCy + headR * 0.30);
                ctx.lineTo(headCx + face * headR * 0.34, headCy + headR * 0.36);
                ctx.stroke();
            }

            ctx.strokeStyle = woundDark;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(headCx - face * headR * 0.10, headCy + headR * 0.02);
            ctx.lineTo(headCx + face * headR * 0.08, headCy + headR * 0.18);
            ctx.stroke();

            ctx.fillStyle = bloodMain;
            ctx.beginPath();
            ctx.arc(headCx + face * headR * 0.10, headCy + headR * 0.20, Math.max(1.8, w * 0.018), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = skinShade;
            ctx.fillRect(-w * 0.07, -h * 0.61, w * 0.14, h * 0.09);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-w * 0.07, -h * 0.61, w * 0.14, h * 0.09);

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-w * 0.38, -h * 0.54);
            ctx.quadraticCurveTo(-w * 0.30, -h * 0.61, -w * 0.12, -h * 0.60);
            ctx.lineTo(w * 0.12, -h * 0.60);
            ctx.quadraticCurveTo(w * 0.28, -h * 0.60, w * 0.36, -h * 0.52);
            ctx.lineTo(w * 0.28, -h * 0.28);
            ctx.quadraticCurveTo(0, -h * 0.18, -w * 0.28, -h * 0.28);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.3;
            ctx.stroke();

            ctx.fillStyle = bodyGrad;
            ctx.fillRect(-w * 0.22, -h * 0.28, w * 0.44, h * 0.28);
            ctx.strokeRect(-w * 0.22, -h * 0.28, w * 0.44, h * 0.28);

            ctx.strokeStyle = woundDark;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-w * 0.12, -h * 0.44);
            ctx.lineTo(w * 0.04, -h * 0.36);
            ctx.stroke();

            ctx.fillStyle = bloodMain;
            ctx.beginPath();
            ctx.ellipse(-w * 0.01, -h * 0.35, w * 0.05, h * 0.025, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = woundDark;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w * 0.10, -h * 0.20);
            ctx.lineTo(w * 0.22, -h * 0.11);
            ctx.stroke();

            ctx.fillStyle = bloodDark;
            ctx.beginPath();
            ctx.arc(w * 0.18, -h * 0.10, Math.max(1.8, w * 0.020), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = bloodMain;
            ctx.beginPath();
            ctx.arc(-w * 0.28, -h * 0.34, Math.max(1.6, w * 0.016), 0, Math.PI * 2);
            ctx.arc(w * 0.30, -h * 0.30, Math.max(1.4, w * 0.014), 0, Math.PI * 2);
            ctx.fill();

        } else {
            const isWitch = renderType === 'RENDER_WITCH';
            const headR = w * 0.20;
            const headCx = face * w * 0.02;
            const headCy = -h * 0.80;

            if (isWitch) {
                const capeGrad = ctx.createLinearGradient(0, -h * 0.64, 0, h * 0.08);
                capeGrad.addColorStop(0, 'rgba(88, 62, 138, 0.88)');
                capeGrad.addColorStop(0.55, 'rgba(52, 36, 86, 0.94)');
                capeGrad.addColorStop(1, 'rgba(22, 18, 36, 0.96)');

                ctx.fillStyle = capeGrad;
                ctx.strokeStyle = 'rgba(0,0,0,0.52)';
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(-w * 0.10, -h * 0.58);
                ctx.quadraticCurveTo(-w * 0.34, -h * 0.56, -w * 0.42, -h * 0.20);
                ctx.quadraticCurveTo(-w * 0.38, h * 0.02, -w * 0.18, -h * 0.04);
                ctx.quadraticCurveTo(-w * 0.06, -h * 0.22, -w * 0.05, -h * 0.52);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(w * 0.10, -h * 0.58);
                ctx.quadraticCurveTo(w * 0.34, -h * 0.56, w * 0.42, -h * 0.20);
                ctx.quadraticCurveTo(w * 0.38, h * 0.02, w * 0.18, -h * 0.04);
                ctx.quadraticCurveTo(w * 0.06, -h * 0.22, w * 0.05, -h * 0.52);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = 'rgba(66, 46, 108, 0.92)';
                ctx.beginPath();
                ctx.moveTo(-w * 0.13, -h * 0.60);
                ctx.quadraticCurveTo(0, -h * 0.70, w * 0.13, -h * 0.60);
                ctx.lineTo(w * 0.08, -h * 0.54);
                ctx.quadraticCurveTo(0, -h * 0.59, -w * 0.08, -h * 0.54);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = 'rgba(180, 210, 255, 0.12)';
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.moveTo(-w * 0.10, -h * 0.53);
                ctx.quadraticCurveTo(-w * 0.18, -h * 0.28, -w * 0.16, -h * 0.06);
                ctx.moveTo(w * 0.10, -h * 0.53);
                ctx.quadraticCurveTo(w * 0.18, -h * 0.28, w * 0.16, -h * 0.06);
                ctx.stroke();
            }

            ctx.fillStyle = light;
            ctx.beginPath();
            ctx.arc(headCx, headCy, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = light;
            ctx.fillRect(-w * 0.055, -h * 0.70, w * 0.11, h * 0.10);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-w * 0.055, -h * 0.70, w * 0.11, h * 0.10);

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-w * 0.42, -h * 0.60);
            ctx.quadraticCurveTo(-w * 0.33, -h * 0.70, -w * 0.14, -h * 0.70);
            ctx.lineTo(w * 0.14, -h * 0.70);
            ctx.quadraticCurveTo(w * 0.33, -h * 0.70, w * 0.42, -h * 0.60);
            ctx.lineTo(w * 0.34, -h * 0.36);
            ctx.quadraticCurveTo(0, -h * 0.24, -w * 0.34, -h * 0.36);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2.4;
            ctx.stroke();

            ctx.fillStyle = bodyGrad;
            ctx.fillRect(-w * 0.24, -h * 0.36, w * 0.48, h * 0.36);
            ctx.strokeRect(-w * 0.24, -h * 0.36, w * 0.48, h * 0.36);

            if (isWitch) {
                ctx.fillStyle = eyeColor;
                ctx.beginPath();
                ctx.arc(headCx + face * headR * 0.18, headCy - headR * 0.03, Math.max(2.1, w * 0.020), 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255,255,255,0.75)';
                ctx.beginPath();
                ctx.arc(headCx + face * headR * 0.14, headCy - headR * 0.08, Math.max(0.8, w * 0.008), 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.strokeStyle = eyeColor;
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(headCx + face * headR * 0.14, headCy - headR * 0.02);
                ctx.lineTo(headCx + face * headR * 0.30, headCy + headR * 0.01);
                ctx.stroke();
            }
        }

        ctx.restore();
    },
};
