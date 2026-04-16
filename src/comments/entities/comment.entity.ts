
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';



@Entity()
export class Comment {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => User, user => user.comments,{
        eager: true
    })
    author!: User;

    @ManyToOne(()=> Post, (post)=> post.comments,{
        onDelete: 'CASCADE'
    })
    post!: Post;
}
