'use client';

import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, ReactElement, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { infoIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import Tabs from '@/components/tabs/tabs';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import { IProduct } from '@/interfaces/product.interface';
import { DEFAULT_PRODUCT } from '@/constants/product.constant';
import ManagerPage, { ICollectionIdNotify } from '@/pages/manager-page/manager-page';
import Button from '@/components/button/button';
import Text from '@/components/text/text';
import IconContainer from '@/components/icon-container/icon-container';
import TextInput from '@/components/text-input/text-input';
import NumberInput from '@/components/number-input/number-input';

type collectionType = IProduct;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT;

export default function RubikColorSet() {
  const [product, setProduct] = useState<IProduct>(DEFAULT_PRODUCT);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [isClickShowMore, setIsClickShowMore] = useState<ICollectionIdNotify>({
    id: ``, 
    isClicked: false
  });
  const [isClickDelete, setIsClickDelete] = useState<ICollectionIdNotify>({
    id: ``, 
    isClicked: false
  });

  const handleChangeProduct = (e: ChangeEvent<HTMLInputElement>): void => {
    setProduct({
      ...product, 
      [e.target.name]: e.target.value, 
    });
  }

  const columns: Array<IColumnProps<collectionType>> = [
    {
      key: `index`,
      ref: useRef(null), 
      title: `#`,
      size: `2fr`,
    },
    {
      key: `_id`,
      ref: useRef(null), 
      title: `ID`,
      size: `21fr`,
      isVisible: false, 
    },
    {
      key: `name`,
      ref: useRef(null), 
      title: `Tên sản phẩm`,
      size: `4fr`, 
    },
    {
      key: `description`,
      ref: useRef(null), 
      title: `Mô tả`,
      size: `7fr`, 
      isVisible: false, 
    },
    {
      key: `price`,
      ref: useRef(null), 
      title: `Giá`,
      size: `3fr`, 
    },
    {
      key: `images`,
      ref: useRef(null), 
      title: `Hình ảnh`,
      size: `4fr`, 
      isVisible: false, 
    },
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Ngày tạo`,
      size: `4fr`, 
      render: (rubikColorSet: collectionType): ReactElement => {
        const date: string = new Date(rubikColorSet.created_at).toLocaleString();
        return <Text title={date}>{date}</Text>
      }
    },
    {
      key: `updated_at`,
      ref: useRef(null), 
      title: `Ngày cập nhật`,
      size: `4fr`, 
      isVisible: false, 
      render: (rubikColorSet: collectionType): ReactElement => {
        const date: string = new Date(rubikColorSet.updated_at).toLocaleString();
        return <Text title={date}>{date}</Text>
      }
    },
    {
      title: `Xem thêm`,
      ref: useRef(null), 
      size: `3fr`, 
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
      size: `3fr`, 
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

  const gridColumns: string = `100px 1fr`;
  
  return (
    <ManagerPage<collectionType>
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_PRODUCT}
      collection={product}
      setCollection={setProduct}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
    >
      <Tabs>
        <TabItem label={`Sản phẩm`}>
          <InputSection label={`Tên sản phẩm`} gridColumns={gridColumns}>
            <TextInput
              name={`name`}
              isDisable={isModalReadOnly}
              value={product.name}
              onChange={handleChangeProduct}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Mô tả`} gridColumns={gridColumns}>
            <TextInput
              name={`description`}
              isDisable={isModalReadOnly}
              value={product.description}
              onChange={handleChangeProduct}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Giá`} gridColumns={gridColumns}>
            <NumberInput
              name={`price`}
              isDisable={isModalReadOnly}
              value={product.price}
              onChange={handleChangeProduct}
            >
            </NumberInput>
          </InputSection>
        </TabItem>

        <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={product}>
          </TimestampTabItem>
        </TabItem>
      </Tabs>
    </ManagerPage>
  );
}
