'use client'

import React, { ReactElement } from 'react'
import Text from '@/components/text/Text'
import Button from '@/components/button/Button'

export interface IErrorProps {
  error: Error & {digest: string}
  reset: () => void
}

export default function ErrorPage({
  error, 
  reset
}: Readonly<IErrorProps>): ReactElement {
  return (
    <>
      <Text>Đã có lỗi xảy ra: {error.message}</Text>
      <div className={`w-fit`}>
        <Button onClick={reset}>
          <Text>Thử lại</Text>
        </Button>
      </div>
    </>
  )
}
