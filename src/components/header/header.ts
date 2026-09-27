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
        <nav class="navbar">
        <input type="checkbox" id="burger-toggle" class="burger-toggle">
    <ul>
        <!-- 1. Parked to the Left -->
        <li class="logo">
            <a href="#">Minigames</a>
        </li>

        <!-- Wrapped container for links that go into the mobile burger menu -->
        <div class="nav-links-wrapper">
            <li><a href="#" data-link>Home</a></li>
            <li><a href="#library" data-link>Library</a></li>
            <li><a href="#tournaments">Tournaments</a></li>
            <li><a href="#community">Community</a></li>
            <li><a href="#login" class="btn-primary">Log in</a></li>
            <li><a href="#sugnup" class="btn-primary">Sign up</a></li>
        </div>
        <div class="nav-right-items">
            <!-- Burger Icon Label (Visible only on mobile) -->
            <li class="burger-item">
                <label for="burger-toggle" class="burger-btn">
                    <span></span>
                    <span></span>
                    <span></span>
                </label>
            </li>
        </div>
    </ul>
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
