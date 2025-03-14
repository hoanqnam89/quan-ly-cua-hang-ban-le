'use client';

import React, { CSSProperties, Dispatch, ReactElement, ReactNode, SetStateAction, useEffect } from 'react';
import Button, { EButtonType } from '../button/button';
import Text from '../text/text';
import IconContainer from '../icon-container/icon-container';
import { xIcon } from '@/public';

interface IModalProps {
  width?: string
  height?: string
  children: ReactNode
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  padding?: number
  overlayColor?: string
  modalColor?: string
  blur?: string
  title?: string 
  showButtons?: boolean
  isOkDisable?: boolean
  okText?: string
  cancelText?: string
  buttonsPadding?: number
  okButtonColor?: string
  cancelButtonColor?: string
  okAction?: () => void
  cancelAction?: () => void
}

export default function Modal({
  width = `80vw`, 
  height = `80vh`, 
  children,
  isOpen,
  setIsOpen,
  padding = 16,
  overlayColor = `#ffffff22`, 
  modalColor = `#ffffffff`, 
  blur = `4px`,
  title = `New Modal`, 
  showButtons = true, 
  isOkDisable = false, 
  okText = `Save`,
  cancelText = `Cancel`,
  okAction,
  cancelAction,
}: Readonly<IModalProps>): ReactElement {
  useEffect((): void => {
    document.body.style.overflow = isOpen ? `hidden` : `unset`;
  }, [isOpen]);

  const overlayStyle: CSSProperties = {
    display: isOpen ? `initial` : `none`,
    background: `${overlayColor}`,
    backdropFilter: `blur(${blur})`,
  }

  const modalStyle: CSSProperties = {
    background: `${modalColor}`,
    width: width,
    maxHeight: height,
    padding: padding,
    display: isOpen ? `flex` : `none`,
    backdropFilter: `blur(${blur})`,
  }

  const modalHeaderStyle: CSSProperties = {
    padding: padding / 2,
  }

  const toggleModal = (): void => {
    setIsOpen((prev: boolean): boolean => !prev);
  }

  const handleCancel = (): void => {
    if (cancelAction)
      cancelAction();
    else
      toggleModal();
  }

  const handleOk = (): void => {
    if (okAction)
      okAction();
    else
      toggleModal();
  }

  return (
    <>
      <div
        style={overlayStyle}
        className={`
          w-screen h-screen z-0 top-1/2 left-1/2 
          -translate-x-1/2 -translate-y-1/2 absolute
        `}
        onClick={toggleModal}
      >
      </div>

      <div
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 rounded-lg flex-col -translate-x-1/2 -translate-y-1/2`}
      >
        <div
          style={modalHeaderStyle}
          className={`z-10 rounded-lg flex items-center justify-between`}
        >
          <Text style={{
            fontWeight: 600
          }}>{title}</Text>

          <div>
            <Button 
              style={{
                background: `transparent`
              }} 
              onClick={toggleModal}
            >
              <IconContainer iconLink={xIcon}></IconContainer>
            </Button>
          </div>
        </div>

        <div
          style={modalHeaderStyle}
          className={`z-10 rounded-lg items-center justify-center overflow-y-scroll`}
        >
          {children}
        </div>

        <div
          style={modalHeaderStyle}
          className={`${showButtons ? `flex` : `hidden`} z-10 rounded-lg gap-2 items-center justify-end`}
        >
          <div>
            <Button 
              type={EButtonType.WARNING}
              // padding={buttonsPadding} 
              onClick={handleCancel}
            >
              {cancelText}
            </Button>
          </div>
          <div>
            <Button
              type={EButtonType.SUCCESS}
              isDisable={isOkDisable}
              // padding={buttonsPadding}
              onClick={handleOk}
            >
              {okText}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
