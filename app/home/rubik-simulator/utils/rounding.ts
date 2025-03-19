export const rounding = (n: number): number => {
  if (Math.abs(n - 1) < Number.EPSILON)
    return 1;

  if (Math.abs(n - 0) < Number.EPSILON)
    return 0;

  return n;
}
