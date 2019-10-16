import { resources } from '../conf'
import { pospone } from '../pospone'
import { refresh } from '../refresh'

jest.mock('../refresh')

jest.useFakeTimers()

test('if the resource has not intervals, it does nothing', () => {
  pospone({})
  expect(clearTimeout).not.toHaveBeenCalled()
})

test('clears the timeout of the resource', () => {
  pospone({
    intervals: {},
    timeout: 123456
  })
  expect(clearTimeout).toHaveBeenCalledWith(123456)
})

test('If the resource has been removed do not stablish a new timeout', () => {
  const resource = {
    intervals: {}
  }
  pospone(resource)

  expect(resource.timeout).toBeUndefined()
})

test('if the resource exists, it stablish a new timeout', () => {
  resources.test = true
  const resource = {
    url: 'test',
    intervals: {},
    minInterval: 90000
  }
  pospone(resource)
  expect(setTimeout).toHaveBeenCalled()
  expect(setTimeout.mock.calls[0][1]).toBe(90000)
  jest.runAllTimers()
  expect(refresh).toHaveBeenCalledWith('test')
})
