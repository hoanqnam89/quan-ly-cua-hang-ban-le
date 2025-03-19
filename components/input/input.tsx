import React, { KeyboardEvent, ChangeEvent, CSSProperties, HTMLInputTypeAttribute, memo, ReactElement } from 'react';
import { IInputProps } from '../interfaces/input-props.interface';

function Input({
  type = `text`, 
  name = ``, 
  minWidth = 100,
  background = {
    light: `#eeeeee`,
    dark: `#121212`
  },
  value = ``,
  isDisable = false, 
  className = ``, 
  style = {}, 
  min = 0, 
  max = 10, 
  onInputChange = () => {},
  onInputBlur = () => {},
  onInputKeyDown = () => {}, 
  placeholder = ``, 
}: Readonly<IInputProps<string> & {type: HTMLInputTypeAttribute}>
): ReactElement {
  const inputStyle: CSSProperties = {
    minWidth: minWidth,
    background: `light-dark(${background.light}, ${background.dark})`,
    color: isDisable ? `#7f7f7f` : `initial`, 
    padding: 4, 
    ...style, 
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => 
    onInputChange(e);

  const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => 
    onInputBlur(e);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => 
    onInputKeyDown(e);

  return (
    <input
      name={name}
      min={min}
      max={max}
      style={inputStyle}
      className={`w-full ${className}`}
      type={type}
      value={value}
      disabled={isDisable}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    >
    </input>
  )
}

export default memo( Input );
