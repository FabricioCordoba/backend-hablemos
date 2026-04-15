import { Post } from '../../posts/entities/post.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    pseudonym!: string;

    @Column({ default: 'avatar_1' })
    avatar!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role!: UserRole;


    @OneToMany(() => Post, (post) => post.author)
    posts!: Post[];
}