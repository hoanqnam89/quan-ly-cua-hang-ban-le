import { EUserGender } from "@/enums/user-gender.enum";
import { IUser } from "@/interfaces";
import { createId } from "@/utils/create-id";

export const DEFAULT_USER: IUser = {
  _id: createId(`User`),
  created_at: new Date(),
  updated_at: new Date(),

  account_id: ``, 
  name: {
    first: `Le`,
    middle: `Trong`, 
    last: `Nghia`
  }, 
  address: {
    number: `45/1`,
    street: `Dinh Bo Linh`,
    city: `Ho Chi Minh`,
    ward: `24`,
    district: `Binh Thanh`,
    country: `Viet Nam`
  }, 
  email: `leetrongjnghiax0938225745@gmail.com `, 
  birthday: new Date(`2002-03-07`), 
  gender: EUserGender.MALE, 
  avatar: ``, 
}
