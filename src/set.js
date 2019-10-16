import { isDifferent } from 'isdifferent'
import { endpoints, setHooks } from './conf'
import { getEndpoint } from './getEndpoint'
import { pospone } from './pospone'
import pathToRegExp from 'path-to-regexp'

export function _set (endpoint, value, preventRefresh) {
  if (!isDifferent(value, endpoint.value)) {
    return
  }
  const oldValue = endpoint.value
  endpoint.value = value
  if (endpoint.plugin.set) {
    endpoint.plugin.set(endpoint, oldValue, preventRefresh)
  }
  if (!preventRefresh) {
    Object.values(endpoint.callbacks).forEach(cb => cb(endpoint.value))
  }
}

/**
 * set a new cached value for an endpoint, and call the handlers. If the endpoint does not exists, it creates it.
 * @param {string} url  of the endpoint whose value set to
 * @param {any} value value to series
 * @param {boolean} doPospone=true if false do not pospone the closest refresh
 * @return {object} endpoint
 */
export function set (url, value, doPospone) {
  const beforeResult = executeHooks(setHooks.before, {
    url,
    value,
    doPospone
  })
  if (beforeResult.preventSet) {
    return
  }
  const endpoint = endpoints[url]
  value = beforeResult.value
  doPospone = beforeResult.doPospone

  if (!endpoint) {
    const endpoint = getEndpoint(url, value)
    if (endpoint.plugin.set) {
      endpoint.value = value
      endpoint.plugin.set(endpoint)
    }
    return executeHooks(setHooks.after, {
      url,
      value,
      doPospone
    })
  }

  const oldValue = endpoint.value

  endpoint.clean = undefined
  if (endpoint.intervals && doPospone) {
    pospone(endpoint)
  }
  _set(endpoint, value, beforeResult.preventRefresh)
  return executeHooks(setHooks.after, {
    url,
    doPospone,
    oldValue,
    value
  })
}

export function executeHooks (where, event) {
  for (let i = 0, z = where.length; i < z; i++) {
    if (event.preventMoreHooks) {
      break
    }
    const [regex, keys, cb] = where[i]
    const match = event.url.match(regex)
    if (!match) {
      continue
    }
    event.params = {}
    for (let i = 1; i < match.length; i++) {
      event.params[keys[i - 1].name] = match[1]
    }

    cb(event)
  }

  return event
}

export function insertHook (path, hook, where) {
  const keys = []
  const regex = pathToRegExp(path, keys)
  where.push([regex, keys, hook])
}

export async function beforeSet (path, hook) {
  insertHook(path, hook, setHooks.before)
}

export async function afterSet (path, hook) {
  insertHook(path, hook, setHooks.after)
}
