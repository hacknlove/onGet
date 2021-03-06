import { set } from '../set'
import { refresh } from '../refresh'
import { afterSet } from '../afterSet'
import { beforeSet } from '../beforeSet'
import { beforeRefetch } from '../beforeRefetch'
import { insertHook, executeHooks } from '../../private/setHooks'
import { resources, setHooks } from '../conf'
import { getResource } from '../../private/getResource'
import { isDifferent } from 'isdifferent'

jest.mock('isdifferent')
jest.mock('../../private/getResource')
jest.mock('../../private/pospone')
jest.useFakeTimers()

describe('hooks', () => {
  beforeEach(() => {
    setHooks.beforeSet = []
    setHooks.afterSet = []
    setHooks.beforeRefetch = []
  })
  describe('insertHook', () => {
    it('inserts the hook in the array', () => {
      const array = []
      insertHook('/some/:path', 'function', array)

      expect(array).toHaveLength(1)
    })
  })

  describe('beforeSet', () => {
    afterEach(() => { setHooks.beforeSet.length = 0 })
    it('inserts the hook in setHooks.beforeSet', () => {
      beforeSet('/some/:path', 'function')
      expect(setHooks.beforeSet).toHaveLength(1)
    })
  })

  describe('beforeRefetch', () => {
    afterEach(() => { setHooks.beforeRefetch.length = 0 })
    it('inserts the hook in setHooks.beforeRefetch', () => {
      beforeRefetch('/some/:path', 'function')
      expect(setHooks.beforeRefetch).toHaveLength(1)
    })
    describe('preventRefresh', () => {
      it('prevent refresh to take place', () => {
        beforeRefetch('/url', context => {
          context.preventRefresh = true
        })
        resources['/url'] = {
          callbacks: {
            uno: jest.fn()
          },
          plugin: {
            refresh: jest.fn()
          }
        }

        refresh('/url')
        expect(resources['/url'].callbacks.uno).not.toHaveBeenCalled()
        expect(resources['/url'].plugin.refresh).not.toHaveBeenCalled()
      })
    })
    describe('set parameter to refresh', () => {
      it('calls plugin.refersh with an extra parameter', () => {
        beforeRefetch('/url', context => {
          context.options = 'plugin options'
        })
        resources['/url'] = {
          callbacks: {
            uno: jest.fn()
          },
          last: -Infinity,
          plugin: {
            conf: {
              threshold: 5000
            },
            refresh: jest.fn()
          }
        }

        refresh('/url')
        expect(resources['/url'].plugin.refresh).toHaveBeenCalledWith(resources['/url'], 'plugin options')
      })
    })
  })

  describe('afterSet', () => {
    afterEach(() => { setHooks.beforeSet.length = 0 })
    it('inserts the hook in setHooks.afterSet', () => {
      afterSet('/some/:path', 'function')
      expect(setHooks.afterSet).toHaveLength(1)
    })
  })

  describe('executeHooks', () => {
    it('stop executing hooks if any of them set preventHooks to true', async () => {
      const where = [
        [() => ({}), jest.fn()],
        [() => ({}), jest.fn(event => { event.preventHooks = true })],
        [() => ({}), jest.fn()]
      ]
      executeHooks(where, {
        url: 'url',
        value: 'value'
      })
      expect(where[0][1]).toHaveBeenCalled()
      expect(where[1][1]).toHaveBeenCalled()
      expect(where[2][1]).not.toHaveBeenCalled()
    })

    it('pass the correct event context', async () => {
      const where = [
        [() => ({}), jest.fn()]
      ]
      executeHooks(where, {
        url: 'url',
        value: 'value',
        preventPospone: 'preventPospone'
      })
      const event = where[0][1].mock.calls[0][0]
      expect(event.preventPospone).toBe('preventPospone')
      expect(event.url).toBe('url')
      expect(event.value).toBe('value')
      expect(event.preventSet).toBeUndefined()
      expect(event.preventRefresh).toBeUndefined()
      expect(event.preventHooks).toBeUndefined()
    })

    it('pass the same modifyable event context', async () => {
      const where = [
        [() => ({}), jest.fn(event => {
          event.value = 'new value'
          event.foo = 'bar'
        })],
        [() => ({}), jest.fn()]
      ]
      executeHooks(where, {
        url: 'url',
        value: 'value'
      })
      const event = where[1][1].mock.calls[0][0]
      expect(event.value).toBe('new value')
      expect(event.foo).toBe('bar')
    })

    it('skips the hooks that does not match the url pattern', async () => {
      const where = [
        [() => ({}), jest.fn()],
        [() => false, jest.fn()]
      ]
      executeHooks(where, {
        url: 'a',
        value: 'value'
      })
      expect(where[0][1]).toHaveBeenCalled()
      expect(where[1][1]).not.toHaveBeenCalled()
    })

    it('populates the params', async () => {
      const where = [
        [
          () => ({ params: { name: 'param' } }),
          jest.fn()
        ]
      ]

      executeHooks(where, {
        url: '/some/param',
        value: 'value'
      })
      expect(where[0][1].mock.calls[0][0].params).toStrictEqual({
        name: 'param'
      })
    })
  })

  describe('preventSet', () => {
    it('does not set', async () => {
      beforeSet('/url', event => { event.preventSet = true })
      set('/url', 'value')
      expect(getResource).not.toHaveBeenCalled()
    })
  })

  describe('preventRefresh', () => {
    it('does not call the callbacks', async () => {
      isDifferent.mockReturnValue(true)
      beforeSet('/url', event => { event.preventRefresh = true })
      resources['/url'] = {
        value: 'old',
        callbacks: {
          uno: jest.fn()
        },
        plugin: {}
      }

      set('/url', 'new value')
      expect(resources['/url'].value).toBe('new value')
      expect(resources['/url'].callbacks.uno).not.toHaveBeenCalled()
    })
  })
})
