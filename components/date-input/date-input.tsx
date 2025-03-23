import React, { memo, ReactElement } from 'react';
import { IInputProps } from '../interfaces/input-props.interface';
import Input from '../input/input';
import { getDate } from '@/utils/get-date';

function DateInput({
  min = undefined,
  max = undefined,
  name = ``, 
  value = new Date(),
  isDisable = false, 
  className = `w-full`, 
  style = {
  }, 
  onInputChange = () => {},
  onInputBlur = () => {},
}: Readonly<IInputProps<Date>>): ReactElement {
  return (
    <Input 
      type={`date`}
      name={name}
      value={getDate(value)}
      isDisable={isDisable}
      className={className}
      style={style}
      onInputBlur={onInputBlur}
      onInputChange={onInputChange}
      min={min}
      max={max}
    >
    </Input>
  )
}

export default memo( DateInput );
