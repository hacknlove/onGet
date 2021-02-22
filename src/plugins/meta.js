import { getResource } from '../lib/getResource'

export default {
  name: 'meta',
  regex: /^meta:\/\/./,

  get (target, resource) {
    resource.cached = getResource(resource.url.substr(7))
  },
  set (target, resource, value) {
    target.resources.set(resource.url.substr(7), value)
    resource.cached = value
  }
}
