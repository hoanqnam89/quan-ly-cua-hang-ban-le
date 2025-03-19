import { getDotProductOfPlaneAndVector } from "@/app/home/rubik-simulator/utils/get-dot-product-of-plane-and-vectox";
import { CControl } from "./Control.class";
import { CCubie } from "./Cubie.class";
import { CPlane } from "./Plane.class";
import { CPosition } from "./Position.class";

export class CRubik {
  private cubies: CCubie[] = [];
  private controls: CControl[] = [];
  private stickerGap: number = 0;

  public constructor(
    cubies: CCubie[] = [],
    controls: CControl[] = [],
    stickerGap: number = 0,
  ) {
    this.cubies = cubies;
    this.controls = controls;
    this.stickerGap = stickerGap;
  }

  public getCubies = (): CCubie[] => this.cubies;
  public getControls = (): CControl[] => this.controls;
  public getStickerGap = (): number => this.stickerGap;

  public setCubies = (cubies: CCubie[]): void => { this.cubies = cubies; }
  public setControls = (controls: CControl[]): void => { 
    this.controls = controls; 
  }
  public setStickerGap = (stickerGap: number): void => { 
    this.stickerGap = stickerGap; 
  }

  public addCubie = (cubie: CCubie): void => { this.cubies.push(cubie); }
  public addControl = (control: CControl): void => { 
    this.controls.push(control); 
  }

  public getCubiesInBetweenTwoParallelPlanes = (
    plane1: CPlane = new CPlane(), 
    plane2: CPlane = new CPlane(), 
  ): CCubie[] => {
    const result: CCubie[] = [];

    for (let index = 0; index < this.cubies.length; index++) {
      const distance1: number = getDotProductOfPlaneAndVector(
        this.cubies[index].getAbsolutePosition(), plane1, 
      );
      const distance2: number = getDotProductOfPlaneAndVector(
        this.cubies[index].getAbsolutePosition(), plane2, 
      );
     
      if (Math.sign(distance1) !== Math.sign(distance2))
        result.push(this.cubies[index]);
    }

    return result;
  }

  public rotateFace = (
    axis: CPosition = new CPosition(), 
    angle: number = 0, 
    upperLimit: number = 0, 
    lowerLimit: number = 0, 
  ): void => {
    const cubiesToRotate: CCubie[] = this.getCubiesInBetweenTwoParallelPlanes(
      new CPlane(axis.getX(), axis.getY(), axis.getZ(), upperLimit), 
      new CPlane(axis.getX(), axis.getY(), axis.getZ(), lowerLimit), 
    );
  }
}
