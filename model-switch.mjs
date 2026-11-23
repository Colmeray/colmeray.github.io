import { t } from './i18n.mjs';
import { getMissionFrame, MISSION_DURATION } from './mission-timeline.mjs';

// Proposed command ownership. The flight controller stabilises in every mode.
export const SCENARIOS = Object.freeze({
  cruise: Object.freeze({ snn: 'watching', navigation: 'sleep', vlm: 'sleep', control: 'autopilot', gpu: false, mode: 'sparse' }),
  obstacle: Object.freeze({ snn: 'avoiding', navigation: 'sleep', vlm: 'sleep', control: 'snn', gpu: false, mode: 'dense' }),
  uncertain: Object.freeze({ snn: 'watching', navigation: 'fallback', vlm: 'planning', control: 'fallback', gpu: true, mode: 'fallback' }),
  delivery: Object.freeze({ snn: 'guarding', navigation: 'ready', vlm: 'planning', control: 'vlm', gpu: true, mode: 'destination' }),
});

export function createModelSwitch(root) {
  let language = 'en';
  let scenario = 'cruise';
  const buttons = [...root.querySelectorAll('[data-scenario-select]')];
  const status = root.querySelector('#switch-status');
  const playButton = root.querySelector('#mission-play');
  const playLabel = root.querySelector('#mission-play-label');
  const restartButton = root.querySelector('#mission-restart');
  const progress = root.querySelector('#mission-progress');
  const clock = root.querySelector('#mission-time');
  const playbackLabel = root.querySelector('#mission-playback-state');
  const drone = root.querySelector('.map-drone');
  const path = root.querySelector('.mission-flight-path');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let playback = 'ready';
  let elapsed = 0;
  let lastTime = null;
  let animation = null;
  let lastClock = '';
  let lastPlayback = '';
  const pathLength = path.getTotalLength();
  progress.max = String(MISSION_DURATION / 1000);
  const timeLabel = milliseconds => '0:' + String(Math.floor(milliseconds / 1000)).padStart(2, '0');

  function renderPlayback() {
    const playbackKey = language + ':' + playback;
    if (lastPlayback !== playbackKey) {
      root.dataset.playback = playback;
      playButton.setAttribute('aria-pressed', String(playback === 'playing'));
      playLabel.textContent = t(language, playback === 'playing' ? 'pauseMission' : playback === 'paused' ? 'resumeMission' : playback === 'complete' ? 'replayMission' : 'playMission');
      playbackLabel.textContent = t(language, 'playback_' + playback);
      lastPlayback = playbackKey;
    }
    const frame = getMissionFrame(elapsed);
    progress.value = String(elapsed / 1000);
    progress.style.setProperty('--mission-progress', frame.progress * 100 + '%');
    const currentClock = timeLabel(elapsed) + ' / ' + timeLabel(MISSION_DURATION);
    if (lastClock !== currentClock) {
      clock.textContent = currentClock;
      progress.setAttribute('aria-valuetext', currentClock);
      lastClock = currentClock;
    }
    if (playback === 'ready' || playback === 'manual') {
      drone.style.removeProperty('transform');
      root.style.removeProperty('--path-remaining');
      return;
    }
    // Reduced-motion mode keeps the scene still within each phase.
    const shownFrame = reducedMotion.matches && !frame.complete
      ? getMissionFrame(frame.phaseStart) : frame;
    const point = path.getPointAtLength(shownFrame.pathProgress * pathLength);
    drone.style.transform = 'translate(' + point.x + 'px, ' + point.y + 'px)';
    root.style.setProperty('--path-remaining', String(1 - shownFrame.pathProgress));
  }

  function render(announce = false) {
    const config = SCENARIOS[scenario];
    root.dataset.scenario = scenario;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenarioSelect === scenario)));
    for (const model of ['snn', 'navigation', 'vlm']) {
      root.querySelector('[data-model="' + model + '"]').dataset.level = config[model];
      root.querySelector('[data-model-status="' + model + '"]').textContent = t(language, 'modelState_' + config[model]);
    }
    root.querySelector('#gpu-state').textContent = t(language, config.gpu ? 'gpuAwake' : 'gpuAsleep');
    root.querySelector('#control-owner').textContent = t(language, 'control_' + config.control);
    root.querySelector('#scenario-mode').textContent = t(language, config.mode);
    for (const part of ['title', 'text', 'transition']) {
      root.querySelector('#scenario-' + part).textContent = t(language, scenario + '_' + part);
    }
    if (announce) status.textContent = t(language, scenario + '_title') + '. ' + t(language, 'control_' + config.control) + '. ' + t(language, config.gpu ? 'gpuAwake' : 'gpuAsleep') + '.';
  }
  function stopAnimation() {
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
    lastTime = null;
  }
  function setFrame(next, announce = false) {
    const frame = getMissionFrame(next);
    elapsed = frame.elapsed;
    const changed = scenario !== frame.scenario;
    scenario = frame.scenario;
    if (frame.complete) {
      playback = 'complete';
      stopAnimation();
    }
    if (changed || announce) render(announce || changed);
    renderPlayback();
    if (frame.complete && announce) status.textContent = t(language, 'missionComplete');
  }
  function tick(time) {
    animation = null;
    if (playback !== 'playing') return;
    // Cap background delays so resuming never jumps across the explanation.
    const delta = lastTime === null ? 0 : Math.min(time - lastTime, 100);
    lastTime = time;
    setFrame(elapsed + delta);
    if (playback === 'playing') animation = requestAnimationFrame(tick);
    else status.textContent = t(language, 'missionComplete');
  }
  function pause() {
    if (playback !== 'playing') return;
    stopAnimation();
    playback = 'paused';
    renderPlayback();
  }
  playButton.addEventListener('click', () => {
    if (playback === 'playing') { pause(); return; }
    if (playback === 'ready' || playback === 'manual' || playback === 'complete') elapsed = 0;
    playback = 'playing';
    lastTime = null;
    setFrame(elapsed, true);
    animation = requestAnimationFrame(tick);
  });
  restartButton.addEventListener('click', () => {
    stopAnimation();
    elapsed = 0;
    playback = 'ready';
    scenario = 'cruise';
    render(true);
    renderPlayback();
  });
  progress.addEventListener('input', () => {
    stopAnimation();
    playback = 'paused';
    setFrame(progress.valueAsNumber * 1000);
  });
  progress.addEventListener('change', () => render(true));
  buttons.forEach(button => button.addEventListener('click', () => {
    stopAnimation();
    elapsed = 0;
    playback = 'manual';
    scenario = button.dataset.scenarioSelect;
    render(true);
    renderPlayback();
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) pause();
    });
    visibility.observe(root);
  }
  reducedMotion.addEventListener('change', () => { pause(); renderPlayback(); });
  return { setLanguage(next) { language = next; render(); renderPlayback(); status.textContent = ''; } };
}
