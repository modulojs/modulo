![](www-src/img/mono_logo_percent_only.png)

# Modulo

- Get started in NPM with `npm init modulo`

- Full getting started guide on Modulo's website: <https://modulojs.org/start.html>

----

# About

**A concise JavaScript Component framework**

- [X] A single file with fewer than 2000 lines as a thin layer over vanilla
  Custom Web Components
- [X] Components system inspired by React, Svelte, and Polymer
- [X] Modular with opinionated defaults and few assumptions
- [X] A "no fuss" drop-in to add JS to existing web apps

- **Status**: `alpha` *(use it if you don't mind large bugs or incomplete docs
  if you stray too far beyond the examples)*


-----

# Quick start

Modulo is a small framework for creating custom Web Components: Reusable
snippets of HTML, CSS, and JavaScript that create new HTML-like tags that can
be used and reused anywhere on your site. Under the hood, it uses a widely
compatible subset of the [customElements API](https://caniuse.com/custom-elementsv1).

Modulo runs entirely in the browser, and can be incorporated with just a couple
lines of code into any HTML file, **no terminal usage or `npm` necessary**. If,
however, you do want to use NPM, read the "Modulo SSG" section below. However,
the standard way to get started writing custom components requires just 3 steps:


1. Include in any HTML file the single Modulo JavaScript file loaded from a CDN:

```html
<script src="https://unpkg.com/mdu.js"></script>
```


2. Now define one or more Modulo web components (custom HTML elements).  First,
use `<template Modulo>` and `</template>` to mark where in your HTML you are
defining our components.  Then, add "Template", "Script", and "Style" tags, to
incorporate HTML, JavaScript, and CSS respectively into your component. E.g.:

```html
<template Modulo>
    <Component name="HelloWorld">
        <Template>
            Hello <strong>Modulo</strong> World!
        </Template>
        <Script>
            console.log('Hello Modulo JS world!');
        </Script>
        <Style>
            strong { color: purple; }
        </Style>
    </Component>
</template>
<script src="https://unpkg.com/mdu.js"></script>
```

3. Now, you can use and reuse this new custom element wherever you want, just
like any normal HTML tag. E.g.:

```html
<x-HelloWorld></x-HelloWorld>
<p>In a P tag: <x-HelloWorld></x-HelloWorld></p>
```


* *(Optional)* Download
  [src/Modulo.js](https://github.com/modulojs/modulo/blob/main/src/Modulo.js)
  (the single file that contains all of Modulo) to wherever you put JS files
  for your website (for example, `/static/js/Modulo.js`)


* **Continue?** Want to try more? The official beginner tutorial picks up where
  this leaves off:
  [Ramping Up with Modulo - Part 1](https://modulojs.org/tutorial/ramping-up-1.html#)

-----

### Modulo SSG

If you prefer using command-line scaffolding tools (e.g., just like `npx
create-react-app`), or want to use Modulo for a SSG or [JAMStack-style
app](https://jamstack.org/), Modulo has experimental support for this as well.
This is experimental because of poor documentation, and an API that is likely
to change in the future; however, it's already useful for small projects (it
was used to make [modulojs.org](https://modulojs.org)).

Generate a 3-page sample app by running `create-modulo` as such:

```bash
npm init modulo
```

Once created, use `npm start` to run a development server, and `npm run build`
to SSG and/or server-side render the static site. Note that some version of
`puppeteer` must be installed and configured for the server-side renderer to
work.

The server-side rendered version of the site has CSS and JavaScript bundled
into a single file, and will "hydrate" upon page load, meaning adding
JavaScript functionality and behavior on top of the "frozen" initial status of
the HTML, for a very fast load-time. It follows the same behavior as the output
of the Modulo `bundle` browser console command.

-----

## License

(C) 2023 - Michael Bethencourt

[LGPL-2.1](https://github.com/modulojs/modulo/blob/main/LICENSE)

