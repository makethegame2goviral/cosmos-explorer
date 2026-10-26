import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PLANETS, QUIZ } from "./data/planets.js";
import { SUN, DEEPSPACE } from "./data/deepspace.js";

const canvas = document.getElementById("scene");
const panel = document.getElementById("planetPanel");
const loader = document.getElementById("loader");
const quizOverlay = document.getElementById("quizOverlay");
const scoreElement = document.getElementById("score");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x01020a, 0.0011);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 4000);
camera.position.set(0, 34, 70);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3;
controls.maxDistance = 1400;
controls.zoomSpeed = 1.2;
controls.screenSpacePanning = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
scene.add(new THREE.HemisphereLight(0x8899ff, 0x0a0a1a, 0.4));

const sunLight = new THREE.PointLight(0xffd9a0, 2400, 800, 2);
scene.add(sunLight);

const texLoader = new THREE.TextureLoader();

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.45)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const glowTexture = makeGlowTexture();

function createStarfield() {
  const count = 14000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const radius = 1500 + Math.random() * 400;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const tint = 0.68 + Math.random() * 0.32;
    colors[i * 3] = tint;
    colors[i * 3 + 1] = tint;
    colors[i * 3 + 2] = Math.min(1, tint + Math.random() * 0.3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
    vertexColors: true,
    map: glowTexture,
    size: 5.5,
    sizeAttenuation: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false
  })));
}

function makeTexture(baseColor, style) {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const color = new THREE.Color(baseColor);
  const rgb = `${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)}`;

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, `rgb(${rgb})`);
  gradient.addColorStop(1, `rgba(${rgb},0.7)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  if (style === "earth") {
    ctx.fillStyle = "#1c5fb0";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#2e8b4a";
    for (let i = 0; i < 42; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * size, Math.random() * size, 25 + Math.random() * 105, 15 + Math.random() * 60, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(240,248,255,0.9)";
    ctx.beginPath(); ctx.ellipse(size / 2, 0, size * 0.5, 70, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(size / 2, size, size * 0.5, 70, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * size, Math.random() * size, 20 + Math.random() * 100, 7 + Math.random() * 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (style === "gas") {
    const light = `rgba(255,255,255,0.22)`;
    const dark = `rgba(0,0,0,0.26)`;
    for (let y = 0; y < size; y += 4) {
      const wave = Math.sin(y * 0.028) * 22;
      ctx.fillStyle = Math.sin(y * 0.05) > 0 ? light : dark;
      ctx.fillRect(0, y + wave, size, 3);
    }
    ctx.fillStyle = "rgba(190,65,30,0.6)";
    ctx.beginPath();
    ctx.ellipse(size * 0.66, size * 0.63, 75, 36, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (style === "rock") {
    for (let i = 0; i < 3200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 17 + 1;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fill();
      ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.fill();
    }
  }

  if (style === "ice") {
    for (let i = 0; i < 2200; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 26 + 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.28})`;
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function textureStyle(planet) {
  if (planet.id === "earth") return "earth";
  if (planet.type === "Gasriese") return "gas";
  if (planet.type === "Eisriese") return "ice";
  return "rock";
}

const PLANET_TEXTURES = {
  mercury: "textures/mercury.jpg",
  venus: "textures/venus_atmosphere.jpg",
  earth: "textures/earth_daymap.jpg",
  mars: "textures/mars.jpg",
  jupiter: "textures/jupiter.jpg",
  saturn: "textures/saturn.jpg",
  uranus: "textures/uranus.jpg",
  neptune: "textures/neptune.jpg"
};

function applyTexture(mesh, url, baseColor, style) {
  const material = mesh.material;
  material.map = makeTexture(baseColor, style);
  texLoader.load(url, texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    material.map = texture;
    material.needsUpdate = true;
  }, undefined, () => {});
}

function createOrbit(radius, color = 0x6b84c9, opacity = 0.35) {
  const points = [];
  for (let i = 0; i <= 240; i++) {
    const angle = (i / 240) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  ));
}

const clickables = [];
const planetMeshes = [];
const planetObjects = [];
const moons = [];
let earthMesh = null;
let earthClouds = null;

