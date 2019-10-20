import { loadResources, loadPlugins } from '../load'
import { resources, plugins } from '../../lib/conf'

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

describe('loadResources', () => {
  beforeEach(() => {
    plugins.length = 0
    Object.keys(resources).forEach(key => delete resources[key])
  })
  it('loads the resources', () => {
    plugins.push({
      regex: /^a/,
      conf: {
        checkInterval: 100,
        threshold: 100
      }
    })
    plugins.push({
      regex: /^b/,
      conf: {},
      loadResource (resource) {
        resource.value += ':)'
      }
    })
    loadResources({
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
