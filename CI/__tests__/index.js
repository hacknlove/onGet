/* global localStorage sessionStorage */
// Integration
import { onGet, set, get, refresh, resources } from '../../'

global.localStorage = {}
global.sessionStorage = {}
jest.useFakeTimers()
const unsubscribes = []

describe('dotted', () => {
  beforeEach(async () => {
    await set('dotted://foo', undefined)
    while (unsubscribes.length) {
      unsubscribes.pop()()
    }
    Object.keys(resources).forEach(key => delete resources[key])
  })

  describe('onGet', () => {
    it('should not call cb if there is no initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('dotted://foo.bar.hello', cb))

      expect(cb).not.toHaveBeenCalled()
    })

    it('should call cb with the initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('dotted://foo.bar.hello', cb, { first: 'world' }))

      expect(cb).toHaveBeenCalledWith('world')
    })

    it('should call cb with the current value, if exists', async () => {
      await set('dotted://foo.bar.hello', 'mars')
      const cb = jest.fn()

      unsubscribes.push(onGet('dotted://foo.bar.hello', cb))

      expect(cb).toHaveBeenCalledWith('mars')
    })

    it('should call cb with the current value, even if pass a different initial one', async () => {
      await set('dotted://foo.bar.hello', 'mars')
      const cb = jest.fn()

      unsubscribes.push(onGet('dotted://foo.bar.hello', cb, { first: 'world' }))

      expect(cb).toHaveBeenCalledWith('mars')
    })
  })

  describe('set', () => {
    it('triggers the callbacks of the resource', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('dotted://foo.bar.hello', cb, { first: 'world' }))
      expect(cb).toHaveBeenCalledWith('world')
      await set('dotted://foo.bar.hello', 'mars')

      jest.runAllTimers()

      expect(cb).toHaveBeenCalledWith('mars')
    })

    it('does not trigger the callbacks if the value is the same', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('dotted://foo.bar.hello', cb, { first: 'world' }))
      expect(cb).toHaveBeenCalledWith('world')
      await set('dotted://foo.bar.hello', 'world')

      jest.runAllTimers()

      expect(cb.mock.calls.length).toBe(1)
    })

    it('triggers the parent callbacks', async () => {
      const cbFooBarHello = jest.fn()
      const cbFooBar = jest.fn()
      const cbFoo = jest.fn()
      const cbFooNot = jest.fn()
      unsubscribes.push(onGet('dotted://foo.bar.hello', cbFooBarHello))
      unsubscribes.push(onGet('dotted://foo.bar', cbFooBar))
      unsubscribes.push(onGet('dotted://foo.Not', cbFooNot))
      unsubscribes.push(onGet('dotted://foo', cbFoo))

      await set('dotted://foo.bar.hello', 'mars')

      jest.runAllTimers()

      expect(cbFooBarHello).toHaveBeenCalledWith('mars')
      expect(cbFooBar).toHaveBeenCalledWith({ hello: 'mars' })
      expect(cbFoo).toHaveBeenCalledWith({ bar: { hello: 'mars' } })
      expect(cbFooNot).not.toHaveBeenCalled()
    })

    it('triggers the children callbacks', async () => {
      const cbFooBarHello = jest.fn()
      const cbFooBar = jest.fn()
      const cbFoo = jest.fn()
      const cbFooNot = jest.fn()
      unsubscribes.push(onGet('dotted://foo.bar.hello', cbFooBarHello))
      unsubscribes.push(onGet('dotted://foo.bar', cbFooBar))
      unsubscribes.push(onGet('dotted://foo.Not', cbFooNot))
      unsubscribes.push(onGet('dotted://foo', cbFoo))

      await set('dotted://foo', { bar: { hello: 'mars' } })

      jest.runAllTimers()

      expect(cbFooBarHello).toHaveBeenCalledWith('mars')
      expect(cbFooBar).toHaveBeenCalledWith({ hello: 'mars' })
      expect(cbFoo).toHaveBeenCalledWith({ bar: { hello: 'mars' } })
      expect(cbFooNot).not.toHaveBeenCalled()
    })
  })

  describe('get', () => {
    it('returns the value for a url', async () => {
      await set('dotted://foo.bar.hello', 'mars')
      expect(get('dotted://foo.bar.hello')).toBe('mars')
      expect(get('dotted://foo.bar')).toEqual({ hello: 'mars' })
      expect(get('dotted://foo')).toEqual({ bar: { hello: 'mars' } })
    })
  })
})

