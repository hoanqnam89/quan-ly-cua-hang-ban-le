'use client';

import { Button } from '@/components';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProductList from '../../../components/ProductList';
import ProductSelectModal from '../../../components/ProductSelectModal';
import type { IProduct } from '../../../interfaces/product.interface';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../../../utils/format';

interface OrderItem {
    product: IProduct;
    quantity: number;
}

export default function CreateOrder() {
    const router = useRouter();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [employee, setEmployee] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');
    const [displayPaymentText, setDisplayPaymentText] = useState<string>('Thanh toán tiền mặt');
    const [customerPayment, setCustomerPayment] = useState<string>('0');
    const [changeAmount, setChangeAmount] = useState<string>('0');

    const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.product.output_price * item.quantity,
        0
    );

    useEffect(() => {
        setCustomerPayment(totalAmount.toLocaleString());
    }, [totalAmount]);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await fetch('/api/auth/me');

                if (!response.ok) {
                    throw new Error('Failed to fetch employee');
                }
                const data = await response.json();
                console.log('Response status:', response.status);
                console.log('Full response data:', data);

                // Lấy account_id từ response đầu tiên
                const accountId = data._id;

                // Gọi API thứ hai để lấy thông tin chi tiết người dùng
                const userResponse = await fetch(`/api/user/account/${accountId}`);
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const userData = await userResponse.json();
                console.log('User data:', userData);

                // Tạo tên đầy đủ từ first, middle và last name
                const fullName = [
                    userData.name?.first || '',
                    userData.name?.middle || '',
                    userData.name?.last || ''
                ].filter(Boolean).join(' ');

                setEmployee(fullName || 'Chưa xác định');
            } catch (err) {
                console.error('Error fetching employee:', err);
                setEmployee('Chưa xác định');
            }
        };

        fetchEmployee();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/product');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleBack = () => {
        router.push('/home/order');
    };

    const handleAddToOrder = (product: IProduct) => {
        setOrderItems((prev) => {
            const existingItem = prev.find((item) => item.product._id === product._id);
            if (existingItem) {
                return prev.map((item) =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPaymentMethod(value);
        switch (value) {
            case 'cash':
                setDisplayPaymentText('Thanh toán tiền mặt');
                break;
            case 'transfer':
                setDisplayPaymentText('Thanh toán chuyển khoản');
                break;
            case 'card':
                setDisplayPaymentText('Thanh toán qua thẻ');
                break;
            default:
                setDisplayPaymentText('Thanh toán tiền mặt');
        }
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

    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex items-center h-14 px-5">
                        <Button
                            onClick={handleBack}
                            className="flex items-center justify-center w-[30px] h-[30px] rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                        >
                            <Image
                                src="/icons/chevron-left.svg"
                                alt="back"
                                width={16}
                                height={16}
                                className="text-slate-600"
                                priority
                            />
                        </Button>
                        <span className="ml-3 text-lg font-medium text-slate-900">Tạo đơn hàng</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto p-5">
                <div className="grid grid-cols-7 gap-5">
                    {/* Cột trái - Sản phẩm đã chọn */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[600px] flex flex-col">
                            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/cart.svg"
                                    alt="cart"
                                    width={20}
                                    height={20}
                                    className="text-slate-700"
                                    priority
                                />
                                Sản phẩm đã chọn
                            </h2>

                            {orderItems.length > 0 ? (
                                <div className="flex-1 overflow-y-auto space-y-4">
                                    {orderItems.map((item) => (
                                        <div
                                            key={item.product._id}
                                            className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg"
                                        >
                                            <div className="w-16 h-16 bg-slate-50 rounded-lg relative overflow-hidden flex-shrink-0">
                                                {item.product.image_links?.[0] ? (
                                                    <Image
                                                        src={item.product.image_links[0]}
                                                        alt={item.product.name}
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
                                                            className="text-slate-300"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-slate-900 truncate">{item.product.name}</h3>
                                                <div className="mt-1 text-sm text-slate-500">
                                                    {formatCurrency(item.product.output_price)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        if (item.quantity > 1) {
                                                            setOrderItems(prev =>
                                                                prev.map(i =>
                                                                    i.product._id === item.product._id
                                                                        ? { ...i, quantity: i.quantity - 1 }
                                                                        : i
                                                                )
                                                            );
                                                        }
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
                                                >
                                                    <Image
                                                        src="/icons/minus.svg"
                                                        alt="minus"
                                                        width={20}
                                                        height={20}
                                                        className="text-slate-600"
                                                    />
                                                </button>
                                                <span className="w-10 text-center font-medium text-slate-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setOrderItems(prev =>
                                                            prev.map(i =>
                                                                i.product._id === item.product._id
                                                                    ? { ...i, quantity: i.quantity + 1 }
                                                                    : i
                                                            )
                                                        );
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
                                                >
                                                    <Image
                                                        src="/icons/plus.svg"
                                                        alt="plus"
                                                        width={20}
                                                        height={20}
                                                        className="text-slate-600"
                                                    />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-slate-900">
                                                    {formatCurrency(item.product.output_price * item.quantity)}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    setOrderItems((prev) =>
                                                        prev.filter((i) => i.product._id !== item.product._id)
                                                    )
                                                }
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
                                            >
                                                <Image
                                                    src="/icons/trash.svg"
                                                    alt="remove"
                                                    width={20}
                                                    height={20}
                                                    className="text-red-500"
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <Image
                                            src="/icons/empty-cart.svg"
                                            alt="empty"
                                            width={44}
                                            height={44}
                                            className="mx-auto mb-3 text-slate-400"
                                            priority
                                        />
                                        <p className="text-slate-600 mb-3 text-[16px]">Chưa có sản phẩm nào được chọn</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cột phải - Danh sách sản phẩm */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[600px] flex flex-col">
                            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/product.svg"
                                    alt="product"
                                    width={20}
                                    height={20}
                                    className="text-slate-700"
                                    priority
                                />
                                Danh sách sản phẩm
                            </h2>
                            <div className="flex gap-3 mb-5">
                                <div className="w-full relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên sản phẩm... (F3)"
                                        className="w-full h-10 px-4 pl-9 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-400 text-[15px] text-slate-900 placeholder:text-slate-400"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Image
                                            src="/icons/search.svg"
                                            alt="search"
                                            width={16}
                                            height={16}
                                            className="text-slate-400"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center justify-center h-full text-red-500">
                                        {error}
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <Image
                                                src="/icons/empty-cart.svg"
                                                alt="empty"
                                                width={44}
                                                height={44}
                                                className="mx-auto mb-3 text-slate-400"
                                                priority
                                            />
                                            <p className="text-slate-600 mb-3 text-[16px]">Không có sản phẩm nào</p>
                                            <button className="px-6 py-2.5 text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 text-[16px]">
                                                Thêm sản phẩm
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <ProductList
                                        products={products}
                                        onSelect={handleAddToOrder}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border-t border-slate-200">
                <div className="max-w-[1400px] mx-auto p-5">
                    <div className="grid grid-cols-3 gap-5">
                        <div className="col-span-2">
                            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/order.svg"
                                    alt="payment"
                                    width={20}
                                    height={20}
                                    className="text-slate-700"
                                    priority
                                />
                                Thanh toán
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-700 text-[16px]">Tổng tiền hàng</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[16px]">{orderItems.length} sản phẩm</span>
                                        <span className="text-slate-900 font-medium text-[16px]">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-700 text-[16px]">Thêm giảm giá</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[16px]">---</span>
                                        <span className="text-slate-900 font-medium text-[16px]">0đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-700 text-[16px]">Thêm phí giao hàng</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[16px]">---</span>
                                        <span className="text-slate-900 font-medium text-[16px]">0đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="font-semibold text-slate-900 text-lg">Thành tiền</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-900 text-xl font-semibold">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Phần thanh toán */}
                                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-3">
                                        <input
                                            type="radio"
                                            id="paid"
                                            name="paymentStatus"
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <label htmlFor="paid" className="ml-2 text-slate-900 font-medium">
                                            Đã thanh toán
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                                Hình thức thanh toán
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-900"
                                                value={paymentMethod}
                                                onChange={handlePaymentChange}
                                            >
                                                <option value="cash">{paymentMethod === 'cash' ? displayPaymentText : 'Thanh toán tiền mặt'}</option>
                                                <option value="transfer">{paymentMethod === 'transfer' ? displayPaymentText : 'Thanh toán chuyển khoản'}</option>
                                                <option value="card">{paymentMethod === 'card' ? displayPaymentText : 'Thanh toán qua thẻ'}</option>
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
                                        <div className="col-span-2">
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
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 mb-40">
                            {/* Thông tin đơn hàng */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                    <Image
                                        src="/icons/employee.svg"
                                        alt="employee"
                                        width={20}
                                        height={20}
                                        className="text-slate-700"
                                        priority
                                    />
                                    Thông tin đơn hàng
                                </h2>
                                <div>
                                    <label className="block text-[16px] font-medium text-slate-700 mb-2">
                                        Nhân viên phụ trách
                                    </label>
                                    <div className="relative">
                                        <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[16px] text-slate-700">
                                            {employee}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ghi chú */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                    <Image
                                        src="/icons/note.svg"
                                        alt="note"
                                        width={20}
                                        height={20}
                                        className="text-slate-700"
                                        priority
                                    />
                                    Ghi chú
                                </h2>
                                <textarea
                                    placeholder="VD: Giao hàng trong giờ hành chính cho khách"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-h-[200px] resize-none text-[15px] leading-relaxed text-slate-700 placeholder:text-slate-400 transition-all duration-200"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
                <div className="max-w-[1400px] mx-auto px-5 py-4">
                    <div className="flex items-center justify-end gap-4">
                        <Button className="px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 font-medium text-[16px] text-slate-700 transition-all duration-200 hover:shadow-sm flex items-center gap-2">
                            <Image
                                src="/icons/save.svg"
                                alt="save"
                                width={18}
                                height={18}
                                className="text-slate-600"
                                priority
                            />
                            Lưu nháp
                        </Button>
                        <Button className="h-11 px-6 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-500 rounded-lg font-medium text-[15px] text-slate-900 hover:text-blue-600 shadow-sm transition-all duration-200 flex items-center gap-2">
                            <Image
                                src="/icons/check.svg"
                                alt="check"
                                width={20}
                                height={20}
                                className="text-slate-900"
                                priority
                            />
                            Tạo đơn hàng
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 