function createPlanets() {
  PLANETS.forEach(data => {
    createOrbit(data.orbitRadius);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius, 112, 112),
      new THREE.MeshStandardMaterial({
        roughness: 0.74,
        metalness: 0.06,
        emissive: new THREE.Color(data.color).multiplyScalar(0.07)
      })
    );
    mesh.userData = data;
    scene.add(mesh);
    planetMeshes.push(mesh);
    clickables.push(mesh);
    planetObjects.push({ data, mesh, angle: Math.random() * Math.PI * 2 });

    applyTexture(mesh, PLANET_TEXTURES[data.id], data.color, textureStyle(data));

    if (data.id === "earth") {
      earthMesh = mesh;
      earthClouds = new THREE.Mesh(
        new THREE.SphereGeometry(data.radius * 1.03, 96, 96),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          alphaMap: null,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          emissive: 0x222233
        })
      );
      texLoader.load("textures/earth_clouds.jpg", texture => {
        earthClouds.material.alphaMap = texture;
        earthClouds.material.needsUpdate = true;
      }, undefined, () => {});
      mesh.add(earthClouds);
    }

    if (data.id === "saturn") {
      const inner = data.radius * 1.35;
      const outer = data.radius * 2.5;
      const ringGeometry = new THREE.RingGeometry(inner, outer, 200, 1);
      const position = ringGeometry.attributes.position;
      const uv = ringGeometry.attributes.uv;
      const vector = new THREE.Vector3();
      for (let i = 0; i < position.count; i++) {
        vector.fromBufferAttribute(position, i);
        const fraction = (vector.length() - inner) / (outer - inner);
        uv.setXY(i, fraction, 0.5);
      }
      const ringCanvas = document.createElement("canvas");
      ringCanvas.width = 256;
      ringCanvas.height = 8;
      const ringCtx = ringCanvas.getContext("2d");
      for (let x = 0; x < 256; x++) {
        const gap = Math.sin(x * 0.22) * 0.5 + 0.5;
        const alpha = 0.35 + gap * 0.55;
        ringCtx.fillStyle = `rgba(217,192,138,${alpha})`;
        ringCtx.fillRect(x, 0, 1, 8);
      }
      const ringTexture = new THREE.CanvasTexture(ringCanvas);
      ringTexture.colorSpace = THREE.SRGBColorSpace;
      const ring = new THREE.Mesh(
        ringGeometry,
        new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
      );
      ring.rotation.x = Math.PI / 2.2;
      mesh.add(ring);
      texLoader.load("textures/saturn_ring.png", texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        ring.material.map = texture;
        ring.material.needsUpdate = true;
      }, undefined, () => {});
    }
  });
}

function createMoon(parent, color, distance, size, speed, tilt = 0, textureUrl = null) {
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(size, 48, 48),
    new THREE.MeshStandardMaterial({ map: makeTexture(color, "rock"), roughness: 0.95, emissive: new THREE.Color(color).multiplyScalar(0.06) })
  );
  if (textureUrl) {
    texLoader.load(textureUrl, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      moon.material.map = texture;
      moon.material.needsUpdate = true;
    }, undefined, () => {});
  }
  scene.add(moon);
  moons.push({ moon, parent, distance, angle: Math.random() * Math.PI * 2, speed, tilt });
}

function createMoons() {
  createMoon(earthMesh, 0xc9c5bd, 2.1, 0.24, 0.55, 0, "textures/moon.jpg");

  const mars = planetObjects.find(p => p.data.id === "mars").mesh;
  createMoon(mars, 0x9a8a7d, 1.5, 0.09, 1.1, 0.15);
  createMoon(mars, 0x8b7d70, 2.1, 0.07, 0.8, -0.2);

  const jupiter = planetObjects.find(p => p.data.id === "jupiter").mesh;
  createMoon(jupiter, 0xd8c9a5, 3.2, 0.18, 0.45, 0.1);
  createMoon(jupiter, 0xb9c7d6, 4.1, 0.15, 0.32, -0.15);
  createMoon(jupiter, 0xc9b18a, 5, 0.13, 0.25, 0.2);
  createMoon(jupiter, 0x9f8f78, 5.9, 0.12, 0.2, -0.1);

  const saturn = planetObjects.find(p => p.data.id === "saturn").mesh;
  createMoon(saturn, 0xd9c9a5, 3.6, 0.2, 0.35, 0.12);
  createMoon(saturn, 0xb8c4d1, 4.6, 0.14, 0.28, -0.18);
}

