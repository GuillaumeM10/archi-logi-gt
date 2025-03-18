import api from './api';
import {
  Game,
  CreateGameDto,
  JoinGameDto,
  PlayerActionDto,
  Status
} from '@archi-logi-gt/dtos';

const gameService = {
  createGame: async (createGameDto: CreateGameDto): Promise<Game> => {
    const response = await api.post<Game>('/game', createGameDto);
    return response.data;
  },

  getGames: async (): Promise<Game[]> => {
    const response = await api.get<Game[]>('/game');
    return response.data;
  },

  getGame: async (id: string): Promise<Game> => {
    const response = await api.get<Game>(`/game/${id}`);
    return response.data;
  },

  joinGame: async (joinGameDto: JoinGameDto): Promise<Game> => {
    const response = await api.post<Game>('/game/join', joinGameDto);
    return response.data;
  },

  takeAction: async (actionDto: PlayerActionDto): Promise<Game> => {
    const response = await api.post<Game>('/game/action', actionDto);
    return response.data;
  },

  pauseGame: async (id: string): Promise<Game> => {
    const response = await api.post<Game>(`/game/${id}/pause`);
    return response.data;
  },

  resumeGame: async (id: string): Promise<Game> => {
    const response = await api.post<Game>(`/game/${id}/resume`);
    return response.data;
  },
};

export default gameService;
