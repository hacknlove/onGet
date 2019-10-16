# working in progress on the readme and docks.

-----

# onGet

The KISS, write-less do more, elegant, scalable, and plugin-extensible way to deal with state in modern applications.

## Why

Because It does not feel right when you end up with a lot of boilerplate code, a lot of unnecessary complexity and a big lack of liberty.

Reactive State shared across your components should be as efficient, transparent, fun to work with, and less intrusive as possible.

## Examples

Forked from https://github.com/reduxjs/redux/tree/master/examples

* counter [source](/examples/counter) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/counter)
* Todos [source](/master/examples/todos) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/todos)
* Todos-with-undo [source](/examples/todos-with-undo) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/todos-with-undo)
* TodoMVC [source](/master/examples/todomvc) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/todomvc)
* Shopping-cart [source](/examples/shopping-cart)
* Tree-view [source](/examples/tree-view) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/tree-view)
* Async [source](/examples/async) [sandbox](https://codesandbox.io/s/github/hacknlove/onGet/tree/master/examples/async)
* Universal [source](/examples/universal)

## Quick view

1. It allows you to design a sort of virtual client-side CRUDy API that organize your application state as url accesible resorces
2. Then your application can access, change, and suscribe to this resources through global methods and urls that you can share as literals, constants or even pass around as variables that changes dinamically, that's up to you and your application needs.
3. "Batteries included" Philosophy, to deal with diverse kinds of origins and stores for your resources.
4. It is extensible through plugins, so you can add a new kind of resources that would do whatever you dream of.
5. If you do server-side rendering or prerendering, you can use serialize the state and share it with the client
6. You can also serialize and deserialize client-side, to store your state in any client-side storage you want, like localstorage or indexedDB

## Basic Usage. Examples

### Creating a subscription
```js
import { onGet } from 'onget'

const unsubscribe = onGet('dotted://hello', value => {
  console.log(value)
}, {
  first: 'word'
})

set('dotted://hello', 'world')

unsubscribe()

set('dotted://hello', 'earth')
```
