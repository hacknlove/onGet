import React from 'react';
import './Card.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useOnGet } from 'onget'
import Chart from './Chart'
import { toggleCity } from '../API'

export default function Card (props: any) {
  const data = useOnGet(`openweathermap://${props.city}`)
  if (!data) {
    return null
  }

  return (
    <div className="cardContainer">
      <div className="card">
        <div className="title">
          {data.name}
          <div onClick={() => toggleCity(props.city)}>
            <FontAwesomeIcon icon={faTimes}/>
          </div>
        </div>
          <div className="body">
            <Chart data={data.data}/>
          </div>
      </div>
    </div>
  )
}
