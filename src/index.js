import { onGet } from './onGet'
import { useOnGet } from './useOnGet'
import { set } from './set'
import { refresh } from './refresh'
import { get } from './get'
import { command } from './command'
import { conf, endpoints, plugins } from './conf'
import { registerPlugin } from './registerPlugin'

import fetch from '../plugins/fetch'
import localStorage from '../plugins/localstorage'
import sessionStorate from '../plugins/sessionstorage'
import dotted from '../plugins/dotted'

registerPlugin(fetch)
registerPlugin(localStorage)
registerPlugin(sessionStorate)
registerPlugin(dotted)

export {
  onGet, useOnGet, set, refresh, get, registerPlugin, conf, endpoints, plugins, command
}
