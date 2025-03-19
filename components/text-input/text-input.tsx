import React, { memo, ReactElement } from 'react';
import { IInputProps } from '../interfaces/input-props.interface';
import Input from '../input/input';

function TextInput({
  name = ``, 
  minWidth = 100,
  background = {
    light: `#ffffff`,
    dark: `#000000`
  },
  value = ``,
  isDisable = false, 
  className = `w-full`, 
  style = {
  }, 
  placeholder = ``, 
  onInputChange = () => {},
  onInputBlur = () => {},
  isPassword = false, 
}: Readonly<IInputProps<string>> & {isPassword?: boolean}): ReactElement {
  return (
    <Input 
      type={`${isPassword ? `password` : `text`}`}
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

export default memo( TextInput );
