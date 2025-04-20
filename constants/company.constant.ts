import { EBusinessType } from "@/enums/business-type.enum";
import { IBusiness } from "@/interfaces/business.interface";

export const COMPANY: IBusiness & {
  phone: string, 
  number: string, 
} = {
  _id: "",
  created_at: new Date(),
  updated_at: new Date(), 
  name: ``,
  address: {
    number: "",
    street: "",
    city: "",
    ward: "",
    district: "",
    country: ""
  },
  email: "",
  type: EBusinessType.SUPPLIER, 
  phone: "", 
  number: "", 
}
