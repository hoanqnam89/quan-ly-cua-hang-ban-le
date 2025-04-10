'use client';

import { Button } from '@/components';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProductList from '../../../components/ProductList';
import type { IProduct } from '../../../interfaces/product.interface';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/app/utils/format';
import { IProductDetail } from '@/interfaces/product-detail.interface';
import { generatePDF } from '@/app/utils/generatePDF';

interface OrderItem {
    product: IProduct;
    quantity: number;
    batchDetails?: {
        detailId: string;
        dateOfManufacture: Date | null;
        expiryDate: Date | null;
    };
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
    const [productStockInfo, setProductStockInfo] = useState<Record<string, Array<{
        quantity: number,
        expiryDate: Date | null,
        dateOfManufacture: Date | null,
        detailId: string
    }>>>({});
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

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

    // Lấy thông tin số lượng đang bán và hạn sử dụng của tất cả sản phẩm một lần duy nhất
    useEffect(() => {
        const fetchProductStockInfo = async () => {
            if (!products.length) return;

            try {
                const response = await fetch(`/api/product-detail?t=${Date.now()}`);
                if (response.ok) {
                    const allProductDetails: IProductDetail[] = await response.json();

                    // Group product details by product_id
                    const stockInfo: Record<string, Array<{
                        quantity: number,
                        expiryDate: Date | null,
                        dateOfManufacture: Date | null,
                        detailId: string
                    }>> = {};

                    allProductDetails.forEach(detail => {
                        if (!stockInfo[detail.product_id]) {
                            stockInfo[detail.product_id] = [];
                        }
                        
                        if (detail.output_quantity > 0) {
                            stockInfo[detail.product_id].push({
                                quantity: detail.output_quantity,
                                expiryDate: detail.expiry_date ? new Date(detail.expiry_date) : null,
                                dateOfManufacture: detail.date_of_manufacture ? new Date(detail.date_of_manufacture) : null,
                                detailId: detail._id
                            });
                        }
                    });

                    // Sort each product's details by manufacturing date
                    Object.keys(stockInfo).forEach(productId => {
                        stockInfo[productId].sort((a, b) => {
                            if (!a.dateOfManufacture || !b.dateOfManufacture) return 0;
                            return a.dateOfManufacture.getTime() - b.dateOfManufacture.getTime();
                        });
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

    const handleAddToOrder = (product: IProduct, detailId?: string) => {
        const stockDetails = productStockInfo[product._id] || [];
        const totalAvailableQuantity = stockDetails.reduce((sum, detail) => {
            // Tổng số lượng = số lượng đang bán trên quầy + số lượng tồn kho (input_quantity - output_quantity)
            return sum + detail.quantity;
        }, 0);

        if (totalAvailableQuantity === 0) {
            alert(`Sản phẩm "${product.name}" đã hết hàng!`);
            return;
        }

        // Tìm chi tiết lô hàng nếu có detailId
        const selectedBatch = detailId ? stockDetails.find(detail => detail.detailId === detailId) : null;

        setOrderItems((prev) => {
            const existingItem = prev.find((item) => {
                if (detailId) {
                    return item.product._id === product._id && item.batchDetails?.detailId === detailId;
                }
                return item.product._id === product._id;
            });

            if (existingItem) {
                // Kiểm tra số lượng có sẵn trong lô cụ thể nếu có
                if (detailId && selectedBatch) {
                    if (existingItem.quantity >= selectedBatch.quantity) {
                        alert(`Lô hàng này chỉ còn ${selectedBatch.quantity} sản phẩm!`);
                        return prev;
                    }
                } else if (existingItem.quantity >= totalAvailableQuantity) {
                    alert(`Sản phẩm "${product.name}" chỉ còn ${totalAvailableQuantity} sản phẩm có sẵn!`);
                    return prev;
                }

                return prev.map((item) => {
                    if (item === existingItem) {
                        return { ...item, quantity: item.quantity + 1 };
                    }
                    return item;
                });
            }

            // Thêm mới sản phẩm với thông tin lô nếu có
            const newItem: OrderItem = {
                product,
                quantity: 1,
                ...(selectedBatch && {
                    batchDetails: {
                        detailId: selectedBatch.detailId,
                        dateOfManufacture: selectedBatch.dateOfManufacture,
                        expiryDate: selectedBatch.expiryDate
                    }
                })
            };

            return [...prev, newItem];
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

            if (response.ok) {
                const orderData = await response.json();

                // Cập nhật số lượng sản phẩm đang bán và tổng kho
                await updateProductQuantities();

                // Tạo dữ liệu cho PDF
                const pdfData = {
                    orderId: orderData._id,
                    employeeName: employeeName,
                    items: orderItems.map(item => ({
                        product: {
                            name: item.product.name,
                            output_price: item.product.output_price
                        },
                        quantity: item.quantity
                    })),
                    totalAmount: totalAmount,
                    customerPayment: customerPayment,
                    changeAmount: changeAmount,
                    note: note
                };

                // Tạo và in PDF
                generatePDF(pdfData);

            router.push('/home/order');
            } else {
                throw new Error('Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Có lỗi xảy ra khi tạo đơn hàng');
        } finally {
            setIsSubmitting(false);
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

            // Cập nhật số lượng sản phẩm đang bán và tổng kho
            await updateProductQuantities();

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const searchContainer = document.getElementById('search-container');
            if (searchContainer && !searchContainer.contains(event.target as Node)) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Hàm cập nhật số lượng sản phẩm đang bán và tổng kho
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
                    // Chọn chi tiết sản phẩm đầu tiên để cập nhật
                    const detail = productDetailsMap[productId][0];
                    
                    // Tính toán số lượng cần giảm
                    const currentOutput = detail.output_quantity || 0;
                    const newOutput = currentOutput - quantityToDecrease;
                    
                    // Cập nhật cả số lượng trên quầy và tổng kho
                    const currentInput = detail.input_quantity || 0;
                    const newInput = currentInput - quantityToDecrease;
                  
                    // Cập nhật số lượng trong chi tiết sản phẩm
                    try {
                        const detailId = detail._id.toString();
                        console.log(`Gửi request PATCH đến /api/product-detail/${detailId}`);

                        const updateResponse = await fetch(`/api/product-detail/${detailId}?t=${Date.now()}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                output_quantity: newOutput,
                                input_quantity: newInput
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
                    } catch (updateError) {
                        console.error(`Lỗi khi gửi request PATCH:`, updateError);
                        throw updateError;
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
                    updatedStockInfo[productId] = updatedStockInfo[productId].map(detail => {
                        return { ...detail, quantity: Math.max(0, detail.quantity - item.quantity) };
                    }).filter(d => d.quantity > 0);
                    console.log(`Cập nhật state: Sản phẩm ${item.product.name} - Số lượng mới: ${updatedStockInfo[productId].length}`);
                }
            });

            setProductStockInfo(updatedStockInfo);
            console.log("Hoàn thành cập nhật số lượng sản phẩm");

        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
            alert('Đơn hàng đã được tạo nhưng có lỗi khi cập nhật số lượng sản phẩm. Vui lòng kiểm tra lại.');
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-[1500px] mx-auto">
                    <div className="flex items-center h-16 px-5">
                        <Button
                            onClick={handleBack}
                            className="flex items-center justify-center  h-10 rounded-md bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 shadow-sm w-[60px]"
                        >
                            <Image
                                src="/icons/chevron-left.svg"
                                alt="Back"
                                width={16}
                                height={16}
                                className="text-slate-500"
                            />
                        </Button>
                        <span className=" text-xl font-medium text-slate-900 flex items-center justify-center  transition-all  w-[200px] p-5">Tạo đơn hàng</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1500px] mx-auto p-6">
                <div className="grid grid-cols-7 gap-6">
                    {/* Cột trái - Sản phẩm đã chọn và tìm kiếm */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[710px] flex flex-col">
                            <div className="flex gap-3 mb-5">
                                <div id="search-container" className="w-full relative">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Tìm theo tên sản phẩm... (F3)"
                                            className="w-full h-12 px-4 pl-12 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base text-slate-900 placeholder:text-slate-400 transition-all duration-200"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            onFocus={() => setIsDropdownVisible(true)}
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Image
                                                src="/icons/search.svg"
                                                alt="search"
                                                width={20}
                                                height={20}
                                                className="text-slate-400"
                                                priority
                                            />
                                        </div>
                                    </div>

                                    {searchTerm && isDropdownVisible && (
                                        <div className="absolute z-50 left-0 right-0 mt-2">
                                            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                                                    {loading ? (
                                                        <div className="flex items-center justify-center p-6">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                        </div>
                                                    ) : error ? (
                                                        <div className="flex items-center justify-center p-6 text-red-500">
                                                            {error}
                                                        </div>
                                                    ) : filteredProducts.length === 0 ? (
                                                        <div className="flex items-center justify-center p-6">
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
                                                                    Không tìm thấy sản phẩm phù hợp
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="divide-y divide-slate-100">
                                                            {filteredProducts.map((product) => {
                                                                const stockDetails = productStockInfo[product._id] || [];
                                                                const totalQuantity = stockDetails.reduce((sum, detail) => sum + detail.quantity, 0);
                                                                
                                                                // Skip products with zero quantity
                                                                if (totalQuantity === 0) return null;
                                                                
                                                                return (
                                                                    <div key={product._id} className="p-4 hover:bg-slate-50 transition-colors">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-14 h-14 bg-slate-100 rounded-lg relative overflow-hidden flex-shrink-0">
                                                                                {product.image_links?.[0] ? (
                                                                                    <Image
                                                                                        src={product.image_links[0]}
                                                                                        alt={product.name}
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
                                                                                <h3 className="font-medium text-[15px] text-slate-900 truncate mb-1">
                                                                                    {product.name}
                                                                                </h3>
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="text-[15px] font-medium text-blue-600">
                                                                                        {formatCurrency(product.output_price)}
                                                                                    </span>
                                                                                    
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {stockDetails.length > 0 && (
                                                                            <div className="mt-3 grid gap-2">
                                                                                {stockDetails.map((detail) => (
                                                                                    // Skip individual batch entries with zero quantity
                                                                                    detail.quantity > 0 ? (
                                                                                    <div
                                                                                        key={detail.detailId}
                                                                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors group"
                                                                                    >
                                                                                        <div className="flex items-center gap-4">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                                                                                                    SL: {detail.quantity}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-3">
                                                                                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                                                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                                    </svg>
                                                                                                    NSX: {detail.dateOfManufacture ? new Date(detail.dateOfManufacture).toLocaleDateString('vi-VN') : 'Không có'}
                                                                                                </div>
                                                                                                <span className="text-slate-300">|</span>
                                                                                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                                                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                                    </svg>
                                                                                                    HSD: {detail.expiryDate ? new Date(detail.expiryDate).toLocaleDateString('vi-VN') : 'Không có'}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <button
                                                                                            className="px-3 py-1.5 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm whitespace-nowrap"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleAddToOrder(product, detail.detailId);
                                                                                                setIsDropdownVisible(false);
                                                                                            }}
                                                                                        >
                                                                                            Thêm vào giỏ
                                                                                        </button>
                                                                                    </div>
                                                                                    ) : null
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

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

                            {orderItems.length > 0 ? (
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                    {orderItems.map((item, index) => (
                                        <div
                                            key={`${item.product._id}-${item.batchDetails?.detailId || index}`}
                                            className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                                        >
                                            <div className="w-16 h-16 bg-slate-50 rounded-xl relative overflow-hidden flex-shrink-0">
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
                                                <h3 className="font-medium text-[15px] text-slate-900 truncate">
                                                    {item.product.name}
                                                </h3>
                                                {item.batchDetails && (
                                                    <div className="mt-1 space-y-1">
                                                        <div className="text-xs text-slate-500">
                                                            NSX: {item.batchDetails.dateOfManufacture ? new Date(item.batchDetails.dateOfManufacture).toLocaleDateString('vi-VN') : 'Không có'}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            HSD: {item.batchDetails.expiryDate ? new Date(item.batchDetails.expiryDate).toLocaleDateString('vi-VN') : 'Không có'}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="mt-1 text-sm text-slate-500">
                                                    {formatCurrency(item.product.output_price)}
                                                </div>
                                            </div>
                                            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        if (item.quantity > 1) {
                                                            setOrderItems(prev =>
                                                                prev.map(i =>
                                                                    i === item
                                                                        ? { ...i, quantity: i.quantity - 1 }
                                                                        : i
                                                                )
                                                            );
                                                        } else {
                                                            setOrderItems(prev =>
                                                                prev.filter(i => i !== item)
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
                                                <div className="w-14 h-10 flex items-center justify-center border-l border-r border-slate-200 text-sm text-black font-medium">
                                                    {item.quantity}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const stockDetails = productStockInfo[item.product._id] || [];
                                                        
                                                        if (item.batchDetails) {
                                                            const batch = stockDetails.find(d => d.detailId === item.batchDetails?.detailId);
                                                            if (batch && item.quantity >= batch.quantity) {
                                                                alert(`Lô hàng này chỉ còn ${batch.quantity} sản phẩm!`);
                                                                return;
                                                            }
                                                        } else {
                                                            const totalAvailable = stockDetails.reduce((sum, detail) => sum + detail.quantity, 0);
                                                            if (item.quantity >= totalAvailable) {
                                                                alert(`Sản phẩm "${item.product.name}" chỉ còn ${totalAvailable} sản phẩm có sẵn!`);
                                                                return;
                                                            }
                                                        }

                                                        setOrderItems(prev =>
                                                            prev.map(i =>
                                                                i === item
                                                                    ? { ...i, quantity: i.quantity + 1 }
                                                                    : i
                                                            )
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
                                                        prev.filter((i) => i !== item)
                                                    )
                                                }
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
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

                    {/* Cột phải - Thanh toán */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[710px] flex flex-col">
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
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-700 text-[16px]">Tổng tiền hàng</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[16px]">{orderItems.length} sản phẩm</span>
                                        <span className="text-slate-900 font-medium text-[16px]">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-700 text-[16px]">Giảm giá</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[16px]">---</span>
                                        <span className="text-slate-900 font-medium text-[16px]">0đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-700 text-[16px]">Phí giao hàng</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[16px]">---</span>
                                        <span className="text-slate-900 font-medium text-[16px]">0đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="font-semibold text-slate-900 text-xl">Thành tiền</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-900 text-2xl font-semibold">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Phần thanh toán */}
                                <div className="mt-4 bg-white border border-slate-200 rounded-xl shadow-sm">                           
                                    <div className="border-t border-slate-200 bg-slate-50 p-5 rounded-b-xl space-y-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                                <label className="block text-sm text-slate-600 mb-1.5">
                                                Hình thức thanh toán
                                            </label>
                                            <select
                                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                                                value={paymentMethod}
                                                onChange={handlePaymentChange}
                                            >
                                                <option value="cash">{paymentMethod === 'cash' ? displayPaymentText : 'Thanh toán tiền mặt'}</option>
                                                <option value="transfer">{paymentMethod === 'transfer' ? displayPaymentText : 'Thanh toán chuyển khoản'}</option>
                                                <option value="card">{paymentMethod === 'card' ? displayPaymentText : 'Thanh toán qua thẻ'}</option>
                                            </select>
                                        </div>
                                        <div>
                                                <label className="block text-sm text-slate-600 mb-1.5">
                                                Số tiền khách đưa
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                                                    value={customerPayment}
                                                    onChange={handlePaymentAmountChange}
                                                    placeholder="0"
                                                />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    đ
                                                </span>
                                            </div>
                                        </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-slate-600 mb-1.5">
                                                Số tiền phải trả
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-green-600"
                                                    value={changeAmount}
                                                    readOnly
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                                                    đ
                                                </span>
                            </div>
                        </div>

                                <div>
                                            <label className="block text-sm text-slate-600 mb-1.5">
                                        Nhân viên phụ trách
                                    </label>
                                    <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full px-2.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                                                    value={employeeName}
                                                    readOnly
                                                />
                                </div>
                            </div>

                                        <div>
                                            <label className="block text-sm text-slate-600 mb-1.5">
                                    Ghi chú
                                            </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="VD: Giao hàng trong giờ hành chính cho khách"
                                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-none text-slate-900 placeholder:text-slate-400"
                                ></textarea>
                                        </div>
                                    </div>
                                </div>
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