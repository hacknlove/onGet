import { getResource } from '../../private/getResource'
import { addNewSubscription } from '../../private/addNewSubscription'
import { resources } from '../conf'
import { onGet } from '../onGet'
import { refresh } from '../refresh'

jest.mock('../../private/getResource')
jest.mock('../../private/addNewSubscription')
jest.mock('../refresh')
beforeEach(() => {
  Object.keys(resources).forEach(key => delete resources[key])
})

test('call getResource with parameters url and first', () => {
  getResource.mockReturnValue({
    plugin: {}
  })

  onGet('someUrl', 'callback', { first: 'first' })

  expect(getResource).toHaveBeenCalled()
  expect(getResource).toHaveBeenCalledWith('someUrl', 'first')
})

test('call and returns addNewSubscription with parameters url, cb and interval', () => {
  getResource.mockReturnValue({
    plugin: {}
  })
  addNewSubscription.mockReturnValue('unsubscribe')

  expect(onGet('someUrl', 'callback', { interval: 'interval' })).toBe('unsubscribe')

  expect(addNewSubscription).toHaveBeenCalled()
  expect(addNewSubscription).toHaveBeenCalledWith('someUrl', 'callback', 'interval')
})

test('sets clean to undefined', () => {
  getResource.mockReturnValue({
    plugin: {},
    clean: true
  })
  expect(onGet().clean).toBeUndefined()
})

test('calls callback if resource.value != undefined', () => {
  getResource.mockReturnValue({
    plugin: {},
    value: 'ok testing'
  })
  const callback = jest.fn().mockReturnValue('ok testing')
  onGet('test', callback)

  expect(callback).toHaveBeenCalledWith('ok testing')
})

test('calls refresh if it is called outside the threshold', () => {
  getResource.mockReturnValue({
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
  getResource.mockReturnValue({
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
