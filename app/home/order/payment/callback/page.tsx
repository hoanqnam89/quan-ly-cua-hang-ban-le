'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const resultCode = searchParams.get('resultCode');
        if (resultCode === '0') {
            // Lấy thông tin đơn hàng tạm từ localStorage
            const orderDraft = localStorage.getItem('momo_order_draft');
            if (orderDraft) {
                fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: orderDraft
                })
                    .then(res => res.json())
                    .then(() => {
                        localStorage.removeItem('momo_order_draft');
                        alert('Thanh toán thành công! Đơn hàng đã được tạo.');
                        router.push('/home/order');
                    })
                    .catch(() => {
                        alert('Thanh toán thành công nhưng tạo đơn hàng thất bại!');
                        router.push('/home/order');
                    });
            } else {
                alert('Không tìm thấy thông tin đơn hàng!');
                router.push('/home/order');
            }
        } else {
            alert('Thanh toán thất bại. Vui lòng thử lại sau.');
            router.push('/home/order');
        }
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Đang xử lý kết quả thanh toán...</h1>
                <p className="text-gray-600">Vui lòng đợi trong giây lát.</p>
            </div>
        </div>
    );
} 