import { ROOT } from "@/constants/root.constant";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IBusiness } from "@/interfaces/business.interface";
import { IOrderForm, IOrderFormProductDetail } from "@/interfaces/order-form.interface";
import { IProductDetail } from "@/interfaces/product-detail.interface";
import { BusinessModel } from "@/models/Business";
import { OrderFormModel } from "@/models/OrderForm";
import { ProductDetailModel } from "@/models/ProductDetail";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isIdsExist } from "@/utils/is-ids-exist";
import { print } from "@/utils/print";
import { isValidObjectId } from "mongoose";
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

    const orderFormProductDetailIds: string[] = 
      orderForm.product_details.map(
        (orderFormProductDetail: IOrderFormProductDetail): string => 
          orderFormProductDetail._id
      );

    const isProductDetailIdsExist: boolean = await isIdsExist<IProductDetail>(
      orderFormProductDetailIds, 
      ProductDetailModel
    );

    if ( !isProductDetailIdsExist ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ${ECollectionNames.PRODUCT_DETAIL} in order form's product details does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.PRODUCT_DETAIL} ID is correct.`, 
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    const orderFormProductDetailUnitIds: string[] = 
      orderForm.product_details.map(
        (orderFormProductDetail: IOrderFormProductDetail): string => 
          orderFormProductDetail.unit_id
      );

    const isProductDetailUnitIdsExist: boolean = await isIdsExist<IProductDetail>(
      orderFormProductDetailUnitIds, 
      ProductDetailModel
    );

    if ( !isProductDetailUnitIdsExist ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ${ECollectionNames.UNIT} in order form's product details does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.UNIT} ID is correct.`, 
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    if ( !isValidObjectId(orderForm.supplier_id) ) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ID in order form's products is not valid.`,
          path, 
          `Please check if the ${ECollectionNames.BUSINESS} ID is correct.`, 
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundSupplier: IBusiness | null = 
      await BusinessModel.findById(orderForm.supplier_id);

    if (!foundSupplier) 
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${ECollectionNames.BUSINESS} with the ID '${orderForm.supplier_id}' does not exist in our records.`,
          path, 
          `Please check if the ${ECollectionNames.BUSINESS} ID is correct.`
        ),          
        { status: EStatusCode.NOT_FOUND }
      );
    
    const newOrderForm = new collectionModel({
      created_at: new Date(), 
      updated_at: new Date(), 
      product_details: orderForm.product_details, 
    });

    const savedOrderForm: collectionType = await newOrderForm.save();

    if (!savedOrderForm)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          ``,
          path, 
          `Please contact for more information.`, 
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(savedOrderForm, { status: EStatusCode.CREATED });
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
