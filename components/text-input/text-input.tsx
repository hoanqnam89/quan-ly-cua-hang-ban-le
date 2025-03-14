import React, { ChangeEvent, CSSProperties, ReactElement } from 'react'
import styles from './style.module.css';

interface ITextInputProps {
  name?: string
  isPassword?: boolean
  value?: string
  isDisable?: boolean
  className?: string
  style?: CSSProperties
  placeholder?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function TextInput({
  name = ``, 
  isPassword = false, 
  value = ``, 
  isDisable = false, 
  className = ``, 
  style = {}, 
  placeholder = ``, 
  onChange = () => {}
}: Readonly<ITextInputProps>): ReactElement {
  return (
    <input
      className={`${styles[`text-input`]} ${className}`}
      disabled={isDisable}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      type={`${isPassword ? `password` : `text`}`}
      value={value}
    >
    </input>
  )
}
