import { set } from '../src/set'
import isdifferent from 'isdifferent'
import { endpoints } from '../src/conf'
import { getEndpoint } from '../src/getEndpoint'
import { pospone } from '../src/pospone'

jest.mock('isdifferent')
jest.mock('../src/getEndpoint')
jest.mock('../src/pospone')

test('If the endpoint does not exist, do nothing and return the endpoint created by getEndpoint', () => {
  getEndpoint.mockReturnValue('endpoint')

  expect(set('test', 'value')).toBe('endpoint')
  expect(isdifferent).not.toHaveBeenCalled()
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

test('it set last, and not call pospone', () => {
  const now = Date.now()
  endpoints.test = {
    intervals: {}
  }
  getEndpoint.mockReturnValue(endpoints.test)
  set('test')
  expect(endpoints.test.last >= now).toBe(true)
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
  isdifferent.mockReturnValue(false)

  set('test', 'new')

  expect(endpoints.test.value).toBe('old')
})

test('if value is different do not set the new value', () => {
  endpoints.test = {
    value: 'old',
    callbacks: {}
  }
  getEndpoint.mockReturnValue(endpoints.test)
  isdifferent.mockReturnValue(true)

  set('test', 'new')

  expect(endpoints.test.value).toBe('new')
})

test('if value is different and there is callbacks, call the callbacks', () => {
  endpoints.test = {
    value: 'old',
    callbacks: {
      uno: jest.fn(),
      dos: jest.fn()
    }
  }
  getEndpoint.mockReturnValue(endpoints.test)
  isdifferent.mockReturnValue(true)

  set('test', 'new')

  expect(endpoints.test.callbacks.uno).toHaveBeenCalledWith('new')
  expect(endpoints.test.callbacks.dos).toHaveBeenCalledWith('new')
})
