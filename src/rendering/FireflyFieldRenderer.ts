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

export class FireflyFieldRenderer {
  private stars: Star[] = [];
  private grassBlades: GrassBlade[] = [];
  private fogBands: FogBand[] = [];
  private distantHillPoints: number[] = [];
  private treePeaks: TreePeak[] = [];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.generate();
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.generate();
  }

  private generate(): void {
    // Stars (~100)
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: randomRange(0, this.width),
        y: randomRange(0, this.height * 0.45),
        radius: randomRange(0.4, 1.5),
        phase: randomRange(0, Math.PI * 2),
        brightness: randomRange(0.3, 0.9),
      });
    }

    // Distant hills — smooth sine-based profile
    const hillSegments = 20;
    this.distantHillPoints = [];
    for (let i = 0; i <= hillSegments; i++) {
      const t = i / hillSegments;
      const baseY = this.height * 0.55;
      const hill = Math.sin(t * Math.PI * 2.3) * this.height * 0.06
        + Math.sin(t * Math.PI * 1.1 + 1) * this.height * 0.04;
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

    // Grass blades (~80)
    this.grassBlades = [];
    for (let i = 0; i < 80; i++) {
      this.grassBlades.push({
        x: randomRange(0, this.width),
        height: randomRange(15, 40),
        width: randomRange(2, 5),
        phase: randomRange(0, Math.PI * 2),
        curve: randomRange(8, 20),
      });
    }

    // Fog bands (4-5)
    this.fogBands = [];
    for (let i = 0; i < 5; i++) {
      this.fogBands.push({
        y: this.height * randomRange(0.7, 0.85),
        width: randomRange(this.width * 0.3, this.width * 0.7),
        height: randomRange(20, 50),
        phase: randomRange(0, Math.PI * 2),
        alpha: randomRange(0.03, 0.08),
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
    for (const s of this.stars) {
      const twinkle = 0.5 + Math.sin(time * 1.5 + s.phase) * 0.3
        + Math.sin(time * 3.7 + s.phase * 2) * 0.2;
      ctx.globalAlpha = s.brightness * twinkle;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  renderMoon(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const moonX = w * 0.78;
    const moonY = h * 0.12;
    const moonR = Math.min(w, h) * 0.04;

    ctx.save();

    // Glow halo
    ctx.globalCompositeOperation = 'lighter';
    const haloR = moonR * 6;
    const haloGrad = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, haloR);
    haloGrad.addColorStop(0, 'rgba(180, 190, 220, 0.12)');
    haloGrad.addColorStop(0.3, 'rgba(150, 160, 200, 0.06)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(moonX - haloR, moonY - haloR, haloR * 2, haloR * 2);
    ctx.globalCompositeOperation = 'source-over';

    // Moon disc
    ctx.fillStyle = '#d8dce8';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Crescent shadow — offset circle in sky color
    ctx.fillStyle = '#0a0e24';
    ctx.beginPath();
    ctx.arc(moonX + moonR * 0.35, moonY - moonR * 0.1, moonR * 0.85, 0, Math.PI * 2);
    ctx.fill();

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

    // Grass blades
    ctx.strokeStyle = '#0c1008';
    ctx.lineCap = 'round';
    for (const blade of this.grassBlades) {
      const sway = Math.sin(time * 1.2 + blade.phase) * blade.curve * 0.3;
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
      const drift = Math.sin(time * 0.05 + band.phase) * 40;
      const cx = w / 2 + drift;
      const grad = ctx.createRadialGradient(
        cx, band.y, 0,
        cx, band.y, band.width,
      );
      grad.addColorStop(0, `rgba(180, 190, 210, ${band.alpha})`);
      grad.addColorStop(1, 'rgba(180, 190, 210, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, band.y - band.height, w, band.height * 2);
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
