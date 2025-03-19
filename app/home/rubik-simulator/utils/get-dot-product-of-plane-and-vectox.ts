import { CPlane } from "@/classes/Plane.class";
import { CPosition } from "@/classes/Position.class";
import { dot } from "./matrix-functions";

export const getDotProductOfPlaneAndVector = (
  point: CPosition = new CPosition(), 
  plane: CPlane = new CPlane(), 
): number => {
  const newPoint: Float32Array<ArrayBuffer> = new Float32Array(3);

  newPoint[0] = point.getX();
  newPoint[1] = point.getY();
  newPoint[2] = point.getZ();

  const newPlane: Float32Array<ArrayBuffer> = new Float32Array(3);

  newPlane[0] = plane.getA();
  newPlane[1] = plane.getB();
  newPlane[2] = plane.getC();

  return dot(newPoint, newPlane) + plane.getD();
}
