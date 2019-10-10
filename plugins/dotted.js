import { getValue, setValue, deleteValue } from '@hacknlove/deepobject'
import { isDifferent } from 'isdifferent'
import { endpoints } from '../src/conf'

var state = {}

/**
 * For each endpoint whose url is a parent of url, update his value and call his callbacks
 *
 * dotted://foo.bar is a parent of dotted://foo.bar.buz
 * @param {string} url
 * @returns {undefined}
 */
export function propagateUp (url) {
  const parentUrl = url.replace(/\.?[^.]*$/, '')
  if (!parentUrl) {
    return
  }
  const endpoint = endpoints[parentUrl]

  if (endpoint) {
    endpoint.value = getValue(state, endpoint.url)
    Object.values(endpoint.callbacks).forEach(cb => setTimeout(cb, 0, endpoint.value))
  }
  setTimeout(propagateUp, 0, parentUrl)
}

/**
 * For each endpoint whose url is a child of url, if his value has changed, update it and call his callbacks
 *
 * dotted://foo.bar.buz is a parent of dotted://foo.bar
 * @param {string} url
 * @returns {undefined}
 */
export function propagateDown (url) {
  const parent = endpoints[url]
  const prefix = `${url}.`
  Object.keys(endpoints).forEach(childUrl => {
    if (!childUrl.startsWith(prefix)) {
      return
    }
    const child = endpoints[childUrl]
    const newChildValue = getValue(parent.value, childUrl.substr(url.length + 1))

    if (isDifferent(newChildValue, child.value)) {
      child.value = newChildValue
      Object.values(child.callbacks).forEach(cb => setTimeout(cb, 0, newChildValue))
    }
  })
}

export default {
  name: 'state',
  regex: /^dotted:\/\/./,

  /**
   * Nothing to refresh. shows a warning in the console
   * @returns {undefined}
   */
  refresh () {
    console.warn('the true source for this plugin is client side, so refresh does nothing')
  },

  /**
   * If the state has not value for this endpoint.url, creates a new updated state
   * else, set endpoint.value according to the state
   * @param {object} endpoint
   */
  getEndpoint (endpoint) {
    const actualValue = getValue(state, endpoint.url)
    if (actualValue === undefined) {
      state = setValue(state, endpoint.url, endpoint.value)
      propagateUp(endpoint.url)
      propagateDown(endpoint.url)
      return
    }
    endpoint.value = actualValue
  },

  /**
   * Returns the value at the state
   * @param {string} url
   * @returns {object} the value
   */
  get (url) {
    return getValue(state, url)
  },

  /**
   * Updates the endpoint.value, and propagates up and down
   * @params {object} endpoint
   * @returns {undefined}
   */
  set (endpoint) {
    state = setValue(state, endpoint.url, endpoint.value)
    propagateUp(endpoint.url)
    propagateDown(endpoint.url)
  },

  /**
   * If there is no children endpoint, delete the value, and propagate up
   * @param {object} endpoint
   * @returns {undefined}
   */
  clean (endpoint) {
    const prefix = `${endpoint.url}.`
    if (Object.keys(endpoints).some(url => url.startsWith(prefix))) {
      return
    }
    propagateUp(endpoint.url)
  },

  commands: {
    replace (url) {
      deleteValue(url)
      propagateUp(endpoint.url)
      propagateDown(endpoint.url)
    },
  }
}
