import { ECollectionNames } from "@/enums";
import { IRole } from "@/interfaces";
import { ERoleAction } from "@/interfaces/role.interface";
import { convertToMongoCollectionName } from "@/utils/convert-to-mongo-collection-name";
import { createId } from "@/utils/create-id";

export const DEFAULT_ROLE: IRole = {
  _id: createId(`Role`),
  created_at: new Date(),
  updated_at: new Date(),

  collection_name: convertToMongoCollectionName(
    ECollectionNames.ACCOUNT
  ).toLowerCase(),
  action: ERoleAction.CREATE, 
}
