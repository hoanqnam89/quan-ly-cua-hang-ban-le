import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IUser} from "@/interfaces";
import { UserModel } from "@/models/User";
import { isValidObjectId } from "mongoose";
import { ROOT } from "@/constants/root.constant";
import { IQueryString } from "@/app/api/interfaces/query-string.interface";
import { EApiAction } from "@/app/api/enums/api-action.enum";

type collectionType = IUser;
const collectionName: ECollectionNames = ECollectionNames.USER;
const collectionModel = UserModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const GET = async (
  _req: NextRequest, 
  query: IQueryString
): Promise<NextResponse> => {
  print(`${collectionName} API - GET ${collectionName}`, ETerminal.FgGreen);

  const params = await query.params;
  const id = params.id;

  try {
    connectToDatabase();

    if ( !isValidObjectId(id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to ${EApiAction.READ} ${collectionName} by ID ${id}.`,
          `The ID '${id}' is not valid.`,
          path, 
          `Please check if the ${collectionName} ID is valid.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundCollection: collectionType | null = 
      await collectionModel.findOne({ account_id: id });

    if ( !foundCollection )
      return NextResponse.json(
        createErrorMessage(
          `Failed to ${EApiAction.READ} ${collectionName} by ID ${id}.`,
          `The ${collectionName} with the account_id '${id}' does not exist in our records.`,
          path, 
          `Please check if the ${collectionName} account_id ID is correct.`, 
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    return NextResponse.json(foundCollection, { status: EStatusCode.OK });
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
