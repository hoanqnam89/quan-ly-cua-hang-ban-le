'use client'

import React, { ReactElement } from 'react'
import Text from '@/components/text/text'
import Button from '@/components/button/button'

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
