'use client';

import React, { ChangeEvent, ReactElement, useRef, useState } from 'react';
import { IColumnProps } from '@/components/table/interfaces/column-props.interface';
import { ECollectionNames } from '@/enums';
import { IRole } from '@/interfaces';
import { infoIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import { Button, IconContainer, SelectDropdown, Text } from '@/components';
import { DEFAULT_ROLE } from '@/constants/role.constant';
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page';
import InputSection from '../components/input-section/input-section';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { enumToArray, enumToKeyValueArray } from '@/utils/enum-to-array';
import { convertToMongoCollectionName } from '@/utils/convert-to-mongo-collection-name';
import { ERoleAction } from '@/interfaces/role.interface';
import Tabs from '@/components/tabs/tabs';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';

type collectionType = IRole;
const collectionName: ECollectionNames = ECollectionNames.ROLE;

export default function Role(): ReactElement {
  const [role, setRole] = useState<collectionType>(DEFAULT_ROLE);
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
      title: `ID`,
      size: `6fr`,
      isVisible: false, 
    },
    {
      key: `collection_name`,
      ref: useRef(null), 
      title: `Collection Name`,
      size: `3fr`, 
    },
    {
      key: `action`,
      ref: useRef(null), 
      title: `Action`,
      size: `3fr`, 
    },
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Created At`,
      size: `4fr`, 
      isVisible: false, 
      render: (role: collectionType): ReactElement => {
        const date: string = new Date(role.created_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `updated_at`,
      ref: useRef(null), 
      title: `Updated At`,
      size: `4fr`, 
      render: (role: collectionType): ReactElement => {
        const date: string = new Date(role.updated_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      title: `More`,
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
      title: `Delete`,
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

  const handleChangeRole = (e: ChangeEvent<HTMLSelectElement>): void => {
    setRole({
      ...role, 
      [e.target.name]: e.target.value, 
    });
  }

  const collectionNameOptions: ISelectOption[] = enumToArray(ECollectionNames)
    .map((collectionNameOption: string): ISelectOption => ({
      label: collectionNameOption, 
      value: convertToMongoCollectionName(collectionNameOption).toLowerCase(), 
    }));

  const actionOptions: ISelectOption[] = enumToKeyValueArray(ERoleAction)
    .map((array: string[]): ISelectOption => ({
      label: array[0], 
      value: array[1], 
    }));

  const gridColumns: string = `120px 1fr`;

  return (
    <ManagerPage<collectionType>
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_ROLE}
      collection={role}
      setCollection={setRole}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
    >
      <Tabs>

        <TabItem label={`${collectionName}`}>
          <InputSection label={`Collection Name`} gridColumns={gridColumns}>
            <SelectDropdown
              name={`collection_name`}
              isDisable={isModalReadOnly}
              options={collectionNameOptions}
              defaultOptionIndex={getSelectedOptionIndex(
                collectionNameOptions, role.collection_name
              )}
              onInputChange={handleChangeRole}
            >
            </SelectDropdown>
          </InputSection>

          <InputSection label={`Action`} gridColumns={gridColumns}>
            <SelectDropdown
              name={`action`}
              isDisable={isModalReadOnly}
              options={actionOptions}
              defaultOptionIndex={getSelectedOptionIndex(
                actionOptions, role.action
              )}
              onInputChange={handleChangeRole}
            >
            </SelectDropdown>
          </InputSection>
        </TabItem>

        <TabItem label={`Timestamp`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={role}>
          </TimestampTabItem>
        </TabItem>

      </Tabs>
    </ManagerPage>
  );
}
