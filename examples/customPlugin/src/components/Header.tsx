import React from 'react'
import './Header.scss'
import { useOnGet, set } from 'onget'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

export default function Header () {
  const menuShow = useOnGet('dotted://menu.show')
  return (
    <header className={menuShow ? 'open' : 'close'}>
      <img src="/logo.svg" alt="" />
      <span>
        onGet custom plugin example
      </span>
      <div onClick={() => set('dotted://menu.show', !menuShow)} >
        <FontAwesomeIcon icon={faPlus} />
      </div>
    </header>
  )
}
