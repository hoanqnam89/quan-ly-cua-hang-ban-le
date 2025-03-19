import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { TColorMode } from '../interfaces/color-mode.interface';

interface IButtonProps {
  onClick?: () => void
  children: ReactNode
  isDisable?: boolean
  padding?: number
  margin?: number
  background?: TColorMode
  radius?: number
  style?: CSSProperties
  className?: string
  title?: string
}

export default function Button({
  isDisable = false,
  onClick,
  children,
  padding = 4,
  margin = 0,
  background = {
    light: `#76b900`,
    dark: `#76b900`,
  }, 
  radius = 4,
  style = {}, 
  className = ``, 
  title = ``, 
}: Readonly<IButtonProps>): ReactElement {
  const buttonStyle: CSSProperties = {
    padding: padding,
    gap: padding,
    margin: margin,
    background: `light-dark(${background.light}, ${background.dark})`,
    borderRadius: radius,
    ...style, 
  }

  const handleOnClick = (): void => {
    if (!isDisable && onClick)
      onClick();
  }

  return (
    <button
      title={title}
      className={`flex items-center justify-center w-full cursor-pointer ${className}`}
      style={buttonStyle}
      onClick={handleOnClick}
    >
      {children}
    </button>
  )
}
