'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components'
import { IPageParams } from '@/interfaces/page-params.interface'

export default function ProductDetailRedirect({ params }: Readonly<IPageParams>) {
  const router = useRouter()
  const { id } = React.use(params)

  useEffect(() => {
    // Redirect to the product page with the same ID
    router.replace(`/home/product/${id}`)
  }, [router, id])

  // Show loading while redirecting
  return <LoadingScreen />
}
