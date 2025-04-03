'use client';

import { Button } from '@/components';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProductList from '../../../components/ProductList';
import type { IProduct } from '../../../interfaces/product.interface';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../../../utils/format';
import { IProductDetail } from '@/interfaces/product-detail.interface';

interface OrderItem {
    product: IProduct;
    quantity: number;
}

export default function CreateOrder() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState<'products' | 'cart'>('products');
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [employee, setEmployee] = useState<string>('');
    const [employeeName, setEmployeeName] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');
    const [displayPaymentText, setDisplayPaymentText] = useState<string>('Thanh toán tiền mặt');
    const [customerPayment, setCustomerPayment] = useState<string>('0');
    const [changeAmount, setChangeAmount] = useState<string>('0');
    const [note, setNote] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [productStockInfo, setProductStockInfo] = useState<Record<string, number>>({});

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
                setEmployee(accountId);

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

                setEmployeeName(fullName || 'Chưa xác định');
            } catch (err) {
                console.error('Error fetching employee:', err);
                setEmployee('Chưa xác định');
            }
        };

        fetchEmployee();
    }, []);

    // Lấy dữ liệu sản phẩm và inventory ban đầu
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Giới hạn số lượng sản phẩm tải về trong 1 request (1000 là đủ cho hầu hết trường hợp)
                const response = await fetch(`/api/product?limit=1000&t=${Date.now()}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm');
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Lấy thông tin số lượng đang bán của tất cả sản phẩm một lần duy nhất
    useEffect(() => {
        const fetchProductStockInfo = async () => {
            if (!products.length) return;

            try {
                // Lấy tất cả thông tin chi tiết sản phẩm
                const response = await fetch(`/api/product-detail?t=${Date.now()}`);
                if (response.ok) {
                    const allProductDetails: IProductDetail[] = await response.json();

                    // Nhóm chi tiết sản phẩm theo product_id và tính tổng số lượng đang bán
                    const stockInfo: Record<string, number> = {};

                    allProductDetails.forEach(detail => {
                        if (!stockInfo[detail.product_id]) {
                            stockInfo[detail.product_id] = 0;
                        }
                        stockInfo[detail.product_id] += detail.output_quantity || 0;
                    });

                    setProductStockInfo(stockInfo);
                }
            } catch (error) {
                console.error('Lỗi khi lấy thông tin số lượng đang bán:', error);
            }
        };

        fetchProductStockInfo();
    }, [products]);

    // Lọc sản phẩm theo từ khóa tìm kiếm
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBack = () => {
        router.push('/home/order');
    };

    const handleAddToOrder = (product: IProduct) => {
        // Kiểm tra số lượng đang bán của sản phẩm
        const availableQuantity = productStockInfo[product._id] || 0;

        // Thêm sản phẩm trực tiếp vào đơn hàng với số lượng mặc định là 1
        setOrderItems((prev) => {
            const existingItem = prev.find((item) => item.product._id === product._id);

            if (existingItem) {
                // Nếu tổng số lượng sau khi thêm vượt quá số lượng đang bán, hiển thị thông báo
                if (existingItem.quantity >= availableQuantity) {
                    alert(`Sản phẩm "${product.name}" chỉ còn ${availableQuantity} sản phẩm đang bán!`);
                    return prev;
                }

                return prev.map((item) =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            // Nếu số lượng đang bán bằng 0, hiển thị thông báo
            if (availableQuantity === 0) {
                alert(`Sản phẩm "${product.name}" đã hết hàng!`);
                return prev;
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

    const handleCreateOrder = async () => {
        if (orderItems.length === 0) {
            alert('Vui lòng thêm sản phẩm vào đơn hàng');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/order?t=${Date.now()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employee_id: employee,
                    items: orderItems.map(item => ({
                        product_id: item.product._id,
                        quantity: item.quantity,
                        price: item.product.output_price
                    })),
                    total_amount: totalAmount,
                    payment_method: paymentMethod,
                    payment_status: true,
                    note: note
                }),
            });

            if (!response.ok) {
                throw new Error('Không thể tạo đơn hàng');
            }

            // Cập nhật số lượng sản phẩm đang bán sau khi tạo đơn hàng thành công
            await updateProductQuantities();

            alert('Tạo đơn hàng thành công!');
            router.push('/home/order');
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Có lỗi xảy ra khi tạo đơn hàng');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm cập nhật số lượng sản phẩm đang bán
    const updateProductQuantities = async () => {
        try {
            console.log("Bắt đầu cập nhật số lượng sản phẩm...");
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
                const productId = orderItem.product._id;
                const quantityToDecrease = orderItem.quantity;
                console.log(`Cập nhật sản phẩm ${orderItem.product.name} - ID: ${productId} - Số lượng: ${quantityToDecrease}`);

                if (productDetailsMap[productId] && productDetailsMap[productId].length > 0) {
                    // Sắp xếp chi tiết sản phẩm theo ngày hết hạn (cũ nhất trước)
                    const sortedDetails = productDetailsMap[productId].sort(
                        (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
                    );

                    console.log(`Tìm thấy ${sortedDetails.length} chi tiết cho sản phẩm ${productId}`);

                    let remainingQuantity = quantityToDecrease;

                    // Giảm số lượng từ các chi tiết sản phẩm, bắt đầu từ sản phẩm sắp hết hạn nhất
                    for (const detail of sortedDetails) {
                        if (remainingQuantity <= 0) break;

                        // Số lượng có thể giảm từ chi tiết này
                        const currentOutput = detail.output_quantity || 0;
                        const newOutput = Math.max(0, currentOutput - remainingQuantity);
                        const decreaseAmount = currentOutput - newOutput;

                        console.log(`Chi tiết sản phẩm ID: ${detail._id} - Số lượng hiện tại: ${currentOutput} - Giảm: ${decreaseAmount} - Còn lại: ${newOutput}`);

                        if (decreaseAmount > 0) {
                            // Cập nhật số lượng đã bán trong chi tiết sản phẩm
                            try {
                                const detailId = detail._id.toString();
                                console.log(`Gửi request PATCH đến /api/product-detail/${detailId}`);

                                const updateResponse = await fetch(`/api/product-detail/${detailId}?t=${Date.now()}`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        output_quantity: newOutput
                                    }),
                                });

                                if (!updateResponse.ok) {
                                    const errorText = await updateResponse.text();
                                    console.error(`Lỗi khi cập nhật chi tiết sản phẩm ${detailId}:`, errorText);
                                    throw new Error(`Không thể cập nhật chi tiết sản phẩm: ${updateResponse.status} ${updateResponse.statusText}`);
                                } else {
                                    const responseData = await updateResponse.json();
                                    console.log(`Đã cập nhật thành công chi tiết sản phẩm ${detailId}`, responseData);
                                }

                                remainingQuantity -= decreaseAmount;
                            } catch (updateError) {
                                console.error(`Lỗi khi gửi request PATCH:`, updateError);
                                throw updateError;
                            }
                        }
                    }

                    if (remainingQuantity > 0) {
                        console.warn(`Không đủ số lượng cho sản phẩm ${productId}. Còn lại ${remainingQuantity} không thể giảm.`);
                    }
                } else {
                    console.warn(`Không tìm thấy chi tiết sản phẩm cho ID: ${productId}`);
                }
            }

            // Cập nhật lại thông tin số lượng trong state
            const updatedStockInfo = { ...productStockInfo };

            orderItems.forEach(item => {
                const productId = item.product._id;
                if (updatedStockInfo[productId] !== undefined) {
                    updatedStockInfo[productId] = Math.max(0, updatedStockInfo[productId] - item.quantity);
                    console.log(`Cập nhật state: Sản phẩm ${item.product.name} - Số lượng mới: ${updatedStockInfo[productId]}`);
                }
            });

            setProductStockInfo(updatedStockInfo);
            console.log("Hoàn thành cập nhật số lượng sản phẩm");

        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
            alert('Đơn hàng đã được tạo nhưng có lỗi khi cập nhật số lượng sản phẩm. Vui lòng kiểm tra lại.');
        }
    };

    const handleSaveDraft = async () => {
        if (orderItems.length === 0) {
            alert('Vui lòng thêm sản phẩm vào đơn hàng');
            return;
        }

        setIsSavingDraft(true);
        try {
            const response = await fetch(`/api/order?t=${Date.now()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employee_id: employee,
                    items: orderItems.map(item => ({
                        product_id: item.product._id,
                        quantity: item.quantity,
                        price: item.product.output_price
                    })),
                    total_amount: totalAmount,
                    payment_method: paymentMethod,
                    payment_status: false,
                    status: 'pending',
                    note: note
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể lưu đơn hàng');
            }

            alert('Đã lưu đơn hàng nháp thành công!');
            router.push('/home/order');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu đơn hàng nháp');
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-[1500px] mx-auto">
                    <div className="flex items-center h-16 px-5">
                        <Button
                            onClick={handleBack}
                            className="flex items-center justify-center w6 h-10 rounded-md bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                        >
                            <Image
                                src="/icons/chevron-left.svg"
                                alt="Back"
                                width={16}
                                height={16}
                                className="text-slate-500"
                            />
                        </Button>
                        <span className="ml-5 text-xl font-medium text-slate-900">Tạo đơn hàng</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1500px] mx-auto p-6">
                <div className="grid grid-cols-7 gap-6">
                    {/* Cột trái - Sản phẩm đã chọn */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[650px] flex flex-col">
                            <h2 className="text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/cart.svg"
                                    alt="cart"
                                    width={22}
                                    height={22}
                                    className="text-slate-700"
                                    priority
                                />
                                Sản phẩm đã chọn
                            </h2>

                            <style jsx global>{`
                                .custom-scrollbar::-webkit-scrollbar {
                                    width: 8px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                    background: #f1f5f9;
                                    border-radius: 10px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background: #cbd5e1;
                                    border-radius: 10px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background: #94a3b8;
                                }
                            `}</style>

                            {orderItems.length > 0 ? (
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
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
                                                <h3 className="font-medium text-base text-slate-900 truncate">{item.product.name}</h3>
                                                <div className="mt-1 text-sm text-slate-500">
                                                    {formatCurrency(item.product.output_price)}
                                                </div>
                                            </div>
                                            <div className="flex items-center border rounded-md overflow-hidden">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        if (item.quantity > 1) {
                                                            // Giảm số lượng sản phẩm nhưng không dưới 1
                                                            setOrderItems(prev =>
                                                                prev.map(i =>
                                                                    i.product._id === item.product._id
                                                                        ? { ...i, quantity: i.quantity - 1 }
                                                                        : i
                                                                )
                                                            );
                                                        } else {
                                                            // Xóa sản phẩm khỏi danh sách khi số lượng giảm về 0
                                                            setOrderItems(prev =>
                                                                prev.filter(i => i.product._id !== item.product._id)
                                                            );
                                                        }
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                                >
                                                    <Image
                                                        src="/icons/minus.svg"
                                                        alt="minus"
                                                        width={18}
                                                        height={18}
                                                        className="text-slate-600"
                                                    />
                                                </button>
                                                <div className="w-14 h-10 flex items-center justify-center border-l border-r text-sm text-black font-medium">
                                                    {item.quantity}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        // Tăng số lượng sản phẩm
                                                        setOrderItems(prev =>
                                                            prev.map(i => {
                                                                if (i.product._id === item.product._id) {
                                                                    const availableQuantity = productStockInfo[item.product._id] || 0;

                                                                    // Kiểm tra nếu số lượng sau khi tăng vượt quá số lượng đang bán
                                                                    if (i.quantity >= availableQuantity) {
                                                                        alert(`Sản phẩm "${item.product.name}" chỉ còn ${availableQuantity} sản phẩm đang bán!`);
                                                                        return i;
                                                                    }

                                                                    return { ...i, quantity: i.quantity + 1 };
                                                                }
                                                                return i;
                                                            })
                                                        );
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                                >
                                                    <Image
                                                        src="/icons/plus.svg"
                                                        alt="plus"
                                                        width={18}
                                                        height={18}
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
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[650px] flex flex-col">
                            <h2 className="text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/product.svg"
                                    alt="product"
                                    width={22}
                                    height={22}
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
                                        className="w-full h-11 px-4 pl-10 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-400 text-base text-slate-900 placeholder:text-slate-400"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <Image
                                            src="/icons/search.svg"
                                            alt="search"
                                            width={18}
                                            height={18}
                                            className="text-slate-400"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center justify-center h-full text-red-500">
                                        {error}
                                    </div>
                                ) : filteredProducts.length === 0 ? (
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
                                            <p className="text-slate-600 mb-3 text-[16px]">
                                                {searchTerm ? 'Không tìm thấy sản phẩm phù hợp' : 'Không có sản phẩm nào'}
                                            </p>
                                            {!searchTerm && (
                                                <button className="px-6 py-2.5 text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 text-[16px]">
                                                    Thêm sản phẩm
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <ProductList
                                        products={filteredProducts}
                                        onSelect={handleAddToOrder}
                                        productStockInfo={productStockInfo}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border-t border-slate-200">
                <div className="max-w-[1500px] mx-auto p-6">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2">
                            <h2 className="text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/order.svg"
                                    alt="payment"
                                    width={22}
                                    height={22}
                                    className="text-slate-700"
                                    priority
                                />
                                Thanh toán
                            </h2>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-700 text-[17px]">Tổng tiền hàng</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[17px]">{orderItems.length} sản phẩm</span>
                                        <span className="text-slate-900 font-medium text-[17px]">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-700 text-[17px]">Thêm giảm giá</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[17px]">---</span>
                                        <span className="text-slate-900 font-medium text-[17px]">0đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-700 text-[17px]">Thêm phí giao hàng</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[17px]">---</span>
                                        <span className="text-slate-900 font-medium text-[17px]">0đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="font-semibold text-slate-900 text-xl">Thành tiền</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-900 text-2xl font-semibold">
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
                                            {employeeName}
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
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="VD: Giao hàng trong giờ hành chính cho khách"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-h-[200px] resize-none text-[15px] leading-relaxed text-slate-700 placeholder:text-slate-400 transition-all duration-200"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
                <div className="max-w-[1500px] mx-auto px-6 py-5">
                    <div className="flex items-center justify-end gap-5">
                        <Button
                            onClick={handleSaveDraft}
                            isDisable={isSavingDraft}
                            className="px-7 py-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 font-medium text-[17px] text-slate-700 transition-all duration-200 hover:shadow-sm flex items-center gap-2"
                        >
                            <Image
                                src="/icons/save.svg"
                                alt="save"
                                width={20}
                                height={20}
                                className="text-slate-600"
                                priority
                            />
                            {isSavingDraft ? 'Đang lưu...' : 'Lưu nháp'}
                        </Button>
                        <Button
                            onClick={handleCreateOrder}
                            isDisable={isSubmitting}
                            className="h-12 px-7 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-500 rounded-lg font-medium text-[17px] text-slate-900 hover:text-blue-600 shadow-sm transition-all duration-200 flex items-center gap-2"
                        >
                            <Image
                                src="/icons/check.svg"
                                alt="check"
                                width={22}
                                height={22}
                                className="text-slate-900"
                                priority
                            />
                            {isSubmitting ? 'Đang xử lý...' : 'Tạo đơn hàng'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 