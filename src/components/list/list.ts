import styles from './list.scss';

// make it more abstract
interface LeaderBoardItem {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}

// put to env var
const endpointUrl =
  'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api';

export class List extends HTMLElement {
  private currentIndex: number = 0;
  private items: LeaderBoardItem[] = [];
  private isLoading: boolean = true;
  private errorMessage: string | null | undefined = undefined;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  private async fetchItems() {
    try {
      // Replace with your actual endpoint variable or relative API route
      const response = await fetch(`${endpointUrl}/leaderboard`);
      if (!response.ok) throw new Error('Failed to fetch featured games');

      const data = await response.json();
      this.items = data.data;
      console.log(this.items);
    } catch {
      // log an error to admin
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    if (this.isLoading) {
      this.shadowRoot.innerHTML = `<style>${styles}</style><p style="text-align: center; padding: 2rem;">Loading featured games...</p>`;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <table>
      <thead>
        <tr>
            <th>Rank</th>
            <th>Player</th>
            <th class="exclude-mobiles">Games Played</th>
            <th>Total score</th>
            <th>Streak</th>
            <th class="exclude-mobiles exclude-tablets">Favorite Game</th>
        </tr>
      <thead>
      <tbody>
        ${this.items
          .map(
            (item) => `
              <tr>
                <td>${item.rank}</td>
                <td>${item.playerName}</td>
                <td class="exclude-mobiles">${item.gamesPlayed}</td>
                <td>${item.totalScore}</td>
                <td>${item.streakDays}</td>
                <td class="exclude-mobiles exclude-tablets" data-slug="${item.favoriteGameSlug}">
                    <span class="tag">${item.favoriteGameName}</span>
                </td>
              </tr>
              `
          )
          .join('')}
      </tbody>
      </table>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    if (!this.shadowRoot) return;
  }
  async connectedCallback() {
    await this.fetchItems();
    this.render();
    this.attachEventListeners();
  }
}

export function registerList(): void {
  if (!customElements.get('leaderboard-template')) {
    customElements.define('leaderboard-template', List);
  }
}
