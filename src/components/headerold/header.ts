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
      
    `;

    shadow.append(headerElement);
  }
}

export function registerHeader(tagName = 'header-template'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, Header);
  }
}
