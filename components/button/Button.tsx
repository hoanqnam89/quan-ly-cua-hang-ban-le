import React, { CSSProperties, ReactElement, ReactNode } from 'react'
import styles from './style.module.css';

export enum EButtonType {
  WARNING = `warning`, 
  SUCCESS = `success`, 
  INFO = `info`, 
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
  type = EButtonType.INFO, 
  // className = ``, 
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
      style={buttonStyle}
      className={`${styles.button} ${styles[type]} ${isLoading ? styles.loading : ``}`}
      title={title}
      disabled={isDisable}
      onClick={!isLoading ? onClick : () => {}}
    >
      {children}
    </button>
  )
}
