import { Module } from '@nestjs/common';
import { GameCommand } from './commands/game.command';
import { GameService } from '../../application/services/game.service';

@Module({
    providers: [GameCommand, GameService],
    exports: [GameCommand],
})
export class CliModule {}
