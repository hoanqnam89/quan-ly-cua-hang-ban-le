'use client';

import { Button, IconContainer, NumberInput, SelectDropdown, Text } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { infoIcon, plusIcon, trashIcon } from '@/public';
import printIcon from '@/public/icons/print.svg';

import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { IProduct } from '@/interfaces/product.interface';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import styles from './style.module.css';
import { getCollectionCount } from '@/services/api-service';
import useNotificationsHook from '@/hooks/notifications-hook';
import { ENotificationType } from '@/components/notify/notification/notification';
import { IOrderForm, IOrderFormProductDetail, OrderFormStatus } from '@/interfaces/order-form.interface';
import { DEFAULT_ORDER_FORM } from '@/constants/order-form.constant';
import InputSection from '../components/input-section/input-section';
import { IUnit } from '@/interfaces/unit.interface';
import { fetchBusinessNames, fetchProductsBySupplier } from '@/utils/fetch-helpers';
import { IExtendedSelectOption } from '@/interfaces/extended-select-option.interface';
import { addCollection } from '@/services/api-service';
import { EStatusCode } from '@/enums';
import { formatCurrency } from '@/utils/format-currency';



type collectionType = IOrderForm;
const collectionName: ECollectionNames = ECollectionNames.ORDER_FORM;

interface IDateFilter {
  label: string;
  days: number;
  value: string;
}

