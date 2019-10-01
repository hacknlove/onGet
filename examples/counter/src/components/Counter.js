import React from 'react'
import { set, useOnGet } from 'onget'

export default function Counter (props) {

  const value = useOnGet(`dotted://${props.counterKey}`, { first: props.firstValue || 0 })

  function sum (x) {
    set(`dotted://${props.counterKey}`, value + x)
  }

  function onIncrement () {
    sum(1)
  }

  function onDecrement () {
    sum(-1)
  }

  function incrementIfOdd () {
    if (value % 2 !== 0) {
      onIncrement()
    }
  }

  function incrementAsync () {
    setTimeout(onIncrement, 1000)
  }

  return (
    <p>
      {props.label } Clicked: {value} times

      <button onClick={onIncrement}>
        +
      </button>

      <button onClick={onDecrement}>
        -
      </button>

      <button onClick={incrementIfOdd}>
        Increment if odd
      </button>

      <button onClick={incrementAsync}>
        Increment async
      </button>
    </p>
  )
}
