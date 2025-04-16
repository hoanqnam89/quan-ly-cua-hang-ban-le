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

export interface ICollectionIdNotify {
  id: string
  isClicked: boolean
}

export interface IManagerPageProps<T> {
  children: ReactElement
  columns: Array<IColumnProps<T>>
  collectionName: ECollectionNames
  defaultCollection: T
  collection: T
  setCollection: Dispatch<SetStateAction<T>>
  isModalReadonly: boolean,
  setIsModalReadonly: Dispatch<SetStateAction<boolean>>
  isClickShowMore: ICollectionIdNotify
  isClickDelete: ICollectionIdNotify
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
}

export default function ManagerPage<T extends { _id: string, index?: number }>({
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
  name = translateCollectionName(collectionName),
  currentPage: externalCurrentPage,
  setCurrentPage: externalSetCurrentPage,
  totalItems,
  displayedItems,
  setAllItems,
  additionalButtons,
  additionalProcessing,
}: Readonly<IManagerPageProps<T>>): ReactElement {
  const translatedCollectionName: string =
    translateCollectionName(collectionName);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] =
    useState<boolean>(false);
  const [collections, setCollections] = useState<T[]>([]);
  const [isUpdateCollection, setIsUpdateCollection] = useState<boolean>(false);
  const { createNotification, notificationElements } = useNotificationsHook();
  const [allCollections, setAllCollections] = useState<T[]>([]);
  const itemsPerPage = 10;

  // Internal page state when no external state is provided
  const [internalCurrentPage, setInternalCurrentPage] = useState<number>(1);

  // Use external or internal page state
  const currentPage = externalCurrentPage || internalCurrentPage;
  const setCurrentPage = externalSetCurrentPage || setInternalCurrentPage;

  const getCollections: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      setIsLoading(true);
      let fetchedCollections = await fetchGetCollections<T>(collectionName);

      // Áp dụng xử lý bổ sung nếu có
      if (additionalProcessing) {
        fetchedCollections = additionalProcessing(fetchedCollections);
      }

      setAllCollections(fetchedCollections);

      if (setAllItems) {
        setAllItems(fetchedCollections);
      }

      if (displayedItems) {
        setCollections(displayedItems);
      } else {
        const startIndex = (currentPage - 1) * itemsPerPage;
        setCollections(fetchedCollections.slice(startIndex, startIndex + itemsPerPage));
      }

      setIsLoading(false);
    },
    [collectionName, setAllItems, displayedItems, currentPage, itemsPerPage, additionalProcessing],
  );

  // Update collections when page changes
  useEffect(() => {
    if (allCollections.length > 0 && !displayedItems) {
      const startIndex = (currentPage - 1) * itemsPerPage;

      // Áp dụng xử lý bổ sung mỗi khi hiển thị dữ liệu mới
      let filteredCollections = allCollections;

      setCollections(filteredCollections.slice(startIndex, startIndex + itemsPerPage));
    }
  }, [currentPage, allCollections, displayedItems, itemsPerPage]);

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
      setIsAddCollectionModalOpen((prev: boolean): boolean => handleOpenModal(prev));
    },
    [
      setIsModalReadonly,
    ],
  );

  const handleAddCollection = async (): Promise<void> => {
    setIsLoading(true);

    const addCollectionApiResponse: Response =
      await addCollection<T>(collection, collectionName);

    let notificationText: string = ``;
    let notificationType: ENotificationType = ENotificationType.ERROR;

    switch (addCollectionApiResponse.status) {
      case EStatusCode.OK:
        notificationText = `Tạo ${translatedCollectionName} thành công!`;
        notificationType = ENotificationType.SUCCESS;
        break;
      case EStatusCode.CREATED:
        notificationText = `Tạo ${translatedCollectionName} thành công!`;
        notificationType = ENotificationType.SUCCESS;
        break;
      case EStatusCode.UNPROCESSABLE_ENTITY:
        notificationText = `Tạo ${translatedCollectionName} thất bại! Không thể đọc được ${translatedCollectionName} đầu vào.`;
        break;
      case EStatusCode.CONFLICT:
        notificationText = `Tạo ${translatedCollectionName} thất bại! ${translatedCollectionName} đã tồn tại.`;
        break;
      case EStatusCode.METHOD_NOT_ALLOWED:
        notificationText = `Tạo ${translatedCollectionName} thất bại! Phương thức không cho phép.`;
        break;
      case EStatusCode.INTERNAL_SERVER_ERROR:
        notificationText = `Tạo ${translatedCollectionName} thất bại! Server bị lỗi.`;
        break;
      default:
        notificationText = `Tạo ${translatedCollectionName} thất bại! Lỗi không xác định.`;
    }

    createNotification({
      id: 0,
      children: <Text>{notificationText}</Text>,
      type: notificationType,
      isAutoClose: true,
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
      children: <Text>{notificationText}</Text>,
      type: notificationType,
      isAutoClose: true,
    });

    await getCollections();
    setIsUpdateCollection(false);
  }

  const handleDeleteCollection = async (): Promise<void> => {
    if (collections.length === 0) {
      createNotification({
        id: 0,
        children: <Text>Không có {translatedCollectionName} để xóa!</Text>,
        type: ENotificationType.ERROR,
        isAutoClose: true,
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
      children: <Text>{notificationText}</Text>,
      type: notificationType,
      isAutoClose: true,
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
        children: <Text>{notificationText}</Text>,
        type: notificationType,
        isAutoClose: true,
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
  const totalPagesCount = Math.ceil((totalItems || allCollections.length) / itemsPerPage);

  const managerPage: ReactElement = isLoading
    ? <LoadingScreen></LoadingScreen>
    : <>
      <title>{`Quản lý ${name}`}</title>

      <div className="flex gap-2 mb-4">
        {additionalButtons}
      </div>

      <Table<T>
        name={translatedCollectionName}
        isGetDatasDone={isLoading}
        datas={tableData}
        columns={columns}
        onClickAdd={toggleAddCollectionModal}
        onClickDelete={handleDeleteCollection}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalItems={totalItems || allCollections.length}
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
    </>

  return managerPage;
}
