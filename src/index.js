import { onGet } from './onGet'
import { set } from './set'
import { refresh } from './refresh'
import { get } from './get'
import { conf } from './conf'
import { registerPlugin } from './registerPlugin'

import fetch from '../plugins/fetch'
import localStorage from '../plugins/localstorage'
import sessionStorate from '../plugins/sessionstorate'
import state from '../plugins/state'

registerPlugin(state)
registerPlugin(localStorage)
registerPlugin(sessionStorate)
registerPlugin(fetch)

export {
  onGet, set, refresh, get, registerPlugin, conf
}
