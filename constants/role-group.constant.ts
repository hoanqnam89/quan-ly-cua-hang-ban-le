import { IRoleGroup } from "@/interfaces";
import { createId } from "@/utils/create-id";

export const DEFAULT_ROLE_GROUP: IRoleGroup = {
  _id: createId(`RoleGroup`),
  created_at: new Date(),
  updated_at: new Date(),
  name: `Role Group`,
  role_ids: [], 
}
