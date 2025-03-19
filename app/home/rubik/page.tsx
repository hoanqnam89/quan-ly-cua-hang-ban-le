'use client';

// import React, { ReactElement, useState } from 'react';
// import { notification } from 'antd';
// import RubikFormModal from './components/rubik-form-modal/rubik-form-modal';
// import { isRubikInitialStateDigitNotFound, isRubikInitialStateValid, isRubikMoveSetSwapPositionsCoverAllState, isRubikRotationFlagsOutOfBound } from '@/utils/rubik-validation';
// import RubikAlgorithmSetFormModal from '../rubik-algorithm-set/components/rubik-algorithm-set-form-modal';
// import { useFetchDatas } from '@/hooks/useFetchDatas';
// import { addRubikAlgorithmSet, deleteRubikAlgorithmSetById } from '@/services/RubikAlgorithmSet';
// import { addRubik, deleteRubikById } from '@/services/Rubik';
// import { createApiNotificationResult, EAction } from '@/utils/create-api-notification-result';
// import { Button, IconContainer, LoadingIcon, Modal, Text } from '@/components';
// import { blocksIcon, infoIcon, plusIcon, toyBrickIcon, trashIcon } from '@/public';
// import { IRubik, IRubikAlgorithmSet } from '@/interfaces';
// import { ECollectionNames } from '@/enums';
// import { IColumnProps } from '@/components/table/interfaces/column-props.interface';
// import Table from '@/components/table/table';
// import { DEFAULT_RUBIK } from '@/constants';

// export default function Rubik(): ReactElement {
//   const [isAddRubikModalOpen, setIsAddRubikModalOpen] = useState<boolean>(false);
//   const [isEditRubikModalOpen, setIsEditRubikModalOpen] = useState<boolean>(false);
//   const [isViewRubikAlgorithmSetsModalOpen, setIsViewRubikAlgorithmSetsModalOpen] = useState<boolean>(false);
//   const [isAddRubikAlgorithmSetsModalOpen, setIsAddRubikAlgorithmSetsModalOpen] = useState<boolean>(false);
//   const [
//     isAddRubikAlgorithmSetsModalOkButtonDisable, 
//     setIsAddRubikAlgorithmSetsModalOkButtonDisable, 
//   ] = useState<boolean>(false);

//   const [notificationApi, contextHolder] = notification.useNotification();
//   const [focusedRubikId, setFocusedRubikId] = useState<string>(``);

//   const {
//     data: rubiks, 
//     isPending: isGetRubiksApiDone, 
//   } = useFetchDatas<IRubik>({
//     url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/rubik`
//   });

//   const {
//     data: rubikAlgorithmSets, 
//     isPending: isGetRubikAlgorithmSetsApiDone, 
//   } = useFetchDatas<IRubikAlgorithmSet>({
//     url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/rubik/${focusedRubikId}/rubik-algorithm-sets`, 
//     shouldFetch: !!focusedRubikId
//   });

//   const transparentButton = {
//     light: `transparent`, 
//     dark: `transparent`, 
//   }

//   const gridStyle = {
//     gridTemplateColumns: `1fr 10fr 10fr 6fr 2fr 2fr`,
//   }
  
//   const rubikAlgorithmSetGridStyle = {
//     gridTemplateColumns: `1fr 1fr 10fr 1fr`,
//   }

//   const toggleEditRubikModal = (rubikId: string): void => {
//     setFocusedRubikId(rubikId);
//     setIsEditRubikModalOpen(true);
//   }

//   const toggleAddRubikModal = (): void => {
//     setIsAddRubikModalOpen(prev => !prev);
//   }

//   const toggleAddRubikAlgorithmSetModal = (): void => {
//     setIsAddRubikAlgorithmSetsModalOpen(prev => !prev);
//   }

//   const toggleViewRubikAlgorithmSetsModal = (rubikId: string): void => {
//     setFocusedRubikId(rubikId);
//     setIsViewRubikAlgorithmSetsModalOpen(true);
//   }

//   const handleEditRubik = async (): Promise<void> => {
//   }

//   const handleAddRubikAlgorithmSet = async (
//     rubikAlgorithmSet: IRubikAlgorithmSet
//   ): Promise<void> => {
//     setIsAddRubikAlgorithmSetsModalOkButtonDisable(true);

