# deepObject
![test coverage 100%](https://img.shields.io/badge/test_coverage-100%25-brightgreen)
![dependencies 0](https://img.shields.io/badge/dependencies-0-brightgreen)
![minified size 5.5k](https://img.shields.io/badge/minified_size-2k-brightgreen)

## Install

### npm
```bash
npm i onget
```

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/isdifferent@1.0.2/build/isDifferent.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/onget/@1.0.0/build/onGet.min.js"></script>
```

And if you plan to use `state://deep.dot.key` in memory state, you must include too
```html
<script src="https://cdn.jsdelivr.net/npm/@hacknlove/deepobject@1.1.2/build/deepObject.min.js"></script>
```

## Use

### urls
The state is organized in urls that maps some resource through a plugin.

For instance:

* The url `http://example.com/some/path` maps to the response of fetch a GET to that url, through the included plugin `fetch`
* The url `localstorage://foo` maps to the value `foo` at `localStorage` through the included plugin `localStorage`
* The url `sessionstorage://foo` maps to the value `foo` at `sessionStorage` through the included plugin `sessionStorage`
* The url `state://some.deep.dooted.key` maps to `VALUE` in some in-memory state similar to `{..., some: {..., deep: {..., dooted: {.., key: VALUE }}}}`

### Subscriptions

If you execute `onGet(url, callback)`, `callback(value)` will be executed each time the state for `url` changes

Do not be afraid to create for the same url, as many subscriptions you need. It is done efficiently.

When you stop needing a suscription, you should call the unsubscribe function that is returned by `onGet`, this way, when no suscription is left for an url, some things can be cleaned up.

```js
const unsubscribe = onGet(url, callback);
```

### Externa/internal sources

The plugins can connect with external or internal sources. 

#### Pure external sources
The pure external sources are those whose values are changed from outside the application, like the response to an endpoint.

The urls of external sources are periodically checked, to detect changes and call the suscription callbacks if it is needed.

You can change the interval in with a url is checked with the optional parameter `interval`

```js
const unsubscribe = onGet(url, callback, { interval: 1000 }) // miliseconds
```

If there are various subscriptions to the same url, the check interval will be the minimum of all his intervals.

You can call manually `refresh(url)` when you know (or think) that the value could have been changed, to force the plugin to check it.

If you optimistically know the new value, you can call `set(url, value)` to spped things up, but that does not change any value at the external source, so at the next check a different value can come back.  


#### Pure internal sources

The pure internal sources are those whose value only can be changed calling `set(url, value)`

* There are no periodical checks
* there is no point in setting `interval`
* `refresh` does nothing
* `set(url, value)` does actually change the value at the internal source.

#### Hybrid External/Internal sources

The hybrid external/internal sources are those whose values can be changed from outside the application, but also with `set(url, value)`

* There are periodical checks
* The interval can be stablished with `onGet(url, callback, {interval: milliseconds})`
* `refresh` forces a check
* `set(url, value)` does change the value at the source.

## API

### onGet(url, callback, options) => function
It starts a suscription for the `url` that calls `callback` each time the state of the `url` changes.
It returns an `unsuscribe` function.

The callback is callback with the state of the url as the only parameter.

#### options.interval
The interval to re-check the `url`, in milliseconds

Only for external sources, like `fetch`, `localStorage` and `sessionStorage`

You can pass Infinity to disable the periodical checks

Be careful with passing too low values, because you can degrade the performance of the application.

#### options.first
The first value to initialize the state, if it has been initialized yet.
On external sources, it could not change the actual value. See the plugin documentation.

### set(url, value, doPospone) => undefined
It sets the state for the url. 
On external sources, it could not change the actual value. See the plugin documentation.

If the plugin has periodical checks, you can postpone the next one, passing true as `doPospone`

### refresh(url) => boolean / undefined
For interval sources, it does nothing.

For example sources, it checks the actual value, and if it is different than the state, it updates it and call the subscriptions callbacks.
Different or not, it postpone the next periodical check.

If there is no suscription for this url, it returns `false`.

If it is called to close to other refresh, or to a periodical check, it returns `undefined`, and does nothing.

It returns `true`, otherwise.


### get(url, onlyCached=true)
Returns the state for the url.

If there is no suscription for the url and `onlyCached=false`, it could be return the value from the source. See the plugin documentation.

### registerPlugin
Allows you to register a new plugin, to deal with other urls, like `foo://...`

[See Plugin Authoring](#plugin-authoring)


### conf.CACHE_SIZE

To speed things up, the state of completely unsubscribed url is kept for a while.

If the amount of urls is less than `conf.CACHE_SIZE`, the garbage collector does nothing.

If you are concerned with the memory consumption, because your states are very big, you should decrease `conf.CACHE_SIZE`

If you use (and reuse) more than `conf.CACHE_SIZE` urls, and you are concerned with the latency of your external sources, you can increase this number.

## Included Plugins

### state `state://some.dotted.key`

Uses a pure internal source. 

It is a way very fast, and very convenient to reactively share state across your application.

The urls are `deep.dotted.keys`, so if the state of `state://some.dotted.key` is `{foo: 'bar}` the state of `state://some.dotted.key.foo` is `bar`

The changes are propagated efficiently up and down, so if you call `set('state://some.dotted.key', {foo: 'buz'})` the next subscriptions callbacks are called (if the subscriptions exist)

* `state://some.dotted.key`
* `state://some.dotted`
* `state://some`
* `state://some.dotted.key.foo`

As pure internal source:
* `set` changes the value at the source
* there are no periodical checks
* `refresh` does nothing
* the `interval` optional parameter at `onGet` does nothing


### localStorage `localStorage://someKey`

Uses `localStorage` as hybrid external/internal source.

The url `localStorage://someKey` points to the resource `localStorage.someKey`

As hybrid external/internal source:
* `set` changes the value at the source
* there are periodical checks, the default interval value is 3000 milliseconds.
* refresh does check the actual value

### sessionStorage `sessionStorage://someKey`

Uses `sessionStorage` as hybrid external/internal source.

The url `sessionStorage://someKey` points to the resource `sessionStorage.someKey`

As hybrid external/internal source:
* `set` changes the value at the source
* there are periodical checks, the default interval value is 3000 milliseconds.
* refresh does check the actual value

### fetch `http://example.com/foo/bar`

Uses HTTP GET as pure external source.

It is a catch-all that handles every url that has not been handle by other plugin.

The url `http://example.com/foo/bar` points to the JSON object of the response, or the raw body if it is not valid JSON. No matter what HTTPS status. It can also points to the error, if the HTTP GET cannot be done.

As pure external source:
* `set` changes the value at the source. It is only used to optimistically speed things up.
* there are periodical checks, the default interval value is 3000 milliseconds.
* refresh does check the actual value

## Plugin authoring

**Jump this if you are not writing your own plugin.**

A plugin is a javascript object with the following attributes:

### configuration
#### name
It is not used, but you should set a name for your plugin.
#### regex
The regex to check the url for instance `/^foo:\/\//`
#### checkInterval
If you source need to be checked periodically, set here a default interval, in milliseconds.

Only for external sources.

#### threshold
Amount in milliseconds of time to debounce the consecutive checks, because of `refresh` or `onGet`

Only for external sources.

### Hooks
### getEndpoint(endpoint) => undefined
**Optional**
The subscriptions for a `url` are handled by an enpoint, that is stored as long as needed (and a bit more to speed things up)


When `onGet(url, callback)` is executed, it looks for an existent endpoint for this url, and if it cannot find it, creates one, and call the plugin hook `getEndpoint`

At this very first moment, the endpoint contains:
* url: with the url
* plugin: with the whole plugin
* value: as passed in `options.first` or undefined
* callbacks: an empty object to store the subscriptions callbacks
* intervals: an empty object with the different interval of each subscription (only if plugin has `checkInterval`)
* last: `-Infinity` if the plugin has `threshold` 

This hook is your chance to add or change the attributes on the endpoint, so you can deal with the url whenever other plugin hooks were called.

### plugin.refresh(endpoint, eventHandler) => undefined
**mandatory for external sources**
It is called to update the `endpoint.value` according to the actual value at the `url`

It can not only be called by `refresh('url')` but also by `onGet` and by the periodical checks.

You should get the new value using `endpoint.url` but you cannot update `endpoint.value` because it will be used to determine if the new value is different from the current one.

You should instead execute `eventHandler(newValue)`

You can never call `eventHandler` if there is nothing to refresh.

### plugin.set(endpoint) => undefined
**mandatory for internal sources**
When `set(url, value)` determines that the new value is different from the current one, it stablish the new `endpoint.value` and then executes the `plugin.set(endpoint)`

That is your chance to update the internal source.

### plugin.get(url) => any
**optional**
If there is no endpoint to be used by `get(url, onlyCached=false)`, `plugin.get(url)` will be executed (if exists)

It sould be syncronous, and return the value as it is. As it would be stored in the corresponding `endpoint.value`

### plugin.clean(endpoint) => boolean
**optional**
When the garbage collector is going to delete the endpoint from `endpoints` and to stop the periodical check timer, it executes `plugin.clean(endpoint)`

That is your chance to clean the things up, or to return `true` and prevent the garbage collector from deleting the endpoint

