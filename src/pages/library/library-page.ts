import styles from './library-page.scss';
// import datatable paginated list with filter

export class LibraryPage extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>${styles}</style>
      <h1>Games Library</h1>
      <section class="list-container">
      <div>
      <h2>Browse our collection of casual mini-games</h2>
      <div>
      List hoes here
      </div>
      </section>
      <section>
      <h2>New Games</h2>
      <div div="slider">Slider goes here</div>
      </section>
    `;
  }
}

export function registerLibraryPage(): void {
  if (!customElements.get('library-page')) {
    customElements.define('library-page', LibraryPage);
  }
}
