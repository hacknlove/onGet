import { endpoints, plugins } from './conf'

export function export (options = {}) {
  const exported = {
    endpoints: [],
    plugins: {}
  }

  Object.values(endpoints).forEach(endpoint => {
    const exportedEndpoint = {
      url: endpoint.url,
      value: endpoint.value
    } = endpoint

    if (endpoint.plugin.exportEndpoint) {
      endpoint.plugin.exportEndpoint(exportedEndpoint)
    }

    if (!exportedEndpoint.skipEndpoint) {
      exported.endpoints.push(exportedEndpoint)
    }
  })

  plugins.forEach(plugin => {
    if (plugin.export) {
      plugins[plugin.name] = plugin.export(options[plugin.name])
    }
  })

  return exported
}