function createProbe(name, color, radius, speed, tilt) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.15, 0.36),
    new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.28, emissive: new THREE.Color(color).multiplyScalar(0.3) })
  );
  group.add(body);

  const dish = new THREE.Mesh(
    new THREE.ConeGeometry(0.17, 0.11, 28),
    new THREE.MeshStandardMaterial({ color: 0xe6e6e6, metalness: 0.5, roughness: 0.35 })
  );
  dish.position.y = 0.17;
  dish.rotation.x = Math.PI;
  group.add(dish);

  scene.add(group);

  const routePoints = [];
  for (let i = 0; i <= 260; i++) {
    const angle = (i / 260) * Math.PI * 2;
    routePoints.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle * 0.6) * tilt * 8,
      Math.sin(angle) * radius
    ));
  }

  const route = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(routePoints),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 })
  );
  scene.add(route);

  return { name, group, radius, angle: Math.random() * Math.PI * 2, speed, tilt };
}

const probes = [
  createProbe("Voyager 1", 0xbfd4ff, 28, 0.016, 0.2),
  createProbe("Voyager 2", 0xffd2a1, 38, 0.011, -0.14)
];

function createAsteroidBelt() {
  const count = 1800;
  const geometry = new THREE.IcosahedronGeometry(0.1, 0);
  const material = new THREE.MeshStandardMaterial({ color: 0x9a9184, roughness: 0.95 });
  const instanced = new THREE.InstancedMesh(geometry, material, count);
  const matrix = new THREE.Matrix4();
  const asteroids = [];

  for (let i = 0; i < count; i++) {
    const radius = 20.5 + Math.random() * 3.5;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 1.1;
    const scale = 0.35 + Math.random() * 1.6;

    matrix.makeScale(scale, scale, scale);
    matrix.setPosition(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    instanced.setMatrixAt(i, matrix);

    asteroids.push({ radius, angle, y, speed: 0.005 + Math.random() * 0.009 });
  }

  scene.add(instanced);
  return { instanced, asteroids, matrix };
}

const asteroidBelt = createAsteroidBelt();

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4, 128, 128),
  new THREE.MeshBasicMaterial({ color: 0xffe0a0 })
);
sun.userData = SUN;
scene.add(sun);
clickables.push(sun);
texLoader.load("textures/sun.jpg", texture => {
  texture.colorSpace = THREE.SRGBColorSpace;
  sun.material.map = texture;
  sun.material.needsUpdate = true;
}, undefined, () => {});

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(6.6, 128, 128),
  new THREE.MeshBasicMaterial({ color: 0xffa726, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, fog: false })
);
scene.add(sunGlow);

const sunHalo = new THREE.Mesh(
  new THREE.SphereGeometry(11, 128, 128),
  new THREE.MeshBasicMaterial({ color: 0xff8a00, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, fog: false })
);
scene.add(sunHalo);

const deepObjects = [];

function makeLabelSprite(text) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.font = "700 52px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(100,164,255,0.9)";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "rgba(235,242,255,0.95)";
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, fog: false }));
  return sprite;
}

