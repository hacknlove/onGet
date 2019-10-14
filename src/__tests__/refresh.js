import { refresh } from '../refresh'
import { set } from '../set'
import { pospone } from '../pospone'
import { endpoints } from '../conf'

jest.mock('../set')
jest.mock('../pospone')

describe('refresh', () => {
  beforeEach(() => {
    Object.keys(endpoints).forEach(key => delete endpoints[key])
  })
  it('if the endpoint does not exists, it does nothing', () => {
    refresh('nothing')
    expect(pospone).not.toHaveBeenCalled()
  })

  it('set clean to undefined', () => {
    endpoints.test = {
      clean: true,
      plugin: {
        refresh: jest.fn()
      }
    }
    refresh('test')

    expect(endpoints.test.clean).toBeUndefined()
  })

  it('calls pospone', () => {
    endpoints.test = {
      plugin: {
        refresh: jest.fn()
      }
    }
    refresh('test')
    expect(pospone).toHaveBeenCalledWith(endpoints.test)
  })

  it('calls endpoint.plugin.refresh', () => {
    endpoints.test = {
      plugin: {
        refresh: jest.fn()
      }
    }
    refresh('test')
    expect(endpoints.test.plugin.refresh).toHaveBeenCalled()
    expect(endpoints.test.plugin.refresh.mock.calls[0][0]).toBe(endpoints.test)
  })

  it('if the plugin calls the callback, it calls set with url, and the returned value', () => {
    endpoints.test = {
      plugin: {
        refresh: jest.fn()
      }
    }
    endpoints.test.plugin.refresh.mockImplementation((endpoint, handler) => {
      handler('value')
    })

    refresh('test')

    expect(set).toHaveBeenCalledWith('test', 'value')
  })

  it('if refresh is called inside the plugin threshold, it does not refresh', () => {
    endpoints['test url'] = {
      plugin: {
        threshold: 1000,
        refresh: jest.fn()
      },
      last: Date.now()
    }
    refresh('test url')
    expect(pospone).not.toHaveBeenCalled()
    expect(endpoints['test url'].plugin.refresh).not.toHaveBeenCalled()
  })

  it('if refresh is called inside the plugin threshold with force, it does refresh', () => {
    endpoints['test url'] = {
      plugin: {
        threshold: 1000,
        refresh: jest.fn()
      },
      last: Date.now()
    }
    refresh('test url', true)
    expect(pospone).toHaveBeenCalled()
    expect(endpoints['test url'].plugin.refresh).toHaveBeenCalled()
  })

  it('if refresh is called outside the plugin threshold, it refresh', () => {
    endpoints['test url'] = {
      plugin: {
        threshold: 1000,
        refresh: jest.fn()
      },
      last: Date.now() - 1001
    }
    refresh('test url')
    expect(pospone).toHaveBeenCalled()
    expect(endpoints['test url'].plugin.refresh).toHaveBeenCalled()
  })
})
