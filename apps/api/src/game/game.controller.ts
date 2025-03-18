import { Game } from './entities/game.entity';

import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { GameService } from './game.service';
import { CreateGameDto, JoinGameDto, PlayerActionDto, UpdateGameDto } from '@archi-logi-gt/dtos/dist/gameDto';

@ApiTags('game')
@ApiBearerAuth()
@Controller('game')
@UseInterceptors(ClassSerializerInterceptor)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 201, description: 'Game successfully created', type: Game })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @Post()
  create(@Body() createGameDto: CreateGameDto, @Req() req: Request) {
    return this.gameService.create(createGameDto, req['user'].id);
  }

  @ApiOperation({ summary: 'Get all games for current user' })
  @ApiResponse({ status: 200, description: 'List of games', type: [Game] })
  @Get()
  findAll(@Req() req: Request) {
    return this.gameService.findAll(req['user'].id);
  }

  @ApiOperation({ summary: 'Get a specific game by ID' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({
    status: 200,
    description: 'Game details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        password: { type: 'string' },
        ownerId: { type: 'number' },
        status: { type: 'string', enum: ['PLAYING', 'PAUSED', 'FINISHED'] },
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameService.findOne(+id);
  }

  @ApiOperation({ summary: 'Join an existing game' })
  @ApiResponse({ status: 200, description: 'Successfully joined the game', type: Game })
  @ApiResponse({ status: 400, description: 'Cannot join the game' })
  @Post('join')
  joinGame(@Body() joinGameDto: JoinGameDto, @Req() req: Request) {
    return this.gameService.joinGame(+joinGameDto.gameId, joinGameDto.password, req['user'].id);
  }

  @ApiOperation({ summary: 'Take a game action (draw, reveal, replace, discard)' })
  @ApiResponse({ status: 200, description: 'Action performed successfully', type: Game })
  @ApiResponse({ status: 400, description: 'Invalid action or not your turn' })
  @Post('action')
  takeAction(@Body() actionDto: PlayerActionDto, @Req() req: Request) {
    return this.gameService.takeAction(
      +actionDto.gameId,
      req['user'].id,
      actionDto.action,
      actionDto.cardPosition,
      actionDto.targetPosition
    );
  }

  @ApiOperation({ summary: 'Pause a game' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Game paused', type: Game })
  @Post(':id/pause')
  pauseGame(@Param('id') id: string) {
    return this.gameService.pauseGame(+id);
  }

  @ApiOperation({ summary: 'Resume a paused game' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Game resumed', type: Game })
  @Post(':id/resume')
  resumeGame(@Param('id') id: string) {
    return this.gameService.resumeGame(+id);
  }

  @ApiOperation({ summary: 'Update a game' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Game updated', type: Game })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gameService.update(+id, updateGameDto);
  }

  @ApiOperation({ summary: 'Delete a game' })
  @ApiParam({ name: 'id', description: 'Game ID' })
  @ApiResponse({ status: 200, description: 'Game deleted' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameService.remove(+id);
  }
}
