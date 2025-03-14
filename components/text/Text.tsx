import React, { CSSProperties, ReactElement, ReactNode } from 'react'
import styles from './style.module.css';

interface ITextProps {
  children: ReactNode
  style?: CSSProperties
  title?: string
  labelFor?: string
}

export default function Text({
  children, 
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
      style={textStyle}
      className={`${styles.text}`}
      title={title}
    >
      {children}
    </p>
  )
}
