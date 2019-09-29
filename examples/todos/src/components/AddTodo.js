import React from 'react'
import { get, set } from 'onget'

let nextTodoId = 0

function addTodo (text) {
  const todos = get('state://todos.items') || []

  set('state://todos.items', [...todos,
    {
      id: nextTodoId++,
      text,
      completed: false
    }
  ])
}

export function AddTodo () {
  let input

  function submit (e) {
    e.preventDefault()
    const text = input.value.trim()
    if (!text) {
      return
    }
    addTodo(text)
    input.value = ''
  }

  return (
    <div>
      <form onSubmit={submit}>
        <input ref={node => { input = node }} />
        <button type="submit">
          Add Todo
        </button>
      </form>
    </div>
  )
}

export default AddTodo
