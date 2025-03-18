import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import gameService from '../services/gameService';
// import { GameItem, JoinGameFormData, CreateGameFormData } from '@archi-logi-gt/dtos/';
// import { Status } from '@archi-logi-gt/dtos/dist/gameDto';

const LobbyPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<any[]>([]);
  // const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  // const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [joinFormData, setJoinFormData] = useState<any>({ gameId: '', password: '' });
  // const [joinFormData, setJoinFormData] = useState<JoinGameFormData>({ gameId: '', password: '' });
  const [createFormData, setCreateFormData] = useState<any>({ title: '', password: '' });
  // const [createFormData, setCreateFormData] = useState<CreateGameFormData>({ title: '', password: '' });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gameService.getGames();
        setGames(response);
      } catch (err: any) {
        setError('Failed to load games');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const newGame = await gameService.createGame({
        title: createFormData.title,
        password: createFormData.password,
        status: "PLAYING",
        // status: Status.PLAYING,
        playerIds: []
      });

      navigate(`/game/${newGame.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create game');
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await gameService.joinGame({
        gameId: joinFormData.gameId,
        password: joinFormData.password
      });

      navigate(`/game/${joinFormData.gameId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join game');
    }
  };

  const handleSelectGame = (game: any) => {
    // const handleSelectGame = (game: GameItem) => {
    setSelectedGame(game);
    setJoinFormData({ gameId: String(game.id), password: '' });
    setShowJoinForm(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading games...</div>;
  }

  return (
    <div className="lobby-container">
      <div className="header">
        <h1>Skyjo Game Lobby</h1>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="game-actions">
        <button
          onClick={() => {
            setShowCreateForm(true);
            setShowJoinForm(false);
          }}
          className="action-btn"
        >
          Create New Game
        </button>
        <button
          onClick={() => {
            setShowJoinForm(true);
            setShowCreateForm(false);
            setSelectedGame(null);
          }}
          className="action-btn"
        >
          Join by ID
        </button>
      </div>

      {showCreateForm && (
        <div className="form-container">
          <h2>Create New Game</h2>
          <form onSubmit={handleCreateGame}>
            <div className="form-group">
              <label htmlFor="title">Game Title</label>
              <input
                type="text"
                id="title"
                value={createFormData.title}
                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="createPassword">Password</label>
              <input
                type="password"
                id="createPassword"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit">Create Game</button>
              <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showJoinForm && (
        <div className="form-container">
          <h2>Join Game</h2>
          <form onSubmit={handleJoinGame}>
            <div className="form-group">
              <label htmlFor="gameId">Game ID</label>
              <input
                type="text"
                id="gameId"
                value={joinFormData.gameId}
                onChange={(e) => setJoinFormData({ ...joinFormData, gameId: e.target.value })}
                required
                disabled={!!selectedGame}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={joinFormData.password}
                onChange={(e) => setJoinFormData({ ...joinFormData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit">Join Game</button>
              <button
                type="button"
                onClick={() => {
                  setShowJoinForm(false);
                  setSelectedGame(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="games-list">
        <h2>Available Games</h2>
        {games.length === 0 ? (
          <p>No games available</p>
        ) : (
          <ul>
            {games.map((game) => (
              <li key={game.id} className={`game-item ${game.status.toLowerCase()}`}>
                <div className="game-info">
                  <h3>{game.title}</h3>
                  <div className="game-details">
                    <span>ID: {game.id}</span>
                    <span>Status: {game.status}</span>
                    {user?.id === game.ownerId && <span className="owner-badge">Owner</span>}
                  </div>
                </div>
                <div className="game-actions">
                  {game.status === "PLAYING" && (
                  // {game.status === Status.PLAYING && (
                    <button onClick={() => handleSelectGame(game)}>Join</button>
                  )}
                  <button onClick={() => navigate(`/game/${game.id}`)}>View</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;
