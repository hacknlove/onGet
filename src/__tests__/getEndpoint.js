import { endpoints } from '../conf'
import { getEndpoint } from '../getEndpoint'
import { findPlugin } from '../findPlugin'
jest.mock('../findPlugin')

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

test('If exists the endpoint returns the endpoint', () => {
  endpoints.test = Math.random()
  expect(getEndpoint('test')).toEqual(endpoints.test)
})

test('If exists the endpoint, does not call findPlugin', () => {
  endpoints.test = Math.random()
  getEndpoint('test')
  expect(findPlugin).not.toHaveBeenCalled()
})

test('If not exists the endpoint, call findPlugin (plugin no exists, so throw)', () => {
  expect(() => getEndpoint('test')).toThrow()
  expect(findPlugin).toHaveBeenCalled()
})

test('If not exists the endpoint, creates one', () => {
  findPlugin.mockReturnValue({ name: 'voidplugin' })
  expect(getEndpoint('test')).toEqual({
    url: 'test',
    plugin: {
      name: 'voidplugin'
    },
    value: undefined,
    callbacks: {}
  })
})

test('sets the endpoint in endpoints under url', () => {
  findPlugin.mockReturnValue({ name: 'voidplugin' })
  expect(getEndpoint('testtest')).toEqual(endpoints.testtest)
})

test('If the plugin has threshold, the endpoint has `last`', () => {
  findPlugin.mockReturnValue({ threshold: 100 })
  expect(getEndpoint('test').last).toBeTruthy()
})

test('If the plugin has checkInterval, the endpoint has `intervals`', () => {
  findPlugin.mockReturnValue({ checkInterval: 100 })
  expect(getEndpoint('test').intervals).toEqual({})
})

test('If the plugin has getEndpoint, is called', () => {
  const plugin = {
    getEndpoint: jest.fn()
  }
  findPlugin.mockReturnValue(plugin)
  getEndpoint('test')
  expect(plugin.getEndpoint).toHaveBeenCalled()
})

test('the plugin`s getEndpoint can modify the endpoint', () => {
  findPlugin.mockReturnValue({
    getEndpoint (endpoint) {
      endpoint.modifyedByMe = true
    }
  })

  expect(getEndpoint('test').modifyedByMe).toBe(true)
})
