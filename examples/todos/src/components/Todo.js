import React from 'react'
import { set, get } from 'onget'

export default function Todo (props) {
  const { id, completed, text } = props

  function toggleTodo () {
    const todos = get('dotted://todos.items')

    set('dotted://todos.items', todos.map(todo =>
      (todo.id === id)
        ? { ...todo, completed: !completed }
        : todo
    ))
  }

  return (
    <li
      onClick={toggleTodo}
      style={{
        textDecoration: completed ? 'line-through' : 'none'
      }}
    >
      {text}
    </li>
  )
}
