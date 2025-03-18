import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { CreateUserDto } from "./userDTO";

export enum Status {
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  FINISHED = "FINISHED",
}

export type CardDetail = {
  name: string;
  value: number;
  quantity: number;
};

export const CardDetails: Record<string, CardDetail> = {
  MNUS_2: {
    name: "MNUS_2",
    value: -2,
    quantity: 5,
  },
  MNUS_1: {
    name: "MNUS_1",
    value: -1,
    quantity: 10,
  },
  ZERO: {
    name: "ZERO",
    value: 0,
    quantity: 15,
  },
  ONE: {
    name: "ONE",
    value: 1,
    quantity: 10,
  },
  TWO: {
    name: "TWO",
    value: 2,
    quantity: 10,
  },
  THREE: {
    name: "THREE",
    value: 3,
    quantity: 10,
  },
  FOUR: {
    name: "FOUR",
    value: 4,
    quantity: 10,
  },
  FIVE: {
    name: "FIVE",
    value: 5,
    quantity: 10,
  },
  SIX: {
    name: "SIX",
    value: 6,
    quantity: 10,
  },
  SEVEN: {
    name: "SEVEN",
    value: 7,
    quantity: 10,
  },
  EIGHT: {
    name: "EIGHT",
    value: 8,
    quantity: 10,
  },
  NINE: {
    name: "NINE",
    value: 9,
    quantity: 10,
  },
  TEN: {
    name: "TEN",
    value: 10,
    quantity: 10,
  },
  ELEVEN: {
    name: "ELEVEN",
    value: 11,
    quantity: 10,
  },
  TWELVE: {
    name: "TWELVE",
    value: 12,
    quantity: 10,
  },
};

export enum Cards {
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

export class JoinGameDto {
  @ApiProperty({ description: 'ID of the game to join', example: '1' })
  @IsNotEmpty()
  @IsString()
  gameId: string;

  @ApiProperty({ description: 'Password for the game', example: 'gamepass' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class PlayerActionDto {
  @ApiProperty({ description: 'ID of the game', example: '1' })
  @IsNotEmpty()
  @IsString()
  gameId: string;

  @ApiProperty({
    description: 'Action to perform',
    example: 'draw',
    enum: ['draw', 'reveal', 'replace', 'discard']
  })
  @IsNotEmpty()
  @IsString()
  action: 'draw' | 'reveal' | 'replace' | 'discard';

  @ApiPropertyOptional({
    description: 'Position of the card to interact with',
    example: 3
  })
  @IsOptional()
  @IsNumber()
  cardPosition?: number;

  @ApiPropertyOptional({
    description: 'Position where to place the card',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  targetPosition?: number;
}

export class GameStateDto {
  @ApiProperty({ description: 'ID of the game', example: '1' })
  @IsNotEmpty()
  @IsString()
  gameId: string;
}

// Update CreateGameDTO to use IDs rather than full User objects
export class CreateGameDto {
  @ApiProperty({ description: 'Title of the game', example: 'Fun Game' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Password to join the game', example: 'gamepass' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'IDs of players to invite',
    type: [Number],
    example: [2, 3, 4]
  })
  @IsOptional()
  @IsArray()
  playerIds?: number[];

  @ApiPropertyOptional({
    description: 'Game status',
    enum: Status,
    default: Status.PLAYING,
    example: Status.PLAYING
  })
  @IsEnum(Status)
  status: Status = Status.PLAYING;

  @ApiPropertyOptional({
    description: 'Custom deck for the game',
    type: [String],
    enum: Cards,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Cards, { each: true })
  deck?: Cards[];

  constructor(partial: Partial<CreateGameDto>) {
    Object.assign(this, partial);
    this.status = this.status || Status.PLAYING;
    this.deck = this.deck || [
      Cards.MNUS_2,
      Cards.MNUS_1,
      Cards.ZERO,
      Cards.ONE,
      Cards.TWO,
      Cards.THREE,
      Cards.FOUR,
      Cards.FIVE,
      Cards.SIX,
      Cards.SEVEN,
      Cards.EIGHT,
      Cards.NINE,
      Cards.TEN,
      Cards.ELEVEN,
      Cards.TWELVE,
    ];
  }
}

export class UpdateGameDto extends PartialType(CreateGameDto) {}
