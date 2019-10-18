import pathToRegExp from 'path-to-regexp'

/**
 * Execute all the hooks that match an url
 *
 * @private
 * @param {Array} where array to search for the hook
 * @param {object} context object to be passed to the hook
 * @returns {object} the context object, it might be modified by the hooks
 */
export function executeHooks (where, context) {
  for (let i = 0, z = where.length; i < z; i++) {
    if (context.preventHooks) {
      break
    }
    const [regex, keys, cb] = where[i]
    const match = context.url.match(regex)
    if (!match) {
      continue
    }
    context.params = {}
    for (let i = 1; i < match.length; i++) {
      context.params[keys[i - 1].name] = match[1]
    }

    cb(context)
  }

  return context
}

/**
 * Prepares the regex that match the path patters, and insert the hook in the indicated array
 *
 * @private
 * @param {string} path the same format of express. (path-to-regexp)
 * @param {afterSetHook|BeforeSetHook} hook Function to be called at hook time
 * @param {Array} where array to insert the hook in
 */
export function insertHook (path, hook, where) {
  const keys = []
  const regex = pathToRegExp(path, keys)
  where.push([regex, keys, hook])
}
