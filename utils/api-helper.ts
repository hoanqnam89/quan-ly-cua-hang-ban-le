import { DeleteResult, isValidObjectId, Model } from "mongoose";
import { print } from "@/utils/print";
import { NextResponse } from "next/server";
import { createErrorMessage } from "./create-error-message";
import { ECollectionNames } from "@/enums/collection-names.enum";
import { EStatusCode } from "@/enums/status-code.enum";
import { ETerminal } from "@/enums/terminal.enum";
// import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
// import { cookies } from "next/headers";
// import { isAdmin } from "./is-admin";
import { EApiAction } from "@/enums/api-action.enum";
import { connectToDatabase } from "@/libs/connect-to-database";
import { CONTACT_INFORMATION } from "@/constants/contact-information.constant";
import { IQueryString } from "@/interfaces/query-string.interface";

const getCollections = async <T>(model: Model<T>): Promise<NextResponse> => {
  const collections: T[] = await model.find({});

  return NextResponse.json(collections, { status: EStatusCode.OK });
}

const deleteCollections = async <T>(model: Model<T>): Promise<NextResponse> => {
  const deleteCollectionsResult: DeleteResult = await model.deleteMany();

  if (deleteCollectionsResult.deletedCount === 0)
    return NextResponse.json(null, { status: EStatusCode.OK });

  return NextResponse.json([], { status: EStatusCode.OK });
}

const getCollectionById = async <T>(
  id: string, 
  model: Model<T>, 
  collectionName: ECollectionNames, 
  path: string, 
): Promise<NextResponse> => {
  if ( !isValidObjectId(id) )
    return NextResponse.json(
      createErrorMessage(
        `Failed to ${EApiAction.READ} ${collectionName} by ID ${id}.`,
        `The ID '${id}' is not valid.`,
        path, 
        `Please check if the ${collectionName} ID is valid.`, 
      ),
      { status: EStatusCode.UNPROCESSABLE_ENTITY }
    );

  const foundCollection: T | null = await model.findById(id);

  if ( !foundCollection )
    return NextResponse.json(
      createErrorMessage(
        `Failed to ${EApiAction.READ} ${collectionName} by ID ${id}.`,
        `The ${collectionName} with the ID '${id}' does not exist in our records.`,
        path, 
        `Please check if the ${collectionName} ID is correct.`, 
      ),
      { status: EStatusCode.NOT_FOUND }
    );

  return NextResponse.json(foundCollection, { status: EStatusCode.OK });
}

const deleteCollectionById = async <T>(
  id: string, 
  model: Model<T>, 
  collectionName: ECollectionNames, 
  path: string, 
): Promise<NextResponse> => {
  if ( !isValidObjectId(id) )
    return NextResponse.json(
      createErrorMessage(
        `Failed to ${EApiAction.DELETE} ${collectionName} by ID ${id}.`,
        `The ID '${id}' is not valid.`,
        path, 
        `Please check if the ${collectionName} ID is valid.`, 
      ),
      { status: EStatusCode.UNPROCESSABLE_ENTITY }
    );

  const foundCollection: T | null = await model.findById(id);

  if ( !foundCollection )
    return NextResponse.json(
      createErrorMessage(
        `Failed to ${EApiAction.DELETE} ${collectionName} by ID ${id}.`,
        `The ${collectionName} with the ID '${id}' does not exist in our records.`,
        path, 
        `Please check if the ${collectionName} ID is correct.`, 
      ),
      { status: EStatusCode.NOT_FOUND }
    );

  const deleteCollectionResult: DeleteResult | null = 
    await model.findByIdAndDelete(id);

  if (!deleteCollectionResult)
    return NextResponse.json(null, { status: EStatusCode.OK });

  return NextResponse.json(deleteCollectionResult, { status: EStatusCode.OK });
}

