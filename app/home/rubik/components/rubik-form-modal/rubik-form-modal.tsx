// 'use client';

// import React, { ChangeEvent, Dispatch, SetStateAction, useState, memo } from 'react'
// import { IRubik, IRubikMoveSet } from '@/interfaces/rubik.interface';
// import { createId } from '@/utils/create-id';
// import InputSection from '../../../components/input-section/input-section';
// import { TTag } from '@/components/tags-input/types/tag';
// import TagsInput from '@/components/tags-input/tags-input';
// import { EInputType } from '@/components/tags-input/enums/input-type';
// import MoveSetInputSection from './components/move-set-input-section/move-set-input-section';
// import { Modal, NumberInput, TextInput } from '@/components';
// import { IRubikColor } from '@/interfaces/rubik-color-set.interface';

// interface IRubikFormModalProps {
//   rubik: IRubik | undefined, 
//   isModalOpen: boolean,
//   setIsModalOpen: Dispatch<SetStateAction<boolean>>
//   okAction: (rubik: IRubik) => void
// }

// function RubikFormModal({ 
//   rubik, isModalOpen, setIsModalOpen, okAction 
// }: Readonly<IRubikFormModalProps>) {
//   const [names, setNames] = useState<TTag[]>(rubik ? rubik.names : []);
//   const [numberOfRotation, setNumberOfRotation] = useState<number>(rubik ? 
//     rubik.number_of_rotation : 0
//   );
//   const [rotationFlags, setRotationFlags] = useState<TTag[]>(rubik ? 
//     rubik.rotation_flags : []
//   );
//   const [initialState, setInitialState] = useState<string>(rubik ? 
//     rubik.initial_state : ``
//   );
//   const [colorCodes, setColorCodes] = useState<TTag[]>(rubik ? 
//     rubik.colors.map(e => e.hex) : []
//   );
//   const [moveSets, setMoveSets] = useState<IRubikMoveSet[]>(rubik ?
//     rubik.move_sets : [
//     {
//       name: "",
//       swap_positions: [], 
//       rotate: {
//         position: 0,
//         turn: 1,
//       },
//     }
//   ]);

//   const handleChangeName = (tags: TTag[]) => {
//     setNames([...tags]);
//   }

//   const handleChangeNumberOfRotation = (e: ChangeEvent<HTMLInputElement>) => {
//     setNumberOfRotation(+e.target.value);
//   }

//   const handleChangeRotationFlag = (tags: TTag[]) => {
//     setRotationFlags([...tags]);
//   }

//   const handleChangeInitialState = (e: ChangeEvent<HTMLInputElement>) => {
//     setInitialState(e.target.value);
//   }

//   const handleChangeColor = (tags: TTag[]) => {
//     setColorCodes([...tags]);
//   }

//   const handleOk = () => {
//     const id = createId(`Rubik`);

//     const newNames = names.map(e => e.toString());
//     const newRotationFlags = rotationFlags.map(e => +e);
//     const newColors: IRubikColor[] = colorCodes.map((e, i) => ({
//       key: i.toString(), 
//       hex: e.toString(), 
//     }));

//     const rubik: IRubik = {
//       _id: id,
//       created_at: new Date(),
//       updated_at: new Date(),
//       names: newNames,
//       number_of_rotation: numberOfRotation, 
//       rotation_flags: newRotationFlags,
//       initial_state: initialState,
//       length: initialState.length,
//       colors: newColors,
//       move_sets: moveSets, 
//     }

//     okAction(rubik);
//   }

//   return (
//     <Modal
//       title={`New Rubik`}
//       okText={`Save`}
//       okAction={handleOk}
//       isOpen={isModalOpen}
//       setIsOpen={setIsModalOpen}
//     >
//       <div className={`flex flex-col gap-4`}>
//         <InputSection label={`Names`}>
//           <TagsInput 
//             values={names} 
//             onChangeAction={handleChangeName}
//             addTagButtonText={`New Name`}
//           >
//           </TagsInput>
//         </InputSection>

//         <InputSection label={`Number of rotation`}>
//           <div style={{width: 50}}>
//             <NumberInput
//               minWidth={0}
//               min={0}
//               max={999}
//               value={numberOfRotation}
//               onInputChange={
//                 (e: ChangeEvent<HTMLInputElement>) => 
//                   handleChangeNumberOfRotation(e)}
//             >
//             </NumberInput>
//           </div>
//         </InputSection>

//         <InputSection label={`Rotation Flags`}>
//           <TagsInput 
//             type={EInputType.NUMBER}
//             tagWidth={50}
//             values={rotationFlags} 
//             onChangeAction={handleChangeRotationFlag}
//             addTagButtonText={`New Rotation Flag`}
//           >
//           </TagsInput>
//         </InputSection>

//         <InputSection label={`Initial State`}>
//           <TextInput
//             value={initialState}
//             onInputChange={
//               (e: ChangeEvent<HTMLInputElement>) => 
//                 handleChangeInitialState(e)
//             }
//           >
//           </TextInput>
//         </InputSection>
        
//         <InputSection label={`Color Codes`}>
//           <TagsInput 
//             showIndex={true}
//             type={EInputType.COLOR}
//             addTagButtonText={`New Color`}
//             values={colorCodes} 
//             onChangeAction={handleChangeColor}
//           >
//           </TagsInput>
//         </InputSection>

//         <MoveSetInputSection 
//           moveSets={moveSets} 
//           setMoveSets={setMoveSets}
//         >
//         </MoveSetInputSection>
//       </div>
//     </Modal>
//   )
// }

// export default memo( RubikFormModal );
