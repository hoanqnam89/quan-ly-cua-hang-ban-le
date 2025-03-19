import React, { memo, ReactElement } from 'react';
import { IInputProps } from '../interfaces/input-props.interface';
import Input from '../input/input';

function ColorInput({
  name = ``, 
  minWidth = 100,
  background = {
    light: `#ffffff`,
    dark: `#000000`
  },
  value = `#000000`,
  isDisable = false, 
  className = `w-full`, 
  style = {
  }, 
  placeholder = ``, 
  onInputChange = () => {},
  onInputBlur = () => {},
}: Readonly<IInputProps<string>>): ReactElement {
  return (
    <Input 
      type={`color`}
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

export default memo( ColorInput );
