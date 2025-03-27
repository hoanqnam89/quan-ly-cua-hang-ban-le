import { EBusinessType } from "@/enums/business-type.enum";
import { IBusiness } from "@/interfaces/business.interface";

export const COMPANY: IBusiness & {
  phone: string, 
  number: string, 
} = {
  _id: "",
  created_at: new Date(),
  updated_at: new Date(), 
  name: `Brotherhoods`,
  address: {
    number: "38",
    street: "Phan Xích Long",
    city: "Hồ Chí Minh",
    ward: "1",
    district: "Gò Vấp",
    country: "Việt Nam"
  },
  email: "hoangnam@gmail.com",
  type: EBusinessType.SUPPLIER, 
  phone: `0932659945`, 
  number: `95764956704`, 
}
