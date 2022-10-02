import { EditShopInput, EditShopOutput } from './dto/edit-shop.dto';
import { DeleteShopOutput } from './dto/delete-shop.dto';
import { SuccessShopInput, SuccessShopOutput } from './dto/success-shop.dto';
import { CreateShopInput, CreateShopOutput } from './dto/create-shop.dto';
import { User } from './../users/entity/user.entity';
import { ShopsService } from './shops.service';
import {
  Controller,
  Get,
  Req,
  Post,
  UseInterceptors,
  Body,
  UploadedFile,
  Delete,
  Put,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../libs/auth/auth-user.decorator';
import { itemOptions } from '../common/utils/multer.options';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from 'src/libs/auth/role.decorator';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopService: ShopsService) {}

  @Get('/')
  async getShopItem() {
    return this.shopService.getShopItem();
  }

  @Get(':id')
  async getSeeShopItem(@Req() request: Request) {
    return this.shopService.getSeeShopItem(request);
  }
  
  @Post('/success')
  async postShopSuccess(
    @Body() successShopInput: SuccessShopInput,
    @AuthUser() authUser: User,
  ): Promise<SuccessShopOutput> {
    return this.shopService.postSuccessShop(successShopInput, authUser.id);
  }

  @Post('/create')
  @Role(['Admin'])
  @UseInterceptors(FileInterceptor('image', itemOptions))
  async postCreateShopItem(
    @Body() createShopInput: CreateShopInput,
    @AuthUser() authUser: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CreateShopOutput> {
    return this.shopService.postCreateShopItem(
      createShopInput,
      authUser.id,
      file,
    );
  }

  @Put('/edit')
  @Role(['Admin'])
  @UseInterceptors(FileInterceptor('image', itemOptions))
  async editBoard(
    @AuthUser() authUser: User,
    @Body() editBoardInput: EditShopInput,
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<EditShopOutput> {
    return this.shopService.editShop(
      editBoardInput,
      authUser.id,
      request,
      file,
    );
  }

  @Delete('/delete')
  @Role(['Admin'])
  async deleteShop(
    @AuthUser() authUser: User,
    @Req() request: Request,
  ): Promise<DeleteShopOutput> {
    return this.shopService.deleteShop(authUser.id, request);
  }
}
