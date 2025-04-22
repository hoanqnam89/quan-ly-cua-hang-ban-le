'use client';

import { Button, IconContainer, SelectDropdown, Text } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState, ReactNode, Dispatch, SetStateAction } from 'react'
import InputSection from '../components/input-section/input-section';
import { infoIcon, trashIcon } from '@/public';
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
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ productId: string; detailId: string; name: string } | null>(null);

  // Pagination states
  const [expiredPage, setExpiredPage] = useState(1);
  const [expiringPage, setExpiringPage] = useState(1);
  const [hasMoreExpired, setHasMoreExpired] = useState(true);
  const [hasMoreExpiring, setHasMoreExpiring] = useState(true);
  const [loadingMoreExpired, setLoadingMoreExpired] = useState(false);
  const [loadingMoreExpiring, setLoadingMoreExpiring] = useState(false);
  const [allExpiredProducts, setAllExpiredProducts] = useState<Array<{ product: IProduct, detail: IProductDetail, daysExpired: number }>>([]);
  const [allExpiringProducts, setAllExpiringProducts] = useState<Array<{ product: IProduct, detail: IProductDetail, daysLeft: number }>>([]);
  const [displayedExpiredProducts, setDisplayedExpiredProducts] = useState<Array<{ product: IProduct, detail: IProductDetail, daysExpired: number }>>([]);
  const [displayedExpiringProducts, setDisplayedExpiringProducts] = useState<Array<{ product: IProduct, detail: IProductDetail, daysLeft: number }>>([]);
  const PAGE_SIZE = 10;

  // Refs for infinite scrolling
  const expiredObserverRef = useRef<IntersectionObserver | null>(null);
  const expiringObserverRef = useRef<IntersectionObserver | null>(null);
  const expiredLoadingRef = useRef<HTMLDivElement | null>(null);
  const expiringLoadingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        // Reset pagination states
        setExpiredPage(1);
        setExpiringPage(1);
        setHasMoreExpired(true);
        setHasMoreExpiring(true);

        const productsResponse = await fetch('/api/product');
        const productsData: IProduct[] = await productsResponse.json();

        const detailsResponse = await fetch('/api/product-detail');
        const detailsData: IProductDetail[] = await detailsResponse.json();

        const productsWithDetails = productsData.map(product => ({
          ...product,
          details: detailsData.filter(detail => detail.product_id === product._id)
        }));

        setProducts(productsWithDetails);

        // Process expired and expiring products
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all expired products
        const expiredItems = [];
        for (const product of productsWithDetails) {
          for (const detail of product.details) {
            const expiry = new Date(detail.expiry_date);
            expiry.setHours(0, 0, 0, 0);

            if (expiry <= today) {
              const daysExpired = Math.ceil((today.getTime() - expiry.getTime()) / (1000 * 60 * 60 * 24));
              expiredItems.push({
                product,
                detail,
                daysExpired
              });
            }
          }
        }

        // Sort expired products by most expired first
        expiredItems.sort((a, b) => b.daysExpired - a.daysExpired);
        setAllExpiredProducts(expiredItems);
        setDisplayedExpiredProducts(expiredItems.slice(0, PAGE_SIZE));
        setHasMoreExpired(expiredItems.length > PAGE_SIZE);

        // Find all expiring products
        const expiringItems = [];
        for (const product of productsWithDetails) {
          for (const detail of product.details) {
            const expiry = new Date(detail.expiry_date);
            expiry.setHours(0, 0, 0, 0);

            const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) { // Chỉ hiển thị sản phẩm sắp hết hạn trong 10 ngày
              expiringItems.push({
                product,
                detail,
                daysLeft: daysUntilExpiry
              });
            }
          }
        }

        // Sort expiring products by soonest expiring first
        expiringItems.sort((a, b) => a.daysLeft - b.daysLeft);
        setAllExpiringProducts(expiringItems);
        setDisplayedExpiringProducts(expiringItems.slice(0, PAGE_SIZE));
        setHasMoreExpiring(expiringItems.length > PAGE_SIZE);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup intersection observers for infinite scrolling
    const setupObservers = () => {
      // Observer for expired products
      if (expiredObserverRef.current) {
        expiredObserverRef.current.disconnect();
      }

      expiredObserverRef.current = new IntersectionObserver(entries => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreExpired && !loadingMoreExpired) {
          loadMoreExpiredProducts();
        }
      }, { threshold: 0.5 });

      // Observer for expiring products
      if (expiringObserverRef.current) {
        expiringObserverRef.current.disconnect();
      }

      expiringObserverRef.current = new IntersectionObserver(entries => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreExpiring && !loadingMoreExpiring) {
          loadMoreExpiringProducts();
        }
      }, { threshold: 0.5 });

      // Observe loading elements if they exist
      if (expiredLoadingRef.current) {
        expiredObserverRef.current.observe(expiredLoadingRef.current);
      }

      if (expiringLoadingRef.current) {
        expiringObserverRef.current.observe(expiringLoadingRef.current);
      }
    };

    if (isOpen) {
      // Wait for render to complete
      setTimeout(setupObservers, 500);
    }

    return () => {
      // Cleanup observers
      if (expiredObserverRef.current) {
        expiredObserverRef.current.disconnect();
      }

      if (expiringObserverRef.current) {
        expiringObserverRef.current.disconnect();
      }
    };
  }, []);

  // Function to load more expired products
  const loadMoreExpiredProducts = () => {
    if (!hasMoreExpired || loadingMoreExpired) return;

    console.log('Loading more expired products...');
    setLoadingMoreExpired(true);

    // Simulate API call delay (replace with real API call if needed)
    setTimeout(() => {
      const nextPage = expiredPage + 1;
      const startIdx = expiredPage * PAGE_SIZE;
      const endIdx = Math.min(startIdx + PAGE_SIZE, allExpiredProducts.length);

      if (startIdx < allExpiredProducts.length) {
        const newItems = allExpiredProducts.slice(startIdx, endIdx);
        setDisplayedExpiredProducts(prev => [...prev, ...newItems]);
        setExpiredPage(nextPage);
        setHasMoreExpired(endIdx < allExpiredProducts.length);
      } else {
        setHasMoreExpired(false);
      }

      setLoadingMoreExpired(false);
    }, 600);
  };

  // Function to load more expiring products
  const loadMoreExpiringProducts = () => {
    if (!hasMoreExpiring || loadingMoreExpiring) return;

    console.log('Loading more expiring products...');
    setLoadingMoreExpiring(true);

    // Simulate API call delay (replace with real API call if needed)
    setTimeout(() => {
      const nextPage = expiringPage + 1;
      const startIdx = expiringPage * PAGE_SIZE;
      const endIdx = Math.min(startIdx + PAGE_SIZE, allExpiringProducts.length);

      if (startIdx < allExpiringProducts.length) {
        const newItems = allExpiringProducts.slice(startIdx, endIdx);
        setDisplayedExpiringProducts(prev => [...prev, ...newItems]);
        setExpiringPage(nextPage);
        setHasMoreExpiring(endIdx < allExpiringProducts.length);
      } else {
        setHasMoreExpiring(false);
      }

      setLoadingMoreExpiring(false);
    }, 600);
  };

  const openDeleteConfirm = (productId: string, detailId: string, productName: string) => {
    setSelectedProduct({ productId, detailId, name: productName });
    setConfirmDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/product-detail/${selectedProduct.detailId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedProduct.detailId })
      });

      if (response.ok) {
        // Update local state after successful deletion
        setProducts(prevProducts =>
          prevProducts.map(product => ({
            ...product,
            details: product.details.filter(detail => detail._id !== selectedProduct.detailId)
          })).filter(product => product.details.length > 0) // Remove products with no details
        );

        // Close the confirm modal
        setConfirmDeleteModal(false);

        // Refresh the page to update the product list
        window.location.reload();
      } else {
        console.error('Failed to delete product detail');
      }
    } catch (error) {
      console.error('Error deleting product detail:', error);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-11/12 max-w-7xl">
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
              {/* Expired Products */}
              <div className="bg-white rounded-lg border border-red-100 overflow-hidden">
                <div className="p-4 border-b border-red-100 bg-red-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <Text size={16} className="font-semibold text-gray-900">Sản phẩm hết hạn</Text>
                      <Text size={12} className="text-gray-500">Có {allExpiredProducts.length} sản phẩm đã hết hạn</Text>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hạn sử dụng</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tổng kho</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedExpiredProducts.map(({ product, detail, daysExpired }, index) => (
                        <tr key={`${product._id}-${detail._id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm text-red-600 font-medium">{new Date(detail.expiry_date).toLocaleDateString('vi-VN')}</span>
                              <span className="text-xs text-red-500">({daysExpired} ngày trước)</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {detail.input_quantity}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <button
                              onClick={() => openDeleteConfirm(product._id, detail._id, product.name)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Xóa</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {displayedExpiredProducts.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                            Không có sản phẩm nào hết hạn
                          </td>
                        </tr>
                      )}
                      {hasMoreExpired && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2">
                            <button
                              onClick={loadMoreExpiredProducts}
                              disabled={loadingMoreExpired}
                              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors flex items-center justify-center"
                            >
                              {loadingMoreExpired ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                                  <span>Đang tải...</span>
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  <span>Tải thêm sản phẩm</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expiring Soon Products */}
              <div className="bg-white rounded-lg border border-yellow-100 overflow-hidden">
                <div className="p-4 border-b border-yellow-100 bg-yellow-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <Text size={16} className="font-semibold text-gray-900">Sản phẩm sắp hết hạn</Text>
                      <Text size={12} className="text-gray-500">Có {allExpiringProducts.length} sản phẩm sắp hết hạn trong vòng 10 ngày tới</Text>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hạn sử dụng</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tổng kho</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedExpiringProducts.map(({ product, detail, daysLeft }, index) => (
                        <tr key={`${product._id}-${detail._id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm text-yellow-600 font-medium">{new Date(detail.expiry_date).toLocaleDateString('vi-VN')}</span>
                              <span className="text-xs text-yellow-500">({daysLeft} ngày nữa)</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {detail.input_quantity}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <button
                              onClick={() => openDeleteConfirm(product._id, detail._id, product.name)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center"
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Xóa</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {displayedExpiringProducts.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                            Không có sản phẩm nào sắp hết hạn
                          </td>
                        </tr>
                      )}
                      {hasMoreExpiring && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2">
                            <button
                              onClick={loadMoreExpiringProducts}
                              disabled={loadingMoreExpiring}
                              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors flex items-center justify-center"
                            >
                              {loadingMoreExpiring ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                                  <span>Đang tải...</span>
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  <span>Tải thêm sản phẩm</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Xác nhận xóa sản phẩm
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa sản phẩm <span className="font-semibold">{selectedProduct?.name}</span>?
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Hành động này không thể hoàn tác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Xóa
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setConfirmDeleteModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
      render: (collection: collectionType): ReactElement => {
        const itemsPerPage = 10;
        const sequentialIndex = ((currentPage - 1) * itemsPerPage) + (collection as any).index + 1;
        return (
          <div className={styles.indexCell}>
            {sequentialIndex}
          </div>
        );
      }
    },
    // {
    //   key: `_id`,
    //   ref: useRef(null),
    //   title: `Mã`,
    //   size: `5fr`,
    //   render: (collection: collectionType): ReactElement => {
    //     return (
    //       <div>
    //         <Text>{collection._id}</Text>
    //       </div>
    //     );
    //   }
    // },
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
        const isExpiringSoon = date > now && differenceInDays(date, now) <= 10;
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
      title: `Xem thêm`,
      ref: useRef(null),
      size: `1.5fr`,
      render: (collection: collectionType): ReactElement => {
        return (
          <div>
            <Button
              className={styles.actionButton}
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
              >
              </IconContainer>
            </Button>
          </div>
        );
      }
    },
    {
      title: `Xóa`,
      ref: useRef(null),
      size: `1.5fr`,
      render: (collection: collectionType): ReactElement => {
        return (
          <div>
            <Button
              className={`text-white bg-red-600 hover:bg-red-700 ${styles.actionButton}`}
              title={createDeleteTooltip(collectionName)}
              onClick={(): void => { handleDeleteClick(collection); }}
            >
              <IconContainer
                tooltip={createDeleteTooltip(collectionName)}
                iconLink={trashIcon}
              >
              </IconContainer>
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
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
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