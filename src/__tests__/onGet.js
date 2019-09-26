import { getEndpoint } from '../getEndpoint'
import { addNewSubscription } from '../addNewSubscription'
import { endpoints } from '../conf'
import { onGet } from '../onGet'
import { refresh } from '../refresh'

jest.mock('../getEndpoint')
jest.mock('../addNewSubscription')
jest.mock('../refresh')
beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

test('call getEndpoint with parameters url and first', () => {
  getEndpoint.mockReturnValue({
    plugin: {}
  })

  onGet('someUrl', 'callback', { first: 'first' })

  expect(getEndpoint).toHaveBeenCalled()
  expect(getEndpoint).toHaveBeenCalledWith('someUrl', 'first')
})

test('call and returns addNewSubscription with parameters url, cb and interval', () => {
  getEndpoint.mockReturnValue({
    plugin: {}
  })
  addNewSubscription.mockReturnValue('unsubscribe')

  expect(onGet('someUrl', 'callback', { interval: 'interval' })).toBe('unsubscribe')

  expect(addNewSubscription).toHaveBeenCalled()
  expect(addNewSubscription).toHaveBeenCalledWith('someUrl', 'callback', 'interval')
})

test('sets clean to undefined', () => {
  getEndpoint.mockReturnValue({
    plugin: {},
    clean: true
  })
  expect(onGet().clean).toBeUndefined()
})

test('calls callback if endpoint.value != undefined', () => {
  getEndpoint.mockReturnValue({
    plugin: {},
    value: 'ok testing'
  })
  const callback = jest.fn().mockReturnValue('ok testing')
  onGet('test', callback)

  expect(callback).toHaveBeenCalledWith('ok testing')
})

test('calls refresh if it is called outside the threshold', () => {
  getEndpoint.mockReturnValue({
    plugin: {
      threshold: 1000
    },
    value: 'ok testing',
    last: Date.now() - 10000
  })
  const callback = jest.fn().mockReturnValue('ok testing')
  onGet('test url', callback)

  expect(refresh).toHaveBeenCalledWith('test url')
})

test('does not call refresh if it is called inside the threshold', () => {
  getEndpoint.mockReturnValue({
    plugin: {
      threshold: 1000
    },
    value: 'ok testing',
    last: Date.now() - 100
  })
  const callback = jest.fn().mockReturnValue('ok testing')
  onGet('test url', callback)

  expect(refresh).not.toHaveBeenCalledWith('test url')
})