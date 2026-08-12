# Slm-neo

Slm-neo is a modern template language for JavaScript (Node.js/Deno). It is a port of [Slim](http://slim-lang.com/) but slimmer :)

[**🚀 Try it in the Online Playground!**](https://colus-img.github.io/slm-neo/)

[English](README.md) | [日本語](README.ja.md)

## Features

- **Async/Await Support**: Native support for `await` within templates.
- **Modern JavaScript**: ESM-first, ES6+ standards.
- **Cross-platform**: Works seamlessly on both Node.js and Deno.
- **Elegant syntax**: Indentation-based nesting, derived from Ruby Slim, for concise syntax without closing tags.
- **Helper Pipeline Syntax**: Effortless function application via Slm-neo's unique pipeline notation.
- **Safety**: Automatic HTML escaping by default.
- **Performance**: High performance with minimal dependencies.

## Usage

Install Slm-neo directly from GitHub:

```bash
npm install colus-img/slm-neo
```

For Deno:

```javascript
import slm from "https://raw.githubusercontent.com/colus-img/slm-neo/main/lib/slm.js";
```

### Rendering Slm Code

When using `renderAsync` or `compileAsync`, you can use `async/await` within your templates. For cases where no asynchronous functions are used, synchronous `render` and `compile` methods are also available.

```javascript
import slm from 'slm-neo';

const src = 'p = await fetchData()'; // Render this Slm code
const model = {
  fetchData: async () => 'Async Content'
};

// Using renderAsync
const html = await slm.renderAsync(src, model, options);

console.log(html); // <p>Async Content</p>
 
// Using compileAsync (for template reuse)
const template = await slm.compileAsync(src, options);
const html2 = await template(model);
 
console.log(html2); // <p>Async Content</p>
```

#### model
The argument of `renderAsync`/`render` passes the data used in the template. Data can be accessed directly by name. Additionally, helper functions registered in an object specified by the `helpersName` option can also be accessed directly by name.

Example usage:

```javascript
const model = {
  page: {
    title: "hello"
  },
  helpers: {
    upper: (v) => v.toUpperCase()
  }
};
const html = await slm.renderAsync(src, model, options);
```
```slim
p = upper(page.title)
/ → <p>HELLO</p>
```

#### options

You can pass an options object as an argument to `renderAsync`/`render`.

| Option | Description |
| :--- | :--- |
| **`filename`** | The name of the template file. Used for error reporting and resolving relative paths (like `partial` or `extend`). |
| **`basePath`** | The root directory for resolving templates. Highly recommended when using `partial` or `extend`. |
| **`useCache`** | Set to `false` to disable the internal compilation cache. (Default: `true`) |
| **`attrDelims`** | Customize attribute delimiters. Default: `{ '(': ')', '[': ']' }` |
| **`mergeAttrs`** | Define how attributes are merged. Default: `{ class: ' ' }` |
| **`format`** | Output format: `xhtml` (default) or `html`. In `html` mode, void elements are not self-closed with `/`. |
| **`autoDestructuring`** | Automatically destructure top-level data variables, enabling you to omit the `this.` prefix. (Default: `true`) |
| **`destructuringExclude`** | Array of string identifier names to explicitly exclude from auto-destructuring. |
| **`helpersName`** | The name of the object containing helper functions within the model. Default is `helpers`. Auto-destructuring allows access without the prefix. |
| **`contentName`** | The name of the content property within the model. Default is `content`. When not using layout functions (`extend()`), it can be accessed via `content()`. |
| **`require`** | A custom `require` function to load modules within templates. Available in ESM/Deno environments. |

Example: with options

```javascript
const options = {
  basePath: './views',
  filename: 'index.slm',
  useCache: process.env.NODE_ENV === 'production',
  format: 'html'
};

const html = await slm.renderAsync(src, model, options);
```

Example: Using custom `require` for helpers

```javascript
import { createRequire } from 'node:module';
const customRequire = createRequire(import.meta.url);

const html = await slm.renderAsync(src, model, { require: customRequire });

// Inside your .slm template:
// - const os = require('node:os')
// p Platform: ${os.platform()}
```

### Configure to work with ExpressJS

```javascript
import express from 'express';
import slm from 'slm-neo';

const app = express();

app.set('views', './views');
app.set('view engine', 'slm');
app.engine('slm', slm.__express);
```

## Differences from Ruby Slim

If you already know [Ruby Slim](http://slim-lang.com/), here are the key differences in Slm-neo:

- **JavaScript-based Logic**: Use JavaScript for control flow and expressions.
  - `- if items.length` (instead of Ruby's `- if items.any?`)
  - `- for item of items` (instead of Ruby's `- for item in items`)
- **Native Async/Await**: `async/await` is natively supported.
	- `p = await db.fetchData()`
	- `- if await checkPermission() ...`
- **ES6-style Interpolation**: Use `${var}` instead of `#{var}`.
	- `${var}`: HTML-escaped output.
	- `${=var}`: Unescaped (raw) output.
- **Pipeline Syntax**: Use `|` within `${}` for intuitive function chaining.
	- `p Hello ${ name | upper }`
- **Layouts**: Use `partial('name')` instead of `render 'name'`, and `content()` instead of `yield`.
- **No Built-in Pretty Print**: Slm-neo focuses on speed and simplicity. It does not include an HTML formatter. Use external tools like [Prettier](https://prettier.io/) if you need formatted HTML.

## Syntax Reference

Slm-neo inherits core syntax from [Slim](http://slim-lang.com/), including indentation-based nesting, tag shortcuts (`#`, `.`), and line indicators (`|`, `-`, `=`, `==`).

### JavaScript Expressions

All logic and expressions are written in JavaScript. Also, you can write more concisely using slm's unique notation.

#### Auto-destructuring

By default, slm-neo automatically destructures the top-level properties of `this` at the start of the rendering function. This allows you to access properties directly without the `this.` prefix.

> **Note**: Auto-destructuring evaluates top-level properties of `this` at the start of the rendering function. For dynamic getters or properties whose values change during the rendering cycle, place them in a nested object or use the `this.` prefix explicitly (e.g. `this.dynamicValue`).

#### Control Flow
 
Blocks are defined by indentation. JavaScript syntax is supported natively. Parentheses `()` for keywords like `if`, `else if`, `for`, `while`, `switch`, and `catch` can be omitted.
 
```slim
- if isAdmin
	p Welcome, Admin!
- else if user
	p Welcome, ${user.name}
- else
	p Please log in.
 
- for item of items
	li = item.name
```
 
#### Output and Interpolation
 
`=` and `==`: JavaScript output lines
 
- `p = user.name`: Escaped output.
- `p == raw`: Unescaped (raw) output.
 
`${}`: Text interpolation
 
- `${title}`: HTML-escaped interpolation.
- `${=rawHtml}`: Unescaped (raw) interpolation.

#### Attributes
 
- `a href=target.url`: Simple JS expressions.
- `a(href=url)`: Parentheses can be used to group attributes like Pug.
- `div class=(active ? "on" : "off")`: Parentheses are required for expressions containing spaces.
- `div class="${active ? 'on' : 'off'}"`: Interpolation is also supported.
- `input type="checkbox" checked=true`: Boolean logic support (`true`/`false`/`null`/`undefined`).
- `a class=["btn", "btn-primary"]`: Arrays are automatically space-merged.

#### Helper Pipeline Syntax
 
Supports chaining via `|` inside `${ ... }` interpolation blocks.
 
**Auto Async Support**: Pipelines automatically handle `await` for each step when using `renderAsync`.
 
```slim
p ${title | upper}
/ → <p>upper(title)</p>
 
p class="${ size, 'btn-' | prefix }"
/ → <p class="prefix(size, 'btn-')"></p>
 
${ message | upper | getPostTitle("x", "y") }
/ → await getPostTitle(upper(message), "x", "y")
/ Works even if `getPostTitle` is an async function without explicit `await`.
```

### Layouts
 
Layout functionality allows you to separate the site's common structure from page-specific content.
- `- extend('layout')`: Specifies the layout file.
- `== content()`: Outputs the main template's content in the layout.
- `- content('sidebar')`: Defines a named block.
- `== content('sidebar')`: Outputs a named block.
 
layout.slm
```slim
doctype html
html
	body
		header: h1 My Site
		main
			/ Main content
			== content()
		aside
			/ Sidebar (named block)
			== content('sidebar')
```
 
index.slm
```slim
- extend('layout')
 
/ Define main content
h2 Welcome to the page!
p This content will be inserted into the layout's content() block.
 
/ Define 'sidebar' named block
- content('sidebar')
	nav
		ul
			li: a href="/" Home
			li: a href="/about" About
```

#### Partials
 
Use `partial` to render external sub-templates.
 
##### Basic Usage
 
```slim
/ Renders ./header.slm with current context
== partial('header')
 
/ Renders ./item.slm with custom model
== partial('item', {name: 'Apple', price: 100})
```
 
##### Partial with a Block
 
You can pass a block to a partial, which can then be output using `content()`.
 
```slim
== partial('container')
	p This content will be nested inside the container.
```
 
container.slm
```slim
.wrapper
	== content()
```
 
##### Mixins (Reusable Blocks)
 
Mixins are used to define reusable blocks within the same template.

```slim
/ Define mixin
= mixin('userCard', 'user')
	.card
		/ You must use the `this.` prefix to access mixin arguments
		h3 = this.user.name
		p = this.user.email
		/ You can access context variables without `this` (if auto-destructuring is enabled)
		/ When rendering with slm.render(src, {systemStatus: 'OK'}, options)
		p System Status: ${systemStatus}
 
/ Use it multiple times in your template
= mixin('userCard', currentUser)
- for (let friend of friends)
	= mixin('userCard', friend)
```

> **Note**: You must always use the `this.` prefix to access dynamically passed mixin arguments (e.g. `this.user`). However, you can access context variables outside of the mixin (e.g. `systemStatus`) directly without `this`.
 
##### Custom Block Helpers (Shortcodes)
 
When using an output block with an indented body, Slm-neo internally appends a callback function to the last argument.
slm-neo provides a `yieldBlock` function to resolve this callback synchronously or asynchronously. Executing this function returns the rendered HTML string of the indented block.
 
```slim
= mySection(title)
	p Nested block content
```
 
Helper function definition (external file)
 
```javascript
import slm from 'slm-neo';
 
export const mySection = function(title, cb) {
  // yieldBlock function
  // 1st arg: context (usually 'this')
  // 2nd arg: block from template (callback)
  // 3rd arg: function receiving block result and returning final output
  return slm.yieldBlock(this, cb, (content) => {
    // 'content' contains the rendered HTML string.
    // Sync/Async resolution is handled inside yieldBlock.
    const html = `
      <section class="custom-section">
        <h2>${slm.escape(title)}</h2>
        <div class="content">${content}</div>
      </section>
    `;
    // Wrap with slm.safe to output as HTML
    return slm.safe(html);
  });
};
```

## Browser Usage

Slm-neo provides two builds for the browser, both located in the `dist/` directory.

### Building from Source

If you want to build the browser bundles yourself, you can use either Deno or Node.js.

Using Deno (Recommended)
```bash
deno task build
```

Using Node.js
```bash
npm install
node build.js
```

### `slm-browser.js` (Full Version)
Includes the **Compiler** and the **Runtime**. Use this if you need to compile SLM strings directly in the browser.

```html
<script src="dist/slm-browser.js"></script>
<script>
  const html = Slm.render('h1 Hello ${name}', {name: 'World'});
</script>
```

### `slm-vm-browser.js` (Runtime Only)
Includes only the **Runtime (VM)**. It is much smaller and faster but cannot compile templates. This is the recommended build for production as it avoids shipping the compiler to the user and is more secure (no `eval` for parsing).

#### Pre-compiling Templates
On your server or during build time, you can convert your templates into JavaScript code using `slm.template.src()`.

```javascript
// Build script (Node.js/Deno)
const compiledSrc = slm.template.src('h1 Hello ${name}');
// Save this string to a file (e.g., templates.js)
```

#### Using Pre-compiled Templates in Browser

```html
<script src="dist/slm-vm-browser.js"></script>
<!-- templates.js contains: window.myTemplate = [function(vm){...}] -->
<script src="dist/templates.js"></script>
<script>
  const vm = new SlmVM();
  const templateFn = vm.runInContext(window.myTemplate);
  const html = templateFn({name: 'World'}, vm);
</script>
```

## License

Slm-neo is released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Acknowledgments
 
This project is a modernized fork of the original [slm](https://github.com/slm-lang/slm) created by the [slm-lang](https://github.com/slm-lang) team. We deeply appreciate their work in establishing the foundation of this elegant templating engine.
 
### Special Thanks
 
- **Yury Korolev** (https://github.com/yury), for the original [slm](https://github.com/slm-lang/slm)
- **AnjLab** (http://anjlab.com), for a great original [slm-lang](https://github.com/slm-lang) team
- **ngsctt** (https://github.com/ngsctt), for [slm-mod](https://github.com/ngsctt/slm-mod) and inspiring the modernization of the Slm engine

- **Andrew Stone** (https://github.com/stonean), for [Slim](https://github.com/slim-template/slim)
- **Magnus Holm** (https://github.com/judofyr), for [Temple](https://github.com/judofyr/temple)
- **Daniel Mendler** (https://github.com/minad), for maintenance of both
- **John Firebaugh** (https://github.com/jfirebaugh), for [Skim](https://github.com/jfirebaugh/skim)
