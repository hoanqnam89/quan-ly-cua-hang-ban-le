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
import { IWarehouseReceipt } from '@/interfaces/warehouse-receipt.interface';
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
        setWarehouseReceipt(prev => ({
          ...prev,
          supplier_id: firstOrderForm.supplier_id,
          supplier_receipt_id: firstOrderForm._id,
          product_details: [...firstOrderForm.product_details]
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
  const productOptions = React.useMemo(() =>
    productDetails.map(detail => ({
      label: products.find(p => p._id === detail.product_id)?.name || '',
      value: detail._id
    })), [productDetails, products]);

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

    const invalidQuantity = warehouseReceipt.product_details.some(detail => !detail.quantity || detail.quantity <= 0);
    if (invalidQuantity) {
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
      <>
        <Tabs>
          <TabItem label={`${translateCollectionName(collectionName)}`}>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <InputSection label={`Chọn phiếu đặt hàng`} gridColumns="200px 1fr">
                    <SelectDropdown
                      isLoading={isLoading}
                      isDisable={isModalReadOnly}
                      options={orderFormOptions}
                      defaultOptionIndex={getSelectedOptionIndex(orderFormOptions, orderForm._id)}
                      onInputChange={(e): void => {
                        const selectedForm = orderForms.find(form => form._id === e.target.value);
                        if (selectedForm) {
                          setOrderForm(selectedForm);
                          setWarehouseReceipt(prev => ({
                            ...prev,
                            supplier_id: selectedForm.supplier_id,
                            supplier_receipt_id: selectedForm._id,
                            product_details: [...selectedForm.product_details]
                          }));
                        }
                      }}
                      className="border-blue-200 hover:border-blue-400 focus:border-blue-500"
                    />
                  </InputSection>

                  <InputSection label={`Nhà cung cấp`} gridColumns="200px 1fr">
                    <Text className="bg-gray-50 border border-gray-200 rounded px-3 py-2 min-h-[40px] flex items-center">
                      {businesses.find(b => b._id === orderForm.supplier_id)?.name || 'Không có lựa chọn'}
                    </Text>
                  </InputSection>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4">
                      <h3 className="font-semibold text-lg">Thông tin phiếu đặt hàng</h3>
                    </div>
                    <div className="p-4">
                      <div className={`grid items-center ${styles[`order-form-product-table`]} bg-gray-50 p-3 rounded-md mb-2 font-medium`}>
                        <Text>#</Text>
                        <Text>Sản phẩm</Text>
                        <Text>Đơn vị tính</Text>
                        <Text>Số lượng</Text>
                      </div>

                      <div className="max-h-[300px] overflow-y-auto pr-1">
                        {orderForm && orderForm.product_details && orderForm.product_details.map((
                          orderFormProductDetail: IOrderFormProductDetail,
                          index: number
                        ): ReactElement => (
                          <div
                            key={index}
                            className={`grid items-center ${styles[`order-form-product-table`]} border-b border-gray-100 py-2`}
                          >
                            <Text className="font-medium text-gray-700">{index + 1}</Text>

                            <SelectDropdown
                              isLoading={isLoading}
                              isDisable={true}
                              options={productOptions}
                              defaultOptionIndex={getSelectedOptionIndex(
                                productOptions,
                                orderFormProductDetail._id
                              )}
                              className="bg-gray-50 border-gray-200"
                            />

                            <SelectDropdown
                              isLoading={isLoading}
                              isDisable={true}
                              options={unitOptions}
                              defaultOptionIndex={getSelectedOptionIndex(
                                unitOptions,
                                orderFormProductDetail.unit_id
                              )}
                              className="bg-gray-50 border-gray-200"
                            />

                            <NumberInput
                              min={1}
                              max={100}
                              name={`quantity`}
                              isDisable={true}
                              value={orderFormProductDetail.quantity + ``}
                              className="bg-gray-50 border-gray-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4">
                      <h3 className="font-semibold text-lg">Nhập kho từ phiếu đặt hàng</h3>
                    </div>
                    <div className="p-4">
                      <div className={`grid items-center ${styles[`warehouse-receipt-product-table`]} bg-gray-50 p-3 rounded-md mb-2 font-medium`}>
                        <Text>#</Text>
                        <Text>Sản phẩm</Text>
                        <Text>Đơn vị tính</Text>
                        <Text>Số lượng</Text>
                        <Text>Ghi chú</Text>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto pr-2">
                        {warehouseReceipt && warehouseReceipt.product_details && warehouseReceipt.product_details.map((
                          warehouseProductDetail: IOrderFormProductDetail,
                          index: number
                        ): ReactElement => (
                          <div
                            key={index}
                            className={`grid items-center ${styles[`warehouse-receipt-product-table`]} border-b border-gray-100 py-2`}
                          >
                            <Text className="font-medium text-gray-700">{index + 1}</Text>

                            <SelectDropdown
                              isLoading={isLoading}
                              isDisable={true}
                              options={productOptions}
                              defaultOptionIndex={getSelectedOptionIndex(
                                productOptions,
                                warehouseProductDetail._id
                              )}
                              className="bg-gray-50 border-gray-200"
                            />

                            <SelectDropdown
                              isLoading={isLoading}
                              isDisable={true}
                              options={unitOptions}
                              defaultOptionIndex={getSelectedOptionIndex(
                                unitOptions,
                                warehouseProductDetail.unit_id
                              )}
                              className="bg-gray-50 border-gray-200"
                            />

                            <NumberInput
                              min={1}
                              max={100}
                              name={`quantity`}
                              isDisable={isModalReadOnly}
                              value={warehouseProductDetail.quantity + ``}
                              onInputChange={(e): void =>
                                handleChangeWarehouseReceiptProductQuantity(e, index)
                              }
                              className="border-green-200 hover:border-green-400 focus:border-green-500"
                            />

                            <Textarea
                              name={`note`}
                              isDisable={isModalReadOnly}
                              value={warehouseProductDetail.note ?? ``}
                              onInputChange={(e: ChangeEvent<HTMLTextAreaElement>): void =>
                                handleChangeWarehouseReceiptProductNote(e, index)
                              }
                              className="border-green-200 hover:border-green-400 focus:border-green-500 min-h-[40px] text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabItem>
        </Tabs>

        {notificationElements}
      </>
    );
  }, [isLoading, isModalReadOnly, notificationElements, orderForm, warehouseReceipt, productOptions, unitOptions, orderFormOptions, supplierOptions, isClickShowMore, isClickDelete]);

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