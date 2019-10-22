import React from 'react'
import { useOnGet, set } from 'onget'

export function Picker ({ options }) {
  const subReddit = useOnGet('fast://subReddit', { first: options[0] })

  return (
    <span>
      <h1>{subReddit}</h1>
      <select onChange={e => set('fast://subReddit', e.target.value)} value={subReddit}>
        {options.map(option =>
          <option value={option} key={option}>
            {option}
          </option>)
        }
      </select>
    </span>
  )
}

export default Picker