//     const addRubikAlgorithmSetApiResponse: Response = 
//       await addRubikAlgorithmSet(rubikAlgorithmSet);

//     createApiNotificationResult(
//       notificationApi, 
//       addRubikAlgorithmSetApiResponse.status, 
//       ECollectionNames.RUBIK_ALGORITHM_SET, 
//     );

//     toggleAddRubikAlgorithmSetModal();
//   }

//   const handleDeleteRubikAlgorithmSetById = async (
//     rubikAlgorithmSetId: string
//   ): Promise<void> => {
//     if ( 
//       !confirm(`Are you sure you want to delete this rubik algorithm set?`) 
//     ) 
//       return;

//     const deleteRubikAlgorithmSetByIdApiResponse: Response = 
//       await deleteRubikAlgorithmSetById(rubikAlgorithmSetId);

//     createApiNotificationResult(
//       notificationApi, 
//       deleteRubikAlgorithmSetByIdApiResponse.status, 
//       ECollectionNames.RUBIK_ALGORITHM_SET, 
//       EAction.DELETE, 
//     )
//   }

//   const handleAddRubik = async (rubik: IRubik): Promise<void> => {
//     if ( isRubikInitialStateValid(rubik) ) {
//       notificationApi.error({
//         message: `Initial State must contain only numeric characters`,
//         placement: `topLeft`,
//       });
//       return;
//     }

//     if ( isRubikRotationFlagsOutOfBound(rubik) ) {
//       notificationApi.error({
//         message: `Each Rotation Flag must greater than 0 and less than Initial State's length`,
//         placement: `topLeft`,
//       });
//       return;
//     }

//     if ( isRubikInitialStateDigitNotFound(rubik) ) {
//       notificationApi.error({
//         message: `Each digit in Initial State must appear in one of color code's key`,
//         placement: `topLeft`,
//       });
//       return;
//     }

//     if ( !isRubikMoveSetSwapPositionsCoverAllState(rubik) ) {
//       notificationApi.error({
//         message: `Each digit in each Swap Position array in each Move Set must cover all posible position in Initial State`,
//         placement: `topLeft`,
//       });
//       return;
//     }

//     const addRubikApiResponse: Response = await addRubik(rubik);

//     createApiNotificationResult(
//       notificationApi, 
//       addRubikApiResponse.status, 
//       ECollectionNames.RUBIK, 
//     );

//     toggleAddRubikModal();
//   }

//   const handleDeleteRubik = async (rubikId: string): Promise<void> => {
//     if ( !confirm(`Are you sure you want to delete this rubik?`) )
//       return;

//     const deleteRubikByIdApiResponse: Response = await deleteRubikById(rubikId);

//     createApiNotificationResult(
//       notificationApi, 
//       deleteRubikByIdApiResponse.status, 
//       ECollectionNames.RUBIK, 
//       EAction.DELETE, 
//     );
//   }

//   const columns: Array<IColumnProps<IRubik>> = [
//     {
//       key: `index`,
//       title: `#`,
//     },
//     {
//       key: `_id`,
//       title: `ID`,
//     },
//     {
//       key: `names`,
//       title: 'Name',
//     },
//     {
//       title: `Rubik Algorithm Set`,
//       render: (
//         _key: string, 
//         _column: IColumnProps<IRubik>, 
//         rubik: IRubik
//       ) => <Button 
//         background={transparentButton} 
//         onClick={() => {}}
//       >
//         <IconContainer iconLink={toyBrickIcon}></IconContainer>
//       </Button>
//     },
//     {
//       title: `More`,
//       render: (
//         _key: string, 
//         _column: IColumnProps<IRubik>, 
//         rubik: IRubik
//       ) => <Button 
//         background={transparentButton} 
//         onClick={() => {}}
//       >
//         <IconContainer iconLink={infoIcon}></IconContainer>
//       </Button>
//     },
//     {
//       title: `Delete`,
//       render: (
//         _key: string, 
//         _column: IColumnProps<IRubik>, 
//         rubik: IRubik
//       ) => {
//         return <Button 
//           background={transparentButton} 
//           onClick={() => handleDeleteRubik(rubik._id)}
//         >
//           <IconContainer iconLink={trashIcon}></IconContainer>
//         </Button>
//       },
//     },
//   ];

