import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Role } from "@archi-logi-gt/dtos/dist/userDTO";
import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from '../../game/entities/game.entity';

@Entity()
export class User {
  @ApiProperty({ description: 'Unique identifier', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.USER })
  @Column()
  role: Role;

  @ApiHideProperty()
  @Column({ nullable: true })
  @Exclude()
  resetPasswordToken: string;

  @ApiProperty({ description: 'Whether email is verified', example: false })
  @Column({ default: false })
  @Exclude()
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Games created by this user', type: 'array', items: { type: 'object' } })
  @OneToMany(() => Game, game => game.owner, { lazy: true })
  ownedGames: Promise<Game[]>;

  @ApiProperty({ description: 'Games this user is participating in', type: 'array', items: { type: 'object' } })
  @ManyToMany(() => Game, game => game.players, { lazy: true })
  participatingGames: Promise<Game[]>;
}
