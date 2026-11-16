import { t, localeFor } from './i18n.mjs';

// This is a teaching illustration, driven by the user's duty cycle, not inference.
export function isNavigatorAwake(phase, awakePercent) {
  const duty = Math.min(100, Math.max(0, awakePercent)) / 100;
  return duty > 0 && ((phase % 1 + 1) % 1) >= 1 - duty;
}

export function createForestDemo(root) {
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const toggle = root.querySelector('#animation-toggle');
  const replay = root.querySelector('#animation-replay');
  const stateLabel = root.querySelector('#animation-state');
  const powerLabel = root.querySelector('#animation-power');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let config = { language: 'en', valid: false, awake: 20, camera: 3, snn: 1, heavy: 10, sleep: 0.5 };
  let running = !reducedMotion.matches;
  let visible = true;
  let frame = null;
  let lastTime = null;
  let phase = 0.08;
  let width = 640;
  let height = 245;
  let previousState = '';

  // Deterministic generated forest geometry; no ForestScan records are loaded.
  let seed = 2026;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const trees = [
    [-1.25, 0.10, 0.48], [-0.82, 0.14, 0.57], [-0.30, 0.07, 0.43], [0.29, 0.12, 0.54], [0.78, 0.11, 0.50], [1.23, 0.12, 0.58],
    [-1.15, 0.85, 0.58], [-0.64, 0.82, 0.62], [-0.08, 0.87, 0.52], [0.48, 0.85, 0.66], [1.04, 0.83, 0.55],
  ];
  const points = [];
  for (const [x, z, top] of trees) {
    for (let i = 0; i < 27; i += 1) {
      points.push({ x: x + (random() - 0.5) * 0.025, z: z + (random() - 0.5) * 0.04, h: random() * top * 0.75, wood: true });
    }
    for (let i = 0; i < 115; i += 1) {
      const angle = random() * Math.PI * 2;
      const elevation = random() * 2 - 1;
      const radius = Math.sqrt(1 - elevation * elevation) * (0.5 + random() * 0.5);
      points.push({ x: x + Math.cos(angle) * radius * 0.23, z: z + Math.sin(angle) * radius * 0.19, h: top * (0.76 + elevation * 0.24), wood: false });
    }
  }
  points.sort((a, b) => b.z - a.z);

  function project(x, z, h = 0) {
    return { x: width * (0.5 + x * 0.30 + (z - 0.5) * 0.18), y: height * (0.85 - z * 0.30 - h * 0.72) };
  }

  function line(a, b, color, lineWidth = 1) {
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
  }

  function drawDrone(position, active) {
    const scale = Math.min(1, width / 500);
    ctx.save(); ctx.translate(position.x, position.y); ctx.scale(scale, scale);
    ctx.fillStyle = '#78826820'; ctx.beginPath(); ctx.ellipse(0, 34, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
    const rotors = [[-19, -7], [17, -12], [-17, 9], [20, 5]];
    for (const [x, y] of rotors) {
      line({ x: 0, y: 0 }, { x, y }, '#58634d', 2.7);
      ctx.beginPath(); ctx.ellipse(x, y, 11, 4, -0.12, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffffc0'; ctx.fill(); ctx.strokeStyle = '#8b967a'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.4); ctx.rotate(phase * Math.PI * 170);
      line({ x: -10, y: 0 }, { x: 10, y: 0 }, '#7b896b', 1.5);
      line({ x: 0, y: -9 }, { x: 0, y: 9 }, '#7b896b', 1.5); ctx.restore();
    }
    line({ x: -4, y: 6 }, { x: -5, y: 19 }, '#7b826e', 1);
    line({ x: 5, y: 5 }, { x: 7, y: 17 }, '#7b826e', 1);
    ctx.fillStyle = '#fffff7'; ctx.strokeStyle = '#7c886b'; ctx.lineWidth = 1;
    ctx.fillRect(-7, 16, 17, 13); ctx.strokeRect(-7, 16, 17, 13);
    line({ x: 1.5, y: 18.5 }, { x: 1.5, y: 26 }, '#7e9763', 2);
    line({ x: -2, y: 22 }, { x: 5, y: 22 }, '#7e9763', 2);
    ctx.fillStyle = active ? '#a40000' : '#677656'; ctx.strokeStyle = '#fffdf5'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.roundRect(-7, -6, 14, 13, 3); ctx.fill(); ctx.stroke();
    line({ x: -3, y: 0 }, { x: 3, y: 0 }, '#fff5e8', 1);
    ctx.fillStyle = '#26372e'; ctx.beginPath(); ctx.arc(9, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function updateLabels(active) {
    root.dataset.running = String(running);
    root.dataset.valid = String(config.valid);
    root.dataset.navigator = config.valid && active ? 'awake' : 'sleep';
    root.dataset.phase = phase.toFixed(3);
    toggle.textContent = t(config.language, running ? 'pauseAnimation' : 'playAnimation');
    const instantaneous = config.camera / 1000 + config.snn / 1000 + (active ? config.heavy : config.sleep);
    const key = `${config.language}|${config.valid}|${active}|${instantaneous}`;
    if (key === previousState) return;
    previousState = key;
    stateLabel.textContent = t(config.language, !config.valid ? 'invalidAnimation' : active ? 'difficultState' : 'routineState');
    powerLabel.textContent = config.valid
      ? `${new Intl.NumberFormat(localeFor(config.language), { maximumFractionDigits: 3 }).format(instantaneous)} W`
      : '—';
  }

  function draw() {
    const active = config.valid && isNavigatorAwake(phase, config.awake);
    updateLabels(active);
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    for (let x = -1.4; x <= 1.41; x += 0.2) line(project(x, 0), project(x, 1), '#c4ccb030', 0.6);
    for (let z = 0; z <= 1.01; z += 0.1) line(project(-1.4, z), project(1.4, z), '#c4ccb030', 0.6);
    ctx.setLineDash([4, 6]);
    line(project(-1.3, 0.48), project(1.3, 0.48), '#9caa8050', 1);
    ctx.setLineDash([]);
    const droneX = -1.18 + phase * 2.36;
    const bend = active ? Math.sin(Math.PI * (phase - (1 - config.awake / 100)) / Math.max(config.awake / 100, 0.01)) * 0.13 : 0;
    const droneZ = 0.48 + bend;
    const droneH = 0.24 + Math.sin(phase * Math.PI * 8) * 0.012;
    for (const point of points) {
      const p = project(point.x, point.z, point.h);
      const highlight = active && Math.abs(point.x - droneX - 0.20) < 0.3 && point.h < 0.45;
      ctx.fillStyle = highlight ? '#a4000075' : point.wood ? '#99866b65' : `rgba(98,125,69,${0.22 + point.z * 0.35})`;
      const radius = point.wood ? 0.7 : 0.8 + (1 - point.z) * 0.3;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
    }
    const drone = project(droneX, droneZ, droneH);
    const farTop = project(droneX + 0.48, droneZ + 0.16, droneH + 0.15);
    const farBottom = project(droneX + 0.48, droneZ - 0.16, droneH - 0.10);
    ctx.beginPath(); ctx.moveTo(drone.x + 8, drone.y); ctx.lineTo(farTop.x, farTop.y); ctx.lineTo(farBottom.x, farBottom.y); ctx.closePath();
    ctx.fillStyle = active ? '#a4000009' : '#879d6409'; ctx.fill();
    for (let i = 0; i < (active ? 18 : 6); i += 1) {
      const progress = (phase * 8 + i * 0.137) % 1;
      const distance = 14 + (1 - progress) * Math.min(75, width * 0.1);
      const spread = Math.sin(i * 13.2) * distance * 0.28;
      ctx.fillStyle = active ? '#a4000090' : '#72845c70';
      ctx.beginPath(); ctx.arc(drone.x + distance, drone.y + spread, active ? 1.3 : 0.9, 0, Math.PI * 2); ctx.fill();
    }
    drawDrone(drone, active);
  }

  function shouldRun() { return running && visible && !document.hidden && config.valid && ctx; }
  function tick(time) {
    frame = null;
    if (!shouldRun()) { lastTime = null; return; }
    if (lastTime !== null) phase = (phase + Math.min(time - lastTime, 100) / 12000) % 1;
    lastTime = time;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!shouldRun()) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; lastTime = null;
    } else if (frame === null) frame = requestAnimationFrame(tick);
  }

  const resize = new ResizeObserver(() => {
    width = canvas.clientWidth || 640;
    height = canvas.clientHeight || 245;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  });
  resize.observe(canvas);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); });
  intersection.observe(root);
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', event => { if (event.matches) running = false; draw(); schedule(); });
  toggle.addEventListener('click', () => { running = !running; draw(); schedule(); });
  replay.addEventListener('click', () => { phase = 0; lastTime = null; draw(); });
  return {
    update(next) { config = { ...config, ...next }; draw(); schedule(); },
  };
}
