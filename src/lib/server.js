import { plugins } from './conf'

export const promises = []
export const resolves = []
export async function start () {
  promises.unshift(new Promise(resolve => resolves.unshift(resolve)))
  await promises[1]
  plugins.forEach(plugin => {
    if (plugin.start) {
      plugin.start()
    }
  })
}

export function end () {
  plugins.forEach(plugin => {
    if (plugin.end) {
      plugin.end()
    }
  })

  promises.pop()
  const resolve = resolves.pop()
  resolve()
}
