import { IProduct } from "@/interfaces/product.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_PROCDUCT: IProduct = {
  _id: createId(`Account`),
  created_at: new Date(),
  updated_at: new Date(),

  name: `TEST Product`, 
  description: `TEST description`,
  price: 100000, 
  image_links: [], 
}
