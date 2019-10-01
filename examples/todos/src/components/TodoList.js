import React from 'react'
import Todo from './Todo'
import { useOnGet } from 'onget'

function filterTodos (todos) {
  let filterFunction

  switch (todos.filter) {
    case 'SHOW_COMPLETED':
      filterFunction = (todo) => todo.completed
      break
    case 'SHOW_ACTIVE':
      filterFunction = (todo) => !todo.completed
      break
    default:
      filterFunction = () => true
  }

  return todos.items.filter(filterFunction)
}

export default function TodoList () {
  const todos = useOnGet('dotted://todos', {
    first: {
      items: [],
      filter: 'SHOW_ALL'
    }
  })

  const filtered = filterTodos(todos)

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
