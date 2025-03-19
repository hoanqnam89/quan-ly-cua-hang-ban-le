import { CColor } from "./Color.class";
import { CPosition } from "./Position.class";

export class CVertex {
  private relativePosition: CPosition = new CPosition();
  private color: CColor = new CColor();
  private colorname: string = ``;
  private absolutePosition: CPosition = new CPosition();

  public constructor(
    relativePosition: CPosition = new CPosition(), 
    color: CColor = new CColor(), 
    colorname: string = ``, 
    absolutePosition: CPosition = new CPosition(), 
  ) {
    this.relativePosition = relativePosition;
    this.color = color;
    this.colorname = colorname;
    this.absolutePosition  = absolutePosition;
  }

  public getRelativePosition = (): CPosition => this.relativePosition;
  public getColor = (): CColor => this.color;
  public getColorname = (): string => this.colorname;
  public getAbsolutePosition = (): CPosition => this.absolutePosition;

  public setRelativePosition = (relativePosition: CPosition): void => { 
    this.relativePosition = relativePosition; 
  }
  public setColor = (color: CColor): void => { this.color = color; }
  public setColorname = (colorname: string): void => { 
    this.colorname = colorname; 
  }
  public setAbsolutePosition = (absolutePosition: CPosition): void => { 
    this.absolutePosition = absolutePosition; 
  }

  public toString = (): number[] => [
    ...this.relativePosition.getPositions(), 
    ...this.color.getColors(), 
  ]
}
