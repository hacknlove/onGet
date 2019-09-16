import { endpoints, addNewSuscription } from '../lib'

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

test('inserts the callback in the endpoint', () => {
  endpoints.test = {
    callbacks: {}
  }

  addNewSuscription('test', 'callback')

  expect(Object.values(endpoints.test.callbacks)).toEqual(['callback'])
})

test('returns a function', () => {
  endpoints.test = {
    callbacks: {}
  }

  expect(typeof addNewSuscription('test')).toBe('function')
})

test('insert the interval, if the endpoint has intervals', () => {
  endpoints.test = {
    callbacks: {},
    intervals: {}
  }
  addNewSuscription('test', 'callback', 45)

  expect(Object.keys(endpoints.test.callbacks)[0]).toBe(Object.keys(endpoints.test.callbacks)[0])

  expect(Object.values(endpoints.test.intervals)[0]).toBe(45)
})

test('if interval not passed, uses plugin.checkInterval', () => {
  endpoints.test = {
    callbacks: {},
    intervals: {},
    plugin: {
      checkInterval: 23
    }
  }
  addNewSuscription('test', 'callback')

  expect(Object.values(endpoints.test.intervals)[0]).toBe(23)
})


test('if interval is 0, it stores Infinity', () => {
  endpoints.test = {
    callbacks: {},
    intervals: {},
    interval: 0,
    plugin: {
      checkInterval: 23
    }
  }
  addNewSuscription('test', 'callback', 0)

  expect(Object.values(endpoints.test.intervals)[0]).toBe(Infinity)
})

test('update minInterval, if the endpoint has intervals and new interval is the minimun one', () => {
  endpoints.test = {
    callbacks: {},
    intervals: {},
    minInterval: Infinity
  }
  addNewSuscription('test', 'callback', 45)

  expect(endpoints.test.minInterval).toBe(45)
})

test('does not change minInterval, if the current minInterval is the minimum interval', () => {
  endpoints.test = {
    callbacks: {},
    intervals: {},
    minInterval: 10
  }
  addNewSuscription('test', 'callback', 45)

  expect(endpoints.test.minInterval).toBe(10)
})
