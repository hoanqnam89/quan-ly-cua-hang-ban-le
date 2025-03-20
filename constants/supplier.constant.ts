import { ISupplier } from "@/interfaces/supplier.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_SUPPLIER: ISupplier = {
  _id: createId(`Account`),
  created_at: new Date(),
  updated_at: new Date(),

  name: `Coca Cola`,
  address: {
    number: `285`,
    street: `Song Hành Xa Lộ Hà Nội`,
    city: `Ho Chi Minh`,
    ward: `Linh Trung`,
    district: `Thủ Đức`,
    country: `Viet Nam`
  }, 
  email: `cocacola@gmail.com `, 
}
