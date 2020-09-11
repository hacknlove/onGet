import { plugins, serverInstances, resources } from './conf'

/**
 * Indicates that the prerrendering has finished and allows the next prerrendering to begin.
 * It is used in server-side prerrendering along with `start`
 *
 * @param cb
 * @see start
 */
export function end (cb) {
  if (typeof setImmediate === 'undefined') {
    return cb
  }

  return function (...params) {
    let result
    try {
      result = cb(...params);
    } finally {
      Object.keys(resources).forEach(key => delete resources[key])

      plugins.forEach(plugin => {
        if (plugin.end) {
          plugin.end()
        }
      })

      const instance = serverInstances.pop()
      if (instance) {
        instance.resolve()
      }
    }
    return result || null
  }
}
