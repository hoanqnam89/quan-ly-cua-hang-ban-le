import { IProduct } from "@/interfaces/product.interface";

export const DEFAULT_PROCDUCT: IProduct = {
  _id: ``,
  created_at: new Date(),
  updated_at: new Date(),

  supplier_id: ``,
  name: `Pepsi 390ml`,
  description: `Nước ngọt giải khát`,
  image_links: [],
  input_price: 9000,
  output_price: 10000,
}
