import { set } from 'onget'
import { MAIN_STATUS } from './constants'

var record

export function startRecord () {
	set(MAIN_STATUS, 'RECORDING')
	record = {
		events: [],
		lastEventTimestamp: Date.now(),
		currentEvent: {
			activeNotes: []
		}
	}
}

export function stopRecord () {
	endCurrentEvent()
	set(MAIN_STATUS, 'SAVING')
	set('fast://record', record.events)
	record = undefined
}

function endCurrentEvent () {
	const currentEventTimestamp = Date.now()
	record.currentEvent.duration = currentEventTimestamp - record.lastEventTimestamp
	record.events.push(record.currentEvent)
	record.lastEventTimestamp = currentEventTimestamp
}

export function newCurrentEvent (activeNotes) {
	record.currentEvent = {
		activeNotes: Array.from(new Set(activeNotes))
	}
}

export function notePress (midiNumber, { prevActiveNotes, ...other }) {
	console.log('press', midiNumber)
	if (!record) {
		return
	}
	endCurrentEvent()

	newCurrentEvent([midiNumber, ...prevActiveNotes.filter(e => e !== record.lastStop)])
	record.lastStop = undefined
}

export function noteRelease (midiNumber, { prevActiveNotes, ...other }) {
	console.log('release', midiNumber, prevActiveNotes, other)
	if (!record) {
		return
	}
	if (!prevActiveNotes.includes(midiNumber)) {
		return
	}
	endCurrentEvent()

	newCurrentEvent(prevActiveNotes.filter(note => note !== midiNumber))

	record.lastStop = midiNumber
}
