import { set, insertHook, beforeSet, afterSet, executeHooks } from '../set'
import { isDifferent } from 'isdifferent'
import { endpoints, setHooks } from '../conf'
import { getEndpoint } from '../getEndpoint'
import { pospone } from '../pospone'

jest.mock('isdifferent')
jest.mock('../getEndpoint')
jest.mock('../pospone')
jest.useFakeTimers()
describe('set', () => {
  it('If the endpoint does not exist, getEndPoint should be called', async () => {
    const endpoint = { plugin: {} }
    getEndpoint.mockReturnValue(endpoint)

    await set('test', 'value')
    expect(getEndpoint).toHaveBeenCalledWith('test', 'value')
    expect(isDifferent).not.toHaveBeenCalled()
  })

  it('If the plugin has the hook set, it is called', async () => {
    const endpoint = {
      plugin: {
        set: jest.fn()
      }
    }
    getEndpoint.mockReturnValue(endpoint)

    await set('test', 'value')

    expect(endpoint.value).toBe('value')

    expect(endpoint.plugin.set).toHaveBeenCalledWith(endpoint)

    expect(isDifferent).not.toHaveBeenCalled()
  })

  it('set clean to undefined', async () => {
    endpoints.test = {
      clean: true
    }

    getEndpoint.mockReturnValue(endpoints.test)

    await set('test')

    expect(endpoints.test.clean).toBeUndefined()
  })

  it('if endpoint has no intervals, do no set last neither call pospone', async () => {
    endpoints.test = {}
    getEndpoint.mockReturnValue(endpoints.test)
    await set('test')
    expect(endpoints.test.last).toBeUndefined()
    expect(pospone).not.toHaveBeenCalled()
  })

  it('it not call pospone', async () => {
    endpoints.test = {
      intervals: {}
    }
    getEndpoint.mockReturnValue(endpoints.test)
    await set('test')
    expect(pospone).not.toHaveBeenCalled()
  })

  it('it calls pospone', async () => {
    endpoints.test = {
      intervals: {}
    }
    getEndpoint.mockReturnValue(endpoints.test)
    await set('test', undefined, true)
    expect(pospone).toHaveBeenCalledWith(endpoints.test)
  })

  it('if value is not different do not set the new value', async () => {
    endpoints.test = {
      value: 'old'
    }
    isDifferent.mockReturnValue(false)

    await set('test', 'new')

    expect(endpoints.test.value).toBe('old')
  })

  it('if value is different do not set the new value', async () => {
    endpoints.test = {
      value: 'old',
      callbacks: {},
      plugin: {}
    }
    getEndpoint.mockReturnValue(endpoints.test)
    isDifferent.mockReturnValue(true)

    await set('test', 'new')

    expect(endpoints.test.value).toBe('new')
  })

  it('if value is different and there is callbacks, call the callbacks', async () => {
    endpoints.test = {
      value: 'old',
      callbacks: {
        uno: jest.fn(),
        dos: jest.fn()
      },
      plugin: {}
    }
    getEndpoint.mockReturnValue(endpoints.test)
    isDifferent.mockReturnValue(true)

    await set('test', 'new')
    jest.runAllTimers()

    expect(endpoints.test.callbacks.uno).toHaveBeenCalledWith('new')
    expect(endpoints.test.callbacks.dos).toHaveBeenCalledWith('new')
  })

  it('if value is different and there is plugin.set, call plugin.set', async () => {
    endpoints.test = {
      value: 'old',
      callbacks: {
      },
      plugin: {
        set: jest.fn()
      }
    }
    getEndpoint.mockReturnValue(endpoints.test)
    isDifferent.mockReturnValue(true)

    await set('test', 'new')

    expect(endpoints.test.plugin.set).toHaveBeenCalledWith(endpoints.test)
  })
})

