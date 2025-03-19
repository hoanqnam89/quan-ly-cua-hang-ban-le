import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { deleteCollectionByIdApi, getCollectionByIdApi } from "@/utils/api-helper";
import { IQueryString } from "../../interfaces/query-string.interface";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IRole, IRoleGroup } from "@/interfaces";
import { RoleGroupModel, RoleModel } from "@/models";
import { connectToDatabase } from "@/utils/database";
import { isIdsValid } from "@/utils/is-ids-valid";
import { createErrorMessage } from "@/utils/create-error-message";
import { isIdsExist } from "@/utils/is-ids-exist";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRoleGroup;
const collectionName: ECollectionNames = ECollectionNames.ROLE_GROUP;
const collectionModel = RoleGroupModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}/[id]`;

export const PATCH = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - PATCH ${collectionName}`, ETerminal.FgMagenta);

  const roleGroup: collectionType = await req.json();

  try {
    connectToDatabase();

    const foundRoleGroup: collectionType | null = 
      await collectionModel.findById(roleGroup._id);

    if (!foundRoleGroup) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `The ${collectionName} with the ID '${roleGroup._id}' does not exist in our records.`,
          path, 
          `Please check if the ${collectionName} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    if ( !isIdsValid(roleGroup.role_ids) ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `Some of the ID in role_ids is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.ROLE} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const isRoleIdsExist: boolean = 
      await isIdsExist<IRole>(roleGroup.role_ids, RoleModel);

    if ( !isRoleIdsExist ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `Some of the ${ECollectionNames.ROLE} in role_ids does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.ROLE} ID is correct.`, 
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    const updatedRoleGroup = await collectionModel.findOneAndUpdate(
      { _id: roleGroup._id }, 
      {
        $set: {
          name: roleGroup.name, 
          role_ids: roleGroup.role_ids, 
          updated_at: new Date(), 
        }
      }
    );

    if (!updatedRoleGroup)
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          ``,
          path,
          `Please contact for more information.`
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(updatedRoleGroup, { status: EStatusCode.CREATED });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to update ${collectionName}.`,
        error as string,
        path,
        `Please contact for more information.`
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}

export const GET = async (
  _req: NextRequest, query: IQueryString
): Promise<NextResponse> => 
  await getCollectionByIdApi<collectionType>(
    collectionModel, 
    collectionName, 
    path, 
    query
  );

export const DELETE = async (
  _req: NextRequest, query: IQueryString
): Promise<NextResponse> => 
  await deleteCollectionByIdApi<collectionType>(
    collectionModel, 
    collectionName, 
    path, 
    query
  );
