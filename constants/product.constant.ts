import { IProduct } from "@/interfaces/product.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_PRODUCT: IProduct = {
  _id: createId(`Product`),
  created_at: new Date(),
  updated_at: new Date(),

  name: `TEST Product`, 
  description: `TEST description`, 
  price: 100000, 
  images: [], 
}
