'use client';

import { Button, IconContainer, NumberInput, SelectDropdown, Text } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { infoIcon, trashIcon } from '@/public';
import printIcon from '@/public/icons/print.svg';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import { IWarehouseReceipt, IWarehouseProductDetail } from '@/app/interfaces/warehouse-receipt.interface';
import { DEFAULT_WAREHOUST_RECEIPT } from '@/constants/warehouse-receipt.constant';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { IOrderForm, IOrderFormProductDetail, OrderFormStatus } from '@/interfaces/order-form.interface';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { DEFAULT_ORDER_FORM } from '@/constants/order-form.constant';
import styles from './style.module.css';
import { IProductDetail } from '@/interfaces/product-detail.interface';
import { IProduct } from '@/interfaces/product.interface';
import { IBusiness } from '@/interfaces/business.interface';
import { EBusinessType } from '@/enums/business-type.enum';
import { IUnit } from '@/interfaces/unit.interface';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import Textarea from '@/components/textarea/Textarea';
import useNotificationsHook from '@/hooks/notifications-hook';
import { ENotificationType } from '@/components/notify/notification/notification';
import { addCollection, fetchCollection, updateOrderStatus } from '@/services/api-service';
import { EStatusCode } from '@/enums/status-code.enum';
import { ROOT } from '@/constants/root.constant';
import { nameToHyphenAndLowercase } from '@/utils/name-to-hyphen-and-lowercase';
import { useQuery, QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'

// Interfaces
interface IDateFilter {
  label: string;
  days: number;
  value: string;
}

interface IAllData {
  products: IProduct[];
  productDetails: IProductDetail[];
  businesses: IBusiness[];
  units: IUnit[];
  orderForms: IOrderForm[];
}

type collectionType = IWarehouseReceipt;
const collectionName: ECollectionNames = ECollectionNames.WAREHOUSE_RECEIPT;

// Helper functions
const formatReceiptCode = (id: string, date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const dateStr = `${day}${month}${year}`;

  // Tạo số thứ tự từ id
  const sequence = id.substring(id.length - 4).padStart(4, '0');

  return `NK-${dateStr}-${sequence}`;
};

// Hàm định dạng số thành chuỗi tiền tệ VND với dấu chấm phân cách
const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? Number(value.replace(/\./g, '')) : value;
  if (isNaN(numericValue)) return '';
  return numericValue.toLocaleString('vi-VN');
};

// Hàm xử lý chuỗi tiền tệ VND thành số
const parseCurrency = (value: string): number => {
  const numericValue = value.replace(/\./g, '');
  return Number(numericValue);
};

const formatShortDate = (date: Date | null | undefined, separator: string = '/'): string => {
  if (!date) return '';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return separator === ''
      ? `${day}${month}${year}`
      : `${day}${separator}${month}${separator}${year}`;
  } catch {
    return '';
  }
};

// Tạo QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false, // Không refetch khi focus window
      retry: 1, // Chỉ retry 1 lần khi lỗi
    },
  },
});

// Tạo provider component
function WarehouseReceiptProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <WarehouseReceipt />
    </QueryClientProvider>
  );
}

