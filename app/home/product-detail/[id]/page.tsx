'use client'

import { ECollectionNames } from '@/enums';
import { IPageParams } from '@/interfaces/page-params.interface'
import { getCollectionById } from '@/services/api-service';
import React, { ReactElement, use, useCallback, useEffect, useState } from 'react'
import InputSection from '../../components/input-section/input-section';
import { Text, NumberInput, SelectDropdown, LoadingScreen, Button } from '@/components';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { IProductDetail } from '@/interfaces/product-detail.interface';
import { DEFAULT_PROCDUCT_DETAIL } from '@/constants/product-detail.constant';
import DateInput from '@/components/date-input/date-input';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { IProduct } from '@/interfaces/product.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { createCollectionDetailLink } from '@/utils/create-collection-detail-link';
import { ENotificationType } from '@/components/notify/notification/notification';
import useNotificationsHook from '@/hooks/notifications-hook';

type collectionType = IProductDetail;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT_DETAIL;
const defaultCollection: collectionType = DEFAULT_PROCDUCT_DETAIL;
const gridColumns: string = `200px 1fr`;

export default function Detail({
  params
}: Readonly<IPageParams>): ReactElement {
  const { id } = use(params);
  const { createNotification, notificationElements } = useNotificationsHook();
  const [collection, setCollection] = useState<collectionType>(defaultCollection);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [productOptions, setProductOptions] = useState<ISelectOption[]>([]);

  const getProducts = useCallback(async () => {
    try {
      const getCollectionApiResponse = await getCollectionById(id, collectionName);
      const productDetail = await getCollectionApiResponse.json();
      setCollection(productDetail);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      createNotification({
        type: ENotificationType.ERROR,
        children: 'Không thể tải dữ liệu: ' + (error as Error).message,
        isAutoClose: true,
        id: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const getCollectionNameById = useCallback(async () => {
    try {
      const products = await fetchGetCollections<IProduct>(ECollectionNames.PRODUCT);
      setProductOptions(
        products.map((product: IProduct): ISelectOption => ({
          label: `${product.name}`,
          value: product._id,
        }))
      );
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
    }
  }, []);

  const handleTransferStock = async () => {
    try {
      const response = await fetch(`/api/product-detail/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_quantity: 0,
          output_quantity: collection.input_quantity
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể chuyển tồn kho');
      }

      const updatedProduct = await response.json();
      setCollection(updatedProduct);
      createNotification({
        type: ENotificationType.SUCCESS,
        children: 'Đã chuyển tồn kho sang đang bán thành công',
        isAutoClose: true,
        id: 0
      });
    } catch (error) {
      createNotification({
        type: ENotificationType.ERROR,
        children: 'Không thể chuyển tồn kho: ' + (error as Error).message,
        isAutoClose: true,
        id: 0
      });
    }
  };

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  useEffect(() => {
    getCollectionNameById();
  }, [getCollectionNameById]);

  return (
    <>
      <Text size={32}>Chi tiết {translateCollectionName(collectionName)} {id}</Text>

      <InputSection label={`Cho sản phẩm`}>
        <div className={`flex items-center justify-center gap-2`}>
          {createCollectionDetailLink(
            ECollectionNames.PRODUCT,
            collection.product_id
          )}

          <SelectDropdown
            isLoading={isLoading}
            isDisable={true}
            options={productOptions}
            defaultOptionIndex={getSelectedOptionIndex(
              productOptions, collection.product_id
            )}
          >
          </SelectDropdown>
        </div>
      </InputSection>

      <InputSection label={`Ngày sản xuất`} gridColumns={gridColumns}>
        <DateInput
          name={`date_of_manufacture`}
          isDisable={true}
          value={collection.date_of_manufacture}
        >
        </DateInput>
      </InputSection>

      <InputSection label={`Hạn sử dụng`} gridColumns={gridColumns}>
        <DateInput
          name={`expiry_date`}
          isDisable={true}
          value={collection.expiry_date}
        >
        </DateInput>
      </InputSection>

      <InputSection label={`Số lượng trong kho`} gridColumns={gridColumns}>
        <NumberInput
          isDisable={true}
          value={collection.input_quantity + ``}
        >
        </NumberInput>
      </InputSection>

      <InputSection label={`Số lượng đang bán`} gridColumns={gridColumns}>
        <div className="flex items-center gap-2">
          <NumberInput
            isDisable={true}
            value={collection.output_quantity + ``}
          >
          </NumberInput>
          {collection.output_quantity === 0 && collection.input_quantity > 0 && (
            <Button onClick={handleTransferStock}>
              Chuyển
            </Button>
          )}
        </div>
      </InputSection>

      <TimestampTabItem<collectionType> collection={collection}>
      </TimestampTabItem>

      {isLoading && <LoadingScreen></LoadingScreen>}
      {notificationElements}
    </>
  )
}
