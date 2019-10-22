import React from 'react'
import { set, useOnGet, command, get } from 'onget'
function handleIncrementClick (id, counter) {
  set(`dotted://tree.${id}.counter`, counter + 1)
}

let nextId = 2000
function handleAddChildClick (e, node) {
  e.preventDefault()
  set(`dotted://tree.${node.id}`, {
    ...node,
    childIds: [...node.childIds, ++nextId]
  })
  set(`dotted://tree.${nextId}`, {
    id: nextId,
    childIds: [],
    counter: 0
  })
}

function handleRemoveClick (e, id, parentId) {
  e.preventDefault()
  const sibbling = get(`dotted://tree.${parentId}.childIds`)
  set(`dotted://tree.${parentId}.childIds`, sibbling.filter(sibid => id !== sibid))
  command(`dotted://tree.${id}`, 'remove')
}

function renderChild (childId, id) {
  return (
    <li key={childId}>
      <Node id={childId} parentId={id} />
    </li>
  )
}

export default function Node ({ id, parentId }) {
  const node = useOnGet(`dotted://tree.${id}`)
  const { counter, childIds } = node

  return (
    <div>
      Counter: {counter}
      {' '}
      <button onClick={() => handleIncrementClick(id, counter)}>
        +
      </button>
      {' '}
      {parentId !== undefined &&
        <a href="#" onClick={e => handleRemoveClick(e, id, parentId)} // eslint-disable-line jsx-a11y/anchor-is-valid
          style={{ color: 'lightgray', textDecoration: 'none' }}>
          ×
        </a>
      }
      <ul>
        {childIds.map(childId => renderChild(childId, id))}
        <li key="add">
          <a href="#" // eslint-disable-line jsx-a11y/anchor-is-valid
            onClick={e => handleAddChildClick(e, node)}
          >
            Add child
          </a>
        </li>
      </ul>
    </div>
  )
}
