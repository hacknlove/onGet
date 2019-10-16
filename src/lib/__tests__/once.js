import { once } from '../once'
import { onGet } from '../onGet'

jest.mock('../onGet')

describe('waitUntil', () => {
  it('is ok', async () => {
    const callback = jest.fn()
    let handler
    const unsubscribe = jest.fn()

    onGet.mockImplementation((url, hb) => {
      handler = hb
      return unsubscribe
    })
    once('url', callback)
    expect(callback).not.toHaveBeenCalled()
    handler('ok')
    expect(callback).toHaveBeenCalledWith('ok', 'url')
    expect(unsubscribe).toHaveBeenCalled()
  })
})
