import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { deleteCollectionByIdApi, getCollectionByIdApi } from "@/utils/api-helper";
import { IQueryString } from "../../interfaces/query-string.interface";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { connectToDatabase } from "@/utils/database";
import { isValidObjectId } from "mongoose";
import { createErrorMessage } from "@/utils/create-error-message";
import { IUser } from "@/interfaces";
import { IRubikAlgorithm } from "@/interfaces/rubik-algorithm.interface";
import { RubikAlgorithmModel } from "@/models/RubikAlgorithm";
import { IRubikCase } from "@/interfaces/rubik-case.interface";
import { RubikCaseModel } from "@/models/RubikCase";
import { UserModel } from "@/models/User";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRubikAlgorithm;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_ALGORITHM;
const collectionModel = RubikAlgorithmModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}/[id]`;

export const PATCH = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - PATCH ${collectionName}`, ETerminal.FgMagenta);

  const rubikAlgorithm: collectionType = await req.json();

  try {
    connectToDatabase();

    const foundRubikAlgorithm: collectionType | null = 
      await collectionModel.findById(rubikAlgorithm._id);

    if (!foundRubikAlgorithm) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `The ${collectionName} with the ID '${rubikAlgorithm._id}' does not exist in our records.`,
          path, 
          `Please check if the ${collectionName} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    if ( !isValidObjectId(rubikAlgorithm.rubik_case_id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
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
          `Failed to update ${collectionName}.`,
          `The ${ECollectionNames.RUBIK_CASE} with the ID '${rubikAlgorithm.rubik_case_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK_CASE} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    if ( !isValidObjectId(rubikAlgorithm.user_add_id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
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
          `Failed to update ${collectionName}.`,
          `The ${ECollectionNames.USER} with the ID '${rubikAlgorithm.user_add_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.USER} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    const updatedRubikAlgorithm = await collectionModel.findOneAndUpdate(
      { _id: rubikAlgorithm._id }, 
      {
        $set: {
          updated_at: new Date(), 
          algorithm: rubikAlgorithm.algorithm, 
        }
      }
    );

    if (!updatedRubikAlgorithm)
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
      updatedRubikAlgorithm, 
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
