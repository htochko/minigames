import styles from './table.scss';
import games from './../../data/all-games-seed.json';

interface Item {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
}

export class Table extends HTMLElement {
  private currentPage: number = 1;
  private itemsPerPage: number = 6;
  private selectedItem: Item | null | undefined = undefined;

  // Mock dataset (14 items to demonstrate multi-page pagination)
  private items: Item[] = games.data as unknown as Item[];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    console.log('GAMES:', this.items);
  }

  private getPagedItems(): Item[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.items.slice(start, start + this.itemsPerPage);
  }

  private getTotalPages(): number {
    return Math.ceil(this.items.length / this.itemsPerPage);
  }

  private openModal(item: Item) {
    this.selectedItem = item;
    this.render();
  }

  private closeModal() {
    this.selectedItem = undefined;
    this.render();
  }

  private changePage(delta: number) {
    const newPage = this.currentPage + delta;
    if (!(newPage >= 1 && newPage <= this.getTotalPages())) {
      return;
    }
    this.currentPage = newPage;
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    const pagedItems = this.getPagedItems();
    const totalPages = this.getTotalPages();

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      
      <h2>Library Collection</h2>
      
      <div class="cards-grid">
        ${pagedItems
          .map(
            (item) => `
          <div class="card" data-id="${item.slug}">
            <img class="card-image" src="/assets/images/games/${item.slug}-card.jpg" alt="${item.name} cover" loading="lazy" />
            <div class="card-body">
              <h3 class="card-title">${item.name}</h3>
              <span class="tag-category">${item.category}</span>
              <p class="card-snippet">${item.shortDescription}</p>
            </div>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="pagination">
        <button id="prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${this.currentPage} of ${totalPages}</span>
        <button id="next-btn" ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>
      </div>

      <div class="modal-overlay ${this.selectedItem ? 'active' : ''}">
        <div class="modal-dialog">
          <button class="close-btn" id="modal-close">&times;</button>
          <h3 id="modal-title">${this.selectedItem?.name || ''}</h3>
          
          <p id="modal-desc">${this.selectedItem?.shortDescription || ''}</p>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    if (!this.shadowRoot) return;

    // Card click handlers
    this.shadowRoot.querySelectorAll('.card').forEach((cardElement) => {
      cardElement.addEventListener('click', () => {
        if (!(cardElement instanceof HTMLElement)) {
          return;
        }
        const slug = cardElement.dataset.id;
        const item = this.items.find((item) => item.slug === slug);
        if (item) this.openModal(item);
      });
    });

    // Pagination handlers
    this.shadowRoot
      .querySelector('#prev-btn')
      ?.addEventListener('click', () => this.changePage(-1));
    this.shadowRoot
      .querySelector('#next-btn')
      ?.addEventListener('click', () => this.changePage(1));

    // Modal close handlers
    this.shadowRoot
      .querySelector('#modal-close')
      ?.addEventListener('click', () => this.closeModal());
    this.shadowRoot
      .querySelector('.modal-overlay')
      ?.addEventListener('click', (event) => {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
          this.closeModal();
        }
      });
  }

  connectedCallback() {
    this.render();
  }
}

export function registerDataTable(): void {
  if (!customElements.get('data-table')) {
    customElements.define('data-table', Table);
  }
}
