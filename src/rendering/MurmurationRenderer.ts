import * as THREE from 'three';
import type { Boid } from '../entities/Boid';

const HORIZON_COLOR = new THREE.Color(0xd4763a); // warm orange
const ZENITH_COLOR = new THREE.Color(0x1a2a4a);  // deep blue
const GROUND_COLOR = new THREE.Color(0x3a4a2a);  // muted green-brown
const BIRD_COLOR = new THREE.Color(0x1a1a1a);     // dark silhouette

export class MurmurationRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private instancedMesh: THREE.InstancedMesh;
  private overlayCanvas: HTMLCanvasElement;
  private dummy = new THREE.Object3D();
  private maxCount: number;
  private time = 0;

  // Camera sway
  private baseCameraRotX: number;

  constructor(width: number, height: number, maxBoids: number) {
    this.maxCount = maxBoids;

    // Create overlay canvas
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;';
    this.overlayCanvas.width = width;
    this.overlayCanvas.height = height;
    document.body.appendChild(this.overlayCanvas);

    // WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.overlayCanvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Scene
    this.scene = new THREE.Scene();

    // Sky gradient via vertex colors on a large sphere
    this.setupSky();

    // Fog for depth
    this.scene.fog = new THREE.Fog(HORIZON_COLOR, 100, 300);

    // Camera — ground-level, angled up
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);
    this.camera.position.set(0, 2, 0);
    this.baseCameraRotX = 0.6; // look upward (positive X rotation in Three.js)
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.x = this.baseCameraRotX;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xd4963a, 0x2a3a2a, 0.8);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffaa44, 1.2);
    sunLight.position.set(-50, 20, -30);
    this.scene.add(sunLight);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshLambertMaterial({ color: GROUND_COLOR });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    this.scene.add(ground);

    // Instanced boid mesh — small chevron/V shape
    const boidGeo = this.createBoidGeometry();
    const boidMat = new THREE.MeshLambertMaterial({
      color: BIRD_COLOR,
      side: THREE.DoubleSide,
    });
    this.instancedMesh = new THREE.InstancedMesh(boidGeo, boidMat, maxBoids);
    this.instancedMesh.frustumCulled = false;
    this.scene.add(this.instancedMesh);
  }

  private createBoidGeometry(): THREE.BufferGeometry {
    // Small V-shape chevron — ~4 triangles
    const geo = new THREE.BufferGeometry();
    // Wing span ~1.2, body length ~0.8
    // Scale factor — needs to be visible at 50-80 unit distances
    const s = 1.5;
    const vertices = new Float32Array([
      // Left wing (two triangles)
       0.0,       0.0,      -0.4 * s,  // nose
      -0.6 * s,   0.0,       0.4 * s,  // left wingtip
       0.0,       0.05 * s,  0.15 * s, // body center top

       0.0,       0.0,      -0.4 * s,
       0.0,      -0.05 * s,  0.15 * s,
      -0.6 * s,   0.0,       0.4 * s,

      // Right wing (two triangles)
       0.0,       0.0,      -0.4 * s,
       0.0,       0.05 * s,  0.15 * s,
       0.6 * s,   0.0,       0.4 * s,  // right wingtip

       0.0,       0.0,      -0.4 * s,
       0.6 * s,   0.0,       0.4 * s,
       0.0,      -0.05 * s,  0.15 * s,
    ]);

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }

  private setupSky(): void {
    // Large inverted sphere with vertex color gradient
    const skyGeo = new THREE.SphereGeometry(400, 32, 16);
    const posAttr = skyGeo.getAttribute('position') as THREE.BufferAttribute;
    const colors = new Float32Array(posAttr.count * 3);

    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      // Map y from [-400, 400] to blend factor [0, 1]
      const t = Math.max(0, y / 400); // 0 at horizon, 1 at zenith
      const smoothT = t * t; // bias toward horizon color
      const r = HORIZON_COLOR.r + (ZENITH_COLOR.r - HORIZON_COLOR.r) * smoothT;
      const g = HORIZON_COLOR.g + (ZENITH_COLOR.g - HORIZON_COLOR.g) * smoothT;
      const b = HORIZON_COLOR.b + (ZENITH_COLOR.b - HORIZON_COLOR.b) * smoothT;
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    skyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const skyMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }

  updateBoids(boids: Boid[], dt: number): void {
    this.time += dt;

    // Subtle camera sway
    this.camera.rotation.x = this.baseCameraRotX + Math.sin(this.time * 0.15) * 0.015;
    this.camera.rotation.y = Math.sin(this.time * 0.1) * 0.02;

    // Update instanced mesh matrices
    for (let i = 0; i < boids.length; i++) {
      const boid = boids[i]!;

      if (boid.spawnOpacity <= 0) {
        // Hide — scale to zero
        this.dummy.position.set(0, -1000, 0);
        this.dummy.scale.set(0, 0, 0);
      } else {
        this.dummy.position.copy(boid.position);
        this.dummy.quaternion.copy(boid.heading);
        // Scale with spawn opacity
        const s = Math.min(boid.spawnOpacity, 1);
        this.dummy.scale.set(s, s, s);
      }

      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    // Hide unused instances
    for (let i = boids.length; i < this.maxCount; i++) {
      this.dummy.position.set(0, -1000, 0);
      this.dummy.scale.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    this.overlayCanvas.width = width;
    this.overlayCanvas.height = height;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.renderer.dispose();
    this.instancedMesh.geometry.dispose();
    (this.instancedMesh.material as THREE.Material).dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    this.overlayCanvas.remove();
  }
}
