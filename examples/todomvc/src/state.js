import { get, set, useOnGet } from 'onget'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from './constants/TodoFilters'

export const TODOS_URL = 'dotted://todos'
export const FILTER_URL = 'dotted://filter'

export function completeAllTodos () {
  const todos = get(TODOS_URL)
  const completed = !todos.every(todo => todo.completed)

  set(TODOS_URL, todos.map(todo => ({ ...todo, completed })))
}

export function clearCompleted () {
  const todos = get(TODOS_URL)

  set(TODOS_URL, todos.filter(todo => !todo.completed))
}

export function addTodo (text) {
  if (text.length === 0) {
    return
  }

  const todos = get(TODOS_URL)

  set(TODOS_URL, [...todos, {
    id: Date.now(),
    completed: false,
    text
  }])
}

export function setFilter (filter) {
  set(FILTER_URL, filter)
}

export function saveTodo (id, text) {
  if (text.length === 0) {
    return deleteTodo(id)
  }

  const todos = get('dotted://todos')
  if (text.length === 0) {
    deleteTodo(id)
  } else {
    set('dotted://todos', todos.map(todo => {
      if (todo.id === id) {
        todo.text = text
      }
      return todo
    }))
  }
}

export function completeTodo (id) {
  const todos = get('dotted://todos')
  set('dotted://todos', todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed }
    }
    return todo
  }))
}

export function deleteTodo (id) {
  const todos = get('dotted://todos')
  set('dotted://todos', todos.filter(todo => todo.id !== id))
}

export function useCount () {
  const todos = useOnGet(TODOS_URL, { first: [] })
  return {
    todosCount: todos.length,
    completedCount: todos.reduce((count, item) => (item.completed ? count + 1 : count), 0)
  }
}

export function useFilterTodos () {
  const todos = useOnGet(TODOS_URL, { first: [] })
  const filter = useOnGet(FILTER_URL, { first: SHOW_ALL })

  switch (filter) {
    case SHOW_COMPLETED:
      return todos.filter(todo => todo.completed)
    case SHOW_ACTIVE:
      return todos.filter(todo => !todo.completed)
    default:
      return todos
  }
}
