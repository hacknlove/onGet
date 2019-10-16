import { get } from '../get'
import { findPlugin } from '../../private/findPlugin'
import { resources } from '../conf'

jest.mock('../../private/findPlugin')

beforeEach(() => Object.keys(resources).forEach(key => delete resources[key]))

describe('get', () => {
  it('returns the cached value, if exists', () => {
    resources.someUrl = {
      value: 'value'
    }
    expect(get('someUrl')).toBe('value')
  })

  it('calls findPlugin, if there is no cached value', () => {
    findPlugin.mockReturnValue({})
    get('someUrl')
    expect(findPlugin).toHaveBeenCalledWith('someUrl')
  })

  it('returns undefined if there is no plugin', () => {
    findPlugin.mockReturnValue({})
    expect(get('someUrl')).toBeUndefined()
  })

  it('returns the value returned by the plugin', () => {
    const getPlugin = jest.fn(() => 'returnedValue')
    findPlugin.mockImplementation(() => {
      return {
        get: getPlugin
      }
    })
    expect(get('someUrl')).toBe('returnedValue')
    expect(getPlugin).toHaveBeenCalledWith('someUrl')
  })
})
