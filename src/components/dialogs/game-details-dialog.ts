import styles from './game-details-dialog.scss';
import type { GameDetail } from '../../types/game';

export class GameDetailsDialog extends HTMLElement {
  private isOpen: boolean = false;
  private currentSlug: string | undefined = undefined;
  private gameData: GameDetail | undefined = undefined;
  private isLoading: boolean = false;
  private errorMessage: string | undefined = undefined;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      
      <div class="modal-overlay ${this.isOpen ? 'active' : ''}">
        <div class="modal-dialog">
          <button class="close-btn" id="close-modal">&times;</button>
          
          ${
            this.isLoading
              ? `
            <div class="loading-state">
              <p>Loading game details...</p>
            </div>
          `
              : this.gameData
                ? `
            <img 
              class="modal-image" 
              src="/assets/images/games/${this.gameData.slug}-hero.jpg" 
              alt="${this.gameData.name} cover" 
              onerror="this.src='/assets/images/games/placeholder.jpg'" 
            />
            <div class="modal-header-meta">
              <h3>${this.gameData.name}</h3>
              ${this.gameData.likesCount ? `<span class="like">${(this.gameData.likesCount/100).toFixed(1)}K</span>` : ''}
              ${this.gameData.rating ? `<span class="rating">★ ${this.gameData.rating.toFixed(1)}</span>` : ''}
            </div>
            
            <p>${this.gameData.fullDescription}</p>
          `
                : `
            <div class="error-state">
              <p>Could not retrieve game information.</p>
            </div>
          `
          }
        </div>
      </div>
    `;
    this.attachEventListeners();
  }

  private attachEventListeners() {
    if (!this.shadowRoot) return;

    // Close button click
    this.shadowRoot
      .querySelector('#close-modal')
      ?.addEventListener('click', () => this.close());

    // Backdrop click to close
    this.shadowRoot
      .querySelector('.modal-overlay')
      ?.addEventListener('click', (event) => {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
          this.close();
        }
      });
  }

  private async open(slug: string) {
    this.isOpen = true;
    this.currentSlug = slug;
    this.isLoading = true;
    this.errorMessage = undefined;
    this.gameData = undefined;
    this.render();

    const endpoint = process.env.API_ENDPOINT;
    try {
      const response = await fetch(`${endpoint}/games/${slug}`);
      if (!response.ok)
        throw new Error('Failed to load game details from server.');

      const responseJson = await response.json();
      this.gameData = responseJson.data;
    } catch {
      // Show error screen
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  private setupGlobalListener() {
    document.addEventListener('click', (event) => {
      // composedPath() reaches through Shadow DOM boundaries safely
      const path = event.composedPath() as HTMLElement[];
      const targetWithSlug = path.find(
        (element) =>
          element && element.dataset && typeof element.dataset.slug === 'string'
      );

      if (targetWithSlug && typeof targetWithSlug.dataset.slug === 'string') {
        this.open(targetWithSlug.dataset.slug);
      }
    });
  }

  public close() {
    console.log('close modal');
    this.isOpen = false;
    this.currentSlug = undefined;
    this.render();
  }

  connectedCallback() {
    this.render();
    this.setupGlobalListener();
  }
}

export function registerGameDetailDialog(
  tagName = 'game-details-dialog-template'
): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, GameDetailsDialog);
  }
}
