import { CFace } from "./Face.class";
import { CPosition } from "./Position.class";

export class CCubie {
  private faces: CFace[] = [];
  private absolutePosition: CPosition = new CPosition();

  public constructor(
    faces: CFace[] = [], 
    absolutePosition: CPosition = new CPosition(), 
  ) {
    this.faces = faces;
    this.absolutePosition = absolutePosition;
  }

  public getFaces = (): CFace[] => this.faces;
  public getAbsolutePosition = (): CPosition => this.absolutePosition;

  public setFaces = (faces: CFace[]): void => { this.faces = faces; }
  public setAbsolutePosition = (absolutePosition: CPosition): void => {
    this.absolutePosition = absolutePosition; 
  }

  public addFace = (face: CFace): void => { this.faces.push(face); }
  public toString = (): number[] => ([] as number[]).concat(
    ...this.faces.map((face: CFace): number[] => face.toString())
  );
}
