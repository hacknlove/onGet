import { resources } from '../conf'
import { addNewSubscription } from '../addNewSubscription'

beforeEach(() => {
  Object.keys(resources).forEach(key => delete resources[key])
})

test('inserts the callback in the resource', () => {
  resources.test = {
    callbacks: {}
  }

  addNewSubscription('test', 'callback')

  expect(Object.values(resources.test.callbacks)).toEqual(['callback'])
})

test('returns a function', () => {
  resources.test = {
    callbacks: {}
  }

  expect(typeof addNewSubscription('test')).toBe('function')
})

test('insert the interval, if the resource has intervals', () => {
  resources.test = {
    callbacks: {},
    intervals: {}
  }
  addNewSubscription('test', 'callback', 45)

  expect(Object.keys(resources.test.callbacks)[0]).toBe(Object.keys(resources.test.callbacks)[0])

  expect(Object.values(resources.test.intervals)[0]).toBe(45)
})

test('if interval not passed, uses plugin.checkInterval', () => {
  resources.test = {
    callbacks: {},
    intervals: {},
    plugin: {
      checkInterval: 23
    }
  }
  addNewSubscription('test', 'callback')

  expect(Object.values(resources.test.intervals)[0]).toBe(23)
})

test('update minInterval, if the resource has intervals and new interval is the minimun one', () => {
  resources.test = {
    callbacks: {},
    intervals: {},
    minInterval: Infinity
  }
  addNewSubscription('test', 'callback', 45)

  expect(resources.test.minInterval).toBe(45)
})

test('does not change minInterval, if the current minInterval is the minimum interval', () => {
  resources.test = {
    callbacks: {},
    intervals: {},
    minInterval: 10
  }
  addNewSubscription('test', 'callback', 45)

  expect(resources.test.minInterval).toBe(10)
})
