import { IProduct } from "@/interfaces/product.interface";

export const DEFAULT_PROCDUCT: IProduct = {
  _id: ``,
  created_at: new Date(),
  updated_at: new Date(),

  supplier_id: ``,
  name: ``,
  description: ``,
  image_links: [],
  input_price: 0,
  output_price: 0,
  category_id: "",
  code: ""
}
