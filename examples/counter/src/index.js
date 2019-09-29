import React from 'react'
import ReactDOM from 'react-dom'
import Counter from './components/Counter'

function App () {
  return (
    <>
      <Counter counterKey="myCounter1" label="counter 1" firstValue={0}/>
      <Counter counterKey="myCounter2" label="counter 2" firstValue={100}/>
    </>
  )
}

const rootEl = document.getElementById('root')

const render = () => ReactDOM.render(
  <App/>,
  rootEl
)

render()
