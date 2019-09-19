import { refresh } from '../src/refresh'
import { set } from '../src/set'
import { pospone } from '../src/pospone'
import { endpoints } from '../src/conf'

jest.mock('../src/set')
jest.mock('../src/pospone')

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

test('if the endpoint does not exists, it does nothing', () => {
  refresh('nothing')
  expect(pospone).not.toHaveBeenCalled()
})

test('set clean to undefined', () => {
  endpoints.test = {
    clean: true,
    plugin: {
      refresh: jest.fn()
    }
  }
  refresh('test')

  expect(endpoints.test.clean).toBeUndefined()
})

test('calls pospone', () => {
  endpoints.test = {
    plugin: {
      refresh: jest.fn()
    }
  }
  refresh('test')
  expect(pospone).toHaveBeenCalledWith(endpoints.test)
})

test('calls endpoint.plugin.refresh', () => {
  endpoints.test = {
    plugin: {
      refresh: jest.fn()
    }
  }
  refresh('test')
  expect(endpoints.test.plugin.refresh).toHaveBeenCalled()
  expect(endpoints.test.plugin.refresh.mock.calls[0][0]).toBe(endpoints.test)
})

test('if the plugin calls the callback, it calls set with url, and the returned value', () => {
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
