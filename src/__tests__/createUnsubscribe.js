import { resources } from '../conf'
import { createUnsubscribe } from '../createUnsubscribe'

beforeEach(() => {
  Object.keys(resources).forEach(key => delete resources[key])
})

test('does not crash if it has been unsubscribed before', () => {
  expect(() => createUnsubscribe({ callbacks: {} }, 'test')()).not.toThrow()
})

test('deletes the subscription', () => {
  const resource = {
    callbacks: {
      test: true
    },
    plugin: {}
  }
  createUnsubscribe(resource, 'test')()

  expect(resource.callbacks.test).toBeUndefined()
})

test('deletes the interval, if has intervals', () => {
  const resource = {
    callbacks: {
      test: true
    },
    intervals: {
      test: true
    },
    plugin: {}
  }
  createUnsubscribe(resource, 'test')()

  expect(resource.intervals.test).toBeUndefined()
})

test('Updates minInterval, if the removed interval is the minimum', () => {
  const resource = {
    callbacks: {
      test: true
    },
    intervals: {
      test: 15,
      other: 45
    },
    plugin: {}
  }
  createUnsubscribe(resource, 'test')()

  expect(resource.minInterval).toBe(45)
})

test('Updates minInterval, if the removed interval is not the minimum', () => {
  const resource = {
    callbacks: {
      test: true
    },
    intervals: {
      test: 45,
      other: 15
    },
    plugin: {}
  }
  createUnsubscribe(resource, 'test')()

  expect(resource.minInterval).toBe(15)
})
