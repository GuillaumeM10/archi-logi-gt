import { ApiProperty } from '@nestjs/swagger';
import { Status, Cards } from '@archi-logi-gt/dtos/dist/gameDto';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user';

@Entity()
export class Game {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Game title', example: 'Skyjo Fun Game' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Password to join the game', example: 'gamepass' })
  @Column()
  password: string;

  @ApiProperty({ description: 'Owner ID', example: 1 })
  @Column()
  ownerId: number;

  @ApiProperty({
    description: 'Game creator',
    type: 'object',
    additionalProperties: false // Add this property
  })
  @ManyToOne(() => User, user => user.ownedGames, { lazy: true })
  owner: Promise<User>;

  @ApiProperty({
    description: 'Players in this game',
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: false // Add this property
    }
  })
  @ManyToMany(() => User, user => user.participatingGames, { lazy: true })
  @JoinTable()
  players: Promise<User[]>;

  @ApiProperty({ description: 'Current game status', enum: Status, example: Status.PLAYING })
  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PLAYING,
  })
  status: Status;

  @ApiProperty({ description: 'Cards in the deck', type: [String] })
  @Column('simple-json')
  deck: Cards[];

  @ApiProperty({ description: 'Cards in the discard pile', type: [String] })
  @Column('simple-json', { nullable: true })
  discardPile: Cards[];

  @ApiProperty({
    description: 'Player cards information',
    example: [
      {
        playerId: 1,
        cards: [
          { card: 'SEVEN', revealed: true, position: 0 },
          { card: 'THREE', revealed: false, position: 1 }
        ]
      }
    ]
  })
  @Column('simple-json')
  playerCards: {
    playerId: number;
    cards: {
      card: Cards;
      revealed: boolean;
      position: number;
    }[];
  }[];

  @ApiProperty({ description: 'ID of the player whose turn it is', example: 1 })
  @Column({ nullable: true })
  currentPlayerId: number;

  @ApiProperty({ description: 'Whether the game is over', example: false })
  @Column({ default: false })
  isGameOver: boolean;

  @ApiProperty({
    description: 'Player scores',
    example: [
      { playerId: 1, score: 25 },
      { playerId: 2, score: 18 }
    ]
  })
  @Column('simple-json', { nullable: true })
  scores: {
    playerId: number;
    score: number;
  }[];

  @ApiProperty({ description: 'ID of the winning player', example: 2 })
  @Column({ nullable: true })
  winnerId: number;
}
