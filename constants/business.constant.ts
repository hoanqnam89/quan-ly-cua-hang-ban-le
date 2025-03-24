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
    city: `Hồ Chí Minh`,
    ward: `Đa Kao`,
    district: `1`,
    country: `Quận 1`
  }, 
  email: `vinshop@gmail.com`, 
  type: EBusinessType.MANUFACTURER, 
}
