'use client';

import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { IColumnProps } from '@/components/table/interfaces/column-props.interface';
import { ECollectionNames } from '@/enums';
import { infoIcon, trashIcon } from '@/public';
import { TRANSPARENT_BUTTON } from '@/constants';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import { Button, IconContainer, SelectDropdown, Text, TextInput } from '@/components';
import { IRubikCase } from '@/interfaces/rubik-case.interface';
import { DEFAULT_RUBIK_CASE } from '@/constants/rubik-case.constant';
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page';
import InputSection from '../components/input-section/input-section';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { IRubikAlgorithmSet } from '@/interfaces';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import Tabs from '@/components/tabs/tabs';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';

type collectionType = IRubikCase;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_CASE;

export default function RubikCase(): ReactElement {
  const [rubikCase, setRubikCase] = useState<collectionType>(
    DEFAULT_RUBIK_CASE
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rubikAlgorithmSetOptions, setRubikAlgorithmSetOptions] = 
    useState<ISelectOption[]>([]);

  const getRubikAlgorithmSets: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newRubikAlgorithmSets: IRubikAlgorithmSet[] = 
        await fetchGetCollections<IRubikAlgorithmSet>(
          ECollectionNames.RUBIK_ALGORITHM_SET, 
        );

      setRubikAlgorithmSetOptions([
        ...newRubikAlgorithmSets.map((
          rubikAlgorithmSet: IRubikAlgorithmSet
        ): ISelectOption => ({
          label: `${rubikAlgorithmSet.name}`,
          value: rubikAlgorithmSet._id,
        }))
      ]);
      setIsLoading(false);
    }, 
    [],
  );

  useEffect((): void => {
    getRubikAlgorithmSets();
  }, [getRubikAlgorithmSets]);

  const handleChangeRubikCase = (e: ChangeEvent<HTMLInputElement>): void => {
    setRubikCase({
      ...rubikCase, 
      [e.target.name]: e.target.value, 
    });
  }

  const handleChangeRubikAlgorithmSetId = (
    e: ChangeEvent<HTMLSelectElement>
  ): void => {
    setRubikCase({
      ...rubikCase, 
      rubik_algorithm_set_id: e.target.value, 
    });
  }

  const gridColumns: string = `100px 1fr`;

  const columns: Array<IColumnProps<collectionType>> = [
    {
      key: `index`,
      ref: useRef(null), 
      title: `#`,
      size: `2fr`,
    },
    {
      key: `_id`,
      ref: useRef(null), 
      title: `ID`,
      size: `21fr`,
      isVisible: false, 
    },
    {
      key: `name`,
      ref: useRef(null), 
      title: `Name`,
      size: `7fr`, 
    },
    {
      key: `state`,
      ref: useRef(null), 
      title: `State`,
      size: `7fr`, 
    },
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Created At`,
      size: `16fr`, 
      render: (rubikCase: collectionType): ReactElement => {
        const date: string = new Date(rubikCase.created_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `updated_at`,
      ref: useRef(null), 
      title: `Updated At`,
      size: `17fr`, 
      isVisible: false, 
      render: (rubikCase: collectionType): ReactElement => {
        const date: string = new Date(rubikCase.updated_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      title: `More`,
      ref: useRef(null), 
      size: `3fr`, 
      render: (rubikCase: collectionType): ReactElement => <Button 
        title={createMoreInfoTooltip(collectionName)}
        background={TRANSPARENT_BUTTON} 
        onClick={(): void => {
          setIsClickShowMore({
            id: rubikCase._id, 
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
      size: `3fr`, 
      render: (rubikCase: collectionType): ReactElement => <Button 
        title={createDeleteTooltip(collectionName)}
        background={TRANSPARENT_BUTTON} 
        onClick={(): void => {
          setIsClickDelete({
            id: rubikCase._id, 
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

  return (
    <ManagerPage<collectionType>
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_RUBIK_CASE}
      collection={rubikCase}
      setCollection={setRubikCase}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
    >
      <Tabs>
        <TabItem label={`${collectionName}`}>
          <InputSection 
            label={`${ECollectionNames.RUBIK_ALGORITHM_SET}`} 
            gridColumns={gridColumns}
          >
            <SelectDropdown
              isLoading={isLoading}
              isDisable={isModalReadOnly}
              options={rubikAlgorithmSetOptions}
              defaultOptionIndex={getSelectedOptionIndex(
                rubikAlgorithmSetOptions, rubikCase.rubik_algorithm_set_id
              )}
              onInputChange={handleChangeRubikAlgorithmSetId}
            >
            </SelectDropdown>
          </InputSection>

          <InputSection label={`Name`} gridColumns={gridColumns}>
            <TextInput
              isDisable={isModalReadOnly}
              value={rubikCase.name}
              onInputChange={handleChangeRubikCase}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`State`} gridColumns={gridColumns}>
            <TextInput
              isDisable={isModalReadOnly}
              value={rubikCase.state}
              onInputChange={handleChangeRubikCase}
            >
            </TextInput>
          </InputSection>
        </TabItem>

        <TabItem label={`Timestamp`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={rubikCase}>
          </TimestampTabItem>
        </TabItem>
      </Tabs>
    </ManagerPage>
  );
}
