import { VarResource } from './var'

export class ApiResource extends VarResource {
  constructor (url, {
    method = 'GET',
    endpoint,
    headers,
    data,
    debounce = 0,
    defaultError,
    ...options
  }, plugin) {
    super(url, options)
    this.plugin = plugin
    this.fetchOptions = {
      method,
      endpoint,
      headers,
      defaultError,
      data
    }
    this.debounce = debounce
  }

  set endpoint (url) {
    this.fetchOptions.endpoint = url
    this.refresh()
  }

  set headers (headers) {
    this.fetchOptions.headers = headers
    this.refresh()
  }

  set method (method) {
    this.fetchOptions.method = method
    this.refresh()
  }

  set data (data) {
    this.fetchOptions.data = data
    this.fetchOptions.body = JSON.stringify(data)
    this.refresh()
  }

  async refresh (debounce) {
    if (this.debounced) {
      clearTimeout(this.debounced)
    }
    if (debounce === 0) {
      this.value = await this.plugin.fetch(this.fetchOptions.endpoint, {
        method: this.method,
        headers: this.headers,
        body: this.body,
        defaultError: this.defaultValue
      })
      if (this.interval) {
        setTimeout(this.refresh, this.interval, 0)
      }
      return
    }
    this.debounced = setTimeout(this.refresh, debounce || this.debounce, 0)
  }
}

export default class ApiPlugin {
  constructor (sharedContext) {
    this.sharedContext = sharedContext
    this.headers = { 'content-type': 'application/json' }
    this.defaultError = { ok: false }
  }

  newResource (url, options) {
    return new ApiResource(url, options, this)
  }

  async fetch (url, options) {
    return fetch(url, {
      headers: options.headers ?? this.headers,
      body: options.body ?? (options.data !== undefined && JSON.stringify(this.data))
    })
      .then(res => res.json())
    .catch(() => options.defaultError ?? this.defaultError)
      .then(data => {
        if (data.onGetUpdate) {
          Object.entries(data.onGetUpdate).forEach(([url, value]) => {
            const __onGetOptions = value?.__onGetOptions
            if (__onGetOptions) {
              delete value.__onGetOptions
            }
            this.sharedContext.setValue(url, value, __onGetOptions)
          })
        }
        return data
      })
  }
}

['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE'].forEach(method => ApiPlugin.prototype[method] = function (url, options = {}) {
  return fetch(url, { method: 'GET', ...options })
})

ApiPlugin.protocol = 'api'
