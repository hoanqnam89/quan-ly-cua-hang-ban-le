import { ROOT } from "@/constants/root.constant";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IBusiness } from "@/interfaces/business.interface";
import { IOrderForm, IOrderFormProductDetail } from "@/interfaces/order-form.interface";
import { IProductDetail } from "@/interfaces/product-detail.interface";
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
import { ProductModel } from "@/models/Product";

type collectionType = IWarehouseReceipt;
const collectionName: ECollectionNames = ECollectionNames.WAREHOUSE_RECEIPT;
const collectionModel = WarehouseReceiptModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}`;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - POST ${collectionName}`, ETerminal.FgYellow);

  const warehouseReceipt: collectionType = await req.json();

  try {
    await connectToDatabase();

    // Validate supplier_id
    if (!isValidObjectId(warehouseReceipt.supplier_id)) {
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The supplier ID '${warehouseReceipt.supplier_id}' is not valid.`,
          path,
          `Please check if the business ID is correct.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );
    }

    // Check if supplier exists
    const foundSupplier = await BusinessModel.findById(warehouseReceipt.supplier_id);
    if (!foundSupplier) {
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The business with ID '${warehouseReceipt.supplier_id}' does not exist.`,
          path,
          `Please check if the business ID is correct.`
        ),
        { status: EStatusCode.NOT_FOUND }
      );
    }

    // Validate supplier_receipt_id
    if (!isValidObjectId(warehouseReceipt.supplier_receipt_id)) {
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The order form ID '${warehouseReceipt.supplier_receipt_id}' is not valid.`,
          path,
          `Please check if the order form ID is correct.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );
    }

    // Check if order form exists
    const foundOrderForm = await OrderFormModel.findById(warehouseReceipt.supplier_receipt_id);
    if (!foundOrderForm) {
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `The order form with ID '${warehouseReceipt.supplier_receipt_id}' does not exist.`,
          path,
          `Please check if the order form ID is correct.`
        ),
        { status: EStatusCode.NOT_FOUND }
      );
    }

    // Check if order form is already used
    const existingReceipt = await collectionModel.findOne({
      supplier_receipt_id: warehouseReceipt.supplier_receipt_id
    });
    if (existingReceipt) {
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `This order form is already used in another warehouse receipt.`,
          path,
          `Please use a different order form.`
        ),
        { status: EStatusCode.CONFLICT }
      );
    }

    // Validate product details
    const productDetailIds = warehouseReceipt.product_details.map(detail => detail._id);
    if (!isIdsValid(productDetailIds)) {
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some product IDs are not valid.`,
          path,
          `Please check the product details.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );
    }

    // Check if all products exist
    const productsExist = await isIdsExist<IProductDetail>(productDetailIds, ProductDetailModel);
    if (!productsExist) {
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Some products do not exist in our records.`,
          path,
          `Please check the product details.`,
        ),
        { status: EStatusCode.NOT_FOUND }
      );
    }

    // Create new warehouse receipt
    const newWarehouseReceipt = new collectionModel({
      created_at: new Date(),
      updated_at: new Date(),
      supplier_id: warehouseReceipt.supplier_id,
      supplier_receipt_id: warehouseReceipt.supplier_receipt_id,
      product_details: warehouseReceipt.product_details,
    });

    // Save warehouse receipt
    const savedWarehouseReceipt = await newWarehouseReceipt.save();
    if (!savedWarehouseReceipt) {
      return NextResponse.json(
        createErrorMessage(
          `Failed to create ${collectionName}.`,
          `Could not save the warehouse receipt.`,
          path,
          `Please try again later.`,
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    // Update product details inventory
    for (const productDetail of warehouseReceipt.product_details) {
      const unit = await UnitModel.findById(productDetail.unit_id);
      const foundProductDetail = await ProductDetailModel.findById(productDetail._id);

      if (unit && foundProductDetail) {
        // Calculate new quantities
        const additionalQuantity = productDetail.quantity * (unit.equal || 1);
        const totalQuantity = (foundProductDetail.input_quantity || 0) + additionalQuantity;
        const currentOutputQuantity = foundProductDetail.output_quantity || 0;
        const newInventory = totalQuantity - currentOutputQuantity;

        // Update product detail
        await ProductDetailModel.findByIdAndUpdate(
          productDetail._id,
          {
            $set: {
              input_quantity: totalQuantity,
              inventory: newInventory,
              updated_at: new Date(),
            }
          }
        );

        // Cập nhật giá nhập và giá bán cho sản phẩm nếu có
        if (productDetail.input_price) {
          const productDetailDoc = await ProductDetailModel.findById(productDetail._id);
          if (productDetailDoc && productDetailDoc.product_id) {
            // Tính giá bán mới = giá nhập + 30% giá nhập
            const newOutputPrice = productDetail.input_price + (productDetail.input_price * 0.3);

            // Cập nhật giá nhập và giá bán cho sản phẩm
            await ProductModel.findByIdAndUpdate(productDetailDoc.product_id, {
              $set: {
                input_price: productDetail.input_price,
                output_price: newOutputPrice,
                updated_at: new Date()
              }
            });
          }
        }
      }
    }

    // Update order form status
    await OrderFormModel.findByIdAndUpdate(
      warehouseReceipt.supplier_receipt_id,
      {
        $set: {
          status: "Hoàn thành",
          updated_at: new Date(),
        }
      }
    );

    return NextResponse.json(savedWarehouseReceipt, { status: EStatusCode.CREATED });
  } catch (error) {
    console.error("Error creating warehouse receipt:", error);
    return NextResponse.json(
      createErrorMessage(
        `Failed to create ${collectionName}.`,
        error instanceof Error ? error.message : "Unknown error",
        path,
        `Please try again later.`,
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
};

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
