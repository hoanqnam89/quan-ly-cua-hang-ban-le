import React, { ChangeEvent, CSSProperties, ReactElement } from 'react'
import styles from './style.module.css';
import { pad } from '@/utils/pad';

interface IDatetimeInputProps {
  name?: string
  value?: Date
  isDisable?: boolean
  isRequire?: boolean
  pattern?: string
  className?: string
  style?: CSSProperties
  placeholder?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function TextInput({
  name = ``, 
  value = new Date(), 
  isDisable = false, 
  isRequire = false, 
  pattern = `.{1,}`, 
  className = ``, 
  style = {}, 
  placeholder = ``, 
  onChange = () => {}
}: Readonly<IDatetimeInputProps>): ReactElement {
  const getDate = (): string => {
    const date: Date = new Date(value);
    
    return `${date.getFullYear()}-${
      pad(date.getMonth() + 1 + ``, 2)
    }-${
      pad(date.getDate() + ``, 2)
    }T${
      pad(date.getHours() + ``, 2)
    }:${
      pad(date.getMinutes() + ``, 2)
    }:${
      pad(date.getSeconds() + ``, 2)
    }`;
  }

  return (
    <input
      className={`p-2 rounded-lg ${styles[`text-input`]} ${className}`}
      disabled={isDisable}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      type={`datetime-local`}
      value={getDate()}
      required={isRequire}
      pattern={pattern}
    >
    </input>
  )
}
