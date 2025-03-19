import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { deleteCollectionByIdApi, getCollectionByIdApi } from "@/utils/api-helper";
import { IQueryString } from "../../interfaces/query-string.interface";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IRubikCase } from "@/interfaces/rubik-case.interface";
import { RubikCaseModel } from "@/models/RubikCase";
import { connectToDatabase } from "@/utils/database";
import { isValidObjectId } from "mongoose";
import { createErrorMessage } from "@/utils/create-error-message";
import { IRubikAlgorithmSet } from "@/interfaces";
import { RubikAlgorithmSetModel } from "@/models";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRubikCase;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_CASE;
const collectionModel = RubikCaseModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}/[id]`;

export const PATCH = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - PATCH ${collectionName}`, ETerminal.FgMagenta);

  const rubikCase: collectionType = await req.json();

  try {
    connectToDatabase();

   const foundRubikCase: collectionType | null = 
      await collectionModel.findById(rubikCase._id);

    if (!foundRubikCase) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `The ${collectionName} with the ID '${rubikCase._id}' does not exist in our records.`,
          path, 
          `Please check if the ${collectionName} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    if ( !isValidObjectId(rubikCase.rubik_algorithm_set_id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
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
          `Failed to update ${collectionName}.`,
          `The ${ECollectionNames.RUBIK_ALGORITHM_SET} with the ID '${rubikCase.rubik_algorithm_set_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK_ALGORITHM_SET} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    const updatedRubikCase = await collectionModel.findOneAndUpdate(
      { _id: rubikCase._id }, 
      {
        $set: {
          name: rubikCase.name, 
          updated_at: new Date(), 
        }
      }
    );

    if (!updatedRubikCase)
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          ``,
          path, 
          `Please contact for more information.`, 
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(
      updatedRubikCase, 
      { status: EStatusCode.CREATED }
    );
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to update ${collectionName}.`,
        error as string,
        path, 
        `Please contact for more information.`, 
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
