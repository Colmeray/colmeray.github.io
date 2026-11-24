import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, DEFAULTS } from './energy-model.mjs';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('reproduces the new poster with a 1 W SNN, 10% duty and frame-camera gating', () => {
  const r = calculate(DEFAULTS);
  near(r.baselineNavigation, 12.15);
  near(r.navigation, 3.478);
  near(r.baselinePower, 142.15);
  near(r.totalPower, 133.478);
  near(r.navigationSaving, (1 - 3.478 / 12.15) * 100);
  assert.deepEqual([130, 260, 650].map(propulsion =>
    Number(calculate({ ...DEFAULTS, propulsion }).rangeGain.toFixed(1))), [6.5, 3.3, 1.3]);
});

test('a second lidar adds one sensor to both architectures', () => {
  const single = calculate({ ...DEFAULTS, lidarCount: 1 });
  const double = calculate({ ...DEFAULTS, lidarCount: 2 });
  near(double.baselinePower - single.baselinePower, 0.7);
  near(double.totalPower - single.totalPower, 0.7);
  assert.ok(double.rangeGain < single.rangeGain);
});

test('inactive and active phases average to the displayed navigation power', () => {
  for (const awake of [0, 10, 50, 100]) {
    const r = calculate({ ...DEFAULTS, awake, sleep: 0.3 });
    near(r.navigation, r.sparseNavigation * (1 - awake / 100) + r.denseNavigation * awake / 100);
  }
  near(calculate({ ...DEFAULTS, awake: 0 }).navigation, 2.403);
  near(calculate({ ...DEFAULTS, awake: 100 }).navigation, 13.153);
});

test('full GPU duty produces a loss because SNN and event-camera overhead remains', () => {
  const r = calculate({ ...DEFAULTS, awake: 100 });
  assert.ok(r.navigationSaving < 0);
  assert.ok(r.rangeGain < 0);
  assert.ok(r.flightMinutes < r.baselineMinutes);
});

test('reserve, return journey and Wh/km use consistent units', () => {
  const r = calculate(DEFAULTS);
  near(r.usableEnergy, 61.6);
  near(r.flightMinutes, 61.6 / 133.478 * 60);
  near(r.radius * 2, 36 * r.flightMinutes / 60);
  near(r.energyPerKm, 133.478 / 36);
  near(r.flightMinutes / r.baselineMinutes - 1, r.rangeGain / 100);
});

test('battery and speed change flight estimates without changing power savings', () => {
  const base = calculate(DEFAULTS);
  const larger = calculate({ ...DEFAULTS, battery: 154, speed: 72 });
  near(larger.rangeGain, base.rangeGain);
  near(larger.flightMinutes, base.flightMinutes * 2);
  near(larger.radius, base.radius * 4);
});

test('rejects invalid, missing and non-finite input', () => {
  for (const overrides of [
    { propulsion: 0 }, { heavy: 0 }, { battery: -1 }, { speed: undefined },
    { camera: -1 }, { snn: -1 }, { frame: NaN }, { lidar: Infinity },
    { lidarCount: 0 }, { lidarCount: 3 }, { lidarCount: 1.5 }, { sleep: -1 },
    { awake: 101 }, { awake: -1 }, { reserve: 100 }, { reserve: -1 },
  ]) assert.throws(() => calculate({ ...DEFAULTS, ...overrides }), RangeError);
});
