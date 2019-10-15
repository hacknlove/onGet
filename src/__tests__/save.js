import { save } from '../save'
import { endpoints, plugins } from '../conf'

describe('save', () => {
  it('works', () => {
    endpoints.a = {
      url: 'a',
      value: 'A',
      plugin: {

      }
    }
    endpoints.b = {
      url: 'b',
      value: 'B',
      plugin: {
        saveEndpoint (url, savedEndpoint) {
          savedEndpoint.preventSave = true
        }
      }
    }
    endpoints.c = {
      url: 'c',
      value: 'C',
      plugin: {
        saveEndpoint (url, savedEndpoint) {
          savedEndpoint.foo = 'bar'
        }
      }
    }
    plugins.push({
      name: 'testSave',
      save () {
        return 'OK'
      }
    })
    expect(save()).toStrictEqual({
      endpoints: {
        a: {
          value: 'A'
        },
        c: {
          value: 'C',
          foo: 'bar'
        }
      },
      plugins: {
        testSave: 'OK'
      }
    })
  })
})
