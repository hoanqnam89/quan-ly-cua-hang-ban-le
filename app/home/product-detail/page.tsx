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
import { IProduct } from '@/interfaces/product.interface';
import { MAX_PRICE } from '@/constants/max-price.constant';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { IProductDetail } from '@/interfaces/product-detail.interface';
import { DEFAULT_PROCDUCT_DETAIL } from '@/constants/product-detail.constant';
import DateInput from '@/components/date-input/date-input';
import { createCollectionDetailLink } from '@/utils/create-collection-detail-link';
import { ENotificationType } from '@/components/notify/notification/notification';
import useNotificationsHook from '@/hooks/notifications-hook';

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

  useEffect((): void => {
    getProducts();
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
      isVisible: false
    },
    {
      key: `product_id`,
      ref: useRef(null),
      title: `Sản phẩm`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement => {
        const productOption = productOptions.find(
          (option) => option.value === collection.product_id
        );

        const productName = productOption?.label || 'Không xác định';

        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => {
                window.location.href = `/home/product/${collection.product_id}`;
              }}
            >
              <Text isEllipsis={false} className="font-medium" tooltip={productName}>
                {productName}
              </Text>
            </div>
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
        const date: string = collection.date_of_manufacture ?
          new Date(collection.date_of_manufacture).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Không có';
        return <Text isEllipsis={true} className="text-center" tooltip={date}>{date}</Text>
      }
    },
    {
      key: `expiry_date`,
      ref: useRef(null),
      title: `Hạn sử dụng`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement => {
        const date: string = collection.expiry_date ?
          new Date(collection.expiry_date).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Không có';
        return <Text isEllipsis={true} className="text-center" tooltip={date}>{date}</Text>
      }
    },
    {
      key: `input_quantity`,
      ref: useRef(null),
      title: `Tổng kho`,
      size: `2fr`,
      render: (collection: collectionType): ReactElement => (
        <div className="w-full flex justify-center">
          <Text isEllipsis={false} className="text-center font-medium" tooltip={`${collection.input_quantity}`}>
            {collection.input_quantity}
          </Text>
        </div>
      )
    },
    {
      key: `output_quantity`,
      ref: useRef(null),
      title: `Số lượng trên quầy`,
      size: `2fr`,
      render: (collection: collectionType): ReactElement => (
        <div className="w-full flex justify-center">
          <Text isEllipsis={false} className="text-center font-medium" tooltip={`${collection.output_quantity}`}>
            {collection.output_quantity}
          </Text>
        </div>
      )
    },
    {
      ref: useRef(null),
      title: `Số lượng tồn kho`,
      size: `2fr`,
      render: (collection: collectionType): ReactElement => {
        const inventory = collection.input_quantity - collection.output_quantity;
        return (
          <div className="w-full flex justify-center">
            <Text isEllipsis={false} className={`text-center font-medium ${inventory > 0 ? 'text-green-600' : inventory === 0 ? 'text-yellow-500' : 'text-red-600'}`} tooltip={`${inventory}`}>
              {inventory}
            </Text>
          </div>
        );
      }
    },
    {
      title: `Xem thêm`,
      ref: useRef(null),
      size: `1.5fr`,
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
          className="flex justify-center"
        >
        </IconContainer>
      </Button>
    },
    {
      title: `Xem chi tiết`,
      ref: useRef(null),
      size: `1.5fr`,
      render: (collection: collectionType): ReactElement =>
        <div className="flex justify-center">
          {createCollectionDetailLink(
            collectionName,
            collection._id
          )}
        </div>
    },
    {
      title: `Xóa`,
      ref: useRef(null),
      size: `1.5fr`,
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
          className="flex justify-center"
        >
        </IconContainer>
      </Button>
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


  const gridColumns: string = `200px 1fr`;

  return (
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
    >
      <>
        <Tabs>
          <TabItem label={`${translateCollectionName(collectionName)}`}>
            <InputSection label={`Cho sản phẩm`}>
              <SelectDropdown
                isLoading={isLoading}
                isDisable={isModalReadOnly}
                options={productOptions}
                defaultOptionIndex={getSelectedOptionIndex(
                  productOptions, productDetail.product_id
                )}
                onInputChange={handleChangeProductId}
              >
              </SelectDropdown>
            </InputSection>

            <InputSection label={`Ngày sản xuất`} gridColumns={gridColumns}>
              <DateInput
                name={`date_of_manufacture`}
                isDisable={isModalReadOnly}
                value={productDetail.date_of_manufacture}
                onInputChange={handleChangeProductDetail}
              >
              </DateInput>
            </InputSection>

            <InputSection label={`Hạn sử dụng`} gridColumns={gridColumns}>
              <DateInput
                name={`expiry_date`}
                isDisable={isModalReadOnly}
                value={productDetail.expiry_date}
                onInputChange={handleChangeProductDetail}
              >
              </DateInput>
            </InputSection>
          </TabItem>

          <TabItem label={`Số lượng`} isDisable={!isModalReadOnly}>
            <InputSection label={`Tổng kho`} gridColumns={gridColumns}>
              <NumberInput
                isDisable={true}
                value={productDetail.output_quantity + (productDetail.input_quantity - productDetail.output_quantity) + ``}
                max={MAX_PRICE}
              >
              </NumberInput>
            </InputSection>

            <InputSection label={`Số lượng trên quầy`} gridColumns={gridColumns}>
              <NumberInput
                isDisable={true}
                value={productDetail.output_quantity + ``}
                max={MAX_PRICE}
              >
              </NumberInput>
            </InputSection>

            <InputSection label={`Số lượng tồn kho`} gridColumns={gridColumns}>
              <NumberInput
                isDisable={true}
                value={productDetail.input_quantity - productDetail.output_quantity + ``}
                max={MAX_PRICE}
              >
              </NumberInput>
            </InputSection>
          </TabItem>

          <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
            <TimestampTabItem<collectionType> collection={productDetail}>
            </TimestampTabItem>
          </TabItem>

        </Tabs>

        {notificationElements}
      </>
    </ManagerPage>
  );
}