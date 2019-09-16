import { endpoints, createUnsuscribe } from '../lib'

beforeEach(() => {
  Object.keys(endpoints).forEach(key => delete endpoints[key])
})

test('does not crash if it has been unsuscribed before', () => {
  expect(() => createUnsuscribe({ callbacks: {} }, 'test')()).not.toThrow()
})

test('calls plugin.unsuscribe, if exists', () => {
  const unsuscribe = jest.fn()

  createUnsuscribe({
    callbacks: {
      test: true
    },
    plugin: {
      unsuscribe
    }
  }, 'test')()

  expect(unsuscribe).toHaveBeenCalled()
})

test('the parameter passed to plugin.unsuscribe is the endpoint', () => {
  const unsuscribe = jest.fn()
  const endpoint = {
    callbacks: {
      test: true
    },
    plugin: {
      unsuscribe
    }
  }
  createUnsuscribe(endpoint, 'test')()

  expect(unsuscribe).toHaveBeenCalledWith(endpoint)
})

test('deletes the subscription', () => {
  const endpoint = {
    callbacks: {
      test: true
    },
    plugin: {}
  }
  createUnsuscribe(endpoint, 'test')()

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
  createUnsuscribe(endpoint, 'test')()

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
  createUnsuscribe(endpoint, 'test')()

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
  createUnsuscribe(endpoint, 'test')()

  expect(endpoint.minInterval).toBe(15)
})
