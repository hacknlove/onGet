import { onGet } from './onGet'

/**
 * Used with await, stops the execution of a function until the resorce value meets some condition that defaults to be truthy
 *
 * @param {*} url the url of the resource
 * @param {*} condition the condition that should be met
 * @returns {Promise} A promise that will be resolved when the condition will be met
 */
export function waitUntil (url, condition = value => value) {
  return new Promise(resolve => {
    const unsubscribe = onGet(url, value => {
      if (condition(value, url)) {
        unsubscribe()
        resolve(value)
      }
    })
  })
}
