import React from 'react'
import Todo from './Todo'
import { useOnGet } from 'onget'

function useFilterTodos () {
  const todos = useOnGet('history://todos', { first: [] })
  const filter = useOnGet('dotted://filter', { first: 'SHOW_ALL' })

  switch (filter) {
    case 'SHOW_COMPLETED':
      return todos.filter(todo => todo.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(todo => !todo.completed)
    default:
      return todos
  }
}

export default function TodoList () {
  const filtered = useFilterTodos()

  return (
    <ul>
      {filtered.map(todo =>
        <Todo
          key={todo.id}
          {...todo}
        />
      )}
    </ul>
  )
}
