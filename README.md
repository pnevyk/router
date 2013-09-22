# Just another router

Lightweight and simple javascript router using HTML5 History API or hashbangs. To see some examples in action, click [here](https://c9.io/nevyk/router/workspace/test/index.html).

IT IS NOT READY TO PRODUCTION USE YET!

## Unnecessary story

This is just another javascript router useful for SPA apps or anything else. The purpose, why I have written it, is that I wanted to make something relatively simple but also interesting. So I have chosen url routing, because it has some small obstacles which I had to solve.

For example, one "problem" is that older browsers doesn't support HTML5 History API so I had to implement the fallback with hashbang. I solved this with something like Dependency Injection (I made two router providers, the first for HTML5 History API and the second using hashbang "hack", so in my library I can use one of these abstractions but it doesn't matter which one. I had to also use regular expressions (for wildcard parameters). Although there are very simple ones, every oppurtinity to use it (and try it) is nice.

I am targeting a simple API to use. As I said, I made this router for improving my development knowledge and learning some new programming techniques primarily, but you can use it, of course. I have put it under MIT license, so feel free. I have to say that there are a lot of other javascript routing libraries which are better choice. One reason can be they have continual development progress, another one can be they have some community which will answer your questions. I have none of these. If I want to do it I will improve my router, but I don't think that support for just another javascript router is valuable.

## Basic usage

Usage of this router is very simple. Just define a route something like this:

```js
router.route('/home', function () {
    //do some awesome stuff!
});
```

It also supports wildcard parameters:

```js
router.route('/article/:name', function (context) {
    console.log(context.params.name);
});
```

To define situation, when none of routes are requested, do this:

```js
router.route(function (context) {
    alert('Not found!');
});
```

Use `*` character to tell that it doesn't matter what will be there instead of
this:

```js
router.route('/search/*', function (context) {
    // This will match e.g. '/search/best' or '/search/library' routes
});
```

You can define special routes (used for faking of HTTP statuses):

```js
router.route('/user/:id', function (ctx) {
    if (ctx.params.id !== '3') {
        router.go('@401', ctx);
    }
});

router.route('@401', function () {
    console.log('Unauthorized request');
});
```

In the example above, you can see method for navigating to the specified url. It
is called `go()`:

```js
router.go('/user/2');
```

You can also pass the context if you are navigating to a special route:

```js
router.route('/user/:id', function (ctx) {
    if (ctx.params.id !== '3') {
        router.go('@401', ctx); //special routes don't change the URL
    }
});
```

Set base path of the routing (this will affect only HTML5 mode):

```js
router.base('path/to/my/project/folder');
```

## Roadmap

- Add some documentation (comments in the code, API summary, ...)
- During initialization, tranform hashbang-like URl to HTML5 mode, if it is supported
- Add possibility of defining wildcards like this: '/page:number' -> params.number
- Fake support of state and title (as they are defined in HTML5 History APIú in hashbang URLs

## License

Copyright (c) 2013 Petr Nevyhoštěný

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.