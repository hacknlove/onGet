import { refresh } from '../refresh'
import { refreshRegExp } from '../refreshRegExp'
import { resources } from '../conf'

jest.mock('../refresh')

describe('refreshRegExp', () => {
  it('call refresh for the urls that match the regexp', () => {
    resources.a = {
      url: 'a1'
    }
    resources.b = {
      url: 'b'
    }
    resources.c = {
      url: 'a2'
    }
    refreshRegExp(/^a/, 'force')
    expect(refresh.mock.calls.length).toBe(2)
    expect(refresh.mock.calls[0][0]).toBe('a1')
    expect(refresh.mock.calls[1][0]).toBe('a2')
    expect(refresh.mock.calls[0][1]).toBe('force')
    expect(refresh.mock.calls[1][1]).toBe('force')
  })
})
