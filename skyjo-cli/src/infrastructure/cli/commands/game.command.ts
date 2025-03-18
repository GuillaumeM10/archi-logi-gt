import { Injectable } from '@nestjs/common';
import { GameService } from '../../../application/services/game.service';
import {Card} from "../../../domain/entities/card";
import {Player} from "../../../domain/entities/player";

@Injectable()
export class GameCommand {
    constructor(private readonly gameService: GameService) {}

    addPlayer(playerName: string): void {
        this.gameService.addPlayer(playerName);
    }

    startGame(): void {
        this.gameService.startGame();
    }

    drawCard(fromDiscard: boolean): void {
        this.gameService.drawCard(fromDiscard);
    }

    playDrawnCard(row: number, col: number): void {
        this.gameService.playDrawnCard(row, col);
    }

    getGameState(): { started: boolean; isCardFromDiscardPile: boolean; discardTop: number; drawnCard: Card | undefined ;
        isGameTerminated: boolean;
    } {
        return this.gameService.getGameState();
    }

    getCurrentPlayer(): Player {
        return this.gameService.getCurrentPlayer();
    }

    getPlayersList(): Player[] {
        return this.gameService.getPlayersList();
    }

    discardDrawnCard(): void {
        this.gameService.discardDrawnCard();
    }

    revealCard(row: number, col: number): void{
        return this.gameService.revealCard(row, col);
    }
}
