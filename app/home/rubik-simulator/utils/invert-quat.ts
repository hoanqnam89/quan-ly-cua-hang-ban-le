export const invertQuat = (
  a: Float32Array<ArrayBuffer>
): Float32Array<ArrayBuffer> => {
  const dot: number = a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3];
  const invertDot: number = dot ? 1.0 / dot : 0.0;

  const result: Float32Array<ArrayBuffer> = new Float32Array(4);

  result[0] = -a[0] * invertDot;
  result[1] = -a[1] * invertDot;
  result[2] = -a[2] * invertDot;
  result[3] = a[3] * invertDot;

  return result;
}
