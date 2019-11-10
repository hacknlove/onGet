## Plugins

### fast
The fastest key>value plugin.

```js
  onGet('fast://someKey', someHandler)
```

### dotted
A deeply-dotted-key aware plugin.

* It allows you to get/set/subscribe to any deeply-dotted-key
* The change events are propagated to every parent and to only those child whose value has been changed.

```js
  onGet('dotted://someKey.foo', someFooHandler)
  onGet('dotted://someKey.bar.baz', someBarHandler)

  set('dotted://someKey', {
    foo: 42,
    bar: {
      baz: 'quz'
    }
  })
```

#### Commands
* **remove** It removes a value
```js
  onGet('dotted://foo', value => console.log(JSON.stringify(value)))

  set('dotted://foo.bar', { baz: 42 }) // {"bar":{"baz":42}}

  command('dotted://foo.bar.baz', 'remove') {"bar":{}}
```

### history
A plugin with independent histories for each key

* It allows you to undo/redo on the fields you want to. For instance, in a text editor you could be interested in undo the content but not the UX state like zoom level.
* You can also subscribe to prev and next steps.

```js
  onGet('history://someKey', someHandler)
  set('history://someKey', 'first step')
  set('history://someKey', 'second step')
  command('history://someKey', 'undo')
  set('history://someKey', 'new second step')
```

#### Commands
* **replace** It set a new value, without advancing the history
* **undo** It undoes a step in the history
* **redo** It redoes a step in the history
* **goto** It makes the indicated step the active one
* **first** It makes the history go to the first step
* **last** It makes the history go to the last step
* **length** It returns the amount of steps in the history
* **undoLength** It returns the amount of undoable steps in the history
* **redoLength** It returns the amount of redoable steps in the history

### localStorage
A plugin that uses localStorage, so the state is persistent and it trigger the subscription handlers if the value is changed from other tabs.

It serializes and deserialize the values.

```js
  onGet('localStorage://someKey')
```

### sessionStorage
A plugin that uses sessionStorage, so the state is persistent between reloads but different between tabs.

It serializes and deserialize the values.

```js
  onGet('sessionStorage://someKey')
```

### fetch
A plugin that obtain the values from HTTP GET requests.

Requests to the same endpoint are debounced and their responses are cached and periodically refreshed.

```js
  onGet('/absolute/url', someHandler)
  onGet('relative/foo', someOtherHandler)
  onGet('https://full.url', someThirdHandler)
```

* You can `set` a value, to speed things up if you optimistically know the value that the enpoint will return, (for instance after making some other POST to the API)
* You can ask for a manual refresh, to not wait for the periodical one, if you know the value has changed, , (for instance after making some POST to the API)
* `get` is syncronous, so used with urls from fetch plugin, it only returns a value if the url has been used previously with `onGet`, `useOnGet` or `set`
* You can use beforeRefetch to configure the `fetch` call.
