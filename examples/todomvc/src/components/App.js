import React from 'react'
import Header from '../components/Header'
import TodoList from '../components/TodoList'
import CompleteAll from '../components/CompleteAll'
import Footer from '../components/Footer'

export default function App () {
  return (
    <div>
      <Header />
      <section className="main">
        <CompleteAll/>
        <TodoList/>
        <Footer/>
      </section>
    </div>
  )
}
