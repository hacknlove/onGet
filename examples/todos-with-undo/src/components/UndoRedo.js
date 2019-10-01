import React from 'react'
import { useOnGet, command } from 'onget'

export default function UndoRedo  () {
  const canRedo = command('history://todos#-1', 'redoLength')
  const canUndo = command('history://todos#1', 'undoLength')

  console.log(canUndo)
  useOnGet('history://todos')

  function undo () {
    command('history://todos', 'undo')
  }
  function redo () {
    command('history://todos', 'redo')
  }

  return (
    <p>
      <button onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo}>
        Redo
      </button>
    </p>
  )
}
