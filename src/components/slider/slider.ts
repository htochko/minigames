import styles from './slider.scss';

interface Game {
  slug: string;
  name: string;
  rating: string | number;
  likesCount: string | number;
}

const endpointUrl = process.env.API_ENDPOINT;

export class FeaturedGamesSlider extends HTMLElement {
  private currentIndex: number = 0;
  private games: Game[] = [];
  private isLoading: boolean = true;
  private errorMessage: string | null | undefined = undefined;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  private async fetchFeaturedGames() {
    try {
      // Replace with your actual endpoint variable or relative API route
      const response = await fetch(`${endpointUrl}/games?featured=true`);
      if (!response.ok) throw new Error('Failed to fetch featured games');

      const data = await response.json();
      this.games = data.data;
      console.log(this.games);
    } catch {
      // log an error to admin
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  private nextSlide() {
    if (this.games.length === 0) return;
    // Circular increment (loops back to 0 after total length)
    this.currentIndex = (this.currentIndex + 1) % this.games.length;
    this.render();
  }

  private prevSlide() {
    if (this.games.length === 0) return;
    // Circular decrement (loops to last item if below 0)
    this.currentIndex =
      (this.currentIndex - 1 + this.games.length) % this.games.length;
    this.render();
  }

  private getVisibleSlides() {
    const total = this.games.length;
    if (total === 0) return [];

    // We want 5 positions: [-2 (far left), -1 (near left), 0 (center), +1 (near right), +2 (far right)]
    const offsets = [-2, -1, 0, 1, 2];

    return offsets.map((offset) => {
      // Modulo arithmetic to achieve seamless wrapping (e.g., after 9 comes 1)
      const index = (this.currentIndex + offset + total) % total;
      let positionClass = 'position-center';

      switch (offset) {
        case -2: {
          positionClass = 'position-far-left';
          break;
        }
        case -1: {
          positionClass = 'position-near-left';
          break;
        }
        case 0: {
          positionClass = 'position-center';
          break;
        }
        case 1: {
          positionClass = 'position-near-right';
          break;
        }
        case 2: {
          positionClass = 'position-far-right';
          break;
        }
      }

      return {
        game: this.games[index],
        positionClass,
        absoluteIndex: index,
      };
    });
  }

  private render() {
    if (!this.shadowRoot) return;

    if (this.isLoading) {
      this.shadowRoot.innerHTML = `<style>${styles}</style><p style="text-align: center; padding: 2rem;">Loading featured games...</p>`;
      return;
    }

    const visibleSlides = this.getVisibleSlides();

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="top-controls"><h2>New games</h2><div class="slider-controls">
          <button id="prev-btn">&#10094;</button>
          <button id="next-btn">&#10095;</button>
        </div></div>
      <div class="slider-container">
        <div class="slider-track">
          ${visibleSlides
            .map(
              (item) => `
            <div class="slide ${item.positionClass}" data-index="${item.absoluteIndex}" data-slug="${item.game?.slug}">
              <img src="/assets/images/games/${item.game?.slug}-card.jpg" alt="${item.game?.name} cover" onerror="this.src='/assets/images/games/tukoni-forest-keepers-card.jpg'" />
              <div class="slide-content">
                <h3>${item.game?.name}</h4>
                <ul>
                <li class="rating">${item.game?.rating}</li>
                <li class="likes">${item.game?.likesCount}</li>
                </ul>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    if (!this.shadowRoot) return;

    const previousButton = this.shadowRoot.querySelector('#prev-btn');
    const nextButton = this.shadowRoot.querySelector('#next-btn');

    if (previousButton !== null && previousButton instanceof HTMLElement) {
      previousButton.addEventListener('click', () => this.prevSlide());
    }
    if (nextButton !== null && nextButton instanceof HTMLElement) {
      nextButton.addEventListener('click', () => this.nextSlide());
    }

    // Clicking any side slide instantly rotates it to the center
    this.shadowRoot.querySelectorAll('.slide').forEach((slideElement) => {
      slideElement.addEventListener('click', () => {
        if (!(slideElement instanceof HTMLElement)) {
          return;
        }
        const index = Number(slideElement.dataset.index);
        if (!Number.isNaN(index)) {
          return;
        }
        this.currentIndex = index;
        this.render();
      });
    });
  }
  async connectedCallback() {
    await this.fetchFeaturedGames();
    this.render();
    this.attachEventListeners();
  }
}

export function registerFeaturedGamesSlider(): void {
  if (!customElements.get('featured-games-slider')) {
    customElements.define('featured-games-slider', FeaturedGamesSlider);
  }
}
