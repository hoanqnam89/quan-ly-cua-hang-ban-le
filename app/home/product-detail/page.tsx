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
import { IProduct } from '../../interfaces/product.interface';
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
import ProductGroupList from '../../components/ProductGroupList';

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

function ExpirationModal({ isOpen, setIsOpen }: ExpirationModalProps) {
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState<Array<{ product: IProduct, detail: IProductDetail, daysExpired: number }>>([]);
  const [expiring, setExpiring] = useState<Array<{ product: IProduct, detail: IProductDetail, daysLeft: number }>>([]);

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
        <div className="fixed inset-0 bg-black opacity-40" onClick={() => setIsOpen(false)}></div>
        <div className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-4xl">
          <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <Text size={24} className="text-gray-900 font-bold">Kiểm tra hạn sử dụng sản phẩm</Text>
            </div>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Đang tải...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-red-100 overflow-hidden">
                  <div className="p-4 border-b border-red-100 bg-red-50 flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="ml-3">
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
                <div className="bg-white rounded-lg border border-yellow-100 overflow-hidden">
                  <div className="p-4 border-b border-yellow-100 bg-yellow-50 flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="ml-3">
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

export default function Product() {
  const { createNotification, notificationElements } = useNotificationsHook();
  const [productDetail, setProductDetail] = useState<collectionType>(
    DEFAULT_PROCDUCT_DETAIL
  );
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [productOptions, setProductOptions] = useState<ISelectOption[]>([]);
  const [isClickShowMore, setIsClickShowMore] = useState<ICollectionIdNotify>({
    id: '',
    isClicked: false,
  });
  const [isClickDelete, setIsClickDelete] = useState<ICollectionIdNotify>({
    id: '',
    isClicked: false,
  });
  const [isExpirationModalOpen, setIsExpirationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<{ id: string; name: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'group'>('list');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productStockInfo, setProductStockInfo] = useState<Record<string, number>>({});
  const [productDetails, setProductDetails] = useState<IProductDetail[]>([]);

  const getProducts: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newProducts: IProduct[] = await fetchGetCollections<IProduct>(
        ECollectionNames.PRODUCT,
      );

      setProductDetail({
        ...productDetail,
        product_id: newProducts[0]._id,
      });
      setProductOptions([
        ...newProducts.map((product: IProduct): ISelectOption => ({
          label: `${product.name}`,
          value: product._id,
        }))
      ]);
      setIsLoading(false);
    },
    [],
  );

  const handleExpirationModalDelete = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    createNotification({
      type: ENotificationType.SUCCESS,
      children: <div>Đã xóa sản phẩm hết hạn thành công</div>,
      isAutoClose: true,
      id: 0,
    });
  }, [createNotification]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      const refreshData = async () => {
        try {
          setIsLoading(true);
          const detailsResponse = await fetch('/api/product-detail');
          const details = await detailsResponse.json();
          setProductDetails(details.filter((detail: IProductDetail) => detail.input_quantity > 0));
          await getProducts();
        } catch (error) {
          console.error('Lỗi khi làm mới dữ liệu:', error);
        } finally {
          setIsLoading(false);
        }
      };
      refreshData();
    }
  }, [refreshTrigger, getProducts]);

  useEffect(() => {
    const refreshPage = async () => {
      if (currentPage > 0) {
        try {
          setIsLoading(true);
          const detailsResponse = await fetch('/api/product-detail');
          const details = await detailsResponse.json();
          setProductDetails(details.filter((detail: IProductDetail) => detail.input_quantity > 0));
          await getProducts();
        } catch (error) {
          console.error('Lỗi khi chuyển trang:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    refreshPage();
  }, [currentPage, getProducts]);

  useEffect((): void => {
    getProducts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/product');
        const data = await response.json();
        setProducts(data);

        // Tính toán tồn kho cho mỗi sản phẩm
        const stockInfo: Record<string, number> = {};
        const detailsResponse = await fetch('/api/product-detail');
        const details = await detailsResponse.json();

        details.forEach((detail: IProductDetail) => {
          if (!stockInfo[detail.product_id]) {
            stockInfo[detail.product_id] = 0;
          }
          stockInfo[detail.product_id] += (detail.input_quantity - detail.output_quantity);
        });

        setProductStockInfo(stockInfo);
        setProductDetails(details.filter((detail: IProductDetail) => detail.input_quantity > 0));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const columns: Array<IColumnProps<collectionType>> = [
    {
      key: 'index',
      ref: useRef(null),
      title: '#',
      size: '1fr',
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
          <div>
            <Text>{name}</Text>
          </div>
        );
      }
    },
    {
      key: `inventory`,
      ref: useRef(null),
      title: `Tồn kho`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement => {
        return (
          <div>
            <Text>{collection.inventory}</Text>
          </div>
        );
      }
    },
    {
      key: `input_quantity`,
      ref: useRef(null),
      title: `Số lượng nhập`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        return (
          <div>
            <Text>{collection.input_quantity}</Text>
          </div>
        );
      }
    },
    {
      key: `output_quantity`,
      ref: useRef(null),
      title: `Số lượng xuất`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        return (
          <div>
            <Text>{collection.output_quantity}</Text>
          </div>
        );
      }
    },
    {
      key: `date_of_manufacture`,
      ref: useRef(null),
      title: `Ngày sản xuất`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement => {
        const date = new Date(collection.date_of_manufacture);
        const formattedDate = date.toLocaleDateString('vi-VN');
        return (
          <div>
            <Text isEllipsis={true} tooltip={formattedDate}>{formattedDate}</Text>
          </div>
        );
      }
    },
    {
      key: `expiry_date`,
      ref: useRef(null),
      title: `Ngày hết hạn`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement => {
        const date = new Date(collection.expiry_date);
        const formattedDate = date.toLocaleDateString('vi-VN');
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const isExpired = date < now;
        const isExpiringSoon = date > now && differenceInDays(date, now) <= 30;
        const textClass = isExpired ? styles.expiredDate
          : isExpiringSoon ? styles.expiringDate
            : '';
        return (
          <div className={textClass}>
            <Text isEllipsis={true} tooltip={formattedDate}>{formattedDate}</Text>
          </div>
        );
      }
    },
    {
      title: `Thao tác`,
      ref: useRef(null),
      size: `3fr`,
      render: (collection: collectionType): ReactElement => {
        return (
          <div className="flex items-center justify-center gap-2">
            {/* Xem chi tiết */}
            <Button
              className="bg-white border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center hover:bg-blue-50 transition"
              title="Xem chi tiết"
              onClick={() => window.location.href = `/home/product-detail/${collection._id}`}
            >
              <IconContainer
                tooltip="Xem chi tiết"
                iconLink={externalLinkIcon}
                className="text-blue-500"
              />
            </Button>
            {/* Xem thêm */}
            <Button
              className="bg-white border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center hover:bg-yellow-50 transition"
              title={createMoreInfoTooltip(collectionName)}
              onClick={(): void => {
                setIsClickShowMore({
                  id: collection._id,
                  isClicked: !isClickShowMore.isClicked,
                });
              }}
            >
              <IconContainer
                tooltip={createMoreInfoTooltip(collectionName)}
                iconLink={infoIcon}
                className="text-yellow-500"
              />
            </Button>
            {/* Xóa */}
            <Button
              className="bg-white border border-gray-300 rounded-full w-9 h-9 flex items-center justify-center hover:bg-red-50 transition"
              title={createDeleteTooltip(collectionName)}
              onClick={(): void => { handleDeleteClick(collection); }}
            >
              <IconContainer
                tooltip={createDeleteTooltip(collectionName)}
                iconLink={trashIcon}
                className="text-red-500"
              />
            </Button>
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
    setProductDetail({
      ...productDetail,
      product_id: e.target.value,
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

  const gridColumns: string = `00px 1fr`;

  const handleViewDetail = (product: IProduct) => {
    window.location.href = `/home/product-detail/${product._id}`;
  };

  const handleEdit = (product: IProduct) => {
    setSelectedProductDetail({ id: product._id, name: product.name });
    setIsEditModalOpen(true);
  };

  const handleDelete = (product: IProduct) => {
    setSelectedProductDetail({ id: product._id, name: product.name });
    setConfirmDeleteModal(true);
  };

  const productDetailsList = [productDetail];

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>

          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setViewMode(viewMode === 'list' ? 'group' : 'list')}
              type={EButtonType.SUCCESS}
              className="px-4 py-4 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {viewMode === 'list' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                )}
              </svg>
              <Text>{viewMode === 'list' ? 'Xem theo nhóm' : 'Xem theo danh sách'}</Text>
            </Button>
            <Button
              className="bg-gradient-to-r from-zinc-300 to-slate-400 from-amber-500 to-amber-600 text-black px-2 py-0.5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:from-amber-600 hover:to-amber-700 border border-amber-500"
              onClick={() => setIsExpirationModalOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Kiểm tra hạn sử dụng</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {viewMode === 'group' ? (
            <div className="p-4">
              <ProductGroupList
                products={products}
                onViewDetail={handleViewDetail}
                onEdit={handleEdit}
                onDelete={handleDelete}
                productStockInfo={productStockInfo}
              />
            </div>
          ) : (
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
              <Tabs>
                <TabItem label={translateCollectionName(collectionName)}>
                  <InputSection label="Cho sản phẩm" children={
                    <div style={{ position: 'relative', zIndex: 100 }}>
                      <SelectDropdown
                        isLoading={isLoading}
                        isDisable={isModalReadOnly}
                        options={productOptions}
                        defaultOptionIndex={getSelectedOptionIndex(
                          productOptions, productDetail.product_id
                        )}
                        onInputChange={handleChangeProductId}
                      />
                    </div>
                  } />
                </TabItem>
              </Tabs>
            </ManagerPage>
          )}
        </div>
      </div>

      <ExpirationModal
        isOpen={isExpirationModalOpen}
        setIsOpen={setIsExpirationModalOpen}
        onDeleteSuccess={handleExpirationModalDelete}
      />
    </>
  );
}