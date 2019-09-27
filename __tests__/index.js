// Integration
import { onGet, set, get } from '../src'

import { endpoints } from '../src/conf'

jest.useFakeTimers()
var unsubscribes = []
beforeEach(() => {
  while (unsubscribes.length) {
    unsubscribes.pop()()
  }
  set('state://foo', undefined)
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

describe('state', () => {
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
