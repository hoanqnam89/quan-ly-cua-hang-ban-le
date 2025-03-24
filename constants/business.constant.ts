import { EBusinessType } from "@/enums/business-type.enum";
import { IBusiness } from "@/interfaces/business.interface";

export const DEFAULT_BUSINESS: IBusiness = {
  _id: ``,
  created_at: new Date(),
  updated_at: new Date(),

  name: `Vinshop`,
  address: {
    number: `28`,
    street: `Bis Mạc Đĩnh Chi`,
    city: `Ho Chi Minh`,
    ward: `Đa Kao`,
    district: `1`,
    country: `Viet Nam`
  }, 
  email: `vinshop@gmail.com`, 
  type: EBusinessType.MANUFACTURER, 
}
