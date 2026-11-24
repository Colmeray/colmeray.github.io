// Exact poster rule; no clipping limits are fabricated.
export function calculateWeightChange(rate, modulator, eligibility) {
  if (![rate,modulator,eligibility].every(Number.isFinite) || rate<0) throw new RangeError('Invalid learning example');
  return rate*modulator*eligibility;
}
