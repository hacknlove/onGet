/* global localStorage */
import { endpoints } from '../../src/conf'
import plugin, { onChange } from '../localstorage.js'

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

      expect(JSON.parse(localStorage.someUrl)).toBe('newValue')
      expect(endpoint.value).toBe('newValue')
    })

    it('updates the endpoint, if localStorage has the key', () => {
      localStorage.someUrl = '"oldValue"'
      const endpoint = {
        url: 'localStorage://someUrl',
        value: 'newValue'
      }
      plugin.getEndpoint(endpoint)

      expect(JSON.parse(localStorage.someUrl)).toBe('oldValue')
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
      expect(JSON.parse(localStorage.someKey)).toBe('newValue')
    })
  })

  describe('start', () => {
    it('reset localStorage', () => {
      global.localStorage.dirty = true
      plugin.start()
      expect(global.localStorage).toStrictEqual({})
    })
  })

  describe('clean', () => {
    it('calls endpoint.unsubscribeStorage if exists', () => {
      const endpoint = {
        unsubscribeStorage: jest.fn()
      }
      plugin.clean(endpoint)
      expect(endpoint.unsubscribeStorage).toHaveBeenCalledWith()
    })
    it('does not break if endpoint.unsubscribeStorage not exists', () => {
      expect(() => plugin.clean({})).not.toThrow()
    })
  })
})

describe('onChange', () => {
  beforeEach(() => {
    delete global.addEventListener
    delete global.removeEventListener
  })
  it('returns if no global.addEventListener', () => {
    expect(onChange()).toBeUndefined()
  })
  it('returns if no global.removeEventListener', () => {
    expect(onChange()).toBeUndefined()
  })
  // Otherwise
  it('calls addEventListener', () => {
    global.addEventListener = jest.fn()
    global.removeEventListener = true
    onChange()
    expect(global.addEventListener).toHaveBeenCalled()
  })
  it('returns a function', () => {
    global.addEventListener = () => {}
    global.removeEventListener = true
    expect(typeof onChange()).toBe('function')
  })
  it('calls removeEventListener when call the returned function', () => {
    var listener
    global.addEventListener = (e, l) => {
      listener = l
    }
    global.removeEventListener = jest.fn()
    onChange()()
    expect(global.removeEventListener).toHaveBeenCalledWith(listener)
  })
  describe('listener', () => {
    var endpoint = {}
    var listener
    beforeEach(() => {
      endpoint = {}
      global.addEventListener = (e, l) => {
        listener = l
      }
      global.removeEventListener = true
      onChange(endpoint)
    })
    it('does nothing if value has not changed', () => {
      endpoint.key = 'someKey'
      endpoint.value = 42
      endpoint.callbacks = {
        nop: jest.fn()

      }
      localStorage.someKey = '42'
      listener()
      expect(endpoint.callbacks.nop).not.toHaveBeenCalled()
    })
    it('sets the new value if has changed', () => {
      endpoint.key = 'someKey'
      endpoint.value = 42
      endpoint.callbacks = {
        nop: jest.fn()

      }
      localStorage.someKey = '24'
      listener()
      expect(endpoint.value).toBe(24)
      expect(endpoint.callbacks.nop).toHaveBeenCalledWith(24)
    })
  })
})
