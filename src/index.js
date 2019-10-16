import { command } from './command'
import { conf, resources, plugins } from './conf'
import { get } from './get'
import { load } from './load'
import { once } from './once'
import { onGet } from './onGet'
import { refresh } from './refresh'
import { refreshRegExp } from './refreshRegExp'
import { registerPlugin } from './registerPlugin'
import { save } from './save'
import { set, beforeSet, afterSet } from './set'
import { start, end } from './server'
import { useOnGet } from './useOnGet'
import { waitUntil } from './waitUntil'

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
