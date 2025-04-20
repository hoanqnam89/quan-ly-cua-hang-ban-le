import { IProduct } from "@/interfaces/product.interface";
import { nameToHyphenAndLowercase } from "@/utils/name-to-hyphen-and-lowercase";

export const DEFAULT_PROCDUCT: IProduct = {
  _id: ``,
  created_at: new Date(),
  updated_at: new Date(),

  code: `pepsi-390ml-${Date.now()}`,
  business_id: ``,
  supplier_name: ``,
  name: `Pepsi 390ml`,
  description: `Nước ngọt giải khát`,
  image_links: [],
  input_price: 9000,
  output_price: 10000,
}
