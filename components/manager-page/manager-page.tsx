'use client';

import React, { Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
// import { notification } from 'antd';
import { IColumnProps } from '@/components/table/interfaces/column-props.interface';
import Table from '@/components/table/table';
import { ECollectionNames, EStatusCode } from '@/enums';
import { deleteCollections, deleteCollectionById, addCollection, getCollectionById, updateCollectionById } from '@/services/api-service';
// import { EAction } from '@/utils/create-api-notification-result';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { LoadingScreen} from '@/components';
import CollectionForm from './collection-form/collection-form';

// const placement = `topRight`;

export interface ICollectionIdNotify {
  id: string
  isClicked: boolean
}

interface IManagerPageProps<T> {
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
  onExitModalForm?: () => void
}

export default function ManagerPage<T extends {_id: string, index?: number}>({
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
  onExitModalForm = () => {}
}: Readonly<IManagerPageProps<T>>): ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = 
    useState<boolean>(false);
  // const [notificationService, contextHolder] = notification.useNotification();
  const [collections, setCollections] = useState<T[]>([]);
  const [isUpdateCollection, setIsUpdateCollection] = useState<boolean>(false);

  const getCollections: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      await fetchGetCollections<T>( collectionName, setCollections );
      setIsLoading(false);
    }, 
    [collectionName],
  );

  useEffect(() => {
    if ( !isAddCollectionModalOpen )
      onExitModalForm()
  }, [isAddCollectionModalOpen, onExitModalForm])
  
  useEffect((): void => {
    getCollections();
  }, [getCollections]);

  const toggleAddCollectionModal = useCallback(
    (isReadOnly: boolean = false): void => {
      if ( isReadOnly ) 
        setCollection(defaultCollection);

      setIsModalReadonly(!isReadOnly);
      setIsAddCollectionModalOpen((prev: boolean): boolean => !prev);
    }, 
    [
      defaultCollection, 
      setIsModalReadonly, 
      setCollection, 
    ],
  );

  const handleAddCollection = async (): Promise<void> => {
    setIsLoading(true);

    const addCollectionApiResponse: Response = 
      await addCollection<T>( collection, collectionName );

    switch (addCollectionApiResponse.status) {
      case EStatusCode.OK:
        // notificationService.success({
        //   message: `${EAction.CREATE} ${collectionName} Successfully!`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.CREATED:
        // notificationService.success({
        //   message: `${EAction.CREATE} ${collectionName} Successfully!`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.UNPROCESSABLE_ENTITY:
        // notificationService.error({
        //   message: `${EAction.CREATE} ${collectionName} Failed! Unprocessable Entity.`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.CONFLICT:
        // notificationService.error({
        //   message: `${EAction.CREATE} ${collectionName} Failed! ${collectionName} already existed.`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.METHOD_NOT_ALLOWED:
        // notificationService.error({
        //   message: `${EAction.CREATE} ${collectionName} Failed! Method not allowed.`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.INTERNAL_SERVER_ERROR:
        // notificationService.error({
        //   message: `${EAction.CREATE} ${collectionName} Failed! Internal Server Error.`,
        //   placement: placement,
        // });
        break;
      default:
        // notificationService.error({
        //   message: `${EAction.CREATE} ${collectionName} Failed! Unknown Error.`,
        //   placement: placement,
        // });
    }

    await getCollections();
  }

  const handleClickUpdateCollection = (): void => {
    setIsUpdateCollection(true);
    setIsModalReadonly(false);
  }

  const handleUpdateCollection = async (): Promise<void> => {
    setIsLoading(true);

    const updateCollectionApiResponse: Response = 
      await updateCollectionById<T>( collection, collection._id, collectionName );

    switch (updateCollectionApiResponse.status) {
      case EStatusCode.OK:
        // notificationService.success({
        //   message: `${EAction.UPDATE} ${collectionName} Successfully!`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.CREATED:
        // notificationService.success({
        //   message: `${EAction.UPDATE} ${collectionName} Successfully!`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.CONFLICT:
        // notificationService.error({
        //   message: `${EAction.UPDATE} ${collectionName} Failed! ${collectionName} already existed.`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.UNPROCESSABLE_ENTITY:
        // notificationService.error({
        //   message: `${EAction.UPDATE} ${collectionName} Failed! Unprocessable Entity.`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.INTERNAL_SERVER_ERROR:
        // notificationService.error({
        //   message: `${EAction.UPDATE} ${collectionName} Failed! Internal Server Error.`,
        //   placement: placement,
        // });
        break;
      default:
        // notificationService.error({
        //   message: `${EAction.UPDATE} ${collectionName} Failed! Unknown Error.`,
        //   placement: placement,
        // });
    }

    await getCollections();
    setIsUpdateCollection(false);
  }

  const handleDeleteCollection = async (): Promise<void> => {
    if ( collections.length === 0 ) {
      // notificationService.error({
      //   message: `There is no ${collectionName} to delete!`,
      //   placement: `topRight`, 
      // });
      return;
    }
    
    if ( !confirm(`Are you sure you want to delete ALL ${collectionName}s?`) )
      return;
    
    setIsLoading(true);

    const deleteCollectionApiResponse: Response = 
      await deleteCollections(collectionName);

    switch (deleteCollectionApiResponse.status) {
      case EStatusCode.OK:
        // notificationService.success({
        //   message: `${EAction.DELETE} ${collectionName} Successfully!`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.CREATED:
        // notificationService.success({
        //   message: `${EAction.DELETE} ${collectionName} Successfully!`,
        //   placement: placement, 
        // });
        break;
      case EStatusCode.INTERNAL_SERVER_ERROR:
        // notificationService.error({
        //   message: `${EAction.DELETE} ${collectionName} Failed! Internal Server Error.`,
        //   placement: placement,
        // });
        break;
      default:
        // notificationService.error({
        //   message: `${EAction.DELETE} ${collectionName} Failed! Unknown Error.`,
        //   placement: placement,
        // });
    }

    await getCollections();
  }

  const handleShowMore: (collectionId: string) => Promise<void> = useCallback(
    async (collectionId: string): Promise<void> => {
      console.log(`Show more`);

      setIsLoading(true);

      const getCollectionByIdApiResponse: Response = 
        await getCollectionById( collectionId, collectionName );

      if ( !getCollectionByIdApiResponse.ok )
        return;

      const getCollectionByIdApiJson: T = 
        await getCollectionByIdApiResponse.json();

      setCollection({...getCollectionByIdApiJson});
      toggleAddCollectionModal(false);
      
      setIsLoading(false);
    }, 
    [collectionName, toggleAddCollectionModal, setCollection],
  );

  const handleDeleteCollectionById: (
    collectionId: string
  ) => Promise<void> = useCallback(
    async (collectionId: string): Promise<void> => {
      if ( !confirm(`Are you sure you want to delete this ${collectionName}?`) )
        return;

      setIsLoading(true);

      const deleteCollectionByIdApiResponse: Response = 
        await deleteCollectionById( collectionId, collectionName );

      switch (deleteCollectionByIdApiResponse.status) {
        case EStatusCode.OK:
          // notificationService.success({
          //   message: `${EAction.DELETE} ${collectionName} Successfully!`,
          //   placement: placement, 
          // });
          break;
        case EStatusCode.CREATED:
          // notificationService.success({
          //   message: `${EAction.DELETE} ${collectionName} Successfully!`,
          //   placement: placement, 
          // });
          break;
        case EStatusCode.INTERNAL_SERVER_ERROR:
          // notificationService.error({
          //   message: `${EAction.DELETE} ${collectionName} Failed! Internal Server Error.`,
          //   placement: placement,
          // });
          break;
        default:
          // notificationService.error({
          //   message: `${EAction.DELETE} ${collectionName} Failed! Unknown Error.`,
          //   placement: placement,
          // });
      }

      await getCollections();
    }, 
    [collectionName, getCollections],
  );

  const mounted = useRef(false);

  useEffect(() => {
    if ( mounted.current )
      handleShowMore(isClickShowMore.id);
    else
      mounted.current = false;
  }, [handleShowMore, isClickShowMore]);

  useEffect(() => {
    if ( mounted.current )
      handleDeleteCollectionById(isClickDelete.id);
    else
      mounted.current = true;
  }, [handleDeleteCollectionById, isClickDelete]);

  const managerPage: ReactElement = isLoading 
    ? <LoadingScreen></LoadingScreen>
    : <>
      {/* {contextHolder} */}
      <title>{`Quản lý ${collectionName}`}</title>

      <Table<T>
        name={collectionName}
        isGetDatasDone={isLoading}
        datas={collections}
        columns={columns}
        onClickAdd={toggleAddCollectionModal}
        onClickDelete={handleDeleteCollection} 
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
      >
        {children}
      </CollectionForm>
    </>

  return managerPage;
}
