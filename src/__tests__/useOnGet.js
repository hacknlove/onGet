import { renderHook, act } from '@testing-library/react-hooks'
import { useOnGet } from '../useOnGet'
import { get } from '../get'
import { onGet } from '../onGet'

jest.mock('../onGet')
jest.mock('../get')

const unmounts = []

afterEach(() => {
  while (unmounts.length) {
    unmounts.pop()()
  }
})

describe('useOnGet', () => {
  it('returns first value', () => {
    const { result, unmount } = renderHook(() => useOnGet('url', { first: 'first value' }))

    unmounts.push(unmount)

    expect(result.current).toBe('first value')
  })

  it('options is optional', () => {
    const { result, unmount } = renderHook(() => useOnGet('url'))

    unmounts.push(unmount)

    expect(result.current).toBeUndefined()
  })

  it('return first value, if the url changes', () => {
    const { result, unmount } = renderHook(() => useOnGet('url', {
      first: 'first value',
      firstIfUrlChanges: true
    }))

    unmounts.push(unmount)

    expect(result.current).toBe('first value')
  })

  it('returns the cached value, if exists', () => {
    get.mockReturnValue('cached value')
    const { result, unmount } = renderHook(() => useOnGet('url', { first: 'first value' }))
    get.mockReturnValue(undefined)

    unmounts.push(unmount)

    expect(result.current).toBe('cached value')
  })

  it('updates when onGet call the callback', async () => {
    let onGetCallback
    onGet.mockImplementation((url, callback) => {
      onGetCallback = callback
    })
    const { result, unmount, waitForNextUpdate } = renderHook(() => useOnGet('url', { first: 'first value' }))
    unmounts.push(unmount)
    expect(result.current).toBe('first value')
    const wait = waitForNextUpdate()
    act(() => onGetCallback('new value'))
    await wait
    expect(result.current).toBe('new value')
  })
})
