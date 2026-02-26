import { randomRange } from '../utils/math';

interface Star {
  x: number;
  y: number;
  radius: number;
  phase: number;
  brightness: number;
}

interface GrassBlade {
  x: number;
  height: number;
  width: number;
  phase: number;
  curve: number;
}

interface FogBand {
  y: number;
  width: number;
  height: number;
  phase: number;
  alpha: number;
}

interface TreePeak {
  x: number;
  height: number;
}

const PI = Math.PI;
const TWO_PI = PI * 2;

export class FireflyFieldRenderer {
  private stars: Star[] = [];
  private grassBlades: GrassBlade[] = [];
  private fogBands: FogBand[] = [];
  private distantHillPoints: number[] = [];
  private treePeaks: TreePeak[] = [];
  private width: number;
  private height: number;

  // Moon — randomized once per session, stable across resize
  private moonArcT: number;        // 0–1 position along the rising/setting arc
  private moonIllumination: number; // 0–1 how much is lit
  private moonWaxing: boolean;     // which side is lit
  private moonX: number = 0;
  private moonY: number = 0;
  private moonR: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    // Random illumination (uniform) then derive phase, so crescents
    // are just as likely as gibbous/full
    this.moonIllumination = randomRange(0.1, 1.0);
    // Randomly waxing or waning
    this.moonWaxing = Math.random() < 0.5;
    // Derive phase from illumination (inverse of sin mapping)

    // Random position along the arc
    this.moonArcT = randomRange(0.1, 0.9);

