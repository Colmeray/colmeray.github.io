// Power in W except the event-camera input (mW). Energy in Wh, speed in km/h.
// Poster assumptions, not measured performance of an integrated drone.
import { ENERGY_DEFAULTS } from './data/energy.mjs';
export const DEFAULTS = ENERGY_DEFAULTS;

export function calculate(values) {
  for (const key of ['propulsion', 'heavy', 'battery', 'speed']) {
    if (!Number.isFinite(values[key]) || values[key] <= 0) throw new RangeError(`Invalid ${key}`);
  }
  for (const key of ['camera', 'snn', 'lidar', 'frame', 'sleep']) {
    if (!Number.isFinite(values[key]) || values[key] < 0) throw new RangeError(`Invalid ${key}`);
  }
  if (!Number.isInteger(values.lidarCount) || values.lidarCount < 1 || values.lidarCount > 2) {
    throw new RangeError('Invalid lidarCount');
  }
  if (!Number.isFinite(values.awake) || values.awake < 0 || values.awake > 100
    || !Number.isFinite(values.reserve) || values.reserve < 0 || values.reserve >= 100) {
    throw new RangeError('Invalid percentage');
  }
  const duty = values.awake / 100;
  const lidarPower = values.lidar * values.lidarCount;
  const baselineNavigation = values.heavy + lidarPower + values.frame;
  const sparseNavigation = values.camera / 1000 + values.snn + lidarPower + values.sleep;
  const denseNavigation = values.camera / 1000 + values.snn + lidarPower + values.heavy + values.frame;
  const navigation = (1 - duty) * sparseNavigation + duty * denseNavigation;
  const baselinePower = values.propulsion + baselineNavigation;
  const totalPower = values.propulsion + navigation;
  const usableEnergy = values.battery * (1 - values.reserve / 100);
  const baselineMinutes = usableEnergy / baselinePower * 60;
  const flightMinutes = usableEnergy / totalPower * 60;
  return {
    navigation, baselineNavigation, sparseNavigation, denseNavigation,
    baselinePower, totalPower, usableEnergy, lidarPower,
    navigationSaving: (1 - navigation / baselineNavigation) * 100,
    rangeGain: (baselinePower / totalPower - 1) * 100,
    baselineMinutes, flightMinutes,
    baselineRadius: values.speed * baselineMinutes / 120,
    radius: values.speed * flightMinutes / 120,
    energyPerKm: totalPower / values.speed,
    baselineEnergyPerKm: baselinePower / values.speed,
  };
}
