import { plugins, conf } from '../conf'
import { registerPlugin } from '../registerPlugin'

beforeEach(() => {
  plugins.length = 0
})
test('registerPlugin adds plugins in reverse order and attach the configuration', () => {
  conf.plugins = {
    a: 'conf-a',
    b: 'conf-b',
    c: 'conf-c',
    d: 'conf-d',
    e: 'conf-e'
  }
  registerPlugin({ name: 'a' })
  registerPlugin({ name: 'b' })
  registerPlugin({ name: 'c' })
  registerPlugin({ name: 'd' })
  registerPlugin({ name: 'e' })

  expect(plugins).toEqual([
    {
      name: 'e',
      conf: 'conf-e'
    },
    {
      name: 'd',
      conf: 'conf-d'
    },
    {
      name: 'c',
      conf: 'conf-c'
    },
    {
      name: 'b',
      conf: 'conf-b'
    },
    {
      name: 'a',
      conf: 'conf-a'
    }
  ])
})
