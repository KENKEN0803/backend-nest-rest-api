import { Order } from '../../shops/entities/order.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { CoreEntity } from 'src/common/entities/core.entity';
import * as bcrypt from 'bcrypt';
import { Item } from '../../shops/entities/item.entity';
import { Board } from 'src/boards/entity/board.entity';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
export enum UserRole {
  Admin = 'Admin',
  User = 'User',
}

@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @OneToMany((type) => Board, (board) => board.owner)
  boards: Board[];

  @OneToMany((type) => Item, (item) => item.owner)
  items: Item[];

  @OneToMany((type) => Order, (order) => order.owner)
  orders: Order[];

  @Column({ default: 'avartar', nullable: true })
  avatar: string;

  @Column({ default: false, nullable: true })
  socialOnly: boolean;

  @Column({ default: '', nullable: true })
  phoneNum: string;

  @Column({ default: '한국', nullable: true })
  region: string;

  @Column({ default: false, nullable: true })
  verified: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: '', nullable: true })
  @IsString()
  refreshToken: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<boolean> {
    if (this.password && !this.refreshToken) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
        return true;
      } catch (error) {
        new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
