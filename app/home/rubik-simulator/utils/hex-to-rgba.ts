import { CColor } from "@/classes/Color.class";

export const hexaToRgba = (hex: string): CColor => {
  const result: RegExpExecArray | null = 
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2}){0,1}$/i.exec(hex);

  return result ? new CColor(
    parseInt(result[1], 16), 
    parseInt(result[2], 16), 
    parseInt(result[3], 16), 
    parseInt(result[4] ? result[4] : `ff`, 16), 
  ) : new CColor();
}

export const toUnitInterval = (n: number = 0, max: number = 1): number => 
  n / max;
