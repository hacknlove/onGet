import { load } from '../load'
import { resources, plugins } from '../conf'

describe('load', () => {
  beforeEach(() => {
    plugins.length = 0
    Object.keys(resources).forEach(key => delete resources[key])
  })
  it('works', () => {
    expect(() => load({
      resources: {},
      plugins: {}
    })).not.toThrow()
  })
})
