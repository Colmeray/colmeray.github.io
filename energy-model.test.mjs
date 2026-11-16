import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, DEFAULTS } from './energy-model.mjs';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('reproduces the poster navigation equation, including mW conversion', () => {
  const r = calculate(DEFAULTS);
  near(r.navigation, 2.404);
  near(r.navigationSaving, 75.96);
  near(r.baselinePower, 40);
  near(r.totalPower, 32.404);
  near(r.rangeGain, (40 / 32.404 - 1) * 100);
});

test('matches the rounded light, medium and heavy gains in the poster', () => {
  const gains = [30, 60, 150].map(propulsion => Math.round(calculate({ ...DEFAULTS, propulsion }).rangeGain));
  assert.deepEqual(gains, [23, 12, 5]);
});

test('reserve, flight minutes, round-trip radius and Wh/km use consistent units', () => {
  const r = calculate({ ...DEFAULTS, awake: 100, camera: 0, snn: 0 });
  near(r.usableEnergy, 16);
  near(r.flightMinutes, 24);
  near(r.radius, 7.2);
  near(r.energyPerKm, 40 / 36);
  near(r.radius * 2, 36 * r.flightMinutes / 60);
});

test('gating gains are independent of battery size and speed', () => {
  const base = calculate(DEFAULTS);
  const larger = calculate({ ...DEFAULTS, battery: DEFAULTS.battery * 2, speed: DEFAULTS.speed * 2 });
  near(larger.rangeGain, base.rangeGain);
  near(larger.flightMinutes, base.flightMinutes * 2);
  near(larger.radius, base.radius * 4);
  near(larger.energyPerKm, base.energyPerKm / 2);
});

test('gating is not presented as a gain when its overhead outweighs savings', () => {
  const alwaysOn = calculate({ ...DEFAULTS, awake: 100 });
  near(alwaysOn.navigation, 10.004);
  assert.ok(alwaysOn.navigationSaving < 0);
  assert.ok(alwaysOn.rangeGain < 0);
  assert.ok(alwaysOn.flightMinutes < alwaysOn.baselineMinutes);
  const highSleep = calculate({ ...DEFAULTS, sleep: 20 });
  assert.ok(highSleep.rangeGain < 0);
});

test('zero duty cycle and zero electronics power are valid boundaries', () => {
  const r = calculate({ ...DEFAULTS, awake: 0, camera: 0, snn: 0, sleep: 0, reserve: 0 });
  near(r.navigation, 0);
  near(r.navigationSaving, 100);
  near(r.flightMinutes, 40);
  near(r.radius, 12);
});

test('navigation savings and total range gain are distinct quantities', () => {
  const r = calculate(DEFAULTS);
  assert.ok(r.navigationSaving > 75);
  assert.ok(r.rangeGain < 24);
  near(r.flightMinutes / r.baselineMinutes - 1, r.rangeGain / 100);
  near(r.radius / r.baselineRadius - 1, r.rangeGain / 100);
});

test('rejects missing, nonfinite, negative and zero-divisor inputs', () => {
  for (const overrides of [
    { propulsion: 0 }, { heavy: 0 }, { battery: 0 }, { speed: 0 },
    { propulsion: -1 }, { heavy: Infinity }, { battery: NaN }, { speed: undefined },
    { camera: -1 }, { snn: -1 }, { sleep: -1 }, { awake: 101 },
    { awake: -1 }, { reserve: 100 }, { reserve: -1 },
  ]) assert.throws(() => calculate({ ...DEFAULTS, ...overrides }), RangeError);
});