// Main component
function WarehouseReceipt() {
  const { createNotification, notificationElements } = useNotificationsHook();
  const queryClient = useQueryClient();

  // States
  const [warehouseReceipt, setWarehouseReceipt] = useState<collectionType>(DEFAULT_WAREHOUST_RECEIPT);
  const [orderForm, setOrderForm] = useState<IOrderForm>(DEFAULT_ORDER_FORM);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [isClickShowMore, setIsClickShowMore] = useState<ICollectionIdNotify>({ id: ``, isClicked: false });
  const [isClickDelete, setIsClickDelete] = useState<ICollectionIdNotify>({ id: ``, isClicked: false });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<string>('0');
  const [filteredReceiptCount, setFilteredReceiptCount] = useState<number>(0);
  const [orderFormOptions, setOrderFormOptions] = useState<ISelectOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Thêm các hàm xử lý sự kiện
  const handleChangeWarehouseReceiptProductQuantity = useCallback((e: ChangeEvent<HTMLInputElement>, index: number): void => {
    const newQuantity = parseInt(e.target.value);
    if (isNaN(newQuantity) || newQuantity < 1) return;

    setWarehouseReceipt(prev => {
      const newProductDetails = [...prev.product_details];
      newProductDetails[index] = {
        ...newProductDetails[index],
        quantity: newQuantity
      };
      return {
        ...prev,
        product_details: newProductDetails
      };
    });
  }, []);

  const handleChangeWarehouseReceiptProductNote = useCallback((e: ChangeEvent<HTMLTextAreaElement>, index: number): void => {
    const newNote = e.target.value;
    setWarehouseReceipt(prev => {
      const newProductDetails = [...prev.product_details];
      newProductDetails[index] = {
        ...newProductDetails[index],
        note: newNote
      };
      return {
        ...prev,
        product_details: newProductDetails
      };
    });
  }, []);

  // Hàm xử lý thay đổi giá nhập với định dạng tiền tệ
  const handleChangeWarehouseReceiptProductPrice = useCallback((e: ChangeEvent<HTMLInputElement>, index: number): void => {
    const inputValue = e.target.value;
    // Chỉ cho phép nhập số
    const numericValue = parseCurrency(inputValue);

    if (isNaN(numericValue)) return;

    setWarehouseReceipt(prev => {
      const newProductDetails = [...prev.product_details];
      newProductDetails[index] = {
        ...newProductDetails[index],
        input_price: numericValue
      } as IWarehouseProductDetail;
      return {
        ...prev,
        product_details: newProductDetails
      };
    });
  }, []);

  // React Query hooks
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchGetCollections<IProduct>(ECollectionNames.PRODUCT),
  });

  const { data: units = [], isLoading: isLoadingUnits } = useQuery({
    queryKey: ['units'],
    queryFn: () => fetchGetCollections<IUnit>(ECollectionNames.UNIT),
  });

  const { data: businesses = [], isLoading: isLoadingBusinesses } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => fetchGetCollections<IBusiness>(ECollectionNames.BUSINESS),
  });

  const { data: productDetails = [], isLoading: isLoadingProductDetails } = useQuery({
    queryKey: ['productDetails'],
    queryFn: () => fetchGetCollections<IProductDetail>(ECollectionNames.PRODUCT_DETAIL),
    enabled: products.length > 0,
  });

  const { data: orderForms = [], isLoading: isLoadingOrderForms } = useQuery({
    queryKey: ['warehouse-receipt'],
    queryFn: () => fetchGetCollections<IOrderForm>(ECollectionNames.ORDER_FORM),
    enabled: businesses.length > 0,
    select: (data: IOrderForm[]) => data.filter(form => form.status === OrderFormStatus.PENDING),
  });

  const { data: warehouseReceipts = [], isLoading: isLoadingWarehouseReceipts } = useQuery({
    queryKey: ['warehouse-receipts'],
    queryFn: () => fetchGetCollections<IWarehouseReceipt>(ECollectionNames.WAREHOUSE_RECEIPT),
  });

  // Thêm useEffect để xử lý dữ liệu và cập nhật SelectDropdown
  useEffect(() => {
    if (orderForms.length > 0) {
      // Cập nhật danh sách options cho SelectDropdown
      const newOrderFormOptions = orderForms.map(form => ({
        label: `${formatReceiptCode(form._id, new Date(form.created_at))} - ${formatShortDate(new Date(form.created_at))}`,
        value: form._id
      }));
      setOrderFormOptions(newOrderFormOptions);

      // Kiểm tra xem phiếu đặt hàng hiện tại có còn tồn tại trong danh sách mới không
      const currentOrderFormExists = orderForms.some(form => form._id === orderForm._id);

      // Nếu phiếu đặt hàng hiện tại không tồn tại hoặc chưa có phiếu nào được chọn
      if (!currentOrderFormExists || !orderForm._id) {
        const firstOrderForm = orderForms[0];
        setOrderForm(firstOrderForm);

        // Quan trọng: Chỉ chuyển các trường cần thiết, giữ nguyên ID của sản phẩm
        setWarehouseReceipt(prev => ({
          ...prev,
          supplier_id: firstOrderForm.supplier_id,
          supplier_receipt_id: firstOrderForm._id,
          product_details: firstOrderForm.product_details.map(detail => ({
            ...detail, // Giữ nguyên _id từ phiếu đặt hàng
            date_of_manufacture: '',
            expiry_date: '',
            note: ''
          } as IWarehouseProductDetail))
        }));
      }
    } else if (orderFormOptions.length > 0) {
      // Chỉ reset khi có dữ liệu cần reset
      setOrderFormOptions([]);
      setOrderForm(DEFAULT_ORDER_FORM);
      setWarehouseReceipt(DEFAULT_WAREHOUST_RECEIPT);
    }
  }, [orderForms]);

  // Derived states
  const isLoading = isLoadingProducts || isLoadingUnits || isLoadingBusinesses ||
    isLoadingProductDetails || isLoadingOrderForms || isLoadingWarehouseReceipts;

  // Prepare dropdown options
  const productOptions = React.useMemo(() => {
    // Tạo options từ products thay vì productDetails
    if (products.length === 0) return [];

    return products.map(product => ({
      label: product.name || '',
      value: product._id
    }));
  }, [products]);

  const supplierOptions = React.useMemo(() =>
    businesses
      .filter(b => b.type === EBusinessType.SUPPLIER)
      .map(supplier => ({
        label: supplier.name,
        value: supplier._id
      })), [businesses]);

  const unitOptions = React.useMemo(() =>
    units.map(unit => ({
      label: unit.name,
      value: unit._id
    })), [units]);

  // Date filters
  const dateFilters: IDateFilter[] = [
    { label: 'Tất cả', days: 0, value: '0' },
    { label: 'Hôm nay', days: 1, value: '1' },
    { label: '7 ngày qua', days: 7, value: '7' },
    { label: 'Tháng này', days: 30, value: '30' },
    { label: 'Tháng trước', days: 60, value: '60' },
  ];

  // Sắp xếp danh sách phiếu nhập kho
  const sortedWarehouseReceipts = React.useMemo(() => {
    return [...warehouseReceipts].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [warehouseReceipts]);

  // Handlers
  const handleSaveClick = useCallback(async () => {
    if (isSaving) return;

    if (!warehouseReceipt.supplier_receipt_id || !warehouseReceipt.supplier_id) {
      return;
    }

    if (!warehouseReceipt.product_details || warehouseReceipt.product_details.length === 0) {
      return;
    }

    // Kiểm tra số lượng hợp lệ
    const invalidQuantity = warehouseReceipt.product_details.some(detail => !detail.quantity || detail.quantity <= 0);
    if (invalidQuantity) {
      createNotification({
        children: 'Số lượng sản phẩm không được để trống hoặc nhỏ hơn 1',
        type: ENotificationType.WARNING,
        isAutoClose: true
      });
      return;
    }

    // Kiểm tra giá nhập
    const invalidPrice = warehouseReceipt.product_details.some(detail => !detail.input_price || detail.input_price <= 0);
    if (invalidPrice) {
      createNotification({
        children: 'Giá nhập không được để trống hoặc nhỏ hơn 1',
        type: ENotificationType.WARNING,
        isAutoClose: true
      });
      return;
    }

    // Kiểm tra ngày sản xuất và hạn sử dụng
    const missingDates = warehouseReceipt.product_details.some(detail => !detail.date_of_manufacture || !detail.expiry_date);
    if (missingDates) {
      createNotification({
        children: 'Ngày sản xuất và hạn sử dụng không được để trống',
        type: ENotificationType.WARNING,
        isAutoClose: true
      });
      return;
    }

    // Kiểm tra nếu có sản phẩm nào có HSD <= NSX thì không cho lưu
    const invalidDates = warehouseReceipt.product_details.some(detail => {
      if (!detail.date_of_manufacture || !detail.expiry_date) return false;

      const mfgDate = new Date(detail.date_of_manufacture);
      const expDate = new Date(detail.expiry_date);

      return mfgDate >= expDate;
    });

    if (invalidDates) {
      createNotification({
        children: 'Ngày hết hạn phải lớn hơn ngày sản xuất',
        type: ENotificationType.WARNING,
        isAutoClose: true
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await addCollection(warehouseReceipt, collectionName);

      if (response.status === EStatusCode.OK || response.status === EStatusCode.CREATED) {
        // Update order form status
        await updateOrderStatus(warehouseReceipt.supplier_receipt_id, OrderFormStatus.COMPLETED);

        // Refetch lại danh sách phiếu nhập kho
        await queryClient.invalidateQueries({ queryKey: ['warehouse-receipts'] });
        // Refetch lại danh sách phiếu đặt hàng (SelectDropdown)
        await queryClient.invalidateQueries({ queryKey: ['warehouse-receipt'] });

        // Sau khi invalidate, filter lại state nếu cần
        setOrderFormOptions(prev => prev.filter(option => option.value !== warehouseReceipt.supplier_receipt_id));

        // Reset form
        setOrderForm(DEFAULT_ORDER_FORM);
        setWarehouseReceipt(DEFAULT_WAREHOUST_RECEIPT);
      } else {
        throw new Error('Failed to save warehouse receipt');
      }
    } catch (error) {
      console.error('Error saving warehouse receipt:', error);
    } finally {
      setIsSaving(false);
    }
  }, [warehouseReceipt, isSaving, queryClient]);

  const handleOpenModal = useCallback((prev: boolean): boolean => {
    return !prev;
  }, []);

  const additionalProcessing = useCallback((items: IWarehouseReceipt[]): IWarehouseReceipt[] => {
    if (!dateFilter || dateFilter === '0') {
      setFilteredReceiptCount(items.length);
      return items;
    }

    try {
      const filterDays = parseInt(dateFilter);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let filteredReceipts: IWarehouseReceipt[] = [];

      if (filterDays === 30) {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredReceipts = items.filter(receipt => {
          const receiptDate = new Date(receipt.created_at);
          return receiptDate >= firstDayOfMonth && receiptDate <= today;
        });
      } else if (filterDays === 60) {
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        filteredReceipts = items.filter(receipt => {
          const receiptDate = new Date(receipt.created_at);
          return receiptDate >= firstDayOfLastMonth && receiptDate <= lastDayOfLastMonth;
        });
      } else {
        const pastDate = new Date(today);
        pastDate.setDate(pastDate.getDate() - (filterDays - 1));

        filteredReceipts = items.filter(receipt => {
          const receiptDate = new Date(receipt.created_at);
          return receiptDate >= pastDate && receiptDate <= today;
        });
      }

      setFilteredReceiptCount(filteredReceipts.length);
      return filteredReceipts;
    } catch {
      setFilteredReceiptCount(items.length);
      return items;
    }
  }, [dateFilter]);

  const renderDateFilters = useCallback((): ReactElement => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Text className="text-gray-700 font-medium">Lọc theo thời gian:</Text>
            {filteredReceiptCount > 0 && (
              <div className="bg-blue-100 text-blue-800 text-xs font-medium rounded-full px-2.5 py-1">
                {filteredReceiptCount} phiếu
              </div>
            )}
          </div>
          <div className="w-60">
            <SelectDropdown
              className="bg-white border-blue-200 hover:border-blue-400"
              options={dateFilters.map(filter => ({
                label: filter.label,
                value: filter.value
              }))}
              defaultOptionIndex={getSelectedOptionIndex(
                dateFilters.map(filter => ({
                  label: filter.label,
                  value: filter.value
                })),
                dateFilter
              )}
              onInputChange={(e): void => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }, [dateFilter, filteredReceiptCount]);

  const renderContent = useCallback((): ReactElement => {
    return (
      <Tabs>
        <TabItem label={translateCollectionName(collectionName)}>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-10 mb-10">
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-10">
                <InputSection label="Chọn phiếu đặt hàng" gridColumns="180px 1fr">
                  <SelectDropdown
                    isLoading={isLoading}
                    isDisable={isModalReadOnly}
                    options={orderFormOptions}
                    defaultOptionIndex={getSelectedOptionIndex(orderFormOptions, orderForm._id)}
                    onInputChange={(e): void => {
                      const selectedForm = orderForms.find(form => form._id === e.target.value);
                      if (selectedForm) {
                        setOrderForm(selectedForm);

                        // Cập nhật warehouseReceipt với dữ liệu từ phiếu đặt hàng mới
                        // Đảm bảo giữ đúng ID sản phẩm và thông tin khác
                        setWarehouseReceipt(prev => ({
                          ...prev,
                          supplier_id: selectedForm.supplier_id,
                          supplier_receipt_id: selectedForm._id,
                          product_details: selectedForm.product_details.map(detail => ({
                            ...detail, // Giữ nguyên thông tin sản phẩm từ phiếu đặt hàng
                            date_of_manufacture: '',
                            expiry_date: '',
                            note: ''
                          } as IWarehouseProductDetail))
                        }));
                      }
                    }}
                    className="border-blue-300 hover:border-blue-500 focus:border-blue-600 text-md px-4 py-3 rounded-xl shadow-sm"
                  />
                </InputSection>

                <InputSection label="Nhà cung cấp" gridColumns="180px 1fr">
                  <Text className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[46px] flex items-center text-md font-semibold">
                    {businesses.find(b => b._id === orderForm.supplier_id)?.name || 'Không có lựa chọn'}
                  </Text>
                </InputSection>
              </div>

              <div className="mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="bg-blue-100 rounded-t-lg py-2 text-center">
                      <div className="inline-flex items-center justify-center text-blue-700 font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                          <path d="M9 14l2 2 4-4"></path>
                        </svg>
                        PHIẾU ĐẶT HÀNG
                      </div>
                    </div>
                    <div className="grid grid-cols-5 bg-blue-500 p-2 font-bold text-center text-white" style={{ gridTemplateColumns: "30px 1fr 1fr 1fr 1fr" }}>
                      <div className="flex justify-center items-center">#</div>
                      <div className="flex justify-center items-center">Tên sản phẩm</div>
                      <div className="flex justify-center items-center">Đơn vị tính</div>
                      <div className="flex justify-center items-center">Số lượng</div>
                      <div className="flex justify-center items-center">Giá</div>
                    </div>
                  </div>
                  <div>
                    <div className="bg-green-100 rounded-t-lg py-2 text-center">
                      <div className="inline-flex items-center justify-center text-green-700 font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z"></path>
                          <path d="M12 7v10"></path>
                          <path d="M7 12h10"></path>
                        </svg>
                        PHIẾU NHẬP KHO
                      </div>
                    </div>
                    <div className="grid grid-cols-7 bg-green-500 p-2 font-bold text-center text-white">
                      <div className="flex justify-center items-center">Tên sản phẩm</div>
                      <div className="flex justify-center items-center">Đơn vị tính</div>
                      <div className="flex justify-center items-center">Số lượng</div>
                      <div className="flex justify-center items-center">NSX</div>
                      <div className="flex justify-center items-center">HSD</div>
                      <div className="flex justify-center items-center">Giá</div>
                      <div className="flex justify-center items-center">Ghi chú</div>
                    </div>
                  </div>
                </div>

                {orderForm && orderForm.product_details && orderForm.product_details.map((orderFormProductDetail: IOrderFormProductDetail, index: number) => {
                  const warehouseProductDetail = warehouseReceipt.product_details[index];

                  // Tìm sản phẩm dựa vào ID trực tiếp từ products
                  const product = products.find(p => p._id === orderFormProductDetail._id);
                  const productName = product?.name || '';

                  return (
                    <div key={index} className="grid grid-cols-2 gap-6 border-b border-gray-100 py-3 hover:bg-gray-50 transition-all items-center relative">
                      <div className="grid grid-cols-5 items-center gap-1" style={{ gridTemplateColumns: "30px 1fr 1fr 1fr 1fr" }}>
                        <div className="text-center font-bold text-gray-700">{index + 1}</div>
                        <div className="flex justify-center items-center">
                          {/* Hiển thị tên sản phẩm từ products */}
                          <SelectDropdown
                            isLoading={isLoading}
                            isDisable={true}
                            options={productOptions}
                            defaultOptionIndex={getSelectedOptionIndex(productOptions, orderFormProductDetail._id)}
                            className="bg-gray-50 border border-gray-200 rounded-lg w-full"
                          />
                        </div>
                        <div className="flex justify-center items-center">
                          <SelectDropdown
                            isLoading={isLoading}
                            isDisable={true}
                            options={unitOptions}
                            defaultOptionIndex={getSelectedOptionIndex(unitOptions, orderFormProductDetail.unit_id)}
                            className="bg-gray-50 border border-gray-200 rounded-lg w-full"
                          />
                        </div>
                        <div className="flex justify-center items-center">
                          <NumberInput
                            min={1}
                            max={100}
                            name={`quantity`}
                            isDisable={true}
                            value={orderFormProductDetail.quantity + ``}
                            className="bg-gray-200 border border-gray-200 rounded-lg text-center font-bold w-full"
                          />
                        </div>
                        <div className="text-center text-blue-700 font-bold">{orderFormProductDetail.input_price ? orderFormProductDetail.input_price.toLocaleString('vi-VN') : ''}</div>
                      </div>

                      {/* Mũi tên thể hiện luồng dữ liệu */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 items-center gap-1">
                        <div className="flex justify-center items-center">
                          <SelectDropdown
                            isLoading={isLoading}
                            isDisable={true}
                            options={productOptions}
                            defaultOptionIndex={getSelectedOptionIndex(productOptions, warehouseProductDetail?._id)}
                            className="bg-gray-50 border border-gray-200 rounded-lg w-full"
                          />
                        </div>
                        <div className="flex justify-center items-center">
                          <SelectDropdown
                            isLoading={isLoading}
                            isDisable={true}
                            options={unitOptions}
                            defaultOptionIndex={getSelectedOptionIndex(unitOptions, warehouseProductDetail?.unit_id)}
                            className="bg-gray-50 border border-gray-200 rounded-lg w-full"
                          />
                        </div>
                        <div className="flex justify-center items-center relative">
                          <NumberInput
                            min={1}
                            max={100}
                            name={`quantity`}
                            isDisable={isModalReadOnly}
                            value={warehouseProductDetail?.quantity + ''}
                            onInputChange={(e): void => handleChangeWarehouseReceiptProductQuantity(e, index)}
                            className="border-green-300 hover:border-green-500 focus:border-green-600 rounded-lg text-center font-bold w-full"
                          />
                          {(!warehouseProductDetail?.quantity || warehouseProductDetail?.quantity <= 0) && (
                            <div className="absolute -top-2 -right-1">
                              <span className="bg-red-500 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center" title="Bắt buộc">!</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-center items-center relative">
                          <input
                            type="date"
                            name={`date_of_manufacture`}
                            disabled={isModalReadOnly}
                            value={warehouseProductDetail?.date_of_manufacture || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                              setWarehouseReceipt(prev => {
                                const newProductDetails = [...prev.product_details];
                                newProductDetails[index] = {
                                  ...newProductDetails[index],
                                  date_of_manufacture: e.target.value
                                } as IWarehouseProductDetail;
                                return {
                                  ...prev,
                                  product_details: newProductDetails
                                };
                              });
                            }}
                            className="border border-gray-200 rounded-lg py-1 text-center focus:border-green-400 w-full"
                            style={{ minWidth: '110px' }}
                            placeholder="dd/mm/yyyy"
                          />
                          {!warehouseProductDetail?.date_of_manufacture && (
                            <div className="absolute -top-2 -right-1">
                              <span className="bg-red-500 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center" title="Bắt buộc">!</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-center items-center relative">
                          <input
                            type="date"
                            name={`expiry_date`}
                            disabled={isModalReadOnly}
                            value={warehouseProductDetail?.expiry_date || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                              setWarehouseReceipt(prev => {
                                const newProductDetails = [...prev.product_details];
                                newProductDetails[index] = {
                                  ...newProductDetails[index],
                                  expiry_date: e.target.value
                                } as IWarehouseProductDetail;
                                return {
                                  ...prev,
                                  product_details: newProductDetails
                                };
                              });
                            }}
                            className="border border-gray-200 rounded-lg py-1 text-center focus:border-green-400 w-full"
                            style={{ minWidth: '110px' }}
                            placeholder="dd/mm/yyyy"
                          />
                          {!warehouseProductDetail?.expiry_date && (
                            <div className="absolute -top-2 -right-1">
                              <span className="bg-red-500 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center" title="Bắt buộc">!</span>
                            </div>
                          )}
                          {warehouseProductDetail?.date_of_manufacture && warehouseProductDetail?.expiry_date &&
                            new Date(warehouseProductDetail.date_of_manufacture) >= new Date(warehouseProductDetail.expiry_date) && (
                              <div className="absolute -bottom-10 left-0 right-0">
                                <span className="bg-red-100 text-red-700 text-xs font-medium py-1 px-2 rounded-lg w-full block text-center">
                                  HSD phải lớn hơn NSX
                                </span>
                              </div>
                            )}
                        </div>
                        <div className="flex justify-center items-center relative">
                          <input
                            type="text"
                            name={`input_price`}
                            disabled={isModalReadOnly}
                            value={warehouseProductDetail?.input_price ? formatCurrency(warehouseProductDetail.input_price) : ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                              const numericValue = parseCurrency(e.target.value);
                              if (isNaN(numericValue) && e.target.value !== '') return;

                              setWarehouseReceipt(prev => {
                                const newProductDetails = [...prev.product_details];
                                newProductDetails[index] = {
                                  ...newProductDetails[index],
                                  input_price: numericValue
                                } as IWarehouseProductDetail;
                                return {
                                  ...prev,
                                  product_details: newProductDetails
                                };
                              });
                            }}
                            className="border border-gray-200 rounded-lg py-1 text-center focus:border-green-400 font-bold w-full"
                            placeholder="Nhập giá..."
                          />
                          {(!warehouseProductDetail?.input_price || warehouseProductDetail?.input_price <= 0) && (
                            <div className="absolute -top-2 -right-1">
                              <span className="bg-red-500 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center" title="Bắt buộc">!</span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-center items-center">
                          <input
                            type="text"
                            name="note"
                            disabled={isModalReadOnly}
                            value={warehouseProductDetail?.note || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                              setWarehouseReceipt(prev => {
                                const newProductDetails = [...prev.product_details];
                                newProductDetails[index] = {
                                  ...newProductDetails[index],
                                  note: e.target.value
                                } as IWarehouseProductDetail;
                                return {
                                  ...prev,
                                  product_details: newProductDetails
                                };
                              });
                            }}
                            className="border border-gray-200 rounded-lg py-1 w-full text-center"
                            placeholder="Ghi chú..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabItem>
      </Tabs>
    );
  }, [isLoading, isModalReadOnly, notificationElements, orderForm, warehouseReceipt, productOptions, unitOptions, orderFormOptions, supplierOptions, isClickShowMore, isClickDelete, isSaving, handleSaveClick]);

  const columns: Array<IColumnProps<collectionType>> = [
    {
      key: `index`,
      ref: useRef(null),
      title: `#`,
      size: `1fr`,
    },
    {
      key: `_id`,
      ref: useRef(null),
      title: `Mã phiếu nhập`,
      size: `6fr`,
      render: (collection: collectionType): ReactElement => {
        const receiptCode = formatReceiptCode(collection._id, new Date(collection.created_at));
        return <Text isEllipsis={true} tooltip={receiptCode} className="font-medium text-blue-600">{receiptCode}</Text>;
      }
    },
    {
      key: `product_details`,
      ref: useRef(null),
      title: `Số sản phẩm`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement => {
        return <Text className="text-center">{collection.product_details.length}</Text>;
      }
    },
    {
      key: `created_at`,
      ref: useRef(null),
      title: `Ngày tạo`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        const date: string = formatShortDate(new Date(collection.created_at));
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `updated_at`,
      ref: useRef(null),
      title: `Ngày cập nhật`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        const date: string = formatShortDate(new Date(collection.updated_at));
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      title: `Thao tác`,
      ref: useRef(null),
      size: `6fr`,
      render: (collection: collectionType): ReactElement => (
        <div className="flex gap-2 justify-center items-center">

          <Button
            title={createMoreInfoTooltip(collectionName)}
            onClick={(): void => {
              setIsClickShowMore({
                id: collection._id,
                isClicked: !isClickShowMore.isClicked,
              });
            }}
            className="bg-white hover:bg-blue-50 border border-blue-200 rounded-full w-9 h-9 flex items-center justify-center"
          >
            <IconContainer
              tooltip={createMoreInfoTooltip(collectionName)}
              iconLink={infoIcon}
              className="text-blue-500"
            />
          </Button>
          <Button
            title={createDeleteTooltip(collectionName)}
            onClick={(): void => {
              setIsClickDelete({
                id: collection._id,
                isClicked: !isClickShowMore.isClicked,
              });
            }}
            className="bg-white hover:bg-red-50 border border-red-200 rounded-full w-9 h-9 flex items-center justify-center"
          >
            <IconContainer
              tooltip={createDeleteTooltip(collectionName)}
              iconLink={trashIcon}
              className="text-red-500"
            />
          </Button>
          <Button
            type={EButtonType.TRANSPARENT}
            onClick={(): void => {
              window.location.href = `/home/warehouse-receipt/${collection._id}`;
            }}
            className="bg-white hover:bg-blue-50 border border-blue-200 rounded-full w-9 h-9 flex items-center justify-center"
          >
            <IconContainer
              tooltip="In phiếu nhập kho"
              iconLink="/icons/print.svg"
              className="text-blue-500"
            />
          </Button>
        </div>
      )
    },
  ];

  return (
    <ManagerPage
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_WAREHOUST_RECEIPT}
      collection={warehouseReceipt}
      setCollection={setWarehouseReceipt}
      isModalReadonly={isModalReadOnly}
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
      handleOpenModal={handleOpenModal}
      additionalProcessing={additionalProcessing}
      renderFilters={renderDateFilters}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    >
      {renderContent()}
    </ManagerPage>
  );
}

export default WarehouseReceiptProvider;