'use client';

import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { IColumnProps } from '@/components/table/interfaces/column-props.interface';
import { ECollectionNames } from '@/enums';
import { IRole, IRoleGroup } from '@/interfaces';
import { infoIcon, trashIcon } from '@/public';
import { TRANSPARENT_BUTTON } from '@/constants';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import { Button, IconContainer, Text, TextInput } from '@/components';
import { DEFAULT_ROLE_GROUP } from '@/constants/role-group.constant';
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page';
import InputSection from '../components/input-section/input-section';
import Checkboxes, { ICheckbox } from '@/components/checkboxes/checkboxes';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';

type collectionType = IRoleGroup;
const collectionName: ECollectionNames = ECollectionNames.ROLE_GROUP;

export default function RoleGroup(): ReactElement {
  const [roleGroup, setRoleGroup] = useState<collectionType>(
    DEFAULT_ROLE_GROUP
  );
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [isClickShowMore, setIsClickShowMore] = useState<ICollectionIdNotify>({
    id: ``, 
    isClicked: false, 
  });
  const [isClickDelete, setIsClickDelete] = useState<ICollectionIdNotify>({
    id: ``, 
    isClicked: false, 
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [roleOptions, setRoleOptions] = useState<ICheckbox[]>([]);

  const getRoles: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newRoles: IRole[] = await fetchGetCollections<IRole>(
        ECollectionNames.ROLE, 
      );

      setRoleOptions([
        ...newRoles.map((role: IRole): ICheckbox => ({
          label: `${role.action} - ${role.collection_name}`,
          value: role._id,
          isChecked: roleGroup.role_ids.filter((
            candidateRoleId: string, 
          ): boolean => candidateRoleId === role._id).length > 0, 
        }))
      ]);
      setIsLoading(false);
    }, 
    [roleGroup.role_ids],
  );

  useEffect((): void => {
    getRoles();
  }, [getRoles]);

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    setRoleGroup({
      ...roleGroup, 
      name: e.target.value, 
    });
  }

  const handleChangeRoles = (
    e: ChangeEvent<HTMLInputElement>, 
    _option: ICheckbox, 
    index: number
  ): void => {
    const newRoleOptions: ICheckbox[] = roleOptions.map((
      roleOption: ICheckbox, roleOptionIndex: number
    ): ICheckbox => ({
      ...roleOption, 
      isChecked: index === roleOptionIndex 
        ? e.target.checked
        : roleOption.isChecked
    }));

    setRoleOptions(newRoleOptions);
    
    const newRoleGroup: collectionType = {
      ...roleGroup, 
      role_ids: newRoleOptions.filter((
        roleOption: ICheckbox
      ): boolean => roleOption.isChecked).map((
        roleOption: ICheckbox
      ): string => roleOption.value), 
    };

    setRoleGroup({...newRoleGroup});
  }

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
      title: `Name`,
      size: `3fr`, 
    },
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Created At`,
      size: `4fr`, 
      isVisible: false, 
      render: (roleGroup: collectionType): ReactElement => {
        const date: string = new Date(roleGroup.created_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `updated_at`,
      ref: useRef(null), 
      title: `Updated At`,
      size: `4fr`, 
      render: (roleGroup: collectionType): ReactElement => {
        const date: string = new Date(roleGroup.updated_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      title: `More`,
      ref: useRef(null), 
      size: `2fr`, 
      render: (roleGroup: collectionType): ReactElement => <Button 
        title={createMoreInfoTooltip(collectionName)}
        background={TRANSPARENT_BUTTON} 
        onClick={(): void => {
          setIsClickShowMore({
            id: roleGroup._id, 
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
      render: (roleGroup: collectionType): ReactElement => <Button 
        title={createDeleteTooltip(collectionName)}
        background={TRANSPARENT_BUTTON} 
        onClick={(): void => {
          setIsClickDelete({
            id: roleGroup._id, 
            isClicked: !isClickDelete.isClicked, 
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

  const gridColumns: string = `80px 1fr`;

  return (
    <ManagerPage<collectionType>
      columns={columns} 
      collectionName={collectionName} 
      defaultCollection={DEFAULT_ROLE_GROUP}
      collection={roleGroup}
      setCollection={setRoleGroup}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
    >
      <Tabs>
        <TabItem label={`${collectionName}`}>
          <InputSection label={`Name`} gridColumns={gridColumns}>
            <TextInput
              isDisable={isModalReadOnly}
              value={roleGroup.name}
              onInputChange={handleChangeName}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Roles`} gridColumns={gridColumns}>
            <Checkboxes
              isDisable={isModalReadOnly}
              isLoading={isLoading}
              options={roleOptions}
              setOptions={setRoleOptions}
              shouldSetOptions={false}
              onInputChange={handleChangeRoles}
            >
            </Checkboxes>
          </InputSection>
        </TabItem>

        <TabItem label={`Timestamp`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={roleGroup}>
          </TimestampTabItem>
        </TabItem>
      </Tabs>
    </ManagerPage>
  );
}
