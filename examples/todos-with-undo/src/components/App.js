import React from 'react'
import Footer from './Footer'
import AddTodo from '../components/AddTodo'
import VisibleTodoList from '../components/TodoList'
import UndoRedo from './UndoRedo'

const App = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
    <UndoRedo />
  </div>
)

export default App
