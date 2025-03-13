import React, { ReactElement } from 'react'
import Text from '@/components/text/Text'

export default function LoadingPage(): ReactElement {
  return (
    <div className={`h-lvh w-lvw flex items-center justify-center`}>
      <Text>Đang tải...</Text>
    </div>
  )
}
