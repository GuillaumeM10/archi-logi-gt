import { Injectable } from '@nestjs/common';
import { GameService } from '../../../application/services/game.service';

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
}
