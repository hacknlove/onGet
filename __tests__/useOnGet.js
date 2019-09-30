import { renderHook, act } from '@testing-library/react-hooks'
import { useOnGet, set } from '../'

const unmounts = []

describe('useOnGet', () => {
  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 10)) // to give time to propague values
    while (unmounts.length) {
      unmounts.pop()()
    }
    set('dotted://foo', {})
    await new Promise(resolve => setTimeout(resolve, 10))
  })

  it('returns first value', () => {
    const { result, unmount } = renderHook(() => useOnGet('dotted://foo.some.state', { first: 'first value' }))

    unmounts.push(unmount)

    expect(result.current).toBe('first value')
  })

  it('returns the cached value, if exists', () => {
    set('dotted://foo.some.state', 'cached value')
    const { result, unmount } = renderHook(() => useOnGet('dotted://foo.some.state', { first: 'first value' }))

    unmounts.push(unmount)

    expect(result.current).toBe('cached value')
  })

  it('updates when onGet call the callback', async () => {
    const { result, unmount, waitForNextUpdate } = renderHook(() => useOnGet('dotted://foo.some.state', { first: 'first value' }))
    unmounts.push(unmount)
    expect(result.current).toBe('first value')
    const wait = waitForNextUpdate()
    act(() => set('dotted://foo.some.state', 'new value'))
    await wait
    expect(result.current).toBe('new value')
  })
})
