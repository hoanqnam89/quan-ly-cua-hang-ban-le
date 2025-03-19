export class CPosition {
  private x: number = 0;
  private y: number = 0;
  private z: number = 0;

  public constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public getX = (): number => this.x;
  public getY = (): number => this.y;
  public getZ = (): number => this.z;

  public setX = (x: number): void => { this.x = x; }
  public setY = (y: number): void => { this.y = y; }
  public setZ = (z: number): void => { this.z = z; }

  public getPositions = (): number[] => [this.x, this.y, this.z];
}
