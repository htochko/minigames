import stylesModal from './modal.scss';
import styles from './auth-dialog.scss';
import { Router } from './../../app/router';

export class AuthDialog extends HTMLElement {
  private isOpen: boolean = false;
  private mode: 'login' | 'register' = 'login';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    console.log('AUTH-MODAL construct');
  }

  private setupRouterSync() {
    globalThis.addEventListener('app-state-change', ((event: CustomEvent) => {
      const { searchParams } = event.detail;
      const authParameter = searchParams.get('auth');
      console.log('AUTH-MODAL');
      if (authParameter === 'login' || authParameter === 'register') {
        this.open(authParameter, false);
      } else if (!authParameter && this.isOpen) {
        this.close(false);
      }
    }) as EventListener);
  }

  // Handle Escape key to close
  private setupGlobalListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  private switchMode(newMode: 'login' | 'register') {
    this.mode = newMode;
    Router.getInstance().updateQueryParam('auth', newMode, true);
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        ${stylesModal}
        ${styles}
      </style>

      <div class="modal-overlay ${this.isOpen ? 'active' : ''}">
        <div class="modal-dialog">
          <button class="close-btn" id="close-btn">&times;</button>
          
          <div class="tabs">
            <button class="tab ${this.mode === 'login' ? 'active' : ''}" id="tab-login">Login</button>
            <button class="tab ${this.mode === 'register' ? 'active' : ''}" id="tab-register">Register</button>
          </div>

          <form id="auth-form">
            ${
              this.mode === 'register'
                ? `
              <label>
                Username
                <input type="text" name="username" required placeholder="Choose a username" />
              </label>
            `
                : ''
            }
            <label>
              Email Address
              <input type="email" name="email" required placeholder="name@example.com" />
            </label>
            <label>
              Password
              <input type="password" name="password" required placeholder="••••••••" />
            </label>
            <label>
              Password
              <input type="password" name="repeatpassword" required placeholder="••••••••" />
            </label>
            <button type="submit">${this.mode === 'login' ? 'Login' : 'Create Account'}</button>
          </form>
          <hr/>
          <button type='button' class="google">${this.mode === 'login' ? 'Login' : 'Continue'} with google</button>
        </div>
      </div>
    `;

    // Event bindings
    this.shadowRoot
      .querySelector('#close-btn')
      ?.addEventListener('click', () => this.close());
    this.shadowRoot
      .querySelector('#overlay')
      ?.addEventListener('click', (event) => {
        if (event.target === event.currentTarget) this.close();
      });

    this.shadowRoot
      .querySelector('#tab-login')
      ?.addEventListener('click', () => this.switchMode('login'));
    this.shadowRoot
      .querySelector('#tab-register')
      ?.addEventListener('click', () => this.switchMode('register'));

    this.shadowRoot
      .querySelector('#auth-form')
      ?.addEventListener('submit', (event) => {
        event.preventDefault();
        // Handle login/register submission logic goes here
        console.log(`Submitted ${this.mode} form`);
        this.close();
      });
  }

  private setupRouterSyncronization() {
    globalThis.addEventListener('app-state-change', ((event: CustomEvent) => {
      const { searchParams } = event.detail;
      const queryMode = searchParams.get('auth');
      console.log('AUTH:', queryMode);
      if (queryMode && (!this.isOpen || this.mode !== queryMode)) {
        this.open(queryMode, false);
      } else if (!queryMode && this.isOpen) {
        this.close(false);
      }
    }) as EventListener);
  }

  connectedCallback() {
    this.render();
    this.setupRouterSync();
    this.setupGlobalListeners();
    this.setupRouterSyncronization();
  }

  public open(mode: 'login' | 'register', shouldUpdateUrl: boolean = true) {
    this.isOpen = true;
    this.mode = mode;
    this.render();

    if (shouldUpdateUrl) {
      Router.getInstance().updateQueryParam('auth', mode);
    }
  }

  public close(shouldUpdateUrl: boolean = true) {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.render();

    if (shouldUpdateUrl) {
      Router.getInstance().updateQueryParam('auth', undefined);
    }
  }
}

export function registerAuthDialog(tagName = 'auth-dialog-template'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, AuthDialog);
  }
}
