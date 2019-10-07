/* global fetch */
// Integration
import { onGet, set, get, refresh, endpoints, plugins } from '../../'

plugins.forEach(plugin => {
  if (plugin.name !== 'fetch') {
    return
  }
  plugin.checkInterval = 100
})

global.fetch = jest.fn()
const unsubscribes = []

describe('fetch', () => {
  beforeEach(() => {
    fetch.mockImplementation(() => Promise.resolve({
      async json () {
        return Promise.resolve('fetch response')
      }
    }))
  })

  afterEach(() => {
    while (unsubscribes.length) {
      unsubscribes.pop()()
    }
    Object.keys(endpoints).forEach(key => {
      clearTimeout(endpoints.timeout)
      delete endpoints[key]
    })
    fetch.mockImplementation(() => Promise.resolve({
      async json () {
        return Promise.resolve('fetch response')
      }
    }))
  })

  describe('onGet', () => {
    it('should call cb after fetch return a value step1', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('key', cb))
      expect(cb).not.toHaveBeenCalled()
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(cb).toHaveBeenCalledWith('fetch response')
    })

    it('should call cb with the initial value, and then with the real one', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('key', cb, { first: 'world' }))
      expect(cb).toHaveBeenCalledWith('world')
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(cb).toHaveBeenCalledWith('fetch response')
    })

    it('should call cb with the current value, if exists', async () => {
      unsubscribes.push(onGet('key', async () => {}))

      await new Promise(resolve => setTimeout(resolve, 10))

      const cb = jest.fn()
      unsubscribes.push(onGet('key', cb))
      expect(cb).toHaveBeenCalledWith('fetch response')
      cb.mockClear()
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(cb).not.toHaveBeenCalled()
    })
  })

  describe('set', () => {
    it('triggers the callbacks of the endpoint', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('key', cb))
      set('key', 'mars')
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(cb).toHaveBeenCalledWith('mars')
    })
    it('does not trigger the callbacks if the value is the same', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('key', cb))
      await new Promise(resolve => setTimeout(resolve, 10))
      set('key', 'fetch response')
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(cb.mock.calls.length).toBe(1)
    })
  })

  describe('get', () => {
    it('if there is no value cached returns undefined', async () => {
      expect(get('key')).toBeUndefined()
    })
    it('if there is a value cached returns it', async () => {
      unsubscribes.push(onGet('key', () => {}))
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(get('key')).toBe('fetch response')
    })
  })

  describe('refresh', () => {
    it('triggers the callbacks of the endpoint if the value has changed', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('key', cb))
      await new Promise(resolve => setTimeout(resolve, 10))
      endpoints.key.last = -Infinity
      fetch.mockImplementation(() => Promise.resolve({
        async json () {
          return Promise.resolve('new response')
        }
      }))
      refresh('key')
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(cb).toHaveBeenCalledWith('new response')
    })
    it('dows no trigger the callbacks if the value is the same', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('key', cb))
      await new Promise(resolve => setTimeout(resolve, 10))
      cb.mockClear()
      refresh('key')
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(cb).not.toHaveBeenCalled()
    })
  })
})