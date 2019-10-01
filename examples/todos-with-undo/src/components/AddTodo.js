import React from 'react'
import { get, set } from 'onget'

function addTodo (text) {
  const todos = get('history://todos') || []

  set('history://todos', [
    ...todos,
    {
      id: Date.now(),
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
