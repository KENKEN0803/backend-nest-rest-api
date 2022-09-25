import { User } from './../users/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/boards/entity/board.entity';
import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board,User])],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService]
})
export class BoardsModule {}
