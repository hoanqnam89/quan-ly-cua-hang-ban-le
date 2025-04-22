'use client';

import { Button, IconContainer, NumberInput, SelectDropdown, Text } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { infoIcon, plusIcon, trashIcon } from '@/public';
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
  const [productDetailOptions, setProductDetailOptions] =
    useState<IExtendedSelectOption[]>([]);
  const [filteredProductDetailOptions, setFilteredProductDetailOptions] =
    useState<IExtendedSelectOption[]>([]);
  const [businessOptions, setBusinessOptions] = useState<ISelectOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<ISelectOption[]>([]);
  const [productDetailCount, setProductDetailCount] = useState<number>(-1);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('0');
  const [filteredOrderCount, setFilteredOrderCount] = useState<number>(0);

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
            business_id: businessList[0].value,
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

      setProductDetailOptions(productOptions);
      setFilteredProductDetailOptions([...productOptions]);

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

  // Thêm useEffect mới để lấy sản phẩm khi business_id thay đổi
  useEffect(() => {
    const currentBusinessId = orderForm.business_id;
    if (currentBusinessId) {
      getProductsForBusiness(currentBusinessId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderForm.business_id]); // Chỉ phụ thuộc vào business_id, không phụ thuộc vào getProductsForBusiness

  // Cập nhật hàm handleChangeBusinessId
  const handleChangeBusinessId = useCallback((e: ChangeEvent<HTMLSelectElement>): void => {
    const newBusinessId = e.target.value;

    // Cập nhật business_id và xóa danh sách sản phẩm
    setOrderForm(prevOrderForm => ({
      ...prevOrderForm,
      business_id: newBusinessId,
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
      ref: useRef(null),
      title: `In`,
      size: `2fr`,
      render: (collection: collectionType): ReactElement => (
        <Button
          type={EButtonType.INFO}
          onClick={(): void => {
            window.location.href = `/home/order-form/${collection._id}`;
          }}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 min-w-[120px] shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          <span className="text-sm font-medium">In phiếu đặt hàng</span>
        </Button>
      )
    },
    {
      title: `Xem thêm`,
      ref: useRef(null),
      size: `2fr`,
      render: (collection: collectionType): ReactElement => <Button
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
    },
    {
      title: `Xóa`,
      ref: useRef(null),
      size: `2fr`,
      render: (collection: collectionType): ReactElement => <Button
        title={createDeleteTooltip(collectionName)}
        onClick={(): void => {
          setIsClickDelete({
            id: collection._id,
            isClicked: !isClickDelete.isClicked,
          });
        }}
      >
        <IconContainer
          tooltip={createDeleteTooltip(collectionName)}
          iconLink={trashIcon}
        >
        </IconContainer>
      </Button>
    },
  ];

  const handleAddOrderFormProduct = useCallback(() => {
    if (filteredProductDetailOptions.length === 0) {
      createNotification({
        id: 0,
        children: <Text>Không có sản phẩm nào của nhà cung cấp này</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true,
      });
      return;
    }

    setOrderForm(prevOrderForm => {
      if (prevOrderForm.product_details.length >= filteredProductDetailOptions.length) {
        createNotification({
          id: 0,
          children: <Text>Đã thêm tất cả sản phẩm của nhà cung cấp này vào phiếu đặt hàng</Text>,
          type: ENotificationType.ERROR,
          isAutoClose: true,
        });
        return prevOrderForm;
      }

      // Tìm sản phẩm chưa được thêm vào
      const availableProductDetails = filteredProductDetailOptions.filter(
        option => !prevOrderForm.product_details.some(detail => detail._id === option.value)
      );

      if (availableProductDetails.length === 0) {
        createNotification({
          id: 0,
          children: <Text>Đã thêm tất cả sản phẩm của nhà cung cấp này vào phiếu đặt hàng</Text>,
          type: ENotificationType.ERROR,
          isAutoClose: true,
        });
        return prevOrderForm;
      }

      // Lấy giá nhập mặc định từ option hoặc 0 nếu không có
      const inputPrice = availableProductDetails[0].input_price || 0;

      const productToAdd = {
        _id: availableProductDetails[0].value,
        unit_id: unitOptions.length > 0 ? unitOptions[0].value : '',
        quantity: 1,
        input_price: inputPrice, // Thêm giá nhập mặc định
      };

      return {
        ...prevOrderForm,
        product_details: [
          ...prevOrderForm.product_details,
          productToAdd
        ],
      };
    });
  }, [filteredProductDetailOptions, unitOptions, createNotification]);

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
              input_price: +e.target.value
            }
          else
            return orderFormProductDetail;
        }),
      ],
    }));
  }, []);

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
      business_id: initialBusinessId,
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
    const filteredOrders = filterOrdersByDate(orders);
    setFilteredOrderCount(filteredOrders.length);
    return filteredOrders;
  }, [filterOrdersByDate]);

  // Lấy thông tin đơn vị tính mặc định cho sản phẩm dựa trên id
  // const getProductDefaultUnit = (productDetailId: string): string => {
  //   // Lấy thông tin sản phẩm từ productDetailId
  //   const productDetail = productDetailOptions.find(option => option.value === productDetailId);
  //   if (!productDetail) return unitOptions.length > 0 ? unitOptions[0].value : '';

  //   // Tìm sản phẩm trong allProducts
  //   const product = allProducts.find(p => p._id === (productDetail as any).productId);
  //   if (!product) return unitOptions.length > 0 ? unitOptions[0].value : '';

  //   // Trả về đơn vị mặc định hoặc đơn vị đầu tiên trong danh sách
  //   return unitOptions.length > 0 ? unitOptions[0].value : '';
  // };

  // Cập nhật filteredProductDetailOptions khi không có sản phẩm
  useEffect(() => {
    if (filteredProductDetailOptions.length === 0 && productDetailOptions.length > 0) {
      // const message = 'Không tìm thấy sản phẩm nào cho nhà cung cấp này';
    }
  }, [filteredProductDetailOptions, productDetailOptions]);

  // Dùng useMemo để tối ưu hóa các option
  // const memoizedFilteredOptions = useMemo(() =>
  //   productDetailOptions.filter(
  //     option => option.business_id === orderForm.business_id
  //   ),
  //   [productDetailOptions, orderForm.business_id]
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

  return (
    <>
      <ManagerPage<collectionType>
        columns={columns}
        collectionName={collectionName}
        defaultCollection={DEFAULT_ORDER_FORM}
        collection={orderForm}
        setCollection={setOrderForm}
        isModalReadonly={isModalReadOnly}
        setIsModalReadonly={setIsModalReadOnly}
        isClickShowMore={isClickShowMore}
        isClickDelete={isClickDelete}
        isLoaded={
          isProductLoading ||
          isBusinessLoading ||
          isUnitLoading
        }
        handleOpenModal={handleOpenModal}
        onExitModalForm={onExitModalForm}
        dateFilter={dateFilter}
        renderFilters={renderDateFilters}
        additionalProcessing={processOrdersData}
      >
        <>
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
                    (orderForm.business_id
                      ? orderForm.business_id
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
                  <Text className="font-bold">Sản phẩm</Text>
                  <Text className="font-bold">Giá nhập (đ)</Text>
                  <Text className="font-bold">Đơn vị tính</Text>
                  <Text className="font-bold">Số lượng</Text>
                  <Text className="font-bold">Thao tác</Text>
                </div>

                {filteredProductDetailOptions.length === 0 && orderForm.business_id && !isProductLoading && (
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

                {orderForm.product_details.length === 0 && filteredProductDetailOptions.length > 0 && (
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
                      options={filteredProductDetailOptions}
                      defaultOptionIndex={getSelectedOptionIndex(
                        filteredProductDetailOptions,
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
                      value={orderFormProductDetail.input_price ? orderFormProductDetail.input_price + `` : "0"}
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
                  isDisable={isModalReadOnly || isProductLoading || isBusinessLoading || filteredProductDetailOptions.length === 0}
                  onClick={handleAddOrderFormProduct}
                  className={`flex items-center justify-center gap-2 mt-6 w-full py-4 rounded-lg shadow-md ${styles['sticky-add-button']} ${filteredProductDetailOptions.length === 0 || isModalReadOnly ?
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
      </ManagerPage>
    </>
  );
}
