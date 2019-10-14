import { endpoints, plugins } from './conf'

export function import (data) {
  plugins.forEach(plugin => {
    if (!plugin.import) {
      return
    }
    if (!data.plugins[plugin.name]) {
      return
    }
    plugin.import(data.plugins[plugin.name])
  })
}
