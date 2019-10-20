import { _set } from '../set'

describe('_set', () => {
  it('does nothing if the new value is not different', () => {
    const value = ['oldValue']
    const resource = {
      value,
      callbacks: {
        test: jest.fn()
      }
    }
    _set(resource, ['oldValue'])

    expect(resource.value).toBe(value)
    expect(resource.callbacks.test).not.toHaveBeenCalled()
  })

  it('calls the callbacks it different', () => {
    const resource = {
      value: 'oldValue',
      callbacks: {
        test: jest.fn()
      },
      plugin: {}
    }
    _set(resource, 'newValue')

    expect(resource.value).toBe('newValue')
    expect(resource.callbacks.test).toHaveBeenCalledWith('newValue')
  })

  it('dows not call the callbacks it preventRefresh', () => {
    const resource = {
      value: 'oldValue',
      callbacks: {
        test: jest.fn()
      },
      plugin: {}
    }
    _set(resource, 'newValue', true)

    expect(resource.value).toBe('newValue')
    expect(resource.callbacks.test).not.toHaveBeenCalledWith('newValue')
  })
})
