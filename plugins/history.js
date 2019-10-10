import { endpoints } from '../src/conf'
import { isDifferent } from 'isdifferent'

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

  const absolute = history.cursor - n

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
      executeCallbacks(endpoint.url)
    }
  })
}

export function executeCallbacks (url) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    return
  }
  Object.values(endpoint.callbacks).forEach(cb => setTimeout(cb, 0, endpoint.value))
}

export function updateEndpoint (url) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    return
  }
  const history = state[url]
  endpoint.value = history.history[history.cursor]
  executeCallbacks(url)
}

const plugin = {
  name: 'history',
  regex: /^history:\/\/./,

  /**
   * Nothing to refresh. shows a warning in the console
   * @returns {undefined}
   */
  refresh () {
    console.warn('refresh does nothing with history:// plugin')
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
      n: relative[2] * 1
    }

    endpoint.value = getRelativeValue(relative[1], relative[2] * 1)
  },

  get (url) {
    if (state[url]) {
      return state[url].history[state[url].cursor]
    }
    const relative = url.match(/(.*)#(-?\d+)$/)
    if (!relative) {
      return
    }
    return getRelativeValue(relative[1], relative[2] * 1)
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
      if (!isDifferent(endpoint.value, history.history[history.cursor])) {
        return
      }
      if (history.cursor < history.history.length - 1) {
        history.history.splice(history.cursor + 1)
      }
      history.history.push(endpoint.value)
      history.cursor++
      propagate(endpoint.url)
      return
    }

    const history = state[relative.url]
    if (!history) {
      return
    }

    const absolute = history.cursor - relative.n

    if (absolute < 0) {
      return
    }

    if (absolute >= history.history.length) {
      return
    }

    history.history[absolute] = endpoint.value
  },

  /**
   * Removes the history
   * @param {object} endpoint
   * @returns {undefined}
   */
  clean (endpoint) {
    const url = endpoint.url.replace(/#-?\d+$/, '')
    if (!state[endpoint.url]) {
      return
    }

    if (endpoints[url] && !endpoints[url].clean) {
      return
    }

    if (Object.values(endpoints).some(endpoint => {
      if (endpoint.clean) {
        return false
      }
      if (!endpoint.relative) {
        return false
      }
      if (endpoint.relative.url !== url) {
        return false
      }
      return true
    })) {
      return
    }
    delete state[endpoint.url]
  },

  commands: {
    replace (url, value) {
      url = url.replace(/#-?\d+$/, '')
      const history = state[url]

      if (!history) {
        console.warn('cannot replace. History not found')
        return
      }

      if (history.cursor < history.history.length - 1) {
        history.history.splice(history.cursor + 1)
      }
      history.history[history.cursor] = value

      updateEndpoint(url)
      propagate(url)
    },
    undo (url, n = 1) {
      n = Math.floor(n * 1)
      const history = cleanUrlAndGetHistory(url, 'undo', n)
      if (!history) {
        return
      }
      history.cursor = Math.max(0, history.cursor - n)
      updateEndpoint(url)
      propagate(url)
    },
    redo (url, n = 1) {
      n = Math.floor(n * 1)
      const history = cleanUrlAndGetHistory(url, 'redo', n)
      if (!history) {
        return
      }
      history.cursor = Math.min(history.cursor + n, history.history.length - 1)
      updateEndpoint(url)
      propagate(url)
    },
    goto (url, n) {
      n = Math.floor(n * 1)
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
      updateEndpoint(url)
      propagate(url)
    },
    first (url) {
      plugin.commands.undo(url, Infinity)
    },
    last (url) {
      plugin.commands.redo(url, Infinity)
    },
    length (url) {
      const history = cleanUrlAndGetHistory(url)
      if (!history) {
        return 0
      }
      return history.history.length
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
      return history.history.length - history.cursor - 1
    }
  }
}

export default plugin
