import { t } from './i18n.mjs';

// Proposed handovers from the poster. This does not run inference or drive the calculator.
export const SCENARIOS = Object.freeze({
  cruise: { snn: 'watching', navigation: 'sleep', vlm: 'sleep', control: 'autopilot', gpu: false },
  obstacle: { snn: 'avoiding', navigation: 'sleep', vlm: 'sleep', control: 'snn', gpu: false },
  uncertain: { snn: 'watching', navigation: 'fallback', vlm: 'sleep', control: 'fallback', gpu: true },
  delivery: { snn: 'guarding', navigation: 'ready', vlm: 'planning', control: 'vlm', gpu: true },
});

export function createModelSwitch(root) {
  let language = 'en';
  let scenario = 'cruise';
  const buttons = [...root.querySelectorAll('[data-scenario-select]')];
  const status = root.querySelector('#switch-status');

  function render(announce = false) {
    const config = SCENARIOS[scenario];
    root.dataset.scenario = scenario;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scenarioSelect === scenario)));
    for (const model of ['snn', 'navigation', 'vlm']) {
      const state = config[model];
      root.querySelector(`[data-model="${model}"]`).dataset.level = state;
      root.querySelector(`[data-model-status="${model}"]`).textContent = t(language, `modelState_${state}`);
    }
    root.querySelector('#gpu-state').textContent = t(language, config.gpu ? 'gpuAwake' : 'gpuAsleep');
    root.querySelector('#control-owner').textContent = t(language, `control_${config.control}`);
    root.querySelector('#scenario-title').textContent = t(language, `${scenario}Title`);
    root.querySelector('#scenario-text').textContent = t(language, `${scenario}Text`);
    root.querySelector('#scenario-transition').textContent = t(language, `${scenario}Transition`);
    if (announce) status.textContent = `${t(language, `${scenario}Title`)}. ${t(language, `control_${config.control}`)}. ${t(language, config.gpu ? 'gpuAwake' : 'gpuAsleep')}.`;
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    scenario = button.dataset.scenarioSelect;
    render(true);
  }));
  render();
  return { setLanguage(next) { language = next; render(); status.textContent = ''; } };
}
