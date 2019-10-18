import { resources } from './conf'
import { findPlugin } from '../private/findPlugin'

/**
 * @summary Executes a command defined in a plugin, for an url
 *
 * @param {string} url the resource url
 * @param {string} command the command name
 * @param {...any} params the parameters to the command
 * @returns {any} The returned value of the plugin's command call
 * @example
 * import { command } from 'onget'
 *
 * command('history://contact-form', 'undo')
 */
export function command (url, command, ...params) {
  const resource = resources[url] || {
    plugin: findPlugin(url)
  }

  if (!resource.plugin.commands) {
    console.warn('the plugin does not accept commands')
    return
  }

  if (!resource.plugin.commands[command]) {
    console.warn('command not found')
    return
  }

  return resource.plugin.commands[command](url, ...params)
}
