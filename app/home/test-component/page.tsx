'use client'

import { Button, Text } from '@/components'
import React, { CSSProperties } from 'react'

export default function TestComponent() {
	const containerStyle: CSSProperties = {
		background: `#121212`, 
		borderRadius: 4, 
		padding: 8, 
		display: `flex`,
		alignItems: `center`,
		justifyContent: `center`,
	}

  return (
    <>
			<div className={`flex flex-wrap gap-2`}>
				<div style={containerStyle}>
					<Text>Text</Text>
				</div>

				<div style={containerStyle}>
					<Button>
						<Text>Button</Text>
					</Button>
				</div>
			</div>
    </>
  )
}
