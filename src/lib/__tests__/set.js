import { set, insertHook, beforeSet, afterSet, executeHooks } from '../set'
import { isDifferent } from 'isdifferent'
import { resources, setHooks } from '../conf'
import { getResource } from '../../private/getResource'
import { pospone } from '../../private/pospone'

jest.mock('isdifferent')
jest.mock('../../private/getResource')
jest.mock('../../private/pospone')
jest.useFakeTimers()
describe('set', () => {
  it('If the resource does not exist, getResource should be called', async () => {
    const resource = { plugin: {} }
    getResource.mockReturnValue(resource)

    set('test', 'value')
    expect(getResource).toHaveBeenCalledWith('test', 'value')
    expect(isDifferent).not.toHaveBeenCalled()
  })

  it('If the plugin has the hook set, it is called', async () => {
    const resource = {
      plugin: {
        set: jest.fn()
      }
    }
    getResource.mockReturnValue(resource)

    set('test', 'value')

    expect(resource.value).toBe('value')

    expect(resource.plugin.set).toHaveBeenCalledWith(resource)

    expect(isDifferent).not.toHaveBeenCalled()
  })

  it('set clean to undefined', async () => {
    resources.test = {
      clean: true
    }

    getResource.mockReturnValue(resources.test)

    set('test')

    expect(resources.test.clean).toBeUndefined()
  })

  it('if resource has no intervals, do no set last neither call pospone', async () => {
    resources.test = {}
    getResource.mockReturnValue(resources.test)
    set('test')
    expect(resources.test.last).toBeUndefined()
    expect(pospone).not.toHaveBeenCalled()
  })

  it('it call pospone', async () => {
    resources.test = {
      intervals: {}
    }
    getResource.mockReturnValue(resources.test)
    set('test')
    expect(pospone).toHaveBeenCalledWith(resources.test)
  })

  it('do not call pospone', async () => {
    resources.test = {
      intervals: {}
    }
    getResource.mockReturnValue(resources.test)
    set('test', undefined, { preventPospone: true })
    expect(pospone).not.toHaveBeenCalled()
  })

  it('if value is not different do not set the new value', async () => {
    resources.test = {
      value: 'old'
    }
    isDifferent.mockReturnValue(false)

    set('test', 'new')

    expect(resources.test.value).toBe('old')
  })

  it('if value is different set the new value', async () => {
    resources.test = {
      value: 'old',
      callbacks: {},
      plugin: {}
    }
    getResource.mockReturnValue(resources.test)
    isDifferent.mockReturnValue(true)

    set('test', 'new')

    expect(resources.test.value).toBe('new')
  })

  it('if value is different and there is callbacks, call the callbacks', async () => {
    resources.test = {
      value: 'old',
      callbacks: {
        uno: jest.fn(),
        dos: jest.fn()
      },
      plugin: {}
    }
    getResource.mockReturnValue(resources.test)
    isDifferent.mockReturnValue(true)

    set('test', 'new')
    jest.runAllTimers()

    expect(resources.test.callbacks.uno).toHaveBeenCalledWith('new')
    expect(resources.test.callbacks.dos).toHaveBeenCalledWith('new')
  })

  it('if value is different and there is plugin.set, call plugin.set', async () => {
    resources.test = {
      value: 'old',
      callbacks: {
      },
      plugin: {
        set: jest.fn()
      }
    }
    getResource.mockReturnValue(resources.test)
    isDifferent.mockReturnValue(true)

    set('test', 'new')

    expect(resources.test.plugin.set).toHaveBeenCalledWith(resources.test, 'old', undefined)
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
    it('stop executing hooks if any of them set preventHooks to true', async () => {
      const where = [
        [/./, [], jest.fn()],
        [/./, [], jest.fn(event => { event.preventHooks = true })],
        [/./, [], jest.fn()]
      ]
      executeHooks(where, {
        url: 'url',
        value: 'value'
      })
      expect(where[0][2]).toHaveBeenCalled()
      expect(where[1][2]).toHaveBeenCalled()
      expect(where[2][2]).not.toHaveBeenCalled()
    })

    it('pass the correct event context', async () => {
      const where = [
        [/./, [], jest.fn()]
      ]
      executeHooks(where, {
        url: 'url',
        value: 'value',
        preventPospone: 'preventPospone'
      })
      const event = where[0][2].mock.calls[0][0]
      expect(event.preventPospone).toBe('preventPospone')
      expect(event.url).toBe('url')
      expect(event.value).toBe('value')
      expect(event.preventSet).toBeUndefined()
      expect(event.preventRefresh).toBeUndefined()
      expect(event.preventHooks).toBeUndefined()
    })

    it('pass the same modifyable event context', async () => {
      const where = [
        [/./, [], jest.fn(event => {
          event.value = 'new value'
          event.foo = 'bar'
        })],
        [/./, [], jest.fn()]
      ]
      executeHooks(where, {
        url: 'url',
        value: 'value'
      })
      const event = where[1][2].mock.calls[0][0]
      expect(event.value).toBe('new value')
      expect(event.foo).toBe('bar')
    })

    it('skips the hooks that does not match the url pattern', async () => {
      const where = [
        [/^a/, [], jest.fn()],
        [/^b/, [], jest.fn()]
      ]
      executeHooks(where, {
        url: 'a',
        value: 'value'
      })
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

      executeHooks(where, {
        url: '/some/param',
        value: 'value'
      })
      expect(where[0][2].mock.calls[0][0].params).toStrictEqual({
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
