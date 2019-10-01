import React from 'react'
import classnames from 'classnames'

import { setFilter } from '../state'

export default function ({ filter, myFilter, children }) {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      className={classnames({ selected: filter === myFilter })}
      style={{ cursor: 'pointer' }}
      onClick={() => setFilter(myFilter)}
    >
      {children}
    </a>
  )
}
