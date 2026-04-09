/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/dom';
import Alpine from 'alpinejs';
import './alpine-switch.js'; 

describe('Alpine Switch Router', () => {
  beforeEach(async () => {
    // 1. Reset URL
    window.history.pushState({}, '', '/');

    // 2. Inject HTML
    document.body.innerHTML = `
      <h1 x-data x-text="$store.router.title"></h1>
      <main id="router-root">
        <template x-route="/" x-title="Home">
            <section id="home">Home Content</section>
        </template>
        <template x-route="/user/:name" x-title="User Profile">
            <section id="user">User: <span x-text="name"></span></section>
        </template>
      </main>
    `;

    // 3. Initialize Alpine once
    if (!window.AlpineInitialized) {
        window.Alpine = Alpine;
        Alpine.start();
        window.AlpineInitialized = true;
    }

    const router = Alpine.store('router');
    if (router) {
        router.routes.clear();
        // Manually find routes because directives haven't fired on the NEW HTML yet
        document.querySelectorAll('[x-route]').forEach(el => {
            const path = el.getAttribute('x-route');
            if (path && path !== '*') router.routes.add(path);
        });

        router.path = window.location.pathname;
        router.notFound = false;
        
        // 4. CRITICAL: Force Alpine to look at the NEW elements
        // This is like 're-starting' Alpine for the current body
        Alpine.initTree(document.body);
        
        router.update();
    }
  });

  it('initializes and renders the home route', async () => {
    await waitFor(() => {
      expect(document.getElementById('home')).not.toBeNull();
      // Use textContent to check if Alpine actually rendered the store title
      expect(document.querySelector('h1').textContent).toBe('Home');
    });
  });

  it('navigates to a parameterized route (/user/john)', async () => {
    // Navigate
    Alpine.store('router').go('/user/john');

    await waitFor(() => {
      // Check pathname
      expect(window.location.pathname).toBe('/user/john');
      // Check content
      const userSection = document.getElementById('user');
      expect(userSection).not.toBeNull();
      expect(userSection.textContent).toContain('john');
    });
  });

  it('cleans up the previous route when navigating away', async () => {
    // Start at Home
    Alpine.store('router').go('/');
    await waitFor(() => expect(document.getElementById('home')).not.toBeNull());

    // Go to User
    Alpine.store('router').go('/user/jane');

    await waitFor(() => {
      // Home should be gone, User should be there
      expect(document.getElementById('home')).toBeNull();
      expect(document.getElementById('user')).not.toBeNull();
    });
  });

  it('renders a 404 fallback when no route matches', async () => {
    Alpine.store('router').go('/broken-link');

    await waitFor(() => {
      const fallback = document.getElementById('alpine-router-default-404');
      expect(fallback).not.toBeNull();
      expect(fallback.textContent).toContain('404');
    });
  });
  
  it('does not re-render if navigating to the current path', async () => {
    const router = Alpine.store('router');
    router.go('/');
    await waitFor(() => expect(document.getElementById('home')).not.toBeNull());

    const initialElement = document.getElementById('home');
    
    // Attempt to go home again
    router.go('/');
    
    // The element instance should be the exact same physical node
    expect(document.getElementById('home')).toBe(initialElement);
  });
  
  it('provides route params as local scope to the rendered element', async () => {
    Alpine.store('router').go('/user/bobby');

    await waitFor(() => {
        const userEl = document.getElementById('user');
        // Check if the x-text inside the template actually resolved 'bobby'
        expect(userEl.querySelector('span').textContent).toBe('bobby');
    });
  });

  it('ignores external links and allows default browser behavior', async () => {
    const router = Alpine.store('router');
    const spy = vi.spyOn(router, 'go'); 

    const externalLink = document.createElement('a');
    externalLink.href = 'https://google.com';
    externalLink.innerText = 'External Link';
    document.body.appendChild(externalLink); // Must be in the body to bubble!

    externalLink.click();

    // Check that router.go was never touched
    expect(spy).not.toHaveBeenCalled();
    
    // Clean up
    externalLink.remove();
  });
});
