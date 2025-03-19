import React, { memo, ReactElement } from 'react';
import { IInputProps } from '../interfaces/input-props.interface';
import Input from '../input/input';
import { pad } from '@/utils/pad';

function DateInput({
  name = ``, 
  minWidth = 100,
  background = {
    light: `#ffffff`,
    dark: `#000000`
  },
  value = new Date(),
  isDisable = false, 
  className = `w-full`, 
  style = {
  }, 
  onInputChange = () => {},
  onInputBlur = () => {},
}: Readonly<IInputProps<Date>>): ReactElement {
  const getDate = (): string => {
    const date: Date = new Date(value);
    
    return `${date.getFullYear()}-${
      pad(date.getMonth() + 1 + ``, 2)
    }-${
      pad(date.getDate() + ``, 2)
    }`
  }

  return (
    <Input 
      type={`date`}
      name={name}
      minWidth={minWidth}
      background={background}
      value={getDate()}
      isDisable={isDisable}
      className={className}
      style={style}
      onInputBlur={onInputBlur}
      onInputChange={onInputChange}
    >
    </Input>
  )
}

export default memo( DateInput );
