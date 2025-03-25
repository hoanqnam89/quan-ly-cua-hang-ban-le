import { IWarehouseReceipt } from "@/interfaces/warehouse-receipt.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_WAREHOUST_RECEIPT: IWarehouseReceipt = {
  _id: createId(`WarehouseReceipt`),
  supplier_receipt_id: ``, 
  created_at: new Date(),
  updated_at: new Date(),

  product_details: [],
}
