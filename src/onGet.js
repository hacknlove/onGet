import { getEndpoint } from './getEndpoint'
import { addNewSuscription } from './addNewSuscription'
import { refresh } from './refresh'

export function onGet (url, cb, interval, first) {
  const endpoint = getEndpoint(url, first)
  const unsuscribe = addNewSuscription(url, cb, interval)
  endpoint.clean = undefined

  if (endpoint.value !== undefined) {
    cb(endpoint.value)
  }
  if (Date.now() - endpoint.last > endpoint.threshold) {
    refresh(url)
  }
  return unsuscribe
}
