'use client';

import { Button, IconContainer, NumberInput, SelectDropdown, Text } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { infoIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import { IProduct } from '@/interfaces/product.interface';
import { MAX_PRICE } from '@/constants/max-price.constant';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { IProductDetail } from '@/interfaces/product-detail.interface';
import { DEFAULT_PROCDUCT_DETAIL } from '@/constants/product-detail.constant';
import DateInput from '@/components/date-input/date-input';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/format';

type collectionType = IProductDetail;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT_DETAIL;

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  order_code: string;
  employee_id: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  payment_status: boolean;
  note?: string;
  created_at: Date;
  updated_at: Date;
}

const ImportOrderList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/order');
        if (!response.ok) {
          throw new Error('Không thể tải danh sách đơn hàng');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCreateOrder = () => {
    router.push('/home/order/create');
  };

  const handleDeleteOrder = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();

    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
      try {
        console.log('Đang gửi yêu cầu xóa đơn hàng:', orderId);

        const response = await fetch(`/api/order/${orderId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Status code:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Thông tin lỗi từ server:', errorData);
          throw new Error(`Không thể xóa đơn hàng: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Kết quả xóa đơn hàng:', result);

        // Cập nhật trạng thái để loại bỏ đơn hàng đã xóa
        setOrders(orders.filter(order => order._id !== orderId));
        alert('Đã xóa đơn hàng thành công!');
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Đã xảy ra lỗi khi xóa đơn hàng: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
      }
    }
  };

  // Lọc đơn hàng theo tab
  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'completed') return order.payment_status;
    if (selectedTab === 'new') return !order.payment_status;
    return true;
  });

  // Lọc đơn hàng theo từ khóa tìm kiếm
  const searchedOrders = filteredOrders.filter(order =>
    order.order_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">
              Đơn hàng nhập
            </h1>
            <p className="text-slate-500 text-lg">
              Quản lý đơn hàng nhập của bạn
            </p>
          </div>
          <div className="flex gap-4">
            <Button className="flex items-center gap-2.5 px-6 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-slate-200/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-slate-600"
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10L12 15L17 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-semibold text-slate-700">Xuất Excel</span>
            </Button>
            <Button
              onClick={handleCreateOrder}
              className="flex items-center gap-2.5 px-6 py-3 bg-white border-2 border-blue-600 rounded-xl hover:border-blue-700 hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-blue-500/20"
            >
              <Image
                src="/icons/plus-black.svg"
                alt="plus"
                width={20}
                height={20}
                className="text-blue-600"
                priority
              />
              <span className="font-semibold text-blue-600">Thêm đơn hàng</span>
            </Button>
          </div>
        </header>

        <nav className="flex gap-8 border-b-2 border-slate-200 mb-8">
          <button
            className={`pb-4 px-4 font-semibold text-base transition-all duration-200 relative ${selectedTab === 'all'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            onClick={() => setSelectedTab('all')}
          >
            Tất cả đơn hàng
            {selectedTab === 'all' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
          <button
            className={`pb-4 px-4 font-semibold text-base transition-all duration-200 relative ${selectedTab === 'new'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            onClick={() => setSelectedTab('new')}
          >
            Đơn mới
            {selectedTab === 'new' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
          <button
            className={`pb-4 px-4 font-semibold text-base transition-all duration-200 relative ${selectedTab === 'completed'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
            onClick={() => setSelectedTab('completed')}
          >
            Hoàn thành
            {selectedTab === 'completed' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
        </nav>

        <div className="space-y-4 mb-8">
          <div className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm đơn hàng theo mã, SĐT..."
                className="w-full px-5 py-3 pl-12 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-slate-600 placeholder:text-slate-400"
              />
              <Image
                src="/icons/search.svg"
                alt="search"
                width={20}
                height={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                priority
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-semibold text-slate-700">
              <span>Sắp xếp theo ngày</span>
              <Image
                src="/icons/arrow-up.svg"
                alt="arrow-up"
                width={16}
                height={16}
                className="text-slate-500"
                priority
              />
            </Button>
            <Button className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-semibold text-slate-700">
              <span>Trạng thái</span>
              <Image
                src="/icons/arrow-up.svg"
                alt="arrow-up"
                width={16}
                height={16}
                className="text-slate-500"
                priority
              />
            </Button>
            <Button className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-semibold text-slate-700">
              <Image
                src="/icons/filter.svg"
                alt="filter"
                width={16}
                height={16}
                className="text-slate-500"
                priority
              />
              <span>Lọc</span>
            </Button>
            <Button className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-semibold text-slate-700">
              <span>Lưu bộ lọc</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
            <div className="max-h-[490px] overflow-y-auto scrollbar-custom">
              <style jsx global>{`
                .scrollbar-custom::-webkit-scrollbar {
                  width: 8px;
                }
                .scrollbar-custom::-webkit-scrollbar-track {
                  background: #f1f5f9;
                  border-radius: 10px;
                }
                .scrollbar-custom::-webkit-scrollbar-thumb {
                  background: #cbd5e1;
                  border-radius: 10px;
                }
                .scrollbar-custom::-webkit-scrollbar-thumb:hover {
                  background: #94a3b8;
                }
              `}</style>
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b-2 border-slate-100">
                    <th className="px-8 py-5 text-left font-semibold text-slate-600">Mã đơn nhập</th>
                    <th className="px-8 py-5 text-left font-semibold text-slate-600">Ngày cập nhật</th>
                    <th className="px-8 py-5 text-left font-semibold text-slate-600">Trạng thái</th>
                    <th className="px-8 py-5 text-right font-semibold text-slate-600">Thành tiền</th>
                    <th className="px-8 py-5 text-center font-semibold text-slate-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors duration-200"
                      onClick={() => router.push(`/home/order/${order._id}`)}
                    >
                      <td className="px-8 py-5">
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold text-base">
                          {order.order_code.replace('SL', 'HD')}
                        </a>
                      </td>
                      <td className="px-8 py-5 text-slate-600">
                        {new Date(order.created_at).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex px-4 py-1.5 rounded-full text-sm bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100/50">
                          {order.payment_status ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-semibold text-slate-800">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={(e) => handleDeleteOrder(e, order._id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6H5H21"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-5 border-t-2 border-slate-100 bg-slate-50">
              <div className="text-sm text-slate-600">
                Hiển thị {searchedOrders.length} trên tổng {orders.length} đơn hàng
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Tìm hiểu thêm về {' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">
              quản lý đơn hàng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportOrderList;
