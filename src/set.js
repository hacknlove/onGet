import { isDifferent } from 'isdifferent'
import { endpoints, setHooks } from './conf'
import { getEndpoint } from './getEndpoint'
import { pospone } from './pospone'
import pathToRegExp from 'path-to-regexp'
/**
 * set a new cached value for an endpoint, and call the handlers. If the endpoint does not exists, it creates it.
 * @param {string} url  of the endpoint whose value set to
 * @param {any} value value to series
 * @param {boolean} doPospone=true if false do not pospone the closest refresh
 * @return {object} endpoint
 */

export async function set (url, value, doPospone) {
  const beforeResult = await executeHooks(url, value, setHooks.before, doPospone)
  if (beforeResult.preventSet) {
    return
  }
  value = beforeResult.value
  doPospone = beforeResult.doPospone

  const endpoint = endpoints[url]
  if (!endpoint) {
    const endpoint = getEndpoint(url, value)
    if (endpoint.plugin.set) {
      endpoint.value = value
      endpoint.plugin.set(endpoint)
    }
    return executeHooks(url, value, setHooks.after, doPospone)
  }

  endpoint.clean = undefined
  if (endpoint.intervals && doPospone) {
    pospone(endpoint)
  }
  if (!isDifferent(value, endpoint.value)) {
    return executeHooks(url, value, setHooks.after, doPospone)
  }

  endpoint.value = value
  if (endpoint.plugin.set) {
    endpoint.plugin.set(endpoint)
  }
  if (!beforeResult.preventRefresh) {
    Object.values(endpoint.callbacks).forEach(cb => cb(endpoint.value))
  }
  return executeHooks(url, value, setHooks.after, doPospone)
}

export async function executeHooks (url, value, where, doPospone) {
  const event = {
    doPospone,
    url,
    value,
    preventSet: false,
    preventRefresh: false,
    preventMoreHooks: false,
    redirect (newUrl) {
      event.preventMoreHooks = true
      event.preventSet = true
      set(newUrl, event.value, where, doPospone)
    }
  }

  for (let i = 0, z = where.length; i < z; i++) {
    if (event.preventMoreHooks) {
      break
    }
    const { regex, keys, cb } = where[i]
    const match = url.match(regex)
    if (!match) {
      continue
    }
    event.params = {}
    for (let i = 1; i < match.length; i++) {
      event.params[keys[i - 1].name] = match[1]
    }

    await cb(event)
  }

  return event
}

export function insertHook (path, hook, where) {
  const keys = []
  const regex = pathToRegExp(path)
  where.push([regex, keys, hook])
}

export async function beforeSet (path, hook) {
  insertHook(path, hook, setHooks.before)
}

export async function afterSet (path, hook) {
  insertHook(path, hook, setHooks.after)
}
