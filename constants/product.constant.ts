import { IProduct } from "@/interfaces/product.interface";
import { nameToHyphenAndLowercase } from "@/utils/name-to-hyphen-and-lowercase";

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
