# onGet
The KISS, write-less do more, elegant, plugin-extensible way to handle state with diverse origins.

## Why

Because It does not feel right when you end up with a lot of boilerplate code, a lot of unnecessary complexity and a big lack of liberty.

Reactive State shared across your components should be as efficient, transparent, fun to work with, and less intrusive as possible.


## Install

### npm
```bash
npm i onget
```

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/isdifferent@1.1.0/dist/isDifferent.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/onget@1.1.3/dist/onGet.umd.min.js"></script>
```

And if you plan to use `dotted://deep.dot.key` in memory state, you must include too
```html
<script src="https://cdn.jsdelivr.net/npm/@hacknlove/deepobject@1.1.6/dist/deepObject.umd.min.js"></script>
```


## Examples

Forked from https://github.com/reduxjs/redux/tree/master/examples

* Counter-vanilla [source](/examples/counter-vanilla) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/counter-vanilla)
* counter [source](/examples/counter) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/counter)
* Todos [source](/master/examples/todos) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/todos)
* Todos-with-undo [source](/examples/todos-with-undo) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/todos-with-undo)
* TodoMVC [source](/master/examples/todomvc) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/todomvc)
* Shopping-cart [source](/examples/shopping-cart)
* Tree-view [source](/examples/tree-view) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/tree-view)
## Use

### urls
The state is organized in urls that points some resource through a plugin that deal with some state source or origin.

For instance:

* The url `http://example.com/some/path` points to the response of fetch a GET to that url
* The url `localstorage://foo` points to the value `foo` at `localStorage`
* The url `sessionstorage://foo` points to the value `foo` at `sessionStorage`
* The url `dotted://some.deep.dotted.key` points to the value of `some['some']['deep']['dotted']['key']` in an in-memory state .
* The url `history://someKey` points to an in-memory state called `someKey` that is undoable and redoable

### Subscriptions

If you execute `onGet(url, callback)`, `callback(value)` will be executed each time the state for `url` changes

Do not be afraid to create for the same url, as many subscriptions you need. onGet deals with that efficiently.

When you stop needing a subscription, you should call the unsubscribe function that is returned by `onGet`, to free resources.

```js
const unsubscribe = onGet(url, callback);
```

If you use `useOnGet` you do not need to worry about unsubscribe.


## API

### onGet(url, callback, options) => function
It starts a subscription for the `url` that calls `callback` each time the state of the `url` changes.
It returns an `unsubscribe` function.

The callback is called with the state of the url as the only parameter.

#### options.interval
The interval to re-check the `url`, in milliseconds.

Only for those plugins that periodically check the sources for value changes.

The actual interval is the minimum of all the intervals for the same url.
If the minimum interval is Infinite, there will not be periodical checks.

Be careful with passing too low values, because you can degrade the performance of the application.

#### options.first
The first value to initialize the state, if it has been initialized yet. See the plugin documentation.

### useOnGet(url, options) => value
React hook that reloads the component when the state of url changes

`options` are passed to `onGet`


### set(url, value, doPospone=false) => undefined
It sets the state for the url.
It could change the actual value at the source, or not. See the plugin documentation.

If the plugin supports periodical checks, you can postpone the next check, passing true as `doPospone`

### refresh(url, force=boolean) => boolean / undefined
it checks the actual value at the source, and if it is different than one stored at the state, it updates it and call the subscriptions callbacks.

Either Different or not, it postpone the next periodical check.

If there is no subscription for this url, it returns `false`.

If the plugin supports periodical checks and refresh is called to close a periodical check (or to other refresh), it returns `undefined`, and does nothing. If you want to force the refresh even if it too close to the previous one, you can set force to true.

It returns `true`, otherwise.

### get(url) => value
Returns the state for the url.

If there is no subscription for the url, it depends on the plugin. See the plugin documentation.

### command(url, command, ...params) => any

Execute a plugin comand. See the available commands for each plugin in the documentation.

### registerPlugin(plugin) => undefined
Allows you to register a new plugin, to deal with other urls, like `foo://...`

