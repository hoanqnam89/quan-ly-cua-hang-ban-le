import { COOKIE_NAME } from "@/constants";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { decrypt } from "./decrypt";
import { ECollectionNames } from "@/enums";
import { ERoleAction, IRole } from "@/interfaces/role.interface";
import { RoleGroupModel, RoleModel } from "@/models";
import { JWTPayload } from "jose";
import { connectToDatabase } from "./database";
import { IRoleGroup } from "@/interfaces";
import { convertToMongoCollectionName } from "./convert-to-mongo-collection-name";

declare module 'jose' {
  export interface JWTPayload {
    username: string, 
    role_group_ids: string[], 
  }
}

export const isAdmin = async (
  cookieStore: ReadonlyRequestCookies, 
  action: ERoleAction, 
  collectionName: ECollectionNames, 
): Promise<boolean> => {
  const token: RequestCookie | undefined = cookieStore.get(COOKIE_NAME);

  if ( !token )
    return false;

  const { value } = token;
  const payload: JWTPayload | undefined = await decrypt(value);

  if ( !payload )
    return false;

  const account: JWTPayload = {...payload};

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
