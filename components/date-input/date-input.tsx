import React, { memo, ReactElement } from 'react';
import { IInputProps } from '../interfaces/input-props.interface';
import Input from '../input/input';

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
  // Format the date as YYYY-MM-DD to ensure only date is shown
  const formatDateOnly = (date: Date): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Input 
      type={`date`}
      name={name}
      value={formatDateOnly(value)}
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
