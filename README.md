# onGet

The KISS, write-less do more, elegant, scalable, and plugin-extensible way to deal with state in modern applications is a Client-side virtual API.

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




## API Documentation
[documentation](https://hacknlove.github.io/onGet/)

## Why

Because It does not feel right when you end up with a lot of boilerplate code, a lot of unnecessary complexity, a big lack of liberty and too much coupling.

Reactive State shared across your components should be as efficient, transparent, fun to work with, and less intrusive as possible.

A virtual client-side API feels so natural that you will end up with a more understandable and scalable and mantainable code.

## Characteristics

1. It allows you to design a sort of client-side CRUDy API that organize your application state as url-accessible resources.
2. Then your application can access, change, and subscribe to this resources through urls.
3. It follows a "Batteries included" Philosophy, to help you deal with undoable histories, deep states, remote APIs, localStorage and sessionStorage.
4. It is extensible through plugins, so you can add a new kind of resources to fit your needs.
5. You can add transformations and validations to the values you set to the resources.
6. You use expressjs-like paths to add more functionality to your API
6. If you do server-side rendering or prerendering, you can use serialize the state and share it with the client.
7. You can also serialize and deserialize client-side, to store your state in any client-side storage you want, like localstorage or indexedDB


## Basic Usage. Examples

### Set and get the value of a resource
```js
import { get, set } from 'onget'

get('history://foo') // undefined

set('history://foo', 'bar')

get('history://foo') // 'bar'

```

### Subscribe to a resource
```js
import { onGet, set } from 'onget'

const unsubscribe = onGet('dotted://hello', value => { // handler
  console.log(value)
}, {
  first: 'word' // Optionally set a first value only if the response has no value yet
})

set('dotted://hello', 'Earth') // The handler will be executed

unsubscribe() // You can unsubscribe

set('dotted://hello', 'Mars') // The handler will not be executed
```

### React hook
```js
import React from 'react'
import { useOnGet } from 'onget'

export function MyComponent () {
  const myValue = useOnGet('dotted://myResource')

  return (
    <p>{myValue}</p>
  )
}
```

### Modify the behavior of `set`

```js
import { beforeSet, set } from 'onget'

beforeSet('localstorage://day', context => {
  if (![
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ].includes(value)) {
    context.preventSet = true // prevent the set
  }
})
beforeSet('sessionStorage://count/:item', context => {
  context.value = parseInt(context.value) // modify the value to be set
})

set('localStorage://day', 'monday') // localStorage.day => 'monday'
set('localStorage://day', 'fooday') // localStorage.day => 'monday'
set('sessionStorage://count/happyness', '42') // sessionStorage['count/happyness'] => 42
set('sessionStorage://count/life', 12.3) // sessionStorage.day => 12
```


### Execute some function after the set
```js
import { afterSet, set } from 'onget'

afterSet('/api/name', context => {
  fetch('/api/name', {
    method: 'POST',
    body: JSON.stringify({
      name: context.value
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
})

set('/api/name', 'johndoe') // a HTTP POST request will be done
```

## Full Examples

Forked from https://github.com/reduxjs/redux/tree/master/examples

* counter [source](/examples/counter) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/counter)
* Todos [source](/master/examples/todos) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/todos)
* Todos-with-undo [source](/examples/todos-with-undo) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/todos-with-undo)
* TodoMVC [source](/master/examples/todomvc) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/todomvc)
* Shopping-cart [source](/examples/shopping-cart)
* Tree-view [source](/examples/tree-view) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/tree-view)
* Async [source](/examples/async) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/async)
* Universal [source](/examples/universal)

## Coding Challenges
* WheatherMaps [source](/codingChallenges/WheatherMaps) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/codingChallenges/WheatherMaps)
* wallmartlabs [source](/codingChallenges/wallmartlabs) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/codingChallenges/wallmartlabs)
