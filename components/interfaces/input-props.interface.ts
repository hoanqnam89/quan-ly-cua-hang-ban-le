import { KeyboardEvent, ChangeEvent, CSSProperties } from "react"

export interface IInputProps<T> {
  value?: T 
  name?: string
  isDisable?: boolean
  className?: string 
  style?: CSSProperties
  placeholder?: string
  min?: number 
  max?: number
  isRequire?: boolean
  pattern?: string
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onInputBlur?: (e: ChangeEvent<HTMLInputElement>) => void
  onInputKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void, 
}