function registerDeepObject(data, group, hitRadius, labelHeight) {
  const hitbox = new THREE.Mesh(
    new THREE.SphereGeometry(hitRadius, 12, 12),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hitbox.userData = data;
  group.add(hitbox);
  clickables.push(hitbox);

  const label = makeLabelSprite(data.name);
  label.position.y = labelHeight;
  label.scale.set(26, 6.5, 1);
  group.add(label);

  deepObjects.push({ id: data.id, data, group });
}

function makeGalaxyTexture(coreColor, armColor) {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d");
  const core = new THREE.Color(coreColor);
  const arm = new THREE.Color(armColor);
  const tmp = new THREE.Color();

  const coreGlow = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s * 0.22);
  coreGlow.addColorStop(0, "rgba(255,250,235,0.95)");
  coreGlow.addColorStop(0.35, `rgba(${Math.round(core.r * 255)},${Math.round(core.g * 255)},${Math.round(core.b * 255)},0.55)`);
  coreGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = coreGlow;
  ctx.fillRect(0, 0, s, s);

  for (let a = 0; a < 3; a++) {
    for (let t = 0; t < 420; t++) {
      const radius = s * 0.06 + (t / 420) * s * 0.44;
      const angle = (a / 3) * Math.PI * 2 + radius * 0.021 + (Math.random() - 0.5) * 0.22;
      const x = s / 2 + Math.cos(angle) * radius;
      const y = s / 2 + Math.sin(angle) * radius * 0.62;
      tmp.copy(core).lerp(arm, Math.min(1, radius / (s * 0.44)));
      ctx.fillStyle = `rgba(${Math.round(tmp.r * 255)},${Math.round(tmp.g * 255)},${Math.round(tmp.b * 255)},${0.04 + Math.random() * 0.16})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeNebulaTexture() {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d");

  const blobs = [
    [0.38, 0.42, 0.30, "255,79,160"],
    [0.62, 0.55, 0.26, "79,200,255"],
    [0.5, 0.68, 0.22, "143,91,255"],
    [0.58, 0.34, 0.18, "47,208,168"]
  ];

  blobs.forEach(([x, y, r, rgb]) => {
    const gradient = ctx.createRadialGradient(x * s, y * s, 0, x * s, y * s, r * s);
    gradient.addColorStop(0, `rgba(${rgb},0.5)`);
    gradient.addColorStop(0.5, `rgba(${rgb},0.22)`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, s, s);
  });

  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.12})`;
    ctx.beginPath();
    ctx.arc(Math.random() * s, Math.random() * s, Math.random() * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createGalaxy(data, position, size, coreColor, armColor) {
  const group = new THREE.Group();
  group.position.copy(position);
  scene.add(group);

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeGalaxyTexture(coreColor, armColor),
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false
  }));
  sprite.scale.set(size * 2.7, size * 2.7, 1);
  group.add(sprite);

  registerDeepObject(data, group, size * 1.2, size * 0.62);
  return { sprite, group };
}

function createDeepSpace() {
  const milkywayData = DEEPSPACE.find(d => d.id === "milkyway");
  const milkyway = createGalaxy(milkywayData, new THREE.Vector3(230, 80, -330), 60, 0xfff2c8, 0x7fa8ff);

  const andromedaData = DEEPSPACE.find(d => d.id === "andromeda");
  const andromeda = createGalaxy(andromedaData, new THREE.Vector3(-300, 110, -380), 54, 0xffe8c8, 0xffb98a);

  const blackholeData = DEEPSPACE.find(d => d.id === "blackhole");
  const bhGroup = new THREE.Group();
  bhGroup.position.set(-200, -60, 230);
  scene.add(bhGroup);

  const hole = new THREE.Mesh(
    new THREE.SphereGeometry(5, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, fog: false })
  );
  bhGroup.add(hole);

  const diskCanvas = document.createElement("canvas");
  diskCanvas.width = 256;
  diskCanvas.height = 16;
  const diskCtx = diskCanvas.getContext("2d");
  const diskGradient = diskCtx.createLinearGradient(0, 0, 256, 0);
  diskGradient.addColorStop(0, "rgba(255,255,255,0)");
  diskGradient.addColorStop(0.15, "rgba(255,240,200,1)");
  diskGradient.addColorStop(0.4, "rgba(255,160,60,0.85)");
  diskGradient.addColorStop(1, "rgba(180,60,20,0)");
  diskCtx.fillStyle = diskGradient;
  diskCtx.fillRect(0, 0, 256, 16);
  const diskTexture = new THREE.CanvasTexture(diskCanvas);
  diskTexture.colorSpace = THREE.SRGBColorSpace;

  const diskGeometry = new THREE.RingGeometry(6.5, 14, 160, 1);
  const dpos = diskGeometry.attributes.position;
  const duv = diskGeometry.attributes.uv;
  const dvec = new THREE.Vector3();
  for (let i = 0; i < dpos.count; i++) {
    dvec.fromBufferAttribute(dpos, i);
    duv.setXY(i, (dvec.length() - 6.5) / 7.5, 0.5);
  }
  const disk = new THREE.Mesh(
    diskGeometry,
    new THREE.MeshBasicMaterial({ map: diskTexture, side: THREE.DoubleSide, transparent: true, blending: THREE.AdditiveBlending, fog: false })
  );
  disk.rotation.x = Math.PI / 2.6;
  bhGroup.add(disk);

  const bhGlow = new THREE.Mesh(
    new THREE.SphereGeometry(8.5, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xff8830, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, fog: false })
  );
  bhGroup.add(bhGlow);

  registerDeepObject(blackholeData, bhGroup, 15, 24);

  const orionData = DEEPSPACE.find(d => d.id === "orion");
  const nebulaGroup = new THREE.Group();
  nebulaGroup.position.set(310, -50, -170);
  scene.add(nebulaGroup);

  const nebulaSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeNebulaTexture(),
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false
  }));
  nebulaSprite.scale.set(85, 85, 1);
  nebulaGroup.add(nebulaSprite);

  const sparkCount = 500;
  const sparkPositions = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount; i++) {
    sparkPositions[i * 3] = (Math.random() - 0.5) * 32;
    sparkPositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 32;
  }
  const sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  const nebula = new THREE.Points(sparkGeometry, new THREE.PointsMaterial({
    color: 0xcfeaff,
    map: glowTexture,
    size: 1.6,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false
  }));
  nebulaGroup.add(nebula);
  registerDeepObject(orionData, nebulaGroup, 36, 30);

  const cometData = DEEPSPACE.find(d => d.id === "comet");
  const cometGroup = new THREE.Group();
  scene.add(cometGroup);

  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xcfe8f2, roughness: 0.9, emissive: 0x223344 })
  );
  cometGroup.add(nucleus);

  const tailCount = 600;
  const tPositions = new Float32Array(tailCount * 3);
  for (let i = 0; i < tailCount; i++) {
    const t = Math.pow(Math.random(), 0.5);
    const spread = t * 2.2;
    tPositions[i * 3] = (Math.random() - 0.5) * spread;
    tPositions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    tPositions[i * 3 + 2] = -0.6 - t * 10 - Math.random() * 2;
  }
  const tailGeometry = new THREE.BufferGeometry();
  tailGeometry.setAttribute("position", new THREE.BufferAttribute(tPositions, 3));
  const tail = new THREE.Points(tailGeometry, new THREE.PointsMaterial({
    color: 0x9fe8ff,
    map: glowTexture,
    size: 1.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false
  }));
  cometGroup.add(tail);

  registerDeepObject(cometData, cometGroup, 2.5, 5);

  return { milkyway, andromeda, disk, nebula, cometGroup, nucleus, tail };
}

