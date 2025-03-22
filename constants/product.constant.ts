import { IProduct } from "@/interfaces/product.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_PROCDUCT: IProduct = {
  _id: createId(`Product`),
  created_at: new Date(),
  updated_at: new Date(),

  supplier_id: createId(`Supplier`),
  name: `Coca Cola 390ml`,
  description: `Nước ngọt giải khát`,
  image_links: [],
  input_price: 1000,
  output_price: 2000,
  input_quantity: 0,
  output_quantity: 0
}
