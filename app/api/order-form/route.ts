import { ROOT } from "@/constants/root.constant";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IBusiness } from "@/interfaces/business.interface";
import { IOrderForm, IOrderFormProductDetail, OrderFormStatus } from "@/interfaces/order-form.interface";
import { IProduct } from "@/interfaces/product.interface";
import { IUnit } from "@/interfaces/unit.interface";
import { BusinessModel } from "@/models/Business";
import { OrderFormModel } from "@/models/OrderForm";
import { ProductModel } from "@/models/Product";
import { UnitModel } from "@/models/Unit";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isIdsExist } from "@/utils/is-ids-exist";
import { isIdsValid } from "@/utils/is-ids-valid";
import { print } from "@/utils/print";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type collectionType = IOrderForm;
const collectionName: ECollectionNames = ECollectionNames.ORDER_FORM;
const collectionModel = OrderFormModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow);

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

  try {
    const orderForm: collectionType = await req.json();

    // Log để debug dữ liệu nhận được
    console.log("Received order form data:", JSON.stringify({
      supplier_id: orderForm.supplier_id,
      product_details_count: orderForm.product_details?.length || 0,
    }));

    if (!orderForm.product_details || orderForm.product_details.length === 0) {
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Order form must have at least one product.`,
          path,
          `Please add products to the order form.`,
        ),
        { status: EStatusCode.BAD_REQUEST }
      );
    }

    connectToDatabase();

    if (!isValidObjectId(orderForm.supplier_id))
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The supplier ID is not valid.`,
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

    // Kiểm tra nếu có sản phẩm nào với giá nhập hoặc số lượng không hợp lệ
    const productsWithIssues = orderForm.product_details.filter(
      product => !product.input_price || product.input_price <= 0 || !product.quantity || product.quantity <= 0
    );

    if (productsWithIssues.length > 0) {
      // Tìm các sản phẩm có giá = 0 để thông báo cụ thể
      const productsWithZeroPrice = productsWithIssues.filter(product => product.input_price === 0);

      if (productsWithZeroPrice.length > 0) {
        // Lấy ID sản phẩm đầu tiên có giá = 0 để thông báo
        const productId = productsWithZeroPrice[0]._id;

        return NextResponse.json(
          createErrorMessage(
            `Failed to create ${collectionName}.`,
            `Sản phẩm có giá nhập bằng 0.`,
            path,
            `Vui lòng nhập giá cho tất cả sản phẩm trong phiếu đặt hàng.`,
          ),
          { status: EStatusCode.BAD_REQUEST }
        );
      }

      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some products have invalid input price or quantity.`,
          path,
          `Please ensure all products have input price and quantity greater than 0.`,
        ),
        { status: EStatusCode.BAD_REQUEST }
      );
    }

    const orderFormProductIds: string[] =
      orderForm.product_details.map(
        (orderFormProductDetail: IOrderFormProductDetail): string =>
          orderFormProductDetail._id
      );

    if (!isIdsValid(orderFormProductIds))
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ${ECollectionNames.PRODUCT} in order form's product details is not valid.`,
          path,
          `Please check if the ${ECollectionNames.PRODUCT} ID is correct.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    console.log("Validating product IDs:", orderFormProductIds);

    const isProductIdsExist: boolean = await isIdsExist<IProduct>(
      orderFormProductIds,
      ProductModel
    );

    if (!isProductIdsExist)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ${ECollectionNames.PRODUCT} in order form's product details does not exist in our records.`,
          path,
          `Please check if the ${ECollectionNames.PRODUCT} ID is correct.`,
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    const orderFormProductDetailUnitIds: string[] =
      orderForm.product_details.map(
        (orderFormProductDetail: IOrderFormProductDetail): string =>
          orderFormProductDetail.unit_id
      );

    if (!isIdsValid(orderFormProductDetailUnitIds))
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ${ECollectionNames.UNIT} in order form's product details is not valid.`,
          path,
          `Please check if the ${ECollectionNames.UNIT} ID is correct.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    console.log("Validating unit IDs:", orderFormProductDetailUnitIds);

    const isProductDetailUnitIdsExist: boolean = await isIdsExist<IUnit>(
      orderFormProductDetailUnitIds,
      UnitModel
    );

    if (!isProductDetailUnitIdsExist)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ${ECollectionNames.UNIT} in order form's product details does not exist in our records.`,
          path,
          `Please check if the ${ECollectionNames.UNIT} ID is correct.`,
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    console.log("Creating new order form...");

    const newOrderForm = new collectionModel({
      created_at: new Date(),
      updated_at: new Date(),
      supplier_id: orderForm.supplier_id,
      status: OrderFormStatus.PENDING,
      product_details: orderForm.product_details,
    });

    console.log("Saving order form to database...");

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

    console.log("Order form saved successfully with ID:", savedOrderForm._id);

    return NextResponse.json(savedOrderForm, { status: EStatusCode.CREATED });
  } catch (error: unknown) {
    console.error(`Error creating ${collectionName}:`, error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to create ${collectionName}.`,
        error instanceof Error ? error.message : String(error),
        path,
        `Please contact administrator for more information.`,
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
