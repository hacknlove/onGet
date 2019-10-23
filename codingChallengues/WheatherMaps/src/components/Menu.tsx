import React from 'react';
import { useOnGet, set } from 'onget'
import './Menu.scss';
import { toggleCity } from '../API'

export function Menu () {
  const menu = useOnGet('dotted://menu')
  if (!menu || !menu.show) {
    return null
  }
  return (
    <nav>
      <ul>
        {
          menu.items.map((item: any) => <li key={item} onClick={() => {
            toggleCity(item)
            set('dotted://menu.show', false)
          }}>{item}</li>)
        }
      </ul>
    </nav>
  )
}

export default Menu