const getCollectionsApi = async <T>(
  collectionName: ECollectionNames, 
  model: Model<T>, 
  path: string, 
): Promise<NextResponse> => {
  print(`${collectionName} API - GET ${collectionName}s`, ETerminal.FgGreen);

  // const cookieStore: ReadonlyRequestCookies = await cookies();
  // const isUserAdmin = await isAdmin(
  //   cookieStore, 
  //   ERoleAction.READ, 
  //   collectionName, 
  // );

  // if ( !isUserAdmin )
  //   return NextResponse.json(
  //     createErrorMessage(
  //       `Failed to ${EApiAction.READ} ${collectionName}.`,
  //       `You dont have privilage to do this action.`,
  //       path, 
  //       `Please check if the account had privilage to do this action.`, 
  //     ),
  //     { status: EStatusCode.UNAUTHORIZED }
  //   );

  try {
    connectToDatabase();

    return await getCollections<T>(model);
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to ${EApiAction.READ} ${collectionName}s.`,
        error as string,
        path, 
        CONTACT_INFORMATION, 
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}

const deleteCollectionsApi = async <T>(
  collectionName: ECollectionNames, 
  model: Model<T>, 
  path: string, 
): Promise<NextResponse> => {
  print(`${collectionName} API - DELETE ${collectionName}s`, ETerminal.FgRed);

  // const cookieStore: ReadonlyRequestCookies = await cookies();
  // const isUserAdmin = await isAdmin(
  //   cookieStore, 
  //   ERoleAction.DELETE, 
  //   collectionName
  // );

  // if ( !isUserAdmin )
  //   return NextResponse.json(
  //     createErrorMessage(
  //       `Failed to ${EApiAction.DELETE} ${collectionName}.`,
  //       `You dont have privilage to do this action.`,
  //       path, 
  //       `Please check if the account had privilage to do this action.`, 
  //     ),
  //     { status: EStatusCode.UNAUTHORIZED }
  //   );

  try {
    connectToDatabase();

    return await deleteCollections<T>(model);
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to ${EApiAction.DELETE} ${collectionName}s.`,
        error as string,
        path, 
        CONTACT_INFORMATION, 
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}

const getCollectionByIdApi = async <T>(
  model: Model<T>, 
  collectionName: ECollectionNames, 
  path: string, 
  query: IQueryString, 
): Promise<NextResponse> => {
  print(`${collectionName} API - GET ${collectionName} by ID`, 
    ETerminal.FgGreen, 
  );

  // const cookieStore: ReadonlyRequestCookies = await cookies();
  // const isUserAdmin = await isAdmin(
  //   cookieStore, 
  //   ERoleAction.CREATE, 
  //   collectionName
  // );
  // if ( !isUserAdmin )
  //   return NextResponse.json(
  //     createErrorMessage(
  //       `Failed to ${EApiAction.READ} ${collectionName}.`,
  //       `You dont have privilage to do this action.`,
  //       path, 
  //       `Please check if the account had privilage to do this action.`, 
  //     ),
  //     { status: EStatusCode.UNAUTHORIZED }
  //   );

  const params = await query.params;
  const id = params.id;

  try {
    connectToDatabase();

    return await getCollectionById<T>(id, model, collectionName, path);
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to ${EApiAction.READ} ${collectionName} by ID ${id}.`,
        error as string,
        path, 
        CONTACT_INFORMATION, 
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}

const deleteCollectionByIdApi = async <T>(
  model: Model<T>, 
  collectionName: ECollectionNames, 
  path: string, 
  query: IQueryString, 
): Promise<NextResponse> => {
  print(`${collectionName} API - DELETE ${collectionName} by ID`, 
    ETerminal.FgRed, 
  );

  // const cookieStore: ReadonlyRequestCookies = await cookies();
  // const isUserAdmin = await isAdmin(
  //   cookieStore, 
  //   ERoleAction.DELETE, 
  //   collectionName, 
  // );

  // if ( !isUserAdmin )
  //   return NextResponse.json(
  //     createErrorMessage(
  //       `Failed to ${EApiAction.DELETE} ${collectionName}.`,
  //       `You dont have privilage to do this action.`,
  //       path, 
  //       `Please check if the account had privilage to do this action.`, 
  //     ),
  //     { status: EStatusCode.UNAUTHORIZED }
  //   );

  const params = await query.params;
  const id = params.id;

  try {
    connectToDatabase();

    return await deleteCollectionById<T>(id, model, collectionName, path);
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to ${EApiAction.DELETE} ${collectionName} by ID ${id}.`,
        error as string,
        path, 
        CONTACT_INFORMATION, 
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}

export {
  getCollections, 
  deleteCollections, 
  getCollectionById, 
  deleteCollectionById, 
  getCollectionsApi, 
  deleteCollectionsApi, 
  getCollectionByIdApi, 
  deleteCollectionByIdApi, 
}
