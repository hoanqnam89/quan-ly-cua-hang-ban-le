import { toUnitInterval } from "@/app/home/rubik-simulator/utils/hex-to-rgba";
import { MAX_HEX_COLOR_TO_DECIMAL } from "@/constants/max-hex-color-to-decimal.constants";

export class CColor {
  private r: number = 0;
  private g: number = 0;
  private b: number = 0;
  private a: number = 1;

  public constructor(r = 0, g = 0, b = 0, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public getR = (): number => this.r;
  public getG = (): number => this.g;
  public getB = (): number => this.b;
  public getA = (): number => this.a;

  public setR = (r: number): void => { this.r = r; };
  public setG = (g: number): void => { this.g = g; };
  public setB = (b: number): void => { this.b = b; };
  public setA = (a: number): void => { this.a = a; };

  public getColors = (): number[] => [this.r, this.g, this.b, this.a];
  public getColorsAsUnitInterval = (): number[] => [
    toUnitInterval(this.r, MAX_HEX_COLOR_TO_DECIMAL), 
    toUnitInterval(this.g, MAX_HEX_COLOR_TO_DECIMAL), 
    toUnitInterval(this.b, MAX_HEX_COLOR_TO_DECIMAL), 
    toUnitInterval(this.a, MAX_HEX_COLOR_TO_DECIMAL), 
  ]
}
