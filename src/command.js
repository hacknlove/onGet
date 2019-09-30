import { endpoints } from './conf'
import { findPlugin } from './findPlugin'

export function command (url, command, ...params) {
  const endpoint = endpoints[url] || {
    plugin: findPlugin(url)
  }

  if (!endpoint.plugin.commands) {
    console.warn('the plugin does not accept commands')
    return
  }

  if (!endpoint.plugin.commands[command]) {
    console.warn('command not found')
    return
  }

  return endpoint.plugin.commands[command](url, ...params)
}
