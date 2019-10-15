import { load, loadEndpoints, loadPlugins } from '../load'
import { endpoints, plugins } from '../conf'

describe('loadPlugins', () => {
  beforeEach(() => {
    plugins.length = 0
    Object.keys(endpoints).forEach(key => delete endpoints[key])
  })

  it('execute plugin.load', () => {
    plugins.push({
      name: 'a',
      load: jest.fn()
    })
    plugins.push({
      name: 'b',
      load: jest.fn()
    })

    loadPlugins({
      b: 'param'
    })

    expect(plugins[0].load).not.toHaveBeenCalled()
    expect(plugins[1].load).toHaveBeenCalledWith('param')
  })
})

describe('loadEndpoints', () => {
  beforeEach(() => {
    plugins.length = 0
    Object.keys(endpoints).forEach(key => delete endpoints[key])
  })
  it('loads the endpoints', () => {
    plugins.push({
      regex: /^a/,
      checkInterval: 100,
      threshold: 100
    })
    plugins.push({
      regex: /^b/,
      load (endpoint) {
        endpoint.value += ':)'
      }
    })
    loadEndpoints({
      a: {
        value: 'A'
      },
      b: {
        value: 'B'
      }
    })
    expect(endpoints.a.intervals).toStrictEqual({})
    expect(endpoints.b.value).toBe('B:)')
  })
})
describe('load', () => {
  beforeEach(() => {
    plugins.length = 0
    Object.keys(endpoints).forEach(key => delete endpoints[key])
  })
  it('works', () => {
    expect(() => load({
      savedEndpoints: {},
      savedPlugins: {}
    })).not.toThrow()
  })
})
