import React, { ReactElement } from 'react'
import Text from '@/components/text/Text'

export default function LoadingScreen(): ReactElement {
  return (
    <div className={`h-lvh w-lvw flex items-center justify-center`}>
      <Text>Đang tải...</Text>
    </div>
  )
}
