
import { Cards, Status, CardDetail } from './gameDto';

export const CardDetailsClient: Record<string, CardDetail> = {
  MNUS_2: {
      name: "MNUS_2",
      value: -2,
      quantity: 5,
    },
    MNUS_1: {
      name: "MNUS_1",
      value: -1,
      quantity: 10,
    },
    ZERO: {
      name: "ZERO",
      value: 0,
      quantity: 15,
    },
    ONE: {
      name: "ONE",
      value: 1,
      quantity: 10,
    },
    TWO: {
      name: "TWO",
      value: 2,
      quantity: 10,
    },
    THREE: {
      name: "THREE",
      value: 3,
      quantity: 10,
    },
    FOUR: {
      name: "FOUR",
      value: 4,
      quantity: 10,
    },
    FIVE: {
      name: "FIVE",
      value: 5,
      quantity: 10,
    },
    SIX: {
      name: "SIX",
      value: 6,
      quantity: 10,
    },
    SEVEN: {
      name: "SEVEN",
      value: 7,
      quantity: 10,
    },
    EIGHT: {
      name: "EIGHT",
      value: 8,
      quantity: 10,
    },
    NINE: {
      name: "NINE",
      value: 9,
      quantity: 10,
    },
    TEN: {
      name: "TEN",
      value: 10,
      quantity: 10,
    },
    ELEVEN: {
      name: "ELEVEN",
      value: 11,
      quantity: 10,
    },
    TWELVE: {
      name: "TWELVE",
      value: 12,
      quantity: 10,
    },
};

export interface GameStateClient {
  id: number;
  title: string;
  status: Status;
  ownerId: number;
  deck: Cards[];
  discardPile: Cards[];
  playerCards: {
    playerId: number;
    cards: {
      card: Cards;
      revealed: boolean;
      position: number;
    }[];
  }[];
  currentPlayerId: number;
  isGameOver: boolean;
  scores: {
    playerId: number;
    score: number;
  }[] | null;
  winnerId: number | null;
  owner: { id: number; email: string };
  players: { id: number; email: string }[];
}

export interface CardInfo {
  card: Cards | null;
  revealed: boolean;
  position: number;
}

export interface PlayerCards {
  playerId: number;
  cards: CardInfo[];
}

export interface Score {
  playerId: number;
  score: number;
}

export interface GameItem {
  id: number;
  title: string;
  status: Status;
  ownerId: number;
}

export interface JoinGameFormData {
  gameId: string;
  password: string;
}

export interface CreateGameFormData {
  title: string;
  password: string;
}
