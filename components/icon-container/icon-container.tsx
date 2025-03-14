import React, { CSSProperties, ReactElement } from 'react';
import Image from 'next/image';
import { xIcon } from '@/public';
import styles from './style.module.css';

interface IIconContainerProps {
  iconLink?: string
  size?: number
  tooltip?: string
  style?: CSSProperties
  className?: string
}

export default function IconContainer({
  iconLink = xIcon, 
  size = 24, 
  tooltip = ``, 
  style = {}, 
  className = ``, 
}: Readonly<IIconContainerProps>): ReactElement {
  const divStyle: CSSProperties = {
    width: size, 
    ...style, 
  }

  const imageStyle: CSSProperties = {
    width: size, 
    height: size, 
  }

  return (
    <div style={divStyle} title={tooltip}>
      <Image
        className={`${className} ${styles.image}`}
        src={iconLink}
        alt={`icon`}
        width={size}
        height={size}
        loading={`eager`}
        style={imageStyle}
      />
    </div>
  )
}
