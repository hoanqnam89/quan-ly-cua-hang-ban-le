import { connectToDatabase } from "@/utils/database";
import { NextRequest, NextResponse } from "next/server";
import { OrderModel } from "@/models/Order";
import { isValidObjectId } from "mongoose";

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();

        // Kiểm tra dữ liệu đầu vào
        if (!body.employee_id || !isValidObjectId(body.employee_id)) {
            return NextResponse.json(
                { error: 'ID nhân viên không hợp lệ' },
                { status: 400 }
            );
        }

        if (!body.items || body.items.length === 0) {
            return NextResponse.json(
                { error: 'Đơn hàng phải có ít nhất một sản phẩm' },
                { status: 400 }
            );
        }

        if (!body.total_amount || body.total_amount <= 0) {
            return NextResponse.json(
                { error: 'Tổng tiền không hợp lệ' },
                { status: 400 }
            );
        }

        // Tạo mã đơn hàng theo format: [Loại giao dịch] - [NgàyThangNam] - [Số thứ tự]
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN').split('/').join('');

        // Lấy số thứ tự từ đơn hàng cuối cùng trong ngày
        const lastOrder = await OrderModel.findOne({
            order_code: new RegExp(`^HD-${dateStr}-`)
        }).sort({ order_code: -1 });

        let sequence = 1;
        if (lastOrder) {
            const lastSequence = parseInt(lastOrder.order_code.split('-')[2]);
            sequence = lastSequence + 1;
        }

        const orderCode = `HD-${dateStr}-${sequence.toString().padStart(4, '0')}`;

        // Tạo đơn hàng mới
        const order = await OrderModel.create({
            order_code: orderCode,
            employee_id: body.employee_id,
            items: body.items,
            total_amount: body.total_amount,
            payment_method: body.payment_method,
            payment_status: body.payment_status,
            note: body.note
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error creating order:', error);

        // Xử lý các lỗi cụ thể
        if (error instanceof Error) {
            if (error.name === 'ValidationError') {
                return NextResponse.json(
                    { error: 'Dữ liệu không hợp lệ: ' + error.message },
                    { status: 400 }
                );
            }
            if (error.name === 'MongoError' && (error as any).code === 11000) {
                return NextResponse.json(
                    { error: 'Mã đơn hàng đã tồn tại' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Không thể tạo đơn hàng: ' + (error instanceof Error ? error.message : 'Lỗi không xác định') },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        console.log('API Order - Requested');

        // Kết nối đến database
        await connectToDatabase();

        // Phân tích URL để lấy các query parameters
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '1000'); // Mặc định lấy tối đa 1000 đơn hàng

        // Projection để chỉ lấy các trường cần thiết
        const projection = {
            _id: 1,
            order_code: 1,
            employee_id: 1,
            items: 1,
            total_amount: 1,
            payment_method: 1,
            payment_status: 1,
            note: 1,
            created_at: 1,
            updated_at: 1
        };

        // Thực hiện truy vấn với các tối ưu
        const orders = await OrderModel.find({}, projection)
            .sort({ created_at: -1 })
            .limit(limit)
            .lean()
            .exec();

        // Trả về kết quả
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Không thể lấy danh sách đơn hàng: ' + (error instanceof Error ? error.message : 'Lỗi không xác định') },
            { status: 500 }
        );
    }
} 