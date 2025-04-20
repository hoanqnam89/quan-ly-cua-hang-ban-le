import React, { useState, useEffect } from 'react';
import { Button } from '@/components';
import Image from 'next/image';
import { formatCurrency } from '@/app/utils/format';

interface OrderItem {
    product_id: string;
    quantity: number;
    price: number;
    product?: {
        _id: string;
        name: string;
        image_links?: string[];
    };
}

interface IProductDetail {
    _id: string;
    product_id: string;
    input_quantity: number;
    output_quantity: number;
    date_of_manufacture: Date;
    expiry_date: Date;
    created_at: Date;
    updated_at: Date;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    orderId: string;
    totalAmount: number;
    orderItems?: OrderItem[];
}

export default function PaymentModal({ isOpen, onClose, onComplete, orderId, totalAmount, orderItems = [] }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');
    const [customerPayment, setCustomerPayment] = useState<string>(totalAmount.toLocaleString());
    const [changeAmount, setChangeAmount] = useState<string>('0');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setCustomerPayment(totalAmount.toLocaleString());
    }, [totalAmount, isOpen]);

    const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPaymentMethod(e.target.value);
    };

    const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Loại bỏ tất cả các ký tự không phải số
        const value = e.target.value.replace(/[^\d]/g, '');

        // Nếu value rỗng, set về 0
        if (!value) {
            setCustomerPayment('0');
            setChangeAmount('0');
            return;
        }

        // Chuyển thành số và format với dấu phẩy
        const numberValue = parseInt(value);
        setCustomerPayment(numberValue.toLocaleString());

        // Tính số tiền thối lại
        const change = numberValue - totalAmount;
        setChangeAmount(change >= 0 ? change.toLocaleString() : '0');
    };

    // Hàm cập nhật số lượng sản phẩm đang bán
    const updateProductQuantities = async () => {
        try {
            console.log("Bắt đầu cập nhật số lượng sản phẩm sau khi thanh toán...");

            if (!orderItems || orderItems.length === 0) {
                console.log("Không có sản phẩm để cập nhật số lượng.");
                return;
            }

            // Lấy tất cả thông tin chi tiết sản phẩm hiện tại
            const response = await fetch(`/api/product-detail?t=${Date.now()}`);
            if (!response.ok) {
                throw new Error('Không thể lấy thông tin chi tiết sản phẩm');
            }

            const productDetails: IProductDetail[] = await response.json();
            console.log(`Đã lấy ${productDetails.length} chi tiết sản phẩm`);

            // Tạo bản đồ chi tiết sản phẩm theo product_id
            const productDetailsMap: Record<string, IProductDetail[]> = {};

            productDetails.forEach(detail => {
                if (!productDetailsMap[detail.product_id]) {
                    productDetailsMap[detail.product_id] = [];
                }
                productDetailsMap[detail.product_id].push(detail);
            });

            // Cập nhật số lượng cho từng sản phẩm trong đơn hàng
            for (const orderItem of orderItems) {
                const productId = orderItem.product_id;
                const quantityToDecrease = orderItem.quantity;
                const productName = orderItem.product?.name || `Sản phẩm #${productId}`;

                console.log(`Cập nhật sản phẩm ${productName} - ID: ${productId} - Số lượng: ${quantityToDecrease}`);

                if (productDetailsMap[productId] && productDetailsMap[productId].length > 0) {
                    const details = productDetailsMap[productId];
                    let remainingQuantity = quantityToDecrease;

                    // Process each product detail
                    for (const detail of details) {
                        if (remainingQuantity <= 0) break;

                        const currentInput = detail.input_quantity || 0;
                        const currentOutput = detail.output_quantity || 0;
                        const currentInventory = currentInput - currentOutput;

                        // Số lượng có thể bán từ lô này
                        const decreaseAmount = Math.min(remainingQuantity, currentInventory);

                        if (decreaseAmount > 0) {
                            // Sửa lại: Tăng output_quantity (số lượng đã bán)
                            const newOutput = currentOutput + decreaseAmount; // Đúng: output tăng thêm số lượng bán

                            try {
                                const detailId = detail._id.toString();
                                console.log(`Cập nhật chi tiết sản phẩm ${detailId}:
                                    - Số lượng đã bán cũ: ${currentOutput}
                                    - Số lượng bán thêm: ${decreaseAmount}
                                    - Số lượng đã bán mới: ${newOutput}
                                    - Tồn kho mới: ${currentInput - newOutput} // inventory sẽ giảm vì output tăng
                                `);

                                const updateResponse = await fetch(`/api/product-detail/${detailId}?t=${Date.now()}`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        output_quantity: newOutput, // Gửi output mới đã tăng
                                    }),
                                });

                                if (!updateResponse.ok) {
                                    const errorText = await updateResponse.text();
                                    console.error(`Lỗi khi cập nhật chi tiết sản phẩm ${detailId}:`, errorText);
                                    throw new Error(`Không thể cập nhật chi tiết sản phẩm: ${updateResponse.status} ${updateResponse.statusText}`);
                                }

                                // Giảm số lượng còn phải xử lý
                                remainingQuantity -= decreaseAmount;
                                console.log(`Đã cập nhật số lượng đã bán: ${decreaseAmount}. Còn lại cần xử lý: ${remainingQuantity}`);

                            } catch (updateError) {
                                console.error(`Lỗi khi gửi request PATCH:`, updateError);
                                throw updateError;
                            }
                        }
                    }

                    if (remainingQuantity > 0) {
                        console.warn(`Không đủ số lượng cho sản phẩm ${productName}. Còn lại ${remainingQuantity} không thể xử lý.`);
                    }
                }
            }

            console.log("Hoàn thành cập nhật số lượng sản phẩm sau khi thanh toán");

        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
            // Không hiển thị thông báo lỗi cho người dùng trong trường hợp này
            // vì đơn hàng đã được thanh toán thành công
            console.warn("Thanh toán vẫn thành công mặc dù có lỗi khi cập nhật số lượng sản phẩm");
        }
    };

    const handleCompletePayment = async () => {
        setIsProcessing(true);
        try {
            console.log("Bắt đầu cập nhật trạng thái thanh toán cho đơn hàng: " + orderId);

            // Sử dụng API /api/order/draft với phương thức PATCH và cấu trúc dữ liệu đúng
            const updateOrderResponse = await fetch(`/api/order/draft?t=${Date.now()}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: orderId,  // API yêu cầu trường orderId, không phải _id
                    payment_method: paymentMethod
                }),
            });

            if (!updateOrderResponse.ok) {
                const errorData = await updateOrderResponse.text();
                console.error("Lỗi API:", errorData);
                throw new Error('Không thể cập nhật trạng thái thanh toán');
            }

            console.log("Đã cập nhật trạng thái thanh toán thành công");

            // Cập nhật số lượng sản phẩm đang bán sau khi thanh toán thành công
            await updateProductQuantities();

            // Thông báo hoàn thành
            onComplete();
        } catch (error) {
            console.error('Error completing payment:', error);
            alert('Có lỗi xảy ra khi cập nhật đơn hàng hoặc số lượng sản phẩm');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <Image
                        src="/icons/close.svg"
                        alt="close"
                        width={20}
                        height={20}
                    />
                </button>

                <h2 className="text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
                    <Image
                        src="/icons/payment.svg"
                        alt="payment"
                        width={24}
                        height={24}
                    />
                    Hoàn thành thanh toán
                </h2>

                {/* Hiển thị danh sách sản phẩm */}
                {orderItems && orderItems.length > 0 && (
                    <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                            <h3 className="font-medium text-slate-700">Danh sách sản phẩm</h3>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {orderItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                                    <div className="w-14 h-14 bg-slate-100 rounded-md relative overflow-hidden flex-shrink-0 border border-slate-200">
                                        {item.product?.image_links?.[0] ? (
                                            <Image
                                                src={item.product.image_links[0]}
                                                alt={item.product?.name || 'Sản phẩm'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Image
                                                    src="/icons/product.svg"
                                                    alt="product"
                                                    width={24}
                                                    height={24}
                                                    className="text-slate-400"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 truncate">
                                            {item.product?.name || `Sản phẩm #${item.product_id}`}
                                        </p>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                            <span>{formatCurrency(item.price)}</span>
                                            <span className="text-slate-300">×</span>
                                            <span className="font-medium text-slate-600">{item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="text-right font-medium text-slate-800">
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between">
                            <span className="font-medium text-slate-600">Tổng cộng:</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                        <span className="text-slate-700 text-[17px]">Tổng tiền hàng</span>
                        <span className="text-slate-900 font-medium text-[17px]">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">
                            Hình thức thanh toán
                        </label>
                        <select
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-900"
                            value={paymentMethod}
                            onChange={handlePaymentMethodChange}
                        >
                            <option value="cash">Thanh toán tiền mặt</option>
                            <option value="transfer">Thanh toán chuyển khoản</option>
                            <option value="card">Thanh toán qua thẻ</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">
                            Số tiền khách đưa
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-900"
                                value={customerPayment}
                                onChange={handlePaymentAmountChange}
                                placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-900">
                                đ
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">
                            Số tiền thối lại
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-green-600"
                                value={changeAmount}
                                readOnly
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                                đ
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <Button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors border border-slate-300"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleCompletePayment}
                            isDisable={isProcessing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-black rounded-lg font-medium transition-colors border border-slate-300"
                        >
                            {isProcessing ? 'Đang xử lý...' : 'Hoàn thành thanh toán'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}