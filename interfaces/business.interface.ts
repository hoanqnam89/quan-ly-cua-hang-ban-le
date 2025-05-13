import { IUserAddress } from "./user-address.interface"

export interface IBusiness {
  _id: string
  created_at: Date
  updated_at: Date

  name: string
  logo?: string
  logo_links?: string[]
  address: IUserAddress
  email: string
  type: string
}
