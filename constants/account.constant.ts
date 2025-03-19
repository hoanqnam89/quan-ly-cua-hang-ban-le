import { IAccount } from "@/interfaces";
import { createId } from "@/utils/create-id";

export const DEFAULT_ACCOUNT: IAccount = {
  _id: createId(`Account`),
  created_at: new Date(),
  updated_at: new Date(),

  username: `LeeTrongjNghiax`,
  password: `12345678`,
  role_group_ids: [], 
}
