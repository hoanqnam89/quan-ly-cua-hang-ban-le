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
  // className = ``, 
  style = {}, 
  placeholder = ``, 
  onChange = () => {}
}: Readonly<ITextInputProps>): ReactElement {
  return (
    <input
      type={`${isPassword ? `password` : `text`}`}
      placeholder={placeholder}
      name={name}
      value={value}
      disabled={isDisable}
      className={styles[`text-input`]}
      style={style}
      onChange={onChange}
    >
    </input>
  )
}
