import { start, end, promises, resolves } from '../server'
import { plugins } from '../conf'
import { Promise } from 'bluebird'
global.Promise = Promise

function asyncwait (n) {
  return new Promise(resolve => {
    setTimeout(resolve, n)
  })
}

beforeEach(() => {
  plugins.length = 0
  promises.length = 0
  resolves.length = 0
})

describe('start', () => {
  it('push a new promise and the correspondant resolve', async () => {
    await start()
    expect(promises.length).toBe(1)
    expect(resolves.length).toBe(1)
    expect(promises[0].isPending()).toBe(true)
    resolves[0]()
    expect(promises[0].isResolved()).toBe(true)
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
    end()
    await asyncwait(10)
    expect(plugins[0].start).toHaveBeenCalled()
  })
})

describe('end', () => {
  it('calls the end method of the plugin and resolves', async () => {
    plugins.push({
      end: jest.fn()
    })

    const resolve = jest.fn()
    resolves.push(resolve)

    end()

    expect(plugins[0].end).toHaveBeenCalled()
    expect(resolve).toHaveBeenCalled()
  })
})
