import {Injectable} from '@nestjs/common';
import {Game} from '../../domain/entities/game';
import {Player} from '../../domain/entities/player';
import {Card} from "../../domain/entities/card";

@Injectable()
export class GameService {
    private game: Game;

    constructor() {
        this.game = new Game();
    }

    addPlayer(name: string): void {
        this.game.addPlayer(new Player(name));
    }

    startGame(): void {
        this.game.startGame();
    }

    drawCard(fromDiscard: boolean): void {
        this.game.drawCard(fromDiscard);
    }

    playDrawnCard(row: number, col: number): void {
        this.game.playDrawnCard(row, col);
    }

    discardDrawnCard(): void {
        this.game.discardDrawnCard();
    }

    getGameState(): { started: boolean; isCardFromDiscardPile: boolean; discardTop: number; drawnCard: Card | undefined ;
        isGameTerminated: boolean;
    } {
        return this.game.getGameState();
    }

    getCurrentPlayer(): Player {
        return this.game.getCurrentPlayer();
    }

    getPlayersList(): Player[] {
        return this.game.getPlayers();
    }

    revealCard(row: number, col: number): void{
        return this.game.revealCard(row, col);
    }
}
