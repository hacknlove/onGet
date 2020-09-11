import { end } from '../end'
import { plugins, serverInstances } from '../conf'
import { Promise } from 'bluebird'
global.Promise = Promise

beforeEach(() => {
  plugins.length = 0
  serverInstances.length = 0
})

describe('end', () => {
  it('calls the end method of the plugin and resolves', async () => {
    plugins.push({
      end: jest.fn()
    })

    const resolve = jest.fn()
    serverInstances.push({
      resolve
    })

    end(() => {})()

    expect(plugins[0].end).toHaveBeenCalled()
    expect(resolve).toHaveBeenCalled()
  })
})
