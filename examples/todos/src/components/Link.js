import React from 'react'
import { useOnGet, set } from 'onget'

function setFilter (filter) {
  set('state://todos.filter', filter)
}

export default function Link (props) {
  const currentFilter = useOnGet('state://todos.filter')
  const { myFilter, children } = props

  return (
    <button
      onClick={() => setFilter(myFilter)}
      disabled={currentFilter === myFilter}
      style={{
        marginLeft: '4px'
      }}
    >
      {children} {myFilter}
    </button>
  )
}