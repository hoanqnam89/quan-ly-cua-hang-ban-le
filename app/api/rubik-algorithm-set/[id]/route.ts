import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { deleteCollectionByIdApi, getCollectionByIdApi } from "@/utils/api-helper";
import { IQueryString } from "../../interfaces/query-string.interface";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IRubik, IRubikAlgorithmSet } from "@/interfaces";
import { RubikAlgorithmSetModel, RubikModel } from "@/models";
import { connectToDatabase } from "@/utils/database";
import { isValidObjectId } from "mongoose";
import { createErrorMessage } from "@/utils/create-error-message";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRubikAlgorithmSet;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_ALGORITHM_SET;
const collectionModel = RubikAlgorithmSetModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}/[id]`;

export const PATCH = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - PATCH ${collectionName}`, ETerminal.FgMagenta);

  const rubikAlgorithmSet: collectionType = await req.json();

  try {
    connectToDatabase();

    const foundRubikAlgorithmSet: collectionType | null = 
      await collectionModel.findById(rubikAlgorithmSet._id);

    if (!foundRubikAlgorithmSet) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `The ${collectionName} with the ID '${rubikAlgorithmSet._id}' does not exist in our records.`,
          path, 
          `Please check if the ${collectionName} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    if ( !isValidObjectId(rubikAlgorithmSet.rubik_id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
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
          `Failed to update ${collectionName}.`,
          `The ${ECollectionNames.RUBIK} with the ID '${rubikAlgorithmSet.rubik_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    const updatedRubikAlgorithmSet = await collectionModel.findOneAndUpdate(
      { _id: rubikAlgorithmSet._id }, 
      {
        $set: {
          name: rubikAlgorithmSet.name, 
          updated_at: new Date(), 
        }
      }
    );

    if (!updatedRubikAlgorithmSet)
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
      updatedRubikAlgorithmSet, 
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
