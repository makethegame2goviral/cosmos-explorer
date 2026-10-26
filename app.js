const orbitSystem = document.getElementById("orbitSystem");
const panel = document.getElementById("planet-panel");
const closePanel = document.getElementById("closePanel");

function createStars() {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      a: Math.random()
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
      star.a += 0.01;
      const alpha = 0.35 + Math.abs(Math.sin(star.a)) * 0.65;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}

function createSolarSystem() {
  const systemSize = orbitSystem.clientWidth;

  PLANETS.forEach(planet => {
    const orbit = document.createElement("div");
    orbit.className = "orbit";
    const orbitSize = (planet.orbit / 515) * systemSize;
    orbit.style.width = `${orbitSize}px`;
    orbit.style.height = `${orbitSize}px`;
    orbit.style.left = `${(systemSize - orbitSize) / 2}px`;
    orbit.style.top = `${(systemSize - orbitSize) / 2}px`;
    orbit.style.animationDuration = `${planet.speed}s`;

    const body = document.createElement("button");
    body.className = "planet";
    body.title = planet.name;
    body.setAttribute("aria-label", planet.name);
    body.style.width = `${planet.size}px`;
    body.style.height = `${planet.size}px`;
    body.style.background = `radial-gradient(circle at 30% 30%, #fff8, ${planet.color})`;
    body.style.transform = `translate(-50%, -50%) translateX(${orbitSize / 2}px)`;
    body.addEventListener("click", () => openPlanet(planet));

    orbit.appendChild(body);
    orbitSystem.appendChild(orbit);
  });
}

function openPlanet(planet) {
  document.getElementById("planetName").textContent = planet.name;
  document.getElementById("planetDescription").textContent = planet.description;
  document.getElementById("planetPreview").style.background =
    `radial-gradient(circle at 30% 30%, #fff8, ${planet.color})`;

  document.getElementById("planetStats").innerHTML = `
    <div class="stat"><strong>${planet.diameter}</strong><span>Durchmesser</span></div>
    <div class="stat"><strong>${planet.distance}</strong><span>Entfernung zur Sonne</span></div>
    <div class="stat"><strong>${planet.moons}</strong><span>Bekannte Monde</span></div>
    <div class="stat"><strong>${planet.speed}s</strong><span>Orbit-Animation</span></div>
  `;

  document.getElementById("planetFacts").innerHTML = planet.facts
    .map(fact => `<li>${fact}</li>`)
    .join("");

  panel.classList.remove("hidden");
}

closePanel.addEventListener("click", () => panel.classList.add("hidden"));

createStars();
createSolarSystem();
window.addEventListener("resize", () => {
  orbitSystem.innerHTML = "";
  createSolarSystem();
});
