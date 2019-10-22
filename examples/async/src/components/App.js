import React from 'react'
import Picker from './Picker'
import Posts from './Posts'
import { useOnGet } from 'onget'

export default function App () {
  const options = ['reactjs', 'frontend']
  const subReddit = useOnGet('fast://subReddit', { first: options[0] })

  const url = `https://www.reddit.com/r/${subReddit}.json`

  return (
    <div>
      <Picker options={options}/>
      <Posts url={url}/>
    </div>
  )
}
