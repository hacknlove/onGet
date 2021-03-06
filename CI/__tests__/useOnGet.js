import { renderHook, act } from '@testing-library/react-hooks'
import { useOnGet, set, get } from '../../'

const unmounts = []

describe('useOnGet', () => {
  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 10)) // to give time to propague values
    while (unmounts.length) {
      unmounts.pop()()
    }
    await set('dotted://foo', {})
    await new Promise(resolve => setTimeout(resolve, 10))
  })

  it('returns first value', () => {
    const { result, unmount } = renderHook(() => useOnGet('dotted://foo.some.state', { first: 'first value' }))

    unmounts.push(unmount)

    expect(result.current).toBe('first value')
  })

  it('returns the cached value, if exists', async () => {
    await set('dotted://foo.some.state', 'cached value')
    const { result, unmount } = renderHook(() => useOnGet('dotted://foo.some.state', { first: 'first value' }))

    unmounts.push(unmount)

    expect(result.current).toBe('cached value')
  })

  it('updates when onGet call the callback', async () => {
    const { result, unmount } = renderHook(() => useOnGet('dotted://foo.some.state', { first: 'first value' }))
    unmounts.push(unmount)
    expect(result.current).toBe('first value')
    await act(async () => set('dotted://foo.some.state', 'new value'))
    expect(result.current).toBe('new value')
  })
})

describe('history', () => {
  it('returns the first value', () => {
    const { result, unmount } = renderHook(() => useOnGet('history://one', { first: 'first value...' }))

    unmounts.push(unmount)

    expect(result.current).toBe('first value...')
    expect(get('history://one')).toBe('first value...')
  })
})
