'use client';

import { IProduct } from '../interfaces/product.interface';
import { formatCurrency } from '../utils/format-currency';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { IProductDetail } from '../interfaces/product-detail.interface';

interface ProductGroupListProps {
    products: IProduct[];
    onEdit?: (product: IProduct) => void;
    onDelete?: (product: IProduct) => void;
    onViewDetail?: (product: IProduct) => void;
    productStockInfo?: Record<string, number>;
}

interface ProductDetailInGroup extends IProductDetail {
    product: IProduct;
}

interface ProductGroup {
    name: string;
    details: ProductDetailInGroup[];
    totalStock: number;
    totalImport: number;
    totalExport: number;
}

export default function ProductGroupList({
    products,
    onEdit,
    onDelete,
    onViewDetail,
    productStockInfo = {}
}: ProductGroupListProps) {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [productDetails, setProductDetails] = useState<IProductDetail[]>([]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch('/api/product-detail');
                const data = await response.json();
                setProductDetails(data);
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        };

        fetchProductDetails();
    }, []);

    // Nhóm sản phẩm theo tên
    const groupedProducts = products.reduce((groups: Record<string, ProductGroup>, product) => {
        const groupName = product.name;
        if (!groups[groupName]) {
            groups[groupName] = {
                name: groupName,
                details: [],
                totalStock: 0,
                totalImport: 0,
                totalExport: 0
            };
        }

        const details = productDetails.filter(detail => detail.product_id === product._id);

        // Thêm từng chi tiết sản phẩm vào nhóm
        details.forEach(detail => {
            const detailWithProduct: ProductDetailInGroup = {
                ...detail,
                product: product
            };
            groups[groupName].details.push(detailWithProduct);
            groups[groupName].totalStock += (detail.input_quantity - detail.output_quantity);
            groups[groupName].totalImport += detail.input_quantity;
            groups[groupName].totalExport += detail.output_quantity;
        });

        return groups;
    }, {});

    // Sắp xếp các nhóm theo tên
    const sortedGroups = Object.values(groupedProducts).sort((a, b) => a.name.localeCompare(b.name));

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    return (
        <div className="space-y-4">
            {sortedGroups
                .filter(group => group.details.length > 0)
                .map((group) => (
                    <div key={group.name} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {/* Header của nhóm */}
                        <div
                            className="p-4 cursor-pointer hover:bg-slate-50 flex justify-between items-center"
                            onClick={() => toggleGroup(group.name)}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-slate-900">{group.name}</h3>
                                    <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                                        {group.details.length} sản phẩm
                                    </span>
                                </div>
                                <div className="flex gap-4 mt-2 text-sm text-slate-600">
                                    <span>Tồn kho: {group.totalStock}</span>
                                    <span>Nhập: {group.totalImport}</span>
                                    <span>Xuất: {group.totalExport}</span>
                                </div>
                            </div>
                            <div className="p-2">
                                {expandedGroups[group.name] ? (
                                    <ChevronUpIcon className="w-5 h-5 text-slate-400" />
                                ) : (
                                    <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                        </div>

                        {/* Danh sách sản phẩm trong nhóm */}
                        {expandedGroups[group.name] && (
                            <div className="border-t border-slate-200">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Mã sản phẩm
                                                </th> */}
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Giá bán
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tồn kho
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Đã nhập
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Đã xuất
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    NSX
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    HSD
                                                </th>
                                                <th scope="col" className="px-8 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Thao tác
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {group.details.map((detail) => (
                                                <tr key={detail._id} className="hover:bg-gray-50">
                                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {detail.product._id}
                                                    </td> */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatCurrency(detail.product.output_price)}
                                                    </td>
                                                    <td className="px-10 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {detail.input_quantity - detail.output_quantity}
                                                    </td>
                                                    <td className="px-10 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {detail.input_quantity}
                                                    </td>
                                                    <td className="px-10 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {detail.output_quantity}
                                                    </td>
                                                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(detail.date_of_manufacture).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(detail.expiry_date).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => onViewDetail?.(detail.product)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <EyeIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => onEdit?.(detail.product)}
                                                                className="text-amber-600 hover:text-amber-900"
                                                            >
                                                                <PencilIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => onDelete?.(detail.product)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
        </div>
    );
} 