import { NextResponse } from "next/server";
import { ECollectionNames, EStatusCode, ETerminal } from "@/enums";
import { ProductDetailModel } from "@/models/ProductDetail";
import { createErrorMessage } from "@/utils/create-error-message";
import { connectToDatabase } from "@/utils/database";
import { print } from "@/utils/print";

const collectionName: ECollectionNames = ECollectionNames.PRODUCT_DETAIL;
const path: string = `/api/product-detail/inventory`;

// Cache kết quả API trong 5 phút (300000ms)
const CACHE_DURATION = 300000;
let cachedInventory: { data: Record<string, number>; timestamp: number } | null = null;

/**
 * API endpoint để lấy thông tin tồn kho cho tất cả sản phẩm
 * Trả về đối tượng với key là product_id và value là số lượng trong kho (input_quantity)
 */
export const GET = async (): Promise<NextResponse> => {
    print(`${collectionName} API - GET inventory for all products`, ETerminal.FgMagenta);

    // Kiểm tra cache - nếu có dữ liệu trong cache và cache chưa hết hạn, trả về dữ liệu từ cache
    const now = Date.now();
    if (cachedInventory && now - cachedInventory.timestamp < CACHE_DURATION) {
        console.log(`${collectionName} API - Serving inventory from cache`);
        return NextResponse.json(cachedInventory.data, {
            status: EStatusCode.OK,
            headers: {
                'Cache-Control': 'public, max-age=300', // Cache 5 phút ở client
                'X-Cached-Response': 'true'
            }
        });
    }

    try {
        await connectToDatabase();

        // Chỉ lấy các trường cần thiết: product_id và input_quantity
        const productDetails = await ProductDetailModel
            .find({}, { product_id: 1, input_quantity: 1 })
            .lean() // Chuyển kết quả sang plain JavaScript objects để tăng hiệu suất
            .exec();

        // Tạo đối tượng mapping product_id -> số lượng trong kho
        const inventoryMap: Record<string, number> = {};

        // Xử lý dữ liệu - nhóm theo product_id
        productDetails.forEach((detail) => {
            const productId = detail.product_id.toString();

            // Nếu product_id đã tồn tại trong map, cộng dồn số lượng
            if (inventoryMap[productId] !== undefined) {
                inventoryMap[productId] += detail.input_quantity;
            } else {
                // Nếu chưa tồn tại, khởi tạo với số lượng hiện tại
                inventoryMap[productId] = detail.input_quantity;
            }
        });

        // Lưu kết quả vào cache
        cachedInventory = { data: inventoryMap, timestamp: now };

        // Trả về kết quả với Cache-Control header
        return NextResponse.json(inventoryMap, {
            status: EStatusCode.OK,
            headers: {
                'Cache-Control': 'public, max-age=300', // Cache 5 phút ở client
                'X-Cached-Response': 'false'
            }
        });
    } catch (error: unknown) {
        console.error(error);

        return NextResponse.json(
            createErrorMessage(
                `Failed to get inventory for all products.`,
                error as string,
                path,
                `Please contact for more information.`
            ),
            { status: EStatusCode.INTERNAL_SERVER_ERROR }
        );
    }
}; 