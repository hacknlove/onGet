/* global localStorage */
import { resources } from '../../lib/conf'
import plugin, { onChange } from '../localstorage'
import { set, get } from '../../index'

global.localStorage = {}

beforeEach(() => {
  Object.keys(resources).forEach(key => delete resources[key])
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
      expect(plugin.refresh({ key: 'test' })).toBe('newValue')
    })
  })

  describe('getResource', () => {
    it('sets the key', () => {
      const resource = {
        url: 'localStorage://someUrl'
      }
      plugin.getResource(resource)

      expect(resource.key).toBe('someUrl')
    })

    it('updates localStorage, if localStorage has not that key', () => {
      const resource = {
        url: 'localStorage://someUrl',
        value: 'newValue'
      }
      plugin.getResource(resource)

      expect(JSON.parse(localStorage.someUrl)).toBe('newValue')
      expect(resource.value).toBe('newValue')
    })

    it('updates the resource, if localStorage has the key', () => {
      localStorage.someUrl = '"oldValue"'
      const resource = {
        url: 'localStorage://someUrl',
        value: 'newValue'
      }
      plugin.getResource(resource)

      expect(JSON.parse(localStorage.someUrl)).toBe('oldValue')
      expect(resource.value).toBe('oldValue')
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
    it('calls resource.unsubscribeStorage if exists', () => {
      const resource = {
        unsubscribeStorage: jest.fn()
      }
      plugin.clean(resource)
      expect(resource.unsubscribeStorage).toHaveBeenCalledWith()
    })
    it('does not break if resource.unsubscribeStorage not exists', () => {
      expect(() => plugin.clean({})).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('deletes the value if set undefined', () => {
      set('localStorage://something', 'algo')
      expect(get('localStorage://something')).toBe('algo')
      set('localStorage://something', undefined)
      expect(get('localStorage://something')).toBeUndefined()
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
    var resource = {}
    var listener
    beforeEach(() => {
      resource = {}
      global.addEventListener = (e, l) => {
        listener = l
      }
      global.removeEventListener = true
      onChange(resource)
    })
    it('does nothing if value has not changed', () => {
      resource.key = 'someKey'
      resource.value = 42
      resource.callbacks = {
        nop: jest.fn()

      }
      localStorage.someKey = '42'
      listener()
      expect(resource.callbacks.nop).not.toHaveBeenCalled()
    })
    it('sets the new value if has changed', () => {
      resource.key = 'someKey'
      resource.value = 42
      resource.callbacks = {
        nop: jest.fn()

      }
      localStorage.someKey = '24'
      listener()
      expect(resource.value).toBe(24)
      expect(resource.callbacks.nop).toHaveBeenCalledWith(24)
    })
  })
})
