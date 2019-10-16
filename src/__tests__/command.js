import { command } from '../command'
import { resources } from '../conf'
import { findPlugin } from '../findPlugin'

jest.mock('../findPlugin')

jest.spyOn(console, 'warn').mockImplementation()

describe('command', () => {
  beforeEach(() => {
    Object.keys(resources).forEach(key => delete resources[key])
    findPlugin.mockReturnValue({})
  })

  it('calls findPlugin if there is no resource for the url', () => {
    command('some url')
    expect(findPlugin).toHaveBeenCalledWith('some url')
  })

  it('not call findPlugin if there is resource for the url', () => {
    resources.someUrl = { plugin: {} }
    command('someUrl')
    expect(findPlugin).not.toHaveBeenCalled()
  })

  it('warns if the plugin does not accept commands', () => {
    command('some url')
    expect(console.warn).toHaveBeenCalledWith('the plugin does not accept commands')
  })

  it('warns if the plugin accept commands but not this', () => {
    findPlugin.mockReturnValue({
      commands: {}
    })

    command('some url', 'someCommand')
    expect(console.warn).toHaveBeenCalledWith('command not found')
  })

  it('calls the plugin command', () => {
    const someCommand = jest.fn()

    findPlugin.mockReturnValue({
      commands: { someCommand }
    })

    command('some url', 'someCommand', 'parameter', 1, 2, 3)
    expect(someCommand).toHaveBeenCalledWith('some url', 'parameter', 1, 2, 3)
  })

  it('returns the returned value of the plugin command', () => {
    const someCommand = jest.fn().mockReturnValue('OK')
    findPlugin.mockReturnValue({
      commands: { someCommand }
    })

    expect(command('some url', 'someCommand')).toBe('OK')
  })
})
