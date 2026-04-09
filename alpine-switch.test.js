import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/dom';
// Mock Alpine if not running in a real browser env, 
// but usually, we just import the script.

describe('Alpine Switch Router', () => {
  beforeEach(() => {
    // Reset DOM and History for every test
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
    // Manually trigger the alpine-switch logic or re-import
    window.location.pathname = '/';
  });

  it('initializes and renders the home route', async () => {
    // Wait for Alpine to init and router to match
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
    // Simulate clicking a link or calling the store directly
    Alpine.store('router').go('/user/john');

    await waitFor(() => {
      expect(window.location.pathname).toBe('/user/john');
      const userSection = document.getElementById('user');
      expect(userSection).not.toBeNull();
      expect(userSection.textContent).toContain('User: john');
    });
  });

  it('renders a 404 fallback when no route matches', async () => {
    Alpine.store('router').go('/does-not-exist');

    await waitFor(() => {
      const fallback = document.getElementById('alpine-router-default-404');
      expect(fallback).not.toBeNull();
      expect(fallback.innerHTML).toContain('404');
    });
  });

  it('cleans up the previous route when navigating away', async () => {
    // Start at home
    expect(document.getElementById('home')).not.toBeNull();
    
    // Go to user
    Alpine.store('router').go('/user/jane');
    
    await waitFor(() => {
      // Home should be removed from DOM (immediate removal logic)
      expect(document.getElementById('home')).toBeNull();
      expect(document.getElementById('user')).not.toBeNull();
    });
  });
});