const deepSpace = createDeepSpace();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;

function openInfo(data) {
  document.getElementById("planetName").textContent = data.name;
  document.getElementById("planetType").textContent = data.type;
  document.getElementById("planetDescription").textContent = data.description;
  const previewColor = data.color !== undefined
    ? `#${data.color.toString(16).padStart(6, "0")}`
    : `#${data.toString(16).padStart(6, "0")}`;
  document.getElementById("planetPreview").style.background =
    `radial-gradient(circle at 30% 30%, #fff8, ${previewColor})`;

  const stats = data.stats || [
    { value: data.diameter, label: "Durchmesser" },
    { value: data.distance, label: "Entfernung zur Sonne" },
    { value: data.moons, label: "Bekannte Monde" },
    { value: data.radius.toFixed(2), label: "3D-Radius" }
  ];
  const source = data.source || "https://science.nasa.gov/solar-system/";

  document.getElementById("planetStats").innerHTML = stats
    .map(stat => `<div class="stat"><strong>${stat.value}</strong><span>${stat.label}</span></div>`)
    .join("");

  document.getElementById("planetFacts").innerHTML = data.facts
    .map(fact => `<li>${fact}</li>`)
    .join("") +
    `<li class="source-link">Quelle: <a href="${source}" target="_blank" rel="noopener">NASA Science</a></li>`;

  panel.classList.remove("hidden");
}

function focusObject(id) {
  if (id === "sun") {
    openInfo(SUN);
    controls.target.set(0, 0, 0);
    camera.position.set(0, 16, 40);
    return;
  }

  const planet = planetObjects.find(p => p.data.id === id);
  if (planet) {
    openInfo(planet.data);
    const target = planet.mesh.position;
    controls.target.copy(target);
    camera.position.set(target.x + 6, target.y + 5, target.z + 8);
    return;
  }

  const deep = deepObjects.find(d => d.id === id);
  if (deep) {
    openInfo(deep.data);
    const target = deep.group.position;
    const distance = deep.data.viewDistance || 80;
    controls.target.copy(target);
    camera.position.set(
      target.x + distance * 0.7,
      target.y + distance * 0.45,
      target.z + distance * 0.9
    );
  }
}

