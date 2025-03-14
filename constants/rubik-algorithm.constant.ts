import { IRubikAlgorithm } from "@/interfaces/rubik-algorithm.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_RUBIK_ALGORITHM: IRubikAlgorithm = {
  _id: createId(`RubikColorSet`),
  created_at: new Date(),
  updated_at: new Date(),

  rubik_case_id: ``,
  user_add_id: ``,
  algorithm: `F R U R' U' F'`, 
}
