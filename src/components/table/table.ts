import styles from './table.scss';

interface Item {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  price: string | number;
  rating: number;
  likesCount: number;
}

interface Category {
  slug: string;
  label: string;
  isDefault: true;
}

const endpointUrl =
  'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

export class Table extends HTMLElement {
  private currentPage: number = 1;
  private itemsPerPage: number = 6;
  private selectedItem: Item | null | undefined = undefined;
  private currentCategory: string | undefined = undefined;
  private currentSort: string = 'rating-desc';

  private currentIndex: number = 0;
  private items: Item[] = [];
  private itemsTotal?: number;
  private pagesTotal?: number;
  private categories: Category[] = [];
  private isLoading: boolean = true;
  private errorMessage: string | null | undefined = undefined;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  private async fetchItems(category = 'all', page = 1) {
    try {
      const limit = `limit=${this.itemsPerPage}&category=${category}&page=${page}`;
      const response = await fetch(`${endpointUrl}/games?${limit}`);
      if (!response.ok) throw new Error('Failed to fetch games');

      const data = await response.json();
      this.items = data.data;
      this.itemsTotal = data.meta.totalItems;
      this.pagesTotal = data.meta.totalPages;
    } catch {
      // log an error to admin
    } finally {
      this.isLoading = false;
    }
  }

  private async fetchCategories() {
    try {
      const response = await fetch(`${endpointUrl}/categories`);
      if (!response.ok) throw new Error('Failed to fetch games');

      const data = await response.json();
      this.categories = data.data;
      this.currentCategory = (this.categories.find((item: Category) => item.isDefault))?.slug;
    } catch {
      // log an error to admin
    } finally {
      this.isLoading = false;
    }
  }

  private getPagedItems(): Item[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.items.slice(start, start + this.itemsPerPage);
  }

  private openModal(item: Item) {
    this.selectedItem = item;
    this.render();
  }

  private closeModal() {
    this.selectedItem = undefined;
    this.render();
  }

  private async changePage(delta: number) {
    const newPage = this.currentPage + delta;
    if (!(newPage >= 1 && newPage <= (this.pagesTotal || 0) )) {
      return;
    }
    this.currentPage = newPage;
    await this.fetchItems(this.currentCategory, this.currentPage)
    this.render();
  }

  private async goToPage(page: number) {
    const totalPages = this.pagesTotal || 0;
    if (!(page >= 1 && page <= totalPages)) {
      return;
    }
    this.currentPage = page;
    await this.fetchItems(this.currentCategory, this.currentPage);
    this.render();
  }

  private async setCategory(category: string) {
    this.currentCategory = category;
    this.currentPage = 1; // Reset to page 1 on filter change
    await this.fetchItems(category, this.currentPage)
    this.render();
  }

  private setSort(sortValue: string) {
    this.currentSort = sortValue;
    this.currentPage = 1; // Reset to page 1 on sort change
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    const categories = this.categories;
    const pagedItems = this.getPagedItems();
    const totalPages = this.pagesTotal || 0;

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      
      <h2>Library Collection</h2>
      <div class="control-panel">
        <div class="filters-group">
          ${categories
            .map(
              ({slug}) => `
            <button class="filter-btn ${this.currentCategory === slug ? 'active' : ''}" data-category="${slug}">
              ${slug}
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
        ${this.items
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
      ${(totalPages > 1)? 
      `<div class="pagination">
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
      </div>` : ''
      }
      
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

  async connectedCallback() {
    await this.fetchCategories();
    await this.fetchItems(this.currentCategory, 1)
    this.render();
    this.attachEventListeners()
  }
}

export function registerDataTable(): void {
  if (!customElements.get('data-table')) {
    customElements.define('data-table', Table);
  }
}
