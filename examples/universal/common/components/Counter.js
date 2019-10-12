import React from 'react'
import { set, useOnGet } from 'onget'

export default function Counter ({ url, label, firstValue }) {

  const value = useOnGet(url, { first: firstValue || 0 })

  function sum (x) {
    set(url, value + x)
  }

  return (
    <p>
      {label } Clicked: {value} times

      <button onClick={() => sum(1)}>W
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
