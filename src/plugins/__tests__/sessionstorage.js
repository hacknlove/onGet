/* global sessionStorage */
import { resources } from '../../lib/conf'
import plugin from '../sessionstorage'

global.sessionStorage = {}

beforeEach(() => {
  Object.keys(resources).forEach(key => delete resources[key])
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

  describe('getResource', () => {
    it('sets the key', () => {
      const resource = {
        url: 'sessionStorage://someUrl'
      }
      plugin.getResource(resource)

      expect(resource.key).toBe('someUrl')
    })

    it('updates sessionStorage, if sessionStorage has not that key', () => {
      const resource = {
        url: 'sessionStorage://someUrl',
        value: 'newValue'
      }
      plugin.getResource(resource)

      expect(JSON.parse(sessionStorage.someUrl)).toBe('newValue')
      expect(resource.value).toBe('newValue')
    })

    it('updates the resource, if has the key', () => {
      sessionStorage.someUrl = '"oldValue"'
      const resource = {
        url: 'sessionStorage://someUrl',
        value: 'newValue'
      }
      plugin.getResource(resource)

      expect(JSON.parse(sessionStorage.someUrl)).toBe('oldValue')
      expect(resource.value).toBe('oldValue')
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
      expect(JSON.parse(sessionStorage.someKey)).toBe('newValue')
    })
  })

  describe('start', () => {
    it('reset sessionStorage', () => {
      global.sessionStorage.dirty = true
      plugin.start()
      expect(global.sessionStorage).toStrictEqual({})
    })
  })

  // describe('export', () => {
  //   it('returns undefined if there is no data in the state', () => {
  //     plugin.import({})
  //     expect(plugin.export()).toBeUndefined()
  //   })
  //   it('returns the state, if it has data', () => {
  //     plugin.import({ foo: 'bar ' })
  //     expect(plugin.export()).toStrictEqual({ foo: 'bar' })
  //   })
  // })

  // describe('saveresource', () => {

  // })

  // describe('import', () => {

  // })
})
