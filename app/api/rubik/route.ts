import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isRubikInitialStateDigitNotFound, isRubikInitialStateValid, isRubikMoveSetSwapPositionsCoverAllState, isRubikRotationFlagsOutOfBound } from "@/utils/rubik-validation";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { RubikColorSetModel, RubikModel} from "@/models";
import { IRubik, IRubikColorSet } from "@/interfaces";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRubik;
const collectionName: ECollectionNames = ECollectionNames.RUBIK;
const collectionModel = RubikModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow );

  try {
    connectToDatabase();

    const rubik: collectionType = await req.json();

    if ( !isValidObjectId(rubik.color_set_id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ID '${rubik.color_set_id}' is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK_COLOR_SET} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundRubikColorSet: IRubikColorSet | null = 
      await RubikColorSetModel.findById(rubik.color_set_id);

    if ( !foundRubikColorSet ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${ECollectionNames.RUBIK_COLOR_SET} with the ID '${rubik.color_set_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.RUBIK_COLOR_SET} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );

    if ( !isRubikInitialStateValid(rubik) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Initial State must contain only numeric characters and wordly characters.`, 
          path,
          `Please check if Initial State contain any non-digit characters or non-word characters.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    if ( isRubikRotationFlagsOutOfBound(rubik) ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Each Rotation Flag must greater than 0 and less than Initial State's length.`, 
          path,
          `Please check if all children in Rotation Flag greater than 0 and less than Initial State's length.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    if ( isRubikInitialStateDigitNotFound(rubik, foundRubikColorSet) ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Each digit in Initial State must appear in one of color code's key.`, 
          path, 
          `Please check if all digit in Initial State appear in any children of color code's key.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    if ( !isRubikMoveSetSwapPositionsCoverAllState(rubik) ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Each digit in each Swap Position array in each Move Set must cover all posible position in Initial State.`, 
          path, 
          `Please check if all position in Initial State appear in any children of Swap Position in any children of Move Set.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const newRubik = new collectionModel({
      created_at: new Date(), 
      updated_at: new Date(), 
      names: rubik.names, 
      number_of_rotation: rubik.number_of_rotation, 
      rotation_flags: rubik.rotation_flags, 
      initial_state: rubik.initial_state, 
      length: rubik.length, 
      color_set_id: rubik.color_set_id, 
      move_sets: rubik.move_sets, 
    });

    const savedRubik: collectionType = await newRubik.save();

    if ( !savedRubik )
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          ``,
          path, 
          `Please contact for more information.`, 
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(savedRubik, { status: EStatusCode.CREATED });
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
  await getCollectionsApi<collectionType>(collectionName, collectionModel, path);

export const DELETE = async (): Promise<NextResponse> => 
  await deleteCollectionsApi<collectionType>(collectionName, collectionModel, path);
