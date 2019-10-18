import { start } from '../start'
import { plugins, serverInstances } from '../conf'
import { Promise } from 'bluebird'
global.Promise = Promise

function asyncwait (n) {
  return new Promise(resolve => {
    setTimeout(resolve, n)
  })
}

beforeEach(() => {
  plugins.length = 0
  serverInstances.length = 0
})

describe('start', () => {
  it('push a new promise and the correspondant resolve', async () => {
    await start()
    expect(serverInstances.length).toBe(1)
    expect(serverInstances[0].promise.isPending()).toBe(true)
    serverInstances[0].resolve()
    expect(serverInstances[0].promise.isResolved()).toBe(true)
  })
  it('calls the start method of the plugin', async () => {
    plugins.push({
      start: jest.fn()
    })
    plugins.push({
    })
    start()
    await asyncwait(10)
    expect(plugins[0].start).toHaveBeenCalled()
  })
  it('awaits till the previous promise is resolved', async () => {
    await start()

    plugins.push({
      start: jest.fn()
    })
    start()
    await asyncwait(10)
    expect(plugins[0].start).not.toHaveBeenCalled()
    serverInstances.pop().resolve()
    await asyncwait(10)
    expect(plugins[0].start).toHaveBeenCalled()
  })
})
