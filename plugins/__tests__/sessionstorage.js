/* global sessionStorage */
import { endpoints } from '../../src/conf'
import plugin from '../sessionstorage.js'

global.sessionStorage = {}

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
  Object.keys(sessionStorage).forEach(key => delete sessionStorage[key])
})

describe('plugin', () => {
  describe('regex', () => {
    it('match everything sessionStorage:// case insensitive', () => {
      expect('sessionStorage://foo').toMatch(plugin.regex)
      expect('sessionstorage://foo').toMatch(plugin.regex)
      expect('SessionStorage://foo').toMatch(plugin.regex)
    })
    it('not match other things', () => {
      expect('https://').not.toMatch(plugin.regex)
      expect('//').not.toMatch(plugin.regex)
      expect('key').not.toMatch(plugin.regex)
    })
  })

  describe('refresh calls eventHandler', () => {
    it('with the value', () => {
      sessionStorage.test = 'newValue'
      const eventHandler = jest.fn()
      plugin.refresh({ key: 'test' }, eventHandler)
      expect(eventHandler).toHaveBeenCalledWith('newValue')
    })
  })

  describe('getEndpoint', () => {
    it('sets the key', () => {
      const endpoint = {
        url: 'sessionStorage://someUrl'
      }
      plugin.getEndpoint(endpoint)

      expect(endpoint.key).toBe('someUrl')
    })

    it('updates sessionStorage, if sessionStorage has not that key', () => {
      const endpoint = {
        url: 'sessionStorage://someUrl',
        value: 'newValue'
      }
      plugin.getEndpoint(endpoint)

      expect(sessionStorage.someUrl).toBe('newValue')
      expect(endpoint.value).toBe('newValue')
    })

    it('updates the endpoint, if lo has the key', () => {
      sessionStorage.someUrl = 'oldValue'
      const endpoint = {
        url: 'sessionStorage://someUrl',
        value: 'newValue'
      }
      plugin.getEndpoint(endpoint)

      expect(sessionStorage.someUrl).toBe('oldValue')
      expect(endpoint.value).toBe('oldValue')
    })
  })

  describe('get', () => {
    it('returns the sessionStorage value', () => {
      sessionStorage.someUrl = 'oldValue'
      expect(plugin.get('sessionStorage://someUrl')).toBe('oldValue')
    })
  })

  describe('set', () => {
    it('update the sessionStorage value', () => {
      plugin.set({
        key: 'someKey',
        value: 'newValue'
      })
      expect(sessionStorage.someKey).toBe('newValue')
    })
  })
})
