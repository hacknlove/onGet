import pathToRegExp from 'path-to-regexp'

/**
 * Execute all the hooks that match an url
 * @private
 * @param {array} where array to search for the hook
 * @param {object} event object to be passed to the hook
 * @return {object} the event object, it might be modified by the hooks
 */
export function executeHooks (where, event) {
  for (let i = 0, z = where.length; i < z; i++) {
    if (event.preventHooks) {
      break
    }
    const [regex, keys, cb] = where[i]
    const match = event.url.match(regex)
    if (!match) {
      continue
    }
    event.params = {}
    for (let i = 1; i < match.length; i++) {
      event.params[keys[i - 1].name] = match[1]
    }

    cb(event)
  }

  return event
}

/**
 * Prepares the regex that match the path patters, and insert the hook in the indicated array
 * @private
 * @param {string} path the same format of express. (path-to-regexp)
 * @param {(afterSetHook|BeforeSetHook)} hook Function to be called at hook time
 * @param {array} where array to insert the hook in
*/
export function insertHook (path, hook, where) {
  const keys = []
  const regex = pathToRegExp(path, keys)
  where.push([regex, keys, hook])
}
