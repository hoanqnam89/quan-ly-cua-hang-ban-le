import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { ETerminal } from "@/enums/terminal.enum";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { ECollectionNames, EStatusCode } from "@/enums";
import { IRubikCase } from "@/interfaces/rubik-case.interface";
import { RubikCaseModel } from "@/models/RubikCase";
import { IRubikAlgorithmSet } from "@/interfaces";
import { RubikAlgorithmSetModel } from "@/models";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRubikCase;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_CASE;
const collectionModel = RubikCaseModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow );

  const rubikCase: collectionType = await req.json();

  try {
    connectToDatabase();

    if ( !isValidObjectId(rubikCase.rubik_algorithm_set_id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ID '${rubikCase.rubik_algorithm_set_id}' is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK_ALGORITHM_SET} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundRubikAlgorithmSet: IRubikAlgorithmSet | null = 
      await RubikAlgorithmSetModel.findById(rubikCase.rubik_algorithm_set_id);

    if (!foundRubikAlgorithmSet) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${ECollectionNames.RUBIK_ALGORITHM_SET} with the ID '${rubikCase.rubik_algorithm_set_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK_ALGORITHM_SET} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    const newRubikCase = new collectionModel({
      rubik_algorithm_set_id: rubikCase.rubik_algorithm_set_id,  
      created_at: new Date(), 
      updated_at: new Date(), 
      name: rubikCase.name, 
      state: rubikCase.state, 
    });

    const savedRubikCase: collectionType = await newRubikCase.save();

    if (!savedRubikCase)
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
      savedRubikCase, 
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
