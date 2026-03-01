import type { Bird } from '../entities/Bird';

export function renderBird(ctx: CanvasRenderingContext2D, bird: Bird, time: number): void {
  if (bird.spawnOpacity <= 0) return;

  const s = bird.sizeScale;
  const bodyW = 8 * s;
  const bodyH = 6 * s;

  ctx.save();
  ctx.globalAlpha = Math.min(bird.spawnOpacity, 1);
  ctx.translate(bird.x, bird.y);

  // Vertical clinging for woodpeckers/nuthatches on trunk or suet
  const isClinging = bird.variety.clingsVertical &&
    bird.targetPerch &&
    (bird.targetPerch.type === 'trunk' || bird.targetPerch.type === 'feeder-suet') &&
    !bird.isFlying;

  if (isClinging) {
    // Rotate 90° to cling vertically
    const dir = bird.variety.headDown ? 1 : -1;
    ctx.rotate(dir * Math.PI * 0.5);
    if (bird.targetPerch?.facing === 'left') {
      ctx.scale(-1, 1);
    }
  } else {
    if (!bird.facingRight) {
      ctx.scale(-1, 1);
    }
  }

  // Hop bounce
  const isHopping = bird.state === 'hopping';
  if (isHopping) {
    const bounce = -Math.sin(bird.flightProgress * Math.PI) * 6;
    ctx.translate(0, bounce);
  }

  // Body bob (when perched)
  if (!bird.isFlying && bird.state !== 'hopping') {
    const bob = Math.sin(bird.bodyBobPhase) * 0.5;
    ctx.translate(0, bob);
  }

  // --- Shadow (only when on ground/perched) ---
  if (!bird.isFlying) {
    ctx.save();
    ctx.globalAlpha *= 0.12;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, bodyH + 2, bodyW * 0.8, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- Legs (hidden during flight) ---
  if (!bird.isFlying) {
    ctx.strokeStyle = '#4a4040';
    ctx.lineWidth = 0.8 * s;
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.15, bodyH * 0.5);
    ctx.lineTo(-bodyW * 0.15, bodyH + 3 * s);
    ctx.stroke();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(bodyW * 0.15, bodyH * 0.5);
    ctx.lineTo(bodyW * 0.15, bodyH + 3 * s);
    ctx.stroke();
    // Feet
    ctx.lineWidth = 0.6 * s;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.3, bodyH + 3 * s);
    ctx.lineTo(0, bodyH + 3 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, bodyH + 3 * s);
    ctx.lineTo(bodyW * 0.3, bodyH + 3 * s);
    ctx.stroke();
  }

  // --- Body ---
  ctx.fillStyle = bird.variety.bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyW, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Breast
  ctx.fillStyle = bird.variety.breastColor;
  ctx.beginPath();
  ctx.ellipse(bodyW * 0.2, bodyH * 0.1, bodyW * 0.6, bodyH * 0.7, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // --- Wing ---
  if (bird.isFlying || bird.state === 'landing' || bird.state === 'bathing') {
    // Flapping wing
    const flapAngle = Math.sin(bird.wingPhase) * 0.8;
    ctx.save();
    ctx.rotate(flapAngle);
    ctx.fillStyle = bird.variety.wingColor;
    ctx.beginPath();
    ctx.ellipse(0, -bodyH * 0.6, bodyW * 0.6, bodyH * 1.2 * s, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Wing bar accent
    if (bird.variety.accentColor && (bird.variety.id === 'oriole' || bird.variety.id === 'goldfinch')) {
      ctx.fillStyle = bird.variety.accentColor;
      ctx.beginPath();
      ctx.ellipse(0, -bodyH * 0.7, bodyW * 0.15, bodyH * 0.8 * s, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else {
    // Folded wing
    ctx.fillStyle = bird.variety.wingColor;
    ctx.beginPath();
    ctx.ellipse(-bodyW * 0.1, 0, bodyW * 0.75, bodyH * 0.7, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Wing bar accent
    if (bird.variety.accentColor && (bird.variety.id === 'oriole' || bird.variety.id === 'goldfinch')) {
      ctx.fillStyle = bird.variety.accentColor;
      ctx.beginPath();
      ctx.ellipse(-bodyW * 0.15, 0, bodyW * 0.12, bodyH * 0.5, -0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Head ---
  const headX = bodyW * 0.65;
  const headY = -bodyH * 0.55;
  const headR = bodyW * 0.45;

  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(bird.headAngle * 0.3);

  // Dove head bob offset
  if (bird.variety.id === 'dove' && Math.abs(bird.wanderVx) > 1) {
    const bobOffset = Math.sin(bird.headBobPhase) * 2;
    ctx.translate(bobOffset, 0);
  }

  ctx.fillStyle = bird.variety.headColor;
  ctx.beginPath();
  ctx.arc(0, 0, headR, 0, Math.PI * 2);
  ctx.fill();

  // Species-specific head markings
  renderHeadMarkings(ctx, bird, headR);

  // Eye
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(headR * 0.35, -headR * 0.15, headR * 0.18, 0, Math.PI * 2);
  ctx.fill();
  // Eye highlight
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(headR * 0.4, -headR * 0.22, headR * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = bird.variety.beakColor;
  ctx.beginPath();
  const beakLen = headR * (bird.variety.id === 'nuthatch' ? 1.2 : 0.8);
  ctx.moveTo(headR * 0.7, -headR * 0.1);
  ctx.lineTo(headR * 0.7 + beakLen, headR * 0.05);
  ctx.lineTo(headR * 0.7, headR * 0.2);
  ctx.closePath();
  ctx.fill();

  // Crest
  if (bird.variety.hasCrest) {
    ctx.fillStyle = bird.variety.headColor;
    ctx.beginPath();
    ctx.moveTo(-headR * 0.1, -headR * 0.7);
    ctx.lineTo(headR * 0.1, -headR * 1.4);
    ctx.lineTo(headR * 0.4, -headR * 0.7);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore(); // head

  // --- Tail ---
  renderTail(ctx, bird, bodyW, bodyH, time);

  ctx.restore(); // main
}

function renderHeadMarkings(ctx: CanvasRenderingContext2D, bird: Bird, headR: number): void {
  switch (bird.variety.id) {
    case 'cardinal-m':
      // Black face mask
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(headR * 0.3, headR * 0.1, headR * 0.4, headR * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'chickadee':
      // White cheeks
      ctx.fillStyle = '#f0ede8';
      ctx.beginPath();
      ctx.ellipse(headR * 0.2, 0, headR * 0.35, headR * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Black bib
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(headR * 0.2, headR * 0.45, headR * 0.3, headR * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'blue-jay':
      // Black necklace
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, headR * 0.85, Math.PI * 0.3, Math.PI * 0.7);
      ctx.stroke();
      break;

    case 'nuthatch':
      // Black cap stripe
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(0, -headR * 0.3, headR * 0.6, headR * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'goldfinch':
      // Black forehead
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(headR * 0.1, -headR * 0.5, headR * 0.3, headR * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'wren':
      // White eyebrow stripe
      ctx.fillStyle = '#f0ede8';
      ctx.beginPath();
      ctx.ellipse(0, -headR * 0.3, headR * 0.5, headR * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'downy-wp':
      // Red nape spot
      ctx.fillStyle = '#cc2222';
      ctx.beginPath();
      ctx.arc(-headR * 0.3, -headR * 0.1, headR * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // White back stripe (on head)
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.ellipse(-headR * 0.2, 0, headR * 0.15, headR * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'rb-wp':
      // Red cap extends from nape to bill
      ctx.fillStyle = '#cc3322';
      ctx.beginPath();
      ctx.ellipse(0, -headR * 0.35, headR * 0.5, headR * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

function renderTail(
  ctx: CanvasRenderingContext2D,
  bird: Bird,
  bodyW: number,
  bodyH: number,
  _time: number,
): void {
  const tailFlick = bird.tailFlickTimer < 0.3 ? Math.sin(bird.tailFlickTimer * 20) * 3 : 0;

  ctx.fillStyle = bird.variety.wingColor;

  switch (bird.variety.tailStyle) {
    case 'short':
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.7, -bodyH * 0.1);
      ctx.lineTo(-bodyW * 1.1, -bodyH * 0.2 + tailFlick);
      ctx.lineTo(-bodyW * 1.0, bodyH * 0.15 + tailFlick);
      ctx.lineTo(-bodyW * 0.7, bodyH * 0.2);
      ctx.closePath();
      ctx.fill();
      break;

    case 'medium':
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.7, -bodyH * 0.15);
      ctx.lineTo(-bodyW * 1.4, -bodyH * 0.25 + tailFlick);
      ctx.lineTo(-bodyW * 1.3, bodyH * 0.1 + tailFlick);
      ctx.lineTo(-bodyW * 0.7, bodyH * 0.2);
      ctx.closePath();
      ctx.fill();
      break;

    case 'long':
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.7, -bodyH * 0.15);
      ctx.lineTo(-bodyW * 1.8, -bodyH * 0.3 + tailFlick);
      ctx.lineTo(-bodyW * 1.6, bodyH * 0.1 + tailFlick);
      ctx.lineTo(-bodyW * 0.7, bodyH * 0.2);
      ctx.closePath();
      ctx.fill();

      // Junco white outer tail feathers
      if (bird.variety.id === 'junco') {
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.moveTo(-bodyW * 1.5, -bodyH * 0.28 + tailFlick);
        ctx.lineTo(-bodyW * 1.8, -bodyH * 0.3 + tailFlick);
        ctx.lineTo(-bodyW * 1.65, bodyH * 0.05 + tailFlick);
        ctx.lineTo(-bodyW * 1.5, bodyH * 0.02 + tailFlick);
        ctx.closePath();
        ctx.fill();
      }
      break;

    case 'pointed':
      // Mourning dove — long pointed tail
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.7, -bodyH * 0.1);
      ctx.lineTo(-bodyW * 2.0, 0 + tailFlick);
      ctx.lineTo(-bodyW * 0.7, bodyH * 0.1);
      ctx.closePath();
      ctx.fill();
      break;

    case 'cocked':
      // Wren — tail cocked upward at 45°
      ctx.save();
      ctx.translate(-bodyW * 0.7, -bodyH * 0.1);
      ctx.rotate(-Math.PI * 0.25);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-bodyW * 0.8, -bodyH * 0.15 + tailFlick);
      ctx.lineTo(-bodyW * 0.7, bodyH * 0.1 + tailFlick);
      ctx.lineTo(0, bodyH * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
  }
}
