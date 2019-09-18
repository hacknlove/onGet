import { getEndpoint } from '../src/getEndpoint'
import { addNewSuscription } from '../src/addNewSuscription'
import { endpoints } from '../src/conf'
import { onGet } from '../src/index'

jest.mock('../src/getEndpoint')
jest.mock('../src/addNewSuscription')

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

test('call getEndpoint with parameters url and first', () => {
  getEndpoint.mockReturnValue({})

  onGet('someUrl', 'callback', 'interval', 'first')

  expect(getEndpoint).toHaveBeenCalled()
  expect(getEndpoint).toHaveBeenCalledWith('someUrl', 'first')
})

test('call and returns addNewSuscription with parameters url, cb and interval', () => {
  getEndpoint.mockReturnValue({})
  addNewSuscription.mockReturnValue('unsuscribe')

  expect(onGet('someUrl', 'callback', 'interval', 'first')).toBe('unsuscribe')

  expect(addNewSuscription).toHaveBeenCalled()
  expect(addNewSuscription).toHaveBeenCalledWith('someUrl', 'callback', 'interval')
})

test('sets clean to undefined', () => {
  getEndpoint.mockReturnValue({
    clean: true
  })
  expect(onGet().clean).toBeUndefined()
})

test('calls callback if endpoint.value != undefined', () => {
  getEndpoint.mockReturnValue({
    value: 'oktesting'
  })
  const callback = jest.fn().mockReturnValue('oktesting')
  onGet('test', callback)

  expect(callback).toHaveBeenCalledWith('oktesting')
})
