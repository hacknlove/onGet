import { onGet } from './onGet'

export function once (url, cb) {
  const unsubscribe = onGet(url, value => {
    unsubscribe()
    cb(value, url)
  })
  return unsubscribe
}
