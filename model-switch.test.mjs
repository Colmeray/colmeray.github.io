import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS } from './model-switch.mjs';
import { messages } from './i18n.mjs';
import { getMissionFrame, MISSION_DURATION } from './mission-timeline.mjs';

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
test('the guided mission holds position throughout the safety fallback', () => {
  const start = getMissionFrame(12000);
  const later = getMissionFrame(17500);
  assert.equal(start.scenario, 'uncertain');
  assert.equal(later.scenario, 'uncertain');
  assert.equal(start.pathProgress, later.pathProgress);
  assert.equal(getMissionFrame(18000).scenario, 'delivery');
  assert.ok(getMissionFrame(20000).pathProgress > later.pathProgress);
});
test('mission progress clamps to departure and completes at the delivery location', () => {
  const start = getMissionFrame(-1);
  assert.equal(start.elapsed, 0);
  assert.equal(start.pathProgress, 0);
  assert.equal(start.scenario, 'cruise');
  const end = getMissionFrame(MISSION_DURATION + 1000);
  assert.equal(end.complete, true);
  assert.equal(end.progress, 1);
  assert.equal(end.pathProgress, 1);
  assert.equal(end.scenario, 'delivery');
  for (const invalid of [NaN, Infinity, undefined]) assert.throws(() => getMissionFrame(invalid), RangeError);
});
