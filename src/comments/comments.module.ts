import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
@Module({
   imports: [
    TypeOrmModule.forFeature([Comment, Post]) // ← IMPORTANTE
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
