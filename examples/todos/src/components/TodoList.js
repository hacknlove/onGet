import React from 'react'
import Todo from './Todo'
import { set, get, useOnGet } from 'onget'

function toggleTodo (todoId) {
  const todos = get('dotted://todos.items')

  set('dotted://todos.items', todos.map(todo =>
    (todo.id === todoId)
      ? { ...todo, completed: !todo.completed }
      : todo
  ))
}

function filterTodos(todos) {
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
          onClick={() => toggleTodo(todo.id)}
        />
      )}
    </ul>
  )
}
