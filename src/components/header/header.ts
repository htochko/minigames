import styles from './header.scss';

export class Header extends HTMLElement {
  constructor() {
    super();
    // Attach a Shadow DOM root (mode: 'open' allows inspection if needed)
    const shadow = this.attachShadow({ mode: 'open' });

    // Create container and scoped styles
    const headerElement = document.createElement('header');
    headerElement.innerHTML = `
      <style>${styles}</style>
      <header class="header-container">
        <a href="#" class="logo">MiniGames</a>
        <nav>
          <a href="#">Home</a>
          <a href="#library">Library</a>
          <a href="#tournaments">Tournaments</a>
          <a href="#community">Community</a> 
          <a href="#" class="btn-primary">Login</a>
          <a href="#" class="btn-primary">Sign up</a>
        </nav>
      </header>
    `;

    shadow.append(headerElement);
  }
}

export function registerHeader(tagName = 'header-template'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, Header);
  }
}
