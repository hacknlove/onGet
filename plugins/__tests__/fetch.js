/* global fetch */
import { resources } from '../../src/conf'
import plugin from '../fetch'

global.fetch = jest.fn()

beforeEach(() => {
  Object.keys(resources).forEach(key => delete resources[key])
})

describe('plugin', () => {
  describe('regex', () => {
    it('match everything', () => {
      expect('http://foo/bar').toMatch(plugin.regex)
      expect('https://foo/bar').toMatch(plugin.regex)
      expect('//foo/bar').toMatch(plugin.regex)
      expect('/foo/bar').toMatch(plugin.regex)
      expect('foo/bar').toMatch(plugin.regex)
    })
  })

  describe('refresh calls eventHandler', () => {
    it('with error if fetch reject', async () => {
      fetch.mockImplementation(() => Promise.reject('error'))
      const eventHandler = jest.fn()
      await plugin.refresh('some url', eventHandler)
      expect(eventHandler).toHaveBeenCalledWith('error')
    })

    it('with json if fetch resolve', async () => {
      fetch.mockImplementation(() => Promise.resolve({
        text () {
          return Promise.resolve('{"ok": true }')
        }
      }))
      const eventHandler = jest.fn()
      await plugin.refresh('some url', eventHandler)
      expect(eventHandler).toHaveBeenCalledWith({ ok: true })
    })

    it('with text if fetch resolve but json fails', async () => {
      fetch.mockImplementation(() => Promise.resolve({
        text () {
          return Promise.resolve('RAW BODY')
        }
      }))
      const eventHandler = jest.fn()
      await plugin.refresh('some url', eventHandler)
      expect(eventHandler).toHaveBeenCalledWith('RAW BODY')
    })
  })

  describe('start', () => {
    it('disable periodical checks', () => {
      expect(plugin.checkInterval).not.toBeUndefined()
      expect(plugin.threshold).not.toBeUndefined()
      plugin.start()
      expect(plugin.checkInterval).toBeUndefined()
      expect(plugin.threshold).toBeUndefined()
    })
  })
})
