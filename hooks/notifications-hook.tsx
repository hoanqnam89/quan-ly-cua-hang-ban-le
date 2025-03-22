'use client'

import CustomNotification, { INotification } from '@/components/notify/notification/notification';
import { ReactElement, useState } from 'react'

export default function useNotificationsHook() {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const createNotification = (notification: INotification): void => {
    setNotifications([
      ...notifications, 
      {
        ...notification, 
        id: notifications.length, 
      }
    ])
  }

  const deleteNotification = (id: number): void => {
    setNotifications([
      ...notifications.filter((
        notification: INotification
      ) => notification.id !== id)
    ]);
  }

  const notificationElements = notifications.map(
    (notification: INotification): ReactElement => (
      <CustomNotification 
        key={notification.id} 
        type={notification.type}
        isAutoClose={notification.isAutoClose}
        onDelete={() => deleteNotification(notification.id)}
      >
        {notification.children}
      </CustomNotification>
    )
  );

  return {
    notifications, 
    createNotification, 
    deleteNotification, 
    notificationElements, 
  }
}
