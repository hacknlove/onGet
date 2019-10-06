import { set } from '../set'
import { isDifferent } from 'isdifferent'
import { endpoints } from '../conf'
import { getEndpoint } from '../getEndpoint'
import { pospone } from '../pospone'

jest.mock('isdifferent')
jest.mock('../getEndpoint')
jest.mock('../pospone')
jest.useFakeTimers()
test('If the endpoint does not exist, getEndPoint should be called', () => {
  const endpoint = { plugin: {} }
  getEndpoint.mockReturnValue(endpoint)

  set('test', 'value')
  expect(getEndpoint).toHaveBeenCalledWith('test', 'value')
  expect(isDifferent).not.toHaveBeenCalled()
})

test('If the plugin has the hook set, it is called', () => {
  const endpoint = {
    plugin: {
      set: jest.fn()
    }
  }
  getEndpoint.mockReturnValue(endpoint)

  set('test', 'value')

  expect(endpoint.value).toBe('value')

  expect(endpoint.plugin.set).toHaveBeenCalledWith(endpoint)

  expect(isDifferent).not.toHaveBeenCalled()
})

test('set clean to undefined', () => {
  endpoints.test = {
    clean: true
  }

  getEndpoint.mockReturnValue(endpoints.test)

  set('test')

  expect(endpoints.test.clean).toBeUndefined()
})

test('if endpoint has no intervals, do no set last neither call pospone', () => {
  endpoints.test = {}
  getEndpoint.mockReturnValue(endpoints.test)
  set('test')
  expect(endpoints.test.last).toBeUndefined()
  expect(pospone).not.toHaveBeenCalled()
})

test('it not call pospone', () => {
  endpoints.test = {
    intervals: {}
  }
  getEndpoint.mockReturnValue(endpoints.test)
  set('test')
  expect(pospone).not.toHaveBeenCalled()
})

test('it calls pospone', () => {
  endpoints.test = {
    intervals: {}
  }
  getEndpoint.mockReturnValue(endpoints.test)
  set('test', undefined, true)
  expect(pospone).toHaveBeenCalledWith(endpoints.test)
})

test('if value is not different do not set the new value', () => {
  endpoints.test = {
    value: 'old'
  }
  isDifferent.mockReturnValue(false)

  set('test', 'new')

  expect(endpoints.test.value).toBe('old')
})

test('if value is different do not set the new value', () => {
  endpoints.test = {
    value: 'old',
    callbacks: {},
    plugin: {}
  }
  getEndpoint.mockReturnValue(endpoints.test)
  isDifferent.mockReturnValue(true)

  set('test', 'new')

  expect(endpoints.test.value).toBe('new')
})

test('if value is different and there is callbacks, call the callbacks', () => {
  endpoints.test = {
    value: 'old',
    callbacks: {
      uno: jest.fn(),
      dos: jest.fn()
    },
    plugin: {}
  }
  getEndpoint.mockReturnValue(endpoints.test)
  isDifferent.mockReturnValue(true)

  set('test', 'new')
  jest.runAllTimers()

  expect(endpoints.test.callbacks.uno).toHaveBeenCalledWith('new')
  expect(endpoints.test.callbacks.dos).toHaveBeenCalledWith('new')
})

test('if value is different and there is plugin.set, call plugin.set', () => {
  endpoints.test = {
    value: 'old',
    callbacks: {
    },
    plugin: {
      set: jest.fn()
    }
  }
  getEndpoint.mockReturnValue(endpoints.test)
  isDifferent.mockReturnValue(true)

  set('test', 'new')

  expect(endpoints.test.plugin.set).toHaveBeenCalledWith(endpoints.test)
})
