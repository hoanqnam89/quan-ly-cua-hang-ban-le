import { identity } from "./matrix-functions";

export const lookAt = (
  eye: Float32Array<ArrayBuffer> = new Float32Array(3), 
  center: Float32Array<ArrayBuffer> = new Float32Array(3), 
  up: Float32Array<ArrayBuffer> = new Float32Array(3), 
): Float32Array<ArrayBuffer> => {
  let x0: number;
  let x1: number;
  let x2: number;
  let y0: number;
  let y1: number;
  let y2: number;
  let z0: number;
  let z1: number;
  let z2: number;
  let len: number;

  const eyex: number = eye[0];
  const eyey: number = eye[1];
  const eyez: number = eye[2];
  const upx: number = up[0];
  const upy: number = up[1];
  const upz: number = up[2];
  const centerx: number = center[0];
  const centery: number = center[1];
  const centerz: number = center[2];

  if (
    Math.abs(eyex - centerx) < Number.EPSILON && 
    Math.abs(eyey - centery) < Number.EPSILON && 
    Math.abs(eyez - centerz) < Number.EPSILON
  ) 
    return identity();

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;

  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;

  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);

  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;

  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);

  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  const result: Float32Array<ArrayBuffer> = new Float32Array(16);

  result[0] = x0;
  result[1] = y0;
  result[2] = z0;
  result[3] = 0;
  result[4] = x1;
  result[5] = y1;
  result[6] = z1;
  result[7] = 0;
  result[8] = x2;
  result[9] = y2;
  result[10] = z2;
  result[11] = 0;
  result[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  result[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  result[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  result[15] = 1;

  return result;
}
