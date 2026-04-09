/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/dom';
import Alpine from '//unpkg.com/alpinejs/alpinejs';
import './alpine-switch.js';

describe('Alpine Switch Router', () => {
  beforeEach(() => {
    // 1. Clear the DOM
    document.body.innerHTML = `
      <h1 x-data x-text="$store.router.title"></h1>
      <main>
        <template x-route="/" x-title="Home">
            <section id="home">Home Content</section>
        </template>
        <template x-route="/user/:name" x-title="User Profile">
            <section id="user">User: <span x-text="name"></span></section>
        </template>
      </main>
    `;

    // 2. Mock window.location for JSDOM 
    // JSDOM doesn't like direct assignment to window.location.pathname
    delete window.location;
    window.location = new URL('http://localhost/');

    // 3. Setup Alpine Globals
    window.Alpine = Alpine;

    // 4. Start Alpine and trigger the router's init listener
    // We do this to simulate the browser behavior
    Alpine.start();
    document.dispatchEvent(new CustomEvent('alpine:init'));
  });

  it('initializes and renders the home route', async () => {
    await waitFor(() => {
      expect(document.getElementById('home')).not.toBeNull();
      expect(document.title).toBe('Home');
    });
  });

  it('updates the title store correctly', async () => {
    await waitFor(() => {
      const h1 = document.querySelector('h1');
      expect(h1.textContent).toBe('Home');
    });
  });

  it('navigates to a parameterized route (/user/john)', async () => {
    // We call the store directly
    Alpine.store('router').go('/user/john');

    await waitFor(() => {
      expect(window.location.pathname).toBe('/user/john');
      const userSection = document.getElementById('user');
      expect(userSection).not.toBeNull();
      // Use toContain because of possible whitespace in the template
      expect(userSection.textContent).toContain('john');
    });
  });

  it('renders a 404 fallback when no route matches', async () => {
    Alpine.store('router').go('/does-not-exist');

    await waitFor(() => {
      const fallback = document.getElementById('alpine-router-default-404');
      expect(fallback).not.toBeNull();
      expect(fallback.textContent).toContain('404');
    });
  });

  it('cleans up the previous route when navigating away', async () => {
    // Navigate initially to home
    Alpine.store('router').go('/');
    await waitFor(() => expect(document.getElementById('home')).not.toBeNull());

    // Switch to user
    Alpine.store('router').go('/user/jane');

    await waitFor(() => {
      // Home should be removed instantly based on your updated "remove()" logic
      expect(document.getElementById('home')).toBeNull();
      expect(document.getElementById('user')).not.toBeNull();
    });
  });
});
