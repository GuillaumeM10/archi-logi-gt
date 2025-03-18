import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameDto, Status, Cards, CardDetails, UpdateGameDto } from '@archi-logi-gt/dtos/dist/gameDto';
import { Game } from './entities/game.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    private readonly userService: UserService,
  ) {}

  async create(createGameDto: CreateGameDto, userId: number): Promise<Game> {
    const owner = await this.userService.findById(userId);

    const game = this.gameRepository.create({
      title: createGameDto.title,
      password: createGameDto.password,
      ownerId: owner.id,
      status: Status.PLAYING,
      deck: this.shuffleDeck(this.createFullDeck()),
      discardPile: [],
      playerCards: [{
        playerId: owner.id,
        cards: this.dealInitialCards(),
      }],
      currentPlayerId: owner.id,
    });

    const savedGame = await this.gameRepository.save(game);

    const players = [owner];
    savedGame.owner = Promise.resolve(owner);
    savedGame.players = Promise.resolve(players);

    return this.gameRepository.save(savedGame);
  }

  private createFullDeck(): Cards[] {
    const deck: Cards[] = [];

    Object.entries(CardDetails).forEach(([cardName, details]) => {
      for (let i = 0; i < details.quantity; i++) {
        deck.push(cardName as Cards);
      }
    });

    return deck;
  }

  private shuffleDeck(deck: Cards[]): Cards[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  private dealInitialCards() {
    const cards = [];
    for (let i = 0; i < 12; i++) {
      cards.push({
        card: null,
        revealed: false,
        position: i,
      });
    }

    cards[0].revealed = true;
    cards[1].revealed = true;

    return cards;
  }

  async findAll(userId: number): Promise<Game[]> {
    return this.gameRepository.find({
      where: [
        { owner: { id: userId } },
        { players: { id: userId } }
      ],
      relations: ['owner', 'players'],
    });
  }

  async findOne(id: number): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id }
    });

    if (!game) {
      throw new NotFoundException(`Game #${id} not found`);
    }

    const owner = await game.owner;
    const players = await game.players;

    return game;
  }

  async joinGame(gameId: number, password: string, userId: number): Promise<Game> {
    const game = await this.findOne(gameId);

    if (game.status !== Status.PLAYING) {
      throw new BadRequestException('Cannot join a game that is not in playing status');
    }

    if (game.password !== password) {
      throw new BadRequestException('Incorrect password');
    }

    const players = await game.players;

    const isPlayerInGame = players.some(player => player.id === userId);
    if (isPlayerInGame) {
      return game;
    }

    const player = await this.userService.findById(userId);
    players.push(player);

    game.players = Promise.resolve(players);

    game.playerCards.push({
      playerId: player.id,
      cards: this.dealInitialCards(),
    });

    return this.gameRepository.save(game);
  }

  async takeAction(gameId: number, userId: number, action: string, cardPosition?: number, targetPosition?: number): Promise<Game> {
    const game = await this.findOne(gameId);

    if (game.currentPlayerId !== userId) {
      throw new BadRequestException('It is not your turn');
    }

    if (game.status !== Status.PLAYING) {
      throw new BadRequestException('Game is not active');
    }

    const playerIndex = game.playerCards.findIndex(p => p.playerId === userId);
    if (playerIndex === -1) {
      throw new BadRequestException('Player is not part of the game');
    }

    switch (action) {
      case 'draw':
        return this.drawCard(game, playerIndex);

      case 'reveal':
        if (cardPosition === undefined) {
          throw new BadRequestException('Card position is required');
        }
        return this.revealCard(game, playerIndex, cardPosition);

      case 'replace':
        if (cardPosition === undefined || targetPosition === undefined) {
          throw new BadRequestException('Card and target positions are required');
        }
        return this.replaceCard(game, playerIndex, cardPosition, targetPosition);

      default:
        throw new BadRequestException('Invalid action');
    }
  }

  private async drawCard(game: Game, playerIndex: number): Promise<Game> {
    if (game.deck.length === 0) {
      if (game.discardPile.length === 0) {
        throw new BadRequestException('No cards left to draw');
      }
      game.deck = this.shuffleDeck([...game.discardPile]);
      game.discardPile = [];
    }

    const drawnCard = game.deck.pop();
    game.discardPile.push(drawnCard);

    await this.moveToNextPlayer(game);

    return this.gameRepository.save(game);
  }

  private async revealCard(game: Game, playerIndex: number, cardPosition: number): Promise<Game> {
    const playerCards = game.playerCards[playerIndex].cards;

    if (cardPosition < 0 || cardPosition >= playerCards.length) {
      throw new BadRequestException('Invalid card position');
    }

    if (playerCards[cardPosition].revealed) {
      throw new BadRequestException('Card is already revealed');
    }

    if (playerCards[cardPosition].card === null && game.deck.length > 0) {
      playerCards[cardPosition].card = game.deck.pop();
    }

    playerCards[cardPosition].revealed = true;

    if (playerCards.every(card => card.revealed)) {
      this.endRound(game);
    } else {
      await this.moveToNextPlayer(game);
    }

    return this.gameRepository.save(game);
  }

  private async replaceCard(game: Game, playerIndex: number, cardPosition: number, targetPosition: number): Promise<Game> {
    const playerCards = game.playerCards[playerIndex].cards;

    if (cardPosition < 0 || cardPosition >= playerCards.length) {
      throw new BadRequestException('Invalid card position');
    }

    if (!game.discardPile.length) {
      throw new BadRequestException('No card in discard pile to replace with');
    }

    const replacementCard = game.discardPile.pop();

    const oldCard = playerCards[targetPosition].card;
    playerCards[targetPosition].card = replacementCard;
    playerCards[targetPosition].revealed = true;

    if (oldCard) {
      game.discardPile.push(oldCard);
    }

    if (playerCards.every(card => card.revealed)) {
      this.endRound(game);
    } else {
      await this.moveToNextPlayer(game);
    }

    return this.gameRepository.save(game);
  }

  private async moveToNextPlayer(game: Game): Promise<void> {
    const players = await game.players;
    const currentPlayerIndex = players.findIndex(player => player.id === game.currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    game.currentPlayerId = players[nextPlayerIndex].id;
  }

  private endRound(game: Game): void {
    const scores = game.playerCards.map(playerCard => {
      const score = playerCard.cards.reduce((total, card) => {
        if (card.revealed && card.card) {
          return total + CardDetails[card.card].value;
        }
        return total;
      }, 0);

      return {
        playerId: playerCard.playerId,
        score,
      };
    });

    game.scores = scores;

    const winner = scores.reduce((prev, current) =>
      (prev.score < current.score) ? prev : current
    );

    game.winnerId = winner.playerId;
    game.status = Status.FINISHED;
    game.isGameOver = true;
  }

  async update(id: number, updateGameDto: UpdateGameDto): Promise<Game> {
    const game = await this.findOne(id);

    if (updateGameDto.status) {
      game.status = updateGameDto.status;
    }

    if (updateGameDto.playerIds) {
      const newPlayers = await Promise.all(
        updateGameDto.playerIds.map(id => this.userService.findById(id))
      );

      const players = await game.players;

      for (const player of newPlayers) {
        const isAlreadyInGame = players.some(p => p.id === player.id);
        if (!isAlreadyInGame) {
          players.push(player);

          game.playerCards.push({
            playerId: player.id,
            cards: this.dealInitialCards(),
          });
        }
      }

      game.players = Promise.resolve(players);
    }

    return this.gameRepository.save(game);
  }

  async remove(id: number): Promise<Game> {
    const game = await this.findOne(id);
    return this.gameRepository.remove(game);
  }

  async pauseGame(id: number): Promise<Game> {
    const game = await this.findOne(id);
    game.status = Status.PAUSED;
    return this.gameRepository.save(game);
  }

  async resumeGame(id: number): Promise<Game> {
    const game = await this.findOne(id);
    game.status = Status.PLAYING;
    return this.gameRepository.save(game);
  }
}
