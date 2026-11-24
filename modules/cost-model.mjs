export function calculateCost(items, dkkPerUsd) {
  if (!Number.isFinite(dkkPerUsd) || dkkPerUsd <= 0) throw new RangeError('Invalid exchange rate');
  const missing = [];
  let subtotal = 0;
  const groups = {};
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) throw new RangeError('Invalid quantity');
    if (item.usd === null) { missing.push(item.id); continue; }
    if (!Number.isFinite(item.usd) || item.usd < 0 || item.usd > 1e8) throw new RangeError('Invalid unit price');
    const line = item.usd * item.quantity;
    subtotal += line;
    groups[item.category] = (groups[item.category] || 0) + line;
  }
  return { subtotal, dkk: subtotal * dkkPerUsd, missing, complete: missing.length === 0, groups };
}
