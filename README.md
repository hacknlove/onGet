# onGet

The KISS, write-less do more, elegant, scalable, and plugin-extensible way to deal with state in modern applications is a Client-side virtual API.

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

## Documentation
[documentation](https://hacknlove.github.io/onGet/)

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
* customPlugin [source](/examples/customPlugin) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/customPlugin)


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
