import { KeyboardEvent, ChangeEvent, CSSProperties } from "react"
import { TColorMode } from "./color-mode.interface"

export interface IInputProps<T> {
  value?: T 
  name?: string
  minWidth?: number
  background?: TColorMode
  isDisable?: boolean
  className?: string 
  style?: CSSProperties
  placeholder?: string
  min?: number 
  max?: number
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onInputBlur?: (e: ChangeEvent<HTMLInputElement>) => void
  onInputKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void, 
}
