'use client';

import { Button, IconContainer, Text, TextInput } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import { IAccount } from '@/interfaces'
import React, { ChangeEvent, ReactElement, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { infoIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import { DEFAULT_ACCOUNT } from '@/constants/account.constant';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import Checkbox from '@/components/checkbox/checkbox';
import { translateCollectionName } from '@/utils/translate-collection-name';

type collectionType = IAccount;
const collectionName: ECollectionNames = ECollectionNames.ACCOUNT;

export default function Account() {
  const [account, setAccount] = useState<collectionType>(DEFAULT_ACCOUNT);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [isClickShowMore, setIsClickShowMore] = useState<ICollectionIdNotify>({
    id: ``, 
    isClicked: false
  });
  const [isClickDelete, setIsClickDelete] = useState<ICollectionIdNotify>({
    id: ``, 
    isClicked: false
  });

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
      key: `username`,
      ref: useRef(null), 
      title: `Tài khoản`,
      size: `3fr`, 
    },
    {
      key: `password`,
      ref: useRef(null), 
      title: `Mật khẩu`,
      size: `3fr`, 
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

  const handleChangeAccount = (e: ChangeEvent<HTMLInputElement>): void => {
    setAccount({
      ...account, 
      [e.target.name]: e.target.value, 
    });
  }

  const handleChangeIsAdmin = (e: ChangeEvent<HTMLInputElement>): void => {
    setAccount({
      ...account, 
      is_admin: e.target.checked, 
    });
  }

  const gridColumns: string = `200px 1fr`;

  return (
    <ManagerPage<collectionType>
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_ACCOUNT}
      collection={account}
      setCollection={setAccount}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
    >
      <Tabs>

        <TabItem label={`${translateCollectionName(collectionName)}`}>
          <InputSection label={`Tên tài khoản`} gridColumns={gridColumns}>
            <TextInput
              name={`username`}
              isDisable={isModalReadOnly}
              value={account.username}
              onInputChange={handleChangeAccount}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Mật khẩu`} gridColumns={gridColumns}>
            <TextInput
              textType={`password`}
              name={`password`}
              isDisable={isModalReadOnly}
              value={account.password}
              onInputChange={handleChangeAccount}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Là quản trị viên`} gridColumns={gridColumns}>
            <Checkbox 
              isChecked={account.is_admin}
              isDisable={isModalReadOnly}
              onInputChange={handleChangeIsAdmin}
            >
            </Checkbox>
          </InputSection>
        </TabItem>

        <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={account}>
          </TimestampTabItem>
        </TabItem>

      </Tabs>
    </ManagerPage>
  );
}
