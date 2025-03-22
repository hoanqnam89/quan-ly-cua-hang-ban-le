'use client';

import { Button, IconContainer, Text, TextInput } from '@/components'
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
import { ISupplier } from '@/interfaces/supplier.interface';
import { DEFAULT_SUPPLIER } from '@/constants/supplier.constant';

type collectionType = ISupplier;
const collectionName: ECollectionNames = ECollectionNames.SUPPLIER;

export default function Product() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [supplier, setSupplier] = useState<collectionType>(DEFAULT_SUPPLIER);
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
          setSupplier({
            ...supplier, 
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
  }, [imageFile, supplier]);

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
      title: `Tên nhà cung cấp`,
      size: `3fr`, 
    },
    {
      key: `logo`,
      ref: useRef(null), 
      title: `Hình ảnh`,
      size: `3fr`, 
      render: (product: collectionType): ReactElement => product.logo ? <div 
        className={`relative ${styles[`image-container`]}`}
      >
        <Image 
          className={`w-full max-w-full max-h-full`}
          src={product.logo} 
          alt={``}
          width={0}
          height={0}
          quality={10}
        >
        </Image>
      </div> : <></>
    }, 
    {
      key: `address`,
      ref: useRef(null), 
      title: `Địa chỉ`,
      size: `5fr`, 
      isVisible: false, 
      render: (user: collectionType): ReactElement => {
        const address: string = `${user.address.number} ${user.address.street}, ${user.address.ward}, ${user.address.district}, ${user.address.city}, ${user.address.country}`;
        return <Text isEllipsis={true} tooltip={address}>{address}</Text>
      }
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

  const handleChangeSupplier = (e: ChangeEvent<HTMLInputElement>): void => {
    setSupplier({
      ...supplier, 
      [e.target.name]: e.target.value, 
    });
  }

  const handleChangeAddress = (e: ChangeEvent<HTMLInputElement>): void => {
    setSupplier({
      ...supplier, 
      address: {
        ...supplier.address, 
        [e.target.name]: e.target.value, 
      }
    });
  }

  const handleDeleteImage = (): void => {
    setSupplier({
      ...supplier, 
      logo: undefined, 
    });
    setImageFile(null);
  }

  const gridColumns: string = `80px 1fr`;

  return (
    <ManagerPage<collectionType>
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_SUPPLIER}
      collection={supplier}
      setCollection={setSupplier}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
    >
      <Tabs>

        <TabItem label={`${collectionName}`}>
          <InputSection label={`Tên nhà cung cấp`} gridColumns={gridColumns}>
            <TextInput
              name={`name`}
              isDisable={isModalReadOnly}
              value={supplier.name}
              onInputChange={handleChangeSupplier}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Hình ảnh`} gridColumns={gridColumns}>
            <div>
              <input
                type={`file`}
                accept={`image/*`}
                multiple={true}
                onChange={handleChangeImage}
                disabled={isModalReadOnly}
              >
              </input>

              <div className={`relative flex flex-wrap gap-2 overflow-scroll no-scrollbar`}>
                {
                  supplier.logo ? <div 
                    className={`relative ${styles[`image-container`]}`}
                  >
                    <Image 
                      className={`w-full max-w-full max-h-full`}
                      src={supplier.logo} 
                      alt={``}
                      width={0}
                      height={0}
                      quality={10}
                    >
                    </Image>

                    <div className={`absolute top-0 right-0`}>
                      <Button 
                        className={`absolute top-0 right-0`} 
                        onClick={() => handleDeleteImage()}
                      >
                        <IconContainer iconLink={trashIcon}>
                        </IconContainer>
                      </Button>
                    </div>
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
                value={supplier.address.country}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Thành phố`}>
              <TextInput
                name={`city`}
                isDisable={isModalReadOnly}
                value={supplier.address.city}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Quận`}>
              <TextInput
                name={`district`}
                isDisable={isModalReadOnly}
                value={supplier.address.district}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Phường`}>
              <TextInput
                name={`ward`}
                isDisable={isModalReadOnly}
                value={supplier.address.ward}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Đường`}>
              <TextInput
                name={`street`}
                isDisable={isModalReadOnly}
                value={supplier.address.street}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Số nhà`}>
              <TextInput
                name={`number`}
                isDisable={isModalReadOnly}
                value={supplier.address.number}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>
          </div>

        </TabItem>

        <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={supplier}>
          </TimestampTabItem>
        </TabItem>

      </Tabs>
    </ManagerPage>
  );
}
