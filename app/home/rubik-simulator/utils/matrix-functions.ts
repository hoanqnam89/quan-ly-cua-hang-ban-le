export const cross = (
  a: Float32Array<ArrayBuffer>, 
  b: Float32Array<ArrayBuffer>, 
): Float32Array<ArrayBuffer> => {
  const result: Float32Array<ArrayBuffer> = new Float32Array(3);

  result[0] = a[1] * b[2] - a[2] * b[1];
  result[1] = a[2] * b[0] - a[0] * b[2];
  result[2] = a[0] * b[1] - a[1] * b[0];

  return result;
}

export const dot = (
  a: Float32Array<ArrayBuffer>, 
  b: Float32Array<ArrayBuffer>, 
): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const identity = (): Float32Array<ArrayBuffer> => {
  const result: Float32Array<ArrayBuffer> = new Float32Array(16);

  result[0] = 1;
  result[1] = 0;
  result[2] = 0;
  result[3] = 0;
  result[4] = 0;
  result[5] = 1;
  result[6] = 0;
  result[7] = 0;
  result[8] = 0;
  result[9] = 0;
  result[10] = 1;
  result[11] = 0;
  result[12] = 0;
  result[13] = 0;
  result[14] = 0;
  result[15] = 1;

  return result;
}

export const multiply = (
  a: Float32Array<ArrayBuffer> = new Float32Array(16), 
  b: Float32Array<ArrayBuffer> = new Float32Array(16)
): Float32Array<ArrayBuffer> => {
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
  const a30: number = a[12];
  const a31: number = a[13];
  const a32: number = a[14];
  const a33: number = a[15];

  // Cache only the current line of the second matrix
  let b0: number = b[0];
  let b1: number = b[1];
  let b2: number = b[2];
  let b3: number = b[3];

  const result: Float32Array<ArrayBuffer> = new Float32Array(16);
  result[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  result[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  result[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  result[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  result[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  result[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  result[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  result[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  result[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  result[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  result[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  result[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  result[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  result[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  result[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  result[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  return result;
}

export const invert = (
  a: Float32Array<ArrayBuffer>
): Float32Array<ArrayBuffer> | null => {
  const a00: number = a[0];
  const a01: number = a[1];
  const a02: number = a[2];
  const a10: number = a[3];
  const a11: number = a[4];
  const a12: number = a[5];
  const a20: number = a[6];
  const a21: number = a[7];
  const a22: number = a[8];

  const b01: number = a22 * a11 - a12 * a21;
  const b11: number = -a22 * a10 + a12 * a20;
  const b21: number = a21 * a10 - a11 * a20;

  // Calculate the determinant
  let det: number = a00 * b01 + a01 * b11 + a02 * b21;

  if (!det) 
    return null;

  det = 1.0 / det;

  const result: Float32Array<ArrayBuffer> = new Float32Array(9);

  result[0] = b01 * det;
  result[1] = (-a22 * a01 + a02 * a21) * det;
  result[2] = (a12 * a01 - a02 * a11) * det;
  result[3] = b11 * det;
  result[4] = (a22 * a00 - a02 * a20) * det;
  result[5] = (-a12 * a00 + a02 * a10) * det;
  result[6] = b21 * det;
  result[7] = (-a21 * a00 + a01 * a20) * det;
  result[8] = (a11 * a00 - a01 * a10) * det;

  return result;
}

export const transformMat3 = (
  a: Float32Array<ArrayBuffer>, 
  m: Float32Array<ArrayBuffer>, 
): Float32Array<ArrayBuffer> => {
  const x: number = a[0];
  const y: number = a[1];
  const z: number = a[2];

  const result: Float32Array<ArrayBuffer> = new Float32Array(3);

  result[0] = x * m[0] + y * m[3] + z * m[6];
  result[1] = x * m[1] + y * m[4] + z * m[7];
  result[2] = x * m[2] + y * m[5] + z * m[8];

  return result;
}
