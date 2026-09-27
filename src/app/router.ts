type RouteHandler = () => void;

interface Route {
  path: string;
  tagName: string;
  onBeforeEnter?: () => boolean | Promise<boolean> | undefined;
}

export class Router {
  private routes: Route[] = [];
  private rootElement: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;

    globalThis.addEventListener('hashchange', () => this.handleRoute());

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.hasAttribute('data-link')) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          const cleanPath = href.startsWith('#') ? href.slice(1) : href;
          this.navigateTo(cleanPath);
        }
      }
    });
  }

  public addRoute(
    path: string,
    tagName: string,
    onBeforeEnter?: () => boolean | Promise<boolean> | undefined
  ): void {
    // Construct the route object conditionally to satisfy exactOptionalPropertyTypes
    const route: Route = { path, tagName };
    if (onBeforeEnter) {
      route.onBeforeEnter = onBeforeEnter;
    }
    this.routes.push(route);
  }

  public navigateTo(path: string): void {
    const hashPath = path.startsWith('#') ? path : `#${path}`;
    globalThis.location.hash = hashPath;
  }

  public async handleRoute(): Promise<void> {
    const hash = globalThis.location.hash;
    const currentPath = hash ? hash.replace('#', '') : '/';

    const matchedRoute = this.routes.find(
      (route) => route.path === currentPath
    );

    if (matchedRoute && matchedRoute.onBeforeEnter) {
      const canEnter = await matchedRoute.onBeforeEnter();
      if (canEnter === false) return;
    }

    const tagName = matchedRoute ? matchedRoute.tagName : 'not-found-view';

    this.rootElement.innerHTML = '';
    const pageElement = document.createElement(tagName);
    this.rootElement.appendChild(pageElement);
  }
}
