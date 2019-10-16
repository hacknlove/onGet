import { resources } from '../conf'
import { getResource } from '../getResource'
import { findPlugin } from '../findPlugin'
jest.mock('../findPlugin')

beforeEach(() => {
  Object.keys(resources).forEach(key => delete resources[key])
})

test('If exists the resource returns the resource', () => {
  resources.test = Math.random()
  expect(getResource('test')).toEqual(resources.test)
})

test('If exists the resource, does not call findPlugin', () => {
  resources.test = Math.random()
  getResource('test')
  expect(findPlugin).not.toHaveBeenCalled()
})

test('If not exists the resource, call findPlugin (plugin no exists, so throw)', () => {
  expect(() => getResource('test')).toThrow()
  expect(findPlugin).toHaveBeenCalled()
})

test('If not exists the resource, creates one', () => {
  findPlugin.mockReturnValue({ name: 'voidplugin' })
  expect(getResource('test')).toEqual({
    url: 'test',
    plugin: {
      name: 'voidplugin'
    },
    value: undefined,
    callbacks: {}
  })
})

test('sets the resource in resources under url', () => {
  findPlugin.mockReturnValue({ name: 'voidplugin' })
  expect(getResource('testtest')).toEqual(resources.testtest)
})

test('If the plugin has threshold, the resource has `last`', () => {
  findPlugin.mockReturnValue({ threshold: 100 })
  expect(getResource('test').last).toBeTruthy()
})

test('If the plugin has checkInterval, the resource has `intervals`', () => {
  findPlugin.mockReturnValue({ checkInterval: 100 })
  expect(getResource('test').intervals).toEqual({})
})

test('If the plugin has getResource, is called', () => {
  const plugin = {
    getResource: jest.fn()
  }
  findPlugin.mockReturnValue(plugin)
  getResource('test')
  expect(plugin.getResource).toHaveBeenCalled()
})

test('the plugin`s getResource can modify the resource', () => {
  findPlugin.mockReturnValue({
    getResource (resource) {
      resource.modifiedByMe = true
    }
  })

  expect(getResource('test').modifiedByMe).toBe(true)
})
