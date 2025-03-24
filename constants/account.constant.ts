import { IAccount } from "@/interfaces";

export const DEFAULT_ACCOUNT: IAccount = {
  _id: ``,
  created_at: new Date(),
  updated_at: new Date(),

  username: `admin`,
  password: `admin`,
  is_admin: true,
}
