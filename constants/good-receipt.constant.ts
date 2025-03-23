import { IGoodReceipt } from "@/interfaces/good-receipt.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_GOOD_RECEIPT: IGoodReceipt = {
  _id: createId(`GoodReceipt`),
  created_at: new Date(),
  updated_at: new Date(),

  products: [], 
}
