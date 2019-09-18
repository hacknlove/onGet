import { plugins } from '../src/conf'
import { registerPlugin } from '../src/registerPlugin'

beforeEach(() => {
  plugins.length = 0
})
test('registerPlugin adds plugins in reverse order', () => {
  registerPlugin(1)
  registerPlugin(2)
  registerPlugin('z')
  registerPlugin('q')
  registerPlugin('y')

  expect(plugins).toEqual(['y', 'q', 'z', 2, 1])
})
