/**
 * Function factory that creats and returns unsubscribe functions
 * @param {object} endpoint from which unsubscribe
 * @param {strink} sk key that identifies the subscription
 */
export function createUnsubscribe (endpoint, sk) {
  return () => {
    if (!endpoint.callbacks.hasOwnProperty(sk)) {
      return
    }

    delete endpoint.callbacks[sk]
    if (endpoint.intervals) {
      delete endpoint.intervals[sk]
      endpoint.minInterval = Math.min(...Object.values(endpoint.intervals))
    }
  }
}
