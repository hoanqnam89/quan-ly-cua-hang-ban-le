import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { RubikColorSetModel } from "@/models";
import { IRubikColor, IRubikColorSet } from "@/interfaces/rubik-color-set.interface";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRubikColorSet;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_COLOR_SET;
const collectionModel = RubikColorSetModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow );

  const rubikColorSet: collectionType = await req.json();

  try {
    connectToDatabase();

    const savedRubikColorSet = await collectionModel.create({
      name: rubikColorSet.name, 
      colors: rubikColorSet.colors.map((color: IRubikColor) => ({
        key: color.key, 
        hex: color.hex, 
      })), 
    });

    if (!savedRubikColorSet)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          ``,
          path, 
          `Please contact for more information.`, 
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(savedRubikColorSet, { status: EStatusCode.CREATED });
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
