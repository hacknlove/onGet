import React from 'react'
import TodoItem from './TodoItem'
import { useFilterTodos } from '../state'

export default function TodoList ({ todos }) {
  const filtered = useFilterTodos()

  return (
    <ul className="todo-list">
      {filtered.map(todo =>
        <TodoItem key={todo.id} todo={todo}/>
      )}
    </ul>
  )
}
