import { plugins, serverInstances } from './conf'

/**
 * @summary Indicates that the prerrendering has finished and allows the next prerrendering to begin
 */
export function end () {
  plugins.forEach(plugin => {
    if (plugin.end) {
      plugin.end()
    }
  })

  const instance = serverInstances.pop()
  instance.resolve()
}
