import { endpoints } from '../conf'
import { pospone } from '../pospone'
import { refresh } from '../refresh'

jest.mock('../refresh')

jest.useFakeTimers()

test('if the endpoint has not intervals, it does nothing', () => {
  pospone({})
  expect(clearTimeout).not.toHaveBeenCalled()
})

test('clears the timeout of the endpoint', () => {
  pospone({
    intervals: {},
    timeout: 123456
  })
  expect(clearTimeout).toHaveBeenCalledWith(123456)
})

test('If the endpoint has been removed do not stablish a new timeout', () => {
  const endpoint = {
    intervals: {}
  }
  pospone(endpoint)

  expect(endpoint.timeout).toBeUndefined()
})

test('if the endpoint exists, it stablish a new timeout', () => {
  endpoints.test = true
  const endpoint = {
    url: 'test',
    intervals: {},
    minInterval: 90000
  }
  pospone(endpoint)
  expect(setTimeout).toHaveBeenCalled()
  expect(setTimeout.mock.calls[0][1]).toBe(90000)
  jest.runAllTimers()
  expect(refresh).toHaveBeenCalledWith('test')
})
