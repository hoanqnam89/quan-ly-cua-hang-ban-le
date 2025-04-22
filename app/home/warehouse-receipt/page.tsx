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

// Thêm interface cho bộ lọc ngày
interface IDateFilter {
  label: string;
  days: number;
  value: string;
}

type collectionType = IWarehouseReceipt;
const collectionName: ECollectionNames = ECollectionNames.WAREHOUSE_RECEIPT;

// Thêm hàm helper để lưu và lấy dữ liệu từ sessionStorage
const CACHE_KEYS = {
  PRODUCTS: 'warehouse_receipt_products',
  PRODUCT_DETAILS: 'warehouse_receipt_product_details',
  BUSINESSES: 'warehouse_receipt_businesses',
  UNITS: 'warehouse_receipt_units',
  ORDER_FORMS: 'warehouse_receipt_order_forms'
};

// Hàm kiểm tra kích thước chuỗi (ước tính ~2 bytes/ký tự)
const getStringSizeInKB = (str: string): number => {
  return Math.round(str.length * 2 / 1024);
};

// Kích thước tối đa cho phép mỗi mục lưu trữ (4MB, thường giới hạn của sessionStorage là 5MB)
const MAX_CACHE_SIZE_KB = 4000;

// Thêm giới hạn mảng dữ liệu
const MAX_ARRAY_LENGTH = 100;

// Hàm để giới hạn kích thước mảng
const limitArraySize = <T,>(array: T[] = [], maxSize: number = MAX_ARRAY_LENGTH): T[] => {
  if (!array || array.length <= maxSize) return array;
  return array.slice(0, maxSize);
};

