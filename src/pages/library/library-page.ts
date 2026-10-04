import styles from './library-page.scss';
// import datatable paginated list with filter
import { registerDataTable } from '../../components/table/table';

export class LibraryPage extends HTMLElement {
  constructor() {
    super();
    registerDataTable();
    const shadow = this.attachShadow({ mode: 'open' });
    console.log('style:', styles);
    shadow.innerHTML = `
      <style>${styles}</style>
      <section>
      <h1>Games Library</h1>
      </section>
      
      <section class="list-container">
      <h2>Browse our collection of casual mini-games</h2>
      <data-table></data-table>  
      </section>
      <section>
      <h2>New Games</h2>
      <div div="slider">Slider goes here</div>
      </section>
</div>
    `;
  }
}

export function registerLibraryPage(): void {
  if (!customElements.get('library-page')) {
    customElements.define('library-page', LibraryPage);
  }
}
