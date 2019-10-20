/* global fetch */
import { resources, conf } from '../../lib/conf'
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
      const response = await plugin.refresh('some url')
      expect(response).toBe('error')
    })

    it('with json if fetch resolve', async () => {
      fetch.mockImplementation(() => Promise.resolve({
        text () {
          return Promise.resolve('{"ok": true }')
        }
      }))
      const value = await plugin.refresh('some url')
      expect(value).toStrictEqual({ ok: true })
    })

    it('with text if fetch resolve but json fails', async () => {
      fetch.mockImplementation(() => Promise.resolve({
        text () {
          return Promise.resolve('RAW BODY')
        }
      }))
      const value = await plugin.refresh('some url')
      expect(value).toBe('RAW BODY')
    })
  })

  describe('start', () => {
    it('disable periodical checks', () => {
      expect(conf.plugins.fetch.checkInterval).not.toBeUndefined()
      expect(conf.plugins.fetch.threshold).not.toBeUndefined()
      plugin.start()
      expect(conf.plugins.fetch.checkInterval).toBeUndefined()
      expect(conf.plugins.fetch.threshold).toBeUndefined()
    })
  })
})
