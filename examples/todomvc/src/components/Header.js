import React from 'react'
import TodoTextInput from './TodoTextInput'
import { addTodo } from '../state'

export default function Header () {
  return (
    <header className="header">
      <h1>todos</h1>
      <TodoTextInput
        newTodo
        onSave={addTodo}
        placeholder="What needs to be done?"
      />
    </header>
  )
}
