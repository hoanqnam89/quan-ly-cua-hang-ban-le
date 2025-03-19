import React, { CSSProperties, ReactElement } from 'react';
import Image from 'next/image';
import { xIcon } from '@/public';

interface IIconContainerProps {
  iconLink?: string
  size?: number
  tooltip?: string
  color?: string
  style?: CSSProperties
  className?: string
}

export default function IconContainer({
  iconLink = xIcon, 
  size = 24, 
  tooltip = ``, 
  color = `#ff0000`, 
  style = {}, 
  className = ``, 
}: Readonly<IIconContainerProps>): ReactElement {
  const divStyle: CSSProperties = {
    width: size, 
    color: color, 
    ...style, 
  }

  const imageStyle: CSSProperties = {
    width: size, 
    height: size, 
    color: color, 
  }

  return (
    <div style={divStyle} title={tooltip}>
      <Image
        className={`dark:invert ${className}`}
        src={iconLink}
        alt={`icon`}
        width={size}
        height={size}
        loading='eager'
        style={imageStyle}
      />
    </div>
  )
}