describe('localstorage', () => {
  beforeEach(() => {
    while (unsubscribes.length) {
      unsubscribes.pop()()
    }
    Object.keys(resources).forEach(key => delete resources[key])
    Object.keys(localStorage).forEach(key => delete localStorage[key])
  })

  describe('onGet', () => {
    it('should not call cb if there is no initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('localStorage://key', cb))

      expect(cb).not.toHaveBeenCalled()
    })

    it('should call cb with the initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('localStorage://key', cb, { first: 'world' }))

      expect(cb).toHaveBeenCalledWith('world')
      expect(JSON.parse(localStorage.key)).toBe('world')
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
    it('triggers the callbacks of the resource', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('localStorage://key', cb))
      await set('localStorage://key', 'mars')
      expect(JSON.parse(localStorage.key)).toBe('mars')
      jest.runAllTimers()
      expect(cb).toHaveBeenCalledWith('mars')
    })
    it('dows no trigger the callbacks if the value is the same', async () => {
      const cb = jest.fn()
      localStorage.key = 'mars'
      unsubscribes.push(onGet('localStorage://key', cb))
      expect(cb).toHaveBeenCalledWith('mars')
      await set('localStorage://key', 'mars')
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
    it('triggers the callbacks of the resource', async () => {
      const cb = jest.fn()
      localStorage.key = 'earth'
      unsubscribes.push(onGet('localStorage://key', cb))

      localStorage.key = 'mars'
      resources['localStorage://key'].last = -Infinity
      await refresh('localStorage://key')
      jest.runAllTimers()
      expect(cb).toHaveBeenCalledWith('mars')
    })
    it('dows no trigger the callbacks if the value is the same', async () => {
      const cb = jest.fn()
      localStorage.key = 'earth'
      unsubscribes.push(onGet('localStorage://key', cb))
      cb.mockClear()
      await refresh('localStorage://key')
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
    Object.keys(resources).forEach(key => delete resources[key])
    Object.keys(sessionStorage).forEach(key => delete sessionStorage[key])
  })

  describe('onGet', () => {
    it('should not call cb if there is no initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('sessionStorage://key', cb))

      expect(cb).not.toHaveBeenCalled()
    })

    it('should call cb with the initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('sessionStorage://key', cb, { first: 'world' }))

      expect(cb).toHaveBeenCalledWith('world')
      expect(JSON.parse(sessionStorage.key)).toBe('world')
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
    it('triggers the callbacks of the resource', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('sessionStorage://key', cb))
      await set('sessionStorage://key', 'mars')
      expect(JSON.parse(sessionStorage.key)).toBe('mars')
      jest.runAllTimers()
      expect(cb).toHaveBeenCalledWith('mars')
    })
    it('dows no trigger the callbacks if the value is the same', async () => {
      const cb = jest.fn()
      sessionStorage.key = 'mars'
      unsubscribes.push(onGet('sessionStorage://key', cb))
      expect(cb).toHaveBeenCalledWith('mars')
      await set('sessionStorage://key', 'mars')
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
    it('triggers the callbacks of the resource', async () => {
      const cb = jest.fn()
      sessionStorage.key = 'earth'
      unsubscribes.push(onGet('sessionStorage://key', cb))

      sessionStorage.key = 'mars'

      resources['sessionStorage://key'].last = -Infinity
      await refresh('sessionStorage://key')
      jest.runAllTimers()
      expect(cb).toHaveBeenCalledWith('mars')
    })
    it('dows no trigger the callbacks if the value is the same', async () => {
      const cb = jest.fn()
      sessionStorage.key = 'earth'
      unsubscribes.push(onGet('sessionStorage://key', cb))
      cb.mockClear()
      await refresh('sessionStorage://key')
      jest.runAllTimers()
      expect(cb).not.toHaveBeenCalled()
    })
  })
})

describe('fast', () => {
  beforeEach(() => {
    while (unsubscribes.length) {
      unsubscribes.pop()()
    }
    Object.keys(resources).forEach(key => delete resources[key])
  })

  describe('onGet', () => {
    it('should not call cb if there is no initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('fast://foo', cb))

      expect(cb).not.toHaveBeenCalled()
    })

    it('should call cb with the initial value', () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('fast://foo', cb, { first: 'world' }))

      expect(cb).toHaveBeenCalledWith('world')
    })

    it('should call cb with the current value, if exists', () => {
      set('fast://foo', 'mars')
      const cb = jest.fn()

      unsubscribes.push(onGet('fast://foo', cb))

      expect(cb).toHaveBeenCalledWith('mars')
    })

    it('should call cb with the current value, even if pass a different initial one', async () => {
      await set('fast://foo', 'mars')
      const cb = jest.fn()

      unsubscribes.push(onGet('fast://foo', cb, { first: 'world' }))

      expect(cb).toHaveBeenCalledWith('mars')
    })
  })

  describe('set', () => {
    it('triggers the callbacks of the resource', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('fast://foo', cb, { first: 'world' }))
      expect(cb).toHaveBeenCalledWith('world')
      set('fast://foo', 'mars')
      expect(cb).toHaveBeenCalledWith('mars')
    })

    it('does not trigger the callbacks if the value is the same', async () => {
      const cb = jest.fn()
      unsubscribes.push(onGet('fast://foo', cb, { first: 'world' }))
      expect(cb).toHaveBeenCalledWith('world')
      set('fast://foo', 'world')

      jest.runAllTimers()

      expect(cb.mock.calls.length).toBe(1)
    })
  })

  describe('get', () => {
    it('returns the value for a url', async () => {
      set('fast://foo', 'mars')
      expect(get('fast://foo')).toBe('mars')
    })
  })
})
