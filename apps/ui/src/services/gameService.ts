import api from './api';

const gameService = {
  createGame: async (createGameDto: any): Promise<any> => {
    const response = await api.post<any>('/game', createGameDto);
    return response.data;
  },

  getGames: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/game');
    return response.data;
  },

  getGame: async (id: string): Promise<any> => {
    const response = await api.get<any>(`/game/${id}`);
    return response.data;
  },

  joinGame: async (joinGameDto: any): Promise<any> => {
    const response = await api.post<any>('/game/join', joinGameDto);
    return response.data;
  },

  takeAction: async (actionDto: any): Promise<any> => {
    const response = await api.post<any>('/game/action', actionDto);
    return response.data;
  },

  pauseGame: async (id: string): Promise<any> => {
    const response = await api.post<any>(`/game/${id}/pause`);
    return response.data;
  },

  resumeGame: async (id: string): Promise<any> => {
    const response = await api.post<any>(`/game/${id}/resume`);
    return response.data;
  },
};

export default gameService;
