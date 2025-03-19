'use client';

import { Button, IconContainer, TagsInput, Text, TextInput } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { DEFAULT_RUBIK_COLOR_SET, TRANSPARENT_BUTTON} from '@/constants'
import { ECollectionNames } from '@/enums'
import { IRubikColorSet} from '@/interfaces'
import { IRubikColor } from '@/interfaces/rubik-color-set.interface';
import React, { ChangeEvent, CSSProperties, ReactElement, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { EInputType } from '@/components/tags-input/enums/input-type';
import { TTag } from '@/components/tags-input/types/tag';
import { infoIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import Tabs from '@/components/tabs/tabs';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';

type collectionType = IRubikColorSet;
const collectionName: ECollectionNames = ECollectionNames.RUBIK_COLOR_SET;

export default function RubikColorSet() {
  const [rubikColorSet, setRubikColorSet] = useState<IRubikColorSet>(
    DEFAULT_RUBIK_COLOR_SET
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

  const handleChangeColor = (tags: TTag[]): void => {
    setRubikColorSet({
      ...rubikColorSet, 
      colors: tags.map((tag: TTag, tagIndex: number): IRubikColor => ({
        _id: ``, 
        key: tagIndex.toString(), 
        hex: tag as string, 
      })), 
    });
  }

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    setRubikColorSet({
      ...rubikColorSet, 
      name: e.target.value, 
    });
  }

  const rubikColorSetColorsToTags = (): TTag[] => rubikColorSet.colors.map(
    (color: IRubikColor): string => color.hex
  );
  
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
      key: `created_at`,
      ref: useRef(null), 
      title: `Created At`,
      size: `16fr`, 
      render: (rubikColorSet: collectionType): ReactElement => {
        const date: string = new Date(rubikColorSet.created_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `updated_at`,
      ref: useRef(null), 
      title: `Updated At`,
      size: `17fr`, 
      isVisible: false, 
      render: (rubikColorSet: collectionType): ReactElement => {
        const date: string = new Date(rubikColorSet.updated_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `colors`, 
      ref: useRef(null), 
      title: `Colors`,
      size: `32fr`, 
      render: (rubikColorSet: collectionType, key: string): ReactElement => 
        <div key={key} className={`flex items-center gap-2 flex-wrap`}>
          {rubikColorSet.colors.map((color: IRubikColor): ReactElement => {
            const colorStyle: CSSProperties = {
              width: `24px`, 
              background: color.hex, 
              outline: `1px solid light-dark(#000, #fff)`, 
              aspectRatio: `1 / 1`, 
            }

            return <div
              key={`${key}-${color._id}`}
              style={colorStyle}
              className={`flex items-center justify-center`}
              title={`${color.hex}`}
            >
              <Text isEllipsis={true} isOutlined={true}>{color.key}</Text>
            </div>
          })}
        </div>
    },
    {
      title: `More`,
      ref: useRef(null), 
      size: `3fr`, 
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
      size: `3fr`, 
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

  const gridColumns: string = `100px 1fr`;
  
  return (
    <ManagerPage<collectionType>
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_RUBIK_COLOR_SET}
      collection={rubikColorSet}
      setCollection={setRubikColorSet}
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
              value={rubikColorSet.name}
              onInputChange={handleChangeName}
            >
            </TextInput>
          </InputSection>

          <InputSection label={`Color Codes`} gridColumns={gridColumns}>
            <TagsInput 
              isDisable={isModalReadOnly}
              showIndex={true}
              type={EInputType.COLOR}
              addTagButtonText={`New Color`}
              values={rubikColorSetColorsToTags()} 
              onChangeAction={handleChangeColor}
            >
            </TagsInput>
          </InputSection>
        </TabItem>

        <TabItem label={`Timestamp`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={rubikColorSet}>
          </TimestampTabItem>
        </TabItem>
      </Tabs>
    </ManagerPage>
  );
}
