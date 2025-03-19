'use client';

import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { IColumnProps } from '@/components/table/interfaces/column-props.interface';
import { ECollectionNames } from '@/enums';
import { IRubik, IRubikAlgorithmSet } from '@/interfaces';
import { infoIcon, trashIcon } from '@/public';
import { DEFAULT_RUBIK_ALGORITHM_SET, TRANSPARENT_BUTTON } from '@/constants';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import { Button, IconContainer, SelectDropdown, Text, TextInput } from '@/components';
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page';
import InputSection from '../components/input-section/input-section';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import Tabs from '@/components/tabs/tabs';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';

type collectionType = IRubikAlgorithmSet;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_ALGORITHM_SET;

export default function RubikColorSet(): ReactElement {
  const [rubikAlgorithmSet, setRubikAlgorithmSet] = useState<collectionType>(
    DEFAULT_RUBIK_ALGORITHM_SET
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
  const [rubikOptions, setRubikOptions] = useState<ISelectOption[]>([]);

  const getRubiks: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newRubiks: IRubik[] = await fetchGetCollections<IRubik>(
        ECollectionNames.RUBIK, 
      );

      setRubikOptions([
        ...newRubiks.map((rubik: IRubik): ISelectOption => ({
          label: `${rubik.names[0]}`,
          value: rubik._id,
        }))
      ]);
      setIsLoading(false);
    }, 
    [],
  );

  useEffect((): void => {
    getRubiks();
  }, [getRubiks]);

  const handleChangeRubikId = (e: ChangeEvent<HTMLSelectElement>): void => {
    setRubikAlgorithmSet({
      ...rubikAlgorithmSet, 
      rubik_id: e.target.value, 
    });
  }

  const handleChangeRubikAlgorithmSet = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    setRubikAlgorithmSet({
      ...rubikAlgorithmSet, 
      [e.target.name]: e.target.value, 
    });
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
      key: `start_state`,
      ref: useRef(null), 
      title: `Start State`,
      size: `3fr`, 
    },
    {
      key: `end_state`,
      ref: useRef(null), 
      title: `End State`,
      size: `3fr`, 
    },
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Created At`,
      size: `4fr`, 
      isVisible: false, 
      render: (rubikAlgorithmSet: collectionType): ReactElement => {
        const date: string = new Date(
          rubikAlgorithmSet.created_at
        ).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `updated_at`,
      ref: useRef(null), 
      title: `Updated At`,
      size: `4fr`, 
      render: (rubikAlgorithmSet: collectionType): ReactElement => {
        const date: string = new Date(
          rubikAlgorithmSet.updated_at
        ).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      title: `More`,
      ref: useRef(null), 
      size: `2fr`, 
      render: (rubikAlgorithmSet: collectionType): ReactElement => <Button 
        title={createMoreInfoTooltip(collectionName)}
        background={TRANSPARENT_BUTTON} 
        onClick={(): void => {
          setIsClickShowMore({
            id: rubikAlgorithmSet._id, 
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
      render: (rubikAlgorithmSet: collectionType): ReactElement => <Button 
        title={createDeleteTooltip(collectionName)}
        background={TRANSPARENT_BUTTON} 
        onClick={(): void => {
          setIsClickDelete({
            id: rubikAlgorithmSet._id, 
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

  return (
    <ManagerPage<collectionType>
      columns={columns} 
      collectionName={collectionName} 
      defaultCollection={DEFAULT_RUBIK_ALGORITHM_SET}
      collection={rubikAlgorithmSet}
      setCollection={setRubikAlgorithmSet}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
    >
      <Tabs>
        <TabItem label={`${collectionName}`}>
          <InputSection label={`Rubik`}>
            <SelectDropdown
              isLoading={isLoading}
              isDisable={isModalReadOnly}
              options={rubikOptions}
              defaultOptionIndex={getSelectedOptionIndex(
                rubikOptions, rubikAlgorithmSet.rubik_id
              )}
              onInputChange={handleChangeRubikId}
            >
            </SelectDropdown>
          </InputSection>

          <InputSection label={`Name`}>
            <TextInput
              name={`name`}
              isDisable={isModalReadOnly}
              value={rubikAlgorithmSet.name}
              onInputChange={handleChangeRubikAlgorithmSet}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Start State`}>
            <TextInput
              name={`start_state`}
              isDisable={isModalReadOnly}
              value={rubikAlgorithmSet.start_state}
              onInputChange={handleChangeRubikAlgorithmSet}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`End State`}>
            <TextInput
              name={`end_state`}
              isDisable={isModalReadOnly}
              value={rubikAlgorithmSet.end_state}
              onInputChange={handleChangeRubikAlgorithmSet}
            >
            </TextInput>
          </InputSection>
        </TabItem>

        <TabItem label={`Timestamp`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={rubikAlgorithmSet}>
          </TimestampTabItem>
        </TabItem>
      </Tabs>
    </ManagerPage>
  );
}
