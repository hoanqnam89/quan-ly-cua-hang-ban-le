import { ROOT } from "@/constants/root.constant";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IAccount, IRoleGroup } from "@/interfaces";
import { ERoleAction } from "@/interfaces/role.interface";
import { AccountModel, RoleGroupModel } from "@/models";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isAdmin } from "@/utils/is-admin";
import { isIdsExist } from "@/utils/is-ids-exist";
import { isIdsValid } from "@/utils/is-ids-valid";
import { print } from "@/utils/print";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type collectionType = IAccount;
const collectionName: ECollectionNames = ECollectionNames.ACCOUNT;
const collectionModel = AccountModel;
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

  const account: collectionType = await req.json();

  try {
    connectToDatabase();
    
    if ( !isIdsValid(account.role_group_ids) ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ID in role_group_ids is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.ROLE_GROUP} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const isRoleGroupIdsExist: boolean = await isIdsExist<IRoleGroup>(
      account.role_group_ids, RoleGroupModel
    );

    if ( !isRoleGroupIdsExist ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ${ECollectionNames.ROLE_GROUP} in role_group_ids does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.ROLE_GROUP} ID is correct.`, 
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    const newAccount = new collectionModel({
      created_at: new Date(), 
      updated_at: new Date(), 
      username: account.username, 
      password: account.password, 
      role_group_ids: account.role_group_ids, 
    });

    const savedAccount: collectionType = await newAccount.save();

    if (!savedAccount)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          ``,
          path, 
          `Please contact for more information.`, 
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(savedAccount, { status: EStatusCode.CREATED });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to create ${collectionName}.`,
        error as string,
        path, 
        `Please contact for more information.`, 
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
