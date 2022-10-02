import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { Board } from 'src/boards/entity/board.entity';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersModule } from './users/users.module';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entity/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { MulterModule } from '@nestjs/platform-express';
import { ShopsModule } from './shops/shops.module';
import { Item } from './shops/entities/item.entity';
import { Order } from './shops/entities/order.entity';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        SERVER_ADDRESS: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        JWT_PRIVATE_KEY: Joi.string().required(),
        JWT_EXPIRES_SEC: Joi.string().required(),
        SHOP_PID_CODE: Joi.string().required(),
        SHOP_API_KEY: Joi.string().required(),
        SHOP_API_SECRET: Joi.string().required(),
        GOOGLE_MAIL: Joi.string().required(),
        GOOGLE_PASSWORD: Joi.string().required(),
        NAVER_CLIENT_ID: Joi.string().required(),
        NAVER_CLIENT_SECRET: Joi.string().required(),
        NAVER_CALLBACK_URL: Joi.string().required(),
        RANDOM_STATE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: false,
      entities: [User, Board, Item, Order],
    }),

    JwtModule.forRoot({
      jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
      jwtExpiresSec: process.env.JWT_EXPIRES_SEC,
      refreshExpiresSec: process.env.REFRESH_EXPIRES_SEC,
    }),
    MulterModule.register({
      dest: './files',
    }),
    LoggerModule.forRoot(),
    UsersModule,
    BoardsModule,
    ShopsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .exclude(
        { path: '/users/emailCheck', method: RequestMethod.POST },
        { path: '/users/certifications', method: RequestMethod.POST },
        { path: '/users/naverCallback', method: RequestMethod.GET },
        { path: '/users/kakaoCallback', method: RequestMethod.GET },
      )
      .forRoutes({
        path: '/users/*',
        method: RequestMethod.ALL,
      });
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/boards/*',
      method: RequestMethod.ALL,
    });
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/shops/*',
      method: RequestMethod.ALL,
    });
  }
}
