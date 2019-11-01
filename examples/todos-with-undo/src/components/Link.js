import React from 'react'
import { useOnGet, set } from 'onget'

export default function Link (props) {
  const currentFilter = useOnGet('fast://filter')
  const { myFilter, children } = props

  return (
    <button
      onClick={() => set('fast://filter', myFilter)}
      disabled={currentFilter === myFilter}
      style={{
        marginLeft: '4px'
      }}
    >
      {children}
    </button>
  )
}
