'use client'

import ErrorPage, { IErrorProps } from '@/pages/error-page/error-page'
import React, { ReactElement } from 'react'

export default function Error({
  error, 
  reset
}: Readonly<IErrorProps>): ReactElement {
  return (
    <ErrorPage error={error} reset={reset}></ErrorPage>
  )
}
