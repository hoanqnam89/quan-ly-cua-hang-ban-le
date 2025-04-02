'use client'

import { ECollectionNames } from '@/enums';
import { IPageParams } from '@/interfaces/page-params.interface'
import { getCollectionById } from '@/services/api-service';
import React, { ReactElement, use, useCallback, useEffect, useState } from 'react'
import InputSection from '../../components/input-section/input-section';
import { TextInput, Text, SelectDropdown, NumberInput } from '@/components';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { IProduct } from '@/interfaces/product.interface';
import { DEFAULT_PROCDUCT } from '@/constants/product.constant';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import Image from 'next/image';
import styles from '../style.module.css';
import { IBusiness } from '@/interfaces/business.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { EBusinessType } from '@/enums/business-type.enum';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';

type collectionType = IProduct;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT;
const defaultCollection: collectionType = DEFAULT_PROCDUCT;
const gridColumns: string = `200px 1fr`;

export default function Detail({
  params
}: Readonly<IPageParams>): ReactElement {
  const [collection, setCollection] = useState<collectionType>(
    defaultCollection
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { id } = use(params);
  const [supplierOptions, setSupplierOptions] = useState<ISelectOption[]>([]);

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

      if (newSuppliers.length > 0) {
        setCollection({
          ...collection, 
          supplier_id: newSuppliers[0]._id, 
        });
      }
      setSupplierOptions([
        ...newSuppliers.map((supplier: IBusiness): ISelectOption => ({
          label: `${supplier.name}`,
          value: supplier._id,
        }))
      ]);
      setCollection({
        ...collection, 
        supplier_id: newSuppliers[0]._id
      })
      setIsLoading(false);
    }, 
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [collection.supplier_id],
  );
  
  useEffect((): void => {
    getSuppliers();
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
  });

  return (
    <>
      <Text size={32}>Chi tiết {translateCollectionName(collectionName)} {id}</Text>

      <InputSection label={`Cho nhà sản xuất`}>
        <SelectDropdown
          name={`supplier_id`}
          isLoading={isLoading}
          isDisable={true}
          options={supplierOptions}
          defaultOptionIndex={getSelectedOptionIndex(
            supplierOptions, collection.supplier_id
          )}
        >
        </SelectDropdown>
      </InputSection>

      <InputSection label={`Tên sản phẩm`} gridColumns={gridColumns}>
        <TextInput
          name={`name`}
          isDisable={true}
          value={collection.name}
        >
        </TextInput>
      </InputSection>

      <InputSection label={`Mô tả`} gridColumns={gridColumns}>
        <TextInput
          name={`description`}
          isDisable={true}
          value={collection.description}
        >
        </TextInput>
      </InputSection>

      <InputSection label={`Giá nhập (VNĐ)`} gridColumns={gridColumns}>
        <NumberInput
          name={`input_price`}
          isDisable={true}
          value={collection.input_price + ``}
        >
        </NumberInput>
      </InputSection>

      <InputSection label={`Giá bán (VNĐ)`} gridColumns={gridColumns}>
        <NumberInput
          name={`output_price`}
          isDisable={true}
          value={collection.output_price + ``}
        >
        </NumberInput>
      </InputSection>

      <InputSection label={`Hình ảnh sản phẩm`} gridColumns={gridColumns}>
        <div>
          <div className={`relative flex flex-wrap gap-2 overflow-scroll no-scrollbar`}>
            {
              collection.image_links.map((image: string, index: number) => 
                <div 
                  key={index} 
                  className={`relative ${styles[`image-container`]}`}
                >
                  <Image 
                    className={`w-full max-w-full max-h-full`}
                    src={image} 
                    alt={``}
                    width={0}
                    height={0}
                    quality={10}
                  >
                  </Image>
                </div>
              )
            }
          </div> 
        </div>
      </InputSection>

      <TimestampTabItem<collectionType> collection={collection}>
      </TimestampTabItem>
    </>
  )
}
