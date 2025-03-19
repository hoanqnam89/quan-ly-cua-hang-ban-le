import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { deleteCollectionByIdApi, getCollectionByIdApi } from "@/utils/api-helper";
import { IQueryString } from "../../interfaces/query-string.interface";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IRubikColorSet } from "@/interfaces";
import { RubikColorSetModel } from "@/models";
import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isValidObjectId } from "mongoose";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRubikColorSet;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_COLOR_SET;
const collectionModel = RubikColorSetModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}/[id]`;

export const PATCH = async ( req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - PATCH ${collectionName}`, ETerminal.FgMagenta);

  const rubikColorSet: collectionType = await req.json();

  try {
    connectToDatabase();

   const foundRubikColorSet: collectionType | null = 
      await collectionModel.findById(rubikColorSet._id);

    if (!foundRubikColorSet) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `The ${collectionName} with the ID '${rubikColorSet._id}' does not exist in our records.`,
          path, 
          `Please check if the ${collectionName} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    if ( !isValidObjectId(rubikColorSet._id) ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `The ID '${rubikColorSet._id}' is not valid.`,
          path, 
          `Please check if the ${collectionName} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundCollection = await collectionModel.findById(rubikColorSet._id);

    if ( !foundCollection ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `The ${collectionName} with the ID '${rubikColorSet._id}' does not exist in our records.`,
          path, 
          `Please check if the ${collectionName} ID is correct.`, 
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    const updatedRubikColorSet = await collectionModel.findOneAndUpdate(
      { _id: rubikColorSet._id }, 
      {
        $set: {
          name: rubikColorSet.name, 
          updated_at: new Date(), 
        }
      }
    );

    if (!updatedRubikColorSet)
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          ``,
          path, 
          `Please contact for more information.`, 
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(updatedRubikColorSet, { status: EStatusCode.CREATED });
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
