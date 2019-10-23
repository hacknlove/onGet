import React from 'react'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano'
import SoundfontProvider from './SoundfontProvider'
import 'react-piano/dist/styles.css'
import './myPiano.scss'
import { useOnGet } from 'onget'
import { notePress, noteRelease } from '../recorder'
import { ACTIVE_NOTES } from '../constants'

const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net'

const myNoteRange = {
	first: MidiNumbers.fromNote('c3'),
	last: MidiNumbers.fromNote('f4')
}

const myKeyboardShortcuts = KeyboardShortcuts.create({
	firstNote: myNoteRange.first,
	lastNote: myNoteRange.last,
	keyboardConfig: KeyboardShortcuts.HOME_ROW
})

export default function MyPiano () {
	const activeNotes = useOnGet(ACTIVE_NOTES)

	return (
		<SoundfontProvider
			instrumentName='acoustic_grand_piano'
			audioContext={audioContext}
			hostname={soundfontHostname}
			render={({ isLoading, playNote, stopNote }) => (
				<div id="piano">
					<div className="piano">
						<Piano
							noteRange={myNoteRange}
							playNote={playNote}
							stopNote={stopNote}
							disabled={isLoading}
							activeNotes={activeNotes}
							keyboardShortcuts={myKeyboardShortcuts}
							onPlayNoteInput={notePress}
							onStopNoteInput={noteRelease}
						/>
					</div>
				</div>
			)}
		/>
	)
}
