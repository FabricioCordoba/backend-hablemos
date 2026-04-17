import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../src/users/entities/user.entity';
import { Post } from '../src/posts/entities/post.entity';
import { Comment } from '../src/comments/entities/comment.entity';

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let userToken: string;
  let adminToken: string;
  let userId: number;
  let adminId: number;
  let postId: number;
  let commentId: number;

  const testUser = {
    email: 'testuser@example.com',
    password: 'password123',
    pseudonym: 'testuser',
  };

  const testAdmin = {
    email: 'admin@example.com',
    password: 'admin123',
    pseudonym: 'admin',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              app: { port: 3000 },
              database: {
                type: 'sqlite',
                database: ':memory:',
                entities: [User, Post, Comment],
                synchronize: true,
                dropSchema: true,
              },
              jwt: {
                secret: 'test-secret-key',
                expiresIn: '1h',
              },
            }),
          ],
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'sqlite',
            database: ':memory:',
            entities: [User, Post, Comment],
            synchronize: true,
            dropSchema: true,
          }),
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          userToken = res.body.access_token;
        });
    });

    it('should register an admin user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testAdmin)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          adminToken = res.body.access_token;
        });
    });

    it('should login user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          userToken = res.body.access_token;
        });
    });

    it('should get user profile', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.pseudonym).toBe(testUser.pseudonym);
          userId = res.body.id;
        });
    });
  });

  describe('Posts Flow', () => {
    it('should create a post', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'This is a test post for e2e testing',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe('This is a test post for e2e testing');
          expect(res.body.author.id).toBe(userId);
          postId = res.body.id;
        });
    });

    it('should get posts feed', () => {
      return request(app.getHttpServer())
        .get('/posts/feed')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('content');
          expect(res.body[0]).toHaveProperty('author');
        });
    });

    it('should get specific post', () => {
      return request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(postId);
          expect(res.body.content).toBe('This is a test post for e2e testing');
        });
    });
  });

  describe('Comments Flow', () => {
    it('should create a comment on post', () => {
      return request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'This is a test comment',
          postId: postId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.content).toBe('This is a test comment');
          expect(res.body.author.id).toBe(userId);
          commentId = res.body.id;
        });
    });

    it('should get comments by post', () => {
      return request(app.getHttpServer())
        .get(`/comments/post/${postId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].id).toBe(commentId);
          expect(res.body[0].content).toBe('This is a test comment');
          expect(res.body[0].author.pseudonym).toBe(testUser.pseudonym);
        });
    });

    it('should update own comment', () => {
      return request(app.getHttpServer())
        .patch(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Updated test comment',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.content).toBe('Updated test comment');
        });
    });

    it('should not allow updating others comment', async () => {
      // First create another user and comment
      const otherUser = {
        email: 'other@example.com',
        password: 'password123',
        pseudonym: 'otheruser',
      };

      let otherToken: string;
      let otherCommentId: number;

      // Register other user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(otherUser)
        .expect(201)
        .then((res) => {
          otherToken = res.body.access_token;
        });

      // Create comment as other user
      await request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          content: 'Other user comment',
          postId: postId,
        })
        .expect(201)
        .then((res) => {
          otherCommentId = res.body.id;
        });

      // Try to update other user's comment
      return request(app.getHttpServer())
        .patch(`/comments/${otherCommentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Trying to update others comment',
        })
        .expect(403);
    });

    it('should allow admin to update any comment', async () => {
      // Get admin token first
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
        })
        .expect(200)
        .then((res) => {
          adminToken = res.body.access_token;
        });

      return request(app.getHttpServer())
        .patch(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Admin updated comment',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.content).toBe('Admin updated comment');
        });
    });

    it('should delete own comment', () => {
      return request(app.getHttpServer())
        .delete(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Comment deleted successfully');
        });
    });

    it('should not allow deleting others comment', async () => {
      // Create another comment first
      let newCommentId: number;

      await request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Admin comment to test deletion',
          postId: postId,
        })
        .expect(201)
        .then((res) => {
          newCommentId = res.body.id;
        });

      // Try to delete as regular user
      return request(app.getHttpServer())
        .delete(`/comments/${newCommentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should allow admin to delete any comment', () => {
      return request(app.getHttpServer())
        .delete(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404); // Comment already deleted
    });
  });

  describe('Authorization', () => {
    it('should require authentication for protected routes', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          content: 'Unauthorized post attempt',
        })
        .expect(401);
    });

    it('should require authentication for comments', () => {
      return request(app.getHttpServer())
        .post('/comments')
        .send({
          content: 'Unauthorized comment',
          postId: postId,
        })
        .expect(401);
    });
  });
});
