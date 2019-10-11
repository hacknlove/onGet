import { isDifferent } from 'isdifferent'
import { endpoints } from '../../src/conf'
import plugin, { cleanUrlAndGetHistory, getRelativeValue, propagate, state, executeCallbacks } from '../history'

jest.mock('isdifferent')

jest.spyOn(console, 'warn').mockImplementation()

const mockedCommand = jest.fn()

plugin.commands.mockedCommand = mockedCommand

beforeEach(() => Object.keys(state).forEach(key => delete state[key]))
beforeEach(() => Object.keys(endpoints).forEach(key => delete endpoints[key]))
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

  it('not call the callbacks of the relative endpoints, if there is no changes', async () => {
    isDifferent.mockReturnValue(false)
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

    endpoints['history://otherHistory#1'] = {
      url: 'history://otherHistory#1',
      relative: {
        url: 'history://otherHistory',
        n: -1
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
    expect(endpoints['history://someHistory#-1'].callbacks.cb).not.toHaveBeenCalled()
    expect(endpoints['history://someHistory#0'].callbacks.cb).not.toHaveBeenCalled()
    expect(endpoints['history://someHistory#1'].callbacks.cb).not.toHaveBeenCalled()
    expect(endpoints['history://someHistory#2'].callbacks.cb).not.toHaveBeenCalled()
    expect(endpoints['history://otherHistory#1'].callbacks.cb).not.toHaveBeenCalled()
  })
})

describe('executeCallbacks', () => {
  it('does not break if not exists the url', () => {
    expect(executeCallbacks('someUrl')).toBeUndefined()
  })
})

