'use client';

import { Button, IconContainer, Text, TextInput } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { TRANSPARENT_BUTTON } from '@/constants'
import { ECollectionNames } from '@/enums'
import { IAccount, IRoleGroup } from '@/interfaces'
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { infoIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import { DEFAULT_ACCOUNT } from '@/constants/account.constant';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import Checkboxes, { ICheckbox } from '@/components/checkboxes/checkboxes';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { ERoleAction } from '@/interfaces/role.interface';
import { auth } from '@/services/Auth';
import { IAccountAuthentication } from '@/interfaces/account-authentication.interface';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [roleGroupOptions, setRoleGroupOptions] = useState<ICheckbox[]>([]);
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

  const getRoleGroups: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      if ( !canRead ) {
        setIsLoading(false);
        return;
      }

      const newRoleGroups: IRoleGroup[] = await fetchGetCollections<IRoleGroup>(
        ECollectionNames.ROLE_GROUP, 
      );

      setRoleGroupOptions([
        ...newRoleGroups.map((roleGroup: IRoleGroup): ICheckbox => ({
          label: `${roleGroup.name}`,
          value: roleGroup._id,
          isChecked: account.role_group_ids.filter((
            candidateRoleGroupId: string, 
          ): boolean => candidateRoleGroupId === roleGroup._id).length > 0, 
        }))
      ]);
      setIsLoading(false);
    }, 
    [canRead, account.role_group_ids],
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

  useEffect((): void => {
    getRoleGroups();
  }, [getRoleGroups]);

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
      key: `username`,
      ref: useRef(null), 
      title: `Username`,
      size: `3fr`, 
    },
    {
      key: `password`,
      ref: useRef(null), 
      title: `Password`,
      size: `3fr`, 
    },
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Created At`,
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
      title: `Updated At`,
      size: `4fr`, 
      render: (account: collectionType): ReactElement => {
        const date: string = new Date(account.updated_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      title: `More`,
      ref: useRef(null), 
      size: `2fr`, 
      render: (collection: collectionType): ReactElement => <Button 
        title={createMoreInfoTooltip(collectionName)}
        background={TRANSPARENT_BUTTON} 
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
      title: `Delete`,
      ref: useRef(null), 
      size: `2fr`, 
      render: (collection: collectionType): ReactElement => <Button 
        title={createDeleteTooltip(collectionName)}
        background={TRANSPARENT_BUTTON} 
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

  const handleChangeRoleGroups = (
    e: ChangeEvent<HTMLInputElement>, 
    _option: ICheckbox, 
    index: number
  ): void => {
    const newRoleGroupOptions: ICheckbox[] = roleGroupOptions.map((
      roleGroupOption: ICheckbox, roleGroupOptionIndex: number
    ): ICheckbox => ({
      ...roleGroupOption, 
      isChecked: index === roleGroupOptionIndex 
        ? e.target.checked
        : roleGroupOption.isChecked
    }));

    setRoleGroupOptions(newRoleGroupOptions);
    
    const newAccount: collectionType = {
      ...account, 
      role_group_ids: newRoleGroupOptions.filter((
        roleGroupOption: ICheckbox
      ): boolean => roleGroupOption.isChecked).map((
        roleGroupOption: ICheckbox
      ): string => roleGroupOption.value), 
    };

    setAccount({...newAccount});
  }

  const gridColumns: string = `80px 1fr`;

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
      canCreateCollection={canCreate}
      canReadCollection={canRead}
      canUpdateCollection={canUpdate}
      canDeleteCollection={canDelete}
    >
      <Tabs>

        <TabItem label={`${collectionName}`}>
          <InputSection label={`Username`} gridColumns={gridColumns}>
            <TextInput
              name={`username`}
              isDisable={isModalReadOnly}
              value={account.username}
              onInputChange={handleChangeAccount}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Password`} gridColumns={gridColumns}>
            <TextInput
              isPassword={true}
              name={`password`}
              isDisable={isModalReadOnly}
              value={account.password}
              onInputChange={handleChangeAccount}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Roles`} gridColumns={gridColumns}>
            <Checkboxes
              isDisable={isModalReadOnly}
              isLoading={isLoading}
              options={roleGroupOptions}
              setOptions={setRoleGroupOptions}
              shouldSetOptions={false}
              onInputChange={handleChangeRoleGroups}
            >
            </Checkboxes>
          </InputSection>
        </TabItem>

        <TabItem label={`Timestamp`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={account}>
          </TimestampTabItem>
        </TabItem>

      </Tabs>
    </ManagerPage>
  );
}
