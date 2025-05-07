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
  currentPage?: number,
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>,
  itemsPerPage?: number,
  totalItems?: number
}

export default function Table<T extends { _id: string, index?: number }>({
  name = ``,
  isGetDatasDone = true,
  onClickAdd = () => { },
  onClickDelete = () => { },
  columns = [],
  datas = [],
  columnMinWidth = 20,
  canDeleteCollection = false,
  canCreateCollection = true,
  currentPage = 1,
  setCurrentPage,
  itemsPerPage = 10,
  totalItems = datas.length
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
  const [columnWidths, setColumnWidths] = useState<number[]>(columns.map(() => 150));
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });
  const [isResizing, setIsResizing] = useState<{ colIdx: number, startX: number, startWidth: number } | null>(null);

  const gridStyle: CSSProperties = {
    gridTemplateColumns: gridColumns.join(` `),
  }

  useEffect((): void => {
    setIsVisibles(new Array(datas.length).fill(true));
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
    if (e.detail === 2)
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
          if (!column.ref.current)
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

      if (!key || newIsClicks[index] === ESortStatus.UNSORT)
        return 0;

      if (a[key] < b[key])
        return newIsClicks[index] === ESortStatus.ASCENDING ? -1 : 1;

      if (a[key] > b[key])
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
    console.log('order-form', datas)

    const regex: RegExp = new RegExp(`${searchKeyword}`, `i`,);

    const newDatas: boolean[] = datas.map((data: T): boolean => {

      let isVisible: boolean = false;
      const dataString: string = JSON.stringify(data);

      if (regex.test(dataString))
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
          className={`h-full flex items-center gap-0 select-none relative justify-center text-center`}
        >
          <Text
            isEllipsis={true}
            weight={600}
            onClick={(): void => sortHeader(columnIndex, column.key)}
            tooltip={`Click to sort ${column.title}`}
            className={`${column.key && `cursor-pointer`} py-2 pl-1 pr-4 w-full text-center`}
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
            className={`${activeIndex === columnIndex && styles.active
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

  const sortedDatas = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return [...datas];
    const sorted = [...datas].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      if (aValue == null || bValue == null) return 0;
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [datas, sortConfig]);

  const handleResizeMouseDown = (e: React.MouseEvent, colIdx: number) => {
    setIsResizing({ colIdx, startX: e.clientX, startWidth: columnWidths[colIdx] });
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const delta = e.clientX - isResizing.startX;
      setColumnWidths(widths => widths.map((w, idx) => idx === isResizing.colIdx ? Math.max(60, isResizing.startWidth + delta) : w));
    };
    const handleMouseUp = () => setIsResizing(null);
    window.addEventListener('mousemove', handleMouseMove as EventListener);
    window.addEventListener('mouseup', handleMouseUp as EventListener);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as EventListener);
      window.removeEventListener('mouseup', handleMouseUp as EventListener);
    };
  }, [isResizing]);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedDatas = React.useMemo(() => {
    if (!sortedDatas.length) return [];
    const start = ((currentPage || 1) - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedDatas.slice(start, end);
  }, [sortedDatas, currentPage, itemsPerPage]);

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 border-collapse">
        <thead className="bg-blue-50">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={column.title}
                className={`border border-gray-300 px-4 py-2 text-center relative select-none items-center justify-center ${column.key === 'index' || column.title === '#' ? 'w-[50px] min-w-[50px]' : ''}`}
                style={{ minWidth: column.key === 'index' || column.title === '#' ? 50 : columnWidths[idx], width: column.key === 'index' || column.title === '#' ? 50 : columnWidths[idx] }}
                onClick={() => {
                  if (column.key) {
                    setSortConfig(cfg => {
                      if (cfg.key === column.key) {
                        if (cfg.direction === 'asc') return { key: column.key as string, direction: 'desc' };
                        if (cfg.direction === 'desc') return { key: '', direction: null };
                        return { key: column.key as string, direction: 'asc' };
                      }
                      return { key: column.key as string, direction: 'asc' };
                    });
                  }
                }}
              >
                <div className="flex items-center justify-center gap-1 w-full h-full text-center">
                  {column.title}
                  {sortConfig.key === column.key && sortConfig.direction === 'asc' && (
                    <IconContainer iconLink={arrowUpNarrowWideIcon} size={16} />
                  )}
                  {sortConfig.key === column.key && sortConfig.direction === 'desc' && (
                    <IconContainer iconLink={arrowDownWideNarrowIcon} size={16} />
                  )}
                </div>
                <div
                  onMouseDown={e => handleResizeMouseDown(e, idx)}
                  className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-10"
                  style={{ userSelect: 'none' }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedDatas.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">Không có dữ liệu</td>
            </tr>
          ) : (
            paginatedDatas.map((row, rowIndex) => isVisibles[rowIndex]? (
              <tr key={row._id} className="hover:bg-blue-50 transition">
                {columns.map((column, colIdx) => {
                  let cellContent: React.ReactNode = null;
                  if (column.render) {
                    cellContent = column.render(row, column.key?.toString() || '', column);
                  } else if (column.key === 'index' || column.title === '#') {
                    const sequentialIndex = ((currentPage - 1) * itemsPerPage) + rowIndex + 1;
                    cellContent = sequentialIndex;
                  } else {
                    cellContent = row[column.key as keyof typeof row] as string;
                  }
                  return (
                    <td
                      key={column.title + '-' + rowIndex}
                      className={`border border-gray-300 px-4 py-2 text-center items-center justify-center ${column.key === 'index' || column.title === '#' ? 'w-[50px] min-w-[50px]' : ''}`}
                      style={{ minWidth: column.key === 'index' || column.title === '#' ? 50 : columnWidths[colIdx], width: column.key === 'index' || column.title === '#' ? 50 : columnWidths[colIdx], verticalAlign: 'middle' }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-center">
                        {cellContent}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ):<Fragment key={rowIndex}></Fragment>)
          )}
        </tbody>
      </table>
    </div>
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      if (setCurrentPage) {
        setCurrentPage(newPage);
      } else {
        // Handle page change internally
        const event = new CustomEvent('tablePageChange', { detail: { page: newPage } });
        window.dispatchEvent(event);
      }
    }
  };

  const renderPagination = () => {
    const maxVisiblePages = 5;
    const totalPageCount = totalPages;

    let startPage = 1;
    let endPage = Math.min(totalPageCount, maxVisiblePages);

    if (currentPage > 3 && totalPageCount > maxVisiblePages) {
      startPage = Math.min(currentPage - 2, totalPageCount - maxVisiblePages + 1);
      endPage = Math.min(startPage + maxVisiblePages - 1, totalPageCount);
    }

    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
      <div className="flex justify-center mt-4">
        <div className="inline-flex border border-gray-200 rounded-md">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-gray-500 border-r border-gray-200 disabled:opacity-50"
          >Đầu</button>
          {/* <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-gray-500 border-r border-gray-200 disabled:opacity-50"
          >Trước</button> */}
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 ${currentPage === page
                ? 'text-blue-600 bg-blue-50 font-medium'
                : 'text-gray-500 hover:bg-gray-50'
                } border-r border-gray-200`}
            >{page}</button>
          ))}
          {/* <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPageCount}
            className="px-4 py-2 text-gray-500 border-r border-gray-200 disabled:opacity-50"
          >Sau</button> */}
          <button
            onClick={() => handlePageChange(totalPageCount)}
            disabled={currentPage === totalPageCount}
            className="px-4 py-2 text-gray-500 disabled:opacity-50"
          >Cuối</button>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col gap-4 p-3`}>
      <div className={`flex gap-10 items-center`}>
        <Text size={24} weight={600}>
          Danh sách {name}
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

      <div className={`flex flex-col   justify-between overflow-y-scroll no-scrollbar`}>
        {isGetDatasDone
          ? <LoadingIcon></LoadingIcon>
          : renderTable()
        }
      </div>

      {renderPagination()}
    </div>
  )
}