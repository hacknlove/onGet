import { start, set, save, end } from '../../'

describe('save', () => {
  it('works', () => {
    start()
    set('dotted://counter', 5)
    expect(save()).toStrictEqual({
      resources: {},
      plugins: {
        dotted: {
          'dotted://counter': 5
        }
      }
    })
    end()

    start()
    set('dotted://counter', 5)
    expect(save()).toStrictEqual({
      resources: {},
      plugins: {
        dotted: {
          'dotted://counter': 5
        }
      }
    })
    end()
  })
})
