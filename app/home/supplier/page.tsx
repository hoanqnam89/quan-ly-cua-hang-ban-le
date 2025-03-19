'use client';

import { Button, IconContainer, Text, TextInput } from '@/components'
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
import { ERoleAction } from '@/interfaces/role.interface';
import { auth } from '@/services/Auth';
import { IAccountAuthentication } from '@/interfaces/account-authentication.interface';
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
  const [canCreate, setCanCreate] = useState<boolean>(false);
  const [canRead, setCanRead] = useState<boolean>(false);
  const [canUpdate, setCanUpdate] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  
  const setCanReadCollection: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const canReadCollectionApiResponse: Response = await auth(
        ERoleAction.READ, collectionName
      );

      const canReadCollectionApiJson: IAccountAuthentication = 
        await canReadCollectionApiResponse.json();

      setCanRead(canReadCollectionApiJson.isAccountHadPrivilage);
    },
    [],
  );

  const setCanCreateCollection: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const canCreateCollectionApiResponse: Response = await auth(
        ERoleAction.CREATE, collectionName
      );

      const canCreateCollectionApiJson: IAccountAuthentication = 
        await canCreateCollectionApiResponse.json();

      setCanCreate(canCreateCollectionApiJson.isAccountHadPrivilage);
    },
    [],
  );

  const setCanUpdateCollection: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const canUpdateCollectionApiResponse: Response = await auth(
        ERoleAction.CREATE, collectionName
      );

      const canUpdateCollectionApiJson: IAccountAuthentication = 
        await canUpdateCollectionApiResponse.json();

      setCanUpdate(canUpdateCollectionApiJson.isAccountHadPrivilage);
    },
    [],
  );

  const setCanDeleteCollection: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const canDeleteCollectionApiResponse: Response = await auth(
        ERoleAction.CREATE, collectionName
      );

      const canDeleteCollectionApiJson: IAccountAuthentication = 
        await canDeleteCollectionApiResponse.json();

      setCanDelete(canDeleteCollectionApiJson.isAccountHadPrivilage);
    },
    [],
  );

  useEffect((): void => {
    setCanCreateCollection();
  }, [setCanCreateCollection])

  useEffect((): void => {
    setCanReadCollection();
  }, [setCanReadCollection])

  useEffect((): void => {
    setCanUpdateCollection();
  }, [setCanUpdateCollection])

  useEffect((): void => {
    setCanDeleteCollection();
  }, [setCanDeleteCollection])

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
      title: `ID`,
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
      canCreateCollection={canCreate}
      canReadCollection={canRead}
      canUpdateCollection={canUpdate}
      canDeleteCollection={canDelete}
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

        <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={supplier}>
          </TimestampTabItem>
        </TabItem>

      </Tabs>
    </ManagerPage>
  );
}
