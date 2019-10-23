import React from 'react'
import './App.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlayCircle, faStopCircle } from '@fortawesome/free-solid-svg-icons'
import { useOnGet } from 'onget'
import MyPiano from './myPiano'
import SongList from './SongList'
import SaveSong from './saveSong'
import { startRecord, stopRecord } from '../recorder'
import { MAIN_STATUS } from '../constants'

export default function App () {
	var mainStatus = useOnGet(MAIN_STATUS, { first: 'STOP' })

	if (mainStatus === 'SAVING') {
		return (<SaveSong/>)
	}

	return (
		<div id ="app" className={mainStatus}>
			<SongList/>
			<div id="buttons">
				<button className="start record" onClick={startRecord}>
					<FontAwesomeIcon icon={faPlayCircle}/> Record
				</button>
				<button className="stop record" onClick={stopRecord}>
					<FontAwesomeIcon icon={faStopCircle} /> Stop Recording
				</button>
			</div>
			<MyPiano/>
		</div>
	)
}

// componentDidMount () {
//   listen(events.SONG_SAVED, () => {
//     delete this.song
//     this.setState({ status: 'STOP' })
//   })

//   listen(events.ERROR, () => {
//   })

//   listen(events.REPRODUCTION_STARTED, () => {
//     this.setState({ status: 'PLAYING' })
//   })

//   listen(events.REPRODUCTION_STOPPED, () => {
//     this.setState({ status: 'STOP' })
//   })
//   listen(events.RECORD_STARTED, () => {
//     this.setState({ status: 'RECORDING' })
//   })
// }
