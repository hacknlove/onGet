# Advanced CRUD

Sometimes it is convenient to be able to transform the values that are going to be writted or to perform some action after a new value has been set.

This kind of things can be done attaching handlers that are executed whenbefore or after a set operation is done.

onGet offers two functions to to this:

* beforeSet
* afterSet

Both, uses express-js-like patterns to define where to hook the handler, and every hook whose pattern match the url, will be executed, in the same order that they have been attached.

## beforeSet - Pre-procesing

with beforeSet you can validate the value, transform it, and even prevent the set to take place.

The beforeSet handlers should be synchronous. You cannot asynchronously transform the value, or prevent the set.

### Change the value

Set the value you want to set to `context.value`

```js
beforeGet('fast://hello/:thing', context => {
  context.value = context.value.trim()
})

set('fast://hello/world', '  good day  ')

get('fast://hello/world') // 'good day'
```

### Prevent the set to take place

Set `context.preventSet` to true, and the set will be aborted, and no afterSet hook will be executed.

The next beforeSet will still be executed, and they could set `context.preventSet` back to false.

```js
beforeGet('fast://price', context => {
  if (context.value < 0) {
    context.preventSet = true
  }
})
set('fast://price', 14)
set('fast://price', -5)

get('fast://price') // 14

```

### Prevent the next hooks to be executed

Set `context.preventHooks` to true to prevent the next hooks to be executed, afterSet hooks included.

### Prevent the subscriptions to be called

If, for whatever reason, you need to set a new value but you do not want the subscriptions to be called, you can set `context.preventRefresh` to true.

There are 3 hooks.

* beforeRefresh


## afterSet - perform actions after the set take place

You could use `onGet` to make a function be called each time the value of a resource changes, but `afterSet` offers you some differences.

1. The `onGet` subscription listener could be called with a changed that has not be produced by a `set` call, but for some manual or automatic `refresh`, in the case of `localStorage` or `fetch` plugins. The `afterSet` hook handler will only be triggered by a `set` operation.
2. The `onGet` can be prevented with `context.preventRefresh` along the other subscriptions. The `afterSet` can be prevented with `context.preventHooks`.
3. `onGet` can be unsubscribed. `afterSet` cannot.
4. `onGet` creates an initiated the resource, if it does not exists. Because the subscription is attached to an existant resource. `afterSet` is not attached to an actual resource, but to a express-js-like url pattern.

The afterSet hooks cannot prevent the set, neither change the value. You can prevent the following afterSet hooks to be executed, though.



## common pattern

You can set a new value to a REST API resource, add a `loading` attribute with `beforeSet` and perform the API call with the `afterSet`.

```js

beforeSet('/api/items/:id', context => {
  context.value.loading = true
})

beforeSet('/api/items/:id', async context => {
  delete context.value.loading
  const response = await fetch(`/api/items/${context.params.id}`, {
    method: 'POST',
    body: JSON.stringify(context.value),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = response.json()

  set(`/api/items/${context.params.id}`, data.item, {
    preventHooks: true // set accepts a third parameter where you can put preventHooks among other options
  })
})

```
