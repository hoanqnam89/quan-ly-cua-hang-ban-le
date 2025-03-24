import React, { ChangeEvent, CSSProperties, Fragment, MouseEvent, ReactElement, useCallback, useEffect, useState } from 'react';
import { Button, Text, IconContainer, LoadingIcon, TextInput } from '@/components';
import { IColumnProps } from './interfaces/column-props.interface';
import { arrowDownWideNarrowIcon, arrowUpNarrowWideIcon, columns4Icon, emptyIcon, listCollapseIcon, listRestartIcon, plusIcon, trashIcon } from '@/public';
import { ESortStatus } from '@/enums/sort-status.enum';
import { enumToArray } from '@/utils/enum-to-array';
import { countVisibleElements } from '@/utils/count-visible-elements';
import Checkboxes, { ICheckbox } from '../checkboxes/checkboxes';
import styles from './style.module.css';

interface IHeaderButtons {
  className: string
  onClick: () => void
  iconLink: string
  size: number
  tooltip: string
}

interface ITableProps<T> {
  name?: string, 
  isGetDatasDone?: boolean, 
  onClickAdd?: () => void, 
  onClickDelete?: () => void, 
  columns: Array<IColumnProps<T>>, 
  datas: T[], 
  columnMinWidth?: number, 
  canDeleteCollection?: boolean
  canCreateCollection?: boolean
}

