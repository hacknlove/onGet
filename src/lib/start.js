import { plugins, serverInstances } from './conf'

/**
 * @summary Wait until the system is free to do a server side prerrender, and then set it to not-free
 */
export async function start () {
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
