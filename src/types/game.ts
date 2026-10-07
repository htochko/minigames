export interface GameSpecs {
  genre: string;
  players: string;
  duration: string;
  price: number | string;
}

export interface TopRecord {
  achievedAt: Date;
  playerName: string;
  position: number;
  score: number;
}

export interface Game {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  price: string | number;
  rating: number;
  likesCount: number;
  specs: GameSpecs;
  topRecords: TopRecord[]
}

export interface GameDetail extends Game {
  heroImage: string;
  fullDescription: string;
}
