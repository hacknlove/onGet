/**
 * Function factory that creates and returns unsubscribe functions
 * @private
 * @param {object} resource from which unsubscribe
 * @param {strink} sk key that identifies the subscription
 * @returns {Function} function that removes a subscription
 */
export function createUnsubscribe (resource, sk) {
  return () => {
    if (!resource.callbacks.hasOwnProperty(sk)) {
      return
    }

    delete resource.callbacks[sk]
    if (resource.intervals) {
      delete resource.intervals[sk]
      resource.minInterval = Math.min(...Object.values(resource.intervals))
      if (resource.minInterval === 0) {
        clearTimeout(resource.timeout)
      }
    }
  }
}
