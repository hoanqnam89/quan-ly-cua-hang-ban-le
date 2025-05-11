"use client";
import React, { useEffect, useState } from 'react';
import { ECollectionNames } from '@/enums/collection-names.enum';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import CustomNotification, { ENotificationType } from '@/components/notify/notification/notification';

interface IWarehouseProductDetail {
    _id: string;
    unit_id: string;
    quantity: number;
    note?: string;
    input_price?: number;
    date_of_manufacture?: string;
    expiry_date?: string;
    batch_number?: string;
    barcode?: string;
    name?: string; // tên sản phẩm
}

interface IWarehouseReceipt {
    _id: string;
    supplier_id: string;
    supplier_receipt_id: string;
    created_at: string;
    updated_at: string;
    product_details: IWarehouseProductDetail[];
    receipt_code: string;
    status?: string; // Đang chờ, Đang đổi hàng, Hoàn thành
}

interface IProduct {
    _id: string;
    name: string;
    supplier_id: string;
}

interface IUnit {
    _id: string;
    name: string;
}

const STATUS = {
    PENDING: 'Đang chờ',
    EXCHANGING: 'Đang đổi hàng',
    COMPLETED: 'Hoàn thành',
};

// Modal đổi hàng
function ExchangeModal({
    open,
    onClose,
    onSubmit,
    products,
    supplierId,
    units
}: {
    open: boolean,
    onClose: () => void,
    onSubmit: (data: { productId: string, quantity: number, inputPrice: number, unitId: string, dateOfManufacture: string, expiryDate: string, note: string }) => void,
    products: IProduct[],
    supplierId: string,
    units: IUnit[]
}) {
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [inputPrice, setInputPrice] = useState(0);
    const [inputPriceDisplay, setInputPriceDisplay] = useState('0');
    const [unitId, setUnitId] = useState('');
    const [dateOfManufacture, setDateOfManufacture] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        setProductId('');
        setQuantity(1);
        setInputPrice(0);
        setInputPriceDisplay('0');
        setUnitId('');
        setDateOfManufacture('');
        setExpiryDate('');
        setNote('');
    }, [open]);

    const handleInputPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        const num = Number(raw);
        setInputPrice(num);
        setInputPriceDisplay(num.toLocaleString('vi-VN'));
    };

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[480px] max-w-[96vw] w-[480px] border-2 border-blue-200">
                <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Nhập thông tin hàng đổi</h2>
                <div className="mb-5">
                    <label className="block mb-2 font-semibold text-lg">Chọn sản phẩm</label>
                    <select
                        className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={productId}
                        onChange={e => setProductId(e.target.value)}
                    >
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-5">
                    <label className="block mb-2 font-semibold text-lg">Đơn vị tính</label>
                    <select
                        className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={unitId}
                        onChange={e => setUnitId(e.target.value)}
                    >
                        <option value="">-- Chọn đơn vị --</option>
                        {units.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-5">
                    <label className="block mb-2 font-semibold text-lg">Số lượng</label>
                    <input
                        type="number"
                        min={1}
                        className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                    />
                </div>
                <div className="mb-5">
                    <label className="block mb-2 font-semibold text-lg">Giá nhập</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={inputPriceDisplay}
                        onChange={handleInputPriceChange}
                    />
                </div>
                <div className="mb-5">
                    <label className="block mb-2 font-semibold text-lg">Ngày sản xuất</label>
                    <input
                        type="date"
                        className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={dateOfManufacture}
                        onChange={e => setDateOfManufacture(e.target.value)}
                    />
                </div>
                <div className="mb-5">
                    <label className="block mb-2 font-semibold text-lg">Hạn sử dụng</label>
                    <input
                        type="date"
                        className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={expiryDate}
                        onChange={e => setExpiryDate(e.target.value)}
                    />
                </div>
                <div className="mb-5">
                    <label className="block mb-2 font-semibold text-lg">Ghi chú</label>
                    <textarea
                        className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={2}
                    />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-lg"
                        onClick={onClose}
                    >Hủy</button>
                    <button
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-lg shadow"
                        onClick={() => productId && quantity > 0 && unitId && onSubmit({ productId, quantity, inputPrice, unitId, dateOfManufacture, expiryDate, note })}
                        disabled={!productId || quantity <= 0 || !unitId}
                    >Đổi hàng OK</button>
                </div>
            </div>
        </div>
    );
}

