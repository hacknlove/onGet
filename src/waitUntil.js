import { onGet } from './onGet'

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
