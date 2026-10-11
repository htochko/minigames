import styles from './game-comments.scss';
import { timeAgo } from '../../utils/date-formatter';

interface CommentItem {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export class GameComments extends HTMLElement {
  // Observe changes to the 'slug' attribute
  static get observedAttributes() {
    return ['slug'];
  }

  private comments: CommentItem[] = [];
  private total: number | undefined = undefined;
  private isLoading: boolean = true;
  private errorMessage: string | undefined = undefined;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  private async fetchComments(slug: string) {
    this.isLoading = true;
    this.errorMessage = undefined;
    this.render();

    const endpoint = process.env.API_ENDPOINT;

    try {
      const response = await fetch(`${endpoint}/games/${slug}/comments`);
      if (!response.ok) throw new Error('Failed to load comments.');

      const { meta, data } = await response.json();
      this.comments = data;
      this.total = meta.totalComments;
    } catch {
      this.errorMessage = 'Error loading comments';
    } finally {
      this.isLoading = false;
      this.render();
    }
  }
  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div>
        <h4>Community Comments</h4>
        ${
          this.isLoading
            ? `
          <p class="sub-loader">Loading comments...</p>
        `
            : this.errorMessage
              ? `
          <p class="error-state">${this.errorMessage}</p>
        `
              : this.comments.length === 0
                ? `
          <p class="no-comments">No comments yet. Be the first to share your thoughts!</p>
        `
                : `
          <div class="comments-list">
            ${this.comments
              .map(
                (comment) => `
              <div class="comment-item">
                <div class="comment-item-meta">
                    <strong>${comment.authorName}</strong>
                    <span class="date">${timeAgo(comment.createdAt)}</span>
                </div>
                <p>${comment.text}</p>
                <button type='button' class='icon-btn like ${comment.isLikedByCurrentUser ? 'liked' : 'unliked'}'></button>
                <strong>${comment.likesCount}</strong>
                </div>
            `
              )
              .join('')}
          </div>
        `
        }
      </div>
    `;
  }

  connectedCallback() {
    this.render();
    const slug = this.getAttribute('slug');
    if (slug) {
      this.fetchComments(slug);
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'slug' && oldValue !== newValue && newValue) {
      this.fetchComments(newValue);
    }
  }
}

export function registerGameComments(): void {
  if (!customElements.get('game-comments')) {
    customElements.define('game-comments', GameComments);
  }
}
