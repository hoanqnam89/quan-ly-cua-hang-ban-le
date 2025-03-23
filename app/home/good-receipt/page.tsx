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
import { IGoodReceipt, IGoodReceiptProduct } from '@/interfaces/good-receipt.interface';
import { DEFAULT_GOOD_RECEIPT } from '@/constants/good-receipt.constant';
import { IProduct } from '@/interfaces/product.interface';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import styles from './style.module.css';
import { getCollectionCount } from '@/services/api-service';
import useNotificationsHook from '@/hooks/notifications-hook';
import { ENotificationType } from '@/components/notify/notification/notification';

type collectionType = IGoodReceipt;
const collectionName: ECollectionNames = ECollectionNames.GOOD_RECEIPT;

export default function Product() {
  const [goodReceipt, setGoodReceipt] = useState<collectionType>(
    DEFAULT_GOOD_RECEIPT
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [productOptions, setProductOptions] = useState<ISelectOption[]>([]);
  const [productCount, setProductCount] = useState<number>(-1);
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
    setCollectionCount(ECollectionNames.PRODUCT, setProductCount);
  }, []);

  const getProducts: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newProducts: IProduct[] = await fetchGetCollections<IProduct>(
        ECollectionNames.PRODUCT, 
      );

      setProductOptions([
        ...newProducts.map((product: IProduct): ISelectOption => ({
          label: `${product.name} - ${product.input_price}VNĐ - ${product.output_price}VNĐ`,
          value: product._id,
        }))
      ]);
      setIsLoading(false);
    }, 
    [],
  );
  
  useEffect((): void => {
    getProducts();
  }, [getProducts]);

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
      key: `products`,
      ref: useRef(null), 
      title: `Danh sách sản phẩm`,
      size: `6fr`, 
      render: (collection: collectionType): ReactElement => {
        return <Text>{collection.products.map((
          goodReceiptProduct: IGoodReceiptProduct
        ) => goodReceiptProduct._id).join(`, `)}</Text>
      }
    },
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Ngày tạo`,
      size: `4fr`, 
      isVisible: false, 
      render: (account: collectionType): ReactElement => {
        const date: string = new Date(account.created_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
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
        isDisable={true}
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

  const handleAddGoodReceiptProduct = () => {
    if (goodReceipt.products.length >= productCount) {
      createNotification({
        id: 0,
        children: <Text>Đã hết sản phẩm trong cơ sở dữ liệu để thêm vào phiếu nhập hàng</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true, 
      });
      return;
    }

    setGoodReceipt({
      ...goodReceipt, 
      products: [
        ...goodReceipt.products, 
        {
          _id: productOptions[0].value,
          quantity: 0, 
        }
      ], 
    });
  }

  const handleDeleteGoodReceiptProduct = (deleteIndex: number) => {
    setGoodReceipt({
      ...goodReceipt, 
      products: [
        ...goodReceipt.products.filter((
          _: IGoodReceiptProduct, 
          index: number
        ) => index !== deleteIndex), 
      ], 
    });
  }

  const handleChangeGoodReceiptProductId = (
    e: ChangeEvent<HTMLSelectElement>, 
    changeIndex: number, 
  ): void => {
    setGoodReceipt({
      ...goodReceipt, 
      products: [
        ...goodReceipt.products.map((
          goodReceiptProduct: IGoodReceiptProduct, 
          index: number
        ): IGoodReceiptProduct => {
          if (index === changeIndex)
            return {
              ...goodReceiptProduct, 
              _id: e.target.value
            }
          else
            return goodReceiptProduct;
        }), 
      ], 
    });
  }

  const handleChangeGoodReceiptProductQuantity = (
    e: ChangeEvent<HTMLInputElement>, 
    changeIndex: number, 
  ): void => {
    setGoodReceipt({
      ...goodReceipt, 
      products: [
        ...goodReceipt.products.map((
          goodReceiptProduct: IGoodReceiptProduct, 
          index: number
        ): IGoodReceiptProduct => {
          if (index === changeIndex)
            return {
              ...goodReceiptProduct, 
              quantity: +e.target.value
            }
          else
            return goodReceiptProduct;
        }), 
      ], 
    });
  }

  return (
    <ManagerPage<collectionType>
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_GOOD_RECEIPT}
      collection={goodReceipt}
      setCollection={setGoodReceipt}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
    >
      <>
        <Tabs>
          <TabItem label={`Phiếu nhập hàng`}>
            <div className={`grid items-center ${styles[`good-receipt-product-table`]}`}>
              <Text>#</Text>
              <Text>Sản phẩm</Text>
              <Text>Số lượng</Text>
              <Text>Xóa</Text>
            </div>

            {goodReceipt.products.map((
              goodReceiptProduct: IGoodReceiptProduct, 
              index: number
            ) => {
              return <div 
                key={index} 
                className={`grid items-center ${styles[`good-receipt-product-table`]}`}
              >
                <Text>{index + 1}</Text>

                <SelectDropdown
                  isLoading={isLoading}
                  isDisable={isModalReadOnly}
                  options={productOptions}
                  defaultOptionIndex={getSelectedOptionIndex(
                    productOptions, 
                    (goodReceiptProduct._id
                      ? goodReceiptProduct._id
                      : 0
                    ) as unknown as string
                  )}
                  onInputChange={(e) => handleChangeGoodReceiptProductId(e, index)}
                >
                </SelectDropdown>
                
                <NumberInput
                  name={`quantity`}
                  isDisable={isModalReadOnly}
                  value={goodReceiptProduct.quantity + ``}
                  onInputChange={(e) => 
                    handleChangeGoodReceiptProductQuantity(e, index)
                  }
                >
                </NumberInput>

                <div>
                  <Button 
                    isDisable={isModalReadOnly}  
                    onClick={() => handleDeleteGoodReceiptProduct(index)}
                  >
                    <IconContainer></IconContainer>
                  </Button>
                </div>
              </div>
            })}

            <Button 
              isDisable={isModalReadOnly}  
              onClick={handleAddGoodReceiptProduct}
              className={`flex gap-2`} 
              type={EButtonType.SUCCESS}
            >
              <IconContainer iconLink={plusIcon}></IconContainer>
              <Text>Thêm sản phẩm mới</Text>
            </Button>
          </TabItem>

          <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
            <TimestampTabItem<collectionType> collection={goodReceipt}>
            </TimestampTabItem>
          </TabItem>

        </Tabs>

        {notificationElements}
      </>
    </ManagerPage>
  );
}
