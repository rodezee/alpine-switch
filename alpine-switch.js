document.addEventListener('alpine:init', () => {
    Alpine.store('router', {
        path: window.location.pathname,
        title: '',
        routes: new Set(),
        notFound: false,
        init() {
            window.addEventListener('popstate', () => this.update());
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
            const hasMatch = Array.from(this.routes).some(route => {
                const regex = new RegExp(`^${route.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`);
                return this.path.match(regex);
            });
            this.notFound = !hasMatch;
            this.handleDefault404();
        },
        handleDefault404() {
            const custom404Template = document.querySelector('[x-route="*"]');
            let fallbackEl = document.getElementById('alpine-router-default-404');
            if (this.notFound && !custom404Template) {
                if (!fallbackEl) {
                    fallbackEl = document.createElement('section');
                    fallbackEl.id = 'alpine-router-default-404';
                    fallbackEl.innerHTML = `<div style="text-align: center; padding: 2rem;"><h1>404</h1><p>Oops! Page not found.</p><a href="/">Return Home</a></div>`;
                    const container = document.querySelector('main') || document.body;
                    container.appendChild(fallbackEl);
                }
                this.title = "Page Not Found";
            } else if (fallbackEl) { fallbackEl.remove(); }
        }
    });

    window.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || !link.getAttribute('href')?.startsWith('/') || link.target === '_blank') return;
        e.preventDefault();
        Alpine.store('router').go(link.getAttribute('href'));
    });

    Alpine.directive('route', (el, {}, { effect, cleanup }) => {
        const pathPattern = el.getAttribute('x-route');
        const routeTitle = el.getAttribute('x-title') || "";
        const hasTransition = el.hasAttribute('x-transition');
        
        if (pathPattern !== '*') Alpine.store('router').routes.add(pathPattern);

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

                // 1. Clone the template
                const clone = el.content.firstElementChild.cloneNode(true);
                renderedElement = clone;

                // 2. Prepare reactive data + visibility state
                renderedElement._x_route_data = Alpine.reactive({ 
                    ...match.groups,
                    _shown: !hasTransition // If no transition, show immediately
                });

                // 3. If transitioning, bind x-show to our internal _shown variable
                if (hasTransition) {
                    renderedElement.setAttribute('x-show', '_shown');
                    // Copy transition settings from template to the clone
                    if (el.getAttribute('x-transition') === '') {
                        renderedElement.setAttribute('x-transition', '');
                    }
                }

                Alpine.addScopeToNode(renderedElement, renderedElement._x_route_data);
                el.after(renderedElement);
                Alpine.initTree(renderedElement);

                // 4. Trigger the entrance transition
                if (hasTransition) {
                    requestAnimationFrame(() => {
                        renderedElement._x_route_data._shown = true;
                    });
                }
            } else {
                if (renderedElement) {
                    if (hasTransition) {
                        const elToRemove = renderedElement;
                        renderedElement = null; 
                        // Trigger exit transition
                        elToRemove._x_route_data._shown = false;
                        // Wait for transition to finish before removal
                        // 400ms is a safe default for Alpine transitions
                        setTimeout(() => elToRemove.remove(), 400);
                    } else {
                        renderedElement.remove();
                        renderedElement = null;
                    }
                }
            }
        });

        cleanup(() => renderedElement && renderedElement.remove());
    });
});
