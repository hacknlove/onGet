/* global fetch */
import { endpoints } from '../../src/conf'
import plugin from '../fetch'

global.fetch = jest.fn()

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
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
        json () {
          return Promise.resolve({ ok: true })
        }
      }))
      const eventHandler = jest.fn()
      await plugin.refresh('some url', eventHandler)
      expect(eventHandler).toHaveBeenCalledWith({ ok: true })
    })

    it('with text if fetch resolve but json fails', async () => {
      fetch.mockImplementation(() => Promise.resolve({
        json () {
          return Promise.reject('error')
        },
        text () {
          return Promise.resolve('RAW BODY')
        }
      }))
      const eventHandler = jest.fn()
      await plugin.refresh('some url', eventHandler)
      expect(eventHandler).toHaveBeenCalledWith('RAW BODY')
    })
  })
})