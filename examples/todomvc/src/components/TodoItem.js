import React, { useState } from 'react'
import classnames from 'classnames'
import TodoTextInput from './TodoTextInput'

import { deleteTodo, saveTodo, completeTodo } from '../state'

export default function TodoItem ({ todo }) {
  const { id } = todo
  const [editing, setediting] = useState(false)

  function handleDoubleClick () {
    setediting(true)
  }

  function onSave (text) {
    saveTodo(id, text)
    setediting(false)
  }

  return (
    <li className={classnames({
      completed: todo.completed,
      editing: editing
    })}>
      {
        editing
          ? (
            <TodoTextInput text={todo.text} editing={editing} onSave={onSave} />
          )
          : (
            <div className="view">
              <input className="toggle"
                type="checkbox"
                checked={todo.completed}
                onChange={() => completeTodo(id)} />
              <label onDoubleClick={handleDoubleClick}>
                {todo.text}
              </label>
              <button className="destroy"
                onClick={() => deleteTodo(id)} />
            </div>
          )
      }
    </li>
  )
}
