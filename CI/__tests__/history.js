import { set, command } from '../../'

describe('set', () => {
  it('do not duplicate the first state, if created with set', async () => {
    await set('history://foo')
    expect(command('history://foo', 'length')).toBe(1)
  })
})
