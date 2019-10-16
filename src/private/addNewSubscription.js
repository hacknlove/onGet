import { resources } from '../lib/conf'
import { createUnsubscribe } from './createUnsubscribe'

/**
 * Adds the callback to the resource, updates the min interval configuration, and returns the unsubscribe function
 * @private
 * @param {string} url resource's url
 * @param {function} callback it will be called each time the value of the resource changes
 * @param {number} [interval] max interval (milliseconds) to check for a new value
 * @return {function} unsubscribe function
 */
export function addNewSubscription (url, callback, interval) {
  const resource = resources[url]

  var sk
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36)
  } while (resource.callbacks[sk])
  resource.callbacks[sk] = callback

  if (resource.intervals) {
    interval = interval || resource.plugin.checkInterval
    resource.intervals[sk] = interval
    resource.minInterval = Math.min(resource.minInterval, interval)
  }

  return createUnsubscribe(resource, sk)
}
