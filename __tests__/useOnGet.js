import { renderHook, act } from '@testing-library/react-hooks'
import { useOnGet, set } from '../'

const unmounts = []

describe('useOnGet', () => {
  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 10)) // to give time to propague values
    while (unmounts.length) {
      unmounts.pop()()
    }
    set('state://foo', {})
    await new Promise(resolve => setTimeout(resolve, 10))
  })

  it('returns first value', () => {
    const { result, unmount } = renderHook(() => useOnGet('state://foo.some.state', { first: 'first value' }))

    unmounts.push(unmount)

    expect(result.current).toBe('first value')
  })

  it('returns the cached value, if exists', () => {
    set('state://foo.some.state', 'cached value')
    const { result, unmount } = renderHook(() => useOnGet('state://foo.some.state', { first: 'first value' }))

    unmounts.push(unmount)

    expect(result.current).toBe('cached value')
  })

  it('updates when onGet call the callback', async () => {
    const { result, unmount, waitForNextUpdate } = renderHook(() => useOnGet('state://foo.some.state', { first: 'first value' }))
    unmounts.push(unmount)
    expect(result.current).toBe('first value')
    const wait = waitForNextUpdate()
    act(() => set('state://foo.some.state', 'new value'))
    await wait
    expect(result.current).toBe('new value')
  })
})
