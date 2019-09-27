/* global localStorage sessionStorage */
// Integration
import { onGet, set, get, refresh } from '../src'

import { endpoints } from '../src/conf'

global.localStorage = {}
global.sessionStorage = {}

jest.useFakeTimers()
var unsubscribes = []

describe('state', () => {
  beforeEach(() => {
    set('state://foo', undefined)
    while (unsubscribes.length) {
      unsubscribes.pop()()
    }
    Object.keys(endpoints).forEach(key => delete endpoints[key])
  })

  describe('onGet', () => {
    it('should not call cb if there is no initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('state://foo.bar.hello', cb))

      expect(cb).not.toHaveBeenCalled()
    })

    it('should call cb with the initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('state://foo.bar.hello', cb, { first: 'world' }))

      expect(cb).toHaveBeenCalledWith('world')
    })

    it('should call cb with the current value, if exists', () => {
      set('state://foo.bar.hello', 'mars')
      const cb = jest.fn()

      unsubscribes.push(onGet('state://foo.bar.hello', cb))

      expect(cb).toHaveBeenCalledWith('mars')
    })

    it('should call cb with the current value, even if pass a different initial one', () => {
      set('state://foo.bar.hello', 'mars')
      const cb = jest.fn()

      unsubscribes.push(onGet('state://foo.bar.hello', cb, { first: 'world' }))

      expect(cb).toHaveBeenCalledWith('mars')
    })
  })

  describe('set', () => {
    it('triggers the callbacks of the endpoint', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('state://foo.bar.hello', cb, { first: 'world' }))
      expect(cb).toHaveBeenCalledWith('world')
      set('state://foo.bar.hello', 'mars')

      jest.runAllTimers()

      expect(cb).toHaveBeenCalledWith('mars')
    })

    it('does not trigger the callbacks if the value is the same', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('state://foo.bar.hello', cb, { first: 'world' }))
      expect(cb).toHaveBeenCalledWith('world')
      set('state://foo.bar.hello', 'world')

      jest.runAllTimers()

      expect(cb.mock.calls.length).toBe(1)
    })

    it('triggers the parent callbacks', () => {
      const cbFooBarHello = jest.fn()
      const cbFooBar = jest.fn()
      const cbFoo = jest.fn()
      const cbFooNot = jest.fn()
      unsubscribes.push(onGet('state://foo.bar.hello', cbFooBarHello))
      unsubscribes.push(onGet('state://foo.bar', cbFooBar))
      unsubscribes.push(onGet('state://foo.Not', cbFooNot))
      unsubscribes.push(onGet('state://foo', cbFoo))

      set('state://foo.bar.hello', 'mars')

      jest.runAllTimers()

      expect(cbFooBarHello).toHaveBeenCalledWith('mars')
      expect(cbFooBar).toHaveBeenCalledWith({ hello: 'mars' })
      expect(cbFoo).toHaveBeenCalledWith({ bar: { hello: 'mars' } })
      expect(cbFooNot).not.toHaveBeenCalled()
    })

    it('triggers the children callbacks', () => {
      const cbFooBarHello = jest.fn()
      const cbFooBar = jest.fn()
      const cbFoo = jest.fn()
      const cbFooNot = jest.fn()
      unsubscribes.push(onGet('state://foo.bar.hello', cbFooBarHello))
      unsubscribes.push(onGet('state://foo.bar', cbFooBar))
      unsubscribes.push(onGet('state://foo.Not', cbFooNot))
      unsubscribes.push(onGet('state://foo', cbFoo))

      set('state://foo', { bar: { hello: 'mars' } })

      jest.runAllTimers()

      expect(cbFooBarHello).toHaveBeenCalledWith('mars')
      expect(cbFooBar).toHaveBeenCalledWith({ hello: 'mars' })
      expect(cbFoo).toHaveBeenCalledWith({ bar: { hello: 'mars' } })
      expect(cbFooNot).not.toHaveBeenCalled()
    })
  })

  describe('get', () => {
    it('returns the value for a url', () => {
      set('state://foo.bar.hello', 'mars')
      expect(get('state://foo.bar.hello')).toBe('mars')
      expect(get('state://foo.bar')).toEqual({ hello: 'mars' })
      expect(get('state://foo')).toEqual({ bar: { hello: 'mars' } })
    })
  })
})

