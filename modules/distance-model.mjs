// Exact poster equation. d_min is an INPUT. No d_max is defined or fabricated.
export function calculateDistances({ speed, reaction, deceleration, minimum, clearance }) {
  for (const [name, value] of Object.entries({ speed, reaction, deceleration, minimum, clearance })) {
    if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  }
  if (speed < 0 || reaction < 0 || deceleration <= 0 || minimum <= 0 || clearance <= 0) {
    throw new RangeError('Speed and reaction must be non-negative; deceleration and distances must be positive.');
  }
  const reactionDistance = speed * reaction;
  const brakingDistance = speed ** 2 / (2 * deceleration);
  const switchDistance = reactionDistance + brakingDistance + minimum;
  if (!Number.isFinite(switchDistance)) throw new RangeError('Distance overflow');
  return {
    reactionDistance, brakingDistance, switchDistance, minimum, maximum: null,
    clearanceValid: minimum < clearance && clearance < switchDistance,
    exceedsBrightRange: switchDistance > 12,
    exceedsDarkRange: switchDistance > 7,
  };
}

// The labels are conceptual proposed logic, not flight dynamics or real inference.
export function proposedState(distance, switchDistance, minimum, looming = false) {
  if (![distance, switchDistance, minimum].every(Number.isFinite)
    || minimum <= 0 || switchDistance < minimum || distance < 0) throw new RangeError('Invalid thresholds');
  if (distance < minimum) return 'override';
  if (looming || distance <= switchDistance) return 'avoidance';
  return 'cruise';
}
