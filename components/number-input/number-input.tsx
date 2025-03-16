import React, { ChangeEvent, CSSProperties, ReactElement } from 'react'
import styles from './style.module.css';

interface INumberInputProps {
  name?: string
  isPassword?: boolean
  value?: number 
  isDisable?: boolean
  isRequire?: boolean
  pattern?: string
  className?: string
  style?: CSSProperties
  placeholder?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function NumberInput({
  name = ``, 
  value = 0, 
  isDisable = false, 
  isRequire = false, 
  pattern = `.{1,}`, 
  className = ``, 
  style = {}, 
  placeholder = ``, 
  onChange = () => {}
}: Readonly<INumberInputProps>): ReactElement {
  return (
    <input
      className={`p-2 rounded-lg ${styles[`text-input`]} ${className}`}
      disabled={isDisable}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      type={`number`}
      value={value}
      required={isRequire}
      pattern={pattern}
    >
    </input>
  )
}
