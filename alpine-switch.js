document.addEventListener('alpine:init', () => {
    // 1. The Central Store
    Alpine.store('router', {
        path: window.location.pathname,
        title: '',
        routes: new Set(),
        notFound: false,

        init() {
            window.addEventListener('popstate', () => this.update());
            // Small delay to ensure all x-route templates are registered
            setTimeout(() => this.update(), 0);
        },

        go(path) {
            if (this.path !== path) {
                history.pushState(null, '', path);
                this.update();
            }
        },

        update() {
            this.path = window.location.pathname;
            
            // 1. Check if the current path matches any registered route
            const hasMatch = Array.from(this.routes).some(route => {
                const regex = new RegExp(`^${route.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`);
                return this.path.match(regex);
            });

            this.notFound = !hasMatch;

            // 2. Handle the "Default" 404 (if no <template x-route="*"> exists)
            this.handleDefault404();
        },

        handleDefault404() {
            const custom404Template = document.querySelector('[x-route="*"]');
            let fallbackEl = document.getElementById('alpine-router-default-404');

            if (this.notFound && !custom404Template) {
                // If we need a 404 but the user didn't make a template, inject one
                if (!fallbackEl) {
                    fallbackEl = document.createElement('section');
                    fallbackEl.id = 'alpine-router-default-404';
                    fallbackEl.innerHTML = `
                        <div style="text-align: center; padding: 2rem;">
                            <h1>404</h1>
                            <p>Oops! This page doesn't exist.</p>
                            <a href="/">Return Home</a>
                        </div>
                    `;
                    const container = document.querySelector('main') || document.body;
                    container.appendChild(fallbackEl);
                }
                this.title = "Page Not Found";
                document.title = "404 - Not Found";
            } else if (fallbackEl) {
                // Remove the default 404 if we are back on a valid route
                fallbackEl.remove();
            }
        }
    });

    // 2. Automatic Link Interceptor
    window.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || !link.getAttribute('href')?.startsWith('/') || link.target === '_blank') return;
        e.preventDefault();
        Alpine.store('router').go(link.getAttribute('href'));
    });

    // 3. The x-route Directive
    Alpine.directive('route', (el, {}, { effect, cleanup }) => {
        const pathPattern = el.getAttribute('x-route');
        const routeTitle = el.getAttribute('x-title') || "";
        
        if (pathPattern !== '*') {
            Alpine.store('router').routes.add(pathPattern);
        }

        let renderedElement = null;

        effect(() => {
            const currentPath = Alpine.store('router').path;
            const is404Template = pathPattern === '*';
            
            let match = null;
            if (is404Template) {
                if (Alpine.store('router').notFound) match = { groups: {} };
            } else {
                const regexPattern = pathPattern.replace(/:(\w+)/g, '(?<$1>[^/]+)');
                match = currentPath.match(new RegExp(`^${regexPattern}$`));
            }

            if (match) {
                Alpine.store('router').title = routeTitle;
                if (routeTitle) document.title = routeTitle;

                if (renderedElement) {
                    Object.assign(renderedElement._x_route_data, match.groups);
                    return;
                }

                const clone = el.content.firstElementChild.cloneNode(true);
                renderedElement = clone;
                renderedElement._x_route_data = Alpine.reactive(match.groups || {});
                Alpine.addScopeToNode(renderedElement, renderedElement._x_route_data);
                el.after(renderedElement);
                Alpine.initTree(renderedElement);
            } else {
                if (renderedElement) {
                    renderedElement.remove();
                    renderedElement = null;
                }
            }
        });

        cleanup(() => {
            if (renderedElement) renderedElement.remove();
            Alpine.store('router').routes.delete(pathPattern);
        });
    });
});
