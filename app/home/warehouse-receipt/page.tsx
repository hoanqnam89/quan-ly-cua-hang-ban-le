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
import { IWarehouseReceipt } from '@/interfaces/warehouse-receipt.interface';
import { DEFAULT_WAREHOUST_RECEIPT } from '@/constants/warehouse-receipt.constant';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { IOrderForm, IOrderFormProductDetail } from '@/interfaces/order-form.interface';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { DEFAULT_ORDER_FORM } from '@/constants/order-form.constant';
import styles from './style.module.css';
import { IProductDetail } from '@/interfaces/product-detail.interface';
import { IProduct } from '@/interfaces/product.interface';
import { formatCurrency } from '@/utils/format-currency';
import { IBusiness } from '@/interfaces/business.interface';
import { EBusinessType } from '@/enums/business-type.enum';
import { IUnit } from '@/interfaces/unit.interface';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import Textarea from '@/components/textarea/Textarea';
import useNotificationsHook from '@/hooks/notifications-hook';
import { ENotificationType } from '@/components/notify/notification/notification';

type collectionType = IWarehouseReceipt;
const collectionName: ECollectionNames = ECollectionNames.WAREHOUSE_RECEIPT;

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

  const getProducts: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newProductDetails: IProductDetail[] = 
        await fetchGetCollections<IProductDetail>(
          ECollectionNames.PRODUCT_DETAIL, 
        );

      const newProducts: IProduct[] = 
        await fetchGetCollections<IProduct>(
          ECollectionNames.PRODUCT, 
        );

      setProductDetailOptions([
        ...newProductDetails.map((
          productDetail: IProductDetail
        ): ISelectOption => {
          const foundProduct: IProduct | undefined = newProducts.find((
            product: IProduct
          ): boolean => product._id === productDetail.product_id);

          if (!foundProduct)
            return {
              label: `Không rõ`,
              value: productDetail._id,
            }

          return {
            label: `${foundProduct.name} - ${formatCurrency(foundProduct.input_price)} - ${formatCurrency(foundProduct.output_price)}`,
            value: productDetail._id,
          }
        })
      ]);
      setIsProductLoading(false);
    }, 
    [],
  );
  
  useEffect((): void => {
    getProducts();
  }, [getProducts]);

  const getSuppliers: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newBusinesses: IBusiness[] = await fetchGetCollections<IBusiness>(
        ECollectionNames.BUSINESS, 
      );
      const newSuppliers: IBusiness[] = newBusinesses.filter((
        business: IBusiness
      ): boolean => 
        business.type !== EBusinessType.SUPPLIER 
      );

      setSupplierOptions([
        ...newSuppliers.map((supplier: IBusiness): ISelectOption => ({
          label: `${supplier.name}`,
          value: supplier._id,
        }))
      ]);
      setOrderForm({
        ...orderForm, 
        supplier_id: newSuppliers[0]._id, 
      });
      setIsSupplierLoading(false);
    }, 
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [],
  );
  
  useEffect((): void => {
    getSuppliers();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

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
    [],
  );
  
  useEffect((): void => {
    getUnits();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const getOrderForms: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newOrderForms: IOrderForm[] = await fetchGetCollections<IOrderForm>(
        ECollectionNames.ORDER_FORM, 
      );

      setOrderForms([...newOrderForms]);
      setOrderFormOptions([
        ...newOrderForms.map((orderForm: IOrderForm): ISelectOption => ({
          label: `${new Date(orderForm.created_at).toLocaleString()}`,
          value: orderForm._id,
        }))
      ]);
      setOrderForm({...newOrderForms[0]});
      setIsLoading(false);
    }, 
    [],
  );

  useEffect((): void => {
    getOrderForms();
  }, [getOrderForms]);

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
      title: `Mã`,
      size: `6fr`,
    },
    // {
    //   key: `product_details`,
    //   ref: useRef(null),
    //   title: `Danh sách sản phẩm`,
    //   size: `3fr`,
    //   render: (collection: collectionType): ReactElement => <div>
    //     {
    //       collection.product_details.map(
    //         (productDetail: IReceiptProduct, index: number): ReactElement =>
    //           <Text key={index}>{productDetail._id}</Text>
    //       )
    //     }
    //   </div>
    // },
    {
      key: `created_at`,
      ref: useRef(null),
      title: `Ngày tạo`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        const date: string = new Date(collection.created_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `updated_at`,
      ref: useRef(null),
      title: `Ngày cập nhật`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        const date: string = new Date(collection.updated_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      ref: useRef(null), 
      title: `In`,
      size: `4fr`, 
      render: (collection: collectionType): ReactElement => <Button
        type={EButtonType.INFO}
        onClick={(): void => {
          window.location.href = `/home/warehouse-receipt/${collection._id}`;
        }}
      >
        <Text>In hóa đơn</Text>
      </Button>
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
            isClicked: !isClickShowMore.isClicked,
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

  const handleChangeOrderForm = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrentOrderFormOptionIndex(
      getSelectedOptionIndex(orderFormOptions, e.target.value)
    );

    const foundOrderForm: IOrderForm | undefined = orderForms.find((
      orderForm: IOrderForm
    ) => orderForm._id === e.target.value);

    if (!foundOrderForm)
      return;

    setOrderForm({...foundOrderForm});
    setWarehouseReceipt({
      ...foundOrderForm,
      supplier_receipt_id: foundOrderForm._id, 
    })
  }

  const handleChangeWarehouseReceiptProductId = (
    e: ChangeEvent<HTMLSelectElement>, 
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
              _id: e.target.value
            }
          else
            return warehouseReceiptProductDetail;
        }), 
      ], 
    });
  }

  const handleChangeWarehouseReceiptProductUnitId = (
    e: ChangeEvent<HTMLSelectElement>, 
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
              unit_id: e.target.value
            }
          else
            return warehouseReceiptProductDetail;
        }), 
      ], 
    });
  }

  const handleChangeWarehouseReceiptSupplierId = (
    e: ChangeEvent<HTMLSelectElement>, 
  ): void => {
    setWarehouseReceipt({
      ...warehouseReceipt, 
      supplier_id: e.target.value, 
    });
  }

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

  const handleOpenModal = (prev: boolean): boolean => {
    // if (supplierOptions.length === 0) {
    //   createNotification({
    //     id: 0,
    //     children: <Text>Thêm doanh nghiệp vào trước khi thêm phiếu nhập kho!</Text>,
    //     type: ENotificationType.ERROR,
    //     isAutoClose: true, 
    //   });
    //   return prev;
    // }

    // if (unitOptions.length === 0) {
    //   createNotification({
    //     id: 0,
    //     children: <Text>Thêm đơn vị vào trước khi thêm phiếu nhập kho!</Text>,
    //     type: ENotificationType.ERROR,
    //     isAutoClose: true, 
    //   });
    //   return prev;
    // }

    // if (productDetailOptions.length === 0) {
    //   createNotification({
    //     id: 0,
    //     children: <Text>Thêm chi tiết vào trước khi thêm phiếu nhập kho!</Text>,
    //     type: ENotificationType.ERROR,
    //     isAutoClose: true, 
    //   });
    //   return prev;
    // }

    return !prev;
  }


  return (
    <ManagerPage<collectionType>
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_WAREHOUST_RECEIPT}
      collection={warehouseReceipt}
      setCollection={setWarehouseReceipt}
      isModalReadonly={isModalReadOnly}
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
      isLoaded={
        isProductLoading || 
        isSupplierLoading || 
        isUnitLoading || 
        orderForm.product_details.length === 0
      }
      handleOpenModal={handleOpenModal}
    >
      <>
        <Tabs>

          <TabItem label={`${translateCollectionName(collectionName)}`}>
            <InputSection label={`Chọn phiếu đặt hàng`} gridColumns={gridColumns}>
              <SelectDropdown
                isLoading={isLoading}
                isDisable={isModalReadOnly}
                options={orderFormOptions}
                defaultOptionIndex={currentOrderFormOptionIndex}
                onInputChange={(e): void => handleChangeOrderForm(e)}
              >
              </SelectDropdown>
            </InputSection>

            <div className={`flex items-center justify-between gap-2`}>
              <div className={`flex flex-col gap-2`}>
                <InputSection label={`Nhà cung cấp`}>
                  <SelectDropdown
                    isLoading={isSupplierLoading}
                    isDisable={true}
                    options={supplierOptions}
                    defaultOptionIndex={getSelectedOptionIndex(
                      supplierOptions, 
                      (orderForm.supplier_id
                        ? orderForm.supplier_id
                        : 0
                      ) as unknown as string
                    )}
                  >
                  </SelectDropdown>
                </InputSection>

                <div className={`grid items-center ${styles[`order-form-product-table`]}`}>
                  <Text>#</Text>
                  <Text>Sản phẩm</Text>
                  <Text>Đơn vị tính</Text>
                  <Text>Số lượng</Text>
                </div>

                {orderForm.product_details.map((
                  orderFormProductDetail: IOrderFormProductDetail, 
                  index: number
                ): ReactElement => {
                  return <div 
                    key={index} 
                    className={`grid items-center ${styles[`order-form-product-table`]}`}
                  >
                    <Text>{index + 1}</Text>

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
                    >
                    </SelectDropdown>
                    
                    <NumberInput
                      min={1}
                      max={100}
                      name={`quantity`}
                      isDisable={true}
                      value={orderFormProductDetail.quantity + ``}
                    >
                    </NumberInput>
                  </div>
                })}
              </div>

              <div className={`flex flex-col gap-2`}>
                <InputSection label={`Nhà cung cấp`}>
                  <SelectDropdown
                    isLoading={isSupplierLoading}
                    isDisable={true}
                    options={supplierOptions}
                    defaultOptionIndex={getSelectedOptionIndex(
                      supplierOptions, 
                      (warehouseReceipt.supplier_id
                        ? warehouseReceipt.supplier_id
                        : 0
                      ) as unknown as string
                    )}
                    onInputChange={(e): void => 
                      handleChangeWarehouseReceiptSupplierId(e)
                    }
                  >
                  </SelectDropdown>
                </InputSection>

                <div className={`grid items-center ${styles[`warehouse-receipt-product-table`]}`}>
                  <Text>#</Text>
                  <Text>Sản phẩm</Text>
                  <Text>Đơn vị tính</Text>
                  <Text>Số lượng</Text>
                  <Text>Ghi chú</Text>
                </div>

                {warehouseReceipt.product_details.map((
                  warehouseProductDetail: IOrderFormProductDetail, 
                  index: number
                ): ReactElement => {
                  return <div 
                    key={index} 
                    className={`grid items-center ${styles[`warehouse-receipt-product-table`]}`}
                  >
                    <Text>{index + 1}</Text>

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
                      onInputChange={(e): void => 
                        handleChangeWarehouseReceiptProductId(e, index)
                      }
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
                      onInputChange={(e): void => 
                        handleChangeWarehouseReceiptProductUnitId(e, index)
                      }
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
                    >
                    </NumberInput>

                    <Textarea
                      name={`note`}
                      isDisable={isModalReadOnly}
                      value={warehouseProductDetail.note ?? ``}
                      onInputChange={(e: ChangeEvent<HTMLTextAreaElement>): void => 
                        handleChangeWarehouseReceiptProductNote(e, index)
                      }
                    >
                    </Textarea>
                  </div>
                })}
              </div>
            </div>
          </TabItem>

          <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
            <TimestampTabItem<collectionType> collection={warehouseReceipt}>
            </TimestampTabItem>
          </TabItem>

        </Tabs>

        {notificationElements}
      </>
    </ManagerPage>
  );
}
