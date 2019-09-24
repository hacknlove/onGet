import { plugins } from '../conf'
import { findPlugin } from '../findPlugin'

beforeEach(() => {
  plugins.length = 0
})
test('Returns undefined when plugins is empty', () => {
  expect(findPlugin('algo')).toBeUndefined()
})
test('Returns undefined when no plugin matchs', () => {
  plugins.push({
    regex: /^a/
  })
  plugins.push({
    regex: /^b/
  })
  expect(findPlugin('no match')).toBeUndefined()
})

test('Returns the first plugin whose regex match the url', () => {
  plugins.push({
    regex: /^a/
  })
  plugins.push({
    regex: /^b/
  })
  plugins.push({
    regex: /^c/,
    name: 'c'
  })
  plugins.push({
    regex: /^d/
  })
  plugins.push({
    name: 'all',
    regex: /^./
  })

  expect(findPlugin('checkthis').name).toBe('c')
})
