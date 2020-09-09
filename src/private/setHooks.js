import { match } from 'path-to-regexp'

const pathSearchAndHashRegExp = /^(.*?)(\?(.*?))?(#(.*))?$/

/**
 * Execute all the hooks that match an url
 *
 * @private
 * @param {Array} where array to search for the hook
 * @param {object} context object to be passed to the hook
 * @returns {object} the context object, it might be modified by the hooks
 */
export function executeHooks (where, context) {
  const pathSearchAndHash = context.url.match(pathSearchAndHashRegExp)
  context.path = pathSearchAndHash[1]
  context.search = pathSearchAndHash[3]
  context.hash = pathSearchAndHash[5]

  for (let i = 0, z = where.length; i < z; i++) {
    if (context.preventHooks) {
      break
    }
    const [match, cb] = where[i]

    const isMatch = match(context.path)
    if (!isMatch) {
      continue
    }
    context.params = isMatch.params

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
  const regex = match(path)
  where.push([regex, hook])
}
