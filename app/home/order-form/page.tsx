'use client';

import { Button, IconContainer, NumberInput, SelectDropdown, Text } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { infoIcon, plusIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { IProduct } from '@/interfaces/product.interface';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import styles from './style.module.css';
import { getCollectionCount } from '@/services/api-service';
import useNotificationsHook from '@/hooks/notifications-hook';
import { ENotificationType } from '@/components/notify/notification/notification';
import { IOrderForm, IOrderFormProductDetail } from '@/interfaces/order-form.interface';
import { DEFAULT_ORDER_FORM } from '@/constants/order-form.constant';
import { IBusiness } from '@/interfaces/business.interface';
import { EBusinessType } from '@/enums/business-type.enum';
import InputSection from '../components/input-section/input-section';
import { IProductDetail } from '@/interfaces/product-detail.interface';

type collectionType = IOrderForm;
const collectionName: ECollectionNames = ECollectionNames.ORDER_FORM;

export default function Product() {
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
  const [isSupplierLoading, setIsSupplierLoading] = useState<boolean>(true);
  const [productDetailOptions, setProductDetailOptions] = 
    useState<ISelectOption[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<ISelectOption[]>([]);
  const [productDetailCount, setProductDetailCount] = useState<number>(-1);
  const { createNotification, notificationElements } = useNotificationsHook();

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
            label: `${foundProduct.name} - ${foundProduct.input_price}VNĐ - ${foundProduct.output_price}VNĐ`,
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
      setIsSupplierLoading(false);
    }, 
    [],
  );
  
  useEffect((): void => {
    getSuppliers();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

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
      isVisible: false, 
    },
    {
      key: `product_details`,
      ref: useRef(null), 
      title: `Danh sách sản phẩm`,
      size: `6fr`, 
      render: (collection: collectionType): ReactElement => {
        return <Text>{collection.product_details.map((
          orderFormProduct: IOrderFormProductDetail
        ) => orderFormProduct._id).join(`, `)}</Text>
      }
    },
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Ngày tạo`,
      size: `4fr`, 
      isVisible: false, 
      render: (collection: collectionType): ReactElement => {
        const date: string = new Date(collection.created_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      ref: useRef(null), 
      title: `In`,
      size: `4fr`, 
      isVisible: false, 
      render: (collection: collectionType): ReactElement => {
        return (
          <Button
            onClick={(): void => {
              window.location.href = `/home/order-form/${collection._id}`;
              // setIsPreviewModalOpen((prev: boolean): boolean => !prev)
            }}
          >
            <Text>In hóa đơn</Text>
          </Button>
        );
      }
    },
    // {
    //   key: `updated_at`,
    //   ref: useRef(null), 
    //   title: `Ngày cập nhật`,
    //   size: `4fr`, 
    //   render: (account: collectionType): ReactElement => {
    //     const date: string = new Date(account.updated_at).toLocaleString();
    //     return <Text isEllipsis={true} tooltip={date}>{date}</Text>
    //   }
    // },
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
      isVisible: false, 
      render: (collection: collectionType): ReactElement => <Button 
        // isDisable={true}
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

  const handleAddOrderFormProduct = () => {
    if (orderForm.product_details.length >= productDetailCount) {
      createNotification({
        id: 0,
        children: <Text>Đã hết sản phẩm trong cơ sở dữ liệu để thêm vào phiếu nhập hàng</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true, 
      });
      return;
    }

    setOrderForm({
      ...orderForm, 
      product_details: [
        ...orderForm.product_details, 
        {
          _id: productDetailOptions[0].value,
          quantity: 1, 
        }
      ], 
    });
  }

  const handleDeleteOrderFormProduct = (deleteIndex: number) => {
    setOrderForm({
      ...orderForm, 
      product_details: [
        ...orderForm.product_details.filter((
          _orderFormProductDetail: IOrderFormProductDetail, 
          index: number
        ): boolean => index !== deleteIndex), 
      ], 
    });
  }

  const handleChangeOrderFormProductId = (
    e: ChangeEvent<HTMLSelectElement>, 
    changeIndex: number, 
  ): void => {
    setOrderForm({
      ...orderForm, 
      product_details: [
        ...orderForm.product_details.map((
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
    });
  }

  const handleChangeOrderFormSupplierId = (
    e: ChangeEvent<HTMLSelectElement>, 
  ): void => {
    setOrderForm({
      ...orderForm, 
      supplier_id: e.target.value, 
    });
  }

  const handleChangeOrderFormProductQuantity = (
    e: ChangeEvent<HTMLInputElement>, 
    changeIndex: number, 
  ): void => {
    setOrderForm({
      ...orderForm, 
      product_details: [
        ...orderForm.product_details.map((
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
    });
  }

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
        isLoaded={isProductLoading || isSupplierLoading}
      >
        <>
          <Tabs>
            <TabItem label={`Phiếu nhập hàng`}>
              <InputSection label={`Nhà cung cấp`}>
                <SelectDropdown
                  isLoading={isSupplierLoading}
                  isDisable={isModalReadOnly}
                  options={supplierOptions}
                  defaultOptionIndex={getSelectedOptionIndex(
                    supplierOptions, 
                    (orderForm.supplier_id
                      ? orderForm.supplier_id
                      : 0
                    ) as unknown as string
                  )}
                  onInputChange={(e) => handleChangeOrderFormSupplierId(e)}
                >
                </SelectDropdown>
              </InputSection>
                  
              <div className={`grid items-center ${styles[`good-receipt-product-table`]}`}>
                <Text>#</Text>
                <Text>Sản phẩm</Text>
                <Text>Số lượng</Text>
                <Text>Xóa</Text>
              </div>

              {orderForm.product_details.map((
                orderFormProductDetail: IOrderFormProductDetail, 
                index: number
              ) => {
                return <div 
                  key={index} 
                  className={`grid items-center ${styles[`good-receipt-product-table`]}`}
                >
                  <Text>{index + 1}</Text>

                  <SelectDropdown
                    isLoading={isSupplierLoading}
                    isDisable={isModalReadOnly}
                    options={productDetailOptions}
                    defaultOptionIndex={getSelectedOptionIndex(
                      productDetailOptions, 
                      (orderFormProductDetail._id
                        ? orderFormProductDetail._id
                        : 0
                      ) as unknown as string
                    )}
                    onInputChange={(e) => handleChangeOrderFormProductId(e, index)}
                  >
                  </SelectDropdown>
                  
                  <NumberInput
                    min={1}
                    max={100}
                    name={`quantity`}
                    isDisable={isModalReadOnly}
                    value={orderFormProductDetail.quantity + ``}
                    onInputChange={(e) => 
                      handleChangeOrderFormProductQuantity(e, index)
                    }
                  >
                  </NumberInput>

                  <div>
                    <Button 
                      isDisable={isModalReadOnly}
                      onClick={() => handleDeleteOrderFormProduct(index)}
                    >
                      <IconContainer></IconContainer>
                    </Button>
                  </div>
                </div>
              })}

              <Button 
                isDisable={isModalReadOnly || isProductLoading || isSupplierLoading}  
                onClick={handleAddOrderFormProduct}
                className={`flex gap-2`} 
                type={EButtonType.SUCCESS}
              >
                <IconContainer iconLink={plusIcon}></IconContainer>
                <Text>Thêm sản phẩm mới</Text>
              </Button>
            </TabItem>

            <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
              <TimestampTabItem<collectionType> collection={orderForm}>
              </TimestampTabItem>
            </TabItem>

          </Tabs>

          {notificationElements}
        </>
      </ManagerPage>
    </>
  );
}
