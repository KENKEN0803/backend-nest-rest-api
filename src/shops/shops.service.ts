import { DeleteBoardOutput } from './../boards/dto/delete-board.dto';
import { EditShopInput, EditShopOutput } from './dto/edit-shop.dto';
import { SuccessShopInput, SuccessShopOutput } from './dto/success-shop.dto';
import { Item } from './entities/item.entity';
import { User } from './../users/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { CreateShopInput, CreateShopOutput } from './dto/create-shop.dto';
import { Order } from './entities/order.entity';
import fetch from 'node-fetch';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Item) private readonly items: Repository<Item>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}
  async getShopItem() {
    try {
      const items = await this.items.find();
      return items;
    } catch (error) {
      console.log(error);
    }
  }

  async getSeeShopItem(request: Request) {
    try {
      const {
        params: { id },
      } = request;

      const item = await this.items.findOne(id);

      if (!item) {
        return {
          ok: false,
          error: 'noExistItem',
        };
      }

      return item;
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async postCreateShopItem(
    { name, amount, itemImgName, content }: CreateShopInput,
    userId: number,
    file: Express.Multer.File,
  ): Promise<CreateShopOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return {
          ok: false,
          error: 'noExistUser',
        };
      }

      const newItem = await this.items.save(
        this.items.create({
          name,
          amount: parseInt(amount),
          content,
          itemImgName,
          itemImgSize: file.size,
          itemImgPath: file.path,
          owner: user,
          ownerId: user.id,
        }),
      );

      if (!newItem) {
        return {
          ok: false,
          error: 'notCreateItem',
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

  async postSuccessShop(
    { imp_uid, merchant_uid, id }: SuccessShopInput,
    userId: number,
  ): Promise<SuccessShopOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return {
          ok: false,
          error: 'noExistUser',
        };
      }

      const item = await this.items.findOne(id);
      const getToken = await (
        await fetch('https://api.iamport.kr/users/getToken', {
          method: 'POST', // POST method
          headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
          body: JSON.stringify({
            imp_key: process.env.SHOP_API_KEY, // REST API키
            imp_secret: process.env.SHOP_API_SECRET, // REST API Secret
          }),
        })
      ).json();

      const { access_token } = getToken.response; // 인증 토큰

      const getPaymentData = await (
        await fetch(`https://api.iamport.kr/payments/${imp_uid}`, {
          // imp_uid 전달
          method: 'GET', // GET method
          headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
        })
      ).json();

      const paymentData = getPaymentData.response; // 조회한 결제 정보

      const newOrder = await this.orders.save(
        this.orders.create({
          merchantUid: merchant_uid,
          amount: item.amount,
          cancelAmount: item.amount,
          payMethod: paymentData.pay_method,
          status: paymentData.status,
          owner: user,
          ownerId: user.id,
          items: [item],
        }),
      );
      const amountToBePaid = newOrder.amount; // 결제 되어야 하는 금액
      // 결제 검증하기
      const { amount, status } = paymentData;

      if (amount === amountToBePaid) {
        await this.orders.update(
          { merchantUid: newOrder.merchantUid },
          {
            merchantUid: paymentData.merchant_uid,
            amount: paymentData.amount,
            cancelAmount: paymentData.amount,
          },
        );

        switch (status) {
          case 'ready': // 가상계좌 발급
            const { vbank_num, vbank_date, vbank_name } = paymentData;
            return {
              ok: true,
              status: 'vbankIssued',
              message: '가상계좌 발급 성공',
              vbank_num,
              vbank_date,
              vbank_name,
            };
          case 'paid': // 결제 완료
            return { ok: true, status: 'success', message: '일반 결제 성공' };
        }
      } else {
        // 결제 금액 불일치. 위/변조 된 결제
        return { ok: false, status: 'forgery', message: '위조된 결제시도' };
      }
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error,
      };
    }
  }

  async editShop(
    { name, amount, content, itemImgName }: EditShopInput,
    userId: number,
    request: Request,
    file: Express.Multer.File,
  ): Promise<EditShopOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return {
          ok: false,
          error: 'noExistUser',
        };
      }

      const { id } = request.query;
      const item = await this.items.findOne(id as string);

      if (name) {
        item.name = name;
      }

      if (amount) {
        item.amount = parseInt(amount as string);
      }

      if (content) {
        item.content = content;
      }

      if (itemImgName) {
        item.itemImgName = itemImgName;
      }

      if (file) {
        if (file.size) {
          item.itemImgSize = file.size;
        }

        if (file.path) {
          item.itemImgPath = file.path;
        }
      }
      await this.items.save(item);

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

  async deleteShop(
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
      await this.items.delete(id as string);
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
