import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { ETerminal } from "@/enums/terminal.enum";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { ECollectionNames, EStatusCode } from "@/enums";
import { IRubikAlgorithm } from "@/interfaces/rubik-algorithm.interface";
import { RubikAlgorithmModel } from "@/models/RubikAlgorithm";
import { RubikCaseModel } from "@/models/RubikCase";
import { IRubikCase } from "@/interfaces/rubik-case.interface";
import { IUser } from "@/interfaces";
import { UserModel } from "@/models/User";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRubikAlgorithm;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_ALGORITHM;
const collectionModel = RubikAlgorithmModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow );

  const rubikAlgorithm: collectionType = await req.json();

  try {
    connectToDatabase();

    if ( !isValidObjectId(rubikAlgorithm.rubik_case_id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ID '${rubikAlgorithm.rubik_case_id}' is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK_CASE} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundRubikCase: IRubikCase | null = 
      await RubikCaseModel.findById(rubikAlgorithm.rubik_case_id);

    if (!foundRubikCase) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${ECollectionNames.RUBIK_CASE} with the ID '${rubikAlgorithm.rubik_case_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK_CASE} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    if ( !isValidObjectId(rubikAlgorithm.user_add_id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ID '${rubikAlgorithm.user_add_id}' is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.USER} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundUser: IUser | null = 
      await UserModel.findById(rubikAlgorithm.user_add_id);

    if (!foundUser) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${ECollectionNames.USER} with the ID '${rubikAlgorithm.user_add_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.USER} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    const newRubikAlgorithm = new collectionModel({
      rubik_case_id: rubikAlgorithm.rubik_case_id, 
      user_add_id: rubikAlgorithm.user_add_id, 
      created_at: new Date(), 
      updated_at: new Date(), 
      algorithm: rubikAlgorithm.algorithm, 
    });

    const savedRubikAlgorithm: collectionType = 
      await newRubikAlgorithm.save();

    if (!savedRubikAlgorithm)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          ``,
          path, 
          `Please contact for more information.`, 
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(
      savedRubikAlgorithm, 
      { status: EStatusCode.CREATED }
    );
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
