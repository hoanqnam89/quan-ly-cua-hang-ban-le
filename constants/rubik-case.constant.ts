import { IRubikCase } from "@/interfaces/rubik-case.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_RUBIK_CASE: IRubikCase = {
  _id: createId(`RubikColorSet`), 
  created_at: new Date(), 
  updated_at: new Date(), 

  rubik_algorithm_set_id: ``, 
  name: `OLL 1`, 
  state: `_100000000_555555010_611666661_444444444_222201022_331113333`, 
}
