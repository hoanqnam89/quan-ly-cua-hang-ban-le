import { IAccountPayload } from "@/app/api/interfaces/account-payload.interface";
import { connectToDatabase } from "./database";
import { ERoleAction, IRole } from "@/interfaces/role.interface";
import { ECollectionNames } from "@/enums";
import { IRoleGroup } from "@/interfaces";
import { RoleGroupModel, RoleModel } from "@/models";
import { convertToMongoCollectionName } from "./convert-to-mongo-collection-name";

export const isAuthenticated = async (
  account: IAccountPayload, 
  action: ERoleAction, 
  collectionName: ECollectionNames, 
) => {
  if ( account.username === `admin` )
    return true;

  let result = false;

  try {
    connectToDatabase();

    for (let i = 0; i < account.role_group_ids.length; i++) {
      const foundRoleGroup: IRoleGroup | null = await RoleGroupModel.findById(
        account.role_group_ids[i]
      );

      if ( foundRoleGroup ) {
        for (let j = 0; j < foundRoleGroup.role_ids.length; j++) {
          const foundRole: IRole | null = await RoleModel.findById(
            foundRoleGroup.role_ids[j]
          );

          if (
            foundRole?.action === action && 
            foundRole.collection_name === convertToMongoCollectionName(
              collectionName
            ).toLowerCase() 
          ) {
            result = true;
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error`, error);
  }
  
  return result;
}
