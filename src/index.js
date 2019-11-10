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
import { set } from './lib/set'
import { beforeSet } from './lib/beforeSet'
import { beforeRefetch } from './lib/beforeRefetch'
import { afterRefetch } from './lib/afterRefetch'
import { afterSet } from './lib/afterSet'
import { start } from './lib/start'
import { end } from './lib/end'
import { useOnGet } from './lib/useOnGet'
import { waitUntil } from './lib/waitUntil'

import fetch from './plugins/fetch'
import localStorage from './plugins/localstorage'
import sessionStorate from './plugins/sessionstorage'
import history from './plugins/history'
import dotted from './plugins/dotted'
import fast from './plugins/fast'

registerPlugin(fetch)
registerPlugin(localStorage)
registerPlugin(sessionStorate)
registerPlugin(history)
registerPlugin(dotted)
registerPlugin(fast)

export {
  afterSet,
  beforeSet,
  afterRefetch,
  beforeRefetch,
  command,
  conf,
  end,
  get,
  load,
  once,
  onGet,
  plugins,
  refresh,
  refreshRegExp,
  registerPlugin,
  resources,
  save,
  set,
  start,
  useOnGet,
  waitUntil
}
