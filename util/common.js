
export function colorCode(days) {
  if (days === 0) {
    return ['#ef4444', '#fee2e2']
  }
  if (days <= 3) {
    return ['#854d0e', '#fef08a'];
  }
  return ['#15803d', '#dcfce7'];
}