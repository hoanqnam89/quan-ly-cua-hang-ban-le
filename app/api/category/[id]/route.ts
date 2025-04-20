import { NextRequest, NextResponse } from "next/server";
import { deleteCollectionByIdApi } from "@/utils/api-helper";
import { IQueryString } from "../../interfaces/query-string.interface";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { print } from "@/utils/print";
import { connectToDatabase } from "@/utils/database";
import { createErrorMessage } from "@/utils/create-error-message";
import { ROOT } from "@/constants/root.constant";
import { isValidObjectId } from "mongoose";
import { ICategory } from "@/interfaces/category.interface";
import { CategoryModel } from "@/models/Category";

type collectionType = ICategory;
const collectionName: ECollectionNames = ECollectionNames.CATEGORY;
const collectionModel = CategoryModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}/[id]`;

export const PATCH = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - PATCH ${collectionName}`, ETerminal.FgMagenta);

  const category: collectionType = await req.json();

  try {
    connectToDatabase();

    const foundCategory: collectionType | null =
      await collectionModel.findById(category._id);

    if (!foundCategory)
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          `The ${collectionName} with the ID '${category._id}' does not exist in our records.`,
          path,
          `Please check if the ${collectionName} ID is correct.`
        ),
        { status: EStatusCode.NOT_FOUND }
      );

    const updatedCategory = await collectionModel.findOneAndUpdate(
      { _id: category._id },
      {
        $set: {
          name: category.name,
          // description: category.,
          // input_price: category.input_price,
          // output_price: category.output_price,
          // image_links: category.image_links,
          updated_at: new Date(),
        }
      }
    );

    if (!updatedCategory)
      return NextResponse.json(
        createErrorMessage(
          `Failed to update ${collectionName}.`,
          ``,
          path,
          `Please contact for more information.`,
        ),
        { status: EStatusCode.INTERNAL_SERVER_ERROR }
      );

    return NextResponse.json(updatedCategory, { status: EStatusCode.CREATED });
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

export const DELETE = async (
  _req: NextRequest, query: IQueryString
): Promise<NextResponse> =>
  await deleteCollectionByIdApi<collectionType>(
    collectionModel,
    collectionName,
    path,
    query
  );

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'ID sản phẩm không hợp lệ' },
        { status: 400 }
      );
    }

    const category = await CategoryModel.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thông tin sản phẩm: ' + (error instanceof Error ? error.message : 'Lỗi không xác định') },
      { status: 500 }
    );
  }
}
