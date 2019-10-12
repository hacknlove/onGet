import React from 'react'
import { set, useOnGet } from 'onget'

export default function App ({ props }) {
  const value = useOnGet(`dotted://${props.counterKey}`, { first: props.firstValue || 0 })

  return (
    <p>
    Clicked: {counter} times
    {' '}
    <button onClick={increment}>+</button>
    {' '}
    <button onClick={decrement}>-</button>
    {' '}
    <button onClick={incrementIfOdd}>Increment if odd</button>
    {' '}
    <button onClick={() => incrementAsync()}>Increment async</button>
  </p>
  )
}
