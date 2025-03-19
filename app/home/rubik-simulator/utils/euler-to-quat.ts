export const eulerToQuat = (
  angleX: number = 0, 
  angleY: number = 0, 
  angleZ: number = 0, 
): Float32Array<ArrayBuffer> => {
  const sinHalfX: number = Math.sin(angleX / 2);
  const sinHalfY: number = Math.sin(angleY / 2);
  const sinHalfZ: number = Math.sin(angleZ / 2);
  const cosHalfX: number = Math.cos(angleX / 2);
  const cosHalfY: number = Math.cos(angleY / 2);
  const cosHalfZ: number = Math.cos(angleZ / 2);

  const result: Float32Array<ArrayBuffer> = new Float32Array(4);

  result[0] = sinHalfX * cosHalfY * cosHalfZ - cosHalfX * sinHalfY * sinHalfZ; 
  result[1] = cosHalfX * sinHalfY * cosHalfZ + sinHalfX * cosHalfY * sinHalfZ; 
  result[2] = cosHalfX * cosHalfY * sinHalfZ - sinHalfX * sinHalfY * cosHalfZ; 
  result[3] = cosHalfX * cosHalfY * cosHalfZ + sinHalfX * sinHalfY * sinHalfZ; 

  return result;
}
