# ditGIS code challenge

original no available

## Warning
You should not use this code to fullfil the selection process of Flowkey, because they will notice.


## VAFF

### `openweathermap://{city}`

It calls to `https://api.openweathermap.org/data/2.5/forecast?APPID=...&units=metric&q=${city}` and process the response to make it ready for its visualization.

It is not entirely necessary to create a plugin to get this example done, but it is a good one to show how the REST api calls can be abstracted through a custom plugin and make complex things easier.

### dotted://menu
Menu state

#### dotted://menu.items
The list of items availables in the menu

#### dotted://menu.show
Whether the menu is showed or not.


### dotted://cards
Array with the open cards
