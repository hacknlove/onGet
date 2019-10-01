import React from 'react'
import Link from './Link'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters'
import { useOnGet } from 'onget'
import { clearCompleted, useCount, FILTER_URL } from '../state'

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed'
}

export default function Footer () {
  const filter = useOnGet(FILTER_URL, { first: SHOW_ALL })
  const { todosCount, completedCount } = useCount()

  if (!todosCount) {
    return null
  }
  const activeCount = todosCount - completedCount

  const itemWord = activeCount === 1 ? 'item' : 'items'

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>
      <ul className="filters">
        {Object.keys(FILTER_TITLES).map(myFilter =>
          <li key={myFilter}>
            <Link filter={filter} myFilter={myFilter}>
              {FILTER_TITLES[myFilter]}
            </Link>
          </li>
        )}
      </ul>
      {
        completedCount
          ? (
            <button
              className="clear-completed"
              onClick={clearCompleted}
            >Clear completed</button>
          )
          : null
      }
    </footer>
  )
}
