# OnGet - Getting started

OnGet allows you to follow the **VAFF** *(virtual api for front)* design pattern, thus it helps you to make your application more mantainable, more KISS.

In this tutorial you will learn the basics concepts that let you start using onGet.

## When should you use onGet ?

Uou should consider trying onGet when you are writing a state driven UI, and you realized that things are getting too much complicated, you feel that you have lots of code bloat, and unnecessary artifacts that does not make the code more efficient, testeable, readable, maintainable, or better, and you believe that it should be a more convenient way to do it.

## Install

```
npm i onget
```

## setup and configuration

There is none.

Just import and use.

## Basic example

```js
import { onGet, set, get } from 'onget'

// initialize a resource at the url fast://counter, with a value
set('fast://counter', 0)

// Subscribe to changes in the resource
onGet('fast://counter', value => {
  console.log(value)
})

// Declare a function that updates the value of the resource
function sum (value) {

  // The current value of a resource can be obtained with get
  const old = get('fast://counter')

  // A new value can be set, with set
  set('fast://counter', old + value)
}

sum(4)
// 4
sum(-3)
// 1
sum(6)
// 7
```

## Get ready to scale

There is only one tip to make your code scalable, and it is a very simple one.

You should document your *VAFF*

* What resources are being using, and what for.
* Which of them are using hooks, and what for.

Being a frontend developer you know the importance of having a good documentation of the Rest API (or GraphQL) you need to use. Just write the VAFF documentation with this in mind.

As long as you can keep this documentation clear, you will be safely increase the complexity of your app without descending into madness.

When you are ready to get to the next level, take a look at [document-your-VAFF](tutorial-document-your-VAFF.html)