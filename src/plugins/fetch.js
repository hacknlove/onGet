/* global fetch */
import { conf } from '../lib/conf'

export default {
  name: 'fetch',
  regex: /^./,
  async refresh (resource) {
    const response = await fetch(resource.url).catch(__error => ({ __error }))
    if (response.__error) {
      return response.__error
    }
    const raw = await response.text()
    let value
    try {
      value = JSON.parse(raw)
    } catch (e) {
      value = raw
    }
    return value
  },
  start () {
    conf.plugins.fetch.checkInterval = undefined
    conf.plugins.fetch.threshold = undefined
  }
}
