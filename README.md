
# 🚦 Alpine Switch Router

A lightweight, declarative client-side router for **Alpine.js**. Inspired by the simplicity of "Switch" logic, this router ensures that only one route is active at a time, automatically cleaning up old components to prevent memory leaks and DOM clutter.

## ✨ Features

-   **Declarative Routing:** Define routes directly in your HTML using `<template>` tags.
    
-   **Parameterized Paths:** Easily handle dynamic routes like `/user/:id` or `/post/:slug`.
    
-   **Automatic Title Management:** Update the browser tab title automatically as you navigate.
    
-   **Memory Efficient:** Previous routes are completely unmounted and cleaned up by Alpine.js.
    
-   **Zero Dependencies:** Just you and Alpine.js.
    
-   **Built-in 404 Handling:** Fallback to a custom 404 section when no routes match.

-   **AlpineJS Transitions:** AlpineJS transitions play with the route switches.
    

----------

## 🚀 Quick Start

### 1. Installation

Include the script before Alpine.js in your project:

```html
<script defer src="//cdn.jsdelivr.net/gh/rodezee/alpine-switch/alpine-switch.js"></script>
<script defer src="//unpkg.com/alpinejs"></script>

```

### 2. Basic Setup

Define your navigation and your route templates inside a main container.

```html
<nav x-data>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/user/john">Profile</a>
</nav>

<h1 x-data x-text="$store.router.title"></h1>

<main>
  <template x-route="/" x-title="Home Page">
    <section id="home">
      <h2>Welcome Home</h2>
      <p>This is the default view.</p>
    </section>
  </template>

  <template x-route="/user/:name" x-title="User Profile" transition.duration.1000ms>
    <section id="profile">
      <h2>User Profile</h2>
      <p>Hello, <span x-text="name"></span>!</p>
    </section>
  </template>

  <template x-route="*"><!-- optinal customized 404 -->
    <section>
      <h2>404 - Not Found</h2>
      <a href="/">Back to Safety</a>
    </section>
  </template>
</main>

```

[Other Live Example](https://alpine-switch.netlify.app)

----------

## 🛠 API Reference

### Directives

Directive

Description

Example

`x-route`

Defines the path pattern to match. Use `:` for parameters.

`x-route="/post/:id"`

Makes the parameter `id` available as a variable.

`x-title`

(Optional) Sets the `document.title` and `$store.router.title` when active.

`x-title="Settings"`

Sets the variable `$store.router.title` and the title of the page.

### Global Store (`$store.router`)

The router state is globally accessible via Alpine's store.

-   **`$store.router.path`**: The current URL pathname.
    
-   **`$store.router.params`**: An object containing current route parameters (e.g., `{ name: 'john' }`).
    
-   **`$store.router.title`**: The title of the current active route.
    
-   **`$store.router.go(path)`**: Programmatically navigate to a new path.
    
----------

## 🚀 Deployment

Since this is a Single Page Application (SPA) using the `History API`, your web server must be configured to serve `index.html` for all requests that don't match a static file.

### Example for Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

```

### Example for Netlify:
Simply include a file in the root of your repository, named: `netlify.toml`
```
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

```

----------

## 🧪 Testing

This project is tested using **Vitest** and **JSDOM**. Because Alpine.js initializes asynchronously, the test suite ensures that routes are correctly registered and cleared.

To run the tests:

Bash

```
npm install
npm test

```

### Example Test Case

Our suite covers:

-   Initial render of the Home route.
    
-   Navigation to parameterized routes (extracting `:name`).
    
-   DOM cleanup (ensuring the old route is removed).
    
-   404 fallback logic.
    

----------

## 💡 Why "Switch"?

Traditional routers often hide and show elements using `display: none`. **Alpine Switch Router** physically removes the previous route from the DOM before mounting the new one. This ensures:

1.  **No ID Collisions:** Two pages can't have the same `#id` at the same time.
    
2.  **Clean State:** Alpine components on the previous page are fully destroyed, firing their `x-cleanup` hooks.
    
3.  **Performance:** The browser only has to style and paint the content you are actually looking at.

----------

## ⚖️ License

MIT © [biensurerodezee@protonmail.com]

