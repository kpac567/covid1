import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { Router} from 'react-router-dom'
import { setContext } from 'apollo-link-context'
import { AUTH_TOKEN } from './constants'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { createBrowserHistory } from "history";

import 'bootstrap/dist/css/bootstrap.css';

const httpLink = createHttpLink({
  uri: 'https://jkudating.herokuapp.com/', //http://localhost:4000'//
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const wsLink = new WebSocketLink({
  uri: 'wss://jkudating.herokuapp.com/',
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    },
  },
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink),
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

const history = createBrowserHistory();

ReactDOM.render(
  <Router history={history}>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </Router>,
  document.getElementById('root'),
)
serviceWorker.unregister()
