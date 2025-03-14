'use client'

import Checkboxes from '@/components/checkboxes/checkboxes'
import React, { ReactNode, useState } from 'react'

export default function Home(): ReactNode {
  const [options, setOptions] = useState([
    {
      label: `a`, 
      value: `a`, 
      isChecked: false
    }, 
    {
      label: `b`, 
      value: `b`, 
      isChecked: false
    }, 
  ]);

  return (
    <div>
      <Checkboxes options={options} setOptions={setOptions}></Checkboxes>
    </div>
  )
}
