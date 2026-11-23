import { t } from './i18n.mjs';

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
  buttons.forEach(button => button.addEventListener('click', () => {
    scenario = button.dataset.scenarioSelect;
    render(true);
  }));
  return { setLanguage(next) { language = next; render(); status.textContent = ''; } };
}
