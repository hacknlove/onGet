import { save } from '../save'
import { resources, plugins } from '../conf'

describe('save', () => {
  it('works', () => {
    resources.a = {
      url: 'a',
      value: 'A',
      plugin: {

      }
    }
    resources.b = {
      url: 'b',
      value: 'B',
      plugin: {
        saveresource (url, savedresource) {
          savedresource.preventSave = true
        }
      }
    }
    resources.c = {
      url: 'c',
      value: 'C',
      plugin: {
        saveresource (url, savedresource) {
          savedresource.foo = 'bar'
        }
      }
    }

    plugins.push({
      name: 'testSave',
      save () {
        return 'OK'
      }
    })
    plugins.push({
      name: 'saveButUndefined',
      save () {
      }
    })
    plugins.push({
      name: 'saveNothing'
    })
    expect(save()).toStrictEqual({
      resources: {
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