document.querySelectorAll("[data-focus]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    focusObject(link.dataset.focus);
  });
});

canvas.addEventListener("pointermove", event => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickables, false);
  hovered = hits.length ? hits[0].object : null;
  canvas.style.cursor = hovered ? "pointer" : "grab";
});

let pressPosition = null;
let pressTime = 0;

canvas.addEventListener("pointerdown", event => {
  pressPosition = { x: event.clientX, y: event.clientY };
  pressTime = Date.now();
});

canvas.addEventListener("pointerup", event => {
  if (!pressPosition) return;
  const moved = Math.hypot(event.clientX - pressPosition.x, event.clientY - pressPosition.y);
  const elapsed = Date.now() - pressTime;
  pressPosition = null;

  if (moved > 6 || elapsed > 450) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickables, false);
  if (hits.length) openInfo(hits[0].object.userData);
});

document.getElementById("closePanel").addEventListener("click", () => {
  panel.classList.add("hidden");
});

let score = 0;
let questionIndex = 0;
let quizTimer = null;

function startQuiz() {
  clearTimeout(quizTimer);
  questionIndex = 0;
  score = 0;
  scoreElement.textContent = score;
  quizOverlay.classList.remove("hidden");
  showQuestion();
}

function showQuestion() {
  const question = QUIZ[questionIndex];
  document.getElementById("quizQuestion").textContent = question.question;
  document.getElementById("quizProgress").textContent = `Frage ${questionIndex + 1} / ${QUIZ.length}`;
  document.getElementById("quizScore").textContent = `${score} Punkte`;
  document.getElementById("quizFeedback").textContent = "";

  const answers = document.getElementById("quizAnswers");
  answers.innerHTML = "";

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.textContent = answer;
    button.addEventListener("click", () => checkAnswer(index, button));
    answers.appendChild(button);
  });
}

function checkAnswer(index, button) {
  const question = QUIZ[questionIndex];
  const buttons = [...document.querySelectorAll(".answer")];
  buttons.forEach(item => item.disabled = true);

  if (index === question.correct) {
    button.classList.add("correct");
    score += 10;
    document.getElementById("quizFeedback").textContent = "Richtig! +10 Punkte 🚀";
  } else {
    button.classList.add("wrong");
    buttons[question.correct].classList.add("correct");
    document.getElementById("quizFeedback").textContent = "Leider falsch. Die richtige Antwort ist markiert.";
  }

  scoreElement.textContent = score;
  document.getElementById("quizScore").textContent = `${score} Punkte`;

  quizTimer = setTimeout(() => {
    questionIndex++;

    if (questionIndex < QUIZ.length) {
      showQuestion();
    } else {
      finishQuiz();
    }
  }, 1300);
}

function finishQuiz() {
  const badge = score >= 90 ? "🌌 Galaxie-Genie" : score >= 60 ? "🪐 Planeten-Entdecker" : "🌟 Sternen-Schüler";

  document.getElementById("quizQuestion").textContent = "Mission abgeschlossen!";
  document.getElementById("quizAnswers").innerHTML = `
    <div class="badge">${badge}</div>
    <p style="color:var(--muted);margin-top:16px">Du hast ${score} von ${QUIZ.length * 10} Punkten erreicht.</p>
  `;
  document.getElementById("quizFeedback").textContent = "Klicke auf „Weltraum-Quiz“, um es erneut zu starten.";
  document.getElementById("quizProgress").textContent = "Fertig";
}

document.getElementById("quizButton").addEventListener("click", startQuiz);
document.getElementById("closeQuiz").addEventListener("click", () => {
  clearTimeout(quizTimer);
  quizOverlay.classList.add("hidden");
});

const keys = {};
window.addEventListener("keydown", event => {
  keys[event.code] = true;
});
window.addEventListener("keyup", event => {
  keys[event.code] = false;
});
window.addEventListener("blur", () => {
  Object.keys(keys).forEach(key => { keys[key] = false; });
});