export default function Product() {
  const { createNotification, notificationElements } = useNotificationsHook();
  const [orderForm, setOrderForm] = useState<collectionType>(
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
  const [isProductLoading, setIsProductLoading] = useState<boolean>(true);
  const [isBusinessLoading, setIsBusinessLoading] = useState<boolean>(true);
  const [isUnitLoading, setIsUnitLoading] = useState<boolean>(true);
  const [productOptions, setProductOptions] =
    useState<IExtendedSelectOption[]>([]);
  const [filteredProductOptions, setFilteredProductOptions] =
    useState<IExtendedSelectOption[]>([]);
  const [businessOptions, setBusinessOptions] = useState<ISelectOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<ISelectOption[]>([]);
  const [productDetailCount, setProductDetailCount] = useState<number>(-1);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('0');
  const [filteredOrderCount, setFilteredOrderCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [allOrders, setAllOrders] = useState<collectionType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const itemsPerPage = 10;

  // Danh sách các bộ lọc ngày
  const dateFilters: IDateFilter[] = [
    { label: 'Tất cả', days: 0, value: '0' },
    { label: 'Hôm nay', days: 1, value: '1' },
    { label: '7 ngày qua', days: 7, value: '7' },
    { label: 'Tháng này', days: 30, value: '30' },
    { label: 'Tháng trước', days: 60, value: '60' },
  ];

  // Hàm tạo mã đơn đặt hàng
  const generateOrderCode = (id: string): string => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const dateStr = `${day}${month}${year}`;

    // Tạo số thứ tự từ id
    const sequence = id.substring(id.length - 4).padStart(4, '0');

    return `DH-${dateStr}-${sequence}`;
  };

  const setCollectionCount = async (
    collectionName: ECollectionNames,
    setCollection: Dispatch<SetStateAction<number>>,
  ): Promise<void> => {
    const getCollectionCountResponse: Response =
      await getCollectionCount(collectionName);
    const getCollectionCountJson: number =
      await getCollectionCountResponse.json();

    setCollection(getCollectionCountJson);
  }

  useEffect((): void => {
    setCollectionCount(ECollectionNames.PRODUCT_DETAIL, setProductDetailCount);
  }, []);

  const getBusinesses: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      try {
        setIsBusinessLoading(true);
        // Sử dụng API mới để chỉ lấy tên nhà cung cấp
        const businessList = await fetchBusinessNames();

        setBusinessOptions(businessList);

        if (businessList.length > 0) {
          setOrderForm((prevOrderForm) => ({
            ...prevOrderForm,
            supplier_id: businessList[0].value,
          }));
        }

        setIsBusinessLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhà cung cấp:", error);
        setIsBusinessLoading(false);
        createNotification({
          id: 1,
          children: <Text>Không thể lấy danh sách nhà cung cấp. Vui lòng thử lại.</Text>,
          type: ENotificationType.ERROR,
          isAutoClose: true,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect((): void => {
    getBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ gọi một lần khi component mount

  // Thay đổi hàm lấy sản phẩm để chỉ lấy sản phẩm theo nhà cung cấp
  const getProductsForBusiness = useCallback(async (businessId: string): Promise<void> => {
    if (!businessId) return;

    try {
      setIsProductLoading(true);

      // Sử dụng API mới để lấy sản phẩm theo nhà cung cấp
      const productOptions = await fetchProductsBySupplier(businessId);

      setProductOptions(productOptions);
      setFilteredProductOptions([...productOptions]);

      setIsProductLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo nhà cung cấp:", error);
      setIsProductLoading(false);
      createNotification({
        id: 2,
        children: <Text>Không thể lấy danh sách sản phẩm. Vui lòng thử lại.</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true,
      });
    }
  }, [createNotification]);

  // Thêm useEffect mới để lấy sản phẩm khi supplier_id thay đổi
  useEffect(() => {
    const currentSupplierId = orderForm.supplier_id;
    if (currentSupplierId) {
      getProductsForBusiness(currentSupplierId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderForm.supplier_id]); // Chỉ phụ thuộc vào supplier_id, không phụ thuộc vào getProductsForBusiness

  // Cập nhật hàm handleChangeBusinessId
  const handleChangeBusinessId = useCallback((e: ChangeEvent<HTMLSelectElement>): void => {
    const newBusinessId = e.target.value;

    // Cập nhật supplier_id và xóa danh sách sản phẩm
    setOrderForm(prevOrderForm => ({
      ...prevOrderForm,
      supplier_id: newBusinessId,
      product_details: [], // Xóa tất cả sản phẩm hiện tại khi thay đổi nhà cung cấp
    }));

    // Không cần lọc sản phẩm ở đây vì useEffect sẽ tự động gọi getProductsForBusiness
  }, []); // Loại bỏ dependency orderForm để tránh vòng lặp vô hạn

  const getUnits: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newUnits: IUnit[] = await fetchGetCollections<IUnit>(
        ECollectionNames.UNIT,
      );

      setUnitOptions([
        ...newUnits.map((unit: IUnit): ISelectOption => ({
          label: `${unit.name}`,
          value: unit._id,
        }))
      ]);
      setIsUnitLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect((): void => {
    getUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: Array<IColumnProps<collectionType>> = [
    {
      key: `index`,
      ref: useRef(null),
      title: `#`,
      size: `1fr`,
    },
    {
      key: 'code' as keyof collectionType,
      ref: useRef(null),
      title: `Mã đơn`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        const orderCode = generateOrderCode(collection._id);
        return <Text isEllipsis={true} tooltip={orderCode}>{orderCode}</Text>
      }
    },
    {
      key: `created_at`,
      ref: useRef(null),
      title: `Ngày tạo`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement => {
        const date: string = new Date(collection.created_at).toLocaleDateString('vi-VN');
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `status`,
      ref: useRef(null),
      title: `Trạng thái`,
      size: `2fr`,
      render: (collection: collectionType): ReactElement => {
        const isCompleted = collection.status === OrderFormStatus.COMPLETED;
        return (
          <div className={`inline-flex items-center justify-center`}>
            {isCompleted ? (
              <div className="px-4 py-2.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-medium inline-flex items-center gap-1.5 min-w-[160px] justify-center shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <Text className="font-semibold">Hoàn thành</Text>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium inline-flex items-center gap-1.5 min-w-[160px] justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-yellow-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
                  <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                <Text className="font-semibold">Chưa hoàn thành</Text>
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: `Thao tác`,
      ref: useRef(null),
      size: `4fr`,
      render: (collection: collectionType): ReactElement => (
        <div className="flex items-center justify-center gap-4">
          {/* Nút xem thêm */}
          <Button
            title={createMoreInfoTooltip(collectionName)}
            onClick={(): void => {
              setIsClickShowMore({
                id: collection._id,
                isClicked: !isClickShowMore.isClicked,
              });
            }}
            className="hover:bg-blue-50 p-2 rounded-full text-blue-500 hover:text-blue-600 transition-all"
          >
            <IconContainer
              tooltip={createMoreInfoTooltip(collectionName)}
              iconLink={infoIcon}
              className="w-5 h-5"
            />
          </Button>

          {/* Nút xóa */}
          <Button
            title={createDeleteTooltip(collectionName)}
            onClick={(): void => {
              setIsClickDelete({
                id: collection._id,
                isClicked: !isClickDelete.isClicked,
              });
            }}
            className="hover:bg-red-50 p-2 rounded-full text-red-500 hover:text-red-600 transition-all"
          >
            <IconContainer
              tooltip={createDeleteTooltip(collectionName)}
              iconLink={trashIcon}
              className="w-5 h-5"
            />
          </Button>
          {/* Nút in phiếu đặt hàng */}
          <Button
            title="In phiếu đặt hàng"
            onClick={(): void => {
              window.location.href = `/home/order-form/${collection._id}`;
            }}
            className="hover:bg-gray-100 p-2 rounded-full text-black hover:text-gray-700 transition-all shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
          </Button>
        </div>
      )
    },
  ];

  const handleAddOrderFormProduct = useCallback(() => {
    if (filteredProductOptions.length === 0) {
      createNotification({
        id: 0,
        children: <Text>Không có sản phẩm nào của nhà cung cấp này</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true,
      });
      return;
    }

    setOrderForm(prevOrderForm => {
      if (prevOrderForm.product_details.length >= filteredProductOptions.length) {
        createNotification({
          id: 0,
          children: <Text>Đã thêm tất cả sản phẩm của nhà cung cấp này vào phiếu đặt hàng</Text>,
          type: ENotificationType.ERROR,
          isAutoClose: true,
        });
        return prevOrderForm;
      }

      // Tìm sản phẩm chưa được thêm vào
      const availableProducts = filteredProductOptions.filter(
        option => !prevOrderForm.product_details.some(detail => detail._id === option.value)
      );

      if (availableProducts.length === 0) {
        createNotification({
          id: 0,
          children: <Text>Đã thêm tất cả sản phẩm của nhà cung cấp này vào phiếu đặt hàng</Text>,
          type: ENotificationType.ERROR,
          isAutoClose: true,
        });
        return prevOrderForm;
      }

      // Lấy giá nhập mặc định từ option hoặc 0 nếu không có
      const inputPrice = availableProducts[0].input_price || 0;

      const productToAdd = {
        _id: availableProducts[0].value, // ID của product - đây là ID sản phẩm
        unit_id: unitOptions.length > 0 ? unitOptions[0].value : '',
        quantity: 1,
        input_price: 0, // Luôn mặc định là 0 để bắt buộc người dùng nhập
      };

      return {
        ...prevOrderForm,
        product_details: [
          ...prevOrderForm.product_details,
          productToAdd
        ],
      };
    });
  }, [filteredProductOptions, unitOptions, createNotification]);

  const handleDeleteOrderFormProduct = useCallback((deleteIndex: number) => {
    setOrderForm(prevOrderForm => ({
      ...prevOrderForm,
      product_details: [
        ...prevOrderForm.product_details.filter((
          _orderFormProductDetail: IOrderFormProductDetail,
          index: number
        ): boolean => index !== deleteIndex),
      ],
    }));
  }, []);

  const handleChangeOrderFormProductId = useCallback((
    e: ChangeEvent<HTMLSelectElement>,
    changeIndex: number,
  ): void => {
    setOrderForm(prevOrderForm => ({
      ...prevOrderForm,
      product_details: [
        ...prevOrderForm.product_details.map((
          orderFormProductDetail: IOrderFormProductDetail,
          index: number
        ): IOrderFormProductDetail => {
          if (index === changeIndex)
            return {
              ...orderFormProductDetail,
              _id: e.target.value
            }
          else
            return orderFormProductDetail;
        }),
      ],
    }));
  }, []);

  const handleChangeOrderFormProductUnitId = useCallback((
    e: ChangeEvent<HTMLSelectElement>,
    changeIndex: number,
  ): void => {
    setOrderForm(prevOrderForm => ({
      ...prevOrderForm,
      product_details: [
        ...prevOrderForm.product_details.map((
          orderFormProductDetail: IOrderFormProductDetail,
          index: number
        ): IOrderFormProductDetail => {
          if (index === changeIndex)
            return {
              ...orderFormProductDetail,
              unit_id: e.target.value
            }
          else
            return orderFormProductDetail;
        }),
      ],
    }));
  }, []);

  const handleChangeOrderFormProductQuantity = useCallback((
    e: ChangeEvent<HTMLInputElement>,
    changeIndex: number,
  ): void => {
    setOrderForm(prevOrderForm => ({
      ...prevOrderForm,
      product_details: [
        ...prevOrderForm.product_details.map((
          orderFormProductDetail: IOrderFormProductDetail,
          index: number
        ): IOrderFormProductDetail => {
          if (index === changeIndex)
            return {
              ...orderFormProductDetail,
              quantity: +e.target.value
            }
          else
            return orderFormProductDetail;
        }),
      ],
    }));
  }, []);

  const handleChangeOrderFormProductInputPrice = useCallback((
    e: ChangeEvent<HTMLInputElement>,
    changeIndex: number,
  ): void => {
    // Chuyển đổi chuỗi thành số bằng cách loại bỏ dấu chấm trong định dạng tiền tệ
    const rawValue = e.target.value.replace(/\./g, '').replace(/\D/g, '');
    const numericValue = parseInt(rawValue, 10) || 0;

    // Hiển thị gợi ý khi giá nhập = 0
    if (numericValue === 0 && e.target.value !== '') {
      // Tìm tên sản phẩm để hiển thị trong thông báo
      const productDetail = orderForm.product_details[changeIndex];
      const productName = filteredProductOptions.find(option => option.value === productDetail?._id)?.label || 'sản phẩm';

      // Hiển thị thông báo nhỏ tạm thời thay vì notification lớn
      e.target.setCustomValidity(`Vui lòng nhập giá cho ${productName}`);
      e.target.reportValidity();
      setTimeout(() => {
        e.target.setCustomValidity('');
      }, 2000);
    }

    // Gán giá trị đã xử lý vào form
    setOrderForm(prevOrderForm => ({
      ...prevOrderForm,
      product_details: [
        ...prevOrderForm.product_details.map((
          orderFormProductDetail: IOrderFormProductDetail,
          index: number
        ): IOrderFormProductDetail => {
          if (index === changeIndex)
            return {
              ...orderFormProductDetail,
              input_price: numericValue
            }
          else
            return orderFormProductDetail;
        }),
      ],
    }));
  }, [orderForm.product_details, filteredProductOptions]);

  const handleOpenModal = useCallback((prev: boolean): boolean => {
    // Chỉ trả về false nếu modal đang mở
    if (prev === true) {
      return false;
    }
    return true;
  }, []);

  // Lọc đơn hàng theo thời gian
  const handleChangeDateFilter = useCallback((e: ChangeEvent<HTMLSelectElement>): void => {
    setDateFilter(e.target.value);
  }, []);

  // Cập nhật hàm onExitModalForm
  const onExitModalForm = useCallback(() => {
    // Không thực hiện gì nếu đang đóng modal hoặc không có nhà cung cấp
    if (isModalReadOnly || businessOptions.length === 0) return;

    // Sử dụng nhà cung cấp đầu tiên
    const initialBusinessId = businessOptions[0].value;

    // Đặt lại form về trạng thái mặc định
    setOrderForm({
      ...DEFAULT_ORDER_FORM,
      supplier_id: initialBusinessId,
      status: OrderFormStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Không cần lọc sản phẩm ở đây vì useEffect sẽ tự động gọi getProductsForBusiness

  }, [isModalReadOnly, businessOptions]);

  // Hàm xử lý lọc dữ liệu theo thời gian
  const filterOrdersByDate = useCallback((orders: collectionType[]): collectionType[] => {
    // Nếu là lọc tất cả, hoặc không có bộ lọc
    if (!dateFilter || dateFilter === '0') {
      setFilteredOrderCount(orders.length);
      return orders;
    }

    try {
      const filterDays = parseInt(dateFilter);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Xử lý các trường hợp đặc biệt (tháng này, tháng trước)
      let filteredOrders: collectionType[] = [];

      if (filterDays === 30) { // Tháng này
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= firstDayOfMonth && orderDate <= today;
        });
      } else if (filterDays === 60) { // Tháng trước
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= firstDayOfLastMonth && orderDate <= lastDayOfLastMonth;
        });
      } else { // Hôm nay và 7 ngày qua
        const pastDate = new Date(today);
        pastDate.setDate(pastDate.getDate() - (filterDays - 1));

        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= pastDate && orderDate <= today;
        });
      }

      setFilteredOrderCount(filteredOrders.length);
      return filteredOrders;
    } catch {
      setFilteredOrderCount(orders.length);
      return orders;
    }
  }, [dateFilter]);

  // Hàm xử lý dữ liệu để hiển thị trong bảng
  const processOrdersData = useCallback((orders: collectionType[]): collectionType[] => {
    // Chỉ lọc, không slice
    const filteredOrders = filterOrdersByDate(orders);
    return filteredOrders;
  }, [filterOrdersByDate]);

  // Cập nhật filteredProductOptions khi không có sản phẩm
  useEffect(() => {
    if (filteredProductOptions.length === 0 && productOptions.length > 0) {
      // const message = 'Không tìm thấy sản phẩm nào cho nhà cung cấp này';
    }
  }, [filteredProductOptions, productOptions]);

  // Dùng useMemo để tối ưu hóa các option
  // const memoizedFilteredOptions = useMemo(() =>
  //   productOptions.filter(
  //     option => option.supplier_id === orderForm.supplier_id
  //   ),
  //   [productOptions, orderForm.supplier_id]
  // );

  // Dùng useMemo cho dateFilter options
  const dateFilterOptions = useMemo(() =>
    dateFilters.map(filter => ({
      label: filter.label,
      value: filter.value
    })),
    [dateFilters]
  );

  // Cập nhật hàm renderDateFilters
  const renderDateFilters = useCallback((): ReactElement => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Text className="text-gray-700 font-medium">Lọc theo thời gian:</Text>
            {filteredOrderCount > 0 && (
              <div className="bg-blue-100 text-blue-800 text-xs font-medium rounded-full px-2.5 py-1">
                {filteredOrderCount} phiếu
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
  }, [dateFilterOptions, dateFilter, filteredOrderCount, handleChangeDateFilter]);

  // 1. Fetch 1 lần khi mount
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const orders = await fetchGetCollections<collectionType>(collectionName);
      setAllOrders(orders);
      const newOrders = orders.map((order) => {
        const newOrder = { ...order };
        newOrder.product = generateOrderCode(order._id)

        return newOrder;
      })
      setAllOrders(newOrders)
    } catch (e) {
      // handle error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  // 3. Lọc và phân trang trên client
  const filteredOrders = useMemo(() => {
    if (!allOrders.length) return [];
    // Lọc theo ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      switch (dateFilter) {
        case '0': return true;
        case '1': return orderDate >= today;
        case '7':
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return orderDate >= sevenDaysAgo;
        case '30':
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          return orderDate >= firstDayOfMonth;
        case '60':
          const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          return orderDate >= firstDayOfLastMonth && orderDate <= lastDayOfLastMonth;
        default: return true;
      }
    });
  }, [allOrders, dateFilter]);


  // Reset trang về 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter]);

  // Cập nhật số lượng phiếu đã lọc
  useEffect(() => {
    setFilteredOrderCount(filteredOrders.length);
  }, [filteredOrders]);

  const handleSaveClick = useCallback(async () => {
    if (isSaving) return;

    if (!orderForm.supplier_id) {
      createNotification({
        id: 0,
        children: <Text>Vui lòng chọn nhà cung cấp</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true,
      });
      return;
    }

    if (!orderForm.product_details || orderForm.product_details.length === 0) {
      createNotification({
        id: 0,
        children: <Text>Vui lòng thêm sản phẩm vào phiếu đặt hàng</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true,
      });
      return;
    }

    const invalidQuantity = orderForm.product_details.some(detail => !detail.quantity || detail.quantity <= 0);
    if (invalidQuantity) {
      createNotification({
        id: 0,
        children: <Text>Vui lòng nhập số lượng hợp lệ cho tất cả sản phẩm</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true,
      });
      return;
    }

    // Kiểm tra giá nhập phải lớn hơn 0
    const invalidPrice = orderForm.product_details.some(detail => !detail.input_price || detail.input_price <= 0);
    if (invalidPrice) {
      // Tìm sản phẩm có giá nhập = 0 để hiển thị thông báo cụ thể hơn
      const zeroPrice = orderForm.product_details.find(detail => detail.input_price === 0);
      const emptyPrice = orderForm.product_details.find(detail => !detail.input_price);

      // Hiển thị thông báo tùy theo loại lỗi
      if (zeroPrice || emptyPrice) {
        // Lấy tên sản phẩm để hiển thị trong thông báo
        const productWithIssue = zeroPrice || emptyPrice;
        const productName = filteredProductOptions.find(option => option.value === productWithIssue?._id)?.label || 'sản phẩm';

        createNotification({
          id: 0,
          children: <Text>Vui lòng nhập giá cho sản phẩm {productName}</Text>,
          type: ENotificationType.ERROR,
          isAutoClose: true,
        });
      } else {
        createNotification({
          id: 0,
          children: <Text>Vui lòng nhập giá nhập lớn hơn 0 cho tất cả sản phẩm</Text>,
          type: ENotificationType.ERROR,
          isAutoClose: true,
        });
      }
      return;
    }

    try {
      setIsSaving(true);
      const response = await addCollection(orderForm, collectionName);

      if (response.status === EStatusCode.OK || response.status === EStatusCode.CREATED) {
        // Cập nhật lại danh sách phiếu đặt hàng
        const updatedOrders = await fetchGetCollections<collectionType>(collectionName);
        setAllOrders(updatedOrders);

        // Reset form nhưng giữ lại supplier_id
        setOrderForm({
          ...DEFAULT_ORDER_FORM,
          supplier_id: orderForm.supplier_id,
        });

        createNotification({
          id: 0,
          children: <Text>Lưu phiếu đặt hàng thành công</Text>,
          type: ENotificationType.SUCCESS,
          isAutoClose: true,
        });
      } else {
        // Cố gắng đọc thông báo lỗi từ response
        const errorData = await response.json();
        console.error('Error response:', errorData);

        // Kiểm tra nếu lỗi liên quan đến giá nhập
        if (errorData?.details?.includes('giá nhập') ||
          errorData?.message?.includes('giá nhập') ||
          errorData?.message?.includes('input price') ||
          errorData?.details?.includes('input price')) {
          createNotification({
            id: 0,
            children: <Text>Vui lòng nhập giá cho tất cả sản phẩm</Text>,
            type: ENotificationType.ERROR,
            isAutoClose: true,
          });
        } else {
          throw new Error(errorData?.message || 'Failed to save order form');
        }
      }
    } catch (error) {
      console.error('Error saving order form:', error);

      // Hiển thị thông báo lỗi cụ thể hơn nếu có
      let errorMessage = 'Có lỗi xảy ra khi lưu phiếu đặt hàng';

      if (error instanceof Error) {
        if (error.message.includes('giá nhập') || error.message.includes('input price')) {
          errorMessage = 'Vui lòng nhập giá cho tất cả sản phẩm';
        } else if (error.message.includes('số lượng') || error.message.includes('quantity')) {
          errorMessage = 'Vui lòng nhập số lượng hợp lệ cho tất cả sản phẩm';
        }
      }

      createNotification({
        id: 0,
        children: <Text>{errorMessage}</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [orderForm, isSaving, createNotification]);

  // Hàm định dạng tiền tệ 
  const formatInputPrice = (value: number | undefined): string => {
    if (value === undefined || value === null) return "0";
    // Format số với dấu chấm phân cách hàng nghìn theo chuẩn Việt Nam (1.000.000)
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };


  return (
    <>
      <ManagerPage
        columns={columns}
        collectionName={collectionName}
        defaultCollection={DEFAULT_ORDER_FORM}
        collection={orderForm}
        setCollection={setOrderForm}
        isModalReadonly={isModalReadOnly}
        setIsModalReadonly={setIsModalReadOnly}
        isClickShowMore={isClickShowMore}
        isClickDelete={isClickDelete}
        isLoaded={isLoading || isProductLoading || isBusinessLoading || isUnitLoading}
        handleOpenModal={handleOpenModal}
        onExitModalForm={onExitModalForm}
        dateFilter={dateFilter}
        renderFilters={renderDateFilters}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalItems={filteredOrders.length}
      >
        {filteredOrders.length === 0
          ? <Text>Không có dữ liệu</Text>
          : <>
            <Tabs>
              <TabItem label={`Phiếu đặt hàng`}>
                <InputSection label={`Nhà cung cấp`} className="mb-6">
                  <SelectDropdown
                    className="bg-white border-blue-200 hover:border-blue-400"
                    isLoading={isBusinessLoading}
                    isDisable={isModalReadOnly}
                    options={businessOptions}
                    defaultOptionIndex={getSelectedOptionIndex(
                      businessOptions,
                      (orderForm.supplier_id
                        ? orderForm.supplier_id
                        : 0
                      ) as unknown as string
                    )}
                    onInputChange={handleChangeBusinessId}
                  >
                  </SelectDropdown>
                </InputSection>

                <div className={styles['product-form-container']}>
                  <div className={`grid items-center ${styles[`good-receipt-product-table-with-price`]} bg-gradient-to-r from-blue-600 to-blue-500 py-4 px-4 rounded-lg font-medium mb-4 shadow-md text-white`}>
                    <Text className="font-bold">#</Text>
                    <Text className="font-bold">Tên sản phẩm</Text>
                    <Text className="font-bold">Giá nhập (đ)</Text>
                    <Text className="font-bold">Đơn vị tính</Text>
                    <Text className="font-bold">Số lượng</Text>
                    <Text className="font-bold">Thao tác</Text>
                  </div>

                  {filteredProductOptions.length === 0 && orderForm.supplier_id && !isProductLoading && (
                    <div className="text-center py-10 bg-yellow-50 rounded-lg border border-dashed border-yellow-300 mb-4 shadow-inner">
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-full">
                          <IconContainer iconLink={infoIcon} className="w-10 h-10 text-amber-500"></IconContainer>
                        </div>
                        <div>
                          <Text className="text-lg font-medium text-amber-700">Nhà cung cấp này chưa có sản phẩm nào</Text>
                          <Text className="text-sm text-amber-600 mt-2">Vui lòng chọn nhà cung cấp khác hoặc thêm sản phẩm cho nhà cung cấp này trước</Text>
                        </div>
                      </div>
                    </div>
                  )}

                  {orderForm.product_details.length === 0 && filteredProductOptions.length > 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-4 shadow-inner">
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-full">
                          <IconContainer iconLink={plusIcon} className="w-10 h-10 text-blue-500"></IconContainer>
                        </div>
                        <div>
                          <Text className="text-lg font-medium text-gray-700">Chưa có sản phẩm nào trong phiếu đặt hàng</Text>
                          <Text className="text-sm text-gray-500 mt-2">Bấm nút &apos;Thêm sản phẩm&apos; phía dưới để thêm sản phẩm vào phiếu đặt hàng</Text>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Danh sách sản phẩm */}
                  {orderForm.product_details.map((
                    orderFormProductDetail: IOrderFormProductDetail,
                    index: number
                  ): ReactElement => {
                    return <div
                      key={index}
                      className={`grid items-center ${styles[`good-receipt-product-table-with-price`]} ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} py-4 border border-gray-200 rounded-lg mb-3 shadow-sm hover:shadow transition-all`}
                    >
                      {/* Nội dung sản phẩm */}
                      <Text className="font-medium ml-3 text-gray-700">{index + 1}</Text>

                      <SelectDropdown
                        className="bg-white border-blue-200 hover:border-blue-400"
                        isLoading={isProductLoading}
                        isDisable={isModalReadOnly}
                        options={filteredProductOptions}
                        defaultOptionIndex={getSelectedOptionIndex(
                          filteredProductOptions,
                          (orderFormProductDetail._id
                            ? orderFormProductDetail._id
                            : 0
                          ) as unknown as string
                        )}
                        onInputChange={(e): void =>
                          handleChangeOrderFormProductId(e, index)
                        }
                      >
                      </SelectDropdown>

                      {/* Trường nhập giá nhập */}
                      <NumberInput
                        min={0}
                        name={`input_price`}
                        isDisable={isModalReadOnly}
                        isRequire={true}
                        value={formatInputPrice(orderFormProductDetail.input_price)}
                        onInputChange={(e): void =>
                          handleChangeOrderFormProductInputPrice(e, index)
                        }
                      >
                      </NumberInput>

                      <SelectDropdown
                        className="bg-white border-blue-200 hover:border-blue-400"
                        isLoading={isUnitLoading}
                        isDisable={isModalReadOnly}
                        options={unitOptions}
                        defaultOptionIndex={getSelectedOptionIndex(
                          unitOptions,
                          (orderFormProductDetail.unit_id
                            ? orderFormProductDetail.unit_id
                            : 0
                          ) as unknown as string
                        )}
                        onInputChange={(e): void =>
                          handleChangeOrderFormProductUnitId(e, index)
                        }
                      >
                      </SelectDropdown>

                      <NumberInput
                        min={1}
                        max={100}
                        name={`quantity`}
                        isDisable={isModalReadOnly}
                        value={orderFormProductDetail.quantity + ``}
                        onInputChange={(e): void =>
                          handleChangeOrderFormProductQuantity(e, index)
                        }
                      >
                      </NumberInput>

                      <div className="flex justify-center">
                        <Button
                          isDisable={isModalReadOnly}
                          onClick={(): void => handleDeleteOrderFormProduct(index)}
                          className="hover:bg-red-50 p-2 rounded-full text-red-500 hover:text-red-600 transition-all"
                          title="Xóa sản phẩm này"
                        >
                          <IconContainer iconLink={trashIcon} className="w-5 h-5"></IconContainer>
                        </Button>
                      </div>
                    </div>
                  })}

                  {/* Nút thêm sản phẩm */}
                  <Button
                    isDisable={isModalReadOnly || isProductLoading || isBusinessLoading || filteredProductOptions.length === 0}
                    onClick={handleAddOrderFormProduct}
                    className={`flex items-center justify-center gap-2 mt-6 w-full py-4 rounded-lg shadow-md ${styles['sticky-add-button']} ${filteredProductOptions.length === 0 || isModalReadOnly ?
                      'bg-gray-200 opacity-50 cursor-not-allowed text-gray-500' :
                      'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transition-all'
                      }`}
                    type={EButtonType.SUCCESS}
                  >
                    <IconContainer iconLink={plusIcon} className="w-5 h-5"></IconContainer>
                    <Text className="font-medium">Thêm sản phẩm</Text>
                  </Button>
                </div>
              </TabItem>

            </Tabs>

            {notificationElements}
          </>
        }
      </ManagerPage>
    </>
  );
}
