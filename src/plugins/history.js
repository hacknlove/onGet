import { resources } from '../lib/conf'
import { isDifferent } from 'isdifferent'

export var state = {}

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
  Object.values(resources).forEach(resource => {
    if (!resource.relative) {
      return
    }
    if (!resource.url.startsWith(prefix)) {
      return
    }
    const newValue = getRelativeValue(resource.relative.url, resource.relative.n)
    if (isDifferent(newValue, resource.value)) {
      resource.value = newValue
      executeCallbacks(resource.url)
    }
  })
}

export function executeCallbacks (url) {
  const resource = resources[url]
  if (!resource) {
    return
  }
  Object.values(resource.callbacks).forEach(cb => cb(resource.value))
}

export function updateresource (url) {
  const resource = resources[url]
  if (!resource) {
    return
  }
  const history = state[url]
  resource.value = history.history[history.cursor]
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
   * If the state has not value for this resource.url, creates a new updated state
   * else, set resource.value according to the state
   * @param {object} resource
   */
  getResource (resource) {
    const relative = resource.url.match(/(.*)#(-?\d+)$/)

    if (!relative) {
      state[resource.url] = {
        history: [resource.value],
        cursor: 0
      }
      return
    }

    resource.relative = {
      url: relative[1],
      n: relative[2] * 1
    }

    resource.value = getRelativeValue(relative[1], relative[2] * 1)
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
   * Updates the resource.value, and propagates up and down
   * @param {object} resource
   * @returns {undefined}
   */
  set (resource) {
    const relative = resource.relative

    if (!relative) {
      const history = state[resource.url]
      if (!isDifferent(resource.value, history.history[history.cursor])) {
        return
      }
      if (history.cursor < history.history.length - 1) {
        history.history.splice(history.cursor + 1)
      }
      history.history.push(resource.value)
      history.cursor++
      propagate(resource.url)
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

    history.history[absolute] = resource.value
  },

  /**
   * Removes the history
   * @param {object} resource
   * @returns {undefined}
   */
  clean (resource) {
    const url = resource.url.replace(/#-?\d+$/, '')
    if (!state[resource.url]) {
      return
    }

    if (resources[url] && !resources[url].clean) {
      return
    }

    if (Object.values(resources).some(resource => {
      if (resource.clean) {
        return false
      }
      if (!resource.relative) {
        return false
      }
      if (resource.relative.url !== url) {
        return false
      }
      return true
    })) {
      return
    }
    delete state[resource.url]
  },

  start () {
    state = {}
  },

  saveResource (url, savedResource) {
    savedResource.preventSave = true
  },

  save () {
    const data = []
    Object.keys(state).forEach(key => {
      const history = state[key]
      data.push([
        key,
        history.history[history.cursor]
      ])
    })
    return data.length ? data : undefined
  },

  load (data) {
    state = {}
    data.forEach(history => {
      state[history[0]] = {
        history: [history[1]],
        cursor: 0
      }
    })
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

      updateresource(url)
      propagate(url)
    },
    undo (url, n = 1) {
      n = Math.floor(n * 1)
      const history = cleanUrlAndGetHistory(url, 'undo', n)
      if (!history) {
        return
      }
      history.cursor = Math.max(0, history.cursor - n)
      updateresource(url)
      propagate(url)
    },
    redo (url, n = 1) {
      n = Math.floor(n * 1)
      const history = cleanUrlAndGetHistory(url, 'redo', n)
      if (!history) {
        return
      }
      history.cursor = Math.min(history.cursor + n, history.history.length - 1)
      updateresource(url)
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
      updateresource(url)
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
