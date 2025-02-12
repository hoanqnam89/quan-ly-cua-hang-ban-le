import React from 'react'

export default async function page() { const
  getAccounts = await fetch('http://localhost:3000/api/accounts',{method:'POST'})
    const accounts = await getAccounts.json()
  return (
    <div>{accounts}</div>
  )
}
