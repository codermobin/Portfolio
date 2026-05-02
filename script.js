const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const scene = document.querySelector("#scene");

menuToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks?.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLAnchorElement) {
    body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }
});

const sections = [...document.querySelectorAll("main section[id]")];
const navItems = [...document.querySelectorAll(".nav-links a")];

const updateActiveLink = () => {
  const marker = window.scrollY + 170;
  let activeId = "home";

  for (const section of sections) {
    if (section.offsetTop <= marker) {
      activeId = section.id;
    }
  }

  navItems.forEach((item) => {
    item.classList.toggle("active", item.getAttribute("href") === `#${activeId}`);
  });
};

window.addEventListener("scroll", updateActiveLink, { passive: true });
updateActiveLink();

if (scene) {
  const updateTilt = (clientX, clientY) => {
    const rect = scene.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    scene.style.setProperty("--mx", `${x * 7}deg`);
    scene.style.setProperty("--my", `${y * -5}deg`);
  };

  scene.addEventListener("pointermove", (event) => updateTilt(event.clientX, event.clientY));
  scene.addEventListener("pointerleave", () => {
    scene.style.setProperty("--mx", "0deg");
    scene.style.setProperty("--my", "0deg");
  });
}

const constellationCanvas = document.querySelector("#constellation");
const constellationCtx = constellationCanvas?.getContext("2d");
const particles = [];

const resizeConstellation = () => {
  if (!constellationCanvas || !constellationCtx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  constellationCanvas.width = Math.floor(window.innerWidth * ratio);
  constellationCanvas.height = Math.floor(window.innerHeight * ratio);
  constellationCanvas.style.width = `${window.innerWidth}px`;
  constellationCanvas.style.height = `${window.innerHeight}px`;
  constellationCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  particles.length = 0;
  const total = Math.min(110, Math.max(52, Math.floor(window.innerWidth / 16)));
  for (let i = 0; i < total; i += 1) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 1.7 + 0.35,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      hue: Math.random() > 0.6 ? 275 : 200,
    });
  }
};

const drawConstellation = () => {
  if (!constellationCanvas || !constellationCtx) return;
  constellationCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle, index) => {
    particle.x += particle.vx * particle.z;
    particle.y += particle.vy * particle.z;

    if (particle.x < -20) particle.x = window.innerWidth + 20;
    if (particle.x > window.innerWidth + 20) particle.x = -20;
    if (particle.y < -20) particle.y = window.innerHeight + 20;
    if (particle.y > window.innerHeight + 20) particle.y = -20;

    constellationCtx.beginPath();
    constellationCtx.arc(particle.x, particle.y, particle.z * 1.35, 0, Math.PI * 2);
    constellationCtx.fillStyle = `hsla(${particle.hue}, 90%, 68%, ${0.28 + particle.z * 0.16})`;
    constellationCtx.fill();

    for (let j = index + 1; j < particles.length; j += 1) {
      const other = particles[j];
      const dx = particle.x - other.x;
      const dy = particle.y - other.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 110) {
        constellationCtx.beginPath();
        constellationCtx.moveTo(particle.x, particle.y);
        constellationCtx.lineTo(other.x, other.y);
        constellationCtx.strokeStyle = `rgba(80, 149, 255, ${0.12 * (1 - distance / 110)})`;
        constellationCtx.lineWidth = 1;
        constellationCtx.stroke();
      }
    }
  });

  requestAnimationFrame(drawConstellation);
};

resizeConstellation();
drawConstellation();
window.addEventListener("resize", resizeConstellation);

const chartCanvas = document.querySelector("#dataChart");
const chartCtx = chartCanvas?.getContext("2d");
let chartTick = 0;

