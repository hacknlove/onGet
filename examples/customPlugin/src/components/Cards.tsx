import React from 'react';
import Card from '../components/Card'
// @ts-ingore
import { useOnGet } from 'onget'
import './Cards.scss';

export default function Cards () {
  const cards = useOnGet('dotted://cards', { first: [] })
  return (
    <section>
      { cards.map((city: any) => <Card city={city} key={city}></Card>) }
    </section>
  )
}
