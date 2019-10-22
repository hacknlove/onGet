import React from 'react'
import { render } from 'react-dom'
import generateTree from './generateTree'
import Node from './containers/Node'
import { set } from 'onget'

const tree = generateTree()
set('dotted://tree', tree)
render(
  <Node id={0} />,
  document.getElementById('root')
)
