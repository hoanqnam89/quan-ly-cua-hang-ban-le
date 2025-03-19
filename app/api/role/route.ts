import { ROOT } from "@/constants/root.constant";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IRole } from "@/interfaces";
import { ERoleAction } from "@/interfaces/role.interface";
import { RoleModel } from "@/models";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isAdmin } from "@/utils/is-admin";
import { print } from "@/utils/print";
import { isExistRolesWithActionAndCollectionName, isRoleActionValid } from "@/utils/role-validation";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type collectionType = IRole;
const collectionName: ECollectionNames = ECollectionNames.ROLE;
const collectionModel = RoleModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow );

  const cookieStore: ReadonlyRequestCookies = await cookies();
  const isUserAdmin = await isAdmin(
    cookieStore, 
    ERoleAction.CREATE, 
    collectionName
  );

  if ( !isUserAdmin )
    return NextResponse.json(
      createErrorMessage(
        `Failed to create ${collectionName}.`,
        `You dont have privilage to do this action.`,
        path, 
        `Please check if the account had privilage to do this action.`, 
      ),
      { status: EStatusCode.UNAUTHORIZED }
    );

  const role: collectionType = await req.json();

  try {
    connectToDatabase();

    if ( !isRoleActionValid(role) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${collectionName} with the action '${role.action}' is not valid.`,
          path,
          `Please check if ${collectionName} action is valid.`, 
        ),
        { status: EStatusCode.CONFLICT }
      );

    const existRoleWithActionAndCollectionName: boolean = 
      await isExistRolesWithActionAndCollectionName(role);

    if ( existRoleWithActionAndCollectionName ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${collectionName} with the collection name '${role.collection_name}' and action '${role.action}' already exist in our records.`,
          path,
          `Please choose different ${collectionName} collection name or action.`, 
        ),
        { status: EStatusCode.CONFLICT }
      );

    const newRole = new collectionModel({
      created_at: new Date(), 
      updated_at: new Date(), 
      collection_name: role.collection_name, 
      action: role.action, 
    });

    const savedRole: collectionType = await newRole.save();

    if ( !savedRole )
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          ``,
          path,
          `Please contact for more information.`
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(savedRole, { status: EStatusCode.CREATED });
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