    this.generate();
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.generate();
  }

  private computeMoonPosition(): void {
    this.moonR = Math.min(this.width, this.height) * 0.04;
    // Arc: low on sides, high at center
    this.moonX = this.width * (0.12 + 0.76 * this.moonArcT);
    this.moonY = this.height * (0.42 - 0.32 * Math.sin(this.moonArcT * PI));
  }

  private generate(): void {
    this.computeMoonPosition();

    // Stars (~100)
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: randomRange(0, this.width),
        y: randomRange(0, this.height * 0.45),
        radius: randomRange(0.4, 1.5),
        phase: randomRange(0, TWO_PI),
        brightness: randomRange(0.3, 0.9),
      });
    }

    // Distant hills — smooth sine-based profile
    const hillSegments = 20;
    this.distantHillPoints = [];
    for (let i = 0; i <= hillSegments; i++) {
      const t = i / hillSegments;
      const baseY = this.height * 0.55;
      const hill = Math.sin(t * PI * 2.3) * this.height * 0.06
        + Math.sin(t * PI * 1.1 + 1) * this.height * 0.04;
      this.distantHillPoints.push(baseY + hill);
    }

    // Tree peaks — jagged silhouette
    this.treePeaks = [];
    const treeCount = Math.floor(this.width / 25);
    for (let i = 0; i < treeCount; i++) {
      this.treePeaks.push({
        x: (i / treeCount) * this.width + randomRange(-5, 5),
        height: randomRange(this.height * 0.08, this.height * 0.18),
      });
    }

    // Dense meadow grass — blades every ~4–6px across the full width
    this.grassBlades = [];
    const bladeCount = Math.ceil(this.width / 5);
    for (let i = 0; i < bladeCount; i++) {
      const baseX = (i / bladeCount) * this.width + randomRange(-3, 3);
      // Back layer — shorter, thinner
      this.grassBlades.push({
        x: baseX + randomRange(-2, 2),
        height: randomRange(10, 22),
        width: randomRange(1, 2.5),
        phase: randomRange(0, TWO_PI),
        curve: randomRange(5, 12),
      });
      // Mid layer
      this.grassBlades.push({
        x: baseX + randomRange(-3, 3),
        height: randomRange(18, 35),
        width: randomRange(1.5, 3.5),
        phase: randomRange(0, TWO_PI),
        curve: randomRange(8, 18),
      });
      // Front layer — tallest, thickest
      if (Math.random() < 0.6) {
        this.grassBlades.push({
          x: baseX + randomRange(-4, 4),
          height: randomRange(28, 50),
          width: randomRange(2, 4.5),
          phase: randomRange(0, TWO_PI),
          curve: randomRange(10, 25),
        });
      }
    }

    // Fog bands — clustered together so they overlap into a thick layer
    const grassY = this.height * 0.87;
    const fogCenter = grassY - 115; // center of the fog bank
    this.fogBands = [];
    for (let i = 0; i < 7; i++) {
      this.fogBands.push({
        y: fogCenter + randomRange(-25, 25),
        width: randomRange(this.width * 0.4, this.width * 0.8),
        height: randomRange(25, 50),
        phase: randomRange(0, TWO_PI),
        alpha: randomRange(0.03, 0.07),
      });
    }
  }

  renderSky(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0e24');       // deep navy top
    grad.addColorStop(0.4, '#1a1040');     // purple-blue mid
    grad.addColorStop(0.7, '#2a1830');     // warm purple horizon
    grad.addColorStop(1, '#1a1020');       // dark ground
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  renderStars(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();

    // Clip out the full moon disc so no stars show through the dark side
    const clip = new Path2D();
    clip.rect(0, 0, this.width, this.height);
    clip.arc(this.moonX, this.moonY, this.moonR + 2, 0, TWO_PI, true);
    ctx.clip(clip, 'evenodd');

    for (const s of this.stars) {
      const twinkle = 0.5 + Math.sin(time * 1.5 + s.phase) * 0.3
        + Math.sin(time * 3.7 + s.phase * 2) * 0.2;
      ctx.globalAlpha = s.brightness * twinkle;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, TWO_PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  renderMoon(ctx: CanvasRenderingContext2D): void {
    const { moonX, moonY, moonR, moonIllumination, moonWaxing } = this;

    if (moonIllumination < 0.02) return;

    ctx.save();

    // Glow halo — intensity scales with illumination
    ctx.globalCompositeOperation = 'lighter';
    const haloR = moonR * 6;
    const haloAlpha = 0.06 + moonIllumination * 0.08;
    const haloGrad = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, haloR);
    haloGrad.addColorStop(0, `rgba(180, 190, 220, ${haloAlpha})`);
    haloGrad.addColorStop(0.3, `rgba(150, 160, 200, ${haloAlpha * 0.5})`);
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(moonX - haloR, moonY - haloR, haloR * 2, haloR * 2);
    ctx.globalCompositeOperation = 'source-over';

    // Faint dark-side disc (earthshine — very subtle)
    ctx.fillStyle = 'rgba(40, 45, 60, 0.15)';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, TWO_PI);
    ctx.fill();

    // Lit portion
    ctx.fillStyle = '#d8dce8';

    if (moonIllumination > 0.98) {
      // Full moon
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, TWO_PI);
      ctx.fill();
    } else {
      const isGibbous = moonIllumination > 0.5;
      // Terminator x-radius: 0 at half, moonR at new/full
      const tXR = Math.abs(2 * moonIllumination - 1) * moonR;

      ctx.beginPath();
      if (moonWaxing) {
        // Lit limb on right: right semicircle (top → right → bottom)
        ctx.arc(moonX, moonY, moonR, -PI * 0.5, PI * 0.5, false);
        // Terminator from bottom back to top
        if (isGibbous) {
          // Gibbous: terminator curves left (clockwise = via left)
          ctx.ellipse(moonX, moonY, tXR, moonR, 0, PI * 0.5, -PI * 0.5, false);
        } else {
          // Crescent: terminator curves right (anticlockwise = via right)
          ctx.ellipse(moonX, moonY, tXR, moonR, 0, PI * 0.5, -PI * 0.5, true);
        }
      } else {
        // Lit limb on left: left semicircle (bottom → left → top)
        ctx.arc(moonX, moonY, moonR, PI * 0.5, -PI * 0.5, false);
        // Terminator from top back to bottom
        if (isGibbous) {
          // Gibbous: terminator curves right (clockwise = via right)
          ctx.ellipse(moonX, moonY, tXR, moonR, 0, -PI * 0.5, PI * 0.5, false);
        } else {
          // Crescent: terminator curves left (anticlockwise = via left)
          ctx.ellipse(moonX, moonY, tXR, moonR, 0, -PI * 0.5, PI * 0.5, true);
        }
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  renderTreeline(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Distant hills layer
    ctx.fillStyle = '#0d0f18';
    ctx.beginPath();
    ctx.moveTo(0, h);
    const segCount = this.distantHillPoints.length - 1;
    for (let i = 0; i <= segCount; i++) {
      ctx.lineTo((i / segCount) * w, this.distantHillPoints[i]!);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Nearer tree silhouette layer
    const treeBaseY = h * 0.58;
    ctx.fillStyle = '#080a12';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, treeBaseY);
    for (const peak of this.treePeaks) {
      // Trunk base
      ctx.lineTo(peak.x - 4, treeBaseY);
      // Peak
      ctx.lineTo(peak.x, treeBaseY - peak.height);
      // Down
      ctx.lineTo(peak.x + 4, treeBaseY);
    }
    ctx.lineTo(w, treeBaseY);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  renderGrass(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    grassLineY: number,
    time: number,
  ): void {
    // Ground fill below grass line
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, grassLineY, w, h - grassLineY);

    // Grass blades — darker short blades in back, slightly lighter tall ones in front
    ctx.lineCap = 'round';
    for (const blade of this.grassBlades) {
      const sway = Math.sin(time * 1.2 + blade.phase) * blade.curve * 0.3;
      // Taller blades are slightly brighter (closer / more lit)
      const brightness = 8 + Math.floor((blade.height / 50) * 12);
      ctx.strokeStyle = `rgb(${brightness}, ${brightness + 4}, ${brightness - 2})`;
      ctx.lineWidth = blade.width;
      ctx.beginPath();
      ctx.moveTo(blade.x, grassLineY);
      ctx.quadraticCurveTo(
        blade.x + sway,
        grassLineY - blade.height * 0.6,
        blade.x + sway * 1.5,
        grassLineY - blade.height,
      );
      ctx.stroke();
    }
  }

  renderFog(
    ctx: CanvasRenderingContext2D,
    w: number,
    time: number,
  ): void {
    ctx.save();
    for (const band of this.fogBands) {
      // Each band drifts at its own speed with layered sine waves
      const drift = Math.sin(time * 0.07 + band.phase) * 80
        + Math.sin(time * 0.03 + band.phase * 2.3) * 50;
      const cx = w / 2 + drift;
      // Vertical bob
      const yOff = Math.sin(time * 0.04 + band.phase * 1.7) * 8;
      // Breathing opacity
      const breathe = 0.6 + Math.sin(time * 0.09 + band.phase * 0.8) * 0.3
        + Math.sin(time * 0.05 + band.phase * 1.5) * 0.1;
      const alpha = band.alpha * breathe;
      // Width pulses gently
      const bw = band.width * (0.9 + Math.sin(time * 0.06 + band.phase) * 0.1);

      const grad = ctx.createRadialGradient(
        cx, band.y + yOff, 0,
        cx, band.y + yOff, bw,
      );
      grad.addColorStop(0, `rgba(180, 190, 210, ${alpha})`);
      grad.addColorStop(0.6, `rgba(180, 190, 210, ${alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(180, 190, 210, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, band.y + yOff - band.height, w, band.height * 2);
    }
    ctx.restore();
  }

  renderVignette(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const edgeGrad = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.3,
      w / 2, h / 2, Math.max(w, h) * 0.75,
    );
    edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    edgeGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
    edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, w, h);
  }
}
