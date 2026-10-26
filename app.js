import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PLANETS, QUIZ } from "./data/planets.js";

const canvas = document.getElementById("scene");
const panel = document.getElementById("planetPanel");
const loader = document.getElementById("loader");
const quizOverlay = document.getElementById("quizOverlay");
const scoreElement = document.getElementById("score");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x01020a, 0.004);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1400);
camera.position.set(0, 34, 70);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.minDistance = 5;
controls.maxDistance = 220;

scene.add(new THREE.AmbientLight(0xffffff, 0.18));

const sunLight = new THREE.PointLight(0xffd9a0, 1800, 600, 2);
scene.add(sunLight);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4, 128, 128),
  new THREE.MeshBasicMaterial({ color: 0xffc65c })
);
scene.add(sun);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(6.6, 128, 128),
  new THREE.MeshBasicMaterial({ color: 0xffa726, transparent: true, opacity: 0.17, blending: THREE.AdditiveBlending })
);
scene.add(sunGlow);

const sunHalo = new THREE.Mesh(
  new THREE.SphereGeometry(11, 128, 128),
  new THREE.MeshBasicMaterial({ color: 0xff8a00, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending })
);
scene.add(sunHalo);

function createStarfield() {
  const count = 14000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;

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
    size: 0.62,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.92
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
    ctx.fillStyle = "#1a6b38";
    for (let i = 0; i < 42; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * size, Math.random() * size, 25 + Math.random() * 105, 15 + Math.random() * 60, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * size, Math.random() * size, 20 + Math.random() * 100, 7 + Math.random() * 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (style === "gas") {
    for (let y = 0; y < size; y += 3) {
      const wave = Math.sin(y * 0.028) * 22;
      ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.08})`;
      ctx.fillRect(0, y + wave, size, 2);
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.09})`;
      ctx.fillRect(0, y + wave + 1, size, 1);
    }
    ctx.fillStyle = "rgba(190,65,30,0.5)";
    ctx.beginPath();
    ctx.ellipse(size * 0.66, size * 0.63, 75, 36, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (style === "rock") {
    for (let i = 0; i < 3200; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 17 + 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "0,0,0"},${Math.random() * 0.17})`;
      ctx.fill();
    }
  }

  if (style === "ice") {
    for (let i = 0; i < 2200; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 26 + 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.2})`;
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

function createOrbit(radius, color = 0x4a5f8f, opacity = 0.3) {
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

const planetMeshes = [];
const planetObjects = [];
const moons = [];
let earthMesh = null;

function createPlanets() {
  PLANETS.forEach(data => {
    createOrbit(data.orbitRadius);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(data.radius, 112, 112),
      new THREE.MeshStandardMaterial({
        map: makeTexture(data.color, textureStyle(data)),
        roughness: 0.74,
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
        new THREE.RingGeometry(data.radius * 1.35, data.radius * 2.5, 180),
        new THREE.MeshBasicMaterial({ color: 0xd9c08a, side: THREE.DoubleSide, transparent: true, opacity: 0.46 })
      );
      ring.rotation.x = Math.PI / 2.2;
      mesh.add(ring);
    }
  });
}

function createMoon(parent, color, distance, size, speed, tilt = 0) {
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(size, 48, 48),
    new THREE.MeshStandardMaterial({ map: makeTexture(color, "rock"), roughness: 0.95 })
  );
  scene.add(moon);
  moons.push({ moon, parent, distance, angle: Math.random() * Math.PI * 2, speed, tilt });
}

function createMoons() {
  createMoon(earthMesh, 0xc9c5bd, 2.1, 0.24, 0.55);

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
    new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.28 })
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
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 })
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

let score = 0;
let questionIndex = 0;

function startQuiz() {
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

  setTimeout(() => {
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
  quizOverlay.classList.add("hidden");
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
