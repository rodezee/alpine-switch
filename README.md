
# ➤ Template Switch

A tiny, zero-dependency, **Stateful SPA Router** for the modern web. Built for **instantaneous transitions** and **persistent state** by treating every unique URL as a living DOM instance.

----------

## 🚀 Quick Start

The fastest way to use **Template Switch** is via the [esm.sh](https://esm.sh) CDN.

```html
<script type="module" src="https://esm.sh/gh/rodezee/template-switch"></script>

```

----------

## ✨ Key Features

-   **Zero Latency:** Routes are rendered into the DOM once and toggled via `display: block`. Switching is as fast as a CSS change.
    
-   **State Persistence:** Because DOM nodes aren't destroyed when you navigate away, scroll positions, form inputs, and JS variables stay exactly where you left them.
    
-   **Built-in Transitions:** Smooth, hardcoded `fadeIn` animations for every page change—no extra CSS required.
    
-   **Dynamic "Instance" Routing:** Navigating to `/user/1` and `/user/2` creates two distinct, persistent sections.

-   **Supports URL Variables:** Turns `/hello/:name` into `%{ name }%` [example](https://template-switch.netlify.app/hello/YourName)
    
-   **Zero Dependencies:** No React, no Vue, no build tools. Just standard Web Components.

-   **Plays Well With Small Frameworks:** Small Frameworks like PetiteVue and AlpineJS love this switch [todo-example](https://template-switch.netlify.app/todo-petite)



----------

## 🛠️ Usage

### 1. Define the Layout

Use the `ts-layout` ID. Use `%{ title }%` for the page title and `%{ content }%` where the routes should appear.

### 2. Define the Routes

Use the `ts-routes` ID. Use `%{ param }%` to inject URL variables directly into your HTML and Scripts.

```html
<template-switch>
  <template id="ts-layout">
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/counter/1">Counter 1</a>
        <a href="/counter/42">Counter 42</a>
      </nav>
      <h1>%{ title }%</h1>
    </header>
    <main>%{ content }%</main>
  </template>

  <template id="ts-routes">
    <template path="/" title="Welcome">
      <p>Home page, loaded instantly.</p>
    </template>

    <template path="/counter/:start" title="Counter">
      <article>
        <p>Count: <strong id="val-%{start}%">%{start}%</strong></p>
        <button id="inc-%{start}%">Increment</button>
      </article>

      <script>
        (() => {
          // Variables are hardcoded into the script on instantiation!
          let count = parseInt("%{start}%");
          const btn = document.getElementById('inc-%{start}%');
          const display = document.getElementById('val-%{start}%');
          
          btn.onclick = () => display.textContent = ++count;
        })();
      </script>
    </template>
  </template>
</template-switch>

```

----------

## 🧠 How it Works: The "Instance Stack"

Unlike traditional routers that wipe the page clean, **Template Switch** manages a stack of unique instances:

1.  **The Blueprint:** It stores your `<template>` tags as blueprints.
    
2.  **The Instance:** When you visit `/user/alice`, it clones the blueprint, interpolates the data (`%{name}%` → `alice`), and appends it to the DOM.
    
3.  **The Toggle:** When you visit `/user/bob`, it hides "alice" and creates a new "bob" instance.
    
4.  **The Memory:** If you go back to `/user/alice`, the router simply unhides the original instance. Any changes you made (like typing in an input) are still there.
    

----------

## 💡 Advanced Advice

### Avoiding ID Collisions

Since multiple instances (like `/counter/1` and `/counter/2`) live in the DOM simultaneously, `document.getElementById('btn')` will always find the **first** one created.

**Solution:** Use the `%{param}%` syntax to give your IDs unique names, as shown in the usage example: `id="btn-%{start}%"`

### Scoped Scripting

Always wrap your scripts in an **IIFE** (Immediately Invoked Function Expression). This prevents variables from leaking into the global scope and clashing with other routes.

```javascript
<script>
  (() => {
    const localData = "Safe and sound";
  })();
</script>

```

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
Simply include a file in the root of your repository, named:
netlify.toml
```
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

```

----------

## 📜 License

MIT © [rodezee](https://github.com/rodezee/template-switch)

# alpine-switch