export default function ReturnExchangePage(): React.ReactElement {
    const [search, setSearch] = useState('');
    const [receipts, setReceipts] = useState<IWarehouseReceipt[]>([]);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [savedRows, setSavedRows] = useState<{ [key: string]: boolean }>({});
    const [notification, setNotification] = useState<{
        type: ENotificationType,
        message: string
    } | null>(null);
    const [rowStatus, setRowStatus] = useState<{ [key: string]: string }>({});
    const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
    const [exchangeSupplierId, setExchangeSupplierId] = useState<string>('');
    const [exchangeProducts, setExchangeProducts] = useState<IProduct[]>([]);
    const [exchangeSelectedIds, setExchangeSelectedIds] = useState<string[]>([]);
    const [units, setUnits] = useState<IUnit[]>([]);

    // Lấy danh sách phiếu nhập kho và sản phẩm
    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchGetCollections<IWarehouseReceipt>(ECollectionNames.WAREHOUSE_RECEIPT),
            fetchGetCollections<IProduct>(ECollectionNames.PRODUCT),
            fetchGetCollections<IUnit>(ECollectionNames.UNIT)
        ])
            .then(([receiptData, productData, unitData]) => {
                setReceipts(receiptData);
                setProducts(productData);
                setUnits(unitData);
            })
            .finally(() => setLoading(false));
    }, []);

    // Lấy tên sản phẩm từ id
    const getProductName = (id?: string) => {
        if (!id) return "";
        const found = products.find(p => p._id === id);
        return found ? found.name : id;
    };

    // Tìm kiếm receipt_code chính xác
    const foundReceipt = search.trim() !== '' ? receipts.find(r => r.receipt_code?.toLowerCase() === search.trim().toLowerCase()) : undefined;

    // Lọc tất cả sản phẩm từ các phiếu nhập kho, gắn receipt_code và ngày nhập
    const allRows = receipts.flatMap(receipt =>
        receipt.product_details.map(detail => ({
            ...detail,
            receipt_code: receipt.receipt_code,
            created_at: receipt.created_at,
            receipt_id: receipt._id
        }))
    ).filter(row =>
        row.receipt_code?.toLowerCase().includes(search.toLowerCase())
        || getProductName(row._id).toLowerCase().includes(search.toLowerCase())
        || (row.batch_number || "").toLowerCase().includes(search.toLowerCase())
    );

    // Chọn checkbox
    const handleCheck = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Đổi hàng
    const handleExchange = async () => {
        if (!foundReceipt) return;
        const supplierId = foundReceipt.supplier_id;
        // Lọc sản phẩm cùng nhà cung cấp
        const filteredProducts = products.filter(p => p.supplier_id === supplierId);
        setExchangeSupplierId(supplierId);
        setExchangeProducts(filteredProducts);
        setExchangeSelectedIds(selectedIds);
        // Đổi trạng thái ngay khi nhấn Đổi hàng
        setRowStatus(prev => {
            const updated = { ...prev };
            foundReceipt.product_details.forEach((row, idx) => {
                const rowId = foundReceipt._id + '-' + row._id + '-' + idx;
                if (selectedIds.includes(rowId)) updated[rowId] = STATUS.EXCHANGING;
            });
            return updated;
        });
        setExchangeModalOpen(true);
    };

    // Xác nhận đổi hàng trong modal
    const handleExchangeSubmit = async ({ productId, quantity, inputPrice, unitId, dateOfManufacture, expiryDate, note }: { productId: string, quantity: number, inputPrice: number, unitId: string, dateOfManufacture: string, expiryDate: string, note: string }) => {
        if (!foundReceipt) return;
        try {
            const res = await fetch('/api/return-exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receipt_id: foundReceipt._id,
                    product_details: foundReceipt.product_details.filter((row, idx) => exchangeSelectedIds.includes(foundReceipt._id + '-' + row._id + '-' + idx)),
                    action: 'exchange',
                    exchange_product: {
                        product_id: productId,
                        quantity,
                        input_price: inputPrice,
                        unit_id: unitId,
                        date_of_manufacture: dateOfManufacture,
                        expiry_date: expiryDate,
                        note
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                setNotification({ type: ENotificationType.SUCCESS, message: 'Đổi hàng thành công!' });
                setRowStatus(prev => {
                    const updated = { ...prev };
                    foundReceipt.product_details.forEach((row, idx) => {
                        const rowId = foundReceipt._id + '-' + row._id + '-' + idx;
                        if (exchangeSelectedIds.includes(rowId)) updated[rowId] = STATUS.EXCHANGING;
                    });
                    return updated;
                });
            } else {
                setNotification({ type: ENotificationType.ERROR, message: 'Đổi hàng thất bại!' });
            }
        } catch (err) {
            setNotification({ type: ENotificationType.ERROR, message: 'Có lỗi khi đổi hàng!' });
        }
        setExchangeModalOpen(false);
        setSelectedIds([]);
    };

    // Trả hàng
    const handleReturn = async () => {
        if (!foundReceipt) return;
        try {
            const res = await fetch('/api/return-exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receipt_id: foundReceipt._id,
                    product_details: foundReceipt.product_details.filter((row, idx) => selectedIds.includes(foundReceipt._id + '-' + row._id + '-' + idx)),
                    action: 'return',
                })
            });
            const data = await res.json();
            if (data.success) {
                setNotification({ type: ENotificationType.SUCCESS, message: 'Lưu trả hàng thành công!' });
                setRowStatus(prev => {
                    const updated = { ...prev };
                    foundReceipt.product_details.forEach((row, idx) => {
                        const rowId = foundReceipt._id + '-' + row._id + '-' + idx;
                        if (selectedIds.includes(rowId)) updated[rowId] = 'Đã trả hàng';
                    });
                    return updated;
                });
            } else {
                setNotification({ type: ENotificationType.ERROR, message: 'Lưu trả hàng thất bại!' });
            }
        } catch (err) {
            setNotification({ type: ENotificationType.ERROR, message: 'Có lỗi khi lưu trả hàng!' });
        }
        setSelectedIds([]);
    };

    // Xử lý nút Save
    const handleSave = (rowId: string) => {
        setSavedRows(prev => ({ ...prev, [rowId]: true }));
        setTimeout(() => setSavedRows(prev => ({ ...prev, [rowId]: false })), 1500);
    };

    return (
        <div className="h-lvh flex flex-col gap-4 p-4 bg-[#fff]">
            <h1 className="text-3xl font-bold text-[#f14254] mb-4">Quản lý đổi/ trả hàng</h1>

            {/* Step 1 */}
            <div className="mb-6">

                <div className="mb-4 flex items-center">
                    <div className="bg-[#fffdae] px-3 py-2 rounded-md font-medium">Thanh tìm kiếm:</div>
                    <input
                        type="text"
                        placeholder="Nhập mã phiếu nhập kho (receipt_code) để tìm kiếm"
                        className="ml-2 px-4 py-2 border rounded-md w-96 bg-[#ffecf2] focus:outline-none focus:ring-2 focus:ring-pink-300"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {search.trim() === '' ? null : loading ? (
                    <div className="text-center py-6 text-gray-500">
                        <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
                        Đang tải...
                    </div>
                ) : foundReceipt ? (
                    <>
                        {/* Thông tin phiếu nhập kho */}
                        <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-gray-500 mb-1">Mã phiếu nhập kho:</div>
                                    <div className="text-blue-600 font-bold text-lg">{foundReceipt.receipt_code}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 mb-1">Ngày tạo phiếu:</div>
                                    <div className="font-medium">{new Date(foundReceipt.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 mb-1">Số sản phẩm:</div>
                                    <div className="font-medium">{foundReceipt.product_details.length}</div>
                                </div>
                            </div>
                        </div>

                        {/* Bảng sản phẩm */}
                        <div className="overflow-x-auto rounded-lg shadow mb-5">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-center w-12">
                                            <input type="checkbox" disabled className="rounded border-gray-300 text-blue-600" />
                                        </th>
                                        <th className="px-4 py-3 text-left text-lg font-medium text-gray-600">Số lô</th>
                                        <th className="px-4 py-3 text-left text-lg font-medium text-gray-600">Mã phiếu nhập</th>
                                        <th className="px-4 py-3 text-left text-lg font-medium text-gray-600">Sản phẩm</th>
                                        <th className="px-4 py-3 text-center text-lg font-medium text-gray-600">Số lượng</th>
                                        <th className="px-4 py-3 text-center text-lg font-medium text-gray-600">Tổng tiền</th>
                                        <th className="px-4 py-3 text-center text-lg font-medium text-gray-600">Ngày nhập hàng</th>
                                        <th className="px-4 py-3 text-center text-lg font-medium text-gray-600">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {foundReceipt.product_details.map((row, idx) => {
                                        const rowId = foundReceipt._id + '-' + row._id + '-' + idx;
                                        const status = rowStatus[rowId] || STATUS.PENDING;
                                        return (
                                            <tr key={rowId} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(rowId)}
                                                        onChange={() => handleCheck(rowId)}
                                                        disabled={status === STATUS.COMPLETED}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-lg text-gray-900">{row.batch_number || '-'}</td>
                                                <td className="px-4 py-3 text-lg text-gray-900">{foundReceipt.receipt_code}</td>
                                                <td className="px-4 py-3 text-lg text-gray-900 font-medium">{getProductName(row._id)}</td>
                                                <td className="px-4 py-3 text-lg text-gray-900 text-center">{row.quantity}</td>
                                                <td className="px-4 py-3 text-lg text-gray-900 text-center">{row.input_price ? (row.input_price * row.quantity).toLocaleString() : '-'}</td>
                                                <td className="px-4 py-3 text-lg text-center">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-lg font-medium">
                                                        {foundReceipt.created_at ? new Date(foundReceipt.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center">
                                                    {status === STATUS.PENDING && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-lg">Đang chờ</span>
                                                    )}
                                                    {status === STATUS.EXCHANGING && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-lg">Đang đổi hàng</span>
                                                    )}
                                                    {status === STATUS.COMPLETED && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-lg">Hoàn thành</span>
                                                    )}
                                                    {status === 'Đã trả hàng' && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-lg">Đã trả hàng</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6 text-red-500 bg-red-50 rounded-lg border border-red-200">
                        Không tìm thấy phiếu nhập kho với mã này!
                    </div>
                )}
                <div className="flex gap-4 mt-6">
                    <button
                        className="bg-[#4caf50] text-white px-6 py-2 rounded-md font-medium hover:bg-[#43a047] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
                        onClick={handleExchange}
                        disabled={selectedIds.length === 0}
                    >
                        Đổi hàng
                    </button>
                    <button
                        className="bg-[#ffeb3b] text-black px-6 py-2 rounded-md font-medium hover:bg-[#fdd835] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all"
                        onClick={handleReturn}
                        disabled={selectedIds.length === 0}
                    >
                        Trả hàng
                    </button>
                </div>

                <div className="mt-8">
                    <div className="bg-[#ff9800] text-white px-4 py-2 rounded-l-full font-bold inline-block">
                        Có 3 trạng thái của đổi hàng
                    </div>
                    <ul className="mt-3 ml-6 space-y-1 text-lg list-disc">
                        <li><span className="font-medium">Đang chờ</span> (chưa click vào ô đầu và chưa nhấn vào nút đổi/ trả hàng)</li>
                        <li><span className="font-medium">Đang đổi hàng</span> (đã click vào ô đầu và đã bấm vào nút "Đổi hàng")</li>
                        <li><span className="font-medium">Hoàn thành</span> (hàng được đổi đã về kho và đã nhập kho sẽ là hoàn thành)</li>
                    </ul>
                </div>
                <div className="mt-4 text-lglg text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <p className="font-bold text-gray-800 mb-1">Lưu ý:</p>
                    <p>Đối với trả hàng, chỉ có 2 trạng thái là <span className="font-medium">Đang chờ</span> và <span className="font-medium">Hoàn thành</span>.</p>
                    <p>Khi nhấn vào nút <span className="text-yellow-600 font-medium">Trả hàng</span> thì hệ thống sẽ tự động trừ đi số lượng trong kho (tuy đổi hàng về sẽ nhập lại, còn trả thì trừ luôn số lượng đó).</p>
                </div>
                <div className="mt-4 text-blue-600 text-lg bg-blue-50 p-4 rounded-lg">
                    <p>→ Khi nhấn vào nút đổi hàng hoặc nút trả hàng thì hệ thống sẽ tự động trừ đi số lượng trong kho của những đơn này.)</p>
                </div>
            </div>

            <ExchangeModal
                open={exchangeModalOpen}
                onClose={() => setExchangeModalOpen(false)}
                onSubmit={handleExchangeSubmit}
                products={exchangeProducts}
                supplierId={exchangeSupplierId}
                units={units}
            />

            {notification && (
                <CustomNotification
                    type={notification.type}
                    onDelete={() => setNotification(null)}
                    isAutoClose={true}
                >
                    {notification.message}
                </CustomNotification>
            )}
        </div>
    );
} 