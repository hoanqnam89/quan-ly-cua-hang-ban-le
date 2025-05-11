'use client';

import { IProduct } from '@/interfaces/product.interface';
import { formatCurrency } from '@/utils/format-currency';
import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon, EyeIcon } from '@heroicons/react/24/outline';
import { IProductDetail } from '@/interfaces/product-detail.interface';
import Table from '@/components/table/table';

interface ProductDetailInGroup extends Omit<IProductDetail, 'product'> {
  product: IProduct;
}

interface ProductGroup {
  name: string;
  details: ProductDetailInGroup[];
  totalStock: number;
  totalImport: number;
  totalExport: number;
}

// Định nghĩa type cho ProductGroup có _id
type ProductGroupWithId = ProductGroup & { _id: string };

function ProductDetail() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productDetails, setProductDetails] = useState<IProductDetail[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ProductGroup | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lowStock' | 'expiringSoon' | 'expired'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsResponse, detailsResponse] = await Promise.all([
          fetch('/api/product'),
          fetch('/api/product-detail')
        ]);

        const productsData = await productsResponse.json();
        const detailsData = await detailsResponse.json();

        setProducts(productsData);
        setProductDetails(detailsData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
      const detailWithProduct = {
        ...detail,
        product: product
      } as ProductDetailInGroup;

      groups[groupName].details.push(detailWithProduct);
      groups[groupName].totalStock += (detail.input_quantity - detail.output_quantity);
      groups[groupName].totalImport += detail.input_quantity;
      groups[groupName].totalExport += detail.output_quantity;
    });

    return groups;
  }, {});

  // Sắp xếp các nhóm theo tên
  let sortedGroups = Object.values(groupedProducts);
  if (sortConfig) {
    sortedGroups = [...sortedGroups].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof ProductGroup];
      let bValue: any = b[sortConfig.key as keyof ProductGroup];
      if (sortConfig.key === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      } else {
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
    });
  } else {
    sortedGroups = sortedGroups.sort((a, b) => a.name.localeCompare(b.name));
  }
  // Lọc các nhóm có chi tiết trước khi phân trang
  const filteredGroups = sortedGroups.filter(group => {
    // Tìm kiếm theo tên
    if (searchTerm && !group.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Lọc theo loại
    if (filterType === 'lowStock') {
      return group.totalStock > 0 && group.totalStock < 10;
    }
    if (filterType === 'expiringSoon') {
      // Có ít nhất 1 detail sắp hết hạn
      return group.details.some(detail => {
        const date = new Date(detail.expiry_date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return date > now && Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= 30;
      });
    }
    if (filterType === 'expired') {
      // Có ít nhất 1 detail đã hết hạn
      return group.details.some(detail => {
        const date = new Date(detail.expiry_date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return date < now;
      });
    }
    return group.details.length > 0;
  });
  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / itemsPerPage));
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewDetails = (group: ProductGroup) => {
    setSelectedGroup(group);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedGroup(null);
  };

  // Hàm render phân trang giống hình
  const renderPagination = () => {
    const maxVisiblePages = 5;
    let startPage = 1;
    let endPage = Math.min(totalPages, maxVisiblePages);
    if (currentPage > 3 && totalPages > maxVisiblePages) {
      startPage = Math.min(currentPage - 2, totalPages - maxVisiblePages + 1);
      endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
    }
    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    return (
      <div className="flex justify-center mt-4">
        <div className="inline-flex border border-gray-200 rounded-md overflow-hidden">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-gray-500 border-r border-gray-200 disabled:opacity-50 bg-white"
          >Đầu</button>
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border-r border-gray-200 ${currentPage === page
                ? 'text-blue-600 bg-blue-50 font-medium'
                : 'text-gray-500 hover:bg-gray-50 bg-white'} `}
            >{page}</button>
          ))}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-gray-500 disabled:opacity-50 bg-white"
          >Cuối</button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full px-6 py-5">
      <div className="flex flex-col w-full space-y-4">
        {/* Tiêu đề lớn */}
        <h1 className="text-2xl font-bold text-blue-800 mb-2 uppercase tracking-wide text-center">Báo cáo tồn kho sản phẩm</h1>
        {/* Bộ lọc và tìm kiếm */}
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm tên sản phẩm..."
            className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
          >
            <option value="all">Tất cả</option>
            <option value="lowStock">Tồn kho thấp (&lt; 10)</option>
            <option value="expiringSoon">Sắp hết hạn (&lt;= 30 ngày)</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg shadow-md">
                <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
                  <tr>
                    <th scope="col" className="px-4 py-4 text-center text-sm font-bold text-blue-700 uppercase tracking-wider border border-gray-300">#</th>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-blue-700 uppercase tracking-wider rounded-tl-lg border border-gray-300 cursor-pointer select-none"
                      onClick={() => {
                        setSortConfig(prev => {
                          if (prev?.key === 'name') {
                            return { key: 'name', direction: prev.direction === 'asc' ? 'desc' : 'asc' };
                          }
                          return { key: 'name', direction: 'asc' };
                        });
                      }}
                    >
                      Tên sản phẩm
                      {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-blue-700 uppercase tracking-wider border border-gray-300 cursor-pointer select-none"
                      onClick={() => {
                        setSortConfig(prev => {
                          if (prev?.key === 'totalStock') {
                            return { key: 'totalStock', direction: prev.direction === 'asc' ? 'desc' : 'asc' };
                          }
                          return { key: 'totalStock', direction: 'asc' };
                        });
                      }}
                    >
                      Số lượng tồn kho
                      {sortConfig?.key === 'totalStock' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-blue-700 uppercase tracking-wider border border-gray-300 cursor-pointer select-none"
                      onClick={() => {
                        setSortConfig(prev => {
                          if (prev?.key === 'totalImport') {
                            return { key: 'totalImport', direction: prev.direction === 'asc' ? 'desc' : 'asc' };
                          }
                          return { key: 'totalImport', direction: 'asc' };
                        });
                      }}
                    >
                      Số lượng nhập
                      {sortConfig?.key === 'totalImport' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-blue-700 uppercase tracking-wider border border-gray-300 cursor-pointer select-none"
                      onClick={() => {
                        setSortConfig(prev => {
                          if (prev?.key === 'totalExport') {
                            return { key: 'totalExport', direction: prev.direction === 'asc' ? 'desc' : 'asc' };
                          }
                          return { key: 'totalExport', direction: 'asc' };
                        });
                      }}
                    >
                      Số lượng xuất
                      {sortConfig?.key === 'totalExport' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-blue-700 uppercase tracking-wider rounded-tr-lg border border-gray-300">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedGroups.map((group, idx) => {
                    // Tô màu nếu tồn kho thấp
                    const isLowStock = group.totalStock < 10;
                    let rowClass = "hover:bg-blue-50 transition-all duration-150";
                    if (isLowStock) rowClass += " bg-yellow-50";
                    return (
                      <tr key={`${group.name}-${idx}`} className={rowClass}>
                        <td className="px-4 py-4 whitespace-nowrap text-center border border-gray-300 font-semibold">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border border-gray-300">
                          <div className="flex items-center">
                            <div>
                              <div className="text-lg font-semibold text-gray-900">{group.name}</div>
                              <div className="text-lg text-gray-500">{group.details.length} sản phẩm</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center border border-gray-300">
                          <span className={`text-base font-bold ${isLowStock ? 'text-yellow-600' : 'text-gray-900'}`}>{group.totalStock}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center border border-gray-300">
                          <span className="text-base text-green-700 font-semibold">{group.totalImport}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center border border-gray-300">
                          <span className="text-base text-orange-700 font-semibold">{group.totalExport}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium border border-gray-300">
                          <button
                            onClick={() => handleViewDetails(group)}
                            className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-semibold rounded-lg text-blue-700 bg-white hover:bg-blue-600 hover:text-white shadow transition-all duration-150"
                          >
                            <EyeIcon className="w-5 h-5 mr-2" />
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
        {/* Modal xem chi tiết giữ nguyên */}
        {isDetailModalOpen && selectedGroup && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black opacity-40" onClick={closeDetailModal}></div>
              <div className="relative bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl border border-gray-200">
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
                    <h2 className="text-2xl text-center font-bold text-blue-800">{selectedGroup?.name}</h2>
                    <div className="flex gap-4 mt-2 bg-blue-50 p-3 rounded-lg">
                      <div className="px-3 py-1 bg-blue-100 rounded-lg">
                        <span className="text-lg text-blue-900 font-semibold">Tổng tồn kho: {selectedGroup?.totalStock}</span>
                      </div>
                      <div className="px-3 py-1 bg-green-100 rounded-lg">
                        <span className="text-lg text-green-900 font-semibold">Tổng nhập: {selectedGroup?.totalImport}</span>
                      </div>
                      <div className="px-3 py-1 bg-orange-100 rounded-lg">
                        <span className="text-lg text-orange-900 font-semibold">Tổng xuất: {selectedGroup?.totalExport}</span>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg shadow">
                      <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-center text-lg font-bold text-blue-700 uppercase tracking-wider rounded-tl-lg">
                            Tồn kho
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-lg font-bold text-blue-700 uppercase tracking-wider">
                            SL nhập
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-lg font-bold text-blue-700 uppercase tracking-wider">
                            SL xuất
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-lg font-bold text-blue-700 uppercase tracking-wider">
                            Ngày SX
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-lg font-bold text-blue-700 uppercase tracking-wider rounded-tr-lg">
                            Hạn SD
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedGroup?.details.map((detail) => {
                          const date = new Date(detail.expiry_date);
                          const now = new Date();
                          now.setHours(0, 0, 0, 0);
                          const isExpired = date < now;
                          const isExpiringSoon = date > now && Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= 30;
                          const isLowStock = (detail.input_quantity - detail.output_quantity) < 10;

                          let rowClass = "hover:bg-blue-50 transition-all duration-150";
                          if (isExpired) {
                            rowClass += " bg-red-100";
                          } else if (isExpiringSoon) {
                            rowClass += " bg-yellow-100";
                          } else if (isLowStock) {
                            rowClass += " bg-yellow-50";
                          }

                          return (
                            <tr key={detail._id} className={rowClass}>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-base font-bold text-gray-900">
                                {detail.input_quantity - detail.output_quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-base text-green-700 font-semibold">
                                {detail.input_quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-base text-orange-700 font-semibold">
                                {detail.output_quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                {new Date(detail.date_of_manufacture).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="text-sm text-gray-900">
                                  {new Date(detail.expiry_date).toLocaleDateString('vi-VN')}
                                  {isExpired && (
                                    <span className="text-xs text-red-600 block font-bold">Đã hết hạn</span>
                                  )}
                                  {isExpiringSoon && !isExpired && (
                                    <span className="text-xs text-yellow-700 block font-bold">Sắp hết hạn</span>
                                  )}
                                  {isLowStock && !isExpired && !isExpiringSoon && (
                                    <span className="text-xs text-yellow-600 block font-bold">Tồn kho thấp</span>
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
    </div>
  );
}

export default ProductDetail;