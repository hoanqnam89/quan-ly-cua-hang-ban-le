'use client'

import { ECollectionNames } from '@/enums';
import { IPageParams } from '@/interfaces/page-params.interface'
import { getCollectionById } from '@/services/api-service';
import React, { ReactElement, use, useCallback, useEffect, useState } from 'react'
import InputSection from '../../components/input-section/input-section';
import { Text, NumberInput, SelectDropdown, LoadingScreen } from '@/components';
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

type collectionType = IProductDetail;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT_DETAIL;
const defaultCollection: collectionType = DEFAULT_PROCDUCT_DETAIL;
const gridColumns: string = `200px 1fr`;

export default function Detail({
  params
}: Readonly<IPageParams>): ReactElement {
  const [collection, setCollection] = useState<collectionType>(
    defaultCollection
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { id } = use(params);
  const [productOptions, setProductOptions] = useState<ISelectOption[]>([]);

  const getProducts: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newProducts: IProduct[] = await fetchGetCollections<IProduct>(
        ECollectionNames.PRODUCT, 
      );

      setCollection({
        ...collection, 
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
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect((): void => {
    const getCollectionNameById = async () => {
      const getCollectionApiResponse: Response = 
        await getCollectionById(id, collectionName);
      const getCollectionApiJson = await getCollectionApiResponse.json();
      setCollection(getCollectionApiJson);
      setIsLoading(false);
    }
    getCollectionNameById();
  }, []);

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
        <NumberInput
          isDisable={true}
          value={collection.output_quantity + ``}
        >
        </NumberInput>
      </InputSection>

      <TimestampTabItem<collectionType> collection={collection}>
      </TimestampTabItem>

      {isLoading && <LoadingScreen></LoadingScreen>}
    </>
  )
}