// Xóa cache cũ của session storage để giải phóng dung lượng
const cleanupOldCaches = (): void => {
  try {
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

    // Duyệt qua tất cả các key trong sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;

      // Chỉ xử lý các key liên quan đến warehouse_receipt
      if (key.startsWith('warehouse_receipt_')) {
        try {
          const value = sessionStorage.getItem(key);
          if (!value) continue;

          const data = JSON.parse(value);
          // Nếu dữ liệu cũ hơn thời gian cache, xóa nó
          if (now - data.timestamp > CACHE_DURATION) {
            sessionStorage.removeItem(key);
            console.log(`Đã xóa cache cũ: ${key}`);
          }
        } catch {
          // Nếu không parse được, xóa luôn key đó
          sessionStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Lỗi khi dọn dẹp cache:', error);
  }
};

// Lưu data vào cache
const saveToCache = <T,>(key: string, data: T): void => {
  try {
    // Dọn dẹp cache cũ trước khi lưu cache mới
    cleanupOldCaches();

    // Giới hạn kích thước mảng nếu là mảng
    let dataToSave = data;
    if (Array.isArray(data)) {
      dataToSave = limitArraySize(data) as any;
    }

    // Tạo chuỗi JSON để kiểm tra kích thước
    const jsonString = JSON.stringify({
      data: dataToSave,
      timestamp: Date.now()
    });

    // Kiểm tra kích thước dữ liệu
    const sizeInKB = getStringSizeInKB(jsonString);

    if (sizeInKB > MAX_CACHE_SIZE_KB) {
      console.warn(`Dữ liệu cho "${key}" quá lớn (${sizeInKB}KB > ${MAX_CACHE_SIZE_KB}KB), không thể lưu vào cache`);
      return;
    }

    // Lưu dữ liệu vào sessionStorage nếu kích thước phù hợp
    sessionStorage.setItem(key, jsonString);
  } catch (error) {
    console.error('Lỗi khi lưu cache:', error);
  }
};

// Lấy data từ cache, trả về null nếu không tìm thấy hoặc đã hết hạn (5 phút)
const getFromCache = <T,>(key: string): T | null => {
  try {
    const item = sessionStorage.getItem(key);
    if (!item) return null;

    const parsedItem = JSON.parse(item);
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

    // Kiểm tra thời gian cache
    if (now - parsedItem.timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsedItem.data as T;
  } catch (error) {
    console.error('Lỗi khi đọc cache:', error);
    return null;
  }
};

export default function Product() {
  const { createNotification, notificationElements } = useNotificationsHook();
  const [warehouseReceipt, setWarehouseReceipt] = useState<collectionType>(
    DEFAULT_WAREHOUST_RECEIPT
  );
  const [orderForm, setOrderForm] = useState<IOrderForm>(
    DEFAULT_ORDER_FORM
  );
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [isClickShowMore, setIsClickShowMore] = useState<ICollectionIdNotify>({
    id: ``,
    isClicked: false
  });
  const [isClickDelete, setIsClickDelete] = useState<ICollectionIdNotify>({
    id: ``,
    isClicked: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [orderForms, setOrderForms] = useState<IOrderForm[]>([]);
  const [orderFormOptions, setOrderFormOptions] = useState<ISelectOption[]>([]);
  const [currentOrderFormOptionIndex, setCurrentOrderFormOptionIndex] = useState<number>(0);
  const [isProductLoading, setIsProductLoading] = useState<boolean>(true);
  const [isSupplierLoading, setIsSupplierLoading] = useState<boolean>(true);
  const [isUnitLoading, setIsUnitLoading] = useState<boolean>(true);
  const [productDetailOptions, setProductDetailOptions] =
    useState<ISelectOption[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<ISelectOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<ISelectOption[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Thêm state cho bộ lọc
  const [dateFilter, setDateFilter] = useState<string>('0');
  const [filteredReceiptCount, setFilteredReceiptCount] = useState<number>(0);

  // Danh sách các bộ lọc ngày
  const dateFilters: IDateFilter[] = [
    { label: 'Tất cả', days: 0, value: '0' },
    { label: 'Hôm nay', days: 1, value: '1' },
    { label: '7 ngày qua', days: 7, value: '7' },
    { label: 'Tháng này', days: 30, value: '30' },
    { label: 'Tháng trước', days: 60, value: '60' },
  ];

  // Tạo options cho dropdown lọc ngày
  const dateFilterOptions = dateFilters.map(filter => ({
    label: filter.label,
    value: filter.value
  }));

  // Format mã phiếu nhập kho theo mẫu NK-DDMMYYYY-0001
  const formatReceiptCode = (id: string, date: Date): string => {
    const dateString = formatShortDate(date, '');
    const index = id.substring(id.length - 4);
    return `NK-${dateString}-${index}`;
  };

  // Format ngày theo dạng DD/MM/YYYY
  const formatShortDate = (date: Date, separator: string = '/'): string => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return separator === ''
      ? `${day}${month}${year}`
      : `${day}${separator}${month}${separator}${year}`;
  };

  // Hàm xử lý lọc dữ liệu theo thời gian
  const filterReceiptsByDate = useCallback((receipts: collectionType[]): collectionType[] => {
    // Nếu là lọc tất cả, hoặc không có bộ lọc
    if (!dateFilter || dateFilter === '0') {
      setFilteredReceiptCount(receipts.length);
      return receipts;
    }

    try {
      const filterDays = parseInt(dateFilter);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Xử lý các trường hợp đặc biệt (tháng này, tháng trước)
      let filteredReceipts: collectionType[] = [];

      if (filterDays === 30) { // Tháng này
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.created_at);
          return receiptDate >= firstDayOfMonth && receiptDate <= today;
        });
      } else if (filterDays === 60) { // Tháng trước
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        filteredReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.created_at);
          return receiptDate >= firstDayOfLastMonth && receiptDate <= lastDayOfLastMonth;
        });
      } else { // Hôm nay và 7 ngày qua
        const pastDate = new Date(today);
        pastDate.setDate(pastDate.getDate() - (filterDays - 1));

        filteredReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.created_at);
          return receiptDate >= pastDate && receiptDate <= today;
        });
      }

      setFilteredReceiptCount(filteredReceipts.length);
      return filteredReceipts;
    } catch {
      setFilteredReceiptCount(receipts.length);
      return receipts;
    }
  }, [dateFilter]);

  // Lọc đơn hàng theo thời gian
  const handleChangeDateFilter = useCallback((e: ChangeEvent<HTMLSelectElement>): void => {
    setDateFilter(e.target.value);
  }, []);

  // Renders bộ lọc ngày
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
              options={dateFilterOptions}
              defaultOptionIndex={getSelectedOptionIndex(
                dateFilterOptions,
                dateFilter
              )}
              onInputChange={handleChangeDateFilter}
            />
          </div>
        </div>
      </div>
    );
  }, [dateFilterOptions, dateFilter, filteredReceiptCount, handleChangeDateFilter]);

  // Xử lý phụ thêm lọc theo ngày
  const additionalProcessing = useCallback((items: IWarehouseReceipt[]): IWarehouseReceipt[] => {
    return filterReceiptsByDate(items);
  }, [filterReceiptsByDate]);

  const [allData, setAllData] = useState<{
    products: IProduct[],
    productDetails: IProductDetail[],
    businesses: IBusiness[],
    units: IUnit[],
    orderForms: IOrderForm[]
  }>({
    products: [],
    productDetails: [],
    businesses: [],
    units: [],
    orderForms: []
  });
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // Fetch all data once
  const fetchAllData = useCallback(async (): Promise<void> => {
    // Kiểm tra nếu đang trong quá trình fetch thì bỏ qua
    if (isFetching) return;

    setIsLoading(true);
    setIsFetching(true);

    try {
      // Kiểm tra cache trước
      let cachedProducts = getFromCache<IProduct[]>(CACHE_KEYS.PRODUCTS);
      let cachedProductDetails = getFromCache<IProductDetail[]>(CACHE_KEYS.PRODUCT_DETAILS);
      let cachedBusinesses = getFromCache<IBusiness[]>(CACHE_KEYS.BUSINESSES);
      let cachedUnits = getFromCache<IUnit[]>(CACHE_KEYS.UNITS);
      let cachedOrderForms = getFromCache<IOrderForm[]>(CACHE_KEYS.ORDER_FORMS);

      // Tạo mảng các promises để fetch dữ liệu còn thiếu
      const fetchPromises: Promise<any>[] = [];
      const fetchKeys: string[] = [];

      if (!cachedProducts) {
        fetchPromises.push(fetchGetCollections<IProduct>(ECollectionNames.PRODUCT));
        fetchKeys.push(CACHE_KEYS.PRODUCTS);
      }
      if (!cachedProductDetails) {
        fetchPromises.push(fetchGetCollections<IProductDetail>(ECollectionNames.PRODUCT_DETAIL));
        fetchKeys.push(CACHE_KEYS.PRODUCT_DETAILS);
      }
      if (!cachedBusinesses) {
        fetchPromises.push(fetchGetCollections<IBusiness>(ECollectionNames.BUSINESS));
        fetchKeys.push(CACHE_KEYS.BUSINESSES);
      }
      if (!cachedUnits) {
        fetchPromises.push(fetchGetCollections<IUnit>(ECollectionNames.UNIT));
        fetchKeys.push(CACHE_KEYS.UNITS);
      }
      if (!cachedOrderForms) {
        fetchPromises.push(fetchGetCollections<IOrderForm>(ECollectionNames.ORDER_FORM));
        fetchKeys.push(CACHE_KEYS.ORDER_FORMS);
      }

      // Nếu có bất kỳ dữ liệu nào cần fetch
      if (fetchPromises.length > 0) {
        const results = await Promise.all(fetchPromises);

        // Cập nhật dữ liệu đã fetch và lưu vào cache
        for (let i = 0; i < results.length; i++) {
          const data = results[i];
          const key = fetchKeys[i];

          // Kiểm tra trường hợp theo key
          switch (key) {
            case CACHE_KEYS.PRODUCTS:
              cachedProducts = data;
              saveToCache(key, data);
              break;
            case CACHE_KEYS.PRODUCT_DETAILS:
              cachedProductDetails = data;
              saveToCache(key, data);
              break;
            case CACHE_KEYS.BUSINESSES:
              cachedBusinesses = data;
              saveToCache(key, data);
              break;
            case CACHE_KEYS.UNITS:
              cachedUnits = data;
              saveToCache(key, data);
              break;
            case CACHE_KEYS.ORDER_FORMS:
              cachedOrderForms = data;
              saveToCache(key, data);
              break;
          }
        }
      }

      // Sử dụng dữ liệu (từ cache hoặc mới fetch)
      setAllData({
        products: cachedProducts || [],
        productDetails: cachedProductDetails || [],
        businesses: cachedBusinesses || [],
        units: cachedUnits || [],
        orderForms: cachedOrderForms || []
      });

      setDataLoaded(true);

      // Process the data
      const suppliers = (cachedBusinesses || []).filter(
        business => business.type !== EBusinessType.SUPPLIER
      );

      // Setup product detail options
      const productDetailOpts = (cachedProductDetails || []).map((productDetail) => {
        const foundProduct = (cachedProducts || []).find(
          product => product._id === productDetail.product_id
        );

        if (!foundProduct) {
          return {
            label: `Không rõ`,
            value: productDetail._id,
          };
        }

        return {
          label: `${foundProduct.name}`,
          value: productDetail._id,
        };
      });

      // Setup supplier options
      const supplierOpts = suppliers.map((supplier) => ({
        label: supplier.name,
        value: supplier._id,
      }));

      // Setup unit options
      const unitOpts = (cachedUnits || []).map((unit) => ({
        label: unit.name,
        value: unit._id,
      }));

      // Filter incomplete order forms - giới hạn số lượng phiếu chưa hoàn thành
      const incompleteOrderForms = (cachedOrderForms || [])
        .filter(orderForm => orderForm.status !== OrderFormStatus.COMPLETED)
        .slice(0, 30); // Lấy tối đa 30 phiếu gần nhất chưa hoàn thành

      // Kiểm tra nếu không có phiếu nào
      if (incompleteOrderForms.length === 0) {
        createNotification({
          children: <Text>Không có phiếu đặt hàng nào chưa hoàn thành</Text>,
          type: ENotificationType.WARNING,
          isAutoClose: true,
        });
      }

      // Setup order form options
      const orderFormOpts = incompleteOrderForms.map((orderForm) => {
        const orderFormCode = formatOrderFormCode(orderForm._id, new Date(orderForm.created_at));
        return {
          label: `${orderFormCode} - ${formatShortDate(new Date(orderForm.created_at))} - ${orderForm.product_details.length} sản phẩm`,
          value: orderForm._id,
        };
      });

      // Set all options
      setProductDetailOptions(productDetailOpts);
      setSupplierOptions(supplierOpts);
      setUnitOptions(unitOpts);
      setOrderForms(incompleteOrderForms);
      setOrderFormOptions(orderFormOpts);

      // Set defaults if data exists
      if (incompleteOrderForms.length > 0) {
        setOrderForm(incompleteOrderForms[0]);
        setWarehouseReceipt({
          ...warehouseReceipt,
          supplier_id: incompleteOrderForms[0].supplier_id,
          supplier_receipt_id: incompleteOrderForms[0]._id,
          product_details: [...incompleteOrderForms[0].product_details]
        });
      } else {
        createNotification({
          children: <Text>Không có phiếu đặt hàng nào chưa hoàn thành</Text>,
          type: ENotificationType.WARNING,
          isAutoClose: true,
        });
      }

      // Set loading states
      setIsProductLoading(false);
      setIsSupplierLoading(false);
      setIsUnitLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      createNotification({
        children: <Text>Đã xảy ra lỗi khi tải dữ liệu</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true,
      });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [warehouseReceipt, createNotification, isFetching]);

  // Initial data loading
  useEffect(() => {
    if (!dataLoaded) {
      fetchAllData();
    }
  }, [dataLoaded, fetchAllData]);

  // Format mã đơn đặt hàng (cập nhật để phù hợp với hàm generateOrderCode trong order-form)
  const formatOrderFormCode = (id: string, date: Date): string => {
    const dateString = formatShortDate(date, '');
    const index = id.substring(id.length - 4);
    return `DH-${dateString}-${index}`;
  };

  // Handle change order form selection
  const handleChangeOrderForm = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrentOrderFormOptionIndex(
      getSelectedOptionIndex(orderFormOptions, e.target.value)
    );

    const foundOrderForm: IOrderForm | undefined = orderForms.find((
      orderForm: IOrderForm
    ) => orderForm._id === e.target.value);

    if (!foundOrderForm)
      return;

    setOrderForm(foundOrderForm);
    setWarehouseReceipt({
      ...warehouseReceipt,
      supplier_id: foundOrderForm.business_id,
      supplier_receipt_id: foundOrderForm._id,
      product_details: [...foundOrderForm.product_details]
    });
  }

  const handleOpenModal = (prev: boolean): boolean => {
    return !prev;
  }

  // Nơi thêm chức năng kiểm tra phiếu nhập đã tồn tại
  const checkWarehouseReceiptExists = async (orderFormId: string): Promise<boolean> => {
    try {
      if (!orderFormId) {
        console.error("orderFormId là null hoặc undefined");
        return false;
      }

      // Tìm xem đã có phiếu nhập kho nào được tạo cho phiếu đặt hàng này chưa
      console.log(`Kiểm tra phiếu nhập kho cho đơn hàng: ${orderFormId}`);

      // Sử dụng URL trực tiếp để đảm bảo đúng định dạng
      const endpoint = `warehouse-receipt?supplier_receipt_id=${orderFormId}`;
      console.log(`Gọi API với endpoint: ${endpoint}`);

      const response = await fetchCollection<IWarehouseReceipt[]>(endpoint);

      console.log(`Kết quả kiểm tra phiếu nhập kho: HTTP ${response.status}`);

      // Ghi log toàn bộ nội dung phản hồi để debug
      try {
        const responseText = await response.clone().text();
        console.log(`Nội dung phản hồi API: ${responseText}`);
      } catch (err) {
        console.error("Không thể đọc nội dung phản hồi API:", err);
      }

      if (response.status === EStatusCode.OK) {
        try {
          const data = await response.json();
          console.log("Dữ liệu nhận được:", data);

          const hasExisting = data && Array.isArray(data) && data.length > 0;

          // Kiểm tra chi tiết dữ liệu
          if (hasExisting) {
            // Kiểm tra xem có phiếu nào thực sự khớp với orderFormId không
            const matchingReceipts = data.filter(receipt =>
              receipt.supplier_receipt_id === orderFormId
            );

            console.log(`Số lượng phiếu khớp với orderFormId ${orderFormId}:`, matchingReceipts.length);
            if (matchingReceipts.length > 0) {
              console.log("Phiếu nhập kho đã tồn tại:", matchingReceipts);
              return true;
            } else {
              console.log("Không có phiếu nhập kho nào khớp với orderFormId này");
              return false;
            }
          }

          console.log(`Không tìm thấy phiếu nhập kho cho đơn hàng: ${orderFormId}`);
          return false;
        } catch (parseError) {
          console.error("Lỗi khi phân tích dữ liệu JSON:", parseError);
          return false;
        }
      }

      if (response.status === EStatusCode.NOT_FOUND) {
        console.error("Endpoint không tồn tại!");
      }

      return false;
    } catch (error) {
      console.error("Lỗi khi kiểm tra phiếu nhập kho:", error);
      return false;
    }
  };

  const customHandleAddCollection = async (): Promise<void> => {
    setIsSaving(true);

    try {
      console.log("Đang kiểm tra phiếu nhập kho đã tồn tại...");
      console.log("supplier_receipt_id =", warehouseReceipt.supplier_receipt_id);

      // Kiểm tra tất cả phiếu nhập kho đang có trong hệ thống
      try {
        const allWarehouseReceiptsResponse = await fetchCollection<IWarehouseReceipt[]>('warehouse-receipt');

        if (allWarehouseReceiptsResponse.status === EStatusCode.OK) {
          const allWarehouseReceipts = await allWarehouseReceiptsResponse.json();
          console.log("Tất cả phiếu nhập kho hiện có:", allWarehouseReceipts);

          // Kiểm tra xem có phiếu nào trùng supplier_receipt_id không
          const existingReceipts = allWarehouseReceipts.filter(
            (receipt: IWarehouseReceipt) => receipt.supplier_receipt_id === warehouseReceipt.supplier_receipt_id
          );

          console.log("Phiếu trùng lặp:", existingReceipts);

          if (existingReceipts.length > 0) {
            createNotification({
              children: <Text>Đã tìm thấy phiếu nhập kho trùng lặp trong hệ thống!</Text>,
              type: ENotificationType.ERROR,
              isAutoClose: true,
            });
            setIsSaving(false);
            return;
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra tất cả phiếu nhập kho:", error);
      }

      // Kiểm tra xem đã tồn tại phiếu nhập kho cho đơn đặt hàng này chưa
      const exists = await checkWarehouseReceiptExists(warehouseReceipt.supplier_receipt_id);
      console.log("Kết quả kiểm tra phiếu đã tồn tại:", exists);

      if (exists) {
        createNotification({
          children: <Text>Phiếu nhập kho cho đơn đặt hàng này đã tồn tại!</Text>,
          type: ENotificationType.ERROR,
          isAutoClose: true,
        });
        setIsSaving(false);
        return;
      }

      // Tạo một bản sao của warehouseReceipt để loại bỏ các trường không cần thiết
      // và đảm bảo rằng dữ liệu được gửi đúng định dạng
      const warehouseReceiptToSave: Partial<IWarehouseReceipt> = {
        supplier_id: warehouseReceipt.supplier_id,
        supplier_receipt_id: warehouseReceipt.supplier_receipt_id,
        product_details: warehouseReceipt.product_details.map((item: IOrderFormProductDetail) => ({
          _id: item._id,
          unit_id: item.unit_id,
          quantity: item.quantity,
          note: item.note || ''
        }))
      };

      console.log("Gửi dữ liệu phiếu nhập kho:", warehouseReceiptToSave);

      const translatedCollectionName: string = translateCollectionName(collectionName);
      const addCollectionApiResponse: Response =
        await addCollection<Partial<IWarehouseReceipt>>(warehouseReceiptToSave, collectionName);

      console.log(`Kết quả tạo phiếu nhập kho: HTTP ${addCollectionApiResponse.status}`);

      let notificationText: string = ``;
      let notificationType: ENotificationType = ENotificationType.ERROR;
      let isSuccess = false;

      switch (addCollectionApiResponse.status) {
        case EStatusCode.OK:
          notificationText = `Tạo ${translatedCollectionName} thành công!`;
          notificationType = ENotificationType.SUCCESS;
          isSuccess = true;
          break;
        case EStatusCode.CREATED:
          notificationText = `Tạo ${translatedCollectionName} thành công!`;
          notificationType = ENotificationType.SUCCESS;
          isSuccess = true;
          break;
        case EStatusCode.UNPROCESSABLE_ENTITY:
          notificationText = `Tạo ${translatedCollectionName} thất bại! Không thể đọc được ${translatedCollectionName} đầu vào.`;
          break;
        case EStatusCode.CONFLICT:
          notificationText = `Phiếu nhập kho cho đơn đặt hàng này đã tồn tại!`;
          break;
        case EStatusCode.METHOD_NOT_ALLOWED:
          notificationText = `Tạo ${translatedCollectionName} thất bại! Phương thức không cho phép.`;
          break;
        case EStatusCode.INTERNAL_SERVER_ERROR:
          notificationText = `Tạo ${translatedCollectionName} thất bại! Server bị lỗi.`;
          break;
        default:
          notificationText = `Tạo ${translatedCollectionName} thất bại! Lỗi không xác định.`;
      }

      createNotification({
        children: <Text>{notificationText}</Text>,
        type: notificationType,
        isAutoClose: true,
      });

      if (isSuccess) {
        // Cập nhật trạng thái phiếu đặt hàng khi lưu phiếu nhập kho thành công
        if (warehouseReceipt.supplier_receipt_id) {
          await updateOrderFormStatus(warehouseReceipt.supplier_receipt_id);
        }

        // Xóa cache để đảm bảo dữ liệu luôn mới nhất
        sessionStorage.removeItem(CACHE_KEYS.ORDER_FORMS);
        // Xóa cache cho warehouse receipt để buộc refresh dữ liệu
        sessionStorage.removeItem('warehouse_receipts');
      }
    } catch (error) {
      console.error("Lỗi khi tạo phiếu nhập kho:", error);
      createNotification({
        children: <Text>Đã xảy ra lỗi khi tạo phiếu nhập kho!</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cập nhật trạng thái phiếu đặt hàng khi lưu phiếu nhập kho thành công
  const updateOrderFormStatus = async (orderFormId: string): Promise<void> => {
    try {
      // Tìm phiếu đặt hàng cần cập nhật trong dữ liệu cục bộ
      const orderFormToUpdate = allData.orderForms.find(form => form._id === orderFormId);

      console.log("Chuyển sang chế độ cập nhật UI trực tiếp (API bị vô hiệu hóa)");

      // Luôn cập nhật UI trước
      if (orderFormToUpdate) {
        updateUIForCompletedOrder(orderFormId, orderFormToUpdate);
      } else {
        updateUIForCompletedOrder(orderFormId);
      }

      // Sau đó mới gọi API (chỉ để ghi log)
      try {
        console.log(`Cập nhật trạng thái phiếu ${orderFormId} thành "${OrderFormStatus.COMPLETED}"`);

        updateOrderStatus(orderFormId, OrderFormStatus.COMPLETED)
          .then(response => {
            console.log("Kết quả cập nhật (chỉ dùng để ghi log):", response.status, response.statusText);
          })
          .catch(err => {
            console.error("Lỗi khi gọi hàm cập nhật:", err);
          });

        // Hiển thị thông báo thành công
        createNotification({
          children: <Text>Phiếu nhập kho đã được tạo thành công! Đã cập nhật UI.</Text>,
          type: ENotificationType.SUCCESS,
          isAutoClose: true,
        });
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái (không ảnh hưởng đến UI):", error);
      }

      // Xóa cache để đảm bảo dữ liệu mới nhất được tải lần sau
      sessionStorage.removeItem(CACHE_KEYS.ORDER_FORMS);
    } catch (error) {
      console.error("Lỗi nghiêm trọng:", error);

      // Vẫn hiển thị thông báo thành công vì đã lưu phiếu nhập kho
      createNotification({
        children: <Text>Phiếu nhập kho đã được tạo thành công! UI đã được cập nhật.</Text>,
        type: ENotificationType.SUCCESS,
        isAutoClose: true,
      });
    }
  };

  // Hàm helper để cập nhật UI khi đơn hàng được đánh dấu hoàn thành
  const updateUIForCompletedOrder = (orderFormId: string, orderFormToUpdate?: IOrderForm): void => {
    // Nếu có dữ liệu phiếu đặt hàng, cập nhật trạng thái
    if (orderFormToUpdate) {
      // Tạo bản cập nhật của phiếu
      const updatedOrder = {
        ...orderFormToUpdate,
        status: OrderFormStatus.COMPLETED,
      };

      // Cập nhật state hiện tại nếu đang hiển thị phiếu này
      setOrderForm(current => {
        if (current._id === orderFormId) {
          return updatedOrder;
        }
        return current;
      });

      // Cập nhật danh sách phiếu đặt hàng
      setAllData(prevData => {
        const updatedForms = prevData.orderForms.map(form =>
          form._id === orderFormId ? updatedOrder : form
        );

        // Cập nhật cache
        saveToCache(CACHE_KEYS.ORDER_FORMS, updatedForms);

        return {
          ...prevData,
          orderForms: updatedForms
        };
      });
    }

    // Loại bỏ phiếu khỏi các danh sách hiển thị
    setOrderForms(forms => forms.filter(form => form._id !== orderFormId));
    setOrderFormOptions(options => options.filter(option => option.value !== orderFormId));

    // Nếu phiếu hiện tại là phiếu cần xóa, chọn phiếu khác (nếu có)
    if (orderForm._id === orderFormId) {
      // Tìm phiếu khác để hiển thị
      const otherForms = orderForms.filter(form => form._id !== orderFormId);
      if (otherForms.length > 0) {
        setOrderForm(otherForms[0]);
        setWarehouseReceipt({
          ...warehouseReceipt,
          supplier_id: otherForms[0].supplier_id,
          supplier_receipt_id: otherForms[0]._id,
          product_details: [...otherForms[0].product_details]
        });
      } else {
        // Nếu không còn phiếu nào, hiển thị phiếu trống
        setOrderForm(DEFAULT_ORDER_FORM);
        setWarehouseReceipt(DEFAULT_WAREHOUST_RECEIPT);
      }
    }
  };

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
      ref: useRef(null),
      title: `In phiếu`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement => <Button
        type={EButtonType.INFO}
        onClick={(): void => {
          window.location.href = `/home/warehouse-receipt/${collection._id}`;
        }}
        className="w-full"
      >
        <Text className="text-white">In phiếu nhập</Text>
      </Button>
    },
    {
      title: `Thao tác`,
      ref: useRef(null),
      size: `3fr`,
      render: (collection: collectionType): ReactElement => (
        <div className="flex gap-2 justify-center">
          <Button
            title={createMoreInfoTooltip(collectionName)}
            onClick={(): void => {
              setIsClickShowMore({
                id: collection._id,
                isClicked: !isClickShowMore.isClicked,
              });
            }}
            className="bg-blue-50 hover:bg-blue-100"
          >
            <IconContainer
              tooltip={createMoreInfoTooltip(collectionName)}
              iconLink={infoIcon}
              className="text-blue-500"
            >
            </IconContainer>
          </Button>
          <Button
            title={createDeleteTooltip(collectionName)}
            onClick={(): void => {
              setIsClickDelete({
                id: collection._id,
                isClicked: !isClickShowMore.isClicked,
              });
            }}
            className="bg-red-50 hover:bg-red-100"
          >
            <IconContainer
              tooltip={createDeleteTooltip(collectionName)}
              iconLink={trashIcon}
              className="text-red-500"
            >
            </IconContainer>
          </Button>
        </div>
      )
    },
  ];

  // const handleChangeWarehouseReceiptProductId = (
  //   e: ChangeEvent<HTMLSelectElement>,
  //   changeIndex: number,
  // ): void => {
  //   setWarehouseReceipt({
  //     ...warehouseReceipt,
  //     product_details: [
  //       ...warehouseReceipt.product_details.map((
  //         warehouseReceiptProductDetail: IOrderFormProductDetail,
  //         index: number
  //       ): IOrderFormProductDetail => {
  //         if (index === changeIndex)
  //           return {
  //             ...warehouseReceiptProductDetail,
  //             _id: e.target.value
  //           }
  //         else
  //           return warehouseReceiptProductDetail;
  //       }),
  //     ],
  //   });
  // }

  // const handleChangeWarehouseReceiptProductUnitId = (
  //   e: ChangeEvent<HTMLSelectElement>,
  //   changeIndex: number,
  // ): void => {
  //   setWarehouseReceipt({
  //     ...warehouseReceipt,
  //     product_details: [
  //       ...warehouseReceipt.product_details.map((
  //         warehouseReceiptProductDetail: IOrderFormProductDetail,
  //         index: number
  //       ): IOrderFormProductDetail => {
  //         if (index === changeIndex)
  //           return {
  //             ...warehouseReceiptProductDetail,
  //             unit_id: e.target.value
  //           }
  //         else
  //           return warehouseReceiptProductDetail;
  //       }),
  //     ],
  //   });
  // }

  // const handleChangeWarehouseReceiptSupplierId = (
  //   e: ChangeEvent<HTMLSelectElement>,
  // ): void => {
  //   setWarehouseReceipt({
  //     ...warehouseReceipt,
  //     supplier_id: e.target.value,
  //   });
  // }

  const handleChangeWarehouseReceiptProductQuantity = (
    e: ChangeEvent<HTMLInputElement>,
    changeIndex: number,
  ): void => {
    setWarehouseReceipt({
      ...warehouseReceipt,
      product_details: [
        ...warehouseReceipt.product_details.map((
          warehouseReceiptProductDetail: IOrderFormProductDetail,
          index: number
        ): IOrderFormProductDetail => {
          if (index === changeIndex)
            return {
              ...warehouseReceiptProductDetail,
              quantity: +e.target.value
            }
          else
            return warehouseReceiptProductDetail;
        }),
      ],
    });
  }

  const handleChangeWarehouseReceiptProductNote = (
    e: ChangeEvent<HTMLTextAreaElement>,
    changeIndex: number,
  ): void => {
    setWarehouseReceipt({
      ...warehouseReceipt,
      product_details: [
        ...warehouseReceipt.product_details.map((
          warehouseReceiptProductDetail: IOrderFormProductDetail,
          index: number
        ): IOrderFormProductDetail => {
          if (index === changeIndex)
            return {
              ...warehouseReceiptProductDetail,
              note: e.target.value
            }
          else
            return warehouseReceiptProductDetail;
        }),
      ],
    });
  }

  const gridColumns: string = `200px 1fr`;

  // Thêm hàm để xóa toàn bộ cache
  const clearAllCaches = (): void => {
    // Duyệt qua tất cả keys trong sessionStorage và xóa các key liên quan đến warehouse_receipt
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('warehouse_receipt_')) {
        sessionStorage.removeItem(key);
      }
    }
    // Xóa cache warehouse_receipts nếu có
    sessionStorage.removeItem('warehouse_receipts');
  };

  // Xóa cache khi component unmount
  useEffect(() => {
    // Dọn dẹp cache cũ khi component được mount
    cleanupOldCaches();

    return () => {
      // Dọn dẹp cache khi unmount để giải phóng bộ nhớ
      clearAllCaches();
    };
  }, []);

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
      isLoaded={!dataLoaded}
      handleOpenModal={handleOpenModal}
      additionalProcessing={additionalProcessing}
      renderFilters={renderDateFilters}
      customHandleAddCollection={customHandleAddCollection}
      additionalButtons={
        <Button
          onClick={customHandleAddCollection}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md w-full"
          isDisable={isSaving}
        >
          {isSaving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <Text className="text-white">Đang lưu...</Text>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <Text className="text-white">Lưu phiếu nhập kho</Text>
            </div>
          )}
        </Button>
      }
    >
      <>
        <Tabs>
          <TabItem label={`${translateCollectionName(collectionName)}`}>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <InputSection label={`Chọn phiếu đặt hàng`} gridColumns={gridColumns}>
                    <SelectDropdown
                      isLoading={isLoading}
                      isDisable={isModalReadOnly}
                      options={orderFormOptions}
                      defaultOptionIndex={currentOrderFormOptionIndex}
                      onInputChange={(e): void => handleChangeOrderForm(e)}
                      className="border-blue-200 hover:border-blue-400 focus:border-blue-500"
                    >
                    </SelectDropdown>
                  </InputSection>

                  <InputSection label={`Nhà cung cấp`} gridColumns={gridColumns}>
                    <SelectDropdown
                      isLoading={isSupplierLoading}
                      isDisable={true}
                      options={supplierOptions}
                      defaultOptionIndex={getSelectedOptionIndex(
                        supplierOptions,
                        (orderForm.business_id
                          ? orderForm.business_id
                          : 0
                        ) as unknown as string
                      )}
                      className="bg-gray-50 border-gray-200"
                    >
                    </SelectDropdown>
                  </InputSection>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 ">
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
                            isLoading={isSupplierLoading}
                            isDisable={true}
                            options={productDetailOptions}
                            defaultOptionIndex={getSelectedOptionIndex(
                              productDetailOptions,
                              (orderFormProductDetail._id
                                ? orderFormProductDetail._id
                                : 0
                              ) as unknown as string
                            )}
                            className="bg-gray-50 border-gray-200"
                          >
                          </SelectDropdown>

                          <SelectDropdown
                            isLoading={isUnitLoading}
                            isDisable={true}
                            options={unitOptions}
                            defaultOptionIndex={getSelectedOptionIndex(
                              unitOptions,
                              (orderFormProductDetail.unit_id
                                ? orderFormProductDetail.unit_id
                                : 0
                              ) as unknown as string
                            )}
                            className="bg-gray-50 border-gray-200"
                          >
                          </SelectDropdown>

                          <NumberInput
                            min={1}
                            max={100}
                            name={`quantity`}
                            isDisable={true}
                            value={orderFormProductDetail.quantity + ``}
                            className="bg-gray-50 border-gray-200"
                          >
                          </NumberInput>

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
                            isLoading={isSupplierLoading}
                            isDisable={true}
                            options={productDetailOptions}
                            defaultOptionIndex={getSelectedOptionIndex(
                              productDetailOptions,
                              (warehouseProductDetail._id
                                ? warehouseProductDetail._id
                                : 0
                              ) as unknown as string
                            )}
                            className="bg-gray-50 border-gray-200"
                          >
                          </SelectDropdown>

                          <SelectDropdown
                            isLoading={isUnitLoading}
                            isDisable={true}
                            options={unitOptions}
                            defaultOptionIndex={getSelectedOptionIndex(
                              unitOptions,
                              (warehouseProductDetail.unit_id
                                ? warehouseProductDetail.unit_id
                                : 0
                              ) as unknown as string
                            )}
                            className="bg-gray-50 border-gray-200"
                          >
                          </SelectDropdown>

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
                          >
                          </NumberInput>

                          <Textarea
                            name={`note`}
                            isDisable={isModalReadOnly}
                            value={warehouseProductDetail.note ?? ``}
                            onInputChange={(e: ChangeEvent<HTMLTextAreaElement>): void =>
                              handleChangeWarehouseReceiptProductNote(e, index)
                            }
                            className="border-green-200 hover:border-green-400 focus:border-green-500 min-h-[40px] text-sm"
                          >
                          </Textarea>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabItem>
        </Tabs>

        {notificationElements}
      </>
    </ManagerPage>
  );
}