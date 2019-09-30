import isDifferent from 'isdifferent'
import { endpoints } from '../../src/conf'
import plugin, { cleanUrlAndGetHistory, getRelativeValue, propagate, state } from '../history'

jest.mock('isdifferent')

jest.spyOn(console, 'warn').mockImplementation()

const mockedCommand = jest.fn()

plugin.commands.mockedCommand = mockedCommand

beforeEach(() => Object.keys(state).forEach(key => delete state[key]))
beforeEach(() => mockedCommand.mockImplementation())

describe('cleanUrlAndGetHistory', () => {
  it('returns the history if exists', () => {
    state.someUrl = 'OK'

    expect(cleanUrlAndGetHistory('someUrl')).toBe('OK')
  })

  it('returns undefined if not exists and no command', () => {
    expect(cleanUrlAndGetHistory('someUrl')).toBe(undefined)
  })

  it('returns undefined if not exists and url not history://, command though', () => {
    expect(cleanUrlAndGetHistory('someUrl', 'someCommand')).toBe(undefined)
  })

  it('returns undefined if url history:// not exists, but no command', () => {
    expect(cleanUrlAndGetHistory('history://')).toBe(undefined)
  })

  it('returns the history if history:// exists, and does not call the command', () => {
    state['history://'] = 'OK'
    expect(cleanUrlAndGetHistory('history://', 'mockedCommand')).toBe('OK')
    expect(mockedCommand).not.toHaveBeenCalled()
  })

  it('returns undefined if url is history:// and but the command does not exists', () => {
    expect(cleanUrlAndGetHistory('history://', 'inexistentCommand')).toBe(undefined)
  })

  it('calls the plugin command for every history, if url is history:// and the command exists', () => {
    state.one = 'history one'
    state.two = 'history two'

    cleanUrlAndGetHistory('history://', 'mockedCommand', 'some', 'params')

    expect(mockedCommand.mock.calls).toEqual([
      ['one', 'some', 'params'],
      ['two', 'some', 'params']
    ])
  })
})

describe('getRelativeValue', () => {
  it('returns undefined if there is no history', () => {
    expect(getRelativeValue('someUrl', 0)).toBeUndefined()
  })

  it('returns undefined if the step is outside the boundaries', () => {
    state.someUrl = {
      history: [
        'uno',
        'dos',
        'tres',
        'cuatro'
      ],
      cursor: 2
    }
    expect(getRelativeValue('someUrl', -3)).toBeUndefined()
    expect(getRelativeValue('someUrl', 3)).toBeUndefined()
  })

  it('returns the pointed step if the step is inside the boundaries', () => {
    state.someUrl = {
      history: [
        'uno',
        'dos',
        'tres',
        'cuatro'
      ],
      cursor: 2
    }
    expect(getRelativeValue('someUrl', 0)).toBe('tres')
    expect(getRelativeValue('someUrl', 1)).toBe('dos')
    expect(getRelativeValue('someUrl', 2)).toBe('uno')
    expect(getRelativeValue('someUrl', -1)).toBe('cuatro')
  })
})

describe('propagate', () => {
  it('does not break if does not exists the history', () => {
    expect(() => propagate('someUrl')).not.toThrow()
  })

  it('calls the callbacks of the relative endpoints, but not the callbacks of the original url', async () => {
    isDifferent.mockReturnValue(true)
    endpoints['history://someHistory'] = {
      callbacks: {
        cb: jest.fn()
      }
    }
    endpoints['history://someHistory#-1'] = {
      url: 'history://someHistory#-1',
      relative: {
        url: 'history://someHistory',
        n: -1
      },
      callbacks: {
        cb: jest.fn()
      }
    }
    endpoints['history://someHistory#0'] = {
      url: 'history://someHistory#0',
      relative: {
        url: 'history://someHistory',
        n: 0
      },
      callbacks: {
        cb: jest.fn()
      }
    }
    endpoints['history://someHistory#1'] = {
      url: 'history://someHistory#1',
      relative: {
        url: 'history://someHistory',
        n: 1
      },
      callbacks: {
        cb: jest.fn()
      }
    }
    endpoints['history://someHistory#2'] = {
      url: 'history://someHistory#2',
      relative: {
        url: 'history://someHistory',
        n: 2
      },
      callbacks: {
        cb: jest.fn()
      }
    }

    state['history://someHistory'] = {
      history: [
        'uno',
        'dos',
        'tres',
        'cuatro'
      ],
      cursor: 2
    }

    propagate('history://someHistory')

    await new Promise(resolve => setTimeout(resolve, 10))

    expect(endpoints['history://someHistory'].callbacks.cb).not.toHaveBeenCalled()
    expect(endpoints['history://someHistory#-1'].callbacks.cb).toHaveBeenCalledWith('cuatro')
    expect(endpoints['history://someHistory#0'].callbacks.cb).toHaveBeenCalledWith('tres')
    expect(endpoints['history://someHistory#1'].callbacks.cb).toHaveBeenCalledWith('dos')
    expect(endpoints['history://someHistory#2'].callbacks.cb).toHaveBeenCalledWith('uno')
  })
})

describe('refresh', () => {
  it('warn', () => {
    plugin.refresh()
    expect(console.warn).toHaveBeenCalledWith('refresh does nothing with history:// plugin')
  })
})

