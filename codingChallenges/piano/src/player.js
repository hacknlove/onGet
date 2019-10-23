import { set } from 'onget'
import { MAIN_STATUS, PLAYING_ID, ACTIVE_NOTES } from './constants'
var song
var currentTimeout
export function startReproduction ({ id, events }) {
	song = {
		events,
		index: 0
	}
	playNext()
	set(MAIN_STATUS, 'PLAYING')
	set(PLAYING_ID, id)
}

export function stopReproduction () {
	clearTimeout(currentTimeout)
	set(MAIN_STATUS, 'STOP')
	set(PLAYING_ID, undefined)
}

function playNext () {
	const current = song
		? song.events[song.index++] || { activeNotes: [] }
		: {
			activeNotes: []
		}
	console.log(current)
	set(ACTIVE_NOTES, current.activeNotes)

	if (current.duration === undefined) {
		set(PLAYING_ID, undefined)
		return set(MAIN_STATUS, 'STOP')
	}
	currentTimeout = setTimeout(playNext, current.duration)
}
