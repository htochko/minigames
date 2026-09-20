import styles from './footer.scss';

export class Footer extends HTMLElement {
  constructor() {
    super();
    // Attach a Shadow DOM root (mode: 'open' allows inspection if needed)
    const shadow = this.attachShadow({ mode: 'open' });

    // Create container and scoped styles
    const footerElement = document.createElement('footer');
    footerElement.innerHTML = `
      <style>${styles}</style>
      <footer class="footer-container">
        <div class="footer-menu">

        <a href="#" class="logo">MiniGames</a>
        <p class="motto">Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.</p>
        
        <nav>
        <ul>
          <a href="#">Home</a>
          <a href="#library">Library</a>
          <a href="#categories">Categories</a> 
          <a href="#tournaments">Tournaments</a>
        </ul>
        <h2>Company</h2>
        <ul>
          <li><a href="#">About us</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of services</a></li>
        </ul>
        <h2>Community</h2>
        <ul>
          <li><a href="#">Share</a></li>
          <li><a href="#">Chat with us</a></li>
          <li><a href="#">RSS</a></li>
        </ul>
        </nav>
        </div>
        <div class='footer-bottom'>
          <ul>
            <li>
              &copy;2026
            </li>
            <li>
              <a>RS School</a>
            </li>
          </ul>
        </div>
      </footer>
    `;

    shadow.append(footerElement);
  }
}

export function registerFooter(tagName = 'footer-template'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, Footer);
  }
}
