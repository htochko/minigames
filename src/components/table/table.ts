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
  private currentCategory: string = 'All categories';
  private currentSort: string = 'rating-desc';

  // Mock dataset (14 items to demonstrate multi-page pagination)
  private items: Item[] = games.data as unknown as Item[];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  private getCategories(): string[] {
    const categories = this.items.map((item) => item.category);
    return ['All categories', ...new Set(categories)];
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

  private goToPage(page: number) {
    const totalPages = this.getTotalPages();
    if (!(page >= 1 && page <= totalPages)) {
      return;
    }
    this.currentPage = page;
    this.render();
  }

  private setCategory(category: string) {
    this.currentCategory = category;
    this.currentPage = 1; // Reset to page 1 on filter change
    this.render();
  }

  private setSort(sortValue: string) {
    this.currentSort = sortValue;
    this.currentPage = 1; // Reset to page 1 on sort change
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    const categories = this.getCategories();
    const pagedItems = this.getPagedItems();
    const totalPages = this.getTotalPages();

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      
      <h2>Library Collection</h2>
      <div class="control-panel">
        <div class="filters-group">
          ${categories
            .map(
              (cat) => `
            <button class="filter-btn ${this.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
              ${cat}
            </button>
          `
            )
            .join('')}
        </div>

        <div class="sorter-group">
          <select id="sort-select">
            <option value="rating-desc" ${this.currentSort === 'rating-desc' ? 'selected' : ''}>Sort by: Rating ↓</option>
            <option value="rating-asc" ${this.currentSort === 'rating-asc' ? 'selected' : ''}>Sort by: Rating ↑</option>
            <option value="name-asc" ${this.currentSort === 'name-asc' ? 'selected' : ''}>Sort by: Name: A → Z</option>
            <option value="name-desc" ${this.currentSort === 'name-desc' ? 'selected' : ''}>Sort by: Name: Z → A</option>
          </select>
        </div>
      </div>
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
        <button class="btn-page" id="prev-btn" ${this.currentPage === 1 ? 'disabled' : ''} aria-label="previous page"><</button>
    
        ${Array.from({ length: totalPages }, (_, index) => index + 1)
          .map(
            (page) => `
          <button class="btn-page ${page === this.currentPage ? 'active' : ''}" aria-label="page ${page}" data-page="${page}">
            ${page}
          </button>`
          )
          .join('')}
        <button class="btn-page" id="next-btn" ${this.currentPage === totalPages ? 'disabled' : ''} aria-label>></button>
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

    // Page number button handlers
    this.shadowRoot.querySelectorAll('[data-page]').forEach((button) => {
      if (!(button instanceof HTMLElement)) {
        return;
      }
      button.addEventListener('click', () => {
        const page = Number(button.dataset.page);
        if (page) this.goToPage(page);
      });
    });

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
    // Filter handlers
    // Category filter button handlers
    this.shadowRoot.querySelectorAll('.filter-btn').forEach((button) => {
      button.addEventListener('click', () => {
        if (!(button instanceof HTMLElement)) {
          return;
        }
        const category = button.dataset.category;
        if (category) this.setCategory(category);
      });
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
