'use client';

import React, { Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { IColumnProps } from '@/components/table/interfaces/column-props.interface';
import Table from '@/components/table/table';
import { ECollectionNames, EStatusCode } from '@/enums';
import { deleteCollections, deleteCollectionById, addCollection, getCollectionById, updateCollectionById } from '@/services/api-service';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { LoadingScreen, Text } from '@/components';
import CollectionForm from './collection-form/collection-form';
import useNotificationsHook from '@/hooks/notifications-hook';
import { ENotificationType } from '../notify/notification/notification';
import { translateCollectionName } from '@/utils/translate-collection-name';
import CheckIcon from '@/public/icons/check.svg';
import XCircleIcon from '@/public/icons/x-circle.svg';

export interface ICollectionIdNotify {
  id: string
  isClicked: boolean
}

export interface IManagerPageProps<T extends { _id: string }> {
  children: ReactElement
  columns: Array<IColumnProps<any>>
  collectionName: ECollectionNames
  defaultCollection: T
  collection: T
  setCollection: Dispatch<SetStateAction<any>>
  isModalReadonly: boolean,
  setIsModalReadonly: Dispatch<SetStateAction<boolean>>
  isClickShowMore: ICollectionIdNotify
  setIsClickShowMore?: Dispatch<SetStateAction<ICollectionIdNotify>>
  isClickDelete: ICollectionIdNotify
  setIsClickDelete?: Dispatch<SetStateAction<ICollectionIdNotify>>
  isLoaded?: boolean
  handleOpenModal?: (isOpen: boolean) => boolean
  onExitModalForm?: () => void
  name?: string
  currentPage?: number
  setCurrentPage?: Dispatch<SetStateAction<number>>
  totalItems?: number
  displayedItems?: T[]
  setAllItems?: Dispatch<SetStateAction<T[]>>
  additionalButtons?: ReactElement
  additionalProcessing?: (items: T[]) => T[]
  dateFilter?: string
  renderFilters?: () => ReactElement
  customHandleAddCollection?: () => Promise<void>
  pageCollection?: ECollectionNames
  itemModalOpening?: boolean
  setItemModalOpening?: (isOpen: boolean) => boolean
  additionalFiltersRender?: () => ReactElement
  gridColumns?: string
  itemForm?: ReactElement
  handleFetchData?: () => Promise<T[]>
}

// Hàm trả về thông báo lỗi động theo collectionName
function getErrorMessage(collectionName: ECollectionNames) {
  switch (collectionName) {
    case ECollectionNames.ORDER_FORM:
      return 'Không thể tạo phiếu đặt hàng.';
    case ECollectionNames.PRODUCT:
      return 'Không thể tạo sản phẩm.';
    case ECollectionNames.USER:
      return 'Không thể tạo khách hàng.';
    case ECollectionNames.WAREHOUSE_RECEIPT:
      return 'Không thể tạo phiếu nhập kho.';
    case ECollectionNames.BUSINESS:
      return 'Không thể tạo cửa hàng.';
    case ECollectionNames.UNIT:
      return 'Không thể tạo đơn vị tính.';
    case ECollectionNames.PRODUCT_DETAIL:
      return 'Không thể tạo chi tiết kho.';
    case ECollectionNames.ACCOUNT:
      return 'Không thể tạo tài khoản.';
    // Thêm các trường hợp khác nếu cần
    default:
      return 'Không thể thực hiện thao tác.';
  }
}

// Hàm trả về thông báo thành công động theo collectionName
function getSuccessMessage(collectionName: ECollectionNames) {
  switch (collectionName) {
    case ECollectionNames.ORDER_FORM:
      return 'Tạo Phiếu đặt hàng thành công!';
    case ECollectionNames.PRODUCT:
      return 'Tạo sản phẩm thành công!';
    case ECollectionNames.USER:
      return 'Tạo khách hàng thành công!';
    case ECollectionNames.WAREHOUSE_RECEIPT:
      return 'Tạo phiếu nhập kho thành công!';
    case ECollectionNames.BUSINESS:
      return 'Tạo nhà cung cấp thành công!';
    case ECollectionNames.UNIT:
      return 'Tạo đơn vị tính thành công!';
    case ECollectionNames.PRODUCT_DETAIL:
      return 'Tạo chi tiết kho thành công!';
    case ECollectionNames.ACCOUNT:
      return 'Tạo tài khoản thành công!';

    // Thêm các trường hợp khác nếu cần
    default:
      return 'Tạo thành công!';
  }
}

export default function ManagerPage<T extends { _id: string }>({
  children,
  columns,
  collectionName,
  defaultCollection,
  collection,
  setCollection,
  isModalReadonly,
  setIsModalReadonly,
  isClickShowMore,
  isClickDelete,
  isLoaded = false,
  handleOpenModal = (isOpen: boolean): boolean => !isOpen,
  onExitModalForm = () => { },
  currentPage: externalCurrentPage,
  setCurrentPage: externalSetCurrentPage,
  totalItems,
  displayedItems,
  setAllItems,
  additionalProcessing,
  renderFilters,
  customHandleAddCollection,
}: Readonly<IManagerPageProps<T>>): ReactElement {
  const translatedCollectionName: string =
    translateCollectionName(collectionName);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] =
    useState<boolean>(false);
  const [collections, setCollections] = useState<T[]>([]);
  const [isUpdateCollection, setIsUpdateCollection] = useState<boolean>(false);
  const { createNotification, notificationElements } = useNotificationsHook();

  const currentPage = externalCurrentPage || 1;
  const setCurrentPage = externalSetCurrentPage || (page => page);

  const getCollections: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      setIsLoading(true);
      try {
        let fetchedCollections = await fetchGetCollections<T>(collectionName);

        if (additionalProcessing) {
          fetchedCollections = additionalProcessing(fetchedCollections);
        }

        setCollections(fetchedCollections);
        if (setAllItems) setAllItems(fetchedCollections);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName, setAllItems, additionalProcessing],
  );

  useEffect(() => {
    if (!isAddCollectionModalOpen)
      onExitModalForm()
  }, [isAddCollectionModalOpen, onExitModalForm])

  useEffect((): void => {
    getCollections();
  }, [getCollections]);

  const toggleAddCollectionModal = useCallback(
    (isReadOnly: boolean = false): void => {
      setIsModalReadonly(!isReadOnly);
      if (isReadOnly)
        setCollection({ ...defaultCollection })
      setIsAddCollectionModalOpen((prev: boolean): boolean => handleOpenModal(prev));
    },
    [
      setIsModalReadonly,
    ],
  );

  const handleAddCollection = async (): Promise<void> => {
    if (customHandleAddCollection) {
      await customHandleAddCollection();
      return;
    }

    setIsLoading(true);

    const addCollectionApiResponse: Response =
      await addCollection<T>(collection, collectionName);

    let notificationType: ENotificationType = ENotificationType.ERROR;
    let notificationContent: string = '';

    if (addCollectionApiResponse.status === EStatusCode.OK || addCollectionApiResponse.status === EStatusCode.CREATED) {
      notificationType = ENotificationType.SUCCESS;
      notificationContent = getSuccessMessage(collectionName);
    } else {
      // Lấy nội dung lỗi từ API nếu có
      let errorText = getErrorMessage(collectionName);
      try {
        const errorData = await addCollectionApiResponse.json();
        if (errorData && errorData.message) {
          errorText += ' ' + errorData.message;
        }
      } catch { }
      notificationContent = errorText;
    }

    createNotification({
      id: 0,
      children: notificationContent,
      type: notificationType,
      isAutoClose: true,
      title: notificationType === ENotificationType.SUCCESS
        ? 'Thành công'
        : notificationType === ENotificationType.ERROR
          ? 'Lỗi'
          : notificationType === ENotificationType.WARNING
            ? 'Cảnh báo'
            : 'Thông tin',
    });

    await getCollections();
  }

  const handleClickUpdateCollection = (): void => {
    setIsUpdateCollection(true);
    setIsModalReadonly(false);
  }

  const handleUpdateCollection = async (): Promise<void> => {
    setIsLoading(true);

    const updateCollectionApiResponse: Response =
      await updateCollectionById<T>(collection, collection._id, collectionName);

    let notificationText: string = ``;
    let notificationType: ENotificationType = ENotificationType.ERROR;

    switch (updateCollectionApiResponse.status) {
      case EStatusCode.OK:
        notificationText = `Cập nhật ${translatedCollectionName} thành công!`;
        notificationType = ENotificationType.SUCCESS;
        break;
      case EStatusCode.CREATED:
        notificationText = `Cập nhật ${translatedCollectionName} thành công!`;
        notificationType = ENotificationType.SUCCESS;
        break;
      case EStatusCode.CONFLICT:
        notificationText = `Cập nhật ${translatedCollectionName} thất bại! ${translatedCollectionName} đã tồn tại.`;
        break;
      case EStatusCode.UNPROCESSABLE_ENTITY:
        notificationText = `Cập nhật ${translatedCollectionName} thất bại! Không thể đọc được ${translatedCollectionName} đầu vào.`;
        break;
      case EStatusCode.INTERNAL_SERVER_ERROR:
        notificationText = `Cập nhật ${translatedCollectionName} thất bại! Server bị lỗi.`;
        break;
      default:
        notificationText = `Cập nhật ${translatedCollectionName} thất bại! Lỗi không xác định.`;
    }

    createNotification({
      id: 0,
      children: notificationText,
      type: notificationType,
      isAutoClose: true,
      title: notificationType === ENotificationType.SUCCESS
        ? 'Thành công'
        : notificationType === ENotificationType.ERROR
          ? 'Lỗi'
          : notificationType === ENotificationType.WARNING
            ? 'Cảnh báo'
            : 'Thông tin',
    });

    await getCollections();
    setIsUpdateCollection(false);
  }

  const handleDeleteCollection = async (): Promise<void> => {
    if (collections.length === 0) {
      createNotification({
        id: 0,
        children: `Không có ${translatedCollectionName} để xóa!`,
        type: ENotificationType.ERROR,
        isAutoClose: true,
        title: 'Lỗi',
      });
      return;
    }

    if (!confirm(`Bạn có muốn xóa TẤT CẢ ${translatedCollectionName}?`))
      return;

    setIsLoading(true);

    const deleteCollectionApiResponse: Response =
      await deleteCollections(collectionName);

    let notificationText: string = ``;
    let notificationType: ENotificationType = ENotificationType.ERROR;

    switch (deleteCollectionApiResponse.status) {
      case EStatusCode.OK:
        notificationText = `Xóa ${translatedCollectionName} thành công!`;
        notificationType = ENotificationType.SUCCESS;
        break;
      case EStatusCode.CREATED:
        notificationText = `Xóa ${translatedCollectionName} thành công!`;
        notificationType = ENotificationType.SUCCESS;
        break;
      case EStatusCode.INTERNAL_SERVER_ERROR:
        notificationText = `Xóa ${translatedCollectionName} thất bại! Server bị lỗi.`;
        break;
      default:
        notificationText = `Xóa ${translatedCollectionName} thất bại! Lỗi không xác định.`;
    }

    createNotification({
      id: 0,
      children: notificationText,
      type: notificationType,
      isAutoClose: true,
      title: notificationType === ENotificationType.SUCCESS
        ? 'Thành công'
        : notificationType === ENotificationType.ERROR
          ? 'Lỗi'
          : notificationType === ENotificationType.WARNING
            ? 'Cảnh báo'
            : 'Thông tin',
    });

    await getCollections();
  }

  const handleShowMore: (collectionId: string) => Promise<void> = useCallback(
    async (collectionId: string): Promise<void> => {
      setIsLoading(true);

      const getCollectionByIdApiResponse: Response =
        await getCollectionById(collectionId, collectionName);

      if (!getCollectionByIdApiResponse.ok)
        return;

      const getCollectionByIdApiJson: T =
        await getCollectionByIdApiResponse.json();

      setCollection({ ...getCollectionByIdApiJson });
      toggleAddCollectionModal(false);

      setIsLoading(false);
    },
    [collectionName, toggleAddCollectionModal, setCollection],
  );

  const handleDeleteCollectionById: (
    collectionId: string
  ) => Promise<void> = useCallback(
    async (collectionId: string): Promise<void> => {
      if (!confirm(`Bạn có muốn xóa ${translatedCollectionName} này?`))
        return;

      setIsLoading(true);

      const deleteCollectionByIdApiResponse: Response =
        await deleteCollectionById(collectionId, collectionName);

      let notificationText: string = ``;
      let notificationType: ENotificationType = ENotificationType.ERROR;

      switch (deleteCollectionByIdApiResponse.status) {
        case EStatusCode.OK:
          notificationText = `Xóa ${translatedCollectionName} có mã ${collectionId} thành công!`;
          notificationType = ENotificationType.SUCCESS;
          break;
        case EStatusCode.CREATED:
          notificationText = `Xóa ${translatedCollectionName} có mã ${collectionId} thành công!`;
          notificationType = ENotificationType.SUCCESS;
          break;
        case EStatusCode.INTERNAL_SERVER_ERROR:
          notificationText = `Xóa ${translatedCollectionName} có mã ${collectionId} thất bại! Server bị lỗi.`;
          break;
        default:
          notificationText = `Xóa ${translatedCollectionName} có mã ${collectionId} thất bại! Lỗi không xác định.`;
      }

      createNotification({
        id: 0,
        children: notificationText,
        type: notificationType,
        isAutoClose: true,
        title: notificationType === ENotificationType.SUCCESS
          ? 'Thành công'
          : notificationType === ENotificationType.ERROR
            ? 'Lỗi'
            : notificationType === ENotificationType.WARNING
              ? 'Cảnh báo'
              : 'Thông tin',
      });

      await getCollections();
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [collectionName, getCollections],
  );

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current && isClickShowMore.isClicked)
      handleShowMore(isClickShowMore.id);
    else
      mounted.current = true;
  }, [handleShowMore, isClickShowMore]);

  useEffect(() => {
    if (isClickDelete.isClicked) {
      handleDeleteCollectionById(isClickDelete.id);
    }
  }, [handleDeleteCollectionById, isClickDelete]);

  const tableData = displayedItems || collections;


  const managerPage: ReactElement = isLoading
    ? <LoadingScreen></LoadingScreen>
    : <>
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm`}>
        {/* Render filters nếu có */}
        {renderFilters && (
          <div className="px-6 py-3 border-b border-gray-100">
            {renderFilters()}
          </div>
        )}

        <Table<T>
          name={translatedCollectionName}
          isGetDatasDone={isLoading}
          datas={tableData}
          columns={columns}
          onClickAdd={toggleAddCollectionModal}
          onClickDelete={handleDeleteCollection}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={totalItems ?? collections.length}
        />

        <CollectionForm<T>
          collection={collection}
          collectionName={collectionName}
          isModalOpen={isAddCollectionModalOpen}
          setIsModalOpen={setIsAddCollectionModalOpen}
          okAction={isModalReadonly
            ? handleClickUpdateCollection
            : isUpdateCollection
              ? handleUpdateCollection
              : handleAddCollection
          }
          isReadOnly={isModalReadonly}
          isUpdateCollection={isUpdateCollection}
          isLoading={isLoading || isLoaded}
        >
          {children}
        </CollectionForm>

        {notificationElements}
      </div>
    </>

  return managerPage;
}
