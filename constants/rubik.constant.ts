import { IRubik } from "@/interfaces/rubik.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_RUBIK: IRubik = {
  _id: createId(`Rubik`), 
  created_at: new Date(), 
  updated_at: new Date(), 

  names: [`Rubik's Cube`], 
  number_of_rotation: 4, 
  rotation_flags: [0, 10, 20, 30, 40, 50], 
  initial_state: `011111111102222222220333333333044444444405555555550666666666`, 
  length: 60, 
  color_set_id: ``, 
  move_sets: [
    {
      name: "U",
      swap_positions: [
        [8, 6, 4, 2], 
        [9, 7, 5, 3], 
        [29, 45, 53, 17], 
        [22, 46, 54, 18], 
        [23, 47, 55, 19], 
      ], 
      rotate: {
        position: 0,
        turn: 1,
      },
    }, 
    {
      name: "F",
      swap_positions: [
        [18, 16, 14, 12], 
        [19, 17, 15, 13], 
        [9, 55, 33, 27], 
        [2, 56, 34, 28], 
        [3, 57, 35, 29], 
      ], 
      rotate: {
        position: 10,
        turn: 1,
      },
    }, 
    {
      name: "R",
      swap_positions: [
        [28, 26, 24, 22], 
        [29, 27, 25, 23], 
        [19, 35, 43, 7], 
        [12, 36, 44, 8], 
        [13, 37, 45, 9], 
      ], 
      rotate: {
        position: 20,
        turn: 1,
      },
    }, 
    {
      name: "D",
      swap_positions: [
        [38, 36, 34, 32], 
        [39, 37, 35, 33], 
        [49, 25, 13, 57], 
        [42, 26, 14, 58], 
        [43, 27, 15, 59], 
      ], 
      rotate: {
        position: 30,
        turn: 1,
      },
    }, 
    {
      name: "B",
      swap_positions: [
        [48, 46, 44, 42], 
        [49, 47, 45, 43], 
        [59, 5, 23, 37], 
        [52, 6, 24, 38], 
        [53, 7, 25, 39], 
      ], 
      rotate: {
        position: 40,
        turn: 1,
      },
    }, 
    {
      name: "L",
      swap_positions: [
        [58, 56, 54, 52], 
        [59, 57, 55, 53], 
        [39, 15, 3, 47], 
        [32, 16, 4, 48], 
        [33, 17, 5, 49], 
      ], 
      rotate: {
        position: 50,
        turn: 1,
      },
    }, 
    {
      name: "M",
      swap_positions: [
        [1, 41, 31, 11], 
        [2, 46, 38, 14], 
        [6, 42, 34, 18], 
      ], 
    }, 
    {
      name: "E",
      swap_positions: [
        [11, 51, 41, 21], 
        [12, 56, 48, 24], 
        [16, 52, 44, 28], 
      ], 
    }, 
    {
      name: "S",
      swap_positions: [
        [1, 51, 31, 21], 
        [4, 58, 36, 22], 
        [8, 54, 32, 26], 
      ], 
    }, 
  ]
}
