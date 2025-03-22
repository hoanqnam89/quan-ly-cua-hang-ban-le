'use client'

import React, { ReactElement, ReactNode, useEffect, useState } from 'react'
import styles from './style.module.css';
import createContainer from '../create-container/create-container';
import { createPortal } from 'react-dom';
import Button from '@/components/button/button';
import IconContainer from '@/components/icon-container/icon-container';
import { xIcon } from '@/public';

export enum ENotificationType {
  INFO = `info`, 
  SUCCESS = `success`, 
  ERROR = `error`, 
  WARNING = `warning`, 
}

export interface INotification {
  children: ReactNode
  id: number
  type: ENotificationType
  isAutoClose: boolean
}

interface INotificationProps {
  children: ReactNode
  type?: ENotificationType
  onDelete?: () => void
  timeToDelete?: number
  isAutoClose?: boolean
}

export default function CustomNotification({
  children, 
  type = ENotificationType.INFO, 
  onDelete = () => {}, 
  timeToDelete = 3000, 
  isAutoClose = true, 
}: Readonly<INotificationProps>): ReactElement {
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const container: HTMLElement = createContainer(document);

  useEffect((): (() => void) | undefined => {
    if (isAutoClose) {
      const timeOutId: ReturnType<typeof setTimeout> = 
        setTimeout((): void => setIsClosing(true), timeToDelete);

      return (): void => {
        clearTimeout(timeOutId);
      }
    }
  }, [isAutoClose, timeToDelete]);

  useEffect((): (() => void) | undefined => {
    if (isClosing) {
      const timeOutId: ReturnType<typeof setTimeout> = 
        setTimeout(onDelete, 300);

      return (): void => {
        clearTimeout(timeOutId);
      }
    }
  }, [isClosing, onDelete, timeToDelete]);

  return createPortal(
    <div className={`${styles.container} ${isClosing ? styles.shrink : ``}`}>
      <div className={`${styles.notification} ${styles[type]} ${isClosing ? styles[`slide-out`] : styles[`slide-in`]} overflow-hidden font-bold relative flex gap-2 items-center p-2 rounded-lg`}>
        {children}
        <div>
          <Button onClick={(): void => setIsClosing(true)}>
            <IconContainer iconLink={xIcon}></IconContainer>
          </Button>
        </div>
      </div>
    </div>, 
    container, 
  )
}
