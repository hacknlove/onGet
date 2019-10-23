// import '../openweathermap'
import { set, get, registerPlugin, conf } from 'onget'
import menuItems from './init.json'

set('dotted://menu.items', menuItems)
set('dotted://cards', [])

export function toggleCity (city: string) {
    const cards = get('dotted://cards')

    if (!cards.includes(city)) {
        set('dotted://cards', [...cards, city])
        return
    }
    set('dotted://cards', [...cards.slice(0, cards.indexOf(city)), ...cards.slice(cards.indexOf(city) + 1)])
}

const protocolCut = 'openweathermap://'.length
conf.plugins.openweathermap = {
    checkInterval: Infinity,
    threshold: 3000
}
registerPlugin({
  name: 'openweathermap',
  regex: /^openweathermap:\/\//,
  getResource (resource: any) {
    resource.city = resource.url.substr(protocolCut)
    resource.value = {
      name: 'Loading'
    }
  },
  async refresh (resource: any) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?APPID=2bde50bdcc809a6230f17e9ba8e7f951&units=metric&q=${resource.city}`) as any

    const data = await response.json()

    return {
      name: data.city.name,
      data: data.list.map((data: any) => ({
        timestamp: data.dt,
        name: data.dt_txt.substr(5, 8) + 'h',
        temp: data.main.temp,
        humidity: data.main.humidity,
      }))
    }
  }
})
