import { identity } from "./matrix-functions";

export const rotate = (
  a: Float32Array<ArrayBuffer>, 
  rad: number, 
  axis: Float32Array<ArrayBuffer>
): Float32Array<ArrayBuffer> => {
  let x: number = axis[0];
  let y: number = axis[1];
  let z: number = axis[2];
  let len: number = Math.hypot(x, y, z);

  if (len < Number.EPSILON) 
    return identity();

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  const s: number = Math.sin(rad);
  const c: number = Math.cos(rad);
  const t: number = 1 - c;
  const a00: number = a[0];
  const a01: number = a[1];
  const a02: number = a[2];
  const a03: number = a[3];
  const a10: number = a[4];
  const a11: number = a[5];
  const a12: number = a[6];
  const a13: number = a[7];
  const a20: number = a[8];
  const a21: number = a[9];
  const a22: number = a[10];
  const a23: number = a[11];

  // Construct the elements of the rotation matrix
  const b00: number = x * x * t + c;
  const b01: number = y * x * t + z * s;
  const b02: number = z * x * t - y * s;
  const b10: number = x * y * t - z * s;
  const b11: number = y * y * t + c;
  const b12: number = z * y * t + x * s;
  const b20: number = x * z * t + y * s;
  const b21: number = y * z * t - x * s;
  const b22: number = z * z * t + c;

  // Perform rotation-specific matrix multiplication
  const result: Float32Array<ArrayBuffer> = new Float32Array(16);
  result[0] = a00 * b00 + a10 * b01 + a20 * b02;
  result[1] = a01 * b00 + a11 * b01 + a21 * b02;
  result[2] = a02 * b00 + a12 * b01 + a22 * b02;
  result[3] = a03 * b00 + a13 * b01 + a23 * b02;
  result[4] = a00 * b10 + a10 * b11 + a20 * b12;
  result[5] = a01 * b10 + a11 * b11 + a21 * b12;
  result[6] = a02 * b10 + a12 * b11 + a22 * b12;
  result[7] = a03 * b10 + a13 * b11 + a23 * b12;
  result[8] = a00 * b20 + a10 * b21 + a20 * b22;
  result[9] = a01 * b20 + a11 * b21 + a21 * b22;
  result[10] = a02 * b20 + a12 * b21 + a22 * b22;
  result[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (a !== result) {
    // If the source and destination differ, copy the unchanged last row
    result[12] = a[12];
    result[13] = a[13];
    result[14] = a[14];
    result[15] = a[15];
  }
  return result;
}
