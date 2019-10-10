import { getValue, setValue } from '@hacknlove/deepobject'
import { isDifferent } from 'isdifferent'
import { endpoints } from '../../src/conf'
import plugin, { propagateUp, propagateDown } from '../dotted'

jest.useFakeTimers()

jest.mock('isdifferent')
jest.mock('@hacknlove/deepobject')

jest.spyOn(global.console, 'warn').mockImplementation()

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

describe('propagateUp', () => {
  it('does nothing if url is empty', () => {
    propagateUp('')
    expect(getValue).not.toHaveBeenCalled()
  })
  it('does nothing if url has no parent', () => {
    propagateUp('noParent')
    expect(getValue).not.toHaveBeenCalled()
  })
  it('does not break if does not exists the parent endpoint', () => {
    propagateUp('parent.child')
    expect(getValue).not.toHaveBeenCalled()
  })
  it('calls propagateUp(parentUrl)', () => {
    propagateUp('parent.child')
    expect(setTimeout).toHaveBeenCalledWith(propagateUp, 0, 'parent')
  })
  it('updates parent value', () => {
    getValue.mockReturnValue('newParentValue')
    endpoints.parent = {
      callbacks: {}
    }
    propagateUp('parent.child')

    expect(endpoints.parent.value).toBe('newParentValue')
  })
  it('calls parent callbacks', () => {
    getValue.mockReturnValue('newParentValue')
    endpoints.parent = {
      callbacks: {
        one: jest.fn(),
        two: jest.fn()
      }
    }
    propagateUp('parent.child')
    jest.runAllTimers()
    expect(endpoints.parent.callbacks.one).toHaveBeenCalledWith('newParentValue')
    expect(endpoints.parent.callbacks.two).toHaveBeenCalledWith('newParentValue')
  })
})

describe('propagateDown', () => {
  it('if no child endpoints do nothing', () => {
    endpoints.noChild = {}
    propagateDown('parent')
    expect(getValue).not.toHaveBeenCalled()
  })
  it('use the right relative deepDottedKey', () => {
    endpoints['parent.grand.child'] = {
    }
    endpoints.parent = {
    }
    propagateDown('parent')
    expect(getValue).toHaveBeenCalledWith(endpoints.parent.value, 'grand.child')
  })

  it('it sets the child value', () => {
    endpoints['parent.grand.child'] = {
      callbacks: {}
    }
    endpoints.parent = {
    }
    getValue.mockReturnValue('newChildValue')
    isDifferent.mockReturnValue(true)
    propagateDown('parent')

    expect(endpoints['parent.grand.child'].value).toBe('newChildValue')
  })

  it('it calls the child callbacks', () => {
    endpoints['parent.grand.child'] = {
      callbacks: {
        one: jest.fn(),
        two: jest.fn()
      }
    }
    endpoints.parent = {
    }
    getValue.mockReturnValue('newChildValue')
    isDifferent.mockReturnValue(true)
    propagateDown('parent')
    jest.runAllTimers()

    expect(endpoints['parent.grand.child'].callbacks.one).toHaveBeenCalledWith('newChildValue')
    expect(endpoints['parent.grand.child'].callbacks.two).toHaveBeenCalledWith('newChildValue')
  })
})

describe('plugin', () => {
  describe('regex', () => {
    it('match the dotted:// url', () => {
      expect('dotted://foo/bar').toMatch(plugin.regex)
    })
    it('not match other url', () => {
      expect('file://foo/bar').not.toMatch(plugin.regex)
      expect('/foo/bar').not.toMatch(plugin.regex)
      expect('dotted:/foo/bar').not.toMatch(plugin.regex)
      expect('state://foo/bar').not.toMatch(plugin.regex)
    })
  })

  describe('refresh', () => {
    it('refresh shows a warn', () => {
      jest.spyOn(global.console, 'warn').mockImplementation()
      plugin.refresh()
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('getEndpoint', () => {
    it('updates the state if undefined', () => {
      getValue.mockReturnValue(undefined)
      setValue.mockReturnValue({}) // To not break other tests
      plugin.getEndpoint({
        url: 'dotted://some.new.key',
        value: 'newValue'
      })
      expect(setValue).toHaveBeenCalledWith({}, 'dotted://some.new.key', 'newValue')
    })

    it('updates the value if there is one in the state', () => {
      getValue.mockReturnValue('oldValue')
      const endpoint = {
        url: 'dotted://some.new.key',
        value: 'newValue'
      }
      plugin.getEndpoint(endpoint)
      expect(endpoint.value).toBe('oldValue')
    })
  })

  describe('get', () => {
    it('get at returns the value from the state', () => {
      getValue.mockReturnValue('stateValue')
      expect(plugin.get('someUrl')).toBe('stateValue')
      expect(getValue).toHaveBeenCalledWith({}, 'someUrl')
    })
  })

  describe('set', () => {
    it('updates the state', () => {
      const endpoint = {
        url: 'dotted://some.new.key',
        value: 'newValue'
      }
      setValue.mockReturnValue({})
      plugin.set(endpoint)
      expect(setValue).toHaveBeenCalledWith({}, 'dotted://some.new.key', 'newValue')
    })

    it('propagates up', () => {
      endpoints['dotted://some.new.key.foo.fii'] = {
        url: 'dotted://some.new.key.foo.fii',
        value: 'newValue'
      }
      endpoints['dotted://some'] = {
        url: 'dotted://some',
        callbacks: {
          one: jest.fn()
        },
        value: 'oldValue'
      }
      plugin.set(endpoints['dotted://some.new.key.foo.fii'])
      getValue.mockReturnValue('newValue')
      setValue.mockReturnValue({})
      jest.runAllTimers()
      expect(endpoints['dotted://some'].callbacks.one).toHaveBeenLastCalledWith('newValue')
    })

    it('propagates down', () => {
      endpoints['dotted://some'] = {
        url: 'dotted://some',
        value: 'newValue'
      }
      endpoints['dotted://some.new.key'] = {
        url: 'dotted://some.new.key',
        callbacks: {
          one: jest.fn()
        },
        value: 'oldValue'
      }
      plugin.set(endpoints['dotted://some'])
      getValue.mockReturnValue('newValue')
      setValue.mockReturnValue({})
      jest.runAllTimers()
      expect(endpoints['dotted://some.new.key'].callbacks.one).toHaveBeenLastCalledWith('newValue')
    })
  })

  describe('clean', () => {
    it('does nothing if there is children', () => {
      endpoints['dotted://some.deep.child.foo.bar'] = {}
      plugin.clean({
        url: 'dotted://some.deep.child'
      })
      expect(setTimeout).not.toHaveBeenCalled()
    })
    it('propagateUp if there is no children', () => {
      plugin.clean({
        url: 'dotted://some.deep.child'
      })
      expect(setTimeout).toHaveBeenCalledWith(propagateUp, 0, 'dotted://some.deep')
    })
  })
})
