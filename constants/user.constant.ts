import { EUserGender } from "@/enums/user-gender.enum";
import { IUser } from "@/interfaces";

export const DEFAULT_USER: IUser = {
  _id: ``,
  created_at: new Date(),
  updated_at: new Date(),

  account_id: ``, 
  name: {
    first: `Trần`,
    middle: `Nguyễn Hoàng`, 
    last: `Nam`
  }, 
  address: {
    number: `45/1`,
    street: `Dinh Bo Linh`,
    city: `Ho Chi Minh`,
    ward: `24`,
    district: `Binh Thanh`,
    country: `Viet Nam`
  }, 
  email: `namnguyen@gmail.com `, 
  birthday: new Date(`2002-03-07`), 
  gender: EUserGender.MALE, 
  avatar: ``, 
}
