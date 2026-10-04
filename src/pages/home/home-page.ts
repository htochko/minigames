import styles from './home-page.scss';
// import hero
import { registerFeaturedGamesSlider } from './../../components/slider/slider';
// import list
// import banner
// import form dialog

export class HomePage extends HTMLElement {
  constructor() {
    super();
    registerFeaturedGamesSlider();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>${styles}</style>
      <h1>Mini Games</h1>
      <section class="hero">
      <div>
      <h2>Take a short Breack & Have a fun</h2>
        <p>Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.</p>
        <a href="#/library" data-link>Browse Library</a>
      </div>
      </section>
      <section>
      <featured-games-slider></featured-games-slider>
      </section>
    `;
  }
}

export function registerHomePage(): void {
  if (!customElements.get('home-page')) {
    customElements.define('home-page', HomePage);
  }
}
