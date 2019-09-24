import { endpoints } from '../conf'
import { createUnsubscribe } from '../createUnsubscribe'

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

test('does not crash if it has been unsubscribed before', () => {
  expect(() => createUnsubscribe({ callbacks: {} }, 'test')()).not.toThrow()
})

test('calls plugin.unsubscribe, if exists', () => {
  const unsubscribe = jest.fn()

  createUnsubscribe({
    callbacks: {
      test: true
    },
    plugin: {
      unsubscribe
    }
  }, 'test')()

  expect(unsubscribe).toHaveBeenCalled()
})

test('the parameter passed to plugin.unsubscribe is the endpoint', () => {
  const unsubscribe = jest.fn()
  const endpoint = {
    callbacks: {
      test: true
    },
    plugin: {
      unsubscribe
    }
  }
  createUnsubscribe(endpoint, 'test')()

  expect(unsubscribe).toHaveBeenCalledWith(endpoint)
})

test('deletes the subscription', () => {
  const endpoint = {
    callbacks: {
      test: true
    },
    plugin: {}
  }
  createUnsubscribe(endpoint, 'test')()

  expect(endpoint.callbacks.test).toBeUndefined()
})

test('deletes the interval, if has intervals', () => {
  const endpoint = {
    callbacks: {
      test: true
    },
    intervals: {
      test: true
    },
    plugin: {}
  }
  createUnsubscribe(endpoint, 'test')()

  expect(endpoint.intervals.test).toBeUndefined()
})

test('Updates minInterval, if the removed interval is the minumum', () => {
  const endpoint = {
    callbacks: {
      test: true
    },
    intervals: {
      test: 15,
      other: 45
    },
    plugin: {}
  }
  createUnsubscribe(endpoint, 'test')()

  expect(endpoint.minInterval).toBe(45)
})

test('Updates minInterval, if the removed interval is not the minumum', () => {
  const endpoint = {
    callbacks: {
      test: true
    },
    intervals: {
      test: 45,
      other: 15
    },
    plugin: {}
  }
  createUnsubscribe(endpoint, 'test')()

  expect(endpoint.minInterval).toBe(15)
})
