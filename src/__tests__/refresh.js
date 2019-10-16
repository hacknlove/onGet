import { refresh } from '../refresh'
import { _set } from '../set'
import { pospone } from '../pospone'
import { resources } from '../conf'

jest.mock('../set')
jest.mock('../pospone')

describe('refresh', () => {
  beforeEach(() => {
    Object.keys(resources).forEach(key => delete resources[key])
  })
  it('if the resource does not exists, it does nothing', () => {
    refresh('nothing')
    expect(pospone).not.toHaveBeenCalled()
  })

  it('set clean to undefined', () => {
    resources.test = {
      clean: true,
      plugin: {
        refresh: jest.fn()
      }
    }
    refresh('test')

    expect(resources.test.clean).toBeUndefined()
  })

  it('calls pospone', () => {
    resources.test = {
      plugin: {
        refresh: jest.fn()
      }
    }
    refresh('test')
    expect(pospone).toHaveBeenCalledWith(resources.test)
  })

  it('calls resource.plugin.refresh', () => {
    resources.test = {
      plugin: {
        refresh: jest.fn()
      }
    }
    refresh('test')
    expect(resources.test.plugin.refresh).toHaveBeenCalled()
    expect(resources.test.plugin.refresh.mock.calls[0][0]).toBe(resources.test)
  })

  it('if the plugin calls the callback, it calls set with url, and the returned value', () => {
    resources.test = {
      plugin: {
        refresh: jest.fn()
      }
    }
    resources.test.plugin.refresh.mockImplementation((resource, handler) => {
      handler('value')
    })

    refresh('test')

    expect(_set).toHaveBeenCalledWith(resources.test, 'value')
  })

  it('if refresh is called inside the plugin threshold, it does not refresh', () => {
    resources['test url'] = {
      plugin: {
        threshold: 1000,
        refresh: jest.fn()
      },
      last: Date.now()
    }
    refresh('test url')
    expect(pospone).not.toHaveBeenCalled()
    expect(resources['test url'].plugin.refresh).not.toHaveBeenCalled()
  })

  it('if refresh is called inside the plugin threshold with force, it does refresh', () => {
    resources['test url'] = {
      plugin: {
        threshold: 1000,
        refresh: jest.fn()
      },
      last: Date.now()
    }
    refresh('test url', true)
    expect(pospone).toHaveBeenCalled()
    expect(resources['test url'].plugin.refresh).toHaveBeenCalled()
  })

  it('if refresh is called outside the plugin threshold, it refresh', () => {
    resources['test url'] = {
      plugin: {
        threshold: 1000,
        refresh: jest.fn()
      },
      last: Date.now() - 1001
    }
    refresh('test url')
    expect(pospone).toHaveBeenCalled()
    expect(resources['test url'].plugin.refresh).toHaveBeenCalled()
  })
})
