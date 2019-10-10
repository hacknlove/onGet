import React from 'react'
import { get, set, useOnGet, command } from 'onget'

let newId = 0

function increment (path) {
  const counter = get(`dotted://tree.${path}.counter`)

  set(`dotted://tree.${path}.counter`, counter + 1)
}

function remove (e, path) {
  e.preventDefault()
  command(`dotted://tree.${path}`, 'remove')
}

function addChild (e, path) {
  e.preventDefault()
  set(`dotted://tree.${path}.${newId++}`, {
    counter: 0
  })
}

export default function Node ({ path, doNotRemove = null }) {
  const node = useOnGet(`dotted://tree.${path}`)
  if (node === undefined) {
    return null
  }

  const childIds = Object.keys(node).filter(key => key !== 'counter')

  return (
    <div>
      Counter: {node.counter}

      <button onClick={() => increment(path)}>
        +
      </button>

      { doNotRemove || (
        <a href="#" onClick={e => remove(e, path)} // eslint-disable-line jsx-a11y/anchor-is-valid
           style={{ color: 'lightgray', textDecoration: 'none' }}>
          ×
        </a>
      )}
      <ul>
        {childIds.map(childId => <li key={`${path}.${childId}`}><Node path={`${path}.${childId}`}/></li>)}
        <li key="add">
          <a href="#" // eslint-disable-line jsx-a11y/anchor-is-valid
            onClick={e => addChild(e, path)}
          >
            Add child
          </a>
        </li>
      </ul>
    </div>
  )

}