describe('hooks', () => {
  beforeEach(() => {
    setHooks.before = []
    setHooks.after = []
  })
  describe('insertHook', () => {
    it('inserts the hook in the array', () => {
      const array = []
      insertHook('/some/:path', 'function', array)

      expect(array).toStrictEqual([
        [
          /^\/some\/([^\/]+?)(?:\/)?$/i, // eslint-disable-line
          [
            {
              delimiter: '/',
              name: 'path',
              optional: false,
              pattern: '[^\\/]+?',
              prefix: '/',
              repeat: false
            }
          ],
          'function'
        ]
      ])
    })
  })

  describe('beforeSet', () => {
    afterEach(() => { setHooks.before.length = 0 })
    it('inserts the hook in setHooks.before', () => {
      beforeSet('/some/:path', 'function')
      expect(setHooks.before).toStrictEqual([
        [
          /^\/some\/([^\/]+?)(?:\/)?$/i, // eslint-disable-line
          [
            {
              delimiter: '/',
              name: 'path',
              optional: false,
              pattern: '[^\\/]+?',
              prefix: '/',
              repeat: false
            }
          ],
          'function'
        ]
      ])
    })
  })

  describe('afterSet', () => {
    afterEach(() => { setHooks.before.length = 0 })
    it('inserts the hook in setHooks.after', () => {
      afterSet('/some/:path', 'function')
      expect(setHooks.after).toStrictEqual([
        [
          /^\/some\/([^\/]+?)(?:\/)?$/i, // eslint-disable-line
          [
            {
              delimiter: '/',
              name: 'path',
              optional: false,
              pattern: '[^\\/]+?',
              prefix: '/',
              repeat: false
            }
          ],
          'function'
        ]
      ])
    })
  })

  describe('executeHooks', () => {
    it('stop executing hooks if any of them set preventMoreHooks to true', async () => {
      const where = [
        [/./, [], jest.fn()],
        [/./, [], jest.fn(event => { event.preventMoreHooks = true })],
        [/./, [], jest.fn()]
      ]
      await executeHooks('url', 'value', where)
      expect(where[0][2]).toHaveBeenCalled()
      expect(where[1][2]).toHaveBeenCalled()
      expect(where[2][2]).not.toHaveBeenCalled()
    })

    it('pass the correct event context', async () => {
      const where = [
        [/./, [], jest.fn()]
      ]
      await executeHooks('url', 'value', where, 'doPospone')
      const event = where[0][2].mock.calls[0][0]
      expect(event.doPospone).toBe('doPospone')
      expect(event.url).toBe('url')
      expect(event.value).toBe('value')
      expect(event.preventSet).toBe(false)
      expect(event.preventRefresh).toBe(false)
      expect(event.preventMoreHooks).toBe(false)
    })

    it('pass the same modifyable event context', async () => {
      const where = [
        [/./, [], jest.fn(event => {
          event.value = 'new value'
          event.foo = 'bar'
        })],
        [/./, [], jest.fn()]
      ]
      await executeHooks('url', 'value', where)
      const event = where[1][2].mock.calls[0][0]
      expect(event.value).toBe('new value')
      expect(event.foo).toBe('bar')
    })

    it('skips the hooks that does not match the url pattern', async () => {
      const where = [
        [/^a/, [], jest.fn()],
        [/^b/, [], jest.fn()]
      ]
      await executeHooks('a', 'value', where)
      expect(where[0][2]).toHaveBeenCalled()
      expect(where[1][2]).not.toHaveBeenCalled()
    })

    it('populates the params', async () => {
      const where = [
        [
          /^\/some\/([^\/]+?)(?:\/)?$/i, // eslint-disable-line
          [
            {
              delimiter: '/',
              name: 'name',
              optional: false,
              pattern: '[^\\/]+?',
              prefix: '/',
              repeat: false
            }
          ],
          jest.fn()
        ]
      ]

      await executeHooks('/some/param', 'value', where)
      expect(where[0][2].mock.calls[0][0].params).toStrictEqual({
        name: 'param'
      })
    })
  })

  describe('preventSet', () => {
    it('does not set', async () => {
      beforeSet('/url', event => { event.preventSet = true })
      await set('/url', 'value')
      expect(getEndpoint).not.toHaveBeenCalled()
    })
  })

  describe('preventRefresh', () => {
    it('does not call the callbacks', async () => {
      beforeSet('/url', event => { event.preventRefresh = true })
      endpoints['/url'] = {
        value: 'old',
        callbacks: {
          uno: jest.fn()
        },
        plugin: {}
      }

      await set('/url', 'new value')
      expect(endpoints['/url'].value).toBe('new value')
      expect(endpoints['/url'].callbacks.uno).not.toHaveBeenCalled()
    })
  })
})
