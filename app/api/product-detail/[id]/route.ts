import { NextRequest, NextResponse } from "next/server";
import { deleteCollectionByIdApi, getCollectionByIdApi } from "@/utils/api-helper";
import { IQueryString } from "../../interfaces/query-string.interface";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { print } from "@/utils/print";
import { connectToDatabase } from "@/utils/database";
import { createErrorMessage } from "@/utils/create-error-message";
import { ROOT } from "@/constants/root.constant";
import { IProductDetail } from "@/interfaces/product-detail.interface";
import { ProductDetailModel } from "@/models/ProductDetail";

type collectionType = IProductDetail;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT_DETAIL;
const collectionModel = ProductDetailModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}/[id]`;

export const PATCH = async (
  req: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> => {
  const { id } = context.params;
  print(`${collectionName} API - PATCH ${collectionName} ID: ${id}`, ETerminal.FgMagenta);

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

  try {
    const productDetail: Partial<collectionType> = await req.json();
    console.log(`Xử lý PATCH request cho product-detail/${id}`, productDetail);

    connectToDatabase();

    const foundProductDetail: collectionType | null =
      await collectionModel.findById(id);

    if (!foundProductDetail)
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `The ${collectionName} with the ID '${id}' does not exist in our records.`,
          path,
          `Please check if the ${collectionName} ID is correct.`
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    // Chuẩn bị đối tượng cập nhật
    const updateData: any = {
      updated_at: new Date(),
    };

    // Cập nhật các trường nếu chúng được cung cấp
    if (productDetail.date_of_manufacture) {
      updateData.date_of_manufacture = productDetail.date_of_manufacture;
    }

    if (productDetail.expiry_date) {
      updateData.expiry_date = productDetail.expiry_date;
    }

    // Xử lý input_quantity và output_quantity
    if (productDetail.input_quantity !== undefined && productDetail.output_quantity !== undefined) {
      // Nếu cả hai trường đều được cung cấp, sử dụng cả hai giá trị như nhận được
      updateData.input_quantity = productDetail.input_quantity;
      updateData.output_quantity = productDetail.output_quantity;
      console.log(`Cập nhật cả input_quantity (${productDetail.input_quantity}) và output_quantity (${productDetail.output_quantity})`);
    } else if (productDetail.input_quantity !== undefined) {
      // Chỉ cung cấp input_quantity, tính toán output_quantity theo công thức cũ
      const stockQuantity = Math.floor(productDetail.input_quantity * 0.1);
      const outputQuantity = productDetail.input_quantity - stockQuantity;

      updateData.input_quantity = productDetail.input_quantity;
      updateData.output_quantity = outputQuantity;
      console.log(`Cập nhật input_quantity thành ${productDetail.input_quantity} và tính toán output_quantity thành ${outputQuantity}`);
    } else if (productDetail.output_quantity !== undefined) {
      // Chỉ cung cấp output_quantity
      updateData.output_quantity = productDetail.output_quantity;
      console.log(`Cập nhật trực tiếp output_quantity thành ${productDetail.output_quantity}`);
    }

    console.log(`Dữ liệu cập nhật:`, updateData);

    const updatedProductDetail = await collectionModel.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedProductDetail)
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          ``,
          path,
          `Please contact for more information.`,
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    console.log(`Đã cập nhật thành công product-detail/${id}`);
    return NextResponse.json(updatedProductDetail, { status: EStatusCode.OK });
  } catch (error: unknown) {
    console.error(`Lỗi khi cập nhật product-detail/${id}:`, error);

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
  req: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> => {
  const { id } = context.params;
  print(`${collectionName} API - GET ${collectionName} ID: ${id}`, ETerminal.FgGreen);

  try {
    connectToDatabase();

    const foundProductDetail: collectionType | null =
      await collectionModel.findById(id);

    if (!foundProductDetail)
      return NextResponse.json(
        createErrorMessage(
          `Failed to get ${collectionName}.`,
          `The ${collectionName} with the ID '${id}' does not exist in our records.`,
          path,
          `Please check if the ${collectionName} ID is correct.`
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    return NextResponse.json(foundProductDetail, { status: EStatusCode.OK });
  } catch (error: unknown) {
    console.error(`Lỗi khi lấy product-detail/${id}:`, error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to get ${collectionName}.`,
        error as string,
        path,
        `Please contact for more information.`,
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> => {
  const { id } = context.params;
  print(`${collectionName} API - DELETE ${collectionName} ID: ${id}`, ETerminal.FgRed);

  try {
    connectToDatabase();

    const foundProductDetail: collectionType | null =
      await collectionModel.findById(id);

    if (!foundProductDetail)
      return NextResponse.json(
        createErrorMessage(
          `Failed to delete ${collectionName}.`,
          `The ${collectionName} with the ID '${id}' does not exist in our records.`,
          path,
          `Please check if the ${collectionName} ID is correct.`
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    const deletedProductDetail = await collectionModel.findByIdAndDelete(id);

    if (!deletedProductDetail)
      return NextResponse.json(
        createErrorMessage(
          `Failed to delete ${collectionName}.`,
          ``,
          path,
          `Please contact for more information.`,
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json({ success: true, message: `${collectionName} deleted successfully` }, { status: EStatusCode.OK });
  } catch (error: unknown) {
    console.error(`Lỗi khi xóa product-detail/${id}:`, error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to delete ${collectionName}.`,
        error as string,
        path,
        `Please contact for more information.`,
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
};
