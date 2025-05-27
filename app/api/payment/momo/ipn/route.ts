import { NextResponse } from 'next/server';
import crypto from 'crypto';

const secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            signature,
            extraData
        } = data;

        // Tạo chuỗi ký tự để kiểm tra chữ ký
        const rawSignature = `partnerCode=${partnerCode}&orderId=${orderId}&requestId=${requestId}&amount=${amount}&orderInfo=${orderInfo}&orderType=${orderType}&transId=${transId}&resultCode=${resultCode}&message=${message}&payType=${payType}&extraData=${extraData}`;

        // Tạo chữ ký
        const expectedSignature = crypto
            .createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');

        // Kiểm tra chữ ký
        if (signature !== expectedSignature) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        // Xử lý kết quả thanh toán
        if (resultCode === '0') {
            // Cập nhật trạng thái đơn hàng
            const updateOrderResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/draft`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: orderId,
                    payment_method: 'momo',
                    payment_status: true
                }),
            });

            if (!updateOrderResponse.ok) {
                throw new Error('Failed to update order status');
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing IPN:', error);
        return NextResponse.json(
            { error: 'Failed to process IPN' },
            { status: 500 }
        );
    }
} 