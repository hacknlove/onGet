import React from 'react'
import Counter from './Counter'

export default function App () {
  return (
    <div>
      {/* <Counter url="dotted://counter" label="dotted" firstValue={0}/> */}
      <Counter url="localStorage://counter" label="localStorage" firstValue={0}/>
      {/* <Counter url="/api/v1/counter" label="api" firstValue={0}/> */}
    </div>
  )
}
