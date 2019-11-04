# Basic CRUD

Simple CRUD operations are very straightforward to do with onGet. Just think about what urls you need, and use`set` to create, update and delete; and `get`, `onGet` or `useOnGet` to read,

It is up to you to choose good descriptive urls, so your code is readable.


```js
set('fast://menuOpened', true);
```

```js
get('fast://menuOpened') // -> true
```

`onGet` attach a listener to a subscription to the resource

```js
onGet('fast://menuOpened', value => {
  // ...
})
```

`useOnGet` is a react hook that refresh the component whenever the resource changes.

```js
function SomeComponent () {
  const menuOpened = useOnGet('fast://menuOpened')
  return (
      ...
  )
}
```

## Resource URLs and plugins

The "protocol" of the url determine the plugin that will be used. If no protocol is present, the url will be processed by the `fetch` plugin.

It is very important to be aware that `fast://someurl`, `dotted://someurl`, `history://someurl` are completely separate resources, with their own values and subscriptions.

### fast - just values.
Those resource that have no special needs, should use urls that start with `fast://...` because they go right to the point.

### history - undoable and redoable
You should use urls that start with `history://` with those (and only those) resources that needs to be undoable and redoable.

Otherwise you shouldn't use `history://` because it uses more memory and it involves more steps that you do not need.

### dotted - urls to the members of an object.
When It is more convenient for your code to perform CRUD operations in some deep key path on objects, so you can set or subscribe in dotted key paths, you can use `dotted://` urls. Like `dotted://foo.bar.buz` that points to `{ bar: { buz: --> HERE <-- }}` inside `dotted://foo`

### localStorage and sessionStorage - Persistence
If you need some resource to be backed by localStorage or sessionStorage, you should use `localStorage://...` or `sessionStorage://...`

localStorage also respond to changes that have been made from other tabs.

### fetch - REST API

In a nutshell `/some/url/` returns the value of fetching `/some/url`

We will talk about the fetch plugin in the his own tutorial.
