document.addEventListener('alpine:init', () => {
    // 1. The Central Store
    Alpine.store('router', {
        path: window.location.pathname,
        title: '', // Global title storage
        routes: new Set(),
        notFound: false,

        init() {
            window.addEventListener('popstate', () => this.update());
            // Small delay on first load to let templates register themselves
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
            
            // Check if any registered route matches the current path
            const hasMatch = Array.from(this.routes).some(route => {
                const regex = new RegExp(`^${route.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`);
                return this.path.match(regex);
            });

            this.notFound = !hasMatch;
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
        
        // Register the route
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
                // Update Global Title in the Store and the Tab
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
