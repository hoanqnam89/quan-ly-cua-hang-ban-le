import { IRubikColorSet } from "@/interfaces/rubik-color-set.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_RUBIK_COLOR_SET: IRubikColorSet = {
  _id: createId(`RubikColorSet`), 
  created_at: new Date(), 
  updated_at: new Date(), 

  name: `6 colors`, 
  colors: [
    { key: `0`, hex: `#121212` },
    { key: `1`, hex: `#ffffff` },
    { key: `2`, hex: `#00ff00` },
    { key: `3`, hex: `#ff0000` },
    { key: `4`, hex: `#ffff00` },
    { key: `5`, hex: `#0000ff` },
    { key: `6`, hex: `#ffa500` },
  ], 
}
