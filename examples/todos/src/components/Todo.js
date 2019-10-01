import React from 'react'
import { set, get } from 'onget'

function toggleTodo (id) {
  const todos = get('dotted://todos.items')

  set('dotted://todos.items', todos.map(todo =>
    (todo.id === id)
      ? { ...todo, completed: !todo.completed }
      : todo
  ))
}

export default function Todo (props) {
  const { id, completed, text } = props

  return (
    <li
      onClick={() => toggleTodo(id)}
      style={{
        textDecoration: completed ? 'line-through' : 'none'
      }}
    >
      {text}
    </li>
  )
}
