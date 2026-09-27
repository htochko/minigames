import styles from './../../styles/globals.scss';

const htmlTemplate = `
    <style>${styles}<style>
    <div class="modal-content">
        <button class="modal-close" aria-label="Close modal">&times;</button>
        <img id="modal-img" src="" alt="" />
        <h3 id="modal-title"></h3>
        <p id="modal-desc"></p>
        <p id="modal-price" class="price"></p>
    </div>
`
export class GameDetailsDialog extends HTMLElement {
  constructor() {
    super();

    // Attach a Shadow DOM root (mode: 'open' allows inspection if needed)
    const shadow = this.attachShadow({ mode: 'open' });

    // Create container
    const dialogElement = document.createElement('div');
    dialogElement.innerHTML = htmlTemplate;
    shadow.append(dialogElement);
  }
}

export function registerGameDetailDialog(tagName = 'game-details-dialog-template'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, GameDetailsDialog);
  }
}    
