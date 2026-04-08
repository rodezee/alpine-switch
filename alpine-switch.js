// alpine-switch.js
document.addEventListener('alpine:init', () => {
    // 1. The Central Store
    Alpine.store('router', {
        path: window.location.pathname,
        params: {},
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
            e.preventDefault();
            Alpine.store('router').go(el.getAttribute('href'));
        });
    });

    // 3. The magic x-route directive
    Alpine.directive('route', (el, { expression }, { effect, cleanup }) => {
        const pathPattern = expression.replace(/['"]/g, '');
        let renderedElement = null;

        // Effect runs whenever $store.router.path changes
        effect(() => {
            const currentPath = Alpine.store('router').path;
            
            // Generate Regex from pattern (e.g., /user/:name)
            const regex = new RegExp(`^${pathPattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`);
            const match = currentPath.match(regex);

            if (match) {
                if (!renderedElement) {
                    // Create the content from the template
                    renderedElement = el.content.firstElementChild.cloneNode(true);
                    
                    // Inject the params into a fresh x-data scope automatically
                    // This is why x-text="name" will work instantly
                    Alpine.addScopeToNode(renderedElement, match.groups || {});
                    
                    el.after(renderedElement);
                    Alpine.initTree(renderedElement);
                } else {
                    // If already rendered, just update the injected params
                    Object.assign(Alpine.mergeProxies(Alpine.getClosestScope(renderedElement)), match.groups || {});
                }
            } else {
                // If the path no longer matches, remove it
                if (renderedElement) {
                    renderedElement.remove();
                    renderedElement = null;
                }
            }
        });

        cleanup(() => renderedElement && renderedElement.remove());
    });
});
