import { ROOT } from "@/constants/root.constant";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { IBusiness } from "@/interfaces/business.interface";
import { IOrderForm, IOrderFormProductDetail } from "@/interfaces/order-form.interface";
import { IProductDetail } from "@/interfaces/product-detail.interface";
import { IWarehouseReceipt } from "@/interfaces/warehouse-receipt.interface";
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
import { IProduct } from "@/interfaces/product.interface";
import { CategoryModel } from "@/models/Category";
import { ICategory } from "@/interfaces/category.interface";
import { generateBatchNumber } from "@/utils/batch-number";

// Local interface - same as IWarehouseProductDetail in warehouse-receipt.interface.ts
interface WarehouseProductDetail extends IOrderFormProductDetail {
  date_of_manufacture?: string;
  expiry_date?: string;
  batch_number?: string;
  input_price?: number;
}

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
          `Tạo phiếu nhập kho thất bại.`,
          `ID nhà cung cấp không hợp lệ: '${warehouseReceipt.supplier_id}'.`,
          path,
          `Vui lòng kiểm tra lại ID nhà cung cấp.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );
    }

    // Check if supplier exists
    const foundSupplier = await BusinessModel.findById(warehouseReceipt.supplier_id);
    if (!foundSupplier) {
      return NextResponse.json(
        createErrorMessage(
          `Tạo phiếu nhập kho thất bại.`,
          `Không tìm thấy nhà cung cấp với ID '${warehouseReceipt.supplier_id}'.`,
          path,
          `Vui lòng kiểm tra lại ID nhà cung cấp.`
        ),
        { status: EStatusCode.NOT_FOUND }
      );
    }

    // Validate supplier_receipt_id
    if (!isValidObjectId(warehouseReceipt.supplier_receipt_id)) {
      return NextResponse.json(
        createErrorMessage(
          `Tạo phiếu nhập kho thất bại.`,
          `ID phiếu đơn không hợp lệ: '${warehouseReceipt.supplier_receipt_id}'.`,
          path,
          `Vui lòng kiểm tra lại ID phiếu đơn.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );
    }

    // Check if order form exists
    const foundOrderForm = await OrderFormModel.findById(warehouseReceipt.supplier_receipt_id);
    if (!foundOrderForm) {
      return NextResponse.json(
        createErrorMessage(
          `Tạo phiếu nhập kho thất bại.`,
          `Không tìm thấy phiếu đơn với ID '${warehouseReceipt.supplier_receipt_id}'.`,
          path,
          `Vui lòng kiểm tra lại ID phiếu đơn.`,
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
          `Tạo phiếu nhập kho thất bại.`,
          `Phiếu đơn này đã được sử dụng trong phiếu nhập kho khác.`,
          path,
          `Vui lòng sử dụng phiếu đơn khác.`
        ),
        { status: EStatusCode.CONFLICT }
      );
    }

    // Validate product details
    const productIds = warehouseReceipt.product_details.map(detail => detail._id);
    if (!isIdsValid(productIds)) {
      return NextResponse.json(
        createErrorMessage(
          `Tạo phiếu nhập kho thất bại.`,
          `Một số ID sản phẩm không hợp lệ.`,
          path,
          `Vui lòng kiểm tra kho sản phẩm.`,
        ),
        { status: EStatusCode.UNPROCESSABLE_ENTITY }
      );
    }

    // Check if all products exist - kiểm tra trực tiếp với bảng Product
    const productsExist = await isIdsExist<IProduct>(productIds, ProductModel);
    if (!productsExist) {
      return NextResponse.json(
        createErrorMessage(
          `Tạo phiếu nhập kho thất bại.`,
          `Một số sản phẩm không tồn tại trong hệ thống.`,
          path,
          `Vui lòng kiểm tra kho sản phẩm.`,
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
      receipt_code: warehouseReceipt.receipt_code,
    });

    // Save warehouse receipt
    const savedWarehouseReceipt = await newWarehouseReceipt.save();
    if (!savedWarehouseReceipt) {
      return NextResponse.json(
        createErrorMessage(
          `Tạo phiếu nhập kho thất bại.`,
          `Không thể lưu phiếu nhập kho.`,
          path,
          `Vui lòng thử lại sau.`,
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    // Sau khi đã có _id, sinh mã receipt_code và cập nhật lại
    const formatReceiptCode = (id: string, date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      const dateStr = `${day}${month}${year}`;
      const sequence = id.toString().slice(-4).padStart(4, '0');
      return `NK-${dateStr}-${sequence}`;
    };
    const receiptCode = formatReceiptCode(savedWarehouseReceipt._id.toString(), savedWarehouseReceipt.created_at);
    savedWarehouseReceipt.receipt_code = receiptCode;
    await savedWarehouseReceipt.save();

    // Xử lý thêm chi tiết kho cho từng sản phẩm
    for (const detail of warehouseReceipt.product_details) {
      const productDetail = detail as WarehouseProductDetail;

      // Tìm Product và Unit tương ứng trực tiếp từ ProductModel
      const product = await ProductModel.findById(productDetail._id);
      if (!product) {
        console.error(`Không tìm thấy sản phẩm với ID: ${productDetail._id}`);
        continue;
      }

      const unit = await UnitModel.findById(productDetail.unit_id);
      if (!unit) {
        console.error(`Không tìm thấy đơn vị tính với ID: ${productDetail.unit_id}`);
        continue;
      }

      // Tìm category của sản phẩm để lấy giá trị discount
      const category = await CategoryModel.findById(product.category_id);
      if (!category) {
        console.warn(`Không tìm thấy danh mục cho sản phẩm: ${product.name} (${product._id})`);
      }

      const currentDate = new Date();

      // Đảm bảo có số lô
      let batchNumber = productDetail.batch_number;
      if (!batchNumber || batchNumber.trim() === '') {
        batchNumber = generateBatchNumber(product._id);
        console.log(`Tạo số lô mới cho sản phẩm ${product.name}: ${batchNumber}`);
      }

      // Xử lý ngày sản xuất và hạn sử dụng
      let dateOfManufacture: Date | null = null;
      let expiryDate: Date | null = null;

      try {
        if (productDetail.date_of_manufacture) {
          dateOfManufacture = new Date(productDetail.date_of_manufacture);
          if (isNaN(dateOfManufacture.getTime())) {
            console.error(`Ngày sản xuất không hợp lệ: ${productDetail.date_of_manufacture}`);
            dateOfManufacture = new Date(); // Sử dụng ngày hiện tại làm giá trị mặc định
          }
        } else {
          dateOfManufacture = new Date();
        }

        if (productDetail.expiry_date) {
          expiryDate = new Date(productDetail.expiry_date);
          if (isNaN(expiryDate.getTime())) {
            console.error(`Ngày hết hạn không hợp lệ: ${productDetail.expiry_date}`);
            // Sử dụng ngày hiện tại + 30 ngày làm giá trị mặc định
            expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
          }
        } else {
          expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
        }
      } catch (error) {
        console.error(`Lỗi khi xử lý ngày tháng:`, error);
        dateOfManufacture = new Date();
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
      }

      console.log(`Chi tiết ngày tháng của sản phẩm ${product.name}:`, {
        rawDateOfManufacture: productDetail.date_of_manufacture,
        parsedDateOfManufacture: dateOfManufacture,
        rawExpiryDate: productDetail.expiry_date,
        parsedExpiryDate: expiryDate
      });

      // Kiểm tra xem đã có chi tiết kho cho sản phẩm này với cùng số lô không
      const existingProductDetail = await ProductDetailModel.findOne({
        product_id: product._id,
        batch_number: batchNumber
      });

      // Lấy số lượng được nhập
      const additionalQuantity = productDetail.quantity * (unit?.equal || 1);
      console.log(`Số lượng nhập kho: ${additionalQuantity} (${productDetail.quantity} x ${unit?.equal || 1})`);

      if (existingProductDetail) {
        // Cập nhật chi tiết kho hiện tại
        const totalQuantity = (existingProductDetail.input_quantity || 0) + additionalQuantity;
        const currentOutputQuantity = existingProductDetail.output_quantity || 0;
        const newInventory = totalQuantity - currentOutputQuantity;

        await ProductDetailModel.findByIdAndUpdate(
          existingProductDetail._id,
          {
            $set: {
              input_quantity: totalQuantity,
              inventory: newInventory,
              updated_at: currentDate,
            }
          }
        );
      } else {
        // Tạo mới chi tiết kho
        try {
          const newProductDetail = new ProductDetailModel({
            created_at: currentDate,
            updated_at: currentDate,
            product_id: product._id,
            batch_number: batchNumber,
            barcode: batchNumber,
            input_quantity: additionalQuantity,
            output_quantity: 0,
            inventory: additionalQuantity,
            date_of_manufacture: dateOfManufacture,
            expiry_date: expiryDate
          });

          const savedDetail = await newProductDetail.save();
          console.log(`Đã tạo chi tiết kho mới với ID: ${savedDetail._id}`);
        } catch (error) {
          console.error(`Lỗi khi tạo chi tiết kho mới:`, error);
          return NextResponse.json(
            createErrorMessage(
              `Tạo chi tiết kho thất bại.`,
              error instanceof Error ? error.message : "Lỗi khi tạo chi tiết kho",
              path,
              `Vui lòng kiểm tra kho sản phẩm và thử lại.`,
            ),
            { status: EStatusCode.INTERNAL_SERVER_ERROR }
          );
        }
      }

      // Kiểm tra và xử lý trường hợp giá nhập = 0
      if (!productDetail.input_price || productDetail.input_price <= 0) {
        return NextResponse.json(
          createErrorMessage(
            `Tạo phiếu nhập kho thất bại.`,
            `Giá nhập của sản phẩm "${product.name}" không hợp lệ.`,
            path,
            `Vui lòng nhập giá sản phẩm lớn hơn 0.`,
          ),
          { status: EStatusCode.UNPROCESSABLE_ENTITY }
        );
      }

      try {
        // In ra thông tin sản phẩm trước khi cập nhật
        console.log(`Sản phẩm trước khi cập nhật:`, {
          id: product._id,
          name: product.name,
          currentInputPrice: product.input_price,
          currentSellPrice: product.output_price,
          newInputPrice: productDetail.input_price
        });

        // Lấy discount từ category để tính giá bán
        const discount = category?.discount || 0;

        // Tính giá bán theo công thức: giá bán = giá nhập + (giá nhập * discount / 100)
        const inputPrice = productDetail.input_price;
        const sellPrice = inputPrice + (inputPrice * discount / 100);
        const outputPrice = Math.max(1, Math.round(sellPrice)); // Đảm bảo giá bán luôn lớn hơn 0

        // Cập nhật cả giá nhập và giá bán cho sản phẩm
        const updatedProduct = await ProductModel.findByIdAndUpdate(
          product._id,
          {
            $set: {
              input_price: productDetail.input_price,
              output_price: outputPrice,
              updated_at: currentDate
            }
          },
          { new: true } // Trả về document đã cập nhật
        );

        if (!updatedProduct) {
          console.error(`Không thể cập nhật sản phẩm: ${product._id}`);
        } else {
          console.log(`Cập nhật giá sản phẩm thành công:`, {
            id: updatedProduct._id,
            name: updatedProduct.name,
            newInputPrice: updatedProduct.input_price,
            newOutputPrice: updatedProduct.output_price,
            discount: discount,
            updatedAt: updatedProduct.updated_at
          });
        }
      } catch (error) {
        console.error(`Lỗi khi cập nhật giá sản phẩm ${product.name}:`, error);
        // Không throw lỗi để tiếp tục xử lý các sản phẩm khác
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
        `Tạo phiếu nhập kho thất bại.`,
        error instanceof Error ? error.message : "Unknown error",
        path,
        `Vui lòng thử lại sau.`,
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
