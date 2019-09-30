import isDifferent from 'isdifferent'
import { endpoints } from '../../src/conf'
import plugin, { cleanUrlAndGetHistory, getRelativeValue, propagate, state } from '../history'

jest.mock('isdifferent')

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

  it.only('calls the callbacks of the relative endpoints, but not the callbacks of the original url', () => {
    endpoints['history://someHistory'] = {
      callbacks: {
        cb: jest.fn()
      }
    }
    endpoints['history://someHistory#-1'] = {
      callbacks: {
        cb: jest.fn()
      }
    }
    endpoints['history://someHistory#0'] = {
      callbacks: {
        cb: jest.fn()
      }
    }
    endpoints['history://someHistory#1'] = {
      callbacks: {
        cb: jest.fn()
      }
    }
    endpoints['history://someHistory#2'] = {
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

    expect(endpoints['history://someHistory'].callbacks.cb).not.toHaveBeenCalled()
    expect(endpoints['history://someHistory#-1'].callbacks.cb).toHaveBeenCalledWith('cuatro')
    expect(endpoints['history://someHistory#0'].callbacks.cb).toHaveBeenCalledWith('tres')
    expect(endpoints['history://someHistory#1'].callbacks.cb).toHaveBeenCalledWith('dos')
    expect(endpoints['history://someHistory#2'].callbacks.cb).toHaveBeenCalledWith('uno')
  })
})
