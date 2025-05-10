'use client';

import { Button, IconContainer, SelectDropdown, Text } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState, ReactNode, Dispatch, SetStateAction } from 'react'
import InputSection from '../components/input-section/input-section';
import { infoIcon, trashIcon, externalLinkIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import { IProduct } from '@/interfaces/product.interface';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { IProductDetail } from '@/interfaces/product-detail.interface';
import { DEFAULT_PROCDUCT_DETAIL } from '@/constants/product-detail.constant';
import DateInput from '@/components/date-input/date-input';
import { ENotificationType } from '@/components/notify/notification/notification';
import useNotificationsHook from '@/hooks/notifications-hook';
import { deleteCollectionById } from '@/services/api-service';
import { differenceInDays } from 'date-fns';
import styles from './style.module.css';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format-currency';
import Image from 'next/image';
import { generateBatchNumber } from '@/utils/batch-number';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Tạo QueryClient instance
const queryClient = new QueryClient();

// Import Barcode component
const ReactBarcode = dynamic(() => import('react-barcode'), { ssr: false });

// Component wrapper với QueryClientProvider 
function ProductDetailWithQueryClientProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductDetail />
    </QueryClientProvider>
  );
}

interface ModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
  width?: string;
  height?: string;
  okText?: string;
  cancelText?: string;
  okAction?: () => void;
}

function Modal({ isOpen, onClose, children, className = '' }: Omit<ModalProps, 'setIsOpen'>) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-40" onClick={onClose}></div>
        <div className={`relative bg-white rounded-lg shadow-xl ${className}`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

interface ProductWithDetails extends IProduct {
  details: IProductDetail[];
}

interface ExpirationModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onDeleteSuccess?: (deletedDetailId: string) => void;
}

