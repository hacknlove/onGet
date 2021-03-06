import { plugins, serverInstances } from './conf'

/**
 * @summary Wait until the system is free to do a server side prerrender, and then set it to not-free
 */
async function _start () {
  const instance = {}

  instance.promise = new Promise(resolve => { instance.resolve = resolve })

  serverInstances.unshift(instance)

  if (serverInstances[1]) {
    await serverInstances[1].promise
  }

  plugins.forEach(plugin => {
    if (plugin.start) {
      plugin.start()
    }
  })
}

export function start (props) {
  const propsIsFunction = typeof props === 'function'
  const isSSR = typeof setImmediate === 'function'

  if (!propsIsFunction) {
    if (isSSR) {
      return _start().then(() => ({ props: {} }))
    }
    return () => ({ props: {} })
  }

  if (!isSSR) {
    return props
  }
  return async (...params) => {
    await _start()
    return props(...params)
  }
}
