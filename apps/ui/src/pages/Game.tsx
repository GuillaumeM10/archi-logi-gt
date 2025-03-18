import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import gameService from '../services/gameService';
// import { Status, Cards, GameState } from '@archi-logi-gt/dtos/gameClient';
import './Game.css';

enum Cards {
  MNUS_2 = "MNUS_2",
  MNUS_1 = "MNUS_1",
  ZERO = "ZERO",
  ONE = "ONE",
  TWO = "TWO",
  THREE = "THREE",
  FOUR = "FOUR",
  FIVE = "FIVE",
  SIX = "SIX",
  SEVEN = "SEVEN",
  EIGHT = "EIGHT",
  NINE = "NINE",
  TEN = "TEN",
  ELEVEN = "ELEVEN",
  TWELVE = "TWELVE",
}

const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  // const [game, setGame] = useState<GameState | null>(null);
  const [game, setGame] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  // const [discardCard, setDiscardCard] = useState<Cards | null>(null);
  const [discardCard, setDiscardCard] = useState<any | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  const loadGameData = async () => {
    try {
      if (!id) return;
      const gameData = await gameService.getGame(id);
      setGame(gameData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGameData();

    const interval = window.setInterval(loadGameData, 3000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [id]);

  const currentPlayerCards = game?.playerCards.find(p => p.playerId === user?.id)?.cards || [];

  const isMyTurn = game?.currentPlayerId === user?.id;

  const handleDraw = async () => {
    if (!id || !isMyTurn) return;

    try {
      setLoading(true);
      const updatedGame = await gameService.takeAction({
        gameId: id,
        action: 'draw',
      });

      setGame(updatedGame);
      setDiscardCard(updatedGame.discardPile[updatedGame.discardPile.length - 1]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to draw card');
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async (position: number) => {
    if (!id || !isMyTurn) return;

    try {
      setLoading(true);
      const updatedGame = await gameService.takeAction({
        gameId: id,
        action: 'reveal',
        cardPosition: position,
      });

      setGame(updatedGame);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reveal card');
    } finally {
      setLoading(false);
      setSelectedCard(null);
    }
  };

  const handleReplace = async (position: number) => {
    if (!id || !isMyTurn || discardCard === null) return;

    try {
      setLoading(true);
      const updatedGame = await gameService.takeAction({
        gameId: id,
        action: 'replace',
        cardPosition: position,
        targetPosition: position,
      });

      setGame(updatedGame);
      setDiscardCard(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to replace card');
    } finally {
      setLoading(false);
      setSelectedCard(null);
    }
  };

  const handleCardSelect = (position: number) => {
    if (!isMyTurn) return;

    const card = currentPlayerCards.find(c => c.position === position);
    if (!card) return;

    if (!card.revealed) {
      handleReveal(position);
    } else if (discardCard) {
      handleReplace(position);
    } else {
      setSelectedCard(position === selectedCard ? null : position);
    }
  };

  const handleGameStatusToggle = async () => {
    if (!id || !game || user?.id !== game.ownerId) return;

    try {
      setLoading(true);
      let updatedGame;

      if (game.status === "PLAYING") {
        // if (game.status === Status.PLAYING) {
        updatedGame = await gameService.pauseGame(id);
      // } else if (game.status === Status.PAUSED) {
      } else if (game.status === "PAUSED") {
        updatedGame = await gameService.resumeGame(id);
      }

      if (updatedGame) {
        setGame(updatedGame);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update game status');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLobby = () => {
    navigate('/');
  };

  const getCardValue = (card: Cards | null) => {
    if (!card) return null;

    switch(card) {
      case Cards.MNUS_2: return -2;
      case Cards.MNUS_1: return -1;
      case Cards.ZERO: return 0;
      case Cards.ONE: return 1;
      case Cards.TWO: return 2;
      case Cards.THREE: return 3;
      case Cards.FOUR: return 4;
      case Cards.FIVE: return 5;
      case Cards.SIX: return 6;
      case Cards.SEVEN: return 7;
      case Cards.EIGHT: return 8;
      case Cards.NINE: return 9;
      case Cards.TEN: return 10;
      case Cards.ELEVEN: return 11;
      case Cards.TWELVE: return 12;
      default: return null;}
  };

  const getCardColorClass = (card: any | null) => {
    // const getCardColorClass = (card: Cards | null) => {
    if (!card) return 'card-unknown';

    const value = getCardValue(card);
    if (value === null) return 'card-unknown';

    if (value < 0) return 'card-negative';
    if (value === 0) return 'card-zero';
    if (value <= 4) return 'card-low';
    if (value <= 8) return 'card-medium';
    return 'card-high';
  };

  // Fix player mapping in getPlayerName function
  const getPlayerName = (playerId: number) => {
    const player = game?.__players__?.find(p => p.id === playerId);
    if (!player) return 'Unknown Player';
    return player.id === user?.id ? 'You' : player.email;
  };

  if (loading && !game) {
    return <div className="loading">Loading game...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={handleBackToLobby}>Back to Lobby</button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="error-container">
        <div className="error">Game not found</div>
        <button onClick={handleBackToLobby}>Back to Lobby</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>{game.title}</h1>
        <div className="game-info">
          <span>Game #{game.id}</span>
          <span className={`game-status ${game.status.toLowerCase()}`}>
            Status: {game.status}
          </span>
          {user?.id === game.ownerId && (
            <button
              onClick={handleGameStatusToggle}
              disabled={game.status === "FINISHED"}
              className="status-toggle-btn"
            >
              {game.status === "PLAYING" ? 'Pause Game' : 'Resume Game'}
            </button>
          )}
          <button onClick={handleBackToLobby} className="back-btn">
            Back to Lobby
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {game.isGameOver ? (
        <div className="game-over">
          <h2>Game Over!</h2>
          {game.scores && (
            <div className="scores-container">
              <h3>Final Scores</h3>
              <ul className="scores-list">
                {game.scores.map((score) => (
                  <li key={score.playerId} className={score.playerId === game.winnerId ? 'winner' : ''}>
                    <span className="player-name">{getPlayerName(score.playerId)}</span>
                    <span className="score">{score.score} points</span>
                    {score.playerId === game.winnerId && <span className="winner-tag">Winner!</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="game-board">
          <div className="players-info">
            <h3>Players</h3>
            <ul>
              {game.__players__.map((player) => (
                <li
                  key={player.id}
                  className={`player ${player.id === game.currentPlayerId ? 'current-turn' : ''} ${player.id === user?.id ? 'you' : ''}`}
                >
                  <span>{player.id === user?.id ? 'You' : player.email}</span>
                  {player.id === game.currentPlayerId && <span className="turn-indicator">Playing</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="game-play-area">
            <div className="card-piles">
              <div className="deck">
                <h4>Draw Deck</h4>
                <div className="deck-cards">
                  {game.deck.length > 0 ? (
                    <div className="card card-back">
                      <span>{game.deck.length}</span>
                    </div>
                  ) : (
                    <div className="card empty-deck">Empty</div>
                  )}
                </div>
                {/* {isMyTurn && game.status === Status.PLAYING && ( */}
                {isMyTurn && game.status === "PLAYING" && (
                  <button onClick={handleDraw} disabled={!!discardCard || game.deck.length === 0}>
                    Draw Card
                  </button>
                )}
              </div>

              <div className="discard-pile">
                <h4>Discard Pile</h4>
                <div className="discard-cards">
                  {game.discardPile.length > 0 ? (
                    <div className={`card ${getCardColorClass(game.discardPile[game.discardPile.length - 1])}`}>
                      <span>{getCardValue(game.discardPile[game.discardPile.length - 1])}</span>
                    </div>
                  ) : (
                    <div className="card empty-discard">Empty</div>
                  )}
                </div>
              </div>
            </div>

            <div className="your-cards-section">
              <h3>Your Cards</h3>
              {isMyTurn && discardCard && (
                <div className="action-prompt">
                  Select a card to replace with the drawn card
                </div>
              )}
              <div className="cards-grid">
                {currentPlayerCards.sort((a, b) => a.position - b.position).map((card) => (
                  <div
                    key={card.position}
                    className={`card-slot ${card.revealed ? getCardColorClass(card.card) : 'card-back'} ${selectedCard === card.position ? 'selected' : ''}`}
                    onClick={() => handleCardSelect(card.position)}
                  >
                    {card.revealed ? (
                      <span className="card-value">
                        {card.card ? getCardValue(card.card) : '?'}
                      </span>
                    ) : (
                      <span className="card-back-text">?</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="opponent-cards-section">
            <h3>Opponents' Cards</h3>
            <div className="opponents-grid">
              {game.playerCards
                .filter(p => p.playerId !== user?.id)
                .map(playerCards => (
                  <div key={playerCards.playerId} className="opponent-cards">
                    <h4>{getPlayerName(playerCards.playerId)}'s Cards</h4>
                    <div className="cards-grid opponent">
                      {playerCards.cards.sort((a, b) => a.position - b.position).map(card => (
                        <div
                          key={card.position}
                          className={`card-slot ${card.revealed ? getCardColorClass(card.card) : 'card-back'} opponent-card`}
                        >
                          {card.revealed ? (
                            <span className="card-value">{getCardValue(card.card)}</span>
                          ) : (
                            <span className="card-back-text">?</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="game-instructions">
        <h3>How to Play</h3>
        <ul>
          <li>On your turn, draw a card from the deck or reveal one of your face-down cards</li>
          <li>If you draw a card, you can replace one of your revealed cards with it or discard it</li>
          <li>The goal is to have the lowest total value when all your cards are revealed</li>
          <li>Negative values are good, high values are bad</li>
        </ul>
      </div>
    </div>
  );
};

export default GamePage;
