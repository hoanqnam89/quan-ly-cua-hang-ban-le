import { IOrderForm } from "@/interfaces/order-form.interface";

export const DEFAULT_ORDER_FORM: IOrderForm = {
  _id: ``,
  created_at: new Date(),
  updated_at: new Date(),

  products: [], 
}
