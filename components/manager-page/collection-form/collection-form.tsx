import React, { Dispatch, ReactElement, SetStateAction } from 'react'
import { Modal} from '@/components';
import { ECollectionNames } from '@/enums';

interface ICollectionFormProps<T> {
  children: ReactElement
  collection: T
  collectionName: ECollectionNames
  isModalOpen?: boolean
  setIsModalOpen?: Dispatch<SetStateAction<boolean>>
  okAction?: (collection: T) => void
  isReadOnly?: boolean
  isUpdateCollection?: boolean
}

export default function CollectionForm<T extends {_id: string, index?: number}>({
  children, 
  collection, 
  collectionName, 
  isModalOpen = false, 
  setIsModalOpen = () => {}, 
  okAction = () => {}, 
  isReadOnly = false, 
  isUpdateCollection = false,
}: Readonly<ICollectionFormProps<T>>): ReactElement {
  const getActionName: string = isReadOnly 
    ? `Xem` 
    : isUpdateCollection 
      ? `Cập nhật` 
      : `Lưu`;

  return (
    <Modal 
      okText={`${getActionName} dữ liệu`}
      okAction={(): void => okAction(collection)}
      title={`${getActionName} ${collectionName}`}
      isOpen={isModalOpen} 
      setIsOpen={setIsModalOpen}
    >
      <div className={`flex flex-col gap-2`}>
        {children}
      </div>
    </Modal>
  )
}