[See Plugin Authoring](#plugin-authoring)

## Included Plugins

### history `history://someKey`
To store (undo-redo)able states.

#### Quick Notes
* `set` push a new state in the history, and clear the redo states if any.
* there are no periodical checks
* `refresh` does nothing
* the `interval` optional parameter at `onGet` does nothing
* To undo/redo you must call `command('history://someKey', 'undo')`/`command('history://someKey', 'redo')`
* To undo/redo all your histories, you must call `command('history://, 'undo')`/`command('history://, 'undo')`
* You can suscribe to relative steps, so `history://someKey#1` points to the previous state on `someKey` history.
* Updates are propagated to the relative steps.

#### Commands

* `command('history://someKey', 'replace', newValue)` replace the current value with a newOne. Do not push it in the history, but clear the redo steps, if any.
* `command('history://someKey', 'undo', n = 1)` go back n step
* `command('history://someKey', 'redo', n = 1)` go forward n step
* `command('history://someKey', 'goto', n)` go to the n-th step (0 based)
* `command('history://someKey', 'first')` go to the first state
* `command('history://someKey', 'last')` go to the last state
* `command('history://someKey', 'length')` returns the history length
* `command('history://someKey', 'undoLength')` amount of steps that can be undone
* `command('history://someKey', 'redoLength')` amount of steps that can be redone

** Execute command in all histories **
The catch all histories url, `history://`, can be used with commands, to execute any command, but `length`, `undoLength` and `redoLength`, with every histories.

For instance `command('history://', 'undo'), undoes one step in every history.

If you use `history://` with `useOnGet`, `onGet`, `get` or `set`, the catch-all behavior will stop working, and the commands executed in the url `history://` will affect only the sole history referenced by this url.


#### Relative URL `history://someKey#n`

With `onGet`, `useOnGet` and `get` points to previous `n` state.

So `history://someKey#1` is the previos one, and `history://someKey#2` is two steps before now, and `history://someKey#-1` is the next step (if exists)

With `set` it does not push a new state in the history, but overwrites the pointed state.

**Commands and relative URL**
Relative urls are threated transparentely as the original url so `command('history://someKey#n', command, ...params)` is like `command('history://someKey', command, ...params)`


### dotted `dotted://some.dotted.key`

To store states that fully works with `deep.dotted.keys`, so if the state of `dotted://some.dotted.key` is `{foo: 'bar}` the state of `dotted://some.dotted.key.foo` is `bar`, and the changes are propagated efficiently up and down to parents and children, so if you call `set('dotted://some.dotted.key', {foo: 'buz'})` the next subscriptions callbacks are called (if exist)

* `dotted://some.dotted.key`
* `dotted://some.dotted`
* `dotted://some`
* `dotted://some.dotted.key.foo`

#### Quick Notes
* `set` changes the value at the source, and propagates to children and parents.
* there are no periodical checks
* `refresh` does nothing
* the `interval` optional parameter at `onGet` does nothing

### localStorage `localStorage://someKey`

The url `localStorage://someKey` points to the resource `localStorage.someKey`

#### Quick Notes
* `set` changes the value at the source
* there are periodical checks, the default interval value is 3000 milliseconds.
* refresh does check the actual value

### sessionStorage `sessionStorage://someKey`

The url `sessionStorage://someKey` points to the resource `sessionStorage.someKey`

#### Quick Notes
* `set` changes the value at the source
* there are periodical checks, the default interval value is 3000 milliseconds.
* refresh does check the actual value

### fetch `http://example.com/foo/bar`

Does a HTTP GET to the url. It is a catch-all that handles every url that has not been handle by other plugin.

The url `http://example.com/foo/bar` points to the JSON object of the response, or the raw body if it is not valid JSON. No matter what HTTPS status. It can also points to the error, if the HTTP GET cannot be done.

#### Quick Notes
* `set` does **NOT** change the value at the source. It is only used to optimistically speed things up.
* there are periodical checks, the default interval value is 3000 milliseconds.
* refresh does check the actual value
* `get` does not make a HTTP request. if the urls has never been used with `onGet` or if it has been cleaned by the garbage collector, `get` returns undefined

## Advanced use:

### conf.CACHE_SIZE (= 100)

If the amount of urls is less than `conf.CACHE_SIZE`, the garbage collector does nothing:

If you are concerned with the memory consumption, because your states are very big, you should decrease `conf.CACHE_SIZE`

If you use (and reuse) more than `conf.CACHE_SIZE` urls, and you are concerned with the latency of your fetch urls, you can increase this number.


## Plugin authoring

**Forget this if you are not writing your own plugin.**

A plugin is a javascript object with the following attributes:

### configuration
#### plugin.name
It is not used, but you should set a name for your plugin.
#### plugin.regex
The regex to check the url for instance `/^foo:\/\//`
#### plugin.checkInterval
If you source need to be checked periodically, set here a default interval, in milliseconds.
#### plugin.threshold
Amount in milliseconds of time to debounce the consecutive checks, because of `refresh` or `onGet`
#### plugin.commands
Object to define the commands your plugin will accept.
```js
const plugin = {
  ...
  commands: {
    commandName (url, ...params) {
      //
    }
  }
}
```

### Hooks
All hooks are optional. Define the ones you need to deal with your source.

#### plugin.getEndpoint(endpoint) => undefined
When `onGet(url, callback)` is executed, it checks if this url is being used, or has been used and is not cleaned), if not it calls the plugin hook `getEndpoint`

At this very first moment, the endpoint contains:
* url: with the url
* plugin: with the whole plugin
* value: as passed in `options.first` or undefined
* callbacks: an empty object to store the subscriptions callbacks
* intervals: an empty object with the different interval of each subscription (only if plugin has `checkInterval`)
* last: `-Infinity` if the plugin has `threshold`

You can use `plugin.getEndpoint` to add or change the attributes on the endpoint, so you can deal with the url whenever other plugin hooks were called.

#### plugin.refresh(endpoint, eventHandler) => undefined
It is called to check the source, and update the `endpoint.value`

It is called by `refresh('url')`, and by the periodical checks.

After you get the new value, you should execute `eventHandler(newValue)` and never update `endpoint.value` by yourself, because it is used to determine if it has changed.

#### plugin.set(endpoint) => undefined
When `set(url, value)` determines that the new value is different from the current one, it stablish the new `endpoint.value` and then executes the `plugin.set(endpoint)`

You can use `plugin.set` to update the source, if your source can be updated by the plugin, like localStorage, sessionStorage, or dotted, but unlike fetch.

#### plugin.get(url) => any
`get(url)` returns the cached value, if exists.

If there is no cached value, but the plugin for the url has `plugin.get`, `get(url)` returns the response of executing `plugin.get(url)`

To be transparent for the developer, It should return the same value that would be stored in the corresponding `endpoint.value`

#### plugin.clean(endpoint) => boolean
When the garbage collector is going to delete the endpoint from `endpoints` and to stop the periodical check timer, it executes `plugin.clean(endpoint)`

That is your chance to clean the things up, or to return `true` and prevent the garbage collector from deleting the endpoint
