import React from 'react'
import { render } from 'react-dom'
import generateTree from './generateTree'
import Node from './containers/Node'
import { set } from 'onget'

const tree = generateTree()

console.log(tree)

set('dotted://tree', tree)

render(
  <Node path="0" doNotRemove={true} />,
  document.getElementById('root')
)
