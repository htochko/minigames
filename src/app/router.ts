//type RouteHandler = () => void;

interface Route {
  path: string;
  tagName: string;
  onBeforeEnter?: () => boolean | Promise<boolean> | undefined; // Optional route guard
}

export class Router {
  private routes: Route[] = [];
  private rootElement: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;

    // Listen to browser back/forward navigation
    //globalThis.addEventListener('popstate', () => this.handleRoute());

    // Intercept global clicks on relative link
    // move functionality to button hanler not global click
    //document.addEventListener('click', (event: MouseEvent) => {
    //  const target = event.target as HTMLElement;
    //  console.log('check',target);
    //});
    
    const navLinks = document.querySelectorAll<HTMLAnchorElement>("a");
    navLinks.forEach((a) => {
      a.addEventListener("click", (event) => {
        event.preventDefault();
        const href = (event.target as HTMLAnchorElement).href;
        console.log(href)
        //this.go(href);
      });
    });

    // It listen for history changes
    globalThis.addEventListener("popstate", (event) => {
        console.log(event.target);
        const routeName = location.hash;
        console.log(routeName);
        if (routeName == '#') {
            this.addRoute('/', 'home-page');
        }
        if (routeName == '#library') {
            this.addRoute('/library', 'library-page');
        }
    });

    // Process initial URL
    //this.go(location.pathname);
  }

  public addRoute(path: string, tagName: string): void {
    this.routes.push({ path, tagName});
  }

  public navigateTo(path: string | null): void {
    globalThis.history.pushState({}, '', path);
    this.handleRoute();
  }

  public async handleRoute(): Promise<void> {
    const currentPath = globalThis.location.pathname;
    const matchedRoute = this.routes.find((route) => route.path === currentPath);

    // Optional route guards (e.g., authentication checks)
    if (matchedRoute && matchedRoute.onBeforeEnter) {
      const canEnter = await matchedRoute.onBeforeEnter();
      if (!canEnter) return; // Guard blocked navigation
    }

    const tagName = matchedRoute ? matchedRoute.tagName : 'not-found-view';

    // Clear previous view and render the new component
    this.rootElement.replaceChildren(``);
    const pageElement = document.createElement(tagName);
    this.rootElement.append(pageElement);
  }
}