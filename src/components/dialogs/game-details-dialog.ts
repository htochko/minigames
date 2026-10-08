import styles from './game-details-dialog.scss';
import { timeAgo } from '../../utils/date-formatter';
import type { GameDetail } from '../../types/game';

export class GameDetailsDialog extends HTMLElement {
  private isOpen: boolean = false;
  private currentSlug: string | undefined = undefined;
  private gameData: GameDetail | undefined = undefined;
  private isLoading: boolean = false;
  private errorMessage: string | undefined = undefined;
  private isCommentsLoading: boolean = false;
  private commentsErrorMessage: string | undefined = undefined;

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
              ${this.gameData.likesCount ? `<span class="like">${(this.gameData.likesCount / 100).toFixed(1)}K</span>` : ''}
              ${this.gameData.rating ? `<span class="rating">${this.gameData.rating.toFixed(1)}</span>` : ''}
            </div>
            
            <p>${this.gameData.fullDescription}</p>
            <div class="specs">
            ${Object.entries(this.gameData.specs)
              .map(
                ([key, value]) =>
                  `<div class="spec"><h4>${key}</h4>${value}</div>`
              )
              .join('')}
            </div>  
          `
                : `
            <div class="error-state">
              <p>Could not retrieve game information.</p>
            </div>
          `
          }
          <div class="actions">
              <button type="button" class="primary-btn">Play now</button>
              <button type="button" class="secondary-btn icon-btn favorites">Add to favorites</button>
          </div>
                   ${
                     this.isLoading
                       ? `
            <div class="loading-state">
              <p>Loading Top Records from game details...</p>
            </div>`
                       : this.gameData
                         ? `
                <section id="top-records">
                <h4>Top Records</h4>
                <ul>
                  ${this.gameData.topRecords
                    .map(
                      (record) =>
                        `<li>
                      <span>${record.playerName}</span>
                      <span>${record.score}pts <span class="dat">${timeAgo(record.achievedAt)}</span></span>
                      
                    </li>`
                    )
                    .join('')}
                </ul>
                </section>
                <game-comments slug="${this.gameData.slug}"></game-comments>
                `
                         : ''
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
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
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
