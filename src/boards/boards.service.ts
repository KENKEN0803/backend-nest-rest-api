import { DeleteBoardOutput } from './dto/delete-board.dto';
import { EditBoardInput, EditBoardOutput } from './dto/edit-board.dto';
import { User } from './../users/entity/user.entity';
import { Board } from './entity/board.entity';
import { WriteBoardInput, WriteBoardOutput } from './dto/write-board.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private readonly boards: Repository<Board>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async getBoards() {
    try {
      const boards = await this.boards.find();
      return boards;
    } catch (error) {
      console.log(error);
    }
  }

  async getSeeBoard(request: Request) {
    try {
      const {
        params: { id },
      } = request;

      const board = await this.boards.findOne(id);

      if (!board) {
        return {
          ok: false,
          error: 'noExistBoard',
        };
      }
      return board;
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async postWriteBoard(
    { title, content, boardImgName }: WriteBoardInput,
    userId: number,
    file: Express.Multer.File,
  ): Promise<WriteBoardOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return {
          ok: false,
          error: 'noExistUser',
        };
      }

      const newBoard = await this.boards.save(
        this.boards.create({
          title,
          content,
          boardImgName,
          boardImgSize: file.size,
          boardImgPath: file.path,
          owner: user,
          ownerId: user.id,
        }),
      );

      if (!newBoard) {
        return {
          ok: false,
          error: 'notCreateBoard',
        };
      }

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async putEditBoard(
    { title, content, boardImgName }: EditBoardInput,
    userId: number,
    request: Request,
    file: Express.Multer.File,
  ): Promise<EditBoardOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return {
          ok: false,
          error: 'noExistUser',
        };
      }
      const { id } = request.query;
      const board = await this.boards.findOne(id as string);

      if (title) {
        board.title = title;
      }

      if (content) {
        board.content = content;
      }

      if (boardImgName) {
        board.boardImgName = boardImgName;
      }

      if (file) {
        if (file.size) {
          board.boardImgSize = file.size;
        }

        if (file.path) {
          board.boardImgPath = file.path;
        }
      }

      await this.boards.save(board);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async deleteBoard(
    userId: number,
    request: Request,
  ): Promise<DeleteBoardOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return {
          ok: false,
          error: 'noExistUser',
        };
      }

      const { id } = request.query;
      await this.boards.delete(id as string);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
