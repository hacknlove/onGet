import React from 'react'
import { useOnGet, set } from 'onget'

export default function Link (props) {
  const currentFilter = useOnGet('dotted://filter')
  const { myFilter, children } = props

  return (
    <button
      onClick={() => set('dotted://filter', myFilter)}
      disabled={currentFilter === myFilter}
      style={{
        marginLeft: '4px'
      }}
    >
      {children}
    </button>
  )
}
