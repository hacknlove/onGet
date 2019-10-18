import { getValue, setValue, deleteValue } from '@hacknlove/deepobject'
import { isDifferent } from 'isdifferent'
import { resources } from '../lib/conf'

export var state = {}

/**
 * For each resource whose url is a parent of url, update his value and call his callbacks
 *
 * dotted://foo.bar is a parent of dotted://foo.bar.buz
 * @private
 * @param {string} url
 * @returns {undefined}
 */
export function propagateUp (url) {
  const parentUrl = url.replace(/\.?[^.]*$/, '')
  if (!parentUrl) {
    return
  }
  const resource = resources[parentUrl]

  if (resource) {
    resource.value = getValue(state, resource.url)
    Object.values(resource.callbacks).forEach(cb => cb(resource.value))
  }
  propagateUp(parentUrl)
}

/**
 * For each resource whose url is a child of url, if his value has changed, update it and call his callbacks
 *
 * dotted://foo.bar.buz is a parent of dotted://foo.bar
 * @private
 * @param {string} url
 * @returns {undefined}
 */
export function propagateDown (url) {
  const parent = resources[url]
  const prefix = `${url}.`
  Object.keys(resources).forEach(childUrl => {
    if (!childUrl.startsWith(prefix)) {
      return
    }
    const child = resources[childUrl]
    const newChildValue = getValue(parent.value, childUrl.substr(url.length + 1))

    if (isDifferent(newChildValue, child.value)) {
      child.value = newChildValue
      Object.values(child.callbacks).forEach(cb => cb(newChildValue))
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
   * If the state has not value for this resource.url, creates a new updated state
   * else, set resource.value according to the state
   * @param {object} resource
   */
  getResource (resource) {
    const actualValue = getValue(state, resource.url)
    if (actualValue === undefined) {
      state = setValue(state, resource.url, resource.value)
      propagateUp(resource.url)
      propagateDown(resource.url)
      return
    }
    resource.value = actualValue
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
   * Updates the resource.value, and propagates up and down
   * @param {object} resource
   * @returns {undefined}
   */
  set (resource) {
    state = setValue(state, resource.url, resource.value)
    propagateUp(resource.url)
    propagateDown(resource.url)
  },

  /**
   * If there is no children resource, delete the value, and propagate up
   * @param {object} resource
   * @returns {undefined}
   */
  clean (resource) {
    const prefix = `${resource.url}.`
    if (Object.keys(resources).some(url => url.startsWith(prefix))) {
      return
    }
    propagateUp(resource.url)
  },

  start () {
    state = {}
  },

  saveResource (url, savedResource) {
    savedResource.preventSave = true
  },

  save () {
    return Object.keys(state).length ? state : undefined
  },

  load (data) {
    state = data
  },

  commands: {
    remove (url) {
      state = deleteValue(state, url)
      propagateUp(url)
      propagateDown(url)
    }
  }
}
