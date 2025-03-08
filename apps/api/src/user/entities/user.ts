import {Role} from "@spottobe/dtos/dist/userDTO";
import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  role: Role;

  @Column({ nullable: true })
  @Exclude()
  resetPasswordToken: string;

  @Column({ default: false })
  @Exclude()
  isEmailVerified: boolean;
}
