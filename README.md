# Slm-neo

Slm-neo is a modern template language for JavaScript (Node.js/Deno). It is a port of [Slim](http://slim-lang.com/) but slimmer :)

[**🚀 Try it in the Online Playground!**](https://colus-img.github.io/slm-neo/)

### Features

- **Async/Await Support**: Native support for `await` within templates.
- **Modern JavaScript**: ESM-first, ES6+ standards.
- **Cross-platform**: Works seamlessly on both Node.js and Deno.
- **Elegant syntax**: Short syntax without closing tags using indentation for nesting.
- **Safety**: Automatic HTML escaping by default.
- **Performance**: High performance with minimal dependencies.

### How to start?

Install Slm-neo directly from GitHub:

```bash
npm install colus-img/slm-neo
```

Or use it in Deno:

```javascript
import slm from "https://raw.githubusercontent.com/colus-img/slm-neo/main/lib/slm.js";
```

### Usage with Async/Await

Slm-neo supports native `async/await` within templates. Use `renderAsync` to execute asynchronously.

```javascript
import slm from 'slm-neo';

const src = 'p = await this.fetchData()';
const model = {
  fetchData: async () => 'Async Content'
};

// Using renderAsync
const html = await slm.renderAsync(src, model);

// Using compileAsync
const template = slm.compileAsync(src);
const html2 = await template(model);

console.log(html); // <p>Async Content</p>
```

Note: The standard `render` (and `compile`) methods are still available for traditional synchronous rendering, provided the template does not contain `await`.

### API Options

The `render`, `renderAsync`, `compile`, and `compileAsync` methods take an optional `options` object as their third argument.

| Option | Description |
| :--- | :--- |
| **`filename`** | The name of the template file. Used for error reporting and resolving relative paths (like `partial` or `extend`). |
| **`basePath`** | The root directory for resolving templates. Highly recommended when using `partial` or `extend`. |
| **`useCache`** | Set to `false` to disable the internal compilation cache. (Default: `true`) |
| **`attrDelims`** | Customize attribute delimiters. Default: `{ '(': ')', '[': ']' }` |
| **`mergeAttrs`** | Define how attributes are merged. Default: `{ class: ' ' }` |
| **`format`** | Output format: `xhtml` (default) or `html`. In `html` mode, void elements are not self-closed with ` /`. |
| **`require`** | Provide a custom `require` function (via `createRequire`) to load Node.js/local modules within templates. Useful in ESM/Deno environments. |

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

### Differences from Ruby Slim

If you are already familiar with [Ruby Slim](http://slim-lang.com/), here are the key differences in Slm-neo:

- **JavaScript-based Logic**: Use JavaScript for control flow and expressions.
  - `- if (this.items.length)` instead of `- if items.any?`
  - `- for (let item of this.items)` instead of `- for item in items`
- **Model Context (`this`)**: All data passed to the template is bound to the `this` context.
- **ES6-style Interpolation**: Use `${this.var}` instead of `#{var}`.
  - `${this.var}`: HTML-escaped output.
  - `${=this.var}`: Unescaped (raw) output.
- **Native Async/Await**: You can call and `await` asynchronous functions directly within templates.
  - `p = await this.db.fetchData()`
  - `- if (await this.checkPermission()) ...`
- **Built-in Helpers**: Use `partial('name')` instead of `render 'name'`, and `content()` instead of `yield`.
- **No Built-in Pretty Print**: Slm-neo focuses on rendering speed and keeping the core engine **slim and minimal**. It does not include a built-in HTML formatter (pretty-print). If you need formatted HTML output, please use an external library like [Prettier](https://prettier.io/) or [html-beautifier](https://www.npmjs.com/package/html-beautifier) after rendering.

## Syntax Reference

Slm-neo inherits the core syntax from [Slim](http://slim-lang.com/), including indentation-based nesting, tag shortcuts (`#`, `.`), and line indicators (`|`, `-`, `=`, `==`).

### JavaScript Expressions

All logic and expressions are written in JavaScript. Reference model data via the `this` context.

#### Output and Interpolation
- `${this.name}`: HTML-escaped output.
- `${=this.rawHtml}`: Unescaped (raw) output.
- `p = this.message`: Escaped output (same as `${...}`).
- `p == this.raw`: Unescaped output (same as `${=...}`).

#### Control Flow
Blocks are defined by indentation. JavaScript syntax is supported natively.

```slim
- if (this.isAdmin)
  p Welcome, Admin!
- else if (this.user)
  p Welcome, ${this.user.name}
- else
  p Please log in.

- for (let item of this.items)
  li = item.name
```

#### Attributes
- `a href=this.url`: Simple JS expressions.
- `div(class=this.active ? "on" : "off")`: Use parentheses for complex expressions.
- `input(type="checkbox" checked=this.isChecked)`: Boolean logic (supports `true`/`false`/`null`/`undefined`).
- `a class=["btn", "btn-primary"]`: Arrays are automatically merged with spaces.

#### Native Async/Await
You can use `await` directly in your templates. This requires using `renderAsync()` or `compileAsync()`.

```slim
h1 = await this.getTitle()
- for (let post of await this.fetchPosts())
  article
    h2 = post.title
    p = await post.getContent()
```

### Layouts

Slm-neo supports layout inheritance via the `- extend()` command. This separates the common structure from the page-specific content.

layout.slm
```slim
doctype html
html
  body
    header: h1 My Site
    main
      / Main content (yield)
      == content()
```

index.slm
```slim
- extend('layout')

h2 Welcome to the page!
p This content will be inserted into the layout's content() block.
```

- `== content()`: In a layout file, this outputs the main template's content (similar to Ruby's `yield`).
- `== content('sidebar')`: Outputs a named block.

#### Partials

Use `partial` to render external sub-templates.

##### Basic Usage
```slim
/ Renders 'header.slm' with the current context
== partial('header')

/ Renders 'item.slm' with a custom model
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

##### Reusable Blocks (Mixins)

Mixins are used to define reusable blocks **within the same template**.

```slim
/ Define a mixin once
= mixin('userCard', 'user')
  .card
    h3 = this.user.name
    p = this.user.email

/ Use it multiple times in your template
= mixin('userCard', this.currentUser)
- for (let friend of this.friends)
  = mixin('userCard', friend)
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
  const html = Slm.render('h1 Hello ${this.name}', {name: 'World'});
</script>
```

### `slm-vm-browser.js` (Runtime Only)
Includes only the **Runtime (VM)**. It is much smaller and faster but cannot compile templates. This is the recommended build for production as it avoids shipping the compiler to the user and is more secure (no `eval` for parsing).

#### Pre-compiling Templates
On your server or during build time, you can convert your templates into JavaScript code using `slm.template.src()`.

```javascript
// Build script (Node.js/Deno)
const compiledSrc = slm.template.src('h1 Hello ${this.name}');
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

# License

Slm-neo is released under the [MIT license](http://www.opensource.org/licenses/MIT).

# Acknowledgments

This project is a modernized fork of the original [slm](https://github.com/slm-lang/slm) created by [slm-lang](https://github.com/slm-lang) team. We deeply appreciate their work in establishing the foundation of this elegant templating engine.

### Special Thanks

- **Yury Korolev** (https://github.com/yury), for the original [slm](https://github.com/slm-lang/slm)
- **AnjLab** (http://anjlab.com), for a great original [slm-lang](https://github.com/slm-lang) team
- **ngsctt** (https://github.com/ngsctt), for [slm-mod](https://github.com/ngsctt/slm-mod) and inspiring the modernization of the Slm engine

- **Andrew Stone** (https://github.com/stonean), for [Slim](https://github.com/slim-template/slim)
- **Magnus Holm** (https://github.com/judofyr), for [Temple](https://github.com/judofyr/temple)
- **Daniel Mendler** (https://github.com/minad), for maintenance of both
- **John Firebaugh** (https://github.com/jfirebaugh), for [Skim](https://github.com/jfirebaugh/skim)
