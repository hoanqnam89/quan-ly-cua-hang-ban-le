// import React, { Dispatch, ReactElement, SetStateAction } from 'react';
// import { Modal } from '@/components';
// import { useFetchDatas } from '@/hooks/useFetchDatas'
// import { IRubik, IRubikAlgorithmSet } from '@/interfaces';

// interface IRubikAlgorithmSetsModalProps {
//   rubik: IRubik, 
//   isModalOpen: boolean,
//   setIsModalOpen: Dispatch<SetStateAction<boolean>>
// }

// export default function RubikAlgorithmSetsModal({
//   rubik, isModalOpen, setIsModalOpen
// }: Readonly<IRubikAlgorithmSetsModalProps>): ReactElement {
//   const {
//     data: rubikAlgorithmSets, 
//     isPending: isGetRubikAlgorithmSetsApiDone, 
//   } = useFetchDatas<IRubikAlgorithmSet>({
//     url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/rubik/${rubik._id}/rubik-algorithm-sets`, 
//     shouldFetch: !!rubik._id, 
//   });

//   return (
//     <Modal 
//       isOpen={isModalOpen} 
//       setIsOpen={setIsModalOpen}
//     >
//       <p></p>
//     </Modal>
//   )
// }
