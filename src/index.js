/**
 * The KISS, write-less do more, elegant, scalable, and plugin-extensible way to deal with state in modern applications is a Client-side virtual API.
 * @module onGet
 * @namespace onGet
*/
import { command } from './lib/command'
import { conf, resources, plugins } from './lib/conf'
import { get } from './lib/get'
import { load } from './lib/load'
import { once } from './lib/once'
import { onGet } from './lib/onGet'
import { refresh } from './lib/refresh'
import { refreshRegExp } from './lib/refreshRegExp'
import { registerPlugin } from './lib/registerPlugin'
import { save } from './lib/save'
import { set, beforeSet, afterSet } from './lib/set'
import { start, end } from './lib/server'
import { useOnGet } from './lib/useOnGet'
import { waitUntil } from './lib/waitUntil'

import fetch from './plugins/fetch'
import localStorage from './plugins/localstorage'
import sessionStorate from './plugins/sessionstorage'
import history from './plugins/history'
import dotted from './plugins/dotted'

registerPlugin(fetch)
registerPlugin(localStorage)
registerPlugin(sessionStorate)
registerPlugin(history)
registerPlugin(dotted)

export {
  command,
  conf,
  end,
  resources,
  get,
  load,
  once,
  onGet,
  plugins,
  refresh,
  refreshRegExp,
  registerPlugin,
  save,
  set, beforeSet, afterSet,
  start,
  useOnGet,
  waitUntil
}
