import { getValue, setValue, deleteValue } from '@hacknlove/deepobject'
import { VarResource } from './var'
import DeepProxy from 'proxy-deep'

const proxyHandlers = {
  get (target, key) {
    const value = target === this.rootTarget ? target.cached[key] : target[key]

    if (typeof value === 'object' && value !== null) {
      return this.nest({
        resource: target.resource
      })
    }
    return value
  },
  deleteProperty () {
    this.rootTarget.plugin.delete(this.rootTarget.url + '.' + this.path.join('.'))
  },
  set (target, key, value) {
    this.rootTarget.plugin.setValue(this.rootTarget.url + '.' + this.path.join('.'), value)
    return true
  }
}

export class DotResource extends VarResource {
  constructor (url, options, plugin) {
    super(url, options)
    this.plugin = plugin

    if (options.firstValue !== undefined && this.value === undefined) {
      this.value = options.firstValue
    }
  }

  setValue (value) {
    this.plugin.setValue(this.url, value)
    this.cached = value
    super.triggerSubscriptions()
  }

  setChild (url, value) {
    this.plugin.setValue(this.url + '.' + url, value)
  }

  getChild (url) {
    return getValue(this.cached, url)
  }

  delete () {
    delete this.cached
    this.plugin.delete(this.url)
  }

  triggerSubscriptions () {
    for (const subscription of this.subscriptions.values()) {
      subscription(this.cached, this)
    }
  }

  proxy () {
    if (this.proxy) {
      return this.proxy
    }
    this.proxy = new DeepProxy(this, proxyHandlers)
  }
}

export default class DotPlugin {
  constructor (sharedState) {
    this.sharedState = sharedState
    this.state = {}
  }

  newResource (url, options) {
    return new DotResource(url, options, this)
  }

  getValue (url) {
    return getValue(this.state, url)
  }

  setValue (url, value) {
    this.state = setValue(this.state, url, value)
    this.propagateDown(url)
    this.propagateUp(url)
  }

  delete (url) {
    this.state = deleteValue(this.state, url)
    this.propagateUp(url)
    this.propagateDown(url)
  }

  propagateUp (url) {
    const parentUrl = url.replace(/\.?[^.]*$/, '')
    if (!parentUrl) {
      return
    }
    const resource = this.sharedState.resources.get(parentUrl)

    if (resource) {
      resource.triggerSubscriptions()
    }
    this.propagateUp(parentUrl)
  }

  propagateDown (url) {
    const prefix = `${url}.`

    for (const child of this.sharedState.resources.values()) {
      if (!child.url.startsWith(prefix)) continue

      child.triggerSubscriptions()
    }
  }
}
DotPlugin.protocol = 'dot'
