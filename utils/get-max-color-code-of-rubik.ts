import { IRubikColor, IRubikColorSet } from "@/interfaces/rubik-color-set.interface";

export const getMaxColorCodeOfRubik = (
  rubikColorSet: IRubikColorSet
) => 
  rubikColorSet.colors.reduce(
    (previousColor: IRubikColor, currentColor: IRubikColor): IRubikColor => 
    (previousColor && previousColor.key > currentColor.key) 
      ? previousColor 
      : currentColor
  ).key;
