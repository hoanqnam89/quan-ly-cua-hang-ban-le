'use client';

import { IProduct } from '../interfaces/product.interface';
import { formatCurrency } from '@/utils/format-currency';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, EyeIcon } from '@heroicons/react/24/outline';
import { IProductDetail } from '../interfaces/product-detail.interface';

interface ProductGroupListProps {
    products: IProduct[];
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
    onViewDetail,
    productStockInfo = {}
}: ProductGroupListProps) {
    const [productDetails, setProductDetails] = useState<IProductDetail[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch('/api/product-detail');
                const data = await response.json();
                setProductDetails(data);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu chi tiết sản phẩm:', error);
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

    const handleViewDetails = (group: ProductGroup) => {
        setSelectedGroup(group);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedGroup(null);
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Sản phẩm
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Tồn kho
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                SL nhập
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                SL xuất
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedGroups
                            .filter(group => group.details.length > 0)
                            .map((group, idx) => (
                                <tr key={`${group.name}-${idx}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{group.name}</div>
                                                <div className="text-xs text-gray-500">{group.details.length} sản phẩm</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="text-sm text-gray-900">{group.totalStock}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="text-sm text-gray-900">{group.totalImport}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="text-sm text-gray-900">{group.totalExport}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetails(group)}
                                            className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                                        >
                                            <EyeIcon className="w-4 h-4 mr-1" />
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Modal xem chi tiết */}
            {isDetailModalOpen && selectedGroup && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black opacity-40" onClick={closeDetailModal}></div>
                        <div className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-4xl">
                            <button
                                onClick={closeDetailModal}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="p-6">
                                <div className="mb-6">
                                    <h2 className="text-base font-medium text-gray-900">{selectedGroup.name}</h2>
                                    <div className="flex gap-4 mt-2 bg-gray-50 p-3 rounded-lg">
                                        <div className="px-3 py-1 bg-blue-50 rounded-lg">
                                            <span className="text-sm text-gray-900">Tổng tồn kho: {selectedGroup.totalStock}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-green-50 rounded-lg">
                                            <span className="text-sm text-gray-900">Tổng nhập: {selectedGroup.totalImport}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-orange-50 rounded-lg">
                                            <span className="text-sm text-gray-900">Tổng xuất: {selectedGroup.totalExport}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Tồn kho
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    SL nhập
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    SL xuất
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Ngày SX
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                    Hạn SD
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedGroup.details.map((detail) => {
                                                const date = new Date(detail.expiry_date);
                                                const now = new Date();
                                                now.setHours(0, 0, 0, 0);
                                                const isExpired = date < now;
                                                const isExpiringSoon = date > now && Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= 30;

                                                let rowClass = "hover:bg-gray-50";
                                                if (isExpired) {
                                                    rowClass += " bg-red-50";
                                                } else if (isExpiringSoon) {
                                                    rowClass += " bg-yellow-50";
                                                }

                                                return (
                                                    <tr key={detail._id} className={rowClass}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                                            {detail.input_quantity - detail.output_quantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                                            {detail.input_quantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                                            {detail.output_quantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                                            {new Date(detail.date_of_manufacture).toLocaleDateString('vi-VN')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <div className="text-sm text-gray-900">
                                                                {new Date(detail.expiry_date).toLocaleDateString('vi-VN')}
                                                                {isExpired && (
                                                                    <span className="text-xs text-red-600 block">Đã hết hạn</span>
                                                                )}
                                                                {isExpiringSoon && !isExpired && (
                                                                    <span className="text-xs text-yellow-600 block">Sắp hết hạn</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 