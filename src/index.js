import { onGet } from './onGet'
import { useOnGet } from './useOnGet'
import { set } from './set'
import { refresh } from './refresh'
import { get } from './get'
import { once } from './once'
import { waitUntil } from './waitUntil'
import { command } from './command'
import { conf, endpoints, plugins } from './conf'
import { registerPlugin } from './registerPlugin'
import { start, end } from './server'

import fetch from '../plugins/fetch'
import localStorage from '../plugins/localstorage'
import sessionStorate from '../plugins/sessionstorage'
import history from '../plugins/history'
import dotted from '../plugins/dotted'

registerPlugin(fetch)
registerPlugin(localStorage)
registerPlugin(sessionStorate)
registerPlugin(history)
registerPlugin(dotted)

export {
  command,
  conf,
  end,
  endpoints,
  get,
  once,
  onGet,
  plugins,
  refresh,
  registerPlugin,
  set,
  start,
  useOnGet,
  waitUntil
}
