import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

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

@OneToMany(() => Comment, (comment) => comment.post)
comments!: Comment[];
}