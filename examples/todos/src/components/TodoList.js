import React from 'react'
import Todo from './Todo'
import { useOnGet } from 'onget'

function useFilterTodos () {
  const todos = useOnGet('dotted://todos', {
    first: {
      items: [],
      filter: 'SHOW_ALL'
    }
  })

  switch (todos.filter) {
    case 'SHOW_COMPLETED':
      return todos.items.filter(todo => todo.completed)
    case 'SHOW_ACTIVE':
      return todos.items.filter(todo => !todo.completed)
    default:
      return todos.items
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
