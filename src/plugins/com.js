import { VarResource } from './var'

export class ComResource extends VarResource {
  constructor (url, { computation = () => undefined, urls = [], ...options } = {}, sharedContext) {
    super(url, options)
    this.sharedContext = sharedContext
    this.crossSubcriptions = []

    this.addUrls(urls)
    this.addComputation(computation)
  }

  addUrls (urls) {
    this.urls = urls

    this.crossSubcriptions.forEach(subscription => subscription())

    this.crossSubcriptions = this.urls.map(url => this.sharedContext.onChange(url, this.recompute))
  }

  addComputation (computation) {
    this.computation = computation
    this.recompute()
  }

  recompute (value, resource) {
    const newValue = this.computation(this.sharedContext.proxy, value, resource)

    if (newValue !== undefined) {
      this.value = newValue
    }

    return newValue
  }

  removeComputation () {
    this.computation = () => {}
  }
}

export default class ComPlugin {
  constructor (sharedContext) {
    this.sharedContext = sharedContext
  }

  newResource (url, options) {
    return new ComResource(url, options, this.sharedContext)
  }
}
ComPlugin.protocol = 'com'