const drawDataChart = () => {
  if (!chartCanvas || !chartCtx) return;

  const width = chartCanvas.width;
  const height = chartCanvas.height;
  chartTick += 0.018;
  chartCtx.clearRect(0, 0, width, height);

  const gridGradient = chartCtx.createLinearGradient(0, 0, width, height);
  gridGradient.addColorStop(0, "rgba(69, 132, 255, 0.16)");
  gridGradient.addColorStop(1, "rgba(149, 76, 255, 0.06)");
  chartCtx.fillStyle = gridGradient;
  chartCtx.fillRect(0, 0, width, height);

  chartCtx.strokeStyle = "rgba(195, 211, 255, 0.12)";
  chartCtx.lineWidth = 1;
  for (let x = 28; x < width; x += 48) {
    chartCtx.beginPath();
    chartCtx.moveTo(x, 18);
    chartCtx.lineTo(x, height - 24);
    chartCtx.stroke();
  }
  for (let y = 26; y < height; y += 36) {
    chartCtx.beginPath();
    chartCtx.moveTo(18, y);
    chartCtx.lineTo(width - 18, y);
    chartCtx.stroke();
  }

  const bars = [42, 56, 76, 52, 94, 72, 104];
  bars.forEach((bar, index) => {
    const barHeight = bar + Math.sin(chartTick * 3 + index) * 12;
    const x = 32 + index * 38;
    const y = height - 24 - barHeight;
    const gradient = chartCtx.createLinearGradient(0, y, 0, height);
    gradient.addColorStop(0, index % 2 ? "#9e59ff" : "#2ad4ff");
    gradient.addColorStop(1, "rgba(27, 65, 177, 0.35)");
    chartCtx.fillStyle = gradient;
    chartCtx.fillRect(x, y, 20, barHeight);
  });

  const points = Array.from({ length: 7 }, (_, index) => ({
    x: 42 + index * 38,
    y: 102 - Math.sin(chartTick * 2 + index * 0.8) * 24 - index * 8,
  }));

  chartCtx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) chartCtx.moveTo(point.x, point.y);
    else chartCtx.lineTo(point.x, point.y);
  });
  chartCtx.strokeStyle = "#91c8ff";
  chartCtx.lineWidth = 4;
  chartCtx.shadowBlur = 18;
  chartCtx.shadowColor = "#38a8ff";
  chartCtx.stroke();
  chartCtx.shadowBlur = 0;

  points.forEach((point, index) => {
    chartCtx.beginPath();
    chartCtx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    chartCtx.fillStyle = index % 2 ? "#a967ff" : "#58d8ff";
    chartCtx.fill();
  });

  requestAnimationFrame(drawDataChart);
};

drawDataChart();

const clusterCanvas = document.querySelector("#clusterCanvas");
const clusterCtx = clusterCanvas?.getContext("2d");
const clusterPoints = Array.from({ length: 115 }, () => {
  const groups = [
    { x: 130, y: 102, color: "#25bbff" },
    { x: 215, y: 70, color: "#89e942" },
    { x: 275, y: 128, color: "#ff8c2f" },
  ];
  const group = groups[Math.floor(Math.random() * groups.length)];
  return {
    x: group.x + (Math.random() - 0.5) * 100,
    y: group.y + (Math.random() - 0.5) * 80,
    z: Math.random() * 44,
    color: group.color,
  };
});

const drawCluster = () => {
  if (!clusterCanvas || !clusterCtx) return;
  const width = clusterCanvas.width;
  const height = clusterCanvas.height;
  clusterCtx.clearRect(0, 0, width, height);

  clusterCtx.strokeStyle = "rgba(190, 205, 255, 0.16)";
  clusterCtx.lineWidth = 1;
  clusterCtx.beginPath();
  clusterCtx.moveTo(58, 170);
  clusterCtx.lineTo(346, 170);
  clusterCtx.lineTo(382, 52);
  clusterCtx.moveTo(58, 170);
  clusterCtx.lineTo(88, 54);
  clusterCtx.lineTo(382, 52);
  clusterCtx.moveTo(88, 54);
  clusterCtx.lineTo(346, 170);
  clusterCtx.stroke();

  const time = Date.now() * 0.001;
  clusterPoints.forEach((point, index) => {
    const wave = Math.sin(time + index * 0.18) * 3;
    const px = point.x + point.z * 0.42;
    const py = point.y - point.z * 0.24 + wave;
    clusterCtx.beginPath();
    clusterCtx.arc(px, py, 2.5 + point.z * 0.012, 0, Math.PI * 2);
    clusterCtx.fillStyle = point.color;
    clusterCtx.shadowBlur = 12;
    clusterCtx.shadowColor = point.color;
    clusterCtx.fill();
    clusterCtx.shadowBlur = 0;
  });

  requestAnimationFrame(drawCluster);
};

drawCluster();