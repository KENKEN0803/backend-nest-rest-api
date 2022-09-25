import { UserService } from './../users/users.service';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { Item } from './entities/item.entity';
import { User } from 'src/users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, User, Order])],
  controllers: [ShopsController],
  providers: [ShopsService, UserService],
  exports: [ShopsService],
})
export class ShopsModule {}
