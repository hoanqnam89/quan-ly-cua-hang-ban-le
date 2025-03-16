import { createErrorMessage } from "@/utils/create-error-message";
import { NextRequest, NextResponse } from "next/server";
import { print } from "@/utils/print";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { ROOT } from "@/constants/root.constant";
import { IProduct } from "@/interfaces/product.interface";
import { ProductModel } from "@/models/Product.model";
import { connectToDatabase } from "@/libs/connect-to-database";

type collectionType = IProduct;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT;
const collectionModel = ProductModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow );

  const product: collectionType = await req.json();

  try {
    connectToDatabase();

    const savedProduct = await collectionModel.create({
      name: product.name, 
      description: product.description, 
      price: product.price, 
      images: product.images, 
    });

    if (!savedProduct)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          ``,
          path, 
          `Please contact for more information.`, 
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(savedProduct, { status: EStatusCode.CREATED });
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
