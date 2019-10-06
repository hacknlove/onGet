import { waitUntil } from '../waitUntil'
import { onGet } from '../onGet'
import { Promise } from 'bluebird'
global.Promise = Promise

jest.mock('../onGet')

describe('waitUntil', () => {
  it('is ok', async () => {
    const condition = jest.fn()
    let handler
    const unsubscribe = jest.fn()

    onGet.mockImplementation((url, hb) => {
      handler = hb
      return unsubscribe
    })
    const promise = waitUntil('url', condition)
    expect(promise.isPending()).toBe(true)
    handler()
    expect(condition).toHaveBeenCalled()
    expect(promise.isPending()).toBe(true)
    condition.mockReturnValue(true)
    handler()
    expect(promise.isPending()).toBe(false)
    expect(unsubscribe).toHaveBeenCalled()
  })
})
