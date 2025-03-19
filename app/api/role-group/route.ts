import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isIdsExist } from "@/utils/is-ids-exist";
import { isIdsValid } from "@/utils/is-ids-valid";
import { print } from "@/utils/print";
import { NextRequest, NextResponse } from "next/server";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IRole, IRoleGroup } from "@/interfaces";
import { RoleGroupModel, RoleModel } from "@/models";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRoleGroup;
const collectionName: ECollectionNames = ECollectionNames.ROLE_GROUP;
const collectionModel = RoleGroupModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow );

  const roleGroup: collectionType = await req.json();

  try {
    connectToDatabase();

    if ( !isIdsValid(roleGroup.role_ids) ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
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
          `Failed to create ${collectionName}.`,
          `Some of the ${ECollectionNames.ROLE} in role_ids does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.ROLE} ID is correct.`, 
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    const newRoleGroup = new collectionModel({
      created_at: new Date(), 
      updated_at: new Date(), 
      name: roleGroup.name, 
      role_ids: roleGroup.role_ids, 
    });

    const savedRoleGroup: collectionType = await newRoleGroup.save();

    if (!savedRoleGroup)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          ``,
          path,
          `Please contact for more information.`
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(savedRoleGroup, { status: EStatusCode.CREATED });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to create ${collectionName}.`,
        error as string,
        path,
        `Please contact for more information.`
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}

export const GET = async (): Promise<NextResponse> => 
  await getCollectionsApi<collectionType>(
    collectionName, 
    collectionModel, 
    path
  );

export const DELETE = async (): Promise<NextResponse> => 
  await deleteCollectionsApi<collectionType>(
    collectionName, 
    collectionModel, 
    path
  );