describe('getEndpoint', () => {
  it('creates the history if the url is not relative', () => {
    plugin.getEndpoint({
      url: 'noRelative',
      value: 'first value'
    })

    expect(state.noRelative).toEqual({
      history: ['first value'],
      cursor: 0
    })
  })

  it('creates a relative endpoint, if the url is relative', () => {
    const endpoint = {
      url: 'relative#1',
      value: 'first value'
    }

    plugin.getEndpoint(endpoint)

    expect(state).toEqual({})

    expect(endpoint.value).toBeUndefined()

    expect(endpoint.relative).toEqual({
      url: 'relative',
      n: 1
    })
  })

  it('takes from the history value for the relative endpoint', () => {
    state.relativeUrl = {
      history: [
        'uno',
        'dos',
        'tres',
        'cuatro'
      ],
      cursor: 2
    }

    const endpoint = {
      url: 'relativeUrl#1',
      value: 'first value'
    }

    plugin.getEndpoint(endpoint)

    expect(endpoint.value).toBe('dos')
  })
})

describe('get', () => {
  it('returns the current value, for absolute urls', () => {
    state.someUrl = {
      history: [
        'uno',
        'dos',
        'tres',
        'cuatro'
      ],
      cursor: 2
    }
    expect(plugin.get('someUrl')).toBe('tres')
  })

  it('returns the relative value, for relative urls', () => {
    state.someUrl = {
      history: [
        'uno',
        'dos',
        'tres',
        'cuatro'
      ],
      cursor: 2
    }
    expect(plugin.get('someUrl#0')).toBe('tres')
    expect(plugin.get('someUrl#1')).toBe('dos')
    expect(plugin.get('someUrl#2')).toBe('uno')
  })
  it('returns undefined if the history does not exists, for both absolute and relative url', () => {
    expect(plugin.get('someUrl')).toBeUndefined()
    expect(plugin.get('someUrl#2')).toBeUndefined()
  })
})

describe('set', () => {
  describe('relative url', () => {
    it('does nothing if the history does not exists', () => {
      expect(() => plugin.set({
        relative: {
          url: 'someUrl'
        }
      })).not.toThrow()
    })

    it('does nothing if out of bonds', () => {
      state.someUrl = {
        history: [
          'uno',
          'dos',
          'tres',
          'cuatro'
        ],
        cursor: 2
      }

      expect(() => plugin.set({
        relative: {
          url: 'someUrl',
          n: 6
        },
        value: 'no'
      })).not.toThrow()

      expect(() => plugin.set({
        relative: {
          url: 'someUrl',
          n: -6
        },
        value: 'no'
      })).not.toThrow()

      expect(state.someUrl).toEqual({
        history: [
          'uno',
          'dos',
          'tres',
          'cuatro'
        ],
        cursor: 2
      })
    })

    it('updates the step if inside of bonds, and do not call propagate ', async () => {
      state.someUrl = {
        history: [
          'uno',
          'dos',
          'tres',
          'cuatro'
        ],
        cursor: 2
      }

      endpoints['someUrl#2'] = {
        url: 'someUrl#1',
        relative: {
          url: 'someUrl',
          n: 1
        },
        value: 'tres',
        callbacks: {
          cb: jest.fn()
        }
      }

      expect(() => plugin.set({
        relative: {
          url: 'someUrl',
          n: 1
        },
        value: 'prev'
      })).not.toThrow()

      expect(() => plugin.set({
        relative: {
          url: 'someUrl',
          n: -1
        },
        value: 'post'
      })).not.toThrow()

      expect(state.someUrl).toEqual({
        history: [
          'uno',
          'prev',
          'tres',
          'post'
        ],
        cursor: 2
      })
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(endpoints['someUrl#2'].callbacks.cb).not.toHaveBeenCalled()
    })
  })
  describe('absolute url', () => {
    it('push a new state in the history', () => {
      state.someUrl = {
        history: [
          'uno',
          'dos',
          'tres',
          'cuatro'
        ],
        cursor: 3
      }

      plugin.set({
        url: 'someUrl',
        value: 'cinco'
      })
      expect(state.someUrl).toEqual({
        history: [
          'uno',
          'dos',
          'tres',
          'cuatro',
          'cinco'
        ],
        cursor: 4
      })
    })

    it('propagates the change to the relative urls', async () => {
      isDifferent.mockReturnValue(true)

      state.someUrl = {
        history: [
          'uno',
          'dos',
          'tres',
          'cuatro'
        ],
        cursor: 3
      }

      endpoints['someUrl#1'] = {
        url: 'someUrl#1',
        relative: {
          url: 'someUrl',
          n: 1
        },
        value: 'tres',
        callbacks: {
          cb: jest.fn()
        }
      }

      plugin.set({
        url: 'someUrl',
        value: 'cinco'
      })

      expect(endpoints['someUrl#1'].value).toBe('cuatro')
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(endpoints['someUrl#1'].callbacks.cb).toHaveBeenCalledWith('cuatro')
    })
  })
})

describe('clean', () => {
  it('does not break if there is no history', () => {
    expect(() => plugin.clean({
      url: 'someUrl'
    })).not.toThrow()
    expect(() => plugin.clean({
      url: 'someUrl#3'
    })).not.toThrow()
  })

  it('does nothing if the absolute endpoint is not for clean', () => {
    endpoints.someUrl = {}
    expect(() => plugin.clean({
      url: 'someUrl'
    })).not.toThrow()
    expect(() => plugin.clean({
      url: 'someUrl#3'
    })).not.toThrow()
  })

  it('does nothing if exists some relative endpoint not for clean', () => {

  })
})
