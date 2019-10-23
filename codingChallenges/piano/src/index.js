import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import * as serviceWorker from './serviceWorker'

import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const httpLink = createHttpLink({
	uri: 'http://localhost:4000'
})

const client = new ApolloClient({
	link: httpLink,
	cache: new InMemoryCache()
})

ReactDOM.render(
	<ApolloProvider client={client}>
		<App />
	</ApolloProvider>,
	document.getElementById('root'))

serviceWorker.unregister()
