import React, { memo, ReactElement } from 'react';
import { IInputProps } from '../interfaces/input-props.interface';
import Input from '../input/input';

function NumberInput({
  name = ``, 
  minWidth = 100,
  background = {
    light: `#ffffff`,
    dark: `#000000`
  },
  value = `0`,
  isDisable = false, 
  className = `w-full`, 
  style = {
  }, 
  min = 0, 
  max = 10, 
  placeholder = ``, 
  onInputChange = () => {},
  onInputBlur = () => {},
}: Readonly<IInputProps<string>>): ReactElement {
  return (
    <Input 
      type={`number`}
      min={min}
      max={max}
      placeholder={placeholder}
      name={name}
      minWidth={minWidth}
      background={background}
      value={value}
      isDisable={isDisable}
      className={className}
      style={style}
      onInputBlur={onInputBlur}
      onInputChange={onInputChange}
    >
    </Input>
  )
}

export default memo( NumberInput );
