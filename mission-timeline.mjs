// A scripted teaching sequence, independent of the energy model and real flight time.
export const MISSION_STEPS = Object.freeze([
  Object.freeze({ scenario: 'cruise', duration: 6000, from: 0, to: 0.26 }),
  Object.freeze({ scenario: 'obstacle', duration: 6000, from: 0.26, to: 0.72 }),
  Object.freeze({ scenario: 'uncertain', duration: 6000, from: 0.72, to: 0.72 }),
  Object.freeze({ scenario: 'delivery', duration: 6000, from: 0.72, to: 1 }),
]);
export const MISSION_DURATION = MISSION_STEPS.reduce((duration, step) => duration + step.duration, 0);

export function getMissionFrame(milliseconds) {
  if (!Number.isFinite(milliseconds)) throw new RangeError('Invalid mission time');
  const elapsed = Math.min(MISSION_DURATION, Math.max(0, milliseconds));
  let start = 0;
  let index = 0;
  while (index < MISSION_STEPS.length - 1 && elapsed >= start + MISSION_STEPS[index].duration) {
    start += MISSION_STEPS[index].duration;
    index += 1;
  }
  const step = MISSION_STEPS[index];
  const phaseProgress = (elapsed - start) / step.duration;
  return {
    scenario: step.scenario,
    phaseStart: start,
    elapsed,
    progress: elapsed / MISSION_DURATION,
    pathProgress: step.from + (step.to - step.from) * phaseProgress,
    complete: elapsed === MISSION_DURATION,
  };
}