function ExpirationModal({ isOpen, setIsOpen, onDeleteSuccess }: ExpirationModalProps) {
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState<Array<{ product: IProduct, detail: IProductDetail, daysExpired: number }>>([]);
  const [expiring, setExpiring] = useState<Array<{ product: IProduct, detail: IProductDetail, daysLeft: number }>>([]);

  // Title màu đẹp hơn
  const titleStyle = "text-xl font-bold mb-2 text-gray-800";
  const sectionStyle = "bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-6 overflow-hidden";

  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([
      fetch('/api/product').then(res => res.json()),
      fetch('/api/product-detail').then(res => res.json())
    ]).then(([products, details]: [IProduct[], IProductDetail[]]) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiredList: typeof expired = [];
      const expiringList: typeof expiring = [];
      for (const product of products) {
        for (const detail of details.filter(d => d.product_id === product._id)) {
          const expiry = new Date(detail.expiry_date);
          expiry.setHours(0, 0, 0, 0);
          if (expiry < today) {
            expiredList.push({ product, detail, daysExpired: Math.ceil((today.getTime() - expiry.getTime()) / (1000 * 60 * 60 * 24)) });
          } else if (expiry > today && (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30) {
            expiringList.push({ product, detail, daysLeft: Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) });
          }
        }
      }
      setExpired(expiredList.sort((a, b) => b.daysExpired - a.daysExpired));
      setExpiring(expiringList.sort((a, b) => a.daysLeft - b.daysLeft));
      setLoading(false);
    });
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-40" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-4xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <Text size={24} className={titleStyle}>Kiểm tra hạn sử dụng sản phẩm</Text>
            </div>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Đang tải...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={sectionStyle}>
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 mr-3 bg-red-100 rounded-full p-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <Text size={16} className="font-semibold text-gray-900">Sản phẩm hết hạn</Text>
                      <Text size={12} className="text-gray-500">Có {expired.length} sản phẩm đã hết hạn</Text>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-[300px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hạn sử dụng</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tổng kho</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expired.length === 0 ? (
                          <tr><td colSpan={3} className="px-4 py-2 text-center text-gray-500">Không có sản phẩm nào hết hạn</td></tr>
                        ) : expired.map(({ product, detail, daysExpired }, idx) => (
                          <tr key={product._id + detail._id + idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm text-red-600 font-medium">{new Date(detail.expiry_date).toLocaleDateString('vi-VN')}</span>
                                <span className="text-xs text-red-500">({daysExpired} ngày trước)</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{detail.input_quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={sectionStyle}>
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 mr-3 bg-yellow-100 rounded-full p-2">
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <Text size={16} className="font-semibold text-gray-900">Sản phẩm sắp hết hạn</Text>
                      <Text size={12} className="text-gray-500">Có {expiring.length} sản phẩm sắp hết hạn trong vòng 30 ngày tới</Text>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-[300px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hạn sử dụng</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tổng kho</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expiring.length === 0 ? (
                          <tr><td colSpan={3} className="px-4 py-2 text-center text-gray-500">Không có sản phẩm nào sắp hết hạn</td></tr>
                        ) : expiring.map(({ product, detail, daysLeft }, idx) => (
                          <tr key={product._id + detail._id + idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm text-yellow-600 font-medium">{new Date(detail.expiry_date).toLocaleDateString('vi-VN')}</span>
                                <span className="text-xs text-yellow-500">({daysLeft} ngày nữa)</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{detail.input_quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type collectionType = IProductDetail;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT_DETAIL;

function ProductDetail() {
  const { createNotification, notificationElements } = useNotificationsHook();

  const [productDetail, setProductDetail] = useState<collectionType>(DEFAULT_PROCDUCT_DETAIL);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [productOptions, setProductOptions] = useState<ISelectOption[]>([]);
  const [isClickShowMore, setIsClickShowMore] = useState<ICollectionIdNotify>({ id: '', isClicked: false });
  const [isClickDelete, setIsClickDelete] = useState<ICollectionIdNotify>({ id: '', isClicked: false });
  const [isExpirationModalOpen, setIsExpirationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<{ id: string; name: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productStockInfo, setProductStockInfo] = useState<Record<string, number>>({});
  const [productDetails, setProductDetails] = useState<IProductDetail[]>([]);

  // Hàm tải tất cả dữ liệu cần thiết một lần với tối ưu 
  const fetchAllData = useCallback(async () => {
    console.log('Đang tải dữ liệu sản phẩm...');
    try {
      setIsLoading(true);

      // Tải dữ liệu song song với timeout để tránh request quá nhiều
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const [productResponse, detailsResponse] = await Promise.all([
          fetch('/api/product', { signal: controller.signal }),
          fetch('/api/product-detail', { signal: controller.signal })
        ]);

        clearTimeout(timeoutId);

        if (!productResponse.ok || !detailsResponse.ok) {
          throw new Error('Lỗi khi tải dữ liệu từ API');
        }

        const productsData = await productResponse.json();
        const detailsData = await detailsResponse.json();

        // Lưu dữ liệu gốc
        setProducts(productsData);

        // Xử lý options dropdown bằng useMemo (được xử lý bởi React)
        const dropdownOptions = productsData.map((product: IProduct): ISelectOption => ({
          label: product.name || '',
          value: product._id,
        }));
        setProductOptions(dropdownOptions);

        // Thiết lập sản phẩm mặc định nếu chưa có
        if (!productDetail.product_id && productsData.length > 0) {
          setProductDetail(prev => ({
            ...prev,
            product_id: productsData[0]._id,
          }));
        }

        // Tính toán tồn kho từ chi tiết sản phẩm
        const stockInfo: Record<string, number> = {};
        detailsData.forEach((detail: IProductDetail) => {
          if (!stockInfo[detail.product_id]) {
            stockInfo[detail.product_id] = 0;
          }
          stockInfo[detail.product_id] += (detail.input_quantity - detail.output_quantity);
        });
        setProductStockInfo(stockInfo);

        // Xử lý và lọc chi tiết sản phẩm - chỉ lọc các phần tử có số lượng nhập > 0
        const filteredDetails = detailsData.filter(
          (detail: IProductDetail) => detail.input_quantity > 0
        );

        // Gộp thông tin sản phẩm và chi tiết
        const processedDetails = filteredDetails.map((detail: IProductDetail) => {
          const product = productsData.find((p: IProduct) => p._id === detail.product_id);
          return {
            ...detail,
            product: product?.name || 'Không xác định'
          };
        });

        console.log(`Đã tải ${processedDetails.length} chi tiết sản phẩm thành công`);
        setProductDetails(processedDetails);
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          console.log('Fetch request timed out');
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      createNotification({
        children: 'Không thể tải dữ liệu sản phẩm',
        type: ENotificationType.ERROR,
        isAutoClose: true,
        id: Math.random()
      });
    } finally {
      setIsLoading(false);
    }
  }, [createNotification, productDetail.product_id]);

  // Tải dữ liệu ban đầu một lần duy nhất khi component mount
  useEffect(() => {
    console.log('Component mounted - Tải dữ liệu lần đầu');
    // Tải dữ liệu khi component mount
    fetchAllData();

    // Thiết lập interval với thời gian dài (5 phút) để giảm số lần gọi API
    const intervalId = setInterval(() => {
      console.log('Tự động làm mới dữ liệu sản phẩm (mỗi 5 phút)');
      fetchAllData();
    }, 300000); // 5 phút = 300000ms

    // Cleanup khi unmount
    return () => {
      console.log('Hủy interval làm mới dữ liệu');
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - chỉ chạy một lần khi mount

  // Chỉ làm mới khi người dùng yêu cầu (click nút refresh hoặc chuyển trang)
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Làm mới theo yêu cầu người dùng');
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Chỉ làm mới khi thay đổi trang
  useEffect(() => {
    if (currentPage > 0) {
      console.log('Làm mới khi thay đổi trang');
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [currentPage]);

  const columns: Array<IColumnProps<collectionType>> = [
    {
      key: 'index',
      ref: useRef(null),
      title: '#',
      size: '50px'
    },
    {
      key: `product_id`,
      ref: useRef(null),
      title: `Sản phẩm`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        const productOption = productOptions.find(
          option => option.value === collection.product_id
        );
        const name = productOption?.label || 'Không xác định';

        return (
          <div className="py-3 px-2">
            <Text className="font-medium text-gray-900">{name}</Text>
          </div>
        );
      }
    },
    {
      key: `inventory`,
      ref: useRef(null),
      title: `Tồn kho`,
      size: `1fr`,
      render: (collection: collectionType): ReactElement => {
        return (
          <div className="py-3 px-2">
            <Text className="font-semibold text-blue-700">{collection.inventory}</Text>
          </div>
        );
      }
    },
    {
      key: `input_quantity`,
      ref: useRef(null),
      title: `SL nhập`,
      size: `1fr`,
      render: (collection: collectionType): ReactElement => {
        return (
          <div className="py-3 px-2">
            <Text className="font-semibold text-green-700">{collection.input_quantity}</Text>
          </div>
        );
      }
    },
    {
      key: `output_quantity`,
      ref: useRef(null),
      title: `SL xuất`,
      size: `1fr`,
      render: (collection: collectionType): ReactElement => {
        return (
          <div className="py-3 px-2">
            <Text className="font-semibold text-orange-700">{collection.output_quantity}</Text>
          </div>
        );
      }
    },
    {
      title: `Thao tác`,
      ref: useRef(null),
      size: `120px`,
      render: (collection: collectionType): ReactElement => {
        return (
          <div className="flex items-center justify-center p-2">
            <button
              className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-1.5"
              onClick={() => {
                window.location.href = `/home/product-detail/${collection._id}`;
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Xem chi tiết
            </button>
          </div>
        );
      }
    },
  ];

  const handleChangeProductDetail = (e: ChangeEvent<HTMLInputElement>): void => {
    setProductDetail({
      ...productDetail,
      [e.target.name]: e.target.value,
    });
  }

  const handleChangeProductId = (e: ChangeEvent<HTMLSelectElement>): void => {
    const newProductId = e.target.value;
    setProductDetail({
      ...productDetail,
      product_id: newProductId,
      batch_number: generateBatchNumber(newProductId)
    });
  }

  const handleDeleteClick = (collection: collectionType): void => {
    const productOption = productOptions.find(
      (option) => option.value === collection.product_id
    );
    const productName = productOption?.label || 'Không xác định';
    setSelectedProductDetail({
      id: collection._id,
      name: productName
    });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProductDetail) return;

    try {
      await deleteCollectionById(selectedProductDetail.id, collectionName);
      createNotification({
        type: ENotificationType.SUCCESS,
        children: <div>Đã xóa sản phẩm {selectedProductDetail.name} thành công</div>,
        isAutoClose: true,
        id: Math.random(),
      });
      setDeleteModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting product:', error);
      createNotification({
        type: ENotificationType.ERROR,
        children: <div>Có lỗi xảy ra khi xóa sản phẩm</div>,
        isAutoClose: true,
        id: Math.random(),
      });
    }
  };

  return (
    <>
      <div className="h-full w-full px-[30px]">
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-gray-800">Báo cáo tồn kho</div>

            <div className="flex gap-4">
              <Button
                className="flex items-center gap-2 text-blue-600 bg-white border border-blue-600 rounded-md py-2 px-4 hover:bg-blue-50 min-w-[180px] justify-center"
                onClick={() => setIsExpirationModalOpen(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Kiểm tra hạn sử dụng</span>
              </Button>
            </div>
          </div>

          {notificationElements}

          <div className="mt-2">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-gray-100 py-1 px-3 rounded-md">
                <span className="text-sm font-medium text-gray-700">
                  Tổng số: <span className="text-blue-600 font-semibold">{productDetails.length}</span> sản phẩm
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-hidden">
                <ManagerPage<collectionType>
                  columns={columns}
                  collectionName={collectionName}
                  defaultCollection={DEFAULT_PROCDUCT_DETAIL}
                  collection={productDetail}
                  setCollection={setProductDetail}
                  isModalReadonly={isModalReadOnly}
                  setIsModalReadonly={setIsModalReadOnly}
                  isClickShowMore={isClickShowMore}
                  isClickDelete={isClickDelete}
                  isLoaded={isLoading}
                  displayedItems={productDetails}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={productDetails.length}
                >
                  <div></div>
                </ManagerPage>
              </div>
            </div>
          </div>

          {/* Modal xác nhận xóa sản phẩm */}
          <Modal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            className="w-full max-w-md p-6"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Xác nhận xóa</h3>
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc chắn muốn xóa chi tiết sản phẩm "{selectedProductDetail?.name}"?
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Xác nhận xóa
                </Button>
              </div>
            </div>
          </Modal>

          <ExpirationModal
            isOpen={isExpirationModalOpen}
            setIsOpen={setIsExpirationModalOpen}
            onDeleteSuccess={() => fetchAllData()}
          />
        </div>
      </div>
    </>
  );
}

export default ProductDetailWithQueryClientProvider;