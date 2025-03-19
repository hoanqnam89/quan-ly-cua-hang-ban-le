'use client'

import { Button, Text } from '@/components'
import { TColorMode } from '@/components/interfaces/color-mode.interface'
import { IErrorProps } from '@/interfaces/error-page-props.interface'
import React from 'react'

export default function GlobalError({
  error, 
  reset
}: Readonly<IErrorProps>) {
  const buttonColor: TColorMode = {
    light: `#000`, 
    dark: `#fff`, 
  }

  const textColor: TColorMode = {
    light: `#fff`, 
    dark: `#000`, 
  }

  return (
    <>
      <Text size={32}>An error occured: {error.message}</Text>
      <div className={`w-fit`}>
        <Button onClick={reset} background={buttonColor}>
          <Text weight={600} color={textColor}>Try again</Text>
        </Button>
      </div>
    </>
  )
}
