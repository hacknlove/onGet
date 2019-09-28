import { onGet } from './onGet'
import { useOnGet } from './useOnGet'
import { set } from './set'
import { refresh } from './refresh'
import { get } from './get'
import { conf, endpoints, plugins } from './conf'
import { registerPlugin } from './registerPlugin'

import fetch from '../plugins/fetch'
import localStorage from '../plugins/localstorage'
import sessionStorate from '../plugins/sessionstorage'
import state from '../plugins/state'

registerPlugin(fetch)
registerPlugin(localStorage)
registerPlugin(sessionStorate)
registerPlugin(state)

export {
  onGet, useOnGet, set, refresh, get, registerPlugin, conf, endpoints, plugins
}
