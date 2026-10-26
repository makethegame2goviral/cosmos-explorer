import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PLANETS } from "./data/planets.js";

const canvas = document.getElementById("scene");
const panel = document.getElementById("planetPanel");
const loader = document.getElementById("loader");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x01020a, 0.006);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 28, 58);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 8;
controls.maxDistance = 160;

scene.add(new THREE.AmbientLight(0xffffff, 0.25));

const sunLight = new THREE.PointLight(0xffd9a0, 900, 300, 2);
scene.add(sunLight);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0xffc65c })
);
sun.name = "sun";
scene.add(sun);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(5.4, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0xffa726,
    transparent: true,
    opacity: 0.18
  })
);
scene.add(sunGlow);

function createStarfield() {
  const count = 7000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 600;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8
  });

  scene.add(new THREE.Points(geometry, material));
}

function createOrbit(radius) {
  const points = [];
  for (let i = 0; i <= 128; i++) {
    const angle = (i / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  const orbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x4a5f8f, transparent: true, opacity: 0.35 })
  );
  scene.add(orbit);
}

const planetMeshes = [];
const planetObjects = [];

function createPlanets() {
  PLANETS.forEach(data => {
    createOrbit(data.orbitRadius);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius, 48, 48),
      new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.75,
        metalness: 0.1
      })
    );
    mesh.userData = data;
    scene.add(mesh);
    planetMeshes.push(mesh);

    planetObjects.push({ data, mesh, angle: Math.random() * Math.PI * 2 });

    if (data.id === "saturn") {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.3, 96),
        new THREE.MeshBasicMaterial({
          color: 0xd9c08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.55
        })
      );
      ring.rotation.x = Math.PI / 2.2;
      mesh.add(ring);
    }
  });
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

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

  sun.rotation.y += 0.001;
  sunGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.03);

  planetObjects.forEach(item => {
    item.angle += item.data.speed * 0.01;
    item.mesh.position.set(
      Math.cos(item.angle) * item.data.orbitRadius,
      0,
      Math.sin(item.angle) * item.data.orbitRadius
    );
    item.mesh.rotation.y += 0.004;
  });

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
