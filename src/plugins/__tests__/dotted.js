import { getValue, setValue, deleteValue } from '@hacknlove/deepobject'
import { isDifferent } from 'isdifferent'
import { resources } from '../../lib/conf'
import plugin, { propagateUp, propagateDown } from '../dotted'

const deepobject = jest.requireActual('@hacknlove/deepobject')

jest.useFakeTimers()

jest.mock('isdifferent')
jest.mock('@hacknlove/deepobject')

jest.spyOn(global.console, 'warn').mockImplementation()

beforeEach(() => {
  Object.keys(resources).forEach(key => delete resources[key])
  setValue.mockReturnValue({})
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
  it('does not break if does not exists the parent resource', () => {
    propagateUp('parent.child')
    expect(getValue).not.toHaveBeenCalled()
  })
  it('calls propagateUp(parentUrl)', () => {
    resources.parent = {
      url: 'parent',
      callbacks: {}
    }
    propagateUp('parent.child')
    expect(getValue.mock.calls[0][1]).toBe('parent')
  })
  it('updates parent value', () => {
    getValue.mockReturnValue('newParentValue')
    resources.parent = {
      callbacks: {}
    }
    propagateUp('parent.child')

    expect(resources.parent.value).toBe('newParentValue')
  })
  it('calls parent callbacks', () => {
    getValue.mockReturnValue('newParentValue')
    resources.parent = {
      callbacks: {
        one: jest.fn(),
        two: jest.fn()
      }
    }
    propagateUp('parent.child')
    jest.runAllTimers()
    expect(resources.parent.callbacks.one).toHaveBeenCalledWith('newParentValue')
    expect(resources.parent.callbacks.two).toHaveBeenCalledWith('newParentValue')
  })
})

describe('propagateDown', () => {
  it('if no child resources do nothing', () => {
    resources.noChild = {}
    propagateDown('parent')
    expect(getValue).not.toHaveBeenCalled()
  })
  it('use the right relative deepDottedKey', () => {
    resources['parent.grand.child'] = {
    }
    resources.parent = {
    }
    propagateDown('parent')
    expect(getValue).toHaveBeenCalledWith(resources.parent.value, 'grand.child')
  })

  it('it sets the child value', () => {
    resources['parent.grand.child'] = {
      callbacks: {}
    }
    resources.parent = {
    }
    getValue.mockReturnValue('newChildValue')
    isDifferent.mockReturnValue(true)
    propagateDown('parent')

    expect(resources['parent.grand.child'].value).toBe('newChildValue')
  })

  it('it calls the child callbacks', () => {
    resources['parent.grand.child'] = {
      callbacks: {
        one: jest.fn(),
        two: jest.fn()
      }
    }
    resources.parent = {
    }
    getValue.mockReturnValue('newChildValue')
    isDifferent.mockReturnValue(true)
    propagateDown('parent')
    jest.runAllTimers()

    expect(resources['parent.grand.child'].callbacks.one).toHaveBeenCalledWith('newChildValue')
    expect(resources['parent.grand.child'].callbacks.two).toHaveBeenCalledWith('newChildValue')
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

  describe('getResource', () => {
    it('updates the state if undefined', () => {
      getValue.mockReturnValue(undefined)
      setValue.mockReturnValue({}) // To not break other tests
      plugin.getResource({
        url: 'dotted://some.new.key',
        value: 'newValue'
      })
      expect(setValue).toHaveBeenCalledWith({}, 'dotted://some.new.key', 'newValue')
    })

    it('updates the value if there is one in the state', () => {
      getValue.mockReturnValue('oldValue')
      const resource = {
        url: 'dotted://some.new.key',
        value: 'newValue'
      }
      plugin.getResource(resource)
      expect(resource.value).toBe('oldValue')
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
      const resource = {
        url: 'dotted://some.new.key',
        value: 'newValue'
      }
      setValue.mockReturnValue({})
      plugin.set(resource)
      expect(setValue).toHaveBeenCalledWith({}, 'dotted://some.new.key', 'newValue')
    })

    it('propagates up', () => {
      resources['dotted://some.new.key.foo.fii'] = {
        url: 'dotted://some.new.key.foo.fii',
        value: 'newValue'
      }
      resources['dotted://some'] = {
        url: 'dotted://some',
        callbacks: {
          one: jest.fn()
        },
        value: 'oldValue'
      }
      getValue.mockReturnValue('newValue')
      plugin.set(resources['dotted://some.new.key.foo.fii'])
      setValue.mockReturnValue({})
      jest.runAllTimers()
      expect(resources['dotted://some'].callbacks.one).toHaveBeenLastCalledWith('newValue')
    })

    it('propagates down', () => {
      resources['dotted://some'] = {
        url: 'dotted://some',
        value: 'newValue'
      }
      resources['dotted://some.new.key'] = {
        url: 'dotted://some.new.key',
        callbacks: {
          one: jest.fn()
        },
        value: 'oldValue'
      }
      plugin.set(resources['dotted://some'])
      getValue.mockReturnValue('newValue')
      setValue.mockReturnValue({})
      jest.runAllTimers()
      expect(resources['dotted://some.new.key'].callbacks.one).toHaveBeenLastCalledWith('newValue')
    })
  })

  describe('clean', () => {
    it('does nothing if there is children', () => {
      resources['dotted://some.deep.child.foo.bar'] = {}
      plugin.clean({
        url: 'dotted://some.deep.child'
      })
      expect(setTimeout).not.toHaveBeenCalled()
    })
    it('propagateUp if there is no children', () => {
      resources['dotted://some.deep'] = {
        url: 'dotted://some.deep',
        callbacks: {}
      }
      plugin.clean({
        url: 'dotted://some.deep.child'
      })
      expect(getValue.mock.calls[0][1]).toBe('dotted://some.deep')
    })
  })

  describe('commands', () => {
    describe('remove', () => {
      it('ok', () => {
        plugin.commands.remove('one.removed.dotted.url')
        expect(deleteValue).toHaveBeenCalled()
      })
    })
  })

  describe('start', () => {
    it('restart the state', () => {
      setValue.mockImplementation(deepobject.setValue)
      getValue.mockImplementation(deepobject.getValue)
      plugin.set({
        url: 'url',
        value: 'value'
      })
      expect(plugin.get('url')).toBe('value')
      plugin.start()
      expect(plugin.get('url')).toBeUndefined()
    })
  })

  describe('save, load', () => {
    it('returns undefined if there is no data in the state', () => {
      plugin.load({})
      expect(plugin.save()).toBeUndefined()
    })
    it('returns the state, if it has data', () => {
      plugin.load({ foo: 'bar' })
      expect(plugin.save()).toStrictEqual({ foo: 'bar' })
    })
  })

  describe('saveResource', () => {
    it('set skip', () => {
      const savedResource = {}
      plugin.saveResource('', savedResource)
      expect(savedResource.preventSave).toBe(true)
    })
  })
})
