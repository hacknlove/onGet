import React from 'react'
import { completeAllTodos, useCount } from '../state'

export default function CompleteAll () {
  const { todosCount, completedCount } = useCount()

  if (!todosCount) {
    return null
  }

  return (
    <span>
      <input
        className="toggle-all"
        type="checkbox"
        checked={completedCount === todosCount}
        readOnly
      />
      <label onClick={completeAllTodos}/>
    </span>
  )
}
