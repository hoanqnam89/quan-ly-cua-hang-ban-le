// import { IRubikMoveSet } from '@/interfaces/rubik.interface'
// import React, { ChangeEvent, Dispatch, SetStateAction, memo } from 'react'
// import InputSection from '../../../../../components/input-section/input-section'
// import { EInputType } from '@/components/tags-input/enums/input-type';
// import { TTag } from '@/components/tags-input/types/tag'
// import { Button, IconContainer, NumberInput, TagsInput, Text, TextInput } from '@/components';
// import { plusIcon, xIcon } from '@/public';

// interface IMoveSetInputSectionProps {
//   moveSets: IRubikMoveSet[], 
//   setMoveSets: Dispatch<SetStateAction<IRubikMoveSet[]>>, 
// }

// function MoveSetInputSection({
//   moveSets, setMoveSets
// }: Readonly<IMoveSetInputSectionProps>) {
//   const handleChangeName = (
//     e: ChangeEvent<HTMLInputElement>, 
//     move_set_index: number
//   ) => {
//     const newMoveSets = [...moveSets];

//     newMoveSets[move_set_index].name = e.target.value;

//     setMoveSets([...newMoveSets]);
//   }

//   const handleChangeRotationPosition = (
//     e: ChangeEvent<HTMLInputElement>, 
//     move_set_index: number
//   ) => {
//     const newMoveSets = [...moveSets];

//     if ( !newMoveSets[move_set_index].rotate ) return;
//     newMoveSets[move_set_index].rotate.position = +e.target.value;

//     setMoveSets([...newMoveSets]);
//   }

//   const handleChangeRotationTurn = (
//     e: ChangeEvent<HTMLInputElement>, 
//     move_set_index: number
//   ) => {
//     const newMoveSets = [...moveSets];

//     if ( !newMoveSets[move_set_index].rotate ) return;
//     newMoveSets[move_set_index].rotate.turn = +e.target.value;

//     setMoveSets([...newMoveSets]);
//   }

//   const handleAddMoveSet = () => {
//     const newMoveSet: IRubikMoveSet = {
//       name: "",
//       swap_positions: [], 
//       rotate: {
//         position: 0,
//         turn: 0,
//       },
//     }

//     setMoveSets(prev => [...prev, newMoveSet]);
//   }

//   const handleRemoveMoveSet = (index: number) => {
//     const newMoveSets = moveSets.filter(e => e !== moveSets[index]);

//     setMoveSets([...newMoveSets]);
//   }

//   const handleAddSwapPosition = (move_set_index: number) => {
//     const newMoveSets = [...moveSets];

//     newMoveSets[move_set_index].swap_positions.push([0]);

//     setMoveSets([...newMoveSets]);
//   }

//   const handleRemoveSwapPosition = (
//     move_set_index: number, 
//     swap_position_index: number
//   ) => {
//     const newMoveSets = [...moveSets];
//     const newSwapPositions = newMoveSets[move_set_index].swap_positions.filter(
//       (e, i) => i !== swap_position_index
//     );
    
//     newMoveSets[move_set_index].swap_positions = [...newSwapPositions];

//     setMoveSets([...newMoveSets]);
//   }

//   const handleChangeSwapPositionItem = (
//     tags: TTag[], 
//     move_set_index: number, 
//     swap_position_index: number
//   ) => {
//     const newMoveSets = [...moveSets];

//     newMoveSets[move_set_index].swap_positions[swap_position_index] = 
//       tags.map(e => +e);

//     setMoveSets([...newMoveSets]);
//   }

//   return (
//     <InputSection label={`Move Sets`}>
//       <div>
//         <div className={`flex flex-col gap-2`}>
//           {moveSets.map((move_set, move_set_index) => 
//             <div 
//               key={move_set.name + move_set_index} 
//               className={`
//                 flex items-center gap-2 justify-between p-2 bg-gray-900
//               `}
//             >
//               <div className={`flex-1 flex flex-col gap-2`}>
//                 <div className={`flex items-center justify-between gap-2`}>
//                   <span className={`flex items-center gap-2 p-2 bg-gray-800`}>
//                     <Text>Name:</Text>
//                     <TextInput 
//                       value={move_set.name}
//                       onInputChange={
//                         (e: ChangeEvent<HTMLInputElement>) => 
//                           handleChangeName(e, move_set_index)
//                       }
//                     >
//                     </TextInput>
//                   </span>

//                   <span className={`flex items-center gap-2 p-2 bg-gray-800`}>
//                     <Text>Rotation:</Text>

//                     <Text>Position:</Text>
//                     <NumberInput 
//                       value={move_set?.rotate?.position ?? '0'} 
//                       onInputChange={
//                         (e: ChangeEvent<HTMLInputElement>) => 
//                           handleChangeRotationPosition(e, move_set_index)
//                       }
//                       minWidth={50}
//                     >
//                     </NumberInput>

//                     <Text>Turn:</Text>
//                     <NumberInput 
//                       value={move_set?.rotate?.turn ?? 0} 
//                       onInputChange={
//                         (e: ChangeEvent<HTMLInputElement>) => 
//                           handleChangeRotationTurn(e, move_set_index)
//                       }
//                       minWidth={50}
//                     >
//                     </NumberInput>
//                   </span>
//                 </div>

//                 <div>
//                   <span className={`flex items-center gap-2 p-2 bg-gray-800`}>
//                     <Text>Swap Positions:</Text>

//                     <div className={`flex flex-col gap-2 flex-1`}>
//                       {move_set.swap_positions.map((
//                         swap_position, 
//                         swap_position_index
//                       ) => 
//                         <div 
//                           key={swap_position.toString() + swap_position_index} 
//                           className={`
//                             flex items-center justify-between bg-gray-700 p-2
//                           `}
//                         >
//                           <TagsInput 
//                             addTagButtonText={`New Swap Position Item`}
//                             type={EInputType.NUMBER} 
//                             values={swap_position} 
//                             onChangeAction={
//                               (tags: TTag[]) => handleChangeSwapPositionItem(
//                                 tags, move_set_index, swap_position_index
//                               )
//                             }
//                           >
//                           </TagsInput>

//                           <div>
//                             <Button
//                               background={{
//                                 light: `transparent`, 
//                                 dark: `transparent`, 
//                               }}
//                               onClick={() => handleRemoveSwapPosition(
//                                 move_set_index, 
//                                 swap_position_index
//                               )}
//                             >
//                               <IconContainer iconLink={xIcon}>
//                               </IconContainer>
//                             </Button>
//                           </div>
//                         </div>
//                       )}

//                       <span>
//                         <Button 
//                           padding={8} 
//                           onClick={() => handleAddSwapPosition(move_set_index)}
//                         >
//                           <Text>New Swap Position</Text>

//                           <IconContainer iconLink={plusIcon}>
//                           </IconContainer>
//                         </Button>
//                       </span>
//                     </div>
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Button
//                   background={{
//                     light: `transparent`, 
//                     dark: `transparent`, 
//                   }}
//                   onClick={() => handleRemoveMoveSet(move_set_index)}
//                 >
//                   <IconContainer iconLink={xIcon}>
//                   </IconContainer>
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>

//         <span>
//           <Button padding={8} onClick={handleAddMoveSet}>
//             <Text>New Move Set</Text>

//             <IconContainer iconLink={plusIcon}>
//             </IconContainer>
//           </Button>
//         </span>
//       </div>
//     </InputSection>
//   )
// }

// export default memo( MoveSetInputSection )

import React from 'react'

export default function UoveUetUnputUection() {
  return (
    <div>move-set-inputUection</div>
  )
}
