import { IRubikAlgorithmSet } from "@/interfaces/rubik-algorithm-set.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_RUBIK_ALGORITHM_SET: IRubikAlgorithmSet = {
  _id: createId(`RubikAlgorithmSet`), 
  created_at: new Date(), 
  updated_at: new Date(), 

  rubik_id: ``, 
  name: `OLL`, 
  start_state: `010000000002222220000300333330044444444405555000550660006666`, 
  end_state: `011111111102222220000300333330044444444405555000550660006666`, 
}
