import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PLANETS } from "./data/planets.js";

const canvas = document.getElementById("scene");
const panel = document.getElementById("planetPanel");
const loader = document.getElementById("loader");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x01020a, 0.005);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  1200
);
camera.position.set(0, 30, 62);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 7;
controls.maxDistance = 190;

scene.add(new THREE.AmbientLight(0xffffff, 0.22));

const sunLight = new THREE.PointLight(0xffd9a0, 1200, 400, 2);
scene.add(sunLight);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4, 96, 96),
  new THREE.MeshBasicMaterial({ color: 0xffc65c })
);
sun.name = "sun";
scene.add(sun);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(6.2, 96, 96),
  new THREE.MeshBasicMaterial({
    color: 0xffa726,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending
  })
);
scene.add(sunGlow);

const sunHalo = new THREE.Mesh(
  new THREE.SphereGeometry(9, 96, 96),
  new THREE.MeshBasicMaterial({
    color: 0xff8a00,
    transparent: true,
    opacity: 0.07,
    blending: THREE.AdditiveBlending
  })
);
scene.add(sunHalo);

function createStarfield() {
  const count = 9000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 800;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 800;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 800;

    const tint = 0.75 + Math.random() * 0.25;
    colors[i * 3] = tint;
    colors[i * 3 + 1] = tint;
    colors[i * 3 + 2] = Math.min(1, tint + Math.random() * 0.2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.7,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85
  })));
}

function createPlanetTexture(baseColor, type) {
  const size = 512;
  const canvas2d = document.createElement("canvas");
  canvas2d.width = size;
  canvas2d.height = size;
  const ctx = canvas2d.getContext("2d");

  const color = new THREE.Color(baseColor);
  const rgb = `${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)}`;

  ctx.fillStyle = `rgb(${rgb})`;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 28 + 3;
    const alpha = Math.random() * 0.13;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  for (let i = 0; i < 700; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 22 + 2;
    const alpha = Math.random() * 0.16;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fill();
  }

  if (type === "Gasriese") {
    for (let y = 0; y < size; y += 4) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
      ctx.fillRect(0, y, size, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas2d);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createOrbit(radius) {
  const points = [];
  for (let i = 0; i <= 180; i++) {
    const angle = (i / 180) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x4a5f8f, transparent: true, opacity: 0.32 })
  ));
}

const planetMeshes = [];
const planetObjects = [];

function createPlanets() {
  PLANETS.forEach(data => {
    createOrbit(data.orbitRadius);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius, 64, 64),
      new THREE.MeshStandardMaterial({
        map: createPlanetTexture(data.color, data.type),
        roughness: 0.78,
        metalness: 0.08
      })
    );
    mesh.userData = data;
    scene.add(mesh);
    planetMeshes.push(mesh);
    planetObjects.push({ data, mesh, angle: Math.random() * Math.PI * 2 });

    if (data.id === "saturn") {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.4, 128),
        new THREE.MeshBasicMaterial({
          color: 0xd9c08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5
        })
      );
      ring.rotation.x = Math.PI / 2.2;
      mesh.add(ring);
    }
  });
}

function createAsteroidBelt() {
  const count = 1400;
  const geometry = new THREE.IcosahedronGeometry(0.12, 0);
  const material = new THREE.MeshStandardMaterial({ color: 0x8a8175, roughness: 0.9 });
  const instanced = new THREE.InstancedMesh(geometry, material, count);
  const matrix = new THREE.Matrix4();
  const asteroids = [];

  for (let i = 0; i < count; i++) {
    const radius = 20.5 + Math.random() * 3.5;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 1.1;
    const scale = 0.4 + Math.random() * 1.5;

    matrix.makeScale(scale, scale, scale);
    matrix.setPosition(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    instanced.setMatrixAt(i, matrix);

    asteroids.push({ radius, angle, y, speed: 0.006 + Math.random() * 0.008 });
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
    item.mesh.rotation.y += 0.004;

    const highlight = hovered === item.mesh ? 1.12 : 1;
    item.mesh.scale.setScalar(THREE.MathUtils.lerp(item.mesh.scale.x, highlight, 0.12));
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
animate();

setTimeout(() => loader.classList.add("done"), 700);
