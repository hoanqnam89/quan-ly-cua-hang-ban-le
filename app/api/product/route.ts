import { ROOT } from "@/constants/root.constant";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IBusiness } from "@/interfaces/business.interface";
import { IProduct } from "@/interfaces/product.interface";
import { ProductModel } from "@/models";
import { BusinessModel } from "@/models/Business";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { print } from "@/utils/print";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type collectionType = IProduct;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT;
const collectionModel = ProductModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow );

  // const cookieStore: ReadonlyRequestCookies = await cookies();
  // const isUserAdmin = await isAdmin(
  //   cookieStore, 
  //   ERoleAction.CREATE, 
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

    if ( !isValidObjectId(product.supplier_id) )
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ID '${product.supplier_id}' is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.ACCOUNT} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundBusiness: IBusiness | null = 
      await BusinessModel.findById(product.supplier_id);

    if (!foundBusiness) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${ECollectionNames.ACCOUNT} with the ID '${product.supplier_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.ACCOUNT} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    const newProduct = new collectionModel({
      created_at: new Date(), 
      updated_at: new Date(), 
      supplier_id: product.supplier_id,
      name: product.name,
      description: product.description,
      image_links: product.image_links,
      input_price: product.input_price, 
      output_price: product.output_price, 
    });

    const savedProduct: collectionType = await newProduct.save();

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
