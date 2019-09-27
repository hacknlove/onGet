/* global localStorage */
import { endpoints } from '../../src/conf'
import plugin from '../localstorage.js'

global.localStorage = {}

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
  Object.keys(localStorage).forEach(key => delete localStorage[key])
})

describe('plugin', () => {
  describe('regex', () => {
    it('match everything localStorage:// case insensitive', () => {
      expect('localStorage://foo').toMatch(plugin.regex)
      expect('localstorage://foo').toMatch(plugin.regex)
      expect('LocalStorage://foo').toMatch(plugin.regex)
    })
    it('not match other things', () => {
      expect('https://').not.toMatch(plugin.regex)
      expect('//').not.toMatch(plugin.regex)
      expect('key').not.toMatch(plugin.regex)
    })
  })

  describe('refresh calls eventHandler', () => {
    it('with the value', () => {
      localStorage.test = 'newValue'
      const eventHandler = jest.fn()
      plugin.refresh({ key: 'test' }, eventHandler)
      expect(eventHandler).toHaveBeenCalledWith('newValue')
    })
  })

  describe('getEndpoint', () => {
    it('sets the key', () => {
      const endpoint = {
        url: 'localStorage://someUrl'
      }
      plugin.getEndpoint(endpoint)

      expect(endpoint.key).toBe('someUrl')
    })

    it('updates localStorage, if localStorage has not that key', () => {
      const endpoint = {
        url: 'localStorage://someUrl',
        value: 'newValue'
      }
      plugin.getEndpoint(endpoint)

      expect(localStorage.someUrl).toBe('newValue')
      expect(endpoint.value).toBe('newValue')
    })

    it('updates the endpoint, if lo has the key', () => {
      localStorage.someUrl = 'oldValue'
      const endpoint = {
        url: 'localStorage://someUrl',
        value: 'newValue'
      }
      plugin.getEndpoint(endpoint)

      expect(localStorage.someUrl).toBe('oldValue')
      expect(endpoint.value).toBe('oldValue')
    })
  })

  describe('get', () => {
    it('returns the localStorage value', () => {
      localStorage.someUrl = 'oldValue'
      expect(plugin.get('localStorage://someUrl')).toBe('oldValue')
    })
  })

  describe('set', () => {
    it('update the localStorage value', () => {
      plugin.set({
        key: 'someKey',
        value: 'newValue'
      })
      expect(localStorage.someKey).toBe('newValue')
    })
  })
})
