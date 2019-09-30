import { endpoints } from '../src'
import isDifferent from 'isdifferent'

export const state = {}

export function cleanUrlAndGetHistory (url, command, ...params) {
  const history = state[url.replace(/#-?\d+$/, '')]
  if (history) {
    return history
  }
  if (command && url === 'history://' && plugin.commands[command]) {
    Object.keys(state).forEach(url => plugin.commands[command](url, ...params))
  }
}

export function getRelativeValue (url, n) {
  const history = state[url]
  if (!history) {
    return
  }

  const absolute = history.cursor - n * 1

  if (absolute < 0) {
    return undefined
  }

  if (absolute >= history.history.length) {
    return undefined
  }

  return history.history[absolute]
}

export function propagate (url) {
  const prefix = `${url}#`

  Object.values(endpoints).forEach(endpoint => {
    if (!endpoint.relative) {
      return
    }
    if (!endpoint.url.startsWith(prefix)) {
      return
    }
    const newValue = getRelativeValue(endpoint.relative.url, endpoint.relative.n)
    if (isDifferent(newValue, endpoint.value)) {
      endpoint.value = newValue
      Object.values(endpoint.callbacks).forEach(cb => setTimeout(cb, 0, endpoint.value))
    }
  })
}

const plugin = {
  name: 'history',
  regex: /^history:\/\/./,

  /**
   * Nothing to refresh. shows a warning in the console
   * @returns {undefined}
   */
  refresh () {
    console.warn('the true source for this plugin is client side, so refresh does nothing')
  },

  /**
   * If the state has not value for this endpoint.url, creates a new updated state
   * else, set endpoint.value according to the state
   * @param {object} endpoint
   */
  getEndpoint (endpoint) {
    const relative = endpoint.url.match(/(.*)#(-?\d+)$/)

    if (!relative) {
      state[endpoint.url] = {
        history: [endpoint.value],
        cursor: 0
      }
      return
    }

    endpoint.relative = {
      url: relative[1],
      n: relative[2]
    }

    endpoint.value = getRelativeValue(relative[1], relative[2])
  },

  get (url) {
    const relative = url.match(/(.*)#(-?\d+)$/)

    return getRelativeValue(relative[1], relative[2])
  },

  /**
   * Updates the endpoint.value, and propagates up and down
   * @params {object} endpoint
   * @returns {undefined}
   */
  set (endpoint) {
    const relative = endpoint.relative

    if (!relative) {
      const history = state[endpoint.url]
      if (history.cursor < history.history.length) {
        history.history.splice(history.cursor + 1)
      }
      history.push(endpoint.value)
      history.cursor++
      propagate(endpoint.url)
      return
    }

    const history = state[relative.url]

    const n = Math.max(
      0,
      Math.min(
        history.cursor - relative.n * 1,
        history.history.length - 1
      )
    )

    history.history[n] = endpoint.value
  },

  /**
   * Removes the history
   * @param {object} endpoint
   * @returns {undefined}
   */
  clean (endpoint) {
    delete state[endpoint.url]
  },

  commands: {
    replace (url, value) {
      const endpoint = endpoints[url.replace(/#-?\d+$/, '')]
      if (!endpoint) {
        console.warn('cannot replace. History not found')
        return
      }

      const history = state[endpoint.url] || state[endpoint.relative.url]

      if (history.cursor < history.history.length) {
        history.history.splice(history.cursor + 1)
      }

      history.history[history.cursor] = value
      propagate(endpoint.url)

      Object.values(endpoint.callbacks).forEach(cb => setTimeout(cb, 0, endpoint.value))
    },
    undo (url, n = 1) {
      const history = cleanUrlAndGetHistory(url, 'undo', n)
      if (!history) {
        return
      }
      history.cursor = Math.max(0, history.cursor - 1)
      propagate(url)
    },
    redo (url, n = 1) {
      const history = cleanUrlAndGetHistory(url, 'redo', n)
      if (!history) {
        return
      }
      history.cursor = Math.max(0, history.cursor - 1)
      propagate(url)
    },
    goto (url, n) {
      const history = cleanUrlAndGetHistory(url, 'goto', n)
      if (!history) {
        return
      }
      history.cursor = Math.max(
        0,
        Math.min(
          n,
          history.history.length - 1
        )
      )
      propagate(url)
    },
    first (url) {
      plugin.commands.goto(url, 0)
    },
    last (url) {
      plugin.commands.goto(url, Infinity)
    },
    length (url) {
      const history = cleanUrlAndGetHistory(url)
      if (!history) {
        return 0
      }
      return history.length
    },
    undoLength (url) {
      const history = cleanUrlAndGetHistory(url)
      if (!history) {
        return 0
      }
      return history.cursor
    },
    redoLength (url) {
      const history = cleanUrlAndGetHistory(url)
      if (!history) {
        return 0
      }
      return history.length - history.cursor - 1
    }
  }
}

export default plugin
