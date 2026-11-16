// Educational, constant-average-power model. SI gravity, mass in kg, energy in Wh.
export const DEFAULTS = Object.freeze({
  capacity: 10000, voltage: 22.2, reserve: 20,
  propulsion: 450, electronics: 20, saving: 26,
  distance: 5, speed: 40, delivery: 2, returnTrip: true,
  mass: 2.4, payload: 0.5, thrust: 70, targetRatio: 2,
});

export function calculate(v) {
  const positive = ['capacity', 'voltage', 'propulsion', 'speed', 'mass', 'thrust'];
  const nonnegative = ['electronics', 'distance', 'delivery', 'payload'];
  if (positive.some(k => !Number.isFinite(v[k]) || v[k] <= 0)
    || nonnegative.some(k => !Number.isFinite(v[k]) || v[k] < 0)
    || !Number.isFinite(v.reserve) || v.reserve < 0 || v.reserve >= 100
    || !Number.isFinite(v.saving) || v.saving < 0 || v.saving > 100
    || !Number.isFinite(v.targetRatio) || v.targetRatio < 1
    || typeof v.returnTrip !== 'boolean') {
    throw new RangeError('Ugyldige inddata');
  }
  const gravity = 9.80665;
  const energy = v.capacity / 1000 * v.voltage;
  const usableEnergy = energy * (1 - v.reserve / 100);
  const baselinePower = v.propulsion + v.electronics;
  const electronicsPower = v.electronics * (1 - v.saving / 100);
  const power = v.propulsion + electronicsPower;
  const flightMinutes = usableEnergy / power * 60;
  const baselineMinutes = usableEnergy / baselinePower * 60;
  const legs = v.returnTrip ? 2 : 1;
  const routeDistance = v.distance * legs;
  const outboundMinutes = v.distance / v.speed * 60;
  const missionMinutes = routeDistance / v.speed * 60 + v.delivery;
  const missionEnergy = missionMinutes / 60 * power;
  const baselineMissionEnergy = missionMinutes / 60 * baselinePower;
  const remainingEnergy = usableEnergy - missionEnergy;
  const maxDistance = Math.max(0, (flightMinutes - v.delivery) / 60 * v.speed / legs);
  const totalMass = v.mass + v.payload;
  const weightForce = totalMass * gravity;
  const actualRatio = v.thrust / weightForce;
  const payloadLimit = v.thrust / (gravity * v.targetRatio) - v.mass;
  const powerSaving = (baselinePower - power) / baselinePower * 100;
  return {
    energy, usableEnergy, baselinePower, electronicsPower, power,
    flightMinutes, baselineMinutes, routeDistance, outboundMinutes,
    missionMinutes, missionEnergy, baselineMissionEnergy, remainingEnergy,
    maxDistance, totalMass, weightForce, actualRatio, payloadLimit, powerSaving,
    energyFits: remainingEnergy >= -1e-9,
    liftFits: actualRatio + 1e-9 >= v.targetRatio,
    canHover: actualRatio >= 1,
  };
}
