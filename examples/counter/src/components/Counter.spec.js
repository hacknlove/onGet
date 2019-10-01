import React from 'react'
import { shallow } from 'enzyme'
import Counter from './Counter'
import { set, get } from 'onget'

function setup(value = 0) {
  set('dotted://key', value)

  const component = shallow(
    <Counter counterKey="key" label="counter"/>
  )

  return {
    component: component,
    buttons: component.find('button'),
    p: component.find('p')
  }
}

describe('Counter component', () => {
  it('should display count', () => {
    const { p } = setup()
    expect(p.text()).toMatch(/^counter Clicked: 0 times/)
  })

  it('first button should increment', () => {
    const { buttons } = setup()
    buttons.at(0).simulate('click')
    expect(get('dotted://key')).toBe(1)
  })

  it('second button should decrement', () => {
    const { buttons } = setup()
    buttons.at(1).simulate('click')
    expect(get('dotted://key')).toBe(-1)
  })

  it('third button should not increment if the counter is even', () => {
    const { buttons } = setup(42)
    buttons.at(2).simulate('click')
    expect(get('dotted://key')).toBe(42)
  })

  it('third button should increment if the counter is odd', () => {
    const { buttons } = setup(43)
    buttons.at(2).simulate('click')
    expect(get('dotted://key')).toBe(44)
  })

  it('third button should increment if the counter is odd and negative', () => {
    const { buttons } = setup(-43)
    buttons.at(2).simulate('click')
    expect(get('dotted://key')).toBe(-42)
  })

  it('fourth button should increment in a second', (done) => {
    const { buttons } = setup()
    buttons.at(3).simulate('click')
    setTimeout(() => {
      expect(get('dotted://key')).toBe(1)
      done()
    }, 1000)
  })
})
