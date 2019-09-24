import { getEndpoint } from '../getEndpoint'
import { addNewSubscription } from '../addNewSubscription'
import { endpoints } from '../conf'
import { onGet } from '../onGet'

jest.mock('../getEndpoint')
jest.mock('../addNewSubscription')

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

test('call getEndpoint with parameters url and first', () => {
  getEndpoint.mockReturnValue({})

  onGet('someUrl', 'callback', 'interval', 'first')

  expect(getEndpoint).toHaveBeenCalled()
  expect(getEndpoint).toHaveBeenCalledWith('someUrl', 'first')
})

test('call and returns addNewSubscription with parameters url, cb and interval', () => {
  getEndpoint.mockReturnValue({})
  addNewSubscription.mockReturnValue('unsubscribe')

  expect(onGet('someUrl', 'callback', 'interval', 'first')).toBe('unsubscribe')

  expect(addNewSubscription).toHaveBeenCalled()
  expect(addNewSubscription).toHaveBeenCalledWith('someUrl', 'callback', 'interval')
})

test('sets clean to undefined', () => {
  getEndpoint.mockReturnValue({
    clean: true
  })
  expect(onGet().clean).toBeUndefined()
})

test('calls callback if endpoint.value != undefined', () => {
  getEndpoint.mockReturnValue({
    value: 'ok testing'
  })
  const callback = jest.fn().mockReturnValue('ok testing')
  onGet('test', callback)

  expect(callback).toHaveBeenCalledWith('ok testing')
})
