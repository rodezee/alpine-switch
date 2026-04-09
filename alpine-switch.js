document.addEventListener('alpine:init', () => {
    // 1. The Central Store
    Alpine.store('router', {
        path: window.location.pathname,
        init() {
            window.addEventListener('popstate', () => {
                this.path = window.location.pathname;
            });
        },
        go(path) {
            if (this.path !== path) {
                history.pushState(null, '', path);
                this.path = window.location.pathname;
            }
        }
    });

    // 2. The x-link directive
    Alpine.directive('link', (el) => {
        el.addEventListener('click', (e) => {
            const href = el.getAttribute('href');
            if (href && href.startsWith('/')) {
                e.preventDefault();
                Alpine.store('router').go(href);
            }
        });
    });

    // 3. The x-route directive
    Alpine.directive('route', (el, {}, { effect, cleanup }) => {
        const pathPattern = el.getAttribute('x-route');
        let renderedElement = null;

        effect(() => {
            const currentPath = Alpine.store('router').path;
            
            // Regex logic
            const isCatchAll = pathPattern === '*';
            const regexPattern = isCatchAll ? '.*' : pathPattern.replace(/:(\w+)/g, '(?<$1>[^/]+)');
            const regex = new RegExp(`^${regexPattern}$`);
            const match = currentPath.match(regex);

            if (match) {
                const groups = match.groups || {};

                if (renderedElement) {
                    // Update the existing reactive data
                    // This triggers the x-text updates in the UI
                    Object.assign(renderedElement._x_route_data, groups);
                    return;
                }

                // First time rendering this route
                const clone = el.content.firstElementChild.cloneNode(true);
                renderedElement = clone;

                // IMPORTANT: Create a reactive proxy for the route parameters
                renderedElement._x_route_data = Alpine.reactive(groups);

                // Add this reactive scope to the node
                Alpine.addScopeToNode(renderedElement, renderedElement._x_route_data);
                
                el.after(renderedElement);
                Alpine.initTree(renderedElement);
            } else {
                // Not a match, remove the element
                if (renderedElement) {
                    renderedElement.remove();
                    renderedElement = null;
                }
            }
        });

        cleanup(() => renderedElement && renderedElement.remove());
    });
});
