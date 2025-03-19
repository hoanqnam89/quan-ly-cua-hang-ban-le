import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { IQueryString } from "@/app/api/interfaces/query-string.interface";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IRubik, IRubikAlgorithmSet } from "@/interfaces";
import { RubikAlgorithmSetModel, RubikModel } from "@/models";
import { ROOT } from "@/constants/root.constant";

const path: string = `${ROOT}/${ECollectionNames.RUBIK.toLowerCase()}/[id]/rubik-algorithm-sets`;

export const GET = async (
  req: NextRequest, query: IQueryString
): Promise<NextResponse> => {
  print(`${ECollectionNames.RUBIK} API - GET ${ECollectionNames.RUBIK_ALGORITHM_SET} by ${ECollectionNames.RUBIK} ID`, 
    ETerminal.FgGreen, 
  );

  const params = await query.params;
  const rubikId = params.id;

  try {
    connectToDatabase();

    if ( !isValidObjectId(rubikId) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to get ${ECollectionNames.RUBIK_ALGORITHM_SET} by ${ECollectionNames.RUBIK} ID ${rubikId}.`,
          `The ID '${rubikId}' is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundRubik: IRubik | null = await RubikModel.findById(rubikId);

    if (!foundRubik)
      return NextResponse.json(
        createErrorMessage(
          `Failed to get ${ECollectionNames.RUBIK_ALGORITHM_SET} by ${ECollectionNames.RUBIK} ID ${rubikId}.`,
          `The ${ECollectionNames.RUBIK} with the ID '${rubikId}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK} ID is correct.`, 
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    const foundRubikAlgorithmSets: IRubikAlgorithmSet[] = 
      await RubikAlgorithmSetModel.find({rubik_id: rubikId});

    return NextResponse.json(
      foundRubikAlgorithmSets, 
      { status: EStatusCode.OK }
    );
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to get ${ECollectionNames.RUBIK_ALGORITHM_SET} by ${ECollectionNames.RUBIK} ID ${rubikId}.`,
        error as string,
        path, 
        `Please contact for more information.`, 
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
