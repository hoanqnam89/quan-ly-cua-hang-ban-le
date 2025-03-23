import { IProductDetail } from "@/interfaces/product-detail.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_PROCDUCT_DETAIL: IProductDetail = {
  _id: createId(`ProductDetail`),
  created_at: new Date(),
  updated_at: new Date(),

  product_id: createId(`Product`),
  input_price: 1000,
  output_price: 2000,
  input_quantity: 0,
  output_quantity: 0,
  date_of_manufacture: new Date(),
  expiry_date: new Date(), 
}
