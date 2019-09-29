import React from 'react'
import Footer from './Footer'
import AddTodo from '../components/AddTodo'
import VisibleTodoList from '../components/TodoList'

const App = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)

export default App
