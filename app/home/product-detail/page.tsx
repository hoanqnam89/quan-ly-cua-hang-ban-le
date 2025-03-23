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
import { VND_UNIT } from '@/constants/vnd-unit.constant';

type collectionType = IProductDetail;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT_DETAIL;

export default function Product() {
  const [productDetail, setProductDetail] = useState<collectionType>(
    DEFAULT_PROCDUCT_DETAIL
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
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
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
      key: `product_id`,
      ref: useRef(null), 
      title: `Sản phẩm`,
      size: `6fr`, 
    },
    {
      key: `date_of_manufacture`,
      ref: useRef(null), 
      title: `Ngày sản xuất`,
      size: `4fr`, 
      render: (collection: collectionType): ReactElement => {
        const date: string = 
          new Date(collection.date_of_manufacture).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `expiry_date`,
      ref: useRef(null), 
      title: `Hạn sử dụng`,
      size: `4fr`, 
      render: (collection: collectionType): ReactElement => {
        const date: string = new Date(collection.expiry_date).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `input_price`,
      ref: useRef(null), 
      title: `Giá nhập (VNĐ)`,
      size: `3fr`, 
    },
    {
      key: `output_price`,
      ref: useRef(null), 
      title: `Giá bán (VNĐ)`,
      size: `3fr`, 
    },
    {
      key: `input_quantity`,
      ref: useRef(null), 
      title: `Số lượng trong kho`,
      size: `3fr`, 
    },
    {
      key: `output_quantity`,
      ref: useRef(null), 
      title: `Số lượng đang bán`,
      size: `3fr`, 
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
    >
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

        <TabItem label={`Giá`}>
          <InputSection label={`Giá nhập (VNĐ)`} gridColumns={gridColumns}>
            <NumberInput
              step={VND_UNIT}
              name={`input_price`}
              isDisable={isModalReadOnly}
              value={productDetail.input_price + ``}
              onInputChange={handleChangeProductDetail}
              max={MAX_PRICE}
            >
            </NumberInput>
          </InputSection>

          <InputSection label={`Giá bán (VNĐ)`} gridColumns={gridColumns}>
            <NumberInput
              step={VND_UNIT}
              name={`output_price`}
              isDisable={isModalReadOnly}
              value={productDetail.output_price + ``}
              onInputChange={handleChangeProductDetail}
              max={MAX_PRICE}
            >
            </NumberInput>
          </InputSection>
        </TabItem>

        <TabItem label={`Số lượng`} isDisable={!isModalReadOnly}>
          <InputSection label={`Số lượng trong kho`} gridColumns={gridColumns}>
            <NumberInput
              isDisable={true}
              value={productDetail.input_quantity + ``}
              max={MAX_PRICE}
            >
            </NumberInput>
          </InputSection>

          <InputSection label={`Số lượng đang bán`} gridColumns={gridColumns}>
            <NumberInput
              isDisable={true}
              value={productDetail.output_quantity + ``}
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
    </ManagerPage>
  );
}
