import React from 'react'
import Todo from './Todo'
import { useOnGet } from 'onget'

function filterTodos (todos, filter) {
  let filterFunction

  switch (filter) {
    case 'SHOW_COMPLETED':
      filterFunction = (todo) => todo.completed
      break
    case 'SHOW_ACTIVE':
      filterFunction = (todo) => !todo.completed
      break
    default:
      filterFunction = () => true
  }

  return todos.filter(filterFunction)
}

export default function TodoList () {
  const todos = useOnGet('history://todos', { first: [] })
  const filter = useOnGet('dotted://filter', { first: 'SHOW_ALL' })
  const filtered = filterTodos(todos, filter)

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
