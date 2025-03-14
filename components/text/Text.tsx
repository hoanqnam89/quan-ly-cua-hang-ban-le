import React, { CSSProperties, ReactElement, ReactNode } from 'react'
import styles from './style.module.css';

interface ITextProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  title?: string
  labelFor?: string
}

export default function Text({
  children, 
  className = ``, 
  style = {
    fontSize: `1rem`, 
    fontWeight: 400, 
  }, 
  title = ``, 
}: Readonly<ITextProps>): ReactElement {
  const textStyle: CSSProperties = {
    ...style
  }

  return (
    <p
      className={`${styles.text} ${className}`}
      style={textStyle}
      title={title}
    >
      {children}
    </p>
  )
}
