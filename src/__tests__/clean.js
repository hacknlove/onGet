import { resources, conf } from '../conf'
import { clean } from '../clean'

beforeEach(() => {
  conf.CACHE_SIZE = 3
  Object.keys(resources).forEach(key => delete resources[key])
})

test('set resource.clean to the resources without callbacks', () => {
  resources.uno = {
    callbacks: {}
  }
  resources.dos = {
    callbacks: { no: true }
  }
  resources.tres = {
    callbacks: {}
  }

  clean()

  expect(resources.uno.clean).toBe(true)
  expect(resources.dos.clean).toBeUndefined()
  expect(resources.tres.clean).toBe(true)
})

test('set resource.clean does nothing if the cache is not full', () => {
  conf.CACHE_SIZE = 14
  resources.uno = {
    callbacks: {}
  }
  resources.dos = {
    callbacks: { no: true }
  }
  resources.tres = {
    callbacks: {}
  }

  clean()

  expect(resources.uno.clean).toBeUndefined()
  expect(resources.dos.clean).toBeUndefined()
  expect(resources.tres.clean).toBeUndefined()
})

test('removes the resources marked as clean', () => {
  resources.uno = {
    url: 'uno',
    clean: true,
    plugin: {}
  }
  resources.dos = {
    callbacks: { no: true }
  }
  resources.tres = {
    callbacks: {}
  }

  clean()

  expect(resources.uno).toBeUndefined()
  expect(resources.dos.clean).toBeUndefined()
  expect(resources.tres.clean).toBe(true)
})

test('calls resource.plugin.clean', () => {
  conf.CACHE_SIZE = 0
  const pluginClean = jest.fn()
  resources.uno = {
    url: 'uno',
    clean: true,
    plugin: {
      clean: pluginClean
    }
  }
  clean()
  expect(pluginClean).toHaveBeenCalled()
  expect(resources.uno).toBeUndefined()
})

test('it does not clean, if resource.plugin.clean returns truthy', () => {
  conf.CACHE_SIZE = 0
  const pluginClean = jest.fn()
  pluginClean.mockReturnValue(true)
  resources.uno = {
    url: 'uno',
    clean: true,
    plugin: {
      clean: pluginClean
    }
  }
  clean()

  expect(pluginClean).toHaveBeenCalled()
  expect(resources.uno).not.toBeUndefined()
})
