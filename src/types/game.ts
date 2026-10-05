export interface Game {
    slug: string;
    name: string;
    category: string;
    shortDescription: string;
    price: string | number;
    rating: number;
    likesCount: number;
}

export interface GameDetail extends Game {
    heroImage: string;
    fullDescription: string;
}