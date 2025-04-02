'use client'

import { ECollectionNames } from '@/enums';
import Image from 'next/image';
import { IPageParams } from '@/interfaces/page-params.interface'
import { getCollectionById } from '@/services/api-service';
import React, { ReactElement, use, useEffect, useState } from 'react'
import InputSection from '../../components/input-section/input-section';
import { TextInput, Text, SelectDropdown, Button, LoadingScreen } from '@/components';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { IBusiness } from '@/interfaces/business.interface';
import { DEFAULT_BUSINESS } from '@/constants/business.constant';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { EBusinessType } from '@/enums/business-type.enum';
import styles from '../style.module.css'
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { enumToKeyValueArray } from '@/utils/enum-to-array';

type collectionType = IBusiness;
const collectionName: ECollectionNames = ECollectionNames.BUSINESS;
const defaultCollection: collectionType = DEFAULT_BUSINESS;
const gridColumns: string = `200px 1fr`;
const businessTypeOptions: ISelectOption[] = enumToKeyValueArray(EBusinessType)
  .map((array: string[]): ISelectOption => ({
    label: array[0], 
    value: array[1], 
  }));

export default function Detail({
  params
}: Readonly<IPageParams>): ReactElement {
  const [collection, setCollection] = useState<collectionType>(
    defaultCollection
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { id } = use(params);

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

      <InputSection label={`Tên doanh nghiệp`} gridColumns={gridColumns}>
        <TextInput
          name={`name`}
          isDisable={true}
          value={collection.name}
        >
        </TextInput>
      </InputSection>

      <InputSection label={`Email`} gridColumns={gridColumns}>
        <TextInput
          name={`email`}
          isDisable={true}
          value={collection.email}
        >
        </TextInput>
      </InputSection>

      <InputSection label={`Loại`}>
        <SelectDropdown
          isDisable={true}
          options={businessTypeOptions}
          defaultOptionIndex={getSelectedOptionIndex(
            businessTypeOptions, 
            (collection.type 
              ? collection.type
              : EBusinessType.MANUFACTURER
            ) as unknown as string
          )}
        >
        </SelectDropdown>
      </InputSection>

      <InputSection label={`Hình ảnh`} gridColumns={gridColumns}>
        <div>
          <div className={`relative flex flex-wrap gap-2 overflow-scroll no-scrollbar`}>
            {
              collection.logo ? <div 
                className={`relative ${styles[`image-container`]}`}
              >
                <Image 
                  className={`w-full max-w-full max-h-full`}
                  src={collection.logo} 
                  alt={``}
                  width={0}
                  height={0}
                  quality={10}
                >
                </Image>
              </div> : <></>
            }
          </div> 
        </div>
      </InputSection>

      <InputSection label={`Số nhà`}>
        <TextInput
          name={`number`}
          isDisable={true}
          value={collection.address.number}
        >
        </TextInput>
      </InputSection>

      <InputSection label={`Đường`}>
        <TextInput
          name={`street`}
          isDisable={true}
          value={collection.address.street}
        >
        </TextInput>
      </InputSection>

      <InputSection label={`Phường`}>
        <TextInput
          name={`ward`}
          isDisable={true}
          value={collection.address.ward}
        >
        </TextInput>
      </InputSection>

      <InputSection label={`Quận`}>
        <TextInput
          name={`district`}
          isDisable={true}
          value={collection.address.district}
        >
        </TextInput>
      </InputSection>

      <InputSection label={`Thành phố`}>
        <TextInput
          name={`city`}
          isDisable={true}
          value={collection.address.city}
        >
        </TextInput>
      </InputSection>

      <InputSection label={`Quốc gia`}>
        <TextInput
          name={`country`}
          isDisable={true}
          value={collection.address.country}
        >
        </TextInput>
      </InputSection>

      <TimestampTabItem<collectionType> collection={collection}>
      </TimestampTabItem>

      {isLoading && <LoadingScreen></LoadingScreen>}
    </>
  )
}