const clock = new THREE.Clock();
const moveForward = new THREE.Vector3();
const moveRight = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);

function updateFreeMovement(delta) {
  if (!quizOverlay.classList.contains("hidden")) return;

  moveForward.set(0, 0, 0);
  camera.getWorldDirection(moveForward);
  moveForward.y = 0;
  if (moveForward.lengthSq() < 0.001) moveForward.set(0, 0, -1);
  moveForward.normalize();
  moveRight.crossVectors(moveForward, worldUp).normalize();

  const fast = keys.ShiftLeft || keys.ShiftRight;
  const speed = (fast ? 160 : 55) * delta;

  function move(direction, amount) {
    camera.position.addScaledVector(direction, amount);
    controls.target.addScaledVector(direction, amount);
  }

  if (keys.KeyW || keys.ArrowUp) move(moveForward, speed);
  if (keys.KeyS || keys.ArrowDown) move(moveForward, -speed);
  if (keys.KeyA || keys.ArrowLeft) move(moveRight, -speed);
  if (keys.KeyD || keys.ArrowRight) move(moveRight, speed);
  if (keys.KeyE || keys.Space) move(worldUp, speed);
  if (keys.KeyQ || keys.ControlLeft) move(worldUp, -speed);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = Date.now() * 0.001;

  sun.rotation.y += 0.0012;
  sunGlow.scale.setScalar(1 + Math.sin(time * 1.4) * 0.035);
  sunHalo.scale.setScalar(1 + Math.sin(time * 0.8) * 0.05);

  planetObjects.forEach(item => {
    item.angle += item.data.speed * 0.01;
    item.mesh.position.set(
      Math.cos(item.angle) * item.data.orbitRadius,
      0,
      Math.sin(item.angle) * item.data.orbitRadius
    );
    item.mesh.rotation.y += 0.005;
    if (earthClouds && item.data.id === "earth") earthClouds.rotation.y += 0.0012;

    const highlight = hovered === item.mesh ? 1.12 : 1;
    item.mesh.scale.setScalar(THREE.MathUtils.lerp(item.mesh.scale.x, highlight, 0.1));
  });

  moons.forEach(item => {
    item.angle += item.speed * 0.01;
    item.moon.position.set(
      item.parent.position.x + Math.cos(item.angle) * item.distance,
      item.parent.position.y + Math.sin(item.angle * 0.5) * item.tilt,
      item.parent.position.z + Math.sin(item.angle) * item.distance
    );
    item.moon.rotation.y += 0.006;
  });

  probes.forEach(probe => {
    probe.angle += probe.speed;
    probe.group.position.set(
      Math.cos(probe.angle) * probe.radius,
      Math.sin(probe.angle * 0.6) * probe.tilt * 8,
      Math.sin(probe.angle) * probe.radius
    );
    probe.group.lookAt(sun.position);
  });

  asteroidBelt.asteroids.forEach((asteroid, index) => {
    asteroid.angle += asteroid.speed * 0.01;
    const x = Math.cos(asteroid.angle) * asteroid.radius;
    const z = Math.sin(asteroid.angle) * asteroid.radius;
    asteroidBelt.matrix.makeScale(1, 1, 1);
    asteroidBelt.matrix.setPosition(x, asteroid.y, z);
    asteroidBelt.instanced.setMatrixAt(index, asteroidBelt.matrix);
  });
  asteroidBelt.instanced.instanceMatrix.needsUpdate = true;

  deepSpace.milkyway.sprite.material.rotation += 0.00035;
  deepSpace.andromeda.sprite.material.rotation -= 0.0003;
  deepSpace.disk.rotation.z += 0.012;
  deepSpace.nebula.rotation.y += 0.0006;

  const cometAngle = time * 0.05;
  deepSpace.cometGroup.position.set(
    Math.cos(cometAngle) * 52,
    Math.sin(cometAngle * 0.7) * 10,
    Math.sin(cometAngle) * 26
  );
  deepSpace.cometGroup.lookAt(0, 0, 0);

  updateFreeMovement(delta);

  controls.update();
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onResize);

createStarfield();
createPlanets();
createMoons();
animate();

setTimeout(() => loader.classList.add("done"), 700);
