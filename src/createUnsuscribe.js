/**
 * Function factory that creats and returns unsuscribe functions
 * @param {object} endpoint from which unsuscribe
 * @param {strink} sk key that identifies the suscription
 */
export function createUnsuscribe (endpoint, sk) {
  return () => {
    if (!endpoint.callbacks.hasOwnProperty(sk)) {
      return
    }

    if (endpoint.plugin.unsuscribe) {
      endpoint.plugin.unsuscribe(endpoint)
    }

    delete endpoint.callbacks[sk]
    if (endpoint.intervals) {
      delete endpoint.intervals[sk]
      endpoint.minInterval = Math.min(...Object.values(endpoint.intervals))
    }
  }
}
