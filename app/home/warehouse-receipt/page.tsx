'use client';

import { Button, IconContainer, Text } from '@/components'
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
import Checkboxes, { ICheckbox } from '@/components/checkboxes/checkboxes';
import { IProduct } from '@/interfaces/product.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { translateCollectionName } from '@/utils/translate-collection-name';

type collectionType = IWarehouseReceipt;
const collectionName: ECollectionNames = ECollectionNames.WAREHOUSE_RECEIPT;

export default function Product() {
  const [warehouseReceipt, setWarehouseReceipt] = useState<collectionType>(
    DEFAULT_WAREHOUST_RECEIPT
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
  const [productOptions, setProductOptions] = useState<ICheckbox[]>([]);

  const getProducts: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newProducts: IProduct[] = await fetchGetCollections<IProduct>(
        ECollectionNames.PRODUCT, 
      );

      setProductOptions([
        ...newProducts.map((product: IProduct): ICheckbox => ({
          label: `${product.name}`,
          value: product._id,
          isChecked: warehouseReceipt.product_ids.filter((
            candidateProductId: string, 
          ): boolean => candidateProductId === product._id).length > 0, 
        }))
      ]);
      setIsLoading(false);
    }, 
    [warehouseReceipt.product_ids],
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
      key: `product_ids`,
      ref: useRef(null), 
      title: `Danh sách sản phẩm`,
      size: `3fr`, 
      render: (collection: collectionType): ReactElement => <div>
        {
          collection.product_ids.map(
            (productId: string, index: number): ReactElement => 
              <Text key={index}>{productId}</Text>
          )
        }
      </div>
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
    {
      key: `updated_at`,
      ref: useRef(null), 
      title: `Ngày cập nhật`,
      size: `4fr`, 
      render: (account: collectionType): ReactElement => {
        const date: string = new Date(account.updated_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
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

  const handleChangeProducts = (
    e: ChangeEvent<HTMLInputElement>, 
    _option: ICheckbox, 
    index: number
  ): void => {
    const newProductOptions: ICheckbox[] = productOptions.map((
      productOption: ICheckbox, productOptionIndex: number
    ): ICheckbox => ({
      ...productOption, 
      isChecked: index === productOptionIndex 
        ? e.target.checked
        : productOption.isChecked
    }));

    setProductOptions(newProductOptions);
    
    const newWarehouseReceipt: collectionType = {
      ...warehouseReceipt, 
      product_ids: newProductOptions.filter((
        productOption: ICheckbox
      ): boolean => productOption.isChecked).map((
        productOption: ICheckbox
      ): string => productOption.value), 
    };

    setWarehouseReceipt({...newWarehouseReceipt});
  }

  const gridColumns: string = `80px 1fr`;

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
    >
      <Tabs>

        <TabItem label={`${translateCollectionName(collectionName)}`}>
          <InputSection label={`Danh sách sản phẩm`} gridColumns={gridColumns}>
            <Checkboxes
              isDisable={isModalReadOnly}
              isLoading={isLoading}
              options={productOptions}
              setOptions={setProductOptions}
              shouldSetOptions={false}
              onInputChange={handleChangeProducts}
            >
            </Checkboxes>
          </InputSection>
        </TabItem>

        <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={warehouseReceipt}>
          </TimestampTabItem>
        </TabItem>

      </Tabs>
    </ManagerPage>
  );
}
