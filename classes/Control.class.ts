import { getDotProductOfPlaneAndVector } from "@/app/home/rubik-simulator/utils/get-dot-product-of-plane-and-vectox";
import { CPosition } from "./Position.class";
import { CPlane } from "./Plane.class";

export class CControl {
  private name: string = ``;
  private axis: CPosition = new CPosition();
  private angle: number = Math.PI / 2;
  private upperLimit: number = 0;
  private lowerLimit: number = 0;
  private index: number = 0;

  public constructor(
    name: string = ``, 
    axis: CPosition = new CPosition(), 
    angle: number = Math.PI / 2, 
    upperLimit: number = 0, 
    lowerLimit: number = 0, 
    index: number = 0, 
  ) {
    this.name = name;
    this.axis = axis;
    this.angle = angle;
    this.upperLimit = upperLimit;
    this.lowerLimit = lowerLimit;
    this.index = index;
  }

  public getName = (): string => this.name;
  public getAxis = (): CPosition => this.axis;
  public getAngle = (): number => this.angle;
  public getUpperLimit = (): number => this.upperLimit;
  public getLowerLimit = (): number => this.lowerLimit;
  public getIndex = (): number => this.index;

  public setName = (name: string): void => { this.name = name; }
  public setAxis = (axis: CPosition): void => { this.axis = axis; }
  public setAngle = (angle: number): void => { this.angle = angle; }
  public setUpperLimit = (upperLimit: number): void => { 
    this.upperLimit = upperLimit;
  }
  public setLowerLimit = (lowerLimit: number): void => { 
    this.lowerLimit = lowerLimit;
  }
  public setIndex = (index: number): void => { this.index = index; }

  public isControlThisVertex = (vertex: CPosition = new CPosition): boolean => {
    const distance1: number = getDotProductOfPlaneAndVector(vertex, new CPlane(
      this.axis.getX(), this.axis.getY(), this.axis.getZ(), this.lowerLimit
    ));
    const distance2: number = getDotProductOfPlaneAndVector(vertex, new CPlane(
      this.axis.getX(), this.axis.getY(), this.axis.getZ(), this.upperLimit
    ));

    return Math.sign(distance1) !== Math.sign(distance2);
  }
}