//   return (
//     <>
//       {contextHolder}

//       <Table<IRubik>
//         name={ECollectionNames.RUBIK}
//         isGetDatasDone={isGetRubiksApiDone}
//         datas={rubiks}
//         columns={columns} 
//         onClickAdd={toggleAddRubikModal}
//       />
//     </>
//   );

//   return (
//     <>
//       {contextHolder}

//       {/* <RubikFormModal
//         isModalOpen={isAddRubikModalOpen}
//         setIsModalOpen={setIsAddRubikModalOpen}
//         okAction={handleAddRubik} 
//         rubik={DEFAULT_RUBIK}
//       >
//       </RubikFormModal>

//       <Modal 
//         title={`Rubik ${focusedRubikId}`}
//         isOpen={isViewRubikAlgorithmSetsModalOpen} 
//         setIsOpen={setIsViewRubikAlgorithmSetsModalOpen}
//         showButtons={false}
//       >
//         <div className={`flex flex-col gap-4`}>
//           <div className={`flex items-center justify-between`}>
//             <Text size={24} weight={600}>
//               List of {ECollectionNames.RUBIK_ALGORITHM_SET}s
//             </Text>

//             <div>
//               <Button 
//                 background={transparentButton} 
//                 onClick={toggleAddRubikAlgorithmSetModal}
//               >
//                 <IconContainer 
//                   iconLink={plusIcon} 
//                   size={32} 
//                   tooltip={`Add new ${ECollectionNames.RUBIK_ALGORITHM_SET}`}
//                 >
//                 </IconContainer>
//               </Button>
//             </div>
//           </div>

//           <div
//             className={`grid font-bold items-center gap-2 p-1`}
//             style={rubikAlgorithmSetGridStyle}
//           >
//             <Text weight={600}>#</Text>
//             <Text weight={600}>Names</Text>
//             <Text weight={600}>State</Text>
//             <Text weight={600}>Delete</Text>
//           </div>

//           {isGetRubikAlgorithmSetsApiDone ? (
//             <LoadingIcon></LoadingIcon>
//           ) : (
//             <>
//               {rubikAlgorithmSets && rubikAlgorithmSets.map((rubikAlgorithmSet, rubikAlgorithmSetIndex) => (
//                 <div 
//                   key={rubikAlgorithmSet._id} 
//                   className={`
//                     grid font-bold items-center gap-2 p-1 pt-2
//                     border-t-2 border-t-solid border-t-gray-700
//                   `}
//                   style={rubikAlgorithmSetGridStyle}
//                 >
//                   <Text weight={600}>{rubikAlgorithmSetIndex}</Text>
//                   <Text weight={600}>{rubikAlgorithmSet.name}</Text>

//                   <div className={`flex flex-col items-center`}>
//                     <Text fontFamily={`monospace`}>
//                       {rubikAlgorithmSet.start_state}
//                     </Text>
//                     <Text>↓</Text>
//                     <Text fontFamily={`monospace`}>
//                       {rubikAlgorithmSet.end_state}
//                     </Text>
//                   </div>

//                   <Button 
//                     background={transparentButton} 
//                     onClick={
//                       () => handleDeleteRubikAlgorithmSetById(rubikAlgorithmSet._id)
//                     }
//                   >
//                     <IconContainer 
//                       iconLink={trashIcon}
//                       tooltip={`Delete this ${ECollectionNames.RUBIK_ALGORITHM_SET}`}
//                     >
//                     </IconContainer>
//                   </Button>
//                 </div>
//               ))}
//             </>
//           )}
//         </div>
//       </Modal>

//       <RubikAlgorithmSetFormModal 
//         rubikAlgorithmSet={DEFAULT_RUBIK_ALGORITHM_SET} 
//         isModalOpen={isAddRubikAlgorithmSetsModalOpen} 
//         setIsModalOpen={setIsAddRubikAlgorithmSetsModalOpen} 
//         okAction={handleAddRubikAlgorithmSet}
//         isOkDisable={isAddRubikAlgorithmSetsModalOkButtonDisable}
//       >
//       </RubikAlgorithmSetFormModal> */}
//     </>
//   )
// }
import React, { useEffect } from 'react'

export default function Rubik() {
  
  
  useEffect(() => {
    return () => {
    }
  }, [])

  return (
    <div>page</div>
  )
}
