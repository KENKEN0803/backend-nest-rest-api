import { FileInterceptor } from '@nestjs/platform-express';
import { EditBoardInput, EditBoardOutput } from './dto/edit-board.dto';
import { DeleteBoardOutput } from './dto/delete-board.dto';
import { User } from './../users/entity/user.entity';
import { AuthUser } from 'src/libs/auth/auth-user.decorator';
import { WriteBoardInput, WriteBoardOutput } from './dto/write-board.dto';
import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Request } from 'express';
import { boardOptions } from '../common/utils/multer.options';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardService: BoardsService) {}

  @Get('/')
  async getBoard() {
    return this.boardService.getBoards();
  }

  @Get(':id')
  async getSeeBoard(@Req() request: Request) {
    return this.boardService.getSeeBoard(request);
  }

  @Post('/write')
  @UseInterceptors(FileInterceptor('image', boardOptions))
  async postWriteBoard(
    @Body() writeBoardInput: WriteBoardInput,
    @AuthUser() authUser: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<WriteBoardOutput> {
    return this.boardService.postWriteBoard(writeBoardInput, authUser.id, file);
  }

  @Put('/edit')
  @UseInterceptors(FileInterceptor('image', boardOptions))
  async editBoard(
    @AuthUser() authUser: User,
    @Body() editBoardInput: EditBoardInput,
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<EditBoardOutput> {
    return this.boardService.putEditBoard(
      editBoardInput,
      authUser.id,
      request,
      file,
    );
  }

  @Delete('/delete')
  async deleteBoard(
    @AuthUser() authUser: User,
    @Req() request: Request,
  ): Promise<DeleteBoardOutput> {
    return this.boardService.deleteBoard(authUser.id, request);
  }
}
