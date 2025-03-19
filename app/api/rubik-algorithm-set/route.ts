import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { ETerminal } from "@/enums/terminal.enum";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { ECollectionNames, EStatusCode } from "@/enums";
import { IRubik, IRubikAlgorithmSet} from "@/interfaces";
import { RubikAlgorithmSetModel, RubikModel } from "@/models";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRubikAlgorithmSet;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_ALGORITHM_SET;
const collectionModel = RubikAlgorithmSetModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow );

  const rubikAlgorithmSet: collectionType = await req.json();

  try {
    connectToDatabase();

    if ( !isValidObjectId(rubikAlgorithmSet.rubik_id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ID '${rubikAlgorithmSet.rubik_id}' is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundRubik: IRubik | null = 
      await RubikModel.findById(rubikAlgorithmSet.rubik_id);

    if (!foundRubik) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${ECollectionNames.RUBIK} with the ID '${rubikAlgorithmSet.rubik_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    const newRubikAlgorithmSet = new collectionModel({
      rubik_id: rubikAlgorithmSet.rubik_id, 
      created_at: new Date(), 
      updated_at: new Date(), 
      name: rubikAlgorithmSet.name, 
      start_state: rubikAlgorithmSet.start_state, 
      end_state: rubikAlgorithmSet.end_state, 
    });

    const savedRubikAlgorithmSet: collectionType = 
      await newRubikAlgorithmSet.save();

    if (!savedRubikAlgorithmSet)
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
      savedRubikAlgorithmSet, 
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
