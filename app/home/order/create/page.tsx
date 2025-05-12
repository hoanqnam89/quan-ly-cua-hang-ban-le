'use client';

import { Button } from '@/components';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { IProduct } from '@/interfaces/product.interface';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/utils/format';
import { IProductDetail } from '@/interfaces/product-detail.interface';
import { generatePDF } from '@/utils/generatePDF';
import BarcodeScanner from '@/components/barcode-scanner';
import { generateBatchNumber } from '@/utils/batch-number';
import { Modal } from '@/components';

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
    const [showMomoQR, setShowMomoQR] = useState<boolean>(false);

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

                        if (detail.inventory > 0) {
                            stockInfo[detail.product_id].push({
                                quantity: detail.inventory,
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
                setShowMomoQR(false);
                break;
            case 'transfer':
                setDisplayPaymentText('Chuyển khoản ngân hàng');
                setShowMomoQR(true);
                break;
            default:
                setDisplayPaymentText('Thanh toán tiền mặt');
                setShowMomoQR(false);
        }
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

            // Removing the product quantity update for draft orders
            // await updateProductQuantities();

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
        setIsDropdownVisible(true);
    };

    const handleProductFound = (productDetail: IProductDetail, product: any) => {
        // Tìm thấy sản phẩm qua barcode
        if (productDetail) {
            console.log('Tìm thấy thông tin sản phẩm chi tiết:', productDetail);

            // Tìm sản phẩm theo product_id từ productDetail
            const foundProduct = products.find(p => p._id === productDetail.product_id);

            if (foundProduct) {
                console.log('Tìm thấy sản phẩm:', foundProduct.name);
                handleAddToOrder(foundProduct, productDetail._id);
            } else {
                alert(`Không tìm thấy sản phẩm với mã: ${productDetail.batch_number}`);
            }
        } else {
            alert(`Không tìm thấy sản phẩm với mã vạch đã quét`);
        }
    };

    const handleBarcodeError = (message: string) => {
        // Hiển thị thông báo lỗi nếu cần
        console.error(message);
        alert(`Lỗi quét mã: ${message}`);
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
                const productId = orderItem.product._id;
                const quantityToDecrease = orderItem.quantity;
                const productName = orderItem.product?.name || `Sản phẩm #${productId}`;
                const batchDetailId = orderItem.batchDetails?.detailId;

                console.log(`Cập nhật sản phẩm ${productName} - ID: ${productId} - Số lượng: ${quantityToDecrease}`);

                if (productDetailsMap[productId] && productDetailsMap[productId].length > 0) {
                    const details = productDetailsMap[productId];
                    let remainingQuantity = quantityToDecrease;

                    // Nếu có thông tin lô cụ thể, ưu tiên cập nhật lô đó trước
                    if (batchDetailId) {
                        const selectedBatch = details.find(d => d._id.toString() === batchDetailId);
                        if (selectedBatch) {
                            const currentInput = selectedBatch.input_quantity || 0;
                            const currentOutput = selectedBatch.output_quantity || 0;
                            const currentInventory = currentInput - currentOutput;

                            // Số lượng có thể bán từ lô này
                            const decreaseAmount = Math.min(remainingQuantity, currentInventory);

                            if (decreaseAmount > 0) {
                                // Tăng output_quantity (số lượng đã bán)
                                const newOutput = currentOutput + decreaseAmount;

                                try {
                                    const detailId = selectedBatch._id.toString();
                                    console.log(`Cập nhật lô đã chọn ${detailId}:
                                        - Số lượng đã bán cũ: ${currentOutput}
                                        - Số lượng bán thêm: ${decreaseAmount}
                                        - Số lượng đã bán mới: ${newOutput}
                                        - Tồn kho mới: ${currentInput - newOutput}
                                    `);

                                    const updateResponse = await fetch(`/api/product-detail/${detailId}?t=${Date.now()}`, {
                                        method: 'PATCH',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            output_quantity: newOutput,
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
                    }

                    // Nếu vẫn còn số lượng cần trừ, xử lý các lô khác
                    if (remainingQuantity > 0) {
                        // Sắp xếp lô theo ngày sản xuất để lấy lô cũ nhất trước
                        const sortedDetails = details.sort((a, b) => {
                            const dateA = a.date_of_manufacture ? new Date(a.date_of_manufacture).getTime() : 0;
                            const dateB = b.date_of_manufacture ? new Date(b.date_of_manufacture).getTime() : 0;
                            return dateA - dateB;
                        });

                        // Process each product detail
                        for (const detail of sortedDetails) {
                            // Bỏ qua lô đã xử lý ở trên
                            if (batchDetailId && detail._id.toString() === batchDetailId) continue;

                            if (remainingQuantity <= 0) break;

                            const currentInput = detail.input_quantity || 0;
                            const currentOutput = detail.output_quantity || 0;
                            const currentInventory = currentInput - currentOutput;

                            // Số lượng có thể bán từ lô này
                            const decreaseAmount = Math.min(remainingQuantity, currentInventory);

                            if (decreaseAmount > 0) {
                                // Tăng output_quantity (số lượng đã bán)
                                const newOutput = currentOutput + decreaseAmount;

                                try {
                                    const detailId = detail._id.toString();
                                    console.log(`Cập nhật chi tiết sản phẩm ${detailId}:
                                        - Số lượng đã bán cũ: ${currentOutput}
                                        - Số lượng bán thêm: ${decreaseAmount}
                                        - Số lượng đã bán mới: ${newOutput}
                                        - Tồn kho mới: ${currentInput - newOutput}
                                    `);

                                    const updateResponse = await fetch(`/api/product-detail/${detailId}?t=${Date.now()}`, {
                                        method: 'PATCH',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            output_quantity: newOutput,
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

    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-[1500px] mx-auto">
                    <div className="flex items-center h-14 px-5">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleBack}
                                className="flex items-center gap-2 h-10 rounded-md bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 shadow-sm px-4 min-w-0 w-auto"
                            >
                                <Image
                                    src="/icons/chevron-left.svg"
                                    alt="Back"
                                    width={16}
                                    height={16}
                                    className="text-slate-500"
                                />
                                <span className="text-base text-slate-700 font-medium">Quay lại</span>
                            </Button>
                            <span className="ml-5 text-lg font-medium text-slate-900">Tạo đơn hàng</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1500px] mx-auto p-6">
                <div className="grid grid-cols-7 gap-6">
                    {/* Cột trái - Sản phẩm đã chọn và tìm kiếm */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[710px] flex flex-col">
                            <div className="flex flex-col mb-4 relative">
                                <h2 className="text-lg font-semibold mb-2">Quét mã vạch</h2>
                                <div className="flex items-center justify-between mb-3">
                                    <BarcodeScanner
                                        onProductFound={handleProductFound}
                                        onError={handleBarcodeError}
                                    />
                                </div>

                                <h2 className="text-lg font-semibold mb-2">Tìm kiếm sản phẩm</h2>
                                <div className="relative" id="search-container">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        placeholder="Tên sản phẩm..."
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        onFocus={() => setIsDropdownVisible(true)}
                                    />
                                    {isDropdownVisible && searchTerm.length > 0 && filteredProducts.length > 0 && (
                                        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg w-full max-h-80 overflow-y-auto">
                                            {filteredProducts.map(product => {
                                                // Lấy thông tin tồn kho của sản phẩm
                                                const stockDetails = productStockInfo[product._id] || [];
                                                const totalStock = stockDetails.reduce((sum, detail) => sum + detail.quantity, 0);

                                                // Nếu không có tồn kho, không hiển thị sản phẩm
                                                if (totalStock <= 0) return null;

                                                // Nếu chỉ có một lô sản phẩm
                                                if (stockDetails.length === 1) {
                                                    const detail = stockDetails[0];
                                                    return (
                                                        <div
                                                            key={product._id}
                                                            className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-200"
                                                            onClick={() => {
                                                                handleAddToOrder(product, detail.detailId);
                                                                setSearchTerm('');
                                                                setIsDropdownVisible(false);
                                                            }}
                                                        >
                                                            <div className="font-semibold text-base text-slate-800">{product.name}</div>
                                                            <div className="flex justify-between mt-1">
                                                                <div className="text-sm text-gray-600 font-medium">Giá: {formatCurrency(product.output_price)}</div>
                                                                <div className="text-sm text-green-600 font-medium">SL: {detail.quantity}</div>
                                                            </div>
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                HSD: {detail.expiryDate ? new Date(detail.expiryDate).toLocaleDateString('vi-VN') : 'Không có'}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // Nếu có nhiều lô sản phẩm, hiển thị từng lô
                                                return (
                                                    <div key={product._id} className="border-b border-gray-200">
                                                        <div className="p-3 bg-blue-50">
                                                            <div className="font-semibold text-base text-slate-800">{product.name}</div>
                                                            <div className="flex justify-between mt-1">
                                                                <div className="text-sm text-gray-600 font-medium">Giá: {formatCurrency(product.output_price)}</div>
                                                                <div className="text-sm text-green-600 font-medium">Tổng: {totalStock}</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {stockDetails.map(detail => (
                                                                <div
                                                                    key={detail.detailId}
                                                                    className="p-3 hover:bg-blue-50 cursor-pointer border-t border-gray-100 pl-4"
                                                                    onClick={() => {
                                                                        handleAddToOrder(product, detail.detailId);
                                                                        setSearchTerm('');
                                                                        setIsDropdownVisible(false);
                                                                    }}
                                                                >
                                                                    <div className="flex justify-between">
                                                                        <div className="text-sm text-slate-700 font-medium">
                                                                            Lô: {new Date(detail.dateOfManufacture || '').toLocaleDateString('vi-VN')}
                                                                        </div>
                                                                        <div className="text-sm text-green-600 font-medium">SL: {detail.quantity}</div>
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 mt-1">
                                                                        HSD: {detail.expiryDate ? new Date(detail.expiryDate).toLocaleDateString('vi-VN') : 'Không có'}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
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
                                                    <option value="transfer">{paymentMethod === 'transfer' ? displayPaymentText : 'Chuyển khoản ngân hàng'}</option>

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

            {showMomoQR && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg mt-2 p-3">
                    <div className="text-center mb-2">
                        <p className="text-sm font-medium text-pink-700">Quét mã MoMo để thanh toán</p>
                        <p className="text-xs text-pink-600 mt-1">Số tiền: {formatCurrency(totalAmount)}</p>
                    </div>
                    <div className="flex justify-center">
                        <div className="bg-white p-3 rounded-lg border border-pink-200 shadow-sm">
                            <div className="w-48 h-48 relative">
                                <Image
                                    src="/images/qr_momo.jpg"
                                    alt="Mã QR MoMo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Image
                                src="/images/momo-logo.png"
                                alt="MoMo"
                                width={24}
                                height={24}
                                className="object-contain"
                            />
                            <p className="text-sm text-pink-700 font-medium">Võ Minh Anh</p>
                        </div>
                        <p className="text-xs text-pink-600">SĐT: <span className="font-medium">*******470</span></p>
                        <p className="text-xs text-pink-600 mt-1">Nội dung: <span className="font-medium">Thanh toan don hang</span></p>
                    </div>
                </div>
            )}
        </div>
    );
} 