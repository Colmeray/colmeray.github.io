import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS } from './model-switch.mjs';
import { messages } from './i18n.mjs';

test('local obstacle avoidance takes over without waking the GPU', () => {
  assert.equal(SCENARIOS.cruise.control, 'autopilot');
  assert.equal(SCENARIOS.obstacle.control, 'snn');
  assert.equal(SCENARIOS.obstacle.snn, 'avoiding');
  assert.equal(SCENARIOS.obstacle.gpu, false);
});
test('failed local takeover and destination planning both wake the GPU', () => {
  for (const scenario of ['uncertain', 'delivery']) {
    assert.equal(SCENARIOS[scenario].gpu, true);
    assert.equal(SCENARIOS[scenario].vlm, 'planning');
    assert.notEqual(SCENARIOS[scenario].snn, 'sleep');
  }
});
test('every scenario, control owner and model state is translated in both languages', () => {
  for (const [scenario, config] of Object.entries(SCENARIOS)) {
    for (const language of ['en', 'da']) {
      for (const key of [
        scenario + '_title', scenario + '_text', scenario + '_transition',
        'control_' + config.control, config.mode,
        ...['snn', 'navigation', 'vlm'].map(model => 'modelState_' + config[model]),
      ]) assert.ok(messages[language][key], language + ': ' + key);
    }
  }
});
test('English and Danish have matching message keys', () => {
  assert.deepEqual(Object.keys(messages.en).sort(), Object.keys(messages.da).sort());
});
