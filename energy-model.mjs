export const DEFAULTS = Object.freeze({
  propulsion: 30, heavy: 10, awake: 20, camera: 3, snn: 1,
  sleep: 0.5, battery: 20, speed: 36, reserve: 20,
});

// Poster model: power in W, camera/SNN inputs in mW, battery in Wh, speed in km/h.
export function calculate(values) {
  for (const key of ['propulsion', 'heavy', 'battery', 'speed']) {
    if (!Number.isFinite(values[key]) || values[key] <= 0) throw new RangeError(`Invalid ${key}`);
  }
  for (const key of ['camera', 'snn', 'sleep']) {
    if (!Number.isFinite(values[key]) || values[key] < 0) throw new RangeError(`Invalid ${key}`);
  }
  if (!Number.isFinite(values.awake) || values.awake < 0 || values.awake > 100
    || !Number.isFinite(values.reserve) || values.reserve < 0 || values.reserve >= 100) {
    throw new RangeError('Invalid percentage');
  }
  const duty = values.awake / 100;
  const navigation = values.camera / 1000 + values.snn / 1000
    + duty * values.heavy + (1 - duty) * values.sleep;
  const baselinePower = values.propulsion + values.heavy;
  const totalPower = values.propulsion + navigation;
  const usableEnergy = values.battery * (1 - values.reserve / 100);
  const baselineMinutes = usableEnergy / baselinePower * 60;
  const flightMinutes = usableEnergy / totalPower * 60;
  return {
    navigation, baselinePower, totalPower, usableEnergy,
    navigationSaving: (1 - navigation / values.heavy) * 100,
    rangeGain: (baselinePower / totalPower - 1) * 100,
    baselineMinutes, flightMinutes,
    baselineRadius: values.speed * baselineMinutes / 120,
    radius: values.speed * flightMinutes / 120,
    energyPerKm: totalPower / values.speed,
    baselineEnergyPerKm: baselinePower / values.speed,
  };
}
