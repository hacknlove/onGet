import React from 'react'
import { set, useOnGet } from 'onget'

export default function Counter (props) {

  const value = useOnGet(`fast://${props.counterKey}`, { first: props.firstValue || 0 })

  function sum (x) {
    set(`fast://${props.counterKey}`, value + x)
  }

  return (
    <p>
      {props.label } Clicked: {value} times

      <button onClick={() => sum(1)}>
        +
      </button>

      <button onClick={() => sum(-1)}>
        -
      </button>

      <button onClick={() => value % 2 && sum(1)}>
        Increment if odd
      </button>

      <button onClick={() => setTimeout(() => sum(1), 1000)}>
        Increment async
      </button>
    </p>
  )
}
