export const perspective = (
  fovy: number, 
  aspect: number, 
  near: number, 
  far: number, 
): Float32Array<ArrayBuffer> => {
  const f: number = 1.0 / Math.tan(fovy / 2);
  const nf: number = 1 / (near - far);
  const result: Float32Array<ArrayBuffer> = new Float32Array(16);

  result[0] = f / aspect;
  result[1] = 0;
  result[2] = 0;
  result[3] = 0;
  result[4] = 0;
  result[5] = f;
  result[6] = 0;
  result[7] = 0;
  result[8] = 0;
  result[9] = 0;
  result[10] = (far + near) * nf;
  result[11] = -1;
  result[12] = 0;
  result[13] = 0;
  result[14] = 2 * far * near * nf;
  result[15] = 0;

  return result;
}
