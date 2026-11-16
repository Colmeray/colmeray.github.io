import test from 'node:test';
import assert from 'node:assert/strict';
import { isNavigatorAwake } from './forest-demo.mjs';
import { calculate, DEFAULTS } from './energy-model.mjs';

test('zero and full duty cycle remain asleep or awake throughout the cycle', () => {
  for (const phase of [0, 0.1, 0.5, 0.9, 0.999]) {
    assert.equal(isNavigatorAwake(phase, 0), false);
    assert.equal(isNavigatorAwake(phase, 100), true);
  }
});

test('awake window occupies the selected final share of each cycle', () => {
  assert.equal(isNavigatorAwake(0.79, 20), false);
  assert.equal(isNavigatorAwake(0.81, 20), true);
  for (const duty of [1, 20, 50, 99]) {
    let active = 0;
    for (let i = 0; i < 10000; i += 1) active += Number(isNavigatorAwake((i + 0.5) / 10000, duty));
    assert.equal(active, duty * 100);
  }
});

test('phase wrapping preserves cycle state', () => {
  assert.equal(isNavigatorAwake(1.9, 20), true);
  assert.equal(isNavigatorAwake(2.2, 20), false);
  assert.equal(isNavigatorAwake(-0.1, 20), true);
  assert.equal(isNavigatorAwake(1, 20), false);
});

test('displayed instantaneous phases average to the calculator navigation power', () => {
  let energy = 0;
  for (let i = 0; i < 10000; i += 1) {
    const active = isNavigatorAwake((i + 0.5) / 10000, DEFAULTS.awake);
    energy += DEFAULTS.camera / 1000 + DEFAULTS.snn / 1000 + (active ? DEFAULTS.heavy : DEFAULTS.sleep);
  }
  assert.ok(Math.abs(energy / 10000 - calculate(DEFAULTS).navigation) < 1e-9);
});
