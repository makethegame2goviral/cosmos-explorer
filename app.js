import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PLANETS } from "./data/planets.js";

const canvas = document.getElementById("scene");
const panel = document.getElementById("planetPanel");
const loader = document.getElementById("loader");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x01020a, 0.0045);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  1200
);
camera.position.set(0, 32, 66);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.minDistance = 6;
controls.maxDistance = 200;

scene.add(new THREE.AmbientLight(0xffffff, 0.2));

const sunLight = new THREE.PointLight(0xffd9a0, 1500, 500, 2);
scene.add(sunLight);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4, 128, 128),
  new THREE.MeshBasicMaterial({ color: 0xffc65c })
);
scene.add(sun);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(6.4, 128, 128),
  new THREE.MeshBasicMaterial({
    color: 0xffa726,
    transparent: true,
    opacity: 0.17,
    blending: THREE.AdditiveBlending
  })
);
scene.add(sunGlow);

const sunHalo = new THREE.Mesh(
  new THREE.SphereGeometry(10, 128, 128),
  new THREE.MeshBasicMaterial({
    color: 0xff8a00,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending
  })
);
scene.add(sunHalo);

function createStarfield() {
  const count = 12000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 900;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 900;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 900;

    const tint = 0.7 + Math.random() * 0.3;
    colors[i * 3] = tint;
    colors[i * 3 + 1] = tint;
    colors[i * 3 + 2] = Math.min(1, tint + Math.random() * 0.25);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.65,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9
  })));
}

function noiseTexture(baseColor, style) {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const color = new THREE.Color(baseColor);
  const rgb = `${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)}`;

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, `rgb(${rgb})`);
  gradient.addColorStop(1, `rgba(${rgb},0.75)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  if (style === "earth") {
    ctx.fillStyle = "#1c6b3a";
    for (let i = 0; i < 34; i++) {
      ctx.beginPath();
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.ellipse(x, y, 30 + Math.random() * 90, 18 + Math.random() * 55, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    for (let i = 0; i < 70; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * size, Math.random() * size, 20 + Math.random() * 90, 8 + Math.random() * 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (style === "gas") {
    for (let y = 0; y < size; y += 3) {
      const wave = Math.sin(y * 0.03) * 18;
      ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.07})`;
      ctx.fillRect(0, y + wave, size, 2);
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`;
      ctx.fillRect(0, y + wave + 1, size, 1);
    }
    ctx.fillStyle = "rgba(180,60,30,0.45)";
    ctx.beginPath();
    ctx.ellipse(size * 0.68, size * 0.62, 68, 34, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (style === "rock") {
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 16 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "0,0,0"},${Math.random() * 0.16})`;
      ctx.fill();
    }
  }

  if (style === "ice") {
    for (let i = 0; i < 1800; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 24 + 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.18})`;
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

function createOrbit(radius) {
  const points = [];
  for (let i = 0; i <= 220; i++) {
    const angle = (i / 220) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x4a5f8f, transparent: true, opacity: 0.3 })
  ));
}

const planetMeshes = [];
const planetObjects = [];
let earthMesh = null;

function createPlanets() {
  PLANETS.forEach(data => {
    createOrbit(data.orbitRadius);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius, 96, 96),
      new THREE.MeshStandardMaterial({
        map: noiseTexture(data.color, textureStyle(data)),
        roughness: 0.76,
        metalness: 0.06
      })
    );
    mesh.userData = data;
    scene.add(mesh);
    planetMeshes.push(mesh);
    planetObjects.push({ data, mesh, angle: Math.random() * Math.PI * 2 });

    if (data.id === "earth") earthMesh = mesh;

    if (data.id === "saturn") {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(data.radius * 1.35, data.radius * 2.45, 160),
        new THREE.MeshBasicMaterial({
          color: 0xd9c08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.48
        })
      );
      ring.rotation.x = Math.PI / 2.2;
      mesh.add(ring);
    }
  });
}

let moon = null;

function createMoon() {
  if (!earthMesh) return;

  moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 48, 48),
    new THREE.MeshStandardMaterial({
      map: noiseTexture(0xc9c5bd, "rock"),
      roughness: 0.95
    })
  );
  scene.add(moon);
}

function createProbe(name, color, startRadius, speed, tilt) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.14, 0.34),
    new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 })
  );
  group.add(body);

  const dish = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.1, 24),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.5, roughness: 0.4 })
  );
  dish.position.y = 0.16;
  dish.rotation.x = Math.PI;
  group.add(dish);

  const trail = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
  );
  group.add(trail);

  scene.add(group);
  return { name, group, radius: startRadius, angle: Math.random() * Math.PI * 2, speed, tilt };
}

const probes = [
  createProbe("Voyager 1", 0xbfd4ff, 27, 0.018, 0.18),
  createProbe("Voyager 2", 0xffd2a1, 36, 0.013, -0.12)
];

function createAsteroidBelt() {
  const count = 1600;
  const geometry = new THREE.IcosahedronGeometry(0.11, 0);
  const material = new THREE.MeshStandardMaterial({ color: 0x8a8175, roughness: 0.95 });
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
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;

function openPlanet(data) {
  document.getElementById("planetName").textContent = data.name;
  document.getElementById("planetType").textContent = data.type;
  document.getElementById("planetDescription").textContent = data.description;
  document.getElementById("planetPreview").style.background =
    `radial-gradient(circle at 30% 30%, #fff8, #${data.color.toString(16).padStart(6, "0")})`;

  document.getElementById("planetStats").innerHTML = `
    <div class="stat"><strong>${data.diameter}</strong><span>Durchmesser</span></div>
    <div class="stat"><strong>${data.distance}</strong><span>Entfernung zur Sonne</span></div>
    <div class="stat"><strong>${data.moons}</strong><span>Bekannte Monde</span></div>
    <div class="stat"><strong>${data.radius.toFixed(2)}</strong><span>3D-Radius</span></div>
  `;

  document.getElementById("planetFacts").innerHTML = data.facts
    .map(fact => `<li>${fact}</li>`)
    .join("");

  panel.classList.remove("hidden");
}

