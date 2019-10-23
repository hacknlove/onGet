import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons'
import './song.scss'
import { useOnGet } from 'onget'
import { startReproduction, stopReproduction } from '../player'
import { PLAYING_ID } from '../constants'

export default function Song ({ song }) {
	const songId = useOnGet(PLAYING_ID)

	var status

	if (!songId) {
		status = 'STOP'
	} else if (songId === song.id) {
		status = 'PLAYING'
	} else {
		status = 'PLAYINGOTHER'
	}

	function onClick () {
		if (status === 'PLAYINGOTHER') {
			return
		}
		if (status === 'PLAYING') {
			stopReproduction()
		} else {
			startReproduction(song)
		}
	}

	return (
		<div className={status} onClick={onClick}>
			<span className="controls">
				<FontAwesomeIcon className="start" icon={faPlay} />
				<FontAwesomeIcon className="stop" icon={faStop} />
			</span>
			<span className="title">{song.title}</span>
		</div>
	)
}
