import { endpoints, clean } from '../lib'
import conf from '../conf'

beforeEach(() => {
  conf.CACHE_SIZE = 3
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

test('set endpoint.clean to the endpoints without callbacks', () => {
  endpoints.uno = {
    callbacks: {}
  }
  endpoints.dos = {
    callbacks: { no: true }
  }
  endpoints.tres = {
    callbacks: {}
  }

  clean()

  expect(endpoints.uno.clean).toBe(true)
  expect(endpoints.dos.clean).toBeUndefined()
  expect(endpoints.tres.clean).toBe(true)
})

test('set endpoint.clean does nothing if the cache is not full', () => {
  conf.CACHE_SIZE = 14
  endpoints.uno = {
    callbacks: {}
  }
  endpoints.dos = {
    callbacks: { no: true }
  }
  endpoints.tres = {
    callbacks: {}
  }

  clean()

  expect(endpoints.uno.clean).toBeUndefined()
  expect(endpoints.dos.clean).toBeUndefined()
  expect(endpoints.tres.clean).toBeUndefined()
})

test('removes the endpoints marked as clean', () => {
  endpoints.uno = {
    url: 'uno',
    clean: true,
    plugin: {}
  }
  endpoints.dos = {
    callbacks: { no: true }
  }
  endpoints.tres = {
    callbacks: {}
  }

  clean()

  expect(endpoints.uno).toBeUndefined()
  expect(endpoints.dos.clean).toBeUndefined()
  expect(endpoints.tres.clean).toBe(true)
})

test('calls endpoint.plugin.clean', () => {
  conf.CACHE_SIZE = 0
  const pluginClean = jest.fn()
  endpoints.uno = {
    url: 'uno',
    clean: true,
    plugin: {
      clean: pluginClean
    }
  }
  clean()
  expect(pluginClean).toHaveBeenCalled()
  expect(endpoints.uno).toBeUndefined()
})

test('it does not clean, if endpoint.plugin.clean returns truthy', () => {
  conf.CACHE_SIZE = 0
  const pluginClean = jest.fn()
  pluginClean.mockReturnValue(true)
  endpoints.uno = {
    url: 'uno',
    clean: true,
    plugin: {
      clean: pluginClean
    }
  }
  clean()

  expect(pluginClean).toHaveBeenCalled()
  expect(endpoints.uno).not.toBeUndefined()
})
