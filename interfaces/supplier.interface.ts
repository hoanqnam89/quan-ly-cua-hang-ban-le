import { IUserAddress } from "./user-address.interface"

export interface ISupplier {
  _id: string
  created_at: Date
  updated_at: Date

  name: string
  logo?: string, 
  address: IUserAddress
  email: string
}
