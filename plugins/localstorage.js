/* global localstorage */
import { getValue, setValue, deleteValue } from '@hacknlove/deepobject'
import { refresh } from '../src/refresh'

function escapeDots (dotted) {
  return  dotted
    .replace(/,/g, ',,')
    .replace(/\./g, ',')
}

function escapeDots (escaped) {
  return escaped.replace(/,./g, a => {
    return a[1] === ',' ? '.' : ''
  })
}

const endpoints = {}

const regex = /^localstorage:\/\/(.*?)(\/([^/]*))?$/

export function getEndpointDeep (endpoint) {
  const value = getValue(localstorage[endpoint.key], endpoint.path)

  if (value !== undefined) {
    endpoint.value = value
    return
  }
  setValue(localstorage[endpoint.key], endpoint.path, endpoint.value)
}

export function getEndpointSimple (endpoint) {
  if (localstorage[endpoint.key] !== undefined) {
    endpoint.value = localstorage[endpoint.key]
    return
  }
  localstorage[endpoint.key] = endpoint.value
}

export const plugin = {
  name: 'localstorage',
  regex: /^localstorage:\/\/./,
  checkInterval: 30,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    if (endpoint.path) {
      eventHandler(getValue(localstorage[endpoint.key], endpoint.path))
    } else {
      eventHandler(localstorage[endpoint.key])
    }
  },
  getEndpoint (endpoint) {
    const parse = endpoint.url.match(regex)
    if (parse === null) {
      throw new Error('URL cannot be parsed by plugin localstorage')
    }
    endpoint.key = parse[1]
    endpoint.path = parse[3]

    setValue(endpoints, `${endpoint.key}.${endpoint.path}`, url)

    if (endpoint.path) {
      getEndpointDeep(endpoint)
    } else {
      getEndpointSimple(endpoint)
    }
  },
  clean (endpoint) {
    deleteValue(endpoints, `${endpoint.key}.${endpoint.path}`)

    if (!endpoints[endpoint.key]) {
      return
    }
    if (!endpoints[endpoint.key][endpoint.path]) {
      return
    }

  },
  get (url) {
    const parse = url.match(regex)
    if (parse === null) {
      throw new Error('URL cannot be parsed by plugin localstorage')
    }
    const key = parse[1]
    const path = parse[3]

    if (path) {
      return getValue(localstorage[key], path)
    }
    return localstorage[key]
  }
}
