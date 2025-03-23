import { IOrderForm } from "@/interfaces/order-form.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_ORDER_FORM: IOrderForm = {
  _id: createId(`GoodReceipt`),
  created_at: new Date(),
  updated_at: new Date(),

  products: [], 
}
