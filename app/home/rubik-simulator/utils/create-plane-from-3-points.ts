import { CPlane } from "@/classes/Plane.class";
import { CPosition } from "@/classes/Position.class";
import { cross, dot } from "./matrix-functions";
import { CColor } from "@/classes/Color.class";

export const createPlaneFrom3Points = (
  a: CPosition = new CPosition(), 
  b: CPosition = new CPosition(), 
  c: CPosition = new CPosition(), 
  color: CColor = new CColor(), 
  colorName: string = ``, 
  center: number = 0, 
): CPlane => {
  const vertex1: Float32Array<ArrayBuffer> = new Float32Array(3);
  const vertex2: Float32Array<ArrayBuffer> = new Float32Array(3);

  vertex1[0] = b.getX() - a.getX();
  vertex1[1] = b.getY() - a.getY();
  vertex1[2] = b.getZ() - a.getZ();

  vertex2[0] = c.getX() - a.getX();
  vertex2[1] = c.getY() - a.getY();
  vertex2[2] = c.getZ() - a.getZ();

  const normal: Float32Array<ArrayBuffer> = cross(vertex1, vertex2);
  const a0: Float32Array<ArrayBuffer> = new Float32Array(3);

  a0[0] = a.getX();
  a0[1] = a.getY();
  a0[2] = a.getZ();

  const d: number = -dot(normal, a0);

  return new CPlane(
    normal[0], normal[1], normal[2], d, color, colorName, center
  );
}
