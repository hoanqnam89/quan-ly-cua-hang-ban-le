import { ROOT } from "@/constants/root.constant";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IOrderForm, IOrderFormProduct } from "@/interfaces/order-form.interface";
import { IProduct } from "@/interfaces/product.interface";
import { ProductModel } from "@/models";
import { OrderFormModel } from "@/models/OrderForm";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isIdsExist } from "@/utils/is-ids-exist";
import { isIdsValid } from "@/utils/is-ids-valid";
import { print } from "@/utils/print";
import { NextRequest, NextResponse } from "next/server";

type collectionType = IOrderForm;
const collectionName: ECollectionNames = ECollectionNames.ORDER_FORM;
const collectionModel = OrderFormModel;
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

  const orderForm: collectionType = await req.json();

  try {
    connectToDatabase();

    const orderFormProductIds: string[] = 
      orderForm.products.map(
        (orderFormProduct: IOrderFormProduct) => orderFormProduct._id
      );

    if ( !isIdsValid(orderFormProductIds) ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ID in good receipt products is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.PRODUCT} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const isRoleIdsExist: boolean = 
      await isIdsExist<IProduct>(orderFormProductIds, ProductModel);

    if ( !isRoleIdsExist ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ${ECollectionNames.PRODUCT} in good receipt products does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.PRODUCT} ID is correct.`, 
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    const newGoodReceipt = new collectionModel({
      created_at: new Date(), 
      updated_at: new Date(), 
      products: orderForm.products, 
    });

    const savedGoodReceipt: collectionType = await newGoodReceipt.save();

    if (!savedGoodReceipt)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          ``,
          path, 
          `Please contact for more information.`, 
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(savedGoodReceipt, { status: EStatusCode.CREATED });
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
