import { IRubikColorSet } from "@/interfaces/rubik-color-set.interface";
import { IRubik } from "@/interfaces/rubik.interface";

const getSortedRubikMoveSetSwapPositionsArray = (
  rubik: IRubik
): number[] => [...new Set(
  rubik.move_sets.map(move_set => {
    const newSwapPosition = [...new Set(
      move_set.swap_positions.flat()
    )];

    if (move_set.rotate?.position !== undefined)
      newSwapPosition.push(move_set.rotate.position);

    return newSwapPosition;
  }).flat()
)].sort((a, b) => a - b);

export const isRubikMoveSetSwapPositionsCoverAllState = (
  rubik: IRubik
): boolean => 
  getSortedRubikMoveSetSwapPositionsArray(rubik).length === rubik.length;

export const isRubikRotationFlagsOutOfBound = (rubik: IRubik): boolean => 
  rubik.rotation_flags.some(rotation_flag =>
    rotation_flag < 0 || rotation_flag > rubik.length
  );

export const isRubikInitialStateDigitNotFound = (
  rubik: IRubik, rubikColorSet: IRubikColorSet
): boolean => 
  [...rubik.initial_state].some(color_code_key =>
    rubikColorSet.colors.findIndex(colorCode => 
      colorCode.key === color_code_key
    ) === -1
  );

export const isRubikInitialStateValid = (
  rubik: IRubik
): RegExpMatchArray | null => 
  rubik.initial_state.match(/[\d\w]/);
