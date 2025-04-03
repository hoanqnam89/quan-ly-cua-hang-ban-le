import React, { useState, useEffect } from 'react';
import { Button } from '@/components';
import Image from 'next/image';
import { formatCurrency } from '@/utils/format';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    orderId: string;
    totalAmount: number;
}

export default function PaymentModal({ isOpen, onClose, onComplete, orderId, totalAmount }: PaymentModalProps) {
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
        let value = e.target.value.replace(/[^\d]/g, '');

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

    const handleCompletePayment = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/order/draft', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể cập nhật trạng thái đơn hàng');
            }

            onComplete();
        } catch (error) {
            console.error('Error completing payment:', error);
            alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
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
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors border-2 border-black-600"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleCompletePayment}
                            isDisable={isProcessing}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-500 text-black rounded-lg font-medium transition-colors border-2 border-black-600"
                        >
                            {isProcessing ? 'Đang xử lý...' : 'Hoàn thành thanh toán'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 