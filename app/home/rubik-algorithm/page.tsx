'use client';

import { Button, IconContainer, Text, TextInput } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { TRANSPARENT_BUTTON } from '@/constants'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, ReactElement, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { infoIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import { IRubikAlgorithm } from '@/interfaces/rubik-algorithm.interface';
import { DEFAULT_RUBIK_ALGORITHM } from '@/constants/rubik-algorithm.constant';
import Tabs from '@/components/tabs/tabs';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';

type collectionType = IRubikAlgorithm;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_ALGORITHM;

export default function RubikAlgorithm() {
  const [rubikAlgorithm, setRubikAlgorithm] = useState<collectionType>(
    DEFAULT_RUBIK_ALGORITHM
  );
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
      key: `rubik_case_id`,
      ref: useRef(null), 
      title: `Rubik Case`,
      size: `3fr`, 
    },
    {
      key: `user_add_id`,
      ref: useRef(null), 
      title: `User Add`,
      size: `3fr`, 
    },
    {
      key: `algorithm`,
      ref: useRef(null), 
      title: `Algorithm`,
      size: `3fr`, 
    },
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Created At`,
      size: `4fr`, 
      isVisible: false, 
      render: (rubikAlgorithm: collectionType): ReactElement => {
        const date: string = new Date(
          rubikAlgorithm.created_at
        ).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `updated_at`,
      ref: useRef(null), 
      title: `Updated At`,
      size: `4fr`, 
      render: (rubikAlgorithm: collectionType): ReactElement => {
        const date: string = new Date(
          rubikAlgorithm.updated_at
        ).toLocaleString();
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

  const handleChangeAlgorithm = (e: ChangeEvent<HTMLInputElement>): void => {
    setRubikAlgorithm({
      ...rubikAlgorithm, 
      algorithm: e.target.value, 
    });
  }

  return (
    <ManagerPage<collectionType>
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_RUBIK_ALGORITHM}
      collection={rubikAlgorithm}
      setCollection={setRubikAlgorithm}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
    >
      <Tabs>
        <TabItem>
          <InputSection label={`${collectionName}`}>
            <TextInput
              name={`algorithm`}
              isDisable={isModalReadOnly}
              value={rubikAlgorithm.algorithm}
              onInputChange={handleChangeAlgorithm}
            >
            </TextInput>
          </InputSection>
        </TabItem>

        <TabItem label={`Timestamp`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={rubikAlgorithm}>
          </TimestampTabItem>
        </TabItem>
      </Tabs>
    </ManagerPage>
  );
}