export default function Table<T extends {_id: string, index?: number}>({
  name = ``, 
  isGetDatasDone = true, 
  onClickAdd = () => {}, 
  onClickDelete = () => {}, 
  columns = [], 
  datas = [], 
  columnMinWidth = 20, 
  canDeleteCollection = false, 
  canCreateCollection = true, 
}: Readonly<ITableProps<T>>): ReactElement {
  const [isShowToggleColumns, setIsShowToggleColumns] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>(``);
  const [isClicks, setIsClicks] = useState<ESortStatus[]>(
    new Array(columns.length).fill(ESortStatus.UNSORT)
  );
  const [isVisibles, setIsVisibles] = useState<boolean[]>(
    new Array(datas.length).fill(true)
  );
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [gridColumns, setGridColumns] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<ICheckbox[]>([
    ...columns.map((column: IColumnProps<T>): ICheckbox => ({
      label: column.title, 
      value: column.title, 
      isChecked: column.isVisible === undefined || column.isVisible === true ?
        true : false, 
    }))
  ]);
  const [tableDatas, setTableDatas] = useState<T[]>([
    ...datas.map((data: T, index: number): T => ({
      ...data, index
    }))
  ]);
  const [isAllColumnVisible, setIsAllColumnVisible] = useState<boolean>(false);

  const gridStyle: CSSProperties = {
    gridTemplateColumns: gridColumns.join(` `), 
  }

  useEffect((): void => {
    setIsVisibles( new Array(datas.length).fill(true) );
    setGridColumns([...visibleColumns.map((
      visibleColumn: ICheckbox, visibleColumnIndex
    ): string => 
      visibleColumn.isChecked ? columns[visibleColumnIndex].size : ``
    )]);
  }, [datas, columns, visibleColumns]);

  const handleMouseDown = (index: number): void => {
    setActiveIndex(index);
  }

  const handleResetColumn = (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>, index: number, 
  ): void => {
    if ( e.detail === 2 )
      setGridColumns([...columns.map(
        (column: IColumnProps<T>, columnIndex: number): string => {
          if (columnIndex === index)
            return column.size;

          return gridColumns[columnIndex];
        }
      )]);
  }

  const handleResetColumns = (): void => {
    setGridColumns([...columns.map((column: IColumnProps<T>): string => 
      column.size
    )]);
  }

  const isAllTableColumnInvisible = (): boolean => visibleColumns.every(
    (visibleColumn: ICheckbox): boolean => 
      !visibleColumn.isChecked
    );

  const handleShowAllTableColumns = (): void => {
    setVisibleColumns([
      ...visibleColumns.map((visibleColumn: ICheckbox): ICheckbox => ({
        ...visibleColumn, 
        isChecked: isAllColumnVisible, 
      }))
    ]);
    setIsAllColumnVisible((prev: boolean): boolean => !prev);
  }

  const handleMouseMove: (this: Window, e: globalThis.MouseEvent) => void = 
    useCallback((e: globalThis.MouseEvent): void => {
      setGridColumns([...
        columns.map((column: IColumnProps<T>, columnIndex: number): string => {
          if ( !column.ref.current )
            return ``;

          if (columnIndex === activeIndex) {
            const width = e.clientX - column.ref.current.offsetLeft;

            if (width >= columnMinWidth) 
              return `${width}px`;
          }

          return `${column.ref.current.offsetWidth}px`;
        }
      )]);
    }, [activeIndex, columns, columnMinWidth]);

  const removeListeners: () => void = useCallback((): void => {
    removeEventListener('mousemove', handleMouseMove);
    removeEventListener('mouseup', removeListeners);
  }, [handleMouseMove]);

  const handleMouseUp: () => void = useCallback((): void => {
    setActiveIndex(-1);
    removeListeners();
  }, [setActiveIndex, removeListeners]);

  useEffect((): () => void => {
    if (activeIndex !== -1) {
      addEventListener(`mousemove`, handleMouseMove);
      addEventListener(`mouseup`, handleMouseUp);
    }
  
    return (): void => {
      removeListeners();
    }
  }, [activeIndex, handleMouseMove, handleMouseUp, removeListeners])

  const sortHeader = (index: number, key?: keyof T): void => {
    setTableDatas([...tableDatas.sort((a: T, b: T): number => {
      const newIsClicks: ESortStatus[] = [...isClicks];
      newIsClicks[index] = 
        (newIsClicks[index] + 1) % (enumToArray(ESortStatus).length / 2);

      setIsClicks(newIsClicks);

      if ( !key || newIsClicks[index] === ESortStatus.UNSORT )
        return 0;

      if ( a[key] < b[key] )
        return newIsClicks[index] === ESortStatus.ASCENDING ? -1 : 1;

      if ( a[key] > b[key] )
        return newIsClicks[index] === ESortStatus.ASCENDING ? 1 : -1;

      return 0;
    })]);

    handleSearch(searchValue);
  }

  const getIconBaseOnSortStatus = (sortStatus: ESortStatus): string => {
    switch (sortStatus) {
      case ESortStatus.ASCENDING:
        return arrowUpNarrowWideIcon;
      case ESortStatus.DESCENDING:
        return arrowDownWideNarrowIcon;
      default:
        return emptyIcon;
    }
  }

  const handleSearch = (searchKeyword: string): void => {
    setSearchValue(searchKeyword);

    const regex: RegExp = new RegExp(`${searchKeyword}`, ``);

    const newDatas: boolean[] = tableDatas.map((data: T): boolean => {
      let isVisible: boolean = false;

      const dataString: string = JSON.stringify(data);

      if ( regex.test(dataString) ) 
        isVisible = true;

      return isVisible;
    });

    setIsVisibles([...newDatas]);
  }

  const headerElements: ReactElement[] = columns.map(
    (column: IColumnProps<T>, columnIndex: number): ReactElement => {
      return visibleColumns[columnIndex].isChecked ?
        <div 
          ref={column.ref}
          key={`header-${column.title}`} 
          className={`h-full flex items-center gap-0 select-none relative`}
        >
          <Text 
            isEllipsis={true} 
            weight={600}
            onClick={(): void => sortHeader(columnIndex, column.key)} 
            tooltip={`Click to sort ${column.title}`}
            className={`${column.key && `cursor-pointer`}`}
          >
            {column.title}
          </Text>

          {column.key && 
            <IconContainer iconLink={
              getIconBaseOnSortStatus(isClicks[columnIndex])
            }>
            </IconContainer>
          }

          <div
            onMouseDown={(): void => handleMouseDown(columnIndex)}
            className={`${ 
              activeIndex === columnIndex && styles.active
            } ${styles[`resize-handle`]} h-full block ml-auto cursor-col-resize border-white`}
            title={`Click and drag to resize '${column.title}' column\nDouble click to reset this '${column.title}' column size`}
            onClick={
              (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>): void => 
                handleResetColumn(e, columnIndex)
            }
          >
          </div>
        </div> :
        <Fragment key={`${column.title}`}></Fragment>
    }
  );

  const rowElements: ReactElement = datas.length === 0 ? (
    <div className={`flex justify-center items-center p-1`}>
      <Text isItalic={true}>Không có dữ liệu</Text>
    </div>
  ) : isAllTableColumnInvisible() ? 
    <></> : (
    <>
      {tableDatas.map(
        (row: T, rowIndex: number): ReactElement => isVisibles[rowIndex] ? 
          <div
            key={`${row._id}`}
            className={`grid justify-between items-center gap-0 p-1 pt-2 border-t-2 border-t-solid ${styles.row}`}
            style={gridStyle}
          >
            {columns.map((
              column: IColumnProps<T>, columnIndex: number
            ): ReactElement => {
              const key: string = `${row._id}-${column.title}`;

              if ( !visibleColumns[columnIndex].isChecked )
                return <Fragment key={key}></Fragment>

              if ( column.render ) 
                return <Fragment key={key}>
                  {column.render(row, key, column)}
                </Fragment>
              
              const rowData: string = 
                row[column.key as keyof typeof row] as string;
              
              return <Text 
                key={key} 
                isCopyable={true} 
                isEllipsis={true} 
                tooltip={rowData}
              >
                {rowData}
              </Text>
            })}
          </div> : 
          <Fragment key={`${row._id}`}>
          </Fragment>
      )}
    </>
  );

  const handleShowToggleColumns = (): void => {
    setIsShowToggleColumns(!isShowToggleColumns);
  }

  const headerButtons: IHeaderButtons[] = [
    {
      className: ``, 
      onClick: handleResetColumns, 
      iconLink: listRestartIcon, 
      size: 32, 
      tooltip: `Khôi phục toàn bộ chiều dài cột`, 
    }, 
    {
      className: ``, 
      onClick: handleShowToggleColumns, 
      iconLink: listCollapseIcon, 
      size: 32, 
      tooltip: `Hiển thị hiện/ẩn các cột`, 
    }, 
    ...canDeleteCollection ? [{
      className: ``, 
      onClick: onClickDelete, 
      iconLink: trashIcon, 
      size: 32, 
      tooltip: `Xóa tất cả ${name}s`, 
    }] : [], 
    ...canCreateCollection ? [{
      className: ``, 
      onClick: onClickAdd, 
      iconLink: plusIcon, 
      size: 32, 
      tooltip: `Thêm mới ${name}`, 
    }] : [], 
  ];

  const headerButtonElements: ReactElement[] = headerButtons.map(
    (headerButton: IHeaderButtons, headerButtonIndex: number): ReactElement =>
      <div key={`${headerButtonIndex}`}>
        <Button onClick={headerButton.onClick}>
          <IconContainer 
            iconLink={headerButton.iconLink} 
            size={headerButton.size} 
            tooltip={headerButton.tooltip}
          >
          </IconContainer>
        </Button>
      </div>
  );

  return (
    <div className={`h-full flex flex-col gap-4 p-1`}>
      <div className={`flex gap-2 items-center`}>
        <Text size={24} weight={600}>
          Danh sách {name} ({countVisibleElements(isVisibles)})
        </Text>

        <div className={`flex-1`}>
          <TextInput
            value={searchValue} 
            placeholder={`Tìm kiếm ${name}...`}
            onInputChange={(e: ChangeEvent<HTMLInputElement>): void => 
              handleSearch(e.target.value)
            }
          >
          </TextInput>
        </div>

        {headerButtonElements}
      </div>

      {isShowToggleColumns ? <div className={`flex gap-2 items-center`}>
        <Checkboxes 
          title={`Hiện các cột:`}
          options={visibleColumns}
          setOptions={setVisibleColumns}
        >
        </Checkboxes>

        <div>
          <Button onClick={(): void => handleShowAllTableColumns()}>
            <IconContainer 
              iconLink={columns4Icon} 
              size={24} 
              tooltip={`Bấm để hiện/ẩn toàn bộ cột trong bảng`}
            >
            </IconContainer>
          </Button>
        </div>
      </div> : null}

      <div
        className={`grid items-center justify-between gap-1`}
        style={gridStyle}
      >
        {headerElements}
      </div>

      <div className={`flex flex-col overflow-y-scroll no-scrollbar`}>
        {isGetDatasDone 
          ? <LoadingIcon></LoadingIcon>
          : rowElements
        }
      </div>
    </div>
  )
}