describe('localstorage', () => {
  beforeEach(() => {
    while (unsubscribes.length) {
      unsubscribes.pop()()
    }
    Object.keys(endpoints).forEach(key => delete endpoints[key])
    Object.keys(localStorage).forEach(key => delete localStorage[key])
  })

  describe('onGet', () => {
    it('should not call cb if there is no initial value', () => {
      console.log(localStorage)
      const cb = jest.fn()
      unsubscribes.push(onGet('localStorage://key', cb))

      expect(cb).not.toHaveBeenCalled()
    })

    it('should call cb with the initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('localStorage://key', cb, { first: 'world' }))

      expect(cb).toHaveBeenCalledWith('world')
      expect(localStorage.key).toBe('world')
    })

    it('should call cb with the current value, if exists', () => {
      localStorage.key = 'mars'
      const cb = jest.fn()

      unsubscribes.push(onGet('localStorage://key', cb))

      expect(cb).toHaveBeenCalledWith('mars')
    })

    it('should call cb with the current value, even if pass a different initial one', () => {
      localStorage.key = 'mars'
      const cb = jest.fn()

      unsubscribes.push(onGet('localStorage://key', cb, { first: 'world' }))
      expect(localStorage.key).toBe('mars')
      expect(cb).toHaveBeenCalledWith('mars')
    })
  })

  describe('set', () => {
    it('triggers the callbacks of the endpoint', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('localStorage://key', cb))
      set('localStorage://key', 'mars')
      expect(localStorage.key).toBe('mars')
      jest.runAllTimers()
      expect(cb).toHaveBeenCalledWith('mars')
    })
    it('dows no trigger the callbacks if the value is the same', () => {
      const cb = jest.fn()
      localStorage.key = 'mars'
      unsubscribes.push(onGet('localStorage://key', cb))
      expect(cb).toHaveBeenCalledWith('mars')
      set('localStorage://key', 'mars')
      expect(localStorage.key).toBe('mars')
      jest.runAllTimers()
      expect(cb.mock.calls.length).toBe(1)
    })
  })

  describe('get', () => {
    it('returns the value for a url', () => {
      localStorage.key = 'mars'
      expect(get('localStorage://key')).toBe('mars')
    })
  })

  describe('refresh', () => {
    it('triggers the callbacks of the endpoint', () => {
      const cb = jest.fn()
      localStorage.key = 'earth'
      localStorage.PUTU = 'ruu'
      unsubscribes.push(onGet('localStorage://key', cb))

      localStorage.key = 'mars'
      localStorage.DE = 'FUA'

      endpoints['localStorage://key'].last = -Infinity
      refresh('localStorage://key')
      jest.runAllTimers()
      expect(cb).toHaveBeenCalledWith('mars')
    })
    it('dows no trigger the callbacks if the value is the same', () => {
      const cb = jest.fn()
      localStorage.key = 'earth'
      unsubscribes.push(onGet('localStorage://key', cb))
      cb.mockClear()
      refresh('localStorage://key')
      jest.runAllTimers()
      expect(cb).not.toHaveBeenCalled()
    })
  })
})

describe('sessionstorage', () => {
  beforeEach(() => {
    while (unsubscribes.length) {
      unsubscribes.pop()()
    }
    Object.keys(endpoints).forEach(key => delete endpoints[key])
    Object.keys(sessionStorage).forEach(key => delete sessionStorage[key])
  })

  describe('onGet', () => {
    it('should not call cb if there is no initial value', () => {
      console.log(sessionStorage)
      const cb = jest.fn()
      unsubscribes.push(onGet('sessionStorage://key', cb))

      expect(cb).not.toHaveBeenCalled()
    })

    it('should call cb with the initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('sessionStorage://key', cb, { first: 'world' }))

      expect(cb).toHaveBeenCalledWith('world')
      expect(sessionStorage.key).toBe('world')
    })

    it('should call cb with the current value, if exists', () => {
      sessionStorage.key = 'mars'
      const cb = jest.fn()

      unsubscribes.push(onGet('sessionStorage://key', cb))

      expect(cb).toHaveBeenCalledWith('mars')
    })

    it('should call cb with the current value, even if pass a different initial one', () => {
      sessionStorage.key = 'mars'
      const cb = jest.fn()

      unsubscribes.push(onGet('sessionStorage://key', cb, { first: 'world' }))
      expect(sessionStorage.key).toBe('mars')
      expect(cb).toHaveBeenCalledWith('mars')
    })
  })

  describe('set', () => {
    it('triggers the callbacks of the endpoint', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('sessionStorage://key', cb))
      set('sessionStorage://key', 'mars')
      expect(sessionStorage.key).toBe('mars')
      jest.runAllTimers()
      expect(cb).toHaveBeenCalledWith('mars')
    })
    it('dows no trigger the callbacks if the value is the same', () => {
      const cb = jest.fn()
      sessionStorage.key = 'mars'
      unsubscribes.push(onGet('sessionStorage://key', cb))
      expect(cb).toHaveBeenCalledWith('mars')
      set('sessionStorage://key', 'mars')
      expect(sessionStorage.key).toBe('mars')
      jest.runAllTimers()
      expect(cb.mock.calls.length).toBe(1)
    })
  })

  describe('get', () => {
    it('returns the value for a url', () => {
      sessionStorage.key = 'mars'
      expect(get('sessionStorage://key')).toBe('mars')
    })
  })

  describe('refresh', () => {
    it('triggers the callbacks of the endpoint', () => {
      const cb = jest.fn()
      sessionStorage.key = 'earth'
      sessionStorage.PUTU = 'ruu'
      unsubscribes.push(onGet('sessionStorage://key', cb))

      sessionStorage.key = 'mars'
      sessionStorage.DE = 'FUA'

      endpoints['sessionStorage://key'].last = -Infinity
      refresh('sessionStorage://key')
      jest.runAllTimers()
      expect(cb).toHaveBeenCalledWith('mars')
    })
    it('dows no trigger the callbacks if the value is the same', () => {
      const cb = jest.fn()
      sessionStorage.key = 'earth'
      unsubscribes.push(onGet('sessionStorage://key', cb))
      cb.mockClear()
      refresh('sessionStorage://key')
      jest.runAllTimers()
      expect(cb).not.toHaveBeenCalled()
    })
  })
})
