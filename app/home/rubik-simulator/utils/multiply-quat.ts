export const multiplyQuat = (
  a: Float32Array<ArrayBuffer> = new Float32Array(4), 
  b: Float32Array<ArrayBuffer> = new Float32Array(4), 
): Float32Array<ArrayBuffer> => {
  const result: Float32Array<ArrayBuffer> = new Float32Array(4);

  result[0] = a[0] * b[3] + a[3] * b[0] + a[1] * b[2] - a[2] * b[1];
  result[1] = a[1] * b[3] + a[3] * b[1] + a[2] * b[0] - a[0] * b[2];
  result[2] = a[2] * b[3] + a[3] * b[2] + a[0] * b[1] - a[1] * b[0];
  result[3] = a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2];

  return result;
}
