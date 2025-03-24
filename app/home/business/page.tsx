'use client';

import { Button, IconContainer, SelectDropdown, Text, TextInput } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { infoIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import Image from 'next/image';
import styles from './style.module.css';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { IBusiness } from '@/interfaces/business.interface';
import { DEFAULT_BUSINESS } from '@/constants/business.constant';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { enumToKeyValueArray } from '@/utils/enum-to-array';
import { EBusinessType } from '@/enums/business-type.enum';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';

type collectionType = IBusiness;
const collectionName: ECollectionNames = ECollectionNames.BUSINESS;

export default function Product() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [business, setBusiness] = useState<collectionType>(DEFAULT_BUSINESS);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [isClickShowMore, setIsClickShowMore] = useState<ICollectionIdNotify>({
    id: ``, 
    isClicked: false
  });
  const [isClickDelete, setIsClickDelete] = useState<ICollectionIdNotify>({
    id: ``, 
    isClicked: false
  });
  
  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files)
      return;

    const file: File = e.target.files[0];
    if (!file)
      return;

    setImageFile(file);
  }

  useEffect(() => {
    let isCancel = false;
    const fileReader: FileReader = new FileReader();

    if (imageFile) {
      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (result && !isCancel) {
          setBusiness({
            ...business, 
            logo: result.toString(), 
          });
        }
      }
      fileReader.readAsDataURL(imageFile);
    }

    return () => {
      isCancel = true;
      if (fileReader.readyState === 1) {
        fileReader.abort();
      }
    }
  }, [imageFile, business]);

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
      key: `name`,
      ref: useRef(null), 
      title: `Tên doanh nghiệp`,
      size: `3fr`, 
    },
    {
      key: `logo`,
      ref: useRef(null), 
      title: `Hình ảnh`,
      size: `3fr`, 
      render: (collection: collectionType): ReactElement => collection.logo ? <div 
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
      </div> : <Text isItalic={true}>Không có hình ảnh</Text>
    }, 
    {
      key: `address`,
      ref: useRef(null), 
      title: `Địa chỉ`,
      size: `5fr`, 
      render: (collection: collectionType): ReactElement => {
        const address: string = `${collection.address.number} ${collection.address.street}, ${collection.address.ward}, ${collection.address.district}, ${collection.address.city}, ${collection.address.country}`;
        return <Text isEllipsis={true} tooltip={address}>{address}</Text>
      }
    },
    {
      key: `type`,
      ref: useRef(null), 
      title: `Loại`,
      size: `3fr`, 
      render: (collection: collectionType): ReactElement => {
        const type: string = collection.type === EBusinessType.MANUFACTURER 
          ? `Nhà sản xuất`
          : `Nhà cung cấp`;
        return <Text isEllipsis={true} tooltip={type}>{type}</Text>
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

  const handleChangeBusiness = (e: ChangeEvent<HTMLInputElement>): void => {
    setBusiness({
      ...business, 
      [e.target.name]: e.target.value, 
    });
  }

  const handleChangeAddress = (e: ChangeEvent<HTMLInputElement>): void => {
    setBusiness({
      ...business, 
      address: {
        ...business.address, 
        [e.target.name]: e.target.value, 
      }
    });
  }

  const handleChangeBusinessType = (e: ChangeEvent<HTMLSelectElement>): void => {
    setBusiness({
      ...business, 
      type: e.target.value, 
    });
  }

  const handleDeleteImage = (): void => {
    setBusiness({
      ...business, 
      logo: undefined, 
    });
    setImageFile(null);
  }

  const gridColumns: string = `200px 1fr`;

  const businessTypeOptions: ISelectOption[] = enumToKeyValueArray(EBusinessType)
    .map((array: string[]): ISelectOption => ({
      label: array[0], 
      value: array[1], 
    }));

  return (
    <ManagerPage<collectionType>
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_BUSINESS}
      collection={business}
      setCollection={setBusiness}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
    >
      <Tabs>

        <TabItem label={`${translateCollectionName(collectionName)}`}>
          <InputSection label={`Tên nhà cung cấp`} gridColumns={gridColumns}>
            <TextInput
              name={`name`}
              isDisable={isModalReadOnly}
              value={business.name}
              onInputChange={handleChangeBusiness}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Loại`}>
            <SelectDropdown
              isDisable={isModalReadOnly}
              options={businessTypeOptions}
              defaultOptionIndex={getSelectedOptionIndex(
                businessTypeOptions, 
                (business.type 
                  ? business.type
                  : EBusinessType.MANUFACTURER
                ) as unknown as string
              )}
              onInputChange={handleChangeBusinessType}
            >
            </SelectDropdown>
          </InputSection>

          <InputSection label={`Hình ảnh`} gridColumns={gridColumns}>
            <div>
              {!isModalReadOnly ? <input
                type={`file`}
                accept={`image/*`}
                multiple={true}
                onChange={handleChangeImage}
                disabled={isModalReadOnly}
              >
              </input> : null}

              <div className={`relative flex flex-wrap gap-2 overflow-scroll no-scrollbar`}>
                {
                  business.logo ? <div 
                    className={`relative ${styles[`image-container`]}`}
                  >
                    <Image 
                      className={`w-full max-w-full max-h-full`}
                      src={business.logo} 
                      alt={``}
                      width={0}
                      height={0}
                      quality={10}
                    >
                    </Image>

                    {!isModalReadOnly ? <div className={`absolute top-0 right-0`}>
                      <Button 
                        className={`absolute top-0 right-0`} 
                        onClick={() => handleDeleteImage()}
                      >
                        <IconContainer iconLink={trashIcon}>
                        </IconContainer>
                      </Button>
                    </div> : null}
                  </div> : <></>
                }
              </div> 
            </div>
          </InputSection>
        </TabItem>

        <TabItem label={`Địa chỉ`}>
          <div className={`flex flex-col gap-2`}>
            <InputSection label={`Quốc gia`}>
              <TextInput
                name={`country`}
                isDisable={isModalReadOnly}
                value={business.address.country}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Thành phố`}>
              <TextInput
                name={`city`}
                isDisable={isModalReadOnly}
                value={business.address.city}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Quận`}>
              <TextInput
                name={`district`}
                isDisable={isModalReadOnly}
                value={business.address.district}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Phường`}>
              <TextInput
                name={`ward`}
                isDisable={isModalReadOnly}
                value={business.address.ward}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Đường`}>
              <TextInput
                name={`street`}
                isDisable={isModalReadOnly}
                value={business.address.street}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Số nhà`}>
              <TextInput
                name={`number`}
                isDisable={isModalReadOnly}
                value={business.address.number}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>
          </div>

        </TabItem>

        <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={business}>
          </TimestampTabItem>
        </TabItem>

      </Tabs>
    </ManagerPage>
  );
}
