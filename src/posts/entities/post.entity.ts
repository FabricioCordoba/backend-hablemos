import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 1000 })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

@ManyToOne(() => User, (user) => user.posts)
author!: User;
}