interface Route {
  path: string;
  tagName: string;
  onBeforeEnter?: () => boolean | Promise<boolean> | undefined;
}

export class Router {
  private static instance: Router;

  public static getInstance(): Router {
    if (!this.instance) {
      console.error('you should initialize');
    }
    return this.instance;
  }
  private routes: Route[] = [];
  private rootElement: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    if (Router.instance) {
      return Router.instance;
    }
    Router.instance = this;

    // Listen to browser Back/Forward navigation (popstate)
    globalThis.addEventListener('popstate', () => this.handleRoute());

    // Intercept clicks on links marked with [data-link]
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor || !anchor.dataset?.link) return;

      event.preventDefault();
      const href = anchor.getAttribute('href');
      if (!href) return;

      this.navigateTo(href);
    });
  }

  public addRoute(
    path: string,
    tagName: string,
    onBeforeEnter?: () => boolean | Promise<boolean> | undefined
  ): void {
    const route: Route = { path, tagName };
    if (onBeforeEnter) route.onBeforeEnter = onBeforeEnter;
    this.routes.push(route);
  }

  public navigateTo(url: string, shouldReplace: boolean = false): void {
    if (shouldReplace) {
      history.replaceState(undefined, '', url);
    } else {
      history.pushState(undefined, '', url);
    }
    this.handleRoute();
  }

  // Helper to update specific query parameters without changing the base path
  public updateQueryParam(
    key: string,
    value: string | undefined,
    shouldReplace: boolean = false
  ): void {
    const url = new URL(globalThis.location.href);
    if (value === null || value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    this.navigateTo(url.pathname + url.search, shouldReplace);
  }

  public async handleRoute(): Promise<void> {
    const pathname = globalThis.location.pathname.toLowerCase();
    const normalizedPath = pathname === '/home' ? '/' : pathname;

    // Match route ignoring query parameters
    const matchedRoute = this.routes.find(
      (route) => route.path === normalizedPath || route.path === pathname
    );

    if (matchedRoute && matchedRoute.onBeforeEnter) {
      const canEnter = await matchedRoute.onBeforeEnter();
      if (canEnter === false) return;
    }

    const tagName = matchedRoute ? matchedRoute.tagName : 'not-found-view';

    // Only re-create the main view element if the path actually changed
    const currentChild = this.rootElement.firstElementChild;
    if (
      !currentChild ||
      currentChild.tagName.toLowerCase() !== tagName.toLowerCase()
    ) {
      this.rootElement.replaceChildren();
      const pageElement = document.createElement(tagName);
      this.rootElement.append(pageElement);
    }

    // Broadcast state change so modals, filters, and pagination can sync with query params
    globalThis.dispatchEvent(
      new CustomEvent('app-state-change', {
        detail: {
          path: normalizedPath,
          searchParams: new URLSearchParams(globalThis.location.search),
        },
      })
    );
  }
}
