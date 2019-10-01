import React from 'react'
import { useOnGet, set } from 'onget'

export default function Link (props) {
  const currentFilter = useOnGet('dotted://todos.filter')
  const { myFilter, children } = props

  return (
    <button
      onClick={() => set('dotted://todos.filter', myFilter)}
      disabled={currentFilter === myFilter}
      style={{
        marginLeft: '4px'
      }}
    >
      {children} {myFilter}
    </button>
  )
}
