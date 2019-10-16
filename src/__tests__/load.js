import { load, loadresources, loadPlugins } from '../load'
import { resources, plugins } from '../conf'

describe('loadPlugins', () => {
  beforeEach(() => {
    plugins.length = 0
    Object.keys(resources).forEach(key => delete resources[key])
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

describe('loadresources', () => {
  beforeEach(() => {
    plugins.length = 0
    Object.keys(resources).forEach(key => delete resources[key])
  })
  it('loads the resources', () => {
    plugins.push({
      regex: /^a/,
      checkInterval: 100,
      threshold: 100
    })
    plugins.push({
      regex: /^b/,
      load (resource) {
        resource.value += ':)'
      }
    })
    loadresources({
      a: {
        value: 'A'
      },
      b: {
        value: 'B'
      }
    })
    expect(resources.a.intervals).toStrictEqual({})
    expect(resources.b.value).toBe('B:)')
  })
})
describe('load', () => {
  beforeEach(() => {
    plugins.length = 0
    Object.keys(resources).forEach(key => delete resources[key])
  })
  it('works', () => {
    expect(() => load({
      resources: {},
      plugins: {}
    })).not.toThrow()
  })
})
