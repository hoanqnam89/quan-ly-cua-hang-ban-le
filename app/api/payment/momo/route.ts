<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Cấu hình MoMo
const config = {
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    partnerCode: 'MOMO',
    requestType: 'payWithMethod',
    autoCapture: true,
    lang: 'vi',
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, amount, orderInfo, extraData } = body;

        // URL callback
        const host = req.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';

        // Tạo URL callback để MoMo gửi kết quả thanh toán
        const redirectUrl = `${protocol}://${host}/payment/success`;
        const ipnUrl = `${protocol}://${host}/api/payment/momo/callback`;

        // Tạo requestId
        const requestId = orderId || config.partnerCode + new Date().getTime();

        // Tạo chuỗi raw signature
        const rawSignature = [
            `accessKey=${config.accessKey}`,
            `amount=${amount}`,
            `extraData=${extraData || ''}`,
            `ipnUrl=${ipnUrl}`,
            `orderId=${requestId}`,
            `orderInfo=${orderInfo || 'Thanh toán đơn hàng'}`,
            `partnerCode=${config.partnerCode}`,
            `redirectUrl=${redirectUrl}`,
            `requestId=${requestId}`,
            `requestType=${config.requestType}`,
        ].join('&');

        // Tạo chữ ký
        const signature = crypto
            .createHmac('sha256', config.secretKey)
            .update(rawSignature)
            .digest('hex');

        // Tạo request body
        const requestBody = {
            partnerCode: config.partnerCode,
            partnerName: 'Cửa hàng bán lẻ',
            storeId: 'RetailStore',
            requestId: requestId,
            amount: amount,
            orderId: requestId,
            orderInfo: orderInfo || 'Thanh toán đơn hàng',
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: config.lang,
            requestType: config.requestType,
            autoCapture: config.autoCapture,
            extraData: extraData || '',
            signature: signature,
        };

        // Gửi request đến MoMo
=======
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const partnerCode = "MOMO";
const accessKey = "F8BBA842ECF85";
const secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

export async function POST(request: Request) {
    try {
        const { orderId, amount, orderInfo } = await request.json();

        const requestId = partnerCode + new Date().getTime();
        const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/home/order/payment/callback`;
        const ipnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/momo/ipn`;
        const requestType = "captureWallet";
        const extraData = "";

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = crypto
            .createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'vi'
        };

>>>>>>> 05952f64d01e510efda5ded40c4b0dda4f3c6476
        const response = await fetch('https://test-payment.momo.vn/v2/gateway/api/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

<<<<<<< HEAD
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Lỗi khi gọi API MoMo: ${response.status} ${errorText}`);
        }

        const responseData = await response.json();
        console.log('Kết quả trả về từ MoMo:', JSON.stringify(responseData, null, 2));
        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Lỗi khi tạo thanh toán MoMo:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Lỗi không xác định' },
=======
        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating MoMo payment:', error);
        return NextResponse.json(
            { error: 'Failed to create payment' },
>>>>>>> 05952f64d01e510efda5ded40c4b0dda4f3c6476
            { status: 500 }
        );
    }
} 