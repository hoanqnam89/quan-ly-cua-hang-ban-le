import React, { CSSProperties, ReactElement, ReactNode } from 'react'
import styles from './style.module.css';

export enum EButtonType {
  DANGER = `danger`, 
  SUCCESS = `success`, 
  INFO = `info`, 
  TRANSPARENT = `transparent`
}

interface IButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: EButtonType
  className?: string
  isDisable?: boolean
  isLoading?: boolean
  style?: CSSProperties
  title?: string
}

export default function Button({
  children, 
  onClick = () => {}, 
  type = EButtonType.TRANSPARENT, 
  className = ``, 
  isDisable = false, 
  isLoading = false, 
  style = {}, 
  title = ``, 
}: Readonly<IButtonProps>): ReactElement {
  const buttonStyle: CSSProperties = {
    ...style, 
  }

  return (
    <button
      className={`p-2 rounded-lg relative ${styles.button} ${styles[type]} ${className} ${isLoading ? styles.loading : ``}`}
      disabled={isDisable}
      onClick={!isLoading ? onClick : () => {}}
      style={buttonStyle}
      title={title}
    >
      {children}
    </button>
  )
}
