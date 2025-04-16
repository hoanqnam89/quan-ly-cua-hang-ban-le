import { ROOT } from "@/constants/root.constant";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IBusiness } from "@/interfaces/business.interface";
import { IOrderForm, IOrderFormProductDetail } from "@/interfaces/order-form.interface";
import { IProductDetail } from "@/interfaces/product-detail.interface";
import { IUnit } from "@/interfaces/unit.interface";
import { IReceiptProduct, IWarehouseReceipt } from "@/interfaces/warehouse-receipt.interface";
import { BusinessModel } from "@/models/Business";
import { OrderFormModel } from "@/models/OrderForm";
import { ProductDetailModel } from "@/models/ProductDetail";
import { UnitModel } from "@/models/Unit";
import { WarehouseReceiptModel } from "@/models/WarehouseReceipt";
import { deleteCollectionsApi, getCollectionsApi } from "@/utils/api-helper";
import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { isIdsExist } from "@/utils/is-ids-exist";
import { isIdsValid } from "@/utils/is-ids-valid";
import { print } from "@/utils/print";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type collectionType = IWarehouseReceipt;
const collectionName: ECollectionNames = ECollectionNames.WAREHOUSE_RECEIPT;
const collectionModel = WarehouseReceiptModel;
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

  const warehouseReceipt: collectionType = await req.json();

  try {
    connectToDatabase();

    if (!isValidObjectId(warehouseReceipt.supplier_id))
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ID '${warehouseReceipt.supplier_id}' is not valid.`,
          path,
          `Please check if the ${ECollectionNames.BUSINESS} ID is correct.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundSupplier: IBusiness | null =
      await BusinessModel.findById(warehouseReceipt.supplier_id);

    if (!foundSupplier)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${ECollectionNames.BUSINESS} with the ID '${warehouseReceipt.supplier_receipt_id}' does not exist in our records.`,
          path,
          `Please check if the ${ECollectionNames.BUSINESS} ID is correct.`
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    if (!isValidObjectId(warehouseReceipt.supplier_receipt_id))
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ID '${warehouseReceipt.supplier_receipt_id}' is not valid.`,
          path,
          `Please check if the ${ECollectionNames.SUPPLIER_RECEIPT} ID is correct.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const foundSupplierReceipt: IOrderForm | null =
      await OrderFormModel.findById(warehouseReceipt.supplier_receipt_id);

    if (!foundSupplierReceipt)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${ECollectionNames.ORDER_FORM} with the ID '${warehouseReceipt.supplier_receipt_id}' does not exist in our records.`,
          path,
          `Please check if the ${ECollectionNames.ORDER_FORM} ID is correct.`
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    const otherWarehouseReceipts = await collectionModel.find({
      supplier_receipt_id: warehouseReceipt.supplier_receipt_id,
    });

    if (otherWarehouseReceipts.length > 0)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The ${ECollectionNames.SUPPLIER_RECEIPT} with the ID '${warehouseReceipt.supplier_receipt_id}' is belonging to another warehouse receipt in out record.`,
          path,
          `Please check if the ${ECollectionNames.SUPPLIER_RECEIPT} ID is correct.`
        ),
        { status: EStatusCode.CONFLICT }
      );

    const warehouseReceiptProductDetailIds: string[] =
      warehouseReceipt.product_details.map(
        (warehouseReceiptProductDetail: IReceiptProduct) =>
          warehouseReceiptProductDetail._id
      );

    if (!isIdsValid(warehouseReceiptProductDetailIds))
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ID in warehouse receipt's product details is not valid.`,
          path,
          `Please check if the ${ECollectionNames.PRODUCT_DETAIL} ID is correct.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );

    const isProductDetailIdsExist: boolean =
      await isIdsExist<IProductDetail>(
        warehouseReceiptProductDetailIds,
        ProductDetailModel
      );

    if (!isProductDetailIdsExist)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some of the ${ECollectionNames.PRODUCT_DETAIL} in warehouse receipt's product details does not exist in our records.`,
          path,
          `Please check if the ${ECollectionNames.PRODUCT_DETAIL} ID is correct.`,
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    const newWarehouseReceipt = new collectionModel({
      created_at: new Date(),
      updated_at: new Date(),
      supplier_id: warehouseReceipt.supplier_id,
      supplier_receipt_id: warehouseReceipt.supplier_receipt_id,
      product_details: warehouseReceipt.product_details,
    });

    const savedWarehouseReceipt: collectionType = await
      newWarehouseReceipt.save();

    if (!savedWarehouseReceipt)
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          ``,
          path,
          `Please contact for more information.`,
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    warehouseReceipt.product_details.forEach(async (
      productDetail: IOrderFormProductDetail
    ): Promise<void> => {
      const unit = await UnitModel.findById(productDetail.unit_id);
      const foundProductDetail = await ProductDetailModel.findById(productDetail._id);

      // Tính số lượng nhập thêm
      const additionalQuantity = productDetail.quantity * unit.equal;

      // Tính tổng số lượng sau khi nhập
      const totalQuantity = foundProductDetail.input_quantity + additionalQuantity;

      // Số lượng đã bán vẫn giữ nguyên
      const currentOutputQuantity = foundProductDetail.output_quantity;

      // Tính số lượng tồn kho mới
      const newInventory = totalQuantity - currentOutputQuantity;

      await ProductDetailModel.findOneAndUpdate(
        { _id: productDetail._id },
        {
          $set: {
            input_quantity: totalQuantity,
            inventory: newInventory,
            updated_at: new Date(),
          }
        }
      );
    });

    return NextResponse.json(
      savedWarehouseReceipt,
      { status: EStatusCode.CREATED }
    );
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
