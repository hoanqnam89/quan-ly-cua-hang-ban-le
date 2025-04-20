import { EUserGender } from "@/enums/user-gender.enum";
import { IUser } from "@/interfaces";

export const DEFAULT_USER: IUser = {
  _id: ``,
  created_at: new Date(),
  updated_at: new Date(),

  account_id: ``,
  name: {
    first: "",
    middle: "",
    last: ""
  },
  address: {
    number: "",
    street: "",
    city: "",
    ward: "",
    district: "",
    country: ""
  },
  email: "",
  birthday: new Date(""),
  gender: EUserGender.MALE,
  avatar: ``,
  position: ""
}
