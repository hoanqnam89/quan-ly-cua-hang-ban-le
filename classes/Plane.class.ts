import { CColor } from "./Color.class";

export class CPlane {
  private a: number = 0;
  private b: number = 0;
  private c: number = 0;
  private d: number = 0;
  private color: CColor = new CColor();
  private colorName: string = ``;
  private center: number = 0;

  public constructor(
    a: number = 0, 
    b: number = 0, 
    c: number = 0, 
    d: number = 0, 
    color: CColor = new CColor(), 
    colorName: string = ``, 
    center: number = 0, 
  ) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.color = color;
    this.colorName = colorName;
    this.center = center;
  }

  public getA = (): number => this.a;
  public getB = (): number => this.b;
  public getC = (): number => this.c;
  public getD = (): number => this.d;
  public getColor = (): CColor => this.color;
  public getColorName = (): string => this.colorName;
  public getCenter = (): number => this.center;

  public setA = (a: number): void => { this.a = a; }
  public setB = (b: number): void => { this.b = b; }
  public setC = (c: number): void => { this.c = c; }
  public setD = (d: number): void => { this.d = d; }
  public setColor = (color: CColor): void => { this.color = color; }
  public setColorName = (colorName: string): void => { 
    this.colorName = colorName;
  }
  public setCenter = (center: number): void => { this.center = center; }
}
