import { plugins, serverInstances, resources } from './conf'

/**
 * Indicates that the prerrendering has finished and allows the next prerrendering to begin.
 * It is used in server-side prerrendering along with `start`
 *
 * @see start
 */
export function end () {
  Object.keys(resources).forEach(key => delete resources[key])

  plugins.forEach(plugin => {
    if (plugin.end) {
      plugin.end()
    }
  })

  const instance = serverInstances.pop()
  instance.resolve()
}