function focusPlanet(id) {
  const item = planetObjects.find(p => p.data.id === id);
  if (!item) return;

  openPlanet(item.data);
  const target = item.mesh.position;
  controls.target.copy(target);
  camera.position.set(target.x + 6, target.y + 5, target.z + 8);
}

document.querySelectorAll("[data-focus]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    focusPlanet(link.dataset.focus);
  });
});

canvas.addEventListener("pointermove", event => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(planetMeshes);
  hovered = hits.length ? hits[0].object : null;
  canvas.style.cursor = hovered ? "pointer" : "grab";
});

canvas.addEventListener("pointerdown", event => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(planetMeshes);

  if (hits.length) openPlanet(hits[0].object.userData);
});

document.getElementById("closePanel").addEventListener("click", () => {
  panel.classList.add("hidden");
});

function animate() {
  requestAnimationFrame(animate);

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

    const highlight = hovered === item.mesh ? 1.12 : 1;
    item.mesh.scale.setScalar(THREE.MathUtils.lerp(item.mesh.scale.x, highlight, 0.1));
  });

  if (earthMesh && moon) {
    const moonAngle = time * 0.55;
    moon.position.set(
      earthMesh.position.x + Math.cos(moonAngle) * 2.1,
      earthMesh.position.y + Math.sin(moonAngle * 0.4) * 0.15,
      earthMesh.position.z + Math.sin(moonAngle) * 2.1
    );
    moon.rotation.y += 0.006;
  }

  probes.forEach(probe => {
    probe.angle += probe.speed;
    probe.group.position.set(
      Math.cos(probe.angle) * probe.radius,
      Math.sin(probe.angle * 0.6) * probe.tilt * 8,
      Math.sin(probe.angle) * probe.radius
    );
    probe.group.rotation.y += 0.01;
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
createMoon();
animate();

setTimeout(() => loader.classList.add("done"), 700);
