import stylesModal from './modal.scss';
import styles from './auth-dialog.scss';
import { auth } from './../../services/firebase';
import { Router } from './../../app/router';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '@firebase/auth';

export class AuthDialog extends HTMLElement {
  private isOpen: boolean = false;
  private mode: 'login' | 'register' = 'login';
  private isPending: boolean = false;

  // Fields values
  private emailValue: string = '';
  private usernameValue: string = '';
  private passwordValue: string = '';
  private confirmPasswordValue: string = '';

  // Validation error messages
  private emailError: string | undefined = undefined;
  private usernameError: string | undefined = undefined;
  private passwordError: string | undefined = undefined;
  private confirmPasswordError: string | undefined = undefined;
  private generalError: string | undefined = undefined;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  private setupRouterSync() {
    globalThis.addEventListener('app-state-change', ((event: CustomEvent) => {
      const { searchParams } = event.detail;
      const authParameter = searchParams.get('auth');
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
    if (this.isPending) return;
    this.mode = newMode;
    this.formReset();
    Router.getInstance().updateQueryParam('auth', newMode, true);
    this.render();
  }

  /// Validations
  private validateEmail(value: string): string | undefined {
    if (!value.trim()) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value)
      ? undefined
      : 'Please enter a valid email address.';
  }

  private validateUsername(value: string): string | undefined {
    if (!value.trim()) return 'Username is required.';
    if (value.length < 2 || value.length > 30)
      return 'Username must be between 2 and 30 characters.';
    // Must start with uppercase English letter, followed by English letters and digits only
    const usernameRegex = /^[A-Z][A-Za-z0-9]{1,29}$/;
    return usernameRegex.test(value)
      ? undefined
      : 'Must start with an uppercase letter and contain only letters and digits.';
  }

  private validatePassword(value: string): string | undefined {
    if (!value) return 'Password is required.';
    if (value.length < 6) return 'Password must be at least 6 characters long.';

    if (this.mode === 'register') {
      const hasUppercase = /[A-Z]/.test(value);
      const hasDigit = /\d/.test(value);
      const hasSpecial = /[^A-Za-z0-9]/.test(value);

      if (!hasUppercase || !hasDigit || !hasSpecial) {
        return 'Must include at least one uppercase letter, one digit, and one special character.';
      }
    }
    return undefined;
  }

  private validateConfirmPassword(value: string): string | undefined {
    if (!value) return 'Please confirm your password.';
    return value === this.passwordValue ? undefined : 'Passwords do not match.';
  }

  private isFormValid(): boolean {
    const emailError = this.validateEmail(this.emailValue);
    const passError = this.validatePassword(this.passwordValue);

    if (emailError !== undefined || passError !== undefined) return false;

    if (this.mode === 'register') {
      const usernameError = this.validateUsername(this.usernameValue);
      const confirmError = this.validateConfirmPassword(
        this.confirmPasswordValue
      );
      console.log(
        'VALIDATE',
        usernameError,
        confirmError,
        emailError,
        passError
      );
      if (usernameError !== undefined || confirmError !== undefined)
        return false;
    }

    return true;
  }

  private updateSubmitButtonState() {
    const submitButton = this.shadowRoot?.getElementById(
      'submit-btn'
    ) as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = !this.isFormValid();
    }
  }

  private handleFieldInput(fieldName: string, value: string) {
    switch (fieldName) {
      case 'email': {
        this.emailValue = value;
        this.emailError = this.validateEmail(value);
        this.updateErrorDisplay('email', this.emailError);
        break;
      }

      case 'username': {
        this.usernameValue = value;
        this.usernameError = this.validateUsername(value);
        this.updateErrorDisplay('username', this.usernameError);
        break;
      }

      case 'password': {
        this.passwordValue = value;
        this.passwordError = this.validatePassword(value);
        this.updateErrorDisplay('password', this.passwordError);

        // Revalidate confirm password whenever password changes during registration
        if (this.mode === 'register' && this.confirmPasswordValue) {
          this.confirmPasswordError = this.validateConfirmPassword(
            this.confirmPasswordValue
          );
          this.updateErrorDisplay('confirmPassword', this.confirmPasswordError);
        }
        break;
      }
      case 'confirmPassword': {
        this.confirmPasswordValue = value;
        this.confirmPasswordError = this.validateConfirmPassword(value);
        this.updateErrorDisplay('confirmPassword', this.confirmPasswordError);
      }
    }
    this.updateSubmitButtonState();
  }

  private updateErrorDisplay(
    fieldName: string,
    errorMessage: string | undefined
  ) {
    const errorElement = this.shadowRoot?.querySelector(`#${fieldName}-error`);
    const inputElement = this.shadowRoot?.querySelector(
      `#${fieldName}`
    ) as HTMLInputElement;

    if (errorElement) {
      errorElement.textContent = errorMessage ?? '';
    }
    if (inputElement && errorMessage) {
      inputElement.classList.add('invalid');
    }
    if (inputElement && !errorMessage) {
      inputElement.classList.remove('invalid');
    }
  }

  // --- Firebase Authentication Operation ---
  private async handleFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    event.stopPropagation();
    console.log(!this.isFormValid(), this.isPending);
    if (!this.isFormValid() || this.isPending) return;

    this.isPending = true;
    this.generalError = undefined;

    console.log('Submit Event dispatched', SubmitEvent);

    try {
      if (this.mode === 'login') {
        const authRespond = await signInWithEmailAndPassword(
          auth,
          this.emailValue,
          this.passwordValue
        );
        console.log(authRespond);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.emailValue,
          this.passwordValue
        );
        console.log(userCredential);

        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: this.usernameValue,
          });
        }
      }

      // Success: Close modal and establish session state
      this.close();
      globalThis.dispatchEvent(
        new CustomEvent('auth-state-changed', {
          detail: { user: auth.currentUser },
        })
      );
    } catch (error: unknown) {
      const authError = error as Error;
      this.generalError =
        authError.message ?? 'Authentication failed. Please try again.';
      console.log('error', authError, authError.name);
      this.isPending = false;
      this.render();
    }
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

          <form id="auth-form" method="POST">
            ${
              this.mode === 'register'
                ? `
              <label>
                Username
                <input type="text" name="username" id="username" required placeholder="Choose a username" />
                <span id="username-error" class="form-error">${this.usernameError === undefined ? '' : this.usernameError}</span>
              </label>
            `
                : ''
            }
            <label>
              Email Address
              <input type="email" name="email" id="email" required placeholder="name@example.com" />
              <span id="email-error" class="form-error">${this.emailError === undefined ? '' : this.emailError}</span>
            </label>
            <label>
              Password
              <input type="password" name="password" id="password" required placeholder="••••••••" />
              <span id="password-error" class="form-error">${this.passwordError === undefined ? '' : this.passwordError}</span>
            </label>
            ${
              this.mode === 'register'
                ? `<label>
              Repeat Password
              <input type="password" name="confirmPassword" id="confirmPassword" required placeholder="••••••••" />
              <span id="confirmPassword-error" class="form-error">${this.confirmPasswordError === undefined ? '' : this.confirmPasswordError}</span>
            </label>`
                : ''
            }
            <button type="submit">${this.mode === 'login' ? 'Login' : 'Create Account'}</button>
          </form>
          <span>${this.generalError === undefined ? '' : this.generalError}</span>
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

    const inputs = ['email', 'username', 'password', 'confirmPassword'];

    for (const id of inputs) {
      const element = this.shadowRoot?.querySelector(
        `#${id}`
      ) as HTMLInputElement;
      if (!element) {
        continue;
      }
      element.addEventListener('input', (event) =>
        this.handleFieldInput(id, (event.target as HTMLInputElement).value)
      );
      element.addEventListener('blur', (event) =>
        this.handleFieldInput(id, (event.target as HTMLInputElement).value)
      );
    }

    this.shadowRoot
      .querySelector('#auth-form')
      ?.addEventListener('submit', (event) => {
        this.handleFormSubmit(event as SubmitEvent);
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

  private formReset() {
    this.emailValue = '';
    this.usernameValue = '';
    this.passwordValue = '';
    this.confirmPasswordValue = '';
    this.emailError = undefined;
    this.usernameError = undefined;
    this.passwordError = undefined;
    this.confirmPasswordError = undefined;
    this.generalError = undefined;
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
    this.formReset();
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