describe('plugin', () => {
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

      it('cuts the history, if there is steps to be redone', () => {
        isDifferent.mockReturnValue(true)

        state.someUrl = {
          history: [
            'uno',
            'dos',
            'tres',
            'cuatro'
          ],
          cursor: 1
        }

        plugin.set({
          url: 'someUrl',
          value: 'cinco'
        })
        expect(state.someUrl).toEqual({
          history: [
            'uno',
            'dos',
            'cinco'
          ],
          cursor: 2
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

      it('does nothing if the new value is equal to the old one', () => {
        isDifferent.mockReturnValue(false)

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
          value: 'cuatro'
        })
        expect(state.someUrl).toEqual({
          history: [
            'uno',
            'dos',
            'tres',
            'cuatro'
          ],
          cursor: 3
        })
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
      state.someUrl = {}
      expect(() => plugin.clean({
        url: 'someUrl'
      })).not.toThrow()
    })

    it('does nothing if exists some relative endpoint not for clean', () => {
      endpoints.someUrl = {
        clean: true
      }
      endpoints.other = {
        clean: true
      }
      endpoints['other#1'] = {
        clean: false
      }
      endpoints['other#2'] = {
        clean: false,
        relative: {
          url: 'other'
        }
      }
      endpoints['someUrl#1'] = {
        relative: {
          url: 'someUrl'
        }
      }
      state.someUrl = {}
      plugin.clean({
        url: 'someUrl'
      })
      expect(state).toStrictEqual({ someUrl: {} })
    })

    it('it removes if every relative is for clean', () => {
      endpoints.someUrl = {
        clean: true
      }
      endpoints.other = {
        clean: true
      }
      endpoints['other#1'] = {
        clean: false
      }
      endpoints['someUrl#1'] = {
        clean: true,
        relative: {
          url: 'someUrl'
        }
      }
      state.someUrl = {}
      plugin.clean({
        url: 'someUrl'
      })
      expect(state).toStrictEqual({})
    })
  })

  describe('commands', () => {
    const commands = plugin.commands
    describe('replace', () => {
      it('warns if not exists the history', () => {
        commands.replace('someUrl', 'newValue')
        expect(console.warn).toHaveBeenCalledWith('cannot replace. History not found')
        console.warn.mockClear()
        commands.replace('someUrl#1', 'newValue')
        expect(console.warn).toHaveBeenCalledWith('cannot replace. History not found')
      })

      it('replace the current value in the history', () => {
        state.someUrl = {
          history: [1, 2, 3, 4],
          cursor: 3
        }

        commands.replace('someUrl', 7)
        expect(state.someUrl).toEqual({
          history: [1, 2, 3, 7],
          cursor: 3
        })
      })

      it('replace the current value in the history and cut the rest', () => {
        state.someUrl = {
          history: [1, 2, 3, 4, 5, 6],
          cursor: 2
        }

        commands.replace('someUrl', 7)
        expect(state.someUrl).toEqual({
          history: [1, 2, 7],
          cursor: 2
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
          cursor: 1
        }

        endpoints['someUrl#-1'] = {
          url: 'someUrl#-1',
          relative: {
            url: 'someUrl',
            n: -1
          },
          value: 'tres',
          callbacks: {
            cb: jest.fn()
          }
        }

        commands.replace('someUrl', 'cinco')

        expect(endpoints['someUrl#-1'].value).toBeUndefined()
        await new Promise(resolve => setTimeout(resolve, 10))
        expect(endpoints['someUrl#-1'].callbacks.cb).toHaveBeenCalledWith(undefined)
      })
      it('updates the endpoint and call the callbacks', async () => {
        state.someUrl = {
          history: [1, 2, 3, 4],
          cursor: 3
        }
        endpoints.someUrl = {
          value: 4,
          callbacks: {
            cb: jest.fn()
          }
        }

        commands.replace('someUrl', 7)
        expect(endpoints.someUrl.value).toBe(7)
        await new Promise(resolve => setTimeout(resolve, 10))
        expect(endpoints.someUrl.callbacks.cb).toHaveBeenCalledWith(7)
      })
    })

    describe('undo', () => {
      it('goes one step back', () => {
        state.someUrl = {
          cursor: 5
        }
        commands.undo('someUrl')
        expect(state.someUrl.cursor).toBe(4)
      })

      it('goes n steps back', () => {
        state.someUrl = {
          cursor: 5
        }
        commands.undo('someUrl', 3)
        expect(state.someUrl.cursor).toBe(2)
      })

      it('doest no go before 0', () => {
        state.someUrl = {
          cursor: 5
        }
        commands.undo('someUrl', 13)
        expect(state.someUrl.cursor).toBe(0)
      })
      it('does not break if no history', () => {
        expect(() => commands.undo('someUrl')).not.toThrow()
      })
      it('updates the endpoint and call the callbacks', async () => {
        state.someUrl = {
          history: [1, 2, 3, 4],
          cursor: 3
        }
        endpoints.someUrl = {
          value: 4,
          callbacks: {
            cb: jest.fn()
          }
        }

        commands.undo('someUrl')
        expect(endpoints.someUrl.value).toBe(3)
        await new Promise(resolve => setTimeout(resolve, 10))
        expect(endpoints.someUrl.callbacks.cb).toHaveBeenCalledWith(3)
      })
    })

    describe('redo', () => {
      it('goes one step forward', () => {
        state.someUrl = {
          cursor: 3,
          history: [1, 2, 3, 4, 5]
        }
        commands.redo('someUrl')
        expect(state.someUrl.cursor).toBe(4)
      })

      it('goes n steps forward', () => {
        state.someUrl = {
          cursor: 1,
          history: [1, 2, 3, 4, 5]
        }
        commands.redo('someUrl', 3)
        expect(state.someUrl.cursor).toBe(4)
      })

      it('doest no go after the last', () => {
        state.someUrl = {
          cursor: 1,
          history: [1, 2, 3, 4, 5]
        }
        commands.redo('someUrl', 13)
        expect(state.someUrl.cursor).toBe(4)
      })
      it('does not break if no history', () => {
        expect(() => commands.redo('someUrl')).not.toThrow()
      })
      it('updates the endpoint and call the callbacks', async () => {
        state.someUrl = {
          history: [1, 2, 3, 4],
          cursor: 2
        }
        endpoints.someUrl = {
          value: 3,
          callbacks: {
            cb: jest.fn()
          }
        }

        commands.redo('someUrl')
        expect(endpoints.someUrl.value).toBe(4)
        await new Promise(resolve => setTimeout(resolve, 10))
        expect(endpoints.someUrl.callbacks.cb).toHaveBeenCalledWith(4)
      })
    })

    describe('goto', () => {
      it('goes to the n step', () => {
        state.someUrl = {
          cursor: 1,
          history: [1, 2, 3, 4, 5]
        }
        commands.goto('someUrl', 3)
        expect(state.someUrl.cursor).toBe(3)
      })

      it('doest no go after the last', () => {
        state.someUrl = {
          cursor: 1,
          history: [1, 2, 3, 4, 5]
        }
        commands.goto('someUrl', 13)
        expect(state.someUrl.cursor).toBe(4)
      })

      it('doest no go before the first', () => {
        state.someUrl = {
          cursor: 1,
          history: [1, 2, 3, 4, 5]
        }
        commands.goto('someUrl', -13)
        expect(state.someUrl.cursor).toBe(0)
      })

      it('does not break if no history', () => {
        expect(() => commands.goto('someUrl')).not.toThrow()
      })
      it('updates the endpoint and call the callbacks', async () => {
        state.someUrl = {
          history: [1, 2, 3, 4],
          cursor: 3
        }
        endpoints.someUrl = {
          value: 4,
          callbacks: {
            cb: jest.fn()
          }
        }

        commands.goto('someUrl', 1)
        expect(endpoints.someUrl.value).toBe(2)
        await new Promise(resolve => setTimeout(resolve, 10))
        expect(endpoints.someUrl.callbacks.cb).toHaveBeenCalledWith(2)
      })
    })
    describe('first', () => {
      it('goes to the first state', () => {
        state.someUrl = {
          cursor: 5
        }
        commands.first('someUrl')
        expect(state.someUrl.cursor).toBe(0)
      })
    })

    describe('last', () => {
      it('goes to the last state', () => {
        state.someUrl = {
          cursor: 3,
          history: [1, 2, 3, 4, 5, 6, 7, 8]
        }
        commands.last('someUrl')
        expect(state.someUrl.cursor).toBe(7)
      })
    })

    describe('length', () => {
      it('returns the length of the history', () => {
        state.someUrl = {
          history: [1, 2, 3, 4, 5, 6, 7, 8]
        }
        expect(commands.length('someUrl')).toBe(8)
      })

      it('returns 0 if there is no history', () => {
        expect(commands.length('someUrl')).toBe(0)
      })
    })

    describe('undoLength', () => {
      it('returns the amount of steps that can be undone', () => {
        state.someUrl = {
          history: [1, 2, 3, 4, 5, 6, 7, 8],
          cursor: 4
        }
        expect(commands.undoLength('someUrl')).toBe(4)
      })

      it('returns 0 if there is no history', () => {
        expect(commands.undoLength('someUrl')).toBe(0)
      })
    })

    describe('redoLength', () => {
      it('returns the amount of steps that can be redone', () => {
        state.someUrl = {
          history: [1, 2, 3, 4, 5, 6, 7, 8],
          cursor: 4
        }
        expect(commands.redoLength('someUrl')).toBe(3)
      })

      it('returns 0 if there is no history', () => {
        expect(commands.redoLength('someUrl')).toBe(0)
      })
    })

    describe('start', () => {
      it('reset the state', () => {
        plugin.getEndpoint({
          url: 'url',
          value: 'value'
        })
        expect(plugin.get('url')).toBe('value')
        plugin.start()
        expect(plugin.get('url')).toBeUndefined()
      })
    })
  })
})
