import { CColor } from "./Color.class";
import { CPosition } from "./Position.class";
import { CVertex } from "./Vertex.class";

export class CFace {
  private vertexes: CVertex[] = [];
  private absolutePosition: CPosition = new CPosition();
  private color: CColor = new CColor();

  public constructor(
    vertexes: CVertex[] = [], 
    absolutePosition: CPosition = new CPosition(), 
    color: CColor = new CColor(), 
  ) {
    this.vertexes = vertexes;
    this.absolutePosition = absolutePosition;
    this.color  = color;
  }

  public getVertexes = (): CVertex[] => this.vertexes;
  public getAbsolutePosition = (): CPosition => this.absolutePosition;
  public getColor = (): CColor => this.color;

  public setVertexes = (vertexes: CVertex[]): void => { 
    this.vertexes = vertexes; 
  }
  public setAbsolutePosition = (absolutePosition: CPosition): void => { 
    this.absolutePosition = absolutePosition; 
  }
  public setColor = (color: CColor): void => { this.color = color; }

  public addVertex = (vertex: CVertex): void => { this.vertexes.push(vertex); }

  public toString = (): number[] => ([] as number[]).concat(
    ...([] as number[]).concat(
      ...this.vertexes.map((vertex: CVertex): number[] => vertex.toString()),
    ),
  );
}
