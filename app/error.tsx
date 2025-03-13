'use client'

import ErrorPage, { IErrorProps } from '@/pages/ErrorPage/ErrorPage'
import React from 'react'

export default function Error({
  error, 
  reset
}: Readonly<IErrorProps>) {
  return (
    <ErrorPage error={error} reset={reset}></ErrorPage>
  )
}
