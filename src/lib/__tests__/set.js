import { set } from '../set'
import { isDifferent } from 'isdifferent'
import { resources } from '../conf'
import { getResource } from '../../private/getResource'
import { pospone } from '../../private/pospone'
import { executeHooks } from '../../private/setHooks'

jest.mock('isdifferent')
jest.mock('../../private/getResource')
jest.mock('../../private/pospone')
jest.mock('../../private/setHooks')
jest.useFakeTimers()
executeHooks.mockImplementation((where, context) => context)
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

  describe('debounce', () => {
    it('should debounce', () => {
      const resource = { plugin: {} }
      getResource.mockReturnValue(resource)

      set('debounceTest', 'uno', {
        debounce: 1000
      })
      expect(setTimeout.mock.calls[0][1]).toBe(1000)
      set('debounceTest', 'dos', {
        debounce: 1000
      })
      set('debounceTest', 'tres', {
        debounce: 1000
      })
      set('debounceTest', 'cuatro', {
        debounce: 1000
      })
      expect(executeHooks).not.toHaveBeenCalled()
      jest.runAllTimers()
      expect(executeHooks.mock.calls.length).toBe(2)
      expect(executeHooks.mock.calls[1][1].value).toBe('cuatro')
    })
  })
})
