import React, { memo, ReactElement } from 'react';
import { IInputProps } from '../interfaces/input-props.interface';
import Input from '../input/input';
import { getSameDayOfYear } from '@/utils/get-same-date-of-year';
import { getDate } from '@/utils/get-date';

function DateInput({
  min = getDate( getSameDayOfYear(new Date(), -65) ),
  max = getDate( getSameDayOfYear(new Date(), -18) ),
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
