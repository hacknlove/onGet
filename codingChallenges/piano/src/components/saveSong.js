import React, { useState } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import './saveSong.scss'
import { useOnGet, set } from 'onget'
import { MAIN_STATUS } from '../constants'

const ADD_SONG = gql`
  mutation AddSongMutation($title: String!, $events: [EventInput]!) {
	addSong(title: $title, events: $events) {
		id
		title
		events{
			activeNotes
			duration
		}
	}
}
`

export default function SaveSong () {
	const [title, settitle] = useState('')
	const events = useOnGet('fast://record')
	function onSaved () {
		set(MAIN_STATUS, 'STOP')
	}
	function onError (error) {
		console.log(error)
		window.alert('ERROR')
		set(MAIN_STATUS, 'STOP')
	}
	return (
		<div id="saveSong">
			<div>
				<input
					onChange={e => { settitle(e.currentTarget.value) }}
					type="text"
					placeholder="Write here the title of your new song"
				/>
				<Mutation
					mutation={ADD_SONG}
					variables={{ title, events }}
					onCompleted={onSaved}
					onError={onError}
				>
					{AddSongMutation => (
						<button onClick={AddSongMutation}>
							Submit
						</button>
					)}
				</Mutation>
			</div>
		</div>
	)
}
