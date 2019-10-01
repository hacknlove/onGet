import React from 'react'
import Link from './Link'

const Footer = () => (
  <div>
    <span>Show: </span>
    {" "}
    <Link myFilter="SHOW_ALL">
      All
    </Link>
    {" "}
    <Link myFilter="SHOW_ACTIVE">
      Active
    </Link>
    {" "}
    <Link myFilter="SHOW_COMPLETED">
    Completed
    </Link>
  </div>
)

export default Footer
