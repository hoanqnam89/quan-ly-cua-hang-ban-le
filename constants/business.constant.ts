import { EBusinessType } from "@/enums/business-type.enum";
import { IBusiness } from "@/interfaces/business.interface";

export const DEFAULT_BUSINESS: IBusiness = {
  _id: ``,
  created_at: new Date(),
  updated_at: new Date(),

  name: ``,
  address: {
    number: ``,
    street: ``,
    city: ``,
    ward: ``,
    district: ``,
    country: ``
  }, 
  email: ``, 
  type: EBusinessType.MANUFACTURER, 
}
