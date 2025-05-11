import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/database';
import ReturnExchangeModel from '@/models/ReturnExchange';
import { ProductDetailModel } from '@/models/ProductDetail';
import { WarehouseReceiptModel } from '@/models/WarehouseReceipt';
import { ProductModel } from '@/../models/Product';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const data = await req.json();
        // Kiểm tra dữ liệu đầu vào
        if (!data.receipt_id || !data.product_details || !data.action) {
            return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        // Xử lý đổi hàng
        if (data.action === 'exchange' && data.exchange_product) {
            // 1. Xóa ProductDetail cũ (theo các sản phẩm được chọn đổi)
            for (const detail of data.product_details) {
                await ProductDetailModel.deleteOne({
                    product_id: detail._id,
                    batch_number: detail.batch_number
                });
            }
            // 2. Thêm ProductDetail mới (theo sản phẩm đổi)
            const newProduct = await ProductModel.findById(data.exchange_product.product_id);
            const newProductDetail = await ProductDetailModel.create({
                product_id: data.exchange_product.product_id,
                input_quantity: data.exchange_product.quantity,
                output_quantity: 0,
                inventory: data.exchange_product.quantity,
                batch_number: Date.now().toString(),
                barcode: '',
                date_of_manufacture: new Date(),
                expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            });
            // 3. Xóa sản phẩm cũ khỏi product_details của WarehouseReceipt
            for (const detail of data.product_details) {
                await WarehouseReceiptModel.updateOne(
                    { _id: data.receipt_id },
                    { $pull: { product_details: { _id: detail._id, batch_number: detail.batch_number } } }
                );
            }
            // 4. Thêm sản phẩm mới vào product_details của WarehouseReceipt
            await WarehouseReceiptModel.updateOne(
                { _id: data.receipt_id },
                {
                    $push: {
                        product_details: {
                            _id: data.exchange_product.product_id,
                            name: newProduct?.name || '',
                            quantity: data.exchange_product.quantity,
                            input_price: data.exchange_product.input_price,
                            batch_number: newProductDetail.batch_number,
                            unit_id: data.exchange_product.unit_id,
                            note: data.exchange_product.note || '',
                            date_of_manufacture: newProductDetail.date_of_manufacture,
                            expiry_date: newProductDetail.expiry_date,
                            barcode: '',
                        }
                    }
                }
            );
        }

        // Nếu là trả hàng thì xóa ProductDetail và xóa khỏi phiếu nhập kho
        if (data.action === 'return') {
            for (const detail of data.product_details) {
                // Xóa ProductDetail
                await ProductDetailModel.deleteOne({
                    product_id: detail._id,
                    batch_number: detail.batch_number
                });
                // Xóa sản phẩm khỏi phiếu nhập kho
                await WarehouseReceiptModel.updateOne(
                    { _id: data.receipt_id },
                    { $pull: { product_details: { _id: detail._id, batch_number: detail.batch_number } } }
                );
            }
        }

        // Lưu đổi/trả hàng
        const newRecord = await ReturnExchangeModel.create({
            receipt_id: data.receipt_id,
            product_details: data.product_details,
            action: data.action,
            status: data.action === 'return' ? 'Đã trả hàng' : (data.status || (data.action === 'exchange' ? 'Đang đổi hàng' : 'Hoàn thành')),
            created_at: new Date(),
        });

        // Nếu là trả hàng, cập nhật trạng thái thành Đã trả hàng
        if (data.action === 'return') {
            newRecord.status = 'Đã trả hàng';
            await newRecord.save();
        }

        return NextResponse.json({ success: true, data: newRecord });
    } catch (error) {
        console.error('Lỗi lưu đổi/trả hàng:', error);
        return NextResponse.json({ error: 'Không thể lưu đổi/trả hàng' }, { status: 500 });
    }
} 