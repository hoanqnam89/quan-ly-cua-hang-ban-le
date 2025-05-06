'use client';

import { Button, IconContainer, SelectDropdown, Text, TextInput } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, ReactElement, useEffect, useRef, useState, useCallback } from 'react'
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
import { createCollectionDetailLink } from '@/utils/create-collection-detail-link';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);

  // Optimize image handling with useMemo to prevent unnecessary re-renders
  const handleChangeImage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setImageFile(e.target.files[0]);
  }, []);

  // Optimize image loading with proper cleanup
  useEffect(() => {
    if (!imageFile) return;

    let isCancel = false;
    const fileReader: FileReader = new FileReader();

    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;
      if (result && !isCancel) {
        setBusiness(prevBusiness => ({
          ...prevBusiness,
          logo: result.toString(),
        }));
      }
    }

    fileReader.readAsDataURL(imageFile);

    return () => {
      isCancel = true;
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort();
      }
    }
  }, [imageFile]);

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
    },
    {
      key: `name`,
      ref: useRef(null),
      title: `Tên doanh nghiệp`,
      size: `3fr`,
    },
    {
      key: `email`,
      ref: useRef(null),
      title: `Email`,
      size: `3fr`,
    },
    {
      key: `logo`,
      ref: useRef(null),
      title: `Hình ảnh`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement => collection.logo
        ? <div className={`relative ${styles[`image-container`]}`}>
          <Image
            className={`w-full max-w-full max-h-full`}
            src={collection.logo}
            alt={``}
            width={100}
            height={100}
            quality={10}
            loading="lazy"
          >
          </Image>
        </div>
        : <Text isItalic={true}>none</Text>
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
      render: (collection: collectionType): ReactElement => {
        const date: string = new Date(collection.created_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    // {
    //   key: `updated_at`,
    //   ref: useRef(null),
    //   title: `Ngày cập nhật`,
    //   size: `4fr`,
    //   render: (collection: collectionType): ReactElement => {
    //     const date: string = new Date(collection.updated_at).toLocaleString();
    //     return <Text isEllipsis={true} tooltip={date}>{date}</Text>
    //   }
    // },
    {
      title: `Xem chi tiết`,
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
      title: `Xem chi tiết`,
      isVisible: false,
      ref: useRef(null),
      size: `2fr`,
      render: (collection: collectionType): ReactElement =>
        createCollectionDetailLink(
          collectionName,
          collection._id
        )
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

  const handleChangeBusiness = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setBusiness(prevBusiness => ({
      ...prevBusiness,
      [e.target.name]: e.target.value,
    }));
  }, []); // Empty dependency array if it doesn't depend on any props or state

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

  const renderBusinessLogo = (): ReactElement | null => {
    if (!business.logo) {
      return null;
    }

    return (
      <div className={`relative ${styles[`image-container`]}`}>
        <Image
          className={`w-full max-w-full max-h-full`}
          src={business.logo}
          alt={business.name}
          width={100}
          height={100}
          quality={10}
          loading="lazy"
        />
        {!isModalReadOnly && (
          <Button onClick={handleDeleteImage}>
            <IconContainer iconLink={trashIcon} tooltip="Xóa ảnh" />
          </Button>
        )}
      </div>
    );
  };

  const gridColumns: string = `200px 1fr`;

  const businessTypeOptions: ISelectOption[] = enumToKeyValueArray(EBusinessType)
    .map((array: string[]): ISelectOption => ({
      label: array[0],
      value: array[1],
    }));

  // Giả sử bạn có danh sách doanh nghiệp là businessesList hoặc businesses, nếu không hãy thay bằng biến đúng
  // Nếu không có mảng, hãy tạo 1 mảng chứa business hiện tại
  const businessesList = [business];

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
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      totalItems={businesses.length}
      displayedItems={businesses}
    >
      <Tabs>
        <TabItem label={`${translateCollectionName(collectionName)}`}>
          <InputSection label={`Tên doanh nghiệp`} gridColumns={gridColumns}>
            <TextInput
              name={`name`}
              isDisable={isModalReadOnly}
              value={business.name}
              onInputChange={handleChangeBusiness}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Email`} gridColumns={gridColumns}>
            <TextInput
              name={`email`}
              isDisable={isModalReadOnly}
              value={business.email}
              onInputChange={handleChangeBusiness}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Loại`} gridColumns={gridColumns}>
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
                {renderBusinessLogo()}
              </div>
            </div>
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

          <InputSection label={`Đường`}>
            <TextInput
              name={`street`}
              isDisable={isModalReadOnly}
              value={business.address.street}
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

          <InputSection label={`Quận`}>
            <TextInput
              name={`district`}
              isDisable={isModalReadOnly}
              value={business.address.district}
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

          <InputSection label={`Quốc gia`}>
            <TextInput
              name={`country`}
              isDisable={isModalReadOnly}
              value={business.address.country}
              onInputChange={handleChangeAddress}
            >
            </TextInput>
          </InputSection>

        </TabItem>

        <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={business}>
          </TimestampTabItem>
        </TabItem>

      </Tabs>
    </ManagerPage>
  );
}
