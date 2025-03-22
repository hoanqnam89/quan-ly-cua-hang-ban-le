import { NextRequest, NextResponse } from "next/server";
import { deleteCollectionByIdApi, getCollectionByIdApi } from "@/utils/api-helper";
import { IQueryString } from "../../interfaces/query-string.interface";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { print } from "@/utils/print";
import { connectToDatabase } from "@/utils/database";
import { createErrorMessage } from "@/utils/create-error-message";
import { ROOT } from "@/constants/root.constant";
import { IProduct } from "@/interfaces/product.interface";
import { ProductModel } from "@/models/Product";

type collectionType = IProduct;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT;
const collectionModel = ProductModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}/[id]`;

export const PATCH = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - PATCH ${collectionName}`, ETerminal.FgMagenta);

  // const cookieStore: ReadonlyRequestCookies = await cookies();
  // const isUserAdmin = await isAdmin(
  //   cookieStore, 
  //   ERoleAction.UPDATE, 
  //   collectionName
  // );

  // if ( !isUserAdmin )
  //   return NextResponse.json(
  //     createErrorMessage(
  //       `Failed to create ${collectionName}.`,
  //       `You dont have privilage to do this action.`,
  //       path, 
  //       `Please check if the account had privilage to do this action.`, 
  //     ),
  //     { status: EStatusCode.UNAUTHORIZED }
  //   );

  const product: collectionType = await req.json();

  try {
    connectToDatabase();

    const foundProduct: collectionType | null = 
      await collectionModel.findById(product._id);

    if (!foundProduct) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `The ${collectionName} with the ID '${product._id}' does not exist in our records.`,
          path, 
          `Please check if the ${collectionName} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    const updatedProduct = await collectionModel.findOneAndUpdate(
      { _id: product._id }, 
      {
        $set: {
          name: product.name,
          description: product.description,
          input_price: product.input_price,
          output_price: product.output_price,
          input_quantity: product.input_quantity, 
          output_quantity: product.output_quantity, 
          updated_at: new Date(), 
        }
      }
    );

    if (!updatedProduct)
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          ``,
          path, 
          `Please contact for more information.`, 
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(updatedProduct, { status: EStatusCode.CREATED });
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
