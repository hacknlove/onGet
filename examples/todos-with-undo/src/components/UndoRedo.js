import React from 'react'
import { useOnGet, command } from 'onget'

export default function UndoRedo () {
  useOnGet('history://todos')
  const canRedo = command('history://todos', 'redoLength')
  const canUndo = command('history://todos', 'undoLength')

  return (
    <p>
      <button onClick={() => command('history://todos', 'undo')} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={() => command('history://todos', 'redo')} disabled={!canRedo}>
        Redo
      </button>
    </p>
  )
}
